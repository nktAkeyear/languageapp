import { describe, expect, it } from 'vitest';
import { evaluateBrew, indexIngredients } from '../activities/shop/rules';
import { SHARED } from '../content';
import type { Brew, Evaluation, IngredientId } from '../core/types';
import {
  ING_LOOK,
  ING_UNIT,
  UNIT_TOOL,
  applyBrewAction,
  cupPieces,
  emptyBrew,
  liquidColour,
  liquidLevel,
  portionLimit,
  reactionMotion,
  toolFor,
} from './brewing';

const idx = indexIngredients(SHARED.ingredients);
const tagsOf = (ing: IngredientId) => idx.get(ing)?.tags ?? [];
const lim = (n: number) => () => n;

describe('units and tools', () => {
  it('every shared ingredient has a unit, a tool and a look', () => {
    for (const d of SHARED.ingredients) {
      expect(ING_UNIT[d.id], d.id).toBeDefined();
      expect(UNIT_TOOL[ING_UNIT[d.id]], d.id).toBeDefined();
      expect(ING_LOOK[d.id], d.id).toBeDefined();
    }
  });
  it('tools fit the quantity phrases (slices → knife, spoons → spoon, cups → pour, cubes → tongs)', () => {
    expect(toolFor('lemon')).toBe('knife');
    expect(toolFor('honey')).toBe('spoon');
    expect(toolFor('water')).toBe('pour');
    expect(toolFor('ice')).toBe('tongs');
    expect(toolFor('mint')).toBe('fingers');
  });
});

describe('gesture → brew', () => {
  it('repeating the add gesture counts portions up to the limit', () => {
    let b = emptyBrew();
    for (let i = 0; i < 4; i++) b = applyBrewAction(b, { kind: 'add', ing: 'lemon' }, lim(3));
    expect(b.counts.lemon).toBe(3);
  });
  it('taking a piece back removes it and drops empty keys', () => {
    let b: Brew = { counts: { mint: 2 }, temp: null, method: null };
    b = applyBrewAction(b, { kind: 'remove', ing: 'mint' }, lim(10));
    expect(b.counts.mint).toBe(1);
    b = applyBrewAction(b, { kind: 'remove', ing: 'mint' }, lim(10));
    expect(b.counts).toEqual({});
  });
  it('stock limits cap the portions (残りN)', () => {
    expect(portionLimit(5, 2)).toBe(2);
    expect(portionLimit(5, undefined)).toBe(5);
    expect(portionLimit(5, 0)).toBe(0);
    const b = applyBrewAction(emptyBrew(), { kind: 'add', ing: 'pear' }, lim(portionLimit(3, 0)));
    expect(b.counts.pear).toBeUndefined();
  });
  it('kettle / basin and method tools toggle', () => {
    let b = applyBrewAction(emptyBrew(), { kind: 'temp', temp: 'hot' }, lim(5));
    expect(b.temp).toBe('hot');
    b = applyBrewAction(b, { kind: 'temp', temp: 'cold' }, lim(5));
    expect(b.temp).toBe('cold');
    b = applyBrewAction(b, { kind: 'temp', temp: 'cold' }, lim(5));
    expect(b.temp).toBeNull();
    b = applyBrewAction(b, { kind: 'method', method: 'boil' }, lim(5));
    b = applyBrewAction(b, { kind: 'method', method: 'stir' }, lim(5));
    expect(b.method).toBe('stir');
  });
  it('tipping the cup out empties everything', () => {
    const b: Brew = { counts: { honey: 2 }, temp: 'hot', method: 'stir' };
    expect(applyBrewAction(b, { kind: 'empty' }, lim(5))).toEqual(emptyBrew());
  });
  it('a hand-made brew feeds the unchanged rule evaluation', () => {
    let b = emptyBrew();
    for (const a of [
      { kind: 'add', ing: 'ginger' },
      { kind: 'add', ing: 'ginger' },
      { kind: 'add', ing: 'honey' },
      { kind: 'temp', temp: 'hot' },
    ] as const)
      b = applyBrewAction(b, a, lim(5));
    const ev = evaluateBrew({ require: [{ ing: 'ginger', min: 2, max: 3 }, { ing: 'honey', min: 1, max: 2 }], temp: 'hot' }, b, idx);
    expect(ev.outcome).toBe('perfect');
  });
});

describe('drink colour', () => {
  it('an empty cup has no liquid', () => {
    expect(liquidColour(emptyBrew())).toBeNull();
    expect(liquidLevel(emptyBrew())).toBe(0);
  });
  it('black tea darkens, milk lightens it again', () => {
    const tea = liquidColour({ counts: { black_tea: 1 }, temp: null, method: null })!;
    const milkTea = liquidColour({ counts: { black_tea: 1, milk: 2 }, temp: null, method: null })!;
    const lum = (c: number[]) => c[0] + c[1] + c[2];
    expect(lum(tea)).toBeLessThan(lum([236, 222, 196]));
    expect(lum(milkTea)).toBeGreaterThan(lum(tea));
  });
  it('the mix is a weighted mean (stays within the tints)', () => {
    const c = liquidColour({ counts: { watermelon: 3 }, temp: null, method: null })!;
    expect(c[0]).toBeGreaterThan(c[1]); // reddish
    for (const v of c) expect(v).toBeGreaterThanOrEqual(0);
    for (const v of c) expect(v).toBeLessThanOrEqual(255);
  });
  it('liquids raise the level more than pieces', () => {
    const a = liquidLevel({ counts: { water: 2 }, temp: null, method: null });
    const b = liquidLevel({ counts: { mint: 2 }, temp: null, method: null });
    expect(a).toBeGreaterThan(b);
    expect(liquidLevel({ counts: { water: 3, milk: 3, coffee: 3 }, temp: null, method: null })).toBeLessThanOrEqual(0.92);
  });
  it('one visible piece per portion of a floating ingredient', () => {
    const p = cupPieces({ counts: { lemon: 2, honey: 1, mint: 3 }, temp: null, method: null }, ['lemon', 'honey', 'mint']);
    expect(p.filter((x) => x.ing === 'lemon')).toHaveLength(2);
    expect(p.filter((x) => x.ing === 'mint')).toHaveLength(3);
    expect(p.some((x) => x.ing === 'honey')).toBe(false);
    for (const x of p) {
      expect(x.x).toBeGreaterThan(0);
      expect(x.x).toBeLessThan(1);
    }
  });
});

describe('reaction motions', () => {
  const ev = (e: Partial<Evaluation>): Evaluation => ({ issues: [], primary: null, outcome: 'fail', ...e });
  it('perfect cups delight', () => {
    expect(reactionMotion(ev({ outcome: 'perfect' }), tagsOf)).toBe('delight');
  });
  it('mistake types feel different', () => {
    expect(reactionMotion(ev({ primary: { kind: 'too_much', ing: 'green_tea' } }), tagsOf)).toBe('grimace');
    expect(reactionMotion(ev({ primary: { kind: 'too_much', ing: 'lemon' } }), tagsOf)).toBe('pucker');
    expect(reactionMotion(ev({ primary: { kind: 'extra', ing: 'salt' } }), tagsOf)).toBe('cough');
    expect(reactionMotion(ev({ primary: { kind: 'wrong_temp', temp: 'hot' } }), tagsOf)).toBe('shiver');
    expect(reactionMotion(ev({ primary: { kind: 'wrong_temp', temp: 'cold' } }), tagsOf)).toBe('fan');
    expect(reactionMotion(ev({ primary: { kind: 'forbidden', ing: 'milk' }, outcome: 'bad' }), tagsOf)).toBe('push');
    expect(reactionMotion(ev({ primary: { kind: 'empty' } }), tagsOf)).toBe('puzzle');
    expect(reactionMotion(ev({ primary: { kind: 'too_little', ing: 'honey' }, outcome: 'minor' }), tagsOf)).toBe('sigh');
  });
  it('without an evaluation (reloaded mid-reaction) the customer just nods', () => {
    expect(reactionMotion(null, tagsOf)).toBe('nod');
  });
});
