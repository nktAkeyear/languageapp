/**
 * Pure presentation logic of the workbench: how hand gestures map onto the brew data model,
 * which tool fits each ingredient's unit, what colour the drink becomes, and how a customer
 * moves when they taste a mistake. No React, no DOM: unit-tested in brewing.test.ts.
 *
 * The brew produced here is the same `Brew` the shop rules evaluate (counts / temp / method).
 */
import type { Brew, Evaluation, IngredientId, Issue, Method, Tag, Temp } from '../core/types';

// ---------------------------------------------------------------------------------------------
// Units and tools
// ---------------------------------------------------------------------------------------------

/** The unit one hand action adds (matches the content's quantity phrases: slices, spoons, cups…). */
export type Unit = 'slice' | 'leaf' | 'spoon' | 'cup' | 'cube' | 'piece' | 'flower' | 'stick' | 'pinch';
/** The tool the hand uses for that unit. */
export type Tool = 'knife' | 'fingers' | 'spoon' | 'pour' | 'tongs';

export const ING_UNIT: Record<IngredientId, Unit> = {
  lemon: 'slice',
  ginger: 'slice',
  apple: 'slice',
  watermelon: 'slice',
  mint: 'leaf',
  honey: 'spoon',
  sugar: 'spoon',
  green_tea: 'spoon',
  black_tea: 'spoon',
  coffee: 'spoon',
  yogurt: 'spoon',
  water: 'cup',
  milk: 'cup',
  ice: 'cube',
  red_dates: 'piece',
  banana: 'piece',
  pear: 'piece',
  chrysanthemum: 'flower',
  rose: 'flower',
  cinnamon: 'stick',
  salt: 'pinch',
};

export const UNIT_TOOL: Record<Unit, Tool> = {
  slice: 'knife',
  leaf: 'fingers',
  spoon: 'spoon',
  cup: 'pour',
  cube: 'tongs',
  piece: 'fingers',
  flower: 'fingers',
  stick: 'fingers',
  pinch: 'fingers',
};

/** Japanese chrome for the accessible "add one" action (no target-language meaning given away). */
export const UNIT_ACTION_JA: Record<Unit, string> = {
  slice: '一切れ切って入れる',
  leaf: '一枚入れる',
  spoon: '一さじ入れる',
  cup: '一杯注ぐ',
  cube: '一つ入れる',
  piece: '一つ入れる',
  flower: '一輪入れる',
  stick: '一本入れる',
  pinch: 'ひとつまみ入れる',
};

export function toolFor(ing: IngredientId): Tool {
  return UNIT_TOOL[ING_UNIT[ing] ?? 'piece'];
}

// ---------------------------------------------------------------------------------------------
// Gestures → brew
// ---------------------------------------------------------------------------------------------

export type BrewAction =
  | { kind: 'add'; ing: IngredientId; n?: number }
  | { kind: 'remove'; ing: IngredientId; n?: number }
  | { kind: 'temp'; temp: Temp | null }
  | { kind: 'method'; method: Method | null }
  | { kind: 'empty' };

/** Max portions of an ingredient in one cup: its maxCount, further limited by today's stock. */
export function portionLimit(maxCount: number, stockLeft: number | undefined): number {
  return Math.max(0, Math.min(maxCount, stockLeft ?? Infinity));
}

export const emptyBrew = (): Brew => ({ counts: {}, temp: null, method: null });

/**
 * Apply one workbench action. `limit(ing)` is the portion limit (see portionLimit).
 * Temperature / method tools toggle: using the same tool again takes it back.
 */
export function applyBrewAction(brew: Brew, a: BrewAction, limit: (ing: IngredientId) => number): Brew {
  switch (a.kind) {
    case 'add':
    case 'remove': {
      const delta = (a.n ?? 1) * (a.kind === 'add' ? 1 : -1);
      const n = Math.max(0, Math.min(limit(a.ing), (brew.counts[a.ing] ?? 0) + delta));
      const counts = { ...brew.counts, [a.ing]: n };
      if (!n) delete counts[a.ing];
      return { ...brew, counts };
    }
    case 'temp':
      return { ...brew, temp: a.temp !== null && brew.temp === a.temp ? null : a.temp };
    case 'method':
      return { ...brew, method: a.method !== null && brew.method === a.method ? null : a.method };
    case 'empty':
      return emptyBrew();
  }
}

/** Could `add` change anything? (for disabling a jar / showing "full") */
export function canAdd(brew: Brew, ing: IngredientId, limit: number): boolean {
  return (brew.counts[ing] ?? 0) < limit;
}

export function totalPortions(brew: Brew): number {
  return Object.values(brew.counts).reduce((s, n) => s + (n ?? 0), 0);
}

// ---------------------------------------------------------------------------------------------
// Colour of the drink
// ---------------------------------------------------------------------------------------------

export type Rgb = [number, number, number];

/** How an ingredient shows in the cup: tint colour, tint strength, and whether pieces float. */
export interface IngLook {
  tint: Rgb;
  /** Weight of one portion in the colour mix (0 = does not colour the liquid). */
  strength: number;
  /** 'float' = visible pieces in the cup, 'dissolve' = only colours the liquid. */
  show: 'float' | 'dissolve';
  /** Counts towards the liquid level. */
  liquid?: boolean;
}

export const ING_LOOK: Record<IngredientId, IngLook> = {
  lemon: { tint: [246, 214, 92], strength: 0.6, show: 'float' },
  ginger: { tint: [222, 180, 98], strength: 0.5, show: 'float' },
  mint: { tint: [150, 196, 120], strength: 0.4, show: 'float' },
  honey: { tint: [226, 160, 40], strength: 1.1, show: 'dissolve' },
  water: { tint: [214, 232, 240], strength: 0.6, show: 'dissolve', liquid: true },
  ice: { tint: [220, 238, 248], strength: 0.15, show: 'float' },
  sugar: { tint: [246, 240, 228], strength: 0.15, show: 'dissolve' },
  salt: { tint: [238, 238, 236], strength: 0.1, show: 'dissolve' },
  green_tea: { tint: [150, 172, 70], strength: 2.2, show: 'dissolve', liquid: true },
  black_tea: { tint: [150, 70, 30], strength: 2.6, show: 'dissolve', liquid: true },
  milk: { tint: [246, 240, 226], strength: 2.0, show: 'dissolve', liquid: true },
  red_dates: { tint: [178, 52, 40], strength: 0.7, show: 'float' },
  chrysanthemum: { tint: [236, 204, 70], strength: 0.7, show: 'float' },
  cinnamon: { tint: [156, 88, 44], strength: 0.7, show: 'float' },
  apple: { tint: [236, 214, 160], strength: 0.4, show: 'float' },
  banana: { tint: [240, 226, 150], strength: 0.6, show: 'float' },
  watermelon: { tint: [232, 86, 96], strength: 1.0, show: 'float' },
  pear: { tint: [220, 222, 150], strength: 0.4, show: 'float' },
  rose: { tint: [214, 92, 128], strength: 0.9, show: 'float' },
  coffee: { tint: [70, 40, 22], strength: 3.0, show: 'dissolve', liquid: true },
  yogurt: { tint: [248, 246, 238], strength: 1.6, show: 'dissolve', liquid: true },
};

/** Hot water the drink is brewed in, before anything colours it. */
const BASE: Rgb = [236, 222, 196];
const BASE_WEIGHT = 0.5;

/**
 * Colour of the liquid: a weighted mean of the base water and each ingredient's tint
 * (count × strength). Returns null for an empty cup.
 */
export function liquidColour(brew: Brew): Rgb | null {
  const entries = (Object.entries(brew.counts) as [IngredientId, number][]).filter(([, n]) => n > 0);
  if (!entries.length) return null;
  let w = BASE_WEIGHT;
  const acc: Rgb = [BASE[0] * BASE_WEIGHT, BASE[1] * BASE_WEIGHT, BASE[2] * BASE_WEIGHT];
  for (const [ing, n] of entries) {
    const look = ING_LOOK[ing];
    if (!look) continue;
    const k = look.strength * n;
    w += k;
    for (let i = 0; i < 3; i++) acc[i] += look.tint[i] * k;
  }
  return acc.map((c) => Math.round(c / w)) as Rgb;
}

/** Liquid level of the cup, 0..1 (0 = empty). */
export function liquidLevel(brew: Brew): number {
  let liquids = 0;
  let solids = 0;
  for (const [ing, n] of Object.entries(brew.counts) as [IngredientId, number][]) {
    if (!n) continue;
    if (ING_LOOK[ing]?.liquid) liquids += n;
    else solids += n;
  }
  if (!liquids && !solids) return 0;
  return Math.min(0.92, 0.42 + liquids * 0.11 + solids * 0.025);
}

export const rgbCss = (c: Rgb, a = 1) => (a >= 1 ? `rgb(${c[0]},${c[1]},${c[2]})` : `rgba(${c[0]},${c[1]},${c[2]},${a})`);

/** Lighter / darker shade (for liquid surface highlights). t > 0 lightens, t < 0 darkens. */
export function shade(c: Rgb, t: number): Rgb {
  return c.map((v) => Math.round(t >= 0 ? v + (255 - v) * t : v * (1 + t))) as Rgb;
}

/**
 * Visible pieces in the cup, with deterministic positions (x, y in 0..1 of the liquid surface
 * area, rotation in degrees). Every portion of a floating ingredient is one piece, so counts can
 * be read off the cup.
 */
export interface Piece {
  ing: IngredientId;
  /** Index among the pieces of the same ingredient. */
  k: number;
  x: number;
  y: number;
  rot: number;
}

export function cupPieces(brew: Brew, order: IngredientId[]): Piece[] {
  const out: Piece[] = [];
  let i = 0;
  for (const ing of order) {
    const n = brew.counts[ing] ?? 0;
    if (!n || ING_LOOK[ing]?.show !== 'float') continue;
    for (let k = 0; k < n; k++, i++) {
      // Golden-angle spiral: evenly spread, stable as pieces are added.
      const a = i * 2.399963;
      const r = 0.12 + 0.36 * Math.sqrt((i + 0.5) / 14);
      out.push({ ing, k, x: 0.5 + Math.cos(a) * r, y: 0.5 + Math.sin(a) * r * 0.75, rot: ((i * 47) % 70) - 35 });
    }
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Customer reactions
// ---------------------------------------------------------------------------------------------

/** How the customer's body reacts after the sip (on top of the content's face). */
export type Motion = 'delight' | 'nod' | 'grimace' | 'pucker' | 'shiver' | 'fan' | 'cough' | 'push' | 'puzzle' | 'sigh' | 'shrug';

/**
 * Pick a motion from the evaluation's primary issue: bitter mistakes make a grimace, sour ones
 * pucker, salty ones cough, a cold drink for someone who wanted it hot makes them shiver
 * (and the other way round they fan themselves), forbidden ingredients get pushed back.
 */
export function reactionMotion(ev: Evaluation | null | undefined, tagsOf: (ing: IngredientId) => Tag[]): Motion {
  if (!ev) return 'nod';
  if (ev.outcome === 'perfect') return 'delight';
  const p: Issue | null = ev.primary;
  if (!p) return 'shrug';
  const tasteOf = (): Tag | undefined => {
    if (p.tag) return p.tag;
    if (!p.ing) return undefined;
    const tags = tagsOf(p.ing);
    return (['bitter', 'sour', 'salty'] as Tag[]).find((t) => tags.includes(t));
  };
  switch (p.kind) {
    case 'empty':
      return 'puzzle';
    case 'forbidden':
    case 'forbidden_tag':
      return 'push';
    case 'wrong_temp':
      return p.temp === 'hot' ? 'shiver' : 'fan';
    case 'too_much':
    case 'tag_too_much':
    case 'extra':
    case 'wrong': {
      const t = tasteOf();
      if (t === 'bitter') return 'grimace';
      if (t === 'sour') return 'pucker';
      if (t === 'salty') return 'cough';
      return p.kind === 'too_much' || p.kind === 'tag_too_much' ? 'sigh' : 'puzzle';
    }
    case 'too_little':
    case 'wrong_method':
      return 'sigh';
    default:
      return 'puzzle';
  }
}
