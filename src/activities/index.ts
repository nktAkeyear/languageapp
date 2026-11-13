/**
 * Activity registry. Every activity shares the core (lexicon, word tracking, notebook,
 * reputation, save). Phase 1 ships only the shop; later phases add market purchasing,
 * deliveries, letters/newspapers… as further entries, each with its own engine module
 * under src/activities/<id>/ and panels in the UI layouts.
 */
export type ActivityId = 'shop';

export interface ActivityDef {
  id: ActivityId;
  nameJa: string;
  icon: string;
  /** Stage from which the activity appears in town. */
  minStage: number;
}

export const ACTIVITIES: ActivityDef[] = [{ id: 'shop', nameJa: '茶房', icon: '🫖', minStage: 1 }];

export function availableActivities(stage: number): ActivityDef[] {
  return ACTIVITIES.filter((a) => a.minStage <= stage);
}
