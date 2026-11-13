/**
 * Text helpers shared by the town activities: number / money phrases, placeholder filling and
 * SRS-aware choice between alternative phrasings (so hidden review keeps working here too).
 * No language-specific text: everything comes from TownContent.
 */
import { capitalizeFirst, wordMarkup, type GameData } from '../../core/gamedata';
import type { Rng } from '../../core/rng';
import type { LangProgress } from '../../core/save';
import { reviewWeight } from '../../core/srs';
import { tokenIds } from '../../core/tokenize';
import type { ColourId, PhraseForms, TownContent, TownShared } from '../../core/townTypes';

export interface Town {
  shared: TownShared;
  text: TownContent;
}

/** Town data for this language, or null when the content has no town activities. */
export function townOf(data: GameData): Town | null {
  const shared = data.shared.town;
  const text = data.content.town;
  return shared && text ? { shared, text } : null;
}

export function numberText(town: Town, n: number): string | null {
  return town.text.numberText[n] ?? null;
}

/** `{n}`-pattern with number words, using `one` for n = 1 when present. */
export function formsText(town: Town, forms: PhraseForms | undefined, n: number): string | null {
  if (!forms) return null;
  const num = numberText(town, n);
  if (!num) return null;
  const pat = n === 1 && forms.one ? forms.one : forms.other;
  return pat.replace('{n}', num);
}

export function moneyText(town: Town, n: number): string | null {
  return formsText(town, town.text.market.money, n);
}

export function colourMarkup(data: GameData, town: Town, c: ColourId): string {
  return wordMarkup(data, town.text.colourWords[c]);
}

const PH = /\{([A-Za-z][A-Za-z0-9_]*)\}/g;

/** Placeholder names used in a pattern (lowercased). Markup `{surface|id}` is not a placeholder. */
export function placeholders(text: string): string[] {
  return [...text.matchAll(PH)].map((m) => m[1].toLowerCase());
}

/**
 * Fill `{key}` / `{Key}` placeholders. Capitalised keys capitalise the value (en sentence starts).
 * Returns null when a placeholder has no value.
 */
export function fill(text: string, values: Record<string, string | null | undefined>): string | null {
  let failed = false;
  const out = text.replace(PH, (m, key: string) => {
    const v = values[key.toLowerCase()];
    if (v === undefined || v === null) {
      failed = true;
      return m;
    }
    return key[0] === key[0].toUpperCase() && key[0] !== key[0].toLowerCase() ? capitalizeFirst(v) : v;
  });
  return failed ? null : out;
}

export function textWords(data: GameData, text: string): string[] {
  return tokenIds(data.tokens(text));
}

/**
 * Choose among candidate texts the one that best serves hidden review: prefers due / weak words,
 * slightly prefers introducing a new word, avoids more than `maxNew` unseen words, adds a little
 * randomness.
 */
export function chooseText(data: GameData, p: LangProgress, cands: string[], rng: Rng, maxNew = 1): string | null {
  let best: { text: string; score: number } | null = null;
  for (const text of cands) {
    const ids = textWords(data, text);
    const fresh = ids.filter((id) => !p.words[id]).length;
    let score = ids.reduce((s, id) => s + reviewWeight(p.words[id], p.day), 0) + rng() * 2;
    if (fresh > maxNew) score -= 10 * (fresh - maxNew);
    // A phrasing that introduces a new word (within maxNew) gets a nudge; otherwise lines whose
    // only rare word is still unseen would lose to familiar ones forever and never be heard.
    else if (fresh > 0) score += 2;
    if (!best || score > best.score) best = { text, score };
  }
  return best?.text ?? null;
}

/** Fill every pattern, drop the unfillable ones, choose one for review. */
export function choosePattern(
  data: GameData,
  p: LangProgress,
  patterns: string[],
  values: Record<string, string | null | undefined>,
  rng: Rng,
): string | null {
  const filled = patterns.map((t) => fill(t, values)).filter((t): t is string => t !== null);
  return chooseText(data, p, filled, rng);
}
