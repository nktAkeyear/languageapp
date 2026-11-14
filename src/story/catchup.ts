/**
 * Story catch-up for a player who started above zero (レベル設定, src/core/difficulty.ts).
 *
 * The shop jumps ahead, the story does not: every beat still plays, from the first letter on,
 * in story order — nothing is skipped or summarised, because the regulars' arcs (and the choices
 * in them) only make sense in sequence, and the early beats use words the player already knows,
 * so they read quickly. To close the gap without flooding a day:
 *
 * - up to CATCH_UP_VISITS regulars' visits a day while their beats are BEHIND stages behind the
 *   shop (still one per character per day and the usual per-character gap);
 * - chapter title cards follow the story, not the shop: the next chapter's card waits until no
 *   beat of an earlier stage is still pending (and at most one card a day).
 *
 * Without catch-up (start ゼロから, older saves) none of this applies.
 */
import type { LangProgress } from '../core/save';
import { storyCatchingUp } from '../core/difficulty';
import type { BeatDef, StoryState } from './types';

export const CATCH_UP_VISITS = 2;
export const BEHIND = 3;

/** How many visit beats may be planned today. */
export function visitsToday(p: LangProgress): number {
  return storyCatchingUp(p) ? CATCH_UP_VISITS : 1;
}

/** Is this beat far enough behind the shop to be doubled up with another visit today? */
export function beatBehind(p: LangProgress, b: BeatDef): boolean {
  return storyCatchingUp(p) && (b.when.stage ?? 1) <= p.stage - BEHIND;
}

/**
 * Lowest stage among beats still waiting to happen whose conditions already hold (ignoring the
 * per-character gap), or null when there are none. `eligible` = condition check of the engine.
 */
export function storyFrontier(beats: BeatDef[], st: StoryState, p: LangProgress, holds: (b: BeatDef) => boolean): number | null {
  let min: number | null = null;
  for (const b of beats) {
    if (st.beats[b.id]?.status === 'done') continue;
    if (b.group && st.groups.includes(b.group) && !st.beats[b.id]) continue;
    if (b.kind === 'delivery' && p.town.unlocked.delivery === undefined) continue;
    if (!holds(b)) continue;
    const s = b.when.stage ?? 1;
    if (min === null || s < min) min = s;
  }
  return min;
}

/** Chapter index to show today under catch-up (never more than one step a day). */
export function catchUpChapter(stageChapter: number, shown: number, frontierChapter: number | null): number {
  if (frontierChapter === null) return Math.min(stageChapter, shown + 1);
  return Math.min(stageChapter, shown + 1, Math.max(shown, frontierChapter));
}
