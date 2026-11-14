import type { Face } from '../../core/types';
import type { AuthoredTask, CheckDoc, JobContent, JobDef, JobLexEntry, QaItem, TaskFeature, TaskTemplate } from '../../jobs/types';

/**
 * Post office (郵便局), run by Mrs. Wren: sort letters and parcels into the labelled cubbies, serve the
 * counter (stamps, postcards, boxes, change), check a label or a form against what the customer says,
 * and answer questions, phone calls and complaints at the window.
 *
 * Rank ladder (material level): 1 ≈ 英検4級, 2 ≈ 3級・TOEIC〜400, 3 ≈ 準2級・〜500, 4 ≈ 2級・〜600,
 * 5 ≈ 準1級・〜730. Domains: communication, transport, money, shopping, travel, office, housing.
 *
 * How the spine teaches (see README "Jobs: content schema"): each authored task brings at most two
 * words the player has not met in this job, and a new word first stands where a picture (a cubby's
 * drawing, a good on the price board), a label next to its value, the layout, or the customer's reaction
 * to a wrong move makes its meaning inferable. Grammar is not decoration: negation, comparison, "already",
 * conditions, passives and relative clauses decide the right answer at the ranks that introduce them.
 */

// ---------------------------------------------------------------------------- shorthand

const TOM = '{Tom|@}';
const ROSE = '{Grandma Rose|@}';
const JOE = '{Big Joe|@}';
const REED = '{Captain Reed|@}';
const NORA = '{Nora|@}';
const GRANT = '{Mr. Grant|@}';
const HALE = '{Professor Hale|@}';
const ANNA = '{Anna|@}';
const LILY = '{Lily|@}';
const SAM = '{Grandpa Sam|@}';
const LANE = '{Dr. Lane|@}';
const KEN = '{Ken|@}';
const HILL = '{Mrs. Hill|@}';
const IVY = '{Ivy|@}';
const BELL = '{Mr. Bell|@}';

type Meta = { person?: string; features?: TaskFeature[]; grammar?: string[]; phrases?: string[]; weight?: number };
type Pair = [string, string];

/** sort: items as [label, bin] pairs. */
const S = (id: string, rank: number, seq: number, say: string, bins: string[], items: Pair[], m: Meta = {}): AuthoredTask => ({
  id,
  rank,
  seq,
  arch: 'sort',
  say,
  bins,
  items: items.map(([text, bin], i) => ({ id: String.fromCharCode(97 + i), text, bin })),
  ...m,
});

/** trade: wants as [thing, n] pairs; pay = coins on the counter. */
const T = (id: string, rank: number, seq: number, person: string, say: string, want: [string, number][], pay: number, m: Meta = {}): AuthoredTask => ({
  id,
  rank,
  seq,
  arch: 'trade',
  person,
  say,
  want: want.map(([thing, n]) => ({ thing, n })),
  pay,
  ...m,
});

/** One label / form line: [field id, label, value]. */
type Line3 = [string, string, string];
const doc = (kind: CheckDoc['kind'], title: string | undefined, fields: Line3[], lines?: string[]): CheckDoc => ({
  kind,
  ...(title ? { title } : {}),
  ...(fields.length ? { fields: fields.map(([id, label, value]) => ({ id, label, value })) } : {}),
  ...(lines ? { lines } : {}),
});

/** check: what the person says (+ optional reference papers) against the paper to mark. `wrong` = the field that disagrees (null = all fine). */
const C = (
  id: string,
  rank: number,
  seq: number,
  person: string,
  say: string,
  docs: CheckDoc[],
  target: number,
  wrong: string | null,
  m: Meta & { fixOptions?: string[]; fix?: string } = {},
): AuthoredTask => ({ id, rank, seq, arch: 'check', person, say, docs, target, wrong, ...m });

/** respond (choose a reply): the question, the options, the index of the right one. */
const Q = (id: string, rank: number, seq: number, person: string, q: string, options: string[], answer: number, m: Meta = {}): AuthoredTask => ({
  id,
  rank,
  seq,
  arch: 'respond',
  person,
  say: q,
  mode: 'choose',
  msg: { kind: 'speech', lines: [q] },
  options,
  answer,
  ...m,
});

/** respond (phone call → message pad). */
const F = (
  id: string,
  rank: number,
  seq: number,
  say: string,
  lines: string[],
  fields: { id: string; label: string; options: string[]; answer: string }[],
  m: Meta = {},
): AuthoredTask => ({ id, rank, seq, arch: 'respond', say, mode: 'form', msg: { kind: 'phone', lines }, fields, ...m });

/** The post office's weekly calendar for a "when can I come" task: busy cells are written in. */
const DAY_NAMES: Record<string, string> = { mon: 'Monday', tue: 'Tuesday', wed: 'Wednesday', thu: 'Thursday', fri: 'Friday', sat: 'Saturday', sun: 'Sunday' };
const days = (...ids: string[]) => ids.map((id) => ({ id, label: DAY_NAMES[id] ?? id }));

/** respond (speech → message pad / form). */
const FS = (
  id: string,
  rank: number,
  seq: number,
  person: string,
  lines: string[],
  fields: { id: string; label: string; options: string[]; answer: string }[],
  m: Meta = {},
): AuthoredTask => ({ id, rank, seq, arch: 'respond', person, say: lines.join(' '), mode: 'form', msg: { kind: 'speech', lines }, fields, ...m });

/** respond (pick the one free place on a weekly calendar): rows × cols; `busy` maps "row-col" to the text written there. */
const K = (
  id: string,
  rank: number,
  seq: number,
  person: string,
  lines: string[],
  rows: string[],
  cols: [string, string][],
  busy: Record<string, string>,
  answer: string,
  m: Meta = {},
): AuthoredTask => ({
  id,
  rank,
  seq,
  arch: 'respond',
  person,
  say: lines.join(' '),
  mode: 'slot',
  msg: { kind: 'speech', lines },
  slot: {
    layout: 'calendar',
    rows: days(...rows),
    cols: cols.map(([cid, label]) => ({ id: cid, label })),
    cells: rows.flatMap((r) => cols.map(([cid]) => ({ id: `${r}-${cid}`, row: r, col: cid, tags: [] as string[], ...(busy[`${r}-${cid}`] ? { busy: busy[`${r}-${cid}`] } : {}) }))),
    answer,
  },
  ...m,
});

/** respond (read a notice / letter / e-mail / phone call, choose the reply). */
const N = (
  id: string,
  rank: number,
  seq: number,
  person: string,
  kind: 'memo' | 'letter' | 'email' | 'phone',
  lines: string[],
  options: string[],
  answer: number,
  m: Meta = {},
): AuthoredTask => ({ id, rank, seq, arch: 'respond', person, mode: 'choose', msg: { kind, lines }, options, answer, ...m });

// forms of words the town already knows
const EXTRA_FORMS: Record<string, string[]> = {"buy": ["bought"]};

// ---------------------------------------------------------------------------- the words
// WORDS rows: [rank introduced, theme, "text|forms,...|pos|emoji|gloss"] (pos: n v a d p r c t i). Levels, domains and
// glosses come from data/english/vocab.json unless a gloss is written (the list does not have the word).
// A row "po_x=x|..." gives the entry an id of its own where another job already uses the id. The 検証ページ are built
// here (3–5 words each, grouped by rank and theme).
const POS = { n: 'noun', v: 'verb', a: 'adj', d: 'adv', p: 'prep', r: 'pron', c: 'conj', t: 'det', i: 'interj' } as const;
const THEME_JA: Record<string, string> = {
  tim: '曜日と時間のことば',
  pla: '場所と通りのことば',
  mai: '窓口と手紙のことば',
  mon: 'お金のことば',
  tra: '乗り物と届けることば',
  peo: '人をあらわすことば',
  sma: '文をつなぐ小さなことば',
  ver: '郵便局でする動作',
  des: '様子をあらわすことば',
  rel: '家族や知り合い',
  gif: 'おくりもの',
  fra: 'われものに気をつけて',
  mis: '郵便局のことば',
};
function buildLexicon(rows: [number, string, string][]): { lex: JobLexEntry[]; pages: { id: string; labelJa: string }[]; wid: (text: string) => string } {
  const idOf = new Map<string, string>();
  const lex: JobLexEntry[] = [];
  const pages: { id: string; labelJa: string }[] = [];
  const groups = new Map<string, JobLexEntry[]>();
  for (const [rank, theme, spec] of rows) {
    const [head, forms = '', pos = 'n', emoji = '', gloss = ''] = spec.split('|');
    const [rowId, text] = head.includes('=') ? head.split('=') : [undefined, head];
    const id = rowId ?? text.replace(/ /g, '_');
    idOf.set(text, id);
    const e: JobLexEntry = { id, text, ...(forms ? { forms: forms.split(',') } : {}), pos: POS[pos as keyof typeof POS], ...(emoji ? { emoji } : {}), ...(gloss ? { gloss } : {}), group: '' };
    const k = `${rank}:${theme}`;
    groups.set(k, [...(groups.get(k) ?? []), e]);
  }
  // themes with fewer than 3 words join the rank's "misc" group; a lone rest joins the biggest group
  const byRank = new Map<number, Map<string, JobLexEntry[]>>();
  for (const [k, ws] of groups) {
    const [r, t] = k.split(':');
    const m = byRank.get(+r) ?? new Map<string, JobLexEntry[]>();
    m.set(t, ws);
    byRank.set(+r, m);
  }
  for (const [rank, m] of [...byRank].sort((a, b) => a[0] - b[0])) {
    const small = [...m].filter(([, ws]) => ws.length < 3);
    for (const [t, ws] of small) {
      m.delete(t);
      m.set('mis', [...(m.get('mis') ?? []), ...ws]);
    }
    const mis = m.get('mis');
    if (mis && mis.length < 3 && m.size > 1) {
      m.delete('mis');
      const big = [...m].sort((a, b) => b[1].length - a[1].length)[0];
      m.set(big[0], [...big[1], ...mis]);
    }
    for (const [theme, ws] of [...m].sort((a, b) => a[0].localeCompare(b[0]))) {
      const sorted = [...ws].sort((a, b) => a.text.localeCompare(b.text));
      const k = Math.max(1, Math.ceil(sorted.length / 5));
      const base = Math.floor(sorted.length / k);
      let extra = sorted.length % k;
      let i = 0;
      for (let p = 1; p <= k; p++) {
        const size = base + (extra-- > 0 ? 1 : 0);
        const id = `jp_${rank}${theme}${p}`;
        pages.push({ id, labelJa: `${THEME_JA[theme] ?? THEME_JA.mis}（${p}）` });
        for (const e of sorted.slice(i, i + size)) lex.push({ ...e, group: id });
        i += size;
      }
    }
  }
  return { lex, pages, wid: (text) => idOf.get(text) ?? text.replace(/ /g, '_') };
}

const WORDS: [number, string, string][] = [
  [1, 'mai', 'color||n|🎨|色'],
  [1, 'mai', 'names||n||名前（いくつも）'],
  [1, 'mai', 'postcard|postcards|n|🖼️|はがき（絵はがき）'],
  [1, 'mai', 'sending||n||送っている'],
  [1, 'mai', 'stamp|stamps|n|🏷️|切手'],
  [1, 'mis', 'cousin||n||いとこ'],
  [1, 'mis', 'girl||n|👧|女の子'],
  [1, 'mis', 'teacher||n||先生'],
  [1, 'mis', 'woman|women|n|👩|女の人'],
  [1, 'pla', 'library||n|📚|図書館'],
  [1, 'pla', 'park||n|🌳|公園'],
  [1, 'pla', 'post office|post offices|n||郵便局'],
  [2, 'gif', 'ball||n||ボール'],
  [2, 'gif', 'doll||n||人形'],
  [2, 'gif', 'dress||n||ドレス'],
  [2, 'gif', 'kite||n||たこ'],
  [2, 'mis', 'notebook|notebooks|n|📓|ノート'],
  [2, 'mis', 'sell||v|🛒|売る'],
  [2, 'mis', 'streets||n||通り'],
  [2, 'pla', 'east||n||東'],
  [2, 'pla', 'north||n||北'],
  [2, 'pla', 'west||n||西'],
  [3, 'mai', 'books||n||本（何冊も）'],
  [3, 'mai', 'kilo|kilos|n|⚖️|キログラム'],
  [3, 'mai', 'parcel|parcels|n|📦|小包'],
  [3, 'mai', 'size||n||大きさ'],
  [3, 'mai', 'vase||n|🏺|花びん'],
  [3, 'mis', 'collect||v||受け取る・集める'],
  [3, 'mis', 'country|countries|n||国'],
  [3, 'mis', 'fill||v||記入する・満たす'],
  [3, 'mis', 'heavy||a|🏋️|重い'],
  [3, 'mis', 'inside||p||〜の中に'],
  [3, 'mis', 'island||n|🏝️|島'],
  [3, 'mis', 'light||a||軽い'],
  [3, 'mis', 'plane||n|✈️|飛行機'],
  [3, 'mis', 'radio||n||ラジオ'],
  [4, 'des', 'complete||a||完全な・記入ずみの'],
  [4, 'des', 'fragile||a||壊れやすい'],
  [4, 'des', 'ordinary||a||ふつうの'],
  [4, 'des', 'terribly||d||ひどく'],
  [4, 'mai', 'delivered||n||届ける'],
  [4, 'mai', 'insurance||n||保険'],
  [4, 'mai', 'label||n|🏷️|ラベル・札'],
  [4, 'mai', 'mail||n|📬|郵便'],
  [4, 'mai', 'telephone||n|☎️|電話'],
  [4, 'mai', 'worry||n||心配'],
  [4, 'mis', 'express||n|⚡|速達'],
  [4, 'mis', 'register|registered|v||書留にする'],
  [4, 'mis', 'study|studies|v||勉強する'],
  [4, 'mis', 'weekday|weekdays|n||平日'],
  [5, 'des', 'asleep||a||眠っている'],
  [5, 'des', 'badly||d||ひどく'],
  [5, 'des', 'serious||a||まじめな'],
  [5, 'ver', 'complain||v||苦情を言う'],
  [5, 'ver', 'declare||v||申告する'],
  [5, 'ver', 'myself||r||私自身'],
  [5, 'ver', 'publisher||n||出版社'],
  [5, 'ver', 'spoil|spoiled|v||だめにする'],
];

const { lex: LEX, pages: PAGES, wid } = buildLexicon(WORDS);

// ============================================================================ rank 1 (英検4級)
// Places on the cubbies, the price board and exact coins, a name / number / street on a label.
const R1: AuthoredTask[] = [
  S('p1_first', 1, 1, 'Good morning! Put the letters in the boxes, please.', ['school', 'bank', 'hospital'], [['To the school', 'school'], ['To the bank', 'bank'], ['To the hospital', 'hospital']], { grammar: ['gr-5-011'], phrases: ['ph-5-0002'] }),
  T('p1_stamp', 1, 2, 'c_boy', 'One stamp, please.', [['t_stamp', 1]], 2, { grammar: ['gr-5-024'] }),
  S('p1_places', 1, 3, 'More letters!', ['station', 'park', 'school', 'bank'], [['To the station', 'station'], ['To the park', 'park'], ['For the school', 'school'], ['To the bank', 'bank']], { grammar: ['gr-5-021'] }),
  T('p1_cards', 1, 4, 'c_grandma', 'Two envelopes, please.', [['t_envelope', 2]], 2, { grammar: ['gr-5-006'] }),
  T('p1_env', 1, 5, 'c_docker', 'An envelope and a stamp, please. I want to write to my mother.', [['t_envelope', 1], ['t_stamp', 1]], 3, { grammar: ['gr-5-007', 'gr-5-028'] }),
  S('p1_lib', 1, 6, 'Look at the letters. Which box?', ['library', 'church', 'park', 'hospital'], [['To the library', 'library'], ['To the church', 'church'], ['For the park', 'park'], ['For the hospital', 'hospital']], { grammar: ['gr-5-013'] }),
  T('p1_card', 1, 7, 'c_boy', 'A postcard, please. It is for my friend.', [['t_postcard', 1]], 3, { grammar: ['gr-5-007'] }),
  Q('p1_how', 1, 8, 'c_grandma', 'How much is a stamp?', ['It is two coins.', 'You are welcome.', 'Hello!'], 0, { grammar: ['gr-5-014'], phrases: ['ph-5-0044'] }),
  C('p1_name', 1, 9, 'c_docker', 'This letter is for {Tom|@}. Number 4.', [doc('label', 'Letter', [['name', 'Name', TOM], ['number', 'Number', '5']])], 0, 'number', { grammar: ['gr-5-010'] }),
  C('p1_ok', 1, 10, 'c_grandma', 'This letter is for {Ivy|@}. Number 2.', [doc('label', 'Letter', [['name', 'Name', IVY], ['number', 'Number', '2']])], 0, null),
  T('p1_two', 1, 11, 'c_boy', 'Two stamps and a postcard, please.', [['t_stamp', 2], ['t_postcard', 1]], 7, { grammar: ['gr-5-028'] }),
  Q('p1_where', 1, 12, 'c_docker', 'Where is the bus stop?', ['It is next to the bank.', 'It is two coins.', 'You are welcome.'], 0, { grammar: ['gr-5-013'], phrases: ['ph-5-0089'] }),
  S('p1_names', 1, 13, 'Now look at the name on each letter.', ['library', 'bank', 'station', 'church'], [[`${ROSE}, at the library`, 'library'], [`${TOM}, at the bank`, 'bank'], [`${JOE}, at the station`, 'station'], [`${IVY}, at the church`, 'church']], { grammar: ['gr-5-021'] }),
  T('p1_three', 1, 14, 'c_grandma', 'Three stamps, please. Here you are.', [['t_stamp', 3]], 6, { phrases: ['ph-5-0025'] }),
  C('p1_nm', 1, 15, 'p_ivy', 'This letter is for {Mr. Bell|@}. Number 8.', [doc('label', 'Letter', [['name', 'Name', GRANT], ['number', 'Number', '8']])], 0, 'name'),
  Q('p1_thanks', 1, 16, 'c_boy', 'Thank you!', ['You are welcome.', 'How much is it?', 'Two envelopes, please.'], 0, { phrases: ['ph-5-0014'] }),
  T('p1_env3', 1, 17, 'c_docker', 'Three envelopes and two stamps, please. I have a lot of letters to send.', [['t_envelope', 3], ['t_stamp', 2]], 7, { grammar: ['gr-5-006'] }),
  S('p1_careful', 1, 18, 'Five letters. Be careful, please.', ['church', 'park', 'school', 'hospital', 'library'], [['To the church', 'church'], ['For the park', 'park'], ['To the school', 'school'], ['To the hospital', 'hospital'], ['To the library', 'library']], { grammar: ['gr-5-011'], phrases: ['ph-5-0103'] }),
  C('p1_street', 1, 19, 'c_grandma', 'This letter is for {Mr. Grant|@}. Number 3, Park Street.', [doc('label', 'Letter', [['name', 'Name', GRANT], ['number', 'Number', '3'], ['street', 'Street', 'Church Street']])], 0, 'street'),
  T('p1_box', 1, 20, 'c_docker', 'A box, please. It is a present for my mother.', [['t_box', 1]], 5, { grammar: ['gr-5-007'] }),
  Q('p1_can', 1, 21, 'p_ivy', 'Can I have a stamp, please?', ['Sure. Here you are.', 'It is next to the bank.', 'I am sorry.'], 0, { grammar: ['gr-5-015'], phrases: ['ph-4-0004'] }),
  T('p1_ivy', 1, 22, 'p_ivy', 'Can I have two postcards, please?', [['t_postcard', 2]], 6, { grammar: ['gr-5-015'], phrases: ['ph-4-0004'] }),
  S('p1_nm2', 1, 23, 'Names and places again.', ['school', 'church', 'park', 'hospital'], [[`${LILY}, at the school`, 'school'], [`${REED}, at the church`, 'church'], [`${SAM}, at the park`, 'park'], [`${LANE}, at the hospital`, 'hospital']], { grammar: ['gr-5-021'] }),
  C('p1_ok2', 1, 24, 'c_boy', 'This letter is for {Lily|@}. Number 6, Park Street.', [doc('label', 'Letter', [['name', 'Name', LILY], ['number', 'Number', '6'], ['street', 'Street', 'Park Street']])], 0, null),
  T('p1_big', 1, 25, 'c_boy', 'Two envelopes, a stamp and a postcard, please.', [['t_envelope', 2], ['t_stamp', 1], ['t_postcard', 1]], 7, { grammar: ['gr-5-028'] }),
  Q('p1_myname', 1, 26, 'c_docker', 'What is your name?', ['My name is {Joe|@}.', 'It is two coins.', 'To the school.'], 0, { grammar: ['gr-5-013'] }),
  C('p1_num2', 1, 27, 'c_cook', 'This letter is for {Nora|@}. Number 12, Church Street.', [doc('label', 'Letter', [['name', 'Name', NORA], ['number', 'Number', '21'], ['street', 'Street', 'Church Street']])], 0, 'number'),
  T('p1_last', 1, 28, 'c_sailor', 'One box and one stamp, please.', [['t_box', 1], ['t_stamp', 1]], 7, { grammar: ['gr-5-024'] }),
  C('p1_color', 1, 29, 'c_boy', 'My envelope is red.', [doc('label', 'Envelope', [['name', 'Name', TOM], ['color', 'Color', 'blue']])], 0, 'color'),
  S('p1_bg', 1, 30, 'Look at each letter. Who is it for?', ['school', 'park', 'hospital'], [['For the boy at the school', 'school'], ['For the girl at the park', 'park'], ['For the girl at the hospital', 'hospital'], ['For the boy at the park', 'park']]),
  S('p1_mw', 1, 31, 'Now men and women.', ['bank', 'station', 'library'], [['For the man at the bank', 'bank'], ['For the woman at the station', 'station'], ['For the woman at the library', 'library'], ['For the man at the station', 'station']]),
  Q('p1_or', 1, 32, 'c_docker', 'Is this a letter or a postcard?', ['It is a postcard.', 'It is two coins.', 'You are welcome.'], 0, { grammar: ['gr-5-028'] }),
  T('p1_five', 1, 33, 'c_cook', 'Five envelopes, please. They are for my letters.', [['t_envelope', 5]], 5, { grammar: ['gr-5-010'] }),
  T('p1_teacher', 1, 34, 'c_boy', 'A postcard, please. It is for my teacher.', [['t_postcard', 1]], 3, { grammar: ['gr-5-007'] }),
  T('p1_uncle', 1, 35, 'c_cook', 'Two stamps, please. They are for my uncle and my aunt.', [['t_stamp', 2]], 4, { grammar: ['gr-5-010'] }),
  T('p1_son', 1, 36, 'c_grandma', 'A box, please. It is for my son and my daughter.', [['t_box', 1]], 5, { grammar: ['gr-5-007'] }),
  T('p1_cousin', 1, 37, 'c_girl', 'An envelope, please. It is for my cousin.', [['t_envelope', 1]], 1, { grammar: ['gr-5-007'] }),
  T('p1_cat', 1, 38, 'c_girl', 'A stamp, please. I like the picture of the cat.', [['t_stamp', 1]], 2, { grammar: ['gr-5-007'] }),
];

// ============================================================================ rank 2 (英検3級 / TOEIC〜400)
// Streets and compass sides, the days of the week (worked out from today / tomorrow / yesterday), change,
// opening times, short forms and phone notes. Comparatives, "can I", "not ...", "already".
const R2: AuthoredTask[] = [
  S('p2_ns', 2, 1, 'New boxes today. Look at the street, please.', ['north', 'south'], [['4 North Street', 'north'], ['9 South Street', 'south'], ['1 North Street', 'north'], ['6 South Street', 'south']], { grammar: ['gr-5-011'] }),
  S('p2_ew', 2, 2, 'And two more. East and west.', ['east', 'west'], [['2 East Street', 'east'], ['8 West Street', 'west'], ['5 West Street', 'west'], ['3 East Street', 'east']]),
  S('p2_streets', 2, 3, 'North, south, east, west. Look at the street, please.', ['north', 'south', 'east', 'west'], [['3 North Street', 'north'], ['7 South Street', 'south'], ['12 East Street', 'east'], ['5 West Street', 'west']], { grammar: ['gr-5-011'] }),
  T('p2_change', 2, 4, 'c_sailor', 'Three stamps and a box, please. Here you are.', [['t_stamp', 3], ['t_box', 1]], 20, { phrases: ['ph-5-0025'] }),
  T('p2_cards', 2, 5, 'c_grandma', 'Two postcards, please. Here you are.', [['t_postcard', 2]], 10, { phrases: ['ph-5-0025'] }),
  S('p2_number', 2, 6, 'Check the number and the street.', ['north', 'south', 'east', 'west'], [[`${ROSE}, Number 2, North Street`, 'north'], [`${JOE}, Number 9, West Street`, 'west'], [`${TOM}, Number 4, South Street`, 'south'], [`${IVY}, Number 15, East Street`, 'east']], { grammar: ['gr-5-024'] }),
  S('p2_days1', 2, 7, 'Today is Monday.', ['mon', 'tue'], [['For today', 'mon'], ['For tomorrow', 'tue'], ['For tomorrow', 'tue'], ['For today', 'mon']], { grammar: ['gr-5-027'] }),
  T('p2_cheap', 2, 8, 'c_boy', 'Two of the cheapest, please.', [['t_envelope', 2]], 5, { grammar: ['gr-4-015'] }),
  S('p2_days2', 2, 9, 'Today is Wednesday.', ['tue', 'wed', 'thu'], [['For yesterday', 'tue'], ['For today', 'wed'], ['For tomorrow', 'thu'], ['For today', 'wed']], { grammar: ['gr-5-027'] }),
  Q('p2_open', 2, 10, 'c_student', 'Is the post office open today?', ['Yes, we are open.', 'It is two coins.', 'To the school.'], 0, { grammar: ['gr-5-002'] }),
  T('p2_notebook', 2, 11, 'c_student', 'A notebook, please. It is for school.', [['t_notebook', 1]], 4, { grammar: ['gr-5-007'] }),
  S('p2_days3', 2, 12, 'Today is Friday.', ['thu', 'fri', 'sat'], [['For yesterday', 'thu'], ['For tomorrow', 'sat'], ['For today', 'fri'], ['For tomorrow', 'sat']], { grammar: ['gr-5-027'] }),
  S('p2_sun', 2, 23, 'Today is Saturday. We are closed tomorrow.', ['sat', 'sun', 'mon'], [['For today', 'sat'], ['For tomorrow', 'mon'], ['For today', 'sat'], ['For tomorrow', 'mon']], { grammar: ['gr-4-019'] }),
  K('p2_closed', 2, 13, 'c_grandma', ['I can come on Saturday or Sunday.', 'But not in the afternoon, please.'], ['sat', 'sun'], [['am', 'Morning'], ['pm', 'Afternoon']], { 'sun-am': 'Closed', 'sun-pm': 'Closed' }, 'sat-am', { grammar: ['gr-4-006'] }),
  FS('p2_form', 2, 14, 'c_grandma', ['I live at Number 4, East Street.', 'Please write it here.'], [
    { id: 'number', label: 'Number', options: ['4', '14', '40'], answer: '4' },
    { id: 'street', label: 'Street', options: ['East Street', 'West Street', 'North Street'], answer: 'East Street' },
  ], { grammar: ['gr-5-003'] }),
  C('p2_addr', 2, 15, 'c_boy', 'My address is Number 7, South Street.', [doc('card', 'Address', [['number', 'Number', '7'], ['street', 'Street', 'North Street']])], 0, 'street', { grammar: ['gr-5-008'] }),
  C('p2_day', 2, 16, 'p_ivy', 'This letter is for Wednesday.', [doc('label', 'Letter', [['name', 'Name', IVY], ['day', 'Day', 'Thursday']])], 0, 'day', { grammar: ['gr-5-021'] }),
  F('p2_phone', 2, 17, 'Write the message, please.', ['Hello, this is {Mr. Grant|@}.', 'Please call me back after three.'], [
    { id: 'who', label: 'Who', options: [GRANT, BELL, IVY], answer: GRANT },
    { id: 'when', label: 'Call back', options: ['before three', 'after three', 'tomorrow'], answer: 'after three' },
  ], { grammar: ['gr-4-001'] }),
  T('p2_most', 2, 18, 'c_docker', 'The most expensive one, please.', [['t_box', 1]], 5, { grammar: ['gr-4-015'] }),
  T('p2_birthday', 2, 19, 'c_girl', "A postcard for my grandmother's birthday, please.", [['t_postcard', 1]], 3, { grammar: ['gr-5-009'] }),
  Q('p2_hours', 2, 20, 'c_scholar', 'When is the post office open?', ['From nine until five.', 'Next to the bank.', 'It is two coins.'], 0, { grammar: ['gr-5-013'] }),
  C('p2_ok', 2, 21, 'c_oldman', 'This is for {Lily|@}. Number 5, East Street.', [doc('label', 'Letter', [['name', 'Name', LILY], ['number', 'Number', '5'], ['street', 'Street', 'East Street']])], 0, null),
  T('p2_four', 2, 22, 'c_cook', 'I need four stamps. I have two stamps already.', [['t_stamp', 2]], 5, { grammar: ['gr-3-002', 'gr-5-025'] }),
  Q('p2_sunday', 2, 24, 'c_baker', 'Is the post office open on Sunday?', ['No, we are closed on Sunday.', 'Yes, it is two coins.', 'You are welcome.'], 0, { grammar: ['gr-5-002'] }),
  T('p2_cheaper', 2, 25, 'c_merchant', 'A postcard, please. No, a stamp is cheaper. One stamp, please.', [['t_stamp', 1]], 2, { grammar: ['gr-4-014'] }),
  C('p2_nm', 2, 26, 'c_scholar', 'This letter is for {Professor Hale|@}. Number fifteen.', [doc('label', 'Letter', [['name', 'Name', HALE], ['number', 'Number', '50']])], 0, 'number', { grammar: ['gr-5-024'] }),
  K('p2_cal', 2, 27, 'c_boy', ['I have school in the morning.', 'I can come on Monday or Tuesday.'], ['mon', 'tue'], [['am', 'Morning'], ['pm', 'Afternoon']], { 'tue-pm': '{Mr. Bell|@}' }, 'mon-pm', { grammar: ['gr-5-021'] }),
  T('p2_gift', 2, 28, 'c_oldman', 'One box and one notebook. They are for my family.', [['t_box', 1], ['t_notebook', 1]], 10, { grammar: ['gr-5-010'] }),
  Q('p2_close', 2, 29, 'c_merchant', 'What time does the post office close?', ["At five o'clock.", 'It is two coins.', 'Yes, we are open.'], 0, { grammar: ['gr-5-013'] }),
  Q('p2_weekend', 2, 30, 'c_cook', 'Are you open at the weekend?', ['Yes, but only on Saturday morning.', 'It is next to the bank.', 'You are welcome.'], 0, { grammar: ['gr-5-002'] }),
  Q('p2_pen', 2, 31, 'c_student', 'May I have a pen?', ['Yes, of course. Here you are.', 'It is four coins.', 'We are closed.'], 0, { phrases: ['ph-5-0087'] }),
  Q('p2_dir', 2, 32, 'c_oldman', 'I am looking for the bank.', ['Go straight, and turn left at the church.', 'It is two coins.', 'Yes, we are open.'], 0, { grammar: ['gr-5-011'] }),
  Q('p2_dayq', 2, 33, 'c_girl', 'What day is it today?', ['It is Tuesday.', 'It is five o\'clock.', 'It is two coins.'], 0, { phrases: ['ph-5-0043'] }),
  Q('p2_news', 2, 34, 'c_scholar', 'Do you sell newspapers?', ['No, but the shop next to the bank does.', 'Yes, we are closed.', 'You are welcome.'], 0, { grammar: ['gr-5-004'] }),
  C('p2_price', 2, 35, 'c_boy', 'This postcard is three coins.', [doc('label', 'Postcard', [['price', 'Price', 'two coins'], ['name', 'Name', TOM]])], 0, 'price'),
  S('p2_near', 2, 36, 'Look at the street. Is it near the bank or near the church?', ['bank', 'church'], [['A letter for the shop next to the bank', 'bank'], ['A letter for the house next to the church', 'church'], ['For the man behind the bank', 'bank'], ['For the woman across from the church', 'church']], { grammar: ['gr-5-021'] }),
  T('p2_hat', 2, 37, 'c_baker', 'A box, please. In the box there is a hat and a shirt.', [['t_box', 1]], 5, { grammar: ['gr-5-020'] }),
  T('p2_coat', 2, 38, 'c_mom', 'A box and a stamp, please. The box is for a coat and a dress.', [['t_box', 1], ['t_stamp', 1]], 7, { grammar: ['gr-5-007'] }),
  T('p2_doll', 2, 39, 'c_girl', 'A box, please. In the box there are a doll and a toy for my cousin.', [['t_box', 1]], 5, { grammar: ['gr-4-029'] }),
  T('p2_kite', 2, 40, 'c_docker', 'Two stamps and a box. The box has a kite and a ball.', [['t_stamp', 2], ['t_box', 1]], 10, { grammar: ['gr-5-003'] }),
  Q('p2_map', 2, 41, 'c_sailor', 'Do you have a map of the town?', ['Yes, here you are.', 'It is two coins.', 'You are welcome.'], 0, { phrases: ['ph-4-0043'], grammar: ['gr-5-004'] }),
  T('p2_jacket', 2, 42, 'c_doctor', 'I want to send a jacket and gloves to my son. One box, please.', [['t_box', 1]], 5, { grammar: ['gr-5-016'] }),
  T('p2_wife', 2, 43, 'c_docker', 'A postcard for my wife, please. I am coming home on Friday.', [['t_postcard', 1]], 3, { grammar: ['gr-5-016'] }),
];

// ============================================================================ rank 3 (英検準2級 / TOEIC〜500)
// Far places (island, abroad, back to the sender), parcels and their weight, the way they travel, forms,
// late and lost mail, orders heard on the phone. Conditions, passives, "have you ... yet", "could you tell me ...".
const R3: AuthoredTask[] = [
  S('p3_isl', 3, 1, 'Some letters go to the island.', ['island', 'west', 'north'], [[`To ${IVY}, on the island`, 'island'], ['3 West Street', 'west'], [`To ${ANNA}, on the island`, 'island'], ['6 North Street', 'north']]),
  S('p3_abr', 3, 2, 'And some letters go abroad.', ['abroad', 'island', 'east'], [[`To ${BELL}, abroad`, 'abroad'], [`${IVY}, on the island`, 'island'], [`To ${HALE}, abroad`, 'abroad'], ['8 East Street', 'east']]),
  S('p3_ctry', 3, 3, 'Some of these letters are for another country.', ['abroad', 'island', 'south'], [[`To ${BELL}, in another country`, 'abroad'], [`For ${NORA}, on the island`, 'island'], [`To ${LILY}, in another country`, 'abroad'], ['4 South Street', 'south']]),
  S('p3_audio0', 3, 4, 'A letter with the wrong address is not for the boxes. Send it back.', ['back', 'north', 'south', 'abroad'], [['Wrong address. Please send it back.', 'back'], ['7 North Street', 'north'], [`To ${BELL}, abroad`, 'abroad'], ['2 South Street', 'south']], { grammar: ['gr-5-011'] }),
  S('p3_moved', 3, 5, 'Look at the letters, please.', ['back', 'east', 'island'], [[`${TOM} moved. Send it back, please.`, 'back'], ['5 East Street', 'east'], [`${IVY}, on the island`, 'island'], [`${KEN} moved. Send it back, please.`, 'back']], { grammar: ['gr-4-026'] }),
  T('p3_audio', 3, 6, 'p_ivy', 'I would like four stamps and two envelopes, please.', [['t_stamp', 4], ['t_envelope', 2]], 20, { features: ['audioOnly'], grammar: ['gr-4-007'] }),
  T('p3_parcel', 3, 7, 'c_docker', 'I want to send a parcel. One box, please.', [['t_box', 1]], 5, { grammar: ['gr-4-008'] }),
  C('p3_weight', 3, 8, 'c_docker', 'My parcel is three kilos.', [doc('label', 'Parcel', [['to', 'To', BELL], ['weight', 'Weight', '5 kilos']])], 0, 'weight', { fixOptions: ['3 kilos', '5 kilos', '8 kilos'], fix: '3 kilos', grammar: ['gr-5-010'] }),
  S('p3_heavy', 3, 9, 'Light parcels in the light box. Heavy parcels in the heavy box.', ['light', 'heavy'], [['1 kilo', 'light'], ['9 kilos', 'heavy'], ['2 kilos', 'light'], ['12 kilos', 'heavy']], { grammar: ['gr-5-011'] }),
  S('p3_boat', 3, 10, 'Island letters go by boat.', ['boat', 'north', 'south'], [[`To ${IVY}, on the island`, 'boat'], ['3 North Street', 'north'], [`${NORA}, on the island`, 'boat'], ['9 South Street', 'south']]),
  S('p3_plane', 3, 11, 'Letters for other countries go by plane.', ['boat', 'plane'], [[`To ${BELL}, abroad`, 'plane'], [`${IVY}, on the island`, 'boat'], [`To ${LILY}, in another country`, 'plane'], [`${NORA}, on the island`, 'boat']]),
  S('p3_train', 3, 12, 'Letters for the city go by train.', ['boat', 'plane', 'train'], [[`To ${ANNA}, in the city`, 'train'], [`To ${BELL}, abroad`, 'plane'], [`${IVY}, on the island`, 'boat'], [`To ${KEN}, in the city`, 'train']]),
  Q('p3_ask', 3, 13, 'c_merchant', 'Could you tell me how much it is to send this to the island?', ['It is six coins by boat.', 'The post office is open until five.', 'You are welcome.'], 0, { grammar: ['gr-3-010'] }),
  Q('p3_late', 3, 14, 'c_grandma', 'My letter is late. Can you check, please?', ['Yes, of course. I will look for it.', 'It is five coins.', 'I am sorry.'], 0, { grammar: ['gr-4-002'], phrases: ['ph-5-0085'] }),
  Q('p3_lost', 3, 15, 'c_baker', 'I think my parcel is lost.', ['I am sorry. I will check.', 'It is two kilos.', 'Thank you very much.'], 0, { grammar: ['gr-4-020'] }),
  C('p3_form', 3, 16, 'c_grandma', 'My name is {Grandma Rose|@}. I live at 6 North Street.', [doc('card', 'Form', [['name', 'Name', ROSE], ['address', 'Address', '6 South Street']])], 0, 'address', { fixOptions: ['6 North Street', '6 South Street', '16 North Street'], fix: '6 North Street', grammar: ['gr-5-003'] }),
  S('p3_if', 3, 17, 'If a parcel is more than five kilos, put it in the heavy box.', ['light', 'heavy'], [['3 kilos', 'light'], ['7 kilos', 'heavy'], ['5 kilos', 'light'], ['6 kilos', 'heavy']], { grammar: ['gr-3-018', 'gr-4-014'] }),
  T('p3_more', 3, 18, 'c_cook', 'I have three letters. I need a stamp for each letter. I have one stamp already.', [['t_stamp', 2]], 5, { grammar: ['gr-3-027', 'gr-5-025'] }),
  Q('p3_arrive', 3, 19, 'c_oldman', 'Has my letter arrived yet?', ['No, not yet. Please wait.', 'It is two kilos.', 'Welcome!'], 0, { grammar: ['gr-3-002'] }),
  C('p3_sent', 3, 20, 'c_mom', 'The parcel was sent on Monday.', [doc('label', 'Parcel', [['to', 'To', IVY], ['sent', 'Date', 'Tuesday']])], 0, 'sent', { fixOptions: ['Monday', 'Tuesday', 'Friday'], fix: 'Monday', grammar: ['gr-3-005'] }),
  C('p3_size', 3, 21, 'c_scholar', 'It is a big box.', [doc('label', 'Parcel', [['to', 'To', BELL], ['size', 'Size', 'small']])], 0, 'size', { fixOptions: ['big', 'small'], fix: 'big', grammar: ['gr-5-026'] }),
  T('p3_card3', 3, 22, 'c_grandma', 'Can I have three postcards, please? And a stamp for each postcard.', [['t_postcard', 3], ['t_stamp', 3]], 20, { features: ['audioOnly'], grammar: ['gr-5-015', 'gr-3-027'] }),
  F('p3_phone', 3, 23, 'Hello? Write the message, please.', ['Hello, this is {Mr. Grant|@}.', 'I want to send ten boxes to the island.', 'Please call me back today.'], [
    { id: 'who', label: 'Caller', options: [GRANT, HALE, REED], answer: GRANT },
    { id: 'what', label: 'Send', options: ['ten boxes', 'ten stamps', 'ten letters'], answer: 'ten boxes' },
    { id: 'where', label: 'To', options: ['the island', 'the station', 'another country'], answer: 'the island' },
  ], { features: ['audioOnly'], grammar: ['gr-4-008'] }),
  K('p3_cal', 3, 24, 'c_mom', ['I want to send a parcel by boat.', 'The boat goes on Tuesday and Friday.', "I can't come on Friday."], ['tue', 'fri'], [['am', 'Morning'], ['pm', 'Afternoon']], { 'tue-am': '{Ivy|@}' }, 'tue-pm', { grammar: ['gr-4-004'] }),
  T('p3_not', 3, 25, 'c_student', 'I need a notebook and an envelope. I do not want a stamp.', [['t_notebook', 1], ['t_envelope', 1]], 5, { grammar: ['gr-5-004'] }),
  Q('p3_leave', 3, 26, 'c_sailor', 'Could you tell me when the boat leaves?', ["At ten o'clock.", 'It is six coins.', 'Yes, of course.'], 0, { grammar: ['gr-3-010'] }),
  T('p3_friends', 3, 27, 'c_scholar', 'I would like two boxes and a notebook, please. They are for my friends.', [['t_box', 2], ['t_notebook', 1]], 20, { grammar: ['gr-4-007'] }),
  Q('p3_there', 3, 28, 'c_docker', 'Is there a post office on the island?', ['Yes, there is a small one.', 'It is six kilos.', 'Please send it back.'], 0, { grammar: ['gr-5-020'] }),
  Q('p3_wrong', 3, 29, 'c_boy', 'I am sorry. I put the wrong address on my letter.', ['That is all right. We can fix it.', 'It is two coins.', 'Next to the bank.'], 0, { grammar: ['gr-5-002'] }),
  C('p3_ok', 3, 30, 'p_bell', 'This parcel is for {Professor Hale|@}. It is five kilos.', [doc('label', 'Parcel', [['to', 'To', HALE], ['weight', 'Weight', '5 kilos']])], 0, null, { grammar: ['gr-5-010'] }),
  S('p3_mixed', 3, 31, 'A lot of letters from the boat. Look at each one.', ['island', 'abroad', 'back', 'north', 'south', 'east'], [[`To ${IVY}, on the island`, 'island'], [`To ${BELL}, in another country`, 'abroad'], ['Wrong address. Please send it back.', 'back'], ['8 North Street', 'north'], ['1 South Street', 'south'], ['4 East Street', 'east']]),
  C('p3_phone2', 3, 32, 'c_sailor', 'Please send this parcel to the island. It is eight kilos.', [doc('label', 'Parcel', [['to', 'To', 'the island'], ['weight', 'Weight', '8 kilos'], ['size', 'Size', 'big']])], 0, null),
  Q('p3_big', 3, 33, 'c_scholar', 'Is this box big enough for my books?', ['Yes, it is big enough.', 'It is six coins.', 'We are closed.'], 0, { grammar: ['gr-3-030'] }),
  Q('p3_fill', 3, 34, 'c_cook', 'Do I have to fill in a form?', ['Yes, please fill it in here.', 'It is five kilos.', 'You are welcome.'], 0, { grammar: ['gr-4-003'] }),
  Q('p3_inside', 3, 35, 'c_mom', 'What is in the box?', ['There are two books and a scarf.', 'It is six coins.', 'Next to the bank.'], 0, { grammar: ['gr-5-020'] }),
  Q('p3_cake', 3, 36, 'c_baker', 'Can I send a cake by boat?', ['Not a cake. It will not stay fresh.', 'Yes, it is five kilos.', 'You are welcome.'], 0, { grammar: ['gr-4-002'] }),
  C('p3_city', 3, 37, 'c_mom', 'This parcel is for {Anna|@}. She lives in the city.', [doc('label', 'Parcel', [['to', 'To', ANNA], ['place', 'Place', 'the island']])], 0, 'place', { fixOptions: ['the city', 'the island', 'another country'], fix: 'the city' }),
  S('p3_goods', 3, 38, 'Parcels from the boat. Look at each one.', ['hold', 'back', 'island'], [['Open this box. A cup is broken.', 'hold'], ['Nobody lives here. Please send it back.', 'back'], ['For the island. Be careful.', 'island'], ['Wrong address. Send it back, please.', 'back']], { grammar: ['gr-5-011'] }),
  T('p3_tape', 3, 39, 'c_docker', 'I need two boxes. One is for my books, and one is for my cups.', [['t_box', 2]], 10, { grammar: ['gr-5-007'] }),
  Q('p3_vis', 3, 40, 'c_student', 'I want to visit my friend on the island. Is the boat full?', ['Yes, it is full. Please come tomorrow.', 'It is five kilos.', 'You are welcome.'], 0, { grammar: ['gr-4-008'] }),
  T('p3_clock', 3, 41, 'c_oldman', 'One box, please. There is a clock in the box, so please be careful.', [['t_box', 1]], 5, { grammar: ['gr-4-019'] }),
  T('p3_lamp', 3, 42, 'c_merchant', 'Two boxes, please. One has a lamp, and one has a mirror.', [['t_box', 2]], 10, { grammar: ['gr-3-027'] }),
  T('p3_plate', 3, 43, 'c_cook', 'A box and a notebook, please. The box has four plates in it. Be careful, please.', [['t_box', 1], ['t_notebook', 1]], 10, { grammar: ['gr-5-020'] }),
  T('p3_camera', 3, 44, 'c_scholar', 'I am sending a camera and a radio. One box is enough, I think.', [['t_box', 1]], 5, { grammar: ['gr-4-020', 'gr-3-030'] }),
];

// ============================================================================ rank 4 (英検2級 / TOEIC〜600)
// Services (express, registered, kept at the counter), receipts and tracking numbers, two papers that must
// agree (the customer's form and the label), notices, late parcels and refunds. Passives, relative clauses,
// "have it delivered", reported speech, conditions with "if ... would".
const R4: AuthoredTask[] = [
  S('p4_exp', 4, 1, 'Some letters are express. Look for the word.', ['express', 'ordinary'], [['Express: I need it tomorrow.', 'express'], ['Hello from the island!', 'ordinary'], ['Express: it is for tomorrow.', 'express'], ['Thank you for the present.', 'ordinary']], { grammar: ['gr-5-011'] }),
  S('p4_reg', 4, 2, 'Some letters are registered.', ['registered', 'express', 'ordinary'], [['Registered: please sign here.', 'registered'], ['Express: I need it tomorrow.', 'express'], ['A postcard from the island.', 'ordinary'], ['Registered: please do not leave it at the door.', 'registered']], { grammar: ['gr-4-004'] }),
  T('p4_receipt', 4, 3, 'c_merchant', 'I would like a notebook and two stamps. Could I have a receipt, please?', [['t_notebook', 1], ['t_stamp', 2]], 10, { grammar: ['gr-4-007'] }),
  C('p4_track', 4, 4, 'c_scholar', 'The tracking number of my parcel is 4815.', [doc('label', 'Receipt', [['to', 'To', BELL], ['track', 'Tracking number', '4851']])], 0, 'track', { fixOptions: ['4815', '4851', '4518'], fix: '4815', grammar: ['gr-3-010'] }),
  Q('p4_where', 4, 5, 'c_scholar', 'Where is my parcel now? I have the tracking number.', ['Let me check. It was sent on Monday.', 'It is five coins.', 'Next to the bank.'], 0, { grammar: ['gr-3-005'] }),
  S('p4_hold', 4, 6, 'Some letters wait here for a day or two.', ['hold', 'registered', 'ordinary'], [[`${ROSE} will come for it on Friday.`, 'hold'], ['Registered: please sign here.', 'registered'], ['A postcard from the island.', 'ordinary'], [`${SAM} will come for this one tomorrow.`, 'hold']], { grammar: ['gr-4-002'] }),
  C('p4_two', 4, 7, 'c_docker', 'I am sending a heavy box to the island by boat. It is registered.', [
    doc('order', 'My form', [['to', 'To', IVY], ['how', 'By', 'boat'], ['kind', 'Kind', 'registered']]),
    doc('label', 'Label', [['to', 'To', IVY], ['how', 'By', 'plane'], ['kind', 'Kind', 'registered']]),
  ], 1, 'how', { fixOptions: ['boat', 'plane', 'train'], fix: 'boat' }),
  Q('p4_delay', 4, 8, 'c_baker', 'The boat is late today, so my parcel has not arrived. What should I do?', ['Please wait until tomorrow. It will come with the next boat.', 'Please send it back.', 'It is six kilos.'], 0, { grammar: ['gr-4-005', 'gr-4-019'] }),
  Q('p4_who', 4, 9, 'c_doctor', 'Who is the man that is waiting at the counter?', ['He is the owner of the inn.', 'He is waiting for the boat.', 'It is five coins.'], 0, { grammar: ['gr-3-007'] }),
  C('p4_ins', 4, 10, 'c_mom', 'There is a vase in this box, so I want insurance.', [doc('order', 'My form', [['to', 'To', IVY], ['ins', 'Insurance', 'yes']]), doc('label', 'Label', [['to', 'To', IVY], ['ins', 'Insurance', 'no']])], 1, 'ins', { fixOptions: ['yes', 'no'], fix: 'yes' }),
  Q('p4_urgent', 4, 11, 'c_merchant', 'This letter is urgent. Can you send it today?', ['Yes. It will go on the afternoon boat if you send it express.', 'It is six kilos.', 'You are welcome.'], 0, { grammar: ['gr-3-018'] }),
  K('p4_cal', 4, 12, 'c_cook', ['I want to send a parcel by plane.', 'The plane leaves on Wednesday and Saturday.', 'I work until five on weekdays.'], ['wed', 'sat'], [['am', 'Morning'], ['pm', 'Afternoon']], { 'sat-pm': 'Closed' }, 'sat-am', { grammar: ['gr-3-019'] }),
  N('p4_n1', 4, 13, 'c_mom', 'memo', ['NOTICE', 'The post office will be closed on Monday because of the holiday.', 'Letters will come on Tuesday.', '{Anna|@}: Can I send my parcel on Monday?'], ['No, we will be closed on Monday.', 'Yes, it will come on Monday.', 'It is five kilos.'], 0, { grammar: ['gr-4-019', 'gr-4-026'] }),
  N('p4_n2', 4, 14, 'c_oldman', 'memo', ['NOTICE', 'From next week, the post office will open at nine and close at five.', 'We will not close for lunch.', '{Grandpa Sam|@}: Can I come at noon?'], ['Yes, we will be open at noon.', 'No, we will be closed for lunch.', 'You are welcome.'], 0, { grammar: ['gr-4-002'] }),
  Q('p4_broken', 4, 15, 'c_cook', 'My parcel arrived broken. I want my money back.', ['I am very sorry. We will give you a refund.', 'It is two kilos.', 'You are welcome.'], 0, { grammar: ['gr-3-014'] }),
  F('p4_phone', 4, 16, 'The telephone is ringing. Write the message, please.', ['Hello, this is {Mr. Grant|@}.', 'My parcel was sent to the wrong address.', 'My tracking number is 6204. Please call me before noon.'], [
    { id: 'who', label: 'Caller', options: [GRANT, HALE, REED], answer: GRANT },
    { id: 'number', label: 'Tracking number', options: ['6024', '6204', '2604'], answer: '6204' },
    { id: 'when', label: 'Call back', options: ['before noon', 'after noon', 'tomorrow'], answer: 'before noon' },
  ], { features: ['audioOnly'], grammar: ['gr-3-005'] }),
  C('p4_value', 4, 17, 'c_scholar', 'There are two books and one scarf inside. The value is thirty coins.', [
    doc('order', 'My form', [['inside', 'Inside', 'two books, one scarf'], ['value', 'Value', '30 coins']]),
    doc('label', 'Label', [['inside', 'Inside', 'two books, one scarf'], ['value', 'Value', '13 coins']]),
  ], 1, 'value', { fixOptions: ['13 coins', '30 coins', '33 coins'], fix: '30 coins' }),
  S('p4_rel', 4, 18, 'Some letters have no street.', ['school', 'hospital', 'station', 'bank'], [['For the woman who works at the hospital', 'hospital'], ['For the man who works at the station', 'station'], ['For the boy who studies at the school', 'school'], ['For the man who keeps the money at the bank', 'bank']], { grammar: ['gr-3-007'] }),
  T('p4_cond', 4, 19, 'c_merchant', 'If the box is five coins, I will take two. And I will take one notebook, too.', [['t_box', 2], ['t_notebook', 1]], 20, { grammar: ['gr-3-018'] }),
  N('p4_n3', 4, 20, 'c_baker', 'letter', ['To every customer,', 'From Monday, a stamp will be three coins.', 'The price of a postcard will not change.', '{Mrs. Hill|@}: I will buy my stamps today.'], ['Good. They are two coins today.', 'It will cost five coins.', 'The boat is late.'], 0, { grammar: ['gr-4-001', 'gr-4-002'] }),
  S('p4_pass', 4, 21, 'Look at each letter.', ['back', 'hold', 'island'], [['This letter was sent to the wrong address.', 'back'], ['This parcel was brought by boat from the island.', 'hold'], ['This letter will be sent by boat tomorrow.', 'island'], ['This letter was sent back by the post office in the city.', 'back']], { grammar: ['gr-3-006'] }),
  T('p4_have', 4, 22, 'c_docker', 'I would like to have these boxes sent. Two boxes, please.', [['t_box', 2]], 10, { grammar: ['gr-pre2-023'] }),
  Q('p4_whether', 4, 23, 'c_scholar', 'I do not know whether the parcel has arrived. Could you check?', ['Yes, let me look. Please wait a moment.', 'It is five coins.', 'Goodbye.'], 0, { grammar: ['gr-3-032'] }),
  C('p4_ok', 4, 24, 'c_mom', 'This registered parcel is for {Ivy|@}. It is two kilos.', [doc('order', 'My form', [['to', 'To', IVY], ['kind', 'Kind', 'registered'], ['weight', 'Weight', '2 kilos']]), doc('label', 'Label', [['to', 'To', IVY], ['kind', 'Kind', 'registered'], ['weight', 'Weight', '2 kilos']])], 1, null),
  Q('p4_report', 4, 25, 'c_boy', 'My mother said that I should ask about the price of a box.', ['A box is five coins.', 'It is next to the bank.', 'You are welcome.'], 0, { grammar: ['gr-pre2-006'] }),
  K('p4_cal2', 4, 26, 'c_scholar', ['I want to send a heavy parcel abroad.', 'I cannot come in the morning.', 'And not on Saturday, please.'], ['thu', 'fri', 'sat'], [['am', 'Morning'], ['pm', 'Afternoon']], { 'thu-pm': '{Ivy|@}', 'sat-pm': 'Closed' }, 'fri-pm', { grammar: ['gr-4-004'] }),
  Q('p4_storm', 4, 27, 'c_sailor', 'The storm is very bad. Will the boat leave today?', ['No, it will leave tomorrow.', 'It is five kilos.', 'You are welcome.'], 0, { grammar: ['gr-4-002'] }),
  Q('p4_insq', 4, 27, 'c_mom', 'Does this parcel need insurance?', ['Yes, because it has glass inside.', 'It is five coins.', 'You are welcome.'], 0, { grammar: ['gr-4-019'] }),
  Q('p4_extra', 4, 28, 'c_merchant', 'Is there an extra charge for express?', ['Yes, express costs three coins more.', 'No, it is closed.', 'It is next to the bank.'], 0, { grammar: ['gr-4-014'] }),
  Q('p4_change', 4, 29, 'c_scholar', 'Can I change the address after I send it?', ['Yes, if it has not left the post office.', 'It is five kilos.', 'You are welcome.'], 0, { grammar: ['gr-3-018', 'gr-3-019'] }),
  C('p4_cust', 4, 30, 'c_doctor', 'I am sending two bottles of medicine. The value is twenty coins.', [doc('order', 'My form', [['inside', 'Inside', 'two bottles of medicine'], ['value', 'Value', '20 coins']]), doc('label', 'Label', [['inside', 'Inside', 'two bottles of medicine'], ['value', 'Value', '20 coins']])], 1, null),
  T('p4_tape', 4, 31, 'c_baker', 'I need a box for my cakes. I want the cheapest box, and two stamps.', [['t_box', 1], ['t_stamp', 2]], 10, { grammar: ['gr-4-015'] }),
  S('p4_names', 4, 32, 'Think about who lives where.', ['school', 'hospital', 'bank', 'library'], [[`For ${LANE}, who works at the hospital`, 'hospital'], [`For ${KEN}, who studies at the school`, 'school'], [`For ${HILL}, who keeps books at the library`, 'library'], [`For ${GRANT}, who works at the bank`, 'bank']], { grammar: ['gr-3-007'] }),
  Q('p4_santa', 4, 34, 'c_boy', 'I wrote to {Santa|@}, but I did not write the street. Is that enough?', ['No. Please write the street and the number, too.', 'Yes, it is five coins.', 'You are welcome.'], 0, { grammar: ['gr-5-019'] }),
];

// ============================================================================ rank 5 (英検準1級 / TOEIC〜730)
// The postmaster's desk: letters of complaint, notices with conditions, claims and compensation, customs
// papers that almost agree. Passives, "had been", "unless", "provided that", "not only ... but also",
// second and third conditionals, "neither ... nor", reported requests.
const R5: AuthoredTask[] = [
  S('p5_move', 5, 1, 'Read each letter, please.', ['redirect', 'back', 'hold', 'express'], [['Please send my letters to my new address in the city.', 'redirect'], ['Nobody lives here now. Please send this back.', 'back'], ['Keep my letters until I return from abroad.', 'hold'], ['This is urgent. I need it by noon.', 'express']], { grammar: ['gr-4-011'] }),
  N('p5_c1', 5, 2, 'c_merchant', 'letter', ['Dear {Mrs. Wren|@},', 'I sent a parcel abroad last week.', 'It has not arrived, but I paid for express.', 'Where is it? If it is lost, I would like a refund.', '{Mr. Grant|@}'], ['I am sorry. We will look for it and call you.', 'Your parcel was sent by boat.', 'A stamp is two coins.'], 0, { grammar: ['gr-pre2-007', 'gr-3-003'] }),
  Q('p5_damaged', 5, 3, 'c_doctor', 'My parcel came broken, and nobody told me. I want to complain.', ['I am very sorry for the trouble. May I see your receipt?', 'It will go by boat on Friday.', 'It is five kilos.'], 0, { grammar: ['gr-pre2-001'] }),
  C('p5_decl', 5, 4, 'c_scholar', 'The books are old, so the value is low.', [
    doc('order', 'My form', [['inside', 'Inside', 'old books'], ['value', 'Value', 'low']]),
    doc('label', 'Label', [['inside', 'Inside', 'old books'], ['value', 'Value', 'high']]),
  ], 1, 'value', { fixOptions: ['low', 'high'], fix: 'low' }),
  K('p5_cal', 5, 5, 'c_mom', ['I would like to send a fragile parcel abroad.', 'I can come only if the baby is asleep, which is never in the morning.', 'I cannot come on Wednesday.'], ['tue', 'wed', 'thu'], [['am', 'Morning'], ['pm', 'Afternoon']], { 'tue-pm': '{Ivy|@}' }, 'thu-pm', { grammar: ['gr-3-018'] }),
  N('p5_n1', 5, 6, 'c_cook', 'memo', ['NOTICE', 'Unless the form is complete, the parcel cannot go.', '{Nora|@}: My form has no date. Can I send my parcel today?'], ['Not yet. Please write the date.', 'Yes, it will go today.', 'It is five kilos.'], 0, { grammar: ['gr-3-018', 'gr-pre2-005'] }),
  S('p5_claim', 5, 7, 'Put each letter in the right box, please.', ['claims', 'redirect', 'hold'], [['I would like to complain about my late parcel.', 'claims'], ['My address is new. Please send my letters to the island.', 'redirect'], ['I will come for it myself, provided that it arrives before Friday.', 'hold'], ['The box was broken when it arrived, and I want my money back.', 'claims']], { grammar: ['gr-pre2-009'] }),
  T('p5_trade', 5, 8, 'c_scholar', 'I would like not only two boxes but also two notebooks, please. I will pay in cash.', [['t_box', 2], ['t_notebook', 2]], 20, { grammar: ['gr-pre2-029'] }),
  Q('p5_late', 5, 9, 'c_baker', 'If the boat had come on time, my cakes would not have been spoiled.', ['I am terribly sorry. We will pay for the cakes.', 'It will go by boat on Friday.', 'It is five kilos.'], 0, { grammar: ['gr-2-001'] }),
  C('p5_two', 5, 10, 'c_docker', 'My parcel is going to {Mr. Bell|@} abroad. It is twelve kilos and registered.', [
    doc('order', 'My form', [['to', 'To', BELL], ['weight', 'Weight', '12 kilos'], ['kind', 'Kind', 'registered'], ['value', 'Value', '40 coins']]),
    doc('label', 'Label', [['to', 'To', BELL], ['weight', 'Weight', '21 kilos'], ['kind', 'Kind', 'registered'], ['value', 'Value', '40 coins']]),
  ], 1, 'weight', { fixOptions: ['12 kilos', '21 kilos', '2 kilos'], fix: '12 kilos' }),
  N('p5_e1', 5, 11, 'c_scholar', 'email', ['The parcel that was sent on Monday has not arrived at my publisher.', 'Could you tell me whether it is lost?', '{Professor Hale|@}'], ['We have asked the post office abroad. We will tell you soon.', 'It is five kilos.', 'The post office is closed on Monday.'], 0, { grammar: ['gr-3-032', 'gr-3-005'] }),
  Q('p5_neither', 5, 12, 'c_sailor', 'Neither the boat nor the plane can leave today because of the storm.', ['Then we will keep your parcel until the weather is better.', 'It is five kilos.', 'A stamp is two coins.'], 0, { grammar: ['gr-pre2-030'] }),
  S('p5_pass', 5, 13, 'These letters have been waiting for a long time. Where should they go?', ['back', 'hold', 'redirect'], [['Nobody has come for this parcel for a long time.', 'back'], ['The owner has asked for it to be kept until Friday.', 'hold'], ['The owner has moved to the island and has left a new address.', 'redirect'], ['The address was written so badly that nobody could read it.', 'back']], { grammar: ['gr-3-003', 'gr-pre2-032'] }),
  T('p5_dont', 5, 14, 'c_merchant', 'I do not need a box, but I would like the cheapest thing for my letters, and one stamp for each of the five letters.', [['t_envelope', 5], ['t_stamp', 5]], 20, { grammar: ['gr-4-015', 'gr-3-027'] }),
  F('p5_phone', 5, 15, 'Please write the message.', ['Good morning. This is {Ms. Park|@} from the post office.', 'The parcels will arrive on Thursday, not on Wednesday.', 'Could you keep the parcels here? I will come for them after lunch.'], [
    { id: 'when', label: 'Arrive', options: ['Wednesday', 'Thursday', 'Friday'], answer: 'Thursday' },
    { id: 'what', label: 'Please', options: ['keep the parcels', 'send the parcels back', 'send the parcels abroad'], answer: 'keep the parcels' },
    { id: 'collect', label: 'Come', options: ['before lunch', 'after lunch', 'tomorrow'], answer: 'after lunch' },
  ], { features: ['audioOnly'], grammar: ['gr-pre2-006'] }),
  Q('p5_ship', 5, 16, 'c_sailor', 'Is it possible to send a letter to a ship?', ['Yes, provided that you know the name of the ship and the port.', 'No, it is closed.', 'It is five kilos.'], 0, { grammar: ['gr-pre2-009'] }),
  Q('p5_home', 5, 17, 'c_oldman', 'What do you do if nobody is at home?', ['We keep the parcel here, and you can come for it at the counter.', 'It will go by boat on Friday.', 'You are welcome.'], 0, { grammar: ['gr-4-019'] }),
  C('p5_date', 5, 18, 'c_cook', 'The parcel must arrive before the first of May, and I paid for express.', [doc('order', 'My form', [['date', 'Arrive before', '1 May'], ['kind', 'Kind', 'express']]), doc('label', 'Label', [['date', 'Arrive before', '11 May'], ['kind', 'Kind', 'express']])], 1, 'date', { fixOptions: ['1 May', '11 May', '10 May'], fix: '1 May' }),
  K('p5_cal2', 5, 19, 'c_scholar', ['I would like to send a parcel abroad.', 'I am free only on Thursday or Friday.', 'If possible, I would like to come in the morning.'], ['thu', 'fri'], [['am', 'Morning'], ['pm', 'Afternoon']], { 'thu-am': '{Mr. Bell|@}', 'fri-am': 'Closed', 'fri-pm': '{Ivy|@}' }, 'thu-pm', { grammar: ['gr-3-018'] }),
  N('p5_n2', 5, 20, 'c_merchant', 'memo', ['NOTICE', 'Because of the storm, no boat will leave the harbour until Friday.', 'Parcels for the island will be kept at the counter.', '{Mr. Grant|@}: My parcel is for the island. What will happen to it?'], ['It will be kept here until the boats leave again.', 'It will be sent back today.', 'It is five kilos.'], 0, { grammar: ['gr-3-006', 'gr-pre2-034'] }),
  S('p5_reply', 5, 21, '{Mrs. Wren|@} has written a note on each letter. Which box?', ['claims', 'hold', 'back'], [['We are sorry. A refund will be sent to the customer.', 'claims'], ['The owner will come for it on Friday.', 'hold'], ['Nobody lives at this address, so it has been returned.', 'back'], ['The customer says the parcel was broken. We must check it.', 'claims']], { grammar: ['gr-3-006', 'gr-pre2-045'] }),
  T('p5_both', 5, 22, 'c_docker', 'I would like both a box and a notebook, but not two of each. One box and one notebook will be fine.', [['t_box', 1], ['t_notebook', 1]], 10, { grammar: ['gr-3-033'] }),
  Q('p5_rule', 5, 23, 'c_doctor', 'I would like to send some medicine abroad. Am I allowed to?', ['Yes, but you must declare it on the form.', 'It is five kilos.', 'You are welcome.'], 0, { grammar: ['gr-2-034'] }),
  S('p5_rel', 5, 24, 'Read each note, please.', ['redirect', 'hold', 'claims', 'back'], [['This letter is for the man who has moved to the island.', 'redirect'], ['This parcel is for the woman who is abroad until Friday.', 'hold'], ['The customer who sent this parcel wants his money back.', 'claims'], ['Nobody knows where the owner of this letter is.', 'back']], { grammar: ['gr-3-007', 'gr-3-003'] }),
  C('p5_x2', 5, 25, 'c_mom', 'My parcel is going to {Ivy|@} on the island. It is twelve kilos, and it is registered.', [
    doc('order', 'My form', [['to', 'To', IVY], ['weight', 'Weight', '12 kilos'], ['kind', 'Kind', 'registered']]),
    doc('label', 'Label', [['to', 'To', ANNA], ['weight', 'Weight', '12 kilos'], ['kind', 'Kind', 'registered']]),
  ], 1, 'to', { fixOptions: [IVY, ANNA, BELL], fix: IVY }),
  Q('p5_why', 5, 26, 'c_boy', 'Could you tell me why my parcel was sent back?', ['It was sent back because the address was wrong.', 'It will go by boat on Friday.', 'You are welcome.'], 0, { grammar: ['gr-3-010', 'gr-3-005'] }),
  Q('p5_when', 5, 27, 'c_oldman', 'If I send it today, when will it arrive?', ['If you send it express, it will arrive tomorrow.', 'It is five kilos.', 'Goodbye.'], 0, { grammar: ['gr-3-018'] }),
  T('p5_already', 5, 28, 'c_merchant', 'I have already bought two stamps today, but I need three more.', [['t_stamp', 3]], 10, { grammar: ['gr-3-002'] }),
];

// ---------------------------------------------------------------------------- templates
// Each template varies a sentence inside the words the rank has met. Sort patterns with fixed `bins` carry the
// reading puzzle (negation, conditions); {name} / {num} vary the rest. Rank-n templates also come at higher ranks
// as review (the planner weights the rank's own ones ×3).
const NAMES_LOC = ['school', 'hospital', 'bank', 'station', 'library', 'park', 'church'];
const STREETS = ['north', 'south', 'east', 'west'];

const TEMPLATES: TaskTemplate[] = [
  // ---- rank 1
  { id: 'pt_places', rank: 1, arch: 'sort', say: 'Put the letters in the boxes, please.', count: [3, 4], bins: NAMES_LOC, patterns: [{ text: 'To {bin}' }, { text: 'For {bin}' }, { text: '{Name}, at {bin}' }], grammar: ['gr-5-011', 'gr-5-021'] },
  { id: 'pt_places2', rank: 1, arch: 'sort', say: 'Look at each letter, please.', count: [4, 4], bins: NAMES_LOC, patterns: [{ text: 'A letter for {bin}' }, { text: 'To {Name}, at {bin}' }, { text: '{Name} is at {bin}' }], grammar: ['gr-5-001'] },
  { id: 'pt_places3', rank: 1, arch: 'sort', say: 'Be careful, please.', count: [5, 5], bins: ['school', 'hospital', 'bank', 'station', 'library', 'park'], patterns: [{ text: 'To {bin}' }, { text: 'For {bin}' }, { text: 'Not for the church, but for {bin}' }], grammar: ['gr-5-011'] },
  { id: 'pt_buy1', rank: 1, arch: 'trade', say: '{Qty1}, please.', slots: { qty1: { kind: 'qty', tags: ['counter'], min: 1, max: 3 } }, pay: 'exact', grammar: ['gr-5-006'] },
  { id: 'pt_buy2', rank: 1, arch: 'trade', say: '{Qty1} and {qty2}, please.', slots: { qty1: { kind: 'qty', tags: ['counter'], min: 1, max: 2 }, qty2: { kind: 'qty', tags: ['counter'], min: 1, max: 2 } }, pay: 'exact', grammar: ['gr-5-028'] },
  { id: 'pt_buy3', rank: 1, arch: 'trade', say: 'I want {qty1} for my friend.', slots: { qty1: { kind: 'qty', tags: ['counter'], min: 1, max: 3 } }, pay: 'exact', grammar: ['gr-5-025'] },
  { id: 'pt_buy4', rank: 1, arch: 'trade', say: '{Qty1}, please. Here you are.', slots: { qty1: { kind: 'qty', tags: ['counter'], min: 1, max: 3 } }, pay: 'exact', phrases: ['ph-5-0025'] },
  { id: 'pt_buy5', rank: 1, arch: 'trade', say: '{Qty1}, please. No {forbid1}.', slots: { qty1: { kind: 'qty', tags: ['counter'], min: 1, max: 3 }, forbid1: { kind: 'forbid', tags: ['counter'] } }, pay: 'exact', grammar: ['gr-5-007'] },
  {
    id: 'pt_c_name',
    rank: 1,
    arch: 'check',
    person: 'client',
    say: 'This letter is for {name}. Number {number}.',
    fields: [
      { id: 'name', label: 'Name', values: [ROSE, TOM, JOE, IVY, NORA, GRANT] },
      { id: 'number', label: 'Number', values: ['2', '4', '6', '8', '12', '14'] },
    ],
    docs: [{ kind: 'label', title: 'Letter', fields: ['name', 'number'] }],
    target: 0,
    pWrong: 0.6,
    grammar: ['gr-5-010'],
  },
  {
    id: 'pt_c_street',
    rank: 1,
    arch: 'check',
    person: 'client',
    say: 'This letter is for {name}. Number {number}, {street}.',
    fields: [
      { id: 'name', label: 'Name', values: [ROSE, TOM, JOE, IVY, NORA, GRANT, LILY, KEN] },
      { id: 'number', label: 'Number', values: ['3', '5', '7', '9', '11', '13'] },
      { id: 'street', label: 'Street', values: ['Park Street', 'Church Street', 'School Street', 'Station Street', 'Library Street'] },
    ],
    docs: [{ kind: 'label', title: 'Letter', fields: ['name', 'number', 'street'] }],
    target: 0,
    pWrong: 0.6,
  },
  { id: 'pt_gift1', rank: 1, arch: 'trade', say: '{Qty1}, please. I am sending a present to my {word1}.', slots: { qty1: { kind: 'qty', tags: ['counter'], min: 1, max: 3 }, word1: { kind: 'word', ids: ['teacher', 'son', 'daughter', 'uncle', 'aunt', 'cousin'].map(wid) } }, pay: 'exact', grammar: ['gr-4-029'] },
  {
    id: 'pt_c_color',
    rank: 1,
    arch: 'check',
    person: 'client',
    say: 'My envelope is {color}.',
    fields: [
      { id: 'name', label: 'Name', values: [TOM, ROSE, JOE, IVY] },
      { id: 'color', label: 'Color', values: ['red', 'blue', 'green', 'yellow', 'white', 'black'] },
    ],
    docs: [{ kind: 'label', title: 'Envelope', fields: ['name', 'color'] }],
    target: 0,
    pWrong: 0.6,
    wrongable: ['color'],
    grammar: ['gr-5-001'],
  },
  { id: 'pt_q1', rank: 1, arch: 'respond', mode: 'choose', bank: 'counter', kind: 'speech', person: 'client' },
  { id: 'pt_q1b', rank: 1, arch: 'respond', mode: 'choose', bank: 'counter', kind: 'speech', person: 'client', weight: 0.7 },
  // ---- rank 2
  { id: 'pt_streets', rank: 2, arch: 'sort', count: [4, 4], bins: STREETS, patterns: [{ text: '{num} {bin}' }, { text: '{Name}, {num} {bin}' }, { text: '{Name}, Number {num}, {bin}' }], grammar: ['gr-5-024'] },
  { id: 'pt_streets2', rank: 2, arch: 'sort', say: 'Look at the street and the number.', count: [4, 5], bins: STREETS, patterns: [{ text: 'A letter for {Name}, {bin}' }, { text: 'Number {num}, {bin}, please' }, { text: '{Name} lives at {num}, {bin}' }], grammar: ['gr-5-003'] },
  { id: 'pt_mix2', rank: 2, arch: 'sort', say: 'Places and streets today.', count: [4, 5], bins: [...STREETS, 'school', 'bank', 'station', 'library'], patterns: [{ text: 'To {bin}' }, { text: '{num} {bin}', bins: STREETS }, { text: '{Name}, {bin}' }] },
  { id: 'pt_d1', rank: 2, arch: 'sort', say: 'Today is Monday.', count: [4, 4], bins: ['mon', 'tue'], patterns: [{ text: 'For today', bins: ['mon'] }, { text: 'For tomorrow', bins: ['tue'] }, { text: '{Name}, for today', bins: ['mon'] }, { text: '{Name}, for tomorrow', bins: ['tue'] }], grammar: ['gr-5-027'] },
  { id: 'pt_d2', rank: 2, arch: 'sort', say: 'Today is Wednesday.', count: [4, 4], bins: ['tue', 'wed', 'thu'], patterns: [{ text: 'For yesterday', bins: ['tue'] }, { text: 'For today', bins: ['wed'] }, { text: 'For tomorrow', bins: ['thu'] }, { text: '{Name}, for tomorrow', bins: ['thu'] }, { text: '{Name}, for today', bins: ['wed'] }], grammar: ['gr-5-027'] },
  { id: 'pt_d3', rank: 2, arch: 'sort', say: 'Today is Friday.', count: [4, 5], bins: ['thu', 'fri', 'sat'], patterns: [{ text: 'For yesterday', bins: ['thu'] }, { text: 'For today', bins: ['fri'] }, { text: 'For tomorrow', bins: ['sat'] }, { text: '{Name}, for today', bins: ['fri'] }], grammar: ['gr-5-027'] },
  { id: 'pt_canhave', rank: 2, arch: 'trade', phrases: ['ph-4-0004'], say: 'Can I have {qty1}, please?', slots: { qty1: { kind: 'qty', tags: ['counter'], min: 2, max: 4 } }, pay: 'round', grammar: ['gr-5-015'] },
  { id: 'pt_hereyou', rank: 2, arch: 'trade', say: '{Qty1} and {qty2}. Here you are.', slots: { qty1: { kind: 'qty', tags: ['counter'], min: 1, max: 3 }, qty2: { kind: 'qty', tags: ['counter'], min: 1, max: 2 } }, pay: 'round', phrases: ['ph-5-0025'] },
  { id: 'pt_need', rank: 2, arch: 'trade', say: 'I need {qty1} for my friends. I do not want {forbid1}.', slots: { qty1: { kind: 'qty', tags: ['counter'], min: 2, max: 3 }, forbid1: { kind: 'forbid', tags: ['counter'] } }, pay: 'round', grammar: ['gr-5-004'] },
  {
    id: 'pt_c_addr',
    rank: 2,
    arch: 'check',
    person: 'client',
    say: 'My address is Number {number}, {street}.',
    fields: [
      { id: 'number', label: 'Number', values: ['3', '7', '12', '15', '21'] },
      { id: 'street', label: 'Street', values: ['North Street', 'South Street', 'East Street', 'West Street'] },
    ],
    docs: [{ kind: 'card', title: 'Address', fields: ['number', 'street'] }],
    target: 0,
    pWrong: 0.6,
    grammar: ['gr-5-008'],
  },
  {
    id: 'pt_c_day',
    rank: 2,
    arch: 'check',
    person: 'client',
    say: 'This letter is for {day}.',
    fields: [
      { id: 'name', label: 'Name', values: [IVY, TOM, ROSE, JOE] },
      { id: 'day', label: 'Day', values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] },
    ],
    docs: [{ kind: 'label', title: 'Letter', fields: ['name', 'day'] }],
    target: 0,
    pWrong: 0.6,
    wrongable: ['day'],
  },
  {
    id: 'pt_cal2',
    rank: 2,
    arch: 'respond',
    mode: 'slot',
    kind: 'speech',
    person: 'client',
    layout: 'calendar',
    rows: days('mon', 'tue', 'wed', 'thu', 'fri'),
    cols: [{ id: 'am', label: 'Morning' }, { id: 'pm', label: 'Afternoon' }],
    want: [
      { tag: 'mon', text: 'I can come on Monday.' },
      { tag: 'tue', text: 'I can come on Tuesday.' },
      { tag: 'wed', text: 'I can come on Wednesday.' },
      { tag: 'thu', text: 'I can come on Thursday.' },
      { tag: 'fri', text: 'I can come on Friday.' },
      { tag: 'am', text: 'I am free in the morning.' },
      { tag: 'pm', text: 'I am free in the afternoon.' },
    ],
    avoid: [
      { tag: 'am', text: 'Not in the morning, please.' },
      { tag: 'pm', text: 'Not in the afternoon, please.' },
    ],
    busy: [IVY, TOM, ROSE, JOE, NORA],
    grammar: ['gr-5-015'],
  },
  { id: 'pt_gift2', rank: 2, arch: 'trade', say: 'I need {qty1}. I am sending a {word1} to my {word2}.', slots: { qty1: { kind: 'qty', tags: ['box', 'stamp'], min: 1, max: 3 }, word1: { kind: 'word', ids: ['hat', 'shirt', 'coat', 'dress', 'doll', 'toy', 'kite', 'ball', 'map', 'jacket'].map(wid) }, word2: { kind: 'word', ids: ['teacher', 'son', 'daughter', 'uncle', 'aunt', 'cousin'].map(wid) } }, pay: 'round', grammar: ['gr-5-016'] },
  { id: 'pt_q2', rank: 2, arch: 'respond', mode: 'choose', bank: 'counter', kind: 'speech', person: 'client' },
  // ---- rank 3
  { id: 'pt_isl', rank: 3, arch: 'sort', say: 'Some go to the island, and some go abroad.', count: [4, 5], bins: ['island', 'abroad', 'north', 'south', 'east', 'west'], patterns: [{ text: 'To {Name}, on the island', bins: ['island'] }, { text: '{Name}, on the island', bins: ['island'] }, { text: 'To {Name}, abroad', bins: ['abroad'] }, { text: 'To {Name}, in another country', bins: ['abroad'] }, { text: '{num} {bin}', bins: STREETS }], grammar: ['gr-5-021'] },
  { id: 'pt_far', rank: 3, arch: 'sort', count: [4, 5], bins: ['island', 'abroad', 'back', 'north', 'south', 'east', 'west'], patterns: [{ text: 'To {Name}, on the island', bins: ['island'] }, { text: '{Name}, the island', bins: ['island'] }, { text: 'To {Name}, in another country', bins: ['abroad'] }, { text: 'Abroad: to {Name}', bins: ['abroad'] }, { text: 'Wrong address. Please send it back.', bins: ['back'] }, { text: '{Name} moved. Send it back, please.', bins: ['back'] }, { text: '{num} {bin}', bins: STREETS }], grammar: ['gr-4-026'] },
  { id: 'pt_go', rank: 3, arch: 'sort', say: 'Island letters go by boat. Letters for other countries go by plane. Letters for the city go by train.', count: [4, 5], bins: ['boat', 'plane', 'train'], patterns: [{ text: 'To {Name}, on the island', bins: ['boat'] }, { text: 'To {Name}, abroad', bins: ['plane'] }, { text: 'To {Name}, in the city', bins: ['train'] }, { text: '{Name}, in another country', bins: ['plane'] }], grammar: ['gr-4-026'] },
  { id: 'pt_kilos', rank: 3, arch: 'sort', say: 'If a parcel is more than five kilos, put it in the heavy box.', count: [4, 5], bins: ['light', 'heavy'], patterns: [{ text: '1 kilo', bins: ['light'] }, { text: '2 kilos', bins: ['light'] }, { text: '4 kilos', bins: ['light'] }, { text: '5 kilos', bins: ['light'] }, { text: '6 kilos', bins: ['heavy'] }, { text: '8 kilos', bins: ['heavy'] }, { text: '10 kilos', bins: ['heavy'] }, { text: '15 kilos', bins: ['heavy'] }, { text: '3 kilos', bins: ['light'] }], grammar: ['gr-3-018', 'gr-4-014'] },
  { id: 'pt_would', rank: 3, arch: 'trade', features: ['audioOnly'], grammar: ['gr-4-007'], say: 'I would like {qty1} and {qty2}, please.', slots: { qty1: { kind: 'qty', tags: ['counter'], min: 2, max: 4 }, qty2: { kind: 'qty', tags: ['counter'], min: 1, max: 3 } }, pay: 'round' },
  { id: 'pt_howmuch', rank: 3, arch: 'trade', phrases: ['ph-5-0044'], grammar: ['gr-5-014'], say: '{Qty1}, please. How much is it?', slots: { qty1: { kind: 'qty', tags: ['counter'], min: 2, max: 5 } }, pay: 'round' },
  { id: 'pt_each', rank: 3, arch: 'trade', say: '{Qty1}, please. One for each of my friends.', slots: { qty1: { kind: 'qty', tags: ['counter'], min: 2, max: 3 } }, pay: 'round', grammar: ['gr-3-027'] },
  {
    id: 'pt_c_weight',
    rank: 3,
    arch: 'check',
    person: 'client',
    say: 'My parcel is {weight}.',
    fields: [
      { id: 'to', label: 'To', values: [BELL, IVY, HALE, ANNA] },
      { id: 'weight', label: 'Weight', values: ['2 kilos', '3 kilos', '5 kilos', '8 kilos', '12 kilos'] },
    ],
    docs: [{ kind: 'label', title: 'Parcel', fields: ['to', 'weight'] }],
    target: 0,
    pWrong: 0.6,
    wrongable: ['weight'],
    grammar: ['gr-5-010'],
  },
  {
    id: 'pt_c_sent',
    rank: 3,
    arch: 'check',
    person: 'client',
    say: 'The parcel was sent on {sent}.',
    fields: [
      { id: 'to', label: 'To', values: [IVY, BELL, ANNA] },
      { id: 'sent', label: 'Sent', values: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
    ],
    docs: [{ kind: 'label', title: 'Parcel', fields: ['to', 'sent'] }],
    target: 0,
    pWrong: 0.6,
    wrongable: ['sent'],
    grammar: ['gr-3-005'],
  },
  {
    id: 'pt_c_form',
    rank: 3,
    arch: 'check',
    person: 'client',
    say: 'My name is {name}. I live at {address}.',
    fields: [
      { id: 'name', label: 'Name', values: [ROSE, JOE, NORA, GRANT, KEN] },
      { id: 'address', label: 'Address', values: ['6 North Street', '6 South Street', '16 North Street', '9 East Street', '9 West Street'] },
    ],
    docs: [{ kind: 'card', title: 'Form', fields: ['name', 'address'] }],
    target: 0,
    pWrong: 0.6,
    wrongable: ['name', 'address'],
    grammar: ['gr-5-003'],
  },
  { id: 'pt_care', rank: 3, arch: 'trade', say: '{Qty1}, please. Be careful. There is a {word1} in the box.', slots: { qty1: { kind: 'qty', tags: ['box'], min: 1, max: 2 }, word1: { kind: 'word', ids: ['clock', 'lamp', 'mirror', 'plate', 'camera', 'radio', 'vase'].map(wid) } }, pay: 'round', grammar: ['gr-5-020'] },
  {
    id: 'pt_c_inside',
    rank: 3,
    arch: 'check',
    person: 'client',
    say: 'There is a {inside} in this parcel.',
    fields: [
      { id: 'to', label: 'To', values: [IVY, BELL, ANNA] },
      { id: 'inside', label: 'Inside', values: ['clock', 'lamp', 'mirror', 'plate', 'camera', 'radio', 'vase', 'doll', 'bucket'] },
    ],
    docs: [{ kind: 'label', title: 'Parcel', fields: ['to', 'inside'] }],
    target: 0,
    pWrong: 0.6,
    wrongable: ['inside'],
    grammar: ['gr-5-020'],
  },
  { id: 'pt_q3', rank: 3, arch: 'respond', mode: 'choose', bank: 'counter', kind: 'speech', person: 'client' },
  { id: 'pt_q3b', rank: 3, arch: 'respond', mode: 'choose', bank: 'trouble', kind: 'speech', person: 'client' },
  {
    id: 'pt_cal3',
    rank: 3,
    arch: 'respond',
    mode: 'slot',
    kind: 'speech',
    person: 'client',
    layout: 'calendar',
    rows: days('tue', 'thu', 'fri', 'sat'),
    cols: [{ id: 'am', label: 'Morning' }, { id: 'pm', label: 'Afternoon' }],
    want: [
      { tag: 'tue', text: 'I want to send a parcel by boat on Tuesday.' },
      { tag: 'thu', text: 'The plane leaves on Thursday, so I will come on Thursday.' },
      { tag: 'fri', text: 'I will come on Friday.' },
      { tag: 'am', text: 'I can come in the morning.' },
      { tag: 'pm', text: 'I can come only in the afternoon.' },
    ],
    avoid: [{ tag: 'sat', text: 'I cannot come on Saturday.' }, { tag: 'am', text: 'Not in the morning, please.' }, { tag: 'tue', text: 'Not on Tuesday, please.' }],
    busy: [IVY, TOM, ROSE, JOE, NORA, 'Closed'],
    grammar: ['gr-4-004'],
  },
  // ---- rank 4
  { id: 'pt_service', rank: 4, arch: 'sort', say: 'Look at the word on each letter.', count: [4, 5], bins: ['express', 'registered', 'ordinary', 'hold'], patterns: [{ text: 'Express: I need it tomorrow.', bins: ['express'] }, { text: 'Express: it is for tomorrow.', bins: ['express'] }, { text: 'Registered: please sign here.', bins: ['registered'] }, { text: 'Registered: please do not leave it at the door.', bins: ['registered'] }, { text: 'A postcard from {Name}.', bins: ['ordinary'] }, { text: 'A birthday card for {Name}.', bins: ['ordinary'] }, { text: '{Name} will come for it on Friday.', bins: ['hold'] }, { text: '{Name} will come for this one tomorrow.', bins: ['hold'] }], grammar: ['gr-4-003', 'gr-4-002'] },
  { id: 'pt_rel', rank: 4, arch: 'sort', say: 'Some letters have only a job on them. Think about the places.', count: [4, 4], bins: ['school', 'hospital', 'station', 'bank', 'church', 'library'], patterns: [{ text: 'For the woman who works at the hospital', bins: ['hospital'] }, { text: 'For the man who works at the station', bins: ['station'] }, { text: 'For the boy who studies at the school', bins: ['school'] }, { text: 'For the man who keeps the money at the bank', bins: ['bank'] }, { text: 'For the man who works at the church', bins: ['church'] }, { text: 'For the woman who works at the library', bins: ['library'] }], grammar: ['gr-3-007'] },
  { id: 'pt_pass', rank: 4, arch: 'sort', say: 'Look at what happened to each letter.', count: [4, 4], bins: ['back', 'hold', 'island'], patterns: [{ text: 'This letter was sent to the wrong address.', bins: ['back'] }, { text: 'This card was returned by the post office in the city.', bins: ['back'] }, { text: 'This parcel was brought by boat from the island.', bins: ['hold'] }, { text: 'This letter will be sent by boat tomorrow.', bins: ['island'] }, { text: 'This parcel will be taken to the island by boat.', bins: ['island'] }], grammar: ['gr-3-006', 'gr-3-005'] },
  {
    id: 'pt_c_two',
    rank: 4,
    arch: 'check',
    person: 'client',
    say: 'I am sending a {weight} parcel to {to} by {how}. It is {kind}.',
    fields: [
      { id: 'to', label: 'To', values: [IVY, BELL, ANNA, HALE] },
      { id: 'weight', label: 'Weight', values: ['heavy', 'light'] },
      { id: 'how', label: 'By', values: ['boat', 'plane', 'train'] },
      { id: 'kind', label: 'Kind', values: ['registered', 'express', 'ordinary'] },
    ],
    docs: [
      { kind: 'order', title: 'My form', fields: ['to', 'how', 'kind'] },
      { kind: 'label', title: 'Label', fields: ['to', 'how', 'kind'] },
    ],
    target: 1,
    pWrong: 0.6,
    wrongable: ['to', 'how', 'kind'],
  },
  {
    id: 'pt_c_track',
    rank: 4,
    arch: 'check',
    person: 'client',
    say: 'The tracking number of my parcel is {track}.',
    fields: [
      { id: 'to', label: 'To', values: [BELL, IVY, HALE] },
      { id: 'track', label: 'Tracking number', values: ['4815', '4851', '4518', '8415', '5148'] },
    ],
    docs: [{ kind: 'label', title: 'Receipt', fields: ['to', 'track'] }],
    target: 0,
    pWrong: 0.6,
    wrongable: ['track'],
  },
  { id: 'pt_q4', rank: 4, arch: 'respond', mode: 'choose', bank: 'counter', kind: 'speech', person: 'client' },
  { id: 'pt_q4b', rank: 4, arch: 'respond', mode: 'choose', bank: 'trouble', kind: 'speech', person: 'client' },
  { id: 'pt_receipt', rank: 4, arch: 'trade', say: 'I would like {qty1} and {qty2}. Could I have a receipt, please?', slots: { qty1: { kind: 'qty', tags: ['counter'], min: 1, max: 3 }, qty2: { kind: 'qty', tags: ['counter'], min: 1, max: 2 } }, pay: 'round', grammar: ['gr-4-007'] },
  { id: 'pt_but', rank: 4, arch: 'trade', say: 'I would like {qty1}, but not {forbid1}. Could I have a receipt, please?', slots: { qty1: { kind: 'qty', tags: ['counter'], min: 1, max: 3 }, forbid1: { kind: 'forbid', tags: ['counter'] } }, pay: 'round', grammar: ['gr-4-007'] },
  { id: 'pt_have', rank: 4, arch: 'trade', features: ['audioOnly'], say: 'I have some letters to send. Please give me {qty1}, and {qty2} for the letters.', slots: { qty1: { kind: 'qty', tags: ['counter'], min: 1, max: 2 }, qty2: { kind: 'qty', tags: ['counter'], min: 2, max: 4 } }, pay: 'round', grammar: ['gr-4-007', 'gr-4-008'] },
  // ---- rank 5
  { id: 'pt_note5', rank: 5, arch: 'sort', say: 'Read the notes on the letters carefully.', count: [4, 5], bins: ['redirect', 'back', 'hold', 'express'], patterns: [{ text: 'Please send my letters to my new address in the city.', bins: ['redirect'] }, { text: 'My address is new. Please send my letters to the island.', bins: ['redirect'] }, { text: 'Nobody lives here now. Please send this back.', bins: ['back'] }, { text: 'Nobody has come for this parcel for a long time.', bins: ['back'] }, { text: 'Keep my letters until I return from abroad.', bins: ['hold'] }, { text: 'The owner has asked for it to be kept until Friday.', bins: ['hold'] }, { text: 'This is urgent. I need it by noon.', bins: ['express'] }, { text: 'It is urgent, so please send it express.', bins: ['express'] }], grammar: ['gr-4-011', 'gr-3-003'] },
  { id: 'pt_claim', rank: 5, arch: 'sort', say: 'Put each letter in the right box, please.', count: [4, 4], bins: ['claims', 'redirect', 'hold'], patterns: [{ text: 'I would like to complain about my late parcel.', bins: ['claims'] }, { text: 'The box was broken when it arrived, and I want my money back.', bins: ['claims'] }, { text: 'My address is new. Please send my letters to the island.', bins: ['redirect'] }, { text: 'I will come for it myself, provided that it arrives before Friday.', bins: ['hold'] }], grammar: ['gr-pre2-009'] },
  {
    id: 'pt_c_decl',
    rank: 5,
    arch: 'check',
    person: 'client',
    say: 'My parcel is going to {to}. It is {weight} and {kind}. The value is {value}.',
    fields: [
      { id: 'to', label: 'To', values: [BELL, IVY, HALE] },
      { id: 'weight', label: 'Weight', values: ['12 kilos', '21 kilos', '8 kilos', '18 kilos'] },
      { id: 'kind', label: 'Kind', values: ['registered', 'express'] },
      { id: 'value', label: 'Value', values: ['40 coins', '14 coins', '90 coins', '19 coins'] },
    ],
    docs: [
      { kind: 'order', title: 'My form', fields: ['to', 'weight', 'kind', 'value'] },
      { kind: 'label', title: 'Label', fields: ['to', 'weight', 'kind', 'value'] },
    ],
    target: 1,
    pWrong: 0.65,
    wrongable: ['to', 'weight', 'kind', 'value'],
  },
  { id: 'pt_q5', rank: 5, arch: 'respond', mode: 'choose', bank: 'trouble', kind: 'speech', person: 'client' },
  { id: 'pt_q5b', rank: 5, arch: 'respond', mode: 'choose', bank: 'counter', kind: 'speech', person: 'client' },
  { id: 'pt_if5', rank: 5, arch: 'trade', say: 'I would like {qty1}, and I would like {qty2}, too. I will pay in cash.', slots: { qty1: { kind: 'qty', tags: ['counter'], min: 2, max: 3 }, qty2: { kind: 'qty', tags: ['counter'], min: 1, max: 2 } }, pay: 'round', grammar: ['gr-4-007'] },
  { id: 'pt_q3c', rank: 3, arch: 'respond', mode: 'choose', bank: 'phone', kind: 'phone', person: 'client' },
  { id: 'pt_q4c', rank: 4, arch: 'respond', mode: 'choose', bank: 'notice', kind: 'memo', person: 'client' },
  { id: 'pt_q4d', rank: 4, arch: 'respond', mode: 'choose', bank: 'phone', kind: 'phone', person: 'client' },
  {
    id: 'pt_cal4',
    rank: 4,
    arch: 'respond',
    mode: 'slot',
    kind: 'speech',
    person: 'client',
    layout: 'calendar',
    rows: days('wed', 'thu', 'fri', 'sat'),
    cols: [{ id: 'am', label: 'Morning' }, { id: 'pm', label: 'Afternoon' }],
    cellTags: { sat: ['weekend'] },
    want: [
      { tag: 'wed', text: 'I want to send a parcel by plane. The plane leaves on Wednesday.' },
      { tag: 'thu', text: 'I can come on Thursday.' },
      { tag: 'fri', text: 'I want to come on Friday.' },
      { tag: 'pm', text: 'I work until noon, so I can come only in the afternoon.' },
      { tag: 'am', text: 'I can come in the morning.' },
    ],
    avoid: [{ tag: 'am', text: 'I cannot come in the morning.' }, { tag: 'sat', text: 'I cannot come at the weekend.' }, { tag: 'wed', text: 'And not on Wednesday, please.' }],
    busy: [IVY, TOM, ROSE, JOE, NORA, 'Closed'],
    grammar: ['gr-3-019'],
  },
  {
    id: 'pt_c_value',
    rank: 4,
    arch: 'check',
    person: 'client',
    say: 'I am sending {inside}. The value is {value}.',
    fields: [
      { id: 'inside', label: 'Inside', values: ['two books and a scarf', 'three cups', 'a vase', 'two bottles of medicine', 'a clock', 'a lamp', 'two jackets', 'a camera', 'three hats', 'a bucket of toys'] },
      { id: 'value', label: 'Value', values: ['20 coins', '30 coins', '13 coins', '50 coins', '15 coins'] },
    ],
    docs: [
      { kind: 'order', title: 'My form', fields: ['inside', 'value'] },
      { kind: 'label', title: 'Label', fields: ['inside', 'value'] },
    ],
    target: 1,
    pWrong: 0.6,
    wrongable: ['inside', 'value'],
  },
  { id: 'pt_rel4', rank: 4, arch: 'sort', say: 'Think about who lives where.', count: [4, 4], bins: ['school', 'hospital', 'bank', 'library', 'station'], patterns: [{ text: 'For {Name}, who works at {bin}', bins: ['hospital', 'bank', 'library', 'station'] }, { text: 'For {Name}, who studies at {bin}', bins: ['school', 'library'] }], grammar: ['gr-3-007'] },
  { id: 'pt_q5c', rank: 5, arch: 'respond', mode: 'choose', bank: 'notice', kind: 'memo', person: 'client' },
  { id: 'pt_q5d', rank: 5, arch: 'respond', mode: 'choose', bank: 'phone', kind: 'phone', person: 'client' },
  {
    id: 'pt_c_date',
    rank: 5,
    arch: 'check',
    person: 'client',
    say: 'The parcel must arrive before {date}, and I want it {kind}.',
    fields: [
      { id: 'date', label: 'Arrive before', values: ['1 May', '11 May', '10 May', '1 June', '11 June'] },
      { id: 'kind', label: 'Kind', values: ['express', 'registered'] },
    ],
    docs: [
      { kind: 'order', title: 'My form', fields: ['date', 'kind'] },
      { kind: 'label', title: 'Label', fields: ['date', 'kind'] },
    ],
    target: 1,
    pWrong: 0.6,
    wrongable: ['date', 'kind'],
  },
  {
    id: 'pt_cal5',
    rank: 5,
    arch: 'respond',
    mode: 'slot',
    kind: 'speech',
    person: 'client',
    layout: 'calendar',
    rows: days('tue', 'wed', 'thu', 'fri'),
    cols: [{ id: 'am', label: 'Morning' }, { id: 'pm', label: 'Afternoon' }],
    want: [
      { tag: 'tue', text: 'I am free on Tuesday.' },
      { tag: 'wed', text: 'I am free on Wednesday.' },
      { tag: 'thu', text: 'I am free on Thursday.' },
      { tag: 'pm', text: 'If possible, I would like to come in the afternoon.' },
      { tag: 'am', text: 'If possible, I would like to come in the morning.' },
    ],
    avoid: [{ tag: 'fri', text: 'Unless it is necessary, not on Friday.' }, { tag: 'wed', text: 'Anything except Wednesday is fine.' }, { tag: 'am', text: 'I will not be free in the morning.' }],
    busy: [IVY, TOM, ROSE, JOE, NORA, 'Closed'],
    grammar: ['gr-pre2-005', 'gr-3-018'],
  },
  { id: 'pt_pass5', rank: 5, arch: 'sort', say: '{Mrs. Wren|@} has written a note on each letter. Which box?', count: [4, 4], bins: ['claims', 'hold', 'back'], patterns: [{ text: 'We are sorry. A refund will be sent to the customer.', bins: ['claims'] }, { text: 'The owner will come for it on Friday.', bins: ['hold'] }, { text: 'Nobody lives at this address, so it has been returned.', bins: ['back'] }, { text: 'The customer says the parcel was broken. We must check it.', bins: ['claims'] }, { text: '{Name} will come for it after lunch.', bins: ['hold'] }, { text: '{Name} has moved, so this letter has been sent back.', bins: ['back'] }], grammar: ['gr-3-006', 'gr-pre2-045'] },
];

// ---------------------------------------------------------------------------- questions at the window
// An answer is the distractor of every question of another function: keep each answer clearly tied to its own question.
const QA: Record<string, QaItem[]> = {
  counter: [
    { q: 'Good morning!', a: 'Good morning. Can I help you?', fn: 'greeting', rank: 1, phrases: ['ph-5-0002'] },
    { q: 'How much is a stamp?', a: 'It is two coins.', fn: 'price', rank: 1, grammar: ['gr-5-014'], phrases: ['ph-5-0044'] },
    { q: 'How much is a postcard?', a: 'It is three coins.', fn: 'price', rank: 1, grammar: ['gr-5-014'] },
    { q: 'Where is the station?', a: 'It is next to the bank.', fn: 'place', rank: 1, grammar: ['gr-5-013'], phrases: ['ph-5-0089'] },
    { q: 'Where is the library?', a: 'It is across from the church.', fn: 'place', rank: 1, grammar: ['gr-5-013'], phrases: ['ph-5-0089'] },
    { q: 'Thank you!', a: 'You are welcome.', fn: 'thanks', rank: 1, phrases: ['ph-5-0014', 'ph-5-0016'] },
    { q: 'Can I have an envelope, please?', a: 'Sure. Here you are.', fn: 'request', rank: 1, grammar: ['gr-5-015'], phrases: ['ph-4-0004'] },
    { q: 'I am sorry!', a: 'That is all right.', fn: 'apology', rank: 1, phrases: ['ph-5-0019', 'ph-5-0020'] },
    { q: 'What is your name?', a: 'My name is {Mrs. Wren|@}.', fn: 'name', rank: 1, grammar: ['gr-5-013'], phrases: ['ph-5-0038'] },
    { q: 'Is the post office open today?', a: 'Yes, we are open until five.', fn: 'open', rank: 2, grammar: ['gr-5-002'] },
    { q: 'When is the post office open?', a: 'From nine until five.', fn: 'time', rank: 2, grammar: ['gr-5-013'] },
    { q: 'Is the post office open on Sunday?', a: 'No, we are closed on Sunday.', fn: 'closed', rank: 2, grammar: ['gr-5-002'] },
    { q: 'How much is a notebook?', a: 'It is four coins.', fn: 'price', rank: 2, grammar: ['gr-5-014'] },
    { q: 'Which street is the school on?', a: 'It is on West Street.', fn: 'place', rank: 2, grammar: ['gr-5-021'] },
    { q: 'Could you tell me how much it is to send this to the island?', a: 'It is six coins by boat.', fn: 'price', rank: 3, grammar: ['gr-3-010'] },
    { q: 'Could you tell me when the boat leaves?', a: "At ten o'clock.", fn: 'time', rank: 3, grammar: ['gr-3-010'] },
    { q: 'Has my letter arrived yet?', a: 'No, not yet. Please wait.', fn: 'status', rank: 3, grammar: ['gr-3-002'] },
    { q: 'Is there a post office on the island?', a: 'Yes, there is a small one.', fn: 'exist', rank: 3, grammar: ['gr-5-020'] },
    { q: 'How heavy is this parcel?', a: 'It is five kilos.', fn: 'weight', rank: 3, grammar: ['gr-4-014'] },
    { q: 'How long does it take by plane?', a: 'It takes two days.', fn: 'duration', rank: 3, phrases: ['ph-4-0032'] },
    { q: 'Goodbye!', a: 'Goodbye. Have a nice day!', fn: 'farewell', rank: 4, phrases: ['ph-5-0006', 'ph-5-0068'] },
    { q: 'Could I have a receipt, please?', a: 'Of course. Here it is.', fn: 'request2', rank: 4 },
    { q: 'Where is my parcel now?', a: 'Let me check. It was sent on Monday.', fn: 'status2', rank: 4, grammar: ['gr-3-005'] },
    { q: 'What should I do if my parcel is lost?', a: 'Please tell us. We will look for it.', fn: 'advice', rank: 4, grammar: ['gr-4-005', 'gr-3-018'] },
    { q: 'Do you offer delivery to the island?', a: 'Yes, but it costs three coins more.', fn: 'service', rank: 4, phrases: ['ph-2-0520'] },
    { q: 'May I use your pen?', a: 'Yes, of course. Here it is.', fn: 'permission', rank: 2, phrases: ['ph-5-0087'] },
    { q: 'Do you sell newspapers?', a: 'No, but the shop next to the bank does.', fn: 'shop', rank: 2, grammar: ['gr-5-004'] },
    { q: 'I am looking for the bank.', a: 'Go straight, and turn left at the church.', fn: 'directions', rank: 2, phrases: ['ph-4-0047'] },
    { q: 'What day is it today?', a: 'It is Tuesday.', fn: 'day', rank: 2, phrases: ['ph-5-0043'] },
    { q: 'What time does the post office close?', a: "At five o'clock.", fn: 'closing', rank: 2, grammar: ['gr-5-013'] },
    { q: 'Is this box big enough for my books?', a: 'Yes, it is big enough.', fn: 'size', rank: 3, grammar: ['gr-3-030'] },
    { q: 'Do I have to fill in a form?', a: 'Yes, please fill it in here.', fn: 'form', rank: 3, grammar: ['gr-4-003'] },
    { q: 'What is in the box?', a: 'There are two books and a scarf.', fn: 'contents', rank: 3, grammar: ['gr-5-020'] },
    { q: 'Can I send a cake by boat?', a: 'Not a cake. It will not stay fresh.', fn: 'food', rank: 3 },
    { q: 'Does this parcel need insurance?', a: 'Yes, because it has glass inside.', fn: 'insurance', rank: 4, grammar: ['gr-4-019'] },
    { q: 'Is there an extra charge for express?', a: 'Yes, express costs three coins more.', fn: 'express', rank: 4, grammar: ['gr-4-014'] },
    { q: 'Can I change the address after I send it?', a: 'Yes, if it has not left the post office.', fn: 'change', rank: 4, grammar: ['gr-3-018'] },
    { q: 'Is ordinary mail cheaper than express?', a: 'Yes, but it takes more time.', fn: 'speed', rank: 4, grammar: ['gr-4-014'] },
    { q: 'Do you deliver on weekdays?', a: 'Yes, from Monday to Friday.', fn: 'weekdays', rank: 4 },
    { q: 'I am sending a vase. It is fragile.', a: 'Thank you. I will write “Fragile” on the box.', fn: 'fragile', rank: 5, grammar: ['gr-3-005'] },
    { q: 'Is it possible to send a letter to a ship?', a: 'Yes, provided that you know the name of the ship and the port.', fn: 'ship', rank: 5, grammar: ['gr-pre2-009'] },
    { q: 'What do you do if nobody is at home?', a: 'We keep the parcel here, and you can come for it at the counter.', fn: 'nobody', rank: 5, grammar: ['gr-4-019'] },
    { q: 'Am I allowed to send medicine abroad?', a: 'Yes, but you must declare it on the form.', fn: 'rules', rank: 5, grammar: ['gr-4-003'] },
    { q: 'Is there a bus stop near here?', a: 'Yes, it is next to the station.', fn: 'busstop', rank: 2, grammar: ['gr-5-020'] },
    { q: 'Do you have a map of the town?', a: 'Yes, here you are.', fn: 'map', rank: 2, phrases: ['ph-4-0043'] },
    { q: 'Can I send a hat or a coat in this box?', a: 'Yes, it is big enough for a coat.', fn: 'clothes', rank: 3, grammar: ['gr-3-030'] },
    { q: 'Is the boat full today?', a: 'No, there is room for your parcel.', fn: 'full', rank: 3, grammar: ['gr-5-020'] },
    { q: 'Can I use the telephone?', a: 'Yes, it is on the counter.', fn: 'phone', rank: 4, grammar: ['gr-5-015'] },
    { q: 'Is my form complete?', a: 'Not yet. Please write the date.', fn: 'complete', rank: 4, grammar: ['gr-5-011'] },
    { q: 'It is a glass vase. Please be careful.', a: 'Do not worry. I will write “Fragile” on the box.', fn: 'glass', rank: 4, grammar: ['gr-5-011'] },
    { q: 'Dear {Mrs. Wren|@}, I sent a letter to a ship in the port, but it came back. Why?', a: 'The ship had left the port before the letter arrived.', fn: 'ship2', rank: 5, grammar: ['gr-pre2-001'] },
    { q: 'I am sorry. I put the wrong stamp on my letter myself.', a: 'That is all right. Neither you nor I saw it.', fn: 'myself', rank: 5, grammar: ['gr-pre2-030'] },
  ],
  trouble: [
    { q: 'My letter has not arrived.', a: 'I am sorry. We will look for it.', fn: 'lost', rank: 3, grammar: ['gr-3-002'] },
    { q: 'The boat is late again!', a: 'I am sorry. It will come tomorrow.', fn: 'late', rank: 3, grammar: ['gr-4-002'] },
    { q: 'My parcel arrived broken.', a: 'I am very sorry. We will give you a refund.', fn: 'refund', rank: 3, grammar: ['gr-3-014'] },
    { q: 'You sent my parcel to the wrong address.', a: 'I am very sorry. We will send it again.', fn: 'wrong', rank: 3 },
    { q: 'Nobody told me that the post office was closed.', a: 'I am sorry. We put a notice on the door.', fn: 'notice', rank: 4, grammar: ['gr-3-005'] },
    { q: 'I waited for an hour, and nobody helped me.', a: 'I am terribly sorry for the long wait.', fn: 'wait', rank: 4 },
    { q: 'I paid for express, but my parcel came on the boat.', a: 'We will look into the matter and give you back the extra money.', fn: 'express', rank: 4, grammar: ['gr-3-005'] },
    { q: 'I would like to make a complaint.', a: 'Of course. What seems to be the problem?', fn: 'complaint', rank: 5, phrases: ['ph-2-0139'] },
    { q: 'The stamp on my letter is wrong, and it came back.', a: 'I am sorry. We will put on a new stamp and send it again.', fn: 'stamp', rank: 4, grammar: ['gr-3-005'] },
    { q: 'I think someone opened my parcel.', a: 'That is serious. May I see the parcel and your receipt?', fn: 'opened', rank: 5, grammar: ['gr-3-005'] },
    { q: 'If you had told me about the holiday, I would have come on another day.', a: 'You are right. We should have put a notice on the door.', fn: 'holiday', rank: 5, grammar: ['gr-2-001', 'gr-pre2-010'] },
  ],
  phone: [
    { q: 'Hello. Is the post office open on Saturday?', a: 'Yes, from nine until noon.', fn: 'hours', rank: 3, grammar: ['gr-5-002'] },
    { q: 'Hello. Is my parcel there?', a: 'Yes, you can collect it today.', fn: 'parcel', rank: 3, grammar: ['gr-5-015'] },
    { q: 'Good morning. Could I speak to {Mrs. Wren|@}, please?', a: 'One moment, please. I will call her.', fn: 'transfer', rank: 3, phrases: ['ph-3-0002'] },
    { q: 'Hello. How much is it to send a box to another country?', a: 'It depends on the weight. How heavy is it?', fn: 'price', rank: 4, grammar: ['gr-5-014'] },
    { q: 'Hello. My parcel has not arrived. The tracking number is 4815.', a: 'Thank you. Please wait. I will check the number.', fn: 'track', rank: 4, grammar: ['gr-3-002'] },
    { q: 'Good morning. I would like to make a complaint about my parcel.', a: 'I am sorry to hear that. What seems to be the problem?', fn: 'complaint', rank: 5, phrases: ['ph-2-0139'] },
  ],
  notice: [
    { q: 'Notice: because of the holiday, parcels will be delivered on Tuesday, not on Monday. I am sending a parcel today. When will it be delivered?', a: 'It will be delivered on Tuesday.', fn: 'holiday', rank: 4, grammar: ['gr-3-005'] },
    { q: 'Notice: the post office will close at three on Friday. Can I send a parcel at four?', a: 'No, please come before three.', fn: 'closing', rank: 4, grammar: ['gr-4-002'] },
    { q: 'Notice: stamps will cost three coins from Monday. How much will a stamp cost next week?', a: 'It will cost three coins.', fn: 'price', rank: 4, grammar: ['gr-4-002'] },
    { q: 'Notice: parcels for the island will go on Tuesday and Friday. I have a parcel for the island. When can it go?', a: 'It can go on Tuesday or Friday.', fn: 'when', rank: 4, grammar: ['gr-3-005'] },
    { q: 'Notice: registered mail must be signed for. Can my neighbour take my registered letter?', a: 'Yes, if he signs for it.', fn: 'sign', rank: 5, grammar: ['gr-3-018'] },
    { q: 'Notice: unless a form is complete, the parcel cannot be sent. My form has no date. Can you send it?', a: 'Not yet. Please write the date first.', fn: 'form', rank: 5, grammar: ['gr-3-018'] },
    { q: 'Notice: the boats will not leave during the storm. My parcel is for the island. Will it arrive today?', a: 'No, it will wait here until the boats leave again.', fn: 'storm', rank: 5, grammar: ['gr-3-005'] },
  ],
};

// ---------------------------------------------------------------------------- the people, the counter, the cubbies
const PEOPLE = [
  { id: 'p_wren', name: 'Mrs. Wren', avatar: '👩‍🦳' },
  { id: 'c_boy', name: '', avatar: '' },
  { id: 'c_grandma', name: '', avatar: '' },
  { id: 'c_docker', name: '', avatar: '' },
  { id: 'c_sailor', name: '', avatar: '' },
  { id: 'c_cook', name: '', avatar: '' },
  { id: 'c_merchant', name: '', avatar: '' },
  { id: 'c_scholar', name: '', avatar: '' },
  { id: 'c_mom', name: '', avatar: '' },
  { id: 'c_girl', name: '', avatar: '' },
  { id: 'c_oldman', name: '', avatar: '' },
  { id: 'c_doctor', name: '', avatar: '' },
  { id: 'c_student', name: '', avatar: '' },
  { id: 'c_baker', name: '', avatar: '' },
  { id: 'p_ivy', name: 'Ivy', avatar: '👩' },
  { id: 'p_bell', name: 'Mr. Bell', avatar: '👨‍🦳' },
];

const BINS = [
  { id: 'school', label: 'School', ref: 'the school', art: 'school' },
  { id: 'hospital', label: 'Hospital', ref: 'the hospital', art: 'hospital' },
  { id: 'bank', label: 'Bank', ref: 'the bank', art: 'bank' },
  { id: 'inn', label: 'Inn', ref: 'the inn', art: 'inn' },
  { id: 'station', label: 'Station', ref: 'the station', art: 'station' },
  { id: 'library', label: 'Library', ref: 'the library', art: 'library' },
  { id: 'park', label: 'Park', ref: 'the park', art: 'park' },
  { id: 'church', label: 'Church', ref: 'the church', art: 'church' },
  { id: 'north', label: 'North Street', ref: 'North Street', art: 'north' },
  { id: 'south', label: 'South Street', ref: 'South Street', art: 'south' },
  { id: 'east', label: 'East Street', ref: 'East Street', art: 'east' },
  { id: 'west', label: 'West Street', ref: 'West Street', art: 'west' },
  { id: 'mon', label: 'Monday', ref: 'Monday' },
  { id: 'tue', label: 'Tuesday', ref: 'Tuesday' },
  { id: 'wed', label: 'Wednesday', ref: 'Wednesday' },
  { id: 'thu', label: 'Thursday', ref: 'Thursday' },
  { id: 'fri', label: 'Friday', ref: 'Friday' },
  { id: 'sat', label: 'Saturday', ref: 'Saturday' },
  { id: 'sun', label: 'Sunday', ref: 'Sunday' },
  { id: 'island', label: 'Island', ref: 'the island', art: 'island' },
  { id: 'abroad', label: 'Abroad', ref: 'another country', art: 'abroad' },
  { id: 'back', label: 'Send back', ref: 'Send back', art: 'back' },
  { id: 'boat', label: 'By boat', ref: 'by boat' },
  { id: 'plane', label: 'By plane', ref: 'by plane' },
  { id: 'train', label: 'By train', ref: 'by train' },
  { id: 'light', label: 'Light', ref: 'the light box' },
  { id: 'heavy', label: 'Heavy', ref: 'the heavy box' },
  { id: 'express', label: 'Express', ref: 'Express' },
  { id: 'registered', label: 'Registered', ref: 'Registered' },
  { id: 'ordinary', label: 'Ordinary mail', ref: 'Ordinary mail' },
  { id: 'hold', label: 'Keep here', ref: 'Keep here' },
  { id: 'redirect', label: 'New address', ref: 'New address' },
  { id: 'claims', label: 'Complaints', ref: 'Complaints' },
];

const THINGS = [
  { id: 't_stamp', word: 'stamp', art: 'stamp', tags: ['counter', 'stamp'], price: 2, max: 5 },
  { id: 't_envelope', word: 'envelope', art: 'envelope', tags: ['counter'], price: 1, max: 5 },
  { id: 't_postcard', word: 'postcard', art: 'postcard', tags: ['counter'], price: 3, max: 4 },
  { id: 't_box', word: 'box', art: 'box', tags: ['counter', 'box'], plural: 'boxes', price: 5, max: 2 },
  { id: 't_notebook', word: 'notebook', art: 'doc_book', tags: ['counter'], price: 4, max: 3 },
];

// ---------------------------------------------------------------------------- reactions and lines
const rx = (id: string, kind: JobContent['reactions'][number]['kind'], text: string, face: Face, extra: { rank?: number; arch?: JobContent['reactions'][number]['arch'] } = {}) => ({ id, kind, text, face, ...extra });

const REACTIONS: JobContent['reactions'] = [
  rx('pr_ok1', 'perfect', 'Good job!', 'happy', { arch: 'sort' }),
  rx('pr_ok2', 'perfect', 'Perfect. Thank you.', 'delighted', { arch: 'sort' }),
  rx('pr_ok2b', 'perfect', 'Every letter is in the right box. Thank you!', 'happy', { arch: 'sort', rank: 2 }),
  rx('pr_ok3', 'perfect', 'Thank you!', 'happy', { arch: 'trade' }),
  rx('pr_ok4', 'perfect', 'Thank you very much. Goodbye!', 'delighted', { arch: 'trade' }),
  rx('pr_ok4b', 'perfect', 'That is right. Have a nice day!', 'happy', { arch: 'trade', rank: 2 }),
  rx('pr_ok5', 'perfect', 'Good eyes! Thank you.', 'delighted', { arch: 'check' }),
  rx('pr_ok5b', 'perfect', 'Yes, that is right. Thank you.', 'happy', { arch: 'check' }),
  rx('pr_ok6', 'perfect', 'Oh, thank you. That helps.', 'happy', { arch: 'respond' }),
  rx('pr_ok6b', 'perfect', 'Great, thank you!', 'delighted', { arch: 'respond' }),
  rx('pr_minor_sort', 'minor', 'Good. But one is in the wrong box.', 'neutral', { arch: 'sort' }),
  rx('pr_minor_fix', 'wrong_fix', 'Almost. But that is not the right {field}.', 'neutral', { arch: 'check' }),
  rx('pr_minor', 'minor', 'Thank you. But please be fast next time.', 'neutral'),
  rx('pr_bin1', 'wrong_bin', 'No, no. This one goes in “{bin}”.', 'puzzled'),
  rx('pr_bin2', 'wrong_bin', 'Check the address, please. This one goes in “{bin}”.', 'sad', { rank: 2 }),
  rx('pr_bin3', 'wrong_bin', 'Oh no! It is in the wrong box. It goes in “{bin}”.', 'angry', { rank: 2 }),
  rx('pr_goods1', 'wrong_goods', 'No, sorry. That is not what I want.', 'puzzled'),
  rx('pr_goods2', 'wrong_goods', 'No. Look again, please.', 'puzzled'),
  rx('pr_short', 'change_short', 'My change is not right. I need more.', 'angry'),
  rx('pr_over', 'change_over', 'Oh! That is too much change. Here.', 'puzzled'),
  rx('pr_missed', 'missed', 'Oh no! Look at the {field}. It is wrong!', 'angry'),
  rx('pr_false', 'false_alarm', 'No, no. It is right. Look again, please.', 'puzzled'),
  rx('pr_wfield', 'wrong_field', 'No. The {field} is right. Look again, please.', 'puzzled'),
  rx('pr_reply', 'wrong_reply', 'Sorry? That is not what I want.', 'puzzled'),
  rx('pr_reply2', 'wrong_reply', 'Sorry? I do not know. Say it again, please.', 'sad', { rank: 2 }),
  rx('pr_slot', 'wrong_slot', "Oh, I can't come then.", 'sad'),
  rx('pr_form', 'wrong_form', 'No, that is not right. Look again, please.', 'puzzled'),
  rx('pr_ok7', 'perfect', 'Thank you. See you next week!', 'happy', { arch: 'trade', rank: 3 }),
  rx('pr_ok8', 'perfect', 'Thank you. You are very kind.', 'delighted', { arch: 'respond', rank: 4 }),
  rx('pr_missed3', 'missed', 'Oh no! The {field} on the paper is wrong!', 'angry', { rank: 3 }),
  rx('pr_cat', 'perfect', 'Good job! Even the cat is happy.', 'delighted', { arch: 'sort', rank: 2 }),
  rx('pr_fail', 'any_fail', 'Oh, no. That is wrong.', 'sad'),
];

const LINES: JobContent['lines'] = [
  { id: 'pl_s1', kind: 'start', text: 'Good morning! We have a lot of letters today.' },
  { id: 'pl_s2', kind: 'start', text: 'Hello! Come in, come in. The letters are here.' },
  { id: 'pl_s3', kind: 'start', text: 'Good morning! My cat is in the box again. Do not put the letters in that box!', rank: 2 },
  { id: 'pl_s4', kind: 'start', text: 'Hello! Please look at each street and number today. A lot of people moved.', rank: 3 },
  { id: 'pl_s5', kind: 'start', text: 'Good morning! The boat is late today, so a lot of people will ask about their parcels.', rank: 4 },
  { id: 'pl_s6', kind: 'start', text: 'Good morning. Please read each letter carefully today. Some people are not happy.', rank: 5 },
  { id: 'pl_e1', kind: 'end', text: 'Thank you. See you tomorrow!' },
  { id: 'pl_e2', kind: 'end', text: 'Good work today. Here is your money.' },
  { id: 'pl_e3', kind: 'end', text: 'Good work. The island letters will go tomorrow.', rank: 3 },
  { id: 'pl_e4', kind: 'end', text: 'You are a good help. The customers like you.', rank: 4 },
  { id: 'pl_e5', kind: 'end', text: 'You look tired. Go home and rest. Thank you for today.', rank: 5 },
  { id: 'pl_r1', kind: 'rankup', text: 'You are very good at this job now!' },
];

// ---------------------------------------------------------------------------- the job
const EN: JobContent = {
  sign: 'POST OFFICE',
  lexicon: LEX,
  pages: PAGES,
  forms: { ...EXTRA_FORMS, is: ['be', 'been'], grandmother: ["grandmother's"], cheap: ['cheapest'] },
  people: PEOPLE,
  boss: 'p_wren',
  things: THINGS,
  sort: { item: 'letter', bins: BINS },
  trade: { coins: [1, 5, 10], board: 'Prices' },
  tasks: [R1, R2, R3, R4, R5].flatMap((rank) => rank.map((t, i) => ({ ...t, seq: i + 1 }))),
  templates: TEMPLATES,
  qa: QA,
  reactions: REACTIONS,
  lines: LINES,
};

export const POST_JOB: JobDef = {
  id: 'post',
  nameJa: '郵便局',
  blurbJa: '手紙を宛名どおりに仕分け、窓口で切手やはがきを売り、ラベルや書類を確かめ、問い合わせに答える。場所・通り・曜日・重さ・送り先・苦情まで。',
  icon: '📮',
  domains: ['communication', 'transport', 'money', 'shopping', 'travel', 'office', 'housing'],
  archetypes: ['sort', 'trade', 'check', 'respond'],
  ranks: [
    { rank: 1, need: { good: 0, words: 0 }, level: { eiken: '4', toeic: null }, tasks: 4, noteJa: '建物の名前で手紙を仕分ける。窓口ではお客さんがぴったりの代金を払う。宛名のラベルを確かめる。' },
    { rank: 2, need: { good: 8, words: 12 }, level: { eiken: '3', toeic: 400 }, unlocks: ['long'], tasks: 5, reward: { coins: 10 }, noteJa: '通りの名前・東西南北・曜日・番地で仕分け（手紙が一通多い）。お客さんが多めに払うので、おつりを渡す。営業時間や電話のメモ。' },
    { rank: 3, need: { good: 30, words: 60 }, level: { eiken: 'pre2', toeic: 500 }, unlocks: ['audioOnly', 'timed', 'multiStep'], tasks: 5, reward: { coins: 15 }, noteJa: '島へ・外国へ・差し戻しの手紙、重さと送り先の確認。窓口の注文を耳だけで聞くこともある（間違いを見つけたら正しい値も選ぶ）。' },
    { rank: 4, need: { good: 70, words: 130 }, level: { eiken: '2', toeic: 600 }, tasks: 6, reward: { coins: 25 }, noteJa: '書留・速達・税関の書類・追跡番号。長いお知らせ文や、くいちがいを探す細かい読み。' },
    { rank: 5, need: { good: 120, words: 210 }, level: { eiken: 'pre1', toeic: 730 }, tasks: 6, reward: { coins: 40 }, noteJa: '保険・補償・苦情の手紙・規則の文書。受け身や仮定法のはいった、局長のような仕事。' },
  ],
  wage: { perfect: 2, minor: 1, fail: 0, bad: 0 },
  opensAfter: 0,
  building: 'post',
  links: { use: [{ good: 'parcels', bonus: 1, line: 'Oh, and the parcels from the office. Thank you!' }] },
  content: { en: EN },
  flavour: 'school',
};
