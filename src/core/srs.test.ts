import { describe, expect, it } from 'vitest';
import { isDue, isMastered, isWeak, recordEncounter, recordLapse, recordSuccess, reviewWeight, type WordMap } from './srs';

describe('word tracking', () => {
  it('records encounters with contexts (deduped, newest first, capped)', () => {
    const w: WordMap = {};
    recordEncounter(w, ['lemon', 'lemon', 'two'], 1, 'Two lemon slices.');
    expect(w.lemon.seen).toBe(1);
    recordEncounter(w, ['lemon'], 2, 'Lemon.');
    recordEncounter(w, ['lemon'], 2, 'Lemon.');
    expect(w.lemon.seen).toBe(3);
    expect(w.lemon.contexts).toEqual(['Lemon.', 'Two lemon slices.']);
    for (let i = 0; i < 10; i++) recordEncounter(w, ['lemon'], 3, `s${i}`);
    expect(w.lemon.contexts.length).toBe(6);
    expect(w.lemon.lastDay).toBe(3);
  });

  it('success grows the interval, lapse resets it', () => {
    const w: WordMap = {};
    recordEncounter(w, ['mint'], 1);
    recordSuccess(w, 'mint', 1);
    expect(w.mint).toMatchObject({ interval: 1, due: 2, correct: 1 });
    recordSuccess(w, 'mint', 2);
    expect(w.mint).toMatchObject({ interval: 3, due: 5 });
    recordSuccess(w, 'mint', 5);
    expect(w.mint.interval).toBeGreaterThanOrEqual(7);
    expect(isDue(w.mint, 6)).toBe(false);
    recordLapse(w, 'mint', 6);
    expect(w.mint).toMatchObject({ interval: 1, due: 7, wrong: 1 });
    expect(w.mint.ease).toBeLessThan(2.4);
    expect(isDue(w.mint, 7)).toBe(true);
  });

  it('weak words and review weight', () => {
    const w: WordMap = {};
    recordEncounter(w, ['a', 'b'], 1);
    recordLapse(w, 'a', 1);
    recordLapse(w, 'a', 1);
    recordSuccess(w, 'b', 1);
    expect(isWeak(w.a)).toBe(true);
    expect(isWeak(w.b)).toBe(false);
    expect(reviewWeight(w.a, 2)).toBeGreaterThan(reviewWeight(w.b, 2));
    expect(reviewWeight(undefined, 2)).toBe(0);
  });

  it('mastery requires confirmation', () => {
    const w: WordMap = {};
    recordEncounter(w, ['x'], 1);
    recordSuccess(w, 'x', 1);
    recordSuccess(w, 'x', 2);
    expect(isMastered(w.x)).toBe(false);
    w.x.confirmed = true;
    expect(isMastered(w.x)).toBe(true);
  });
});
