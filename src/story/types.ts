/**
 * Story layer: schema (content) + runtime state (save).
 *
 * The structure of the story is language-neutral (`StoryShared`, src/content/shared/story.ts):
 * characters, beats with their triggers / conditions / effects, documents, chapters and small
 * talk. Each language supplies only the words (`StoryText`, src/content/{en,zh}/story.ts), so
 * both languages tell the same story beat for beat. See README.md "Story".
 */
import type { LexEntry, OrderRule, VerificationPage } from '../core/types';
import type { SlipSpec } from '../core/townTypes';

// ---------------------------------------------------------------------------
// Shared structure
// ---------------------------------------------------------------------------

/**
 * Conditions of a beat / talk line / document line. Everything listed must hold.
 * `stage` / `day` are minimums. `outcome` and `choice` map a beat id to accepted results.
 */
export interface StoryCond {
  stage?: number;
  day?: number;
  /** Beats that must be resolved (any outcome). */
  after?: string[];
  /** beat id -> accepted outcomes ('good' | 'poor' | 'seen'). */
  outcome?: Record<string, BeatOutcome[]>;
  /** beat id -> accepted choice option ids. */
  choice?: Record<string, string[]>;
  flags?: string[];
  notFlags?: string[];
  /** Documents already found. */
  docs?: string[];
  rep?: number;
}

export type BeatOutcome = 'good' | 'poor' | 'seen';

export interface StoryEffect {
  rep?: number;
  money?: number;
  flags?: string[];
  /** Documents handed to the player (they appear in the collection, with a "found" card). */
  docs?: string[];
}

export interface ChoiceDef {
  id: string;
  effects?: StoryEffect;
}

/**
 * - visit: the character comes into the shop as one of the day's customers (order + reaction).
 * - delivery: the character asks for a delivery; it replaces the day's delivery slip.
 * - moment: a short scene at the start (`at: 'morning'`) or end (`'evening'`) of the day.
 * Outcome: visit / delivery → 'good' (perfect or minor) | 'poor'; moment → 'seen'.
 * A `choice` (target-language replies) follows the scene; its option id is recorded separately.
 */
export type BeatKind = 'visit' | 'delivery' | 'moment';

export interface BeatDef {
  id: string;
  character: string;
  kind: BeatKind;
  when: StoryCond;
  /** Beats sharing a group are alternatives: once one fires, the others never do. */
  group?: string;
  /** Minimum days since this character's previous beat (default 2). */
  gap?: number;
  /** visit: exactly one of rule / recipe. */
  rule?: OrderRule;
  recipe?: string;
  /** delivery: language-neutral slip. */
  slip?: SlipSpec;
  /** moment: when it happens (default morning). */
  at?: 'morning' | 'evening';
  choice?: ChoiceDef[];
  effects?: { good?: StoryEffect; poor?: StoryEffect; seen?: StoryEffect };
}

export type DocKind = 'letter' | 'note' | 'diary' | 'postcard' | 'receipt' | 'recipe' | 'gift';

export interface DocumentDef {
  id: string;
  kind: DocKind;
  icon: string;
  /** Stage by which every word of the document has been met (checked by the validator). */
  readable: number;
}

export interface ChapterDef {
  id: string;
  /** First shop stage of the chapter (chapters follow the stages softly: stages have no hard gate). */
  stage: number;
}

export interface CharacterDef {
  id: string;
  /** The shop customer this character is (name + avatar come from the customer list). */
  customer?: string;
  /** Avatar when the character is not a customer. */
  avatar?: string;
}

/** Small talk: appended to a regular's reaction after a good cup of an ordinary order. */
export interface TalkDef {
  id: string;
  character: string;
  when: StoryCond;
}

export interface StoryShared {
  chapters: ChapterDef[];
  characters: CharacterDef[];
  beats: BeatDef[];
  documents: DocumentDef[];
  talk: TalkDef[];
}

// ---------------------------------------------------------------------------
// Per-language text
// ---------------------------------------------------------------------------

/** A scene line: target-language speech (`say`, by `who` or the beat's character) or Japanese narration (`ja`). */
export type SceneLine = { say: string; who?: string } | { ja: string };

export interface BeatText {
  /** visit: what the character orders. */
  order?: string;
  /** delivery: the note the character leaves (target language). */
  request?: string;
  /** delivery: recipient id in the town's recipient list (a story recipient or an existing one). */
  recipient?: string;
  /** Reaction after a good / poor cup or delivery (poor deliveries keep the activity's own reaction when absent). */
  good?: string;
  poor?: string;
  /** Scene after the reaction (or the moment itself). Outcome-specific lines win over `lines`. */
  lines?: SceneLine[];
  linesGood?: SceneLine[];
  linesPoor?: SceneLine[];
  /** Choice prompt (target language, said by the character) and options (target language) with replies. */
  prompt?: string;
  options?: Record<string, { text: string; reply: string; ja?: string }>;
  /** Player's inner thought for tonight's ledger (Japanese chrome, sparse). */
  hookJa?: string;
  hookGoodJa?: string;
  hookPoorJa?: string;
}

export interface DocLine {
  text: string;
  /** Shown only when the condition holds when the document is read (e.g. a postscript). */
  when?: StoryCond;
}

export interface DocText {
  /** Japanese chrome title in the collection ("封筒の手紙"). */
  titleJa: string;
  lines: (string | DocLine)[];
  /** Narration when it is found. */
  foundJa?: string;
}

export interface StoryText {
  /** Proper names inside story texts: shown as names, never tokenised as words. */
  names: string[];
  /** Display name / avatar of characters that are not customers. */
  characters: Record<string, { name: string; avatar?: string }>;
  /** Story-only delivery recipients (merged into the town recipient list, never picked at random). */
  recipients: { id: string; name: string; avatar: string }[];
  chapters: Record<string, { titleJa: string; introJa: string }>;
  beats: Record<string, BeatText>;
  docs: Record<string, DocText>;
  talk: Record<string, string>;
  /** Words introduced by the story (with their 検証ページ). */
  lexicon: LexEntry[];
  pages: VerificationPage[];
  /** Extra surface forms for existing lexicon ids (en past tenses: is → was / were). */
  forms: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Runtime state (in the save, per language)
// ---------------------------------------------------------------------------

export interface BeatRecord {
  day: number;
  status: 'planned' | 'done';
  outcome?: BeatOutcome;
  choice?: string;
}

export interface DocRecord {
  day: number;
  /** Share of the document's words already 確定 when it was found (0..1). */
  firstPct: number;
  lastRead?: number;
  reads: number;
  /**
   * The document's words that were 確定 when it was last put away (optional; saves before this
   * field simply have nothing to compare against). Re-reading highlights words confirmed since.
   */
  known?: string[];
}

export interface Ledger {
  day: number;
  takings: number;
  expenses: number;
  /** Coins spent on the renovation catalogue today (optional: older ledgers have none). */
  purchases?: number;
  money: number;
  repDelta: number;
  served: number;
  perfect: number;
  /** Regular characters met today. */
  met: string[];
  /** Words confirmed today (検証ページ). */
  confirmed: string[];
  docs: string[];
  hooks: string[];
}

export type StoryCard =
  | { kind: 'chapter'; chapter: string }
  /** A beat's scene (lines + choice); `request` = a delivery beat's note in the morning. */
  | { kind: 'scene'; beat: string; outcome?: BeatOutcome; request?: boolean }
  | { kind: 'reply'; beat: string; option: string }
  | { kind: 'doc'; doc: string }
  | { kind: 'ledger'; ledger: Ledger };

export interface StoryDay {
  day: number;
  shopPlanned: boolean;
  townPlanned: boolean;
  beats: string[];
  met: string[];
  talked: string[];
  docs: string[];
  hooks: string[];
  confirmedAtStart: string[];
  repStart: number;
  moneyStart: number;
  evening: boolean;
}

export interface StoryState {
  beats: Record<string, BeatRecord>;
  /** Groups whose alternative has fired. */
  groups: string[];
  docs: Record<string, DocRecord>;
  flags: string[];
  /** Highest chapter index shown (−1 = none yet). */
  chapter: number;
  talk: Record<string, number>;
  cards: StoryCard[];
  today: StoryDay | null;
  /** Last ledger (kept for the collection screen). */
  lastLedger: Ledger | null;
}

export function newStoryState(): StoryState {
  return { beats: {}, groups: [], docs: {}, flags: [], chapter: -1, talk: {}, cards: [], today: null, lastLedger: null };
}
