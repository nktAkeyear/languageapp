import type { VerificationPage } from '../../core/types';
import type { AuthoredTask, CheckDoc, JobContent, JobDef, JobLexEntry, QaItem, TaskFeature, TaskTemplate } from '../../jobs/types';

/**
 * Newspaper office (新聞社): the Harbour Courier. A small harbour-town daily that thickens the upper levels: the five
 * ranks climb from 英検3級 to 英検1級 (TOEIC 〜400 / 〜600 / 〜730 / 〜860 / 〜990), with the weight on ranks 3-5.
 *
 * - sort: wire stories and headlines to the paper's sections (town, sport, weather, business, politics, courts,
 *   science, environment, arts, opinion, health, world …).
 * - check: a draft / caption / fact box / quotation against the reporter's notes (exactly one discrepancy, or none);
 *   from rank 3 the right value must also be chosen.
 * - respond: readers' letters and sources' e-mails answered, headlines and captions chosen, the sentence of a draft that
 *   contradicts the notes found (proofreading for meaning), the telephone (message pad), the page plan (one free slot).
 *
 * The running story: Ms. Carver's first week as the editor; Mr. Moss and his photographs; the harbour bridge that
 * the council argues about for months; Professor Hale's letters; Mr. Grant's advertisements; the trial of the
 * fish-market fraud; the election; and, at the top rank, the libel claim, the correction on page two and the
 * paper's hundredth birthday.
 *
 * Authoring notes: new words are met where the layout, the numbers or the consequence of a wrong action make the
 * meaning inferable, at most four to a task; later tasks reuse them. The lexicon below is generated from the
 * words the texts use (headwords from data/english/vocab.json; levels, glosses and domains come from the list),
 * grouped into 検証ページ in the order the spine meets them. Tasks and templates carry phrase / grammar tags
 * (data/english/phrases.json, grammar.json) found in their own texts.
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

/** The page plan of the paper: pages (rows) × places on the page (columns). */
const PAGES3: Axis[] = [{ id: 'p1', label: 'Page 1' }, { id: 'p2', label: 'Page 2' }, { id: 'p3', label: 'Page 3' }];
const SPOTS2: Axis[] = [{ id: 'top', label: 'Top' }, { id: 'low', label: 'Bottom' }];
const PAGES4: Axis[] = [{ id: 'p1', label: 'Page 1' }, { id: 'p2', label: 'Page 2' }, { id: 'p3', label: 'Page 3' }, { id: 'p4', label: 'Page 4' }];
const SPOTS3: Axis[] = [{ id: 'top', label: 'Top' }, { id: 'mid', label: 'Middle' }, { id: 'low', label: 'Bottom' }];
const PAGES5: Axis[] = [{ id: 'p1', label: 'Front page' }, { id: 'p2', label: 'Page 2' }, { id: 'p3', label: 'Page 3' }, { id: 'p4', label: 'Page 4' }, { id: 'p5', label: 'Page 5' }];

/** The paper's sections: the sorting cabinet. `ref` is how a reaction names the section. */
const sec = (id: string, label: string) => ({ id, label, ref: label });
const SECTIONS = [
  sec('town', 'Town news'), sec('sport', 'Sports'), sec('weather', 'Weather'),
  sec('business', 'Business'), sec('world', 'World news'), sec('arts', 'Arts'),
  sec('politics', 'Politics'), sec('crime', 'Crime and courts'), sec('science', 'Science'), sec('health', 'Health'), sec('opinion', 'Opinion'), sec('environment', 'Environment'),
  sec('features', 'Features'), sec('letters', 'Letters'), sec('travel', 'Travel'),
  sec('editorial', 'Editorials'), sec('corrections', 'Corrections'), sec('obits', 'Obituaries'),
];

// ---------------------------------------------------------------------------------------------- rank 1 (英検3級, TOEIC 〜400)
// The first week at the paper: stories to the pages, a photograph and its caption, short notes, what a reader asks.

const R1: AuthoredTask[] = [
  sort('n1_first', 1, 1, 'p_carver', 'Good morning! Please put the stories on the right pages.', ['town', 'sport', 'weather'], [
    ['Rain on Sunday', 'weather'], ['Our team won 3 to 1', 'sport'], ['The new school is open', 'town'],
  ]),
  check('n1_photo', 1, 2, 'p_moss', 'Look at my photo notes and the caption. Is the place right?', [
    paper('note', 'Photo notes', [['name', 'Name', '{Captain Reed|@}'], ['place', 'Place', 'the harbour']]),
    paper('label', 'Caption', [['name', 'Name', '{Captain Reed|@}'], ['place', 'Place', 'the school']]),
  ], 'place'),
  msg('n1_time', 1, 3, 'c_student', 'memo', { say: 'What time can I buy the newspaper?' }, ['{The Harbour Courier|@}', 'Out every morning at six.', 'Price: two coins'],
    'You can buy it at six in the morning.', ['You can buy it at six in the evening.', 'You can buy it at nine in the morning.']),
  sort('n1_sport', 1, 4, 'p_carver', 'More stories! Which page is each one for?', ['town', 'sport', 'weather'], [
    ['A strong wind on Sunday', 'weather'], ['The boys won the race', 'sport'], ['A fire at the school', 'town'], ['It is very cold today', 'weather'],
  ]),
  check('n1_age', 1, 5, 'p_abbott', 'Please check the name and the age on the story card.', [
    paper('note', "Reporter's notes", [['name', 'Name', '{Mrs. Hill|@}'], ['age', 'Age', '72']]),
    paper('card', 'Story card', [['name', 'Name', '{Mrs. Hill|@}'], ['age', 'Age', '27']]),
  ], 'age'),
  msg('n1_sunday', 1, 6, 'c_boy', 'memo', { say: 'How much is the newspaper on Sunday?' }, ['PRICE LIST', 'Monday to Saturday: two coins', 'Sunday: three coins'],
    'It is three coins.', ['It is two coins.', 'It is five coins.']),
  msg('n1_hale', 1, 7, 'p_carver', 'letter', { from: '{Professor Hale|@}' }, ['Dear Editor,', 'I read your story about the school on Monday.', 'It is a very good story.', 'Thank you.'],
    'He liked the story about the school.', ['He did not like the story about the school.', 'He liked the story about the bridge.']),
  pad('n1_grant', 1, 8, 'p_carver', ['Hello, this is {Mr. Grant|@}.', 'I want a small ad in the paper.', 'Please call me at six.'], [
    ['who', 'Who', '{Mr. Grant|@}', ['{Mr. Lin|@}', '{Mr. Bell|@}']],
    ['about', 'About', 'a small ad', ['a big photo', 'a new story']],
    ['when', 'Call', 'at six', ['at nine', 'at noon']],
  ], { say: 'The phone! I am busy. Please write the message.' }),
  slot('n1_plan', 1, 9, 'p_carver', 'memo', ['Dear all,', 'The new sports story goes on Page 3.', 'It needs the top of the page.'], PAGES3, SPOTS2, ['p3', 'top'], [], 'p3-top', ['Town', 'Ad', 'Weather', 'Sports'],
    { say: 'Look at the plan. Where does the sports story go?', extraBusy: ['p1-top', 'p2-top', 'p1-low'] }),
  check('n1_rain', 1, 10, 'p_abbott', 'Is the day right in the weather story?', [
    paper('note', 'Weather notes', [['what', 'Weather', 'rain'], ['day', 'Day', 'Friday']]),
    paper('card', 'Story card', [['what', 'Weather', 'rain'], ['day', 'Day', 'Thursday']]),
  ], 'day'),
  msg('n1_ad', 1, 11, 'c_merchant', 'memo', { say: 'How much is a small ad?' }, ['ADS', 'A small ad is five coins a day.', 'A big ad is ten coins a day.'],
    'A small ad is five coins a day.', ['A small ad is ten coins a day.', 'A big ad is five coins a day.']),
  sort('n1_more', 1, 12, 'p_carver', 'The last ones for today. Please look at them well.', ['town', 'sport', 'weather'], [
    ['Snow on Monday', 'weather'], ['Our boys play on Saturday', 'sport'], ['A new shop on Harbour Street', 'town'], ['It will be sunny tomorrow', 'weather'],
  ]),
  check('n1_boys', 1, 13, 'p_abbott', 'Please check the number in this sports story.', [
    paper('note', "Reporter's notes", [['what', 'Game', 'the race'], ['boys', 'Boys', '12']]),
    paper('card', 'Story card', [['what', 'Game', 'the race'], ['boys', 'Boys', '21']]),
  ], 'boys'),
  msg('n1_office', 1, 14, 'c_scholar', 'memo', { say: 'Can I bring my story on Saturday?' }, ['Please bring your stories before five on Monday to Friday.', 'The office is closed on Saturday and Sunday.'],
    'No. The office is closed on Saturday.', ['No. The office is closed on Friday.', 'Yes. Please bring it before five on Saturday.']),
  msg('n1_caption', 1, 15, 'p_moss', 'memo', { say: 'Which caption is right for my photo?' }, ['Photo: two girls and a dog', 'Place: the park', 'Day: Sunday'],
    'Two girls and a dog in the park on Sunday.', ['Two boys and a dog in the park on Sunday.', 'Two girls and a dog in the park on Monday.']),
  pad('n1_tan', 1, 16, 'p_carver', ['Hello, this is {Ms. Tan|@}.', 'I am at the market.', 'Please send {Mr. Moss|@} here at ten.'], [
    ['who', 'Who', '{Ms. Tan|@}', ['{Ms. Idris|@}', '{Mr. Abbott|@}']],
    ['where', 'Where', 'the market', ['the school', 'the station']],
    ['when', 'Time', 'at ten', ['at one', 'at two']],
  ], { say: 'Another call! Please write the message.' }),
  msg('n1_headline', 1, 17, 'p_abbott', 'memo', { say: 'Which headline is right?' }, ['The market opens on Monday.', 'It has twenty new stalls.', 'It is by the river.'],
    'New market with 20 stalls opens on Monday', ['New market with 12 stalls opens on Monday', 'New market with 20 stalls opens on Sunday']),
  check('n1_ok', 1, 18, 'p_moss', 'And this photo? Please check it, too.', [
    paper('note', 'Photo notes', [['name', 'Name', '{Nora|@}'], ['place', 'Place', 'the station']]),
    paper('label', 'Caption', [['name', 'Name', '{Nora|@}'], ['place', 'Place', 'the station']]),
  ], null),
  msg('n1_visit', 1, 19, 'c_boy', 'memo', { say: 'Can I visit the newspaper office?' }, ['VISITS', 'Please come on Saturday at ten.', 'Come with your teacher.'],
    'Yes. Please come on Saturday at ten.', ['Yes. Please come on Sunday at ten.', 'Yes. Please come on Saturday without your teacher.']),
  msg('n1_letters', 1, 20, 'c_grandma', 'memo', { say: 'I want to write to the newspaper.' }, ['LETTERS', 'Please write to us.', 'Use 100 words or fewer.'],
    'Yes. Please use 100 words or fewer.', ['Yes. Please use 100 words or more.', 'Yes. Please write 10 words or fewer.']),
];

// ---------------------------------------------------------------------------------------------- rank 1 templates and banks

/** [question, right reply, function, two near misses] */
type Q = [string, string, string, [string, string]];
const bank = (rank: number, items: Q[]): QaItem[] => items.map(([q, a, fn, near]) => ({ q, a, fn, rank, near }));

const QA_SAY1 = bank(1, [
  ['I want to put an ad in the paper on Friday.', 'Sure. Your ad will be in the paper on Friday.', 'ad', ['Sure. Your ad will be in the paper on Monday.', 'Sure. Your ad will not be in the paper.']],
  ['I want ten newspapers, please. I am {Mr. Grant|@}.', 'Ten newspapers, {Mr. Grant|@}? Here you are.', 'buy', ['Two newspapers, {Mr. Grant|@}? Here you are.', 'Ten newspapers, {Captain Reed|@}? Here you are.']],
  ['The story about the school is on Page 3.', 'Thank you. I will read Page 3.', 'page', ['Thank you. I will read Page 8.', 'Thank you. I will read the weather page.']],
  ['Thank you for your help.', 'You are welcome.', 'thanks', ['Yes, please.', 'I am sorry.']],
  ['I am sorry. I am late.', 'That is all right.', 'apology', ['You are welcome.', 'Thank you, but I am not late.']],
  ['The photo is of two boys in the park.', 'Good. I will write the caption: two boys in the park.', 'caption', ['Good. I will write the caption: two girls in the park.', 'Good. I will write the caption: two boys at the school.']],
  ['Do you have the newspaper from last Monday?', 'Yes. Here is the paper from last Monday.', 'old', ['Yes. Here is the paper from last Friday.', 'No. Here is the paper from last Monday.']],
  ['Can you take a photo of my shop on Tuesday?', 'Yes. {Mr. Moss|@} can come on Tuesday.', 'photo', ['Yes. {Mr. Moss|@} can come on Wednesday.', 'Yes. {Mr. Moss|@} can not come on Tuesday.']],
  ['My name is {Big Joe|@}. I have a story for the paper.', 'Thank you, {Big Joe|@}. Please give the story to {Ms. Idris|@}.', 'story', ['Thank you, {Nora|@}. Please give the story to {Ms. Idris|@}.', 'Thank you, {Big Joe|@}. The story is on Page 3.']],
]);

const QA_MAIL1 = bank(1, [
  ['Dear Editor, I like your sports page. My team won on Saturday.', 'Thank you. We are glad that your team won on Saturday.', 'sport', ['Thank you. We are sorry that your team lost on Saturday.', 'Thank you. We are glad that your team won on Monday.']],
  ['Dear Editor, the weather story on Friday was wrong. It did not rain.', 'We are sorry. The weather story on Friday was wrong.', 'weather', ['We are sorry. The weather story on Friday was right.', 'We are glad. The weather story on Monday was wrong.']],
  ['Dear Editor, please send me the paper from Sunday.', 'Yes. We will send you the paper from Sunday.', 'send', ['Yes. We will send you the paper from Monday.', 'Yes. We will not send you the paper from Sunday.']],
  ['Dear Editor, I have a photo of the new bridge. Do you want it?', 'Yes, please. We want a photo of the new bridge.', 'photo', ['Yes, please. We want a photo of the new school.', 'No, thank you. We want a photo of the new bridge.']],
  ['Dear {Ms. Carver|@}, I want to work for your paper. Can I come on Monday?', 'Yes. Please come to the office on Monday.', 'work', ['Yes. Please come to the office on Friday.', 'Yes. Please come to the market on Monday.']],
  ['Dear Editor, my name was wrong in your story. It is {Grandma Rose|@}, not {Rosa|@}.', 'We are sorry. Your name is {Grandma Rose|@}.', 'name', ['We are sorry. Your name is {Rosa|@}.', 'We are glad. Your name was right in the story.']],
]);

const B1: Record<string, QaItem[]> = { news1: QA_SAY1, mail1: QA_MAIL1 };
const NEWS_SECTIONS_1 = ['town', 'sport', 'weather'];
const T1: TaskTemplate[] = [
  { id: 'nt1_sort', rank: 1, arch: 'sort', say: 'Please put the stories on the right pages.', count: [3, 4], bins: NEWS_SECTIONS_1,
    patterns: [
      { text: 'Rain on Sunday', bins: ['weather'] }, { text: 'Snow on Monday', bins: ['weather'] }, { text: 'A strong wind on Friday', bins: ['weather'] }, { text: 'It is very cold today', bins: ['weather'] }, { text: 'Sun and wind tomorrow', bins: ['weather'] }, { text: 'A warm week is coming', bins: ['weather'] },
      { text: 'Our team won 3 to 1', bins: ['sport'] }, { text: 'The boys won the race', bins: ['sport'] }, { text: 'Our boys play on Saturday', bins: ['sport'] }, { text: 'A big game on Sunday', bins: ['sport'] }, { text: 'The girls lost 2 to 0', bins: ['sport'] },
      { text: 'The new school is open', bins: ['town'] }, { text: 'A fire at the school', bins: ['town'] }, { text: 'A new shop on Harbour Street', bins: ['town'] }, { text: 'The market opens on Monday', bins: ['town'] }, { text: 'A new bus for the town', bins: ['town'] },
    ] },
  { id: 'nt1_age', rank: 1, arch: 'check', say: 'Please check the name and the age on the story card.', fields: [
    { id: 'name', label: 'Name', values: ['{Mrs. Hill|@}', '{Mr. Grant|@}', '{Captain Reed|@}', '{Professor Hale|@}', '{Big Joe|@}'] },
    { id: 'age', label: 'Age', range: [21, 79] },
  ], docs: [{ kind: 'note', title: "Reporter's notes", fields: ['name', 'age'] }, { kind: 'card', title: 'Story card', fields: ['name', 'age'] }], target: 1, pWrong: 0.6 },
  { id: 'nt1_place', rank: 1, arch: 'check', say: 'Look at my photo notes and the caption. Is it right?', fields: [
    { id: 'name', label: 'Name', values: ['{Captain Reed|@}', '{Nora|@}', '{Tom|@}', '{Grandma Rose|@}', '{Big Joe|@}'] },
    { id: 'place', label: 'Place', values: ['the harbour', 'the school', 'the market', 'the station', 'the park'] },
  ], docs: [{ kind: 'note', title: 'Photo notes', fields: ['name', 'place'] }, { kind: 'label', title: 'Caption', fields: ['name', 'place'] }], target: 1, pWrong: 0.6 },
  { id: 'nt1_day', rank: 1, arch: 'check', say: 'Is the day right in the weather story?', fields: [
    { id: 'what', label: 'Weather', values: ['rain', 'snow', 'wind', 'sun'] },
    { id: 'day', label: 'Day', values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  ], docs: [{ kind: 'note', title: 'Weather notes', fields: ['what', 'day'] }, { kind: 'card', title: 'Story card', fields: ['what', 'day'] }], target: 1, pWrong: 0.6 },
  { id: 'nt1_boys', rank: 1, arch: 'check', say: 'Please check the numbers in this sports story.', fields: [
    { id: 'what', label: 'Game', values: ['the game', 'the match', 'the cup game'] },
    { id: 'boys', label: 'Boys', range: [11, 29] },
    { id: 'goals', label: 'Goals', range: [2, 9] },
  ], docs: [{ kind: 'note', title: "Reporter's notes", fields: ['what', 'boys', 'goals'] }, { kind: 'card', title: 'Story card', fields: ['what', 'boys', 'goals'] }], target: 1, pWrong: 0.65 },
  { id: 'nt1_pad', rank: 1, arch: 'respond', mode: 'form', kind: 'phone', say: 'The phone! I am busy. Please write the message.', lines: ['Hello, this is {who}.', 'I am at {where}.', 'Please send {Mr. Moss|@} here at {when}.'],
    fields: [
      { id: 'who', label: 'Who', values: ['{Ms. Tan|@}', '{Ms. Idris|@}', '{Mr. Abbott|@}', '{Mr. Grant|@}'] },
      { id: 'where', label: 'Where', values: ['the market', 'the school', 'the station', 'the park'] },
      { id: 'when', label: 'Time', values: ['ten', 'one', 'two', 'four'] },
    ] },
  { id: 'nt1_plan', rank: 1, arch: 'respond', mode: 'slot', kind: 'memo', say: 'Look at the plan, please. Where does the story go?', layout: 'calendar', rows: PAGES3, cols: SPOTS2,
    want: [
      { tag: 'p1', text: 'The story goes on Page 1.' }, { tag: 'p2', text: 'The story goes on Page 2.' }, { tag: 'p3', text: 'The story goes on Page 3.' },
      { tag: 'top', text: 'It needs the top of the page.' }, { tag: 'low', text: 'It needs the bottom of the page.' },
    ],
    avoid: [{ tag: 'p1', text: 'It is not for Page 1.' }, { tag: 'p3', text: 'It is not for Page 3.' }, { tag: 'low', text: 'It is not for the bottom.' }],
    busy: ['Town', 'Ad', 'Weather', 'Sports'], open: ['Dear all,'], close: ['Thank you.'] },
  { id: 'nt1_ask', rank: 1, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'news1' },
  { id: 'nt1_mail', rank: 1, arch: 'respond', mode: 'choose', kind: 'email', bank: 'mail1' },
];

// ---------------------------------------------------------------------------------------------- rank 2 (英検準2級, TOEIC 〜600)
// Business, world and arts join the pages. Notes and stories disagree on places, sums, numbers of people and days;
// readers write about tickets, subscriptions and mistakes; the first tasks about a sum or a condition.

const R2: AuthoredTask[] = [
  sort('n2_sort1', 2, 1, 'p_carver', 'Please put the new stories on the right pages.', ['town', 'business', 'sport'], [
    ['The bank will open a new office in July', 'business'], ['Our team won the cup', 'sport'], ['The old bridge is open again', 'town'],
  ]),
  check('n2_visitors', 2, 2, 'p_idris', 'The festival was a big success. Please check the number of visitors in my story.', [
    note('Reporter notes', ['Festival: Saturday', 'Visitors: 3,000']),
    paper('card', 'Story card', [['day', 'Day', 'Saturday'], ['visitors', 'Visitors', '300']]),
  ], 'visitors'),
  msg('n2_tickets', 2, 3, 'c_mom', 'memo', { say: 'I will bring my son, who is ten. How much are the concert tickets for the two of us?' }, ['CONCERT TICKETS', 'Adults: 12 coins', 'Children under twelve: 6 coins'],
    'The two tickets are 18 coins.', ['The two tickets are 24 coins.', 'The two tickets are 12 coins.']),
  pad('n2_accident', 2, 4, 'p_carver', ['Hello, this is {Ms. Idris|@}.', 'I am at the police station.', 'The accident was at eight o\'clock, and two people were hurt.'], [
    ['who', 'Who', '{Ms. Idris|@}', ['{Ms. Tan|@}', '{Mr. Moss|@}']],
    ['where', 'Where', 'the police station', ['the hospital', 'the harbour']],
    ['when', 'Time', 'eight o\'clock', ['seven o\'clock', 'nine o\'clock']],
    ['hurt', 'Hurt', 'two people', ['three people', 'ten people']],
  ], { say: 'A call from the police station! Please take the message.' }),
  msg('n2_winner', 2, 5, 'p_moss', 'memo', { say: 'Which caption goes with my photo of the boat race?' }, ['Photo: {Nora|@} with a prize', 'Race: the boat race', 'Prize: second prize', 'Day: Saturday'],
    '{Nora|@} won second prize in the boat race on Saturday.', ['{Nora|@} won first prize in the boat race on Saturday.', '{Nora|@} won second prize in the bicycle race on Saturday.']),
  check('n2_temp', 2, 6, 'p_abbott', 'The temperature is wrong in my weather story, I think. Please look.', [
    paper('note', 'Weather notes', [['temp', 'Temperature', '12 degrees'], ['next', 'Tomorrow', 'rain']]),
    paper('card', 'Story card', [['temp', 'Temperature', '21 degrees'], ['next', 'Tomorrow', 'rain']]),
  ], 'temp'),
  msg('n2_mayor', 2, 7, 'p_carver', 'email', { from: '{Ms. Hart|@}', subject: 'The mayor' }, ['Dear Editor,', 'The mayor can meet your reporter on Tuesday at ten.', 'Please come to the Town Hall.', 'Thank you,', '{Ms. Hart|@}'],
    'The mayor will meet a reporter on Tuesday at ten.', ['The mayor will meet a reporter on Thursday at ten.', 'The mayor will not meet a reporter this week.']),
  slot('n2_plan', 2, 8, 'p_carver', 'memo', ['Dear all,', 'The story about the library is long, so it needs the top of a page.', 'Page 1 is full. Please do not use Page 3, because the weather map is there.'], PAGES3, SPOTS2, ['top'], ['p1', 'p3'], 'p2-top', ['Business', 'Ad', 'Weather map', 'World'],
    { say: 'Look at the plan, please. Where can the library story go?', extraBusy: ['p1-low', 'p3-top'] }),
  sort('n2_sort2', 2, 9, 'p_carver', 'Here are more stories. Please look at them well.', ['town', 'world', 'weather'], [
    ['Two countries agree to stop the fight', 'world'], ['The new school is open', 'town'], ['Snow on Monday', 'weather'], ['The new market opens on Monday', 'town'],
  ]),
  msg('n2_library', 2, 10, 'p_abbott', 'memo', { say: 'Which headline is right for this story?' }, ['The town will build a new library.', 'It will cost two million coins.'],
    'New library will cost two million coins', ['New library will cost twelve million coins', 'New library will cost 2,000 coins']),
  check('n2_ok', 2, 11, 'p_idris', 'Is my story about the bank right? I think so.', [
    note('Reporter notes', ['The bank will give 50 new jobs.', 'The office is on Harbour Street.']),
    paper('card', 'Story card', [['jobs', 'New jobs', '50'], ['street', 'Street', 'Harbour Street']]),
  ], null),
  msg('n2_wrongday', 2, 12, 'p_carver', 'letter', { from: '{Professor Hale|@}' }, ['Dear Editor,', 'Your story on Friday said that the library is closed on Mondays.', 'It is closed on Tuesdays, not on Mondays.', 'Please tell your readers.'],
    'We are sorry. The library is closed on Tuesdays, not on Mondays.', ['We are sorry. The library is closed on Mondays, not on Tuesdays.', 'We are glad. The library is open on Tuesdays, not on Mondays.']),
  pad('n2_ad', 2, 13, 'p_carver', ['This is {Mr. Grant|@} again.', 'I want a big ad in Saturday\'s paper.', 'Please call me back before noon.'], [
    ['who', 'Who', '{Mr. Grant|@}', ['{Captain Reed|@}', '{Professor Hale|@}']],
    ['what', 'Ad', 'a big ad', ['a small ad', 'a new story']],
    ['day', 'Paper', 'Saturday', ['Sunday', 'Friday']],
    ['when', 'Call back', 'before noon', ['after noon', 'before ten']],
  ], { say: '{Mr. Grant|@} is on the phone. Please write the message.' }),
  msg('n2_year', 2, 14, 'c_student', 'memo', { say: 'I want the paper for a whole year. How much is it?' }, ['SUBSCRIBE', 'Three months: 30 coins', 'A year: 100 coins', 'Pay at the office or by post.'],
    'A year is 100 coins.', ['A year is 30 coins.', 'A year is 300 coins.']),
  check('n2_quote', 2, 15, 'p_idris', 'I put the mayor\'s words in my story. Please check the day.', [
    note('Reporter notes', ['The mayor said: "The bridge will close on Monday."']),
    paper('card', 'Mayor', [['who', 'Said by', 'the mayor'], ['day', 'The bridge will close on', 'Friday']]),
  ], 'day'),
  msg('n2_correct', 2, 16, 'c_scholar', 'memo', { say: 'Where can I find the correction to the story?' }, ['CORRECTIONS', 'If a story is wrong, we print a correction on Page 2 the next day.'],
    'It will be on Page 2 the next day.', ['It will be on Page 1 the next day.', 'It will be on Page 2 the same day.']),
  sort('n2_sort3', 2, 17, 'p_carver', 'The last stories for today. Please look at them well.', ['sport', 'business', 'arts'], [
    ['A film about the sea opens on Friday', 'arts'], ['Tea prices are higher this week', 'business'], ['The girls won the cup', 'sport'], ['Our team lost 2 to 0', 'sport'],
  ]),
  msg('n2_late', 2, 18, 'c_boy', 'phone', { say: 'Hello? I did not get my paper this morning.' }, ['Hello? I did not get my paper this morning.', 'My name is {Tom|@}. I live on Station Road.'],
    'I am sorry, {Tom|@}. We will send another paper to Station Road today.', ['I am sorry, {Tom|@}. We will send another paper to Harbour Road today.', 'I am sorry, {Captain Reed|@}. We will send another paper to Station Road today.']),
  check('n2_prize', 2, 19, 'p_moss', 'Is the prize right in this caption?', [
    note('Photo notes', ['The winner of the cooking race got 100 coins.']),
    paper('label', 'Caption', [['what', 'Race', 'the cooking race'], ['prize', 'Prize', '1,000 coins']]),
  ], 'prize'),
  msg('n2_headline2', 2, 20, 'p_abbott', 'memo', { say: 'And this one? Which headline is right?' }, ['The company will close its factory in March.', 'Sixty people will lose their jobs.'],
    'Company to close factory in March: 60 lose jobs', ['Company to close factory in May: 60 lose jobs', 'Company to close factory in March: 16 lose jobs']),
];

// ---------------------------------------------------------------------------------------------- rank 2 templates and banks

const QA_SAY2 = bank(2, [
  ['I would like to put a small ad in Saturday\'s paper.', 'Certainly. Your ad will be in the paper on Saturday.', 'ad', ['Certainly. Your ad will be in the paper on Sunday.', 'Certainly. Your ad will not be in the paper on Saturday.']],
  ['Could you tell me when the festival starts? I read that it is on Friday.', 'Yes, you are right. The festival starts on Friday.', 'festival', ['Yes, you are right. The festival starts on Monday.', 'No, you are right. The festival starts on Friday.']],
  ['I am sorry. I forgot to bring my photos.', 'That is all right. Please bring them tomorrow.', 'apology', ['That is all right. You are welcome.', 'Thank you. I forgot to bring them, too.']],
  ['Can I speak to {Ms. Tan|@}? She wrote the story about the bank.', 'Of course. I will call {Ms. Tan|@} for you.', 'phone', ['Of course. I will call {Mr. Moss|@} for you.', 'Of course. I will call the bank for you.']],
  ['I want to buy the paper from last Thursday, please.', 'Here is the paper from last Thursday.', 'old', ['Here is the paper from last Tuesday.', 'Here is the paper from next Thursday.']],
  ['My story is about two hundred words. Is that too long?', 'No, two hundred words is fine for Page 3.', 'length', ['No, two hundred words is too long for Page 3.', 'No, two thousand words is fine for Page 3.']],
  ['I took this photo at the harbour on Sunday.', 'Thank you. We will write: at the harbour on Sunday.', 'photo', ['Thank you. We will write: at the market on Sunday.', 'Thank you. We will write: at the harbour on Monday.']],
  ['Could I talk to someone about the election story?', 'Certainly. {Ms. Idris|@} wrote the election story.', 'who', ['Certainly. {Ms. Tan|@} wrote the election story.', 'Certainly. {Ms. Idris|@} did not write the election story.']],
  ['Thank you for printing my letter.', 'You are welcome. We were happy to print it.', 'thanks', ['You are welcome. We were sorry to print it.', 'Yes, please. We are happy to print it.']],
]);

const QA_PHONE2 = bank(2, [
  ['Good morning. This is {Mr. Grant|@}. I want to change my ad.', 'Good morning, {Mr. Grant|@}. Which ad do you want to change?', 'change', ['Good morning, {Captain Reed|@}. Which ad do you want to change?', 'Good morning, {Mr. Grant|@}. Which ad do you want to buy?']],
  ['I am calling about the story on Page 2. The name is wrong.', 'I am sorry. I will tell the editor about the name on Page 2.', 'mistake', ['I am sorry. I will tell the editor about the name on Page 5.', 'I am glad. I will tell the editor about the name on Page 2.']],
  ['Is {Ms. Carver|@} there? I have a story about the school.', 'She is in a meeting, but I can take a message about the school story.', 'presence', ['She is in a meeting, but I can take a message about the bank story.', 'She is in a meeting, so I can not take a message about the school story.']],
  ['Please tell {Mr. Moss|@} that I am at the station.', 'Yes. I will tell {Mr. Moss|@} that you are at the station.', 'message', ['Yes. I will tell {Mr. Moss|@} that you are at the school.', 'Yes. I will tell {Ms. Idris|@} that you are at the station.']],
  ['Can you send a reporter to the harbour at three?', 'Yes. A reporter will be at the harbour at three.', 'send', ['Yes. A reporter will be at the harbour at four.', 'Yes. A reporter will be at the market at three.']],
  ['This is the police station. The fire was at seven.', 'Thank you. The fire was at seven. Is that right?', 'police', ['Thank you. The fire was at eleven. Is that right?', 'Thank you. The fire was at seven. Is that wrong?']],
  ['Hello, I want the Saturday paper by post. My address is 12 Station Road.', 'Certainly. We will send the Saturday paper to 12 Station Road.', 'post', ['Certainly. We will send the Saturday paper to 21 Station Road.', 'Certainly. We will send the Sunday paper to 12 Station Road.']],
  ['Can I come to the office at two?', 'Yes. Please come to the office at two.', 'visit', ['Yes. Please come to the office at three.', 'No. Please come to the office at two.']],
]);

const QA_MAIL2 = bank(2, [
  ['Dear Editor, your story about the market was very good. I will buy your paper every day.', 'Thank you. We are glad that you liked the story about the market.', 'thanks', ['Thank you. We are sorry that you did not like the story about the market.', 'Thank you. We are glad that you liked the story about the bank.']],
  ['Dear Editor, I would like to write about our school. May I send you my story by Friday?', 'Yes. Please send your story about the school by Friday.', 'send', ['Yes. Please send your story about the school by Monday.', 'No. Please send your story about the school by Friday.']],
  ['Dear Editor, the price of the Sunday paper is three coins in your story. It is two coins.', 'Thank you. We will check the price of the Sunday paper.', 'price', ['Thank you. We will check the price of the Monday paper.', 'Thank you. The price of the Sunday paper is two coins in the story.']],
  ['Dear Editor, my name is {Anna|@}. Please send me a copy of last Friday\'s paper.', 'Dear {Anna|@}, we will send you a copy of last Friday\'s paper.', 'copy', ['Dear {Nora|@}, we will send you a copy of last Friday\'s paper.', 'Dear {Anna|@}, we will send you a copy of last Monday\'s paper.']],
  ['Dear Editor, there is a mistake in the weather story. It said rain on Monday, but the sun came out.', 'We are sorry. The weather story said rain on Monday, but it was sunny.', 'weather', ['We are sorry. The weather story said sun on Monday, but it rained.', 'We are glad. The weather story said rain on Monday, and it rained.']],
  ['Dear {Ms. Carver|@}, I will bring my photos of the festival on Thursday afternoon. Best wishes, {Anna|@}', 'Dear {Anna|@}, thank you. We will see you on Thursday afternoon.', 'photos', ['Dear {Anna|@}, thank you. We will see you on Thursday morning.', 'Dear {Anna|@}, thank you. We will see you on Friday afternoon.']],
  ['Dear Editor, could you print the time of the concert? It starts at 7:30 on Saturday.', 'Yes. We will print the time of the concert: 7:30 on Saturday.', 'concert', ['Yes. We will print the time of the concert: 8:30 on Saturday.', 'Yes. We will print the time of the concert: 7:30 on Sunday.']],
]);

const B2: Record<string, QaItem[]> = { news2: QA_SAY2, phone2: QA_PHONE2, mail2: QA_MAIL2 };

const T2: TaskTemplate[] = [
  { id: 'nt2_sort', rank: 2, arch: 'sort', say: 'Please put the stories on the right pages.', count: [4, 5], bins: ['town', 'sport', 'business', 'world', 'arts', 'weather'],
    patterns: [
      { text: 'The bank will open a new office in July', bins: ['business'] }, { text: 'Prices of tea are going up', bins: ['business'] }, { text: 'The company will make 200 new jobs', bins: ['business'] }, { text: 'A factory will close in March', bins: ['business'] },
      { text: 'Leaders from ten countries meet in {Paris|@}', bins: ['world'] }, { text: 'The president is visiting {Japan|@}', bins: ['world'] }, { text: 'Two countries agree to stop the fight', bins: ['world'] }, { text: 'A big storm hits another country', bins: ['world'] },
      { text: 'The museum shows pictures by local artists', bins: ['arts'] }, { text: 'The singer will play in the harbour hall', bins: ['arts'] }, { text: 'A new film about the sea opens on Friday', bins: ['arts'] }, { text: 'The school will show a play on Saturday', bins: ['arts'] },
      { text: 'The council will close the old bridge for a week', bins: ['town'] }, { text: 'A new bus line starts in the town', bins: ['town'] }, { text: 'The library will open on Sundays', bins: ['town'] }, { text: 'A fire at the school', bins: ['town'] },
      { text: 'Our team won the cup', bins: ['sport'] }, { text: 'The girls won the swimming cup', bins: ['sport'] }, { text: 'A big game on Sunday', bins: ['sport'] }, { text: 'The boys lost 2 to 0', bins: ['sport'] },
      { text: 'A storm is coming to the coast', bins: ['weather'] }, { text: 'A hot summer is coming', bins: ['weather'] }, { text: 'Snow on Monday', bins: ['weather'] }, { text: 'It will be sunny tomorrow', bins: ['weather'] },
    ] },
  { id: 'nt2_visitors', rank: 2, arch: 'check', say: 'Please check the number of visitors in my story.', fields: [
    { id: 'event', label: 'Event', values: ['the festival', 'the concert', 'the market', 'the boat race'] },
    { id: 'day', label: 'Day', values: ['Friday', 'Saturday', 'Sunday'] },
    { id: 'visitors', label: 'Visitors', range: [1000, 9000, 1000], fmt: '{n,}' },
  ], docs: [{ kind: 'note', title: 'Reporter notes', fields: ['event', 'day', 'visitors'] }, { kind: 'card', title: 'Story card', fields: ['event', 'day', 'visitors'] }], target: 1, pWrong: 0.65 },
  { id: 'nt2_temp', rank: 2, arch: 'check', say: 'Please check the weather story against my notes.', fields: [
    { id: 'temp', label: 'Temperature', range: [5, 30], fmt: '{n} degrees' },
    { id: 'next', label: 'Tomorrow', values: ['rain', 'snow', 'wind', 'sun', 'cloud'] },
  ], docs: [{ kind: 'note', title: 'Weather notes', fields: ['temp', 'next'] }, { kind: 'card', title: 'Story card', fields: ['temp', 'next'] }], target: 1, pWrong: 0.65 },
  { id: 'nt2_prize', rank: 2, arch: 'check', say: 'Is the prize right in this caption?', fields: [
    { id: 'who', label: 'Winner', values: ['{Nora|@}', '{Tom|@}', '{Captain Reed|@}', '{Big Joe|@}'] },
    { id: 'what', label: 'Race', values: ['the boat race', 'the cooking race', 'the bicycle race'] },
    { id: 'prize', label: 'Prize', values: ['first prize', 'second prize', '100 coins', '1,000 coins'] },
  ], docs: [{ kind: 'note', title: 'Photo notes', fields: ['who', 'what', 'prize'] }, { kind: 'label', title: 'Caption', fields: ['who', 'what', 'prize'] }], target: 1, pWrong: 0.65 },
  { id: 'nt2_quote', rank: 2, arch: 'check', say: 'I put the mayor\'s words in my story. Please check the words in the card.', fields: [
    { id: 'what', label: 'Place', values: ['The bridge', 'The market', 'The library', 'The school'] },
    { id: 'day', label: 'Closes on', values: ['Monday', 'Tuesday', 'Wednesday', 'Friday'] },
  ], docs: [{ kind: 'note', title: 'Reporter notes', lines: ['The mayor said: "{what} will close on {day}."'] }, { kind: 'card', title: 'Mayor', fields: ['what', 'day'] }], target: 1, pWrong: 0.65 },
  { id: 'nt2_ad', rank: 2, arch: 'check', say: 'Please check the bill for the ad.', fields: [
    { id: 'who', label: 'Customer', values: ['{Mr. Grant|@}', '{Captain Reed|@}', '{Nora|@}', '{Big Joe|@}'] },
    { id: 'days', label: 'Days', range: [2, 6] },
    { id: 'price', label: 'Coins a day', values: ['5', '10'] },
    { id: 'total', label: 'Total', calc: 'days * price', fmt: '{n} coins' },
  ], docs: [{ kind: 'order', title: 'Ad order', fields: ['who', 'days', 'price'] }, { kind: 'invoice', title: 'Bill', fields: ['who', 'days', 'price', 'total'] }], target: 1, pWrong: 0.65, wrongable: ['days', 'total'] },
  { id: 'nt2_pad', rank: 2, arch: 'respond', mode: 'form', kind: 'phone', say: 'A call from the police station! Please take the message.', lines: ['Hello, this is {who}.', 'I am at {where}.', 'The accident was at {when}, and {hurt} were hurt.'],
    fields: [
      { id: 'who', label: 'Who', values: ['{Ms. Idris|@}', '{Ms. Tan|@}', '{Mr. Moss|@}'] },
      { id: 'where', label: 'Where', values: ['the police station', 'the hospital', 'the harbour', 'the market'] },
      { id: 'when', label: 'Time', values: ['seven o\'clock', 'eight o\'clock', 'nine o\'clock', 'ten o\'clock'] },
      { id: 'hurt', label: 'Hurt', values: ['two people', 'three people', 'five people', 'ten people'] },
    ] },
  { id: 'nt2_plan', rank: 2, arch: 'respond', mode: 'slot', kind: 'memo', say: 'Look at the plan, please. Where can the story go?', layout: 'calendar', rows: PAGES3, cols: SPOTS2,
    want: [
      { tag: 'p1', text: 'The story is big news, so it needs Page 1.' }, { tag: 'p2', text: 'The story needs Page 2.' }, { tag: 'p3', text: 'The story needs Page 3.' },
      { tag: 'top', text: 'It is long, so it needs the top of the page.' }, { tag: 'low', text: 'It is short, so it can go at the bottom.' },
    ],
    avoid: [{ tag: 'p1', text: 'Page 1 is full.' }, { tag: 'p3', text: 'Please do not use Page 3, because the weather map is there.' }, { tag: 'top', text: 'The top of the page is for a big photo.' }, { tag: 'p2', text: 'Page 2 is for letters.' }],
    busy: ['Business', 'Ad', 'Weather map', 'World', 'Sports'], open: ['Dear all,'], close: ['Thank you.'] },
  { id: 'nt2_say', rank: 2, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'news2' },
  { id: 'nt2_phone', rank: 2, arch: 'respond', mode: 'choose', kind: 'phone', bank: 'phone2' },
  { id: 'nt2_mail', rank: 2, arch: 'respond', mode: 'choose', kind: 'email', bank: 'mail2' },
];

// ---------------------------------------------------------------------------------------------- rank 3 (英検2級, TOEIC 〜730)
// The paper's real work begins: the council and the old bridge, the trial at the court, a study of the fish, the
// hospital, the exhibition. Three papers at once, the right value to write in, headlines and captions to choose,
// the one sentence of a draft that contradicts the notes, calls that are only heard. The spine brings its words
// two or three at a time and uses each again.

const R3: AuthoredTask[] = [
  check('n3_vote', 3, 1, 'p_idris', 'The council voted last night. Please check the vote in my draft.', [
    note('Reporter notes', ['The council voted 7 to 4 to repair the old bridge.']),
    paper('card', 'Draft', [['vote', 'Vote', '7 to 5'], ['plan', 'Plan', 'to repair the bridge']]),
  ], 'vote', { fix: ['7 to 4', ['7 to 4', '7 to 5', '8 to 4']] }),
  msg('n3_hale', 3, 2, 'p_carver', 'letter', { from: '{Professor Hale|@}' }, ['Dear Editor,', 'I disagree with the council. The old bridge is very old, but I think that we must repair it, not replace it.', 'Thank you,', '{Professor Hale|@}'],
    'He wants the council to repair the old bridge.', ['He wants the council to replace the old bridge.', 'He wants the council to repair the new bridge.']),
  pad('n3_trial', 3, 3, 'p_carver', ['Good morning. This is {Ms. Idris|@}, at the court.', 'The trial of {Mr. Pike|@} started this morning. The judge is {Judge Lane|@}.', 'The next hearing is on Thursday.'], [
    ['who', 'Caller', '{Ms. Idris|@}', ['{Ms. Tan|@}', '{Mr. Abbott|@}']],
    ['trial', 'Trial of', '{Mr. Pike|@}', ['{Mr. Dale|@}', '{Mr. Brook|@}']],
    ['judge', 'Judge', '{Judge Lane|@}', ['{Judge Moore|@}', '{Judge Hart|@}']],
    ['day', 'Next hearing', 'Thursday', ['Tuesday', 'Saturday']],
  ], { features: ['audioOnly'], say: 'A call from the court. Please write the message.' }),
  msg('n3_headline1', 3, 4, 'p_abbott', 'memo', { say: 'Which headline is right for this story?' }, ['The council voted 7 to 4 last night.', 'The old bridge will be repaired, not replaced.', 'The work will cost four million coins.'],
    'Council votes to repair old bridge for four million coins', ['Council votes to replace old bridge for four million coins', 'Council votes to repair old bridge for fourteen million coins']),
  check('n3_ribbon', 3, 5, 'p_moss', 'Please look at my photo notes and the caption. One detail is wrong, I think.', [
    paper('note', 'Photo notes', [['who', 'Name', '{Mayor Hart|@}'], ['what', 'What', 'the opening of the new market'], ['where', 'Place', 'Harbour Street']]),
    paper('label', 'Caption', [['who', 'Name', '{Mayor Hart|@}'], ['what', 'What', 'the opening of the new market'], ['where', 'Place', 'Station Road']]),
  ], 'where', { fix: ['Harbour Street', ['Harbour Street', 'Station Road', 'Market Street']] }),
  msg('n3_hospital', 3, 6, 'p_carver', 'email', { from: '{Ms. Reyes|@}', subject: 'Interview with the director' }, ['Dear Editor,', 'We would be happy to talk to your reporter on Wednesday, but the director can not speak to the press before the end of the month.', 'Thank you,', '{Ms. Reyes|@}'],
    'No. The director can not speak to the press before the end of the month.', ['Yes. The director will speak to the reporter on Wednesday.', 'No. Nobody at the hospital will speak to the press.'], { say: 'Can our reporter talk to the director this week? What does the hospital say?' }),
  slot('n3_plan1', 3, 7, 'p_carver', 'memo', ['Dear all,', 'The council story is the main story today, and it needs a big space at the top of a page.', 'It can not go on the front page, because the front page has the trial.', 'Page 2 is for letters.'], PAGES4, SPOTS3, ['top'], ['p1', 'p2'], 'p3-top', ['Trial', 'Letters', 'Ad', 'Sport', 'World'],
    { say: 'Look at the plan, please. Where does the council story go?', extraBusy: ['p4-top', 'p2-mid', 'p1-low'] }),
  check('n3_fish', 3, 8, 'p_idris', 'The study of the fish by {Professor Hale|@} is on tomorrow\'s page. Please check my draft.', [
    paper('note', 'Study notes', [['now', 'Fish each day', '800'], ['then', 'Ten years ago', '1,000'], ['cause', 'Main cause', 'too many boats']]),
    paper('card', 'Draft', [['now', 'Fish each day', '800'], ['then', 'Ten years ago', '1,000'], ['cause', 'Main cause', 'the weather']]),
  ], 'cause', { fix: ['too many boats', ['too many boats', 'the weather', 'the sun']] }),
  msg('n3_gap1', 3, 9, 'p_abbott', 'memo', { say: 'Which word completes this sentence?' }, ['Two people ___ hurt in the accident last night.'],
    'were', ['was', 'are']),
  sort('n3_sort1', 3, 10, 'p_carver', 'More stories! Which page is each one for?', ['politics', 'crime', 'business'], [
    ['The council will vote on the bridge', 'politics'], ['The judge will hear the trial on Thursday', 'crime'], ['The bank will open a new office', 'business'], ['A man took money from the bank', 'crime'],
  ]),
  msg('n3_exhibit', 3, 11, 'c_student', 'memo', { say: 'I would like to see the exhibition. Until when is it open?' }, ['EXHIBITION OF OLD MAPS', 'Open from 10 to 5, Tuesday to Sunday.', 'The exhibition ends on June 30.', 'Closed on Mondays.'],
    'It is open until June 30.', ['It is open until June 13.', 'It is open only on Mondays.']),
  check('n3_quote', 3, 12, 'p_idris', 'I put the minister\'s words in my story. Please check them against my notes.', [
    note('Reporter notes', ['The minister said: "We will not raise taxes this year, but we may raise them next year."']),
    paper('card', 'Words in the draft', [['when', 'We will not raise taxes', 'this year'], ['may', 'We may raise them', 'next year']]),
  ], null),
  msg('n3_complaint', 3, 13, 'p_carver', 'email', { from: '{Mrs. Hill|@}', subject: 'A mistake in yesterday\'s paper' }, ['Dear Editor,', 'Your story about the market said that my shop will close in March.', 'This is not true. My shop will stay open, and I will close only for two weeks in March.', 'Please correct it.', 'Thank you,', '{Mrs. Hill|@}'],
    'We are sorry. We will print a correction: her shop will stay open.', ['We are sorry. We will print a correction: her shop will close in March.', 'We are glad that her shop will close for two years.']),
  check('n3_budget', 3, 14, 'p_tan', 'The council has agreed its budget. Please check my story against the budget paper.', [
    paper('card', 'Budget paper', [['total', 'Total', '12 million'], ['road', 'Roads', '3 million'], ['school', 'Schools', '4 million']]),
    paper('letter', 'Story', [['total', 'Total', '12 million'], ['road', 'Roads', '3 million'], ['school', 'Schools', '5 million']]),
  ], 'school', { fix: ['4 million', ['3 million', '4 million', '5 million']] }),
  msg('n3_caption1', 3, 15, 'p_moss', 'memo', { say: 'Which caption is right for this picture?' }, ['Photo: three workers on the old bridge', 'They are checking the stones.', 'Taken on Tuesday morning.'],
    'Three workers check the stones of the old bridge on Tuesday morning.', ['Three workers check the stones of the new bridge on Tuesday morning.', 'Two workers check the stones of the old bridge on Tuesday afternoon.']),
  pad('n3_phone2', 3, 16, 'p_carver', ['Hello. This is {Ms. Tan|@}.', 'I am at the harbour company. The profit this year is two million coins.', 'Please keep half a page for the story on Friday.'], [
    ['who', 'Caller', '{Ms. Tan|@}', ['{Ms. Idris|@}', '{Mr. Moss|@}']],
    ['where', 'Place', 'the harbour company', ['the town hall', 'the fish market']],
    ['profit', 'Profit', 'two million coins', ['twelve million coins', 'two thousand coins']],
    ['space', 'Space', 'half a page', ['a whole page', 'two pages']],
  ], { features: ['audioOnly'], say: '{Ms. Tan|@} is on the line from the harbour. Please take the message.' }),
  msg('n3_wonder', 3, 17, 'p_carver', 'email', { from: '{Mr. Grant|@}', subject: 'My advertisement' }, ['Dear {Ms. Carver|@},', 'I was wondering if you could move my advertisement to Page 3.', 'It is next to the sports news, and my customers read that page.', 'Thank you,', '{Mr. Grant|@}'],
    'Of course. We will move the advertisement to Page 3, next to the sports news.', ['Of course. We will move the advertisement to Page 2, next to the sports news.', 'I am afraid that we will not move the advertisement from Page 3.']),
  sort('n3_sort2', 3, 18, 'p_carver', 'Here are some more. Please read them well.', ['science', 'health', 'environment'], [
    ['A study shows that fish are smaller', 'science'], ['The hospital has a new ward for children', 'health'], ['The sea at the harbour is not clean', 'environment'], ['Doctors say that sleep is good for you', 'health'],
  ]),
  check('n3_ok1', 3, 19, 'p_abbott', 'Here is the fact box for the festival story. Is it the same as the notes?', [
    paper('note', 'Reporter notes', [['day', 'Festival', 'June 12 to 14'], ['cost', 'Tickets', '8 coins'], ['place', 'Place', 'the old harbour']]),
    paper('card', 'Fact box', [['day', 'Festival', 'June 12 to 14'], ['cost', 'Tickets', '8 coins'], ['place', 'Place', 'the old harbour']]),
  ], null),
  msg('n3_contradict1', 3, 20, 'p_abbott', 'memo', { say: 'One sentence in this draft does not agree with the notes. Which one?' }, [
    'Notes: The fire started at two in the morning. Nobody was hurt. The bakery will open again next week.',
    'Draft: (1) A fire started at two in the morning at the bakery. (2) Two people were hurt. (3) The bakery will open again next week.',
  ], '(2) Two people were hurt.', ['(1) A fire started at two in the morning at the bakery.', '(3) The bakery will open again next week.']),
  msg('n3_reader', 3, 21, 'c_grandma', 'letter', { from: '{Grandma Rose|@}' }, ['Dear Editor,', 'I have read your paper for forty years, and I was sorry to see that you do not print the recipes now.', 'Please bring them back. Many of your readers enjoy them.', 'Thank you,', '{Grandma Rose|@}'],
    'She would like the paper to print the recipes again.', ['She would like the paper to stop printing the recipes.', 'She has read the paper for four years.']),
  check('n3_unemployment', 3, 22, 'p_tan', 'The number of people without a job has gone down. Please check my figure.', [
    paper('card', 'Official figures', [['rate', 'Unemployment', '5%'], ['last', 'Last year', '7%']]),
    paper('letter', 'Draft', [['rate', 'Unemployment', '5%'], ['last', 'Last year', '9%']]),
  ], 'last', { fix: ['7%', ['5%', '7%', '9%']] }),
  msg('n3_headline2', 3, 23, 'p_abbott', 'memo', { say: 'Which headline is right for the science page?' }, ['A new study by the university looked at 300 seabirds.', 'The number of birds has fallen by half in ten years.', 'The study says that the weather is the main cause.'],
    'Number of seabirds falls by half in ten years, study finds', ['Number of seabirds falls by 5% in ten years, study finds', 'Number of seabirds falls by half in two years, study finds']),
  check('n3_ok2', 3, 24, 'p_moss', 'Please check the caption for the museum picture against my notes.', [
    paper('note', 'Photo notes', [['who', 'Name', 'the museum director'], ['what', 'What', 'a map from 1850'], ['where', 'Place', 'the museum']]),
    paper('label', 'Caption', [['who', 'Name', 'the museum director'], ['what', 'What', 'a map from 1850'], ['where', 'Place', 'the museum']]),
  ], null),
  msg('n3_review', 3, 25, 'p_carver', 'letter', { from: '{Mr. Grant|@}' }, ['Dear Editor,', 'Your critic wrote that the concert on Saturday was a great success.', 'I was there. I thought that the singer was poor and the hall was half empty.', 'Thank you,', '{Mr. Grant|@}'],
    'He disagrees with the critic about the concert.', ['He agrees with the critic about the concert.', 'He disagrees with the critic about the exhibition.']),
  sort('n3_sort3', 3, 26, 'p_carver', 'The last stories before the printer. Please look at each one.', ['crime', 'science', 'business'], [
    ['A witness says that she saw the man run away', 'crime'], ['Scientists find a new way to clean the sea', 'science'], ['The company will pay its workers more', 'business'], ['The bank will give more money to the town', 'business'],
  ]),
  msg('n3_say1', 3, 27, 'c_scholar', 'speech', { say: 'I lost Tuesday\'s paper. Your story about the trial was on Page 4. Could I read it again?' }, ['I lost Tuesday\'s paper. Your story about the trial was on Page 4. Could I read it again?'],
    'Of course. I will find Tuesday\'s paper and Page 4 for you.', ['Of course. I will find Friday\'s paper and Page 4 for you.', 'Of course. I will find Tuesday\'s paper and Page 14 for you.']),
  check('n3_trial_notes', 3, 28, 'p_idris', 'Please check the draft about the trial against my notes from the court.', [
    paper('note', 'Court notes', [['who', 'Accused', '{Mr. Pike|@}'], ['charge', 'Charge', 'selling old fish as fresh'], ['next', 'Next hearing', 'Thursday']]),
    paper('letter', 'Draft', [['who', 'Accused', '{Mr. Pike|@}'], ['charge', 'Charge', 'stealing fish'], ['next', 'Next hearing', 'Thursday']]),
  ], 'charge', { fix: ['selling old fish as fresh', ['selling old fish as fresh', 'stealing fish', 'selling fish without paying tax']] }),
  msg('n3_gap2', 3, 29, 'p_abbott', 'memo', { say: 'Which word is right?' }, ['The report ___ the council received on Monday has a mistake.'],
    'which', ['whose', 'who']),
  msg('n3_say2', 3, 30, 'c_merchant', 'phone', { say: 'Hello. I am calling because I would like to place an advertisement in the Saturday paper.' }, ['Hello. I am calling because I would like to place an advertisement in the Saturday paper.'],
    'Certainly. I will write down your advertisement for the Saturday paper.', ['Certainly. I can not write down your advertisement for the Saturday paper.', 'Certainly. I will write down your advertisement for the Sunday paper.']),
  check('n3_weather', 3, 31, 'p_tan', 'Please check the weather figures in my story for the weekend.', [
    paper('note', 'Weather office', [['sat', 'Saturday', 'rain, 11 degrees'], ['sun', 'Sunday', 'sun, 16 degrees']]),
    paper('letter', 'Draft', [['sat', 'Saturday', 'rain, 11 degrees'], ['sun', 'Sunday', 'sun, 18 degrees']]),
  ], 'sun', { fix: ['sun, 16 degrees', ['sun, 6 degrees', 'sun, 16 degrees', 'sun, 18 degrees']] }),
  msg('n3_pollution', 3, 32, 'p_carver', 'email', { from: '{Ms. Hart|@}', subject: 'The sea at the harbour' }, ['Dear Editor,', 'The council has not yet decided what to do about the sea at the harbour.', 'It will decide when the report from the university arrives, probably in September.', 'Thank you,', '{Ms. Hart|@}'],
    'The council will decide after the report from the university arrives.', ['The council has already decided what to do about the sea.', 'The council will decide before the report from the university arrives.'], { say: 'What does the council say about the sea?' }),
  slot('n3_plan2', 3, 33, 'p_carver', 'memo', ['Dear all,', 'The story about the new hospital ward needs a middle space, because it has a large photograph.', 'Page 3 is already full of sport. Please do not put it on the front page or on Page 4.'], PAGES4, SPOTS3, ['mid'], ['p1', 'p3', 'p4'], 'p2-mid', ['Sport', 'Ad', 'Weather', 'World', 'Letters'],
    { say: 'Look at the plan, please. Where does the hospital story go?', extraBusy: ['p3-top', 'p3-low', 'p2-low'] }),
  msg('n3_quote_ask', 3, 34, 'c_boy', 'memo', { say: 'I want to be a reporter. How do we know that a story is true?' }, ['HOW THE COURIER CHECKS A STORY', 'We check every name and every number against the reporter\'s notes.', 'We ask a second source.', 'If we are wrong, we print a correction on Page 2.'],
    'We check the names and numbers against the notes and ask a second source.', ['We check the names and numbers only after the readers write to us.', 'We ask a second source, but we do not check the names and numbers.']),
  check('n3_tax', 3, 35, 'p_idris', 'The government has announced a new tax. Please check the details in my story.', [
    paper('card', 'Government paper', [['what', 'New tax on', 'sugar'], ['rate', 'Rate', '10%'], ['from', 'From', 'next week']]),
    paper('letter', 'Draft', [['what', 'New tax on', 'sugar'], ['rate', 'Rate', '15%'], ['from', 'From', 'next week']]),
  ], 'rate', { fix: ['10%', ['5%', '10%', '15%']] }),
  pad('n3_phone3', 3, 36, 'p_carver', ['Good afternoon. This is {Chief Rowan|@} from the police.', 'We have arrested a man after the robbery on Harbour Street.', 'He will appear in court on Monday morning.'], [
    ['who', 'Caller', '{Chief Rowan|@}', ['{Sergeant Cole|@}', '{Mr. Pike|@}']],
    ['where', 'Robbery', 'Harbour Street', ['Station Road', 'Market Street']],
    ['what', 'Police have', 'arrested a man', ['arrested two men', 'found a man']],
    ['day', 'Court', 'Monday morning', ['Monday afternoon', 'Tuesday morning']],
  ], { features: ['audioOnly'], say: 'The police are on the phone. Please write down what they say.' }),
  msg('n3_contradict2', 3, 37, 'p_abbott', 'memo', { say: 'Which sentence of this draft does not agree with the notes?' }, [
    'Notes: The festival is on Saturday. Tickets are free for children. The concert starts at eight.',
    'Draft: (1) The festival will take place on Saturday. (2) Children will have to pay for tickets. (3) The concert starts at eight.',
  ], '(2) Children will have to pay for tickets.', ['(1) The festival will take place on Saturday.', '(3) The concert starts at eight.']),
  sort('n3_sort4', 3, 38, 'p_carver', 'These are for the Sunday paper. Please look at every one.', ['opinion', 'arts', 'health', 'town'], [
    ['I think that the council is wrong about the bridge', 'opinion'], ['The new film is long, but the music is good', 'arts'], ['Fewer people smoke than ten years ago, a study shows', 'health'], ['The market will move to the old harbour in June', 'town'],
  ]),
  msg('n3_hale2', 3, 39, 'p_carver', 'email', { from: '{Professor Hale|@}', subject: 'Correction' }, ['Dear {Ms. Carver|@},', 'Thank you for printing my letter. However, you wrote that I teach at the school.', 'In fact, I taught there for thirty years, but I retired last spring.', 'Could you please correct this?', 'Thank you,', '{Professor Hale|@}'],
    'We will print a correction: he used to teach at the school and retired last spring.', ['We will print a correction: he still teaches at the school.', 'We will print a correction: he taught at the school for three years.']),
  check('n3_sport', 3, 40, 'p_tan', 'Please check the score in my sports story. I wrote it quickly.', [
    paper('note', 'Match notes', [['home', 'Home goals', '3'], ['team', 'Away team', '{Hillside|@}'], ['away', 'Away goals', '1']]),
    paper('letter', 'Draft', [['home', 'Home goals', '3'], ['team', 'Away team', '{Hillside|@}'], ['away', 'Away goals', '2']]),
  ], 'away', { fix: ['1', ['1', '2', '4']] }),
  msg('n3_gap3', 3, 41, 'p_abbott', 'memo', { say: 'Which word is right for this headline?' }, ['___ the rain, thousands of people came to the festival.'],
    'Despite', ['Because', 'Although']),
  msg('n3_caption2', 3, 42, 'p_moss', 'memo', { say: 'And this one? Which caption is right?' }, ['Photo: a girl with her prize-winning cake', 'Name: {Emma|@}, the niece of {Nora|@}', 'Event: the cake competition at the school'],
    '{Emma|@} shows her prize-winning cake at the school cake competition.', ['{Emma|@} shows her prize-winning cake at the harbour cake competition.', '{Nora|@} shows her prize-winning cake at the school cake competition.']),
  msg('n3_say3', 3, 43, 'c_sailor', 'memo', { say: 'I can not find the weather forecast in today\'s paper. Is it on Page 2?' }, ['TODAY\'S PAPER', 'Page 2: letters', 'Page 5: sport', 'The weather forecast is at the bottom of the back page.'],
    'No. It is at the bottom of the back page.', ['Yes. It is at the bottom of Page 2.', 'No. It is at the top of Page 5.']),
  check('n3_age', 3, 44, 'p_idris', 'This is for the story about the new mayor. Please check her age and her job before.', [
    paper('note', 'Reporter notes', [['name', 'Name', '{Ms. Brooks|@}'], ['age', 'Age', '46'], ['job', 'Job before', 'a teacher']]),
    paper('letter', 'Draft', [['name', 'Name', '{Ms. Brooks|@}'], ['age', 'Age', '46'], ['job', 'Job before', 'a lawyer']]),
  ], 'job', { fix: ['a teacher', ['a doctor', 'a lawyer', 'a teacher']] }),
  sort('n3_sort5', 3, 45, 'p_carver', 'The last tray today. Be careful with the long ones.', ['sport', 'world', 'politics', 'arts'], [
    ['The girls won the cup again', 'sport'], ['The two leaders will sign the agreement in {Tokyo|@}', 'world'], ['The council can not agree on the budget', 'politics'], ['The critic loved the new play', 'arts'],
  ]),
];

// ---------------------------------------------------------------------------------------------- rank 3 templates and banks

const QA_SAY3 = bank(3, [
  ['I would like to place an advertisement in the Saturday paper.', 'Certainly. How big would you like the advertisement in the Saturday paper to be?', 'ad', ['Certainly. I can not place an advertisement in the Saturday paper.', 'Certainly. The advertisement in the Sunday paper will be small.']],
  ['I was wondering if you could send a reporter to the school fair on Friday.', 'Of course. A reporter will come to the school fair on Friday.', 'request', ['Of course. A reporter will come to the school fair on Monday.', 'I am afraid that a reporter will not come to the school fair on Friday.']],
  ['I am afraid that I will not be able to finish the story before six.', 'That is all right. Please send it to me as soon as you can.', 'delay', ['That is all right. Please send it to me before five.', 'I am afraid that I can not wait. Thank you for finishing the story.']],
  ['Do you mind if I take a photograph of the new bridge from your window?', 'Not at all. Please go ahead and take the photograph.', 'permission', ['I am sorry, but you may not take a photograph of the new bridge from the window. Please go ahead.', 'Not at all. Please go ahead and take the bridge down.']],
  ['Has the judge decided yet whether the man is guilty?', 'Not yet. The judge will decide next week.', 'status', ['Not yet. The judge decided last week.', 'Yes. The judge will decide next week.']],
  ['Why did the paper not print my letter about the library?', 'We received many letters about the library, so we could print only three of them.', 'reason', ['We received only three letters about the library, so we printed all of them.', 'We printed your letter about the library on Page 2 last week, so it was too early.']],
  ['Could you tell me who wrote the story about the bank?', 'Yes. {Ms. Tan|@} wrote it, and she works on the business pages.', 'who', ['Yes. {Mr. Moss|@} wrote it, and he works on the business pages.', 'Yes. {Ms. Tan|@} wrote it, and she works on the sports pages.']],
  ['I disagree with your story about the new tax.', 'I am sorry that you disagree. Would you like to write to the editor about the new tax?', 'complaint', ['I am glad that you disagree. Would you like to write to the editor about the new bank?', 'I am sorry that you agree. Would you like to write to the editor about the new tax?']],
  ['Is the story about the trial finished? The printer is waiting.', 'Not yet, but I will finish it in ten minutes.', 'status2', ['Yes, I finished it ten minutes ago, but I will not send it.', 'Not yet, but I will finish it in ten days.']],
  ['Thank you for correcting the mistake in my name.', 'It was our pleasure. We are sorry that we made the mistake.', 'thanks', ['It was our pleasure. We are glad that we made the mistake.', 'You are welcome. We are sorry that we did not correct your name.']],
]);

const QA_PHONE3 = bank(3, [
  ['Hello. I am calling to confirm that the interview with the mayor is on Thursday.', 'Yes, the interview with the mayor is on Thursday at two.', 'confirm', ['Yes, the interview with the mayor is on Friday at two.', 'No, the interview with the mayor is on Thursday at two.']],
  ['I am afraid that {Ms. Carver|@} is in a meeting at the moment.', 'Could you ask her to call me back after the meeting?', 'callback', ['Could you ask her to call me before the meeting?', 'Could you ask me to call her after the meeting?']],
  ['Your story will be printed on Page 3 tomorrow.', 'Thank you. Could you tell me which part of Page 3?', 'printed', ['Thank you. Could you tell me which part of Page 13?', 'Thank you. Your story was printed on Page 3 yesterday.']],
  ['I would like to speak to someone about a mistake in the weather forecast.', 'Certainly. I will put you through to the editor.', 'transfer', ['Certainly. I will put you through to the weather office, because the mistake was theirs.', 'Certainly. I will not put you through to the editor.']],
  ['We can not deliver the papers to the harbour on Monday because of the storm.', 'That is a problem. Could you deliver them on Tuesday?', 'problem', ['That is a problem. Could you deliver them to the station on Monday?', 'That is good. Please deliver them on Monday.']],
  ['This is the hospital. The doctor will give a statement at noon.', 'Thank you. We will send a reporter at noon.', 'statement', ['Thank you. We will send a reporter at nine.', 'Thank you. We will send a statement at noon.']],
  ['Can I leave a message for {Mr. Moss|@}? The photographs are ready.', 'Of course. I will tell {Mr. Moss|@} that the photographs are ready.', 'message', ['Of course. I will tell {Ms. Idris|@} that the photographs are ready.', 'Of course. I will tell {Mr. Moss|@} that the photographs are not ready.']],
  ['I saw the accident on Station Road. I would like to tell you what I saw.', 'Thank you. Could you tell me what you saw on Station Road?', 'witness', ['Thank you. Could you tell me what you saw on Harbour Road?', 'Thank you. I saw the accident on Station Road.']],
]);

const QA_MAIL3 = bank(3, [
  ['Dear Editor, thank you for your story about the old bridge. I would like to invite your reporter to the repair work on Wednesday.', 'Thank you. We would be happy to send a reporter to the repair work on Wednesday.', 'invite', ['Thank you. We would be happy to send a reporter to the repair work on Friday.', 'Thank you. We would be sorry to send a reporter to the repair work on Wednesday.']],
  ['Dear Editor, I regret to inform you that I can not write the article for Friday.', 'Thank you for letting us know. Could you write the article for next Friday?', 'regret', ['Thank you for letting us know. We will print your article on Friday.', 'Thank you for letting us know. Could you write the article for Thursday?']],
  ['Dear {Ms. Carver|@}, please find attached the photographs of the festival. The best one is the last.', 'Thank you for the photographs. We will look at the last one first.', 'attach', ['Thank you for the photographs. We will look at the first one first.', 'Thank you for the photographs. We can not find the attached photographs.']],
  ['Dear Editor, our company has a new director, {Ms. Reyes|@}. We would be glad if you would print this news.', 'Thank you. We will print the news about {Ms. Reyes|@}, your new director.', 'news', ['Thank you. We will print the news about {Ms. Hart|@}, your new director.', 'Thank you. We will not print the news about {Ms. Reyes|@}, your new director.']],
  ['Dear Editor, the story on Page 2 said that the school will close. This is not true.', 'We are sorry. We will print a correction about the school next week.', 'mistake', ['We are sorry. We will print a story about the school closing next week.', 'We are glad. We will print a correction about the school next week.']],
  ['Dear Editor, I enjoyed your series about the harbour. Will there be a second series?', 'Thank you. Yes, there will be a second series about the harbour in the autumn.', 'series', ['Thank you. No, there will be a second series about the harbour in the autumn.', 'Thank you. Yes, there will be a second series about the school in the autumn.']],
  ['Dear Editor, I applied for the job of reporter last month and have not heard from you.', 'I am sorry. Your application for the job of reporter is on the editor\'s desk.', 'apply', ['I am sorry. Your application for the job of editor is on the reporter\'s desk.', 'I am sorry. We have not received your application for the job of reporter.']],
  ['Dear {Ms. Carver|@}, the council meeting will be held on Monday, not on Tuesday, as the paper wrote.', 'Thank you. We will tell our readers that the council meeting is on Monday.', 'correct', ['Thank you. We will tell our readers that the council meeting is on Tuesday.', 'Thank you. We will tell our readers that the council meeting was on Monday.']],
]);

const QA_LETTER3 = bank(3, [
  ['Dear Editor, I read with interest your story about the new tax on sugar. I believe that the tax will help children, and I hope that the government will not change its mind.', 'Thank you for your letter. We are glad that you support the new tax on sugar.', 'support', ['Thank you for your letter. We are sorry that you are against the new tax on sugar.', 'Thank you for your letter. We are glad that you support the new tax on fuel.']],
  ['Dear Editor, the harbour is full of rubbish again, and nobody seems to care. Why does the paper not write about it?', 'You are right that the rubbish in the harbour is a problem. We will write about it next week.', 'issue', ['You are wrong that the rubbish in the harbour is a problem. We will write about it next week.', 'You are right that the rubbish in the harbour is a problem. We wrote about it last year, so we will not write again.']],
  ['Dear Editor, may I suggest that you print the weather forecast on the front page? Many of us go out to sea early in the morning.', 'Thank you for the suggestion. We will think about printing the weather forecast on the front page.', 'suggest', ['Thank you for the suggestion. We will think about printing the news from the sea on the front page.', 'Thank you for the suggestion. We will not think about the weather forecast any more.']],
  ['Dear Editor, I was surprised that you did not mention the school concert, which was a great success.', 'We are sorry that we did not mention the school concert. We will print a short story about it on Friday.', 'omission', ['We are sorry that we did not mention the school concert. We will print a short story about it last Friday.', 'We are glad that we did not mention the school concert. We will print a short story about it on Friday.']],
  ['Dear Editor, thanks to your story, the owner of the old cinema has agreed to open it again. We are all very grateful.', 'We are delighted that the owner of the old cinema has agreed to open it again.', 'thanks', ['We are disappointed that the owner of the old cinema has agreed to open it again.', 'We are delighted that the owner of the old library has agreed to open it again.']],
  ['Dear Editor, in your story last Monday, you said that the bus fare will rise to three coins. I believe it will be two and a half.', 'Thank you for writing. We will check the bus fare, which we wrote as three coins.', 'check', ['Thank you for writing. We will check the bus fare, which we wrote as two and a half coins.', 'Thank you for writing. We will not check the bus fare, which we wrote as three coins.']],
]);

const QA_GAP3 = bank(3, [
  ['The man ___ was arrested yesterday is a fisherman.', 'who', 'rel', ['whose', 'what']],
  ['The law ___ will start in May is about rubbish.', 'which', 'rel', ['who', 'whose']],
  ['The mayor ___ son plays for the town team opened the new field.', 'whose', 'rel', ['who', 'which']],
  ['___ the storm, the harbour games were not cancelled.', 'Despite', 'link', ['Because', 'Although']],
  ['The paper was late ___ the printer broke down.', 'because', 'link', ['despite', 'due to']],
  ['The new law will ___ next month.', 'come into force', 'phrase', ['come in forcing', 'coming into force']],
  ['Two people ___ hurt in the accident last night.', 'were', 'passive', ['was', 'are']],
  ['The new bridge ___ by the end of next year.', 'will be finished', 'passive', ['will finish', 'will be finishing']],
  ['Neither the mayor ___ the teacher wanted to speak.', 'nor', 'pair', ['or', 'and']],
  ['The company has employed 300 workers ___ January.', 'since', 'time', ['for', 'during']],
  ['The reporter asked the minister ___ the tax.', 'to explain', 'inf', ['explaining', 'explain']],
  ['If it ___ tomorrow, the harbour games will be cancelled.', 'rains', 'cond', ['will rain', 'rained']],
]);

const QA_PROOF3 = bank(3, [
  ['Notes: The council meets on Monday. The vote was 6 to 3. The old bridge will be repaired. Draft: (1) The council met on Monday. (2) The vote was 6 to 5. (3) The old bridge will be repaired.', '(2) The vote was 6 to 5.', 'vote', ['(1) The council met on Monday.', '(3) The old bridge will be repaired.']],
  ['Notes: The robbery was at the bank on Harbour Street. Two men ran away. Nobody was hurt. Draft: (1) The robbery was at the bank on Harbour Street. (2) Two men ran away. (3) One person was hurt.', '(3) One person was hurt.', 'crime', ['(1) The robbery was at the bank on Harbour Street.', '(2) Two men ran away.']],
  ['Notes: The study looked at 300 fish. The fish are smaller than before. The cause is not known. Draft: (1) The study looked at 300 fish. (2) The fish are smaller than before. (3) The cause is too much fishing.', '(3) The cause is too much fishing.', 'science', ['(1) The study looked at 300 fish.', '(2) The fish are smaller than before.']],
  ['Notes: The film opens on Friday. It is two hours long. The director is {Ms. Reyes|@}. Draft: (1) The film opens on Friday. (2) It is three hours long. (3) The director is {Ms. Reyes|@}.', '(2) It is three hours long.', 'arts', ['(1) The film opens on Friday.', '(3) The director is {Ms. Reyes|@}.']],
  ['Notes: Unemployment fell to 5%. It was 7% last year. The mayor welcomed the news. Draft: (1) Unemployment fell to 5%. (2) It was 7% last year. (3) The mayor refused to comment.', '(3) The mayor refused to comment.', 'economy', ['(1) Unemployment fell to 5%.', '(2) It was 7% last year.']],
  ['Notes: The hospital will open on June 1. The new ward has 40 beds. It will cost three million coins. Draft: (1) The hospital will open on June 1. (2) The new ward has 40 beds. (3) It will cost thirty million coins.', '(3) It will cost thirty million coins.', 'health', ['(1) The hospital will open on June 1.', '(2) The new ward has 40 beds.']],
]);

const B3: Record<string, QaItem[]> = { news3: QA_SAY3, phone3: QA_PHONE3, mail3: QA_MAIL3, letter3: QA_LETTER3, gap3: QA_GAP3, proof3: QA_PROOF3 };

const SEC3 = ['politics', 'crime', 'science', 'health', 'environment', 'business', 'arts', 'opinion', 'world', 'sport', 'town'];
const T3: TaskTemplate[] = [
  { id: 'nt3_sort', rank: 3, arch: 'sort', say: 'The wire has sent more stories. Please put each one on the right page.', count: [4, 5], bins: SEC3,
    patterns: [
      { text: 'The government will raise the tax on fuel', bins: ['politics'] }, { text: 'The minister says that the new law will help farmers', bins: ['politics'] }, { text: 'Voters will choose a new mayor in June', bins: ['politics'] }, { text: 'The council can not agree on the budget', bins: ['politics'] }, { text: 'The party leader will leave her job next month', bins: ['politics'] }, { text: 'A new law on rubbish will start in May', bins: ['politics'] },
      { text: 'Police arrest two men after the robbery', bins: ['crime'] }, { text: 'A witness says that she saw the thief run away', bins: ['crime'] }, { text: 'The judge sends the thief to prison for two years', bins: ['crime'] }, { text: 'The jury finds the man guilty', bins: ['crime'] }, { text: 'A lawyer says that her client did nothing wrong', bins: ['crime'] }, { text: 'Police look for the thief who stole the boat', bins: ['crime'] },
      { text: 'Scientists discover a new planet', bins: ['science'] }, { text: 'A new study shows that fish can feel pain', bins: ['science'] }, { text: 'Researchers find a way to make clean energy', bins: ['science'] }, { text: 'The experiment will test a new kind of engine', bins: ['science'] }, { text: 'The university builds a robot to study the sea', bins: ['science'] }, { text: 'Scientists say that the theory is wrong', bins: ['science'] },
      { text: 'The hospital will open a new children\'s ward', bins: ['health'] }, { text: 'Doctors say that walking every day is good for the heart', bins: ['health'] }, { text: 'The flu is spreading fast in the town', bins: ['health'] }, { text: 'A new vaccine will be free for older people', bins: ['health'] }, { text: 'Fewer people smoke than ten years ago, a study shows', bins: ['health'] }, { text: 'Patients wait too long to see a doctor, say nurses', bins: ['health'] },
      { text: 'Too much waste is thrown into the bay', bins: ['environment'] }, { text: 'Solar panels will be fitted on the roof of the Town Hall', bins: ['environment'] }, { text: 'The forest near the town is now protected', bins: ['environment'] }, { text: 'The number of seabirds is falling', bins: ['environment'] }, { text: 'The council wants the town to recycle more', bins: ['environment'] }, { text: 'The sea is getting warmer every year', bins: ['environment'] },
      { text: 'Tourism brings record profits to the harbour', bins: ['business'] }, { text: 'The company will employ 300 new workers next year', bins: ['business'] }, { text: 'Prices of fish are rising fast', bins: ['business'] }, { text: 'The economy grew by two percent this year', bins: ['business'] }, { text: 'The bank cuts the price of loans', bins: ['business'] }, { text: 'Exports of tea are up by ten percent', bins: ['business'] },
      { text: 'The exhibition of old maps opens on Friday', bins: ['arts'] }, { text: 'The new film is slow, but the music is beautiful', bins: ['arts'] }, { text: 'The critic loved the new play', bins: ['arts'] }, { text: 'The harbour festival will begin with a concert', bins: ['arts'] }, { text: 'The museum has bought a famous picture', bins: ['arts'] }, { text: 'The new novel by a local writer is a great success', bins: ['arts'] },
      { text: 'I believe that the council is wrong about the bridge', bins: ['opinion'] }, { text: 'Why the council should listen to the young', bins: ['opinion'] }, { text: 'We should not close the library', bins: ['opinion'] }, { text: 'The town needs a new school, not a new road', bins: ['opinion'] }, { text: 'In my opinion, the paper is too expensive', bins: ['opinion'] }, { text: 'Readers argue about the new tax', bins: ['opinion'] },
      { text: 'The two leaders will sign the agreement in {Tokyo|@}', bins: ['world'] }, { text: 'Thousands leave their homes after the earthquake', bins: ['world'] }, { text: 'Talks between two countries end without agreement', bins: ['world'] }, { text: 'Floods hit the south of the country', bins: ['world'] }, { text: 'The president says that she will visit three countries', bins: ['world'] }, { text: 'The army leaves the capital', bins: ['world'] },
      { text: 'The champion lost her title at the harbour games', bins: ['sport'] }, { text: 'Our team reached the final', bins: ['sport'] }, { text: 'The player broke the record', bins: ['sport'] }, { text: 'The coach says that the team is ready', bins: ['sport'] }, { text: 'The swimmer won two medals', bins: ['sport'] }, { text: 'The match ended in a draw', bins: ['sport'] },
      { text: 'The market will move to the old harbour in June', bins: ['town'] }, { text: 'A new bus line will start next week', bins: ['town'] }, { text: 'The school will have a new head teacher', bins: ['town'] }, { text: 'The old cinema will open again', bins: ['town'] }, { text: 'A new road will be built by the river', bins: ['town'] }, { text: 'The library will open on Sundays', bins: ['town'] },
    ] },
  { id: 'nt3_vote', rank: 3, arch: 'check', say: 'The vote was last night. Please check my draft against my notes.', fields: [
    { id: 'plan', label: 'Plan', values: ['to repair the bridge', 'to build a new road', 'to close the old market', 'to open the library on Sundays'] },
    { id: 'yes', label: 'Votes for', range: [6, 9] },
    { id: 'no', label: 'Votes against', range: [2, 5] },
  ], docs: [{ kind: 'note', title: 'Reporter notes', fields: ['plan', 'yes', 'no'] }, { kind: 'card', title: 'Draft', fields: ['plan', 'yes', 'no'] }], target: 1, pWrong: 0.7 },
  { id: 'nt3_budget', rank: 3, arch: 'check', say: 'Please check my story against the budget paper. The total must add up.', fields: [
    { id: 'road', label: 'Roads', range: [2, 4], fmt: '{n} million' },
    { id: 'school', label: 'Schools', range: [3, 6], fmt: '{n} million' },
    { id: 'park', label: 'Parks', range: [1, 3], fmt: '{n} million' },
    { id: 'total', label: 'Total budget', calc: 'road + school + park', fmt: '{n} million' },
  ], docs: [{ kind: 'card', title: 'Budget paper', fields: ['road', 'school', 'park', 'total'] }, { kind: 'letter', title: 'Story', fields: ['road', 'school', 'park', 'total'] }], target: 1, pWrong: 0.7 },
  { id: 'nt3_trial', rank: 3, arch: 'check', say: 'Please check the draft about the trial against my notes from the court.', fields: [
    { id: 'who', label: 'Accused', values: ['{Mr. Pike|@}', '{Mr. Dale|@}', '{Mr. Brook|@}'] },
    { id: 'charge', label: 'Charge', values: ['selling old fish as fresh', 'stealing a boat', 'driving too fast', 'taking money from a shop'] },
    { id: 'next', label: 'Next hearing', values: ['Monday', 'Tuesday', 'Thursday', 'Friday'] },
  ], docs: [{ kind: 'note', title: 'Court notes', fields: ['who', 'charge', 'next'] }, { kind: 'letter', title: 'Draft', fields: ['who', 'charge', 'next'] }], target: 1, pWrong: 0.7 },
  { id: 'nt3_caption', rank: 3, arch: 'check', say: 'Please compare my photo notes with the caption. I think one detail may be wrong.', fields: [
    { id: 'who', label: 'Person', values: ['{Mayor Hart|@}', '{Ms. Brooks|@}', '{Professor Hale|@}', '{Captain Reed|@}'] },
    { id: 'what', label: 'Event', values: ['the opening of the new market', 'the start of the repair work', 'the harbour games', 'the school concert'] },
    { id: 'where', label: 'Place', values: ['Harbour Street', 'Station Road', 'Market Street', 'the Town Hall'] },
  ], docs: [{ kind: 'note', title: 'Photo notes', fields: ['who', 'what', 'where'] }, { kind: 'label', title: 'Caption', fields: ['who', 'what', 'where'] }], target: 1, pWrong: 0.7 },
  { id: 'nt3_tax', rank: 3, arch: 'check', say: 'The government has announced a new tax. Please check the details in my story.', fields: [
    { id: 'what', label: 'New tax on', values: ['sugar', 'fuel', 'plastic bags', 'large boats'] },
    { id: 'rate', label: 'Rate', range: [5, 15, 5], fmt: '{n}%' },
    { id: 'from', label: 'From', values: ['January 1', 'April 1', 'July 1', 'October 1'] },
  ], docs: [{ kind: 'card', title: 'Government statement', fields: ['what', 'rate', 'from'] }, { kind: 'letter', title: 'Draft', fields: ['what', 'rate', 'from'] }], target: 1, pWrong: 0.7 },
  { id: 'nt3_match', rank: 3, arch: 'check', say: 'Please check the score in my sports story.', fields: [
    { id: 'home', label: 'Home goals', range: [0, 5] },
    { id: 'away', label: 'Away goals', range: [0, 4] },
    { id: 'place', label: 'Played at', values: ['the harbour field', 'the school field', 'the town stadium'] },
  ], docs: [{ kind: 'note', title: 'Match notes', fields: ['home', 'away', 'place'] }, { kind: 'letter', title: 'Draft', fields: ['home', 'away', 'place'] }], target: 1, pWrong: 0.7 },
  { id: 'nt3_pad', rank: 3, arch: 'respond', mode: 'form', kind: 'phone', features: ['audioOnly'], say: 'The police are on the phone. Please write down what they say.',
    lines: ['Good afternoon. This is {who} from the police.', 'We have arrested a man after the robbery on {where}.', 'He will appear in court on {day}.'],
    fields: [
      { id: 'who', label: 'Caller', values: ['{Chief Rowan|@}', '{Sergeant Cole|@}', '{Sergeant Park|@}'] },
      { id: 'where', label: 'Robbery', values: ['Harbour Street', 'Station Road', 'Market Street', 'Bridge Road'] },
      { id: 'day', label: 'Court', values: ['Monday morning', 'Tuesday morning', 'Thursday afternoon', 'Friday morning'] },
    ] },
  { id: 'nt3_pad2', rank: 3, arch: 'respond', mode: 'form', kind: 'phone', features: ['audioOnly'], say: 'A reporter is calling from outside. Please write the message.',
    lines: ['Hello. This is {who}.', 'I am at the {place}. The profit this year is {sum}.', 'Please keep {space} for the story on {day}.'],
    fields: [
      { id: 'who', label: 'Caller', values: ['{Ms. Tan|@}', '{Ms. Idris|@}', '{Mr. Moss|@}'] },
      { id: 'place', label: 'Place', values: ['harbour company', 'shipping company', 'fish company', 'town bank'] },
      { id: 'sum', label: 'Profit', values: ['two million coins', 'three million coins', 'five million coins', 'twelve million coins'] },
      { id: 'space', label: 'Space', values: ['half a page', 'a whole page', 'a quarter of a page'] },
      { id: 'day', label: 'Story on', values: ['Wednesday', 'Thursday', 'Friday', 'Saturday'] },
    ] },
  { id: 'nt3_plan', rank: 3, arch: 'respond', mode: 'slot', kind: 'memo', say: 'Look at the plan, please. Where does the story go?', layout: 'calendar', rows: PAGES4, cols: SPOTS3,
    want: [
      { tag: 'top', text: 'The story is the main one, and it needs a big space at the top of a page.' }, { tag: 'mid', text: 'The story has a large photograph, so it needs a space in the middle of a page.' }, { tag: 'low', text: 'The story is short, so the bottom of a page is enough.' },
      { tag: 'p2', text: 'The story needs Page 2.' }, { tag: 'p3', text: 'The story needs Page 3.' }, { tag: 'p4', text: 'The story needs Page 4.' },
    ],
    avoid: [{ tag: 'p1', text: 'It can not go on the front page, because the front page has the trial.' }, { tag: 'p2', text: 'Page 2 is for letters.' }, { tag: 'p3', text: 'Page 3 is already full of sport.' }, { tag: 'p4', text: 'Please do not use Page 4, because the advertisements are there.' }],
    busy: ['Trial', 'Letters', 'Ad', 'Sport', 'World', 'Weather'], open: ['Dear all,'], close: ['Thank you.'] },
  { id: 'nt3_say', rank: 3, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'news3' },
  { id: 'nt3_phone', rank: 3, arch: 'respond', mode: 'choose', kind: 'phone', bank: 'phone3', features: ['audioOnly'] },
  { id: 'nt3_mail', rank: 3, arch: 'respond', mode: 'choose', kind: 'email', bank: 'mail3' },
  { id: 'nt3_letter', rank: 3, arch: 'respond', mode: 'choose', kind: 'letter', bank: 'letter3' },
  { id: 'nt3_gap', rank: 3, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'gap3' },
  { id: 'nt3_proof', rank: 3, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'proof3' },
];

// ---------------------------------------------------------------------------------------------- rank 4 (英検準1級, TOEIC 〜860)
// The council's deficit and the inquiry into the sale of the harbour land, the election between Mayor Hart and
// Ms. Brooks, the drought, the dock strike, the fish-market trial in its second month. Quotations, figures and
// conditions must be exact; sources write carefully, and so do the readers who disagree.

const R4A: AuthoredTask[] = [
  check('n4_inquiry', 4, 1, 'p_idris', 'The council will hold an inquiry. Please check my draft against its paper.', [
    note('Council paper', ['The council will hold an inquiry into the sale of the harbour land.', 'It will start on March 3 and report in June.']),
    paper('letter', 'Draft', [['what', 'Inquiry into', 'the sale of the harbour land'], ['begin', 'Starts', 'March 3'], ['report', 'Report in', 'September']]),
  ], 'report', { fix: ['June', ['June', 'September', 'December']] }),
  msg('n4_deficit', 4, 2, 'p_carver', 'email', { from: '{Mr. Dale|@}', subject: 'The budget' }, ['Dear {Ms. Tan|@},', 'The deficit for this year will be 2.4 million coins, which is 300,000 less than last year.', 'However, the council will still have to borrow money to pay for the new school.', 'Regards,', '{Mr. Dale|@}'],
    'The deficit is smaller than last year, but the council must still borrow money.', ['The deficit is larger than last year, so the council must borrow money.', 'The deficit is smaller than last year, so the council will not need to borrow money.'], { say: 'What does the council say about the deficit?' }),
  sort('n4_sort1', 4, 3, 'p_carver', 'These came in over lunch. Please put them where readers will look for them.', ['politics', 'business', 'environment'], [
    ['The mayor will speak about the budget', 'politics'], ['The company\'s profits fall again', 'business'], ['There is not enough water in the town', 'environment'], ['The vote on the new road is next week', 'politics'],
  ]),
  msg('n4_hale', 4, 4, 'p_carver', 'letter', { from: '{Professor Hale|@}' }, ['Dear Editor,', 'Your editorial on Monday argues that the town must sell the harbour land.', 'I do not agree. The land belongs to the town, and the town must only lease it.', 'Yours,', '{Professor Hale|@}'],
    'He thinks that the town must keep the land and lease it.', ['He thinks that the town must sell the land.', 'He thinks that the town must lease the land from a company.']),
  check('n4_survey', 4, 5, 'p_tan', 'The university has done a survey in the town. Please check the numbers in my story.', [
    paper('card', 'Survey', [['yes', 'For the new bridge', '58%'], ['no', 'Against it', '31%'], ['unsure', 'Not sure', '11%']]),
    paper('letter', 'Story', [['yes', 'For the new bridge', '58%'], ['no', 'Against it', '41%'], ['unsure', 'Not sure', '11%']]),
  ], 'no', { fix: ['31%', ['21%', '31%', '41%']] }),
  pad('n4_phone1', 4, 6, 'p_carver', ['Hello, this is {Ms. Idris|@} at the court.', 'The jury has gone out to decide the {Pike|@} case. We expect the verdict before five.', 'Please keep the front page open.'], [
    ['who', 'Caller', '{Ms. Idris|@}', ['{Ms. Tan|@}', '{Mr. Moss|@}']],
    ['case', 'Case', 'the {Pike|@} case', ['the {Dale|@} case', 'the {Brook|@} case']],
    ['time', 'Verdict expected', 'before five', ['after five', 'before noon']],
    ['page', 'Keep open', 'the front page', ['Page 2', 'the back page']],
  ], { features: ['audioOnly'], say: 'A call from the court. Please write down the message.' }),
  msg('n4_headline1', 4, 7, 'p_abbott', 'memo', { say: 'Which headline is accurate?' }, ['The council voted 8 to 3 to ban cars from Harbour Street on Saturdays.', 'The ban will start in the spring.', 'Shopkeepers have asked the council to think again.'],
    'Council votes to ban Saturday cars from Harbour Street from spring', ['Council votes to ban all cars from Harbour Street from spring', 'Council votes to ban Saturday cars from Harbour Street from autumn']),
  slot('n4_plan1', 4, 8, 'p_carver', 'memo', ['Dear all,', 'The inquiry story has a long headline and a graph, so it needs the top of a right-hand page.', 'The front page is full, and I do not want it opposite the advertisements.', 'Page 4 is where the advertisements are, so Page 3 is out as well.'], PAGES5, SPOTS3, ['top'], ['p1', 'p3', 'p4'], 'p5-top', ['Trial', 'Advertisement', 'Letters', 'Sport', 'Obituaries'],
    { say: 'Look at the plan, please. Where does the inquiry story go?', extraBusy: ['p2-low', 'p3-top', 'p1-low'] }),
  check('n4_quote', 4, 9, 'p_idris', 'The minister\'s spokeswoman wrote to us. Please check my words against her email.', [
    note('Spokeswoman\'s email', ['The minister has not said that the tax will end. She has said that it will be reviewed by the end of the year.']),
    paper('card', 'Words in the draft', [['verb', 'The minister said that the tax will be', 'reviewed'], ['when', 'By', 'the end of the year']]),
  ], null),
  msg('n4_contradict1', 4, 10, 'p_abbott', 'memo', { say: 'Which sentence in this draft does not agree with the notes?' }, [
    'Notes: The strike began on Monday. About 200 workers took part. They want 5% more money. The harbour was not closed.',
    'Draft: (1) The strike began on Monday. (2) The harbour was closed for two days. (3) The workers want 5% more money.',
  ], '(2) The harbour was closed for two days.', ['(1) The strike began on Monday.', '(3) The workers want 5% more money.']),
  msg('n4_source', 4, 11, 'p_carver', 'email', { from: '{Mr. Brook|@}', subject: 'A secret' }, ['Dear {Ms. Idris|@},', 'I can tell you what was said at the council meeting, but please do not use my name.', 'You may say that it comes from "a person at the council".', 'Yours,', '{Mr. Brook|@}'],
    'We may use the information, but we must not print his name.', ['We may print his name, but we must not use the information.', 'We may print his name and say that he is a person at the council.'], { say: 'What may we do with this information?' }),
  sort('n4_sort2', 4, 12, 'p_carver', 'More stories for you. Please be careful with the last two.', ['health', 'science', 'crime', 'world'], [
    ['Doctors say that many children have the flu', 'health'], ['A new way to help people with a rare disease', 'science'], ['The man says that he did not take the money', 'crime'], ['Two countries agree to stop the fight', 'world'],
  ]),
  check('n4_waiting', 4, 13, 'p_tan', 'The hospital has published its waiting times. Please check my figures.', [
    paper('card', 'Hospital report', [['avg', 'Average wait', '9 weeks'], ['max', 'Longest wait', '31 weeks'], ['pat', 'Patients waiting', '1,240']]),
    paper('letter', 'Draft', [['avg', 'Average wait', '9 weeks'], ['max', 'Longest wait', '13 weeks'], ['pat', 'Patients waiting', '1,240']]),
  ], 'max', { fix: ['31 weeks', ['13 weeks', '31 weeks', '41 weeks']] }),
  msg('n4_complaint', 4, 14, 'p_carver', 'email', { from: '{Mr. Grant|@}', subject: 'Misleading headline' }, ['Dear {Ms. Carver|@},', 'Your headline said that my company is "closing". In fact, we are moving to a larger building, and nobody will lose a job.', 'I expect a correction in the next edition.', 'Yours,', '{Mr. Grant|@}'],
    'We will print a correction: his company is moving, not closing.', ['We will print a correction: his company is closing, and some workers will lose their jobs.', 'We will print a correction: his company is moving to a smaller building.']),
  pad('n4_phone2', 4, 15, 'p_carver', ['Good morning. This is {Ms. Reyes|@} from the hospital.', 'The director will make a statement at noon in the main hall.', 'Please send a photographer, but no cameras are allowed in the wards.'], [
    ['who', 'Caller', '{Ms. Reyes|@}', ['{Ms. Hart|@}', '{Ms. Idris|@}']],
    ['what', 'Statement by', 'the director', ['the mayor', 'the minister']],
    ['when', 'At', 'noon', ['two', 'ten']],
    ['where', 'In', 'the main hall', ['the wards', 'the car park']],
  ], { features: ['audioOnly'], say: 'The hospital is on the line. Please write down what they say.' }),
  msg('n4_correct', 4, 16, 'p_abbott', 'memo', { say: 'Which sentence should we use in the correction?' }, ['Yesterday\'s story said that the library will close on Mondays.', 'The library will in fact close on Tuesdays, and it will open until eight on Fridays.'],
    'The library will close on Tuesdays, not Mondays.', ['The library will close on Mondays, not Tuesdays.', 'The library will close on Tuesdays and Mondays.']),
  check('n4_ok1', 4, 17, 'p_idris', 'This one is for the front page. Does my fact box agree with the court notes?', [
    paper('note', 'Court notes', [['who', 'Defendant', '{Mr. Pike|@}'], ['count', 'Charges', '3'], ['plea', 'Plea', 'not guilty']]),
    paper('card', 'Fact box', [['who', 'Defendant', '{Mr. Pike|@}'], ['count', 'Charges', '3'], ['plea', 'Plea', 'not guilty']]),
  ], null),
  msg('n4_reader1', 4, 18, 'c_scholar', 'letter', { from: '{Professor Hale|@}' }, ['Dear Editor,', 'Your report on the drought says that the reservoir is 40% full. The council\'s own figure, published on Tuesday, is 30%.', 'Which is correct?', 'Yours,', '{Professor Hale|@}'],
    'We will check, because the council\'s figure is 30%, not 40%.', ['We will check, because the council\'s figure is 40%, not 30%.', 'We will not check, because the council\'s figure is 30%.']),
  sort('n4_sort3', 4, 19, 'p_carver', 'The editorial meeting is at four. Please sort these before then.', ['opinion', 'business', 'politics', 'arts'], [
    ['Why the council must end the strike', 'opinion'], ['A retired judge joins the campaign for mayor', 'politics'], ['The auction of old harbour pictures makes a lot of money', 'arts'], ['The company will sell its old building', 'business'],
  ]),
  check('n4_percent', 4, 20, 'p_tan', 'Unemployment has fallen. Please check how I described the change.', [
    paper('card', 'Official figures', [['now', 'This year', '4.5%'], ['then', 'Last year', '6%'], ['drop', 'Fall', '1.5 points']]),
    paper('letter', 'Draft', [['now', 'This year', '4.5%'], ['then', 'Last year', '6%'], ['drop', 'Fall', '2.5 points']]),
  ], 'drop', { fix: ['1.5 points', ['0.5 points', '1.5 points', '2.5 points']] }),
  msg('n4_say1', 4, 21, 'c_merchant', 'speech', { say: 'I was hoping that you could correct the story about my shop, which said it would be closed for the whole of May.' }, ['I was hoping that you could correct the story about my shop, which said it would be closed for the whole of May.'],
    'Certainly. We will print a correction about your shop tomorrow.', ['Certainly. We will print a story saying that your shop will be closed for the whole of May.', 'Certainly. We will print a correction about your shop last May.']),
  check('n4_caption', 4, 22, 'p_moss', 'The new mayor is photographed with the old one. Please check the caption against my notes.', [
    paper('note', 'Photo notes', [['left', 'On the left', '{Mayor Hart|@}'], ['right', 'On the right', '{Ms. Brooks|@}'], ['place', 'Place', 'the steps of the Town Hall']]),
    paper('label', 'Caption', [['left', 'On the left', '{Mayor Hart|@}'], ['right', 'On the right', '{Mr. Dale|@}'], ['place', 'Place', 'the steps of the Town Hall']]),
  ], 'right', { fix: ['{Ms. Brooks|@}', ['{Ms. Brooks|@}', '{Mr. Dale|@}', '{Ms. Reyes|@}']] }),
];

const R4B: AuthoredTask[] = [
  msg('n4_headline2', 4, 23, 'p_abbott', 'memo', { say: 'Which headline is accurate for the science page?' }, ['Scientists at the university have found a new way to clean oil from the sea.', 'It has been tested only in the laboratory.', 'They hope to test it at the harbour next year.'],
    'Scientists find a new way to clean oil from the sea, but only in the laboratory for now', ['Scientists clean oil from the harbour in a test, the university says', 'Scientists find a new way to clean oil from the sea and will test it in the laboratory next year']),
  check('n4_budget', 4, 24, 'p_tan', 'The council has published its spending plan. Please check my story against it.', [
    paper('card', 'Spending plan', [['hosp', 'Hospital', '5.2 million'], ['edu', 'Education', '4.1 million'], ['roads', 'Roads', '2.7 million'], ['total', 'Total', '12.0 million']]),
    paper('letter', 'Story', [['hosp', 'Hospital', '5.2 million'], ['edu', 'Education', '4.1 million'], ['roads', 'Roads', '2.7 million'], ['total', 'Total', '12.4 million']]),
  ], 'total', { fix: ['12.0 million', ['11.0 million', '12.0 million', '12.4 million']] }),
  msg('n4_reader2', 4, 25, 'p_carver', 'letter', { from: '{Grandma Rose|@}' }, ['Dear Editor,', 'I am writing to protest against the plan to close the post office on Station Road.', 'Older people like me need it, because we can not travel to the middle of town.', 'I hope that you will support us.', 'Yours,', '{Grandma Rose|@}'],
    'She is against closing the post office because older people need it.', ['She is for closing the post office because older people need it.', 'She is against closing the town hall because older people need it.']),
  sort('n4_sort4', 4, 26, 'p_carver', 'Here are the last stories for the weekend. Please read them well.', ['features', 'travel', 'letters'], [
    ['A day with the people who run the harbour', 'features'], ['A weekend by the sea: where to stay and what to see', 'travel'], ['Readers write about the post office', 'letters'], ['Why more people are taking up running', 'features'],
  ]),
  pad('n4_phone3', 4, 27, 'p_carver', ['Hello, this is {Mr. Abbott|@}.', 'I am at the printer. The plates for Page 3 are not ready, and the deadline is at nine.', 'Please send the corrected advertisement from {Mr. Grant|@} at once.'], [
    ['who', 'Caller', '{Mr. Abbott|@}', ['{Mr. Moss|@}', '{Mr. Dale|@}']],
    ['where', 'He is at', 'the printer', ['the court', 'the hospital']],
    ['page', 'Plates not ready', 'Page 3', ['Page 5', 'Page 13']],
    ['dead', 'Deadline', 'nine', ['six', 'eleven']],
  ], { features: ['audioOnly'], say: '{Mr. Abbott|@} is on the line from the printer. Please write the message.' }),
  check('n4_ok2', 4, 28, 'p_idris', 'Please check this against my recording notes. I think it is right.', [
    note('Recording notes', ['{Judge Lane|@} said: "I will make my decision on Friday. I will not hear any more evidence."']),
    paper('card', 'Words in the draft', [['who', 'Said by', '{Judge Lane|@}'], ['when', 'Decision on', 'Friday'], ['more', 'More evidence', 'not heard']]),
  ], null),
  msg('n4_condition', 4, 29, 'p_carver', 'email', { from: '{Mr. Okoye|@}', subject: 'Our offer' }, ['Dear {Ms. Carver|@},', 'We will advertise with you for a year, provided that you print our advertisement on the right-hand page and never next to a rival\'s.', 'If you agree, we will sign the contract on Monday.', 'Regards,', '{Mr. Okoye|@}'],
    'He will sign on Monday if the advertisement is on a right-hand page, away from rivals.', ['He will sign on Monday if the advertisement is next to a rival\'s.', 'He will sign on Monday only if the advertisement is on a left-hand page.'], { say: 'What does {Mr. Okoye|@} want from us?' }),
  check('n4_dates', 4, 30, 'p_tan', 'The strike lasted three weeks. Please check the days in my list.', [
    paper('note', 'Strike notes', [['start', 'Strike began', 'March 4'], ['talks', 'Talks stopped', 'March 12'], ['end', 'Strike ended', 'March 20']]),
    paper('letter', 'List', [['start', 'Strike began', 'March 4'], ['talks', 'Talks stopped', 'March 21'], ['end', 'Strike ended', 'March 20']]),
  ], 'talks', { fix: ['March 12', ['March 2', 'March 12', 'March 21']] }),
  msg('n4_contradict2', 4, 31, 'p_abbott', 'memo', { say: 'Which sentence of this draft says more than the notes?' }, [
    'Notes: The mayor opened the new school on Monday. About 400 children will study there. She said nothing about the opposition.',
    'Draft: (1) The mayor opened the new school on Monday. (2) The mayor attacked the opposition for the delay. (3) About 400 children will study there.',
  ], '(2) The mayor attacked the opposition for the delay.', ['(1) The mayor opened the new school on Monday.', '(3) About 400 children will study there.']),
  msg('n4_say2', 4, 32, 'c_student', 'speech', { say: 'I am doing a project on newspapers. Could I interview one of your reporters on Friday afternoon?' }, ['I am doing a project on newspapers. Could I interview one of your reporters on Friday afternoon?'],
    'Of course. {Ms. Idris|@} will be free on Friday afternoon.', ['Of course. {Ms. Idris|@} will be free on Friday morning.', 'Of course. {Ms. Idris|@} will not be free on Friday afternoon.']),
  slot('n4_plan2', 4, 33, 'p_carver', 'memo', ['Dear all,', 'The editorial must go on the left-hand side, which means an even page.', 'It needs a full column at the top, and the letters must stay where they are on Page 2.', 'The sport has Page 4.'], PAGES5, SPOTS3, ['top'], ['p1', 'p3', 'p5', 'p2'], 'p4-top', ['Letters', 'Sport', 'Advertisement', 'Trial', 'World'],
    { say: 'Look at the plan, please. Where does the editorial go?', extraBusy: ['p4-mid', 'p2-top'] }),
  check('n4_survey2', 4, 34, 'p_idris', 'A poll came out this morning. Please check my story against it.', [
    paper('card', 'Poll', [['hart', '{Mayor Hart|@}', '44%'], ['brooks', '{Ms. Brooks|@}', '41%'], ['margin', 'Margin of error', '3 points']]),
    paper('letter', 'Story', [['hart', '{Mayor Hart|@}', '44%'], ['brooks', '{Ms. Brooks|@}', '41%'], ['margin', 'Margin of error', '1 point']]),
  ], 'margin', { fix: ['3 points', ['1 point', '3 points', '5 points']] }),
  msg('n4_headline3', 4, 35, 'p_abbott', 'memo', { say: 'This is a close poll. Which headline is right?' }, ['Poll: {Mayor Hart|@} 44%, {Ms. Brooks|@} 41%.', 'The margin of error is 3 points.', 'About 800 voters were asked.'],
    '{Mayor Hart|@} and {Ms. Brooks|@} are too close to call, poll shows', ['{Mayor Hart|@} clearly ahead of {Ms. Brooks|@}, poll shows', '{Ms. Brooks|@} narrowly ahead of {Mayor Hart|@}, poll shows']),
  sort('n4_sort5', 4, 36, 'p_carver', 'Please sort these last ones. Think about what each story is really about.', ['crime', 'business', 'politics', 'environment'], [
    ['A witness says that the company hid the figures', 'crime'], ['The company will sell two of its old buildings', 'business'], ['The mayor promises a new bridge if she wins again', 'politics'], ['Wind farm plan divides the town', 'environment'],
  ]),
  msg('n4_reader3', 4, 37, 'p_carver', 'email', { from: '{Ms. Hart|@}', subject: 'The new wind farm' }, ['Dear Editor,', 'Your story says that the council has already agreed to the wind farm. This is not true.', 'The council will vote on the plan in October.', 'Regards,', '{Ms. Hart|@}'],
    'The council has not agreed yet, and the vote will take place in October.', ['The council has agreed, and the vote will take place in October.', 'The council has not agreed yet, and the vote took place in August.'], { say: 'What does the council say about the wind farm?' }),
  check('n4_trial', 4, 38, 'p_idris', 'The trial is in its second month. Please check the summary in my story.', [
    paper('note', 'Court notes', [['witness', 'Witnesses heard', '14'], ['days', 'Days in court', '22'], ['verdict', 'Verdict expected', 'Friday']]),
    paper('letter', 'Story', [['witness', 'Witnesses heard', '14'], ['days', 'Days in court', '32'], ['verdict', 'Verdict expected', 'Friday']]),
  ], 'days', { fix: ['22', ['12', '22', '32']] }),
  msg('n4_say3', 4, 39, 'c_sailor', 'phone', { say: 'This is {Captain Reed|@}. The storm warning in your paper says Thursday. The radio says Wednesday night.' }, ['This is {Captain Reed|@}. The storm warning in your paper says Thursday. The radio says Wednesday night.'],
    'Thank you, {Captain Reed|@}. We will check the storm warning with the weather office.', ['Thank you, {Captain Reed|@}. We will check the storm warning with the radio.', 'Thank you, {Captain Reed|@}. The storm warning is correct.']),
  check('n4_quote2', 4, 40, 'p_idris', 'The mayor\'s office has sent a prepared statement. Please check that I have not changed her words.', [
    note('Prepared statement', ['"We welcome the survey, but we do not agree with its conclusions."']),
    paper('card', 'Quotation in the draft', [['first', 'The mayor', 'welcomed the survey'], ['second', 'But she', 'agreed with its conclusions']]),
  ], 'second', { fix: ['did not agree with its conclusions', ['agreed with its conclusions', 'did not agree with its conclusions', 'did not read its conclusions']] }),
  msg('n4_gap1', 4, 41, 'p_abbott', 'memo', { say: 'Which word completes the sentence?' }, ['The council has refused to publish the report, ___ the pressure from residents.'],
    'despite', ['although', 'whereas']),
  pad('n4_phone4', 4, 42, 'p_carver', ['Hello. This is {Ms. Tan|@}. I am at the dock.', 'The strike is over. The workers will get 4% more money, and they go back to work tomorrow at six.', 'Please take the strike story off Page 1.'], [
    ['who', 'Caller', '{Ms. Tan|@}', ['{Ms. Idris|@}', '{Ms. Hart|@}']],
    ['rise', 'More money', '4%', ['5%', '14%']],
    ['back', 'Back to work', 'tomorrow at six', ['today at six', 'tomorrow at ten']],
    ['page', 'Take off', 'Page 1', ['Page 3', 'Page 5']],
  ], { features: ['audioOnly'], say: '{Ms. Tan|@} is calling from the dock. Please write the message.' }),
  msg('n4_review', 4, 43, 'p_carver', 'letter', { from: '{Mr. Grant|@}' }, ['Dear Editor,', 'Your review of the new restaurant by the sea called the service "slow".', 'I ate there on the opening night, and I thought that the staff were excellent.', 'Yours,', '{Mr. Grant|@}'],
    'He disagrees with the review because the service was excellent on the opening night.', ['He agrees with the review because the service was slow on the opening night.', 'He disagrees with the review because the staff were slow on the opening night.']),
  check('n4_ok3', 4, 44, 'p_tan', 'Here is the table for the business page. Is it the same as the company report?', [
    paper('card', 'Company report', [['sales', 'Sales', '8.1 million'], ['profit', 'Profit', '0.9 million'], ['staff', 'Staff', '210']]),
    paper('letter', 'Table', [['sales', 'Sales', '8.1 million'], ['profit', 'Profit', '0.9 million'], ['staff', 'Staff', '210']]),
  ], null),
  sort('n4_sort6', 4, 45, 'p_carver', 'The weekend again! Please put these where they belong.', ['arts', 'sport', 'opinion', 'features'], [
    ['The new film by a local man opens on Friday', 'arts'], ['Our swimmers win two cups at the games', 'sport'], ['The council has failed the young people of this town', 'opinion'], ['Meet the fisherman who has fished these waters for fifty years', 'features'],
  ]),
];
const R4 = [...R4A, ...R4B];

// ---------------------------------------------------------------------------------------------- rank 4 templates and banks

const QA_SAY4 = bank(4, [
  ['I was hoping that you could correct the story about my shop, which said that it would be closed for the whole of May.', 'Certainly. We will print a correction about your shop tomorrow.', 'correct', ['Certainly. We will print a story saying that your shop will be closed for the whole of May.', 'Certainly. We will print a correction about your shop last May.']],
  ['Would it be possible to speak to the editor about the headline on Page 3? I think that it is misleading.', 'Of course. I will ask the editor to call you about the headline on Page 3.', 'complaint', ['Of course. I will ask the editor to call you about the headline on the front page.', 'I am afraid that the editor never speaks about the headline on Page 3.']],
  ['I understand that the paper will not publish the names of the victims until the families have been informed.', 'That is correct. We wait until the families have been told.', 'policy', ['That is correct. We publish the names before the families have been told.', 'That is incorrect. We wait until the families have been told.']],
  ['We would like to hold a press conference about the new hospital on Thursday at ten.', 'Thank you. We will send a reporter and a photographer to the press conference on Thursday at ten.', 'press', ['Thank you. We will send a reporter and a photographer to the press conference on Thursday at two.', 'Thank you. We will send a reporter and a photographer to the press conference on Wednesday at ten.']],
  ['Are you certain that the figure of 40% is accurate? The council said 30%.', 'Thank you for asking. We will check the figure with the council before we print it again.', 'check', ['Thank you for asking. We are certain that the council said 40%.', 'Thank you for asking. We will check the figure with the council after we print it again.']],
  ['Could you tell me whether the paper has decided to support the mayor in the election?', 'The paper has not yet decided whether to support the mayor in the election.', 'opinion', ['The paper has already decided to support the mayor in the election.', 'The paper has not decided whether to support the election.']],
  ['I have a document that proves the council hid the figures. May I send it to you in confidence?', 'Yes. We will keep your name secret and check the document before we publish anything.', 'source', ['Yes. We will print your name and publish the document before we check it.', 'No. We will keep your name secret and check the document before we publish anything.']],
  ['Why was my letter about the harbour land shortened?', 'We had to shorten many letters this week because of a shortage of space, but we kept your main point.', 'reason', ['We had to lengthen many letters this week because of a shortage of space, but we kept your main point.', 'We had to shorten many letters this week because of a shortage of space, so we did not print yours.']],
]);

const QA_PHONE4 = bank(4, [
  ['Good morning. I am calling on behalf of the mayor to confirm that she will speak at the opening on Friday.', 'Thank you. We will tell our reporter that the mayor will speak at the opening on Friday.', 'confirm', ['Thank you. We will tell our reporter that the mayor will speak at the opening on Monday.', 'Thank you. We will tell our reporter that the mayor will not speak at the opening on Friday.']],
  ['I would like to place an obituary for my father. He died on Sunday, and the funeral is on Thursday.', 'I am very sorry. We will print the obituary for your father, with the funeral on Thursday.', 'obituary', ['I am very sorry. We will print the obituary for your father, with the funeral on Tuesday.', 'I am very glad. We will print the obituary for your father, with the funeral on Thursday.']],
  ['This is the harbour authority. The ferry has been cancelled because of the storm, and it will not run until Wednesday.', 'Thank you. We will report that the ferry will not run until Wednesday.', 'notice', ['Thank you. We will report that the ferry will not run until Saturday.', 'Thank you. We will report that the ferry will run on Wednesday.']],
  ['I am calling about the report on the strike. You wrote that 300 workers took part, but it was 200.', 'Thank you for telling us. We will check whether 200 workers took part and correct the figure.', 'figure', ['Thank you for telling us. We will check whether 300 workers took part and correct the figure.', 'Thank you for telling us. We are sure that 200 workers took part, so we will not check.']],
  ['Is the editor available? I would like to discuss an exclusive story about the harbour company.', 'I am afraid that she is out until three. May I take your name and number so that she can call you about the harbour company?', 'transfer', ['I am afraid that she is out until three. May I take your name and number so that she can call you about the hospital?', 'She is available now. May I take your name and number so that she can call you about the harbour company?']],
  ['I am a lawyer, and I represent {Mr. Dale|@}. We object to the article that you plan to publish on Friday.', 'I understand. I will give your objection to the editor before we publish on Friday.', 'legal', ['I understand. I will give your objection to the editor after we publish on Friday.', 'I understand. I will give your objection to {Mr. Dale|@} before we publish on Friday.']],
  ['I am the spokeswoman for the hospital. The director will not comment before the inquiry reports.', 'Thank you. We will say that the director will not comment before the inquiry reports.', 'nocomment', ['Thank you. We will say that the director will comment before the inquiry reports.', 'Thank you. We will say that the inquiry will not comment before the director reports.']],
  ['Can you tell me whether the paper accepts advertisements for the election campaign?', 'Yes, we accept advertisements for the election campaign, but they must be clearly marked as advertisements.', 'ads', ['No, we do not accept advertisements for the election campaign, but they must be clearly marked as advertisements.', 'Yes, we accept advertisements for the election campaign, and they must not be marked as advertisements.']],
]);

const QA_MAIL4 = bank(4, [
  ['Dear Editor, we regret to inform you that the interview with the minister has been postponed until further notice.', 'Thank you for letting us know. Please tell us as soon as the interview with the minister has a new date.', 'postpone', ['Thank you for letting us know. We will print the interview with the minister on the date agreed.', 'Thank you for letting us know. Please tell us as soon as the interview with the minister has been cancelled.']],
  ['Dear {Ms. Carver|@}, I would be grateful if you could publish the enclosed statement in full, without cuts.', 'Thank you. We will read the enclosed statement and decide whether we can publish it in full.', 'statement', ['Thank you. We will cut the enclosed statement and publish it in full.', 'Thank you. We will read the enclosed statement and decide whether we can cut it in full.']],
  ['Dear Editor, your story claimed that the company had been fined. In fact, the case was dismissed.', 'We apologize. We will publish a correction saying that the case against the company was dismissed.', 'apology', ['We apologize. We will publish a correction saying that the company was fined.', 'We are pleased. We will publish a correction saying that the case against the company was dismissed.']],
  ['Dear Editor, the council meeting that you reported on Tuesday took place on Monday evening.', 'Thank you for pointing it out. We will correct the date of the council meeting to Monday evening.', 'date', ['Thank you for pointing it out. We will correct the date of the council meeting to Tuesday evening.', 'Thank you for pointing it out. We will correct the date of the council meeting to Monday morning.']],
  ['Dear Editor, I would like to submit an article for your opinion page on the future of the harbour.', 'Thank you. Please send your article on the future of the harbour, and we will let you know by Friday whether we can use it.', 'submit', ['Thank you. Please send your article on the future of the library, and we will let you know by Friday whether we can use it.', 'Thank you. Please send your article on the future of the harbour, and we will let you know last Friday whether we can use it.']],
  ['Dear {Ms. Carver|@}, we are happy to confirm your place at the conference. The first session begins at nine.', 'Thank you for confirming. We will make sure that our reporter arrives before nine.', 'accreditation', ['Thank you for confirming. We will make sure that our reporter arrives after nine.', 'Thank you for confirming. We are sorry that our reporter will not attend the conference.']],
  ['Dear Editor, I demand an immediate apology for the photograph on Page 1. It was taken without my permission.', 'We take your complaint seriously. We will look into how the photograph on Page 1 was taken.', 'complaint', ['We take your complaint seriously. We will look into how the photograph on Page 11 was taken.', 'We do not take your complaint seriously. We will look into how the photograph on Page 1 was taken.']],
  ['Dear Editor, thank you for covering the school fair. The head teacher was delighted with the coverage.', 'We are glad that the head teacher was pleased with our coverage of the school fair.', 'thanks', ['We are sorry that the head teacher was unhappy with our coverage of the school fair.', 'We are glad that the head teacher was pleased with our coverage of the harbour fair.']],
]);

const QA_LETTER4 = bank(4, [
  ['Dear Editor, I was disappointed that your editorial did not mention the effect of the dock strike on small shops. Many of us have lost a week\'s takings.', 'Thank you for your letter. You are right that the editorial did not mention the effect of the strike on small shops.', 'reply', ['Thank you for your letter. You are wrong that the editorial did not mention the effect of the strike on small shops.', 'Thank you for your letter. You are right that the editorial mentioned the effect of the strike on large shops.']],
  ['Dear Editor, may I draw your attention to an error? You gave the date of the harbour inquiry as March 3. It is March 13.', 'Thank you for drawing our attention to the error. The harbour inquiry begins on March 13.', 'error', ['Thank you for drawing our attention to the error. The harbour inquiry begins on March 3.', 'Thank you for drawing our attention to the error. The harbour inquiry began on March 13.']],
  ['Dear Editor, your columnist claims that the new tax will hurt the poor. I disagree, and I enclose figures that show the opposite.', 'We will read the figures that you enclose, which, you say, show that the new tax will not hurt the poor.', 'argue', ['We will read the figures that you enclose, which, you say, show that the new tax will hurt the poor.', 'We will not read the figures that you enclose, which, you say, show that the new tax will not hurt the poor.']],
  ['Dear Editor, I am writing to thank the reporter who spent three days at the hospital to tell our story. She was patient and kind.', 'We are delighted that you were pleased with the reporter who spent three days at the hospital.', 'thanks', ['We are disappointed that you were not pleased with the reporter who spent three days at the hospital.', 'We are delighted that you were pleased with the reporter who spent three weeks at the hospital.']],
  ['Dear Editor, why did the paper print the name of the boy who is accused? He is only fifteen, and he has not been found guilty.', 'You raise an important point. We are looking again at our decision to print the name of the boy.', 'ethics', ['You raise an unimportant point. We are looking again at our decision to print the name of the boy.', 'You raise an important point. We are looking again at our decision to print the name of the girl.']],
  ['Dear Editor, I have been a subscriber for twenty years, but I will cancel unless the price is reduced.', 'We value your twenty years as a subscriber, and we will consider your request about the price.', 'cancel', ['We value your twenty years as a subscriber, and we will cancel your subscription at once.', 'We value your twenty months as a subscriber, and we will consider your request about the price.']],
]);

const QA_GAP4 = bank(4, [
  ['The mayor refused to comment, ___ the council had voted against her plan.', 'since', 'link', ['whereas the', 'despite the']],
  ['Not only ___ the strike close the port, but it also stopped the ferry.', 'did', 'inv', ['was', 'has']],
  ['The report, ___ was published on Monday, has been widely criticized.', 'which', 'rel', ['what', 'who']],
  ['The council is under pressure ___ the deficit.', 'to reduce', 'inf', ['reducing', 'reduce']],
  ['Had the council acted earlier, the flood ___ avoided.', 'might have been', 'cond', ['might be', 'might have']],
  ['Residents were warned ___ the water.', 'not to drink', 'inf', ['do not drink', 'not drink']],
  ['The minister insisted that the inquiry ___ held in public.', 'be', 'subj', ['is', 'was']],
  ['The scheme will go ahead ___ the council\'s doubts.', 'despite', 'link', ['although', 'however']],
  ['The company has ___ the claim that it hid the figures.', 'denied', 'verb', ['denying', 'deny']],
  ['Neither of the candidates ___ the budget.', 'has read', 'agree', ['have read', 'are reading']],
]);

const QA_PROOF4 = bank(4, [
  ['Notes: The council approved the plan by 9 votes to 6. The first school will open in September. The cost is estimated at 8 million coins. Draft: (1) The council approved the plan by 9 votes to 6. (2) The first school will open in August. (3) The cost is estimated at 8 million coins.', '(2) The first school will open in August.', 'vote', ['(1) The council approved the plan by 9 votes to 6.', '(3) The cost is estimated at 8 million coins.']],
  ['Notes: The defendant pleaded not guilty. The trial will last three weeks. The jury has twelve members. Draft: (1) The defendant pleaded guilty. (2) The trial will last three weeks. (3) The jury has twelve members.', '(1) The defendant pleaded guilty.', 'court', ['(2) The trial will last three weeks.', '(3) The jury has twelve members.']],
  ['Notes: Prices rose by 2% in March. Food was the main reason. Rents did not change. Draft: (1) Prices rose by 2% in March. (2) Food was the main reason. (3) Rents also rose.', '(3) Rents also rose.', 'economy', ['(1) Prices rose by 2% in March.', '(2) Food was the main reason.']],
  ['Notes: The study followed 2,000 patients for five years. Those who walked daily were healthier. The researchers did not study diet. Draft: (1) The study followed 2,000 patients for five years. (2) Those who walked daily were healthier. (3) Diet made no difference.', '(3) Diet made no difference.', 'science', ['(1) The study followed 2,000 patients for five years.', '(2) Those who walked daily were healthier.']],
  ['Notes: The wind farm will have 12 turbines. Villagers object to the noise. The council will decide in October. Draft: (1) The wind farm will have 12 turbines. (2) Villagers object to the noise. (3) The council has already approved the plan.', '(3) The council has already approved the plan.', 'environment', ['(1) The wind farm will have 12 turbines.', '(2) Villagers object to the noise.']],
  ['Notes: The museum bought the picture for 2 million coins. A private collector owned it for fifty years. The museum will show it in June. Draft: (1) The museum bought the picture for 2 million coins. (2) A private collector owned it for fifteen years. (3) The museum will show it in June.', '(2) A private collector owned it for fifteen years.', 'arts', ['(1) The museum bought the picture for 2 million coins.', '(3) The museum will show it in June.']],
]);

const B4: Record<string, QaItem[]> = { news4: QA_SAY4, phone4: QA_PHONE4, mail4: QA_MAIL4, letter4: QA_LETTER4, gap4: QA_GAP4, proof4: QA_PROOF4 };

const SEC4 = ['politics', 'crime', 'science', 'health', 'environment', 'business', 'arts', 'opinion', 'world', 'sport', 'features', 'travel'];
const T4: TaskTemplate[] = [
  { id: 'nt4_sort', rank: 4, arch: 'sort', say: 'The wire has sent a batch. Please put each story where readers will look for it.', count: [4, 5], bins: SEC4,
    patterns: [
      { text: 'The coalition falls apart after a dispute over the budget', bins: ['politics'] }, { text: 'The minister resigns after criticism from her own party', bins: ['politics'] }, { text: 'Opposition leaders demand an inquiry into the sale of land', bins: ['politics'] }, { text: 'Voters will go to the polls on October 3', bins: ['politics'] }, { text: 'The new law restricts the use of plastic bags', bins: ['politics'] }, { text: 'The mayor promises a new bridge if she wins again', bins: ['politics'] },
      { text: 'The defendant denies all the charges', bins: ['crime'] }, { text: 'Prosecutors say that the accused company hid the figures', bins: ['crime'] }, { text: 'A witness gives evidence against the driver', bins: ['crime'] }, { text: 'The jury will consider its verdict on Friday', bins: ['crime'] }, { text: 'The thief is sent to prison for three years', bins: ['crime'] }, { text: 'Police investigate a fire at the old warehouse', bins: ['crime'] },
      { text: 'A breakthrough in the treatment of a rare disease', bins: ['science'] }, { text: 'Researchers find a new species of fish near the coast', bins: ['science'] }, { text: 'A new telescope will look for planets', bins: ['science'] }, { text: 'Scientists develop a battery that lasts a week', bins: ['science'] }, { text: 'A study finds that the moon is slowly moving away', bins: ['science'] }, { text: 'The university tests a robot that cleans the sea', bins: ['science'] },
      { text: 'An outbreak of flu closes three schools', bins: ['health'] }, { text: 'Waiting times at the hospital reach a record', bins: ['health'] }, { text: 'Nurses say that there is a shortage of staff', bins: ['health'] }, { text: 'A new vaccine will be free for all children', bins: ['health'] }, { text: 'Doctors warn that sugar is harmful to the young', bins: ['health'] }, { text: 'The clinic will open on Saturdays', bins: ['health'] },
      { text: 'Drought forces the town to limit the use of water', bins: ['environment'] }, { text: 'Wind farm plan divides the coastal villages', bins: ['environment'] }, { text: 'The council plans to plant a thousand trees', bins: ['environment'] }, { text: 'The bay is cleaner than ten years ago, a survey finds', bins: ['environment'] }, { text: 'Rubbish on the beach worries residents', bins: ['environment'] }, { text: 'Energy from the sun now powers the school', bins: ['environment'] },
      { text: 'Shareholders approve the merger of two banks', bins: ['business'] }, { text: 'The company\'s profits fall for the second year', bins: ['business'] }, { text: 'The dock union calls off its strike after a pay offer', bins: ['business'] }, { text: 'The tourist industry fears a poor summer', bins: ['business'] }, { text: 'Interest rates stay the same', bins: ['business'] }, { text: 'The factory will make 100 workers redundant', bins: ['business'] },
      { text: 'The show of a local painter opens at the museum', bins: ['arts'] }, { text: 'The auction of old pictures raises record sums', bins: ['arts'] }, { text: 'The orchestra will tour the coast in June', bins: ['arts'] }, { text: 'The critic calls the new play a triumph', bins: ['arts'] }, { text: 'A new novel set in the harbour wins a prize', bins: ['arts'] }, { text: 'The film festival opens with a documentary about the sea', bins: ['arts'] },
      { text: 'The council has failed the young people of this town', bins: ['opinion'] }, { text: 'Why the strike was a mistake', bins: ['opinion'] }, { text: 'We should lease the land, not sell it', bins: ['opinion'] }, { text: 'The mayor deserves a second term', bins: ['opinion'] }, { text: 'Why the old library must stay', bins: ['opinion'] }, { text: 'Readers must not lose their local paper', bins: ['opinion'] },
      { text: 'The ambassador leaves after the talks fail', bins: ['world'] }, { text: 'Two countries sign a treaty to protect the sea', bins: ['world'] }, { text: 'Thousands of families flee the flood', bins: ['world'] }, { text: 'The summit ends without an agreement', bins: ['world'] }, { text: 'The army withdraws from the border', bins: ['world'] }, { text: 'The president visits the earthquake zone', bins: ['world'] },
      { text: 'Our swimmers break two records at the national games', bins: ['sport'] }, { text: 'The coach resigns after a heavy defeat', bins: ['sport'] }, { text: 'The captain returns after an injury', bins: ['sport'] }, { text: 'The town is chosen to host the sailing championship', bins: ['sport'] }, { text: 'The team wins the cup on penalties', bins: ['sport'] }, { text: 'A young runner qualifies for the national team', bins: ['sport'] },
      { text: 'A day in the life of a harbour pilot', bins: ['features'] }, { text: 'Meet the fisherman who has fished these waters for fifty years', bins: ['features'] }, { text: 'How the old market became the heart of the town', bins: ['features'] }, { text: 'The baker who gets up at three', bins: ['features'] }, { text: 'Inside the new hospital kitchen', bins: ['features'] }, { text: 'A year with the rescue boat crew', bins: ['features'] },
      { text: 'Five quiet villages to visit by the coast', bins: ['travel'] }, { text: 'Where to find the best views of the harbour', bins: ['travel'] }, { text: 'A weekend by train through the mountains', bins: ['travel'] }, { text: 'The island that most visitors miss', bins: ['travel'] }, { text: 'Cheap flights to the south for the winter', bins: ['travel'] }, { text: 'A guide to the town\'s old inns', bins: ['travel'] },
    ] },
  { id: 'nt4_survey', rank: 4, arch: 'check', say: 'A survey was published this morning. Please check the percentages in my story.', fields: [
    { id: 'topic', label: 'Poll on', values: ['the new bridge', 'the new library', 'the new market', 'the new school'] },
    { id: 'yes', label: 'For', range: [45, 60, 5], fmt: '{n}%' },
    { id: 'no', label: 'Against', range: [20, 35, 5], fmt: '{n}%' },
    { id: 'unsure', label: 'Not sure', calc: '100 - yes - no', fmt: '{n}%' },
  ], docs: [{ kind: 'card', title: 'Survey results', fields: ['topic', 'yes', 'no', 'unsure'] }, { kind: 'letter', title: 'Story', fields: ['topic', 'yes', 'no', 'unsure'] }], target: 1, pWrong: 0.7, wrongable: ['yes', 'no', 'unsure'] },
  { id: 'nt4_spending', rank: 4, arch: 'check', say: 'The council has published its spending plan. Please check my story against it.', fields: [
    { id: 'hosp', label: 'Hospital', range: [4, 6], fmt: '{n} million' },
    { id: 'edu', label: 'Education', range: [3, 5], fmt: '{n} million' },
    { id: 'roads', label: 'Roads', range: [1, 3], fmt: '{n} million' },
    { id: 'total', label: 'Total', calc: 'hosp + edu + roads', fmt: '{n} million' },
  ], docs: [{ kind: 'card', title: 'Spending plan', fields: ['hosp', 'edu', 'roads', 'total'] }, { kind: 'letter', title: 'Story', fields: ['hosp', 'edu', 'roads', 'total'] }], target: 1, pWrong: 0.7 },
  { id: 'nt4_inquiry', rank: 4, arch: 'check', say: 'Please check my draft against the council\'s statement.', fields: [
    { id: 'what', label: 'Inquiry into', values: ['the sale of the harbour land', 'the cost of the new school', 'the closure of the clinic', 'the fire at the warehouse'] },
    { id: 'begin', label: 'Begins', values: ['March 3', 'April 7', 'May 12', 'June 2'] },
    { id: 'report', label: 'Report due', values: ['June', 'September', 'December'] },
  ], docs: [{ kind: 'note', title: 'Council statement', fields: ['what', 'begin', 'report'] }, { kind: 'letter', title: 'Draft', fields: ['what', 'begin', 'report'] }], target: 1, pWrong: 0.7 },
  { id: 'nt4_dates', rank: 4, arch: 'check', say: 'Please check the dates in my list of dates.', fields: [
    { id: 'start', label: 'Strike began', values: ['March 4', 'March 6', 'April 2'] },
    { id: 'talks', label: 'Talks failed', values: ['after one week', 'after two weeks', 'after three weeks'] },
    { id: 'end', label: 'Strike lasted', range: [4, 9], fmt: '{n} weeks' },
  ], docs: [{ kind: 'note', title: 'Strike diary', fields: ['start', 'talks', 'end'] }, { kind: 'letter', title: 'List of dates', fields: ['start', 'talks', 'end'] }], target: 1, pWrong: 0.7 },
  { id: 'nt4_court', rank: 4, arch: 'check', say: 'Please check the summary of the trial in my story.', fields: [
    { id: 'witness', label: 'Witnesses heard', range: [8, 20] },
    { id: 'days', label: 'Days in court', range: [12, 40] },
    { id: 'verdict', label: 'Verdict expected', values: ['Monday', 'Wednesday', 'Friday'] },
  ], docs: [{ kind: 'note', title: 'Court notes', fields: ['witness', 'days', 'verdict'] }, { kind: 'letter', title: 'Story', fields: ['witness', 'days', 'verdict'] }], target: 1, pWrong: 0.7 },
  { id: 'nt4_quote', rank: 4, arch: 'check', say: 'Please check that I have not changed her words.', fields: [
    { id: 'who', label: 'Said by', values: ['{Mayor Hart|@}', '{Ms. Brooks|@}', '{Judge Lane|@}', '{Mr. Dale|@}'] },
    { id: 'verb', label: 'Promise', values: ['sign the contract', 'review the plan', 'repair the road', 'publish the report'] },
    { id: 'when', label: 'By', values: ['Monday', 'the end of the week', 'the end of the month', 'the end of the year'] },
  ], docs: [{ kind: 'note', title: 'Recording notes', lines: ['{who} said: "I will {verb} by {when}."'] }, { kind: 'card', title: 'Quotation in the draft', fields: ['who', 'verb', 'when'] }], target: 1, pWrong: 0.7 },
  { id: 'nt4_pad', rank: 4, arch: 'respond', mode: 'form', kind: 'phone', features: ['audioOnly'], say: 'A call from outside. Please write down what is said.',
    lines: ['Good morning. This is {who}.', 'The {what} will be announced at {time} in {where}.', 'Please send a reporter and a photographer.'],
    fields: [
      { id: 'who', label: 'Caller', values: ['{Ms. Reyes|@}', '{Ms. Hart|@}', '{Mr. Okoye|@}', '{Mr. Brook|@}'] },
      { id: 'what', label: 'Announcement', values: ['new budget', 'inquiry report', 'election date', 'prize winner'] },
      { id: 'time', label: 'At', values: ['nine', 'noon', 'two', 'five'] },
      { id: 'where', label: 'In', values: ['the main hall', 'the Town Hall', 'the library', 'the museum'] },
    ] },
  { id: 'nt4_plan', rank: 4, arch: 'respond', mode: 'slot', kind: 'memo', say: 'Look at the plan, please. Where does the story go?', layout: 'calendar', rows: PAGES5, cols: SPOTS3,
    want: [
      { tag: 'top', text: 'The story has a long headline and a graph, so it needs the top of a page.' }, { tag: 'mid', text: 'The story has a large photograph, so it needs the middle of a page.' }, { tag: 'low', text: 'The story is short, so it can go at the bottom of a page.' },
      { tag: 'p3', text: 'It must go on Page 3.' }, { tag: 'p4', text: 'It must go on Page 4.' }, { tag: 'p5', text: 'It must go on Page 5.' },
    ],
    avoid: [{ tag: 'p1', text: 'The front page is full.' }, { tag: 'p2', text: 'Page 2 is where the letters are.' }, { tag: 'p3', text: 'Page 3 is the opinion page, so it is out.' }, { tag: 'p4', text: 'Page 4 is where the advertisements are, so it is out as well.' }, { tag: 'p5', text: 'Page 5 is for sport.' }],
    busy: ['Trial', 'Advertisement', 'Letters', 'Sport', 'Obituaries', 'World'], open: ['Dear all,'], close: ['Thank you.'] },
  { id: 'nt4_say', rank: 4, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'news4' },
  { id: 'nt4_phone', rank: 4, arch: 'respond', mode: 'choose', kind: 'phone', bank: 'phone4', features: ['audioOnly'] },
  { id: 'nt4_mail', rank: 4, arch: 'respond', mode: 'choose', kind: 'email', bank: 'mail4' },
  { id: 'nt4_letter', rank: 4, arch: 'respond', mode: 'choose', kind: 'letter', bank: 'letter4' },
  { id: 'nt4_gap', rank: 4, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'gap4' },
  { id: 'nt4_proof', rank: 4, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'proof4' },
];

// ---------------------------------------------------------------------------------------------- rank 5 (英検1級, TOEIC 〜990)
// The lighthouse: Mr. Dale's lawsuit against the paper, the verdict in the fish-market fraud trial and its appeal, the
// recount, the collapse of the dock company, the hundredth birthday of the Courier. Every figure, condition and clause
// must be read exactly; the lawyers read what we print.

const R5A: AuthoredTask[] = [
  check('n5_lawsuit', 5, 1, 'p_carver', 'The lawyers have sent us a letter. Please check my summary against it.', [
    note('The letter', ['{Mr. Dale|@} is suing the paper because of the story of March 3. He says that the story falsely said that he took money.', 'He asks for an apology on the front page and 50,000 coins.']),
    paper('letter', 'Summary', [['who', 'Plaintiff', '{Mr. Dale|@}'], ['story', 'Story of', 'March 3'], ['apology', 'Apology asked on', 'the front page'], ['sum', 'Money asked', '15,000 coins']]),
  ], 'sum', { fix: ['50,000 coins', ['15,000 coins', '50,000 coins', '500,000 coins']] }),
  msg('n5_verdict', 5, 2, 'p_carver', 'email', { from: '{Ms. Idris|@}', subject: 'Verdict' }, ['Dear {Ms. Carver|@},', 'The jury has found {Mr. Pike|@} guilty of fraud, but not guilty of the second charge.', 'The judge will decide his sentence on Thursday, and his lawyers say that they will appeal.', 'Regards,', '{Ms. Idris|@}'],
    'He was found guilty of fraud but not of the second charge, and he will be sentenced on Thursday.', ['He was found guilty of both charges, and he will be sentenced on Thursday.', 'He was found guilty of the second charge but not of fraud, and he will be sentenced on Thursday.'], { say: 'What was the verdict?' }),
  sort('n5_sort1', 5, 3, 'p_carver', 'The verdict has changed the whole front. Please sort these carefully.', ['crime', 'business', 'politics', 'opinion'], [
    ['Jury finds the fish market owner guilty of fraud', 'crime'], ['The dock company can not pay the bank', 'business'], ['The mayor keeps her job after a recount', 'politics'], ['A verdict that the whole town should think about', 'opinion'],
  ]),
  msg('n5_apology', 5, 4, 'p_carver', 'letter', { from: '{Mr. Dale|@}' }, ['Dear {Ms. Carver|@},', 'I will stop my lawsuit provided that the paper prints a full apology on the front page on Saturday and pays my costs.', 'I will not accept an apology on an inside page.', 'Yours,', '{Mr. Dale|@}'],
    'He will stop the lawsuit only if the apology is on the front page and the costs are paid.', ['He will stop the lawsuit even if the apology is on an inside page.', 'He will stop the lawsuit only if the apology is on the front page, whether or not the costs are paid.'], { say: 'What does {Mr. Dale|@} ask for?' }),
  check('n5_recount', 5, 5, 'p_idris', 'The recount is over. Please check my numbers against the notice.', [
    paper('card', 'Official notice', [['hart', '{Mayor Hart|@}', '6,120'], ['brooks', '{Ms. Brooks|@}', '6,098'], ['margin', 'Majority', '22'], ['spoiled', 'Spoiled ballots', '143']]),
    paper('letter', 'Draft', [['hart', '{Mayor Hart|@}', '6,120'], ['brooks', '{Ms. Brooks|@}', '6,098'], ['margin', 'Majority', '28'], ['spoiled', 'Spoiled ballots', '143']]),
  ], 'margin', { fix: ['22', ['12', '22', '28']] }),
  pad('n5_phone1', 5, 6, 'p_carver', ['This is {Ms. Idris|@} at the court. The judge has sentenced {Mr. Pike|@} to four years in prison, with two years suspended.', 'His lawyers will make an appeal within fourteen days.', 'Please hold the front page until I send the full report.'], [
    ['who', 'Caller', '{Ms. Idris|@}', ['{Ms. Tan|@}', '{Ms. Reyes|@}']],
    ['prison', 'Sentence', 'four years, two suspended', ['four years, none suspended', 'two years, four suspended']],
    ['appeal', 'Appeal within', 'fourteen days', ['four days', 'forty days']],
    ['hold', 'Hold', 'the front page', ['Page 2', 'the back page']],
  ], { features: ['audioOnly'], say: 'The court is on the line. Please take down every detail.' }),
  msg('n5_headline1', 5, 7, 'p_abbott', 'memo', { say: 'Which headline is accurate, and does not overstate the case?' }, ['The jury found {Mr. Pike|@} guilty of selling old fish as fresh.', 'He was sentenced to four years in prison, two of them suspended.', 'His lawyers say that he will appeal.'],
    'Fish market owner jailed for fraud; lawyers say he will appeal', ['Fish market owner jailed for four years without appeal', 'Fish market owner cleared of fraud after appeal']),
  slot('n5_plan1', 5, 8, 'p_carver', 'memo', ['Dear all,', 'The verdict story must lead the front page, at the top.', 'The photograph of the court will go in the middle, so the recount story can only take the bottom.', 'Page 2 carries the apology notice, and Page 3 is the editorial page.'], PAGES5, SPOTS3, ['low'], ['p2', 'p3'], 'p1-low', ['Verdict', 'Photograph', 'Apology', 'Editorial', 'Advertisement'],
    { say: 'Look at the plan, please. Where does the recount story go?', extraBusy: ['p4-low', 'p5-low', 'p1-top'] }),
  check('n5_ok1', 5, 9, 'p_idris', 'This is the box for the lawsuit story. Does it agree with the lawyers\' letter?', [
    paper('note', 'Lawyers\' letter', [['who', 'Plaintiff', '{Mr. Dale|@}'], ['court', 'Court', 'the county court'], ['hearing', 'First hearing', 'June 9']]),
    paper('card', 'Fact box', [['who', 'Plaintiff', '{Mr. Dale|@}'], ['court', 'Court', 'the county court'], ['hearing', 'First hearing', 'June 9']]),
  ], null),
  msg('n5_contradict1', 5, 10, 'p_abbott', 'memo', { say: 'One sentence of this draft overstates what the notes say. Which one?' }, [
    'Notes: A man was arrested on Tuesday in connection with the fire. Police said that they had questioned him for six hours. He has not been charged.',
    'Draft: (1) A man was arrested on Tuesday in connection with the fire. (2) Police questioned him for six hours. (3) He is expected to be charged with starting the fire.',
  ], '(3) He is expected to be charged with starting the fire.', ['(1) A man was arrested on Tuesday in connection with the fire.', '(2) Police questioned him for six hours.']),
  msg('n5_reader1', 5, 11, 'c_scholar', 'letter', { from: '{Professor Hale|@}' }, ['Dear Editor,', 'Were the paper to print everything that the two sides say about the lawsuit, it would not serve its readers well.', 'I ask you to report what the court decides, and not what the lawyers say outside it.', 'Yours,', '{Professor Hale|@}'],
    'He wants the paper to report the court\'s decisions, not the lawyers\' claims.', ['He wants the paper to report the lawyers\' claims, not the court\'s decisions.', 'He wants the paper to stop writing about the lawsuit.']),
  sort('n5_sort2', 5, 12, 'p_carver', 'More stories. Please sort them well.', ['business', 'politics', 'world', 'science'], [
    ['Fears of a recession grow', 'business'], ['The party will vote on the budget', 'politics'], ['Two countries fight about the price of fish', 'world'], ['A study shows that fish are smaller', 'science'],
  ]),
  check('n5_bankruptcy', 5, 13, 'p_tan', 'The dock company has gone bankrupt. Please check the numbers in my story against the official report.', [
    paper('card', 'Official report', [['debt', 'Debts', '8.4 million'], ['assets', 'Money in the bank', '3.1 million'], ['staff', 'Workers', '210'], ['paid', 'Creditors expected to receive', '37%']]),
    paper('letter', 'Story', [['debt', 'Debts', '8.4 million'], ['assets', 'Money in the bank', '3.1 million'], ['staff', 'Workers', '210'], ['paid', 'Creditors expected to receive', '73%']]),
  ], 'paid', { fix: ['37%', ['27%', '37%', '73%']] }),
  msg('n5_source', 5, 14, 'p_carver', 'email', { from: '{Mr. Brook|@}', subject: 'Papers for you' }, ['Dear {Ms. Idris|@},', 'I will give you the documents on one condition: you must never say who I am, even if a court orders you to.', 'If you can not promise this, I will take them to another newspaper.', 'Yours,', '{Mr. Brook|@}'],
    'He will give us the documents only if we promise never to say who he is.', ['He will give us the documents if a court orders us to say who he is.', 'He will give us the documents even if we can not promise to keep his name secret.'], { say: 'What condition does he set?' }),
  check('n5_quote', 5, 15, 'p_idris', 'The minister says that I got her words wrong. Please check my draft against the transcript.', [
    note('Transcript', ['Minister: "We would never rule out higher taxes, but I do not expect them to rise this year."']),
    paper('card', 'Quotation in the draft', [['rule', 'We would never rule out', 'higher taxes'], ['expect', 'But I do', 'not expect them to rise this year']]),
  ], null),
  msg('n5_gap1', 5, 16, 'p_abbott', 'memo', { say: 'Which words complete the sentence correctly?' }, ['Hardly ___ the verdict been read when the crowd began to shout.'],
    'had', ['has', 'was']),
  msg('n5_headline2', 5, 17, 'p_abbott', 'memo', { say: 'Which headline is right for the science page, without claiming too much?' }, ['A university study found 30% fewer bees on fields where a pesticide is used.', 'The study shows a link, but it does not prove a cause.', 'The scientists want a larger study.'],
    'Fewer bees where the pesticide is used, study shows a link', ['The pesticide is the cause of 30% fewer bees, study shows', 'Study finds that the pesticide does nothing to bees']),
  pad('n5_phone2', 5, 18, 'p_carver', ['Good evening. This is {Mr. Abbott|@} at the printer.', 'There has been a collision on Harbour Bridge. Three people are in hospital, and the bridge is closed to traffic until further notice.', 'We can hold the presses until ten.'], [
    ['who', 'Caller', '{Mr. Abbott|@}', ['{Mr. Moss|@}', '{Mr. Brook|@}']],
    ['where', 'Collision on', 'Harbour Bridge', ['Station Road', 'the harbour ferry']],
    ['hosp', 'In hospital', 'three people', ['two people', 'thirteen people']],
    ['hold', 'Presses held until', 'ten', ['eight', 'eleven']],
  ], { features: ['audioOnly'], say: 'It is the printer on the line. Please write down what he says.' }),
  msg('n5_complaint', 5, 19, 'p_carver', 'email', { from: '{Ms. Hart|@}', subject: 'My complaint' }, ['Dear {Ms. Carver|@},', 'I have asked the press regulator to look at your report of Monday.', 'You should have asked the council for comment before publishing.', 'Regards,', '{Ms. Hart|@}'],
    'She says that we should have asked the council for comment before we published.', ['She says that we should have asked the regulator for comment before we published.', 'She says that we asked the council for comment after we published.'], { say: 'What does she say that we did wrong?' }),
  check('n5_age', 5, 20, 'p_idris', 'This is the obituary of a former councillor. Please check the years in my draft against his family\'s letter.', [
    paper('note', 'Family letter', [['age', 'Age', '86'], ['served', 'On the council from', '1974 to 1996'], ['died', 'Died', 'May 2']]),
    paper('letter', 'Draft', [['age', 'Age', '86'], ['served', 'On the council from', '1974 to 1986'], ['died', 'Died', 'May 2']]),
  ], 'served', { fix: ['1974 to 1996', ['1974 to 1986', '1974 to 1996', '1947 to 1996']] }),
  msg('n5_contradict2', 5, 21, 'p_abbott', 'memo', { say: 'Which sentence cannot be supported by the notes?' }, [
    'Notes: The families arrived by boat on Sunday night. Volunteers gave them food and blankets. The council has not yet decided where they will stay.',
    'Draft: (1) The families arrived by boat on Sunday night. (2) Volunteers gave them food and blankets. (3) The council has found rooms for them at the old inn.',
  ], '(3) The council has found rooms for them at the old inn.', ['(1) The families arrived by boat on Sunday night.', '(2) Volunteers gave them food and blankets.']),
  sort('n5_sort3', 5, 22, 'p_carver', 'The Courier celebrates its hundredth birthday this week! Please sort these with care.', ['features', 'obits', 'editorial', 'corrections'], [
    ['A century of the Courier, told in headlines', 'features'], ['{Mr. Bell|@}, who sold the paper in the harbour for sixty years, dies at ninety-one', 'obits'], ['Why a town needs its own paper', 'editorial'], ['The story of March 3 said the wrong day for the hearing; the right day is June 9', 'corrections'],
  ]),
  msg('n5_say1', 5, 23, 'c_merchant', 'speech', { say: 'Should you print my advertisement tomorrow, I would be obliged. It is for the reopening of my shop on Saturday.' }, ['Should you print my advertisement tomorrow, I would be obliged. It is for the reopening of my shop on Saturday.'],
    'Certainly. We shall print your advertisement tomorrow, for the reopening on Saturday.', ['Certainly. We shall print your advertisement on Saturday, for the reopening tomorrow.', 'Certainly. We shall not print your advertisement tomorrow, for the reopening on Saturday.']),
];

const R5B: AuthoredTask[] = [
  check('n5_pension', 5, 24, 'p_tan', 'Please check my story against the accounts of the pension fund.', [
    paper('card', 'Accounts', [['start', 'Money at the start of the year', '40 million'], ['gain', 'Change in the year', 'down 6%'], ['end', 'Money at the end of the year', '37.6 million']]),
    paper('letter', 'Story', [['start', 'Money at the start of the year', '40 million'], ['gain', 'Change in the year', 'up 6%'], ['end', 'Money at the end of the year', '37.6 million']]),
  ], 'gain', { fix: ['down 6%', ['down 6%', 'up 6%', 'down 16%']] }),
  msg('n5_reader2', 5, 25, 'p_carver', 'letter', { from: '{Grandma Rose|@}' }, ['Dear Editor,', 'I have no wish to dispute your report on the new bridge, but you have given the impression that the opposition was unreasonable.', 'In fact, it was the council that refused to publish the costs.', 'Yours,', '{Grandma Rose|@}'],
    'She says that the council, not the opposition, was unreasonable.', ['She says that the opposition, not the council, was unreasonable.', 'She says that your report was accurate about the costs.']),
  msg('n5_headline3', 5, 26, 'p_abbott', 'memo', { say: 'Which headline is faithful to the notes?' }, ['The council said that it would not appeal against the ruling.', 'It will, however, ask the minister to change the law.', 'The opposition called the decision "a retreat".'],
    'Council will not appeal against ruling but will ask minister to change law', ['Council will appeal against ruling and ask minister to change law', 'Council will not appeal against ruling and will not ask minister to change law']),
  check('n5_caption', 5, 27, 'p_moss', 'The flood photographs came in late. Please check the caption against my notes.', [
    paper('note', 'Photo notes', [['what', 'What', 'families leaving the flooded houses'], ['when', 'When', 'Tuesday at dawn'], ['how', 'How', 'by rescue boat']]),
    paper('label', 'Caption', [['what', 'What', 'families leaving the flooded houses'], ['when', 'When', 'Tuesday at dawn'], ['how', 'How', 'by bus']]),
  ], 'how', { fix: ['by rescue boat', ['by bus', 'by rescue boat', 'on foot']] }),
  msg('n5_gap2', 5, 28, 'p_abbott', 'memo', { say: 'Which phrase completes the sentence correctly?' }, ['Had the council published the figures earlier, the dispute ___ avoided.'],
    'could have been', ['could be', 'could have']),
  pad('n5_phone3', 5, 29, 'p_carver', ['Good morning. This is {Ms. Reyes|@} from the hospital.', 'The director will resign on Friday, and there will be a statement at noon.', 'Please do not print anything before twelve.'], [
    ['who', 'Caller', '{Ms. Reyes|@}', ['{Ms. Hart|@}', '{Ms. Tan|@}']],
    ['what', 'The director will', 'resign', ['retire', 'leave town']],
    ['day', 'On', 'Friday', ['Monday', 'Thursday']],
    ['hold', 'Do not print before', 'twelve', ['ten', 'two']],
  ], { features: ['audioOnly'], say: 'The hospital is calling. Please write down exactly what is said.' }),
  slot('n5_plan2', 5, 30, 'p_carver', 'memo', ['Dear all,', 'The anniversary story must start at the top of Page 4.', 'Page 5 is its facing page and has the photographs. Please keep Pages 1, 2 and 3 for the news.', 'Page 4 has room only at the top and in the middle, and the middle is taken by the timeline.'], PAGES5, SPOTS3, ['top'], ['p1', 'p2', 'p3', 'p5'], 'p4-top', ['Photographs', 'Dates', 'News', 'Advertisement', 'Letters'],
    { say: 'Look at the plan, please. Where does the anniversary story go?', extraBusy: ['p4-mid', 'p2-top', 'p3-top', 'p1-top'] }),
  msg('n5_say2', 5, 31, 'c_boy', 'speech', { say: 'If I had finished my story on time, would you have printed it on Friday, as you promised?' }, ['If I had finished my story on time, would you have printed it on Friday, as you promised?'],
    'Yes. We would have printed your story on Friday if you had finished it on time.', ['Yes. We would have printed your story on Monday if you had finished it on time.', 'Yes. We would print your story on Friday if you finish it on time.']),
  check('n5_deficit', 5, 32, 'p_tan', 'Please check the deficit figures in my story against the treasurer\'s statement.', [
    paper('card', 'Treasurer\'s statement', [['spend', 'Spending', '12.4 million'], ['take', 'Income', '11.1 million'], ['gap', 'Deficit', '1.3 million']]),
    paper('letter', 'Story', [['spend', 'Spending', '12.4 million'], ['take', 'Income', '11.1 million'], ['gap', 'Deficit', '2.3 million']]),
  ], 'gap', { fix: ['1.3 million', ['0.3 million', '1.3 million', '2.3 million']] }),
  msg('n5_reader3', 5, 33, 'p_carver', 'email', { from: '{Ms. Hart|@}', subject: 'My reply' }, ['Dear Editor,', 'Your story on Saturday said that the housing office was slow. I send you a reply of 150 words.', 'Unless you print it in full, I will complain to the regulator.', 'Regards,', '{Ms. Hart|@}'],
    'She will complain to the regulator unless we print her 150-word reply in full.', ['She will complain to the regulator if we print her 150-word reply in full.', 'She will complain to the regulator unless we print a 15-word reply in full.'], { say: 'What does she want?' }),
  sort('n5_sort4', 5, 34, 'p_carver', 'These came in this morning. Please sort them.', ['world', 'environment', 'health', 'science'], [
    ['Two countries start peace talks', 'world'], ['Sea turtles are fewer every year', 'environment'], ['A new vaccine will be free for all children', 'health'], ['Scientists find a new planet', 'science'],
  ]),
  check('n5_ok2', 5, 35, 'p_abbott', 'Here is the correction as it will appear on Page 2. Does it agree with what the lawyers approved?', [
    paper('note', 'Approved text', [['what', 'Our story of March 3 said', 'that the sale was approved'], ['fact', 'In fact', 'it was postponed'], ['sorry', 'We apologize to', '{Mr. Dale|@}']]),
    paper('card', 'Correction', [['what', 'Our story of March 3 said', 'that the sale was approved'], ['fact', 'In fact', 'it was postponed'], ['sorry', 'We apologize to', '{Mr. Dale|@}']]),
  ], null),
  msg('n5_review', 5, 36, 'p_carver', 'letter', { from: '{Mr. Grant|@}' }, ['Dear Editor,', 'It would be a mistake to suppose that readers want only bad news. Never have I heard so many people say that they enjoy the paper as in this anniversary year.', 'May the Courier flourish for another hundred.', 'Yours,', '{Mr. Grant|@}'],
    'He says that readers like the paper, and he hopes that it will continue.', ['He says that readers want only bad news, and he hopes that it will continue.', 'He says that readers do not like the paper, and he hopes that it will change.']),
  msg('n5_contradict3', 5, 37, 'p_abbott', 'memo', { say: 'Which sentence says more than the notes allow?' }, [
    'Notes: The company says that profits fell by 12% because of the price of fuel. The workers say that they get less money, too. Neither side has any evidence.',
    'Draft: (1) The company says that profits fell by 12% because of the price of fuel. (2) The workers say that they get less money, too. (3) It is clear that the company has cut pay to protect its profits.',
  ], '(3) It is clear that the company has cut pay to protect its profits.', ['(1) The company says that profits fell by 12% because of the price of fuel.', '(2) The workers say that they get less money, too.']),
  check('n5_poll', 5, 38, 'p_idris', 'The referendum poll is out. Please check how I have described the result.', [
    paper('card', 'Poll', [['yes', 'For the new bridge', '49%'], ['no', 'Against', '46%'], ['margin', 'Margin of error', '4 points'], ['sample', 'People asked', '1,100']]),
    paper('letter', 'Draft', [['yes', 'For the new bridge', '49%'], ['no', 'Against', '46%'], ['margin', 'Margin of error', '4 points'], ['sample', 'People asked', '11,000']]),
  ], 'sample', { fix: ['1,100', ['110', '1,100', '11,000']] }),
  msg('n5_gap3', 5, 39, 'p_abbott', 'memo', { say: 'Which word completes the sentence correctly?' }, ['The inquiry found that the council ___ have acted more quickly.'],
    'should', ['would', 'could be']),
  msg('n5_say3', 5, 40, 'c_scholar', 'phone', { say: 'I am calling to say that the paper has been getting my words wrong. I did not say "scandal". I said "mistake".' }, ['I am calling to say that the paper has been getting my words wrong. I did not say "scandal". I said "mistake".'],
    'I apologize for that. I will ask the editor to check whether you said "scandal" or "mistake".', ['I apologize for that. I will ask the editor to check whether you said "mistake" or "scandal".', 'I apologize for that. I am certain that you said "scandal".']),
  pad('n5_phone4', 5, 41, 'p_carver', ['Hello. This is {Ms. Tan|@}.', 'The company says that the merger will go ahead on March 1, if the regulator agrees.', 'Please prepare a business page with a picture of the new director.'], [
    ['who', 'Caller', '{Ms. Tan|@}', ['{Ms. Idris|@}', '{Ms. Hart|@}']],
    ['date', 'Merger on', 'March 1', ['March 11', 'May 1']],
    ['cond', 'If', 'the regulator agrees', ['the staff vote for it', 'the court agrees']],
    ['page', 'Prepare', 'a picture of the new director', ['a picture of the old director', 'a map of the new factory']],
  ], { features: ['audioOnly'], say: '{Ms. Tan|@} is on the phone. Please write down the message in full.' }),
  msg('n5_headline4', 5, 42, 'p_abbott', 'memo', { say: 'Which headline is accurate, with nothing added?' }, ['The government has announced that it will review the fishing quota next year.', 'It has not said whether the quota will be raised or cut.', 'The fishing trade has welcomed the review.'],
    'Government to review fishing quota next year; the fishing trade welcomes the move', ['Government to cut fishing quota next year; the fishing trade welcomes the move', 'Government to review fishing quota next year; the fishing trade rejects the move']),
  check('n5_tax', 5, 43, 'p_tan', 'The government has changed the tariff. Please check my story against the official notice.', [
    paper('card', 'Official notice', [['goods', 'On', 'fish from other countries'], ['rate', 'New tariff', '12%'], ['old', 'Old tariff', '8%'], ['from', 'Starts', 'July 1']]),
    paper('letter', 'Story', [['goods', 'On', 'fish from other countries'], ['rate', 'New tariff', '12%'], ['old', 'Old tariff', '18%'], ['from', 'Starts', 'July 1']]),
  ], 'old', { fix: ['8%', ['8%', '12%', '18%']] }),
  sort('n5_sort5', 5, 44, 'p_carver', 'The last tray before the presses. Every one of these must be right.', ['crime', 'politics', 'opinion', 'corrections'], [
    ['The court says that the paper must pay damages for libel', 'crime'], ['The law changes by a single vote', 'politics'], ['Why the council must say what it did', 'opinion'], ['An earlier version of this story gave the wrong name', 'corrections'],
  ]),
  msg('n5_anniversary', 5, 45, 'p_carver', 'letter', { from: '{Professor Hale|@}' }, ['Dear {Ms. Carver|@},', 'On this anniversary of the Courier, I should like to congratulate you on a century of careful reporting.', 'May you never stop holding the powerful to account, however hard that may be.', 'Yours,', '{Professor Hale|@}'],
    'He congratulates the paper and hopes that it will go on holding the powerful to account.', ['He is angry with the paper and hopes that it will stop holding the powerful to account.', 'He congratulates the paper on fifty years of careful reporting.']),
];
const R5 = [...R5A, ...R5B];

// ---------------------------------------------------------------------------------------------- rank 5 templates and banks

const QA_SAY5 = bank(5, [
  ['Should you print my advertisement tomorrow, I would be obliged. It is for the reopening of my shop on Saturday.', 'Certainly. We shall print your advertisement tomorrow, for the reopening on Saturday.', 'ad', ['Certainly. We shall print your advertisement on Saturday, for the reopening tomorrow.', 'Certainly. We shall not print your advertisement tomorrow, for the reopening on Saturday.']],
  ['If I had known that the story would run on Monday, I would have warned my staff.', 'I am sorry that you were not told. We should have informed you that the story would run on Monday.', 'regret', ['I am sorry that you were told. We should have informed you that the story would run on Friday.', 'I am glad that you were not told. We should have informed you that the story would run on Monday.']],
  ['I should like to know whether the paper intends to name the officer who gave the order.', 'At present we do not intend to name the officer, but we shall review the decision when the inquiry reports.', 'ethics', ['At present we intend to name the officer, but we shall review the decision when the inquiry reports.', 'At present we do not intend to name the inquiry, but we shall review the decision when the officer reports.']],
  ['Your report suggests that the company bribed an official. On what evidence did you base that statement?', 'We based it on two sources and on documents that we have shown to our lawyers.', 'evidence', ['We based it on a story that we have not shown to our lawyers.', 'We based it on two sources and on documents that our lawyers have not seen.']],
  ['Could you confirm that the apology will appear on the front page and not on an inside page?', 'I can confirm that the apology will appear on the front page, as agreed.', 'confirm', ['I can confirm that the apology will appear on an inside page, as agreed.', 'I can confirm that the apology will appear on the back page, as agreed.']],
  ['Not until the court has ruled will we know whether the paper acted lawfully.', 'That is so. We shall wait for the ruling before we comment on whether the paper acted lawfully.', 'wait', ['That is so. We shall comment before the ruling on whether the paper acted lawfully.', 'That is so. We shall wait for the police before we comment on whether the paper acted lawfully.']],
  ['I would rather that you did not publish my name, even though I am willing to speak to your reporter.', 'Understood. Our reporter will speak to you, but we shall not publish your name.', 'anonymity', ['Understood. Our reporter will speak to you, and we shall publish your name.', 'Understood. Our reporter will not speak to you, but we shall not publish your name.']],
  ['The report claims that the council spent 3 million coins on the project. It was 2 million.', 'Thank you. We shall check the figure of 3 million coins against the council\'s accounts.', 'figure', ['Thank you. We shall check the figure of 2 million coins against the council\'s accounts.', 'Thank you. We are sure that the figure of 3 million coins is wrong.']],
]);

const QA_PHONE5 = bank(5, [
  ['Good evening. I represent the plaintiff in the case. We would be grateful if you could hold the story until the court has ruled on our request.', 'I understand. I shall pass your request to the editor and our lawyers before the story goes to press.', 'legal', ['I understand. I shall pass your request to the court and our lawyers before the story goes to press.', 'I understand. I shall publish the story before your request reaches the editor and our lawyers.']],
  ['This is the returning officer. The result of the recount will be announced at midnight, and not at eleven, as planned.', 'Thank you. We shall hold the front page until the result of the recount is announced at midnight.', 'delay', ['Thank you. We shall hold the front page until the result of the recount is announced at eleven.', 'Thank you. We shall print the front page before the result of the recount is announced at midnight.']],
  ['I have documents that show that the contract was awarded without a tender. I would prefer to remain anonymous.', 'Thank you for contacting us. We shall treat the documents about the contract in confidence and shall not name you.', 'source', ['Thank you for contacting us. We shall treat the documents about the contract in confidence and shall name you.', 'Thank you for contacting us. We shall publish the documents about the contract and shall not name you.']],
  ['We have been informed that the minister will resign. Can you confirm that before we go to press?', 'We can not confirm it yet. We shall call the minister\'s office and let you know before we go to press.', 'confirm', ['We can confirm it. We shall call the minister\'s office and let you know after we go to press.', 'We can not confirm it yet. We shall call the minister\'s office and let you know after we go to press.']],
  ['I am the harbour master. Owing to the collision, the bridge will remain closed until at least Thursday.', 'Thank you. We shall report that the bridge will remain closed until at least Thursday.', 'bridge', ['Thank you. We shall report that the bridge will remain open until at least Thursday.', 'Thank you. We shall report that the bridge will remain closed until at least Saturday.']],
  ['Were the paper to print the photograph, my client would take legal action.', 'I understand your client\'s position. I shall ask the editor to look at the photograph with our lawyers before we print it.', 'threat', ['I understand your client\'s position. I shall ask the editor to print the photograph without our lawyers.', 'I understand your client\'s position. I shall ask the lawyers to look at the photograph after we print it.']],
  ['I am calling about the obituary of my grandfather. You wrote that he served on the council for 22 years. It was 32.', 'I am very sorry for the error. We shall correct the obituary to say that he served on the council for 32 years.', 'obituary', ['I am very sorry for the error. We shall correct the obituary to say that he served on the council for 22 years.', 'I am very sorry for the error. We shall correct the obituary to say that he served on the court for 32 years.']],
  ['Hello. I am a producer at the radio station. We should like to interview your editor about the lawsuit.', 'Thank you for asking. The editor is unable to comment on the lawsuit while it is before the court.', 'media', ['Thank you for asking. The editor will comment on the lawsuit as soon as it is before the court.', 'Thank you for asking. The producer is unable to comment on the lawsuit while it is before the court.']],
]);

const QA_MAIL5 = bank(5, [
  ['Dear Editor, we write on behalf of our client, {Mr. Dale|@}, to demand the withdrawal of the article of March 3 and an apology.', 'Thank you for your letter. We have passed your demand for the withdrawal of the article of March 3 to our lawyers.', 'legal', ['Thank you for your letter. We have passed your demand for the withdrawal of the article of March 13 to our lawyers.', 'Thank you for your letter. We have withdrawn the article of March 3 and passed your apology to our lawyers.']],
  ['Dear {Ms. Carver|@}, notwithstanding our disagreement, the minister is willing to be interviewed on condition that the questions are submitted in advance.', 'Thank you. We shall consider whether we can accept the condition that the questions be submitted in advance.', 'condition', ['Thank you. We shall consider whether we can accept the condition that the answers be submitted in advance.', 'Thank you. We have accepted the condition that the questions be submitted after the interview.']],
  ['Dear Editor, the cutting of the school budget, which you reported as a saving, is in fact a loss of twelve teachers.', 'We take your point. We shall look at how we reported the cut in the school budget, and the loss of twelve teachers.', 'argue', ['We take your point. We shall look at how we reported the cut in the school budget, and the loss of two teachers.', 'We do not take your point. We shall look at how we reported the cut in the school budget, and the loss of twelve teachers.']],
  ['Dear Editor, I have no objection to your criticism of the plan, but I do object to the suggestion that I had a personal interest in it.', 'We shall review whether the suggestion of a personal interest was justified by the evidence that we had.', 'objection', ['We shall review whether the criticism of the plan was justified by the evidence that we had.', 'We shall review whether your objection to the criticism of the plan was justified by the interest that you had.']],
  ['Dear {Ms. Carver|@}, we are pleased to invite you to the opening of the new court building, which takes place on the first of June.', 'Thank you for the invitation. We shall send a reporter to the opening of the new court building on the first of June.', 'invite', ['Thank you for the invitation. We shall send a reporter to the opening of the new court building on the first of July.', 'Thank you for the invitation. We shall send a reporter to the opening of the old court building on the first of June.']],
  ['Dear Editor, may I suggest that you publish the full text of the judge\'s ruling, which is of great public interest?', 'Thank you for the suggestion. We shall consider publishing the full text of the judge\'s ruling on our website.', 'suggest', ['Thank you for the suggestion. We shall consider publishing the full text of the judge\'s ruling on a bus.', 'Thank you for the suggestion. We shall not consider publishing the full text of the judge\'s ruling.']],
  ['Dear Editor, it has come to my attention that your report on the dock strike names a minor. I ask you to remove the name immediately.', 'We shall remove the name of the minor from the report on the dock strike at once and review how it came to be published.', 'privacy', ['We shall remove the name of the minister from the report on the dock strike at once and review how it came to be published.', 'We shall keep the name of the minor in the report on the dock strike and review how it came to be published.']],
  ['Dear Editor, we regret to inform you that the grant for your reporting project has been withdrawn owing to budget cuts.', 'We are disappointed to learn that the grant for our reporting project has been withdrawn. May we ask whether it might be restored next year?', 'regret', ['We are delighted to learn that the grant for our reporting project has been withdrawn. May we ask whether it might be restored next year?', 'We are disappointed to learn that the grant for our reporting project has been approved. May we ask whether it might be withdrawn next year?']],
]);

const QA_LETTER5 = bank(5, [
  ['Dear Editor, so inflammatory was your headline that three of my neighbours stopped speaking to me. I demand that you publish a correction.', 'We regret the distress that the headline caused you. We shall consider publishing a correction, as you ask.', 'complaint', ['We do not regret the distress that the headline caused you. We shall consider publishing a correction, as you ask.', 'We regret the distress that the headline caused you. We shall consider publishing a headline, as you ask.']],
  ['Dear Editor, the paper has been a faithful friend to this town for a hundred years, and I hope that it will remain so for a hundred more.', 'Thank you for your kind words. We hope to remain a faithful friend to this town for another hundred years.', 'praise', ['Thank you for your kind words. We hope to remain a faithful friend to this town for another fifty years.', 'Thank you for your harsh words. We hope to remain a faithful friend to this town for another hundred years.']],
  ['Dear Editor, never in my life have I read so one-sided a report as yours on the harbour dispute. Where was the company\'s side of the story?', 'We take the criticism seriously. We shall look again at whether the company\'s side of the harbour dispute was fairly reported.', 'bias', ['We reject the criticism. We shall look again at whether the harbour\'s side of the company dispute was fairly reported.', 'We take the criticism seriously. We shall not look again at whether the company\'s side of the harbour dispute was fairly reported.']],
  ['Dear Editor, I am writing to correct a statement attributed to me. I said that the scheme would cost 4 million, not 14 million.', 'Thank you for the correction. We shall publish that you said that the scheme would cost 4 million, not 14 million.', 'correction', ['Thank you for the correction. We shall publish that you said that the scheme would cost 14 million, not 4 million.', 'Thank you for the correction. We shall publish that you said that the scheme would cost 4 million, not 40 million.']],
  ['Dear Editor, were it not for your reporter, the family of the missing fisherman would still know nothing. I wish to thank her.', 'Thank you. We shall pass on your thanks to the reporter who helped the family of the missing fisherman.', 'thanks', ['Thank you. We shall pass on your thanks to the fisherman who helped the family of the missing reporter.', 'Thank you. We shall pass on your thanks to the editor who helped the family of the missing fisherman.']],
  ['Dear Editor, I cancel my subscription with immediate effect. The decision to publish the photograph of the accident was, in my view, deeply insensitive.', 'We are sorry to lose you as a subscriber, and we regret that you found the photograph of the accident insensitive.', 'cancel', ['We are glad to lose you as a subscriber, and we regret that you found the photograph of the accident insensitive.', 'We are sorry to lose you as a subscriber, and we regret that you found the photograph of the wedding insensitive.']],
]);

const QA_GAP5 = bank(5, [
  ['No sooner had the verdict been announced ___ the crowd began to cheer.', 'than', 'inv', ['when', 'that']],
  ['Only after the recount ___ the result known.', 'was', 'inv', ['were', 'did']],
  ['Were the council to approve the plan, the opposition ___ resign.', 'would', 'subj', ['will', 'did']],
  ['The editor insisted that the story ___ checked by a lawyer.', 'be', 'subj', ['is', 'was']],
  ['Little ___ the reporter know that the documents were false.', 'did', 'inv', ['does', 'had']],
  ['___ the allegations were true, the paper would have a duty to publish.', 'Were', 'cond', ['Had', 'If it']],
  ['The company, ___ profits have fallen, will cut 200 jobs.', 'whose', 'rel', ['which', 'whom']],
  ['Not only ___ the defendant deny the charge, but he also attacked the witness.', 'did', 'inv', ['has', 'was']],
  ['The paper would not have printed the story ___ it had checked the facts.', 'unless', 'link', ['despite', 'because of']],
  ['Such ___ the pressure on the minister that she resigned.', 'was', 'inv', ['were', 'did']],
]);

const QA_PROOF5 = bank(5, [
  ['Notes: The company says that profits fell by 12%. The union says that wages fell, too. Neither has given evidence. Draft: (1) The company says that profits fell by 12%. (2) The union says that wages fell, too. (3) The company has cut wages to protect its profits.', '(3) The company has cut wages to protect its profits.', 'claim', ['(1) The company says that profits fell by 12%.', '(2) The union says that wages fell, too.']],
  ['Notes: The jury found the defendant guilty of fraud. It cleared him of the second charge. He will be sentenced on Thursday. Draft: (1) The jury found the defendant guilty of fraud. (2) It found him guilty of both charges. (3) He will be sentenced on Thursday.', '(2) It found him guilty of both charges.', 'verdict', ['(1) The jury found the defendant guilty of fraud.', '(3) He will be sentenced on Thursday.']],
  ['Notes: The minister said that taxes might rise next year. She did not say by how much. The opposition called her remarks vague. Draft: (1) The minister said that taxes might rise next year. (2) She said that they would rise by 2%. (3) The opposition called her remarks vague.', '(2) She said that they would rise by 2%.', 'quote', ['(1) The minister said that taxes might rise next year.', '(3) The opposition called her remarks vague.']],
  ['Notes: The study found a link between the pesticide and fewer bees. It did not prove a cause. The researchers want a larger study. Draft: (1) The study found a link between the pesticide and fewer bees. (2) It proved that the pesticide kills bees. (3) The researchers want a larger study.', '(2) It proved that the pesticide kills bees.', 'science', ['(1) The study found a link between the pesticide and fewer bees.', '(3) The researchers want a larger study.']],
  ['Notes: The hospital director resigned on Friday. The board accepted her resignation. No reason was given. Draft: (1) The hospital director resigned on Friday. (2) She resigned after the board criticized her. (3) The board accepted her resignation.', '(2) She resigned after the board criticized her.', 'cause', ['(1) The hospital director resigned on Friday.', '(3) The board accepted her resignation.']],
  ['Notes: The flood affected 400 homes. About 1,200 people were evacuated. Nobody was killed. Draft: (1) The flood affected 400 homes. (2) About 1,200 people were evacuated. (3) Two people were killed.', '(3) Two people were killed.', 'disaster', ['(1) The flood affected 400 homes.', '(2) About 1,200 people were evacuated.']],
]);

const B5: Record<string, QaItem[]> = { news5: QA_SAY5, phone5: QA_PHONE5, mail5: QA_MAIL5, letter5: QA_LETTER5, gap5: QA_GAP5, proof5: QA_PROOF5 };

const SEC5 = ['politics', 'crime', 'science', 'health', 'environment', 'business', 'arts', 'opinion', 'world', 'features', 'obits', 'corrections'];
const T5: TaskTemplate[] = [
  { id: 'nt5_sort', rank: 5, arch: 'sort', say: 'The desks have all filed at once. Please put each piece where it belongs, and read with care.', count: [4, 5], bins: SEC5,
    patterns: [
      { text: 'The incumbent mayor retains her seat after a recount', bins: ['politics'] }, { text: 'Austerity measures divide the ruling party', bins: ['politics'] }, { text: 'Constitutional amendment passes by a single vote', bins: ['politics'] }, { text: 'The opposition demands a referendum on the new bridge', bins: ['politics'] }, { text: 'The minister survives a vote of no confidence', bins: ['politics'] }, { text: 'The number of voters is the lowest in thirty years', bins: ['politics'] },
      { text: 'Jury convicts fish market owner of fraud', bins: ['crime'] }, { text: 'The defendant is released on bail pending appeal', bins: ['crime'] }, { text: 'Prosecutors drop the bribery charges', bins: ['crime'] }, { text: 'Plaintiff awarded compensation after the court finds the report false', bins: ['crime'] }, { text: 'The judge refuses to set a precedent', bins: ['crime'] }, { text: 'A warrant is issued for the arrest of the former treasurer', bins: ['crime'] },
      { text: 'The hypothesis that the moon was formed in a collision gains support', bins: ['science'] }, { text: 'A study finds a link between pesticides and the decline of bees', bins: ['science'] }, { text: 'Scientists find a correlation between sleep and memory', bins: ['science'] }, { text: 'A new algorithm predicts the path of storms', bins: ['science'] }, { text: 'The laboratory reports a breakthrough in battery design', bins: ['science'] }, { text: 'Astronomers find a planet where life may be possible', bins: ['science'] },
      { text: 'Immunity from the vaccine lasts longer than expected, a trial finds', bins: ['health'] }, { text: 'The pandemic leaves long waiting lists for surgery', bins: ['health'] }, { text: 'The hospital director resigns amid a dispute over waiting lists', bins: ['health'] }, { text: 'Nurses vote to accept the pay offer', bins: ['health'] }, { text: 'The clinic reports a rise in cases of the flu', bins: ['health'] }, { text: 'Doctors urge caution over a new treatment', bins: ['health'] },
      { text: 'Habitat loss pushes the sea turtle towards extinction', bins: ['environment'] }, { text: 'Chemicals from the fields threaten the oyster beds', bins: ['environment'] }, { text: 'The wetlands will be protected for future generations', bins: ['environment'] }, { text: 'Drought leaves the reservoir at a record low', bins: ['environment'] }, { text: 'The council approves the wind farm despite objections', bins: ['environment'] }, { text: 'Rising seas threaten the old harbour wall', bins: ['environment'] },
      { text: 'Recession fears grow as the factory orders fall', bins: ['business'] }, { text: 'Dock company\'s creditors demand repayment', bins: ['business'] }, { text: 'The merger will create the largest bank on the coast', bins: ['business'] }, { text: 'The dividend is cut for the first time in a decade', bins: ['business'] }, { text: 'A tariff on imported fish worries the market traders', bins: ['business'] }, { text: 'The pension fund loses six percent in a volatile year', bins: ['business'] },
      { text: 'A retrospective of the harbour painter opens to acclaim', bins: ['arts'] }, { text: 'The novelist wins a major prize for her portrait of the coast', bins: ['arts'] }, { text: 'The orchestra\'s new conductor makes a striking debut', bins: ['arts'] }, { text: 'Critics divided over the museum\'s controversial extension', bins: ['arts'] }, { text: 'The festival\'s opening film is a triumph of restraint', bins: ['arts'] }, { text: 'An auction of rare maps raises a record sum', bins: ['arts'] },
      { text: 'A verdict that the whole town should reflect on', bins: ['opinion'] }, { text: 'Why the council must answer for the harbour land', bins: ['opinion'] }, { text: 'It is time to ask whether the council is accountable to anyone', bins: ['opinion'] }, { text: 'The public has a right to know what was decided in private', bins: ['opinion'] }, { text: 'In praise of the unfashionable library', bins: ['opinion'] }, { text: 'Transparency is the price of public money', bins: ['opinion'] },
      { text: 'Peace talks resume after the capital is shelled', bins: ['world'] }, { text: 'The summit ends with a treaty on shared fishing waters', bins: ['world'] }, { text: 'Thousands are evacuated as the river bursts its banks', bins: ['world'] }, { text: 'The ambassador is recalled after the dispute', bins: ['world'] }, { text: 'Aid agencies warn of a humanitarian crisis', bins: ['world'] }, { text: 'Sanctions are lifted after two years', bins: ['world'] },
      { text: 'A century of the Courier, told in headlines', bins: ['features'] }, { text: 'The last blacksmith in the harbour', bins: ['features'] }, { text: 'Inside the rescue boat station at dawn', bins: ['features'] }, { text: 'How the market traders survived the winter', bins: ['features'] }, { text: 'The woman who taught the town to swim', bins: ['features'] }, { text: 'A tour of the lighthouse with its last keeper', bins: ['features'] },
      { text: '{Mr. Bell|@}, who sold the paper in the harbour for sixty years, dies at ninety-one', bins: ['obits'] }, { text: 'A tribute to the teacher who knew every child by name', bins: ['obits'] }, { text: 'The former councillor died peacefully at home, her family said', bins: ['obits'] }, { text: 'The lighthouse keeper is remembered at a service at the harbour', bins: ['obits'] }, { text: 'The harbour pilot dies after a long illness', bins: ['obits'] }, { text: 'Funeral will be held on Thursday for the baker of Market Street', bins: ['obits'] },
      { text: 'The story of March 3 gave the wrong date for the hearing', bins: ['corrections'] }, { text: 'An earlier version of this article gave the wrong name for the defendant', bins: ['corrections'] }, { text: 'We apologize for an error in yesterday\'s table of results', bins: ['corrections'] }, { text: 'The caption on Page 3 gave the wrong names for the people in the photograph', bins: ['corrections'] }, { text: 'Our report of Monday overstated the cost of the scheme', bins: ['corrections'] }, { text: 'The figure for the deficit was given incorrectly last Friday', bins: ['corrections'] },
    ] },
  { id: 'nt5_poll', rank: 5, arch: 'check', say: 'The poll is out. Please check how my draft describes the result.', fields: [
    { id: 'yes', label: 'For the new bridge', range: [44, 54], fmt: '{n}%' },
    { id: 'no', label: 'Against', range: [38, 46], fmt: '{n}%' },
    { id: 'margin', label: 'Margin of error', range: [2, 5], fmt: '{n} points' },
    { id: 'sample', label: 'People asked', values: ['800', '1,100', '1,500', '2,000'] },
  ], docs: [{ kind: 'card', title: 'Poll', fields: ['yes', 'no', 'margin', 'sample'] }, { kind: 'letter', title: 'Draft', fields: ['yes', 'no', 'margin', 'sample'] }], target: 1, pWrong: 0.7 },
  { id: 'nt5_accounts', rank: 5, arch: 'check', say: 'Please check that my story reports the accounts accurately.', fields: [
    { id: 'spend', label: 'Spending', range: [12, 15], fmt: '{n} million' },
    { id: 'take', label: 'Income', range: [9, 11], fmt: '{n} million' },
    { id: 'gap', label: 'Deficit', calc: 'spend - take', fmt: '{n} million' },
  ], docs: [{ kind: 'card', title: 'Treasurer\'s statement', fields: ['spend', 'take', 'gap'] }, { kind: 'letter', title: 'Story', fields: ['spend', 'take', 'gap'] }], target: 1, pWrong: 0.7, wrongable: ['spend', 'take', 'gap'] },
  { id: 'nt5_claim', rank: 5, arch: 'check', say: 'The lawyers have sent us the claim. Please check my summary against it.', fields: [
    { id: 'who', label: 'Plaintiff', values: ['{Mr. Dale|@}', '{Ms. Hart|@}', '{Mr. Okoye|@}', '{Mr. Grant|@}'] },
    { id: 'story', label: 'Story of', values: ['March 3', 'April 12', 'May 20', 'June 8'] },
    { id: 'apology', label: 'Apology asked on', values: ['the front page', 'Page 2', 'the back page'] },
    { id: 'sum', label: 'Compensation asked', values: ['15,000 coins', '50,000 coins', '150,000 coins', '500,000 coins'] },
  ], docs: [{ kind: 'note', title: 'The claim', fields: ['who', 'story', 'apology', 'sum'] }, { kind: 'letter', title: 'Summary', fields: ['who', 'story', 'apology', 'sum'] }], target: 1, pWrong: 0.7 },
  { id: 'nt5_recount', rank: 5, arch: 'check', say: 'The recount has finished. Please check my figures against the notice.', fields: [
    { id: 'hart', label: '{Mayor Hart|@}', range: [6000, 6200, 10], fmt: '{n,}' },
    { id: 'brooks', label: '{Ms. Brooks|@}', range: [5900, 6100, 10], fmt: '{n,}' },
    { id: 'margin', label: 'Majority', calc: 'max(hart, brooks) - min(hart, brooks)', fmt: '{n}' },
  ], docs: [{ kind: 'card', title: 'Official notice', fields: ['hart', 'brooks', 'margin'] }, { kind: 'letter', title: 'Draft', fields: ['hart', 'brooks', 'margin'] }], target: 1, pWrong: 0.7, wrongable: ['hart', 'brooks', 'margin'] },
  { id: 'nt5_caption', rank: 5, arch: 'check', say: 'Please check the caption against my photo notes.', fields: [
    { id: 'what', label: 'What', values: ['families leaving the flooded quarter', 'workers on the new bridge', 'the crowd outside the court', 'the rescue boat returning to harbour'] },
    { id: 'when', label: 'When', values: ['Tuesday at dawn', 'Friday at noon', 'Sunday night', 'Monday morning'] },
    { id: 'how', label: 'Photo by', values: ['{Mr. Moss|@}', '{Ms. Idris|@}', '{Mr. Abbott|@}', '{Ms. Tan|@}'] },
  ], docs: [{ kind: 'note', title: 'Photo notes', fields: ['what', 'when', 'how'] }, { kind: 'label', title: 'Caption', fields: ['what', 'when', 'how'] }], target: 1, pWrong: 0.7 },
  { id: 'nt5_obit', rank: 5, arch: 'check', say: 'Please check the dates in the obituary against the family\'s notice.', fields: [
    { id: 'born', label: 'Born', range: [1930, 1950], fmt: '{n}' },
    { id: 'from', label: 'On the council from', range: [1970, 1985], fmt: '{n}' },
    { id: 'to', label: 'On the council until', range: [1990, 2005], fmt: '{n}' },
  ], docs: [{ kind: 'note', title: 'Family notice', fields: ['born', 'from', 'to'] }, { kind: 'letter', title: 'Draft', fields: ['born', 'from', 'to'] }], target: 1, pWrong: 0.7 },
  { id: 'nt5_pad', rank: 5, arch: 'respond', mode: 'form', kind: 'phone', features: ['audioOnly'], say: 'It is a call from outside. Please write down every detail.',
    lines: ['Good morning. This is {who}.', 'The {what} will {verb} on {day}, subject to {cond}.', 'Please do not publish before {time}.'],
    fields: [
      { id: 'who', label: 'Caller', values: ['{Ms. Reyes|@}', '{Ms. Hart|@}', '{Mr. Okoye|@}', '{Ms. Tan|@}'] },
      { id: 'what', label: 'Who', values: ['director', 'chairman', 'minister', 'treasurer'] },
      { id: 'verb', label: 'Will', values: ['resign', 'retire', 'be replaced', 'give evidence'] },
      { id: 'day', label: 'On', values: ['Monday', 'Wednesday', 'Friday'] },
      { id: 'cond', label: 'Subject to', values: ['a vote', 'a court order', 'the board\'s approval'] },
      { id: 'time', label: 'Not before', values: ['ten', 'noon', 'three'] },
    ] },
  { id: 'nt5_plan', rank: 5, arch: 'respond', mode: 'slot', kind: 'memo', say: 'Look at the plan, please. Where does the story go?', layout: 'calendar', rows: PAGES5, cols: SPOTS3,
    want: [
      { tag: 'top', text: 'The lead story must start at the top of a page.' }, { tag: 'mid', text: 'The story has a large photograph, so it needs the middle of a page.' }, { tag: 'low', text: 'The story can take only the bottom of a page.' },
      { tag: 'p3', text: 'It belongs on Page 3.' }, { tag: 'p4', text: 'It belongs on Page 4.' }, { tag: 'p5', text: 'It belongs on Page 5.' },
    ],
    avoid: [{ tag: 'p1', text: 'The front page is reserved for the verdict.' }, { tag: 'p2', text: 'Page 2 carries the corrections and the apology.' }, { tag: 'p3', text: 'Page 3 is the editorial page.' }, { tag: 'p4', text: 'Page 4 is full of advertisements.' }, { tag: 'p5', text: 'Page 5 carries the photographs.' }],
    busy: ['Verdict', 'Photographs', 'Apology', 'Editorial', 'Advertisement', 'Dates'], open: ['Dear all,'], close: ['Thank you.'] },
  { id: 'nt5_say', rank: 5, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'news5' },
  { id: 'nt5_phone', rank: 5, arch: 'respond', mode: 'choose', kind: 'phone', bank: 'phone5', features: ['audioOnly'] },
  { id: 'nt5_mail', rank: 5, arch: 'respond', mode: 'choose', kind: 'email', bank: 'mail5' },
  { id: 'nt5_letter', rank: 5, arch: 'respond', mode: 'choose', kind: 'letter', bank: 'letter5' },
  { id: 'nt5_gap', rank: 5, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'gap5' },
  { id: 'nt5_proof', rank: 5, arch: 'respond', mode: 'choose', kind: 'memo', bank: 'proof5' },
];

// ---------------------------------------------------------------------------------------------- the wire, second batch (ranks 2-5)
// More headlines for the sorting cabinet: the trade's own words (courts, politics, money, science, the environment).

const pats = (bin: string, texts: string[]) => texts.map((text) => ({ text, bins: [bin] }));

const SORT_N2 = [
  ...pats('town', ['The library will stay open late on Fridays', 'A new bus stop is built near the market', 'Children decorate the harbour wall', 'The town clock is mended at last']),
  ...pats('sport', ['The rowers win the cup for the second year', 'The goalkeeper saves two penalties', 'Fans fill the stadium for the final', 'The coach says that the team is ready']),
  ...pats('weather', ['A strong wind and heavy rain are on the way', 'Thunder and lightning are expected tonight', 'Fog closes the harbour this morning', 'A warm spring week is ahead']),
  ...pats('business', ['The shop on the corner will close in August', 'Fish prices go up after the storm', 'A new factory will give the town forty jobs', 'The bank opens a branch near the station']),
  ...pats('world', ['The two countries agree to stop the fight', 'Thousands of people leave their homes after the flood', 'The president visits the town of the earthquake', 'A new bridge joins the two countries']),
  ...pats('arts', ['The museum shows works by a local artist', 'The choir sings at the harbour festival', 'A new play opens at the theatre on Friday', 'The film about the sea wins a prize']),
];

const SORT_N3 = [
  ...pats('politics', ['The coalition agrees on a new budget', 'Voters head to the polls on Sunday', 'The councillor proposes a ban on cars in the old town', 'The opposition leader criticizes the government\'s plan', 'The cabinet approves a tax cut for small shops', 'Candidates debate in front of a packed hall', 'The mayor visits the flood area', 'A petition with five thousand signatures reaches the council']),
  ...pats('crime', ['Police arrest a suspect in the market theft', 'A burglar is caught on camera', 'The robbery at the bank took place at night', 'Witnesses describe the chase through the streets', 'The driver is found guilty of dangerous driving', 'The suspect denies all the charges', 'The fraud trial enters its third week', 'A lawyer says that her client is innocent']),
  ...pats('science', ['Researchers discover how a crab grows a new claw', 'Scientists measure the speed of light in a new way', 'A telescope captures an image of a distant star', 'The experiment shows that plants grow faster in blue light', 'A team develops a cheaper computer chip', 'New fossils are found in the cliffs', 'Engineers test a robot that can climb stairs', 'A professor explains how the tides work']),
  ...pats('business', ['The bank raises interest rates again', 'Unemployment falls for the third month', 'The shipping company reports a loss', 'Inflation slows to two percent', 'Shares in the fish company jump eight percent', 'Prices of vegetables rise after the storm', 'The new supermarket creates fifty jobs', 'Exports of cheese reach a record']),
  ...pats('environment', ['Pollution in the river reaches a dangerous level', 'Volunteers clean the beach after the storm', 'The glacier is melting faster each year', 'Recycling rates double in the town', 'Volunteers plant a thousand trees in the forest', 'Fishermen find a lot of plastic in their nets', 'Fewer birds nest on the cliffs this spring', 'Endangered whales are seen near the coast']),
  ...pats('health', ['The hospital opens a new children\'s ward', 'Doctors warn of a rise in flu cases', 'Children receive a new vaccine at the school clinic', 'Nurses call for better pay', 'The number of patients waiting for surgery rises', 'Doctors say that walking every day is good for the heart', 'Pharmacies run out of cough medicine', 'Health officials urge people to wash their hands']),
  ...pats('world', ['The president meets the leaders of three countries', 'Refugees cross the border in search of safety', 'An earthquake shakes the capital', 'Troops withdraw after the ceasefire', 'The two countries sign a peace agreement', 'Protesters gather outside the embassy', 'Floods leave thousands homeless in the neighbouring country', 'The United Nations calls for aid']),
  ...pats('opinion', ['Why the town needs a new bridge', 'The council must listen to young people', 'Why prices are rising while wages are not', 'Our readers write: the bus fares are too high', 'Why the old library must not be sold', 'Schools deserve better funding', 'We cannot ignore the danger on the shore road', 'A good idea that the council has spoiled']),
];

const SORT_N4 = [
  ...pats('politics', ['The legislature debates a bill on housing', 'The governor vetoes the spending bill', 'Lawmakers clash over the pension reform', 'A scandal forces the treasurer to resign', 'The ruling party loses its majority', 'The council delegation returns from the talks with a compromise', 'Campaign funds rise as the election draws near', 'The council holds a hearing on the plan for the waterfront']),
  ...pats('crime', ['The prosecutor accuses the owner of tax evasion', 'The defendant pleads not guilty to the charge of arson', 'The detective questions a second suspect', 'The court hears testimony from the harbour guard', 'A smuggling ring is broken up at the port', 'The accused is sentenced to community service', 'Embezzlement of the club\'s funds is alleged', 'The victim\'s family asks for an inquiry']),
  ...pats('science', ['A genetic study reveals the origin of the local sheep', 'The satellite sends back photographs of a distant moon', 'Archaeologists unearth an old coin near the harbour', 'The observatory detects a rare eclipse', 'Biologists discover how the salmon find their way home', 'Chemists develop a plastic that dissolves in water', 'Neuroscientists map how the brain stores a memory', 'A prototype engine runs on seaweed']),
  ...pats('health', ['The hospital faces a shortage of nurses', 'Diabetes clinics report a rise in new cases', 'Obesity among children is on the rise', 'The clinic launches a campaign against smoking', 'Surgeons perform the first operation of its kind in the region', 'The outbreak of measles is contained', 'Mental health services face budget cuts', 'Patients wait longer for an appointment with a specialist']),
  ...pats('environment', ['The emissions of the power station are cut by a third', 'Conservationists protect the nesting sites of the terns', 'Erosion threatens the cliff path', 'Households cut their waste by a third in a year', 'Oil from the tanker spoils the beach', 'A forest fire destroys three hundred acres', 'Rising seas threaten the low coast road', 'The wetland is declared a nature reserve']),
  ...pats('business', ['The shipbuilder wins a contract worth ten million coins', 'The company announces a takeover of its rival', 'Wages rise faster than prices for the first time in years', 'The retailer closes twelve branches', 'Investors worry about the falling currency', 'The trade deficit grows as imports increase', 'The firm cuts two hundred jobs to save money', 'The shipyard receives a loan of three million coins']),
  ...pats('world', ['Negotiators from the two countries reach a deal after a week of talks', 'The neighbouring government declares a state of emergency', 'Voters in the neighbouring country back the new constitution', 'Rebels seize the airport', 'The diplomat is expelled for spying', 'The envoy warns of famine in the war zone', 'Aid workers are trapped by the fighting', 'The delegates adopt a resolution on the ceasefire']),
  ...pats('opinion', ['The council has failed the people of this harbour', 'A plea for patience in the dispute over the bridge', 'Reforming the pension system is a duty, not a choice', 'The case for a free press in a small town', 'Why the mayor must apologize', 'A good school is the best investment a town can make', 'The government\'s promise is hollow', 'What the strike teaches us about trust']),
  ...pats('features', ['A day with the pilot who guides the ships into port', 'The baker who has risen at four every day for forty years', 'How the lighthouse lens is cleaned', 'Meet the volunteers who run the lifeboat', 'The secret recipe of the harbour fish stew', 'The old shipyard comes back to life']),
];

const SORT_N5 = [
  ...pats('politics', ['The cabinet reshuffle is seen as a bid to restore confidence', 'The senator is criticized for misusing public funds', 'The electoral commission investigates irregularities at the polls', 'The ruling coalition collapses over the austerity budget', 'Legislation to curb lobbying is passed', 'The mayor faces calls to resign over the contract', 'The treaty will be ratified by parliament next week', 'Opponents accuse the government of a cover-up']),
  ...pats('crime', ['The appeal against the conviction is dismissed', 'The defendant is acquitted for lack of evidence', 'The judge imposes a suspended sentence on the clerk', 'The jury deliberates for a third day', 'The prosecution alleges that the invoices were forged', 'A wiretap is ruled inadmissible', 'The accused is extradited to face trial', 'The court orders the company to pay damages']),
  ...pats('science', ['A breakthrough in gene therapy offers hope for children', 'The microbe could help to clean oil from the sea', 'Physicists confirm the existence of a new particle', 'A new method of making steel uses less energy, engineers say', 'The geologists warn that the cliff is unstable', 'The telescope reveals a galaxy older than any known', 'Scientists sequence the genome of the harbour seal', 'Peer reviewers question the findings of the study']),
  ...pats('health', ['The epidemic is slowing, the health minister says', 'The hospital is fined over a breach of patients\' privacy', 'A chronic shortage of doctors threatens rural clinics', 'The insurer refuses to cover the new treatment', 'Antibiotics are losing their power, experts warn', 'Paramedics demand reform of the ambulance service', 'The vaccination campaign reaches nine in ten adults', 'Doctors call for a ban on the sale of sugary drinks to children']),
  ...pats('environment', ['Biodiversity is declining in the estuary', 'The company is fined for dumping waste in the bay', 'Activists chain themselves to the gates of the refinery', 'Rising sea levels will swamp the low-lying quarter by 2050', 'The coral reef shows signs of bleaching', 'Poachers are blamed for the fall in the number of seals', 'Renewable energy now supplies half of the town\'s power', 'The ban on single-use plastic comes into force']),
  ...pats('business', ['The central bank holds interest rates despite inflation', 'The firm files for bankruptcy after the loss of its main customer', 'Regulators block the merger of the two ferry companies', 'The auditors question the accounts of the shipping group', 'Analysts say that a cartel controls half of the fuel market', 'Share prices tumble on fears of a recession', 'The trade union calls a strike over redundancies', 'The firm\'s deficit widens, its treasurer admits']),
  ...pats('world', ['The ceasefire holds despite the shelling', 'The prime minister of the neighbouring country survives a vote of no confidence', 'Exiled leaders return to the neighbouring capital after the amnesty', 'The embargo on arms is extended', 'Famine spreads as the war cuts the food supply', 'Aid ships reach the port after weeks of fighting', 'Thousands flee the conflict across the border', 'The summit of the two countries ends in deadlock']),
  ...pats('opinion', ['The defence of the free press is the defence of the public', 'Complacency is the council\'s greatest enemy', 'The minister\'s excuses do not stand up to scrutiny', 'A moral duty to take in those who flee war', 'Why the new tax is unfair to the poor', 'The paper must resist the pressure of the powerful', 'Silence is not an answer to the questions of the voters', 'An unjust law is no law at all']),
  ...pats('obits', ['The pilot who guided ships into port for forty years dies at eighty', 'The novelist who chronicled the harbour is mourned', 'A tribute to the doctor who treated three generations', 'The last owner of the old shipyard has died', 'The retired judge is remembered for her fairness', 'The painter of the harbour leaves behind hundreds of canvases']),
  ...pats('corrections', ['An article on Tuesday misspelled the name of the councillor', 'A headline on Page 1 wrongly said that the fine was paid', 'The photograph on Page 5 was credited to the wrong photographer', 'Our obituary of Saturday gave an incorrect date of birth', 'A story about the pension fund misstated the amount of the loss', 'An earlier version of this report omitted the response of the company']),
];

const TY: TaskTemplate[] = [
  { id: 'nt2_sort2', rank: 2, arch: 'sort', say: 'More stories have come in. Please put them on the right pages.', count: [4, 5], bins: ['town', 'sport', 'weather', 'business', 'world', 'arts'], patterns: SORT_N2 },
  { id: 'nt3_sort2', rank: 3, arch: 'sort', say: 'The wire is busy this morning. Please put each story on its page.', count: [4, 5], bins: ['politics', 'crime', 'science', 'health', 'environment', 'business', 'world', 'opinion'], patterns: SORT_N3 },
  { id: 'nt4_sort2', rank: 4, arch: 'sort', say: 'The second wire has just arrived. Please put each piece where readers will look for it.', count: [4, 5], bins: ['politics', 'crime', 'science', 'health', 'environment', 'business', 'world', 'opinion', 'features'], patterns: SORT_N4 },
  { id: 'nt5_sort2', rank: 5, arch: 'sort', say: 'The night desk has filed late. Please place each piece with care.', count: [4, 5], bins: ['politics', 'crime', 'science', 'health', 'environment', 'business', 'world', 'opinion', 'obits', 'corrections'], patterns: SORT_N5 },
];

// ---------------------------------------------------------------------------------------------- reactions and the boss's lines
// A reaction to a mistake says in English what was wrong (the game shows no badge): the field, the page, the fact.
// Lines about "the notes" come only where the task has notes; "my question" only face to face (see reactionFits).

const REACTIONS: JobContent['reactions'] = [
  // ---- rank 1
  { id: 'nr_ok1', kind: 'perfect', text: 'Thank you. That is right.', face: 'happy' },
  { id: 'nr_ok2', kind: 'perfect', text: 'Good work! That is just right.', face: 'delighted' },
  { id: 'nr_ok3', kind: 'perfect', arch: 'sort', text: 'Good. Every story is on the right page.', face: 'happy' },
  { id: 'nr_ok4', kind: 'perfect', arch: 'check', text: 'Good eyes. Now the two papers say the same.', face: 'delighted' },
  { id: 'nr_ok5', kind: 'perfect', arch: 'respond', text: 'Good answer. Thank you.', face: 'happy' },
  { id: 'nr_late', kind: 'minor', late: true, text: 'Good. But please be fast next time.', face: 'neutral' },
  { id: 'nr_bin', kind: 'wrong_bin', text: 'No. This story goes to “{bin}”.', face: 'puzzled' },
  { id: 'nr_bin2', kind: 'wrong_bin', text: 'Look again. This one is for “{bin}”.', face: 'puzzled' },
  { id: 'nr_miss', kind: 'missed', text: 'Wait! The {field} is wrong here. Please look at both papers again.', face: 'angry' },
  { id: 'nr_miss2', kind: 'missed', needs: '\\bnotes\\b', text: 'Wait! The {field} is not the same as in the notes.', face: 'angry' },
  { id: 'nr_alarm', kind: 'false_alarm', text: 'This one is fine. The two papers say the same.', face: 'puzzled' },
  { id: 'nr_field', kind: 'wrong_field', text: 'That line is right. The mistake is in the {field}.', face: 'puzzled' },
  { id: 'nr_fix', kind: 'wrong_fix', text: 'Yes, that line is wrong. But your new word is not the right one.', face: 'neutral' },
  { id: 'nr_reply', kind: 'wrong_reply', voice: 'person', not: '\\bmemo\\b', text: 'Sorry? That does not answer my question.', face: 'puzzled' },
  { id: 'nr_reply2', kind: 'wrong_reply', text: 'That is not the right answer. It does not say what the paper says.', face: 'puzzled' },
  { id: 'nr_reply3', kind: 'wrong_reply', voice: 'boss', text: 'That reply is wrong. Please read it again.', face: 'puzzled' },
  { id: 'nr_reply4', kind: 'wrong_reply', needs: '\\b(ringing|phone|call)\\b', text: 'Oh dear. That is not what the caller asked.', face: 'puzzled' },
  { id: 'nr_form', kind: 'wrong_form', text: 'Some of this message is wrong. The caller said something else.', face: 'sad' },
  { id: 'nr_slot', kind: 'wrong_slot', text: 'That place is taken, or it is not the place on the plan. Please look at the plan again.', face: 'sad' },
  { id: 'nr_slot2', kind: 'wrong_slot', text: 'No. That is not the page that the story needs.', face: 'sad' },
  { id: 'nr_fail', kind: 'any_fail', text: 'Oh no. That is not right. Please try again.', face: 'sad' },
  // ---- rank 2
  { id: 'nr2_ok1', kind: 'perfect', rank: 2, text: 'Good work. Everything is in order.', face: 'happy' },
  { id: 'nr2_ok2', kind: 'perfect', rank: 2, arch: 'sort', text: 'Good. The pages are ready for the printer.', face: 'delighted' },
  { id: 'nr2_ok3', kind: 'perfect', rank: 2, arch: 'check', text: 'Good eyes. The story is correct now.', face: 'delighted' },
  { id: 'nr2_ok4', kind: 'perfect', rank: 2, arch: 'respond', text: 'Good reply. That is just what the reader needs.', face: 'happy' },
  { id: 'nr2_late', kind: 'minor', late: true, rank: 2, text: 'Almost. The work is good, but you were a little slow.', face: 'neutral' },
  { id: 'nr2_bin', kind: 'wrong_bin', rank: 2, text: 'This story does not belong here. It is for “{bin}”.', face: 'puzzled' },
  { id: 'nr2_miss', kind: 'missed', rank: 2, text: 'Stop! The {field} does not agree with the other paper. We cannot print it like this.', face: 'angry' },
  { id: 'nr2_alarm', kind: 'false_alarm', rank: 2, text: 'Everything agrees here. Please do not stop a good story.', face: 'puzzled' },
  { id: 'nr2_field', kind: 'wrong_field', rank: 2, text: 'That line agrees with the other paper. The problem is in the {field}.', face: 'puzzled' },
  { id: 'nr2_fix', kind: 'wrong_fix', rank: 2, text: 'You found the wrong line, but the right word is on the other paper.', face: 'neutral' },
  { id: 'nr2_reply', kind: 'wrong_reply', rank: 2, text: 'That is not the answer to the question. Please read the message again.', face: 'puzzled' },
  { id: 'nr2_reply2', kind: 'wrong_reply', rank: 2, needs: '\\b(ringing|phone|call)\\b', text: 'That is not what the caller asked. Please listen again.', face: 'puzzled' },
  { id: 'nr2_form', kind: 'wrong_form', rank: 2, text: 'This message has a mistake in it. Please listen again and check every word.', face: 'sad' },
  { id: 'nr2_slot', kind: 'wrong_slot', rank: 2, text: 'That space is full, or it does not fit what the editor wrote.', face: 'sad' },
  { id: 'nr2_fail', kind: 'any_fail', rank: 2, text: 'This is wrong. The paper goes to the printer tonight, so please be careful.', face: 'sad' },
  // ---- rank 3
  { id: 'nr3_ok1', kind: 'perfect', rank: 3, text: 'Excellent. You work fast, and you work well.', face: 'delighted' },
  { id: 'nr3_ok2', kind: 'perfect', rank: 3, arch: 'check', text: 'Good eyes. We would have printed that mistake.', face: 'delighted' },
  { id: 'nr3_ok3', kind: 'perfect', rank: 3, arch: 'respond', text: 'A clear and polite reply. Thank you.', face: 'happy' },
  { id: 'nr3_ok4', kind: 'perfect', rank: 3, arch: 'sort', text: 'Right. Each story is where the reader expects it.', face: 'happy' },
  { id: 'nr3_late', kind: 'minor', late: true, rank: 3, text: 'Good, but the printer is waiting. Please work a little faster.', face: 'neutral' },
  { id: 'nr3_bin', kind: 'wrong_bin', rank: 3, text: 'That story is not for this section. Readers would look for it under “{bin}”.', face: 'puzzled' },
  { id: 'nr3_miss', kind: 'missed', rank: 3, text: 'We cannot print this. The {field} does not match what the other paper says.', face: 'angry' },
  { id: 'nr3_miss2', kind: 'missed', rank: 3, needs: '\\bnotes\\b', text: 'The {field} in the draft is not what the reporter wrote in the notes. That would be a mistake in print.', face: 'angry' },
  { id: 'nr3_alarm', kind: 'false_alarm', rank: 3, text: 'There is no mistake here. The draft agrees with the other paper, so it was not necessary to stop it.', face: 'puzzled' },
  { id: 'nr3_field', kind: 'wrong_field', rank: 3, text: 'That line is correct. The line that disagrees is the {field}.', face: 'puzzled' },
  { id: 'nr3_fix', kind: 'wrong_fix', rank: 3, text: 'You found the right line, but the correct value is the one on the other paper.', face: 'neutral' },
  { id: 'nr3_reply', kind: 'wrong_reply', rank: 3, text: 'I am afraid that reply is not what the message needs. It answers a different question.', face: 'sad' },
  { id: 'nr3_reply2', kind: 'wrong_reply', rank: 3, needs: '\\b(ringing|phone|call)\\b', text: 'That is not what the caller wanted. Please listen to the call again.', face: 'sad' },
  { id: 'nr3_form', kind: 'wrong_form', rank: 3, text: 'You missed something. A number or a name on the message pad is not what was said.', face: 'sad' },
  { id: 'nr3_slot', kind: 'wrong_slot', rank: 3, text: 'That place is taken, or it does not suit the story. Please read the editor\'s wishes again.', face: 'sad' },
  { id: 'nr3_fail', kind: 'any_fail', rank: 3, text: 'This is not good enough. A mistake like this would be printed for everyone to see.', face: 'sad' },
  // ---- rank 4
  { id: 'nr4_ok1', kind: 'perfect', rank: 4, text: 'Exactly right. You have a good eye for detail.', face: 'delighted' },
  { id: 'nr4_ok2', kind: 'perfect', rank: 4, arch: 'check', text: 'Well spotted. That figure would have been quoted by other papers.', face: 'delighted' },
  { id: 'nr4_ok3', kind: 'perfect', rank: 4, arch: 'respond', text: 'Well read. That reply answers exactly what was asked.', face: 'happy' },
  { id: 'nr4_miss', kind: 'missed', rank: 4, text: 'We almost published an error. The {field} does not agree with the source.', face: 'angry' },
  { id: 'nr4_alarm', kind: 'false_alarm', rank: 4, text: 'That draft is accurate. The {field} agrees with the source, so nothing needed to be held back.', face: 'puzzled' },
  { id: 'nr4_field', kind: 'wrong_field', rank: 4, text: 'That detail is accurate. The error is in the {field}.', face: 'puzzled' },
  { id: 'nr4_bin', kind: 'wrong_bin', rank: 4, text: 'That belongs in “{bin}”. Please think about what the story is really about.', face: 'puzzled' },
  { id: 'nr4_reply', kind: 'wrong_reply', rank: 4, text: 'That reply misses the writer\'s point. Please read the message more closely.', face: 'puzzled' },
  { id: 'nr4_form', kind: 'wrong_form', rank: 4, text: 'The message is not accurate. One of the details is not what the caller gave.', face: 'sad' },
  { id: 'nr4_slot', kind: 'wrong_slot', rank: 4, text: 'That slot is unavailable, or it conflicts with one of the editor\'s conditions.', face: 'sad' },
  { id: 'nr4_fail', kind: 'any_fail', rank: 4, text: 'This will not do. Please check every detail before you answer.', face: 'sad' },
  // ---- rank 5
  { id: 'nr5_ok1', kind: 'perfect', rank: 5, text: 'Exactly. You have saved us a correction.', face: 'delighted' },
  { id: 'nr5_ok2', kind: 'perfect', rank: 5, arch: 'check', text: 'Sharp work. A discrepancy like that is the sort of thing lawyers look for.', face: 'delighted' },
  { id: 'nr5_ok3', kind: 'perfect', rank: 5, arch: 'respond', text: 'A measured, accurate reply. Please send it.', face: 'happy' },
  { id: 'nr5_ok4', kind: 'perfect', rank: 5, arch: 'sort', text: 'Correct. Each piece is exactly where the readers and the lawyers would expect it.', face: 'happy' },
  { id: 'nr5_late', kind: 'minor', late: true, rank: 5, text: 'Sound work, but the deadline is close. Please be a little quicker.', face: 'neutral' },
  { id: 'nr5_bin', kind: 'wrong_bin', rank: 5, text: 'That piece does not belong in this section; it is a matter for “{bin}”.', face: 'puzzled' },
  { id: 'nr5_miss', kind: 'missed', rank: 5, text: 'This would have gone to print with an error. The {field} contradicts the source.', face: 'angry' },
  { id: 'nr5_alarm', kind: 'false_alarm', rank: 5, text: 'That draft is consistent with the source. Holding it back was unnecessary and cost us time.', face: 'puzzled' },
  { id: 'nr5_field', kind: 'wrong_field', rank: 5, text: 'That detail is consistent. The discrepancy lies in the {field}.', face: 'puzzled' },
  { id: 'nr5_fix', kind: 'wrong_fix', rank: 5, text: 'You located the discrepancy, but the figure that the source gives is a different one.', face: 'neutral' },
  { id: 'nr5_reply', kind: 'wrong_reply', rank: 5, text: 'I am afraid that reply does not address the point that was raised. Please read the message again, line by line.', face: 'puzzled' },
  { id: 'nr5_form', kind: 'wrong_form', rank: 5, text: 'The message is not faithful to the call: one detail has changed. Please listen again.', face: 'sad' },
  { id: 'nr5_slot', kind: 'wrong_slot', rank: 5, text: 'That placement contradicts one of the conditions in the message. Please read them again.', face: 'sad' },
  { id: 'nr5_fail', kind: 'any_fail', rank: 5, text: 'This is unacceptable for a newspaper. Every detail must be exact.', face: 'sad' },
];

const LINES: JobContent['lines'] = [
  { id: 'nl_s1', kind: 'start', text: 'Good morning. We have a lot of news and a lot of stories today.' },
  { id: 'nl_s2', kind: 'start', text: 'Hello! The town news, the sports page and the weather page are on your desk.' },
  { id: 'nl_s2b', kind: 'start', text: 'Good morning! Our team is ready, and the newspaper goes to the printer at six.' },
  { id: 'nl_s3', kind: 'start', rank: 2, text: 'Good morning. Please check everything twice today.' },
  { id: 'nl_s4', kind: 'start', rank: 3, text: 'Good morning. The phone will not stop today, I am afraid, and the printer needs the pages by six.' },
  { id: 'nl_s5', kind: 'start', rank: 4, text: 'Good morning. The council meets this afternoon, so we have a long list of stories to finish before the deadline.' },
  { id: 'nl_s6', kind: 'start', rank: 5, text: 'Good morning. The lawyers are coming at noon, so every detail on our front page must be exact.' },
  { id: 'nl_h1', kind: 'handover', msg: 'phone', text: 'Your phone is ringing. Could you take the call, please?' },
  { id: 'nl_h2', kind: 'handover', msg: 'email', text: 'This email came for the paper. Please read it and tell me what it says.' },
  { id: 'nl_h3', kind: 'handover', msg: 'memo', text: 'Please read this and tell me what to say.' },
  { id: 'nl_h4', kind: 'handover', msg: 'letter', text: 'A letter came for the editor. Please read it.' },
  { id: 'nl_e1', kind: 'end', text: 'Thank you for your work today.' },
  { id: 'nl_e2', kind: 'end', text: 'Good work. See you tomorrow!' },
  { id: 'nl_e3', kind: 'end', rank: 3, text: 'Thank you. The pages are at the printer, and the office is quiet at last.' },
  { id: 'nl_e4', kind: 'end', rank: 5, text: 'The paper is on the presses. Thank you for your careful work today.' },
  { id: 'nl_r1', kind: 'rankup', text: 'You are doing very well. Here is a little more work for you.' },
  { id: 'nl_r5', kind: 'rankup', rank: 5, text: 'You are my right hand now. From today, you help me with the stories that the lawyers read.' },
];
// ---------------------------------------------------------------------------------------------- generated lexicon (tools/genlex.ts)
const LEX_SRC = `
# jn2_001 | 新聞社のことば ①（3級）
win|v|winning,wins,won|勝つ
caption|n||写真の説明文
reporter|n|reporter's,reporters|記者
# jn2_002 | 新聞社のことば ②（3級）
bottom|n||下・底
sports|n||スポーツ
headline|n|headlines|見出し
# jn3_003 | 新聞社のことば ①（準2級）
police|n||警察
prize|n||賞
fight|n||戦い・けんか
subscribe|v||定期購読する
swimming|n||水泳
# jn3_004 | 新聞社のことば ②（準2級）
cloud|n||雲
coach|n||コーチ
decorate|v||飾る
earthquake|n||地震
# jn3_005 | 新聞社のことば ③（準2級）
fan|n|fans|ファン
final|n||決勝
goalkeeper|n||ゴールキーパー
lightning|n||稲妻
# jn3_006 | 新聞社のことば ④（準2級）
rower|n|rowers|漕ぎ手
theatre|n||劇場（theaterの英式つづり）
thunder|n||雷
judge|n|judge's|裁判官
# jn4_007 | 新聞社のことば ①（2級）
director|n||責任者・長官
minister|n|minister's|大臣
stone|n|stones|石
profit|n|profits|利益
# jn4_008 | 新聞社のことば ②（2級）
thousand|n|thousands|1000
advertisement|n|advertisements|広告
seabird|n|seabirds|海鳥
singer|n||歌手
# jn4_009 | 新聞社のことば ③（2級）
scientist|n|scientists|科学者
steal|v|stealing,stole|盗む
probably|d||たぶん
sport|n||スポーツ
# jn4_010 | 新聞社のことば ④（2級）
courier|n||宅配業者
robbery|n||強盗
goal|n|goals|ゴール・得点
competition|n||競技会・競争
# jn4_011 | 新聞社のことば ⑤（2級）
niece|n||めい
leader|n|leaders|指導者
crime|n||犯罪
army|n||陸軍
# jn4_012 | 新聞社のことば ⑥（2級）
beautiful|a||美しい
champion|n||優勝者
cinema|n||映画館
discover|v||発見する
# jn4_013 | 新聞社のことば ⑦（2級）
economy|n||経済
export|n|exports|輸出
farmer|n|farmers|農家
medal|n|medals|メダル
# jn4_014 | 新聞社のことば ⑧（2級）
panel|n|panels|パネル
player|n||選手
recycle|v||リサイクルする
rubbish|n||ごみ
# jn4_015 | 新聞社のことば ⑨（2級）
swimmer|n|swimmers|泳ぐ人
thief|n||泥棒
tourism|n||観光
plastic|a||プラスチックの
# jn4_016 | 新聞社のことば ⑩（2級）
field|n|fields|野原
quarter|n||4分の1
border|n||国境
burglar|n||夜盗
# jn4_017 | 新聞社のことば ⑪（2級）
cabinet|n||内閣・戸棚
capture|v|captures|撮る・捉える
ceasefire|n||停戦
chase|n||追跡
# jn4_018 | 新聞社のことば ⑫（2級）
chip|n||切れ端
claw|n||爪
cliff|n|cliffs|崖
coalition|n||連立
# jn4_019 | 新聞社のことば ⑬（2級）
crab|n||カニ
create|v|creates|創造する
cross|v||渡る・越える
debate|n|debates|討論
# jn4_020 | 新聞社のことば ⑭（2級）
deserve|v|deserves|～に値する
develop|v|develops|発達する
distant|a||遠い
embassy|n||大使館
# jn4_021 | 新聞社のことば ⑮（2級）
endangered|a||絶滅寸前の
gather|v||集める
glacier|n||氷河
innocent|a||無罪の
# jn4_022 | 新聞社のことば ⑯（2級）
nation|n|nations|国家
nest|n|nesting|巣
net|a|nets|正味の
protester|n|protesters|抗議者
# jn4_023 | 新聞社のことば ⑰（2級）
refugee|n|refugees|難民
shake|v|shakes|揺らす・揺れる
supermarket|n||スーパーマーケット
telescope|n||望遠鏡
# jn4_024 | 新聞社のことば ⑱（2級）
theft|n||窃盗
troop|n|troops|軍隊
urge|v||強く促す
wage|n|wages|賃金
# jn4_025 | 新聞社のことば ⑲（2級）
whale|n|whales|クジラ
fare|n||運賃
editorial|n|editorials|社説
# jn5_026 | 新聞社のことば 1（準1級）
jury|n||陪審
shopkeeper|n|shopkeepers|店主
opposite|a||反対の
spokeswoman|n|spokeswoman's|女性の広報担当者
# jn5_027 | 新聞社のことば 2（準1級）
misleading|a||誤解を招く
photographer|n||写真をとる人
defendant|n||被告
guilty|a||有罪の
# jn5_028 | 新聞社のことば 3（準1級）
plea|n||答弁・嘆願
reservoir|n||貯水池
auction|n||競売
education|n||教育
# jn5_029 | 新聞社のことば 4（準1級）
advertise|v||広告する
rival|n|rival's,rivals|ライバル
column|n||コラム・縦の欄
narrowly|d||かろうじて
# jn5_030 | 新聞社のことば 5（準1級）
divide|v|divides|分ける
hide|v|hid|隠す
quotation|n||引用
feature|n|features|特徴
# jn5_031 | 新聞社のことば 6（準1級）
ambassador|n||大使
batch|n||ひとまとまり
breakthrough|n||大発見
captain|n||船長
# jn5_032 | 新聞社のことば 7（準1級）
championship|n||選手権
crew|n||乗組員
defeat|n||敗北
documentary|n||ドキュメンタリー
# jn5_033 | 新聞社のことば 8（準1級）
flee|v||逃げる
harmful|a||有害な
host|v||主催する
national|a||国の
# jn5_034 | 新聞社のことば 9（準1級）
prosecutor|n|prosecutors|検察官
redundant|a||余剰の・解雇される
runner|n||走者
sailing|n||帆走
# jn5_035 | 新聞社のことば 10（準1級）
shortage|n||不足
summit|n||首脳会談・頂上
tour|n||ツアー
tourist|n||旅行者
# jn5_036 | 新聞社のことば 11（準1級）
treaty|n||条約
triumph|n||勝利
union|n||組合
percentage|n|percentages|割合
# jn5_037 | 新聞社のことば 12（準1級）
announcement|n||発表
acre|n|acres|エーカー（面積の単位）
adopt|v||採用する
airport|n||空港
# jn5_038 | 新聞社のことば 13（準1級）
archaeologist|n|archaeologists|考古学者
arson|n||放火
biologist|n|biologists|生物学者
chemist|n|chemists|化学者
# jn5_039 | 新聞社のことば 14（準1級）
choice|n||選択
clash|n||衝突
compromise|n||妥協
conservationist|n|conservationists|自然保護活動家
# jn5_040 | 新聞社のことば 15（準1級）
constitution|n||憲法
currency|n||通貨
delegation|n||代表団
destroy|v|destroys|破壊する
# jn5_041 | 新聞社のことば 16（準1級）
detective|n||刑事
diplomat|n||外交官
dissolve|v|dissolves|溶かす
eclipse|n||日食・月食
# jn5_042 | 新聞社のことば 17（準1級）
embezzlement|n||横領
envoy|n||使節
erosion|n||浸食
evasion|n||回避
# jn5_043 | 新聞社のことば 18（準1級）
expel|v|expelled|追放する
famine|n||飢饉
fighting|n||戦闘
firm|n|firm's|会社
# jn5_044 | 新聞社のことば 19（準1級）
governor|n||知事
hollow|a||空洞の
import|v|imported,imports|輸入する
increase|v||増える
# jn5_045 | 新聞社のことば 20（準1級）
investment|n||投資
investor|n|investors|投資者
launch|v|launches|始める・発売する
lawmaker|n|lawmakers|立法者
# jn5_046 | 新聞社のことば 21（準1級）
legislature|n||立法府
lifeboat|n||救命ボート
negotiator|n|negotiators|交渉人
neuroscientist|n|neuroscientists|神経科学者
# jn5_047 | 新聞社のことば 22（準1級）
obesity|n||肥満
observatory|n||観測所
perform|v||行う・演じる
plead|v|pleaded,pleads|答弁する・懇願する
# jn5_048 | 新聞社のことば 23（準1級）
prototype|n||原型
rebel|n|rebels|反逆者
resolution|n||決議・決心
retailer|n||小売業者
# jn5_049 | 新聞社のことば 24（準1級）
reveal|v|reveals|明らかにする
seaweed|n||海草
seize|v||奪う・つかむ
sheep|n||羊
# jn5_050 | 新聞社のことば 25（準1級）
shipbuilder|n||造船業者
shipyard|n||造船所
smuggle|v|smuggling|密輸する
spy|v|spying|スパイをする
# jn5_051 | 新聞社のことば 26（準1級）
stew|n||シチュー
takeover|n||乗っ取り
tank|n|tanker|タンク
tern|n|terns|アジサシ（海鳥）
# jn5_052 | 新聞社のことば 27（準1級）
testimony|n||証言
threaten|v|threatens|脅す
trap|v|trapped|閉じ込める
treasurer|n|treasurer's|会計係
# jn5_053 | 新聞社のことば 28（準1級）
unearth|v||掘り出す
veto|v|vetoes|拒否権を行使する
victim|n|victim's,victims|被害者
waterfront|n||海辺の地区
# jn5_054 | 新聞社のことば 29（準1級）
wetland|n|wetlands|湿地
worth|a||～の価値がある
shorten|v|shortened|短くする
unhappy|a||不幸な
# jn5_055 | 新聞社のことば 30（準1級）
columnist|n||コラムニスト
unimportant|a||重要でない
subscriber|n||定期購読者
subscription|n||定期購読
# jn5_056 | 新聞社のことば 31（準1級）
widely|d||広く
doubt|n|doubts|疑い
daily|a||毎日の
healthy|a|healthier|健康な
# jn5_057 | 新聞社のことば 32（準1級）
turbine|n|turbines|タービン
plaintiff|n||原告
sue|v|suing|訴える
fraud|n||詐欺
# jn6_058 | 新聞社のことば 1（1級）
lawsuit|n||訴訟
prison|n||刑務所
lead|v||先頭に立つ・（記事を）トップにする
# jn6_059 | 新聞社のことば 2（1級）
jail|n|jailed|刑務所
county|n||郡
connection|n||つながり
recession|n||景気後退
bankrupt|a||破産した
# jn6_060 | 新聞社のことば 3（1級）
hardly|d||ほとんど～ない
shout|v||叫ぶ
link|n||つながり
pesticide|n|pesticides|農薬
# jn6_061 | 新聞社のことば 4（1級）
collision|n||衝突
obituary|n|obituaries|死亡記事
celebrate|v|celebrates|祝う
hundredth|a||100番目の
# jn6_062 | 新聞社のことば 5（1級）
impression|n||印象
unreasonable|a||不合理な
law|n||法律
retreat|n||撤退
# jn6_063 | 新聞社のことば 6（1級）
dawn|n||夜明け
rescue|n||救助
phrase|n||句
timeline|n||年表
# jn6_064 | 新聞社のことば 7（1級）
peace|n||平和
turtle|n|turtles|カメ
text|n||本文
flourish|v||栄える
# jn6_065 | 新聞社のことば 8（1級）
suppose|v||思う
scandal|n||醜聞
merger|n||合併
quota|n||割当
# jn6_066 | 新聞社のことば 9（1級）
libel|n||名誉毀損（文書による）
congratulate|v|congratulates|お祝いを言う
powerful|a||強力な
acclaim|v||称賛する
# jn6_067 | 新聞社のことば 10（1級）
accountable|a||説明責任のある
agency|n|agencies|機関・代理店
amid|p||〜の真っただ中で
astronomer|n|astronomers|天文学者
# jn6_068 | 新聞社のことば 11（1級）
austerity|n||緊縮
award|v|awarded|授与する・与える
bail|n||保釈
blacksmith|n||鍛冶屋
# jn6_069 | 新聞社のことば 12（1級）
bribery|n||贈収賄
burst|v|bursts|破裂する
caution|n||用心
chemical|n|chemicals|化学物質
# jn6_070 | 新聞社のことば 13（1級）
constitutional|a||憲法上の
controversial|a||議論を呼ぶ
convict|v|convicts|有罪判決を下す
crisis|n||危機
# jn6_071 | 新聞社のことば 14（1級）
debut|n||デビュー
decade|n||10年間
divided|a||分かれた
dividend|n||配当金
# jn6_072 | 新聞社のことば 15（1級）
evacuate|v|evacuated|避難させる
extinction|n||絶滅
funeral|n||葬式
gain|n|gains|増加
# jn6_073 | 新聞社のことば 16（1級）
generation|n|generations|世代
habitat|n||生息地
humanitarian|a||人道的な
incumbent|n||現職者
# jn6_074 | 新聞社のことば 17（1級）
keeper|n||番人
oyster|n||カキ
pandemic|n||世界的大流行
peacefully|d||平和的に
# jn6_075 | 新聞社のことば 18（1級）
praise|n||賞賛
push|v|pushes|押す
recall|v|recalled|呼び戻す・思い出す
reflect|v||よく考える・反射する
# jn6_076 | 新聞社のことば 19（1級）
repayment|n||返済
restraint|n||抑制
resume|v||再び始める
retrospective|n||回顧展
# jn6_077 | 新聞社のことば 20（1級）
sanction|n|sanctions|制裁
shell|v|shelled,shelling|砲撃する
swim|n||水泳
toward|p|towards|～の方へ
# jn6_078 | 新聞社のことば 21（1級）
trader|n|traders|取引業者
transparency|n||透明性
tribute|n||賛辞
unfashionable|a||流行遅れの
# jn6_079 | 新聞社のことば 22（1級）
volatile|a||不安定な
warrant|n||令状
accurately|d||正確に
acquit|v|acquitted|無罪とする
# jn6_080 | 新聞社のことば 23（1級）
activist|n|activists|活動家
amnesty|n||恩赦
analyst|n|analysts|分析者
bankruptcy|n||破産
# jn6_081 | 新聞社のことば 24（1級）
biodiversity|n||生物多様性
canvas|n|canvases|キャンバス・画布
cartel|n||カルテル
chain|v||鎖でつなぐ
# jn6_082 | 新聞社のことば 25（1級）
chronicle|v|chronicled|記録する
complacency|n||自己満足
conviction|n||有罪判決
curb|v||抑える
# jn6_083 | 新聞社のことば 26（1級）
deadlock|n||行き詰まり
defence|n||防衛・擁護・弁護側
deliberate|v|deliberates|熟考する・評議する
dismiss|v|dismissed|却下する・解雇する
# jn6_084 | 新聞社のことば 27（1級）
dump|v|dumping|投棄する
enemy|n||敵
epidemic|n||流行病
estuary|n||河口
# jn6_085 | 新聞社のことば 28（1級）
existence|n||存在
extradite|v|extradited|（犯罪人を）引き渡す
fairness|n||公平さ
forge|v|forged|偽造する
# jn6_086 | 新聞社のことば 29（1級）
genome|n||ゲノム
geologist|n|geologists|地質学者
impose|v|imposes|課す
inadmissible|a||証拠として認められない
# jn6_087 | 新聞社のことば 30（1級）
irregularity|n|irregularities|不正
legislation|n||立法
lobby|v|lobbying|陳情する・ロビー活動をする
microbe|n||微生物
# jn6_088 | 新聞社のことば 31（1級）
misspell|v|misspelled|つづりを間違える
misstate|v|misstated|事実を誤って述べる
misuse|v|misusing|悪用する
moral|a||道徳的な
# jn6_089 | 新聞社のことば 32（1級）
mourn|v|mourned|悼む
omit|v|omitted|省略する
opponent|n|opponents|相手
paramedic|n|paramedics|救急救命士
# jn6_090 | 新聞社のことば 33（1級）
parliament|n||議会
peer|n||同等の人
physicist|n|physicists|物理学者
poacher|n|poachers|密猟者
# jn6_091 | 新聞社のことば 34（1級）
prosecution|n||起訴
ratify|v|ratified|批准する
redundancy|n|redundancies|余剰人員の解雇・冗長
refinery|n||精製所
# jn6_092 | 新聞社のことば 35（1級）
renewable|a||再生可能な
reshuffle|n||内閣改造
resist|v||抵抗する
rural|a||田舎の
# jn6_093 | 新聞社のことば 36（1級）
scrutiny|n||綿密な調査
senator|n||上院議員
sequence|v||（遺伝子を）解読する・連続
steel|n||鋼鉄
# jn6_094 | 新聞社のことば 37（1級）
sugary|a||糖分の多い
supply|v|supplies|供給する
swamp|v||水浸しにする・沼地
tumble|v||急落する・転ぶ
# jn6_095 | 新聞社のことば 38（1級）
unjust|a||不当な
unstable|a||不安定な
widen|v|widens|広げる
wiretap|n||盗聴
# jn6_096 | 新聞社のことば 39（1級）
bribe|v|bribed|賄賂を贈る
lawful|a|lawfully|合法の
producer|n||生産者
saving|n||節約・貯金
# jn6_097 | 新聞社のことば 40（1級）
inflammatory|a||扇動的な
fairly|d||公平に・かなり
cheer|v||歓声をあげる
allegation|n|allegations|(根拠のない)申し立て
# jn6_098 | 新聞社のことば 41（1級）
remark|n|remarks|発言・意見
vague|a||あいまいな
kill|v|killed,kills|殺す
resignation|n||辞職
`;
const EXTRA_FORMS: Record<string, string[]> = {"ad":["ads"],"girl":["girls"],"job":["jobs"],"monday":["Monday's","monday's","mondays"],"tuesday":["Tuesday's","tuesday's","tuesdays"],"in_saturday":["Saturday's","saturday's","saturdays"],"open":["opening"],"tomorrow":["tomorrow's"],"complete":["completes"],"yesterday":["yesterday's"],"school":["schools"],"doctor":["doctors"],"go":["gone"],"look":["looked"],"fall":["fallen","falling","falls"],"agree":["agrees"],"friday":["Friday's","friday's","fridays"],"sell":["selling","sold"],"retire":["retired"],"today":["today's"],"large":["larger"],"company":["company's"],"your":["yours"],"expect":["expected","expects"],"review":["reviewed"],"in_long":["longest"],"spend":["spending"],"old":["older"],"record":["recording"],"last":["lasted"],"in_end":["ended"],"welcome":["welcomed","welcomes"],"fish":["fished","fishing"],"water":["waters"],"clear":["cleared"],"in_question":["questioned"],"start":["starting"],"claim":["claimed","claiming"],"is":["bees"],"family":["family's"],"rule":["ruled","ruling"],"house":["houses","housing"],"face":["faces","facing"],"reject":["rejects"],"damage":["damages"],"report":["reported","reporting","reports"],"safe":["saves"],"home":["homes"],"child":["children's"],"spread":["spreading"],"warm":["warmer"],"rise":["risen","rises","rising"],"break":["broke"],"park":["parks"],"propose":["proposes"],"candidate":["candidates"],"slow":["slowing","slows"],"melt":["melting"],"case":["cases"],"neighbour":["neighbouring","neighbours"],"unit":["united"],"clean":["cleaned","cleaner","cleans"],"force":["forces","forcing"],"worry":["worries"],"bank":["banks"],"town":["town's"],"inn":["inns"],"result":["results"],"begin":["begins"],"club":["club's"],"in_sit":["sites"],"spoil":["spoils"],"sea":["seas"],"declare":["declared","declares"],"announce":["announces"],"receive":["receives"],"file":["filed"],"form":["formed"],"strike":["striking"],"in_museum":["museum's"],"board":["board's"],"fine":["fined"],"patient":["patients'"],"control":["controls"],"great":["greatest"],"excuse":["excuses"],"in_guide":["guided"],"hundred":["hundreds"],"finish":["finishing"],"correct":["correcting"],"they":["theirs"],"apply":["applied"],"employ":["employed"],"in_explain":["explaining"],"inform":["informed"],"ask":["asking"],"accept":["accepts"],"cover":["covering"],"week":["week's"],"take":["takings"],"draw":["drawing"],"read":["reading"],"estimate":["estimated"],"follow":["followed"],"own":["owned"],"show":["shown"],"will":["willing"],"contact":["contacting"],"client":["client's"],"interview":["interviewed"],"submit":["submitted"],"teacher":["teachers"],"speak":["speaking"],"in_side":["sided"],"harbour":["harbour's"],"miss":["missing"],"soon":["sooner"],"quote":["quoted"],"wednesday":["Wednesday's"],"thursday":["Thursday's"],"sunday":["Sunday's"]};
// generated by tools/tags.ts: phrases (phrases.json ids) and grammar points (grammar.json ids) found in the task's own texts
const TAGS: Record<string, { p?: string[]; g?: string[] }> = {"n1_first":{"p":["ph-5-0002"],"g":["gr-5-011"]},"n1_photo":{"p":["ph-5-0159"],"g":["gr-5-011"]},"n1_time":{"p":["ph-5-0133"],"g":["gr-5-013","gr-5-015"]},"n1_sport":{"p":["ph-3-0116"],"g":["gr-5-013"]},"n1_age":{"g":["gr-5-011"]},"n1_sunday":{"g":["gr-5-013","gr-5-014"]},"n1_hale":{"p":["ph-5-0014","ph-5-0132"],"g":["gr-5-017"]},"n1_grant":{"g":["gr-5-011"]},"n1_plan":{"p":["ph-5-0159"],"g":["gr-5-013","gr-5-011"]},"n1_ad":{"g":["gr-5-013","gr-5-014"]},"n1_more":{"p":["ph-5-0132","ph-5-0159"],"g":["gr-4-002","gr-5-011"]},"n1_boys":{"g":["gr-5-011"]},"n1_office":{"p":["ph-5-0023","ph-5-0132"],"g":["gr-3-005","gr-4-026"]},"n1_caption":{"p":["ph-5-0132"],"g":["gr-5-013"]},"n1_tan":{"g":["gr-5-011"]},"n1_headline":{"p":["ph-5-0132"],"g":["gr-5-013"]},"n1_ok":{"g":["gr-5-011"]},"n1_visit":{"p":["ph-5-0023"],"g":["gr-5-015","gr-5-011"]},"n1_letters":{"p":["ph-5-0023","ph-5-0081"],"g":["gr-4-008","gr-5-011"]},"n2_sort1":{"g":["gr-4-002","gr-5-011"]},"n2_visitors":{"g":["gr-5-017","gr-5-011"]},"n2_tickets":{"g":["gr-pre2-015","gr-4-002"]},"n2_accident":{"g":["gr-5-017","gr-5-011"]},"n2_winner":{"g":["gr-5-013"]},"n2_temp":{"g":["gr-5-011"]},"n2_mayor":{"p":["ph-5-0014"],"g":["gr-4-002","gr-5-015"]},"n2_plan":{"p":["ph-5-0159"],"g":["gr-4-019","gr-5-013"]},"n2_sort2":{"p":["ph-5-0132"],"g":["gr-5-011"]},"n2_library":{"g":["gr-4-002","gr-5-013"]},"n2_ok":{"g":["gr-4-002"]},"n2_wrongday":{"g":["gr-pre2-006","gr-3-005"]},"n2_ad":{"p":["ph-3-0137"],"g":["gr-5-011"]},"n2_year":{"g":["gr-5-013","gr-5-014"]},"n2_quote":{"p":["ph-5-0132"],"g":["gr-4-002","gr-5-011"]},"n2_correct":{"g":["gr-4-002","gr-4-019"]},"n2_sort3":{"p":["ph-5-0159"],"g":["gr-5-011"]},"n2_late":{"p":["ph-5-0039"],"g":["gr-pre2-056","gr-4-002"]},"n2_headline2":{"g":["gr-4-002","gr-5-013"]},"n3_vote":{"g":["gr-5-011"]},"n3_hale":{"p":["ph-3-0170"],"g":["gr-3-014","gr-4-003"]},"n3_trial":{"p":["ph-5-0002"],"g":["gr-5-011"]},"n3_headline1":{"g":["gr-2-030","gr-3-005"]},"n3_ribbon":{"p":["ph-5-0159"],"g":["gr-5-011"]},"n3_hospital":{"p":["ph-4-0140"],"g":["gr-4-002"]},"n3_plan1":{"p":["ph-5-0159"],"g":["gr-4-019"]},"n3_fish":{"g":["gr-3-030"]},"n3_gap1":{"g":["gr-5-013"]},"n3_sort1":{"g":["gr-4-002"]},"n3_exhibit":{"g":["gr-4-007","gr-4-019"]},"n3_quote":{"g":["gr-4-002","gr-4-006"]},"n3_complaint":{"p":["ph-5-0014"],"g":["gr-pre2-006","gr-4-002"]},"n3_budget":{"g":["gr-3-002"]},"n3_caption1":{"g":["gr-5-013"]},"n3_phone2":{"g":["gr-2-056"]},"n3_wonder":{"p":["ph-pre2-0111"],"g":["gr-4-002","gr-4-019"]},"n3_sort2":{"p":["ph-pre2-0016"],"g":["gr-pre2-031","gr-4-020"]},"n3_ok1":{"p":["ph-pre2-0174"],"g":["gr-2-058"]},"n3_contradict1":{"p":["ph-5-0133"],"g":["gr-4-002"]},"n3_reader":{"p":["ph-5-0014"],"g":["gr-3-002","gr-3-014"]},"n3_unemployment":{"p":["ph-2-0159"],"g":["gr-2-056","gr-3-002"]},"n3_headline2":{"p":["ph-2-0159"],"g":["gr-2-056","gr-pre2-006"]},"n3_ok2":{"g":["gr-5-011"]},"n3_review":{"p":["ph-5-0014"],"g":["gr-2-056"]},"n3_sort3":{"p":["ph-pre2-0273"],"g":["gr-pre2-006","gr-4-002"]},"n3_say1":{"p":["ph-5-0061"],"g":["gr-4-002"]},"n3_trial_notes":{"g":["gr-5-011"]},"n3_gap2":{"p":["ph-5-0132"],"g":["gr-pre2-013"]},"n3_say2":{"p":["ph-4-0141"],"g":["gr-4-002","gr-4-007"]},"n3_weather":{"g":["gr-5-011"]},"n3_pollution":{"p":["ph-pre2-0364"],"g":["gr-2-052","gr-pre2-052"]},"n3_plan2":{"p":["ph-5-0159"],"g":["gr-pre2-052","gr-4-019"]},"n3_quote_ask":{"p":["ph-3-0065"],"g":["gr-4-008","gr-4-019"]},"n3_tax":{"g":["gr-2-056","gr-3-002"]},"n3_phone3":{"p":["ph-4-0141"],"g":["gr-3-002","gr-4-002"]},"n3_contradict2":{"p":["ph-pre2-0202","ph-3-0103"],"g":["gr-4-002","gr-4-003"]},"n3_sort4":{"p":["ph-3-0170"],"g":["gr-4-002","gr-4-020"]},"n3_hale2":{"p":["ph-3-0083","ph-3-0159"],"g":["gr-pre2-061","gr-4-002"]},"n3_sport":{"g":["gr-5-011"]},"n3_gap3":{"g":["gr-pre2-033","gr-4-019"]},"n3_caption2":{"g":["gr-5-013"]},"n3_say3":{"p":["ph-5-0051"],"g":["gr-5-015"]},"n3_age":{"g":["gr-5-011"]},"n3_sort5":{"p":["ph-5-0103"],"g":["gr-4-002"]},"n4_inquiry":{"g":["gr-4-002"]},"n4_deficit":{"p":["ph-3-0103"],"g":["gr-pre2-050","gr-pre2-015"]},"n4_sort1":{"p":["ph-4-0128"],"g":["gr-3-030"]},"n4_hale":{"p":["ph-5-0132"],"g":["gr-4-003"]},"n4_survey":{"g":["gr-2-056","gr-3-002"]},"n4_phone1":{"p":["ph-4-0141"],"g":["gr-3-002"]},"n4_headline1":{"g":["gr-3-002","gr-3-014"]},"n4_plan1":{"p":["ph-5-0159"],"g":["gr-5-013"]},"n4_quote":{"p":["ph-pre2-0241"],"g":["gr-2-030","gr-pre2-006"]},"n4_contradict1":{"p":["ph-5-0132"],"g":["gr-2-056","gr-3-005"]},"n4_source":{"g":["gr-3-005"]},"n4_sort2":{"p":["ph-5-0103"],"g":["gr-pre2-006"]},"n4_waiting":{"g":["gr-3-002"]},"n4_complaint":{"p":["ph-3-0159"],"g":["gr-pre2-031","gr-pre2-006"]},"n4_phone2":{"p":["ph-4-0141"],"g":["gr-pre2-031","gr-3-005"]},"n4_correct":{"p":["ph-3-0159"],"g":["gr-pre2-006"]},"n4_reader1":{"g":["gr-2-056","gr-pre2-006"]},"n4_sort3":{"p":["ph-5-0166"],"g":["gr-4-002"]},"n4_percent":{"g":["gr-2-056"]},"n4_say1":{"g":["gr-2-030","gr-pre2-064"]},"n4_caption":{"g":["gr-3-005"]},"n4_headline2":{"g":["gr-pre2-065","gr-3-002"]},"n4_budget":{"g":["gr-3-002"]},"n4_reader2":{"g":["gr-2-045"]},"n4_sort4":{"p":["ph-pre2-0364"],"g":["gr-3-007"]},"n4_phone3":{"p":["ph-pre2-0092","ph-pre2-0289"],"g":["gr-5-011"]},"n4_ok2":{"g":["gr-pre2-031"]},"n4_condition":{"p":["ph-pre1-0448","ph-2-0152"],"g":["gr-3-018"]},"n4_dates":{"g":["gr-5-011"]},"n4_contradict2":{"p":["ph-5-0132"],"g":["gr-4-002"]},"n4_say2":{"p":["ph-5-0061"],"g":["gr-4-002"]},"n4_plan2":{"p":["ph-2-0164"],"g":["gr-2-019","gr-pre2-015"]},"n4_survey2":{"g":["gr-2-056"]},"n4_headline3":{"g":["gr-2-056","gr-3-005"]},"n4_sort5":{"g":["gr-pre2-006"]},"n4_reader3":{"p":["ph-pre2-0202"],"g":["gr-pre2-052","gr-pre2-006"]},"n4_trial":{"g":["gr-5-011"]},"n4_say3":{"p":["ph-5-0014"],"g":["gr-4-002"]},"n4_quote2":{"g":["gr-3-002"]},"n4_gap1":{"g":["gr-2-023","gr-pre2-033"]},"n4_phone4":{"p":["ph-4-0131"],"g":["gr-2-056"]},"n4_review":{"g":["gr-4-019"]},"n4_ok3":{"p":["ph-pre2-0174"],"g":["gr-2-058"]},"n4_sort6":{"g":["gr-3-002","gr-3-007"]},"n5_lawsuit":{"p":["ph-4-0096"],"g":["gr-pre2-006","gr-pre2-034"]},"n5_verdict":{"g":["gr-2-030"]},"n5_sort1":{"g":["gr-3-002"]},"n5_apology":{"p":["ph-pre1-0448","ph-2-0152"],"g":["gr-1-032"]},"n5_recount":{"g":["gr-5-011"]},"n5_phone1":{"p":["ph-pre1-0297"],"g":["gr-pre1-016","gr-pre2-031"]},"n5_headline1":{"g":["gr-pre1-024"]},"n5_plan1":{"p":["ph-5-0159"],"g":["gr-4-002"]},"n5_contradict1":{"g":["gr-pre2-028","gr-pre2-001"]},"n5_reader1":{"g":["gr-1-004","gr-2-015"]},"n5_sort2":{"g":["gr-4-002"]},"n5_bankruptcy":{"g":["gr-2-056"]},"n5_source":{"p":["ph-pre1-0448"],"g":["gr-pre2-056"]},"n5_quote":{"p":["ph-pre1-0185"],"g":["gr-pre2-006"]},"n5_gap1":{"g":["gr-1-030"]},"n5_headline2":{"g":["gr-2-056"]},"n5_phone2":{"p":["ph-2-0029"],"g":["gr-3-002"]},"n5_complaint":{"p":["ph-3-0019"],"g":["gr-pre2-006","gr-pre2-010"]},"n5_age":{"g":["gr-5-011"]},"n5_contradict2":{"g":["gr-2-052","gr-pre2-052"]},"n5_sort3":{"g":["gr-pre2-015"]},"n5_say1":{"g":["gr-1-004","gr-2-015"]},"n5_pension":{"g":["gr-2-056"]},"n5_reader2":{"p":["ph-3-0159"],"g":["gr-2-016","gr-pre2-031"]},"n5_headline3":{"g":["gr-pre2-006","gr-pre2-061"]},"n5_caption":{"g":["gr-4-019"]},"n5_gap2":{"g":["gr-1-004","gr-2-015"]},"n5_phone3":{"p":["ph-4-0141"],"g":["gr-3-005"]},"n5_plan2":{"p":["ph-5-0159"],"g":["gr-3-005"]},"n5_say2":{"p":["ph-3-0154"],"g":["gr-pre2-001","gr-pre2-010"]},"n5_deficit":{"g":["gr-5-011"]},"n5_reader3":{"g":["gr-1-018","gr-pre2-006"]},"n5_sort4":{"g":["gr-4-002"]},"n5_ok2":{"p":["ph-3-0159"],"g":["gr-3-005"]},"n5_review":{"p":["ph-pre1-0452"],"g":["gr-2-012","gr-pre2-056"]},"n5_contradict3":{"p":["ph-4-0096"],"g":["gr-2-056","gr-pre2-031"]},"n5_poll":{"g":["gr-2-056"]},"n5_gap3":{"g":["gr-3-002"]},"n5_say3":{"g":["gr-3-002"]},"n5_phone4":{"p":["ph-2-0226"],"g":["gr-pre2-006"]},"n5_headline4":{"g":["gr-pre1-016","gr-2-030"]},"n5_tax":{"g":["gr-2-056","gr-pre2-056"]},"n5_sort5":{"g":["gr-1-025","gr-pre2-006"]},"n5_anniversary":{"g":["gr-pre2-061"]},"news1#0":{"p":["ph-5-0081"],"g":["gr-4-002","gr-4-008"]},"news1#1":{"p":["ph-5-0025"]},"news1#2":{"p":["ph-5-0014"],"g":["gr-4-002"]},"news1#3":{"p":["ph-5-0014"]},"news1#5":{"g":["gr-4-002"]},"news1#7":{"p":["ph-5-0085"],"g":["gr-5-015"]},"news1#8":{"p":["ph-5-0039","ph-5-0014"],"g":["gr-5-011"]},"mail1#0":{"p":["ph-5-0014"]},"mail1#1":{"g":["gr-5-017"]},"mail1#2":{"g":["gr-4-002"]},"mail1#3":{"p":["ph-5-0023","ph-5-0128"]},"mail1#4":{"p":["ph-5-0023","ph-5-0081"],"g":["gr-4-008","gr-5-015"]},"mail1#5":{"g":["gr-5-017"]},"news2#0":{"g":["gr-4-002","gr-4-007"]},"news2#1":{"g":["gr-4-019","gr-5-013"]},"news2#2":{"g":["gr-5-011"]},"news2#3":{"p":["ph-5-0061"],"g":["gr-4-002","gr-5-015"]},"news2#4":{"p":["ph-5-0081"],"g":["gr-4-008"]},"news2#5":{"g":["gr-3-030"]},"news2#6":{"p":["ph-5-0014"],"g":["gr-4-002"]},"news2#7":{"p":["ph-4-0140"]},"news2#8":{"p":["ph-5-0014"],"g":["gr-5-017"]},"phone2#0":{"p":["ph-5-0002"],"g":["gr-4-008","gr-5-013"]},"phone2#1":{"g":["gr-4-002","gr-5-016"]},"phone2#2":{"p":["ph-pre2-0312"],"g":["gr-5-015"]},"phone2#3":{"g":["gr-4-002","gr-5-011"]},"phone2#4":{"p":["ph-5-0085"],"g":["gr-4-002","gr-5-015"]},"phone2#5":{"p":["ph-5-0014"],"g":["gr-5-017"]},"phone2#6":{"g":["gr-4-002"]},"phone2#7":{"p":["ph-5-0023"],"g":["gr-5-015","gr-5-011"]},"mail2#0":{"p":["ph-5-0014"],"g":["gr-4-002","gr-5-017"]},"mail2#1":{"p":["ph-5-0023"],"g":["gr-4-006","gr-4-007"]},"mail2#2":{"p":["ph-5-0014"],"g":["gr-4-002"]},"mail2#3":{"p":["ph-5-0039"],"g":["gr-4-002","gr-5-011"]},"mail2#4":{"p":["ph-5-0132"],"g":["gr-5-017","gr-5-020"]},"mail2#5":{"p":["ph-5-0014"],"g":["gr-4-002"]},"mail2#6":{"g":["gr-4-002"]},"news3#0":{"g":["gr-4-007"]},"news3#1":{"p":["ph-pre2-0111"],"g":["gr-4-002","gr-4-019"]},"news3#2":{"p":["ph-2-0272","ph-pre2-0157"],"g":["gr-4-002"]},"news3#3":{"p":["ph-2-0494","ph-2-0495"],"g":["gr-4-019"]},"news3#4":{"g":["gr-pre2-052","gr-4-002"]},"news3#5":{"g":["gr-5-013"]},"news3#6":{"g":["gr-2-052"]},"news3#8":{"g":["gr-pre2-052","gr-4-002"]},"news3#9":{"p":["ph-5-0014"],"g":["gr-5-017"]},"phone3#0":{"g":["gr-5-016"]},"phone3#1":{"p":["ph-2-0252","ph-2-0468"],"g":["gr-3-014"]},"phone3#2":{"p":["ph-5-0014"],"g":["gr-2-030","gr-pre2-064"]},"phone3#3":{"g":["gr-4-002","gr-4-007"]},"phone3#4":{"p":["ph-2-0272"],"g":["gr-pre2-034","gr-4-019"]},"phone3#5":{"p":["ph-5-0014"],"g":["gr-4-002"]},"phone3#6":{"p":["ph-4-0051"],"g":["gr-4-002"]},"phone3#7":{"p":["ph-5-0014"],"g":["gr-2-052","gr-4-007"]},"mail3#0":{"p":["ph-5-0014"],"g":["gr-4-007"]},"mail3#1":{"p":["ph-5-0014"],"g":["gr-5-015"]},"mail3#2":{"p":["ph-pre2-0030"],"g":["gr-4-002","gr-4-015"]},"mail3#3":{"p":["ph-5-0014"],"g":["gr-4-002","gr-4-019"]},"mail3#4":{"g":["gr-pre2-006","gr-4-002"]},"mail3#5":{"p":["ph-5-0014"],"g":["gr-4-002"]},"mail3#6":{"g":["gr-3-002"]},"mail3#7":{"p":["ph-5-0014"],"g":["gr-pre2-064","gr-3-005"]},"letter3#0":{"p":["ph-5-0014"],"g":["gr-4-002","gr-4-020"]},"letter3#1":{"g":["gr-4-002"]},"letter3#2":{"p":["ph-2-0149"],"g":["gr-2-043","gr-4-002"]},"letter3#3":{"g":["gr-pre2-015","gr-3-005"]},"letter3#4":{"p":["ph-2-0462"],"g":["gr-3-002","gr-3-005"]},"letter3#5":{"p":["ph-5-0014"],"g":["gr-2-056","gr-pre2-006"]},"gap3#0":{"g":["gr-3-005","gr-4-026"]},"gap3#1":{"g":["gr-4-002"]},"gap3#2":{"g":["gr-pre2-013"]},"gap3#3":{"g":["gr-pre2-033","gr-3-005"]},"gap3#4":{"g":["gr-4-019"]},"gap3#5":{"g":["gr-4-002"]},"gap3#6":{"g":["gr-5-017"]},"gap3#7":{"p":["ph-pre2-0241"],"g":["gr-2-030","gr-3-005"]},"gap3#8":{"g":["gr-3-033"]},"gap3#9":{"g":["gr-3-002","gr-3-021"]},"gap3#11":{"g":["gr-2-030","gr-3-005"]},"proof3#0":{"p":["ph-5-0132"],"g":["gr-2-030","gr-3-005"]},"proof3#1":{"g":["gr-5-017"]},"proof3#2":{"g":["gr-pre2-050","gr-3-005"]},"proof3#4":{"g":["gr-2-056"]},"proof3#5":{"g":["gr-4-002"]},"news4#0":{"g":["gr-2-030","gr-pre2-006"]},"news4#1":{"p":["ph-3-0170"],"g":["gr-3-014"]},"news4#2":{"p":["ph-2-0272"],"g":["gr-pre2-065","gr-3-002"]},"news4#3":{"p":["ph-5-0014"],"g":["gr-4-002"]},"news4#4":{"p":["ph-5-0014"],"g":["gr-2-056"]},"news4#5":{"p":["ph-pre2-0363"],"g":["gr-2-052","gr-pre2-052"]},"news4#6":{"p":["ph-5-0128"],"g":["gr-4-002"]},"news4#7":{"p":["ph-4-0096"],"g":["gr-pre2-034"]},"phone4#0":{"p":["ph-2-0048"],"g":["gr-2-066"]},"phone4#1":{"g":["gr-4-002"]},"phone4#2":{"p":["ph-4-0096"],"g":["gr-pre2-065","gr-pre2-034"]},"phone4#3":{"p":["ph-5-0014"],"g":["gr-4-002"]},"phone4#4":{"p":["ph-4-0101"],"g":["gr-4-006"]},"phone4#5":{"p":["ph-5-0055"],"g":["gr-4-002"]},"phone4#6":{"p":["ph-5-0014"],"g":["gr-3-019"]},"phone4#7":{"p":["ph-5-0085"],"g":["gr-2-052"]},"mail4#0":{"p":["ph-2-0017","ph-2-0029"],"g":["gr-pre2-065","gr-3-002"]},"mail4#1":{"p":["ph-2-0024"],"g":["gr-2-052"]},"mail4#2":{"p":["ph-3-0159"],"g":["gr-pre2-001","gr-3-005"]},"mail4#3":{"p":["ph-5-0014"],"g":["gr-4-002"]},"mail4#4":{"p":["ph-5-0014"],"g":["gr-4-002"]},"mail4#5":{"p":["ph-pre2-0193"],"g":["gr-4-002"]},"mail4#6":{"p":["ph-2-0229"],"g":["gr-3-005"]},"mail4#7":{"p":["ph-5-0014"],"g":["gr-3-005"]},"letter4#0":{"p":["ph-5-0014"],"g":["gr-3-002","gr-3-005"]},"letter4#1":{"p":["ph-5-0014"],"g":["gr-4-006"]},"letter4#2":{"g":["gr-pre2-015"]},"letter4#3":{"g":["gr-3-005","gr-3-007"]},"letter4#4":{"g":["gr-2-045","gr-3-002"]},"letter4#5":{"g":["gr-3-002","gr-3-005"]},"gap4#0":{"g":["gr-pre2-001","gr-3-021"]},"gap4#1":{"g":["gr-pre2-029"]},"gap4#2":{"p":["ph-5-0132"],"g":["gr-3-002","gr-3-005"]},"gap4#3":{"p":["ph-2-0398"]},"gap4#4":{"g":["gr-2-015","gr-pre2-010"]},"gap4#5":{"g":["gr-3-005"]},"gap4#6":{"p":["ph-pre2-0297"],"g":["gr-2-043"]},"gap4#7":{"p":["ph-2-0226"],"g":["gr-pre2-033"]},"gap4#9":{"g":["gr-pre1-034","gr-3-002"]},"proof4#0":{"g":["gr-3-005"]},"proof4#1":{"g":["gr-4-002"]},"proof4#2":{"g":["gr-2-056"]},"proof4#3":{"g":["gr-pre2-031","gr-3-007"]},"proof4#4":{"g":["gr-pre2-052","gr-3-002"]},"proof4#5":{"g":["gr-4-002"]},"news5#0":{"g":["gr-1-004","gr-2-015"]},"news5#1":{"p":["ph-5-0132"],"g":["gr-2-001","gr-pre2-001"]},"news5#2":{"p":["ph-pre1-0460"],"g":["gr-2-052"]},"news5#3":{"g":["gr-3-002"]},"news5#4":{"g":["gr-4-002"]},"news5#5":{"p":["ph-2-0272"],"g":["gr-1-018","gr-1-001"]},"news5#6":{"g":["gr-2-023","gr-2-059"]},"news5#7":{"p":["ph-5-0014"],"g":["gr-5-017"]},"phone5#0":{"p":["ph-5-0004"],"g":["gr-2-045"]},"phone5#1":{"p":["ph-5-0014"],"g":["gr-2-030","gr-pre2-064"]},"phone5#2":{"p":["ph-1-0022"],"g":["gr-2-059"]},"phone5#3":{"p":["ph-5-0085"],"g":["gr-pre2-065","gr-pre2-052"]},"phone5#4":{"p":["ph-2-0047"],"g":["gr-pre2-034"]},"phone5#5":{"p":["ph-5-0055"],"g":["gr-1-004","gr-2-015"]},"phone5#6":{"g":["gr-4-020"]},"phone5#7":{"p":["ph-5-0014"],"g":["gr-3-019"]},"mail5#0":{"p":["ph-2-0048"],"g":["gr-2-066"]},"mail5#1":{"p":["ph-2-0471"],"g":["gr-1-006","gr-1-033"]},"mail5#2":{"p":["ph-3-0159"],"g":["gr-pre2-015"]},"mail5#3":{"g":["gr-2-045","gr-pre2-031"]},"mail5#4":{"p":["ph-5-0014"],"g":["gr-pre2-015"]},"mail5#5":{"p":["ph-2-0149"],"g":["gr-2-043","gr-pre2-015"]},"mail5#6":{"p":["ph-pre2-0289"],"g":["gr-3-002"]},"mail5#7":{"p":["ph-2-0017","ph-2-0047"],"g":["gr-2-030","gr-2-052"]},"letter5#0":{"g":["gr-2-043"]},"letter5#1":{"p":["ph-pre1-0452"],"g":["gr-pre2-056"]},"letter5#2":{"g":["gr-5-013"]},"letter5#3":{"p":["ph-5-0014"],"g":["gr-pre2-006"]},"letter5#4":{"p":["ph-1-0079","ph-pre1-0282"],"g":["gr-3-007"]},"letter5#5":{"p":["ph-pre1-0461"],"g":["gr-2-045"]},"gap5#0":{"g":["gr-1-001","gr-2-012"]},"gap5#1":{"g":["gr-5-017"]},"gap5#2":{"g":["gr-1-004","gr-2-015"]},"gap5#3":{"g":["gr-2-043"]},"gap5#4":{"g":["gr-4-020"]},"gap5#5":{"g":["gr-pre2-010"]},"gap5#6":{"g":["gr-pre2-013"]},"gap5#7":{"g":["gr-pre2-029"]},"gap5#8":{"g":["gr-pre2-001"]},"gap5#9":{"g":["gr-5-017"]},"proof5#0":{"g":["gr-2-056","gr-pre2-006"]},"proof5#1":{"g":["gr-2-030"]},"proof5#2":{"g":["gr-2-056","gr-pre2-006"]},"proof5#3":{"g":["gr-5-017"]},"proof5#4":{"g":["gr-pre2-031"]},"proof5#5":{"g":["gr-3-005"]},"nt1_sort":{"p":["ph-3-0116","ph-5-0132"],"g":["gr-5-016","gr-5-011"]},"nt1_age":{"g":["gr-5-011"]},"nt1_place":{"p":["ph-5-0159"],"g":["gr-5-011"]},"nt1_boys":{"g":["gr-5-011"]},"nt1_pad":{"g":["gr-5-011"]},"nt1_plan":{"p":["ph-5-0014","ph-5-0159"],"g":["gr-5-013","gr-5-011"]},"nt1_ask":{"g":["gr-4-002","gr-4-008"]},"nt1_mail":{"g":["gr-5-017","gr-4-002"]},"nt2_sort":{"p":["ph-5-0132"],"g":["gr-pre2-056","gr-4-002"]},"nt2_visitors":{"g":["gr-5-011"]},"nt2_temp":{"g":["gr-5-011"]},"nt2_quote":{"p":["ph-5-0132"],"g":["gr-4-002","gr-5-011"]},"nt2_ad":{"g":["gr-5-011"]},"nt2_pad":{"g":["gr-5-017","gr-5-011"]},"nt2_plan":{"p":["ph-5-0014"],"g":["gr-4-019","gr-5-013"]},"nt2_say":{"g":["gr-4-002","gr-4-007"]},"nt2_phone":{"g":["gr-4-002","gr-5-015"]},"nt2_mail":{"g":["gr-4-002","gr-5-017"]},"nt3_sort":{"p":["ph-2-0159","ph-pre2-0273"],"g":["gr-2-030","gr-2-056"]},"nt3_vote":{"g":["gr-5-017"]},"nt3_budget":{"g":["gr-4-003"]},"nt3_trial":{"g":["gr-5-011"]},"nt3_caption":{"g":["gr-4-006"]},"nt3_tax":{"g":["gr-3-002"]},"nt3_match":{"g":["gr-5-011"]},"nt3_pad":{"p":["ph-4-0141"],"g":["gr-3-002","gr-4-002"]},"nt3_pad2":{"g":["gr-2-056"]},"nt3_plan":{"p":["ph-pre2-0292"],"g":["gr-pre2-052","gr-3-030"]},"nt3_say":{"g":["gr-4-002","gr-4-019"]},"nt3_phone":{"g":["gr-4-002","gr-4-007"]},"nt3_mail":{"g":["gr-4-002","gr-4-007"]},"nt3_letter":{"g":["gr-4-002","gr-3-005"]},"nt3_gap":{"g":["gr-3-005","gr-4-002"]},"nt3_proof":{"g":["gr-3-005","gr-2-030"]},"nt4_sort":{"p":["ph-pre1-0389"],"g":["gr-pre2-050","gr-3-002"]},"nt4_survey":{"g":["gr-3-005"]},"nt4_spending":{"g":["gr-3-002"]},"nt4_inquiry":{"g":["gr-5-011"]},"nt4_dates":{"g":["gr-5-011"]},"nt4_court":{"g":["gr-5-011"]},"nt4_quote":{"g":["gr-3-002"]},"nt4_pad":{"p":["ph-4-0141"],"g":["gr-2-030","gr-pre2-064"]},"nt4_plan":{"p":["ph-5-0014"],"g":["gr-4-003"]},"nt4_say":{"g":["gr-4-002","gr-2-030"]},"nt4_phone":{"g":["gr-4-002","gr-2-066"]},"nt4_mail":{"g":["gr-3-005","gr-4-002"]},"nt4_letter":{"g":["gr-3-002","gr-3-005"]},"nt4_gap":{"g":["gr-3-002","gr-3-005"]},"nt4_proof":{"g":["gr-4-002","gr-3-005"]},"nt5_sort":{"p":["ph-1-0029","ph-pre1-0020"],"g":["gr-pre1-032","gr-2-030"]},"nt5_poll":{"g":["gr-5-011"]},"nt5_accounts":{"g":["gr-5-011"]},"nt5_claim":{"g":["gr-3-002"]},"nt5_recount":{"g":["gr-3-002"]},"nt5_caption":{"g":["gr-2-056"]},"nt5_obit":{"g":["gr-5-011"]},"nt5_pad":{"p":["ph-1-0321"],"g":["gr-3-005"]},"nt5_plan":{"p":["ph-5-0014"],"g":["gr-3-005"]},"nt5_say":{"g":["gr-1-004","gr-2-015"]},"nt5_phone":{"g":["gr-2-045","gr-2-030"]},"nt5_mail":{"g":["gr-pre2-015","gr-2-066"]},"nt5_letter":{"g":["gr-2-043","gr-pre2-056"]},"nt5_gap":{"g":["gr-5-017","gr-1-001"]},"nt5_proof":{"g":["gr-2-056","gr-pre2-006"]},"nt2_sort2":{"p":["ph-3-0116","ph-3-0115"],"g":["gr-pre2-006","gr-3-002"]},"nt3_sort2":{"p":["ph-2-0159","ph-3-0141"],"g":["gr-2-056","gr-pre2-006"]},"nt4_sort2":{"p":["ph-2-0389"],"g":["gr-pre2-050","gr-3-002"]},"nt5_sort2":{"p":["ph-pre1-0163","ph-pre1-0389"],"g":["gr-pre1-024","gr-pre1-032"]}};

// ---------------------------------------------------------------------------------------------- the job

const BANKS: Record<string, QaItem[]> = { ...B1, ...B2, ...B3, ...B4, ...B5 };

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

const SIGN = '{The Harbour Courier|@}';

const EN: JobContent = {
  sign: SIGN,
  lexicon: LEXICON.entries,
  pages: LEXICON.pages,
  forms: EXTRA_FORMS,
  people: [
    { id: 'p_carver', name: 'Ms. Carver', avatar: '👩' },
    { id: 'p_moss', name: 'Mr. Moss', avatar: '👨' },
    { id: 'p_idris', name: 'Ms. Idris', avatar: '👩' },
    { id: 'p_abbott', name: 'Mr. Abbott', avatar: '👨‍🦳' },
    { id: 'p_tan', name: 'Ms. Tan', avatar: '👩' },
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
  ],
  boss: 'p_carver',
  things: [],
  sort: {
    item: 'file',
    bins: SECTIONS,
  },
  tasks: [...R1, ...R2, ...R3, ...R4, ...R5].map(tagged),
  templates: [...T1, ...T2, ...T3, ...T4, ...T5, ...TY].map(tagged),
  qa: Object.fromEntries(Object.entries(BANKS).map(([k, v]) => [k, taggedBank(k, v)])),
  reactions: REACTIONS,
  lines: LINES,
};

export const NEWS_JOB: JobDef = {
  id: 'news',
  nameJa: '新聞社',
  blurbJa: '港町の日刊紙〈ハーバー・クーリエ〉の編集部で働く。配信記事を面（町・スポーツ・経済・政治・事件・科学・環境・文化・意見…）に振り分け、記者のメモと原稿・写真説明を照らし合わせ、読者の手紙や取材先のメールに返事を選び、見出しや校閲（メモと食い違う一文）を選び、電話の伝言と紙面の割り付けをこなす。ニュース・政治・経済・事件と裁判・科学・環境・文化・意見の言葉。英検3級から1級まで、後半に厚み。',
  icon: '📰',
  domains: ['media', 'society', 'law', 'science', 'nature', 'finance', 'arts', 'communication', 'money', 'weather', 'sports'],
  archetypes: ['sort', 'check', 'respond'],
  ranks: [
    { rank: 1, need: { good: 0, words: 0 }, level: { eiken: '3', toeic: 400 }, tasks: 4, noteJa: '写真のメモと説明文、短い記事カードの名前・年齢・日付・数を見比べる。見出しを読んで町・スポーツ・天気の面に振り分ける。掲示を読んで読者に答える。電話の伝言を書く。英検3級。' },
    { rank: 2, need: { good: 12, words: 30 }, level: { eiken: 'pre2', toeic: 600 }, unlocks: ['long'], tasks: 5, reward: { coins: 12 }, noteJa: '面に経済・世界・文化が加わる。メモと記事の食い違い（場所・金額・人数・曜日）。読者の手紙と広告・購読の問い合わせへの返事。割り付けの条件がふたつに。英検準2級。' },
    { rank: 3, need: { good: 24, words: 75 }, level: { eiken: '2', toeic: 730 }, unlocks: ['multiStep', 'audioOnly', 'timed'], tasks: 5, reward: { coins: 20 }, noteJa: '政治・事件と裁判・科学・健康・意見の面。食い違う欄を見つけたら正しい値も選ぶ。見出し・写真説明を選ぶ。メモと矛盾する一文を探す校閲。耳だけの電話。時間制限（選んだときだけ）。英検2級。' },
    { rank: 4, need: { good: 51, words: 140 }, level: { eiken: 'pre1', toeic: 860 }, tasks: 6, reward: { coins: 30 }, noteJa: '議会・予算・調査・環境・社会問題の記事。引用や数字の確認、取材先のメールへの返事、投書の主張を読み取る。長いメモの割り付け条件。英検準1級。' },
    { rank: 5, need: { good: 78, words: 205 }, level: { eiken: '1', toeic: 990 }, tasks: 6, reward: { coins: 50 }, noteJa: '灯台：編集部の右腕。裁判・名誉毀損・訂正記事・社説・声明・条項と数字の食い違いを読み解く。倒置・仮定法・譲歩の文を完成させる問題もある。英検1級。' },
  ],
  wage: { perfect: 4, minor: 2, fail: 0, bad: 0 },
  opensAfter: 3,
  hours: [1, 2],
  building: 'news',
  content: { en: EN },
  flavour: 'school',
};
