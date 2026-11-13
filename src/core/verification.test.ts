import { describe, expect, it } from 'vitest';
import { CONTENT, SHARED } from '../content';
import { buildGameData } from './gamedata';
import { newProgress } from './save';
import { recordEncounter } from './srs';
import { pageStatus, pageWords, submitVerification } from './verification';

const data = buildGameData(CONTENT.en, SHARED);
const page = CONTENT.en.verificationPages.find((p) => p.id === 'g_shelf1')!;
const MIN = page.minEncounters ?? 3;

describe('verification pages', () => {
  it('becomes available once all words were encountered often enough', () => {
    const p = newProgress('en');
    const ids = pageWords(data, page.id).map((w) => w.id);
    expect(ids).toEqual(['lemon', 'ginger', 'mint', 'honey']);
    expect(pageStatus(data, p, page)).toBe('locked');
    for (let i = 0; i < MIN; i++) recordEncounter(p.words, ids.slice(0, 3), 1);
    expect(pageStatus(data, p, page)).toBe('locked');
    for (let i = 0; i < MIN - 1; i++) recordEncounter(p.words, ['honey'], 1);
    expect(pageStatus(data, p, page)).toBe('locked');
    recordEncounter(p.words, ['honey'], 1);
    expect(pageStatus(data, p, page)).toBe('available');
  });

  it('a wrong page confirms nothing; a right page confirms all words', () => {
    const p = newProgress('en');
    const ids = pageWords(data, page.id).map((w) => w.id);
    for (let i = 0; i < MIN; i++) recordEncounter(p.words, ids, 1);
    const wrong = { lemon: 'ginger', ginger: 'lemon', mint: 'mint', honey: 'honey' };
    expect(submitVerification(data, p, page.id, wrong)).toBe(false);
    expect(ids.some((id) => p.words[id].confirmed)).toBe(false);
    expect(p.verification[page.id]).toEqual({ attempts: 1, solved: false });
    const partial = { lemon: 'lemon', ginger: 'ginger', mint: 'mint' };
    expect(submitVerification(data, p, page.id, partial)).toBe(false);
    const right = Object.fromEntries(ids.map((id) => [id, id]));
    expect(submitVerification(data, p, page.id, right)).toBe(true);
    expect(ids.every((id) => p.words[id].confirmed)).toBe(true);
    expect(pageStatus(data, p, page)).toBe('solved');
  });
});
