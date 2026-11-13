import { describe, expect, it } from 'vitest';
import { INGREDIENTS } from '../../content/shared/ingredients';
import type { Brew, OrderRule } from '../../core/types';
import { checkSatisfiable, evaluateBrew, indexIngredients, mergeRules, witnessBrew } from './rules';

const idx = indexIngredients(INGREDIENTS);
const brew = (counts: Brew['counts'], temp: Brew['temp'] = null, method: Brew['method'] = null): Brew => ({ counts, temp, method });

describe('evaluateBrew', () => {
  const twoLemons: OrderRule = { require: [{ ing: 'lemon', min: 2, max: 2 }] };

  it('perfect when requirements are met exactly', () => {
    const ev = evaluateBrew(twoLemons, brew({ lemon: 2 }), idx);
    expect(ev.outcome).toBe('perfect');
    expect(ev.primary).toBeNull();
  });

  it('empty cup', () => {
    expect(evaluateBrew(twoLemons, brew({}), idx).primary?.kind).toBe('empty');
  });

  it('too much / too little are minor when off by one', () => {
    const much = evaluateBrew(twoLemons, brew({ lemon: 3 }), idx);
    expect(much.primary).toMatchObject({ kind: 'too_much', ing: 'lemon', diff: 1 });
    expect(much.outcome).toBe('minor');
    const little = evaluateBrew(twoLemons, brew({ lemon: 1 }), idx);
    expect(little.primary?.kind).toBe('too_little');
    expect(evaluateBrew(twoLemons, brew({ lemon: 5 }), idx).outcome).toBe('fail');
  });

  it('wrong ingredient when the required one is replaced', () => {
    const ev = evaluateBrew(twoLemons, brew({ mint: 2 }), idx);
    expect(ev.primary).toMatchObject({ kind: 'wrong', ing: 'lemon' });
    expect(ev.issues.some((i) => i.kind === 'extra' && i.ing === 'mint')).toBe(true);
    expect(ev.outcome).toBe('fail');
  });

  it('missing vs extra', () => {
    const r: OrderRule = { require: [{ ing: 'lemon' }, { ing: 'honey' }] };
    expect(evaluateBrew(r, brew({ lemon: 1 }), idx).primary).toMatchObject({ kind: 'missing', ing: 'honey' });
    expect(evaluateBrew(r, brew({ lemon: 1, honey: 1, mint: 1 }), idx).primary).toMatchObject({ kind: 'extra', ing: 'mint' });
  });

  it('water is neutral unless forbidden', () => {
    expect(evaluateBrew(twoLemons, brew({ lemon: 2, water: 1 }), idx).outcome).toBe('perfect');
    const ev = evaluateBrew({ ...twoLemons, forbid: ['water'] }, brew({ lemon: 2, water: 1 }), idx);
    expect(ev.primary?.kind).toBe('forbidden');
  });

  it('forbidden ingredient is "bad" and outranks other issues', () => {
    const r: OrderRule = { require: [{ ing: 'lemon' }], forbid: ['sugar'], temp: 'hot' };
    const ev = evaluateBrew(r, brew({ lemon: 1, sugar: 1 }, 'cold'), idx);
    expect(ev.primary).toMatchObject({ kind: 'forbidden', ing: 'sugar' });
    expect(ev.outcome).toBe('bad');
    expect(ev.issues.map((i) => i.kind)).toContain('wrong_temp');
  });

  it('temperature and method', () => {
    const r: OrderRule = { require: [{ ing: 'ginger' }], temp: 'hot', method: 'boil' };
    expect(evaluateBrew(r, brew({ ginger: 1 }, 'cold', 'boil'), idx).primary).toMatchObject({ kind: 'wrong_temp', temp: 'hot' });
    expect(evaluateBrew(r, brew({ ginger: 1 }, null, 'boil'), idx).primary?.kind).toBe('wrong_temp');
    const m = evaluateBrew(r, brew({ ginger: 1 }, 'hot', 'stir'), idx);
    expect(m.primary).toMatchObject({ kind: 'wrong_method', method: 'boil' });
    expect(m.outcome).toBe('minor');
    expect(evaluateBrew(r, brew({ ginger: 1 }, 'hot', 'boil'), idx).outcome).toBe('perfect');
  });

  it('tag requirements allow any ingredient with the tag', () => {
    const sweet: OrderRule = { requireTag: [{ tag: 'sweet' }], temp: 'hot' };
    expect(evaluateBrew(sweet, brew({ honey: 1 }, 'hot'), idx).outcome).toBe('perfect');
    expect(evaluateBrew(sweet, brew({ sugar: 2 }, 'hot'), idx).outcome).toBe('perfect');
    const ev = evaluateBrew(sweet, brew({ lemon: 1 }, 'hot'), idx);
    expect(ev.issues.map((i) => i.kind)).toEqual(expect.arrayContaining(['tag_missing', 'extra']));
    expect(ev.primary?.kind).toBe('tag_missing');
  });

  it('forbidden tag', () => {
    const r: OrderRule = { require: [{ ing: 'black_tea' }], forbidTag: ['sweet'] };
    const ev = evaluateBrew(r, brew({ black_tea: 1, honey: 1 }), idx);
    expect(ev.primary).toMatchObject({ kind: 'forbidden_tag', tag: 'sweet', ing: 'honey' });
  });

  it('allow list and allowTag suppress extras', () => {
    const r: OrderRule = { require: [{ ing: 'black_tea' }], allow: ['ice'], allowTag: ['sweet'] };
    expect(evaluateBrew(r, brew({ black_tea: 1, ice: 2, sugar: 1 }), idx).outcome).toBe('perfect');
    expect(evaluateBrew({ ...r, allow: 'any' }, brew({ black_tea: 1, mint: 1 }), idx).outcome).toBe('perfect');
  });
});

describe('mergeRules / checkSatisfiable', () => {
  it('merges lists', () => {
    const m = mergeRules({ require: [{ ing: 'water' }] }, { require: [{ ing: 'honey' }], temp: 'hot', forbid: ['sugar'] });
    expect(m.require?.map((r) => r.ing)).toEqual(['water', 'honey']);
    expect(m.temp).toBe('hot');
    expect(m.forbid).toEqual(['sugar']);
  });

  it('detects unsatisfiable rules', () => {
    const avail = new Set(['lemon', 'honey'] as const);
    const feats = { temperature: false, method: false };
    expect(checkSatisfiable({ require: [{ ing: 'lemon' }] }, avail, feats, idx)).toEqual([]);
    expect(checkSatisfiable({ require: [{ ing: 'mint' }] }, avail, feats, idx)[0]).toMatch(/not on the shelf/);
    expect(checkSatisfiable({ require: [{ ing: 'lemon' }], temp: 'hot' }, avail, feats, idx)[0]).toMatch(/temperature/);
    expect(checkSatisfiable({ require: [{ ing: 'lemon', min: 3, max: 2 }] }, avail, feats, idx).length).toBeGreaterThan(0);
    expect(checkSatisfiable({ require: [{ ing: 'lemon' }], forbid: ['lemon'] }, avail, feats, idx).length).toBeGreaterThan(0);
    expect(checkSatisfiable({ require: [{ ing: 'lemon' }], forbidTag: ['sour'] }, avail, feats, idx).length).toBeGreaterThan(0);
    expect(checkSatisfiable({ requireTag: [{ tag: 'bitter' }] }, avail, feats, idx)[0]).toMatch(/bitter/);
  });

  it('witness brew satisfies the rule', () => {
    const rule: OrderRule = { require: [{ ing: 'ginger', min: 2, max: 3 }], requireTag: [{ tag: 'sweet' }], temp: 'hot' };
    const w = witnessBrew(rule, new Set(['ginger', 'honey'] as const), idx)!;
    expect(w).not.toBeNull();
    expect(evaluateBrew(rule, w, idx).outcome).toBe('perfect');
  });
});
