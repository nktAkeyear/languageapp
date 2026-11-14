/**
 * Curriculum over the compiled lists: reconcile the hand-written lexicon with vocab.json, report
 * progress per 英検 grade / TOEIC band (overall and per job), and choose what to introduce next.
 *
 * - Reconciliation (`reconcileLexicon`): a lexicon word that is in vocab.json (same headword or one
 *   of its forms; POS preferred) takes its levels (英検 grade, TOEIC band, CEFR) and domains from
 *   the list; the hand-written gloss stays (it is written for the game's meaning cards). Job words
 *   written without a gloss / level get them from the list.
 * - Reports (`yardstickReport`): per step (grade or band, cumulative), the list size, how much of it
 *   the game's playable content contains (the ceiling: the rest cannot be learned in the game yet),
 *   and how much the player has mastered. Scoped to a job, the list is the items of the job's
 *   domains and "in game" means in that job's content.
 * - Selection (`selectNext`): the next words / phrases / grammar points for a job, in the order of
 *   the chosen yardstick (英検: grade, then frequency — the school order; TOEIC: band, business
 *   domains first, then frequency), split honestly into what the job's content can teach now and
 *   what no playable content covers yet.
 */
import type { GameData } from '../core/gamedata';
import type { LangProgress } from '../core/save';
import { isMastered } from '../core/srs';
import { CEFR_LEVELS, EIKEN_GRADES, type Cefr, type LexEntry } from '../core/types';
import { englishLists, listsLoaded, vocabFor, type EnglishLists, type GrammarItem, type PhraseItem, type VocabItem } from './lists';
import { eikenIndex, stepLabel, TOEIC_BANDS, toeicIndex, type Yardstick } from './yardsticks';

/** Domains that make a TOEIC learner's work life. */
export const BUSINESS_DOMAINS = ['office', 'meetings', 'sales', 'finance', 'hr', 'logistics', 'law', 'technology', 'media', 'money', 'post', 'hotel', 'travel'];

// ---------------------------------------------------------------------------- reconciliation

export interface Reconciled {
  lexicon: LexEntry[];
  /** en words with no vocab.json entry (for validate-content). */
  missing: string[];
  matched: number;
}

function cefrOf(s: string | null): Cefr | null {
  if (!s) return null;
  const u = s.toUpperCase().slice(0, 2) as Cefr;
  if (CEFR_LEVELS.includes(u)) return u;
  return u === ('C2' as Cefr) ? 'C1' : null;
}

export function reconcileLexicon(lexicon: LexEntry[], lists: EnglishLists = englishLists()): Reconciled {
  const missing: string[] = [];
  let matched = 0;
  const out = lexicon.map((e) => {
    const v = vocabFor(lists, e.text, e.pos, e.forms ?? [], e.lemma);
    if (!v) {
      if (lists.vocab.length) missing.push(e.text);
      return { ...e, gloss: e.gloss || '', cefr: e.cefr || 'A2', eiken: e.eiken === undefined ? null : e.eiken, listed: false };
    }
    matched++;
    return {
      ...e,
      gloss: e.gloss || v.ja,
      eiken: v.eiken ?? e.eiken ?? null,
      cefr: cefrOf(v.cefr) ?? e.cefr ?? 'A2',
      toeic: v.toeic ?? e.toeic ?? null,
      domains: [...new Set([...(e.domains ?? []), ...v.domains])],
      listed: true,
    };
  });
  return { lexicon: out, missing, matched };
}

// ---------------------------------------------------------------------------- links

interface Link {
  /** vocab item → lexicon id. */
  lexOf: Map<VocabItem, string>;
  lists: EnglishLists;
}

const links = new WeakMap<GameData, Link>();

function linkFor(data: GameData): Link {
  const lists = englishLists();
  const hit = links.get(data);
  if (hit && hit.lists === lists) return hit;
  const lexOf = new Map<VocabItem, string>();
  if (data.lang === 'en') {
    for (const e of data.content.lexicon) {
      const v = vocabFor(lists, e.text, e.pos, e.forms ?? []);
      if (v && !lexOf.has(v)) lexOf.set(v, e.id);
    }
    // Inflected words taught on their own ("names") link to their headword's item only when no entry has it.
    for (const e of data.content.lexicon) {
      if (!e.lemma) continue;
      const v = vocabFor(lists, e.text, e.pos, e.forms ?? [], e.lemma);
      if (v && !lexOf.has(v)) lexOf.set(v, e.id);
    }
  }
  const l = { lexOf, lists };
  links.set(data, l);
  return l;
}

export function lexIdOf(data: GameData, v: VocabItem): string | undefined {
  return linkFor(data).lexOf.get(v);
}

/** Step index of a list item on a yardstick (-1 = not on it). */
export function stepOf(y: Yardstick, x: { eiken: VocabItem['eiken']; toeic: VocabItem['toeic'] }): number {
  return y === 'eiken' ? eikenIndex(x.eiken) : toeicIndex(x.toeic);
}

export function stepCount(y: Yardstick): number {
  return y === 'eiken' ? EIKEN_GRADES.length : TOEIC_BANDS.length;
}

export function stepKey(y: Yardstick, i: number): string {
  return y === 'eiken' ? EIKEN_GRADES[i] : String(TOEIC_BANDS[i]);
}

/** Step of a lexicon word (list levels after reconciliation; hand-written 英検 tag otherwise). */
export function lexStep(y: Yardstick, e: LexEntry): number {
  return y === 'eiken' ? eikenIndex(e.eiken ?? null) : toeicIndex(e.toeic ?? null);
}

// ---------------------------------------------------------------------------- reports

export interface StepRow {
  key: string;
  label: string;
  /** Cumulative list size up to this step (scope applied). */
  list: number;
  /** Items of exactly this step. */
  own: number;
  /** Of the cumulative list: present in the game's playable content (scope: the job's). */
  inGame: number;
  /** Of the cumulative list: mastered by the player. */
  mastered: number;
  ratio: number;
  ceiling: number;
}

export interface YardstickReport {
  yardstick: Yardstick;
  rows: StepRow[];
  /** The rows come from the compiled lists (false: estimated from the game's own tags). */
  fromLists: boolean;
  /** Phrases / grammar points of the lists (cumulative up to the last step) and how many the content uses. */
  phrases: { list: number; inGame: number };
  grammar: { list: number; inGame: number };
  note: string;
}

export interface Scope {
  /** Restrict to the list items of these domains and to words of this vocabulary (a job's). */
  domains?: string[];
  vocab?: Set<string>;
}

/** Phrase / grammar ids the game's content refers to (tasks' and QA's `phrases` / `grammar`). */
export function contentRefs(data: GameData): { phrases: Set<string>; grammar: Set<string> } {
  const phrases = new Set<string>();
  const grammar = new Set<string>();
  for (const j of data.content.jobs ?? [])
    for (const jc of Object.values(j.content)) {
      if (!jc) continue;
      for (const t of [...jc.tasks, ...jc.templates]) {
        t.phrases?.forEach((x) => phrases.add(x));
        t.grammar?.forEach((x) => grammar.add(x));
      }
      for (const q of Object.values(jc.qa ?? {}))
        for (const x of q) {
          x.phrases?.forEach((y) => phrases.add(y));
          x.grammar?.forEach((y) => grammar.add(y));
        }
    }
  return { phrases, grammar };
}

export function yardstickReport(data: GameData, p: LangProgress, y: Yardstick, scope: Scope = {}): YardstickReport {
  const n = stepCount(y);
  const rows: StepRow[] = [];
  const doms = scope.domains?.length ? new Set(scope.domains) : null;
  const inScopeDom = (ds: string[]) => !doms || ds.some((d) => doms.has(d));
  const refs = contentRefs(data);
  if (data.lang === 'en' && listsLoaded()) {
    const { lexOf, lists } = linkFor(data);
    const own = Array.from({ length: n }, () => 0);
    const inG = Array.from({ length: n }, () => 0);
    const mas = Array.from({ length: n }, () => 0);
    for (const v of lists.vocab) {
      const s = stepOf(y, v);
      if (s < 0 || !inScopeDom(v.domains)) continue;
      own[s]++;
      const id = lexOf.get(v);
      if (id && (!scope.vocab || scope.vocab.has(id))) {
        inG[s]++;
        if (isMastered(p.words[id])) mas[s]++;
      }
    }
    let cl = 0;
    let ci = 0;
    let cm = 0;
    for (let i = 0; i < n; i++) {
      cl += own[i];
      ci += inG[i];
      cm += mas[i];
      rows.push({ key: stepKey(y, i), label: stepLabel(y, stepKey(y, i)), list: cl, own: own[i], inGame: ci, mastered: cm, ratio: cl ? cm / cl : 0, ceiling: cl ? ci / cl : 0 });
    }
    const ph = lists.phrases.filter((x) => stepOf(y, x) >= 0 && inScopeDom(x.domains));
    const gr = lists.grammar.filter((x) => stepOf(y, x) >= 0);
    return {
      yardstick: y,
      rows,
      fromLists: true,
      phrases: { list: ph.length, inGame: ph.filter((x) => refs.phrases.has(x.id)).length },
      grammar: { list: gr.length, inGame: gr.filter((x) => refs.grammar.has(x.id)).length },
      note: '',
    };
  }
  // Without the lists: the game's own tags (英検 only; TOEIC needs the lists) and its level targets.
  for (let i = 0; i < n; i++) {
    const key = stepKey(y, i);
    const inGame = data.content.lexicon.filter((e) => {
      const s = lexStep(y, e);
      return s >= 0 && s <= i && (!scope.vocab || scope.vocab.has(e.id));
    });
    const list = y === 'eiken' && !scope.vocab ? (data.content.levelTargets.exam[key] ?? inGame.length) : inGame.length;
    const m = inGame.filter((e) => isMastered(p.words[e.id])).length;
    rows.push({ key, label: stepLabel(y, key), list, own: 0, inGame: inGame.length, mastered: m, ratio: list ? m / list : 0, ceiling: list ? Math.min(1, inGame.length / list) : 0 });
  }
  return {
    yardstick: y,
    rows,
    fromLists: false,
    phrases: { list: 0, inGame: 0 },
    grammar: { list: 0, inGame: 0 },
    note:
      data.lang !== 'en'
        ? ''
        : y === 'toeic'
          ? 'TOEIC の語彙一覧（data/english）がこのビルドにまだ入っていないため、TOEIC の帯ごとの進み具合は表示できません。'
          : '英検の語彙一覧（data/english）がまだ入っていないため、ゲーム内の語の目安タグと推定語数で表示しています。',
  };
}

// ---------------------------------------------------------------------------- selection

export interface Selection {
  /** Next words the scope's content can teach (lexicon ids, in curriculum order). */
  teachable: { id: string; item: VocabItem | null; step: number }[];
  /** Next list words no playable content covers yet (honest list). */
  uncovered: VocabItem[];
  uncoveredCount: number;
  phrases: { item: PhraseItem; covered: boolean }[];
  grammar: { item: GrammarItem; covered: boolean }[];
}

export interface SelectOpts {
  yardstick: Yardstick;
  domains?: string[];
  /** Restrict teachable words to this vocabulary (the job's). */
  vocab?: Set<string>;
  /** Highest step to consider (inclusive); default: all. */
  maxStep?: number;
  n?: number;
}

function businessBonus(ds: string[]): number {
  return ds.some((d) => BUSINESS_DOMAINS.includes(d)) ? 1 : 0;
}

/** Is this word already part of the player's experience (met in play or 既習)? */
function known(p: LangProgress, id: string): boolean {
  const w = p.words[id];
  return !!w && (w.seen > 0 || w.confirmed);
}

export function selectNext(data: GameData, p: LangProgress, o: SelectOpts): Selection {
  const n = o.n ?? 12;
  const y = o.yardstick;
  const doms = o.domains?.length ? new Set(o.domains) : null;
  const inDom = (ds: string[]) => !doms || ds.some((d) => doms.has(d));
  const max = o.maxStep ?? stepCount(y) - 1;
  const refs = contentRefs(data);
  if (data.lang === 'en' && listsLoaded()) {
    const { lexOf, lists } = linkFor(data);
    const cands = lists.vocab.filter((v) => {
      const s = stepOf(y, v);
      return s >= 0 && s <= max && inDom(v.domains);
    });
    cands.sort((a, b) => stepOf(y, a) - stepOf(y, b) || (y === 'toeic' ? businessBonus(b.domains) - businessBonus(a.domains) : 0) || b.freq - a.freq);
    const teachable: Selection['teachable'] = [];
    const uncovered: VocabItem[] = [];
    let uncoveredCount = 0;
    for (const v of cands) {
      const id = lexOf.get(v);
      if (id && (!o.vocab || o.vocab.has(id))) {
        if (!known(p, id) && teachable.length < n) teachable.push({ id, item: v, step: stepOf(y, v) });
      } else if (!id) {
        uncoveredCount++;
        if (uncovered.length < n) uncovered.push(v);
      }
    }
    const phrases = lists.phrases
      .filter((x) => stepOf(y, x) >= 0 && stepOf(y, x) <= max && inDom(x.domains))
      .sort((a, b) => stepOf(y, a) - stepOf(y, b))
      .slice(0, n)
      .map((item) => ({ item, covered: refs.phrases.has(item.id) }));
    const grammar = lists.grammar
      .filter((x) => stepOf(y, x) >= 0 && stepOf(y, x) <= max)
      .sort((a, b) => stepOf(y, a) - stepOf(y, b))
      .slice(0, n)
      .map((item) => ({ item, covered: refs.grammar.has(item.id) }));
    return { teachable, uncovered, uncoveredCount, phrases, grammar };
  }
  // Without lists: the game's own tags (英検), lowest grade first.
  const teachable = data.content.lexicon
    .filter((e) => (!o.vocab || o.vocab.has(e.id)) && !known(p, e.id) && (!doms || !e.domains?.length || e.domains.some((d) => doms.has(d))))
    .map((e) => ({ id: e.id, item: null, step: lexStep('eiken', e) }))
    .filter((x) => x.step <= max)
    .sort((a, b) => (a.step < 0 ? 99 : a.step) - (b.step < 0 ? 99 : b.step))
    .slice(0, n);
  return { teachable, uncovered: [], uncoveredCount: 0, phrases: [], grammar: [] };
}
