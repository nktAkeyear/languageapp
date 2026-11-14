/**
 * Near-miss reply options for the reply-choice templates (respond `mode: 'choose'` over a QA bank).
 *
 * A wrong option taken from another topic ("It is six coins." under a question about opening hours) is
 * rejected without reading; the useful wrong options are the ones on the same topic that get one fact
 * wrong — the date, the amount, the person, the condition. In order of preference:
 *
 * 1. `QaItem.near`: near misses written for the item by the content author;
 * 2. derived near misses: the answer with one fact it *echoes from the message* changed — a weekday,
 *    a month, a clock time, an amount of money or a percentage, a person's name, morning ↔ afternoon ↔
 *    evening, single ↔ double. Only echoed facts are changed (the message says Friday, the answer repeats
 *    Friday): the changed answer then contradicts the message, so it is wrong for a reason the player can
 *    read. A fact after a range word ("before Friday", "after three", "until 8:00", "within 30 days") is
 *    changed only when the message has the same range word before it (a restated rule): "finish it before
 *    Thursday" would still keep a Friday deadline, so it is never offered as wrong. Counts ("two rooms")
 *    are not changed either (three free rooms still answer "do you have two?");
 * 3. only when there are fewer than two of those: answers of other functions from the same bank (the old
 *    behaviour). With two near misses and room for three wrong slips, the choice has three slips, not four.
 */
import { shuffle, type Rng } from '../core/rng';
import type { QaItem } from './types';

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
/** Word swaps that turn an echoed fact around (both directions). */
const SWAPS: [string, string[]][] = [
  ['morning', ['afternoon', 'evening']],
  ['afternoon', ['morning', 'evening']],
  ['evening', ['morning', 'afternoon']],
  ['single', ['double']],
  ['double', ['single']],
  ['upstairs', ['downstairs']],
  ['downstairs', ['upstairs']],
];

/** Words that make what follows a range, not a point ("before Friday" is also true of Thursday). */
const RANGE = ['before', 'after', 'until', 'till', 'by', 'within', 'over', 'under', 'than', 'least', 'most', 'from', 'up to', 'no later than'];

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const wordRe = (w: string, flags = 'g') => new RegExp(`(?<![A-Za-z{|])${esc(w)}(?![A-Za-z|}])`, flags);
const has = (text: string, w: string) => wordRe(w, '').test(text);

/** The word before an occurrence (articles skipped), lowercase. */
function wordBefore(text: string, index: number): string {
  const words = text.slice(0, index).toLowerCase().match(/[a-z]+/g) ?? [];
  let i = words.length - 1;
  while (i >= 0 && ['the', 'a', 'an', 'on', 'at', 'of', 'next'].includes(words[i]) && i > words.length - 3) i--;
  return words[i] ?? '';
}

/**
 * May the fact `tok` (as it stands in the answer) be changed? Not when it stands after a range word, unless the
 * message has the same range word before the same fact (the answer restates a rule).
 */
function pointFact(q: string, a: string, tok: string): boolean {
  const re = new RegExp(`(?<![A-Za-z0-9{|$])${esc(tok)}(?![A-Za-z0-9|}])`, 'g');
  const before = (t: string) => [...t.matchAll(re)].map((m) => wordBefore(t, m.index ?? 0));
  const qb = before(q);
  return before(a).every((w) => !RANGE.includes(w) || qb.includes(w));
}

/** Neighbouring values of a number written with digits, in the same format ("$2,000", "20%", "8:30", "7731"). */
function numberNeighbours(tok: string): string[] {
  const time = /^(\d{1,2}):(\d{2})$/.exec(tok);
  if (time) {
    const h = Number(time[1]);
    return [h + 1, h - 1].filter((x) => x >= 1 && x <= 12).map((x) => `${x}:${time[2]}`);
  }
  const m = /^(\$?)(\d[\d,]*)(%?)$/.exec(tok);
  if (!m) return [];
  const n = Number(m[2].replace(/,/g, ''));
  if (!Number.isFinite(n)) return [];
  const comma = m[2].includes(',') || n >= 10000;
  const fmt = (x: number) => `${m[1]}${comma ? x.toLocaleString('en-US') : String(x)}${m[3]}`;
  let cands: number[];
  if (n >= 1000 && n % 100 === 0 && String(n).length <= 6 && !/^\d{4}$/.test(m[2])) cands = [n * 2, n / 2];
  else if (n >= 1000) cands = [n + 1, n - 1, n + 10];
  else if (n >= 100) cands = [n + 100, n - 100, n * 2];
  else if (n >= 20) cands = n % 10 === 0 ? [n + 10, n - 10, n * 2] : [n + 1, n - 1, n + 10];
  else if (n >= 2) cands = [n + 1, n - 1, n * 2];
  else cands = [n + 1, n + 2];
  return cands.filter((x) => x > 0 && Number.isInteger(x) && x !== n).map(fmt);
}

function namesIn(text: string): string[] {
  return [...text.matchAll(/\{([^|{}]+)\|@\}/g)].map((x) => x[0]);
}

/**
 * Near misses derived from the answer by changing one fact it echoes from the message (see the header).
 * `names` is the pool of other people's names (markup `{Ms. Weber|@}`) a changed name may come from.
 */
export function deriveNear(qa: Pick<QaItem, 'q' | 'a'>, names: string[] = []): string[] {
  const { q, a } = qa;
  const out: string[] = [];
  const push = (s: string) => {
    if (s !== a && !out.includes(s)) out.push(s);
  };
  const swapAll = (from: string, to: string) => a.replace(wordRe(from), to);
  // weekdays and months: another one the message does not mention
  for (const cls of [WEEKDAYS, MONTHS])
    for (const w of cls)
      if (has(q, w) && has(a, w) && pointFact(q, a, w)) {
        const i = cls.indexOf(w);
        for (const alt of [cls[(i + 1) % cls.length], cls[(i + cls.length - 1) % cls.length]]) if (!has(q, alt) && !has(a, alt)) push(swapAll(w, alt));
      }
  // numbers in digits: clock times, money, percentages, and other numbers only where restated after the same
  // word ("within 30 days" in both); a bare count is left alone
  const NUM = /\$?\d[\d,]*(?::\d{2})?%?(?:\s+coins?)?/g;
  const qNums = new Set((q.match(NUM) ?? []).map((x) => x.replace(/\s+coins?$/, '')));
  for (const raw of new Set(a.match(NUM) ?? [])) {
    const tok = raw.replace(/\s+coins?$/, '');
    if (!qNums.has(tok) || !pointFact(q, a, tok)) continue;
    const money = tok.startsWith('$') || tok.endsWith('%') || /coins?$/.test(raw) || tok.includes(':');
    if (!money) {
      const re = new RegExp(`(?<![A-Za-z0-9])${esc(tok)}(?![0-9])`, 'g');
      const qb = [...q.matchAll(re)].map((m) => wordBefore(q, m.index ?? 0));
      const ab = [...a.matchAll(re)].map((m) => wordBefore(a, m.index ?? 0));
      if (!ab.every((w) => w && qb.includes(w))) continue;
    }
    for (const alt of numberNeighbours(tok)) if (!qNums.has(alt) && !a.includes(alt)) push(a.split(tok).join(alt));
  }
  // a person named in both: someone else
  const qn = namesIn(q);
  for (const n of namesIn(a))
    if (qn.includes(n))
      for (const alt of names.filter((x) => x !== n && !qn.includes(x)).slice(0, 2)) push(a.split(n).join(alt));
  // the part of the day, the kind of room
  for (const [w, alts] of SWAPS) if (has(q, w) && has(a, w) && pointFact(q, a, w)) for (const alt of alts) if (!has(q, alt) && !has(a, alt)) push(swapAll(w, alt));
  return out;
}

/** The names (markup) used anywhere in a bank: the pool a changed name comes from. */
export function bankNames(bank: QaItem[]): string[] {
  const s = new Set<string>();
  for (const x of bank) for (const n of [...namesIn(x.q), ...namesIn(x.a)]) s.add(n);
  return [...s];
}

/** Near misses available for an item (authored first, then derived), without the answer itself. */
export function nearMisses(qa: QaItem, bank: QaItem[]): string[] {
  const out: string[] = [];
  for (const s of [...(qa.near ?? []), ...deriveNear(qa, bankNames(bank))]) if (s !== qa.a && !out.includes(s)) out.push(s);
  return out;
}

/**
 * The wrong options of a reply choice: near misses of the item (authored ones always among them, derived
 * ones next, at most `need`); only when an item has fewer than two, answers of other functions from the same
 * bank make up the number.
 */
export function qaDistractors(qa: QaItem, bank: QaItem[], need: number, rng: Rng): string[] {
  const authored = shuffle(rng, (qa.near ?? []).filter((s) => s !== qa.a));
  const derived = shuffle(
    rng,
    deriveNear(qa, bankNames(bank)).filter((s) => !authored.includes(s)),
  );
  const out: string[] = [];
  for (const s of [...authored, ...derived]) if (out.length < need && !out.includes(s)) out.push(s);
  // Two near misses are enough: fewer slips, all on the topic, rather than one that gives itself away.
  if (out.length >= 2) return out;
  if (out.length < need)
    for (const o of shuffle(rng, bank.filter((x) => x.fn !== qa.fn && x.a !== qa.a))) if (out.length < need && !out.includes(o.a) && o.a !== qa.a) out.push(o.a);
  return out;
}
