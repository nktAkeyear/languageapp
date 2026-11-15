/**
 * A simulated player for the difficulty settings (used by `npm run simulate` and the tests).
 * Plays whole days through the same day orchestration as the UI: market, shop, delivery,
 * 検証ページ, story cards. The player's skill is one number, `accuracy`:
 *
 * - a shop order is served right with probability `accuracy` (− NEW_WORD_PENALTY when the order
 *   contains a word met for the first time today, + REVIEW_BONUS otherwise), else a wrong cup;
 * - each open 検証ページ is sealed with probability `accuracy` per day (else one failed stamp);
 * - a market line is bought one unit short / a delivery goes to the wrong house with 1 − accuracy.
 *
 * Planning randomness and the player's own randomness use separate streams, so two runs with the
 * same seed see the same days as long as the settings do not change the plan.
 */
import { CONTENT, SHARED } from '../content';
import { applyStartLevel, difficultyState, planKnobs, setDifficultyOptions, type Pace } from '../core/difficulty';
import { buildGameData, ingredientsAtStage, type GameData } from '../core/gamedata';
import { levelReport } from '../core/levels';
import { makeRng, type Rng } from '../core/rng';
import { newProgress, type LangProgress } from '../core/save';
import type { Brew, IngredientId, Lang } from '../core/types';
import { pageStatus, pageWords, submitVerification } from '../core/verification';
import { storyAutoPlay, storySync } from '../story/engine';
import { endTownDay, goMarket, hasNextSegment, marketAccess, nextInTown, nextSegment, openShop, serveInTown, startTownDay, stockOf, walkSegment } from './day';
import { solveDelivery } from './delivery/engine';
import { finishMarket, solveMarket } from './market/engine';
import { currentOrder } from './shop/engine';
import { orderHasNewWords } from '../core/difficulty';
import { witnessBrew } from './shop/rules';
import { catalogue, renoOrder, renoShared } from '../renovation/engine';
import { beginShift, chooseJob, currentShift, currentTask, jobById, leaveShift, nextTask, ruleCtx, submitTask } from '../jobs/engine';
import { fumbleTask, solveTask } from '../jobs/rules';

export const NEW_WORD_PENALTY = 0.15;
export const REVIEW_BONUS = 0.05;

export interface SimOptions {
  lang: Lang;
  days: number;
  seed?: number;
  start?: number;
  pace?: Pace;
  adaptive?: boolean;
  accuracy?: number;
  /** Play like a save from before the difficulty settings (no difficulty state at all). */
  legacy?: boolean;
  /** Order from the renovation catalogue after the shop closes (see buyFromCatalogue). */
  buy?: boolean;
  /** Called after each closed day. */
  onDay?: (p: LangProgress, d: SimDay) => void;
}

export interface SimDay {
  day: number;
  stage: number;
  reputation: number;
  customers: number;
  newWords: number;
  budget: number;
  reviewShare: number;
  firstTry: number;
  firstTryOk: number;
  adj: number;
  confirmed: number;
  mastered: number;
  statement: string;
  segments: string;
  beatsDone: number;
  chapter: number;
  /** Coins at the end of the day, and upgrades ordered that day (with `buy`). */
  coins: number;
  bought: string[];
}

const dataCache = new Map<Lang, GameData>();
export function simData(lang: Lang): GameData {
  let d = dataCache.get(lang);
  if (!d) dataCache.set(lang, (d = buildGameData(CONTENT[lang], SHARED)));
  return d;
}

/**
 * The simulated player's catalogue habit (`npm run simulate -- … buy`): every affordable entry in
 * catalogue order while keeping the coins the market needs. Returns what was ordered.
 */
export function buyFromCatalogue(data: GameData, p: LangProgress): { id: string; price: number; left: number }[] {
  const keep = renoShared(data)?.keepForMarket ?? 0;
  const out: { id: string; price: number; left: number }[] = [];
  for (const e of catalogue(data, p))
    if (e.status === 'available' && p.town.money - e.def.price >= keep && !renoOrder(data, p, e.def.id)) out.push({ id: e.def.id, price: e.def.price, left: p.town.money });
  return out;
}

const WRONG: Brew = { counts: { salt: 1, mint: 4 }, temp: null, method: null };

function playVerification(data: GameData, p: LangProgress, acc: number, prng: Rng): void {
  for (const page of data.content.verificationPages) {
    if (pageStatus(data, p, page) !== 'available') continue;
    const words = pageWords(data, page.id);
    const right = Object.fromEntries(words.map((w) => [w.id, w.id]));
    if (prng() < acc) submitVerification(data, p, page.id, right);
    else submitVerification(data, p, page.id, {});
  }
}

export function simulatePlayer(opts: SimOptions): { p: LangProgress; days: SimDay[] } {
  const data = simData(opts.lang);
  const p = newProgress(opts.lang);
  const rng = makeRng(opts.seed ?? 1);
  const prng = makeRng((opts.seed ?? 1) * 7919 + 13);
  const acc = opts.accuracy ?? 0.75;
  if (!opts.legacy) {
    setDifficultyOptions(p, { pace: opts.pace ?? 'normal', adaptive: opts.adaptive ?? true });
    if (opts.start) applyStartLevel(data, p, opts.start);
  }
  const out: SimDay[] = [];
  for (let d = 0; d < opts.days; d++) {
    if (opts.legacy) delete p.difficulty;
    const k = planKnobs(data, p);
    startTownDay(data, p, rng);
    storyAutoPlay(data, p, (b) => b.choice?.[0]?.id ?? '');
    const newWords = p.today!.newWords.length;
    const customers = p.today!.queue.length;
    const segments = p.townDay!.segments.join('→');
    let ft = 0;
    let ftOk = 0;
    const bought: string[] = [];
    for (let guard = 0; guard < 10; guard++) {
      const seg = walkSegment(p);
      if (seg === 'market') {
        solveMarket(data, p, rng, { shortBy: prng() < acc ? 0 : 1 });
        finishMarket(data, p);
      } else if (seg === 'shop') {
        while (p.today!.phase !== 'closed') {
          const o = currentOrder(p)!;
          const chance = orderHasNewWords(data, p, o) ? acc - NEW_WORD_PENALTY : Math.min(1, acc + REVIEW_BONUS);
          const ok = prng() < chance;
          const shelf = new Set(ingredientsAtStage(data, p.stage).filter((i) => stockOf(p, i as IngredientId) !== 0));
          const brew = ok ? (witnessBrew(o.rule, shelf, data.ing) ?? WRONG) : WRONG;
          const r = serveInTown(data, p, brew, rng)!;
          ft++;
          if (r.evaluation.outcome === 'perfect') ftOk++;
          storyAutoPlay(data, p, (b) => b.choice?.[0]?.id ?? '');
          nextInTown(data, p);
        }
        if (opts.buy) bought.push(...buyFromCatalogue(data, p).map((b) => b.id));
      } else {
        solveDelivery(data, p, rng, prng() < acc ? 'none' : 'place');
        storySync(data, p);
        storyAutoPlay(data, p, (b) => b.choice?.[0]?.id ?? '');
      }
      if (!hasNextSegment(p)) break;
      nextSegment(p);
    }
    playVerification(data, p, acc, prng);
    const day = p.day;
    const stage = p.stage;
    endTownDay(p, data);
    storyAutoPlay(data, p, (b) => b.choice?.[0]?.id ?? '');
    const rep = levelReport(data, p);
    const sd: SimDay = {
      day,
      stage,
      reputation: p.reputation,
      customers,
      newWords,
      budget: k.budget,
      reviewShare: k.reviewShare,
      firstTry: ft,
      firstTryOk: ftOk,
      adj: opts.legacy ? 0 : difficultyState(p).adj,
      confirmed: Object.values(p.words).filter((w) => w.confirmed).length,
      mastered: rep.masteredTotal,
      statement: rep.statement,
      segments,
      beatsDone: Object.values(p.story.beats).filter((b) => b.status === 'done').length,
      chapter: p.story.chapter,
      coins: p.town.money,
      bought,
    };
    out.push(sd);
    opts.onDay?.(p, sd);
  }
  return { p, days: out };
}

/**
 * Jobs: play one shift of a job for the current part of the day (simulator / tests). The player
 * solves each task with probability `accuracy`, else hands in a plausible wrong answer.
 * Returns the outcomes, or null when the job cannot be chosen now.
 */
export function playJobShift(data: GameData, p: LangProgress, jobId: string, accuracy: number, rng: Rng, prng: Rng): { outcomes: string[]; rankUp: number | null; texts: string[]; tasks: { source: string; rank: number; arch: string }[] } | null {
  if (chooseJob(data, p, jobId, rng)) return null;
  beginShift(data, p);
  const out: string[] = [];
  const texts: string[] = [];
  const tasks: { source: string; rank: number; arch: string }[] = [];
  const job = jobById(data, jobId)!;
  const jc = job.content[data.lang]!;
  const ctx = ruleCtx(data, jc);
  for (let guard = 0; guard < 20; guard++) {
    const t = currentTask(p);
    if (!t) break;
    texts.push(...t.texts);
    const src = t.source.type === 'authored' ? jc.tasks.find((x) => x.id === t.source.id) : jc.templates.find((x) => x.id === t.source.id);
    tasks.push({ source: `${t.source.type === 'authored' ? 'A' : 'T'}:${t.source.id}`, rank: src?.rank ?? 0, arch: t.spec.arch });
    const a = prng() < accuracy ? solveTask(t.spec, ctx) : fumbleTask(t.spec, ctx, prng);
    const r = submitTask(data, p, a, rng)!;
    out.push(r.evaluation.outcome);
    if (r.result.reaction) texts.push(r.result.reaction);
    nextTask(data, p);
  }
  const rankUp = currentShift(p)?.rankUp ?? null;
  leaveShift(p);
  return { outcomes: out, rankUp, texts, tasks };
}

export interface TeaHouseHabits {
  /** Skip the market before opening and order by delivery when a good on the note runs out. */
  orderInstead?: boolean;
}

/**
 * Play the tea house from where its day is to closing time and the house delivery (simulator / jobs simulation).
 * With `orderInstead` the player never walks to the market: when the next customer needs a good the shelf is out
 * of, they order the note's goods by delivery (fee included) — they arrive with the customer after.
 */
export function playTeaHouse(data: GameData, p: LangProgress, acc: number, rng: Rng, prng: Rng, habits: TeaHouseHabits = {}): { cups: number; perfect: number; orders: number; fees: number } {
  let cups = 0;
  let perfect = 0;
  let orders = 0;
  for (let guard = 0; guard < 10; guard++) {
    const seg = habits.orderInstead && p.townDay && (p.townDay.part ?? 0) === 0 ? 'shop' : walkSegment(p);
    if (seg === 'market') {
      solveMarket(data, p, rng, { shortBy: prng() < acc ? 0 : 1 });
      finishMarket(data, p);
    } else if (seg === 'shop') {
      openShop(p);
      while (p.today!.phase !== 'closed') {
        const o = currentOrder(p)!;
        if (habits.orderInstead && (o.rule.require ?? []).some((r) => stockOf(p, r.ing) === 0) && marketAccess(p)?.why === null) {
          if (!goMarket(data, p, rng)) {
            solveMarket(data, p, rng);
            finishMarket(data, p);
            orders++;
          }
        }
        const ok = prng() < acc;
        const shelf = new Set(ingredientsAtStage(data, p.stage).filter((i) => stockOf(p, i as IngredientId) !== 0));
        const brew = ok ? (witnessBrew(o.rule, shelf, data.ing) ?? WRONG) : WRONG;
        const r = serveInTown(data, p, brew, rng)!;
        cups++;
        if (r.evaluation.outcome === 'perfect') perfect++;
        storyAutoPlay(data, p, (b) => b.choice?.[0]?.id ?? '');
        nextInTown(data, p);
      }
    } else {
      solveDelivery(data, p, rng, prng() < acc ? 'none' : 'place');
      storySync(data, p);
      storyAutoPlay(data, p, (b) => b.choice?.[0]?.id ?? '');
    }
    if (!hasNextSegment(p)) break;
    nextSegment(p);
  }
  return { cups, perfect, orders, fees: p.townDay?.fees ?? 0 };
}
