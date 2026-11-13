/**
 * Pure market rules: needs, units, prices, payment, stock. No text, no state.
 * Stock is counted in portions — the same unit the workbench counts (one lemon slice, one mint
 * leaf, one spoon of honey).
 */
import type { IngredientId, OrderInstance } from '../../core/types';
import type { BasketItem, MarketGood, MarketShared, NoteLine, VariantId } from '../../core/townTypes';

/** Portions kept in reserve on top of the day's minimum, so a generous cup does not ruin the day. */
export const RESERVE_PORTIONS = 2;

export function goodDef(m: MarketShared, ing: IngredientId): MarketGood | undefined {
  return m.goods.find((g) => g.ingredient === ing);
}

export function variantMult(m: MarketShared, v: VariantId | undefined, key: 'portionsMult' | 'priceMult'): number {
  if (!v) return 1;
  return m.variants.find((x) => x.id === v)?.[key] ?? 1;
}

/** Shop portions one unit of this good (and variant) provides. */
export function portionsPerUnit(m: MarketShared, ing: IngredientId, v?: VariantId): number {
  const g = goodDef(m, ing);
  return g ? g.portionsPerUnit * variantMult(m, v, 'portionsMult') : 0;
}

/** Units to buy so that the shop has at least `portions` portions. */
export function unitsFor(m: MarketShared, ing: IngredientId, portions: number, v?: VariantId): number {
  const per = portionsPerUnit(m, ing, v);
  return per > 0 ? Math.max(1, Math.ceil(portions / per)) : 0;
}

export function offerPrice(m: MarketShared, ing: IngredientId, v: VariantId | undefined, jitter: number): number {
  const g = goodDef(m, ing);
  if (!g) return 0;
  return Math.max(1, Math.round(g.price * variantMult(m, v, 'priceMult')) + jitter);
}

/**
 * Portions needed per market good for today's shop queue: the minimum each order requires,
 * plus a small reserve. Only goods in `goods` that some order needs are listed.
 */
export function computeNeeds(queue: Pick<OrderInstance, 'rule'>[], goods: IngredientId[]): Map<IngredientId, number> {
  const need = new Map<IngredientId, number>();
  for (const o of queue)
    for (const r of o.rule.require ?? [])
      if (goods.includes(r.ing)) need.set(r.ing, (need.get(r.ing) ?? 0) + Math.max(1, r.min ?? 1));
  for (const [k, v] of need) need.set(k, v + RESERVE_PORTIONS);
  return need;
}

/** Portions of stock gained from the basket, per good. */
export function portionsFromBasket(m: MarketShared, basket: Pick<BasketItem, 'good' | 'variant' | 'units'>[]): Map<IngredientId, number> {
  const out = new Map<IngredientId, number>();
  for (const b of basket) out.set(b.good, (out.get(b.good) ?? 0) + b.units * portionsPerUnit(m, b.good, b.variant));
  return out;
}

/**
 * Shop stock for today: every good on the note is tracked (starts from what was bought);
 * goods not on the note stay unlimited.
 */
export function stockFromMarket(m: MarketShared, lines: NoteLine[], basket: BasketItem[]): Partial<Record<IngredientId, number>> {
  const got = portionsFromBasket(m, basket);
  const stock: Partial<Record<IngredientId, number>> = {};
  for (const l of lines) stock[l.good] = Math.floor(got.get(l.good) ?? 0);
  return stock;
}

/** A note line is covered when the bought stock reaches the portions the shop needs. */
export function lineCovered(line: NoteLine, stock: Partial<Record<IngredientId, number>>): boolean {
  return (stock[line.good] ?? 0) >= line.portions;
}

export type PaymentKind = 'exact' | 'overpaid' | 'change' | 'not_enough' | 'no_change';

export interface PaymentResult {
  kind: PaymentKind;
  /** The purchase went through. */
  accepted: boolean;
  /** Coins that left the purse. */
  spent: number;
  change: number;
}

/**
 * Settle a payment. Without the change feature the vendor keeps any overpayment (that is the
 * consequence). With it, change up to `changeLimit` is given back; larger overpayments are refused.
 */
export function evaluatePayment(total: number, paid: number, opts: { change: boolean; changeLimit: number }): PaymentResult {
  if (paid < total) return { kind: 'not_enough', accepted: false, spent: 0, change: 0 };
  if (paid === total) return { kind: 'exact', accepted: true, spent: paid, change: 0 };
  if (!opts.change) return { kind: 'overpaid', accepted: true, spent: paid, change: 0 };
  const change = paid - total;
  if (change > opts.changeLimit) return { kind: 'no_change', accepted: false, spent: 0, change: 0 };
  return { kind: 'change', accepted: true, spent: total, change };
}

/** Haggled total: ~15% off (at least 1 coin) when the vendor accepts. */
export function bargainTotal(total: number, accept: boolean): number {
  if (!accept || total <= 2) return total;
  return total - Math.max(1, Math.round(total * 0.15));
}
