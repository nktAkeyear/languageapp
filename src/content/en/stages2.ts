/**
 * English content for stages 10–23 (A1 → A2). Structure (order rules, template slots) lives in
 * shared/curriculum.ts; this file is the English text only.
 */
import type { BookPage, Customer, IngredientText, PageLine, Reaction, SymptomText } from '../../core/types';

export const NUMBERS2: Record<number, string> = { 6: 'six', 7: 'seven', 8: 'eight', 9: 'nine', 10: 'ten' };
export const TAG_WORDS2 = { warming: 'warm', cooling: 'cool' } as const;

export const INGREDIENTS2: IngredientText[] = [
  { ingredient: 'apple', word: 'apple', qty: { one: 'one apple slice', other: '{n} apple slices' } },
  { ingredient: 'banana', word: 'banana', qty: { one: 'one banana', other: '{n} bananas' } },
  { ingredient: 'watermelon', word: 'watermelon', qty: { one: 'one watermelon slice', other: '{n} watermelon slices' } },
  { ingredient: 'pear', word: 'pear', qty: { one: 'one pear', other: '{n} pears' } },
  { ingredient: 'rose', word: 'rose', qty: { one: 'one rose', other: '{n} roses' } },
  { ingredient: 'coffee', word: 'coffee', qty: { one: 'one spoon of coffee', other: '{n} spoons of coffee' } },
  { ingredient: 'yogurt', word: 'yogurt' },
];

export const RECIPE_NAMES2: Record<string, string> = {
  apple_tea: 'apple tea',
  banana_milk: 'banana milk',
  honey_milk: 'honey milk',
  watermelon_mint: 'watermelon and mint tea',
  pear_honey: 'pear and honey tea',
  ginger_water: 'ginger water',
  mint_chrysanthemum: 'mint and chrysanthemum tea',
  rose_tea: 'rose tea',
  coffee_milk: 'coffee milk',
  apple_yogurt: 'apple yogurt',
};

export const SYMPTOMS2: SymptomText[] = [
  { symptom: 'cough', phrases: ['I have a cough.', 'Oh... I have a cough.'] },
  { symptom: 'headache', phrases: ['I have a headache.', 'My head hurts.'] },
  { symptom: 'stomachache', phrases: ['My stomach hurts.', 'Oh... my stomach hurts.'] },
  { symptom: 'thirsty', phrases: ["I'm thirsty.", "I'm thirsty. It's hot today."] },
];

export const CUSTOMERS2: Customer[] = [
  { id: 'c_mom', name: 'Anna', avatar: '👩‍🍼', stage: 11 },
  { id: 'c_girl', name: 'Lily', avatar: '👧', stage: 12 },
  { id: 'c_oldman', name: 'Grandpa Sam', avatar: '👴', stage: 13 },
  { id: 'c_doctor', name: 'Dr. Lane', avatar: '🧑‍⚕️', stage: 15 },
  { id: 'c_student', name: 'Ken', avatar: '🧑‍🎓', stage: 16 },
  { id: 'c_baker', name: 'Mrs. Hill', avatar: '👩‍🦳', stage: 18 },
];

export const ORDER_TEXTS: Record<string, string> = {
  // 10 — hello
  o10_hello: 'Hello! Apple, please.',
  o10_three: 'Hello! Three apple slices, please.',
  o10_tea: 'Apple tea, please.',
  o10_friend: 'Apple tea for my friend, please.',
  o10_have: 'Do you have apples? Two slices, please.',
  o10_audio: 'Hello! Apple tea for me, please.',
  o10_mint: 'Apple and mint, please. Cold.',
  o10_nocin: 'Hot apple tea, no cinnamon, please.',
  // 11 — family
  o11_banana: 'Banana, please.',
  o11_child: 'Banana milk for my child, please.',
  o11_husband: 'My husband has a {cold|cold_illness}.',
  o11_mother: 'My mother has a sore throat.',
  o11_father: 'My father is tired.',
  o11_baby: 'Banana milk for my baby, please. No honey!',
  o11_wife: 'My wife likes sweet tea. Two spoons of honey, please.',
  o11_sibs: 'Two cups of cold water for my brother and my sister, please.',
  o11_family: 'Three cups of hot water for my family at home, please.',
  o11_sister: 'My sister is tired.',
  // 12 — numbers, amounts
  o12_six: 'Six mint leaves, please.',
  o12_eight: 'Eight ice cubes and one lemon slice, please. Cold.',
  o12_sevennine: 'Seven mint leaves and nine ice cubes, please. Cold.',
  o12_little: 'A little honey, please.',
  o12_lot: 'A lot of mint, please. Cold.',
  o12_only: 'Only honey, please. No water.',
  o12_some: 'Ten mint leaves and some ice, please. Cold.',
  o12_less: 'Lemon and honey, please. Less honey.',
  o12_big: 'A big cup of cold water, please.',
  o12_small: 'A small cup of hot water, please.',
  o12_both: 'Mint and lemon, please. Two of each. Hot.',
  // 13 — time
  o13_morning: 'Good morning! Green tea, please.',
  o13_yday: 'Yesterday I drank lemon tea. Today I want mint tea.',
  o13_today: 'Honey tea today. Ginger tea tomorrow.',
  o13_afternoon: 'Good afternoon! Mint tea, cold, please.',
  o13_sleep: 'Honey milk before I sleep, please.',
  o13_evening: 'Good evening! Hot milk, please. No tea.',
  o13_now: 'Hot water now, please.',
  o13_habit: 'Green tea in the morning, black tea in the evening. Black tea now, please.',
  o13_tomorrow: 'Tomorrow, black tea. Today, no tea. Hot water, please.',
  // 14 — weather
  o14_hot: "It's hot today. Watermelon, please.",
  o14_rain: "It's raining. Hot ginger tea, please.",
  o14_sunny: "It's sunny today. Mint tea, cold, please.",
  o14_cold: "It's cold today. Something warm, please.",
  o14_snow: "It's snowing. Hot milk, please.",
  o14_wind: "It's windy and cold. Hot water with ginger, please.",
  o14_summer: 'In summer I like cold watermelon and mint.',
  o14_cool: "It's hot today. Cool mint tea, please.",
  o14_winter: 'In winter I like hot ginger tea with honey.',
  o14_spring: 'In spring I like green tea. Green tea, please.',
  o14_autumn: 'In autumn I like black tea. Hot black tea, please.',
  // 15 — body
  o15_cough: 'I have a cough.',
  o15_head: 'I have a headache.',
  o15_stomach: 'My stomach hurts.',
  o15_fever: 'My child has a fever. Hot water, please.',
  o15_doctor: 'The doctor said: no tea. Hot water with honey, please.',
  o15_sick: "I'm sick. My body is tired. Hot ginger tea, please.",
  o15_eyes: 'My eyes are tired.',
  o15_pear: 'Pear and honey, please. Boil it.',
  o15_mother: 'My mother has a cough.',
  o15_head2: 'My head hurts.',
  // 16 — feelings
  o16_hungry: "I'm hungry.",
  o16_thirsty: "I'm thirsty. It's hot today.",
  o16_sad: "I'm sad. Something sweet, please.",
  o16_angry: "I'm angry! Cold mint tea, please.",
  o16_worried: "I'm worried. I can't sleep.",
  o16_happy: "I'm really happy! Two spoons of honey, please.",
  o16_tired: "I'm really sleepy.",
  o16_bad: 'I feel bad. Hot water with ginger, please.',
  // 17 — can, need, allergy
  o17_allergy: "I'm allergic to honey. Lemon tea, please.",
  o17_milk: "I can't drink milk. Black tea, please.",
  o17_can: 'Can I have mint tea? Cold, please.',
  o17_need: 'I need three cups of hot water.',
  o17_love: 'I love honey. A lot of honey, please.',
  o17_fav: 'My favorite is ginger tea. Hot, please.',
  o17_or: 'Lemon or mint is good. Mint, please.',
  o17_dislike: "I don't like sweet. Lemon tea, please.",
  o17_nosugar: "Green tea, please. I don't want sugar or honey.",
  o17_know: 'Do you know ginger honey tea? I want it.',
  o17_any: 'Any tea, please. No sugar.',
  o17_other: 'Not green tea. The other tea, please.',
  o17_boil: 'Can you boil ginger and red dates, please?',
  // 18 — colours, comparison
  o18_red: 'Two red flowers, please.',
  o18_yellow: 'Three yellow flowers, please.',
  o18_strong: 'Strong green tea, please.',
  o18_weak: 'Weak black tea, please.',
  o18_sweeter: 'Something sweeter than sugar, please.',
  o18_rose: 'Rose tea, please.',
  o18_white: 'Black tea with two spoons of white sugar, please.',
  o18_bestfriend: 'My best friend has a {cold|cold_illness}.',
  o18_same: 'Yesterday, mint tea. Today, the same, please.',
  o18_diff: 'A different tea today. Not lemon. Ginger, please.',
  o18_strongblack: 'Strong black tea, no sugar, please.',
  // 19 — everyday verbs
  o19_coffee: 'Coffee, please.',
  o19_make: 'Can you make coffee milk, please? Hot.',
  o19_work: 'I work at night. Coffee, no milk, please.',
  o19_buy: 'I want to buy ginger honey tea for my mother.',
  o19_try: 'Please give me apple tea. I want to try it.',
  o19_going: "I'm going to work. Coffee with milk, please.",
  o19_wait: "I'm waiting for my friend. Please bring me hot water.",
  o19_eat: 'I want to eat something. Banana milk, please.',
  o19_help: 'Can you help me? My head hurts.',
  o19_home: 'Hot ginger tea to take home, please.',
  o19_back: "I'm back! Apple tea again, please.",
  o19_recipe: 'I like your recipe. Honey lemon tea, please.',
  // 20 — questions
  o20_cough: 'What is good for a cough?',
  o20_throat: 'What is good for a sore throat?',
  o20_yogurt: 'Do you have yogurt? Cold, please.',
  o20_there: 'Where is the honey? Is there honey? Two spoons, please.',
  o20_here: 'Green tea, please. I want to drink it here.',
  o20_when: "When I'm tired, I want mint green tea.",
  o20_howmany: 'How many ginger slices? Two. And one spoon of honey. Hot, please.',
  o20_howmuch: 'Lemon tea, please, and honey. How many spoons? One.',
  o20_how: 'How do you make ginger honey tea? I want one.',
  o20_which: 'Which tea is good for a headache?',
  // 21 — because, so, if, but
  o21_so: "I can't sleep, so I want chrysanthemum and red date tea.",
  o21_but: "I like sweet, but I can't have honey. Sugar, please.",
  o21_because: "Because I work too much, I'm tired. Mint green tea, please.",
  o21_if: "If it's hot, I want cold tea. If it's cold, I want hot tea. It's hot today. Mint tea, please.",
  o21_already: 'I already had honey today. No honey, please. Hot ginger tea.',
  o21_then: 'Steep green tea, then add mint, please.',
  o21_always: 'I always drink green tea. Also mint, please.',
  o21_instead: 'Green tea, please. Honey instead of sugar.',
  o21_except: 'Any tea except green tea, please.',
  o21_still: "Hot water again, please. I'm still thirsty.",
  o21_just: 'Just ginger, please. No water.',
  // 22 — habits, meals, money
  o22_every: 'I drink green tea every morning. Two spoons, please.',
  o22_never: 'I never drink coffee. Black tea, please.',
  o22_usually: 'I usually have milk tea. Today, black tea, no milk, please.',
  o22_after: 'After dinner I drink green tea. Weak green tea, please.',
  o22_breakfast: 'Breakfast: banana milk, please. Cold.',
  o22_lunch: 'At lunch I sometimes drink coffee. Coffee, please.',
  o22_cheaper: 'What is the price of honey? And sugar? The cheaper one, please.',
  o22_expensive: 'How much is honey? How much is ginger? The more expensive one, please.',
  o22_everyday: 'I drink hot water every day. Today, cold, please.',
  o22_often: "I often can't sleep. Chrysanthemum and red date tea, please.",
  // 23 — opinions, polite requests
  o23_think: 'I think I need strong green tea. Three spoons, please.',
  o23_howabout: 'How about ginger honey tea? Yes, please.',
  o23_maybe: "It's cold today. Maybe ginger tea? Hot, please.",
  o23_course: 'Do you have honey lemon tea? Of course! One, please.',
  o23_would: 'I would like a hot green tea, please.',
  o23_actually: 'Actually, I want cold mint tea.',
  o23_especially: 'I like fruit tea, especially apple tea.',
  o23_quite: 'I like tea quite sweet. Three spoons of honey, please.',
  o23_last: 'Last time, honey tea. Today, the same, please.',
  o23_late: "It's late. I want to sleep. Hot milk, no tea, please. Tea next time.",
  o23_early: "Good morning! I'm early today. Green tea, please.",
};

export const TEMPLATE_TEXTS: Record<string, string> = {
  t10_hello: 'Hello! {Ing}, please.',
  t10_have: 'Do you have {ing}?',
  t10_friend: '{Recipe} for my friend, please.',
  t11_mother: '{Recipe} for my mother, please.',
  t11_husband: '{Recipe} for my husband, please.',
  t11_child: '{Recipe} for my child, please.',
  t12_big: '{Q}, please.',
  t12_little: 'A little {ing}, please.',
  t12_lot: 'A lot of mint, please.',
  t12_enough: '{Q} is enough. Not too much, please.',
  t13_morning: 'Good morning! {Ing}, please.',
  t13_evening: 'Good evening! {Ing}, no tea, please.',
  t13_yesterday: 'Yesterday I drank {f} tea. Today I want {ing} tea.',
  t14_hot: "It's hot today. {Ing}, cold, please.",
  t14_cold: "It's cold today. {Ing}, hot, please.",
  t14_summer: 'In summer I like cold {ing} tea.',
  t14_winter: 'In winter I like hot {ing} tea.',
  t15_doctor: 'The doctor said: no tea. {Temp} water, please.',
  t16_sad: "I'm sad. Something {taste}, please.",
  t17_allergy: "I'm allergic to {f}. {Ing}, please.",
  t17_dislike: "I don't like {nt}. {Ing}, please.",
  t17_can: 'Can I have {ing}? {Temp}, please.',
  t18_yellow: 'Three yellow flowers, please.',
  t18_red: 'Two red flowers, please.',
  t18_strong: 'Strong green tea, please.',
  t18_weak: 'Weak black tea, please.',
  t18_sweeter: 'Something sweeter than sugar, please.',
  t19_make: '{Recipe}. Can you make it, please?',
  t19_try: 'I want to try {recipe}.',
  t19_buy: 'I want to buy {q}.',
  t19_work: 'I work at night. {Ing}, please.',
  t20_cough: 'What is good for a cough?',
  t20_throat: 'What is good for a sore throat?',
  t20_headache: 'What is good for a headache?',
  t20_stomach: 'What is good for my stomach?',
  t20_there: 'Is there any {ing}? I want some.',
  t20_have: 'Do you have {ing}? {Temp}, please.',
  t21_but: '{Ing}, please, but no {f}.',
  t21_also: '{Ing1}, please. Also {ing2}.',
  t21_except: 'Any tea except {f}, please.',
  t21_instead: '{Ing} instead of {f}, please.',
  t22_every: 'I drink {ing} every day. {Temp}, please.',
  t22_never: 'I never drink {f}. {Ing}, please.',
  t23_would: 'I would like {q}, please.',
  t23_think: 'I think I need {q}.',
  t23_maybe: 'Maybe {ing}, please.',
  t23_actually: 'Actually, I want {temp} {ing}.',
};

const L = (text: string, icon?: string, style?: PageLine['style']): PageLine => ({ text, ...(icon ? { icon } : {}), ...(style ? { style } : {}) });

export const PAGES2: BookPage[] = [
  // ---- 10
  {
    id: 'p_greeting', stage: 10, kind: 'note', title: 'Hello and goodbye', illustration: '👋',
    lines: [L('Hello!', '👋'), L('Welcome!', '🏮'), L('Thanks!', '😊'), L('Sorry!', '🙇'), L('Thank you. Come again!', '🙏'), L('Goodbye!', '🚪')],
  },
  {
    id: 'p_you', stage: 10, kind: 'note', title: 'You and me', illustration: '🧑‍🤝‍🧑',
    lines: [L('You.', '👉🙂'), L('Your tea.', '👉🍵'), L('Me.', '🙋'), L('Tea for me.', '🙋🍵'), L('My friend.', '🧑‍🤝‍🧑'), L('Do you have mint?', '🙂🌿❔')],
  },
  { id: 'p_apple', stage: 10, kind: 'ingredient', ingredient: 'apple', title: 'Apple', illustration: '🍎', lines: [L('Sweet.', '🍬'), L('Apple is a fruit.', '🍎🍇'), L('Good with black tea.', '🫖')] },
  {
    id: 'p_apple_tea', stage: 10, kind: 'recipe', recipe: 'apple_tea', title: 'Apple tea', illustration: '🍎🫖',
    lines: [L('Two apple slices', '🍎', 'item'), L('One spoon of black tea', '🫖', 'item'), L('Hot.', '🔥', 'item'), L('Good with a friend.', '🧑‍🤝‍🧑')],
  },
  // ---- 11
  {
    id: 'p_family', stage: 11, kind: 'note', title: 'My family', illustration: '👨‍👩‍👧‍👦',
    lines: [L('mother', '👩'), L('father', '👨'), L('child', '🧒'), L('baby', '👶'), L('husband', '🤵'), L('wife', '👰'), L('brother', '🧑'), L('sister', '👩‍🦰'), L('family', '👨‍👩‍👧‍👦'), L('home', '🏠')],
  },
  {
    id: 'p_babies', stage: 11, kind: 'note', title: 'Babies and children', illustration: '👶',
    lines: [L('No honey for babies.', '🍯🚫👶', 'warning'), L('No tea for children.', '🍵🚫🧒', 'warning'), L('Banana milk is good for children.', '🍌🥛')],
  },
  { id: 'p_banana', stage: 11, kind: 'ingredient', ingredient: 'banana', title: 'Banana', illustration: '🍌', lines: [L('Sweet.', '🍬'), L('Good with milk.', '🥛')] },
  {
    id: 'p_banana_milk', stage: 11, kind: 'recipe', recipe: 'banana_milk', title: 'Banana milk', illustration: '🍌🥛',
    lines: [L('One banana', '🍌', 'item'), L('Milk', '🥛', 'item'), L('Cold.', '🧊', 'item'), L('For children.', '🧒', 'goodFor'), L('No tea.', '🚫🍵', 'warning')],
  },
  // ---- 12
  {
    id: 'p_numbers2', stage: 12, kind: 'note', title: 'Six, seven, eight, nine, ten', illustration: '🔢',
    lines: [
      L('six', '🍋🍋🍋🍋🍋🍋'), L('seven', '🍋🍋🍋🍋🍋🍋🍋'), L('eight', '🍋🍋🍋🍋🍋🍋🍋🍋'), L('nine', '🍋🍋🍋🍋🍋🍋🍋🍋🍋'),
      L('ten', '🔟'), L('twenty', '2️⃣0️⃣'), L('thirty', '3️⃣0️⃣'), L('forty', '4️⃣0️⃣'), L('fifty', '5️⃣0️⃣'), L('one hundred', '💯'),
    ],
  },
  {
    id: 'p_numbers3', stage: 12, kind: 'note', title: 'Eleven, twelve … ninety-nine', illustration: '🔢',
    lines: [L('eleven', '1️⃣1️⃣'), L('twelve', '1️⃣2️⃣'), L('thirteen', '1️⃣3️⃣'), L('fourteen', '1️⃣4️⃣'), L('fifteen', '1️⃣5️⃣'), L('sixteen', '1️⃣6️⃣'), L('seventeen', '1️⃣7️⃣'), L('eighteen', '1️⃣8️⃣'), L('nineteen', '1️⃣9️⃣'), L('twenty-five', '2️⃣5️⃣'), L('sixty', '6️⃣0️⃣'), L('seventy', '7️⃣0️⃣'), L('eighty', '8️⃣0️⃣'), L('ninety', '9️⃣0️⃣'), L('ninety-nine', '9️⃣9️⃣'), L('Fifteen coins.', '🪙1️⃣5️⃣')],
  },
  {
    id: 'p_amounts', stage: 12, kind: 'note', title: 'More and less', illustration: '⚖️',
    lines: [L('A little honey.', '🍯'), L('Some honey.', '🍯🍯'), L('A lot of honey.', '🍯🍯🍯🍯🍯'), L('More honey.', '➕🍯'), L('Less honey.', '➖🍯'), L('Only honey. No water.', '🍯✅💧❌'), L('A big cup.', '☕☕☕'), L('A small cup.', '☕'), L('Two of each.', '🍋🍋🌿🌿')],
  },
  // ---- 13
  {
    id: 'p_daytime', stage: 13, kind: 'note', title: 'Morning, afternoon, evening', illustration: '🌅',
    lines: [L('Good morning!', '🌅'), L('Good afternoon!', '🌇'), L('Good evening!', '🌆'), L('Good night!', '🌙'), L('one day', '📅'), L('one week', '📆'), L('one hour', '🕐')],
  },
  {
    id: 'p_timeline', stage: 13, kind: 'note', title: 'Yesterday, today, tomorrow', illustration: '📅',
    lines: [L('yesterday', '⬅️📅'), L('today', '📅'), L('tomorrow', '📅➡️'), L('now', '⏰'), L('Before tea.', '⏪🍵'), L('After tea.', '🍵⏩'), L('See you tomorrow!', '👋')],
  },
  {
    id: 'p_honey_milk', stage: 13, kind: 'recipe', recipe: 'honey_milk', title: 'Honey milk', illustration: '🍯🥛',
    lines: [L('Milk', '🥛', 'item'), L('One spoon of honey', '🍯', 'item'), L('Hot.', '🔥', 'item'), L('Drink it one hour before you sleep.', '😴', 'step'), L('No tea at night.', '🌙🚫🍵', 'warning')],
  },
  // ---- 14
  {
    id: 'p_weather', stage: 14, kind: 'note', title: 'Weather', illustration: '🌤️',
    lines: [L("It's hot today.", '☀️🔥'), L("It's cold today.", '❄️'), L("It's sunny.", '☀️'), L("It's raining.", '🌧️'), L("It's snowing.", '⛄'), L("It's windy.", '💨')],
  },
  {
    id: 'p_seasons', stage: 14, kind: 'note', title: 'Four seasons', illustration: '🍃',
    lines: [L('spring', '🌸'), L('summer', '🌻'), L('autumn', '🍂'), L('winter', '☃️'), L('In summer: cold drinks.', '🌻🧊'), L('In winter: hot drinks.', '☃️🔥')],
  },
  {
    id: 'p_warmcool', stage: 14, kind: 'note', title: 'Warm and cool', illustration: '🌡️',
    lines: [L('Warm: ginger, red dates, cinnamon.', '🧣'), L('Cool: mint, ice, chrysanthemum, watermelon.', '🌬️')],
  },
  { id: 'p_watermelon', stage: 14, kind: 'ingredient', ingredient: 'watermelon', title: 'Watermelon', illustration: '🍉', lines: [L('Sweet.', '🍬'), L('Cold only.', '🧊'), L('Good with mint.', '🌿')] },
  // ---- 15
  {
    id: 'p_body', stage: 15, kind: 'note', title: 'My body', illustration: '🧍',
    lines: [
      L('head', '🙂'), L('eye', '👁️'), L('stomach', '🫃'), L('body', '🧍'),
      L('My head hurts.', '🤕🙂'), L('My stomach hurts.', '🤕🫃'), L('I have a cough.', '😷'), L('I have a fever.', '🌡️'), L('I have a headache.', '🤯'), L("I'm sick.", '🤒'),
    ],
  },
  {
    id: 'p_doctor', stage: 15, kind: 'note', title: 'Doctor', illustration: '🧑‍⚕️',
    lines: [L('Tea is not medicine.', '🍵💊', 'warning'), L('Rest. Drink hot water.', '🛌☕'), L('Very sick? See a doctor.', '🧑‍⚕️', 'warning')],
  },
  { id: 'p_eyes', stage: 15, kind: 'note', title: 'Tired eyes', illustration: '👁️', lines: [L('Tired eyes? Chrysanthemum green tea.', '👁️🌼🍵', 'goodFor')] },
  { id: 'p_pear', stage: 15, kind: 'ingredient', ingredient: 'pear', title: 'Pear', illustration: '🍐', lines: [L('Sweet.', '🍬'), L('Good with honey.', '🍯'), L('Boil it.', '🍲')] },
  {
    id: 'p_pear_honey', stage: 15, kind: 'recipe', recipe: 'pear_honey', title: 'Pear and honey tea', illustration: '🍐🍯',
    lines: [L('One pear', '🍐', 'item'), L('One spoon of honey', '🍯', 'item'), L('Boil for ten minutes.', '🍲⏱️', 'step'), L('Hot.', '🔥', 'item'), L('Cough? Drink this.', '😷', 'goodFor')],
  },
  {
    id: 'p_ginger_water', stage: 15, kind: 'recipe', recipe: 'ginger_water', title: 'Ginger water', illustration: '🫚💧',
    lines: [L('Two ginger slices', '🫚', 'item'), L('One cup of water', '💧', 'item'), L('Hot.', '🔥', 'item'), L('Stomach hurts? Drink this.', '🫃', 'goodFor'), L('No ice. No mint.', '🚫🧊🌿', 'warning')],
  },
  {
    id: 'p_mint_chrysanthemum', stage: 15, kind: 'recipe', recipe: 'mint_chrysanthemum', title: 'Mint and chrysanthemum tea', illustration: '🌿🌼',
    lines: [L('Two mint leaves', '🌿', 'item'), L('Two chrysanthemums', '🌼', 'item'), L('Cold.', '🧊', 'item'), L('Headache? Drink this.', '🤯', 'goodFor')],
  },
  // ---- 16
  {
    id: 'p_feelings', stage: 16, kind: 'note', title: 'Happy, sad, angry', illustration: '😄',
    lines: [L('happy', '😄'), L('sad', '😢'), L('angry', '😠'), L('worried', '😟'), L('hungry', '🍽️'), L('thirsty', '🥵'), L('sleepy', '🥱'), L('great', '🎉'), L('nice', '🌟'), L('lovely', '💖'), L('bad', '👎')],
  },
  {
    id: 'p_remedies', stage: 16, kind: 'note', title: 'Sad, angry, hungry', illustration: '💡',
    lines: [
      L('Sad? Something sweet.', '😢🍯'), L('Angry? Cold mint tea.', '😠🌿🧊'), L('Worried? Chrysanthemum and red dates.', '😟🌼🔴'),
      L('Sleepy? Mint green tea.', '🥱🌿🍵'), L('Hungry? Banana milk.', '🍽️🍌🥛'), L('Thirsty? Watermelon and mint, cold.', '🥵🍉🌿'),
    ],
  },
  {
    id: 'p_watermelon_mint', stage: 16, kind: 'recipe', recipe: 'watermelon_mint', title: 'Watermelon and mint tea', illustration: '🍉🌿',
    lines: [L('Two watermelon slices', '🍉', 'item'), L('Two mint leaves', '🌿', 'item'), L('Cold.', '🧊', 'item'), L('Thirsty? Drink this.', '🥵', 'goodFor'), L('A hot day? Drink this.', '☀️', 'goodFor')],
  },
  // ---- 17
  {
    id: 'p_allergy', stage: 17, kind: 'note', title: 'Not for me', illustration: '🤧',
    lines: [
      L("I'm allergic to honey.", '🤧🍯', 'warning'), L("I can't drink milk.", '🚫🥛'), L("I don't like sweet.", '🙅🍬'), L('I love honey.', '💕🍯'),
      L('My favorite is ginger tea.', '⭐🫚'), L('No sugar or honey, please.', '🚫🍬🍯'),
    ],
  },
  {
    id: 'p_can', stage: 17, kind: 'note', title: 'Can I have...?', illustration: '🙋',
    lines: [L('Can I have tea?', '🙋🍵'), L('I need hot water.', '🆘☕'), L('Do you know ginger tea?', '🧠🫚'), L('Lemon or mint?', '🍋🔀🌿'), L('Any tea.', '🍵🍵'), L('The other tea.', '🍵🔄')],
  },
  // ---- 18
  {
    id: 'p_colors', stage: 18, kind: 'note', title: 'Red, green, yellow', illustration: '🎨',
    lines: [L('red', '🟥'), L('green', '🟩'), L('yellow', '🟨'), L('white', '⬜'), L('black', '⬛'), L('Red flowers: roses.', '🌹'), L('Yellow flowers: chrysanthemums.', '🌼'), L('White sugar.', '⬜🍬')],
  },
  {
    id: 'p_compare', stage: 18, kind: 'note', title: 'Sweeter, stronger', illustration: '⚖️',
    lines: [
      L('Honey is sweeter than sugar.', '🍯🍬'), L('Strong tea: three spoons.', '💪🥄🥄🥄'), L('Weak tea: one spoon.', '🪶🥄'),
      L('The same.', '🟰'), L('A different tea.', '↔️'), L('My best friend.', '🧑‍🤝‍🧑🏆'),
    ],
  },
  { id: 'p_rose', stage: 18, kind: 'ingredient', ingredient: 'rose', title: 'Rose', illustration: '🌹', lines: [L('Red flower.', '🌹'), L('Good with black tea.', '🫖')] },
  {
    id: 'p_rose_tea', stage: 18, kind: 'recipe', recipe: 'rose_tea', title: 'Rose tea', illustration: '🌹🫖',
    lines: [L('Two roses', '🌹', 'item'), L('One spoon of black tea', '🫖', 'item'), L('Steep for three minutes.', '⏳', 'step'), L('Hot.', '🔥', 'item')],
  },
  // ---- 19
  {
    id: 'p_verbs', stage: 19, kind: 'note', title: 'Make, buy, eat, go', illustration: '🛠️',
    lines: [L('make', '🛠️'), L('give', '🎁'), L('buy', '🛒'), L('take', '👜'), L('bring', '🛎️'), L('eat', '🍴'), L('go', '🏃'), L('wait', '🕰️'), L('try', '🧪'), L('help', '🛟'), L('work', '💼'), L('back', '↩️'), L('recipe', '📖')],
  },
  {
    id: 'p_coffee', stage: 19, kind: 'ingredient', ingredient: 'coffee', title: 'Coffee', illustration: '☕',
    lines: [L('Bitter.', '😣'), L('Not for children.', '🧒🚫', 'warning'), L('No coffee at night.', '🌙🚫', 'warning'), L('Good with milk.', '🥛')],
  },
  {
    id: 'p_coffee_milk', stage: 19, kind: 'recipe', recipe: 'coffee_milk', title: 'Coffee milk', illustration: '☕🥛',
    lines: [L('One spoon of coffee', '☕', 'item'), L('Milk', '🥛', 'item'), L('Stir. Drink it hot.', '🌀', 'step'), L('Not for children.', '🧒🚫', 'warning')],
  },
  // ---- 20
  {
    id: 'p_questions', stage: 20, kind: 'note', title: 'What? Who? Why?', illustration: '❔',
    lines: [L('What?', '❔'), L('Who?', '🕵️'), L('Which?', '🔍'), L('Why?', '🤔'), L('When?', '🕒'), L('How?', '🔧'), L('How many?', '🍋🍋🍋❔'), L('Here.', '📍'), L('There.', '📌'), L('That one.', '🫳')],
  },
  { id: 'p_yogurt', stage: 20, kind: 'ingredient', ingredient: 'yogurt', title: 'Yogurt', illustration: '🥣', lines: [L('Sour.', '😖'), L('Cold only.', '🧊'), L('Good with apple.', '🍎')] },
  {
    id: 'p_apple_yogurt', stage: 20, kind: 'recipe', recipe: 'apple_yogurt', title: 'Apple yogurt', illustration: '🍎🥣',
    lines: [L('Yogurt', '🥣', 'item'), L('One apple slice', '🍎', 'item'), L('Cold.', '🧊', 'item'), L('Good with honey.', '🍯')],
  },
  // ---- 21
  {
    id: 'p_conditions', stage: 21, kind: 'note', title: 'If, so, because, but', illustration: '🔗',
    lines: [
      L("If it's hot, drink cold tea.", '☀️🧊'), L("If you can't sleep, drink chrysanthemum and red date tea.", '😳🌼🔴'),
      L('If you have a cough, drink pear and honey tea.', '😷🍐'), L("It's cold, so I want hot tea.", '❄️☕'),
      L('Tea is bitter, but good with honey.', '🍵😣🍯'), L("I like it because it's sweet.", '❤️🍬'), L('Steep it, then add milk.', '⏳➡️🥛'),
    ],
  },
  {
    id: 'p_instead', stage: 21, kind: 'note', title: 'Instead, except, already', illustration: '🔃',
    lines: [L('Honey instead of sugar.', '🍯➡️🍬'), L('Any tea except green tea.', '🍵🚫'), L('Not yet.', '🕓'), L('Just honey.', '🍯'), L('Also mint.', '➕🌿'), L('Still hot.', '🔥'), L('Already hot.', '✔️🔥'), L('Always green tea.', '♾️🍵')],
  },
  // ---- 22
  {
    id: 'p_meals', stage: 22, kind: 'note', title: 'Breakfast, lunch, dinner', illustration: '🍽️',
    lines: [L('breakfast', '🍳'), L('lunch', '🍱'), L('dinner', '🍝'), L('Green tea after dinner.', '🍝🍵'), L('No coffee after dinner.', '☕🚫', 'warning')],
  },
  {
    id: 'p_often', stage: 22, kind: 'note', title: 'How often?', illustration: '📊',
    lines: [L('always', '♾️✅✅✅✅'), L('usually', '✅✅✅'), L('often', '✅✅✅'), L('sometimes', '✅'), L('never', '🚫'), L('every day', '📅🔂'), L('every morning', '🌅🔂')],
  },
  {
    id: 'p_prices', stage: 22, kind: 'note', title: 'Prices', illustration: '💴',
    lines: [
      L('Lemons: three coins each.', '🍋🪙🪙🪙'), L('Mint: four coins a bunch.', '🌿🪙🪙🪙🪙'), L('Ginger: four coins a bag.', '🫚🪙🪙🪙🪙'), L('Sugar: six coins a bag.', '🍬🪙🪙🪙🪙🪙🪙'), L('Honey: nine coins a jar.', '🍯🪙×9'),
      L('cheap', '🪙'), L('expensive', '💎'), L('money', '💴'), L('How much?', '💰❔'), L('Honey is more expensive than sugar.', '🍯💎'),
    ],
  },
  // ---- 23
  {
    id: 'p_polite', stage: 23, kind: 'note', title: 'Sure! Of course!', illustration: '🙏',
    lines: [
      L('Sure!', '🆗'), L('Of course!', '🙆‍♀️'), L('No problem!', '🙆'), L('Wonderful!', '🌈'), L('How about apple tea?', '💡🍎'), L('I would like green tea.', '🎩🍵'),
      L('Right!', '✅'), L('Wrong!', '❌'), L('Early.', '🐓'), L('Late.', '🌃'), L('Next time.', '⏭️'), L('Last time.', '⏮️'), L('Actually...', '🔎'), L('Especially.', '🌠'), L('Quite sweet.', '📏🍬'),
    ],
  },
];

const R = (id: string, kind: Reaction['kind'], stage: number, text: string, face: Reaction['face'], when?: Reaction['when']): Reaction => ({ id, kind, stage, text, face, ...(when ? { when } : {}) });

export const REACTIONS2: Reaction[] = [
  R('r10_bye', 'perfect', 10, 'Thank you! Goodbye!', 'happy'),
  R('r10_yours', 'perfect', 10, 'Thanks! Your tea is delicious!', 'delighted'),
  R('r10_sorry', 'wrong', 10, 'Sorry, no. {Ing}, please.', 'puzzled'),
  R('r10_have', 'missing', 10, 'Do you have {ing}?', 'puzzled'),
  R('r10_sorry2', 'extra', 10, 'Sorry, no {ing}.', 'puzzled'),
  R('r11_family', 'perfect', 11, 'Thank you! My family likes it.', 'delighted'),
  R('r12_hundred', 'perfect', 12, 'One hundred! Perfect!', 'delighted'),
  R('r12_little', 'too_little', 12, 'A little more {ing}, please.', 'neutral'),
  R('r12_less', 'too_much', 12, 'Less {ing}, please!', 'sad'),
  R('r12_enough', 'perfect', 12, 'Good! That is enough for me.', 'happy'),
  R('r13_tomorrow', 'perfect', 13, 'Thank you! See you tomorrow!', 'happy'),
  R('r14_today', 'perfect', 14, "It's perfect today! Thank you!", 'delighted'),
  R('r15_rest', 'perfect', 15, 'Thank you! I feel better. I rest now.', 'delighted', { symptom: true }),
  R('r15_cool', 'forbidden_tag', 15, "Oh no! It's cool! My stomach hurts!", 'angry', { tags: ['cooling'] }),
  R('r16_great', 'perfect', 16, 'Great! Thank you!', 'happy'),
  R('r16_taste', 'perfect', 16, 'Wow! It tastes lovely!', 'delighted'),
  R('r16_excellent', 'perfect', 16, 'Excellent!', 'delighted'),
  R('r16_nice', 'perfect', 16, 'This is really nice!', 'happy'),
  R('r16_comfortable', 'perfect', 16, 'I feel comfortable now. Thank you!', 'delighted', { symptom: true }),
  R('r16_sad', 'any_fail', 16, "Oh no... I'm sad.", 'sad'),
  R('r17_cant', 'forbidden', 17, "I can't have {ing}!", 'angry'),
  R('r17_dislike', 'forbidden_tag', 17, "I don't like {tag}!", 'angry', { tags: ['sweet', 'sour', 'bitter', 'salty'] }),
  R('r17_dontwant', 'extra', 17, "No, no. I don't want {ing}.", 'puzzled'),
  R('r18_more', 'too_much', 18, 'This is more than I want. Less {ing}, please.', 'neutral'),
  R('r18_best', 'perfect', 18, 'The best tea! Thank you!', 'delighted'),
  R('r19_wait', 'wrong', 19, 'Wait! I want {ing}!', 'puzzled'),
  R('r19_going', 'perfect', 19, "Great! I'm going home. Thank you!", 'happy'),
  R('r19_empty', 'empty', 19, "Hello? I'm waiting!", 'puzzled'),
  R('r20_why', 'wrong_temp', 20, 'Why is this not {temp}?', 'puzzled'),
  R('r20_who', 'empty', 20, 'Hello? Who is here?', 'puzzled'),
  R('r20_what', 'extra', 20, 'What is this? No {ing}, please!', 'puzzled'),
  R('r20_that', 'wrong', 20, 'That is not {ing}!', 'puzzled'),
  R('r20_what2', 'too_much', 20, 'What is this? Too much {ing}!', 'sad'),
  R('r21_but', 'too_much', 21, 'I like {ing}, but this is too much.', 'sad'),
  R('r21_yet', 'wrong_temp', 21, 'Not {temp} yet!', 'neutral'),
  R('r21_always', 'perfect', 21, 'Great! I always come here.', 'delighted'),
  R('r22_everyday', 'perfect', 22, 'Great! I come here every day.', 'delighted', { returning: true }),
  R('r22_cheap', 'perfect', 22, 'Not expensive, and delicious!', 'happy'),
  R('r22_price', 'perfect', 22, 'Good price! Thank you!', 'happy'),
  R('r23_wonderful', 'perfect', 23, 'Wonderful! I think I like it.', 'delighted'),
  R('r23_right', 'perfect', 23, 'Right! Thank you.', 'happy'),
  R('r23_sure', 'perfect', 23, "Wonderful! I'm sure it's good.", 'delighted'),
  R('r23_problem', 'too_little', 23, 'No problem! More {ing}, please.', 'neutral'),
  R('r23_wrong', 'any_fail', 23, 'This is not what I ordered.', 'sad'),
];
