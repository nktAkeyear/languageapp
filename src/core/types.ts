/**
 * Content schema + shared engine types.
 *
 * Content (src/content/**) is pure data typed against these interfaces.
 * Engine code (src/core, src/activities) never hardcodes language-specific text.
 * See README.md "Content schema" for authoring notes.
 */

import type { TownContent, TownShared } from './townTypes';

export type Lang = 'en' | 'zh';
export const LANGS: Lang[] = ['en', 'zh'];

export type Cefr = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';
export const CEFR_LEVELS: Cefr[] = ['A1', 'A2', 'B1', 'B2', 'C1'];

/** 英検 grade, easiest first. */
export type EikenGrade = '5' | '4' | '3' | '準2' | '2' | '準1' | '1';
export const EIKEN_GRADES: EikenGrade[] = ['5', '4', '3', '準2', '2', '準1', '1'];

export type HskLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type Pos =
  | 'noun'
  | 'verb'
  | 'adj'
  | 'adv'
  | 'num'
  | 'measure'
  | 'pron'
  | 'prep'
  | 'conj'
  | 'det'
  | 'particle'
  | 'interj'
  | 'phrase';

/** One lexicon entry. `id` is unique within its language. */
export interface LexEntry {
  id: string;
  /** Headword as displayed (en: lowercase unless proper/`I`). */
  text: string;
  /** Extra surface forms the tokenizer should map to this entry (en inflections: "slices", "leaves"). */
  forms?: string[];
  /** zh only: tone-marked pinyin of the headword, dictionary (citation) tones, syllables joined. */
  pinyin?: string;
  /** Official Japanese meaning. Shown only after the word is 確定 via a 検証ページ. */
  gloss: string;
  /** Picture used on 検証 cards next to the gloss. */
  emoji?: string;
  pos: Pos;
  cefr: Cefr;
  /** zh only. null = not in the HSK (2.0) word list / unverified. */
  hsk?: HskLevel | null;
  /** en only. Approximate 英検 grade at which the word is expected. null = unknown. */
  eiken?: EikenGrade | null;
  /** Verification page (検証ページ) id this word belongs to. Every word must have one. */
  group: string;
}

// ---------------------------------------------------------------------------
// Language-neutral shared content
// ---------------------------------------------------------------------------

export type IngredientId =
  | 'lemon'
  | 'ginger'
  | 'mint'
  | 'honey'
  | 'water'
  | 'ice'
  | 'sugar'
  | 'salt'
  | 'green_tea'
  | 'black_tea'
  | 'milk'
  | 'red_dates'
  | 'chrysanthemum'
  | 'cinnamon'
  | 'apple'
  | 'banana'
  | 'watermelon'
  | 'pear'
  | 'rose'
  | 'coffee'
  | 'yogurt';

export type Tag = 'sweet' | 'sour' | 'bitter' | 'salty' | 'tea' | 'dairy' | 'spice' | 'cooling' | 'warming' | 'floral';
export type Temp = 'hot' | 'cold';
export type Method = 'steep' | 'boil' | 'stir';
export type Feature = 'temperature' | 'method' | 'audioOnly';

export interface IngredientDef {
  id: IngredientId;
  /** Emoji illustration, or inline SVG markup (trusted, authored by us). */
  icon: { emoji: string } | { svg: string };
  tags: Tag[];
  /** Max portions the player can put in one cup. */
  maxCount: number;
  /** May appear in "qty" template slots (needs a qty phrase in every language). */
  qtyOrderable: boolean;
  /** Water: never counts as an unwanted extra unless explicitly forbidden. */
  neutral?: boolean;
  /** Generated orders never ask for this in a hot drink (e.g. ice). */
  coldOnly?: boolean;
}

/**
 * Declarative solution rule, evaluated against the player's brew.
 * Ingredients not covered by require / requireTag / allow / allowTag are "extras" (customer complains).
 */
export interface OrderRule {
  require?: { ing: IngredientId; min?: number; max?: number }[];
  /** Total portions of ingredients carrying `tag`. Ingredients with that tag are implicitly allowed. */
  requireTag?: { tag: Tag; min?: number; max?: number }[];
  forbid?: IngredientId[];
  forbidTag?: Tag[];
  /** Extra ingredients that are fine (no complaint). 'any' = anything not forbidden. */
  allow?: IngredientId[] | 'any';
  allowTag?: Tag[];
  temp?: Temp;
  method?: Method;
}

export type SymptomId =
  | 'cold'
  | 'sore_throat'
  | 'tired'
  | 'insomnia'
  | 'cough'
  | 'headache'
  | 'stomachache'
  | 'thirsty';

export interface RecipeDef {
  id: string;
  stage: number;
  rule: OrderRule;
  symptoms?: SymptomId[];
}

export interface StageDef {
  stage: number;
  /** Earliest in-game day. */
  minDay: number;
  /** Reputation needed. If the player is stuck, the stage opens anyway `graceDays` after minDay. */
  minReputation: number;
  /** Ingredients that appear on the shelf at this stage. */
  ingredients: IngredientId[];
  features?: Feature[];
  customersPerDay: number;
  /** Soft cap on brand-new words introduced per day. */
  newWordsPerDay: number;
  /** Japanese chrome text shown in the day summary when the stage opens. */
  noteJa?: string;
}

// ---------------------------------------------------------------------------
// Per-language content
// ---------------------------------------------------------------------------

export interface IngredientText {
  ingredient: IngredientId;
  /** Lexicon id used as the shelf label and for {ing} placeholders. */
  word: string;
  /**
   * Quantity phrase patterns. `{n}` is replaced with the number word (numbers[n]).
   * `one` is used for n=1 if present (e.g. "a slice of ginger"), otherwise `other`.
   */
  qty?: { one?: string; other: string };
}

export interface SymptomText {
  symptom: SymptomId;
  /** Whole sentences, any of which can fill a {symptom} slot. */
  phrases: string[];
}

export interface PageLine {
  text: string;
  icon?: string;
  style?: 'plain' | 'item' | 'step' | 'goodFor' | 'warning';
}

export interface BookPage {
  id: string;
  stage: number;
  kind: 'ingredient' | 'recipe' | 'note';
  ingredient?: IngredientId;
  recipe?: string;
  title: string;
  /** Big illustration (emoji string). */
  illustration?: string;
  lines: PageLine[];
}

/** Hand-written order. Text may use `{surface|lexId}` to force a token mapping. */
export interface AuthoredOrder {
  id: string;
  stage: number;
  /** Order within the stage: lower first. Authored orders are the curriculum spine. */
  seq?: number;
  customer?: string;
  text: string;
  audioOnly?: boolean;
  /** Exactly one of rule / recipe. */
  rule?: OrderRule;
  recipe?: string;
}

export type SlotSpec =
  /** Quantity phrase "two slices of ginger"; rule requires exactly n. */
  | { kind: 'qty'; ingredients?: IngredientId[]; tags?: Tag[]; min?: number; max?: number }
  /** Bare ingredient word; rule requires 1..max. */
  | { kind: 'ing'; ingredients?: IngredientId[]; tags?: Tag[]; max?: number }
  /** Ingredient word that must NOT be in the cup. */
  | { kind: 'forbid'; ingredients?: IngredientId[]; tags?: Tag[] }
  /** Temperature word. */
  | { kind: 'temp'; temps?: Temp[] }
  /** Taste word; rule requires >=1 portion with that tag. */
  | { kind: 'taste'; tags?: Tag[] }
  /** "No sweet" style: taste word; rule forbids that tag. */
  | { kind: 'notTaste'; tags?: Tag[] }
  /** A symptom sentence; rule = rule of a recipe treating that symptom. */
  | { kind: 'symptom'; symptoms?: SymptomId[] }
  /** Recipe name; rule = recipe rule. */
  | { kind: 'recipe'; recipes?: string[] };

export interface OrderTemplate {
  id: string;
  stage: number;
  /** Text with {slotName} placeholders; {Slot} capitalises the first letter (en). */
  text: string;
  slots: Record<string, SlotSpec>;
  /** Base rule merged with slot-derived rules. */
  rule?: OrderRule;
  /** Probability (0..1) this instance is audio-only (needs 'audioOnly' feature). */
  audioOnly?: number;
  weight?: number;
  customer?: string;
}

export type IssueKind =
  | 'empty'
  | 'forbidden'
  | 'forbidden_tag'
  | 'wrong'
  | 'missing'
  | 'tag_missing'
  | 'extra'
  | 'wrong_temp'
  | 'too_much'
  | 'too_little'
  | 'tag_too_much'
  | 'wrong_method';

export type ReactionKind = IssueKind | 'perfect' | 'any_fail';
export type Face = 'delighted' | 'happy' | 'neutral' | 'puzzled' | 'sad' | 'angry';

/**
 * Customer reaction line. Placeholders: {ing}/{Ing} (ingredient word of the issue),
 * {tag} (taste word), {temp}/{Temp} (temperature the customer wanted), {method}/{Method}.
 * A reaction is only used when its placeholders can be filled.
 */
export interface Reaction {
  id: string;
  kind: ReactionKind;
  stage: number;
  text: string;
  face: Face;
  /** Restrictions; a matching specific reaction is preferred over generic ones. */
  when?: { returning?: boolean; symptom?: boolean; customer?: string; ings?: IngredientId[]; tags?: Tag[] };
}

export interface Customer {
  id: string;
  /** In-world name (target language). Not tracked as vocabulary. */
  name: string;
  avatar: string;
  stage: number;
}

export interface VerificationPage {
  id: string;
  /** Japanese chrome label. Should hint at the theme, not the answers. */
  labelJa: string;
  /** Each word must have been encountered this many times (default 3). */
  minEncounters?: number;
}

/** Per-level vocabulary target sizes (cumulative). */
export interface LevelTargets {
  cefr: Record<Cefr, number>;
  /** en: 英検 grade targets; zh: HSK level targets (keys "1".."6"). */
  exam: Record<string, number>;
}

export interface LanguageContent {
  lang: Lang;
  lexicon: LexEntry[];
  /** number -> lexicon id */
  numbers: Record<number, string>;
  temperatureWords: Record<Temp, string>;
  methodWords: Record<Method, string>;
  /** Taste tags that can appear as words. */
  tagWords: Partial<Record<Tag, string>>;
  ingredients: IngredientText[];
  recipeNames: Record<string, string>;
  symptoms: SymptomText[];
  pages: BookPage[];
  orders: AuthoredOrder[];
  templates: OrderTemplate[];
  reactions: Reaction[];
  customers: Customer[];
  verificationPages: VerificationPage[];
  levelTargets: LevelTargets;
  /** Town activities (market, deliveries). Merged in by src/content/index.ts; absent = shop only. */
  town?: TownContent;
}

export interface SharedContent {
  ingredients: IngredientDef[];
  recipes: RecipeDef[];
  stages: StageDef[];
  graceDays: number;
  /** Town activities (language-neutral part). Absent = shop only. */
  town?: TownShared;
}

// ---------------------------------------------------------------------------
// Runtime types
// ---------------------------------------------------------------------------

export interface Token {
  text: string;
  /** Lexicon id, absent for punctuation/whitespace. */
  id?: string;
}

/** A concrete order served on a day (authored or template instance). Serializable. */
export interface OrderInstance {
  /** Unique key (authored id, or template id + slot signature). */
  key: string;
  source: { type: 'authored' | 'template'; id: string };
  text: string;
  rule: OrderRule;
  audioOnly: boolean;
  customer: string;
  recipe?: string;
  symptom?: boolean;
  returning?: boolean;
}

export interface Brew {
  counts: Partial<Record<IngredientId, number>>;
  temp: Temp | null;
  method: Method | null;
}

export interface Issue {
  kind: IssueKind;
  ing?: IngredientId;
  tag?: Tag;
  temp?: Temp;
  method?: Method;
  /** For quantity issues: how far off. */
  diff?: number;
}

export type Outcome = 'perfect' | 'minor' | 'fail' | 'bad';

export interface Evaluation {
  issues: Issue[];
  primary: Issue | null;
  outcome: Outcome;
}
