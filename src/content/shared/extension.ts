/**
 * Shared (language-neutral) content for stages 10+: new shelf items, recipes, stage unlocks.
 *
 * NOTE: `IngredientId` and `SymptomId` in core/types.ts are closed unions that this content
 * extends. Until the unions are widened there, new ids go through `ing()` / `sym()` casts.
 * (Once the ids are added to the unions the helpers can be deleted: they only change types.)
 */
import type { IngredientDef, IngredientId, RecipeDef, StageDef, SymptomId } from '../../core/types';

export const ing = (id: string): IngredientId => id as IngredientId;
export const sym = (id: string): SymptomId => id as SymptomId;

export const NEW_INGREDIENTS: IngredientDef[] = [
  { id: ing('apple'), icon: { emoji: '🍎' }, tags: ['sweet'], maxCount: 5, qtyOrderable: true },
  { id: ing('banana'), icon: { emoji: '🍌' }, tags: ['sweet'], maxCount: 3, qtyOrderable: true },
  { id: ing('watermelon'), icon: { emoji: '🍉' }, tags: ['sweet', 'cooling'], maxCount: 5, qtyOrderable: true, coldOnly: true },
  { id: ing('pear'), icon: { emoji: '🍐' }, tags: ['sweet'], maxCount: 3, qtyOrderable: true },
  { id: ing('rose'), icon: { emoji: '🌹' }, tags: ['floral'], maxCount: 5, qtyOrderable: true },
  { id: ing('coffee'), icon: { emoji: '☕' }, tags: ['bitter'], maxCount: 3, qtyOrderable: true },
  { id: ing('yogurt'), icon: { emoji: '🥣' }, tags: ['dairy'], maxCount: 3, qtyOrderable: false, coldOnly: true },
];

/** Recipes. Each symptom maps to exactly one recipe (so a symptom sentence has one right answer). */
export const NEW_RECIPES: RecipeDef[] = [
  {
    id: 'apple_tea',
    stage: 10,
    rule: {
      require: [{ ing: ing('apple'), min: 2, max: 3 }, { ing: 'black_tea', min: 1, max: 1 }],
      allow: ['cinnamon', 'honey'],
      temp: 'hot',
    },
  },
  {
    id: 'banana_milk',
    stage: 11,
    rule: {
      require: [{ ing: ing('banana'), min: 1, max: 2 }, { ing: 'milk', min: 1, max: 2 }],
      allowTag: ['sweet'],
      allow: ['ice'],
      forbidTag: ['tea'],
      temp: 'cold',
    },
  },
  {
    id: 'honey_milk',
    stage: 13,
    rule: { require: [{ ing: 'milk', min: 1, max: 2 }, { ing: 'honey', min: 1, max: 2 }], forbidTag: ['tea'], temp: 'hot' },
  },
  {
    id: 'watermelon_mint',
    stage: 16,
    symptoms: [sym('thirsty')],
    rule: {
      require: [{ ing: ing('watermelon'), min: 2, max: 3 }, { ing: 'mint', min: 2, max: 3 }],
      allow: ['ice'],
      temp: 'cold',
    },
  },
  {
    id: 'pear_honey',
    stage: 15,
    symptoms: [sym('cough')],
    rule: { require: [{ ing: ing('pear'), min: 1, max: 2 }, { ing: 'honey', min: 1, max: 2 }], temp: 'hot', method: 'boil' },
  },
  {
    id: 'ginger_water',
    stage: 15,
    symptoms: [sym('stomachache')],
    rule: { require: [{ ing: 'ginger', min: 1, max: 2 }, { ing: 'water', min: 1, max: 2 }], forbidTag: ['cooling'], temp: 'hot' },
  },
  {
    id: 'mint_chrysanthemum',
    stage: 15,
    symptoms: [sym('headache')],
    rule: {
      require: [{ ing: 'mint', min: 2, max: 3 }, { ing: 'chrysanthemum', min: 2, max: 3 }],
      allow: ['ice'],
      temp: 'cold',
    },
  },
  {
    id: 'rose_tea',
    stage: 18,
    rule: { require: [{ ing: ing('rose'), min: 2, max: 3 }, { ing: 'black_tea', min: 1, max: 1 }], temp: 'hot', method: 'steep' },
  },
  {
    id: 'coffee_milk',
    stage: 19,
    rule: {
      require: [{ ing: ing('coffee'), min: 1, max: 1 }, { ing: 'milk', min: 1, max: 2 }],
      allowTag: ['sweet'],
      temp: 'hot',
      method: 'stir',
    },
  },
  {
    id: 'apple_yogurt',
    stage: 20,
    rule: {
      require: [{ ing: ing('yogurt'), min: 1, max: 1 }, { ing: ing('apple'), min: 1, max: 2 }],
      allow: ['honey', 'ice'],
      temp: 'cold',
    },
  },
];

/**
 * Unlock schedule for stages 8+ (earlier stages keep their definitions in index.ts but are
 * re-paced there). One stage roughly every two days from stage 8 on.
 */
const S = (
  stage: number,
  minDay: number,
  ingredients: IngredientId[],
  newWordsPerDay: number,
  noteJa: string,
  customersPerDay = 8,
): StageDef => ({ stage, minDay, minReputation: Math.max(0, Math.round(5 * (minDay - 1))), ingredients, customersPerDay, newWordsPerDay, noteJa });

export const NEW_STAGES: StageDef[] = [
  S(10, 13, [ing('apple')], 7, '常連さんが挨拶を交わしてくれるようになった。棚に赤い果物が一つ。'),
  S(11, 15, [ing('banana')], 6, '家族のために注文するお客さんが増えた。レシピ帳に注意書きが載っている。'),
  S(12, 17, [], 7, '大きな数や「少し・たくさん」を言うお客さんが来る。'),
  S(13, 19, [], 7, '時間帯や日にちを言うお客さんが増えた。'),
  S(14, 21, [ing('watermelon')], 7, '季節が変わり、天気の話題が増えた。棚に新しい果物。'),
  S(15, 23, [ing('pear')], 8, '体の具合を訴えるお客さんがさらに増えた。レシピ帳を確かめよう。'),
  S(16, 25, [], 8, 'お客さんが気持ちを話してくれるようになった。'),
  S(17, 27, [], 6, '体質や好みをはっきり伝えるお客さんが来る。聞き逃さないように。'),
  S(18, 29, [ing('rose')], 7, '色や濃さ・くらべ方にこだわるお客さんが来る。棚に花がもう一つ。'),
  S(19, 31, [ing('coffee')], 7, '仕事帰りのお客さんが増えた。棚に新しい品。'),
  S(20, 33, [ing('yogurt')], 6, '質問をするお客さんが増えた。レシピ帳を引いて答えよう。'),
  S(21, 35, [], 7, '理由や条件を話すお客さんが増えた。話をよく聞こう。'),
  S(22, 37, [], 6, 'いつもの習慣やお金の話をするお客さんが来る。'),
  S(23, 39, [], 8, '店は港町の定番になった。常連さんの感想も増えてきた。'),
];
