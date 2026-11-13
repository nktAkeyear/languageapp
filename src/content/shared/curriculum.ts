/**
 * Language-neutral skeleton of the stage 10+ curriculum: the rule, stage, customer and audio flag of every
 * authored order and the slot structure of every template. en/zh only supply the text
 * (`buildOrders` / `buildTemplates`), so both languages teach exactly the same puzzle in each position.
 */
import type { AuthoredOrder, IngredientId, OrderRule, OrderTemplate, SlotSpec } from '../../core/types';
import { RECIPES } from './index';
import { NEW_RECIPES } from './extension';

const A: IngredientId = 'apple';
const B: IngredientId = 'banana';
const W: IngredientId = 'watermelon';
const P: IngredientId = 'pear';
const R: IngredientId = 'rose';
const C: IngredientId = 'coffee';
const Y: IngredientId = 'yogurt';

const ALL_RECIPES = [...RECIPES, ...NEW_RECIPES];
const recipeRule = (id: string): OrderRule => {
  const r = ALL_RECIPES.find((x) => x.id === id);
  if (!r) throw new Error(`curriculum: unknown recipe ${id}`);
  return r.rule;
};

interface OrderSpec {
  id: string;
  stage: number;
  seq: number;
  customer?: string;
  audio?: true;
  rule?: OrderRule;
  recipe?: string;
}

const n = (ingId: IngredientId, min?: number, max?: number) => ({ ing: ingId, ...(min ? { min } : {}), ...(max ? { max } : {}) });

export const ORDER_SPECS: OrderSpec[] = [
  // --- stage 10: greetings, "you", apple
  { id: 'o10_hello', stage: 10, seq: 1, customer: 'c_sailor', rule: { require: [n(A)] } },
  { id: 'o10_three', stage: 10, seq: 2, customer: 'c_cook', rule: { require: [n(A, 3, 3)] } },
  { id: 'o10_tea', stage: 10, seq: 3, recipe: 'apple_tea' },
  { id: 'o10_friend', stage: 10, seq: 4, customer: 'c_grandma', recipe: 'apple_tea' },
  { id: 'o10_have', stage: 10, seq: 5, customer: 'c_merchant', rule: { require: [n(A, 2, 2)] } },
  { id: 'o10_audio', stage: 10, seq: 6, audio: true, recipe: 'apple_tea' },
  { id: 'o10_mint', stage: 10, seq: 7, customer: 'c_boy', rule: { require: [n(A), n('mint')], temp: 'cold' } },
  { id: 'o10_nocin', stage: 10, seq: 8, customer: 'c_docker', rule: { require: [n(A, 2, 3), n('black_tea', 1, 1)], forbid: ['cinnamon'], allow: ['honey'], temp: 'hot' } },

  // --- stage 11: family, banana
  { id: 'o11_banana', stage: 11, seq: 1, customer: 'c_boy', rule: { require: [n(B)] } },
  { id: 'o11_child', stage: 11, seq: 2, customer: 'c_mom', recipe: 'banana_milk' },
  { id: 'o11_husband', stage: 11, seq: 3, customer: 'c_grandma', recipe: 'ginger_honey' },
  { id: 'o11_mother', stage: 11, seq: 4, customer: 'c_merchant', recipe: 'honey_lemon' },
  { id: 'o11_father', stage: 11, seq: 5, customer: 'c_cook', audio: true, recipe: 'mint_green' },
  { id: 'o11_baby', stage: 11, seq: 6, customer: 'c_mom', rule: { ...recipeRule('banana_milk'), forbid: ['honey'] } },
  { id: 'o11_wife', stage: 11, seq: 7, customer: 'c_cook', rule: { require: [n('honey', 2, 2)] } },
  { id: 'o11_sibs', stage: 11, seq: 8, customer: 'c_boy', rule: { require: [n('water', 2, 2)], temp: 'cold' } },
  { id: 'o11_family', stage: 11, seq: 9, customer: 'c_scholar', rule: { require: [n('water', 3, 3)], temp: 'hot' } },
  { id: 'o11_sister', stage: 11, seq: 10, customer: 'c_grandma', audio: true, recipe: 'mint_green' },

  // --- stage 12: numbers to ten, amounts
  { id: 'o12_six', stage: 12, seq: 1, rule: { require: [n('mint', 6, 6)] } },
  { id: 'o12_eight', stage: 12, seq: 2, customer: 'c_boy', rule: { require: [n('ice', 8, 8), n('lemon', 1, 1)], temp: 'cold' } },
  { id: 'o12_sevennine', stage: 12, seq: 3, customer: 'c_girl', rule: { require: [n('mint', 7, 7), n('ice', 9, 9)], temp: 'cold' } },
  { id: 'o12_little', stage: 12, seq: 4, rule: { require: [n('honey', 1, 1)] } },
  { id: 'o12_lot', stage: 12, seq: 5, customer: 'c_boy', rule: { require: [n('mint', 4, 10)], temp: 'cold' } },
  { id: 'o12_only', stage: 12, seq: 6, customer: 'c_girl', rule: { require: [n('honey')], forbid: ['water'] } },
  { id: 'o12_some', stage: 12, seq: 7, customer: 'c_sailor', rule: { require: [n('mint', 10, 10), n('ice')], temp: 'cold' } },
  { id: 'o12_less', stage: 12, seq: 8, audio: true, rule: { require: [n('lemon'), n('honey', 1, 1)] } },
  { id: 'o12_big', stage: 12, seq: 9, customer: 'c_sailor', rule: { require: [n('water', 2, 3)], temp: 'cold' } },
  { id: 'o12_small', stage: 12, seq: 10, customer: 'c_grandma', rule: { require: [n('water', 1, 1)], temp: 'hot' } },
  { id: 'o12_both', stage: 12, seq: 11, customer: 'c_girl', rule: { require: [n('mint', 2, 2), n('lemon', 2, 2)], temp: 'hot' } },

  // --- stage 13: time of day, yesterday / today / tomorrow
  { id: 'o13_morning', stage: 13, seq: 1, customer: 'c_sailor', rule: { require: [n('green_tea')] } },
  { id: 'o13_yday', stage: 13, seq: 2, customer: 'c_scholar', rule: { require: [n('mint')], forbid: ['lemon'] } },
  { id: 'o13_today', stage: 13, seq: 3, customer: 'c_oldman', rule: { require: [n('honey')], forbid: ['ginger'] } },
  { id: 'o13_afternoon', stage: 13, seq: 4, customer: 'c_merchant', rule: { require: [n('mint')], temp: 'cold' } },
  { id: 'o13_sleep', stage: 13, seq: 5, customer: 'c_cook', recipe: 'honey_milk' },
  { id: 'o13_evening', stage: 13, seq: 6, customer: 'c_oldman', rule: { require: [n('milk')], forbidTag: ['tea'], temp: 'hot' } },
  { id: 'o13_now', stage: 13, seq: 7, customer: 'c_boy', audio: true, rule: { require: [n('water')], temp: 'hot' } },
  { id: 'o13_habit', stage: 13, seq: 8, customer: 'c_sailor', rule: { require: [n('black_tea')] } },
  { id: 'o13_tomorrow', stage: 13, seq: 9, customer: 'c_scholar', rule: { require: [n('water')], forbidTag: ['tea'], temp: 'hot' } },

  // --- stage 14: weather, seasons
  { id: 'o14_hot', stage: 14, seq: 1, customer: 'c_boy', rule: { require: [n(W)], temp: 'cold' } },
  { id: 'o14_rain', stage: 14, seq: 2, customer: 'c_sailor', rule: { require: [n('ginger')], temp: 'hot' } },
  { id: 'o14_sunny', stage: 14, seq: 3, customer: 'c_girl', rule: { require: [n('mint')], temp: 'cold' } },
  { id: 'o14_cold', stage: 14, seq: 4, customer: 'c_grandma', rule: { requireTag: [{ tag: 'warming' }], allow: 'any', temp: 'hot' } },
  { id: 'o14_snow', stage: 14, seq: 5, customer: 'c_docker', rule: { require: [n('milk')], temp: 'hot' } },
  { id: 'o14_wind', stage: 14, seq: 6, customer: 'c_merchant', rule: { require: [n('water'), n('ginger')], temp: 'hot' } },
  { id: 'o14_summer', stage: 14, seq: 7, customer: 'c_boy', rule: { require: [n(W), n('mint')], temp: 'cold' } },
  { id: 'o14_cool', stage: 14, seq: 8, customer: 'c_girl', audio: true, rule: { require: [n('mint')], temp: 'cold' } },
  { id: 'o14_winter', stage: 14, seq: 9, customer: 'c_oldman', rule: { require: [n('ginger'), n('honey')], temp: 'hot' } },
  { id: 'o14_spring', stage: 14, seq: 10, customer: 'c_cook', rule: { require: [n('green_tea')] } },
  { id: 'o14_autumn', stage: 14, seq: 11, customer: 'c_docker', audio: true, rule: { require: [n('black_tea')], temp: 'hot' } },

  // --- stage 15: body and illness
  { id: 'o15_cough', stage: 15, seq: 1, customer: 'c_docker', recipe: 'pear_honey' },
  { id: 'o15_head', stage: 15, seq: 2, customer: 'c_cook', recipe: 'mint_chrysanthemum' },
  { id: 'o15_stomach', stage: 15, seq: 3, customer: 'c_grandma', recipe: 'ginger_water' },
  { id: 'o15_fever', stage: 15, seq: 4, customer: 'c_mom', rule: { require: [n('water')], forbidTag: ['tea'], temp: 'hot' } },
  { id: 'o15_doctor', stage: 15, seq: 5, customer: 'c_doctor', rule: { require: [n('water'), n('honey')], forbidTag: ['tea'], temp: 'hot' } },
  { id: 'o15_sick', stage: 15, seq: 6, customer: 'c_sailor', audio: true, rule: { require: [n('ginger')], temp: 'hot' } },
  { id: 'o15_eyes', stage: 15, seq: 7, customer: 'c_scholar', recipe: 'chrysanthemum_green' },
  { id: 'o15_pear', stage: 15, seq: 8, customer: 'c_merchant', rule: { require: [n(P), n('honey')], temp: 'hot', method: 'boil' } },
  { id: 'o15_mother', stage: 15, seq: 9, customer: 'c_boy', recipe: 'pear_honey' },
  { id: 'o15_head2', stage: 15, seq: 10, customer: 'c_girl', audio: true, recipe: 'mint_chrysanthemum' },

  // --- stage 16: feelings
  { id: 'o16_hungry', stage: 16, seq: 1, customer: 'c_boy', recipe: 'banana_milk' },
  { id: 'o16_thirsty', stage: 16, seq: 2, customer: 'c_docker', recipe: 'watermelon_mint' },
  { id: 'o16_sad', stage: 16, seq: 3, customer: 'c_girl', rule: { requireTag: [{ tag: 'sweet' }], allow: 'any' } },
  { id: 'o16_angry', stage: 16, seq: 4, customer: 'c_merchant', rule: { require: [n('mint')], temp: 'cold' } },
  { id: 'o16_worried', stage: 16, seq: 5, customer: 'c_scholar', recipe: 'chrysanthemum_dates' },
  { id: 'o16_happy', stage: 16, seq: 6, customer: 'c_student', rule: { require: [n('honey', 2, 2)] } },
  { id: 'o16_tired', stage: 16, seq: 7, customer: 'c_cook', audio: true, recipe: 'mint_green' },
  { id: 'o16_bad', stage: 16, seq: 8, customer: 'c_grandma', rule: { require: [n('ginger'), n('water')], temp: 'hot' } },

  // --- stage 17: can / need / allergy / preferences
  { id: 'o17_allergy', stage: 17, seq: 1, customer: 'c_mom', rule: { require: [n('lemon')], forbid: ['honey'] } },
  { id: 'o17_milk', stage: 17, seq: 2, customer: 'c_scholar', rule: { require: [n('black_tea')], forbid: ['milk'] } },
  { id: 'o17_can', stage: 17, seq: 3, customer: 'c_boy', rule: { require: [n('mint')], temp: 'cold' } },
  { id: 'o17_need', stage: 17, seq: 4, customer: 'c_cook', rule: { require: [n('water', 3, 3)], temp: 'hot' } },
  { id: 'o17_love', stage: 17, seq: 5, customer: 'c_grandma', rule: { require: [n('honey', 4, 5)] } },
  { id: 'o17_fav', stage: 17, seq: 6, customer: 'c_sailor', rule: { require: [n('ginger')], temp: 'hot' } },
  { id: 'o17_or', stage: 17, seq: 7, customer: 'c_merchant', rule: { require: [n('mint')] } },
  { id: 'o17_dislike', stage: 17, seq: 8, customer: 'c_student', rule: { require: [n('lemon')], forbidTag: ['sweet'] } },
  { id: 'o17_nosugar', stage: 17, seq: 9, customer: 'c_docker', audio: true, rule: { require: [n('green_tea')], forbid: ['sugar', 'honey'] } },
  { id: 'o17_know', stage: 17, seq: 10, customer: 'c_merchant', rule: recipeRule('ginger_honey') },
  { id: 'o17_any', stage: 17, seq: 11, customer: 'c_boy', rule: { requireTag: [{ tag: 'tea' }], forbid: ['sugar'] } },
  { id: 'o17_other', stage: 17, seq: 12, customer: 'c_girl', rule: { requireTag: [{ tag: 'tea' }], forbid: ['green_tea'] } },
  { id: 'o17_boil', stage: 17, seq: 13, customer: 'c_scholar', recipe: 'ginger_dates' },

  // --- stage 18: colours, comparison
  { id: 'o18_red', stage: 18, seq: 1, customer: 'c_girl', rule: { require: [n(R, 2, 2)] } },
  { id: 'o18_yellow', stage: 18, seq: 2, customer: 'c_boy', rule: { require: [n('chrysanthemum', 3, 3)] } },
  { id: 'o18_strong', stage: 18, seq: 3, customer: 'c_merchant', rule: { require: [n('green_tea', 3, 3)] } },
  { id: 'o18_weak', stage: 18, seq: 4, customer: 'c_scholar', rule: { require: [n('black_tea', 1, 1)] } },
  { id: 'o18_sweeter', stage: 18, seq: 5, customer: 'c_cook', rule: { require: [n('honey')], forbid: ['sugar'] } },
  { id: 'o18_rose', stage: 18, seq: 6, customer: 'c_baker', recipe: 'rose_tea' },
  { id: 'o18_white', stage: 18, seq: 7, customer: 'c_grandma', rule: { require: [n('black_tea'), n('sugar', 2, 2)] } },
  { id: 'o18_bestfriend', stage: 18, seq: 8, customer: 'c_baker', recipe: 'ginger_honey' },
  { id: 'o18_same', stage: 18, seq: 9, customer: 'c_sailor', rule: { require: [n('mint')] } },
  { id: 'o18_diff', stage: 18, seq: 10, customer: 'c_scholar', rule: { require: [n('ginger')], forbid: ['lemon'] } },
  { id: 'o18_strongblack', stage: 18, seq: 11, customer: 'c_docker', audio: true, rule: { require: [n('black_tea', 3, 3)], forbid: ['sugar'] } },

  // --- stage 19: everyday verbs, coffee
  { id: 'o19_coffee', stage: 19, seq: 1, customer: 'c_scholar', rule: { require: [n(C)] } },
  { id: 'o19_make', stage: 19, seq: 2, customer: 'c_cook', recipe: 'coffee_milk' },
  { id: 'o19_work', stage: 19, seq: 3, customer: 'c_docker', rule: { require: [n(C)], forbid: ['milk'] } },
  { id: 'o19_buy', stage: 19, seq: 4, customer: 'c_mom', rule: recipeRule('ginger_honey') },
  { id: 'o19_try', stage: 19, seq: 5, customer: 'c_boy', recipe: 'apple_tea' },
  { id: 'o19_going', stage: 19, seq: 6, customer: 'c_merchant', rule: { require: [n(C), n('milk')], allowTag: ['sweet'], temp: 'hot' } },
  { id: 'o19_wait', stage: 19, seq: 7, customer: 'c_grandma', rule: { require: [n('water')], temp: 'hot' } },
  { id: 'o19_eat', stage: 19, seq: 8, customer: 'c_girl', recipe: 'banana_milk' },
  { id: 'o19_help', stage: 19, seq: 9, customer: 'c_student', recipe: 'mint_chrysanthemum' },
  { id: 'o19_home', stage: 19, seq: 10, customer: 'c_sailor', audio: true, rule: { require: [n('ginger')], temp: 'hot' } },
  { id: 'o19_back', stage: 19, seq: 11, customer: 'c_scholar', recipe: 'apple_tea' },
  { id: 'o19_recipe', stage: 19, seq: 12, customer: 'c_baker', rule: recipeRule('honey_lemon') },

  // --- stage 20: questions, yogurt
  { id: 'o20_cough', stage: 20, seq: 1, customer: 'c_docker', recipe: 'pear_honey' },
  { id: 'o20_throat', stage: 20, seq: 2, customer: 'c_cook', recipe: 'honey_lemon' },
  { id: 'o20_yogurt', stage: 20, seq: 3, customer: 'c_boy', rule: { require: [n(Y)], temp: 'cold' } },
  { id: 'o20_there', stage: 20, seq: 4, customer: 'c_grandma', rule: { require: [n('honey', 2, 2)] } },
  { id: 'o20_here', stage: 20, seq: 5, customer: 'c_merchant', rule: { require: [n('green_tea')] } },
  { id: 'o20_when', stage: 20, seq: 6, customer: 'c_student', recipe: 'mint_green' },
  { id: 'o20_howmany', stage: 20, seq: 7, customer: 'c_scholar', rule: { require: [n('ginger', 2, 2), n('honey', 1, 1)], temp: 'hot' } },
  { id: 'o20_howmuch', stage: 20, seq: 8, customer: 'c_girl', rule: { require: [n('lemon'), n('honey', 1, 1)] } },
  { id: 'o20_how', stage: 20, seq: 9, customer: 'c_baker', rule: recipeRule('ginger_honey') },
  { id: 'o20_which', stage: 20, seq: 10, customer: 'c_student', audio: true, recipe: 'mint_chrysanthemum' },

  // --- stage 21: because / so / if / but / instead of / except
  { id: 'o21_so', stage: 21, seq: 1, customer: 'c_scholar', recipe: 'chrysanthemum_dates' },
  { id: 'o21_but', stage: 21, seq: 2, customer: 'c_cook', rule: { require: [n('sugar')], forbid: ['honey'] } },
  { id: 'o21_because', stage: 21, seq: 3, customer: 'c_boy', recipe: 'mint_green' },
  { id: 'o21_if', stage: 21, seq: 4, customer: 'c_merchant', rule: { require: [n('mint')], temp: 'cold' } },
  { id: 'o21_already', stage: 21, seq: 5, customer: 'c_grandma', rule: { require: [n('ginger')], forbid: ['honey'], temp: 'hot' } },
  { id: 'o21_then', stage: 21, seq: 6, customer: 'c_sailor', rule: { require: [n('green_tea'), n('mint')], method: 'steep' } },
  { id: 'o21_always', stage: 21, seq: 7, customer: 'c_docker', rule: { require: [n('green_tea'), n('mint')] } },
  { id: 'o21_instead', stage: 21, seq: 8, customer: 'c_scholar', rule: { require: [n('green_tea'), n('honey')], forbid: ['sugar'] } },
  { id: 'o21_except', stage: 21, seq: 9, customer: 'c_student', rule: { requireTag: [{ tag: 'tea' }], forbid: ['green_tea'] } },
  { id: 'o21_still', stage: 21, seq: 10, customer: 'c_girl', audio: true, rule: { require: [n('water')], temp: 'hot' } },
  { id: 'o21_just', stage: 21, seq: 11, customer: 'c_baker', rule: { require: [n('ginger')], forbid: ['water'] } },

  // --- stage 22: habits, meals, money
  { id: 'o22_every', stage: 22, seq: 1, customer: 'c_sailor', rule: { require: [n('green_tea', 2, 2)] } },
  { id: 'o22_never', stage: 22, seq: 2, customer: 'c_scholar', rule: { require: [n('black_tea')], forbid: [C] } },
  { id: 'o22_usually', stage: 22, seq: 3, customer: 'c_merchant', rule: { require: [n('black_tea')], forbid: ['milk'] } },
  { id: 'o22_after', stage: 22, seq: 4, customer: 'c_grandma', rule: { require: [n('green_tea', 1, 1)] } },
  { id: 'o22_breakfast', stage: 22, seq: 5, customer: 'c_boy', recipe: 'banana_milk' },
  { id: 'o22_lunch', stage: 22, seq: 6, customer: 'c_student', rule: { require: [n(C)] } },
  { id: 'o22_cheaper', stage: 22, seq: 7, customer: 'c_cook', rule: { require: [n('sugar')], forbid: ['honey'] } },
  { id: 'o22_expensive', stage: 22, seq: 8, customer: 'c_merchant', rule: { require: [n('honey')], forbid: ['ginger'] } },
  { id: 'o22_everyday', stage: 22, seq: 9, customer: 'c_girl', rule: { require: [n('water')], temp: 'cold' } },
  { id: 'o22_often', stage: 22, seq: 10, customer: 'c_doctor', audio: true, recipe: 'chrysanthemum_dates' },

  // --- stage 23: opinions, polite requests
  { id: 'o23_think', stage: 23, seq: 1, customer: 'c_sailor', rule: { require: [n('green_tea', 3, 3)] } },
  { id: 'o23_howabout', stage: 23, seq: 2, customer: 'c_grandma', rule: recipeRule('ginger_honey') },
  { id: 'o23_maybe', stage: 23, seq: 3, customer: 'c_merchant', rule: { require: [n('ginger')], temp: 'hot' } },
  { id: 'o23_course', stage: 23, seq: 4, customer: 'c_scholar', rule: recipeRule('honey_lemon') },
  { id: 'o23_would', stage: 23, seq: 5, customer: 'c_student', rule: { require: [n('green_tea')], temp: 'hot' } },
  { id: 'o23_actually', stage: 23, seq: 6, customer: 'c_boy', rule: { require: [n('mint')], temp: 'cold' } },
  { id: 'o23_especially', stage: 23, seq: 7, customer: 'c_cook', recipe: 'apple_tea' },
  { id: 'o23_quite', stage: 23, seq: 8, customer: 'c_grandma', rule: { require: [n('honey', 3, 3)] } },
  { id: 'o23_last', stage: 23, seq: 9, customer: 'c_sailor', rule: { require: [n('honey')], forbid: ['lemon'] } },
  { id: 'o23_late', stage: 23, seq: 10, customer: 'c_scholar', rule: { require: [n('milk')], forbidTag: ['tea'], temp: 'hot' } },
  { id: 'o23_early', stage: 23, seq: 11, customer: 'c_docker', audio: true, rule: { require: [n('green_tea')] } },
];

/** Build AuthoredOrder[] for one language from `texts` (order id -> text). Throws on a missing text. */
export function buildOrders(texts: Record<string, string>): AuthoredOrder[] {
  const unknown = Object.keys(texts).filter((k) => !ORDER_SPECS.some((s) => s.id === k));
  if (unknown.length) throw new Error(`curriculum: texts for unknown orders: ${unknown.join(', ')}`);
  return ORDER_SPECS.map((s) => {
    const text = texts[s.id];
    if (text === undefined) throw new Error(`curriculum: missing text for order ${s.id}`);
    const o: AuthoredOrder = { id: s.id, stage: s.stage, seq: s.seq, text };
    if (s.customer) o.customer = s.customer;
    if (s.audio) o.audioOnly = true;
    if (s.rule) o.rule = s.rule;
    if (s.recipe) o.recipe = s.recipe;
    return o;
  });
}

// ---------------------------------------------------------------------------
// Templates (slot structure shared by both languages)
// ---------------------------------------------------------------------------

interface TemplateSpec {
  id: string;
  stage: number;
  slots: Record<string, SlotSpec>;
  rule?: OrderRule;
  audio?: number;
  weight?: number;
}

const TEA_ING: IngredientId[] = ['green_tea', 'black_tea'];
const NON_TEA: IngredientId[] = ['milk', 'chrysanthemum', 'red_dates', 'honey', 'lemon', 'ginger', 'mint'];
/** Mass nouns / plain shelf words that read naturally after "Do you have ...?" */
const MASS: IngredientId[] = ['honey', 'sugar', 'mint', 'ginger', 'milk', 'ice', 'green_tea', 'black_tea', 'cinnamon', Y, C];
const SAFE_FOR_FAMILY = ['ginger_honey', 'honey_lemon', 'mint_green', 'apple_tea'];

export const TEMPLATE_SPECS: TemplateSpec[] = [
  { id: 't10_hello', stage: 10, audio: 0.3, slots: { ing: { kind: 'ing' } } },
  { id: 't10_have', stage: 10, slots: { ing: { kind: 'ing', ingredients: MASS } } },
  { id: 't10_friend', stage: 10, slots: { recipe: { kind: 'recipe', recipes: ['apple_tea', 'ginger_honey', 'honey_lemon', 'mint_green'] } } },
  { id: 't11_mother', stage: 11, slots: { recipe: { kind: 'recipe', recipes: SAFE_FOR_FAMILY } } },
  { id: 't11_husband', stage: 11, slots: { recipe: { kind: 'recipe', recipes: SAFE_FOR_FAMILY } } },
  { id: 't11_child', stage: 11, slots: { recipe: { kind: 'recipe', recipes: ['banana_milk'] } } },
  { id: 't12_big', stage: 12, slots: { q: { kind: 'qty', ingredients: ['mint', 'ice'], min: 6, max: 10 } } },
  { id: 't12_little', stage: 12, slots: { ing: { kind: 'ing', ingredients: ['honey', 'sugar', 'lemon', 'ginger'], max: 1 } } },
  { id: 't12_lot', stage: 12, rule: { require: [{ ing: 'mint', min: 4, max: 10 }] }, slots: {} },
  { id: 't12_enough', stage: 12, slots: { q: { kind: 'qty', ingredients: ['honey', 'sugar'], min: 1, max: 2 } } },
  { id: 't13_morning', stage: 13, audio: 0.3, slots: { ing: { kind: 'ing', ingredients: TEA_ING } } },
  { id: 't13_evening', stage: 13, rule: { forbidTag: ['tea'] }, slots: { ing: { kind: 'ing', ingredients: NON_TEA } } },
  {
    id: 't13_yesterday',
    stage: 13,
    slots: {
      f: { kind: 'forbid', ingredients: ['lemon', 'ginger', 'mint', 'honey'] },
      ing: { kind: 'ing', ingredients: ['lemon', 'ginger', 'mint', 'honey'] },
    },
  },
  { id: 't14_hot', stage: 14, audio: 0.3, rule: { temp: 'cold' }, slots: { ing: { kind: 'ing', ingredients: ['lemon', 'mint', 'chrysanthemum', 'green_tea', 'black_tea', W, A] } } },
  { id: 't14_cold', stage: 14, audio: 0.3, rule: { temp: 'hot' }, slots: { ing: { kind: 'ing', ingredients: ['ginger', 'honey', 'milk', 'black_tea', 'red_dates', 'cinnamon', 'lemon'] } } },
  { id: 't14_summer', stage: 14, rule: { temp: 'cold' }, slots: { ing: { kind: 'ing', ingredients: ['mint', 'lemon', 'chrysanthemum'] } } },
  { id: 't14_winter', stage: 14, rule: { temp: 'hot' }, slots: { ing: { kind: 'ing', ingredients: ['ginger', 'lemon', 'honey', 'chrysanthemum', 'red_dates'] } } },
  { id: 't15_doctor', stage: 15, rule: { require: [{ ing: 'water' }], forbidTag: ['tea'] }, slots: { temp: { kind: 'temp', temps: ['hot'] } } },
  { id: 't16_sad', stage: 16, slots: { taste: { kind: 'taste', tags: ['sweet'] } } },
  { id: 't17_allergy', stage: 17, audio: 0.25, slots: { f: { kind: 'forbid', ingredients: ['honey', 'milk', 'lemon', 'mint'] }, ing: { kind: 'ing', ingredients: ['green_tea', 'black_tea', 'ginger', 'chrysanthemum'] } } },
  { id: 't17_dislike', stage: 17, slots: { nt: { kind: 'notTaste', tags: ['sweet', 'sour', 'bitter'] }, ing: { kind: 'ing', ingredients: ['mint', 'ginger', 'chrysanthemum', 'milk', 'green_tea', 'black_tea', 'lemon'] } } },
  { id: 't17_can', stage: 17, slots: { ing: { kind: 'ing', ingredients: MASS }, temp: { kind: 'temp' } } },
  { id: 't18_yellow', stage: 18, rule: { require: [{ ing: 'chrysanthemum', min: 3, max: 3 }] }, slots: {} },
  { id: 't18_red', stage: 18, rule: { require: [{ ing: R, min: 2, max: 2 }] }, slots: {} },
  { id: 't18_strong', stage: 18, rule: { require: [{ ing: 'green_tea', min: 3, max: 3 }] }, slots: {} },
  { id: 't18_weak', stage: 18, rule: { require: [{ ing: 'black_tea', min: 1, max: 1 }] }, slots: {} },
  { id: 't18_sweeter', stage: 18, rule: { require: [{ ing: 'honey' }], forbid: ['sugar'] }, slots: {} },
  { id: 't19_make', stage: 19, slots: { recipe: { kind: 'recipe' } } },
  { id: 't19_try', stage: 19, slots: { recipe: { kind: 'recipe' } } },
  { id: 't19_buy', stage: 19, slots: { q: { kind: 'qty', min: 1, max: 3 } } },
  { id: 't19_work', stage: 19, slots: { ing: { kind: 'ing', ingredients: [C, 'green_tea', 'black_tea'] } } },
  { id: 't20_cough', stage: 20, rule: recipeRule('pear_honey'), slots: {} },
  { id: 't20_throat', stage: 20, rule: recipeRule('honey_lemon'), slots: {} },
  { id: 't20_headache', stage: 20, rule: recipeRule('mint_chrysanthemum'), slots: {} },
  { id: 't20_stomach', stage: 20, rule: recipeRule('ginger_water'), slots: {} },
  { id: 't20_there', stage: 20, slots: { ing: { kind: 'ing', ingredients: MASS } } },
  { id: 't20_have', stage: 20, audio: 0.3, slots: { ing: { kind: 'ing', ingredients: MASS }, temp: { kind: 'temp' } } },
  { id: 't21_but', stage: 21, slots: { ing: { kind: 'ing', ingredients: ['green_tea', 'black_tea', 'lemon', 'ginger', 'mint'] }, f: { kind: 'forbid', ingredients: ['sugar', 'honey', 'ice', 'milk'] } } },
  { id: 't21_also', stage: 21, slots: { ing1: { kind: 'ing' }, ing2: { kind: 'ing' } } },
  { id: 't21_except', stage: 21, rule: { requireTag: [{ tag: 'tea' }] }, slots: { f: { kind: 'forbid', ingredients: ['green_tea', 'black_tea'] } } },
  { id: 't21_instead', stage: 21, slots: { ing: { kind: 'ing', ingredients: ['honey', 'sugar', 'lemon'] }, f: { kind: 'forbid', ingredients: ['honey', 'sugar'] } } },
  { id: 't22_every', stage: 22, audio: 0.3, slots: { ing: { kind: 'ing', ingredients: ['green_tea', 'black_tea', 'chrysanthemum', 'ginger'] }, temp: { kind: 'temp' } } },
  { id: 't22_never', stage: 22, slots: { f: { kind: 'forbid', ingredients: ['coffee', 'milk', 'sugar', 'honey', 'ice'] }, ing: { kind: 'ing', ingredients: ['green_tea', 'black_tea', 'ginger', 'chrysanthemum'] } } },
  { id: 't23_would', stage: 23, audio: 0.3, slots: { q: { kind: 'qty', min: 1, max: 3 } } },
  { id: 't23_think', stage: 23, slots: { q: { kind: 'qty', min: 1, max: 3 } } },
  { id: 't23_maybe', stage: 23, slots: { ing: { kind: 'ing', ingredients: ['ginger', 'lemon', 'mint', 'honey', 'chrysanthemum', 'green_tea', 'black_tea'] } } },
  { id: 't23_actually', stage: 23, slots: { temp: { kind: 'temp' }, ing: { kind: 'ing', ingredients: ['mint', 'lemon', 'ginger', 'chrysanthemum', 'apple'] } } },
];

/** Build OrderTemplate[] for one language from `texts` (template id -> text). */
export function buildTemplates(texts: Record<string, string>): OrderTemplate[] {
  const unknown = Object.keys(texts).filter((k) => !TEMPLATE_SPECS.some((s) => s.id === k));
  if (unknown.length) throw new Error(`curriculum: texts for unknown templates: ${unknown.join(', ')}`);
  return TEMPLATE_SPECS.map((s) => {
    const text = texts[s.id];
    if (text === undefined) throw new Error(`curriculum: missing text for template ${s.id}`);
    const t: OrderTemplate = { id: s.id, stage: s.stage, text, slots: s.slots };
    if (s.rule) t.rule = s.rule;
    if (s.audio !== undefined) t.audioOnly = s.audio;
    if (s.weight !== undefined) t.weight = s.weight;
    return t;
  });
}
