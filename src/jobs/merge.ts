/**
 * Merge the jobs into a language's content: the job lexicon registry (src/jobs/lexicon.ts) joins the common
 * list and every job's words + 検証ページ to the lexicon (a word written without gloss / level gets them from
 * data/english/vocab.json at load, see src/curriculum/apply.ts), merges extra surface forms onto whichever
 * entry defines the word, and the jobs playable in the language are attached as `content.jobs`.
 */
import type { LanguageContent } from '../core/types';
import { buildRegistry, type JobCommon } from './lexicon';
import type { JobDef } from './types';

export function withJobs(c: LanguageContent, jobs: JobDef[], common?: JobCommon): LanguageContent {
  const mine = jobs.filter((j) => j.legacy || j.content[c.lang]);
  const { lexicon, pages, registry } = buildRegistry(c, mine, common);
  return { ...c, lexicon, verificationPages: [...c.verificationPages, ...pages], jobs: mine, jobRegistry: registry };
}
