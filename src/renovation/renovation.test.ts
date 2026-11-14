import { describe, expect, it } from 'vitest';
import { currentSegment, endTownDay, hasNextSegment, nextSegment, serveInTown, startTownDay, stockOf } from '../activities/day';
import { solveDelivery } from '../activities/delivery/engine';
import { finishMarket, planMarket, solveMarket } from '../activities/market/engine';
import { currentOrder, nextCustomer, type ServeOutcome } from '../activities/shop/engine';
import { witnessBrew } from '../activities/shop/rules';
import { CONTENT, SHARED } from '../content';
import { buildGameData, ingredientsAtStage, type GameData } from '../core/gamedata';
import { makeRng } from '../core/rng';
import { exportSave, importSave, migrateSave, newProgress, type LangProgress } from '../core/save';
import { LANGS, type Brew, type IngredientId, type OrderInstance } from '../core/types';
import { storyAutoPlay } from '../story/engine';
import {
  arrivedToday,
  catalogue,
  effectsOf,
  extraOrder,
  owns,
  renoAfterServe,
  renoCancel,
  renoCarry,
  renoEndDay,
  renoOf,
  renoOrder,
  renoSpentToday,
  renoTipBonus,
} from './engine';
import type { UpgradeId } from './types';

const data: Record<string, GameData> = Object.fromEntries(LANGS.map((l) => [l, buildGameData(CONTENT[l], SHARED)]));
const en = data.en;

function playShop(d: GameData, p: LangProgress, rng: () => number) {
  while (p.today!.phase !== 'closed') {
    const o = currentOrder(p)!;
    const shelf = new Set(ingredientsAtStage(d, p.stage).filter((i) => stockOf(p, i as IngredientId) !== 0));
    const brew: Brew = witnessBrew(o.rule, shelf, d.ing) ?? { counts: { water: 1 }, temp: null, method: null };
    serveInTown(d, p, brew, rng);
    nextCustomer(d, p);
  }
}

/** Play whole days with the solvers (good player); `onShopClosed` runs after the shop segment. */
function playDays(d: GameData, p: LangProgress, days: number, rng: () => number, onShopClosed?: () => void) {
  for (let i = 0; i < days; i++) {
    startTownDay(d, p, rng);
    storyAutoPlay(d, p, (b) => b.choice?.[0]?.id ?? '');
    for (;;) {
      const seg = currentSegment(p);
      if (seg === 'market') {
        solveMarket(d, p, rng);
        finishMarket(d, p);
      } else if (seg === 'shop') {
        playShop(d, p, rng);
        onShopClosed?.();
      } else solveDelivery(d, p, rng);
      storyAutoPlay(d, p, (b) => b.choice?.[0]?.id ?? '');
      if (!hasNextSegment(p)) break;
      nextSegment(p);
    }
    endTownDay(p, d);
    storyAutoPlay(d, p, (b) => b.choice?.[0]?.id ?? '');
  }
}

function give(p: LangProgress, ...ids: UpgradeId[]) {
  for (const id of ids) renoOf(p).owned[id] = p.day - 1;
}

/** A progress in the middle of a day with one served (perfect) cup of `order`. */
function servedCup(order: Partial<OrderInstance>, outcome: 'perfect' | 'fail' = 'perfect') {
  const p = newProgress('en');
  p.day = 20;
  const o = { key: 'k1', text: 'Lemon, please.', customer: 'c_sailor', audioOnly: false, source: { type: 'template', id: 't' }, rule: { require: [{ ing: 'lemon' }] }, ...order } as OrderInstance;
  p.today = { day: 20, queue: [o], index: 0, phase: 'reaction', results: [{ key: 'k1', customer: o.customer, outcome, repDelta: 1, reaction: 'Thank you!', face: 'happy' }], notes: [], newWords: [] };
  const out = { evaluation: { outcome, issues: [] }, reaction: { text: 'Thank you!', face: 'happy' }, repDelta: 1 } as unknown as ServeOutcome;
  return { p, out };
}

describe('catalogue', () => {
  it('grows with the days and respects prerequisites', () => {
    const p = newProgress('en');
    expect(catalogue(en, p)).toEqual([]);
    p.day = 4;
    expect(catalogue(en, p).map((e) => e.def.id)).toEqual(['signboard', 'plant']);
    p.day = 40;
    p.stage = 23;
    p.reputation = 400;
    p.town.unlocked = { market: 5, delivery: 9 };
    const ids = catalogue(en, p).map((e) => e.def.id);
    expect(ids).not.toContain('cellar'); // needs the shelf
    expect(ids).not.toContain('bicycle'); // needs the cart
    give(p, 'shelf', 'cart');
    const all = catalogue(en, p).map((e) => e.def.id);
    expect(all).toContain('cellar');
    expect(all).toContain('bicycle');
    expect(all.length).toBe(SHARED.renovation!.upgrades.length);
  });

  it('every entry has text in both languages, and the whole set costs about the 40-day income', () => {
    for (const l of LANGS) for (const u of SHARED.renovation!.upgrades) expect(CONTENT[l].renovation!.upgrades[u.id]?.lines.length).toBeGreaterThan(0);
    const total = SHARED.renovation!.upgrades.reduce((a, u) => a + u.price, 0);
    expect(total).toBeGreaterThan(600);
    expect(total).toBeLessThan(1100);
  });

  it('orders cost coins, can be taken back the same day, and arrive the next morning', () => {
    const p = newProgress('en');
    const rng = makeRng(3);
    playDays(en, p, 3, rng);
    expect(p.day).toBe(4);
    p.town.money = 100;
    expect(renoOrder(en, p, 'bench')).not.toBeNull(); // not in the catalogue yet
    expect(renoOrder(en, p, 'plant')).toBeNull();
    expect(p.town.money).toBe(85);
    expect(renoOrder(en, p, 'plant')).not.toBeNull(); // already ordered
    expect(renoOrder(en, p, 'signboard')).toBeNull();
    expect(renoSpentToday(p)).toBe(40);
    expect(renoCancel(en, p, 'signboard')).toBe(true);
    expect(p.town.money).toBe(85);
    expect(renoSpentToday(p)).toBe(15);
    p.town.money = 3;
    expect(renoOrder(en, p, 'signboard')).toBe('お金が足りません');
    expect(catalogue(en, p).find((e) => e.def.id === 'plant')?.status).toBe('ordered');
    playDays(en, p, 1, rng);
    // the ledger counts the purchase apart from the takings
    expect(p.story.lastLedger?.purchases).toBe(15);
    startTownDay(en, p, rng);
    expect(owns(p, 'plant')).toBe(true);
    expect(arrivedToday(p)).toEqual(['plant']);
    expect(p.today!.notes.some((n) => n.includes('届いた'))).toBe(true);
    expect(catalogue(en, p).find((e) => e.def.id === 'plant')?.status).toBe('owned');
  });
});

describe('upgrade effects', () => {
  it('bench: one more customer every day', () => {
    const base = newProgress('en');
    playDays(en, base, 9, makeRng(5));
    const a = structuredClone(base);
    const b = structuredClone(base);
    give(b, 'bench');
    startTownDay(en, a, makeRng(77));
    startTownDay(en, b, makeRng(77));
    expect(b.today!.queue.length).toBe(a.today!.queue.length + 1);
    // the extra customer reviews words already met and is never the first at the counter
    const extra = b.today!.queue.find((q) => !a.today!.queue.some((x) => x.key === q.key))!;
    expect(b.today!.queue.indexOf(extra)).toBeGreaterThan(0);
    expect(extraOrder(en, b, makeRng(1))).not.toBeNull();
  });

  it('kettle / ice box / scales: a coin more for a perfect hot / cold / exact cup; nothing for a failed one', () => {
    const hot = servedCup({ rule: { require: [{ ing: 'ginger' }], temp: 'hot' } });
    give(hot.p, 'kettle');
    const m0 = hot.p.town.money;
    renoAfterServe(en, hot.p, hot.out, makeRng(1), true);
    expect(hot.p.town.money).toBe(m0 + 1);

    const cold = servedCup({ rule: { require: [{ ing: 'mint' }], temp: 'cold' } });
    give(cold.p, 'kettle', 'icebox');
    renoAfterServe(en, cold.p, cold.out, makeRng(1), true);
    expect(cold.p.town.money).toBe(m0 + 1);

    const exact = servedCup({ rule: { require: [{ ing: 'lemon', min: 2, max: 2 }], temp: 'hot' } });
    give(exact.p, 'kettle', 'scales');
    renoAfterServe(en, exact.p, exact.out, makeRng(1), true);
    expect(exact.p.town.money).toBe(m0 + 2);

    const failed = servedCup({ rule: { require: [{ ing: 'lemon', min: 2, max: 2 }], temp: 'hot' } }, 'fail');
    give(failed.p, 'kettle', 'scales');
    renoAfterServe(en, failed.p, failed.out, makeRng(1), true);
    expect(failed.p.town.money).toBe(m0);
  });

  it('lantern: a returning customer served perfectly adds reputation', () => {
    const { p, out } = servedCup({ returning: true });
    give(p, 'lantern');
    const rep = p.reputation;
    renoAfterServe(en, p, out, makeRng(1), true);
    expect(p.reputation).toBe(rep + 1);
    expect(p.today!.results[0].repDelta).toBe(2);
    expect(out.repDelta).toBe(2);
  });

  it('signboard: +1 reputation at the end of a day with a perfect cup', () => {
    const { p } = servedCup({});
    p.today!.phase = 'closed';
    give(p, 'signboard');
    const rep = p.reputation;
    renoEndDay(en, p);
    expect(p.reputation).toBe(rep + 1);
    const bad = servedCup({}, 'fail');
    give(bad.p, 'signboard');
    renoEndDay(en, bad.p);
    expect(bad.p.reputation).toBe(0);
  });

  it('shelf / cellar / ice box keep leftover market goods overnight', () => {
    const { p } = servedCup({});
    p.townDay = { day: 20, segments: ['market', 'shop'], seg: 1, notes: [], stock: { lemon: 5, honey: 7, mint: 0 }, moneyStart: 0 };
    renoEndDay(en, p);
    expect(renoOf(p).carry).toEqual({}); // nothing kept without storage
    give(p, 'shelf');
    renoEndDay(en, p);
    expect(renoCarry(en, p)).toEqual({ lemon: 3, honey: 3 });
    give(p, 'cellar');
    renoEndDay(en, p);
    expect(renoCarry(en, p)).toEqual({ lemon: 3, honey: 7 });
    give(p, 'icebox');
    renoEndDay(en, p);
    expect(renoCarry(en, p)).toEqual({ lemon: 5, honey: 7 });
  });

  it('the market note asks only for what is not kept, and the kept goods are in stock', () => {
    const p = newProgress('en');
    playDays(en, p, 9, makeRng(9));
    const queue = [{ rule: { require: [{ ing: 'lemon' as IngredientId, min: 3, max: 3 }] } }];
    const without = planMarket(en, structuredClone(p), queue, makeRng(4))!;
    expect(without.lines.map((l) => l.good)).toContain('lemon');
    const kept = planMarket(en, structuredClone(p), queue, makeRng(4), { lemon: 5 })!;
    expect(kept.lines.map((l) => l.good)).not.toContain('lemon');
    const part = planMarket(en, structuredClone(p), queue, makeRng(4), { lemon: 3 })!;
    expect(part.lines.find((l) => l.good === 'lemon')?.portions).toBe(2);

    // Through a real day: what is kept starts the day in stock, bought portions are added.
    for (let tries = 0; tries < 6; tries++) {
      const q = structuredClone(p);
      give(q, 'shelf', 'cellar', 'icebox');
      const goods = SHARED.town!.market.goods.map((g) => g.ingredient).filter((g) => ingredientsAtStage(en, q.stage).includes(g));
      renoOf(q).carry = Object.fromEntries(goods.map((g) => [g, 2]));
      startTownDay(en, q, makeRng(100 + tries));
      if (!q.townDay!.market) continue;
      for (const g of goods) expect(q.townDay!.stock[g]).toBe(2);
      solveMarket(en, q, makeRng(1));
      finishMarket(en, q);
      for (const l of q.townDay!.market.lines) expect(q.townDay!.stock[l.good]!).toBeGreaterThanOrEqual(2 + l.portions);
      return;
    }
    throw new Error('no market day found');
  });

  it('cart: a delivery every day once deliveries have opened; bicycle: a bigger tip', () => {
    const p = newProgress('zh');
    const zh = data.zh;
    playDays(zh, p, 14, makeRng(21));
    expect(p.town.unlocked.delivery).toBeDefined();
    give(p, 'cart');
    expect(effectsOf(zh, p).deliveryDaily).toBe(true);
    const rng = makeRng(8);
    for (let i = 0; i < 6; i++) {
      startTownDay(zh, p, rng);
      expect(p.townDay!.segments).toContain('delivery');
      endTownDayQuick(zh, p, rng);
    }
    give(p, 'bicycle');
    expect(renoTipBonus(zh, p)).toBe(4);
    startTownDay(zh, p, rng);
    storyAutoPlay(zh, p, (b) => b.choice?.[0]?.id ?? '');
    while (currentSegment(p) !== 'delivery') {
      if (currentSegment(p) === 'market') {
        solveMarket(zh, p, rng);
        finishMarket(zh, p);
      } else playShop(zh, p, rng);
      nextSegment(p);
    }
    const before = p.town.money;
    solveDelivery(zh, p, rng);
    const x = p.townDay!.delivery!;
    expect(x.result!.outcome).toBe('perfect');
    expect(x.result!.tip).toBe(SHARED.town!.delivery.tip + 4);
    expect(p.town.money - before).toBe(SHARED.town!.delivery.tip + 4);
  });

  it('décor: customers sometimes remark on it, in the target language, not every day', () => {
    for (const l of LANGS) {
      const d = data[l];
      const { p, out } = servedCup({});
      p.lang = l;
      give(p, 'plant');
      renoAfterServe(d, p, out, () => 0, false);
      const text = p.today!.results[0].reaction;
      expect(text.startsWith('Thank you! ')).toBe(true);
      const remark = text.slice('Thank you! '.length);
      expect(CONTENT[l].renovation!.upgrades.plant.remarks).toContain(remark);
      expect(out.reaction.text).toBe(text);
      // the same thing is not remarked on again the next cups of the day
      renoAfterServe(d, p, out, () => 0, false);
      expect(p.today!.results[0].reaction).toBe(text);
      // a regular's small talk takes precedence
      const talk = servedCup({});
      give(talk.p, 'plant');
      renoAfterServe(d, talk.p, talk.out, () => 0, true);
      expect(talk.p.today!.results[0].reaction).toBe('Thank you!');
    }
  });

  it('nothing changes without purchases (base game behaviour)', () => {
    const a = newProgress('en');
    const b = newProgress('en');
    playDays(en, a, 12, makeRng(42));
    playDays(en, b, 12, makeRng(42));
    delete b.reno;
    const strip = (p: LangProgress) => ({ ...p, reno: undefined });
    expect(strip(a)).toEqual(strip(b));
    expect(Object.keys(renoOf(a).owned)).toEqual([]);
  });
});

function endTownDayQuick(d: GameData, p: LangProgress, rng: () => number) {
  storyAutoPlay(d, p, (b) => b.choice?.[0]?.id ?? '');
  for (;;) {
    const seg = currentSegment(p);
    if (seg === 'market') {
      solveMarket(d, p, rng);
      finishMarket(d, p);
    } else if (seg === 'shop') playShop(d, p, rng);
    else solveDelivery(d, p, rng);
    storyAutoPlay(d, p, (b) => b.choice?.[0]?.id ?? '');
    if (!hasNextSegment(p)) break;
    nextSegment(p);
  }
  endTownDay(p, d);
  storyAutoPlay(d, p, (b) => b.choice?.[0]?.id ?? '');
}

describe('renovation in the save', () => {
  it('older saves (v1–v3) load without renovation state; purchases survive export / import', () => {
    for (const raw of [
      { version: 1, currentLang: 'en', settings: {}, progress: { en: { lang: 'en', day: 7 } } },
      { version: 2, currentLang: 'en', settings: {}, progress: { en: { lang: 'en', day: 7 } } },
      { version: 3, currentLang: 'en', settings: {}, progress: { en: { lang: 'en', day: 7 } } },
    ]) {
      const s = migrateSave(raw);
      expect(s.progress.en!.reno).toBeUndefined();
      expect(catalogue(en, s.progress.en!).length).toBeGreaterThan(0);
      expect(effectsOf(en, s.progress.en!).customers).toBe(0);
    }
    const s = migrateSave({ version: 3, currentLang: 'en', settings: {}, progress: { en: { lang: 'en', day: 7 } } });
    const p = s.progress.en!;
    renoOf(p).owned.bench = 6;
    renoOf(p).orders.push({ id: 'plant', day: 7 });
    renoOf(p).carry.lemon = 3;
    const back = importSave(exportSave(s)).progress.en!;
    expect(back.reno).toEqual(p.reno);
    // a partial renovation record (e.g. from a newer build) is completed with defaults
    const partial = migrateSave({ version: 3, currentLang: 'en', settings: {}, progress: { en: { lang: 'en', day: 7, reno: { owned: { plant: 3 } } } } }).progress.en!;
    expect(owns(partial, 'plant')).toBe(true);
    expect(renoOf(partial).orders).toEqual([]);
  });
});
