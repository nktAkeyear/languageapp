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
import { currentSegment, endTownDay, nextSegment, serveInTown, startTownDay, stockOf } from './day';
import { solveDelivery } from './delivery/engine';
import { finishMarket, solveMarket } from './market/engine';
import { currentOrder, nextCustomer } from './shop/engine';
import { orderHasNewWords } from '../core/difficulty';
import { witnessBrew } from './shop/rules';

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
}

const dataCache = new Map<Lang, GameData>();
export function simData(lang: Lang): GameData {
  let d = dataCache.get(lang);
  if (!d) dataCache.set(lang, (d = buildGameData(CONTENT[lang], SHARED)));
  return d;
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
    for (;;) {
      const seg = currentSegment(p);
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
          nextCustomer(data, p);
        }
      } else {
        solveDelivery(data, p, rng, prng() < acc ? 'none' : 'place');
        storySync(data, p);
        storyAutoPlay(data, p, (b) => b.choice?.[0]?.id ?? '');
      }
      if (!p.townDay || p.townDay.seg >= p.townDay.segments.length - 1) break;
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
    };
    out.push(sd);
    opts.onDay?.(p, sd);
  }
  return { p, days: out };
}
