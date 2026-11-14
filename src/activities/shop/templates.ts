import {
  capitalizeFirst,
  ingredientWordId,
  qtyPhrase,
  wordMarkup,
  type GameData,
} from '../../core/gamedata';
import { pick, type Rng } from '../../core/rng';
import type {
  AuthoredOrder,
  Feature,
  IngredientId,
  OrderInstance,
  OrderRule,
  OrderTemplate,
  RecipeDef,
  SlotSpec,
  SymptomId,
  Tag,
  Temp,
} from '../../core/types';
import { checkSatisfiable, mergeRules } from './rules';

export interface TemplateCtx {
  stage: number;
  available: IngredientId[];
  features: Set<Feature>;
  rng: Rng;
  /** Multiplier on audio-only probabilities (レベル設定 / 自動調整); default 1. */
  audio?: number;
}

/** Recipes the player can actually make at this stage. */
export function unlockedRecipes(data: GameData, ctx: Omit<TemplateCtx, 'rng'>): RecipeDef[] {
  const avail = new Set(ctx.available);
  return data.shared.recipes.filter(
    (r) =>
      r.stage <= ctx.stage &&
      checkSatisfiable(r.rule, avail, featureFlags(ctx.features), data.ing).length === 0,
  );
}

export function featureFlags(f: Set<Feature>) {
  return { temperature: f.has('temperature'), method: f.has('method') };
}

function poolFor(
  data: GameData,
  spec: { ingredients?: IngredientId[]; tags?: Tag[] },
  ctx: TemplateCtx,
  used: Set<IngredientId>,
  defaultFilter: (id: IngredientId) => boolean,
): IngredientId[] {
  return ctx.available.filter((id) => {
    if (used.has(id)) return false;
    if (!ingredientWordId(data, id)) return false;
    const def = data.ing.get(id);
    if (!def) return false;
    if (spec.ingredients) return spec.ingredients.includes(id);
    if (spec.tags && !spec.tags.some((t) => def.tags.includes(t))) return false;
    return defaultFilter(id);
  });
}

/** Default pool for bare-word slots: skip water (neutral) and salt (a joke ingredient). */
function defaultWordFilter(data: GameData) {
  return (id: IngredientId) => {
    const def = data.ing.get(id)!;
    return !def.neutral && !def.tags.includes('salty');
  };
}

interface Filled {
  text: string;
  rule: OrderRule;
  sig: string;
  recipe?: string;
  symptom?: boolean;
}

function fillSlot(
  data: GameData,
  spec: SlotSpec,
  ctx: TemplateCtx,
  used: Set<IngredientId>,
  recipes: RecipeDef[],
): Filled | null {
  const rng = ctx.rng;
  switch (spec.kind) {
    case 'qty': {
      const pool = poolFor(data, spec, ctx, used, (id) => data.ing.get(id)!.qtyOrderable && !data.ing.get(id)!.neutral);
      const withPhrase = pool.filter((id) => qtyPhrase(data, id, 1) || qtyPhrase(data, id, 2));
      if (!withPhrase.length) return null;
      const ing = pick(rng, withPhrase);
      const def = data.ing.get(ing)!;
      const lo = spec.min ?? 1;
      const hi = Math.min(spec.max ?? 3, def.maxCount);
      const ns: number[] = [];
      for (let n = lo; n <= hi; n++) if (qtyPhrase(data, ing, n)) ns.push(n);
      if (!ns.length) return null;
      const n = pick(rng, ns);
      used.add(ing);
      return { text: qtyPhrase(data, ing, n)!, rule: { require: [{ ing, min: n, max: n }] }, sig: `${ing}x${n}` };
    }
    case 'ing': {
      const pool = poolFor(data, spec, ctx, used, defaultWordFilter(data));
      if (!pool.length) return null;
      const ing = pick(rng, pool);
      used.add(ing);
      const max = spec.max ?? data.ing.get(ing)!.maxCount;
      return { text: wordMarkup(data, ingredientWordId(data, ing)!), rule: { require: [{ ing, min: 1, max }] }, sig: ing };
    }
    case 'forbid': {
      const pool = poolFor(data, spec, ctx, used, defaultWordFilter(data));
      if (!pool.length) return null;
      const ing = pick(rng, pool);
      used.add(ing);
      return { text: wordMarkup(data, ingredientWordId(data, ing)!), rule: { forbid: [ing] }, sig: `-${ing}` };
    }
    case 'temp': {
      if (!ctx.features.has('temperature')) return null;
      const temp: Temp = pick(rng, spec.temps ?? (['hot', 'cold'] as Temp[]));
      return { text: wordMarkup(data, data.content.temperatureWords[temp]), rule: { temp }, sig: temp };
    }
    case 'taste':
    case 'notTaste': {
      const tags = (spec.tags ?? (Object.keys(data.content.tagWords) as Tag[])).filter(
        (t) => data.content.tagWords[t] && ctx.available.some((id) => data.ing.get(id)?.tags.includes(t)),
      );
      if (!tags.length) return null;
      const tag = pick(rng, tags);
      const text = wordMarkup(data, data.content.tagWords[tag]!);
      return spec.kind === 'taste'
        ? { text, rule: { requireTag: [{ tag, min: 1 }] }, sig: `+${tag}` }
        : { text, rule: { forbidTag: [tag] }, sig: `!${tag}` };
    }
    case 'symptom': {
      const opts: { symptom: SymptomId; recipe: RecipeDef }[] = [];
      for (const r of recipes)
        for (const s of r.symptoms ?? [])
          if (!spec.symptoms || spec.symptoms.includes(s)) opts.push({ symptom: s, recipe: r });
      const withText = opts.filter((o) => data.content.symptoms.some((st) => st.symptom === o.symptom));
      if (!withText.length) return null;
      const o = pick(rng, withText);
      const phrases = data.content.symptoms.find((st) => st.symptom === o.symptom)!.phrases;
      const phrase = pick(rng, phrases);
      return { text: phrase, rule: o.recipe.rule, sig: `${o.symptom}:${phrase}`, recipe: o.recipe.id, symptom: true };
    }
    case 'recipe': {
      const opts = recipes.filter((r) => (!spec.recipes || spec.recipes.includes(r.id)) && data.content.recipeNames[r.id]);
      if (!opts.length) return null;
      const r = pick(rng, opts);
      return { text: data.content.recipeNames[r.id], rule: r.rule, sig: r.id, recipe: r.id };
    }
  }
}

/** Reject combinations that are technically satisfiable but read oddly (iced drink served hot). */
function isCoherent(data: GameData, rule: OrderRule): boolean {
  if (rule.temp === 'hot' && (rule.require ?? []).some((r) => data.ing.get(r.ing)?.coldOnly)) return false;
  return true;
}

const PLACEHOLDER = /\{([A-Za-z][A-Za-z0-9_]*)\}/g;

/** Try to build a concrete order from a template. Returns null if no valid filling was found. */
export function instantiateTemplate(
  data: GameData,
  tpl: OrderTemplate,
  ctx: TemplateCtx,
  attempts = 12,
): OrderInstance | null {
  const recipes = unlockedRecipes(data, ctx);
  const avail = new Set(ctx.available);
  for (let a = 0; a < attempts; a++) {
    const used = new Set<IngredientId>([
      ...(tpl.rule?.require ?? []).map((r) => r.ing),
      ...(tpl.rule?.forbid ?? []),
    ]);
    let rule: OrderRule = tpl.rule ? { ...tpl.rule } : {};
    const fills: Record<string, Filled> = {};
    let ok = true;
    for (const [name, spec] of Object.entries(tpl.slots)) {
      const f = fillSlot(data, spec, ctx, used, recipes);
      if (!f) {
        ok = false;
        break;
      }
      fills[name] = f;
      rule = mergeRules(rule, f.rule);
    }
    if (!ok) continue;
    if (checkSatisfiable(rule, avail, featureFlags(ctx.features), data.ing).length) continue;
    if (!isCoherent(data, rule)) continue;
    const text = tpl.text.replace(PLACEHOLDER, (_m, key: string) => {
      const f = fills[key.toLowerCase()];
      if (!f) return _m;
      return key[0] === key[0].toUpperCase() ? capitalizeFirst(f.text) : f.text;
    });
    const filled = Object.values(fills);
    const recipe = filled.find((f) => f.recipe)?.recipe;
    return {
      key: `${tpl.id}:${Object.entries(fills)
        .map(([k, f]) => `${k}=${f.sig}`)
        .join(',')}`,
      source: { type: 'template', id: tpl.id },
      text,
      rule,
      audioOnly: ctx.features.has('audioOnly') && ctx.rng() < (tpl.audioOnly ?? 0) * (ctx.audio ?? 1),
      customer: tpl.customer ?? '',
      recipe,
      symptom: filled.some((f) => f.symptom),
    };
  }
  return null;
}

export function authoredInstance(data: GameData, o: AuthoredOrder): OrderInstance {
  const recipe = o.recipe ? data.recipes.get(o.recipe) : undefined;
  return {
    key: o.id,
    source: { type: 'authored', id: o.id },
    text: o.text,
    rule: o.rule ?? recipe?.rule ?? {},
    audioOnly: !!o.audioOnly,
    customer: o.customer ?? '',
    recipe: o.recipe,
    symptom: !!recipe?.symptoms?.length && !o.text.toLowerCase().includes((data.content.recipeNames[o.recipe!] ?? '\u0000').toLowerCase()),
  };
}
