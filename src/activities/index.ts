/**
 * Activity registry. Every activity shares the core (lexicon, word tracking, notebook,
 * reputation, save). Each has its own engine module under src/activities/<id>/ and panels in
 * the UI layouts; src/activities/day.ts sequences them into a day (market → shop → delivery).
 */
import type { ActivityKind } from '../core/townTypes';

export type ActivityId = ActivityKind;

export interface ActivityDef {
  id: ActivityId;
  nameJa: string;
  icon: string;
  /** Japanese time-of-day label for the day strip. */
  whenJa: string;
}

export const ACTIVITIES: ActivityDef[] = [
  { id: 'market', nameJa: '市場', icon: '🧺', whenJa: '朝' },
  { id: 'shop', nameJa: '茶房', icon: '🫖', whenJa: '昼' },
  { id: 'delivery', nameJa: '配達', icon: '📦', whenJa: '夕方' },
];

export function activityDef(id: ActivityId): ActivityDef {
  return ACTIVITIES.find((a) => a.id === id)!;
}
