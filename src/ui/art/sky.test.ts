import { describe, expect, it } from 'vitest';
import { shopTime, skyAt } from './sky';

describe('shop window light', () => {
  it('runs from morning to evening over the customers of the day', () => {
    expect(shopTime(0, 5, false)).toBeLessThan(shopTime(4, 5, false));
    expect(shopTime(4, 5, false)).toBeLessThanOrEqual(1);
    expect(shopTime(0, 5, true)).toBe(1);
    expect(shopTime(0, 1, false)).toBeGreaterThanOrEqual(0);
  });
  it('the lamp matters more in the evening, the sun sets', () => {
    const am = skyAt(0.05);
    const pm = skyAt(1);
    expect(pm.lamp).toBeGreaterThan(am.lamp);
    expect(pm.sun).toBeLessThan(am.sun);
  });
  it('interpolates valid css colours and clamps out-of-range input', () => {
    for (const t of [-1, 0, 0.3, 0.6, 0.9, 1, 2, Number.NaN]) {
      const s = skyAt(t);
      for (const c of [s.top, s.bottom, s.sea, s.light]) expect(c).toMatch(/^rgb\(\d{1,3},\d{1,3},\d{1,3}\)$/);
    }
  });
});
