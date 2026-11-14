/**
 * Story text helpers. Story texts are tokenised against the lexicon like all other in-world
 * text, except proper names (Ada, 梅姨 …), which are shown as names and never become words.
 */
import type { GameData } from '../core/gamedata';
import { tokenIds, unknownTokens } from '../core/tokenize';
import type { Token } from '../core/types';
import type { StoryShared, StoryText } from './types';

export interface Story {
  shared: StoryShared;
  text: StoryText;
}

export function storyOf(data: GameData): Story | null {
  const shared = data.shared.story;
  const text = data.content.story;
  return shared && text ? { shared, text } : null;
}

export interface StoryToken extends Token {
  name?: boolean;
}

const nameRe = new WeakMap<string[], RegExp | null>();

function namePattern(lang: GameData['lang'], names: string[]): RegExp | null {
  if (nameRe.has(names)) return nameRe.get(names)!;
  const esc = [...names].sort((a, b) => b.length - a.length).map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  // en: whole words, with an optional possessive 's.
  const re = !esc.length ? null : lang === 'en' ? new RegExp(`\\b(?:${esc.join('|')})(?:'s)?\\b`, 'g') : new RegExp(esc.join('|'), 'g');
  nameRe.set(names, re);
  return re;
}

/** Split a text into name and non-name segments. */
export function splitNames(data: GameData, names: string[], text: string): { text: string; name: boolean }[] {
  const re = namePattern(data.lang, names);
  if (!re) return [{ text, name: false }];
  const out: { text: string; name: boolean }[] = [];
  let last = 0;
  re.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push({ text: text.slice(last, m.index), name: false });
    out.push({ text: m[0], name: true });
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push({ text: text.slice(last), name: false });
  return out;
}

export function storyTokens(data: GameData, text: string): StoryToken[] {
  const names = data.content.story?.names ?? [];
  const out: StoryToken[] = [];
  for (const seg of splitNames(data, names, text)) {
    if (seg.name) out.push({ text: seg.text, name: true });
    else out.push(...data.tokens(seg.text));
  }
  return out;
}

/** Lexicon ids of a story text (names excluded). */
export function storyWordIds(data: GameData, text: string): string[] {
  return tokenIds(storyTokens(data, text));
}

/** Words that did not map to the lexicon (names excluded). */
export function storyUnknown(data: GameData, text: string): string[] {
  return unknownTokens(storyTokens(data, text).filter((t) => !t.name), data.lang);
}

/** Share (0..1) of the word tokens of `texts` whose meaning the player has 確定. */
export function readability(data: GameData, confirmed: (id: string) => boolean, texts: string[]): number {
  let n = 0;
  let ok = 0;
  for (const t of texts)
    for (const tok of storyTokens(data, t)) {
      if (!tok.id) continue;
      n++;
      if (confirmed(tok.id)) ok++;
    }
  return n ? ok / n : 1;
}
