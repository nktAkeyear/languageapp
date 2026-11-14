/**
 * Deliveries. A customer leaves a slip in the target language (where / when / to whom / how);
 * the player picks the house on the town map, a time slot, knocks, and hands the parcel over.
 * The recipient's reaction (target language) and reputation are the only feedback.
 */
import { wordMarkup, type GameData } from '../../core/gamedata';
import { pick, shuffle, type Rng } from '../../core/rng';
import type { LangProgress } from '../../core/save';
import { recordEncounter, recordLapse, recordSuccess } from '../../core/srs';
import type { Face, Outcome } from '../../core/types';
import type {
  AbsentAction,
  DeliveryDay,
  DeliveryFeature,
  DeliveryIssueKind,
  DeliveryLevel,
  DeliveryReactionKind,
  DeliveryShared,
  PersonId,
  Period,
  Relation,
  SlipInstance,
  SlipLine,
  SlipSpec,
  SlipTime,
} from '../../core/townTypes';
import { chooseText, fill, numberText, textWords, townOf, type Town } from '../town/text';
import { clockNumber, descriptionsOf, evaluateDelivery, ruleFor, slotsFor, witnessChoice } from './rules';

/** Reputation change per delivery (one a day at most, so a perfect one counts double a cup). */
export const DELIVERY_REP_DELTA: Record<Outcome, number> = { perfect: 2, minor: 0, fail: -1, bad: -2 };
export function deliveryLevel(d: DeliveryShared, runs: number): DeliveryLevel {
  const lv = [...d.levels].sort((a, b) => a.level - b.level);
  let cur = lv[0];
  for (const l of lv) if (runs >= l.minRuns) cur = l;
  return cur;
}

export function deliveryFeatures(d: DeliveryShared, level: number): DeliveryFeature[] {
  const f = new Set<DeliveryFeature>();
  for (const l of d.levels) if (l.level <= level) l.features.forEach((x) => f.add(x));
  return [...f];
}

export function periodOf(d: DeliveryShared, hour: number): Period {
  return d.slots.find((s) => s.hour === hour)?.period ?? (hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening');
}

// ---------------------------------------------------------------------------
// Slip text
// ---------------------------------------------------------------------------

/** All candidate texts for one slip part (several phrasings); null if a part cannot be written. */
export function partTexts(data: GameData, town: Town, spec: SlipSpec, part: SlipLine['part']): string[] | null {
  const D = town.text.delivery;
  const d = town.shared.delivery;
  const fillAll = (pats: string[] | undefined, v: Record<string, string | null>) => {
    const out = (pats ?? []).map((t) => fill(t, v)).filter((t): t is string => !!t);
    return out.length ? out : null;
  };
  const person = (id?: PersonId) => (id ? wordMarkup(data, D.personWords[id]) : null);
  switch (part) {
    case 'dest':
      return fillAll(D.dest[spec.dest.rel], { p: wordMarkup(data, D.placeWords[spec.dest.landmark]) });
    case 'time': {
      const t = spec.time;
      if (!t) return null;
      if (t.kind === 'period') return fillAll(D.time.period[t.period], {});
      return fillAll(D.time[t.kind], { n: numberText(town, clockNumber(t.hour)), pp: wordMarkup(data, D.periodWords[periodOf(d, t.hour)]) });
    }
    case 'give':
      if (!spec.give) return null;
      return spec.avoid ? fillAll(D.giveNot, { p: person(spec.give), q: person(spec.avoid) }) : fillAll(D.give, { p: person(spec.give) });
    case 'knock':
      return spec.knocks ? fillAll(D.knock[spec.knocks], {}) : null;
    case 'absent':
      return spec.absent ? fillAll(D.absent[spec.absent], {}) : null;
  }
}

const PARTS: SlipLine['part'][] = ['dest', 'time', 'give', 'knock', 'absent'];

/** Write a slip, choosing phrasings that serve hidden review. Null if any requested part is unwritable. */
export function writeSlip(data: GameData, p: LangProgress, town: Town, spec: SlipSpec, rng: Rng): SlipLine[] | null {
  const lines: SlipLine[] = [];
  for (const part of PARTS) {
    const wanted =
      part === 'dest' || (part === 'time' && spec.time) || (part === 'give' && spec.give) || (part === 'knock' && spec.knocks) || (part === 'absent' && spec.absent);
    if (!wanted) continue;
    const cands = partTexts(data, town, spec, part);
    if (!cands) return null;
    lines.push({ part, text: chooseText(data, p, cands, rng, 2)! });
  }
  return lines;
}

// ---------------------------------------------------------------------------
// Spec generation
// ---------------------------------------------------------------------------

export function relationsFor(features: DeliveryFeature[]): Relation[] {
  const rels: Relation[] = ['at'];
  if (features.includes('relations')) rels.push('next_to', 'behind', 'across');
  if (features.includes('leftRight')) rels.push('left', 'right');
  return rels;
}

/** Random slip spec using only the given features. Always resolvable on the map. */
export function generateSpec(d: DeliveryShared, features: DeliveryFeature[], rng: Rng): SlipSpec | null {
  const has = (f: DeliveryFeature) => features.includes(f);
  const rels = relationsFor(features);
  const toHouse = rels.length > 1 && rng() < 0.85;
  let dest: SlipSpec['dest'] | null = null;
  if (toHouse) {
    const houses = shuffle(
      rng,
      d.map.filter((c) => !c.landmark),
    );
    for (const h of houses) {
      const ds = descriptionsOf(d.map, h.id, rels.filter((r) => r !== 'at'));
      if (ds.length) {
        dest = pick(rng, ds);
        break;
      }
    }
  }
  if (!dest) {
    const lms = d.map.filter((c) => c.landmark);
    dest = { rel: 'at', landmark: pick(rng, lms).landmark! };
  }
  const spec: SlipSpec = { dest };
  // time
  const kinds: SlipTime['kind'][] = ['period'];
  if (has('clock')) kinds.push('at', 'at');
  if (has('beforeAfter')) kinds.push('before', 'after');
  const kind = pick(rng, kinds);
  const hours = d.slots.map((s) => s.hour);
  if (kind === 'period') spec.time = { kind, period: pick(rng, [...new Set(d.slots.map((s) => s.period))]) };
  else {
    const ok = hours.filter((h) => {
      const t: SlipTime = { kind, hour: h };
      const n = slotsFor(d.slots, t)?.length ?? 0;
      return n > 0 && n < hours.length - 1;
    });
    spec.time = { kind, hour: pick(rng, kind === 'at' ? hours : ok.length ? ok : hours) };
  }
  if (dest.rel !== 'at') {
    if (has('person') && rng() < 0.75) {
      spec.give = pick(rng, d.persons).id;
      if (has('avoid') && rng() < 0.5) spec.avoid = pick(rng, d.persons.filter((x) => x.id !== spec.give)).id;
    }
    if (has('knock') && rng() < 0.5) spec.knocks = pick(rng, [2, 3]);
    if (has('absent') && rng() < 0.5) {
      spec.absent = pick(rng, ['door', 'neighbour'] as const);
      spec.home = rng() < 0.4;
    }
  }
  return ruleFor(d, spec) ? spec : null;
}

// ---------------------------------------------------------------------------
// Planning
// ---------------------------------------------------------------------------

function instance(data: GameData, p: LangProgress, town: Town, spec: SlipSpec, source: SlipInstance['source'], rng: Rng): SlipInstance | null {
  const rule = ruleFor(town.shared.delivery, spec);
  const lines = rule ? writeSlip(data, p, town, spec, rng) : null;
  if (!rule || !lines) return null;
  const sig = JSON.stringify(spec);
  return {
    key: source.type === 'authored' ? source.id : `${source.id}:${sig}`,
    source,
    recipient: pick(rng, town.text.delivery.recipients.filter((r) => !r.storyOnly)).id,
    lines,
    spec,
    rule,
    home: spec.absent ? spec.home !== false : true,
  };
}

/** Plan today's delivery: next unfinished curriculum slip, else the generated slip best for review. */
export function planDelivery(data: GameData, p: LangProgress, rng: Rng): DeliveryDay | null {
  const town = townOf(data);
  if (!town) return null;
  const d = town.shared.delivery;
  const level = deliveryLevel(d, p.town.deliveryRuns);
  const features = deliveryFeatures(d, level.level);
  let slip: SlipInstance | null = null;
  const next = [...d.curriculum]
    .filter((s) => s.level <= level.level && !p.town.slips[s.id]?.perfect)
    .sort((a, b) => a.level - b.level || a.seq - b.seq)[0];
  if (next) slip = instance(data, p, town, next, { type: 'authored', id: next.id }, rng);
  if (!slip) {
    let best: { s: SlipInstance; score: number } | null = null;
    for (let i = 0; i < 24; i++) {
      const spec = generateSpec(d, features, rng);
      const s = spec && instance(data, p, town, spec, { type: 'template', id: `gen${level.level}` }, rng);
      if (!s) continue;
      const ids = s.lines.flatMap((l) => textWords(data, l.text));
      const fresh = ids.filter((id) => !p.words[id]).length;
      const parts = s.lines.length;
      let score = ids.reduce((acc, id) => acc + (p.words[id] ? Math.min(6, (p.words[id].due <= p.day ? 3 : 0) + (p.words[id].wrong > p.words[id].correct ? 2 : 0)) : 0), 0);
      score += parts * 1.5 + rng() * 3 - Math.max(0, fresh - 1) * 8;
      if (!best || score > best.score) best = { s, score };
    }
    slip = best?.s ?? null;
  }
  if (!slip) return null;
  // People who may come to the door: the named ones plus one or two others.
  const named = [slip.spec.give, slip.spec.avoid].filter((x): x is PersonId => !!x);
  const others = shuffle(rng, d.persons.map((x) => x.id).filter((x) => !named.includes(x)));
  const household = shuffle(rng, [...named, ...others.slice(0, Math.max(1, 3 - named.length))]);
  for (const l of slip.lines) recordEncounter(p.words, textWords(data, l.text), p.day, l.text);
  // The map's signs are read once per delivery day (like a recipe-book page).
  for (const c of d.map)
    if (c.landmark) {
      const sign = wordMarkup(data, town.text.delivery.placeWords[c.landmark]);
      recordEncounter(p.words, textWords(data, sign), p.day, sign);
    }
  return {
    level: level.level,
    features,
    slip,
    phase: 'plan',
    choice: { place: null, hour: null, knocks: 0, person: null, absent: null },
    household,
    result: null,
  };
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

function dd(p: LangProgress): DeliveryDay | null {
  return p.townDay?.delivery ?? null;
}

export function choosePlace(p: LangProgress, place: string): void {
  const x = dd(p);
  if (x?.phase === 'plan') x.choice.place = place;
}

export function chooseHour(p: LangProgress, hour: number): void {
  const x = dd(p);
  if (x?.phase === 'plan') x.choice.hour = hour;
}

/** Set off with the parcel (place + time chosen). */
export function depart(p: LangProgress): boolean {
  const x = dd(p);
  if (!x || x.phase !== 'plan' || !x.choice.place || x.choice.hour === null) return false;
  x.phase = 'knock';
  return true;
}

/** Knock n times. At the wrong house somebody always answers. */
export function knock(p: LangProgress, n: number): void {
  const x = dd(p);
  if (!x || x.phase !== 'knock' || n < 1) return;
  x.choice.knocks = n;
  x.phase = 'door';
}

/** Is somebody coming to the door? */
export function someoneHome(x: DeliveryDay): boolean {
  return x.choice.place !== x.slip.rule.place || x.slip.home;
}

/** Values for reaction placeholders: {p} = person to give to, {q} = person to avoid. */
export function reactionValues(data: GameData, town: Town, spec: SlipSpec): Record<string, string | null> {
  const w = (id?: PersonId) => (id ? wordMarkup(data, town.text.delivery.personWords[id]) : null);
  return { p: w(spec.give), q: w(spec.avoid) };
}

function reactionFor(data: GameData, p: LangProgress, town: Town, x: DeliveryDay, kinds: DeliveryReactionKind[], rng: Rng): { text: string; face: Face } {
  const values = reactionValues(data, town, x.slip.spec);
  for (const k of kinds) {
    const cands = town.text.delivery.reactions
      .filter((r) => r.kind === k && r.level <= x.level)
      .map((r) => ({ r, text: fill(r.text, values) }))
      .filter((c): c is { r: (typeof town.text.delivery.reactions)[0]; text: string } => !!c.text);
    if (!cands.length) continue;
    const text = chooseText(data, p, cands.map((c) => c.text), rng, 2)!;
    return { text, face: cands.find((c) => c.text === text)!.r.face };
  }
  return { text: '…', face: 'neutral' };
}

const ISSUE_PART: Record<DeliveryIssueKind, SlipLine['part']> = {
  wrong_place: 'dest',
  too_early: 'time',
  too_late: 'time',
  wrong_time: 'time',
  wrong_person: 'give',
  avoided_person: 'give',
  wrong_absent: 'absent',
  wrong_knock: 'knock',
};

/** Hand the parcel to a person, or (nobody home) leave it / give it to the neighbour / take it back. */
export function handOver(data: GameData, p: LangProgress, to: { person?: PersonId; absent?: AbsentAction }, rng: Rng): void {
  const town = townOf(data);
  const x = dd(p);
  if (!town || !x || x.phase !== 'door') return;
  x.choice.person = to.person ?? null;
  x.choice.absent = to.absent ?? null;
  const home = x.slip.home;
  const ev = evaluateDelivery(x.slip.rule, x.choice, home);
  const kinds: DeliveryReactionKind[] = ev.issues.length
    ? [...ev.issues, 'any_fail']
    : home
      ? ['perfect']
      : ['perfect_absent', 'perfect'];
  const r = reactionFor(data, p, town, x, kinds, rng);
  const repDelta = DELIVERY_REP_DELTA[ev.outcome];
  const tip = ev.outcome === 'perfect' ? town.shared.delivery.tip : 0;
  p.reputation = Math.max(0, p.reputation + repDelta);
  p.town.money += tip;
  // Hidden SRS: a perfect delivery confirms every slip word; a mistake points at its line.
  if (ev.outcome === 'perfect') x.slip.lines.forEach((l) => textWords(data, l.text).forEach((id) => recordSuccess(p.words, id, p.day)));
  else
    for (const i of ev.issues) {
      const line = x.slip.lines.find((l) => l.part === ISSUE_PART[i]);
      if (line) textWords(data, line.text).forEach((id) => recordLapse(p.words, id, p.day));
    }
  recordEncounter(p.words, textWords(data, r.text), p.day, r.text);
  if (x.slip.source.type === 'authored') {
    const log = (p.town.slips[x.slip.source.id] ??= { attempts: 0, perfect: false });
    log.attempts++;
    if (ev.outcome === 'perfect') log.perfect = true;
  }
  x.result = { outcome: ev.outcome, issues: ev.issues, reaction: r.text, face: r.face, repDelta, tip };
  x.phase = 'result';
  p.town.deliveryRuns++;
  p.town.lastDay.delivery = p.day;
}

/** Play the whole delivery (simulator / tests). `wrong` makes a deliberate mistake. */
export function solveDelivery(data: GameData, p: LangProgress, rng: Rng, wrong: 'none' | 'place' | 'time' = 'none'): void {
  const x = dd(p);
  const town = townOf(data);
  if (!x || !town || x.phase !== 'plan') return;
  const w = witnessChoice(x.slip.rule, x.slip.home, town.shared.delivery.slots);
  if (wrong === 'place') w.place = town.shared.delivery.map.find((c) => c.id !== w.place)!.id;
  if (wrong === 'time') w.hour = town.shared.delivery.slots.map((s) => s.hour).find((h) => !(x.slip.rule.slots ?? []).includes(h)) ?? w.hour;
  choosePlace(p, w.place!);
  chooseHour(p, w.hour!);
  depart(p);
  knock(p, w.knocks || 1);
  const home = someoneHome(x);
  handOver(data, p, home ? { person: w.person ?? x.household[0] } : { absent: w.absent ?? 'back' }, rng);
}
