/**
 * Validator part for the renovation catalogue (called from src/core/validate.ts).
 *
 * Shared: unique ids, positive prices, prerequisites that exist and appear earlier, carry rules
 * over real market goods. Per language: text for every entry; every name / line / remark / price
 * tokenises fully; remarks exactly for the upgrades customers remark on; the catalogue's own words
 * do not repeat an existing word by surface or by meaning; each entry is readable when it appears
 * (at most a few words the player cannot have met by then).
 */
import type { GameData } from '../core/gamedata';
import { tokenIds } from '../core/tokenize';
import type { SharedContent } from '../core/types';
import { contentWordStages, stageOnDay } from '../story/vocab';
import { shortGloss } from './gloss';
import type { UpgradeId } from './types';

export const MAX_NEW_PER_ENTRY = 4;

export function validateRenovationShared(shared: SharedContent): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const r = shared.renovation;
  if (!r) return { errors, warnings };
  const seen = new Map<string, number>();
  r.upgrades.forEach((u, i) => {
    if (seen.has(u.id)) errors.push(`renovation: duplicate upgrade ${u.id}`);
    seen.set(u.id, i);
    if (!(u.price > 0)) errors.push(`renovation ${u.id}: price must be > 0`);
    for (const req of u.when.requires ?? []) {
      const j = seen.get(req);
      if (j === undefined) errors.push(`renovation ${u.id}: requires ${req}, which is not listed before it`);
      else if ((r.upgrades[j].when.day ?? 0) > (u.when.day ?? 0)) errors.push(`renovation ${u.id}: appears before its prerequisite ${req}`);
    }
  });
  const goods = new Set(shared.town?.market.goods.map((g) => g.ingredient) ?? []);
  for (const g of r.dryGoods) if (!goods.has(g)) errors.push(`renovation: dry good ${g} is not a market good`);
  if (r.upgrades.some((u) => u.effects.carry) && !shared.town) errors.push('renovation: carry rules need the market');
  return { errors, warnings };
}

interface Ctx {
  err(m: string): void;
  warn(m: string): void;
  checkText(where: string, text: string, collect?: boolean): void;
}

export function validateRenovationLanguage(data: GameData, ctx: Ctx): Record<string, number> {
  const shared = data.shared.renovation;
  const text = data.content.renovation;
  if (!shared || !text) return {};
  const { err, warn, checkText } = ctx;
  checkText('renovation title', text.title);
  checkText('renovation subtitle', text.subtitle);
  for (const f of [text.price.one, text.price.other]) {
    if (f === undefined) continue;
    if (!f.includes('{d}')) err(`renovation price "${f}" needs {d}`);
    checkText('renovation price', f.replace('{d}', '12'));
  }
  const ids = new Set(shared.upgrades.map((u) => u.id));
  for (const k of Object.keys(text.upgrades)) if (!ids.has(k as UpgradeId)) err(`renovation text: unknown upgrade ${k}`);
  for (const u of shared.upgrades) {
    const t = text.upgrades[u.id];
    if (!t) {
      err(`renovation ${u.id}: no text`);
      continue;
    }
    checkText(`renovation ${u.id} name`, t.name);
    if (!t.lines.length) err(`renovation ${u.id}: needs at least one line`);
    t.lines.forEach((l, i) => checkText(`renovation ${u.id} line ${i + 1}`, l));
    (t.remarks ?? []).forEach((l, i) => checkText(`renovation ${u.id} remark ${i + 1}`, l));
    if (u.effects.remarks && !t.remarks?.length) err(`renovation ${u.id}: customers remark on it, but it has no remarks`);
    if (!u.effects.remarks && t.remarks?.length) warn(`renovation ${u.id}: has remarks that are never used`);
  }

  // The catalogue's own words: no duplicate by surface or meaning with any other lexicon entry.
  const own = new Set(text.lexicon.map((e) => e.id));
  const others = data.content.lexicon.filter((e) => !own.has(e.id));
  const norm = (s: string) => (data.lang === 'en' ? s.toLowerCase() : s);
  for (const e of text.lexicon) {
    for (const s of [e.text, ...(e.forms ?? [])]) {
      const clash = others.find((o) => [o.text, ...(o.forms ?? [])].some((x) => norm(x) === norm(s)));
      if (clash) err(`renovation word ${e.id}: surface "${s}" already belongs to ${clash.id}`);
    }
    const g = shortGloss(e.gloss);
    const same = others.find((o) => o.gloss === e.gloss || (!!g && shortGloss(o.gloss) === g));
    if (same) err(`renovation word ${e.id}: meaning "${e.gloss}" duplicates ${same.id} («${same.text}» ${same.gloss})`);
  }

  // Readability: when an entry appears, at most MAX_NEW_PER_ENTRY of its words are still unmet
  // (met = shop / town content by that stage, or words of entries that appeared earlier).
  const met = contentWordStages(data);
  const story = data.content.story;
  const known = new Set<string>();
  let maxNew = 0;
  const entries = [...shared.upgrades].sort((a, b) => (a.when.day ?? 0) - (b.when.day ?? 0));
  for (const u of entries) {
    const t = text.upgrades[u.id];
    if (!t) continue;
    const stage = Math.max(u.when.stage ?? 1, stageOnDay(data, u.when.day ?? 1));
    const words = new Set([t.name, ...t.lines].flatMap((x) => tokenIds(data.tokens(x))));
    const fresh = [...words].filter((id) => !known.has(id) && !((met.get(id) ?? 99) <= stage) && !(story && story.lexicon.some((e) => e.id === id)));
    maxNew = Math.max(maxNew, fresh.length);
    if (fresh.length > MAX_NEW_PER_ENTRY) warn(`renovation ${u.id}: ${fresh.length} words not met by day ${u.when.day ?? 1}: ${fresh.join(', ')}`);
    words.forEach((id) => known.add(id));
  }
  return { renoEntries: shared.upgrades.length, renoWords: text.lexicon.length, renoMaxNew: maxNew };
}
