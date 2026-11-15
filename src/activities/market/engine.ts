/**
 * Market purchasing. The day's shop queue decides what is short; the shopping note (target
 * language) says what to buy; stalls show target-language price tags; vendors talk. The only
 * feedback is the vendors' lines, the purse and — later that day — the shop's stock.
 */
import { planKnobs } from '../../core/difficulty';
import { ingredientWordId, ingredientsAtStage, wordMarkup, type GameData } from '../../core/gamedata';
import { pick, shuffle, type Rng } from '../../core/rng';
import type { LangProgress } from '../../core/save';
import { recordEncounter, recordLapse, recordSuccess } from '../../core/srs';
import type { Face, IngredientId, OrderInstance } from '../../core/types';
import type {
  MarketDay,
  MarketFeature,
  MarketLevel,
  MarketShared,
  NoteLine,
  Offer,
  StallDay,
  VariantId,
  VendorLineKind,
} from '../../core/townTypes';
import { chooseText, colourMarkup, fill, formsText, moneyText, textWords, townOf, type Town } from '../town/text';
import { bargainTotal, computeNeeds, evaluatePayment, goodDef, offerPrice, portionsFromBasket, stockFromMarket, lineCovered, unitsFor, type PaymentKind } from './rules';

/** Purchases above this total are not offered (number words exist up to 100). */
export const MAX_TOTAL = 100;
export const MAX_UNITS = 10;

export function marketLevel(m: MarketShared, runs: number): MarketLevel {
  const lv = [...m.levels].sort((a, b) => a.level - b.level);
  let cur = lv[0];
  for (const l of lv) if (runs >= l.minRuns) cur = l;
  return cur;
}

export function marketFeatures(m: MarketShared, level: number): MarketFeature[] {
  const f = new Set<MarketFeature>();
  for (const l of m.levels) if (l.level <= level) l.features.forEach((x) => f.add(x));
  return [...f];
}

/** Market goods that can be bought today: on the shop shelf and with text in this language. */
export function marketGoods(data: GameData, town: Town, stage: number): IngredientId[] {
  const shelf = new Set(ingredientsAtStage(data, stage));
  return town.shared.market.goods
    .map((g) => g.ingredient)
    .filter((ing) => shelf.has(ing) && town.text.market.goods.some((t) => t.ingredient === ing));
}

function goodText(town: Town, ing: IngredientId) {
  return town.text.market.goods.find((g) => g.ingredient === ing)!;
}

/** "{n} bunches of fresh mint" for a good / variant (base phrase when no variant). */
export function qtyText(town: Town, ing: IngredientId, variant: VariantId | undefined, n: number): string | null {
  const t = town.text.market.goods.find((g) => g.ingredient === ing);
  return t ? formsText(town, t.qty[variant ?? 'base'], n) : null;
}

export function goodName(town: Town, ing: IngredientId): string {
  return goodText(town, ing).name;
}

export function stallRef(data: GameData, town: Town, stallId: string): string {
  const s = town.shared.market.stalls.find((x) => x.id === stallId)!;
  return town.text.market.stallRef.replace('{c}', colourMarkup(data, town, s.colour));
}

/** Price tag text with digits, e.g. "3 coins each" / "3块一个". */
export function priceTag(town: Town, ing: IngredientId, price: number): string {
  const tm = town.text.market.tagMoney;
  const money = (price === 1 && tm.one ? tm.one : tm.other).replace('{d}', String(price));
  return goodText(town, ing).per.replace('{price}', money);
}

/** Unit price spoken with number words. */
export function priceSpoken(town: Town, ing: IngredientId, price: number): string | null {
  const m = moneyText(town, price);
  return m ? goodText(town, ing).per.replace('{price}', m) : null;
}

export function variantText(town: Town, v: VariantId): string {
  return town.text.market.variantWords[v];
}

// ---------------------------------------------------------------------------
// Planning
// ---------------------------------------------------------------------------

/**
 * Plan today's market from the shop queue. Marks newly available features as seen (they are
 * introduced the first time they can be). Returns null when the content has no market.
 */
export function planMarket(
  data: GameData,
  p: LangProgress,
  queue: Pick<OrderInstance, 'rule'>[],
  rng: Rng,
  /** Portions already in the shop (kept overnight, see renovation): the note asks only for the rest. */
  have: Partial<Record<IngredientId, number>> = {},
): MarketDay | null {
  const town = townOf(data);
  if (!town) return null;
  const m = town.shared.market;
  const level = marketLevel(m, p.town.marketRuns);
  const features = marketFeatures(m, level.level);
  const isNew = (f: MarketFeature) => features.includes(f) && !p.town.marketSeen.includes(f);
  const want = (f: MarketFeature, chance: number) => features.includes(f) && (isNew(f) || rng() < chance);
  const goods = marketGoods(data, town, p.stage);
  if (!goods.length) return null;

  // 1. What is short today
  const needs = computeNeeds(queue, goods);
  for (const [ing, n] of [...needs]) {
    const rest = n - (have[ing] ?? 0);
    if (rest > 0) needs.set(ing, rest);
    else needs.delete(ing);
  }
  let picks = [...needs.entries()].sort((a, b) => b[1] - a[1] || (rng() < 0.5 ? -1 : 1)).slice(0, level.maxItems);
  if (!picks.length) picks = [[pick(rng, goods), 2]];
  // Prefer a multi-stall good when a stall event is to be introduced.
  const multi = (ing: IngredientId) => (goodDef(m, ing)?.stalls.length ?? 0) >= 2;

  // 2. Note lines (variants from the 'variants' feature)
  const variantsOn = features.includes('variants');
  let forcedVariant = isNew('variants');
  const lines: NoteLine[] = [];
  for (const [ing, portions] of picks) {
    const g = goodDef(m, ing)!;
    let variant: VariantId | undefined;
    if (variantsOn && g.variants && (forcedVariant || rng() < 0.5)) {
      variant = g.variants[0] === 'fresh' ? 'fresh' : pick(rng, g.variants);
      forcedVariant = false;
    }
    const base = variantsOn && g.variants ? g.variants[0] : undefined;
    let units = unitsFor(m, ing, portions, variant ?? base);
    let qty = qtyText(town, ing, variant, units);
    while (!qty && units > 1) qty = qtyText(town, ing, variant, --units);
    const text = qty ? fill(town.text.market.noteLine, { qty }) : null;
    if (!text) continue;
    lines.push({ good: ing, variant, units, portions, text });
  }

  // 3. Stalls and prices
  const stalls: StallDay[] = m.stalls.map((s) => ({ id: s.id, offers: [], soldOut: [], cheap: [] }));
  const stallOf = (id: string) => stalls.find((s) => s.id === id)!;
  for (const ing of goods) {
    const g = goodDef(m, ing)!;
    g.stalls.forEach((sid, i) => {
      const st = stallOf(sid);
      if (!st) return;
      const vs: (VariantId | undefined)[] = variantsOn && g.variants ? [...g.variants] : [undefined];
      const jitter = pick(rng, [-1, 0, 0, 1]) + (i > 0 ? 1 : 0);
      for (const v of vs) st.offers.push({ id: `${sid}:${ing}:${v ?? 'base'}`, good: ing, variant: v, price: offerPrice(m, ing, v, jitter) });
    });
  }
  const tips: string[] = [];

  // 4. Events
  const lineGoods = lines.map((l) => l.good);
  if (want('soldOut', 0.4)) {
    const cand = lineGoods.filter(multi);
    if (cand.length) {
      const ing = pick(rng, cand);
      const home = stallOf(goodDef(m, ing)!.stalls[0]);
      home.offers = home.offers.filter((o) => o.good !== ing);
      home.soldOut.push(ing);
      if (!p.town.marketSeen.includes('soldOut')) p.town.marketSeen.push('soldOut');
    }
  }
  if (want('cheaper', 0.4)) {
    const sold = new Set(stalls.flatMap((s) => s.soldOut));
    const cand = lineGoods.filter((g) => multi(g) && !sold.has(g));
    if (cand.length) {
      const ing = pick(rng, cand);
      const g = goodDef(m, ing)!;
      const alt = stallOf(g.stalls[1]);
      const homeOffers = stallOf(g.stalls[0]).offers.filter((o) => o.good === ing);
      for (const o of alt.offers.filter((x) => x.good === ing)) {
        const h = homeOffers.find((x) => x.variant === o.variant);
        o.price = Math.max(1, (h?.price ?? o.price) - 2);
        if (h && h.price - o.price < 2) h.price = o.price + 2;
      }
      alt.cheap.push(ing);
      const tip = fill(pick(rng, town.text.market.cheaperNotes), { g: goodName(town, ing), stall: stallRef(data, town, alt.id) });
      if (tip) tips.push(tip);
      if (!p.town.marketSeen.includes('cheaper')) p.town.marketSeen.push('cheaper');
    }
  }
  for (const f of features) if (!p.town.marketSeen.includes(f) && f !== 'soldOut' && f !== 'cheaper') p.town.marketSeen.push(f);

  // 5. Never ask for more than the purse can pay, even at the dearest stall that has it (a high start begins
  //    with the market's start money and a long note; a player short of coins gets a shorter note).
  const dearest = (l: NoteLine) =>
    Math.max(0, ...stalls.flatMap((st) => st.offers.filter((o) => o.good === l.good && o.variant === (l.variant ?? (variantsOn && goodDef(m, l.good)?.variants ? goodDef(m, l.good)!.variants![0] : undefined))).map((o) => o.price)));
  const costOf = () => lines.reduce((a, l) => a + l.units * dearest(l), 0);
  while (lines.length > 1 && costOf() > p.town.money) lines.pop();
  for (const l of lines) {
    const each = dearest(l);
    if (each > 0 && l.units * each > p.town.money && l.units > 1) {
      let u = Math.max(1, Math.floor(p.town.money / each));
      let qty = qtyText(town, l.good, l.variant, u);
      while (!qty && u > 1) qty = qtyText(town, l.good, l.variant, --u);
      const text = qty ? fill(town.text.market.noteLine, { qty }) : null;
      if (text) Object.assign(l, { units: u, text, portions: Math.min(l.portions, u * (goodDef(m, l.good)?.portionsPerUnit ?? 1)) });
    }
  }

  const title = chooseText(data, p, town.text.market.noteTitles, rng, 3) ?? town.text.market.noteTitles[0];
  const md: MarketDay = {
    level: level.level,
    features,
    title,
    lines,
    tips,
    stalls,
    stall: null,
    talk: [],
    selected: null,
    pending: null,
    basket: [],
    spent: 0,
    done: false,
    visited: [],
  };
  // Reading the note counts as an encounter.
  for (const t of [title, ...lines.map((l) => l.text), ...tips]) recordEncounter(p.words, textWords(data, t), p.day, t);
  return md;
}

// ---------------------------------------------------------------------------
// Vendor lines
// ---------------------------------------------------------------------------

function vendorLine(
  data: GameData,
  p: LangProgress,
  town: Town,
  md: MarketDay,
  kind: VendorLineKind,
  values: Record<string, string | null | undefined>,
  rng: Rng,
): { text: string; face: Face } | null {
  const cands = town.text.market.lines.filter((l) => l.kind === kind && l.level <= md.level);
  const filled = cands.map((l) => ({ l, text: fill(l.text, values) })).filter((x): x is { l: (typeof cands)[0]; text: string } => !!x.text);
  if (!filled.length) return null;
  const text = chooseText(data, p, filled.map((f) => f.text), rng)!;
  return { text, face: filled.find((f) => f.text === text)!.l.face };
}

function say(data: GameData, p: LangProgress, md: MarketDay, line: { text: string; face: Face } | null, audioOnly = false) {
  if (!line) return;
  md.talk.push({ who: 'vendor', text: line.text, face: line.face, audioOnly: audioOnly || undefined });
  recordEncounter(p.words, textWords(data, line.text), p.day, line.text);
}

function md0(p: LangProgress): MarketDay | null {
  const md = p.townDay?.market;
  return md && !md.done ? md : null;
}

export function findOffer(md: MarketDay, offerId: string): Offer | undefined {
  for (const s of md.stalls) for (const o of s.offers) if (o.id === offerId) return o;
  return undefined;
}

/** Walk up to a stall: the vendor greets, mentions sold-out goods (naming another stall) and bargains. */
export function openStall(data: GameData, p: LangProgress, stallId: string, rng: Rng): void {
  const town = townOf(data);
  const md = md0(p);
  if (!town || !md) return;
  const st = md.stalls.find((s) => s.id === stallId);
  if (!st) return;
  md.stall = stallId;
  md.selected = null;
  md.pending = null;
  md.talk = [];
  say(data, p, md, vendorLine(data, p, town, md, 'greet', {}, rng));
  for (const ing of st.cheap) say(data, p, md, vendorLine(data, p, town, md, 'cheapHere', { g: goodName(town, ing) }, rng));
  for (const ing of st.soldOut) {
    const alt = md.stalls.find((s) => s.id !== st.id && s.offers.some((o) => o.good === ing));
    const line = alt
      ? vendorLine(data, p, town, md, 'soldOutTip', { g: goodName(town, ing), stall: stallRef(data, town, alt.id) }, rng)
      : null;
    say(data, p, md, line ?? vendorLine(data, p, town, md, 'soldOut', { g: goodName(town, ing) }, rng));
  }
  // Price tags are read once per stall per day.
  if (!md.visited.includes(stallId)) {
    md.visited.push(stallId);
    for (const o of st.offers) {
      const parts = [goodName(town, o.good), priceTag(town, o.good, o.price), ...(o.variant ? [variantText(town, o.variant)] : [])];
      for (const t of parts) recordEncounter(p.words, textWords(data, t), p.day, t);
    }
  }
}

export function leaveStall(p: LangProgress): void {
  const md = md0(p);
  if (!md) return;
  md.stall = null;
  md.selected = null;
  md.pending = null;
  md.talk = [];
}

/** Point at an offer; the vendor asks how many. */
export function selectOffer(data: GameData, p: LangProgress, offerId: string, rng: Rng): void {
  const town = townOf(data);
  const md = md0(p);
  if (!town || !md || md.pending) return;
  const o = findOffer(md, offerId);
  if (!o) return;
  md.selected = offerId;
  say(data, p, md, vendorLine(data, p, town, md, 'askQty', { g: goodName(town, o.good) }, rng));
}

export function maxUnits(o: Offer): number {
  return Math.max(1, Math.min(MAX_UNITS, Math.floor(MAX_TOTAL / o.price)));
}

/** Ask for `units` of the selected offer; the vendor quotes the total. */
export function orderUnits(data: GameData, p: LangProgress, units: number, rng: Rng): boolean {
  const town = townOf(data);
  const md = md0(p);
  if (!town || !md || !md.selected || md.pending) return false;
  const o = findOffer(md, md.selected);
  if (!o || units < 1 || units > maxUnits(o)) return false;
  const total = units * o.price;
  const qty = qtyText(town, o.good, o.variant, units);
  const line = vendorLine(data, p, town, md, 'quote', { qty, total: moneyText(town, total) }, rng);
  if (!line) return false;
  md.talk.push({ who: 'you', text: `×${units}` });
  const audio = md.features.includes('audioOnly') && rng() < 0.4 * Math.min(2, p.difficulty ? planKnobs(data, p).audio : 1);
  say(data, p, md, line, audio);
  md.pending = { offer: o.id, units, total, bargained: false };
  return true;
}

export function canBargain(md: MarketDay): boolean {
  return md.features.includes('bargain') && !!md.pending && !md.pending.bargained;
}

export function bargain(data: GameData, p: LangProgress, rng: Rng): void {
  const town = townOf(data);
  const md = md0(p);
  if (!town || !md || !md.pending || !canBargain(md)) return;
  const accept = rng() < 0.6;
  const total = bargainTotal(md.pending.total, accept);
  md.pending.bargained = true;
  md.talk.push({ who: 'you', text: '…?' });
  const kind = total < md.pending.total ? 'bargainYes' : 'bargainNo';
  md.pending.total = total;
  say(data, p, md, vendorLine(data, p, town, md, kind, { total: moneyText(town, total) }, rng));
}

/** Number lexicon ids in a text (for implicating mistakes). */
function numberWordIds(data: GameData, town: Town, text: string): string[] {
  const nums = new Set<string>([...Object.values(data.content.numbers)]);
  for (const t of Object.values(town.text.numberText)) textWords(data, t).forEach((id) => nums.add(id));
  return textWords(data, text).filter((id) => nums.has(id));
}

export interface PayOutcome {
  kind: PaymentKind;
  accepted: boolean;
}

/** Hand over `amount` coins for the pending purchase. */
export function pay(data: GameData, p: LangProgress, amount: number, rng: Rng): PayOutcome | null {
  const town = townOf(data);
  const md = md0(p);
  if (!town || !md || !md.pending || amount <= 0 || amount > p.town.money) return null;
  const pend = md.pending;
  const o = findOffer(md, pend.offer)!;
  const res = evaluatePayment(pend.total, amount, { change: md.features.includes('change'), changeLimit: town.shared.market.changeLimit });
  md.talk.push({ who: 'you', text: `🪙${amount}` });
  const quote = [...md.talk].reverse().find((t) => t.who === 'vendor')?.text ?? '';
  const values = { total: moneyText(town, pend.total), change: moneyText(town, res.change) };
  const kind: VendorLineKind =
    res.kind === 'exact' ? 'thanks' : res.kind === 'overpaid' ? 'overpaid' : res.kind === 'change' ? 'change' : res.kind === 'not_enough' ? 'notEnough' : 'noChange';
  say(data, p, md, vendorLine(data, p, town, md, kind, values, rng));
  // Paying right confirms the price words; paying wrong points at them.
  if (res.kind === 'exact' || res.kind === 'change') textWords(data, quote).forEach((id) => recordSuccess(p.words, id, p.day));
  else if (res.kind === 'overpaid' || res.kind === 'not_enough') numberWordIds(data, town, quote).forEach((id) => recordLapse(p.words, id, p.day));
  if (res.accepted) {
    p.town.money -= res.spent;
    md.spent += res.spent;
    md.basket.push({ offer: o.id, good: o.good, variant: o.variant, units: pend.units, total: pend.total, paid: res.spent });
    md.pending = null;
    md.selected = null;
    md.talk.forEach((t) => delete t.audioOnly);
  }
  return { kind: res.kind, accepted: res.accepted };
}

export function cancelPurchase(p: LangProgress): void {
  const md = md0(p);
  if (!md) return;
  md.pending = null;
  md.selected = null;
  md.talk.forEach((t) => delete t.audioOnly);
}

/**
 * Leave the market. Mutates p. By the trip's mode:
 * - visit (before opening): what was bought goes on today's shelf (the goods the note tracks);
 * - order (during working hours): it is on its way — it reaches the shop when the next customer comes in
 *   (activities/day.ts); with nothing ordered, the delivery fee is given back;
 * - evening (after closing): it is kept in the back room for tomorrow (`town.pantry`).
 * The first trip of the day is the day's market run (levels, the note's words).
 */
export function finishMarket(data: GameData, p: LangProgress): void {
  const town = townOf(data);
  const md = md0(p);
  if (!town || !md || !p.townDay) return;
  const td = p.townDay;
  const mode = md.mode ?? 'visit';
  const got = portionsFromBasket(town.shared.market, md.basket);
  const first = !(md.trips ?? 0);
  if (mode === 'visit') {
    const stock = stockFromMarket(town.shared.market, md.lines, md.basket);
    // Bought portions join what the shop already had (0, or goods kept overnight / bought last night).
    const merged = { ...td.stock };
    for (const [ing, n] of Object.entries(stock) as [IngredientId, number][]) merged[ing] = (merged[ing] ?? 0) + n;
    td.stock = merged;
    for (const l of md.lines) {
      const ids = textWords(data, l.text);
      if (lineCovered(l, merged)) ids.forEach((id) => recordSuccess(p.words, id, p.day));
      // Implicate the good, its number and unit words (all words of the line except glue) — on the first trip only.
      else if (first) ids.forEach((id) => recordLapse(p.words, id, p.day));
    }
  } else if (mode === 'order') {
    if (!md.basket.length) {
      p.town.money += md.fee ?? 0; // nothing ordered: the errand boy is not sent
    } else {
      const stock: Partial<Record<IngredientId, number>> = {};
      for (const [ing, n] of got) stock[ing] = Math.floor(n);
      (td.incoming ??= []).push({
        stock,
        at: p.today?.index ?? 0,
        fee: md.fee ?? 0,
        goods: md.basket.map((b) => ({ good: b.good, units: b.units, ...(b.variant ? { variant: b.variant } : {}) })),
      });
      td.fees = (td.fees ?? 0) + (md.fee ?? 0);
      md.spent += md.fee ?? 0;
      for (const l of md.lines) if (got.has(l.good)) textWords(data, l.text).forEach((id) => recordSuccess(p.words, id, p.day));
    }
  } else {
    const pantry = (p.town.pantry ??= {});
    for (const [ing, n] of got) pantry[ing] = (pantry[ing] ?? 0) + Math.floor(n);
  }
  md.fee = 0;
  md.basket = [];
  md.done = true;
  md.stall = null;
  md.pending = null;
  md.selected = null;
  md.talk = [];
  md.trips = (md.trips ?? 0) + 1;
  if (first) {
    p.town.marketRuns++;
    p.town.lastDay.market = p.day;
  }
}

/** Ingredient word markup (for stock reactions in the shop). */
export function ingredientMarkup(data: GameData, ing: IngredientId): string | null {
  const id = ingredientWordId(data, ing);
  return id ? wordMarkup(data, id) : null;
}

/** A solver used by the simulator, tests and the validator: buys every note line correctly. */
export function solveMarket(data: GameData, p: LangProgress, rng: Rng, opts: { shortBy?: number } = {}): void {
  const town = townOf(data);
  const md = md0(p);
  if (!town || !md) return;
  for (const l of md.lines) {
    const stalls = shuffle(rng, md.stalls).sort((a, b) => Number(b.cheap.includes(l.good)) - Number(a.cheap.includes(l.good)));
    for (const st of stalls) {
      const g = goodDef(town.shared.market, l.good)!;
      const wantVariant = l.variant ?? (md.features.includes('variants') && g.variants ? g.variants[0] : undefined);
      const o = st.offers.find((x) => x.good === l.good && x.variant === wantVariant);
      if (!o) continue;
      openStall(data, p, st.id, rng);
      selectOffer(data, p, o.id, rng);
      const units = Math.max(1, l.units - (opts.shortBy ?? 0));
      if (!orderUnits(data, p, Math.min(units, maxUnits(o)), rng)) break;
      if (md.pending && md.pending.total <= p.town.money) pay(data, p, md.pending.total, rng);
      else cancelPurchase(p);
      leaveStall(p);
      break;
    }
  }
}
