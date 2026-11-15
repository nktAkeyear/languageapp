/**
 * The v2 save: one object, stored under its own key (never the old game's). The learning core (words, SRS,
 * own meanings, 単語帳, 検証ページ, difficulty, job ranks) is the existing `LangProgress`, so everything the
 * player learns is kept by the same, tested code; the day, the rooms, the stock and the deliveries are v2's own.
 */
import { newProgress, type LangProgress } from '../../core/save';
import type { Brew } from '../../core/types';
import type { WorkplaceId } from './catalog';
import type { Arrived, Delivery, Stock } from './stock';

export const V2_KEY = 'minato-v2-save';
export const V2_VERSION = 1;

export type Room = 'back' | 'front' | 'town' | 'market';
/** 0 始業前 / 1 業務中 / 2 業務後 */
export type Part = 0 | 1 | 2;
export const PART_NAMES = ['始業前', '業務中', '業務後'] as const;

export interface DayTally {
  day: number;
  workplace: WorkplaceId;
  moneyStart: number;
  /** Customers served / tasks handed in. */
  served: number;
  /** Portions used today. */
  used: Record<string, number>;
  /** Portions that arrived on the shelf today (market + crates). */
  bought: Record<string, number>;
  /** Coins spent on goods and fees today. */
  spent: number;
  fees: number;
}

export interface V2Day {
  day: number;
  part: Part;
  workplace: WorkplaceId;
  room: Room;
}

export interface V2State {
  version: number;
  /** Japanese label of the start level chosen (shown in the notebook's progress page). */
  startLabel: string;
  p: LangProgress;
  day: V2Day;
  /** The workplace the next days start at (chosen in the town after closing). */
  next: WorkplaceId;
  stock: Record<WorkplaceId, Stock>;
  pending: Delivery[];
  arrived: (Arrived & { at: number })[];
  /** The cup in progress at the tea house (its portions are reserved on the shelf until served). */
  brew: Brew;
  tally: DayTally;
  /** Yesterday's tally, for nothing but the morning (kept small). */
  seq: number;
}

export function emptyBrew(): Brew {
  return { counts: {}, temp: null, method: null };
}

export function emptyTally(day: number, workplace: WorkplaceId, money: number): DayTally {
  return { day, workplace, moneyStart: money, served: 0, used: {}, bought: {}, spent: 0, fees: 0 };
}

export function blankState(): V2State {
  const p = newProgress('en');
  return {
    version: V2_VERSION,
    startLabel: 'ゼロから',
    p,
    day: { day: 1, part: 0, workplace: 'teahouse', room: 'back' },
    next: 'teahouse',
    stock: { teahouse: {}, clinic: {} },
    pending: [],
    arrived: [],
    brew: emptyBrew(),
    tally: emptyTally(1, 'teahouse', p.town.money),
    seq: 0,
  };
}

/** Read a stored save (or null when there is none / it cannot be read). Tolerant of missing fields. */
export function parseState(txt: string | null): V2State | null {
  if (!txt) return null;
  try {
    const raw = JSON.parse(txt) as Partial<V2State>;
    if (!raw || typeof raw !== 'object' || !raw.p || !raw.day) return null;
    if ((raw.version ?? 0) > V2_VERSION) return null;
    const base = blankState();
    const s: V2State = {
      ...base,
      ...raw,
      version: V2_VERSION,
      stock: { teahouse: { ...(raw.stock?.teahouse ?? {}) }, clinic: { ...(raw.stock?.clinic ?? {}) } },
      pending: Array.isArray(raw.pending) ? raw.pending : [],
      arrived: Array.isArray(raw.arrived) ? raw.arrived : [],
      brew: raw.brew ?? emptyBrew(),
      tally: raw.tally ?? base.tally,
    } as V2State;
    const p = s.p;
    p.words ??= {};
    for (const w of Object.values(p.words)) {
      if (typeof w.memo !== 'string') w.memo = '';
      if (!Array.isArray(w.contexts)) w.contexts = [];
    }
    return s;
  } catch {
    return null;
  }
}

function storage(): Storage | undefined {
  try {
    return typeof localStorage !== 'undefined' ? localStorage : undefined;
  } catch {
    return undefined;
  }
}

export function loadState(): V2State | null {
  try {
    return parseState(storage()?.getItem(V2_KEY) ?? null);
  } catch {
    return null;
  }
}

export function saveState(s: V2State): void {
  try {
    storage()?.setItem(V2_KEY, JSON.stringify(s));
  } catch (e) {
    console.warn('v2 save failed', e);
  }
}

export function clearState(): void {
  try {
    storage()?.removeItem(V2_KEY);
  } catch {
    /* ignore */
  }
}
