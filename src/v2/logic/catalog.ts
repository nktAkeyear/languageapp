/**
 * v2 catalogues: what a workplace keeps in stock, in which unit it is bought, how many portions a unit gives and
 * what it costs. Language-neutral numbers here; the English unit phrases come from the existing market content
 * (src/content/en/market.ts) where it has them, and are written here (in words the lexicon already has) for the
 * goods the old game never sold.
 *
 * Stock is always counted in PORTIONS — the thing that goes into a cup (a lemon slice, a mint leaf, a spoon of
 * honey) or is used up by one task at a desk (a stamp's worth of ink, one message slip). A purchase adds
 * `units × per` portions, and that number is what the order form, the shelf and the crate show (+N).
 */
import { MARKET } from '../../content/en/market';
import { SHARED } from '../../content';
import type { IngredientId } from '../../core/types';

export type WorkplaceId = 'teahouse' | 'clinic';

export interface CatalogItem {
  id: string;
  /** Lexicon id of the label word (shelf label, order-form name). */
  word: string;
  /** English unit phrase, `{n}` = number word (e.g. "{n} bags of ginger"); `one` for n = 1. */
  unit: { one: string; other: string };
  /** Portions one unit adds to the stock. */
  per: number;
  /** Price of one unit when bought in person at the market (no fee). */
  price: number;
  /** Japanese helper label of the unit size, e.g. 「1つで3回分」. */
  sizeJa: string;
}

/** Ordering by delivery costs a little more per unit than buying in person, plus a delivery fee. */
export const ORDER_MARKUP = 1;

/** Delivery fee by the number of units on one order (tiered, like boxes on a van). */
export const FEE_TIERS: { upTo: number; fee: number }[] = [
  { upTo: 2, fee: 3 },
  { upTo: 6, fee: 5 },
  { upTo: Infinity, fee: 8 },
];

export function deliveryFee(units: number): number {
  if (units <= 0) return 0;
  return FEE_TIERS.find((t) => units <= t.upTo)!.fee;
}

export function orderPrice(item: CatalogItem): number {
  return item.price + ORDER_MARKUP;
}

const goods = new Map(SHARED.town!.market.goods.map((g) => [g.ingredient, g]));
const goodsText = new Map(MARKET.goods.map((g) => [g.ingredient, g]));

/** Goods the old market never sold: written here, every word already in the lexicon (checked by a test). */
const EXTRA: Partial<Record<IngredientId, { one: string; other: string; per: number; price: number }>> = {
  ice: { one: 'one bag of ice', other: '{n} bags of ice', per: 8, price: 2 },
  salt: { one: 'one bag of salt', other: '{n} bags of salt', per: 10, price: 2 },
  green_tea: { one: 'one bag of green tea', other: '{n} bags of green tea', per: 8, price: 5 },
  black_tea: { one: 'one bag of black tea', other: '{n} bags of black tea', per: 8, price: 5 },
  cinnamon: { one: 'one bag of cinnamon', other: '{n} bags of cinnamon', per: 6, price: 4 },
};

/** Water comes from the tap: never counted, never bought. */
export const TAP: IngredientId = 'water';

function teaItem(ing: IngredientId, word: string): CatalogItem | null {
  const g = goods.get(ing);
  const t = goodsText.get(ing);
  if (g && t) {
    const q = t.qty.base!;
    return { id: ing, word, unit: { one: q.one ?? q.other.replace('{n}', 'one'), other: q.other }, per: g.portionsPerUnit, price: g.price, sizeJa: `1つで${g.portionsPerUnit}回分` };
  }
  const x = EXTRA[ing];
  if (x) return { id: ing, word, unit: { one: x.one, other: x.other }, per: x.per, price: x.price, sizeJa: `1つで${x.per}回分` };
  return null;
}

let teaCache: CatalogItem[] | null = null;
/** Every tea-house ingredient except tap water, in shelf order. */
export function teaCatalog(words: Record<string, string>): CatalogItem[] {
  if (teaCache) return teaCache;
  const out: CatalogItem[] = [];
  for (const d of SHARED.ingredients) {
    if (d.id === TAP) continue;
    const it = teaItem(d.id, words[d.id] ?? d.id);
    if (it) out.push(it);
  }
  teaCache = out;
  return out;
}

/** The clinic's front-desk supplies. What each kind of task uses is in `supplyFor`. */
export const CLINIC_SUPPLIES: CatalogItem[] = [
  { id: 'folder', word: 'folder', unit: { one: 'one box of folders', other: '{n} boxes of folders' }, per: 6, price: 3, sizeJa: '1箱で6回分' },
  { id: 'ink', word: 'ink', unit: { one: 'one bottle of ink', other: '{n} bottles of ink' }, per: 6, price: 4, sizeJa: '1本で6回分' },
  { id: 'paper', word: 'paper', unit: { one: 'one box of paper', other: '{n} boxes of paper' }, per: 4, price: 2, sizeJa: '1箱で4回分' },
  { id: 'card', word: 'card', unit: { one: 'one box of cards', other: '{n} boxes of cards' }, per: 8, price: 3, sizeJa: '1箱で8回分' },
];

/** Stock a new game starts with (portions). Enough for a first morning, never for a week. */
export const START_STOCK: Record<WorkplaceId, Record<string, number>> = {
  teahouse: { lemon: 3, ginger: 6, mint: 5, honey: 5, ice: 8, sugar: 8, green_tea: 4, black_tea: 4, salt: 5 },
  clinic: { folder: 3, ink: 2, paper: 2, card: 2 },
};

/** Money a new v2 game starts with (the old market's start money). */
export const START_MONEY = 40;

/** What a cup pays, by how the customer liked it (in-world: they pay at the counter). */
export const CUP_PAY = { perfect: 6, minor: 4, fail: 2, bad: 1 } as const;
