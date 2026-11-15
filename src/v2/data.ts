/** The English game data (content + indexes), built once. The compiled lists are applied when they are loaded. */
import { CONTENT, SHARED } from '../content';
import { buildGameData, type GameData } from '../core/gamedata';
import { withLists } from '../curriculum/apply';

let cache: GameData | null = null;

export function gameData(): GameData {
  if (!cache) cache = buildGameData(withLists(CONTENT.en), SHARED);
  return cache;
}

/** Ingredient id → lexicon id of its label word. */
export function ingredientWords(data: GameData): Record<string, string> {
  const out: Record<string, string> = {};
  for (const t of data.content.ingredients) out[t.ingredient] = t.word;
  return out;
}
