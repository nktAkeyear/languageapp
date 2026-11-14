/**
 * The town's jobs. The tea house is the first job (both languages); every other job is
 * English-only content (src/content/jobs/<job>.en.ts). Add a job by writing its JobDef and
 * listing it here — see README "Jobs: content schema".
 */
import type { JobDef } from '../../jobs/types';
import { TEAHOUSE_JOB } from './teahouse';
import { POST_JOB } from './post.en';
import { OFFICE_JOB } from './office.en';
import { KITCHEN_JOB } from './kitchen.en';
import { INN_JOB } from './inn.en';
import { COMMON_EN } from './common.en';
import type { JobCommon } from '../../jobs/lexicon';
import type { Lang } from '../../core/types';

export { GOODS } from './teahouse';

export const JOBS: JobDef[] = [TEAHOUSE_JOB, POST_JOB, KITCHEN_JOB, INN_JOB, OFFICE_JOB];

/** Words shared by several jobs, per language (the job lexicon registry's common list). */
export const JOBS_COMMON: Partial<Record<Lang, JobCommon>> = { en: COMMON_EN };
