/**
 * Renovation × difficulty settings: the two layers were built apart; these pin how they combine.
 */
import { describe, expect, it } from 'vitest';
import { currentSegment, endTownDay, hasNextSegment, nextSegment, serveInTown, startTownDay, stockOf } from '../activities/day';
import { solveDelivery } from '../activities/delivery/engine';
import { finishMarket, solveMarket } from '../activities/market/engine';
import { currentOrder, nextCustomer, type ServeOutcome } from '../activities/shop/engine';
import { witnessBrew } from '../activities/shop/rules';
import { CONTENT, SHARED } from '../content';
import { buildGameData, ingredientsAtStage, stageDef, type GameData } from '../core/gamedata';
import { applyStartLevel, describeDifficulty, difficultyOnRetry, planKnobs, setDifficultyOptions } from '../core/difficulty';
import { makeRng } from '../core/rng';
import { newProgress, type LangProgress } from '../core/save';
import { LANGS, type Brew, type IngredientId, type OrderInstance } from '../core/types';
import { storyAutoPlay } from '../story/engine';
import { catalogue, renoAfterServe, renoOf, renoOrder, renoMarkSeen } from './engine';
import { remarkText, type UpgradeId } from './types';

const data: Record<string, GameData> = Object.fromEntries(LANGS.map((l) => [l, buildGameData(CONTENT[l], SHARED)]));
const WRONG: Brew = { counts: { salt: 1, mint: 4 }, temp: null, method: null };

function rightCup(d: GameData, p: LangProgress): Brew {
  const o = currentOrder(p)!;
  const shelf = new Set(ingredientsAtStage(d, p.stage).filter((i) => stockOf(p, i as IngredientId) !== 0));
  return witnessBrew(o.rule, shelf, d.ing) ?? { counts: { water: 1 }, temp: null, method: null };
}

function playDays(d: GameData, p: LangProgress, days: number, rng: () => number) {
  for (let i = 0; i < days; i++) {
    startTownDay(d, p, rng);
    storyAutoPlay(d, p, (b) => b.choice?.[0]?.id ?? '');
    for (;;) {
      const seg = currentSegment(p);
      if (seg === 'market') {
        solveMarket(d, p, rng);
        finishMarket(d, p);
      } else if (seg === 'shop') {
        while (p.today!.phase !== 'closed') {
          serveInTown(d, p, rightCup(d, p), rng);
          nextCustomer(d, p);
        }
      } else solveDelivery(d, p, rng);
      storyAutoPlay(d, p, (b) => b.choice?.[0]?.id ?? '');
      if (!hasNextSegment(p)) break;
      nextSegment(p);
    }
    endTownDay(p, d);
    storyAutoPlay(d, p, (b) => b.choice?.[0]?.id ?? '');
  }
}

const give = (p: LangProgress, ...ids: UpgradeId[]) => ids.forEach((id) => (renoOf(p).owned[id] = p.day - 1));

describe('renovation × difficulty', () => {
  it('customers a day: pace preset and the bench add up; the 記録 text counts the bench', () => {
    const d = data.zh;
    const base = newProgress('zh');
    playDays(d, base, 9, makeRng(3));
    for (const [pace, delta] of [['slow', -1], ['normal', 0], ['fast', 1]] as const)
      for (const bench of [false, true]) {
        const p = structuredClone(base);
        setDifficultyOptions(p, { pace, adaptive: false });
        if (bench) give(p, 'bench');
        startTownDay(d, p, makeRng(11));
        const story = p.today!.queue.filter((q) => q.key.startsWith('story:')).length;
        const expected = Math.max(3, stageDef(d, p.stage).customersPerDay + delta) + (bench ? 1 : 0);
        expect(p.today!.queue.length - story).toBe(expected);
        expect(describeDifficulty(d, p, bench ? 1 : 0)).toContain(`お客さんは${planKnobs(d, p).customers + (bench ? 1 : 0)}人`);
      }
  });

  it('the arrival note is on the first notice of the day, also when the day starts at the market', () => {
    const d = data.en;
    const p = newProgress('en');
    const rng = makeRng(7);
    playDays(d, p, 12, rng);
    p.town.money = 200;
    let found = false;
    for (let i = 0; i < 12 && !found; i++) {
      const snap = structuredClone(p);
      renoOf(snap).orders.push({ id: 'plant', day: snap.day - 1 });
      startTownDay(d, snap, makeRng(100 + i));
      if (snap.townDay!.segments[0] !== 'market') {
        playDays(d, p, 1, rng);
        continue;
      }
      expect(snap.townDay!.notes.some((n) => n.includes('届いた'))).toBe(true);
      found = true;
    }
    expect(found).toBe(true);
  });

  it('décor remarks fit the moment: no "very warm here" after a cold drink', () => {
    for (const l of LANGS) {
      const d = data[l];
      const warm = CONTENT[l].renovation!.upgrades.curtains.remarks!.find((r) => typeof r !== 'string')!;
      for (let seed = 0; seed < 30; seed++) {
        const p = newProgress(l);
        p.day = 20;
        give(p, 'curtains');
        const o = { key: 'k1', text: 'x', customer: 'c', audioOnly: false, source: { type: 'template', id: 't' }, rule: { temp: 'cold' } } as unknown as OrderInstance;
        p.today = { day: 20, queue: [o], index: 0, phase: 'reaction', results: [{ key: 'k1', customer: 'c', outcome: 'perfect', repDelta: 1, reaction: 'Ok.', face: 'happy' }], notes: [], newWords: [] };
        const out = { evaluation: { outcome: 'perfect', issues: [] }, reaction: { text: 'Ok.', face: 'happy' }, repDelta: 1 } as unknown as ServeOutcome;
        renoAfterServe(d, p, out, makeRng(seed), false);
        expect(p.today.results[0].reaction).not.toContain(remarkText(warm));
      }
    }
  });

  it('a catalogue entry that has appeared stays listed when reputation dips (e.g. a paid gloss peek)', () => {
    const d = data.en;
    const p = newProgress('en');
    p.day = 9;
    p.reputation = 15;
    expect(catalogue(d, p).some((e) => e.def.id === 'bench')).toBe(true);
    renoMarkSeen(d, p);
    p.reputation = 14;
    expect(catalogue(d, p).some((e) => e.def.id === 'bench')).toBe(true);
  });

  it('a level change in the middle of a day does not show up as the day’s takings or reputation', () => {
    const d = data.zh;
    const p = newProgress('zh');
    const rng = makeRng(5);
    playDays(d, p, 2, rng);
    startTownDay(d, p, rng);
    const m0 = p.town.money;
    const r0 = p.reputation;
    applyStartLevel(d, p, 2);
    expect(p.town.money + p.reputation).toBeGreaterThan(m0 + r0); // the jump granted something
    const m1 = p.town.money;
    const r1 = p.reputation;
    while (p.today!.phase !== 'closed') {
      serveInTown(d, p, WRONG, rng);
      nextCustomer(d, p);
    }
    for (;;) {
      if (!hasNextSegment(p)) break;
      nextSegment(p);
      if (currentSegment(p) === 'delivery') solveDelivery(d, p, rng);
    }
    endTownDay(p, d);
    const led = p.story.lastLedger!;
    expect(led.takings).toBe(Math.max(0, p.town.money - m1 + led.expenses)); // the cups, not the start money
    expect(led.repDelta).toBe(p.reputation - r1);
  });

  it('retry assist: the restored state pays bonuses once and counts the first try once', () => {
    const d = data.en;
    const p = newProgress('en');
    const rng = makeRng(9);
    playDays(d, p, 14, rng);
    setDifficultyOptions(p, { assists: { retry: true } });
    give(p, 'kettle', 'scales', 'icebox');
    startTownDay(d, p, rng);
    for (const seg of p.townDay!.segments) {
      if (currentSegment(p) !== 'shop') {
        if (seg === 'market') {
          solveMarket(d, p, rng);
          finishMarket(d, p);
        }
        nextSegment(p);
      }
    }
    expect(currentSegment(p)).toBe('shop');
    const before = structuredClone(p); // what the UI keeps before a cup (useGame.serveBrew)
    const right = rightCup(d, p);
    serveInTown(d, p, WRONG, rng);
    // retry: restore the snapshot, count the failed first try, serve again (right)
    const q = structuredClone(before);
    difficultyOnRetry(d, q, currentOrder(q)!);
    const out = serveInTown(d, q, right, rng)!;
    expect(out.evaluation.outcome).toBe('perfect');
    const once = structuredClone(before);
    serveInTown(d, once, right, makeRng(1));
    expect(q.town.money).toBe(once.town.money); // the same bonus as a first-time perfect cup, once
    expect(q.difficulty!.acc!.firstTry).toBe((before.difficulty!.acc?.firstTry ?? 0) + 1);
    expect(q.difficulty!.acc!.firstTryOk).toBe(before.difficulty!.acc?.firstTryOk ?? 0);
    expect(q.difficulty!.acc!.retries).toBe(1);
  });

  it('a level start seeds catalogue words of that level; their pages are sealed only when all their words are known', () => {
    const d = data.en;
    const p = newProgress('en');
    applyStartLevel(d, p, 2);
    expect(p.words.cat?.seeded).toBeTruthy(); // 英検5級
    expect(p.words.bench).toBeUndefined(); // 準2級
    for (const page of CONTENT.en.renovation!.pages) {
      const words = CONTENT.en.renovation!.lexicon.filter((e) => e.group === page.id);
      if (p.verification[page.id]?.solved) expect(words.every((e) => p.words[e.id]?.confirmed)).toBe(true);
    }
    // the catalogue still opens by the calendar (day 4), not at once after the jump
    expect(catalogue(d, p)).toEqual([]);
    p.day = 4;
    expect(catalogue(d, p).length).toBeGreaterThan(0);
    p.town.money = 500;
    expect(renoOrder(d, p, 'signboard')).toBeNull();
  });
});
