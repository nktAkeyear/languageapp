import { indexIngredients, type IngredientIndex } from '../activities/shop/rules';
import { buildLexIndex, stripMarkup, tokenize, type LexIndex } from './tokenize';
import type {
  Feature,
  IngredientId,
  IngredientText,
  LanguageContent,
  LexEntry,
  RecipeDef,
  SharedContent,
  StageDef,
  Token,
} from './types';

/** Content + derived indexes for one language. Built once per language. */
export interface GameData {
  lang: LanguageContent['lang'];
  content: LanguageContent;
  shared: SharedContent;
  lex: LexIndex;
  ing: IngredientIndex;
  ingText: Map<IngredientId, IngredientText>;
  recipes: Map<string, RecipeDef>;
  stages: StageDef[];
  tokens: (text: string) => Token[];
}

export function buildGameData(content: LanguageContent, shared: SharedContent): GameData {
  const lex = buildLexIndex(content.lang, content.lexicon);
  const cache = new Map<string, Token[]>();
  return {
    lang: content.lang,
    content,
    shared,
    lex,
    ing: indexIngredients(shared.ingredients),
    ingText: new Map(content.ingredients.map((i) => [i.ingredient, i])),
    recipes: new Map(shared.recipes.map((r) => [r.id, r])),
    stages: [...shared.stages, ...(content.stages ?? [])].sort((a, b) => a.stage - b.stage),
    tokens: (text: string) => {
      let t = cache.get(text);
      if (!t) {
        t = tokenize(text, lex);
        cache.set(text, t);
      }
      return t;
    },
  };
}

export function lexEntry(data: GameData, id: string): LexEntry | undefined {
  return data.lex.byId.get(id);
}

/** Display text of a lexicon id. */
export function wordText(data: GameData, id: string): string {
  return data.lex.byId.get(id)?.text ?? id;
}

/** `{surface|id}` markup for a lexicon word, so substituted words always map correctly. */
export function wordMarkup(data: GameData, id: string, surface?: string): string {
  return `{${surface ?? wordText(data, id)}|${id}}`;
}

export function ingredientWordId(data: GameData, ing: IngredientId): string | undefined {
  return data.ingText.get(ing)?.word;
}

export function ingredientsAtStage(data: GameData, stage: number): IngredientId[] {
  const out: IngredientId[] = [];
  for (const s of data.stages) if (s.stage <= stage) out.push(...s.ingredients);
  return out;
}

export function featuresAtStage(data: GameData, stage: number): Set<Feature> {
  const f = new Set<Feature>();
  for (const s of data.stages) if (s.stage <= stage) for (const x of s.features ?? []) f.add(x);
  return f;
}

export function stageDef(data: GameData, stage: number): StageDef {
  return data.stages.find((s) => s.stage === stage) ?? data.stages[data.stages.length - 1];
}

/**
 * Quantity phrase, with number + ingredient wrapped in markup so tokens are exact.
 * Returns null if the language has no qty pattern for this ingredient or no number word for n.
 */
export function qtyPhrase(data: GameData, ing: IngredientId, n: number): string | null {
  const t = data.ingText.get(ing);
  const numId = data.content.numbers[n];
  if (!t?.qty || !numId) return null;
  const pattern = n === 1 && t.qty.one ? t.qty.one : t.qty.other;
  return pattern.replace('{n}', wordMarkup(data, numId));
}

export function capitalizeFirst(s: string): string {
  // Capitalise the first letter, also inside leading `{surface|id}` markup.
  const m = /^(\{?)([a-z])/.exec(s);
  if (!m) return s;
  return m[1] + m[2].toUpperCase() + s.slice(m[0].length);
}

export function plain(text: string): string {
  return stripMarkup(text);
}
