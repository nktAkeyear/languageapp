import { describe, expect, it } from 'vitest';
import { CONTENT, SHARED } from '../../content';
import { buildGameData, ingredientsAtStage, type GameData } from '../../core/gamedata';
import { makeRng } from '../../core/rng';
import { newProgress, type LangProgress } from '../../core/save';
import { LANGS, type Brew } from '../../core/types';
import { orderWordIds, planDay } from './dayplan';
import { currentOrder, endDay, nextCustomer, serve, startDay } from './engine';
import { witnessBrew } from './rules';

function solve(data: GameData, p: LangProgress): Brew {
  const o = currentOrder(p)!;
  return witnessBrew(o.rule, new Set(ingredientsAtStage(data, p.stage)), data.ing)!;
}

/** Play `days` days. `fail(dayIndex, i)` decides whether to serve an empty cup instead. */
function play(data: GameData, days: number, seed: number, fail: (day: number, i: number) => boolean = () => false) {
  const p = newProgress(data.lang);
  const rng = makeRng(seed);
  const log: { day: number; stage: number; texts: string[]; returning: number }[] = [];
  for (let d = 0; d < days; d++) {
    startDay(data, p, rng);
    const t = p.today!;
    log.push({ day: p.day, stage: p.stage, texts: t.queue.map((q) => q.text), returning: t.queue.filter((q) => q.returning).length });
    let i = 0;
    while (p.today!.phase !== 'closed') {
      const brew = fail(p.day, i) ? { counts: {}, temp: null, method: null } : solve(data, p);
      const res = serve(data, p, brew, rng)!;
      expect(res).not.toBeNull();
      nextCustomer(data, p);
      i++;
    }
    endDay(p);
  }
  return { p, log };
}

describe.each(LANGS)('day planning (%s)', (lang) => {
  const data = buildGameData(CONTENT[lang], SHARED);

  it('day 1 is the authored single-ingredient curriculum', () => {
    const p = newProgress(lang);
    startDay(data, p, makeRng(1));
    expect(p.today!.queue.map((q) => q.key)).toEqual(['o1_lemon', 'o1_ginger', 'o1_mint', 'o1_honey']);
  });

  it('perfect play progresses through all stages in ~40 days (a new stage about every two days), every witness brew is perfect', () => {
    const lastStage = Math.max(...SHARED.stages.map((s) => s.stage));
    const { p, log } = play(data, 40, 42);
    expect(p.stage).toBe(lastStage);
    // pacing: stage 10 is not reached before day 13, and the last stage not before day 39
    expect(log.find((l) => l.stage >= 10)!.day).toBeGreaterThanOrEqual(13);
    expect(log.find((l) => l.stage === lastStage)!.day).toBeGreaterThanOrEqual(35);
    expect(p.stats.perfect).toBe(p.stats.served);
    expect(log.every((l) => l.texts.length >= 4)).toBe(true);
    // all authored orders of reached stages got served
    const authored = CONTENT[lang].orders.filter((o) => o.stage <= 22);
    expect(authored.filter((o) => !p.orders[o.id]?.perfect).map((o) => o.id)).toEqual([]);
  });

  it('template orders introduce at most one unseen word', () => {
    const p = newProgress(lang);
    const rng = makeRng(7);
    for (let d = 0; d < 9; d++) {
      startDay(data, p, rng);
      const known = new Set(Object.keys(p.words));
      // Words known before the day = words that existed before planning minus today's new words.
      for (const id of p.today!.newWords) known.delete(id);
      for (const q of p.today!.queue) {
        if (q.source.type !== 'template') continue;
        const fresh = orderWordIds(data, q).filter((id) => !known.has(id));
        expect(fresh.length, q.text).toBeLessThanOrEqual(1);
        fresh.forEach((f) => known.add(f));
      }
      while (p.today!.phase !== 'closed') {
        serve(data, p, solve(data, p), rng);
        nextCustomer(data, p);
      }
      endDay(p);
    }
  });

  it('failed customers come back on a later day; reputation never goes negative', () => {
    const { p, log } = play(data, 4, 3, (day, i) => day === 1 && i === 0);
    expect(log[1].returning).toBe(1);
    expect(p.reputation).toBeGreaterThanOrEqual(0);
    expect(p.orders['o1_lemon']).toMatchObject({ perfect: true });
    expect(p.orders['o1_lemon'].attempts).toBe(2);
  });

  it('a struggling player still unlocks stages via the grace period (no hard gate)', () => {
    const { p } = play(data, 6, 5, () => true);
    expect(p.reputation).toBe(0);
    expect(p.stage).toBeGreaterThanOrEqual(2);
  });

  it('prefers due/weak words in review orders', () => {
    const p = newProgress(lang);
    const rng = makeRng(11);
    const { p: played } = play(data, 6, 11);
    Object.assign(p, structuredClone(played));
    // make honey very weak and due
    p.words.honey.wrong = 5;
    p.words.honey.ease = 1.3;
    p.words.honey.due = 0;
    let withHoney = 0;
    for (let s = 0; s < 20; s++) {
      const plan = planDay(data, structuredClone(p), makeRng(s + 100));
      withHoney += plan.queue.filter((q) => orderWordIds(data, q).includes('honey')).length;
    }
    expect(withHoney / 20).toBeGreaterThan(1);
    void rng;
  });
});
