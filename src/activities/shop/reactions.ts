import { capitalizeFirst, ingredientWordId, wordMarkup, type GameData } from '../../core/gamedata';
import type { Rng } from '../../core/rng';
import type { Evaluation, Face, Issue, OrderInstance, Outcome, Reaction, ReactionKind } from '../../core/types';

export interface ChosenReaction {
  reactionId: string;
  kind: ReactionKind;
  /** Content text with markup (tokenizable). */
  text: string;
  face: Face;
}

/**
 * Reputation change per shop customer (a returning customer served perfectly adds +1 more).
 * Kept small so reputation tracks the stage thresholds in content (about 3–5 points a day for a
 * player who gets most cups right) instead of growing into the thousands.
 */
export const REP_DELTA: Record<Outcome, number> = { perfect: 1, minor: 0, fail: -1, bad: -2 };

const PH = /\{(ing|Ing|tag|Tag|temp|Temp|method|Method)\}/g;

function placeholderValue(data: GameData, key: string, issue: Issue | null): string | null {
  const lower = key.toLowerCase();
  let id: string | undefined;
  if (lower === 'ing') id = issue?.ing ? ingredientWordId(data, issue.ing) : undefined;
  else if (lower === 'tag') id = issue?.tag ? data.content.tagWords[issue.tag] : undefined;
  else if (lower === 'temp') id = issue?.temp ? data.content.temperatureWords[issue.temp] : undefined;
  else if (lower === 'method') id = issue?.method ? data.content.methodWords[issue.method] : undefined;
  if (!id) return null;
  const m = wordMarkup(data, id);
  return key[0] === key[0].toUpperCase() ? capitalizeFirst(m) : m;
}

export function fillReaction(data: GameData, r: Reaction, issue: Issue | null): string | null {
  let failed = false;
  const text = r.text.replace(PH, (_m, key: string) => {
    const v = placeholderValue(data, key, issue);
    if (v === null) failed = true;
    return v ?? '';
  });
  return failed ? null : text;
}

/** Specificity score, or -1 if the reaction's conditions do not hold. */
function matchScore(r: Reaction, issue: Issue | null, order: OrderInstance): number {
  const w = r.when;
  if (!w) return 0;
  let s = 0;
  if (w.returning !== undefined) {
    if (!!order.returning !== w.returning) return -1;
    s++;
  }
  if (w.symptom !== undefined) {
    if (!!order.symptom !== w.symptom) return -1;
    s++;
  }
  if (w.customer) {
    if (order.customer !== w.customer) return -1;
    s++;
  }
  if (w.ings) {
    if (!issue?.ing || !w.ings.includes(issue.ing)) return -1;
    s++;
  }
  if (w.tags) {
    if (!issue?.tag || !w.tags.includes(issue.tag)) return -1;
    s++;
  }
  return s;
}

function chooseFrom(
  data: GameData,
  kind: ReactionKind,
  issue: Issue | null,
  order: OrderInstance,
  stage: number,
  rng: Rng,
): ChosenReaction | null {
  const cands: { r: Reaction; text: string; score: number }[] = [];
  for (const r of data.content.reactions) {
    if (r.kind !== kind || r.stage > stage) continue;
    const score = matchScore(r, issue, order);
    if (score < 0) continue;
    const text = fillReaction(data, r, issue);
    if (text === null) continue;
    cands.push({ r, text, score });
  }
  if (!cands.length) return null;
  const best = Math.max(...cands.map((c) => c.score));
  const top = cands.filter((c) => c.score === best);
  const c = top[Math.floor(rng() * top.length)];
  return { reactionId: c.r.id, kind, text: c.text, face: c.r.face };
}

/**
 * Pick the customer's line for an evaluation. Tries the primary issue first, then the
 * other issues, then the generic 'any_fail' line. Never produces Japanese.
 */
export function selectReaction(
  data: GameData,
  ev: Evaluation,
  order: OrderInstance,
  stage: number,
  rng: Rng,
): ChosenReaction {
  if (!ev.primary) {
    const r = chooseFrom(data, 'perfect', null, order, stage, rng);
    if (r) return r;
  } else {
    for (const issue of ev.issues) {
      const r = chooseFrom(data, issue.kind, issue, order, stage, rng);
      if (r) return r;
    }
    const r = chooseFrom(data, 'any_fail', ev.primary, order, stage, rng);
    if (r) return r;
  }
  return { reactionId: '', kind: ev.primary ? 'any_fail' : 'perfect', text: '…', face: ev.primary ? 'sad' : 'happy' };
}
