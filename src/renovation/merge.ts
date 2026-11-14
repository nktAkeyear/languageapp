/**
 * Merge a language's catalogue text into its content: the catalogue's words and 検証ページ join
 * the lexicon, extra surface forms are added to existing entries, and the text is attached as
 * `content.renovation`.
 */
import type { LanguageContent } from '../core/types';
import type { RenoText } from './types';

export function withRenovation(c: LanguageContent, reno: RenoText): LanguageContent {
  const lexicon = c.lexicon.map((e) => {
    const extra = reno.forms[e.id];
    return extra ? { ...e, forms: [...(e.forms ?? []), ...extra] } : e;
  });
  return {
    ...c,
    lexicon: [...lexicon, ...reno.lexicon],
    verificationPages: [...c.verificationPages, ...reno.pages],
    renovation: reno,
  };
}
