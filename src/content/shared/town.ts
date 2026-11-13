import type { TownShared } from '../../core/townTypes';

/**
 * Language-neutral data for the town activities. Words and sentences live in
 * src/content/{en,zh}/market.ts and delivery.ts.
 *
 * Unlocks are keyed on day + reputation (with a grace period), never on shop stage numbers,
 * so the shop's stage list can grow independently.
 */
export const TOWN_SHARED: TownShared = {
  market: {
    // Around shop stages 4–5 in the Phase 1 schedule: numbers 1–5 and "and / please" are familiar.
    unlock: {
      minDay: 5,
      minReputation: 15,
      graceDays: 3,
      chance: 0.55,
      maxGap: 2,
      noteJa: '朝、市場へ買い出しに行けるようになった。棚の品が切れている日は、メモを見て買ってこよう。',
    },
    levels: [
      { level: 1, minRuns: 0, maxItems: 1, features: [] },
      { level: 2, minRuns: 2, maxItems: 2, features: ['change', 'soldOut'], noteJa: '市場の店主たちが、おつりを渡してくれるようになった。品切れの日もあるらしい。' },
      { level: 3, minRuns: 5, maxItems: 2, features: ['variants', 'cheaper', 'audioOnly'], noteJa: '市場の品に種類が増えた。値札をよく見比べよう。' },
      { level: 4, minRuns: 8, maxItems: 3, features: ['bargain'], noteJa: '顔なじみになった。値切ってみることもできそうだ。' },
    ],
    // portionsPerUnit = workbench portions per unit: slices per lemon, leaves per bunch, spoons per jar…
    goods: [
      { ingredient: 'lemon', portionsPerUnit: 3, price: 3, variants: ['fresh', 'old'], stalls: ['red', 'blue'] },
      { ingredient: 'ginger', portionsPerUnit: 6, price: 4, stalls: ['green', 'blue'] },
      { ingredient: 'mint', portionsPerUnit: 5, price: 4, variants: ['fresh', 'old'], stalls: ['green', 'blue'] },
      { ingredient: 'honey', portionsPerUnit: 5, price: 9, variants: ['small', 'big'], stalls: ['yellow', 'blue'] },
      { ingredient: 'sugar', portionsPerUnit: 8, price: 6, variants: ['small', 'big'], stalls: ['yellow'] },
      { ingredient: 'milk', portionsPerUnit: 3, price: 7, variants: ['fresh', 'old'], stalls: ['yellow', 'blue'] },
      { ingredient: 'red_dates', portionsPerUnit: 6, price: 8, stalls: ['red'] },
      { ingredient: 'chrysanthemum', portionsPerUnit: 6, price: 7, stalls: ['green'] },
    ],
    stalls: [
      { id: 'red', colour: 'red', vendor: '👨‍🌾', icon: '🍎' },
      { id: 'green', colour: 'green', vendor: '👴', icon: '🌿' },
      { id: 'yellow', colour: 'yellow', vendor: '👩', icon: '🍯' },
      { id: 'blue', colour: 'blue', vendor: '🧑', icon: '🧺' },
    ],
    variants: [
      { id: 'fresh', portionsMult: 1, priceMult: 1 },
      { id: 'old', portionsMult: 0.5, priceMult: 0.5 },
      { id: 'small', portionsMult: 1, priceMult: 1 },
      { id: 'big', portionsMult: 2, priceMult: 1.6 },
    ],
    coins: [1, 5, 10, 50],
    startMoney: 40,
    income: { perfect: 3, minor: 2, fail: 0, bad: 0 },
    changeLimit: 10,
  },

  delivery: {
    // Around shop stage 9 in the Phase 1 schedule (late A1).
    unlock: {
      minDay: 9,
      minReputation: 38,
      graceDays: 3,
      chance: 0.6,
      maxGap: 2,
      noteJa: '店を閉めたあと、お客さんから配達を頼まれるようになった。配達票と町の地図を見比べよう。',
    },
    levels: [
      { level: 1, minRuns: 0, features: [] },
      { level: 2, minRuns: 2, features: ['relations', 'clock'], noteJa: '配達票の行き先や時間が、少し細かくなってきた。' },
      { level: 3, minRuns: 4, features: ['person', 'knock', 'leftRight'], noteJa: '受け取る人やノックの仕方まで書かれた配達票が届くようになった。' },
      { level: 4, minRuns: 7, features: ['beforeAfter', 'avoid', 'absent'], noteJa: '留守のときのことまで書かれた配達票もある。' },
    ],
    cols: 6,
    rows: 4,
    // Rows 0–1: north of the main street (row 1 faces it); rows 2–3: south (row 2 faces it).
    map: [
      { id: 'h01', col: 0, row: 0, door: 'red' },
      { id: 'h02', col: 1, row: 0, door: 'blue' },
      { id: 'school', col: 2, row: 0, landmark: 'school' },
      { id: 'h03', col: 3, row: 0, door: 'green' },
      { id: 'h04', col: 4, row: 0, door: 'yellow' },
      { id: 'temple', col: 5, row: 0, landmark: 'temple' },
      { id: 'harbour', col: 0, row: 1, landmark: 'harbour' },
      { id: 'inn', col: 1, row: 1, landmark: 'inn' },
      { id: 'h05', col: 2, row: 1, door: 'yellow' },
      { id: 'bank', col: 3, row: 1, landmark: 'bank' },
      { id: 'h06', col: 4, row: 1, door: 'red' },
      { id: 'h07', col: 5, row: 1, door: 'blue' },
      { id: 'h08', col: 0, row: 2, door: 'green' },
      { id: 'h09', col: 1, row: 2, door: 'red' },
      { id: 'market', col: 2, row: 2, landmark: 'market' },
      { id: 'h10', col: 3, row: 2, door: 'blue' },
      { id: 'hospital', col: 4, row: 2, landmark: 'hospital' },
      { id: 'bridge', col: 5, row: 2, landmark: 'bridge' },
      { id: 'h11', col: 0, row: 3, door: 'blue' },
      { id: 'h12', col: 1, row: 3, door: 'yellow' },
      { id: 'h13', col: 2, row: 3, door: 'green' },
      { id: 'h14', col: 3, row: 3, door: 'red' },
      { id: 'h15', col: 4, row: 3, door: 'yellow' },
      { id: 'h16', col: 5, row: 3, door: 'green' },
    ],
    slots: [
      { hour: 9, period: 'morning' },
      { hour: 10, period: 'morning' },
      { hour: 11, period: 'morning' },
      { hour: 14, period: 'afternoon' },
      { hour: 15, period: 'afternoon' },
      { hour: 16, period: 'afternoon' },
      { hour: 18, period: 'evening' },
      { hour: 19, period: 'evening' },
    ],
    persons: [
      { id: 'mother', icon: '👩' },
      { id: 'father', icon: '👨' },
      { id: 'child', icon: '👧' },
      { id: 'grandmother', icon: '👵' },
    ],
    curriculum: [
      { id: 'd1_school', level: 1, seq: 1, dest: { rel: 'at', landmark: 'school' }, time: { kind: 'period', period: 'morning' } },
      { id: 'd1_hospital', level: 1, seq: 2, dest: { rel: 'at', landmark: 'hospital' }, time: { kind: 'period', period: 'afternoon' } },
      { id: 'd2_behind_bank', level: 2, seq: 1, dest: { rel: 'behind', landmark: 'bank' }, time: { kind: 'at', hour: 15 } },
      { id: 'd2_across_harbour', level: 2, seq: 2, dest: { rel: 'across', landmark: 'harbour' }, time: { kind: 'at', hour: 10 } },
      { id: 'd3_next_inn', level: 3, seq: 1, dest: { rel: 'next_to', landmark: 'inn' }, time: { kind: 'period', period: 'morning' }, give: 'mother', knocks: 2 },
      { id: 'd3_left_market', level: 3, seq: 2, dest: { rel: 'left', landmark: 'market' }, time: { kind: 'at', hour: 19 }, give: 'grandmother' },
      { id: 'd4_behind_hospital', level: 4, seq: 1, dest: { rel: 'behind', landmark: 'hospital' }, time: { kind: 'after', hour: 16 }, give: 'father', avoid: 'child', knocks: 3 },
      { id: 'd4_across_bridge', level: 4, seq: 2, dest: { rel: 'across', landmark: 'bridge' }, time: { kind: 'before', hour: 11 }, absent: 'door', home: false },
    ],
    tip: 4,
  },
};
