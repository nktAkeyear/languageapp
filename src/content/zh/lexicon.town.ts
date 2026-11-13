import type { LexEntry, VerificationPage } from '../../core/types';

/**
 * Mandarin words introduced by the town activities (market, deliveries).
 * Kept apart from the shop lexicon; merged in by src/content/index.ts.
 * - pinyin: citation tones (一共 = yīgòng, 对不起 = duìbuqǐ, no sandhi marks).
 * - hsk: HSK 2.0 level; null = not a headword of the 1–6 lists or not verified.
 *   Colour compounds (红色 …) carry the level of their HSK headword (红 2, 蓝 3, 绿 3); 黄 is unlisted.
 * - 块 as money (kuai_money) shares its surface with the shop's 块 (lump); texts always use
 *   `{块|kuai_money}` markup.
 */
export const TOWN_LEXICON: LexEntry[] = [
  // t_num3
  { id: 'six', text: '六', pinyin: 'liù', gloss: '6（むっつ）', emoji: '6️⃣', pos: 'num', cefr: 'A1', hsk: 1, group: 't_num3' },
  { id: 'seven', text: '七', pinyin: 'qī', gloss: '7（ななつ）', emoji: '7️⃣', pos: 'num', cefr: 'A1', hsk: 1, group: 't_num3' },
  { id: 'eight', text: '八', pinyin: 'bā', gloss: '8（やっつ）', emoji: '8️⃣', pos: 'num', cefr: 'A1', hsk: 1, group: 't_num3' },
  { id: 'nine', text: '九', pinyin: 'jiǔ', gloss: '9（ここのつ）', emoji: '9️⃣', pos: 'num', cefr: 'A1', hsk: 1, group: 't_num3' },
  // t_num4
  { id: 'two_er', text: '二', pinyin: 'èr', gloss: '2（数字・十の位などで使う）', emoji: '2️⃣', pos: 'num', cefr: 'A1', hsk: 1, group: 't_num4' },
  { id: 'ten', text: '十', pinyin: 'shí', gloss: '10（とお）', emoji: '🔟', pos: 'num', cefr: 'A1', hsk: 1, group: 't_num4' },
  { id: 'hundred', text: '百', pinyin: 'bǎi', gloss: '100（百）', emoji: '💯', pos: 'num', cefr: 'A1', hsk: 2, group: 't_num4' },

  // t_money
  { id: 'kuai_money', text: '块', pinyin: 'kuài', gloss: '〜元（お金の単位・話し言葉）', emoji: '🪙', pos: 'measure', cefr: 'A1', hsk: 1, group: 't_money' },
  { id: 'money', text: '钱', pinyin: 'qián', gloss: 'お金', emoji: '💰', pos: 'noun', cefr: 'A1', hsk: 1, group: 't_money' },
  { id: 'altogether', text: '一共', pinyin: 'yīgòng', gloss: '全部で・合わせて', emoji: '🧮', pos: 'adv', cefr: 'A2', hsk: 3, group: 't_money' },
  { id: 'zhao', text: '找', pinyin: 'zhǎo', gloss: 'おつりを渡す・探す', emoji: '💱', pos: 'verb', cefr: 'A1', hsk: 2, group: 't_money' },
  { id: 'small_change', text: '零钱', pinyin: 'língqián', gloss: '小銭・細かいお金', emoji: '🪙', pos: 'noun', cefr: 'A2', hsk: null, group: 't_money' },
  // t_price
  { id: 'cheap', text: '便宜', pinyin: 'piányi', gloss: '安い', emoji: '🏷️', pos: 'adj', cefr: 'A1', hsk: 2, group: 't_price' },
  { id: 'expensive', text: '贵', pinyin: 'guì', gloss: '（値段が）高い', emoji: '💸', pos: 'adj', cefr: 'A1', hsk: 2, group: 't_price' },
  { id: 'how_many', text: '多少', pinyin: 'duōshao', gloss: 'いくつ・いくら', emoji: '❔', pos: 'pron', cefr: 'A1', hsk: 1, group: 't_price' },
  { id: 'ge', text: '个', pinyin: 'gè', gloss: '〜個（いちばん普通の数え方）', emoji: '🔢', pos: 'measure', cefr: 'A1', hsk: 1, group: 't_price' },
  // t_units
  { id: 'ba_bunch', text: '把', pinyin: 'bǎ', gloss: '〜束（ひとつかみ）', emoji: '💐', pos: 'measure', cefr: 'A2', hsk: 3, group: 't_units' },
  { id: 'dai', text: '袋', pinyin: 'dài', gloss: '〜袋', emoji: '🛍️', pos: 'measure', cefr: 'A2', hsk: null, group: 't_units' },
  { id: 'ping', text: '瓶', pinyin: 'píng', gloss: '〜びん（びんを数える）', emoji: '🫙', pos: 'measure', cefr: 'A2', hsk: null, group: 't_units' },
  // t_state
  { id: 'fresh', text: '新鲜', pinyin: 'xīnxiān', gloss: '新鮮な', emoji: '✨', pos: 'adj', cefr: 'A2', hsk: 3, group: 't_state' },
  { id: 'big', text: '大', pinyin: 'dà', gloss: '大きい', emoji: '🐘', pos: 'adj', cefr: 'A1', hsk: 1, group: 't_state' },
  { id: 'small', text: '小', pinyin: 'xiǎo', gloss: '小さい', emoji: '🐭', pos: 'adj', cefr: 'A1', hsk: 1, group: 't_state' },
  // t_when
  { id: 'today', text: '今天', pinyin: 'jīntiān', gloss: '今日', emoji: '📅', pos: 'noun', cefr: 'A1', hsk: 1, group: 't_when' },
  { id: 'tomorrow', text: '明天', pinyin: 'míngtiān', gloss: '明日', emoji: '🌅', pos: 'noun', cefr: 'A1', hsk: 1, group: 't_when' },
  { id: 'sorry', text: '对不起', pinyin: 'duìbuqǐ', gloss: 'ごめんなさい・すみません', emoji: '🙇', pos: 'verb', cefr: 'A1', hsk: 1, group: 't_when' },
  { id: 'we', text: '我们', pinyin: 'wǒmen', gloss: '私たち', emoji: '👥', pos: 'pron', cefr: 'A1', hsk: 1, group: 't_when' },
  // t_talk
  { id: 'buy', text: '买', pinyin: 'mǎi', gloss: '買う', emoji: '🛒', pos: 'verb', cefr: 'A1', hsk: 1, group: 't_talk' },
  { id: 'you', text: '你', pinyin: 'nǐ', gloss: 'あなた', emoji: '🫵', pos: 'pron', cefr: 'A1', hsk: 1, group: 't_talk' },
  { id: 'that', text: '那', pinyin: 'nà', gloss: 'あれ・あの', emoji: '👉', pos: 'pron', cefr: 'A1', hsk: 1, group: 't_talk' },
  { id: 'jia_home', text: '家', pinyin: 'jiā', gloss: '家（うち）・〜軒（店や家を数える）', emoji: '🏠', pos: 'noun', cefr: 'A1', hsk: 1, group: 't_talk' },
  // t_colour
  { id: 'red', text: '红色', pinyin: 'hóngsè', gloss: '赤い色', emoji: '🟥', pos: 'noun', cefr: 'A1', hsk: 2, group: 't_colour' },
  { id: 'yellow', text: '黄色', pinyin: 'huángsè', gloss: '黄色', emoji: '🟨', pos: 'noun', cefr: 'A1', hsk: null, group: 't_colour' },
  { id: 'blue', text: '蓝色', pinyin: 'lánsè', gloss: '青い色', emoji: '🟦', pos: 'noun', cefr: 'A2', hsk: 3, group: 't_colour' },
  { id: 'green', text: '绿色', pinyin: 'lǜsè', gloss: '緑色', emoji: '🟩', pos: 'noun', cefr: 'A2', hsk: 3, group: 't_colour' },

  // t_place1
  { id: 'harbour', text: '码头', pinyin: 'mǎtou', gloss: '波止場・港', emoji: '⚓', pos: 'noun', cefr: 'B1', hsk: null, group: 't_place1' },
  { id: 'inn', text: '宾馆', pinyin: 'bīnguǎn', gloss: 'ホテル・宿', emoji: '🛏️', pos: 'noun', cefr: 'A2', hsk: 2, group: 't_place1' },
  { id: 'school', text: '学校', pinyin: 'xuéxiào', gloss: '学校', emoji: '🏫', pos: 'noun', cefr: 'A1', hsk: 1, group: 't_place1' },
  { id: 'bridge', text: '桥', pinyin: 'qiáo', gloss: '橋', emoji: '🌉', pos: 'noun', cefr: 'B1', hsk: 4, group: 't_place1' },
  // t_place2
  { id: 'bank', text: '银行', pinyin: 'yínháng', gloss: '銀行', emoji: '🏦', pos: 'noun', cefr: 'A2', hsk: 3, group: 't_place2' },
  { id: 'hospital', text: '医院', pinyin: 'yīyuàn', gloss: '病院', emoji: '🏥', pos: 'noun', cefr: 'A1', hsk: 1, group: 't_place2' },
  { id: 'market', text: '市场', pinyin: 'shìchǎng', gloss: '市場', emoji: '🧺', pos: 'noun', cefr: 'B1', hsk: null, group: 't_place2' },
  { id: 'temple', text: '庙', pinyin: 'miào', gloss: 'お寺・廟', emoji: '🛕', pos: 'noun', cefr: 'B2', hsk: null, group: 't_place2' },
  // t_dir
  { id: 'beside', text: '旁边', pinyin: 'pángbiān', gloss: '〜のそば・となり', emoji: '↔️', pos: 'noun', cefr: 'A1', hsk: 2, group: 't_dir' },
  { id: 'behind', text: '后面', pinyin: 'hòumiàn', gloss: '〜の裏・うしろ', emoji: '🔙', pos: 'noun', cefr: 'A1', hsk: 1, group: 't_dir' },
  { id: 'opposite', text: '对面', pinyin: 'duìmiàn', gloss: '〜の向かい（通りの反対側）', emoji: '↕️', pos: 'noun', cefr: 'A2', hsk: 4, group: 't_dir' },
  { id: 'left', text: '左边', pinyin: 'zuǒbiān', gloss: '左側', emoji: '⬅️', pos: 'noun', cefr: 'A1', hsk: 2, group: 't_dir' },
  { id: 'right_side', text: '右边', pinyin: 'yòubiān', gloss: '右側', emoji: '➡️', pos: 'noun', cefr: 'A1', hsk: 2, group: 't_dir' },
  // t_clock
  { id: 'morning', text: '上午', pinyin: 'shàngwǔ', gloss: '午前', emoji: '🌅', pos: 'noun', cefr: 'A1', hsk: 1, group: 't_clock' },
  { id: 'afternoon', text: '下午', pinyin: 'xiàwǔ', gloss: '午後', emoji: '☀️', pos: 'noun', cefr: 'A1', hsk: 1, group: 't_clock' },
  { id: 'oclock', text: '点', pinyin: 'diǎn', gloss: '〜時', emoji: '🕒', pos: 'measure', cefr: 'A1', hsk: 1, group: 't_clock' },
  { id: 'deliver', text: '送', pinyin: 'sòng', gloss: '届ける・送る', emoji: '📦', pos: 'verb', cefr: 'A1', hsk: 2, group: 't_clock' },
  // t_order
  { id: 'before', text: '以前', pinyin: 'yǐqián', gloss: '〜より前', emoji: '⏮️', pos: 'noun', cefr: 'A2', hsk: 3, group: 't_order' },
  { id: 'after', text: '以后', pinyin: 'yǐhòu', gloss: '〜より後', emoji: '⏭️', pos: 'noun', cefr: 'A2', hsk: 3, group: 't_order' },
  { id: 'arrive', text: '到', pinyin: 'dào', gloss: '着く・届く', emoji: '🏁', pos: 'verb', cefr: 'A1', hsk: 2, group: 't_order' },
  { id: 'early', text: '早', pinyin: 'zǎo', gloss: '早い', emoji: '🐓', pos: 'adj', cefr: 'A1', hsk: null, group: 't_order' },
  { id: 'late', text: '晚', pinyin: 'wǎn', gloss: '遅い', emoji: '🐌', pos: 'adj', cefr: 'A1', hsk: null, group: 't_order' },
  // t_family
  { id: 'mother', text: '妈妈', pinyin: 'māma', gloss: 'お母さん', emoji: '👩', pos: 'noun', cefr: 'A1', hsk: 1, group: 't_family' },
  { id: 'father', text: '爸爸', pinyin: 'bàba', gloss: 'お父さん', emoji: '👨', pos: 'noun', cefr: 'A1', hsk: 1, group: 't_family' },
  { id: 'child', text: '孩子', pinyin: 'háizi', gloss: '子ども', emoji: '👧', pos: 'noun', cefr: 'A1', hsk: 2, group: 't_family' },
  { id: 'grandmother', text: '奶奶', pinyin: 'nǎinai', gloss: 'おばあさん（父方の祖母）', emoji: '👵', pos: 'noun', cefr: 'A2', hsk: 3, group: 't_family' },
  // t_visit
  { id: 'knock', text: '敲', pinyin: 'qiāo', gloss: 'たたく・ノックする', emoji: '✊', pos: 'verb', cefr: 'B1', hsk: 4, group: 't_visit' },
  { id: 'times', text: '次', pinyin: 'cì', gloss: '〜回（回数）', emoji: '🔁', pos: 'measure', cefr: 'A1', hsk: 2, group: 't_visit' },
  { id: 'door', text: '门', pinyin: 'mén', gloss: 'ドア・門', emoji: '🚪', pos: 'noun', cefr: 'A1', hsk: 2, group: 't_visit' },
  { id: 'doorway', text: '门口', pinyin: 'ménkǒu', gloss: '戸口・玄関先', emoji: '📥', pos: 'noun', cefr: 'A2', hsk: null, group: 't_visit' },
  // t_absent
  { id: 'if', text: '如果', pinyin: 'rúguǒ', gloss: 'もし〜なら', emoji: '🤔', pos: 'conj', cefr: 'A2', hsk: 3, group: 't_absent' },
  { id: 'person', text: '人', pinyin: 'rén', gloss: '人', emoji: '🧍', pos: 'noun', cefr: 'A1', hsk: 1, group: 't_absent' },
  { id: 'zai', text: '在', pinyin: 'zài', gloss: '〜にいる・〜に（ある）', emoji: '📍', pos: 'verb', cefr: 'A1', hsk: 1, group: 't_absent' },
  { id: 'put', text: '放', pinyin: 'fàng', gloss: '置く', emoji: '📦', pos: 'verb', cefr: 'A2', hsk: 3, group: 't_absent' },
  { id: 'neighbour', text: '邻居', pinyin: 'línjū', gloss: '隣の人・近所の人', emoji: '🏘️', pos: 'noun', cefr: 'A2', hsk: 3, group: 't_absent' },
];

export const TOWN_PAGES: VerificationPage[] = [
  { id: 't_num3', labelJa: '数（三）', minEncounters: 2 },
  { id: 't_num4', labelJa: '数（四）', minEncounters: 2 },
  { id: 't_money', labelJa: '市場：お金' },
  { id: 't_price', labelJa: '市場：値段をきく' },
  { id: 't_units', labelJa: '市場：入れもの' },
  { id: 't_state', labelJa: '市場：品の様子' },
  { id: 't_when', labelJa: '市場：店先のことば' },
  { id: 't_talk', labelJa: 'やりとり' },
  { id: 't_colour', labelJa: '色', minEncounters: 2 },
  { id: 't_place1', labelJa: '町の場所（一）', minEncounters: 2 },
  { id: 't_place2', labelJa: '町の場所（二）', minEncounters: 2 },
  { id: 't_dir', labelJa: '位置' },
  { id: 't_clock', labelJa: '時間（一）' },
  { id: 't_order', labelJa: '時間（二）' },
  { id: 't_family', labelJa: '家族' },
  { id: 't_visit', labelJa: '訪ねる' },
  { id: 't_absent', labelJa: '留守のとき' },
];
