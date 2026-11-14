/**
 * The compiled English lists (data/english/vocab.json, phrases.json, grammar.json) as the game
 * uses them: the curriculum and the yardstick for 英検 / TOEIC progress.
 *
 * The lists are compiled in parallel and may be missing or incomplete; everything here is
 * tolerant: a missing file is an empty list, an item without a usable word / level is skipped,
 * and the game keeps working without lists (it then says so honestly in the 現在地 page).
 *
 * Bundling: the raw files are ~10k entries with long Japanese glosses. `packLists` trims every
 * item to the fields the game reads (first sense of the gloss, ≤ 24 chars; no examples), the Vite
 * plugin (scripts/englishLists.ts) gzips that and inlines it as base64 into the single-file
 * build; the browser decompresses it once at start (browser.ts). Node (tests, scripts) reads the
 * JSON directly (node.ts). Both end in `setEnglishLists`.
 */
import type { EikenGrade } from '../core/types';
import { eikenFromKey, toeicBand, type ToeicBand } from './yardsticks';

export interface VocabItem {
  word: string;
  pos: string;
  eiken: EikenGrade | null;
  toeic: ToeicBand | null;
  cefr: string | null;
  ja: string;
  domains: string[];
  freq: number;
}

export interface PhraseItem {
  id: string;
  text: string;
  type: string;
  eiken: EikenGrade | null;
  toeic: ToeicBand | null;
  ja: string;
  functions: string[];
  domains: string[];
}

export interface GrammarItem {
  id: string;
  name: string;
  ja: string;
  eiken: EikenGrade | null;
  toeic: ToeicBand | null;
}

export interface EnglishLists {
  vocab: VocabItem[];
  phrases: PhraseItem[];
  grammar: GrammarItem[];
  /** Lower-cased headword → items (a word may be listed once per part of speech). */
  byWord: Map<string, VocabItem[]>;
  phraseById: Map<string, PhraseItem>;
  grammarById: Map<string, GrammarItem>;
  /** Where they came from / problems while reading (shown by validate-content). */
  notes: string[];
}

export function emptyLists(notes: string[] = []): EnglishLists {
  return indexLists([], [], [], notes);
}

export function indexLists(vocab: VocabItem[], phrases: PhraseItem[], grammar: GrammarItem[], notes: string[] = []): EnglishLists {
  const byWord = new Map<string, VocabItem[]>();
  for (const v of vocab) {
    const k = v.word.toLowerCase();
    const arr = byWord.get(k);
    if (arr) arr.push(v);
    else byWord.set(k, [v]);
  }
  return {
    vocab,
    phrases,
    grammar,
    byWord,
    phraseById: new Map(phrases.map((p) => [p.id, p])),
    grammarById: new Map(grammar.map((g) => [g.id, g])),
    notes,
  };
}

let current: EnglishLists = emptyLists(['lists not loaded']);

export function setEnglishLists(l: EnglishLists): void {
  current = l;
  listeners.forEach((f) => f());
}

export function englishLists(): EnglishLists {
  return current;
}

export function listsLoaded(): boolean {
  return current.vocab.length > 0;
}

const listeners = new Set<() => void>();
export function onListsChange(f: () => void): () => void {
  listeners.add(f);
  return () => listeners.delete(f);
}

// ---------------------------------------------------------------------------
// Reading raw JSON (tolerant)
// ---------------------------------------------------------------------------

type Raw = Record<string, unknown>;
const str = (x: unknown): string => (typeof x === 'string' ? x : x === null || x === undefined ? '' : String(x));
const arr = (x: unknown): string[] => (Array.isArray(x) ? x.map(str).filter(Boolean) : typeof x === 'string' && x ? [x] : []);
const num = (x: unknown): number | null => {
  const n = typeof x === 'number' ? x : typeof x === 'string' && x.trim() ? Number(x) : NaN;
  return Number.isFinite(n) ? n : null;
};

/** First sense of a Japanese gloss, short enough for a card. */
export function shortJa(ja: string, max = 24): string {
  const first = ja.split(/[／/;；\n]|、(?=[^）)]*$)/)[0]?.trim() ?? '';
  const s = first || ja.trim();
  return s.length > max ? `${s.slice(0, max - 1)}…` : s;
}

function rawArray(raw: unknown, key: string): Raw[] {
  if (Array.isArray(raw)) return raw as Raw[];
  if (raw && typeof raw === 'object') {
    const o = raw as Raw;
    for (const k of [key, 'items', 'entries', 'data', 'points']) if (Array.isArray(o[k])) return o[k] as Raw[];
  }
  return [];
}

export function readVocab(raw: unknown): VocabItem[] {
  const out: VocabItem[] = [];
  for (const r of rawArray(raw, 'vocab')) {
    if (!r || typeof r !== 'object') continue;
    const word = str(r.word ?? r.headword ?? r.lemma).trim();
    if (!word) continue;
    out.push({
      word,
      pos: str(r.pos),
      eiken: eikenFromKey(r.eiken === null || r.eiken === undefined ? null : str(r.eiken)),
      toeic: toeicBand(num(r.toeic)),
      cefr: str(r.cefr) || null,
      ja: shortJa(str(r.ja ?? r.gloss ?? r.meaning)),
      domains: arr(r.domains),
      freq: num(r.freq) ?? 0,
    });
  }
  return out;
}

export function readPhrases(raw: unknown): PhraseItem[] {
  const out: PhraseItem[] = [];
  for (const r of rawArray(raw, 'phrases')) {
    if (!r || typeof r !== 'object') continue;
    const id = str(r.id);
    const text = str(r.text ?? r.phrase).trim();
    if (!id || !text) continue;
    out.push({
      id,
      text,
      type: str(r.type),
      eiken: eikenFromKey(r.eiken === null || r.eiken === undefined ? null : str(r.eiken)),
      toeic: toeicBand(num(r.toeic)),
      ja: shortJa(str(r.ja), 30),
      functions: arr(r.functions),
      domains: arr(r.domains),
    });
  }
  return out;
}

export function readGrammar(raw: unknown): GrammarItem[] {
  const out: GrammarItem[] = [];
  for (const r of rawArray(raw, 'grammar')) {
    if (!r || typeof r !== 'object') continue;
    const id = str(r.id);
    if (!id) continue;
    out.push({
      id,
      name: str(r.name ?? r.title ?? r.point ?? r.pattern ?? r.label ?? id),
      ja: shortJa(str(r.ja ?? r.nameJa ?? r.titleJa ?? r.descriptionJa ?? r.explanationJa), 30),
      eiken: eikenFromKey(r.eiken === null || r.eiken === undefined ? null : str(r.eiken)),
      toeic: toeicBand(num(r.toeic)),
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Packing (build time) / unpacking (run time)
// ---------------------------------------------------------------------------

/** Compact JSON: domain names once, items as tuples. */
export interface PackedLists {
  d: string[];
  /** [word, pos, eiken|'', toeic|0, cefr|'', ja, domainIdx[], freq] */
  w: [string, string, string, number, string, string, number[], number][];
  /** [id, text, type, eiken|'', toeic|0, ja, functions[], domainIdx[]] */
  p: [string, string, string, string, number, string, string[], number[]][];
  /** [id, name, ja, eiken|'', toeic|0] */
  g: [string, string, string, string, number][];
}

export function packLists(vocab: VocabItem[], phrases: PhraseItem[], grammar: GrammarItem[]): PackedLists {
  const d: string[] = [];
  const di = new Map<string, number>();
  const dom = (xs: string[]) =>
    xs.map((x) => {
      let i = di.get(x);
      if (i === undefined) {
        i = d.length;
        d.push(x);
        di.set(x, i);
      }
      return i;
    });
  return {
    d,
    w: vocab.map((v) => [v.word, v.pos, v.eiken ?? '', v.toeic ?? 0, v.cefr ?? '', v.ja, dom(v.domains), Math.round(v.freq * 100) / 100]),
    p: phrases.map((x) => [x.id, x.text, x.type, x.eiken ?? '', x.toeic ?? 0, x.ja, x.functions, dom(x.domains)]),
    g: grammar.map((x) => [x.id, x.name, x.ja, x.eiken ?? '', x.toeic ?? 0]),
  };
}

export function unpackLists(pk: PackedLists, notes: string[] = []): EnglishLists {
  const d = pk.d ?? [];
  const eg = (s: string) => eikenFromKey(s || null);
  const tb = (n: number) => (n ? toeicBand(n) : null);
  const vocab: VocabItem[] = (pk.w ?? []).map(([word, pos, e, t, cefr, ja, ds, freq]) => ({
    word,
    pos,
    eiken: eg(e),
    toeic: tb(t),
    cefr: cefr || null,
    ja,
    domains: ds.map((i) => d[i]),
    freq,
  }));
  const phrases: PhraseItem[] = (pk.p ?? []).map(([id, text, type, e, t, ja, functions, ds]) => ({
    id,
    text,
    type,
    eiken: eg(e),
    toeic: tb(t),
    ja,
    functions,
    domains: ds.map((i) => d[i]),
  }));
  const grammar: GrammarItem[] = (pk.g ?? []).map(([id, name, ja, e, t]) => ({ id, name, ja, eiken: eg(e), toeic: tb(t) }));
  return indexLists(vocab, phrases, grammar, notes);
}

/**
 * Look up a lexicon word in the vocab list: its headword and every surface form are tried (a
 * lexicon entry is a lemma with its forms: "is" also lists "be"); items of the same part of speech
 * are preferred, and among the matches the easiest one wins (the lemma's level).
 */
export function vocabFor(lists: EnglishLists, text: string, pos?: string, forms: string[] = [], lemma?: string): VocabItem | undefined {
  const all: VocabItem[] = [];
  for (const s of [text, ...forms]) all.push(...(lists.byWord.get(s.toLowerCase()) ?? []));
  // An inflected word taught as its own entry ("names", "booked") is looked up by its headword.
  if (!all.length && lemma) return vocabFor(lists, lemma, pos);
  if (!all.length) return undefined;
  const same = pos ? all.filter((v) => posMatches(v.pos, pos)) : [];
  const pool = same.length ? same : all.filter((v) => v.word.toLowerCase() === text.toLowerCase()).length ? all.filter((v) => v.word.toLowerCase() === text.toLowerCase()) : all;
  const rank = (v: VocabItem) => (v.eiken ? ['5', '4', '3', '準2', '2', '準1', '1'].indexOf(v.eiken) : 9) * 10 + (v.toeic ? v.toeic / 1000 : 9);
  return [...pool].sort((a, b) => rank(a) - rank(b))[0];
}

const POS_ALIASES: Record<string, string[]> = {
  noun: ['noun', 'n'],
  verb: ['verb', 'v'],
  adj: ['adj', 'adjective'],
  adv: ['adv', 'adverb'],
  prep: ['prep', 'preposition'],
  pron: ['pron', 'pronoun'],
  conj: ['conj', 'conjunction'],
  det: ['det', 'determiner', 'article'],
  num: ['num', 'number', 'numeral'],
  interj: ['interj', 'interjection'],
};

export function posMatches(listPos: string, gamePos: string): boolean {
  const a = listPos.toLowerCase();
  return (POS_ALIASES[gamePos] ?? [gamePos]).some((x) => a === x || a.startsWith(x));
}
