import type { GameData } from './gamedata';
import type { LangProgress } from './save';
import { isMastered } from './srs';
import { CEFR_LEVELS, EIKEN_GRADES, type Cefr, type Lang, type LexEntry } from './types';

/** CEFR ↔ Japanese-familiar qualification mapping (rough guide). */
export const CEFR_MAPPING: Record<Cefr, Record<Lang, string>> = {
  A1: { en: '英検5〜4級', zh: 'HSK1〜2・中検準4級' },
  A2: { en: '英検3級・TOEIC〜400', zh: 'HSK3・中検4級' },
  B1: { en: '英検準2〜2級・TOEIC〜600', zh: 'HSK4・中検3級' },
  B2: { en: '英検準1級・TOEIC〜800', zh: 'HSK5・中検2級' },
  C1: { en: '英検1級・TOEIC900〜', zh: 'HSK6・中検準1級' },
};

export interface LevelBar {
  key: string;
  label: string;
  mastered: number;
  target: number;
  ratio: number;
}

export interface LevelReport {
  examBars: LevelBar[];
  cefrBars: LevelBar[];
  masteredTotal: number;
  encounteredTotal: number;
  /** Japanese one-line statement, e.g. "HSK1 相当まであと少し". */
  statement: string;
  cefrStatement: string;
}

export const REACHED = 0.8;
export const ALMOST = 0.6;

function examKeys(lang: Lang): string[] {
  return lang === 'en' ? [...EIKEN_GRADES] : ['1', '2', '3', '4', '5', '6'];
}

export function examLabel(lang: Lang, key: string): string {
  return lang === 'en' ? `英検${key}級` : `HSK${key}`;
}

function examIndex(lang: Lang, e: LexEntry): number {
  if (lang === 'en') return e.eiken ? EIKEN_GRADES.indexOf(e.eiken) : -1;
  return e.hsk ? e.hsk - 1 : -1;
}

function statementFor(bars: LevelBar[], prefix = ''): string {
  let reached = -1;
  for (let i = 0; i < bars.length; i++) if (bars[i].ratio >= REACHED) reached = i;
  const next = bars[reached + 1];
  const reachedTxt = reached >= 0 ? `${prefix}${bars[reached].label} 相当` : '';
  if (!next) return reachedTxt || '—';
  const pct = Math.round(next.ratio * 100);
  const nextTxt =
    next.ratio >= ALMOST ? `${prefix}${next.label} 相当まであと少し` : `${prefix}${next.label} 相当に向けて ${pct}%`;
  return reachedTxt ? `${reachedTxt}／${nextTxt}` : nextTxt;
}

/** Coverage of mastered words per level (cumulative), against per-level targets from content. */
export function levelReport(data: GameData, p: LangProgress): LevelReport {
  const lang = data.lang;
  const mastered = data.content.lexicon.filter((e) => isMastered(p.words[e.id]));
  const keys = examKeys(lang);
  const examBars: LevelBar[] = keys.map((key, i) => {
    const n = mastered.filter((e) => {
      const x = examIndex(lang, e);
      return x >= 0 && x <= i;
    }).length;
    const target = data.content.levelTargets.exam[key] ?? 1;
    return { key, label: examLabel(lang, key), mastered: n, target, ratio: Math.min(1, n / target) };
  });
  const cefrBars: LevelBar[] = CEFR_LEVELS.map((c, i) => {
    const n = mastered.filter((e) => CEFR_LEVELS.indexOf(e.cefr) <= i).length;
    const target = data.content.levelTargets.cefr[c];
    return { key: c, label: c, mastered: n, target, ratio: Math.min(1, n / target) };
  });
  return {
    examBars,
    cefrBars,
    masteredTotal: mastered.length,
    encounteredTotal: Object.values(p.words).filter((w) => w.seen > 0).length,
    statement: statementFor(examBars),
    cefrStatement: statementFor(cefrBars, 'CEFR '),
  };
}
