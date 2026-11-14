/**
 * Story engine (UI-agnostic). Hooks called by the day orchestration (src/activities/day.ts):
 *
 *   storyPlanShop   after the shop planned its customers: chapter card, morning moments, and a
 *                   regular's visit injected into today's queue (before the market plans its note).
 *   storyPlanTown   after the town segments are planned: a regular's delivery replaces today's slip.
 *   storyAfterServe after a cup is served: resolves a visit beat (reaction line, effects, scene)
 *                   or adds a regular's small talk to an ordinary order.
 *   storySync       resolves a finished story delivery (also called by the UI after handing over).
 *   storyEndDay     before the calendar advances: evening moments and the night's ledger.
 *
 * UI actions: storyDismiss (close the first card), storyChoose (answer a choice), storyReadDoc.
 * All functions mutate the LangProgress in place and are idempotent per day where it matters.
 */
import type { GameData } from '../core/gamedata';
import { shuffle, type Rng } from '../core/rng';
import type { LangProgress } from '../core/save';
import { recordEncounter } from '../core/srs';
import type { OrderInstance, Outcome } from '../core/types';
import { ruleFor } from '../activities/delivery/rules';
import { writeSlip } from '../activities/delivery/engine';
import { townOf } from '../activities/town/text';
import type { ServeOutcome } from '../activities/shop/engine';
import { readability, storyOf, storyWordIds, type Story } from './text';
import { beatBehind, catchUpChapter, storyFrontier, visitsToday } from './catchup';
import { storyCatchingUp } from '../core/difficulty';
import {
  newStoryState,
  type BeatDef,
  type BeatOutcome,
  type DocLine,
  type Ledger,
  type SceneLine,
  type StoryCond,
  type StoryEffect,
  type StoryState,
} from './types';

export const STORY_KEY_PREFIX = 'story:';
export const DEFAULT_GAP = 2;

/** The story state of a progress (created on first use: saves are normalised, tests may build bare objects). */
export function storyState(p: LangProgress): StoryState {
  if (!p.story) p.story = newStoryState();
  return p.story;
}

// ---------------------------------------------------------------------------
// Conditions and effects
// ---------------------------------------------------------------------------

export function condHolds(c: StoryCond | undefined, p: LangProgress): boolean {
  if (!c) return true;
  const st = storyState(p);
  if (c.stage !== undefined && p.stage < c.stage) return false;
  if (c.day !== undefined && p.day < c.day) return false;
  if (c.rep !== undefined && p.reputation < c.rep) return false;
  for (const b of c.after ?? []) if (st.beats[b]?.status !== 'done') return false;
  for (const [b, outs] of Object.entries(c.outcome ?? {})) {
    const r = st.beats[b];
    if (r?.status !== 'done' || !r.outcome || !outs.includes(r.outcome)) return false;
  }
  for (const [b, opts] of Object.entries(c.choice ?? {})) {
    const r = st.beats[b];
    if (!r?.choice || !opts.includes(r.choice)) return false;
  }
  for (const f of c.flags ?? []) if (!st.flags.includes(f)) return false;
  for (const f of c.notFlags ?? []) if (st.flags.includes(f)) return false;
  for (const d of c.docs ?? []) if (!st.docs[d]) return false;
  return true;
}

export function applyEffect(data: GameData, p: LangProgress, e: StoryEffect | undefined): void {
  if (!e) return;
  const st = storyState(p);
  if (e.rep) p.reputation = Math.max(0, p.reputation + e.rep);
  if (e.money) p.town.money = Math.max(0, p.town.money + e.money);
  for (const f of e.flags ?? []) if (!st.flags.includes(f)) st.flags.push(f);
  for (const d of e.docs ?? []) giveDoc(data, p, d);
}

/** Lines of a document that are visible now (conditional postscripts). */
export function docLines(data: GameData, p: LangProgress, docId: string): string[] {
  const t = storyOf(data)?.text.docs[docId];
  if (!t) return [];
  return t.lines
    .map((l): DocLine => (typeof l === 'string' ? { text: l } : l))
    .filter((l) => condHolds(l.when, p))
    .map((l) => l.text);
}

export function docReadability(data: GameData, p: LangProgress, docId: string): number {
  return readability(data, (id) => !!p.words[id]?.confirmed, docLines(data, p, docId));
}

/** Distinct words of a document (visible lines) whose meaning is 確定. */
export function docConfirmedWords(data: GameData, p: LangProgress, docId: string): string[] {
  const ids = new Set<string>();
  for (const text of docLines(data, p, docId)) for (const id of storyWordIds(data, text)) if (p.words[id]?.confirmed) ids.add(id);
  return [...ids];
}

/** Words of a document confirmed since it was last put away (empty when that is unknown). */
export function docFreshWords(data: GameData, p: LangProgress, docId: string): string[] {
  const rec = storyState(p).docs[docId];
  // Saves from before `known`: a paper found with nothing readable had no confirmed words then.
  const base = rec?.known ?? (rec && rec.firstPct === 0 ? [] : null);
  if (!base) return [];
  const known = new Set(base);
  return docConfirmedWords(data, p, docId).filter((id) => !known.has(id));
}

/** The player put the document away: remember which of its words were readable. */
export function storyDocPutAway(data: GameData, p: LangProgress, docId: string): void {
  const rec = storyState(p).docs[docId];
  if (rec) rec.known = docConfirmedWords(data, p, docId);
}

export function giveDoc(data: GameData, p: LangProgress, docId: string): void {
  const st = storyState(p);
  if (st.docs[docId]) return;
  st.docs[docId] = { day: p.day, firstPct: docReadability(data, p, docId), reads: 0, known: docConfirmedWords(data, p, docId) };
  st.today?.docs.push(docId);
  st.cards.push({ kind: 'doc', doc: docId });
}

/**
 * Reading a document counts its words as encountered, at most once a day (like a recipe page).
 * Before the document's `readable` stage only words already in the notebook count (the rest is
 * still a blur), so an early letter does not flood the notebook with far-off words.
 */
export function storyReadDoc(data: GameData, p: LangProgress, docId: string): void {
  const rec = storyState(p).docs[docId];
  if (!rec || rec.lastRead === p.day) return;
  rec.lastRead = p.day;
  rec.reads++;
  const def = storyOf(data)?.shared.documents.find((d) => d.id === docId);
  const all = !!def && p.stage >= def.readable;
  for (const text of docLines(data, p, docId)) {
    const ids = storyWordIds(data, text).filter((id) => all || p.words[id]);
    if (ids.length) recordEncounter(p.words, ids, p.day, text);
  }
}

// ---------------------------------------------------------------------------
// Beat selection
// ---------------------------------------------------------------------------

function lastBeatDayOf(story: Story, st: StoryState, character: string): number | undefined {
  let last: number | undefined;
  for (const b of story.shared.beats) {
    const r = st.beats[b.id];
    if (b.character === character && r && (last === undefined || r.day > last)) last = r.day;
  }
  return last;
}

/** Is the beat eligible today (conditions, not yet fired, group free, character's gap)? */
export function beatEligible(story: Story, p: LangProgress, b: BeatDef): boolean {
  const st = storyState(p);
  if (st.beats[b.id]) return false;
  if (b.group && st.groups.includes(b.group)) return false;
  if (!condHolds(b.when, p)) return false;
  if (st.today?.beats.some((id) => story.shared.beats.find((x) => x.id === id)?.character === b.character)) return false;
  const last = lastBeatDayOf(story, st, b.character);
  if (last !== undefined && p.day - last < (b.gap ?? DEFAULT_GAP)) return false;
  return true;
}

function fire(story: Story, p: LangProgress, b: BeatDef, status: 'planned' | 'done', outcome?: BeatOutcome): void {
  const st = storyState(p);
  st.beats[b.id] = { day: p.day, status, ...(outcome ? { outcome } : {}) };
  if (b.group && !st.groups.includes(b.group)) st.groups.push(b.group);
  st.today?.beats.push(b.id);
  // People met: those who come in or are visited (not the predecessor's moments).
  const ch = story.shared.characters.find((c) => c.id === b.character);
  if (ch && b.kind !== 'moment' && st.today && !st.today.met.includes(ch.id)) st.today.met.push(ch.id);
}

function unfire(story: Story, p: LangProgress, b: BeatDef): void {
  const st = storyState(p);
  delete st.beats[b.id];
  if (b.group && !story.shared.beats.some((x) => x.group === b.group && x.id !== b.id && st.beats[x.id]))
    st.groups = st.groups.filter((g) => g !== b.group);
  if (st.today) st.today.beats = st.today.beats.filter((x) => x !== b.id);
}

export function beatById(story: Story, id: string): BeatDef | undefined {
  return story.shared.beats.find((b) => b.id === id);
}

/** Beats in story order: by their stage, then as declared. */
function ordered(story: Story): BeatDef[] {
  return [...story.shared.beats].sort((a, b) => (a.when.stage ?? 1) - (b.when.stage ?? 1));
}

function sayEncounter(data: GameData, p: LangProgress, text: string | undefined): void {
  if (text) recordEncounter(p.words, storyWordIds(data, text), p.day, text);
}

function sceneLines(story: Story, beatId: string, outcome?: BeatOutcome): SceneLine[] {
  const t = story.text.beats[beatId];
  if (!t) return [];
  if (outcome === 'good' && t.linesGood) return t.linesGood;
  if (outcome === 'poor' && t.linesPoor) return t.linesPoor;
  return t.lines ?? [];
}

/** Queue a scene card if the beat has anything to show (lines or a choice). */
function pushScene(data: GameData, story: Story, p: LangProgress, b: BeatDef, outcome?: BeatOutcome, request = false): void {
  const st = storyState(p);
  const t = story.text.beats[b.id];
  const lines = request ? [] : sceneLines(story, b.id, outcome);
  const hasChoice = !request && !!b.choice?.length;
  if (!request && !lines.length && !hasChoice) return;
  if (request && !t?.request) return;
  for (const l of lines) if ('say' in l) sayEncounter(data, p, l.say);
  if (hasChoice) sayEncounter(data, p, t?.prompt);
  if (request) sayEncounter(data, p, t?.request);
  st.cards.push({ kind: 'scene', beat: b.id, ...(outcome ? { outcome } : {}), ...(request ? { request: true } : {}) });
}

function addHook(story: Story, p: LangProgress, beatId: string, outcome?: BeatOutcome): void {
  const t = story.text.beats[beatId];
  const st = storyState(p);
  const h = (outcome === 'good' && t?.hookGoodJa) || (outcome === 'poor' && t?.hookPoorJa) || t?.hookJa;
  if (h && st.today && !st.today.hooks.includes(h)) st.today.hooks.push(h);
}

/** Resolve a beat with an outcome: effects, hook, scene. */
function resolve(data: GameData, story: Story, p: LangProgress, b: BeatDef, outcome: BeatOutcome): void {
  const st = storyState(p);
  st.beats[b.id] = { ...(st.beats[b.id] ?? { day: p.day }), status: 'done', outcome };
  addHook(story, p, b.id, outcome);
  pushScene(data, story, p, b, outcome);
  applyEffect(data, p, b.effects?.[outcome]);
}

function fireMoments(data: GameData, story: Story, p: LangProgress, at: 'morning' | 'evening', max: number): void {
  let n = 0;
  for (const b of ordered(story)) {
    if (n >= max) break;
    if (b.kind !== 'moment' || (b.at ?? 'morning') !== at || !beatEligible(story, p, b)) continue;
    fire(story, p, b, 'done', 'seen');
    resolve(data, story, p, b, 'seen');
    n++;
  }
}

export function chapterIndex(story: Story, stage: number): number {
  let idx = -1;
  [...story.shared.chapters].sort((a, b) => a.stage - b.stage).forEach((c, i) => {
    if (c.stage <= stage) idx = i;
  });
  return idx;
}

export function sortedChapters(story: Story) {
  return [...story.shared.chapters].sort((a, b) => a.stage - b.stage);
}

// ---------------------------------------------------------------------------
// Day hooks
// ---------------------------------------------------------------------------

function beginDay(p: LangProgress): void {
  const st = storyState(p);
  if (st.today?.day === p.day) return;
  st.today = {
    day: p.day,
    shopPlanned: false,
    townPlanned: false,
    beats: [],
    met: [],
    talked: [],
    docs: [],
    hooks: [],
    confirmedAtStart: Object.entries(p.words)
      .filter(([, w]) => w.confirmed)
      .map(([id]) => id),
    repStart: p.reputation,
    moneyStart: p.town.money,
    evening: false,
  };
}

/** Story order instance for a visit beat. */
export function visitInstance(data: GameData, story: Story, b: BeatDef): OrderInstance | null {
  const t = story.text.beats[b.id];
  const ch = story.shared.characters.find((c) => c.id === b.character);
  const rule = b.rule ?? (b.recipe ? data.recipes.get(b.recipe)?.rule : undefined);
  if (!t?.order || !rule || !ch?.customer) return null;
  return {
    key: STORY_KEY_PREFIX + b.id,
    source: { type: 'template', id: STORY_KEY_PREFIX + b.id },
    text: t.order,
    rule,
    audioOnly: false,
    customer: ch.customer,
    ...(b.recipe ? { recipe: b.recipe } : {}),
  };
}

/** After the shop planned the day: chapter card, morning moments, a regular's visit. */
export function storyPlanShop(data: GameData, p: LangProgress, rng: Rng): void {
  const story = storyOf(data);
  if (!story) return;
  beginDay(p);
  const st = storyState(p);
  const today = st.today!;
  if (today.shopPlanned) return;
  today.shopPlanned = true;
  let ch = chapterIndex(story, p.stage);
  if (storyCatchingUp(p)) {
    // Started above zero: chapter cards follow the story's own progress (src/story/catchup.ts).
    const front = storyFrontier(story.shared.beats, st, p, (b) => condHolds(b.when, p));
    ch = catchUpChapter(ch, st.chapter, front === null ? null : chapterIndex(story, front));
  }
  if (ch > st.chapter) {
    // An imported old save catches up on one card: the current chapter.
    st.chapter = ch;
    st.cards.push({ kind: 'chapter', chapter: sortedChapters(story)[ch].id });
  }
  fireMoments(data, story, p, 'morning', 1);
  const t = p.today;
  if (!t || t.phase === 'closed') return;
  let visits = 0;
  for (const b of ordered(story)) {
    if (b.kind !== 'visit' || !beatEligible(story, p, b)) continue;
    if (visits > 0 && !beatBehind(p, b)) continue; // a second visit only to catch up (catchup.ts)
    const inst = visitInstance(data, story, b);
    if (!inst) continue;
    // Somewhere after the current customer, never first thing in the morning unless alone.
    const from = Math.min(t.queue.length, t.index + 1);
    const pos = from + Math.floor(rng() * (t.queue.length - from + 1));
    t.queue.splice(pos, 0, inst);
    fire(story, p, b, 'planned');
    if (++visits >= visitsToday(p)) break;
  }
}

/** After the town planned its segments: a regular's delivery replaces today's slip. */
export function storyPlanTown(data: GameData, p: LangProgress, rng: Rng): void {
  const story = storyOf(data);
  const town = townOf(data);
  if (!story) return;
  beginDay(p);
  const st = storyState(p);
  const today = st.today!;
  if (today.townPlanned) return;
  today.townPlanned = true;
  const td = p.townDay;
  if (!town || !td || p.town.unlocked.delivery === undefined) return;
  // Not when today's delivery is already under way (a resumed day).
  const di = td.segments.indexOf('delivery');
  if (di >= 0 && (di < td.seg || (td.delivery && td.delivery.phase !== 'plan'))) return;
  for (const b of ordered(story)) {
    if (b.kind !== 'delivery' || !b.slip || !beatEligible(story, p, b)) continue;
    const t = story.text.beats[b.id];
    const rule = ruleFor(town.shared.delivery, b.slip);
    const lines = rule ? writeSlip(data, p, town, b.slip, rng) : null;
    if (!rule || !lines || !t?.recipient) continue;
    const persons = town.shared.delivery.persons.map((x) => x.id);
    const named = [b.slip.give, b.slip.avoid].filter((x): x is NonNullable<typeof x> => !!x);
    const others = shuffle(rng, persons.filter((x) => !named.includes(x)));
    td.delivery = {
      level: td.delivery?.level ?? 1,
      features: td.delivery?.features ?? [],
      slip: {
        key: STORY_KEY_PREFIX + b.id,
        source: { type: 'template', id: STORY_KEY_PREFIX + b.id },
        recipient: t.recipient,
        lines,
        spec: b.slip,
        rule,
        home: b.slip.absent ? b.slip.home !== false : true,
      },
      phase: 'plan',
      choice: { place: null, hour: null, knocks: 0, person: null, absent: null },
      household: shuffle(rng, [...named, ...others.slice(0, Math.max(1, 3 - named.length))]),
      result: null,
    };
    for (const l of lines) recordEncounter(p.words, storyWordIds(data, l.text), p.day, l.text);
    if (di < 0) td.segments.push('delivery');
    fire(story, p, b, 'planned');
    pushScene(data, story, p, b, undefined, true);
    break;
  }
}

const GOOD: Outcome[] = ['perfect', 'minor'];

/** After a cup: resolve a visit beat, or add a regular's small talk to an ordinary order. */
export function storyAfterServe(data: GameData, p: LangProgress, out: ServeOutcome | null, rng: Rng): void {
  const story = storyOf(data);
  const t = p.today;
  if (!story || !out || !t) return;
  const order = t.queue[t.index];
  const res = t.results[t.results.length - 1];
  if (!order || !res) return;
  const st = storyState(p);
  beginDay(p);
  const good = GOOD.includes(out.evaluation.outcome);
  if (order.key.startsWith(STORY_KEY_PREFIX)) {
    const b = beatById(story, order.key.slice(STORY_KEY_PREFIX.length));
    // A story visit does not come back as an anonymous returning customer.
    p.returns = p.returns.filter((r) => r.instance.key !== order.key);
    if (!b || st.beats[b.id]?.status === 'done') return;
    const bt = story.text.beats[b.id];
    const line = good ? bt?.good : bt?.poor;
    if (line) {
      res.reaction = line;
      res.face = good ? 'happy' : 'sad';
      out.reaction = { ...out.reaction, text: line, face: res.face, reactionId: 'story' };
      sayEncounter(data, p, line);
    }
    if (!st.beats[b.id]) fire(story, p, b, 'planned');
    resolve(data, story, p, b, good ? 'good' : 'poor');
    return;
  }
  // Small talk: a regular adds a line after a good cup (once a day per character).
  const ch = story.shared.characters.find((c) => c.customer && c.customer === order.customer);
  if (!ch || !st.today) return;
  if (!st.today.met.includes(ch.id)) st.today.met.push(ch.id);
  if (!good || st.today.talked.includes(ch.id) || rng() > 0.6) return;
  const cands = story.shared.talk.filter((x) => x.character === ch.id && condHolds(x.when, p) && story.text.talk[x.id]);
  if (!cands.length) return;
  const least = Math.min(...cands.map((x) => st.talk[x.id] ?? 0));
  const pool = cands.filter((x) => (st.talk[x.id] ?? 0) === least);
  const talk = pool[pool.length - 1 - Math.floor(rng() * Math.min(2, pool.length))];
  const text = story.text.talk[talk.id];
  st.talk[talk.id] = (st.talk[talk.id] ?? 0) + 1;
  st.today.talked.push(ch.id);
  res.reaction = `${res.reaction} ${text}`;
  out.reaction = { ...out.reaction, text: res.reaction };
  sayEncounter(data, p, text);
}

/** Resolve today's story delivery once it has been handed over. Returns true if something changed. */
export function storySync(data: GameData, p: LangProgress): boolean {
  const story = storyOf(data);
  const x = p.townDay?.delivery;
  if (!story || !x || x.phase !== 'result' || !x.result || !x.slip.key.startsWith(STORY_KEY_PREFIX)) return false;
  const b = beatById(story, x.slip.key.slice(STORY_KEY_PREFIX.length));
  const st = storyState(p);
  if (!b || st.beats[b.id]?.status !== 'planned') return false;
  const good = GOOD.includes(x.result.outcome);
  const bt = story.text.beats[b.id];
  const line = good ? bt?.good : bt?.poor;
  if (line) {
    x.result.reaction = line;
    x.result.face = good ? 'happy' : 'sad';
    sayEncounter(data, p, line);
  }
  resolve(data, story, p, b, good ? 'good' : 'poor');
  return true;
}

/** End of day (before the calendar moves): settle beats, evening moments, the ledger card. */
export function storyEndDay(data: GameData, p: LangProgress): void {
  const story = storyOf(data);
  if (!story) return;
  beginDay(p);
  const st = storyState(p);
  const today = st.today!;
  if (today.evening) return;
  today.evening = true;
  storySync(data, p);
  // A planned beat that did not happen (e.g. the delivery was not made) waits for another day.
  for (const [id, r] of Object.entries(st.beats)) {
    const b = beatById(story, id);
    if (r.status === 'planned' && b) unfire(story, p, b);
  }
  fireMoments(data, story, p, 'evening', 1);
  const md = p.townDay?.market;
  const expenses = md?.spent ?? 0;
  const money = p.town.money;
  const results = p.today?.results ?? [];
  const before = new Set(today.confirmedAtStart);
  const ledger: Ledger = {
    day: p.day,
    takings: Math.max(0, money - (p.townDay?.moneyStart ?? today.moneyStart) + expenses),
    expenses,
    money,
    repDelta: p.reputation - today.repStart,
    served: results.length,
    perfect: results.filter((r) => r.outcome === 'perfect').length,
    met: [...today.met],
    confirmed: Object.entries(p.words)
      .filter(([id, w]) => w.confirmed && !before.has(id))
      .map(([id]) => id),
    docs: [...today.docs],
    hooks: [...today.hooks],
  };
  st.lastLedger = ledger;
  st.cards.push({ kind: 'ledger', ledger });
}

// ---------------------------------------------------------------------------
// UI actions
// ---------------------------------------------------------------------------

/** Does the first card wait for an answer? */
export function cardNeedsChoice(data: GameData, p: LangProgress): boolean {
  const story = storyOf(data);
  const c = storyState(p).cards[0];
  if (!story || !c || c.kind !== 'scene' || c.request) return false;
  const b = beatById(story, c.beat);
  return !!b?.choice?.length && !storyState(p).beats[c.beat]?.choice;
}

export function storyDismiss(data: GameData, p: LangProgress): void {
  if (cardNeedsChoice(data, p)) return;
  storyState(p).cards.shift();
}

/** Answer the choice of the first card: record it, apply its effects, show the reply. */
export function storyChoose(data: GameData, p: LangProgress, option: string): void {
  const story = storyOf(data);
  const st = storyState(p);
  const c = st.cards[0];
  if (!story || !c || c.kind !== 'scene' || !cardNeedsChoice(data, p)) return;
  const b = beatById(story, c.beat);
  const opt = b?.choice?.find((o) => o.id === option);
  if (!b || !opt) return;
  const rec = (st.beats[b.id] ??= { day: p.day, status: 'done', outcome: 'seen' });
  rec.choice = opt.id;
  applyEffect(data, p, opt.effects);
  const t = story.text.beats[b.id]?.options?.[opt.id];
  sayEncounter(data, p, t?.text);
  sayEncounter(data, p, t?.reply);
  if (t?.ja && st.today && !st.today.hooks.includes(t.ja)) st.today.hooks.push(t.ja);
  // The reply replaces the question card; documents given by the choice follow it.
  st.cards.splice(0, 1, { kind: 'reply', beat: b.id, option: opt.id });
}

/** Simulator / tests: answer and close every pending card (choice = pick(option ids)). */
export function storyAutoPlay(data: GameData, p: LangProgress, choose: (b: BeatDef) => string): void {
  const story = storyOf(data);
  if (!story) return;
  for (let i = 0; i < 50 && storyState(p).cards.length; i++) {
    if (cardNeedsChoice(data, p)) {
      const c = storyState(p).cards[0] as { beat: string };
      storyChoose(data, p, choose(beatById(story, c.beat)!));
    } else storyDismiss(data, p);
  }
}
