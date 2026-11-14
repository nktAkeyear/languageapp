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

/** Town activities live in their own files; merge their lexicon / verification pages here. */
function withTown(c: LanguageContent, town: TownContent): LanguageContent {
  return {
    ...c,
    lexicon: [...c.lexicon, ...town.lexicon],
    verificationPages: [...c.verificationPages, ...town.verificationPages],
    town,
  };
}

export const SHARED: SharedContent = { ...BASE_SHARED, town: TOWN_SHARED, story: STORY_SHARED };

export const CONTENT: Record<Lang, LanguageContent> = {
  en: withStory(withTown(en, enTown), STORY_EN),
  zh: withStory(withTown(zh, zhTown), STORY_ZH),
};
