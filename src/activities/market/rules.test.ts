import { describe, expect, it } from 'vitest';
import { TOWN_SHARED } from '../../content/shared/town';
import type { NoteLine } from '../../core/townTypes';
import type { OrderRule } from '../../core/types';
import {
  bargainTotal,
  computeNeeds,
  evaluatePayment,
  lineCovered,
  offerPrice,
  portionsFromBasket,
  portionsPerUnit,
  RESERVE_PORTIONS,
  stockFromMarket,
  unitsFor,
} from './rules';

const M = TOWN_SHARED.market;
const q = (rule: OrderRule) => ({ rule });

describe('market rules', () => {
  it('computes portions needed from the shop queue (minimum per order + reserve)', () => {
    const need = computeNeeds(
      [
        q({ require: [{ ing: 'lemon', min: 2, max: 2 }] }),
        q({ require: [{ ing: 'lemon' }, { ing: 'honey' }] }),
        q({ require: [{ ing: 'water' }] }),
        q({ requireTag: [{ tag: 'sweet' }] }),
      ],
      ['lemon', 'honey', 'mint'],
    );
    expect(need.get('lemon')).toBe(3 + RESERVE_PORTIONS);
    expect(need.get('honey')).toBe(1 + RESERVE_PORTIONS);
    expect(need.has('mint')).toBe(false);
    expect(need.has('water')).toBe(false);
  });

  it('units round up; variants change portions and price', () => {
    const per = portionsPerUnit(M, 'lemon');
    expect(unitsFor(M, 'lemon', per)).toBe(1);
    expect(unitsFor(M, 'lemon', per + 1)).toBe(2);
    expect(portionsPerUnit(M, 'lemon', 'old')).toBe(per / 2);
    expect(unitsFor(M, 'lemon', per, 'old')).toBe(2);
    expect(portionsPerUnit(M, 'honey', 'big')).toBe(2 * portionsPerUnit(M, 'honey', 'small'));
    expect(offerPrice(M, 'honey', 'big', 0)).toBeGreaterThan(offerPrice(M, 'honey', 'small', 0));
    expect(offerPrice(M, 'lemon', 'old', -5)).toBe(1);
  });

  it('stock = portions bought for the goods on the note; wrong variant / quantity falls short', () => {
    const per = portionsPerUnit(M, 'mint');
    const line: NoteLine = { good: 'mint', variant: 'fresh', units: 2, portions: 2 * per, text: '' };
    const right = stockFromMarket(M, [line], [{ offer: 'x', good: 'mint', variant: 'fresh', units: 2, total: 8, paid: 8 }]);
    expect(right).toEqual({ mint: 2 * per });
    expect(lineCovered(line, right)).toBe(true);
    const old = stockFromMarket(M, [line], [{ offer: 'x', good: 'mint', variant: 'old', units: 2, total: 4, paid: 4 }]);
    expect(lineCovered(line, old)).toBe(false);
    const few = stockFromMarket(M, [line], [{ offer: 'x', good: 'mint', variant: 'fresh', units: 1, total: 4, paid: 4 }]);
    expect(lineCovered(line, few)).toBe(false);
    // goods not on the note are not tracked; nothing bought = empty shelf for that good
    expect(stockFromMarket(M, [line], [{ offer: 'y', good: 'lemon', units: 3, total: 9, paid: 9 }])).toEqual({ mint: 0 });
    expect(portionsFromBasket(M, [{ good: 'lemon', units: 2 }, { good: 'lemon', units: 1 }]).get('lemon')).toBe(3 * portionsPerUnit(M, 'lemon'));
  });

  it('payment: exact, not enough, overpaid (no change yet), change, no change', () => {
    const noChange = { change: false, changeLimit: 10 };
    const withChange = { change: true, changeLimit: 10 };
    expect(evaluatePayment(12, 12, noChange)).toEqual({ kind: 'exact', accepted: true, spent: 12, change: 0 });
    expect(evaluatePayment(12, 10, noChange)).toMatchObject({ kind: 'not_enough', accepted: false, spent: 0 });
    // before vendors give change, overpaying is simply lost money
    expect(evaluatePayment(12, 15, noChange)).toEqual({ kind: 'overpaid', accepted: true, spent: 15, change: 0 });
    expect(evaluatePayment(12, 15, withChange)).toEqual({ kind: 'change', accepted: true, spent: 12, change: 3 });
    expect(evaluatePayment(12, 50, withChange)).toMatchObject({ kind: 'no_change', accepted: false, spent: 0 });
  });

  it('bargaining lowers the total only when the vendor accepts', () => {
    expect(bargainTotal(20, false)).toBe(20);
    expect(bargainTotal(20, true)).toBe(17);
    expect(bargainTotal(4, true)).toBe(3);
    expect(bargainTotal(2, true)).toBe(2);
  });
});
