import type { Face, Lang, OrderInstance, Outcome } from './types';
import type { WordMap } from './srs';
import type { TownDayState, TownProgress } from './townTypes';
import { newStoryState, type StoryState } from '../story/types';
import type { RenoState } from '../renovation/types';
import type { DifficultyState } from './difficulty';
import type { JobsState } from '../jobs/types';
import { newWordbook, type WordbookState } from './wordbook';

export const SAVE_VERSION = 6;
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
  /**
   * The player's own guess for a word in in-world sentences: 'under' = small text under the word,
   * 'hover' = only on hover / in the word card, 'off' = never in sentences (notebook lists always).
   */
  guessDisplay: GuessDisplay;
  /** The reading voice chosen per language (a voiceURI of the browser's speech synthesis); absent = automatic. */
  voices?: Partial<Record<'en' | 'zh', string>>;
}

export type GuessDisplay = 'under' | 'hover' | 'off';

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
  /** Shop renovation (optional, no version bump: absent = nothing bought yet; see renovation/engine.ts renoOf). */
  reno?: RenoState;
  /**
   * レベル設定 / 学習の記録 (optional; absent = defaults: ゼロから・ふつう・自動調整あり, which plan
   * exactly like saves made before it existed). See src/core/difficulty.ts.
   */
  difficulty?: DifficultyState;
  /**
   * Jobs (v4): the job board, each job's rank and log, goods made for other jobs, today's parts of
   * the day. Absent until the first day planned with jobs (see src/jobs/engine.ts jobsState).
   */
  jobs?: JobsState;
  /** 単語帳 (v5): starred and hand-written words, the player's own self-review (src/core/wordbook.ts). */
  wordbook?: WordbookState;
}

export interface SaveFile {
  version: number;
  currentLang: Lang | null;
  settings: Settings;
  progress: Partial<Record<Lang, LangProgress>>;
}

// Fields added later get their default through normalise() (older saves need no migration).
export const DEFAULT_SETTINGS: Settings = { showPinyin: true, layout: 'auto', speechRate: 0.9, volume: 0.7, muted: false, ambient: false, guessDisplay: 'under' };

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
    wordbook: newWordbook(),
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
  // v3 → v4: jobs. The tea house becomes the first job and keeps all its progress: its served /
  // perfect cups become the job's task log (its rank is worked out at load, see jobsOnLoad), and the
  // job board opens the next morning for saves already past its day. Nothing else changes.
  3: (s) => {
    const progress = { ...((s.progress as AnyObj) ?? {}) };
    for (const k of Object.keys(progress)) {
      const p = progress[k] as AnyObj | undefined;
      if (!p || typeof p !== 'object') continue;
      const stats = (p.stats as { served?: number; perfect?: number }) ?? {};
      const day = Number(p.day ?? 1);
      progress[k] = {
        ...p,
        jobs: {
          jobs: {
            teahouse: { since: 1, rank: 1, tasks: stats.served ?? 0, good: stats.perfect ?? 0, perfect: stats.perfect ?? 0, shifts: Math.max(0, day - 1), authored: {}, rankDays: { 1: 1 } },
          },
          goods: {},
          wordJobs: {},
          day: null,
          timed: false,
          seen: [],
          migrated: true,
        },
      };
    }
    return { ...s, version: 4, progress };
  },
  // v4 → v5: the player's own meanings and the 単語帳; the start level no longer confirms words.
  // - Words confirmed only by the start level (既習扱い) become "assumed known" (未確認・知っているはず):
  //   `confirmed` false, `seeded` kept. 検証ページ the start level had sealed are opened again. Words
  //   whose page the player sealed in play stay confirmed (repairAssumed, run with the game data at
  //   load, re-confirms seeded words of pages solved in play).
  // - The old single memo (「自分のメモ（推測）」) becomes the player's guess; the memo starts empty.
  // - An empty 単語帳.
  4: (s) => {
    const progress = { ...((s.progress as AnyObj) ?? {}) };
    for (const k of Object.keys(progress)) {
      const p = progress[k] as AnyObj | undefined;
      if (!p || typeof p !== 'object') continue;
      const words: AnyObj = {};
      for (const [id, w0] of Object.entries((p.words as AnyObj) ?? {})) {
        if (!w0 || typeof w0 !== 'object') continue;
        const w = { ...(w0 as AnyObj) };
        if (w.seeded && w.confirmed) w.confirmed = false;
        const memo = typeof w.memo === 'string' ? w.memo.trim() : '';
        if (memo && !w.guess) {
          w.guess = memo.slice(0, 200);
          w.memo = '';
        }
        words[id] = w;
      }
      const verification: AnyObj = {};
      for (const [id, v] of Object.entries((p.verification as AnyObj) ?? {})) {
        if (v && typeof v === 'object' && (v as AnyObj).seeded) continue;
        verification[id] = v;
      }
      progress[k] = { ...p, words, verification, wordbook: newWordbook() };
    }
    return { ...s, version: 5, progress };
  },
  // v5 → v6: the day in three parts (始業前 / 業務中 / 業務後) instead of 朝 / 昼 / 夕方, starting at the workplace.
  // - A tea house day in progress gets its part and place from where it was: at the market → before opening
  //   (still at the market); in the shop before the first cup → before opening; serving → working hours; closed
  //   (or out delivering) → after closing.
  // - The jobs' day gets today's workplace: the shift under way (its part from the shift's phase), the tea house,
  //   or — in the town after some work — after closing; a morning in the town with nothing done yet starts again
  //   at the tea house, before opening.
  // - Story cards that came with the morning (a chapter title, a delivery note, papers) wait in the scene.
  5: (s) => {
    const progress = { ...((s.progress as AnyObj) ?? {}) };
    for (const k of Object.keys(progress)) {
      const p0 = progress[k] as AnyObj | undefined;
      if (!p0 || typeof p0 !== 'object') continue;
      const p = { ...p0 };
      const today = p.today as AnyObj | null | undefined;
      const td0 = p.townDay as AnyObj | null | undefined;
      let teaPart = 0;
      if (td0 && typeof td0 === 'object') {
        const td = { ...td0 };
        const segs = Array.isArray(td.segments) ? (td.segments as string[]) : ['shop'];
        const seg = segs[typeof td.seg === 'number' ? td.seg : 0] ?? 'shop';
        const phase = today?.phase;
        const served = !!today && ((today.index as number) > 0 || phase === 'reaction');
        if (seg === 'market') {
          teaPart = 0;
          // At the market only when the trip was under way (a stall open, something bought); else the day starts
          // in the shop, before opening.
          const md = td.market as AnyObj | undefined;
          const begun = !!md && !md.done && (!!md.stall || (Array.isArray(md.basket) && md.basket.length > 0) || (Array.isArray(md.visited) && md.visited.length > 0));
          td.at = begun ? 'market' : 'shop';
        } else if (seg === 'delivery') {
          teaPart = 2;
          td.at = (td.delivery as AnyObj | undefined)?.phase === 'result' ? 'shop' : 'delivery';
        } else {
          teaPart = phase === 'closed' ? 2 : served ? 1 : 0;
          td.at = 'shop';
        }
        td.part = teaPart;
        progress[k] = p;
        p.townDay = td;
      }
      const jobs = p.jobs as AnyObj | undefined;
      const d0 = jobs?.day as AnyObj | null | undefined;
      if (jobs && d0 && typeof d0 === 'object' && !d0.work) {
        const d = { ...d0 };
        const shift = d.shift as AnyObj | null | undefined;
        const log = Array.isArray(d.log) ? (d.log as AnyObj[]) : [];
        if (shift) {
          d.work = shift.job;
          d.shift = { ...shift, part: 1 };
          d.part = shift.phase === 'intro' ? 0 : shift.phase === 'done' ? 2 : 1;
          d.view = 'job';
        } else if (d.view === 'teahouse') {
          d.work = 'teahouse';
          d.part = teaPart;
        } else if ((typeof d.part === 'number' && d.part > 0) || log.length) {
          d.work = (log[0]?.job as string | undefined) ?? 'teahouse';
          d.part = typeof d.part === 'number' && d.part > 2 ? 3 : 2;
          d.view = 'hub';
        } else {
          d.work = 'teahouse';
          d.part = 0;
          d.view = 'teahouse';
          d.tea = 'active';
        }
        p.jobs = { ...jobs, day: d };
      }
      const story = p.story as AnyObj | undefined;
      if (story && Array.isArray(story.cards)) {
        // Before opening, every card waiting is the morning's (a chapter, a visit, a note, papers).
        const morning = teaPart === 0;
        const cards = (story.cards as AnyObj[]).map((c) => (c && c.kind !== 'ledger' && (morning || c.kind === 'chapter' || c.kind === 'doc' || (c.kind === 'scene' && c.request)) ? { ...c, deferred: true } : c));
        // The cards that play by themselves come first (story/engine.ts pushCard keeps that order).
        p.story = { ...story, cards: [...cards.filter((c) => !c?.deferred), ...cards.filter((c) => c?.deferred)] };
      }
      progress[k] = p;
    }
    return { ...s, version: 6, progress };
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
      const wb = p.wordbook && Array.isArray(p.wordbook.entries) ? { seq: Number(p.wordbook.seq) || p.wordbook.entries.length, entries: p.wordbook.entries.filter((e) => e && typeof e.key === 'string') } : newWordbook();
      const words = p.words && typeof p.words === 'object' ? p.words : {};
      for (const w of Object.values(words)) {
        if (!w || typeof w !== 'object') continue;
        if (typeof w.memo !== 'string') w.memo = '';
        if (!Array.isArray(w.contexts)) w.contexts = [];
      }
      out.progress[lang] = { ...base, ...p, lang, words, town: { ...base.town, ...(p.town ?? {}) }, townDay: p.townDay ?? null, story: { ...base.story, ...(p.story ?? {}) }, wordbook: wb };
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
