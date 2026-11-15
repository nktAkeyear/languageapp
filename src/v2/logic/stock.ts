/**
 * Stock arithmetic for v2 (pure, no UI): buying in person, ordering by delivery, deliveries arriving, using
 * portions in a cup or at a desk, and stock carrying over to the next day. Every purchase adds exactly
 * `units × per` portions to the shelf; nothing here ever resets the stock at a day boundary.
 */
import { deliveryFee, orderPrice, type CatalogItem, type WorkplaceId } from './catalog';

export type Stock = Record<string, number>;

export interface OrderLine {
  id: string;
  units: number;
}

export interface QuotedLine extends OrderLine {
  portions: number;
  unitPrice: number;
  lineTotal: number;
}

export interface Quote {
  lines: QuotedLine[];
  units: number;
  subtotal: number;
  fee: number;
  total: number;
}

/** When a delivery comes: a few seconds after ordering (the van is in town), or the next morning (ordered after closing). */
export type Arrival = { kind: 'soon'; at: number } | { kind: 'morning'; day: number };

export interface Delivery {
  id: string;
  workplace: WorkplaceId;
  lines: { id: string; units: number; portions: number }[];
  fee: number;
  total: number;
  arrive: Arrival;
  placedDay: number;
  placedPart: number;
}

/** What came in (shown as +N on the shelf / the dock chips until the player moves on). */
export interface Arrived {
  key: string;
  workplace: WorkplaceId;
  /** Where it came from: a delivery crate or the market basket. */
  via: 'crate' | 'market';
  lines: { id: string; portions: number }[];
  day: number;
  /** Part of the day it arrived in (a morning crate arrives before opening). */
  part?: number;
}

/** Seconds a delivery takes during the day. */
export const DELIVERY_SECONDS = 8;

export function quoteOrder(catalog: CatalogItem[], lines: OrderLine[]): Quote {
  const out: QuotedLine[] = [];
  for (const l of lines) {
    const it = catalog.find((c) => c.id === l.id);
    const units = Math.max(0, Math.floor(l.units));
    if (!it || units <= 0) continue;
    const unitPrice = orderPrice(it);
    out.push({ id: l.id, units, portions: units * it.per, unitPrice, lineTotal: units * unitPrice });
  }
  const units = out.reduce((s, l) => s + l.units, 0);
  const subtotal = out.reduce((s, l) => s + l.lineTotal, 0);
  const fee = deliveryFee(units);
  return { lines: out, units, subtotal, fee, total: subtotal + fee };
}

export interface Ledger {
  money: number;
}

/**
 * Place an order by delivery: the money is paid now (goods + fee), the goods arrive later. Returns the delivery,
 * or a Japanese reason when nothing could be ordered.
 */
export function placeOrder(
  wallet: Ledger,
  pending: Delivery[],
  catalog: CatalogItem[],
  lines: OrderLine[],
  ctx: { workplace: WorkplaceId; day: number; part: number; now: number; id: string },
): { delivery: Delivery } | { reason: string } {
  const q = quoteOrder(catalog, lines);
  if (!q.lines.length) return { reason: '何も選ばれていません' };
  if (q.total > wallet.money) return { reason: `お金が足りません（あと ${q.total - wallet.money} 枚）` };
  wallet.money -= q.total;
  // After closing the supplier's van has gone home: the crate comes with the morning.
  const arrive: Arrival = ctx.part >= 2 ? { kind: 'morning', day: ctx.day + 1 } : { kind: 'soon', at: ctx.now + DELIVERY_SECONDS * 1000 };
  const delivery: Delivery = {
    id: ctx.id,
    workplace: ctx.workplace,
    lines: q.lines.map((l) => ({ id: l.id, units: l.units, portions: l.portions })),
    fee: q.fee,
    total: q.total,
    arrive,
    placedDay: ctx.day,
    placedPart: ctx.part,
  };
  pending.push(delivery);
  return { delivery };
}

/** Is this delivery due now (by clock during the day, or by the calendar for a morning crate)? */
export function isDue(d: Delivery, now: number, day: number): boolean {
  return d.arrive.kind === 'soon' ? now >= d.arrive.at : day >= d.arrive.day;
}

/** Put a delivery's goods on the shelf. */
export function receive(stock: Stock, d: Delivery): { id: string; portions: number }[] {
  for (const l of d.lines) stock[l.id] = (stock[l.id] ?? 0) + l.portions;
  return d.lines.map((l) => ({ id: l.id, portions: l.portions }));
}

/**
 * Take every due delivery out of `pending` and put it on its workplace's shelf. Returns what arrived.
 * A crate ordered during the day that was still on its way when the day ended comes with the next morning.
 */
export function receiveDue(stocks: Record<WorkplaceId, Stock>, pending: Delivery[], now: number, day: number): Delivery[] {
  const due = pending.filter((d) => isDue(d, now, day));
  for (const d of due) {
    receive((stocks[d.workplace] ??= {}), d);
    pending.splice(pending.indexOf(d), 1);
  }
  return due;
}

/** Buy in person at the market: paid at the stall, no fee, the goods go straight onto the shelf. */
export function buyInPerson(wallet: Ledger, stock: Stock, item: CatalogItem, units: number, paid: number): { ok: true; change: number; portions: number } | { ok: false; reason: 'notEnough' | 'none' } {
  const n = Math.floor(units);
  if (n <= 0) return { ok: false, reason: 'none' };
  const total = n * item.price;
  if (paid < total) return { ok: false, reason: 'notEnough' };
  if (paid > wallet.money) return { ok: false, reason: 'notEnough' };
  wallet.money -= total; // the change comes back at once
  stock[item.id] = (stock[item.id] ?? 0) + n * item.per;
  return { ok: true, change: paid - total, portions: n * item.per };
}

/** Portions free to use: the shelf minus what is already in the cup (reserved, not yet served). */
export function available(stock: Stock, reserved: Record<string, number | undefined>, id: string): number {
  return Math.max(0, (stock[id] ?? 0) - (reserved[id] ?? 0));
}

/** Serve / hand in: the portions used leave the shelf. Never below zero. Returns what was used. */
export function commitUse(stock: Stock, counts: Record<string, number | undefined>): Record<string, number> {
  const used: Record<string, number> = {};
  for (const [id, n] of Object.entries(counts)) {
    const k = Math.max(0, Math.min(n ?? 0, stock[id] ?? 0));
    if (k <= 0) continue;
    stock[id] = (stock[id] ?? 0) - k;
    used[id] = k;
  }
  return used;
}

/** Add `b` into `a` (a day's tally of portions used / bought). */
export function addInto(a: Record<string, number>, b: Record<string, number>): void {
  for (const [id, n] of Object.entries(b)) a[id] = (a[id] ?? 0) + n;
}

/** Portions still needed to cover `need` with a reserve, and the units that buys. */
export function shortfall(stock: Stock, need: Record<string, number>, item: CatalogItem, reserve = 1): { portions: number; units: number } {
  const want = (need[item.id] ?? 0) + (need[item.id] ? reserve : 0);
  const short = Math.max(0, want - (stock[item.id] ?? 0));
  return { portions: short, units: short ? Math.ceil(short / item.per) : 0 };
}
