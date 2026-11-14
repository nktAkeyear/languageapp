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

export const COMMON_EN: JobCommon = { lexicon: WORDS, pages: PAGES, forms: {} };
