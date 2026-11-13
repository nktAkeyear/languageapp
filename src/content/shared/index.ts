import type { RecipeDef, SharedContent, StageDef } from '../../core/types';
import { INGREDIENTS } from './ingredients';

/** Language-neutral recipes. Names and book pages live in each language's content. */
export const RECIPES: RecipeDef[] = [
  {
    id: 'ginger_honey',
    stage: 7,
    symptoms: ['cold'],
    rule: { require: [{ ing: 'ginger', min: 2, max: 3 }, { ing: 'honey', min: 1, max: 2 }], temp: 'hot' },
  },
  {
    id: 'honey_lemon',
    stage: 7,
    symptoms: ['sore_throat'],
    rule: { require: [{ ing: 'honey', min: 1, max: 2 }, { ing: 'lemon', min: 1, max: 2 }], temp: 'hot' },
  },
  {
    id: 'mint_green',
    stage: 8,
    symptoms: ['tired'],
    rule: { require: [{ ing: 'green_tea', min: 1, max: 1 }, { ing: 'mint', min: 2, max: 3 }], allow: ['ice'], temp: 'cold' },
  },
  {
    id: 'chrysanthemum_dates',
    stage: 8,
    symptoms: ['insomnia'],
    rule: {
      require: [{ ing: 'chrysanthemum', min: 2, max: 3 }, { ing: 'red_dates', min: 2, max: 3 }],
      forbidTag: ['tea'],
      temp: 'hot',
    },
  },
  {
    id: 'ginger_dates',
    stage: 9,
    symptoms: ['cold'],
    rule: { require: [{ ing: 'ginger', min: 3, max: 3 }, { ing: 'red_dates', min: 2, max: 2 }], temp: 'hot', method: 'boil' },
  },
  {
    id: 'cinnamon_milk_tea',
    stage: 9,
    rule: {
      require: [
        { ing: 'black_tea', min: 1, max: 1 },
        { ing: 'milk', min: 1, max: 2 },
        { ing: 'cinnamon', min: 1, max: 1 },
      ],
      allowTag: ['sweet'],
      temp: 'hot',
      method: 'stir',
    },
  },
  {
    id: 'chrysanthemum_green',
    stage: 9,
    rule: { require: [{ ing: 'green_tea', min: 1, max: 1 }, { ing: 'chrysanthemum', min: 2, max: 3 }], temp: 'hot', method: 'steep' },
  },
];

/**
 * Unlock schedule. Stages open when day >= minDay and reputation >= minReputation,
 * or anyway `graceDays` after minDay (no hard gates).
 */
export const STAGES: StageDef[] = [
  { stage: 1, minDay: 1, minReputation: 0, ingredients: ['lemon', 'ginger', 'mint', 'honey'], customersPerDay: 4, newWordsPerDay: 8, noteJa: '店を開けた。棚には四つの品。' },
  { stage: 2, minDay: 2, minReputation: 2, ingredients: [], customersPerDay: 5, newWordsPerDay: 6, noteJa: 'お客さんが分量を気にし始めたようだ。レシピ帳に新しいページ。' },
  { stage: 3, minDay: 3, minReputation: 6, ingredients: ['water', 'ice'], features: ['temperature'], customersPerDay: 5, newWordsPerDay: 6, noteJa: '温度を選べるようになった。棚に二品追加。' },
  { stage: 4, minDay: 4, minReputation: 10, ingredients: ['sugar'], customersPerDay: 5, newWordsPerDay: 5, noteJa: '棚に新しい品。注文が少し長くなってきた。' },
  { stage: 5, minDay: 5, minReputation: 15, ingredients: ['green_tea'], features: ['audioOnly'], customersPerDay: 6, newWordsPerDay: 5, noteJa: '声だけで注文する常連が来るようになった。' },
  { stage: 6, minDay: 6, minReputation: 20, ingredients: ['salt', 'black_tea'], customersPerDay: 6, newWordsPerDay: 5, noteJa: '味の好みを言うお客さんが増えた。' },
  { stage: 7, minDay: 7, minReputation: 26, ingredients: [], customersPerDay: 6, newWordsPerDay: 6, noteJa: '体調の悪いお客さんが訪ねてくる。レシピ帳を確かめよう。' },
  { stage: 8, minDay: 8, minReputation: 32, ingredients: ['red_dates', 'chrysanthemum'], customersPerDay: 6, newWordsPerDay: 6, noteJa: '棚に新しい品。レシピ帳にもページが増えた。' },
  { stage: 9, minDay: 9, minReputation: 38, ingredients: ['milk', 'cinnamon'], features: ['method'], customersPerDay: 6, newWordsPerDay: 6, noteJa: '淹れ方（作り方）を選べるようになった。' },
  { stage: 10, minDay: 10, minReputation: 45, ingredients: [], customersPerDay: 7, newWordsPerDay: 4, noteJa: '店の評判が港に広まってきた。' },
];

export const SHARED: SharedContent = {
  ingredients: INGREDIENTS,
  recipes: RECIPES,
  stages: STAGES,
  graceDays: 3,
};
