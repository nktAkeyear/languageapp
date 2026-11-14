/**
 * Difficulty by qualification benchmark (レベル設定) and adaptive adjustment from measured indicators.
 *
 * Per language (state lives in `LangProgress.difficulty`, optional — absent means the defaults
 * below, which plan exactly like the game did before this module existed):
 *
 * - **start** (現在の実力の目安): an exam level (zh HSK n / en 英検 grade). Words tagged at or below it
 *   are seeded as 既習扱い (confirmed, counted as known, still reviewed now and then, revertible one
 *   by one); 検証ページ whose words are all known are sealed; earlier curriculum orders made only of
 *   known words are marked done; the shop jumps to the stage the level corresponds to (see
 *   START_STAGE), reputation / the stage clock / market and delivery experience follow so later
 *   stages and the town open consistently. Lowering the level takes back exactly what seeding added.
 * - **target** (目標): the level the 現在地 page measures progress against (targetProgress).
 * - **pace** (進み方): ゆっくり / ふつう / 速い presets for new words per day, customers per day,
 *   a minimum share of review orders and how fast the stage clock runs.
 * - **adaptive** (自動調整): a bounded, hysteretic controller (controllerStep) that nudges the
 *   preset by `adj` ∈ [ADJ_MIN, ADJ_MAX] from rolling first-try accuracy (src/core/metrics.ts).
 * - **assists** (手助け): presentation and forgiveness toggles read by the UI.
 *
 * Hooks used by the day orchestration: difficultyStartDay, difficultyOnServe, difficultyEndDay
 * (src/activities/day.ts), planKnobs (shop/dayplan.ts), stageDay (shop/engine.ts + day.ts),
 * difficultyOnVerify (core/verification.ts), storyCatchingUp (story/engine.ts).
 */
import { stageDef, type GameData } from './gamedata';
import { examLabel, levelReport, REACHED } from './levels';
import { accServe, newDayAcc, pushHistory, windowStats, type DayAcc, type DayMetrics } from './metrics';
import type { LangProgress } from './save';
import { newWordState, START_EASE, type WordState } from './srs';
import { tokenIds } from './tokenize';
import { EIKEN_GRADES, type Lang, type LexEntry, type OrderInstance, type Outcome } from './types';
import { lineCovered, stockFromMarket } from '../activities/market/rules';
import { hashString } from './rng';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export type Pace = 'slow' | 'normal' | 'fast';
export type PinyinMode = 'always' | 'unconfirmed' | 'never';
export type AudioFreq = 'off' | 'normal' | 'many';

export interface Assists {
  /** zh pinyin over the characters; absent = follow 設定's 「ピンインを表示する」. */
  pinyin?: PinyinMode;
  /** Peek at the gloss of an unconfirmed word for a reputation point (notebook word page). */
  peek: boolean;
  /** After a failed cup, mark the words of the order the mistake was about. */
  markMistake: boolean;
  /** After a failed cup, try the same customer again without penalty. */
  retry: boolean;
  /** Audio-only orders / market quotes. */
  audio: AudioFreq;
  /** Slower speech (rate × SLOW_SPEECH). */
  slowSpeech: boolean;
}

export interface DifficultyState {
  /** Starting level: 0 = ゼロから, n = exam level n (zh HSK n, en n-th 英検 grade from 5級). */
  start: number;
  /** Target exam level (null = none chosen). */
  target: number | null;
  pace: Pace;
  adaptive: boolean;
  assists: Assists;
  /** Controller adjustment, −1 (much gentler) … +ADJ_MAX (brisker). 0 = the preset. */
  adj: number;
  lastStepDay: number;
  lastDir: -1 | 0 | 1;
  /** Direction the previous evaluation wanted (a step needs two evaluations in a row: debounce). */
  pending: -1 | 0 | 1;
  /** Japanese explanation of the controller's last decision. */
  lastReason: string;
  /** Stage clock offset in days (fast-forward + pace / controller drift). Stage gates use day + offset. */
  clockOffset: number;
  /** The story is behind the shop (started above zero): replay it compressed (story/engine.ts). */
  storyCatchUp: boolean;
  /** Words the player took out of 既習扱い by hand (not re-seeded by a later level change). */
  optOut: string[];
  /** word id → day its gloss was peeked at (assist). */
  peeked: Record<string, number>;
  acc: DayAcc | null;
  history: DayMetrics[];
  /** Level changes (for the 学習の記録 page). */
  changes: { day: number; start: number; pace: Pace }[];
}

export const DEFAULT_ASSISTS: Assists = { peek: false, markMistake: false, retry: false, audio: 'normal', slowSpeech: false };

export function defaultDifficulty(): DifficultyState {
  return {
    start: 0,
    target: null,
    pace: 'normal',
    adaptive: true,
    assists: { ...DEFAULT_ASSISTS },
    adj: 0,
    lastStepDay: 0,
    lastDir: 0,
    pending: 0,
    lastReason: '',
    clockOffset: 0,
    storyCatchUp: false,
    optOut: [],
    peeked: {},
    acc: null,
    history: [],
    changes: [],
  };
}

/** The difficulty state of a progress, created with defaults on first use (older saves have none). */
export function difficultyState(p: LangProgress): DifficultyState {
  if (!p.difficulty) p.difficulty = defaultDifficulty();
  else {
    const base = defaultDifficulty();
    // Imported / partially written states get their missing fields.
    for (const k of Object.keys(base) as (keyof DifficultyState)[]) if (p.difficulty[k] === undefined) (p.difficulty as unknown as Record<string, unknown>)[k] = base[k];
    p.difficulty.assists = { ...DEFAULT_ASSISTS, ...p.difficulty.assists };
  }
  return p.difficulty;
}

/** Day used for stage / town unlock gates (calendar day + clock offset). */
export function stageDay(p: LangProgress): number {
  return p.day + Math.floor((p.difficulty?.clockOffset ?? 0) + 1e-9);
}

// ---------------------------------------------------------------------------
// Qualification levels
// ---------------------------------------------------------------------------

export function examCount(lang: Lang): number {
  return lang === 'en' ? EIKEN_GRADES.length : 6;
}

/** Exam level index of a word (1-based; 0 = untagged). */
export function wordLevel(lang: Lang, e: LexEntry): number {
  if (lang === 'en') return e.eiken ? EIKEN_GRADES.indexOf(e.eiken) + 1 : 0;
  return e.hsk ?? 0;
}

export function levelKey(lang: Lang, level: number): string {
  return lang === 'en' ? EIKEN_GRADES[level - 1] : String(level);
}

export function levelName(lang: Lang, level: number): string {
  if (level <= 0) return 'ゼロから';
  return examLabel(lang, levelKey(lang, level));
}

/** Rough equivalents shown next to each level (目安). */
const EQUIV: Record<Lang, string[]> = {
  en: ['', 'CEFR A1（入門）・TOEIC —', 'CEFR A1・TOEIC 〜300', 'CEFR A2・TOEIC 〜400', 'CEFR A2〜B1・TOEIC 〜550', 'CEFR B1・TOEIC 〜650', 'CEFR B2・TOEIC 〜800', 'CEFR C1・TOEIC 900〜'],
  zh: ['', '中検 準4級程度・CEFR A1（入門）', '中検 準4級・CEFR A1', '中検 4級・CEFR A2', '中検 3級・CEFR B1', '中検 2級・CEFR B2', '中検 準1級・CEFR C1'],
};

export function levelEquiv(lang: Lang, level: number): string {
  return EQUIV[lang][level] ?? '';
}

/**
 * Shop stage a starting level fast-forwards to. The stage list is the curriculum's feature and
 * grammar progression (temperature 3, audio-only 5, symptoms → recipes 7, method 9, greetings and
 * family 10–11, big numbers 12, time 13, weather 14 …, ≈ CEFR A1 → into A2). Vocabulary tags are
 * spread over all stages, so the jump is calibrated on structures, not word counts:
 * HSK1 / 英検5級 (A1 entry) skip the first-week basics, HSK2 / 英検4級 (A1) start at the
 * greetings-and-family stages, HSK3 (A2) at the late-A2 stages. Levels without an entry are not
 * offered (the content does not reach them yet).
 */
export const START_STAGE: Record<Lang, Record<number, number>> = {
  zh: { 0: 1, 1: 6, 2: 11, 3: 16 },
  en: { 0: 1, 1: 7, 2: 13 },
};

export function startStageFor(data: GameData, level: number): number {
  const last = data.stages[data.stages.length - 1]?.stage ?? 1;
  return Math.min(last, START_STAGE[data.lang][level] ?? 1);
}

export interface LevelOption {
  level: number;
  label: string;
  equiv: string;
  available: boolean;
  /** Stage the start fast-forwards to (start options). */
  stage?: number;
  /** Japanese note (why not available / what it means). */
  note?: string;
}

export function startOptions(data: GameData): LevelOption[] {
  const lang = data.lang;
  const out: LevelOption[] = [{ level: 0, label: 'ゼロから', equiv: '初めて学ぶ', available: true, stage: 1 }];
  for (let l = 1; l <= examCount(lang); l++) {
    const stage = START_STAGE[lang][l];
    out.push({
      level: l,
      label: levelName(lang, l),
      equiv: levelEquiv(lang, l),
      available: stage !== undefined,
      stage: stage !== undefined ? startStageFor(data, l) : undefined,
      note: stage === undefined ? '未対応：ゲームの内容がまだこのレベルに届いていません' : undefined,
    });
  }
  return out;
}

/** Lexicon words of level ≤ `level` (cumulative), i.e. the part of that level's list present in the game. */
export function wordsUpTo(data: GameData, level: number): LexEntry[] {
  return data.content.lexicon.filter((e) => {
    const l = wordLevel(data.lang, e);
    return l > 0 && l <= level;
  });
}

/** Minimum words of exactly that level and minimum share of its (cumulative) list for a target to be offered. */
export const TARGET_MIN_OWN = 30;
export const TARGET_MIN_COVERAGE = 0.15;

export interface TargetProgress {
  level: number;
  label: string;
  /** Size of the official (cumulative) word list. */
  listSize: number;
  /** Words of that list present in the game. */
  inGame: number;
  /** Of those, mastered (confirmed + used), incl. 既習扱い. */
  mastered: number;
  seeded: number;
  remainingInGame: number;
  notInGame: number;
  /** mastered / listSize. */
  ratio: number;
  /** inGame / listSize: the best the game's current content can show. */
  ceiling: number;
  available: boolean;
  /** Honest note when the game's content does not reach the target. */
  note: string;
}

export function targetProgress(data: GameData, p: LangProgress, level: number): TargetProgress {
  const lang = data.lang;
  const key = levelKey(lang, level);
  const listSize = data.content.levelTargets.exam[key] ?? 1;
  const words = wordsUpTo(data, level);
  const own = words.filter((e) => wordLevel(lang, e) === level).length;
  const mastered = words.filter((e) => {
    const w = p.words[e.id];
    return !!w && w.confirmed && (w.correct >= 2 || w.seen >= 6);
  });
  const seeded = mastered.filter((e) => p.words[e.id]?.seeded).length;
  const ceiling = Math.min(1, words.length / listSize);
  const available = own >= TARGET_MIN_OWN && ceiling >= TARGET_MIN_COVERAGE;
  const label = levelName(lang, level);
  let note = '';
  if (!available) note = `未対応：${label}の語彙はこのゲームにまだ ${words.length} 語（一覧の約${Math.round(ceiling * 100)}%）しかありません。`;
  else if (ceiling < REACHED)
    note = `このゲームの今の内容は${label}の語彙一覧（約${listSize}語）のうち ${words.length} 語（約${Math.round(ceiling * 100)}%）です。残りの ${listSize - words.length} 語はゲームの外で補う必要があります。`;
  return {
    level,
    label,
    listSize,
    inGame: words.length,
    mastered: mastered.length,
    seeded,
    remainingInGame: words.length - mastered.length,
    notInGame: Math.max(0, listSize - words.length),
    ratio: Math.min(1, mastered.length / listSize),
    ceiling,
    available,
    note,
  };
}

export function targetOptions(data: GameData, p: LangProgress): (LevelOption & { progress: TargetProgress })[] {
  const out: (LevelOption & { progress: TargetProgress })[] = [];
  for (let l = 1; l <= examCount(data.lang); l++) {
    const tp = targetProgress(data, p, l);
    out.push({ level: l, label: tp.label, equiv: levelEquiv(data.lang, l), available: tp.available, note: tp.note || undefined, progress: tp });
  }
  return out;
}

/** Qualification estimate as a number: exam levels reached (≥ REACHED of the list) + share of the next. */
export function estimateLevel(data: GameData, p: LangProgress): number {
  const bars = levelReport(data, p).examBars;
  let reached = 0;
  while (reached < bars.length && bars[reached].ratio >= REACHED) reached++;
  return reached + (bars[reached] ? bars[reached].ratio : 0);
}

// ---------------------------------------------------------------------------
// Pace presets and knobs
// ---------------------------------------------------------------------------

export interface PacePreset {
  label: string;
  /** Japanese one-liner for the settings screen. */
  desc: string;
  newMult: number;
  customers: number;
  /** Minimum share of review (non-curriculum) orders per day. */
  review: number;
  /** Stage clock speed (days of stage schedule per calendar day). */
  clock: number;
  audio: number;
}

export const PACES: Record<Pace, PacePreset> = {
  slow: { label: 'ゆっくり', desc: '新しい言葉は少なめ・お客さんは1人少なく・復習を多めに・次の段階もゆっくり', newMult: 0.6, customers: -1, review: 0.34, clock: 0.75, audio: 0.6 },
  normal: { label: 'ふつう', desc: 'もともとの進み方', newMult: 1, customers: 0, review: 0, clock: 1, audio: 1 },
  fast: { label: '速い', desc: '新しい言葉が多め・お客さんは1人多く・次の段階が早く開く', newMult: 1.4, customers: 1, review: 0, clock: 1.3, audio: 1.2 },
};

export const ADJ_MIN = -1;
export const ADJ_MAX = 0.6;
export const SLOW_SPEECH = 0.75;
export const PEEK_COST = 1;

export interface Knobs {
  customers: number;
  /** New-word budget today. */
  budget: number;
  /** Minimum share of review orders (0 = curriculum may fill the day). */
  reviewShare: number;
  /** Template choice: 1 = as designed (prefer the current stage), < 1 prefers older (simpler) templates. */
  complexity: number;
  /** Multiplier on audio-only probabilities (0 = never). */
  audio: number;
  /** Stage clock rate. */
  clock: number;
}

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x));

/** Today's planning knobs. Without a difficulty state (or with the defaults) these are the stage's own values. */
export function planKnobs(data: GameData, p: LangProgress): Knobs {
  const sd = stageDef(data, p.stage);
  const d = p.difficulty;
  if (!d) return { customers: sd.customersPerDay, budget: sd.newWordsPerDay, reviewShare: 0, complexity: 1, audio: 1, clock: 1 };
  const pr = PACES[d.pace] ?? PACES.normal;
  const a = d.adaptive ? clamp(d.adj, ADJ_MIN, ADJ_MAX) : 0;
  const assistAudio = d.assists.audio === 'off' ? 0 : d.assists.audio === 'many' ? 2 : 1;
  return {
    customers: Math.max(3, sd.customersPerDay + pr.customers),
    budget: Math.max(1, Math.round(sd.newWordsPerDay * pr.newMult * (1 + 0.4 * a))),
    reviewShare: clamp(pr.review + Math.max(0, -a) * 0.4, 0, 0.6),
    complexity: clamp(1 + a, 0.2, 1.5),
    audio: clamp(assistAudio * pr.audio * (1 + 0.5 * a), 0, 3),
    clock: pr.clock * (1 + 0.25 * a),
  };
}

/** Japanese description of the current difficulty, e.g. 「いまは復習多め・新しい言葉は1日3語」. */
export function describeDifficulty(data: GameData, p: LangProgress): string {
  const k = planKnobs(data, p);
  const d = p.difficulty;
  const parts: string[] = [];
  if (k.reviewShare >= 0.3) parts.push('復習多め');
  else if (d && d.adaptive && d.adj > 0.2) parts.push('少し速め');
  else parts.push('ふつうの配分');
  parts.push(`新しい言葉は1日${k.budget}語まで`);
  parts.push(`お客さんは${k.customers}人`);
  if (k.audio === 0) parts.push('声だけの注文なし');
  else if (k.audio >= 1.5) parts.push('声だけの注文多め');
  if (k.complexity < 0.8) parts.push('短めの注文を優先');
  return `いまは${parts.join('・')}`;
}

// ---------------------------------------------------------------------------
// Adaptive controller
// ---------------------------------------------------------------------------

export const WINDOW_DAYS = 4;
export const MIN_ORDERS = 12;
/** New-word orders needed in the window before their accuracy alone can ease the pace. */
export const MIN_NEW_ORDERS = 6;
export const NEW_LOW = 0.45;
export const LOW = 0.6;
export const HIGH = 0.9;
export const RELAX_LO = 0.7;
export const RELAX_HI = 0.85;
export const STEP_DOWN = 0.25;
export const STEP_UP = 0.15;
export const STEP_RELAX = 0.1;
/** A change of direction needs this many days since the last step (hysteresis). */
export const REVERSE_COOLDOWN = 2;

export interface ControllerInput {
  adj: number;
  lastStepDay: number;
  lastDir: -1 | 0 | 1;
  /** What the previous evaluation wanted (0 / absent = nothing). */
  pending?: -1 | 0 | 1;
}

export interface ControllerResult {
  adj: number;
  /** Step taken (0 = none). */
  dir: -1 | 0 | 1;
  /** What this evaluation wanted (kept as `pending` for the next one). */
  want: -1 | 0 | 1;
  reason: string;
}

const pct = (x: number | null) => (x === null ? '—' : `${Math.round(x * 100)}%`);

/**
 * One step of the controller after a closed day. Gradual (one bounded step a day), bounded
 * (ADJ_MIN … ADJ_MAX), hysteretic (dead bands between LOW…RELAX_LO and RELAX_HI…HIGH; a step
 * needs the same verdict on two days in a row; a reversal waits REVERSE_COOLDOWN days; only days
 * after the last step are judged) and explained (reason, Japanese).
 */
export function controllerStep(prev: ControllerInput, history: DayMetrics[], day: number): ControllerResult {
  // Only days after the last step count: each step is judged on its own effect (no overshoot from
  // the same bad day being seen by several overlapping windows).
  const since = prev.lastDir !== 0 ? history.filter((m) => m.day > prev.lastStepDay) : history;
  const w = windowStats(since, WINDOW_DAYS);
  const hold = (reason: string, want: -1 | 0 | 1 = 0): ControllerResult => ({ adj: prev.adj, dir: 0, want, reason });
  if (w.orders < MIN_ORDERS || w.accuracy === null)
    return hold(prev.lastDir !== 0 ? `前回の調整のあと、様子を見ている（お客さん ${w.orders} 人分）` : `まだ様子見（最近${w.days}日のお客さん ${w.orders} 人）`);
  const acc = w.accuracy;
  const head = `最近${w.days}日、一回目でぴったり出せたのは ${pct(acc)}`;
  let want: -1 | 0 | 1 = 0;
  let why = '';
  if (acc < LOW) {
    want = -1;
    why = `（${Math.round(LOW * 100)}%未満）→ 少しゆっくりに`;
  } else if (w.newAccuracy !== null && since.slice(-WINDOW_DAYS).reduce((s, m) => s + m.newN, 0) >= MIN_NEW_ORDERS && w.newAccuracy < NEW_LOW) {
    want = -1;
    why = `。新しい言葉の入った注文は ${pct(w.newAccuracy)} → 新しい言葉を少なめに`;
  } else if (acc > HIGH && (w.lapseRate === null || w.lapseRate < 0.3)) {
    want = 1;
    why = `（${Math.round(HIGH * 100)}%超）→ 少し速めに`;
  } else if (acc >= RELAX_LO && acc <= RELAX_HI && Math.abs(prev.adj) > 1e-9) {
    const adj = Math.abs(prev.adj) <= STEP_RELAX ? 0 : prev.adj - Math.sign(prev.adj) * STEP_RELAX;
    return { adj: round2(adj), dir: 0, want: 0, reason: `${head} → ちょうどよいので元の進み方に少し戻す` };
  } else return hold(`${head} → このまま`);
  if (prev.lastDir !== 0 && want !== prev.lastDir && day - prev.lastStepDay < REVERSE_COOLDOWN) return hold(`${head} → 向きを変える前にもう少し様子を見る`, want);
  const next = clamp(prev.adj + (want < 0 ? -STEP_DOWN : STEP_UP), ADJ_MIN, ADJ_MAX);
  if (Math.abs(next - prev.adj) < 1e-9) return hold(`${head} → もう${want < 0 ? 'いちばんゆっくり' : 'いちばん速く'}`, want);
  if (prev.pending !== want) return hold(`${head} → ${want < 0 ? 'ゆっくりにする' : '速めにする'}か、もう一日様子を見る`, want);
  return { adj: round2(next), dir: want, want, reason: head + why };
}

const round2 = (x: number) => Math.round(x * 100) / 100;

// ---------------------------------------------------------------------------
// Day hooks (metrics + controller)
// ---------------------------------------------------------------------------

function confirmedCount(p: LangProgress): number {
  let n = 0;
  for (const w of Object.values(p.words)) if (w.confirmed) n++;
  return n;
}

function accFor(data: GameData, p: LangProgress): DayAcc {
  const d = difficultyState(p);
  if (!d.acc || d.acc.day !== p.day) {
    const acc = newDayAcc(p.day);
    acc.due = Object.entries(p.words)
      .filter(([, w]) => w.seen > 0 && w.correct > 0 && w.due <= p.day && !w.seeded)
      .map(([id, w]) => [id, w.wrong] as [string, number]);
    acc.confirmedStart = confirmedCount(p);
    const k = planKnobs(data, p);
    acc.budget = k.budget;
    acc.review = k.reviewShare;
    d.acc = acc;
  }
  return d.acc;
}

/** Start of a day (before the shop plans): open today's accumulator. */
export function difficultyStartDay(data: GameData, p: LangProgress): void {
  accFor(data, p);
}

/** Does the order contain a word met for the first time today? */
export function orderHasNewWords(data: GameData, p: LangProgress, order: Pick<OrderInstance, 'text'>): boolean {
  return tokenIds(data.tokens(order.text)).some((id) => {
    const w = p.words[id];
    return !!w && w.firstDay === p.day && !w.seeded;
  });
}

export function difficultyOnServe(data: GameData, p: LangProgress, order: OrderInstance, outcome: Outcome): void {
  accServe(accFor(data, p), order.key, outcome === 'perfect', orderHasNewWords(data, p, order));
}

/** The retry assist restored the state from before a failed cup: count that failed first try again. */
export function difficultyOnRetry(data: GameData, p: LangProgress, order: OrderInstance): void {
  const acc = accFor(data, p);
  accServe(acc, order.key, false, orderHasNewWords(data, p, order));
  acc.retries++;
}

export function difficultyOnVerify(p: LangProgress, ok: boolean): void {
  // Verification may happen before any day hook ran for this day (e.g. right after loading).
  const d = difficultyState(p);
  if (!d.acc || d.acc.day !== p.day) {
    d.acc = newDayAcc(p.day);
    d.acc.confirmedStart = confirmedCount(p);
  }
  d.acc.verifyAttempts++;
  if (ok) d.acc.verifySolved++;
}

/** UI: time from the order appearing to the cup being served. */
export function difficultyOrderTime(p: LangProgress, ms: number): void {
  const d = difficultyState(p);
  if (!d.acc || d.acc.day !== p.day || ms <= 0 || ms > 5 * 60_000) return;
  d.acc.msTotal += ms;
  d.acc.msOrders++;
}

/** Peek at the gloss of an unconfirmed word (assist). Costs reputation; true if granted. */
export function peekWord(p: LangProgress, id: string): boolean {
  const d = difficultyState(p);
  if (!d.assists.peek) return false;
  if (d.peeked[id] === p.day) return true;
  if (p.words[id]?.confirmed) return false;
  d.peeked[id] = p.day;
  p.reputation = Math.max(0, p.reputation - PEEK_COST);
  if (d.acc && d.acc.day === p.day) d.acc.peeks++;
  return true;
}

export function isPeeked(p: LangProgress, id: string): boolean {
  return p.difficulty?.peeked[id] === p.day;
}

/** Authored orders of opened stages not yet served perfectly (the curriculum backlog). */
export function curriculumBacklog(data: GameData, p: LangProgress): number {
  return data.content.orders.filter((o) => o.stage <= p.stage && !p.orders[o.id]?.perfect).length;
}

/**
 * End of the day (before the calendar moves): close the metrics record, run the controller,
 * advance the stage clock offset by (rate − 1). Speeding up is held back while the curriculum
 * backlog is longer than a day's customers, so a faster clock never outruns unseen content.
 */
export function difficultyEndDay(data: GameData, p: LangProgress): void {
  const d = difficultyState(p);
  const acc = accFor(data, p);
  const md = p.townDay?.market;
  let mN = 0;
  let mOk = 0;
  const town = data.shared.town;
  if (md && md.done && town) {
    const stock = stockFromMarket(town.market, md.lines, md.basket);
    for (const l of md.lines) {
      mN++;
      if (lineCovered(l, stock)) mOk++;
    }
  }
  const dl = p.townDay?.delivery;
  const dN = dl?.result ? 1 : 0;
  const dOk = dl?.result && (dl.result.outcome === 'perfect' || dl.result.outcome === 'minor') ? 1 : 0;
  let lapsed = 0;
  for (const [id, wrong] of acc.due) if ((p.words[id]?.wrong ?? 0) > wrong) lapsed++;
  const m: DayMetrics = {
    day: p.day,
    ft: acc.firstTry,
    ftOk: acc.firstTryOk,
    newN: acc.newOrders,
    newOk: acc.newOk,
    revN: acc.reviewOrders,
    revOk: acc.reviewOk,
    vA: acc.verifyAttempts,
    vS: acc.verifySolved,
    mN,
    mOk,
    dN,
    dOk,
    dueN: acc.due.length,
    lapsed,
    conf: Math.max(0, confirmedCount(p) - acc.confirmedStart),
    sec: acc.msOrders ? Math.round(acc.msTotal / acc.msOrders / 100) / 10 : 0,
    retries: acc.retries,
    peeks: acc.peeks,
    est: Math.round(estimateLevel(data, p) * 1000) / 1000,
    stage: p.stage,
    adj: d.adj,
    budget: acc.budget ?? planKnobs(data, p).budget,
    review: acc.review ?? 0,
  };
  d.history = pushHistory(d.history, m);
  if (d.adaptive) {
    const r = controllerStep(d, d.history, p.day);
    d.pending = r.dir !== 0 ? 0 : r.want;
    if (r.dir !== 0) {
      d.lastStepDay = p.day;
      d.lastDir = r.dir;
    }
    d.adj = r.adj;
    d.lastReason = r.reason;
    m.adj = d.adj;
  }
  const k = planKnobs(data, p);
  let rate = k.clock;
  if (rate > 1 && curriculumBacklog(data, p) > k.customers) rate = 1;
  d.clockOffset = Math.round((d.clockOffset + rate - 1) * 1000) / 1000;
  d.acc = null;
}

// ---------------------------------------------------------------------------
// Seeding (既習扱い) and level changes
// ---------------------------------------------------------------------------

export const SEED_SEEN = 6;
export const SEED_CORRECT = 2;

/** Deterministic spread of first review days (3…14) so seeded words come back now and then, not all at once. */
function seedInterval(id: string): number {
  return 3 + (hashString(id) % 12);
}

function seedWord(p: LangProgress, id: string): boolean {
  const prev = p.words[id];
  if (prev?.confirmed) return false;
  const w: WordState = prev ?? newWordState(p.day);
  const addSeen = Math.max(0, SEED_SEEN - w.seen);
  const addCorrect = Math.max(0, SEED_CORRECT - w.correct);
  w.seen += addSeen;
  w.correct += addCorrect;
  w.confirmed = true;
  const iv = seedInterval(id);
  if (w.interval < iv) {
    w.interval = iv;
    w.due = p.day + iv;
  }
  w.seeded = { day: p.day, seen: addSeen, correct: addCorrect, fresh: !prev };
  p.words[id] = w;
  return true;
}

/** Take a word out of 既習扱い: back to how it was before seeding (minus what was seeded). */
export function unseedWord(data: GameData, p: LangProgress, id: string): boolean {
  const w = p.words[id];
  const s = w?.seeded;
  if (!w || !s) return false;
  const entry = data.lex.byId.get(id);
  const page = entry ? p.verification[entry.group] : undefined;
  const sealedByPlay = !!page?.solved && !page.seeded;
  if (s.fresh && w.seen <= s.seen && !w.memo && !sealedByPlay) {
    delete p.words[id];
  } else {
    w.seen = Math.max(0, w.seen - s.seen);
    w.correct = Math.max(0, w.correct - s.correct);
    w.confirmed = sealedByPlay;
    w.interval = 0;
    w.ease = START_EASE;
    w.due = p.day;
    delete w.seeded;
  }
  if (entry && page?.seeded) delete p.verification[entry.group];
  reopenSeededOrders(data, p);
  return true;
}

/** Manual revert from the notebook: also remembered so a later level change does not re-seed it. */
export function revertSeededWord(data: GameData, p: LangProgress, id: string): boolean {
  const ok = unseedWord(data, p, id);
  if (ok) {
    const d = difficultyState(p);
    if (!d.optOut.includes(id)) d.optOut.push(id);
  }
  return ok;
}

function orderKnown(data: GameData, p: LangProgress, text: string): boolean {
  return tokenIds(data.tokens(text)).every((id) => !!p.words[id]?.confirmed);
}

function reopenSeededOrders(data: GameData, p: LangProgress): number {
  let n = 0;
  for (const o of data.content.orders) {
    const log = p.orders[o.id];
    if (log?.seeded && !orderKnown(data, p, o.text)) {
      delete p.orders[o.id];
      n++;
    }
  }
  return n;
}

export interface LevelChangeSummary {
  from: number;
  to: number;
  seeded: number;
  reopened: number;
  pagesSealed: number;
  pagesReopened: number;
  ordersSkipped: number;
  ordersReopened: number;
  stageFrom: number;
  stageTo: number;
}

/** Japanese summary of a level change for the settings screen. */
export function describeChange(data: GameData, s: LevelChangeSummary): string[] {
  const out: string[] = [];
  if (s.seeded) out.push(`${s.seeded} 語を「既習扱い」にしました（手帳で一語ずつ取り消せます）。`);
  if (s.reopened) out.push(`${s.reopened} 語を学び直しの対象に戻しました。`);
  if (s.pagesSealed) out.push(`検証ページ ${s.pagesSealed} 枚を確定済みにしました。`);
  if (s.pagesReopened) out.push(`検証ページ ${s.pagesReopened} 枚をもう一度開けるようにしました。`);
  if (s.ordersSkipped) out.push(`知っている言葉だけの最初の注文 ${s.ordersSkipped} 件を済んだことにしました。`);
  if (s.ordersReopened) out.push(`注文 ${s.ordersReopened} 件をもう一度出すようにしました。`);
  if (s.stageTo > s.stageFrom) out.push(`店は第${s.stageTo}段階から（棚・道具・町の用事もそこまで開きます）。物語は最初から、少し詰めて進みます。`);
  if (s.to < s.from && s.stageTo === s.stageFrom) out.push('店の段階はそのままです（開いた棚や用事は閉じません）。');
  if (!out.length) out.push('変更はありません。');
  void data;
  return out;
}

/**
 * Set the starting level: seed words at or below it, take back seeding above it, seal / reopen
 * 検証ページ and earlier curriculum orders accordingly, and fast-forward the shop (never back).
 * Safe to call at any time (mid-day too: today's plan stays, new stages show on the shelf at once).
 */
export function applyStartLevel(data: GameData, p: LangProgress, level: number): LevelChangeSummary {
  const d = difficultyState(p);
  const lang = data.lang;
  const opt = startOptions(data).find((o) => o.level === level);
  if (!opt?.available) level = d.start;
  const before = confirmedCount(p);
  const sum: LevelChangeSummary = { from: d.start, to: level, seeded: 0, reopened: 0, pagesSealed: 0, pagesReopened: 0, ordersSkipped: 0, ordersReopened: 0, stageFrom: p.stage, stageTo: p.stage };
  const seededNow: string[] = [];

  // 1. take back seeding above the new level
  for (const e of data.content.lexicon) {
    const w = p.words[e.id];
    if (!w?.seeded) continue;
    const l = wordLevel(lang, e);
    if (l === 0 || l > level) {
      const page = p.verification[e.group];
      if (unseedWord(data, p, e.id)) {
        sum.reopened++;
        if (page?.seeded && !p.verification[e.group]) sum.pagesReopened++;
      }
    }
  }
  // 2. seed words at or below it
  for (const e of wordsUpTo(data, level)) {
    if (d.optOut.includes(e.id)) continue;
    if (seedWord(p, e.id)) {
      sum.seeded++;
      seededNow.push(e.id);
    }
  }
  // 3. verification pages whose words are all known are sealed
  for (const page of data.content.verificationPages) {
    const words = data.content.lexicon.filter((e) => e.group === page.id);
    const rec = p.verification[page.id];
    if (rec?.solved || !words.length) continue;
    if (words.every((e) => p.words[e.id]?.confirmed)) {
      p.verification[page.id] = { attempts: rec?.attempts ?? 0, solved: true, seeded: true };
      sum.pagesSealed++;
    }
  }
  // 4. curriculum orders before the start stage made only of known words are done
  sum.ordersReopened = reopenSeededOrders(data, p);
  const startStage = startStageFor(data, level);
  for (const o of data.content.orders) {
    if (o.stage >= startStage || p.orders[o.id]?.perfect) continue;
    if (orderKnown(data, p, o.text)) {
      p.orders[o.id] = { attempts: p.orders[o.id]?.attempts ?? 0, perfect: true, seeded: true };
      sum.ordersSkipped++;
    }
  }
  // 5. fast-forward the shop (never back): stage, its reputation, the stage clock, the town
  if (startStage > p.stage) {
    const sd = stageDef(data, startStage);
    p.stage = startStage;
    p.reputation = Math.max(p.reputation, sd.minReputation);
    d.clockOffset = Math.max(d.clockOffset, sd.minDay - p.day);
    d.storyCatchUp = true;
    const town = data.shared.town;
    if (town) {
      const sday = stageDay(p);
      const runs = (u: { minDay: number }, perDay: number, cap: number) => Math.min(cap, Math.max(0, Math.floor((sday - u.minDay) * perDay)));
      p.town.marketRuns = Math.max(p.town.marketRuns, runs(town.market.unlock, town.market.unlock.chance, town.market.levels[town.market.levels.length - 1].minRuns));
      p.town.deliveryRuns = Math.max(p.town.deliveryRuns, runs(town.delivery.unlock, town.delivery.unlock.chance, town.delivery.levels[town.delivery.levels.length - 1].minRuns));
      if (sday >= town.market.unlock.minDay) p.town.money = Math.max(p.town.money, town.market.startMoney);
    }
  }
  sum.stageTo = p.stage;
  d.start = level;
  d.changes.push({ day: p.day, start: level, pace: d.pace });
  // Today's ledger and metrics should not count the level change as words confirmed today.
  const delta = confirmedCount(p) - before;
  if (d.acc && d.acc.day === p.day) d.acc.confirmedStart += delta;
  const sToday = p.story?.today;
  if (sToday && sToday.day === p.day) {
    const set = new Set(sToday.confirmedAtStart);
    for (const id of seededNow) set.add(id);
    sToday.confirmedAtStart = [...set].filter((id) => p.words[id]?.confirmed);
  }
  return sum;
}

/** Change pace / adaptive / assists / target. Switching the controller off resets its adjustment. */
export function setDifficultyOptions(p: LangProgress, opts: Partial<Pick<DifficultyState, 'pace' | 'adaptive' | 'target'>> & { assists?: Partial<Assists> }): void {
  const d = difficultyState(p);
  if (opts.pace && opts.pace !== d.pace) {
    d.pace = opts.pace;
    d.changes.push({ day: p.day, start: d.start, pace: d.pace });
  }
  if (opts.adaptive !== undefined && opts.adaptive !== d.adaptive) {
    d.adaptive = opts.adaptive;
    if (!d.adaptive) {
      d.adj = 0;
      d.lastDir = 0;
      d.pending = 0;
      d.lastReason = '';
    }
  }
  if (opts.target !== undefined) d.target = opts.target;
  if (opts.assists) d.assists = { ...d.assists, ...opts.assists };
}

/** Is the story replaying a backlog (the player started above zero)? */
export function storyCatchingUp(p: LangProgress): boolean {
  return !!p.difficulty?.storyCatchUp;
}

/** Seeded (既習扱い) words in the notebook. */
export function seededWords(p: LangProgress): string[] {
  return Object.entries(p.words)
    .filter(([, w]) => w.seeded)
    .map(([id]) => id);
}
