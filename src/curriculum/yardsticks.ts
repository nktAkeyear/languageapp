/**
 * The two yardsticks English progress is measured against: 英検 grades (5級 … 1級, the school
 * curriculum order) and TOEIC bands (〜400 … 〜990, working-life English). Both come from the
 * compiled lists in data/english/ (see lists.ts); this module only names and orders them.
 */
import { EIKEN_GRADES, type EikenGrade } from '../core/types';

export type Yardstick = 'eiken' | 'toeic';
export const YARDSTICKS: Yardstick[] = ['eiken', 'toeic'];

/** Grade keys as they appear in the compiled lists. */
export type EikenKey = '5' | '4' | '3' | 'pre2' | '2' | 'pre1' | '1';
export const EIKEN_KEYS: EikenKey[] = ['5', '4', '3', 'pre2', '2', 'pre1', '1'];

export const TOEIC_BANDS = [400, 500, 600, 730, 860, 990] as const;
export type ToeicBand = (typeof TOEIC_BANDS)[number];

export function eikenFromKey(k: string | null | undefined): EikenGrade | null {
  if (k === null || k === undefined) return null;
  const i = EIKEN_KEYS.indexOf(String(k) as EikenKey);
  if (i >= 0) return EIKEN_GRADES[i];
  // Already a game grade ('準2' …)?
  return EIKEN_GRADES.includes(k as EikenGrade) ? (k as EikenGrade) : null;
}

export function eikenKeyOf(g: EikenGrade | null | undefined): EikenKey | null {
  if (!g) return null;
  const i = EIKEN_GRADES.indexOf(g);
  return i >= 0 ? EIKEN_KEYS[i] : null;
}

/** 0-based order of a grade (5級 = 0); -1 = untagged. */
export function eikenIndex(g: EikenGrade | null | undefined): number {
  return g ? EIKEN_GRADES.indexOf(g) : -1;
}

export function toeicBand(n: number | null | undefined): ToeicBand | null {
  if (n === null || n === undefined || !Number.isFinite(n)) return null;
  for (const b of TOEIC_BANDS) if (n <= b) return b;
  return 990;
}

/** 0-based order of a TOEIC band (〜400 = 0); -1 = untagged. */
export function toeicIndex(n: number | null | undefined): number {
  const b = toeicBand(n);
  return b === null ? -1 : TOEIC_BANDS.indexOf(b);
}

export function eikenLabel(g: EikenGrade | EikenKey | null | undefined): string {
  const x = eikenFromKey(g as string);
  return x ? `英検${x}級` : '—';
}

export function toeicLabel(n: number | null | undefined): string {
  const b = toeicBand(n);
  return b === null ? '—' : `TOEIC〜${b}`;
}

export function yardstickLabel(y: Yardstick): string {
  return y === 'eiken' ? '英検' : 'TOEIC';
}

/** Ordered step keys of a yardstick (for bars): 英検 grade keys or TOEIC band numbers as strings. */
export function yardstickSteps(y: Yardstick): string[] {
  return y === 'eiken' ? [...EIKEN_GRADES] : TOEIC_BANDS.map(String);
}

export function stepLabel(y: Yardstick, key: string): string {
  return y === 'eiken' ? `${key}級` : `〜${key}`;
}
