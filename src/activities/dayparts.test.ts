import { describe, expect, it } from 'vitest';
import { CONTENT, SHARED } from '../content';
import { buildGameData, ingredientsAtStage, type GameData } from '../core/gamedata';
import { makeRng } from '../core/rng';
import { migrateSave, newProgress, SAVE_VERSION, type LangProgress } from '../core/save';
import type { IngredientId } from '../core/types';
import { activeCard } from '../story/engine';
import {
  DELIVERY_FEE,
  dayPart,
  endTownDay,
  ensureTownDay,
  goDelivery,
  goMarket,
  leaveMarket,
  marketAccess,
  nextInTown,
  openShop,
  serveInTown,
  startTownDay,
  stockOf,
  teaPart,
} from './day';
import { finishMarket, maxUnits, openStall, orderUnits, pay, selectOffer, solveMarket } from './market/engine';
import { currentOrder } from './shop/engine';
import { witnessBrew } from './shop/rules';
import { playTeaHouse, simulatePlayer } from './simPlayer';

const zh = buildGameData(CONTENT.zh, SHARED);

/** Serve the current customer right (with what the shelf has) and move on. */
function serveOne(data: GameData, p: LangProgress, rng: () => number) {
  const o = currentOrder(p)!;
  const shelf = new Set(ingredientsAtStage(data, p.stage).filter((i) => stockOf(p, i as IngredientId) !== 0));
  serveInTown(data, p, witnessBrew(o.rule, shelf, data.ing) ?? { counts: { water: 1 }, temp: null, method: null }, rng);
  nextInTown(data, p);
}

/** A zh progress whose next day is a market day with a shopping note. */
function marketMorning(seed = 3): LangProgress {
  const { p } = simulatePlayer({ lang: 'zh', days: 6, accuracy: 1, seed });
  const rng = makeRng(seed);
  for (let i = 0; i < 12; i++) {
    startTownDay(zh, p, rng);
    if (p.townDay?.market?.lines.length) return p;
    playTeaHouse(zh, p, 1, rng, makeRng(9));
    endTownDay(p, zh);
  }
  throw new Error('no market day');
}

/** Buy one note line at the first stall that has it. */
function buyLine(data: GameData, p: LangProgress, rng: () => number, good: IngredientId, units: number) {
  const md = p.townDay!.market!;
  for (const st of md.stalls) {
    const o = st.offers.find((x) => x.good === good);
    if (!o) continue;
    openStall(data, p, st.id, rng);
    selectOffer(data, p, o.id, rng);
    orderUnits(data, p, Math.min(units, maxUnits(o)), rng);
    if (md.pending) pay(data, p, md.pending.total, rng);
    return;
  }
}

describe('the day in three parts (始業前 / 業務中 / 業務後)', () => {
  it('a day starts before opening, in the shop, with nothing playing by itself', () => {
    const p = newProgress('zh');
    startTownDay(zh, p, makeRng(1));
    expect(teaPart(p)).toBe(0);
    expect(dayPart(p)).toBe(0);
    expect(p.townDay!.at).toBe('shop');
    // day 1: the chapter title, the first letter, the morning's moment all wait in the scene
    expect(p.story.cards.length).toBeGreaterThan(0);
    expect(activeCard(p)).toBeNull();
    openShop(p);
    expect(teaPart(p)).toBe(1);
    while (p.today!.phase !== 'closed') serveOne(zh, p, makeRng(2));
    expect(teaPart(p)).toBe(2);
    endTownDay(p, zh);
    expect(p.day).toBe(2);
  });

  it('before opening: the market as often as wanted; the goods go on today’s shelf', () => {
    const p = marketMorning();
    const rng = makeRng(4);
    const line = p.townDay!.market!.lines[0];
    expect(stockOf(p, line.good)).toBe(0);
    expect(marketAccess(p)).toEqual({ mode: 'visit', fee: 0, why: null });
    const money = p.town.money;
    expect(goMarket(zh, p, rng)).toBeNull();
    expect(p.town.money).toBe(money); // no fee
    expect(p.townDay!.at).toBe('market');
    solveMarket(zh, p, rng);
    leaveMarket(zh, p, finishMarket);
    expect(p.townDay!.at).toBe('shop');
    expect(stockOf(p, line.good)!).toBeGreaterThanOrEqual(line.portions);
    // a second trip
    expect(goMarket(zh, p, rng)).toBeNull();
    buyLine(zh, p, rng, line.good, 1);
    leaveMarket(zh, p, finishMarket);
    expect(p.townDay!.market!.trips).toBe(2);
    expect(p.town.marketRuns).toBeGreaterThan(0);
  });

  it('during working hours: no shopping in person, but goods ordered by delivery (fee) come with the next customer', () => {
    const p = marketMorning(5);
    const rng = makeRng(6);
    const line = p.townDay!.market!.lines[0];
    openShop(p);
    expect(stockOf(p, line.good)).toBe(0);
    // nothing ordered: the fee comes back
    const m0 = p.town.money;
    expect(goMarket(zh, p, rng)).toBeNull();
    expect(p.town.money).toBe(m0 - DELIVERY_FEE);
    leaveMarket(zh, p, finishMarket);
    expect(p.town.money).toBe(m0);
    // an order: fee + goods; on its way until the next customer comes in
    expect(goMarket(zh, p, rng)).toBeNull();
    expect(p.townDay!.market!.mode).toBe('order');
    buyLine(zh, p, rng, line.good, line.units);
    const paid = m0 - p.town.money;
    expect(paid).toBeGreaterThan(DELIVERY_FEE);
    leaveMarket(zh, p, finishMarket);
    expect(p.townDay!.incoming!.length).toBe(1);
    expect(stockOf(p, line.good)).toBe(0);
    expect(p.townDay!.fees).toBe(DELIVERY_FEE);
    serveOne(zh, p, rng);
    expect(p.townDay!.incoming!.length).toBe(0);
    expect(stockOf(p, line.good)!).toBeGreaterThan(0);
    expect(p.townDay!.arrived!.length).toBe(1);
    // the last customer: nobody comes after, so nothing can be ordered
    while (p.today!.index < p.today!.queue.length - 1) serveOne(zh, p, rng);
    expect(marketAccess(p)!.why).toMatch(/あとのお客さん/);
    expect(goMarket(zh, p, rng)).not.toBeNull();
  });

  it('after closing: the house delivery is optional; the evening market buys for tomorrow', () => {
    const p = marketMorning(7);
    const rng = makeRng(8);
    openShop(p);
    while (p.today!.phase !== 'closed') serveOne(zh, p, rng);
    expect(teaPart(p)).toBe(2);
    if (p.townDay!.delivery) expect(goDelivery(p)).toBe(true);
    p.townDay!.at = 'shop'; // not now
    expect(marketAccess(p)!.mode).toBe('evening');
    const good = p.townDay!.market!.stalls.flatMap((s) => s.offers)[0].good;
    expect(goMarket(zh, p, rng)).toBeNull();
    buyLine(zh, p, rng, good, 2);
    leaveMarket(zh, p, finishMarket);
    const kept = p.town.pantry![good]!;
    expect(kept).toBeGreaterThan(0);
    endTownDay(p, zh);
    // tomorrow is a day the shop counts its goods; what was bought last night is on the shelf
    startTownDay(zh, p, rng);
    expect(p.townDay!.market).toBeTruthy();
    expect(stockOf(p, good)!).toBeGreaterThanOrEqual(kept);
    expect(p.townDay!.market!.lines.every((l) => l.good !== good || l.portions > 0)).toBe(true);
    expect(Object.keys(p.town.pantry ?? {})).toEqual([]);
  });
});

describe('save migration v5 → v6', () => {
  const base = () => {
    const p = newProgress('zh');
    startTownDay(zh, p, makeRng(1));
    const s = JSON.parse(JSON.stringify(p));
    delete s.townDay.part;
    delete s.townDay.at;
    for (const c of s.story.cards) delete c.deferred;
    return s;
  };
  const migrate = (p: unknown) => migrateSave({ version: 5, currentLang: 'zh', settings: {}, progress: { zh: p } }).progress.zh!;
  it('a day at the market, before the first cup, mid-way and closed land where they were', () => {
    const atMarket = base();
    atMarket.townDay.segments = ['market', 'shop'];
    atMarket.townDay.market = { done: false, stall: 'red', basket: [], visited: ['red'] };
    const notBegun = base();
    notBegun.townDay.segments = ['market', 'shop'];
    notBegun.townDay.market = { done: false, stall: null, basket: [], visited: [] };
    expect(migrate(notBegun).townDay).toMatchObject({ part: 0, at: 'shop' });
    expect(migrate(atMarket).townDay).toMatchObject({ part: 0, at: 'market' });
    expect(migrate(base()).townDay).toMatchObject({ part: 0, at: 'shop' });
    const mid = base();
    mid.today.index = 2;
    expect(migrate(mid).townDay).toMatchObject({ part: 1, at: 'shop' });
    const closed = base();
    closed.today.phase = 'closed';
    expect(migrate(closed).townDay).toMatchObject({ part: 2 });
    const out = base();
    out.today.phase = 'closed';
    out.townDay.segments = ['shop', 'delivery'];
    out.townDay.seg = 1;
    out.townDay.delivery = { phase: 'plan' };
    expect(migrate(out).townDay).toMatchObject({ part: 2, at: 'delivery' });
    expect(SAVE_VERSION).toBe(6);
  });
  it('the morning’s story cards wait in the scene; the jobs’ day gets its workplace', () => {
    const s = base();
    expect(s.story.cards.length).toBeGreaterThan(0);
    const m = migrate(s);
    expect(m.story.cards.filter((c) => c.kind === 'chapter' || c.kind === 'doc').every((c) => c.deferred)).toBe(true);
    const morning = { ...base(), jobs: { boardOpen: 1, jobs: {}, goods: {}, wordJobs: {}, seen: [], timed: false, day: { day: 1, part: 0, view: 'hub', tea: 'none', log: [], shift: null, notes: [] } } };
    expect(migrate(morning).jobs!.day).toMatchObject({ work: 'teahouse', part: 0, view: 'teahouse', tea: 'active' });
    const shift = { ...base(), jobs: { ...morning.jobs, day: { ...morning.jobs.day, part: 1, view: 'job', shift: { job: 'post', part: 1, phase: 'task', tasks: [], index: 0, results: [] } } } };
    expect(migrate(shift).jobs!.day).toMatchObject({ work: 'post', part: 1, view: 'job' });
    const evening = { ...base(), jobs: { ...morning.jobs, day: { ...morning.jobs.day, part: 2, log: [{ part: 0, job: 'post', tasks: 4, good: 4, coins: 12 }] } } };
    expect(migrate(evening).jobs!.day).toMatchObject({ work: 'post', part: 2, view: 'hub' });
  });
  it('an old day runs on after loading', () => {
    const s = base();
    s.today.index = 1;
    const p = migrate(s);
    ensureTownDay(zh, p, makeRng(3));
    expect(teaPart(p)).toBe(1);
    while (p.today!.phase !== 'closed') serveOne(zh, p, makeRng(4));
    endTownDay(p, zh);
    expect(p.day).toBe(2);
  });
});
