import type { JobContent, JobDef } from '../../jobs/types';

/**
 * Harbour kitchen (港の食堂): make-to-order (put the dish together from the pantry to what the
 * diner says: things and how many, the dish, fried / boiled / grilled, "no onions", an allergy) +
 * sort & route (the morning's delivery: read each crate's label and put it in the cold box, on the
 * shelf or in the basket). Domains: food, cooking, health. Rank 1 ≈ 英検4級, 2 ≈ 3級, 3 ≈ 準2級.
 */
type G = '5' | '4' | '3' | '準2' | '2';
const W = (id: string, text: string, gloss: string, eiken: G, group: string, emoji: string, forms?: string[], pos: 'noun' | 'verb' = 'noun') => ({
  id,
  text,
  gloss,
  pos,
  eiken,
  cefr: (eiken === '5' || eiken === '4' ? 'A1' : eiken === '3' ? 'A2' : 'B1') as 'A1' | 'A2' | 'B1',
  group,
  emoji,
  ...(forms ? { forms } : {}),
});

const EN: JobContent = {
  sign: 'Harbour Kitchen',
  lexicon: [
    W('egg', 'egg', '卵', '5', 'jk_main', '🥚', ['eggs']),
    W('fish', 'fish', '魚', '5', 'jk_main', '🐟', ['fishes']),
    W('chicken', 'chicken', '鶏肉（とり肉）', '4', 'jk_main', '🍗'),
    W('sausage', 'sausage', 'ソーセージ', '準2', 'jk_main', '🌭', ['sausages']),
    W('bread', 'bread', 'パン', '4', 'jk_side', '🍞'),
    W('rice', 'rice', 'ごはん（米）', '4', 'jk_side', '🍚'),
    W('potato', 'potato', 'じゃがいも', '4', 'jk_side', '🥔', ['potatoes']),
    W('cheese', 'cheese', 'チーズ', '4', 'jk_side', '🧀'),
    W('tomato', 'tomato', 'トマト', '4', 'jk_veg', '🍅', ['tomatoes']),
    W('onion', 'onion', '玉ねぎ', '3', 'jk_veg', '🧅', ['onions']),
    W('carrot', 'carrot', 'にんじん', '準2', 'jk_veg', '🥕', ['carrots']),
    W('food', 'food', '食べ物', '5', 'jk_veg', '🍽️'),
    W('kitchen', 'kitchen', '台所・調理場', '4', 'jk_dish', '🍳', ['kitchens']),
    W('plate', 'plate', '平皿', '3', 'jk_dish', '🍽️', ['plates']),
    W('bowl', 'bowl', '鉢（ボウル）', '4', 'jk_dish', '🥣', ['bowls']),
    W('piece', 'piece', 'ひと切れ・1個', '3', 'jk_dish', '🧩', ['pieces']),
    W('fry', 'fry', '油で焼く・揚げる', '3', 'jk_cook', '🍳', ['fried', 'fries', 'frying'], 'verb'),
    W('grill', 'grill', '網で焼く', '2', 'jk_cook', '🔥', ['grilled', 'grills'], 'verb'),
    W('basket', 'basket', 'かご', '3', 'jk_cook', '🧺', ['baskets']),
  ],
  pages: [
    { id: 'jk_main', labelJa: '食堂のおかず' },
    { id: 'jk_side', labelJa: '主食とつけ合わせ' },
    { id: 'jk_veg', labelJa: '野菜の木箱' },
    { id: 'jk_dish', labelJa: '台所の器' },
    { id: 'jk_cook', labelJa: '料理長のやり方' },
  ],
  forms: { boil: ['boiled', 'boils'], is: ['be'] },
  people: [
    { id: 'p_chef', name: 'Chef Basil', avatar: '👩‍🍳' },
    { id: 'c_docker', name: '', avatar: '' },
    { id: 'c_cook', name: '', avatar: '' },
    { id: 'c_sailor', name: '', avatar: '' },
    { id: 'c_boy', name: '', avatar: '' },
    { id: 'c_scholar', name: '', avatar: '' },
    { id: 'p_ivy', name: 'Ivy', avatar: '👩' },
  ],
  boss: 'p_chef',
  things: [
    { id: 'k_egg', word: 'egg', art: 'egg', tags: ['main'], max: 3, bin: 'cold' },
    { id: 'k_fish', word: 'fish', art: 'fish', tags: ['main'], plural: 'fish', max: 2, bin: 'cold' },
    { id: 'k_chicken', word: 'chicken', art: 'chicken', tags: ['main'], unit: '{n} pieces of chicken', plural: 'chicken', max: 2, bin: 'cold' },
    { id: 'k_sausage', word: 'sausage', art: 'sausage', tags: ['main'], max: 3, bin: 'cold' },
    { id: 'k_bread', word: 'bread', art: 'bread', tags: ['side'], unit: '{n} slices of bread', plural: 'bread', max: 3, bin: 'shelf' },
    { id: 'k_rice', word: 'rice', art: 'rice', tags: ['side'], unit: '{n} spoons of rice', plural: 'rice', max: 2, bin: 'shelf' },
    { id: 'k_potato', word: 'potato', art: 'potato', tags: ['side', 'veg'], plural: 'potatoes', max: 3, bin: 'basket' },
    { id: 'k_cheese', word: 'cheese', art: 'cheese', tags: ['side'], unit: '{n} slices of cheese', plural: 'cheese', max: 2, bin: 'cold' },
    { id: 'k_tomato', word: 'tomato', art: 'tomato', tags: ['veg'], plural: 'tomatoes', max: 3, bin: 'basket' },
    { id: 'k_onion', word: 'onion', art: 'onion', tags: ['veg'], max: 2, bin: 'basket' },
    { id: 'k_carrot', word: 'carrot', art: 'carrot', tags: ['veg'], max: 3, bin: 'basket' },
    { id: 'k_milk', word: 'milk', art: 'milk', tags: ['delivery'], plural: 'milk', bin: 'cold' },
    { id: 'k_apple', word: 'apple', art: 'apple', tags: ['delivery'], bin: 'basket' },
  ],
  make: {
    max: 4,
    vessels: [
      { id: 'plate', word: 'plate', art: 'plate' },
      { id: 'bowl', word: 'bowl', art: 'bowl' },
      { id: 'box', word: 'box', art: 'lunchbox' },
    ],
    methods: [
      { id: 'fry', word: 'fry', art: 'pan', surface: 'fried' },
      { id: 'boil', word: 'boil', art: 'pot', surface: 'boiled' },
      { id: 'grill', word: 'grill', art: 'grill', surface: 'grilled' },
    ],
  },
  sort: {
    item: 'food',
    bins: [
      { id: 'cold', label: 'Cold box', ref: 'the cold box', art: 'fridge' },
      { id: 'shelf', label: 'Shelf', ref: 'the shelf', art: 'shelf' },
      { id: 'basket', label: 'Basket', ref: 'the basket', art: 'basket' },
    ],
  },
  tasks: [
    // --- rank 1
    { id: 'k1_eggs', rank: 1, seq: 1, arch: 'make', person: 'c_docker', say: 'Two eggs and bread, please.', want: [{ thing: 'k_egg', n: 2 }, { thing: 'k_bread', min: 1, max: 3 }], grammar: ['gr-5-006'] },
    {
      id: 'k1_crates',
      rank: 1,
      seq: 2,
      arch: 'sort',
      say: 'The food is here. Put the boxes in the cold box, on the shelf or in the basket.',
      bins: ['cold', 'shelf', 'basket'],
      items: [
        { id: 'a', text: 'Fish', thing: 'k_fish', bin: 'cold' },
        { id: 'b', text: 'Rice', thing: 'k_rice', bin: 'shelf' },
        { id: 'c', text: 'Potatoes', thing: 'k_potato', bin: 'basket' },
        { id: 'd', text: 'Milk', thing: 'k_milk', bin: 'cold' },
      ],
    },
    { id: 'k1_nora', rank: 1, seq: 3, arch: 'make', person: 'c_cook', say: 'Fish and rice, please. I am hungry!', want: [{ thing: 'k_fish', min: 1, max: 2 }, { thing: 'k_rice', min: 1, max: 2 }] },
    // --- rank 2: how it is cooked, the dish, "no …"
    { id: 'k2_fried', rank: 2, seq: 1, arch: 'make', person: 'c_sailor', say: 'Fried fish and two potatoes in a bowl, please.', want: [{ thing: 'k_fish', min: 1, max: 2 }, { thing: 'k_potato', n: 2 }], method: 'fry', vessel: 'bowl' },
    { id: 'k2_noonion', rank: 2, seq: 2, arch: 'make', person: 'c_boy', say: 'Chicken and rice, please. No onions!', want: [{ thing: 'k_chicken', min: 1, max: 2 }, { thing: 'k_rice', min: 1, max: 2 }], forbid: ['k_onion'] },
    // --- rank 3: allergies, heard-only orders, lunch boxes
    { id: 'k3_allergy', rank: 3, seq: 1, arch: 'make', person: 'c_scholar', say: "I can't eat eggs. Grilled fish and potatoes, please.", want: [{ thing: 'k_fish', min: 1, max: 2 }, { thing: 'k_potato', min: 1, max: 3 }], forbid: ['k_egg'], method: 'grill', grammar: ['gr-5-015'] },
    { id: 'k3_box', rank: 3, seq: 2, arch: 'make', person: 'p_ivy', features: ['audioOnly'], say: 'Three slices of bread with cheese, and a tomato. In a box, please.', want: [{ thing: 'k_bread', n: 3 }, { thing: 'k_cheese', min: 1, max: 2 }, { thing: 'k_tomato', n: 1 }], vessel: 'box' },
  ],
  templates: [
    { id: 'kt_qty', rank: 1, arch: 'make', say: '{Qty1}, please.', slots: { qty1: { kind: 'qty', tags: ['main', 'side'], min: 1, max: 3 } } },
    { id: 'kt_and', rank: 1, arch: 'make', say: '{Thing1} and {thing2}, please.', slots: { thing1: { kind: 'thing', tags: ['main'] }, thing2: { kind: 'thing', tags: ['side'] } } },
    { id: 'kt_qtyand', rank: 1, arch: 'make', say: '{Qty1} and {thing2}, please.', slots: { qty1: { kind: 'qty', tags: ['main'], min: 1, max: 3 }, thing2: { kind: 'thing', tags: ['side', 'veg'] } } },
    { id: 'kt_sort1', rank: 1, arch: 'sort', say: 'More food. Put it in, please.', count: [3, 4], bins: ['cold', 'shelf', 'basket'], patterns: [{ text: '{Thing}' }] },
    { id: 'kt_method', rank: 2, arch: 'make', say: '{Method} {thing1} and {thing2}, please.', slots: { method: { kind: 'method' }, thing1: { kind: 'thing', tags: ['main'] }, thing2: { kind: 'thing', tags: ['side', 'veg'] } } },
    { id: 'kt_vessel', rank: 2, arch: 'make', say: '{Qty1} and {thing2} in a {vessel}, please.', slots: { qty1: { kind: 'qty', tags: ['main', 'veg'], min: 1, max: 3 }, thing2: { kind: 'thing', tags: ['side'] }, vessel: { kind: 'vessel' } } },
    { id: 'kt_no', rank: 2, arch: 'make', say: '{Thing1} with {thing2}. No {forbid}, please.', slots: { thing1: { kind: 'thing', tags: ['main'] }, thing2: { kind: 'thing', tags: ['side'] }, forbid: { kind: 'forbid', tags: ['veg'] } } },
    { id: 'kt_sort2', rank: 2, arch: 'sort', say: 'A big delivery today!', count: [4, 5], bins: ['cold', 'shelf', 'basket'], patterns: [{ text: 'A box of {thing}' }, { text: 'Fresh {thing}' }, { text: '{Thing}' }] },
    { id: 'kt_cant', rank: 3, arch: 'make', features: ['audioOnly'], say: "I can't eat {forbid}. {Thing1} and {thing2}, please.", slots: { forbid: { kind: 'forbid', tags: ['main', 'veg'] }, thing1: { kind: 'thing', tags: ['main'] }, thing2: { kind: 'thing', tags: ['side'] } }, grammar: ['gr-5-015'] },
    { id: 'kt_long', rank: 3, arch: 'make', say: '{Method} {thing1}, {qty2} and {thing3}. No {forbid}, please.', slots: { method: { kind: 'method' }, thing1: { kind: 'thing', tags: ['main'] }, qty2: { kind: 'qty', tags: ['veg'], min: 1, max: 3 }, thing3: { kind: 'thing', tags: ['side'] }, forbid: { kind: 'forbid', tags: ['veg'] } } },
  ],
  reactions: [
    { id: 'kr_ok1', kind: 'perfect', arch: 'make', text: 'Delicious! Thank you.', face: 'delighted' },
    { id: 'kr_ok2', kind: 'perfect', arch: 'make', text: 'This is perfect!', face: 'happy' },
    { id: 'kr_ok3', kind: 'perfect', arch: 'sort', text: 'Good job!', face: 'happy' },
    { id: 'kr_minor', kind: 'minor', arch: 'make', text: 'Good. But it is a little different.', face: 'neutral' },
    { id: 'kr_minor2', kind: 'minor', arch: 'sort', text: 'Good. But one box is wrong.', face: 'neutral' },
    { id: 'kr_empty', kind: 'empty', text: 'Where is my food?', face: 'puzzled' },
    { id: 'kr_missing', kind: 'missing', text: 'Where is the {thing}?', face: 'puzzled' },
    { id: 'kr_extra', kind: 'extra', text: 'Oh, no {thing} for me, please.', face: 'puzzled' },
    { id: 'kr_much', kind: 'too_much', text: 'This is too much {thing}!', face: 'puzzled' },
    { id: 'kr_little', kind: 'too_little', text: 'I want more {thing}, please.', face: 'sad' },
    { id: 'kr_method', kind: 'wrong_method', text: 'No, no. Not like this.', face: 'puzzled' },
    { id: 'kr_vessel', kind: 'wrong_vessel', text: 'I wanted a {vessel}.', face: 'neutral' },
    { id: 'kr_forbid', kind: 'forbidden', text: "Oh no! {Thing}! I can't eat it.", face: 'angry' },
    { id: 'kr_bin', kind: 'wrong_bin', text: 'No. This box goes in “{bin}”.', face: 'puzzled' },
    { id: 'kr_fail', kind: 'any_fail', text: 'Oh no. That is wrong.', face: 'sad' },
  ],
  lines: [
    { id: 'kl_s1', kind: 'start', text: 'Hello! We have a lot of hungry customers today.' },
    { id: 'kl_s2', kind: 'start', text: 'Good morning! The kitchen is open.' },
    { id: 'kl_e1', kind: 'end', text: 'Thank you! Take some bread home.' },
    { id: 'kl_e2', kind: 'end', text: 'Good work. See you tomorrow!' },
  ],
};

export const KITCHEN_JOB: JobDef = {
  id: 'kitchen',
  nameJa: '港の食堂',
  blurbJa: '港の食堂の調理場。お客さんの注文どおりに料理を盛りつけ（数・焼き方・器・苦手なもの）、朝は届いた食材を読んで冷蔵箱・棚・かごに片づける。食べ物・料理の言葉。',
  icon: '🍳',
  domains: ['food', 'cooking', 'health', 'shopping'],
  archetypes: ['make', 'sort'],
  ranks: [
    { rank: 1, need: { good: 0, words: 0 }, level: { eiken: '4', toeic: null }, tasks: 4, noteJa: '料理の名前と数（卵ふたつ・パン）。届いた木箱を三つの置き場に。' },
    { rank: 2, need: { good: 8, words: 10 }, level: { eiken: '3', toeic: null }, unlocks: ['long'], tasks: 5, reward: { coins: 10 }, noteJa: '焼き方（fried / boiled / grilled）・器・「〜はなし」。木箱が多めに。' },
    { rank: 3, need: { good: 20, words: 18 }, level: { eiken: 'pre2', toeic: 400 }, unlocks: ['audioOnly', 'timed'], tasks: 5, reward: { coins: 15 }, noteJa: '食べられないもの（出したら大失敗）。長い注文。耳だけの注文。時間制限（選んだときだけ）。' },
    { rank: 4, need: { good: 40, words: 19 }, level: { eiken: '2', toeic: 500 }, tasks: 6, reward: { coins: 25 }, noteJa: 'この先の新しい内容は準備中（献立表・レシピの手順・仕入れの注文を予定）。' },
  ],
  wage: { perfect: 2, minor: 1, fail: 0, bad: 0 },
  opensAfter: 1,
  building: 'kitchen',
  links: { produce: [{ good: 'bread', perPerfect: 1 }], use: [{ good: 'menus', bonus: 1, line: 'And here is breakfast for the inn.' }] },
  content: { en: EN },
  flavour: 'school',
};
