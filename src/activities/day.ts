/**
 * Day orchestration: a day is a sequence of activity segments (market → shop → delivery),
 * chosen by the town planner. Before the town activities open, a day is exactly the
 * Phase 1 shop day.
 */
import type { GameData } from '../core/gamedata';
import type { Rng } from '../core/rng';
import type { LangProgress } from '../core/save';
import { recordEncounter } from '../core/srs';
import type { ActivityKind, TownActivity, TownDayState, TownUnlock } from '../core/townTypes';
import type { Brew, IngredientId } from '../core/types';
import { planDelivery, deliveryLevel } from './delivery/engine';
import { ingredientMarkup, marketLevel, planMarket } from './market/engine';
import { currentOrder, endDay, serve, startDay, type ServeOutcome } from './shop/engine';
import { chooseText, fill, textWords, townOf, type Town } from './town/text';
import { storyAfterServe, storyEndDay, storyPlanShop, storyPlanTown } from '../story/engine';
import { difficultyEndDay, difficultyOnServe, difficultyStartDay, stageDay } from '../core/difficulty';

/** Is the activity open by now? (day + reputation, or grace days after minDay — no hard gate) */
export function unlockReady(u: TownUnlock, day: number, reputation: number): boolean {
  return day >= u.minDay && (reputation >= u.minReputation || day >= u.minDay + u.graceDays);
}

/**
 * Should the activity run today? The first day it opens it always runs, then with probability
 * `chance`, and at the latest `maxGap` days after its last run.
 */
export function wantToday(u: TownUnlock, p: LangProgress, act: TownActivity, rng: Rng): boolean {
  const opened = p.town.unlocked[act];
  if (opened === undefined) return false;
  const last = p.town.lastDay[act];
  if (opened === p.day || last === undefined) return true;
  if (p.day - last >= u.maxGap) return true;
  return rng() < u.chance;
}

/** Plan the segments of the day. Mutates p.town.unlocked; returns notes for newly opened activities. */
export function planSegments(town: Town | null, p: LangProgress, rng: Rng): { segments: ActivityKind[]; notes: string[] } {
  const notes: string[] = [];
  const segments: ActivityKind[] = [];
  if (!town) return { segments: ['shop'], notes };
  const units: [TownActivity, TownUnlock][] = [
    ['market', town.shared.market.unlock],
    ['delivery', town.shared.delivery.unlock],
  ];
  for (const [act, u] of units) {
    if (p.town.unlocked[act] === undefined && unlockReady(u, stageDay(p), p.reputation)) {
      p.town.unlocked[act] = p.day;
      notes.push(u.noteJa);
      if (act === 'market') p.town.money = Math.max(p.town.money, town.shared.market.startMoney);
    }
  }
  if (wantToday(town.shared.market.unlock, p, 'market', rng)) segments.push('market');
  segments.push('shop');
  if (wantToday(town.shared.delivery.unlock, p, 'delivery', rng)) segments.push('delivery');
  return { segments, notes };
}

/** Level notes (Japanese) when a market / delivery level is reached for the first time today. */
function levelNotes(town: Town, p: LangProgress, segments: ActivityKind[]): string[] {
  const out: string[] = [];
  if (segments.includes('market')) {
    const l = marketLevel(town.shared.market, p.town.marketRuns);
    if (l.noteJa && l.minRuns === p.town.marketRuns && l.minRuns > 0) out.push(l.noteJa);
  }
  if (segments.includes('delivery')) {
    const l = deliveryLevel(town.shared.delivery, p.town.deliveryRuns);
    if (l.noteJa && l.minRuns === p.town.deliveryRuns && l.minRuns > 0) out.push(l.noteJa);
  }
  return out;
}

/** Open the day: the shop plans its customers first (the market needs them), then the town. */
export function startTownDay(data: GameData, p: LangProgress, rng: Rng): void {
  difficultyStartDay(data, p); // metrics: today's accumulator (due words, confirmed count)
  startDay(data, p, rng);
  storyPlanShop(data, p, rng); // story: a regular's visit joins the queue before the market plans
  const town = townOf(data);
  const { segments, notes } = planSegments(town, p, rng);
  const td: TownDayState = { day: p.day, segments, seg: 0, notes, stock: {}, moneyStart: p.town.money };
  if (town) {
    td.notes.push(...levelNotes(town, p, segments));
    if (segments.includes('market')) {
      const md = planMarket(data, p, p.today!.queue, rng);
      if (md) {
        td.market = md;
        // Until the shopping is done, today's short goods are empty.
        for (const l of md.lines) td.stock[l.good] = 0;
      } else td.segments = td.segments.filter((s) => s !== 'market');
    }
    if (segments.includes('delivery')) {
      const dd = planDelivery(data, p, rng);
      if (dd) td.delivery = dd;
      else td.segments = td.segments.filter((s) => s !== 'delivery');
    }
  }
  // Notes appear in the first segment; the shop shows its own when it comes first.
  if (td.segments[0] === 'shop' && p.today) p.today.notes.push(...td.notes);
  p.townDay = td;
  storyPlanTown(data, p, rng); // story: a regular's delivery
}

/** Make sure a running day has its segment state (saves from v1 continue as shop-only days). */
export function ensureTownDay(data: GameData, p: LangProgress, rng: Rng): void {
  if (!p.today) startTownDay(data, p, rng);
  else if (!p.townDay || p.townDay.day !== p.day) p.townDay = { day: p.day, segments: ['shop'], seg: 0, notes: [], stock: {}, moneyStart: p.town.money };
  storyPlanShop(data, p, rng); // story (idempotent per day): a resumed / migrated day joins in
  storyPlanTown(data, p, rng);
}

export function currentSegment(p: LangProgress): ActivityKind {
  const td = p.townDay;
  return td?.segments[td.seg] ?? 'shop';
}

export function hasNextSegment(p: LangProgress): boolean {
  const td = p.townDay;
  return !!td && td.seg < td.segments.length - 1;
}

/** Is the current segment finished (so the player may move on)? */
export function segmentDone(p: LangProgress): boolean {
  const seg = currentSegment(p);
  if (seg === 'market') return !!p.townDay?.market?.done;
  if (seg === 'delivery') return p.townDay?.delivery?.phase === 'result';
  return p.today?.phase === 'closed';
}

export function nextSegment(p: LangProgress): void {
  const td = p.townDay;
  if (!td || !hasNextSegment(p) || !segmentDone(p)) return;
  td.seg++;
}

/** Remaining portions of a tracked good (undefined = unlimited today). */
export function stockOf(p: LangProgress, ing: IngredientId): number | undefined {
  return p.townDay?.stock[ing];
}

/**
 * Serve in the shop, with today's stock: tracked goods are used up portion by portion; a customer
 * whose order needs more of a good than is left reacts to that (target language). Earns coins.
 */
export function serveInTown(data: GameData, p: LangProgress, brew: Brew, rng: Rng): ServeOutcome | null {
  const order = currentOrder(p);
  const td = p.townDay;
  const town = townOf(data);
  const outOf: IngredientId[] = [];
  if (order && td)
    for (const r of order.rule.require ?? []) {
      const left = td.stock[r.ing];
      if (left !== undefined && left < Math.max(1, r.min ?? 1) && (brew.counts[r.ing] ?? 0) < Math.max(1, r.min ?? 1)) outOf.push(r.ing);
    }
  const out = serve(data, p, brew, rng);
  if (!out) return out;
  if (order) difficultyOnServe(data, p, order, out.evaluation.outcome); // metrics: first-try accuracy
  if (td) {
    for (const [ing, n] of Object.entries(brew.counts) as [IngredientId, number][])
      if (n > 0 && td.stock[ing] !== undefined) td.stock[ing] = Math.max(0, td.stock[ing]! - n);
  }
  if (town) {
    p.town.money += town.shared.market.income[out.evaluation.outcome];
    if (outOf.length && out.evaluation.outcome !== 'perfect') {
      const ing = ingredientMarkup(data, outOf[0]);
      const cands = town.text.market.stockReactions
        .map((r) => ({ r, text: ing ? fill(r.text, { ing }) : null }))
        .filter((x): x is { r: (typeof town.text.market.stockReactions)[0]; text: string } => !!x.text);
      if (cands.length) {
        const text = chooseText(data, p, cands.map((c) => c.text), rng, 2)!;
        const face = cands.find((c) => c.text === text)!.r.face;
        const res = p.today!.results[p.today!.results.length - 1];
        res.reaction = text;
        res.face = face;
        out.reaction = { ...out.reaction, text, face, reactionId: 'stock' };
        recordEncounter(p.words, textWords(data, text), p.day, text);
      }
    }
  }
  storyAfterServe(data, p, out, rng); // story: a regular's reaction line / small talk
  return out;
}

/** After the last segment: advance the calendar; the next startTownDay plans the new day. */
export function endTownDay(p: LangProgress, data?: GameData): void {
  if (p.today?.phase !== 'closed') return;
  if (hasNextSegment(p)) return;
  if (currentSegment(p) !== 'shop' && !segmentDone(p)) return;
  if (data) storyEndDay(data, p); // story: evening scene + the night's ledger
  if (data) difficultyEndDay(data, p); // metrics record, adaptive controller, stage clock
  endDay(p);
  p.townDay = null;
}

/** Debug / simulator description of the day's plan. */
export function describeDay(p: LangProgress): string {
  const td = p.townDay;
  return td ? td.segments.join(' → ') : 'shop';
}

