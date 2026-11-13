import type { MarketText } from '../../core/townTypes';

const DIGITS = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九'];

/**
 * Number words 1–100. A standalone 2 is 两 (两个, 两块, 两点); inside numbers it is 二 (十二, 二十).
 * Every character is a lexicon word, so 三十五 reads as 三 + 十 + 五.
 */
export const NUMBER_TEXT: Record<number, string> = (() => {
  const out: Record<number, string> = {};
  for (let n = 1; n <= 100; n++) {
    if (n === 2) out[n] = '两';
    else if (n < 10) out[n] = DIGITS[n];
    else if (n === 100) out[n] = '一百';
    else {
      const t = Math.floor(n / 10);
      const u = n % 10;
      out[n] = (t === 1 ? '' : DIGITS[t]) + '十' + (u ? DIGITS[u] : '');
    }
  }
  return out;
})();

const KUAI = '{块|kuai_money}';

export const MARKET: MarketText = {
  money: { other: `{n}${KUAI}` },
  tagMoney: { other: `{d}${KUAI}` },
  stallRef: '{c}那家',
  variantWords: { fresh: '新鲜', old: '不新鲜', big: '大', small: '小' },
  goods: [
    {
      ingredient: 'lemon',
      name: '柠檬',
      qty: { base: { other: '{n}个柠檬' }, fresh: { other: '{n}个新鲜柠檬' }, old: { other: '{n}个不新鲜的柠檬' } },
      per: '{price}一个',
    },
    { ingredient: 'ginger', name: '姜', qty: { base: { other: '{n}袋姜' } }, per: '{price}一袋' },
    {
      ingredient: 'mint',
      name: '薄荷',
      qty: { base: { other: '{n}把薄荷' }, fresh: { other: '{n}把新鲜薄荷' }, old: { other: '{n}把不新鲜的薄荷' } },
      per: '{price}一把',
    },
    {
      ingredient: 'honey',
      name: '蜂蜜',
      qty: { base: { other: '{n}瓶蜂蜜' }, small: { other: '{n}小瓶蜂蜜' }, big: { other: '{n}大瓶蜂蜜' } },
      per: '{price}一瓶',
    },
    {
      ingredient: 'sugar',
      name: '糖',
      qty: { base: { other: '{n}袋糖' }, small: { other: '{n}小袋糖' }, big: { other: '{n}大袋糖' } },
      per: '{price}一袋',
    },
    {
      ingredient: 'milk',
      name: '牛奶',
      qty: { base: { other: '{n}瓶牛奶' }, fresh: { other: '{n}瓶新鲜牛奶' }, old: { other: '{n}瓶不新鲜的牛奶' } },
      per: '{price}一瓶',
    },
    { ingredient: 'red_dates', name: '红枣', qty: { base: { other: '{n}袋红枣' } }, per: '{price}一袋' },
    { ingredient: 'chrysanthemum', name: '菊花', qty: { base: { other: '{n}袋菊花' } }, per: '{price}一袋' },
  ],
  noteTitles: ['今天买：', '今天要买：'],
  noteLine: '{qty}。',
  cheaperNotes: ['{stall}的{g}便宜。', '{g}：{stall}便宜。'],
  lines: [
    { id: 'm_greet1', kind: 'greet', level: 1, text: '你好！', face: 'happy' },
    { id: 'm_greet2', kind: 'greet', level: 2, text: '你好！今天很便宜！', face: 'happy' },
    { id: 'm_cheap1', kind: 'cheapHere', level: 3, text: '今天{g}很便宜！', face: 'delighted' },
    { id: 'm_ask1', kind: 'askQty', level: 1, text: '{g}？要多少？', face: 'happy' },
    { id: 'm_ask2', kind: 'askQty', level: 2, text: '{g}？你要多少？', face: 'happy' },
    { id: 'm_quote1', kind: 'quote', level: 1, text: '{qty}？一共{total}。', face: 'happy' },
    { id: 'm_quote2', kind: 'quote', level: 2, text: '{qty}，一共{total}。', face: 'neutral' },
    { id: 'm_thanks1', kind: 'thanks', level: 1, text: '谢谢！', face: 'happy' },
    { id: 'm_thanks2', kind: 'thanks', level: 2, text: '好，谢谢！', face: 'happy' },
    { id: 'm_over1', kind: 'overpaid', level: 1, text: '哇！谢谢，谢谢！', face: 'delighted' },
    { id: 'm_change1', kind: 'change', level: 2, text: '谢谢！找你{change}。', face: 'happy' },
    { id: 'm_less1', kind: 'notEnough', level: 1, text: '不够。{total}。', face: 'puzzled' },
    { id: 'm_less2', kind: 'notEnough', level: 2, text: '钱不够，{total}。', face: 'puzzled' },
    { id: 'm_nochange1', kind: 'noChange', level: 2, text: '对不起，我们没有零钱。', face: 'puzzled' },
    { id: 'm_sold1', kind: 'soldOut', level: 2, text: '对不起，今天没有{g}了。', face: 'sad' },
    { id: 'm_sold2', kind: 'soldOut', level: 2, text: '今天没有{g}了，明天有。', face: 'sad' },
    { id: 'm_soldtip1', kind: 'soldOutTip', level: 2, text: '对不起，今天没有{g}了。{stall}有。', face: 'sad' },
    { id: 'm_bargain_yes', kind: 'bargainYes', level: 4, text: '好，{total}。', face: 'neutral' },
    { id: 'm_bargain_no', kind: 'bargainNo', level: 4, text: '不，不贵！{total}。', face: 'puzzled' },
  ],
  stockReactions: [
    { id: 's_none1', text: '今天没有{ing}吗？', face: 'sad' },
    { id: 's_none2', text: '没有{ing}了？', face: 'sad' },
  ],
};
