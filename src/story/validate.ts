/**
 * Story validator (used by src/core/validate.ts, i.e. `npm run validate-content` and the tests).
 *
 * Shared: ids unique; references (characters, beats, outcomes, choices, flags, documents,
 * groups) resolve; beat kinds have what they need; every beat is reachable (fixpoint over the
 * facts the story can produce); chapters ascend.
 * Per language: every beat / document / talk line has its text; every text tokenises fully
 * (names aside); visits are satisfiable with the shelf + features of their stage and their
 * customer exists by then; delivery slips resolve on the map, delivery is open by the beat's
 * stage, recipients exist; each beat uses only words met by its stage plus ≤ MAX_NEW_PER_BEAT
 * new ones; each document is readable (same rule) by its `readable` stage.
 */
import { checkSatisfiable } from '../activities/shop/rules';
import { featureFlags } from '../activities/shop/templates';
import { ruleFor } from '../activities/delivery/rules';
import { featuresAtStage, ingredientsAtStage, type GameData } from '../core/gamedata';
import type { SharedContent } from '../core/types';
import { stageMinDay, contentWordStages } from './vocab';
import { splitNames, storyOf, storyUnknown, storyWordIds } from './text';
import type { BeatDef, BeatText, DocLine, StoryCond, StoryEffect, StoryShared } from './types';

export const MAX_NEW_PER_BEAT = 2;

interface Ctx {
  err: (m: string) => void;
  warn: (m: string) => void;
  checkText: (where: string, text: string, collect?: boolean) => void;
  lexRef: (where: string, id: string | undefined) => void;
}

const outcomesOf = (b: BeatDef): string[] => (b.kind === 'moment' ? ['seen'] : ['good', 'poor']);

function effectsOf(b: BeatDef): StoryEffect[] {
  return [...Object.values(b.effects ?? {}), ...(b.choice ?? []).map((c) => c.effects ?? {})].filter(Boolean) as StoryEffect[];
}

/** Beats that no sequence of outcomes / choices can ever reach (monotone fixpoint over facts). */
export function unreachableBeats(story: StoryShared, maxStage: number): string[] {
  const facts = new Set<string>();
  const fired = new Set<string>();
  const holds = (c: StoryCond) =>
    (c.stage ?? 1) <= maxStage &&
    (c.after ?? []).every((b) => facts.has(`done:${b}`)) &&
    Object.entries(c.outcome ?? {}).every(([b, os]) => os.some((o) => facts.has(`out:${b}:${o}`))) &&
    Object.entries(c.choice ?? {}).every(([b, os]) => os.some((o) => facts.has(`choice:${b}:${o}`))) &&
    (c.flags ?? []).every((f) => facts.has(`flag:${f}`)) &&
    (c.docs ?? []).every((d) => facts.has(`doc:${d}`));
  for (let changed = true; changed; ) {
    changed = false;
    for (const b of story.beats) {
      if (fired.has(b.id) || !holds(b.when)) continue;
      fired.add(b.id);
      changed = true;
      facts.add(`done:${b.id}`);
      for (const o of outcomesOf(b)) facts.add(`out:${b.id}:${o}`);
      for (const c of b.choice ?? []) facts.add(`choice:${b.id}:${c.id}`);
      for (const e of effectsOf(b)) {
        for (const f of e.flags ?? []) facts.add(`flag:${f}`);
        for (const d of e.docs ?? []) facts.add(`doc:${d}`);
      }
    }
  }
  return story.beats.filter((b) => !fired.has(b.id)).map((b) => b.id);
}

export function validateStoryShared(shared: SharedContent): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const story = shared.story;
  if (!story) return { errors, warnings };
  const err = (m: string) => errors.push(`story: ${m}`);
  const warn = (m: string) => warnings.push(`story: ${m}`);
  const maxStage = Math.max(...shared.stages.map((s) => s.stage));
  const uniq = (what: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) err(`duplicate ${what} ${id}`);
      seen.add(id);
    }
    return seen;
  };
  const chars = uniq('character', story.characters.map((c) => c.id));
  const beats = new Map(story.beats.map((b) => [b.id, b]));
  uniq('beat', story.beats.map((b) => b.id));
  const docs = uniq('document', story.documents.map((d) => d.id));
  uniq('talk', story.talk.map((t) => t.id));
  uniq('chapter', story.chapters.map((c) => c.id));
  const chapters = [...story.chapters];
  if (!chapters.length || chapters[0].stage !== 1) err('the first chapter must start at stage 1');
  chapters.forEach((c, i) => i > 0 && c.stage <= chapters[i - 1].stage && err(`chapter ${c.id}: stages must ascend`));
  const setFlags = new Set(story.beats.flatMap((b) => effectsOf(b).flatMap((e) => e.flags ?? [])));
  const givenDocs = new Set(story.beats.flatMap((b) => effectsOf(b).flatMap((e) => e.docs ?? [])));

  const checkCond = (where: string, c: StoryCond, ownStage?: number) => {
    for (const b of c.after ?? []) if (!beats.has(b)) err(`${where}: after unknown beat ${b}`);
    for (const [b, os] of Object.entries(c.outcome ?? {})) {
      const bd = beats.get(b);
      if (!bd) err(`${where}: outcome of unknown beat ${b}`);
      else for (const o of os) if (!outcomesOf(bd).includes(o)) err(`${where}: beat ${b} (${bd.kind}) never has outcome "${o}"`);
    }
    for (const [b, os] of Object.entries(c.choice ?? {})) {
      const bd = beats.get(b);
      if (!bd) err(`${where}: choice of unknown beat ${b}`);
      else for (const o of os) if (!bd.choice?.some((x) => x.id === o)) err(`${where}: beat ${b} has no choice option "${o}"`);
    }
    for (const f of [...(c.flags ?? []), ...(c.notFlags ?? [])]) if (!setFlags.has(f)) err(`${where}: flag "${f}" is never set`);
    for (const d of c.docs ?? []) if (!docs.has(d)) err(`${where}: unknown document ${d}`);
    if (ownStage !== undefined)
      for (const b of [...(c.after ?? []), ...Object.keys(c.outcome ?? {}), ...Object.keys(c.choice ?? {})]) {
        const dep = beats.get(b);
        if (dep && (dep.when.stage ?? 1) > ownStage) warn(`${where}: depends on ${b}, which has a later stage`);
      }
    if ((c.stage ?? 1) > maxStage) err(`${where}: stage ${c.stage} does not exist`);
  };

  for (const b of story.beats) {
    const where = `beat ${b.id}`;
    if (!chars.has(b.character)) err(`${where}: unknown character ${b.character}`);
    checkCond(where, b.when, b.when.stage ?? 1);
    if (b.kind === 'visit') {
      if (!!b.rule === !!b.recipe) err(`${where}: a visit needs exactly one of rule / recipe`);
      if (b.recipe && !shared.recipes.some((r) => r.id === b.recipe)) err(`${where}: unknown recipe ${b.recipe}`);
      if (!story.characters.find((c) => c.id === b.character)?.customer) err(`${where}: a visit needs a character who is a customer`);
    } else if (b.rule || b.recipe) err(`${where}: only visits have an order rule`);
    if (b.kind === 'delivery' && !b.slip) err(`${where}: a delivery needs a slip`);
    if (b.kind !== 'delivery' && b.slip) err(`${where}: only deliveries have a slip`);
    if (b.kind === 'delivery' && shared.town && b.slip && !ruleFor(shared.town.delivery, b.slip))
      err(`${where}: slip "${b.slip.dest.rel} ${b.slip.dest.landmark}" does not point at exactly one place`);
    for (const [k, e] of Object.entries(b.effects ?? {})) {
      if (!outcomesOf(b).includes(k)) err(`${where}: effects.${k} can never apply to a ${b.kind}`);
      for (const d of e?.docs ?? []) if (!docs.has(d)) err(`${where}: gives unknown document ${d}`);
    }
    for (const c of b.choice ?? []) for (const d of c.effects?.docs ?? []) if (!docs.has(d)) err(`${where}: gives unknown document ${d}`);
    if (b.group && story.beats.filter((x) => x.group === b.group).length < 2) warn(`${where}: group ${b.group} has a single beat`);
  }
  for (const t of story.talk) {
    if (!chars.has(t.character)) err(`talk ${t.id}: unknown character ${t.character}`);
    if (!story.characters.find((c) => c.id === t.character)?.customer) err(`talk ${t.id}: small talk needs a customer character`);
    checkCond(`talk ${t.id}`, t.when);
  }
  for (const d of story.documents) {
    if (!givenDocs.has(d.id)) err(`document ${d.id}: no beat ever gives it`);
    if (d.readable < 1 || d.readable > maxStage) err(`document ${d.id}: readable stage ${d.readable} out of range`);
  }
  for (const id of unreachableBeats(story, maxStage)) err(`beat ${id} can never happen (its conditions are never met)`);
  return { errors, warnings };
}

/** All target-language texts of a beat (spoken or written). */
export function beatTexts(t: BeatText | undefined): string[] {
  if (!t) return [];
  const out: string[] = [];
  for (const s of [t.order, t.request, t.good, t.poor, t.prompt]) if (s) out.push(s);
  for (const l of [...(t.lines ?? []), ...(t.linesGood ?? []), ...(t.linesPoor ?? [])]) if ('say' in l) out.push(l.say);
  for (const o of Object.values(t.options ?? {})) out.push(o.text, o.reply);
  return out;
}

const docLineText = (l: string | DocLine) => (typeof l === 'string' ? l : l.text);

export function validateStoryLanguage(data: GameData, ctx: Ctx): Record<string, number> {
  const story = storyOf(data);
  if (!story) return {};
  const { err, warn, checkText } = ctx;
  const { shared: S, text: T } = story;
  const L = data.lang;
  // Validate tokens with names blanked out (names are not vocabulary); collect ids for reachability.
  const blank = (s: string) =>
    splitNames(data, T.names, s)
      .map((x) => (x.name ? ' ' : x.text))
      .join('');
  const check = (where: string, s: string) => {
    const bad = storyUnknown(data, s);
    if (bad.length) err(`${where}: words not in lexicon: ${bad.join(', ')}  («${s}»)`);
    else checkText(where, blank(s));
  };

  const recipients = new Set(data.content.town?.delivery.recipients.map((r) => r.id) ?? []);
  for (const r of T.recipients) if (!recipients.has(r.id)) err(`story recipient ${r.id} missing from the town list`);
  for (const c of S.characters) {
    if (c.customer && !data.content.customers.some((x) => x.id === c.customer)) err(`character ${c.id}: unknown customer ${c.customer}`);
    if (!c.customer && !T.characters[c.id]) err(`character ${c.id}: needs a name (story.characters)`);
  }
  for (const ch of S.chapters) if (!T.chapters[ch.id]) err(`chapter ${ch.id}: no title`);

  // Vocabulary budget: content words by stage + words the story itself introduced earlier.
  const contentStage = contentWordStages(data);
  const introduced = new Map<string, number>();
  const availableAt = (id: string, stage: number) =>
    (contentStage.get(id) ?? 99) <= stage || (introduced.get(id) ?? 99) <= stage;
  const budget = (where: string, texts: string[], stage: number, introduce: boolean) => {
    const ids = [...new Set(texts.flatMap((t) => storyWordIds(data, t)))];
    const fresh = ids.filter((id) => !availableAt(id, stage));
    if (fresh.length > MAX_NEW_PER_BEAT)
      err(`${where}: ${fresh.length} words new at stage ${stage} (max ${MAX_NEW_PER_BEAT}): ${fresh.map((id) => data.lex.byId.get(id)?.text ?? id).join(', ')}`);
    if (introduce) for (const id of fresh) if (!introduced.has(id) || introduced.get(id)! > stage) introduced.set(id, stage);
    return fresh.length;
  };
  // Process in story order: stage, then declaration.
  type Item = { stage: number; where: string; texts: string[]; introduce: boolean };
  const items: Item[] = [];
  const customerStage = new Map(data.content.customers.map((c) => [c.id, c.stage]));
  let newWords = 0;
  for (const b of S.beats) {
    const where = `story beat ${b.id}`;
    const t = T.beats[b.id];
    const stage = b.when.stage ?? 1;
    if (!t) {
      err(`${where}: no text`);
      continue;
    }
    if (b.kind === 'visit') {
      if (!t.order) err(`${where}: a visit needs an order text`);
      if (!t.good || !t.poor) err(`${where}: a visit needs good and poor reaction lines`);
      const rule = b.rule ?? data.recipes.get(b.recipe ?? '')?.rule;
      if (rule) {
        const avail = new Set(ingredientsAtStage(data, stage));
        for (const p of checkSatisfiable(rule, avail, featureFlags(featuresAtStage(data, stage)), data.ing)) err(`${where}: not satisfiable at stage ${stage}: ${p}`);
      }
      const cust = S.characters.find((c) => c.id === b.character)?.customer;
      if (cust && (customerStage.get(cust) ?? 99) > stage) err(`${where}: customer ${cust} only appears from stage ${customerStage.get(cust)}`);
    }
    if (b.kind === 'delivery') {
      if (!t.request) err(`${where}: a delivery needs a request note`);
      if (!t.recipient || !recipients.has(t.recipient)) err(`${where}: unknown recipient ${t.recipient}`);
      const unlock = data.shared.town?.delivery.unlock;
      if (unlock && unlock.minDay > stageMinDay(data, stage)) warn(`${where}: deliveries open on day ${unlock.minDay}, after stage ${stage} begins`);
    }
    if (b.choice?.length) {
      if (!t.prompt) err(`${where}: a choice needs a prompt`);
      for (const c of b.choice) if (!t.options?.[c.id]) err(`${where}: no text for option ${c.id}`);
    }
    const texts = beatTexts(t);
    texts.forEach((s, i) => check(`${where} [${i}]`, s));
    items.push({ stage, where, texts, introduce: true });
  }
  for (const x of S.talk) {
    const s = T.talk[x.id];
    if (!s) {
      err(`story talk ${x.id}: no text`);
      continue;
    }
    check(`story talk ${x.id}`, s);
    items.push({ stage: x.when.stage ?? 1, where: `story talk ${x.id}`, texts: [s], introduce: true });
  }
  for (const d of S.documents) {
    const t = T.docs[d.id];
    if (!t) {
      err(`story document ${d.id}: no text`);
      continue;
    }
    const texts = t.lines.map(docLineText);
    texts.forEach((s, i) => check(`story document ${d.id} line ${i + 1}`, s));
    for (const l of t.lines) if (typeof l !== 'string' && l.when) for (const b of Object.keys({ ...l.when.choice, ...l.when.outcome })) if (!S.beats.some((x) => x.id === b)) err(`story document ${d.id}: condition on unknown beat ${b}`);
    // A document must be readable (≤ 2 new words) by its `readable` stage; it introduces nothing earlier.
    items.push({ stage: d.readable, where: `story document ${d.id} (readable at stage ${d.readable})`, texts, introduce: true });
  }
  items.sort((a, b) => a.stage - b.stage);
  for (const it of items) newWords += budget(it.where, it.texts, it.stage, it.introduce);
  // Story words must be introduced somewhere.
  for (const e of T.lexicon) if (!introduced.has(e.id) && !contentStage.has(e.id)) warn(`story word ${e.id} («${e.text}») is never used by the story`);
  void L;
  return { storyBeats: S.beats.length, storyDocs: S.documents.length, storyNewWords: newWords };
}
