import type { LexEntry, VerificationPage } from '../../core/types';

/**
 * English words introduced by the town activities (market, deliveries).
 * Kept apart from the shop lexicon; merged in by src/content/index.ts.
 * `eiken` grades are approximate (英検 has no official list); CEFR is best-effort placement.
 *
 * Words the shop also uses (numbers 6–10 and tens, colours, family, today, before/after …) live
 * only in the shop lexicon (lexicon.ts / lexicon2.ts); town texts use the same ids. A few town
 * words join shop 検証ページ (we → g10b, blue → g18a, o'clock → g13c, grandmother → g11a).
 * `right_side` (右) shares its surface with the shop's `right` (正しい): town texts always write
 * `{right|right_side}`.
 */
export const TOWN_LEXICON: LexEntry[] = [
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
  // t_num7 — 60–90 (20–50 and hundred are the shop page g12b)
  { id: 'sixty', text: 'sixty', gloss: '60', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num7' },
  { id: 'seventy', text: 'seventy', gloss: '70', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num7' },
  { id: 'eighty', text: 'eighty', gloss: '80', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num7' },
  { id: 'ninety', text: 'ninety', gloss: '90', pos: 'num', cefr: 'A1', eiken: '5', group: 't_num7' },
  // t_market
  { id: 'coin', text: 'coin', forms: ['coins'], gloss: '硬貨（コイン）', emoji: '🪙', pos: 'noun', cefr: 'A2', eiken: '3', group: 't_market' },
  { id: 'change', text: 'change', gloss: 'おつり', emoji: '💱', pos: 'noun', cefr: 'A2', eiken: '3', group: 't_market' },
  { id: 'stall', text: 'stall', forms: ['stalls'], gloss: '屋台・売り場', emoji: '⛺', pos: 'noun', cefr: 'B2', eiken: '準1', group: 't_market' },
  { id: 'fresh', text: 'fresh', gloss: '新鮮な', emoji: '✨', pos: 'adj', cefr: 'A2', eiken: '3', group: 't_market' },
  { id: 'old', text: 'old', gloss: '古い', emoji: '🥀', pos: 'adj', cefr: 'A1', eiken: '5', group: 't_market' },
  // t_units
  { id: 'bunch', text: 'bunch', forms: ['bunches'], gloss: '束（ひと束）', emoji: '💐', pos: 'noun', cefr: 'B1', eiken: '準2', group: 't_units' },
  { id: 'bag', text: 'bag', forms: ['bags'], gloss: '袋（ひと袋）', emoji: '🛍️', pos: 'noun', cefr: 'A1', eiken: '5', group: 't_units' },
  { id: 'jar', text: 'jar', forms: ['jars'], gloss: 'びん（広口のつぼ・ひとびん）', emoji: '🫙', pos: 'noun', cefr: 'B1', eiken: '2', group: 't_units' },
  { id: 'bottle', text: 'bottle', forms: ['bottles'], gloss: 'ボトル（細口のびん）', emoji: '🍼', pos: 'noun', cefr: 'A2', eiken: '3', group: 't_units' },
  // in shop pages
  { id: 'we', text: 'we', gloss: '私たち', emoji: '👥', pos: 'pron', cefr: 'A1', eiken: '5', group: 'g10b' },
  { id: 'blue', text: 'blue', gloss: '青い', emoji: '🟦', pos: 'adj', cefr: 'A1', eiken: '5', group: 'g18a' },
  { id: 'oclock', text: "o'clock", gloss: '〜時（ちょうど）', emoji: '🕒', pos: 'adv', cefr: 'A1', eiken: '5', group: 'g13c' },
  { id: 'grandmother', text: 'grandmother', gloss: '祖母・おばあさん', emoji: '👵', pos: 'noun', cefr: 'A1', eiken: '4', group: 'g11a' },

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
  { id: 'right_side', text: 'right', gloss: '右・右側', emoji: '➡️', pos: 'noun', cefr: 'A1', eiken: '5', group: 't_dir' },
  // t_visit
  { id: 'knock', text: 'knock', gloss: 'ノックする・たたく', emoji: '✊', pos: 'verb', cefr: 'A2', eiken: '準2', group: 't_visit' },
  { id: 'twice', text: 'twice', gloss: '2回', emoji: '✌️', pos: 'adv', cefr: 'A2', eiken: '3', group: 't_visit' },
  { id: 'door', text: 'door', gloss: 'ドア・戸', emoji: '🚪', pos: 'noun', cefr: 'A1', eiken: '5', group: 't_visit' },
  { id: 'house', text: 'house', gloss: '家（建物）', emoji: '🏠', pos: 'noun', cefr: 'A1', eiken: '5', group: 't_visit' },
  // t_absent (+ the shop word home)
  { id: 'nobody', text: 'nobody', gloss: '誰も〜ない', emoji: '🫥', pos: 'pron', cefr: 'A2', eiken: '3', group: 't_absent' },
  { id: 'leave', text: 'leave', gloss: '置いていく・残す', emoji: '📥', pos: 'verb', cefr: 'A1', eiken: '4', group: 't_absent' },
  { id: 'neighbour', text: 'neighbour', forms: ['neighbor'], gloss: '隣の人・近所の人', emoji: '🏘️', pos: 'noun', cefr: 'A2', eiken: '3', group: 't_absent' },
];

export const TOWN_PAGES: VerificationPage[] = [
  { id: 't_num4', labelJa: '数（四）', minEncounters: 2 },
  { id: 't_num5', labelJa: '数（五）', minEncounters: 2 },
  { id: 't_num7', labelJa: '大きな数（二）', minEncounters: 1 },
  { id: 't_market', labelJa: '市場のことば' },
  { id: 't_units', labelJa: '市場：入れもの' },
  { id: 't_place1', labelJa: '町の場所（一）', minEncounters: 2 },
  { id: 't_place2', labelJa: '町の場所（二）', minEncounters: 2 },
  { id: 't_dir', labelJa: '位置' },
  { id: 't_visit', labelJa: '訪ねる' },
  { id: 't_absent', labelJa: '留守のとき' },
];
