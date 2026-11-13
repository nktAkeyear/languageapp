/**
 * Content validation for the town activities (market, deliveries). Called from validate.ts.
 * Checks referential integrity, that every planned task is solvable with what is unlocked at its
 * level, that every generated text tokenizes fully, and marks every word that can appear as
 * reachable (for the "every word appears somewhere" check).
 */
import { generateSpec, deliveryFeatures, partTexts, reactionValues, relationsFor, writeSlip } from '../activities/delivery/engine';
import { evaluateDelivery, resolveDest, ruleFor, slotsFor, witnessChoice, clockNumber } from '../activities/delivery/rules';
import { finishMarket, maxUnits, planMarket, priceTag, qtyText, solveMarket, stallRef } from '../activities/market/engine';
import { lineCovered } from '../activities/market/rules';
import { authoredInstance } from '../activities/shop/templates';
import { fill, moneyText, placeholders, townOf, type Town } from '../activities/town/text';
import { ingredientsAtStage, wordMarkup, type GameData } from './gamedata';
import { makeRng, pick } from './rng';
import { newProgress } from './save';
import type { DeliveryFeature, DeliveryReactionKind, MarketFeature, SlipSpec, TownShared, VendorLineKind } from './townTypes';
import { COLOURS } from './townTypes';
import type { SharedContent } from './types';

export interface TownCtx {
  err: (m: string) => void;
  warn: (m: string) => void;
  checkText: (where: string, text: string) => void;
  lexRef: (where: string, id: string | undefined) => void;
}

export function validateTownShared(shared: SharedContent): { errors: string[]; warnings: string[] } {
  const errors: string[] = [];
  const warnings: string[] = [];
  const t = shared.town;
  if (!t) return { errors, warnings };
  const err = (m: string) => errors.push(`shared town: ${m}`);
  const ingIds = new Set(shared.ingredients.map((i) => i.id));
  const m = t.market;
  const stallIds = new Set(m.stalls.map((s) => s.id));
  const varIds = new Set(m.variants.map((v) => v.id));
  for (const g of m.goods) {
    if (!ingIds.has(g.ingredient)) err(`market good ${g.ingredient} is not an ingredient`);
    if (!g.stalls.length) err(`market good ${g.ingredient} has no stall`);
    for (const s of g.stalls) if (!stallIds.has(s)) err(`market good ${g.ingredient}: unknown stall ${s}`);
    for (const v of g.variants ?? []) if (!varIds.has(v)) err(`market good ${g.ingredient}: unknown variant ${v}`);
    if (g.portionsPerUnit < 1 || g.price < 1) err(`market good ${g.ingredient}: portionsPerUnit and price must be >= 1`);
    if (g.ingredient && shared.ingredients.find((i) => i.id === g.ingredient)?.neutral) err(`market good ${g.ingredient} is neutral (water) — never short`);
  }
  for (const s of m.stalls) if (!COLOURS.includes(s.colour)) err(`stall ${s.id}: unknown colour ${s.colour}`);
  if (new Set(m.stalls.map((s) => s.colour)).size !== m.stalls.length) err('stalls must have distinct colours (they are named by colour)');
  const checkLevels = (what: string, lv: { level: number; minRuns: number }[]) => {
    const sorted = [...lv].sort((a, b) => a.level - b.level);
    sorted.forEach((l, i) => {
      if (l.level !== i + 1) err(`${what} levels must be numbered 1..n`);
      if (i === 0 && l.minRuns !== 0) err(`${what} level 1 must have minRuns 0`);
      if (i > 0 && l.minRuns <= sorted[i - 1].minRuns) err(`${what} level ${l.level}: minRuns must increase`);
    });
  };
  checkLevels('market', m.levels);
  if (m.coins.some((c) => c < 1)) err('coins must be >= 1');

  const d = t.delivery;
  checkLevels('delivery', d.levels);
  const ids = new Set<string>();
  const pos = new Set<string>();
  const lms = new Set<string>();
  for (const c of d.map) {
    if (ids.has(c.id)) err(`map: duplicate id ${c.id}`);
    ids.add(c.id);
    if (c.col < 0 || c.col >= d.cols || c.row < 0 || c.row >= d.rows) err(`map ${c.id}: outside the ${d.cols}x${d.rows} grid`);
    const k = `${c.col},${c.row}`;
    if (pos.has(k)) err(`map ${c.id}: two cells at ${k}`);
    pos.add(k);
    if (c.landmark) {
      if (lms.has(c.landmark)) err(`map: landmark ${c.landmark} twice`);
      lms.add(c.landmark);
    } else if (!c.door) err(`map ${c.id}: houses need a door colour`);
  }
  const hours = new Set<number>();
  for (const s of d.slots) {
    if (hours.has(s.hour)) err(`slots: hour ${s.hour} twice`);
    hours.add(s.hour);
  }
  const persons = new Set(d.persons.map((p) => p.id));
  const sIds = new Set<string>();
  for (const s of d.curriculum) {
    const where = `delivery curriculum ${s.id}`;
    if (sIds.has(s.id)) err(`${where}: duplicate id`);
    sIds.add(s.id);
    checkSlip(t, s, s.level, where, err, (m2) => warnings.push(`shared town: ${m2}`));
    if (s.give && !persons.has(s.give)) err(`${where}: unknown person ${s.give}`);
    if (s.avoid && !persons.has(s.avoid)) err(`${where}: unknown person ${s.avoid}`);
  }
  return { errors, warnings };
}

const FEATURE_OF: Partial<Record<string, DeliveryFeature>> = {
  next_to: 'relations',
  behind: 'relations',
  across: 'relations',
  left: 'leftRight',
  right: 'leftRight',
  at: 'clock',
  before: 'beforeAfter',
  after: 'beforeAfter',
};

/** A slip is solvable and only uses what is unlocked at its level. */
function checkSlip(t: TownShared, s: SlipSpec, level: number, where: string, err: (m: string) => void, warn: (m: string) => void) {
  const d = t.delivery;
  const rule = ruleFor(d, s);
  if (!rule) return err(`${where}: "${s.dest.rel} ${s.dest.landmark}" does not point at exactly one place`);
  if (rule.slots && !rule.slots.length) err(`${where}: no time slot satisfies the slip`);
  const st = s.time;
  if (st && st.kind !== 'period' && !d.slots.some((x) => x.hour === st.hour)) err(`${where}: hour ${st.hour} is not a slot`);
  if (s.avoid && !s.give) err(`${where}: "avoid" needs "give"`);
  if (s.avoid && s.avoid === s.give) err(`${where}: give and avoid are the same person`);
  if (s.home === false && !s.absent) err(`${where}: nobody home but no instruction for that case`);
  if (s.dest.rel === 'at' && (s.give || s.absent)) err(`${where}: people / absence only for houses`);
  const feats = deliveryFeatures(d, level);
  const need: DeliveryFeature[] = [];
  if (s.dest.rel !== 'at') need.push(FEATURE_OF[s.dest.rel]!);
  if (s.time && s.time.kind !== 'period') need.push(FEATURE_OF[s.time.kind]!);
  if (s.give) need.push('person');
  if (s.avoid) need.push('avoid');
  if (s.knocks) need.push('knock');
  if (s.absent) need.push('absent');
  for (const f of need) if (!feats.includes(f)) err(`${where}: uses "${f}" before delivery level ${d.levels.find((l) => l.features.includes(f))?.level}`);
  const w = witnessChoice(rule, s.home !== false, d.slots);
  if (evaluateDelivery(rule, w, s.home !== false).outcome !== 'perfect') err(`${where}: no perfect choice exists`);
  if (s.knocks && (s.knocks < 1 || s.knocks > 3)) warn(`${where}: knocks ${s.knocks} (UI offers 1–3)`);
}

const VENDOR_PH: Record<VendorLineKind, string[]> = {
  greet: [],
  cheapHere: ['g'],
  askQty: ['g'],
  quote: ['qty', 'total'],
  thanks: [],
  overpaid: [],
  change: ['change'],
  notEnough: ['total'],
  noChange: [],
  soldOut: ['g'],
  soldOutTip: ['g', 'stall'],
  bargainYes: ['total'],
  bargainNo: ['total'],
};
/** Vendor line kinds the engine needs, and the market feature that first needs them. */
const VENDOR_NEED: [VendorLineKind, MarketFeature | null][] = [
  ['greet', null],
  ['askQty', null],
  ['quote', null],
  ['thanks', null],
  ['overpaid', null],
  ['notEnough', null],
  ['change', 'change'],
  ['noChange', 'change'],
  ['soldOutTip', 'soldOut'],
  ['bargainYes', 'bargain'],
  ['bargainNo', 'bargain'],
];
const DELIVERY_NEED: [DeliveryReactionKind, DeliveryFeature | null][] = [
  ['perfect', null],
  ['any_fail', null],
  ['wrong_place', null],
  ['too_early', null],
  ['too_late', null],
  ['wrong_person', 'person'],
  ['avoided_person', 'avoid'],
  ['wrong_knock', 'knock'],
  ['wrong_absent', 'absent'],
];

export function validateTownLanguage(data: GameData, ctx: TownCtx): Record<string, number> {
  const town = townOf(data);
  if (!town) return {};
  const { err, warn, checkText, lexRef } = ctx;
  const T = town.text;
  const S = town.shared;
  const levelOfMarketFeature = (f: MarketFeature) => S.market.levels.find((l) => l.features.includes(f))?.level ?? 99;
  const levelOfDeliveryFeature = (f: DeliveryFeature) => S.delivery.levels.find((l) => l.features.includes(f))?.level ?? 99;

  // --- word maps
  for (const n of Object.keys(T.numberText).map(Number)) checkText(`town numberText[${n}]`, T.numberText[n]);
  for (const c of COLOURS) lexRef(`town colourWords.${c}`, T.colourWords[c]);
  for (const [k, id] of Object.entries(T.delivery.placeWords)) lexRef(`delivery placeWords.${k}`, id);
  for (const [k, id] of Object.entries(T.delivery.personWords)) lexRef(`delivery personWords.${k}`, id);
  for (const [k, id] of Object.entries(T.delivery.periodWords)) lexRef(`delivery periodWords.${k}`, id);
  for (const c of S.delivery.map) if (c.landmark && !T.delivery.placeWords[c.landmark]) err(`delivery: no word for landmark ${c.landmark}`);
  for (const p of S.delivery.persons) if (!T.delivery.personWords[p.id]) err(`delivery: no word for person ${p.id}`);

  // --- market text
  const M = T.market;
  if (!M.money.other.includes('{n}')) err('market money.other must contain {n}');
  if (!M.tagMoney.other.includes('{d}')) err('market tagMoney.other must contain {d}');
  if (!M.stallRef.includes('{c}')) err('market stallRef must contain {c}');
  for (const n of [1, 2, 5, 10, 25, 50, 100]) {
    const t = moneyText(town, n);
    if (t) checkText(`market money(${n})`, t);
  }
  for (const s of S.market.stalls) checkText(`market stallRef(${s.id})`, stallRef(data, town, s.id));
  for (const [v, txt] of Object.entries(M.variantWords)) checkText(`market variantWords.${v}`, txt);
  for (const g of S.market.goods) {
    const gt = M.goods.find((x) => x.ingredient === g.ingredient);
    if (!gt) {
      err(`market: no text for good ${g.ingredient}`);
      continue;
    }
    if (!gt.per.includes('{price}')) err(`market good ${g.ingredient}: "per" needs {price}`);
    if (!gt.qty.base) err(`market good ${g.ingredient}: qty.base is required`);
    for (const v of g.variants ?? []) if (!gt.qty[v]) err(`market good ${g.ingredient}: no qty phrase for variant ${v}`);
    checkText(`market good ${g.ingredient} name`, gt.name);
    for (const v of [undefined, ...(g.variants ?? [])])
      for (let n = 1; n <= 10; n++) {
        const q = qtyText(town, g.ingredient, v, n);
        if (q) checkText(`market good ${g.ingredient} qty(${v ?? 'base'}, ${n})`, q);
        else err(`market good ${g.ingredient}: no quantity phrase for ${v ?? 'base'} × ${n}`);
      }
    for (const price of [1, 2, 9, 15, 40]) checkText(`market good ${g.ingredient} price tag`, priceTag(town, g.ingredient, price));
  }
  for (const t of M.noteTitles) checkText('market noteTitles', t);
  if (!fill(M.noteLine, { qty: 'x' })) err('market noteLine needs only {qty}');
  for (const c of M.cheaperNotes) {
    for (const g of M.goods)
      for (const s of S.market.stalls) {
        const txt = fill(c, { g: g.name, stall: stallRef(data, town, s.id) });
        if (!txt) err(`market cheaperNotes: cannot fill «${c}» (placeholders {g} {stall})`);
        else checkText('market cheaperNotes', txt);
      }
  }
  const lineIds = new Set<string>();
  for (const l of M.lines) {
    const where = `market line ${l.id}`;
    if (lineIds.has(l.id)) err(`${where}: duplicate id`);
    lineIds.add(l.id);
    const allowed = VENDOR_PH[l.kind];
    if (!allowed) {
      err(`${where}: unknown kind ${l.kind}`);
      continue;
    }
    for (const ph of placeholders(l.text)) if (!allowed.includes(ph)) err(`${where}: placeholder {${ph}} not available for "${l.kind}"`);
    for (const g of S.market.goods) {
      const name = M.goods.find((x) => x.ingredient === g.ingredient)?.name;
      if (!name) continue;
      for (const n of [1, 3, 12, 47]) {
        const txt = fill(l.text, {
          g: name,
          qty: qtyText(town, g.ingredient, undefined, Math.min(n, 10)),
          total: moneyText(town, n),
          change: moneyText(town, Math.min(n, 10)),
          stall: stallRef(data, town, pick(makeRng(n), S.market.stalls).id),
        });
        if (txt) checkText(where, txt);
        else err(`${where}: cannot be filled`);
      }
    }
  }
  for (const [kind, f] of VENDOR_NEED) {
    const lv = f ? levelOfMarketFeature(f) : 1;
    if (!M.lines.some((l) => l.kind === kind && l.level <= lv)) err(`market: need a "${kind}" vendor line at level ≤ ${lv}`);
  }
  for (const r of M.stockReactions)
    for (const ing of S.market.goods) {
      const id = data.ingText.get(ing.ingredient)?.word;
      const txt = id ? fill(r.text, { ing: wordMarkup(data, id) }) : null;
      if (!txt) err(`market stockReaction ${r.id}: cannot fill (placeholder {ing})`);
      else checkText(`market stockReaction ${r.id}`, txt);
    }
  if (!M.stockReactions.length) err('market: need at least one stockReaction');

  // --- market days: every planned day is solvable with what is on the shelf and the purse
  const maxStage = Math.max(...data.stages.map((s) => s.stage));
  let marketDays = 0;
  for (const lv of S.market.levels) {
    for (let stage = 1; stage <= maxStage; stage++) {
      for (let seed = 1; seed <= 6; seed++) {
        const rng = makeRng(seed * 101 + stage * 7 + lv.level);
        const p = newProgress(data.lang);
        p.stage = stage;
        p.day = 10;
        p.town.marketRuns = lv.minRuns;
        p.town.money = 500;
        // A queue drawn from the authored orders unlocked at this stage.
        const orders = data.content.orders.filter((o) => o.stage <= stage);
        const queue = Array.from({ length: 6 }, () => authoredInstance(data, pick(rng, orders)));
        const md = planMarket(data, p, queue, rng);
        if (!md) continue;
        marketDays++;
        const where = `market day (level ${lv.level}, stage ${stage}, seed ${seed})`;
        const shelf = new Set(ingredientsAtStage(data, stage));
        for (const l of md.lines) if (!shelf.has(l.good)) err(`${where}: note asks for ${l.good}, not on the shelf`);
        for (const t of [md.title, ...md.lines.map((l) => l.text), ...md.tips]) checkText(where, t);
        for (const st of md.stalls)
          for (const o of st.offers) {
            if (moneyText(town, o.price) === null) err(`${where}: price ${o.price} has no number words`);
            for (let u = 1; u <= maxUnits(o); u++) if (moneyText(town, u * o.price) === null) err(`${where}: total ${u * o.price} has no number words`);
          }
        p.townDay = { day: p.day, segments: ['market', 'shop'], seg: 0, notes: [], stock: {}, moneyStart: p.town.money, market: md };
        solveMarket(data, p, rng);
        for (const t of md.talk) if (t.who === 'vendor') checkText(where, t.text);
        // also the stall greetings of stalls the solver did not visit
        finishMarket(data, p);
        for (const l of md.lines) if (!lineCovered(l, p.townDay.stock)) err(`${where}: «${l.text}» cannot be bought (solver failed)`);
      }
    }
  }

  // --- delivery text
  const D = T.delivery;
  const dS = S.delivery;
  const allowedPh: Record<string, string[]> = { dest: ['p'], period: [], at: ['n', 'pp'], give: ['p'], giveNot: ['p', 'q'] };
  for (const [rel, pats] of Object.entries(D.dest))
    for (const pat of pats) for (const ph of placeholders(pat)) if (!allowedPh.dest.includes(ph)) err(`delivery dest.${rel}: unknown placeholder {${ph}}`);
  for (const k of ['at', 'before', 'after'] as const)
    for (const pat of D.time[k]) for (const ph of placeholders(pat)) if (!allowedPh.at.includes(ph)) err(`delivery time.${k}: unknown placeholder {${ph}}`);
  for (const pat of D.give) for (const ph of placeholders(pat)) if (!allowedPh.give.includes(ph)) err(`delivery give: unknown placeholder {${ph}}`);
  for (const pat of D.giveNot) for (const ph of placeholders(pat)) if (!allowedPh.giveNot.includes(ph)) err(`delivery giveNot: unknown placeholder {${ph}}`);
  // every reachable destination / time / person / knock / absent phrase
  const rels = relationsFor(deliveryFeatures(dS, dS.levels.length));
  for (const c of dS.map)
    if (c.landmark)
      for (const rel of rels) {
        if (!resolveDest(dS.map, rel, c.landmark)) continue;
        const txts = partTexts(data, town, { dest: { rel, landmark: c.landmark } }, 'dest');
        if (!txts) err(`delivery: no text for destination ${rel} ${c.landmark}`);
        else txts.forEach((t) => checkText(`delivery dest ${rel} ${c.landmark}`, t));
      }
  for (const s of dS.slots) {
    for (const kind of ['at', 'before', 'after'] as const) {
      if (numberTextMissing(town, clockNumber(s.hour))) err(`delivery: no number words for ${clockNumber(s.hour)} o'clock`);
      const txts = partTexts(data, town, { dest: { rel: 'at', landmark: 'school' }, time: { kind, hour: s.hour } }, 'time');
      if (!txts) err(`delivery: no text for time ${kind} ${s.hour}`);
      else txts.forEach((t) => checkText(`delivery time ${kind} ${s.hour}`, t));
    }
    const txts = partTexts(data, town, { dest: { rel: 'at', landmark: 'school' }, time: { kind: 'period', period: s.period } }, 'time');
    if (!txts) err(`delivery: no text for period ${s.period}`);
    else txts.forEach((t) => checkText(`delivery time ${s.period}`, t));
  }
  for (const a of dS.persons)
    for (const b of [undefined, ...dS.persons.filter((x) => x.id !== a.id)]) {
      const spec: SlipSpec = { dest: { rel: 'behind', landmark: 'bank' }, give: a.id, avoid: b?.id };
      const txts = partTexts(data, town, spec, 'give');
      if (!txts) err(`delivery: no text for give ${a.id}${b ? ' not ' + b.id : ''}`);
      else txts.forEach((t) => checkText('delivery give', t));
      for (const r of D.reactions) {
        const txt = fill(r.text, reactionValues(data, town, spec));
        if (txt) checkText(`delivery reaction ${r.id}`, txt);
      }
    }
  for (const k of [2, 3]) {
    const txts = partTexts(data, town, { dest: { rel: 'behind', landmark: 'bank' }, knocks: k }, 'knock');
    if (!txts) err(`delivery: no text for ${k} knocks`);
    else txts.forEach((t) => checkText('delivery knock', t));
  }
  for (const a of ['door', 'neighbour'] as const) {
    const txts = partTexts(data, town, { dest: { rel: 'behind', landmark: 'bank' }, absent: a }, 'absent');
    if (!txts) err(`delivery: no text for absent=${a}`);
    else txts.forEach((t) => checkText('delivery absent', t));
  }
  const rIds = new Set<string>();
  for (const r of D.reactions) {
    if (rIds.has(r.id)) err(`delivery reaction ${r.id}: duplicate id`);
    rIds.add(r.id);
    for (const ph of placeholders(r.text)) if (ph !== 'p' && ph !== 'q') err(`delivery reaction ${r.id}: unknown placeholder {${ph}}`);
    if (placeholders(r.text).includes('q') && r.kind !== 'avoided_person') warn(`delivery reaction ${r.id}: {q} is only filled when the slip names someone to avoid`);
  }
  for (const [kind, f] of DELIVERY_NEED) {
    const lv = f ? levelOfDeliveryFeature(f) : 1;
    if (!D.reactions.some((r) => r.kind === kind && r.level <= lv && (kind !== 'perfect' && kind !== 'any_fail' ? true : !placeholders(r.text).length)))
      err(`delivery: need a "${kind}" reaction at level ≤ ${lv}${kind === 'perfect' || kind === 'any_fail' ? ' without placeholders' : ''}`);
  }
  if (!D.recipients.length) err('delivery: need recipients');

  // --- curriculum + generated slips per level
  let slips = 0;
  const p0 = newProgress(data.lang);
  for (const s of dS.curriculum) {
    const lines = writeSlip(data, p0, town, s, makeRng(1));
    if (!lines) err(`delivery curriculum ${s.id}: cannot be written in ${data.lang}`);
    else lines.forEach((l) => checkText(`delivery curriculum ${s.id}`, l.text));
    slips++;
  }
  for (const lv of dS.levels) {
    const feats = deliveryFeatures(dS, lv.level);
    let ok = 0;
    for (let seed = 1; seed <= 40; seed++) {
      const rng = makeRng(seed * 31 + lv.level);
      const spec = generateSpec(dS, feats, rng);
      if (!spec) continue;
      const lines = writeSlip(data, p0, town, spec, rng);
      const where = `delivery generated slip (level ${lv.level}, seed ${seed})`;
      if (!lines) {
        err(`${where}: cannot be written`);
        continue;
      }
      ok++;
      slips++;
      lines.forEach((l) => checkText(where, l.text));
      const rule = ruleFor(dS, spec)!;
      if (rule.slots && !rule.slots.length) err(`${where}: no time slot fits`);
      const home = spec.absent ? spec.home !== false : true;
      if (evaluateDelivery(rule, witnessChoice(rule, home, dS.slots), home).outcome !== 'perfect') err(`${where}: not solvable`);
      if (slotsFor(dS.slots, spec.time)?.length === dS.slots.length) warn(`${where}: time allows every slot`);
    }
    if (!ok) err(`delivery level ${lv.level}: no slip could be generated`);
  }
  return { marketDays, deliverySlips: slips };
}

function numberTextMissing(town: Town, n: number): boolean {
  return !town.text.numberText[n];
}
