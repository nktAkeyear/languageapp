import { featuresAtStage, ingredientsAtStage, plain, type GameData } from '../../core/gamedata';
import { pick, shuffle, type Rng } from '../../core/rng';
import type { LangProgress } from '../../core/save';
import { reviewWeight } from '../../core/srs';
import { tokenIds } from '../../core/tokenize';
import type { OrderInstance } from '../../core/types';
import { authoredInstance, instantiateTemplate } from './templates';
import { planKnobs } from '../../core/difficulty';

/** Template orders may introduce at most this many unseen words. */
export const MAX_NEW_PER_TEMPLATE_ORDER = 1;
/** Authored (curriculum) orders may introduce at most this many unseen words. */
export const MAX_NEW_PER_AUTHORED_ORDER = 3;

export interface DayPlan {
  queue: OrderInstance[];
  newWords: string[];
}

export function orderWordIds(data: GameData, inst: Pick<OrderInstance, 'text'>): string[] {
  return tokenIds(data.tokens(inst.text));
}

/**
 * Choose today's customers.
 * 1. Returning customers (failed earlier) whose return day has come.
 * 2. Authored orders of unlocked stages not yet served perfectly, in curriculum order,
 *    within the day's new-word budget.
 * 3. Template instances scored by how many due / weak words they review, allowing at most
 *    one unseen word each, so review never runs out.
 */
export function planDay(data: GameData, p: LangProgress, rng: Rng): DayPlan {
  // レベル設定 / 自動調整 (core/difficulty.ts): without a difficulty state these are the stage's own values.
  const k = planKnobs(data, p);
  const N = k.customers;
  const budget = k.budget;
  const known = (id: string) => !!p.words[id];
  const dayNew = new Set<string>();
  const newOf = (inst: OrderInstance) => orderWordIds(data, inst).filter((id) => !known(id) && !dayNew.has(id));
  const keys = new Set<string>();
  const texts = new Set<string>(p.returns.map((r) => plain(r.instance.text)));

  // 1. returning customers
  const returning: OrderInstance[] = [];
  const maxReturns = Math.max(1, Math.floor(N / 2));
  for (const r of p.returns) {
    if (returning.length >= maxReturns) break;
    if (r.day <= p.day && !keys.has(r.instance.key)) {
      returning.push({ ...r.instance, returning: true });
      keys.add(r.instance.key);
    }
  }
  const slots = N - returning.length;

  // 2. authored curriculum
  const authored: OrderInstance[] = [];
  const pendingReturnKeys = new Set(p.returns.map((r) => r.instance.key));
  const candidates = data.content.orders
    .filter((o) => o.stage <= p.stage && !p.orders[o.id]?.perfect && !pendingReturnKeys.has(o.id))
    .sort((a, b) => a.stage - b.stage || (a.seq ?? 0) - (b.seq ?? 0));
  // A minimum share of review orders (pace ゆっくり / a struggling player); 0 = curriculum may fill the day.
  const maxAuthored = k.reviewShare > 0 ? Math.max(1, Math.round(slots * (1 - k.reviewShare))) : slots;
  for (const o of candidates) {
    if (authored.length >= maxAuthored) break;
    const inst = authoredInstance(data, o);
    const fresh = newOf(inst);
    if (fresh.length > MAX_NEW_PER_AUTHORED_ORDER && authored.length > 0) continue;
    if (dayNew.size + fresh.length > budget && authored.length > 0) continue;
    fresh.forEach((w) => dayNew.add(w));
    authored.push(inst);
    keys.add(inst.key);
    texts.add(plain(inst.text));
  }

  // 3. template review
  const ctx = {
    stage: p.stage,
    available: ingredientsAtStage(data, p.stage),
    features: featuresAtStage(data, p.stage),
    rng,
    audio: k.audio,
  };
  const templates = data.content.templates.filter((t) => t.stage <= p.stage);
  const templ: OrderInstance[] = [];
  const usedTemplates = new Map<string, number>();
  while (authored.length + templ.length < slots && templates.length) {
    let best: { inst: OrderInstance; score: number; fresh: string[] } | null = null;
    for (let i = 0; i < 30; i++) {
      const tpl = pick(rng, templates);
      const inst = instantiateTemplate(data, tpl, ctx, 4);
      if (!inst || keys.has(inst.key) || texts.has(plain(inst.text))) continue;
      // Templates are judged against words known *before* today, because they may be
      // placed ahead of the authored order that introduces a word.
      const fresh = orderWordIds(data, inst).filter((id) => !known(id));
      if (fresh.length > MAX_NEW_PER_TEMPLATE_ORDER) continue;
      const addsNew = fresh.filter((id) => !dayNew.has(id));
      if (addsNew.length && dayNew.size + addsNew.length > budget) continue;
      const ids = orderWordIds(data, inst);
      let score = ids.reduce((s, id) => s + reviewWeight(p.words[id], p.day), 0);
      score += k.complexity * (tpl.stage === p.stage ? 2 : tpl.stage / p.stage);
      if (k.complexity < 1) score += (1 - k.complexity) * 2 * (1 - tpl.stage / p.stage); // easing off: older, simpler templates
      score += fresh.length ? 0.5 : 0;
      score -= (usedTemplates.get(tpl.id) ?? 0) * 2.5;
      score += rng() * 2;
      if (!best || score > best.score) best = { inst, score, fresh };
    }
    if (!best) break;
    best.fresh.forEach((w) => dayNew.add(w));
    templ.push(best.inst);
    keys.add(best.inst.key);
    texts.add(plain(best.inst.text));
    usedTemplates.set(best.inst.source.id, (usedTemplates.get(best.inst.source.id) ?? 0) + 1);
  }

  // 4. fallback: re-serve already-completed authored orders as review
  if (authored.length + templ.length < slots) {
    const done = data.content.orders.filter((o) => o.stage <= p.stage && !keys.has(o.id));
    for (const o of shuffle(rng, done)) {
      if (authored.length + templ.length >= slots) break;
      const inst = authoredInstance(data, o);
      if (orderWordIds(data, inst).filter((id) => !known(id)).length > MAX_NEW_PER_TEMPLATE_ORDER) continue;
      templ.push(inst);
      keys.add(inst.key);
    }
  }

  // Interleave: curriculum first (in order), review mixed in, returning customers spread out.
  const main = [...authored];
  for (const t of templ) main.splice(Math.min(main.length, 1 + Math.floor(rng() * main.length)), 0, t);
  const queue = [...main];
  returning.forEach((r, i) => queue.splice(Math.min(queue.length, i * 2 + 1), 0, r));

  if (k.audio === 0) for (const q of queue) q.audioOnly = false; // assist: no audio-only orders
  assignCustomers(data, p.stage, queue, rng);
  return { queue, newWords: [...dayNew] };
}

function assignCustomers(data: GameData, stage: number, queue: OrderInstance[], rng: Rng) {
  const avail = data.content.customers.filter((c) => c.stage <= stage);
  const used = new Set(queue.map((q) => q.customer).filter(Boolean));
  for (const q of queue) {
    if (q.customer) continue;
    const free = avail.filter((c) => !used.has(c.id));
    const c = pick(rng, free.length ? free : avail);
    q.customer = c.id;
    used.add(c.id);
  }
}
