/**
 * Jobs engine: the town's job board, the parts of the day (朝 / 昼 / 夕), shifts of tasks, ranks,
 * wages and the goods jobs make for each other. UI-agnostic; called by the UI (GameApi.jobs) and by
 * src/activities/day.ts at the start / end of a day.
 *
 * Day model. Until the job board opens (calendar day BOARD_DAY) a day is exactly the original tea
 * house day (market → shop → delivery). Afterwards each morning starts in the town (the hub): the
 * player chooses where to work for each part of the day. The tea house is planned every morning as
 * before and, when chosen, runs its own segments from the current part on (market 朝, shop 昼,
 * delivery 夕; a later start skips the earlier ones). Any other job fills one part with a shift of
 * tasks. A day without the tea house leaves the shop closed: its planned customers do not come, its
 * stage clock does not move (no stage runs ahead while the player works elsewhere) and a planned
 * story beat waits for another day.
 */
import { wordMarkup, type GameData } from '../core/gamedata';
import { pick, type Rng } from '../core/rng';
import type { LangProgress } from '../core/save';
import { isKnown, recordEncounter, recordLapse, recordSuccess, reviewWeight } from '../core/srs';
import { tokenIds } from '../core/tokenize';
import type { Face, Outcome } from '../core/types';
import { difficultyOnTask, difficultyState } from '../core/difficulty';
import { selectNext } from '../curriculum/curriculum';
import type { Yardstick } from '../curriculum/yardsticks';
import { fill } from '../activities/town/text';
import { evaluateTask, postage, type RuleCtx } from './rules';
import { authoredInstance, personName, personOf, rankLevelIndex, templateInstance, thingAgreement, thingById, thingName, type GenCtx } from './templates';
import { jobVocab } from './vocab';
import type {
  JobContent,
  JobDayState,
  JobDef,
  JobEvaluation,
  JobIssue,
  JobProgress,
  JobReaction,
  JobsState,
  RankDef,
  ShiftState,
  TaskAnswer,
  TaskFeature,
  TaskInstance,
  TaskResult,
  TaskSpec,
} from './types';

export const BOARD_DAY = 4;
export const TEAHOUSE = 'teahouse';
/** The rank ladder shared by every job (original names: the tide coming in, then the lighthouse). */
export const RANK_NAMES = ['さざ波', '潮だまり', '満ち潮', '大潮', '灯台'];
export const PART_NAMES = ['朝', '昼', '夕方'];

export function rankName(rank: number): string {
  return RANK_NAMES[rank - 1] ?? `${rank}`;
}

// ---------------------------------------------------------------------------- registry

export function jobsOf(data: GameData): JobDef[] {
  return (data.content.jobs ?? []).filter((j) => j.legacy || j.content[data.lang]);
}

export function jobById(data: GameData, id: string): JobDef | undefined {
  return jobsOf(data).find((j) => j.id === id);
}

export function jobContent(data: GameData, job: JobDef): JobContent | undefined {
  return job.content[data.lang];
}

export function hasJobs(data: GameData): boolean {
  return jobsOf(data).some((j) => !j.legacy);
}

export function yardstickOf(p: LangProgress): Yardstick {
  return p.difficulty?.yardstick ?? 'eiken';
}

// ---------------------------------------------------------------------------- state

export function newJobsState(): JobsState {
  return { jobs: {}, goods: {}, wordJobs: {}, day: null, timed: false, seen: [] };
}

export function jobsState(p: LangProgress): JobsState {
  if (!p.jobs) p.jobs = newJobsState();
  const s = p.jobs;
  s.jobs ??= {};
  s.goods ??= {};
  s.wordJobs ??= {};
  s.seen ??= [];
  if (s.day === undefined) s.day = null;
  return s;
}

export function newJobProgress(day: number): JobProgress {
  return { since: day, rank: 1, tasks: 0, good: 0, perfect: 0, shifts: 0, authored: {}, rankDays: { 1: day } };
}

export function jobProgress(p: LangProgress, id: string): JobProgress {
  const s = jobsState(p);
  return (s.jobs[id] ??= newJobProgress(p.day));
}

/** Is the workplace open in this part of the day (its hours)? */
export function jobOpenAt(job: JobDef, part: number): boolean {
  return job.legacy || !job.hours || job.hours.includes(part);
}

/** The workplace's hours in words (Japanese chrome), e.g. 「朝・昼」. */
export function jobHoursJa(job: JobDef): string {
  return (job.hours ?? [0, 1, 2]).map((h) => PART_NAMES[h]).join('・');
}

/**
 * Something new is waiting there: a job newly offered (not yet visited), or authored tasks of the player's rank
 * not met yet (the rank's own new material).
 */
export function jobHasNew(data: GameData, p: LangProgress, job: JobDef): boolean {
  if (job.legacy || !jobOffered(p, job)) return false;
  const s = p.jobs;
  if (!s?.seen.includes(job.id)) return true;
  const jp = s.jobs[job.id];
  const rank = jp?.rank ?? 1;
  return (job.content[data.lang]?.tasks ?? []).some((t) => t.rank === rank && !(jp?.authored[t.id]?.attempts ?? 0));
}

/** Is the job offered on the board today? */
export function jobOffered(p: LangProgress, job: JobDef): boolean {
  const s = p.jobs;
  if (job.legacy) return true;
  if (!s?.boardOpen) return false;
  // A job the start level placed at a rank is offered at once (jobs/placement.ts).
  return p.day >= s.boardOpen + job.opensAfter || !!s.jobs[job.id]?.placed;
}

// ---------------------------------------------------------------------------- the day

/** Which scene the player is in. Without the board: the tea house (the original game). */
export function jobView(p: LangProgress): JobDayState['view'] {
  const d = p.jobs?.day;
  if (!d || d.day !== p.day) return 'teahouse';
  return d.view;
}

export function jobDay(p: LangProgress): JobDayState | null {
  const d = p.jobs?.day;
  return d && d.day === p.day ? d : null;
}

const SEG_PART: Record<string, number> = { market: 0, shop: 1, delivery: 2 };

/** Called at the end of startTownDay (after the tea house planned its day). */
export function jobsStartDay(data: GameData, p: LangProgress): void {
  if (!hasJobs(data)) return;
  const s = jobsState(p);
  const notes: string[] = [...(s.pending ?? [])];
  delete s.pending;
  if (!s.boardOpen && p.day >= BOARD_DAY) {
    s.boardOpen = p.day;
    notes.push('町の掲示板に、仕事の募集が貼り出された。朝は町に出て、どこで働くか選べる。茶房のほかにも、いろいろな仕事がある。');
  }
  if (!s.boardOpen) {
    s.day = null;
    if (notes.length && p.today) p.today.notes.push(...notes);
    return;
  }
  for (const j of jobsOf(data))
    if (!j.legacy && jobOffered(p, j) && p.day === s.boardOpen + j.opensAfter && p.day !== s.boardOpen) notes.push(`掲示板に新しい募集：「${j.nameJa}」。`);
  s.day = { day: p.day, part: 0, view: 'hub', tea: 'none', log: [], shift: null, notes };
}

/** A save made before the board existed / a migrated day in progress: join the day where it is. */
export function jobsEnsureDay(data: GameData, p: LangProgress): void {
  if (!hasJobs(data) || !p.jobs?.boardOpen) return;
  const s = jobsState(p);
  if (s.day && s.day.day === p.day) return;
  // A day already running in the tea house (e.g. loaded mid-day) continues there.
  const started = !!p.today && (p.today.index > 0 || p.today.phase !== 'order' || (p.townDay?.seg ?? 0) > 0);
  s.day = { day: p.day, part: started ? SEG_PART[p.townDay?.segments[p.townDay.seg] ?? 'shop'] : 0, view: started ? 'teahouse' : 'hub', tea: started ? 'active' : 'none', log: [], shift: null, notes: [] };
}

/** Choose where to work for the current part. Returns a Japanese reason when not possible. */
export function chooseJob(data: GameData, p: LangProgress, jobId: string, rng: Rng): string | null {
  const d = jobDay(p);
  const job = jobById(data, jobId);
  if (!d || !job) return '今日は選べません';
  if (d.view !== 'hub' || d.part > 2) return 'もう今日の仕事は終わりです';
  if (!jobOffered(p, job)) return 'まだ募集していません';
  if (!jobOpenAt(job, d.part)) return `今は閉まっています（${jobHoursJa(job)}に開いています）`;
  const s = jobsState(p);
  if (!s.seen.includes(job.id)) s.seen.push(job.id);
  if (job.legacy) {
    if (d.tea !== 'none') return '茶房は今日もう開けました';
    const td = p.townDay;
    if (td) {
      const keep = td.segments.filter((seg) => SEG_PART[seg] >= d.part || seg === 'shop');
      if (!keep.includes('market') && td.market && !td.market.done) {
        delete td.market;
        // No shopping today: the shop uses what is in the back (goods are not counted; supplies from the back
        // room are paid per cup, so skipping the market is no cheaper than shopping).
        td.stock = {};
        td.fromBack = true;
      }
      if (!keep.includes('delivery')) delete td.delivery;
      td.segments = keep;
      td.seg = 0;
      if (td.segments[0] === 'shop' && td.notes.length && p.today && !p.today.notes.length) p.today.notes.push(...td.notes);
    }
    d.view = 'teahouse';
    d.tea = 'active';
    jobProgress(p, job.id);
    return null;
  }
  if (d.log.some((l) => l.job === job.id)) return 'この仕事には今日もう行きました';
  d.shift = planShift(data, p, job, d.part, rng);
  d.view = 'job';
  return null;
}

/** The tea house's day is over (shop closed, delivery done or none): back to the town if parts are left. */
export function teaToTown(p: LangProgress): void {
  const d = jobDay(p);
  if (!d || d.view !== 'teahouse') return;
  const segs = p.townDay?.segments ?? ['shop'];
  const last = Math.max(...segs.map((x) => SEG_PART[x] ?? 1));
  d.tea = 'done';
  d.part = last + 1;
  d.view = 'hub';
  d.log.push({ part: SEG_PART[segs[0]] ?? 1, job: TEAHOUSE, tasks: p.today?.results.length ?? 0, good: (p.today?.results ?? []).filter((r) => r.outcome === 'perfect' || r.outcome === 'minor').length, coins: 0 });
}

/** Can the player leave the closed tea house for another job today? */
export function canGoToTown(p: LangProgress): boolean {
  const d = jobDay(p);
  if (!d || d.view !== 'teahouse') return false;
  const segs = p.townDay?.segments ?? ['shop'];
  return !segs.includes('delivery') && (SEG_PART[segs[segs.length - 1]] ?? 1) < 2;
}

/**
 * Before the day ends from the town: a tea house that was not worked today stays closed (its
 * customers come another day; its stage clock holds still for the day).
 */
export function jobsCloseDay(_data: GameData, p: LangProgress): void {
  const d = jobDay(p);
  if (!d) return;
  if (d.tea === 'none' && p.today) {
    p.today.phase = 'closed';
    p.today.queue = p.today.queue.slice(0, p.today.results.length);
    p.today.index = p.today.queue.length;
    if (p.townDay) {
      p.townDay.segments = ['shop'];
      p.townDay.seg = 0;
      delete p.townDay.market;
      delete p.townDay.delivery;
      p.townDay.stock = {};
    }
    const diff = difficultyState(p);
    diff.clockOffset = Math.round((diff.clockOffset - 1) * 1000) / 1000;
  }
  if (d.tea === 'active') d.tea = 'done';
  d.part = 3;
  d.view = 'hub';
}

/** Is the day's work over (the player can only go home)? */
export function dayWorkOver(p: LangProgress): boolean {
  const d = jobDay(p);
  return !!d && d.part > 2;
}

/** End of the day (from endTownDay, before the story's ledger): the tea house's own progress and links. */
export function jobsEndDay(data: GameData, p: LangProgress): void {
  if (!hasJobs(data)) return;
  const s = jobsState(p);
  const d = jobDay(p);
  const tea = jobById(data, TEAHOUSE);
  const worked = !d || d.tea !== 'none' || (p.today?.results.length ?? 0) > 0;
  if (tea && worked && p.today) {
    const jp = jobProgress(p, TEAHOUSE);
    const res = p.today.results;
    const deliv = p.townDay?.delivery?.result;
    jp.tasks += res.length + (deliv ? 1 : 0);
    const good = res.filter((r) => r.outcome === 'perfect' || r.outcome === 'minor').length + (deliv && (deliv.outcome === 'perfect' || deliv.outcome === 'minor') ? 1 : 0);
    jp.good += good;
    jp.perfect += res.filter((r) => r.outcome === 'perfect').length;
    if (res.length) jp.shifts++;
    const perfect = res.filter((r) => r.outcome === 'perfect').length;
    // Links: the tea house makes tea packets for the town, and uses bread from the kitchen.
    let bonus = 0;
    for (const pr of tea.links?.produce ?? []) s.goods[pr.good] = (s.goods[pr.good] ?? 0) + pr.perPerfect * perfect;
    for (const u of tea.links?.use ?? []) {
      const n = Math.min(s.goods[u.good] ?? 0, perfect);
      if (n > 0) {
        s.goods[u.good] -= n;
        bonus += n * u.bonus;
      }
    }
    if (bonus) p.town.money += bonus;
    if (d) {
      const entry = d.log.find((l) => l.job === TEAHOUSE);
      if (entry) {
        entry.tasks = res.length;
        entry.good = good;
        entry.coins = bonus;
      } else d.log.push({ part: 1, job: TEAHOUSE, tasks: res.length, good, coins: bonus });
    }
    const up = checkRankUp(data, p, tea);
    if (up) (s.pending ??= []).push(`茶房での働きぶりが認められた。茶房の位が「${rankName(up)}」になった。`);
  }
}

// ---------------------------------------------------------------------------- ranks

export interface RankStatus {
  rank: number;
  def: RankDef;
  next: RankDef | null;
  good: number;
  words: number;
  /** Words of the job's vocabulary. */
  vocab: number;
}

export function confirmedJobWords(data: GameData, p: LangProgress, job: JobDef): number {
  let n = 0;
  for (const id of jobVocab(data, job)) if (isKnown(p.words[id])) n++; // confirmed, or assumed known by the start level
  return n;
}

export function rankStatus(data: GameData, p: LangProgress, job: JobDef): RankStatus {
  const jp = p.jobs?.jobs[job.id];
  const rank = jp?.rank ?? 1;
  const def = job.ranks.find((r) => r.rank === rank) ?? job.ranks[0];
  const next = job.ranks.find((r) => r.rank === rank + 1) ?? null;
  return { rank, def, next, good: goodCredit(jp), words: confirmedJobWords(data, p, job), vocab: jobVocab(data, job).size };
}

/**
 * The ladder policy (every job): the next rank opens when its thresholds are met — tasks done well and the
 * job's words confirmed — AND most of the current rank's authored spine has been met (SPINE_SEEN of the
 * authored tasks of this rank and below have been tried at least once), so a rank's own material is not
 * skipped by a quick player. The tea house (legacy) has no authored spine here: thresholds only.
 */
export const SPINE_SEEN = 0.8;

/** Tasks done well, counting the ranks below a start-level placement as done (jobs/placement.ts). */
export function goodCredit(jp: JobProgress | undefined): number {
  return (jp?.good ?? 0) + (jp?.placed?.good ?? 0);
}

/** Lowest rank whose authored tasks are new material (ranks below a start-level placement are review only). */
export function spineFrom(jp: JobProgress | undefined): number {
  return jp?.placed?.rank ?? 1;
}

/** Share of the authored tasks up to `rank` that have been tried (1 when there are none). */
export function spineSeen(data: GameData, p: LangProgress, job: JobDef, rank: number): { seen: number; total: number; share: number } {
  const jc = job.content[data.lang];
  const jp = p.jobs?.jobs[job.id];
  const all = (jc?.tasks ?? []).filter((t) => t.rank <= rank && t.rank >= spineFrom(jp));
  const seen = all.filter((t) => (jp?.authored[t.id]?.attempts ?? 0) > 0).length;
  return { seen, total: all.length, share: all.length ? seen / all.length : 1 };
}

/** Rank up while the next rank's needs are met; rewards are paid. Returns the new rank or null. */
export function checkRankUp(data: GameData, p: LangProgress, job: JobDef): number | null {
  const jp = jobProgress(p, job.id);
  let changed: number | null = null;
  for (;;) {
    const next = job.ranks.find((r) => r.rank === jp.rank + 1);
    if (!next) break;
    if (goodCredit(jp) < next.need.good || confirmedJobWords(data, p, job) < next.need.words) break;
    if (!job.legacy && spineSeen(data, p, job, jp.rank).share < SPINE_SEEN) break;
    jp.rank = next.rank;
    jp.rankDays[next.rank] = p.day;
    if (next.reward?.coins) p.town.money += next.reward.coins;
    if (next.reward?.good) {
      const g = jobsState(p).goods;
      g[next.reward.good.id] = (g[next.reward.good.id] ?? 0) + next.reward.good.n;
    }
    changed = next.rank;
  }
  return changed;
}

export function featuresAt(job: JobDef, rank: number): Set<TaskFeature> {
  const f = new Set<TaskFeature>();
  for (const r of job.ranks) if (r.rank <= rank) for (const x of r.unlocks ?? []) f.add(x);
  return f;
}

// ---------------------------------------------------------------------------- shifts

function genCtx(data: GameData, p: LangProgress, job: JobDef, jc: JobContent, rank: number, rng: Rng): GenCtx {
  return { data, job, jc, rank, feats: featuresAt(job, rank), rng, timedOn: !!p.jobs?.timed };
}

function unseen(data: GameData, p: LangProgress, inst: TaskInstance): string[] {
  const out = new Set<string>();
  for (const t of inst.texts) for (const id of tokenIds(data.tokens(t))) if (!(p.words[id]?.seen ?? 0)) out.add(id);
  return [...out];
}

/** New words a shift may introduce (grows a little with rank). */
export function newWordBudget(rank: number): number {
  return 6 + rank;
}

/**
 * Plan a shift: the job's authored tasks first (its curriculum spine, in rank / seq order, within the
 * new-word budget), then template instances chosen for review (due / weak words) and for the
 * curriculum's next words in the chosen yardstick's order, mixing the job's archetypes.
 */
export function planShift(data: GameData, p: LangProgress, job: JobDef, part: number, rng: Rng): ShiftState {
  const jc = job.content[data.lang]!;
  const jp = jobProgress(p, job.id);
  const rank = jp.rank;
  const def = job.ranks.find((r) => r.rank === rank) ?? job.ranks[0];
  const ctx = genCtx(data, p, job, jc, rank, rng);
  const n = def.tasks;
  const budget = newWordBudget(rank);
  const sel = selectNext(data, p, { yardstick: yardstickOf(p), domains: job.domains, vocab: jobVocab(data, job), maxStep: yardstickOf(p) === 'eiken' ? rankLevelIndex(job, rank) : undefined, n: 24 });
  const next = new Set(sel.teachable.map((t) => t.id));
  const tasks: TaskInstance[] = [];
  let fresh = 0;
  const hasTemplates = jc.templates.some((t) => t.rank <= rank);
  const spine = jc.tasks.filter((t) => t.rank <= rank && t.rank >= spineFrom(jp) && !jp.authored[t.id]?.perfect).sort((a, b) => a.rank - b.rank || (a.seq ?? 0) - (b.seq ?? 0));
  // The spine fills the shift; a longer shift (5–6 tasks) keeps one place for review from the templates.
  const spineSlots = hasTemplates && n >= 5 ? n - 1 : n;
  for (const t of spine) {
    if (tasks.length >= spineSlots) break;
    const inst = authoredInstance(ctx, t);
    const nw = unseen(data, p, inst).length;
    // The first two of the spine always come (a new job must show its new kinds of task); then the budget.
    if (tasks.length >= 2 && fresh + nw > budget) break;
    tasks.push(inst);
    fresh += nw;
  }
  const score = (inst: TaskInstance): number => {
    const ids = new Set<string>();
    for (const t of inst.texts) for (const id of tokenIds(data.tokens(t))) ids.add(id);
    let sc = 0;
    let nw = 0;
    let nextHits = 0;
    for (const id of ids) {
      const w = p.words[id];
      if (!w?.seen) {
        nw++;
        if (next.has(id)) nextHits++;
      } else sc += reviewWeight(w, p.day);
    }
    sc += Math.min(nextHits, 2) * 3;
    if (fresh + nw > budget) sc -= 5 * (fresh + nw - budget);
    return sc + rng();
  };
  let guard = 0;
  while (tasks.length < n && guard++ < 40) {
    const pool = jc.templates.filter((t) => t.rank <= rank);
    if (!pool.length) break;
    // Mix the archetypes: prefer one not used yet in this shift.
    const used = new Set(tasks.map((t) => t.spec.arch));
    const fresher = pool.filter((t) => !used.has(t.arch));
    const from = fresher.length && rng() < 0.7 ? fresher : pool;
    let best: TaskInstance | null = null;
    let bestScore = -Infinity;
    for (let i = 0; i < 10; i++) {
      // The rank's own material comes most; older templates keep coming as review.
      const weights = from.map((t) => (t.weight ?? 1) * (t.rank === rank ? 3 : t.rank === rank - 1 ? 1.5 : 0.6));
      let r = rng() * weights.reduce((a, b) => a + b, 0);
      let tm = from[0];
      for (let k = 0; k < from.length; k++) {
        r -= weights[k];
        if (r <= 0) {
          tm = from[k];
          break;
        }
      }
      const inst = templateInstance(ctx, tm);
      if (!inst || tasks.some((x) => x.key === inst.key)) continue;
      const sc = score(inst);
      if (sc > bestScore) {
        best = inst;
        bestScore = sc;
      }
    }
    if (!best) continue;
    tasks.push(best);
    fresh += unseen(data, p, best).length;
  }
  const line = (kind: 'start' | 'end') => {
    const c = jc.lines.filter((l) => l.kind === kind && (l.rank ?? 1) <= rank);
    return c.length ? pick(rng, c).text : '';
  };
  return { job: job.id, part, tasks, index: 0, phase: 'intro', results: [], startLine: line('start'), endLine: line('end'), rankUp: null };
}

export function currentShift(p: LangProgress): ShiftState | null {
  return jobDay(p)?.shift ?? null;
}

export function currentTask(p: LangProgress): TaskInstance | null {
  const s = currentShift(p);
  if (!s || s.phase === 'done' || s.phase === 'intro') return null;
  return s.tasks[s.index] ?? null;
}

function tagWords(p: LangProgress, ids: string[], job: string): void {
  const m = jobsState(p).wordJobs;
  for (const id of ids) {
    const a = (m[id] ??= []);
    if (!a.includes(job)) a.push(job);
  }
}

/** The task is shown: its texts count as encounters (the boss's greeting too, on the first). */
export function presentTask(data: GameData, p: LangProgress): void {
  const s = currentShift(p);
  const t = currentTask(p);
  if (!s || !t) return;
  for (const txt of t.audioOnly ? [] : t.texts) {
    const ids = tokenIds(data.tokens(txt));
    recordEncounter(p.words, ids, p.day, txt);
    tagWords(p, ids, s.job);
  }
}

/** Start the shift's tasks (after the boss's greeting). */
export function beginShift(data: GameData, p: LangProgress): void {
  const s = currentShift(p);
  if (!s || s.phase !== 'intro') return;
  const job = jobById(data, s.job);
  if (s.startLine && job) recordEncounter(p.words, tokenIds(data.tokens(s.startLine)), p.day, s.startLine);
  s.phase = s.tasks.length ? 'task' : 'done';
  presentTask(data, p);
}

export function ruleCtx(data: GameData, jc: JobContent): RuleCtx {
  return {
    price: (t) => thingById(jc, t)?.price ?? 0,
    words: (t) => {
      const th = thingById(jc, t);
      return th ? [thingName(data, th), thingName(data, th, true)] : [];
    },
    rate: (spec) => (spec.post ? postage(jc.trade?.rates, spec.post.dest, spec.post.kilos) : null),
  };
}

/** A reaction's own conditions: `needs` / `not` patterns on the task's texts, and who says it (`voice`). */
export function reactionSuits(r: Pick<JobReaction, 'needs' | 'not' | 'voice'>, inst: Pick<TaskInstance, 'texts' | 'handover'>): boolean {
  const req = (inst.texts ?? []).join(' ');
  return (!r.needs || new RegExp(r.needs, 'i').test(req)) && (!r.not || !new RegExp(r.not, 'i').test(req)) && (!r.voice || (r.voice === 'boss') === !!inst.handover);
}

const CHILD = /\b(sons?|daughters?|child|children|kids?|boys?|girls?|baby)\b/i;
const OTHER = /\b(sons?|daughters?|child|children|kids?|boys?|girls?|baby|husband|wife|mother|father|grandmother|grandfather|family|friends?|guests?|patients?|he|she|him|her)\b|\|@\}\s+(can't|cannot|wants|likes|says|is|has)\b/i;
const GROUP = /\b(we|us|our|both|everyone|all of us)\b/i;
/** Lines only the one who will eat / receive the work can say ("My plate is empty!", "I am still hungry"). */
const EATER =
  /\b(my (plate|food|teeth|stomach|tummy)|I am (still |so |a )?hungry|hungry (man|woman)|I can't stop eating|I am full|I am greedy|for me\b|I can't eat|I don't like|I will eat|good for me|my allergy|the way I like it|how I like it|the bread I bake|tell the chef|told me about this kitchen|name of this dish|best food that I have ever had|tell my friends|tell people about this kitchen)/i;
/** The request is for someone else: a dish for a guest, a recipe card, a ticket, a contract. */
const FOR_OTHER =
  /\bfor (\{[^}]*\|@\}|him|her|them|the (guests?|club|inn|table|inspector|customers?|wedding)|table \d+|each guest|every guest|her (son|daughter|child)|his (son|daughter|child))|\b(give|serve) (him|her|them)\b|\b(he|she) wants\b|\|@\} (wants|asked|can't|cannot|is allergic|says)|\b(guests?|customers?|man|woman|child) (wants|asked)\b|\bnext (man|customer|guest)\b|recipe card|\bcontract\b|\binspector\b|\btickets?\b|\bcatering\b/i;
/** Text the player read on paper (a card, a ticket, a note, a contract …), not heard. */
const WRITTEN = /recipe card|\bcards?\b|\btickets?\b|\bnotes?\b|\bcontract\b|\bclause\b|\breport\b|\bmenu\b|\binstructions\b|\bwritten\b|\bnotice\b|\bmemo\b|\bletter\b|\be-?mail\b/i;
/** A line that tells the player to listen (needs a spoken request) / to read (needs a written one). */
const LISTEN = /\blisten(ed)?\b/i;
const READ = /\bread (it|the|every|each|my|them|again)\b|\byou read\b|\bwell read\b|\bcheck the (card|note|order|instructions)\b/i;
/** Lines of the one who asked, face to face ("That is not an answer to my question"): not over a handed-on paper or call. */
const ASKER = /\bmy question\b|\bunderstand me\b|\bhelp me\b|\bsay it again\b|\bwhat I (want|asked)\b/i;
/** "Please send it": a written reply (a letter, an e-mail, a memo), not a spoken one. */
const SEND = /\bsend it\b/i;
/** A line that points at a paper or a thing ("Read the note again", "the book is right") needs it in the task. */
const REFERENT = /\bthe (book|bill|note|card|bags?|letters?|parcels?|invoice|contract|tickets?|instructions|menu|list|order|e-?mail|boxes|crates?)\b/gi;

/** Who speaks a reaction: whether it is the job's boss, the boss's name (markup), the speaker's gender. */
export interface ReactionSpeaker {
  boss: boolean;
  bossName?: string;
  gender?: 'm' | 'f' | null;
}

/** Gender from a person's drawn look (role emoji), when it shows one. */
export function avatarGender(avatar: string): 'm' | 'f' | null {
  if (/[👩👧👵]|♀/u.test(avatar)) return 'f';
  if (/[👨👦👴]|♂/u.test(avatar)) return 'm';
  return null;
}

/** The speaker of a task's reactions: the person drawn, or the boss when a paper / call was handed over. */
export function reactionSpeaker(data: GameData, jc: JobContent, inst: Pick<TaskInstance, 'person' | 'handover'>): ReactionSpeaker {
  const boss = !!inst.handover || (!!jc.boss && inst.person === jc.boss);
  const who = boss && jc.boss ? jc.boss : inst.person;
  return { boss, bossName: jc.boss ? personName(data, jc, jc.boss) : undefined, gender: avatarGender(personOf(data, jc, who).avatar) };
}

/** Was the request heard (spoken, or a call) rather than read on paper? */
function spokenRequest(inst: TaskInstance): boolean {
  const sp = inst.spec;
  if (sp.arch === 'respond') return sp.msg.kind === 'speech' || sp.msg.kind === 'phone';
  if (sp.arch === 'make' || sp.arch === 'trade') return inst.audioOnly || !WRITTEN.test(inst.say ?? '');
  return false;
}

/**
 * Does a reaction line fit the request and the one who says it? Content reactions are shared by every task
 * of a kind, so some would not fit some requests:
 * - who the request was for: "Both of us are happy" from a single customer, "My son will love this" when nobody
 *   mentioned a child, "I can't eat it" / "no cheese for me" when the request said someone else can't eat it;
 * - who speaks: lines only the one who eats or receives the work can say ("My plate is empty!", "I am still
 *   hungry", "Tell the chef …") never come from the boss or from someone ordering for another person (a recipe
 *   card, a ticket, "a box for Mrs. Wren"); a line naming the boss is not said by the boss; "I am a hungry man"
 *   is not said by a woman;
 * - how the request came: "Please listen again" only after a spoken request or a call, "Read the card again"
 *   only after a written one.
 * Lines that fit are preferred (reactionPool falls back to all lines of the kind when none fits; the validator
 * reports where that happens).
 */
export function reactionFits(inst: TaskInstance, who?: ReactionSpeaker): (text: string) => boolean {
  const req = (inst.texts ?? []).join(' ');
  const child = CHILD.test(req);
  const other = OTHER.test(req);
  const group = other || GROUP.test(req);
  // The thing to avoid is someone else's: "My son can't eat cheese", "{Tom|@} can't eat onions".
  const forbidOther = /can't eat|cannot eat|allerg/i.test(req) && !/\bI\s+(can't|cannot)\s+eat\b|\bI am allergic\b|\bI'm allergic\b/i.test(req) && other;
  const eater = !who?.boss && !FOR_OTHER.test(inst.say || req);
  const spoken = inst.spec ? spokenRequest(inst) : true;
  const written = inst.spec ? !spoken || WRITTEN.test(req) : true;
  return (text) => {
    if (CHILD.test(text) && !child) return false;
    if (/\bboth of us\b|\ball of us\b|\bwe are\b|\bwe're\b/i.test(text) && !group) return false;
    if (forbidOther && /\bI\s+(can't|cannot)\s+eat\b|\bfor me\b|\bmy allergy\b|\bgood for me\b|\bmy face\b/i.test(text)) return false;
    if (who && EATER.test(text) && !eater) return false;
    if (who?.boss && who.bossName && text.includes(who.bossName)) return false;
    if (who?.gender === 'f' && /\bI am an? [a-z ]*\b(man|boy)\b/i.test(text)) return false;
    if (who?.gender === 'm' && /\bI am an? [a-z ]*\b(woman|girl)\b/i.test(text)) return false;
    if (LISTEN.test(text) && !spoken) return false;
    if (READ.test(text) && !written) return false;
    if (inst.spec?.arch === 'respond' && ASKER.test(text) && inst.spec.msg.kind !== 'speech') return false;
    if (inst.spec?.arch === 'respond' && SEND.test(text) && (inst.spec.msg.kind === 'speech' || inst.spec.msg.kind === 'phone')) return false;
    const about = inst.spec?.arch === 'respond' ? `${req} ${inst.spec.msg.kind}` : req;
    for (const m of text.matchAll(REFERENT)) {
      const noun = m[1].toLowerCase().replace(/e-mail/, 'email');
      const stem = noun.replace(/(es|s)$/, '').replace(/^box$/, 'box');
      if (!new RegExp(`\\b${stem === 'email' ? 'e-?mail' : stem}`, 'i').test(about)) return false;
    }
    return true;
  };
}

/** A label that does not read as a noun after "the" ("By", "Send by", "Who", "Room, a night"). */
const NOT_NOUN = /^(to|by|from|inside|outside|who|why|what|when|where|how|send|pay|leave|arrive|come|sign|signed|please|they|wants|needs|bring|keep|ready|sent|paid|arrived|coming|only|in|on|at)\b|\b(by|at|to|for|from|before|in)$|,/i;
const PROPER = /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday|January|February|March|April|May|June|July|August|September|October|November|December)\b|\|@\}/;

/**
 * A paper's field label in running text after "the": lowercased when it reads as a noun ("the tracking number"),
 * kept for a proper noun ("the Monday"), quoted as a line when it does not read as a noun ("the “By” line", not
 * "the by").
 */
export function fieldInText(label: string): string {
  if (NOT_NOUN.test(label.replace(/\{([^{}|]+)\|[^{}]*\}/g, '$1'))) return `“${label}” line`;
  if (PROPER.test(label)) return label;
  return /^[A-Z][a-z]/.test(label) ? label[0].toLowerCase() + label.slice(1) : label;
}

/** Every line the person could say for this evaluation (the pool `reactionText` picks one from at random). */
export function reactionPool(data: GameData, jc: JobContent, inst: TaskInstance, ev: Pick<JobEvaluation, 'outcome' | 'primary'>, rank: number, late = false): { r: JobReaction; text: string; misfit?: boolean }[] {
  const prim = ev.primary;
  // Late: the work was right but the optional timer ran out (submitTask has already made the outcome minor).
  const lateOnly = late && !prim;
  const kind = lateOnly ? 'minor' : ev.outcome === 'perfect' ? 'perfect' : prim?.kind;
  const values: Record<string, string> = {};
  if (prim?.thing) {
    const th = thingById(jc, prim.thing);
    if (th) {
      // Number agreement: "Where is the bread?" / "Where are the eggs?", "too much rice" / "too many eggs";
      // singular only when exactly one was asked for (a missing egg when one egg was ordered).
      const w = inst.spec.arch === 'make' ? inst.spec.want.find((x) => x.thing === prim.thing) : undefined;
      const one = prim.kind === 'missing' && w?.n === 1;
      Object.assign(values, thingAgreement(data, th, one));
    }
  }
  if (prim?.field && inst.spec.arch === 'check') {
    const f = inst.spec.docs[inst.spec.target]?.fields?.find((x) => x.id === prim.field);
    // A label quoted (“Kind”) stays as written on the paper; in running text ("the kind") it is lowercased.
    if (f) {
      values.field = f.label;
      values.fieldlow = fieldInText(f.label);
    }
  }
  if (prim?.item && inst.spec.arch === 'sort') {
    const it = inst.spec.items.find((x) => x.id === prim.item);
    const bin = jc.sort?.bins.find((b) => b.id === it?.bin);
    if (bin) values.bin = bin.ref;
  }
  if (prim?.kind === 'wrong_vessel' && inst.spec.arch === 'make' && inst.spec.vessel) {
    const v = jc.make?.vessels?.find((x) => x.id === (inst.spec as { vessel?: string }).vessel);
    if (v) values.vessel = wordMarkup(data, v.word);
  }
  values.name = personName(data, jc, inst.person);
  const suits = (r: JobReaction) => reactionSuits(r, inst);
  // Late → only the `late` minor lines; a small mistake → only the others.
  const pickFrom = (k: string | undefined) =>
    jc.reactions
      .filter((r) => r.kind === k && (r.rank ?? 1) <= rank && (!r.arch || r.arch === inst.spec.arch) && suits(r) && (k !== 'minor' || !!r.late === lateOnly))
      .map((r) => ({ r, text: fill(r.text.replace(/\b(the|right|wrong) \{field\}/gi, '$1 {fieldlow}'), values) }))
      .filter((x): x is { r: (typeof jc.reactions)[number]; text: string } => !!x.text);
  const fits = reactionFits(inst, reactionSpeaker(data, jc, inst));
  const pickFitting = (k: string | undefined) => {
    const all = pickFrom(k);
    const ok = all.filter((x) => fits(x.r.text));
    return ok.length ? ok : all.map((x) => ({ ...x, misfit: true }));
  };
  let cands = pickFitting(kind);
  // A small mistake: the archetype's own "almost" lines ("Good. But one box is wrong.") join the issue's lines.
  if (ev.outcome === 'minor' && !lateOnly) cands = [...cands, ...pickFitting('minor').filter((x) => x.r.arch === inst.spec.arch)];
  // Newer issue kinds fall back to the nearest older one (content written before them still reacts sensibly).
  const near: Partial<Record<string, string>> = { disliked: 'extra', wrong_order: 'wrong_method', wrong_postage: 'change_short' };
  if (!cands.length && kind && near[kind]) cands = pickFitting(near[kind]);
  if (!cands.length && ev.outcome === 'minor') cands = pickFitting('minor');
  // Right but late, with no line about time: a plain thank-you, never "that is wrong".
  if (!cands.length && lateOnly) cands = pickFitting('perfect');
  if (!cands.length && ev.outcome !== 'perfect') cands = pickFitting('any_fail');
  if (!cands.length) cands = pickFitting('perfect');
  return cands;
}

function reactionText(data: GameData, jc: JobContent, inst: TaskInstance, ev: JobEvaluation, rank: number, rng: Rng, late: boolean): { text: string; face: Face } {
  const cands = reactionPool(data, jc, inst, ev, rank, late);
  const c = cands.length ? pick(rng, cands) : null;
  return { text: c?.text ?? '', face: c?.r.face ?? (ev.outcome === 'perfect' ? 'happy' : 'puzzled') };
}

export interface SubmitOutcome {
  evaluation: JobEvaluation;
  result: TaskResult;
}

/** Hand in the work on the current task. Mutates p. `late`: the optional timer ran out (perfect → minor). */
export function submitTask(data: GameData, p: LangProgress, answer: TaskAnswer, rng: Rng, late = false): SubmitOutcome | null {
  const s = currentShift(p);
  const inst = currentTask(p);
  if (!s || !inst || s.phase !== 'task') return null;
  const job = jobById(data, s.job);
  const jc = job && jobContent(data, job);
  if (!job || !jc) return null;
  const ev = evaluateTask(inst.spec, answer, ruleCtx(data, jc));
  if (late && ev.outcome === 'perfect') ev.outcome = 'minor';
  const jp = jobProgress(p, job.id);
  const st = jobsState(p);
  const { text, face } = reactionText(data, jc, inst, ev, jp.rank, rng, late);
  const coins = job.wage[ev.outcome];
  let bonus = 0;
  let bonusLine = '';
  const good = ev.outcome === 'perfect' || ev.outcome === 'minor';
  if (good)
    for (const u of job.links?.use ?? []) {
      if ((st.goods[u.good] ?? 0) > 0) {
        st.goods[u.good]--;
        bonus += u.bonus;
        // The thanks for the good is said once a shift (the bonus is paid every time).
        if (u.line && !bonusLine && !s.results.some((r) => r.bonus > 0)) bonusLine = u.line;
      }
    }
  if (ev.outcome === 'perfect') for (const pr of job.links?.produce ?? []) st.goods[pr.good] = (st.goods[pr.good] ?? 0) + pr.perPerfect;
  p.town.money += coins + bonus;
  jp.tasks++;
  if (good) jp.good++;
  if (ev.outcome === 'perfect') jp.perfect++;
  if (inst.source.type === 'authored') {
    const log = (jp.authored[inst.source.id] ??= { attempts: 0, perfect: false });
    log.attempts++;
    if (ev.outcome === 'perfect') log.perfect = true;
  }
  // Hidden SRS: an audio-only request is counted now (it was only heard); success grows the request's
  // words, a mistake lapses the words it implicates.
  if (inst.audioOnly) for (const txt of inst.texts) recordEncounter(p.words, tokenIds(data.tokens(txt)), p.day, txt);
  const focusIds = new Set(inst.focus.flatMap((t) => tokenIds(data.tokens(t))));
  if (ev.outcome === 'perfect') focusIds.forEach((id) => recordSuccess(p.words, id, p.day));
  else {
    const all = new Set(inst.texts.flatMap((t) => tokenIds(data.tokens(t))));
    const about = new Set(ev.issues.flatMap((i) => i.about.flatMap((t) => tokenIds(data.tokens(t)))).filter((id) => all.has(id)));
    (about.size ? [...about] : [...focusIds]).forEach((id) => recordLapse(p.words, id, p.day));
  }
  const reaction = bonusLine ? `${text} ${bonusLine}`.trim() : text;
  if (reaction) {
    const ids = tokenIds(data.tokens(reaction));
    recordEncounter(p.words, ids, p.day, reaction);
    tagWords(p, ids, job.id);
  }
  difficultyOnTask(data, p, inst.key, inst.texts, ev.outcome === 'perfect');
  const wrongItems = ev.issues.map((i) => i.item ?? i.field ?? i.thing ?? '').filter(Boolean);
  const result: TaskResult = { key: inst.key, outcome: ev.outcome, reaction, face, coins, bonus, wrongItems };
  s.results.push(result);
  s.phase = 'result';
  return { evaluation: ev, result };
}

/** Next task, or the end of the shift (rank-up checked). */
export function nextTask(data: GameData, p: LangProgress): void {
  const s = currentShift(p);
  if (!s || s.phase !== 'result') return;
  s.index++;
  if (s.index < s.tasks.length) {
    s.phase = 'task';
    presentTask(data, p);
    return;
  }
  s.phase = 'done';
  const job = jobById(data, s.job);
  if (!job) return;
  jobProgress(p, job.id).shifts++;
  s.rankUp = checkRankUp(data, p, job);
  if (s.endLine) recordEncounter(p.words, tokenIds(data.tokens(s.endLine)), p.day, s.endLine);
}

/** Leave the workplace after the shift: the next part of the day begins in the town. */
export function leaveShift(p: LangProgress): void {
  const d = jobDay(p);
  const s = d?.shift;
  if (!d || !s || s.phase !== 'done') return;
  d.log.push({
    part: s.part,
    job: s.job,
    tasks: s.results.length,
    good: s.results.filter((r) => r.outcome === 'perfect' || r.outcome === 'minor').length,
    coins: s.results.reduce((a, r) => a + r.coins + r.bonus, 0),
  });
  d.shift = null;
  d.part = s.part + 1;
  d.view = 'hub';
}

/** Recommended jobs for the chosen yardstick (TOEIC: working life first; 英検: by rank-1 grade). */
export function recommendJobs(data: GameData, p: LangProgress): string[] {
  const y = yardstickOf(p);
  const jobs = jobsOf(data).filter((j) => !j.legacy && jobOffered(p, j));
  const lvl = (j: JobDef) => ['5', '4', '3', 'pre2', '2', 'pre1', '1'].indexOf(j.ranks[0]?.level.eiken ?? '5');
  // Within the yardstick's order, a workplace open now (and not yet worked today) comes first: a recommendation
  // the player can act on in this part of the day.
  const d = jobDay(p);
  const now = (j: JobDef) => (d && d.part < 3 && jobOpenAt(j, d.part) && !d.log.some((l) => l.job === j.id) ? 1 : 0);
  const sorted = [...jobs].sort(
    (a, b) => now(b) - now(a) || (y === 'toeic' ? Number(b.flavour === 'work') - Number(a.flavour === 'work') : 0) || lvl(a) - lvl(b),
  );
  return sorted.slice(0, 2).map((j) => j.id);
}

/** Outcome tally of a shift. */
export function shiftTally(s: ShiftState): Record<Outcome, number> {
  const t: Record<Outcome, number> = { perfect: 0, minor: 0, fail: 0, bad: 0 };
  for (const r of s.results) t[r.outcome]++;
  return t;
}

/**
 * The evaluations a task can end in (outcome + primary issue), for checking which reaction lines it can get:
 * right, right but late, and every mistake its archetype (and this task's spec) can produce.
 */
export function reactionScenarios(spec: TaskSpec): { late: boolean; ev: Pick<JobEvaluation, 'outcome' | 'primary'> }[] {
  const out: { late: boolean; ev: Pick<JobEvaluation, 'outcome' | 'primary'> }[] = [
    { late: false, ev: { outcome: 'perfect', primary: null } },
    { late: true, ev: { outcome: 'minor', primary: null } },
  ];
  const add = (kind: JobIssue['kind'], outcome: JobEvaluation['outcome'], extra: Partial<JobIssue> = {}) => out.push({ late: false, ev: { outcome, primary: { kind, about: [], ...extra } } });
  if (spec.arch === 'make') {
    const thing = spec.want[0]?.thing;
    for (const k of ['empty', 'missing', 'extra', 'too_much', 'too_little'] as const) add(k, 'fail', { thing });
    add('too_much', 'minor', { thing });
    add('too_little', 'minor', { thing });
    if (spec.forbid?.length) add('forbidden', 'bad', { thing: spec.forbid[0] });
    if (spec.dislike?.length) add('disliked', 'fail', { thing: spec.dislike[0] });
    if (spec.vessel) add('wrong_vessel', 'minor');
    if (spec.method) add('wrong_method', 'fail');
    if (spec.order?.length) add('wrong_order', 'fail', { thing: spec.order[1] ?? spec.order[0] });
  } else if (spec.arch === 'sort') {
    add('wrong_bin', 'fail', { item: spec.items[0]?.id });
    if (spec.items.length >= 4) add('wrong_bin', 'minor', { item: spec.items[0]?.id });
  } else if (spec.arch === 'trade') {
    add('wrong_goods', 'fail', { thing: spec.want[0]?.thing });
    add('change_short', 'fail');
    add('change_over', 'fail');
    if (spec.post) add('wrong_postage', 'fail');
  } else if (spec.arch === 'check') {
    if (spec.wrong == null) add('false_alarm', 'fail', { field: spec.docs[spec.target]?.fields?.[0]?.id });
    else {
      add('missed', 'bad', { field: spec.wrong });
      add('wrong_field', 'fail', { field: spec.wrong });
      if (spec.fixOptions?.length) add('wrong_fix', 'minor', { field: spec.wrong });
    }
  } else if (spec.arch === 'respond') {
    if (spec.mode === 'choose') add('wrong_reply', 'fail');
    else if (spec.mode === 'form') {
      add('wrong_form', 'fail');
      if ((spec.fields?.length ?? 0) >= 3) add('wrong_form', 'minor');
    } else add('wrong_slot', 'fail');
  }
  return out;
}
