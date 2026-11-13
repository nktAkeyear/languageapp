import { describe, expect, it } from 'vitest';
import { CONTENT } from '../content';
import { buildLexIndex, stripMarkup, tokenize, unknownTokens } from './tokenize';

const en = buildLexIndex('en', CONTENT.en.lexicon);
const zh = buildLexIndex('zh', CONTENT.zh.lexicon);

describe('tokenize', () => {
  it('en: case-insensitive, inflected forms, multi-word entries', () => {
    const t = tokenize('Two spoons of green tea, please.', en);
    expect(t.filter((x) => x.id).map((x) => x.id)).toEqual(['two', 'spoon', 'of', 'green_tea', 'please']);
    expect(t.map((x) => x.text).join('')).toBe('Two spoons of green tea, please.');
  });

  it('en: apostrophes and markup override', () => {
    const t = tokenize("I can't sleep. I have a {cold|cold_illness}.", en);
    expect(t.filter((x) => x.id).map((x) => x.id)).toEqual(['i', 'cant', 'sleep', 'i', 'have', 'a', 'cold_illness']);
    expect(stripMarkup('a {cold|cold_illness}.')).toBe('a cold.');
  });

  it('zh: longest match', () => {
    const t = tokenize('我说了不要糖！很好喝。', zh);
    expect(t.filter((x) => x.id).map((x) => x.text)).toEqual(['我', '说', '了', '不要', '糖', '很', '好喝']);
  });

  it('reports unknown words', () => {
    expect(unknownTokens(tokenize('Two bananas.', en), 'en')).toEqual(['bananas']);
    expect(unknownTokens(tokenize('两只苹果。', zh), 'zh')).toEqual(['只', '苹', '果']);
    expect(unknownTokens(tokenize('{x|nope}', en), 'en')).toEqual(['{x|nope}']);
  });
});
