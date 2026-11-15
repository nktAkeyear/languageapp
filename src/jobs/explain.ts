/**
 * What was off, said in the target language from the task's own facts (no verdicts).
 *
 * The game never marks an answer right or wrong; the person's reaction says what is off — "I said Thursday, not
 * Wednesday.", "The date is May 6 here, but May 9 on the order.", "But I asked: “What time do you close on Friday?”".
 * Content reaction lines are shared by every task of a kind, so on their own they can only say "that is not right";
 * these lines are built from the task (its papers, its message, the reply the player chose) and the player's own
 * answer (`JobIssue.got` / `want`), so a player can learn from every mistake. The content's lines remain the
 * fallback (and give the person's face); the validator counts where a mistake gets no line of its own.
 *
 * Pure: no state, no randomness (the engine picks among the lines).
 */
import type { GameData } from '../core/gamedata';
import { fieldInText } from './fieldText';
import { thingAgreement } from './templates';
import type { CheckDoc, JobContent, JobIssue, RespondSpec, TaskInstance, ThingDef } from './types';

/** Words of a text without markup or punctuation, lowercased (for comparing replies). */
function words(t: string): string[] {
  return t
    .replace(/\{([^{}|]+)\|[^{}]*\}/g, '$1')
    .toLowerCase()
    .split(/[^a-z0-9$%:.'’-]+/)
    .map((w) => w.replace(/^[.'’-]+|[.'’-]+$/g, ''))
    .filter(Boolean);
}

/** Raw tokens of a text with their markup kept (so a name stays `{Mr. Grant|@}`), split on spaces. */
function rawTokens(t: string): string[] {
  const out: string[] = [];
  let cur = '';
  let depth = 0;
  for (const ch of t) {
    if (ch === '{') depth++;
    if (ch === '}') depth--;
    if (ch === ' ' && depth === 0) {
      if (cur) out.push(cur);
      cur = '';
    } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}

const norm = (w: string) => w.replace(/\{([^{}|]+)\|[^{}]*\}/g, '$1').toLowerCase().replace(/^[^a-z0-9$]+|[^a-z0-9%]+$/g, '');
const strip = (s: string) => s.replace(/^[\s,;:.!?“”"']+|[\s,;:.!?“”"']+$/g, '');

/**
 * The part where two replies differ when they say the same thing with one fact changed ("on Thursday" /
 * "on Wednesday", "4 5 8 2" / "4 5 2 8"): the differing spans (raw text, markup kept), or null when they differ
 * in more than a few words.
 */
export function factDiff(right: string, wrong: string, max = 4, isVerb: (w: string) => boolean = () => false): { right: string; wrong: string } | null {
  const a = rawTokens(right);
  const b = rawTokens(wrong);
  let i = 0;
  while (i < a.length && i < b.length && norm(a[i]) === norm(b[i])) i++;
  let j = 0;
  while (j < a.length - i && j < b.length - i && norm(a[a.length - 1 - j]) === norm(b[b.length - 1 - j])) j++;
  const ra = a.slice(i, a.length - j);
  const rb = b.slice(i, b.length - j);
  if (!ra.length || !rb.length || ra.length > max || rb.length > max) return null;
  const r = strip(ra.join(' '));
  const w = strip(rb.join(' '));
  if (!r || !w || norm(r) === norm(w)) return null;
  // Only a fact reads well as "X, not Y": a number, an amount, a time, a day or month, a name, a place with a
  // capital — not a changed verb form or a reworded clause (those get the line of the message quoted instead).
  const fact = (x: string) => FACT_WORD.test(x) || (i > 0 && CAP.test(x));
  // one fact, not a list or a second clause ("1:30, or before 12:30")
  if ([r, w].some((x) => /,|;|\b(or|and|but)\b/i.test(x))) return null;
  if (/^(yes|no|of course|sure|certainly)\b/i.test(r) || /^(yes|no|of course|sure|certainly)\b/i.test(w)) return null;
  if (!fact(r) || !fact(w)) return null;
  // A changed verb ("will leave tomorrow" / "left yesterday") is grammar, not a fact to set straight.
  if ([...ra, ...rb].some((t) => !t.startsWith('{') && isVerb(norm(t)))) return null;
  return { right: r, wrong: w };
}

const CAP = /(^|\s)[A-Z][a-z]/;
const FACT_WORD = /\d|\$|\{[^{}|]+\|@\}|\b(one|two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|thirty|forty|fifty|hundred|thousand|first|second|third|half|morning|afternoon|evening|night|noon|today|tomorrow|yesterday|week|month|year|percent)\b/i;

const overlap = (a: string[], b: Set<string>) => a.filter((w) => w.length > 2 && b.has(w)).length;
const STOP = new Set(['the', 'and', 'you', 'your', 'are', 'is', 'can', 'will', 'yes', 'not', 'for', 'please', 'that', 'this', 'with', 'have', 'has', 'was', 'our', 'his', 'her', 'their', 'them', 'there', 'but', 'from', 'all']);
const content = (t: string) => words(t).filter((w) => !STOP.has(w));

/** How the message came, for "I said …" / "The caller said …" / "The letter says …". */
function source(spec: RespondSpec, boss: boolean): { said: string; asked: string; look: string } {
  switch (spec.msg.kind) {
    case 'speech':
      return boss ? { said: 'They said', asked: 'They asked', look: 'But they said' } : { said: 'I said', asked: 'But I asked', look: 'But I said' };
    case 'phone':
      return { said: 'The caller said', asked: 'The caller asked', look: 'But the caller said' };
    case 'letter':
      return { said: 'The letter says', asked: 'The letter asks', look: 'But the letter says' };
    case 'email':
      return { said: 'The email says', asked: 'The email asks', look: 'But the email says' };
    case 'memo':
      return { said: 'It says', asked: 'The question is', look: 'But look' };
  }
}

const quote = (s: string) => `“${strip(s)}${/[.?!]$/.test(s.trim()) ? s.trim().slice(-1) : '.'}”`;

/** The line of the message that best supports `right` against `wrong` (most shared words with it, fewest with the wrong one). */
function supportingLine(lines: string[], right: string, wrong: string): string | null {
  const r = new Set(content(right));
  const w = new Set(content(wrong));
  let best: { s: number; l: string } | null = null;
  for (const l of lines) {
    const ws = content(l);
    const s = overlap(ws, r) * 2 - overlap(ws, w) * 0.5;
    if (s > 0 && (!best || s > best.s)) best = { s, l };
  }
  return best?.l ?? null;
}

/** The question in a message (the last sentence ending in "?"). */
function questionIn(lines: string[]): string | null {
  // Names in markup and titles keep their dots ("{Mrs. Wren|@}", "Dr."): protected while splitting into sentences.
  const keep: string[] = [];
  const prot = (l: string) => l.replace(/\{[^{}]*\}|\b(Mr|Mrs|Ms|Dr|St)\./g, (m) => `\u0000${keep.push(m) - 1}\u0001`);
  const back = (l: string) => l.replace(/\u0000(\d+)\u0001/g, (_, i) => keep[Number(i)]);
  const qs = lines.flatMap((l) => prot(l).match(/[^.?!]*\?/g) ?? []).map((x) => back(x).trim()).filter((x) => x.length > 3);
  return qs.length ? qs[qs.length - 1] : null;
}

function replyLines(data: GameData, spec: RespondSpec, inst: TaskInstance, boss: boolean, got: string, want: string): string[] {
  const src = source(spec, boss);
  // A sentence with a gap: the sentence as it reads with the word that fits.
  const gap = spec.msg.lines.find((l) => /_{3,}/.test(l));
  if (gap && want.length <= 40) return [`It reads: ${quote(gap.replace(/_{3,}/, strip(want)))}`];
  const msgText = [...spec.msg.lines, ...(spec.msg.kind === 'speech' && inst.say ? [inst.say] : [])];
  const msgWords = new Set(msgText.flatMap(words));
  const verb = (w: string) => {
    const t = data.tokens(w).find((x) => x.id);
    const e = t?.id ? data.lex.byId.get(t.id) : undefined;
    return e?.pos === 'verb' && !/^(is|are|was|were|be)$/.test(w);
  };
  const d = factDiff(want, got, 4, verb);
  if (d) {
    const inMsg = words(d.right).every((w) => msgWords.has(w) || STOP.has(w));
    if (inMsg) return [`${src.said} ${d.right}, not ${d.wrong}.`];
    return [`It is ${d.right}, not ${d.wrong}.`];
  }
  const yes = (t: string) => /^\s*(yes|certainly|of course|sure)\b/i.test(t);
  const no = (t: string) => /^\s*no\b/i.test(t);
  const flip = (yes(want) && no(got)) || (no(want) && yes(got));
  const wantW = content(want);
  const gotW = content(got);
  // The question: in the message itself, or asked by the one who handed it over / said it ("What does the supplier want?").
  const qMsg = spec.msg.kind === 'speech' ? null : questionIn(spec.msg.lines);
  const qSay = !inst.handover && inst.say && /\?/.test(inst.say) ? questionIn([inst.say]) : null;
  const q = qMsg ?? qSay ?? (spec.msg.kind === 'speech' ? questionIn(spec.msg.lines) : null);
  const askedQ = qMsg ? src.asked : 'But I asked';
  const related = overlap(gotW, new Set([...wantW, ...(q ? content(q) : [])])) > 0;
  if (!flip && !related && q) return [`${askedQ}: ${quote(q)}`];
  const line = supportingLine(msgText, want, got);
  if (line && (!q || strip(line) !== strip(q))) return [`${src.look}: ${quote(line)}`];
  if (q) return [`${askedQ}: ${quote(q)}`];
  // A request that is not a question ("My room is too hot."): said back as it was said.
  const req = spec.msg.kind === 'speech' ? (inst.say || spec.msg.lines.join(' ')) : spec.msg.lines.join(' ');
  if (req && req.length <= 140) return [`${src.look}: ${quote(req)}`];
  return [];
}

/** A paper by its title, with its article: "the order", "my form", "the ID card"; "the other paper" when the title is not a plain name. */
function docName(d: CheckDoc | undefined, data?: GameData, fallback = 'the other paper'): string {
  const raw = d?.title?.trim();
  const t = raw?.replace(/\{([^{}|]+)\|[^{}]*\}/g, '$1');
  if (!raw || !t || t.length > 24 || /[0-9#:]/.test(t) || t.split(' ').length > 3) return fallback;
  const low = fieldInText(raw);
  if (/line$/.test(low) || (data && !labelIsNoun(data, raw))) return fallback;
  return /^(my|your|his|her|our|their)\b/i.test(low) ? low : `the ${low}`;
}

/** Does a paper's label read as a noun after "the" ("the address", "the date of birth"; not "the valid until", "the use on")? */
function labelIsNoun(data: GameData, label: string): boolean {
  if (/\|@\}/.test(label)) return true;
  const toks = data.tokens(label).filter((t) => t.id);
  if (!toks.length) return false;
  const pos = toks.map((t) => data.lex.byId.get(t.id!)?.pos ?? 'noun');
  if (pos[pos.length - 1] !== 'noun') return false;
  return toks.every((t, i) => pos[i] === 'noun' || pos[i] === 'adj' || (pos[i] === 'prep' && /^of$/i.test(t.text)));
}

const LONG = 36;

/** Lines for a check (a paper against the others). */
function checkLines(data: GameData, inst: TaskInstance, issue: JobIssue): string[] {
  const spec = inst.spec;
  if (spec.arch !== 'check') return [];
  const target = spec.docs[spec.target];
  const others = spec.docs.filter((_, i) => i !== spec.target);
  const fieldOf = (id?: string) => target?.fields?.find((f) => f.id === id);
  const otherWith = (id?: string) => others.find((d) => d.fields?.some((f) => f.id === id));
  const otherVal = (id?: string) => otherWith(id)?.fields?.find((f) => f.id === id)?.value;
  const name = (id?: string) => docName(otherWith(id) ?? others[0], data);
  // "the order says", "the prices say"
  const says = (n: string) => (/[^s]s$/.test(n) && !/news$/.test(n) ? `${n} say` : `${n} says`);
  // "The address is 9 Station Road" for a noun label; "Valid until: May 3" for one that is not.
  // a value read out in running text: "the library", not "The library" (names and places keep their capitals)
  const val = (v: string) => v.replace(/^(The|A|An)\b/, (m) => m.toLowerCase());
  const isAre = (label: string) => (/[^s]s$/i.test(label.replace(/\{([^{}|]+)\|[^{}]*\}/g, '$1').trim()) ? 'are' : 'is');
  const is = (label: string, v: string) => (labelIsNoun(data, label) ? `The ${fieldInText(label)} ${isAre(label)} ${val(v)}` : `${strip(label)}: ${val(v)}`);
  const lookAt = (label: string) => (labelIsNoun(data, label) ? `Look at the ${fieldInText(label)}.` : `Look at “${strip(label)}”.`);
  switch (issue.kind) {
    case 'missed': {
      const f = fieldOf(issue.field);
      if (!f) return [];
      const right = spec.fix ?? otherVal(f.id);
      if (right && right.length <= LONG && f.value.length <= LONG && norm(right) !== norm(f.value)) return [`${is(f.label, f.value)} here, but ${val(right)} on ${name(f.id)}.`];
      return [`${lookAt(f.label)} It is not what ${says(name(f.id))}.`];
    }
    case 'false_alarm': {
      const f = fieldOf(issue.field);
      if (!f) return [`Every line agrees with ${name()}.`];
      if (f.value.length <= LONG) return [`${is(f.label, f.value)}, and ${says(name(f.id))} the same.`];
      return [`${lookAt(f.label)} It says the same as ${name(f.id)}.`];
    }
    case 'wrong_field': {
      const x = fieldOf(issue.item);
      const y = fieldOf(issue.field);
      if (!y) return [];
      if (x && x.value.length <= LONG) return [`${is(x.label, x.value)}, the same as on ${name(x.id)}. ${lookAt(y.label)}`];
      return [`That line agrees with ${name()}. ${lookAt(y.label)}`];
    }
    case 'wrong_fix': {
      const f = fieldOf(issue.field);
      const right = issue.want ?? spec.fix;
      if (!f || !right || !issue.got) return [];
      const src = says(name(f.id));
      const Src = src[0].toUpperCase() + src.slice(1);
      if (right.length <= LONG && issue.got.length <= LONG) return [`${Src} ${right}, not ${issue.got}.`];
      return [`${Src}: ${quote(right)}`];
    }
  }
  return [];
}

/** Lines for a reply, a message pad or a slot on the calendar / floor plan. */
function respondLines(data: GameData, inst: TaskInstance, issue: JobIssue, boss: boolean): string[] {
  const spec = inst.spec;
  if (spec.arch !== 'respond') return [];
  const src = source(spec, boss);
  if (issue.kind === 'wrong_reply' && issue.got && issue.want) return replyLines(data, spec, inst, boss, issue.got, issue.want);
  if (issue.kind === 'wrong_form') {
    const f = spec.fields?.find((x) => x.id === issue.field);
    const got = issue.got ?? '';
    if (!f) return [];
    if (!got) return [`${src.said} ${f.answer}. Please write it on the “${f.label}” line.`];
    return [`${src.said} ${f.answer}, not ${got}.`];
  }
  if (issue.kind === 'wrong_slot' && spec.slot && issue.got) {
    const cell = spec.slot.cells.find((c) => c.id === issue.got);
    if (!cell) return [];
    const row = spec.slot.rows.find((r) => r.id === cell.row)?.label ?? '';
    const col = spec.slot.cols.find((c) => c.id === cell.col)?.label ?? '';
    const at = spec.slot.layout === 'rooms' ? `${row}, ${col}` : `${row}, ${col}`;
    if (cell.busy) return [`${strip(at)} is not free: ${strip(cell.busy)} is there.`];
    // The line of the message that rules the cell out: it names what differs between this cell and the one that
    // fits (a day, a time of day, the size of a room) — "I am away on Wednesday", "We can come only in the morning".
    const ans = spec.slot.cells.find((c) => c.id === spec.slot!.answer);
    const label = (list: { id: string; label: string }[], id: string | undefined) => list.find((x) => x.id === id)?.label ?? '';
    const diffTags = ans ? [...cell.tags.filter((t) => !ans.tags.includes(t)), ...ans.tags.filter((t) => !cell.tags.includes(t))] : cell.tags;
    const keys = [
      ...diffTags,
      ...(ans && ans.row !== cell.row ? [row, label(spec.slot.rows, ans.row)] : []),
      ...(ans && ans.col !== cell.col ? [col, label(spec.slot.cols, ans.col)] : []),
    ]
      .map(norm)
      .filter((k) => k.length > 2);
    const line = spec.msg.lines.find((l) => {
      const ws = words(l).join(' ');
      return keys.some((k) => new RegExp(`\\b${k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(ws));
    });
    if (line) return [`${strip(at)}? ${src.look}: ${quote(line)}`];
    // No single line names it ("the first day after that"): the conditions as they were given, without the greeting.
    const all = spec.msg.lines.filter((l) => !/^(dear|hello|hi)\b|^\{[^{}]*\|@\},?$|^(thank you|thanks|best|regards)\b/i.test(l.trim())).join(' ');
    if (all && all.length <= 240) return [`${strip(at)}? ${src.look}: ${quote(all)}`];
    return [];
  }
  return [];
}

/** Lines for the post counter. */
function tradeLines(data: GameData, jc: JobContent, inst: TaskInstance, issue: JobIssue): string[] {
  const spec = inst.spec;
  if (spec.arch !== 'trade') return [];
  const th = issue.thing ? (jc.things.find((t) => t.id === issue.thing) as ThingDef | undefined) : undefined;
  if (issue.kind === 'wrong_goods' && th) {
    const want = spec.want.find((w) => w.thing === th.id)?.n ?? 0;
    const got = Number(issue.got ?? 0);
    const ag = thingAgreement(data, th, want === 1);
    if (!want) return [`I did not ask for ${thingAgreement(data, th, false).thing}.`];
    if (!got) return [`Where ${ag.is} the ${ag.thing}? I asked for ${want}.`];
    return [`I asked for ${want} ${ag.thing}, not ${got}.`];
  }
  const coins = (n: number) => `${n} ${n === 1 ? 'coin' : 'coins'}`;
  if ((issue.kind === 'change_short' || issue.kind === 'change_over') && issue.want !== undefined) {
    const w = Number(issue.want);
    const g = Number(issue.got ?? 0);
    if (issue.kind === 'change_short') return [`My change is ${coins(g)}. It should be ${coins(w)}.`];
    if (w === 0) return [`I paid the right money. I do not get any change. Here.`];
    return [`That is ${coins(g)}. My change is only ${coins(w)}. Here.`];
  }
  if (issue.kind === 'wrong_postage' && issue.want !== undefined) return [`The card says ${coins(Number(issue.want))} for this parcel, not ${coins(Number(issue.got ?? 0))}.`];
  return [];
}

/** Lines for sorting (which pile an item belongs to) and cooking (how it was cooked). */
function sortMakeLines(jc: JobContent, inst: TaskInstance, issue: JobIssue): string[] {
  const spec = inst.spec;
  if (spec.arch === 'sort' && issue.kind === 'wrong_bin') {
    const it = spec.items.find((x) => x.id === issue.item);
    const ref = (id?: string) => jc.sort?.bins.find((b) => b.id === id)?.ref;
    const want = ref(issue.want ?? it?.bin);
    const got = ref(issue.got);
    if (!it || !want) return [];
    const what = it.text.length <= 40 ? quote(it.text).replace(/[.]”$/, '”') : 'That one';
    return got ? [`${what} goes in “${want}”, not in “${got}”.`] : [`${what} goes in “${want}”.`];
  }
  if (spec.arch === 'make' && issue.kind === 'wrong_method' && issue.want) {
    const m = (id?: string) => jc.make?.methods?.find((x) => x.id === id);
    const w = m(issue.want);
    const g = m(issue.got);
    if (!w?.surface) return [];
    return g?.surface ? [`I wanted it ${w.surface}, not ${g.surface}.`] : [`I wanted it ${w.surface}.`];
  }
  return [];
}

/**
 * Lines saying what is off in this mistake, built from the task and the answer; [] when there is nothing
 * specific to say (the content's lines for the kind are used then).
 */
export function explainIssue(data: GameData, jc: JobContent, inst: TaskInstance, issue: JobIssue | null, boss: boolean): string[] {
  if (!issue) return [];
  let out: string[] = [];
  if (inst.spec.arch === 'check') out = checkLines(data, inst, issue);
  else if (inst.spec.arch === 'respond') out = respondLines(data, inst, issue, boss);
  else if (inst.spec.arch === 'trade') out = tradeLines(data, jc, inst, issue);
  else out = sortMakeLines(jc, inst, issue);
  return out.map((l) => l.replace(/\s+/g, ' ').trim());
}
