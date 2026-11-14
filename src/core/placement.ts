/**
 * Placement check (腕だめし): a few quick orders of rising level, answered the in-game way —
 * a customer says what they want, three cups stand on the counter (labelled like the shelf, with
 * the target-language ingredient / temperature / method words), and the player hands over one,
 * or shrugs (わからない). No Japanese quiz text: only the order and the labelled cups.
 *
 * Items are authored curriculum orders whose words are all at or below the item's exam level
 * (shelf labels, temperature and method words are on the cups, so they do not count) and which
 * contain at least one word of exactly that level. Wrong cups are small mutations of a correct
 * one (a quantity off by one, the other temperature, a missing / swapped / forbidden ingredient,
 * another method), each checked to be wrong by the real order rules.
 *
 * The suggestion is the highest level such that every level up to it was answered completely
 * right — conservative on purpose: starting too high skips teaching, starting too low only costs
 * a few easy days (and the level can be raised any time).
 */
import { ingredientWordId, type GameData } from './gamedata';
import { makeRng, shuffle, type Rng } from './rng';
import { tokenIds } from './tokenize';
import type { AuthoredOrder, Brew, IngredientId, OrderRule } from './types';
import { evaluateBrew, witnessBrew } from '../activities/shop/rules';
import { startOptions, wordLevel } from './difficulty';

export const ITEMS_PER_LEVEL = 2;

export interface PlacementItem {
  level: number;
  orderId: string;
  text: string;
  customer: string;
  cups: Brew[];
  answer: number;
}

/** Words written on the cups (ingredient labels, temperature, method): not tested by the order text. */
function labelWords(data: GameData): Set<string> {
  const s = new Set<string>();
  for (const i of data.shared.ingredients) {
    const id = ingredientWordId(data, i.id);
    if (id) s.add(id);
  }
  Object.values(data.content.temperatureWords).forEach((id) => s.add(id));
  Object.values(data.content.methodWords).forEach((id) => s.add(id));
  return s;
}

function ruleOf(data: GameData, o: AuthoredOrder): OrderRule | undefined {
  return o.rule ?? (o.recipe ? data.recipes.get(o.recipe)?.rule : undefined);
}

const key = (b: Brew) => JSON.stringify([Object.entries(b.counts).filter(([, n]) => n).sort(), b.temp, b.method]);

/** Wrong cups near a right one. */
export function distractors(data: GameData, rule: OrderRule, right: Brew, rng: Rng): Brew[] {
  const all = data.shared.ingredients.map((i) => i.id).filter((id) => !data.ing.get(id)?.neutral);
  const out: Brew[] = [];
  const clone = (): Brew => ({ counts: { ...right.counts }, temp: right.temp, method: right.method });
  const req = (rule.require ?? []).map((r) => r.ing);
  for (const ing of req) {
    const n = right.counts[ing] ?? 0;
    const max = data.ing.get(ing)?.maxCount ?? 5;
    if (n + 1 <= max) {
      const b = clone();
      b.counts[ing] = n + 1;
      out.push(b);
    }
    if (n > 1) {
      const b = clone();
      b.counts[ing] = n - 1;
      out.push(b);
    }
    const b = clone();
    delete b.counts[ing];
    const other = all.filter((x) => !(x in right.counts) && !req.includes(x));
    if (other.length) b.counts[other[Math.floor(rng() * other.length)]] = n || 1;
    out.push(b);
  }
  if (rule.temp) out.push({ ...clone(), temp: rule.temp === 'hot' ? 'cold' : 'hot' });
  if (rule.method) out.push({ ...clone(), method: rule.method === 'steep' ? 'boil' : 'steep' });
  for (const f of rule.forbid ?? []) {
    const b = clone();
    b.counts[f] = 1;
    out.push(b);
  }
  if (!out.length) {
    const b = clone();
    const other = all.find((x) => !(x in right.counts));
    if (other) b.counts[other] = 2;
    out.push(b);
  }
  const seen = new Set([key(right)]);
  return shuffle(rng, out).filter((b) => {
    const k = key(b);
    if (seen.has(k) || Object.values(b.counts).every((n) => !n)) return false;
    seen.add(k);
    return evaluateBrew(rule, b, data.ing).outcome !== 'perfect';
  });
}

/** Candidate orders for a level. */
export function levelCandidates(data: GameData, level: number): AuthoredOrder[] {
  const labels = labelWords(data);
  return data.content.orders.filter((o) => {
    if (!ruleOf(data, o)) return false;
    const ids = tokenIds(data.tokens(o.text)).filter((id) => !labels.has(id));
    if (!ids.length) return false;
    const lv = ids.map((id) => {
      const e = data.lex.byId.get(id);
      return e ? wordLevel(data.lang, e) : 0;
    });
    return lv.every((l) => l > 0 && l <= level) && lv.some((l) => l === level);
  });
}

/** The check: ITEMS_PER_LEVEL orders per offered starting level, easiest level first. */
export function placementItems(data: GameData, seed = Date.now()): PlacementItem[] {
  const rng = makeRng(seed);
  const levels = startOptions(data)
    .filter((o) => o.available && o.level > 0)
    .map((o) => o.level);
  const shelf = new Set<IngredientId>(data.shared.ingredients.map((i) => i.id));
  const items: PlacementItem[] = [];
  for (const level of levels) {
    let n = 0;
    for (const o of shuffle(rng, levelCandidates(data, level))) {
      if (n >= ITEMS_PER_LEVEL) break;
      const rule = ruleOf(data, o)!;
      const right = witnessBrew(rule, shelf, data.ing);
      if (!right) continue;
      const wrong = distractors(data, rule, right, rng).slice(0, 2);
      if (wrong.length < 2) continue;
      const cups = shuffle(rng, [right, ...wrong]);
      items.push({ level, orderId: o.id, text: o.text, customer: o.customer ?? '', cups, answer: cups.indexOf(right) });
      n++;
    }
  }
  return items;
}

export interface PlacementResult {
  /** Suggested starting level (0 = ゼロから). */
  level: number;
  perLevel: { level: number; correct: number; total: number }[];
}

/** answers[i] = index of the cup handed over for item i, or null for わからない. */
export function placementSuggestion(items: PlacementItem[], answers: (number | null)[]): PlacementResult {
  const by = new Map<number, { level: number; correct: number; total: number }>();
  items.forEach((it, i) => {
    const r = by.get(it.level) ?? { level: it.level, correct: 0, total: 0 };
    r.total++;
    if (answers[i] === it.answer) r.correct++;
    by.set(it.level, r);
  });
  const perLevel = [...by.values()].sort((a, b) => a.level - b.level);
  let level = 0;
  for (const r of perLevel) {
    if (r.total > 0 && r.correct === r.total) level = r.level;
    else break;
  }
  return { level, perLevel };
}
