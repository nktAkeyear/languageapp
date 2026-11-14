import { describe, expect, it } from 'vitest';
import { accServe, MAX_HISTORY, newDayAcc, pushHistory, rollingRatio, windowStats, type DayMetrics } from './metrics';

function day(d: number, ft: number, ftOk: number, extra: Partial<DayMetrics> = {}): DayMetrics {
  return {
    day: d,
    ft,
    ftOk,
    newN: 0,
    newOk: 0,
    revN: ft,
    revOk: ftOk,
    vA: 0,
    vS: 0,
    mN: 0,
    mOk: 0,
    dN: 0,
    dOk: 0,
    dueN: 0,
    lapsed: 0,
    conf: 0,
    sec: 0,
    retries: 0,
    peeks: 0,
    est: 0,
    stage: 1,
    adj: 0,
    budget: 6,
    review: 0,
    ...extra,
  };
}

describe('metrics', () => {
  it('counts only the first try at an order key', () => {
    const a = newDayAcc(3);
    accServe(a, 'o1', false, true);
    accServe(a, 'o1', true, true); // a retry of the same customer
    accServe(a, 'o2', true, false);
    expect(a).toMatchObject({ firstTry: 2, firstTryOk: 1, newOrders: 1, newOk: 0, reviewOrders: 1, reviewOk: 1 });
  });

  it('windows sum the last n days, weighting by orders', () => {
    const h = [day(1, 10, 0), day(2, 4, 4), day(3, 6, 3), day(4, 10, 9, { vA: 3, vS: 1, mN: 2, mOk: 1, dN: 1, dOk: 1, dueN: 4, lapsed: 1, conf: 6, sec: 12 })];
    const w = windowStats(h, 3);
    expect(w.days).toBe(3);
    expect(w.orders).toBe(20);
    expect(w.accuracy).toBeCloseTo(16 / 20);
    expect(w.verifyPerSuccess).toBe(3);
    expect(w.market).toBe(0.5);
    expect(w.delivery).toBe(1);
    expect(w.lapseRate).toBe(0.25);
    expect(w.confirmedPerDay).toBe(2);
    expect(w.secPerOrder).toBe(12);
    const empty = windowStats([], 3);
    expect(empty.accuracy).toBeNull();
    expect(empty.newAccuracy).toBeNull();
  });

  it('keeps one record per day, sorted and capped', () => {
    let h: DayMetrics[] = [];
    for (let d = 1; d <= MAX_HISTORY + 10; d++) h = pushHistory(h, day(d, 1, 1));
    expect(h.length).toBe(MAX_HISTORY);
    expect(h[0].day).toBe(11);
    h = pushHistory(h, day(50, 5, 0));
    expect(h.filter((m) => m.day === 50)).toHaveLength(1);
    expect(h.find((m) => m.day === 50)?.ft).toBe(5);
  });

  it('rolling ratios smooth over days with nothing to measure', () => {
    const h = [day(1, 4, 2), day(2, 0, 0), day(3, 4, 4)];
    const r = rollingRatio(h, (m) => m.ftOk, (m) => m.ft, 2);
    expect(r.map((x) => x.v)).toEqual([0.5, 0.5, 1]);
    const none = rollingRatio([day(1, 0, 0)], (m) => m.ftOk, (m) => m.ft, 3);
    expect(none[0].v).toBeNull();
  });
});
