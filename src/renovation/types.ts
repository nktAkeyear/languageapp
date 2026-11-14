/**
 * Shop renovation (店の改装): a catalogue of improvements the player orders with the coins the
 * shop earns. Orders arrive the next morning and change the drawn shop for good; most also change
 * the rules a little (one more customer a day, stock kept overnight, better tips …).
 *
 * Language-neutral structure: `RenoShared` (src/content/shared/renovation.ts).
 * Words per language: `RenoText` (src/content/{en,zh}/renovation.ts), same ids.
 * Runtime state: `RenoState` in each language's progress (optional field `reno`, see save.ts).
 */
import type { Feature, IngredientId, LexEntry, VerificationPage } from '../core/types';
import type { TownActivity } from '../core/townTypes';

export type UpgradeId =
  | 'ribbon'
  | 'signboard'
  | 'plant'
  | 'kettle'
  | 'shelf'
  | 'curtains'
  | 'bench'
  | 'scales'
  | 'chime'
  | 'lantern'
  | 'cart'
  | 'magnifier'
  | 'icebox'
  | 'cellar'
  | 'paint'
  | 'catbed'
  | 'picture'
  | 'bicycle';

export type UpgradeCategory = 'room' | 'tools' | 'outside' | 'notebook' | 'decor';

/** When an entry appears in the catalogue (all given conditions must hold). */
export interface UpgradeGate {
  day?: number;
  stage?: number;
  rep?: number;
  /** Other upgrades that must be installed first. */
  requires?: UpgradeId[];
  /** A town activity that must be open. */
  activity?: TownActivity;
  /** A workbench feature that must be unlocked (e.g. temperature for the kettle). */
  feature?: Feature;
}

/** Which market goods are kept overnight, and how many portions of each at most. */
export interface CarryRule {
  goods: 'all' | 'dry' | 'fresh';
  cap: number;
}

/**
 * Rule effects of an installed upgrade (all optional, they add up). The engine
 * (src/renovation/engine.ts) reads only these fields; décor has none but `remarks`.
 */
export interface UpgradeEffects {
  /** More customers every day. */
  customers?: number;
  /** Leftover market stock kept for the next day. */
  carry?: CarryRule;
  /** Extra coins for a perfect cup that was ordered hot / cold / with an exact quantity. */
  coinHot?: number;
  coinCold?: number;
  coinExact?: number;
  /** Extra reputation at the end of a day with at least one perfect cup. */
  repDay?: number;
  /** Extra reputation for a perfect cup to a returning customer. */
  repReturning?: number;
  /** Once deliveries have opened, there is a delivery every day. */
  deliveryDaily?: boolean;
  /** Extra coins on top of a delivery tip. */
  tip?: number;
  /** Notebook: a review list of due words / a closer look at a word's sentences. */
  notebook?: 'review' | 'closer';
  /** Customers sometimes remark on it (target language). */
  remarks?: boolean;
}

export interface UpgradeDef {
  id: UpgradeId;
  category: UpgradeCategory;
  /** Price in coins. */
  price: number;
  when: UpgradeGate;
  effects: UpgradeEffects;
}

export interface RenoShared {
  upgrades: UpgradeDef[];
  /** Market goods that keep (dry goods: the cellar); every other market good is fresh. */
  dryGoods: IngredientId[];
  /** Chance that a perfect cup brings a remark about the décor (higher for something new). */
  remarkChance: { fresh: number; usual: number };
  /** Coins the player should keep for the market (the catalogue warns below this). */
  keepForMarket: number;
}

/** One catalogue entry in the target language. */
export interface UpgradeText {
  /** Name on the order sheet ("a long bench" / "长椅"). */
  name: string;
  /** What it does, as the carpenter's sales line (one or two short sentences). */
  lines: string[];
  /** Customer remarks once it is installed (only for upgrades with `remarks`). */
  remarks?: Remark[];
}

/** When a remark would contradict the moment: after a cup that was ordered cold / hot. */
export type RemarkMoment = 'cold' | 'hot';

/** A remark, or one that is not said at some moments ("It is very warm here" after an iced tea). */
export type Remark = string | { text: string; notWhen: RemarkMoment[] };

export function remarkText(r: Remark): string {
  return typeof r === 'string' ? r : r.text;
}

export interface RenoText {
  /** Order-sheet heading and the line under it. */
  title: string;
  subtitle: string;
  /** Price on the sheet with digits: `{d}` (e.g. "{d} coins" / "{d}块"). */
  price: { one?: string; other: string };
  /**
   * Prices in this language are the shared prices × this (rounded to 5). English has the town's jobs (wages) on
   * top of the tea house's takings, so its catalogue costs more to keep the same arc. Default 1.
   */
  priceScale?: number;
  upgrades: Record<UpgradeId, UpgradeText>;
  /** New words (with their 検証ページ). */
  lexicon: LexEntry[];
  pages: VerificationPage[];
  /** Extra surface forms for existing lexicon ids. */
  forms: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Runtime state (per language, in the save as the optional `reno` field)
// ---------------------------------------------------------------------------

export interface RenoState {
  /** Installed upgrades: id -> day it arrived. */
  owned: Partial<Record<UpgradeId, number>>;
  /** Ordered, arriving on the morning after `day`. */
  orders: { id: UpgradeId; day: number }[];
  /** Market goods kept overnight (portions). */
  carry: Partial<Record<IngredientId, number>>;
  /** Catalogue entries the player has already seen (new ones are marked). */
  seen: UpgradeId[];
  /** Last day a customer remarked on an upgrade. */
  remarks: Partial<Record<UpgradeId, number>>;
  /** Day + count of today's remarks. */
  remarkDay?: { day: number; n: number };
  /** Last day the catalogue's list ('list') / an entry's lines were read (encounters once a day). */
  read?: Record<string, number>;
  /** Coins spent on the catalogue on `day` (for the ledger). */
  spent?: { day: number; coins: number };
}

export function newRenoState(): RenoState {
  return { owned: {}, orders: [], carry: {}, seen: [], remarks: {} };
}
