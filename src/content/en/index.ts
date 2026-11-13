import type { LanguageContent } from '../../core/types';
import { buildOrders, buildTemplates } from '../shared/curriculum';
import { LEXICON } from './lexicon';
import { LEXICON2, VERIFICATION2 } from './lexicon2';
import {
  CUSTOMERS2, INGREDIENTS2, NUMBERS2, ORDER_TEXTS, PAGES2, REACTIONS2, RECIPE_NAMES2, SYMPTOMS2, TAG_WORDS2, TEMPLATE_TEXTS,
} from './stages2';

const content: LanguageContent = {
  lang: 'en',
  lexicon: [...LEXICON, ...LEXICON2],
  numbers: { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', ...NUMBERS2 },
  temperatureWords: { hot: 'hot', cold: 'cold' },
  methodWords: { steep: 'steep', boil: 'boil', stir: 'stir' },
  tagWords: { sweet: 'sweet', sour: 'sour', bitter: 'bitter', salty: 'salty', tea: 'tea', ...TAG_WORDS2 },

  ingredients: [
    { ingredient: 'lemon', word: 'lemon', qty: { one: 'one lemon slice', other: '{n} lemon slices' } },
    { ingredient: 'ginger', word: 'ginger', qty: { one: 'one ginger slice', other: '{n} ginger slices' } },
    { ingredient: 'mint', word: 'mint', qty: { one: 'one mint leaf', other: '{n} mint leaves' } },
    { ingredient: 'honey', word: 'honey', qty: { one: 'one spoon of honey', other: '{n} spoons of honey' } },
    { ingredient: 'water', word: 'water', qty: { one: 'one cup of water', other: '{n} cups of water' } },
    { ingredient: 'ice', word: 'ice', qty: { one: 'one ice cube', other: '{n} ice cubes' } },
    { ingredient: 'sugar', word: 'sugar', qty: { one: 'one spoon of sugar', other: '{n} spoons of sugar' } },
    { ingredient: 'salt', word: 'salt' },
    { ingredient: 'green_tea', word: 'green_tea', qty: { one: 'one spoon of green tea', other: '{n} spoons of green tea' } },
    { ingredient: 'black_tea', word: 'black_tea', qty: { one: 'one spoon of black tea', other: '{n} spoons of black tea' } },
    { ingredient: 'milk', word: 'milk' },
    { ingredient: 'red_dates', word: 'red_date', qty: { one: 'one red date', other: '{n} red dates' } },
    { ingredient: 'chrysanthemum', word: 'chrysanthemum', qty: { one: 'one chrysanthemum', other: '{n} chrysanthemums' } },
    { ingredient: 'cinnamon', word: 'cinnamon', qty: { one: 'one cinnamon stick', other: '{n} cinnamon sticks' } },
    ...INGREDIENTS2,
  ],

  // Lowercase: templates write {Recipe} sentence-initially and {recipe} mid-sentence.
  recipeNames: {
    ginger_honey: 'ginger honey tea',
    honey_lemon: 'honey lemon tea',
    mint_green: 'mint green tea',
    chrysanthemum_dates: 'chrysanthemum and red date tea',
    ginger_dates: 'ginger and red date tea',
    cinnamon_milk_tea: 'cinnamon milk tea',
    chrysanthemum_green: 'chrysanthemum green tea',
    ...RECIPE_NAMES2,
  },

  symptoms: [
    { symptom: 'cold', phrases: ['I have a {cold|cold_illness}.', 'Oh... I have a {cold|cold_illness}.'] },
    { symptom: 'sore_throat', phrases: ['I have a sore throat.', 'My throat is sore.'] },
    { symptom: 'tired', phrases: ["I'm tired.", "I'm tired. I want a cold drink."] },
    { symptom: 'insomnia', phrases: ["I can't sleep.", "I can't sleep at night."] },
    ...SYMPTOMS2,
  ],

  pages: [
    // stage 1 — ingredient pages
    { id: 'p_lemon', stage: 1, kind: 'ingredient', ingredient: 'lemon', title: 'Lemon', illustration: '🍋', lines: [{ text: 'Sour.', icon: '😖' }, { text: 'Good with honey.', icon: '🍯' }] },
    { id: 'p_ginger', stage: 1, kind: 'ingredient', ingredient: 'ginger', title: 'Ginger', illustration: '🫚', lines: [{ text: 'Good for a {cold|cold_illness}.', icon: '🤧', style: 'goodFor' }, { text: 'Good with honey.', icon: '🍯' }] },
    { id: 'p_mint', stage: 1, kind: 'ingredient', ingredient: 'mint', title: 'Mint', illustration: '🌿', lines: [{ text: 'Good with ice.', icon: '🧊' }, { text: 'Good with green tea.', icon: '🍵' }] },
    { id: 'p_honey', stage: 1, kind: 'ingredient', ingredient: 'honey', title: 'Honey', illustration: '🍯', lines: [{ text: 'Sweet.', icon: '🍬' }, { text: 'Good for a sore throat.', icon: '🗣️', style: 'goodFor' }] },
    // stage 2 — numbers
    {
      id: 'p_numbers', stage: 2, kind: 'note', title: 'One, two, three', illustration: '🔢',
      lines: [
        { text: 'one', icon: '🍋' },
        { text: 'two', icon: '🍋🍋' },
        { text: 'three', icon: '🍋🍋🍋' },
        { text: 'one slice', icon: '🔪' },
        { text: 'two leaves', icon: '🍃🍃' },
        { text: 'three spoons', icon: '🥄🥄🥄' },
      ],
    },
    // stage 3 — temperature
    {
      id: 'p_hotcold', stage: 3, kind: 'note', title: 'Hot and cold', illustration: '🌡️',
      lines: [
        { text: 'Hot.', icon: '🔥☕' },
        { text: 'Cold.', icon: '🧊🥤' },
        { text: 'One cup of hot water.', icon: '☕💧' },
        { text: 'Two ice cubes.', icon: '🧊🧊' },
      ],
    },
    // stage 4
    { id: 'p_sugar', stage: 4, kind: 'ingredient', ingredient: 'sugar', title: 'Sugar', illustration: '🍬', lines: [{ text: 'Sweet.', icon: '🍬' }, { text: 'Good with lemon.', icon: '🍋' }] },
    // stage 5
    { id: 'p_green_tea', stage: 5, kind: 'ingredient', ingredient: 'green_tea', title: 'Green tea', illustration: '🍵', lines: [{ text: 'Bitter.', icon: '😣' }, { text: 'One spoon of green tea.', icon: '🥄' }, { text: 'No tea at night.', icon: '🌙', style: 'warning' }] },
    // stage 6
    {
      id: 'p_tastes', stage: 6, kind: 'note', title: 'Sweet, sour, bitter, salty', illustration: '👅',
      lines: [
        { text: 'sweet', icon: '🍯🍬' },
        { text: 'sour', icon: '🍋' },
        { text: 'bitter', icon: '🍵' },
        { text: 'salty', icon: '🧂' },
      ],
    },
    { id: 'p_salt', stage: 6, kind: 'ingredient', ingredient: 'salt', title: 'Salt', illustration: '🧂', lines: [{ text: 'Salty.', icon: '🧂' }, { text: 'Good with lemon and cold water.', icon: '🍋💧' }] },
    { id: 'p_black_tea', stage: 6, kind: 'ingredient', ingredient: 'black_tea', title: 'Black tea', illustration: '🫖', lines: [{ text: 'Bitter.', icon: '😣' }, { text: 'Good with lemon.', icon: '🍋' }, { text: 'No tea at night.', icon: '🌙', style: 'warning' }] },
    // stage 7 — first remedies
    {
      id: 'p_ginger_honey', stage: 7, kind: 'recipe', recipe: 'ginger_honey', title: 'Ginger honey tea', illustration: '🫚🍯',
      lines: [
        { text: 'Two ginger slices', icon: '🫚', style: 'item' },
        { text: 'One spoon of honey', icon: '🍯', style: 'item' },
        { text: 'Hot.', icon: '🔥', style: 'item' },
        { text: 'For a {cold|cold_illness}.', icon: '🤧', style: 'goodFor' },
        { text: 'Drink it hot.', icon: '☕', style: 'step' },
      ],
    },
    {
      id: 'p_honey_lemon', stage: 7, kind: 'recipe', recipe: 'honey_lemon', title: 'Honey lemon tea', illustration: '🍯🍋',
      lines: [
        { text: 'One lemon slice', icon: '🍋', style: 'item' },
        { text: 'One spoon of honey', icon: '🍯', style: 'item' },
        { text: 'Hot.', icon: '🔥', style: 'item' },
        { text: 'For a sore throat.', icon: '🗣️', style: 'goodFor' },
      ],
    },
    // stage 8
    { id: 'p_red_dates', stage: 8, kind: 'ingredient', ingredient: 'red_dates', title: 'Red dates', illustration: '🔴', lines: [{ text: 'Sweet.', icon: '🍬' }, { text: 'Good at night.', icon: '🌙' }] },
    { id: 'p_chrysanthemum', stage: 8, kind: 'ingredient', ingredient: 'chrysanthemum', title: 'Chrysanthemum', illustration: '🌼', lines: [{ text: 'Good with red dates.', icon: '🔴' }, { text: 'Good with green tea.', icon: '🍵' }] },
    {
      id: 'p_mint_green', stage: 8, kind: 'recipe', recipe: 'mint_green', title: 'Mint green tea', illustration: '🌿🍵',
      lines: [
        { text: 'One spoon of green tea', icon: '🍵', style: 'item' },
        { text: 'Two mint leaves', icon: '🌿', style: 'item' },
        { text: 'Cold.', icon: '🧊', style: 'item' },
        { text: 'Tired? Drink this.', icon: '😩', style: 'goodFor' },
      ],
    },
    {
      id: 'p_chrysanthemum_dates', stage: 8, kind: 'recipe', recipe: 'chrysanthemum_dates', title: 'Chrysanthemum and red date tea', illustration: '🌼🔴',
      lines: [
        { text: 'Two chrysanthemums', icon: '🌼', style: 'item' },
        { text: 'Two red dates', icon: '🔴', style: 'item' },
        { text: 'Hot.', icon: '🔥', style: 'item' },
        { text: "Can't sleep? Drink this at night.", icon: '🌙', style: 'goodFor' },
        { text: 'No green tea. No black tea.', icon: '🚫🍵', style: 'warning' },
      ],
    },
    // stage 9 — methods
    {
      id: 'p_methods', stage: 9, kind: 'note', title: 'Boil, steep, stir', illustration: '🫕',
      lines: [
        { text: 'Boil.', icon: '🍲🔥' },
        { text: 'Steep.', icon: '🍵⏳' },
        { text: 'Stir.', icon: '🥄🌀' },
      ],
    },
    { id: 'p_milk', stage: 9, kind: 'ingredient', ingredient: 'milk', title: 'Milk', illustration: '🥛', lines: [{ text: 'Good with black tea.', icon: '🫖' }] },
    { id: 'p_cinnamon', stage: 9, kind: 'ingredient', ingredient: 'cinnamon', title: 'Cinnamon', illustration: '🪵', lines: [{ text: 'One cinnamon stick.', icon: '🪵' }, { text: 'Good with milk.', icon: '🥛' }] },
    {
      id: 'p_ginger_dates', stage: 9, kind: 'recipe', recipe: 'ginger_dates', title: 'Ginger and red date tea', illustration: '🫚🔴',
      lines: [
        { text: 'Three ginger slices', icon: '🫚', style: 'item' },
        { text: 'Two red dates', icon: '🔴', style: 'item' },
        { text: 'Boil for five minutes.', icon: '🍲⏱️', style: 'step' },
        { text: 'Drink it hot.', icon: '☕', style: 'step' },
        { text: 'For a {cold|cold_illness}.', icon: '🤧', style: 'goodFor' },
      ],
    },
    {
      id: 'p_cinnamon_milk_tea', stage: 9, kind: 'recipe', recipe: 'cinnamon_milk_tea', title: 'Cinnamon milk tea', illustration: '🫖🥛',
      lines: [
        { text: 'One spoon of black tea', icon: '🫖', style: 'item' },
        { text: 'Milk', icon: '🥛', style: 'item' },
        { text: 'One cinnamon stick', icon: '🪵', style: 'item' },
        { text: 'Steep the black tea.', icon: '⏳', style: 'step' },
        { text: 'Add milk and cinnamon.', icon: '➕', style: 'step' },
        { text: 'Stir. Drink it hot.', icon: '🌀', style: 'step' },
      ],
    },
    {
      id: 'p_chrysanthemum_green', stage: 9, kind: 'recipe', recipe: 'chrysanthemum_green', title: 'Chrysanthemum green tea', illustration: '🌼🍵',
      lines: [
        { text: 'One spoon of green tea', icon: '🍵', style: 'item' },
        { text: 'Two chrysanthemums', icon: '🌼', style: 'item' },
        { text: 'Steep for four minutes.', icon: '⏳', style: 'step' },
        { text: 'Hot.', icon: '🔥', style: 'item' },
      ],
    },
    ...PAGES2,
  ],

  orders: [
    // Day 1: one word, solvable from the shelf labels alone.
    { id: 'o1_lemon', stage: 1, seq: 1, customer: 'c_sailor', text: 'Lemon.', rule: { require: [{ ing: 'lemon' }] } },
    { id: 'o1_ginger', stage: 1, seq: 2, customer: 'c_grandma', text: 'Ginger.', rule: { require: [{ ing: 'ginger' }] } },
    { id: 'o1_mint', stage: 1, seq: 3, customer: 'c_boy', text: 'Mint.', rule: { require: [{ ing: 'mint' }] } },
    { id: 'o1_honey', stage: 1, seq: 4, customer: 'c_cook', text: 'Honey.', rule: { require: [{ ing: 'honey' }] } },
    // Day 2: numbers 1-3.
    { id: 'o2_lemon2', stage: 2, seq: 1, text: 'Two lemon slices.', rule: { require: [{ ing: 'lemon', min: 2, max: 2 }] } },
    { id: 'o2_mint3', stage: 2, seq: 2, text: 'Three mint leaves.', rule: { require: [{ ing: 'mint', min: 3, max: 3 }] } },
    { id: 'o2_ginger1', stage: 2, seq: 3, text: 'One ginger slice.', rule: { require: [{ ing: 'ginger', min: 1, max: 1 }] } },
    { id: 'o2_honey2', stage: 2, seq: 4, text: 'Two spoons of honey.', rule: { require: [{ ing: 'honey', min: 2, max: 2 }] } },
    // Day 3: hot / cold.
    { id: 'o3_hot_lemon', stage: 3, seq: 1, text: 'Two lemon slices. Hot.', rule: { require: [{ ing: 'lemon', min: 2, max: 2 }], temp: 'hot' } },
    { id: 'o3_cold_mint', stage: 3, seq: 2, text: 'Three mint leaves. Cold.', rule: { require: [{ ing: 'mint', min: 3, max: 3 }], temp: 'cold' } },
    { id: 'o3_water', stage: 3, seq: 3, customer: 'c_grandma', text: 'One cup of hot water.', rule: { require: [{ ing: 'water', min: 1, max: 1 }], temp: 'hot' } },
    { id: 'o3_ice', stage: 3, seq: 4, customer: 'c_boy', text: 'Mint. Two ice cubes. Cold.', rule: { require: [{ ing: 'mint' }, { ing: 'ice', min: 2, max: 2 }], temp: 'cold' } },
    // Day 4: and / please / with.
    { id: 'o4_and', stage: 4, seq: 1, text: 'Lemon and honey, please.', rule: { require: [{ ing: 'lemon' }, { ing: 'honey' }] } },
    { id: 'o4_sugar', stage: 4, seq: 2, text: 'Two spoons of sugar and three mint leaves, please.', rule: { require: [{ ing: 'sugar', min: 2, max: 2 }, { ing: 'mint', min: 3, max: 3 }] } },
    { id: 'o4_with', stage: 4, seq: 3, customer: 'c_grandma', text: 'Hot water with honey, please.', rule: { require: [{ ing: 'water' }, { ing: 'honey' }], temp: 'hot' } },
    { id: 'o4_ginger', stage: 4, seq: 4, customer: 'c_sailor', text: 'Two ginger slices and one spoon of honey, please. Hot.', rule: { require: [{ ing: 'ginger', min: 2, max: 2 }, { ing: 'honey', min: 1, max: 1 }], temp: 'hot' } },
    // Day 5: no / without; first audio-only order.
    { id: 'o5_no_sugar', stage: 5, seq: 1, text: 'Lemon and mint, no sugar, please.', rule: { require: [{ ing: 'lemon' }, { ing: 'mint' }], forbid: ['sugar'] } },
    { id: 'o5_without', stage: 5, seq: 2, customer: 'c_merchant', text: 'Green tea without sugar, please.', rule: { require: [{ ing: 'green_tea' }], forbid: ['sugar'] } },
    { id: 'o5_no_ice', stage: 5, seq: 3, customer: 'c_boy', text: 'Three mint leaves. Cold, no ice, please.', rule: { require: [{ ing: 'mint', min: 3, max: 3 }], forbid: ['ice'], temp: 'cold' } },
    { id: 'o5_audio', stage: 5, seq: 4, audioOnly: true, text: 'Hot green tea, please.', rule: { require: [{ ing: 'green_tea' }], temp: 'hot' } },
    // Day 6: tastes.
    { id: 'o6_sweet', stage: 6, seq: 1, customer: 'c_boy', text: 'Sweet, please. Hot.', rule: { requireTag: [{ tag: 'sweet' }], temp: 'hot' } },
    { id: 'o6_sour', stage: 6, seq: 2, text: 'Sour and cold, please.', rule: { requireTag: [{ tag: 'sour' }], temp: 'cold' } },
    { id: 'o6_not_sweet', stage: 6, seq: 3, customer: 'c_merchant', text: 'Black tea, not sweet.', rule: { require: [{ ing: 'black_tea' }], forbidTag: ['sweet'] } },
    { id: 'o6_salt', stage: 6, seq: 4, customer: 'c_docker', text: 'Lemon with salt, please. Cold.', rule: { require: [{ ing: 'lemon' }, { ing: 'salt', min: 1, max: 1 }], allow: ['ice', 'water'], temp: 'cold' } },
    { id: 'o6_bitter', stage: 6, seq: 5, audioOnly: true, text: 'Bitter, please. Hot.', rule: { requireTag: [{ tag: 'bitter' }], temp: 'hot' } },
    // Day 7: symptoms -> recipe book.
    { id: 'o7_cold', stage: 7, seq: 1, customer: 'c_sailor', text: 'I have a {cold|cold_illness}.', recipe: 'ginger_honey' },
    { id: 'o7_throat', stage: 7, seq: 2, customer: 'c_grandma', text: 'I have a sore throat.', recipe: 'honey_lemon' },
    { id: 'o7_name', stage: 7, seq: 3, text: 'Ginger honey tea, please.', recipe: 'ginger_honey' },
    { id: 'o7_throat2', stage: 7, seq: 4, audioOnly: true, text: 'My throat is sore.', recipe: 'honey_lemon' },
    // Day 8.
    { id: 'o8_tired', stage: 8, seq: 1, customer: 'c_docker', text: "I'm tired.", recipe: 'mint_green' },
    { id: 'o8_sleep', stage: 8, seq: 2, customer: 'c_scholar', text: "I can't sleep at night.", recipe: 'chrysanthemum_dates' },
    { id: 'o8_dates', stage: 8, seq: 3, text: 'Three red dates and hot water, please.', rule: { require: [{ ing: 'red_dates', min: 3, max: 3 }, { ing: 'water' }], temp: 'hot' } },
    { id: 'o8_sleep_audio', stage: 8, seq: 4, audioOnly: true, customer: 'c_scholar', text: "I can't sleep.", recipe: 'chrysanthemum_dates' },
    // Day 9: methods.
    { id: 'o9_boil', stage: 9, seq: 1, customer: 'c_sailor', text: 'Ginger and red date tea, please.', recipe: 'ginger_dates' },
    { id: 'o9_milk', stage: 9, seq: 2, customer: 'c_merchant', text: 'Cinnamon milk tea, please.', recipe: 'cinnamon_milk_tea' },
    { id: 'o9_steep', stage: 9, seq: 3, customer: 'c_scholar', text: 'Chrysanthemum green tea, please.', recipe: 'chrysanthemum_green' },
    { id: 'o9_big', stage: 9, seq: 4, customer: 'c_boy', text: 'Four mint leaves and five ice cubes, please. Cold.', rule: { require: [{ ing: 'mint', min: 4, max: 4 }, { ing: 'ice', min: 5, max: 5 }], temp: 'cold' } },
    { id: 'o9_milk_tea', stage: 9, seq: 5, text: 'Black tea with milk, please. Hot.', rule: { require: [{ ing: 'black_tea' }, { ing: 'milk' }], temp: 'hot' } },
    ...buildOrders(ORDER_TEXTS),
  ],

  templates: [
    { id: 't1_ing', stage: 1, text: '{Ing}.', slots: { ing: { kind: 'ing' } } },
    { id: 't2_qty', stage: 2, text: '{Q}.', slots: { q: { kind: 'qty', min: 1, max: 3 } } },
    { id: 't3_qty_temp', stage: 3, text: '{Q}. {Temp}.', slots: { q: { kind: 'qty', min: 1, max: 3 }, temp: { kind: 'temp' } } },
    { id: 't3_ing_temp', stage: 3, text: '{Ing}. {Temp}.', slots: { ing: { kind: 'ing' }, temp: { kind: 'temp' } } },
    { id: 't4_and', stage: 4, text: '{Q1} and {q2}, please.', slots: { q1: { kind: 'qty', min: 1, max: 3 }, q2: { kind: 'qty', min: 1, max: 3 } } },
    { id: 't4_with', stage: 4, text: '{Temp} water with {ing}, please.', rule: { require: [{ ing: 'water' }] }, slots: { temp: { kind: 'temp' }, ing: { kind: 'ing' } } },
    { id: 't4_and_temp', stage: 4, text: '{Ing1} and {ing2}, please. {Temp}.', slots: { ing1: { kind: 'ing' }, ing2: { kind: 'ing' }, temp: { kind: 'temp' } } },
    { id: 't5_no', stage: 5, text: '{Q}, no {f}, please.', slots: { q: { kind: 'qty', min: 1, max: 3 }, f: { kind: 'forbid', ingredients: ['sugar', 'honey', 'ice', 'mint', 'lemon'] } } },
    { id: 't5_without', stage: 5, text: '{Ing} without {f}, please.', slots: { ing: { kind: 'ing', ingredients: ['lemon', 'ginger', 'mint', 'green_tea', 'black_tea', 'chrysanthemum'] }, f: { kind: 'forbid', ingredients: ['sugar', 'honey', 'ice', 'milk'] } } },
    { id: 't5_audio', stage: 5, text: '{Temp} {ing}, please.', audioOnly: 0.6, slots: { temp: { kind: 'temp' }, ing: { kind: 'ing' } } },
    { id: 't6_where', stage: 6, weight: 2, text: 'Where is the {ing}? {Ing} tea, please.', slots: { ing: { kind: 'ing', ingredients: ['lemon', 'ginger', 'mint', 'chrysanthemum'] } } },
    { id: 't6_taste', stage: 6, text: '{Taste}, please. {Temp}.', slots: { taste: { kind: 'taste', tags: ['sweet', 'sour', 'bitter'] }, temp: { kind: 'temp' } } },
    { id: 't6_not_taste', stage: 6, text: '{Ing}, not {nt}, please.', slots: { ing: { kind: 'ing', tags: ['tea'] }, nt: { kind: 'notTaste', tags: ['sweet'] } } },
    { id: 't6_qty_taste', stage: 6, text: '{Q}. {Taste}, please.', slots: { q: { kind: 'qty', min: 1, max: 3 }, taste: { kind: 'taste', tags: ['sweet', 'sour'] } } },
    { id: 't7_symptom', stage: 7, text: '{symptom}', audioOnly: 0.3, slots: { symptom: { kind: 'symptom' } } },
    { id: 't7_recipe', stage: 7, text: '{Recipe}, please.', slots: { recipe: { kind: 'recipe' } } },
    { id: 't9_big', stage: 9, text: '{Q1} and {q2}, please. {Temp}.', slots: { q1: { kind: 'qty', min: 1, max: 5 }, q2: { kind: 'qty', min: 1, max: 5 }, temp: { kind: 'temp' } } },
    ...buildTemplates(TEMPLATE_TEXTS),
  ],

  reactions: [
    // perfect
    { id: 'r_thanks', kind: 'perfect', stage: 1, text: 'Thank you!', face: 'happy' },
    { id: 'r_good', kind: 'perfect', stage: 1, text: 'Good!', face: 'happy' },
    { id: 'r_yes', kind: 'perfect', stage: 2, text: 'Yes! Thank you!', face: 'delighted' },
    { id: 'r_delicious', kind: 'perfect', stage: 4, text: 'Delicious!', face: 'delighted' },
    { id: 'r_again', kind: 'perfect', stage: 5, text: 'Yes! Thank you again!', face: 'delighted', when: { returning: true } },
    { id: 'r_perfect', kind: 'perfect', stage: 6, text: 'Perfect!', face: 'delighted' },
    { id: 'r_like', kind: 'perfect', stage: 6, text: 'Oh, I like it!', face: 'delighted' },
    { id: 'r_very_good', kind: 'perfect', stage: 6, text: 'Very good!', face: 'delighted' },
    { id: 'r_better', kind: 'perfect', stage: 7, text: 'Oh, I feel better!', face: 'delighted', when: { symptom: true } },
    { id: 'r_better2', kind: 'perfect', stage: 8, text: 'I feel better. Thank you!', face: 'delighted', when: { symptom: true } },
    // generic failure fallback
    { id: 'r_nono', kind: 'any_fail', stage: 1, text: 'No, no.', face: 'sad' },
    { id: 'r_this_wrong', kind: 'any_fail', stage: 6, text: 'Oh... this is not good.', face: 'sad' },
    // empty cup
    { id: 'r_empty', kind: 'empty', stage: 1, text: 'Oh?', face: 'puzzled' },
    { id: 'r_empty2', kind: 'empty', stage: 7, text: 'Where is my tea?', face: 'puzzled' },
    // wrong ingredient (expected one missing, something else in the cup)
    { id: 'r_wrong1', kind: 'wrong', stage: 1, text: 'No! {Ing}!', face: 'puzzled' },
    { id: 'r_wrong2', kind: 'wrong', stage: 4, text: 'No, no. {Ing}, please.', face: 'puzzled' },
    { id: 'r_wrong3', kind: 'wrong', stage: 7, text: 'No, no. I want {ing}.', face: 'sad' },
    // missing
    { id: 'r_miss1', kind: 'missing', stage: 1, text: '{Ing}?', face: 'puzzled' },
    { id: 'r_miss2', kind: 'missing', stage: 4, text: '{Ing}, please!', face: 'puzzled' },
    { id: 'r_miss3', kind: 'missing', stage: 6, text: 'Where is the {ing}?', face: 'puzzled' },
    // extra
    { id: 'r_extra1', kind: 'extra', stage: 1, text: 'No {ing}!', face: 'puzzled' },
    { id: 'r_extra2', kind: 'extra', stage: 4, text: '{Ing}? No, thank you.', face: 'puzzled' },
    // forbidden
    { id: 'r_forbid1', kind: 'forbidden', stage: 5, text: 'No {ing}! No!', face: 'angry' },
    { id: 'r_forbid2', kind: 'forbidden', stage: 7, text: 'I said no {ing}!', face: 'angry' },
    { id: 'r_forbid_tag', kind: 'forbidden_tag', stage: 6, text: 'Oh, no! This is {tag}!', face: 'angry', when: { tags: ['sweet', 'sour', 'bitter', 'salty'] } },
    // tastes
    { id: 'r_tag_missing', kind: 'tag_missing', stage: 6, text: 'Not {tag}.', face: 'sad' },
    { id: 'r_tag_missing2', kind: 'tag_missing', stage: 6, text: '{Tag}, please!', face: 'puzzled' },
    { id: 'r_tag_much', kind: 'tag_too_much', stage: 6, text: 'Too {tag}!', face: 'sad' },
    // quantities
    { id: 'r_much', kind: 'too_much', stage: 2, text: 'Too much {ing}!', face: 'sad' },
    { id: 'r_little', kind: 'too_little', stage: 2, text: 'More {ing}, please.', face: 'neutral' },
    { id: 'r_little2', kind: 'too_little', stage: 5, text: 'Not enough {ing}.', face: 'sad' },
    // temperature / method
    { id: 'r_temp', kind: 'wrong_temp', stage: 3, text: '{Temp}, please!', face: 'puzzled' },
    { id: 'r_temp2', kind: 'wrong_temp', stage: 6, text: 'Oh! This is not {temp}.', face: 'sad' },
    { id: 'r_method', kind: 'wrong_method', stage: 9, text: '{Method} it, please.', face: 'neutral' },
    ...REACTIONS2,
  ],

  customers: [
    { id: 'c_sailor', name: 'Captain Reed', avatar: '🧔', stage: 1 },
    { id: 'c_grandma', name: 'Grandma Rose', avatar: '👵', stage: 1 },
    { id: 'c_boy', name: 'Tom', avatar: '👦', stage: 1 },
    { id: 'c_cook', name: 'Nora', avatar: '👩‍🍳', stage: 1 },
    { id: 'c_merchant', name: 'Mr. Grant', avatar: '🧑‍💼', stage: 2 },
    { id: 'c_docker', name: 'Big Joe', avatar: '👷', stage: 3 },
    { id: 'c_scholar', name: 'Professor Hale', avatar: '🧑‍🏫', stage: 6 },
    ...CUSTOMERS2,
  ],

  verificationPages: [
    { id: 'g_shelf1', labelJa: '棚の品（一）', minEncounters: 2 },
    { id: 'g_num1', labelJa: '数（一）' },
    { id: 'g_unit', labelJa: 'はかり方' },
    { id: 'g_temp', labelJa: '温度と水' },
    { id: 'g_func', labelJa: 'つなぎの言葉' },
    { id: 'g_neg', labelJa: 'あり・なし' },
    { id: 'g_taste', labelJa: '味' },
    { id: 'g_shelf2', labelJa: '棚の品（二）', minEncounters: 2 },
    { id: 'g_shelf3', labelJa: '棚の品（三）', minEncounters: 2 },
    { id: 'g_react1', labelJa: 'お客さんの返事（一）' },
    { id: 'g_amount', labelJa: '量の言い方' },
    { id: 'g_grammar', labelJa: '指し示す言葉' },
    { id: 'g_people', labelJa: '自分のこと' },
    { id: 'g_symptom', labelJa: '体の調子' },
    { id: 'g_sleep', labelJa: '夜のこと' },
    { id: 'g_react3', labelJa: 'お客さんの返事（二）' },
    { id: 'g_method', labelJa: '作り方' },
    { id: 'g_drink', labelJa: '飲み物まわり', minEncounters: 2 },
    { id: 'g_num2', labelJa: '数（二）と時間', minEncounters: 2 },
    { id: 'g_talk', labelJa: '気持ちを言う' },
    ...VERIFICATION2,
  ],

  // Approximate cumulative vocabulary sizes. 英検 has no official list; these are common estimates.
  levelTargets: {
    cefr: { A1: 700, A2: 1500, B1: 2500, B2: 4000, C1: 8000 },
    exam: { '5': 600, '4': 1300, '3': 2100, '準2': 3600, '2': 5100, '準1': 7500, '1': 12000 },
  },
};

export default content;
