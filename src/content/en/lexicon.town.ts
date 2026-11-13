import type { LexEntry, VerificationPage } from '../../core/types';

/**
 * English words introduced by the town activities (market, deliveries).
 * Kept apart from the shop lexicon; merged in by src/content/index.ts.
 * `eiken` grades are approximate (英検 has no official list); CEFR is best-effort placement.
 */
export const TOWN_LEXICON: LexEntry[] = [
  // t_num3 — 6–10
  { id: 'six', text: 'six', gloss: '6（むっつ）', emoji: '6️⃣', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num3' },
  { id: 'seven', text: 'seven', gloss: '7（ななつ）', emoji: '7️⃣', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num3' },
  { id: 'eight', text: 'eight', gloss: '8（やっつ）', emoji: '8️⃣', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num3' },
  { id: 'nine', text: 'nine', gloss: '9（ここのつ）', emoji: '9️⃣', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num3' },
  { id: 'ten', text: 'ten', gloss: '10（とお）', emoji: '🔟', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num3' },
  // t_num4 — 11–15
  { id: 'eleven', text: 'eleven', gloss: '11', emoji: '🕚', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num4' },
  { id: 'twelve', text: 'twelve', gloss: '12', emoji: '🕛', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num4' },
  { id: 'thirteen', text: 'thirteen', gloss: '13', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num4' },
  { id: 'fourteen', text: 'fourteen', gloss: '14', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num4' },
  { id: 'fifteen', text: 'fifteen', gloss: '15', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num4' },
  // t_num5 — 16–19
  { id: 'sixteen', text: 'sixteen', gloss: '16', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num5' },
  { id: 'seventeen', text: 'seventeen', gloss: '17', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num5' },
  { id: 'eighteen', text: 'eighteen', gloss: '18', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num5' },
  { id: 'nineteen', text: 'nineteen', gloss: '19', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num5' },
  // t_num6 — tens
  { id: 'twenty', text: 'twenty', gloss: '20', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num6' },
  { id: 'thirty', text: 'thirty', gloss: '30', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num6' },
  { id: 'forty', text: 'forty', gloss: '40', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num6' },
  { id: 'fifty', text: 'fifty', gloss: '50', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num6' },
  // t_num7
  { id: 'sixty', text: 'sixty', gloss: '60', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num7' },
  { id: 'seventy', text: 'seventy', gloss: '70', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num7' },
  { id: 'eighty', text: 'eighty', gloss: '80', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num7' },
  { id: 'ninety', text: 'ninety', gloss: '90', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num7' },
  { id: 'hundred', text: 'hundred', gloss: '100（百）', emoji: '💯', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num7' },

  // t_money
  { id: 'coin', text: 'coin', forms: ['coins'], gloss: '硬貨（コイン）', emoji: '🪙', pos: 'noun', cefr: 'A2', eiken: '3', group: 't_money' },
  { id: 'change', text: 'change', gloss: 'おつり', emoji: '💱', pos: 'noun', cefr: 'A2', eiken: '3', group: 't_money' },
  { id: 'each', text: 'each', gloss: '一つにつき・それぞれ', emoji: '☝️', pos: 'adv', cefr: 'A1', eiken: '4', group: 't_money' },
  { id: 'buy', text: 'buy', gloss: '買う', emoji: '🛒', pos: 'verb', cefr: 'A1', eiken: '5', group: 't_money' },
  // t_price
  { id: 'cheap', text: 'cheap', forms: ['cheaper'], gloss: '安い', emoji: '🏷️', pos: 'adj', cefr: 'A1', eiken: '4', group: 't_price' },
  { id: 'expensive', text: 'expensive', gloss: '（値段が）高い', emoji: '💸', pos: 'adj', cefr: 'A1', eiken: '4', group: 't_price' },
  { id: 'how', text: 'how', gloss: 'どれだけ・どのように', emoji: '❔', pos: 'adv', cefr: 'A1', eiken: '5', group: 't_price' },
  { id: 'many', text: 'many', gloss: '（数が）多い', emoji: '🔢', pos: 'det', cefr: 'A1', eiken: '5', group: 't_price' },
  // t_when
  { id: 'today', text: 'today', gloss: '今日', emoji: '📅', pos: 'noun', cefr: 'A1', eiken: '5', group: 't_when' },
  { id: 'tomorrow', text: 'tomorrow', gloss: '明日', emoji: '🌅', pos: 'noun', cefr: 'A1', eiken: '5', group: 't_when' },
  { id: 'sorry', text: 'sorry', gloss: 'ごめんなさい・すみません', emoji: '🙇', pos: 'adj', cefr: 'A1', eiken: '5', group: 't_when' },
  { id: 'we', text: 'we', gloss: '私たち', emoji: '👥', pos: 'pron', cefr: 'A1', eiken: '5', group: 't_when' },
  // t_state
  { id: 'fresh', text: 'fresh', gloss: '新鮮な', emoji: '✨', pos: 'adj', cefr: 'A2', eiken: '3', group: 't_state' },
  { id: 'old', text: 'old', gloss: '古い', emoji: '🥀', pos: 'adj', cefr: 'A1', eiken: '5', group: 't_state' },
  { id: 'big', text: 'big', gloss: '大きい', emoji: '🐘', pos: 'adj', cefr: 'A1', eiken: '5', group: 't_state' },
  { id: 'small', text: 'small', gloss: '小さい', emoji: '🐭', pos: 'adj', cefr: 'A1', eiken: '5', group: 't_state' },
  // t_units
  { id: 'bunch', text: 'bunch', forms: ['bunches'], gloss: '束（ひと束）', emoji: '💐', pos: 'noun', cefr: 'B1', eiken: '準2', group: 't_units' },
  { id: 'bag', text: 'bag', forms: ['bags'], gloss: '袋（ひと袋）', emoji: '🛍️', pos: 'noun', cefr: 'A1', eiken: '5', group: 't_units' },
  { id: 'jar', text: 'jar', forms: ['jars'], gloss: 'びん（広口のつぼ・ひとびん）', emoji: '🫙', pos: 'noun', cefr: 'B1', eiken: '2', group: 't_units' },
  { id: 'bottle', text: 'bottle', forms: ['bottles'], gloss: 'ボトル（細口のびん）', emoji: '🍼', pos: 'noun', cefr: 'A2', eiken: '3', group: 't_units' },
  // t_colour
  { id: 'red', text: 'red', gloss: '赤い', emoji: '🟥', pos: 'adj', cefr: 'A1', eiken: '5', group: 't_colour' },
  { id: 'yellow', text: 'yellow', gloss: '黄色い', emoji: '🟨', pos: 'adj', cefr: 'A1', eiken: '5', group: 't_colour' },
  { id: 'blue', text: 'blue', gloss: '青い', emoji: '🟦', pos: 'adj', cefr: 'A1', eiken: '5', group: 't_colour' },
  { id: 'green', text: 'green', gloss: '緑の', emoji: '🟩', pos: 'adj', cefr: 'A1', eiken: '5', group: 't_colour' },
  // t_talk
  { id: 'stall', text: 'stall', forms: ['stalls'], gloss: '屋台・売り場', emoji: '⛺', pos: 'noun', cefr: 'B2', eiken: '準1', group: 't_talk' },
  { id: 'you', text: 'you', gloss: 'あなた', emoji: '🫵', pos: 'pron', cefr: 'A1', eiken: '5', group: 't_talk' },
  { id: 'your', text: 'your', gloss: 'あなたの', pos: 'det', cefr: 'A1', eiken: '5', group: 't_talk' },
  { id: 'give', text: 'give', gloss: '渡す・あげる', emoji: '🤲', pos: 'verb', cefr: 'A1', eiken: '5', group: 't_talk' },
  { id: 'to', text: 'to', gloss: '〜へ・〜に（向かう先）', emoji: '➡️', pos: 'prep', cefr: 'A1', eiken: '5', group: 't_talk' },

  // t_place1
  { id: 'harbour', text: 'harbour', forms: ['harbor'], gloss: '港', emoji: '⚓', pos: 'noun', cefr: 'B1', eiken: '準2', group: 't_place1' },
  { id: 'inn', text: 'inn', gloss: '宿屋', emoji: '🛏️', pos: 'noun', cefr: 'B1', eiken: '2', group: 't_place1' },
  { id: 'school', text: 'school', gloss: '学校', emoji: '🏫', pos: 'noun', cefr: 'A1', eiken: '5', group: 't_place1' },
  { id: 'bridge', text: 'bridge', gloss: '橋', emoji: '🌉', pos: 'noun', cefr: 'A2', eiken: '4', group: 't_place1' },
  // t_place2
  { id: 'bank', text: 'bank', gloss: '銀行', emoji: '🏦', pos: 'noun', cefr: 'A1', eiken: '4', group: 't_place2' },
  { id: 'hospital', text: 'hospital', gloss: '病院', emoji: '🏥', pos: 'noun', cefr: 'A1', eiken: '4', group: 't_place2' },
  { id: 'market', text: 'market', gloss: '市場', emoji: '🧺', pos: 'noun', cefr: 'A1', eiken: '4', group: 't_place2' },
  { id: 'church', text: 'church', gloss: '教会', emoji: '⛪', pos: 'noun', cefr: 'A1', eiken: '3', group: 't_place2' },
  // t_dir
  { id: 'next_to', text: 'next to', gloss: '〜のとなり', emoji: '↔️', pos: 'prep', cefr: 'A1', eiken: '5', group: 't_dir' },
  { id: 'behind', text: 'behind', gloss: '〜の裏・うしろ', emoji: '🔙', pos: 'prep', cefr: 'A2', eiken: '4', group: 't_dir' },
  { id: 'across_from', text: 'across from', gloss: '〜の向かい（通りの反対側）', emoji: '↕️', pos: 'prep', cefr: 'A2', eiken: '3', group: 't_dir' },
  { id: 'left', text: 'left', gloss: '左', emoji: '⬅️', pos: 'noun', cefr: 'A1', eiken: '5', group: 't_dir' },
  { id: 'right', text: 'right', gloss: '右', emoji: '➡️', pos: 'noun', cefr: 'A1', eiken: '5', group: 't_dir' },
  // t_clock
  { id: 'morning', text: 'morning', gloss: '朝・午前', emoji: '🌅', pos: 'noun', cefr: 'A1', eiken: '5', group: 't_clock' },
  { id: 'afternoon', text: 'afternoon', gloss: '午後', emoji: '☀️', pos: 'noun', cefr: 'A1', eiken: '5', group: 't_clock' },
  { id: 'evening', text: 'evening', gloss: '夕方・晩', emoji: '🌆', pos: 'noun', cefr: 'A1', eiken: '5', group: 't_clock' },
  { id: 'oclock', text: "o'clock", gloss: '〜時（ちょうど）', emoji: '🕒', pos: 'adv', cefr: 'A1', eiken: '5', group: 't_clock' },
  { id: 'in', text: 'in', gloss: '〜の中に・〜に（時間帯）', emoji: '📥', pos: 'prep', cefr: 'A1', eiken: '5', group: 't_clock' },
  // t_order
  { id: 'before', text: 'before', gloss: '〜より前に', emoji: '⏮️', pos: 'prep', cefr: 'A1', eiken: '4', group: 't_order' },
  { id: 'after', text: 'after', gloss: '〜より後に', emoji: '⏭️', pos: 'prep', cefr: 'A1', eiken: '4', group: 't_order' },
  { id: 'early', text: 'early', gloss: '早い', emoji: '🐓', pos: 'adj', cefr: 'A1', eiken: '4', group: 't_order' },
  { id: 'late', text: 'late', gloss: '遅い', emoji: '🐌', pos: 'adj', cefr: 'A1', eiken: '4', group: 't_order' },
  // t_family
  { id: 'mother', text: 'mother', gloss: '母・お母さん', emoji: '👩', pos: 'noun', cefr: 'A1', eiken: '5', group: 't_family' },
  { id: 'father', text: 'father', gloss: '父・お父さん', emoji: '👨', pos: 'noun', cefr: 'A1', eiken: '5', group: 't_family' },
  { id: 'child', text: 'child', gloss: '子ども', emoji: '👧', pos: 'noun', cefr: 'A1', eiken: '4', group: 't_family' },
  { id: 'grandmother', text: 'grandmother', gloss: '祖母・おばあさん', emoji: '👵', pos: 'noun', cefr: 'A1', eiken: '4', group: 't_family' },
  // t_visit
  { id: 'knock', text: 'knock', gloss: 'ノックする・たたく', emoji: '✊', pos: 'verb', cefr: 'A2', eiken: '準2', group: 't_visit' },
  { id: 'twice', text: 'twice', gloss: '2回', emoji: '✌️', pos: 'adv', cefr: 'A2', eiken: '3', group: 't_visit' },
  { id: 'time', text: 'time', forms: ['times'], gloss: '〜回（回数）', emoji: '🔁', pos: 'noun', cefr: 'A1', eiken: '5', group: 't_visit' },
  { id: 'door', text: 'door', gloss: 'ドア・戸', emoji: '🚪', pos: 'noun', cefr: 'A1', eiken: '5', group: 't_visit' },
  { id: 'house', text: 'house', gloss: '家（建物）', emoji: '🏠', pos: 'noun', cefr: 'A1', eiken: '5', group: 't_visit' },
  // t_absent
  { id: 'if', text: 'if', gloss: 'もし〜なら', emoji: '🤔', pos: 'conj', cefr: 'A1', eiken: '4', group: 't_absent' },
  { id: 'nobody', text: 'nobody', gloss: '誰も〜ない', emoji: '🫥', pos: 'pron', cefr: 'A2', eiken: '3', group: 't_absent' },
  { id: 'home', text: 'home', gloss: '家に（在宅）', emoji: '🏡', pos: 'adv', cefr: 'A1', eiken: '5', group: 't_absent' },
  { id: 'leave', text: 'leave', gloss: '置いていく・残す', emoji: '📥', pos: 'verb', cefr: 'A1', eiken: '4', group: 't_absent' },
  { id: 'neighbour', text: 'neighbour', forms: ['neighbor'], gloss: '隣の人・近所の人', emoji: '🏘️', pos: 'noun', cefr: 'A2', eiken: '3', group: 't_absent' },
];

export const TOWN_PAGES: VerificationPage[] = [
  { id: 't_num3', labelJa: '数（三）', minEncounters: 2 },
  { id: 't_num4', labelJa: '数（四）', minEncounters: 2 },
  { id: 't_num5', labelJa: '数（五）', minEncounters: 2 },
  { id: 't_num6', labelJa: '数（六）', minEncounters: 2 },
  { id: 't_num7', labelJa: '数（七）', minEncounters: 1 },
  { id: 't_money', labelJa: '市場：お金' },
  { id: 't_price', labelJa: '市場：値段をきく' },
  { id: 't_when', labelJa: '市場：店先のことば' },
  { id: 't_state', labelJa: '市場：品の様子' },
  { id: 't_units', labelJa: '市場：入れもの' },
  { id: 't_colour', labelJa: '色', minEncounters: 2 },
  { id: 't_talk', labelJa: 'やりとり' },
  { id: 't_place1', labelJa: '町の場所（一）', minEncounters: 2 },
  { id: 't_place2', labelJa: '町の場所（二）', minEncounters: 2 },
  { id: 't_dir', labelJa: '位置' },
  { id: 't_clock', labelJa: '時間（一）' },
  { id: 't_order', labelJa: '時間（二）' },
  { id: 't_family', labelJa: '家族' },
  { id: 't_visit', labelJa: '訪ねる' },
  { id: 't_absent', labelJa: '留守のとき' },
];
