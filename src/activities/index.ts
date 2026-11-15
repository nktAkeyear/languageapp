/**
 * Activity registry. Every activity shares the core (lexicon, word tracking, notebook,
 * reputation, save). Each has its own engine module under src/activities/<id>/ and panels in
 * the UI layouts; src/activities/day.ts fits them into the day's three parts (始業前: the market; 業務中: the shop;
 * 業務後: the house delivery and the evening market).
 */
import type { ActivityKind } from '../core/townTypes';

export type ActivityId = ActivityKind;

export interface ActivityDef {
  id: ActivityId;
  nameJa: string;
  icon: string;
  /** Japanese label: the part(s) of the day it belongs to. */
  whenJa: string;
}

export const ACTIVITIES: ActivityDef[] = [
  { id: 'market', nameJa: '市場', icon: '🧺', whenJa: '始業前・業務後' },
  { id: 'shop', nameJa: '茶房', icon: '🫖', whenJa: '業務中' },
  { id: 'delivery', nameJa: '配達', icon: '📦', whenJa: '業務後' },
];

export function activityDef(id: ActivityId): ActivityDef {
  return ACTIVITIES.find((a) => a.id === id)!;
}
