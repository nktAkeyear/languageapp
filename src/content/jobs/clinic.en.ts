import type { VerificationPage } from '../../core/types';
import type { AuthoredTask, CheckDoc, JobContent, JobDef, JobLexEntry, QaItem, TaskFeature, TaskTemplate } from '../../jobs/types';

/**
 * Clinic reception (診療所の受付): the Harbour Clinic. Reception work only: nobody here gives medical advice; the
 * receptionist reads what is written (the doctor's note, the leaflet, the policy, the card) and does what it says. The
 * five ranks climb from 英検3級 to 英検1級 (TOEIC 〜400 / 〜600 / 〜730 / 〜860 / 〜990), with the weight on ranks 3-5.
 *
 * - sort: patients, forms and results to the right department or desk (what the patient says decides: "my tooth hurts" →
 *   the dentist), and who must be seen now, today or by appointment (triage by what the patient says).
 * - check: a prescription or a label against the doctor's note, an insurance card against a form, a bill against the
 *   treatment list (exactly one discrepancy, or none); from rank 3 the right value must also be chosen.
 * - respond: patients' questions answered from the leaflet or the clinic's policy, the telephone (message pad), the
 *   appointment book (one free slot that fits what the patient needs), and the sentence of a form or leaflet that says
 *   something else than the doctor's note.
 *
 * The running story: Ms. Vega's first weeks at the front desk; Tom's cough and his mother's questions; Grandma Rose's
 * check-ups; Big Joe's back; Captain Reed's eye test; {Dr. Patel|@}'s long list; the flu vaccination week; and, at the top
 * rank, the insurer's refusal and its appeal, the consent forms, the notice about an outbreak at the school and the
 * clinic's fiftieth birthday.
 *
 * Authoring notes: as in the newspaper office (the lexicon is generated from the words the texts use; tasks and
 * templates carry phrase / grammar tags found in their own texts).
 */

// ---------------------------------------------------------------------------------------------- lexicon

const POS: Record<string, JobLexEntry['pos']> = { n: 'noun', v: 'verb', a: 'adj', d: 'adv', p: 'prep', c: 'conj', r: 'pron', t: 'det', i: 'interj', x: 'phrase' };

const CEFR_OF: Record<string, 'A1' | 'A2' | 'B1' | 'B2'> = { '5': 'A1', '4': 'A1', '3': 'A2', 準2: 'B1', '2': 'B2', 準1: 'B2', '1': 'B2' };

/**
 * Compact word table: `# pageId | 検証ページの見出し` opens a page; `text|pos|forms|gloss|emoji|id|eiken` is a word
 * (id: when it is not the text; eiken: only for a word vocab.json lacks).
 */
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
    const [text, pos, forms, gloss, emoji, id, eiken] = line.split('|').map((s) => s.trim());
    entries.push({
      id: id || text.toLowerCase().replace(/ /g, '_').replace(/[^a-z_]/g, ''),
      text,
      pos: POS[pos] ?? 'noun',
      group,
      ...(forms ? { forms: forms.split(',').map((s) => s.trim()) } : {}),
      ...(gloss ? { gloss } : {}),
      ...(emoji ? { emoji } : {}),
      ...(eiken ? { eiken: eiken as JobLexEntry['eiken'], cefr: CEFR_OF[eiken] ?? 'B1' } : {}),
    });
  }
  return { entries, pages };
}

// ---------------------------------------------------------------------------------------------- authoring helpers

interface Meta {
  grammar?: string[];
  phrases?: string[];
  features?: TaskFeature[];
}
type Kind = 'letter' | 'email' | 'phone' | 'memo' | 'speech';

const hash = (s: string): number => {
  let h = 7;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
};
/** The right reply written first; the slips are put in a fixed order that depends on the task id. */
function slips(id: string, right: string, wrong: string[]): { options: string[]; answer: number } {
  const all = [right, ...wrong];
  const k = hash(id) % all.length;
  const options = [...all.slice(k), ...all.slice(0, k)].reverse();
  return { options, answer: options.indexOf(right) };
}
const meta = (m: Meta) => ({ ...(m.grammar ? { grammar: m.grammar } : {}), ...(m.phrases ? { phrases: m.phrases } : {}), ...(m.features ? { features: m.features } : {}) });

/** A paper with labelled lines: rows of [field id, label, value]. */
const paper = (kind: CheckDoc['kind'], title: string, rows: [string, string, string][], lines?: string[]): CheckDoc => ({ kind, title, ...(rows.length ? { fields: rows.map(([id, label, value]) => ({ id, label, value })) } : {}), ...(lines ? { lines } : {}) });
/** Free text on a paper (the reporter's notes, an e-mail, the wire). */
const note = (title: string, lines: string[], kind: CheckDoc['kind'] = 'note'): CheckDoc => ({ kind, title, lines });

/** check: the first paper is the reference, the `target` (default: the last) is the one checked; `wrong` = the field that disagrees. */
function check(id: string, rank: number, seq: number, person: string, say: string, docs: CheckDoc[], wrong: string | null, m: Meta & { fix?: [string, string[]]; target?: number } = {}): AuthoredTask {
  return {
    id, rank, seq, arch: 'check', person, say, docs,
    target: m.target ?? docs.length - 1,
    wrong,
    ...(m.fix ? { fix: m.fix[0], fixOptions: [...m.fix[1]].sort() } : {}),
    ...meta(m),
  };
}
/** respond (choose): a letter / e-mail / memo / call with lines; `say` is what is said at the desk (calls: the words heard). */
function msg(id: string, rank: number, seq: number, person: string, kind: Kind, head: { from?: string; subject?: string; say?: string }, lines: string[], right: string, wrong: string[], m: Meta & { say?: string } = {}): AuthoredTask {
  return {
    id, rank, seq, arch: 'respond', person, say: m.say ?? head.say ?? (kind === 'phone' || kind === 'speech' ? lines.join(' ') : ''), mode: 'choose',
    msg: { kind, ...(head.from ? { from: head.from } : {}), ...(head.subject ? { subject: head.subject } : {}), lines },
    ...slips(id, right, wrong), ...meta(m),
  };
}
/** respond (form): the message pad; each field has chips; [field id, label, right value, the other values]. */
function pad(id: string, rank: number, seq: number, person: string, lines: string[], fields: [string, string, string, string[]][], m: Meta & { say?: string; kind?: 'phone' | 'letter' | 'email' | 'speech' } = {}): AuthoredTask {
  const kind = m.kind ?? 'phone';
  return {
    id, rank, seq, arch: 'respond', person, say: m.say ?? (kind === 'phone' || kind === 'speech' ? lines.join(' ') : ''), mode: 'form',
    msg: { kind, lines },
    fields: fields.map(([fid, label, answer, others]) => {
      const o = slips(`${id}:${fid}`, answer, others);
      return { id: fid, label, options: o.options, answer };
    }),
    ...meta(m),
  };
}
/** sort: [text, bin id] items. */
function sort(id: string, rank: number, seq: number, person: string, say: string, bins: string[], items: [string, string][], m: Meta = {}): AuthoredTask {
  return { id, rank, seq, arch: 'sort', person, say, bins, items: items.map(([text, bin], i) => ({ id: `i${i + 1}`, text, bin })), ...meta(m) };
}

/** The page plan: pages × places on a page. Every cell that fits the wishes except the answer is already taken. */
interface Axis { id: string; label: string; tags?: string[] }
function slot(id: string, rank: number, seq: number, person: string, kind: Kind | 'speech', lines: string[], rows: Axis[], cols: Axis[], want: string[], avoid: string[], answer: string, busyNames: string[], m: Meta & { say?: string; from?: string; subject?: string; extraBusy?: string[] } = {}): AuthoredTask {
  let bi = 0;
  const cells = rows.flatMap((r) =>
    cols.map((c) => {
      const cid = `${r.id}-${c.id}`;
      const tags = [r.id, c.id, ...(r.tags ?? []), ...(c.tags ?? [])];
      const fits = want.every((t) => tags.includes(t)) && !avoid.some((t) => tags.includes(t));
      const busy = cid !== answer && (fits || (m.extraBusy ?? []).includes(cid));
      return { id: cid, row: r.id, col: c.id, tags, ...(busy ? { busy: busyNames[bi++ % busyNames.length] } : {}) };
    }),
  );
  return {
    id, rank, seq, arch: 'respond', person, say: m.say ?? (kind === 'speech' || kind === 'phone' ? lines.join(' ') : ''), mode: 'slot',
    msg: { kind, ...(m.from ? { from: m.from } : {}), ...(m.subject ? { subject: m.subject } : {}), lines },
    slot: { layout: 'calendar', rows: rows.map(({ id: i, label }) => ({ id: i, label })), cols: cols.map(({ id: i, label }) => ({ id: i, label })), cells, answer },
    ...meta(m),
  };
}

/** The appointment book: days (rows) × times (columns). */
const DAYS5: Axis[] = [{ id: 'mon', label: 'Monday' }, { id: 'tue', label: 'Tuesday' }, { id: 'wed', label: 'Wednesday' }, { id: 'thu', label: 'Thursday' }, { id: 'fri', label: 'Friday' }];
const DAYS3: Axis[] = DAYS5.slice(0, 3);
const TIMES2: Axis[] = [{ id: 'am', label: '9:00', tags: ['morning'] }, { id: 'pm', label: '2:00', tags: ['afternoon'] }];
const TIMES3: Axis[] = [{ id: 't9', label: '9:00', tags: ['morning'] }, { id: 't11', label: '11:00', tags: ['morning'] }, { id: 't3', label: '3:00', tags: ['afternoon'] }];
const TIMES4: Axis[] = [{ id: 't9', label: '9:30', tags: ['morning'] }, { id: 't11', label: '11:00', tags: ['morning'] }, { id: 't1', label: '1:30', tags: ['afternoon'] }, { id: 't3', label: '3:00', tags: ['afternoon'] }];

/** The clinic's departments and desks: the sorting cabinet. `ref` is how a reaction names the place. */
const sec = (id: string, label: string) => ({ id, label, ref: label });
const SECTIONS = [
  sec('general', 'General clinic'), sec('children', 'Children\'s clinic'), sec('dental', 'Dentist'), sec('eye', 'Eye clinic'),
  sec('skin', 'Skin clinic'), sec('heart', 'Heart clinic'), sec('bones', 'Bone clinic'), sec('pharmacy', 'Pharmacy'), sec('pay', 'Payments'),
  sec('scan', 'Scan room'), sec('blood', 'Blood tests'), sec('records', 'Records'), sec('urgent', 'Urgent care'), sec('shots', 'Vaccination'), sec('insurance', 'Insurance desk'),
  sec('sameday', 'Same-day visit'), sec('booked', 'Booked visit'),
  sec('ear', 'Ear, nose and throat'), sec('women', 'Women\'s health'), sec('mind', 'Mental health'), sec('referral', 'Referrals'), sec('older', 'Older people'),
];

// ---------------------------------------------------------------------------------------------- rank 1 (英検3級, TOEIC 〜400)
// The first week at the front desk: where each patient goes, the card and the form, what the doctor wrote on the
// medicine, short leaflets, the telephone, the appointment book.

const R1: AuthoredTask[] = [
  sort('c1_first', 1, 1, 'p_vega', 'Good morning! Where does each patient go?', ['children', 'dental', 'eye'], [
    ['My girl has a fever', 'children'], ['My tooth hurts', 'dental'], ['My eyes are red', 'eye'],
  ]),
  check('c1_card', 1, 2, 'p_ito', 'Please look at the card and the form. Is the birthday the same?', [
    paper('card', 'Patient card', [['name', 'Name', '{Grandma Rose|@}'], ['birth', 'Birthday', 'May 3']]),
    paper('note', 'Form', [['name', 'Name', '{Grandma Rose|@}'], ['birth', 'Birthday', 'May 13']]),
  ], 'birth'),
  msg('c1_sat', 1, 3, 'c_docker', 'memo', { say: 'Is the clinic open on Saturday?' }, ['{Harbour Clinic|@}', 'Monday to Friday: 8 to 5', 'Saturday: 9 to 12', 'Sunday: closed'],
    'Yes. It is open from 9 to 12.', ['Yes. It is open from 8 to 5.', 'No. It is closed on Saturday.']),
  sort('c1_sort2', 1, 4, 'p_vega', 'More patients! Where does each one go?', ['children', 'dental', 'eye'], [
    ['My boy has a cough', 'children'], ['I can not see well', 'eye'], ['My tooth hurts a lot', 'dental'], ['My baby is crying all night', 'children'],
  ]),
  check('c1_medicine', 1, 5, 'p_patel', 'The nurse wrote this label. Is it the same as my note?', [
    paper('note', 'Doctor\'s note', [['what', 'Medicine', 'cough medicine'], ['times', 'Times a day', '3']]),
    paper('label', 'Label', [['what', 'Medicine', 'cough medicine'], ['times', 'Times a day', '2']]),
  ], 'times'),
  pad('c1_mom', 1, 6, 'p_vega', ['Hello, this is {Anna|@}.', 'My son {Tom|@} has a fever.', 'Can he come at ten?'], [
    ['who', 'Who', '{Anna|@}', ['{Nora|@}', '{Grandma Rose|@}']],
    ['sick', 'Sick', '{Tom|@}', ['{Anna|@}', '{Big Joe|@}']],
    ['when', 'Come at', 'ten', ['two', 'four']],
  ], { say: 'The phone is ringing, and I am busy. Please write the message.' }),
  msg('c1_fee', 1, 7, 'c_mom', 'memo', { say: 'My son is ten. How much is a visit?' }, ['A VISIT', 'Adults: 10 coins', 'Children under twelve: free'],
    'It is free.', ['It is ten coins.', 'It is twelve coins.']),
  slot('c1_book', 1, 8, 'p_vega', 'memo', ['{Grandma Rose|@} wants to see the doctor on Tuesday.', 'She can not come in the morning.'], DAYS3, TIMES2, ['tue', 'afternoon'], [], 'tue-pm', ['Busy', 'Busy', 'Busy'],
    { say: 'Please look at the book. When can she come?', extraBusy: ['mon-am', 'wed-pm'] }),
  check('c1_name', 1, 9, 'p_ito', 'Please check the name and the day on this paper.', [
    paper('note', 'Appointment book', [['name', 'Name', '{Captain Reed|@}'], ['day', 'Day', 'Thursday']]),
    paper('card', 'Appointment card', [['name', 'Name', '{Captain Reed|@}'], ['day', 'Day', 'Tuesday']]),
  ], 'day'),
  msg('c1_dentist', 1, 10, 'c_baker', 'memo', { say: 'My tooth hurts. Can I see the dentist today?' }, ['Today is Wednesday.', 'The dentist comes on Wednesday and Friday.'],
    'Yes. The dentist is here today.', ['No. The dentist is here on Tuesday.', 'Yes. The dentist is here on Monday.']),
  sort('c1_sort3', 1, 11, 'p_vega', 'The last ones before lunch. Please look at each one.', ['children', 'dental', 'eye', 'general'], [
    ['My head hurts and I feel sick', 'general'], ['My daughter is five and has a cough', 'children'], ['My tooth is out', 'dental'], ['My eye hurts', 'eye'],
  ]),
  check('c1_phone', 1, 12, 'p_vega', 'Please check the phone number on the card and on the form.', [
    paper('card', 'Patient card', [['name', 'Name', '{Tom|@}'], ['phone', 'Phone', '4 5 8 2']]),
    paper('note', 'Form', [['name', 'Name', '{Tom|@}'], ['phone', 'Phone', '4 8 5 2']]),
  ], 'phone'),
  msg('c1_wait', 1, 13, 'c_oldman', 'memo', { say: 'How long must I wait?' }, ['The doctor sees patients by number.', 'You have number 9.', 'Now the doctor is seeing number 5.'],
    'Three more patients will go first.', ['Eight more patients will go first.', 'Nobody will go first.']),
  pad('c1_nurse', 1, 14, 'p_vega', ['Hello, this is {Mr. Grant|@}.', 'My back hurts.', 'Can I come on Friday?'], [
    ['who', 'Who', '{Mr. Grant|@}', ['{Big Joe|@}', '{Captain Reed|@}']],
    ['what', 'Hurts', 'back', ['head', 'tooth']],
    ['day', 'Come on', 'Friday', ['Monday', 'Thursday']],
  ], { say: 'Another call! Please write the message.' }),
  check('c1_ok', 1, 15, 'p_patel', 'And this one? Is the medicine right?', [
    paper('note', 'Doctor\'s note', [['what', 'Medicine', 'eye medicine'], ['days', 'For', '5 days']]),
    paper('label', 'Label', [['what', 'Medicine', 'eye medicine'], ['days', 'For', '5 days']]),
  ], null),
  msg('c1_form', 1, 16, 'c_student', 'memo', { say: 'I am new. What must I do first?' }, ['NEW PATIENTS', 'Write your name on the form.', 'Then sit in the waiting room.'],
    'Write your name on the form.', ['Sit in the waiting room first.', 'Go to the dentist first.']),
  slot('c1_book2', 1, 17, 'p_vega', 'memo', ['{Mr. Grant|@} wants to see the doctor on Friday.', 'He is busy in the afternoon.'], DAYS5, TIMES2, ['fri', 'morning'], [], 'fri-am', ['Busy', 'Busy', 'Busy', 'Busy'],
    { say: 'Please look at the book. When can he come?', extraBusy: ['mon-am', 'tue-pm', 'thu-am'] }),
  check('c1_day', 1, 18, 'p_ito', 'Is the day the same on the card and in the book?', [
    paper('note', 'Appointment book', [['name', 'Name', '{Nora|@}'], ['day', 'Day', 'Monday'], ['time', 'Time', '10']]),
    paper('card', 'Appointment card', [['name', 'Name', '{Nora|@}'], ['day', 'Day', 'Monday'], ['time', 'Time', '11']]),
  ], 'time'),
  msg('c1_sick', 1, 19, 'c_girl', 'memo', { say: 'My head hurts. Can I get medicine here?' }, ['PHARMACY', 'Medicine from the doctor: yes.', 'Medicine without a note from the doctor: no.'],
    'No. You need a note from the doctor.', ['Yes. You can get it without a note.', 'No. You can not get any medicine here.']),
  msg('c1_thanks', 1, 20, 'c_scholar', 'speech', { say: 'Thank you for your help today.' }, ['Thank you for your help today.'],
    'You are welcome. Please come again.', ['You are welcome. Please do not come again.', 'I am sorry. I can not help you today.']),
];

// ---------------------------------------------------------------------------------------------- rank 1 templates and banks

/** [question, right reply, function, two near misses] */
type Q = [string, string, string, [string, string]];
const bank = (rank: number, items: Q[]): QaItem[] => items.map(([q, a, fn, near]) => ({ q, a, fn, rank, near }));

const QA_SAY1 = bank(1, [
  ['I would like to see the doctor on Friday.', 'Yes. You can see the doctor on Friday.', 'book', ['Yes. You can see the doctor on Monday.', 'No. You can see the doctor on Friday.']],
  ['My name is {Tom|@}. I have an appointment at ten.', 'Yes, {Tom|@}. Your appointment is at ten.', 'name', ['Yes, {Tom|@}. Your appointment is at two.', 'Yes, {Nora|@}. Your appointment is at ten.']],
  ['My head hurts, and I feel sick.', 'I am sorry. Please sit down. The doctor will see you soon.', 'sick', ['I am sorry. Please go home. The doctor will not see you.', 'I am glad. Please sit down. The doctor will see you soon.']],
  ['Thank you for your help.', 'You are welcome.', 'thanks', ['Yes, please.', 'I am sorry.']],
  ['I am sorry. I am late for my appointment.', 'That is all right. Please sit down.', 'apology', ['You are welcome.', 'Thank you, but I am not late.']],
  ['My son has a cough. He is six.', 'I am sorry. The Children\'s clinic can see your son today.', 'child', ['I am sorry. The Dentist can see your son today.', 'I am sorry. The Children\'s clinic can not see a boy of six.']],
  ['I want to change my appointment from Monday to Tuesday.', 'Yes. Your appointment is now on Tuesday.', 'change', ['Yes. Your appointment is now on Monday.', 'Yes. Your appointment is now on Wednesday.']],
  ['My tooth hurts very much.', 'I am sorry. Please see the dentist.', 'tooth', ['I am sorry. Please see the eye clinic.', 'I am glad. Please see the dentist.']],
]);

const QA_MAIL1 = bank(1, [
  ['Dear {Ms. Vega|@}, I want to see the doctor on Thursday. Is that possible?', 'Yes. You can see the doctor on Thursday.', 'book', ['Yes. You can see the doctor on Monday.', 'No. You can see the doctor on Thursday.']],
  ['Dear {Ms. Vega|@}, I am sorry. I can not come on Friday. I am sick.', 'That is all right. Please get well soon.', 'sorry', ['That is all right. Please come on Friday.', 'You are welcome. Please do not get well.']],
  ['Dear {Ms. Vega|@}, my name is {Ken|@}. I need medicine for my cough.', 'Dear {Ken|@}, please come and see the doctor first.', 'medicine', ['Dear {Tom|@}, please come and see the doctor first.', 'Dear {Ken|@}, please do not come and see the doctor.']],
  ['Dear {Ms. Vega|@}, thank you for the good care.', 'You are welcome. We are glad that you are well.', 'thanks', ['You are welcome. We are sorry that you are well.', 'Yes, please. We are glad that you are well.']],
  ['Dear {Ms. Vega|@}, my daughter is five. She has a fever. Can she come at two?', 'Yes. Your daughter can come at two.', 'child', ['Yes. Your daughter can come at four.', 'Yes. Your son can come at two.']],
]);

const B1: Record<string, QaItem[]> = { say1: QA_SAY1, mail1: QA_MAIL1 };

const T1: TaskTemplate[] = [
  { id: 'ct1_sort', rank: 1, arch: 'sort', say: 'Good morning! Where does each patient go?', count: [3, 4], bins: ['children', 'dental', 'eye', 'general'],
    patterns: [
      { text: 'My girl has a fever', bins: ['children'] }, { text: 'My boy has a cough', bins: ['children'] }, { text: 'My baby is crying all night', bins: ['children'] }, { text: 'My daughter is five and has a cough', bins: ['children'] }, { text: 'My son is three and is very hot', bins: ['children'] }, { text: 'My child can not sleep', bins: ['children'] },
      { text: 'My tooth hurts', bins: ['dental'] }, { text: 'My tooth hurts a lot', bins: ['dental'] }, { text: 'My tooth is out', bins: ['dental'] }, { text: 'I can not eat because of my tooth', bins: ['dental'] }, { text: 'My mouth hurts when I eat', bins: ['dental'] },
      { text: 'My eyes are red', bins: ['eye'] }, { text: 'I can not see well', bins: ['eye'] }, { text: 'My eye hurts', bins: ['eye'] }, { text: 'I need new glasses', bins: ['eye'] }, { text: 'There is something in my eye', bins: ['eye'] },
      { text: 'My head hurts and I feel sick', bins: ['general'] }, { text: 'I have a bad cold', bins: ['general'] }, { text: 'My stomach hurts', bins: ['general'] }, { text: 'I feel very tired', bins: ['general'] }, { text: 'My back hurts', bins: ['general'] },
    ] },
  { id: 'ct1_card', rank: 1, arch: 'check', say: 'Please look at the card and the form. Is the birthday the same?', fields: [
    { id: 'name', label: 'Name', values: ['{Grandma Rose|@}', '{Big Joe|@}', '{Nora|@}', '{Tom|@}', '{Captain Reed|@}'] },
    { id: 'birth', label: 'Birthday', values: ['May 3', 'May 13', 'June 5', 'June 15', 'July 2', 'July 12'] },
  ], docs: [{ kind: 'card', title: 'Patient card', fields: ['name', 'birth'] }, { kind: 'note', title: 'Form', fields: ['name', 'birth'] }], target: 1, pWrong: 0.6 },
  { id: 'ct1_day', rank: 1, arch: 'check', say: 'Please check the name, the day and the time on this paper.', fields: [
    { id: 'name', label: 'Name', values: ['{Captain Reed|@}', '{Nora|@}', '{Mr. Grant|@}', '{Ken|@}'] },
    { id: 'day', label: 'Day', values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    { id: 'time', label: 'Time', values: ['9', '10', '11', '2', '3'] },
  ], docs: [{ kind: 'note', title: 'Appointment book', fields: ['name', 'day', 'time'] }, { kind: 'card', title: 'Appointment card', fields: ['name', 'day', 'time'] }], target: 1, pWrong: 0.65 },
  { id: 'ct1_medicine', rank: 1, arch: 'check', say: 'The nurse wrote this label. Is it the same as my note?', fields: [
    { id: 'what', label: 'Medicine', values: ['cough medicine', 'eye medicine', 'stomach medicine'] },
    { id: 'times', label: 'Times a day', values: ['1', '2', '3'] },
    { id: 'days', label: 'For', values: ['3 days', '5 days', '7 days'] },
  ], docs: [{ kind: 'note', title: 'Doctor\'s note', fields: ['what', 'times', 'days'] }, { kind: 'label', title: 'Label', fields: ['what', 'times', 'days'] }], target: 1, pWrong: 0.65 },
  { id: 'ct1_phone', rank: 1, arch: 'check', say: 'Please check the phone number on the card and on the form.', fields: [
    { id: 'name', label: 'Name', values: ['{Tom|@}', '{Nora|@}', '{Big Joe|@}', '{Grandma Rose|@}'] },
    { id: 'phone', label: 'Phone', values: ['4 5 8 2', '4 8 5 2', '5 4 8 2', '3 6 1 7', '3 1 6 7'] },
  ], docs: [{ kind: 'card', title: 'Patient card', fields: ['name', 'phone'] }, { kind: 'note', title: 'Form', fields: ['name', 'phone'] }], target: 1, pWrong: 0.6 },
  { id: 'ct1_pad', rank: 1, arch: 'respond', mode: 'form', kind: 'phone', say: 'The phone is ringing, and I am busy. Please write the message.', lines: ['Hello, this is {who}.', 'My {what} hurts.', 'Can I come on {day}?'],
    fields: [
      { id: 'who', label: 'Who', values: ['{Mr. Grant|@}', '{Big Joe|@}', '{Captain Reed|@}', '{Nora|@}'] },
      { id: 'what', label: 'Hurts', values: ['back', 'head', 'tooth', 'stomach'] },
      { id: 'day', label: 'Come on', values: ['Monday', 'Wednesday', 'Thursday', 'Friday'] },
    ] },
  { id: 'ct1_book', rank: 1, arch: 'respond', mode: 'slot', kind: 'memo', say: 'Please look at the book. When can the patient come?', layout: 'calendar', rows: DAYS5, cols: TIMES3, cellTags: { t9: ['morning'], t11: ['morning'], t3: ['afternoon'] },
    want: [
      { tag: 'mon', text: 'The patient wants to see the doctor on Monday.' }, { tag: 'tue', text: 'The patient wants to see the doctor on Tuesday.' }, { tag: 'wed', text: 'The patient wants to see the doctor on Wednesday.' }, { tag: 'thu', text: 'The patient wants to see the doctor on Thursday.' }, { tag: 'fri', text: 'The patient wants to see the doctor on Friday.' },
      { tag: 'morning', text: 'The patient can come in the morning.' }, { tag: 'afternoon', text: 'The patient can come in the afternoon.' },
    ],
    avoid: [{ tag: 'morning', text: 'The patient can not come in the morning.' }, { tag: 'afternoon', text: 'The patient is busy in the afternoon.' }, { tag: 't9', text: 'Nine is too early for the patient.' }, { tag: 't3', text: 'Three is too late for the patient.' }],
    busy: ['Busy', 'Busy', 'Busy'], open: ['Dear {Ms. Vega|@},'], close: ['Thank you.'] },
  { id: 'ct1_ask', rank: 1, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'say1' },
  { id: 'ct1_mail', rank: 1, arch: 'respond', mode: 'choose', kind: 'email', bank: 'mail1' },
];

// ---------------------------------------------------------------------------------------------- rank 2 (英検準2級, TOEIC 〜600)
// Skin, heart and bone join the desks. What the doctor wrote on the prescription, the insurance card, the leaflet at the
// pharmacy, the first conditions of an appointment (a day and a time of day).

const R2: AuthoredTask[] = [
  sort('c2_sort1', 2, 1, 'p_vega', 'Here are the next patients. Where does each one go?', ['skin', 'bones', 'general'], [
    ['My skin is red and hurts', 'skin'], ['I fell, and my leg hurts', 'bones'], ['I have a cough and a sore throat', 'general'], ['My skin is red and sore', 'skin'],
  ]),
  check('c2_rx', 2, 2, 'p_patel', 'The nurse wrote the prescription. Please check it against my note.', [
    paper('note', 'Doctor\'s note', [['name', 'Patient', '{Big Joe|@}'], ['what', 'Medicine', 'tablets'], ['times', 'Times a day', 'twice']]),
    paper('order', 'Prescription', [['name', 'Patient', '{Big Joe|@}'], ['what', 'Medicine', 'tablets'], ['times', 'Times a day', 'four times']]),
  ], 'times'),
  msg('c2_pharm', 2, 3, 'c_oldman', 'memo', { say: 'When can I pick up my medicine?' }, ['PHARMACY', 'Open from 9 to 5 on weekdays.', 'Closed from 12:30 to 1:30 for lunch.'],
    'You can pick it up after 1:30, or before 12:30.', ['You can pick it up between 12:30 and 1:30.', 'You can pick it up after 5 on weekdays.']),
  pad('c2_rash', 2, 4, 'p_vega', ['Hello, this is {Anna|@}.', '{Tom|@} has spots on his back, and he is very hot.', 'We would like to see a doctor today.'], [
    ['who', 'Caller', '{Anna|@}', ['{Nora|@}', '{Mrs. Hill|@}']],
    ['sick', 'Patient', '{Tom|@}', ['{Anna|@}', '{Ken|@}']],
    ['what', 'Spots on', 'his back', ['his arm', 'his leg']],
    ['when', 'See a doctor', 'today', ['tomorrow', 'on Friday']],
  ], { say: 'A mother is on the line. Please write the message.' }),
  check('c2_card', 2, 5, 'p_lund', 'Please check the insurance number on the card and on the form.', [
    paper('card', 'Insurance card', [['name', 'Name', '{Mrs. Hill|@}'], ['num', 'Number', '60 4417']]),
    paper('note', 'Form', [['name', 'Name', '{Mrs. Hill|@}'], ['num', 'Number', '60 4471']]),
  ], 'num'),
  msg('c2_pay', 2, 6, 'c_student', 'memo', { say: 'I forgot my insurance card. How much is the visit?' }, ['PAYMENTS', 'With an insurance card: 5 coins.', 'Without a card: 10 coins. Show your card later, and we will give 5 coins back.'],
    'It is 10 coins today, but you can get 5 coins back later.', ['It is 5 coins today, and you can get 10 coins back later.', 'It is 10 coins today, and you can not get anything back.']),
  slot('c2_book', 2, 7, 'p_vega', 'memo', ['{Captain Reed|@} needs a visit this week.', 'He can come only on Wednesday or Thursday, and he does not want to come in the afternoon.'], DAYS5, TIMES3, ['morning'], ['mon', 'tue', 'fri'], 'wed-t11', ['Busy', 'Busy', 'Busy', 'Busy'],
    { say: 'Please look at the book. When can he come?', extraBusy: ['thu-t9'] }),
  sort('c2_sort2', 2, 8, 'p_vega', 'More patients and more papers. Please look at each one.', ['heart', 'pharmacy', 'pay'], [
    ['I feel pain in my chest when I walk', 'heart'], ['I need the medicine from the doctor', 'pharmacy'], ['I want to pay for my visit', 'pay'], ['My heart is beating very fast', 'heart'],
  ]),
  check('c2_ok', 2, 9, 'p_patel', 'Is this prescription the same as my note?', [
    paper('note', 'Doctor\'s note', [['what', 'Medicine', 'cough medicine'], ['days', 'For', '7 days'], ['meals', 'Take', 'after meals']]),
    paper('order', 'Prescription', [['what', 'Medicine', 'cough medicine'], ['days', 'For', '7 days'], ['meals', 'Take', 'after meals']]),
  ], null),
  msg('c2_leaflet', 2, 10, 'c_grandma', 'memo', { say: 'When should I take the tablets?' }, ['YOUR TABLETS', 'Take one tablet after each meal.', 'Do not take more than three a day.'],
    'Take one tablet after each meal.', ['Take one tablet before each meal.', 'Take three tablets after each meal.']),
  msg('c2_allergy', 2, 11, 'c_cook', 'memo', { say: 'I have an allergy to nuts. Can I take this medicine?' }, ['MEDICINE LABEL', 'This medicine contains nuts.', 'Do not take it if you have a nut allergy.'],
    'No. You must not take it, because it has nuts in it.', ['Yes. You can take it, because it has nuts in it.', 'No. You must not take it, because it has milk in it.']),
  check('c2_book2', 2, 12, 'p_ito', 'Please check the appointment card against the book.', [
    paper('note', 'Appointment book', [['name', 'Name', '{Tom|@}'], ['day', 'Day', 'Tuesday'], ['where', 'Doctor', '{Dr. Moreau|@}']]),
    paper('card', 'Appointment card', [['name', 'Name', '{Tom|@}'], ['day', 'Day', 'Tuesday'], ['where', 'Doctor', '{Dr. Patel|@}']]),
  ], 'where'),
  pad('c2_back', 2, 13, 'p_vega', ['Good morning. This is {Big Joe|@}.', 'My back is much worse. I can not walk well.', 'I need to see someone this afternoon.'], [
    ['who', 'Caller', '{Big Joe|@}', ['{Mr. Grant|@}', '{Captain Reed|@}']],
    ['what', 'His', 'back is worse', ['back is better', 'leg is worse']],
    ['when', 'See someone', 'this afternoon', ['this morning', 'tomorrow afternoon']],
  ], { say: '{Big Joe|@} is on the phone. Please write the message.' }),
  msg('c2_late', 2, 14, 'c_boy', 'memo', { say: 'My appointment was at ten. It is ten past, and I am late. What should I do?' }, ['CLINIC RULE', 'If you are more than 15 minutes late, please tell the desk.', 'The doctor may ask you to wait.'],
    'You are only ten minutes late, so please sit down and wait.', ['You are more than 15 minutes late, so please tell the desk.', 'You must go home now.']),
  sort('c2_sort3', 2, 15, 'p_vega', 'The last patients before lunch. Please read them well.', ['skin', 'heart', 'bones', 'children'], [
    ['My leg hurts after I fell', 'bones'], ['My boy has red spots', 'children'], ['My heart is beating very fast', 'heart'], ['My skin is dry', 'skin'],
  ]),
  check('c2_form', 2, 16, 'p_lund', 'Please check the address on the form against the card.', [
    paper('card', 'Patient card', [['name', 'Name', '{Mr. Grant|@}'], ['addr', 'Address', '12 Bridge Street']]),
    paper('note', 'Form', [['name', 'Name', '{Mr. Grant|@}'], ['addr', 'Address', '21 Bridge Street']]),
  ], 'addr'),
  msg('c2_hours', 2, 17, 'c_merchant', 'memo', { say: 'I work all day. Can I see a doctor in the evening?' }, ['EVENING CLINIC', 'Every Thursday from 5 to 8.', 'No appointment is needed.'],
    'Yes. You can come on Thursday evening, and you do not need an appointment.', ['Yes. You can come on Tuesday evening, and you do not need an appointment.', 'Yes. You can come on Thursday evening, but you need an appointment.']),
  slot('c2_book3', 2, 18, 'p_vega', 'memo', ['{Mrs. Hill|@} needs the Heart clinic on Monday, Tuesday or Wednesday.', 'She would like the afternoon, but not on Monday.'], DAYS3, TIMES3, ['afternoon'], ['mon'], 'tue-t3', ['Busy', 'Busy', 'Busy'],
    { say: 'Please look at the book. When can she come?', extraBusy: ['wed-t11', 'mon-t11'] }),
  check('c2_dose', 2, 19, 'p_patel', 'Is the dose on the label the same as in my note?', [
    paper('note', 'Doctor\'s note', [['what', 'Medicine', 'tablets'], ['dose', 'Dose', '2 tablets'], ['days', 'For', '5 days']]),
    paper('label', 'Label', [['what', 'Medicine', 'tablets'], ['dose', 'Dose', '1 tablet'], ['days', 'For', '5 days']]),
  ], 'dose'),
  msg('c2_thanks', 2, 20, 'c_scholar', 'speech', { say: 'Thank you. The doctor was very kind, and the nurse was helpful, too.' }, ['Thank you. The doctor was very kind, and the nurse was helpful, too.'],
    'We are glad that you were pleased with the doctor and the nurse.', ['We are sorry that you were not pleased with the doctor and the nurse.', 'We are glad that you were pleased with the dentist and the nurse.']),
];

// ---------------------------------------------------------------------------------------------- rank 2 templates and banks

const QA_SAY2 = bank(2, [
  ['I would like to make an appointment with {Dr. Patel|@} for Friday morning.', 'Certainly. I will write you down for Friday morning with {Dr. Patel|@}.', 'book', ['Certainly. I will write you down for Friday afternoon with {Dr. Patel|@}.', 'Certainly. I will write you down for Friday morning with {Dr. Moreau|@}.']],
  ['I have lost my insurance card. Can I still see the doctor today?', 'Yes, you can. You will pay 10 coins today and show your card later.', 'card', ['Yes, you can. You will pay 5 coins today and show your card later.', 'No, you can not. You will pay 10 coins today and show your card later.']],
  ['My daughter has spots. She is six years old.', 'I am sorry. The Children\'s clinic can see your daughter today.', 'child', ['I am sorry. The Heart clinic can see your daughter today.', 'I am sorry. The Children\'s clinic can not see your daughter, because she is six.']],
  ['I can not come on Thursday. Can I change my appointment to Friday?', 'Yes. Your appointment is now on Friday.', 'change', ['Yes. Your appointment is now on Thursday.', 'Yes. Your appointment is now on Monday.']],
  ['I am allergic to nuts. Please tell the doctor.', 'Thank you. I will write on your card that you are allergic to nuts.', 'allergy', ['Thank you. I will write on your card that you are allergic to milk.', 'Thank you. I will write on your card that you are not allergic to nuts.']],
  ['The doctor said that I must take the tablets twice a day.', 'Yes. Please take the tablets twice a day, as the doctor said.', 'tablet', ['Yes. Please take the tablets four times a day, as the doctor said.', 'Yes. Please take the tablets twice a week, as the doctor said.']],
  ['I am sorry that I missed my appointment on Tuesday.', 'That is all right. I will give you a new appointment.', 'sorry', ['That is all right. You were not late on Tuesday.', 'Thank you. You are welcome on Tuesday.']],
  ['My son is dizzy, and he has a headache.', 'I am sorry. Please sit down with him. The nurse will see him soon.', 'dizzy', ['I am sorry. Please go home with him. The nurse will not see him.', 'I am glad. Please sit down with him. The nurse will see him soon.']],
]);

const QA_PHONE2 = bank(2, [
  ['Hello, this is {Mrs. Hill|@}. I would like to move my appointment from Monday to Wednesday.', 'Yes, {Mrs. Hill|@}. Your appointment is now on Wednesday.', 'move', ['Yes, {Mrs. Hill|@}. Your appointment is now on Monday.', 'Yes, {Ken|@}. Your appointment is now on Wednesday.']],
  ['Is the doctor in? I would like to talk about my medicine.', 'I am sorry. The doctor is busy now. Can I take a message about your medicine?', 'doctor', ['I am sorry. The doctor is busy now. Can I take a message about your lunch?', 'I am glad. The doctor is busy now. Can I take a message about your medicine?']],
  ['I need to come in today. My tooth hurts very much.', 'I am sorry. The dentist can see you at two today.', 'tooth', ['I am sorry. The dentist can see you at two next week.', 'I am sorry. The eye doctor can see you at two today.']],
  ['Can you tell me when the pharmacy closes?', 'The pharmacy closes at five on weekdays.', 'hours', ['The pharmacy closes at five on Sundays.', 'The pharmacy opens at five on weekdays.']],
  ['I am calling for my father. He can not walk, and he must come at four.', 'Yes. We will have a chair ready for your father at four.', 'chair', ['Yes. We will have a chair ready for your father at ten.', 'Yes. We will have a chair ready for your mother at four.']],
  ['This is the school. Two children have spots. Can a nurse come tomorrow?', 'Yes. A nurse can come to the school tomorrow.', 'school', ['Yes. A nurse can come to the school yesterday.', 'Yes. A nurse can come to the hospital tomorrow.']],
  ['Hello, I would like to know the cost of a visit for a child.', 'A visit for a child is free, if the child is under twelve.', 'cost', ['A visit for a child is ten coins, if the child is under twelve.', 'A visit for a child is free, if the child is over twelve.']],
  ['Can you call me back before noon? My number is 4 5 8 2.', 'Yes. I will call you back before noon on 4 5 8 2.', 'callback', ['Yes. I will call you back after noon on 4 5 8 2.', 'Yes. I will call you back before noon on 4 8 5 2.']],
]);

const QA_MAIL2 = bank(2, [
  ['Dear {Ms. Vega|@}, I am a student, and I have a cold. Can I come after four?', 'Yes. The doctor can see you after four.', 'visit', ['Yes. The doctor can see you before four.', 'No. The doctor can see you after four.']],
  ['Dear {Ms. Vega|@}, please send my test results to my new address: 8 Market Street.', 'Thank you. We will send your test results to 8 Market Street.', 'address', ['Thank you. We will send your test results to 18 Market Street.', 'Thank you. We will send your test results to 8 Station Street.']],
  ['Dear {Ms. Vega|@}, my mother is eighty and can not walk far. Is there a lift?', 'Yes. There is a lift next to the front desk, and it goes to every floor.', 'lift', ['Yes. There is a lift next to the front desk, but it goes only to the first floor.', 'No. There is a lift next to the front desk, and it goes to every floor.']],
  ['Dear {Ms. Vega|@}, thank you for the help last Tuesday. The nurse was very kind.', 'We are glad that you were pleased with our nurse last Tuesday.', 'thanks', ['We are sorry that you were not pleased with our nurse last Tuesday.', 'We are glad that you were pleased with our nurse last Friday.']],
  ['Dear {Ms. Vega|@}, I have a fever, so I can not come on Monday. May I come on Wednesday?', 'We are sorry that you are sick. You can come on Wednesday.', 'sick', ['We are glad that you are sick. You can come on Wednesday.', 'We are sorry that you are sick. You can come on Monday.']],
  ['Dear {Ms. Vega|@}, how much is a visit to the eye clinic with my insurance card?', 'With your insurance card, a visit to the eye clinic is 5 coins.', 'price', ['Without your insurance card, a visit to the eye clinic is 5 coins.', 'With your insurance card, a visit to the dentist is 5 coins.']],
]);

const B2: Record<string, QaItem[]> = { say2: QA_SAY2, phone2: QA_PHONE2, mail2: QA_MAIL2 };

const T2: TaskTemplate[] = [
  { id: 'ct2_sort', rank: 2, arch: 'sort', say: 'Here are the next patients. Where does each one go?', count: [4, 5], bins: ['skin', 'bones', 'heart', 'general', 'children', 'pharmacy', 'pay'],
    patterns: [
      { text: 'I have red spots on my arm', bins: ['skin'] }, { text: 'My skin is very dry and it hurts', bins: ['skin'] }, { text: 'My hands are red and hurt', bins: ['skin'] }, { text: 'I have spots on my face', bins: ['skin'] }, { text: 'There is a new spot on my back', bins: ['skin'] },
      { text: 'I fell, and I can not move my leg', bins: ['bones'] }, { text: 'I can not bend my knee after I fell', bins: ['bones'] }, { text: 'My arm hurts after the fall', bins: ['bones'] }, { text: 'I think that my foot is broken', bins: ['bones'] }, { text: 'My shoulder hurts when I lift it', bins: ['bones'] },
      { text: 'I feel pain in my chest when I walk', bins: ['heart'] }, { text: 'My heart is beating very fast', bins: ['heart'] }, { text: 'My chest feels tight when I run', bins: ['heart'] }, { text: 'I get tired when I climb the stairs', bins: ['heart'] },
      { text: 'I have a cough and a sore throat', bins: ['general'] }, { text: 'I have a bad cold and a fever', bins: ['general'] }, { text: 'My stomach hurts, and I feel sick', bins: ['general'] }, { text: 'I feel dizzy and tired', bins: ['general'] }, { text: 'My head has hurt for three days', bins: ['general'] },
      { text: 'My little boy has spots on his face', bins: ['children'] }, { text: 'My daughter is four and has a fever', bins: ['children'] }, { text: 'My baby has a cough', bins: ['children'] }, { text: 'My son is six, and he is very hot', bins: ['children'] },
      { text: 'I need the medicine from the doctor', bins: ['pharmacy'] }, { text: 'I want to pick up my tablets', bins: ['pharmacy'] }, { text: 'Here is my prescription from the doctor', bins: ['pharmacy'] },
      { text: 'I want to pay for my visit', bins: ['pay'] }, { text: 'How much do I owe you for today?', bins: ['pay'] }, { text: 'I would like a receipt, please', bins: ['pay'] },
    ] },
  { id: 'ct2_rx', rank: 2, arch: 'check', say: 'The nurse wrote the prescription. Please check it against my note.', fields: [
    { id: 'name', label: 'Patient', values: ['{Big Joe|@}', '{Mrs. Hill|@}', '{Tom|@}', '{Grandpa Sam|@}', '{Captain Reed|@}'] },
    { id: 'what', label: 'Medicine', values: ['tablets', 'cough medicine', 'eye drops', 'stomach medicine'] },
    { id: 'times', label: 'Times a day', values: ['once', 'twice', 'three times', 'four times'] },
  ], docs: [{ kind: 'note', title: 'Doctor\'s note', fields: ['name', 'what', 'times'] }, { kind: 'order', title: 'Prescription', fields: ['name', 'what', 'times'] }], target: 1, pWrong: 0.65 },
  { id: 'ct2_dose', rank: 2, arch: 'check', say: 'Is the dose on the label the same as in my note?', fields: [
    { id: 'what', label: 'Medicine', values: ['pain tablets', 'cough tablets', 'stomach tablets'] },
    { id: 'dose', label: 'Dose', values: ['1 tablet', '2 tablets', '3 tablets'] },
    { id: 'days', label: 'For', values: ['3 days', '5 days', '7 days', '10 days'] },
  ], docs: [{ kind: 'note', title: 'Doctor\'s note', fields: ['what', 'dose', 'days'] }, { kind: 'label', title: 'Label', fields: ['what', 'dose', 'days'] }], target: 1, pWrong: 0.65 },
  { id: 'ct2_spoon', rank: 2, arch: 'check', say: 'Is the dose on the label the same as in my note?', fields: [
    { id: 'what', label: 'Medicine', values: ['cough medicine', 'stomach medicine'] },
    { id: 'dose', label: 'Dose', values: ['1 spoon', '2 spoons', '3 spoons'] },
    { id: 'days', label: 'For', values: ['3 days', '5 days', '7 days', '10 days'] },
  ], docs: [{ kind: 'note', title: 'Doctor\'s note', fields: ['what', 'dose', 'days'] }, { kind: 'label', title: 'Label', fields: ['what', 'dose', 'days'] }], target: 1, pWrong: 0.65 },
  { id: 'ct2_drops', rank: 2, arch: 'check', say: 'Is the dose on the label the same as in my note?', fields: [
    { id: 'what', label: 'Medicine', values: ['eye drops', 'ear drops'] },
    { id: 'dose', label: 'Dose', values: ['2 drops', '3 drops', '5 drops'] },
    { id: 'days', label: 'For', values: ['3 days', '5 days', '7 days', '10 days'] },
  ], docs: [{ kind: 'note', title: 'Doctor\'s note', fields: ['what', 'dose', 'days'] }, { kind: 'label', title: 'Label', fields: ['what', 'dose', 'days'] }], target: 1, pWrong: 0.65 },
  { id: 'ct2_card', rank: 2, arch: 'check', say: 'Please check the insurance number on the card and on the form.', fields: [
    { id: 'name', label: 'Name', values: ['{Mrs. Hill|@}', '{Mr. Grant|@}', '{Nora|@}', '{Captain Reed|@}'] },
    { id: 'num', label: 'Number', values: ['60 4417', '60 4471', '71 3508', '71 3580', '28 9946', '28 9496'] },
  ], docs: [{ kind: 'card', title: 'Insurance card', fields: ['name', 'num'] }, { kind: 'note', title: 'Form', fields: ['name', 'num'] }], target: 1, pWrong: 0.65 },
  { id: 'ct2_book', rank: 2, arch: 'check', say: 'Please check the appointment card against the book.', fields: [
    { id: 'name', label: 'Name', values: ['{Tom|@}', '{Nora|@}', '{Big Joe|@}', '{Ken|@}'] },
    { id: 'day', label: 'Day', values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    { id: 'where', label: 'Doctor', values: ['{Dr. Patel|@}', '{Dr. Moreau|@}', '{Dr. Lane|@}'] },
  ], docs: [{ kind: 'note', title: 'Appointment book', fields: ['name', 'day', 'where'] }, { kind: 'card', title: 'Appointment card', fields: ['name', 'day', 'where'] }], target: 1, pWrong: 0.65 },
  { id: 'ct2_addr', rank: 2, arch: 'check', say: 'Please check the address on the form against the card.', fields: [
    { id: 'name', label: 'Name', values: ['{Mr. Grant|@}', '{Mrs. Hill|@}', '{Big Joe|@}'] },
    { id: 'addr', label: 'Address', values: ['12 Bridge Street', '21 Bridge Street', '5 Station Road', '15 Station Road', '8 Market Street', '18 Market Street'] },
  ], docs: [{ kind: 'card', title: 'Patient card', fields: ['name', 'addr'] }, { kind: 'note', title: 'Form', fields: ['name', 'addr'] }], target: 1, pWrong: 0.65 },
  { id: 'ct2_fee', rank: 2, arch: 'check', say: 'Please check the bill for the visit.', fields: [
    { id: 'who', label: 'Patient', values: ['{Mr. Grant|@}', '{Nora|@}', '{Captain Reed|@}'] },
    { id: 'visits', label: 'Visits', range: [1, 4] },
    { id: 'price', label: 'Coins a visit', values: ['5', '10'] },
    { id: 'total', label: 'Total', calc: 'visits * price', fmt: '{n} coins' },
  ], docs: [{ kind: 'order', title: 'Visits', fields: ['who', 'visits', 'price'] }, { kind: 'invoice', title: 'Bill', fields: ['who', 'visits', 'price', 'total'] }], target: 1, pWrong: 0.65, wrongable: ['visits', 'total'] },
  { id: 'ct2_pad', rank: 2, arch: 'respond', mode: 'form', kind: 'phone', say: 'A mother is on the line. Please write the message.', lines: ['Hello, this is {who}.', 'My child has spots on {where}, and a high fever.', 'We would like to see a doctor {when}.'],
    fields: [
      { id: 'who', label: 'Caller', values: ['{Anna|@}', '{Nora|@}', '{Mrs. Hill|@}'] },
      { id: 'where', label: 'Spots on', values: ['the back', 'the arm', 'the leg'] },
      { id: 'when', label: 'See a doctor', values: ['today', 'tomorrow', 'on Friday'] },
    ] },
  { id: 'ct2_book2', rank: 2, arch: 'respond', mode: 'slot', kind: 'memo', say: 'Please look at the book. When can the patient come?', layout: 'calendar', rows: DAYS5, cols: TIMES3, cellTags: { t9: ['morning'], t11: ['morning'], t3: ['afternoon'] },
    want: [
      { tag: 'mon', text: 'The patient can come on Monday.' }, { tag: 'tue', text: 'The patient can come on Tuesday.' }, { tag: 'wed', text: 'The patient can come on Wednesday.' }, { tag: 'thu', text: 'The patient can come on Thursday.' }, { tag: 'fri', text: 'The patient can come on Friday.' },
      { tag: 'morning', text: 'The patient would like the morning.' }, { tag: 'afternoon', text: 'The patient would like the afternoon.' }, { tag: 't11', text: 'The patient would like 11:00.' },
    ],
    avoid: [{ tag: 'mon', text: 'The patient can not come on Monday.' }, { tag: 'fri', text: 'The patient is away on Friday.' }, { tag: 't9', text: 'Nine is too early for the patient.' }, { tag: 't3', text: 'Three is too late for the patient.' }],
    busy: ['Busy', 'Busy', 'Busy', 'Busy'], open: ['Dear {Ms. Vega|@},'], close: ['Thank you.'] },
  { id: 'ct2_say', rank: 2, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'say2' },
  { id: 'ct2_phone', rank: 2, arch: 'respond', mode: 'choose', kind: 'phone', bank: 'phone2' },
  { id: 'ct2_mail', rank: 2, arch: 'respond', mode: 'choose', kind: 'email', bank: 'mail2' },
];

// ---------------------------------------------------------------------------------------------- rank 3 (英検2級, TOEIC 〜730)
// The clinic's real work: prescriptions with doses and warnings, insurance cover and claims, test results and scans,
// the flu vaccination week, calls that are only heard, the one sentence of a leaflet that does not agree with the doctor's note.

const R3A: AuthoredTask[] = [
  check('c3_dose', 3, 1, 'p_patel', 'The pharmacist has made up this prescription. Please check it against my note.', [
    note('Doctor\'s note', ['{Big Joe|@}: two tablets, three times a day, for five days.']),
    paper('order', 'Prescription', [['name', 'Patient', '{Big Joe|@}'], ['dose', 'Dose', '2 tablets'], ['times', 'Times a day', 'twice'], ['days', 'For', '5 days']]),
  ], 'times', { fix: ['three times', ['twice', 'three times', 'four times']] }),
  sort('c3_sort1', 3, 2, 'p_vega', 'The morning list is long. Please send each patient to the right desk.', ['blood', 'scan', 'pharmacy', 'pay'], [
    ['The doctor wants a blood test', 'blood'], ['The doctor wants a picture of my chest', 'scan'], ['I have the paper for my medicine', 'pharmacy'], ['I have come to pay my bill', 'pay'],
  ]),
  msg('c3_leaflet', 3, 3, 'c_grandma', 'memo', { say: 'The label says that this medicine may make me drowsy. Can I drive after I take it?' }, ['YOUR MEDICINE', 'This medicine may make you drowsy.', 'Do not drive or use machines after you take it.'],
    'No. You must not drive after you take it.', ['Yes. You can drive after you take it.', 'No. You must not take it after you drive.']),
  pad('c3_scan', 3, 4, 'p_vega', ['Good morning. This is {Nurse Ito|@} at the scan room.', 'The scan for {Mrs. Hill|@} will take place on Thursday at two.', 'Please tell her not to eat for four hours before.'], [
    ['who', 'Caller', '{Nurse Ito|@}', ['{Ms. Lund|@}', '{Mr. Costa|@}']],
    ['patient', 'Scan for', '{Mrs. Hill|@}', ['{Grandpa Sam|@}', '{Ken|@}']],
    ['day', 'On', 'Thursday at two', ['Tuesday at two', 'Thursday at four']],
    ['eat', 'No food for', 'four hours', ['two hours', 'fourteen hours']],
  ], { features: ['audioOnly'], say: 'The scan room is calling. Please write the message.' }),
  check('c3_card', 3, 5, 'p_lund', 'Please check this insurance card against the form. The insurer will ask.', [
    paper('card', 'Insurance card', [['name', 'Name', '{Nora|@}'], ['num', 'Number', '71 3508'], ['end', 'Valid until', 'December 31']]),
    paper('note', 'Form', [['name', 'Name', '{Nora|@}'], ['num', 'Number', '71 3508'], ['end', 'Valid until', 'December 13']]),
  ], 'end', { fix: ['December 31', ['December 3', 'December 13', 'December 31']] }),
  msg('c3_cover', 3, 6, 'c_merchant', 'memo', { say: 'Does my insurance pay for the eye test?' }, ['YOUR INSURANCE', 'Pays for: visits, blood tests, scans.', 'Does not pay for: glasses, eye tests for new glasses.'],
    'No. The insurance does not pay for an eye test for new glasses.', ['Yes. The insurance pays for an eye test for new glasses.', 'No. The insurance does not pay for blood tests.']),
  slot('c3_book1', 3, 7, 'p_vega', 'memo', ['{Grandma Rose|@} needs a blood test, and she must not eat before it, so she needs the morning.', 'She can not come on Monday or Tuesday, because her daughter drives her only on other days.'], DAYS5, TIMES4, ['morning'], ['mon', 'tue'], 'wed-t9', ['Busy', 'Full', 'Busy', 'Full'],
    { say: 'Please look at the book. When can she come?', extraBusy: ['wed-t1', 'thu-t11', 'fri-t9'] }),
  check('c3_ok1', 3, 8, 'p_patel', 'Is the label on this medicine the same as my note?', [
    paper('note', 'Doctor\'s note', [['what', 'Medicine', 'ointment'], ['where', 'Use on', 'the skin of the arm'], ['times', 'Times a day', 'twice']]),
    paper('label', 'Label', [['what', 'Medicine', 'ointment'], ['where', 'Use on', 'the skin of the arm'], ['times', 'Times a day', 'twice']]),
  ], null),
  msg('c3_fee', 3, 9, 'c_oldman', 'letter', { from: '{Grandpa Sam|@}' }, ['Dear Clinic,', 'I received a bill for 40 coins, but my insurance should pay for the visit.', 'Could you please check it?', 'Thank you,', '{Grandpa Sam|@}'],
    'We will check whether the insurance has paid for his visit.', ['We will check whether his bill is 4 coins.', 'We will tell him that the insurance does not pay for visits.']),
  sort('c3_sort2', 3, 12, 'p_vega', 'The flu vaccination week begins. Please look at each one.', ['shots', 'urgent', 'sameday'], [
    ['I have come for my vaccination', 'shots'], ['My husband can not breathe well', 'urgent'], ['My daughter has a fever', 'sameday'], ['My father has a bad pain in his chest', 'urgent'],
  ]),
  msg('c3_wait', 3, 10, 'c_baker', 'memo', { say: 'I have a fever. Do I have to wait?' }, ['WAITING ROOM', 'Patients go in by number.', 'If you can not breathe, or you are in great pain, tell the desk now.'],
    'Please wait, unless you can not breathe or you are in great pain.', ['Please wait, and do not tell the desk if you can not breathe.', 'Please go home, because the clinic does not see patients with a fever.']),
  pad('c3_phone', 3, 12, 'p_vega', ['Hello. This is the pharmacy. {Mr. Costa|@} speaking.', 'The medicine for {Tom|@} is ready, but the syrup is out of stock.', 'It will come on Monday. Please tell his mother.'], [
    ['who', 'Caller', '{Mr. Costa|@}', ['{Ms. Lund|@}', '{Dr. Moreau|@}']],
    ['patient', 'Medicine for', '{Tom|@}', ['{Ken|@}', '{Lily|@}']],
    ['what', 'Out of stock', 'the syrup', ['the tablets', 'the ointment']],
    ['day', 'Will come on', 'Monday', ['Sunday', 'Thursday']],
  ], { features: ['audioOnly'], say: 'It is the pharmacy on the line. Please write down what they say.' }),
  check('c3_bill', 3, 13, 'p_lund', 'Please check the bill. The treatment list is on top.', [
    paper('card', 'Treatment list', [['visit', 'Visit', '10'], ['test', 'Blood test', '14'], ['total', 'Total', '24']]),
    paper('invoice', 'Bill', [['visit', 'Visit', '10'], ['test', 'Blood test', '14'], ['total', 'Total', '34']]),
  ], 'total', { fix: ['24', ['24', '34', '44']] }),
  msg('c3_wonder', 3, 14, 'c_scholar', 'email', { from: '{Professor Hale|@}', subject: 'My appointment' }, ['Dear {Ms. Vega|@},', 'I was wondering if you could move my appointment to Thursday.', 'I have to give a lecture on Tuesday morning.', 'Thank you,', '{Professor Hale|@}'],
    'Of course. We will move the appointment from Tuesday morning to Thursday.', ['Of course. We will move the appointment from Thursday to Tuesday morning.', 'I am afraid that we will not move the appointment from Tuesday morning.']),
  sort('c3_sort3', 3, 15, 'p_vega', 'The afternoon list. Please look at each one.', ['sameday', 'booked', 'pharmacy', 'insurance'], [
    ['My son fell and his arm hurts', 'sameday'], ['I would like a check-up next month', 'booked'], ['My medicine is not ready', 'pharmacy'], ['The insurance has sent a letter', 'insurance'],
  ]),
  msg('c3_gap1', 3, 16, 'p_patel', 'memo', { say: 'Which word completes the sentence?' }, ['The patient ___ was here yesterday has a fever.'],
    'who', ['which', 'whose']),
  check('c3_form', 3, 17, 'p_lund', 'The patient wrote down her allergies. Please check the form against her file.', [
    paper('note', 'Patient file', [['name', 'Name', '{Nora|@}'], ['allergy', 'Allergic to', 'nuts'], ['blood', 'Blood group', 'A']]),
    paper('card', 'Form', [['name', 'Name', '{Nora|@}'], ['allergy', 'Allergic to', 'milk'], ['blood', 'Blood group', 'A']]),
  ], 'allergy', { fix: ['nuts', ['milk', 'nuts', 'eggs']] }),
  msg('c3_complaint', 3, 18, 'p_vega', 'email', { from: '{Mrs. Hill|@}', subject: 'My bill' }, ['Dear {Ms. Vega|@},', 'You charged me 20 coins for a visit last Friday, but I paid only 10 coins last time.', 'I would like you to explain this.', 'Yours,', '{Mrs. Hill|@}'],
    'We will explain why her visit last Friday cost 20 coins.', ['We will explain why her visit last Friday cost 10 coins.', 'We will not explain why her visit cost 20 coins.'], { say: 'What does {Mrs. Hill|@} ask us to do?' }),
  check('c3_ref', 3, 19, 'p_patel', 'I have written a letter for the specialist. Please check the appointment against it.', [
    note('Letter to the specialist', ['Please see {Big Joe|@} about his back within two weeks. He must not lift anything heavy.']),
    paper('card', 'Appointment', [['who', 'Patient', '{Big Joe|@}'], ['when', 'Within', 'two weeks'], ['lift', 'Lifting', 'not allowed']]),
  ], null),
  pad('c3_phone2', 3, 20, 'p_vega', ['Hello, this is {Mrs. Hill|@}.', 'The doctor said that I must have a scan of my knee.', 'Can I come on Wednesday afternoon, after two?'], [
    ['who', 'Caller', '{Mrs. Hill|@}', ['{Anna|@}', '{Nora|@}']],
    ['what', 'Scan of her', 'knee', ['chest', 'back']],
    ['day', 'Come on', 'Wednesday afternoon', ['Wednesday morning', 'Thursday afternoon']],
  ], { features: ['audioOnly'], say: '{Mrs. Hill|@} is on the line. Please write the message.' }),
  msg('c3_contradict1', 3, 21, 'p_patel', 'memo', { say: 'One sentence of this leaflet does not agree with my note. Which one?' }, [
    'Note: Take one tablet twice a day, after meals. Do not take it with milk. Stop after seven days.',
    'Leaflet: (1) Take one tablet twice a day, after meals. (2) You may take it with milk. (3) Stop after seven days.',
  ], '(2) You may take it with milk.', ['(1) Take one tablet twice a day, after meals.', '(3) Stop after seven days.']),
  check('c3_vaccine', 3, 22, 'p_ito', 'Please check the vaccination card against the book.', [
    paper('note', 'Vaccination book', [['name', 'Name', '{Tom|@}'], ['shot', 'Vaccine', 'flu for children'], ['date', 'Date', 'October 12']]),
    paper('card', 'Vaccination card', [['name', 'Name', '{Tom|@}'], ['shot', 'Vaccine', 'flu for children'], ['date', 'Date', 'October 21']]),
  ], 'date', { fix: ['October 12', ['October 2', 'October 12', 'October 21']] }),
  msg('c3_say1', 3, 23, 'c_mom', 'speech', { say: 'Could you tell me when my son can come back to school? He has had a fever since Monday.' }, ['Could you tell me when my son can come back to school? He has had a fever since Monday.'],
    'The doctor will tell you when he can go back to school, because he has had a fever since Monday.', ['The doctor will tell you when he can go back to school, because he has had a fever since Friday.', 'The doctor will tell you when he can go back to school, because he has not had a fever since Monday.']),
];

const R3B: AuthoredTask[] = [
  check('c3_label', 3, 24, 'p_costa', 'Please check the label of this syrup against the doctor\'s note. It is for a child.', [
    paper('note', 'Doctor\'s note', [['who', 'Patient', '{Lily|@}'], ['dose', 'Dose', '1 spoon'], ['times', 'Times a day', '3']]),
    paper('label', 'Label', [['who', 'Patient', '{Lily|@}'], ['dose', 'Dose', '11 spoon'], ['times', 'Times a day', '3']]),
  ], 'dose', { fix: ['1 spoon', ['1 spoon', '2 spoons', '11 spoon']] }),
  msg('c3_policy', 3, 25, 'c_merchant', 'memo', { say: 'I can not come to my appointment tomorrow. Do I have to pay?' }, ['IF YOU CAN NOT COME', 'Please tell us 24 hours before your appointment.', 'If you tell us later, or do not come, you must pay 10 coins.'],
    'You do not pay if you tell us 24 hours before, so please call today.', ['You must pay 10 coins, even if you call today.', 'You do not pay, even if you do not come.']),
  slot('c3_book2', 3, 26, 'p_vega', 'memo', ['{Ken|@} would like a check-up with {Dr. Patel|@}, but he has lectures every morning.', 'He can come on Tuesday, Thursday or Friday, but not on Friday at 3, because he works then.'], DAYS5, TIMES4, ['afternoon'], ['mon', 'wed'], 'thu-t1', ['Busy', 'Full', 'Busy', 'Full'],
    { say: 'Please look at the book. When can {Ken|@} come?', extraBusy: ['tue-t3', 'fri-t1'] }),
  sort('c3_sort4', 3, 27, 'p_vega', 'The next patients. Please read each one well.', ['urgent', 'sameday', 'booked', 'insurance'], [
    ['My father has a pain in his chest', 'urgent'], ['My foot is very red and hurts since this morning', 'sameday'], ['I would like a check-up in two weeks', 'booked'], ['The insurance has asked for another form', 'insurance'],
  ]),
  msg('c3_hours', 3, 28, 'p_vega', 'email', { from: '{Mr. Okoye|@}', subject: 'Staff check-ups' }, ['Dear {Ms. Vega|@},', 'Our company would like to book check-ups for twenty staff members.', 'We can send five staff a day, from Monday to Thursday, and we would like to begin next week.', 'Best regards,', '{Mr. Okoye|@}'],
    'He wants twenty check-ups, with five staff a day, from next week.', ['He wants twenty check-ups, with twenty staff a day, from next week.', 'He wants five check-ups, with five staff a day, from next month.'], { say: 'What does {Mr. Okoye|@} want?' }),
  check('c3_result', 3, 29, 'p_patel', 'The blood test results are back. Please check the paper for the patient against the laboratory report.', [
    paper('card', 'Laboratory report', [['name', 'Patient', '{Captain Reed|@}'], ['date', 'Test on', 'March 8'], ['next', 'Come back', 'in two weeks']]),
    paper('letter', 'Paper for the patient', [['name', 'Patient', '{Captain Reed|@}'], ['date', 'Test on', 'March 8'], ['next', 'Come back', 'in two months']]),
  ], 'next', { fix: ['in two weeks', ['in two days', 'in two weeks', 'in two months']] }),
  msg('c3_gap2', 3, 30, 'p_patel', 'memo', { say: 'Which word is right?' }, ['___ the pain, the patient waited for two hours.'],
    'Despite', ['Because', 'Although']),
  msg('c3_say2', 3, 31, 'c_cook', 'phone', { say: 'Hello. I am calling because I would like to book a blood test for next week.' }, ['Hello. I am calling because I would like to book a blood test for next week.'],
    'Certainly. I will write down your blood test for next week.', ['Certainly. I can not write down your blood test for next week.', 'Certainly. I will write down your scan for next week.']),
  check('c3_ok2', 3, 32, 'p_ito', 'Is the appointment card the same as the book? I think so.', [
    paper('note', 'Appointment book', [['name', 'Name', '{Mr. Grant|@}'], ['what', 'For', 'a check-up'], ['day', 'Day', 'Friday at ten']]),
    paper('card', 'Appointment card', [['name', 'Name', '{Mr. Grant|@}'], ['what', 'For', 'a check-up'], ['day', 'Day', 'Friday at ten']]),
  ], null),
  msg('c3_emergency', 3, 33, 'p_vega', 'email', { from: '{Dr. Moreau|@}', subject: 'The school' }, ['Dear {Ms. Vega|@},', 'Three children at the school have been sick since lunch, and the head teacher is worried.', 'I will go there at once. Please keep my morning patients waiting, and tell them that I will be back at noon.', 'Thank you,', '{Dr. Moreau|@}'],
    'He will be at the school until noon, so the morning patients must wait.', ['He will be back from the school at nine, so the morning patients must wait.', 'He will be at the school until noon, so the morning patients must go home.'], { say: 'What does {Dr. Moreau|@} ask?' }),
  slot('c3_book3', 3, 34, 'p_vega', 'memo', ['{Grandpa Sam|@} has to be in a wheelchair, so he needs the first appointment of the day.', 'The scan room is closed on Wednesday. Please do not use Monday, because the lift is being repaired.'], DAYS5, TIMES4, ['t9'], ['mon', 'wed'], 'tue-t9', ['Busy', 'Full', 'Busy', 'Full'],
    { say: 'Please look at the book. When can he come for the scan?', extraBusy: ['thu-t9', 'fri-t9'] }),
  check('c3_insurance', 3, 35, 'p_lund', 'The insurer asks for a copy of the receipt. Please check my claim form against it.', [
    paper('card', 'Receipt', [['what', 'For', 'a blood test'], ['sum', 'Paid', '14 coins'], ['date', 'Date', 'May 6']]),
    paper('note', 'Claim form', [['what', 'For', 'a blood test'], ['sum', 'Paid', '41 coins'], ['date', 'Date', 'May 6']]),
  ], 'sum', { fix: ['14 coins', ['4 coins', '14 coins', '41 coins']] }),
  msg('c3_contradict2', 3, 36, 'p_patel', 'memo', { say: 'Which sentence of this notice does not agree with the notes?' }, [
    'Notes: The flu vaccination is free for people over sixty-five. It takes place from Monday to Wednesday. No appointment is needed.',
    'Notice: (1) The flu vaccination is free for people over sixty-five. (2) It takes place from Monday to Friday. (3) No appointment is needed.',
  ], '(2) It takes place from Monday to Friday.', ['(1) The flu vaccination is free for people over sixty-five.', '(3) No appointment is needed.']),
  pad('c3_phone3', 3, 37, 'p_vega', ['Good afternoon. This is {Ms. Lund|@} from the insurance office.', 'We have received the claim for {Nora|@}. The sum is 45 coins.', 'We will pay it on May 15.'], [
    ['who', 'Caller', '{Ms. Lund|@}', ['{Ms. Vega|@}', '{Mr. Costa|@}']],
    ['patient', 'Claim for', '{Nora|@}', ['{Anna|@}', '{Ken|@}']],
    ['sum', 'Sum', '45 coins', ['54 coins', '15 coins']],
    ['when', 'Will pay on', 'May 15', ['May 5', 'June 15']],
  ], { features: ['audioOnly'], say: 'The insurance office is calling. Please write the message.' }),
  msg('c3_reader', 3, 38, 'c_grandma', 'letter', { from: '{Grandma Rose|@}' }, ['Dear {Ms. Vega|@},', 'I have been coming to your clinic for forty years, and I want to say that the nurses are always kind.', 'But the waiting room is cold in winter. Could you please do something about it?', 'Thank you,', '{Grandma Rose|@}'],
    'She says that the nurses are kind, but she would like the waiting room to be warmer.', ['She says that the nurses are not kind, but she would like the waiting room to be warmer.', 'She says that the nurses are kind, and she would like the waiting room to be colder.']),
  sort('c3_sort5', 3, 39, 'p_vega', 'The last papers of the day. Which desk gets each one?', ['records', 'insurance', 'pay', 'pharmacy'], [
    ['A letter from the specialist about {Mr. Grant|@}', 'records'], ['A form for the insurer to sign', 'insurance'], ['A receipt that I must pay', 'pay'], ['A prescription for a child\'s syrup', 'pharmacy'],
  ]),
  msg('c3_wait2', 3, 40, 'c_sailor', 'speech', { say: 'I would like to see {Dr. Patel|@} today. I have had a pain in my side since Sunday, and I am afraid that it is getting worse.' }, ['I would like to see {Dr. Patel|@} today. I have had a pain in my side since Sunday, and I am afraid that it is getting worse.'],
    'I will ask the nurse to look at you at once, and I will tell {Dr. Patel|@} about the pain.', ['I will ask the nurse to look at you next month, and I will tell {Dr. Patel|@} about the pain.', 'I will ask the nurse to look at you at once, and I will not tell {Dr. Patel|@} about the pain.']),
  check('c3_age', 3, 41, 'p_ito', 'Please check the child\'s age and weight on the form against the file.', [
    paper('note', 'Child\'s file', [['name', 'Name', '{Tom|@}'], ['age', 'Age', '7'], ['kg', 'Weight', '24 kilos']]),
    paper('card', 'Form', [['name', 'Name', '{Tom|@}'], ['age', 'Age', '7'], ['kg', 'Weight', '42 kilos']]),
  ], 'kg', { fix: ['24 kilos', ['14 kilos', '24 kilos', '42 kilos']] }),
  msg('c3_gap3', 3, 42, 'p_patel', 'memo', { say: 'Which words complete the sentence correctly?' }, ['If the fever ___ tomorrow, please call the clinic.'],
    'does not go down', ['will not go down', 'did not go down']),
  msg('c3_thanks', 3, 43, 'c_boy', 'letter', { from: '{Tom|@}' }, ['Dear {Ms. Vega|@},', 'Thank you for the sticker. My cough is much better, and I can go back to school on Monday.', 'The doctor says that I must still take the syrup for three days.', '{Tom|@}'],
    'He is better, and he must take the syrup for three more days.', ['He is better, and he must take the syrup for thirteen more days.', 'He is not better, and he must take the syrup for three more days.']),
  check('c3_ok3', 3, 44, 'p_lund', 'Please check this bill. Is it the same as the treatment list?', [
    paper('card', 'Treatment list', [['visit', 'Visit', '10'], ['scan', 'Scan', '30'], ['total', 'Total', '40']]),
    paper('invoice', 'Bill', [['visit', 'Visit', '10'], ['scan', 'Scan', '30'], ['total', 'Total', '40']]),
  ], null),
  msg('c3_hale', 3, 45, 'c_scholar', 'speech', { say: 'Would it be possible to have a copy of my records? I am moving to another town in June.' }, ['Would it be possible to have a copy of my records? I am moving to another town in June.'],
    'Of course. We will prepare a copy of your records before you move in June.', ['Of course. We will prepare a copy of your records after you move in June.', 'Of course. We will prepare a copy of your insurance before you move in June.']),
];
const R3 = [...R3A, ...R3B];

// ---------------------------------------------------------------------------------------------- rank 3 templates and banks

const QA_SAY3 = bank(3, [
  ['I would like to book a blood test for next Tuesday morning, please.', 'Certainly. I will write down your blood test for next Tuesday morning.', 'book', ['Certainly. I will write down your blood test for next Tuesday afternoon.', 'Certainly. I will write down your scan for next Tuesday morning.']],
  ['Do you mind if I bring my daughter to the appointment? She is only four.', 'Not at all. Please bring your daughter of four to the appointment.', 'permission', ['I am sorry, but you may not bring your daughter of four. Please go ahead.', 'Not at all. Please bring your son of four to the appointment.']],
  ['Has the doctor read my test results yet? I had the blood test on Monday.', 'Not yet. The doctor will read your results after the blood test on Monday, and we will call you.', 'status', ['Not yet. The doctor read your results before the blood test on Monday, and we will call you.', 'Yes. The doctor will read your results after the blood test on Monday, and we will call you.']],
  ['Why do I have to pay 10 coins? I did not see the doctor.', 'You must pay 10 coins because you did not tell us 24 hours before that you could not come.', 'reason', ['You must pay 10 coins because you told us 24 hours before that you could not come.', 'You must pay 20 coins because you did not tell us 24 hours before that you could not come.']],
  ['I was wondering whether you could send the results to my home address.', 'Of course. We will send your results to your home address, if you sign this form.', 'request', ['Of course. We will send your results to your work address, if you sign this form.', 'I am afraid that we will send your results to your home address, if you do not sign this form.']],
  ['I am afraid that I will not be able to come before noon.', 'That is all right. The doctor can see you after noon.', 'delay', ['That is all right. The doctor can see you before noon.', 'I am afraid that I can not see you. The doctor can see you after noon.']],
  ['Could you tell me who the doctor is for children?', 'Yes. {Dr. Moreau|@} sees the children, and {Dr. Patel|@} sees the adults.', 'who', ['Yes. {Dr. Patel|@} sees the children, and {Dr. Moreau|@} sees the adults.', 'Yes. {Dr. Moreau|@} sees the children, and he can not see the adults.']],
  ['Thank you for taking so much care of my mother.', 'It was our pleasure. We are glad that your mother is feeling better.', 'thanks', ['It was our pleasure. We are sorry that your mother is feeling better.', 'You are welcome. We are glad that your father is feeling better.']],
]);

const QA_PHONE3 = bank(3, [
  ['Hello. I am calling to confirm my appointment on Thursday at two.', 'Yes, your appointment is on Thursday at two.', 'confirm', ['Yes, your appointment is on Friday at two.', 'No, your appointment is on Thursday at two.']],
  ['I am afraid that {Dr. Patel|@} is with a patient at the moment.', 'Could you ask him to call me back after the patient?', 'callback', ['Could you ask him to call me before the patient?', 'Could you ask me to call him after the patient?']],
  ['Your results will be ready on Friday morning.', 'Thank you. Could you tell me which time on Friday morning?', 'results', ['Thank you. Could you tell me which time on Monday morning?', 'Thank you. My results were ready on Friday morning.']],
  ['I would like to speak to someone about a mistake in my bill.', 'Certainly. I will put you through to the payments desk.', 'transfer', ['Certainly. I will put you through to the dentist, because the mistake was theirs.', 'Certainly. I will not put you through to the payments desk.']],
  ['We can not deliver the medicine on Monday because of the storm.', 'That is a problem. Could you deliver it on Tuesday?', 'problem', ['That is a problem. Could you deliver it to the station on Monday?', 'That is good. Please deliver it on Monday.']],
  ['This is the school. A boy has fallen and hurt his arm. We will bring him at once.', 'Thank you. We will be ready for the boy and his arm when you arrive.', 'school', ['Thank you. We will be ready for the girl and her arm when you arrive.', 'Thank you. We will be ready for the boy and his leg when you arrive.']],
  ['Can I leave a message for {Nurse Ito|@}? I need to change my appointment.', 'Of course. I will tell {Nurse Ito|@} that you need to change your appointment.', 'message', ['Of course. I will tell {Dr. Patel|@} that you need to change your appointment.', 'Of course. I will tell {Nurse Ito|@} that you do not need to change your appointment.']],
  ['My mother fell yesterday, and I would like to bring her in for a scan.', 'I am sorry to hear that. Could you bring your mother in for a scan this afternoon?', 'fall', ['I am sorry to hear that. Could you bring your father in for a scan this afternoon?', 'I am glad to hear that. Could you bring your mother in for a scan this afternoon?']],
]);

const QA_MAIL3 = bank(3, [
  ['Dear {Ms. Vega|@}, thank you for your inquiry. The price list for the check-ups is attached.', 'Dear {Mr. Okoye|@}, thank you for the price list. I will review it and reply by Friday.', 'attach', ['Dear {Mr. Okoye|@}, thank you for the price list. I will review it and reply by Monday.', 'Dear {Ms. Lund|@}, thank you for the price list. I will review it and reply by Friday.']],
  ['We regret to inform you that {Dr. Moreau|@} is ill, and all appointments on Monday are cancelled.', 'Thank you for letting us know. Please give us a new date for the appointments cancelled on Monday.', 'regret', ['Thank you for letting us know. We will come on Monday as planned.', 'Thank you for letting us know. Please give us a new date for the appointments cancelled on Friday.']],
  ['Please confirm that you received the letter from the specialist for {Grandpa Sam|@}.', 'I confirm that we received the letter from the specialist for {Grandpa Sam|@}.', 'confirm', ['I confirm that we received the letter from the specialist for {Ken|@}.', 'I confirm that we did not receive the letter from the specialist for {Grandpa Sam|@}.']],
  ['We are pleased to announce that our new scan room will open on May 4.', 'That is good news. We would be glad to send patients to the new scan room from May 4.', 'news', ['That is good news. We would be glad to send patients to the new scan room from May 14.', 'That is bad news. We would be glad to send patients to the new scan room from May 4.']],
  ['Please let me know if you have any questions about the vaccination week.', 'Thank you. I have no questions at the moment about the vaccination week.', 'offer', ['Thank you. I have no questions at the moment about the scan room.', 'Thank you. I have many questions at the moment about the vaccination week.']],
  ['We would like to invite your nurses to a talk about the flu on Wednesday evening.', 'Thank you. I would be happy to send two nurses to the talk about the flu on Wednesday evening.', 'invite', ['Thank you. I would be happy to send two nurses to the talk about the flu on Thursday evening.', 'Thank you. I would be sorry to send two nurses to the talk about the flu on Wednesday evening.']],
  ['The claim for {Nora|@} is now ten days overdue.', 'I am sorry. We will send the claim for {Nora|@} today.', 'reminder', ['I am sorry. We will send the claim for {Ken|@} today.', 'I am glad. We will send the claim for {Nora|@} today.']],
  ['Unfortunately, your appointment must be moved to Thursday.', 'That is no problem. Thursday suits me well.', 'move', ['That is a big problem. Thursday suits me well.', 'That is no problem. Tuesday suits me well.']],
]);

const QA_LETTER3 = bank(3, [
  ['Dear Clinic, I was very pleased with the care that my son received, and I want to thank the nurse who looked after him.', 'We are delighted that you were pleased, and we will pass on your thanks to the nurse.', 'thanks', ['We are disappointed that you were pleased, and we will pass on your thanks to the nurse.', 'We are delighted that you were pleased, and we will pass on your thanks to the doctor.']],
  ['Dear Clinic, the chairs in the waiting room are too low for older people. May I suggest that you buy higher ones?', 'Thank you for the suggestion. We will think about buying higher chairs for older people.', 'suggest', ['Thank you for the suggestion. We will think about buying lower chairs for older people.', 'Thank you for the suggestion. We will not think about the chairs any more.']],
  ['Dear Clinic, I waited for two hours last Friday, and nobody told me why. I think that this is unacceptable.', 'We are sorry that you had to wait for two hours last Friday without an explanation.', 'complaint', ['We are glad that you had to wait for two hours last Friday without an explanation.', 'We are sorry that you had to wait for two days last Friday without an explanation.']],
  ['Dear Clinic, I forgot my insurance card on Monday. I will bring it on Thursday. Please do not charge me twice.', 'Thank you. We will not charge you twice, if you show your card on Thursday.', 'card', ['Thank you. We will charge you twice, if you show your card on Thursday.', 'Thank you. We will not charge you twice, if you show your card on Monday.']],
  ['Dear Clinic, my mother is eighty-five and can not read small print. Could you send her the notice about the vaccination in large print?', 'Of course. We will send her the notice about the vaccination in large print.', 'request', ['Of course. We will send her the notice about the vaccination in small print.', 'Of course. We will send her the notice about the dentist in large print.']],
  ['Dear Clinic, I should like to change doctors. I would prefer to see a woman.', 'We understand. We will make an appointment for you with a woman doctor.', 'prefer', ['We understand. We will make an appointment for you with a man doctor.', 'We understand. We will not make an appointment for you with a woman doctor.']],
]);

const QA_GAP3 = bank(3, [
  ['The nurse ___ gave the injection is very kind.', 'who', 'rel', ['whose', 'whom is']],
  ['The tablets ___ the doctor wrote about are ready.', 'which', 'rel', ['who', 'whose']],
  ['___ the rain, many people came for their injection.', 'Despite', 'link', ['Because', 'Although']],
  ['The clinic was closed ___ the doctor was ill.', 'because', 'link', ['despite', 'due to']],
  ['Two patients ___ waiting in the corridor.', 'are', 'agree', ['is', 'was waiting']],
  ['The results ___ sent to you by post tomorrow.', 'will be', 'passive', ['will', 'are being']],
  ['Neither the doctor ___ the nurse knew about the change.', 'nor', 'pair', ['or', 'and']],
  ['The patient has been here ___ nine o\'clock.', 'since', 'time', ['for', 'during']],
  ['The nurse asked the patient ___ the form.', 'to sign', 'inf', ['signing', 'sign']],
  ['If the pain ___ worse, please call us at once.', 'gets', 'cond', ['will get', 'would get']],
]);

const QA_PROOF3 = bank(3, [
  ['Note: The clinic is open from 8 to 5 on weekdays. It is closed on Sundays. Saturday hours are 9 to 12. Notice: (1) The clinic is open from 8 to 5 on weekdays. (2) It is open on Sundays. (3) Saturday hours are 9 to 12.', '(2) It is open on Sundays.', 'hours', ['(1) The clinic is open from 8 to 5 on weekdays.', '(3) Saturday hours are 9 to 12.']],
  ['Note: Take two tablets after breakfast. Do not drive. Stop after five days. Leaflet: (1) Take two tablets after breakfast. (2) You may drive. (3) Stop after five days.', '(2) You may drive.', 'drug', ['(1) Take two tablets after breakfast.', '(3) Stop after five days.']],
  ['Note: The scan is on Thursday at two. It lasts half an hour. Do not eat for four hours before. Letter: (1) The scan is on Thursday at two. (2) It lasts two hours. (3) Do not eat for four hours before.', '(2) It lasts two hours.', 'scan', ['(1) The scan is on Thursday at two.', '(3) Do not eat for four hours before.']],
  ['Note: The flu vaccination is free for children. It is given on Monday and Tuesday. No appointment is needed. Notice: (1) The flu vaccination is free for children. (2) It is given on Monday and Tuesday. (3) You must book an appointment.', '(3) You must book an appointment.', 'shots', ['(1) The flu vaccination is free for children.', '(2) It is given on Monday and Tuesday.']],
  ['Note: A visit costs 10 coins with the insurance card and 20 without it. Children are free. Notice: (1) A visit costs 10 coins with the insurance card. (2) It costs 20 without it. (3) Children pay 5 coins.', '(3) Children pay 5 coins.', 'fee', ['(1) A visit costs 10 coins with the insurance card.', '(2) It costs 20 without it.']],
  ['Note: The syrup is for children over two. Give 1 spoon three times a day. Keep it in the cold. Label: (1) The syrup is for children over two. (2) Give 11 spoon three times a day. (3) Keep it in the cold.', '(2) Give 11 spoon three times a day.', 'label', ['(1) The syrup is for children over two.', '(3) Keep it in the cold.']],
]);

const B3: Record<string, QaItem[]> = { say3: QA_SAY3, phone3: QA_PHONE3, mail3: QA_MAIL3, letter3: QA_LETTER3, gap3: QA_GAP3, proof3: QA_PROOF3 };

const T3: TaskTemplate[] = [
  { id: 'ct3_sort', rank: 3, arch: 'sort', say: 'The list is long today. Please send each patient or paper to the right desk.', count: [4, 5], bins: ['blood', 'scan', 'pharmacy', 'pay', 'shots', 'urgent', 'records', 'sameday', 'booked', 'insurance'],
    patterns: [
      { text: 'The doctor wants a blood test', bins: ['blood'] }, { text: 'I have come to give a blood sample', bins: ['blood'] }, { text: 'I must not eat before my blood test', bins: ['blood'] }, { text: 'The nurse will take blood from my arm', bins: ['blood'] }, { text: 'I have a paper for the laboratory', bins: ['blood'] },
      { text: 'The doctor wants a picture of my chest', bins: ['scan'] }, { text: 'I need a scan of my knee', bins: ['scan'] }, { text: 'I am here for a scan of my back', bins: ['scan'] }, { text: 'The specialist wants a scan of my head', bins: ['scan'] },
      { text: 'I have the paper for my medicine', bins: ['pharmacy'] }, { text: 'I have a question about my tablets', bins: ['pharmacy'] }, { text: 'My syrup is not ready yet', bins: ['pharmacy'] }, { text: 'I need more ointment for my skin', bins: ['pharmacy'] },
      { text: 'I have come to pay my bill', bins: ['pay'] }, { text: 'I would like a receipt for my visit', bins: ['pay'] }, { text: 'I think that the bill is too high', bins: ['pay'] }, { text: 'How much do I owe for the scan?', bins: ['pay'] },
      { text: 'I have come for my flu injection', bins: ['shots'] }, { text: 'My son needs his vaccination', bins: ['shots'] }, { text: 'I want the flu shot, please', bins: ['shots'] }, { text: 'I need a vaccination before my trip', bins: ['shots'] },
      { text: 'My husband can not breathe well', bins: ['urgent'] }, { text: 'My father has a pain in his chest and feels dizzy', bins: ['urgent'] }, { text: 'My little girl has swallowed something', bins: ['urgent'] }, { text: 'My friend fell and can not wake up', bins: ['urgent'] },
      { text: 'I need a copy of my test results', bins: ['records'] }, { text: 'I would like to see my file', bins: ['records'] }, { text: 'The specialist wants my old records', bins: ['records'] }, { text: 'I am moving, and I need my papers', bins: ['records'] },
      { text: 'My daughter has had a fever since morning', bins: ['sameday'] }, { text: 'My ankle is very red and hurts since this morning', bins: ['sameday'] }, { text: 'I have a bad pain in my ear, and it began today', bins: ['sameday'] }, { text: 'My son has been sick all night', bins: ['sameday'] },
      { text: 'I would like a check-up next month', bins: ['booked'] }, { text: 'I would like a yearly check-up', bins: ['booked'] }, { text: 'I want to see the doctor about my knee, but it is not urgent', bins: ['booked'] }, { text: 'Can I book a visit for next week?', bins: ['booked'] },
      { text: 'The insurer sent a letter about my claim', bins: ['insurance'] }, { text: 'The insurance has asked for another form', bins: ['insurance'] }, { text: 'I need a form for my insurance', bins: ['insurance'] }, { text: 'My insurance card is out of date', bins: ['insurance'] },
    ] },
  { id: 'ct3_dose', rank: 3, arch: 'check', say: 'The pharmacist has made up this prescription. Please check it against my note.', fields: [
    { id: 'name', label: 'Patient', values: ['{Big Joe|@}', '{Grandma Rose|@}', '{Captain Reed|@}', '{Mr. Grant|@}'] },
    { id: 'dose', label: 'Dose', values: ['1 tablet', '2 tablets', '3 tablets', '1 capsule'] },
    { id: 'times', label: 'Times a day', values: ['once', 'twice', 'three times', 'four times'] },
    { id: 'days', label: 'For', values: ['3 days', '5 days', '7 days', '10 days'] },
  ], docs: [{ kind: 'note', title: 'Doctor\'s note', fields: ['name', 'dose', 'times', 'days'] }, { kind: 'order', title: 'Prescription', fields: ['name', 'dose', 'times', 'days'] }], target: 1, pWrong: 0.7 },
  { id: 'ct3_card', rank: 3, arch: 'check', say: 'Please check this insurance card against the form. The insurer will ask.', fields: [
    { id: 'name', label: 'Name', values: ['{Nora|@}', '{Mrs. Hill|@}', '{Big Joe|@}', '{Ken|@}'] },
    { id: 'num', label: 'Number', values: ['71 3508', '71 3580', '60 4417', '60 4471'] },
    { id: 'end', label: 'Valid until', values: ['December 31', 'December 13', 'June 30', 'June 3'] },
  ], docs: [{ kind: 'card', title: 'Insurance card', fields: ['name', 'num', 'end'] }, { kind: 'note', title: 'Form', fields: ['name', 'num', 'end'] }], target: 1, pWrong: 0.7 },
  { id: 'ct3_bill', rank: 3, arch: 'check', say: 'Please check the bill. The treatment list is on top.', fields: [
    { id: 'visit', label: 'Visit', range: [10, 20, 10] },
    { id: 'test', label: 'Blood test', range: [12, 18, 2] },
    { id: 'scan', label: 'Scan', range: [20, 40, 10] },
    { id: 'total', label: 'Total', calc: 'visit + test + scan' },
  ], docs: [{ kind: 'card', title: 'Treatment list', fields: ['visit', 'test', 'scan', 'total'] }, { kind: 'invoice', title: 'Bill', fields: ['visit', 'test', 'scan', 'total'] }], target: 1, pWrong: 0.7 },
  { id: 'ct3_result', rank: 3, arch: 'check', say: 'The blood test results are back. Please check the paper for the patient against the laboratory report.', fields: [
    { id: 'name', label: 'Patient', values: ['{Captain Reed|@}', '{Grandma Rose|@}', '{Mr. Grant|@}', '{Professor Hale|@}'] },
    { id: 'date', label: 'Test on', values: ['March 8', 'March 18', 'April 5', 'April 15'] },
    { id: 'next', label: 'Come back', values: ['in two days', 'in two weeks', 'in two months'] },
  ], docs: [{ kind: 'card', title: 'Laboratory report', fields: ['name', 'date', 'next'] }, { kind: 'letter', title: 'Paper for the patient', fields: ['name', 'date', 'next'] }], target: 1, pWrong: 0.7 },
  { id: 'ct3_shot', rank: 3, arch: 'check', say: 'Please check the vaccination card against the book.', fields: [
    { id: 'name', label: 'Name', values: ['{Tom|@}', '{Lily|@}', '{Grandpa Sam|@}', '{Nora|@}'] },
    { id: 'shot', label: 'Vaccine', values: ['flu', 'measles', 'tetanus', 'whooping cough'] },
    { id: 'date', label: 'Date', values: ['October 12', 'October 21', 'November 3', 'November 30'] },
  ], docs: [{ kind: 'note', title: 'Vaccination book', fields: ['name', 'shot', 'date'] }, { kind: 'card', title: 'Vaccination card', fields: ['name', 'shot', 'date'] }], target: 1, pWrong: 0.7 },
  { id: 'ct3_child', rank: 3, arch: 'check', say: 'Please check the child\'s age and weight on the form against the file.', fields: [
    { id: 'name', label: 'Name', values: ['{Tom|@}', '{Lily|@}'] },
    { id: 'age', label: 'Age', range: [4, 11] },
    { id: 'kg', label: 'Weight', range: [16, 36, 2], fmt: '{n} kilos' },
  ], docs: [{ kind: 'note', title: 'Child\'s file', fields: ['name', 'age', 'kg'] }, { kind: 'card', title: 'Form', fields: ['name', 'age', 'kg'] }], target: 1, pWrong: 0.7 },
  { id: 'ct3_claim', rank: 3, arch: 'check', say: 'The insurer asks for a copy of the receipt. Please check my claim form against it.', fields: [
    { id: 'what', label: 'For', values: ['a blood test', 'a scan', 'a visit', 'an injection'] },
    { id: 'sum', label: 'Paid', values: ['14 coins', '41 coins', '24 coins', '42 coins', '30 coins', '13 coins'] },
    { id: 'date', label: 'Date', values: ['May 6', 'May 16', 'June 2', 'June 12'] },
  ], docs: [{ kind: 'card', title: 'Receipt', fields: ['what', 'sum', 'date'] }, { kind: 'note', title: 'Claim form', fields: ['what', 'sum', 'date'] }], target: 1, pWrong: 0.7 },
  { id: 'ct3_pad', rank: 3, arch: 'respond', mode: 'form', kind: 'phone', features: ['audioOnly'], say: 'Someone is calling. Please write down what is said.',
    lines: ['Good morning. This is {who}.', 'The {what} for {patient} will take place on {day}.', 'Please tell the patient not to eat for {hours} before.'],
    fields: [
      { id: 'who', label: 'Caller', values: ['{Nurse Ito|@}', '{Dr. Moreau|@}', '{Dr. Patel|@}'] },
      { id: 'what', label: 'For', values: ['scan', 'blood test', 'check-up'] },
      { id: 'patient', label: 'Patient', values: ['{Mrs. Hill|@}', '{Grandpa Sam|@}', '{Ken|@}', '{Mr. Grant|@}'] },
      { id: 'day', label: 'On', values: ['Tuesday at nine', 'Thursday at two', 'Friday at ten'] },
      { id: 'hours', label: 'No food for', values: ['two hours', 'four hours', 'six hours'] },
    ] },
  { id: 'ct3_book', rank: 3, arch: 'respond', mode: 'slot', kind: 'memo', say: 'Please look at the book. When can the patient come?', layout: 'calendar', rows: DAYS5, cols: TIMES4, cellTags: { t9: ['morning'], t11: ['morning'], t1: ['afternoon'], t3: ['afternoon'] },
    want: [
      { tag: 'mon', text: 'The patient can come on Monday.' }, { tag: 'tue', text: 'The patient can come on Tuesday.' }, { tag: 'wed', text: 'The patient can come on Wednesday.' }, { tag: 'thu', text: 'The patient prefers Thursday.' }, { tag: 'fri', text: 'The patient can come on Friday.' },
      { tag: 'morning', text: 'The patient needs the morning, because of the blood test.' }, { tag: 'afternoon', text: 'The patient works in the morning, so the afternoon is better.' }, { tag: 't9', text: 'The patient needs the first appointment of the day.' },
    ],
    avoid: [{ tag: 'mon', text: 'Please do not use Monday, because the lift is being repaired.' }, { tag: 'wed', text: 'The scan room is closed on Wednesday.' }, { tag: 't11', text: 'The patient is busy at eleven.' }, { tag: 't3', text: 'Three is too late for the patient.' }],
    busy: ['Busy', 'Full', 'Busy', 'Full'], open: ['Dear {Ms. Vega|@},'], close: ['Thank you.'] },
  { id: 'ct3_say', rank: 3, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'say3' },
  { id: 'ct3_phone', rank: 3, arch: 'respond', mode: 'choose', kind: 'phone', bank: 'phone3', features: ['audioOnly'] },
  { id: 'ct3_mail', rank: 3, arch: 'respond', mode: 'choose', kind: 'email', bank: 'mail3' },
  { id: 'ct3_letter', rank: 3, arch: 'respond', mode: 'choose', kind: 'letter', bank: 'letter3' },
  { id: 'ct3_gap', rank: 3, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'gap3' },
  { id: 'ct3_proof', rank: 3, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'proof3' },
];

// ---------------------------------------------------------------------------------------------- rank 4 (英検準1級, TOEIC 〜860)
// Chronic patients and their repeat prescriptions, referrals to specialists, consent and confidentiality, the insurer's
// conditions, the ear, nose and throat desk, women's health, mental health, older patients. Reception reads exactly what
// is written; it never advises.

const R4A: AuthoredTask[] = [
  check('c4_repeat', 4, 1, 'p_patel', 'The repeat prescription for {Mr. Grant|@} is ready. Please check it against his file before it goes to the pharmacy.', [
    note('His file', ['{Mr. Grant|@} takes one tablet every morning for his blood pressure. The prescription runs for three months, with no changes.']),
    paper('order', 'Repeat prescription', [['who', 'Patient', '{Mr. Grant|@}'], ['dose', 'Dose', 'one tablet every morning'], ['long', 'Runs for', 'six months']]),
  ], 'long', { fix: ['three months', ['one month', 'three months', 'six months']] }),
  msg('c4_consent', 4, 2, 'p_vega', 'memo', { say: 'My son is fifteen. May I sign the consent form for him?' }, ['CONSENT', 'A parent must sign for every child under sixteen.', 'Patients of sixteen or over can sign alone.'],
    'Yes. He is under sixteen, so a parent must sign.', ['No. He is under sixteen, so he must sign alone.', 'Yes. He is over sixteen, so a parent must sign.']),
  sort('c4_sort1', 4, 3, 'p_vega', 'The morning list is long. Please send each patient to the desk that fits.', ['ear', 'older', 'general'], [
    ['I can not hear well when there is noise', 'ear'], ['My mother is ninety and needs help to walk', 'older'], ['I have a bad cough', 'general'], ['I have a sore throat and a blocked nose', 'ear'],
  ]),
  msg('c4_referral', 4, 4, 'p_vega', 'letter', { from: '{Dr. Patel|@}' }, ['To {Ms. Vega|@},', 'Please make an appointment for {Grandpa Sam|@} with the heart specialist at the hospital.', 'The referral is urgent, and he should be seen within two weeks.', '{Dr. Patel|@}'],
    'The patient must be seen by the heart specialist within two weeks.', ['The patient must be seen by the heart specialist within two months.', 'The patient must be seen by the dentist within two weeks.'], { say: 'What does the doctor want us to do?' }),
  pad('c4_phone1', 4, 5, 'p_vega', ['Good morning. This is {Mr. Costa|@} at the pharmacy.', 'The prescription for {Big Joe|@} contains a drug that he is allergic to.', 'Please ask the doctor to change it before he collects it.'], [
    ['who', 'Caller', '{Mr. Costa|@}', ['{Ms. Lund|@}', '{Nurse Ito|@}']],
    ['patient', 'Prescription for', '{Big Joe|@}', ['{Mr. Grant|@}', '{Ken|@}']],
    ['problem', 'Problem', 'he is allergic to a drug in it', ['the dose is too small', 'it is not signed']],
    ['ask', 'Please ask', 'the doctor to change it', ['him to collect it', 'the nurse to sign it']],
  ], { features: ['audioOnly'], say: 'The pharmacy is on the line. Please write down every detail.' }),
  check('c4_claim', 4, 6, 'p_lund', 'The insurer has asked about a claim. Please check our claim form against the treatment record.', [
    paper('card', 'Treatment record', [['who', 'Patient', '{Mrs. Hill|@}'], ['what', 'Treatment', 'a scan of the knee'], ['date', 'Date', 'June 4'], ['sum', 'Cost', '60 coins']]),
    paper('note', 'Claim form', [['who', 'Patient', '{Mrs. Hill|@}'], ['what', 'Treatment', 'a scan of the knee'], ['date', 'Date', 'June 14'], ['sum', 'Cost', '60 coins']]),
  ], 'date', { fix: ['June 4', ['June 4', 'June 14', 'July 4']] }),
  msg('c4_cover', 4, 7, 'c_scholar', 'memo', { say: 'I have to pay part of the cost myself, I think. How much is it for the scan?' }, ['YOUR COVER', 'The insurance pays 80% of the cost of a scan.', 'You pay the other 20%. A scan costs 60 coins.'],
    'You pay 12 coins, which is 20% of the 60 coins.', ['You pay 48 coins, which is 80% of the 60 coins.', 'You pay 12 coins, which is 80% of the 60 coins.']),
  slot('c4_book1', 4, 8, 'p_vega', 'memo', ['{Grandma Rose|@} needs her yearly check-up with a woman doctor, and a long appointment.', '{Dr. Moreau|@} does long appointments only on Tuesday and Friday afternoons, and she can not come on Friday.'], DAYS5, TIMES4, ['afternoon'], ['mon', 'wed', 'thu', 'fri'], 'tue-t1', ['Busy', 'Full', 'Busy', 'Full'],
    { say: 'Please look at the book. When can she come?', extraBusy: ['tue-t3', 'fri-t1'] }),
  check('c4_ok1', 4, 9, 'p_patel', 'Does the label on this antibiotic agree with my note?', [
    paper('note', 'Doctor\'s note', [['what', 'Medicine', 'an antibiotic'], ['dose', 'Dose', 'one capsule'], ['times', 'Times a day', 'three'], ['days', 'For', '7 days']]),
    paper('label', 'Label', [['what', 'Medicine', 'an antibiotic'], ['dose', 'Dose', 'one capsule'], ['times', 'Times a day', 'three'], ['days', 'For', '7 days']]),
  ], null),
  msg('c4_privacy', 4, 10, 'c_merchant', 'speech', { say: 'I am her employer. Could you tell me what is wrong with my assistant? She did not come to work.' }, ['I am her employer. Could you tell me what is wrong with my assistant? She did not come to work.'],
    'I am sorry, but we can not give you any information about a patient without her permission.', ['I am sorry, but we can give you information about a patient, because you are her employer.', 'I am sorry, but we can not give you any information about a patient without your permission.']),
  msg('c4_letter', 4, 11, 'p_vega', 'letter', { from: '{Professor Hale|@}' }, ['Dear {Ms. Vega|@},', 'I have been your patient for twenty years, and I have never had to wait for more than thirty minutes.', 'On Tuesday I waited for two hours, and no one said why.', 'Yours,', '{Professor Hale|@}'],
    'He is complaining about a long wait on Tuesday, which nobody explained.', ['He is thanking the clinic for a short wait on Tuesday.', 'He is complaining about a long wait on Tuesday, which was explained at once.']),
  sort('c4_sort2', 4, 12, 'p_vega', 'More patients, and some papers. Please think about what each one really needs.', ['records', 'referral', 'insurance', 'pay'], [
    ['I need my old records for the specialist', 'records'], ['The specialist will see me, but I need the letter first', 'referral'], ['The insurer has refused my claim', 'insurance'], ['I would like to pay my share of the cost', 'pay'],
  ]),
  check('c4_quote', 4, 13, 'p_lund', 'The patient asked for a written estimate. Please check it against the price list.', [
    paper('card', 'Price list', [['op', 'Small operation', '300 coins'], ['stay', 'One night in the clinic', '80 coins'], ['tot', 'Total', '380 coins']]),
    paper('letter', 'Estimate', [['op', 'Small operation', '300 coins'], ['stay', 'One night in the clinic', '80 coins'], ['tot', 'Total', '480 coins']]),
  ], 'tot', { fix: ['380 coins', ['280 coins', '380 coins', '480 coins']] }),
  msg('c4_policy', 4, 14, 'c_oldman', 'memo', { say: 'I forgot to cancel my appointment, and now I have a bill. Must I really pay?' }, ['MISSED APPOINTMENTS', 'You must pay 10 coins if you miss an appointment without telling us.', 'We will not charge patients who are over seventy-five, or who were in hospital that day.'],
    'No. You are over seventy-five, so you do not have to pay.', ['Yes. You must pay 10 coins, although you are over seventy-five.', 'No. You do not have to pay, because you are under seventy-five.']),
  pad('c4_phone2', 4, 15, 'p_vega', ['Hello. This is {Anna|@}.', 'My son {Tom|@} has been given an antibiotic, and he has a rash and is vomiting.', 'I am afraid that he may be allergic. Please ask the doctor to call me before noon.'], [
    ['who', 'Caller', '{Anna|@}', ['{Nora|@}', '{Mrs. Hill|@}']],
    ['patient', 'Patient', '{Tom|@}', ['{Ken|@}', '{Lily|@}']],
    ['worry', 'She fears', 'an allergy to the antibiotic', ['an infection', 'a broken arm']],
    ['call', 'Doctor to call', 'before noon', ['after noon', 'before ten']],
  ], { features: ['audioOnly'], say: '{Anna|@} is calling. Please write the message.' }),
  msg('c4_contradict1', 4, 16, 'p_patel', 'memo', { say: 'Which sentence of this leaflet is not supported by my notes?' }, [
    'Notes: Take the tablet with food. Avoid alcohol. It may make you drowsy. Do not stop suddenly.',
    'Leaflet: (1) Take the tablet with food. (2) You may drink alcohol in small amounts. (3) It may make you drowsy.',
  ], '(2) You may drink alcohol in small amounts.', ['(1) Take the tablet with food.', '(3) It may make you drowsy.']),
  check('c4_age', 4, 17, 'p_ito', 'The child\'s consent form must agree with the register. Please check it.', [
    paper('note', 'Register', [['child', 'Child', '{Lily|@}'], ['born', 'Date of birth', 'May 3'], ['parent', 'Parent', '{Anna|@}']]),
    paper('card', 'Consent form', [['child', 'Child', '{Lily|@}'], ['born', 'Date of birth', 'May 13'], ['parent', 'Parent', '{Anna|@}']]),
  ], 'born', { fix: ['May 3', ['March 5', 'May 3', 'May 13']] }),
  msg('c4_complaint', 4, 18, 'p_vega', 'email', { from: '{Mr. Okoye|@}', subject: 'Our staff check-ups' }, ['Dear {Ms. Vega|@},', 'Our staff were told that check-ups cost less if fifteen people come.', 'Only twelve will come, so I would like to know whether the lower price still applies.', 'Regards,', '{Mr. Okoye|@}'],
    'He asks whether the lower price applies, although only twelve people will come.', ['He asks whether the lower price applies, because fifteen people will come.', 'He asks whether the price goes up, although only twelve people will come.'], { say: 'What does {Mr. Okoye|@} want to know?' }),
  sort('c4_sort3', 4, 19, 'p_vega', 'The clinic is full today. Please read each one well.', ['ear', 'women', 'mind', 'older'], [
    ['My ears have been ringing for days', 'ear'], ['My baby is due in the autumn', 'women'], ['I have felt very sad for months', 'mind'], ['My grandfather has fallen twice this week', 'older'],
  ]),
  check('c4_dose2', 4, 20, 'p_costa', 'Please check the dose for the elderly patient. She must have half the normal dose.', [
    paper('note', 'Doctor\'s note', [['who', 'Patient', '{Grandma Rose|@}'], ['dose', 'Dose', 'half a tablet'], ['times', 'Times a day', 'twice']]),
    paper('label', 'Label', [['who', 'Patient', '{Grandma Rose|@}'], ['dose', 'Dose', 'one tablet'], ['times', 'Times a day', 'twice']]),
  ], 'dose', { fix: ['half a tablet', ['half a tablet', 'one tablet', 'two tablets']] }),
  msg('c4_say1', 4, 21, 'c_cook', 'speech', { say: 'Can the clinic give me a letter for my work, saying that I was sick on Monday and Tuesday?' }, ['Can the clinic give me a letter for my work, saying that I was sick on Monday and Tuesday?'],
    'The doctor can write you a letter for Monday and Tuesday, if she sees you today.', ['The doctor can write you a letter for Friday and Saturday, if she sees you today.', 'The doctor can write you a letter for Monday and Tuesday, if she sees you last week.']),
  check('c4_slot', 4, 22, 'p_lund', 'Please check that the appointment letter agrees with the specialist\'s clinic.', [
    paper('note', 'Specialist\'s clinic', [['who', 'Doctor', '{Dr. Patel|@}'], ['day', 'Day', 'Wednesday'], ['place', 'Where', 'the hospital, room 4']]),
    paper('letter', 'Appointment letter', [['who', 'Doctor', '{Dr. Patel|@}'], ['day', 'Day', 'Wednesday'], ['place', 'Where', 'the hospital, room 14']]),
  ], 'place', { fix: ['the hospital, room 4', ['the hospital, room 4', 'the hospital, room 14', 'the clinic, room 4']] }),
];

const R4B: AuthoredTask[] = [
  msg('c4_gap1', 4, 23, 'p_patel', 'memo', { say: 'Which word completes the sentence?' }, ['The clinic can not give a certificate, ___ the doctor has seen the patient.'],
    'unless', ['although', 'whereas']),
  check('c4_result', 4, 24, 'p_patel', 'The specialist has sent the results. Please check the summary for the patient against the report.', [
    paper('card', 'Report', [['who', 'Patient', '{Captain Reed|@}'], ['test', 'Test', 'an eye scan'], ['result', 'Result', 'no change since last year'], ['next', 'Next visit', 'in twelve months']]),
    paper('letter', 'Summary for the patient', [['who', 'Patient', '{Captain Reed|@}'], ['test', 'Test', 'an eye scan'], ['result', 'Result', 'no change since last year'], ['next', 'Next visit', 'in six months']]),
  ], 'next', { fix: ['in twelve months', ['in two months', 'in six months', 'in twelve months']] }),
  msg('c4_reader', 4, 25, 'p_vega', 'letter', { from: '{Grandma Rose|@}' }, ['Dear {Ms. Vega|@},', 'I am writing to protest against the plan to close the clinic on Saturdays.', 'Many of us can not come from Monday to Friday, and the hospital is not near for older people.', 'Please think again.', 'Yours,', '{Grandma Rose|@}'],
    'She is against the plan to close on Saturdays, because many people can only come then.', ['She is for the plan to close on Saturdays, because many people can only come then.', 'She is against the plan to close on Sundays, because many people can only come then.']),
  sort('c4_sort4', 4, 26, 'p_vega', 'Please sort the papers by what they are about.', ['insurance', 'records', 'referral', 'pharmacy'], [
    ['A letter in which the insurer asks a new question', 'insurance'], ['A letter from the hospital about a patient\'s old records', 'records'], ['A letter from the specialist who will see {Ken|@} next week', 'referral'], ['A list of the drugs that we need more of', 'pharmacy'],
  ]),
  pad('c4_phone3', 4, 27, 'p_vega', ['Good afternoon. This is {Ms. Lund|@} at the insurance office.', 'Your claim for {Mrs. Hill|@} has been approved, but only 70% of the cost will be paid.', 'The patient will receive a letter by Friday.'], [
    ['who', 'Caller', '{Ms. Lund|@}', ['{Ms. Vega|@}', '{Mr. Costa|@}']],
    ['patient', 'Claim for', '{Mrs. Hill|@}', ['{Nora|@}', '{Ken|@}']],
    ['share', 'Will be paid', '70% of the cost', ['100% of the cost', '17% of the cost']],
    ['when', 'Letter by', 'Friday', ['Monday', 'Thursday']],
  ], { features: ['audioOnly'], say: 'The insurance office is calling. Please write down every detail.' }),
  check('c4_ok2', 4, 28, 'p_ito', 'Please check this vaccination record against the book. I think it agrees.', [
    paper('note', 'Vaccination book', [['who', 'Patient', '{Lily|@}'], ['shot', 'Vaccine', 'flu for children'], ['date', 'Date', 'October 9'], ['next', 'Second dose', 'November 9']]),
    paper('card', 'Vaccination record', [['who', 'Patient', '{Lily|@}'], ['shot', 'Vaccine', 'flu for children'], ['date', 'Date', 'October 9'], ['next', 'Second dose', 'November 9']]),
  ], null),
  msg('c4_condition', 4, 29, 'p_vega', 'email', { from: '{Ms. Lund|@}', subject: 'The insurer\'s conditions' }, ['Dear {Ms. Vega|@},', 'The insurer will pay for physical treatment, provided that the doctor writes a letter first and the patient has no more than ten sessions a year.', 'If either condition is not met, the patient must pay the full cost.', 'Regards,', '{Ms. Lund|@}'],
    'The insurer pays only if there is a letter from the doctor and no more than ten sessions a year.', ['The insurer pays even if there is no letter from the doctor, up to ten sessions a year.', 'The insurer pays only if there is a letter from the doctor and at least ten sessions a year.'], { say: 'What are the insurer\'s conditions?' }),
  check('c4_calc', 4, 30, 'p_lund', 'The patient pays 20% of the cost. Please check the amount on the bill.', [
    paper('card', 'Treatment record', [['cost', 'Cost of treatment', '150 coins'], ['share', 'Patient pays (20%)', '30 coins']]),
    paper('invoice', 'Bill', [['cost', 'Cost of treatment', '150 coins'], ['share', 'Patient pays (20%)', '120 coins']]),
  ], 'share', { fix: ['30 coins', ['15 coins', '30 coins', '120 coins']] }),
  msg('c4_contradict2', 4, 31, 'p_patel', 'memo', { say: 'One sentence of this notice goes beyond what my notes say. Which one?' }, [
    'Notes: There has been a small outbreak of flu at the school. Eight children are ill. The school will stay open. Parents will be told if that changes.',
    'Notice: (1) There has been a small outbreak of flu at the school. (2) The school will close on Friday. (3) Eight children are ill.',
  ], '(2) The school will close on Friday.', ['(1) There has been a small outbreak of flu at the school.', '(3) Eight children are ill.']),
  msg('c4_say2', 4, 32, 'c_student', 'speech', { say: 'I have to do a project on health care. Could I speak to one of your nurses for fifteen minutes on Thursday afternoon?' }, ['I have to do a project on health care. Could I speak to one of your nurses for fifteen minutes on Thursday afternoon?'],
    'Of course. {Nurse Ito|@} will be free for fifteen minutes on Thursday afternoon.', ['Of course. {Nurse Ito|@} will be free for fifteen minutes on Thursday morning.', 'Of course. {Nurse Ito|@} will not be free for fifteen minutes on Thursday afternoon.']),
  slot('c4_book2', 4, 33, 'p_vega', 'memo', ['{Mr. Grant|@} needs a blood test and a talk with the doctor afterwards, so he needs the earliest time.', 'The laboratory is closed on Friday, and the doctor is away on Monday.'], DAYS5, TIMES4, ['t9'], ['mon', 'fri'], 'tue-t9', ['Busy', 'Full', 'Busy', 'Full'],
    { say: 'Please look at the book. When can he come?', extraBusy: ['wed-t9', 'thu-t9'] }),
  check('c4_dates', 4, 34, 'p_ito', 'Please check the dates of the course of treatment against the doctor\'s plan.', [
    paper('note', 'Doctor\'s plan', [['start', 'Starts', 'March 4'], ['review', 'Review visit', 'March 18'], ['end', 'Ends', 'April 1']]),
    paper('letter', 'Letter to the patient', [['start', 'Starts', 'March 4'], ['review', 'Review visit', 'March 28'], ['end', 'Ends', 'April 1']]),
  ], 'review', { fix: ['March 18', ['March 8', 'March 18', 'March 28']] }),
  msg('c4_complaint2', 4, 35, 'p_vega', 'email', { from: '{Ms. Hart|@}', subject: 'Letter to my father' }, ['Dear Clinic,', 'A letter about my father\'s test results was opened by my neighbour, because it was sent to the wrong address.', 'I would like to know how this happened and what you will do about it.', 'Regards,', '{Ms. Hart|@}'],
    'She asks how the letter was sent to the wrong address and what the clinic will do.', ['She thanks the clinic for sending the letter to her address.', 'She asks how the letter was sent to the right address and what her neighbour will do.'], { say: 'What does {Ms. Hart|@} ask?' }),
  sort('c4_sort5', 4, 36, 'p_vega', 'Please sort these last ones. Think about who must deal with each one.', ['mind', 'ear', 'older', 'women'], [
    ['I feel afraid all the time', 'mind'], ['I can not hear well when there is noise', 'ear'], ['My aunt is eighty-eight and can not walk well', 'older'], ['I would like to talk about my baby due in May', 'women'],
  ]),
  check('c4_name', 4, 37, 'p_lund', 'The insurer has noticed a difference between the card and the claim. Please check them.', [
    paper('card', 'Insurance card', [['name', 'Name', '{Professor Hale|@}'], ['num', 'Number', '28 9946'], ['end', 'Valid until', 'March 31']]),
    paper('note', 'Claim form', [['name', 'Name', '{Professor Hale|@}'], ['num', 'Number', '28 9496'], ['end', 'Valid until', 'March 31']]),
  ], 'num', { fix: ['28 9946', ['28 9496', '28 9946', '82 9946']] }),
  msg('c4_gap2', 4, 38, 'p_patel', 'memo', { say: 'Which word completes the sentence correctly?' }, ['Patients are advised ___ their medicine with food.'],
    'to take', ['taking', 'take']),
  msg('c4_say3', 4, 39, 'c_sailor', 'phone', { say: 'Good morning. This is {Captain Reed|@}. The doctor told me to come back in two weeks, but I will be at sea. Can I come before I sail on Friday?' }, ['Good morning. This is {Captain Reed|@}. The doctor told me to come back in two weeks, but I will be at sea. Can I come before I sail on Friday?'],
    'Of course, {Captain Reed|@}. I will look for an appointment before Friday.', ['Of course, {Captain Reed|@}. I will look for an appointment after Friday.', 'Of course, {Big Joe|@}. I will look for an appointment before Friday.']),
  check('c4_stay', 4, 40, 'p_lund', 'The patient stayed one night. Please check the number of nights and the total.', [
    paper('card', 'Ward record', [['nights', 'Nights', '1'], ['rate', 'Price a night', '80 coins'], ['total', 'Total', '80 coins']]),
    paper('invoice', 'Bill', [['nights', 'Nights', '2'], ['rate', 'Price a night', '80 coins'], ['total', 'Total', '80 coins']]),
  ], 'nights', { fix: ['1', ['1', '2', '3']] }),
  msg('c4_policy2', 4, 41, 'c_mom', 'memo', { say: 'My daughter has a fever, and she was sick this morning. May she go to school tomorrow?' }, ['SCHOOL AND ILLNESS', 'Children with a fever or who have been sick should stay at home for 48 hours after the last symptom.', 'Please ask the doctor if you are unsure.'],
    'The notice says that she should stay at home for 48 hours after the last symptom.', ['The notice says that she should go to school tomorrow, if the fever is gone.', 'The notice says that she should stay at home for 48 minutes after the last symptom.']),
  pad('c4_phone4', 4, 42, 'p_vega', ['Hello. This is the school. {Mrs. Hill|@} speaking.', 'We have five children with a high fever and a rash, and we would like a nurse to come at ten.', 'Please tell the doctor that the head teacher will meet the nurse at the gate.'], [
    ['who', 'Caller', '{Mrs. Hill|@}', ['{Ms. Hart|@}', '{Anna|@}']],
    ['children', 'Children ill', 'five', ['two', 'fifteen']],
    ['when', 'Nurse to come at', 'ten', ['nine', 'twelve']],
    ['meet', 'Head teacher at', 'the gate', ['the office', 'the hall']],
  ], { features: ['audioOnly'], say: 'It is the school on the line. Please write down every detail.' }),
  msg('c4_hale', 4, 43, 'p_vega', 'letter', { from: '{Mr. Grant|@}' }, ['Dear {Ms. Vega|@},', 'I was surprised to see that the bill for my visit was 40 coins, not the 10 coins that you quoted on the phone.', 'I would be grateful if you would explain the difference.', 'Yours,', '{Mr. Grant|@}'],
    'He asks why the bill is 40 coins and not 10 coins.', ['He asks why the bill is 10 coins and not 40 coins.', 'He thanks the clinic for a bill of 40 coins.']),
  check('c4_ok3', 4, 44, 'p_lund', 'Please check this estimate against the price list. I think it agrees.', [
    paper('card', 'Price list', [['visit', 'Visit', '20 coins'], ['test', 'Blood test', '30 coins'], ['total', 'Total', '50 coins']]),
    paper('letter', 'Estimate', [['visit', 'Visit', '20 coins'], ['test', 'Blood test', '30 coins'], ['total', 'Total', '50 coins']]),
  ], null),
  sort('c4_sort6', 4, 45, 'p_vega', 'The last tray of the day. Please be careful.', ['referral', 'records', 'pay', 'insurance'], [
    ['A letter that sends a patient to the hospital for tests', 'referral'], ['A request to send a patient\'s file to another doctor', 'records'], ['A patient who wants to pay in parts', 'pay'], ['A form for a claim after an accident', 'insurance'],
  ]),
];
const R4 = [...R4A, ...R4B];

// ---------------------------------------------------------------------------------------------- rank 4 templates and banks

const QA_SAY4 = bank(4, [
  ['I was hoping that you could change my appointment from Tuesday at ten to Thursday at two.', 'Certainly. I will move your appointment from Tuesday at ten to Thursday at two.', 'change', ['Certainly. I will move your appointment from Tuesday at ten to Thursday at ten.', 'Certainly. I will move your appointment from Thursday at two to Tuesday at ten.']],
  ['Would it be possible to speak to the doctor about my results before my next visit?', 'Of course. I will ask the doctor to call you about your results before your next visit.', 'results', ['Of course. I will ask the doctor to call you about your results after your next visit.', 'Of course. I will ask the nurse to call you about your insurance before your next visit.']],
  ['I understand that the clinic can not give out information about me without my consent.', 'That is correct. We need your written consent before we give any information about you.', 'privacy', ['That is correct. We give information about you without your consent.', 'That is incorrect. We need your written consent before we give any information about you.']],
  ['We would like to book a group of ten patients for flu vaccinations on Friday at nine.', 'Thank you. I will book ten patients for flu vaccinations on Friday at nine.', 'group', ['Thank you. I will book ten patients for flu vaccinations on Friday at eleven.', 'Thank you. I will book twelve patients for flu vaccinations on Friday at nine.']],
  ['Are you certain that the doctor has received my letter? I sent it on the third.', 'I will check whether the doctor has received your letter, which you sent on the third.', 'check', ['I am certain that the doctor has received your letter, which you sent on the thirteenth.', 'I will check whether the doctor has received your letter, which you sent on the fourth.']],
  ['Could you tell me whether the clinic accepts patients who do not have insurance?', 'Yes, the clinic accepts patients without insurance, but they must pay the full cost.', 'insurance', ['No, the clinic accepts patients without insurance, but they must pay the full cost.', 'Yes, the clinic accepts patients without insurance, and they pay nothing.']],
  ['My mother takes several drugs. Should I bring them with me to the appointment?', 'The nurse asks all patients to bring the drugs that they take, so please bring your mother\'s drugs.', 'drugs', ['The nurse asks all patients to leave the drugs that they take at home, so please do not bring them.', 'The nurse asks all patients to bring the drugs that they take, so please bring your father\'s drugs.']],
  ['Why was my appointment cancelled without a call?', 'I am sorry. The doctor was called away, and we should have called you at once.', 'reason', ['I am sorry. The doctor was called away, and we did call you at once.', 'I am glad. The doctor was called away, and we should have called you at once.']],
]);

const QA_PHONE4 = bank(4, [
  ['Good morning. I am calling on behalf of my father, who is ninety. He can not come to the clinic, so could the doctor visit him on Friday?', 'I will ask the doctor whether she can visit your father on Friday.', 'visit', ['I will ask the doctor whether she can visit your father on Monday.', 'I will ask the doctor whether she can visit your mother on Friday.']],
  ['I would like to make an appointment for a woman doctor, if possible, within the next week.', 'Certainly. I will look for an appointment with a woman doctor within the next week.', 'book', ['Certainly. I will look for an appointment with a man doctor within the next week.', 'Certainly. I will look for an appointment with a woman doctor within the next month.']],
  ['This is the hospital. The results for {Mrs. Hill|@} will be sent to you by Thursday.', 'Thank you. We will expect the results for {Mrs. Hill|@} by Thursday.', 'results', ['Thank you. We will expect the results for {Ken|@} by Thursday.', 'Thank you. We will expect the results for {Mrs. Hill|@} by Tuesday.']],
  ['I am calling to ask whether the vaccination is safe for someone who is allergic to eggs.', 'I can not advise you, but I will ask the nurse to call you about the vaccination and your allergy to eggs.', 'advice', ['I can advise you that the vaccination is safe for someone who is allergic to eggs.', 'I can not advise you, but I will ask the nurse to call you about the vaccination and your allergy to milk.']],
  ['I would like to cancel my appointment on Wednesday, and I would like to book a new one for the week after.', 'Of course. I have cancelled your appointment on Wednesday and will look for one the week after.', 'cancel', ['Of course. I have cancelled your appointment on Friday and will look for one the week after.', 'Of course. I have kept your appointment on Wednesday and will look for one the week after.']],
  ['The ambulance has just left with {Grandpa Sam|@}. He is going to the hospital.', 'Thank you. We will tell the doctor that {Grandpa Sam|@} is on his way to the hospital.', 'urgent', ['Thank you. We will tell the doctor that {Grandpa Sam|@} is on his way home.', 'Thank you. We will tell the doctor that {Ken|@} is on his way to the hospital.']],
  ['I am the pharmacist. We can not read the dose on the prescription for {Tom|@}.', 'Thank you for telling us. We will ask the doctor to confirm the dose on the prescription for {Tom|@}.', 'dose', ['Thank you for telling us. We will ask the pharmacist to confirm the dose on the prescription for {Tom|@}.', 'Thank you for telling us. We will ask the doctor to confirm the dose on the prescription for {Ken|@}.']],
  ['Can you confirm that the clinic will be closed on the holiday Monday?', 'I can confirm that the clinic will be closed on the holiday Monday, and it will open again on Tuesday.', 'holiday', ['I can confirm that the clinic will be open on the holiday Monday, and it will close again on Tuesday.', 'I can confirm that the clinic will be closed on the holiday Monday, and it will open again on Thursday.']],
]);

const QA_MAIL4 = bank(4, [
  ['Dear {Ms. Vega|@}, we regret to inform you that the specialist has postponed your patient\'s appointment until further notice.', 'Thank you for letting us know. Please tell us as soon as the specialist has a new date for the appointment.', 'postpone', ['Thank you for letting us know. We will keep the appointment on the date agreed.', 'Thank you for letting us know. Please tell us as soon as the specialist has cancelled the appointment.']],
  ['Dear {Ms. Vega|@}, I would be grateful if you could send me a copy of my records, in full.', 'Thank you. We will check what we can send, and we need your signed consent for a copy of your records.', 'records', ['Thank you. We will send a copy of your records without your signed consent.', 'Thank you. We will check what we can send, and we need your signed consent for a copy of your bill.']],
  ['Dear Clinic, the bill says 60 coins for a scan, but the price list says 40.', 'We apologize. We will check the bill and correct the price of the scan to 40 coins, if the list is right.', 'bill', ['We apologize. We will check the bill and correct the price of the scan to 60 coins, if the list is right.', 'We are pleased. We will check the bill and correct the price of the scan to 40 coins, if the list is right.']],
  ['Dear {Ms. Vega|@}, the appointment that you wrote for Thursday should be for Friday, because I work on Thursdays.', 'Thank you for pointing it out. We will move your appointment from Thursday to Friday.', 'date', ['Thank you for pointing it out. We will move your appointment from Friday to Thursday.', 'Thank you for pointing it out. We will move your appointment from Thursday to Monday.']],
  ['Dear Clinic, I would like to register my family of four as patients. What do we need to bring?', 'Thank you. Please bring your insurance cards and one form of identity for each of the four members of your family.', 'register', ['Thank you. Please bring only one insurance card for the four members of your family.', 'Thank you. Please bring your insurance cards and one form of identity for each of the five members of your family.']],
  ['Dear {Ms. Vega|@}, we are happy to confirm your place at the conference on patient records, which begins at nine on Thursday.', 'Thank you for confirming. We will make sure that our nurse arrives before nine on Thursday.', 'confirm', ['Thank you for confirming. We will make sure that our nurse arrives after nine on Thursday.', 'Thank you for confirming. We will make sure that our nurse arrives before nine on Tuesday.']],
]);

const QA_LETTER4 = bank(4, [
  ['Dear Clinic, I was disappointed that nobody told me that my test results would take two weeks. I had expected them by Friday.', 'Thank you for your letter. You are right that nobody told you that your test results would take two weeks.', 'reply', ['Thank you for your letter. You are wrong that nobody told you that your test results would take two weeks.', 'Thank you for your letter. You are right that nobody told you that your test results would take two days.']],
  ['Dear Clinic, may I draw your attention to a mistake? You have written my name wrongly on every letter, and I would like it corrected.', 'Thank you for drawing our attention to the mistake. We will correct the spelling of your name in our records.', 'error', ['Thank you for drawing our attention to the mistake. We will correct the spelling of the doctor\'s name in our records.', 'Thank you for drawing our attention to the mistake. We will not correct the spelling of your name.']],
  ['Dear Clinic, I am writing to thank the nurse who spent an hour with my mother, who was frightened of the injection.', 'We are delighted that you were pleased with the nurse who spent an hour with your mother.', 'thanks', ['We are disappointed that you were not pleased with the nurse who spent an hour with your mother.', 'We are delighted that you were pleased with the nurse who spent an hour with your father.']],
  ['Dear Clinic, why must I fill in the same form at every visit? Surely you already have my details.', 'You raise a fair point. We are looking at whether we can keep your details on file for future visits.', 'ask', ['You raise a fair point. We are looking at whether we can ask you for the same form at every visit.', 'You raise an unfair point. We are looking at whether we can keep your details on file for future visits.']],
  ['Dear Clinic, I have been a patient for thirty years, but I shall change doctors unless the waiting times improve.', 'We value your thirty years as a patient, and we are looking at ways to improve the waiting times.', 'cancel', ['We value your thirty years as a patient, and we will change your doctor at once.', 'We value your thirty months as a patient, and we are looking at ways to improve the waiting times.']],
  ['Dear Clinic, I should like to know why my claim was refused, since the doctor told me that the treatment was covered.', 'We understand your concern. We will ask the insurer why your claim for the treatment was refused.', 'claim', ['We understand your concern. We will ask the insurer why your claim for the treatment was accepted.', 'We understand your concern. We will ask the doctor why your claim for the treatment was refused.']],
]);

const QA_GAP4 = bank(4, [
  ['The clinic can not release the file ___ the patient has signed the form.', 'unless', 'link', ['although', 'whereas']],
  ['Not only ___ the nurse give the injection, but she also explained the next steps.', 'did', 'inv', ['was', 'has']],
  ['The report, ___ was written by the specialist, is confidential.', 'which', 'rel', ['what', 'who']],
  ['The patient is advised ___ the tablets with food.', 'to take', 'inf', ['taking', 'take']],
  ['Had the form been signed earlier, the treatment ___ started on Monday.', 'could have', 'cond', ['could', 'can have']],
  ['The doctor recommended that she ___ a specialist.', 'see', 'subj', ['sees', 'saw']],
  ['The appointment will go ahead ___ the weather.', 'despite', 'link', ['although', 'however']],
  ['The insurer has ___ the claim that the treatment was necessary.', 'accepted', 'verb', ['agreed', 'agreeing']],
  ['Neither of the doctors ___ the results yet.', 'has seen', 'agree', ['have seen', 'are seeing']],
  ['Patients ___ are over seventy-five do not pay the fee.', 'who', 'rel', ['whose', 'whom']],
]);

const QA_PROOF4 = bank(4, [
  ['Notes: The clinic will be closed on Monday for the holiday. It will open at eight on Tuesday. Emergencies go to the hospital. Notice: (1) The clinic will be closed on Monday for the holiday. (2) It will open at nine on Tuesday. (3) Emergencies go to the hospital.', '(2) It will open at nine on Tuesday.', 'hours', ['(1) The clinic will be closed on Monday for the holiday.', '(3) Emergencies go to the hospital.']],
  ['Notes: The patient has an allergy to penicillin. The doctor chose another antibiotic. The course lasts seven days. Leaflet: (1) The patient has an allergy to penicillin. (2) The doctor chose penicillin. (3) The course lasts seven days.', '(2) The doctor chose penicillin.', 'allergy', ['(1) The patient has an allergy to penicillin.', '(3) The course lasts seven days.']],
  ['Notes: The insurer pays 80% of the cost. The patient pays the rest. The limit is 500 coins a year. Letter: (1) The insurer pays 80% of the cost. (2) The patient pays nothing. (3) The limit is 500 coins a year.', '(2) The patient pays nothing.', 'cover', ['(1) The insurer pays 80% of the cost.', '(3) The limit is 500 coins a year.']],
  ['Notes: A parent must sign for a child under sixteen. A nurse must witness the signature. The form is valid for one year. Form: (1) A parent must sign for a child under sixteen. (2) No witness is needed. (3) The form is valid for one year.', '(2) No witness is needed.', 'consent', ['(1) A parent must sign for a child under sixteen.', '(3) The form is valid for one year.']],
  ['Notes: The specialist will see the patient on Wednesday. The appointment lasts forty minutes. The patient should bring a list of drugs. Letter: (1) The specialist will see the patient on Wednesday. (2) The appointment lasts twenty minutes. (3) The patient should bring a list of drugs.', '(2) The appointment lasts twenty minutes.', 'visit', ['(1) The specialist will see the patient on Wednesday.', '(3) The patient should bring a list of drugs.']],
  ['Notes: Flu vaccination is free for people over sixty-five. Others pay 8 coins. Children are free. Notice: (1) Flu vaccination is free for people over sixty-five. (2) Others pay 12 coins. (3) Children are free.', '(2) Others pay 12 coins.', 'shots', ['(1) Flu vaccination is free for people over sixty-five.', '(3) Children are free.']],
]);

const B4: Record<string, QaItem[]> = { say4: QA_SAY4, phone4: QA_PHONE4, mail4: QA_MAIL4, letter4: QA_LETTER4, gap4: QA_GAP4, proof4: QA_PROOF4 };

const T4: TaskTemplate[] = [
  { id: 'ct4_sort', rank: 4, arch: 'sort', say: 'The morning list is long. Please send each patient or paper to the desk that fits.', count: [4, 5], bins: ['ear', 'women', 'mind', 'older', 'records', 'referral', 'insurance', 'pay', 'urgent', 'sameday', 'booked'],
    patterns: [
      { text: 'I have had a sore throat and a blocked nose for weeks', bins: ['ear'] }, { text: 'My ears have been ringing for days', bins: ['ear'] }, { text: 'I can not hear well when there is noise', bins: ['ear'] }, { text: 'My child has pain in his ear again', bins: ['ear'] }, { text: 'I lose my voice every winter', bins: ['ear'] },
      { text: 'I am pregnant and would like to book a check', bins: ['women'] }, { text: 'I would like advice about my baby due in the autumn', bins: ['women'] }, { text: 'I would like to discuss my options for birth control', bins: ['women'] }, { text: 'I have a question about the change of life', bins: ['women'] },
      { text: 'I have felt very anxious and can not sleep', bins: ['mind'] }, { text: 'I have been feeling very low for months', bins: ['mind'] }, { text: 'I find it hard to leave the house, and I feel afraid all the time', bins: ['mind'] }, { text: 'I would like to talk to someone about my stress at work', bins: ['mind'] },
      { text: 'My mother is ninety and needs help to walk', bins: ['older'] }, { text: 'My grandfather has fallen twice this week', bins: ['older'] }, { text: 'My aunt is eighty-eight and has lost her appetite', bins: ['older'] }, { text: 'My father is confused and keeps forgetting things', bins: ['older'] },
      { text: 'I need my old records for the specialist', bins: ['records'] }, { text: 'A hospital asks for a patient\'s past records', bins: ['records'] }, { text: 'I would like a copy of my full file', bins: ['records'] }, { text: 'Please send my file to my new doctor', bins: ['records'] },
      { text: 'The specialist will see me, but I need the letter first', bins: ['referral'] }, { text: 'A letter that sends a patient to the hospital for tests', bins: ['referral'] }, { text: 'My doctor says that I must see a heart specialist', bins: ['referral'] }, { text: 'I need a letter to see the eye specialist', bins: ['referral'] },
      { text: 'The insurer has refused my claim', bins: ['insurance'] }, { text: 'A letter in which the insurer asks for a second opinion', bins: ['insurance'] }, { text: 'A form for a claim after an accident', bins: ['insurance'] }, { text: 'My cover ends this month, and I need to renew it', bins: ['insurance'] },
      { text: 'I would like to pay my share of the cost', bins: ['pay'] }, { text: 'A patient who wants to pay in parts', bins: ['pay'] }, { text: 'I think that the bill is too high', bins: ['pay'] }, { text: 'I need a receipt for my insurer', bins: ['pay'] },
      { text: 'My father has a pain in his chest and feels dizzy', bins: ['urgent'] }, { text: 'My little girl has swallowed something', bins: ['urgent'] }, { text: 'My wife can not breathe, and her lips are blue', bins: ['urgent'] },
      { text: 'My daughter has had a fever since morning', bins: ['sameday'] }, { text: 'My son has a bad cut on his hand', bins: ['sameday'] }, { text: 'I have a painful ear that began today', bins: ['sameday'] },
      { text: 'I would like a check-up in two weeks', bins: ['booked'] }, { text: 'I want to see the doctor about my knee, but it is not urgent', bins: ['booked'] }, { text: 'Can I book a visit for next month?', bins: ['booked'] },
    ] },
  { id: 'ct4_claim', rank: 4, arch: 'check', say: 'The insurer has asked about a claim. Please check our claim form against the treatment record.', fields: [
    { id: 'who', label: 'Patient', values: ['{Mrs. Hill|@}', '{Mr. Grant|@}', '{Captain Reed|@}', '{Big Joe|@}'] },
    { id: 'what', label: 'Treatment', values: ['a scan of the knee', 'a blood test', 'an injection', 'a visit to the specialist'] },
    { id: 'date', label: 'Date', values: ['June 4', 'June 14', 'July 4', 'July 24'] },
    { id: 'sum', label: 'Cost', values: ['60 coins', '90 coins', '120 coins', '150 coins'] },
  ], docs: [{ kind: 'card', title: 'Treatment record', fields: ['who', 'what', 'date', 'sum'] }, { kind: 'note', title: 'Claim form', fields: ['who', 'what', 'date', 'sum'] }], target: 1, pWrong: 0.7 },
  { id: 'ct4_share', rank: 4, arch: 'check', say: 'The patient pays part of the cost. Please check the amount on the bill.', fields: [
    { id: 'cost', label: 'Cost of treatment', range: [100, 300, 50], fmt: '{n} coins' },
    { id: 'pct', label: 'Patient pays', values: ['20%', '25%', '10%'] },
    { id: 'share', label: 'Amount', calc: 'cost * 20 / 100', fmt: '{n} coins' },
  ], docs: [{ kind: 'card', title: 'Treatment record', fields: ['cost', 'share'] }, { kind: 'invoice', title: 'Bill', fields: ['cost', 'share'] }], target: 1, pWrong: 0.7, wrongable: ['cost', 'share'] },
  { id: 'ct4_repeat', rank: 4, arch: 'check', say: 'The repeat prescription is ready. Please check it against the file before it goes to the pharmacy.', fields: [
    { id: 'who', label: 'Patient', values: ['{Mr. Grant|@}', '{Grandma Rose|@}', '{Grandpa Sam|@}', '{Professor Hale|@}'] },
    { id: 'dose', label: 'Dose', values: ['one tablet every morning', 'two tablets at night', 'one capsule twice a day'] },
    { id: 'long', label: 'Runs for', values: ['one month', 'three months', 'six months'] },
  ], docs: [{ kind: 'note', title: 'His file', fields: ['who', 'dose', 'long'] }, { kind: 'order', title: 'Repeat prescription', fields: ['who', 'dose', 'long'] }], target: 1, pWrong: 0.7 },
  { id: 'ct4_result', rank: 4, arch: 'check', say: 'The specialist has sent the results. Please check the summary for the patient against the report.', fields: [
    { id: 'who', label: 'Patient', values: ['{Captain Reed|@}', '{Grandma Rose|@}', '{Mr. Grant|@}'] },
    { id: 'test', label: 'Test', values: ['an eye scan', 'a blood test', 'a hearing test'] },
    { id: 'result', label: 'Result', values: ['no change since last year', 'a small change', 'a clear improvement'] },
    { id: 'next', label: 'Next visit', values: ['in two months', 'in six months', 'in twelve months'] },
  ], docs: [{ kind: 'card', title: 'Report', fields: ['who', 'test', 'result', 'next'] }, { kind: 'letter', title: 'Summary for the patient', fields: ['who', 'test', 'result', 'next'] }], target: 1, pWrong: 0.7 },
  { id: 'ct4_dates', rank: 4, arch: 'check', say: 'Please check the course of treatment against the doctor\'s plan.', fields: [
    { id: 'start', label: 'Starts', values: ['March 4', 'April 8', 'May 6'] },
    { id: 'length', label: 'Lasts', range: [3, 6], fmt: '{n} weeks' },
    { id: 'review', label: 'Review visit', values: ['after one week', 'after two weeks'] },
  ], docs: [{ kind: 'note', title: 'Doctor\'s plan', fields: ['start', 'length', 'review'] }, { kind: 'letter', title: 'Letter to the patient', fields: ['start', 'length', 'review'] }], target: 1, pWrong: 0.7 },
  { id: 'ct4_stay', rank: 4, arch: 'check', say: 'The patient stayed in the clinic. Please check the nights and the total.', fields: [
    { id: 'nights', label: 'Nights', range: [1, 4] },
    { id: 'rate', label: 'Price a night', values: ['80', '90', '100'] },
    { id: 'total', label: 'Total', calc: 'nights * rate', fmt: '{n} coins' },
  ], docs: [{ kind: 'card', title: 'Ward record', fields: ['nights', 'rate', 'total'] }, { kind: 'invoice', title: 'Bill', fields: ['nights', 'rate', 'total'] }], target: 1, pWrong: 0.7, wrongable: ['nights', 'total'] },
  { id: 'ct4_pad', rank: 4, arch: 'respond', mode: 'form', kind: 'phone', features: ['audioOnly'], say: 'Someone is calling. Please write down every detail.',
    lines: ['Good afternoon. This is {who}.', 'Your claim for {patient} has been approved, but only {share} of the cost will be paid.', 'The patient will receive a letter by {day}.'],
    fields: [
      { id: 'who', label: 'Caller', values: ['{Ms. Lund|@}', '{Mr. Costa|@}', '{Ms. Hart|@}'] },
      { id: 'patient', label: 'Claim for', values: ['{Mrs. Hill|@}', '{Nora|@}', '{Ken|@}', '{Mr. Grant|@}'] },
      { id: 'share', label: 'Will be paid', values: ['70%', '80%', '50%', '90%'] },
      { id: 'day', label: 'Letter by', values: ['Monday', 'Wednesday', 'Friday'] },
    ] },
  { id: 'ct4_book', rank: 4, arch: 'respond', mode: 'slot', kind: 'memo', say: 'Please look at the book. When can the patient come?', layout: 'calendar', rows: DAYS5, cols: TIMES4, cellTags: { t9: ['morning'], t11: ['morning'], t1: ['afternoon'], t3: ['afternoon'] },
    want: [
      { tag: 'mon', text: 'The patient can only come on Monday.' }, { tag: 'tue', text: 'The patient needs a day early in the week, and Tuesday is best.' }, { tag: 'wed', text: 'The patient can come on Wednesday.' }, { tag: 'thu', text: 'The doctor sees such patients on Thursday.' }, { tag: 'fri', text: 'The patient asks for Friday.' },
      { tag: 'morning', text: 'The patient needs a long appointment in the morning.' }, { tag: 'afternoon', text: 'The patient would like an afternoon appointment, after work.' }, { tag: 't9', text: 'The patient needs the earliest time, before the blood test.' },
    ],
    avoid: [{ tag: 'mon', text: 'The doctor is away on Monday.' }, { tag: 'fri', text: 'The laboratory is closed on Friday.' }, { tag: 'wed', text: 'The patient has a hospital visit on Wednesday.' }, { tag: 't11', text: 'The patient has another visit at eleven.' }, { tag: 't3', text: 'The patient must leave before three.' }],
    busy: ['Busy', 'Full', 'Busy', 'Full'], open: ['Dear {Ms. Vega|@},'], close: ['Thank you.'] },
  { id: 'ct4_say', rank: 4, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'say4' },
  { id: 'ct4_phone', rank: 4, arch: 'respond', mode: 'choose', kind: 'phone', bank: 'phone4', features: ['audioOnly'] },
  { id: 'ct4_mail', rank: 4, arch: 'respond', mode: 'choose', kind: 'email', bank: 'mail4' },
  { id: 'ct4_letter', rank: 4, arch: 'respond', mode: 'choose', kind: 'letter', bank: 'letter4' },
  { id: 'ct4_gap', rank: 4, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'gap4' },
  { id: 'ct4_proof', rank: 4, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'proof4' },
];

// ---------------------------------------------------------------------------------------------- rank 5 (英検1級, TOEIC 〜990)
// The lighthouse: the insurer refuses Mr. Grant's claim and the clinic helps him to appeal; consent forms and what they
// allow; a notice about an outbreak at the school; the clinic's fiftieth birthday. The insurer's inspector reads the forms.

const R5A: AuthoredTask[] = [
  check('c5_refusal', 5, 1, 'p_vega', 'The insurer has refused the claim of {Mr. Grant|@}. Please check my summary of its letter.', [
    note('The insurer\'s letter', ['Your claim for the operation on March 9 is refused, because the condition existed before you joined the scheme.', 'You may appeal within thirty days of this letter.']),
    paper('letter', 'Summary', [['what', 'Claim for', 'the operation on March 9'], ['why', 'Reason', 'the condition existed before he joined'], ['appeal', 'Appeal within', 'sixty days']]),
  ], 'appeal', { fix: ['thirty days', ['thirty days', 'sixty days', 'ninety days']] }),
  msg('c5_exclusion', 5, 2, 'c_merchant', 'memo', { say: 'Will my insurance pay for the operation that the specialist wants? It is for an old injury.' }, ['EXCLUSIONS', 'The scheme does not pay for the treatment of conditions that existed before the member joined.', 'It does pay for injuries that happen after the member has been in the scheme for a year.'],
    'No, if the injury happened before he joined the scheme.', ['Yes, even if the injury happened before he joined the scheme.', 'No, if the injury happened after he had been in the scheme for a year.']),
  sort('c5_sort1', 5, 3, 'p_vega', 'The inspector comes on Thursday. Please sort these with great care.', ['insurance', 'records', 'referral', 'older'], [
    ['A letter in which the insurer refuses a claim and tells the patient what to do next', 'insurance'], ['A request that the patient\'s file be sent to a court', 'records'], ['A letter asking the hospital to see a patient for an operation', 'referral'], ['An old woman who has lost her way in the clinic', 'older'],
  ]),
  msg('c5_consent', 5, 4, 'p_vega', 'letter', { from: '{Dr. Moreau|@}' }, ['To {Ms. Vega|@},', 'Before the patients join the trial, each of them must sign the consent form after reading the information sheet.', 'No patient may be pressed to sign, and any patient may withdraw at any time, without giving a reason.', '{Dr. Moreau|@}'],
    'Patients may withdraw at any time without giving a reason.', ['Patients may not withdraw once they have signed the consent form.', 'Patients may withdraw at any time, but they must give a reason.'], { say: 'What does the doctor say about the patients in the trial?' }),
  pad('c5_phone1', 5, 5, 'p_vega', ['This is {Ms. Lund|@} at the insurance office.', 'The appeal of {Mr. Grant|@} will be heard on May 12. The patient may bring one person with him.', 'Please confirm that the clinic will send its notes by May 5.'], [
    ['who', 'Caller', '{Ms. Lund|@}', ['{Ms. Hart|@}', '{Mr. Costa|@}']],
    ['patient', 'Appeal of', '{Mr. Grant|@}', ['{Mrs. Hill|@}', '{Ken|@}']],
    ['date', 'Heard on', 'May 12', ['May 2', 'June 12']],
    ['notes', 'Clinic sends notes by', 'May 5', ['May 15', 'April 5']],
  ], { features: ['audioOnly'], say: 'The insurer is on the line. Please take down every detail.' }),
  check('c5_age', 5, 6, 'p_lund', 'The insurer wants proof of the dates. Please check the claim form against our records.', [
    paper('card', 'Clinic record', [['who', 'Patient', '{Mr. Grant|@}'], ['join', 'Joined the scheme', 'January 2021'], ['first', 'First visit for the knee', 'June 2022'], ['op', 'Operation', 'March 9']]),
    paper('note', 'Claim form', [['who', 'Patient', '{Mr. Grant|@}'], ['join', 'Joined the scheme', 'January 2021'], ['first', 'First visit for the knee', 'June 2019'], ['op', 'Operation', 'March 9']]),
  ], 'first', { fix: ['June 2022', ['June 2012', 'June 2019', 'June 2022']] }),
  slot('c5_book1', 5, 7, 'p_vega', 'memo', ['The trial nurse must see {Grandma Rose|@} for a long first visit, which needs a morning with no other appointment after it.', 'The nurse is available only on Tuesday and Thursday mornings, and the clinic holds Thursday for the vaccination week.'], DAYS5, TIMES4, ['morning'], ['mon', 'wed', 'thu', 'fri'], 'tue-t9', ['Busy', 'Full', 'Busy', 'Full'],
    { say: 'Please look at the book. When can she come?', extraBusy: ['tue-t11'] }),
  msg('c5_say1', 5, 8, 'c_scholar', 'speech', { say: 'Should I wish to see my records, would I have to pay for a copy, or is it my right to see them free of charge?' }, ['Should I wish to see my records, would I have to pay for a copy, or is it my right to see them free of charge?'],
    'You may see your records free of charge, but a copy may carry a small fee.', ['You may see your records only if you pay a fee, and a copy is free of charge.', 'You may see your records free of charge, and a copy must be paid for by the insurer.']),
  check('c5_ok1', 5, 9, 'p_patel', 'Does this information sheet agree with the trial plan? I think it does.', [
    paper('note', 'Trial plan', [['len', 'Length', 'twelve weeks'], ['visits', 'Visits', 'six'], ['drug', 'Group', 'new tablet or dummy tablet']]),
    paper('card', 'Information sheet', [['len', 'Length', 'twelve weeks'], ['visits', 'Visits', 'six'], ['drug', 'Group', 'new tablet or dummy tablet']]),
  ], null),
  msg('c5_contradict1', 5, 10, 'p_patel', 'memo', { say: 'Which sentence of this notice goes beyond the notes?' }, [
    'Notes: Eight children at the school have a fever and a rash. The doctor has not yet found the cause. Parents will be told if the school must close.',
    'Notice: (1) Eight children at the school have a fever and a rash. (2) The doctor has found that the cause is a virus. (3) Parents will be told if the school must close.',
  ], '(2) The doctor has found that the cause is a virus.', ['(1) Eight children at the school have a fever and a rash.', '(3) Parents will be told if the school must close.']),
  msg('c5_reader1', 5, 11, 'p_vega', 'email', { from: '{Ms. Hart|@}', subject: 'My father\'s record' }, ['Dear Clinic,', 'Were my father still able to decide for himself, he would have given you his consent.', 'As he can not, I hold power of attorney, and I ask you to send his records to the specialist.', 'Regards,', '{Ms. Hart|@}'],
    'She asks the clinic to send his records, because she acts for him and he can not decide.', ['She asks the clinic to keep his records, because he can decide for himself.', 'She asks the clinic to send his records, because her father has given consent himself.'], { say: 'What does {Ms. Hart|@} ask?' }),
  sort('c5_sort2', 5, 12, 'p_vega', 'The inspector\'s list is long. Please sort these with great care.', ['pay', 'insurance', 'mind', 'women'], [
    ['I wish to pay the excess on my claim', 'pay'], ['I wish to appeal against what the insurer decided', 'insurance'], ['I have not been able to work because I feel so anxious', 'mind'], ['I should like a check, because my second child is due in June', 'women'],
  ]),
  check('c5_quote', 5, 13, 'p_lund', 'The insurer has sent its terms. Please check my summary of the terms.', [
    paper('card', 'Terms', [['prem', 'Yearly premium', '480 coins'], ['ded', 'Excess on each claim', '50 coins'], ['limit', 'Limit a year', '5,000 coins']]),
    paper('letter', 'Summary', [['prem', 'Yearly premium', '480 coins'], ['ded', 'Excess on each claim', '15 coins'], ['limit', 'Limit a year', '5,000 coins']]),
  ], 'ded', { fix: ['50 coins', ['15 coins', '50 coins', '150 coins']] }),
  msg('c5_gap1', 5, 14, 'p_patel', 'memo', { say: 'Which words complete the sentence correctly?' }, ['No sooner had the nurse opened the door ___ the patient began to cough.'],
    'than', ['when', 'that']),
  msg('c5_phone2', 5, 15, 'c_boy', 'phone', { say: 'Hello. My mother is out, and I have found a letter from the insurer on the table. It says that I must call you before Friday.' }, ['Hello. My mother is out, and I have found a letter from the insurer on the table. It says that I must call you before Friday.'],
    'Thank you for calling. Please ask your mother to call us before Friday about the insurer\'s letter.', ['Thank you for calling. Please ask your mother to call us after Friday about the insurer\'s letter.', 'Thank you for calling. Please ask your father to call us before Friday about the insurer\'s letter.']),
  pad('c5_phone3', 5, 16, 'p_vega', ['Good morning. This is {Nurse Ito|@} at the school.', 'Nine children now have a fever. The head teacher has decided to send the whole of Class 4 home.', 'Please warn the parents, and ask {Dr. Patel|@} to come before noon.'], [
    ['who', 'Caller', '{Nurse Ito|@}', ['{Ms. Lund|@}', '{Mr. Costa|@}']],
    ['sick', 'Children with a fever', 'nine', ['five', 'nineteen']],
    ['home', 'Sent home', 'the whole of Class 4', ['Class 4 and Class 5', 'only the sick children']],
    ['doctor', 'Doctor to come', 'before noon', ['after noon', 'before ten']],
  ], { features: ['audioOnly'], say: 'The school is calling. Please write down every detail.' }),
  check('c5_vaccine', 5, 17, 'p_ito', 'Please check the vaccination record against the register. A parent has questioned it.', [
    paper('note', 'Register', [['child', 'Child', '{Tom|@}'], ['first', 'First dose', 'October 9'], ['second', 'Second dose', 'November 9']]),
    paper('card', 'Record sent to the parent', [['child', 'Child', '{Tom|@}'], ['first', 'First dose', 'October 9'], ['second', 'Second dose', 'December 9']]),
  ], 'second', { fix: ['November 9', ['October 9', 'November 9', 'December 9']] }),
  msg('c5_complaint', 5, 18, 'p_vega', 'email', { from: '{Mr. Okoye|@}', subject: 'Complaint to the health regulator' }, ['Dear {Ms. Vega|@},', 'I have asked the regulator to look into the way in which your staff handled my mother\'s file.', 'Under the code, you should have asked for her consent before you sent it to the insurer.', 'Please reply by Friday.', 'Regards,', '{Mr. Okoye|@}'],
    'He says that the clinic should have asked for his mother\'s consent before it sent her file.', ['He says that the clinic should have asked the insurer for consent before it sent her file.', 'He says that the clinic asked for his mother\'s consent after it sent her file.']),
  sort('c5_sort3', 5, 19, 'p_vega', 'More papers for the inspector. Please sort them exactly.', ['records', 'referral', 'pay', 'sameday'], [
    ['A patient\'s written consent to the release of her file', 'records'], ['A letter from the specialist who would like to see {Ken|@} for a second opinion', 'referral'], ['A statement of the amount that the insurer has paid so far this year', 'pay'], ['A man whose wound has begun to bleed again after treatment yesterday', 'sameday'],
  ]),
  check('c5_calc', 5, 20, 'p_lund', 'The insurer pays after the excess is taken off. Please check the amount in my letter.', [
    paper('card', 'Claim', [['cost', 'Cost', '400 coins'], ['ex', 'Excess', '50 coins'], ['paid', 'Insurer pays', '350 coins']]),
    paper('letter', 'Letter to the patient', [['cost', 'Cost', '400 coins'], ['ex', 'Excess', '50 coins'], ['paid', 'Insurer pays', '450 coins']]),
  ], 'paid', { fix: ['350 coins', ['250 coins', '350 coins', '450 coins']] }),
  msg('c5_say2', 5, 21, 'c_sailor', 'speech', { say: 'Had I known that the clinic would be closed on Monday, I should have come on Friday. Is there anything that you can do for me now?' }, ['Had I known that the clinic would be closed on Monday, I should have come on Friday. Is there anything that you can do for me now?'],
    'I am sorry for the inconvenience. I shall see whether the nurse can fit you in this afternoon.', ['I am sorry for the inconvenience. I shall see whether the nurse can fit you in last Friday.', 'I am pleased about the inconvenience. I shall see whether the nurse can fit you in this afternoon.']),
  check('c5_ok2', 5, 22, 'p_ito', 'Here is the notice for the parents. Is it consistent with the doctor\'s statement?', [
    paper('note', 'Doctor\'s statement', [['what', 'Illness', 'a mild virus'], ['stay', 'Children stay home for', 'three days'], ['back', 'Return to school on', 'Monday']]),
    paper('letter', 'Notice for parents', [['what', 'Illness', 'a mild virus'], ['stay', 'Children stay home for', 'three days'], ['back', 'Return to school on', 'Monday']]),
  ], null),
];

const R5B: AuthoredTask[] = [
  msg('c5_reader2', 5, 23, 'p_vega', 'letter', { from: '{Grandma Rose|@}' }, ['Dear {Ms. Vega|@},', 'I have no wish to criticize your nurses, but I was told that I must stay in the waiting room with a mask, although I felt perfectly well.', 'I should like to know why this rule applies to me.', 'Yours,', '{Grandma Rose|@}'],
    'She asks why she had to wear a mask in the waiting room when she felt well.', ['She criticizes the nurses and says that she did not wear a mask.', 'She asks why she had to wait at home with a mask when she felt ill.']),
  msg('c5_gap2', 5, 24, 'p_patel', 'memo', { say: 'Which word completes the sentence?' }, ['The clinic would have called you ___ it had known that the results were ready.'],
    'if', ['unless', 'although']),
  check('c5_trial', 5, 25, 'p_patel', 'Please check the trial schedule on the card against the information sheet.', [
    paper('note', 'Information sheet', [['start', 'First visit', 'May 6'], ['end', 'Last visit', 'July 29'], ['pay', 'Travel costs', 'paid by the clinic']]),
    paper('card', 'Schedule on the card', [['start', 'First visit', 'May 6'], ['end', 'Last visit', 'July 9'], ['pay', 'Travel costs', 'paid by the clinic']]),
  ], 'end', { fix: ['July 29', ['June 29', 'July 9', 'July 29']] }),
  msg('c5_policy', 5, 26, 'c_oldman', 'memo', { say: 'My neighbour is a nurse here. May she tell me whether my wife was in the clinic today?' }, ['PRIVACY', 'Staff may not disclose to anyone, including family and neighbours, that a person is a patient, unless the patient has given written permission.'],
    'No. Staff may not say who is a patient without the patient\'s written permission.', ['Yes. Staff may say who is a patient to family and neighbours.', 'No. Staff may say who is a patient, but only to family and neighbours.']),
  sort('c5_sort4', 5, 27, 'p_vega', 'The inspector has asked to see how we sort. Please be exact.', ['older', 'mind', 'ear', 'women'], [
    ['An eighty-year-old man who has been confused since the morning and can not say where he lives', 'older'], ['A young man who says that he can not stop thinking about harming himself', 'mind'], ['A woman who has lost the hearing in one ear since last night', 'ear'], ['A woman who is thirty-six weeks pregnant and has felt no movement today', 'women'],
  ]),
  check('c5_form', 5, 28, 'p_lund', 'The patient has changed her address and her insurer. Please check that the form agrees with her letter.', [
    note('Her letter', ['I now live at 14 Harbour Road, and my insurer is the Coastal Health Scheme.']),
    paper('card', 'Updated form', [['addr', 'Address', '14 Harbour Road'], ['insurer', 'Insurer', 'the {Hillside|@} Scheme']]),
  ], 'insurer', { fix: ['the Coastal Health Scheme', ['the Coastal Health Scheme', 'the {Hillside|@} Scheme', 'the Harbour Scheme']] }),
  pad('c5_phone4', 5, 29, 'p_vega', ['Good evening. This is {Mr. Costa|@} at the pharmacy.', 'The tablets for {Big Joe|@} may interact with the new medicine that the specialist has prescribed.', 'Please ask {Dr. Patel|@} to call me before the tablets are given out.'], [
    ['who', 'Caller', '{Mr. Costa|@}', ['{Ms. Lund|@}', '{Mr. Okoye|@}']],
    ['patient', 'Tablets for', '{Big Joe|@}', ['{Mr. Grant|@}', '{Ken|@}']],
    ['problem', 'Problem', 'they may interact with the new medicine', ['they are out of stock', 'the label is wrong']],
    ['ask', 'Ask the doctor to', 'call before the tablets are given out', ['sign the tablets', 'collect the tablets']],
  ], { features: ['audioOnly'], say: 'The pharmacy is on the line. Please write down every detail.' }),
  msg('c5_headline', 5, 30, 'p_patel', 'memo', { say: 'Which sentence should the notice for the parents use? It must not say more than the doctor\'s statement.' }, ['The doctor says that the illness at the school is a mild virus.', 'It is not dangerous, but it spreads easily.', 'Children with a fever must stay at home for three days.'],
    'A mild virus is going round the school, and sick children must stay at home for three days.', ['A dangerous virus is going round the school, and sick children must stay at home for three days.', 'A mild virus is going round the school, and all children must stay at home for three days.']),
  slot('c5_book2', 5, 31, 'p_vega', 'memo', ['{Grandpa Sam|@} needs a scan and then a talk with the specialist, so he needs an appointment late in the day.', 'The specialist does not come on Monday or Wednesday, and the scan room closes at four on Friday.'], DAYS5, TIMES4, ['afternoon'], ['mon', 'wed', 'fri'], 'thu-t3', ['Busy', 'Full', 'Busy', 'Full'],
    { say: 'Please look at the book. When can he come?', extraBusy: ['thu-t1', 'tue-t3'] }),
  check('c5_ok3', 5, 32, 'p_lund', 'Please check this statement against the insurer\'s record. I think that it agrees.', [
    paper('card', 'Insurer\'s record', [['paid', 'Paid this year', '1,200 coins'], ['left', 'Left of the limit', '3,800 coins'], ['limit', 'Limit a year', '5,000 coins']]),
    paper('letter', 'Statement for the patient', [['paid', 'Paid this year', '1,200 coins'], ['left', 'Left of the limit', '3,800 coins'], ['limit', 'Limit a year', '5,000 coins']]),
  ], null),
  msg('c5_contradict2', 5, 33, 'p_patel', 'memo', { say: 'Which sentence cannot be supported by the notes?' }, [
    'Notes: The patient did not feel well after the medicine. She felt dizzy for an hour. She did not go to hospital. The doctor will see her tomorrow.',
    'Notice: (1) The patient did not feel well after the medicine. (2) She stayed in hospital for the night. (3) The doctor will see her tomorrow.',
  ], '(2) She stayed in hospital for the night.', ['(1) The patient did not feel well after the medicine.', '(3) The doctor will see her tomorrow.']),
  msg('c5_say3', 5, 34, 'c_student', 'speech', { say: 'If I had not forgotten my card, I should have paid less today. Is there anything that can still be done?' }, ['If I had not forgotten my card, I should have paid less today. Is there anything that can still be done?'],
    'Yes. If you show your card within a week, we shall return the difference.', ['Yes. If you show your card within a week, we shall keep the difference.', 'Yes. If you show your card after a week, we shall return the difference.']),
  check('c5_dates', 5, 35, 'p_ito', 'The inspector wants the vaccination dates for the school. Please check my table against the register.', [
    paper('note', 'Register', [['a', 'Class 3', '28 of 30 children'], ['b', 'Class 4', '25 of 31 children'], ['c', 'Class 5', '29 of 29 children']]),
    paper('letter', 'My table', [['a', 'Class 3', '28 of 30 children'], ['b', 'Class 4', '25 of 31 children'], ['c', 'Class 5', '29 of 30 children']]),
  ], 'c', { fix: ['29 of 29 children', ['19 of 29 children', '29 of 29 children', '29 of 30 children']] }),
  msg('c5_reader3', 5, 36, 'p_vega', 'email', { from: '{Ms. Hart|@}', subject: 'The bill for my father' }, ['Dear Clinic,', 'The bill that you sent includes a charge for a missed appointment, but my father was in hospital that day.', 'Unless you withdraw it, I shall write to the regulator.', 'Regards,', '{Ms. Hart|@}'],
    'She will write to the regulator unless the clinic withdraws the charge for the missed appointment.', ['She will write to the regulator if the clinic withdraws the charge for the missed appointment.', 'She will write to the clinic unless the regulator withdraws the charge for the missed appointment.'], { say: 'What does she want?' }),
  sort('c5_sort5', 5, 37, 'p_vega', 'The last tray before the inspector. Everything must be exact.', ['insurance', 'records', 'pay', 'referral'], [
    ['A claim form with the insurer\'s stamp on it', 'insurance'], ['The file of a patient who has moved to another town', 'records'], ['A receipt for the excess on the claim', 'pay'], ['A letter that asks the hospital to see a patient within a week', 'referral'],
  ]),
  check('c5_receipt', 5, 38, 'p_lund', 'The patient disputes the bill. Please check the receipt against the treatment list.', [
    paper('card', 'Treatment list', [['visit', 'Visit', '30'], ['test', 'Test', '45'], ['drug', 'Medicine', '25'], ['total', 'Total', '100']]),
    paper('invoice', 'Receipt', [['visit', 'Visit', '30'], ['test', 'Test', '45'], ['drug', 'Medicine', '25'], ['total', 'Total', '110']]),
  ], 'total', { fix: ['100', ['90', '100', '110']] }),
  msg('c5_gap3', 5, 39, 'p_patel', 'memo', { say: 'Which word completes the sentence correctly?' }, ['Only after the patient had signed ___ the nurse begin the examination.'],
    'did', ['has', 'was']),
  msg('c5_phone5', 5, 40, 'c_cook', 'phone', { say: 'This is {Nora|@}. Were you to move my appointment to Thursday, I could bring my mother, who can not come on Tuesday.' }, ['This is {Nora|@}. Were you to move my appointment to Thursday, I could bring my mother, who can not come on Tuesday.'],
    'I shall see whether I can move your appointment to Thursday, so that your mother can come.', ['I shall see whether I can move your appointment to Tuesday, so that your mother can come.', 'I shall see whether I can move your appointment to Thursday, so that your sister can come.']),
  pad('c5_phone6', 5, 41, 'p_vega', ['Hello. This is {Ms. Hart|@} from the health office.', 'The outbreak at the school is now confirmed as a virus. The infected children must stay at home until Monday.', 'Please send the notice to every parent by noon.'], [
    ['who', 'Caller', '{Ms. Hart|@}', ['{Ms. Lund|@}', '{Mr. Okoye|@}']],
    ['what', 'The outbreak is', 'a virus', ['a food problem', 'a mistake']],
    ['home', 'Stay home until', 'Monday', ['Friday', 'Wednesday']],
    ['send', 'Notice to parents by', 'noon', ['two', 'ten']],
  ], { features: ['audioOnly'], say: '{Ms. Hart|@} is calling. Please write down every detail.' }),
  msg('c5_anniv', 5, 42, 'p_vega', 'letter', { from: '{Professor Hale|@}' }, ['Dear {Ms. Vega|@},', 'The clinic is fifty years old this month, and I should like to thank every member of your staff for their patience and care.', 'May the clinic always help a patient in need, even when it is busy.', 'Yours,', '{Professor Hale|@}'],
    'He thanks the staff and wants the clinic to go on helping patients in need.', ['He is angry with the staff and wants the clinic to stop helping busy patients.', 'He thanks the staff because the clinic is five years old.']),
  check('c5_report', 5, 43, 'p_patel', 'The reaction to the medicine must be reported to the regulator. Please check the report against my note.', [
    paper('note', 'Doctor\'s note', [['who', 'Patient', '{Grandma Rose|@}'], ['drug', 'Medicine', 'one tablet a day'], ['what', 'Reaction', 'feeling dizzy for an hour'], ['when', 'Began', 'two days after the first dose']]),
    paper('letter', 'Report to the regulator', [['who', 'Patient', '{Grandma Rose|@}'], ['drug', 'Medicine', 'one tablet a day'], ['what', 'Reaction', 'feeling dizzy for an hour'], ['when', 'Began', 'two hours after the first dose']]),
  ], 'when', { fix: ['two days after the first dose', ['two hours after the first dose', 'two days after the first dose', 'two weeks after the first dose']] }),
  sort('c5_sort6', 5, 44, 'p_vega', 'The last list of the day. Please sort with care.', ['urgent', 'sameday', 'booked', 'mind'], [
    ['A man who says that he has taken an overdose of his tablets', 'urgent'], ['A woman whose wound is red and hot since this morning', 'sameday'], ['A man who would like to talk about an old back problem next month', 'booked'], ['A teacher who has felt very tired and sad for weeks', 'mind'],
  ]),
  msg('c5_say4', 5, 45, 'c_merchant', 'speech', { say: 'I should be most grateful if you would confirm that my appeal against the insurer has been received, and that it has been sent on to the tribunal.' }, ['I should be most grateful if you would confirm that my appeal against the insurer has been received, and that it has been sent on to the tribunal.'],
    'I can confirm that your appeal has been received, and I shall check that it has been sent on to the tribunal.', ['I can confirm that your appeal has been refused, and I shall check that it has been sent on to the tribunal.', 'I can confirm that your appeal has been received, and I shall check that it has been sent on to the insurer.']),
];
const R5 = [...R5A, ...R5B];

// ---------------------------------------------------------------------------------------------- rank 5 templates and banks

const QA_SAY5 = bank(5, [
  ['Should you be able to move my appointment to Friday, I would be obliged. I can not come on Wednesday.', 'Certainly. We shall move your appointment from Wednesday to Friday.', 'change', ['Certainly. We shall move your appointment from Friday to Wednesday.', 'Certainly. We shall move your appointment from Wednesday to Thursday.']],
  ['If I had known that the form was due on Monday, I would have brought it earlier.', 'I am sorry that you were not told. We should have informed you that the form was due on Monday.', 'regret', ['I am sorry that you were told. We should have informed you that the form was due on Friday.', 'I am glad that you were not told. We should have informed you that the form was due on Monday.']],
  ['I should like to know whether the clinic intends to share my details with the insurer.', 'At present we do not intend to share your details with the insurer without your written consent.', 'privacy', ['At present we intend to share your details with the insurer without your written consent.', 'At present we do not intend to share your insurer with the clinic without your written consent.']],
  ['The insurer claims that I joined the scheme after the operation. On what record do you base the dates on my claim?', 'We based them on our own treatment record and on the letter that you showed us on the day.', 'evidence', ['We based them on a guess that we have not checked against the treatment record.', 'We based them on our own treatment record and on a letter that we have not seen.']],
  ['Could you confirm that my appeal will be sent today and not at the end of the week?', 'I can confirm that your appeal will be sent today, as agreed.', 'confirm', ['I can confirm that your appeal will be sent at the end of the week, as agreed.', 'I can confirm that your appeal was sent last week, as agreed.']],
  ['Not until the insurer replies will we know whether the treatment is covered.', 'That is so. We shall wait for the insurer\'s reply before we say whether the treatment is covered.', 'wait', ['That is so. We shall say whether the treatment is covered before the insurer replies.', 'That is so. We shall wait for the doctor\'s reply before we say whether the treatment is covered.']],
  ['I would rather that you did not telephone my employer, even though I have given you the number.', 'Understood. We shall not telephone your employer, although you have given us the number.', 'privacy2', ['Understood. We shall telephone your employer, although you have given us the number.', 'Understood. We shall not telephone your doctor, although you have given us the number.']],
  ['The bill states that the excess is 50 coins. It was 30 last year.', 'Thank you. We shall check the excess of 50 coins against the insurer\'s terms.', 'figure', ['Thank you. We shall check the excess of 30 coins against the insurer\'s terms.', 'Thank you. We are sure that the excess of 50 coins is wrong.']],
]);

const QA_PHONE5 = bank(5, [
  ['Good evening. I represent the patient in this case. We would be grateful if you could hold the file until the tribunal has ruled on our request.', 'I understand. I shall pass your request to the doctor and to our lawyers before the file is released.', 'legal', ['I understand. I shall pass your request to the tribunal and to our lawyers before the file is released.', 'I understand. I shall release the file before your request reaches the doctor and our lawyers.']],
  ['This is the insurer. The decision on the appeal will be announced at noon, and not at eleven, as planned.', 'Thank you. We shall tell the patient that the decision on the appeal will be announced at noon.', 'delay', ['Thank you. We shall tell the patient that the decision on the appeal will be announced at eleven.', 'Thank you. We shall tell the patient that the decision on the appeal was announced at noon.']],
  ['I have documents that show that the clinic charged my mother twice for a single visit. I should prefer to remain anonymous.', 'Thank you for contacting us. We shall look into the charges in confidence and shall not name you.', 'source', ['Thank you for contacting us. We shall look into the charges in confidence and shall name you.', 'Thank you for contacting us. We shall publish the charges and shall not name you.']],
  ['We have been informed that the doctor will retire. Can you confirm that before the notice goes out?', 'We can not confirm it yet. We shall ask the doctor and let you know before the notice goes out.', 'confirm', ['We can confirm it. We shall ask the doctor and let you know after the notice goes out.', 'We can not confirm it yet. We shall ask the doctor and let you know after the notice goes out.']],
  ['I am the harbour doctor. Owing to the outbreak, the ferry will remain closed to visitors until at least Thursday.', 'Thank you. We shall tell patients that the ferry will remain closed to visitors until at least Thursday.', 'notice', ['Thank you. We shall tell patients that the ferry will remain open to visitors until at least Thursday.', 'Thank you. We shall tell patients that the ferry will remain closed to visitors until at least Saturday.']],
  ['Were the clinic to refuse the claim, my client would take legal action.', 'I understand your client\'s position. I shall ask the manager to review the claim with our lawyers before we reply.', 'threat', ['I understand your client\'s position. I shall ask the manager to refuse the claim without our lawyers.', 'I understand your client\'s position. I shall ask the lawyers to review the claim after we reply.']],
  ['I am calling about the records of my grandfather. You wrote that he lived at 22 Station Road. It was 32.', 'I am very sorry for the error. We shall correct his records to say that he lived at 32 Station Road.', 'records', ['I am very sorry for the error. We shall correct his records to say that he lived at 22 Station Road.', 'I am very sorry for the error. We shall correct his records to say that he lived at 32 Market Road.']],
  ['Hello. I am a researcher at the university. We should like to ask your patients to join a study on sleep.', 'Thank you for asking. We can not give out patients\' details, but we shall put up your notice in the waiting room.', 'media', ['Thank you for asking. We can give out patients\' details, and we shall put up your notice in the waiting room.', 'Thank you for asking. We can not give out patients\' details, and we shall not put up your notice.']],
]);

const QA_MAIL5 = bank(5, [
  ['Dear {Ms. Vega|@}, we write on behalf of our client to demand the withdrawal of the charge of March 3 and an apology.', 'Thank you for your letter. We have passed your demand for the withdrawal of the charge of March 3 to our manager.', 'legal', ['Thank you for your letter. We have passed your demand for the withdrawal of the charge of March 13 to our manager.', 'Thank you for your letter. We have withdrawn the charge of March 3 and passed your apology to our manager.']],
  ['Dear {Ms. Vega|@}, notwithstanding our disagreement, the specialist will see the patient provided that the file is sent in advance.', 'Thank you. We shall consider whether we can accept the condition that the file be sent in advance.', 'condition', ['Thank you. We shall consider whether we can accept the condition that the file be sent afterwards.', 'Thank you. We have accepted the condition that the patient be sent in advance.']],
  ['Dear Clinic, the reduction in the number of evening appointments, which you described as an improvement, is in fact a loss of six hours a week.', 'We take your point. We shall look at how we described the reduction in evening appointments, and the loss of six hours.', 'argue', ['We take your point. We shall look at how we described the reduction in evening appointments, and the loss of sixteen hours.', 'We do not take your point. We shall look at how we described the reduction in evening appointments, and the loss of six hours.']],
  ['Dear Clinic, I have no objection to the new rules, but I do object to the suggestion that I broke them.', 'We shall review whether the suggestion that you broke the rules was justified by the evidence that we had.', 'objection', ['We shall review whether the new rules were justified by the evidence that we had.', 'We shall review whether your objection to the new rules was justified by the suggestion that you had.']],
  ['Dear {Ms. Vega|@}, we are pleased to invite you to the opening of the new hospital wing, which takes place on the first of June.', 'Thank you for the invitation. We shall send a nurse to the opening of the new hospital wing on the first of June.', 'invite', ['Thank you for the invitation. We shall send a nurse to the opening of the new hospital wing on the first of July.', 'Thank you for the invitation. We shall send a nurse to the opening of the old hospital wing on the first of June.']],
  ['Dear Clinic, may I suggest that you publish the full terms of the scheme, which are of great interest to every member?', 'Thank you for the suggestion. We shall consider publishing the full terms of the scheme on our notice board.', 'suggest', ['Thank you for the suggestion. We shall consider publishing the full terms of the scheme on a bus.', 'Thank you for the suggestion. We shall not consider publishing the full terms of the scheme.']],
  ['Dear Clinic, it has come to my attention that a letter about my son was left in the waiting room. I ask you to explain this immediately.', 'We shall look into how the letter about your son came to be left in the waiting room and explain it to you.', 'privacy', ['We shall look into how the letter about your daughter came to be left in the waiting room and explain it to you.', 'We shall ignore how the letter about your son came to be left in the waiting room and explain it to you.']],
  ['Dear Clinic, we regret to inform you that the grant for your screening project has been withdrawn owing to budget cuts.', 'We are disappointed to learn that the grant for our screening project has been withdrawn. May we ask whether it might be restored next year?', 'regret', ['We are delighted to learn that the grant for our screening project has been withdrawn. May we ask whether it might be restored next year?', 'We are disappointed to learn that the grant for our screening project has been approved. May we ask whether it might be withdrawn next year?']],
]);

const QA_LETTER5 = bank(5, [
  ['Dear Clinic, so unclear was your letter that three of my relatives thought that I had been refused treatment. I demand an explanation.', 'We regret the distress that the letter caused you. We shall consider sending an explanation, as you ask.', 'complaint', ['We do not regret the distress that the letter caused you. We shall consider sending an explanation, as you ask.', 'We regret the distress that the letter caused you. We shall consider sending a second letter, as you ask.']],
  ['Dear Clinic, the clinic has been a faithful friend to this town for fifty years, and I hope that it will remain so for fifty more.', 'Thank you for your kind words. We hope to remain a faithful friend to this town for another fifty years.', 'praise', ['Thank you for your kind words. We hope to remain a faithful friend to this town for another five years.', 'Thank you for your harsh words. We hope to remain a faithful friend to this town for another fifty years.']],
  ['Dear Clinic, never in my life have I met so unhelpful a receptionist. Where was the person who could explain the form?', 'We take the criticism seriously. We shall look again at whether someone was available to explain the form.', 'bias', ['We reject the criticism. We shall look again at whether someone was available to explain the form.', 'We take the criticism seriously. We shall not look again at whether someone was available to explain the form.']],
  ['Dear Clinic, I write to correct a statement attributed to me. I said that the wait was two hours, not twelve.', 'Thank you for the correction. We shall record that you said that the wait was two hours, not twelve.', 'correction', ['Thank you for the correction. We shall record that you said that the wait was twelve hours, not two.', 'Thank you for the correction. We shall record that you said that the wait was two hours, not twenty.']],
  ['Dear Clinic, were it not for your nurse, my mother would not have received her injection on time. I wish to thank her.', 'Thank you. We shall pass on your thanks to the nurse who helped your mother with her injection.', 'thanks', ['Thank you. We shall pass on your thanks to the mother who helped your nurse with her injection.', 'Thank you. We shall pass on your thanks to the doctor who helped your mother with her injection.']],
  ['Dear Clinic, I cancel my membership with immediate effect. The decision to send my test results by post was, in my view, deeply insensitive.', 'We are sorry to lose you as a member, and we regret that you found the way in which we sent your results insensitive.', 'cancel', ['We are glad to lose you as a member, and we regret that you found the way in which we sent your results insensitive.', 'We are sorry to lose you as a member, and we regret that you found the way in which we sent your bill insensitive.']],
]);

const QA_GAP5 = bank(5, [
  ['No sooner had the notice been posted ___ the telephone began to ring.', 'than', 'inv', ['when', 'that']],
  ['Only after the insurer replied ___ the cost known.', 'was', 'inv', ['were', 'did']],
  ['Were the clinic to refuse the claim, the patient ___ appeal.', 'would', 'subj', ['will', 'did']],
  ['The doctor insisted that the form ___ signed in front of a witness.', 'be', 'subj', ['is', 'was']],
  ['Little ___ the receptionist know that the letter was false.', 'did', 'inv', ['does', 'had']],
  ['___ the symptoms persisted, the patient should return to the clinic.', 'Should', 'cond', ['Had', 'If it']],
  ['The scheme, ___ costs have risen, will cut some benefits.', 'whose', 'rel', ['which', 'whom']],
  ['Not only ___ the patient deny the charge, but she also questioned the bill.', 'did', 'inv', ['has', 'was']],
  ['The claim would not have been paid ___ the records had been checked.', 'unless', 'link', ['despite', 'because of']],
  ['Such ___ the demand for the vaccine that the clinic ran out in an hour.', 'was', 'inv', ['were', 'did']],
]);

const QA_PROOF5 = bank(5, [
  ['Notes: The insurer says that the condition existed before the member joined. The clinic\'s record shows that the first visit was after he joined. The insurer has not seen the record. Draft: (1) The insurer says that the condition existed before the member joined. (2) The clinic\'s record shows that the first visit was after he joined. (3) The insurer has admitted that it was wrong.', '(3) The insurer has admitted that it was wrong.', 'claim', ['(1) The insurer says that the condition existed before the member joined.', '(2) The clinic\'s record shows that the first visit was after he joined.']],
  ['Notes: The trial lasts twelve weeks. Patients may withdraw at any time. No payment is made for taking part. Information sheet: (1) The trial lasts twelve weeks. (2) Patients may not withdraw once they have started. (3) No payment is made for taking part.', '(2) Patients may not withdraw once they have started.', 'trial', ['(1) The trial lasts twelve weeks.', '(3) No payment is made for taking part.']],
  ['Notes: The doctor said that the virus is mild. She did not say that it is harmless. Children with a fever should stay at home. Notice: (1) The doctor said that the virus is mild. (2) She said that it is harmless. (3) Children with a fever should stay at home.', '(2) She said that it is harmless.', 'notice', ['(1) The doctor said that the virus is mild.', '(3) Children with a fever should stay at home.']],
  ['Notes: The excess is 50 coins on each claim. The yearly limit is 5,000 coins. The premium is 480 coins a year. Summary: (1) The excess is 50 coins on each claim. (2) The yearly limit is 5,000 coins. (3) The premium is 840 coins a year.', '(3) The premium is 840 coins a year.', 'terms', ['(1) The excess is 50 coins on each claim.', '(2) The yearly limit is 5,000 coins.']],
  ['Notes: The patient has a mild reaction to the tablet. She felt dizzy for an hour. The doctor will see her tomorrow. Report: (1) The patient has a mild reaction to the tablet. (2) She was dizzy for a day. (3) The doctor will see her tomorrow.', '(2) She was dizzy for a day.', 'reaction', ['(1) The patient has a mild reaction to the tablet.', '(3) The doctor will see her tomorrow.']],
  ['Notes: Staff may not tell anyone that a person is a patient. The patient may give written permission. A relative\'s request is not enough. Policy: (1) Staff may not tell anyone that a person is a patient. (2) The patient may give written permission. (3) A relative\'s request is enough.', '(3) A relative\'s request is enough.', 'privacy', ['(1) Staff may not tell anyone that a person is a patient.', '(2) The patient may give written permission.']],
]);

const B5: Record<string, QaItem[]> = { say5: QA_SAY5, phone5: QA_PHONE5, mail5: QA_MAIL5, letter5: QA_LETTER5, gap5: QA_GAP5, proof5: QA_PROOF5 };

const T5: TaskTemplate[] = [
  { id: 'ct5_sort', rank: 5, arch: 'sort', say: 'The inspector is coming. Please put each case or paper where it belongs, and read with care.', count: [4, 5], bins: ['insurance', 'records', 'pay', 'referral', 'older', 'mind', 'ear', 'women', 'urgent', 'sameday', 'booked'],
    patterns: [
      { text: 'A letter in which the insurer refuses a claim and explains the appeal procedure', bins: ['insurance'] }, { text: 'A claim form with the insurer\'s stamp on it', bins: ['insurance'] }, { text: 'I wish to appeal against my insurer\'s decision', bins: ['insurance'] }, { text: 'The insurer asks whether the condition existed before the member joined', bins: ['insurance'] }, { text: 'My cover has lapsed, and I should like to renew it', bins: ['insurance'] },
      { text: 'A request that the patient\'s file be sent to a court', bins: ['records'] }, { text: 'The file of a patient who has moved to another town', bins: ['records'] }, { text: 'A patient\'s written consent to the release of her file', bins: ['records'] }, { text: 'I wish to see everything that you hold about me', bins: ['records'] }, { text: 'Please correct the date of birth in my records', bins: ['records'] },
      { text: 'I wish to pay the excess on my claim', bins: ['pay'] }, { text: 'A receipt for the excess on the claim', bins: ['pay'] }, { text: 'A statement of the amount that the insurer has paid so far this year', bins: ['pay'] }, { text: 'I dispute the charge for a missed appointment', bins: ['pay'] }, { text: 'May I pay my share of the bill in three parts?', bins: ['pay'] },
      { text: 'A letter asking the hospital to admit a patient for surgery', bins: ['referral'] }, { text: 'A letter that asks the hospital to see a patient within a week', bins: ['referral'] }, { text: 'A letter from the specialist who would like to see {Ken|@} for a second opinion', bins: ['referral'] }, { text: 'The doctor wishes to refer a patient to a heart specialist', bins: ['referral'] },
      { text: 'An elderly woman who has lost her way in the corridor', bins: ['older'] }, { text: 'An eighty-year-old man who has been confused since the morning', bins: ['older'] }, { text: 'An old man who can no longer climb the stairs to his flat', bins: ['older'] }, { text: 'A woman of ninety whose daughter wishes to discuss her care', bins: ['older'] },
      { text: 'I have been unable to work because of severe anxiety', bins: ['mind'] }, { text: 'A young man who says that he can not stop thinking about harming himself', bins: ['mind'] }, { text: 'A teacher who has felt exhausted and unable to cope for weeks', bins: ['mind'] }, { text: 'I can no longer sleep, and I am afraid of going out', bins: ['mind'] },
      { text: 'A woman who has lost the hearing in one ear since last night', bins: ['ear'] }, { text: 'A boy who has had pain in both ears for three days', bins: ['ear'] }, { text: 'I have had a blocked nose and a loss of smell for weeks', bins: ['ear'] }, { text: 'A man whose voice has been weak for two months', bins: ['ear'] },
      { text: 'I should like a check before the birth of my second child', bins: ['women'] }, { text: 'A woman who is thirty-six weeks pregnant and has felt no movement today', bins: ['women'] }, { text: 'I would like advice on the change of life', bins: ['women'] }, { text: 'I need the test that is offered to women over fifty', bins: ['women'] },
      { text: 'A man who says that he has taken an overdose of his tablets', bins: ['urgent'] }, { text: 'A child who has swallowed a coin and can not breathe well', bins: ['urgent'] }, { text: 'A woman with a sudden pain in her chest, who is pale and sweating', bins: ['urgent'] },
      { text: 'A woman whose wound is red, hot and painful since this morning', bins: ['sameday'] }, { text: 'A man whose wound has begun to bleed again after treatment yesterday', bins: ['sameday'] }, { text: 'A girl with a high fever that began last night', bins: ['sameday'] },
      { text: 'A man who would like to discuss a long-standing back problem next month', bins: ['booked'] }, { text: 'A woman who wishes to arrange her yearly check-up', bins: ['booked'] }, { text: 'Someone who asks for the first free appointment in three weeks', bins: ['booked'] },
    ] },
  { id: 'ct5_terms', rank: 5, arch: 'check', say: 'The insurer has sent its terms. Please check my summary of the terms.', fields: [
    { id: 'prem', label: 'Yearly premium', values: ['360 coins', '480 coins', '840 coins', '1,200 coins'] },
    { id: 'ded', label: 'Excess on each claim', values: ['15 coins', '50 coins', '150 coins'] },
    { id: 'limit', label: 'Limit a year', values: ['2,500 coins', '5,000 coins', '10,000 coins'] },
  ], docs: [{ kind: 'card', title: 'Terms', fields: ['prem', 'ded', 'limit'] }, { kind: 'letter', title: 'Summary', fields: ['prem', 'ded', 'limit'] }], target: 1, pWrong: 0.7 },
  { id: 'ct5_pay', rank: 5, arch: 'check', say: 'The insurer pays after the excess is taken off. Please check the amount in my letter.', fields: [
    { id: 'cost', label: 'Cost', range: [200, 600, 100], fmt: '{n} coins' },
    { id: 'ex', label: 'Excess', values: ['50 coins'] },
    { id: 'paid', label: 'Insurer pays', calc: 'cost - 50', fmt: '{n} coins' },
  ], docs: [{ kind: 'card', title: 'Claim', fields: ['cost', 'ex', 'paid'] }, { kind: 'letter', title: 'Letter to the patient', fields: ['cost', 'ex', 'paid'] }], target: 1, pWrong: 0.7, wrongable: ['cost', 'paid'] },
  { id: 'ct5_refusal', rank: 5, arch: 'check', say: 'The insurer has refused a claim. Please check my summary of its letter.', fields: [
    { id: 'what', label: 'Claim for', values: ['the operation on March 9', 'the scan on April 2', 'the treatment on May 20'] },
    { id: 'why', label: 'Reason', values: ['the condition existed before he joined', 'the treatment is not covered', 'the form was sent late'] },
    { id: 'appeal', label: 'Appeal within', values: ['fourteen days', 'thirty days', 'sixty days', 'ninety days'] },
  ], docs: [{ kind: 'note', title: 'The insurer\'s letter', fields: ['what', 'why', 'appeal'] }, { kind: 'letter', title: 'Summary', fields: ['what', 'why', 'appeal'] }], target: 1, pWrong: 0.7 },
  { id: 'ct5_trial', rank: 5, arch: 'check', say: 'Please check the trial schedule on the card against the information sheet.', fields: [
    { id: 'start', label: 'First visit', values: ['May 6', 'June 3', 'July 8'] },
    { id: 'end', label: 'Last visit', values: ['July 29', 'August 26', 'September 30'] },
    { id: 'pay', label: 'Travel costs', values: ['paid by the clinic', 'paid by the patient', 'shared equally'] },
  ], docs: [{ kind: 'note', title: 'Information sheet', fields: ['start', 'end', 'pay'] }, { kind: 'card', title: 'Schedule on the card', fields: ['start', 'end', 'pay'] }], target: 1, pWrong: 0.7 },
  { id: 'ct5_class', rank: 5, arch: 'check', say: 'The inspector wants the vaccination figures. Please check my table against the register.', fields: [
    { id: 'a', label: 'Class 3', values: ['28 of 30 children', '26 of 30 children', '30 of 30 children'] },
    { id: 'b', label: 'Class 4', values: ['25 of 31 children', '29 of 31 children', '31 of 31 children'] },
    { id: 'c', label: 'Class 5', values: ['29 of 29 children', '27 of 29 children', '24 of 29 children'] },
  ], docs: [{ kind: 'note', title: 'Register', fields: ['a', 'b', 'c'] }, { kind: 'letter', title: 'My table', fields: ['a', 'b', 'c'] }], target: 1, pWrong: 0.7 },
  { id: 'ct5_report', rank: 5, arch: 'check', say: 'The reaction must be reported to the regulator. Please check the report against my note.', fields: [
    { id: 'who', label: 'Patient', values: ['{Grandma Rose|@}', '{Mr. Grant|@}', '{Professor Hale|@}'] },
    { id: 'drug', label: 'Medicine', values: ['one tablet a day', 'two tablets a day', 'one capsule at night'] },
    { id: 'what', label: 'Reaction', values: ['feeling dizzy for an hour', 'a rash for two days', 'a headache for a day'] },
    { id: 'when', label: 'Began', values: ['two days after the first dose', 'two hours after the first dose', 'two weeks after the first dose'] },
  ], docs: [{ kind: 'note', title: 'Doctor\'s note', fields: ['who', 'drug', 'what', 'when'] }, { kind: 'letter', title: 'Report to the regulator', fields: ['who', 'drug', 'what', 'when'] }], target: 1, pWrong: 0.7 },
  { id: 'ct5_pad', rank: 5, arch: 'respond', mode: 'form', kind: 'phone', features: ['audioOnly'], say: 'Someone is calling. Please write down every detail.',
    lines: ['Good morning. This is {who}.', 'The {what} of {patient} will be heard on {day}.', 'Please confirm that the clinic will send its notes by {by}.'],
    fields: [
      { id: 'who', label: 'Caller', values: ['{Ms. Lund|@}', '{Ms. Hart|@}', '{Mr. Okoye|@}'] },
      { id: 'what', label: 'Case', values: ['appeal', 'complaint', 'claim'] },
      { id: 'patient', label: 'Of', values: ['{Mr. Grant|@}', '{Mrs. Hill|@}', '{Ken|@}', '{Nora|@}'] },
      { id: 'day', label: 'Heard on', values: ['May 12', 'June 3', 'July 21'] },
      { id: 'by', label: 'Notes by', values: ['May 5', 'May 26', 'July 7'] },
    ] },
  { id: 'ct5_book', rank: 5, arch: 'respond', mode: 'slot', kind: 'memo', say: 'Please look at the book. When can the patient come?', layout: 'calendar', rows: DAYS5, cols: TIMES4, cellTags: { t9: ['morning'], t11: ['morning'], t1: ['afternoon'], t3: ['afternoon'] },
    want: [
      { tag: 'tue', text: 'The nurse for the trial is available on Tuesday.' }, { tag: 'thu', text: 'The specialist comes only on Thursday.' }, { tag: 'fri', text: 'The patient asks for Friday.' }, { tag: 'wed', text: 'The patient can come on Wednesday.' }, { tag: 'mon', text: 'The patient can come on Monday.' },
      { tag: 'morning', text: 'A long first visit needs a morning with no other appointment after it.' }, { tag: 'afternoon', text: 'The patient needs an appointment late in the day.' }, { tag: 't9', text: 'The patient needs the earliest time.' },
    ],
    avoid: [{ tag: 'mon', text: 'The specialist does not come on Monday.' }, { tag: 'wed', text: 'The scan room is closed on Wednesday.' }, { tag: 'fri', text: 'The scan room closes at four on Friday.' }, { tag: 'thu', text: 'The clinic holds Thursday for the vaccination week.' }, { tag: 't11', text: 'The patient has another visit at eleven.' }],
    busy: ['Busy', 'Full', 'Busy', 'Full'], open: ['Dear {Ms. Vega|@},'], close: ['Thank you.'] },
  { id: 'ct5_say', rank: 5, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'say5' },
  { id: 'ct5_phone', rank: 5, arch: 'respond', mode: 'choose', kind: 'phone', bank: 'phone5', features: ['audioOnly'] },
  { id: 'ct5_mail', rank: 5, arch: 'respond', mode: 'choose', kind: 'email', bank: 'mail5' },
  { id: 'ct5_letter', rank: 5, arch: 'respond', mode: 'choose', kind: 'letter', bank: 'letter5' },
  { id: 'ct5_gap', rank: 5, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'gap5' },
  { id: 'ct5_proof', rank: 5, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'proof5' },
];

// ---------------------------------------------------------------------------------------------- notices and triage (ranks 3-5)
// Leaflets pinned in the waiting room and the questions of triage: reception reads what is written and answers in kind.

const QA_NOTICE3 = bank(3, [
  ['If you have a cough and a fever, please wear a mask in the waiting room.', 'I see. I will wear a mask in the waiting room.', 'mask', ['I see. I will take off my mask in the waiting room.', 'I see. I will wear a mask in the car.']],
  ['Please bring a sample in the small bottle for your test on Tuesday.', 'Thank you. I will bring a sample in the small bottle on Tuesday.', 'sample', ['Thank you. I will bring a sample in the big bottle on Tuesday.', 'Thank you. I will bring a sample in the small bottle on Friday.']],
  ['Please do not eat or drink anything after midnight before the scan.', 'I understand. I will not eat or drink after midnight.', 'scan', ['I understand. I will eat and drink after midnight.', 'I understand. I will not eat or drink before midnight.']],
  ['Cough, sneeze or sore throat? Wash your hands often and stay at home if you can.', 'Yes. I will wash my hands often and stay at home if I can.', 'hygiene', ['Yes. I will wash my hands rarely and stay at home if I can.', 'Yes. I will wash my hands often and go to work if I can.']],
  ['The blood pressure check takes five minutes, and you do not need to book.', 'Good. I can come for the blood pressure check without booking.', 'pressure', ['Good. I must book a week before the blood pressure check.', 'Good. I can come for the blood pressure check, but it takes an hour.']],
  ['A wound must be cleaned and covered with a bandage every day.', 'I will clean my wound and cover it with a bandage every day.', 'wound', ['I will clean my wound and leave it open every day.', 'I will cover my wound with a bandage every week.']],
  ['An antibiotic must be taken until the box is empty, even if you feel better.', 'I will take the antibiotic until the box is empty.', 'antibiotic', ['I will stop taking the antibiotic when I feel better.', 'I will take the antibiotic until the box is full.']],
  ['Children with an infection must stay away from school until the doctor says that they may return.', 'Yes. My child will stay at home until the doctor says that he may return.', 'school', ['Yes. My child will go to school until the doctor says that he may return.', 'Yes. My child will stay at home until the teacher says that he may return.']],
  ['If your face turns red and you can not breathe, call the clinic at once.', 'I will call the clinic at once if my face turns red and I can not breathe.', 'allergy', ['I will call the clinic next week if my face turns red and I can not breathe.', 'I will not call the clinic if my face turns red and I can not breathe.']],
  ['The vitamin tablets are not paid for by insurance, but you may buy them at the pharmacy.', 'I see. The insurance does not pay for the vitamin tablets, so I will buy them at the pharmacy.', 'vitamin', ['I see. The insurance pays for the vitamin tablets, so I will buy them at the pharmacy.', 'I see. The insurance does not pay for the vitamin tablets, so I will buy them at the bank.']],
]);

const QA_NOTICE4 = bank(4, [
  ['Patients with a chronic illness may collect repeat prescriptions without seeing the doctor, provided that the last visit was within six months.', 'I understand. I may collect my repeat prescription without seeing the doctor, because I was here three months ago.', 'chronic', ['I understand. I may collect my repeat prescription without seeing the doctor, because I was here a year ago.', 'I understand. I must see the doctor to collect my repeat prescription, because I was here three months ago.']],
  ['The outpatient clinic is on the second floor, and patients who use a wheelchair should take the lift beside the entrance.', 'Thank you. My father uses a wheelchair, so I shall take him in the lift beside the entrance to the second floor.', 'lift', ['Thank you. My father uses a wheelchair, so I shall take him up the stairs beside the entrance to the second floor.', 'Thank you. My father uses a wheelchair, so I shall take him in the lift beside the entrance to the first floor.']],
  ['Test results are given by telephone only to the patient, after the caller has answered three questions about his or her records.', 'I see. I must answer three questions about my records before the clinic gives me my test results by telephone.', 'phone', ['I see. My neighbour may telephone for my test results, without answering any questions.', 'I see. I must answer ten questions about my records before the clinic gives me my test results by telephone.']],
  ['Patients who miss two appointments in a row without notice may be asked to find another clinic.', 'I understand. If I miss two appointments in a row without telling you, I may have to find another clinic.', 'missed', ['I understand. If I miss two appointments in a row without telling you, I may stay at this clinic.', 'I understand. If I miss ten appointments in a row without telling you, I may have to find another clinic.']],
  ['A diagnosis is never given at the front desk, even if the patient insists; the doctor will explain the results in person.', 'I see. The receptionist can not explain my diagnosis, so I shall wait for the doctor to explain the results in person.', 'diagnosis', ['I see. The receptionist can explain my diagnosis, so I shall not wait for the doctor.', 'I see. The receptionist can not explain my diagnosis, so I shall wait for the nurse to explain my bill.']],
  ['Pregnant women should tell the staff before any scan, and a nurse will explain which scans are safe.', 'Thank you. I am pregnant, so I shall tell the staff before my scan, and a nurse will explain which scans are safe.', 'pregnant', ['Thank you. I am pregnant, so I shall not tell the staff before my scan.', 'Thank you. I am pregnant, so I shall tell the staff after my scan, and a nurse will explain which scans are safe.']],
  ['Patients discharged from hospital should book a visit within a week, so that the doctor may check their recovery.', 'I understand. I was discharged on Monday, so I shall book a visit within a week for a check of my recovery.', 'discharge', ['I understand. I was discharged on Monday, so I shall book a visit within a month for a check of my recovery.', 'I understand. I was discharged on Monday, so I shall not book a visit for a check of my recovery.']],
  ['The clinic keeps a record of every drug that a patient has had a bad reaction to, and asks about it at each visit.', 'Thank you. I had a bad reaction to a drug last year, so I shall expect the clinic to ask me about it at each visit.', 'reaction', ['Thank you. I had a bad reaction to a drug last year, so I shall expect the clinic never to ask me about it.', 'Thank you. I had a bad reaction to a drug last year, so I shall expect the pharmacy to ask me about it at each visit.']],
]);

const QA_NOTICE5 = bank(5, [
  ['Notice: in the event of an outbreak, the clinic reserves the right to restrict visitors and to isolate any patient who shows symptoms of the disease.', 'Understood. If there is an outbreak, the clinic may restrict visitors and isolate patients with symptoms.', 'outbreak', ['Understood. If there is an outbreak, the clinic may not restrict visitors or isolate patients with symptoms.', 'Understood. If there is an outbreak, the clinic may restrict visitors and isolate patients without symptoms.']],
  ['Notice: the clinic shall not be held liable for loss or damage to the property of patients left in the waiting room.', 'I see. The clinic is not responsible for my property if I leave it in the waiting room.', 'liability', ['I see. The clinic is responsible for my property if I leave it in the waiting room.', 'I see. The clinic is not responsible for my property if I leave it in the car park.']],
  ['Notice: patients who have been in contact with a person with a serious disease are asked to stay at home and telephone the clinic before they visit.', 'Understood. If I have been in contact with a person with a serious disease, I shall stay at home and telephone before I visit.', 'contact', ['Understood. If I have been in contact with a person with a serious disease, I shall visit at once and not telephone.', 'Understood. If I have been in contact with a person with a serious disease, I shall stay at home and telephone after I visit.']],
  ['Notice: the information that patients give in the course of a trial is anonymous, and no individual will be named in any published report.', 'I understand. My answers in the trial are anonymous, and no individual will be named in a published report.', 'trial', ['I understand. My answers in the trial are not anonymous, and every individual will be named in a published report.', 'I understand. My answers in the trial are anonymous, and one individual will be named in a published report.']],
  ['Notice: a patient who disputes a bill may ask for it to be reviewed within thirty days, and payment is suspended while the review takes place.', 'Understood. I may ask for my bill to be reviewed within thirty days, and I need not pay while the review takes place.', 'bill', ['Understood. I may ask for my bill to be reviewed within three days, and I need not pay while the review takes place.', 'Understood. I may ask for my bill to be reviewed within thirty days, but I must pay while the review takes place.']],
  ['Notice: the clinic will accept a claim for reimbursement only if it is accompanied by the original receipt and the insurer\'s form.', 'I understand. To get my money back, I must send the original receipt together with the insurer\'s form.', 'claim', ['I understand. To get my money back, I may send a copy of the receipt without the insurer\'s form.', 'I understand. To get my money back, I must send the original receipt together with the doctor\'s form.']],
  ['Notice: vaccination is voluntary, but patients who decline it are asked to sign a statement that they have been informed of the risks.', 'Understood. Vaccination is voluntary, but if I decline it I must sign a statement that I have been informed of the risks.', 'vaccine', ['Understood. Vaccination is compulsory, but if I decline it I must sign a statement that I have been informed of the risks.', 'Understood. Vaccination is voluntary, and if I decline it I need not sign anything.']],
  ['Notice: the minors\' ward is for children under fourteen; older children are treated in the main wards, in the presence of a parent or guardian.', 'I understand. My daughter is fifteen, so she will be treated in the main ward, with a parent or guardian present.', 'ward', ['I understand. My daughter is fifteen, so she will be treated in the minors\' ward, with a parent or guardian present.', 'I understand. My daughter is fifteen, so she will be treated in the main ward, without a parent or guardian present.']],
]);

const BX: Record<string, QaItem[]> = { notice3: QA_NOTICE3, notice4: QA_NOTICE4, notice5: QA_NOTICE5 };

const TX: TaskTemplate[] = [
  { id: 'ct3_notice', rank: 3, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'notice3' },
  { id: 'ct4_notice', rank: 4, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'notice4' },
  { id: 'ct5_notice', rank: 5, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'notice5' },
  { id: 'ct3_triage', rank: 3, arch: 'sort', say: 'The waiting room is filling up. Who must be seen first? Please sort them.', count: [4, 5], bins: ['urgent', 'sameday', 'booked'],
    patterns: [
      { text: 'My husband has chest pain and is sweating', bins: ['urgent'] }, { text: 'My daughter has swallowed some pills', bins: ['urgent'] }, { text: 'A man has fainted in the waiting room', bins: ['urgent'] }, { text: 'My son hit his head and keeps vomiting', bins: ['urgent'] }, { text: 'She has cut her hand badly, and it will not stop bleeding', bins: ['urgent'] }, { text: 'My grandfather can not speak properly all of a sudden', bins: ['urgent'] },
      { text: 'My son has had a high fever since last night', bins: ['sameday'] }, { text: 'I have a sharp pain in my ear', bins: ['sameday'] }, { text: 'My ankle hurts, and I can not stand on it', bins: ['sameday'] }, { text: 'I have been sick all night and can not drink', bins: ['sameday'] }, { text: 'My daughter was stung by a bee on the face, and it is red', bins: ['sameday'] }, { text: 'I think that I have an infection in my eye', bins: ['sameday'] },
      { text: 'I would like to discuss my cholesterol', bins: ['booked'] }, { text: 'I need a repeat prescription for my tablets', bins: ['booked'] }, { text: 'I want a check-up before I travel', bins: ['booked'] }, { text: 'I would like a blood pressure check', bins: ['booked'] }, { text: 'My knee has hurt for months, but I can walk', bins: ['booked'] }, { text: 'I want to ask about the flu vaccination', bins: ['booked'] },
    ] },
  { id: 'ct4_triage', rank: 4, arch: 'sort', say: 'The waiting room is full. Who must be seen first? Please sort them by what they say.', count: [4, 5], bins: ['urgent', 'sameday', 'booked'],
    patterns: [
      { text: 'My wife has a sudden, severe headache and can not see clearly', bins: ['urgent'] }, { text: 'My baby has a high fever and will not wake', bins: ['urgent'] }, { text: 'A bee stung my neck, and my throat feels tight', bins: ['urgent'] }, { text: 'My father fell down the stairs and can not move his leg', bins: ['urgent'] }, { text: 'I took a double dose of my tablets by mistake', bins: ['urgent'] },
      { text: 'My daughter has had a rash and a fever since yesterday', bins: ['sameday'] }, { text: 'The wound on my hand is hot, red and painful', bins: ['sameday'] }, { text: 'My ear has hurt all night, and I can not hear well', bins: ['sameday'] }, { text: 'I have had nausea and diarrhea for two days and feel weak', bins: ['sameday'] }, { text: 'My son\'s asthma is worse than usual, but he can talk', bins: ['sameday'] },
      { text: 'I should like my diabetes to be checked this month', bins: ['booked'] }, { text: 'I would like to talk about stopping smoking', bins: ['booked'] }, { text: 'I need a letter for my insurer about an old injury', bins: ['booked'] }, { text: 'My back has been stiff for weeks, but it is no worse', bins: ['booked'] }, { text: 'I would like advice about vitamins for my children', bins: ['booked'] },
    ] },
  { id: 'ct5_triage', rank: 5, arch: 'sort', say: 'The inspector is watching how we place patients. Please sort them by what they report.', count: [4, 5], bins: ['urgent', 'sameday', 'booked'],
    patterns: [
      { text: 'A man with crushing pain in his chest that spreads to his arm', bins: ['urgent'] }, { text: 'A child who has stopped responding and is breathing very slowly', bins: ['urgent'] }, { text: 'A woman who is bleeding heavily after giving birth', bins: ['urgent'] }, { text: 'A patient who took an overdose of her tablets and is now drowsy', bins: ['urgent'] }, { text: 'A man who has collapsed and can not be woken', bins: ['urgent'] },
      { text: 'A woman with a high fever, severe vomiting and a stiff neck since this morning', bins: ['sameday'] }, { text: 'A boy whose hand hurts more and more since the cast was put on', bins: ['sameday'] }, { text: 'A man with a fever whose wound has begun to leak', bins: ['sameday'] }, { text: 'A patient with diabetes who feels faint and has missed a meal', bins: ['sameday'] },
      { text: 'A patient who wishes to discuss the long-term care of her painful joints', bins: ['booked'] }, { text: 'A man who requests a routine review of his blood pressure treatment', bins: ['booked'] }, { text: 'A woman who asks for a referral that is not urgent', bins: ['booked'] }, { text: 'A parent who wishes to discuss the vaccination schedule for a newborn', bins: ['booked'] },
    ] },
];

// ---------------------------------------------------------------------------------------------- more forms (ranks 3-5)
// Referral cards with the part of the body, the leaflet with the warnings on a medicine, the clauses of the scheme.

const TY: TaskTemplate[] = [
  { id: 'ct3_body', rank: 3, arch: 'check', say: 'The doctor wrote a card for the scan room. Please check it against his note.', fields: [
    { id: 'who', label: 'Patient', values: ['{Big Joe|@}', '{Grandma Rose|@}', '{Mrs. Hill|@}', '{Captain Reed|@}', '{Ken|@}'] },
    { id: 'part', label: 'Part of the body', values: ['the left knee', 'the right shoulder', 'the neck', 'the right ankle', 'the lower back', 'the left wrist', 'the right hip', 'the left elbow'] },
    { id: 'test', label: 'Test', values: ['a scan', 'an ultrasound'] },
  ], docs: [{ kind: 'note', title: 'Doctor\'s note', fields: ['who', 'part', 'test'] }, { kind: 'card', title: 'Card for the scan room', fields: ['who', 'part', 'test'] }], target: 1, pWrong: 0.7 },
  { id: 'ct4_leaflet', rank: 4, arch: 'check', say: 'The pharmacist has written the warning on the label. Please check it against the doctor\'s note.', fields: [
    { id: 'drug', label: 'Medicine', values: ['tablets', 'a syrup', 'capsules'] },
    { id: 'warn', label: 'Warning', values: ['may make you drowsy', 'must be taken with food', 'must not be taken with alcohol'] },
    { id: 'long', label: 'Use for no more than', values: ['three days', 'one week', 'two weeks', 'one month'] },
  ], docs: [{ kind: 'note', title: 'Doctor\'s note', fields: ['drug', 'warn', 'long'] }, { kind: 'label', title: 'Label', fields: ['drug', 'warn', 'long'] }], target: 1, pWrong: 0.7 },
  { id: 'ct5_clause', rank: 5, arch: 'check', say: 'The inspector asked for the clauses of the scheme. Please check my summary against the booklet.', fields: [
    { id: 'wait', label: 'Waiting period', values: ['three months', 'six months', 'twelve months'] },
    { id: 'excl', label: 'Not covered', values: ['cosmetic surgery', 'old injuries', 'treatment abroad', 'glasses and contact lenses'] },
    { id: 'elig', label: 'Eligible from the age of', values: ['sixteen', 'eighteen', 'twenty-one'] },
    { id: 'ben', label: 'Benefit for a hospital stay', values: ['40 coins a night', '60 coins a night', '80 coins a night'] },
  ], docs: [{ kind: 'card', title: 'Booklet', fields: ['wait', 'excl', 'elig', 'ben'] }, { kind: 'letter', title: 'Summary', fields: ['wait', 'excl', 'elig', 'ben'] }], target: 1, pWrong: 0.7 },
  { id: 'ct3_symptom', rank: 3, arch: 'sort', say: 'Please send each patient to the right place. Listen to what they say.', count: [4, 5], bins: ['children', 'skin', 'heart', 'bones', 'eye', 'dental', 'general'],
    patterns: [
      { text: 'My baby has a fever and will not feed', bins: ['children'] }, { text: 'My son is five and has a cold that will not go away', bins: ['children'] }, { text: 'My little girl has a sore stomach and feels sick', bins: ['children'] },
      { text: 'I have a rash that spreads when I scratch', bins: ['skin'] }, { text: 'There is a red mark on my arm that is getting bigger', bins: ['skin'] }, { text: 'My skin burns after a day in the sun', bins: ['skin'] },
      { text: 'My heart jumps when I climb the stairs', bins: ['heart'] }, { text: 'I feel faint when I stand up, and my chest is tight', bins: ['heart'] }, { text: 'My blood pressure has been high for a month', bins: ['heart'] },
      { text: 'I twisted my ankle, and it hurts to walk', bins: ['bones'] }, { text: 'My shoulder is stiff, and I can not lift my arm', bins: ['bones'] }, { text: 'I fell on my wrist, and it hurts when I turn it', bins: ['bones'] },
      { text: 'Everything is blurred when I read', bins: ['eye'] }, { text: 'My eye is red, and the light hurts it', bins: ['eye'] }, { text: 'I see spots in front of my eyes', bins: ['eye'] },
      { text: 'My gum bleeds when I brush my teeth', bins: ['dental'] }, { text: 'I broke a tooth when I bit a hard sweet', bins: ['dental'] }, { text: 'A filling has fallen out of my tooth', bins: ['dental'] },
      { text: 'I have had a headache and a bad cough for a week', bins: ['general'] }, { text: 'I feel tired all the time, and I do not know why', bins: ['general'] }, { text: 'I have a sore throat and a high temperature', bins: ['general'] },
    ] },
  { id: 'ct4_symptom', rank: 4, arch: 'sort', say: 'Please send each patient to the right desk. Think about what the patient says first.', count: [4, 5], bins: ['ear', 'women', 'mind', 'older', 'heart', 'skin', 'bones', 'blood'],
    patterns: [
      { text: 'I keep getting infections in my ear', bins: ['ear'] }, { text: 'My nose has been blocked for a month', bins: ['ear'] }, { text: 'I have lost my voice, and my throat is sore', bins: ['ear'] },
      { text: 'My period is very late, and I might be pregnant', bins: ['women'] }, { text: 'I have a lump in my breast and would like it checked', bins: ['women'] }, { text: 'I need the check that is offered after a baby is born', bins: ['women'] },
      { text: 'I can not stop worrying, and I do not enjoy anything', bins: ['mind'] }, { text: 'I have panic attacks on the bus', bins: ['mind'] }, { text: 'Since my husband died I can not sleep', bins: ['mind'] },
      { text: 'My grandmother forgets where she lives', bins: ['older'] }, { text: 'My father is eighty and falls a lot', bins: ['older'] }, { text: 'An old man who can no longer manage his medicine', bins: ['older'] },
      { text: 'My pulse is very fast, and I get dizzy', bins: ['heart'] }, { text: 'I have pain in my chest when I exercise', bins: ['heart'] }, { text: 'My legs are tired and swell by the evening', bins: ['heart'] },
      { text: 'I have a mole that has changed in size', bins: ['skin'] }, { text: 'I have a dry, rough patch on my elbow', bins: ['skin'] }, { text: 'My child has a rash after taking the medicine', bins: ['skin'] },
      { text: 'I broke my arm last month, and it still hurts', bins: ['bones'] }, { text: 'My knee gives way when I go down the stairs', bins: ['bones'] }, { text: 'The doctor says that I need a scan of my spine', bins: ['bones'] },
      { text: 'I have come for the blood test that the doctor asked for', bins: ['blood'] }, { text: 'I must give a blood sample before I eat', bins: ['blood'] }, { text: 'The laboratory asked me to come back for a second sample', bins: ['blood'] },
    ] },
];

// ---------------------------------------------------------------------------------------------- which desk? (ranks 3-5)
// A patient says what is wrong; reception names the desk that the paper says is for it (never a diagnosis).

const QA_DESK3 = bank(3, [
  ['My knee hurts when I climb the stairs. Which desk should I go to?', 'Please go to the Bone clinic about your knee.', 'knee', ['Please go to the Eye clinic about your knee.', 'Please go to the Bone clinic about your eyes.']],
  ['My gums bleed when I brush my teeth. Where do I go?', 'You need the Dentist, because of your gums.', 'gum', ['You need the Heart clinic, because of your gums.', 'You need the Dentist, because of your knees.']],
  ['I have a red mark on my neck that is getting bigger.', 'Please go to the Skin clinic about the mark on your neck.', 'skin', ['Please go to the Dentist about the mark on your neck.', 'Please go to the Skin clinic about the mark on your foot.']],
  ['My little daughter has a stomach ache and a fever. She is three.', 'Please take your daughter of three to the Children\'s clinic.', 'child', ['Please take your daughter of three to the Heart clinic.', 'Please take your son of three to the Children\'s clinic.']],
  ['Everything looks blurred when I read the small print.', 'You need the Eye clinic, because everything looks blurred.', 'eye', ['You need the Dentist, because everything looks blurred.', 'You need the Eye clinic, because everything sounds blurred.']],
  ['I get pains in my chest when I run for the bus.', 'Please go to the Heart clinic about the pains in your chest.', 'heart', ['Please go to the Eye clinic about the pains in your chest.', 'Please go to the Heart clinic about the pains in your back.']],
  ['I fell on my wrist when I slipped on the ice.', 'Please go to the Bone clinic about your wrist.', 'wrist', ['Please go to the Skin clinic about your wrist.', 'Please go to the Bone clinic about your ankle.']],
  ['My throat is sore, and I have a headache and a cough.', 'Please see the General clinic about your sore throat.', 'throat', ['Please see the Dentist about your sore throat.', 'Please see the General clinic about your sore knee.']],
  ['I have had a toothache since last night, and my cheek is red.', 'You need the Dentist for your toothache.', 'tooth', ['You need the Skin clinic for your toothache.', 'You need the Dentist for your earache.']],
  ['My son hit his shoulder in the game, and he can not lift his arm.', 'Please take your son to the Bone clinic about his shoulder.', 'shoulder', ['Please take your son to the Eye clinic about his shoulder.', 'Please take your son to the Bone clinic about his hip.']],
]);

const QA_DESK4 = bank(4, [
  ['I have had a blocked nose and a loss of smell since the winter. Which desk is for that?', 'The Ear, nose and throat desk is for a blocked nose and a loss of smell.', 'nose', ['The Eye clinic is for a blocked nose and a loss of smell.', 'The Ear, nose and throat desk is for a broken nose and a loss of taste.']],
  ['I am expecting a baby in June and would like to be seen.', 'Please go to Women\'s health, because your baby is due in June.', 'pregnant', ['Please go to the Bone clinic, because your baby is due in June.', 'Please go to Women\'s health, because your baby is due in March.']],
  ['For months I have felt anxious and unable to sleep, and I should like to talk to someone.', 'Please go to Mental health, where someone will talk to you about feeling anxious.', 'mind', ['Please go to the Skin clinic, where someone will talk to you about feeling anxious.', 'Please go to Mental health, where someone will talk to you about your broken sleep.']],
  ['My grandmother is ninety-one and has become very confused. We do not know whom to ask.', 'The Older people desk is for a patient of ninety-one who has become confused.', 'older', ['The Children\'s clinic is for a patient of ninety-one who has become confused.', 'The Older people desk is for a patient of nineteen who has become confused.']],
  ['A mole on my back has changed in shape and color, and it itches.', 'The Skin clinic will look at a mole that has changed in shape and color.', 'skin', ['The Dentist will look at a mole that has changed in shape and color.', 'The Skin clinic will look at a mole that has changed in shape and size.']],
  ['My pulse races at night, and I wake up with a pounding heart.', 'The Heart clinic is the place for a racing pulse and a pounding heart at night.', 'heart', ['The Bone clinic is the place for a racing pulse and a pounding heart at night.', 'The Heart clinic is the place for a slow pulse and a pounding heart at night.']],
  ['I broke my wrist in the autumn, and it still aches in the cold.', 'The Bone clinic can look at a wrist that was broken in the autumn.', 'bones', ['The Eye clinic can look at a wrist that was broken in the autumn.', 'The Bone clinic can look at an ankle that was broken in the autumn.']],
  ['My ear has been blocked since my cold, and I can not hear my own voice.', 'The Ear, nose and throat desk can see you about a blocked ear.', 'ear', ['The Dentist can see you about a blocked ear.', 'The Ear, nose and throat desk can see you about a blocked eye.']],
  ['I have lost my appetite and feel weak, and I am seventy-eight.', 'Please go to the Older people desk, because you are seventy-eight and have lost your appetite.', 'weak', ['Please go to the Children\'s clinic, because you are seventy-eight and have lost your appetite.', 'Please go to the Older people desk, because you are seventy-eight and have lost your hearing.']],
  ['I should like to talk to a woman doctor about the change of life.', 'Women\'s health can arrange for you to talk to a woman doctor about the change of life.', 'women', ['The Dentist can arrange for you to talk to a woman doctor about the change of life.', 'Women\'s health can arrange for you to talk to a man doctor about the change of life.']],
]);

const QA_DESK5 = bank(5, [
  ['Since the accident I have been unable to walk without a stick, and my hip aches at night.', 'The Bone clinic is the right desk for a hip that aches since the accident.', 'hip', ['The Eye clinic is the right desk for a hip that aches since the accident.', 'The Bone clinic is the right desk for a hip that aches since the wedding.']],
  ['I am thirty-six weeks pregnant, and I have not felt the baby move today.', 'This is urgent, so Women\'s health will see you at once, because you have not felt the baby move today.', 'urgent', ['This is not urgent, so Women\'s health will see you next month, because you have not felt the baby move today.', 'This is urgent, so the Dentist will see you at once, because you have not felt the baby move today.']],
  ['My father has become quiet and sad since the winter, and he refuses to eat.', 'Mental health and the Older people desk can both help, since your father is quiet and sad and refuses to eat.', 'older', ['The Dentist and the Eye clinic can both help, since your father is quiet and sad and refuses to eat.', 'Mental health and the Older people desk can both help, since your father is happy and refuses to eat.']],
  ['I have had a persistent cough and a weak voice for two months.', 'The Ear, nose and throat desk is the right place for a persistent cough and a weak voice.', 'cough', ['The Skin clinic is the right place for a persistent cough and a weak voice.', 'The Ear, nose and throat desk is the right place for a persistent cough and a weak knee.']],
  ['My son has a rash that spreads and a high fever, and he is very drowsy.', 'This is urgent, so please take your son to urgent care at once.', 'urgent2', ['This is not urgent, so please book your son for next month.', 'This is urgent, so please take your son to the Dentist at once.']],
  ['The skin doctor wrote that I need a test of a mole. Who arranges that?', 'The Referrals desk arranges the test that the specialist has asked for.', 'referral', ['The Payments desk arranges the test that the specialist has asked for.', 'The Referrals desk arranges the test that the nurse has refused.']],
  ['After the operation my wound is red, hot and painful, and I have a temperature.', 'Please come in today, because a wound that is red, hot and painful after an operation needs to be seen.', 'wound', ['Please come in next month, because a wound that is red, hot and painful after an operation needs to be seen.', 'Please come in today, because a wound that is clean and does not hurt after an operation needs to be seen.']],
  ['I have a shortness of breath on the stairs, and my ankles swell by evening.', 'The Heart clinic can see a patient who is short of breath on the stairs and whose ankles swell.', 'breath', ['The Dentist can see a patient who is short of breath on the stairs and whose ankles swell.', 'The Heart clinic can see a patient who is short of breath on the stairs and whose teeth swell.']],
]);

const BD: Record<string, QaItem[]> = { desk3: QA_DESK3, desk4: QA_DESK4, desk5: QA_DESK5 };
const TD: TaskTemplate[] = [
  { id: 'ct3_desk', rank: 3, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'desk3' },
  { id: 'ct4_desk', rank: 4, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'desk4' },
  { id: 'ct5_desk', rank: 5, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'desk5' },
];

// ---------------------------------------------------------------------------------------------- what patients ask (ranks 3-5)
// Questions about the scheme, the medicine and the staff, answered from the notice board.

const QA_ASK3 = bank(3, [
  ['I have diabetes, and I must eat at regular times. Can I wait inside with a snack?', 'Yes. You may eat a snack in the waiting room, because you have diabetes.', 'diabetes', ['No. You may not eat a snack in the waiting room, because you have diabetes.', 'Yes. You may eat a snack in the waiting room, because you have a cold.']],
  ['Who is the surgeon that will see my husband about his back on Friday?', 'The surgeon who will see your husband on Friday is {Dr. Patel|@}.', 'surgeon', ['The surgeon who will see your husband on Friday is {Dr. Moreau|@}.', 'The surgeon who will see your wife on Friday is {Dr. Patel|@}.']],
  ['My muscles ache after the exercises that the therapist gave me. Whom should I tell?', 'Please tell the nurse at the desk about your aching muscles.', 'muscle', ['Please tell the dentist at the desk about your aching muscles.', 'Please tell the nurse at the desk about your aching eyes.']],
  ['I have a long list of side effects from my tablets. May I leave it for the doctor?', 'Of course. You may leave your list of side effects for the doctor.', 'side effect', ['Of course. You may leave your list of tablets for the dentist.', 'I am sorry. You may not leave your list of side effects for the doctor.']],
  ['My lungs were checked last year. Where do I find the result?', 'Your lung result is in your file, and the desk will give you a copy.', 'lung', ['Your lung result is in the pharmacy, and the desk will give you a copy.', 'Your lung result is in your file, and the desk will not give you a copy.']],
  ['I must buy a bandage and a cream. Does the pharmacist sell them without a prescription?', 'Yes. The pharmacist sells bandages and creams without a prescription.', 'cream', ['No. The pharmacist sells bandages and creams only with a prescription.', 'Yes. The pharmacist sells bandages and creams without a receipt.']],
]);

const QA_ASK4 = bank(4, [
  ['My doctor said that I have asthma. Can I borrow a spare mask at the desk?', 'Yes. The desk has spare masks for patients with asthma.', 'asthma', ['Yes. The desk has spare masks for patients with diabetes.', 'No. The desk has no spare masks for patients with asthma, but you may ask the nurse.']],
  ['Do you have a midwife here, or must I go to the hospital for my check-ups?', 'Yes. A midwife comes on Wednesdays, so you need not go to the hospital for check-ups.', 'midwife', ['Yes. A midwife comes on Wednesdays, so you must go to the hospital for check-ups.', 'Yes. A midwife comes on Sundays, so you need not go to the hospital for check-ups.']],
  ['I am a chronic patient with high cholesterol. How often must I have my blood tested?', 'Patients with high cholesterol are asked to have their blood tested every six months.', 'cholesterol', ['Patients with high cholesterol are asked to have their blood tested every six weeks.', 'Patients with high cholesterol are asked to have their eyes tested every six months.']],
  ['My insurance premium has risen by ten percent. Does the clinic set it?', 'No. The insurer, and not the clinic, sets the premium.', 'premium', ['Yes. The clinic, and not the insurer, sets the premium.', 'No. The insurer, and not the clinic, sets the doctor.']],
  ['I should like a second opinion from another specialist. Is that allowed under the scheme?', 'Yes. The scheme pays for a second opinion from another specialist, if the first doctor agrees.', 'opinion', ['No. The scheme pays for a second opinion from another specialist, if the first doctor agrees.', 'Yes. The scheme pays for a second opinion from another dentist, if the first doctor agrees.']],
  ['I am eligible for a free check-up, I believe, because I am over seventy. Is that correct?', 'Yes. Patients over seventy are eligible for a free yearly check-up.', 'eligible', ['No. Patients over seventeen are eligible for a free yearly check-up.', 'Yes. Patients over seventy are eligible for a free monthly check-up.']],
  ['The nurse said that I may need physical therapy for my back. Who arranges it?', 'The Referrals desk arranges physical therapy once the doctor has written a letter.', 'therapy', ['The Payments desk arranges physical therapy once the doctor has written a letter.', 'The Referrals desk arranges physical therapy before the doctor has written a letter.']],
  ['After my surgery I need a wheelchair for a week. Can the clinic lend me one?', 'Yes. The clinic lends wheelchairs for up to a week after surgery, free of charge.', 'wheelchair', ['No. The clinic lends wheelchairs for up to a week after surgery, free of charge.', 'Yes. The clinic lends wheelchairs for up to a week after surgery, for a fee of ten coins.']],
  ['I have a nut allergy, and I should like a note about it on my records.', 'Certainly. We shall record your nut allergy on your records, and the doctor will see the note.', 'allergy', ['Certainly. We shall record your milk allergy on your records, and the doctor will see the note.', 'Certainly. We shall not record your nut allergy on your records.']],
  ['An infection has spread to my kidneys, my doctor said. Should I come at once?', 'I can not advise you, but I shall ask a nurse to call you about the infection at once.', 'infection', ['I can advise you that the infection is not serious, so you need not come.', 'I can not advise you, but I shall ask a nurse to call you about the infection next month.']],
]);

const QA_ASK5 = bank(5, [
  ['I should like to know whether the scheme covers rehabilitation after a stroke, and for how long.', 'The scheme covers rehabilitation after a stroke, and the booklet states the length of cover.', 'rehab', ['The scheme does not cover rehabilitation after a stroke, and the booklet states the length of cover.', 'The scheme covers rehabilitation after a fracture, and the booklet states the length of cover.']],
  ['Is a patient entitled to refuse a vaccination on religious grounds, and would that affect cover?', 'A patient may decline a vaccination on religious grounds, and it does not affect cover.', 'refuse', ['A patient may not decline a vaccination on religious grounds, and it does not affect cover.', 'A patient may decline a vaccination on religious grounds, and it ends cover.']],
  ['Has the clinic a policy on the disclosure of results to a spouse who telephones?', 'Results are never disclosed to a spouse who telephones, unless the patient has given written consent.', 'disclosure', ['Results are always disclosed to a spouse who telephones, even if the patient has not given written consent.', 'Results are never disclosed to a spouse who telephones, unless the spouse has given written consent.']],
  ['What are the grounds on which an adverse reaction must be reported to the regulator?', 'Any serious adverse reaction to a medicine must be reported to the regulator within fifteen days.', 'adverse', ['Any mild adverse reaction to a medicine must be reported to the regulator within fifty days.', 'Any serious adverse reaction to a medicine must be reported to the insurer within fifteen days.']],
  ['I believe that the protocol for hand washing was not followed. To whom do I complain?', 'You may complain to the manager, who will review whether the protocol for hand washing was followed.', 'protocol', ['You may complain to the pharmacist, who will review whether the protocol for hand washing was followed.', 'You may complain to the manager, who will review whether the hands were washed with soap.']],
  ['My daughter is a minor. May she consent to treatment without me, if she is fifteen?', 'The rules require a parent or guardian to consent for a daughter of fifteen, except in special cases.', 'minor', ['The rules allow a daughter of fifteen to consent without a parent or guardian in every case.', 'The rules require a parent or guardian to consent for a daughter of fifty, except in special cases.']],
  ['Will the quarantine at the school affect the clinic\'s opening hours?', 'The quarantine at the school will not affect the clinic\'s opening hours, but visitors must wear a mask.', 'quarantine', ['The quarantine at the school will close the clinic for a month, and visitors must wear a mask.', 'The quarantine at the clinic will not affect the school\'s opening hours, but visitors must wear a mask.']],
  ['Is the clinic obliged to keep my records after I move away, and for how long?', 'The clinic is obliged to keep your records for ten years after your last visit.', 'records', ['The clinic is not obliged to keep your records after your last visit.', 'The clinic is obliged to keep your records for one year after your last visit.']],
]);

const BW: Record<string, QaItem[]> = { ask3: QA_ASK3, ask4: QA_ASK4, ask5: QA_ASK5 };
const TW: TaskTemplate[] = [
  { id: 'ct3_ask', rank: 3, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'ask3' },
  { id: 'ct4_ask', rank: 4, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'ask4' },
  { id: 'ct5_ask', rank: 5, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'ask5' },
];

// ---------------------------------------------------------------------------------------------- what hurts? (ranks 3-5)
// Patients name the part of the body; reception repeats it back and names the right place, nothing more.


const QA_BODY2 = bank(2, [
  ['I hurt my elbow when I fell off my bicycle.', 'I am sorry. Please sit down, and the nurse will look at your elbow.', 'elbow', ['I am sorry. Please sit down, and the nurse will look at your knee.', 'I am glad. Please sit down, and the nurse will look at your elbow.']],
  ['My toe is very sore, and I can not put my shoe on.', 'Please take a seat. The nurse will look at your toe soon.', 'toe', ['Please take a seat. The nurse will look at your finger soon.', 'Please go home. The nurse will not look at your toe.']],
  ['I have a pain in my stomach after lunch every day.', 'Please see the General clinic about your stomach.', 'stomach', ['Please see the Dentist about your stomach.', 'Please see the General clinic about your shoulder.']],
  ['My ear hurts, and I can not hear well on the left side.', 'Please see the General clinic about your left ear.', 'ear', ['Please see the General clinic about your right ear.', 'Please see the Eye clinic about your left ear.']],
  ['My back hurts, and I can not turn my head.', 'The Bone clinic can see you about your back and neck.', 'back', ['The Dentist can see you about your back and neck.', 'The Bone clinic can see you about your hands and feet.']],
  ['I have a cut on my leg, and the skin around it is red.', 'Please show the nurse the cut on your leg.', 'cut', ['Please show the nurse the cut on your arm.', 'Please do not show the nurse the cut on your leg.']],
]);

const QA_BODY3 = bank(3, [
  ['I burned my thumb on the stove, and it hurts a lot.', 'I am sorry. Please sit down, and the nurse will look at your thumb.', 'burn', ['I am sorry. Please sit down, and the nurse will look at your toe.', 'I am glad. Please sit down, and the nurse will look at your thumb.']],
  ['I have cut my finger badly, and it is bleeding through the cloth.', 'Please keep your finger up and come to the nurse at once.', 'cut', ['Please keep your finger down and come to the nurse next week.', 'Please keep your toe up and come to the nurse at once.']],
  ['My son has a bruise on his heel after the game, and he limps.', 'Please bring your son to the nurse about the bruise on his heel.', 'bruise', ['Please bring your son to the dentist about the bruise on his heel.', 'Please bring your son to the nurse about the bruise on his lip.']],
  ['I keep sneezing, and my eyes itch every spring.', 'Please take a seat. The General clinic can see you about your sneezing and your itching eyes.', 'sneeze', ['Please take a seat. The Dentist can see you about your sneezing and your itching eyes.', 'Please take a seat. The General clinic can see you about your sneezing and your itching knees.']],
  ['I fainted in the shop this morning, and my head hurts where I hit the floor.', 'Please sit down and stay with the nurse, because you fainted and hit your head.', 'faint', ['Please go home and stay away from the nurse, because you fainted and hit your head.', 'Please sit down and stay with the nurse, because you fainted and hit your foot.']],
  ['My jaw clicks, and it hurts when I open my mouth wide.', 'You need the Dentist, because of the pain in your jaw.', 'jaw', ['You need the Eye clinic, because of the pain in your jaw.', 'You need the Dentist, because of the pain in your leg.']],
]);

const QA_BODY4 = bank(4, [
  ['The pain begins in my spine and goes down my leg when I bend over.', 'The Bone clinic is the right desk for pain that begins in the spine and goes down the leg.', 'spine', ['The Eye clinic is the right desk for pain that begins in the spine and goes down the leg.', 'The Bone clinic is the right desk for pain that begins in the neck and goes down the arm.']],
  ['My joints are stiff in the morning, and my fingers are sore. Whom do I see?', 'The doctor, who may send you to the Bone clinic, will see you about your stiff joints.', 'joint', ['The dentist, who may send you to the Bone clinic, will see you about your stiff joints.', 'The doctor, who may send you to the Bone clinic, will see you about your stiff teeth.']],
  ['I have had a pain under my ribs since I ate, and I feel sick.', 'Please sit down. The General clinic will see you about the pain under your ribs.', 'rib', ['Please go home. The General clinic will not see you about the pain under your ribs.', 'Please sit down. The Dentist will see you about the pain under your ribs.']],
  ['My nerve pain wakes me at night, and my toes are numb.', 'The doctor can see you about the nerve pain that wakes you at night and the numb toes.', 'nerve', ['The dentist can see you about the nerve pain that wakes you at night and the numb toes.', 'The doctor can see you about the nerve pain that wakes you at night and the numb ears.']],
  ['My temperature is high, and I keep shivering and sweating.', 'Please sit down and let the nurse take your temperature.', 'temperature', ['Please go home and let the nurse take your temperature.', 'Please sit down and let the nurse take your pulse.']],
  ['I have a cough that brings up blood, and I am very frightened.', 'This is urgent. Please go to urgent care at once, because you are coughing up blood.', 'blood', ['This is not urgent. Please go to urgent care next month, because you are coughing up blood.', 'This is urgent. Please go to the Dentist at once, because you are coughing up blood.']],
]);

const QA_BODY5 = bank(5, [
  ['A sudden weakness in my arm and a drooping lip, which have not gone away since the morning.', 'This is an emergency, so please go to urgent care at once, because of the sudden weakness in your arm.', 'stroke', ['This is not an emergency, so please book a visit for next month, because of the sudden weakness in your arm.', 'This is an emergency, so please go to the Dentist at once, because of the sudden weakness in your arm.']],
  ['I have been told to fast for twelve hours before the test. May I drink water?', 'I can not advise you, but I shall ask the nurse to tell you whether you may drink water before the test.', 'fast', ['I can advise you that you may drink water before the test, so you need not ask.', 'I can not advise you, but I shall ask the nurse to tell you whether you may drink water after the test.']],
  ['The liver test showed something unusual, my doctor said, and I am to see a specialist.', 'The Referrals desk will arrange for you to see a specialist about the result of the liver test.', 'liver', ['The Payments desk will arrange for you to see a specialist about the result of the liver test.', 'The Referrals desk will arrange for you to see a specialist about the result of the eye test.']],
  ['My kidneys were scanned last month, and I should like the images sent to my new doctor.', 'We shall send the images of your kidney scan to your new doctor once you have signed the consent form.', 'kidney', ['We shall send the images of your kidney scan to your new doctor without a consent form.', 'We shall send the images of your kidney scan to your neighbour once you have signed the consent form.']],
  ['My head was scanned after the fall, and nobody has told me the result.', 'We shall ask the doctor to contact you about the result of the scan of your head after the fall.', 'skull', ['We shall ask the dentist to contact you about the result of the scan of your head after the fall.', 'We shall ask the doctor to contact you about the result of the scan of your foot after the fall.']],
  ['A tumor was found in my breast, and I am to start treatment, but I do not know the date.', 'I am very sorry. We shall ask the specialist\'s office to give you the date of the start of your treatment.', 'tumour', ['I am very glad. We shall ask the specialist\'s office to give you the date of the start of your treatment.', 'I am very sorry. We shall ask the specialist\'s office to give you the date of the end of your treatment.']],
]);

const BB: Record<string, QaItem[]> = { body2: QA_BODY2, body3: QA_BODY3, body4: QA_BODY4, body5: QA_BODY5 };
const TB: TaskTemplate[] = [
  { id: 'ct2_body', rank: 2, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'body2' },
  { id: 'ct3_body2', rank: 3, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'body3' },
  { id: 'ct4_body2', rank: 4, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'body4' },
  { id: 'ct5_body2', rank: 5, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'body5' },
];

// ---------------------------------------------------------------------------------------------- families on the card (ranks 3-5)
// Who is covered, who may sign, whom the desk may speak to.

const QA_FAM3 = bank(3, [
  ['My grandchild is staying with me, and she has a stomach ache. Can I bring her without her parents?', 'Yes. You may bring your grandchild, and the desk will call her parents.', 'grandchild', ['No. You may not bring your grandchild, and the desk will call her parents.', 'Yes. You may bring your grandchild, and the desk will call her teacher.']],
  ['My cousin is a nurse, and she would like to wait with me. Is that all right?', 'Yes. Your cousin may wait with you in the waiting room.', 'cousin', ['No. Your cousin may not wait with you in the waiting room.', 'Yes. Your cousin may wait with you in the pharmacy.']],
  ['My twins are two years old. Can both of them be seen on the same morning?', 'Yes. Both of your twins can be seen on the same morning.', 'twins', ['Yes. Only one of your twins can be seen on the same morning.', 'Yes. Both of your twins can be seen on the same evening.']],
  ['My relative from abroad is visiting, and she has a bad cough. Is she covered?', 'No. A visitor from abroad is not covered by our insurance card, but she may pay for the visit.', 'relative', ['Yes. A visitor from abroad is covered by our insurance card, but she may pay for the visit.', 'No. A visitor from abroad is not covered by our insurance card, so she may not see the doctor.']],
  ['My toddler has swallowed a button. He is eighteen months old.', 'Please come to urgent care at once with your toddler of eighteen months.', 'toddler', ['Please come to the Dentist at once with your toddler of eighteen months.', 'Please come to urgent care next week with your toddler of eighteen months.']],
  ['I am the adult daughter of a patient, and I would like to sit in with my mother.', 'Of course. Your mother may choose to have her daughter sit in with her.', 'adult', ['Of course. Your mother may choose to have her neighbour sit in with her.', 'I am sorry. Your mother may not have her daughter sit in with her.']],
]);

const QA_FAM4 = bank(4, [
  ['My spouse and I are both on one insurance card. Do we each need an appointment?', 'Yes. You and your spouse each need an appointment, even though you share one card.', 'spouse', ['No. You and your spouse each need an appointment, even though you share one card.', 'Yes. You and your neighbour each need an appointment, even though you share one card.']],
  ['My grandson is a teenager, and he does not want me in the room. May he see the doctor alone?', 'A teenager may ask to see the doctor alone, if the doctor agrees.', 'teen', ['A teenager must always be seen with a parent, even if the doctor agrees.', 'A teenager may ask to see the doctor alone, if the dentist agrees.']],
  ['I am a dependent on my father\'s scheme, and I have just turned twenty-six. Am I still covered?', 'Children are covered by a parent\'s scheme until the age of twenty-five, so you will need a scheme of your own.', 'dependent', ['Children are covered by a parent\'s scheme until the age of twenty-eight, so you will not need a scheme of your own.', 'Children are covered by a parent\'s scheme until the age of twenty-five, so you will need a scheme for your father.']],
  ['My newborn was discharged yesterday, and the nurse told me to book a weight check. When?', 'Please book the weight check of your newborn within a week of the discharge.', 'newborn', ['Please book the weight check of your newborn within a year of the discharge.', 'Please book the weight check of your newborn within a week of the birthday.']],
]);

const QA_FAM5 = bank(5, [
  ['A patient says that the clinic was negligent and wants a settlement. To whom should she write?', 'She should write to the manager, who will pass her claim of negligence to the insurer.', 'negligence', ['She should write to the pharmacist, who will pass her claim of negligence to the insurer.', 'She should write to the manager, who will pass her claim of negligence to the patient.']],
  ['A journalist asks about a patient. Does the ethics code allow the clinic to confirm her name?', 'No. The ethics code does not allow staff to confirm a patient\'s name to a journalist, because it is confidential.', 'ethics', ['Yes. The ethics code allows staff to confirm a patient\'s name to a journalist, because it is confidential.', 'No. The ethics code does not allow staff to confirm a journalist\'s name to a patient, because it is confidential.']],
  ['I am the guardian of a child who has no parents. Which papers must I show to sign the consent form?', 'You must show the court paper that names you as guardian before you sign the consent form for the child.', 'guardian', ['You need show nothing before you sign the consent form for the child.', 'You must show the court paper that names you as guardian after you sign the consent form for the child.']],
  ['I hold power of attorney for my uncle, who has dementia. May I ask for his records?', 'You may ask for your uncle\'s records, if you show the paper that gives you power of attorney.', 'attorney', ['You may not ask for your uncle\'s records, even if you show the paper that gives you power of attorney.', 'You may ask for your uncle\'s records, if you show the paper that gives you a bus pass.']],
  ['My late wife\'s file is still here. As her widower, may I have a copy?', 'I am sorry for your loss. You may ask for a copy of your wife\'s file, and the manager will tell you what is needed.', 'widower', ['I am glad for your loss. You may ask for a copy of your wife\'s file, and the manager will tell you what is needed.', 'I am sorry for your loss. You may not ask for a copy of your wife\'s file.']],
  ['Our daughter was adopted, and her old records carry another name. Can they be joined to the new file?', 'We shall ask the manager how the old records of an adopted child can be joined to the new file.', 'adopt', ['We shall join the old records of an adopted child to the new file without asking anyone.', 'We shall ask the manager how the new records of an adopted child can be joined to the old file.']],
]);

const BF: Record<string, QaItem[]> = { fam3: QA_FAM3, fam4: QA_FAM4, fam5: QA_FAM5 };
const TF: TaskTemplate[] = [
  { id: 'ct3_fam', rank: 3, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'fam3' },
  { id: 'ct4_fam', rank: 4, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'fam4' },
  { id: 'ct5_fam', rank: 5, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'fam5' },
];

// ---------------------------------------------------------------------------------------------- the waiting room, second batch (ranks 2-5)
// More patients and papers for the desks: the trade's own words (symptoms, tests, medicines, insurance, records).

const cpats = (bin: string, texts: string[]) => texts.map((text) => ({ text, bins: [bin] }));

const SORT_C2 = [
  ...cpats('skin', ['I have an itchy rash on my arm', 'A blister has appeared on my heel', 'The sunburn on my back is very painful', 'My skin is dry and red']),
  ...cpats('bones', ['I think that I have sprained my ankle', 'My wrist hurts after the fall', 'I have a pain in my hip', 'My shoulder is stiff in the morning']),
  ...cpats('heart', ['My heart beats very fast at night', 'I have a pain in my chest when I climb the stairs', 'My blood pressure is high']),
  ...cpats('pharmacy', ['I need some cough medicine', 'I would like a bandage and some ointment', 'Please fill my prescription', 'Do you have painkillers for a headache?']),
  ...cpats('pay', ['I would like to pay my bill', 'Could I have a receipt, please?', 'How much is the visit?', 'May I pay by card?']),
  ...cpats('general', ['I have had a sore throat for a week', 'I have a bad cold and a cough', 'My stomach has hurt since last night', 'I feel tired all the time']),
  ...cpats('children', ['My baby has a fever', 'My son has a rash and will not eat', 'My daughter needs her check for school', 'My toddler has an ear ache']),
];

const SORT_C3 = [
  ...cpats('blood', ['I am here for my cholesterol test', 'I must not eat before my blood test', 'The nurse will take a blood sample for the sugar test', 'The doctor suspects anemia and wants my blood checked']),
  ...cpats('scan', ['I have an appointment for an ultrasound', 'The doctor wants a scan of my knee', 'I am here for the scan of my lungs', 'The scan of my back is booked for ten o\'clock']),
  ...cpats('pharmacy', ['I need a refill of my inhaler', 'I would like to collect my antibiotics', 'Could I have more of my insulin, please?', 'Is there a cheaper generic version of this tablet?']),
  ...cpats('pay', ['I would like to pay the copayment', 'I need an itemized invoice for my employer', 'Could I pay the balance in two installments?', 'My bill is higher than I expected']),
  ...cpats('shots', ['My daughter is due for her tetanus shot', 'I would like a flu shot before the winter', 'My son is due for his measles shot', 'The nurse will give my baby her booster']),
  ...cpats('urgent', ['My father is having trouble breathing', 'A child has swallowed a battery', 'She is bleeding badly and feels faint', 'I think that he has broken his leg, and the bone is showing']),
  ...cpats('records', ['I would like a copy of my medical records', 'Please send my file to my new doctor', 'My address has changed, and I must update my file', 'I need a letter for my employer to confirm my visit']),
  ...cpats('insurance', ['I would like to check my coverage for physiotherapy', 'My insurer needs a claim form', 'Is a stay in hospital covered by my policy?', 'My insurance card has expired']),
  ...cpats('dental', ['My wisdom tooth is aching', 'I have lost a filling', 'My gums bleed when I brush', 'I need a cleaning and a check for my teeth']),
  ...cpats('eye', ['I have blurred vision in my left eye', 'My eyes are red and watery', 'I need new glasses', 'Something is stuck in my eye']),
];

const SORT_C4 = [
  ...cpats('ear', ['I have had ringing in my ears for a week', 'My tonsils are swollen, and I can not swallow', 'I have a blocked nose and pain in my sinuses', 'My hearing is getting worse, and I would like a hearing test']),
  ...cpats('women', ['I would like to book a prenatal check', 'I would like advice about contraception', 'I need a smear test', 'I would like to discuss the menopause']),
  ...cpats('mind', ['I have not been sleeping, and I feel anxious all the time', 'My teenage son seems very depressed', 'I would like to see a counselor about stress', 'I keep having panic attacks at work']),
  ...cpats('older', ['My mother has dementia and wanders at night', 'My father has had several falls this winter', 'I look after my elderly aunt and need a home visit', 'My mother can not walk and needs a visit at home']),
  ...cpats('referral', ['My doctor has referred me to a cardiologist', 'I need a referral to a dermatologist', 'The specialist asks for a letter from my doctor', 'I am waiting for a referral to a physiotherapist']),
  ...cpats('records', ['May I see my test results online?', 'I wish to correct a mistake in my medical history', 'I would like my records transferred to another clinic', 'I need my discharge summary from the hospital']),
  ...cpats('insurance', ['My claim was rejected for lack of prior authorization', 'I do not understand the deductible on my policy', 'My employer has changed the insurer', 'I am a policyholder, and I wish to add my spouse']),
  ...cpats('pay', ['I would like to settle the outstanding balance', 'I was charged twice for the same visit', 'Is there a discount for patients on a low income?', 'May I pay the fee in installments?']),
  ...cpats('urgent', ['My husband has slurred speech and a drooping face', 'A man has collapsed and is not responding', 'My wife is having a severe allergic reaction', 'He has taken an overdose of his pills']),
  ...cpats('sameday', ['My son has had a fever and a cough for two days', 'I think that I have a urinary infection', 'My child has been vomiting since the morning', 'The wound is oozing and has a bad smell']),
  ...cpats('booked', ['I would like a routine physical', 'I would like to discuss my cholesterol results', 'I need my yearly review for my asthma', 'I want a check before I start running']),
];

const SORT_C5 = [
  ...cpats('insurance', ['The insurer disputes that the condition existed before the policy began', 'The claim for reimbursement was denied on the ground of an exclusion', 'I wish to appeal against the insurer\'s decision', 'The policy lapsed because the premium was not paid', 'The insurer asks for an itemized statement of the treatment', 'My coverage excludes elective procedures']),
  ...cpats('records', ['The patient requests that her records be amended', 'A lawyer asks for a certified copy of the file', 'The patient withdraws her consent to the sharing of her data', 'The hospital requires a discharge summary and a list of medications', 'The patient asks who has viewed her records']),
  ...cpats('pay', ['The patient disputes the charge for a missed appointment', 'The invoice includes a fee that was waived', 'A refund is due after the insurer has paid', 'The patient requests a payment plan for the outstanding balance', 'The card payment was declined']),
  ...cpats('referral', ['The patient needs a referral to an oncologist', 'The orthopedic surgeon asks for the scan results', 'A second opinion has been requested before the operation', 'The referral expired before the appointment', 'The specialist is booked up for six weeks']),
  ...cpats('older', ['The patient\'s carer asks about respite care', 'The family wishes to arrange palliative care at home', 'A frail patient has been discharged without a care plan', 'The widow is unable to manage her medication', 'An elderly patient is confused and unable to consent']),
  ...cpats('mind', ['The patient reports persistent insomnia and low mood', 'A teenager is struggling with an eating disorder', 'The patient requests therapy after a bereavement', 'He describes recurring nightmares since the accident', 'A carer reports burnout']),
  ...cpats('ear', ['The patient suffers from chronic sinusitis', 'A child\'s tonsillectomy is scheduled', 'The audiologist asks for a report on the hearing test', 'The patient complains of vertigo and a ringing in the ear', 'The patient wishes to discuss an operation on the nasal septum']),
  ...cpats('women', ['The patient is in the third trimester and asks about the maternity unit', 'A patient requests a mammogram', 'The midwife asks for the antenatal notes', 'The patient reports irregular periods and fatigue', 'A patient asks about fertility treatment']),
  ...cpats('urgent', ['The patient shows the signs of a stroke', 'The man has gone into anaphylactic shock', 'A woman has fainted in the waiting room and is pale and cold', 'The child is having a seizure', 'The patient is coughing up blood']),
  ...cpats('sameday', ['The patient has a suspected infection at the site of the surgery', 'The child has a high fever and a rash that does not fade', 'The patient has been vomiting for twenty-four hours and can not keep down fluids', 'A patient with a cast reports numbness in the fingers', 'A patient with diabetes has an ulcer on the foot that is spreading']),
  ...cpats('booked', ['The patient wishes to discuss the long-term management of arthritis', 'A routine review of the thyroid medication is due', 'A patient requests a screening for cholesterol', 'The patient asks about the vaccination schedule for a trip abroad', 'The patient wishes to discuss weight management']),
];

const TZ: TaskTemplate[] = [
  { id: 'ct2_sort2', rank: 2, arch: 'sort', say: 'More patients have come in. Where does each one go?', count: [4, 5], bins: ['skin', 'bones', 'heart', 'pharmacy', 'pay', 'general', 'children'], patterns: SORT_C2 },
  { id: 'ct3_sort2', rank: 3, arch: 'sort', say: 'The desk is busy this morning. Please send each patient or paper where it belongs.', count: [4, 5], bins: ['blood', 'scan', 'pharmacy', 'pay', 'shots', 'urgent', 'records', 'insurance', 'dental', 'eye'], patterns: SORT_C3 },
  { id: 'ct4_sort2', rank: 4, arch: 'sort', say: 'Another busy morning. Please send each patient or paper to the desk that fits.', count: [4, 5], bins: ['ear', 'women', 'mind', 'older', 'referral', 'records', 'insurance', 'pay', 'urgent', 'sameday', 'booked'], patterns: SORT_C4 },
  { id: 'ct5_sort2', rank: 5, arch: 'sort', say: 'The auditor has asked for the day\'s cases. Please place each one with care.', count: [4, 5], bins: ['insurance', 'records', 'pay', 'referral', 'older', 'mind', 'ear', 'women', 'urgent', 'sameday', 'booked'], patterns: SORT_C5 },
];

// ---------------------------------------------------------------------------------------------- the waiting room, third batch (ranks 3-5)

const SORT_C3B = [
  ...cpats('general', ['I have heartburn after every meal', 'I have been constipated for a week', 'I get terrible migraines', 'My hay fever is worse this year', 'I have a lump in my neck']),
  ...cpats('skin', ['I have eczema on my hands again', 'I came out in hives after dinner', 'I have a boil on my neck', 'A wart on my foot is painful']),
  ...cpats('bones', ['I think that I have a fracture in my wrist', 'I have cramps in my legs at night', 'My knee gives way on the stairs', 'I need a splint for my finger']),
  ...cpats('children', ['My daughter has chickenpox', 'My baby is teething and will not sleep', 'I think that my son has mumps', 'My toddler has a cough that sounds like a bark']),
  ...cpats('pharmacy', ['I need cough syrup for my son', 'Do you sell lozenges for a sore throat?', 'I need an antihistamine for my allergy', 'I would like plasters and antiseptic cream']),
  ...cpats('urgent', ['A man has a deep cut, and the blood will not stop', 'My baby is blue around the lips', 'My mother has a pain in her chest, and her arm is numb', 'My friend hit his head, and he is vomiting and confused']),
  ...cpats('records', ['Could I have a medical certificate for work?', 'I need a sick note for my school', 'I need proof of my visit for my employer', 'Please add my next of kin to my file']),
  ...cpats('pay', ['I would like to pay the surcharge for the weekend visit', 'There is a mistake on my bill', 'I wish to pay in cash', 'Could the bill be put in my husband\'s name?']),
  ...cpats('shots', ['My son needs a booster for whooping cough', 'I need a rabies shot after the dog bite', 'I would like a hepatitis vaccine before my trip', 'I have come for the pneumonia vaccine']),
  ...cpats('eye', ['I see flashing lights in my eye', 'My eyelid is swollen', 'I need contact lenses', 'I have a stye on my eyelid']),
  ...cpats('insurance', ['I need the claim number for my insurer', 'The adjuster wants a copy of the report', 'Is the excess on my policy a large amount?', 'The insurer asks for the date of the accident']),
];

const SORT_C4B = [
  ...cpats('ear', ['My child has recurring ear infections', 'My voice has been hoarse for a month', 'My ears feel blocked after the flight', 'I have a nosebleed that keeps coming back', 'I snore loudly and seem to stop breathing at night']),
  ...cpats('women', ['I am due to give birth next month and need to register', 'I would like a pregnancy test', 'I have severe period pain', 'I would like to arrange a breast check', 'I am breastfeeding and have a question']),
  ...cpats('mind', ['I can not cope since the divorce', 'My daughter is afraid to leave the house', 'I have lost my appetite and my motivation', 'I think that I am addicted to my sleeping pills', 'I keep having flashbacks']),
  ...cpats('older', ['My father has had a stroke and needs a rehabilitation program', 'My mother is incontinent and needs a nurse to visit', 'My mother is eighty-five and needs a visit at home', 'A caregiver asks about a nursing home', 'My grandmother forgets to take her pills']),
  ...cpats('referral', ['The surgeon asks for a letter before the operation', 'I need a referral to a urologist', 'I have been referred for a biopsy', 'My doctor has recommended a second opinion', 'My referral to the neurologist has been delayed']),
  ...cpats('records', ['I request the transfer of my vaccination certificate', 'I need a copy of my blood test results', 'The result of my biopsy has not reached my doctor', 'I would like to see who has access to my file', 'Please correct the spelling of my surname']),
  ...cpats('insurance', ['The adjuster wants a statement from the doctor', 'My premium has gone up this year', 'My claim has been pending for three months', 'I want to know whether the clause covers surgery abroad', 'I am the claimant, and I have lost the form']),
  ...cpats('pay', ['I am entitled to a refund', 'I wish to dispute the late fee', 'The invoice shows a charge for a test that I did not have', 'May I have a statement of my account?', 'I overpaid by mistake']),
  ...cpats('urgent', ['My son has had an allergic reaction to a peanut', 'She is having a seizure', 'He is choking on a piece of meat', 'A man has a deep burn on his arm', 'My wife has severe abdominal pain and is vomiting']),
  ...cpats('sameday', ['My daughter has a sore throat and swollen glands', 'I have had diarrhea for three days', 'I think that my child has an infection in the chest, and he has a fever', 'I have a sharp pain in my side', 'The bite on my leg is swollen and hot']),
  ...cpats('booked', ['I would like to review my blood pressure tablets', 'I would like a review of my asthma tablets', 'I would like a hearing test for my father', 'I need a health check for my new job', 'I want to talk about losing weight']),
];

const SORT_C5B = [
  ...cpats('insurance', ['The adjuster has requested the full file', 'The underwriter has excluded the condition', 'The insurer alleges that the patient failed to disclose a condition', 'The claim was rejected because the treatment was not approved in advance', 'The patient wishes to lodge a complaint with the ombudsman', 'Liability for the delay lies with the insurer']),
  ...cpats('records', ['The patient asks for her records to be anonymized for the study', 'The court has ordered the clinic to disclose the file', 'The patient wants to know how long the clinic retains her data', 'The pathology report has not been filed', 'A transcript of the consultation is requested']),
  ...cpats('pay', ['The patient has overpaid and seeks reimbursement', 'The insurer\'s remittance does not match the invoice', 'There is a billing error on the invoice', 'A debt collector has contacted the patient', 'The patient is exempt from charges']),
  ...cpats('referral', ['The patient was referred to a neurologist for a tremor', 'A urologist has asked for the results of the kidney tests', 'The consultant requests the patient\'s full history', 'The patient wants a referral to a fertility specialist', 'The waiting time for the specialist exceeds the target']),
  ...cpats('older', ['The patient is bedridden and needs a home visit', 'The son is the legal guardian and signs for the patient', 'The patient needs help with bathing and dressing', 'The care home requests the patient\'s medication chart', 'The patient has fallen again, and the carer is worried']),
  ...cpats('mind', ['The patient is suffering from chronic anxiety and panic', 'A teenage patient refuses to eat', 'The patient is in counseling and asks for a longer session', 'The patient reports persistent fatigue and a loss of interest', 'The patient requests an assessment for attention problems']),
  ...cpats('ear', ['The patient has waited since May for a hearing test', 'The patient has had repeated infections of the middle ear for years', 'The patient requires a hearing aid', 'The patient had a perforated eardrum years ago and asks for a check of her hearing', 'The patient has persistent tonsillitis']),
  ...cpats('women', ['The patient is expecting twins', 'A patient asks for a cervical screening', 'The patient has complications after a cesarean section', 'The patient requests a breast examination', 'The midwife asks for the booking notes for the birth next month']),
  ...cpats('urgent', ['The patient has gone into cardiac arrest', 'The child is unconscious after a fall from the harbour wall', 'A woman is hemorrhaging', 'The patient is having an asthma attack and can not speak', 'The patient has taken a lethal dose of her medication']),
  ...cpats('sameday', ['The patient has a fever after returning from abroad', 'The patient has a wound that is infected and swollen', 'The child has an abscess that is getting larger', 'The patient reports a painful, swollen calf after a long flight', 'The patient has a severe migraine that tablets do not relieve']),
  ...cpats('booked', ['The patient wishes to discuss the results of the biopsy', 'A routine mammogram is due', 'The patient requests an annual review of her inhaler', 'A patient requests a health check for her new employer', 'The patient asks about physical therapy after the operation']),
];

const TZ2: TaskTemplate[] = [
  { id: 'ct3_sort3', rank: 3, arch: 'sort', say: 'The waiting room is full again. Please send each patient or paper where it belongs.', count: [4, 5], bins: ['general', 'skin', 'bones', 'children', 'pharmacy', 'urgent', 'records', 'pay', 'shots', 'eye', 'insurance'], patterns: SORT_C3B },
  { id: 'ct4_sort3', rank: 4, arch: 'sort', say: 'The afternoon list has just arrived. Please send each patient or paper to the right desk.', count: [4, 5], bins: ['ear', 'women', 'mind', 'older', 'referral', 'records', 'insurance', 'pay', 'urgent', 'sameday', 'booked'], patterns: SORT_C4B },
  { id: 'ct5_sort3', rank: 5, arch: 'sort', say: 'The day book is full. Please place each case with care.', count: [4, 5], bins: ['insurance', 'records', 'pay', 'referral', 'older', 'mind', 'ear', 'women', 'urgent', 'sameday', 'booked'], patterns: SORT_C5B },
];

// ---------------------------------------------------------------------------------------------- practical questions and papers (ranks 3-5)

const QA_DK3 = bank(3, [
  ['The nurse said that there was a cancellation, and I may have the ten o\'clock slot. Is that right?', 'Yes. Because of a cancellation, you may have the ten o\'clock slot.', 'cancel', ['Yes. Because of a cancellation, you may have the eleven o\'clock slot.', 'No. Because of a cancellation, you may not have the ten o\'clock slot.']],
  ['My mother does not speak our language well. Could an interpreter come on Thursday at three?', 'Yes. We shall ask an interpreter to come on Thursday at three.', 'interpreter', ['Yes. We shall ask an interpreter to come on Tuesday at three.', 'Yes. We shall ask an interpreter to come on Thursday at five.']],
  ['I broke my ankle, and I use crutches. Is there a lift to the second floor?', 'Yes. There is a lift to the second floor, so you can go up on your crutches.', 'crutches', ['Yes. There is a lift to the third floor, so you can go up on your crutches.', 'No. There is no lift to the second floor, so you can not go up on your crutches.']],
  ['I have come to have my stitches taken out. The nurse said Friday morning.', 'Yes. Your stitches will be taken out on Friday morning.', 'stitches', ['Yes. Your stitches will be taken out on Friday evening.', 'Yes. Your stitches will be put in on Friday morning.']],
  ['My father uses a wheelchair. The sign says that the side entrance has a ramp. May he come in there?', 'Yes. Your father may come in through the side entrance, because it has a ramp.', 'wheelchair', ['No. Your father may not come in through the side entrance, because it has a ramp.', 'Yes. Your father may come in through the back entrance, because it has a ramp.']],
  ['The dressing on my arm has come off, and the wound is open.', 'Please sit down. The nurse will put a new dressing on the wound on your arm.', 'dressing', ['Please sit down. The nurse will put a new dressing on the wound on your leg.', 'Please go home. The nurse will not put a new dressing on the wound on your arm.']],
  ['I am on the waiting list for a knee operation, and the letter says eight weeks. Will I hear from you soon?', 'The waiting list for the knee operation is eight weeks, so you should hear from us within eight weeks.', 'waitlist', ['The waiting list for the knee operation is eighteen weeks, so you should hear from us within eighteen weeks.', 'The waiting list for the hip operation is eight weeks, so you should hear from us within eight weeks.']],
]);

const QA_DK4 = bank(4, [
  ['My husband is an inpatient on Ward 4. The sign says that visiting hours are from two until four.', 'Thank you. You may visit your husband on Ward 4 between two and four.', 'inpatient', ['Thank you. You may visit your husband on Ward 2 between two and four.', 'Thank you. You may visit your husband on Ward 4 between four and six.']],
  ['I am an outpatient, and my appointment is in the outpatient department on the first floor.', 'Yes. The outpatient department is on the first floor, and your appointment will be there.', 'outpatient', ['Yes. The outpatient department is on the second floor, and your appointment will be there.', 'Yes. The outpatient department is on the first floor, and your appointment will be on the ward.']],
  ['The form says that the anesthetic will be given at nine, and I must stop eating at midnight.', 'That is right. Please do not eat after midnight, because the anesthetic will be given at nine.', 'anesthetic', ['That is right. Please do not eat after nine, because the anesthetic will be given at midnight.', 'That is right. Please eat after midnight, because the anesthetic will be given at nine.']],
  ['The nurse said that my son will be taken to the recovery room after the operation, and that I may wait there.', 'Yes. You may wait with your son in the recovery room after the operation.', 'recovery', ['Yes. You may wait with your son in the waiting room before the operation.', 'No. You may not wait with your son in the recovery room after the operation.']],
  ['My friend can not stand, and she is outside the door.', 'Please stay with her. We shall bring a stretcher to the door at once.', 'stretcher', ['Please leave her. We shall bring a stretcher to the door at once.', 'Please stay with her. We shall bring a stretcher to the door next week.']],
  ['I have left my crutches at home, and I can not walk to the car.', 'We shall lend you a pair of crutches, and you may return them to the desk next week.', 'lend', ['We shall lend you a pair of crutches, and you may keep them for ever.', 'We shall lend you a wheelchair, and you may return it to the desk next week.']],
]);

const QA_DK5 = bank(5, [
  ['I request a copy of the anesthetic record from my operation in March.', 'We shall ask the records office to send you a copy of the anesthetic record from your operation in March.', 'copy', ['We shall ask the records office to send you a copy of the anesthetic record from your operation in May.', 'We shall ask the pharmacy to send you a copy of the anesthetic record from your operation in March.']],
  ['The clinic has billed me for a missed appointment, but I cancelled by telephone a day ahead.', 'We apologize. We shall check the log of your cancellation, and we shall waive the fee if you cancelled in time.', 'waive', ['We apologize. We shall check the log of your cancellation, and we shall double the fee if you cancelled in time.', 'We apologize. We shall check the log of your appointment, and we shall waive the fee if you did not cancel.']],
  ['My insurer says that the claim lacks a diagnosis code. Which desk adds it?', 'The billing desk adds the diagnosis code, and we shall send the corrected claim to your insurer.', 'code', ['The pharmacy adds the diagnosis code, and we shall send the corrected claim to your insurer.', 'The billing desk adds the diagnosis code, and we shall send the corrected claim to your employer.']],
  ['I am moving house, and I would like my prescription transferred to the pharmacy in the next town.', 'We can transfer your prescription to the pharmacy in the next town once the pharmacist has confirmed the dosage.', 'transfer', ['We can transfer your prescription to the pharmacy in this town once the pharmacist has confirmed the dosage.', 'We can transfer your prescription to the dentist in the next town once the pharmacist has confirmed the dosage.']],
  ['The interpreter did not come, so I could not explain my symptoms to the doctor.', 'We are sorry. We shall arrange an interpreter for your next appointment and note your symptoms in the file.', 'interp', ['We are sorry. We shall arrange an interpreter for your last appointment and note your symptoms in the file.', 'We are glad. We shall arrange an interpreter for your next appointment and note your symptoms in the file.']],
  ['The locum doctor today does not have my notes. May I change my visit?', 'Certainly. We shall change your visit so that you see a doctor who has your notes.', 'locum', ['Certainly. We shall change your visit so that you see a locum who does not have your notes.', 'Certainly. We shall change your notes so that you see a doctor who has your visit.']],
]);

const BN: Record<string, QaItem[]> = { desk3b: QA_DK3, desk4b: QA_DK4, desk5b: QA_DK5 };

const TN: TaskTemplate[] = [
  { id: 'ct3_deskb', rank: 3, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'desk3b' },
  { id: 'ct4_deskb', rank: 4, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'desk4b' },
  { id: 'ct5_deskb', rank: 5, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'desk5b' },
  { id: 'ct3_label', rank: 3, arch: 'check', say: 'Please check the label on the medicine against the prescription.', fields: [
    { id: 'who', label: 'Patient', values: ['{Mrs. Hill|@}', '{Mr. Grant|@}', '{Captain Reed|@}', '{Big Joe|@}'] },
    { id: 'med', label: 'Medicine', values: ['antibiotic capsules', 'cough syrup', 'eye drops', 'skin cream'] },
    { id: 'dose', label: 'Dose', values: ['once a day', 'twice a day', 'three times a day', 'every four hours'] },
    { id: 'days', label: 'For', values: ['3 days', '5 days', '7 days', '10 days'] },
  ], docs: [{ kind: 'card', title: 'Prescription', fields: ['who', 'med', 'dose', 'days'] }, { kind: 'note', title: 'Label', fields: ['who', 'med', 'dose', 'days'] }], target: 1, pWrong: 0.7 },
  { id: 'ct4_discharge', rank: 4, arch: 'check', say: 'Please check the discharge letter against the ward notes.', fields: [
    { id: 'who', label: 'Patient', values: ['{Mrs. Hill|@}', '{Mr. Grant|@}', '{Captain Reed|@}', '{Big Joe|@}'] },
    { id: 'ward', label: 'Ward', values: ['Ward 2', 'Ward 3', 'Ward 4'] },
    { id: 'op', label: 'Operation', values: ['a hernia repair', 'a hip replacement', 'an operation on the appendix', 'a cataract operation'] },
    { id: 'stay', label: 'Stay', values: ['one night', 'two nights', 'three nights'] },
    { id: 'follow', label: 'Next visit', values: ['in a week', 'in two weeks', 'in a month'] },
  ], docs: [{ kind: 'note', title: 'Ward notes', fields: ['who', 'ward', 'op', 'stay', 'follow'] }, { kind: 'letter', title: 'Discharge letter', fields: ['who', 'ward', 'op', 'stay', 'follow'] }], target: 1, pWrong: 0.7 },
  { id: 'ct5_specrep', rank: 5, arch: 'check', say: 'Please check my summary against the specialist\'s report.', fields: [
    { id: 'who', label: 'Patient', values: ['{Mrs. Hill|@}', '{Mr. Grant|@}', '{Captain Reed|@}', '{Big Joe|@}'] },
    { id: 'test', label: 'Test', values: ['an ultrasound of the shoulder', 'a scan of the knee', 'an ultrasound of the thyroid'] },
    { id: 'res', label: 'Result', values: ['normal', 'inflamed', 'suspicious'] },
    { id: 'next', label: 'Follow-up', values: ['a review in three months', 'a review in six months', 'a second opinion'] },
  ], docs: [{ kind: 'note', title: 'Specialist\'s report', fields: ['who', 'test', 'res', 'next'] }, { kind: 'letter', title: 'Summary', fields: ['who', 'test', 'res', 'next'] }], target: 1, pWrong: 0.7 },
];

// ---------------------------------------------------------------------------------------------- the waiting room, fourth batch (ranks 3-5)

const SORT_C3C = [
  ...cpats('general', ['I have had a fever and chills since Monday', 'My throat is sore, and I have lost my voice', 'I get dizzy when I stand up', 'I have a stomach bug, and I can not keep food down']),
  ...cpats('skin', ['I have a rash with blisters on my back', 'A jellyfish stung my arm, and the skin is red', 'I have a deep scratch from a cat', 'My acne is getting worse']),
  ...cpats('bones', ['I have back pain after lifting a box', 'I think that my shoulder is dislocated', 'I twisted my knee playing football', 'My ankle is swollen after the match']),
  ...cpats('children', ['My baby has colic and cries all night', 'My son has a nosebleed that will not stop', 'My son has a stomach ache and a high temperature', 'My baby has been crying for hours and will not feed']),
  ...cpats('pharmacy', ['Could I have a spare inhaler for school?', 'I need a stronger painkiller', 'May I have a repeat of my prescription for the pills?', 'I would like some tablets for seasickness before the ferry']),
  ...cpats('urgent', ['He has swallowed a bone, and he can not breathe', 'My wife is vomiting blood', 'A man was hit by a car on the quay', 'A girl was stung by a wasp, and her tongue is swelling']),
  ...cpats('records', ['I need a letter to confirm my allergies', 'I would like the doctor\'s notes sent to the school', 'My new employer wants a health certificate', 'I need my address changed on my card']),
  ...cpats('pay', ['Do you accept cash and cards?', 'I would like to pay my bill in advance', 'What is the fee for a house call?', 'May I have an estimate of the cost?']),
  ...cpats('shots', ['My daughter needs the vaccine before she starts school', 'I need a vaccine against yellow fever for my trip', 'We have come for the baby\'s immunizations', 'I missed my second dose; may I still come?']),
  ...cpats('eye', ['I can not see well at night', 'I have a pain behind my eye', 'My daughter needs an eye test for school', 'I scratched my eye with a branch']),
  ...cpats('insurance', ['My coverage ends next month', 'The insurer asks me to fill in a claim form', 'Is dental treatment included in my plan?', 'I would like to add my newborn to my policy']),
];

const SORT_C4C = [
  ...cpats('ear', ['I have lost my sense of smell, and my nose is always blocked', 'I have a lump in my throat when I swallow', 'My son has had a tube put in his ear, and it has fallen out', 'I have a ringing in my ears, and I would like to see the ear specialist', 'I have dizzy spells and a ringing in my ears']),
  ...cpats('women', ['I think that I may be pregnant', 'I would like to talk about my pregnancy classes', 'I need a check after my miscarriage', 'I would like to talk about hormone treatment', 'I want to ask about my fertility']),
  ...cpats('mind', ['My husband drinks too much, and I am worried', 'I feel lonely and low since I retired', 'My son is being bullied and will not go to school', 'I can not concentrate, and I am exhausted', 'I have been grieving since my mother died']),
  ...cpats('older', ['My father is confused in the evenings', 'My mother is losing weight and does not want to eat', 'I fell in the bath, and I live alone', 'My wife has had a hip operation and needs a nurse at home', 'My uncle can not climb the stairs to the clinic']),
  ...cpats('referral', ['The doctor wants me to see a specialist about my kidneys', 'I need a letter for the surgeon', 'The specialist can not see me without a referral', 'I have been waiting for a specialist for four months', 'My doctor will refer me to a clinic for allergies']),
  ...cpats('records', ['I have lost my vaccination certificate', 'Please send my scan results to my new doctor', 'There is a mistake on my medical file', 'I would like to check which allergies are listed', 'I need my records for a visa']),
  ...cpats('insurance', ['My insurer refuses to pay for the operation', 'I would like to appeal against the decision of my insurer', 'My policy does not cover the specialist', 'The deductible on my policy is very high', 'I want to know whether my claim has been approved']),
  ...cpats('pay', ['I have been charged for an appointment that I cancelled', 'I would like to pay by bank transfer', 'My employer pays the bill, and I need an invoice', 'The receipt shows the wrong date', 'I would like to know the balance on my account']),
  ...cpats('urgent', ['He has swallowed bleach', 'She has been bitten by a snake', 'He has a nail through his hand', 'A woman has fainted, and her lips are blue', 'My father has crushing pain in his chest']),
  ...cpats('sameday', ['I have a high fever, and my glands are swollen', 'I have had a cough and a fever for three days', 'My daughter has a high fever and is vomiting', 'My son has a rash that is spreading', 'The stitches in my wound have come loose']),
  ...cpats('booked', ['I would like a review of my diabetes', 'I would like to discuss my family history of heart disease', 'I need a medical for my pilot license', 'I would like a vaccination review for my children', 'I wish to discuss an operation on my knee']),
];

const SORT_C5C = [
  ...cpats('insurance', ['The insurer demands proof of the diagnosis', 'The policy contains an exclusion for conditions that the patient had before the policy began', 'The claimant has submitted a duplicate claim', 'The insurer has requested an independent medical examination', 'The patient disputes the insurer\'s valuation of the claim']),
  ...cpats('records', ['The patient has requested the deletion of her data', 'The medical file contains an error in the date of birth', 'A solicitor has requested the file of a deceased patient', 'The patient has asked for her records in another language', 'The insurer has requested the notes of the consultation']),
  ...cpats('pay', ['The patient was billed for a service that she declined', 'The clinic is owed the balance of an unpaid invoice', 'The payment has been credited to the wrong account', 'The patient requests a waiver of the late fee on grounds of hardship', 'The remittance advice is missing']),
  ...cpats('referral', ['The referral was addressed to the wrong specialist', 'The consultant has asked for the results of the previous scan', 'The patient wishes to change her specialist', 'The surgeon requires a referral and a signed consent form', 'The specialist has no appointments before spring']),
  ...cpats('older', ['The patient is ninety and lives alone, and the carer visits twice a day', 'The patient lives alone and has fallen twice this month', 'The nursing home requests a report on the patient\'s mobility', 'The patient\'s daughter holds power of attorney', 'The patient is unable to manage her own medication']),
  ...cpats('mind', ['The patient has a history of depression and has stopped her medication', 'The patient\'s child is refusing to attend school because of anxiety', 'The patient requests a referral for cognitive therapy', 'The patient has not slept for three nights', 'The patient reports hearing voices']),
  ...cpats('ear', ['The patient\'s child suffers from glue ear', 'The patient requires an operation on the nasal septum', 'The patient has a persistent ringing in the ears', 'The patient has recurrent infections of the throat', 'The patient needs a follow-up scan of the sinuses']),
  ...cpats('women', ['The patient is thirty-six weeks pregnant and has reduced movement of the baby', 'The patient requests an assessment of her fertility', 'The patient has heavy bleeding between her periods', 'The patient has been referred for a hysterectomy', 'The patient wishes to discuss the menopause']),
  ...cpats('urgent', ['The patient has a ruptured appendix', 'The man has severe chest pain radiating to the jaw', 'The child has inhaled a peanut and is wheezing', 'The patient has been poisoned', 'The patient has swallowed a battery and is in pain']),
  ...cpats('sameday', ['The patient has had a persistent cough with a fever for a week', 'The patient reports a sudden loss of vision in one eye', 'The patient\'s incision has reopened', 'The patient has blood in her urine', 'The child has a swollen, tender joint and will not walk']),
  ...cpats('booked', ['The patient requests a prescription review for her blood pressure tablets', 'The patient wants a routine blood test for her thyroid', 'The patient asks about a hearing test for her child', 'The patient needs a medical examination for a visa', 'The patient wishes to discuss a referral for a knee replacement']),
];

const TZ3: TaskTemplate[] = [
  { id: 'ct3_sort4', rank: 3, arch: 'sort', say: 'Here come more patients. Please send each one to the right place.', count: [4, 5], bins: ['general', 'skin', 'bones', 'children', 'pharmacy', 'urgent', 'records', 'pay', 'shots', 'eye', 'insurance'], patterns: SORT_C3C },
  { id: 'ct4_sort4', rank: 4, arch: 'sort', say: 'The evening list is long. Please send each patient or paper to the desk that fits.', count: [4, 5], bins: ['ear', 'women', 'mind', 'older', 'referral', 'records', 'insurance', 'pay', 'urgent', 'sameday', 'booked'], patterns: SORT_C4C },
  { id: 'ct5_sort4', rank: 5, arch: 'sort', say: 'The manager wants the day\'s cases sorted by tomorrow. Please place each one with care.', count: [4, 5], bins: ['insurance', 'records', 'pay', 'referral', 'older', 'mind', 'ear', 'women', 'urgent', 'sameday', 'booked'], patterns: SORT_C5C },
];

// ---------------------------------------------------------------------------------------------- reactions and the boss's lines
// A reaction to a mistake says in English what was wrong (the game shows no badge): the field, the desk, the fact.
// Reception only: nobody here gives medical advice, so the lines are about papers, places and times.

const REACTIONS: JobContent['reactions'] = [
  // ---- rank 1
  { id: 'cr_ok1', kind: 'perfect', text: 'Thank you. That is right.', face: 'happy' },
  { id: 'cr_ok2', kind: 'perfect', text: 'Good work! That is just right.', face: 'delighted' },
  { id: 'cr_ok3', kind: 'perfect', arch: 'sort', text: 'Good. Every patient is in the right place.', face: 'happy' },
  { id: 'cr_ok4', kind: 'perfect', arch: 'check', text: 'Good eyes. Now the two papers say the same.', face: 'delighted' },
  { id: 'cr_ok5', kind: 'perfect', arch: 'respond', text: 'Good answer. Thank you.', face: 'happy' },
  { id: 'cr_late', kind: 'minor', late: true, text: 'Good. But please be fast next time.', face: 'neutral' },
  { id: 'cr_bin', kind: 'wrong_bin', text: 'No. This patient goes to “{bin}”.', face: 'puzzled' },
  { id: 'cr_bin2', kind: 'wrong_bin', text: 'Look again. This one is for “{bin}”.', face: 'puzzled' },
  { id: 'cr_miss', kind: 'missed', text: 'Wait! The {field} is wrong here. Please look at both papers again.', face: 'angry' },
  { id: 'cr_miss2', kind: 'missed', needs: '\\b(doctor|medicine|label)\\b', text: 'Wait! The {field} is not what the doctor wrote. That is not safe.', face: 'angry' },
  { id: 'cr_alarm', kind: 'false_alarm', text: 'This one is fine. The two papers say the same.', face: 'puzzled' },
  { id: 'cr_field', kind: 'wrong_field', text: 'That line is right. The mistake is in the {field}.', face: 'puzzled' },
  { id: 'cr_fix', kind: 'wrong_fix', text: 'Yes, that line is wrong. But your new word is not the right one.', face: 'neutral' },
  { id: 'cr_reply', kind: 'wrong_reply', voice: 'person', not: '\\bmemo\\b', text: 'Sorry? That does not answer my question.', face: 'puzzled' },
  { id: 'cr_reply2', kind: 'wrong_reply', text: 'That is not the right answer. It does not say what the paper says.', face: 'puzzled' },
  { id: 'cr_reply3', kind: 'wrong_reply', voice: 'boss', text: 'That reply is wrong. Please read it again.', face: 'puzzled' },
  { id: 'cr_reply4', kind: 'wrong_reply', needs: '\\b(ringing|phone|call)\\b', text: 'Oh dear. That is not what the caller asked.', face: 'puzzled' },
  { id: 'cr_form', kind: 'wrong_form', text: 'Some of this message is wrong. The caller said something else.', face: 'sad' },
  { id: 'cr_slot', kind: 'wrong_slot', text: 'That time is taken, or it is not the day that the patient wants. Please look at the book again.', face: 'sad' },
  { id: 'cr_slot2', kind: 'wrong_slot', text: 'No. That is not a time that the patient can come.', face: 'sad' },
  { id: 'cr_fail', kind: 'any_fail', text: 'Oh no. That is not right. Please try again.', face: 'sad' },
  // ---- rank 2
  { id: 'cr2_ok1', kind: 'perfect', rank: 2, text: 'Good work. Everything is in order.', face: 'happy' },
  { id: 'cr2_ok2', kind: 'perfect', rank: 2, arch: 'sort', text: 'Good. Nobody will wait at the wrong desk.', face: 'delighted' },
  { id: 'cr2_ok3', kind: 'perfect', rank: 2, arch: 'check', text: 'Good eyes. The papers are correct now.', face: 'delighted' },
  { id: 'cr2_ok4', kind: 'perfect', rank: 2, arch: 'respond', text: 'Good reply. That is just what the patient needs.', face: 'happy' },
  { id: 'cr2_late', kind: 'minor', late: true, rank: 2, text: 'Almost. The work is good, but you were a little slow.', face: 'neutral' },
  { id: 'cr2_bin', kind: 'wrong_bin', rank: 2, text: 'This patient does not belong here. They need “{bin}”.', face: 'puzzled' },
  { id: 'cr2_miss', kind: 'missed', rank: 2, text: 'Stop! The {field} does not agree with the other paper. We can not give this to a patient.', face: 'angry' },
  { id: 'cr2_alarm', kind: 'false_alarm', rank: 2, text: 'Everything agrees here. Please do not stop a good paper.', face: 'puzzled' },
  { id: 'cr2_field', kind: 'wrong_field', rank: 2, text: 'That line agrees with the other paper. The problem is in the {field}.', face: 'puzzled' },
  { id: 'cr2_fix', kind: 'wrong_fix', rank: 2, text: 'You found the wrong line, but the right word is on the other paper.', face: 'neutral' },
  { id: 'cr2_reply', kind: 'wrong_reply', rank: 2, text: 'That is not the answer to the question. Please read the message again.', face: 'puzzled' },
  { id: 'cr2_reply2', kind: 'wrong_reply', rank: 2, needs: '\\b(ringing|phone|call)\\b', text: 'That is not what the caller asked. Please listen again.', face: 'puzzled' },
  { id: 'cr2_form', kind: 'wrong_form', rank: 2, text: 'This message has a mistake in it. Please listen again and check every word.', face: 'sad' },
  { id: 'cr2_slot', kind: 'wrong_slot', rank: 2, text: 'That space is full, or it does not fit what the patient wrote.', face: 'sad' },
  { id: 'cr2_fail', kind: 'any_fail', rank: 2, text: 'This is wrong. A patient is waiting, so please be careful.', face: 'sad' },
  // ---- rank 3
  { id: 'cr3_ok1', kind: 'perfect', rank: 3, text: 'Excellent. You work fast, and you work well.', face: 'delighted' },
  { id: 'cr3_ok2', kind: 'perfect', rank: 3, arch: 'check', text: 'Good eyes. A wrong dose could have hurt someone.', face: 'delighted' },
  { id: 'cr3_ok3', kind: 'perfect', rank: 3, arch: 'respond', text: 'A clear and polite reply. Thank you.', face: 'happy' },
  { id: 'cr3_ok4', kind: 'perfect', rank: 3, arch: 'sort', text: 'Right. Each patient is where the doctor expects them.', face: 'happy' },
  { id: 'cr3_late', kind: 'minor', late: true, rank: 3, text: 'Good, but the waiting room is full. Please work a little faster.', face: 'neutral' },
  { id: 'cr3_bin', kind: 'wrong_bin', rank: 3, text: 'That patient should not wait here. What they said points to “{bin}”.', face: 'puzzled' },
  { id: 'cr3_miss', kind: 'missed', rank: 3, text: 'We can not hand this over. The {field} does not match what the other paper says.', face: 'angry' },
  { id: 'cr3_miss2', kind: 'missed', rank: 3, needs: '\\b(doctor|prescription|medicine)\\b', text: 'The {field} is not what the doctor wrote. A mistake like that could harm the patient.', face: 'angry' },
  { id: 'cr3_alarm', kind: 'false_alarm', rank: 3, text: 'There is no mistake here. The paper agrees with the other one, so it was not necessary to stop it.', face: 'puzzled' },
  { id: 'cr3_field', kind: 'wrong_field', rank: 3, text: 'That line is correct. The line that disagrees is the {field}.', face: 'puzzled' },
  { id: 'cr3_fix', kind: 'wrong_fix', rank: 3, text: 'You found the right line, but the correct value is the one on the other paper.', face: 'neutral' },
  { id: 'cr3_reply', kind: 'wrong_reply', rank: 3, text: 'I am afraid that reply is not what the message needs. It answers a different question.', face: 'sad' },
  { id: 'cr3_reply2', kind: 'wrong_reply', rank: 3, needs: '\\b(ringing|phone|call)\\b', text: 'That is not what the caller wanted. Please listen to the call again.', face: 'sad' },
  { id: 'cr3_form', kind: 'wrong_form', rank: 3, text: 'You missed something. A number or a name on the message pad is not what was said.', face: 'sad' },
  { id: 'cr3_slot', kind: 'wrong_slot', rank: 3, text: 'That time is taken, or it does not suit the patient. Please read what the patient needs again.', face: 'sad' },
  { id: 'cr3_fail', kind: 'any_fail', rank: 3, text: 'This is not good enough. A mistake like this could cost a patient a lot of time.', face: 'sad' },
  // ---- rank 4
  { id: 'cr4_ok1', kind: 'perfect', rank: 4, text: 'Exactly right. You have a good eye for detail.', face: 'delighted' },
  { id: 'cr4_ok2', kind: 'perfect', rank: 4, arch: 'check', text: 'Well spotted. That error would have reached the patient.', face: 'delighted' },
  { id: 'cr4_ok3', kind: 'perfect', rank: 4, arch: 'respond', text: 'Well read. That reply answers exactly what was asked.', face: 'happy' },
  { id: 'cr4_miss', kind: 'missed', rank: 4, text: 'We almost gave out an error. The {field} does not agree with the original.', face: 'angry' },
  { id: 'cr4_alarm', kind: 'false_alarm', rank: 4, text: 'That paper is accurate. The {field} agrees with the original, so nothing needed to be held back.', face: 'puzzled' },
  { id: 'cr4_field', kind: 'wrong_field', rank: 4, text: 'That detail is accurate. The error is in the {field}.', face: 'puzzled' },
  { id: 'cr4_bin', kind: 'wrong_bin', rank: 4, text: 'That belongs at “{bin}”. Please think about what the patient really needs.', face: 'puzzled' },
  { id: 'cr4_reply', kind: 'wrong_reply', rank: 4, text: 'That reply misses the patient\'s point. Please read the message more closely.', face: 'puzzled' },
  { id: 'cr4_form', kind: 'wrong_form', rank: 4, text: 'The message is not accurate. One of the details is not what the caller gave.', face: 'sad' },
  { id: 'cr4_slot', kind: 'wrong_slot', rank: 4, text: 'That slot is unavailable, or it conflicts with one of the patient\'s conditions.', face: 'sad' },
  { id: 'cr4_fail', kind: 'any_fail', rank: 4, text: 'This will not do. Please check every detail before you answer.', face: 'sad' },
  // ---- rank 5
  { id: 'cr5_ok1', kind: 'perfect', rank: 5, text: 'Exactly. You have saved us a complaint.', face: 'delighted' },
  { id: 'cr5_ok2', kind: 'perfect', rank: 5, arch: 'check', text: 'Sharp work. A discrepancy like that is just what an insurer looks for.', face: 'delighted' },
  { id: 'cr5_ok3', kind: 'perfect', rank: 5, arch: 'respond', text: 'A measured, accurate reply. Please send it.', face: 'happy' },
  { id: 'cr5_ok4', kind: 'perfect', rank: 5, arch: 'sort', text: 'Correct. Each patient and each paper is exactly where it should be.', face: 'happy' },
  { id: 'cr5_late', kind: 'minor', late: true, rank: 5, text: 'Sound work, but the doctor is waiting. Please be a little quicker.', face: 'neutral' },
  { id: 'cr5_bin', kind: 'wrong_bin', rank: 5, text: 'That does not belong at this desk; it is a matter for “{bin}”.', face: 'puzzled' },
  { id: 'cr5_miss', kind: 'missed', rank: 5, text: 'This would have gone out with an error. The {field} contradicts the original.', face: 'angry' },
  { id: 'cr5_alarm', kind: 'false_alarm', rank: 5, text: 'That paper is consistent with the original. Holding it back was unnecessary and cost us time.', face: 'puzzled' },
  { id: 'cr5_field', kind: 'wrong_field', rank: 5, text: 'That detail is consistent. The discrepancy lies in the {field}.', face: 'puzzled' },
  { id: 'cr5_fix', kind: 'wrong_fix', rank: 5, text: 'You located the discrepancy, but the figure that the original gives is a different one.', face: 'neutral' },
  { id: 'cr5_reply', kind: 'wrong_reply', rank: 5, text: 'I am afraid that reply does not address the point that was raised. Please read the message again, line by line.', face: 'puzzled' },
  { id: 'cr5_form', kind: 'wrong_form', rank: 5, text: 'The message is not faithful to the call: one detail has changed. Please listen again.', face: 'sad' },
  { id: 'cr5_slot', kind: 'wrong_slot', rank: 5, text: 'That placement contradicts one of the conditions in the message. Please read them again.', face: 'sad' },
  { id: 'cr5_fail', kind: 'any_fail', rank: 5, text: 'This is unacceptable in a clinic. Every detail must be exact.', face: 'sad' },
];

const LINES: JobContent['lines'] = [
  { id: 'cl_s1', kind: 'start', text: 'Good morning. The clinic is open, and the first patients are in the waiting room.' },
  { id: 'cl_s2', kind: 'start', text: 'Hello! The appointment book is on your desk, and the nurse is ready.' },
  { id: 'cl_s3', kind: 'start', rank: 2, text: 'Good morning. Please check everything twice today.' },
  { id: 'cl_s4', kind: 'start', rank: 3, text: 'Good morning. The phone will not stop today, I am afraid, and the doctors are fully booked.' },
  { id: 'cl_s5', kind: 'start', rank: 4, text: 'Good morning. We have a long list of patients today, so let us begin at once.' },
  { id: 'cl_s6', kind: 'start', rank: 5, text: 'Good morning. The insurer is sending its inspector this week, so every form must be exact.' },
  { id: 'cl_h1', kind: 'handover', msg: 'phone', text: 'Your phone is ringing. Could you take the call, please?' },
  { id: 'cl_h2', kind: 'handover', msg: 'email', text: 'This email came for the clinic. Please read it and tell me what it says.' },
  { id: 'cl_h3', kind: 'handover', msg: 'memo', text: 'Please read this and tell me what to say.' },
  { id: 'cl_h4', kind: 'handover', msg: 'letter', text: 'A letter came for the clinic. Please read it.' },
  { id: 'cl_e1', kind: 'end', text: 'Thank you for your work today.' },
  { id: 'cl_e2', kind: 'end', text: 'Good work. See you tomorrow!' },
  { id: 'cl_e3', kind: 'end', rank: 3, text: 'Thank you. The waiting room is quiet at last.' },
  { id: 'cl_e4', kind: 'end', rank: 5, text: 'The doors are closed, and every form is in order. Thank you for your careful work today.' },
  { id: 'cl_r1', kind: 'rankup', text: 'You are doing very well. Here is a little more work for you.' },
  { id: 'cl_r5', kind: 'rankup', rank: 5, text: 'You are my right hand now. From today, you help me with the forms that the insurer reads.' },
];
// ---------------------------------------------------------------------------------------------- generated lexicon (tools/genlex.ts)
const LEX_SRC = `
# jc2_001 | 診療所のことば ①（3級）
cry|v|cries,crying|泣く・叫ぶ
dentist|n||歯科医
general|a||一般的な
mouth|n||口
# jc2_002 | 診療所のことば ②（3級）
leg|n|legs|脚
skin|n||皮膚
prescription|n|prescriptions|処方箋
# jc3_003 | 診療所のことば ①（準2級）
tablet|n|tablets|錠剤
pick|v||選ぶ・取りに行く
beat|v|beating,beats|打つ・鼓動する
chest|n||胸
dose|n||服用量
# jc3_004 | 診療所のことば ②（準2級）
bone|n||骨
bend|v||曲げる
shoulder|n||肩
tight|a||きつい・つまった
# jc3_005 | 診療所のことば ③（準2級）
ache|n|aches,aching|痛み
ankle|n|ankles|足首
bandage|n|bandages|包帯
blister|n|blisters|水ぶくれ
# jc3_006 | 診療所のことば ④（準2級）
heel|n||かかと
hip|n||股関節・腰
itchy|a||かゆい
painful|a||痛い
painkiller|n|painkillers|鎮痛剤
# jc3_007 | 診療所のことば ⑤（準2級）
sprain|v|sprained|（足首などを）くじく
stiff|a||硬い
sunburn|n||日焼け
toddler|n||よちよち歩きをしはじめた幼児
# jc3_008 | 診療所のことば ⑥（準2級）
wrist|n||手首
toe|n||足の指
pharmacist|n||薬剤師
blood|n||血
# jc4_009 | 診療所のことば 1（2級）
drowsy|a||眠気を催す
ointment|n||軟膏
breathe|v||呼吸する
syrup|n||シロップ
knee|n|knees|ひざ
# jc4_010 | 診療所のことば 2（2級）
wheelchair|n|wheelchairs|車いす
sticker|n||ステッカー
injection|n||注射
shot|n||注射・発砲
# jc4_011 | 診療所のことば 3（2級）
swallow|v|swallowed|飲み込む
tetanus|n||破傷風
whooping|a||ヒューと息を吸う
bee|n||ハチ
# jc4_012 | 診療所のことば 4（2級）
bleed|v|bleeding,bleeds|出血する
cholesterol|n||コレステロール
faint|a|fainted|ふらつく・かすかな
pill|n|pills|錠剤
# jc4_013 | 診療所のことば 5（2級）
sting|v|stung|刺す
sudden|a||突然の
sweat|v|sweating|汗をかく
elbow|n||ひじ
# jc4_014 | 診療所のことば 6（2級）
ultrasound|n||超音波検査
bit|n||少し
blur|v|blurred|ぼやけさせる
brush|v||歯をみがく・ブラシをかける
# jc4_015 | 診療所のことば 7（2級）
feed|v||乳を飲む・食べさせる
gum|n|gums|歯ぐき・ガム
scratch|n|scratched|ひっかき傷
twist|v|twisted|ひねる
# jc4_016 | 診療所のことば 8（2級）
anemia|n||貧血
booster|n||（ワクチンの）追加接種
breath|n|breathing|息
copayment|n||自己負担金
# jc4_017 | 診療所のことば 9（2級）
generic|a||ジェネリックの・一般的な
inhale|v|inhaled,inhaler|吸い込む
installment|n|installments|分割払い込み金
insulin|n||インスリン
# jc4_018 | 診療所のことば 10（2級）
itemize|v|itemized|項目別に書く
lung|n|lungs|肺
medical|a||医療の
physiotherapy|n||理学療法
# jc4_019 | 診療所のことば 11（2級）
refill|n||（薬の）補充
stuck|a||はまった・動かない
update|v|updated|更新する
vision|n||視力
# jc4_020 | 診療所のことば 12（2級）
watery|a||涙ぐんだ
wisdom|n||知恵（wisdom toothは親知らず）
adjust|v|adjuster|調整する
antihistamine|n||抗ヒスタミン薬
# jc4_021 | 診療所のことば 13（2級）
antiseptic|n||消毒薬
around|p||～のまわりに
bark|n||ほえ声・樹皮
bite|v|bitten|かむ・刺す
# jc4_022 | 診療所のことば 14（2級）
chickenpox|n||水ぼうそう
constipated|a||便秘の
cramp|n|cramps|けいれん
eczema|n||湿疹
# jc4_023 | 診療所のことば 15（2級）
eyelid|n||まぶた
finger|n|fingers|指
flash|v|flashing|ぴかっと光る
fracture|n||骨折
# jc4_024 | 診療所のことば 16（2級）
hay|n||干し草（hay feverは花粉症）
heartburn|n||胸焼け
hepatitis|n||肝炎
hives|n||じんましん
# jc4_025 | 診療所のことば 17（2級）
kin|n||親族
lip|n|lips|くちびる
lozenge|n|lozenges|（のどの）トローチ
lump|n||しこり・塊
# jc4_026 | 診療所のことば 18（2級）
migraine|n|migraines|偏頭痛
mumps|n||おたふくかぜ
numb|a||しびれた
plaster|n|plasters|絆創膏（英）・しっくい
# jc4_027 | 診療所のことば 19（2級）
pneumonia|n||肺炎
rabies|n||狂犬病
splint|n||添え木
stye|n||ものもらい
# jc4_028 | 診療所のことば 20（2級）
surcharge|n||追加料金
swollen|a||腫れた
terrible|a||ひどい
wart|n||いぼ
# jc4_029 | 診療所のことば 21（2級）
capsule|n|capsules|カプセル
acne|n||にきび
bug|n||虫（stomach bugは胃腸炎）
chill|n|chills|寒気
# jc4_030 | 診療所のことば 22（2級）
colic|n||（乳児の）疝痛
dental|a||歯の
dislocate|v|dislocated|脱臼させる
football|n||フットボール
# jc4_031 | 診療所のことば 23（2級）
immunization|n|immunizations|予防接種
jellyfish|n||クラゲ
newborn|a||生まれたばかりの
nosebleed|n||鼻血
# jc4_032 | 診療所のことば 24（2級）
seasickness|n||船酔い
swell|v|swelling|ふくらむ
tongue|n||舌
wasp|n||スズメバチ
# jc4_033 | 診療所のことば 25（2級）
explanation|n||説明
rarely|d||めったに〜ない
sneeze|v|sneezing|くしゃみをする
vitamin|n|vitamins|ビタミン
# jc4_034 | 診療所のことば 26（2級）
cheek|n||ほお
earache|n||耳痛
toothache|n||歯痛
regular|a||定期的な
# jc4_035 | 診療所のことば 27（2級）
muscle|n|muscles|筋肉
therapist|n||セラピスト
thumb|n||親指
cloth|n||布
# jc4_036 | 診療所のことば 28（2級）
bruise|n||打撲傷
limp|v|limps|足を引きずる
itch|v|itches,itching|かゆい
click|v|clicks|カチッと鳴る・クリックする
# jc4_037 | 診療所のことば 29（2級）
grandchild|n||孫
relative|n|relative's,relatives|親戚
button|n||ボタン
cancellation|n||取り消し・キャンセル
# jc4_038 | 診療所のことば 30（2級）
interpreter|n||通訳
crutch|n|crutches|松葉づえ
ramp|n||傾斜路
harm|v|harming|害する
# jc5_039 | 診療所のことば 1（準1級）
nose|n||鼻
referral|n|referrals|紹介・紹介状
drug|n|drugs|薬
yearly|a||毎年の
# jc5_040 | 診療所のことば 2（準1級）
infection|n|infections|感染
rash|n||発疹
vomit|v|vomiting|吐く
alcohol|n||アルコール
# jc5_041 | 診療所のことば 3（準1級）
suddenly|d||突然
ear|n|ears|耳
elderly|a||年配の
normal|a||普通の
# jc5_042 | 診療所のことば 4（準1級）
physical|a||身体の・健康診断（名詞）
afterwards|d||あとで
course|n||コース
symptom|n|symptoms|症状
# jc5_043 | 診療所のことば 5（準1級）
unsure|a||確信がない
advice|n||助言
appetite|n||食欲
option|n|options|選択肢
# jc5_044 | 診療所のことば 6（準1級）
stress|n||ストレス
improvement|n||改善
asthma|n||喘息
diarrhea|n||下痢
# jc5_045 | 診療所のことば 7（準1級）
nausea|n||吐き気
severe|a||重い・ひどい
breast|n||乳房・胸
manage|v||経営する
# jc5_046 | 診療所のことば 8（準1級）
mole|n||ほくろ・モグラ
panic|n||パニック
patch|n||（皮膚の）部分・当て布
pulse|n||脈拍
# jc5_047 | 診療所のことば 9（準1級）
authorization|n||承認・許可
cardiologist|n||心臓専門医
contraception|n||避妊
counselor|n||カウンセラー
# jc5_048 | 診療所のことば 10（準1級）
deductible|n||（保険の）自己負担額
dementia|n||認知症
depressed|a||落ち込んだ・うつ状態の
dermatologist|n||皮膚科医
# jc5_049 | 診療所のことば 11（準1級）
droop|v|drooping|垂れ下がる
menopause|n||更年期
ooze|v|oozing|じくじく出る
physiotherapist|n||理学療法士
# jc5_050 | 診療所のことば 12（準1級）
policyholder|n||保険契約者
prenatal|a||出産前の
prior|a||事前の・前の
refer|v|referred|紹介する・言及する
# jc5_051 | 診療所のことば 13（準1級）
respond|v|responding|反応する・返事をする
routine|a||定期の・決まりきった
settle|v||清算する・落ち着く
sinus|n|sinuses|副鼻腔
# jc5_052 | 診療所のことば 14（準1級）
slurred|a||ろれつの回らない
smear|n||塗抹（smear testは子宮頸がん検診）
speech|n||話し方・演説
spouse|n||配偶者
# jc5_053 | 診療所のことば 15（準1級）
teenage|a||10代の
tonsil|n|tonsils|扁桃（へんとう）
urinary|a||尿の
wander|v|wanders|徘徊する・ぶらつく
# jc5_054 | 診療所のことば 16（準1級）
abdominal|a||腹の
addicted|a||中毒の
biopsy|n||生検
breastfeed|v|breastfeeding|母乳で育てる
# jc5_055 | 診療所のことば 17（準1級）
caregiver|n||介護者
choke|v|choking|息が詰まる
claimant|n||請求者
cope|v||対処する
# jc5_056 | 診療所のことば 18（準1級）
divorce|n||離婚
flashback|n|flashbacks|フラッシュバック
gland|n|glands|腺
hoarse|a||声がかれた
# jc5_057 | 診療所のことば 19（準1級）
incontinent|a||失禁する
motivation|n||やる気
neurologist|n||神経科医
overpay|v|overpaid|払いすぎる
# jc5_058 | 診療所のことば 20（準1級）
pregnancy|n||妊娠
recur|v|recurring|再発する
rehabilitation|n||リハビリ
seizure|n||発作・押収
# jc5_059 | 診療所のことば 21（準1級）
snore|v||いびきをかく
spelling|n||語のつづり方
stroke|n||脳卒中
surname|n||姓
# jc5_060 | 診療所のことば 22（準1級）
urologist|n||泌尿器科医
cataract|n||白内障
hernia|n||ヘルニア
bully|v|bullied|いじめる
# jc5_061 | 診療所のことば 23（準1級）
concentrate|v||集中する
crush|v|crushing|押しつぶす
exhausted|a||疲れ果てた
fertility|n||妊娠しやすさ・肥沃さ
# jc5_062 | 診療所のことば 24（準1級）
grieve|v|grieving|深く悲しむ
hormone|n||ホルモン
kidney|n|kidneys|腎臓
lonely|a||孤独な
# jc5_063 | 診療所のことば 25（準1級）
loose|a||ゆるい
miscarriage|n||流産
nail|n||釘・つめ
sense|n||感覚
# jc5_064 | 診療所のことば 26（準1級）
snake|n||ヘビ
spell|n|spells|一時的な発作・期間
stitch|n|stitches|縫い目・縫合
tube|n||管
# jc5_065 | 診療所のことば 27（準1級）
visa|n||ビザ
thirteenth|a||13番目の
frightened|a||おびえた
surely|d||確かに
# jc5_066 | 診療所のことば 28（準1級）
confidential|a||機密の
penicillin|n||ペニシリン
beside|p||～のそばに
outpatient|n||外来患者
# jc5_067 | 診療所のことば 29（準1級）
recovery|n||回復
pound|n|pounding|ポンド（重さ・通貨）
mask|n|masks|マスク
monthly|a||毎月の
# jc5_068 | 診療所のことば 30（準1級）
rib|n|ribs|肋骨
nerve|n||神経
shiver|v|shivering|震える
dependent|n||扶養家族
# jc5_069 | 診療所のことば 31（準1級）
inpatient|n||入院患者
anesthetic|n||麻酔薬
stretcher|n||担架
# jc6_070 | 診療所のことば 1（1級）
exclusion|n|exclusions|除外
dummy|n||おしゃぶり（英）
virus|n||ウイルス
attorney|n||弁護士・（power of attorneyで）代理権
# jc6_071 | 診療所のことば 2（1級）
himself|r||彼自身
anxious|a||心配している
excess|n||免責額・超過
premium|n||保険料
# jc6_072 | 診療所のことば 3（1級）
inconvenience|n||不便
mild|a||穏やかな
perfectly|d||完全に
movement|n||動き
# jc6_073 | 診療所のことば 4（1級）
pregnant|a||妊娠している
interact|v||相互作用する
prescribe|v|prescribed|処方する
easily|d||簡単に
# jc6_074 | 診療所のことば 5（1級）
round|d||まわって
dizzy|a||めまいがする
infected|a||感染した
reaction|n||反応
# jc6_075 | 診療所のことば 6（1級）
overdose|n||（薬の）過剰摂取
anxiety|n||不安
corridor|n||廊下
lapse|v|lapsed|失効する
# jc6_076 | 診療所のことば 7（1級）
pale|a||青白い
procedure|n|procedures|処置・手順
equally|d||平等に
heavily|d||激しく
# jc6_077 | 診療所のことば 8（1級）
joint|n|joints|関節
booklet|n||小冊子
cosmetic|a||化粧用の
amend|v|amended|修正する
# jc6_078 | 診療所のことば 9（1級）
anaphylactic|a||アナフィラキシーの
antenatal|a||出産前の
arthritis|n||関節炎
audiologist|n||聴覚の専門家
# jc6_079 | 診療所のことば 10（1級）
bereavement|n||死別
burnout|n||燃え尽き症候群
certify|v|certified|証明する
disorder|n||障害
# jc6_080 | 診療所のことば 11（1級）
elective|a||待機的な（緊急でない）
fade|v||消える・色あせる
fatigue|n||疲労
fluid|n|fluids|水分・液体
# jc6_081 | 診療所のことば 12（1級）
frail|a||弱々しい
insomnia|n||不眠症
irregular|a||不規則な
mammogram|n||乳房X線検査
# jc6_082 | 診療所のことば 13（1級）
management|n||管理・経営
maternity|a||産科の・出産の
medication|n|medications|薬
midwife|n||助産師
# jc6_083 | 診療所のことば 14（1級）
mood|n||気分
nasal|a||鼻の
nightmare|n|nightmares|悪夢
numbness|n||しびれ
# jc6_084 | 診療所のことば 15（1級）
oncologist|n||腫瘍（がん）専門医
orthopedic|a||整形外科の
palliative|a||緩和ケアの
persistent|a||長引く・しつこい
# jc6_085 | 診療所のことば 16（1級）
reimbursement|n||払い戻し
respite|n||休息・（介護の）一時預かり
screening|n||検診
septum|n||（鼻の）中隔
# jc6_086 | 診療所のことば 17（1級）
shock|n||衝撃
sinusitis|n||副鼻腔炎
struggle|v|struggling|苦闘する・もがく
teenager|n||ティーンエージャー
# jc6_087 | 診療所のことば 18（1級）
thyroid|n||甲状腺
tonsillectomy|n||扁桃摘出手術
trimester|n||妊娠の3か月ごとの期間
ulcer|n||潰瘍
# jc6_088 | 診療所のことば 19（1級）
vertigo|n||めまい（回転性）
waive|v|waived,waiver|免除する
abscess|n||膿瘍
# jc6_089 | 診療所のことば 20（1級）
anonymize|v|anonymized|匿名にする
bedridden|a||寝たきりの
calf|n||ふくらはぎ・子牛
cardiac|a||心臓の
# jc6_090 | 診療所のことば 21（1級）
cervical|a||子宮頸部の
cesarean|n||帝王切開
chart|n||表・記録表
complication|n|complications|合併症・複雑化
# jc6_091 | 診療所のことば 22（1級）
consultation|n||相談
counseling|n||カウンセリング
eardrum|n||鼓膜
hemorrhage|v|hemorrhaging|大出血する
# jc6_092 | 診療所のことば 23（1級）
lethal|a||致死の
ombudsman|n||オンブズマン（苦情処理の調停役）
pathology|n||病理学
perforated|a||穴のあいた
# jc6_093 | 診療所のことば 24（1級）
relieve|v||和らげる
remittance|n||送金
seek|v|seeks|探す
suffering|n||苦しみ
# jc6_094 | 診療所のことば 25（1級）
target|n||目標
tonsillitis|n||扁桃炎
tremor|n||震え
twin|n|twins|双子の一人
# jc6_095 | 診療所のことば 26（1級）
unconscious|a||意識を失った
underwriter|n||保険引受人
inflamed|a||炎症を起こした
suspicious|a||疑わしい
# jc6_096 | 診療所のことば 27（1級）
cognitive|a||認知の
deceased|a||亡くなった
deletion|n||削除
depression|n||落ち込み
# jc6_097 | 診療所のことば 28（1級）
diagnosis|n||診断
glue|v||のり（glue earは滲出性中耳炎）
hardship|n||苦難
hysterectomy|n||子宮摘出手術
# jc6_098 | 診療所のことば 29（1級）
incision|n||切開
independent|a||独立した
jaw|n||あご
language|n||言語
# jc6_099 | 診療所のことば 30（1級）
mobility|n||移動性
poison|v|poisoned|毒を盛る
previous|a||前の
radiate|v|radiating|（痛みが）広がる・放射する
# jc6_100 | 診療所のことば 31（1級）
recurrent|a||繰り返し起こる
rupture|v|ruptured|破裂する
solicitor|n||事務弁護士（英）
urine|n||尿
# jc6_101 | 診療所のことば 32（1級）
valuation|n||評価
wheeze|v|wheezing|ぜいぜいいう
guess|v||推測する
unclear|a||はっきりしない
# jc6_102 | 診療所のことば 33（1級）
receptionist|n||受付係
unhelpful|a||役に立たない
membership|n||会員であること
persist|v|persisted|持続する
# jc6_103 | 診療所のことば 34（1級）
harmless|a||無害な
isolate|v||隔離する・孤立させる
accompany|v|accompanied|同行する
compulsory|a||義務の
# jc6_104 | 診療所のことば 35（1級）
voluntary|a||自発的な
presence|n||存在
shortness|n||息切れ（shortness of breath）・短さ
religious|a||宗教の
# jc6_105 | 診療所のことば 36（1級）
disclosure|n||開示
adverse|a||不利な
weakness|n||弱さ
liver|n||肝臓
# jc6_106 | 診療所のことば 37（1級）
unusual|a||普通でない
tumor|n||腫瘍
ethics|n||倫理
journalist|n|journalist's|ジャーナリスト
# jc6_107 | 診療所のことば 38（1級）
log|n||記録（ログ）・丸太
dosage|n||（薬の）用量
locum|n||代理医師
`;
const EXTRA_FORMS: Record<string, string[]> = {"doctor":["doctor's","doctors"],"machine":["machines"],"begin":["begins","begun"],"speak":["speaking"],"complete":["completes"],"allergy":["allergies"],"your":["yours"],"in_up":["ups"],"result":["results"],"is":["being"],"warm":["warmer"],"child":["child's","children's"],"collect":["collects"],"appointment":["appointments"],"afternoon":["afternoons"],"complain":["complaining","complains"],"amount":["amounts"],"feel":["feeling","feels","felt"],"fall":["fallen","falls"],"agree":["agreeing","agrees"],"in_saturday":["Saturday's","saturdays"],"old":["older"],"patient":["patient's","patients'"],"father":["father's"],"go":["gone"],"quote":["quoted"],"ask":["asking"],"read":["reading"],"morning":["mornings"],"inspector":["inspector's"],"soon":["sooner"],"in_question":["questioned"],"mother":["mother's"],"wind":["wound"],"neighbour":["neighbours"],"think":["thinking"],"forget":["forgetting","forgotten"],"help":["helping"],"report":["reported","reports"],"woman":["women's"],"fill":["filling"],"break":["broke"],"expect":["expected","expecting","expects"],"show":["showing"],"clean":["cleaned","cleaning"],"tooth":["teething"],"husband":["husband's"],"light":["lights"],"baby":["baby's"],"son":["son's"],"stop":["stopping"],"worry":["worrying"],"retire":["retired"],"evening":["evenings"],"list":["listed"],"spread":["spreading"],"in_watch":["watching"],"in_wake":["woken"],"day":["day's"],"case":["cases"],"in_view":["viewed"],"request":["requested"],"schedule":["scheduled"],"period":["periods"],"cough":["coughing"],"file":["filed"],"bill":["billed","billing"],"contact":["contacted","contacting"],"in_bath":["bathing"],"dress":["dressing"],"book":["booking"],"large":["larger"],"submit":["submitted"],"miss":["missing"],"address":["addressed"],"they":["theirs"],"look":["looked"],"accept":["accepts"],"thursday":["Thursday's","thursdays"],"draw":["drawing"],"way":["ways"],"inform":["informed"],"reply":["replies"],"rule":["ruled"],"client":["client's"],"open":["opening"],"we":["wing"],"rise":["risen"],"reserve":["reserves"],"name":["named"],"review":["reviewed"],"in_slip":["slipped"],"arrange":["arranges"],"sell":["sells"],"cream":["creams"],"wednesday":["Wednesday's","wednesdays"],"telephone":["telephones"],"wash":["washing"],"follow":["followed"],"school":["school's"],"in_foot":["feet"],"to":["toes"],"in_uncle":["uncle's"],"wife":["wife's"],"add":["adds"],"door":["doors"],"form":["forms"],"monday":["Monday's"],"tuesday":["Tuesday's"],"friday":["Friday's"],"sunday":["Sunday's"]};
// generated by tools/tags.ts: phrases (phrases.json ids) and grammar points (grammar.json ids) found in the task's own texts
const TAGS: Record<string, { p?: string[]; g?: string[] }> = {"c1_first":{"p":["ph-5-0002"],"g":["gr-5-013"]},"c1_card":{"p":["ph-5-0159"],"g":["gr-5-011"]},"c1_sat":{"p":["ph-5-0051"],"g":["gr-3-005","gr-4-026"]},"c1_sort2":{"g":["gr-5-013","gr-5-015"]},"c1_mom":{"g":["gr-5-015","gr-5-016"]},"c1_fee":{"g":["gr-5-013","gr-5-014"]},"c1_book":{"p":["ph-5-0133","ph-5-0159"],"g":["gr-4-008","gr-4-019"]},"c1_name":{"g":["gr-5-011"]},"c1_dentist":{"p":["ph-5-0132"],"g":["gr-5-015"]},"c1_sort3":{"p":["ph-5-0159"],"g":["gr-5-011"]},"c1_phone":{"g":["gr-5-011"]},"c1_wait":{"g":["gr-4-002","gr-4-003"]},"c1_nurse":{"g":["gr-5-015","gr-5-011"]},"c1_form":{"g":["gr-4-003","gr-5-013"]},"c1_book2":{"p":["ph-4-0149","ph-5-0159"],"g":["gr-4-008","gr-4-019"]},"c1_sick":{"g":["gr-5-015"]},"c1_thanks":{"p":["ph-5-0014"],"g":["gr-5-015","gr-5-011"]},"c2_sort1":{"p":["ph-5-0128"],"g":["gr-5-013"]},"c2_rx":{"g":["gr-5-011"]},"c2_pharm":{"p":["ph-4-0132"],"g":["gr-4-019","gr-5-013"]},"c2_rash":{"g":["gr-4-007","gr-5-011"]},"c2_card":{"g":["gr-5-011"]},"c2_pay":{"g":["gr-4-002","gr-5-013"]},"c2_book":{"p":["ph-4-0149"],"g":["gr-4-008","gr-4-019"]},"c2_sort2":{"p":["ph-3-0103"],"g":["gr-4-008","gr-4-019"]},"c2_ok":{"p":["ph-pre2-0174"],"g":["gr-5-011"]},"c2_leaflet":{"g":["gr-4-005","gr-4-019"]},"c2_allergy":{"p":["ph-4-0076","ph-4-0075"],"g":["gr-4-003","gr-4-004"]},"c2_book2":{"g":["gr-5-011"]},"c2_back":{"p":["ph-5-0002"],"g":["gr-4-008","gr-5-015"]},"c2_late":{"p":["ph-4-0075"],"g":["gr-3-014","gr-3-018"]},"c2_sort3":{"g":["gr-5-016","gr-5-011"]},"c2_form":{"g":["gr-5-011"]},"c2_hours":{"p":["ph-4-0147"],"g":["gr-pre2-031","gr-3-005"]},"c2_book3":{"p":["ph-5-0132"],"g":["gr-4-007","gr-4-019"]},"c2_dose":{"p":["ph-pre2-0174"]},"c2_thanks":{"p":["ph-5-0014"],"g":["gr-3-005","gr-4-026"]},"c3_dose":{"g":["gr-3-002"]},"c3_sort1":{"g":["gr-3-002"]},"c3_leaflet":{"p":["ph-4-0076"],"g":["gr-pre2-006","gr-4-003"]},"c3_scan":{"p":["ph-pre2-0202"],"g":["gr-pre2-031","gr-4-002"]},"c3_card":{"g":["gr-4-002"]},"c3_cover":{"p":["ph-3-0103"]},"c3_book1":{"p":["ph-5-0132"],"g":["gr-pre2-056","gr-4-003"]},"c3_ok1":{"p":["ph-pre2-0174"],"g":["gr-2-058"]},"c3_fee":{"p":["ph-3-0103"],"g":["gr-3-002","gr-4-002"]},"c3_sort2":{"p":["ph-5-0159"],"g":["gr-3-002"]},"c3_wait":{"p":["ph-4-0112"],"g":["gr-3-018","gr-4-003"]},"c3_phone":{"p":["ph-2-0396"],"g":["gr-4-002"]},"c3_bill":{"g":["gr-5-011"]},"c3_wonder":{"p":["ph-pre2-0111"],"g":["gr-4-002","gr-4-003"]},"c3_sort3":{"p":["ph-5-0159"],"g":["gr-3-002","gr-4-007"]},"c3_gap1":{"g":["gr-pre2-013"]},"c3_form":{"g":["gr-5-011"]},"c3_complaint":{"p":["ph-pre2-0180"],"g":["gr-3-014","gr-4-002"]},"c3_ref":{"g":["gr-3-002","gr-4-003"]},"c3_phone2":{"g":["gr-pre2-006","gr-pre2-010"]},"c3_contradict1":{"g":["gr-4-006"]},"c3_vaccine":{"g":["gr-5-011"]},"c3_say1":{"p":["ph-4-0130"],"g":["gr-2-052","gr-3-019"]},"c3_label":{"g":["gr-5-011"]},"c3_policy":{"p":["ph-4-0074"],"g":["gr-3-018","gr-4-003"]},"c3_book2":{"p":["ph-5-0159"],"g":["gr-4-007","gr-4-019"]},"c3_sort4":{"g":["gr-pre2-056","gr-3-002"]},"c3_hours":{"p":["ph-pre2-0032"],"g":["gr-4-007"]},"c3_result":{"p":["ph-4-0130"],"g":["gr-5-011"]},"c3_gap2":{"g":["gr-pre2-033","gr-4-019"]},"c3_say2":{"p":["ph-4-0141"],"g":["gr-4-002","gr-4-007"]},"c3_ok2":{"p":["ph-pre2-0174"],"g":["gr-2-058"]},"c3_emergency":{"p":["ph-pre2-0289"],"g":["gr-3-002","gr-3-005"]},"c3_book3":{"p":["ph-5-0159"],"g":["gr-3-005","gr-4-003"]},"c3_insurance":{"g":["gr-5-011"]},"c3_contradict2":{"g":["gr-pre2-031","gr-3-005"]},"c3_phone3":{"p":["ph-5-0003"],"g":["gr-3-002","gr-4-002"]},"c3_reader":{"p":["ph-4-0005"],"g":["gr-pre2-006","gr-3-002"]},"c3_sort5":{"g":["gr-4-003"]},"c3_wait2":{"p":["ph-pre2-0289"],"g":["gr-3-014","gr-3-021"]},"c3_age":{"g":["gr-5-011"]},"c3_gap3":{"g":["gr-3-018","gr-4-002"]},"c3_thanks":{"p":["ph-4-0131"],"g":["gr-pre2-006","gr-4-003"]},"c3_ok3":{"p":["ph-pre2-0174"],"g":["gr-2-058"]},"c3_hale":{"p":["ph-5-0061"],"g":["gr-pre2-056","gr-4-002"]},"c4_repeat":{"g":["gr-pre2-031","gr-3-019"]},"c4_consent":{"g":["gr-4-003"]},"c4_sort1":{"p":["ph-pre2-0124"],"g":["gr-4-019"]},"c4_referral":{"p":["ph-pre2-0184"],"g":["gr-2-030","gr-3-005"]},"c4_phone1":{"p":["ph-4-0141"],"g":["gr-3-005","gr-3-014"]},"c4_claim":{"g":["gr-3-002"]},"c4_cover":{"p":["ph-4-0074"],"g":["gr-2-056","gr-pre2-056"]},"c4_book1":{"p":["ph-5-0159"],"g":["gr-4-019"]},"c4_privacy":{"g":["gr-2-052","gr-pre2-031"]},"c4_letter":{"p":["ph-pre2-0289"],"g":["gr-2-012","gr-pre2-031"]},"c4_sort2":{"g":["gr-pre2-031","gr-3-002"]},"c4_quote":{"g":["gr-5-011"]},"c4_policy":{"p":["ph-4-0075"],"g":["gr-pre2-033","gr-3-007"]},"c4_phone2":{"g":["gr-pre2-065","gr-3-002"]},"c4_contradict1":{"g":["gr-3-005"]},"c4_age":{"g":["gr-4-003"]},"c4_complaint":{"g":["gr-2-052","gr-pre2-006"]},"c4_sort3":{"g":["gr-3-002"]},"c4_dose2":{"g":["gr-2-056","gr-pre2-010"]},"c4_say1":{"p":["ph-5-0132"],"g":["gr-4-019"]},"c4_slot":{"g":["gr-5-011"]},"c4_gap1":{"g":["gr-2-023","gr-pre2-033"]},"c4_result":{"g":["gr-pre2-031","gr-3-002"]},"c4_reader":{"g":["gr-2-045"]},"c4_sort4":{"g":["gr-3-007"]},"c4_phone3":{"p":["ph-4-0141"],"g":["gr-2-056","gr-pre2-065"]},"c4_ok2":{"g":["gr-5-011"]},"c4_condition":{"p":["ph-pre1-0448","ph-2-0152"],"g":["gr-pre1-010","gr-pre2-031"]},"c4_calc":{"g":["gr-2-056"]},"c4_contradict2":{"g":["gr-pre2-006","gr-3-002"]},"c4_say2":{"p":["ph-4-0074"],"g":["gr-4-002"]},"c4_book2":{"p":["ph-5-0132"],"g":["gr-3-005"]},"c4_dates":{"g":["gr-5-011"]},"c4_complaint2":{"g":["gr-2-052","gr-3-005"]},"c4_sort5":{"p":["ph-pre2-0243","ph-pre2-0225"],"g":["gr-3-007"]},"c4_name":{"g":["gr-3-002"]},"c4_gap2":{"g":["gr-3-005"]},"c4_say3":{"p":["ph-4-0130"],"g":["gr-3-014"]},"c4_stay":{"p":["ph-2-0159"],"g":["gr-pre1-032"]},"c4_policy2":{"p":["ph-4-0143"],"g":["gr-pre2-006","gr-3-002"]},"c4_phone4":{"p":["ph-4-0141"],"g":["gr-4-002"]},"c4_hale":{"g":["gr-3-005"]},"c4_ok3":{"g":["gr-5-011"]},"c4_sort6":{"p":["ph-5-0103"],"g":["gr-2-045","gr-pre2-056"]},"c5_refusal":{"g":["gr-3-002"]},"c5_exclusion":{"p":["ph-3-0103"],"g":["gr-pre2-001"]},"c5_sort1":{"p":["ph-pre2-0364"],"g":["gr-2-045"]},"c5_consent":{"p":["ph-2-0474"],"g":["gr-2-030","gr-pre2-031"]},"c5_phone1":{"p":["ph-pre1-0297"],"g":["gr-3-005"]},"c5_age":{"g":["gr-5-011"]},"c5_book1":{"p":["ph-5-0159"],"g":["gr-pre2-031","gr-pre2-056"]},"c5_say1":{"p":["ph-pre1-0448","ph-2-0200"],"g":["gr-1-004","gr-2-015"]},"c5_contradict1":{"p":["ph-4-0112"],"g":["gr-pre2-052","gr-pre2-006"]},"c5_reader1":{"g":["gr-1-004","gr-2-015"]},"c5_sort2":{"g":["gr-3-002"]},"c5_quote":{"g":["gr-3-002"]},"c5_gap1":{"g":["gr-1-001","gr-2-012"]},"c5_phone2":{"p":["ph-5-0014"],"g":["gr-pre2-006"]},"c5_phone3":{"p":["ph-4-0112"],"g":["gr-3-002"]},"c5_vaccine":{"g":["gr-3-002"]},"c5_complaint":{"p":["ph-2-0229"],"g":["gr-pre2-006","gr-pre2-010"]},"c5_sort3":{"g":["gr-pre2-013"]},"c5_calc":{"g":["gr-3-005"]},"c5_say2":{"p":["ph-5-0132"],"g":["gr-1-004","gr-2-015"]},"c5_ok2":{"p":["ph-5-0132"]},"c5_reader2":{"p":["ph-4-0143"],"g":["gr-2-052","gr-pre2-031"]},"c5_gap2":{"g":["gr-pre2-001","gr-pre2-010"]},"c5_trial":{"g":["gr-5-011"]},"c5_policy":{"g":["gr-2-052"]},"c5_sort4":{"g":["gr-2-052","gr-pre2-065"]},"c5_form":{"g":["gr-3-002"]},"c5_phone4":{"p":["ph-2-0396"],"g":["gr-3-002"]},"c5_headline":{"p":["ph-4-0143"],"g":["gr-pre2-006"]},"c5_book2":{"p":["ph-5-0132"],"g":["gr-4-019"]},"c5_ok3":{"p":["ph-3-0170"],"g":["gr-4-020"]},"c5_contradict2":{"g":["gr-3-005"]},"c5_say3":{"g":["gr-pre2-010"]},"c5_dates":{"g":["gr-5-011"]},"c5_reader3":{"g":["gr-4-002"]},"c5_sort5":{"p":["ph-1-0568"],"g":["gr-pre2-056"]},"c5_receipt":{"g":["gr-5-011"]},"c5_gap3":{"g":["gr-pre2-001"]},"c5_phone5":{"p":["ph-4-0101"],"g":["gr-1-004","gr-2-015"]},"c5_phone6":{"p":["ph-4-0141"],"g":["gr-4-003"]},"c5_anniv":{"g":["gr-3-014"]},"c5_report":{"g":["gr-2-030"]},"c5_sort6":{"g":["gr-pre2-006","gr-pre2-013"]},"c5_say4":{"g":["gr-pre2-065"]},"say1#0":{"g":["gr-4-007","gr-5-015"]},"say1#1":{"p":["ph-5-0039"]},"say1#2":{"p":["ph-5-0157","ph-5-0007"],"g":["gr-4-002","gr-5-011"]},"say1#3":{"p":["ph-5-0014"]},"say1#4":{"p":["ph-5-0157"],"g":["gr-5-011"]},"say1#5":{"g":["gr-5-015"]},"say1#6":{"p":["ph-5-0081"],"g":["gr-4-008"]},"say1#7":{"g":["gr-5-011"]},"mail1#0":{"p":["ph-5-0081"],"g":["gr-4-008","gr-5-015"]},"mail1#1":{"g":["gr-5-015"]},"mail1#2":{"p":["ph-5-0039"]},"mail1#3":{"p":["ph-5-0014"]},"mail1#4":{"g":["gr-5-015"]},"say2#0":{"p":["ph-pre2-0184"],"g":["gr-4-002","gr-4-007"]},"say2#1":{"p":["ph-5-0085"],"g":["gr-3-002","gr-4-002"]},"say2#2":{"g":["gr-5-015"]},"say2#3":{"g":["gr-5-015"]},"say2#4":{"p":["ph-5-0014"],"g":["gr-4-002","gr-5-011"]},"say2#5":{"p":["ph-5-0023"],"g":["gr-pre2-006","gr-4-003"]},"say2#6":{"g":["gr-4-002"]},"say2#7":{"p":["ph-5-0157"],"g":["gr-4-002","gr-5-011"]},"phone2#0":{"g":["gr-4-007"]},"phone2#1":{"p":["ph-pre2-0312"],"g":["gr-4-007","gr-5-015"]},"phone2#2":{"p":["ph-5-0007"],"g":["gr-4-008","gr-5-015"]},"phone2#3":{"p":["ph-5-0085"],"g":["gr-4-019","gr-5-013"]},"phone2#4":{"g":["gr-4-002","gr-4-003"]},"phone2#5":{"g":["gr-5-015"]},"phone2#6":{"g":["gr-4-007","gr-4-019"]},"phone2#7":{"p":["ph-5-0085"],"g":["gr-4-002","gr-5-015"]},"mail2#0":{"p":["ph-5-0078"],"g":["gr-5-015"]},"mail2#1":{"p":["ph-5-0014"],"g":["gr-4-002"]},"mail2#2":{"p":["ph-4-0150"],"g":["gr-5-015","gr-5-020"]},"mail2#3":{"p":["ph-5-0014"],"g":["gr-3-005","gr-4-026"]},"mail2#4":{"p":["ph-4-0112"],"g":["gr-4-006","gr-5-015"]},"mail2#5":{"g":["gr-5-013","gr-5-014"]},"say3#0":{"p":["ph-4-0141"],"g":["gr-4-002","gr-4-007"]},"say3#1":{"p":["ph-2-0495","ph-3-0007"],"g":["gr-4-019"]},"say3#2":{"p":["ph-5-0132"],"g":["gr-pre2-052","gr-4-002"]},"say3#3":{"p":["ph-4-0074"],"g":["gr-4-003","gr-4-019"]},"say3#4":{"p":["ph-5-0061"],"g":["gr-4-002","gr-4-019"]},"say3#5":{"p":["ph-2-0272","ph-pre2-0157"],"g":["gr-4-002"]},"say3#6":{"g":["gr-2-052"]},"say3#7":{"p":["ph-5-0014"],"g":["gr-5-017"]},"phone3#0":{"g":["gr-5-016"]},"phone3#1":{"p":["ph-2-0252","ph-2-0468"],"g":["gr-3-014"]},"phone3#2":{"p":["ph-5-0014"],"g":["gr-4-002"]},"phone3#3":{"g":["gr-4-002","gr-4-007"]},"phone3#4":{"p":["ph-2-0272"],"g":["gr-pre2-034","gr-4-019"]},"phone3#5":{"p":["ph-pre2-0289","ph-3-0126"],"g":["gr-4-002","gr-4-019"]},"phone3#6":{"p":["ph-4-0051"],"g":["gr-4-002","gr-4-008"]},"phone3#7":{"g":["gr-4-007"]},"mail3#0":{"p":["ph-2-0019","ph-pre2-0034"],"g":["gr-3-005","gr-4-002"]},"mail3#1":{"p":["ph-2-0017"],"g":["gr-3-005","gr-4-026"]},"mail3#3":{"p":["ph-2-0018","ph-2-0272"],"g":["gr-3-005","gr-4-002"]},"mail3#4":{"p":["ph-2-0021","ph-2-0252"],"g":["gr-2-052","gr-pre2-031"]},"mail3#5":{"p":["ph-5-0014"],"g":["gr-4-007"]},"mail3#6":{"g":["gr-4-002"]},"mail3#7":{"p":["ph-2-0272"],"g":["gr-2-030","gr-pre2-031"]},"letter3#0":{"p":["ph-5-0081"],"g":["gr-3-005","gr-3-007"]},"letter3#1":{"p":["ph-2-0149"],"g":["gr-2-043","gr-3-030"]},"letter3#2":{"p":["ph-3-0170"],"g":["gr-4-020"]},"letter3#3":{"p":["ph-5-0014"],"g":["gr-4-002","gr-4-019"]},"letter3#4":{"p":["ph-5-0061"],"g":["gr-4-002"]},"letter3#5":{"p":["ph-pre2-0184"],"g":["gr-2-059","gr-4-002"]},"gap3#2":{"g":["gr-pre2-033"]},"gap3#3":{"g":["gr-3-005","gr-4-019"]},"gap3#5":{"g":["gr-4-002"]},"gap3#6":{"g":["gr-3-033"]},"gap3#7":{"g":["gr-3-002","gr-3-021"]},"gap3#9":{"p":["ph-pre2-0289"],"g":["gr-3-018","gr-4-019"]},"proof3#0":{"g":["gr-3-005","gr-4-026"]},"proof3#1":{"g":["gr-4-006"]},"proof3#2":{"g":["gr-2-056"]},"proof3#3":{"p":["ph-4-0075"],"g":["gr-pre2-031","gr-3-005"]},"proof3#5":{"g":["gr-5-011"]},"say4#0":{"g":["gr-4-002"]},"say4#1":{"p":["ph-5-0061"],"g":["gr-3-014"]},"say4#2":{"p":["ph-2-0272","ph-pre2-0281"],"g":["gr-pre2-031"]},"say4#3":{"p":["ph-5-0014"],"g":["gr-4-002"]},"say4#4":{"g":["gr-pre2-015","gr-3-002"]},"say4#5":{"g":["gr-2-052","gr-3-007"]},"say4#6":{"g":["gr-2-015"]},"say4#7":{"p":["ph-pre2-0289"],"g":["gr-pre2-010","gr-3-002"]},"phone4#0":{"p":["ph-2-0048"],"g":["gr-2-066","gr-pre2-015"]},"phone4#1":{"p":["ph-pre2-0184"],"g":["gr-4-002"]},"phone4#2":{"p":["ph-5-0014"],"g":["gr-pre2-064","gr-3-005"]},"phone4#3":{"g":["gr-2-052","gr-3-007"]},"phone4#4":{"p":["ph-4-0128"],"g":["gr-3-002"]},"phone4#5":{"p":["ph-5-0014"],"g":["gr-3-002"]},"phone4#6":{"p":["ph-5-0014"],"g":["gr-3-014"]},"phone4#7":{"p":["ph-5-0085"],"g":["gr-2-030","gr-pre2-064"]},"mail4#0":{"p":["ph-2-0017","ph-2-0029"],"g":["gr-3-002"]},"mail4#1":{"p":["ph-2-0024"],"g":["gr-4-002"]},"mail4#2":{"g":["gr-4-002"]},"mail4#3":{"p":["ph-5-0014"],"g":["gr-4-002"]},"mail4#4":{"p":["ph-2-0474"],"g":["gr-4-007"]},"mail4#5":{"p":["ph-pre2-0193"],"g":["gr-pre2-015"]},"letter4#0":{"p":["ph-5-0014"],"g":["gr-pre2-001","gr-pre2-006"]},"letter4#1":{"p":["ph-5-0014"],"g":["gr-3-002"]},"letter4#2":{"g":["gr-pre2-015","gr-3-005"]},"letter4#3":{"g":["gr-pre2-052"]},"letter4#4":{"g":["gr-3-002"]},"letter4#5":{"g":["gr-2-052","gr-pre2-006"]},"gap4#0":{"g":["gr-3-002"]},"gap4#1":{"g":["gr-pre2-029"]},"gap4#2":{"g":["gr-3-005"]},"gap4#3":{"g":["gr-3-005"]},"gap4#4":{"p":["ph-5-0132"],"g":["gr-2-015"]},"gap4#5":{"g":["gr-2-043"]},"gap4#6":{"p":["ph-2-0226"],"g":["gr-pre2-033"]},"gap4#7":{"g":["gr-5-017"]},"gap4#8":{"g":["gr-pre1-034","gr-pre2-052"]},"proof4#0":{"p":["ph-5-0132"],"g":["gr-2-030","gr-pre2-064"]},"proof4#1":{"g":["gr-pre2-056"]},"proof4#2":{"g":["gr-2-056"]},"proof4#3":{"g":["gr-pre2-031","gr-3-005"]},"proof4#4":{"g":["gr-4-002"]},"say5#0":{"p":["ph-pre2-0157"],"g":["gr-1-004","gr-2-015"]},"say5#1":{"p":["ph-5-0132"],"g":["gr-2-001","gr-pre2-001"]},"say5#2":{"p":["ph-pre1-0460"],"g":["gr-2-052"]},"say5#3":{"g":["gr-5-013"]},"say5#4":{"g":["gr-pre2-064"]},"say5#5":{"p":["ph-2-0272"],"g":["gr-1-018","gr-1-001"]},"say5#6":{"g":["gr-2-023","gr-2-059"]},"say5#7":{"p":["ph-5-0014"],"g":["gr-5-017"]},"phone5#0":{"p":["ph-5-0004"],"g":["gr-2-045"]},"phone5#1":{"p":["ph-5-0014"],"g":["gr-2-030","gr-pre2-064"]},"phone5#2":{"p":["ph-2-0229"],"g":["gr-2-059"]},"phone5#3":{"p":["ph-5-0085"],"g":["gr-pre2-065","gr-pre2-052"]},"phone5#4":{"p":["ph-2-0047"],"g":["gr-pre2-034"]},"phone5#5":{"p":["ph-5-0055"],"g":["gr-1-004","gr-2-015"]},"phone5#6":{"g":["gr-4-020"]},"phone5#7":{"p":["ph-pre2-0281"],"g":["gr-5-015"]},"mail5#0":{"p":["ph-2-0048"],"g":["gr-2-066"]},"mail5#1":{"p":["ph-2-0152"],"g":["gr-1-006","gr-1-032"]},"mail5#2":{"p":["ph-2-0159"],"g":["gr-pre1-032","gr-pre2-015"]},"mail5#3":{"g":["gr-2-045","gr-pre2-031"]},"mail5#4":{"p":["ph-5-0014"],"g":["gr-pre2-015"]},"mail5#5":{"p":["ph-2-0149"],"g":["gr-2-043","gr-pre2-015"]},"mail5#6":{"p":["ph-2-0229"],"g":["gr-3-002"]},"mail5#7":{"p":["ph-2-0017","ph-2-0047"],"g":["gr-2-030","gr-2-052"]},"letter5#0":{"g":["gr-pre2-001"]},"letter5#1":{"p":["ph-pre1-0452"],"g":["gr-pre2-056"]},"letter5#2":{"g":["gr-3-007"]},"letter5#3":{"p":["ph-5-0014"],"g":["gr-pre2-006"]},"letter5#4":{"p":["ph-1-0079","ph-pre1-0282"],"g":["gr-3-002"]},"letter5#5":{"p":["ph-pre1-0461"],"g":["gr-2-045"]},"gap5#0":{"g":["gr-1-001","gr-2-012"]},"gap5#1":{"g":["gr-3-019"]},"gap5#2":{"g":["gr-1-004","gr-2-015"]},"gap5#3":{"g":["gr-2-043"]},"gap5#4":{"g":["gr-4-020"]},"gap5#5":{"g":["gr-4-005"]},"gap5#6":{"g":["gr-pre2-031","gr-pre2-013"]},"gap5#7":{"g":["gr-pre2-029"]},"gap5#8":{"g":["gr-pre2-065","gr-pre2-001"]},"gap5#9":{"g":["gr-5-017"]},"proof5#0":{"g":["gr-pre2-006"]},"proof5#1":{"g":["gr-pre2-031"]},"proof5#2":{"p":["ph-4-0143"],"g":["gr-pre2-006"]},"proof5#4":{"g":["gr-4-002"]},"proof5#5":{"g":["gr-3-030"]},"notice3#0":{"g":["gr-3-018","gr-4-002"]},"notice3#1":{"p":["ph-5-0014"],"g":["gr-4-002"]},"notice3#2":{"p":["ph-5-0055"],"g":["gr-4-002"]},"notice3#3":{"p":["ph-4-0143"],"g":["gr-3-018","gr-4-002"]},"notice3#4":{"g":["gr-4-008"]},"notice3#5":{"p":["ph-5-0167"],"g":["gr-2-030","gr-3-005"]},"notice3#6":{"g":["gr-2-030","gr-3-005"]},"notice3#7":{"p":["ph-4-0143"],"g":["gr-pre2-006","gr-4-002"]},"notice3#8":{"p":["ph-pre2-0289"],"g":["gr-3-018","gr-4-002"]},"notice3#9":{"p":["ph-3-0103"],"g":["gr-3-005","gr-4-002"]},"notice4#0":{"p":["ph-2-0152"],"g":["gr-4-006"]},"notice4#1":{"p":["ph-5-0014"],"g":["gr-3-007"]},"notice4#2":{"g":["gr-3-002","gr-3-005"]},"notice4#3":{"p":["ph-pre2-0288"],"g":["gr-2-030","gr-pre2-056"]},"notice4#4":{"p":["ph-2-0193"],"g":["gr-3-018"]},"notice4#5":{"p":["ph-5-0014"],"g":["gr-pre2-031"]},"notice4#6":{"p":["ph-4-0101"],"g":["gr-3-005"]},"notice4#7":{"p":["ph-5-0014"]},"notice5#0":{"p":["ph-pre1-0159"],"g":["gr-pre2-031"]},"notice5#1":{"g":["gr-3-005"]},"notice5#2":{"p":["ph-4-0143"],"g":["gr-3-002"]},"notice5#3":{"p":["ph-5-0055"],"g":["gr-2-030","gr-pre2-031"]},"notice5#4":{"g":["gr-3-005"]},"notice5#5":{"p":["ph-pre1-0448"],"g":["gr-3-005"]},"notice5#6":{"g":["gr-pre2-065"]},"notice5#7":{"p":["ph-5-0055"],"g":["gr-2-030"]},"desk3#0":{"g":["gr-4-005","gr-4-019"]},"desk3#1":{"p":["ph-4-0096"],"g":["gr-pre2-034","gr-4-019"]},"desk3#2":{"p":["ph-2-0272"],"g":["gr-3-007"]},"desk3#3":{"g":["gr-5-011"]},"desk3#4":{"g":["gr-4-019"]},"desk3#5":{"g":["gr-4-019"]},"desk3#6":{"g":["gr-3-019","gr-4-019"]},"desk3#7":{"p":["ph-5-0079"],"g":["gr-5-011"]},"desk3#8":{"g":["gr-3-021"]},"desk3#9":{"g":["gr-5-015"]},"desk4#0":{"g":["gr-3-021"]},"desk4#1":{"g":["gr-3-005"]},"desk4#2":{"p":["ph-4-0140"],"g":["gr-4-002"]},"desk4#3":{"g":["gr-3-002","gr-3-007"]},"desk4#4":{"p":["ph-5-0159"],"g":["gr-3-002","gr-3-007"]},"desk4#5":{"p":["ph-4-0151"]},"desk4#6":{"p":["ph-5-0159"],"g":["gr-3-007"]},"desk4#7":{"p":["ph-5-0007"],"g":["gr-pre2-065","gr-3-002"]},"desk4#8":{"g":["gr-3-002"]},"desk4#9":{"p":["ph-4-0140"],"g":["gr-5-015"]},"desk5#0":{"p":["ph-4-0151"],"g":["gr-3-002"]},"desk5#1":{"p":["ph-pre2-0289"],"g":["gr-4-002"]},"desk5#2":{"g":["gr-3-002"]},"desk5#4":{"p":["ph-pre2-0289"]},"desk5#5":{"g":["gr-3-002"]},"desk5#6":{"p":["ph-2-0272"],"g":["gr-3-005"]},"desk5#7":{"p":["ph-1-0441"],"g":["gr-pre2-013"]},"ask3#0":{"g":["gr-4-003","gr-4-006"]},"ask3#1":{"g":["gr-3-007","gr-4-002"]},"ask3#2":{"g":["gr-4-005"]},"ask3#3":{"p":["ph-5-0061"],"g":["gr-4-006"]},"ask3#4":{"g":["gr-3-005","gr-4-002"]},"ask3#5":{"g":["gr-4-003"]},"ask4#0":{"g":["gr-pre2-006"]},"ask4#1":{"g":["gr-4-003"]},"ask4#2":{"g":["gr-3-005"]},"ask4#3":{"g":["gr-2-056"]},"ask4#4":{"g":["gr-pre2-056"]},"ask4#5":{"g":["gr-4-019"]},"ask4#6":{"g":["gr-pre2-006","gr-3-002"]},"ask4#7":{"p":["ph-2-0200"],"g":["gr-5-015"]},"ask4#8":{"p":["ph-5-0128"],"g":["gr-4-002"]},"ask4#9":{"p":["ph-pre2-0289"],"g":["gr-2-015"]},"ask5#0":{"g":["gr-2-052"]},"ask5#1":{"g":["gr-4-006"]},"ask5#2":{"g":["gr-3-002"]},"ask5#3":{"g":["gr-2-030","gr-pre2-031"]},"ask5#4":{"g":["gr-pre2-015"]},"ask5#5":{"g":["gr-4-006"]},"ask5#6":{"g":["gr-4-002"]},"ask5#7":{"g":["gr-3-005"]},"body2#0":{"p":["ph-5-0157"],"g":["gr-4-002","gr-4-019"]},"body2#1":{"p":["ph-pre2-0310"],"g":["gr-4-002","gr-5-015"]},"body2#2":{"p":["ph-5-0167"],"g":["gr-5-011"]},"body2#3":{"g":["gr-5-015","gr-5-011"]},"body2#4":{"p":["ph-5-0007"],"g":["gr-5-015"]},"body2#5":{"p":["ph-5-0128"],"g":["gr-5-011"]},"body3#0":{"p":["ph-5-0157"],"g":["gr-4-002"]},"body3#1":{"p":["ph-pre2-0289"],"g":["gr-5-016"]},"body3#2":{"g":["gr-5-011"]},"body3#3":{"p":["ph-pre2-0310"],"g":["gr-4-011"]},"body3#4":{"p":["ph-5-0157"],"g":["gr-4-019"]},"body3#5":{"p":["ph-4-0096"],"g":["gr-pre2-034","gr-4-019"]},"body4#0":{"g":["gr-4-019"]},"body4#1":{"p":["ph-5-0133"],"g":["gr-pre2-015"]},"body4#2":{"p":["ph-5-0157"],"g":["gr-3-021"]},"body4#3":{"p":["ph-4-0151"],"g":["gr-5-015"]},"body4#4":{"p":["ph-5-0157"],"g":["gr-4-011"]},"body4#5":{"p":["ph-pre2-0289"],"g":["gr-4-019"]},"body5#0":{"p":["ph-pre2-0289"],"g":["gr-pre2-015","gr-pre2-034"]},"body5#1":{"g":["gr-3-002"]},"body5#2":{"g":["gr-4-002"]},"body5#3":{"g":["gr-3-002"]},"body5#4":{"g":["gr-3-002"]},"body5#5":{"g":["gr-3-005"]},"fam3#0":{"g":["gr-4-002","gr-4-006"]},"fam3#1":{"g":["gr-4-006","gr-4-007"]},"fam3#2":{"g":["gr-2-030","gr-3-005"]},"fam3#3":{"p":["ph-3-0103"],"g":["gr-3-005","gr-4-006"]},"fam3#4":{"p":["ph-pre2-0289"],"g":["gr-3-002"]},"fam3#5":{"p":["ph-5-0061"],"g":["gr-4-006","gr-4-007"]},"fam4#0":{"g":["gr-2-023","gr-pre2-033"]},"fam4#1":{"g":["gr-4-006"]},"fam4#2":{"g":["gr-3-002","gr-3-005"]},"fam4#3":{"g":["gr-3-005","gr-3-014"]},"fam5#0":{"g":["gr-pre2-006","gr-pre2-015"]},"fam5#1":{"g":["gr-4-019"]},"fam5#2":{"p":["ph-4-0075"],"g":["gr-pre2-031"]},"fam5#3":{"g":["gr-pre2-015"]},"fam5#4":{"p":["ph-5-0128"],"g":["gr-3-005"]},"fam5#5":{"g":["gr-2-030","gr-pre2-056"]},"desk3b#0":{"p":["ph-4-0096"],"g":["gr-pre2-006","gr-pre2-010"]},"desk3b#2":{"g":["gr-5-015"]},"desk3b#3":{"g":["gr-2-030","gr-3-002"]},"desk3b#4":{"g":["gr-pre2-006","gr-4-006"]},"desk3b#5":{"p":["ph-5-0157"],"g":["gr-3-002","gr-4-002"]},"desk3b#6":{"p":["ph-3-0019"],"g":["gr-4-002","gr-4-005"]},"desk4b#0":{"p":["ph-5-0014"],"g":["gr-pre2-006"]},"desk4b#1":{"g":["gr-4-002"]},"desk4b#2":{"p":["ph-2-0272"],"g":["gr-2-030","gr-pre2-064"]},"desk4b#3":{"g":["gr-2-030","gr-pre2-006"]},"desk4b#4":{"p":["ph-pre2-0289"],"g":["gr-5-015"]},"desk4b#5":{"p":["ph-4-0143"],"g":["gr-3-002"]},"desk5b#1":{"p":["ph-3-0155"],"g":["gr-3-002"]},"desk5b#2":{"g":["gr-pre2-006"]},"desk5b#3":{"g":["gr-3-002"]},"desk5b#4":{"g":["gr-5-017"]},"desk5b#5":{"p":["ph-4-0101"],"g":["gr-3-007"]},"ct1_sort":{"p":["ph-4-0096","ph-5-0002"],"g":["gr-4-019","gr-5-013"]},"ct1_card":{"p":["ph-5-0159"],"g":["gr-5-011"]},"ct1_day":{"g":["gr-5-011"]},"ct1_phone":{"g":["gr-5-011"]},"ct1_pad":{"p":["ph-5-0132"],"g":["gr-5-015","gr-5-016"]},"ct1_book":{"p":["ph-4-0149","ph-5-0133"],"g":["gr-3-030","gr-4-008"]},"ct1_ask":{"g":["gr-5-011","gr-5-015"]},"ct1_mail":{"g":["gr-5-015","gr-4-008"]},"ct2_sort":{"p":["ph-pre2-0126","ph-3-0170"],"g":["gr-4-007","gr-4-008"]},"ct2_rx":{"g":["gr-5-011"]},"ct2_dose":{"p":["ph-pre2-0174"]},"ct2_spoon":{"p":["ph-pre2-0174"]},"ct2_drops":{"p":["ph-pre2-0174"]},"ct2_card":{"g":["gr-5-011"]},"ct2_book":{"g":["gr-5-011"]},"ct2_addr":{"g":["gr-5-011"]},"ct2_fee":{"g":["gr-5-011"]},"ct2_pad":{"g":["gr-4-007","gr-5-011"]},"ct2_book2":{"p":["ph-5-0014"],"g":["gr-3-030","gr-4-007"]},"ct2_say":{"g":["gr-4-002","gr-5-015"]},"ct2_phone":{"g":["gr-5-015","gr-4-007"]},"ct2_mail":{"g":["gr-5-015","gr-4-002"]},"ct3_sort":{"p":["ph-pre2-0237","ph-3-0170"],"g":["gr-pre2-052","gr-pre2-056"]},"ct3_dose":{"g":["gr-3-002"]},"ct3_card":{"g":["gr-4-002"]},"ct3_bill":{"g":["gr-5-011"]},"ct3_result":{"p":["ph-4-0130"],"g":["gr-5-011"]},"ct3_shot":{"g":["gr-5-011"]},"ct3_child":{"g":["gr-5-011"]},"ct3_claim":{"g":["gr-5-011"]},"ct3_pad":{"p":["ph-pre2-0202"],"g":["gr-pre2-031","gr-3-005"]},"ct3_book":{"p":["ph-4-0096"],"g":["gr-pre2-034","gr-3-005"]},"ct3_say":{"g":["gr-4-002","gr-4-019"]},"ct3_phone":{"g":["gr-4-002","gr-4-007"]},"ct3_mail":{"g":["gr-3-005","gr-4-002"]},"ct3_letter":{"g":["gr-4-002","gr-3-005"]},"ct3_gap":{"g":["gr-4-019","gr-pre2-033"]},"ct3_proof":{"g":["gr-3-005","gr-4-026"]},"ct4_sort":{"p":["ph-pre2-0243"],"g":["gr-pre2-006","gr-3-002"]},"ct4_claim":{"g":["gr-3-002"]},"ct4_share":{"g":["gr-2-056"]},"ct4_repeat":{"p":["ph-4-0151"],"g":["gr-3-019"]},"ct4_result":{"g":["gr-pre2-031","gr-3-002"]},"ct4_dates":{"g":["gr-5-011"]},"ct4_stay":{"g":["gr-5-011"]},"ct4_pad":{"p":["ph-4-0141"],"g":["gr-2-056","gr-pre2-065"]},"ct4_book":{"p":["ph-5-0133"],"g":["gr-pre2-056","gr-3-005"]},"ct4_say":{"g":["gr-4-002","gr-3-002"]},"ct4_phone":{"g":["gr-pre2-064","gr-3-002"]},"ct4_mail":{"g":["gr-4-002","gr-3-002"]},"ct4_letter":{"g":["gr-pre2-006","gr-3-002"]},"ct4_gap":{"g":["gr-3-005","gr-3-002"]},"ct4_proof":{"g":["gr-2-030","gr-pre2-064"]},"ct5_sort":{"p":["ph-1-0568","ph-2-0405"],"g":["gr-pre1-024","gr-2-045"]},"ct5_terms":{"g":["gr-3-002"]},"ct5_pay":{"g":["gr-3-005"]},"ct5_refusal":{"g":["gr-3-002"]},"ct5_trial":{"g":["gr-5-011"]},"ct5_class":{"g":["gr-5-011"]},"ct5_report":{"p":["ph-4-0151"],"g":["gr-2-030"]},"ct5_pad":{"p":["ph-4-0141"],"g":["gr-3-005"]},"ct5_book":{"p":["ph-5-0014"],"g":["gr-pre2-031","gr-pre2-056"]},"ct5_say":{"g":["gr-1-004","gr-2-015"]},"ct5_phone":{"g":["gr-2-045","gr-2-030"]},"ct5_mail":{"g":["gr-pre2-015","gr-2-066"]},"ct5_letter":{"g":["gr-pre2-001","gr-pre2-056"]},"ct5_gap":{"g":["gr-1-001","gr-2-012"]},"ct5_proof":{"g":["gr-pre2-006","gr-pre2-031"]},"ct3_notice":{"g":["gr-4-002","gr-3-018"]},"ct4_notice":{"g":["gr-3-005","gr-4-006"]},"ct5_notice":{"g":["gr-3-005","gr-pre2-031"]},"ct3_triage":{"p":["ph-pre2-0296","ph-3-0170"],"g":["gr-2-030","gr-pre2-031"]},"ct4_triage":{"p":["ph-pre2-0201"],"g":["gr-2-030","gr-pre2-031"]},"ct5_triage":{"p":["ph-2-0272"],"g":["gr-pre2-013"]},"ct3_body":{"g":["gr-5-011"]},"ct4_leaflet":{"g":["gr-pre1-010","gr-2-030"]},"ct5_clause":{"g":["gr-5-011"]},"ct3_symptom":{"p":["ph-2-0272","ph-pre2-0124"],"g":["gr-2-052","gr-3-002"]},"ct4_symptom":{"p":["ph-2-0405","ph-2-0272"],"g":["gr-pre2-065","gr-pre2-006"]},"ct3_desk":{"g":["gr-4-019","gr-5-011"]},"ct4_desk":{"g":["gr-3-002","gr-3-007"]},"ct5_desk":{"g":["gr-3-002","gr-4-002"]},"ct3_ask":{"g":["gr-4-003","gr-4-006"]},"ct4_ask":{"g":["gr-pre2-006","gr-4-003"]},"ct5_ask":{"g":["gr-4-006","gr-2-052"]},"ct2_body":{"g":["gr-5-015","gr-5-011"]},"ct3_body2":{"g":["gr-4-019","gr-4-002"]},"ct4_body2":{"g":["gr-4-019","gr-pre2-015"]},"ct5_body2":{"g":["gr-3-002","gr-pre2-015"]},"ct3_fam":{"g":["gr-4-006","gr-4-007"]},"ct4_fam":{"g":["gr-3-005","gr-2-023"]},"ct5_fam":{"g":["gr-pre2-015","gr-pre2-006"]},"ct2_sort2":{"p":["ph-pre2-0243","ph-3-0170"],"g":["gr-pre2-031","gr-3-002"]},"ct3_sort2":{"p":["ph-3-0170"],"g":["gr-pre2-050","gr-3-002"]},"ct4_sort2":{"p":["ph-pre1-0074","ph-2-0197"],"g":["gr-pre2-056","gr-3-002"]},"ct5_sort2":{"p":["ph-pre1-0074","ph-2-0272"],"g":["gr-pre2-065"]},"ct3_sort3":{"p":["ph-2-0195","ph-3-0170"],"g":["gr-pre2-065","gr-3-002"]},"ct4_sort3":{"p":["ph-pre2-0201"],"g":["gr-2-052","gr-pre2-065"]},"ct5_sort3":{"p":["ph-1-0331","ph-pre1-0075"],"g":["gr-2-052","gr-pre2-001"]},"ct3_deskb":{"g":["gr-pre2-006","gr-3-002"]},"ct4_deskb":{"g":["gr-pre2-006","gr-2-030"]},"ct5_deskb":{"g":["gr-3-002","gr-pre2-006"]},"ct3_label":{"g":["gr-5-011"]},"ct4_discharge":{"g":["gr-5-011"]},"ct5_specrep":{"p":["ph-2-0223"],"g":["gr-5-011"]},"ct3_sort4":{"p":["ph-pre2-0199","ph-3-0170"],"g":["gr-pre2-031","gr-3-002"]},"ct4_sort4":{"p":["ph-2-0272"],"g":["gr-2-052","gr-pre2-065"]},"ct5_sort4":{"p":["ph-2-0223"],"g":["gr-pre2-065","gr-pre2-031"]}};

// ---------------------------------------------------------------------------------------------- the job

const BANKS: Record<string, QaItem[]> = { ...B1, ...B2, ...B3, ...B4, ...B5, ...BX, ...BD, ...BW, ...BB, ...BF, ...BN };

type Tagged = { id: string; phrases?: string[]; grammar?: string[] };
/** Phrase / grammar tags found in the task's own texts (tools: tags.gen) are added to the hand-written ones. */
function tagged<T extends Tagged>(x: T): T {
  const t = TAGS[x.id];
  if (!t) return x;
  const phrases = [...new Set([...(x.phrases ?? []), ...(t.p ?? [])])];
  const grammar = [...new Set([...(x.grammar ?? []), ...(t.g ?? [])])];
  return { ...x, ...(phrases.length ? { phrases } : {}), ...(grammar.length ? { grammar } : {}) };
}
const taggedBank = (bank: string, items: QaItem[]): QaItem[] =>
  items.map((q, i) => {
    const t = TAGS[`${bank}#${i}`];
    return t ? { ...q, ...(t.p?.length ? { phrases: t.p } : {}), ...(t.g?.length ? { grammar: t.g } : {}) } : q;
  });

const LEXICON = lex(LEX_SRC);

const SIGN = '{Harbour Clinic|@}';

const EN: JobContent = {
  sign: SIGN,
  lexicon: LEXICON.entries,
  pages: LEXICON.pages,
  forms: EXTRA_FORMS,
  people: [
    { id: 'p_vega', name: 'Ms. Vega', avatar: '👩' },
    { id: 'p_patel', name: '{Dr. Patel|@}', avatar: '🧑‍⚕️', staff: true },
    { id: 'p_moreau', name: '{Dr. Moreau|@}', avatar: '🧑‍⚕️', staff: true },
    { id: 'p_ito', name: 'Nurse Ito', avatar: '👩', staff: true },
    { id: 'p_costa', name: 'Mr. Costa', avatar: '👨', staff: true },
    { id: 'p_lund', name: 'Ms. Lund', avatar: '👩', staff: true },
    { id: 'c_scholar', name: '', avatar: '' },
    { id: 'c_merchant', name: '', avatar: '' },
    { id: 'c_student', name: '', avatar: '' },
    { id: 'c_boy', name: '', avatar: '' },
    { id: 'c_grandma', name: '', avatar: '' },
    { id: 'c_sailor', name: '', avatar: '' },
    { id: 'c_docker', name: '', avatar: '' },
    { id: 'c_cook', name: '', avatar: '' },
    { id: 'c_baker', name: '', avatar: '' },
    { id: 'c_doctor', name: '', avatar: '' },
    { id: 'c_mom', name: '', avatar: '' },
    { id: 'c_oldman', name: '', avatar: '' },
    { id: 'c_girl', name: '', avatar: '' },
  ],
  boss: 'p_vega',
  things: [],
  sort: {
    item: 'chart',
    bins: SECTIONS,
  },
  tasks: [...R1, ...R2, ...R3, ...R4, ...R5].map(tagged),
  templates: [...T1, ...T2, ...T3, ...T4, ...T5, ...TX, ...TY, ...TD, ...TW, ...TB, ...TF, ...TZ, ...TZ2, ...TN, ...TZ3].map(tagged),
  qa: Object.fromEntries(Object.entries(BANKS).map(([k, v]) => [k, taggedBank(k, v)])),
  reactions: REACTIONS,
  lines: LINES,
};

export const CLINIC_JOB: JobDef = {
  id: 'clinic',
  nameJa: '診療所の受付',
  blurbJa: '港の診療所〈ハーバー・クリニック〉の受付で働く（医療の助言はしない、書いてあることを読んで動く仕事）。患者の言葉で科（小児・歯・目・皮膚・心臓・骨…）に振り分け、処方箋や薬のラベルを医師のメモと、保険証を申込書と照らし合わせ、予約帳の空きに患者の都合を合わせ、患者の質問にリーフレットや決まりを読んで答え、電話の伝言を書く。健康・体・症状・薬・保険・予約・公衆衛生のお知らせの言葉。英検3級から1級まで、後半に厚み。',
  icon: '🏥',
  domains: ['health', 'body', 'family', 'money', 'communication', 'emotion', 'society', 'science'],
  archetypes: ['sort', 'check', 'respond'],
  ranks: [
    { rank: 1, need: { good: 0, words: 0 }, level: { eiken: '3', toeic: 400 }, tasks: 4, noteJa: '患者の一言から小児・歯・目の窓口へ振り分ける。患者カードと用紙、薬のラベルと医師のメモ（名前・誕生日・回数・日にち）を見比べる。掲示を読んで答え、電話の伝言と予約帳の空きを選ぶ。英検3級。' },
    { rank: 2, need: { good: 12, words: 30 }, level: { eiken: 'pre2', toeic: 600 }, unlocks: ['long'], tasks: 5, reward: { coins: 12 }, noteJa: '皮膚・心臓・骨・薬局・会計が加わる。処方箋と医師のメモの食い違い（薬・量・日数）、保険証。リーフレットや決まりを読んで患者に答える。予約の条件がふたつに。英検準2級。' },
    { rank: 3, need: { good: 24, words: 75 }, level: { eiken: '2', toeic: 730 }, unlocks: ['multiStep', 'audioOnly', 'timed'], tasks: 5, reward: { coins: 20 }, noteJa: '検査・採血・予防接種・救急・保険の窓口。食い違う欄を見つけたら正しい値も選ぶ。紹介状・請求書・同意書。メモと矛盾する一文を探す。耳だけの電話。時間制限（選んだときだけ）。英検2級。' },
    { rank: 4, need: { good: 51, words: 140 }, level: { eiken: 'pre1', toeic: 860 }, tasks: 6, reward: { coins: 30 }, noteJa: '耳鼻科・女性外来・心の健康・紹介の窓口、高齢の患者。自己負担・免責・同意・守秘の決まりを読み取る。長い手紙やメール、条件つきの予約。英検準1級。' },
    { rank: 5, need: { good: 78, words: 205 }, level: { eiken: '1', toeic: 990 }, tasks: 6, reward: { coins: 50 }, noteJa: '灯台：受付の右腕。保険会社の支払い拒否と不服申し立て、同意書、免責条項、感染症のお知らせ、請求の食い違いを読み解く。倒置・仮定法・譲歩の文を完成させる問題もある。英検1級。' },
  ],
  wage: { perfect: 4, minor: 2, fail: 0, bad: 0 },
  opensAfter: 5,
  hours: [0, 1],
  building: 'clinic',
  content: { en: EN },
  flavour: 'school',
};
