/**
 * The town's jobs. The tea house is the first job (both languages); every other job is
 * English-only content (src/content/jobs/<job>.en.ts). Add a job by writing its JobDef and
 * listing it here — see README "Jobs: content schema".
 */
import type { JobDef, QaItem } from '../../jobs/types';
import { NEAR_EN, NEAR_TASKS_EN, type NearTable } from './near.en';
import { nearMisses } from '../../jobs/nearmiss';
import { TEAHOUSE_JOB } from './teahouse';
import { POST_JOB } from './post.en';
import { OFFICE_JOB } from './office.en';
import { KITCHEN_JOB } from './kitchen.en';
import { INN_JOB } from './inn.en';
import { NEWS_JOB } from './news.en';
import { CLINIC_JOB } from './clinic.en';
import { TOWNHALL_JOB } from './townhall.en';
import { ACADEMY_JOB } from './academy.en';
import { COMMON_EN } from './common.en';
import type { JobCommon } from '../../jobs/lexicon';
import type { Lang } from '../../core/types';

export { GOODS } from './teahouse';

/** Keys of a near-miss table that match no QA item (the tests require none). */
export const nearUnmatched: string[] = [];

/** Put the near misses of `table` onto the jobs' QA items (key: the item's fn, `fn#2` for the second one …). */
export function withNear(jobs: JobDef[], table: NearTable, lang: 'en' = 'en'): JobDef[] {
  const used = new Set<string>();
  const out = jobs.map((job) => {
    const jc = job.content[lang];
    const t = table[job.id];
    if (!jc?.qa || !t) return job;
    const qa: Record<string, QaItem[]> = {};
    for (const [bank, items] of Object.entries(jc.qa)) {
      const seen: Record<string, number> = {};
      qa[bank] = items.map((q) => {
        seen[q.fn] = (seen[q.fn] ?? 0) + 1;
        const key = seen[q.fn] > 1 ? `${q.fn}#${seen[q.fn]}` : q.fn;
        const near = t[bank]?.[key];
        if (!near) return q;
        used.add(`${job.id}/${bank}/${key}`);
        return { ...q, near: [...(q.near ?? []), ...near] };
      });
    }
    return { ...job, content: { ...job.content, [lang]: { ...jc, qa } } };
  });
  for (const [job, banks] of Object.entries(table)) for (const [bank, keys] of Object.entries(banks)) for (const key of Object.keys(keys)) if (!used.has(`${job}/${bank}/${key}`)) nearUnmatched.push(`${job}/${bank}/${key}`);
  return out;
}

/** An option used as a wrong reply by ≥ 3 authored tasks of a job: a stock line about something else. */
const STOCK = 3;

/**
 * Authored reply choices: replace the wrong options by near misses — written per task (`tasks`), or those of the
 * QA item with the same answer. Without either, the task keeps its options (the tests require that no authored
 * task still offers a stock line).
 */
export function withNearTasks(jobs: JobDef[], tasks: Record<string, Record<string, string[]>>, lang: 'en' = 'en'): JobDef[] {
  const used = new Set<string>();
  const out = jobs.map((job) => {
    const jc = job.content[lang];
    if (!jc) return job;
    const qa = Object.values(jc.qa ?? {});
    const stock = new Map<string, number>();
    for (const t of jc.tasks)
      if (t.arch === 'respond' && t.mode === 'choose' && t.options) t.options.forEach((o, i) => i !== t.answer && stock.set(o, (stock.get(o) ?? 0) + 1));
    const list = jc.tasks.map((t) => {
      if (t.arch !== 'respond' || t.mode !== 'choose' || !t.options || t.answer === undefined) return t;
      const answer = t.options[t.answer];
      let wrong = tasks[job.id]?.[t.id];
      if (wrong) used.add(`${job.id}/${t.id}`);
      else {
        if (!t.options.some((o, i) => i !== t.answer && (stock.get(o) ?? 0) >= STOCK)) return t;
        for (const bank of qa) {
          const item = bank.find((q) => q.a === answer);
          if (item) {
            const nm = nearMisses(item, bank);
            if (nm.length >= 2) wrong = nm.slice(0, Math.max(2, t.options.length - 1));
            break;
          }
        }
      }
      if (!wrong) return t;
      const at = Math.min(t.answer, wrong.length);
      const options = [...wrong.slice(0, at), answer, ...wrong.slice(at)];
      return { ...t, options, answer: at };
    });
    return { ...job, content: { ...job.content, [lang]: { ...jc, tasks: list } } };
  });
  for (const [job, ids] of Object.entries(tasks)) for (const id of Object.keys(ids)) if (!used.has(`${job}/${id}`)) nearUnmatched.push(`${job}/task/${id}`);
  return out;
}

export const JOBS: JobDef[] = withNearTasks(withNear([TEAHOUSE_JOB, POST_JOB, KITCHEN_JOB, INN_JOB, OFFICE_JOB, NEWS_JOB, CLINIC_JOB, TOWNHALL_JOB, ACADEMY_JOB], NEAR_EN), NEAR_TASKS_EN);

/** Words shared by several jobs, per language (the job lexicon registry's common list). */
export const JOBS_COMMON: Partial<Record<Lang, JobCommon>> = { en: COMMON_EN };
