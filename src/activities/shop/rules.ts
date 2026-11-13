import type {
  Brew,
  Evaluation,
  IngredientDef,
  IngredientId,
  Issue,
  IssueKind,
  OrderRule,
  Outcome,
  Tag,
} from '../../core/types';

/** Lower index = more important (chosen as the primary issue for the reaction). */
export const ISSUE_PRIORITY: IssueKind[] = [
  'empty',
  'forbidden',
  'forbidden_tag',
  'wrong',
  'missing',
  'tag_missing',
  'extra',
  'wrong_temp',
  'too_much',
  'too_little',
  'tag_too_much',
  'wrong_method',
];

const MINOR: IssueKind[] = ['too_much', 'too_little', 'tag_too_much', 'wrong_method'];
const BAD: IssueKind[] = ['forbidden', 'forbidden_tag'];

export type IngredientIndex = Map<IngredientId, IngredientDef>;

export function indexIngredients(defs: IngredientDef[]): IngredientIndex {
  return new Map(defs.map((d) => [d.id, d]));
}

function hasTag(idx: IngredientIndex, ing: IngredientId, tag: Tag): boolean {
  return idx.get(ing)?.tags.includes(tag) ?? false;
}

/** Evaluate a brew against an order rule. Pure; deterministic. */
export function evaluateBrew(rule: OrderRule, brew: Brew, idx: IngredientIndex): Evaluation {
  const issues: Issue[] = [];
  const present = (Object.keys(brew.counts) as IngredientId[]).filter((k) => (brew.counts[k] ?? 0) > 0);
  const count = (ing: IngredientId) => brew.counts[ing] ?? 0;

  if (present.length === 0) {
    issues.push({ kind: 'empty' });
    return finish(issues);
  }

  for (const ing of rule.forbid ?? []) {
    if (count(ing) > 0) issues.push({ kind: 'forbidden', ing });
  }
  for (const tag of rule.forbidTag ?? []) {
    const hit = present.find((ing) => hasTag(idx, ing, tag));
    if (hit) issues.push({ kind: 'forbidden_tag', tag, ing: hit });
  }

  const required = new Set((rule.require ?? []).map((r) => r.ing));
  const tagAllowed = new Set<Tag>([...(rule.requireTag ?? []).map((r) => r.tag), ...(rule.allowTag ?? [])]);
  const allowAll = rule.allow === 'any';
  const allowed = new Set(Array.isArray(rule.allow) ? rule.allow : []);
  const forbidden = new Set(rule.forbid ?? []);

  const extras = present.filter((ing) => {
    if (required.has(ing) || forbidden.has(ing)) return false;
    if ((rule.forbidTag ?? []).some((t) => hasTag(idx, ing, t))) return false;
    if (allowAll || allowed.has(ing)) return false;
    if (idx.get(ing)?.neutral) return false;
    if ([...tagAllowed].some((t) => hasTag(idx, ing, t))) return false;
    return true;
  });

  const missing: IngredientId[] = [];
  for (const r of rule.require ?? []) {
    const c = count(r.ing);
    const min = r.min ?? 1;
    const max = r.max ?? idx.get(r.ing)?.maxCount ?? 99;
    if (c === 0) missing.push(r.ing);
    else if (c > max) issues.push({ kind: 'too_much', ing: r.ing, diff: c - max });
    else if (c < min) issues.push({ kind: 'too_little', ing: r.ing, diff: min - c });
  }

  // A missing ingredient replaced by an unexpected one reads as "wrong ingredient".
  if (missing.length > 0 && extras.length > 0) {
    issues.push({ kind: 'wrong', ing: missing[0] });
    for (const m of missing.slice(1)) issues.push({ kind: 'missing', ing: m });
    for (const e of extras) issues.push({ kind: 'extra', ing: e });
  } else {
    for (const m of missing) issues.push({ kind: 'missing', ing: m });
    for (const e of extras) issues.push({ kind: 'extra', ing: e });
  }

  for (const r of rule.requireTag ?? []) {
    const total = present.filter((ing) => hasTag(idx, ing, r.tag)).reduce((s, ing) => s + count(ing), 0);
    const min = r.min ?? 1;
    if (total < min) issues.push({ kind: 'tag_missing', tag: r.tag, diff: min - total });
    else if (r.max !== undefined && total > r.max) issues.push({ kind: 'tag_too_much', tag: r.tag, diff: total - r.max });
  }

  if (rule.temp && brew.temp !== rule.temp) issues.push({ kind: 'wrong_temp', temp: rule.temp });
  if (rule.method && brew.method !== rule.method) issues.push({ kind: 'wrong_method', method: rule.method });

  return finish(issues);
}

function finish(issues: Issue[]): Evaluation {
  const sorted = [...issues].sort((a, b) => ISSUE_PRIORITY.indexOf(a.kind) - ISSUE_PRIORITY.indexOf(b.kind));
  const primary = sorted[0] ?? null;
  let outcome: Outcome = 'perfect';
  if (sorted.length > 0) {
    if (sorted.some((i) => BAD.includes(i.kind))) outcome = 'bad';
    else if (sorted.every((i) => MINOR.includes(i.kind) && (i.diff ?? 1) <= 1)) outcome = 'minor';
    else outcome = 'fail';
  }
  return { issues: sorted, primary, outcome };
}

/** Merge two rules (template base + slot contributions). */
export function mergeRules(a: OrderRule, b: OrderRule): OrderRule {
  const out: OrderRule = { ...a };
  if (b.require) out.require = [...(a.require ?? []), ...b.require];
  if (b.requireTag) out.requireTag = [...(a.requireTag ?? []), ...b.requireTag];
  if (b.forbid) out.forbid = [...(a.forbid ?? []), ...b.forbid];
  if (b.forbidTag) out.forbidTag = [...(a.forbidTag ?? []), ...b.forbidTag];
  if (b.allow) {
    if (a.allow === 'any' || b.allow === 'any') out.allow = 'any';
    else out.allow = [...(a.allow ?? []), ...b.allow];
  }
  if (b.allowTag) out.allowTag = [...(a.allowTag ?? []), ...b.allowTag];
  if (b.temp) out.temp = b.temp;
  if (b.method) out.method = b.method;
  return out;
}

export interface SatisfiabilityProblem {
  message: string;
}

/**
 * Static check: can this rule be satisfied using only `available` ingredients
 * and the given features? Returns a list of problems (empty = satisfiable).
 * Also constructs a witness brew to double-check against evaluateBrew.
 */
export function checkSatisfiable(
  rule: OrderRule,
  available: Set<IngredientId>,
  features: { temperature: boolean; method: boolean },
  idx: IngredientIndex,
): string[] {
  const problems: string[] = [];
  const brew: Brew = { counts: {}, temp: rule.temp ?? null, method: rule.method ?? null };
  for (const r of rule.require ?? []) {
    const def = idx.get(r.ing);
    if (!def) {
      problems.push(`unknown ingredient ${r.ing}`);
      continue;
    }
    if (!available.has(r.ing)) problems.push(`requires ${r.ing}, not on the shelf yet`);
    const min = r.min ?? 1;
    const max = r.max ?? def.maxCount;
    if (min > max) problems.push(`${r.ing}: min ${min} > max ${max}`);
    if (min > def.maxCount) problems.push(`${r.ing}: min ${min} exceeds shelf maxCount ${def.maxCount}`);
    if (rule.forbid?.includes(r.ing)) problems.push(`${r.ing} both required and forbidden`);
    if ((rule.forbidTag ?? []).some((t) => def.tags.includes(t))) problems.push(`${r.ing} required but its tag is forbidden`);
    brew.counts[r.ing] = Math.min(Math.max(min, 1), def.maxCount);
  }
  for (const r of rule.requireTag ?? []) {
    const cur = Object.entries(brew.counts)
      .filter(([ing]) => hasTag(idx, ing as IngredientId, r.tag))
      .reduce((s, [, c]) => s + (c ?? 0), 0);
    const need = (r.min ?? 1) - cur;
    if (need > 0) {
      const cand = [...available].find(
        (ing) =>
          hasTag(idx, ing, r.tag) &&
          !rule.forbid?.includes(ing) &&
          !(rule.forbidTag ?? []).some((t) => hasTag(idx, ing, t)),
      );
      if (!cand) problems.push(`needs a "${r.tag}" ingredient but none available`);
      else brew.counts[cand] = Math.min((brew.counts[cand] ?? 0) + need, idx.get(cand)!.maxCount);
    }
  }
  if (rule.temp && !features.temperature) problems.push('needs temperature but the temperature feature is not unlocked');
  if (rule.method && !features.method) problems.push('needs a method but the method feature is not unlocked');
  if (problems.length === 0) {
    const ev = evaluateBrew(rule, brew, idx);
    if (ev.outcome !== 'perfect') problems.push(`witness brew fails: ${ev.issues.map((i) => i.kind).join(',')}`);
  }
  lastWitness = problems.length ? null : brew;
  return problems;
}

let lastWitness: Brew | null = null;

/** A brew that satisfies the rule (minimal quantities), or null. Used by tests and the validator. */
export function witnessBrew(
  rule: OrderRule,
  available: Set<IngredientId>,
  idx: IngredientIndex,
): Brew | null {
  const probs = checkSatisfiable(rule, available, { temperature: true, method: true }, idx);
  return probs.length ? null : lastWitness;
}
