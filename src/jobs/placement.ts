/**
 * Placement of the jobs by the start level (レベル設定 「現在の実力の目安」). A player who starts high must meet
 * material of their level from day 1, not the first rank of every job:
 *
 * - each job starts at the highest rank whose material (`RankDef.level`) is at or below the start — measured on
 *   the yardstick the start was chosen by (英検 grade, or TOEIC band; a rank without a TOEIC band counts as
 *   below 〜400). A job whose first rank is already above the start is not placed (it opens as usual);
 * - when any job is placed, the town's job board opens at once (day 1) and the placed jobs are offered at once
 *   (their `opensAfter` delay is for a player growing into them);
 * - the tea house (the legacy job) gets the rank of its shop stages the same way (its stage is fast-forwarded by
 *   the start level, see START_STAGE in core/difficulty.ts).
 *
 * Nothing is revealed: placement changes ranks only; the words stay assumed known (未確認) as seeded. Placement
 * never lowers a rank (a later, lower start level leaves the ranks where they are, like the shop's stage).
 * Imports only types and the import-free rank names (core/difficulty.ts calls it; jobs/engine.ts imports core/difficulty.ts).
 */
import type { GameData } from '../core/gamedata';
import type { LangProgress } from '../core/save';
import { EIKEN_GRADES } from '../core/types';
import { eikenFromKey } from '../curriculum/yardsticks';
import type { JobDef, JobProgress, JobsState, RankDef } from './types';
import { rankName } from './rankNames';

export interface PlacedJob {
  id: string;
  nameJa: string;
  rank: number;
  /** The rank's material, e.g. 「英検2級」 / 「TOEIC〜600」. */
  levelJa: string;
  /** The rank was raised by this placement (false: the job was already there or higher). */
  raised: boolean;
}

export interface Placement {
  jobs: PlacedJob[];
  /** The board opened because of the start (it was not open yet). */
  boardOpened: boolean;
}


/** 1-based 英検 level index of a rank's material (5級 = 1 … 1級 = 7). */
function rankEiken(r: RankDef): number {
  const g = eikenFromKey(r.level.eiken);
  return g ? EIKEN_GRADES.indexOf(g) + 1 : 1;
}

/**
 * The rank a job starts at for a start level (英検 level index 1…7) or a TOEIC band; 0 = the job's first rank is
 * above the start (not placed).
 */
export function placedRankFor(job: JobDef, level: number, toeic?: number | null): number {
  let best = 0;
  for (const r of [...job.ranks].sort((a, b) => a.rank - b.rank)) {
    const fits = toeic ? (r.level.toeic ?? 0) <= toeic : rankEiken(r) <= level;
    if (fits) best = r.rank;
    else break;
  }
  return best;
}

function jobsOfData(data: GameData): JobDef[] {
  return (data.content.jobs ?? []).filter((j) => j.legacy || j.content[data.lang]);
}

function levelJa(r: RankDef, toeic?: number | null): string {
  if (toeic && r.level.toeic) return `TOEIC〜${r.level.toeic}`;
  const g = eikenFromKey(r.level.eiken);
  return g ? `英検${g}級` : '';
}

/** What a start would place (no state change): for the settings sheet's preview. */
export function previewPlacement(data: GameData, level: number, toeic?: number | null): PlacedJob[] {
  const out: PlacedJob[] = [];
  if (level <= 0 && !toeic) return out;
  for (const j of jobsOfData(data)) {
    const rank = placedRankFor(j, level, toeic);
    if (rank < 1 || (rank === 1 && j.legacy)) continue;
    const def = j.ranks.find((r) => r.rank === rank)!;
    out.push({
      id: j.id,
      nameJa: j.nameJa,
      rank,
      levelJa: levelJa(def, toeic),
      raised: true,
    });
  }
  return out;
}

/** Does the start open the board at once (some job other than the tea house is placed)? */
export function startOpensBoard(data: GameData, level: number, toeic?: number | null): boolean {
  return jobsOfData(data).some((j) => !j.legacy && placedRankFor(j, level, toeic) >= 1);
}

function stateOf(p: LangProgress): JobsState {
  if (!p.jobs)
    p.jobs = {
      jobs: {},
      goods: {},
      wordJobs: {},
      day: null,
      timed: false,
      seen: [],
    };
  p.jobs.jobs ??= {};
  return p.jobs;
}

/** Apply the placement of a start level (idempotent; never lowers a rank). */
export function placeJobsForStart(data: GameData, p: LangProgress, level: number, toeic?: number | null): Placement {
  const res: Placement = { jobs: [], boardOpened: false };
  if (!jobsOfData(data).some((j) => !j.legacy)) return res;
  if (level <= 0 && !toeic) return res;
  const s = stateOf(p);
  for (const j of jobsOfData(data)) {
    const rank = placedRankFor(j, level, toeic);
    if (rank < 1) continue;
    const def = j.ranks.find((r) => r.rank === rank)!;
    const jp: JobProgress = (s.jobs[j.id] ??= {
      since: p.day,
      rank: 1,
      tasks: 0,
      good: 0,
      perfect: 0,
      shifts: 0,
      authored: {},
      rankDays: { 1: p.day },
    });
    // Raised to the rank, or placed at a first rank it has not worked yet (offered at once, like the others).
    const raised = rank > jp.rank || (!jp.placed && !j.legacy && rank === jp.rank && jp.tasks === 0);
    if (raised) {
      jp.rank = rank;
      jp.rankDays[rank] = p.day;
      jp.placed = { rank, day: p.day, good: def.need.good };
    }
    if (rank > 1 || !j.legacy)
      res.jobs.push({
        id: j.id,
        nameJa: j.nameJa,
        rank,
        levelJa: levelJa(def, toeic),
        raised,
      });
  }
  const anyJob = res.jobs.some((x) => x.id !== 'teahouse' && !jobsOfData(data).find((j) => j.id === x.id)?.legacy);
  if (anyJob && !s.boardOpen) {
    s.boardOpen = p.day;
    res.boardOpened = true;
  }
  if (anyJob) {
    const names = res.jobs
      .filter((x) => !jobsOfData(data).find((j) => j.id === x.id)?.legacy)
      .map((x) => `${x.nameJa}は「${rankName(x.rank)}」（${x.levelJa}の内容）から`)
      .join('、');
    const msg = `${res.boardOpened ? '実力に合わせて、町の掲示板が最初の日から開いている。' : ''}${names}働ける。下の位の仕事は、復習としてときどき出てくる。言葉の意味は、これまでどおり自分で確かめる。`;
    // Today's town (a level changed mid-game) shows it at once; a new game shows it on its first morning.
    if (s.day && s.day.day === p.day) s.day.notes.push(msg);
    else (s.pending ??= []).push(msg);
  }
  return res;
}

/** Is the job offered at once because the start placed it (before its usual `opensAfter` delay)? */
export function placedOffered(p: LangProgress, job: JobDef): boolean {
  return !!p.jobs?.jobs[job.id]?.placed;
}
