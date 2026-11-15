/**
 * Renovation engine (UI-agnostic). The catalogue, ordering, arrival the next morning, and the
 * rule effects of installed upgrades. Day hooks are called from src/activities/day.ts:
 *
 *   startTownDay → renoPlanShop (arrivals, extra customers) → market planned with renoCarry →
 *                  renoPlanTown (a delivery every day with the cart)
 *   serveInTown  → renoAfterServe (coin / reputation bonuses, a remark about the décor)
 *   endTownDay   → renoEndDay (signboard reputation, stock kept overnight)
 *
 * Without catalogue content (`data.shared.renovation` / `data.content.renovation`) or without any
 * purchase every hook is a no-op, so older saves and the base game behave exactly as before.
 */
import { featuresAtStage, ingredientsAtStage, type GameData } from '../core/gamedata';
import { pick, type Rng } from '../core/rng';
import type { LangProgress } from '../core/save';
import { recordEncounter, reviewWeight } from '../core/srs';
import type { IngredientId, OrderInstance } from '../core/types';
import type { TownDayState } from '../core/townTypes';
import { planDelivery } from '../activities/delivery/engine';
import { instantiateTemplate } from '../activities/shop/templates';
import type { ServeOutcome } from '../activities/shop/engine';
import { chooseText, textWords, townOf } from '../activities/town/text';
import { newRenoState, remarkText, type CarryRule, type RenoShared, type RenoState, type RenoText, type UpgradeDef, type UpgradeEffects, type UpgradeId } from './types';

export function renoShared(data: GameData): RenoShared | null {
  return data.shared.renovation ?? null;
}
export function renoText(data: GameData): RenoText | null {
  return data.content.renovation ?? null;
}

/** The player's renovation state (created on first use; fills fields missing in older saves). */
export function renoOf(p: LangProgress): RenoState {
  const base = newRenoState();
  if (!p.reno) p.reno = base;
  else for (const k of Object.keys(base) as (keyof RenoState)[]) if (p.reno[k] === undefined) (p.reno as unknown as Record<string, unknown>)[k] = base[k];
  return p.reno;
}

/** Read-only view (never mutates the progress; for the UI). */
export function renoView(p: LangProgress | null | undefined): RenoState {
  return { ...newRenoState(), ...(p?.reno ?? {}) };
}

export function owns(p: LangProgress | null | undefined, id: UpgradeId): boolean {
  return p?.reno?.owned?.[id] !== undefined;
}

export function upgradeDef(data: GameData, id: UpgradeId): UpgradeDef | undefined {
  return renoShared(data)?.upgrades.find((u) => u.id === id);
}

/** Installed upgrades' effects, summed. */
export interface Effects {
  customers: number;
  carry: CarryRule[];
  coinHot: number;
  coinCold: number;
  coinExact: number;
  repDay: number;
  repReturning: number;
  deliveryDaily: boolean;
  tip: number;
}

export function effectsOf(data: GameData, p: LangProgress): Effects {
  const e: Effects = { customers: 0, carry: [], coinHot: 0, coinCold: 0, coinExact: 0, repDay: 0, repReturning: 0, deliveryDaily: false, tip: 0 };
  const sh = renoShared(data);
  if (!sh || !p.reno) return e;
  for (const u of sh.upgrades) {
    if (p.reno.owned[u.id] === undefined) continue;
    const x: UpgradeEffects = u.effects;
    e.customers += x.customers ?? 0;
    if (x.carry) e.carry.push(x.carry);
    e.coinHot += x.coinHot ?? 0;
    e.coinCold += x.coinCold ?? 0;
    e.coinExact += x.coinExact ?? 0;
    e.repDay += x.repDay ?? 0;
    e.repReturning += x.repReturning ?? 0;
    e.deliveryDaily ||= !!x.deliveryDaily;
    e.tip += x.tip ?? 0;
  }
  return e;
}

// ---------------------------------------------------------------------------
// Catalogue
// ---------------------------------------------------------------------------

/** Does the entry appear in the catalogue now? */
export function gateOpen(data: GameData, p: LangProgress, u: UpgradeDef): boolean {
  const w = u.when;
  if (w.day !== undefined && p.day < w.day) return false;
  if (w.stage !== undefined && p.stage < w.stage) return false;
  if (w.rep !== undefined && p.reputation < w.rep && p.day < (w.day ?? 0) + 6) return false; // reputation, or anyway 6 days later
  if (w.requires?.some((r) => !owns(p, r))) return false;
  if (w.activity && p.town.unlocked[w.activity] === undefined) return false;
  if (w.feature && !featuresAtStage(data, p.stage).has(w.feature)) return false;
  return true;
}

export type EntryStatus = 'owned' | 'ordered' | 'available';

export interface CatalogueEntry {
  def: UpgradeDef;
  status: EntryStatus;
  /** Not yet looked at in the catalogue. */
  fresh: boolean;
  affordable: boolean;
}

/** Entries shown in the catalogue, in catalogue order (what has not appeared yet is not listed). */
export function catalogue(data: GameData, p: LangProgress): CatalogueEntry[] {
  const sh = renoShared(data);
  if (!sh || !renoText(data)) return [];
  const r = renoView(p);
  const out: CatalogueEntry[] = [];
  for (const u of sh.upgrades) {
    // Once shown, an entry stays listed (a reputation dip — e.g. a paid gloss peek — does not hide it again).
    const shown = r.seen.includes(u.id) || gateOpen(data, p, u);
    const status: EntryStatus | null = r.owned[u.id] !== undefined ? 'owned' : r.orders.some((o) => o.id === u.id) ? 'ordered' : shown ? 'available' : null;
    if (!status) continue;
    const def = { ...u, price: upgradePrice(data, u) };
    out.push({ def, status, fresh: status === 'available' && !r.seen.includes(u.id), affordable: p.town.money >= def.price });
  }
  return out;
}

/** An upgrade's price in this language (the shared price × the language's scale, rounded to 5). */
export function upgradePrice(data: GameData, u: { price: number }): number {
  const k = renoText(data)?.priceScale ?? 1;
  return k === 1 ? u.price : Math.max(5, Math.round((u.price * k) / 5) * 5);
}

/** Number of entries that appeared since the catalogue was last opened. */
export function catalogueNews(data: GameData, p: LangProgress): number {
  return catalogue(data, p).filter((e) => e.fresh).length;
}

export function renoMarkSeen(data: GameData, p: LangProgress): void {
  const r = renoOf(p);
  for (const e of catalogue(data, p)) if (!r.seen.includes(e.def.id)) r.seen.push(e.def.id);
}

/** Price on the order sheet, with digits ("45 coins" / "45块"). */
export function priceText(data: GameData, price: number): string {
  const f = renoText(data)?.price;
  if (!f) return String(price);
  return (price === 1 && f.one ? f.one : f.other).replace('{d}', String(price));
}

/**
 * Reading the catalogue counts as an encounter, at most once a day: the list (heading + names of
 * the entries shown) or one entry's sales lines.
 */
export function renoRead(data: GameData, p: LangProgress, what: 'list' | UpgradeId): void {
  const tx = renoText(data);
  if (!tx) return;
  const r = renoOf(p);
  r.read ??= {};
  if (r.read[what] === p.day) return;
  r.read[what] = p.day;
  const texts = what === 'list' ? [tx.title, tx.subtitle, ...catalogue(data, p).map((e) => tx.upgrades[e.def.id].name)] : tx.upgrades[what]?.lines ?? [];
  for (const t of texts) recordEncounter(p.words, textWords(data, t), p.day, t);
}

/** Order an entry. Returns null on success, else a Japanese reason (chrome). Mutates p. */
export function renoOrder(data: GameData, p: LangProgress, id: UpgradeId): string | null {
  const e = catalogue(data, p).find((x) => x.def.id === id);
  if (!e) return 'まだ注文できない品です';
  if (e.status !== 'available') return e.status === 'owned' ? 'もう店にあります' : 'もう注文してあります';
  if (p.town.money < e.def.price) return 'お金が足りません';
  const r = renoOf(p);
  p.town.money -= e.def.price;
  r.orders.push({ id, day: p.day });
  r.spent = r.spent?.day === p.day ? { day: p.day, coins: r.spent.coins + e.def.price } : { day: p.day, coins: e.def.price };
  return null;
}

/** Take back today's order (the money comes back). */
export function renoCancel(data: GameData, p: LangProgress, id: UpgradeId): boolean {
  const r = renoOf(p);
  const i = r.orders.findIndex((o) => o.id === id && o.day === p.day);
  const u = upgradeDef(data, id);
  if (i < 0 || !u) return false;
  r.orders.splice(i, 1);
  const price = upgradePrice(data, u);
  p.town.money += price;
  if (r.spent?.day === p.day) r.spent = { day: p.day, coins: Math.max(0, r.spent.coins - price) };
  return true;
}

/** Coins spent on the catalogue today (for the ledger). */
export function renoSpentToday(p: LangProgress): number {
  return p.reno?.spent?.day === p.day ? p.reno.spent.coins : 0;
}

/** Upgrades that arrived this morning. */
export function arrivedToday(p: LangProgress): UpgradeId[] {
  const owned = p.reno?.owned ?? {};
  return (Object.keys(owned) as UpgradeId[]).filter((id) => owned[id] === p.day);
}

// ---------------------------------------------------------------------------
// Day hooks
// ---------------------------------------------------------------------------

/** Morning: yesterday's orders arrive. Returns Japanese chrome notes. */
export function renoMorning(data: GameData, p: LangProgress): string[] {
  if (!p.reno || !renoShared(data)) return [];
  const r = renoOf(p);
  const due = r.orders.filter((o) => o.day < p.day);
  if (!due.length) return [];
  r.orders = r.orders.filter((o) => o.day >= p.day);
  for (const o of due) r.owned[o.id] = p.day;
  return [due.length === 1 ? '始業前に、注文していた品が届いた。店のどこかが変わったようだ。' : `始業前に、注文していた品が${due.length}つ届いた。店のあちこちが変わったようだ。`];
}

/**
 * After the shop has planned its customers: arrivals (notes on the day's notice) and the extra
 * customers of seats (review orders of words already met, like the planner's template review).
 */
export function renoPlanShop(data: GameData, p: LangProgress, rng: Rng): void {
  const t = p.today;
  if (!t) return;
  t.notes.push(...renoMorning(data, p));
  const n = effectsOf(data, p).customers;
  for (let i = 0; i < n; i++) {
    const o = extraOrder(data, p, rng);
    if (!o) break;
    // Not first (the first customer is already at the counter), spread over the rest of the day.
    const at = Math.min(t.queue.length, 1 + Math.floor(rng() * t.queue.length));
    t.queue.splice(at, 0, o);
  }
}

/** One more review order: a template instance with no unseen word, best for review. */
export function extraOrder(data: GameData, p: LangProgress, rng: Rng): OrderInstance | null {
  const t = p.today;
  if (!t) return null;
  const ctx = { stage: p.stage, available: ingredientsAtStage(data, p.stage), features: featuresAtStage(data, p.stage), rng };
  const templates = data.content.templates.filter((x) => x.stage <= p.stage);
  if (!templates.length) return null;
  const keys = new Set(t.queue.map((q) => q.key));
  const texts = new Set(t.queue.map((q) => q.text));
  let best: { inst: OrderInstance; score: number } | null = null;
  for (let i = 0; i < 30; i++) {
    const inst = instantiateTemplate(data, pick(rng, templates), ctx, 4);
    if (!inst || keys.has(inst.key) || texts.has(inst.text)) continue;
    const ids = textWords(data, inst.text);
    if (ids.some((id) => !p.words[id])) continue;
    const score = ids.reduce((s, id) => s + reviewWeight(p.words[id], p.day), 0) + rng() * 2;
    if (!best || score > best.score) best = { inst, score };
  }
  if (!best) return null;
  const used = new Set(t.queue.map((q) => q.customer));
  const avail = data.content.customers.filter((c) => c.stage <= p.stage);
  const free = avail.filter((c) => !used.has(c.id));
  const c = free.length ? pick(rng, free) : avail.length ? pick(rng, avail) : null;
  return { ...best.inst, customer: c?.id ?? best.inst.customer };
}

/** Cap of portions kept overnight for a market good (0 = not kept). */
export function carryCap(data: GameData, p: LangProgress, ing: IngredientId): number {
  const sh = renoShared(data);
  if (!sh) return 0;
  const dry = sh.dryGoods.includes(ing);
  let cap = 0;
  for (const c of effectsOf(data, p).carry) if (c.goods === 'all' || (c.goods === 'dry') === dry) cap = Math.max(cap, c.cap);
  return cap;
}

/** Market goods kept from earlier days (portions), available for today. */
export function renoCarry(data: GameData, p: LangProgress): Partial<Record<IngredientId, number>> {
  const carry = p.reno?.carry ?? {};
  const out: Partial<Record<IngredientId, number>> = {};
  for (const [ing, n] of Object.entries(carry) as [IngredientId, number][]) {
    const kept = Math.min(n, carryCap(data, p, ing));
    if (kept > 0) out[ing] = kept;
  }
  return out;
}

/** After the town is planned: with the cart there is a delivery every day once they have opened. */
export function renoPlanTown(data: GameData, p: LangProgress, rng: Rng, td: TownDayState): void {
  if (!townOf(data) || !effectsOf(data, p).deliveryDaily) return;
  if (p.town.unlocked.delivery === undefined || td.segments.includes('delivery')) return;
  const dd = planDelivery(data, p, rng);
  if (!dd) return;
  td.delivery = dd;
  td.segments.push('delivery');
}

/** Extra coins on a perfect delivery's tip. */
export function renoTipBonus(data: GameData, p: LangProgress): number {
  return effectsOf(data, p).tip;
}

/**
 * After a cup has been served (and the story had its say): coin and reputation bonuses, and now
 * and then a remark about the shop. `talked` = a regular already added small talk to the reaction.
 */
export function renoAfterServe(data: GameData, p: LangProgress, out: ServeOutcome | null, rng: Rng, talked: boolean): void {
  const t = p.today;
  if (!out || !t || !p.reno || !renoShared(data)) return;
  const order = t.queue[t.index];
  const res = t.results[t.results.length - 1];
  if (!order || !res || out.evaluation.outcome !== 'perfect') return;
  const e = effectsOf(data, p);
  if (townOf(data)) {
    let coins = 0;
    if (order.rule.temp === 'hot') coins += e.coinHot;
    if (order.rule.temp === 'cold') coins += e.coinCold;
    if ((order.rule.require ?? []).some((r) => r.min !== undefined && r.min === r.max)) coins += e.coinExact;
    p.town.money += coins;
  }
  if (order.returning && e.repReturning) {
    p.reputation += e.repReturning;
    res.repDelta += e.repReturning;
    out.repDelta += e.repReturning;
  }
  if (!talked && !order.key.startsWith('story:')) remark(data, p, rng, res, out, order);
}

/** A customer notices something in the shop (target language, appended to the reaction). */
function remark(data: GameData, p: LangProgress, rng: Rng, res: { reaction: string }, out: ServeOutcome, order: OrderInstance): void {
  const sh = renoShared(data)!;
  const tx = renoText(data);
  const r = renoOf(p);
  if (!tx) return;
  if (r.remarkDay?.day !== p.day) r.remarkDay = { day: p.day, n: 0 };
  if (r.remarkDay.n >= 2) return;
  const cands = sh.upgrades.filter((u) => u.effects.remarks && r.owned[u.id] !== undefined && tx.upgrades[u.id]?.remarks?.length && p.day - (r.remarks[u.id] ?? -99) >= 3);
  if (!cands.length) return;
  const fresh = cands.filter((u) => (r.owned[u.id] ?? 0) >= p.day - 1);
  const chance = fresh.length ? sh.remarkChance.fresh : sh.remarkChance.usual;
  if (rng() >= chance) return;
  const u = fresh.length ? pick(rng, fresh) : pick(rng, cands);
  // Only what fits the moment (no "very warm here" right after an iced tea).
  const temp = order.rule.temp;
  const lines = tx.upgrades[u.id].remarks!.filter((x) => typeof x === 'string' || !temp || !x.notWhen.includes(temp)).map(remarkText);
  const text = lines.length ? chooseText(data, p, lines, rng, 2) : null;
  if (!text) return;
  r.remarks[u.id] = p.day;
  r.remarkDay.n++;
  res.reaction = `${res.reaction} ${text}`;
  out.reaction = { ...out.reaction, text: res.reaction };
  recordEncounter(p.words, textWords(data, text), p.day, text);
}

/** End of the day (before the ledger is written): signboard reputation, stock kept overnight. */
export function renoEndDay(data: GameData, p: LangProgress): void {
  if (!p.reno || !renoShared(data)) return;
  const r = renoOf(p);
  const e = effectsOf(data, p);
  if (e.repDay && p.today?.results.some((x) => x.outcome === 'perfect')) p.reputation += e.repDay;
  // Today's tracked stock (market days) is what is left; keep what the shelves / cellar / ice box hold.
  const stock = p.townDay?.stock ?? {};
  for (const [ing, left] of Object.entries(stock) as [IngredientId, number][]) {
    const kept = Math.min(left, carryCap(data, p, ing));
    if (kept > 0) r.carry[ing] = kept;
    else delete r.carry[ing];
  }
  for (const ing of Object.keys(r.carry) as IngredientId[]) if (carryCap(data, p, ing) <= 0) delete r.carry[ing];
}
