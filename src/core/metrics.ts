/**
 * Learning indicators (学習の記録). Pure data + arithmetic, no game state access:
 * src/core/difficulty.ts feeds the per-day accumulator from the day hooks and closes it into a
 * `DayMetrics` record at the end of each day; the adaptive controller and the notebook's
 * 学習の記録 page read rolling windows over those records.
 *
 * Everything is counted per language (each LangProgress has its own difficulty state).
 */

/** Running counts for the day in progress. */
export interface DayAcc {
  day: number;
  /** Shop orders served for the first time today (a retry of the same customer is not a first try). */
  firstTry: number;
  firstTryOk: number;
  /** First tries on orders that contain a word met for the first time today. */
  newOrders: number;
  newOk: number;
  /** First tries on orders made only of words met on earlier days. */
  reviewOrders: number;
  reviewOk: number;
  /** Order keys already tried today (retry assist). */
  tried: string[];
  retries: number;
  /** 検証ページ: stamp presses and pages sealed today. */
  verifyAttempts: number;
  verifySolved: number;
  /** Time spent on orders (ms) and how many orders were timed (UI only; the simulator leaves 0). */
  msTotal: number;
  msOrders: number;
  /** Words due for review at the start of the day (seen and used correctly before) and their wrong-count then. */
  due: [string, number][];
  /** Words confirmed at the start of the day. */
  confirmedStart: number;
  peeks: number;
  /** New-word budget and minimum review share planned for the day (filled by difficulty.ts). */
  budget?: number;
  review?: number;
}

/** One closed day. Short keys keep the save small (one record per day). */
export interface DayMetrics {
  day: number;
  /** Shop first tries / perfect first tries. */
  ft: number;
  ftOk: number;
  newN: number;
  newOk: number;
  revN: number;
  revOk: number;
  /** 検証 attempts / successes. */
  vA: number;
  vS: number;
  /** Market note lines / covered. */
  mN: number;
  mOk: number;
  /** Delivery made / delivered well (perfect or minor). */
  dN: number;
  dOk: number;
  /** Due review words / of those, lapsed today. */
  dueN: number;
  lapsed: number;
  /** Words confirmed today. */
  conf: number;
  /** Average seconds per timed order (0 = not timed). */
  sec: number;
  retries: number;
  peeks: number;
  /** Qualification estimate at the end of the day (exam level index + share of the next level). */
  est: number;
  /** Stage at the end of the day. */
  stage: number;
  /** Controller adjustment after the day (−1 … +1, 0 = the pace preset as is). */
  adj: number;
  /** New-word budget and review share that were in force today. */
  budget: number;
  review: number;
}

export function newDayAcc(day: number): DayAcc {
  return {
    day,
    firstTry: 0,
    firstTryOk: 0,
    newOrders: 0,
    newOk: 0,
    reviewOrders: 0,
    reviewOk: 0,
    tried: [],
    retries: 0,
    verifyAttempts: 0,
    verifySolved: 0,
    msTotal: 0,
    msOrders: 0,
    due: [],
    confirmedStart: 0,
    peeks: 0,
  };
}

/** Record a served cup. Only the first try at an order key counts towards accuracy. */
export function accServe(acc: DayAcc, key: string, perfect: boolean, hasNew: boolean): void {
  if (acc.tried.includes(key)) return;
  acc.tried.push(key);
  acc.firstTry++;
  if (perfect) acc.firstTryOk++;
  if (hasNew) {
    acc.newOrders++;
    if (perfect) acc.newOk++;
  } else {
    acc.reviewOrders++;
    if (perfect) acc.reviewOk++;
  }
}

/** Keep at most this many daily records (about four months of play). */
export const MAX_HISTORY = 120;

export function pushHistory(history: DayMetrics[], m: DayMetrics): DayMetrics[] {
  const out = history.filter((h) => h.day !== m.day);
  out.push(m);
  out.sort((a, b) => a.day - b.day);
  return out.length > MAX_HISTORY ? out.slice(out.length - MAX_HISTORY) : out;
}

export interface WindowStats {
  days: number;
  orders: number;
  /** null when there is nothing to divide by. */
  accuracy: number | null;
  newAccuracy: number | null;
  reviewAccuracy: number | null;
  /** 検証 stamp presses per sealed page. */
  verifyPerSuccess: number | null;
  market: number | null;
  delivery: number | null;
  lapseRate: number | null;
  confirmedPerDay: number;
  secPerOrder: number | null;
}

const ratio = (a: number, b: number): number | null => (b > 0 ? a / b : null);

/** Sums over the last `n` closed days (the rolling window the controller and the charts use). */
export function windowStats(history: DayMetrics[], n: number): WindowStats {
  const w = history.slice(Math.max(0, history.length - n));
  const sum = (f: (m: DayMetrics) => number) => w.reduce((s, m) => s + f(m), 0);
  const timed = w.filter((m) => m.sec > 0);
  return {
    days: w.length,
    orders: sum((m) => m.ft),
    accuracy: ratio(sum((m) => m.ftOk), sum((m) => m.ft)),
    newAccuracy: ratio(sum((m) => m.newOk), sum((m) => m.newN)),
    reviewAccuracy: ratio(sum((m) => m.revOk), sum((m) => m.revN)),
    verifyPerSuccess: ratio(sum((m) => m.vA), sum((m) => m.vS)),
    market: ratio(sum((m) => m.mOk), sum((m) => m.mN)),
    delivery: ratio(sum((m) => m.dOk), sum((m) => m.dN)),
    lapseRate: ratio(sum((m) => m.lapsed), sum((m) => m.dueN)),
    confirmedPerDay: w.length ? sum((m) => m.conf) / w.length : 0,
    secPerOrder: timed.length ? timed.reduce((s, m) => s + m.sec, 0) / timed.length : null,
  };
}

/** A per-day series of one indicator (null where the day had nothing to measure), for the charts. */
export function series(history: DayMetrics[], f: (m: DayMetrics) => number | null): { day: number; v: number | null }[] {
  return history.map((m) => ({ day: m.day, v: f(m) }));
}

/** Rolling mean of a ratio over `n` days, weighting by the denominator (smoother charts). */
export function rollingRatio(history: DayMetrics[], num: (m: DayMetrics) => number, den: (m: DayMetrics) => number, n: number) {
  return history.map((m, i) => {
    const w = history.slice(Math.max(0, i - n + 1), i + 1);
    const d = w.reduce((s, x) => s + den(x), 0);
    return { day: m.day, v: d > 0 ? w.reduce((s, x) => s + num(x), 0) / d : null };
  });
}
