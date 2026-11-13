import type { MarketText } from '../../core/townTypes';

const ONES = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

/** Number words 1–100 ("twenty-three", "one hundred"). Every word is in the lexicon. */
export const NUMBER_TEXT: Record<number, string> = (() => {
  const out: Record<number, string> = {};
  for (let n = 1; n <= 100; n++) {
    if (n < 20) out[n] = ONES[n];
    else if (n === 100) out[n] = 'one hundred';
    else out[n] = TENS[Math.floor(n / 10)] + (n % 10 ? `-${ONES[n % 10]}` : '');
  }
  return out;
})();

export const MARKET: MarketText = {
  money: { one: 'one coin', other: '{n} coins' },
  tagMoney: { one: '{d} coin', other: '{d} coins' },
  stallRef: 'the {c} stall',
  variantWords: { fresh: 'fresh', old: 'old', big: 'big', small: 'small' },
  goods: [
    {
      ingredient: 'lemon',
      name: 'lemons',
      qty: {
        base: { one: 'one lemon', other: '{n} lemons' },
        fresh: { one: 'one fresh lemon', other: '{n} fresh lemons' },
        old: { one: 'one old lemon', other: '{n} old lemons' },
      },
      per: '{price} each',
    },
    { ingredient: 'ginger', name: 'ginger', qty: { base: { one: 'one bag of ginger', other: '{n} bags of ginger' } }, per: '{price} a bag' },
    {
      ingredient: 'mint',
      name: 'mint',
      qty: {
        base: { one: 'one bunch of mint', other: '{n} bunches of mint' },
        fresh: { one: 'one bunch of fresh mint', other: '{n} bunches of fresh mint' },
        old: { one: 'one bunch of old mint', other: '{n} bunches of old mint' },
      },
      per: '{price} a bunch',
    },
    {
      ingredient: 'honey',
      name: 'honey',
      qty: {
        base: { one: 'one jar of honey', other: '{n} jars of honey' },
        small: { one: 'one small jar of honey', other: '{n} small jars of honey' },
        big: { one: 'one big jar of honey', other: '{n} big jars of honey' },
      },
      per: '{price} a jar',
    },
    {
      ingredient: 'sugar',
      name: 'sugar',
      qty: {
        base: { one: 'one bag of sugar', other: '{n} bags of sugar' },
        small: { one: 'one small bag of sugar', other: '{n} small bags of sugar' },
        big: { one: 'one big bag of sugar', other: '{n} big bags of sugar' },
      },
      per: '{price} a bag',
    },
    {
      ingredient: 'milk',
      name: 'milk',
      qty: {
        base: { one: 'one bottle of milk', other: '{n} bottles of milk' },
        fresh: { one: 'one bottle of fresh milk', other: '{n} bottles of fresh milk' },
        old: { one: 'one bottle of old milk', other: '{n} bottles of old milk' },
      },
      per: '{price} a bottle',
    },
    { ingredient: 'red_dates', name: 'red dates', qty: { base: { one: 'one bag of red dates', other: '{n} bags of red dates' } }, per: '{price} a bag' },
    { ingredient: 'chrysanthemum', name: 'chrysanthemums', qty: { base: { one: 'one bag of chrysanthemums', other: '{n} bags of chrysanthemums' } }, per: '{price} a bag' },
  ],
  noteTitles: ['Buy today:', 'Today:'],
  noteLine: '{Qty}.',
  cheaperNotes: ['{G} is cheaper at {stall}.', '{Stall}: cheap {g}!'],
  lines: [
    { id: 'm_greet1', kind: 'greet', level: 1, text: 'Good morning!', face: 'happy' },
    { id: 'm_greet2', kind: 'greet', level: 2, text: 'Good morning! Fresh and cheap!', face: 'happy' },
    { id: 'm_cheap1', kind: 'cheapHere', level: 3, text: 'Cheap {g} today!', face: 'delighted' },
    { id: 'm_cheap2', kind: 'cheapHere', level: 3, text: '{G} is cheap today!', face: 'delighted' },
    { id: 'm_ask1', kind: 'askQty', level: 1, text: '{G}? How many?', face: 'happy' },
    { id: 'm_ask2', kind: 'askQty', level: 2, text: 'Yes! How many for you?', face: 'happy' },
    { id: 'm_quote1', kind: 'quote', level: 1, text: '{Qty}? {Total}, please.', face: 'happy' },
    { id: 'm_quote2', kind: 'quote', level: 2, text: '{Qty}. {Total}, please.', face: 'neutral' },
    { id: 'm_thanks1', kind: 'thanks', level: 1, text: 'Thank you!', face: 'happy' },
    { id: 'm_thanks2', kind: 'thanks', level: 2, text: 'Thank you! Very good!', face: 'happy' },
    { id: 'm_over1', kind: 'overpaid', level: 1, text: 'Oh! Thank you very much!', face: 'delighted' },
    { id: 'm_change1', kind: 'change', level: 2, text: 'Thank you! Your change: {change}.', face: 'happy' },
    { id: 'm_less1', kind: 'notEnough', level: 1, text: 'No, no. {Total}, please.', face: 'puzzled' },
    { id: 'm_less2', kind: 'notEnough', level: 2, text: 'Not enough! {Total}, please.', face: 'puzzled' },
    { id: 'm_nochange1', kind: 'noChange', level: 2, text: 'Sorry, we have no change. Small coins, please.', face: 'puzzled' },
    { id: 'm_sold1', kind: 'soldOut', level: 2, text: 'Sorry, we have no {g} today.', face: 'sad' },
    { id: 'm_sold2', kind: 'soldOut', level: 2, text: 'Sorry! No {g} today. {G} tomorrow!', face: 'sad' },
    { id: 'm_soldtip1', kind: 'soldOutTip', level: 2, text: 'Sorry, we have no {g} today. {Stall} has {g}.', face: 'sad' },
    { id: 'm_bargain_yes', kind: 'bargainYes', level: 4, text: 'Yes, yes. {Total}.', face: 'neutral' },
    { id: 'm_bargain_no', kind: 'bargainNo', level: 4, text: 'No, no! It is not expensive! {Total}.', face: 'puzzled' },
  ],
  stockReactions: [
    { id: 's_none1', text: 'No {ing} today? Oh...', face: 'sad' },
    { id: 's_none2', text: 'Oh, no {ing}?', face: 'sad' },
  ],
};
