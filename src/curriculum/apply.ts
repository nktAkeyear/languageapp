/**
 * Apply the compiled lists to a language's content (en only): the lexicon is reconciled with
 * vocab.json (levels / domains from the list; hand-written glosses kept). Without lists the
 * content is returned unchanged.
 */
import type { LanguageContent } from '../core/types';
import { reconcileLexicon } from './curriculum';
import { englishLists, listsLoaded } from './lists';

export function withLists(c: LanguageContent): LanguageContent {
  if (c.lang !== 'en' || !listsLoaded()) return c;
  return { ...c, lexicon: reconcileLexicon(c.lexicon, englishLists()).lexicon };
}
