/**
 * Task generator: authored tasks and templates → TaskInstance (texts filled, rules concrete).
 * Template slots are typed (thing tags, a domain / POS / level for plain words, persons), so
 * authors write a sentence once and the generator varies it within the job's vocabulary and the
 * rank's level. No language-specific text lives here.
 */
import { capitalizeFirst, wordMarkup, type GameData } from '../core/gamedata';
import { pick, shuffle, type Rng } from '../core/rng';
import { tokenIds } from '../core/tokenize';
import { EIKEN_GRADES } from '../core/types';
import { fill } from '../activities/town/text';
import { eikenFromKey, eikenIndex, type EikenKey } from '../curriculum/yardsticks';
import { slotFits } from './rules';
import type {
  AuthoredTask,
  CheckDoc,
  CheckTemplate,
  JobContent,
  JobDef,
  JobPerson,
  RespondSpec,
  RespondTemplate,
  SlotDef,
  SlotTemplate,
  SortTemplate,
  TaskFeature,
  TaskInstance,
  TaskSpec,
  TaskTemplate,
  ThingDef,
  TradeTemplate,
  MakeTemplate,
} from './types';

export interface GenCtx {
  data: GameData;
  job: JobDef;
  jc: JobContent;
  rank: number;
  feats: Set<TaskFeature>;
  rng: Rng;
  /** Players' choice at the board: time pressure in timed tasks. */
  timedOn: boolean;
}

// ---------------------------------------------------------------------------- text helpers

export function numberWords(data: GameData, n: number): string | null {
  const t = data.content.town?.numberText[n];
  if (t) return t;
  const id = data.content.numbers[n];
  return id ? wordMarkup(data, id) : null;
}

export function thingById(jc: JobContent, id: string): ThingDef | undefined {
  return jc.things.find((t) => t.id === id);
}

/** The thing's name as markup (singular or plural surface). */
export function thingName(data: GameData, t: ThingDef, plural = false): string {
  const e = data.lex.byId.get(t.word);
  const sing = e?.text ?? t.word;
  return wordMarkup(data, t.word, plural ? (t.plural ?? `${sing}s`) : sing);
}

/** "two eggs", "three slices of bread" (unit pattern), "one stamp". */
export function qtyText(data: GameData, t: ThingDef, n: number): string | null {
  const num = numberWords(data, n);
  if (!num) return null;
  if (t.unit) return t.unit.replace('{n}', num);
  return `${num} ${thingName(data, t, n !== 1)}`;
}

/** Name of a person as non-word markup (regulars come from the content's customers). */
export function personName(data: GameData, jc: JobContent, id: string): string {
  const c = data.content.customers.find((x) => x.id === id);
  const p = jc.people.find((x) => x.id === id);
  const name = p?.name || c?.name || id;
  return `{${name}|@}`;
}

export function personOf(data: GameData, jc: JobContent, id: string): JobPerson {
  const c = data.content.customers.find((x) => x.id === id);
  const p = jc.people.find((x) => x.id === id);
  return { id, name: p?.name || c?.name || id, avatar: p?.avatar || c?.avatar || '🧑' };
}

function levelOk(data: GameData, wordId: string, max: number): boolean {
  const e = data.lex.byId.get(wordId);
  const i = eikenIndex(e?.eiken ?? null);
  return i < 0 || i <= max;
}

/** Highest 英検 grade index the rank's material may use (its level + one grade of slack). */
export function rankLevelIndex(job: JobDef, rank: number, slack = 1): number {
  const r = job.ranks.find((x) => x.rank === rank) ?? job.ranks[0];
  const g = eikenFromKey(r?.level.eiken ?? '5');
  return Math.min(EIKEN_GRADES.length - 1, eikenIndex(g) + slack);
}

function maxOf(ctx: GenCtx, k?: EikenKey): number {
  return k ? eikenIndex(eikenFromKey(k)) : rankLevelIndex(ctx.job, ctx.rank);
}

function thingsFor(ctx: GenCtx, tags: string[] | undefined, max: number, used: Set<string>): ThingDef[] {
  return ctx.jc.things.filter((t) => !used.has(t.id) && (!tags?.length || tags.some((g) => t.tags?.includes(g))) && levelOk(ctx.data, t.word, max));
}

/** Plain-word slot: a lexicon word typed by domain / POS / level. */
function wordSlot(ctx: GenCtx, s: Extract<SlotDef, { kind: 'word' }>): string | null {
  const max = maxOf(ctx, s.maxLevel);
  const cands = (s.ids ?? ctx.data.content.lexicon.map((e) => e.id)).filter((id) => {
    const e = ctx.data.lex.byId.get(id);
    if (!e) return false;
    if (s.pos && e.pos !== s.pos) return false;
    if (s.domain && !(e.domains ?? []).includes(s.domain)) return false;
    return levelOk(ctx.data, id, max);
  });
  return cands.length ? wordMarkup(ctx.data, pick(ctx.rng, cands)) : null;
}

function clientPeople(ctx: GenCtx): string[] {
  return ctx.jc.people.map((p) => p.id).filter((id) => id !== ctx.jc.boss);
}

// ---------------------------------------------------------------------------- instances

function features(ctx: GenCtx, meta: { features?: TaskFeature[] }): { audioOnly: boolean; timed: boolean } {
  const f = meta.features ?? [];
  const audioOnly = f.includes('audioOnly') && ctx.feats.has('audioOnly');
  const timed = ctx.timedOn && ctx.feats.has('timed') && (f.includes('timed') || ctx.rng() < 0.3);
  return { audioOnly, timed };
}

export function specTexts(spec: TaskSpec): string[] {
  switch (spec.arch) {
    case 'make':
    case 'trade':
      return [];
    case 'sort':
      return spec.items.map((i) => i.text);
    case 'check':
      return spec.docs.flatMap((d) => [...(d.title ? [d.title] : []), ...(d.lines ?? []), ...(d.fields ?? []).flatMap((f) => [f.label, f.value])]);
    case 'respond':
      return [
        ...(spec.msg.subject ? [spec.msg.subject] : []),
        ...spec.msg.lines,
        ...(spec.options ?? []),
        ...(spec.fields ?? []).flatMap((f) => [f.label, ...f.options]),
        ...(spec.slot ? [...spec.slot.rows.map((r) => r.label), ...spec.slot.cols.map((c) => c.label), ...spec.slot.cells.filter((c) => c.busy).map((c) => c.busy!)] : []),
      ];
  }
}

export function makeInstance(ctx: GenCtx, source: TaskInstance['source'], meta: { person?: string; say?: string; features?: TaskFeature[] }, spec: TaskSpec, key: string): TaskInstance {
  const say = meta.say ?? '';
  const f = features(ctx, meta);
  const person = meta.person ?? (spec.arch === 'sort' || spec.arch === 'check' && !say ? ctx.jc.boss : pick(ctx.rng, clientPeople(ctx).length ? clientPeople(ctx) : [ctx.jc.boss]));
  const texts = [...(say ? [say] : []), ...specTexts(spec)];
  const focus = spec.arch === 'make' || spec.arch === 'trade' ? [say] : spec.arch === 'respond' ? spec.msg.lines : spec.arch === 'sort' ? spec.items.map((i) => i.text) : texts;
  return { key, job: ctx.job.id, source, spec, person, say, audioOnly: f.audioOnly && !!say, timed: f.timed, texts: texts.filter(Boolean), focus: focus.filter(Boolean) };
}

export function authoredInstance(ctx: GenCtx, t: AuthoredTask): TaskInstance {
  // Strip the meta fields: what is left is the archetype spec.
  const { id: _i, rank: _r, seq: _s, person: _p, say: _y, features: _f, grammar: _g, phrases: _ph, level: _l, weight: _w, ...spec } = t;
  void _i; void _r; void _s; void _p; void _y; void _f; void _g; void _ph; void _l; void _w;
  return makeInstance(ctx, { type: 'authored', id: t.id }, t, spec as TaskSpec, `${ctx.job.id}:${t.id}`);
}

/** Instantiate a template; null when its slots cannot be filled at this rank. */
export function templateInstance(ctx: GenCtx, t: TaskTemplate): TaskInstance | null {
  const spec = buildSpec(ctx, t);
  if (!spec) return null;
  const { say, spec: s, person } = spec;
  const sig = JSON.stringify(s).length + ':' + say.length + ':' + (s.arch === 'respond' ? s.msg.lines.join('|') : say);
  return makeInstance(ctx, { type: 'template', id: t.id }, { ...t, say, person: person ?? t.person }, s, `${ctx.job.id}:${t.id}:${hashKey(sig)}`);
}

function hashKey(s: string): string {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return (h >>> 0).toString(36);
}

interface Built {
  say: string;
  spec: TaskSpec;
  person?: string;
}

function buildSpec(ctx: GenCtx, t: TaskTemplate): Built | null {
  switch (t.arch) {
    case 'make':
      return buildMake(ctx, t as TaskTemplate & MakeTemplate);
    case 'sort':
      return buildSort(ctx, t as TaskTemplate & SortTemplate);
    case 'trade':
      return buildTrade(ctx, t as TaskTemplate & TradeTemplate);
    case 'check':
      return buildCheck(ctx, t as TaskTemplate & CheckTemplate);
    case 'respond':
      return (t as RespondTemplate | SlotTemplate).mode === 'slot' ? buildSlot(ctx, t as TaskTemplate & SlotTemplate) : buildChoose(ctx, t as TaskTemplate & RespondTemplate);
  }
}

/** Fill typed slots shared by make / trade. Returns placeholder values + rule parts. */
function fillSlots(ctx: GenCtx, slots: Record<string, SlotDef>, maxCount: number) {
  const used = new Set<string>();
  const values: Record<string, string> = {};
  const want: { thing: string; n?: number; min?: number; max?: number }[] = [];
  const forbid: string[] = [];
  let method: string | undefined;
  let vessel: string | undefined;
  for (const [name, s] of Object.entries(slots)) {
    const key = name.toLowerCase();
    if (s.kind === 'qty' || s.kind === 'thing' || s.kind === 'forbid') {
      const cands = thingsFor(ctx, s.tags, maxOf(ctx, s.maxLevel), used);
      if (!cands.length) return null;
      const th = pick(ctx.rng, cands);
      used.add(th.id);
      if (s.kind === 'qty') {
        const lo = s.min ?? 1;
        const hi = Math.min(s.max ?? 3, th.max ?? maxCount, maxCount);
        if (hi < lo) return null;
        const n = lo + Math.floor(ctx.rng() * (hi - lo + 1));
        const txt = qtyText(ctx.data, th, n);
        if (!txt) return null;
        values[key] = txt;
        want.push({ thing: th.id, n });
      } else if (s.kind === 'thing') {
        values[key] = thingName(ctx.data, th);
        want.push({ thing: th.id, min: 1, max: Math.min(th.max ?? maxCount, maxCount) });
      } else {
        values[key] = thingName(ctx.data, th);
        forbid.push(th.id);
      }
    } else if (s.kind === 'method') {
      const ms = ctx.jc.make?.methods ?? [];
      if (!ms.length) return null;
      const m = pick(ctx.rng, ms);
      method = m.id;
      values[key] = wordMarkup(ctx.data, m.word);
    } else if (s.kind === 'vessel') {
      const vs = ctx.jc.make?.vessels ?? [];
      if (!vs.length) return null;
      const v = pick(ctx.rng, vs);
      vessel = v.id;
      values[key] = wordMarkup(ctx.data, v.word);
    } else if (s.kind === 'word') {
      const w = wordSlot(ctx, s);
      if (!w) return null;
      values[key] = w;
    } else if (s.kind === 'name') {
      const ids = clientPeople(ctx);
      if (!ids.length) return null;
      values[key] = personName(ctx.data, ctx.jc, pick(ctx.rng, ids));
    }
  }
  return { values, want, forbid, method, vessel };
}

function fillSay(text: string | undefined, values: Record<string, string>): string | null {
  if (!text) return '';
  const out = fill(text, values);
  return out === null ? null : out;
}

function buildMake(ctx: GenCtx, t: TaskTemplate & MakeTemplate): Built | null {
  const f = fillSlots(ctx, t.slots, ctx.jc.make?.max ?? 5);
  if (!f) return null;
  const say = fillSay(t.say, f.values);
  if (say === null) return null;
  return { say, spec: { arch: 'make', want: f.want, ...(f.forbid.length ? { forbid: f.forbid } : {}), ...(f.method ? { method: f.method } : {}), ...(f.vessel ? { vessel: f.vessel } : {}) } };
}

function buildTrade(ctx: GenCtx, t: TaskTemplate & TradeTemplate): Built | null {
  const f = fillSlots(ctx, t.slots, 6);
  if (!f) return null;
  const say = fillSay(t.say, f.values);
  if (say === null) return null;
  const want = f.want.map((w) => ({ thing: w.thing, n: w.n ?? 1 }));
  const total = want.reduce((s, w) => s + w.n * (thingById(ctx.jc, w.thing)?.price ?? 1), 0);
  let pay = total;
  if (t.pay === 'round') {
    const coins = [...(ctx.jc.trade?.coins ?? [1, 5, 10, 50])].sort((a, b) => a - b);
    const bigger = coins.filter((c) => c > total);
    pay = bigger.length ? bigger[0] : Math.ceil((total + 1) / 10) * 10;
    if (pay === total) pay = total + 5;
  }
  return { say, spec: { arch: 'trade', want, pay } };
}

function buildSort(ctx: GenCtx, t: TaskTemplate & SortTemplate): Built | null {
  const bench = ctx.jc.sort;
  if (!bench) return null;
  const extra = ctx.feats.has('long') ? 1 : 0;
  const n = t.count[0] + Math.floor(ctx.rng() * (t.count[1] - t.count[0] + 1)) + extra;
  const max = maxOf(ctx, t.level);
  // Bins whose labels are within the rank's level.
  const binOk = (b: string) => {
    const def = bench.bins.find((x) => x.id === b);
    return !!def && tokenIds(ctx.data.tokens(`${def.label} ${def.ref}`)).every((id) => levelOk(ctx.data, id, max));
  };
  const allowed = t.bins.filter(binOk);
  const items: { id: string; text: string; thing?: string; bin: string }[] = [];
  const seen = new Set<string>();
  for (let tries = 0; items.length < n && tries < n * 12; tries++) {
    const pat = pick(ctx.rng, t.patterns);
    const values: Record<string, string> = {};
    let bin: string | undefined;
    let thing: string | undefined;
    if (pat.text.includes('{thing}') || pat.text.includes('{Thing}')) {
      const cands = ctx.jc.things.filter((x) => x.bin && allowed.includes(x.bin) && (!pat.tags?.length || pat.tags.some((g) => x.tags?.includes(g))) && levelOk(ctx.data, x.word, max));
      if (!cands.length) continue;
      const th = pick(ctx.rng, cands);
      values.thing = thingName(ctx.data, th);
      bin = th.bin;
      thing = th.id;
    }
    if (pat.text.includes('{bin}') || pat.text.includes('{Bin}')) {
      const pool = (pat.bins ?? allowed).filter((b) => allowed.includes(b));
      if (!pool.length) continue;
      const b = pick(ctx.rng, pool);
      values.bin = bench.bins.find((x) => x.id === b)!.ref;
      bin = b;
    }
    if (pat.text.includes('{num}')) values.num = String(1 + Math.floor(ctx.rng() * 40));
    if (!bin && pat.bins?.length) {
      const pool = pat.bins.filter((b) => allowed.includes(b));
      if (!pool.length) continue;
      bin = pick(ctx.rng, pool);
    }
    if (pat.text.includes('{name}') || pat.text.includes('{Name}')) values.name = personName(ctx.data, ctx.jc, pick(ctx.rng, clientPeople(ctx)));
    if (!bin) continue;
    const text = fill(pat.text, values);
    if (!text || seen.has(text)) continue;
    if (!tokenIds(ctx.data.tokens(text)).every((id) => levelOk(ctx.data, id, max))) continue;
    seen.add(text);
    items.push({ id: `i${items.length + 1}`, text: capitalizeFirst(text), thing, bin });
  }
  if (items.length < Math.min(n, 2)) return null;
  const used = [...new Set(items.map((i) => i.bin))];
  if (used.length < 2) return null;
  // The cabinet: the bins the letters need plus one or two others (at most 6), in the template's order.
  const others = shuffle(ctx.rng, allowed.filter((b) => !used.includes(b))).slice(0, Math.max(0, Math.min(2, 6 - used.length)));
  const bins = allowed.filter((b) => used.includes(b) || others.includes(b));
  return { say: fillSay(t.say, {}) ?? '', spec: { arch: 'sort', bins, items: shuffle(ctx.rng, items) } };
}

function buildCheck(ctx: GenCtx, t: TaskTemplate & CheckTemplate): Built | null {
  const values: Record<string, string> = {};
  for (const f of t.fields) values[f.id] = pick(ctx.rng, f.values);
  const target = t.docs[t.target];
  if (!target) return null;
  const wrongable = (t.wrongable ?? target.fields ?? []).filter((id) => (t.fields.find((f) => f.id === id)?.values.length ?? 0) > 1);
  let wrong: string | null = null;
  const shown: Record<string, string> = { ...values };
  if (wrongable.length && ctx.rng() < t.pWrong) {
    wrong = pick(ctx.rng, wrongable);
    const f = t.fields.find((x) => x.id === wrong)!;
    shown[wrong] = pick(ctx.rng, f.values.filter((v) => v !== values[wrong!]));
  }
  const label = (id: string) => t.fields.find((f) => f.id === id)?.label ?? id;
  const docs: CheckDoc[] = t.docs.map((d, i) => {
    const vals = i === t.target ? shown : values;
    const lines = (d.lines ?? []).map((l) => fill(l, vals) ?? l);
    return { kind: d.kind, ...(d.title ? { title: d.title } : {}), ...(d.fields ? { fields: d.fields.map((id) => ({ id, label: label(id), value: vals[id] })) } : {}), ...(lines.length ? { lines } : {}) };
  });
  const spec: TaskSpec = { arch: 'check', docs, target: t.target, wrong };
  if (wrong && ctx.feats.has('multiStep')) {
    const f = t.fields.find((x) => x.id === wrong)!;
    const others = shuffle(ctx.rng, f.values.filter((v) => v !== values[wrong!] && v !== shown[wrong!])).slice(0, 1);
    spec.fixOptions = shuffle(ctx.rng, [values[wrong], shown[wrong], ...others]);
    spec.fix = values[wrong];
  }
  return { say: fillSay(t.say, values) ?? '', spec };
}

function buildChoose(ctx: GenCtx, t: TaskTemplate & RespondTemplate): Built | null {
  const bank = (ctx.jc.qa?.[t.bank] ?? []).filter((q) => q.rank <= ctx.rank);
  if (bank.length < 3) return null;
  const qa = pick(ctx.rng, bank);
  const others = shuffle(ctx.rng, bank.filter((x) => x.fn !== qa.fn && x.a !== qa.a));
  const distract: string[] = [];
  for (const o of others) if (!distract.includes(o.a)) distract.push(o.a);
  const opts = shuffle(ctx.rng, [qa.a, ...distract.slice(0, ctx.feats.has('long') ? 3 : 2)]);
  if (opts.length < 3) return null;
  const spec: RespondSpec = { mode: 'choose', msg: { kind: t.kind, lines: [qa.q] }, options: opts, answer: opts.indexOf(qa.a) };
  return { say: t.kind === 'speech' || t.kind === 'phone' ? qa.q : '', spec: { arch: 'respond', ...spec } };
}

function buildSlot(ctx: GenCtx, t: TaskTemplate & SlotTemplate): Built | null {
  const cells = t.rows.flatMap((r) =>
    t.cols.map((c) => ({ id: `${r.id}-${c.id}`, row: r.id, col: c.id, tags: [r.id, c.id, ...(t.cellTags?.[r.id] ?? []), ...(t.cellTags?.[c.id] ?? [])] })),
  );
  const nWant = ctx.feats.has('long') ? 2 : 1 + (ctx.rng() < 0.5 ? 1 : 0);
  for (let attempt = 0; attempt < 20; attempt++) {
    const want = shuffle(ctx.rng, t.want).slice(0, nWant);
    if (new Set(want.map((w) => w.tag)).size < want.length) continue;
    // Two constraints must not be two rows / two columns (no cell has both).
    const fitsW = cells.filter((c) => want.every((w) => c.tags.includes(w.tag)));
    if (!fitsW.length) continue;
    const avoidPool = t.avoid.filter((a) => !want.some((w) => w.tag === a.tag) && fitsW.some((c) => !c.tags.includes(a.tag)) && fitsW.some((c) => c.tags.includes(a.tag)));
    const avoid = avoidPool.length && ctx.rng() < 0.6 ? [pick(ctx.rng, avoidPool)] : [];
    const fits = fitsW.filter((c) => !avoid.some((a) => c.tags.includes(a.tag)));
    if (!fits.length) continue;
    const answer = pick(ctx.rng, fits);
    const busyTexts = shuffle(ctx.rng, t.busy);
    let bi = 0;
    const out = cells.map((c) => ({ ...c } as (typeof cells)[number] & { busy?: string }));
    for (const c of out) {
      if (c.id === answer.id) continue;
      const fit = fits.some((f) => f.id === c.id);
      if (fit || ctx.rng() < 0.25) c.busy = busyTexts[bi++ % busyTexts.length];
    }
    const spec: RespondSpec = {
      mode: 'slot',
      msg: { kind: t.kind, lines: [...(t.open ?? []).slice(0, 1), ...want.map((w) => w.text), ...avoid.map((a) => a.text), ...(t.close ?? []).slice(0, 1)] },
      slot: { layout: t.layout, rows: t.rows, cols: t.cols, cells: out, answer: answer.id },
    };
    if (slotFits(spec, want.map((w) => w.tag), avoid.map((a) => a.tag)).length !== 1) continue;
    return { say: t.kind === 'speech' || t.kind === 'phone' ? spec.msg.lines.join(' ') : '', spec: { arch: 'respond', ...spec } };
  }
  return null;
}

/** Words (lexicon ids) of a task instance. */
export function instanceWords(data: GameData, inst: TaskInstance): string[] {
  const s = new Set<string>();
  for (const t of inst.texts) for (const id of tokenIds(data.tokens(t))) s.add(id);
  return [...s];
}
