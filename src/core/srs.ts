/**
 * Hidden spaced repetition. There is no flashcard screen: these states only steer
 * which orders the day planner picks and drive the notebook / 現在地 panel.
 */

export interface WordState {
  /** Times the word was seen in an order / reaction / recipe page. */
  seen: number;
  /** Times it was part of an order served perfectly. */
  correct: number;
  /** Times it was implicated in a mistake. */
  wrong: number;
  firstDay: number;
  lastDay: number;
  /** Days until the word is due again; 0 = not yet scheduled. */
  interval: number;
  ease: number;
  /** Day on which the word becomes due. */
  due: number;
  /** Sentences (raw content text, may contain markup) in which the word was seen. Newest first. */
  contexts: string[];
  /** Player's own free memo (never checked). */
  memo: string;
  /** Player's own guessed meaning (自分の推測; never checked; optional, absent = none). */
  guess?: string;
  /** Meaning confirmed via a 検証ページ (earned by play: the only state that shows the official gloss). */
  confirmed: boolean;
  /**
   * 既習扱い ("assumed known", 未確認・知っているはず): set by the chosen starting level
   * (src/core/difficulty.ts), not by play. Counts as known for task selection / SRS / pacing /
   * ranks (see isKnown) but never as confirmed: no gloss is shown until the player verifies it.
   * Records what seeding added so it can be taken back exactly. Absent in older saves.
   */
  seeded?: { day: number; seen: number; correct: number; fresh: boolean };
}

export const MAX_CONTEXTS = 6;
export const START_EASE = 2.3;
export const MIN_EASE = 1.3;
export const MAX_EASE = 2.8;

export function newWordState(day: number): WordState {
  return {
    seen: 0,
    correct: 0,
    wrong: 0,
    firstDay: day,
    lastDay: day,
    interval: 0,
    ease: START_EASE,
    due: day,
    contexts: [],
    memo: '',
    confirmed: false,
  };
}

export type WordMap = Record<string, WordState>;

/** Make sure a word exists in the notebook without counting an encounter (e.g. shelf labels). */
export function ensureWord(words: WordMap, id: string, day: number): WordState {
  if (!words[id]) words[id] = newWordState(day);
  return words[id];
}

/** Record one encounter of each id in `ids`, remembering the sentence as context. */
export function recordEncounter(words: WordMap, ids: string[], day: number, context?: string): void {
  for (const id of new Set(ids)) {
    const w = ensureWord(words, id, day);
    w.seen += 1;
    w.lastDay = day;
    if (context && !w.contexts.includes(context)) {
      w.contexts.unshift(context);
      if (w.contexts.length > MAX_CONTEXTS) w.contexts.length = MAX_CONTEXTS;
    }
  }
}

/** Word was used in a perfectly served order: grow the interval. */
export function recordSuccess(words: WordMap, id: string, day: number): void {
  const w = ensureWord(words, id, day);
  w.correct += 1;
  if (w.interval <= 0) w.interval = 1;
  else if (w.interval === 1) w.interval = 3;
  else w.interval = Math.round(w.interval * w.ease);
  w.ease = Math.min(MAX_EASE, w.ease + 0.05);
  w.due = day + w.interval;
}

/** Word was implicated in a mistake: reset to tomorrow, lower ease. */
export function recordLapse(words: WordMap, id: string, day: number): void {
  const w = ensureWord(words, id, day);
  w.wrong += 1;
  w.interval = 1;
  w.ease = Math.max(MIN_EASE, w.ease - 0.2);
  w.due = day + 1;
}

export function isDue(w: WordState | undefined, day: number): boolean {
  return !!w && w.seen > 0 && w.due <= day;
}

export function isWeak(w: WordState | undefined): boolean {
  return !!w && w.seen > 0 && (w.wrong > w.correct || w.ease < 2.0);
}

/**
 * "Mastered" for the 現在地 panel: meaning confirmed in a 検証ページ AND either used correctly
 * twice in served orders or seen at least 6 times (for words that only occur in reactions/pages).
 */
export function isMastered(w: WordState | undefined): boolean {
  return !!w && isKnown(w) && (w.correct >= 2 || w.seen >= 6);
}

/**
 * Known for the game's internal pacing (task selection, SRS, curriculum skipping, rank thresholds,
 * 現在地): confirmed by play OR assumed known by the start level (既習扱い). Never use this to decide
 * whether a gloss may be shown — that is `confirmed` alone.
 */
export function isKnown(w: WordState | undefined): boolean {
  return !!w && (w.confirmed || !!w.seeded);
}

/** Encounters made in play (the start level's seeded encounters left out). */
export function playSeen(w: WordState | undefined): number {
  if (!w) return 0;
  return Math.max(0, w.seen - (w.seeded?.seen ?? 0));
}

/** Priority of reviewing this word today (higher = more wanted). */
export function reviewWeight(w: WordState | undefined, day: number): number {
  if (!w || w.seen === 0) return 0;
  let s = 0;
  if (isDue(w, day)) s += 3 + Math.min(3, day - w.due);
  if (isWeak(w)) s += 2;
  if (w.correct === 0) s += 1;
  return s;
}
