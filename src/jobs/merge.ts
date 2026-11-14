/**
 * Merge the jobs into a language's content: job words + 検証ページ join the lexicon (a job word
 * written without gloss / level gets them from data/english/vocab.json at load, see
 * src/curriculum/apply.ts), extra surface forms are added to existing entries, and the jobs
 * playable in the language are attached as `content.jobs`.
 */
import type { LanguageContent, LexEntry } from '../core/types';
import type { JobDef } from './types';

export function withJobs(c: LanguageContent, jobs: JobDef[]): LanguageContent {
  const mine = jobs.filter((j) => j.legacy || j.content[c.lang]);
  const forms: Record<string, string[]> = {};
  const lex: LexEntry[] = [];
  const pages = [];
  for (const j of mine) {
    const jc = j.content[c.lang];
    if (!jc) continue;
    for (const [id, f] of Object.entries(jc.forms ?? {})) (forms[id] ??= []).push(...f);
    for (const e of jc.lexicon) lex.push({ ...e, gloss: e.gloss ?? '', cefr: e.cefr ?? 'A2', eiken: e.eiken === undefined ? null : e.eiken, domains: e.domains ?? j.domains });
    pages.push(...jc.pages);
  }
  const base = c.lexicon.map((e) => (forms[e.id] ? { ...e, forms: [...(e.forms ?? []), ...forms[e.id].filter((f) => !(e.forms ?? []).includes(f))] } : e));
  return { ...c, lexicon: [...base, ...lex], verificationPages: [...c.verificationPages, ...pages], jobs: mine };
}
