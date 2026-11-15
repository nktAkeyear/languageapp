/**
 * Content schema + runtime types for the town activities (market purchasing, deliveries).
 *
 * Language-neutral data lives in `TownShared` (src/content/shared/town.ts); text per language in
 * `TownContent` (src/content/{en,zh}/town.ts and the market.ts / delivery.ts / lexicon.town.ts it
 * assembles). Both are optional: without them the game is the Phase 1 shop only.
 * See README.md "Town activities".
 */
import type { Face, IngredientId, LexEntry, Outcome, VerificationPage } from './types';

export type ActivityKind = 'shop' | 'market' | 'delivery';
export type TownActivity = Exclude<ActivityKind, 'shop'>;

/**
 * When a town activity appears. No hard gate: it opens when day >= minDay and
 * reputation >= minReputation, or anyway `graceDays` after minDay.
 * Once open it is scheduled on a day with probability `chance`, and at least every `maxGap` days.
 */
export interface TownUnlock {
  minDay: number;
  minReputation: number;
  graceDays: number;
  chance: number;
  maxGap: number;
  /** Japanese chrome note shown the day it opens. */
  noteJa: string;
}

export type ColourId = 'red' | 'yellow' | 'blue' | 'green';
export const COLOURS: ColourId[] = ['red', 'yellow', 'blue', 'green'];

// ---------------------------------------------------------------------------
// Market (shared)
// ---------------------------------------------------------------------------

export type VariantId = 'fresh' | 'old' | 'big' | 'small';
/**
 * Market features unlocked by level (number of completed market runs):
 * - change: vendors give change (up to `changeLimit`); before that, overpaying is simply lost.
 * - soldOut: a needed good is sold out at its usual stall; the vendor names another stall by colour.
 * - variants: goods come as fresh/old or big/small offers; notes may ask for one.
 * - cheaper: a needed good is cheaper at a second stall (the shopping note says so).
 * - audioOnly: some vendor quotes are spoken only (text after paying).
 * - bargain: the player may haggle once per purchase.
 */
export type MarketFeature = 'change' | 'soldOut' | 'variants' | 'cheaper' | 'audioOnly' | 'bargain';

export interface MarketLevel {
  level: number;
  /** Completed market runs needed. */
  minRuns: number;
  /** Max lines on the shopping note. */
  maxItems: number;
  features: MarketFeature[];
  noteJa?: string;
}

export interface VariantDef {
  id: VariantId;
  /** Portions per unit, relative to the good's base. */
  portionsMult: number;
  priceMult: number;
}

export interface MarketGood {
  ingredient: IngredientId;
  /** Workbench portions one unit gives (slices per lemon, leaves per bunch, spoons per jar...). */
  portionsPerUnit: number;
  /** Base price per unit (coins). */
  price: number;
  /** [base, other]: e.g. ['fresh','old'] or ['small','big']. Only with the 'variants' feature. */
  variants?: [VariantId, VariantId];
  /** Stalls selling it; the first is its usual stall. */
  stalls: string[];
}

export interface StallDef {
  id: string;
  colour: ColourId;
  /** Vendor avatar (emoji). */
  vendor: string;
  icon: string;
}

export interface MarketShared {
  unlock: TownUnlock;
  levels: MarketLevel[];
  goods: MarketGood[];
  stalls: StallDef[];
  variants: VariantDef[];
  /** Coin denominations in the purse UI. */
  coins: number[];
  startMoney: number;
  /** Coins earned per served shop cup, by outcome. */
  income: Record<Outcome, number>;
  /** Vendors cannot give more change than this. */
  changeLimit: number;
}

// ---------------------------------------------------------------------------
// Delivery (shared)
// ---------------------------------------------------------------------------

export type LandmarkId = 'harbour' | 'inn' | 'school' | 'bridge' | 'bank' | 'hospital' | 'market' | 'temple';
export type PersonId = 'mother' | 'father' | 'child' | 'grandmother';
/** How the slip points at the destination. 'at' = the landmark itself. */
export type Relation = 'at' | 'next_to' | 'behind' | 'across' | 'left' | 'right';
export type Period = 'morning' | 'afternoon' | 'evening';
export type AbsentAction = 'door' | 'neighbour' | 'back';

/** One cell of the town map. Rows 0-1 are north of the main street, rows 2-3 south. */
export interface MapCell {
  id: string;
  col: number;
  row: number;
  landmark?: LandmarkId;
  /** Houses only: door colour (shown on the map). */
  door?: ColourId;
}

export type DeliveryFeature = 'relations' | 'clock' | 'person' | 'knock' | 'leftRight' | 'beforeAfter' | 'avoid' | 'absent';

export interface DeliveryLevel {
  level: number;
  minRuns: number;
  features: DeliveryFeature[];
  noteJa?: string;
}

export interface TimeSlot {
  /** 24h clock. */
  hour: number;
  period: Period;
}

export type SlipTime = { kind: 'period'; period: Period } | { kind: 'at' | 'before' | 'after'; hour: number };

/** A language-neutral delivery slip; text is generated from per-language patterns. */
export interface SlipSpec {
  dest: { rel: Relation; landmark: LandmarkId };
  time?: SlipTime;
  give?: PersonId;
  avoid?: PersonId;
  knocks?: number;
  /** What to do if nobody is home. */
  absent?: 'door' | 'neighbour';
  /** Scenario: is somebody home? Default true. Only false when `absent` is set. */
  home?: boolean;
}

export interface AuthoredSlip extends SlipSpec {
  id: string;
  level: number;
  seq: number;
}

export interface DeliveryShared {
  unlock: TownUnlock;
  levels: DeliveryLevel[];
  cols: number;
  rows: number;
  map: MapCell[];
  slots: TimeSlot[];
  persons: { id: PersonId; icon: string }[];
  /** Curriculum slips, served in (level, seq) order until delivered perfectly. */
  curriculum: AuthoredSlip[];
  /** Coins the recipient tips for a perfect delivery. */
  tip: number;
}

export interface TownShared {
  market: MarketShared;
  delivery: DeliveryShared;
}

// ---------------------------------------------------------------------------
// Per-language town content
// ---------------------------------------------------------------------------

/** Quantity / amount phrase. `{n}` = number words. `one` is used for n = 1 if present. */
export interface PhraseForms {
  one?: string;
  other: string;
}

export interface MarketGoodText {
  ingredient: IngredientId;
  /** Name on the stall card (plural where natural: "lemons"). */
  name: string;
  /** Quantity phrases per variant; `base` = no variant word (used before the 'variants' feature). */
  qty: Partial<Record<VariantId | 'base', PhraseForms>>;
  /** Unit price phrase with `{price}`: "{price} each", "{price}一把". */
  per: string;
}

export type VendorLineKind =
  | 'greet'
  | 'cheapHere'
  | 'askQty'
  | 'quote'
  | 'thanks'
  | 'overpaid'
  | 'change'
  | 'notEnough'
  | 'noChange'
  | 'soldOut'
  | 'soldOutTip'
  | 'bargainYes'
  | 'bargainNo';

/**
 * Vendor line. Placeholders: {g}/{G} good name, {qty}/{Qty} quantity phrase, {total}/{Total},
 * {change}/{Change} money phrases, {stall}/{Stall} stall reference. Capitalised = capitalise (en).
 */
export interface VendorLine {
  id: string;
  kind: VendorLineKind;
  /** Market level from which the line is used. */
  level: number;
  text: string;
  face: Face;
}

export interface MarketText {
  /** Money phrase: '{n} coins' / '{n}{块|kuai_money}'. */
  money: PhraseForms;
  /** Money on price tags with digits: { one: '{d} coin', other: '{d} coins' }. */
  tagMoney: { one?: string; other: string };
  /** Stall reference: 'the {c} stall' / '{c}那家'. */
  stallRef: string;
  /** Variant word on stall cards and in phrases (text, tokenized). */
  variantWords: Record<VariantId, string>;
  goods: MarketGoodText[];
  /** Shopping-note headings (one is chosen). */
  noteTitles: string[];
  /** Note line wrapper around the quantity phrase: '{Qty}.' */
  noteLine: string;
  /** Note hint for the 'cheaper' feature: '{G} is cheaper at {stall}.' */
  cheaperNotes: string[];
  lines: VendorLine[];
  /** Shop customer line when a needed good ran out ({ing}/{Ing} = ingredient word). */
  stockReactions: { id: string; text: string; face: Face }[];
}

export type DeliveryReactionKind =
  | 'perfect'
  | 'perfect_absent'
  | 'wrong_place'
  | 'too_early'
  | 'too_late'
  | 'wrong_time'
  | 'wrong_person'
  | 'avoided_person'
  | 'wrong_knock'
  | 'wrong_absent'
  | 'any_fail';

export interface DeliveryReaction {
  id: string;
  kind: DeliveryReactionKind;
  level: number;
  text: string;
  face: Face;
}

export interface DeliveryText {
  /** Landmark -> lexicon id (map signs + slip text). */
  placeWords: Record<LandmarkId, string>;
  personWords: Record<PersonId, string>;
  /** Destination patterns per relation; {p} = landmark word. */
  dest: Record<Relation, string[]>;
  /**
   * Time patterns. {n} = clock number (12h), {pp} = period word of that hour (zh "下午"),
   * period patterns stand alone.
   */
  time: { period: Record<Period, string[]>; at: string[]; before: string[]; after: string[] };
  /** Period -> lexicon id ({pp}). */
  periodWords: Record<Period, string>;
  /** {p} = person word; giveNot also {q} = person to avoid. */
  give: string[];
  giveNot: string[];
  /** Knock count -> patterns. */
  knock: Record<number, string[]>;
  absent: Record<'door' | 'neighbour', string[]>;
  /** Recipients' names (target language, not tracked as vocabulary). */
  recipients: { id: string; name: string; avatar: string; /** story layer only: never picked at random */ storyOnly?: boolean }[];
  reactions: DeliveryReaction[];
}

export interface TownContent {
  lexicon: LexEntry[];
  verificationPages: VerificationPage[];
  /** n -> number words (tokenizable text). Numbers missing here are never generated. */
  numberText: Record<number, string>;
  colourWords: Record<ColourId, string>;
  market: MarketText;
  delivery: DeliveryText;
}

// ---------------------------------------------------------------------------
// Runtime (serializable, stored in the save)
// ---------------------------------------------------------------------------

export interface TalkLine {
  who: 'vendor' | 'you' | 'narration';
  /** vendor: target-language content text; you/narration: Japanese chrome. */
  text: string;
  face?: Face;
  /** Hidden until the purchase is settled (audio-only vendor line). */
  audioOnly?: boolean;
}

export interface Offer {
  id: string;
  good: IngredientId;
  variant?: VariantId;
  price: number;
}

export interface StallDay {
  id: string;
  offers: Offer[];
  /** Goods this stall would normally have but not today. */
  soldOut: IngredientId[];
  /** Goods this stall sells cheaply today. */
  cheap: IngredientId[];
}

export interface NoteLine {
  good: IngredientId;
  variant?: VariantId;
  units: number;
  /** Portions the shop needs today (incl. reserve). */
  portions: number;
  text: string;
}

export interface BasketItem {
  offer: string;
  good: IngredientId;
  variant?: VariantId;
  units: number;
  total: number;
  paid: number;
}

export interface MarketDay {
  level: number;
  features: MarketFeature[];
  title: string;
  lines: NoteLine[];
  tips: string[];
  stalls: StallDay[];
  /** Open stall. */
  stall: string | null;
  talk: TalkLine[];
  /** Selected offer at the open stall (vendor asked "how many?"). */
  selected: string | null;
  /** Quoted purchase waiting for payment. */
  pending: { offer: string; units: number; total: number; bargained: boolean } | null;
  basket: BasketItem[];
  /** Total coins handed over (including overpayment). */
  spent: number;
  done: boolean;
  /** Stalls visited (encounters are counted once per stall per day). */
  visited: string[];
  /**
   * What this trip to the market is for (absent = 'visit'): 'visit' = before opening, the goods go on today's
   * shelf; 'order' = during working hours, ordered for delivery to the shop (arrives with the next customer,
   * plus a delivery fee); 'evening' = after closing, bought for tomorrow (kept in the back room overnight).
   */
  mode?: MarketMode;
  /** Trips made today (the first one is the day's market run). */
  trips?: number;
  /** Delivery fee charged for this trip (order mode; refunded when nothing was ordered). */
  fee?: number;
  /** Where the trip started ('hub' = from the town after closing; default the shop). */
  from?: 'shop' | 'hub';
}

export type MarketMode = 'visit' | 'order' | 'evening';

/** The three parts of a working day: 0 始業前 (before opening), 1 業務中 (working hours), 2 業務後 (after closing). */
export type DayPart = 0 | 1 | 2;

/** Goods ordered by delivery during working hours: they reach the shop when the next customer comes in. */
export interface SupplyOrder {
  /** Portions per good. */
  stock: Partial<Record<IngredientId, number>>;
  /** Index of the customer at the counter when it was ordered (arrives once the queue has moved past it). */
  at: number;
  fee: number;
  /** The goods as ordered (for the arrival note). */
  goods: { good: IngredientId; units: number; variant?: VariantId }[];
}

export interface SlipLine {
  part: 'dest' | 'time' | 'give' | 'knock' | 'absent';
  text: string;
}

export interface DeliveryRule {
  place: string;
  /** Allowed hours; null = any. */
  slots: number[] | null;
  give?: PersonId;
  avoid?: PersonId;
  knocks?: number;
  absent?: 'door' | 'neighbour';
}

export interface SlipInstance {
  key: string;
  source: { type: 'authored' | 'template'; id: string };
  recipient: string;
  lines: SlipLine[];
  spec: SlipSpec;
  rule: DeliveryRule;
  home: boolean;
}

export interface DeliveryChoice {
  place: string | null;
  hour: number | null;
  knocks: number;
  person: PersonId | null;
  absent: AbsentAction | null;
}

export type DeliveryIssueKind = Exclude<DeliveryReactionKind, 'perfect' | 'perfect_absent' | 'any_fail'>;

export interface DeliveryResult {
  outcome: Outcome;
  issues: DeliveryIssueKind[];
  reaction: string;
  face: Face;
  repDelta: number;
  tip: number;
}

export interface DeliveryDay {
  level: number;
  features: DeliveryFeature[];
  slip: SlipInstance;
  /** plan: choose place + time; knock: at the door; door: who answers / nobody; result: reaction. */
  phase: 'plan' | 'knock' | 'door' | 'result';
  choice: DeliveryChoice;
  /** People who come to the door (if somebody is home). */
  household: PersonId[];
  result: DeliveryResult | null;
}

export interface TownDayState {
  day: number;
  segments: ActivityKind[];
  seg: number;
  /** Japanese chrome notes (town unlocks / new market or delivery levels). */
  notes: string[];
  /** Tracked shop stock in portions; ingredients absent here are unlimited today. */
  stock: Partial<Record<IngredientId, number>>;
  /** No market today (the tea house opened late): the shop serves from the back room, which costs `backRoomCost` a cup. */
  fromBack?: boolean;
  moneyStart: number;
  market?: MarketDay;
  delivery?: DeliveryDay;
  /**
   * The tea house's part of the day (v6): 0 始業前 (preparing; the market may be visited), 1 業務中 (open:
   * serving; supplies only by delivery), 2 業務後 (closed: house deliveries, the evening market, the town).
   * Absent in older saves (migrated at load).
   */
  part?: DayPart;
  /** Where the player is in the tea house's day: the shop itself, the market street or out delivering. */
  at?: ActivityKind;
  /** Supplies ordered by delivery during working hours, not arrived yet. */
  incoming?: SupplyOrder[];
  /** Supplies that arrived today (for the shop's note: "the delivery came"). */
  arrived?: SupplyOrder[];
  /** Delivery fees paid today. */
  fees?: number;
  /** The tea house opened in the evening (a second shift after another job): shop only. */
  evening?: boolean;
}

export interface TownProgress {
  money: number;
  /** Day an activity opened (absent = not yet). */
  unlocked: Partial<Record<TownActivity, number>>;
  lastDay: Partial<Record<TownActivity, number>>;
  marketRuns: number;
  deliveryRuns: number;
  /** Market features already introduced (forced once when first available). */
  marketSeen: MarketFeature[];
  /** Curriculum slip log. */
  /** `seeded`: skipped by a start level (its delivery level was already reached), never delivered. */
  slips: Record<string, { attempts: number; perfect: boolean; seeded?: boolean }>;
  /** Goods bought after closing for the next day (portions; kept in the back room overnight). */
  pantry?: Partial<Record<IngredientId, number>>;
}
