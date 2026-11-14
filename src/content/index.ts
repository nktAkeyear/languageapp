import type { Lang, LanguageContent, SharedContent } from '../core/types';
import type { TownContent } from '../core/townTypes';
import en from './en';
import enTown from './en/town';
import { SHARED as BASE_SHARED } from './shared';
import { TOWN_SHARED } from './shared/town';
import zh from './zh';
import zhTown from './zh/town';
import { STORY_EN } from './en/story';
import { STORY_SHARED } from './shared/story';
import { STORY_ZH } from './zh/story';
import { withStory } from '../story/merge';
import { withRenovation } from '../renovation/merge';
import { RENO_SHARED } from './shared/renovation';
import { RENO_EN } from './en/renovation';
import { RENO_ZH } from './zh/renovation';
import { withJobs } from '../jobs/merge';
import { JOBS, JOBS_COMMON } from './jobs';

/** Town activities live in their own files; merge their lexicon / verification pages here. */
function withTown(c: LanguageContent, town: TownContent): LanguageContent {
  return {
    ...c,
    lexicon: [...c.lexicon, ...town.lexicon],
    verificationPages: [...c.verificationPages, ...town.verificationPages],
    town,
  };
}

export const SHARED: SharedContent = { ...BASE_SHARED, town: TOWN_SHARED, story: STORY_SHARED, renovation: RENO_SHARED };

export const CONTENT: Record<Lang, LanguageContent> = {
  en: withJobs(withRenovation(withStory(withTown(en, enTown), STORY_EN), RENO_EN), JOBS, JOBS_COMMON.en),
  zh: withJobs(withRenovation(withStory(withTown(zh, zhTown), STORY_ZH), RENO_ZH), JOBS, JOBS_COMMON.zh),
};
