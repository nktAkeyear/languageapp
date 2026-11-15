/**
 * The v2 working day (pure game logic over V2State; no UI). A day has three parts, all at the same place — the
 * counter of the tea house / the reception desk of the clinic (room 'shop'):
 *
 * - 始業前 (part 0): the sign on the door says 準備中, nobody at the counter, the day's note lies on it. The shelf
 *   shows every item with its count; the order pad lies by the till; the market (basket by the door, tea house)
 *   and the town (map on the wall) can be visited. Flipping the sign starts the working hours.
 * - 業務中 (part 1): customers / patients one at a time at the counter. Nobody leaves: goods can be ordered on the
 *   pad (delivery fee) and arrive a few seconds later; the market is not reachable.
 * - 業務後 (part 2): the sign says 準備中 again; the day's summary card lies over the room; ordering for tomorrow
 *   (the crate comes in the morning), the market, the town (where to work tomorrow), ending the day.
 *
 * The tea house's customers, reactions, reputation, stage and hidden SRS are the existing shop engine
 * (src/activities/shop/engine.ts); the clinic's shift is the existing jobs engine (src/jobs/engine.ts).
 * Stock, ordering, deliveries and the day's flow are v2's own (./stock.ts).
 */
import { applyStartLevel, difficultyEndDay, difficultyOnServe, difficultyStartDay, difficultyState, startLabel } from '../../core/difficulty';
import { capitalizeFirst, ingredientsAtStage, type GameData } from '../../core/gamedata';
import type { Rng } from '../../core/rng';
import { recordEncounter } from '../../core/srs';
import { tokenIds } from '../../core/tokenize';
import type { Brew, Face, IngredientId, Method, Outcome, Temp } from '../../core/types';
import { currentOrder, endDay as shopEndDay, nextCustomer as shopNext, serve, startDay } from '../../activities/shop/engine';
import { beginShift, currentShift, currentTask, jobById, jobProgress, jobsState, nextTask, planShift, submitTask } from '../../jobs/engine';
import type { TaskAnswer, TaskInstance, TaskResult } from '../../jobs/types';
import { NUMBER_TEXT } from '../../content/en/market';
import { CLINIC_SUPPLIES, CUP_PAY, START_MONEY, START_STOCK, TAP, teaCatalog, type CatalogItem, type WorkplaceId } from './catalog';
import { addInto, available, buyInPerson, commitUse, placeOrder, receiveDue, type Delivery, type OrderLine } from './stock';
import { blankState, emptyBrew, emptyTally, type Part, type Room, type V2State } from './state';
import { ingredientWords } from '../data';

export interface Ctx {
  data: GameData;
  rng: Rng;
  now: number;
}

export const WORKPLACES: WorkplaceId[] = ['teahouse', 'clinic'];

// ------------------------------------------------------------------------------------------------ catalogues

export function catalogFor(data: GameData, wp: WorkplaceId): CatalogItem[] {
  return wp === 'clinic' ? CLINIC_SUPPLIES : teaCatalog(ingredientWords(data));
}

/** The items on today's shelf: the tea house's ingredients of its stage (not tap water) / the clinic's supplies. */
export function shelfItems(data: GameData, s: V2State, wp: WorkplaceId = s.day.workplace): CatalogItem[] {
  if (wp === 'clinic') return CLINIC_SUPPLIES;
  const open = new Set(ingredientsAtStage(data, s.p.stage));
  return teaCatalog(ingredientWords(data)).filter((c) => open.has(c.id as IngredientId));
}

/** Is tap water on the bench today? */
export function hasTap(data: GameData, s: V2State): boolean {
  return ingredientsAtStage(data, s.p.stage).includes(TAP);
}

export function unitPhrase(item: CatalogItem, units: number): string {
  if (units === 1) return item.unit.one;
  return item.unit.other.replace('{n}', NUMBER_TEXT[units] ?? String(units));
}

export function numberWord(n: number): string {
  return NUMBER_TEXT[n] ?? String(n);
}

export function moneyWords(n: number): string {
  return n === 1 ? 'one coin' : `${numberWord(n)} coins`;
}

// ------------------------------------------------------------------------------------------------ a new game

export function newGame(ctx: Ctx, opts: { level: number; toeic: number | null }): V2State {
  const s = blankState();
  const { data } = ctx;
  s.p.town.money = START_MONEY;
  if (opts.level > 0 || opts.toeic) applyStartLevel(data, s.p, opts.level, { toeic: opts.toeic });
  s.startLabel = startLabel('en', difficultyState(s.p));
  s.stock = { teahouse: { ...START_STOCK.teahouse }, clinic: { ...START_STOCK.clinic } };
  // A start that jumps the shop ahead finds one unit of every ingredient its stage uses on the shelf.
  for (const it of shelfItems(data, s, 'teahouse')) if (s.stock.teahouse[it.id] === undefined) s.stock.teahouse[it.id] = it.per;
  s.tally = emptyTally(1, 'teahouse', s.p.town.money);
  beginDay(s, ctx);
  return s;
}

// ------------------------------------------------------------------------------------------------ the day

/** Morning: crates ordered last night arrive, today's workplace is set up, the note is pinned. */
export function beginDay(s: V2State, ctx: Ctx): void {
  const { data } = ctx;
  const p = s.p;
  s.day = { day: p.day, part: 0, workplace: s.next, room: 'shop' };
  s.tally = emptyTally(p.day, s.day.workplace, p.town.money);
  s.brew = emptyBrew();
  difficultyStartDay(data, p);
  tick(s, ctx);
  setUpWorkplace(s, ctx);
}

function setUpWorkplace(s: V2State, ctx: Ctx): void {
  const { data, rng } = ctx;
  const p = s.p;
  if (s.day.workplace === 'teahouse') {
    p.today = null;
    startDay(data, p, rng);
  } else {
    const job = jobById(data, 'clinic')!;
    jobProgress(p, job.id);
    const js = jobsState(p);
    js.day = { day: p.day, part: 0, view: 'job', work: job.id, tea: 'none', log: [], shift: planShift(data, p, job, 1, rng), notes: [] };
  }
  for (const line of morningNote(data, s)) recordEncounter(p.words, tokenIds(data.tokens(line)), p.day, line);
}

/** What today's queue needs at least, in portions (the shopping note's arithmetic). */
export function needToday(data: GameData, s: V2State): Record<string, number> {
  const need: Record<string, number> = {};
  for (const o of s.p.today?.queue.slice(s.p.today.index) ?? []) {
    for (const r of o.rule.require ?? []) need[r.ing] = (need[r.ing] ?? 0) + Math.max(1, r.min ?? 1);
  }
  delete need[TAP];
  void data;
  return need;
}

/**
 * The day's note (in-world English, with markup): how many come today, and which goods are at 0 on the shelf —
 * stated as a fact, never as an instruction to buy.
 */
export function morningNote(data: GameData, s: V2State): string[] {
  if (s.day.workplace === 'clinic') {
    const sh = currentShift(s.p);
    const n = sh?.tasks.length ?? 0;
    const lines = [sh?.startLine || 'Good morning!'];
    if (n) lines.push(`${capitalizeFirst(numberWord(n))} people today.`);
    return lines;
  }
  const q = s.p.today?.queue ?? [];
  const lines = [`Good morning! ${capitalizeFirst(numberWord(q.length))} customers today.`];
  for (const it of shelfItems(data, s)) {
    if ((s.stock.teahouse[it.id] ?? 0) > 0) continue;
    lines.push(`We have no ${data.lex.byId.get(it.word)?.text ?? it.id}.`);
  }
  return lines;
}

/** Flip the sign: working hours begin (at the same counter / desk). */
export function openWork(s: V2State, ctx: Ctx): void {
  if (s.day.part !== 0) return;
  s.day.part = 1;
  s.day.room = 'shop';
  if (s.day.workplace === 'clinic') beginShift(ctx.data, s.p);
}

/** The last customer / task is done: flip the sign back (業務後), same place. */
export function closeWork(s: V2State): void {
  if (s.day.part !== 1) return;
  if (!workDone(s)) return;
  s.day.part = 2;
  s.day.room = 'shop';
  s.brew = emptyBrew();
}

export function workDone(s: V2State): boolean {
  if (s.day.workplace === 'teahouse') return !s.p.today || s.p.today.phase === 'closed';
  const sh = currentShift(s.p);
  return !sh || sh.phase === 'done';
}

export function goRoom(s: V2State, room: Room): string | null {
  const part = s.day.part;
  if (room === 'market') {
    if (part === 1) return '業務中は店を離れられません。';
    if (s.day.workplace !== 'teahouse') return '市場の品は茶房のためのもの。';
  }
  if (room === 'town' && part === 1) return '業務中は店を離れられません。';
  s.day.room = room;
  return null;
}

/** In the town: work somewhere else today (before opening), or choose where to work tomorrow (after closing). */
export function chooseWorkplace(s: V2State, ctx: Ctx, wp: WorkplaceId): void {
  const p = s.p;
  if (s.day.part === 0) {
    // Today only: the days ahead still start where the player chose after closing.
    if (wp !== s.day.workplace) {
      abandonWorkplace(s);
      s.day.workplace = wp;
      s.tally.workplace = wp;
      setUpWorkplace(s, ctx);
    }
    s.day.room = 'shop';
    return;
  }
  if (s.day.part === 2) s.next = wp;
  void p;
}

/** Before opening, leaving today's workplace for another: its plan is dropped (returning customers come back later). */
function abandonWorkplace(s: V2State): void {
  const p = s.p;
  if (s.day.workplace === 'teahouse') {
    for (const q of p.today?.queue ?? []) if (q.returning && !p.returns.some((r) => r.instance.key === q.key)) p.returns.push({ instance: { ...q, returning: false }, day: p.day + 1 });
    p.today = null;
    s.brew = emptyBrew();
  } else if (p.jobs) p.jobs.day = null;
}

/** Close the books: the calendar moves on, the stock stays on the shelf, the next morning begins. */
export function endDay(s: V2State, ctx: Ctx): void {
  if (s.day.part !== 2) return;
  const { data } = ctx;
  const p = s.p;
  difficultyEndDay(data, p);
  if (s.day.workplace === 'teahouse' && p.today?.phase === 'closed') shopEndDay(p);
  else {
    p.today = null;
    p.day++;
  }
  if (p.jobs) p.jobs.day = null;
  s.arrived = [];
  beginDay(s, ctx);
}

// ------------------------------------------------------------------------------------------------ stock & ordering

/** Deliveries that are due arrive (called on a timer and at every morning). */
export function tick(s: V2State, ctx: Ctx): Delivery[] {
  const due = receiveDue(s.stock, s.pending, ctx.now, s.p.day);
  for (const d of due) {
    const lines = d.lines.map((l) => ({ id: l.id, portions: l.portions }));
    s.arrived.push({ key: d.id, workplace: d.workplace, via: 'crate', lines, day: s.p.day, part: s.day.part, at: ctx.now });
    if (d.workplace === s.day.workplace) addInto(s.tally.bought, Object.fromEntries(lines.map((l) => [l.id, l.portions])));
  }
  if (s.arrived.length > 12) s.arrived.splice(0, s.arrived.length - 12);
  return due;
}

export function orderDelivery(s: V2State, ctx: Ctx, lines: OrderLine[]): { delivery: Delivery } | { reason: string } {
  const wp = s.day.workplace;
  const r = placeOrder(s.p.town, s.pending, catalogFor(ctx.data, wp), lines, { workplace: wp, day: s.p.day, part: s.day.part, now: ctx.now, id: `d${++s.seq}` });
  if ('delivery' in r) {
    s.tally.spent += r.delivery.total;
    s.tally.fees += r.delivery.fee;
  }
  return r;
}

/** Buy in person at the market (tea house, before opening / after closing). */
export function marketBuy(s: V2State, ctx: Ctx, id: string, units: number, paid: number): ReturnType<typeof buyInPerson> {
  const item = catalogFor(ctx.data, 'teahouse').find((c) => c.id === id);
  if (!item || s.day.part === 1) return { ok: false, reason: 'none' };
  const r = buyInPerson(s.p.town, s.stock.teahouse, item, units, paid);
  if (r.ok) {
    s.tally.spent += units * item.price;
    addInto(s.tally.bought, { [id]: r.portions });
    s.arrived.push({ key: `m${++s.seq}`, workplace: 'teahouse', via: 'market', lines: [{ id, portions: r.portions }], day: s.p.day, part: s.day.part, at: ctx.now });
  }
  return r;
}

/** The player heard / read an in-world line (vendor talk): its words count as encountered. */
export function hear(s: V2State, ctx: Ctx, text: string): void {
  recordEncounter(s.p.words, tokenIds(ctx.data.tokens(text)), s.p.day, text);
}

// ------------------------------------------------------------------------------------------------ the tea house

export function teaAvailable(s: V2State, id: string): number {
  return available(s.stock.teahouse, s.brew.counts, id);
}

/** One portion into the cup (from the shelf; tap water is always there). False when the jar is empty or the cup full. */
export function addPortion(ctx: Ctx, s: V2State, ing: IngredientId): boolean {
  if (s.day.part !== 1 || s.p.today?.phase !== 'order') return false;
  const def = ctx.data.ing.get(ing);
  const cur = s.brew.counts[ing] ?? 0;
  if (!def || cur >= def.maxCount) return false;
  if (ing !== TAP && teaAvailable(s, ing) <= 0) return false;
  s.brew.counts[ing] = cur + 1;
  return true;
}

export function removePortion(s: V2State, ing: IngredientId): void {
  const cur = s.brew.counts[ing] ?? 0;
  if (cur <= 1) delete s.brew.counts[ing];
  else s.brew.counts[ing] = cur - 1;
}

export function emptyCup(s: V2State): void {
  s.brew = { ...emptyBrew(), temp: s.brew.temp, method: s.brew.method };
}

export function setTemp(s: V2State, t: Temp | null): void {
  s.brew.temp = s.brew.temp === t ? null : t;
}

export function setMethod(s: V2State, m: Method | null): void {
  s.brew.method = s.brew.method === m ? null : m;
}

export interface CupResult {
  outcome: Outcome;
  reaction: string;
  face: Face;
  pay: number;
}

/** Hand the cup over: the customer reacts (their line says what was off, nothing else does), pays, the portions leave the shelf. */
export function serveCup(s: V2State, ctx: Ctx): CupResult | null {
  const { data, rng } = ctx;
  const p = s.p;
  const order = currentOrder(p);
  if (!order || p.today?.phase !== 'order' || s.day.part !== 1) return null;
  const brew: Brew = { counts: { ...s.brew.counts }, temp: s.brew.temp, method: s.brew.method };
  const out = serve(data, p, brew, rng);
  if (!out) return null;
  difficultyOnServe(data, p, order, out.evaluation.outcome);
  const pay = CUP_PAY[out.evaluation.outcome];
  p.town.money += pay;
  const usedCounts = { ...brew.counts };
  delete usedCounts[TAP];
  addInto(s.tally.used, commitUse(s.stock.teahouse, usedCounts));
  s.tally.served++;
  s.brew = emptyBrew();
  return { outcome: out.evaluation.outcome, reaction: out.reaction.text, face: out.reaction.face, pay };
}

export function nextCustomer(s: V2State, ctx: Ctx): void {
  const p = s.p;
  if (p.today?.phase !== 'reaction') return;
  shopNext(ctx.data, p);
}

// ------------------------------------------------------------------------------------------------ the clinic

/** The supply a task uses up when it is handed in (a folder for a chart, ink for a stamp, paper for a message, a card). */
export function supplyFor(task: Pick<TaskInstance, 'spec'>): string | null {
  const sp = task.spec;
  if (sp.arch === 'sort') return 'folder';
  if (sp.arch === 'check') return 'ink';
  if (sp.arch === 'respond' && sp.mode === 'form') return 'paper';
  if (sp.arch === 'respond' && sp.mode === 'slot') return 'card';
  return null;
}

export function clinicSubmit(s: V2State, ctx: Ctx, answer: TaskAnswer): { result: TaskResult } | { reason: string; supply: string } | null {
  const task = currentTask(s.p);
  const sh = currentShift(s.p);
  if (!task || !sh || sh.phase !== 'task' || s.day.part !== 1) return null;
  const sup = supplyFor(task);
  if (sup && (s.stock.clinic[sup] ?? 0) <= 0) return { reason: 'empty', supply: sup };
  const out = submitTask(ctx.data, s.p, answer, ctx.rng);
  if (!out) return null;
  if (sup) addInto(s.tally.used, commitUse(s.stock.clinic, { [sup]: 1 }));
  s.tally.served++;
  return { result: out.result };
}

export function clinicNext(s: V2State, ctx: Ctx): void {
  nextTask(ctx.data, s.p);
}

/** Today's working part as one word for the strip (also used by tests). */
export function partOf(s: V2State): Part {
  return s.day.part;
}
