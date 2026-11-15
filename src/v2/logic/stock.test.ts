import { describe, expect, it } from 'vitest';
import { deliveryFee, ORDER_MARKUP, type CatalogItem } from './catalog';
import { available, buyInPerson, commitUse, isDue, placeOrder, quoteOrder, receiveDue, shortfall, type Delivery, type Stock } from './stock';

const LEMON: CatalogItem = { id: 'lemon', word: 'lemon', unit: { one: 'one lemon', other: '{n} lemons' }, per: 3, price: 3, sizeJa: '' };
const MINT: CatalogItem = { id: 'mint', word: 'mint', unit: { one: 'one bunch of mint', other: '{n} bunches of mint' }, per: 5, price: 4, sizeJa: '' };
const CAT = [LEMON, MINT];

describe('v2 stock arithmetic', () => {
  it('fee tiers grow with the number of units', () => {
    expect(deliveryFee(0)).toBe(0);
    expect(deliveryFee(1)).toBe(3);
    expect(deliveryFee(2)).toBe(3);
    expect(deliveryFee(3)).toBe(5);
    expect(deliveryFee(6)).toBe(5);
    expect(deliveryFee(7)).toBe(8);
  });

  it('a quote is units × (price + markup) plus the fee', () => {
    const q = quoteOrder(CAT, [{ id: 'lemon', units: 2 }, { id: 'mint', units: 1 }, { id: 'nothing', units: 4 }, { id: 'mint', units: 0 }]);
    expect(q.lines.map((l) => [l.id, l.units, l.portions, l.lineTotal])).toEqual([
      ['lemon', 2, 6, 2 * (3 + ORDER_MARKUP)],
      ['mint', 1, 5, 4 + ORDER_MARKUP],
    ]);
    expect(q.units).toBe(3);
    expect(q.fee).toBe(5);
    expect(q.total).toBe(8 + 5 + 5);
  });

  it('buying in person adds units × per portions at once and costs only the goods', () => {
    const wallet = { money: 20 };
    const stock: Stock = { lemon: 1 };
    const r = buyInPerson(wallet, stock, LEMON, 2, 10);
    expect(r).toEqual({ ok: true, change: 4, portions: 6 });
    expect(stock.lemon).toBe(7);
    expect(wallet.money).toBe(14);
    // paying too little buys nothing
    expect(buyInPerson(wallet, stock, MINT, 1, 3)).toEqual({ ok: false, reason: 'notEnough' });
    expect(stock.mint).toBeUndefined();
    expect(wallet.money).toBe(14);
  });

  it('an order is paid at once and its goods are not on the shelf until the crate arrives', () => {
    const wallet = { money: 30 };
    const pending: Delivery[] = [];
    const stocks = { teahouse: { mint: 0 } as Stock, clinic: {} as Stock };
    const r = placeOrder(wallet, pending, CAT, [{ id: 'mint', units: 2 }], { workplace: 'teahouse', day: 3, part: 1, now: 1000, id: 'd1' });
    expect('delivery' in r).toBe(true);
    expect(wallet.money).toBe(30 - (2 * 5 + 3));
    expect(stocks.teahouse.mint).toBe(0);
    // not yet
    expect(receiveDue(stocks, pending, 2000, 3)).toEqual([]);
    expect(stocks.teahouse.mint).toBe(0);
    // the van arrives
    const due = receiveDue(stocks, pending, 1000 + 8000, 3);
    expect(due).toHaveLength(1);
    expect(stocks.teahouse.mint).toBe(10);
    expect(pending).toHaveLength(0);
  });

  it('an order after closing arrives with the next morning, not before', () => {
    const wallet = { money: 30 };
    const pending: Delivery[] = [];
    const stocks = { teahouse: { lemon: 2 } as Stock, clinic: {} as Stock };
    placeOrder(wallet, pending, CAT, [{ id: 'lemon', units: 1 }], { workplace: 'teahouse', day: 4, part: 2, now: 0, id: 'd2' });
    expect(isDue(pending[0], 10 ** 12, 4)).toBe(false);
    expect(receiveDue(stocks, pending, 10 ** 12, 4)).toEqual([]);
    expect(receiveDue(stocks, pending, 0, 5)).toHaveLength(1);
    expect(stocks.teahouse.lemon).toBe(5);
  });

  it('refuses an order the purse cannot pay, and an empty one', () => {
    const wallet = { money: 4 };
    const pending: Delivery[] = [];
    expect('reason' in placeOrder(wallet, pending, CAT, [{ id: 'lemon', units: 1 }], { workplace: 'teahouse', day: 1, part: 0, now: 0, id: 'x' })).toBe(true);
    expect('reason' in placeOrder(wallet, pending, CAT, [], { workplace: 'teahouse', day: 1, part: 0, now: 0, id: 'y' })).toBe(true);
    expect(wallet.money).toBe(4);
    expect(pending).toHaveLength(0);
  });

  it('portions in the cup are reserved; serving takes them off the shelf, never below zero', () => {
    const stock: Stock = { lemon: 3, mint: 1 };
    expect(available(stock, { lemon: 2 }, 'lemon')).toBe(1);
    expect(available(stock, { mint: 3 }, 'mint')).toBe(0);
    expect(commitUse(stock, { lemon: 2, mint: 4 })).toEqual({ lemon: 2, mint: 1 });
    expect(stock).toEqual({ lemon: 1, mint: 0 });
  });

  it('stock carries over: buy, deliver, use across days adds up exactly', () => {
    const wallet = { money: 100 };
    const pending: Delivery[] = [];
    const stocks = { teahouse: { lemon: 3 } as Stock, clinic: {} as Stock };
    // day 1: use 2, buy 1 lemon in person (+3), order 1 by delivery during hours (+3)
    commitUse(stocks.teahouse, { lemon: 2 });
    buyInPerson(wallet, stocks.teahouse, LEMON, 1, 3);
    placeOrder(wallet, pending, CAT, [{ id: 'lemon', units: 1 }], { workplace: 'teahouse', day: 1, part: 1, now: 0, id: 'a' });
    receiveDue(stocks, pending, 9000, 1);
    expect(stocks.teahouse.lemon).toBe(3 - 2 + 3 + 3);
    // after closing: order 2 for tomorrow (+6), nothing changes tonight
    placeOrder(wallet, pending, CAT, [{ id: 'lemon', units: 2 }], { workplace: 'teahouse', day: 1, part: 2, now: 10000, id: 'b' });
    receiveDue(stocks, pending, 20000, 1);
    expect(stocks.teahouse.lemon).toBe(7);
    // day 2 morning: the crate
    receiveDue(stocks, pending, 30000, 2);
    expect(stocks.teahouse.lemon).toBe(13);
    commitUse(stocks.teahouse, { lemon: 5 });
    expect(stocks.teahouse.lemon).toBe(8);
    expect(wallet.money).toBe(100 - 3 - (4 + 3) - (8 + 3));
  });

  it('shortfall: what the day needs plus a reserve, in whole units', () => {
    expect(shortfall({ lemon: 1 }, { lemon: 4 }, LEMON)).toEqual({ portions: 4, units: 2 });
    expect(shortfall({ lemon: 9 }, { lemon: 4 }, LEMON)).toEqual({ portions: 0, units: 0 });
    expect(shortfall({}, {}, LEMON)).toEqual({ portions: 0, units: 0 });
  });
});
