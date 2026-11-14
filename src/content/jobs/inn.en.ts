import type { AuthoredTask, CheckDoc, JobContent, JobDef, JobLexEntry, QaItem, TaskFeature, TaskTemplate } from '../../jobs/types';
import type { EikenKey } from '../../curriculum/yardsticks';
import type { Pos, VerificationPage } from '../../core/types';
import { KITCHEN_JOB } from './kitchen.en';

/**
 * The inn's front desk (宿の帳場): check documents (what the guest says / writes ↔ the booking book
 * and the bill: name, dates, nights, room, breakfast, prices — mark the line that is wrong, at rank 3+
 * also choose the right value), respond (a guest's question, letter, e-mail or call → the right
 * reply or the message pad; a guest's wishes → the one free room on the inn's floors or the one free
 * time on the week's calendar that fits) and sort (bags, trays, laundry and lost property → the right
 * floor / place). Domains: hotel, travel, housing (+ the weather, money and family words a front desk
 * needs). Rank 1 ≈ 英検4級, 2 ≈ 3級, 3 ≈ 準2級, 4 ≈ 2級.
 *
 * Authored tasks are the spine (seq order inside a rank; each introduces at most two unseen words,
 * and a new word first stands where the layout, a label or the consequence of a wrong answer shows
 * what it means); templates vary the same shapes within the rank's level for weeks of work.
 */

// ---------------------------------------------------------------------------- words

type Entry = [id: string, text: string, gloss: string, emoji: string, forms?: string[], pos?: Pos, grade?: '5' | '4' | '3' | '準2' | '2'];
/** One 検証ページ (3–5 words); the levels, TOEIC bands and domains come from data/english/vocab.json. `grade` is only for words the list lacks. */
function page(id: string, labelJa: string, words: Entry[]): { page: VerificationPage; words: JobLexEntry[] } {
  return {
    page: { id, labelJa },
    words: words.map(([wid, text, gloss, emoji, forms, pos, grade]) => ({
      id: wid,
      text,
      gloss,
      pos: pos ?? 'noun',
      group: id,
      emoji,
      ...(forms ? { forms } : {}),
      ...(grade ? { eiken: grade, cefr: grade === '5' || grade === '4' ? ('A1' as const) : grade === '3' ? ('A2' as const) : ('B1' as const) } : {}),
    })),
  };
}

// ---------------------------------------------------------------------------- authored-task builders

interface Meta {
  grammar?: string[];
  phrases?: string[];
  features?: TaskFeature[];
  level?: EikenKey;
}
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
const meta = (m: Meta) => ({ ...(m.grammar ? { grammar: m.grammar } : {}), ...(m.phrases ? { phrases: m.phrases } : {}), ...(m.features ? { features: m.features } : {}), ...(m.level ? { level: m.level } : {}) });

/** The booking book / a bill / a price list as a paper: rows of [field id, label, value]. */
const paper = (kind: CheckDoc['kind'], title: string, rows: [string, string, string][]): CheckDoc => ({ kind, title, fields: rows.map(([id, label, value]) => ({ id, label, value })) });
const book = (rows: [string, string, string][]): CheckDoc => paper('ledger', 'Book', rows);
const note = (title: string, lines: string[]): CheckDoc => ({ kind: 'note', title, lines });

/** check: the guest says / writes (`say`); the first paper is the one to check. `wrong` = the field that disagrees. */
function check(id: string, rank: number, seq: number, person: string, say: string, docs: CheckDoc | CheckDoc[], wrong: string | null, m: Meta & { fix?: [string, string[]]; target?: number } = {}): AuthoredTask {
  return {
    id, rank, seq, arch: 'check', person, say,
    docs: Array.isArray(docs) ? docs : [docs],
    target: m.target ?? 0,
    wrong,
    ...(m.fix ? { fix: m.fix[0], fixOptions: m.fix[1] } : {}),
    ...meta(m),
  };
}
/** respond (choose): spoken question; `right` is the one good reply. */
function ask(id: string, rank: number, seq: number, person: string, q: string, right: string, wrong: string[], m: Meta = {}): AuthoredTask {
  return { id, rank, seq, arch: 'respond', person, say: q, mode: 'choose', msg: { kind: 'speech', lines: [q] }, ...slips(id, right, wrong), ...meta(m) };
}
/** respond (choose): a letter / e-mail / call with lines; `say` is what is said at the desk (calls: the words heard). */
function msg(id: string, rank: number, seq: number, person: string, kind: 'letter' | 'email' | 'phone' | 'memo', head: { from?: string; subject?: string; say?: string }, lines: string[], right: string, wrong: string[], m: Meta & { say?: string } = {}): AuthoredTask {
  return {
    id, rank, seq, arch: 'respond', person, say: head.say ?? m.say ?? (kind === 'phone' ? lines.join(' ') : ''), mode: 'choose',
    msg: { kind, ...(head.from ? { from: head.from } : {}), ...(head.subject ? { subject: head.subject } : {}), lines },
    ...slips(id, right, wrong), ...meta(m),
  };
}
/** respond (form): the message pad; each field has chips, the first option is the right one (put in a fixed order). */
function pad(id: string, rank: number, seq: number, person: string, kind: 'phone' | 'letter' | 'email' | 'speech', lines: string[], fields: [string, string, string, string[]][], m: Meta & { from?: string; subject?: string; say?: string } = {}): AuthoredTask {
  return {
    id, rank, seq, arch: 'respond', person, say: m.say ?? (kind === 'phone' || kind === 'speech' ? lines.join(' ') : ''), mode: 'form',
    msg: { kind, ...(m.from ? { from: m.from } : {}), ...(m.subject ? { subject: m.subject } : {}), lines },
    fields: fields.map(([fid, label, answer, others]) => {
      const o = slips(`${id}:${fid}`, answer, others);
      return { id: fid, label, options: o.options, answer };
    }),
    ...meta(m),
  };
}
/** The inn's floors × room types (rooms) or days × times (calendar) with the cells a task needs. */
interface Axis { id: string; label: string; tags?: string[] }
function slot(id: string, rank: number, seq: number, person: string, layout: 'rooms' | 'calendar', lines: string[], rows: Axis[], cols: Axis[], want: string[], avoid: string[], answer: string, busyNames: string[], m: Meta & { say?: string; kind?: 'speech' | 'letter' | 'email' | 'phone'; from?: string; extraBusy?: string[] } = {}): AuthoredTask {
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
  const kind = m.kind ?? 'speech';
  return {
    id, rank, seq, arch: 'respond', person, say: m.say ?? (kind === 'speech' || kind === 'phone' ? lines.join(' ') : ''), mode: 'slot',
    msg: { kind, ...(m.from ? { from: m.from } : {}), lines },
    slot: { layout, rows: rows.map(({ id: i, label }) => ({ id: i, label })), cols: cols.map(({ id: i, label }) => ({ id: i, label })), cells, answer },
    ...meta(m),
  };
}
/** sort: [text, bin id] items. */
function sort(id: string, rank: number, seq: number, say: string, bins: string[], items: [string, string][], m: Meta = {}): AuthoredTask {
  return { id, rank, seq, arch: 'sort', say, bins, items: items.map(([text, bin], i) => ({ id: `i${i + 1}`, text, bin })), ...meta(m) };
}

// rooms / calendar axes shared by tasks and templates
const FLOORS: Axis[] = [{ id: 'f3', label: 'Third floor' }, { id: 'f2', label: 'Second floor' }, { id: 'f1', label: 'First floor' }];
const SEA_SINGLE_DOUBLE: Axis[] = [
  { id: 's1', label: 'Sea side, single', tags: ['sea', 'single'] },
  { id: 's2', label: 'Sea side, double', tags: ['sea', 'double'] },
  { id: 't1', label: 'Street side, single', tags: ['street', 'single'] },
  { id: 't2', label: 'Street side, double', tags: ['street', 'double'] },
];
const LEXICON: JobLexEntry[] = [];
const PAGES: VerificationPage[] = [];

// 検証ページ: [id, 日本語の見出し, 語]。levels / TOEIC bands / domains come from data/english/vocab.json when the word is listed.
const WORD_PAGES: [string, string, Entry[]][] = [
  ['ji_desk', '帳場の言葉', [
    ['in_guest', 'guest', '泊まり客', '🧳', ['guests']],
    ['in_key', 'key', '鍵', '🔑', ['keys']],
    ['in_name', 'name', '名前', '📛', ['names']],
    ['in_book_v', 'book', '予約する・予約帳', '📖', ['booked', 'booking']],
  ]],
  ['ji_floors', '何階？', [
    ['in_floor', 'floor', '階', '🏢', ['floors']],
    ['in_first', 'first', '1番目の', '1️⃣', undefined, 'adj'],
    ['in_second', 'second', '2番目の', '2️⃣', undefined, 'adj'],
    ['in_third', 'third', '3番目の', '3️⃣', undefined, 'adj'],
    ['in_top', 'top', 'いちばん上', '🔝'],
  ]],
  ['ji_room', 'どんな部屋？', [
    ['in_single', 'single', '一人用の', '🛏️', undefined, 'adj'],
    ['in_double', 'double', '二人用の', '🛏️', undefined, 'adj'],
    ['in_view', 'view', '眺め', '🌅', ['views']],
    ['in_side', 'side', '側（がわ）', '↔️', ['sides']],
    ['in_stairs', 'stairs', '階段', '🪜', undefined, 'noun', '4'],
  ]],
  ['ji_care', '泊まり客の頼みごと', [
    ['in_towel', 'towel', 'タオル', '🧻', ['towels']],
    ['in_bath', 'bath', '風呂', '🛁', ['baths']],
    ['in_blanket', 'blanket', '毛布', '🛌', ['blankets']],
    ['in_stay', 'stay', '滞在（する）・泊まる', '🏨', ['stays', 'stayed', 'staying'], 'verb'],
  ]],
  ['ji_words', '宿の主人の口ぐせ', [
    ['in_enjoy', 'enjoy', '楽しむ', '😊', ['enjoys', 'enjoyed'], 'verb'],
    ['in_near', 'near', '近くに', '📍', undefined, 'prep'],
    ['in_use', 'use', '使う', '🛠️', ['uses', 'used'], 'verb'],
    ['in_seen', 'seen', '見た（see の過去分詞）', '👀', undefined, 'verb'],
    ['in_well', 'well', 'よく・じょうずに', '👌', undefined, 'adv'],
  ]],
  ['ji_house', '建物のつくり', [
    ['in_window', 'window', '窓', '🪟', ['windows']],
    ['in_garden', 'garden', '庭', '🌳', ['gardens']],
    ['in_toilet', 'toilet', 'トイレ', '🚻', ['toilets']],
    ['in_front', 'front', '前の・正面の', '⏩', undefined, 'adj'],
  ]],
  ['ji_tidy', 'きれい？ きたない？', [
    ['in_clean', 'clean', 'きれいな・掃除する', '✨', ['cleans', 'cleaned'], 'adj'],
    ['in_dirty', 'dirty', '汚れた', '🟤', undefined, 'adj'],
    ['in_soap', 'soap', 'せっけん', '🧼'],
    ['in_bathroom', 'bathroom', '浴室・洗面所', '🪥', ['bathrooms']],
  ]],
  ['ji_talk1', '客のことば（やさしい）', [
    ['in_kind', 'kind', '親切な', '😌', undefined, 'adj'],
    ['in_alone', 'alone', 'ひとりで', '🧍', undefined, 'adj'],
    ['in_slowly', 'slowly', 'ゆっくり', '🐢', undefined, 'adv'],
    ['in_understand', 'understand', 'わかる・理解する', '💡', ['understands', 'understood'], 'verb'],
    ['in_all', 'all', 'すべての・全部', '', undefined, 'det'],
  ]],
  ['ji_go1', '町を歩く', [
    ['in_straight', 'straight', 'まっすぐ', '➡️', undefined, 'adv'],
    ['in_map', 'map', '地図', '🗺️', ['maps']],
    ['in_town', 'town', '町', '🏘️', ['towns']],
    ['in_place', 'place', '場所', '📌', ['places']],
  ]],
  ['ji_ride1', '乗り物', [
    ['in_bus', 'bus', 'バス', '🚌', ['buses']],
    ['in_stop', 'stop', '止まる', '🛑', ['stops', 'stopped', 'stopping'], 'verb'],
    ['in_train', 'train', '列車', '🚆', ['trains']],
    ['in_taxi', 'taxi', 'タクシー', '🚕', ['taxis']],
  ]],
  ['ji_room2', '部屋の中のもの', [
    ['in_lamp', 'lamp', 'ランプ・明かり', '🪔', ['lamps']],
    ['in_clock', 'clock', '時計', '🕰️', ['clocks']],
    ['in_wall', 'wall', '壁', '🧱', ['walls']],
    ['in_phone', 'phone', '電話', '📞', ['phones']],
  ]],
  ['ji_misc1', '町のあれこれ', [
    ['in_son', 'son', '息子', '🧒', ['sons']],
    ['in_cafe', 'cafe', '喫茶店', '☕', ['cafes']],
    ['in_city', 'city', '都市・大きな町', '🏙️', ['cities']],
  ]],
  ['ji_dates', 'いつ着く？', [
    ['in_arrive', 'arrive', '到着する', '🛬', ['arrives', 'arrived', 'arriving'], 'verb'],
    ['in_saturday', 'Saturday', '土曜日', '🗓️'],
    ['in_sunday', 'Sunday', '日曜日', '🗓️'],
    ['in_tonight', 'tonight', '今夜', '🌙', undefined, 'adv'],
  ]],
  ['ji_time2', '時をあらわす', [
    ['in_noon', 'noon', '正午', '🕛'],
    ['in_ago', 'ago', '〜前に', '⏪', undefined, 'adv'],
    ['in_until', 'until', '〜まで', '⏳', undefined, 'prep'],
    ['in_by', 'by', '〜で・〜のそばで', '🚏', undefined, 'prep'],
  ]],
  ['ji_bill', '勘定', [
    ['in_include', 'include', '含む', '➕', ['includes', 'included', 'including'], 'verb'],
    ['in_total', 'total', '合計', '🧮'],
    ['in_pay', 'pay', '払う', '💰', ['pays', 'paid', 'paying'], 'verb'],
    ['in_rent', 'rent', '借りる', '🏘️', ['rents', 'rented'], 'verb'],
  ]],
  ['ji_wash', '洗って、分ける', [
    ['in_laundry', 'laundry', '洗濯物', '🧺', undefined, 'noun', '3'],
    ['in_sheet', 'sheet', 'シーツ', '📄', ['sheets']],
    ['in_shower', 'shower', 'シャワー', '🚿', ['showers']],
  ]],
  ['ji_forget', 'わすれもの', [
    ['in_wake', 'wake', '起こす・目をさます', '⏰', ['wakes', 'woke', 'waking'], 'verb'],
    ['in_forget', 'forget', '忘れる', '🧠', ['forgets', 'forgot', 'forgotten', 'forgetting'], 'verb'],
    ['in_umbrella', 'umbrella', '傘', '☂️', ['umbrellas']],
    ['in_hall', 'hall', '廊下・ホール', '🚶', ['halls']],
  ]],
  ['ji_quiet', '静かにすごす', [
    ['in_noise', 'noise', '騒音', '🔊'],
    ['in_quiet', 'quiet', '静かな', '🤫', ['quieter', 'quietly'], 'adj'],
    ['in_many', 'many', 'たくさんの', '', undefined, 'det'],
    ['in_long', 'long', '長い・長く', '📏', ['longer'], 'adj'],
  ]],
  ['ji_sights', '町の見どころ', [
    ['in_museum', 'museum', '博物館', '🏛️', ['museums']],
    ['in_lighthouse', 'lighthouse', '灯台', '🗼', undefined, 'noun', '3'],
    ['in_boat', 'boat', '船', '⛵', ['boats']],
    ['in_photo', 'photo', '写真', '📷', ['photos']],
  ]],
  ['ji_way', '道をたずねる', [
    ['in_foot', 'foot', '足・徒歩', '🦶'],
    ['in_way', 'way', '道・方法', '🛤️', ['ways']],
    ['in_turn', 'turn', '曲がる', '↩️', ['turns', 'turned', 'turning'], 'verb'],
    ['in_walk', 'walk', '歩く', '🚶', ['walks', 'walked', 'walking'], 'verb'],
  ]],
  ['ji_stay2', '泊まりのいろいろ', [
    ['in_visit', 'visit', '訪れる', '🏞️', ['visits', 'visited', 'visiting'], 'verb'],
    ['in_sir', 'sir', 'お客様・旦那様', '🎩'],
    ['in_under', 'under', '〜の下に・〜未満', '⬇️', undefined, 'prep'],
    ['in_stand', 'stand', '立つ', '🧍', ['stands', 'stood', 'standing'], 'verb'],
    ['in_hotel', 'hotel', 'ホテル', '🏨', ['hotels']],
  ]],
  ['ji_gift2', '貸し物とお祝い', [
    ['in_timetable', 'timetable', '時刻表', '📅'],
    ['in_cake', 'cake', 'ケーキ', '🍰', ['cakes']],
    ['in_birthday', 'birthday', '誕生日', '🎂'],
  ]],
  ['ji_family2', '家族と週末', [
    ['in_aunt', 'aunt', 'おば', '👩'],
    ['in_uncle', 'uncle', 'おじ', '👨'],
    ['in_weekend', 'weekend', '週末', '📆'],
    ['in_special', 'special', '特別な', '⭐', undefined, 'adj'],
  ]],
  ['ji_amount', '量をあらわす', [
    ['in_half', 'half', '半分（の）', '🌗', undefined, 'adj'],
    ['in_little', 'little', '小さい・少しの', '🔹', undefined, 'adj'],
    ['in_people', 'people', '人々', '👥'],
  ]],
  ['ji_months1', '月の名前（その1）', [
    ['in_march', 'March', '3月', '3️⃣'],
    ['in_april', 'April', '4月', '4️⃣'],
    ['in_august', 'August', '8月', '8️⃣'],
    ['in_september', 'September', '9月', '9️⃣'],
  ]],
  ['ji_months2', '月の名前（その2）', [
    ['in_october', 'October', '10月', '🔟'],
    ['in_november', 'November', '11月', '🍂'],
    ['in_december', 'December', '12月', '🎄'],
  ]],
  ['ji_change', '予約を変える', [
    ['in_cancel', 'cancel', '取り消す', '❌', ['cancels', 'cancelled', 'cancelling'], 'verb'],
    ['in_confirm', 'confirm', '確認する', '✅', ['confirms', 'confirmed', 'confirming'], 'verb'],
    ['in_reservation', 'reservation', '予約', '📝', ['reservations']],
    ['in_delay', 'delay', '遅れる・遅れ', '⏱️', ['delays', 'delayed']],
  ]],
  ['ji_polite3', 'ていねいな言い方', [
    ['in_mind', 'mind', '気にする・いやがる', '🧩', ['minds'], 'verb'],
    ['in_close', 'close', '閉める', '🚪', ['closes', 'closed', 'closing'], 'verb'],
    ['in_certainly', 'certainly', 'かしこまりました・もちろん', '👍', undefined, 'adv'],
    ['in_helpful', 'helpful', '助けになる', '🙌', undefined, 'adj'],
  ]],
  ['ji_lost3', '落とし物', [
    ['in_wallet', 'wallet', '財布', '👛', ['wallets']],
    ['in_lose', 'lose', 'なくす', '😟', ['loses', 'lost', 'losing'], 'verb'],
    ['in_find', 'find', '見つける', '🔍', ['finds', 'found', 'finding'], 'verb'],
    ['in_glasses', 'glasses', 'めがね', '👓'],
  ]],
  ['ji_charge3', '料金のきまり', [
    ['in_extra', 'extra', '余分の・追加の', '🆕', undefined, 'adj'],
    ['in_charge', 'charge', '料金・請求する', '💴', ['charges', 'charged']],
    ['in_receipt', 'receipt', '領収書', '🧾', ['receipts']],
    ['in_rule', 'rule', '規則', '📏', ['rules']],
    ['in_status', 'status', '状態', '🔖'],
  ]],
  ['ji_advice3', 'おすすめと断り', [
    ['in_recommend', 'recommend', 'すすめる', '🌟', ['recommends', 'recommended'], 'verb'],
    ['in_restaurant', 'restaurant', 'レストラン', '🍴', ['restaurants']],
    ['in_allow', 'allow', '許す', '✔️', ['allows', 'allowed', 'allowing'], 'verb'],
    ['in_afraid', 'afraid', '残念ながら・こわがって', '😨', undefined, 'adj'],
  ]],
  ['ji_bag3', '手荷物', [
    ['in_suitcase', 'suitcase', 'スーツケース', '💼', ['suitcases']],
    ['in_luggage', 'luggage', '荷物', '🎒'],
    ['in_scarf', 'scarf', 'スカーフ', '🧣', ['scarves']],
    ['in_coat', 'coat', 'コート', '🧥', ['coats']],
  ]],
  ['ji_night3', '夜ふけの客', [
    ['in_midnight', 'midnight', '真夜中', '🌃'],
    ['in_ring', 'ring', '鳴らす', '📣', ['rings', 'rang', 'ringing'], 'verb'],
    ['in_bell', 'bell', 'ベル・呼び鈴', '🔔', ['bells']],
    ['in_once', 'once', 'すぐに（at once）・一度', '⚡', undefined, 'adv'],
  ]],
  ['ji_sorry3', 'おわびとお礼', [
    ['in_mistake', 'mistake', 'まちがい', '❗', ['mistakes']],
    ['in_bother', 'bother', '迷惑をかける', '😅', ['bothers'], 'verb'],
    ['in_pleasure', 'pleasure', 'よろこび', '💐'],
    ['in_appreciate', 'appreciate', 'ありがたく思う', '🙏', ['appreciates'], 'verb'],
  ]],
  ['ji_hope3', '願いごと', [
    ['in_hope', 'hope', '望む・願う', '🌈', ['hopes'], 'verb'],
    ['in_forward', 'forward', '前へ・楽しみに', '⏭️', undefined, 'adv'],
    ['in_let', 'let', '〜させる・〜させてください', '🤲', ['lets', 'letting'], 'verb'],
    ['in_together', 'together', 'いっしょに', '🤝', undefined, 'adv'],
  ]],
  ['ji_people3', '人とものの言い方', [
    ['in_man', 'man', '男の人', '🧔', ['men']],
    ['in_boy', 'boy', '男の子', '👦', ['boys']],
    ['in_young', 'young', '若い', '🌱', undefined, 'adj'],
    ['in_thing', 'thing', 'もの・こと', '🔸', ['things']],
    ['in_us', 'us', '私たちを・私たちに', '👥', undefined, 'pron'],
  ]],
  ['ji_modal3', 'ことばの小さな力', [
    ['in_must', 'must', '〜しなければならない', '‼️', undefined, 'verb'],
    ['in_should', 'should', '〜したほうがよい', '💭', undefined, 'verb'],
    ['in_everything', 'everything', 'すべてのこと', '🌐', undefined, 'pron'],
    ['in_high', 'high', '高い', '🏔️', undefined, 'adj'],
  ]],
  ['ji_talk3', '話しことば（3）', [
    ['in_talk', 'talk', '話す', '💬', ['talks', 'talked', 'talking'], 'verb'],
    ['in_end', 'end', '終わり・はし', '🔚', ['ends']],
    ['in_noisy', 'noisy', 'うるさい', '🔉', undefined, 'adj'],
  ]],
  ['ji_extras3', '旅の持ちもの', [
    ['in_sing', 'sing', '歌う', '🎤', ['sings', 'sang', 'singing'], 'verb'],
    ['in_camera', 'camera', 'カメラ', '📸', ['cameras']],
    ['in_clothes', 'clothes', '衣服', '👕'],
    ['in_balcony', 'balcony', 'バルコニー', '🌇', ['balconies']],
  ]],
  ['ji_weather3', '寒い日', [
    ['in_fog', 'fog', '霧', '🌫️'],
    ['in_thick', 'thick', '厚い・濃い', '🟫', undefined, 'adj'],
    ['in_degree', 'degree', '度（温度）', '🌡️', ['degrees']],
    ['in_heater', 'heater', 'ヒーター', '🔥', ['heaters']],
  ]],
  ['ji_help3', '宿のサービス', [
    ['in_tip', 'tip', 'チップ・心づけ', '🪙', ['tips']],
    ['in_necessary', 'necessary', '必要な', '☑️', undefined, 'adj'],
    ['in_pillow', 'pillow', 'まくら', '😴', ['pillows']],
    ['in_neck', 'neck', '首', '🦒'],
  ]],
  ['ji_gate3', '門と旅の書類', [
    ['in_gate', 'gate', '門', '⛩️', ['gates']],
    ['in_lock', 'lock', '鍵をかける', '🔒', ['locks', 'locked', 'locking'], 'verb'],
    ['in_passport', 'passport', 'パスポート', '🛂', ['passports']],
    ['in_guide', 'guide', '案内人', '🧭', ['guides']],
    ['in_checkout', 'check-out', 'チェックアウト', '🚪', undefined, 'noun', '3'],
  ]],
  ['ji_party3', 'お祝いの日', [
    ['in_castle', 'castle', '城', '🏰', ['castles']],
    ['in_anniversary', 'anniversary', '記念日', '🥂'],
    ['in_wedding', 'wedding', '結婚式', '💒', ['weddings']],
  ]],
  ['ji_small3', '小さなことば', [
    ['in_up', 'up', '上へ・上に', '⬆️', undefined, 'adv'],
    ['in_out', 'out', '外へ・外に', '🚪', undefined, 'adv'],
    ['in_into', 'into', '〜の中へ', '↪️', undefined, 'prep'],
    ['in_however', 'however', 'しかしながら', '↔️', undefined, 'adv'],
  ]],
  ['ji_lostthings', '忘れ物の中身', [
    ['in_hat', 'hat', '帽子', '👒', ['hats']],
    ['in_shoe', 'shoe', 'くつ', '👟', ['shoes']],
    ['in_jacket', 'jacket', '上着', '🧥', ['jackets']],
    ['in_shirt', 'shirt', 'シャツ', '👕', ['shirts']],
  ]],
  ['ji_refund4', 'お金がもどる', [
    ['in_advance', 'advance', '前もって・前進', '📆'],
    ['in_refund', 'refund', '払いもどし', '💸', ['refunds']],
    ['in_discount', 'discount', '割引', '🏷️', ['discounts']],
    ['in_payment', 'payment', '支払い', '💳', ['payments']],
  ]],
  ['ji_cash4', 'お金とカード', [
    ['in_cash', 'cash', '現金', '💵'],
    ['in_card', 'card', 'カード', '🪪', ['cards']],
    ['in_return', 'return', '戻る・返す', '🔙', ['returns', 'returned', 'returning'], 'verb'],
  ]],
  ['ji_sorry4', '苦情と返事', [
    ['in_apologize', 'apologize', 'わびる', '🙇', ['apologise', 'apologizes'], 'verb'],
    ['in_trouble', 'trouble', 'めんどう・困りごと', '⚠️'],
    ['in_matter', 'matter', '事・問題', '📋', ['matters']],
    ['in_disappointed', 'disappointed', 'がっかりした', '😞', undefined, 'adj'],
  ]],
  ['ji_paper4', '紙の上のことば', [
    ['in_slip', 'slip', '伝票・紙きれ', '🧾', ['slips']],
    ['in_fourth', 'fourth', '4番目の', '4️⃣', undefined, 'adj'],
    ['in_brown', 'brown', '茶色の', '🟫', undefined, 'adj'],
    ['in_due', 'due', '〜する予定の', '📅', undefined, 'adj'],
  ]],
  ['ji_say5', '手紙のことば', [
    ['in_grateful', 'grateful', 'ありがたく思う', '🙏', undefined, 'adj'],
    ['in_even', 'even', '〜でさえ', '‼️', undefined, 'adv'],
    ['in_question', 'question', '質問', '❓', ['questions']],
    ['in_answer', 'answer', '答える', '✍️', ['answers', 'answered', 'answering'], 'verb'],
    ['in_difficult', 'difficult', 'むずかしい', '🧗', undefined, 'adj'],
  ]],
  ['ji_weather4', '荒れた海', [
    ['in_storm', 'storm', '嵐', '⛈️', ['storms']],
    ['in_forecast', 'forecast', '予報', '🌤️', ['forecasts']],
    ['in_calm', 'calm', 'おだやかな', '🌊', ['calmer'], 'adj'],
    ['in_rough', 'rough', '荒れた', '🌪️', undefined, 'adj'],
    ['in_ferry', 'ferry', 'フェリー', '⛴️', ['ferries']],
  ]],
  ['ji_sights4', '町の案内（1）', [
    ['in_history', 'history', '歴史', '📜'],
    ['in_crowd', 'crowd', '人ごみ', '🧑‍🤝‍🧑', ['crowds', 'crowded']],
    ['in_sunset', 'sunset', '夕日', '🌅', ['sunsets']],
    ['in_interesting', 'interesting', 'おもしろい', '🤩', undefined, 'adj'],
  ]],
  ['ji_sights5', '町の案内（2）', [
    ['in_nearby', 'nearby', '近くの', '🏘️', undefined, 'adj'],
    ['in_visitor', 'visitor', '訪問者', '🧑', ['visitors']],
    ['in_building', 'building', '建物', '🏢', ['buildings']],
    ['in_beach', 'beach', '浜辺', '🏖️', ['beaches']],
  ]],
  ['ji_party4', '夜の食堂', [
    ['in_dining_room', 'dining room', '食堂', '🪑', ['dining rooms'], 'noun', '4'],
    ['in_musician', 'musician', '音楽家', '🎻', ['musicians']],
    ['in_music', 'music', '音楽', '🎵'],
    ['in_loud', 'loud', 'うるさい・大きな音の', '📢', undefined, 'adj'],
    ['in_play', 'play', '演奏する・遊ぶ', '🎶', ['plays', 'played', 'playing'], 'verb'],
  ]],
  ['ji_event4', 'お祝いごと', [
    ['in_congratulations', 'congratulations', 'おめでとう', '🎉', undefined, 'interj', '4'],
    ['in_serve', 'serve', '出す・給仕する', '🍽️', ['serves', 'served', 'serving'], 'verb'],
    ['in_prepare', 'prepare', '用意する', '🍳', ['prepares', 'prepared', 'preparing'], 'verb'],
    ['in_marry', 'marry', '結婚する', '💍', ['marries', 'married', 'marrying'], 'verb'],
    ['in_party', 'party', 'パーティー', '🎊', ['parties']],
  ]],
  ['ji_if4', '条件のことば', [
    ['in_whether', 'whether', '〜かどうか', '❓', undefined, 'conj'],
    ['in_unless', 'unless', '〜でない限り', '🚫', undefined, 'conj'],
    ['in_provided', 'provided', '〜という条件で', '📑', undefined, 'conj'],
    ['in_possible', 'possible', '可能な', '🆗', undefined, 'adj'],
  ]],
  ['ji_stuff4', '忘れ物と持ち主', [
    ['in_post', 'post', '郵送する・郵便', '📮', ['posts', 'posted'], 'verb'],
    ['in_owner', 'owner', '持ち主', '🧑‍💼', ['owners']],
    ['in_pair', 'pair', 'ひと組・一対', '👯', ['pairs']],
    ['in_watch', 'watch', '腕時計', '⌚', ['watches']],
    ['in_toy', 'toy', 'おもちゃ', '🧸', ['toys']],
  ]],
  ['ji_plan4', '先の予定', [
    ['in_live', 'live', '住む', '🏠', ['lives', 'lived', 'living'], 'verb'],
    ['in_month', 'month', '月（つき）', '🈷️', ['months']],
    ['in_plan', 'plan', '計画・予定する', '🗓️', ['plans', 'planned', 'planning'], 'verb'],
    ['in_simple', 'simple', '単純な・簡単な', '➖', undefined, 'adj'],
  ]],
  ['ji_look4', 'ようすをいう', [
    ['in_whole', 'whole', '全部の・まるごとの', '🌍', undefined, 'adj'],
    ['in_safe', 'safe', '安全な', '🦺', undefined, 'adj'],
    ['in_dry', 'dry', '乾いた', '🏜️', undefined, 'adj'],
    ['in_face', 'face', '面している・顔', '🙂', ['faces', 'faced', 'facing'], 'verb'],
  ]],
  ['ji_feel4', '気持ちをいう', [
    ['in_wonder', 'wonder', '〜かなと思う', '🤔', ['wonders', 'wondering', 'wondered'], 'verb'],
    ['in_prefer', 'prefer', '〜のほうを好む', '👈', ['prefers', 'preferred'], 'verb'],
    ['in_hate', 'hate', 'ひどくきらう', '😡', ['hates'], 'verb'],
    ['in_ill', 'ill', '病気の', '🤒', undefined, 'adj'],
  ]],
  ['ji_say4', 'たずねる・伝える', [
    ['in_ask', 'ask', 'たずねる・頼む', '🙋', ['asks', 'asked', 'asking'], 'verb'],
    ['in_someone', 'someone', 'だれか', '🧑', undefined, 'pron'],
    ['in_hear', 'hear', '聞こえる・聞く', '👂', ['hears', 'heard', 'hearing'], 'verb'],
    ['in_tell', 'tell', '伝える・言う', '🗣️', ['tells', 'told', 'telling'], 'verb'],
  ]],
  ['ji_hold4', '申し出る', [
    ['in_hold', 'hold', '開く・持つ', '✋', ['holds', 'held', 'holding'], 'verb'],
    ['in_fix', 'fix', '直す', '🔧', ['fixes', 'fixed', 'fixing'], 'verb'],
    ['in_suggest', 'suggest', '提案する', '💡', ['suggests', 'suggested'], 'verb'],
    ['in_offer', 'offer', '申し出る・提供する', '🎁', ['offers', 'offered'], 'verb'],
    ['in_carry', 'carry', '運ぶ', '🧳', ['carries', 'carried', 'carrying'], 'verb'],
  ]],
  ['ji_other4', '旅のいろいろ', [
    ['in_low', 'low', '低い', '🔽', ['lower'], 'adj'],
    ['in_dog', 'dog', '犬', '🐕', ['dogs']],
    ['in_trip', 'trip', '旅', '🧭', ['trips']],
    ['in_holiday', 'holiday', '休暇', '🏖️', ['holidays']],
    ['in_travel', 'travel', '旅行する', '🧳', ['travels', 'travelled', 'travelling', 'traveled'], 'verb'],
  ]],
  ['ji_look5', '部屋のなか、紙の上', [
    ['in_mirror', 'mirror', '鏡', '🪞', ['mirrors']],
    ['in_newspaper', 'newspaper', '新聞', '📰', ['newspapers']],
    ['in_seem', 'seem', '〜のようだ', '🧐', ['seems', 'seemed'], 'verb'],
    ['in_anything', 'anything', '何か・何でも', '❔', undefined, 'pron'],
  ]],
  ['ji_job4', '宿の人たち', [
    ['in_clerk', 'clerk', '係員', '🧑‍💼', ['clerks']],
    ['in_lucky', 'lucky', '運のいい', '🍀', undefined, 'adj'],
    ['in_vegetarian', 'vegetarian', '菜食の人', '🥬'],
    ['in_vegetable', 'vegetable', '野菜', '🥕', ['vegetables']],
  ]],
  ['ji_buy4', '買いものと案内', [
    ['in_souvenir', 'souvenir', 'お土産', '🎁', ['souvenirs']],
    ['in_guidebook', 'guidebook', '旅行案内書', '📘', ['guidebooks']],
    ['in_difference', 'difference', '違い・差額', '⚖️'],
    ['in_elevator', 'elevator', 'エレベーター', '🛗'],
  ]],
];

// The tokenizer gives a surface to the first job that lists it, and the kitchen is listed before the inn: a word the
// kitchen already teaches is left to it (the post office, listed first, in turn leaves this job's words to us). Pages
// are packed again when that leaves fewer than three words on one.
const CLAIMED = new Set<string>();
const kitchen = KITCHEN_JOB.content.en;
for (const e of kitchen?.lexicon ?? []) for (const s of [e.text, ...(e.forms ?? [])]) CLAIMED.add(s.toLowerCase());
for (const f of Object.values(kitchen?.forms ?? {})) for (const s of f) CLAIMED.add(s.toLowerCase());
const claimed = (s: string): boolean => CLAIMED.has(s.toLowerCase());
// An inflected form the kitchen's entry does not cover stays as a word of its own: id → [grade, surfaces used here].
const SPLIT: Record<string, ['5' | '4' | '3', ...string[]]> = { in_book_v: ['3', 'booked'], in_tell: ['5', 'telling'], in_close: ['5', 'closing'] };
function reshape(e: Entry): Entry | null {
  if (!claimed(e[1])) return e;
  const [grade, ...forms] = SPLIT[e[0]] ?? [];
  const alt = forms.filter((s) => !claimed(s));
  if (!grade || !alt.length) return null;
  return [e[0], alt[0], `${e[2]}（${e[1]} の変化形）`, e[3], alt.slice(1), e[5], grade];
}
const kept: [string, string, Entry[]][] = [];
const spare: Entry[] = [];
for (const [id, labelJa, words] of WORD_PAGES) {
  const mine = words.map(reshape).filter((e): e is Entry => !!e);
  if (mine.length >= 3) kept.push([id, labelJa, mine]);
  else spare.push(...mine);
}
for (let i = 0; i < spare.length; ) {
  const left = spare.length - i;
  const n = left === 5 ? 5 : left <= 4 ? left : 4;
  const chunk = spare.slice(i, i + n);
  i += n;
  if (chunk.length < 3 && kept.length) kept[kept.length - 1][2].push(...chunk);
  else kept.push([`ji_more${kept.length}`, '帳場の言葉（つづき）', chunk]);
}
for (const [id, labelJa, words] of kept) {
  const p = page(id, labelJa, words);
  PAGES.push(p.page);
  LEXICON.push(...p.words);
}

const EXTRA_FORMS: Record<string, string[]> = {"big": ["bigger"], "can": ["cannot"], "early": ["earlier"], "know": ["known", "knew"], "see": ["seeing"], "take": ["taken"], "work": ["worked"], "rain": ["rained"], "cold": ["colder"], "sleep": ["slept"], "leave": ["leaving"], "like": ["liked"], "bad": ["worse"]};

// ---------------------------------------------------------------------------- rank 1 (英検4級): the desk, the floors, the first questions
const R1: AuthoredTask[] = [
  check('i1_first', 1, 1, 'p_ruiz', 'Hello. My name is {Ms. Ruiz|@}. I have a single room for two nights.', book([['name', 'Name', '{Ms. Ruiz|@}'], ['room', 'Room', 'single'], ['nights', 'Nights', '3']]), 'nights', { grammar: ['gr-5-001', 'gr-5-003'], phrases: ['ph-5-0039'] }),
  { id: 'i1_q', rank: 1, seq: 2, arch: 'respond', person: 'c_sailor', say: 'What time is breakfast?', mode: 'choose', msg: { kind: 'speech', lines: ['What time is breakfast?'] }, options: ['On the second floor.', 'From seven to nine.', 'You are welcome.'], answer: 1, grammar: ['gr-5-013'], phrases: ['ph-5-0042'] },
  sort('i1_bags', 1, 3, 'Please take the bags to the right floor. Look at the room number.', ['f1', 'f2', 'f3'], [['Room 12', 'f1'], ['Room 25', 'f2'], ['Room 31', 'f3']], { grammar: ['gr-5-011', 'gr-5-024'] }),
  ask('i1_key', 1, 4, 'c_boy', 'Can I have my key, please?', 'Sure. Here you are.', ['At six in the evening.', 'No, thank you.'], { grammar: ['gr-5-015'] }),
  check('i1_ok_lin', 1, 5, 'p_lin', 'Good evening. I am {Mr. Lin|@}. I have a double room for two nights.', book([['name', 'Name', '{Mr. Lin|@}'], ['room', 'Room', 'double'], ['nights', 'Nights', '2']]), null, { grammar: ['gr-5-001'], phrases: ['ph-5-0004'] }),
  ask('i1_where', 1, 6, 'c_grandma', 'Where is my room?', 'On the second floor.', ['It is forty coins.', 'Nice to meet you, too.'], { grammar: ['gr-5-013', 'gr-5-021'], phrases: ['ph-5-0089'] }),
  check('i1_ball', 1, 7, 'p_bell', 'Hello. My name is {Mr. Bell|@}. I have a single room for one night.', book([['name', 'Name', '{Mr. Ball|@}'], ['room', 'Room', 'single'], ['nights', 'Nights', '1']]), 'name', { grammar: ['gr-5-001'] }),
  ask('i1_bath', 1, 8, 'c_sailor', 'Is there a bath in my room?', 'Yes, every room has a bath.', ['At six in the evening.', 'You are welcome.'], { grammar: ['gr-5-020'] }),
  slot('i1_single', 1, 9, 'c_mom', 'rooms', ['A single room, please.'], FLOORS, SEA_SINGLE_DOUBLE, ['single'], [], 'f2-t1', ['{Mr. Bell|@}', '{Mr. Lin|@}', '{Ms. Ruiz|@}', '{Captain Reed|@}', '{Grandma Rose|@}'], { grammar: ['gr-5-007'] }),
  ask('i1_price', 1, 10, 'c_docker', 'How much is one night?', 'It is forty coins.', ['Sure. Here you are.', 'On the second floor.'], { grammar: ['gr-5-014'], phrases: ['ph-5-0044'] }),
  check('i1_floor', 1, 11, 'p_ruiz', 'My name is {Ms. Ruiz|@}. My room is on the second floor.', book([['name', 'Name', '{Ms. Ruiz|@}'], ['floor', 'Floor', 'third']]), 'floor', { grammar: ['gr-5-021', 'gr-5-024'] }),
  ask('i1_window', 1, 12, 'c_grandma', 'My room is too hot.', 'Sorry! I will open the window.', ['No, thank you.', 'It is forty coins.'], { grammar: ['gr-4-002'] }),
  sort('i1_trays', 1, 13, 'Please take each one to the right place.', ['kitchen', 'desk', 'f1'], [['Two boxes of eggs', 'kitchen'], ['A letter for {Mr. Olsen|@}', 'desk'], ['A bag for room 14', 'f1']], { grammar: ['gr-5-011'] }),
  check('i1_ok_reed', 1, 14, 'c_sailor', 'Good morning. I am {Captain Reed|@}. A single room, three nights, with breakfast.', book([['name', 'Name', '{Captain Reed|@}'], ['room', 'Room', 'single'], ['nights', 'Nights', '3'], ['breakfast', 'Breakfast', 'with breakfast']]), null, { phrases: ['ph-5-0002'] }),
  ask('i1_towel', 1, 11.5, 'c_boy', 'I need a towel, please.', 'Sure. I will bring one.', ['It is next to the bank.', 'From seven to nine.'], { grammar: ['gr-4-002', 'gr-5-025'] }),
  slot('i1_sea', 1, 16, 'c_merchant', 'rooms', ['I want a room with a sea view.'], FLOORS, SEA_SINGLE_DOUBLE, ['sea'], [], 'f3-s1', ['{Mr. Bell|@}', '{Mr. Lin|@}', '{Ms. Ruiz|@}', '{Captain Reed|@}', '{Grandma Rose|@}'], { grammar: ['gr-5-025'] }),
  ask('i1_dinner', 1, 17, 'c_sailor', 'What time is dinner?', 'At six in the evening.', ['It is next to the bank.', 'You are welcome.'], { grammar: ['gr-5-013', 'gr-5-021'], phrases: ['ph-5-0042'] }),
  check('i1_day', 1, 18, 'c_mom', 'Hello. I am {Anna|@}. My mother and I come on Friday. We want a double room for two nights.', book([['name', 'Name', '{Anna|@}'], ['day', 'Day', 'Thursday'], ['room', 'Room', 'double'], ['nights', 'Nights', '2']]), 'day', { grammar: ['gr-5-021', 'gr-5-027'] }),
  sort('i1_bags2', 1, 19, 'More bags! Look at the name and the room number.', ['f1', 'f2', 'f3'], [['{Captain Reed|@}, room 31', 'f3'], ['{Mr. Lin|@}, room 12', 'f1'], ['{Ms. Ruiz|@}, room 25', 'f2'], ['{Mr. Bell|@}, room 33', 'f3']], { grammar: ['gr-5-024'] }),
  ask('i1_stairs', 1, 20, 'c_grandma', "I can't use the stairs.", 'Of course. I have a room on the first floor.', ['From seven to nine.', 'It is forty coins.'], { grammar: ['gr-5-015'], phrases: ['ph-5-0084'] }),
  slot('i1_notstreet', 1, 21, 'p_ruiz', 'rooms', ['A double room, please.', 'Not on the street side, please.'], FLOORS, SEA_SINGLE_DOUBLE, ['double'], ['street'], 'f1-s2', ['{Mr. Bell|@}', '{Mr. Lin|@}', '{Captain Reed|@}', '{Grandma Rose|@}'], { grammar: ['gr-5-011', 'gr-5-002'] }),
  ask('i1_thanks', 1, 22, 'p_ruiz', 'Thank you for the nice room.', 'You are welcome. Enjoy your stay.', ['That is all right.', 'At six in the evening.'], { phrases: ['ph-5-0015'] }),
  check('i1_number', 1, 23, 'c_docker', 'I am {Big Joe|@}. My room is number 31.', book([['name', 'Name', '{Big Joe|@}'], ['number', 'Number', '13']]), 'number', { grammar: ['gr-5-024'] }),
  ask('i1_map', 1, 24, 'c_boy', 'Where is the market?', 'It is next to the bank.', ['Good night. See you tomorrow.', 'It is forty coins.'], { grammar: ['gr-5-013', 'gr-5-021'] }),
  slot('i1_topsingle', 1, 25, 'p_bell', 'rooms', ['I like the top floor.', 'A single room, please.'], FLOORS, SEA_SINGLE_DOUBLE, ['f3', 'single'], [], 'f3-t1', ['{Mr. Lin|@}', '{Ms. Ruiz|@}', '{Captain Reed|@}', '{Grandma Rose|@}'], { grammar: ['gr-5-025'] }),
  ask('i1_dirty', 1, 26, 'p_lin', 'My room is dirty.', 'I am sorry. I will clean it now.', ['Yes, every room has a bath.', 'From seven to nine.'], { grammar: ['gr-5-026', 'gr-4-002'] }),
  check('i1_nobf', 1, 27, 'c_cook', 'I am {Nora|@}. A single room for one night. No breakfast, thank you.', book([['name', 'Name', '{Nora|@}'], ['room', 'Room', 'single'], ['nights', 'Nights', '1'], ['breakfast', 'Breakfast', 'with breakfast']]), 'breakfast', { grammar: ['gr-5-002'] }),
  ask('i1_garden', 1, 28, 'c_mom', 'Is there a garden?', 'Yes, it is behind the kitchen.', ['Sure. Here you are.', 'That is all right.'], { grammar: ['gr-5-020', 'gr-5-021'] }),
  ask('i1_late', 1, 29, 'c_merchant', 'I am sorry. I am late.', 'That is all right. Here is your key.', ['It is next to the bank.', 'Yes, every room has a bath.'], {  }),
  check('i1_last', 1, 30, 'p_lin', 'Good evening. I am {Mr. Lin|@}. A double room for three nights, with breakfast, please.', book([['name', 'Name', '{Mr. Lin|@}'], ['room', 'Room', 'single'], ['nights', 'Nights', '3'], ['breakfast', 'Breakfast', 'with breakfast']]), 'room', { grammar: ['gr-5-003', 'gr-5-025'] }),
  ask('i1_map2', 1, 31, 'c_boy', 'Do you have a map of the town?', 'Yes. Here is a map. We are here.', ['I am fine, thank you.', 'At six in the evening.'], { grammar: ['gr-5-004'] }),
  ask('i1_bus', 1, 32, 'c_student', 'Which bus goes to the station?', 'The number five bus.', ['It is forty coins.', 'No, thank you.'], { grammar: ['gr-5-013'], phrases: ['ph-4-0035'] }),
  ask('i1_lamp', 1, 33, 'p_lin', 'The lamp does not work.', 'Sorry! I will bring a new lamp.', ['Yes, every room has a bath.', 'You are welcome.'], { grammar: ['gr-5-004', 'gr-4-002'] }),
  ask('i1_train', 1, 34, 'c_scholar', 'What time is the train to the city?', 'At nine in the morning.', ['It is forty coins.', 'Nice to meet you, too.'], { grammar: ['gr-5-013'], phrases: ['ph-5-0042'] }),
  ask('i1_clock', 1, 35, 'c_sailor', 'Is there a clock in the room?', 'Yes, it is on the wall.', ['On the second floor.', 'You are welcome.'], { grammar: ['gr-5-020'] }),
  ask('i1_cafe', 1, 36, 'c_mom', 'Is there a cafe near here?', 'Yes, there is a cafe next to the bank.', ['From seven to nine.', 'That is all right.'], { grammar: ['gr-5-020'], phrases: ['ph-4-0036'] }),
  ask('i1_taxi', 1, 37, 'p_bell', 'Can you call a taxi for me?', 'Of course. It will be here in ten minutes.', ['It is forty coins.', 'Good night. See you tomorrow.'], { grammar: ['gr-5-015', 'gr-4-002'] }),
  ask('i1_soap', 1, 38, 'c_grandma', 'There is no soap in the bathroom.', 'Sorry! I will bring some.', ['At six in the evening.', 'Nice to meet you, too.'], { grammar: ['gr-5-020', 'gr-4-002'] }),
];

// ---------------------------------------------------------------------------- rank 2 (英検3級): dates, prices, bills, directions, wishes
const GUESTS = ['{Mr. Bell|@}', '{Mr. Lin|@}', '{Ms. Ruiz|@}', '{Captain Reed|@}', '{Grandma Rose|@}', '{Mr. Cole|@}', '{Mrs. Dunn|@}'];
const COLS_FAMILY: Axis[] = [
  { id: 'a2', label: 'Sea side, two beds', tags: ['sea', 'beds2'] },
  { id: 'a4', label: 'Sea side, four beds', tags: ['sea', 'beds4'] },
  { id: 'g2', label: 'Garden side, two beds', tags: ['garden', 'beds2'] },
  { id: 'g4', label: 'Garden side, four beds', tags: ['garden', 'beds4'] },
];
const COLS_BATH: Axis[] = [
  { id: 'sb', label: 'Sea side, bath', tags: ['sea', 'bath'] },
  { id: 'ss', label: 'Sea side, shower', tags: ['sea', 'shower'] },
  { id: 'gb', label: 'Garden side, bath', tags: ['garden', 'bath'] },
  { id: 'gs', label: 'Garden side, shower', tags: ['garden', 'shower'] },
];
const DAYS3: Axis[] = [{ id: 'fri', label: 'Friday' }, { id: 'sat', label: 'Saturday' }, { id: 'sun', label: 'Sunday' }];
const BOAT_TIMES: Axis[] = [{ id: 'am', label: '9:00' }, { id: 'pm1', label: '1:00', tags: ['pm'] }, { id: 'pm4', label: '4:00', tags: ['pm'] }];
const PRICES = note('Prices', ['Single room: 40 coins a night', 'Double room: 60 coins a night', 'Breakfast: 5 coins a day']);

const R2: AuthoredTask[] = [
  slot('i2_view', 2, 1, 'c_merchant', 'rooms', ['I want a room with a sea view.', 'A double room, please.'], FLOORS, SEA_SINGLE_DOUBLE, ['sea', 'double'], [], 'f2-s2', GUESTS, { grammar: ['gr-5-025', 'gr-4-007'] }),
  check('i2_arrive', 2, 2, 'p_ruiz', 'Hello. I arrive on Thursday and I leave on Friday. A single room, please.', book([['name', 'Name', '{Ms. Ruiz|@}'], ['arrive', 'Arrive', 'Thursday'], ['leave', 'Leave', 'Monday'], ['room', 'Room', 'single']]), 'leave', { grammar: ['gr-5-021', 'gr-5-003'] }),
  check('i2_nights', 2, 3, 'p_lin', 'I want to stay from Friday to Monday.', book([['name', 'Name', '{Mr. Lin|@}'], ['from', 'From', 'Friday'], ['to', 'To', 'Monday'], ['nights', 'Nights', '2']]), 'nights', { grammar: ['gr-3-021', 'gr-5-024'] }),
  ask('i2_included', 2, 4, 'c_mom', 'Is breakfast included in the price?', 'Yes, it is. You do not pay more.', ['It is from seven to nine.', 'No, thank you.'], { grammar: ['gr-3-005', 'gr-5-002'], phrases: ['ph-3-0036'] }),
  ask('i2_cheaper', 2, 5, 'c_merchant', 'I like the big room, but it is too expensive. Do you have a cheaper room?', 'Yes. The single room is cheaper.', ['It is across from the bank.', 'That is all right.'], { grammar: ['gr-4-014', 'gr-3-030'] }),
  check('i2_bill1', 2, 6, 'c_merchant', 'I stayed two nights in a single room, with breakfast. Is my bill right?', [paper('invoice', 'Bill', [['room', 'Single room, 2 nights', '80 coins'], ['bf', 'Breakfast, 2 days', '10 coins'], ['total', 'Total', '100 coins']]), PRICES], 'total', { grammar: ['gr-5-014', 'gr-5-024'] }),
  ask('i2_wake', 2, 7, 'c_scholar', 'Could you wake me at six tomorrow?', 'Of course. I will call your room at six.', ['No, thank you.', 'It is across from the bank.'], { grammar: ['gr-4-002'], phrases: ['ph-4-0005'] }),
  ask('i2_station', 2, 8, 'c_student', 'Where is the station?', 'Go straight, then turn left at the bank.', ['It is forty coins.', 'You are welcome.'], { grammar: ['gr-5-011', 'gr-5-021'], phrases: ['ph-5-0089'] }),
  ask('i2_rain', 2, 9, 'c_mom', 'Will it rain tomorrow?', 'No, it will be sunny.', ['Yes, it rained yesterday.', 'Yes, it is on the second floor.'], { grammar: ['gr-4-002', 'gr-5-027'] }),
  ask('i2_letter_came', 2, 10, 'c_grandma', 'Has a letter come for me?', 'Yes, it has. It is here at the desk.', ['Yes, it will. It comes tomorrow.', 'No, I did not. Thank you.'], { grammar: ['gr-3-002', 'gr-5-019'] }),
  slot('i2_family', 2, 11, 'c_mom', 'rooms', ['We are four.', 'We like the sea.'], FLOORS, COLS_FAMILY, ['beds4', 'sea'], [], 'f3-a4', GUESTS, { grammar: ['gr-5-001', 'gr-5-025'] }),
  slot('i2_boat', 2, 19.5, 'c_student', 'calendar', ['I want a boat to the lighthouse.', 'Saturday morning, please.'], DAYS3, BOAT_TIMES, ['sat', 'am'], [], 'sat-am', ['{Mr. Cole|@}', '{Ms. Ruiz|@}', '{Captain Reed|@}'], { grammar: ['gr-5-021', 'gr-5-025'], extraBusy: ['fri-am', 'sat-pm1', 'sun-am'] }),
  sort('i2_laundry', 2, 13, 'The laundry is on the floor again. Please take it to the right place.', ['laundry', 'f1', 'f2'], [['Two dirty towels', 'laundry'], ['A dirty blanket', 'laundry'], ['A bag for room 22', 'f2'], ['A bag for room 11', 'f1']], { grammar: ['gr-5-026'] }),
  check('i2_family_room', 2, 14, 'c_mom', 'We are four: my husband, two children and me.', book([['name', 'Name', '{Anna|@}'], ['room', 'Room', 'single'], ['nights', 'Nights', '2']]), 'room', { grammar: ['gr-5-001', 'gr-5-006'] }),
  pad('i2_call1', 2, 15, 'p_novak', 'phone', ['Hello, this is {Ms. Novak|@}. I want a double room from Friday to Sunday.'], [['name', 'Name', '{Ms. Novak|@}', ['{Ms. Nowak|@}', '{Ms. Ruiz|@}']], ['room', 'Room', 'double', ['single', 'family']], ['from', 'From', 'Friday', ['Thursday', 'Saturday']], ['to', 'To', 'Sunday', ['Monday', 'Saturday']]], { grammar: ['gr-3-021'] }),
  ask('i2_bag_wait', 2, 16, 'c_merchant', 'Can I leave my bag here until tonight?', 'Of course. I will keep it in the back room.', ['From seven to nine.', 'You are welcome.'], { grammar: ['gr-3-031', 'gr-5-015'] }),
  check('i2_leave_time', 2, 17, 'c_scholar', 'Good morning. I leave at ten tomorrow.', book([['name', 'Name', '{Professor Hale|@}'], ['day', 'Day', 'tomorrow'], ['time', 'Time', '11:00']]), 'time', { grammar: ['gr-5-021'] }),
  check('i2_dates_ok', 2, 18, 'p_cole', 'I arrive on Saturday and I leave on Tuesday. That is three nights.', book([['name', 'Name', '{Mr. Cole|@}'], ['arrive', 'Arrive', 'Saturday'], ['leave', 'Leave', 'Tuesday'], ['nights', 'Nights', '3']]), null, { grammar: ['gr-5-021', 'gr-5-003'] }),
  ask('i2_umbrella', 2, 19, 'p_bell', 'I forgot my umbrella.', 'Here it is. It was behind the door.', ['It is forty coins.', 'See you tomorrow.'], { grammar: ['gr-5-018'], phrases: ['ph-4-0066'] }),
  ask('i2_pay_when', 2, 20, 'p_bell', 'When can I pay?', 'You can pay when you leave.', ['It is across from the bank.', 'That is all right.'], { grammar: ['gr-3-019', 'gr-5-015'] }),
  ask('i2_noise', 2, 21, 'c_grandma', 'There is a lot of noise in my room.', 'I am sorry. I have a quiet room on the third floor.', ['You are welcome.', 'It is forty coins.'], { grammar: ['gr-5-020', 'gr-3-029'] }),
  sort('i2_bags3', 2, 22, 'The ship is in, and there are many bags. Look at the name on each bag.', ['f1', 'f2', 'f3', 'laundry'], [['{Mrs. Dunn|@}, top floor', 'f3'], ['{Mr. Cole|@}, second floor', 'f2'], ['{Ken|@}, first floor', 'f1'], ['Dirty towels from room 21', 'laundry']], { grammar: ['gr-5-024'] }),
  ask('i2_ifrain', 2, 23, 'c_mom', 'If it rains on Saturday, what can we do?', 'You can visit the museum. It is near the church.', ['It is forty coins.', 'You are welcome.'], { grammar: ['gr-3-018', 'gr-4-019'] }),
  pad('i2_letter1', 2, 24, 'p_olsen', 'letter', ['Dear Sir, I want a single room. I arrive on Thursday and stay for two nights. My name is {Novak|@}.'], [['name', 'Name', '{Novak|@}', ['{Nova|@}', '{Ruiz|@}']], ['room', 'Room', 'single', ['double', 'family']], ['arrive', 'Arrive', 'Thursday', ['Friday', 'Monday']], ['nights', 'Nights', '2', ['3', '1']]], { from: '{Ms. Novak|@}', say: 'A letter came this morning.', grammar: ['gr-5-003', 'gr-5-021'] }),
  check('i2_bill_ok', 2, 25, 'p_ruiz', 'Two nights in a double room, no breakfast. Is my bill right?', [paper('invoice', 'Bill', [['room', 'Double room, 2 nights', '120 coins'], ['bf', 'Breakfast', 'no'], ['total', 'Total', '120 coins']]), PRICES], null, { grammar: ['gr-5-014'] }),
  ask('i2_ship_left', 2, 26, 'c_sailor', 'Has the ship left yet?', 'Yes, it left at noon.', ['Yes, it will leave at noon.', 'No, thank you.'], { grammar: ['gr-3-002', 'gr-5-018'] }),
  ask('i2_two_towels', 2, 27, 'c_girl', 'May I have two more towels?', 'Of course. I will bring them now.', ['It is across from the bank.', 'No, thank you.'], { grammar: ['gr-5-015', 'gr-5-008'], phrases: ['ph-5-0087'] }),
  slot('i2_bath', 2, 28, 'c_grandma', 'rooms', ['I like to take a bath.', 'I do not like the garden side.'], FLOORS, COLS_BATH, ['bath'], ['garden'], 'f2-sb', GUESTS, { grammar: ['gr-4-011'] }),
  check('i2_night_price', 2, 29, 'c_merchant', 'Hello. I want two single rooms for one night, for my friends.', book([['name', 'Name', '{Mr. Grant|@}'], ['room', 'Room', 'single'], ['number', 'How many', '1'], ['nights', 'Nights', '1']]), 'number', { grammar: ['gr-5-014', 'gr-5-006'] }),
  ask('i2_how_long', 2, 30, 'c_boy', 'How long does it take to walk to the market?', 'It takes ten minutes.', ['It is forty coins.', 'See you tomorrow.'], { grammar: ['gr-4-009'], phrases: ['ph-4-0032'] }),
  check('i2_march', 2, 31, 'p_cole', 'I arrive on 12 March and I leave on 15 March.', book([['name', 'Name', '{Mr. Cole|@}'], ['arrive', 'Arrive', '12 March'], ['leave', 'Leave', '14 March']]), 'leave', { grammar: ['gr-5-021', 'gr-5-003'] }),
  check('i2_august', 2, 32, 'p_ruiz', 'I will stay from 3 August to 6 August.', book([['name', 'Name', '{Ms. Ruiz|@}'], ['from', 'From', '3 August'], ['to', 'To', '6 August'], ['nights', 'Nights', '4']]), 'nights', { grammar: ['gr-3-021', 'gr-4-002'] }),
  ask('i2_birthday', 2, 33, 'c_girl', 'It is my birthday tomorrow!', 'Happy birthday! I will bring a cake to your room.', ['It is across from the bank.', 'Yes, it is included.'], { grammar: ['gr-5-027', 'gr-4-002'] }),
  ask('i2_weekend', 2, 34, 'c_merchant', 'We want to stay for the weekend. Is there a cheaper price?', 'Yes. For two nights at the weekend, the second night is half price.', ['It is across from the bank.', 'Sure. Here you are.'], { grammar: ['gr-5-025', 'gr-5-020'] }),
  ask('i2_photo', 2, 35, 'c_mom', 'Could you take a photo of me?', 'Of course. Please stand next to the lighthouse.', ['It is forty coins.', 'From seven to nine.'], { grammar: ['gr-5-011'], phrases: ['ph-4-0005'] }),
  ask('i2_bicycle', 2, 36, 'c_student', 'Can I rent a bicycle?', 'Yes, a bicycle is ten coins a day.', ['At six in the evening.', 'It is across from the bank.'], { grammar: ['gr-5-015'] }),
  ask('i2_timetable', 2, 37, 'p_cole', 'Do you have a timetable of the ships?', 'Yes. Here is the timetable. The next ship leaves at noon.', ['It is forty coins.', 'You are welcome.'], { grammar: ['gr-5-004', 'gr-5-003'] }),
  ask('i2_aunt', 2, 38, 'c_boy', 'My aunt and uncle arrive tomorrow. Can they have the room next to my room?', 'Yes, room 15 is next to your room.', ['At six in the evening.', 'It is forty coins.'], { grammar: ['gr-5-015', 'gr-5-008'] }),
];

// ---------------------------------------------------------------------------- rank 3 (英検準2級): letters, changes, complaints, calls, lost things
const letterFrom = (who: string, lines: string[]): CheckDoc => ({ kind: 'letter', title: 'Letter', lines: ['Dear Sir,', ...lines, who] });
const DAYS4: Axis[] = [{ id: 'fri', label: 'Friday' }, { id: 'sat', label: 'Saturday' }, { id: 'sun', label: 'Sunday' }, { id: 'mon', label: 'Monday' }];
const TOUR_TIMES: Axis[] = [{ id: 'am', label: '9:00', tags: ['morning'] }, { id: 'pm1', label: '1:00', tags: ['afternoon'] }, { id: 'pm4', label: '4:00', tags: ['afternoon'] }];
const PRICES3 = note('Prices', ['Double room: 60 coins a night', 'Extra bed: 10 coins a night', 'Breakfast: 5 coins a day']);

const R3: AuthoredTask[] = [
  check('i3_letter_ok', 3, 1, 'p_cole', 'I sent you a letter last week. I hope the book is right.', [book([['name', 'Name', '{Mr. Cole|@}'], ['room', 'Room', 'double'], ['arrive', 'Arrive', 'Friday'], ['leave', 'Leave', 'Sunday']]), letterFrom('{Mr. Cole|@}', ['I want a double room from Friday to Sunday.', 'We are two, my wife and me.'])], null, { grammar: ['gr-3-002', 'gr-3-021'] }),
  check('i3_change_day', 3, 2, 'p_novak', 'I wrote to you yesterday. I would like to change my day.', [book([['name', 'Name', '{Ms. Novak|@}'], ['room', 'Room', 'single'], ['arrive', 'Arrive', 'Friday']]), letterFrom('{Ms. Novak|@}', ['Please change my reservation.', 'I cannot come on Friday. I will arrive on Saturday.'])], 'arrive', { grammar: ['gr-3-001', 'gr-4-002'], fix: ['Saturday', ['Friday', 'Saturday', 'Sunday']] }),
  check('i3_cancel', 3, 3, 'c_merchant', 'My ship is late, so I have to cancel my room for tonight.', [book([['name', 'Name', '{Mr. Grant|@}'], ['room', 'Room', 'double'], ['status', 'Status', 'kept']]), letterFrom('{Mr. Grant|@}', ['I am sorry, but I have to cancel my reservation.', 'I will write again next week.'])], 'status', { grammar: ['gr-4-003', 'gr-4-019'], fix: ['cancelled', ['kept', 'cancelled', 'changed']] }),
  check('i3_extra_bed', 3, 4, 'c_mom', 'We had an extra bed for the child. Is the bill right?', [paper('invoice', 'Bill', [['room', 'Double room, 3 nights', '180 coins'], ['bed', 'Extra bed, 3 nights', '20 coins'], ['total', 'Total', '200 coins']]), PRICES3], 'bed', { grammar: ['gr-5-014', 'gr-5-018'], fix: ['30 coins', ['10 coins', '20 coins', '30 coins']] }),
  ask('i3_confirm', 3, 5, 'p_novak', 'Please confirm my reservation for two nights from Friday.', 'Your reservation has been confirmed. We look forward to seeing you.', ['I am sorry, the room is very dirty.', 'The museum is across from the church.'], { grammar: ['gr-3-005', 'gr-3-022'] }),
  ask('i3_would_you_mind', 3, 6, 'p_ruiz', 'Would you mind closing the window? It is very cold.', 'Not at all. I will do it now.', ['Yes, every room has a bath.', 'It is forty coins.'], { grammar: ['gr-4-011', 'gr-3-018'], phrases: ['ph-3-0006'] }),
  ask('i3_indirect', 3, 7, 'c_scholar', 'Could you tell me where the museum is?', 'It is across from the church.', ['Yes, I have seen it.', 'It was very cold yesterday.'], { grammar: ['gr-3-010'], phrases: ['ph-3-0027'] }),
  ask('i3_wallet', 3, 8, 'p_bell', 'I have lost my wallet. I think I left it in the garden.', 'I will look for it. Please wait.', ['You are welcome.', 'It is forty coins.'], { grammar: ['gr-3-002', 'gr-5-018'] }),
  sort('i3_lost', 3, 9, 'The lost bags go in the lost box, and the dirty towels go to the laundry.', ['lost', 'laundry', 'f2'], [['A black umbrella, found in the hall', 'lost'], ['A wallet, found on the stairs', 'lost'], ['Dirty towels from room 23', 'laundry'], ['Breakfast for room 24', 'f2']], { grammar: ['gr-3-012'] }),
  msg('i3_delay_call', 3, 10, 'c_sailor', 'phone', { say: 'Hello. This is {Captain Reed|@}. My ship has been delayed. I will arrive at night, not in the afternoon.' }, ['Hello. This is {Captain Reed|@}. My ship has been delayed. I will arrive at night, not in the afternoon.'], 'That is fine. We will keep your room for you.', ['Your reservation has been cancelled.', 'It is across from the church.'], { features: ['audioOnly'], grammar: ['gr-3-005', 'gr-4-002'] }),
  slot('i3_quiet', 3, 11, 'p_dunn', 'rooms', ['I do not like noise.', 'I want a single room, but not on the street side.'], FLOORS, SEA_SINGLE_DOUBLE, ['single'], ['street', 'f1'], 'f3-s1', GUESTS, { grammar: ['gr-3-030', 'gr-5-002'] }),
  ask('i3_sing', 3, 12, 'p_dunn', 'The guest in room 22 sings all night. I could not sleep.', 'I am very sorry. I will go to his room now.', ['That is fine. We will keep your room.', 'It is across from the church.'], { grammar: ['gr-4-019', 'gr-5-019'] }),
  check('i3_late_out', 3, 13, 'c_scholar', 'I would like a late {check-out|in_checkout}. Could I leave at two?', [book([['name', 'Name', '{Professor Hale|@}'], ['out', '{Check-out|in_checkout}', '11:00']]), note('Prices', ['{Check-out|in_checkout} is at eleven.', 'A late {check-out|in_checkout} is 10 coins.'])], 'out', { grammar: ['gr-4-007', 'gr-4-002'], fix: ['2:00', ['10:00', '11:00', '2:00']] }),
  ask('i3_recommend', 3, 14, 'p_cole', 'Can you recommend a good restaurant?', 'Yes, I recommend the {Harbour Kitchen|@}. It is very good.', ['It is forty coins.', 'You can pay when you leave.'], { grammar: ['gr-5-015'] }),
  ask('i3_cat', 3, 15, 'c_boy', 'I found a cat in the garden. Can it stay in my room?', 'I am afraid not. Cats are not allowed in the rooms.', ['Yes, it has. It is here at the desk.', 'Of course. I will bring one now.'], { grammar: ['gr-4-026', 'gr-5-018'] }),
  slot('i3_tour', 3, 16, 'c_student', 'calendar', ['I want to go by boat in the afternoon.', 'Not on Friday or Sunday, please.'], DAYS4, TOUR_TIMES, ['afternoon'], ['fri', 'sun'], 'sat-pm1', ['{Mr. Cole|@}', '{Ms. Ruiz|@}', '{Captain Reed|@}', '{Mrs. Dunn|@}'], { grammar: ['gr-5-002', 'gr-5-021'] }),
  pad('i3_call_change', 3, 17, 'p_cole', 'phone', ['Hello. This is {Mr. Cole|@}. I booked a room for Friday, but I want to come on Saturday. Please call me back.'], [['name', 'Name', '{Mr. Cole|@}', ['{Mr. Coal|@}', '{Mr. Bell|@}']], ['old', 'Old day', 'Friday', ['Thursday', 'Sunday']], ['new', 'New day', 'Saturday', ['Friday', 'Monday']], ['what', 'Please', 'call back', ['send a letter', 'wait']]], { features: ['audioOnly'], grammar: ['gr-3-001', 'gr-4-019'] }),
  msg('i3_condition', 3, 18, 'p_olsen', 'email', { from: '{Ms. Novak|@}', subject: 'A room on the top floor' }, ['Dear Sir, I will stay for four nights if you have a quiet room on the top floor.', 'If not, I will look for a different hotel.', 'Please write to me.'], 'Yes, we have a quiet room on the top floor. We will keep it for you.', ['No, the ship has been delayed.', 'I am sorry, I cannot find your wallet.'], { say: 'There is a letter for you at the desk.', grammar: ['gr-3-018', 'gr-4-019'] }),
  ask('i3_receipt', 3, 19, 'c_merchant', 'Could I have a receipt, please?', 'Of course. Here is your receipt.', ['I will look for it.', 'It is across from the church.'], { grammar: ['gr-4-002'], phrases: ['ph-pre2-0091'] }),
  check('i3_memo', 3, 20, 'p_olsen', 'I wrote a note for you. Please check the book.', [book([['name', 'Name', '{Mr. Cole|@}'], ['time', 'Arrives', '7:00 in the evening']]), note('Note', ['{Mr. Cole|@} called. He said that he would arrive at eight in the evening.'])], 'time', { grammar: ['gr-pre2-006', 'gr-5-019'], fix: ['8:00 in the evening', ['7:00 in the evening', '8:00 in the evening', '8:00 in the morning']] }),
  ask('i3_second_cond', 3, 21, 'c_student', 'What would you do if you had one free day here?', 'If I had one free day, I would visit the lighthouse.', ['If I have one free day, I visited the lighthouse.', 'I had one free day, and I will visited the lighthouse.'], { grammar: ['gr-pre2-007', 'gr-pre2-009'] }),
  ask('i3_late_arrival', 3, 22, 'p_ruiz', 'I will arrive after midnight. Is that all right?', 'Yes. We will keep your key for you.', ['I am afraid not. The hotel is full.', 'It is across from the church.'], { grammar: ['gr-4-002', 'gr-3-031'] }),
  pad('i3_wake_call', 3, 23, 'c_scholar', 'phone', ['Good evening. This is {Professor Hale|@} in room 22. Could I have a wake-up call at six tomorrow morning? Thank you.'], [['room', 'Room', '22', ['12', '32']], ['what', 'Please', 'wake-up call', ['new towels', 'an extra bed']], ['time', 'Time', '6:00 in the morning', ['6:00 in the evening', '8:00 in the morning']]], { features: ['audioOnly'], grammar: ['gr-4-007', 'gr-5-021'], phrases: ['ph-pre2-0083'] }),
  ask('i3_cold', 3, 24, 'c_grandma', 'My room is too cold. Do you have a warm blanket?', 'Yes, I will bring one at once.', ['No, thank you.', 'It is across from the church.'], { grammar: ['gr-4-022', 'gr-3-002'] }),
  sort('i3_luggage', 3, 25, 'Many guests are leaving today. Please put the bags in the right place.', ['store', 'desk', 'f3'], [['Suitcase for {Mr. Cole|@}, he leaves at six', 'store'], ['A letter for the guest in room 32', 'f3'], ['{Mrs. Dunn|@} will come back for her bag tonight', 'store'], ['The key of room 14', 'desk']], { grammar: ['gr-3-019'] }),
  check('i3_family_letter', 3, 26, 'c_mom', 'I wrote to you about the room. Is everything in the book?', [book([['name', 'Name', '{Anna|@}'], ['room', 'Room', 'family'], ['nights', 'Nights', '3'], ['bf', 'Breakfast', 'no breakfast']]), letterFrom('{Anna|@}', ['We are four. We would like a family room for three nights.', 'We would like to have breakfast every morning.'])], 'bf', { grammar: ['gr-4-007', 'gr-5-025'], fix: ['with breakfast', ['no breakfast', 'with breakfast', 'at night']] }),
  msg('i3_weather_letter', 3, 27, 'p_olsen', 'letter', { from: '{Ms. Novak|@}' }, ['Dear Sir, we come by ship on Friday. What is the weather like in autumn?', 'Do we need warm clothes?'], 'It is often cold and windy at night, so please bring a warm coat.', ['Your reservation has been confirmed.', 'We will keep your room for you.'], { say: 'A letter came with the morning ship.', grammar: ['gr-4-005', 'gr-5-013'] }),
  ask('i3_which', 3, 28, 'c_docker', 'Which is cheaper, a single room or a double room?', 'A single room is cheaper than a double room.', ['A double room is cheaper than a single room.', 'It is across from the church.'], { grammar: ['gr-4-014'] }),
  ask('i3_lost_key', 3, 29, 'c_merchant', 'I have lost my key. What should I do?', 'Please tell me your name. I will give you a new key.', ['You should visit the museum.', 'Your reservation has been cancelled.'], { grammar: ['gr-4-005', 'gr-3-002'] }),
  slot('i3_balcony', 3, 30, 'p_cole', 'rooms', ['I would like a double room with a balcony.', 'I do not want the first floor.'], FLOORS, [{ id: 'b2', label: 'Balcony, double', tags: ['balcony', 'double'] }, { id: 'n2', label: 'No balcony, double', tags: ['nobalcony', 'double'] }, { id: 'b1', label: 'Balcony, single', tags: ['balcony', 'single'] }], ['balcony', 'double'], ['f1'], 'f2-b2', GUESTS, { grammar: ['gr-4-007', 'gr-5-002'] }),
  ask('i3_extra', 3, 31, 'c_mom', 'Can we have an extra bed in our room?', 'Yes, but there is an extra charge of ten coins.', ['Yes, it left at noon.', 'No, it has not come yet.'], { grammar: ['gr-5-020', 'gr-5-015'] }),
  check('i3_name_card', 3, 32, 'p_dunn', 'My name is {Mrs. Dunn|@}. I have a reservation for a single room for five nights.', [book([['name', 'Name', '{Mrs. Dunn|@}'], ['room', 'Room', 'single'], ['nights', 'Nights', '4']]), letterFrom('{Mrs. Dunn|@}', ['A single room for five nights, please.'])], 'nights', { grammar: ['gr-5-003'], fix: ['5', ['4', '5', '6']] }),
  ask('i3_fog', 3, 33, 'c_sailor', 'The fog is very thick today. Will the ship leave?', 'I am afraid not. The ship does not leave in thick fog.', ['Yes, it left at noon.', 'You are welcome.'], { grammar: ['gr-4-002', 'gr-5-004'] }),
  ask('i3_heater', 3, 34, 'c_grandma', 'My room is only ten degrees. Could I have a heater?', 'I am very sorry. I will bring a heater at once.', ['It is across from the church.', 'It is forty coins.'], { grammar: ['gr-4-002', 'gr-3-030'] }),
  ask('i3_tip', 3, 35, 'p_cole', 'Is a tip necessary?', 'No, it is not necessary, but thank you.', ['Yes, the ship has been delayed.', 'It is across from the church.'], { grammar: ['gr-5-002'] }),
  ask('i3_pillow', 3, 36, 'p_dunn', 'Could I have a pillow? My neck hurts.', 'Of course. I will bring one at once.', ['It is across from the church.', 'From seven to nine.'], { grammar: ['gr-4-002'] }),
  ask('i3_gate', 3, 37, 'p_lin', 'The gate was locked when I came back at midnight.', 'I am very sorry. Next time, please knock.', ['You are welcome.', 'It is across from the church.'], { grammar: ['gr-3-019', 'gr-5-017'] }),
  ask('i3_passport', 3, 38, 'c_student', 'Do you need my passport?', 'Yes. Please show it to me at the desk.', ['You are welcome.', 'It is across from the church.'], { grammar: ['gr-5-004', 'gr-5-011'] }),
  ask('i3_guide', 3, 39, 'c_scholar', 'Is there a guide for the old castle?', 'Yes, a guide takes our guests there at ten every day.', ['It is across from the church.', 'You are welcome.'], { grammar: ['gr-5-020', 'gr-5-003'] }),
  ask('i3_anniversary', 3, 40, 'p_bell', 'Today is our wedding anniversary. Could you put some flowers in our room?', 'How lovely! I will put some flowers in your room.', ['It is across from the church.', 'You are welcome.'], { grammar: ['gr-4-002', 'gr-5-023'], phrases: ['ph-4-0005'] }),
];

// ---------------------------------------------------------------------------- rank 4 (英検2級): policies, refusals with alternatives, complaints, long letters
const POLICY = note('If you cancel', ['More than seven days before you come: a full refund.', 'From three to seven days before: half of the price.', 'Less than three days before: no refund.']);
const STORM_TIMES: Axis[] = [{ id: 'e6', label: '6:00', tags: ['early'] }, { id: 'e8', label: '8:00', tags: ['early'] }, { id: 'e10', label: '10:00', tags: ['late'] }];
const COLS_GROUP: Axis[] = [
  { id: 'q2', label: 'Two beds, sea side, bath', tags: ['beds2', 'sea', 'bath'] },
  { id: 'q4', label: 'Four beds, sea side, shower', tags: ['beds4', 'sea', 'shower'] },
  { id: 'q5', label: 'Four beds, garden side, bath', tags: ['beds4', 'garden', 'bath'] },
  { id: 'q6', label: 'Four beds, sea side, bath', tags: ['beds4', 'sea', 'bath'] },
];

const R4: AuthoredTask[] = [
  check('i4_refund', 4, 1, 'c_merchant', 'I cancelled my room five days before I came. I would like my money back.', [paper('invoice', 'Refund slip', [['paid', 'Paid', '120 coins'], ['when', 'Cancelled', '5 days before'], ['refund', 'Refund', '120 coins']]), POLICY], 'refund', { grammar: ['gr-pre2-001', 'gr-3-005'], fix: ['60 coins', ['0 coins', '60 coins', '120 coins']] }),
  ask('i4_full', 4, 2, 'p_ruiz', 'Do you have two double rooms for Saturday?', 'I am afraid we are full on Saturday, but we have two double rooms on Sunday.', ['Yes, I will bring them now.', 'I am afraid I cannot find your wallet.'], { grammar: ['gr-pre2-009'] }),
  ask('i4_alt_sea', 4, 3, 'p_cole', 'Could I have a room with a sea view for tomorrow night?', 'I am sorry, all the sea side rooms are taken. However, I can give you a garden side room at a lower price.', ['Yes, we will keep your room for you.', 'I recommend the old castle. It is quiet.'], { grammar: ['gr-pre2-061', 'gr-3-005'] }),
  msg('i4_complaint', 4, 4, 'p_olsen', 'email', { from: '{Mrs. Dunn|@}', subject: 'My stay last week' }, ['Dear Sir, I was very disappointed with my stay. The room was not clean when I arrived.', 'I would like to have my money back for one night.'], 'We are very sorry. We will send you a refund for one night.', ['You are welcome. Enjoy your stay.', 'It is across from the church.'], { say: 'Please answer this for me.', grammar: ['gr-3-005', 'gr-pre2-061'] }),
  ask('i4_sights', 4, 5, 'c_scholar', 'We have only one day. We love old buildings, but we do not like crowds. What do you recommend?', 'I recommend the old castle. It is quiet in the morning.', ['I recommend the market. It is always crowded.', 'It is across from the church.'], { grammar: ['gr-pre2-047', 'gr-3-007'] }),
  check('i4_nights_bill', 4, 6, 'c_merchant', 'I stayed only two nights, but this bill says three. There seems to be a problem with it.', [paper('invoice', 'Bill', [['arrive', 'Arrived', 'Monday'], ['leave', 'Left', 'Wednesday'], ['nights', 'Nights', '3'], ['total', 'Total', '180 coins']]), note('Prices', ['Double room: 60 coins a night'])], 'nights', { grammar: ['gr-5-019', 'gr-3-021'], phrases: ['ph-2-0040'], fix: ['2', ['1', '2', '3']] }),
  pad('i4_extend', 4, 7, 'p_ruiz', 'phone', ['Hello. This is {Ms. Ruiz|@} in room 25. I was wondering if I could stay two more nights, because I would like to see the lighthouse before I go home.'], [['room', 'Room', '25', ['15', '35']], ['more', 'More nights', '2', ['1', '4']], ['why', 'Because', 'see the lighthouse', ['go home today', 'change her room']]], { features: ['audioOnly'], grammar: ['gr-4-019'], phrases: ['ph-pre2-0111'] }),
  ask('i4_storm', 4, 8, 'c_student', 'The forecast says there will be a storm on Saturday, so my ship may not leave. What should I do?', 'You should stay one more night and leave on Sunday.', ['You should take the first ship on Saturday morning, in the storm.', 'It is across from the church.'], { grammar: ['gr-4-005', 'gr-3-018'] }),
  ask('i4_storm2', 4, 8.5, 'c_student', 'The storm is very bad. What do you suggest?', 'I suggest that you stay one more night, and leave on Sunday if the sea is calm.', ['I suggest that you take the first ship on Saturday morning, in the storm.', 'It is across from the church.'], { grammar: ['gr-2-043', 'gr-3-018'] }),
  check('i4_paid', 4, 9, 'c_merchant', 'I have already paid for my room. I paid on Tuesday, and {Mr. Olsen|@} said that I would have a receipt.', [paper('invoice', 'Bill', [['room', 'Room 31, 3 nights', '180 coins'], ['paid', 'Paid', 'no'], ['receipt', 'Receipt', 'not sent']]), note('Cash book', ['Tuesday: Room 31, 180 coins, paid by {Mr. Grant|@}.'])], 'paid', { grammar: ['gr-3-002', 'gr-pre2-006'], fix: ['yes', ['no', 'yes', 'half']] }),
  ask('i4_view_mistake', 4, 10, 'p_cole', 'Your letter said that my room had a sea view, but I see only the street!', 'I apologize for the mistake. I will give you a sea side room tomorrow, and the first night is half price.', ['We have found your bag.', 'You are welcome. Enjoy your stay.'], { grammar: ['gr-pre2-006', 'gr-3-005'] }),
  sort('i4_leaving', 4, 11, 'Four guests are leaving this morning. Please send everything to the right place.', ['ferry', 'store', 'laundry', 'post'], [['{Mr. Cole|@}: bags for the ferry at ten', 'ferry'], ['{Mrs. Dunn|@}: she will come back tonight, so keep her bag', 'store'], ['The towels from rooms 21 and 22', 'laundry'], ['A parcel for {Ms. Ruiz|@}, please send it to her', 'post']], { grammar: ['gr-3-019', 'gr-3-006'] }),
  msg('i4_lost_bag', 4, 12, 'p_olsen', 'letter', { from: '{Professor Hale|@}' }, ['Dear Sir, I think I left a small blue bag in room 12 last week. My camera is in it.', 'I would be grateful if you could look for it and send it to my school.'], 'We have found a small blue bag in room 12. We will send it to your school today.', ['The storm will be bad tomorrow.', 'Your reservation has been confirmed.'], { say: '{Professor Hale|@} wrote a letter after his stay.', grammar: ['gr-pre2-001', 'gr-2-034'] }),
  ask('i4_wondering', 4, 13, 'p_dunn', 'I was wondering if I could have a quieter room.', 'Certainly. I will move you to a room on the third floor.', ['That is fine. We will keep your room.', 'I recommend the old castle.'], { grammar: ['gr-pre2-009', 'gr-3-010'], phrases: ['ph-pre2-0111'] }),
  msg('i4_unless', 4, 14, 'p_olsen', 'letter', { from: '{Anna|@}', subject: 'Rooms for the summer' }, ['Dear Sir, my husband, my two children and I would like to stay with you in the summer.', 'We will come unless the ship is cancelled, but we need a room with four beds.'], 'We have a room with four beds on the sea side. We look forward to seeing you in the summer.', ['We have found your bag.', 'A room with one bed is cheaper.'], { say: 'There is a letter from {Anna|@}.', grammar: ['gr-3-018'] }),
  slot('i4_group', 4, 15, 'c_mom', 'rooms', ['We are four, and we like to take a bath.', 'Not the garden side, please.'], FLOORS, COLS_GROUP, ['beds4', 'bath'], ['garden'], 'f2-q6', GUESTS, { grammar: ['gr-5-002', 'gr-4-011'] }),
  check('i4_card', 4, 16, 'c_student', 'I am {Ken|@}. I wrote to you last week.', [paper('card', 'Guest card', [['name', 'Name', '{Ken|@}'], ['arrive', 'Arrive', 'Monday'], ['stay', 'Stay', '4 nights'], ['pay', 'Payment', 'when he leaves']]), letterFrom('{Ken|@}', ['I will arrive on Monday and stay for five nights.', 'I will pay when I leave.'])], 'stay', { grammar: ['gr-3-002', 'gr-3-019'], fix: ['5 nights', ['4 nights', '5 nights', '6 nights']] }),
  ask('i4_hot_water', 4, 17, 'c_cook', 'There is no hot water in my shower.', 'I am very sorry. I will fix it at once.', ['You are welcome. Enjoy your stay.', 'The museum is across from the church.'], { grammar: ['gr-pre2-023', 'gr-5-020'] }),
  ask('i4_breakfast_early', 4, 18, 'c_sailor', 'My ship leaves at six, before breakfast. Is there anything you can do?', 'Yes. The kitchen can prepare a breakfast box for you the night before.', ['It is across from the church.', 'You are welcome. Enjoy your stay.'], { grammar: ['gr-3-032', 'gr-3-007'], phrases: ['ph-pre2-0011'] }),
  ask('i4_discount', 4, 19, 'c_merchant', 'I stay here every month. Could you give me a discount?', 'I am afraid I cannot, but I can give you a free breakfast.', ['Yes, I will bring one now.', 'We have found your bag.'], { grammar: ['gr-3-022', 'gr-4-002'] }),
  slot('i4_dinner', 4, 20, 'c_cook', 'calendar', ['I would like to have a quiet dinner with my husband.', 'We cannot come on Friday, and we do not like a late table.'], DAYS4, STORM_TIMES, ['early'], ['fri'], 'sat-e6', ['{Mr. Cole|@}', '{Ms. Ruiz|@}', '{Captain Reed|@}', '{Mrs. Dunn|@}'], { grammar: ['gr-4-007', 'gr-5-002'] }),
  check('i4_long_letter', 4, 21, 'p_novak', 'I wrote a long letter. Please check the book.', [book([['name', 'Name', '{Ms. Novak|@}'], ['room', 'Room', 'single'], ['nights', 'Nights', '4'], ['bf', 'Breakfast', 'with breakfast'], ['pay', 'Pay', 'when she leaves']]), letterFrom('{Ms. Novak|@}', ['I would like a single room for four nights.', 'I do not need breakfast, because I will have it in town.', 'I will pay when I leave, not now.'])], 'bf', { grammar: ['gr-3-019', 'gr-pre2-033'], fix: ['no breakfast', ['no breakfast', 'with breakfast', 'late breakfast']] }),
  ask('i4_stranded', 4, 22, 'c_student', 'My ferry has been cancelled because of the storm. May I stay another night? I have only fifty coins.', 'Of course. A single room is forty coins, so you can stay.', ['The storm was very strong yesterday.', 'We will send it by post.'], { grammar: ['gr-pre2-045', 'gr-4-019'] }),
  msg('i4_thanks', 4, 23, 'p_olsen', 'letter', { from: '{Grandma Rose|@}' }, ['Dear Sir, thank you very much for my stay. The room was lovely, and your clerk was always helpful and kind.', 'I hope to come again next year.'], 'Thank you very much for your kind words. We hope to see you again next year.', ['We will send it to you by post.', 'Your reservation has been confirmed.'], { say: 'Rose sent a letter after her stay.', grammar: ['gr-pre2-021', 'gr-4-020'] }),
  check('i4_discount_bill', 4, 24, 'c_docker', 'The fourth night is half price for guests who stay four nights, I think. Please check my bill.', [paper('invoice', 'Bill', [['nights', 'Single room, 4 nights', '160 coins'], ['discount', 'Discount', '0 coins'], ['total', 'Total', '160 coins']]), note('Offer', ['Stay four nights: the fourth night is half price.', 'Single room: 40 coins a night.'])], 'discount', { grammar: ['gr-3-018', 'gr-4-014'], fix: ['20 coins', ['0 coins', '20 coins', '40 coins']] }),
  ask('i4_glasses', 4, 25, 'c_scholar', 'I cannot find my glasses. I need them!', 'Please look in the mirror, {Professor|@}. They are on your head.', ['You are welcome. Enjoy your stay.', 'We will send it by post.'], { grammar: ['gr-pre2-001', 'gr-5-019'] }),
  msg('i4_wedding', 4, 26, 'p_olsen', 'email', { from: '{Nora|@}', subject: 'Dinner on Saturday' }, ['Dear Sir, my sister is getting married next month. We would like a dinner for twenty on Saturday evening.', 'Is the dining room free?'], 'Yes, the dining room is free on Saturday evening. How lovely!', ['Your reservation has been cancelled.', 'We have found your bag.'], { say: '{Nora|@} has written to us.', grammar: ['gr-3-032', 'gr-3-010'] }),
  ask('i4_play', 4, 31.5, 'c_cook', 'Is there any music in the evening?', 'Yes. Our musicians play in the dining room after dinner.', ['It is across from the church.', 'You are welcome. Enjoy your stay.'], { grammar: ['gr-5-020', 'gr-5-003'] }),
  ask('i4_paper', 4, 24.5, 'c_scholar', 'Do you have a newspaper?', 'Yes, it is on the table in the dining room.', ['You should stay one more night.', 'It is across from the church.'], { grammar: ['gr-5-004', 'gr-5-021'] }),
  ask('i4_if_known', 4, 27, 'p_ruiz', 'If I had known about the storm, I would have come a day earlier.', 'I am sorry about that. Next time we will send you a letter about the weather.', ['The museum is across from the church.', 'Yes, it is included in the price.'], { grammar: ['gr-2-001', 'gr-pre2-010'] }),
  check('i4_policy_ok', 4, 28, 'p_cole', 'I cancelled nine days before I came. Here is my refund slip.', [paper('invoice', 'Refund slip', [['paid', 'Paid', '120 coins'], ['when', 'Cancelled', '9 days before'], ['refund', 'Refund', '120 coins']]), POLICY], null, { grammar: ['gr-3-005', 'gr-3-021'] }),
  ask('i4_deposit', 4, 29, 'c_merchant', 'Do I have to pay in advance, or can I pay when I leave?', 'You may pay when you leave, provided that you give us your name.', ['Yes, I will bring one now.', 'The storm will be bad tomorrow.'], { grammar: ['gr-4-003'], }),
  slot('i4_family_two', 4, 30, 'c_mom', 'rooms', ['We need two rooms: a double room for us and a single room for our son.', 'We do not want the first floor.'], FLOORS, [{ id: 'd', label: 'Double, sea side', tags: ['double', 'sea'] }, { id: 'a', label: 'Single, sea side', tags: ['single', 'sea'] }, { id: 'd2', label: 'Double, street side', tags: ['double', 'street'] }], ['single', 'sea'], ['f1'], 'f3-a', GUESTS, { grammar: ['gr-4-003', 'gr-5-002'] }),
  ask('i4_complaint_loud', 4, 31, 'p_lin', 'The music in the dining room was so loud that I could not sleep.', 'I am very sorry. The music will be quieter after nine.', ['That is fine. We will keep your room.', 'You can pay when you leave.'], { grammar: ['gr-4-021', 'gr-4-014'] }),
  msg('i4_ferry_mail', 4, 32, 'p_olsen', 'email', { from: '{Ken|@}', subject: 'My ferry on Monday' }, ['Dear Sir, thank you for the nice stay. I would like to change my ferry from Monday to Tuesday, if possible.', 'If you have a free room on Monday night, I will stay one more night.'], 'Yes, we have a free single room on Monday night, so you can stay one more night.', ['The sea was calm yesterday.', 'We have found a small blue bag in room 12.'], { say: 'There is an email from {Ken|@}.', grammar: ['gr-3-018', 'gr-pre2-034'] }),
  ask('i4_vegetarian', 4, 33, 'c_cook', 'I am a vegetarian. Could the kitchen make something for me?', 'Of course. The kitchen will make you something nice with vegetables.', ['We will send it by post.', 'That is fine. We will keep your room.'], { grammar: ['gr-4-023', 'gr-5-023'] }),
  ask('i4_souvenir', 4, 34, 'c_mom', 'Where can I buy a souvenir for my son?', 'There are some nice shops near the harbour.', ['We will keep your room for you.', 'It is across from the church.'], { grammar: ['gr-5-013', 'gr-5-020'] }),
  ask('i4_guidebook', 4, 35, 'p_ruiz', 'Do you have a guidebook about the island?', 'Yes. Here is a guidebook with a map and the ferry times.', ['Your reservation has been cancelled.', 'You are welcome. Enjoy your stay.'], { grammar: ['gr-5-004', 'gr-3-005'] }),
  ask('i4_upgrade', 4, 36, 'p_cole', 'Could I change to a bigger room? I will pay the difference.', 'Certainly. The difference is 20 coins a night.', ['The storm will be bad tomorrow.', 'We have found your bag.'], { grammar: ['gr-4-014', 'gr-4-002'] }),
  ask('i4_elevator', 4, 37, 'c_grandma', 'The elevator does not work.', 'I am very sorry. Please use the stairs, and I will carry your bag.', ['Thank you for your kind words.', 'We will send it by post.'], { grammar: ['gr-4-002', 'gr-5-011'] }),
  msg('i4_compliment', 4, 38, 'p_olsen', 'letter', { from: '{Mr. Grant|@}' }, ['Dear Sir, my room was always clean, and the breakfast was excellent. Even my cat liked the bread!', 'I will recommend your inn to all my friends.'], 'Thank you very much for your kind words. We hope to see you and your cat again.', ['Your reservation has been confirmed.', 'We will send it to you by post.'], { say: '{Mr. Grant|@} has written to us.', grammar: ['gr-4-020', 'gr-3-014'] }),
];

// ---------------------------------------------------------------------------- templates
const NAMES = ['{Mr. Lin|@}', '{Mr. Bell|@}', '{Ms. Ruiz|@}', '{Captain Reed|@}', '{Mr. Cole|@}', '{Mrs. Dunn|@}', '{Ms. Novak|@}'];
const nameField = { id: 'name', label: 'Name', values: NAMES };
const roomField = { id: 'room', label: 'Room', values: ['single', 'double'] };
const DAYS_F = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const ROOM_NUMS = ['12', '14', '18', '21', '25', '27', '31', '34', '36'];
const bookOf = (...ids: string[]) => [{ kind: 'ledger' as const, title: 'Book', fields: ids }];
const FLOOR_ROWS = FLOORS.map(({ id, label }) => ({ id, label }));
const SIDE_COLS = SEA_SINGLE_DOUBLE.map(({ id, label }) => ({ id, label }));
const SIDE_TAGS: Record<string, string[]> = { s1: ['sea', 'single'], s2: ['sea', 'double'], t1: ['street', 'single'], t2: ['street', 'double'] };

const TEMPLATES: TaskTemplate[] = [
  // ---- rank 1
  { id: 'it_check1', rank: 1, arch: 'check', person: 'client', say: 'Hello. My name is {name}. I have a {room} room for {nights} nights.',
    fields: [nameField, roomField, { id: 'nights', label: 'Nights', values: ['2', '3', '4'] }], docs: bookOf('name', 'room', 'nights'), target: 0, pWrong: 0.6, wrongable: ['room', 'nights'], grammar: ['gr-5-003'], phrases: ['ph-5-0039'] },
  { id: 'it_check_floor', rank: 1, arch: 'check', person: 'client', say: 'Good evening. I am {name}. My room is on the {floor} floor.',
    fields: [nameField, { id: 'floor', label: 'Floor', values: ['first', 'second', 'third'] }], docs: bookOf('name', 'floor'), target: 0, pWrong: 0.6, wrongable: ['floor', 'name'], grammar: ['gr-5-021', 'gr-5-024'], phrases: ['ph-5-0004'] },
  { id: 'it_check_num', rank: 1, arch: 'check', person: 'client', say: 'Hello. I am {name}. My room is number {number}.',
    fields: [nameField, { id: 'number', label: 'Number', values: ROOM_NUMS }], docs: bookOf('name', 'number'), target: 0, pWrong: 0.6, wrongable: ['number'], grammar: ['gr-5-024'] },
  { id: 'it_check_day', rank: 1, arch: 'check', person: 'client', say: 'We come on {day}. We want a {room} room for {nights} nights.',
    fields: [{ id: 'day', label: 'Day', values: DAYS_F }, roomField, { id: 'nights', label: 'Nights', values: ['1', '2', '3'] }], docs: bookOf('day', 'room', 'nights'), target: 0, pWrong: 0.6, wrongable: ['day', 'room', 'nights'], grammar: ['gr-5-021', 'gr-5-027'] },
  { id: 'it_check_bf1', rank: 1, arch: 'check', person: 'client', say: 'A {room} room, {breakfast}, please. I am {name}.',
    fields: [nameField, roomField, { id: 'breakfast', label: 'Breakfast', values: ['with breakfast', 'no breakfast'] }], docs: bookOf('name', 'room', 'breakfast'), target: 0, pWrong: 0.6, wrongable: ['room', 'breakfast'], grammar: ['gr-5-002', 'gr-4-007'] },
  { id: 'it_q', rank: 1, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'inn' },
  { id: 'it_q_help', rank: 1, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'inn_help' },
  { id: 'it_q_where', rank: 1, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'inn_where' },
  { id: 'it_bags', rank: 1, arch: 'sort', say: 'More bags. Look at the room number, please.', count: [3, 4], bins: ['f1', 'f2', 'f3'],
    patterns: [{ text: 'Room 1{digit}', bins: ['f1'] }, { text: 'Room 2{digit}', bins: ['f2'] }, { text: 'Room 3{digit}', bins: ['f3'] }, { text: '{Name}, room 1{digit}', bins: ['f1'] }, { text: '{Name}, room 2{digit}', bins: ['f2'] }, { text: '{Name}, room 3{digit}', bins: ['f3'] }], grammar: ['gr-5-024'] },
  { id: 'it_floors', rank: 1, arch: 'sort', say: 'Some bags have no number. Look at the floor.', count: [3, 4], bins: ['f1', 'f2', 'f3'],
    patterns: [{ text: 'For {bin}' }, { text: '{Name}, {bin}' }, { text: 'A bag for {bin}' }], grammar: ['gr-5-021'] },
  { id: 'it_trays', rank: 1, arch: 'sort', say: 'Please take each one to the right place.', count: [3, 4], bins: ['kitchen', 'desk', 'f1', 'f2', 'f3'],
    patterns: [{ text: 'Eggs and milk', bins: ['kitchen'] }, { text: 'Bread for breakfast', bins: ['kitchen'] }, { text: 'Tea and sugar', bins: ['kitchen'] }, { text: 'A letter for {Mr. Olsen|@}', bins: ['desk'] }, { text: 'The key of room {digit}0', bins: ['desk'] }, { text: 'A bag for room 1{digit}', bins: ['f1'] }, { text: 'A bag for room 2{digit}', bins: ['f2'] }, { text: 'A bag for room 3{digit}', bins: ['f3'] }], grammar: ['gr-5-011'] },
  { id: 'it_rooms1', rank: 1, arch: 'respond', person: 'client', mode: 'slot', kind: 'speech', layout: 'rooms', rows: FLOOR_ROWS, cols: SIDE_COLS, cellTags: SIDE_TAGS,
    want: [{ tag: 'sea', text: 'I want a room with a sea view.' }, { tag: 'single', text: 'A single room, please.' }, { tag: 'double', text: 'A double room, please.' }, { tag: 'f3', text: 'I like the top floor.' }],
    avoid: [{ tag: 'street', text: 'Not on the street side, please.' }, { tag: 'f3', text: 'Not the top floor, please.' }], busy: GUESTS_T(), grammar: ['gr-5-025', 'gr-5-002'] },
  { id: 'it_rooms1b', rank: 1, arch: 'respond', person: 'client', mode: 'slot', kind: 'speech', layout: 'rooms', rows: FLOOR_ROWS, cols: SIDE_COLS, cellTags: SIDE_TAGS,
    want: [{ tag: 'double', text: 'We are two.' }, { tag: 'single', text: 'I am alone.' }, { tag: 'sea', text: 'I like the sea.' }, { tag: 'f1', text: "I can't use the stairs." }],
    avoid: [{ tag: 'street', text: 'I do not like the street.' }, { tag: 'f1', text: 'Not the first floor, please.' }], busy: GUESTS_T(), grammar: ['gr-5-015', 'gr-5-002'] },

  // ---- rank 2
  { id: 'it_check2', rank: 2, arch: 'check', person: 'client', say: 'Good evening. I am {name}. I booked a {room} room for {nights} nights, {breakfast}.',
    fields: [nameField, roomField, { id: 'nights', label: 'Nights', values: ['1', '2', '3', '4'] }, { id: 'breakfast', label: 'Breakfast', values: ['with breakfast', 'no breakfast'] }], docs: bookOf('name', 'room', 'nights', 'breakfast'), target: 0, pWrong: 0.65, wrongable: ['room', 'nights', 'breakfast'], grammar: ['gr-5-018'] },
  { id: 'it_check_dates', rank: 2, arch: 'check', person: 'client', say: 'I arrive on {arrive} and I leave on {leave}.',
    fields: [nameField, { id: 'arrive', label: 'Arrive', values: ['Friday', 'Saturday', 'Sunday', 'Monday'] }, { id: 'leave', label: 'Leave', values: ['Sunday', 'Monday', 'Tuesday', 'Wednesday'] }], docs: bookOf('name', 'arrive', 'leave'), target: 0, pWrong: 0.65, wrongable: ['arrive', 'leave'], grammar: ['gr-5-021', 'gr-5-003'] },
  { id: 'it_check_months', rank: 2, arch: 'check', person: 'client', say: 'Good morning. I would like a {room} room {stay}.',
    fields: [roomField, { id: 'stay', label: 'Dates', values: ['from 3 March to 5 March', 'from 12 April to 15 April', 'from 20 August to 23 August', 'from 5 September to 9 September', 'from 14 October to 17 October', 'from 8 November to 11 November', 'from 22 December to 27 December'] }],
    docs: bookOf('room', 'stay'), target: 0, pWrong: 0.65, wrongable: ['room', 'stay'], grammar: ['gr-3-021', 'gr-4-007'] },
  { id: 'it_check_time', rank: 2, arch: 'check', person: 'client', say: 'I want breakfast at {time}, please. I leave at {leave}.',
    fields: [{ id: 'time', label: 'Breakfast', values: ['7:00', '7:30', '8:00', '8:30'] }, { id: 'leave', label: 'Leave at', values: ['9:00', '10:00', '11:00'] }], docs: bookOf('time', 'leave'), target: 0, pWrong: 0.65, wrongable: ['time', 'leave'], grammar: ['gr-5-021', 'gr-4-007'] },
  { id: 'it_check_price', rank: 2, arch: 'check', person: 'client', say: 'The room is {price} a night, I think. I want it for {nights} nights.',
    fields: [{ id: 'price', label: 'Price', values: ['40 coins', '50 coins', '60 coins'] }, { id: 'nights', label: 'Nights', values: ['2', '3', '4'] }], docs: bookOf('price', 'nights'), target: 0, pWrong: 0.65, wrongable: ['price', 'nights'], grammar: ['gr-5-014', 'gr-4-020'] },
  { id: 'it_check_list', rank: 2, arch: 'check', person: 'client', say: 'Please check my bill. I had a {room} room.',
    fields: [{ id: 'room', label: 'Room', values: ['single', 'double'] }, { id: 'p1', label: 'Room price', values: ['40 coins', '60 coins', '50 coins'] }, { id: 'p2', label: 'Breakfast price', values: ['5 coins', '10 coins'] }],
    docs: [{ kind: 'invoice', title: 'Bill', fields: ['p1', 'p2'] }, { kind: 'note', title: 'Prices', lines: ['{room} room: {p1} a night', 'Breakfast: {p2} a day'] }], target: 0, pWrong: 0.65, wrongable: ['p1', 'p2'], grammar: ['gr-5-014'] },
  { id: 'it_check_letter', rank: 2, arch: 'check', person: 'client', say: 'I sent you a letter. Is the book right?',
    fields: [nameField, { id: 'room', label: 'Room', values: ['single', 'double', 'family'] }, { id: 'nights', label: 'Nights', values: ['2', '3', '4'] }],
    docs: [{ kind: 'ledger', title: 'Book', fields: ['name', 'room', 'nights'] }, { kind: 'letter', title: 'Letter', lines: ['Dear Sir,', 'I want a {room} room for {nights} nights.', '{name}'] }], target: 0, pWrong: 0.65, wrongable: ['room', 'nights'], grammar: ['gr-3-002', 'gr-5-025'] },
  { id: 'it_q_day', rank: 2, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'inn_day' },
  { id: 'it_q_money', rank: 2, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'inn_money' },
  { id: 'it_q_phone', rank: 2, arch: 'respond', mode: 'choose', kind: 'phone', bank: 'inn_phone' },
  { id: 'it_bags_long', rank: 2, arch: 'sort', say: 'The ship is in. Many bags! Please look at the name on each bag.', count: [4, 5], bins: ['f1', 'f2', 'f3', 'laundry'],
    patterns: [{ text: '{Name}, {bin}', bins: ['f1', 'f2', 'f3'] }, { text: 'Room 1{digit}, first floor', bins: ['f1'] }, { text: 'Room 2{digit}, second floor', bins: ['f2'] }, { text: 'Room 3{digit}, top floor', bins: ['f3'] }, { text: 'Dirty towels from room {digit}1', bins: ['laundry'] }, { text: 'Dirty sheets, room {digit}2', bins: ['laundry'] }], grammar: ['gr-5-024', 'gr-5-026'] },
  { id: 'it_laundry', rank: 2, arch: 'sort', say: 'The laundry is on the floor again. Please put it in the right place.', count: [4, 5], bins: ['laundry', 'f1', 'f2', 'f3'],
    patterns: [{ text: 'A dirty towel', bins: ['laundry'] }, { text: 'Two dirty towels', bins: ['laundry'] }, { text: 'A dirty blanket', bins: ['laundry'] }, { text: 'Dirty sheets from room {digit}3', bins: ['laundry'] }, { text: 'A clean towel for room 1{digit}', bins: ['f1'] }, { text: 'A clean blanket for room 2{digit}', bins: ['f2'] }, { text: 'Clean towels for room 3{digit}', bins: ['f3'] }], grammar: ['gr-5-026'] },
  { id: 'it_rooms', rank: 2, arch: 'respond', person: 'client', mode: 'slot', kind: 'speech', layout: 'rooms', rows: FLOOR_ROWS, cols: SIDE_COLS, cellTags: SIDE_TAGS,
    want: [{ tag: 'sea', text: 'I want a room with a sea view.' }, { tag: 'single', text: 'A single room, please.' }, { tag: 'double', text: 'A double room, please.' }, { tag: 'f3', text: 'I like the top floor.' }, { tag: 'f1', text: "I can't use the stairs." }],
    avoid: [{ tag: 'street', text: 'Not on the street side, please.' }, { tag: 'f1', text: 'Not the first floor, please.' }, { tag: 'f3', text: 'Not the top floor, please.' }], busy: GUESTS_T(), grammar: ['gr-5-025', 'gr-5-002'] },
  { id: 'it_rooms_bath', rank: 2, arch: 'respond', person: 'client', mode: 'slot', kind: 'speech', layout: 'rooms', rows: FLOOR_ROWS, cols: COLS_BATH.map(({ id, label }) => ({ id, label })), cellTags: Object.fromEntries(COLS_BATH.map((c) => [c.id, c.tags!])),
    want: [{ tag: 'bath', text: 'I like to take a bath.' }, { tag: 'shower', text: 'I like to take a shower in the morning.' }, { tag: 'sea', text: 'I want to see the sea from my bed.' }, { tag: 'garden', text: 'I like the garden.' }],
    avoid: [{ tag: 'sea', text: 'I do not like the sea side. It is too windy.' }, { tag: 'f1', text: 'Not the first floor, please.' }], busy: GUESTS_T(), grammar: ['gr-4-011', 'gr-5-002'] },
  { id: 'it_rooms_family', rank: 2, arch: 'respond', person: 'client', mode: 'slot', kind: 'speech', layout: 'rooms', rows: FLOOR_ROWS, cols: COLS_FAMILY.map(({ id, label }) => ({ id, label })), cellTags: Object.fromEntries(COLS_FAMILY.map((c) => [c.id, c.tags!])),
    want: [{ tag: 'beds4', text: 'We are four.' }, { tag: 'beds2', text: 'We are two.' }, { tag: 'sea', text: 'We like the sea.' }, { tag: 'garden', text: 'The children like the garden.' }],
    avoid: [{ tag: 'f3', text: 'The little boy cannot use the stairs.' }, { tag: 'f1', text: 'Not the first floor, please.' }], busy: GUESTS_T(), grammar: ['gr-5-001', 'gr-5-025'] },
  { id: 'it_boat', rank: 2, arch: 'respond', person: 'client', mode: 'slot', kind: 'speech', layout: 'calendar', rows: DAYS3.map(({ id, label }) => ({ id, label })), cols: BOAT_TIMES.map(({ id, label }) => ({ id, label })),
    cellTags: { am: ['morning'], pm1: ['afternoon'], pm4: ['afternoon'] },
    want: [{ tag: 'fri', text: 'I want to go by boat on Friday.' }, { tag: 'sat', text: 'I want to go by boat on Saturday.' }, { tag: 'sun', text: 'I want to go by boat on Sunday.' }, { tag: 'morning', text: 'I like to go in the morning.' }, { tag: 'afternoon', text: 'I want to go in the afternoon.' }],
    avoid: [{ tag: 'pm4', text: 'Not at four, please.' }, { tag: 'am', text: 'Not at nine, please.' }], busy: ['{Mr. Cole|@}', '{Ms. Ruiz|@}', '{Captain Reed|@}', '{Mrs. Dunn|@}'], grammar: ['gr-5-021', 'gr-5-025'] },

  // ---- rank 3
  { id: 'it_check_change', rank: 3, arch: 'check', person: 'client', say: 'I wrote to you yesterday. I would like to change my reservation.',
    fields: [nameField, { id: 'arrive', label: 'Arrive', values: ['Friday', 'Saturday', 'Sunday', 'Monday'] }, { id: 'nights', label: 'Nights', values: ['2', '3', '4', '5'] }],
    docs: [{ kind: 'ledger', title: 'Book', fields: ['name', 'arrive', 'nights'] }, { kind: 'letter', title: 'Letter', lines: ['Dear Sir,', 'Please change my reservation.', 'I will arrive on {arrive}, and I will stay for {nights} nights.', '{name}'] }], target: 0, pWrong: 0.7, wrongable: ['arrive', 'nights'], grammar: ['gr-3-001', 'gr-4-002'] },
  { id: 'it_check_bill3', rank: 3, arch: 'check', person: 'client', say: 'I think there is a mistake in my bill.',
    fields: [{ id: 'p1', label: 'Room price', values: ['40 coins', '60 coins', '50 coins'] }, { id: 'p2', label: 'Breakfast price', values: ['5 coins', '10 coins'] }, { id: 'p3', label: 'Extra bed price', values: ['10 coins', '15 coins', '20 coins'] }],
    docs: [{ kind: 'invoice', title: 'Bill', fields: ['p1', 'p2', 'p3'] }, { kind: 'note', title: 'Prices', lines: ['Room: {p1} a night', 'Breakfast: {p2} a day', 'Extra bed: {p3} a night'] }], target: 0, pWrong: 0.75, wrongable: ['p1', 'p2', 'p3'], grammar: ['gr-5-014', 'gr-4-014'] },
  { id: 'it_check_rule', rank: 3, arch: 'check', person: 'client', say: 'I would like to stay longer. Is that all right?',
    fields: [{ id: 'out', label: 'Leave at', values: ['10:00', '11:00', '12:00'] }, { id: 'late', label: 'Late {check-out|in_checkout}', values: ['2:00', '3:00'] }],
    docs: [{ kind: 'ledger', title: 'Book', fields: ['out', 'late'] }, { kind: 'note', title: 'Rule', lines: ['We leave at {out}.', 'With a late {check-out|in_checkout}, we leave at {late}.'] }], target: 0, pWrong: 0.7, wrongable: ['out', 'late'], grammar: ['gr-4-007', 'gr-3-018'] },
  { id: 'it_q_letter', rank: 3, arch: 'respond', mode: 'choose', kind: 'letter', bank: 'inn_mail' },
  { id: 'it_q_email', rank: 3, arch: 'respond', mode: 'choose', kind: 'email', bank: 'inn_mail' },
  { id: 'it_q_call', rank: 3, arch: 'respond', mode: 'choose', kind: 'phone', bank: 'inn_phone', features: ['audioOnly'] },
  { id: 'it_q_talk', rank: 3, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'inn_talk' },
  { id: 'it_q_advice', rank: 3, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'inn_advice' },
  { id: 'it_bags2', rank: 3, arch: 'sort', say: 'A lot of bags today. Look at them well.', count: [4, 5], bins: ['f1', 'f2', 'f3'],
    patterns: [{ text: '{Name}, top floor', bins: ['f3'] }, { text: "{Name} can't use the stairs.", bins: ['f1'] }, { text: '{Name}, second floor, room 2{digit}', bins: ['f2'] }, { text: 'Room 3{digit}, sea side', bins: ['f3'] }, { text: 'Room 1{digit}, street side', bins: ['f1'] }], grammar: ['gr-5-015', 'gr-5-024'] },
  { id: 'it_lost', rank: 3, arch: 'sort', say: 'Lost things go in the lost box, dirty things to the laundry, and bags to the luggage room.', count: [4, 5], bins: ['lost', 'laundry', 'store', 'f2', 'f3'],
    patterns: [{ text: 'A black umbrella, found in the hall', bins: ['lost'] }, { text: 'A blue scarf, found on the stairs', bins: ['lost'] }, { text: 'A wallet, found in room {digit}1', bins: ['lost'] }, { text: 'Glasses, found at the front desk', bins: ['lost'] }, { text: 'A red hat, found in the hall', bins: ['lost'] }, { text: 'A pair of shoes, found on the stairs', bins: ['lost'] }, { text: 'A brown jacket, found in room {digit}1', bins: ['lost'] }, { text: 'A watch, found at the front desk', bins: ['lost'] }, { text: 'Dirty sheets from room 2{digit}', bins: ['laundry'] }, { text: 'Dirty towels from room 3{digit}', bins: ['laundry'] }, { text: 'A dirty shirt from room 2{digit}', bins: ['laundry'] }, { text: 'A dirty jacket from room 3{digit}', bins: ['laundry'] }, { text: 'A suitcase for {Name}, who leaves tonight', bins: ['store'] }, { text: '{Name} will come back for the bag at six', bins: ['store'] }, { text: 'Breakfast for room 2{digit}', bins: ['f2'] }, { text: 'Breakfast for room 3{digit}', bins: ['f3'] }], grammar: ['gr-3-012', 'gr-3-019'] },
  { id: 'it_rooms3', rank: 3, arch: 'respond', person: 'client', mode: 'slot', kind: 'speech', layout: 'rooms', rows: FLOOR_ROWS,
    cols: [{ id: 'b2', label: 'Balcony, double' }, { id: 'n2', label: 'No balcony, double' }, { id: 'b1', label: 'Balcony, single' }, { id: 'n1', label: 'No balcony, single' }],
    cellTags: { b2: ['balcony', 'double'], n2: ['nobalcony', 'double'], b1: ['balcony', 'single'], n1: ['nobalcony', 'single'] },
    want: [{ tag: 'balcony', text: 'I would like a room with a balcony.' }, { tag: 'double', text: 'We would like a double room.' }, { tag: 'single', text: 'I would like a single room.' }, { tag: 'f3', text: 'I would like a room on the top floor.' }],
    avoid: [{ tag: 'f1', text: 'I do not want the first floor.' }, { tag: 'f3', text: 'The top floor is too high for me.' }, { tag: 'double', text: 'I do not need a double room.' }], busy: GUESTS_T(), grammar: ['gr-4-007', 'gr-5-002'] },
  { id: 'it_tour', rank: 3, arch: 'respond', person: 'client', mode: 'slot', kind: 'speech', layout: 'calendar', rows: DAYS4.map(({ id, label }) => ({ id, label })), cols: TOUR_TIMES.map(({ id, label }) => ({ id, label })),
    cellTags: { am: ['morning'], pm1: ['afternoon'], pm4: ['afternoon'] },
    want: [{ tag: 'morning', text: 'I would like to go in the morning.' }, { tag: 'afternoon', text: 'I want to go in the afternoon.' }, { tag: 'sat', text: 'We have a free day on Saturday.' }, { tag: 'mon', text: 'We can only go on Monday.' }],
    avoid: [{ tag: 'fri', text: 'Not on Friday, please.' }, { tag: 'sun', text: 'Not on Sunday. We go to church.' }, { tag: 'pm4', text: 'Not at four. It is too late.' }], busy: ['{Mr. Cole|@}', '{Ms. Ruiz|@}', '{Captain Reed|@}', '{Mrs. Dunn|@}'], grammar: ['gr-5-021', 'gr-4-007'] },

  // ---- rank 4
  { id: 'it_check_refund', rank: 4, arch: 'check', person: 'client', say: 'I cancelled my room, and I would like my money back.',
    fields: [{ id: 'paid', label: 'Paid', values: ['120 coins'] }, { id: 'when', label: 'Cancelled', values: ['9 days before', '5 days before', '2 days before'] }, { id: 'refund', label: 'Refund', values: ['120 coins', '60 coins', '0 coins'] }],
    docs: [{ kind: 'invoice', title: 'Refund slip', fields: ['paid', 'when', 'refund'] }, { kind: 'note', title: 'If you cancel', lines: ['More than seven days before you come: a full refund.', 'From three to seven days before: half of the price.', 'Less than three days before: no refund.'] }], target: 0, pWrong: 0.5, wrongable: ['refund'], grammar: ['gr-3-005', 'gr-pre2-001'] },
  { id: 'it_check_letter4', rank: 4, arch: 'check', person: 'client', say: 'I wrote a long letter, because my plans are not simple. Please check the book.',
    fields: [nameField, { id: 'room', label: 'Room', values: ['single', 'double', 'family'] }, { id: 'nights', label: 'Nights', values: ['3', '4', '5'] }, { id: 'bf', label: 'Breakfast', values: ['with breakfast', 'no breakfast'] }],
    docs: [{ kind: 'ledger', title: 'Book', fields: ['name', 'room', 'nights', 'bf'] }, { kind: 'letter', title: 'Letter', lines: ['Dear Sir,', 'I would like a {room} room for {nights} nights.', 'Please book it {bf}.', '{name}'] }], target: 0, pWrong: 0.7, wrongable: ['room', 'nights', 'bf'], grammar: ['gr-4-007', 'gr-3-014'] },
  { id: 'it_check_bill4', rank: 4, arch: 'check', person: 'client', say: 'There seems to be a mistake in my bill. Would you check it, please?',
    fields: [{ id: 'p1', label: 'Room price', values: ['40 coins', '60 coins', '50 coins'] }, { id: 'p2', label: 'Breakfast price', values: ['5 coins', '10 coins'] }, { id: 'p3', label: 'Late {check-out|in_checkout}', values: ['10 coins', '20 coins'] }],
    docs: [{ kind: 'invoice', title: 'Bill', fields: ['p1', 'p2', 'p3'] }, { kind: 'note', title: 'Prices', lines: ['Room: {p1} a night', 'Breakfast: {p2} a day', 'Late {check-out|in_checkout}: {p3}'] }], target: 0, pWrong: 0.75, wrongable: ['p1', 'p2', 'p3'], grammar: ['gr-3-005', 'gr-4-014'], phrases: ['ph-2-0040'] },
  { id: 'it_q_mail4', rank: 4, arch: 'respond', mode: 'choose', kind: 'email', bank: 'inn_mail4' },
  { id: 'it_q_letter4', rank: 4, arch: 'respond', mode: 'choose', kind: 'letter', bank: 'inn_mail4' },
  { id: 'it_q_refuse', rank: 4, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'inn_refuse' },
  { id: 'it_q_call4', rank: 4, arch: 'respond', mode: 'choose', kind: 'phone', bank: 'inn_refuse', features: ['audioOnly'] },
  { id: 'it_q_town', rank: 4, arch: 'respond', mode: 'choose', kind: 'speech', bank: 'inn_town' },
  { id: 'it_leaving', rank: 4, arch: 'sort', say: 'Many guests leave this morning. Please send everything to the right place.', count: [4, 5], bins: ['ferry', 'store', 'laundry', 'post', 'desk'],
    patterns: [{ text: 'Bags for the ferry at {digit}:00', bins: ['ferry'] }, { text: '{Name} is on the ferry at ten', bins: ['ferry'] }, { text: '{Name} will return tonight, so keep the bag', bins: ['store'] }, { text: 'Sheets and towels from rooms 2{digit} and 3{digit}', bins: ['laundry'] }, { text: 'A parcel for {Name}, please send it by post', bins: ['post'] }, { text: 'Letters to go to the post office', bins: ['post'] }, { text: 'The keys of rooms {digit}1 and {digit}2', bins: ['desk'] }], grammar: ['gr-3-019', 'gr-3-006'] },
  { id: 'it_found', rank: 4, arch: 'sort', say: 'These things were found after the guests left. Please put them in the right place.', count: [4, 5], bins: ['lost', 'post', 'laundry', 'store', 'desk'],
    patterns: [{ text: 'A camera, found in room 1{digit}; the guest will come back', bins: ['store'] }, { text: 'A pair of glasses; the owner lives in town', bins: ['lost'] }, { text: 'A book, found on the stairs', bins: ['lost'] }, { text: 'A toy boat, found in the garden', bins: ['lost'] }, { text: 'A watch; the owner will come back tonight', bins: ['store'] }, { text: 'A coat; the guest wrote from abroad, please post it', bins: ['post'] }, { text: 'A scarf, found in room 3{digit}, very dirty', bins: ['laundry'] }, { text: 'The key from room 2{digit}', bins: ['desk'] }], grammar: ['gr-3-012', 'gr-3-006'] },
  { id: 'it_rooms4', rank: 4, arch: 'respond', person: 'client', mode: 'slot', kind: 'speech', layout: 'rooms', rows: FLOOR_ROWS, cols: COLS_GROUP.map(({ id, label }) => ({ id, label })), cellTags: Object.fromEntries(COLS_GROUP.map((c) => [c.id, c.tags!])),
    want: [{ tag: 'beds4', text: 'We are four, so we need four beds.' }, { tag: 'beds2', text: 'We are only two, so two beds are enough.' }, { tag: 'bath', text: 'We would like to take a bath.' }, { tag: 'shower', text: 'We prefer a shower to a bath.' }, { tag: 'sea', text: 'We would like to see the sea.' }],
    avoid: [{ tag: 'garden', text: 'We do not want the garden side.' }, { tag: 'f1', text: 'We do not want the first floor.' }, { tag: 'bath', text: 'We do not need a bath.' }], busy: GUESTS_T(), grammar: ['gr-4-007', 'gr-5-002'] },
  { id: 'it_dinner', rank: 4, arch: 'respond', person: 'client', mode: 'slot', kind: 'speech', layout: 'calendar', rows: DAYS4.map(({ id, label }) => ({ id, label })), cols: STORM_TIMES.map(({ id, label }) => ({ id, label })),
    cellTags: { e6: ['early'], e8: ['early'], e10: ['late'] },
    want: [{ tag: 'early', text: 'We would like to have an early dinner.' }, { tag: 'late', text: 'We would like a late dinner, after the ship comes in.' }, { tag: 'sat', text: 'We are free on Saturday.' }, { tag: 'mon', text: 'We can only come on Monday.' }],
    avoid: [{ tag: 'fri', text: 'We cannot come on Friday.' }, { tag: 'sun', text: 'We do not want to eat out on Sunday.' }, { tag: 'e8', text: 'Eight is not a good time for us.' }], busy: ['{Mr. Cole|@}', '{Ms. Ruiz|@}', '{Captain Reed|@}', '{Mrs. Dunn|@}'], grammar: ['gr-4-007', 'gr-5-002'] },
  { id: 'it_rooms4b', rank: 4, arch: 'respond', person: 'client', mode: 'slot', kind: 'speech', layout: 'rooms', rows: FLOOR_ROWS, cols: SIDE_COLS, cellTags: SIDE_TAGS,
    want: [{ tag: 'sea', text: 'I was told that the sea side rooms are lovely, so I would like one.' }, { tag: 'single', text: 'I am travelling alone, so a single room is enough.' }, { tag: 'double', text: 'My wife is coming too, so we need a double room.' }, { tag: 'f2', text: 'I would like to be on the second floor.' }],
    avoid: [{ tag: 'street', text: 'I could not sleep well on the street side last time.' }, { tag: 'f3', text: 'I hate stairs, so not the top floor.' }, { tag: 'f1', text: 'I do not want to be near the front door.' }], busy: GUESTS_T(), grammar: ['gr-pre2-006', 'gr-3-007'] },
];
function GUESTS_T(): string[] {
  return ['{Mr. Bell|@}', '{Mr. Lin|@}', '{Ms. Ruiz|@}', '{Captain Reed|@}', '{Grandma Rose|@}', '{Mr. Cole|@}', '{Mrs. Dunn|@}'];
}

// ---------------------------------------------------------------------------- question / answer banks (distractors are answers of other functions)
const QA: Record<string, QaItem[]> = {
  // the desk's everyday questions (speech)
  inn: [
    { q: 'What time is breakfast?', a: 'From seven to nine.', fn: 'time', rank: 1, grammar: ['gr-5-013'], phrases: ['ph-5-0042'] },
    { q: 'Where is my room?', a: 'On the second floor.', fn: 'place', rank: 1, grammar: ['gr-5-021'], phrases: ['ph-5-0089'] },
    { q: 'Can I have a towel, please?', a: 'Sure. Here you are.', fn: 'request', rank: 1, grammar: ['gr-5-015'], phrases: ['ph-5-0025'] },
    { q: 'Thank you for the nice room.', a: 'You are welcome. Enjoy your stay.', fn: 'thanks', rank: 1, phrases: ['ph-5-0016'] },
    { q: 'How much is one night?', a: 'It is forty coins.', fn: 'price', rank: 1, grammar: ['gr-5-014'], phrases: ['ph-5-0044'] },
    { q: 'Is there a bath in my room?', a: 'Yes, every room has a bath.', fn: 'yesno', rank: 1, grammar: ['gr-5-020'] },
    { q: 'I am sorry. I am late.', a: 'That is all right. Here is your key.', fn: 'apology', rank: 1, phrases: ['ph-5-0020'] },
    { q: 'Good night!', a: 'Good night. See you tomorrow.', fn: 'farewell', rank: 1, phrases: ['ph-5-0005', 'ph-5-0008'] },
    { q: 'Is the market near here?', a: 'Yes, it is across from the bank.', fn: 'nearby', rank: 2, grammar: ['gr-5-021'] },
    { q: 'When do I leave the room?', a: 'Before eleven, please.', fn: 'leave', rank: 2, grammar: ['gr-3-019'] },
    { q: 'Can I leave my bag here?', a: 'Of course. I will put it in the back room.', fn: 'bag', rank: 2, phrases: ['ph-5-0061'] },
    { q: 'Is breakfast included in the price?', a: 'Yes, it is. You do not pay more.', fn: 'included', rank: 2, phrases: ['ph-3-0036'] },
    { q: 'Do you have a room for tonight?', a: 'Yes, we do. Do you want a single or a double?', fn: 'vacancy', rank: 2, grammar: ['gr-5-004'] },
    { q: 'My room is too cold.', a: 'Sorry! I will bring a blanket.', fn: 'complaint', rank: 3, grammar: ['gr-4-002', 'gr-4-022'] },
    { q: 'Have you seen my key?', a: 'Yes, it is here at the desk.', fn: 'lostkey', rank: 3, grammar: ['gr-3-001'] },
    { q: 'Could I stay one more night?', a: 'Yes, the room is free tomorrow, too.', fn: 'extend', rank: 3, phrases: ['ph-4-0005'] },
    { q: 'Could you tell me how much a room is with breakfast?', a: 'It is 45 coins a night, and breakfast is included.', fn: 'quote', rank: 4, grammar: ['gr-3-010', 'gr-3-005'] },
  ],
  // requests and offers
  inn_help: [
    { q: 'Can I have a blanket, please?', a: 'Sure. I will bring one.', fn: 'request', rank: 1, grammar: ['gr-5-015', 'gr-4-002'] },
    { q: 'Hello. Can you help me with my bag?', a: 'Of course. I will take it to your room.', fn: 'help', rank: 1, phrases: ['ph-5-0085'] },
    { q: 'May I use the phone?', a: 'Yes, it is on the desk.', fn: 'permission', rank: 1, phrases: ['ph-5-0087'] },
    { q: 'The room is too hot.', a: 'Sorry! I will open the window.', fn: 'complaint', rank: 1, grammar: ['gr-4-002'] },
    { q: 'I do not understand. Can you say it again?', a: 'Of course. I will say it again, slowly.', fn: 'again', rank: 1, phrases: ['ph-5-0057'] },
    { q: 'I am hungry.', a: 'The kitchen is open. Would you like some bread?', fn: 'offer', rank: 1, grammar: ['gr-4-007'], phrases: ['ph-5-0072'] },
    { q: 'Thank you for your help.', a: 'You are welcome.', fn: 'thanks', rank: 1, phrases: ['ph-5-0016'] },
    { q: 'I cannot sleep. Do you have any tea?', a: 'Yes. I will bring you a cup of tea.', fn: 'tea', rank: 2, grammar: ['gr-4-002'] },
    { q: 'Could you open the door for me?', a: 'Of course. Here you are.', fn: 'door', rank: 2, phrases: ['ph-4-0005'] },
    { q: 'I would like a bigger room.', a: 'I will see. Please wait a moment.', fn: 'bigger', rank: 2, grammar: ['gr-4-007', 'gr-4-014'] },
  ],
  // where / when in town
  inn_where: [
    { q: 'Where is the station?', a: 'Go straight. It is next to the library.', fn: 'station', rank: 1, grammar: ['gr-5-011'], phrases: ['ph-5-0094'] },
    { q: 'Where is the bank?', a: 'It is across from the church.', fn: 'bank', rank: 1, grammar: ['gr-5-021'] },
    { q: 'What time does the market open?', a: 'At eight in the morning.', fn: 'time', rank: 1, grammar: ['gr-5-021'] },
    { q: 'Is the hospital near here?', a: 'Yes, it is behind the school.', fn: 'hospital', rank: 1, grammar: ['gr-5-021'], phrases: ['ph-4-0036'] },
    { q: 'Where is the toilet?', a: 'On the first floor, next to the stairs.', fn: 'toilet', rank: 1, grammar: ['gr-5-013'] },
    { q: 'Where can I buy a ticket?', a: 'At the station, next to the bridge.', fn: 'ticket', rank: 1, grammar: ['gr-5-015'] },
    { q: 'Can I walk to the sea?', a: 'Yes, it is only five minutes on foot.', fn: 'far', rank: 2, grammar: ['gr-5-015'], phrases: ['ph-4-0144'] },
    { q: 'Can you tell me the way to the bank?', a: 'Go straight, and turn left at the market.', fn: 'way', rank: 2, grammar: ['gr-5-011'], phrases: ['ph-4-0037'] },
    { q: 'Which bus goes to the station?', a: 'The number five bus. It stops in front of the church.', fn: 'bus', rank: 2, phrases: ['ph-4-0035'] },
    { q: 'Is there a post office near here?', a: 'Yes, there is one next to the market.', fn: 'post', rank: 2, phrases: ['ph-4-0036'], grammar: ['gr-5-020'] },
  ],
  // days and times
  inn_day: [
    { q: 'When does the next ship leave?', a: 'It leaves on Friday at noon.', fn: 'ship', rank: 2, grammar: ['gr-5-021', 'gr-5-003'] },
    { q: 'How long can I stay?', a: 'You can stay for two weeks.', fn: 'long', rank: 2, grammar: ['gr-5-015', 'gr-3-021'] },
    { q: 'Is the desk open on Sunday?', a: 'Yes, we are open every day.', fn: 'open', rank: 2, grammar: ['gr-5-021'] },
    { q: 'What time can I check in?', a: 'You can check in after two.', fn: 'checkin', rank: 2, phrases: ['ph-3-0135'], grammar: ['gr-5-015'] },
    { q: 'When did the letter come?', a: 'It came this morning.', fn: 'letter', rank: 2, grammar: ['gr-5-018'] },
    { q: 'How long does the boat take?', a: 'It takes about an hour.', fn: 'boat', rank: 2, phrases: ['ph-4-0032'] },
    { q: 'Has my friend arrived yet?', a: 'Yes, he arrived an hour ago.', fn: 'arrived', rank: 2, grammar: ['gr-3-002', 'gr-3-021'] },
    { q: 'Will the ship be late tomorrow?', a: 'No, it will come on time.', fn: 'late', rank: 3, grammar: ['gr-4-002'], phrases: ['ph-3-0154'] },
  ],
  // money
  inn_money: [
    { q: 'How much is a double room?', a: 'It is sixty coins a night.', fn: 'double', rank: 2, grammar: ['gr-5-014'] },
    { q: 'Can I pay now?', a: 'Yes, you can pay at the desk.', fn: 'pay', rank: 2, grammar: ['gr-5-015'] },
    { q: 'That is too expensive.', a: 'I am sorry. A single room is cheaper.', fn: 'dear', rank: 2, grammar: ['gr-4-014'], phrases: ['ph-4-0041'] },
    { q: 'Do you have change for ten coins?', a: 'Yes, here is your change.', fn: 'change', rank: 2, phrases: ['ph-4-0044'] },
    { q: 'How much is breakfast?', a: 'It is five coins a day.', fn: 'breakfast', rank: 2, grammar: ['gr-5-014'] },
    { q: 'Is it free for children?', a: 'Yes, children under five stay free.', fn: 'children', rank: 2, grammar: ['gr-3-007'] },
    { q: 'Can I have a bill, please?', a: 'Of course. I will write it now.', fn: 'bill', rank: 2, phrases: ['ph-5-0061'] },
    { q: 'Could I have a receipt, please?', a: 'Of course. Here is your receipt.', fn: 'receipt', rank: 3, phrases: ['ph-pre2-0091'] },
  ],
  // calls (rank 3: heard only)
  inn_phone: [
    { q: 'Hello. Is that the {Harbour Inn|@}?', a: 'Yes, it is. How can I help you?', fn: 'hello', rank: 2, grammar: ['gr-5-002'], phrases: ['ph-pre2-0377'] },
    { q: 'Hello. I want to book a double room.', a: 'Of course. For which nights?', fn: 'booking', rank: 2, grammar: ['gr-5-025'] },
    { q: 'Can I speak to {Mr. Olsen|@}, please?', a: 'Just a moment, please.', fn: 'speak', rank: 2, phrases: ['ph-5-0105'] },
    { q: 'I want to change my room.', a: 'Of course. What is your name?', fn: 'change', rank: 2, grammar: ['gr-5-025'] },
    { q: 'Is {Mr. Cole|@} there?', a: 'No, he is out. Can I take a message?', fn: 'out', rank: 2, phrases: ['ph-4-0051'] },
    { q: 'My name is {Ruiz|@}. I have a room for Friday.', a: 'Yes, I have it here. A single room for two nights.', fn: 'found', rank: 2, grammar: ['gr-5-003'] },
    { q: 'Could you call me back, please?', a: 'Of course. What is your number?', fn: 'callback', rank: 3, phrases: ['ph-3-0137', 'ph-4-0005'] },
    { q: 'What time do you close the door at night?', a: 'At eleven, but you can ring the bell.', fn: 'close', rank: 3, grammar: ['gr-5-021', 'gr-4-002'] },
  ],
  // letters and emails
  inn_mail: [
    { q: 'Dear Sir, I would like to book a double room for the first week of June. Is there a room free?', a: 'Yes, we have a double room free in the first week of June.', fn: 'free', rank: 3, grammar: ['gr-4-007', 'gr-5-020'] },
    { q: 'Dear Sir, I booked a room for Friday, but I cannot come. Please cancel my reservation.', a: 'Your reservation has been cancelled. We hope to see you another time.', fn: 'cancel', rank: 3, grammar: ['gr-3-005'] },
    { q: 'Dear Sir, thank you for a lovely stay. We enjoyed the sea view very much.', a: 'Thank you for your kind words. We hope to see you again.', fn: 'thanks', rank: 3, phrases: ['ph-pre2-0113'] },
    { q: 'Dear Sir, could you send me a price list? I would like to know how much a double room costs.', a: 'Thank you for your letter. A double room is 60 coins a night.', fn: 'price', rank: 3, grammar: ['gr-3-010'] },
    { q: 'Dear Sir, I will arrive at night because my ship is late. Please keep my room.', a: 'We will keep your room for you. Please ring the bell when you arrive.', fn: 'late', rank: 3, grammar: ['gr-4-019', 'gr-3-019'] },
    { q: 'Dear Sir, I forgot my umbrella in room 22. Could you send it to me?', a: 'We have found your umbrella. We will send it to you by post.', fn: 'lost', rank: 3, grammar: ['gr-3-002'] },
    { q: 'Dear Sir, we will arrive on the morning ship. Is there a bus to your hotel?', a: 'There is no bus, but you can walk. It is only ten minutes from the harbour.', fn: 'bus', rank: 3, grammar: ['gr-5-020'] },
    { q: 'Dear Sir, my husband and I would like a quiet room. We are not young, so we do not like stairs.', a: 'We have a quiet room on the first floor, so you will not need the stairs.', fn: 'quiet', rank: 3, grammar: ['gr-4-019'] },
  ],
  // complaints and polite requests
  inn_talk: [
    { q: 'Would you mind closing the door?', a: 'Not at all.', fn: 'mind', rank: 3, grammar: ['gr-4-011'], phrases: ['ph-3-0006'] },
    { q: 'The room next door is very noisy.', a: 'I am sorry. I will talk to the guests.', fn: 'noise', rank: 3, phrases: ['ph-5-0019'] },
    { q: 'I have been waiting for my towels for an hour.', a: 'I am very sorry. I will bring them at once.', fn: 'wait', rank: 3, grammar: ['gr-3-004'] },
    { q: 'Excuse me, could you tell me where the toilet is?', a: 'It is at the end of the hall, next to the stairs.', fn: 'toilet', rank: 3, grammar: ['gr-3-010'] },
    { q: 'Is the man in room 22 still here?', a: 'No, he left this morning.', fn: 'still', rank: 3, grammar: ['gr-5-018'] },
    { q: 'I think there is a mistake in my bill.', a: 'I am sorry. Let me check it for you.', fn: 'bill', rank: 3, phrases: ['ph-2-0040'] },
    { q: 'I would like to speak to the manager.', a: 'Certainly. Please wait a moment.', fn: 'manager', rank: 3, phrases: ['ph-2-0138'] },
    { q: 'Thank you so much for your help. I really appreciate it.', a: 'It is my pleasure.', fn: 'thanks', rank: 3, phrases: ['ph-pre2-0114', 'ph-pre2-0116'] },
    { q: 'I am sorry to bother you, but the shower does not work.', a: 'Not at all. I will send someone to look at it.', fn: 'shower', rank: 3, phrases: ['ph-pre2-0109'] },
  ],
  // advice about the weather and the town
  inn_advice: [
    { q: 'What is the weather like in winter?', a: 'It is cold and windy, so please bring a warm coat.', fn: 'weather', rank: 3, grammar: ['gr-5-013'] },
    { q: 'Can you recommend a good place for dinner?', a: 'I recommend the {Harbour Kitchen|@}. The fish is very good.', fn: 'dinner', rank: 3, phrases: ['ph-pre2-0128'] },
    { q: 'What is there to see here?', a: 'You should visit the lighthouse and the old castle.', fn: 'see', rank: 3, grammar: ['gr-4-005'], phrases: ['ph-3-0019'] },
    { q: 'Do you think it will rain tomorrow?', a: 'I think so. You had better take an umbrella.', fn: 'rain', rank: 3, grammar: ['gr-4-020'], phrases: ['ph-3-0020'] },
    { q: 'How long does it take to walk to the lighthouse?', a: 'About forty minutes, so you should start early.', fn: 'walk', rank: 3, grammar: ['gr-4-005'] },
    { q: 'Which is better, the morning boat or the afternoon boat?', a: 'The morning boat is better, because the sea is calmer.', fn: 'boat', rank: 3, grammar: ['gr-4-017', 'gr-4-014'] },
    { q: 'My son is sick. Is there a doctor near here?', a: 'Yes, the hospital is across from the park.', fn: 'doctor', rank: 3, grammar: ['gr-5-020'] },
  ],
  // refusals with an alternative (rank 4)
  inn_refuse: [
    { q: 'Do you have a double room on Saturday?', a: 'I am afraid we are full on Saturday, but we have one on Sunday.', fn: 'full', rank: 4, phrases: ['ph-3-0010'], grammar: ['gr-pre2-061'] },
    { q: 'Could I have a late {check-out|in_checkout}?', a: 'I am afraid not, but you can leave your bag here until the evening.', fn: 'late', rank: 4, phrases: ['ph-pre2-0085'] },
    { q: 'I am sorry for the trouble, but I lost my key again.', a: 'That is no trouble. I will make a new key for you.', fn: 'trouble', rank: 4, grammar: ['gr-3-002'] },
    { q: 'Does my room face the sea?', a: 'Yes, all the rooms on the third floor face the sea.', fn: 'face', rank: 4, grammar: ['gr-5-020'] },
    { q: 'Could we have breakfast at five?', a: 'I am afraid the kitchen opens at seven, but I can prepare a breakfast box for you.', fn: 'early', rank: 4, grammar: ['gr-pre2-061'] },
    { q: 'Could you give me a discount?', a: 'I am afraid I cannot, but I can give you a free breakfast.', fn: 'discount', rank: 4, phrases: ['ph-3-0009'] },
    { q: 'May I have a room with a sea view?', a: 'All the sea side rooms are taken, but I can offer you a room on the garden side at a lower price.', fn: 'view', rank: 4, grammar: ['gr-pre2-061', 'gr-4-014'] },
    { q: 'Is there a table free tonight?', a: 'I am sorry, we are full tonight, but there is a table free tomorrow at six.', fn: 'table', rank: 4, grammar: ['gr-pre2-061'] },
    { q: 'Can I bring my dog?', a: 'Dogs are not allowed in the rooms, but it can stay in the garden.', fn: 'dog', rank: 4, grammar: ['gr-4-026'] },
    { q: 'I was wondering if I could pay next week.', a: 'I am sorry, but you must pay before you leave. You may, however, pay half now and half tomorrow.', fn: 'pay', rank: 4, phrases: ['ph-pre2-0111'] },
  ],
  // longer letters and emails (rank 4)
  inn_mail4: [
    { q: 'Dear Sir, my wife and I will visit your town in the spring. We would like a quiet room, and we would be grateful if you could tell us the price of a week.', a: 'Thank you for your letter. A quiet double room costs 60 coins a night, so a week is 420 coins.', fn: 'quote', rank: 4, grammar: ['gr-pre2-009', 'gr-3-010'], phrases: ['ph-2-0024'] },
    { q: 'Dear Sir, I am sorry to say that I must cancel my reservation, because my mother is ill. Could I have my money back?', a: 'We are sorry to hear that. We will send you a full refund, because you wrote more than a week before you were due to come.', fn: 'refund', rank: 4, grammar: ['gr-3-018', 'gr-pre2-034'], phrases: ['ph-3-0013'] },
    { q: 'Dear Sir, the room was lovely, but the music in the dining room was too loud. I could not sleep.', a: 'We are very sorry about the music. We will ask the musicians to play more quietly after nine.', fn: 'noise', rank: 4, grammar: ['gr-4-021'], phrases: ['ph-pre2-0036'] },
    { q: 'Dear Sir, our ferry has been cancelled because of the storm. Do you have two rooms for tonight? We will pay in advance.', a: 'Yes, we have two rooms, and you may pay when you leave. Please come as soon as you can.', fn: 'storm', rank: 4, grammar: ['gr-pre2-045', 'gr-3-005'] },
    { q: 'Dear Sir, I will arrive on Friday, unless the weather is bad. If I cannot come, I will write to you.', a: 'Thank you for telling us. We will hold your room until Friday evening.', fn: 'unless', rank: 4, grammar: ['gr-3-018'] },
    { q: 'Dear Sir, we will be on holiday in your town next month. Do you have a family room?', a: 'Yes, we have a family room with four beds. How many nights will you stay?', fn: 'family', rank: 4, grammar: ['gr-5-004'] },
    { q: 'Dear Sir, I have a question about the price of a room. Is there a special price in winter?', a: 'Yes. In winter a double room is 50 coins a night.', fn: 'winter', rank: 4, grammar: ['gr-3-018'] },
    { q: 'Dear Sir, I want to write about a small matter. My room was clean, but there was no soap in the bathroom.', a: 'We are sorry about that. We will look into the matter at once.', fn: 'soap', rank: 4, grammar: ['gr-pre2-009'] },
    { q: 'Dear Sir, could you tell me whether the dining room is free on Saturday evening? We want a dinner for twenty.', a: 'Yes, the dining room is free on Saturday evening, so we can have a dinner for twenty.', fn: 'dining', rank: 4, grammar: ['gr-3-032'] },
    { q: 'Dear Sir, I left a brown bag in room 12 when I left last week. My glasses are in the bag. Could you send them to my school?', a: 'We have found your bag. We will send it to your school today by post.', fn: 'bag', rank: 4, grammar: ['gr-pre2-001', 'gr-3-007'] },
    { q: 'Dear Sir, we are planning a small wedding party for twenty people. Is the dining room free on Saturday evening?', a: 'Congratulations! The dining room is free on Saturday evening, and we can serve twenty people.', fn: 'party', rank: 4, grammar: ['gr-3-032'], phrases: ['ph-4-0021'] },
  ],
  // the town's sights, matched to what the guest likes (rank 4)
  inn_town: [
    { q: 'We have only one day. We love the sea, but we do not like crowds. What do you recommend?', a: 'I recommend the lighthouse. It is quiet, and you can see the whole sea.', fn: 'sea', rank: 4, grammar: ['gr-pre2-047'] },
    { q: 'My mother cannot walk for long. Is there something she can see nearby?', a: 'The garden behind the kitchen is lovely, and it has many benches.', fn: 'mother', rank: 4, grammar: ['gr-3-007'] },
    { q: 'If it rains on Saturday, what do you suggest?', a: 'I suggest the museum. It is dry, and it is interesting, too.', fn: 'rain', rank: 4, grammar: ['gr-3-018', 'gr-2-043'] },
    { q: 'We love old buildings. Is there anything you would show a visitor?', a: 'I would show them the old castle. It is full of history.', fn: 'castle', rank: 4, grammar: ['gr-pre2-007'] },
    { q: 'I like to take photos. Where can I see the sunset?', a: 'From the end of the harbour wall. It is lovely after six.', fn: 'sunset', rank: 4, grammar: ['gr-4-009'] },
    { q: 'We have a small child. Is the beach safe for children?', a: 'Yes, but please keep an eye on the child when the sea is rough.', fn: 'child', rank: 4, grammar: ['gr-3-019'] },
    { q: 'We want a day trip. What do you suggest?', a: 'A boat trip to the lighthouse is lovely in the morning.', fn: 'trip', rank: 4, grammar: ['gr-4-009'] },
    { q: 'It will be windy tomorrow. Should we still take the boat to the lighthouse?', a: 'I would wait until Sunday, when the sea will be calmer.', fn: 'wind', rank: 4, grammar: ['gr-pre2-007', 'gr-4-002'] },
  ],
};

// ---------------------------------------------------------------------------- the job
const EN: JobContent = {
  sign: 'Harbour Inn',
  lexicon: LEXICON,
  pages: PAGES,
  forms: { is: ['be'], night: ['nights'], have: ['having'], ...EXTRA_FORMS },
  people: [
    { id: 'p_olsen', name: 'Mr. Olsen', avatar: '👨' },
    { id: 'c_merchant', name: '', avatar: '' },
    { id: 'c_sailor', name: '', avatar: '' },
    { id: 'c_grandma', name: '', avatar: '' },
    { id: 'c_boy', name: '', avatar: '' },
    { id: 'c_mom', name: '', avatar: '' },
    { id: 'c_cook', name: '', avatar: '' },
    { id: 'c_docker', name: '', avatar: '' },
    { id: 'c_scholar', name: '', avatar: '' },
    { id: 'c_student', name: '', avatar: '' },
    { id: 'c_girl', name: '', avatar: '' },
    { id: 'p_ruiz', name: 'Ms. Ruiz', avatar: '👩' },
    { id: 'p_lin', name: 'Mr. Lin', avatar: '👨' },
    { id: 'p_bell', name: 'Mr. Bell', avatar: '👨‍🦳' },
    { id: 'p_dunn', name: 'Mrs. Dunn', avatar: '👩‍🦳' },
    { id: 'p_novak', name: 'Ms. Novak', avatar: '👩' },
    { id: 'p_cole', name: 'Mr. Cole', avatar: '👨' },
  ],
  boss: 'p_olsen',
  things: [],
  sort: {
    item: 'parcel',
    bins: [
      { id: 'f1', label: 'First floor', ref: 'the first floor', art: 'inn' },
      { id: 'f2', label: 'Second floor', ref: 'the second floor', art: 'inn' },
      { id: 'f3', label: 'Third floor', ref: 'the third floor', art: 'inn' },
      { id: 'kitchen', label: 'Kitchen', ref: 'the kitchen', art: 'back' },
      { id: 'desk', label: 'Front desk', ref: 'the front desk', art: 'back' },
      { id: 'laundry', label: 'Laundry', ref: 'the laundry' },
      { id: 'lost', label: 'Lost box', ref: 'the lost box' },
      { id: 'store', label: 'Luggage room', ref: 'the luggage room' },
      { id: 'ferry', label: 'Ferry', ref: 'the ferry', art: 'abroad' },
      { id: 'post', label: 'Post office', ref: 'the post office' },
    ],
  },
  tasks: [...R1, ...R2, ...R3, ...R4],
  templates: TEMPLATES,
  qa: QA,
  reactions: [
    // perfect
    { id: 'ir_ok1', kind: 'perfect', text: 'Thank you very much!', face: 'delighted' },
    { id: 'ir_ok1b', kind: 'perfect', text: 'Lovely. Thank you!', face: 'delighted' },
    { id: 'ir_ok1c', kind: 'perfect', text: 'Good, good. That is just right.', face: 'happy' },
    { id: 'ir_ok2', kind: 'perfect', arch: 'check', text: 'Yes, that is right. Here is your key.', face: 'happy' },
    { id: 'ir_ok2b', kind: 'perfect', arch: 'check', text: 'Good! Everything is right in the book.', face: 'happy' },
    { id: 'ir_ok2c', kind: 'perfect', arch: 'check', text: 'Thank you. I am tired, and I want my bed!', face: 'delighted' },
    { id: 'ir_ok3', kind: 'perfect', arch: 'sort', text: 'Good job!', face: 'happy' },
    { id: 'ir_ok3b', kind: 'perfect', arch: 'sort', text: 'Every bag is in the right place. Thank you!', face: 'happy' },
    { id: 'ir_ok4', kind: 'perfect', arch: 'respond', text: 'Yes, that is it. Thank you!', face: 'happy' },
    { id: 'ir_ok4b', kind: 'perfect', arch: 'respond', text: 'Oh, good. You are very kind.', face: 'delighted' },
    { id: 'ir_ok5', kind: 'perfect', arch: 'respond', rank: 3, text: 'Thank you. You have been very helpful.', face: 'delighted' },
    { id: 'ir_ok6', kind: 'perfect', rank: 4, text: 'Excellent. I really appreciate your help.', face: 'delighted' },
    // small slips
    { id: 'ir_minor', kind: 'minor', text: 'Thank you. But please be fast next time.', face: 'neutral' },
    { id: 'ir_minor2', kind: 'minor', arch: 'sort', text: 'Good. But one bag is in the wrong place.', face: 'neutral' },
    { id: 'ir_fix', kind: 'wrong_fix', text: 'Yes, that one. But the new “{field}” is not right.', face: 'neutral' },
    // check
    { id: 'ir_missed', kind: 'missed', text: 'Wait, the book is wrong. Look at “{field}”.', face: 'angry' },
    { id: 'ir_missed2', kind: 'missed', text: 'Oh no! “{field}” is not right in the book.', face: 'angry' },
    { id: 'ir_alarm', kind: 'false_alarm', text: 'But the book is right!', face: 'puzzled' },
    { id: 'ir_alarm2', kind: 'false_alarm', text: 'Why? Everything is right in the book.', face: 'puzzled' },
    { id: 'ir_field', kind: 'wrong_field', text: 'No, that is right. Look at “{field}”.', face: 'puzzled' },
    { id: 'ir_field2', kind: 'wrong_field', text: 'Not that one. Look at “{field}”.', face: 'puzzled' },
    // respond
    { id: 'ir_reply', kind: 'wrong_reply', text: 'Sorry? That is not right.', face: 'puzzled' },
    { id: 'ir_reply2', kind: 'wrong_reply', text: 'No. That does not help me.', face: 'puzzled' },
    { id: 'ir_reply3', kind: 'wrong_reply', rank: 3, text: 'I am afraid you did not understand me.', face: 'sad' },
    { id: 'ir_slot', kind: 'wrong_slot', text: 'Oh, I do not want this room.', face: 'sad' },
    { id: 'ir_slot2', kind: 'wrong_slot', text: 'No, no. That is not what I asked for.', face: 'puzzled' },
    { id: 'ir_slot3', kind: 'wrong_slot', rank: 3, text: 'I am sorry, but that is not the room for me.', face: 'sad' },
    // sort
    { id: 'ir_bin', kind: 'wrong_bin', text: 'No. This one goes to “{bin}”.', face: 'puzzled' },
    { id: 'ir_bin2', kind: 'wrong_bin', text: 'Oh! That one goes to “{bin}”.', face: 'puzzled' },
    // anything else
    { id: 'ir_fail', kind: 'any_fail', text: 'Oh no. That is wrong.', face: 'sad' },
    { id: 'ir_fail2', kind: 'any_fail', text: 'Oh dear. I am not happy.', face: 'angry' },
  ],
  lines: [
    { id: 'il_s1', kind: 'start', text: 'Good evening! A lot of guests today.' },
    { id: 'il_s2', kind: 'start', text: 'Hello! The ships are in. The inn is busy today.' },
    { id: 'il_s3', kind: 'start', rank: 2, text: 'Good morning! The sea is calm, and the guests are coming.' },
    { id: 'il_s4', kind: 'start', rank: 3, text: 'The morning ship is late, so the letters and the guests come together today.' },
    { id: 'il_s5', kind: 'start', rank: 4, text: 'Good morning. The forecast is bad, so we will have a lot of work today.' },
    { id: 'il_e1', kind: 'end', text: 'Thank you. Good night!' },
    { id: 'il_e2', kind: 'end', text: 'Good work today. See you tomorrow!' },
    { id: 'il_e3', kind: 'end', rank: 3, text: 'The guests are happy, and the book is right. Thank you!' },
    { id: 'il_e4', kind: 'end', rank: 4, text: 'You worked well today. The inn is lucky to have you.' },
    { id: 'il_r2', kind: 'rankup', rank: 2, text: 'You know the desk well now. Next, the days and the prices.' },
    { id: 'il_r3', kind: 'rankup', rank: 3, text: 'Now the guests write letters, and some of them are angry!' },
    { id: 'il_r4', kind: 'rankup', rank: 4, text: 'You are very good at this. From now on, you answer the difficult letters.' },
  ],
};

export const INN_JOB: JobDef = {
  id: 'inn',
  nameJa: '宿の帳場',
  blurbJa: '港の宿の受付。着いた客の話や手紙を予約帳・請求書と照らし合わせ、客の質問や苦情に答え、希望に合う空き部屋や時間を選び、荷物・洗濯物・忘れ物を正しい場所へ運ぶ。宿泊・旅・建物の言葉と、日付・値段・天気・道案内。',
  icon: '🛎️',
  domains: ['hotel', 'travel', 'housing'],
  archetypes: ['check', 'respond', 'sort'],
  ranks: [
    { rank: 1, need: { good: 0, words: 0 }, level: { eiken: '4', toeic: null }, tasks: 4, noteJa: '名前・部屋・泊数・階を予約帳と見比べる。客の短い質問や頼みごとに答える。希望（海側・広さ・階）に合う空き部屋を選ぶ。荷物を階へ運ぶ。' },
    { rank: 2, need: { good: 12, words: 20 }, level: { eiken: '3', toeic: 400 }, unlocks: ['long'], tasks: 5, reward: { coins: 10 }, noteJa: '日付・時刻・値段を確かめる（泊数の数え方、請求書と料金表）。手紙の予約の確認。希望が2つになる。洗濯物の仕分け。伝言メモ。船の時間や天気の質問。' },
    { rank: 3, need: { good: 30, words: 50 }, level: { eiken: 'pre2', toeic: 500 }, unlocks: ['multiStep', 'audioOnly', 'timed'], tasks: 5, reward: { coins: 15 }, noteJa: '予約の変更・取り消し・苦情の手紙とメール。直すときは正しい内容も選ぶ。耳だけの電話。落とし物と荷物置き場。やさしい断り方と道案内。時間制限（選んだときだけ）。' },
    { rank: 4, need: { good: 60, words: 100 }, level: { eiken: '2', toeic: 600 }, tasks: 6, reward: { coins: 25 }, noteJa: '長い手紙とメール、取り消し規則と返金、請求書の間違い探し。満室の断りと代案、苦情への返事、天気や町の案内。条件つきの予約。' },
  ],
  wage: { perfect: 2, minor: 1, fail: 0, bad: 0 },
  opensAfter: 1,
  building: 'inn',
  links: { produce: [{ good: 'menus', perPerfect: 1 }], use: [{ good: 'bread', bonus: 1, line: 'And the bread for breakfast is here. Thank you!' }] },
  content: { en: EN },
  flavour: 'school',
};
