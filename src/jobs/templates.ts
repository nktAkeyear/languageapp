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
import { postage as postageOf, slotFits } from './rules';
import type {
  AuthoredTask,
  CheckDoc,
  CheckField,
  CheckTemplate,
  FormTemplate,
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

/** The thing's name as markup (singular or plural surface; a mass noun has no plural). */
export function thingName(data: GameData, t: ThingDef, plural = false): string {
  const e = data.lex.byId.get(t.word);
  const sing = e?.text ?? t.word;
  return wordMarkup(data, t.word, plural && !t.mass ? (t.plural ?? `${sing}s`) : sing);
}

/** English singular of a regular plural unit noun ("pieces" → "piece", "slices" → "slice", "glasses" → "glass"). */
export function singularOf(w: string): string {
  if (/ies$/.test(w)) return w.slice(0, -3) + 'y';
  if (/(ch|sh|x|ss)es$/.test(w)) return w.slice(0, -2);
  if (/s$/.test(w) && !/ss$/.test(w)) return w.slice(0, -1);
  return w;
}

/** "two eggs", "three pieces of bread" / "one piece of bread" (unit pattern), "one stamp". */
export function qtyText(data: GameData, t: ThingDef, n: number): string | null {
  const num = numberWords(data, n);
  if (!num) return null;
  if (t.unit && typeof t.unit === 'object') return (n === 1 ? t.unit.one : t.unit.other).replace('{n}', num);
  if (t.unit) {
    const u = n === 1 ? t.unit.replace(/\{n\} ([A-Za-z]+)/, (_m, w: string) => `{n} ${singularOf(w)}`) : t.unit;
    return u.replace('{n}', num);
  }
  return `${num} ${thingName(data, t, n !== 1)}`;
}

/**
 * Agreement words for a thing in a reaction: the noun as the sentence needs it (a mass noun stays singular;
 * a count noun is plural unless exactly one was asked for), and is / are, much / many, it / them.
 */
export function thingAgreement(data: GameData, t: ThingDef, one: boolean): { thing: string; is: string; much: string; it: string; this: string } {
  const plural = !t.mass && !one;
  return { thing: thingName(data, t, plural), is: plural ? 'are' : 'is', much: t.mass ? 'much' : 'many', it: plural ? 'them' : 'it', this: plural ? 'these' : 'this' };
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

/** Clients with a name of their own (a name slot that names its speaker needs one). */
function namedClients(ctx: GenCtx): string[] {
  return clientPeople(ctx).filter((id) => personOf(ctx.data, ctx.jc, id).name !== id);
}

const SELF_INTRO = /(?:^|[.!?,]\s*|\b)(?:I am|I'm|my name is|this is|it is|it's)\s+\{([^{}|]+)\|@\}/gi;

/** The person (id) a text's speaker names themselves as ("Hello, this is {Mr. Grant|@}."), if any. */
export function selfNamed(data: GameData, jc: JobContent, text: string): { name: string; id: string | null } | null {
  SELF_INTRO.lastIndex = 0;
  const m = SELF_INTRO.exec(text);
  if (!m) return null;
  const name = m[1];
  const p = jc.people.find((x) => (x.name || data.content.customers.find((c) => c.id === x.id)?.name) === name);
  return { name, id: p?.id ?? null };
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

/** What the boss says when handing over a paper without a spoken request (an e-mail, a letter, a memo …). */
function handoverLine(ctx: GenCtx, spec: TaskSpec): string {
  const kind = spec.arch === 'respond' ? spec.msg.kind : spec.arch === 'check' ? 'check' : spec.arch === 'sort' ? 'sort' : null;
  const lines = ctx.jc.lines.filter((l) => l.kind === 'handover' && (l.rank ?? 1) <= ctx.rank);
  const fit = lines.filter((l) => l.msg === kind);
  const any = lines.filter((l) => !l.msg);
  const c = fit.length ? fit : any;
  return c.length ? pick(ctx.rng, c).text : '';
}

export function makeInstance(ctx: GenCtx, source: TaskInstance['source'], meta: { person?: string; say?: string; features?: TaskFeature[] }, spec: TaskSpec, key: string): TaskInstance {
  let say = meta.say ?? '';
  let handover = false;
  if (!say && spec.arch !== 'make' && spec.arch !== 'trade' && !(spec.arch === 'respond' && spec.msg.kind === 'speech')) {
    say = handoverLine(ctx, spec);
    handover = !!say;
  }
  const f = features(ctx, meta);
  // Who you work with: sorting and checking papers are for the boss, requests come from clients;
  // a task / template may name a person, or 'client' for any client (a guest at the inn's desk).
  const clients = clientPeople(ctx).length ? clientPeople(ctx) : [ctx.jc.boss];
  const bossTask = spec.arch === 'sort' || spec.arch === 'check' || (spec.arch === 'respond' && spec.msg.kind !== 'speech');
  let person = meta.person === 'client' ? pick(ctx.rng, clients) : (meta.person ?? (bossTask ? ctx.jc.boss : pick(ctx.rng, clients)));
  // A speaker who names themselves is that person (their own face): "Hello, I am {Mr. Lin|@}."
  if (!handover) {
    const self = selfNamed(ctx.data, ctx.jc, say);
    if (self?.id && (!meta.person || meta.person === 'client' || !bossTask)) person = self.id;
  }
  const texts = [...(say ? [say] : []), ...specTexts(spec)];
  const focus = spec.arch === 'make' || spec.arch === 'trade' ? [say] : spec.arch === 'respond' ? spec.msg.lines : spec.arch === 'sort' ? spec.items.map((i) => i.text) : texts.filter((t) => t !== say || !handover);
  return {
    key,
    job: ctx.job.id,
    source,
    spec,
    person,
    say,
    audioOnly: f.audioOnly && !!say && !handover,
    timed: f.timed,
    texts: texts.filter(Boolean),
    focus: focus.filter(Boolean),
    ...(handover ? { handover: true } : {}),
  };
}

export function authoredInstance(ctx: GenCtx, t: AuthoredTask): TaskInstance {
  // Strip the meta fields: what is left is the archetype spec.
  const { id: _i, rank: _r, seq: _s, person: _p, say: _y, features: _f, grammar: _g, phrases: _ph, weight: _w, ...spec } = t;
  void _i; void _r; void _s; void _p; void _y; void _f; void _g; void _ph; void _w;
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
    case 'respond': {
      const mode = (t as RespondTemplate | SlotTemplate | FormTemplate).mode;
      return mode === 'slot' ? buildSlot(ctx, t as TaskTemplate & SlotTemplate) : mode === 'form' ? buildForm(ctx, t as TaskTemplate & FormTemplate) : buildChoose(ctx, t as TaskTemplate & RespondTemplate);
    }
  }
}

/** Fill typed slots shared by make / trade. Returns placeholder values + rule parts. */
function fillSlots(ctx: GenCtx, slots: Record<string, SlotDef>, maxCount: number) {
  const used = new Set<string>();
  const values: Record<string, string> = {};
  const want: { thing: string; n?: number; min?: number; max?: number }[] = [];
  const forbid: string[] = [];
  const dislike: string[] = [];
  const bySlot: Record<string, string> = {};
  let method: string | undefined;
  let vessel: string | undefined;
  let self: string | undefined;
  for (const [name, s] of Object.entries(slots)) {
    const key = name.toLowerCase();
    if (s.kind === 'qty' || s.kind === 'thing' || s.kind === 'forbid' || s.kind === 'dislike') {
      const cands = thingsFor(ctx, s.tags, maxOf(ctx, s.maxLevel), used);
      if (!cands.length) return null;
      const th = pick(ctx.rng, cands);
      used.add(th.id);
      bySlot[key] = th.id;
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
        values[key] = thingName(ctx.data, th, true);
        (s.kind === 'forbid' ? forbid : dislike).push(th.id);
      }
    } else if (s.kind === 'method') {
      const ms = (ctx.jc.make?.methods ?? []).filter((m) => levelOk(ctx.data, m.word, maxOf(ctx)));
      if (!ms.length) return null;
      const m = pick(ctx.rng, ms);
      method = m.id;
      values[key] = wordMarkup(ctx.data, m.word, m.surface);
    } else if (s.kind === 'vessel') {
      const vs = (ctx.jc.make?.vessels ?? []).filter((v) => levelOk(ctx.data, v.word, maxOf(ctx)));
      if (!vs.length) return null;
      const v = pick(ctx.rng, vs);
      vessel = v.id;
      values[key] = wordMarkup(ctx.data, v.word);
    } else if (s.kind === 'word') {
      const w = wordSlot(ctx, s);
      if (!w) return null;
      values[key] = w;
    } else if (s.kind === 'name') {
      const ids = s.self ? namedClients(ctx) : clientPeople(ctx);
      if (!ids.length) return null;
      const id = pick(ctx.rng, ids);
      if (s.self) self = id;
      values[key] = personName(ctx.data, ctx.jc, id);
    } else if (s.kind === 'pick') {
      if (!s.values.length) return null;
      values[key] = pick(ctx.rng, s.values);
    }
  }
  return { values, want, forbid, dislike, bySlot, method, vessel, self };
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
  let want = f.want;
  const out: string[] = [];
  if (t.ifOut) {
    // "If there is no X, give Y": sometimes the pantry is out of X (then Y is the dish), sometimes not (then only X).
    const a = f.bySlot[t.ifOut.first.toLowerCase()];
    const b = f.bySlot[t.ifOut.then.toLowerCase()];
    if (!a || !b) return null;
    if (ctx.rng() < t.ifOut.p) {
      out.push(a);
      want = want.filter((w) => w.thing !== a);
    } else want = want.filter((w) => w.thing !== b);
  }
  const order = (t.order ?? []).map((k) => f.bySlot[k.toLowerCase()]).filter((x): x is string => !!x && want.some((w) => w.thing === x));
  return {
    say,
    spec: {
      arch: 'make',
      want,
      ...(f.forbid.length ? { forbid: f.forbid } : {}),
      ...(f.dislike.length ? { dislike: f.dislike } : {}),
      ...(f.method ? { method: f.method } : {}),
      ...(f.vessel ? { vessel: f.vessel } : {}),
      ...(order.length > 1 ? { order } : {}),
      ...(out.length ? { out } : {}),
    },
    person: f.self,
  };
}

function buildTrade(ctx: GenCtx, t: TaskTemplate & TradeTemplate): Built | null {
  const f = fillSlots(ctx, t.slots, 6);
  if (!f) return null;
  let post: { dest: string; kilos: number; label?: string } | undefined;
  if (t.post) {
    const rates = ctx.jc.trade?.rates;
    const d = pick(ctx.rng, t.post.dests);
    const kilos = t.post.kilos[0] + Math.floor(ctx.rng() * (t.post.kilos[1] - t.post.kilos[0] + 1));
    if (!rates || postageOf(rates, d.id, kilos) === null) return null;
    f.values.dest = d.text;
    post = { dest: d.id, kilos, label: d.text };
  }
  const say = fillSay(t.say, f.values);
  if (say === null) return null;
  const want = f.want.map((w) => ({ thing: w.thing, n: w.n ?? 1 }));
  const total = want.reduce((s, w) => s + w.n * (thingById(ctx.jc, w.thing)?.price ?? 1), 0) + (post ? (postageOf(ctx.jc.trade!.rates!, post.dest, post.kilos) ?? 0) : 0);
  let pay = total;
  if (t.pay === 'round') {
    const coins = [...(ctx.jc.trade?.coins ?? [1, 5, 10, 50])].sort((a, b) => a - b);
    const bigger = coins.filter((c) => c > total);
    pay = bigger.length ? bigger[0] : Math.ceil((total + 1) / 10) * 10;
    if (pay === total) pay = total + 5;
  }
  return { say, spec: { arch: 'trade', want, pay, ...(post ? { post } : {}) }, person: f.self };
}

function buildSort(ctx: GenCtx, t: TaskTemplate & SortTemplate): Built | null {
  const bench = ctx.jc.sort;
  if (!bench) return null;
  const extra = ctx.feats.has('long') ? 1 : 0;
  const n = t.count[0] + Math.floor(ctx.rng() * (t.count[1] - t.count[0] + 1)) + extra;
  const max = maxOf(ctx);
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
    if (pat.text.includes('{digit}')) values.digit = String(1 + Math.floor(ctx.rng() * 9));
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

/** Numbers in a field's text ("12 boxes" → 12, "$4.50" → 4.5). */
function numIn(v: string): number {
  const m = /-?\d+(?:\.\d+)?/.exec(v.replace(/,/g, ''));
  return m ? Number(m[0]) : NaN;
}

function fieldText(f: CheckField, n: number): string {
  if (f.names) return f.names[n] ?? String(n);
  const num = Number.isInteger(n) ? String(n) : n.toFixed(2);
  return (f.fmt ?? '{n}').replace('{n}', num);
}

/** A believable wrong number for a field: a slip of the pen (digits swapped, one off, a step off, doubled). */
function nearMiss(ctx: GenCtx, f: CheckField, n: number): number | null {
  const step = f.range?.[2] ?? 1;
  const cands = new Set<number>();
  const d = String(n);
  if (d.length >= 2 && Number.isInteger(n)) {
    const sw = Number(d[1] + d[0] + d.slice(2));
    if (sw !== n && d[1] !== '0') cands.add(sw);
  }
  cands.add(n + step);
  if (n - step > 0) cands.add(n - step);
  if (!f.names) {
    cands.add(n + 10 * step);
    if (n * 2 !== n) cands.add(n * 2);
  }
  const ok = [...cands].filter((x) => x !== n && x > 0 && (!f.names || (f.names[x] !== undefined && f.names[x] !== '')) && fieldText(f, x) !== fieldText(f, n));
  return ok.length ? pick(ctx.rng, ok) : null;
}

function buildCheck(ctx: GenCtx, t: TaskTemplate & CheckTemplate): Built | null {
  const target = t.docs[t.target];
  if (!target) return null;
  // 1. The true values (computed fields from the ones before them).
  const num: Record<string, number> = {};
  const values: Record<string, string> = {};
  for (const f of t.fields) {
    if (f.calc) {
      num[f.id] = f.calc(num);
      values[f.id] = fieldText(f, num[f.id]);
    } else if (f.range) {
      const [lo, hi, step = 1] = f.range;
      const k = Math.floor((hi - lo) / step);
      num[f.id] = lo + step * Math.floor(ctx.rng() * (k + 1));
      values[f.id] = fieldText(f, num[f.id]);
    } else {
      values[f.id] = pick(ctx.rng, f.values ?? ['']);
      num[f.id] = numIn(values[f.id]);
    }
  }
  const fdef = (id: string) => t.fields.find((x) => x.id === id);
  const byLower = new Map(t.fields.map((f) => [f.id.toLowerCase(), f.id]));
  const lower = (r: Record<string, string>) => Object.fromEntries(Object.entries(r).map(([k, v]) => [k.toLowerCase(), v]));
  const varies = (f: CheckField) => !!f.calc || !!f.range || (f.values?.length ?? 0) > 1;
  // Fields a reference paper shows (as a field or written into a line).
  const refShows = new Set<string>();
  t.docs.forEach((d, i) => {
    if (i === t.target) return;
    for (const id of d.fields ?? []) refShows.add(id);
    for (const l of d.lines ?? []) for (const m of l.matchAll(/\{([A-Za-z0-9_]+)\}/g)) refShows.add(byLower.get(m[1].toLowerCase()) ?? m[1]);
  });
  const targetShows = new Set([...(target.fields ?? []), ...(target.lines ?? []).flatMap((l) => [...l.matchAll(/\{([A-Za-z0-9_]+)\}/g)].map((m) => byLower.get(m[1].toLowerCase()) ?? m[1]))]);
  // 2. Maybe one deliberate discrepancy: the target shows one wrong value; computed fields on the target follow
  //    the values it shows (the paper is consistent with itself), and the choice is kept only if exactly one
  //    field then disagrees with the other papers (or, for a computed field, with its own sums).
  let wrong: string | null = null;
  let shown: Record<string, string> = { ...values };
  const wrongable = (t.wrongable ?? target.fields ?? []).filter((id) => fdef(id) && varies(fdef(id)!));
  if (wrongable.length && ctx.rng() < t.pWrong) {
    for (const id of shuffle(ctx.rng, wrongable)) {
      const f = fdef(id)!;
      let alt: string | null = null;
      let altNum = NaN;
      if (f.calc || f.range) {
        const m = nearMiss(ctx, f, num[id]);
        if (m === null) continue;
        altNum = m;
        alt = fieldText(f, m);
      } else {
        const others = (f.values ?? []).filter((v) => v !== values[id]);
        if (!others.length) continue;
        alt = pick(ctx.rng, others);
        altNum = numIn(alt);
      }
      const n2: Record<string, number> = { ...num, [id]: altNum };
      const s2: Record<string, string> = { ...values, [id]: alt };
      for (const g of t.fields)
        if (g.calc && g.id !== id) {
          n2[g.id] = g.calc(n2);
          s2[g.id] = fieldText(g, n2[g.id]);
        }
      const differs = [...targetShows].filter((k) => s2[k] !== values[k] && (refShows.has(k) || k === id));
      if (differs.length === 1 && differs[0] === id) {
        wrong = id;
        shown = s2;
        break;
      }
    }
  }
  const label = (id: string) => fdef(id)?.label ?? id;
  const docs: CheckDoc[] = t.docs.map((d, i) => {
    const vals = i === t.target ? shown : values;
    const lines = (d.lines ?? []).map((l) => fill(l, lower(vals)) ?? l);
    const title = d.title ? (fill(d.title, lower(vals)) ?? d.title) : undefined;
    return { kind: d.kind, ...(title ? { title } : {}), ...(d.fields ? { fields: d.fields.map((id) => ({ id, label: label(id), value: vals[id] })) } : {}), ...(lines.length ? { lines } : {}) };
  });
  const spec: TaskSpec = { arch: 'check', docs, target: t.target, wrong };
  if (wrong && ctx.feats.has('multiStep')) {
    const f = fdef(wrong)!;
    let third: string | undefined;
    if (f.calc || f.range) {
      for (let k = 0; k < 6 && !third; k++) {
        const m = nearMiss(ctx, f, num[wrong]);
        const tx = m === null ? null : fieldText(f, m);
        if (tx && tx !== values[wrong] && tx !== shown[wrong]) third = tx;
      }
    } else third = shuffle(ctx.rng, (f.values ?? []).filter((v) => v !== values[wrong!] && v !== shown[wrong!]))[0];
    spec.fixOptions = shuffle(ctx.rng, [values[wrong], shown[wrong], ...(third ? [third] : [])]);
    spec.fix = values[wrong];
  }
  return { say: fillSay(t.say, lower(values)) ?? '', spec };
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
  // Spoken: the person at the desk says it. A call / paper is shown on the phone / the paper (the boss hands it over).
  return { say: t.kind === 'speech' ? qa.q : (t.say ?? ''), spec: { arch: 'respond', ...spec } };
}

function buildForm(ctx: GenCtx, t: TaskTemplate & FormTemplate): Built | null {
  const f = t.slots ? fillSlots(ctx, t.slots, 6) : { values: {} as Record<string, string>, self: undefined };
  if (!f) return null;
  const vals: Record<string, string> = { ...f.values };
  const fields: NonNullable<RespondSpec['fields']> = [];
  for (const fd of t.fields) {
    if (fd.values.length < 2) return null;
    const answer = pick(ctx.rng, fd.values);
    vals[fd.id.toLowerCase()] = answer;
    const others = shuffle(ctx.rng, fd.values.filter((v) => v !== answer)).slice(0, (fd.options ?? 3) - 1);
    fields.push({ id: fd.id, label: fd.label, options: shuffle(ctx.rng, [answer, ...others]), answer });
  }
  const lines: string[] = [];
  for (const l of t.lines) {
    const x = fill(l, vals);
    if (x === null) return null;
    lines.push(x);
  }
  const msg: RespondSpec['msg'] = { kind: t.kind, lines, ...(t.from ? { from: fill(t.from, vals) ?? t.from } : {}), ...(t.subject ? { subject: fill(t.subject, vals) ?? t.subject } : {}) };
  const say = t.kind === 'speech' ? lines.join(' ') : (fillSay(t.say, vals) ?? '');
  return { say, spec: { arch: 'respond', mode: 'form', msg, fields }, person: t.kind === 'speech' ? f.self : undefined };
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
    const open = t.open?.length ? [pick(ctx.rng, t.open)] : [];
    const close = t.close?.length ? [pick(ctx.rng, t.close)] : [];
    const spec: RespondSpec = {
      mode: 'slot',
      msg: { kind: t.kind, lines: [...open, ...want.map((w) => w.text), ...avoid.map((a) => a.text), ...close] },
      slot: { layout: t.layout, rows: t.rows, cols: t.cols, cells: out, answer: answer.id },
    };
    if (slotFits(spec, want.map((w) => w.tag), avoid.map((a) => a.tag)).length !== 1) continue;
    return { say: t.kind === 'speech' ? spec.msg.lines.join(' ') : (t.say ?? ''), spec: { arch: 'respond', ...spec } };
  }
  return null;
}

/** Words (lexicon ids) of a task instance. */
export function instanceWords(data: GameData, inst: TaskInstance): string[] {
  const s = new Set<string>();
  for (const t of inst.texts) for (const id of tokenIds(data.tokens(t))) s.add(id);
  return [...s];
}
