/**
 * Difficulty by start level (レベル設定) in the tea house: a player placed by a start level gets the day planned from
 * the band of that level (core/difficulty.ts START_STAGE / START_FLOOR, shop/dayplan.ts), and 英検2級 / 準1級 / 1級
 * each have stages of their own (src/content/en/stages3.ts). Runs with the compiled English lists, as the game does.
 */
import { describe, expect, it } from 'vitest';
import { loadEnglishListsFromDisk } from '../../curriculum/node';
import { withLists } from '../../curriculum/apply';
import { CONTENT, SHARED } from '../../content';
import { buildGameData, ingredientsAtStage, type GameData } from '../../core/gamedata';
import { applyStartLevel, defaultDifficulty, placedFloor, START_FLOOR, START_STAGE, START_TOEIC } from '../../core/difficulty';
import { makeRng } from '../../core/rng';
import { newProgress, type LangProgress } from '../../core/save';
import { tokenIds } from '../../core/tokenize';
import type { OrderInstance } from '../../core/types';
import { jobById } from '../../jobs/engine';
import { placedRankFor } from '../../jobs/placement';
import { MAX_BELOW_FLOOR } from './dayplan';
import { currentOrder, endDay, nextCustomer, serve, startDay } from './engine';
import { witnessBrew } from './rules';

loadEnglishListsFromDisk();
const data = buildGameData(withLists(CONTENT.en), SHARED);

const stageOf = (d: GameData, o: OrderInstance) =>
  o.source.type === 'authored' ? d.content.orders.find((x) => x.id === o.source.id)!.stage : d.content.templates.find((x) => x.id === o.source.id)!.stage;
const words = (o: OrderInstance) => tokenIds(data.tokens(o.text)).length;
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);

function firstDay(level: number, seed: number, toeic: number | null = null): LangProgress {
  const p = newProgress('en');
  if (level > 0 || toeic) applyStartLevel(data, p, level, { toeic });
  startDay(data, p, makeRng(seed));
  return p;
}

function playDay(p: LangProgress, rng: ReturnType<typeof makeRng>): void {
  while (p.today!.phase !== 'closed') {
    const o = currentOrder(p)!;
    serve(data, p, witnessBrew(o.rule, new Set(ingredientsAtStage(data, p.stage)), data.ing)!, rng);
    nextCustomer(data, p);
  }
  endDay(p);
}

describe('start levels (en): the tea house plans from the placed band', () => {
  it('ゼロから has no floor (the plan is the one without a start level)', () => {
    const p = newProgress('en');
    expect(placedFloor(data, p)).toBe(1);
    p.difficulty = defaultDifficulty();
    expect(placedFloor(data, p)).toBe(1);
    startDay(data, p, makeRng(1));
    expect(p.today!.queue.map((q) => q.key)).toEqual(['o1_lemon', 'o1_ginger', 'o1_mint', 'o1_honey']);
  });

  it('every 英検 grade has a stage and a band floor of its own, rising with the grade', () => {
    const stages = [1, 2, 3, 4, 5, 6, 7].map((l) => START_STAGE.en[l]);
    const floors = [1, 2, 3, 4, 5, 6, 7].map((l) => START_FLOOR.en[l]);
    expect(stages).toEqual([7, 13, 19, 23, 24, 25, 26]);
    for (let i = 0; i < 7; i++) expect(floors[i]).toBeLessThanOrEqual(stages[i]);
    // the bands do not overlap: each level's floor is above the stage the level below starts at
    for (let i = 1; i < 7; i++) expect(floors[i]).toBeGreaterThan(stages[i - 1]);
  });

  it('levels 1…7: the first day is measurably harder from grade to grade (source stage, length), with no shared order', () => {
    for (const seed of [1, 2, 3]) {
      const days = [1, 2, 3, 4, 5, 6, 7].map((l) => firstDay(l, seed));
      const stage = days.map((p) => mean(p.today!.queue.map((o) => stageOf(data, o))));
      const length = days.map((p) => mean(p.today!.queue.map(words)));
      for (let i = 1; i < 7; i++) {
        expect(stage[i], `mean source stage, level ${i + 1} vs ${i} (seed ${seed})`).toBeGreaterThan(stage[i - 1]);
        expect(length[i], `mean words, level ${i + 1} vs ${i} (seed ${seed})`).toBeGreaterThanOrEqual(length[i - 1]);
        const prev = new Set(days[i - 1].today!.queue.map((o) => o.key));
        expect(days[i].today!.queue.filter((o) => prev.has(o.key)).map((o) => o.key)).toEqual([]);
      }
      // where the tea house has material of its own (2級, 準1級, 1級), the orders get longer too
      expect(length[4]).toBeGreaterThan(length[3] + 5);
      expect(length[5]).toBeGreaterThan(length[4]);
      expect(length[6]).toBeGreaterThan(length[5]);
      // day 1 is all band material
      days.forEach((p) => {
        const floor = placedFloor(data, p);
        for (const o of p.today!.queue) expect(stageOf(data, o), `${o.key} at level ${p.difficulty!.start}`).toBeGreaterThanOrEqual(floor);
      });
    }
  });

  it('a placed player’s days stay in the band: easier curriculum at most once a day and never first', () => {
    for (const level of [1, 2, 3, 4, 5, 6, 7]) {
      const p = newProgress('en');
      applyStartLevel(data, p, level);
      const rng = makeRng(level * 13);
      for (let d = 0; d < 8; d++) {
        startDay(data, p, rng);
        const floor = placedFloor(data, p);
        const q = p.today!.queue;
        expect(q.length).toBeGreaterThanOrEqual(6);
        expect(stageOf(data, q[0])).toBeGreaterThanOrEqual(floor);
        const below = q.filter((o) => stageOf(data, o) < floor);
        expect(below.length, `level ${level} day ${p.day}: ${below.map((o) => o.key).join(', ')}`).toBeLessThanOrEqual(MAX_BELOW_FLOOR);
        playDay(p, rng);
      }
    }
  });

  it('TOEIC starts land on the stage of their 英検 equivalent (〜730 and 〜860 share the 準1級 tea house)', () => {
    const stages = START_TOEIC.map((t) => firstDay(0, 1, t.band).stage);
    expect(stages).toEqual([19, 23, 24, 25, 25, 26]);
    const m = START_TOEIC.map((t) => mean(firstDay(0, 1, t.band).today!.queue.map((o) => stageOf(data, o))));
    for (let i = 1; i < m.length; i++) expect(m[i]).toBeGreaterThanOrEqual(m[i - 1]);
  });

  it('the tea house’s ranks reach 1級: a 2級 / 準1級 / 1級 start places it at rank 5 / 6 / 7', () => {
    const tea = jobById(data, 'teahouse')!;
    expect([1, 2, 3, 4, 5, 6, 7].map((l) => placedRankFor(tea, l))).toEqual([1, 2, 3, 4, 5, 6, 7]);
    for (const l of [5, 6, 7]) {
      const p = newProgress('en');
      applyStartLevel(data, p, l);
      expect(p.jobs!.jobs.teahouse.rank).toBe(l);
    }
  });

  it('stages 24–26 hold at least 40 authored orders each, longer at each stage', () => {
    const at = (s: number) => data.content.orders.filter((o) => o.stage === s);
    const len = (s: number) => mean(at(s).map((o) => tokenIds(data.tokens(o.text)).length));
    for (const s of [24, 25, 26]) expect(at(s).length).toBeGreaterThanOrEqual(40);
    expect(len(24)).toBeGreaterThan(len(23));
    expect(len(25)).toBeGreaterThan(len(24));
    expect(len(26)).toBeGreaterThan(len(25));
  });
});
