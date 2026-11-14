import type { Face, Lang, OrderInstance, Outcome } from './types';
import type { WordMap } from './srs';
import type { TownDayState, TownProgress } from './townTypes';
import { newStoryState, type StoryState } from '../story/types';
import type { DifficultyState } from './difficulty';

export const SAVE_VERSION = 3;
export const STORAGE_KEY = 'minato-chabou-save';

export type LayoutPref = 'auto' | 'desktop' | 'mobile';

export interface Settings {
  showPinyin: boolean;
  layout: LayoutPref;
  speechRate: number;
  /** Sound effects (synthesised, see ui/sound.ts): master volume 0..1, mute, ambient loop. */
  volume: number;
  muted: boolean;
  ambient: boolean;
}

export interface ServedResult {
  key: string;
  customer: string;
  outcome: Outcome;
  repDelta: number;
  reaction: string;
  face: Face;
}

export interface DayState {
  day: number;
  queue: OrderInstance[];
  /** Index of the current customer in queue. */
  index: number;
  /** 'order' = waiting for the brew; 'reaction' = showing the reaction; 'closed' = day summary. */
  phase: 'order' | 'reaction' | 'closed';
  results: ServedResult[];
  /** Stage notes (Japanese chrome) unlocked at the start of this day. */
  notes: string[];
  newWords: string[];
}

export interface LangProgress {
  lang: Lang;
  day: number;
  reputation: number;
  stage: number;
  words: WordMap;
  /** Authored order log. */
  orders: Record<string, { attempts: number; perfect: boolean; seeded?: boolean }>;
  /** Customers who left unsatisfied and will come back. */
  returns: { instance: OrderInstance; day: number }[];
  today: DayState | null;
  verification: Record<string, { attempts: number; solved: boolean; seeded?: boolean }>;
  /** pageId -> last day the page's words were counted as encountered. */
  pageViews: Record<string, number>;
  stats: { served: number; perfect: number };
  /** Town activities (v2). */
  town: TownProgress;
  /** Today's activity segments (market → shop → delivery). null = not planned yet. */
  townDay: TownDayState | null;
  /** Story layer (v3): regulars' beats, documents, chapter, pending scene cards. */
  story: StoryState;
  /**
   * レベル設定 / 学習の記録 (optional; absent = defaults: ゼロから・ふつう・自動調整あり, which plan
   * exactly like saves made before it existed). See src/core/difficulty.ts.
   */
  difficulty?: DifficultyState;
}

export interface SaveFile {
  version: number;
  currentLang: Lang | null;
  settings: Settings;
  progress: Partial<Record<Lang, LangProgress>>;
}

// Fields added later get their default through normalise() (older saves need no migration).
export const DEFAULT_SETTINGS: Settings = { showPinyin: true, layout: 'auto', speechRate: 0.9, volume: 0.7, muted: false, ambient: false };

export function emptySave(): SaveFile {
  return { version: SAVE_VERSION, currentLang: null, settings: { ...DEFAULT_SETTINGS }, progress: {} };
}

export function newProgress(lang: Lang): LangProgress {
  return {
    lang,
    day: 1,
    reputation: 0,
    stage: 1,
    words: {},
    orders: {},
    returns: [],
    today: null,
    verification: {},
    pageViews: {},
    stats: { served: 0, perfect: 0 },
    town: newTownProgress(),
    townDay: null,
    story: newStoryState(),
  };
}

export function newTownProgress(): TownProgress {
  return { money: 20, unlocked: {}, lastDay: {}, marketRuns: 0, deliveryRuns: 0, marketSeen: [], slips: {} };
}

// ---------------------------------------------------------------------------
// Migration
// ---------------------------------------------------------------------------

/**
 * migrations[n] upgrades a save of version n to version n+1.
 * Version 0 = the unversioned pre-release development format (single language at the root:
 * { lang, day, rep, words, pinyin }). Add new steps here whenever SaveFile changes shape.
 */
type AnyObj = Record<string, unknown>;
const migrations: Record<number, (s: AnyObj) => AnyObj> = {
  0: (s) => {
    const lang = (s.lang as Lang) ?? 'en';
    const p = newProgress(lang);
    p.day = Number(s.day ?? 1);
    p.reputation = Number(s.rep ?? 0);
    p.words = (s.words as WordMap) ?? {};
    return {
      version: 1,
      currentLang: lang,
      settings: { ...DEFAULT_SETTINGS, showPinyin: s.pinyin !== false },
      progress: { [lang]: p },
    };
  },
  // v1 → v2: town activities. Progress gets `town` (fresh) and `townDay` (null). A day that was
  // in progress continues as a shop-only day (see ensureTownDay in activities/day.ts).
  1: (s) => {
    const progress = { ...((s.progress as AnyObj) ?? {}) };
    for (const k of Object.keys(progress)) {
      const p = progress[k] as AnyObj | undefined;
      if (p && typeof p === 'object') progress[k] = { ...p, town: newTownProgress(), townDay: null };
    }
    return { ...s, version: 2, progress };
  },
  // v2 → v3: story layer. Progress gets a fresh `story`; the story starts with the next day.
  2: (s) => {
    const progress = { ...((s.progress as AnyObj) ?? {}) };
    for (const k of Object.keys(progress)) {
      const p = progress[k] as AnyObj | undefined;
      if (p && typeof p === 'object') progress[k] = { ...p, story: newStoryState() };
    }
    return { ...s, version: 3, progress };
  },
};

export class SaveError extends Error {}

/** Parse + migrate + normalise any stored/imported JSON into the current SaveFile. */
export function migrateSave(raw: unknown): SaveFile {
  if (!raw || typeof raw !== 'object') throw new SaveError('セーブデータの形式が正しくありません');
  let s = raw as AnyObj;
  let v = typeof s.version === 'number' ? s.version : 0;
  if (v > SAVE_VERSION) throw new SaveError('新しいバージョンのセーブデータです');
  while (v < SAVE_VERSION) {
    const m = migrations[v];
    if (!m) throw new SaveError(`バージョン ${v} からの移行手順がありません`);
    s = m(s);
    v = s.version as number;
  }
  return normalise(s as unknown as SaveFile);
}

function normalise(s: SaveFile): SaveFile {
  const out: SaveFile = {
    version: SAVE_VERSION,
    currentLang: s.currentLang === 'en' || s.currentLang === 'zh' ? s.currentLang : null,
    settings: { ...DEFAULT_SETTINGS, ...(s.settings ?? {}) },
    progress: {},
  };
  for (const lang of ['en', 'zh'] as Lang[]) {
    const p = s.progress?.[lang];
    if (p) {
      const base = newProgress(lang);
      out.progress[lang] = { ...base, ...p, lang, town: { ...base.town, ...(p.town ?? {}) }, townDay: p.townDay ?? null, story: { ...base.story, ...(p.story ?? {}) } };
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Storage
// ---------------------------------------------------------------------------

export function loadSave(storage: Pick<Storage, 'getItem'> | undefined = safeStorage()): SaveFile {
  try {
    const txt = storage?.getItem(STORAGE_KEY);
    if (!txt) return emptySave();
    return migrateSave(JSON.parse(txt));
  } catch (e) {
    console.warn('save load failed', e);
    return emptySave();
  }
}

export function writeSave(save: SaveFile, storage: Pick<Storage, 'setItem'> | undefined = safeStorage()): void {
  try {
    storage?.setItem(STORAGE_KEY, JSON.stringify(save));
  } catch (e) {
    console.warn('save write failed', e);
  }
}

function safeStorage(): Storage | undefined {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : undefined;
  } catch {
    return undefined;
  }
}

export function exportSave(save: SaveFile): string {
  return JSON.stringify({ ...save, exportedAt: new Date().toISOString() }, null, 2);
}

export function importSave(json: string): SaveFile {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new SaveError('JSON として読み込めませんでした');
  }
  return migrateSave(raw);
}

export function resetLanguage(save: SaveFile, lang: Lang): SaveFile {
  const progress = { ...save.progress };
  delete progress[lang];
  return { ...save, progress };
}
