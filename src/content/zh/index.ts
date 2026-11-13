import type { LanguageContent } from '../../core/types';
import { buildOrders, buildTemplates } from '../shared/curriculum';
import { LEXICON } from './lexicon';
import { LEXICON2, VERIFICATION2 } from './lexicon2';
import {
  CUSTOMERS2, INGREDIENTS2, NUMBERS2, ORDER_TEXTS, PAGES2, REACTIONS2, RECIPE_NAMES2, SYMPTOMS2, TAG_WORDS2, TEMPLATE_TEXTS,
} from './stages2';

const content: LanguageContent = {
  lang: 'zh',
  lexicon: [...LEXICON, ...LEXICON2],
  numbers: { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five', ...NUMBERS2 },
  temperatureWords: { hot: 'hot', cold: 'ice' },
  methodWords: { steep: 'steep', boil: 'boil', stir: 'stir' },
  tagWords: { sweet: 'sweet', sour: 'sour', bitter: 'bitter', salty: 'salty', tea: 'tea', ...TAG_WORDS2 },

  ingredients: [
    { ingredient: 'lemon', word: 'lemon', qty: { other: '{n}片柠檬' } },
    { ingredient: 'ginger', word: 'ginger', qty: { other: '{n}片姜' } },
    { ingredient: 'mint', word: 'mint', qty: { other: '{n}片薄荷' } },
    { ingredient: 'honey', word: 'honey', qty: { other: '{n}勺蜂蜜' } },
    { ingredient: 'water', word: 'water', qty: { other: '{n}杯水' } },
    { ingredient: 'ice', word: 'ice', qty: { other: '{n}块冰' } },
    { ingredient: 'sugar', word: 'sugar', qty: { other: '{n}勺糖' } },
    { ingredient: 'salt', word: 'salt' },
    { ingredient: 'green_tea', word: 'green_tea', qty: { other: '{n}勺绿茶' } },
    { ingredient: 'black_tea', word: 'black_tea', qty: { other: '{n}勺红茶' } },
    { ingredient: 'milk', word: 'milk' },
    { ingredient: 'red_dates', word: 'red_date', qty: { other: '{n}颗红枣' } },
    { ingredient: 'chrysanthemum', word: 'chrysanthemum', qty: { other: '{n}朵菊花' } },
    { ingredient: 'cinnamon', word: 'cinnamon', qty: { other: '{n}根肉桂' } },
    ...INGREDIENTS2,
  ],

  recipeNames: {
    ginger_honey: '蜂蜜姜茶',
    honey_lemon: '蜂蜜柠檬茶',
    mint_green: '薄荷绿茶',
    chrysanthemum_dates: '菊花红枣茶',
    ginger_dates: '红枣姜茶',
    cinnamon_milk_tea: '肉桂奶茶',
    chrysanthemum_green: '菊花绿茶',
    ...RECIPE_NAMES2,
  },

  symptoms: [
    { symptom: 'cold', phrases: ['我感冒了。', '我感冒了……'] },
    { symptom: 'sore_throat', phrases: ['我嗓子疼。', '我嗓子很疼。'] },
    { symptom: 'tired', phrases: ['我很累。', '我太累了。'] },
    { symptom: 'insomnia', phrases: ['我睡不着。', '我晚上睡不着。'] },
    ...SYMPTOMS2,
  ],

  pages: [
    { id: 'p_lemon', stage: 1, kind: 'ingredient', ingredient: 'lemon', title: '柠檬', illustration: '🍋', lines: [{ text: '酸。', icon: '😖' }, { text: '柠檬和蜂蜜，很好喝。', icon: '🍯' }] },
    { id: 'p_ginger', stage: 1, kind: 'ingredient', ingredient: 'ginger', title: '姜', illustration: '🫚', lines: [{ text: '感冒的时候喝。', icon: '🤧', style: 'goodFor' }, { text: '姜和蜂蜜，很好喝。', icon: '🍯' }] },
    { id: 'p_mint', stage: 1, kind: 'ingredient', ingredient: 'mint', title: '薄荷', illustration: '🌿', lines: [{ text: '加冰，很好喝。', icon: '🧊' }, { text: '薄荷和绿茶，很好喝。', icon: '🍵' }] },
    { id: 'p_honey', stage: 1, kind: 'ingredient', ingredient: 'honey', title: '蜂蜜', illustration: '🍯', lines: [{ text: '甜。', icon: '🍬' }, { text: '嗓子疼的时候喝。', icon: '🗣️', style: 'goodFor' }] },
    {
      id: 'p_numbers', stage: 2, kind: 'note', title: '一、两、三', illustration: '🔢',
      lines: [
        { text: '一', icon: '🍋' },
        { text: '两', icon: '🍋🍋' },
        { text: '三', icon: '🍋🍋🍋' },
        { text: '一片', icon: '🔪' },
        { text: '两片', icon: '🍃🍃' },
        { text: '三勺', icon: '🥄🥄🥄' },
      ],
    },
    {
      id: 'p_hotcold', stage: 3, kind: 'note', title: '热的和冰的', illustration: '🌡️',
      lines: [
        { text: '热的。', icon: '🔥☕' },
        { text: '冰的。', icon: '🧊🥤' },
        { text: '一杯热水。', icon: '☕💧' },
        { text: '两块冰。', icon: '🧊🧊' },
      ],
    },
    { id: 'p_sugar', stage: 4, kind: 'ingredient', ingredient: 'sugar', title: '糖', illustration: '🍬', lines: [{ text: '甜。', icon: '🍬' }, { text: '柠檬加糖，很好喝。', icon: '🍋' }] },
    { id: 'p_green_tea', stage: 5, kind: 'ingredient', ingredient: 'green_tea', title: '绿茶', illustration: '🍵', lines: [{ text: '苦。', icon: '😣' }, { text: '一勺绿茶。', icon: '🥄' }, { text: '晚上别喝茶。', icon: '🌙', style: 'warning' }] },
    {
      id: 'p_tastes', stage: 6, kind: 'note', title: '甜、酸、苦、咸', illustration: '👅',
      lines: [
        { text: '甜', icon: '🍯🍬' },
        { text: '酸', icon: '🍋' },
        { text: '苦', icon: '🍵' },
        { text: '咸', icon: '🧂' },
      ],
    },
    { id: 'p_salt', stage: 6, kind: 'ingredient', ingredient: 'salt', title: '盐', illustration: '🧂', lines: [{ text: '咸。', icon: '🧂' }, { text: '茶加盐？不是茶，是汤！', icon: '🍲', style: 'warning' }, { text: '柠檬加盐，冰的，好喝。', icon: '🍋🧊' }] },
    { id: 'p_black_tea', stage: 6, kind: 'ingredient', ingredient: 'black_tea', title: '红茶', illustration: '🫖', lines: [{ text: '苦。', icon: '😣' }, { text: '红茶和柠檬，很好喝。', icon: '🍋' }, { text: '晚上别喝茶。', icon: '🌙', style: 'warning' }] },
    {
      id: 'p_ginger_honey', stage: 7, kind: 'recipe', recipe: 'ginger_honey', title: '蜂蜜姜茶', illustration: '🫚🍯',
      lines: [
        { text: '两片姜', icon: '🫚', style: 'item' },
        { text: '一勺蜂蜜', icon: '🍯', style: 'item' },
        { text: '热的。', icon: '🔥', style: 'item' },
        { text: '感冒的时候喝。', icon: '🤧', style: 'goodFor' },
      ],
    },
    {
      id: 'p_honey_lemon', stage: 7, kind: 'recipe', recipe: 'honey_lemon', title: '蜂蜜柠檬茶', illustration: '🍯🍋',
      lines: [
        { text: '一片柠檬', icon: '🍋', style: 'item' },
        { text: '一勺蜂蜜', icon: '🍯', style: 'item' },
        { text: '热的。', icon: '🔥', style: 'item' },
        { text: '嗓子疼的时候喝。', icon: '🗣️', style: 'goodFor' },
      ],
    },
    { id: 'p_red_dates', stage: 8, kind: 'ingredient', ingredient: 'red_dates', title: '红枣', illustration: '🔴', lines: [{ text: '甜。', icon: '🍬' }, { text: '晚上喝很好。', icon: '🌙' }] },
    { id: 'p_chrysanthemum', stage: 8, kind: 'ingredient', ingredient: 'chrysanthemum', title: '菊花', illustration: '🌼', lines: [{ text: '菊花和红枣，很好喝。', icon: '🔴' }, { text: '菊花和绿茶，很好喝。', icon: '🍵' }] },
    {
      id: 'p_mint_green', stage: 8, kind: 'recipe', recipe: 'mint_green', title: '薄荷绿茶', illustration: '🌿🍵',
      lines: [
        { text: '一勺绿茶', icon: '🍵', style: 'item' },
        { text: '两片薄荷', icon: '🌿', style: 'item' },
        { text: '冰的。', icon: '🧊', style: 'item' },
        { text: '累的时候喝。', icon: '😩', style: 'goodFor' },
      ],
    },
    {
      id: 'p_chrysanthemum_dates', stage: 8, kind: 'recipe', recipe: 'chrysanthemum_dates', title: '菊花红枣茶', illustration: '🌼🔴',
      lines: [
        { text: '两朵菊花', icon: '🌼', style: 'item' },
        { text: '两颗红枣', icon: '🔴', style: 'item' },
        { text: '热的。', icon: '🔥', style: 'item' },
        { text: '晚上睡不着的时候喝。', icon: '🌙', style: 'goodFor' },
        { text: '别加绿茶和红茶！', icon: '🚫🍵', style: 'warning' },
      ],
    },
    {
      id: 'p_methods', stage: 9, kind: 'note', title: '煮、泡、搅拌', illustration: '🫕',
      lines: [
        { text: '煮', icon: '🍲🔥' },
        { text: '泡', icon: '🍵⏳' },
        { text: '搅拌', icon: '🥄🌀' },
      ],
    },
    { id: 'p_milk', stage: 9, kind: 'ingredient', ingredient: 'milk', title: '牛奶', illustration: '🥛', lines: [{ text: '红茶加牛奶，是奶茶。', icon: '🫖🥛' }] },
    { id: 'p_cinnamon', stage: 9, kind: 'ingredient', ingredient: 'cinnamon', title: '肉桂', illustration: '🪵', lines: [{ text: '一根肉桂。', icon: '🪵' }, { text: '肉桂和奶茶，很好喝。', icon: '🥛' }] },
    {
      id: 'p_ginger_dates', stage: 9, kind: 'recipe', recipe: 'ginger_dates', title: '红枣姜茶', illustration: '🫚🔴',
      lines: [
        { text: '三片姜', icon: '🫚', style: 'item' },
        { text: '两颗红枣', icon: '🔴', style: 'item' },
        { text: '煮五分钟。', icon: '🍲⏱️', style: 'step' },
        { text: '热的。', icon: '🔥', style: 'item' },
        { text: '感冒的时候喝。', icon: '🤧', style: 'goodFor' },
      ],
    },
    {
      id: 'p_cinnamon_milk_tea', stage: 9, kind: 'recipe', recipe: 'cinnamon_milk_tea', title: '肉桂奶茶', illustration: '🫖🥛',
      lines: [
        { text: '一勺红茶', icon: '🫖', style: 'item' },
        { text: '牛奶', icon: '🥛', style: 'item' },
        { text: '一根肉桂', icon: '🪵', style: 'item' },
        { text: '先泡红茶。', icon: '⏳', style: 'step' },
        { text: '再加牛奶和肉桂。', icon: '➕', style: 'step' },
        { text: '搅拌。热的。', icon: '🌀', style: 'step' },
      ],
    },
    {
      id: 'p_chrysanthemum_green', stage: 9, kind: 'recipe', recipe: 'chrysanthemum_green', title: '菊花绿茶', illustration: '🌼🍵',
      lines: [
        { text: '一勺绿茶', icon: '🍵', style: 'item' },
        { text: '两朵菊花', icon: '🌼', style: 'item' },
        { text: '泡四分钟。', icon: '⏳', style: 'step' },
        { text: '热的。', icon: '🔥', style: 'item' },
      ],
    },
    ...PAGES2,
  ],

  orders: [
    { id: 'o1_lemon', stage: 1, seq: 1, customer: 'c_sailor', text: '柠檬。', rule: { require: [{ ing: 'lemon' }] } },
    { id: 'o1_ginger', stage: 1, seq: 2, customer: 'c_grandma', text: '姜。', rule: { require: [{ ing: 'ginger' }] } },
    { id: 'o1_mint', stage: 1, seq: 3, customer: 'c_boy', text: '薄荷。', rule: { require: [{ ing: 'mint' }] } },
    { id: 'o1_honey', stage: 1, seq: 4, customer: 'c_cook', text: '蜂蜜。', rule: { require: [{ ing: 'honey' }] } },

    { id: 'o2_lemon2', stage: 2, seq: 1, text: '两片柠檬。', rule: { require: [{ ing: 'lemon', min: 2, max: 2 }] } },
    { id: 'o2_mint3', stage: 2, seq: 2, text: '三片薄荷。', rule: { require: [{ ing: 'mint', min: 3, max: 3 }] } },
    { id: 'o2_ginger1', stage: 2, seq: 3, text: '一片姜。', rule: { require: [{ ing: 'ginger', min: 1, max: 1 }] } },
    { id: 'o2_honey2', stage: 2, seq: 4, text: '两勺蜂蜜。', rule: { require: [{ ing: 'honey', min: 2, max: 2 }] } },

    { id: 'o3_hot_lemon', stage: 3, seq: 1, text: '两片柠檬，热的。', rule: { require: [{ ing: 'lemon', min: 2, max: 2 }], temp: 'hot' } },
    { id: 'o3_cold_mint', stage: 3, seq: 2, text: '三片薄荷，冰的。', rule: { require: [{ ing: 'mint', min: 3, max: 3 }], temp: 'cold' } },
    { id: 'o3_water', stage: 3, seq: 3, customer: 'c_grandma', text: '一杯热水。', rule: { require: [{ ing: 'water', min: 1, max: 1 }], temp: 'hot' } },
    { id: 'o3_ice', stage: 3, seq: 4, customer: 'c_boy', text: '薄荷，两块冰。', rule: { require: [{ ing: 'mint' }, { ing: 'ice', min: 2, max: 2 }] } },

    { id: 'o4_and', stage: 4, seq: 1, text: '柠檬和蜂蜜，谢谢。', rule: { require: [{ ing: 'lemon' }, { ing: 'honey' }] } },
    { id: 'o4_sugar', stage: 4, seq: 2, text: '两勺糖和三片薄荷，谢谢。', rule: { require: [{ ing: 'sugar', min: 2, max: 2 }, { ing: 'mint', min: 3, max: 3 }] } },
    { id: 'o4_with', stage: 4, seq: 3, customer: 'c_grandma', text: '一杯热水，加蜂蜜，谢谢。', rule: { require: [{ ing: 'water', min: 1, max: 1 }, { ing: 'honey' }], temp: 'hot' } },
    { id: 'o4_ginger', stage: 4, seq: 4, customer: 'c_sailor', text: '请给我两片姜和一勺蜂蜜，热的。', rule: { require: [{ ing: 'ginger', min: 2, max: 2 }, { ing: 'honey', min: 1, max: 1 }], temp: 'hot' } },

    { id: 'o5_no_sugar', stage: 5, seq: 1, text: '柠檬和薄荷，不要糖，谢谢。', rule: { require: [{ ing: 'lemon' }, { ing: 'mint' }], forbid: ['sugar'] } },
    { id: 'o5_without', stage: 5, seq: 2, customer: 'c_merchant', text: '绿茶，不加糖。', rule: { require: [{ ing: 'green_tea' }], forbid: ['sugar'] } },
    { id: 'o5_no_ice', stage: 5, seq: 3, customer: 'c_boy', text: '三片薄荷，冰的，不加冰。', rule: { require: [{ ing: 'mint', min: 3, max: 3 }], forbid: ['ice'], temp: 'cold' } },
    { id: 'o5_audio', stage: 5, seq: 4, audioOnly: true, text: '热的绿茶，谢谢。', rule: { require: [{ ing: 'green_tea' }], temp: 'hot' } },

    { id: 'o6_sweet', stage: 6, seq: 1, customer: 'c_boy', text: '我要甜的，热的。', rule: { requireTag: [{ tag: 'sweet' }], temp: 'hot' } },
    { id: 'o6_sour', stage: 6, seq: 2, text: '酸的，冰的，谢谢。', rule: { requireTag: [{ tag: 'sour' }], temp: 'cold' } },
    { id: 'o6_not_sweet', stage: 6, seq: 3, customer: 'c_merchant', text: '红茶，不要甜的。', rule: { require: [{ ing: 'black_tea' }], forbidTag: ['sweet'] } },
    { id: 'o6_salt', stage: 6, seq: 4, customer: 'c_docker', text: '柠檬加盐，冰的。', rule: { require: [{ ing: 'lemon' }, { ing: 'salt', min: 1, max: 1 }], allow: ['ice', 'water'], temp: 'cold' } },
    { id: 'o6_bitter', stage: 6, seq: 5, audioOnly: true, text: '要苦的，热的。', rule: { requireTag: [{ tag: 'bitter' }], temp: 'hot' } },

    { id: 'o7_cold', stage: 7, seq: 1, customer: 'c_sailor', text: '我感冒了。', recipe: 'ginger_honey' },
    { id: 'o7_throat', stage: 7, seq: 2, customer: 'c_grandma', text: '我嗓子疼。', recipe: 'honey_lemon' },
    { id: 'o7_name', stage: 7, seq: 3, text: '请给我蜂蜜姜茶。', recipe: 'ginger_honey' },
    { id: 'o7_throat2', stage: 7, seq: 4, audioOnly: true, text: '我嗓子很疼。', recipe: 'honey_lemon' },

    { id: 'o8_tired', stage: 8, seq: 1, customer: 'c_docker', text: '我很累。', recipe: 'mint_green' },
    { id: 'o8_sleep', stage: 8, seq: 2, customer: 'c_scholar', text: '我晚上睡不着。', recipe: 'chrysanthemum_dates' },
    { id: 'o8_dates', stage: 8, seq: 3, text: '三颗红枣，加热水。', rule: { require: [{ ing: 'red_dates', min: 3, max: 3 }, { ing: 'water' }], temp: 'hot' } },
    { id: 'o8_sleep_audio', stage: 8, seq: 4, audioOnly: true, customer: 'c_scholar', text: '我睡不着。', recipe: 'chrysanthemum_dates' },

    { id: 'o9_boil', stage: 9, seq: 1, customer: 'c_sailor', text: '请给我红枣姜茶。', recipe: 'ginger_dates' },
    { id: 'o9_milk', stage: 9, seq: 2, customer: 'c_merchant', text: '一杯肉桂奶茶。', recipe: 'cinnamon_milk_tea' },
    { id: 'o9_steep', stage: 9, seq: 3, customer: 'c_scholar', text: '菊花绿茶，谢谢。', recipe: 'chrysanthemum_green' },
    { id: 'o9_big', stage: 9, seq: 4, customer: 'c_boy', text: '四片薄荷，五块冰，冰的。', rule: { require: [{ ing: 'mint', min: 4, max: 4 }, { ing: 'ice', min: 5, max: 5 }], temp: 'cold' } },
    { id: 'o9_milk_tea', stage: 9, seq: 5, text: '红茶加牛奶，热的。', rule: { require: [{ ing: 'black_tea' }, { ing: 'milk' }], temp: 'hot' } },
    ...buildOrders(ORDER_TEXTS),
  ],

  templates: [
    { id: 't1_ing', stage: 1, text: '{ing}。', slots: { ing: { kind: 'ing' } } },
    { id: 't2_qty', stage: 2, text: '{q}。', slots: { q: { kind: 'qty', min: 1, max: 3 } } },
    { id: 't3_qty_temp', stage: 3, text: '{q}，{temp}的。', slots: { q: { kind: 'qty', min: 1, max: 3 }, temp: { kind: 'temp' } } },
    { id: 't3_ing_temp', stage: 3, text: '{ing}，{temp}的。', slots: { ing: { kind: 'ing' }, temp: { kind: 'temp' } } },
    { id: 't4_and', stage: 4, text: '{q1}和{q2}，谢谢。', slots: { q1: { kind: 'qty', min: 1, max: 3 }, q2: { kind: 'qty', min: 1, max: 3 } } },
    { id: 't4_with', stage: 4, text: '{temp}水加{ing}。', rule: { require: [{ ing: 'water' }] }, slots: { temp: { kind: 'temp' }, ing: { kind: 'ing' } } },
    { id: 't4_and_temp', stage: 4, text: '{ing1}和{ing2}，{temp}的，谢谢。', slots: { ing1: { kind: 'ing' }, ing2: { kind: 'ing' }, temp: { kind: 'temp' } } },
    { id: 't5_no', stage: 5, text: '{q}，不要{f}。', slots: { q: { kind: 'qty', min: 1, max: 3 }, f: { kind: 'forbid', ingredients: ['sugar', 'honey', 'ice', 'mint', 'lemon'] } } },
    { id: 't5_without', stage: 5, text: '{ing}，不加{f}，谢谢。', slots: { ing: { kind: 'ing', ingredients: ['lemon', 'ginger', 'mint', 'green_tea', 'black_tea', 'chrysanthemum'] }, f: { kind: 'forbid', ingredients: ['sugar', 'honey', 'ice', 'milk'] } } },
    { id: 't5_audio', stage: 5, text: '要{temp}的，加{ing}。', audioOnly: 0.6, slots: { temp: { kind: 'temp' }, ing: { kind: 'ing' } } },
    { id: 't6_taste', stage: 6, text: '要{taste}的，{temp}的。', slots: { taste: { kind: 'taste', tags: ['sweet', 'sour', 'bitter'] }, temp: { kind: 'temp' } } },
    { id: 't6_not_taste', stage: 6, text: '{ing}，不要{nt}的。', slots: { ing: { kind: 'ing', tags: ['tea'] }, nt: { kind: 'notTaste', tags: ['sweet'] } } },
    { id: 't6_qty_taste', stage: 6, text: '{q}，要{taste}的。', slots: { q: { kind: 'qty', min: 1, max: 3 }, taste: { kind: 'taste', tags: ['sweet', 'sour'] } } },
    { id: 't7_symptom', stage: 7, text: '{symptom}', audioOnly: 0.3, slots: { symptom: { kind: 'symptom' } } },
    { id: 't7_recipe', stage: 7, text: '请给我{recipe}。', slots: { recipe: { kind: 'recipe' } } },
    { id: 't9_big', stage: 9, text: '{q1}和{q2}，{temp}的。', slots: { q1: { kind: 'qty', min: 1, max: 5 }, q2: { kind: 'qty', min: 1, max: 5 }, temp: { kind: 'temp' } } },
    ...buildTemplates(TEMPLATE_TEXTS),
  ],

  reactions: [
    { id: 'r_thanks', kind: 'perfect', stage: 1, text: '谢谢！', face: 'happy' },
    { id: 'r_good', kind: 'perfect', stage: 1, text: '好！', face: 'happy' },
    { id: 'r_right', kind: 'perfect', stage: 2, text: '对！谢谢！', face: 'delighted' },
    { id: 'r_tasty', kind: 'perfect', stage: 4, text: '好喝！', face: 'delighted' },
    { id: 'r_again', kind: 'perfect', stage: 5, text: '对了！谢谢！', face: 'delighted', when: { returning: true } },
    { id: 'r_great', kind: 'perfect', stage: 6, text: '太好了！', face: 'delighted' },
    { id: 'r_like', kind: 'perfect', stage: 6, text: '我喜欢！', face: 'delighted' },
    { id: 'r_very_tasty', kind: 'perfect', stage: 6, text: '很好喝！', face: 'delighted' },
    { id: 'r_better', kind: 'perfect', stage: 7, text: '舒服多了！', face: 'delighted', when: { symptom: true } },
    { id: 'r_better2', kind: 'perfect', stage: 8, text: '哇，舒服多了。谢谢！', face: 'delighted', when: { symptom: true } },

    { id: 'r_nono', kind: 'any_fail', stage: 1, text: '不对。', face: 'sad' },
    { id: 'r_wrong', kind: 'any_fail', stage: 6, text: '错了……', face: 'sad' },

    { id: 'r_empty', kind: 'empty', stage: 1, text: '茶呢？', face: 'puzzled' },
    { id: 'r_empty2', kind: 'empty', stage: 7, text: '我的茶呢？', face: 'puzzled' },

    { id: 'r_wrong1', kind: 'wrong', stage: 1, text: '不对！{ing}！', face: 'puzzled' },
    { id: 'r_wrong2', kind: 'wrong', stage: 4, text: '不对，我要{ing}。', face: 'puzzled' },
    { id: 'r_wrong3', kind: 'wrong', stage: 7, text: '这不是{ing}。', face: 'sad' },

    { id: 'r_miss1', kind: 'missing', stage: 1, text: '{ing}呢？', face: 'puzzled' },
    { id: 'r_miss2', kind: 'missing', stage: 5, text: '没有{ing}……', face: 'sad' },

    { id: 'r_extra1', kind: 'extra', stage: 1, text: '不要{ing}！', face: 'puzzled' },
    { id: 'r_extra2', kind: 'extra', stage: 6, text: '有{ing}？我不要{ing}。', face: 'puzzled' },
    { id: 'r_soup', kind: 'extra', stage: 6, text: '这是汤吗？', face: 'puzzled', when: { ings: ['salt'] } },

    { id: 'r_forbid1', kind: 'forbidden', stage: 5, text: '我说了不要{ing}！', face: 'angry' },
    { id: 'r_forbid_soup', kind: 'forbidden', stage: 6, text: '这是汤吗？我说了不要{ing}！', face: 'angry', when: { ings: ['salt'] } },
    { id: 'r_forbid_tag', kind: 'forbidden_tag', stage: 6, text: '我说了不要{tag}的！', face: 'angry', when: { tags: ['sweet', 'sour', 'bitter', 'salty'] } },
    { id: 'r_forbid_tea', kind: 'forbidden_tag', stage: 8, text: '晚上别喝茶！', face: 'angry', when: { tags: ['tea'] } },

    { id: 'r_tag_missing', kind: 'tag_missing', stage: 6, text: '不{tag}。', face: 'sad' },
    { id: 'r_tag_missing2', kind: 'tag_missing', stage: 6, text: '要{tag}的！', face: 'puzzled' },
    { id: 'r_tag_much', kind: 'tag_too_much', stage: 6, text: '太{tag}了！', face: 'sad' },

    { id: 'r_much', kind: 'too_much', stage: 2, text: '{ing}太多了！', face: 'sad' },
    { id: 'r_little', kind: 'too_little', stage: 2, text: '{ing}太少了。', face: 'neutral' },
    { id: 'r_little2', kind: 'too_little', stage: 5, text: '{ing}不够。', face: 'sad' },

    { id: 'r_temp', kind: 'wrong_temp', stage: 3, text: '我要{temp}的！', face: 'puzzled' },
    { id: 'r_method', kind: 'wrong_method', stage: 9, text: '要{method}！', face: 'neutral' },
    ...REACTIONS2,
  ],

  customers: [
    { id: 'c_sailor', name: '王船长', avatar: '🧔', stage: 1 },
    { id: 'c_grandma', name: '李奶奶', avatar: '👵', stage: 1 },
    { id: 'c_boy', name: '小明', avatar: '👦', stage: 1 },
    { id: 'c_cook', name: '陈阿姨', avatar: '👩‍🍳', stage: 1 },
    { id: 'c_merchant', name: '周老板', avatar: '🧑‍💼', stage: 2 },
    { id: 'c_docker', name: '大刘', avatar: '👷', stage: 3 },
    { id: 'c_scholar', name: '林老师', avatar: '🧑‍🏫', stage: 6 },
    ...CUSTOMERS2,
  ],

  verificationPages: [
    { id: 'g_shelf1', labelJa: '棚の品（一）', minEncounters: 2 },
    { id: 'g_num1', labelJa: '数（一）' },
    { id: 'g_measure', labelJa: '数え方' },
    { id: 'g_temp', labelJa: '温度と水' },
    { id: 'g_func', labelJa: '頼み方' },
    { id: 'g_neg', labelJa: 'あり・なし' },
    { id: 'g_taste', labelJa: '味' },
    { id: 'g_shelf2', labelJa: '棚の品（二）', minEncounters: 2 },
    { id: 'g_shelf3', labelJa: '棚の品（三）', minEncounters: 2 },
    { id: 'g_num2', labelJa: '数（二）と時間', minEncounters: 2 },
    { id: 'g_react1', labelJa: 'お客さんの返事' },
    { id: 'g_amount', labelJa: '量の言い方' },
    { id: 'g_grammar', labelJa: '問いかけ', minEncounters: 2 },
    { id: 'g_people', labelJa: '自分のこと' },
    { id: 'g_drink', labelJa: '飲み物' },
    { id: 'g_symptom', labelJa: '体の調子' },
    { id: 'g_sleep', labelJa: '夜のこと' },
    { id: 'g_react3', labelJa: 'お客さんの気持ち' },
    { id: 'g_method', labelJa: '作り方' },
    { id: 'g_talk', labelJa: '気持ちを言う' },
    ...VERIFICATION2,
  ],

  // HSK 2.0 cumulative list sizes; CEFR targets follow the mapping table (A1≈HSK2, A2≈HSK3, ...).
  levelTargets: {
    cefr: { A1: 300, A2: 600, B1: 1200, B2: 2500, C1: 5000 },
    exam: { '1': 150, '2': 300, '3': 600, '4': 1200, '5': 2500, '6': 5000 },
  },
};

export default content;
