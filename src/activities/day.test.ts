import { describe, expect, it } from 'vitest';
import { CONTENT, SHARED } from '../content';
import { buildGameData, ingredientsAtStage, type GameData } from '../core/gamedata';
import { makeRng } from '../core/rng';
import { migrateSave, newProgress, type LangProgress } from '../core/save';
import { LANGS, type Brew, type IngredientId } from '../core/types';
import {
  walkSegment,
  endTownDay,
  ensureTownDay,
  hasNextSegment,
  nextInTown,
  nextSegment,
  planSegments,
  segmentDone,
  serveInTown,
  startTownDay,
  stockOf,
  unlockReady,
} from './day';
import { choosePlace, chooseHour, depart, handOver, knock, solveDelivery, someoneHome } from './delivery/engine';
import { finishMarket, openStall, orderUnits, pay, selectOffer, solveMarket } from './market/engine';
import { currentOrder } from './shop/engine';
import { witnessBrew } from './shop/rules';
import { townOf } from './town/text';

function solveShop(data: GameData, p: LangProgress, rng: () => number) {
  while (p.today!.phase !== 'closed') {
    const o = currentOrder(p)!;
    const shelf = new Set(ingredientsAtStage(data, p.stage).filter((i) => stockOf(p, i as IngredientId) !== 0));
    const brew: Brew = witnessBrew(o.rule, shelf, data.ing) ?? { counts: { water: 1 }, temp: null, method: null };
    serveInTown(data, p, brew, rng);
    nextInTown(data, p);
  }
}

/** Play whole days with the solvers. */
function playDays(data: GameData, p: LangProgress, days: number, seed: number, opts: { shortMarket?: boolean } = {}) {
  const rng = makeRng(seed);
  const log: { day: number; segments: string[] }[] = [];
  for (let d = 0; d < days; d++) {
    startTownDay(data, p, rng);
    log.push({ day: p.day, segments: [...p.townDay!.segments] });
    for (;;) {
      const seg = walkSegment(p);
      if (seg === 'market') {
        solveMarket(data, p, rng, { shortBy: opts.shortMarket ? 1 : 0 });
        finishMarket(data, p);
      } else if (seg === 'shop') solveShop(data, p, rng);
      else solveDelivery(data, p, rng);
      expect(segmentDone(p)).toBe(true);
      if (!hasNextSegment(p)) break;
      nextSegment(p);
    }
    endTownDay(p);
    expect(p.townDay).toBeNull();
  }
  return log;
}

describe('town planner', () => {
  const town = townOf(buildGameData(CONTENT.en, SHARED))!;
  const mu = town.shared.market.unlock;

  it('unlocks on day + reputation, or after the grace period (no hard gate)', () => {
    expect(unlockReady(mu, mu.minDay - 1, 999)).toBe(false);
    expect(unlockReady(mu, mu.minDay, mu.minReputation)).toBe(true);
    expect(unlockReady(mu, mu.minDay, 0)).toBe(false);
    expect(unlockReady(mu, mu.minDay + mu.graceDays, 0)).toBe(true);
  });

  it('shop only before anything opens; the market comes first the day it opens', () => {
    const p = newProgress('en');
    p.day = mu.minDay - 1;
    p.reputation = 999;
    expect(planSegments(town, p, makeRng(1)).segments).toEqual(['shop']);
    p.day = mu.minDay;
    const plan = planSegments(town, p, makeRng(1));
    expect(plan.segments).toEqual(['market', 'shop']);
    expect(plan.notes).toEqual([mu.noteJa]);
    expect(p.town.unlocked.market).toBe(mu.minDay);
    // without town content a day is the shop only
    expect(planSegments(null, newProgress('en'), makeRng(1)).segments).toEqual(['shop']);
  });

  it('an open activity runs at least every maxGap days', () => {
    const p = newProgress('en');
    p.town.unlocked.market = 1;
    p.town.lastDay.market = 3;
    p.day = 3 + mu.maxGap;
    for (let s = 0; s < 20; s++) expect(planSegments(town, p, makeRng(s)).segments[0]).toBe('market');
  });
});

describe.each(LANGS)('town days (%s)', (lang) => {
  const data = buildGameData(CONTENT[lang], SHARED);

  it('the first days are exactly the Phase 1 shop', () => {
    const p = newProgress(lang);
    startTownDay(data, p, makeRng(1));
    expect(p.townDay!.segments).toEqual(['shop']);
    expect(p.today!.queue.map((q) => q.key)).toEqual(['o1_lemon', 'o1_ginger', 'o1_mint', 'o1_honey']);
    expect(p.townDay!.stock).toEqual({});
  });

  it('20 days of good play open the market and deliveries and level them up', () => {
    const p = newProgress(lang);
    const log = playDays(data, p, 20, 7);
    const markets = log.filter((l) => l.segments.includes('market')).length;
    const deliveries = log.filter((l) => l.segments.includes('delivery')).length;
    expect(markets).toBeGreaterThanOrEqual(6);
    expect(deliveries).toBeGreaterThanOrEqual(4);
    expect(log.every((l) => l.segments.includes('shop'))).toBe(true);
    expect(p.town.marketRuns).toBe(markets);
    expect(p.town.deliveryRuns).toBe(deliveries);
    // town words flow into the shared word tracking
    for (const id of ['today', 'morning', 'mother'].filter((x) => data.lex.byId.has(x))) expect(p.words[id]?.seen ?? 0).toBeGreaterThan(0);
    // curriculum slips of reached levels are delivered perfectly
    expect(Object.values(p.town.slips).filter((s) => s.perfect).length).toBeGreaterThanOrEqual(4);
    expect(p.town.money).toBeGreaterThan(0);
  });

  it('buying too little leaves the shelf short and customers react to it', () => {
    const p = newProgress(lang);
    // fast-forward to a market day
    p.day = 6;
    p.stage = 6;
    p.reputation = 60;
    const rng = makeRng(4);
    let reacted = 0;
    for (let d = 0; d < 6; d++) {
      startTownDay(data, p, rng);
      if (walkSegment(p) === 'market') {
        // buy nothing at all
        finishMarket(data, p);
        const short = Object.keys(p.townDay!.stock) as IngredientId[];
        expect(short.length).toBeGreaterThan(0);
        for (const ing of short) expect(stockOf(p, ing)).toBe(0);
        nextSegment(p);
      }
      const before = p.today!.results.length;
      solveShop(data, p, rng);
      const stockLines = new Set(CONTENT[lang].town!.market.stockReactions.map((r) => r.text.split('{')[0]));
      reacted += p.today!.results.slice(before).filter((r) => [...stockLines].some((s) => s && r.reaction.startsWith(s))).length;
      while (hasNextSegment(p)) {
        nextSegment(p);
        solveDelivery(data, p, rng);
      }
      endTownDay(p);
    }
    expect(reacted).toBeGreaterThan(0);
  });

  it('market actions: underpaying is refused, exact payment buys, stock follows the basket', () => {
    const p = newProgress(lang);
    p.day = 5;
    p.stage = 5;
    p.reputation = 20;
    const rng = makeRng(9);
    startTownDay(data, p, rng);
    expect(walkSegment(p)).toBe('market');
    const md = p.townDay!.market!;
    const line = md.lines[0];
    const st = md.stalls.find((s) => s.offers.some((o) => o.good === line.good))!;
    const offer = st.offers.find((o) => o.good === line.good)!;
    openStall(data, p, st.id, rng);
    expect(md.talk.length).toBeGreaterThan(0);
    selectOffer(data, p, offer.id, rng);
    expect(orderUnits(data, p, line.units, rng)).toBe(true);
    const total = md.pending!.total;
    expect(total).toBe(line.units * offer.price);
    const money = p.town.money;
    expect(pay(data, p, total - 1, rng)).toMatchObject({ kind: 'not_enough', accepted: false });
    expect(p.town.money).toBe(money);
    expect(pay(data, p, total, rng)).toMatchObject({ kind: 'exact', accepted: true });
    expect(p.town.money).toBe(money - total);
    finishMarket(data, p);
    expect(stockOf(p, line.good)).toBeGreaterThanOrEqual(line.portions);
    expect(md.done).toBe(true);
  });

  it('level-1 overpayment is lost money (no change yet)', () => {
    const p = newProgress(lang);
    p.day = 5;
    p.stage = 5;
    p.reputation = 20;
    const rng = makeRng(10);
    startTownDay(data, p, rng);
    const md = p.townDay!.market!;
    expect(md.features).not.toContain('change');
    const o = md.stalls.flatMap((s) => s.offers)[0];
    openStall(data, p, md.stalls.find((s) => s.offers.includes(o))!.id, rng);
    selectOffer(data, p, o.id, rng);
    orderUnits(data, p, 1, rng);
    const money = p.town.money;
    expect(pay(data, p, o.price + 5, rng)).toMatchObject({ kind: 'overpaid', accepted: true });
    expect(p.town.money).toBe(money - o.price - 5);
  });

  it('a delivery to the wrong house fails and costs reputation; the curriculum slip comes back', () => {
    const p = newProgress(lang);
    p.day = 9;
    p.stage = 9;
    p.reputation = 50;
    p.town.unlocked = { market: 5, delivery: 9 };
    p.town.lastDay = { market: 8 };
    const rng = makeRng(3);
    startTownDay(data, p, rng);
    expect(p.townDay!.segments).toContain('delivery');
    solveShop(data, p, rng);
    while (walkSegment(p) !== 'delivery') {
      if (walkSegment(p) === 'market') {
        solveMarket(data, p, rng);
        finishMarket(data, p);
      }
      nextSegment(p);
    }
    const x = p.townDay!.delivery!;
    expect(x.slip.source).toEqual({ type: 'authored', id: 'd1_school' });
    const rep = p.reputation;
    choosePlace(p, 'h11');
    chooseHour(p, x.slip.rule.slots![0]);
    expect(depart(p)).toBe(true);
    knock(p, 1);
    expect(someoneHome(x)).toBe(true);
    handOver(data, p, { person: x.household[0] }, rng);
    expect(x.result!.issues[0]).toBe('wrong_place');
    expect(p.reputation).toBe(rep - 1);
    endTownDay(p);
    // next delivery day: the same curriculum slip again
    p.town.lastDay.delivery = p.day - 5;
    startTownDay(data, p, rng);
    expect(p.townDay!.delivery?.slip.source.id).toBe('d1_school');
  });
});

describe('saves', () => {
  it('a v1 save in the middle of a shop day continues as a shop-only day', () => {
    const data = buildGameData(CONTENT.zh, SHARED);
    const p = newProgress('zh');
    startTownDay(data, p, makeRng(1));
    const { town: _t, townDay: _d, ...v1progress } = p;
    void _t;
    void _d;
    const s = migrateSave({ version: 1, currentLang: 'zh', settings: {}, progress: { zh: v1progress } });
    const q = s.progress.zh!;
    expect(q.town.marketRuns).toBe(0);
    expect(q.townDay).toBeNull();
    ensureTownDay(data, q, makeRng(2));
    expect(q.townDay!.segments).toEqual(['shop']);
    expect(q.today!.queue.length).toBe(p.today!.queue.length);
  });
});
