import type { LexEntry, VerificationPage } from '../../core/types';

/**
 * Mandarin words introduced by the town activities (market, deliveries).
 * Kept apart from the shop lexicon; merged in by src/content/index.ts.
 * - pinyin: citation tones (一共 = yīgòng, no sandhi marks).
 * - hsk: HSK 2.0 level; null = not a headword of the 1–6 lists or not verified.
 * - Words the shop also uses (numbers, 二 / 百, colours, family, 今天, 以前 / 以后, 多少, 家, 在 …)
 *   live only in the shop lexicon (lexicon.ts / lexicon2.ts); town texts use the same ids.
 *   A few town words join shop 検証ページ (我们 → g10b, 蓝 → g18a, 奶奶 → g11a).
 * - Stalls are named with the shop's colour adjectives: 红的那家 "the red one".
 * - 块 as money (kuai_money) shares its surface with the shop's 块 (lump); texts always use
 *   `{块|kuai_money}` markup.
 */
export const TOWN_LEXICON: LexEntry[] = [
  // t_market
  { id: 'kuai_money', text: '块', pinyin: 'kuài', gloss: '〜元（お金の単位・話し言葉）', emoji: '🪙', pos: 'measure', cefr: 'A1', hsk: 1, group: 't_market' },
  { id: 'altogether', text: '一共', pinyin: 'yīgòng', gloss: '全部で・合わせて', emoji: '🧮', pos: 'adv', cefr: 'A2', hsk: 3, group: 't_market' },
  { id: 'zhao', text: '找', pinyin: 'zhǎo', gloss: 'おつりを渡す・探す', emoji: '💱', pos: 'verb', cefr: 'A1', hsk: 2, group: 't_market' },
  { id: 'small_change', text: '零钱', pinyin: 'língqián', gloss: '小銭・細かいお金', emoji: '🪙', pos: 'noun', cefr: 'A2', hsk: null, group: 't_market' },
  { id: 'fresh', text: '新鲜', pinyin: 'xīnxiān', gloss: '新鮮な', emoji: '✨', pos: 'adj', cefr: 'A2', hsk: 3, group: 't_market' },
  // t_units
  { id: 'ba_bunch', text: '把', pinyin: 'bǎ', gloss: '〜束（ひとつかみ）', emoji: '💐', pos: 'measure', cefr: 'A2', hsk: 3, group: 't_units' },
  { id: 'dai', text: '袋', pinyin: 'dài', gloss: '〜袋', emoji: '🛍️', pos: 'measure', cefr: 'A2', hsk: null, group: 't_units' },
  { id: 'ping', text: '瓶', pinyin: 'píng', gloss: '〜びん（びんを数える）', emoji: '🫙', pos: 'measure', cefr: 'A2', hsk: null, group: 't_units' },
  // in shop pages
  { id: 'we', text: '我们', pinyin: 'wǒmen', gloss: '私たち', emoji: '👥', pos: 'pron', cefr: 'A1', hsk: 1, group: 'g10b' },
  { id: 'blue', text: '蓝', pinyin: 'lán', gloss: '青い', emoji: '🟦', pos: 'adj', cefr: 'A2', hsk: 3, group: 'g18a' },
  { id: 'grandmother', text: '奶奶', pinyin: 'nǎinai', gloss: 'おばあさん（父方の祖母）', emoji: '👵', pos: 'noun', cefr: 'A2', hsk: 3, group: 'g11a' },

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
  { id: 'oclock', text: '点', pinyin: 'diǎn', gloss: '〜時', emoji: '🕒', pos: 'measure', cefr: 'A1', hsk: 1, group: 't_clock' },
  { id: 'deliver', text: '送', pinyin: 'sòng', gloss: '届ける・送る', emoji: '📦', pos: 'verb', cefr: 'A1', hsk: 2, group: 't_clock' },
  { id: 'arrive', text: '到', pinyin: 'dào', gloss: '着く・届く', emoji: '🏁', pos: 'verb', cefr: 'A1', hsk: 2, group: 't_clock' },
  // t_visit
  { id: 'knock', text: '敲', pinyin: 'qiāo', gloss: 'たたく・ノックする', emoji: '✊', pos: 'verb', cefr: 'B1', hsk: 4, group: 't_visit' },
  { id: 'times', text: '次', pinyin: 'cì', gloss: '〜回（回数）', emoji: '🔁', pos: 'measure', cefr: 'A1', hsk: 2, group: 't_visit' },
  { id: 'door', text: '门', pinyin: 'mén', gloss: 'ドア・門', emoji: '🚪', pos: 'noun', cefr: 'A1', hsk: 2, group: 't_visit' },
  { id: 'doorway', text: '门口', pinyin: 'ménkǒu', gloss: '戸口・玄関先', emoji: '📥', pos: 'noun', cefr: 'A2', hsk: null, group: 't_visit' },
  // t_absent (+ the shop word 家)
  { id: 'person', text: '人', pinyin: 'rén', gloss: '人', emoji: '🧍', pos: 'noun', cefr: 'A1', hsk: 1, group: 't_absent' },
  { id: 'put', text: '放', pinyin: 'fàng', gloss: '置く', emoji: '📦', pos: 'verb', cefr: 'A2', hsk: 3, group: 't_absent' },
  { id: 'neighbour', text: '邻居', pinyin: 'línjū', gloss: '隣の人・近所の人', emoji: '🏘️', pos: 'noun', cefr: 'A2', hsk: 3, group: 't_absent' },
];

export const TOWN_PAGES: VerificationPage[] = [
  { id: 't_market', labelJa: '市場のことば' },
  { id: 't_units', labelJa: '市場：入れもの' },
  { id: 't_place1', labelJa: '町の場所（一）', minEncounters: 2 },
  { id: 't_place2', labelJa: '町の場所（二）', minEncounters: 2 },
  { id: 't_dir', labelJa: '位置' },
  { id: 't_clock', labelJa: '配達の時間' },
  { id: 't_visit', labelJa: '訪ねる' },
  { id: 't_absent', labelJa: '留守のとき' },
];
