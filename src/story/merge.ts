/**
 * Merge a language's story text into its content: story words + 検証ページ join the lexicon,
 * extra surface forms (en past tenses) are added to existing entries, and story-only delivery
 * recipients join the town's recipient list (flagged so the generic slips never pick them).
 */
import type { LanguageContent } from '../core/types';
import type { StoryText } from './types';

export function withStory(c: LanguageContent, story: StoryText): LanguageContent {
  const lexicon = c.lexicon.map((e) => {
    const extra = story.forms[e.id];
    return extra ? { ...e, forms: [...(e.forms ?? []), ...extra] } : e;
  });
  const town = c.town && {
    ...c.town,
    delivery: {
      ...c.town.delivery,
      recipients: [...c.town.delivery.recipients, ...story.recipients.map((r) => ({ ...r, storyOnly: true }))],
    },
  };
  return {
    ...c,
    lexicon: [...lexicon, ...story.lexicon],
    verificationPages: [...c.verificationPages, ...story.pages],
    ...(town ? { town } : {}),
    story,
  };
}
