/**
 * 単語帳 (the player's own word book) and the player's own notes on words (自分の推測 + メモ).
 *
 * - Every lexicon word can carry the player's guessed meaning (`WordState.guess`) and a free memo
 *   (`WordState.memo`). They are never checked; the official gloss is only shown once the word is
 *   confirmed on its 検証ページ, and then next to the player's guess so the two can be compared.
 * - The 単語帳 lists the words the player starred (「気になる」) and words they wrote in by hand —
 *   including words the game does not have. A hand-written word that matches a lexicon word (its
 *   text or one of its forms) is linked to that word instead of being a second copy.
 * - Notes of a linked word live on its WordState once the player has met it; for a word written in
 *   by hand before it was ever met, they live on the entry until the first time they are edited
 *   after the word was met (noteOf reads both). This keeps unmet words out of the notebook's word
 *   list and out of the planner's "known" checks (which look at `p.words`).
 * - Self-review (覚えた / まだ) is the player's own: it never touches the hidden SRS.
 */
import type { GameData } from './gamedata';
import type { LangProgress } from './save';
import { ensureWord, type WordState } from './srs';

export interface WordbookReview {
  ok: number;
  again: number;
  /** Game day of the last self-review. */
  last: number;
  /** The player's last verdict: true = 覚えた, false = まだ. */
  known: boolean;
}

export interface WordbookEntry {
  /** Stable key within the language ('wb1', 'wb2', …). */
  key: string;
  /** Linked lexicon word (starred, or written by hand and matched). */
  id?: string;
  /** The word as written by hand (unlinked entries; linked ones show the lexicon text). */
  text?: string;
  /** Unlinked entries (or a linked word not met yet): the player's own meaning. */
  guess?: string;
  memo?: string;
  /** Written in by hand (else starred from a word card). */
  hand?: boolean;
  /** Date.now() when added (sort: recently added). */
  at: number;
  /** Game day when added. */
  day: number;
  rev?: WordbookReview;
}

export interface WordbookState {
  entries: WordbookEntry[];
  seq: number;
}

export function newWordbook(): WordbookState {
  return { entries: [], seq: 0 };
}

/** The language's word book, created on first use (and repaired when imported half-written). */
export function wordbookOf(p: LangProgress): WordbookState {
  if (!p.wordbook || !Array.isArray(p.wordbook.entries)) p.wordbook = newWordbook();
  if (typeof p.wordbook.seq !== 'number') p.wordbook.seq = p.wordbook.entries.length;
  return p.wordbook;
}

export function entryForWord(p: LangProgress, id: string): WordbookEntry | undefined {
  return p.wordbook?.entries.find((e) => e.id === id);
}

export function isStarred(p: LangProgress | null | undefined, id: string): boolean {
  return !!p?.wordbook?.entries.some((e) => e.id === id);
}

const clean = (s: string | undefined) => (s ?? '').replace(/\s+/g, ' ').trim().slice(0, 200);

/** Match hand-written text to a lexicon word (its text or one of its forms; case-insensitive in en). */
export function matchLexicon(data: GameData, text: string): string | undefined {
  const t = clean(text);
  if (!t) return undefined;
  const key = data.lang === 'en' ? t.toLowerCase().replace(/[.!?,]+$/, '') : t;
  return data.lex.bySurface.get(key);
}

/** The player's notes on a lexicon word (its WordState first, else a word book entry). */
export function noteOf(p: LangProgress | null | undefined, id: string): { guess: string; memo: string } {
  const w = p?.words[id];
  const e = p ? entryForWord(p, id) : undefined;
  return { guess: w?.guess || e?.guess || '', memo: w?.memo || e?.memo || '' };
}

/** Set the player's guess and / or memo on a lexicon word. */
export function setWordNote(p: LangProgress, id: string, note: { guess?: string; memo?: string }): void {
  const e = entryForWord(p, id);
  let w: WordState | undefined = p.words[id];
  if (!w && !e) w = ensureWord(p.words, id, p.day); // a word seen on screen but not recorded yet
  if (w) {
    // Notes kept on an entry before the word was met move onto the word.
    if (e) {
      if (!w.guess && e.guess) w.guess = e.guess;
      if (!w.memo && e.memo) w.memo = e.memo;
      delete e.guess;
      delete e.memo;
    }
    if (note.guess !== undefined) w.guess = clean(note.guess);
    if (note.memo !== undefined) w.memo = (note.memo ?? '').slice(0, 1000);
    if (!w.guess) delete w.guess;
    return;
  }
  if (e) {
    if (note.guess !== undefined) e.guess = clean(note.guess);
    if (note.memo !== undefined) e.memo = (note.memo ?? '').slice(0, 1000);
  }
}

function nextKey(b: WordbookState): string {
  b.seq++;
  let k = `wb${b.seq}`;
  while (b.entries.some((e) => e.key === k)) k = `wb${++b.seq}`;
  return k;
}

/** 「気になる」: star / unstar a lexicon word. Returns the new state (true = in the word book). */
export function toggleStar(p: LangProgress, id: string, now = Date.now()): boolean {
  const b = wordbookOf(p);
  const i = b.entries.findIndex((e) => e.id === id);
  if (i >= 0) {
    const e = b.entries[i];
    // Notes kept only on the entry would be lost: move them onto the word first.
    if (e.guess || e.memo) setWordNote(p, id, {});
    b.entries.splice(i, 1);
    return false;
  }
  b.entries.unshift({ key: nextKey(b), id, at: now, day: p.day });
  return true;
}

export interface HandResult {
  entry: WordbookEntry;
  /** Linked to an existing lexicon word (and not added a second time). */
  linked: boolean;
  /** The word was already in the word book. */
  existed: boolean;
}

/** Write a word into the word book by hand (any word, also one the game does not have). */
export function addHandEntry(data: GameData | null, p: LangProgress, input: { text: string; guess?: string; memo?: string }, now = Date.now()): HandResult | null {
  const text = clean(input.text);
  if (!text) return null;
  const b = wordbookOf(p);
  const id = data ? matchLexicon(data, text) : undefined;
  if (id) {
    let e = entryForWord(p, id);
    const existed = !!e;
    if (!e) {
      e = { key: nextKey(b), id, text, hand: true, at: now, day: p.day };
      b.entries.unshift(e);
    }
    const note: { guess?: string; memo?: string } = {};
    if (clean(input.guess)) note.guess = input.guess;
    if ((input.memo ?? '').trim()) note.memo = input.memo;
    if (Object.keys(note).length) {
      if (p.words[id]) setWordNote(p, id, note);
      else {
        if (note.guess !== undefined) e.guess = clean(note.guess);
        if (note.memo !== undefined) e.memo = note.memo;
      }
    }
    return { entry: e, linked: true, existed };
  }
  const low = text.toLowerCase();
  const same = b.entries.find((e) => !e.id && (e.text ?? '').toLowerCase() === low);
  if (same) {
    if (clean(input.guess)) same.guess = clean(input.guess);
    if ((input.memo ?? '').trim()) same.memo = input.memo;
    return { entry: same, linked: false, existed: true };
  }
  const e: WordbookEntry = { key: nextKey(b), text, hand: true, at: now, day: p.day };
  if (clean(input.guess)) e.guess = clean(input.guess);
  if ((input.memo ?? '').trim()) e.memo = input.memo;
  b.entries.unshift(e);
  return { entry: e, linked: false, existed: false };
}

/** Edit an entry: for a linked word the notes go onto the word (setWordNote); text only for unlinked ones. */
export function editEntry(p: LangProgress, key: string, patch: { text?: string; guess?: string; memo?: string }): void {
  const e = p.wordbook?.entries.find((x) => x.key === key);
  if (!e) return;
  if (e.id) {
    setWordNote(p, e.id, { guess: patch.guess, memo: patch.memo });
    return;
  }
  if (patch.text !== undefined && clean(patch.text)) e.text = clean(patch.text);
  if (patch.guess !== undefined) e.guess = clean(patch.guess);
  if (patch.memo !== undefined) e.memo = patch.memo.slice(0, 1000);
}

export function removeEntry(p: LangProgress, key: string): void {
  const b = p.wordbook;
  if (!b) return;
  const e = b.entries.find((x) => x.key === key);
  if (e?.id && (e.guess || e.memo)) setWordNote(p, e.id, {});
  b.entries = b.entries.filter((x) => x.key !== key);
}

/** Self-review verdict (覚えた / まだ). Never touches the hidden SRS. */
export function markReview(p: LangProgress, key: string, ok: boolean): void {
  const e = p.wordbook?.entries.find((x) => x.key === key);
  if (!e) return;
  const r = (e.rev ??= { ok: 0, again: 0, last: p.day, known: false });
  if (ok) r.ok++;
  else r.again++;
  r.last = p.day;
  r.known = ok;
}

/** Order of a self-review round: not yet 覚えた first, then the longest unreviewed. */
export function reviewOrder(entries: WordbookEntry[]): WordbookEntry[] {
  return [...entries].sort(
    (a, b) => Number(!!a.rev?.known) - Number(!!b.rev?.known) || (a.rev?.last ?? -1) - (b.rev?.last ?? -1) || b.at - a.at,
  );
}

export type WordStateKind = 'confirmed' | 'guess' | 'assumed' | 'open' | 'own';

/** What the player knows about a word, for labels: 確 / 推測あり / 知っているはず / 未確認 (/ 自作). */
export function wordStateKind(p: LangProgress | null | undefined, id: string | undefined): WordStateKind {
  if (!id) return 'own';
  const w = p?.words[id];
  if (w?.confirmed) return 'confirmed';
  if (noteOf(p, id).guess) return 'guess';
  if (w?.seeded) return 'assumed';
  return 'open';
}

export const STATE_LABEL: Record<WordStateKind, string> = {
  confirmed: '確',
  guess: '推測あり',
  assumed: '未確認（知っているはず）',
  open: '未確認',
  own: '自分で追加',
};
