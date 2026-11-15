import type { GoodDef, JobDef } from '../../jobs/types';

/**
 * The tea house: the first job, playable in both languages. It runs the original day engine
 * (market → shop → delivery: the make, trade and deliver archetypes of the first game); its ranks
 * follow the tea house's own progress (cups served well and words confirmed). Higher material
 * comes with the shop's stages, so the rank notes say which stages a rank's level corresponds to.
 */
export const TEAHOUSE_JOB: JobDef = {
  id: 'teahouse',
  nameJa: '茶房',
  blurbJa: '先代から受け継いだ港町の茶房。注文を聞いてお茶を淹れ、朝は市場で買い出し、夕方は配達。食べ物・味・体調・数とお金・道案内の言葉。',
  icon: '🫖',
  domains: ['food', 'cooking', 'health', 'body', 'shopping', 'money', 'family', 'weather', 'transport', 'emotion'],
  archetypes: ['make', 'trade', 'deliver'],
  ranks: [
    { rank: 1, need: { good: 0, words: 0 }, level: { eiken: '5', toeic: null }, tasks: 0, noteJa: '注文は一語から。品名・数・熱い／冷たい（段階 1〜6）。' },
    { rank: 2, need: { good: 20, words: 40 }, level: { eiken: '4', toeic: null }, tasks: 0, reward: { coins: 10 }, noteJa: '体調からお茶を選ぶ・淹れ方・始業前の市場（段階 7〜12 ほど）。' },
    { rank: 3, need: { good: 60, words: 110 }, level: { eiken: '3', toeic: 400 }, tasks: 0, reward: { coins: 20 }, noteJa: '挨拶・家族・時間・天気・値段・配達票の道案内（段階 13〜18 ほど）。' },
    { rank: 4, need: { good: 120, words: 200 }, level: { eiken: 'pre2', toeic: 500 }, tasks: 0, reward: { coins: 30 }, noteJa: '理由・比較・提案（段階 19〜23）。この先の茶房の内容はまだ少ない。' },
  ],
  wage: { perfect: 0, minor: 0, fail: 0, bad: 0 },
  opensAfter: 0,
  building: 'teahouse',
  links: { produce: [{ good: 'tea', perPerfect: 1 }], use: [{ good: 'bread', bonus: 1 }] },
  content: {},
  legacy: true,
  flavour: 'school',
};

/** Goods one job makes for another (the town's shared store). */
export const GOODS: GoodDef[] = [
  { id: 'tea', nameJa: '茶葉の包み', icon: '🍵', word: 'tea' },
  { id: 'bread', nameJa: '焼きたてのパン', icon: '🍞', word: 'bread' },
  { id: 'parcels', nameJa: '商会の小包', icon: '📦', word: 'parcel' },
  { id: 'menus', nameJa: '宿の献立の注文', icon: '📝' },
];
