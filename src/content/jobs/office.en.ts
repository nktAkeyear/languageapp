import type { EikenKey } from '../../curriculum/yardsticks';
import type { VerificationPage } from '../../core/types';
import { POST_JOB } from './post.en';
import { KITCHEN_JOB } from './kitchen.en';
import { INN_JOB } from './inn.en';
import { jobContentTexts } from '../../jobs/vocab';
import type { AuthoredTask, CheckDoc, DocField, JobContent, JobDef, JobLexEntry, QaItem, RespondSlotCell, RespondSpec, TaskFeature, TaskTemplate } from '../../jobs/types';

/**
 * Trading company office (商会の事務): the TOEIC-oriented job. Ranks map to TOEIC 〜400 / 〜600 / 〜730 / 〜860
 * (英検 3 / 準2 / 2 / 準1).
 *
 * - check: purchase orders, delivery notes, invoices, expense notes, schedules, e-mails and adverts
 *   side by side; find the field that disagrees (rank 3+: also choose the right value).
 * - respond: a colleague's or client's words → the right reply; e-mails, memos and notices read and
 *   answered; sentence completion drafts (the word form / preposition / tense a sentence needs);
 *   phone calls written down on the message pad (rank 3+: heard only); e-mails asking for a meeting →
 *   the one free slot on the week calendar or the room plan.
 *
 * The office has a running story: the new clerk's first weeks at Marlow's; Mr. Bell and the biscuit
 * tin; Ms. Ruiz's chairs (10, then 20, then a hundred); Mr. Lin's ink, always late; Captain Reed's
 * tea shipment; Professor Hale's dictionary paper; the photocopier everybody calls Bertha; Ken the
 * student who becomes an intern; and, at the top rank, the audit, the new contract and Mr. Bell's
 * retirement party.
 *
 * Authoring notes (this job): each authored task introduces at most one or two words that are new to
 * the job, first met where a document's layout, the numbers or the consequence of a wrong action
 * makes the meaning inferable. Templates only draw on words the spine of that rank (or an earlier
 * one) has already introduced. Sentences are tagged with the grammar points (data/english/grammar.json)
 * they exercise and, where the text really contains one, with phrases (phrases.json ids).
 * New words are written in the compact table below (`lex`): `text|pos|forms|gloss|emoji|id`
 * (pos: n v a d p c r t i x). Gloss / levels / domains come from vocab.json when left empty.
 */

// ---------------------------------------------------------------------------------------------- lexicon

/** The office's first words (kept as they were: saved progress refers to these ids). */
const W = (id: string, text: string, gloss: string, pos: 'noun' | 'verb' | 'adj' | 'adv' | 'prep' | 'pron' | 'phrase', eiken: '5' | '4' | '3' | '準2' | '2' | '準1' | '1', group: string, emoji?: string, forms?: string[]): JobLexEntry => ({
  id,
  text,
  gloss,
  pos,
  eiken,
  cefr: (eiken === '5' || eiken === '4' ? 'A1' : eiken === '3' ? 'A2' : eiken === '準2' ? 'B1' : 'B2') as 'A1' | 'A2' | 'B1' | 'B2',
  group,
  ...(emoji ? { emoji } : {}),
  ...(forms ? { forms } : {}),
});

const POS: Record<string, JobLexEntry['pos']> = { n: 'noun', v: 'verb', a: 'adj', d: 'adv', p: 'prep', c: 'conj', r: 'pron', t: 'det', i: 'interj', x: 'phrase' };

/** Compact word table: `# pageId | 検証ページの見出し` opens a page; `text|pos|forms|gloss|emoji|id` is a word. */
function lex(src: string): { entries: JobLexEntry[]; pages: VerificationPage[] } {
  const entries: JobLexEntry[] = [];
  const pages: VerificationPage[] = [];
  let group = '';
  for (const raw of src.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('#')) {
      const [id, labelJa] = line.slice(1).split('|').map((s) => s.trim());
      pages.push({ id, labelJa });
      group = id;
      continue;
    }
    const [text, pos, forms, gloss, emoji, id] = line.split('|').map((s) => s.trim());
    entries.push({
      id: id || text.toLowerCase().replace(/ /g, '_').replace(/[^a-z_]/g, ''),
      text,
      pos: POS[pos] ?? 'noun',
      group,
      ...(forms ? { forms: forms.split(',').map((s) => s.trim()) } : {}),
      ...(gloss ? { gloss } : {}),
      ...(emoji ? { emoji } : {}),
    });
  }
  return { entries, pages };
}

// ---------------------------------------------------------------------------------------------- authoring helpers

type Msg = RespondSpec['msg'];
interface Meta {
  person?: string;
  features?: TaskFeature[];
  grammar?: string[];
  phrases?: string[];
  level?: EikenKey;
  weight?: number;
}

const F = (id: string, label: string, value: string): DocField => ({ id, label, value });
const D = (kind: CheckDoc['kind'], title: string, fields: DocField[], lines?: string[]): CheckDoc => ({ kind, title, ...(fields.length ? { fields } : {}), ...(lines ? { lines } : {}) });

/** check: papers side by side; `target` is the one the player checks; `wrong` the field that disagrees (or null). */
const check = (id: string, rank: number, seq: number, say: string, docs: CheckDoc[], target: number, wrong: string | null, m: Meta & { fix?: string; fixOptions?: string[] } = {}): AuthoredTask => ({ id, rank, seq, arch: 'check', say, docs, target, wrong, ...m });
/** respond / choose: a message (spoken, e-mail, memo …) → the right reply. */
const reply = (id: string, rank: number, seq: number, say: string, msg: Msg, options: string[], answer: number, m: Meta = {}): AuthoredTask => ({ id, rank, seq, arch: 'respond', mode: 'choose', say, msg, options, answer, ...m });
/** respond / form: a phone call written on the message pad. */
const pad = (id: string, rank: number, seq: number, say: string, lines: string[], fields: { id: string; label: string; options: string[]; answer: string }[], m: Meta = {}): AuthoredTask => ({ id, rank, seq, arch: 'respond', mode: 'form', say, msg: { kind: 'phone', lines }, fields, ...m });
/** respond / slot: the one free cell that fits. */
const slot = (id: string, rank: number, seq: number, say: string, msg: Msg, grid: { rows: { id: string; label: string }[]; cols: { id: string; label: string }[] }, busy: Record<string, string>, answer: string, m: Meta = {}): AuthoredTask => ({
  id,
  rank,
  seq,
  arch: 'respond',
  mode: 'slot',
  say,
  msg,
  slot: { layout: 'calendar', rows: grid.rows, cols: grid.cols, cells: cells(grid.rows, grid.cols, busy), answer },
  ...m,
});

const cells = (rows: { id: string }[], cols: { id: string }[], busy: Record<string, string>): RespondSlotCell[] =>
  rows.flatMap((r) => cols.map((c) => ({ id: `${r.id}-${c.id}`, row: r.id, col: c.id, tags: [r.id, c.id], ...(busy[`${r.id}-${c.id}`] ? { busy: busy[`${r.id}-${c.id}`] } : {}) })));

/** The week calendar of the office (rows = days, columns = times). */
const DAYS = [
  { id: 'mon', label: 'Monday' },
  { id: 'tue', label: 'Tuesday' },
  { id: 'wed', label: 'Wednesday' },
  { id: 'thu', label: 'Thursday' },
  { id: 'fri', label: 'Friday' },
];
const TIMES = [
  { id: 't9', label: '9:00' },
  { id: 't11', label: '11:00' },
  { id: 't2', label: '2:00' },
  { id: 't4', label: '4:00' },
];
const WEEK = { rows: DAYS, cols: TIMES };
/** Later ranks: half-hour times and the rooms. */
const TIMES2 = [
  { id: 't9', label: '9:30' },
  { id: 't11', label: '11:00' },
  { id: 't1', label: '1:30' },
  { id: 't3', label: '3:00' },
];
const WEEK2 = { rows: DAYS, cols: TIMES2 };
const ROOMS = [
  { id: 'r1', label: 'Room 1' },
  { id: 'r2', label: 'Room 2' },
  { id: 'r3', label: 'Room 3' },
];
const ROOMGRID = { rows: ROOMS, cols: TIMES };

// ---------------------------------------------------------------------------------------------- rank 1 (TOEIC 〜400, 英検3)
// The first weeks: order ↔ bill, dates, the week calendar, short notices, calls, simple replies.

const R1: AuthoredTask[] = [
  check('o1_first', 1, 1, 'Please check this bill. Is it the same as the order?', [D('order', 'Order', [F('item', 'Item', 'paper'), F('qty', 'Boxes', '20'), F('price', 'Price', '$4')]), D('invoice', 'Bill', [F('item', 'Item', 'paper'), F('qty', 'Boxes', '30'), F('price', 'Price', '$4')])], 1, 'qty', { grammar: ['gr-5-002'] }),
  slot('o1_meet', 1, 8, 'An email from a client. Look at the days, please.', { kind: 'email', lines: ['Dear {Ms. Park|@},', 'Can we meet on Tuesday?', 'The morning is good for me.', 'Thank you.'] }, { rows: DAYS.slice(0, 3), cols: TIMES.slice(0, 3) }, { 'mon-t9': 'Busy', 'tue-t9': 'Busy', 'wed-t11': 'Busy' }, 'tue-t11'),
  reply('o1_q1', 1, 10, 'When is the meeting?', { kind: 'speech', lines: ['When is the meeting?'] }, ['You are welcome.', 'It is on Tuesday at ten.', 'Yes, please.'], 1, { person: 'c_merchant', grammar: ['gr-5-013'] }),
  check('o1_ok', 1, 2, 'And this one, please.', [D('order', 'Order', [F('item', 'Item', 'pens'), F('qty', 'Boxes', '12'), F('price', 'Price', '$8')]), D('invoice', 'Bill', [F('item', 'Item', 'pens'), F('qty', 'Boxes', '12'), F('price', 'Price', '$8')])], 1, null),
  check('o1_total', 1, 3, 'Please check the total on this bill.', [D('order', 'Order', [F('item', 'Item', 'pens'), F('qty', 'Boxes', '3'), F('price', 'Price', '$4')]), D('invoice', 'Bill', [F('item', 'Item', 'pens'), F('qty', 'Boxes', '3'), F('price', 'Price', '$4'), F('total', 'Total', '$14')])], 1, 'total', { grammar: ['gr-5-014'] }),
  check('o1_sat', 1, 12, '{Mr. Grant|@} wants the chairs on Saturday. Is the date right?', [D('order', 'Order', [F('item', 'Item', 'chairs'), F('day', 'Day', 'Saturday')]), D('invoice', 'Bill', [F('item', 'Item', 'chairs'), F('day', 'Day', 'Friday')])], 1, 'day', { person: 'p_ruiz', grammar: ['gr-5-003'] }),
  reply('o1_open', 1, 7, 'What time does the office open?', { kind: 'speech', lines: ['What time does the office open?'] }, ['At nine in the morning.', 'It is four dollars.', 'Yes, please.'], 0, { person: 'c_merchant', grammar: ['gr-5-013'] }),
  reply('o1_hours', 1, 11, 'Is the office open on Sunday?', { kind: 'memo', lines: ['Office hours', 'Monday to Friday: 9 to 5', 'Sunday: closed'] }, ['No, we are closed on Sunday.', 'Yes, from nine to five.', 'You are welcome.'], 0, { person: 'c_merchant', grammar: ['gr-5-021'] }),
  pad('o1_back', 1, 26, 'A call for {Ms. Park|@}. Write the message, please.', ['Hello, this is {Mr. Lin|@}.', 'Please phone me today.', 'My number is 4 5 8 2.'], [
    { id: 'who', label: 'Who', options: ['{Mr. Bell|@}', '{Mr. Lin|@}', '{Ms. Ruiz|@}'], answer: '{Mr. Lin|@}' },
    { id: 'number', label: 'Number', options: ['4582', '4852', '4528'], answer: '4582' },
    { id: 'when', label: 'Phone', options: ['today', 'tomorrow', 'on Friday'], answer: 'today' },
  ], { person: 'p_park' }),
  check('o1_receipt', 1, 5, 'Please check the receipt. Is it the same as the bill?', [D('invoice', 'Bill', [F('item', 'Item', 'lunch'), F('price', 'Price', '$18')]), D('card', 'Receipt', [F('item', 'Item', 'lunch'), F('price', 'Price', '$28')], ['Please keep your receipt.'])], 1, 'price'),
  reply('o1_where', 1, 6, 'Where is {Ms. Park|@}?', { kind: 'speech', lines: ['Where is {Ms. Park|@}?'] }, ['She is in a meeting.', 'At nine in the morning.', 'It is four dollars.'], 0, { person: 'p_bell', grammar: ['gr-5-013'], phrases: ['ph-5-0089'] }),
  reply('o1_copy', 1, 14, 'Can you copy this paper, please?', { kind: 'speech', lines: ['Can you copy this paper, please?'] }, ['Thank you for your help.', 'Sure. How many copies?', 'It is on Tuesday at ten.'], 1, { person: 'p_bell', grammar: ['gr-5-015'], phrases: ['ph-5-0085'] }),
  slot('o1_wed', 1, 9, 'An email from a client. Look at the week, please.', { kind: 'email', lines: ['Dear {Ms. Park|@},', 'Can we meet on Wednesday?', 'I can come in the afternoon.', 'Thank you.'] }, WEEK, { 'mon-t9': 'Meeting', 'wed-t2': 'Meeting', 'wed-t9': 'Busy', 'thu-t2': 'Meeting', 'fri-t11': 'Busy' }, 'wed-t4'),
  check('o1_march', 1, 4, 'Is the date right?', [D('order', 'Order', [F('item', 'Item', 'paper'), F('date', 'Date', 'March 3')]), D('invoice', 'Bill', [F('item', 'Item', 'paper'), F('date', 'Date', 'March 13')])], 1, 'date'),
  pad('o1_ready', 1, 27, 'Another call. Write the message, please.', ['Hello, this is {Ms. Ruiz|@}.', 'The chairs are ready.', 'Please come on Friday.'], [
    { id: 'who', label: 'Who', options: ['{Ms. Ruiz|@}', '{Mr. Lin|@}', '{Mr. Grant|@}'], answer: '{Ms. Ruiz|@}' },
    { id: 'about', label: 'About', options: ['the chairs', 'the pens', 'the paper'], answer: 'the chairs' },
    { id: 'when', label: 'Come', options: ['on Monday', 'on Friday', 'on Sunday'], answer: 'on Friday' },
  ], { person: 'p_park' }),
  reply('o1_start', 1, 13, 'When does the meeting start?', { kind: 'speech', lines: ['When does the meeting start?'] }, ['It starts at ten.', 'In the big meeting room.', 'You are welcome.'], 0, { person: 'p_ruiz', grammar: ['gr-5-013', 'gr-5-004'] }),
  check('o1_form', 1, 18, 'Please check the name and the address on this form.', [D('order', 'Order form', [F('name', 'Name', '{Mr. Grant|@}'), F('address', 'Address', '12 Bridge Street')]), D('invoice', 'Bill', [F('name', 'Name', '{Mr. Grant|@}'), F('address', 'Address', '21 Bridge Street')])], 1, 'address'),
  slot('o1_visit', 1, 15, 'An email from a client. Look at the week, please.', { kind: 'email', lines: ['Dear {Ms. Park|@},', 'I will visit your office on Thursday morning.', 'Thank you.'] }, WEEK, { 'thu-t9': 'Meeting', 'tue-t11': 'Busy', 'wed-t11': 'Busy', 'fri-t2': 'Meeting' }, 'thu-t11', { grammar: ['gr-4-002'] }),
  check('o1_train', 1, 25, 'Is the time on the plan right?', [D('letter', 'Email', [], ['Hello. I will take the train on Monday.', 'It arrives at 9:00.']), D('note', 'Plan', [F('day', 'Day', 'Monday'), F('time', 'Time', '9:30')])], 1, 'time', { person: 'p_bell', grammar: ['gr-4-002'] }),
  reply('o1_computer', 1, 17, 'Can I use the big computer?', { kind: 'memo', lines: ['The big computer is out of order.', 'Please use the small computer.'] }, ['No. Please use the small one.', 'Yes. It is on Monday.', 'Thank you for your help.'], 0, { person: 'p_ruiz', grammar: ['gr-5-015'] }),
  check('o1_pay', 1, 19, 'Is the day to pay right?', [D('order', 'Order', [F('total', 'Total', '$40'), F('day', 'Pay by', 'March 5')]), D('invoice', 'Bill', [F('total', 'Total', '$40'), F('day', 'Pay by', 'March 15')])], 1, 'day', { person: 'p_bell' }),
  slot('o1_early', 1, 16, 'Another email. Look at the week, please.', { kind: 'email', lines: ['Dear {Ms. Park|@},', 'Can we meet on Friday morning?', 'Nine is too early for me.', 'Thank you.'] }, WEEK, { 'fri-t2': 'Meeting', 'mon-t11': 'Busy', 'thu-t9': 'Busy' }, 'fri-t11', { grammar: ['gr-3-030'] }),
  reply('o1_help', 1, 22, 'Hello. I want to speak to {Ms. Park|@}, please.', { kind: 'speech', lines: ['Hello. I want to speak to {Ms. Park|@}, please.'] }, ['It is four dollars.', 'Just a moment, please.', 'On Tuesday.'], 1, { person: 'c_sailor', grammar: ['gr-5-025'] }),
  reply('o1_late', 1, 28, 'I am sorry. I am late.', { kind: 'speech', lines: ['I am sorry. I am late.'] }, ['You are welcome.', 'It is on Friday.', 'That is all right.'], 2, { person: 'p_lin' }),
  reply('o1_busy', 1, 23, 'Hello. Can I speak to {Mr. Bell|@}?', { kind: 'phone', lines: ['Hello. Can I speak to {Mr. Bell|@}?', '{Mr. Bell|@} is busy now. Can I take a message?'] }, ['Yes, please. Tell him to phone me.', 'No, thank you. It is four dollars.', 'At nine in the morning.'], 0, { person: 'p_ruiz', grammar: ['gr-3-014'] }),
  reply('o1_lunch', 1, 29, 'Do you want to have lunch with us?', { kind: 'speech', lines: ['Do you want to have lunch with us?'] }, ['It is on Friday at ten.', 'In the big meeting room.', 'Yes, I do. Thank you.'], 2, { person: 'p_ruiz', grammar: ['gr-5-025'] }),
  reply('o1_sale', 1, 30, 'How much is a box of pens this week?', { kind: 'memo', lines: ['SALE this week!', 'Pens: $2', 'Paper: $3'] }, ['It is two dollars.', 'It is three dollars.', 'Yes, I do.'], 0, { person: 'p_ruiz', grammar: ['gr-5-014'], phrases: ['ph-5-0044'] }),
  check('o1_product', 1, 31, 'Is the price on the order the same as on the product list?', [D('card', 'Product list', [F('item', 'Product', 'tea'), F('price', 'Price', '$5')]), D('order', 'Order', [F('item', 'Item', 'tea'), F('price', 'Price', '$6')])], 1, 'price', { person: 'p_ruiz' }),
  reply('o1_team', 1, 32, 'Where is the sales team meeting?', { kind: 'memo', lines: ['Sales team meeting', 'Monday at 9:00', 'Room A'] }, ['On Monday.', 'In Room A.', 'At nine.'], 1, { person: 'p_lin', grammar: ['gr-5-013'] }),
  check('o1_plan', 1, 24, 'Is the plan the same as the calendar?', [D('note', 'Plan', [F('what', 'Meeting', 'Tuesday'), F('time', 'Time', '9:00')]), D('card', 'Calendar', [F('what', 'Meeting', 'Tuesday'), F('time', 'Time', '11:00')])], 1, 'time', { person: 'p_park' }),
  reply('o1_phone', 1, 20, 'Please phone {Mr. Grant|@}.', { kind: 'speech', lines: ['Please phone {Mr. Grant|@}.'] }, ['It is on Tuesday at ten.', 'Yes. I will phone him now.', 'You are welcome.'], 1, { person: 'p_park', grammar: ['gr-5-011', 'gr-4-002'] }),
  reply('o1_question', 1, 21, 'I have a question about the bill.', { kind: 'speech', lines: ['I have a question about the bill.'] }, ['Thank you for your help.', 'Sure. What is it?', 'It is on Friday.'], 1, { person: 'c_merchant', grammar: ['gr-5-003'] }),
  check('o1_report', 1, 33, 'Please check the report. Are the boxes the same on the bill?', [D('note', 'Sales report', [F('item', 'Item', 'paper'), F('qty', 'Boxes', '40')]), D('invoice', 'Bill', [F('item', 'Item', 'paper'), F('qty', 'Boxes', '40')])], 1, null, { person: 'p_park' }),
];

// ---------------------------------------------------------------------------------------------- lexicon
const OLD_LEX: JobLexEntry[] = [
    W('office', 'office', '事務所・会社', 'noun', '5', 'jp_off_place', '🏢', ['offices']),
    W('company', 'company', '会社', 'noun', '4', 'jp_off_place', '🏛️', ['companies']),
    W('trade', 'trade', '貿易（する）・取引', 'noun', '4', 'jp_off_place', '⚖️', ['trading', 'trades', 'traded']),
    W('manager', 'manager', '部長・責任者', 'noun', '4', 'jp_off_place', '👩‍💼', ['managers']),
    W('meeting', 'meeting', '会議・打ち合わせ', 'noun', '4', 'jp_off_meet', '🗣️', ['meetings']),
    W('meet', 'meet', '会う', 'verb', '5', 'jp_off_meet', '🤝', ['meets', 'met']),
    W('free', 'free', '空いている・暇な', 'adj', '5', 'jp_off_meet', '🟩'),
    W('busy', 'busy', '忙しい・ふさがっている', 'adj', '4', 'jp_off_meet', '🟥'),
    W('room', 'room', '部屋', 'noun', '5', 'jp_off_meet', '🚪', ['rooms']),
    W('monday', 'Monday', '月曜日', 'noun', '5', 'jp_off_days1', '🗓️'),
    W('tuesday', 'Tuesday', '火曜日', 'noun', '5', 'jp_off_days1', '🗓️'),
    W('wednesday', 'Wednesday', '水曜日', 'noun', '5', 'jp_off_days1', '🗓️'),
    W('thursday', 'Thursday', '木曜日', 'noun', '5', 'jp_off_days2', '🗓️'),
    W('friday', 'Friday', '金曜日', 'noun', '5', 'jp_off_days2', '🗓️'),
    W('may_month', 'May', '5月', 'noun', '5', 'jp_off_days2', '5️⃣'),
    W('june', 'June', '6月', 'noun', '5', 'jp_off_days2', '6️⃣'),
    W('july', 'July', '7月', 'noun', '5', 'jp_off_days2', '7️⃣'),
    W('invoice', 'invoice', '請求書（送り状）', 'noun', '1', 'jp_off_docs2', '🧾', ['invoices']),
    W('order_doc', 'order', '注文（書）', 'noun', '5', 'jp_off_docs', '📝', ['orders']),
    W('purchase', 'purchase', '購入', 'noun', '2', 'jp_off_docs2', '🛒'),
    W('delivery', 'delivery', '配達・納品', 'noun', '準2', 'jp_off_docs2', '🚚'),
    W('bill', 'bill', '勘定書・請求書', 'noun', '3', 'jp_off_docs', '💴', ['bills']),
    W('as', 'as', '〜と（同じ）・〜として', 'prep', '5', 'jp_off_place', '↔️'),
    W('note', 'note', 'メモ・伝票', 'noun', '5', 'jp_off_docs', '🗒️', ['notes']),
    W('item', 'item', '品目・品物', 'noun', '4', 'jp_off_fields', '📦', ['items']),
    W('quantity', 'quantity', '数量', 'noun', '2', 'jp_off_fields', '🔢'),
    W('unit', 'unit', '単位・1個あたり', 'noun', '4', 'jp_off_fields', '1️⃣'),
    W('date', 'date', '日付', 'noun', '5', 'jp_off_fields', '📅', ['dates']),
    W('list', 'list', '一覧表', 'noun', '4', 'jp_off_fields', '📃', ['lists']),
    W('paper', 'paper', '紙・書類', 'noun', '5', 'jp_off_goods', '📄', ['papers']),
    W('pen', 'pen', 'ペン', 'noun', '4', 'jp_off_goods', '🖊️', ['pens']),
    W('ink', 'ink', 'インク', 'noun', '準2', 'jp_off_goods', '🖋️'),
    W('chair', 'chair', '椅子', 'noun', '4', 'jp_off_goods', '🪑', ['chairs']),
    W('folder', 'folder', 'フォルダー（書類ばさみ）', 'noun', '準2', 'jp_off_goods', '🗂️', ['folders']),
    W('dollar', 'dollar', 'ドル', 'noun', '4', 'jp_off_money', '💵', ['dollars']),
    W('client', 'client', '取引先・顧客', 'noun', '2', 'jp_off_money', '🧑‍💼', ['clients']),
    W('supplier', 'supplier', '仕入れ先', 'noun', '準1', 'jp_off_money', '🏭', ['suppliers']),
    W('sales', 'sales', '営業・売り上げ', 'noun', '3', 'jp_off_money', '📈'),
    W('call', 'call', '電話（する）', 'verb', '4', 'jp_off_phone', '📞', ['calls', 'called', 'calling']),
    W('message', 'message', '伝言', 'noun', '4', 'jp_off_phone', '💬', ['messages']),
    W('speak', 'speak', '話す', 'verb', '5', 'jp_off_phone', '🗨️', ['speaks', 'spoke']),
    W('moment', 'moment', 'ちょっとの間', 'noun', '5', 'jp_off_phone', '⏱️'),
    W('email', 'email', 'メール', 'noun', '4', 'jp_off_mail', '📧', ['emails']),
    W('dear', 'dear', '（手紙で）〜様', 'adj', '4', 'jp_off_mail', '✉️'),
    W('get', 'get', '受け取る・手に入れる', 'verb', '5', 'jp_off_mail', '📥', ['gets', 'got', 'getting']),
    W('will', 'will', '〜するつもり・〜だろう', 'verb', '5', 'jp_off_mail', '🔜'),
    W('open', 'open', '開く・開いている', 'verb', '5', 'jp_off_work', '🔓', ['opens', 'opened']),
    W('change_v', 'change', '変える', 'verb', '4', 'jp_off_work', '🔁', ['changes', 'changed']),
    W('fine', 'fine', '大丈夫な・結構な', 'adj', '4', 'jp_off_work', '👍'),
    W('desk', 'desk', '机', 'noun', '5', 'jp_off_work', '🗄️', ['desks']),
    W('they', 'they', '彼ら・それら', 'pron', '5', 'jp_off_work', '👥', ['them', 'their']),
    W('about', 'about', '〜について', 'prep', '5', 'jp_off_money', '💡'),
    W('caller', 'caller', '電話をかけてきた人', 'noun', '準1', 'jp_off_phone', '☎️', ['callers']),
    W('write', 'write', '書く', 'verb', '5', 'jp_off_mail', '✍️', ['writes', 'wrote', 'writing']),
];

const OLD_PAGES: VerificationPage[] = [
    { id: 'jp_off_place', labelJa: '商会という場所' },
    { id: 'jp_off_meet', labelJa: '打ち合わせの都合' },
    { id: 'jp_off_days1', labelJa: '週のはじめの曜日' },
    { id: 'jp_off_days2', labelJa: '週の終わりと、月の名前' },
    { id: 'jp_off_docs', labelJa: '書類の名前（はじめ）' },
    { id: 'jp_off_docs2', labelJa: '書類の名前（取引）' },
    { id: 'jp_off_fields', labelJa: '書類の欄の見出し' },
    { id: 'jp_off_goods', labelJa: '事務用品' },
    { id: 'jp_off_money', labelJa: '取引の相手とお金' },
    { id: 'jp_off_phone', labelJa: '電話を受ける' },
    { id: 'jp_off_mail', labelJa: 'メールの決まり文句' },
    { id: 'jp_off_work', labelJa: '事務所の返事' },
];

const NEW_LEX_SRC = `
# jo1_0 | 事務所のことば ①（TOEIC〜400）
copy|n|copies|コピー
form|n||用紙・申込書
calendar|n||カレンダー
team|n||チーム
report|n||報告
# jo1_6 | 仕事で出会うことば ①（TOEIC〜400）
another|t||もう1つの
computer|n||コンピューター
address|n||住所
street|n||通り
polite|a||礼儀正しい
# jo1_12 | 仕事で出会うことば ②（TOEIC〜400）
number|n|numbers|数
sale|n||販売・安売り
product|n||製品
slow|a||遅い
value|n||価値
# jo2_18 | 連絡のことば ①（〜600）
envelope|n|envelopes|封筒
send|v|sent,sends|送る
regard|n|regards|（Best regards）敬具・よろしく
# jo2_22 | 勘定とお金のことば ①（〜600）
expense|n||支出
claim|n|claims|（経費などの）請求
stock|n||在庫
budget|n||予算
# jo2_27 | 仕事で出会うことば ①（〜600）
move|n|moved|動き
attach|v|attached,attaching|添付する
machine|n||機械
deadline|n||締め切り
# jo2_32 | 仕事で出会うことば ②（〜600）
urgent|a||緊急の
broken|a||壊れた
shall|v||～しましょうか
attend|v||出席する
# jo2_37 | 出張と運送のことば ①（〜600）
confirmation|n||確認
schedule|n||予定
invite|v|inviting|招待する
# jo2_41 | 出張と運送のことば ②（〜600）
driver|n||運転手
line|n||線・（電話の）回線
safely|d||安全に
# jo2_45 | つなぐことば ①（〜600）
during|p||～の間に
over|p||～の上に
quickly|d||すばやく
# jo2_49 | 売り買いのことば ①（〜600）
quote|n||見積もり
package|n||小包
receive|v|received|受け取る
available|a||利用できる
ad|n||広告
# jo3_55 | 売り買いのことば ①（〜730）
shipment|n||発送
contract|n||契約
warranty|n||保証
# jo3_59 | 売り買いのことば ②（〜730）
department|n||部署
reasonable|a||理にかなった
competitive|a||競争の
# jo3_63 | 約束と決まりのことば ①（〜730）
promise|v|promised|約束する
valid|a||有効な
inquiry|n||問い合わせ
proof|n||証拠
# jo3_68 | 勘定とお金のことば ①（〜730）
percent|n||パーセント
rate|n||料金・率
statement|n||明細書（取引の記録）
# jo3_72 | 勘定とお金のことば ②（〜730）
annual|a||年1回の
figure|n|figures|数字
accurate|a||正確な
# jo3_76 | つなぐことば ①（〜730）
whose|t||だれの
soon|d||まもなく
unfortunately|d||不幸にも
although|c||～だけれども
despite|p||～にもかかわらず
# jo3_82 | つなぐことば ②（〜730）
between|p||～の間に
among|p||～の間で
against|p||～に反対して
possibly|d||ひょっとすると
past|d||通り過ぎて
# jo3_88 | つなぐことば ③（〜730）
ahead|d||前方に
few|t|fewer|より少ない
through|p||～を通って
since|p||～以来
# jo3_93 | 人と仕事のことば ①（〜730）
personnel|n||職員
interview|n||面接
candidate|n||候補者
apply|v||申し込む
experience|n||経験
# jo3_99 | 人と仕事のことば ②（〜730）
position|n||職・地位
application|n||申し込み
employee|n|employees|従業員
employ|v||雇う
reject|v||断る
# jo3_105 | 出張と運送のことば ①（〜730）
abroad|d||海外に
south|n||南
truck|n|trucks|トラック
reserve|v|reserved|予約する
track|n|tracking|追跡する
# jo3_111 | 仕事の動詞 ①（〜730）
expect|v||予期する
fall|v|fell|落ちる
regret|v||後悔する
hope|v|hoping|望んでいる（hopeの-ing形）
begin|v|began|始める
# jo3_117 | 機械とコンピューターのことば ①（〜730）
port|n||港
install|v||取り付ける
program|n||プログラム
# jo3_121 | 仕事で出会うことば ①（〜730）
inform|v||知らせる
instruction|n|instructions|指示
patience|n||忍耐
submit|v||提出する
# jo3_126 | 様子を表すことば ①（〜730）
pleasing|a||楽しい
ideal|a||理想的な
similar|a||似ている
# jo3_130 | 様子を表すことば ②（〜730）
glad|a||うれしい
short|a||短い
proud|a||誇りに思う
# jo3_134 | 会議のことば ①（〜730）
project|n||計画
proposal|n||提案
review|v||見直す
# jo4_138 | 勘定とお金のことば ①（〜860）
auditor|n|auditors|監査人
balance|n||残高
overdue|a||期限を過ぎた
amount|n||量
cost|n|costs|費用
# jo4_144 | 勘定とお金のことば ②（〜860）
audit|n||監査
rise|v||上がる
estimate|v||見積もる
liability|n||負債
adviser|n||助言者
# jo4_150 | 勘定とお金のことば ③（〜860）
account|n|accounts|口座
transfer|v||送金する・移す
outstanding|a||未払いの
shareholder|n|shareholders|株主
# jo4_155 | 勘定とお金のことば ④（〜860）
deficit|n||不足額
inflation|n||インフレーション
retire|v|retires,retiring|引退する
strike|n||ストライキ
# jo4_160 | 会議のことば ①（〜860）
behalf|n||(on behalf of)〜のために
counter|v||対案を出す
accept|v||受け入れる
propose|v||提案する
# jo4_165 | 会議のことば ②（〜860）
approve|v||承認する
advise|v|advised|助言する
agenda|n||議題
postpone|v|postponed|延期する
# jo4_170 | 会議のことば ③（〜860）
discuss|v||話し合う
agree|v|agreed|同意する
consider|v||考慮する
# jo4_174 | つなぐことば ①（〜860）
therefore|d||したがって
whom|r||だれを
immediately|d||すぐに
most|t||ほとんどの
either|d||～もまた（～ない）
# jo4_180 | つなぐことば ②（〜860）
slightly|d||わずかに
mainly|d||おもに
while|c||～する間に
away|d||離れて
else|d||そのほかに
# jo4_186 | つなぐことば ③（〜860）
accordingly|d||従って
greatly|d||大いに
several|t||いくつかの
moreover|d||その上
# jo4_191 | 事務所のことば ①（〜860）
present|a||出席している
assistance|n||手伝い
appointment|n||約束
# jo4_195 | 事務所のことば ②（〜860）
successful|a||成功した
revise|v|revised|改訂する
summary|n||要約
# jo4_199 | 暮らしのことば ①（〜860）
period|n||期間
response|n||返事
weight|n||重さ
result|n||結果
case|n||場合
# jo4_205 | 暮らしのことば ②（〜860）
action|n||行動
pity|n||哀れみ
stage|n||段階
confusion|n||混乱
# jo4_210 | 連絡のことば ①（〜860）
reply|v|replied|答える
news|n||ニュース
announce|v||発表する
comment|n|comments|意見
contact|v||連絡をとる
# jo4_216 | 連絡のことば ②（〜860）
information|n||情報
conversation|n||会話
prompt|n||迅速な
appreciate|v|appreciated|感謝する
# jo4_221 | 様子を表すことば ①（〜860）
large|a||大きい
latest|a||最新の
unable|a||～できない
# jo4_225 | 様子を表すことば ②（〜860）
further|a||さらなる
correct|a||正しい
clear|a||明らかな
# jo4_229 | 仕事の動詞 ①（〜860）
match|v|matches|一致する
suit|v|suits|（都合に）合う
happen|v|happened|起こる
break|v||壊れる・壊す
# jo4_234 | 仕事の動詞 ②（〜860）
depend|v|depends|頼る
continue|v|continues|続ける
accord|v|according|一致する
might|v||～かもしれない
# jo4_239 | 売り買いのことば ①（〜860）
gift|n||贈り物
promote|v|promoted|昇進させる
effective|a||有効な
survey|n||調査
buyer|n|buyers|買い手
# jo4_245 | 売り買いのことば ②（〜860）
convenient|a||便利な
competitor|n|competitors|競争相手
negotiate|v|negotiating|交渉する
catalog|n||目録
quality|n||質
# jo4_251 | ものづくりのことば ①（〜860）
deliver|v||配達する
maintenance|n||維持
efficient|a||効率的な
# jo4_255 | 約束と決まりのことば ①（〜860）
term|n|terms|条件・期間
draft|n||下書き
legal|a||法律の
# jo4_259 | 約束と決まりのことば ②（〜860）
responsible|a||責任がある
damage|n||損害
clause|n||節
# jo4_263 | 出張と運送のことば ①（〜860）
arrange|v||手配する
accommodate|v||（希望に）応じる
follow|v||従う・追いかける
# jo4_267 | 機械とコンピューターのことば ①（〜860）
file|n|files|ファイル
installation|n||設置
server|n||ウェイター
system|n||システム
`;
const EXTRA_FORMS: Record<string, string[]> = {"unit": ["units"], "sign": ["signed", "signing"], "need": ["needed"], "order_doc": ["ordered", "ordering"], "say": ["saying"], "make": ["made"], "fast": ["faster"], "ship": ["shipped"], "do": ["doing"]};

// ---------------------------------------------------------------------------------------------- rank 2 (TOEIC 〜600, 英検準2)
// Purchase orders, invoices and delivery notes; expenses; e-mails and notices read and answered;
// polite requests; the first sentence-completion drafts (word form, preposition, conjunction, tense).

const R2: AuthoredTask[] = [
  pad('o2_phone1', 2, 1, 'Can you take this call, please? Write the message.', ['Hello, this is {Mr. Grant|@}.', 'Please call me back after three.', 'It is about the invoice.'], [
    { id: 'who', label: 'Caller', options: ['{Mr. Grant|@}', '{Mr. Bell|@}', '{Ms. Ruiz|@}'], answer: '{Mr. Grant|@}' },
    { id: 'when', label: 'Call back', options: ['before three', 'after three', 'tomorrow'], answer: 'after three' },
    { id: 'about', label: 'About', options: ['the invoice', 'the meeting', 'the chairs'], answer: 'the invoice' },
  ], { grammar: ['gr-4-002'] }),
  pad('o2_phone2', 2, 2, 'Another call. Write the message, please.', ['Hello, this is {Ms. Ruiz|@}.', 'I need twenty chairs, not ten.', 'Please call me today.'], [
    { id: 'who', label: 'Caller', options: ['{Mr. Lin|@}', '{Ms. Ruiz|@}', '{Mr. Grant|@}'], answer: '{Ms. Ruiz|@}' },
    { id: 'about', label: 'About', options: ['the paper', 'the chairs', 'the meeting'], answer: 'the chairs' },
    { id: 'when', label: 'Call back', options: ['today', 'tomorrow', 'after three'], answer: 'today' },
  ]),
  check('o2_inv1', 2, 3, 'Please check the invoice with the purchase order.', [
    D('order', 'Purchase Order', [F('num', 'Order number', '4512'), F('item', 'Item', 'envelopes'), F('units', 'Units', '30'), F('price', 'Unit price', '$3')]),
    D('invoice', 'Invoice', [F('num', 'Order number', '4512'), F('item', 'Item', 'envelopes'), F('units', 'Units', '30'), F('price', 'Unit price', '$5')]),
  ], 1, 'price', { person: 'p_bell' }),
  check('o2_deliv', 2, 4, 'Please check the delivery note with the purchase order.', [
    D('order', 'Purchase Order', [F('num', 'Order number', '4620'), F('item', 'Item', 'envelopes'), F('units', 'Units', '50')]),
    D('note', 'Delivery Note', [F('num', 'Order number', '4620'), F('item', 'Item', 'envelopes'), F('units', 'Units', '40')]),
  ], 1, 'units', { person: 'p_lin' }),
  check('o2_expense', 2, 5, 'Please check this expense claim. Is the total right?', [
    D('card', 'Receipt', [F('date', 'Date', 'March 8'), F('item', 'Item', 'lunch'), F('total', 'Total', '$24')]),
    D('note', 'Expense Claim', [F('date', 'Date', 'March 8'), F('item', 'Item', 'lunch'), F('total', 'Total', '$42')]),
  ], 1, 'total', { person: 'p_bell' }),
  reply('o2_attach', 2, 8, 'Please write back to {Mr. Lin|@}.', { kind: 'email', from: '{Mr. Lin|@}', subject: 'The invoice for March', lines: ['Dear {Ms. Park|@},', 'Please find attached the invoice for March.', 'Best regards,', '{Mr. Lin|@}'] }, ['Thank you. I will check it today.', 'You are welcome. It is on Friday.', 'In the big meeting room.'], 0, { person: 'p_park' }),
  reply('o2_could', 2, 6, 'Could you send me the price list by Friday, please?', { kind: 'speech', lines: ['Could you send me the price list by Friday, please?'] }, ['It is on the second floor.', 'Of course. I will send it on Thursday.', 'At nine in the morning.'], 1, { person: 'c_merchant', phrases: ['ph-4-0005'], grammar: ['gr-4-002'] }),
  reply('o2_deadline', 2, 9, 'When must I send the report?', { kind: 'memo', lines: ['Sales report', 'Deadline: Friday, 5:00'] }, ['By Friday at five.', 'In Room 2.', 'It is four dollars.'], 0, { person: 'p_ruiz', grammar: ['gr-4-003'] }),
  reply('o2_holiday', 2, 10, 'Is the office open on Monday?', { kind: 'memo', lines: ['Notice', 'The office will be closed on Monday for the holiday.'] }, ['Yes, from nine to five.', 'No, it is closed for the holiday.', 'On Monday at ten.'], 1, { person: 'c_merchant', grammar: ['gr-pre2-064'] }),
  reply('o2_move', 2, 7, 'Can we move the meeting?', { kind: 'email', from: '{Mr. Grant|@}', lines: ['Dear {Ms. Park|@},', 'I am sorry, but I can\'t come on Tuesday.', 'Can we {change|change_v} the meeting to Thursday?', 'Best regards,'] }, ['It is on the second floor.', 'You are welcome.', 'Yes. Thursday is fine.'], 2, { person: 'p_park', grammar: ['gr-5-015'] }),
  slot('o2_room1', 2, 11, 'A room for the sales meeting, please. Look at the plan.', { kind: 'email', lines: ['Dear {Ms. Park|@},', 'We need Room 2 for the sales meeting.', 'We want to meet in the afternoon, but not at four.', 'Thank you.'] }, ROOMGRID, { 'r1-t2': 'Meeting', 'r2-t9': 'Meeting' }, 'r2-t2', { grammar: ['gr-5-028'] }),
  check('o2_stock', 2, 12, 'The client wants forty pens. Is there a problem with the stock?', [
    D('card', 'Stock list', [F('item', 'Item', 'pens'), F('stock', 'In stock', '25')]),
    D('order', 'Order', [F('item', 'Item', 'pens'), F('units', 'Units', '40')]),
  ], 0, 'stock', { person: 'p_ruiz' }),
  reply('o2_afraid', 2, 13, 'I am afraid I can\'t come to the meeting.', { kind: 'speech', lines: ['I am afraid I can\'t come to the meeting.'] }, ['You are welcome.', 'That is all right. I will send you the notes.', 'It is on the second floor.'], 1, { person: 'p_lin' }),
  reply('o2_gap1', 2, 14, 'Which word is right?', { kind: 'memo', lines: ['Please send the ___ by Friday.'] }, ['confirm', 'confirmation', 'confirmed'], 1, { person: 'p_park', grammar: ['gr-3-034'] }),
  reply('o2_gap2', 2, 15, 'Which word is right?', { kind: 'email', lines: ['Dear {Mr. Grant|@},', 'The boxes will arrive ___ three days.', 'Best regards,'] }, ['during', 'within', 'by'], 1, { person: 'p_ruiz', grammar: ['gr-pre2-037'] }),
  reply('o2_gap3', 2, 16, 'Which word is right?', { kind: 'email', lines: ['Dear {Mr. Grant|@},', 'We are sorry ___ the delay.', 'Best regards,'] }, ['for', 'at', 'on'], 0, { person: 'p_ruiz', grammar: ['gr-3-022'] }),
  reply('o2_gap4', 2, 17, 'Which word is right?', { kind: 'memo', lines: ['We could not send the pens ___ they were out of stock.'] }, ['because of', 'so', 'because'], 2, { person: 'p_park', grammar: ['gr-pre2-034'] }),
  reply('o2_gap5', 2, 18, 'Which word is right?', { kind: 'memo', lines: ['{Mr. Lin|@} ___ the order yesterday.'] }, ['will send', 'sent', 'sends'], 1, { person: 'p_park', grammar: ['gr-pre2-042'] }),
  check('o2_quote', 2, 19, 'The quote and the order must have the same price. Please check.', [
    D('card', 'Quote', [F('item', 'Item', 'chairs'), F('units', 'Units', '20'), F('price', 'Unit price', '$30')]),
    D('order', 'Purchase Order', [F('item', 'Item', 'chairs'), F('units', 'Units', '20'), F('price', 'Unit price', '$30')]),
  ], 1, null, { person: 'p_ruiz' }),
  check('o2_ship', 2, 20, 'The email says when the ship arrives. Is the schedule right?', [
    D('letter', 'Email', [], ['The ship leaves on Monday.', 'It will arrive on Friday.']),
    D('note', 'Schedule', [F('leave', 'Leaves', 'Monday'), F('arrive', 'Arrives', 'Thursday')]),
  ], 1, 'arrive', { person: 'p_lin' }),
  reply('o2_budget', 2, 21, 'The bill is $240. Is it within the budget?', { kind: 'memo', lines: ['Budget for paper', '$200 every week'] }, ['Yes, it is within the budget.', 'No, it is over the budget.', 'It is on Friday.'], 1, { person: 'p_bell', grammar: ['gr-pre2-037'] }),
  reply('o2_damaged', 2, 22, 'The package arrived broken.', { kind: 'email', from: '{Mr. Grant|@}', lines: ['Dear {Ms. Park|@},', 'The package arrived broken.', 'I would like a new one.'] }, ['Thank you for your help.', 'I am sorry. We will send you a new one.', 'The meeting is on Tuesday.'], 1, { person: 'p_park', grammar: ['gr-4-007'] }),
  reply('o2_payment', 2, 23, 'We have received your payment.', { kind: 'email', from: '{Ms. Park|@}', lines: ['Dear {Mr. Grant|@},', 'We have received your payment.', 'Thank you.'] }, ['You are welcome. Please keep the receipt.', 'Sorry, I am late.', 'It is on the second floor.'], 0, { person: 'p_bell', phrases: ['ph-2-0039'], grammar: ['gr-3-002'] }),
  pad('o2_phone3', 2, 24, '{Mr. Bell|@} called. Write the message for {Ms. Park|@}.', ['Hello, this is {Mr. Bell|@}.', 'The meeting on Thursday is now on Friday at two.', 'Please tell {Ms. Park|@}.'], [
    { id: 'who', label: 'Caller', options: ['{Mr. Bell|@}', '{Mr. Lin|@}', '{Ms. Ruiz|@}'], answer: '{Mr. Bell|@}' },
    { id: 'day', label: 'New day', options: ['Thursday', 'Friday', 'Monday'], answer: 'Friday' },
    { id: 'time', label: 'Time', options: ['2:00', '4:00', '12:00'], answer: '2:00' },
  ], { person: 'p_santos' }),
  reply('o2_invite', 2, 25, 'Please write back.', { kind: 'email', from: '{Ms. Park|@}', subject: 'Meeting on March 5', lines: ['Dear {Mr. Grant|@},', 'We would like to invite you to our meeting on March 5.', 'Best regards,'] }, ['Thank you. I would be happy to come.', 'You are welcome.', 'It is four dollars.'], 0, { person: 'p_park', grammar: ['gr-4-007'] }),
  reply('o2_available', 2, 26, 'Are you available on Friday?', { kind: 'speech', lines: ['Are you available on Friday?'] }, ['Yes, Friday is fine.', 'It is four dollars.', 'You are welcome.'], 0, { person: 'p_ruiz', phrases: ['ph-2-0057'] }),
  reply('o2_cancel', 2, 27, 'I would like to cancel my order.', { kind: 'phone', lines: ['Hello. I would like to cancel my order.'] }, ['Of course. What is the order number?', 'You are welcome.', 'At nine in the morning.'], 0, { person: 'c_baker', grammar: ['gr-4-007'] }),
  slot('o2_wed2', 2, 28, 'An email from a client. Look at the week, please.', { kind: 'email', lines: ['Dear {Ms. Park|@},', 'I am not free on Monday or Tuesday.', 'Can we meet on Wednesday afternoon?', 'Thank you.'] }, WEEK, { 'wed-t2': 'Meeting', 'wed-t9': 'Busy', 'thu-t4': 'Busy' }, 'wed-t4', { grammar: ['gr-3-033'] }),
  reply('o2_gap6', 2, 29, 'Which word is right?', { kind: 'email', lines: ['Dear {Ms. Ruiz|@},', 'Please send ___ the invoice today.', 'Best regards,'] }, ['I', 'me', 'my'], 1, { person: 'p_bell', grammar: ['gr-3-042'] }),
  check('o2_advert', 2, 30, 'This is for the new job. Is the job ad the same as the form?', [
    D('card', 'Job Ad', [F('job', 'Job', 'clerk'), F('days', 'Work', 'Monday to Friday'), F('start', 'Start', 'March 1')]),
    D('order', 'Form', [F('job', 'Job', 'clerk'), F('days', 'Work', 'Monday to Friday'), F('start', 'Start', 'March 11')]),
  ], 1, 'start', { person: 'p_weber' }),
  reply('o2_read1', 2, 31, 'When will the chairs arrive?', { kind: 'email', from: '{Mr. Okoye|@}', subject: 'Your order of 200 chairs', lines: ['Dear {Ms. Park|@},', 'Thank you for your order of 200 chairs.', 'We are sorry, but the chairs will be late.', 'The new delivery date is April 10.', 'We will give you a discount for the delay.', 'Best regards,', '{Mr. Okoye|@}'] }, ['On April 10.', 'In two days.', 'On Friday.'], 0, { person: 'p_park', grammar: ['gr-4-002', 'gr-5-013'] }),
  reply('o2_read2', 2, 32, 'Where is the sales meeting?', { kind: 'memo', lines: ['Notice', 'The sales meeting is not on Tuesday. It is on Thursday at ten.', 'Room 2 is closed, so we will meet in Room 3.', 'Please bring the March report.'] }, ['In Room 2.', 'In Room 3.', 'On Tuesday.'], 1, { person: 'p_ruiz', grammar: ['gr-5-013', 'gr-pre2-034'] }),
  reply('o2_read3', 2, 33, 'When must we pay this invoice?', { kind: 'letter', subject: 'Invoice 4620', lines: ['Total: $480', 'Payment is due within 30 days.', 'Thank you.'] }, ['Within 30 days.', 'On Friday.', 'It is $480.'], 0, { person: 'p_bell', grammar: ['gr-pre2-037'] }),
  reply('o2_read4', 2, 34, '{Ms. Park|@} is in a meeting until lunch. What should I tell the caller?', { kind: 'phone', lines: ['Hello. This is {Mr. Grant|@}.', 'Can I speak to {Ms. Park|@}, please?'] }, ['She is in a meeting. Please call back after lunch.', 'She is free now. Please come in.', 'It is four dollars.'], 0, { person: 'p_bell', grammar: ['gr-5-016'] }),
  reply('o2_read5', 2, 35, 'Is the price list in this email new?', { kind: 'email', from: '{Mr. Lin|@}', lines: ['Dear {Ms. Ruiz|@},', 'Here is the new price list. The prices are higher than before.', 'Please tell the clients.', 'Best regards,'] }, ['Yes. The prices are higher now.', 'No. It is the same list as before.', 'Yes. The prices are lower now.'], 0, { person: 'p_ruiz', grammar: ['gr-4-014'] }),
  reply('o2_read6', 2, 36, 'What does the notice say about the copy machine?', { kind: 'memo', lines: ['Notice', '{Bertha|@}, the big copy machine, is out of order again.', 'Please use the machine in Room 3 until Friday.'] }, ['Use the machine in Room 3.', 'Use {Bertha|@}.', 'Wait until Monday.'], 0, { person: 'p_ruiz' }),
];
// ---------------------------------------------------------------------------------------------- rank 3 (TOEIC 〜730, 英検2)
// Three papers at once, the right value to write in, heard-only calls, polite and indirect wording,
// conditions and deadlines, and the sentence-completion discriminations of Part 5 / 6.

const R3: AuthoredTask[] = [
  pad('o3_phone3', 3, 1, 'A call again! Write the message, please.', ['Good morning. This is {Mr. Lin|@}.', 'Sorry, the ink is late.', 'It will come on Friday.'], [
    { id: 'who', label: 'Caller', options: ['{Mr. Bell|@}', '{Ms. Ruiz|@}', '{Mr. Lin|@}'], answer: '{Mr. Lin|@}' },
    { id: 'about', label: 'About', options: ['the ink', 'the paper', 'the invoice'], answer: 'the ink' },
    { id: 'day', label: 'Date', options: ['Monday', 'Wednesday', 'Friday'], answer: 'Friday' },
  ], { features: ['audioOnly'], grammar: ['gr-4-002'] }),
  check('o3_inv1', 3, 2, 'Please check the invoice with the order and the delivery note.', [
    D('order', 'Purchase Order', [F('num', 'Order number', '5108'), F('item', 'Item', 'ink'), F('qty', 'Quantity', '40'), F('price', 'Unit price', '$6')]),
    D('note', 'Delivery Note', [F('num', 'Order number', '5108'), F('item', 'Item', 'ink'), F('qty', 'Quantity', '36'), F('date', 'Date', 'March 5')]),
    D('invoice', 'Invoice', [F('num', 'Order number', '5108'), F('item', 'Item', 'ink'), F('qty', 'Quantity', '40'), F('price', 'Unit price', '$6'), F('date', 'Date', 'March 5')]),
  ], 2, 'qty', { person: 'p_bell', fixOptions: ['36', '40', '46'], fix: '36', grammar: ['gr-pre2-045'] }),
  reply('o3_supplier', 3, 3, 'What does the supplier say?', { kind: 'email', from: '{Mr. Okoye|@}', subject: 'Your order of ink', lines: ['Dear {Ms. Park|@},', 'We are sorry to say that your ink will be late again.', 'The shipment will leave on Monday, not on Friday.', 'We will pay for the delivery this time.', 'Best regards,', '{Mr. Okoye|@}'] }, ['The ink will be late, but the supplier will pay for the delivery.', 'The ink has already arrived.', 'The supplier wants us to pay for the delivery.'], 0, { person: 'p_park', grammar: ['gr-4-002'] }),
  reply('o3_wonder', 3, 4, 'I was wondering if you could send me the contract by Friday.', { kind: 'speech', lines: ['I was wondering if you could send me the contract by Friday.'] }, ['Of course. I will send it to you tomorrow.', 'No, I was not wondering.', 'It is on the second floor.'], 0, { person: 'c_merchant', phrases: ['ph-pre2-0111'], grammar: ['gr-pre2-008'] }),
  check('o3_discount', 3, 5, 'We promised {Mr. Grant|@} a ten percent discount. Is the total on the invoice right?', [
    D('card', 'Quote', [F('item', 'Item', 'chairs'), F('qty', 'Quantity', '20'), F('disc', 'Discount', '10%'), F('total', 'Total', '$540')]),
    D('invoice', 'Invoice', [F('item', 'Item', 'chairs'), F('qty', 'Quantity', '20'), F('disc', 'Discount', '10%'), F('total', 'Total', '$600')]),
  ], 1, 'total', { person: 'p_ruiz', fixOptions: ['$540', '$600', '$660'], fix: '$540' }),
  reply('o3_gap_who', 3, 6, 'Which word is right?', { kind: 'memo', lines: ['The client ___ called this morning wants a discount.'] }, ['who', 'which', 'whose'], 0, { person: 'p_ruiz', grammar: ['gr-3-007'] }),
  reply('o3_possible', 3, 7, 'Would it be possible to move the meeting to Monday?', { kind: 'speech', lines: ['Would it be possible to move the meeting to Monday?'] }, ['Yes, that should be fine. I will change the calendar.', 'Yes, it is possible. It is four dollars.', 'It is on the second floor.'], 0, { person: 'p_lin', grammar: ['gr-4-007'] }),
  check('o3_contract1', 3, 8, 'The contract must say what {Mr. Grant|@} wrote. Is the payment time right?', [
    D('letter', 'Email', [], ['We will sign the contract if the payment is due within 30 days.']),
    D('card', 'Contract', [F('item', 'Item', 'tea and paper'), F('pay', 'Payment due', '60 days'), F('sign', 'Signed by', '{Ms. Park|@}')]),
  ], 1, 'pay', { person: 'p_park', fixOptions: ['15 days', '30 days', '60 days'], fix: '30 days', grammar: ['gr-3-018'] }),
  pad('o3_phone4', 3, 9, '{Ms. Weber|@} called about the new clerk. Write the message.', ['Hello, this is {Ms. Weber|@} from the personnel office.', 'The interview with the new clerk is on Tuesday at 2:30.', 'Please bring the form.'], [
    { id: 'who', label: 'Caller', options: ['{Ms. Weber|@}', '{Ms. Ruiz|@}', '{Mr. Santos|@}'], answer: '{Ms. Weber|@}' },
    { id: 'day', label: 'Interview', options: ['Monday', 'Tuesday', 'Thursday'], answer: 'Tuesday' },
    { id: 'time', label: 'Time', options: ['2:00', '2:30', '3:30'], answer: '2:30' },
    { id: 'bring', label: 'Bring', options: ['the form', 'the invoice', 'the contract'], answer: 'the form' },
  ], { person: 'p_park', features: ['audioOnly'] }),
  reply('o3_intent1', 3, 10, 'What does {Ms. Weber|@} want us to do?', { kind: 'email', from: '{Ms. Weber|@}', lines: ['Dear {Mr. Bell|@},', 'I notice that we have not paid invoice 5108 yet.', 'The due date was last Friday.'] }, ['Pay the invoice as soon as possible.', 'Cancel the order.', 'Send her a new invoice.'], 0, { person: 'p_park', grammar: ['gr-3-002'] }),
  reply('o3_gap_which', 3, 11, 'Which word is right?', { kind: 'memo', lines: ['The report ___ was sent yesterday has a mistake.'] }, ['who', 'which', 'whose'], 1, { person: 'p_bell', grammar: ['gr-3-007'] }),
  slot('o3_room1', 3, 12, 'A client wants to meet. Read the email and look at the week.', { kind: 'email', lines: ['Dear {Ms. Park|@},', 'I will be abroad on Monday and Tuesday.', 'I would like to meet on the first day after that, in the afternoon.', 'Please let me know if it is possible.'] }, { rows: DAYS, cols: TIMES2 }, { 'mon-t1': 'Meeting', 'wed-t1': 'Meeting', 'wed-t9': 'Busy', 'thu-t3': 'Meeting' }, 'wed-t3', { grammar: ['gr-3-018'] }),
  check('o3_interview', 3, 13, 'The candidate wrote to us. Is the interview time on the schedule right?', [
    D('letter', 'Email', [], ['Thank you for inviting me to an interview.', 'I will be at your office on Tuesday at 2:30.']),
    D('card', 'Interview Schedule', [F('day', 'Day', 'Tuesday'), F('time', 'Time', '3:30'), F('who', 'Candidate', '{Ken|@}')]),
  ], 1, 'time', { person: 'p_weber', fixOptions: ['1:30', '2:30', '3:30'], fix: '2:30' }),
  reply('o3_unfortunately', 3, 14, 'The pens are out of stock. What does the supplier say about the next delivery?', { kind: 'email', from: '{Mr. Okoye|@}', lines: ['Dear {Ms. Ruiz|@},', 'Unfortunately, the blue pens are out of stock.', 'We expect a new delivery next week.', 'Would you like us to send the black pens now?'] }, ['It will come next week.', 'It came yesterday.', 'It will never come.'], 0, { person: 'p_ruiz', grammar: ['gr-pre2-064'] }),
  reply('o3_gap_despite', 3, 15, 'Which word is right?', { kind: 'memo', lines: ['___ the late delivery, the client was happy.'] }, ['Although', 'Despite', 'Because'], 1, { person: 'p_park', grammar: ['gr-pre2-033'] }),
  reply('o3_report1', 3, 16, 'When were sales the best?', { kind: 'memo', lines: ['Sales report', 'Sales rose by 10% in March.', 'They fell by 5% in April.', 'In May they rose again, by 15%.'] }, ['In May.', 'In March.', 'In April.'], 0, { person: 'p_park', grammar: ['gr-3-005'] }),
  pad('o3_phone5', 3, 17, 'A call from the port. Write the message, please.', ['Good afternoon. This is {Big Joe|@} at the port.', 'The ship from the south arrives on Friday morning.', 'Please send two trucks.'], [
    { id: 'who', label: 'Caller', options: ['{Big Joe|@}', '{Mr. Lin|@}', '{Captain Reed|@}'], answer: '{Big Joe|@}' },
    { id: 'day', label: 'Arrives', options: ['Wednesday', 'Friday', 'Saturday'], answer: 'Friday' },
    { id: 'what', label: 'Needs', options: ['two trucks', 'two tickets', 'two boxes'], answer: 'two trucks' },
  ], { person: 'p_lin', features: ['audioOnly'] }),
  check('o3_expense2', 3, 18, 'Please check the expense report. The hotel was two nights.', [
    D('card', 'Hotel Receipt', [F('nights', 'Nights', '2'), F('rate', 'Rate', '$90'), F('total', 'Total', '$180')]),
    D('note', 'Expense Report', [F('nights', 'Nights', '2'), F('rate', 'Rate', '$90'), F('total', 'Total', '$190')]),
  ], 1, 'total', { person: 'p_bell', fixOptions: ['$170', '$180', '$190'], fix: '$180' }),
  reply('o3_gap_their', 3, 19, 'Which word is right?', { kind: 'memo', lines: ['The clients sent us ___ order on Monday.'] }, ['they', 'their', 'them'], 1, { person: 'p_ruiz', grammar: ['gr-3-042'] }),
  reply('o3_warranty', 3, 20, 'For how many years is the warranty good?', { kind: 'letter', subject: 'Warranty', lines: ['This warranty is good for two years.', 'Please keep the receipt.'] }, ['For two years.', 'For two months.', 'Until the receipt arrives.'], 0, { person: 'c_merchant' }),
  check('o3_transfer', 3, 21, 'Please check the bank statement. Is the payment the same as on the invoice?', [
    D('invoice', 'Invoice', [F('num', 'Invoice number', '7731'), F('total', 'Total', '$1,200')]),
    D('card', 'Bank Statement', [F('num', 'Invoice number', '7731'), F('total', 'Paid', '$1,020'), F('date', 'Date', 'March 12')]),
  ], 1, 'total', { person: 'p_bell', fixOptions: ['$1,020', '$1,200', '$1,220'], fix: '$1,200' }),
  reply('o3_ad', 3, 22, 'Can {Ken|@} apply for this job? He has no work experience.', { kind: 'memo', lines: ['Sales clerk wanted', 'You need two years of work experience.', 'Please apply by March 10.'] }, ['No. He needs two years of work experience.', 'Yes. No experience is needed.', 'Yes. But he must apply by March 1.'], 0, { person: 'p_weber', grammar: ['gr-3-005'] }),
  reply('o3_gap_due', 3, 23, 'Which word is right?', { kind: 'memo', lines: ['The meeting was moved ___ the holiday.'] }, ['because', 'due to', 'although'], 1, { person: 'p_santos', grammar: ['gr-pre2-038'] }),
  reply('o3_unless', 3, 24, 'Will the shipment leave on Monday?', { kind: 'email', from: '{Mr. Lin|@}', lines: ['Dear {Ms. Park|@},', 'The shipment will leave on Monday unless the weather is bad.', 'I will call you on Sunday evening.'] }, ['Yes, if the weather is good.', 'No, it will leave on Sunday.', 'Yes, but only if the weather is bad.'], 0, { person: 'p_park', grammar: ['gr-3-018'] }),
  pad('o3_phone6', 3, 25, '{Mr. Grant|@} is going on a trip. Write the message.', ['Hello, this is {Mr. Grant|@}.', 'Please reserve two hotel rooms for next Tuesday.', 'We will arrive by train at about six.'], [
    { id: 'who', label: 'Caller', options: ['{Mr. Grant|@}', '{Mr. Bell|@}', '{Mr. Santos|@}'], answer: '{Mr. Grant|@}' },
    { id: 'rooms', label: 'Rooms', options: ['one', 'two', 'three'], answer: 'two' },
    { id: 'day', label: 'Day', options: ['next Tuesday', 'next Thursday', 'next Sunday'], answer: 'next Tuesday' },
    { id: 'how', label: 'Coming by', options: ['train', 'ship', 'bicycle'], answer: 'train' },
  ], { person: 'p_ruiz', features: ['audioOnly'] }),
  slot('o3_wk2', 3, 26, 'A supplier wants to visit. Read the email and look at the week.', { kind: 'email', lines: ['Dear {Ms. Park|@},', 'I would like to visit your office this week.', 'I am free every morning, but I can not come on Wednesday.', 'Eleven is better for me than nine thirty.'] }, WEEK2, { 'mon-t11': 'Meeting', 'tue-t11': 'Busy', 'thu-t9': 'Busy', 'fri-t11': 'Meeting' }, 'thu-t11', { grammar: ['gr-4-014'] }),
  reply('o3_regret', 3, 27, 'What does the letter say about the job?', { kind: 'letter', lines: ['Dear {Ken|@},', 'We regret to inform you that the job is no longer open.', 'Thank you for coming to the interview.'] }, ['The job is no longer available.', 'He will start on Monday.', 'He must come for a second interview.'], 0, { person: 'p_weber', grammar: ['gr-3-005'] }),
  reply('o3_gap_part', 3, 28, 'Which word is right?', { kind: 'memo', lines: ['{Ms. Park|@} was ___ with the new sales.'] }, ['please', 'pleased', 'pleasing'], 1, { person: 'p_bell', grammar: ['gr-3-041'] }),
  reply('o3_complaint', 3, 29, 'How should we write back to this customer?', { kind: 'email', from: '{Mrs. Hill|@}', lines: ['Dear {Ms. Ruiz|@},', 'I ordered three boxes of tea, but only two arrived.', 'I would like the third box as soon as possible.'] }, ['We are sorry. We will send the third box today.', 'We are happy that you liked the tea.', 'Please pay for three boxes.'], 0, { person: 'p_ruiz', grammar: ['gr-pre2-001'] }),
  reply('o3_gap_between', 3, 30, 'Which word is right?', { kind: 'memo', lines: ['The meeting is ___ ten and eleven on Friday.'] }, ['between', 'among', 'during'], 0, { person: 'p_lin', grammar: ['gr-pre2-039'] }),
  check('o3_budget2', 3, 31, 'The budget says $300 for travel. Is the total on the report within it?', [
    D('card', 'Travel Budget', [F('budget', 'Budget', '$300'), F('month', 'Month', 'March')]),
    D('note', 'Travel Report', [F('budget', 'Budget', '$300'), F('month', 'Month', 'March'), F('total', 'Total', '$340')]),
  ], 1, 'total', { person: 'p_bell', fixOptions: ['$240', '$300', '$340'], fix: '$300' }),
  reply('o3_deadline2', 3, 32, 'When is the new deadline?', { kind: 'email', from: '{Ms. Park|@}', lines: ['Dear all,', 'The deadline for the sales report has been moved to Monday.', 'Please send it by noon.'] }, ['Monday at noon.', 'Friday at noon.', 'Monday at night.'], 0, { person: 'p_ruiz', grammar: ['gr-3-005'] }),
];
// ---------------------------------------------------------------------------------------------- rank 4 (TOEIC 〜860, 英検準1)
// Longer e-mails, minutes, contracts, reports and notices; conditions and deadlines; messages
// heard only; indirect refusals; the audit week and Mr. Bell's retirement. The words are mostly
// the ones already met: what gets harder is the grammar, the length and the reading between the lines.

const R4: AuthoredTask[] = [
  pad('o4_voice1', 4, 1, 'There is a message from {Professor Hale|@}. Write the message, please.', ['Good morning. This is {Professor Hale|@}.', 'I want four hundred boxes of paper for my book.', 'Could you give me a discount? It is a big order.', 'I need it by the end of the month.'], [
    { id: 'who', label: 'Caller', options: ['{Professor Hale|@}', '{Mr. Grant|@}', '{Captain Reed|@}'], answer: '{Professor Hale|@}' },
    { id: 'qty', label: 'Boxes', options: ['40', '400', '4,000'], answer: '400' },
    { id: 'ask', label: 'Wants', options: ['a discount', 'a receipt', 'a new bill'], answer: 'a discount' },
    { id: 'when', label: 'Needs it', options: ['by the end of the month', 'next week', 'next year'], answer: 'by the end of the month' },
  ], { person: 'p_ruiz', features: ['audioOnly'], grammar: ['gr-pre2-064'] }),
  check('o4_audit1', 4, 2, 'The auditors are coming. Please check the invoice with the order and the bank statement.', [
    D('order', 'Purchase Order', [F('num', 'Order number', '8841'), F('qty', 'Quantity', '200'), F('price', 'Unit price', '$7')]),
    D('card', 'Bank Statement', [F('num', 'Invoice number', '8841'), F('total', 'Paid', '$1,540')]),
    D('invoice', 'Invoice', [F('num', 'Order number', '8841'), F('qty', 'Quantity', '200'), F('price', 'Unit price', '$7'), F('del', 'Delivery', '$140'), F('total', 'Total', '$1,400')]),
  ], 2, 'total', { person: 'p_bell', fixOptions: ['$1,400', '$1,540', '$1,260'], fix: '$1,540', grammar: ['gr-pre2-045'] }),
  reply('o4_chain1', 4, 3, 'Who will write the contract, and who must check it?', { kind: 'email', from: '{Ms. Park|@}', subject: 'The new contract', lines: ['Dear {Mr. Bell|@},', 'Thank you for your message.', '{Ms. Ruiz|@} will write the new contract, and {Mr. Lin|@} must check it before the end of next week.', 'After that, I will sign it on behalf of the company.', 'Best regards,', '{Ms. Park|@}'] }, ['{Ms. Ruiz|@} will write it; {Mr. Lin|@} must check it.', '{Mr. Lin|@} will write it; {Ms. Ruiz|@} must check it.', '{Ms. Park|@} will write it; {Mr. Bell|@} must sign it.'], 0, { person: 'p_bell', grammar: ['gr-3-007', 'gr-3-019'] }),
  reply('o4_condition1', 4, 4, 'Can we pay in sixty days?', { kind: 'letter', from: '{Captain Reed|@}', lines: ['Dear {Ms. Park|@},', 'We can give you sixty days to pay, provided that the first order is over two hundred boxes.', 'If not, you must pay within thirty days.'] }, ['Yes, if the first order is over two hundred boxes.', 'Yes, for every order.', 'No, only thirty days are possible.'], 0, { person: 'p_ruiz', grammar: ['gr-1-032'] }),
  reply('o4_gap_however', 4, 5, 'Which word is right?', { kind: 'email', lines: ['The price is higher than last year.', '___, the paper is much better.'] }, ['However', 'Therefore', 'Also'], 0, { person: 'p_ruiz', grammar: ['gr-pre2-061'] }),
  reply('o4_minutes', 4, 6, 'Who must send the numbers, and when?', { kind: 'memo', lines: ['Minutes of the sales meeting', 'Present: {Ms. Park|@}, {Ms. Ruiz|@}, {Mr. Lin|@}, {Mr. Bell|@}', 'Sales rose by 8%.', '{Mr. Lin|@} will check the stock by Thursday.', '{Mr. Bell|@} will send the numbers to {Ms. Park|@} on Friday.'] }, ['{Mr. Bell|@} will send them on Friday.', '{Mr. Lin|@} will send them on Thursday.', '{Ms. Ruiz|@} will send them on Friday.'], 0, { person: 'p_park', grammar: ['gr-4-002'] }),
  check('o4_contract2', 4, 7, 'The supplier wrote about the notice period. Does the contract say the same?', [
    D('letter', 'Email', [], ['The notice period must be 60 days.', 'Payment is due within 30 days.']),
    D('card', 'Contract', [F('notice', 'Notice period', '30 days'), F('pay', 'Payment due', '30 days'), F('start', 'Start', 'May 1')]),
  ], 1, 'notice', { person: 'p_park', fixOptions: ['30 days', '60 days', '90 days'], fix: '60 days', grammar: ['gr-pre2-064'] }),
  check('o4_resume', 4, 8, 'Is the form the same as the job ad?', [
    D('card', 'Job Ad', [F('job', 'Job', 'sales manager'), F('exp', 'Experience', '5 years'), F('start', 'Start', 'May 1')]),
    D('order', 'Form', [F('job', 'Job', 'sales manager'), F('exp', 'Experience', '2 years'), F('start', 'Start', 'May 1')]),
  ], 1, 'exp', { person: 'p_weber', fixOptions: ['2 years', '5 years', '7 years'], fix: '5 years' }),
  reply('o4_counter', 4, 9, 'What does {Captain Reed|@} offer?', { kind: 'email', from: '{Captain Reed|@}', lines: ['Dear {Ms. Park|@},', 'Thank you for your offer. Unfortunately, we can\'t take $9 a box.', 'We would like to counter with $8.', 'If you like the price, we can sign this week.'] }, ['$8 a box, with signing this week.', '$9 a box, with signing next month.', 'No price at all.'], 0, { person: 'p_ruiz', grammar: ['gr-3-018'] }),
  reply('o4_hint1', 4, 10, 'What is the supplier really saying?', { kind: 'email', from: '{Mr. Okoye|@}', lines: ['Dear {Ms. Park|@},', 'Thank you very much for your offer.', 'We will keep it and call you if things change.'] }, ['They are not going to accept it now.', 'They will sign the contract tomorrow.', 'They want to meet us this week.'], 0, { person: 'p_park', grammar: ['gr-3-018'] }),
  reply('o4_overdue', 4, 11, 'How much must we still pay?', { kind: 'letter', subject: 'Statement', lines: ['Invoice 7731: $1,200', 'Paid: $900', 'Balance: $300', 'This is now ten days overdue.'] }, ['$300.', '$900.', '$1,200.'], 0, { person: 'p_bell', grammar: ['gr-3-005'] }),
  pad('o4_voice2', 4, 12, 'A message from the harbour. Write the message, please.', ['Hello, this is {Big Joe|@} at the port.', 'Because of the storm, the ship will arrive two days late.', 'It should be here on Sunday evening.', 'Please tell the customers.'], [
    { id: 'who', label: 'Caller', options: ['{Big Joe|@}', '{Mr. Lin|@}', '{Captain Reed|@}'], answer: '{Big Joe|@}' },
    { id: 'why', label: 'Why', options: ['a storm', 'a mistake', 'a holiday'], answer: 'a storm' },
    { id: 'late', label: 'Late by', options: ['two days', 'two weeks', 'two hours'], answer: 'two days' },
    { id: 'when', label: 'Arrives', options: ['Sunday evening', 'Saturday morning', 'Monday'], answer: 'Sunday evening' },
  ], { person: 'p_lin', features: ['audioOnly'], grammar: ['gr-pre2-038'] }),
  slot('o4_slot1', 4, 13, '{Ms. Park|@} and {Ms. Ruiz|@} must meet the client. Read the emails and look at the week.', { kind: 'email', lines: ['{Ms. Park|@}: I am free on Monday, Wednesday and Thursday.', '{Ms. Ruiz|@}: I can\'t come on Monday or Thursday. I prefer the afternoon.', 'Please find a time when {Ms. Park|@} and {Ms. Ruiz|@} are free.'] }, WEEK2, { 'wed-t1': 'Meeting', 'mon-t3': 'Busy', 'tue-t1': 'Busy', 'fri-t3': 'Busy' }, 'wed-t3', { grammar: ['gr-3-033'] }),
  reply('o4_gap_whom', 4, 14, 'Which word is right?', { kind: 'memo', lines: ['The manager to ___ we sent the report has not replied.'] }, ['who', 'whom', 'whose'], 1, { person: 'p_santos', grammar: ['gr-pre2-048'] }),
  reply('o4_gap_amount', 4, 15, 'Which word is right?', { kind: 'memo', lines: ['A large ___ of money was used for the new office.'] }, ['number', 'amount', 'many'], 1, { person: 'p_bell', grammar: ['gr-pre2-049'] }),
  reply('o4_gap_response', 4, 16, 'Which words are right?', { kind: 'email', lines: ['___ your email of March 3, we have checked the invoice.'] }, ['In response to', 'On behalf of', 'In charge of'], 0, { person: 'p_ruiz', grammar: ['gr-2-067'] }),
  reply('o4_gap_forward', 4, 17, 'Which word is right?', { kind: 'email', lines: ['We look forward to ___ from you.'] }, ['hear', 'hearing', 'heard'], 1, { person: 'p_ruiz', grammar: ['gr-pre2-059'] }),
  check('o4_manifest', 4, 18, 'The ship list must match the invoice. Please check it.', [
    D('invoice', 'Invoice', [F('boxes', 'Boxes', '120'), F('weight', 'Weight', '2,400'), F('port', 'Port', '{Lyon|@}')]),
    D('card', 'Ship List', [F('boxes', 'Boxes', '120'), F('weight', 'Weight', '2,800'), F('port', 'Port', '{Lyon|@}')]),
  ], 1, 'weight', { person: 'p_lin', fixOptions: ['2,000', '2,400', '2,800'], fix: '2,400' }),
  reply('o4_expense_policy', 4, 19, 'Can {Ken|@} stay in a $120 hotel?', { kind: 'memo', lines: ['Hotel rule', 'The company pays $100 a night, not more.', 'For a more expensive hotel, please ask a manager first.'] }, ['Only if a manager says yes first.', 'Yes, all hotels are fine.', 'No, never.'], 0, { person: 'p_weber', grammar: ['gr-3-005'] }),
  reply('o4_retire', 4, 20, 'Who should I give money to for the gift?', { kind: 'memo', lines: ['{Mr. Bell|@} is going to retire after thirty years with us.', 'The party is on Friday at five.', 'If you want to give money for a gift, please give it to {Ms. Weber|@} before Wednesday.'] }, ['{Ms. Weber|@}, before Wednesday.', '{Mr. Bell|@}, on Friday.', '{Ms. Park|@}, at five.'], 0, { person: 'p_santos', grammar: ['gr-3-018'] }),
  reply('o4_promoted', 4, 21, 'What is the news about {Ken|@}?', { kind: 'memo', lines: ['We are pleased to announce that {Ken|@} has been promoted to sales clerk.', 'Please say hello to him when you see him.'] }, ['He now has a better job.', 'He left the company.', 'He has no job now.'], 0, { person: 'p_weber', grammar: ['gr-3-005'] }),
  reply('o4_policy', 4, 22, 'When does the new rule start?', { kind: 'memo', lines: ['New rule on claims', 'Effective immediately, please send every claim to {Mr. Bell|@} within ten days.', 'Late claims will not be paid.'] }, ['Now.', 'In ten days.', 'Next year.'], 0, { person: 'p_bell' }),
  reply('o4_refusal', 4, 23, 'What does {Mr. Grant|@} say?', { kind: 'email', from: '{Mr. Grant|@}', lines: ['Dear {Ms. Park|@},', 'I am afraid a delivery on Monday would not be possible.', 'However, we could deliver on Tuesday morning, if that suits you.'] }, ['He can\'t deliver on Monday, but he can on Tuesday.', 'He can deliver on Monday and on Tuesday.', 'He can\'t deliver this week at all.'], 0, { person: 'p_ruiz', grammar: ['gr-pre2-061'] }),
  reply('o4_move2', 4, 24, 'Why is the meeting moved?', { kind: 'email', from: '{Ms. Park|@}', lines: ['Dear all,', 'Due to a problem at the port, the meeting on Thursday has been moved to Friday at ten.', 'I apologize for the change.'] }, ['Because of a problem at the port.', 'Because of the holiday.', 'Because nobody wanted to come.'], 0, { person: 'p_lin', grammar: ['gr-pre2-038'] }),
  reply('o4_report4', 4, 25, 'What happened to the costs?', { kind: 'memo', lines: ['Report', 'Sales rose by 12% last year, but costs fell by 3%.', 'As a result, we made more money.'] }, ['They fell by 3%.', 'They rose by 12%.', 'They stayed the same.'], 0, { person: 'p_park', grammar: ['gr-pre2-063'] }),
  reply('o4_survey', 4, 26, 'What do most customers want us to do better?', { kind: 'memo', lines: ['Customer survey', 'Nine out of ten customers are happy with our tea.', 'However, most of them say that delivery takes too long.'] }, ['Delivery time.', 'The tea.', 'The price.'], 0, { person: 'p_ruiz', grammar: ['gr-pre2-061'] }),
  reply('o4_recall', 4, 27, 'What should customers do?', { kind: 'letter', subject: 'The blue cups', lines: ['We are taking back the blue cups because they may break.', 'Please stop using them. You will get your money back.'] }, ['Stop using them and ask for the money back.', 'Keep using them.', 'Send them to the harbour.'], 0, { person: 'p_ruiz' }),
  reply('o4_billing', 4, 28, 'What is the problem with the bill?', { kind: 'email', from: '{Mr. Grant|@}', subject: 'Invoice 9012', lines: ['Dear {Mr. Bell|@},', 'There is a mistake on invoice 9012. I paid twice for the delivery.', 'Could you send me a new invoice?'] }, ['He paid twice for delivery.', 'He did not get the boxes.', 'He paid too late.'], 0, { person: 'p_bell', grammar: ['gr-3-005'] }),
  reply('o4_gap_passive', 4, 29, 'Which word is right?', { kind: 'memo', lines: ['The contract ___ by both companies last week.'] }, ['signed', 'was signed', 'was signing'], 1, { person: 'p_park', grammar: ['gr-pre2-045'] }),
  reply('o4_gap_although', 4, 30, 'Which word is right?', { kind: 'memo', lines: ['___ the price is high, the clients keep ordering.'] }, ['Although', 'Despite', 'Because of'], 0, { person: 'p_ruiz', grammar: ['gr-pre2-033'] }),
  reply('o4_gap_neither', 4, 31, 'Which word is right?', { kind: 'memo', lines: ['The new machine is ___ faster nor cheaper than the old one.'] }, ['either', 'neither', 'not'], 1, { person: 'p_santos', grammar: ['gr-3-033'] }),
  slot('o4_slot2', 4, 32, 'The client has sent two possible days. Read the email and look at the week.', { kind: 'email', lines: ['Dear {Ms. Park|@},', 'I could meet you on Tuesday or on Thursday.', 'I prefer Thursday, unless you are busy in the afternoon.', 'In that case, Tuesday morning would be better.'] }, WEEK2, { 'thu-t1': 'Meeting', 'thu-t3': 'Busy', 'tue-t9': 'Busy' }, 'tue-t11', { grammar: ['gr-3-018'] }),
];
// ---------------------------------------------------------------------------------------------- rank 1 templates and banks

const QA_SAY1: QaItem[] = [
  { q: 'When is the meeting?', a: 'It is on Tuesday at ten.', fn: 'time', rank: 1, grammar: ['gr-5-013'] },
  { q: 'Where is the meeting?', a: 'In the big meeting room.', fn: 'place', rank: 1, grammar: ['gr-5-013'] },
  { q: 'Can you send me the price list, please?', a: 'Sure. I will send it this afternoon.', fn: 'request', rank: 1, grammar: ['gr-4-002'] },
  { q: 'Thank you for your help.', a: 'You are welcome.', fn: 'thanks', rank: 1 },
  { q: 'How many chairs do you need?', a: 'We need ten chairs.', fn: 'number', rank: 1, grammar: ['gr-5-014'] },
  { q: 'What time does the office open?', a: 'At nine in the morning.', fn: 'time', rank: 1 },
  { q: 'Can I speak to the manager?', a: 'Just a moment, please.', fn: 'phone', rank: 1, phrases: ['ph-5-0105'] },
  { q: 'How much is this box of pens?', a: 'It is eight dollars.', fn: 'price', rank: 1, grammar: ['gr-5-014'] },
  { q: 'I am sorry. I am late.', a: 'That is all right.', fn: 'apology', rank: 1, phrases: ['ph-5-0020'] },
  { q: 'Is {Ms. Park|@} in the office today?', a: 'No, she is not here today.', fn: 'presence', rank: 1 },
  { q: 'Which room is the meeting in?', a: 'It is in Room 2.', fn: 'place', rank: 1 },
  { q: 'Do you want some tea?', a: 'Yes, please. Thank you.', fn: 'offer', rank: 1, grammar: ['gr-5-025'] },
  { q: 'Good morning!', a: 'Good morning. How are you?', fn: 'greeting', rank: 1 },
  { q: 'Can you copy this paper, please?', a: 'Sure. How many copies?', fn: 'request', rank: 1 },
  { q: 'What is your name?', a: 'My name is {Mr. Lin|@}.', fn: 'name', rank: 1 },
  { q: 'Is the bill the same as the order?', a: 'No. The number of boxes is not the same.', fn: 'check', rank: 1 },
  { q: 'Is this computer for the staff?', a: 'Yes, it is for the sales team.', fn: 'who', rank: 1 },
  { q: 'Do you have a sale this week?', a: 'Yes. Pens are two dollars.', fn: 'sale', rank: 1 },
  { q: 'Is this product the same as the order?', a: 'Yes, it is the same.', fn: 'check', rank: 1, grammar: ['gr-5-002'] },
  { q: 'What time does the meeting start?', a: 'It starts at ten.', fn: 'time', rank: 1 },
  { q: 'Can I use the phone, please?', a: 'Yes, of course. Here you are.', fn: 'request', rank: 1 },
];

const QA_PHONE1: QaItem[] = [
  { q: 'Hello. Can I speak to {Ms. Park|@}?', a: 'Just a moment, please.', fn: 'transfer', rank: 1, phrases: ['ph-5-0105'] },
  { q: 'Is {Mr. Bell|@} there?', a: 'Sorry, he is busy now.', fn: 'presence', rank: 1 },
  { q: 'Can I leave a message?', a: 'Yes, please. What is your name?', fn: 'message', rank: 1, phrases: ['ph-4-0051'] },
  { q: 'Who is calling, please?', a: 'This is {Mr. Grant|@}.', fn: 'name', rank: 1, phrases: ['ph-3-0003'] },
  { q: 'What is your phone number?', a: 'My number is 4 5 8 2.', fn: 'number', rank: 1 },
  { q: 'Please call me back after three.', a: 'Yes. I will call you at three.', fn: 'callback', rank: 1, grammar: ['gr-4-002'] },
  { q: 'Is this the sales office?', a: 'Yes, it is. Can I help you?', fn: 'confirm', rank: 1, phrases: ['ph-5-0037'] },
  { q: 'Thank you for calling.', a: 'You are welcome. See you.', fn: 'thanks', rank: 1 },
  { q: 'When is the office open?', a: 'From nine to five.', fn: 'time', rank: 1 },
  { q: 'Hello. Is this the office?', a: 'Yes, it is. Can I help you?', fn: 'confirm', rank: 1 },
  { q: 'Please tell {Ms. Park|@} that the chairs are ready.', a: 'Yes. I will tell her now.', fn: 'message', rank: 1 },
];

const QA_MAIL1: QaItem[] = [
  { q: 'Dear {Ms. Park|@}, can we meet on Friday?', a: 'Yes, Friday is fine.', fn: 'meet', rank: 1 },
  { q: 'Dear {Ms. Park|@}, please send me the price list.', a: 'I will send it today.', fn: 'request', rank: 1, grammar: ['gr-4-002'] },
  { q: 'Dear {Ms. Ruiz|@}, did you get my order?', a: 'Yes, I got it this morning.', fn: 'confirm', rank: 1, grammar: ['gr-5-019'] },
  { q: 'Dear {Mr. Lin|@}, when will the chairs come?', a: 'They will come on Monday.', fn: 'time', rank: 1, grammar: ['gr-4-002'] },
  { q: 'Dear {Mr. Bell|@}, how much is one box of paper?', a: 'It is four dollars.', fn: 'price', rank: 1, grammar: ['gr-5-014'] },
  { q: 'Dear all, thank you for your help this week.', a: 'You are welcome.', fn: 'thanks', rank: 1 },
  { q: 'Dear {Ms. Park|@}, I am sorry. I am late today.', a: 'That is all right. See you at ten.', fn: 'apology', rank: 1 },
  { q: 'Dear {Ms. Ruiz|@}, where is the meeting room?', a: 'It is on the second floor.', fn: 'place', rank: 1 },
];

const QA_MEMO1: QaItem[] = [
  { q: 'Please send the bill to {Mr. Grant|@}.', a: 'Yes. I will send it today.', fn: 'task', rank: 1, grammar: ['gr-5-011'] },
  { q: 'The meeting is on Friday, not Thursday.', a: 'Thank you. I will change the date.', fn: 'change', rank: 1 },
  { q: 'Please come to my desk after lunch.', a: 'Yes. I will come at one.', fn: 'invite', rank: 1 },
  { q: 'The office is closed on Sunday.', a: 'I see. Thank you.', fn: 'notice', rank: 1 },
  { q: 'Please check the order for {Ms. Ruiz|@}.', a: 'Yes. I will check it now.', fn: 'task', rank: 1 },
  { q: 'We have a meeting at ten. Please be early.', a: 'Yes. I will be there at 9:30.', fn: 'meet', rank: 1 },
];


const T1: TaskTemplate[] = [
  { id: 'ot_inv1', rank: 1, arch: 'check', say: 'Please check this bill.', fields: [
    { id: 'item', label: 'Item', values: ['paper', 'pens', 'cups', 'ink', 'chairs'] },
    { id: 'qty', label: 'Boxes', values: ['10', '12', '20', '30', '50'] },
    { id: 'price', label: 'Price', values: ['$2', '$3', '$4', '$5', '$8'] },
  ], docs: [{ kind: 'order', title: 'Order', fields: ['item', 'qty', 'price'] }, { kind: 'invoice', title: 'Bill', fields: ['item', 'qty', 'price'] }], target: 1, pWrong: 0.6 },
  { id: 'ot1_total', rank: 1, arch: 'check', say: 'Please check the total on the bill for {item}.', fields: [
    { id: 'item', label: 'Item', values: ['paper', 'pens', 'chairs', 'tea', 'cups', 'ink'] },
    { id: 'total', label: 'Total', values: ['$12', '$20', '$24', '$30', '$45', '$60'] },
  ], docs: [{ kind: 'order', title: 'Order', fields: ['item', 'total'] }, { kind: 'invoice', title: 'Bill', fields: ['item', 'total'] }], target: 1, pWrong: 0.6 },
  { id: 'ot1_dates', rank: 1, arch: 'check', say: 'Is the day on the bill right?', fields: [
    { id: 'item', label: 'Item', values: ['paper', 'pens', 'chairs', 'tea', 'ink'] },
    { id: 'day', label: 'Day', values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
    { id: 'date', label: 'Date', values: ['March 3', 'March 13', 'May 5', 'May 15', 'June 2', 'June 12'] },
  ], docs: [{ kind: 'order', title: 'Order', fields: ['item', 'day', 'date'] }, { kind: 'invoice', title: 'Bill', fields: ['item', 'day', 'date'] }], target: 1, pWrong: 0.65 },
  { id: 'ot1_name', rank: 1, arch: 'check', say: 'Please check the name and the address on this form.', fields: [
    { id: 'name', label: 'Name', values: ['{Mr. Grant|@}', '{Ms. Ruiz|@}', '{Mr. Lin|@}', '{Mr. Bell|@}'] },
    { id: 'address', label: 'Address', values: ['12 Bridge Street', '21 Bridge Street', '5 Station Street', '15 Station Street', '8 Market Street', '18 Market Street'] },
  ], docs: [{ kind: 'order', title: 'Order form', fields: ['name', 'address'] }, { kind: 'invoice', title: 'Bill', fields: ['name', 'address'] }], target: 1, pWrong: 0.6 },
  { id: 'ot1_receipt', rank: 1, arch: 'check', say: 'Please check the receipt for {item}.', fields: [
    { id: 'item', label: 'Item', values: ['lunch', 'tea', 'paper', 'pens', 'ink'] },
    { id: 'price', label: 'Price', values: ['$9', '$18', '$19', '$28', '$35', '$53'] },
  ], docs: [{ kind: 'note', title: 'Note', fields: ['item', 'price'] }, { kind: 'card', title: 'Receipt', fields: ['item', 'price'] }], target: 1, pWrong: 0.6 },
  { id: 'ot1_pay', rank: 1, arch: 'check', say: 'Is the day to pay the same on both papers?', fields: [
    { id: 'total', label: 'Total', values: ['$40', '$55', '$80', '$120'] },
    { id: 'day', label: 'Pay by', values: ['May 2', 'May 12', 'June 5', 'June 15', 'July 7', 'July 17'] },
  ], docs: [{ kind: 'note', title: 'Note', fields: ['total', 'day'] }, { kind: 'invoice', title: 'Bill', fields: ['total', 'day'] }], target: 1, pWrong: 0.6 },
  { id: 'ot1_plan', rank: 1, arch: 'check', say: 'Is the plan the same as the calendar?', fields: [
    { id: 'day', label: 'Meeting', values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    { id: 'time', label: 'Time', values: ['9:00', '10:00', '11:00', '2:00', '4:00'] },
    { id: 'room', label: 'Room', values: ['Room 1', 'Room 2', 'Room 3'] },
  ], docs: [{ kind: 'note', title: 'Plan', fields: ['day', 'time', 'room'] }, { kind: 'card', title: 'Calendar', fields: ['day', 'time', 'room'] }], target: 1, pWrong: 0.65 },
  {
    id: 'ot_meet', rank: 1, arch: 'respond', mode: 'slot', kind: 'email', say: 'An email from a client. Look at the week, please.', layout: 'calendar', rows: DAYS, cols: TIMES,
    cellTags: { t9: ['morning'], t11: ['morning'], t2: ['afternoon'], t4: ['afternoon'] },
    want: [
      { tag: 'mon', text: 'Can we meet on Monday?' }, { tag: 'tue', text: 'Can we meet on Tuesday?' }, { tag: 'wed', text: 'Can we meet on Wednesday?' }, { tag: 'thu', text: 'Can we meet on Thursday?' }, { tag: 'fri', text: 'Can we meet on Friday?' },
      { tag: 'morning', text: 'The morning is good for me.' }, { tag: 'afternoon', text: 'I can come in the afternoon.' },
    ],
    avoid: [
      { tag: 'fri', text: 'I am not in the office on Friday.' }, { tag: 'mon', text: 'I am busy on Monday.' }, { tag: 'morning', text: "I can't come in the morning." }, { tag: 'afternoon', text: 'The afternoon is not good for me.' }, { tag: 't4', text: 'Four is too late for me.' },
    ],
    busy: ['Meeting', 'Sales meeting', 'Lunch with a client', 'Busy', 'Call {Mr. Lin|@}'], open: ['Dear {Ms. Park|@},'], close: ['Thank you.'],
  },
  {
    id: 'ot1_room', rank: 1, arch: 'respond', mode: 'slot', kind: 'email', say: 'We need a room. Look at the plan, please.', layout: 'calendar', rows: ROOMS, cols: TIMES,
    cellTags: { t9: ['morning'], t11: ['morning'], t2: ['afternoon'], t4: ['afternoon'] },
    want: [
      { tag: 'r1', text: 'We need Room 1.' }, { tag: 'r2', text: 'We need Room 2.' }, { tag: 'r3', text: 'We need Room 3.' },
      { tag: 'morning', text: 'We want to meet in the morning.' }, { tag: 'afternoon', text: 'We want to meet in the afternoon.' }, { tag: 't11', text: 'We want to meet at 11:00.' }, { tag: 't2', text: 'We want to meet at 2:00.' },
    ],
    avoid: [{ tag: 'r1', text: 'Room 1 is too small.' }, { tag: 'r3', text: 'Room 3 is too cold.' }, { tag: 't9', text: 'Nine is too early.' }, { tag: 't4', text: 'Four is too late.' }],
    busy: ['Meeting', 'Lunch', 'Busy', 'Sales meeting'], open: ['Dear {Ms. Park|@},'], close: ['Thank you.'],
  },
  { id: 'ot_q', rank: 1, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'office1' },
  { id: 'ot1_phone', rank: 1, arch: 'respond', mode: 'choose', kind: 'phone', bank: 'phone1' },
  { id: 'ot1_mail', rank: 1, arch: 'respond', mode: 'choose', kind: 'email', bank: 'mail1' },
  { id: 'ot1_memo', rank: 1, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'memo1' },
];
// ---------------------------------------------------------------------------------------------- rank 2 templates and banks

const QA_SAY2: QaItem[] = [
  { q: 'Could you check the invoice before Friday?', a: 'Of course. I will check it today.', fn: 'request', rank: 2, phrases: ['ph-5-0061'], grammar: ['gr-4-002'] },
  { q: 'Sorry, the boxes are late.', a: 'No problem. When will they come?', fn: 'apology', rank: 2, phrases: ['ph-4-0016'] },
  { q: 'Did you get my email?', a: 'Yes, I got it this morning.', fn: 'confirm', rank: 2, grammar: ['gr-5-019'] },
  { q: 'Could we {change|change_v} the meeting to Thursday?', a: 'Yes, Thursday is fine.', fn: 'meet', rank: 2 },
  { q: 'Is {Ms. Park|@} in the office today?', a: 'No, she is out of the office until Monday.', fn: 'presence', rank: 2 },
  { q: 'Is the report ready?', a: 'Not yet. I will finish it this afternoon.', fn: 'status', rank: 2, grammar: ['gr-pre2-052'] },
  { q: 'Why is the delivery late?', a: 'Because the truck is broken.', fn: 'reason', rank: 2, grammar: ['gr-4-019'] },
  { q: 'Are you available on Friday afternoon?', a: 'Yes, I am free after two.', fn: 'avail', rank: 2, phrases: ['ph-2-0057'] },
  { q: 'Shall I send the bill to {Mr. Grant|@}?', a: 'Yes, please. Thank you.', fn: 'offer', rank: 2, phrases: ['ph-4-0006'] },
  { q: 'I am afraid I can\'t come to the meeting.', a: 'That is all right. I will send you the notes.', fn: 'refusal', rank: 2, phrases: ['ph-3-0009'] },
  { q: 'How many units do you need?', a: 'We need fifty units.', fn: 'number', rank: 2, grammar: ['gr-5-014'] },
  { q: 'What is the total on the invoice?', a: 'It is four hundred and eighty dollars.', fn: 'price', rank: 2 },
  { q: 'When is the deadline?', a: 'It is next Friday at five.', fn: 'time', rank: 2 },
  { q: 'Would you like some coffee?', a: 'Yes, please. That would be nice.', fn: 'invite', rank: 2, grammar: ['gr-4-007'] },
  { q: 'Can you tell me the order number?', a: 'Yes, it is 4 6 2 0.', fn: 'info', rank: 2 },
  { q: 'Thank you for your quick reply.', a: 'Not at all. Please call me if you have any questions.', fn: 'thanks', rank: 2, phrases: ['ph-pre2-0035'] },
  { q: 'Can you order a taxi for {Mr. Grant|@}?', a: 'Yes. I will call the taxi company now.', fn: 'request', rank: 2 },
  { q: 'Is the driver here yet?', a: 'Not yet. He will arrive at ten.', fn: 'status', rank: 2 },
  { q: 'Are the pens in stock?', a: 'No, they are out of stock. We expect them on Friday.', fn: 'stock', rank: 2, phrases: ['ph-pre2-0062'] },
  { q: 'Is the holiday on Monday or Tuesday?', a: 'It is on Monday.', fn: 'time', rank: 2 },
  { q: 'How much is the expense claim for the train?', a: 'It is forty-two dollars.', fn: 'price', rank: 2 },
];

const QA_PHONE2: QaItem[] = [
  { q: 'Could I speak to {Ms. Park|@}, please?', a: 'I am afraid she is out. Can I take a message?', fn: 'transfer', rank: 2, phrases: ['ph-3-0002'] },
  { q: 'Please hold the line.', a: 'Thank you. I will wait.', fn: 'hold', rank: 2, phrases: ['ph-pre2-0397'] },
  { q: 'Can you tell me your phone number?', a: 'Yes. It is 4 5 8 2.', fn: 'number', rank: 2 },
  { q: 'I am calling about my order.', a: 'Yes. What is your order number?', fn: 'order', rank: 2 },
  { q: 'Is the manager in today?', a: 'Yes. Just a moment, please.', fn: 'presence', rank: 2 },
  { q: 'I would like to cancel my order.', a: 'Of course. I will cancel it now.', fn: 'cancel', rank: 2, phrases: ['ph-pre2-0065'] },
  { q: 'When will my boxes arrive?', a: 'They will arrive on Thursday.', fn: 'time', rank: 2, grammar: ['gr-4-002'] },
  { q: 'Thank you for calling.', a: 'You are welcome. See you.', fn: 'thanks', rank: 2 },
  { q: 'Sorry, I have the wrong number.', a: 'That is all right.', fn: 'apology', rank: 2 },
  { q: 'Is my order ready for delivery?', a: 'Yes. We will deliver it tomorrow.', fn: 'status', rank: 2 },
  { q: 'I have a question about the quote.', a: 'Of course. What would you like to know?', fn: 'question', rank: 2 },
];

const QA_MAIL2: QaItem[] = [
  { q: 'Dear {Ms. Ruiz|@}, please find attached the price list.', a: 'Thank you. I will read it today.', fn: 'attach', rank: 2, phrases: ['ph-pre2-0030'] },
  { q: 'Dear {Mr. Lin|@}, I am sorry for the delay.', a: 'That is all right. When will it arrive?', fn: 'apology', rank: 2 },
  { q: 'Dear {Ms. Park|@}, can we {change|change_v} the meeting to Thursday?', a: 'Yes, Thursday is fine.', fn: 'meet', rank: 2 },
  { q: 'Dear {Mr. Bell|@}, the invoice is not right.', a: 'I am sorry. I will check it and write back today.', fn: 'problem', rank: 2 },
  { q: 'Dear {Mr. Grant|@}, we sent your order today.', a: 'Thank you. When will it arrive?', fn: 'shipped', rank: 2, phrases: ['ph-pre2-0038'] },
  { q: 'Dear all, the office will be closed on Monday.', a: 'Thank you for telling us.', fn: 'notice', rank: 2 },
  { q: 'Dear {Ms. Park|@}, could you send me the report by Friday?', a: 'Of course. I will send it on Thursday.', fn: 'request', rank: 2 },
  { q: 'Dear {Ms. Ruiz|@}, we would like to invite you to the meeting.', a: 'Thank you. I would be happy to come.', fn: 'invite', rank: 2, phrases: ['ph-2-0035'] },
  { q: 'Dear {Mr. Lin|@}, thank you for your quick reply.', a: 'You are welcome.', fn: 'thanks', rank: 2 },
  { q: 'Dear {Ms. Park|@}, the quote is attached. The delivery will take two weeks.', a: 'Thank you. Two weeks is fine.', fn: 'attach2', rank: 2 },
  { q: 'Dear {Mr. Bell|@}, the expense claim is not ready. I need the receipt.', a: 'Please send the receipt and I will finish it.', fn: 'claim', rank: 2 },
];

const QA_MEMO2: QaItem[] = [
  { q: 'Please bring the March report to the meeting.', a: 'Yes. I will bring it on Thursday.', fn: 'task', rank: 2 },
  { q: 'The meeting is now in Room 3.', a: 'Thank you. I will tell the team.', fn: 'change', rank: 2 },
  { q: 'The deadline for the budget is Friday.', a: 'I see. I will finish it before Friday.', fn: 'deadline', rank: 2 },
  { q: 'The big copy machine is out of order.', a: 'Thank you. I will use the machine in Room 3.', fn: 'notice', rank: 2, phrases: ['ph-pre2-0053'] },
  { q: 'The office will be closed on Monday for the holiday.', a: 'Thank you. See you on Tuesday.', fn: 'closed', rank: 2 },
  { q: 'Please send the invoice to {Mr. Grant|@} today.', a: 'Yes. I will send it this afternoon.', fn: 'send', rank: 2 },
];

/** Sentence completion (Part 5 style): the answers of the other kinds are the distractors, so each gap needs one kind of word. */
const QA_GAP2: QaItem[] = [
  { q: 'Please send the ___ to {Mr. Bell|@} today.', a: 'confirmation', fn: 'noun', rank: 2, grammar: ['gr-3-034'] },
  { q: 'We are waiting for your ___ on Friday.', a: 'payment', fn: 'noun', rank: 2, grammar: ['gr-3-034'] },
  { q: 'We must ___ the order today.', a: 'confirm', fn: 'verb', rank: 2, grammar: ['gr-3-039'] },
  { q: 'Please ___ the meeting on Friday.', a: 'attend', fn: 'verb', rank: 2, grammar: ['gr-3-039'] },
  { q: 'The meeting room is ___ on Friday.', a: 'available', fn: 'adj', rank: 2, grammar: ['gr-3-035'] },
  { q: 'This is an ___ message. Please read it now.', a: 'urgent', fn: 'adj', rank: 2, grammar: ['gr-3-035'] },
  { q: 'Please answer the email ___.', a: 'quickly', fn: 'adv', rank: 2, grammar: ['gr-3-036'] },
  { q: 'The boxes arrived ___ on Monday.', a: 'safely', fn: 'adv', rank: 2, grammar: ['gr-3-036'] },
  { q: 'We will meet ___ Thursday.', a: 'on', fn: 'prep', rank: 2, grammar: ['gr-5-021'] },
  { q: 'The boxes will come ___ two days.', a: 'within', fn: 'prep', rank: 2, grammar: ['gr-pre2-037'] },
  { q: 'We could not send it ___ it was out of stock.', a: 'because', fn: 'conj', rank: 2, grammar: ['gr-pre2-034'] },
  { q: 'Please call me ___ you arrive.', a: 'when', fn: 'conj', rank: 2, grammar: ['gr-3-019'] },
];

const T2: TaskTemplate[] = [
  { id: 'ot_inv2', rank: 2, arch: 'check', say: 'Please check the invoice with the purchase order.', fields: [
    { id: 'num', label: 'Order number', values: ['4512', '4521', '4152', '5412'] },
    { id: 'item', label: 'Item', values: ['paper', 'pens', 'chairs', 'envelopes', 'ink', 'folders'] },
    { id: 'units', label: 'Units', values: ['10', '12', '20', '30', '50'] },
    { id: 'price', label: 'Unit price', values: ['$2', '$3', '$4', '$5', '$8'] },
  ], docs: [{ kind: 'order', title: 'Purchase Order', fields: ['num', 'item', 'units', 'price'] }, { kind: 'invoice', title: 'Invoice', fields: ['num', 'item', 'units', 'price'] }], target: 1, pWrong: 0.65 },
  { id: 'ot2_deliv', rank: 2, arch: 'check', say: 'Please check the delivery note with the purchase order for {item}.', fields: [
    { id: 'num', label: 'Order number', values: ['4620', '4602', '4260', '6420'] },
    { id: 'item', label: 'Item', values: ['envelopes', 'folders', 'pens', 'paper', 'chairs'] },
    { id: 'units', label: 'Units', values: ['20', '25', '40', '50', '100'] },
  ], docs: [{ kind: 'order', title: 'Purchase Order', fields: ['num', 'item', 'units'] }, { kind: 'note', title: 'Delivery Note', fields: ['num', 'item', 'units'] }], target: 1, pWrong: 0.65 },
  { id: 'ot2_expense', rank: 2, arch: 'check', say: 'Please check this expense claim. Is the total right?', fields: [
    { id: 'date', label: 'Date', values: ['March 8', 'March 18', 'April 3', 'April 13'] },
    { id: 'item', label: 'Item', values: ['lunch', 'taxi', 'train', 'hotel', 'tea'] },
    { id: 'total', label: 'Total', values: ['$16', '$24', '$42', '$60', '$85'] },
  ], docs: [{ kind: 'card', title: 'Receipt', fields: ['date', 'item', 'total'] }, { kind: 'note', title: 'Expense Claim', fields: ['date', 'item', 'total'] }], target: 1, pWrong: 0.65 },
  { id: 'ot2_quote', rank: 2, arch: 'check', say: 'The quote and the order must have the same price. Please check.', fields: [
    { id: 'item', label: 'Item', values: ['chairs', 'desks', 'pens', 'paper', 'folders'] },
    { id: 'units', label: 'Units', values: ['10', '20', '30', '50'] },
    { id: 'price', label: 'Unit price', values: ['$12', '$20', '$30', '$45'] },
  ], docs: [{ kind: 'card', title: 'Quote', fields: ['item', 'units', 'price'] }, { kind: 'order', title: 'Purchase Order', fields: ['item', 'units', 'price'] }], target: 1, pWrong: 0.6 },
  { id: 'ot2_ship', rank: 2, arch: 'check', say: 'The email says when the ship comes. Is the schedule right?', fields: [
    { id: 'leave', label: 'Leaves', values: ['Monday', 'Tuesday', 'Wednesday'] },
    { id: 'arrive', label: 'Arrives', values: ['Thursday', 'Friday', 'Saturday'] },
  ], docs: [{ kind: 'letter', title: 'Email', lines: ['The ship leaves on {leave}.', 'It will arrive on {arrive}.'] }, { kind: 'note', title: 'Schedule', fields: ['leave', 'arrive'] }], target: 1, pWrong: 0.65 },
  { id: 'ot2_ad', rank: 2, arch: 'check', say: 'Is the job ad the same as the form?', fields: [
    { id: 'job', label: 'Job', values: ['clerk', 'driver', 'manager'] },
    { id: 'days', label: 'Work', values: ['Monday to Friday', 'Monday to Wednesday', 'Thursday to Saturday'] },
    { id: 'start', label: 'Start', values: ['March 1', 'March 11', 'April 2', 'April 12'] },
  ], docs: [{ kind: 'card', title: 'Job Ad', fields: ['job', 'days', 'start'] }, { kind: 'order', title: 'Form', fields: ['job', 'days', 'start'] }], target: 1, pWrong: 0.65 },
  { id: 'ot2_meeting', rank: 2, arch: 'check', say: 'The notice says when the meeting is. Is the calendar right?', fields: [
    { id: 'day', label: 'Day', values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    { id: 'time', label: 'Time', values: ['9:30', '11:00', '1:30', '3:00'] },
    { id: 'room', label: 'Room', values: ['Room 1', 'Room 2', 'Room 3'] },
  ], docs: [{ kind: 'letter', title: 'Notice', lines: ['The meeting is on {day} at {time}.', 'We will meet in {room}.'] }, { kind: 'card', title: 'Calendar', fields: ['day', 'time', 'room'] }], target: 1, pWrong: 0.65 },
  {
    id: 'ot2_meet', rank: 2, arch: 'respond', mode: 'slot', kind: 'email', say: 'An email from a client. Look at the week, please.', layout: 'calendar', rows: DAYS, cols: TIMES2,
    cellTags: { t9: ['morning'], t11: ['morning'], t1: ['afternoon'], t3: ['afternoon'] },
    want: [
      { tag: 'mon', text: 'Can we meet on Monday?' }, { tag: 'tue', text: 'Can we meet on Tuesday?' }, { tag: 'wed', text: 'Could we meet on Wednesday?' }, { tag: 'thu', text: 'Could we meet on Thursday?' }, { tag: 'fri', text: 'Are you available on Friday?' },
      { tag: 'morning', text: 'I would like to come in the morning.' }, { tag: 'afternoon', text: 'The afternoon is best for me.' },
    ],
    avoid: [
      { tag: 'fri', text: 'I am not available on Friday.' }, { tag: 'mon', text: 'I am out of the office on Monday.' }, { tag: 't9', text: 'I can\'t come before ten.' }, { tag: 't3', text: 'I must leave by two.' }, { tag: 'tue', text: 'Tuesday is not possible.' },
    ],
    busy: ['Meeting', 'Sales meeting', 'Lunch with a client', 'Busy', 'Call {Mr. Lin|@}', 'Lunch'], open: ['Dear {Ms. Park|@},'], close: ['Best regards,'],
  },
  {
    id: 'ot2_room', rank: 2, arch: 'respond', mode: 'slot', kind: 'email', say: 'We need a room. Look at the plan, please.', layout: 'calendar', rows: ROOMS, cols: TIMES2,
    cellTags: { t9: ['morning'], t11: ['morning'], t1: ['afternoon'], t3: ['afternoon'] },
    want: [
      { tag: 'r1', text: 'We need Room 1 for the meeting.' }, { tag: 'r2', text: 'We need Room 2 for the meeting.' }, { tag: 'r3', text: 'We need Room 3 for the meeting.' },
      { tag: 'morning', text: 'We would like to meet in the morning.' }, { tag: 'afternoon', text: 'We would like to meet in the afternoon.' }, { tag: 't11', text: 'We would like to start at eleven.' }, { tag: 't1', text: 'We would like to start at 1:30.' },
    ],
    avoid: [{ tag: 'r1', text: 'Room 1 is too small.' }, { tag: 'r3', text: 'Room 3 is too hot.' }, { tag: 't9', text: 'Nine thirty is too early.' }, { tag: 't3', text: 'Three is too late.' }],
    busy: ['Meeting', 'Lunch', 'Busy', 'Sales meeting'], open: ['Dear {Ms. Park|@},'], close: ['Best regards,'],
  },
  { id: 'ot2_say', rank: 2, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'office2' },
  { id: 'ot2_phone', rank: 2, arch: 'respond', mode: 'choose', kind: 'phone', bank: 'phone2' },
  { id: 'ot2_mail', rank: 2, arch: 'respond', mode: 'choose', kind: 'email', bank: 'mail2' },
  { id: 'ot2_memo', rank: 2, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'memo2' },
  { id: 'ot2_gap', rank: 2, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'gap2' },
];

// ---------------------------------------------------------------------------------------------- rank 3 templates and banks

const QA_SAY3: QaItem[] = [
  { q: 'I was wondering if you could send me the contract.', a: 'Of course. I will send it today.', fn: 'request', rank: 3, phrases: ['ph-pre2-0111'], grammar: ['gr-pre2-008'] },
  { q: 'Would it be possible to meet on Monday instead?', a: 'Yes, Monday should be fine.', fn: 'meet', rank: 3, phrases: ['ph-pre2-0110'] },
  { q: 'I am afraid the shipment will be late.', a: 'I see. When do you expect it to arrive?', fn: 'delay', rank: 3, grammar: ['gr-3-014'] },
  { q: 'Do you mind if I open the window?', a: 'Not at all. Please go ahead.', fn: 'permission', rank: 3, phrases: ['ph-3-0007'] },
  { q: 'Have you finished the report yet?', a: 'Not yet, but I will finish it by noon.', fn: 'status', rank: 3, grammar: ['gr-pre2-052'] },
  { q: 'Why did sales fall in April?', a: 'Because we had fewer clients that month.', fn: 'reason', rank: 3, grammar: ['gr-pre2-034'] },
  { q: 'Could you tell me where the meeting room is?', a: 'It is at the end of the hall.', fn: 'place', rank: 3, phrases: ['ph-3-0027'] },
  { q: 'I would like to cancel my order, if possible.', a: 'Certainly. Could I have your order number?', fn: 'cancel', rank: 3 },
  { q: 'Thank you for your help with the invoice.', a: 'It was my pleasure.', fn: 'thanks', rank: 3, phrases: ['ph-pre2-0116'] },
  { q: 'How soon can you deliver the chairs?', a: 'We can deliver them within a week.', fn: 'time', rank: 3, grammar: ['gr-pre2-037'] },
  { q: 'Is there a discount for a large order?', a: 'Yes, we give ten percent on orders over a hundred units.', fn: 'offer', rank: 3 },
  { q: 'Who is in charge of the new project?', a: '{Ms. Ruiz|@} is. She started last month.', fn: 'person', rank: 3, phrases: ['ph-2-0049'] },
  { q: 'I would like to apply for the sales position.', a: 'Thank you. Please send your application to {Ms. Weber|@}.', fn: 'apply', rank: 3 },
  { q: 'Have you reserved the hotel for the trip?', a: 'Yes. I reserved two rooms for Tuesday.', fn: 'reserve', rank: 3, grammar: ['gr-3-002'] },
  { q: 'Is the warranty still valid?', a: 'Yes, it is valid for one more year.', fn: 'warranty', rank: 3 },
  { q: 'Has the package arrived?', a: 'Not yet. The driver said it would be here soon.', fn: 'status', rank: 3 },
  { q: 'How many employees work in the sales department?', a: 'There are twelve employees, and we will employ two more.', fn: 'number2', rank: 3 },
  { q: 'Where are the instructions for the new machine?', a: 'They are in the folder on the shelf.', fn: 'place2', rank: 3 },
  { q: 'Could you install the new program on my computer?', a: 'Of course. I will do it this afternoon.', fn: 'install', rank: 3 },
  { q: 'Is the proposal from the supplier reasonable?', a: 'Yes. The price is competitive, and the delivery is fast.', fn: 'opinion', rank: 3 },
];

const QA_PHONE3: QaItem[] = [
  { q: 'Hello. I am calling to confirm our meeting on Thursday.', a: 'Yes, Thursday at two is fine.', fn: 'confirm', rank: 3 },
  { q: 'I would like to speak to someone in the sales department.', a: 'Certainly. I will put you through.', fn: 'transfer', rank: 3, phrases: ['ph-2-0050'] },
  { q: 'I am afraid {Ms. Park|@} is not available at the moment.', a: 'Could you ask her to call me back?', fn: 'callback', rank: 3, grammar: ['gr-3-014'] },
  { q: 'Could you give me your phone number?', a: 'Yes. It is 4 5 8 2.', fn: 'number', rank: 3 },
  { q: 'Your order will be shipped tomorrow.', a: 'Thank you. Could you send me the tracking number?', fn: 'shipped', rank: 3, phrases: ['ph-2-0304'] },
  { q: 'I am calling about invoice 7731.', a: 'One moment. I will find it for you.', fn: 'invoice', rank: 3 },
  { q: 'I am sorry to keep you waiting.', a: 'That is all right. Thank you for your patience.', fn: 'waiting', rank: 3 },
  { q: 'We can not deliver on Monday.', a: 'That is a problem. Could you deliver on Tuesday?', fn: 'problem', rank: 3 },
  { q: 'We would like to know about your new product.', a: 'Certainly. I will send you the list.', fn: 'product', rank: 3 },
  { q: 'Is the interview still on Tuesday?', a: 'Yes. Please be at the office at 2:30.', fn: 'interview', rank: 3 },
];

const QA_MAIL3: QaItem[] = [
  { q: 'Dear {Ms. Park|@}, thank you for your inquiry. The price list is attached.', a: 'Dear {Mr. Lin|@}, thank you for the price list. I will review it and reply by Friday.', fn: 'attach', rank: 3 },
  { q: 'We regret to inform you that the item is no longer available.', a: 'Thank you for letting us know. Please send us a list of similar items.', fn: 'regret', rank: 3, phrases: ['ph-2-0017'] },
  { q: 'We apologize for the delay in delivery.', a: 'Thank you. Please let us know the new delivery date.', fn: 'apology', rank: 3, phrases: ['ph-pre2-0037'] },
  { q: 'Please confirm that you received our invoice.', a: 'I confirm that we received the invoice on Monday.', fn: 'confirm', rank: 3 },
  { q: 'We are pleased to announce that our new office will open on April 3.', a: 'That is good news. We would be glad to visit you.', fn: 'news', rank: 3, phrases: ['ph-2-0018'] },
  { q: 'Please let me know if you have any questions.', a: 'Thank you. I have no questions at the moment.', fn: 'offer', rank: 3, phrases: ['ph-2-0021'] },
  { q: 'We would like to invite you to our annual meeting.', a: 'Thank you. I would be happy to attend.', fn: 'invite', rank: 3, phrases: ['ph-2-0035'] },
  { q: 'The payment is now ten days overdue.', a: 'I am sorry. We will pay it today.', fn: 'reminder', rank: 3 },
  { q: 'Please keep the receipt; it is proof of the warranty.', a: 'Thank you. I will keep it in a safe place.', fn: 'warranty', rank: 3 },
  { q: 'Unfortunately, the interview must be moved to Thursday.', a: 'That is no problem. Thursday suits me well.', fn: 'move', rank: 3 },
  { q: 'Please submit your application form by Friday.', a: 'Thank you. I will submit it today.', fn: 'submit', rank: 3 },
  { q: 'We would like to reject the first offer, but we are ready to talk.', a: 'Thank you. We will send a new proposal on Monday.', fn: 'reject', rank: 3 },
];

/** Indirect wording: the reply shows that the real request was understood. */
const QA_INTENT3: QaItem[] = [
  { q: 'It is already ten past nine, and the meeting began at nine.', a: 'I am sorry. I am coming now.', fn: 'late', rank: 3 },
  { q: 'It is rather hot in this room.', a: 'Shall I open a window?', fn: 'comfort', rank: 3, phrases: ['ph-4-0006'] },
  { q: 'I have not received the price list yet.', a: 'I am sorry. I will send it again now.', fn: 'missing', rank: 3, grammar: ['gr-pre2-052'] },
  { q: 'The report is a little short.', a: 'I see. I will add more figures.', fn: 'feedback', rank: 3 },
  { q: 'Our budget for travel is almost finished.', a: 'Then I will take the cheaper train.', fn: 'budget', rank: 3 },
  { q: 'There are no more envelopes on the desk.', a: 'I will order some today.', fn: 'supply', rank: 3 },
  { q: 'The invoice has not been paid yet.', a: 'I am sorry. I will pay it today.', fn: 'remind', rank: 3, grammar: ['gr-3-005'] },
];

/** Part 5 / 6: relative pronouns, pronoun case, concession, tense, comparison. */
const QA_GAP3: QaItem[] = [
  { q: 'The clerk ___ answered the phone is new.', a: 'who', fn: 'who', rank: 3, grammar: ['gr-3-007'] },
  { q: 'The invoice ___ arrived today is wrong.', a: 'which', fn: 'which', rank: 3, grammar: ['gr-3-007'] },
  { q: 'Please send ___ the price list.', a: 'us', fn: 'obj', rank: 3, grammar: ['gr-3-042'] },
  { q: 'The staff are proud of ___ work.', a: 'their', fn: 'poss', rank: 3, grammar: ['gr-3-043'] },
  { q: 'The shop was busy ___ the rain.', a: 'despite', fn: 'link', rank: 3, grammar: ['gr-pre2-033'] },
  { q: 'We could not leave ___ the shipment was late.', a: 'because', fn: 'link', rank: 3, grammar: ['gr-pre2-034'] },
  { q: 'We have already ___ the order.', a: 'sent', fn: 'verb', rank: 3, grammar: ['gr-3-002'] },
  { q: 'The new price list is ___ than the old one.', a: 'cheaper', fn: 'comp', rank: 3, grammar: ['gr-pre2-050'] },
  { q: 'We have worked together ___ 2020.', a: 'since', fn: 'link', rank: 3, grammar: ['gr-3-021'] },
  { q: 'The manager asked us ___ the meeting early.', a: 'to start', fn: 'inf', rank: 3, grammar: ['gr-3-014'] },
  { q: 'Please ___ the form to the personnel office.', a: 'submit', fn: 'verb', rank: 3, grammar: ['gr-3-039'] },
  { q: 'The company will ___ two new clerks next month.', a: 'employ', fn: 'verb', rank: 3, grammar: ['gr-3-039'] },
  { q: 'Please read the ___ before you start the machine.', a: 'instructions', fn: 'noun', rank: 3, grammar: ['gr-3-034'] },
  { q: 'We need an ___ list of the stock.', a: 'accurate', fn: 'adjw', rank: 3, grammar: ['gr-3-035'] },
];

const T3: TaskTemplate[] = [
  { id: 'ot_inv3', rank: 3, arch: 'check', say: 'Check the invoice with the order and the delivery note, please.', fields: [
    { id: 'num', label: 'Order number', values: ['4512', '4521', '4152', '5412'] },
    { id: 'item', label: 'Item', values: ['paper', 'pens', 'chairs', 'envelopes', 'ink', 'folders'] },
    { id: 'qty', label: 'Quantity', values: ['10', '12', '20', '30', '50'] },
    { id: 'price', label: 'Unit price', values: ['$2', '$3', '$4', '$5', '$8'] },
    { id: 'date', label: 'Delivery date', values: ['March 3', 'March 13', 'April 3', 'April 30', 'May 13'] },
  ], docs: [{ kind: 'order', title: 'Purchase Order', fields: ['num', 'item', 'qty', 'price'] }, { kind: 'note', title: 'Delivery Note', fields: ['num', 'item', 'qty', 'date'] }, { kind: 'invoice', title: 'Invoice', fields: ['num', 'item', 'qty', 'price', 'date'] }], target: 2, pWrong: 0.65 },
  { id: 'ot3_quote', rank: 3, arch: 'check', say: 'Please check the invoice against the quote. Are the discount and the total right for the {item}?', fields: [
    { id: 'item', label: 'Item', values: ['chairs', 'desks', 'pens', 'paper'] },
    { id: 'qty', label: 'Quantity', values: ['20', '40', '100'] },
    { id: 'disc', label: 'Discount', values: ['5%', '10%', '15%'] },
    { id: 'total', label: 'Total', values: ['$540', '$600', '$960', '$1,200'] },
  ], docs: [{ kind: 'card', title: 'Quote', fields: ['item', 'qty', 'disc', 'total'] }, { kind: 'invoice', title: 'Invoice', fields: ['item', 'qty', 'disc', 'total'] }], target: 1, pWrong: 0.7 },
  { id: 'ot3_contract', rank: 3, arch: 'check', say: 'The contract must say what the client wrote. Is it right?', fields: [
    { id: 'pay', label: 'Payment due', values: ['15 days', '30 days', '60 days'] },
    { id: 'start', label: 'Start', values: ['March 1', 'April 1', 'May 1'] },
    { id: 'sign', label: 'Signed by', values: ['{Ms. Park|@}', '{Mr. Bell|@}'] },
  ], docs: [{ kind: 'letter', title: 'Email', lines: ['We will sign the contract if the payment is due within {pay}.', 'The first delivery should be on {start}.'] }, { kind: 'card', title: 'Contract', fields: ['pay', 'start', 'sign'] }], target: 1, pWrong: 0.65, wrongable: ['pay', 'start'] },
  { id: 'ot3_interview', rank: 3, arch: 'check', say: 'The candidate wrote to us. Is the interview on the schedule right?', fields: [
    { id: 'day', label: 'Day', values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday'] },
    { id: 'time', label: 'Time', values: ['9:30', '11:00', '1:30', '3:00'] },
    { id: 'who', label: 'Candidate', values: ['{Ken|@}', '{Mr. Santos|@}', '{Ms. Weber|@}'] },
  ], docs: [{ kind: 'letter', title: 'Email', lines: ['Thank you for inviting me to an interview.', 'I will be at your office on {day} at {time}.'] }, { kind: 'card', title: 'Interview Schedule', fields: ['day', 'time', 'who'] }], target: 1, pWrong: 0.65, wrongable: ['day', 'time'] },
  { id: 'ot3_transfer', rank: 3, arch: 'check', say: 'Please check the bank statement. Is the payment the same as on the invoice?', fields: [
    { id: 'num', label: 'Invoice number', values: ['7731', '7713', '7371'] },
    { id: 'total', label: 'Total', values: ['$480', '$840', '$1,020', '$1,200'] },
    { id: 'date', label: 'Date', values: ['March 12', 'March 21', 'April 2'] },
  ], docs: [{ kind: 'invoice', title: 'Invoice', fields: ['num', 'total'] }, { kind: 'card', title: 'Bank Statement', fields: ['num', 'total', 'date'] }], target: 1, pWrong: 0.65, wrongable: ['num', 'total'] },
  {
    id: 'ot3_meet', rank: 3, arch: 'respond', mode: 'slot', kind: 'email', say: 'A client wants to meet. Read the email and look at the week.', layout: 'calendar', rows: DAYS, cols: TIMES2,
    cellTags: { t9: ['morning'], t11: ['morning'], t1: ['afternoon'], t3: ['afternoon'] },
    want: [
      { tag: 'mon', text: 'Would Monday suit you?' }, { tag: 'tue', text: 'I would prefer to meet on Tuesday.' }, { tag: 'wed', text: 'Would it be possible to meet on Wednesday?' }, { tag: 'thu', text: 'I was hoping to meet on Thursday.' }, { tag: 'fri', text: 'Could we possibly meet on Friday?' },
      { tag: 'morning', text: 'Any time before lunch would be fine.' }, { tag: 'afternoon', text: 'I would prefer an afternoon meeting.' },
    ],
    avoid: [
      { tag: 'fri', text: 'I am afraid I will be abroad on Friday.' }, { tag: 'wed', text: 'Wednesday is not possible for me.' }, { tag: 't9', text: 'I can not come before ten.' }, { tag: 't3', text: 'I must leave the office by two.' }, { tag: 'mon', text: 'I have another meeting on Monday.' },
    ],
    busy: ['Meeting', 'Sales meeting', 'Lunch with a client', 'Busy', 'Call {Mr. Lin|@}', 'Interview'], open: ['Dear {Ms. Park|@},'], close: ['Please let me know if that is possible.'],
  },
  {
    id: 'ot3_room', rank: 3, arch: 'respond', mode: 'slot', kind: 'email', say: 'We need a room. Read the email and look at the plan.', layout: 'calendar', rows: ROOMS, cols: TIMES2,
    cellTags: { t9: ['morning'], t11: ['morning'], t1: ['afternoon'], t3: ['afternoon'] },
    want: [
      { tag: 'r1', text: 'We would like to use Room 1.' }, { tag: 'r2', text: 'Room 2 would be best for us.' }, { tag: 'r3', text: 'Could we have Room 3?' },
      { tag: 'morning', text: 'We would like the meeting to be before lunch.' }, { tag: 'afternoon', text: 'We would like the meeting to be after lunch.' }, { tag: 't11', text: 'Eleven would be ideal.' }, { tag: 't3', text: 'We would like to start at three.' },
    ],
    avoid: [{ tag: 'r1', text: 'Room 1 is too small for us.' }, { tag: 'r3', text: 'Room 3 is too noisy.' }, { tag: 't9', text: 'Half past nine is too early.' }, { tag: 't1', text: 'We are busy at lunch.' }],
    busy: ['Meeting', 'Interview', 'Busy', 'Sales meeting'], open: ['Dear {Ms. Park|@},'], close: ['Thank you for your help.'],
  },
  { id: 'ot3_say', rank: 3, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'office3' },
  { id: 'ot3_phone', rank: 3, arch: 'respond', mode: 'choose', kind: 'phone', bank: 'phone3' },
  { id: 'ot3_mail', rank: 3, arch: 'respond', mode: 'choose', kind: 'email', bank: 'mail3' },
  { id: 'ot3_intent', rank: 3, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'intent3' },
  { id: 'ot3_gap', rank: 3, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'gap3' },
];

// ---------------------------------------------------------------------------------------------- rank 4 templates and banks

const QA_SAY4: QaItem[] = [
  { q: 'I would appreciate it if you could review the draft by Friday.', a: 'Certainly. I will send my comments on Thursday.', fn: 'request', rank: 4, phrases: ['ph-pre2-0181'], grammar: ['gr-pre2-008'] },
  { q: 'We are unable to accommodate a delivery on Monday.', a: 'I understand. Could you suggest another day?', fn: 'refusal', rank: 4, phrases: ['ph-pre1-0013'] },
  { q: 'Should you need any further assistance, please contact me.', a: 'Thank you. I will do so if necessary.', fn: 'offer', rank: 4, phrases: ['ph-pre1-0066'], grammar: ['gr-2-015'] },
  { q: 'I am afraid I can\'t attend the meeting on Friday.', a: 'That is a pity. We will send you the minutes.', fn: 'apology', rank: 4 },
  { q: 'Who is in charge of the audit this year?', a: '{Mr. Bell|@} is, but he retires next month.', fn: 'person', rank: 4, phrases: ['ph-2-0049'] },
  { q: 'What time will the shipment arrive?', a: 'It should arrive before noon, if the weather allows.', fn: 'time', rank: 4, grammar: ['gr-3-018'] },
  { q: 'Has the contract been signed yet?', a: 'Not yet. We are waiting for the legal office to approve it.', fn: 'status', rank: 4, grammar: ['gr-3-005'] },
  { q: 'Do you think we should accept their offer?', a: 'I think we should counter with a slightly lower price.', fn: 'opinion', rank: 4 },
  { q: 'Why did the costs rise so much?', a: 'Mainly because the ship costs more now.', fn: 'reason', rank: 4 },
  { q: 'Would you mind taking over this project while I am away?', a: 'Not at all. I would be glad to.', fn: 'permission', rank: 4, phrases: ['ph-3-0006'], grammar: ['gr-3-019'] },
  { q: 'Is there anything else I can do for you?', a: 'No, thank you. That is all for today.', fn: 'closing', rank: 4, phrases: ['ph-pre2-0011'] },
  { q: 'Could you give me an estimate for the new order?', a: 'Of course. I will send you one by the end of the day.', fn: 'estimate', rank: 4, phrases: ['ph-2-0518'] },
  { q: 'Could you arrange an appointment with the client for next week?', a: 'Certainly. I will check when they are available.', fn: 'appoint', rank: 4 },
  { q: 'Please advise us whether the price includes delivery.', a: 'It includes delivery within the city.', fn: 'include', rank: 4 },
  { q: 'Would Thursday at three be convenient for you?', a: 'Yes, that is convenient. I will see you then.', fn: 'convenient', rank: 4 },
  { q: 'Could you correct the figures in the second table?', a: 'Yes. I will correct them and send the file again.', fn: 'correct', rank: 4 },
  { q: 'Do the prices depend on the amount?', a: 'Yes. The more you buy, the lower the price.', fn: 'depend', rank: 4, grammar: ['gr-pre2-016'] },
  { q: 'Will the meeting continue after lunch?', a: 'Yes. We will continue at two.', fn: 'continue', rank: 4 },
  { q: 'Is the information in this report clear?', a: 'Yes, but a few numbers need to be checked.', fn: 'clear', rank: 4 },
  { q: 'What is the first item on the agenda?', a: 'The sales forecast for next year.', fn: 'agenda', rank: 4, phrases: ['ph-2-0061'] },
  { q: 'Is the supplier responsible for the damage?', a: 'According to clause 5, the supplier has no liability after delivery.', fn: 'liability', rank: 4 },
  { q: 'Our competitors now have lower prices.', a: 'Then we should negotiate a better price with our supplier.', fn: 'strategy', rank: 4 },
  { q: 'Who will review the contract?', a: 'The legal adviser will go through every clause.', fn: 'review', rank: 4 },
];

const QA_PHONE4: QaItem[] = [
  { q: 'I am calling to follow up on the invoice we sent last week.', a: 'Thank you for calling. I will check the payment and call you back.', fn: 'follow', rank: 4 },
  { q: 'Could you put me through to the accounts department?', a: 'One moment, please. I will transfer you.', fn: 'transfer', rank: 4, phrases: ['ph-pre2-0398'] },
  { q: 'I would like to change my appointment.', a: 'Of course. When would be convenient for you?', fn: 'change', rank: 4 },
  { q: 'I am afraid I will be late for the meeting.', a: 'That is fine. We will start without you if necessary.', fn: 'late', rank: 4 },
  { q: 'We have not received the boxes yet.', a: 'I am sorry. I will look into it and call you back today.', fn: 'complaint', rank: 4, grammar: ['gr-3-002'] },
  { q: 'Could I ask who is calling?', a: 'This is {Ms. Weber|@} from the bank.', fn: 'name', rank: 4 },
  { q: 'Is the manager available this afternoon?', a: 'I am afraid he is in a meeting until three.', fn: 'avail', rank: 4 },
  { q: 'Thank you for your patience.', a: 'It is my pleasure. Please call again if you need anything.', fn: 'thanks', rank: 4, phrases: ['ph-pre2-0056'] },
  { q: 'I would like an estimate for a large order.', a: 'Certainly. How many boxes do you need?', fn: 'estimate', rank: 4 },
  { q: 'I am calling to postpone our appointment.', a: 'That is fine. Shall we arrange another day?', fn: 'postpone', rank: 4 },
  { q: 'Do you have any information about the strike at the port?', a: 'Yes. The ships will not move until Monday.', fn: 'strike', rank: 4 },
  { q: 'We would like to follow up on your application.', a: 'Thank you. I am happy to answer any questions.', fn: 'follow', rank: 4 },
  { q: 'I am calling about the maintenance contract.', a: 'Yes. The contract is valid until the end of the year.', fn: 'maintenance', rank: 4 },
  { q: 'Could you send me the sales forecast and the latest catalog?', a: 'Certainly. I will send both by email today.', fn: 'send', rank: 4 },
];

const QA_MAIL4: QaItem[] = [
  { q: 'We regret to inform you that your application has not been successful.', a: 'Thank you for letting me know. I appreciate your time.', fn: 'regret', rank: 4, phrases: ['ph-2-0017'], grammar: ['gr-3-005'] },
  { q: 'Please be advised that the office will be closed on Monday.', a: 'Thank you for the information. We will plan accordingly.', fn: 'notice', rank: 4, phrases: ['ph-2-0015'] },
  { q: 'We would like to propose a meeting to discuss the new contract.', a: 'We would be glad to meet. Please suggest some dates.', fn: 'propose', rank: 4, phrases: ['ph-2-0063'] },
  { q: 'Further to our conversation, I am attaching the new price list.', a: 'Thank you. I will go through it and reply tomorrow.', fn: 'attach', rank: 4, phrases: ['ph-pre1-0060'] },
  { q: 'Your prompt response would be greatly appreciated.', a: 'I will reply as soon as I have checked the figures.', fn: 'urgent', rank: 4, phrases: ['ph-pre1-0015'] },
  { q: 'Due to a strike at the port, we must postpone the delivery.', a: 'We understand. Please let us know the new date.', fn: 'delay', rank: 4, phrases: ['ph-2-0046'] },
  { q: 'The outstanding balance is $300.', a: 'Thank you. We will transfer the amount today.', fn: 'balance', rank: 4, phrases: ['ph-pre1-0074'] },
  { q: 'We would like to invite you to a dinner for our retiring manager.', a: 'Thank you. I would be glad to come.', fn: 'invite', rank: 4, phrases: ['ph-2-0035'] },
  { q: 'We can not accommodate a change to the contract at this stage.', a: 'I understand. Could we discuss it next month?', fn: 'accommodate', rank: 4 },
  { q: 'We will continue to offer the same prices until the end of the year.', a: 'That is good news. We would like to place a large order.', fn: 'offer', rank: 4 },
  { q: 'We should discuss the budget before we agree to anything.', a: 'Yes. Let us talk about it on Monday.', fn: 'discuss', rank: 4 },
  { q: 'We would like to submit our proposal for the new contract.', a: 'Thank you. We will review the proposal and reply by Friday.', fn: 'propose2', rank: 4 },
  { q: 'The installation of the new server has been postponed.', a: 'I see. Please send us the revised schedule.', fn: 'install', rank: 4 },
  { q: 'The shareholders will meet on Friday.', a: 'I will send them the annual report before then.', fn: 'shareholder', rank: 4 },
];

/** Indirect wording at its most polite: hints, understatements, conditions. */
const QA_INTENT4: QaItem[] = [
  { q: 'I see that the meeting room has been booked twice.', a: 'I will check the calendar and fix it today.', fn: 'double', rank: 4, grammar: ['gr-3-005'] },
  { q: 'The auditors will be here at nine, and the files are still on the floor.', a: 'I will put them on the shelf at once.', fn: 'tidy', rank: 4 },
  { q: 'We might consider other suppliers if the delay continues.', a: 'I understand. I will speak to the supplier at once.', fn: 'threat', rank: 4, grammar: ['gr-3-018'] },
  { q: 'Some of us have been waiting for the report since Monday.', a: 'I am sorry. I will send it this afternoon.', fn: 'waiting', rank: 4, grammar: ['gr-3-003'] },
  { q: 'It would be helpful if the invoices were sorted by date.', a: 'Certainly. I will sort them today.', fn: 'sort', rank: 4 },
  { q: 'The figures in the second table do not add up.', a: 'Thank you. I will check them again.', fn: 'figures', rank: 4 },
  { q: 'I thought the price included delivery.', a: 'I am sorry for the confusion. I will correct the invoice.', fn: 'confusion', rank: 4 },
  { q: 'Everyone is waiting in the hall, but the room is not ready.', a: 'I will open the room now.', fn: 'room', rank: 4 },
  { q: 'The latest report has some problems.', a: 'I will fix them and send a clear copy.', fn: 'latest', rank: 4 },
  { q: 'The deficit is bigger than we forecast.', a: 'I will check the figures and cut the costs.', fn: 'deficit', rank: 4 },
  { q: 'Several buyers have asked for a lower price because of inflation.', a: 'I understand. I will prepare an offer to negotiate.', fn: 'buyer', rank: 4 },
];

/** Part 5 / 6: transitions, prepositions, gerunds, passive voice, number / amount, who / whom / whose. */
const QA_GAP4: QaItem[] = [
  { q: 'The price is high. ___, the quality is excellent.', a: 'However', fn: 'contrast', rank: 4, grammar: ['gr-pre2-061'] },
  { q: 'The shipment was late. ___, we offered a discount.', a: 'Therefore', fn: 'result', rank: 4, grammar: ['gr-pre2-063'] },
  { q: 'The report is clear. ___, it is short.', a: 'Moreover', fn: 'add', rank: 4, grammar: ['gr-pre2-062'] },
  { q: 'The price depends ___ the amount.', a: 'on', fn: 'prepv', rank: 4, grammar: ['gr-pre2-041'] },
  { q: 'We look forward to ___ you next week.', a: 'meeting', fn: 'ing', rank: 4, grammar: ['gr-pre2-059'] },
  { q: 'The invoices ___ by Friday.', a: 'must be sent', fn: 'pass', rank: 4, grammar: ['gr-pre2-045'] },
  { q: 'A large ___ of clients came to the meeting.', a: 'number', fn: 'num', rank: 4, grammar: ['gr-pre2-049'] },
  { q: 'The clerk to ___ I spoke was very helpful.', a: 'whom', fn: 'whom', rank: 4, grammar: ['gr-pre2-048'] },
  { q: 'We will start the meeting ___ everyone arrives.', a: 'as soon as', fn: 'conj', rank: 4, grammar: ['gr-3-031'] },
  { q: 'The new price list is ___ to the old one.', a: 'similar', fn: 'adj', rank: 4, grammar: ['gr-2-058'] },
  { q: 'The client ___ agreed to the new price.', a: 'quickly', fn: 'adv', rank: 4, grammar: ['gr-3-036'] },
  { q: 'The company ___ office is in {Lyon|@} is our best client.', a: 'whose', fn: 'whose', rank: 4, grammar: ['gr-pre2-013'] },
  { q: 'The two companies are ___ a new contract.', a: 'negotiating', fn: 'ing2', rank: 4, grammar: ['gr-pre2-046'] },
  { q: 'Please send us a short ___ of the meeting.', a: 'summary', fn: 'num', rank: 4, grammar: ['gr-3-034'] },
  { q: 'The new system is more ___ than the old one.', a: 'efficient', fn: 'adj', rank: 4, grammar: ['gr-pre2-050'] },
  { q: 'We must ___ the contract before we sign it.', a: 'revise', fn: 'verb4', rank: 4, grammar: ['gr-3-039'] },
];

const T4: TaskTemplate[] = [
  { id: 'ot4_audit', rank: 4, arch: 'check', say: 'The auditors are coming. Please check the invoice with the order and the bank statement.', fields: [
    { id: 'num', label: 'Order number', values: ['8841', '8814', '8481', '4881'] },
    { id: 'qty', label: 'Quantity', values: ['100', '150', '200', '250'] },
    { id: 'price', label: 'Unit price', values: ['$6', '$7', '$8', '$9'] },
    { id: 'total', label: 'Total', values: ['$900', '$1,050', '$1,400', '$1,600', '$2,250'] },
  ], docs: [{ kind: 'order', title: 'Purchase Order', fields: ['num', 'qty', 'price'] }, { kind: 'card', title: 'Bank Statement', fields: ['num', 'total'] }, { kind: 'invoice', title: 'Invoice', fields: ['num', 'qty', 'price', 'total'] }], target: 2, pWrong: 0.7 },
  { id: 'ot4_contract', rank: 4, arch: 'check', say: 'The supplier wrote about the contract. Does the contract say the same?', fields: [
    { id: 'notice', label: 'Notice period', values: ['30 days', '60 days', '90 days'] },
    { id: 'pay', label: 'Payment due', values: ['15 days', '30 days', '45 days'] },
    { id: 'start', label: 'Start', values: ['March 1', 'May 1', 'July 1'] },
  ], docs: [{ kind: 'letter', title: 'Email', lines: ['The notice period must be {notice}.', 'Payment is due within {pay}.'] }, { kind: 'card', title: 'Contract', fields: ['notice', 'pay', 'start'] }], target: 1, pWrong: 0.7, wrongable: ['notice', 'pay'] },
  { id: 'ot4_manifest', rank: 4, arch: 'check', say: 'The ship list must match the invoice. Please check it.', fields: [
    { id: 'boxes', label: 'Boxes', values: ['80', '120', '160', '240'] },
    { id: 'weight', label: 'Weight', values: ['1,600', '2,400', '2,800', '3,200'] },
    { id: 'port', label: 'Port', values: ['{Lyon|@}', '{Dover|@}', '{Oslo|@}'] },
  ], docs: [{ kind: 'invoice', title: 'Invoice', fields: ['boxes', 'weight', 'port'] }, { kind: 'card', title: 'Ship List', fields: ['boxes', 'weight', 'port'] }], target: 1, pWrong: 0.7 },
  { id: 'ot4_resume', rank: 4, arch: 'check', say: 'Is the form the same as the job ad?', fields: [
    { id: 'job', label: 'Job', values: ['sales manager', 'sales clerk', 'office manager', 'buyer'] },
    { id: 'exp', label: 'Experience', values: ['2 years', '3 years', '5 years', '7 years'] },
    { id: 'start', label: 'Start', values: ['March 1', 'May 1', 'July 1'] },
  ], docs: [{ kind: 'card', title: 'Job Ad', fields: ['job', 'exp', 'start'] }, { kind: 'order', title: 'Form', fields: ['job', 'exp', 'start'] }], target: 1, pWrong: 0.7 },
  { id: 'ot4_minutes', rank: 4, arch: 'check', say: 'The minutes say who sends the numbers. Is the list right?', fields: [
    { id: 'who', label: 'Who', values: ['{Mr. Bell|@}', '{Mr. Lin|@}', '{Ms. Ruiz|@}'] },
    { id: 'day', label: 'Day', values: ['Monday', 'Wednesday', 'Thursday', 'Friday'] },
  ], docs: [{ kind: 'letter', title: 'Minutes', lines: ['{who} will send the numbers to {Ms. Park|@} on {day}.'] }, { kind: 'card', title: 'Action List', fields: ['who', 'day'] }], target: 1, pWrong: 0.7 },
  { id: 'ot4_quote', rank: 4, arch: 'check', say: 'The quote and the order must have the same terms. Please check.', fields: [
    { id: 'qty', label: 'Quantity', values: ['100', '200', '400'] },
    { id: 'price', label: 'Unit price', values: ['$8', '$9', '$10'] },
    { id: 'pay', label: 'Payment due', values: ['30 days', '45 days', '60 days'] },
  ], docs: [{ kind: 'card', title: 'Quote', fields: ['qty', 'price', 'pay'] }, { kind: 'order', title: 'Purchase Order', fields: ['qty', 'price', 'pay'] }], target: 1, pWrong: 0.7 },
  {
    id: 'ot4_meet', rank: 4, arch: 'respond', mode: 'slot', kind: 'email', say: 'A client wants to meet. Read the email and look at the week.', layout: 'calendar', rows: DAYS, cols: TIMES2,
    cellTags: { t9: ['morning'], t11: ['morning'], t1: ['afternoon'], t3: ['afternoon'] },
    want: [
      { tag: 'mon', text: 'I would be grateful if we could meet on Monday.' }, { tag: 'tue', text: 'Tuesday would suit me best.' }, { tag: 'wed', text: 'I would like to propose Wednesday.' }, { tag: 'thu', text: 'Could we possibly arrange a meeting on Thursday?' }, { tag: 'fri', text: 'I was hoping we could meet on Friday.' },
      { tag: 'morning', text: 'I would prefer to meet before lunch.' }, { tag: 'afternoon', text: 'I would prefer to meet after lunch.' },
    ],
    avoid: [
      { tag: 'wed', text: 'I am afraid I will not be available on Wednesday.' }, { tag: 'fri', text: 'Unfortunately, Friday is not possible.' }, { tag: 't9', text: 'I can not arrive before ten.' }, { tag: 't3', text: 'I must leave by two at the latest.' }, { tag: 'mon', text: 'I am abroad on Monday.' },
    ],
    busy: ['Meeting', 'Sales meeting', 'Audit', 'Busy', 'Call {Mr. Lin|@}', 'Interview'], open: ['Dear {Ms. Park|@},'], close: ['I would appreciate it if you could let me know.'],
  },
  {
    id: 'ot4_room', rank: 4, arch: 'respond', mode: 'slot', kind: 'email', say: 'We need a room. Read the email and look at the plan.', layout: 'calendar', rows: ROOMS, cols: TIMES2,
    cellTags: { t9: ['morning'], t11: ['morning'], t1: ['afternoon'], t3: ['afternoon'] },
    want: [
      { tag: 'r1', text: 'We would be happy with Room 1.' }, { tag: 'r2', text: 'Room 2 would be ideal for the audit.' }, { tag: 'r3', text: 'We would prefer Room 3.' },
      { tag: 'morning', text: 'The audit meeting must take place before lunch.' }, { tag: 'afternoon', text: 'The audit meeting must take place after lunch.' }, { tag: 't11', text: 'We would like to start at eleven.' }, { tag: 't1', text: 'We would like to start at 1:30.' },
    ],
    avoid: [{ tag: 'r1', text: 'Room 1 is too small for the auditors.' }, { tag: 'r3', text: 'Room 3 is too noisy for a long meeting.' }, { tag: 't9', text: 'Half past nine is too early for the auditors.' }, { tag: 't3', text: 'The auditors must leave by three.' }],
    busy: ['Meeting', 'Interview', 'Audit', 'Sales meeting'], open: ['Dear {Ms. Park|@},'], close: ['Thank you for your help.'],
  },
  { id: 'ot4_say', rank: 4, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'office4' },
  { id: 'ot4_phone', rank: 4, arch: 'respond', mode: 'choose', kind: 'phone', bank: 'phone4' },
  { id: 'ot4_mail', rank: 4, arch: 'respond', mode: 'choose', kind: 'email', bank: 'mail4' },
  { id: 'ot4_intent', rank: 4, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'intent4' },
  { id: 'ot4_gap', rank: 4, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'gap4' },
];

const BANKS: Record<string, QaItem[]> = {
  office1: QA_SAY1, phone1: QA_PHONE1, mail1: QA_MAIL1, memo1: QA_MEMO1,
  office2: QA_SAY2, phone2: QA_PHONE2, mail2: QA_MAIL2, memo2: QA_MEMO2, gap2: QA_GAP2,
  office3: QA_SAY3, phone3: QA_PHONE3, mail3: QA_MAIL3, intent3: QA_INTENT3, gap3: QA_GAP3,
  office4: QA_SAY4, phone4: QA_PHONE4, mail4: QA_MAIL4, intent4: QA_INTENT4, gap4: QA_GAP4,
};

// ---------------------------------------------------------------------------------------------- reactions and the boss's lines

const REACTIONS: JobContent['reactions'] = [
    // perfect
    { id: 'or_ok1', kind: 'perfect', text: 'Thank you. That is right.', face: 'happy' },
    { id: 'or_ok2', kind: 'perfect', text: 'Perfect. Good work!', face: 'delighted' },
    { id: 'or_ok3', kind: 'perfect', arch: 'respond', text: 'Great, thank you.', face: 'happy' },
    { id: 'or_ok4', kind: 'perfect', rank: 2, text: 'Well done. Everything is in order.', face: 'happy' },
    { id: 'or_ok5', kind: 'perfect', rank: 2, arch: 'check', text: 'Good eyes. The papers are fine now.', face: 'delighted' },
    { id: 'or_ok6', kind: 'perfect', rank: 2, arch: 'respond', text: 'Good answer. That is just what I wanted.', face: 'happy' },
    { id: 'or_ok7', kind: 'perfect', rank: 3, text: 'Excellent. You work fast!', face: 'delighted' },
    { id: 'or_ok8', kind: 'perfect', rank: 3, arch: 'respond', text: 'Very good. That is a clear and polite reply.', face: 'happy' },
    { id: 'or_ok9', kind: 'perfect', rank: 4, text: 'Exactly right. You are very careful.', face: 'delighted' },
    { id: 'or_ok10', kind: 'perfect', rank: 4, arch: 'check', text: 'Good eyes. This would have cost us money.', face: 'delighted' },
    // minor
    { id: 'or_minor', kind: 'minor', text: 'Good. But please be fast next time.', face: 'neutral' },
    { id: 'or_minor2', kind: 'minor', rank: 2, text: 'Almost. The work is fine, but you were a little slow.', face: 'neutral' },
    // check
    { id: 'or_missed', kind: 'missed', text: 'Wait! This one is wrong. Look at “{field}”.', face: 'angry' },
    { id: 'or_missed2', kind: 'missed', rank: 2, text: 'Stop! The papers do not match. Look at “{field}” again.', face: 'angry' },
    { id: 'or_missed3', kind: 'missed', rank: 3, text: "We can't pay this. The problem is in “{field}”.", face: 'angry' },
    { id: 'or_missed4', kind: 'missed', rank: 4, text: 'We almost paid for something we did not order. Look at “{field}”.', face: 'angry' },
    { id: 'or_alarm', kind: 'false_alarm', text: 'This one is fine. It is the same as the order.', face: 'puzzled' },
    { id: 'or_alarm2', kind: 'false_alarm', rank: 2, text: 'Everything matches here. Please do not stop good papers.', face: 'puzzled' },
    { id: 'or_field', kind: 'wrong_field', text: 'Not that one. Look at “{field}”.', face: 'puzzled' },
    { id: 'or_field2', kind: 'wrong_field', rank: 2, text: 'That line is fine. The problem is in “{field}”.', face: 'puzzled' },
    { id: 'or_fix', kind: 'wrong_fix', text: 'Yes, that line. But the new value is not right.', face: 'neutral' },
    // respond
    { id: 'or_reply', kind: 'wrong_reply', text: 'Sorry? That is not right.', face: 'puzzled' },
    { id: 'or_reply2', kind: 'wrong_reply', rank: 2, text: 'Sorry? That is not an answer to my question.', face: 'puzzled' },
    { id: 'or_reply3', kind: 'wrong_reply', rank: 3, text: 'I am afraid that is not what the message needs.', face: 'sad' },
    { id: 'or_reply4', kind: 'wrong_reply', rank: 4, text: 'Please read the message again. That reply is not quite right.', face: 'puzzled' },
    { id: 'or_slot', kind: 'wrong_slot', text: 'Oh, that time is not good. Please check the email again.', face: 'sad' },
    { id: 'or_slot2', kind: 'wrong_slot', rank: 2, text: 'That time does not suit them, or it is not free. Please read the email again.', face: 'sad' },
    { id: 'or_form', kind: 'wrong_form', text: 'Some of this message is wrong.', face: 'sad' },
    { id: 'or_form2', kind: 'wrong_form', rank: 3, text: 'I think you missed something. Please listen again.', face: 'sad' },
    { id: 'or_fail', kind: 'any_fail', text: 'Oh no. Please check it again.', face: 'sad' },
    { id: 'or_fail2', kind: 'any_fail', rank: 3, text: 'This is not good. Please be more careful.', face: 'sad' },
  ];

const LINES: JobContent['lines'] = [
    { id: 'ol_s1', kind: 'start', text: 'Good morning. We have a lot of work today.' },
    { id: 'ol_s2', kind: 'start', text: 'Hello! The papers are on your desk.' },
    { id: 'ol_s3', kind: 'start', rank: 2, text: 'Good morning. Please check everything twice today.' },
    { id: 'ol_s4', kind: 'start', rank: 3, text: 'Good morning. The phone will not stop today, I am afraid.' },
    { id: 'ol_s5', kind: 'start', rank: 4, text: 'Good morning. We have a long list for today, so let us begin.' },
    { id: 'ol_e1', kind: 'end', text: 'Thank you for your work today.' },
    { id: 'ol_e2', kind: 'end', text: 'Good work. See you tomorrow!' },
    { id: 'ol_e3', kind: 'end', rank: 3, text: 'Thank you. The office is quiet at last.' },
    { id: 'ol_r1', kind: 'rankup', text: 'You are doing very well. Here is a little more work for you.' },
  ];

// ---------------------------------------------------------------------------------------------- the job

const NEW = lex(NEW_LEX_SRC);

/** Extra surface forms of the tea house's base words (they keep their ids). */
const BASE_FORMS: Record<string, string[]> = { can: ['could'], do: ['did'], want: ['wants', 'wanted'], hour: ['hours'] };
const FORMS: Record<string, string[]> = Object.fromEntries(Object.keys({ ...BASE_FORMS, ...EXTRA_FORMS }).map((k) => [k, [...(BASE_FORMS[k] ?? []), ...(EXTRA_FORMS[k] ?? [])]]));

/**
 * The office defines every word it uses that the tea house's base lexicon lacks. Other jobs may define
 * some of the same words (post, kitchen, inn): the lexicon is one shared list, so where another job
 * already has a word (same id or same surface) its entry is used and the office's copy is dropped; an
 * inflected form the other job lacks stays as an entry of its own. The 検証ページ are then re-cut so that
 * every page keeps 3–5 words.
 */
const SHARED_WITH = [POST_JOB, KITCHEN_JOB, INN_JOB];
const SIGN = '{Marlow|@} Trading Company';
const USED_WORDS = new Set(
  jobContentTexts({ sign: SIGN, tasks: [...R1, ...R2, ...R3, ...R4], templates: [...T1, ...T2, ...T3, ...T4], qa: BANKS, reactions: REACTIONS, lines: LINES } as unknown as JobContent)
    .join(' ')
    .toLowerCase()
    .match(/[a-z']+/g) ?? [],
);
const LEXICON_AND_PAGES = (() => {
  const ids = new Set<string>();
  const surfaces = new Set<string>();
  for (const j of SHARED_WITH) for (const e of j.content.en?.lexicon ?? []) {
    ids.add(e.id);
    for (const s of [e.text, ...(e.forms ?? [])]) surfaces.add(s.toLowerCase());
  }
  const all = [...OLD_LEX, ...NEW.entries].map((e) => (EXTRA_FORMS[e.id] ? { ...e, forms: [...(e.forms ?? []), ...EXTRA_FORMS[e.id]] } : e));
  const keep: JobLexEntry[] = [];
  for (const e of all) {
    if (!ids.has(e.id) && !surfaces.has(e.text.toLowerCase())) {
      keep.push({ ...e, ...(e.forms ? { forms: e.forms.filter((f) => !surfaces.has(f.toLowerCase())) } : {}) });
      continue;
    }
    for (const f of e.forms ?? []) if (!surfaces.has(f.toLowerCase()) && !ids.has(f) && USED_WORDS.has(f.toLowerCase())) keep.push({ ...e, id: f, text: f, forms: undefined });
  }
  const pageList = [...OLD_PAGES, ...NEW.pages];
  const kept: { page: VerificationPage; words: JobLexEntry[] }[] = [];
  let carry: JobLexEntry[] = [];
  const pooled: VerificationPage[] = [];
  const pool = (list: JobLexEntry[], lab: string) => {
    if (!list.length) return;
    const k = Math.max(1, Math.ceil(list.length / 5));
    let i = 0;
    for (let n = 0; n < k; n++) {
      const size = Math.floor(list.length / k) + (n < list.length % k ? 1 : 0);
      const pg = { id: `jo_pool_${pooled.length}`, labelJa: k > 1 ? `${lab} ${n + 1}` : lab };
      pooled.push(pg);
      kept.push({ page: pg, words: list.slice(i, i + size) });
      i += size;
    }
  };
  for (const pg of pageList) {
    const words = keep.filter((e) => e.group === pg.id);
    if (words.length >= 3) kept.push({ page: pg, words });
    else carry = [...carry, ...words];
    if (carry.length >= 3) {
      pool(carry, '事務所のことば（まとめ）');
      carry = [];
    }
  }
  if (carry.length) {
    const last = kept[kept.length - 1];
    if (last && last.words.length + carry.length <= 5) last.words = [...last.words, ...carry];
    else if (last) {
      const take = last.words.slice(-(3 - carry.length));
      last.words = last.words.slice(0, last.words.length - take.length);
      kept.push({ page: { id: 'jo_pool_end', labelJa: '事務所のことば（まとめ）' }, words: [...take, ...carry] });
    }
  }
  const lexicon: JobLexEntry[] = kept.flatMap((k) => k.words.map((w) => ({ ...w, group: k.page.id })));
  return { lexicon, pages: kept.map((k) => k.page) };
})();

const EN: JobContent = {
  sign: SIGN,
  lexicon: LEXICON_AND_PAGES.lexicon,
  pages: LEXICON_AND_PAGES.pages,
  forms: FORMS,
  people: [
    { id: 'p_park', name: 'Ms. Park', avatar: '🧑‍💼' },
    { id: 'c_merchant', name: '', avatar: '' },
    { id: 'p_ruiz', name: 'Ms. Ruiz', avatar: '👩' },
    { id: 'p_lin', name: 'Mr. Lin', avatar: '👨' },
    { id: 'p_bell', name: 'Mr. Bell', avatar: '👨‍🦳' },
    { id: 'p_weber', name: 'Ms. Weber', avatar: '👩' },
    { id: 'p_santos', name: 'Mr. Santos', avatar: '👨' },
    { id: 'c_sailor', name: '', avatar: '' },
    { id: 'c_docker', name: '', avatar: '' },
    { id: 'c_cook', name: '', avatar: '' },
    { id: 'c_baker', name: '', avatar: '' },
    { id: 'c_scholar', name: '', avatar: '' },
    { id: 'c_student', name: '', avatar: '' },
  ],
  boss: 'p_park',
  things: [],
  tasks: [...R1, ...R2, ...R3, ...R4],
  templates: [...T1, ...T2, ...T3, ...T4],
  qa: { ...BANKS },
  reactions: REACTIONS,
  lines: LINES,
};

export const OFFICE_JOB: JobDef = {
  id: 'office',
  nameJa: '商会の事務',
  blurbJa: '港の商会で事務を手伝う。注文書・納品書・請求書・経費の書類を照らし合わせ、メールや掲示を読んで返事を選び、打ち合わせの日程と部屋を決め、電話の伝言を書く。会社・会議・営業・お金・人事・契約の言葉と、ビジネス英語の決まり文句（TOEIC 向け）。',
  icon: '🗂️',
  domains: ['office', 'meetings', 'sales', 'finance', 'hr', 'manufacturing', 'law', 'technology', 'communication', 'travel', 'transport'],
  archetypes: ['check', 'respond'],
  ranks: [
    { rank: 1, need: { good: 0, words: 0 }, level: { eiken: '3', toeic: 400 }, tasks: 4, noteJa: '注文書と勘定書の二枚を見比べる（品物・箱の数・値段・日付）。短い掲示を読んで答える。メールの打ち合わせ日程（条件ひとつ〜ふたつ）。電話の伝言を書く。TOEIC 〜400。' },
    { rank: 2, need: { good: 20, words: 40 }, level: { eiken: 'pre2', toeic: 600 }, unlocks: ['long'], tasks: 5, reward: { coins: 12 }, noteJa: '発注書・請求書・納品書、経費の書類（注文番号・数量・単価・合計）。メールと掲示を読んで返事を選ぶ。語形・前置詞・接続詞を選ぶ穴埋めの下書き。日程の条件がふたつに。TOEIC 〜600。' },
    { rank: 3, need: { good: 55, words: 110 }, level: { eiken: '2', toeic: 730 }, unlocks: ['multiStep', 'audioOnly', 'timed'], tasks: 5, reward: { coins: 20 }, noteJa: '三枚の書類（発注書・納品書・請求書、メールと見積もり）。違う欄を見つけたら正しい値も選んで直す。電話を耳だけで聞く。丁寧で遠回しな言い方の本当の用件を読む。時間制限（選んだときだけ）。TOEIC 〜730。' },
    { rank: 4, need: { good: 100, words: 200 }, level: { eiken: 'pre1', toeic: 860 }, tasks: 6, reward: { coins: 30 }, noteJa: '長いメールのやりとり、議事録、契約書、報告書、求人広告、出荷予定。条件と期限（「〜の場合に限り」「〜までに」）を読み取る。耳だけの留守番電話。TOEIC 〜860。' },
  ],
  wage: { perfect: 3, minor: 2, fail: 0, bad: 0 },
  opensAfter: 2,
  building: 'office',
  links: { produce: [{ good: 'parcels', perPerfect: 1 }], use: [{ good: 'tea', bonus: 1, line: 'And thank you for the tea from the tea house!' }] },
  content: { en: EN },
  flavour: 'work',
};
