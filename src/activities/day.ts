/**
 * Day orchestration. A working day has three parts (v6):
 *
 * - 0 始業前 (before opening): the day starts at the workplace — the tea house: the shop is prepared, the
 *   shopping note read; on a market day the player may walk to the market and back as often as they like
 *   (the goods go on today's shelf), read the notes, open the books, then 「店を開ける」.
 * - 1 業務中 (working hours): the customers come. Nobody can leave the counter to shop: when the shelf runs
 *   short the player can order goods by delivery (the same stalls, words and payment as at the market, plus a
 *   delivery fee, `DELIVERY_FEE`); they reach the shop when the next customer comes in.
 * - 2 業務後 (after closing): the shop is closed. The day's house delivery (the tea house's own activity), the
 *   evening market (goods bought now are kept in the back room for tomorrow), the catalogue, the town (a second
 *   shift at a workplace open in the evening), then home: the night's ledger and the next day.
 *
 * Which activities a day has is still planned as `segments` (market / shop / delivery), by the town planner;
 * the tea house's part and where the player is (`part`, `at`) say where in the day they are. Before the town
 * activities open, a day is exactly the Phase 1 shop day (始業前 → 業務中 → 業務後).
 */
import type { GameData } from '../core/gamedata';
import type { Rng } from '../core/rng';
import type { LangProgress } from '../core/save';
import { recordEncounter } from '../core/srs';
import type { ActivityKind, DayPart, MarketMode, TownActivity, TownDayState, TownUnlock } from '../core/townTypes';
import type { Brew, IngredientId } from '../core/types';
import { planDelivery, deliveryLevel } from './delivery/engine';
import { ingredientMarkup, marketLevel, planMarket } from './market/engine';
import { currentOrder, endDay, nextCustomer, serve, startDay, type ServeOutcome } from './shop/engine';
import { chooseText, fill, textWords, townOf, type Town } from './town/text';
import { storyAfterServe, storyDeferAll, storyEndDay, storyPlanShop, storyPlanTown } from '../story/engine';
import { renoAfterServe, renoCarry, renoEndDay, renoPlanShop, renoPlanTown } from '../renovation/engine';
import { difficultyEndDay, difficultyOnServe, difficultyStartDay, repairAssumed, stageDay } from '../core/difficulty';
import { checkRankUp, jobById, jobDay, jobsEndDay, jobsEnsureDay, jobsStartDay, jobsTeaPart, TEAHOUSE } from '../jobs/engine';

/** The three parts of a working day (HUD, notes). */
export const DAY_PARTS = ['始業前', '業務中', '業務後'] as const;

/** Coins a delivery of supplies during working hours costs on top of the goods (one order = one errand). */
export const DELIVERY_FEE = 4;

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

/** Goods bought after closing yesterday (kept in the back room): today is a market day for them. */
function pantryOf(p: LangProgress): Partial<Record<IngredientId, number>> {
  const out: Partial<Record<IngredientId, number>> = {};
  for (const [ing, n] of Object.entries(p.town.pantry ?? {}) as [IngredientId, number][]) if (n > 0) out[ing] = n;
  return out;
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
  // Goods bought last night are tracked today: the shop counts what it has (rng drawn as before).
  const want = wantToday(town.shared.market.unlock, p, 'market', rng);
  if (want || (p.town.unlocked.market !== undefined && Object.keys(pantryOf(p)).length)) segments.push('market');
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

/** Coins a cup costs on a day the shop serves from the back room (opened late, after another job). */
export const BACK_ROOM_COST = 1;

/** Open the day at the workplace: the shop plans its customers first (the market needs them), then the town. */
export function startTownDay(data: GameData, p: LangProgress, rng: Rng): void {
  difficultyStartDay(data, p); // metrics: today's accumulator (due words, confirmed count)
  startDay(data, p, rng);
  const shopNotes = p.today?.notes.length ?? 0;
  renoPlanShop(data, p, rng); // renovation: yesterday's orders arrive; a bench brings one more customer
  // The arrival note belongs with the day's first notice.
  const arrivals = p.today?.notes.splice(shopNotes) ?? [];
  storyPlanShop(data, p, rng); // story: a regular's visit joins the queue before the market plans
  const town = townOf(data);
  const { segments, notes } = planSegments(town, p, rng);
  notes.unshift(...arrivals);
  const td: TownDayState = { day: p.day, segments, seg: 0, notes, stock: {}, moneyStart: p.town.money, part: 0, at: 'shop' };
  if (town) {
    td.notes.push(...levelNotes(town, p, segments));
    if (segments.includes('market')) {
      // Goods kept overnight (shelf / cellar / ice box) and goods bought after closing yesterday.
      const kept = renoCarry(data, p);
      for (const [ing, n] of Object.entries(pantryOf(p)) as [IngredientId, number][]) kept[ing] = (kept[ing] ?? 0) + n;
      const md = planMarket(data, p, p.today!.queue, rng, kept);
      if (md) {
        td.market = md;
        // Until the shopping is done, today's short goods are empty (or what was kept / bought last night).
        for (const l of md.lines) td.stock[l.good] = 0;
        Object.assign(td.stock, kept);
        p.town.pantry = {};
      } else td.segments = td.segments.filter((s) => s !== 'market');
    }
    if (segments.includes('delivery')) {
      const dd = planDelivery(data, p, rng);
      if (dd) td.delivery = dd;
      else td.segments = td.segments.filter((s) => s !== 'delivery');
    }
  }
  p.townDay = td;
  renoPlanTown(data, p, rng, td); // renovation: with the cart, a delivery every day
  storyPlanTown(data, p, rng); // story: a regular's delivery
  jobsStartDay(data, p, rng); // jobs: the day starts at today's workplace
  // Nothing opens by itself at the start of a day: what the morning brought waits in the scene.
  storyDeferAll(p);
}

/** The tea house's part of the day (older saves: worked out from the shop's state). */
export function teaPart(p: LangProgress): DayPart {
  const td = p.townDay;
  if (td && td.part !== undefined) return td.part;
  const t = p.today;
  if (!t) return 0;
  if (t.phase === 'closed') return 2;
  return t.index > 0 || t.phase === 'reaction' ? 1 : 0;
}

/** The part of the day (HUD): today's workplace's, or the tea house's when there is no job board. */
export function dayPart(p: LangProgress): DayPart {
  const d = jobDay(p);
  if (d) return Math.min(2, d.part) as DayPart;
  return teaPart(p);
}

/** Make sure a running day has its state (older saves continue where they sensibly can). */
export function ensureTownDay(data: GameData, p: LangProgress, rng: Rng): void {
  repairAssumed(data, p); // v4 → v5: start-level words the player verified in play stay confirmed
  // An old (v1) save may hold a running day without its queue: plan the day again instead of crashing.
  const t = p.today as Partial<NonNullable<LangProgress['today']>> | null;
  if (t && (!Array.isArray(t.queue) || !Array.isArray(t.results) || typeof t.index !== 'number' || !t.phase)) {
    p.today = null;
    p.townDay = null;
  }
  if (!p.today) startTownDay(data, p, rng);
  else if (!p.townDay || p.townDay.day !== p.day) p.townDay = { day: p.day, segments: ['shop'], seg: 0, notes: [], stock: {}, moneyStart: p.town.money };
  const td = p.townDay!;
  if (td.part === undefined) td.part = teaPart(p);
  if (!td.at) td.at = 'shop';
  // story (idempotent per day): a resumed / migrated day joins in — what it brings waits in the scene too.
  const before = new Set(p.story?.cards ?? []);
  storyPlanShop(data, p, rng);
  storyPlanTown(data, p, rng);
  for (const c of p.story?.cards ?? []) if (!before.has(c) && c.kind !== 'ledger') c.deferred = true;
  if (p.story?.cards.some((c) => c.deferred)) p.story.cards = [...p.story.cards.filter((c) => !c.deferred), ...p.story.cards.filter((c) => c.deferred)];
  // jobs: a save migrated from v3 gets the tea house's rank for the progress it already has.
  if (p.jobs?.migrated) {
    delete p.jobs.migrated;
    const tea = jobById(data, TEAHOUSE);
    if (tea) checkRankUp(data, p, tea);
  }
  jobsEnsureDay(data, p);
}

/** The scene the tea house's day shows now: the shop, the market street or the delivery. */
export function currentSegment(p: LangProgress): ActivityKind {
  return p.townDay?.at ?? 'shop';
}

/** Is a market planned today (a day the shop tracks its stock)? */
export function marketDay(p: LangProgress): boolean {
  return !!p.townDay?.market && !p.townDay.fromBack;
}

export interface MarketAccess {
  mode: MarketMode;
  /** Japanese reason when the market cannot be used now. */
  why: string | null;
  /** Delivery fee for an order (mode 'order'). */
  fee: number;
}

/**
 * The market from where the player is now (null = no market in this game yet): before opening, a shopping trip
 * for today's shelf; during working hours, an order by delivery (plus the fee); after closing, shopping for
 * tomorrow. `from` = the tea house (default) or the town after closing.
 */
export function marketAccess(p: LangProgress, from: 'shop' | 'hub' = 'shop'): MarketAccess | null {
  if (p.town.unlocked.market === undefined) return null;
  const td = p.townDay;
  if (!td) return null;
  const part = from === 'hub' ? 2 : td.part ?? teaPart(p);
  if (part === 0)
    return { mode: 'visit', fee: 0, why: marketDay(p) ? null : '今日は仕入れの日ではない（棚の品は足りている）' };
  if (part === 1) {
    const t = p.today;
    const why = !marketDay(p)
      ? td.fromBack
        ? '今日は奥の部屋の品で出している'
        : '今日は仕入れの日ではない（棚の品は足りている）'
      : !t || t.phase === 'closed'
        ? '店はもう閉めた'
        : t.index >= t.queue.length - 1
          ? '今日はもうあとのお客さんが来ない（届くのは閉店のあと）'
          : p.town.money < DELIVERY_FEE + 1
            ? `配送費（${DELIVERY_FEE}枚）と品の代金が足りない`
            : null;
    return { mode: 'order', fee: DELIVERY_FEE, why };
  }
  return { mode: 'evening', fee: 0, why: p.town.money < 1 ? '財布が空だ' : null };
}

/**
 * Walk to the market (or send for goods): opens a trip of the right mode. An order pays the delivery fee now (it
 * is given back if nothing is ordered). The evening market is there even on a day without a shopping note.
 * Returns a Japanese reason when not possible.
 */
export function goMarket(data: GameData, p: LangProgress, rng: Rng, from: 'shop' | 'hub' = 'shop'): string | null {
  const acc = marketAccess(p, from);
  const td = p.townDay;
  if (!acc || !td) return '市場はまだ開いていない';
  if (acc.why) return acc.why;
  let md = td.market;
  if (!md) {
    // After closing on a day without a shopping note: the stalls are there all the same (no note).
    const planned = planMarket(data, p, [], rng);
    if (!planned) return '市場はまだ開いていない';
    planned.lines = [];
    planned.tips = [];
    planned.done = true;
    td.market = md = planned;
  }
  md.mode = acc.mode;
  md.from = from;
  md.done = false;
  md.stall = null;
  md.selected = null;
  md.pending = null;
  md.talk = [];
  md.basket = [];
  md.fee = 0;
  if (acc.mode === 'order') {
    md.fee = acc.fee;
    p.town.money -= acc.fee;
  }
  td.at = 'market';
  if (from === 'hub') {
    const d = jobDay(p);
    if (d) d.view = 'teahouse';
  }
  return null;
}

/** Leave the market: the goods go where the trip's mode says (market/engine.ts finishMarket), then back. */
export function leaveMarket(data: GameData, p: LangProgress, finish: (d: GameData, p: LangProgress) => void): void {
  const td = p.townDay;
  const from = td?.market?.from;
  finish(data, p);
  if (td) td.at = 'shop';
  if (from === 'hub') {
    const d = jobDay(p);
    if (d) d.view = 'hub';
  }
}

/** 「店を開ける」: working hours begin (before opening the market may be skipped: the shelf is what it is). */
export function openShop(p: LangProgress): void {
  const td = p.townDay;
  if (!td || (td.part ?? 0) > 0) return;
  td.part = 1;
  td.at = 'shop';
  // The planned market trip that was never made does not stay open.
  if (td.market && !td.market.done && !(td.market.trips ?? 0) && td.market.mode === undefined) td.market.done = true;
  jobsTeaPart(p, 1);
}

/** The next customer (or closing time). Supplies ordered by delivery arrive as the next customer comes in. */
export function nextInTown(data: GameData, p: LangProgress): void {
  nextCustomer(data, p);
  const td = p.townDay;
  const t = p.today;
  if (!td || !t) return;
  if (td.incoming?.length) {
    const stay: NonNullable<TownDayState['incoming']> = [];
    for (const o of td.incoming) {
      if (t.index > o.at || t.phase === 'closed') {
        for (const [ing, n] of Object.entries(o.stock) as [IngredientId, number][])
          if (t.phase === 'closed') (p.town.pantry ??= {})[ing] = (p.town.pantry?.[ing] ?? 0) + n;
          else if (td.stock[ing] !== undefined) td.stock[ing] = (td.stock[ing] ?? 0) + n;
        (td.arrived ??= []).push(o);
      } else stay.push(o);
    }
    td.incoming = stay;
  }
  if (t.phase === 'closed') {
    td.part = 2;
    if (!td.evening) jobsTeaPart(p, 2);
  }
}

/** After closing: out with today's house delivery (when one is planned and not done yet). */
export function goDelivery(p: LangProgress): boolean {
  const td = p.townDay;
  if (!td || teaPart(p) !== 2 || !td.delivery || td.delivery.phase === 'result') return false;
  td.at = 'delivery';
  return true;
}

/** Back in the shop (from the delivery). */
export function backToShop(p: LangProgress): void {
  const td = p.townDay;
  if (td) td.at = 'shop';
}

/** Is a house delivery waiting today (after closing)? */
export function deliveryWaiting(p: LangProgress): boolean {
  const d = p.townDay?.delivery;
  return !!d && d.phase !== 'result';
}

// ---------------------------------------------------------------------------- walking the day (simulators / tests)

/**
 * Simulators and tests walk a tea house day as the planned sequence: the market before opening (when a trip is
 * planned and not made yet), the shop (opened), the house delivery after closing. Returns the scene to play.
 */
export function walkSegment(p: LangProgress): ActivityKind {
  const td = p.townDay;
  if (!td) return 'shop';
  if (td.at && td.at !== 'shop') return td.at;
  if (teaPart(p) === 0 && td.market && !td.market.done && !(td.market.trips ?? 0)) {
    td.at = 'market';
    return 'market';
  }
  if (p.today?.phase === 'closed' && deliveryWaiting(p) && !td.evening) {
    td.at = 'delivery';
    return 'delivery';
  }
  return 'shop';
}

/** Is the scene being walked finished? */
export function segmentDone(p: LangProgress): boolean {
  const seg = currentSegment(p);
  if (seg === 'market') return !!p.townDay?.market?.done;
  if (seg === 'delivery') return p.townDay?.delivery?.phase === 'result';
  return p.today?.phase === 'closed';
}

/** Is there more of the tea house's day to walk after the current scene? */
export function hasNextSegment(p: LangProgress): boolean {
  const seg = currentSegment(p);
  if (seg === 'market') return true;
  if (seg === 'delivery') return false;
  return p.today?.phase !== 'closed' || (deliveryWaiting(p) && !p.townDay?.evening);
}

/** Walk on: from the market back into the shop (opened), from the closed shop out to the delivery. */
export function nextSegment(p: LangProgress): void {
  const td = p.townDay;
  if (!td || !segmentDone(p)) return;
  const seg = currentSegment(p);
  if (seg === 'market') {
    td.at = 'shop';
    openShop(p);
  } else if (seg === 'shop' && deliveryWaiting(p) && !td.evening) td.at = 'delivery';
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
  // Serving opens the shop (simulators / tests serve straight away; the UI opens it first).
  if (p.townDay && (p.townDay.part ?? 0) === 0) openShop(p);
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
    p.town.money += town.shared.market.income[out.evaluation.outcome] - (td?.fromBack ? BACK_ROOM_COST : 0);
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
  const said = p.today!.results[p.today!.results.length - 1]?.reaction;
  storyAfterServe(data, p, out, rng); // story: a regular's reaction line / small talk
  renoAfterServe(data, p, out, rng, p.today!.results[p.today!.results.length - 1]?.reaction !== said); // renovation: bonuses, remarks
  return out;
}

/** Can the day end now (home and the night's ledger)? After closing, or from the town. */
export function canEndDay(p: LangProgress): boolean {
  return p.today?.phase === 'closed' && currentSegment(p) === 'shop';
}

/** Going home: advance the calendar; the next startTownDay plans the new day. */
export function endTownDay(p: LangProgress, data?: GameData): void {
  if (p.today?.phase !== 'closed') return;
  const td = p.townDay;
  if (td) {
    // Supplies still on their way (none should be: the last customer cannot order) go to the back room.
    for (const o of td.incoming ?? []) for (const [ing, n] of Object.entries(o.stock) as [IngredientId, number][]) (p.town.pantry ??= {})[ing] = (p.town.pantry?.[ing] ?? 0) + n;
    td.incoming = [];
    td.at = 'shop';
    td.part = 2;
  }
  if (data) renoEndDay(data, p); // renovation: signboard reputation, stock kept overnight
  if (data) jobsEndDay(data, p); // jobs: the tea house's rank / links (other jobs log their own shifts)
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
