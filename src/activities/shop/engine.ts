import {
  featuresAtStage,
  ingredientWordId,
  ingredientsAtStage,
  type GameData,
} from '../../core/gamedata';
import type { Rng } from '../../core/rng';
import type { LangProgress, ServedResult } from '../../core/save';
import { ensureWord, recordEncounter, recordLapse, recordSuccess } from '../../core/srs';
import { tokenIds } from '../../core/tokenize';
import type { Brew, Evaluation, Issue, OrderInstance } from '../../core/types';
import { planDay } from './dayplan';
import { REP_DELTA, selectReaction, type ChosenReaction } from './reactions';
import { evaluateBrew } from './rules';
import { stageDay } from '../../core/difficulty';

/** Highest stage whose conditions hold today (monotonic: never goes down). */
export function computeStage(data: GameData, p: LangProgress): number {
  let stage = p.stage;
  const day = stageDay(p); // calendar day + stage clock offset (レベル設定 / 進み方); = p.day by default
  for (const s of data.stages) {
    if (s.stage <= stage) continue;
    const ready =
      day >= s.minDay && (p.reputation >= s.minReputation || day >= s.minDay + data.shared.graceDays);
    if (ready && s.stage === stage + 1) stage = s.stage;
  }
  return stage;
}

/** Words that become visible with the shelf / workbench at a stage (labels, not encounters). */
function unlockStageWords(data: GameData, p: LangProgress) {
  for (const ing of ingredientsAtStage(data, p.stage)) {
    const id = ingredientWordId(data, ing);
    if (id) ensureWord(p.words, id, p.day);
  }
  const f = featuresAtStage(data, p.stage);
  if (f.has('temperature')) Object.values(data.content.temperatureWords).forEach((id) => ensureWord(p.words, id, p.day));
  if (f.has('method')) Object.values(data.content.methodWords).forEach((id) => ensureWord(p.words, id, p.day));
}

/** Open the shop for p.day: advance stage, plan customers. Mutates p. */
export function startDay(data: GameData, p: LangProgress, rng: Rng): void {
  const before = p.stage;
  const notes: string[] = [];
  if (p.day === 1 && before === 1) {
    const n = data.stages[0]?.noteJa;
    if (n) notes.push(n);
  }
  p.stage = computeStage(data, p);
  for (const s of data.stages) if (s.stage > before && s.stage <= p.stage && s.noteJa) notes.push(s.noteJa);
  unlockStageWords(data, p);
  const plan = planDay(data, p, rng);
  // Returning customers taken today leave the return list (they re-enter if they fail again).
  const taken = new Set(plan.queue.filter((q) => q.returning).map((q) => q.key));
  p.returns = p.returns.filter((r) => !taken.has(r.instance.key));
  p.today = { day: p.day, queue: plan.queue, index: 0, phase: 'order', results: [], notes, newWords: plan.newWords };
  presentCurrent(data, p);
}

export function currentOrder(p: LangProgress): OrderInstance | null {
  const t = p.today;
  if (!t || t.phase === 'closed') return null;
  return t.queue[t.index] ?? null;
}

/** The customer has spoken: count the order's words as encountered. */
export function presentCurrent(data: GameData, p: LangProgress): void {
  const o = currentOrder(p);
  if (!o) return;
  recordEncounter(p.words, tokenIds(data.tokens(o.text)), p.day, o.text);
}

/** Lexicon ids a mistake points at, limited to words that appear in the order. */
export function implicatedWords(data: GameData, order: OrderInstance, issues: Issue[]): string[] {
  const inOrder = new Set(tokenIds(data.tokens(order.text)));
  const ids = new Set<string>();
  const numbers = new Set(Object.values(data.content.numbers));
  for (const i of issues) {
    if (i.ing) {
      const w = ingredientWordId(data, i.ing);
      if (w) ids.add(w);
    }
    if (i.tag && data.content.tagWords[i.tag]) ids.add(data.content.tagWords[i.tag]!);
    if (i.kind === 'wrong_temp') Object.values(data.content.temperatureWords).forEach((w) => ids.add(w));
    if (i.kind === 'wrong_method') Object.values(data.content.methodWords).forEach((w) => ids.add(w));
    if (i.kind === 'too_much' || i.kind === 'too_little') inOrder.forEach((w) => numbers.has(w) && ids.add(w));
  }
  const hit = [...ids].filter((id) => inOrder.has(id));
  return hit.length ? hit : [...inOrder];
}

export interface ServeOutcome {
  evaluation: Evaluation;
  reaction: ChosenReaction;
  repDelta: number;
}

/** Serve the brew to the current customer. Mutates p. */
export function serve(data: GameData, p: LangProgress, brew: Brew, rng: Rng): ServeOutcome | null {
  const t = p.today;
  const order = currentOrder(p);
  if (!t || !order || t.phase !== 'order') return null;
  const ev = evaluateBrew(order.rule, brew, data.ing);
  const reaction = selectReaction(data, ev, order, p.stage, rng);
  let repDelta = REP_DELTA[ev.outcome];
  if (ev.outcome === 'perfect' && order.returning) repDelta += 1;
  p.reputation = Math.max(0, p.reputation + repDelta);
  p.stats.served++;

  const ids = tokenIds(data.tokens(order.text));
  if (ev.outcome === 'perfect') {
    p.stats.perfect++;
    ids.forEach((id) => recordSuccess(p.words, id, p.day));
  } else {
    implicatedWords(data, order, ev.issues).forEach((id) => recordLapse(p.words, id, p.day));
    // Unsatisfied customers come back on a later day (once per order key).
    if (!p.returns.some((r) => r.instance.key === order.key)) {
      p.returns.push({ instance: { ...order, returning: false }, day: p.day + 1 });
    }
  }
  if (order.source.type === 'authored') {
    const log = (p.orders[order.source.id] ??= { attempts: 0, perfect: false });
    log.attempts++;
    if (ev.outcome === 'perfect') log.perfect = true;
  }
  recordEncounter(p.words, tokenIds(data.tokens(reaction.text)), p.day, reaction.text);

  const result: ServedResult = {
    key: order.key,
    customer: order.customer,
    outcome: ev.outcome,
    repDelta,
    reaction: reaction.text,
    face: reaction.face,
  };
  t.results.push(result);
  t.phase = 'reaction';
  return { evaluation: ev, reaction, repDelta };
}

/** Move on to the next customer (or close the day). */
export function nextCustomer(data: GameData, p: LangProgress): void {
  const t = p.today;
  if (!t || t.phase !== 'reaction') return;
  t.index++;
  if (t.index >= t.queue.length) t.phase = 'closed';
  else {
    t.phase = 'order';
    presentCurrent(data, p);
  }
}

/** After the summary: advance the calendar. The next startDay plans the new day. */
export function endDay(p: LangProgress): void {
  if (!p.today || p.today.phase !== 'closed') return;
  p.day++;
  p.today = null;
}

/** Reading a recipe-book page counts its words as encountered, at most once per day per page. */
export function viewPage(data: GameData, p: LangProgress, pageId: string): void {
  const page = data.content.pages.find((pg) => pg.id === pageId);
  if (!page || p.pageViews[pageId] === p.day) return;
  p.pageViews[pageId] = p.day;
  for (const text of [page.title, ...page.lines.map((l) => l.text)]) {
    recordEncounter(p.words, tokenIds(data.tokens(text)), p.day, text);
  }
}

export function pagesAtStage(data: GameData, stage: number) {
  return data.content.pages.filter((pg) => pg.stage <= stage);
}
