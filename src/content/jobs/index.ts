/**
 * The town's jobs. The tea house is the first job (both languages); every other job is
 * English-only content (src/content/jobs/<job>.en.ts). Add a job by writing its JobDef and
 * listing it here — see README "Jobs: content schema".
 */
import type { JobDef } from '../../jobs/types';
import { TEAHOUSE_JOB } from './teahouse';
import { POST_JOB } from './post.en';
import { OFFICE_JOB } from './office.en';

export { GOODS } from './teahouse';

export const JOBS: JobDef[] = [TEAHOUSE_JOB, POST_JOB, OFFICE_JOB];
