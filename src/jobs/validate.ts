/**
 * Validator part for jobs (called from src/core/validate.ts). Errors must be fixed; warnings are
 * printed by `npm run validate-content`.
 *
 * - References resolve: things → lexicon, bins / things / fields / options used by tasks exist,
 *   persons exist, link goods exist, rank ladder is 1..n with growing needs.
 * - Every in-world text tokenises (names as `{Name|@}`), template instances included.
 * - Solvable: every authored task and 30 instances of every template at every rank they can come
 *   at are solved perfectly by the archetype's own solver (and a slot task has exactly one fit).
 * - Level: a task's words may exceed its declared level (task.level, else its rank's 英検 grade) by
 *   one grade (warning beyond that; error beyond LEVEL_SLACK_ERROR grades).
 * - Lists (data/english): job words missing from vocab.json are listed (warning: tolerant but loud),
 *   phrase / grammar tags are checked against phrases.json / grammar.json when present.
 */
import type { GameData } from '../core/gamedata';
import { makeRng } from '../core/rng';
import { tokenIds } from '../core/tokenize';
import { EIKEN_GRADES } from '../core/types';
import { englishLists, listsLoaded, vocabFor } from '../curriculum/lists';
import { eikenFromKey, eikenIndex, EIKEN_KEYS, TOEIC_BANDS, toeicIndex } from '../curriculum/yardsticks';
import { evaluateTask, solveTask, slotFits } from './rules';
import { authoredInstance, rankLevelIndex, specTexts, templateInstance, type GenCtx } from './templates';
import { jobContentTexts } from './vocab';
import { featuresAt, ruleCtx } from './engine';
import type { JobContent, TaskInstance, TaskSpec } from './types';
import { GOODS } from '../content/jobs';

export const LEVEL_SLACK_WARN = 1;
export const LEVEL_SLACK_ERROR = 3;

interface Hooks {
  err: (m: string) => void;
  warn: (m: string) => void;
  checkText: (where: string, text: string, collect?: boolean) => void;
  lexRef: (where: string, id: string | undefined) => void;
}

const PH_OK = /\{(thing|Thing|bin|Bin|field|Field|name|Name|vessel|Vessel)\}/g;

export function validateJobsLanguage(data: GameData, h: Hooks): Record<string, number> {
  const jobs = data.content.jobs ?? [];
  const L = data.lang;
  let tasks = 0;
  let templates = 0;
  let instances = 0;
  const ids = new Set<string>();
  const missingVocab = new Set<string>();
  const lists = englishLists();
  for (const job of jobs) {
    const where = `job ${job.id}`;
    if (ids.has(job.id)) h.err(`${where}: duplicate job id`);
    ids.add(job.id);
    job.ranks.forEach((r, i) => {
      if (r.rank !== i + 1) h.err(`${where}: ranks must be numbered 1..n (got ${r.rank})`);
      if (i > 0 && (r.need.good < job.ranks[i - 1].need.good || r.need.words < job.ranks[i - 1].need.words)) h.err(`${where}: rank ${r.rank} needs less than rank ${r.rank - 1}`);
      if (!EIKEN_KEYS.includes(r.level.eiken)) h.err(`${where}: rank ${r.rank} level "${r.level.eiken}" is not a 英検 key`);
    });
    for (const l of job.links?.use ?? []) if (!GOODS.some((g) => g.id === l.good)) h.err(`${where}: link uses unknown good ${l.good}`);
    for (const l of job.links?.produce ?? []) if (!GOODS.some((g) => g.id === l.good)) h.err(`${where}: link produces unknown good ${l.good}`);
    for (const l of job.links?.use ?? []) if (l.line) h.checkText(`${where} link line`, l.line);
    const jc = job.content[L];
    if (job.legacy || !jc) continue;
    const people = new Set([...jc.people.map((p) => p.id)]);
    const personOk = (id: string | undefined, w: string) => {
      if (!id || id === 'client') return;
      if (!people.has(id)) h.err(`${w}: person ${id} is not in the job's people`);
      const p = jc.people.find((x) => x.id === id);
      if (p && !p.name && !data.content.customers.some((c) => c.id === id)) h.err(`${w}: person ${id} has no name and is not a customer`);
    };
    personOk(jc.boss, `${where} boss`);
    for (const p of jc.people) personOk(p.id, `${where} people`);
    for (const t of jc.things) {
      h.lexRef(`${where} thing ${t.id}`, t.word);
      if (job.archetypes.includes('trade') && t.tags?.includes('counter') && !t.price) h.err(`${where} thing ${t.id}: counter goods need a price`);
      if (t.unit && !t.unit.includes('{n}')) h.err(`${where} thing ${t.id}: unit pattern needs {n}`);
    }
    for (const v of [...(jc.make?.vessels ?? []), ...(jc.make?.methods ?? [])]) h.lexRef(`${where} bench ${v.id}`, v.word);
    // Every content text tokenises (this also marks the job's words as reachable).
    for (const txt of jobContentTexts(jc)) h.checkText(where, txt);
    for (const r of jc.reactions) {
      const extra = r.text.replace(PH_OK, '').match(/\{[A-Za-z]+\}/);
      if (extra) h.err(`${where} reaction ${r.id}: unknown placeholder ${extra[0]}`);
    }
    for (const k of ['perfect', 'any_fail'] as const) if (!jc.reactions.some((r) => r.kind === k && (r.rank ?? 1) <= 1)) h.err(`${where}: needs a rank-1 "${k}" reaction`);
    for (const a of job.archetypes)
      if (a !== 'deliver' && !jc.reactions.some((r) => r.kind === 'perfect' && (!r.arch || r.arch === a))) h.err(`${where}: no "perfect" reaction usable for ${a} tasks`);
    for (const k of ['start', 'end'] as const) if (!jc.lines.some((l) => l.kind === k)) h.err(`${where}: needs a "${k}" line`);
    for (const [bank, items] of Object.entries(jc.qa ?? {})) {
      if (items.length < 3 || new Set(items.map((i) => i.fn)).size < 2) h.err(`${where} qa ${bank}: needs ≥ 3 items with ≥ 2 functions`);
    }
    // Words of the job missing from the compiled list.
    if (L === 'en' && listsLoaded())
      for (const e of jc.lexicon) if (!vocabFor(lists, e.text, e.pos, e.forms ?? [])) missingVocab.add(`${job.id}:${e.text}`);
    for (const e of jc.lexicon) if (!e.gloss && !(listsLoaded() && vocabFor(lists, e.text, e.pos, e.forms ?? []))) h.err(`${where} word ${e.id}: no gloss written and none in vocab.json`);

    const checkInstance = (w: string, inst: TaskInstance, declared: number, ctx: GenCtx, agg?: { over: Set<string>; worst: number; label: string }) => {
      instances++;
      for (const txt of inst.texts) h.checkText(w, txt);
      refsOk(w, inst.spec, jc, h);
      const rc = ruleCtx(data, jc);
      const ev = evaluateTask(inst.spec, solveTask(inst.spec, rc), rc);
      if (ev.outcome !== 'perfect') h.err(`${w}: not solvable (${ev.issues.map((i) => i.kind).join(', ')})`);
      if (inst.spec.arch === 'trade') {
        const total = inst.spec.want.reduce((s, x) => s + x.n * rc.price(x.thing), 0);
        if (inst.spec.pay < total) h.err(`${w}: the customer pays ${inst.spec.pay} for ${total}`);
      }
      // Level of the words against the declared level: a work-life job (flavour 'work') with a TOEIC
      // band on the rank is measured in TOEIC bands (a word without a band falls back to 英検).
      const over: string[] = [];
      let worst = 0;
      const toeicDecl = job.flavour === 'work' ? toeicIndex(job.ranks.find((r) => r.rank === ctx.rank)?.level.toeic ?? null) : -1;
      for (const txt of inst.texts)
        for (const id of tokenIds(data.tokens(txt))) {
          const e = data.lex.byId.get(id);
          const t = toeicIndex(e?.toeic ?? null);
          if (toeicDecl >= 0 && t >= 0) {
            if (t > toeicDecl + LEVEL_SLACK_WARN) {
              over.push(`${e?.text}(TOEIC〜${TOEIC_BANDS[t]})`);
              worst = Math.max(worst, t - toeicDecl);
            }
            continue;
          }
          const g = eikenIndex(e?.eiken ?? null);
          if (g > declared + LEVEL_SLACK_WARN) {
            over.push(`${e?.text}(${EIKEN_GRADES[g]})`);
            worst = Math.max(worst, g - declared);
          }
        }
      const label = `${toeicDecl >= 0 ? `TOEIC〜${TOEIC_BANDS[toeicDecl]}` : `${EIKEN_GRADES[declared]}級`} + ${LEVEL_SLACK_WARN}`;
      if (agg) {
        over.forEach((x) => agg.over.add(x));
        agg.worst = Math.max(agg.worst, worst);
        agg.label = label;
      } else if (over.length) (worst > LEVEL_SLACK_ERROR ? h.err : h.warn)(`${w}: words above its level (${label}): ${[...new Set(over)].join(', ')}`);
    };
    const ctxAt = (rank: number, seed: number): GenCtx => ({ data, job, jc, rank, feats: featuresAt(job, rank), rng: makeRng(seed), timedOn: true });
    const taskIds = new Set<string>();
    for (const t of jc.tasks) {
      tasks++;
      const w = `${where} task ${t.id}`;
      if (taskIds.has(t.id)) h.err(`${w}: duplicate id`);
      taskIds.add(t.id);
      if (!job.ranks.some((r) => r.rank === t.rank)) h.err(`${w}: rank ${t.rank} is not on the ladder`);
      personOk(t.person, w);
      tagsOk(w, t, h);
      const declared = t.level ? eikenIndex(eikenFromKey(t.level)) : rankLevelIndex(job, t.rank, 0);
      checkInstance(w, authoredInstance(ctxAt(t.rank, 1), t), declared, ctxAt(t.rank, 1));
    }
    for (const t of jc.templates) {
      templates++;
      const w = `${where} template ${t.id}`;
      if (taskIds.has(t.id)) h.err(`${w}: duplicate id`);
      taskIds.add(t.id);
      tagsOk(w, t, h);
      if (t.arch === 'respond' && 'bank' in t && !jc.qa?.[t.bank]) h.err(`${w}: unknown qa bank ${t.bank}`);
      for (const r of job.ranks.filter((x) => x.rank >= t.rank)) {
        let ok = 0;
        const agg = { over: new Set<string>(), worst: 0, label: '' };
        for (let seed = 1; seed <= 30; seed++) {
          const ctx = ctxAt(r.rank, seed * 7919 + r.rank);
          const inst = templateInstance(ctx, t);
          if (!inst) continue;
          ok++;
          const declared = t.level ? eikenIndex(eikenFromKey(t.level)) : rankLevelIndex(job, r.rank, 0);
          checkInstance(`${w} @rank${r.rank} «${inst.say || specTexts(inst.spec)[0] || ''}»`, inst, declared, ctx, agg);
        }
        if (agg.over.size) (agg.worst > LEVEL_SLACK_ERROR ? h.err : h.warn)(`${w} @rank${r.rank}: instances use words above the level (${agg.label}): ${[...agg.over].join(', ')}`);
        if (!ok) h.err(`${w}: cannot be instantiated at rank ${r.rank}`);
      }
    }
    for (const r of job.ranks) if (!jc.tasks.some((t) => t.rank <= r.rank) && !jc.templates.some((t) => t.rank <= r.rank)) h.err(`${where}: nothing to do at rank ${r.rank}`);
  }
  if (missingVocab.size) h.warn(`jobs: ${missingVocab.size} job word(s) not in data/english/vocab.json (reconcile when the list is complete): ${[...missingVocab].join(', ')}`);
  if (L === 'en' && !listsLoaded()) h.warn(`jobs: data/english/vocab.json is not available — levels are the hand-written tags; ${englishLists().notes.join('; ')}`);
  return { jobs: jobs.length, jobTasks: tasks, jobTemplates: templates, jobInstancesChecked: instances };
}

function tagsOk(w: string, t: { phrases?: string[]; grammar?: string[]; say?: string }, h: Hooks): void {
  const lists = englishLists();
  for (const id of t.phrases ?? []) {
    if (!lists.phrases.length) continue;
    const ph = lists.phraseById.get(id);
    if (!ph) h.warn(`${w}: phrase "${id}" is not in phrases.json`);
    else if (t.say && !norm(t.say).includes(norm(ph.text).replace(/\.\.\.|…|~/g, '').trim().split(' ').slice(0, 2).join(' '))) h.warn(`${w}: phrase "${id}" («${ph.text}») is not in the text`);
  }
  for (const id of t.grammar ?? []) if (lists.grammar.length && !lists.grammarById.has(id)) h.warn(`${w}: grammar point "${id}" is not in grammar.json`);
}

function norm(s: string): string {
  return s.toLowerCase().replace(/\{([^{}|]+)\|[^{}|]+\}/g, '$1').replace(/[^a-z' ]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function refsOk(w: string, spec: TaskSpec, jc: JobContent, h: Hooks): void {
  const thing = (id: string) => {
    if (!jc.things.some((t) => t.id === id)) h.err(`${w}: unknown thing ${id}`);
  };
  switch (spec.arch) {
    case 'make':
      spec.want.forEach((x) => thing(x.thing));
      spec.forbid?.forEach(thing);
      spec.allow?.forEach(thing);
      if (spec.vessel && !jc.make?.vessels?.some((v) => v.id === spec.vessel)) h.err(`${w}: unknown vessel ${spec.vessel}`);
      if (spec.method && !jc.make?.methods?.some((v) => v.id === spec.method)) h.err(`${w}: unknown method ${spec.method}`);
      if (!jc.make) h.err(`${w}: make task without a make bench`);
      break;
    case 'trade':
      spec.want.forEach((x) => thing(x.thing));
      if (!jc.trade) h.err(`${w}: trade task without a counter`);
      break;
    case 'sort':
      for (const b of spec.bins) if (!jc.sort?.bins.some((x) => x.id === b)) h.err(`${w}: unknown bin ${b}`);
      for (const i of spec.items) if (!spec.bins.includes(i.bin)) h.err(`${w}: item «${i.text}» goes to ${i.bin}, not among the task's bins`);
      if (new Set(spec.items.map((i) => i.id)).size !== spec.items.length) h.err(`${w}: duplicate item ids`);
      break;
    case 'check': {
      const t = spec.docs[spec.target];
      if (!t) h.err(`${w}: target document ${spec.target} missing`);
      else if (spec.wrong && !t.fields?.some((f) => f.id === spec.wrong)) h.err(`${w}: wrong field ${spec.wrong} is not on the target document`);
      if (spec.fixOptions && spec.fix !== undefined && !spec.fixOptions.includes(spec.fix)) h.err(`${w}: fix value is not among the options`);
      break;
    }
    case 'respond':
      if (spec.mode === 'choose' && (spec.answer === undefined || !spec.options?.[spec.answer])) h.err(`${w}: answer index out of range`);
      if (spec.mode === 'choose' && spec.options && new Set(spec.options).size !== spec.options.length) h.err(`${w}: duplicate reply options`);
      if (spec.mode === 'form') for (const f of spec.fields ?? []) if (!f.options.includes(f.answer)) h.err(`${w}: field ${f.id} answer is not an option`);
      if (spec.mode === 'slot') {
        if (!spec.slot?.cells.some((c) => c.id === spec.slot?.answer && !c.busy)) h.err(`${w}: slot answer is not a free cell`);
        void slotFits;
      }
      break;
  }
}
