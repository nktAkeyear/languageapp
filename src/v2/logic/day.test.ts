import { describe, expect, it } from 'vitest';
import { makeRng } from '../../core/rng';
import { unknownTokens } from '../../core/tokenize';
import { currentOrder } from '../../activities/shop/engine';
import { witnessBrew } from '../../activities/shop/rules';
import { ingredientsAtStage } from '../../core/gamedata';
import { currentShift, currentTask, ruleCtx, jobById, jobContent } from '../../jobs/engine';
import { solveTask } from '../../jobs/rules';
import type { IngredientId } from '../../core/types';
import { gameData } from '../data';
import { CLINIC_SUPPLIES } from './catalog';
import {
  addPortion,
  catalogFor,
  chooseWorkplace,
  clinicNext,
  clinicSubmit,
  closeWork,
  endDay,
  goRoom,
  marketBuy,
  morningNote,
  newGame,
  nextCustomer,
  openWork,
  orderDelivery,
  serveCup,
  setMethod,
  setTemp,
  shelfItems,
  teaAvailable,
  tick,
  unitPhrase,
  type Ctx,
} from './day';
import { parseState } from './state';

const data = gameData();
function ctx(now = 0, seed = 1): Ctx {
  return { data, rng: makeRng(seed), now };
}
const tokOk = (text: string) => unknownTokens(data.tokens(text), 'en');

/** Make the right cup for the current customer (ignoring stock) and hand it over. */
function serveRight(s: ReturnType<typeof newGame>, c: Ctx) {
  const o = currentOrder(s.p)!;
  const w = witnessBrew(o.rule, new Set(ingredientsAtStage(data, s.p.stage)), data.ing)!;
  for (const [ing, n] of Object.entries(w.counts)) for (let i = 0; i < (n ?? 0); i++) addPortion(c, s, ing as IngredientId);
  if (w.temp) setTemp(s, w.temp);
  if (w.method) setMethod(s, w.method);
  return serveCup(s, c);
}

describe('v2 day: the tea house', () => {
  it('every unit phrase on the order form and every morning note tokenises', () => {
    for (const wp of ['teahouse', 'clinic'] as const)
      for (const it of catalogFor(data, wp)) for (const n of [1, 2, 3, 7]) expect(tokOk(unitPhrase(it, n)), `${it.id} ${n}`).toEqual([]);
    for (const seed of [1, 2, 3]) {
      const s = newGame(ctx(0, seed), { level: 0, toeic: null });
      for (const line of morningNote(data, s)) expect(tokOk(line), line).toEqual([]);
    }
    expect(tokOk('We have enough today.')).toEqual([]);
  });

  it('starts in the Back room before opening, with counts on every shelf item', () => {
    const s = newGame(ctx(), { level: 0, toeic: null });
    expect(s.day).toMatchObject({ day: 1, part: 0, room: 'back', workplace: 'teahouse' });
    for (const it of shelfItems(data, s)) expect(typeof s.stock.teahouse[it.id]).toBe('number');
    expect(goRoom(s, 'market')).toBeNull();
    expect(goRoom(s, 'back')).toBeNull();
    openWork(s, ctx());
    expect(s.day).toMatchObject({ part: 1, room: 'front' });
    // during hours nobody walks to the market
    expect(goRoom(s, 'market')).not.toBeNull();
    expect(goRoom(s, 'town')).not.toBeNull();
  });

  it('serving uses the cup portions from the shelf; an empty jar cannot be used', () => {
    const c = ctx();
    const s = newGame(c, { level: 0, toeic: null });
    openWork(s, c);
    s.stock.teahouse.mint = 1;
    const o = currentOrder(s.p)!;
    void o;
    expect(addPortion(c, s, 'mint')).toBe(true);
    expect(teaAvailable(s, 'mint')).toBe(0);
    expect(addPortion(c, s, 'mint')).toBe(false);
    const before = { ...s.stock.teahouse };
    const used = { ...s.brew.counts };
    const r = serveCup(s, c)!;
    expect(r.reaction.length).toBeGreaterThan(0);
    for (const [id, n] of Object.entries(used)) expect(s.stock.teahouse[id]).toBe((before[id] ?? 0) - (n ?? 0));
    expect(s.tally.used.mint).toBe(1);
  });

  it('runs out, orders by delivery during hours, the crate arrives and the count goes up', () => {
    const s = newGame(ctx(0), { level: 0, toeic: null });
    openWork(s, ctx(0));
    s.stock.teahouse.honey = 0;
    const money = s.p.town.money;
    const r = orderDelivery(s, ctx(1000), [{ id: 'honey', units: 1 }]);
    expect('delivery' in r).toBe(true);
    const per = catalogFor(data, 'teahouse').find((c) => c.id === 'honey')!.per;
    expect(s.p.town.money).toBeLessThan(money);
    tick(s, ctx(2000));
    expect(s.stock.teahouse.honey).toBe(0);
    tick(s, ctx(1000 + 8000));
    expect(s.stock.teahouse.honey).toBe(per);
    expect(s.arrived.at(-1)).toMatchObject({ via: 'crate', lines: [{ id: 'honey', portions: per }] });
  });

  it('three days: buy after closing, tomorrow starts with it on the shelf; stock carries over', () => {
    let now = 0;
    const s = newGame(ctx(now), { level: 0, toeic: null });
    for (let day = 1; day <= 3; day++) {
      expect(s.day.day).toBe(day);
      openWork(s, ctx(now));
      let guard = 0;
      while (s.p.today && s.p.today.phase !== 'closed' && guard++ < 20) {
        // keep the shelf stocked for the right cup
        for (const it of shelfItems(data, s)) s.stock.teahouse[it.id] = Math.max(s.stock.teahouse[it.id] ?? 0, 6);
        expect(serveRight(s, ctx(now))?.outcome).toBe('perfect');
        nextCustomer(s, ctx(now));
      }
      closeWork(s);
      expect(s.day).toMatchObject({ part: 2, room: 'back' });
      // after closing: the market in person, and an order for tomorrow
      const lemon0 = s.stock.teahouse.lemon;
      expect(marketBuy(s, ctx(now), 'lemon', 1, 3)).toMatchObject({ ok: true, portions: 3 });
      expect(s.stock.teahouse.lemon).toBe(lemon0 + 3);
      const ginger0 = s.stock.teahouse.ginger;
      orderDelivery(s, ctx(now), [{ id: 'ginger', units: 1 }]);
      now += 60_000;
      tick(s, ctx(now));
      expect(s.stock.teahouse.ginger).toBe(ginger0); // not tonight
      const snapshot = { ...s.stock.teahouse };
      endDay(s, ctx(now));
      expect(s.day).toMatchObject({ day: day + 1, part: 0, room: 'back' });
      expect(s.stock.teahouse.ginger).toBe(ginger0 + 6);
      for (const [id, n] of Object.entries(snapshot)) if (id !== 'ginger') expect(s.stock.teahouse[id]).toBe(n);
    }
  });

  it('reload mid-day restores the same state', () => {
    const c = ctx();
    const s = newGame(c, { level: 0, toeic: null });
    openWork(s, c);
    addPortion(c, s, 'lemon');
    const back = parseState(JSON.stringify(s))!;
    expect(back.day).toEqual(s.day);
    expect(back.brew).toEqual(s.brew);
    expect(back.stock).toEqual(s.stock);
    expect(currentOrder(back.p)?.key).toBe(currentOrder(s.p)?.key);
  });

  it('a 英検2級 start jumps the shop and places the clinic at rank 3; the shelf holds every stage ingredient', () => {
    const s = newGame(ctx(), { level: 5, toeic: null });
    expect(s.p.stage).toBeGreaterThan(20);
    expect(s.p.jobs?.jobs.clinic?.rank).toBe(3);
    for (const it of shelfItems(data, s)) expect(s.stock.teahouse[it.id]).toBeGreaterThan(0);
    // assumed-known words are never confirmed by the level
    expect(Object.values(s.p.words).some((w) => w.seeded)).toBe(true);
    expect(Object.values(s.p.words).every((w) => !w.seeded || !w.confirmed)).toBe(true);
  });
});

describe('v2 day: the clinic', () => {
  for (const level of [3, 4, 5]) {
    it(`a whole shift at the rank of 英検 level ${level}, with supplies used and reordered`, () => {
      let now = 0;
      const s = newGame(ctx(now, level), { level, toeic: null });
      chooseWorkplace(s, ctx(now), 'clinic');
      expect(s.day.workplace).toBe('clinic');
      expect(s.p.today).toBeNull();
      for (const line of morningNote(data, s)) expect(tokOk(line), line).toEqual([]);
      openWork(s, ctx(now));
      const job = jobById(data, 'clinic')!;
      const jc = jobContent(data, job)!;
      let n = 0;
      while (currentShift(s.p)?.phase === 'task' && n < 12) {
        const t = currentTask(s.p)!;
        const answer = solveTask(t.spec, ruleCtx(data, jc));
        let r = clinicSubmit(s, ctx(now), answer);
        if (r && 'reason' in r) {
          // out of a supply: order it, it comes, then hand in
          orderDelivery(s, ctx(now), [{ id: r.supply, units: 1 }]);
          now += 9000;
          tick(s, ctx(now));
          r = clinicSubmit(s, ctx(now), answer);
        }
        expect(r && 'result' in r && r.result.outcome).toBe('perfect');
        clinicNext(s, ctx(now));
        n++;
      }
      expect(currentShift(s.p)?.phase).toBe('done');
      closeWork(s);
      expect(s.day.part).toBe(2);
      for (const it of CLINIC_SUPPLIES) expect(s.stock.clinic[it.id]).toBeGreaterThanOrEqual(0);
      endDay(s, ctx(now));
      expect(s.day).toMatchObject({ day: 2, part: 0, workplace: 'teahouse' });
    });
  }
});
