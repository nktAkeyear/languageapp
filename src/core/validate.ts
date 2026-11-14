/**
 * Content validator (used by `npm run validate-content` and the test suite).
 * Returns errors (must fix) and warnings (should look at).
 */
import { checkSatisfiable } from '../activities/shop/rules';
import { fillReaction } from '../activities/shop/reactions';
import { featureFlags, instantiateTemplate } from '../activities/shop/templates';
import { buildGameData, featuresAtStage, ingredientsAtStage, qtyPhrase, type GameData } from './gamedata';
import { makeRng } from './rng';
import { tokenIds, unknownTokens } from './tokenize';
import type { IssueKind, LanguageContent, OrderRule, ReactionKind, SharedContent } from './types';
import { validateTownLanguage, validateTownShared } from './validateTown';
import { validateStoryLanguage, validateStoryShared } from '../story/validate';
import { validateRenovationLanguage, validateRenovationShared } from '../renovation/validate';

export interface ValidationReport {
  errors: string[];
  warnings: string[];
  stats: Record<string, number>;
}

const ISSUE_KINDS: IssueKind[] = [
  'empty', 'forbidden', 'forbidden_tag', 'wrong', 'missing', 'tag_missing', 'extra',
  'wrong_temp', 'too_much', 'too_little', 'tag_too_much', 'wrong_method',
];
const REACTION_KINDS: ReactionKind[] = [...ISSUE_KINDS, 'perfect', 'any_fail'];
const PINYIN_OK = /^[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü' ]+$/;

export function validateShared(shared: SharedContent): ValidationReport {
  const errors: string[] = [];
  const warnings: string[] = [];
  const ids = new Set<string>();
  for (const i of shared.ingredients) {
    if (ids.has(i.id)) errors.push(`shared: duplicate ingredient ${i.id}`);
    ids.add(i.id);
    if (i.maxCount < 1) errors.push(`shared: ingredient ${i.id} maxCount < 1`);
  }
  const stages = [...shared.stages].sort((a, b) => a.stage - b.stage);
  stages.forEach((s, i) => {
    if (s.stage !== i + 1) errors.push(`shared: stages must be numbered 1..n contiguously (got ${s.stage})`);
    if (i > 0 && s.minDay < stages[i - 1].minDay) errors.push(`shared: stage ${s.stage} minDay goes backwards`);
    if (s.customersPerDay < 1) errors.push(`shared: stage ${s.stage} customersPerDay < 1`);
  });
  const onShelf = new Map<string, number>();
  for (const s of stages)
    for (const ing of s.ingredients) {
      if (!ids.has(ing)) errors.push(`shared: stage ${s.stage} lists unknown ingredient ${ing}`);
      if (onShelf.has(ing)) errors.push(`shared: ingredient ${ing} unlocked twice`);
      onShelf.set(ing, s.stage);
    }
  for (const id of ids) if (!onShelf.has(id)) warnings.push(`shared: ingredient ${id} is never unlocked`);
  const town = validateTownShared(shared);
  errors.push(...town.errors);
  warnings.push(...town.warnings);
  const story = validateStoryShared(shared);
  errors.push(...story.errors);
  warnings.push(...story.warnings);
  const reno = validateRenovationShared(shared);
  errors.push(...reno.errors);
  warnings.push(...reno.warnings);
  const rids = new Set<string>();
  for (const r of shared.recipes) {
    if (rids.has(r.id)) errors.push(`shared: duplicate recipe ${r.id}`);
    rids.add(r.id);
    for (const req of r.rule.require ?? []) if (!ids.has(req.ing)) errors.push(`shared: recipe ${r.id} unknown ingredient ${req.ing}`);
  }
  return { errors, warnings, stats: {} };
}

export function validateLanguage(content: LanguageContent, shared: SharedContent): ValidationReport {
  const L = content.lang;
  const errors: string[] = [];
  const warnings: string[] = [];
  const err = (m: string) => errors.push(`[${L}] ${m}`);
  const warn = (m: string) => warnings.push(`[${L}] ${m}`);
  const data: GameData = buildGameData(content, shared);
  const reachable = new Set<string>();
  const ingIds = new Set(shared.ingredients.map((i) => i.id));
  const maxStage = Math.max(...shared.stages.map((s) => s.stage));

  const checkText = (where: string, text: string, collect = true) => {
    const toks = data.tokens(text);
    const bad = unknownTokens(toks, L);
    if (bad.length) err(`${where}: words not in lexicon: ${bad.join(', ')}  («${text}»)`);
    if (collect) tokenIds(toks).forEach((id) => reachable.add(id));
  };
  const lexRef = (where: string, id: string | undefined) => {
    if (!id || !data.lex.byId.has(id)) err(`${where}: unknown lexicon id "${id}"`);
    else reachable.add(id);
  };
  const checkRuleRefs = (where: string, rule: OrderRule) => {
    for (const r of rule.require ?? []) if (!ingIds.has(r.ing)) err(`${where}: unknown ingredient ${r.ing}`);
    for (const f of rule.forbid ?? []) if (!ingIds.has(f)) err(`${where}: unknown ingredient ${f}`);
    if (Array.isArray(rule.allow)) for (const a of rule.allow) if (!ingIds.has(a)) err(`${where}: unknown ingredient ${a}`);
  };
  const satisfiableAt = (where: string, rule: OrderRule, stage: number) => {
    const avail = new Set(ingredientsAtStage(data, stage));
    const probs = checkSatisfiable(rule, avail, featureFlags(featuresAtStage(data, stage)), data.ing);
    for (const p of probs) err(`${where}: not satisfiable at stage ${stage}: ${p}`);
  };

  // --- lexicon
  const lexIds = new Set<string>();
  const surfaces = new Map<string, string>();
  const pageIds = new Set(content.verificationPages.map((p) => p.id));
  for (const e of content.lexicon) {
    if (lexIds.has(e.id)) err(`lexicon: duplicate id ${e.id}`);
    lexIds.add(e.id);
    if (!e.text || !e.gloss) err(`lexicon ${e.id}: text and gloss are required`);
    if (!pageIds.has(e.group)) err(`lexicon ${e.id}: group "${e.group}" is not a verification page`);
    if (L === 'zh') {
      if (!e.pinyin) err(`lexicon ${e.id}: zh entries need pinyin`);
      else if (!PINYIN_OK.test(e.pinyin)) err(`lexicon ${e.id}: pinyin "${e.pinyin}" has unexpected characters`);
      if (e.hsk === undefined) err(`lexicon ${e.id}: zh entries need hsk (1-6 or null)`);
      if (e.hsk !== undefined && e.hsk !== null && (e.hsk < 1 || e.hsk > 6)) err(`lexicon ${e.id}: hsk out of range`);
    }
    if (L === 'en' && e.eiken === undefined) err(`lexicon ${e.id}: en entries need eiken (grade or null)`);
    for (const s of [e.text, ...(e.forms ?? [])]) {
      const k = L === 'en' ? s.toLowerCase() : s;
      const prev = surfaces.get(k);
      if (prev && prev !== e.id) warn(`lexicon: surface "${s}" maps to both ${prev} and ${e.id}; the first wins unless markup {${s}|${e.id}} is used`);
      else surfaces.set(k, e.id);
    }
  }

  // --- verification pages
  const vIds = new Set<string>();
  for (const vp of content.verificationPages) {
    if (vIds.has(vp.id)) err(`verificationPages: duplicate ${vp.id}`);
    vIds.add(vp.id);
    const words = content.lexicon.filter((e) => e.group === vp.id);
    if (words.length < 3 || words.length > 5) err(`verification page ${vp.id}: has ${words.length} words (must be 3–5)`);
    const glosses = new Set<string>();
    for (const w of words) {
      if (glosses.has(w.gloss)) err(`verification page ${vp.id}: duplicate gloss "${w.gloss}"`);
      glosses.add(w.gloss);
    }
  }

  // --- word maps
  for (const [n, id] of Object.entries(content.numbers)) lexRef(`numbers[${n}]`, id);
  for (const [t, id] of Object.entries(content.temperatureWords)) lexRef(`temperatureWords.${t}`, id);
  for (const [m, id] of Object.entries(content.methodWords)) lexRef(`methodWords.${m}`, id);
  for (const [t, id] of Object.entries(content.tagWords)) lexRef(`tagWords.${t}`, id);

  // --- ingredients
  for (const def of shared.ingredients) {
    const t = data.ingText.get(def.id);
    if (!t) {
      err(`ingredients: no entry for ${def.id}`);
      continue;
    }
    lexRef(`ingredients.${def.id}.word`, t.word);
    if (def.qtyOrderable && !t.qty) err(`ingredients.${def.id}: qtyOrderable but no qty pattern`);
    if (t.qty) {
      if (!t.qty.other.includes('{n}')) err(`ingredients.${def.id}: qty.other must contain {n}`);
      for (const n of Object.keys(content.numbers).map(Number)) {
        if (n > def.maxCount) continue;
        const ph = qtyPhrase(data, def.id, n);
        if (ph) checkText(`ingredients.${def.id}.qty(${n})`, ph);
      }
    }
  }
  for (const t of content.ingredients) if (!ingIds.has(t.ingredient)) err(`ingredients: unknown ingredient ${t.ingredient}`);

  // --- recipes / symptoms
  for (const r of shared.recipes) {
    const name = content.recipeNames[r.id];
    if (!name) err(`recipeNames: missing ${r.id}`);
    else checkText(`recipeNames.${r.id}`, name);
    for (const s of r.symptoms ?? [])
      if (!content.symptoms.some((st) => st.symptom === s)) err(`symptoms: no phrases for "${s}" (used by recipe ${r.id})`);
  }
  for (const st of content.symptoms) for (const ph of st.phrases) checkText(`symptoms.${st.symptom}`, ph);

  // --- customers
  const custIds = new Set<string>();
  for (const c of content.customers) {
    if (custIds.has(c.id)) err(`customers: duplicate ${c.id}`);
    custIds.add(c.id);
  }
  if (!content.customers.some((c) => c.stage <= 1)) err('customers: need at least one customer at stage 1');

  // --- pages
  const pIds = new Set<string>();
  for (const pg of content.pages) {
    if (pIds.has(pg.id)) err(`pages: duplicate ${pg.id}`);
    pIds.add(pg.id);
    if (pg.stage < 1 || pg.stage > maxStage) err(`page ${pg.id}: stage ${pg.stage} out of range`);
    if (pg.ingredient && !ingIds.has(pg.ingredient)) err(`page ${pg.id}: unknown ingredient ${pg.ingredient}`);
    if (pg.recipe) {
      const r = data.recipes.get(pg.recipe);
      if (!r) err(`page ${pg.id}: unknown recipe ${pg.recipe}`);
      else if (pg.stage < r.stage) warn(`page ${pg.id}: shown before its recipe's stage`);
    }
    if (pg.kind === 'recipe' && !pg.recipe) err(`page ${pg.id}: recipe page without recipe`);
    checkText(`page ${pg.id} title`, pg.title);
    pg.lines.forEach((l, i) => checkText(`page ${pg.id} line ${i + 1}`, l.text));
  }

  // --- authored orders
  const oIds = new Set<string>();
  for (const o of content.orders) {
    const where = `order ${o.id}`;
    if (oIds.has(o.id)) err(`orders: duplicate ${o.id}`);
    oIds.add(o.id);
    if (!!o.rule === !!o.recipe) err(`${where}: needs exactly one of rule / recipe`);
    if (o.recipe && !data.recipes.has(o.recipe)) err(`${where}: unknown recipe ${o.recipe}`);
    if (o.customer) {
      const c = content.customers.find((c) => c.id === o.customer);
      if (!c) err(`${where}: unknown customer ${o.customer}`);
      else if (c.stage > o.stage) err(`${where}: customer ${o.customer} appears only from stage ${c.stage}`);
    }
    checkText(where, o.text);
    const rule = o.rule ?? data.recipes.get(o.recipe ?? '')?.rule;
    if (rule) {
      checkRuleRefs(where, rule);
      satisfiableAt(where, rule, o.stage);
    }
    if (o.audioOnly && !featuresAtStage(data, o.stage).has('audioOnly')) err(`${where}: audioOnly before the audioOnly feature unlocks`);
  }

  // --- templates
  const tIds = new Set<string>();
  for (const t of content.templates) {
    const where = `template ${t.id}`;
    if (tIds.has(t.id)) err(`templates: duplicate ${t.id}`);
    tIds.add(t.id);
    const ph = [...t.text.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map((m) => m[1].toLowerCase());
    for (const p of ph) if (!t.slots[p]) err(`${where}: placeholder {${p}} has no slot`);
    for (const s of Object.keys(t.slots)) {
      if (s !== s.toLowerCase()) err(`${where}: slot names must be lowercase (${s})`);
      if (!ph.includes(s)) err(`${where}: slot ${s} not used in text`);
    }
    if (t.rule) checkRuleRefs(where, t.rule);
    // Instantiate at its own stage and at the last stage, with several seeds.
    for (const stage of [t.stage, maxStage]) {
      const ctx = { stage, available: ingredientsAtStage(data, stage), features: featuresAtStage(data, stage) };
      let okCount = 0;
      for (let seed = 1; seed <= 40; seed++) {
        const inst = instantiateTemplate(data, t, { ...ctx, rng: makeRng(seed * 7919 + stage) }, 4);
        if (!inst) continue;
        okCount++;
        checkText(`${where} instance «${inst.text}»`, inst.text);
        satisfiableAt(`${where} instance «${inst.text}»`, inst.rule, stage);
      }
      if (okCount === 0) err(`${where}: cannot be instantiated at stage ${stage}`);
    }
  }

  // --- reactions
  const rIds = new Set<string>();
  for (const r of content.reactions) {
    const where = `reaction ${r.id}`;
    if (rIds.has(r.id)) err(`reactions: duplicate ${r.id}`);
    rIds.add(r.id);
    if (!REACTION_KINDS.includes(r.kind)) err(`${where}: unknown kind ${r.kind}`);
    const extra = r.text.replace(/\{(ing|Ing|tag|Tag|temp|Temp|method|Method)\}/g, '').match(/\{[A-Za-z]+\}/);
    if (extra) err(`${where}: unknown placeholder ${extra[0]}`);
    // Fill with every possible value to make sure all fillings tokenize.
    const samples = [
      ...shared.ingredients.map((i) => ({ kind: r.kind as IssueKind, ing: i.id })),
      ...(Object.keys(content.tagWords) as never[]).map((tag) => ({ kind: r.kind as IssueKind, tag })),
      { kind: r.kind as IssueKind, temp: 'hot' as const },
      { kind: r.kind as IssueKind, temp: 'cold' as const },
      { kind: r.kind as IssueKind, method: 'boil' as const },
    ];
    let filledAny = false;
    for (const s of samples) {
      const txt = fillReaction(data, r, s);
      if (txt !== null) {
        filledAny = true;
        checkText(where, txt);
      }
    }
    if (!filledAny) err(`${where}: placeholders can never be filled`);
  }
  for (const k of ['perfect', 'any_fail'] as ReactionKind[])
    if (!content.reactions.some((r) => r.kind === k && r.stage <= 1 && !r.when)) err(`reactions: need an unconditional stage-1 "${k}" reaction`);
  for (const k of ISSUE_KINDS)
    if (!content.reactions.some((r) => r.kind === k)) warn(`reactions: no specific reaction for "${k}" (falls back to any_fail)`);

  // --- town activities (market, deliveries)
  const townStats = validateTownLanguage(data, { err, warn, checkText, lexRef });
  const storyStats = validateStoryLanguage(data, { err, warn, checkText, lexRef });
  const renoStats = validateRenovationLanguage(data, { err, warn, checkText });

  // --- reachability: every word must be encounterable, or its 検証ページ never opens
  for (const e of content.lexicon) if (!reachable.has(e.id)) err(`lexicon ${e.id} («${e.text}») never appears in any content text`);

  return {
    errors,
    warnings,
    stats: {
      lexicon: content.lexicon.length,
      orders: content.orders.length,
      templates: content.templates.length,
      pages: content.pages.length,
      reactions: content.reactions.length,
      verificationPages: content.verificationPages.length,
      townWords: content.town?.lexicon.length ?? 0,
      ...townStats,
      ...storyStats,
      ...renoStats,
    },
  };
}

/** Structural parallelism between languages (warnings only). */
export function compareLanguages(a: LanguageContent, b: LanguageContent): string[] {
  const out: string[] = [];
  const diff = (what: string, xa: string[], xb: string[]) => {
    const sa = new Set(xa);
    const sb = new Set(xb);
    const onlyA = xa.filter((x) => !sb.has(x));
    const onlyB = xb.filter((x) => !sa.has(x));
    if (onlyA.length) out.push(`${what} only in ${a.lang}: ${onlyA.join(', ')}`);
    if (onlyB.length) out.push(`${what} only in ${b.lang}: ${onlyB.join(', ')}`);
  };
  diff('orders', a.orders.map((o) => o.id), b.orders.map((o) => o.id));
  diff('pages', a.pages.map((o) => o.id), b.pages.map((o) => o.id));
  diff('templates', a.templates.map((o) => o.id), b.templates.map((o) => o.id));
  diff('customers', a.customers.map((o) => o.id), b.customers.map((o) => o.id));
  return out;
}
