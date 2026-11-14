import type { RenoText } from '../../renovation/types';

const KUAI = '{块|kuai_money}';

/**
 * 木匠的目录 (the carpenter's catalogue) in Mandarin: names, sales lines and customers' remarks.
 * Built mostly from words the shop and the town have already taught (每天, 可以, 放, 到, 明天,
 * 客人给更多钱 …); the new words are the things themselves plus a few useful ones.
 */
export const RENO_ZH: RenoText = {
  title: '给你的店',
  subtitle: '今天买，明天早上到！',
  price: { other: `{d}${KUAI}` },
  upgrades: {
    ribbon: { name: '红丝带', lines: ['今天要再看的词。'] },
    signboard: { name: '大招牌', lines: ['客人更多了！'], remarks: ['你的新招牌真好看！', '我喜欢你的招牌。'] },
    plant: { name: '花草', lines: ['有花草，客人很高兴。'], remarks: ['这儿的花草真好看！', '我喜欢你的花草。'] },
    kettle: { name: '大水壶', lines: ['热茶更好喝，客人给更多钱！'] },
    shelf: { name: '新架子', lines: ['留三个到明天。'] },
    curtains: { name: '窗帘', lines: ['你的店很暖和，很舒服。'], remarks: ['你的新窗帘真好看。', { text: '这儿很暖和，很舒服。', notWhen: ['cold'] }] },
    bench: { name: '长椅', lines: ['每天多来一个客人。'], remarks: ['这个长椅很舒服。', '我喜欢你的新长椅。'] },
    scales: { name: '秤', lines: ['每次都刚好，客人给更多钱！'] },
    chime: { name: '风铃', lines: ['夏天的声音，很凉快。'], remarks: ['我喜欢这个声音。', '风铃真好看！'] },
    cart: { name: '手推车', lines: ['每天可以送东西。'] },
    lantern: { name: '灯笼', lines: ['回来的客人更高兴！'], remarks: ['晚上，你的灯笼真好看。'] },
    magnifier: { name: '放大镜', lines: ['每个词都在哪儿？看一看！'] },
    icebox: { name: '冰箱', lines: ['牛奶和水果可以放到明天。', '冰的茶更好喝，客人给更多钱！'] },
    cellar: { name: '地窖', lines: ['蜂蜜、糖、姜和咖啡都可以放到明天。', '不只三个！'] },
    paint: { name: '白和蓝的油漆', lines: ['白和蓝的店，真好看！'], remarks: ['白和蓝，真好看！', '你的店真不错！'] },
    catbed: { name: '猫窝', lines: ['可能有猫来！'], remarks: ['哇，有猫！你好，小猫！', '你的猫真好看！'] },
    picture: { name: '船的画', lines: ['画里有大船和大海。'], remarks: ['那是什么船？真大！', '你的画真好看！'] },
    bicycle: { name: '自行车', lines: ['很快就到，客人给更多钱！'] },
  },

  lexicon: [
    // 店里的家具
    { id: 'changyi', text: '长椅', pinyin: 'chángyǐ', gloss: '長いす・ベンチ', emoji: '🪑', pos: 'noun', cefr: 'B1', hsk: null, group: 'z_room' },
    { id: 'jiazi', text: '架子', pinyin: 'jiàzi', gloss: '棚', emoji: '🗄️', pos: 'noun', cefr: 'A2', hsk: null, group: 'z_room' },
    { id: 'dijiao', text: '地窖', pinyin: 'dìjiào', gloss: '地下の貯蔵庫・穴蔵', emoji: '🕳️', pos: 'noun', cefr: 'B2', hsk: null, group: 'z_room' },
    { id: 'bingxiang', text: '冰箱', pinyin: 'bīngxiāng', gloss: '冷蔵庫・氷の箱', emoji: '🧊', pos: 'noun', cefr: 'A2', hsk: 3, group: 'z_room' },
    // 工具和车
    { id: 'shuihu', text: '水壶', pinyin: 'shuǐhú', gloss: 'やかん・水差し', emoji: '🫖', pos: 'noun', cefr: 'B1', hsk: null, group: 'z_tools' },
    { id: 'cheng', text: '秤', pinyin: 'chèng', gloss: 'はかり', emoji: '⚖️', pos: 'noun', cefr: 'B1', hsk: null, group: 'z_tools' },
    { id: 'shoutuiche', text: '手推车', pinyin: 'shǒutuīchē', gloss: '手押し車', emoji: '🛒', pos: 'noun', cefr: 'B1', hsk: null, group: 'z_tools' },
    { id: 'zixingche', text: '自行车', pinyin: 'zìxíngchē', gloss: '自転車', emoji: '🚲', pos: 'noun', cefr: 'A1', hsk: 3, group: 'z_tools' },
    { id: 'fangdajing', text: '放大镜', pinyin: 'fàngdàjìng', gloss: '虫めがね', emoji: '🔍', pos: 'noun', cefr: 'B2', hsk: null, group: 'z_tools' },
    // 店的样子
    { id: 'zhaopai', text: '招牌', pinyin: 'zhāopái', gloss: '看板', emoji: '🪧', pos: 'noun', cefr: 'B1', hsk: null, group: 'z_look' },
    { id: 'denglong', text: '灯笼', pinyin: 'dēnglong', gloss: 'ちょうちん・ランタン', emoji: '🏮', pos: 'noun', cefr: 'B1', hsk: null, group: 'z_look' },
    { id: 'chuanglian', text: '窗帘', pinyin: 'chuānglián', gloss: 'カーテン', emoji: '🪟', pos: 'noun', cefr: 'A2', hsk: null, group: 'z_look' },
    { id: 'youqi', text: '油漆', pinyin: 'yóuqī', gloss: 'ペンキ・塗料', emoji: '🎨', pos: 'noun', cefr: 'B1', hsk: null, group: 'z_look' },
    { id: 'hua_picture', text: '画', pinyin: 'huà', gloss: '絵', emoji: '🖼️', pos: 'noun', cefr: 'A1', hsk: 3, group: 'z_look' },
    // 小东西
    { id: 'huacao', text: '花草', pinyin: 'huācǎo', gloss: '草花・植物', emoji: '🪴', pos: 'noun', cefr: 'A2', hsk: null, group: 'z_decor' },
    { id: 'fengling', text: '风铃', pinyin: 'fēnglíng', gloss: '風鈴', emoji: '🎐', pos: 'noun', cefr: 'B2', hsk: null, group: 'z_decor' },
    { id: 'sidai', text: '丝带', pinyin: 'sīdài', gloss: 'リボン', emoji: '🎀', pos: 'noun', cefr: 'B1', hsk: null, group: 'z_decor' },
    { id: 'mao', text: '猫', pinyin: 'māo', gloss: '猫', emoji: '🐈', pos: 'noun', cefr: 'A1', hsk: 1, group: 'z_decor' },
    { id: 'wo', text: '窝', pinyin: 'wō', gloss: '巣・寝床（動物の）', emoji: '🧺', pos: 'noun', cefr: 'B1', hsk: null, group: 'z_decor' },
    // 目录上的词
    { id: 'keren', text: '客人', pinyin: 'kèrén', gloss: 'お客さん・客', emoji: '🧑‍🤝‍🧑', pos: 'noun', cefr: 'A1', hsk: 3, group: 'z_words' },
    { id: 'xin', text: '新', pinyin: 'xīn', gloss: '新しい', emoji: '✨', pos: 'adj', cefr: 'A1', hsk: 2, group: 'z_words' },
    { id: 'liu', text: '留', pinyin: 'liú', gloss: '残しておく・とっておく', emoji: '🫙', pos: 'verb', cefr: 'A2', hsk: 4, group: 'z_words' },
    { id: 'kuai_fast', text: '快', pinyin: 'kuài', gloss: '速い・はやく', emoji: '💨', pos: 'adj', cefr: 'A1', hsk: 2, group: 'z_words' },
    { id: 'ganghao', text: '刚好', pinyin: 'gānghǎo', gloss: 'ちょうど・ぴったり', emoji: '🎯', pos: 'adv', cefr: 'A2', hsk: null, group: 'z_words' },
    // 小词
    { id: 'li_inside', text: '里', pinyin: 'lǐ', gloss: '〜の中', emoji: '📥', pos: 'noun', cefr: 'A1', hsk: 1, group: 'z_small' },
    { id: 'shengyin', text: '声音', pinyin: 'shēngyīn', gloss: '音・声', emoji: '🔔', pos: 'noun', cefr: 'A1', hsk: 3, group: 'z_small' },
    { id: 'haokan', text: '好看', pinyin: 'hǎokàn', gloss: 'きれい・すてき（見た目が）', emoji: '😍', pos: 'adj', cefr: 'A1', hsk: 2, group: 'z_small' },
    { id: 'ci', text: '词', pinyin: 'cí', gloss: '単語・ことば', emoji: '🔤', pos: 'noun', cefr: 'A2', hsk: null, group: 'z_small' },
  ],

  pages: [
    { id: 'z_room', labelJa: '店の家具' },
    { id: 'z_tools', labelJa: '道具と乗り物' },
    { id: 'z_look', labelJa: '店の見た目' },
    { id: 'z_decor', labelJa: '小さな飾り' },
    { id: 'z_words', labelJa: 'カタログの言葉' },
    { id: 'z_small', labelJa: '見る・聞く・中' },
  ],

  forms: {},
};
