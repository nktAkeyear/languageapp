import type { GoodDef, JobDef } from '../../jobs/types';

/**
 * The tea house: the first job, playable in both languages. It runs the original day engine
 * (market → shop → delivery: the make, trade and deliver archetypes of the first game); its ranks
 * follow the tea house's own progress (cups served well and words confirmed). Higher material
 * comes with the shop's stages, so the rank notes say which stages a rank's level corresponds to. A start level
 * places the tea house at the rank of its 英検 grade / TOEIC band (jobs/placement.ts), as the shop jumps to the
 * stage of that level (START_STAGE in core/difficulty.ts): 準2級 → rank 4 / stage 23, 2級 → 5 / 24, 準1級 → 6 / 25,
 * 1級 → 7 / 26.
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
    { rank: 4, need: { good: 120, words: 200 }, level: { eiken: 'pre2', toeic: 500 }, tasks: 0, reward: { coins: 30 }, noteJa: '理由・比較・提案（段階 19〜23）。' },
    // Ranks 5–7: the English-only stages 24–26 (src/content/en/stages3.ts); the zh tea house has no material there yet.
    { rank: 5, need: { good: 200, words: 300 }, level: { eiken: '2', toeic: 600 }, tasks: 0, reward: { coins: 40 }, noteJa: '理由・条件・譲歩をつけた遠回しな頼み方（段階 24）。' },
    { rank: 6, need: { good: 260, words: 380 }, level: { eiken: 'pre1', toeic: 730 }, tasks: 0, reward: { coins: 50 }, noteJa: '人から聞いた話・言い回し・ようすから読み取る注文（段階 25）。' },
    { rank: 7, need: { good: 320, words: 460 }, level: { eiken: '1', toeic: 990 }, tasks: 0, reward: { coins: 60 }, noteJa: '品の名前を言わない、倒置・仮定法の改まった注文（段階 26）。' },
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
