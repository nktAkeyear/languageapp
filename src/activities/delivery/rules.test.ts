import { describe, expect, it } from 'vitest';
import { TOWN_SHARED } from '../../content/shared/town';
import type { DeliveryChoice, DeliveryRule } from '../../core/townTypes';
import { clockNumber, descriptionsOf, evaluateDelivery, resolveDest, ruleFor, slotsFor, witnessChoice } from './rules';

const D = TOWN_SHARED.delivery;
const map = D.map;

describe('delivery map relations', () => {
  it('resolves behind / across / left / right / next_to on the grid', () => {
    expect(resolveDest(map, 'at', 'bank')?.id).toBe('bank');
    expect(resolveDest(map, 'behind', 'bank')?.id).toBe('h03');
    expect(resolveDest(map, 'behind', 'market')?.id).toBe('h13');
    expect(resolveDest(map, 'across', 'harbour')?.id).toBe('h08');
    expect(resolveDest(map, 'across', 'bridge')?.id).toBe('h07');
    expect(resolveDest(map, 'left', 'market')?.id).toBe('h09');
    expect(resolveDest(map, 'right', 'bank')?.id).toBe('h06');
    expect(resolveDest(map, 'next_to', 'inn')?.id).toBe('h05');
  });

  it('refuses ambiguous or impossible descriptions', () => {
    // two houses next to the bank → "next to the bank" is ambiguous
    expect(resolveDest(map, 'next_to', 'bank')).toBeNull();
    // the school is in the back row: nothing behind it
    expect(resolveDest(map, 'behind', 'school')).toBeNull();
    // left of the harbour is off the map; left of the inn is the harbour (not a house)
    expect(resolveDest(map, 'left', 'harbour')).toBeNull();
    expect(resolveDest(map, 'left', 'inn')).toBeNull();
  });

  it('lists every description that points at a house', () => {
    const ds = descriptionsOf(map, 'h05', ['next_to', 'behind', 'across', 'left', 'right']);
    expect(ds).toEqual(expect.arrayContaining([{ rel: 'next_to', landmark: 'inn' }, { rel: 'across', landmark: 'market' }, { rel: 'left', landmark: 'bank' }]));
    expect(descriptionsOf(map, 'h11', ['next_to', 'behind', 'across', 'left', 'right'])).toEqual([]);
  });
});

describe('delivery time slots', () => {
  it('periods, o\'clock, before / after', () => {
    expect(slotsFor(D.slots, { kind: 'period', period: 'morning' })).toEqual([9, 10, 11]);
    expect(slotsFor(D.slots, { kind: 'at', hour: 15 })).toEqual([15]);
    expect(slotsFor(D.slots, { kind: 'before', hour: 11 })).toEqual([9, 10]);
    expect(slotsFor(D.slots, { kind: 'after', hour: 16 })).toEqual([18, 19]);
    expect(slotsFor(D.slots, undefined)).toBeNull();
    expect(clockNumber(15)).toBe(3);
    expect(clockNumber(10)).toBe(10);
    expect(clockNumber(12)).toBe(12);
  });
});

describe('evaluateDelivery', () => {
  const rule: DeliveryRule = { place: 'h03', slots: [15], give: 'mother', avoid: 'child', knocks: 2 };
  const ok: DeliveryChoice = { place: 'h03', hour: 15, knocks: 2, person: 'mother', absent: null };

  it('perfect when everything matches', () => {
    expect(evaluateDelivery(rule, ok, true)).toEqual({ issues: [], outcome: 'perfect' });
  });

  it('wrong place is the primary failure', () => {
    const ev = evaluateDelivery(rule, { ...ok, place: 'h05', hour: 9 }, true);
    expect(ev.issues[0]).toBe('wrong_place');
    expect(ev.issues).toContain('too_early');
    expect(ev.outcome).toBe('fail');
  });

  it('too early / too late', () => {
    expect(evaluateDelivery(rule, { ...ok, hour: 9 }, true).issues).toEqual(['too_early']);
    expect(evaluateDelivery(rule, { ...ok, hour: 19 }, true).issues).toEqual(['too_late']);
    expect(evaluateDelivery({ ...rule, slots: [9, 19] }, { ...ok, hour: 15 }, true).issues).toEqual(['wrong_time']);
  });

  it('handing to the person to avoid is "bad"; another wrong person is a fail', () => {
    expect(evaluateDelivery(rule, { ...ok, person: 'child' }, true)).toEqual({ issues: ['avoided_person'], outcome: 'bad' });
    expect(evaluateDelivery(rule, { ...ok, person: 'father' }, true)).toEqual({ issues: ['wrong_person'], outcome: 'fail' });
  });

  it('a wrong knock alone is minor', () => {
    expect(evaluateDelivery(rule, { ...ok, knocks: 1 }, true)).toEqual({ issues: ['wrong_knock'], outcome: 'minor' });
  });

  it('nobody home: the absence instruction decides', () => {
    const r: DeliveryRule = { place: 'h07', slots: null, absent: 'door' };
    const c: DeliveryChoice = { place: 'h07', hour: 10, knocks: 1, person: null, absent: 'door' };
    expect(evaluateDelivery(r, c, false).outcome).toBe('perfect');
    expect(evaluateDelivery(r, { ...c, absent: 'back' }, false).issues).toEqual(['wrong_absent']);
    // without an instruction, bringing it back is right
    expect(evaluateDelivery({ ...r, absent: undefined }, { ...c, absent: 'back' }, false).outcome).toBe('perfect');
  });

  it('every curriculum slip resolves and has a perfect witness', () => {
    for (const s of D.curriculum) {
      const r = ruleFor(D, s)!;
      expect(r, s.id).not.toBeNull();
      const home = s.home !== false;
      expect(evaluateDelivery(r, witnessChoice(r, home, D.slots), home).outcome, s.id).toBe('perfect');
    }
  });
});
