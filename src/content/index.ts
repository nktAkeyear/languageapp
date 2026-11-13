import type { Lang, LanguageContent, SharedContent } from '../core/types';
import type { TownContent } from '../core/townTypes';
import en from './en';
import enTown from './en/town';
import { SHARED as BASE_SHARED } from './shared';
import { TOWN_SHARED } from './shared/town';
import zh from './zh';
import zhTown from './zh/town';

/** Town activities live in their own files; merge their lexicon / verification pages here. */
function withTown(c: LanguageContent, town: TownContent): LanguageContent {
  return {
    ...c,
    lexicon: [...c.lexicon, ...town.lexicon],
    verificationPages: [...c.verificationPages, ...town.verificationPages],
    town,
  };
}

export const SHARED: SharedContent = { ...BASE_SHARED, town: TOWN_SHARED };

export const CONTENT: Record<Lang, LanguageContent> = { en: withTown(en, enTown), zh: withTown(zh, zhTown) };
