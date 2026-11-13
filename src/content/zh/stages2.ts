/**
 * Mandarin content for stages 10–23 (HSK 1–3). Structure (order rules, template slots) lives in
 * shared/curriculum.ts; this file is the Chinese text only.
 */
import type { BookPage, Customer, IngredientText, PageLine, Reaction, SymptomText } from '../../core/types';

export const NUMBERS2: Record<number, string> = { 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten' };
export const TAG_WORDS2 = { warming: 'warm', cooling: 'cool' } as const;

export const INGREDIENTS2: IngredientText[] = [
  { ingredient: 'apple', word: 'apple', qty: { other: '{n}片苹果' } },
  { ingredient: 'banana', word: 'banana', qty: { other: '{n}根香蕉' } },
  { ingredient: 'watermelon', word: 'watermelon', qty: { other: '{n}块西瓜' } },
  { ingredient: 'pear', word: 'pear', qty: { other: '{n}个梨' } },
  { ingredient: 'rose', word: 'rose', qty: { other: '{n}朵玫瑰' } },
  { ingredient: 'coffee', word: 'coffee', qty: { other: '{n}勺咖啡' } },
  { ingredient: 'yogurt', word: 'yogurt' },
];

export const RECIPE_NAMES2: Record<string, string> = {
  apple_tea: '苹果茶',
  banana_milk: '香蕉牛奶',
  honey_milk: '蜂蜜牛奶',
  watermelon_mint: '西瓜薄荷茶',
  pear_honey: '蜂蜜梨茶',
  ginger_water: '姜水',
  mint_chrysanthemum: '薄荷菊花茶',
  rose_tea: '玫瑰茶',
  coffee_milk: '咖啡牛奶',
  apple_yogurt: '苹果酸奶',
};

export const SYMPTOMS2: SymptomText[] = [
  { symptom: 'cough', phrases: ['我咳嗽。', '我咳嗽了……'] },
  { symptom: 'headache', phrases: ['我头疼。', '我头很疼。'] },
  { symptom: 'stomachache', phrases: ['我肚子疼。', '我肚子很疼。'] },
  { symptom: 'thirsty', phrases: ['我渴了。', '我很渴。'] },
];

export const CUSTOMERS2: Customer[] = [
  { id: 'c_mom', name: '孙太太', avatar: '👩‍🍼', stage: 11 },
  { id: 'c_girl', name: '小美', avatar: '👧', stage: 12 },
  { id: 'c_oldman', name: '张爷爷', avatar: '👴', stage: 13 },
  { id: 'c_doctor', name: '刘医生', avatar: '🧑‍⚕️', stage: 15 },
  { id: 'c_student', name: '小马', avatar: '🧑‍🎓', stage: 16 },
  { id: 'c_baker', name: '何阿姨', avatar: '👩‍🦳', stage: 18 },
];

export const ORDER_TEXTS: Record<string, string> = {
  // 10 — 你好
  o10_hello: '你好！苹果，谢谢。',
  o10_three: '你好！请给我三片苹果。',
  o10_tea: '请给我苹果茶。',
  o10_friend: '我朋友要苹果茶，谢谢。',
  o10_have: '你有苹果吗？请给我两片。',
  o10_audio: '你好！我要苹果茶。',
  o10_mint: '苹果和薄荷，冰的，谢谢。',
  o10_nocin: '热的苹果茶，不要肉桂。',
  // 11 — 家人
  o11_banana: '香蕉，谢谢。',
  o11_child: '我孩子要香蕉牛奶。',
  o11_husband: '我丈夫感冒了。',
  o11_mother: '我妈妈嗓子疼。',
  o11_father: '我爸爸很累。',
  o11_baby: '我家宝宝要喝香蕉牛奶，不要蜂蜜！',
  o11_wife: '我老婆喜欢甜的。请给我两勺蜂蜜。',
  o11_sibs: '我哥哥和姐姐要两杯冰水。',
  o11_family: '全家要三杯热水，谢谢。',
  o11_sister: '我姐姐很累。',
  // 12 — 数・量
  o12_six: '六片薄荷，谢谢。',
  o12_eight: '八块冰和一片柠檬，冰的。',
  o12_sevennine: '七片薄荷，九块冰，冰的。',
  o12_little: '要一点儿蜂蜜。',
  o12_lot: '要很多薄荷，冰的。',
  o12_only: '只要蜂蜜，不要水。',
  o12_some: '十片薄荷，加一些冰，冰的。',
  o12_less: '柠檬加蜂蜜，蜂蜜少一点儿。',
  o12_big: '一大杯冰水，谢谢。',
  o12_small: '一小杯热水，谢谢。',
  o12_both: '薄荷和柠檬都要两片，热的。',
  // 13 — 时间
  o13_morning: '早上好！请给我绿茶。',
  o13_yday: '昨天我喝了柠檬茶。今天我要薄荷茶。',
  o13_today: '今天喝蜂蜜茶，明天喝姜茶。',
  o13_afternoon: '下午好！薄荷茶，冰的，谢谢。',
  o13_sleep: '睡觉以前，请给我蜂蜜牛奶。',
  o13_evening: '晚上好！热牛奶，不要茶。',
  o13_now: '现在要热水，在家喝。',
  o13_habit: '早上喝绿茶，晚上喝红茶。现在要红茶。',
  o13_tomorrow: '明天喝红茶，今天不喝茶。请给我热水。',
  // 14 — 天气
  o14_hot: '今天天气很热。请给我西瓜。',
  o14_rain: '下雨了。请给我热的姜茶。',
  o14_sunny: '今天是晴天。薄荷茶，冰的。',
  o14_cold: '今天很冷。要暖和的。',
  o14_snow: '下雪了。要热牛奶。',
  o14_wind: '今天刮风，很冷。请给我热水，加姜。',
  o14_summer: '夏天我喜欢冰西瓜和薄荷。',
  o14_cool: '今天很热。我要凉快一点儿。薄荷茶。',
  o14_winter: '冬天我喜欢热的姜茶，加蜂蜜。',
  o14_spring: '春天我喜欢绿茶。请给我绿茶。',
  o14_autumn: '秋天我喜欢红茶。请给我热的红茶。',
  // 15 — 身体
  o15_cough: '我咳嗽。',
  o15_head: '我头疼。',
  o15_stomach: '我肚子疼。',
  o15_fever: '我孩子发烧了。请给我热水。',
  o15_doctor: '医生说，不要喝茶。请给我热水，加蜂蜜。',
  o15_sick: '我生病了，身体不舒服。请给我热的姜茶。',
  o15_eyes: '我的眼睛很累。',
  o15_pear: '梨和蜂蜜，要煮的。',
  o15_mother: '我妈妈咳嗽。',
  o15_head2: '我头很疼。',
  // 16 — 气持ち
  o16_hungry: '我饿了。',
  o16_thirsty: '我渴了。今天很热。',
  o16_sad: '我很难过。要甜的。',
  o16_angry: '我很生气！要冰的薄荷茶。',
  o16_worried: '我担心，睡不着。',
  o16_happy: '我真高兴！请给我两勺蜂蜜。',
  o16_tired: '我真困。',
  o16_bad: '我不舒服。请给我热水，加姜。',
  // 17 — 能・想・过敏
  o17_allergy: '我过敏，不要蜂蜜。请给我柠檬茶。',
  o17_milk: '我不能喝牛奶。请给我红茶。',
  o17_can: '我可以要薄荷茶吗？冰的。',
  o17_need: '我需要三杯热水。',
  o17_love: '我爱蜂蜜。要很多蜂蜜。',
  o17_fav: '我最喜欢姜茶。和朋友一起喝，热的。',
  o17_or: '柠檬或者薄荷都好。我要薄荷。',
  o17_dislike: '我不喜欢甜的。请给我柠檬茶。',
  o17_nosugar: '请给我绿茶。我不要糖或者蜂蜜。',
  o17_know: '你知道蜂蜜姜茶吗？我想喝。',
  o17_any: '茶都可以。不要糖。',
  o17_other: '不要绿茶，要别的茶。',
  o17_boil: '你会煮红枣姜茶吗？',
  // 18 — 色・比べる
  o18_red: '请给我两朵红花。',
  o18_yellow: '三朵黄花，谢谢。',
  o18_strong: '要浓的绿茶。',
  o18_weak: '要淡的红茶。',
  o18_sweeter: '要比糖更甜的。',
  o18_rose: '请给我玫瑰茶。',
  o18_white: '红茶，加两勺白糖。',
  o18_bestfriend: '我的好朋友感冒了。',
  o18_same: '和昨天一样，薄荷茶。',
  o18_diff: '今天要不同的茶。不要柠檬，要姜茶。',
  o18_strongblack: '要浓的红茶，不要糖。',
  // 19 — 动词
  o19_coffee: '咖啡，谢谢。',
  o19_make: '你会做咖啡牛奶吗？热的。',
  o19_work: '我晚上工作。请给我咖啡，不要牛奶。',
  o19_buy: '我想给我妈妈买蜂蜜姜茶。',
  o19_try: '可以试试苹果茶吗？',
  o19_going: '我要去工作。请给我咖啡，加牛奶。',
  o19_wait: '我在等朋友。请给我热水。',
  o19_eat: '我想吃一点儿东西。请给我香蕉牛奶。',
  o19_help: '你能帮我吗？我头疼。',
  o19_home: '我要走了。热的姜茶，带走。',
  o19_back: '我回来了！再来一杯苹果茶。',
  o19_recipe: '再来一杯蜂蜜柠檬茶。',
  // 20 — 质问
  o20_cough: '咳嗽喝什么好？',
  o20_throat: '嗓子疼喝什么好？',
  o20_yogurt: '你有酸奶吗？要冰的。',
  o20_there: '蜂蜜呢？有蜂蜜吗？请给我两勺。',
  o20_here: '请给我绿茶。我想在这儿喝。',
  o20_when: '我累的时候，要喝薄荷绿茶。',
  o20_howmany: '要几片姜？两片，和一勺蜂蜜，热的。',
  o20_howmuch: '柠檬茶，加蜂蜜。蜂蜜多少？一点儿。',
  o20_how: '蜂蜜姜茶怎么做？我想喝一杯。',
  o20_which: '头疼喝哪个好？',
  // 21 — 因为・所以・如果
  o21_so: '我睡不着，所以我要菊花红枣茶。',
  o21_but: '我喜欢甜的，但是我不能吃蜂蜜。请给我糖。',
  o21_because: '因为工作太多，我很累。请给我薄荷绿茶。',
  o21_if: '如果天气热，我就要冰的。如果天气冷，我就要热的。今天很热。薄荷茶，谢谢。',
  o21_already: '我今天已经喝了蜂蜜。不要蜂蜜。要热的姜茶。',
  o21_then: '先泡绿茶，然后加薄荷。',
  o21_always: '我总是喝绿茶。也要薄荷。',
  o21_instead: '绿茶，不要糖，换蜂蜜。',
  o21_except: '除了绿茶，什么茶都可以。',
  o21_still: '我喝完了，还渴。再来一杯热水。',
  o21_just: '就要姜，不要水。',
  // 22 — 习惯・食事・钱
  o22_every: '我每天早上喝绿茶。请给我两勺。',
  o22_never: '我从来不喝咖啡。请给我红茶。',
  o22_usually: '我一般喝奶茶。今天不要牛奶，要红茶。',
  o22_after: '晚饭以后，我喝绿茶。要淡的。',
  o22_breakfast: '早饭喝香蕉牛奶。冰的。',
  o22_lunch: '午饭的时候，我有时候喝咖啡。请给我咖啡。',
  o22_cheaper: '蜂蜜多少钱？糖多少钱？要便宜的。',
  o22_expensive: '要蜂蜜还是姜？要贵的。',
  o22_everyday: '我每天喝热水。今天要冰的。',
  o22_often: '我常常睡不着。请给我菊花红枣茶。',
  // 23 — 意见
  o23_think: '我觉得我需要浓绿茶。要三勺。',
  o23_howabout: '蜂蜜姜茶怎么样？好，我要一杯。',
  o23_maybe: '今天很冷，喝姜茶可能不错。热的。',
  o23_course: '你有蜂蜜柠檬茶吗？当然有！来一杯。',
  o23_would: '我想要一杯热绿茶。',
  o23_actually: '其实我要冰的薄荷茶。',
  o23_especially: '我喜欢水果茶，特别是苹果茶。',
  o23_quite: '我喜欢比较甜的。请给我三勺蜂蜜。',
  o23_last: '上次喝蜂蜜茶，今天一样。',
  o23_late: '很晚了，我想睡觉。要热牛奶，不要茶。下次喝茶。',
  o23_early: '今天我很早就来了。请给我绿茶。',
};

export const TEMPLATE_TEXTS: Record<string, string> = {
  t10_hello: '你好！请给我{ing}。',
  t10_have: '你有{ing}吗？',
  t10_friend: '我朋友要{recipe}。',
  t11_mother: '我妈妈要{recipe}。',
  t11_husband: '我丈夫要{recipe}。',
  t11_child: '孩子要喝{recipe}。',
  t12_big: '请给我{q}。',
  t12_little: '要一点儿{ing}。',
  t12_lot: '要很多薄荷。',
  t12_enough: '{q}够了，不要太多。',
  t13_morning: '早上好！请给我{ing}。',
  t13_evening: '晚上好！要{ing}，不要茶。',
  t13_yesterday: '昨天我喝了{f}茶。今天我要{ing}茶。',
  t14_hot: '今天很热。{ing}，冰的。',
  t14_cold: '今天很冷。{ing}，热的。',
  t14_summer: '夏天我喜欢冰{ing}茶。',
  t14_winter: '冬天我喜欢热{ing}茶。',
  t15_doctor: '医生说，不要喝茶。请给我{temp}水。',
  t16_sad: '我很难过。要{taste}的。',
  t17_allergy: '我过敏，不要{f}。请给我{ing}。',
  t17_dislike: '我不喜欢{nt}的。请给我{ing}。',
  t17_can: '我可以要{ing}吗？{temp}的。',
  t18_yellow: '三朵黄花，谢谢。',
  t18_red: '请给我两朵红花。',
  t18_strong: '要浓的绿茶。',
  t18_weak: '要淡的红茶。',
  t18_sweeter: '要比糖更甜的。',
  t19_make: '{recipe}，你会做吗？',
  t19_try: '我想试试{recipe}。',
  t19_buy: '我想买{q}。',
  t19_work: '我晚上工作。请给我{ing}。',
  t20_cough: '咳嗽喝什么好？',
  t20_throat: '嗓子疼喝什么好？',
  t20_headache: '头疼喝什么好？',
  t20_stomach: '肚子疼喝什么好？',
  t20_there: '有{ing}吗？我想要一些。',
  t20_have: '你有{ing}吗？要{temp}的。',
  t21_but: '请给我{ing}，但是不要{f}。',
  t21_also: '请给我{ing1}，也要{ing2}。',
  t21_except: '除了{f}，什么茶都可以。',
  t21_instead: '不要{f}，换{ing}。',
  t22_every: '我每天喝{ing}。{temp}的。',
  t22_never: '我从来不喝{f}。请给我{ing}。',
  t23_would: '我想要{q}。',
  t23_think: '我觉得我需要{q}。',
  t23_maybe: '喝{ing}可能不错。',
  t23_actually: '其实我要{temp}的{ing}。',
};

const L = (text: string, icon?: string, style?: PageLine['style']): PageLine => ({ text, ...(icon ? { icon } : {}), ...(style ? { style } : {}) });

export const PAGES2: BookPage[] = [
  // ---- 10
  {
    id: 'p_greeting', stage: 10, kind: 'note', title: '你好，再见', illustration: '👋',
    lines: [L('你好！', '👋'), L('欢迎！', '🏮'), L('谢谢！', '😊'), L('对不起！', '🙇'), L('没关系！', '🙆'), L('再见！', '🚪')],
  },
  {
    id: 'p_you', stage: 10, kind: 'note', title: '你和我', illustration: '🧑‍🤝‍🧑',
    lines: [L('你。', '👉🙂'), L('您。', '🎩'), L('你的茶。', '👉🍵'), L('我。', '🙋'), L('我的朋友。', '🧑‍🤝‍🧑'), L('你有薄荷吗？', '🙂🌿❔')],
  },
  { id: 'p_apple', stage: 10, kind: 'ingredient', ingredient: 'apple', title: '苹果', illustration: '🍎', lines: [L('甜。', '🍬'), L('苹果是水果。', '🍎🍇'), L('苹果和红茶，很好喝。', '🫖')] },
  {
    id: 'p_apple_tea', stage: 10, kind: 'recipe', recipe: 'apple_tea', title: '苹果茶', illustration: '🍎🫖',
    lines: [L('两片苹果', '🍎', 'item'), L('一勺红茶', '🫖', 'item'), L('热的。', '🔥', 'item'), L('和朋友喝，很好喝。', '🧑‍🤝‍🧑')],
  },
  // ---- 11
  {
    id: 'p_family', stage: 11, kind: 'note', title: '我的家', illustration: '👨‍👩‍👧‍👦',
    lines: [L('妈妈', '👩'), L('爸爸', '👨'), L('孩子', '🧒'), L('宝宝', '👶'), L('丈夫', '🤵'), L('老婆', '👰'), L('哥哥', '🧑'), L('姐姐', '👩‍🦰'), L('全家', '👨‍👩‍👧‍👦'), L('家', '🏠')],
  },
  {
    id: 'p_babies', stage: 11, kind: 'note', title: '宝宝和孩子', illustration: '👶',
    lines: [L('宝宝：不要蜂蜜！', '🍯🚫👶', 'warning'), L('孩子：不要茶！', '🍵🚫🧒', 'warning'), L('香蕉牛奶，孩子很喜欢。', '🍌🥛')],
  },
  { id: 'p_banana', stage: 11, kind: 'ingredient', ingredient: 'banana', title: '香蕉', illustration: '🍌', lines: [L('甜。', '🍬'), L('香蕉和牛奶，很好喝。', '🥛')] },
  {
    id: 'p_banana_milk', stage: 11, kind: 'recipe', recipe: 'banana_milk', title: '香蕉牛奶', illustration: '🍌🥛',
    lines: [L('一根香蕉', '🍌', 'item'), L('牛奶', '🥛', 'item'), L('冰的。', '🧊', 'item'), L('孩子喜欢。', '🧒', 'goodFor'), L('不要茶！', '🚫🍵', 'warning')],
  },
  // ---- 12
  {
    id: 'p_numbers2', stage: 12, kind: 'note', title: '六、七、八、九、十', illustration: '🔢',
    lines: [
      L('六', '🍋🍋🍋🍋🍋🍋'), L('七', '🍋🍋🍋🍋🍋🍋🍋'), L('八', '🍋🍋🍋🍋🍋🍋🍋🍋'), L('九', '🍋🍋🍋🍋🍋🍋🍋🍋🍋'),
      L('十', '🔟'), L('二十', '2️⃣0️⃣'), L('三十', '3️⃣0️⃣'), L('四十', '4️⃣0️⃣'), L('五十', '5️⃣0️⃣'), L('一百', '💯'), L('半杯水', '☕🌗'),
    ],
  },
  {
    id: 'p_numbers3', stage: 12, kind: 'note', title: '十一、十二……九十九', illustration: '🔢',
    lines: [L('十一', '1️⃣1️⃣'), L('十二', '1️⃣2️⃣'), L('十三', '1️⃣3️⃣'), L('十四', '1️⃣4️⃣'), L('十五', '1️⃣5️⃣'), L('十六', '1️⃣6️⃣'), L('十七', '1️⃣7️⃣'), L('十八', '1️⃣8️⃣'), L('十九', '1️⃣9️⃣'), L('二十五', '2️⃣5️⃣'), L('六十', '6️⃣0️⃣'), L('七十', '7️⃣0️⃣'), L('八十', '8️⃣0️⃣'), L('九十', '9️⃣0️⃣'), L('九十九', '9️⃣9️⃣'), L('十五{块|kuai_money}。', '🪙1️⃣5️⃣')],
  },
  {
    id: 'p_amounts', stage: 12, kind: 'note', title: '一点儿，很多', illustration: '⚖️',
    lines: [
      L('一点儿蜂蜜。', '🍯'), L('一些蜂蜜。', '🍯🍯'), L('很多蜂蜜。', '🍯🍯🍯🍯🍯'), L('蜂蜜少一点儿。', '➖🍯'),
      L('只要蜂蜜，不要水。', '🍯✅💧❌'), L('薄荷和柠檬都要两片。', '🌿🍋✌️'), L('一大杯。', '☕☕☕'), L('一小杯。', '☕'),
    ],
  },
  // ---- 13
  {
    id: 'p_daytime', stage: 13, kind: 'note', title: '早上、中午、下午', illustration: '🌅',
    lines: [L('早上好！', '🌅'), L('中午好！', '☀️'), L('下午好！', '🌇'), L('晚上好！', '🌙'), L('一天', '📅'), L('一个星期', '📆'), L('一个小时', '🕐')],
  },
  {
    id: 'p_timeline', stage: 13, kind: 'note', title: '昨天、今天、明天', illustration: '📅',
    lines: [L('昨天', '⬅️📅'), L('今天', '📅'), L('明天', '📅➡️'), L('现在', '⏰'), L('睡觉以前', '⏪😴'), L('喝茶以后', '🍵⏩'), L('我在家。', '🏠'), L('明天见！', '👋')],
  },
  {
    id: 'p_honey_milk', stage: 13, kind: 'recipe', recipe: 'honey_milk', title: '蜂蜜牛奶', illustration: '🍯🥛',
    lines: [L('牛奶', '🥛', 'item'), L('一勺蜂蜜', '🍯', 'item'), L('热的。', '🔥', 'item'), L('睡觉以前一个小时喝。', '😴', 'step'), L('晚上别喝茶！', '🌙🚫🍵', 'warning')],
  },
  // ---- 14
  {
    id: 'p_weather', stage: 14, kind: 'note', title: '天气', illustration: '🌤️',
    lines: [L('今天很热。', '☀️🔥'), L('今天很冷。', '❄️'), L('今天是晴天。', '☀️'), L('下雨了。', '🌧️'), L('下雪了。', '⛄'), L('今天刮风。', '💨')],
  },
  {
    id: 'p_seasons', stage: 14, kind: 'note', title: '四个季节', illustration: '🍃',
    lines: [L('春天', '🌸'), L('夏天', '🌻'), L('秋天', '🍂'), L('冬天', '☃️'), L('夏天，喝冰的。', '🌻🧊'), L('冬天，喝热的。', '☃️🔥')],
  },
  {
    id: 'p_warmcool', stage: 14, kind: 'note', title: '暖和，凉快', illustration: '🌡️',
    lines: [L('暖和：姜、红枣、肉桂。', '🧣'), L('凉快：薄荷、冰、菊花、西瓜。', '🌬️')],
  },
  { id: 'p_watermelon', stage: 14, kind: 'ingredient', ingredient: 'watermelon', title: '西瓜', illustration: '🍉', lines: [L('甜。', '🍬'), L('要冰的。', '🧊'), L('西瓜和薄荷，很好喝。', '🌿')] },
  // ---- 15
  {
    id: 'p_body', stage: 15, kind: 'note', title: '我的身体', illustration: '🧍',
    lines: [
      L('头', '🙂'), L('眼睛', '👁️'), L('肚子', '🫃'), L('身体', '🧍'),
      L('我头疼。', '🤕🙂'), L('我肚子疼。', '🤕🫃'), L('我咳嗽。', '😷'), L('我发烧了。', '🌡️'), L('我生病了。', '🤒'),
    ],
  },
  {
    id: 'p_doctor', stage: 15, kind: 'note', title: '医生', illustration: '🧑‍⚕️',
    lines: [L('茶不是药。', '🍵💊', 'warning'), L('休息。喝热水。', '🛌☕'), L('很不舒服？看医生。', '🧑‍⚕️', 'warning')],
  },
  { id: 'p_eyes', stage: 15, kind: 'note', title: '眼睛累了', illustration: '👁️', lines: [L('眼睛累的时候，喝菊花绿茶。', '👁️🌼🍵', 'goodFor')] },
  { id: 'p_pear', stage: 15, kind: 'ingredient', ingredient: 'pear', title: '梨', illustration: '🍐', lines: [L('甜。', '🍬'), L('梨和蜂蜜，很好喝。', '🍯'), L('要煮。', '🍲')] },
  {
    id: 'p_pear_honey', stage: 15, kind: 'recipe', recipe: 'pear_honey', title: '蜂蜜梨茶', illustration: '🍐🍯',
    lines: [L('一个梨', '🍐', 'item'), L('一勺蜂蜜', '🍯', 'item'), L('煮十分钟。', '🍲⏱️', 'step'), L('热的。', '🔥', 'item'), L('咳嗽的时候喝。', '😷', 'goodFor')],
  },
  {
    id: 'p_ginger_water', stage: 15, kind: 'recipe', recipe: 'ginger_water', title: '姜水', illustration: '🫚💧',
    lines: [L('两片姜', '🫚', 'item'), L('一杯水', '💧', 'item'), L('热的。', '🔥', 'item'), L('肚子疼的时候喝。', '🫃', 'goodFor'), L('别加冰，别加薄荷！', '🚫🧊🌿', 'warning')],
  },
  {
    id: 'p_mint_chrysanthemum', stage: 15, kind: 'recipe', recipe: 'mint_chrysanthemum', title: '薄荷菊花茶', illustration: '🌿🌼',
    lines: [L('两片薄荷', '🌿', 'item'), L('两朵菊花', '🌼', 'item'), L('冰的。', '🧊', 'item'), L('头疼的时候喝。', '🤕', 'goodFor')],
  },
  // ---- 16
  {
    id: 'p_feelings', stage: 16, kind: 'note', title: '高兴，难过', illustration: '😄',
    lines: [L('高兴', '😄'), L('难过', '😢'), L('生气', '😠'), L('担心', '😟'), L('饿', '🍽️'), L('渴', '🥵'), L('困', '🥱'), L('不错', '🌟'), L('真好吃', '😋'), L('味道', '👅')],
  },
  {
    id: 'p_remedies', stage: 16, kind: 'note', title: '难过，生气，饿', illustration: '💡',
    lines: [
      L('难过？喝甜的。', '😢🍯'), L('生气？喝冰的薄荷茶。', '😠🌿🧊'), L('担心，睡不着？菊花和红枣。', '😟🌼🔴'),
      L('困？薄荷绿茶。', '🥱🌿🍵'), L('饿了？香蕉牛奶，很好吃。', '🍽️🍌🥛'), L('渴？西瓜和薄荷，冰的。', '🥵🍉🌿'),
    ],
  },
  {
    id: 'p_watermelon_mint', stage: 16, kind: 'recipe', recipe: 'watermelon_mint', title: '西瓜薄荷茶', illustration: '🍉🌿',
    lines: [L('两块西瓜', '🍉', 'item'), L('两片薄荷', '🌿', 'item'), L('冰的。', '🧊', 'item'), L('渴的时候喝。', '🥵', 'goodFor'), L('天气热的时候喝。', '☀️', 'goodFor')],
  },
  // ---- 17
  {
    id: 'p_allergy', stage: 17, kind: 'note', title: '我不能…', illustration: '🤧',
    lines: [
      L('我过敏，不要蜂蜜。', '🤧🍯', 'warning'), L('我不能喝牛奶。', '🚫🥛'), L('我不喜欢甜的。', '🙅🍬'), L('我爱蜂蜜。', '💕🍯'),
      L('我最喜欢姜茶。', '⭐🫚'), L('不要糖或者蜂蜜。', '🚫🍬🍯'),
    ],
  },
  {
    id: 'p_can', stage: 17, kind: 'note', title: '可以…吗？', illustration: '🙋',
    lines: [L('我可以要茶吗？', '🙋🍵'), L('我需要热水。', '🆘☕'), L('你知道姜茶吗？', '🧠🫚'), L('我想喝茶。', '💭🍵'), L('柠檬或者薄荷？', '🍋🔀🌿'), L('别的茶。', '🍵🔄'), L('和朋友一起喝。', '👭🍵')],
  },
  // ---- 18
  {
    id: 'p_colors', stage: 18, kind: 'note', title: '红、绿、黄、白、黑', illustration: '🎨',
    lines: [L('红', '🟥'), L('绿', '🟩'), L('黄', '🟨'), L('白', '⬜'), L('黑', '⬛'), L('红花：玫瑰。', '🌹'), L('黄花：菊花。', '🌼'), L('白糖。', '⬜🍬')],
  },
  {
    id: 'p_compare', stage: 18, kind: 'note', title: '比、更、最', illustration: '⚖️',
    lines: [
      L('蜂蜜比糖更甜。', '🍯🍬'), L('浓茶：三勺。', '💪🥄🥄🥄'), L('淡茶：一勺。', '🪶🥄'),
      L('一样。', '🟰'), L('不同的茶。', '↔️'), L('我的好朋友。', '🧑‍🤝‍🧑🏆'),
    ],
  },
  { id: 'p_rose', stage: 18, kind: 'ingredient', ingredient: 'rose', title: '玫瑰', illustration: '🌹', lines: [L('红花。', '🌹'), L('玫瑰和红茶，很好喝。', '🫖')] },
  {
    id: 'p_rose_tea', stage: 18, kind: 'recipe', recipe: 'rose_tea', title: '玫瑰茶', illustration: '🌹🫖',
    lines: [L('两朵玫瑰', '🌹', 'item'), L('一勺红茶', '🫖', 'item'), L('泡三分钟。', '⏳', 'step'), L('热的。', '🔥', 'item')],
  },
  // ---- 19
  {
    id: 'p_verbs', stage: 19, kind: 'note', title: '做，买，吃，去', illustration: '🛠️',
    lines: [L('做', '🛠️'), L('买东西', '🛒'), L('吃', '🍴'), L('去', '🏃'), L('等', '🕰️'), L('试', '🧪'), L('帮', '🛟'), L('工作', '💼'), L('带', '👜'), L('走', '🚶‍♂️'), L('回家', '↩️🏠')],
  },
  {
    id: 'p_coffee', stage: 19, kind: 'ingredient', ingredient: 'coffee', title: '咖啡', illustration: '☕',
    lines: [L('苦。', '😣'), L('孩子不要喝。', '🧒🚫', 'warning'), L('晚上别喝。', '🌙🚫', 'warning'), L('咖啡和牛奶，很好喝。', '🥛')],
  },
  {
    id: 'p_coffee_milk', stage: 19, kind: 'recipe', recipe: 'coffee_milk', title: '咖啡牛奶', illustration: '☕🥛',
    lines: [L('一勺咖啡', '☕', 'item'), L('牛奶', '🥛', 'item'), L('搅拌。热的。', '🌀', 'step'), L('孩子不要喝。', '🧒🚫', 'warning')],
  },
  // ---- 20
  {
    id: 'p_questions', stage: 20, kind: 'note', title: '什么？谁？为什么？', illustration: '❔',
    lines: [L('什么？', '❔'), L('谁？', '🕵️'), L('哪个？', '🔍'), L('为什么？', '🤔'), L('什么时候？', '🕒'), L('怎么做？', '🔧'), L('怎么样？', '💡'), L('几片？', '🍋🍋🍋❔'), L('这儿。', '📍'), L('哪儿？', '📌'), L('蜂蜜还是糖？', '🍯🔀🍬'), L('那是什么？', '🫳')],
  },
  { id: 'p_yogurt', stage: 20, kind: 'ingredient', ingredient: 'yogurt', title: '酸奶', illustration: '🥣', lines: [L('酸。', '😖'), L('要冰的。', '🧊'), L('酸奶和苹果，很好喝。', '🍎')] },
  {
    id: 'p_apple_yogurt', stage: 20, kind: 'recipe', recipe: 'apple_yogurt', title: '苹果酸奶', illustration: '🍎🥣',
    lines: [L('酸奶', '🥣', 'item'), L('一片苹果', '🍎', 'item'), L('冰的。', '🧊', 'item'), L('加蜂蜜，很好喝。', '🍯')],
  },
  // ---- 21
  {
    id: 'p_conditions', stage: 21, kind: 'note', title: '如果、所以、因为、但是', illustration: '🔗',
    lines: [
      L('如果天气热，喝冰的。', '☀️🧊'), L('如果睡不着，喝菊花红枣茶。', '😳🌼🔴'), L('如果咳嗽，喝蜂蜜梨茶。', '😷🍐'),
      L('今天很冷，所以我要热茶。', '❄️☕'), L('茶很苦，但是加蜂蜜很好喝。', '🍵😣🍯'), L('因为很甜，所以我喜欢。', '❤️🍬'),
      L('先泡茶，然后加牛奶。', '⏳➡️🥛'),
    ],
  },
  {
    id: 'p_instead', stage: 21, kind: 'note', title: '换、除了、已经', illustration: '🔃',
    lines: [L('不要糖，换蜂蜜。', '🍯➡️🍬'), L('就要蜂蜜。', '🍯'), L('除了绿茶，什么茶都可以。', '🍵🚫'), L('喝完了。', '🏁'), L('也要薄荷。', '➕🌿'), L('还渴。', '🥵'), L('已经热了。', '✔️🔥'), L('我总是喝绿茶。', '♾️🍵')],
  },
  // ---- 22
  {
    id: 'p_meals', stage: 22, kind: 'note', title: '早饭、午饭、晚饭', illustration: '🍽️',
    lines: [L('早饭', '🍳'), L('午饭', '🍱'), L('晚饭', '🍝'), L('晚饭以后，喝绿茶。', '🍝🍵'), L('晚饭以后，别喝咖啡。', '☕🚫', 'warning')],
  },
  {
    id: 'p_often', stage: 22, kind: 'note', title: '每天，常常，从来不', illustration: '📊',
    lines: [L('总是', '♾️✅✅✅✅'), L('一般', '✅✅✅'), L('常常', '✅✅✅'), L('有时候', '✅'), L('从来不', '🚫'), L('每天', '📅🔂'), L('每天早上', '🌅🔂')],
  },
  {
    id: 'p_prices', stage: 22, kind: 'note', title: '钱，便宜，贵', illustration: '💴',
    lines: [
      L('柠檬：三{块|kuai_money}一个。', '🍋🪙🪙🪙'), L('薄荷：四{块|kuai_money}一把。', '🌿🪙🪙🪙🪙'), L('姜：四{块|kuai_money}一袋。', '🫚🪙🪙🪙🪙'), L('糖：六{块|kuai_money}一袋。', '🍬🪙🪙🪙🪙🪙🪙'), L('蜂蜜：九{块|kuai_money}一瓶。', '🍯🪙×9'),
      L('便宜', '🪙'), L('贵', '💎'), L('钱', '💴'), L('多少钱？', '💰❔'), L('蜂蜜比糖贵。', '🍯💎'),
    ],
  },
  // ---- 23
  {
    id: 'p_polite', stage: 23, kind: 'note', title: '好的，当然，没问题', illustration: '🙏',
    lines: [
      L('好的！', '🆗'), L('当然！', '🙆‍♀️'), L('没问题！', '🙆'), L('我觉得很好。', '💭👍'), L('苹果茶怎么样？', '💡🍎'), L('我想要绿茶。', '🎩🍵'),
      L('对！', '✅'), L('错了。', '❌'), L('早。', '🐓'), L('晚。', '🌃'), L('下次。', '⏭️'), L('上次。', '⏮️'), L('其实……', '🔎'), L('特别甜。', '🌠🍬'), L('比较甜。', '📏🍬'), L('我一定再来。', '📌'),
    ],
  },
];

const R = (id: string, kind: Reaction['kind'], stage: number, text: string, face: Reaction['face'], when?: Reaction['when']): Reaction => ({ id, kind, stage, text, face, ...(when ? { when } : {}) });

export const REACTIONS2: Reaction[] = [
  R('r10_bye', 'perfect', 10, '谢谢！再见！', 'happy'),
  R('r10_yours', 'perfect', 10, '你的茶很好喝！', 'delighted'),
  R('r10_sorry', 'wrong', 10, '对不起，我要{ing}。', 'puzzled'),
  R('r10_have', 'missing', 10, '你有{ing}吗？', 'puzzled'),
  R('r10_sorry2', 'extra', 10, '对不起，不要{ing}。', 'puzzled'),
  R('r10_noproblem', 'too_little', 10, '{ing}太少了。没关系。', 'neutral'),
  R('r11_family', 'perfect', 11, '谢谢！我家很喜欢。', 'delighted'),
  R('r12_hundred', 'perfect', 12, '一百！太好了！', 'delighted'),
  R('r12_little', 'too_little', 12, '再加一点儿{ing}。', 'neutral'),
  R('r12_less', 'too_much', 12, '{ing}少一点儿！', 'sad'),
  R('r12_half', 'perfect', 12, '好喝！一半我喝，一半给妈妈。', 'delighted'),
  R('r13_tomorrow', 'perfect', 13, '谢谢！明天见！', 'happy'),
  R('r14_today', 'perfect', 14, '今天的茶很好！谢谢！', 'delighted'),
  R('r15_rest', 'perfect', 15, '谢谢，我舒服多了。我要休息。', 'delighted', { symptom: true }),
  R('r15_cool', 'forbidden_tag', 15, '太凉快了！我肚子疼！', 'angry', { tags: ['cooling'] }),
  R('r16_taste', 'perfect', 16, '哇！味道真不错！', 'delighted'),
  R('r16_excellent', 'perfect', 16, '真好喝！', 'delighted'),
  R('r16_nice', 'perfect', 16, '真不错！', 'happy'),
  R('r16_sad', 'any_fail', 16, '我很难过……', 'sad'),
  R('r17_cant', 'forbidden', 17, '我不能喝{ing}！', 'angry'),
  R('r17_dislike', 'forbidden_tag', 17, '我不喜欢{tag}的！', 'angry', { tags: ['sweet', 'sour', 'bitter', 'salty'] }),
  R('r17_dontwant', 'extra', 17, '不对，我不想要{ing}。', 'puzzled'),
  R('r18_more', 'too_much', 18, '比我要的多。{ing}少一点儿。', 'neutral'),
  R('r18_best', 'perfect', 18, '这是最好喝的茶！谢谢！', 'delighted'),
  R('r19_wait', 'wrong', 19, '等等！我要{ing}！', 'puzzled'),
  R('r19_going', 'perfect', 19, '太好了！我要回家了。谢谢！', 'happy'),
  R('r19_leave', 'perfect', 19, '谢谢！我走了！', 'happy'),
  R('r19_empty', 'empty', 19, '我在等……', 'puzzled'),
  R('r20_why', 'wrong_temp', 20, '为什么不是{temp}的？', 'puzzled'),
  R('r20_how', 'wrong_temp', 20, '怎么不是{temp}的？', 'puzzled'),
  R('r20_who', 'empty', 20, '谁在这儿？', 'puzzled'),
  R('r20_where', 'missing', 20, '{ing}在哪儿？', 'puzzled'),
  R('r20_what', 'extra', 20, '这是什么？不要{ing}！', 'puzzled'),
  R('r20_that', 'wrong', 20, '那不是{ing}！', 'puzzled'),
  R('r20_what2', 'too_much', 20, '这是什么？{ing}太多了！', 'sad'),
  R('r21_but', 'too_much', 21, '我喜欢{ing}，但是太多了。', 'sad'),
  R('r21_yet', 'wrong_temp', 21, '还不{temp}！', 'neutral'),
  R('r21_always', 'perfect', 21, '太好了！我总是来这儿。', 'delighted'),
  R('r22_everyday', 'perfect', 22, '太好了！我每天都来！', 'delighted', { returning: true }),
  R('r22_cheap', 'perfect', 22, '不贵，也好喝！', 'happy'),
  R('r23_wonderful', 'perfect', 23, '我觉得很好喝！', 'delighted'),
  R('r23_sure', 'perfect', 23, '好的，谢谢！我一定再来。', 'delighted'),
  R('r23_problem', 'too_little', 23, '没问题！{ing}再多一点儿。', 'neutral'),
  R('r23_tebie', 'perfect', 23, '特别好喝！', 'delighted'),
];
