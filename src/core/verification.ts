import { difficultyOnVerify } from './difficulty';
import type { GameData } from './gamedata';
import type { LangProgress } from './save';
import type { LexEntry, VerificationPage } from './types';
import { playSeen } from './srs';

export const DEFAULT_MIN_ENCOUNTERS = 3;

export function pageWords(data: GameData, pageId: string): LexEntry[] {
  return data.content.lexicon.filter((e) => e.group === pageId);
}

export type PageStatus = 'locked' | 'available' | 'solved';

export function pageStatus(data: GameData, p: LangProgress, page: VerificationPage): PageStatus {
  if (p.verification[page.id]?.solved) return 'solved';
  const min = page.minEncounters ?? DEFAULT_MIN_ENCOUNTERS;
  const words = pageWords(data, page.id);
  if (!words.length) return 'locked';
  // Encounters in play: a start level's 既習扱い words open their page only once actually met.
  return words.every((w) => playSeen(p.words[w.id]) >= min) ? 'available' : 'locked';
}

/** Fraction of the page's words encountered enough (for a progress hint). */
export function pageReadiness(data: GameData, p: LangProgress, page: VerificationPage): number {
  const min = page.minEncounters ?? DEFAULT_MIN_ENCOUNTERS;
  const words = pageWords(data, page.id);
  if (!words.length) return 0;
  return words.filter((w) => playSeen(p.words[w.id]) >= min).length / words.length;
}

/**
 * Check an assignment cardId -> wordId. Cards are identified by the id of the word whose gloss
 * they show, so a card is correct when it is assigned to that same word.
 * On success all words of the page become 確定. The result never says which card was wrong.
 */
export function submitVerification(
  data: GameData,
  p: LangProgress,
  pageId: string,
  assignment: Record<string, string | undefined>,
): boolean {
  const words = pageWords(data, pageId);
  const rec = (p.verification[pageId] ??= { attempts: 0, solved: false });
  rec.attempts++;
  const ok = words.length > 0 && words.every((w) => assignment[w.id] === w.id);
  difficultyOnVerify(p, ok); // metrics: attempts per sealed page
  if (ok) {
    rec.solved = true;
    for (const w of words) {
      const st = p.words[w.id];
      if (st) st.confirmed = true;
    }
  }
  return ok;
}
