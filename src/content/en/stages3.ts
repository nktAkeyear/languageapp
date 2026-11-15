/**
 * English-only tea house stages 24–26: the 英検2級 / 準1級 / 1級 counter (en has a start level for every grade;
 * zh stops at stage 23, so these are language stages, `LanguageContent.stages`, not shared ones).
 *
 * Nothing new goes on the shelf: every order resolves to the rule space the first 23 stages taught — ingredients
 * with counts, hot / cold, boil / steep / stir, the book's recipes and its symptom → recipe pages, and the facts the
 * book states (strong tea = three spoons, weak = one; honey is sweeter and dearer than sugar; no honey for babies,
 * no tea or coffee for children, no tea at night; red flowers = roses, yellow flowers = chrysanthemums; warm =
 * ginger / red dates / cinnamon, cool = mint / ice / chrysanthemum / watermelon; pears are boiled, rose tea is
 * steeped, coffee milk is stirred; tired eyes → chrysanthemum green tea; the sad / angry / worried / hungry /
 * thirsty remedies). What grows is the English around the rule:
 *
 * - 24 (英検2級): reasons, conditions, concessions, indirect requests; two or three sentences.
 * - 25 (英検準1級): longer reported speech, negation and exceptions, idioms, a situation to read the need from.
 * - 26 (英検1級): dense, formal or idiomatic; inversion, the subjunctive, concession; an ingredient the game has
 *   already described is not named but described ("the dearer of your two sweeteners", "the yellow blossoms").
 */
import type { AuthoredOrder, Customer, IngredientId, OrderRule, OrderTemplate, Reaction, StageDef } from '../../core/types';
import { RECIPES } from '../shared';
import { NEW_RECIPES } from '../shared/extension';

const RECIPE_RULES = new Map([...RECIPES, ...NEW_RECIPES].map((r) => [r.id, r.rule]));

/** A recipe's rule, changed: `require` entries replace the recipe's own for the same ingredient or are added. */
function plus(id: string, extra: OrderRule): OrderRule {
  const r = RECIPE_RULES.get(id);
  if (!r) throw new Error(`stages3: unknown recipe ${id}`);
  const out: OrderRule = { ...r, ...extra };
  if (extra.require) out.require = [...(r.require ?? []).filter((x) => !extra.require!.some((y) => y.ing === x.ing)), ...extra.require];
  if (extra.forbid) out.forbid = [...(r.forbid ?? []), ...extra.forbid];
  return out;
}
const n = (ing: IngredientId, exact?: number) => (exact ? { ing, min: exact, max: exact } : { ing });

/** Reputation threshold for a stage opening on `minDay` (the line of src/content/shared/extension.ts). */
const repFor = (minDay: number) => Math.round(25 + 3.5 * (minDay - 11));
const S = (stage: number, minDay: number, newWordsPerDay: number, noteJa: string): StageDef => ({
  stage,
  minDay,
  minReputation: repFor(minDay),
  ingredients: [],
  customersPerDay: 8,
  newWordsPerDay,
  noteJa,
});

export const STAGES3: StageDef[] = [
  S(24, 43, 10, '理由や条件をつけて、遠回しに頼むお客さんが増えた。何を出せばよいかは、これまでのレシピ帳のとおり。'),
  S(25, 49, 10, '決まり文句や人から聞いた話の混じる注文が来る。どんな様子かを聞き取って、何が要るかを読もう。'),
  S(26, 55, 10, '品の名前を言わず、レシピ帳に書いてあることで遠回しに示すお客さんが来る。倒置や仮定の言い方に気をつけて。'),
];

export const CUSTOMERS3: Customer[] = [
  { id: 'c_nurse', name: 'Nurse Ada', avatar: '👩‍⚕️', stage: 24 },
  { id: 'c_clerk', name: 'Mr. Penn', avatar: '🧑‍💼', stage: 24 },
  { id: 'c_lawyer', name: 'Ms. Webb', avatar: '👩‍⚖️', stage: 25 },
  { id: 'c_singer', name: 'Rosa', avatar: '👩‍🎤', stage: 25 },
  { id: 'c_judge', name: 'Judge Marlowe', avatar: '👨‍⚖️', stage: 26 },
  { id: 'c_poet', name: 'Mr. Quill', avatar: '🧑‍🎨', stage: 26 },
];

/** [id, customer, text, rule or recipe id, audio-only] */
type Spec = [string, string | null, string, OrderRule | string, true?];

function build(stage: number, specs: Spec[]): AuthoredOrder[] {
  return specs.map(([id, customer, text, rule, audio], i) => {
    const o: AuthoredOrder = { id, stage, seq: i + 1, text };
    if (customer) o.customer = customer;
    if (typeof rule === 'string') o.recipe = rule;
    else o.rule = rule;
    if (audio) o.audioOnly = true;
    return o;
  });
}

// ---------------------------------------------------------------------------------------------------- 24 (英検2級)

const S24: Spec[] = [
  ['o24_wonder', 'c_sailor', "I was wondering if you could make me some ginger honey tea. I think I'm catching a {cold|cold_illness}.", 'ginger_honey'],
  ['o24_unless', 'c_docker', "I've been working since five this morning, so I'm exhausted. Mint green tea, please, unless it's too much trouble.", 'mint_green'],
  ['o24_although', 'c_merchant', "Although it's freezing outside, I'd like my black tea cold today. One spoon, and no sugar.", { require: [n('black_tea', 1)], forbid: ['sugar'], temp: 'cold' }],
  ['o24_since', 'c_scholar', 'Since my doctor told me to avoid tea and coffee, could you make something without them? Hot milk with one spoon of honey would be perfect.', { require: [n('milk'), n('honey', 1)], forbidTag: ['tea'], forbid: ['coffee'], temp: 'hot' }],
  ['o24_mind', 'c_nurse', 'Would you mind making something for a sore throat? I have to talk to patients all afternoon.', 'honey_lemon'],
  ['o24_cough', 'c_docker', "I can't stop coughing, so I'd like whatever your book recommends for that.", 'pear_honey'],
  ['o24_rather', 'c_clerk', "I'd rather not have anything sweet today. Just a strong green tea, if possible.", { require: [n('green_tea', 3)], forbidTag: ['sweet'] }],
  ['o24_as_long', 'c_grandma', "Lemon tea is fine, as long as it isn't too sour. One slice is enough, with one spoon of honey.", { require: [n('lemon', 1), n('honey', 1)] }],
  ['o24_headache', 'c_cook', "I've had a headache all morning. Could you make the cold drink with mint and chrysanthemum?", 'mint_chrysanthemum'],
  ['o24_son', 'c_mom', "This is for my son, so please don't put any tea in it. Banana milk would be lovely.", 'banana_milk'],
  ['o24_baby', 'c_mom', "It's for my baby, so remember the rule about honey. Hot milk with a little sugar, please.", { require: [n('milk'), n('sugar', 1)], forbid: ['honey'], temp: 'hot' }],
  ['o24_instead', 'c_merchant', "I usually take sugar, but I'm trying to cut down. Could you use honey instead? Black tea, one spoon.", { require: [n('black_tea', 1), n('honey')], forbid: ['sugar'] }],
  ['o24_even_though', 'c_boy', 'Even though it is summer, my stomach feels terrible. I need the hot ginger drink from your book.', 'ginger_water'],
  ['o24_awake', 'c_scholar', "I've been lying awake every night this week. What would you recommend? I'll take it.", 'chrysanthemum_dates'],
  ['o24_report', 'c_clerk', 'I have to stay up late to finish a report, so I need coffee. Please make it hot and stir in some milk.', { require: [n('coffee'), n('milk')], allowTag: ['sweet'], temp: 'hot', method: 'stir' }],
  ['o24_roses', 'c_baker', 'My husband loves the smell of roses, so could you make him a cup of rose tea? He says it tastes best when it is steeped properly.', 'rose_tea'],
  ['o24_spices', 'c_oldman', "I'd like cinnamon milk tea, but without the cinnamon. I'm not a fan of spices.", { require: [n('black_tea', 1), { ing: 'milk', min: 1, max: 2 }], forbid: ['cinnamon'], allowTag: ['sweet'], temp: 'hot' }],
  ['o24_exam', 'c_student', "I'm so worried about my exam tomorrow that I can't relax. Whatever helps with worry, please.", 'chrysanthemum_dates'],
  ['o24_lunch', 'c_docker', "I didn't have time for lunch because I was so busy, and now I'm hungry. Something filling, please, but no tea.", 'banana_milk'],
  ['o24_cheaper', 'c_girl', 'Honey is a bit expensive for me, so could you make my lemon tea sweet with the cheaper one?', { require: [n('lemon'), n('sugar')], forbid: ['honey'] }],
  ['o24_weak', 'c_merchant', 'Could you put two apple slices and two spoons of black tea in it? My wife says it is too weak otherwise.', { require: [n('apple', 2), n('black_tea', 2)] }],
  ['o24_breathe', 'c_sailor', "It's so hot that I can hardly breathe, and I've been thirsty all day. I'll have the drink your book suggests for that.", 'watermelon_mint'],
  ['o24_documents', 'c_clerk', "I've been reading documents all day, and my eyes are exhausted. Is there anything in your book for that?", 'chrysanthemum_green'],
  ['o24_no_more', 'c_docker', "I've already had three cups of coffee today, so no more coffee for me. A strong black tea instead, please.", { require: [n('black_tea', 3)], forbid: ['coffee'] }],
  ['o24_mild', 'c_grandma', "I don't like my tea too strong. Could you make me a weak green tea with two mint leaves?", { require: [n('green_tea', 1), n('mint', 2)] }],
  ['o24_diet', 'c_girl', "I'd like apple yogurt, but please leave out the honey because I'm on a diet.", plus('apple_yogurt', { forbid: ['honey'] })],
  ['o24_boiled', 'c_grandma', 'My sister asked me to bring her ginger and red date tea. She says it should be boiled, not steeped.', 'ginger_dates'],
  ['o24_sun', 'c_docker', "I've been working in the sun all day, so I'd like cold lemon water with a pinch of salt.", { require: [n('lemon'), n('salt', 1)], allow: ['ice'], temp: 'cold' }],
  ['o24_neither', 'c_scholar', 'Neither sugar nor honey, please. Just two lemon slices in hot water.', { require: [n('lemon', 2), n('water')], forbid: ['sugar', 'honey'], temp: 'hot' }],
  ['o24_nose', 'c_nurse', "I'm not sure whether it's a {cold|cold_illness} or just tiredness, but my nose is running. I'd like whatever is good for a {cold|cold_illness}.", 'ginger_honey'],
  ['o24_sugar_too', 'c_baker', "Could you make me a cinnamon milk tea? I'd like it sweet, so please add one spoon of sugar as well.", plus('cinnamon_milk_tea', { require: [n('sugar', 1)] })],
  ['o24_july', 'c_merchant', "I always drink my green tea hot unless it's summer. Since it's July, make it cold, please.", { require: [n('green_tea')], temp: 'cold' }],
  ['o24_wallet', 'c_student', 'I left my wallet at home, so I can only pay for something cheap. Just hot water with one lemon slice, please.', { require: [n('water'), n('lemon', 1)], temp: 'hot' }],
  ['o24_avoid_sugar', 'c_oldman', 'My doctor says I should avoid sugar for a while. Could you make my apple tea without any?', plus('apple_tea', { forbid: ['sugar'] })],
  ['o24_try_coffee', 'c_mom', "My son wants to try coffee, but I told him it's not for children. Banana milk for him instead, please.", 'banana_milk'],
  ['o24_steep', 'c_scholar', "Chrysanthemum green tea, please. I've heard it's better if you steep it rather than boil it.", 'chrysanthemum_green'],
  ['o24_chilly', 'c_sailor', "It's chilly this morning, so I'd prefer something warm. Hot ginger tea with two slices, please.", { require: [n('ginger', 2)], temp: 'hot' }],
  ['o24_bed', 'c_oldman', "I've heard red dates are good at night, so I'd like three of them in hot water before I go to bed.", { require: [n('red_dates', 3), n('water')], forbidTag: ['tea'], temp: 'hot' }],
  ['o24_too_sweet', 'c_cook', 'Last time my honey lemon tea was too sweet. This time, only one spoon of honey, please.', plus('honey_lemon', { require: [n('honey', 1)] })],
  ['o24_recommended', 'c_student', 'My friend recommended your apple tea. I would like to try it, but could you add one cinnamon stick?', plus('apple_tea', { require: [n('cinnamon', 1)] })],
  ['o24_hurry', 'c_boy', "Excuse me, could I get a cold mint tea? I'm in a hurry, so no ice, please.", { require: [n('mint')], forbid: ['ice'], temp: 'cold' }, true],
  ['o24_medicine', 'c_nurse', 'Would it be possible to have two cups of hot water? I need to take my medicine.', { require: [n('water', 2)], temp: 'hot' }, true],
  ['o24_grandfather', 'c_girl', 'My grandfather has had a cough for days. Could you boil a pear with honey for him?', 'pear_honey'],
  ['o24_warm_up', 'c_clerk', "I'm cold after waiting for the bus for so long. Could I have your ginger and red date tea, if it isn't too much trouble?", 'ginger_dates'],
];

// ---------------------------------------------------------------------------------------------------- 25 (英検準1級)

const S25: Spec[] = [
  ['o25_caffeine', 'c_lawyer', "My doctor told me that I wasn't to touch tea or coffee until my blood pressure came down, so keep it free of both. Hot water with two slices of ginger would do nicely.", { require: [n('ginger', 2), n('water')], forbidTag: ['tea'], forbid: ['coffee'], temp: 'hot' }],
  ['o25_shed', 'c_sailor', "My wife said that if I came home with another {cold|cold_illness}, she'd make me sleep in the shed. I had better have whatever you'd give someone who's coming down with one.", 'ginger_honey'],
  ['o25_weather', 'c_merchant', "I'm feeling a bit under the weather: my nose won't stop running and I've got the shivers. The usual remedy for a {cold|cold_illness}, please.", 'ginger_honey'],
  ['o25_stomach_lemon', 'c_scholar', "I'm not much of a fan of anything sweet, and lemon is out of the question because of my stomach. A plain green tea, please.", { require: [n('green_tea')], forbid: ['lemon'], forbidTag: ['sweet'] }],
  ['o25_apart', 'c_clerk', 'Any tea will do, apart from the green one; it keeps me up at night.', { requireTag: [{ tag: 'tea' }], forbid: ['green_tea'] }],
  ['o25_not_my_cup', 'c_singer', "Coffee isn't really my cup of tea; honestly, I can't stand how bitter it is. I'll have the cold banana drink you make for children instead.", 'banana_milk'],
  ['o25_sweet_tooth', 'c_girl', "I've got a terrible sweet tooth, but I've promised my dentist I'd stay off sugar. Honey doesn't count, though, so two spoons of it in hot water.", { require: [n('honey', 2), n('water')], forbid: ['sugar'], temp: 'hot' }],
  ['o25_candle', 'c_lawyer', "I've been burning the candle at both ends this week and I'm running on empty. Something to keep me going this afternoon, but nothing hot.", 'mint_green'],
  ['o25_wink', 'c_scholar', "I haven't slept a wink in three nights. I don't want anything that'll keep me awake; I know what your book says about tea at night.", 'chrysanthemum_dates'],
  ['o25_harbour', 'c_docker', "I've just walked all the way from the harbour in the pouring rain and I'm frozen to the bone. Something hot with ginger, and one spoon of honey if you can spare it.", { require: [n('ginger'), n('honey', 1)], temp: 'hot' }],
  ['o25_sneeze', 'c_baker', "None of the flowers, please; I sneeze whenever I'm near them. Just black tea with milk, hot.", { require: [n('black_tea'), n('milk')], forbid: ['rose', 'chrysanthemum'], temp: 'hot' }],
  ['o25_toothpaste', 'c_boy', "I'll drink just about anything cold except mint, which reminds me of toothpaste. Watermelon with ice, please.", { require: [n('watermelon'), n('ice')], forbid: ['mint'], temp: 'cold' }],
  ['o25_either_way', 'c_singer', "It's neither hot nor cold today, so I don't mind how you serve it. Two roses and one spoon of black tea, steeped.", { require: [n('rose', 2), n('black_tea', 1)], method: 'steep' }],
  ['o25_road', 'c_sailor', "I'm setting off on a long voyage tonight, so I'd like one for the road: your apple tea, with one spoon of honey stirred in.", plus('apple_tea', { require: [n('honey', 1)], method: 'stir' })],
  ['o25_wedding', 'c_lawyer', "Hold the sugar on my coffee milk, would you? I'm trying to lose a bit of weight before the wedding.", plus('coffee_milk', { forbid: ['sugar'] })],
  ['o25_no_way', 'c_docker', "There's no way I'm drinking anything hot on a day like this. Mint and chrysanthemum, with as much ice as you like.", { require: [n('mint'), n('chrysanthemum'), n('ice')], temp: 'cold' }],
  ['o25_cured', 'c_oldman', "My grandmother insists that pear boiled with honey is the only thing that ever cured her cough, and frankly I'm inclined to agree. I've got the same cough, so the same for me.", 'pear_honey'],
  ['o25_knots', 'c_merchant', "Something I ate last night didn't agree with me, and my stomach has been in knots ever since. Whatever your book gives for that, please.", 'ginger_water'],
  ['o25_snowing', 'c_grandma', "I never take milk in my tea unless it's black tea in winter. Well, it's snowing, so go ahead: one spoon of black tea, with milk, hot.", { require: [n('black_tea', 1), n('milk')], temp: 'hot' }],
  ['o25_price', 'c_cook', "I'm told the price of honey has gone up again. In that case, use sugar in my lemon tea, two spoons of it.", { require: [n('lemon'), n('sugar', 2)], forbid: ['honey'] }],
  ['o25_splitting', 'c_lawyer', 'My head is splitting after three hours of meetings. You know what I need: the cold one with flowers in it.', 'mint_chrysanthemum'],
  ['o25_point_out', 'c_merchant', "Before you start, I should point out that I'm allergic to cinnamon. Apart from that, I'd like your apple tea exactly as the book has it.", plus('apple_tea', { forbid: ['cinnamon'], allow: ['honey'] })],
  ['o25_nephew', 'c_mom', "My nephew is only four, so nothing with tea or coffee in it, obviously. He's been complaining that he's starving.", 'banana_milk'],
  ['o25_overheard', 'c_singer', "I overheard someone saying your watermelon and mint tea is the best thing on a boiling hot day, and I'm dying of thirst. I'd like to see for myself.", 'watermelon_mint'],
  ['o25_mix_up', 'c_scholar', "Last week you gave me rose tea when I had asked for chrysanthemum green tea. No hard feelings, but this time I'd like what I actually ordered.", 'chrysanthemum_green'],
  ['o25_charts', 'c_sailor', "I've been reading maps of the coast by candlelight all night, and my eyes are killing me. Is there something in your book for eyes in that state?", 'chrysanthemum_green'],
  ['o25_long_story', 'c_clerk', "To cut a long story short, I've got a big presentation in an hour and I'm dead on my feet. Something cold to wake me up, please.", 'mint_green'],
  ['o25_swears', 'c_singer', "The captain swears by your honey lemon tea with two spoons of honey. I'm not saying I believe him, but I'll give it a try.", plus('honey_lemon', { require: [n('honey', 2)] })],
  ['o25_storm', 'c_docker', "It wouldn't hurt to have something warming before I go back out into the storm. Ginger and red dates, boiled, please.", 'ginger_dates'],
  ['o25_accounts', 'c_merchant', "I hardly ever drink coffee, but I've got a long night of accounts ahead of me. Coffee, then, with no milk and no sugar.", { require: [n('coffee')], forbid: ['milk', 'sugar'] }],
  ['o25_ghost', 'c_student', "You look as if you've seen a ghost! Never mind. I'll have my usual: green tea, two spoons, hot.", { require: [n('green_tea', 2)], temp: 'hot' }],
  ['o25_little_ones', 'c_mom', "I've got the little ones with me today, so whatever I order has to be fine for children: apple yogurt, but with no honey in it.", plus('apple_yogurt', { forbid: ['honey'] })],
  ['o25_nets', 'c_sailor', "We've been pulling in nets in the sun since dawn. A cold lemon water with a pinch of salt, the way sailors drink it.", { require: [n('lemon'), n('salt', 1)], allow: ['ice'], temp: 'cold' }],
  ['o25_in_law', 'c_grandma', "My mother-in-law is visiting, and she won't drink anything that hasn't been boiled. Pear with honey, please, done the way she likes it.", 'pear_honey'],
  ['o25_couldnt_care', 'c_docker', "I couldn't care less whether it's hot or cold. Just make sure there are three spoons of green tea in it; the stronger the better.", { require: [n('green_tea', 3)] }],
  ['o25_no_point', 'c_oldman', "There's no point giving me anything with mint; I can't taste it at the moment. Plain black tea, one spoon, hot.", { require: [n('black_tea', 1)], forbid: ['mint'], temp: 'hot' }],
  ['o25_anniversary', 'c_merchant', "It's our anniversary, and my wife adores red flowers. Could you make her the tea your book makes with them?", 'rose_tea'],
  ['o25_yellow', 'c_scholar', "Three of the yellow flowers in hot water, and nothing else, if you don't mind.", { require: [n('chrysanthemum', 3), n('water')], temp: 'hot' }],
  ['o25_sooner', 'c_clerk', "Sooner or later I'll have to give up coffee, so I might as well start today. Hot milk with honey, then, and no tea in it either.", 'honey_milk'],
  ['o25_office', 'c_lawyer', "Everyone in my office has come down with a {cold|cold_illness}, and I'd rather not be next. Ginger honey tea, just in case.", 'ginger_honey'],
  ['o25_festival', 'c_singer', "I'm singing at the festival tonight, and the last thing I need is for my voice to give out. What would you suggest for the throat?", 'honey_lemon'],
  ['o25_favour', 'c_boy', 'Could you do me a favour and make it cold? Black tea, two spoons, and no sugar whatsoever.', { require: [n('black_tea', 2)], forbid: ['sugar'], temp: 'cold' }, true],
  ['o25_same_ice', 'c_docker', "I'll have the same as yesterday, except with ice this time: mint green tea.", plus('mint_green', { require: [n('ice')] }), true],
  ['o25_row', 'c_clerk', "I've just had a blazing row with my landlord and I'm still furious. You know what your book says works when someone is angry.", { require: [n('mint')], allow: ['ice'], temp: 'cold' }],
  ['o25_cheaper_cup', 'c_girl', "I'm a bit short of money this week, so nothing expensive. Weak black tea with the cheaper of your two sweeteners, please.", { require: [n('black_tea', 1), n('sugar')], forbid: ['honey'] }],
];

// ---------------------------------------------------------------------------------------------------- 26 (英検1級)

const S26: Spec[] = [
  ['o26_were_i', 'c_judge', 'Were I to drink anything containing tea at this hour, I should be staring at the ceiling until dawn. Prepare me instead whatever your book prescribes for those who cannot sleep.', 'chrysanthemum_dates'],
  ['o26_heeded', 'c_poet', 'Had I heeded my wife, I should not now be nursing this wretched {cold|cold_illness}. Be so good as to make me what your book prescribes for it.', 'ginger_honey'],
  ['o26_not_only', 'c_lawyer', 'Not only has this cough kept me awake for a week, it has driven my neighbours to distraction. I am told the remedy involves boiling a fruit; I leave the details to your book.', 'pear_honey'],
  ['o26_seldom', 'c_judge', 'Seldom do I allow myself anything sweet, but today I shall make an exception: the dearer of your two sweeteners, two spoons, dissolved in hot water.', { require: [n('honey', 2), n('water')], temp: 'hot' }],
  ['o26_little_did', 'c_poet', "Little did I suspect that a single morning of proofreading could leave one's eyes so sore. I trust your book has something for precisely this complaint.", 'chrysanthemum_green'],
  ['o26_should_you', 'c_scholar', 'Should you happen to have any of those yellow blossoms, I would take three of them, steeped with a single spoon of green tea and served piping hot.', { require: [n('green_tea', 1), n('chrysanthemum', 3)], temp: 'hot', method: 'steep' }],
  ['o26_no_sooner', 'c_merchant', 'No sooner had I sat down to my accounts than my stomach began to protest. Whatever it is you give for that, I would be obliged.', 'ginger_water'],
  ['o26_howling', 'c_sailor', 'I refuse to take anything cooling while the wind is howling like this. Two slices of the only warming thing you serve in slices, a spoon of what babies must never be given, and let it be hot.', { require: [n('ginger', 2), n('honey', 1)], forbidTag: ['cooling'], temp: 'hot' }],
  ['o26_strictures', 'c_judge', 'Were it not for my physician, I would have coffee; as it is, I am to avoid it entirely, and tea likewise. Something hot and milky, made sweet with the cheaper of your two sweeteners.', { require: [n('milk'), n('sugar')], forbid: ['coffee', 'honey'], forbidTag: ['tea'], temp: 'hot' }],
  ['o26_notwithstanding', 'c_lawyer', 'Notwithstanding the heat, I find iced drinks disagree with me. Two spoons of the leaf that goes into apple tea, with milk, served hot, and steeped rather than stirred.', { require: [n('black_tea', 2), n('milk')], forbid: ['ice'], temp: 'hot', method: 'steep' }],
  ['o26_bone_to_pick', 'c_poet', 'I have a bone to pick with whoever decided it should be this hot in September. Something to quench a thirst like mine, if you would.', 'watermelon_mint'],
  ['o26_insists', 'c_oldman', 'My wife insists that I be given nothing stronger than a single spoon of tea after noon, and I dare not defy her. Black tea, if you please, with neither sugar nor milk.', { require: [n('black_tea', 1)], forbid: ['sugar', 'milk'] }],
  ['o26_grandson', 'c_grandma', 'My grandson, being but eight months old, may have neither tea nor what your book forbids for babies. Hot milk with a single banana in it will suffice.', { require: [n('milk'), n('banana', 1)], forbid: ['honey'], forbidTag: ['tea'], temp: 'hot' }],
  ['o26_much_as', 'c_baker', 'Much as I adore the scent of red flowers, they bring on my hay fever something dreadful. Your apple tea, then, exactly as the book has it, and not a petal in it.', 'apple_tea'],
  ['o26_an_hour', 'c_judge', 'However tempting your coffee may be, I am under strict instructions to sleep tonight. Give me instead the hot milk your book says to drink an hour before sleeping.', 'honey_milk'],
  ['o26_whereas', 'c_poet', 'Whereas my husband takes his tea strong enough to stand a spoon in, I prefer mine barely coloured: a single spoon of the green, steeped, and nothing else.', { require: [n('green_tea', 1)], method: 'steep' }],
  ['o26_so_much_as', 'c_lawyer', 'I cannot so much as look at anything sweet after the banquet last night. Something bitter and hot, without milk, and not coffee, which I have sworn off.', { requireTag: [{ tag: 'bitter' }], forbid: ['milk', 'coffee'], forbidTag: ['sweet'], temp: 'hot' }],
  ['o26_only_after', 'c_judge', 'Only after addressing the council for two hours did I notice that my voice had all but deserted me. The remedy for a throat in that state, please.', 'honey_lemon'],
  ['o26_were_you_to_ask', 'c_poet', 'If you were to ask me, the finest drink on a sweltering day is the fruit served only cold, with leaves of the cool herb. Three of each, if you would.', { require: [n('watermelon', 3), n('mint', 3)], allow: ['ice'], temp: 'cold' }],
  ['o26_understatement', 'c_nurse', 'To say that I am exhausted would be an understatement; I have been on my feet since four. Something to revive me, cold by all means, exactly as your book has it.', 'mint_green'],
  ['o26_were_it_up', 'c_clerk', 'Were it up to me, I would take my coffee black; alas, my stomach has other ideas. Coffee, then, but softened with milk, stirred, and served hot.', { require: [n('coffee'), n('milk')], allowTag: ['sweet'], temp: 'hot', method: 'stir' }],
  ['o26_would_that', 'c_merchant', 'Would that every shop knew when to boil and when to steep! Of the warming things on your shelf, I want the two that your book has you boil together.', 'ginger_dates'],
  ['o26_scarcely', 'c_docker', 'Scarcely had I set foot on shore when the heavens opened. Nothing cooling, I beg you: three slices of the warming one, in hot water.', { require: [n('ginger', 3), n('water')], forbidTag: ['cooling'], temp: 'hot' }],
  ['o26_floral', 'c_judge', 'In all honesty, I have never cared for anything floral, roses least of all; whatever you make must be free of every flower on your shelf. A strong black tea will do.', { require: [n('black_tea', 3)], forbid: ['rose', 'chrysanthemum'] }],
  ['o26_far_be_it', 'c_poet', 'Far be it from me to tell you your trade, but the fruit your book tells you to boil ought never to be steeped. Just the one, with a single spoon of the sweeter of your two sweeteners, boiled and hot.', { require: [n('pear', 1), n('honey', 1)], temp: 'hot', method: 'boil' }],
  ['o26_for_all', 'c_clerk', 'For all its reputation, coffee does nothing for me but set my heart racing. Since I am working through the night, I shall need the cold remedy for weariness instead.', 'mint_green'],
  ['o26_high_time', 'c_mom', 'It is high time someone taught my son that not every drink is fit for a child. Give him the cold one your book recommends for children, and on no account anything containing coffee.', 'banana_milk'],
  ['o26_helm', 'c_sailor', 'Lest I fall asleep at the helm tonight, I would sooner have something bitter, but not tea, which I find dull. Hot, stirred, and with milk.', { require: [n('coffee'), n('milk')], forbidTag: ['tea'], allowTag: ['sweet'], temp: 'hot', method: 'stir' }],
  ['o26_none_other', 'c_scholar', 'None other than your recipe book claims that the yellow blossoms soothe a pounding head when taken cold with mint. I am putting that claim to the test this very afternoon.', 'mint_chrysanthemum'],
  ['o26_owing', 'c_lawyer', 'Owing to an unfortunate allergy, I must go without the dearer sweetener; the cheaper will serve perfectly well. Two spoons of it, with a slice of the sour one, hot.', { require: [n('sugar', 2), n('lemon', 1)], forbid: ['honey'], temp: 'hot' }],
  ['o26_grain', 'c_judge', 'Were you to add so much as a grain of salt, I should send it straight back. A slice of the sour one, with ice, cold, and nothing sweet.', { require: [n('lemon', 1), n('ice')], forbid: ['salt'], forbidTag: ['sweet'], temp: 'cold' }],
  ['o26_pressed', 'c_merchant', 'Pressed for time as I am, I shall take whatever you would give someone who has not stopped coughing since Tuesday, and I shall drink it here.', 'pear_honey'],
  ['o26_frame_of_mind', 'c_poet', 'Far from wanting to stay awake, I should like nothing better than to sleep until noon. You will know what to give a man in that frame of mind, and what to leave out.', 'chrysanthemum_dates'],
  ['o26_so_long_as', 'c_oldman', 'So long as it contains neither tea nor coffee, I am not fussy: milk, hot, made sweet with whichever of your sweeteners is the sweeter.', { require: [n('milk'), n('honey')], forbid: ['coffee', 'sugar'], forbidTag: ['tea'], temp: 'hot' }],
  ['o26_twice', 'c_judge', 'Twice this week have I been served tea so weak as to be indistinguishable from water. Today I expect three spoons of the green, and I shall be counting.', { require: [n('green_tea', 3)] }],
  ['o26_depths', 'c_lawyer', 'Were it summer, I should ask for something iced; it being the depths of winter, I want your milky black tea with the warming stick in it, stirred as the book directs.', 'cinnamon_milk_tea'],
  ['o26_beggars', 'c_judge', 'It beggars belief that anyone drinks coffee after dinner, yet my guest insists upon it. Humour her: one spoon of it, stirred into milk, served hot.', { require: [n('coffee', 1), n('milk')], allowTag: ['sweet'], temp: 'hot', method: 'stir' }],
  ['o26_tempted', 'c_baker', 'Tempted though I am by the roses, my doctor has forbidden anything floral this month. Apple tea, then, as the book has it, with one spoon of honey.', plus('apple_tea', { require: [n('honey', 1)], forbid: ['rose', 'chrysanthemum'] })],
  ['o26_oysters', 'c_poet', 'Whether it was the oysters or the wine I cannot say, but something has upset my stomach dreadfully, and anything icy would only make matters worse.', 'ginger_water'],
  ['o26_by_no_means', 'c_singer', 'By no means put any of the cool herb in it; it gives me a headache. Two of the red flowers, steeped with a spoon of black tea, hot.', plus('rose_tea', { require: [n('rose', 2)], forbid: ['mint'] })],
  ['o26_bitter_drinks', 'c_scholar', 'Not being one for bitter drinks, I would have you leave out tea and coffee alike; the sweet fruit that is only ever served cold, with a few mint leaves, will more than suffice.', { require: [n('watermelon'), n('mint')], forbid: ['coffee'], forbidTag: ['tea'], allow: ['ice'], temp: 'cold' }],
  ['o26_fastidious', 'c_lawyer', 'Fastidious as I may seem, I am particular about numbers: three of the yellow blossoms with two mint leaves, cold, and that is all.', { require: [n('chrysanthemum', 3), n('mint', 2)], temp: 'cold' }],
  ['o26_sea_air', 'c_singer', 'It was, ironically, the sea air that was supposed to cure my sore throat. Since it has done no such thing, I shall put my trust in your book instead.', 'honey_lemon'],
  ['o26_so_kind', 'c_judge', 'Would you be so kind as to make it hot, with two spoons of the leaf that goes into rose tea, and nothing sweet whatsoever?', { require: [n('black_tea', 2)], forbidTag: ['sweet'], temp: 'hot' }, true],
  ['o26_so_late', 'c_poet', 'Were it not so late, I would have tea; since it is, hot milk with the dearer sweetener will do.', { require: [n('milk'), n('honey')], forbidTag: ['tea'], temp: 'hot' }, true],
  ['o26_ungrateful', 'c_merchant', 'Lest you think me ungrateful, the last cup was superb; it is merely that I had asked for two spoons of sugar, not one. A single spoon of black tea, and do get the sugar right this time.', { require: [n('black_tea', 1), n('sugar', 2)] }],
];

export const ORDERS3: AuthoredOrder[] = [...build(24, S24), ...build(25, S25), ...build(26, S26)];

// ---------------------------------------------------------------------------------------------------- templates

const SWEET: IngredientId[] = ['sugar', 'honey'];

export const TEMPLATES3: OrderTemplate[] = [
  { id: 't24_wonder', stage: 24, text: 'I was wondering if you could make me {q}. I would like it {temp}, if possible.', slots: { q: { kind: 'qty', min: 1, max: 3 }, temp: { kind: 'temp' } } },
  { id: 't24_unless', stage: 24, text: "{Recipe}, please, unless it's too much trouble.", slots: { recipe: { kind: 'recipe' } } },
  { id: 't24_rather', stage: 24, text: "I'd rather not have any {f} today, so just {q}, please.", slots: { f: { kind: 'forbid', ingredients: ['sugar', 'honey', 'milk', 'ice', 'lemon', 'mint'] }, q: { kind: 'qty', min: 1, max: 3 } } },
  { id: 't24_symptom', stage: 24, audioOnly: 0.25, text: '{symptom} Could you make me whatever your book recommends?', slots: { symptom: { kind: 'symptom' } } },
  { id: 't24_although', stage: 24, text: "Although I usually take {f}, I'm trying to cut down. {Q}, please, and nothing else.", slots: { f: { kind: 'forbid', ingredients: [...SWEET, 'milk'] }, q: { kind: 'qty', min: 1, max: 3 } } },
  { id: 't24_as_long', stage: 24, text: '{Recipe} is fine, as long as you make it the way your book says.', slots: { recipe: { kind: 'recipe' } } },
  { id: 't25_doctor', stage: 25, text: "My doctor told me I wasn't to have any {f}, so {q}, {temp}, and nothing else.", slots: { f: { kind: 'forbid', ingredients: [...SWEET, 'coffee', 'milk', 'lemon'] }, q: { kind: 'qty', min: 1, max: 3 }, temp: { kind: 'temp' } } },
  { id: 't25_heard', stage: 25, text: "I've heard nothing but good things about your {recipe}. I'd like to see what all the fuss is about.", slots: { recipe: { kind: 'recipe' } } },
  { id: 't25_symptom', stage: 25, audioOnly: 0.25, text: "{symptom} I had better have whatever your book gives for that.", slots: { symptom: { kind: 'symptom' } } },
  { id: 't25_apart', stage: 25, text: "Apart from {f}, which I can't stand, I'm not fussy: {q} will do nicely.", slots: { f: { kind: 'forbid', ingredients: ['mint', 'lemon', 'ginger', 'milk', 'coffee', ...SWEET] }, q: { kind: 'qty', min: 1, max: 3 } } },
  { id: 't25_overheard', stage: 25, text: "I overheard someone saying your {recipe} is the best in town. I'd like to see for myself.", slots: { recipe: { kind: 'recipe' } } },
  { id: 't26_were', stage: 26, text: 'Were it not for my physician, I would take {f}; as it is, {q}, if you would be so kind.', slots: { f: { kind: 'forbid', ingredients: [...SWEET, 'coffee', 'milk'] }, q: { kind: 'qty', min: 1, max: 3 } } },
  { id: 't26_should', stage: 26, text: 'Should you have any {ing} to spare, I would take it {temp}, with nothing else besides.', slots: { ing: { kind: 'ing', ingredients: ['mint', 'ginger', 'lemon', 'green_tea', 'black_tea', 'chrysanthemum', 'rose'] }, temp: { kind: 'temp' } } },
  { id: 't26_seldom', stage: 26, text: 'Seldom do I take {f}, and today shall be no exception: {q}, if you please.', slots: { f: { kind: 'forbid', ingredients: [...SWEET, 'coffee', 'milk', 'lemon'] }, q: { kind: 'qty', min: 1, max: 3 } } },
  { id: 't26_much_as', stage: 26, text: 'Much as I adore {f}, I am under orders to avoid it. {Q}, and nothing besides.', slots: { f: { kind: 'forbid', ingredients: [...SWEET, 'coffee', 'milk', 'cinnamon'] }, q: { kind: 'qty', min: 1, max: 3 } } },
  { id: 't26_symptom', stage: 26, audioOnly: 0.25, text: '{symptom} I trust your book has a remedy for precisely this complaint.', slots: { symptom: { kind: 'symptom' } } },
];

// ---------------------------------------------------------------------------------------------------- reactions

export const REACTIONS3: Reaction[] = [
  { id: 'r24_exactly', kind: 'perfect', stage: 24, text: "That's exactly what I had in mind. Thank you!", face: 'delighted' },
  { id: 'r24_lifesaver', kind: 'perfect', stage: 24, text: "You're a lifesaver. I feel better already.", face: 'delighted', when: { symptom: true } },
  { id: 'r24_wrong', kind: 'wrong', stage: 24, text: "Sorry, but this isn't what I asked for. I wanted {ing}.", face: 'puzzled' },
  { id: 'r24_temp', kind: 'wrong_temp', stage: 24, text: "I'm afraid I wanted it {temp}.", face: 'sad' },
  { id: 'r25_spot_on', kind: 'perfect', stage: 25, text: "Spot on! You've clearly done your homework.", face: 'delighted' },
  { id: 'r25_missing', kind: 'missing', stage: 25, text: "I'm afraid you've left out the {ing}.", face: 'puzzled' },
  { id: 'r25_extra', kind: 'extra', stage: 25, text: "I don't remember asking for {ing}.", face: 'puzzled' },
  { id: 'r25_much', kind: 'too_much', stage: 25, text: 'Rather too much {ing}, I\'m afraid.', face: 'sad' },
  { id: 'r25_little', kind: 'too_little', stage: 25, text: 'It could do with a little more {ing}.', face: 'neutral' },
  { id: 'r26_impeccable', kind: 'perfect', stage: 26, text: 'Impeccable. I could not have asked for better.', face: 'delighted' },
  { id: 'r26_forbid', kind: 'forbidden', stage: 26, text: 'I distinctly said no {ing}!', face: 'angry' },
  { id: 'r26_method', kind: 'wrong_method', stage: 26, text: 'One would have expected you to {method} it.', face: 'neutral' },
];
