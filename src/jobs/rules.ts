/**
 * Archetype rules: pure functions that judge the player's work on a task (no UI, no saves).
 * Each archetype also has a `solve` (a witness answer, used by the validator and the simulator)
 * and lists which texts a mistake implicates (for the hidden SRS).
 *
 * Outcomes follow the tea house: perfect, minor (small slip: ±0), fail, bad (harmful: an allergy
 * ignored, a wrong document approved).
 */
import type { Outcome } from '../core/types';
import type {
  CheckSpec,
  JobEvaluation,
  JobIssue,
  JobIssueKind,
  MakeSpec,
  RespondSpec,
  SortSpec,
  TaskAnswer,
  TaskSpec,
  TradeSpec,
} from './types';

const PRIORITY: JobIssueKind[] = [
  'empty', 'forbidden', 'missed', 'wrong_goods', 'missing', 'extra', 'wrong_field', 'false_alarm', 'wrong_bin',
  'wrong_reply', 'wrong_slot', 'wrong_form', 'change_over', 'change_short', 'wrong_method', 'wrong_vessel', 'too_much', 'too_little', 'wrong_fix',
];

function finish(issues: JobIssue[], outcome: Outcome): JobEvaluation {
  const sorted = [...issues].sort((a, b) => PRIORITY.indexOf(a.kind) - PRIORITY.indexOf(b.kind));
  return { outcome: issues.length ? outcome : 'perfect', issues: sorted, primary: sorted[0] ?? null };
}

// ---------------------------------------------------------------------------- make

export function wantRange(w: MakeSpec['want'][number]): [number, number] {
  if (w.n !== undefined) return [w.n, w.n];
  return [w.min ?? 1, w.max ?? Math.max(w.min ?? 1, 9)];
}

export function evaluateMake(spec: MakeSpec, a: Extract<TaskAnswer, { arch: 'make' }>, words: (thing: string) => string[] = (t) => [t]): JobEvaluation {
  const issues: JobIssue[] = [];
  const total = Object.values(a.counts).reduce((s, n) => s + (n > 0 ? n : 0), 0);
  if (total === 0) return finish([{ kind: 'empty', about: [] }], 'fail');
  const wanted = new Map(spec.want.map((w) => [w.thing, w]));
  for (const f of spec.forbid ?? []) if ((a.counts[f] ?? 0) > 0) issues.push({ kind: 'forbidden', thing: f, about: words(f) });
  let offBy = 0;
  for (const w of spec.want) {
    const n = a.counts[w.thing] ?? 0;
    const [lo, hi] = wantRange(w);
    if (n === 0) issues.push({ kind: 'missing', thing: w.thing, about: words(w.thing) });
    else if (n < lo) {
      issues.push({ kind: 'too_little', thing: w.thing, about: words(w.thing) });
      offBy = Math.max(offBy, lo - n);
    } else if (n > hi) {
      issues.push({ kind: 'too_much', thing: w.thing, about: words(w.thing) });
      offBy = Math.max(offBy, n - hi);
    }
  }
  const allow = new Set(spec.allow ?? []);
  for (const [t, n] of Object.entries(a.counts))
    if (n > 0 && !wanted.has(t) && !allow.has(t) && !(spec.forbid ?? []).includes(t)) issues.push({ kind: 'extra', thing: t, about: words(t) });
  if (spec.method && a.method !== spec.method) issues.push({ kind: 'wrong_method', about: [] });
  if (spec.vessel && a.vessel !== spec.vessel) issues.push({ kind: 'wrong_vessel', about: [] });
  const kinds = new Set(issues.map((i) => i.kind));
  let outcome: Outcome = 'fail';
  if (kinds.has('forbidden')) outcome = 'bad';
  else if ([...kinds].every((k) => k === 'too_much' || k === 'too_little' || k === 'wrong_vessel') && offBy <= 1) outcome = 'minor';
  return finish(issues, outcome);
}

export function solveMake(spec: MakeSpec): Extract<TaskAnswer, { arch: 'make' }> {
  const counts: Record<string, number> = {};
  for (const w of spec.want) counts[w.thing] = wantRange(w)[0];
  return { arch: 'make', counts, vessel: spec.vessel ?? null, method: spec.method ?? null };
}

// ---------------------------------------------------------------------------- sort

export function evaluateSort(spec: SortSpec, a: Extract<TaskAnswer, { arch: 'sort' }>): JobEvaluation {
  const issues: JobIssue[] = [];
  for (const it of spec.items) {
    if (a.placed[it.id] !== it.bin) issues.push({ kind: 'wrong_bin', item: it.id, about: [it.text] });
  }
  const outcome: Outcome = issues.length === 1 && spec.items.length >= 4 ? 'minor' : 'fail';
  return finish(issues, outcome);
}

export function solveSort(spec: SortSpec): Extract<TaskAnswer, { arch: 'sort' }> {
  return { arch: 'sort', placed: Object.fromEntries(spec.items.map((i) => [i.id, i.bin])) };
}

// ---------------------------------------------------------------------------- trade

export function tradeTotal(spec: TradeSpec, price: (thing: string) => number): number {
  return spec.want.reduce((s, w) => s + w.n * price(w.thing), 0);
}

export function evaluateTrade(spec: TradeSpec, a: Extract<TaskAnswer, { arch: 'trade' }>, price: (thing: string) => number, words: (thing: string) => string[] = (t) => [t]): JobEvaluation {
  const issues: JobIssue[] = [];
  const want = new Map(spec.want.map((w) => [w.thing, w.n]));
  for (const [t, n] of want) if ((a.counts[t] ?? 0) !== n) issues.push({ kind: 'wrong_goods', thing: t, about: words(t) });
  for (const [t, n] of Object.entries(a.counts)) if (n > 0 && !want.has(t)) issues.push({ kind: 'wrong_goods', thing: t, about: words(t) });
  const goodsOk = issues.length === 0;
  // Change is judged on what the customer actually takes (their goods, priced).
  const owed = spec.pay - (goodsOk ? tradeTotal(spec, price) : Object.entries(a.counts).reduce((s, [t, n]) => s + n * price(t), 0));
  if (goodsOk && a.change !== owed) issues.push({ kind: a.change > owed ? 'change_over' : 'change_short', about: [] });
  return finish(issues, 'fail');
}

export function solveTrade(spec: TradeSpec, price: (thing: string) => number): Extract<TaskAnswer, { arch: 'trade' }> {
  return { arch: 'trade', counts: Object.fromEntries(spec.want.map((w) => [w.thing, w.n])), change: spec.pay - tradeTotal(spec, price) };
}

// ---------------------------------------------------------------------------- check

export function evaluateCheck(spec: CheckSpec, a: Extract<TaskAnswer, { arch: 'check' }>): JobEvaluation {
  const target = spec.docs[spec.target];
  const fieldText = (id?: string) => {
    const f = target?.fields?.find((x) => x.id === id);
    return f ? [`${f.label} ${f.value}`] : [];
  };
  if (spec.wrong === null) {
    if (a.verdict === 'ok') return finish([], 'perfect');
    return finish([{ kind: 'false_alarm', field: a.field, about: fieldText(a.field) }], 'fail');
  }
  if (a.verdict === 'ok') return finish([{ kind: 'missed', field: spec.wrong, about: fieldText(spec.wrong) }], 'bad');
  if (a.field !== spec.wrong) return finish([{ kind: 'wrong_field', field: spec.wrong, item: a.field, about: [...fieldText(spec.wrong), ...fieldText(a.field)] }], 'fail');
  if (spec.fix !== undefined && spec.fixOptions?.length && a.fix !== spec.fix) return finish([{ kind: 'wrong_fix', field: spec.wrong, about: [spec.fix] }], 'minor');
  return finish([], 'perfect');
}

export function solveCheck(spec: CheckSpec): Extract<TaskAnswer, { arch: 'check' }> {
  return spec.wrong === null ? { arch: 'check', verdict: 'ok' } : { arch: 'check', verdict: 'fix', field: spec.wrong, fix: spec.fix };
}

// ---------------------------------------------------------------------------- respond

export function evaluateRespond(spec: RespondSpec, a: Extract<TaskAnswer, { arch: 'respond' }>): JobEvaluation {
  if (spec.mode === 'choose') {
    if (a.choice === spec.answer) return finish([], 'perfect');
    const opt = a.choice !== undefined ? spec.options?.[a.choice] : undefined;
    return finish([{ kind: 'wrong_reply', about: [...spec.msg.lines, ...(opt ? [opt] : [])] }], 'fail');
  }
  if (spec.mode === 'form') {
    const issues: JobIssue[] = [];
    for (const f of spec.fields ?? []) if (a.fields?.[f.id] !== f.answer) issues.push({ kind: 'wrong_form', field: f.id, about: [f.answer] });
    return finish(issues, issues.length === 1 && (spec.fields?.length ?? 0) >= 3 ? 'minor' : 'fail');
  }
  if (a.slot === spec.slot?.answer) return finish([], 'perfect');
  return finish([{ kind: 'wrong_slot', about: spec.msg.lines }], 'fail');
}

export function solveRespond(spec: RespondSpec): Extract<TaskAnswer, { arch: 'respond' }> {
  if (spec.mode === 'choose') return { arch: 'respond', choice: spec.answer };
  if (spec.mode === 'form') return { arch: 'respond', fields: Object.fromEntries((spec.fields ?? []).map((f) => [f.id, f.answer])) };
  return { arch: 'respond', slot: spec.slot?.answer };
}

/** Free cells of a slot task that satisfy... (used by the generator and the validator: exactly one must fit). */
export function slotFits(spec: RespondSpec, want: string[], avoid: string[]): string[] {
  return (spec.slot?.cells ?? []).filter((c) => !c.busy && want.every((t) => c.tags.includes(t)) && !avoid.some((t) => c.tags.includes(t))).map((c) => c.id);
}

// ---------------------------------------------------------------------------- dispatch

export interface RuleCtx {
  price: (thing: string) => number;
  words: (thing: string) => string[];
}

export function evaluateTask(spec: TaskSpec, a: TaskAnswer, ctx: RuleCtx): JobEvaluation {
  switch (spec.arch) {
    case 'make':
      return a.arch === 'make' ? evaluateMake(spec, a, ctx.words) : finish([{ kind: 'empty', about: [] }], 'fail');
    case 'sort':
      return a.arch === 'sort' ? evaluateSort(spec, a) : finish([{ kind: 'wrong_bin', about: [] }], 'fail');
    case 'trade':
      return a.arch === 'trade' ? evaluateTrade(spec, a, ctx.price, ctx.words) : finish([{ kind: 'wrong_goods', about: [] }], 'fail');
    case 'check':
      return a.arch === 'check' ? evaluateCheck(spec, a) : finish([{ kind: 'missed', about: [] }], 'fail');
    case 'respond':
      return a.arch === 'respond' ? evaluateRespond(spec, a) : finish([{ kind: 'wrong_reply', about: [] }], 'fail');
  }
}

export function solveTask(spec: TaskSpec, ctx: RuleCtx): TaskAnswer {
  switch (spec.arch) {
    case 'make':
      return solveMake(spec);
    case 'sort':
      return solveSort(spec);
    case 'trade':
      return solveTrade(spec, ctx.price);
    case 'check':
      return solveCheck(spec);
    case 'respond':
      return solveRespond(spec);
  }
}

/** A plausible wrong answer (simulator: a clumsy player). */
export function fumbleTask(spec: TaskSpec, ctx: RuleCtx, r: () => number): TaskAnswer {
  const a = solveTask(spec, ctx);
  switch (a.arch) {
    case 'make': {
      const t = spec.arch === 'make' ? spec.want[Math.floor(r() * spec.want.length)]?.thing : undefined;
      if (t) a.counts[t] = (a.counts[t] ?? 0) + 2;
      return a;
    }
    case 'sort': {
      const ids = Object.keys(a.placed);
      const bins = spec.arch === 'sort' ? spec.bins : [];
      const id = ids[Math.floor(r() * ids.length)];
      if (id) a.placed[id] = bins.find((b) => b !== a.placed[id]) ?? a.placed[id];
      return a;
    }
    case 'trade':
      return { ...a, change: a.change + 1 };
    case 'check':
      return a.verdict === 'ok' ? { arch: 'check', verdict: 'fix', field: spec.arch === 'check' ? spec.docs[spec.target]?.fields?.[0]?.id : undefined } : { arch: 'check', verdict: 'ok' };
    case 'respond':
      if (spec.arch === 'respond' && spec.mode === 'choose') return { arch: 'respond', choice: ((spec.answer ?? 0) + 1) % (spec.options?.length ?? 1) };
      if (spec.arch === 'respond' && spec.mode === 'slot') return { arch: 'respond', slot: spec.slot?.cells.find((c) => c.id !== spec.slot?.answer)?.id };
      return { arch: 'respond', fields: {} };
  }
}
