/**
 * Jobs (仕事): the town offers many working lives. Each job is mostly DATA over a small set of
 * reusable task archetypes (make / sort / check / respond / trade / deliver): the archetype
 * owns the scene's interaction, the rules that judge the player's work, the reactions and the
 * word tracking; the job supplies the place, the things, the people, the texts, the rank ladder
 * and the vocabulary domains. See README "Jobs" for the authoring guide.
 *
 * The tea house (茶房) is the first job; its market and delivery are the trade and deliver
 * archetypes of the original game and keep their own engines (src/activities/*).
 */
import type { EikenKey } from '../curriculum/yardsticks';
import type { Face, Lang, LexEntry, Outcome, VerificationPage } from '../core/types';

export type ArchetypeId = 'make' | 'sort' | 'check' | 'respond' | 'trade' | 'deliver';

/** Harder variants a rank can unlock (not just more words). */
export type TaskFeature =
  /** Longer texts: templates may add a second sentence / more items / more fields. */
  | 'long'
  /** The request is only heard (listen button); the text appears after the task. */
  | 'audioOnly'
  /** A second step: e.g. check → also choose the corrected value; make → two dishes. */
  | 'multiStep'
  /** Optional time pressure (only when the player switched it on at the job board). */
  | 'timed';

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

/**
 * A thing the job handles (an egg, a stamp, a parcel …). `word` is its lexicon id, `art` the key of
 * its drawing (src/ui/jobs/art), `tags` group it for template slots; `plural` is the surface for
 * n ≠ 1 (default word + "s"); `price` for trade, `bin` for sort (where it belongs).
 */
export interface ThingDef {
  id: string;
  word: string;
  art: string;
  tags?: string[];
  /** Surface for n ≠ 1 (default word + "s"). Not needed for `mass` things. */
  plural?: string;
  /**
   * A mass (uncountable) noun: "bread", "rice", "soup". It never takes a plural; counted, it goes by its
   * `unit` ("two pieces of bread"); reactions say "too much bread", "where is the bread?".
   */
  mass?: boolean;
  price?: number;
  bin?: string;
  /**
   * Unit phrase for counts ({n} = number word): `'{n} pieces of bread'` (the unit noun is made singular
   * for n = 1: "one piece of bread"), or `{ one, other }` when that rule does not fit.
   */
  unit?: string | { one: string; other: string };
  /** Highest count a request may ask for. */
  max?: number;
  /** Weight in kilos (post office parcels on the scale). */
  kilos?: number;
  /**
   * How a request names it when it means "one of them" in a thing slot ("a salad"); without it a counted thing is
   * named in the plural ("I love sausages!") and a mass noun as it is ("bread").
   */
  one?: string;
  /** The cooking methods that make sense for it (a template's method is chosen among them); default: any. */
  cook?: string[];
}

export interface JobPerson {
  id: string;
  /** In-world name (target language, not vocabulary). */
  name: string;
  /** Role emoji: drives the drawn look (see ui/art/customer.tsx). */
  avatar: string;
  /**
   * A colleague (the housing desk, a reporter, the doctor): hands work over and asks as a colleague, and may be
   * named on letters and papers, but never comes to the counter as a client (a spoken request of a template is
   * said by the job's other people).
   */
  staff?: boolean;
}

export interface RankDef {
  rank: number;
  /** To reach this rank (cumulative, in this job): tasks done well (perfect / minor) and confirmed words of the job. */
  need: { good: number; words: number };
  /** What the material of this rank corresponds to (annotation; also the template level ceiling). */
  level: { eiken: EikenKey; toeic: number | null };
  /** Harder variants unlocked from this rank on. */
  unlocks?: TaskFeature[];
  /** Tasks per shift at this rank. */
  tasks: number;
  reward?: { coins?: number; good?: { id: string; n: number } };
  /** Japanese chrome: what changes at this rank. */
  noteJa: string;
}

/** Cross-job glue: what a job produces for the others / what it uses. */
export interface JobLinks {
  /** Perfect tasks put this good into the town's shared store. */
  produce?: { good: string; perPerfect: number }[];
  /** While the good is in store, each task done well uses one and pays `bonus` extra coins; `line` is said. */
  use?: { good: string; bonus: number; line?: string }[];
}

export interface GoodDef {
  id: string;
  /** Japanese chrome name + emoji (the store is shown on the job board and in the ledger). */
  nameJa: string;
  icon: string;
  /** Lexicon id (in-world label on the crate). */
  word?: string;
}

// ---------------------------------------------------------------------------
// Archetype specs (one task's content, after templates are filled)
// ---------------------------------------------------------------------------

export interface MakeSpec {
  want: { thing: string; n?: number; min?: number; max?: number }[];
  /** Must not be in the dish: an allergy, "I can't eat …", a doctor's order (serving it is harmful: bad). */
  forbid?: string[];
  /** Not wanted ("no onions", "without", "instead of"): serving it is a plain mistake (fail), not harmful. */
  dislike?: string[];
  /** Extras that are fine. */
  allow?: string[];
  vessel?: string;
  method?: string;
  /** Things that must go in in this order (a recipe card's steps: "crack the eggs, then add the cheese"). */
  order?: string[];
  /** Things the pantry is out of today ("there is no fish today"): shown empty, cannot be used. */
  out?: string[];
}

export interface SortSpec {
  bins: string[];
  items: { id: string; text: string; thing?: string; bin: string }[];
}

export interface TradeSpec {
  want: { thing: string; n: number }[];
  /** Coins the customer puts on the counter. */
  pay: number;
  /**
   * A parcel to post: the clerk weighs it on the scale and charges the rate of the rate table for its
   * destination and weight (on top of any goods). `kilos` is what the scale shows.
   */
  post?: { dest: string; kilos: number; label?: string };
}

export interface DocField {
  id: string;
  label: string;
  value: string;
}

export interface CheckDoc {
  kind: 'card' | 'letter' | 'ledger' | 'invoice' | 'order' | 'note' | 'speech' | 'label';
  title?: string;
  fields?: DocField[];
  /** Free lines (a speech, a letter); values may also be written into lines. */
  lines?: string[];
}

export interface CheckSpec {
  docs: CheckDoc[];
  /** Index of the document the player checks (its fields can be marked). */
  target: number;
  /** Field of the target that disagrees with the others (null = all in order). */
  wrong: string | null;
  /** multiStep: the corrected value must also be chosen. */
  fixOptions?: string[];
  fix?: string;
}

export interface RespondSlotCell {
  id: string;
  /** Row / column keys (calendar: day × time; rooms: floor × number). */
  row: string;
  col: string;
  tags: string[];
  /** Occupied (written in the cell). */
  busy?: string;
}

export interface RespondSpec {
  mode: 'choose' | 'form' | 'slot';
  msg: { kind: 'speech' | 'letter' | 'email' | 'phone' | 'memo'; from?: string; subject?: string; lines: string[] };
  /** choose: reply options (target language), `answer` = index of the right one. */
  options?: string[];
  answer?: number;
  /** form: chips per field. */
  fields?: { id: string; label: string; options: string[]; answer: string }[];
  /** slot: pick the one free cell that fits. */
  slot?: { layout: 'calendar' | 'rooms'; rows: { id: string; label: string }[]; cols: { id: string; label: string }[]; cells: RespondSlotCell[]; answer: string };
}

/** The post office's rate table: destinations × weight bands → coins. */
export interface RateTable {
  title: string;
  dests: { id: string; label: string }[];
  /** Weight bands (upper bound in kilos, inclusive) with their in-world label ("up to 2 kilos"). */
  bands: { upTo: number; label: string }[];
  /** price[dest index][band index] */
  price: number[][];
}

export type TaskSpec =
  | ({ arch: 'make' } & MakeSpec)
  | ({ arch: 'sort' } & SortSpec)
  | ({ arch: 'trade' } & TradeSpec)
  | ({ arch: 'check' } & CheckSpec)
  | ({ arch: 'respond' } & RespondSpec);

// ---------------------------------------------------------------------------
// Authored tasks and templates
// ---------------------------------------------------------------------------

interface TaskMeta {
  id: string;
  /** Lowest rank at which the task can come. */
  rank: number;
  /** Order within the rank (authored tasks are the job's curriculum spine). */
  seq?: number;
  person?: string;
  /** What the person says when the task starts (spoken / written request). Optional for some archetypes. */
  say?: string;
  features?: TaskFeature[];
  /** Grammar points (ids in data/english/grammar.json) the task's sentences exercise. */
  grammar?: string[];
  /** Phrases (ids in data/english/phrases.json) the task's sentences use (validated: the text contains them). */
  phrases?: string[];
  weight?: number;
}

export type AuthoredTask = TaskMeta & TaskSpec;

/** Slot kinds of the template generator. */
export type SlotDef =
  /** A counted thing: {slot} = "two eggs" (unit phrase or plural); `min..max` count. */
  | { kind: 'qty'; tags?: string[]; min?: number; max?: number; maxLevel?: EikenKey }
  /** A thing by name: {slot} = "egg". */
  | { kind: 'thing'; tags?: string[]; maxLevel?: EikenKey }
  /** A thing that must NOT be used: an allergy / "I can't eat" (harmful if served). */
  | { kind: 'forbid'; tags?: string[]; maxLevel?: EikenKey }
  /** A thing that is not wanted: "no onions", "without", "instead of" (a mistake if served, not harmful). */
  | { kind: 'dislike'; tags?: string[]; maxLevel?: EikenKey }
  /** A method / vessel of the make bench (`only`: limited to these ids, when the sentence fits only them). */
  | { kind: 'method'; only?: string[] }
  | { kind: 'vessel'; only?: string[] }
  /** A lexicon word typed by domain / POS / level (sentence variety; no rule effect). */
  | { kind: 'word'; domain?: string; pos?: string; ids?: string[]; maxLevel?: EikenKey }
  /**
   * A person's in-world name. `self`: the speaker names themselves ("This is {name}.") — the task's person
   * is that person (their drawn look), so the name and the face always agree.
   */
  | { kind: 'name'; self?: boolean }
  /** One of fixed values (sentence variety; the generator keeps the instance's texts consistent). */
  | { kind: 'pick'; values: string[] };

export interface MakeTemplate {
  arch: 'make';
  slots: Record<string, SlotDef>;
  vesselRequired?: boolean;
  /** Slot names whose things must go in in this order (a recipe card). */
  order?: string[];
  /**
   * "If there is no X, give Y": with probability `p` the pantry is out of the `first` slot's thing and the
   * dish wants the `then` slot's thing instead; otherwise the first is wanted and the second is not.
   */
  ifOut?: { first: string; then: string; p: number };
}

export interface SortTemplate {
  arch: 'sort';
  /** Items per task [min, max] (long: +1). */
  count: [number, number];
  /** Label patterns: `{bin}` = the target bin's reference text, `{thing}` = a thing (its `bin` decides), `{name}` = a person. */
  patterns: { text: string; bins?: string[]; tags?: string[] }[];
  bins: string[];
}

export interface TradeTemplate {
  arch: 'trade';
  slots: Record<string, SlotDef>;
  /** The customer pays the exact sum, or rounds up to a bigger coin (→ change). */
  pay: 'exact' | 'round';
  /** A parcel to weigh and post: destinations (rate-table ids) and a weight range in kilos. `{dest}` in the text = the destination's words. */
  post?: { dests: { id: string; text: string }[]; kilos: [number, number] };
}

/**
 * A field of a check template: fixed `values`, or a number from `range` written with `fmt` ("{n} boxes"),
 * or computed from the others with `calc` (a total, a refund, the last night of a stay) so that every paper
 * is internally consistent and the only discrepancy is the one the generator puts in.
 */
export interface CheckField {
  id: string;
  label: string;
  values?: string[];
  /** [lo, hi] or [lo, hi, step] */
  range?: [number, number] | [number, number, number];
  /** How the number is written; `{n}` the number (default "{n}"). With `names`, `{n}` is replaced by names[n]. */
  fmt?: string;
  /** Number → word ("Monday" for 1 …): the field is written as names[n]. */
  names?: string[];
  /**
   * Computed from the numbers of the fields listed before it, as an expression (src/jobs/expr.ts):
   * `'qty * price'`, `'(arrive - 1 + nights) % 7 + 1'`, `'days > 7 ? price : days >= 3 ? price / 2 : 0'`.
   */
  calc?: string;
  /** The believable wrong values of a field, as expressions (e.g. the other refunds the rule allows); default: slips of the pen. */
  alts?: string[];
}

export interface CheckTemplate {
  arch: 'check';
  fields: CheckField[];
  /** Documents: fields shown as label/value lines; `lines` patterns may use {fieldId}. */
  docs: { kind: CheckDoc['kind']; title?: string; fields?: string[]; lines?: string[] }[];
  target: number;
  /** Probability that one field of the target disagrees. */
  pWrong: number;
  /** Fields that may be the wrong one (default: all of the target's). */
  wrongable?: string[];
}

export interface QaItem {
  q: string;
  a: string;
  /** Communicative function (answers with another function are the distractors). */
  fn: string;
  rank: number;
  /**
   * Near misses written for this item: answers on the same topic that get one fact wrong (the date, the amount,
   * the person, the condition). They are the wrong options first; see src/jobs/nearmiss.ts (facts the answer
   * echoes from the message are also varied automatically).
   */
  near?: string[];
  phrases?: string[];
  grammar?: string[];
}

export interface RespondTemplate {
  arch: 'respond';
  mode: 'choose';
  /** Question/answer bank (ids into JobContent.qa). */
  bank: string;
  kind: RespondSpec['msg']['kind'];
}

/**
 * The message pad: a call / visit / letter whose `lines` carry the values of `fields` ({fieldId}); the player
 * writes the message by choosing each field's value among near misses (the other values of the field).
 */
export interface FormTemplate {
  arch: 'respond';
  mode: 'form';
  kind: RespondSpec['msg']['kind'];
  /** Message lines; `{fieldId}` = the chosen value. Lines may also use the template's other slots. */
  lines: string[];
  fields: { id: string; label: string; values: string[]; options?: number }[];
  /** Free slots for the lines (e.g. `{ name: { kind: 'name', self: true } }`). */
  slots?: Record<string, SlotDef>;
  from?: string;
  subject?: string;
}

export interface SlotTemplate {
  arch: 'respond';
  mode: 'slot';
  layout: 'calendar' | 'rooms';
  rows: { id: string; label: string }[];
  cols: { id: string; label: string }[];
  /** Tag sets per cell come from row id, col id and `cellTags`. */
  cellTags?: Record<string, string[]>;
  /** Constraint phrases: a tag + its sentence ("{tag}" chosen from these). `not` phrases exclude. */
  want: { tag: string; text: string }[];
  avoid: { tag: string; text: string }[];
  /** Occupied-cell texts. */
  busy: string[];
  kind: RespondSpec['msg']['kind'];
  /** Opening / closing lines of the message (one of each is chosen). */
  open?: string[];
  close?: string[];
}

export type TaskTemplate = TaskMeta & (MakeTemplate | SortTemplate | TradeTemplate | CheckTemplate | RespondTemplate | SlotTemplate | FormTemplate);

// ---------------------------------------------------------------------------
// Reactions
// ---------------------------------------------------------------------------

export type JobIssueKind =
  // make
  | 'empty' | 'forbidden' | 'disliked' | 'missing' | 'extra' | 'too_much' | 'too_little' | 'wrong_vessel' | 'wrong_method' | 'wrong_order'
  // sort
  | 'wrong_bin'
  // trade
  | 'wrong_goods' | 'wrong_postage' | 'change_short' | 'change_over'
  // check
  | 'missed' | 'false_alarm' | 'wrong_field' | 'wrong_fix'
  // respond
  | 'wrong_reply' | 'wrong_form' | 'wrong_slot';

export type JobReactionKind = JobIssueKind | 'perfect' | 'minor' | 'any_fail';

export interface JobReaction {
  id: string;
  kind: JobReactionKind;
  text: string;
  face: Face;
  /** Lowest rank the line is used at. */
  rank?: number;
  /** Only for tasks of this archetype (the boss checks sorting, a customer reacts to a sale). */
  arch?: ArchetypeId;
  /**
   * Only when the task's texts match this pattern (a regular expression, case-insensitive): a line about bags
   * for the luggage, about "the book" for the register book. Lines are plain content; the pattern keeps a line
   * where it makes sense.
   */
  needs?: string;
  /** Never when the task's texts match this pattern. */
  not?: string;
  /**
   * Who says it: 'person' — the one who made the spoken request (not when the boss handed over a letter, an
   * e-mail or a call); 'boss' — only for a handed-over paper or call.
   */
  voice?: 'person' | 'boss';
  /**
   * A `minor` line about time ("please be fast next time"): said only when the work was right but the optional
   * timer ran out, never for a small mistake; a `minor` line without it is about a small mistake and is never
   * said for lateness.
   */
  late?: boolean;
}

/**
 * Lines of the job's boss / place (start of shift, end, rank-up, a link good used). `handover`: what the boss
 * says when handing over a paper task without a spoken request (an e-mail, a letter, a memo); `msg` limits it
 * to one kind of message.
 */
export interface JobLine {
  id: string;
  kind: 'start' | 'end' | 'rankup' | 'link' | 'handover';
  text: string;
  rank?: number;
  msg?: RespondSpec['msg']['kind'] | 'check' | 'sort';
}

// ---------------------------------------------------------------------------
// Job definition
// ---------------------------------------------------------------------------

/** Make bench configuration (vessels / methods / the pantry). */
export interface MakeBench {
  vessels?: { id: string; word: string; art: string }[];
  /** `surface`: how a request says it ("fried" for fry). `where`: the station it is done at (stove / oven / grill). */
  methods?: { id: string; word: string; art: string; surface?: string; where?: 'stove' | 'oven' | 'grill' }[];
  /** Max portions of one thing on the bench. */
  max: number;
}

export interface SortBench {
  bins: { id: string; label: string; ref: string; art?: string }[];
  item: 'letter' | 'parcel' | 'food' | 'file';
}

export interface TradeBench {
  /** Coins in the till (change is given from these). */
  coins: number[];
  /** Board title (in-world). */
  board: string;
  /** Postage by destination and weight (the scale and the rate table on the counter). */
  rates?: RateTable;
}

/** Language-specific content of a job. */
export interface JobContent {
  /** In-world sign over the door. */
  sign: string;
  /** Job words (merged into the language lexicon); gloss / levels may be left for data/english to fill. */
  lexicon: JobLexEntry[];
  pages: VerificationPage[];
  /** Extra surface forms for existing lexicon ids. */
  forms?: Record<string, string[]>;
  /**
   * Inflected words taught as words of their own, by id → the list headword they are a form of
   * (`{ names: 'name', in_book_v: 'book' }`): sets `LexEntry.lemma` on that entry wherever it is defined.
   */
  lemmas?: Record<string, string>;
  people: JobPerson[];
  boss: string;
  things: ThingDef[];
  make?: MakeBench;
  sort?: SortBench;
  trade?: TradeBench;
  tasks: AuthoredTask[];
  templates: TaskTemplate[];
  qa?: Record<string, QaItem[]>;
  reactions: JobReaction[];
  lines: JobLine[];
}

/** Lexicon entries of job content: gloss / levels / cefr may come from data/english/vocab.json. */
export type JobLexEntry = Omit<LexEntry, 'gloss' | 'cefr' | 'eiken'> & Partial<Pick<LexEntry, 'gloss' | 'cefr' | 'eiken'>>;

export interface JobDef {
  id: string;
  /** Japanese chrome. */
  nameJa: string;
  /** What the job teaches, in Japanese (shown at the job board). */
  blurbJa: string;
  icon: string;
  /** Vocabulary domains (data/english taxonomy). */
  domains: string[];
  archetypes: ArchetypeId[];
  /** Which archetype each task shape uses is in the tasks; this is the order the shift mixes them. */
  ranks: RankDef[];
  /** Coins per task by outcome. */
  wage: Record<Outcome, number>;
  /** Day (calendar, counted from the board opening) from which the job is offered. */
  opensAfter: number;
  /**
   * When the workplace is open (default: always). Kept from the first version (0 朝 / 1 昼 / 2 夕) and read as:
   * 0 or 1 = it has day shifts (can be the day's workplace: 始業前 → 業務中), 2 = it has an evening shift (a second
   * shift after closing time, 業務後). E.g. `[0, 1]` day only, `[0, 2]` / `[0, 1, 2]` day and evening, `[2]` evening only.
   */
  hours?: number[];
  /** Building on the town map (src/ui/jobs/TownHub.tsx). */
  building: string;
  links?: JobLinks;
  /** Playable languages. The tea house plays in both; new jobs are English-only. */
  content: Partial<Record<Lang, JobContent>>;
  /** The tea house: runs the original day engine (market → shop → delivery). */
  legacy?: boolean;
  /** Steers the job board recommendation: 'school' (英検 order) or 'work' (TOEIC / business). */
  flavour: 'school' | 'work';
}

// ---------------------------------------------------------------------------
// Runtime (saved)
// ---------------------------------------------------------------------------

export interface TaskInstance {
  key: string;
  job: string;
  source: { type: 'authored' | 'template'; id: string };
  spec: TaskSpec;
  person: string;
  say: string;
  audioOnly: boolean;
  timed: boolean;
  /** All in-world texts of the task (counted as encounters when it is presented). */
  texts: string[];
  /** Text whose words are rewarded on success (the request). */
  focus: string[];
  /** `say` is the boss handing over a paper (not the request itself). */
  handover?: boolean;
}

export type TaskAnswer =
  | { arch: 'make'; counts: Record<string, number>; vessel: string | null; method: string | null; seq?: string[] }
  | { arch: 'sort'; placed: Record<string, string> }
  | { arch: 'trade'; counts: Record<string, number>; change: number; postage?: number }
  | { arch: 'check'; verdict: 'ok' | 'fix'; field?: string; fix?: string }
  | { arch: 'respond'; choice?: number; fields?: Record<string, string>; slot?: string };

export interface JobIssue {
  kind: JobIssueKind;
  thing?: string;
  item?: string;
  field?: string;
  /** Texts (in-world) whose words the mistake implicates. */
  about: string[];
  /** What the player gave (the reply chosen, a pad value, a slot cell id, a count, coins) and what the task needed: the reaction says it. */
  got?: string;
  want?: string;
}

export interface JobEvaluation {
  outcome: Outcome;
  issues: JobIssue[];
  primary: JobIssue | null;
}

export interface TaskResult {
  key: string;
  outcome: Outcome;
  reaction: string;
  face: Face;
  coins: number;
  /** Bonus coins from a used link good. */
  bonus: number;
  /** Item ids the sort / form the player got wrong (internal: never shown — the person's reaction says what was wrong). */
  wrongItems: string[];
}

export interface ShiftState {
  job: string;
  part: number;
  tasks: TaskInstance[];
  index: number;
  phase: 'intro' | 'task' | 'result' | 'done';
  results: TaskResult[];
  startLine: string;
  endLine: string;
  /** Rank reached at the end of this shift (rank-up card), if any. */
  rankUp: number | null;
  timedOut?: boolean;
}

export interface JobProgress {
  /** Day the job was taken up (first shift). */
  since: number;
  rank: number;
  tasks: number;
  good: number;
  perfect: number;
  shifts: number;
  /** Authored task log. */
  authored: Record<string, { attempts: number; perfect: boolean }>;
  /** Day each rank was reached. */
  rankDays: Record<number, number>;
  /**
   * Placed by the start level (a high start): the job began at this rank. Authored tasks of the ranks below are
   * not served as new material (their templates still come as review), and `good` is the credit for those ranks
   * (the ladder's `need.good` of the placed rank), so the next rank is as far as for a player who climbed there.
   */
  placed?: { rank: number; day: number; good: number };
}

/**
 * Today at work (v6). A day has three parts — 0 始業前 (before opening: at today's workplace, preparing; the town
 * can be visited to change workplace), 1 業務中 (working hours at today's workplace), 2 業務後 (after closing: a
 * second shift at a workplace open in the evening, the evening market, going home); 3 = the day is over.
 */
export interface JobDayState {
  day: number;
  /** 0 始業前 / 1 業務中 / 2 業務後; 3 = the day's work is over. */
  part: number;
  view: 'hub' | 'teahouse' | 'job';
  /** Today's workplace (job id): where the day starts and where the working hours are spent. */
  work: string;
  /** The job worked as the second shift after closing (業務後), if any. */
  evening?: string;
  /** The tea house today: not opened / open (or opened) / finished. */
  tea: 'none' | 'active' | 'done';
  log: { part: number; job: string; tasks: number; good: number; coins: number }[];
  shift: ShiftState | null;
  /** Japanese chrome notes (the board opened, a job is newly offered). */
  notes: string[];
}

export interface JobsState {
  /** Day the job board opened (absent = not yet). */
  boardOpen?: number;
  jobs: Record<string, JobProgress>;
  /** Shared store of goods made by one job for another. */
  goods: Record<string, number>;
  /** Word id → jobs where it was met in a task (the tea house's own words are tagged statically). */
  wordJobs: Record<string, string[]>;
  day: JobDayState | null;
  /** Optional time pressure in jobs that have it (player's choice). */
  timed: boolean;
  /** Jobs whose offer the player has seen on the board. */
  seen: string[];
  /** Japanese notes for the next morning (a rank reached at night). */
  pending?: string[];
  /** The workplace the player chose for the next days (picked after closing, or at a workplace before opening). */
  next?: string;
  /** Set by the v3 → v4 migration: work out the tea house's rank once at load. */
  migrated?: boolean;
}
