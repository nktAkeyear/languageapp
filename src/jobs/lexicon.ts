/**
 * The job lexicon registry: every word the jobs use is defined exactly once — by the job that teaches it
 * (`JobContent.lexicon`) or, when several jobs share it, in `src/content/jobs/common.en.ts` — and every job
 * may use every word of the registry (the language's lexicon is one list). Extra surface forms (`forms`) may
 * be written by any job for any word, wherever the word is defined (the tea house's, another job's, the
 * common list's): they are merged onto that entry.
 *
 * Nothing depends on the order the jobs are listed in: a word defined twice (same id, or two ids claiming the
 * same surface) is reported by the validator instead of silently going to the first definer.
 *
 * Which words a job *introduces* is derived from use, not from where they are written: see `jobIntroduces`
 * (the job vocabulary minus the tea house's words, by the rank they first appear at).
 */
import type { GameData } from '../core/gamedata';
import { tokenIds } from '../core/tokenize';
import type { LanguageContent, LexEntry, VerificationPage } from '../core/types';
import type { JobDef, JobLexEntry } from './types';
import { jobContentTexts, templateSlotWords, templateTexts } from './vocab';

/** Words shared by several jobs (the common list of src/content/jobs/common.<lang>.ts). */
export interface JobCommon {
  lexicon: JobLexEntry[];
  pages: VerificationPage[];
  forms?: Record<string, string[]>;
}

export interface RegistryProblem {
  level: 'err' | 'warn';
  text: string;
}

export interface JobRegistry {
  /** id → who defines it ('common' or a job id). */
  owner: Record<string, string>;
  problems: RegistryProblem[];
}

function filled(e: JobLexEntry, domains: string[]): LexEntry {
  return { ...e, gloss: e.gloss ?? '', cefr: e.cefr ?? 'A2', eiken: e.eiken === undefined ? null : e.eiken, domains: e.domains ?? domains };
}

/**
 * Merge the common list and the jobs' words into a language's lexicon; returns the merged lexicon, the
 * pages and the registry (ownership + duplicate report).
 */
export function buildRegistry(
  c: LanguageContent,
  jobs: JobDef[],
  common: JobCommon | undefined,
): { lexicon: LexEntry[]; pages: VerificationPage[]; registry: JobRegistry } {
  const problems: RegistryProblem[] = [];
  const owner: Record<string, string> = {};
  const lex: LexEntry[] = [];
  const pages: VerificationPage[] = [];
  const baseIds = new Set(c.lexicon.map((e) => e.id));
  const add = (who: string, entries: JobLexEntry[], domains: string[]) => {
    for (const e of entries) {
      if (baseIds.has(e.id)) {
        problems.push({ level: 'err', text: `job lexicon: ${who} defines "${e.id}", which the tea house already has (use it; add surface forms with \`forms\`)` });
        continue;
      }
      if (owner[e.id]) {
        problems.push({ level: 'err', text: `job lexicon: "${e.id}" («${e.text}») is defined by both ${owner[e.id]} and ${who} — define it once (in the job that teaches it first, or in jobs/common.en.ts)` });
        continue;
      }
      owner[e.id] = who;
      lex.push(filled(e, domains));
    }
  };
  if (common) {
    add('common', common.lexicon, []);
    pages.push(...common.pages);
  }
  for (const j of jobs) {
    const jc = j.content[c.lang];
    if (!jc) continue;
    add(j.id, jc.lexicon, j.domains);
    pages.push(...jc.pages);
  }
  // Forms: from any job (or the common list) onto whichever entry has the id.
  const forms = new Map<string, Set<string>>();
  const formSrc = new Map<string, string[]>();
  const addForms = (who: string, f: Record<string, string[]> | undefined) => {
    for (const [id, fs] of Object.entries(f ?? {})) {
      const set = forms.get(id) ?? new Set<string>();
      fs.forEach((x) => set.add(x));
      forms.set(id, set);
      formSrc.set(id, [...(formSrc.get(id) ?? []), who]);
    }
  };
  addForms('common', common?.forms);
  for (const j of jobs) addForms(j.id, j.content[c.lang]?.forms);
  const withForms = (e: LexEntry): LexEntry => {
    const extra = forms.get(e.id);
    if (!extra) return e;
    const have = new Set([e.text, ...(e.forms ?? [])].map((s) => s.toLowerCase()));
    const add2 = [...extra].filter((x) => !have.has(x.toLowerCase()));
    return add2.length ? { ...e, forms: [...(e.forms ?? []), ...add2] } : e;
  };
  const base = c.lexicon.map(withForms);
  const jobLex = lex.map(withForms);
  const known = new Set([...base, ...jobLex].map((e) => e.id));
  for (const [id, who] of formSrc) if (!known.has(id)) problems.push({ level: 'err', text: `job lexicon: ${who.join(', ')} add forms to "${id}", which no lexicon defines` });
  // Surfaces: a surface claimed by two ids, where one of them is a job word, is a duplicate definition
  // (the tokenizer could only ever give it to one of them).
  const bySurface = new Map<string, string>();
  for (const e of base) for (const s of [e.text, ...(e.forms ?? [])]) if (!bySurface.has(s.toLowerCase())) bySurface.set(s.toLowerCase(), e.id);
  // (A headword shared on purpose — a second sense always written with markup, like {change|change_v} — is
  // reported by the core validator's ambiguity warning; a shadowed form is a duplicate definition.)
  for (const e of jobLex)
    for (const s of [e.text, ...(e.forms ?? [])]) {
      const k = s.toLowerCase();
      const other = bySurface.get(k);
      if (other && other !== e.id && s !== e.text)
        problems.push({ level: 'err', text: `job lexicon: the form "${s}" of ${e.id} (${owner[e.id]}) is already a surface of ${other} (${owner[other] ?? 'tea house'}) — one surface, one entry` });
      else if (!other) bySurface.set(k, e.id);
    }
  return { lexicon: [...base, ...jobLex], pages, registry: { owner, problems } };
}

/** Problems found when the registry was built (the validator prints them). */
export function jobLexiconReport(data: GameData, _jobs: JobDef[]): RegistryProblem[] {
  return data.content.jobRegistry?.problems ?? [];
}

/**
 * The words a job introduces, by the rank they first appear at in it: the job's vocabulary (what its texts
 * use) minus the tea house's own words. A word several jobs use is "introduced" by each of them at their own
 * rank (the notebook shows all the places it was met).
 */
export function jobIntroduces(data: GameData, job: JobDef): Map<string, number> {
  const out = new Map<string, number>();
  const jc = job.content[data.lang];
  if (!jc || job.legacy) return out;
  const owned = new Set(Object.keys(data.content.jobRegistry?.owner ?? {}));
  const note = (rank: number, texts: string[]) => {
    for (const t of texts)
      for (const id of tokenIds(data.tokens(t)))
        if (owned.has(id)) out.set(id, Math.min(out.get(id) ?? rank, rank));
  };
  for (const t of jc.tasks) note(t.rank, [t.say ?? '', ...jobContentTexts({ ...jc, tasks: [t], templates: [], qa: {}, reactions: [], lines: [], sort: undefined, trade: undefined, sign: '' })]);
  for (const t of jc.templates) {
    note(t.rank, templateTexts(t));
    for (const id of templateSlotWords(jc, t)) if (owned.has(id)) out.set(id, Math.min(out.get(id) ?? t.rank, t.rank));
  }
  for (const [, items] of Object.entries(jc.qa ?? {})) for (const q of items) note(q.rank, [q.q, q.a]);
  return out;
}
