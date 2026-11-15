import type { VerificationPage } from '../../core/types';
import type { JobCommon } from '../../jobs/lexicon';
import type { JobLexEntry } from '../../jobs/types';

/**
 * Words several jobs share (English). In the job lexicon registry (src/jobs/lexicon.ts) a word is defined
 * once: in the job that teaches it, or here when more than one job uses it. Every job may use every word of
 * the registry and add surface forms to it (`forms`). The ids and 検証ページ ids are the ones the words had
 * in the job that first defined them (saved progress refers to them).
 *
 * Levels / TOEIC bands / domains come from data/english/vocab.json; a gloss is written where the card needs
 * a better one.
 */
const PAGES: VerificationPage[] = [
  { id: "jp_1pla1", labelJa: "場所と通りのことば（1）" },
  { id: "jk_r1e", labelJa: "台所の動き" },
  { id: "jk_r2a", labelJa: "数とルール" },
  { id: "jk_r2e", labelJa: "ふるまいの言葉" },
  { id: "jk_r2f", labelJa: "片づけと伝言" },
  { id: "jk_r2g", labelJa: "木箱の中身" },
  { id: "jk_r2o", labelJa: "つなぎと忙しさ" },
  { id: "jk_r3b", labelJa: "ふたつの否定" },
  { id: "jk_r3i", labelJa: "人をさす言葉" },
  { id: "jk_r3l", labelJa: "日と家族" },
  { id: "jk_r3r", labelJa: "書きものと予定" },
  { id: "jk_r4d", labelJa: "好みと条件" },
  { id: "jk_r4e", labelJa: "調理場の仕事（二）" },
  { id: "jk_r4i", labelJa: "仕事の動詞" },
  { id: "jk_r4l", labelJa: "会話の言葉" },
  { id: "jk_r4m", labelJa: "量とお金" },
  { id: "jk_r4x", labelJa: "話のつなぎ" },
  { id: "ji_ride1", labelJa: "乗り物" },
  { id: "ji_room2", labelJa: "部屋の中のもの" },
  { id: "ji_talk3", labelJa: "話しことば（3）" },
  { id: "ji_plan4", labelJa: "先の予定" },
  { id: "ji_say4", labelJa: "たずねる・伝える" },
  { id: "ji_hold4", labelJa: "申し出る" },
  { id: "jp_off_days1", labelJa: "週のはじめの曜日" },
  { id: "jp_off_phone", labelJa: "電話を受ける" },
  { id: "jp_off_mail", labelJa: "メールの決まり文句" },
  { id: "jp_off_work", labelJa: "事務所の返事" },
];

const WORDS: JobLexEntry[] = [
  // 場所と通りのことば（1） (from post)
  {id: "library",text: "library",pos: "noun",group: "jp_1pla1",gloss: "図書館",emoji: "📚"},
  {id: "park",text: "park",pos: "noun",group: "jp_1pla1",gloss: "公園",emoji: "🌳"},
  {id: "post_office",text: "post office",pos: "noun",group: "jp_1pla1",forms: ["post offices"],gloss: "郵便局"},
  // 台所の動き (from kitchen)
  {id: "put",text: "put",pos: "verb",group: "jk_r1e",forms: ["puts","putting"],gloss: "置く・入れる",emoji: "📥"},
  {id: "on",text: "on",pos: "prep",group: "jk_r1e",gloss: "〜の上に",emoji: "🔛"},
  {id: "read",text: "read",pos: "verb",group: "jk_r1e",forms: ["reads"],gloss: "読む",emoji: "📖"},
  {id: "place",text: "place",pos: "noun",group: "jk_r1e",forms: ["places"],gloss: "場所",emoji: "📍"},
  // 数とルール (from kitchen)
  {id: "many",text: "many",pos: "det",group: "jk_r2a",gloss: "たくさんの",emoji: "🔢"},
  {id: "few",text: "few",pos: "det",group: "jk_r2a",gloss: "少しの",emoji: "🤏"},
  {id: "both",text: "both",pos: "det",group: "jk_r2a",gloss: "両方の",emoji: "✌️"},
  {id: "must",text: "must",pos: "verb",group: "jk_r2a",gloss: "〜しなければ",emoji: "❗"},
  // ふるまいの言葉 (from kitchen)
  {id: "stop",text: "stop",pos: "verb",group: "jk_r2e",forms: ["stops","stopped"],gloss: "止まる・やめる",emoji: "🛑"},
  {id: "exactly",text: "exactly",pos: "adv",group: "jk_r2e",gloss: "ちょうど・まさに",emoji: "🎯"},
  {id: "well",text: "well",pos: "adv",group: "jk_r2e",gloss: "よく・ええと",emoji: "👍"},
  {id: "allow",text: "allow",pos: "verb",group: "jk_r2e",forms: ["allows","allowed"],gloss: "許す",emoji: "✅"},
  // 片づけと伝言 (from kitchen)
  {id: "clean",text: "clean",pos: "adj",group: "jk_r2f",gloss: "きれいな・掃除する",emoji: "🧼"},
  {id: "tell",text: "tell",pos: "verb",group: "jk_r2f",forms: ["tells","told"],gloss: "伝える",emoji: "🗣️"},
  {id: "everything",text: "everything",pos: "pron",group: "jk_r2f",gloss: "すべてのもの",emoji: "🌐"},
  {id: "ask",text: "ask",pos: "verb",group: "jk_r2f",forms: ["asks","asked"],gloss: "たのむ・たずねる",emoji: "❓"},
  // 木箱の中身 (from kitchen)
  {id: "thing",text: "thing",pos: "noun",group: "jk_r2g",forms: ["things"],gloss: "もの",emoji: "📦"},
  {id: "name",text: "name",pos: "noun",group: "jk_r2g",gloss: "名前",emoji: "📛"},
  {id: "people",text: "people",pos: "noun",group: "jk_r2g",gloss: "人びと",emoji: "👥"},
  // つなぎと忙しさ (from kitchen)
  {id: "as",text: "as",pos: "conj",group: "jk_r2o",gloss: "〜と同じくらい・〜として",emoji: "🟰"},
  {id: "busy",text: "busy",pos: "adj",group: "jk_r2o",gloss: "忙しい",emoji: "⏰"},
  {id: "delivery",text: "delivery",pos: "noun",group: "jk_r2o",forms: ["deliveries"],gloss: "配達・仕入れ",emoji: "🚚"},
  // ふたつの否定 (from kitchen)
  {id: "neither",text: "neither",pos: "det",group: "jk_r3b",gloss: "どちらも〜ない",emoji: "🙅"},
  {id: "nor",text: "nor",pos: "conj",group: "jk_r3b",gloss: "〜も…ない",emoji: "➖"},
  {id: "almost",text: "almost",pos: "adv",group: "jk_r3b",gloss: "ほとんど",emoji: "🤏"},
  {id: "slowly",text: "slowly",pos: "adv",group: "jk_r3b",gloss: "ゆっくり",emoji: "🐢"},
  // 人をさす言葉 (from kitchen)
  {id: "him",text: "him",pos: "pron",group: "jk_r3i",gloss: "彼を・彼に",emoji: "👉"},
  {id: "they",text: "they",pos: "pron",group: "jk_r3i",forms: ["them","their"],gloss: "彼ら・それら",emoji: "👥"},
  {id: "us",text: "us",pos: "pron",group: "jk_r3i",gloss: "私たちを",emoji: "🫂"},
  {id: "our",text: "our",pos: "det",group: "jk_r3i",gloss: "私たちの",emoji: "🏠"},
  // 日と家族 (from kitchen)
  {id: "sunday",text: "Sunday",pos: "noun",group: "jk_r3l",forms: ["Sundays"],gloss: "日曜日",emoji: "🗓️"},
  {id: "son",text: "son",pos: "noun",group: "jk_r3l",gloss: "息子",emoji: "👦"},
  {id: "safe",text: "safe",pos: "adj",group: "jk_r3l",gloss: "安全な",emoji: "🛡️"},
  // 書きものと予定 (from kitchen)
  {id: "will",text: "will",pos: "verb",group: "jk_r3r",gloss: "〜するつもりだ",emoji: "🔮"},
  {id: "write",text: "write",pos: "verb",group: "jk_r3r",forms: ["writes","wrote","writing","written"],gloss: "書く",emoji: "✍️"},
  {id: "note",text: "note",pos: "noun",group: "jk_r3r",forms: ["notes"],gloss: "メモ・注意書き",emoji: "📝"},
  {id: "office",text: "office",pos: "noun",group: "jk_r3r",gloss: "事務所・役場",emoji: "🏛️"},
  // 好みと条件 (from kitchen)
  {id: "prefer",text: "prefer",pos: "verb",group: "jk_r4d",forms: ["prefers","preferred"],gloss: "〜の方を好む",emoji: "❤️"},
  {id: "rather",text: "rather",pos: "adv",group: "jk_r4d",gloss: "むしろ",emoji: "🤔"},
  {id: "unless",text: "unless",pos: "conj",group: "jk_r4d",gloss: "〜でない限り",emoji: "🚧"},
  {id: "provided",text: "provided",pos: "conj",group: "jk_r4d",gloss: "〜という条件で",emoji: "📜"},
  // 調理場の仕事（二） (from kitchen)
  {id: "serve",text: "serve",pos: "verb",group: "jk_r4e",forms: ["serves","served"],gloss: "出す",emoji: "🍽️"},
  {id: "sort",text: "sort",pos: "verb",group: "jk_r4e",forms: ["sorts","sorted"],gloss: "分ける",emoji: "🗂️"},
  {id: "cut",text: "cut",pos: "verb",group: "jk_r4e",forms: ["cuts","cutting"],gloss: "切る",emoji: "✂️"},
  {id: "carry",text: "carry",pos: "verb",group: "jk_r4e",forms: ["carries","carried"],gloss: "運ぶ",emoji: "🧺"},
  // 仕事の動詞 (from kitchen)
  {id: "use",text: "use",pos: "verb",group: "jk_r4i",forms: ["uses","used","using"],gloss: "使う",emoji: "🔧"},
  {id: "show",text: "show",pos: "verb",group: "jk_r4i",forms: ["shows","showed"],gloss: "見せる",emoji: "👉"},
  {id: "check",text: "check",pos: "verb",group: "jk_r4i",forms: ["checks","checked"],gloss: "確かめる",emoji: "☑️"},
  // 会話の言葉 (from kitchen)
  {id: "young",text: "young",pos: "adj",group: "jk_r4l",gloss: "若い",emoji: "🧒"},
  {id: "done",text: "done",pos: "adj",group: "jk_r4l",gloss: "終わった",emoji: "✅"},
  {id: "way",text: "way",pos: "noun",group: "jk_r4l",gloss: "やり方",emoji: "🛤️"},
  // 量とお金 (from kitchen)
  {id: "all",text: "all",pos: "det",group: "jk_r4m",gloss: "すべての",emoji: "💯"},
  {id: "high",text: "high",pos: "adj",group: "jk_r4m",forms: ["higher"],gloss: "高い",emoji: "📈"},
  {id: "pay",text: "pay",pos: "verb",group: "jk_r4m",forms: ["pays","paid"],gloss: "払う",emoji: "💰"},
  // 話のつなぎ (from kitchen)
  {id: "about",text: "about",pos: "prep",group: "jk_r4x",gloss: "〜について",emoji: "💬"},
  {id: "into",text: "into",pos: "prep",group: "jk_r4x",gloss: "〜の中へ",emoji: "⤵️"},
  {id: "simple",text: "simple",pos: "adj",group: "jk_r4x",gloss: "簡単な",emoji: "🔹"},
  {id: "bill",text: "bill",pos: "noun",group: "jk_r4x",forms: ["bills"],gloss: "勘定書き",emoji: "🧾"},
  // 乗り物 (from inn)
  {id: "in_bus",text: "bus",pos: "noun",group: "ji_ride1",forms: ["buses"],gloss: "バス",emoji: "🚌"},
  {id: "in_train",text: "train",pos: "noun",group: "ji_ride1",forms: ["trains"],gloss: "列車",emoji: "🚆"},
  {id: "in_taxi",text: "taxi",pos: "noun",group: "ji_ride1",forms: ["taxis"],gloss: "タクシー",emoji: "🚕"},
  // 部屋の中のもの (from inn)
  {id: "in_lamp",text: "lamp",pos: "noun",group: "ji_room2",forms: ["lamps"],gloss: "ランプ・明かり",emoji: "🪔"},
  {id: "in_clock",text: "clock",pos: "noun",group: "ji_room2",forms: ["clocks"],gloss: "時計",emoji: "🕰️"},
  {id: "in_phone",text: "phone",pos: "noun",group: "ji_room2",forms: ["phones"],gloss: "電話",emoji: "📞"},
  // 話しことば（3） (from inn)
  {id: "in_talk",text: "talk",pos: "verb",group: "ji_talk3",forms: ["talks","talked","talking"],gloss: "話す",emoji: "💬"},
  {id: "in_end",text: "end",pos: "noun",group: "ji_talk3",forms: ["ends"],gloss: "終わり・はし",emoji: "🔚"},
  {id: "in_noisy",text: "noisy",pos: "adj",group: "ji_talk3",gloss: "うるさい",emoji: "🔉"},
  // 先の予定 (from inn)
  {id: "in_live",text: "live",pos: "verb",group: "ji_plan4",forms: ["lives","lived","living"],gloss: "住む",emoji: "🏠"},
  {id: "in_month",text: "month",pos: "noun",group: "ji_plan4",forms: ["months"],gloss: "月（つき）",emoji: "🈷️"},
  {id: "in_plan",text: "plan",pos: "verb",group: "ji_plan4",forms: ["plans","planned","planning"],gloss: "計画・予定する",emoji: "🗓️"},
  // たずねる・伝える (from inn)
  {id: "in_someone",text: "someone",pos: "pron",group: "ji_say4",gloss: "だれか",emoji: "🧑"},
  {id: "in_hear",text: "hear",pos: "verb",group: "ji_say4",forms: ["hears","heard","hearing"],gloss: "聞こえる・聞く",emoji: "👂"},
  {id: "in_tell",text: "telling",pos: "verb",group: "ji_say4",gloss: "伝える・言う（tell の変化形）",emoji: "🗣️",eiken: "5",cefr: "A1"},
  // 申し出る (from inn)
  {id: "in_hold",text: "hold",pos: "verb",group: "ji_hold4",forms: ["holds","held","holding"],gloss: "開く・持つ",emoji: "✋"},
  {id: "in_fix",text: "fix",pos: "verb",group: "ji_hold4",forms: ["fixes","fixed","fixing"],gloss: "直す",emoji: "🔧"},
  {id: "in_suggest",text: "suggest",pos: "verb",group: "ji_hold4",forms: ["suggests","suggested"],gloss: "提案する",emoji: "💡"},
  // 週のはじめの曜日 (from office)
  {id: "monday",text: "Monday",pos: "noun",group: "jp_off_days1",gloss: "月曜日",emoji: "🗓️",eiken: "5",cefr: "A1"},
  {id: "tuesday",text: "Tuesday",pos: "noun",group: "jp_off_days1",gloss: "火曜日",emoji: "🗓️",eiken: "5",cefr: "A1"},
  {id: "wednesday",text: "Wednesday",pos: "noun",group: "jp_off_days1",gloss: "水曜日",emoji: "🗓️",eiken: "5",cefr: "A1"},
  // 電話を受ける (from office)
  {id: "call",text: "call",pos: "verb",group: "jp_off_phone",forms: ["calls","called","calling"],gloss: "電話（する）",emoji: "📞",eiken: "4",cefr: "A1"},
  {id: "message",text: "message",pos: "noun",group: "jp_off_phone",forms: ["messages"],gloss: "伝言",emoji: "💬",eiken: "4",cefr: "A1"},
  {id: "speak",text: "speak",pos: "verb",group: "jp_off_phone",forms: ["speaks","spoke"],gloss: "話す",emoji: "🗨️",eiken: "5",cefr: "A1"},
  {id: "moment",text: "moment",pos: "noun",group: "jp_off_phone",gloss: "ちょっとの間",emoji: "⏱️",eiken: "5",cefr: "A1"},
  {id: "caller",text: "caller",pos: "noun",group: "jp_off_phone",forms: ["callers"],gloss: "電話をかけてきた人",emoji: "☎️",eiken: "準1",cefr: "B2"},
  // メールの決まり文句 (from office)
  {id: "email",text: "email",pos: "noun",group: "jp_off_mail",forms: ["emails"],gloss: "メール",emoji: "📧",eiken: "4",cefr: "A1"},
  {id: "dear",text: "dear",pos: "adj",group: "jp_off_mail",gloss: "（手紙で）〜様",emoji: "✉️",eiken: "4",cefr: "A1"},
  {id: "get",text: "get",pos: "verb",group: "jp_off_mail",forms: ["gets","got","getting"],gloss: "受け取る・手に入れる",emoji: "📥",eiken: "5",cefr: "A1"},
  // 事務所の返事 (from office)
  {id: "change_v",text: "change",pos: "verb",group: "jp_off_work",forms: ["changes","changed"],gloss: "変える",emoji: "🔁",eiken: "4",cefr: "A1"},
  {id: "fine",text: "fine",pos: "adj",group: "jp_off_work",gloss: "大丈夫な・結構な",emoji: "👍",eiken: "4",cefr: "A1"},
  {id: "desk",text: "desk",pos: "noun",group: "jp_off_work",forms: ["desks"],gloss: "机",emoji: "🗄️",eiken: "5",cefr: "A1"},
];

// ---------------------------------------------------------------------------------------------- the newspaper's and the clinic's shared words
// Words both the newspaper office and the clinic reception use (compact table: `text|pos|forms|gloss|emoji|id`; a line
// `# pageId | 見出し` opens a 検証ページ). Levels, TOEIC bands and domains come from data/english/vocab.json.

const POS: Record<string, JobLexEntry['pos']> = { n: 'noun', v: 'verb', a: 'adj', d: 'adv', p: 'prep', c: 'conj', r: 'pron', t: 'det', i: 'interj', x: 'phrase' };

function lex(src: string): { entries: JobLexEntry[]; pages: VerificationPage[] } {
  const entries: JobLexEntry[] = [];
  const pages: VerificationPage[] = [];
  let group = '';
  for (const raw of src.split('\n')) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('#')) {
      const [id, labelJa] = line.slice(1).split('|').map((x) => x.trim());
      pages.push({ id, labelJa });
      group = id;
      continue;
    }
    const [text, pos, forms, gloss, emoji, id] = line.split('|').map((x) => x.trim());
    entries.push({
      id: id || text.toLowerCase().replace(/ /g, '_').replace(/[^a-z_]/g, ''),
      text,
      pos: POS[pos] ?? 'noun',
      group,
      ...(forms ? { forms: forms.split(',').map((x) => x.trim()) } : {}),
      ...(gloss ? { gloss } : {}),
      ...(emoji ? { emoji } : {}),
    });
  }
  return { entries, pages };
}

// BEGIN generated (newspaper + clinic shared words)
const NC_SRC = `
# jx1_01 | 仕事のことば 1（3級）
clinic|n|clinic's,clinics|診療所
race|n|races,racing|競走
age|n||年齢
nurse|n|nurses,nursing|看護師
exact|a||正確な
# jx1_02 | 仕事のことば 2（3級）
game|n|games|試合・ゲーム
pharmacy|n|pharmacies|薬局
accident|n||事故
arm|n|arms|腕
# jx2_01 | 仕事のことば 1（準2級）
spot|n|spots,spotted|場所
temperature|n||温度
heart|n||心臓
pain|n|pains|痛み
# jx2_02 | 仕事のことば 2（準2級）
down|d||下へ
correction|n|corrections|訂正
print|v|printed,printing,prints|印刷する・掲載する
road|n|roads|道路
# jx2_03 | 仕事のことば 3（準2級）
hit|v|hits|襲う・打つ
climb|v||登る
drop|v|drops|取り下げる・落とす
branch|n|branches|支店・枝
# jx2_04 | 仕事のことば 4（準2級）
appear|v|appeared|現れる・出廷する
fit|a|fits,fitted|ぴったりの
seat|n||議席・席
space|n||余白・スペース・空間
# jx3_01 | 仕事のことば 1（2級）
repair|n|repaired,repairing,repairs|修理
disagree|v|disagrees|意見が合わない
test|n|tested,tests|テスト
court|n|court's,courts|裁判所
# jx3_02 | 仕事のことば 2（2級）
trial|n||裁判
detail|n|details|詳細
insurer|n|insurer's|保険会社
press|n|pressed,presses|報道機関・新聞
# jx3_03 | 仕事のことば 3（2級）
main|a||主な
middle|a||真ん中の
sun|n||太陽
sentence|n|sentenced|文・判決
# jx3_04 | 仕事のことば 4（2級）
flu|n||インフルエンザ
vaccination|n|vaccinations|予防接種
raise|v|raised,raises|上げる
treatment|n||治療
# jx3_05 | 仕事のことば 5（2級）
ward|n|wards|病棟
fact|n|facts|事実
lift|n|lifted,lifting,lifts|エレベーター（英）
specialist|n|specialist's|専門家
# jx3_06 | 仕事のことば 6（2級）
vaccine|n||ワクチン
university|n||大学
witness|n|witnesses|目撃者
laboratory|n||実験室
# jx3_07 | 仕事のことば 7（2級）
arrest|v|arrested|逮捕する
sum|n|sums|金額・合計
correctly|d||正しく
lawyer|n|lawyers,lawyers'|弁護士
# jx3_08 | 仕事のことば 8（2級）
health|n||健康
opinion|n||意見
believe|v||信じる
choose|v|chose,chosen|選ぶ
# jx3_09 | 仕事のことば 9（2級）
researcher|n|researchers|研究者
drive|v|drives,driving,drove|運転する
january|n||1月
measles|n||はしか
# jx3_10 | 仕事のことば 10（2級）
aid|n||援助
criticize|v|criticized,criticizes|批判する
dangerous|a||危険な
deny|v|denied,denies,denying|否定する
# jx3_11 | 仕事のことば 11（2級）
describe|v|described,describes|説明する
far|d|fares|遠くに
ignore|v|ignored,ignores|無視する
image|n|images|イメージ
# jx3_12 | 仕事のことば 12（2級）
jump|v|jumps|跳ぶ
measure|n|measured,measures|対策・寸法
share|n|shared,shares,sharing|株・分担・分け合う
signature|n|signatures|署名
# jx3_13 | 仕事のことば 13（2級）
surgery|n||手術
suspect|n|suspected,suspects|容疑者・疑う
warn|v|warned,warns|警告する
mark|v|marked,marks|印をつける・印
# jx3_14 | 仕事のことば 14（2級）
antibiotic|a|antibiotics|抗生物質の
battery|n|batteries|電池
coverage|n||保険の補償範囲・報道
version|n||版
# jx3_15 | 仕事のことば 15（2級）
lens|n|lenses|レンズ
car|n|carer,cars|車
fair|a||公平な
able|a||～できる
# jx3_16 | 仕事のことば 16（2級）
suggestion|n||提案
surprised|a||驚いた
delighted|a||うれしい
pass|v|passed,passes|渡す・伝える・定期券
# jx3_17 | 仕事のことば 17（2級）
unacceptable|a||受け入れられない
section|n||欄・部分
pad|n||メモ帳
slot|n||（予約や紙面の）枠
# jx3_18 | 仕事のことば 18（2級）
point|n|pointing,points|点
borrow|v|borrowed,borrowing,borrows|借りる
block|v|blocked|阻止する・ふさぐ・1区画
part|n|parts|部分・役割
# jx4_01 | 仕事のことば 1（準1級）
person|n|person's|人
disease|n||病気
publish|v|published,publishing|出版する
fear|n|fears|恐れ
# jx4_02 | 仕事のことば 2（準1級）
avoid|v|avoided|避ける
birth|n|births|誕生
grandfather|n||祖父
join|v|joined,joins|参加する
# jx4_03 | 仕事のことば 3（準1級）
step|n|steps|階段・次の手順
protest|v||抗議する
support|v|supported|支持する
evidence|n||証拠
# jx4_04 | 仕事のことば 4（準1級）
attack|v|attacked,attacks|攻撃する
care|n||注意・世話
error|n||誤り
clearly|d||はっきりと
# jx4_05 | 仕事のことば 5（準1級）
illness|n||病気
pressure|n||圧力
refuse|v|refused,refuses,refusing|断る
service|n|services|サービス・接客
# jx4_06 | 仕事のことば 6（準1級）
coastal|a||沿岸の
criticism|n||批評
demand|v|demands,demanded|要求する
flight|n|flights|飛行
# jx4_07 | 仕事のことば 7（準1級）
injury|n|injuries|けが
life|n||生活
outbreak|n||発生
pilot|n||パイロット
# jx4_08 | 仕事のことば 8（準1級）
power|n|powers|力
restrict|v|restricts,restricted|制限する
allege|v|alleged,alleges|主張する
deal|n|deals|取引
# jx4_09 | 仕事のことば 9（準1級）
diabetes|n||糖尿病
emergency|n|emergencies|緊急事態
mental|a||精神の
operation|n||手術
# jx4_10 | 仕事のことば 10（準1級）
save|v|saved|救う
smoking|n||喫煙
state|n|states|状態・述べる
surgeon|n|surgeons|外科医
# jx4_11 | 仕事のことば 11（準1級）
such|t||そのような
bear|v|born|産む（bornは「生まれた」）
die|v|died,dies|死ぬ
collapse|v|collapsed,collapses|倒れる・崩壊する
# jx4_12 | 仕事のことば 12（準1級）
income|n||収入
lack|n|lacks|不足
dispute|n|disputes|論争
pending|a||未決の
# jx4_13 | 仕事のことば 13（準1級）
bleach|n|bleaching|漂白剤
conference|n||会議
document|n|documents|文書
object|v|objected|反対する
# jx4_14 | 仕事のことば 14（準1級）
objection|n|objections|反対
represent|v||代表する
session|n|sessions|会議・（面談の）時間
immediate|a||即座の
# jx4_15 | 仕事のことば 15（準1級）
permission|n||許可
thank|v|thanking|感謝する
insist|v|insisted,insists|強く主張する
incorrect|a|incorrectly|間違った
# jx4_16 | 仕事のことば 16（準1級）
certain|a||確かな
reason|n|reasons|理由
collector|n||取り立て人・収集家
ambulance|n|ambulances|救急車
# jx4_17 | 仕事のことば 17（準1級）
wrongly|d||間違って
future|n||未来
unfair|a||不公平な
closely|d||綿密に
# jx4_18 | 仕事のことば 18（準1級）
condition|n|conditions|状態
conflict|n|conflicts|衝突
unavailable|a||利用できない
outside|d||外で・外の
# jx5_01 | 仕事のことば 1（1級）
apology|n||謝罪
false|a|falsely|間違った
appeal|n|appealed,appeals|控訴・訴え
suspend|v|suspended|猶予する・一時停止する
# jx5_02 | 仕事のことば 2（1級）
debt|n|debts|借金
transcript|n||文字起こし・写し
regulator|n|regulators|規制当局
oblige|v|obliged|感謝する・義務づける
# jx5_03 | 仕事のことば 3（1級）
reopen|v|reopened,reopening|再開する
faithful|a||忠実な
act|v|acted,acts|行動する
anyone|r||だれか・だれでも
# jx5_04 | 仕事のことば 4（1級）
confidence|n||自信
decline|n|declined,declining|衰退
release|n|released|発表・公開
retain|v|retains|保持する
# jx5_05 | 仕事のことば 5（1級）
scheme|n||制度・計画
admit|v|admits,admitted|認める
chronic|a||慢性の
credit|n|credited|信用
# jx5_06 | 仕事のことば 6（1級）
lie|v|lies,lying|ある・横たわる
privacy|n||プライバシー
restore|v|restored|修復する
therapy|n||治療
# jx5_07 | 仕事のことば 7（1級）
treat|v|treated|扱う・治療する
intend|v|intends|～するつもりである
base|v|based|基づかせる
though|c||～だけれども
# jx5_08 | 仕事のことば 8（1級）
anonymous|a||匿名の
remain|v||残る
tender|n||入札
withdrawal|n||撤回・撤退
# jx5_09 | 仕事のことば 9（1級）
disagreement|n||意見の相違
justify|v|justified|正当化する
invitation|n||招待
minor|n|minors'|未成年者
# jx5_10 | 仕事のことば 10（1級）
grant|n|granted,grants|補助金
distress|n||苦痛
harsh|a||厳しい
attribute|v|attributed|(～のものと)みなす
# jx5_11 | 仕事のことば 11（1級）
deeply|d||深く
insensitive|a||鈍感な
affect|v|affected|影響する
contradict|v|contradicts|矛盾する
# jx5_12 | 仕事のことば 12（1級）
consistent|a||一貫した
unnecessary|a||不必要な
locate|v|located|位置を突き止める
placement|n||配置
# jx1_03 | 仕事のことば 3（3級）
page|n|pages|ページ
story|n|stories|記事・物語
fire|n||火事・火
editor|n|editor's,editors|編集者
# jx1_04 | 仕事のことば 4（3級）
river|n||川
festival|n|festival's|祭り
lot|n||たくさん
# jx2_05 | 仕事のことば 5（準2級）
success|n||成功
concert|n||コンサート
mayor|n|mayor's|市長
business|n||経済・商売
build|v|builds,built|建てる
# jx2_06 | 仕事のことば 6（準2級）
million|n||100万
reader|n|readers|読者
film|n||映画
winner|n||勝者
# jx2_07 | 仕事のことば 7（準2級）
factory|n||工場
world|n||世界
art|n|arts|芸術
artist|n|artists|芸術家
# jx2_08 | 仕事のことば 8（準2級）
coast|n||海岸
president|n||大統領
corner|n||角
mend|v|mended|直す
# jx2_09 | 仕事のことば 9（準2級）
stadium|n||競技場
council|n|council's|議会・市議会
owe|v|owed,owes|借りている・支払う義務がある
student|n|students|学生
# jx3_19 | 仕事のことば 19（2級）
exhibition|n||展覧会
true|a||本当の
worker|n|workers|労働者
bakery|n||パン屋
# jx3_20 | 仕事のことば 20（2級）
official|a|officials|公式の
unemployment|n||失業
bird|n|birds|鳥
science|n||科学
# jx3_21 | 仕事のことば 21（2級）
critic|n|critics|評論家
poor|a|poorer|下手な・貧しい
printer|n||印刷所・プリンター
accuse|v|accused,accuses|告発する
# jx3_22 | 仕事のことば 22（2級）
photograph|n|photographed,photographs|写真
source|n|sources|情報源
government|n|government's|政府
smoke|v||たばこを吸う・煙
# jx3_23 | 仕事のことば 23（2級）
teach|v|taught,teaches|教える
score|n|scored|得点
politics|n||政治
environment|n||環境
# jx3_24 | 仕事のことば 24（2級）
argue|v|argues|議論する
bay|n||湾
capital|n||首都
energy|n||エネルギー
# jx3_25 | 仕事のことば 25（2級）
engine|n||エンジン
experiment|n||実験
famous|a||有名な
flood|n|flooded,floods|洪水
# jx3_26 | 仕事のことば 26（2級）
forest|n|forests|森
grow|v|grew,grows,grown|増える・育つ
loan|n|loans|貸付
novel|n|novels|小説
# jx3_27 | 仕事のことば 27（2級）
protect|v|protected,protects|守る
robot|n||ロボット
roof|n|roofs|屋根
solar|a||太陽の
# jx3_28 | 仕事のことば 28（2級）
theory|n||理論
throw|v|thrown|投げる・捨てる
waste|n||廃棄物・むだ
wire|n|wires|通信社の配信・針金
# jx3_29 | 仕事のことば 29（2級）
writer|n|writer's|作家
area|n|areas|地域
catch|n|caught|捕まえること
engineer|n|engineers|技術者
# jx3_30 | 仕事のことば 30（2級）
enter|v|enters|入る
fisherman|n|fishermen|漁師
fossil|n|fossils|化石
fund|n|funding,funds|資金
# jx3_31 | 仕事のことば 31（2級）
homeless|a||ホームレスの
level|n|levels|水準
petition|n|petitions|請願書
poll|n|polls,polling|世論調査
# jx3_32 | 仕事のことば 32（2級）
pollution|n||汚染
professor|n|professors|教授
recycling|n||リサイクル
search|n||捜索・探すこと・検索
# jx3_33 | 仕事のことば 33（2級）
shore|n||岸
speed|n||速度
star|n|stars|星
tide|n|tides|潮
# jx3_34 | 仕事のことば 34（2級）
tree|n|trees|木
series|n||連続
mention|n|mentioned,mentions|言及
land|n||土地
# jx3_35 | 仕事のことば 35（2級）
lease|v||賃貸する・賃貸借契約
scan|n|scanned,scans,scanning|検査・スキャン
lecture|n|lectures|講義
leaflet|n||ちらし
# jx3_36 | 仕事のことば 36（2級）
properly|d||適切に
burn|n|burned,burns,burning|やけど
deep|d|deeper|深く
quay|n||波止場・岸壁
# jx3_37 | 仕事のことば 37（2級）
spare|a||予備の
voice|n|voices|声
exercise|v|exercises|運動する
wide|a|wider|幅の広い
# jx4_19 | 仕事のことば 19（準1級）
verdict|n||評決
ban|v|banned|禁止する
graph|n|graphs|グラフ
secret|n||秘密
rare|a||まれな
# jx4_20 | 仕事のことば 20（準1級）
average|a||平均的な
edition|n||版
drought|n||干ばつ
campaign|n||運動
# jx4_21 | 仕事のことば 21（準1級）
opposition|n||反対
margin|n||誤差の幅・差
voter|n|voters|投票者
conclusion|n|conclusions|結論
# jx4_22 | 仕事のことば 22（準1級）
resident|n|residents|住民
dock|n|docks|埠頭
local|a||地元の
baker|n||パン屋
# jx4_23 | 仕事のことば 23（準1級）
industry|n|industries|産業
investigate|v|investigates,investigated|調査する
moon|n|moons|月
mountain|n|mountains|山
# jx4_24 | 仕事のことば 24（準1級）
orchestra|n|orchestra's|オーケストラ
painter|n|painters|画家
planet|n|planets|惑星
qualify|v|qualifies|資格を得る
# jx4_25 | 仕事のことば 25（準1級）
resign|v|resigned,resigns|辞職する
species|n||種
village|n|villages|村
zone|n||地域
# jx4_26 | 仕事のことば 26（準1級）
closure|n||閉鎖
diary|n|diaries|日記
election|n|elections|選挙
brain|n||脳
# jx4_27 | 仕事のことば 27（準1級）
community|n||地域社会
delegate|n|delegates,delegated|代表者
detect|v|detects|検出する
duty|n||義務
# jx4_28 | 仕事のことば 28（準1級）
emission|n|emissions|排出
genetic|a||遺伝の
guard|n||警備員
household|n|households|世帯
# jx4_29 | 仕事のことば 29（準1級）
memory|n||記憶
nature|n||自然
origin|n||起源
path|n||小道・進路
# jx4_30 | 仕事のことば 30（準1級）
reform|n|reforming|改革
region|n||地域
satellite|n||衛星
store|n|stores,storing|店
# jx4_31 | 仕事のことば 31（準1級）
trust|v||信頼する
war|n|wars|戦争
prove|v|proved,proves|証明する
lengthen|v|lengthened|長くする
# jx4_32 | 仕事のことば 32（準1級）
authority|n||権限
enclose|v|enclosed|同封する
villager|n|villagers|村人
repeat|v|repeated|繰り返す
# jx4_33 | 仕事のことば 33（準1級）
consent|n|consented|同意
parent|n|parent's,parents|親
assistant|n||助手
employer|n||雇い主
# jx4_34 | 仕事のことば 34（準1級）
certificate|n|certificates|証明書
sail|v|sails|航海する
usual|a||いつもの
spine|n||背骨
# jx4_35 | 仕事のことば 35（準1級）
discharge|n|discharged,discharges|退院・（荷）降ろし・排出
online|a||オンラインの
access|n||利用・閲覧する権利・出入り
entitle|v|entitled|権利を与える
# jx4_36 | 仕事のことば 36（準1級）
loudly|d||大声で
appendix|n||虫垂・付録
class|n|classes|授業
license|n|licensed,licenses|免許（証）・免許を与える
# jx4_37 | 仕事のことば 37（準1級）
identity|n||身元
improve|v||改善する
concern|n|concerns|心配
entrance|n||入口
# jx4_38 | 仕事のことば 38（準1級）
row|n||列
shape|n|shapes|形
lend|v|lends,lending,lent|貸す
exist|v|existed|存在する
# jx5_13 | 仕事のことば 13（1級）
recount|n|recounts|数え直し・再集計
ballot|n|ballots|投票用紙
majority|n||大多数
none|r||どれも～ない
overstate|v|overstated,overstates|誇張して言う
# jx5_14 | 仕事のことば 14（1級）
creditor|n|creditors|債権者
traffic|n||交通
councillor|n|councillors|市（町）議会議員
former|a||前の
# jx5_15 | 仕事のことば 15（1級）
volunteer|n|volunteers|ボランティア・進んで申し出る
century|n||世紀
pension|n||年金
fuel|n||燃料
# jx5_16 | 仕事のことば 16（1級）
referendum|n||国民投票
tariff|n||関税
algorithm|n||アルゴリズム
amendment|n||修正
# jx5_17 | 仕事のことば 17（1級）
article|n|articles|記事
conductor|n||指揮者
correlation|n||相関
design|n||デザイン
# jx5_18 | 仕事のことば 18（1級）
extension|n||拡張・増築
hypothesis|n||仮説
immunity|n||免疫
issue|v|issued|発行する・問題
# jx5_19 | 仕事のことば 19（1級）
lowest|a||最も低い・最低の
major|a||主要な
novelist|n||小説家
portrait|n|portraits|肖像画
# jx5_20 | 仕事のことば 20（1級）
precedent|n||先例
predict|v|predicts|予測する
private|a||私的な
public|n||一般の人々
# jx5_21 | 仕事のことば 21（1級）
survive|v|survived,survives|生き残る
bid|v|bids|入札する
blame|v|blamed|責める
central|a||中心の・中央の
# jx5_22 | 仕事のことば 22（1級）
commission|n||委員会・手数料
coral|n||サンゴ
electoral|a||選挙の
embargo|n|embargoed|禁輸・公開禁止（期間）
# jx5_23 | 仕事のことば 23（1級）
exile|n|exiled|追放
expert|n|experts|専門家
finding|n|findings|調査結果
galaxy|n||銀河
# jx5_24 | 仕事のことば 24（1級）
gene|n|genes|遺伝子
method|n||方法
particle|n||粒子
prime|a||最も重要な
# jx5_25 | 仕事のことば 25（1級）
reef|n||岩礁
reviewer|n|reviewers|査読者・批評家
seal|n|seals,sealed|アザラシ
silence|n||沈黙・静けさ
themselves|r||彼ら自身
# jx5_26 | 仕事のことば 26（1級）
those|t||それらの
officer|n||役人
master|n||長・港長
personal|a||個人の
# jx5_27 | 仕事のことば 27（1級）
remove|v||取り除く
february|n||2月
fee|n|fees|料金
length|n||長さ
# jx5_28 | 仕事のことば 28（1級）
code|n||コード
handle|v|handled|扱う
wear|v||着る
disclose|v|disclosed|公開する
# jx5_29 | 仕事のことば 29（1級）
confused|a||困惑した
examination|n|examinations|診察・検査・試験
tribunal|n||裁判所
flat|n|flats|アパート（英）
# jx5_30 | 仕事のことば 30（1級）
cast|n||ギプス・配役
leak|v|leaking|漏れる
benefit|n|benefits|給付・利益
eligible|a||資格のある
# jx5_31 | 仕事のことば 31（1級）
data|n||資料
exclude|v|excluded,excludes|除外する
ground|n||根拠・地面
site|n||部位・場所
# jx5_32 | 仕事のことば 32（1級）
suffer|v|suffers,suffered|苦しむ
widow|n|widower|未亡人
assessment|n||評価
consultant|n||上級専門医（英）・コンサルタント
# jx5_33 | 仕事のことば 33（1級）
exceed|v|exceeds|超える
exempt|a||免除された
guardian|n||保護者
lodge|v|lodger|（苦情を）申し立てる
# jx5_34 | 仕事のことば 34（1級）
grounds|n||理由・根拠
unpaid|a||未払いの
reduction|n|reductions|削減
property|n||財産
# jx5_35 | 仕事のことば 35（1級）
individual|a||個々の
original|a|originals|もとの
protocol|n||手順・規定
quarantine|n||検疫
# jx5_36 | 仕事のことば 36（1級）
negligence|n||過失
negligent|a||怠慢な
settlement|n||和解・示談・解決
adopted|a||養子の
`;
// END generated
const NC = lex(NC_SRC);

export const COMMON_EN: JobCommon = { lexicon: [...WORDS, ...NC.entries], pages: [...PAGES, ...NC.pages], forms: {}, lemmas: { in_tell: 'tell' } };
