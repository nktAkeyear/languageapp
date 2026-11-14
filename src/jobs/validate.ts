/**
 * Validator part for jobs (called from src/core/validate.ts). Errors must be fixed; warnings are
 * printed by `npm run validate-content`.
 *
 * - References resolve: things → lexicon, bins / things / fields / options used by tasks exist,
 *   persons exist, link goods exist, rank ladder is 1..n with growing needs (and every job has the same
 *   number of ranks).
 * - Every in-world text tokenises (names as `{Name|@}`), template instances included; words that come
 *   only through a template's typed slots count as used.
 * - Solvable: every authored task and 30 instances of every template at every rank they can come
 *   at are solved perfectly by the archetype's own solver (and a slot task has exactly one fit).
 * - Consistent papers: in a check task, the fields the papers share agree except the one marked wrong.
 * - Speakers: a speaker who names themselves ("I am {Mr. Lin|@}") is a person of the job (their face is
 *   drawn); a paper task without a spoken request has a hand-over line.
 * - Level: words above the rank's 英検 grade (+1) are a warning, beyond LEVEL_SLACK_ERROR grades an error
 *   (work-life jobs: TOEIC bands). Words that stand next to their drawing (things, methods, vessels, bins
 *   with a picture) are exempt: the picture carries them. Bin labels, slot labels, reactions and the boss's
 *   lines are measured too (at the rank they come from).
 * - New words along the spine: an authored task should bring at most SPINE_NEW words the player cannot
 *   have met in the job's earlier tasks (the tea house's words count as known).
 * - Lists (data/english): job words missing from vocab.json are listed (warning: tolerant but loud),
 *   phrase / grammar tags are checked against phrases.json / grammar.json when present (a phrase must
 *   occur in one of the task's texts: request, options, lines, papers).
 */
import { wordMarkup, type GameData } from '../core/gamedata';
import { makeRng } from '../core/rng';
import { tokenIds } from '../core/tokenize';
import { EIKEN_GRADES } from '../core/types';
import { englishLists, listsLoaded, vocabFor } from '../curriculum/lists';
import { eikenIndex, EIKEN_KEYS, TOEIC_BANDS, toeicIndex } from '../curriculum/yardsticks';
import { evaluateTask, postage, solveTask } from './rules';
import { authoredInstance, rankLevelIndex, selfNamed, specTexts, templateInstance, type GenCtx } from './templates';
import { jobContentTexts, templateSlotWords, templateTexts } from './vocab';
import { featuresAt, ruleCtx } from './engine';
import { jobLexiconReport } from './lexicon';
import type { JobContent, JobDef, TaskInstance, TaskSpec } from './types';
import { GOODS } from '../content/jobs';

export const LEVEL_SLACK_WARN = 1;
export const LEVEL_SLACK_ERROR = 3;
/** New words an authored task may bring (beyond the job's earlier tasks and the tea house's words). */
export const SPINE_NEW = 4;

interface Hooks {
  err: (m: string) => void;
  warn: (m: string) => void;
  checkText: (where: string, text: string, collect?: boolean) => void;
  lexRef: (where: string, id: string | undefined) => void;
}

const PH_OK = /\{(thing|Thing|bin|Bin|field|Field|name|Name|vessel|Vessel|is|Is|much|it|this|This)\}/g;

/** Words a job shows next to their drawing (exempt from the level check). */
function pictured(data: GameData, jc: JobContent): Set<string> {
  const s = new Set<string>();
  for (const t of jc.things) s.add(t.word);
  for (const v of [...(jc.make?.vessels ?? []), ...(jc.make?.methods ?? [])]) s.add(v.word);
  for (const b of jc.sort?.bins ?? []) if (b.art) for (const id of tokenIds(data.tokens(b.label))) s.add(id);
  return s;
}

export function validateJobsLanguage(data: GameData, h: Hooks): Record<string, number> {
  const jobs = data.content.jobs ?? [];
  const L = data.lang;
  let tasks = 0;
  let templates = 0;
  let instances = 0;
  const ids = new Set<string>();
  const missingVocab = new Set<string>();
  const lists = englishLists();
  const rankCounts = new Set(jobs.filter((j) => !j.legacy && j.content[L]).map((j) => j.ranks.length));
  if (rankCounts.size > 1) h.warn(`jobs: the jobs have different numbers of ranks (${[...rankCounts].join(', ')}): every job should have the same ladder`);
  // The tea house's own words count as known (the player has worked there for three days before the board opens).
  const jobWordIds = new Set(jobs.flatMap((j) => j.content[L]?.lexicon.map((e) => e.id) ?? []));
  for (const r of jobLexiconReport(data, jobs)) (r.level === 'err' ? h.err : h.warn)(r.text);
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
    const pic = pictured(data, jc);
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
      const units = typeof t.unit === 'object' ? [t.unit.one, t.unit.other] : t.unit ? [t.unit] : [];
      for (const u of units) if (!u.includes('{n}')) h.err(`${where} thing ${t.id}: unit pattern needs {n}`);
      if (t.mass && t.plural && t.plural !== data.lex.byId.get(t.word)?.text) h.warn(`${where} thing ${t.id}: a mass noun has no plural ("${t.plural}")`);
    }
    for (const v of [...(jc.make?.vessels ?? []), ...(jc.make?.methods ?? [])]) h.lexRef(`${where} bench ${v.id}`, v.word);
    // Every content text tokenises (this also marks the job's words as reachable) …
    for (const txt of jobContentTexts(jc)) h.checkText(where, txt);
    // … and so do the words that come only through template slots.
    for (const t of jc.templates) for (const id of templateSlotWords(jc, t)) if (data.lex.byId.has(id)) h.checkText(`${where} template ${t.id} slot word`, wordMarkup(data, id));
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
    if (jc.trade?.rates) {
      const rt = jc.trade.rates;
      if (rt.price.length !== rt.dests.length || rt.price.some((row) => row.length !== rt.bands.length)) h.err(`${where}: rate table is not dests × bands`);
    }
    // Words of the job missing from the compiled list.
    if (L === 'en' && listsLoaded())
      for (const e of jc.lexicon) if (!vocabFor(lists, e.text, e.pos, e.forms ?? [])) missingVocab.add(`${job.id}:${e.text}`);
    for (const e of jc.lexicon) if (!e.gloss && !(listsLoaded() && vocabFor(lists, e.text, e.pos, e.forms ?? []))) h.err(`${where} word ${e.id}: no gloss written and none in vocab.json`);

    // Level of a text's words against a rank: a work-life job (flavour 'work') with a TOEIC band on the rank is
    // measured in TOEIC bands (a word without a band falls back to 英検). Pictured words are exempt.
    const levelOver = (texts: string[], rank: number): { over: string[]; worst: number; label: string } => {
      const declared = rankLevelIndex(job, rank, 0);
      const toeicDecl = job.flavour === 'work' ? toeicIndex(job.ranks.find((r) => r.rank === rank)?.level.toeic ?? null) : -1;
      const over: string[] = [];
      let worst = 0;
      for (const txt of texts)
        for (const id of tokenIds(data.tokens(txt))) {
          if (pic.has(id)) continue;
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
      return { over: [...new Set(over)], worst, label };
    };
    const report = (w: string, r: { over: string[]; worst: number; label: string }) => {
      if (r.over.length) (r.worst > LEVEL_SLACK_ERROR ? h.err : h.warn)(`${w}: words above its level (${r.label}): ${r.over.join(', ')}`);
    };
    /** Bin labels the player reads on a sort task's cabinet. */
    const binTexts = (spec: TaskSpec): string[] => (spec.arch === 'sort' ? spec.bins.map((b) => jc.sort?.bins.find((x) => x.id === b)?.label ?? '').filter(Boolean) : []);

    const checkInstance = (w: string, inst: TaskInstance, ctx: GenCtx, agg?: { over: Set<string>; worst: number; label: string }) => {
      instances++;
      for (const txt of inst.texts) h.checkText(w, txt);
      refsOk(w, inst.spec, jc, h);
      consistencyOk(w, inst, data, jc, h);
      const rc = ruleCtx(data, jc);
      const ev = evaluateTask(inst.spec, solveTask(inst.spec, rc), rc);
      if (ev.outcome !== 'perfect') h.err(`${w}: not solvable (${ev.issues.map((i) => i.kind).join(', ')})`);
      if (inst.spec.arch === 'trade') {
        const post = inst.spec.post ? (postage(jc.trade?.rates, inst.spec.post.dest, inst.spec.post.kilos) ?? NaN) : 0;
        const total = inst.spec.want.reduce((s, x) => s + x.n * rc.price(x.thing), 0) + post;
        if (!(inst.spec.pay >= total)) h.err(`${w}: the customer pays ${inst.spec.pay} for ${total}`);
      }
      const lv = levelOver([...inst.texts, ...binTexts(inst.spec)], ctx.rank);
      if (agg) {
        lv.over.forEach((x) => agg.over.add(x));
        agg.worst = Math.max(agg.worst, lv.worst);
        agg.label = lv.label;
      } else report(w, lv);
    };
    const ctxAt = (rank: number, seed: number): GenCtx => ({ data, job, jc, rank, feats: featuresAt(job, rank), rng: makeRng(seed), timedOn: true });
    const taskIds = new Set<string>();
    // The spine, in the order it is served: new words per task.
    const known = new Set<string>();
    for (const e of data.content.lexicon) if (!jobWordIds.has(e.id)) known.add(e.id);
    for (const l of jc.lines.filter((x) => x.kind === 'start' && (x.rank ?? 1) <= 1)) for (const id of tokenIds(data.tokens(l.text))) known.add(id);
    const spineHeavy: string[] = [];
    const spine = [...jc.tasks].sort((a, b) => a.rank - b.rank || (a.seq ?? 0) - (b.seq ?? 0));
    for (const t of spine) {
      tasks++;
      const w = `${where} task ${t.id}`;
      if (taskIds.has(t.id)) h.err(`${w}: duplicate id`);
      taskIds.add(t.id);
      if (!job.ranks.some((r) => r.rank === t.rank)) h.err(`${w}: rank ${t.rank} is not on the ladder`);
      personOk(t.person, w);
      const inst = authoredInstance(ctxAt(t.rank, 1), t);
      tagsOk(w, t, inst.texts, h);
      speakerOk(w, inst, t.person, data, jc, h);
      checkInstance(w, inst, ctxAt(t.rank, 1));
      const fresh = [...new Set([...inst.texts, ...binTexts(inst.spec)].flatMap((x) => tokenIds(data.tokens(x))))].filter((id) => !known.has(id) && !pic.has(id));
      if (fresh.length > SPINE_NEW) spineHeavy.push(`${t.id}(${fresh.length}: ${fresh.map((id) => data.lex.byId.get(id)?.text ?? id).join(' ')})`);
      fresh.forEach((id) => known.add(id));
    }
    if (spineHeavy.length) h.warn(`${where}: ${spineHeavy.length} authored task(s) bring more than ${SPINE_NEW} words not met earlier in the job: ${spineHeavy.slice(0, 12).join('; ')}${spineHeavy.length > 12 ? ' …' : ''}`);
    for (const t of jc.templates) {
      templates++;
      const w = `${where} template ${t.id}`;
      if (taskIds.has(t.id)) h.err(`${w}: duplicate id`);
      taskIds.add(t.id);
      tagsOk(w, t, templateTexts(t), h);
      if (t.arch === 'respond' && 'bank' in t && !jc.qa?.[t.bank]) h.err(`${w}: unknown qa bank ${t.bank}`);
      for (const r of job.ranks.filter((x) => x.rank >= t.rank)) {
        let ok = 0;
        const agg = { over: new Set<string>(), worst: 0, label: '' };
        for (let seed = 1; seed <= 30; seed++) {
          const ctx = ctxAt(r.rank, seed * 7919 + r.rank);
          const inst = templateInstance(ctx, t);
          if (!inst) continue;
          ok++;
          const wi = `${w} @rank${r.rank} «${inst.say || specTexts(inst.spec)[0] || ''}»`;
          speakerOk(wi, inst, undefined, data, jc, h);
          checkInstance(wi, inst, ctx, agg);
        }
        if (agg.over.size) (agg.worst > LEVEL_SLACK_ERROR ? h.err : h.warn)(`${w} @rank${r.rank}: instances use words above the level (${agg.label}): ${[...agg.over].join(', ')}`);
        if (!ok) h.err(`${w}: cannot be instantiated at rank ${r.rank}`);
      }
    }
    // Reactions and the boss's lines are said at their rank: measured like a task of that rank.
    for (const r of jc.reactions) report(`${where} reaction ${r.id}`, levelOver([r.text.replace(PH_OK, ' ')], r.rank ?? 1));
    for (const l of jc.lines) report(`${where} line ${l.id}`, levelOver([l.text], l.rank ?? 1));
    for (const b of jc.sort?.bins ?? []) {
      const first = Math.min(...[...jc.tasks.filter((t) => t.arch === 'sort' && t.bins.includes(b.id)).map((t) => t.rank), ...jc.templates.filter((t) => t.arch === 'sort' && t.bins.includes(b.id)).map((t) => t.rank)]);
      if (Number.isFinite(first)) report(`${where} bin ${b.id}`, levelOver([b.label], first));
    }
    for (const r of job.ranks) if (!jc.tasks.some((t) => t.rank <= r.rank) && !jc.templates.some((t) => t.rank <= r.rank)) h.err(`${where}: nothing to do at rank ${r.rank}`);
  }
  if (missingVocab.size) h.warn(`jobs: ${missingVocab.size} job word(s) not in data/english/vocab.json (reconcile when the list is complete): ${[...missingVocab].join(', ')}`);
  if (L === 'en' && !listsLoaded()) h.warn(`jobs: data/english/vocab.json is not available — levels are the hand-written tags; ${englishLists().notes.join('; ')}`);
  return { jobs: jobs.length, jobTasks: tasks, jobTemplates: templates, jobInstancesChecked: instances };
}

/** A speaker who names themselves is a person of the job, and the task's person (their face) is them. */
function speakerOk(w: string, inst: TaskInstance, declared: string | undefined, data: GameData, jc: JobContent, h: Hooks): void {
  if (inst.handover) return;
  const spoken = inst.spec.arch === 'respond' && inst.spec.msg.kind !== 'speech' ? inst.say : [inst.say, ...(inst.spec.arch === 'respond' && inst.spec.msg.kind === 'speech' ? inst.spec.msg.lines : [])].join(' ');
  const self = selfNamed(data, jc, spoken);
  if (!self) return;
  if (!self.id) h.warn(`${w}: the speaker calls themselves "${self.name}", who is not a person of the job (no face for the name)`);
  else if (self.id !== inst.person) h.err(`${w}: the speaker calls themselves "${self.name}" but the person drawn is ${declared ?? inst.person}`);
  if (!inst.say && inst.spec.arch === 'respond' && inst.spec.msg.kind !== 'speech') h.warn(`${w}: a ${inst.spec.msg.kind} task with nothing said (add a "handover" line)`);
}

/** The papers of a check task agree except on the field marked wrong. */
function consistencyOk(w: string, inst: TaskInstance, _data: GameData, _jc: JobContent, h: Hooks): void {
  const s = inst.spec;
  if (s.arch === 'respond' && s.mode !== 'speech' && !inst.say && !inst.handover && s.msg.kind !== 'speech') h.warn(`${w}: a ${s.msg.kind} task with nothing said (add a "handover" line)`);
  if (s.arch !== 'check') return;
  const target = s.docs[s.target];
  if (!target?.fields) return;
  const differs = new Set<string>();
  for (const f of target.fields)
    for (const [i, d] of s.docs.entries()) {
      if (i === s.target) continue;
      const g = d.fields?.find((x) => x.id === f.id);
      if (g && g.value !== f.value) differs.add(f.id);
    }
  if (s.wrong === null && differs.size) h.err(`${w}: marked "all in order" but the papers disagree on ${[...differs].join(', ')}`);
  if (s.wrong !== null && [...differs].some((id) => id !== s.wrong)) h.err(`${w}: besides ${s.wrong}, the papers also disagree on ${[...differs].filter((id) => id !== s.wrong).join(', ')}`);
  const refHas = s.docs.some((d, i) => i !== s.target && d.fields?.some((x) => x.id === s.wrong));
  if (s.wrong !== null && refHas && !differs.has(s.wrong)) h.err(`${w}: the field marked wrong (${s.wrong}) is the same on every paper`);
}

function tagsOk(w: string, t: { phrases?: string[]; grammar?: string[] }, texts: string[], h: Hooks): void {
  const lists = englishLists();
  const all = norm(texts.join(' | '));
  for (const id of t.phrases ?? []) {
    if (!lists.phrases.length) continue;
    const ph = lists.phraseById.get(id);
    if (!ph) h.warn(`${w}: phrase "${id}" is not in phrases.json`);
    else {
      const key = norm(ph.text).replace(/\.\.\.|…|~/g, '').trim().split(' ').filter(Boolean).slice(0, 2).join(' ');
      if (key && !all.includes(key)) h.warn(`${w}: phrase "${id}" («${ph.text}») is not in the task's texts`);
    }
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
      spec.dislike?.forEach(thing);
      spec.allow?.forEach(thing);
      spec.out?.forEach(thing);
      if (spec.out?.some((o) => spec.want.some((x) => x.thing === o))) h.err(`${w}: wants a thing the pantry is out of`);
      if (spec.order?.some((o) => !spec.want.some((x) => x.thing === o))) h.err(`${w}: order names a thing that is not wanted`);
      if (spec.vessel && !jc.make?.vessels?.some((v) => v.id === spec.vessel)) h.err(`${w}: unknown vessel ${spec.vessel}`);
      if (spec.method && !jc.make?.methods?.some((v) => v.id === spec.method)) h.err(`${w}: unknown method ${spec.method}`);
      if (!jc.make) h.err(`${w}: make task without a make bench`);
      for (const x of spec.want) if (jc.things.find((t) => t.id === x.thing)?.tags?.includes('delivery')) h.err(`${w}: wants ${x.thing}, which is not in the pantry`);
      break;
    case 'trade':
      spec.want.forEach((x) => thing(x.thing));
      if (!jc.trade) h.err(`${w}: trade task without a counter`);
      if (spec.post && postage(jc.trade?.rates, spec.post.dest, spec.post.kilos) === null) h.err(`${w}: no postage on the rate table for ${spec.post.dest} / ${spec.post.kilos} kilos`);
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
      if (spec.fixOptions && new Set(spec.fixOptions).size !== spec.fixOptions.length) h.err(`${w}: duplicate fix options`);
      break;
    }
    case 'respond':
      if (spec.mode === 'choose' && (spec.answer === undefined || !spec.options?.[spec.answer])) h.err(`${w}: answer index out of range`);
      if (spec.mode === 'choose' && spec.options && new Set(spec.options).size !== spec.options.length) h.err(`${w}: duplicate reply options`);
      if (spec.mode === 'form')
        for (const f of spec.fields ?? []) {
          if (!f.options.includes(f.answer)) h.err(`${w}: field ${f.id} answer is not an option`);
          if (new Set(f.options).size !== f.options.length) h.err(`${w}: field ${f.id} has duplicate options`);
        }
      if (spec.mode === 'slot' && !spec.slot?.cells.some((c) => c.id === spec.slot?.answer && !c.busy)) h.err(`${w}: slot answer is not a free cell`);
      break;
  }
}

export type { JobDef };
