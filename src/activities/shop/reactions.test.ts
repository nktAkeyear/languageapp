import { describe, expect, it } from 'vitest';
import { CONTENT, SHARED } from '../../content';
import { buildGameData } from '../../core/gamedata';
import { makeRng } from '../../core/rng';
import type { Evaluation, OrderInstance } from '../../core/types';
import { selectReaction } from './reactions';

const en = buildGameData(CONTENT.en, SHARED);
const zh = buildGameData(CONTENT.zh, SHARED);
const order = (o: Partial<OrderInstance> = {}): OrderInstance => ({
  key: 'k', source: { type: 'authored', id: 'k' }, text: 'Lemon.', rule: {}, audioOnly: false, customer: 'c_sailor', ...o,
});
const ev = (issues: Evaluation['issues'], outcome: Evaluation['outcome'] = 'fail'): Evaluation => ({ issues, primary: issues[0] ?? null, outcome });

describe('selectReaction', () => {
  it('perfect at stage 1 uses only stage-1 lines', () => {
    for (let s = 0; s < 20; s++) {
      const r = selectReaction(en, ev([], 'perfect'), order(), 1, makeRng(s));
      expect(['r_thanks', 'r_good']).toContain(r.reactionId);
    }
  });

  it('fills the ingredient placeholder with the target-language word', () => {
    const r = selectReaction(en, ev([{ kind: 'wrong', ing: 'lemon' }]), order(), 1, makeRng(1));
    expect(r.text).toBe('No! {Lemon|lemon}!');
    const z = selectReaction(zh, ev([{ kind: 'missing', ing: 'honey' }]), order(), 1, makeRng(1));
    expect(z.text).toBe('{蜂蜜|honey}呢？');
  });

  it('chooses by what was wrong', () => {
    const much = selectReaction(en, ev([{ kind: 'too_much', ing: 'honey', diff: 1 }], 'minor'), order(), 3, makeRng(2));
    expect(much.text).toBe('Too much {honey|honey}!');
    const temp = selectReaction(en, ev([{ kind: 'wrong_temp', temp: 'cold' }]), order(), 3, makeRng(2));
    expect(temp.text).toBe('{Cold|cold}, please!');
  });

  it('falls back to the next issue, then any_fail, when a kind has no line yet', () => {
    // wrong_method lines only exist from stage 9.
    const r = selectReaction(en, ev([{ kind: 'wrong_method', method: 'boil' }], 'minor'), order(), 2, makeRng(3));
    expect(r.kind).toBe('any_fail');
    const r2 = selectReaction(en, ev([{ kind: 'wrong_method', method: 'boil' }, { kind: 'too_much', ing: 'mint' }]), order(), 2, makeRng(3));
    expect(r2.kind).toBe('too_much');
  });

  it('prefers specific reactions (salt -> 汤, symptom relief)', () => {
    const soup = selectReaction(zh, ev([{ kind: 'extra', ing: 'salt' }]), order(), 6, makeRng(4));
    expect(soup.reactionId).toBe('r_soup');
    const better = selectReaction(en, ev([], 'perfect'), order({ symptom: true }), 8, makeRng(5));
    expect(['r_better', 'r_better2']).toContain(better.reactionId);
    const notSymptom = selectReaction(en, ev([], 'perfect'), order(), 8, makeRng(5));
    expect(['r_better', 'r_better2']).not.toContain(notSymptom.reactionId);
  });

  it('never returns Japanese', () => {
    for (const kind of ['empty', 'wrong', 'missing', 'extra', 'too_little'] as const) {
      const r = selectReaction(en, ev([{ kind, ing: 'mint' }]), order(), 9, makeRng(9));
      expect(r.text).not.toMatch(/[぀-ヿ]/);
    }
  });
});
