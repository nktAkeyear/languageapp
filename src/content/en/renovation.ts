import type { RenoText } from '../../renovation/types';

/**
 * The carpenter's catalogue in English: entry names, sales lines (what the thing does) and the
 * customers' remarks once it is in the shop. Built mostly from words the shop and the town have
 * already taught; the new words are the things themselves plus a few useful ones (customer,
 * keep, new, fast, word, look, sound).
 */
export const RENO_EN: RenoText = {
  title: 'For your shop',
  subtitle: 'Buy today, here tomorrow morning!',
  price: { one: '{d} coin', other: '{d} coins' },
  // English has the town's jobs: wages on top of the takings (see README "Shop renovation", calibration).
  priceScale: 2.6,
  upgrades: {
    ribbon: { name: 'a ribbon', lines: ['Words for today!'] },
    signboard: {
      name: 'a sign',
      lines: ['More customers know your shop.'],
      remarks: ['I saw your new sign from the harbour!', 'What a lovely sign!'],
    },
    plant: {
      name: 'green plants',
      lines: ['Green plants make customers happy.'],
      remarks: ['What nice plants!', 'I like your green plants.'],
    },
    kettle: { name: 'a big kettle', lines: ['Better hot tea, more coins!'] },
    shelf: { name: 'a new shelf', lines: ['Keep three of each for tomorrow.'] },
    curtains: {
      name: 'curtains',
      lines: ['A warm, comfortable shop.'],
      remarks: ['Your new curtains are lovely.', { text: 'It is very warm and comfortable here.', notWhen: ['cold'] }],
    },
    bench: {
      name: 'a bench',
      lines: ['One more customer every day.'],
      remarks: ['This bench is very comfortable.', 'I like your new bench.'],
    },
    scales: { name: 'scales', lines: ['Just right: more coins!'] },
    chime: {
      name: 'a wind chime',
      lines: ['A cool sound in summer.'],
      remarks: ['I like that sound.', 'What a lovely sound!'],
    },
    cart: { name: 'a cart', lines: ['Bring something to a house every day.'] },
    lantern: {
      name: 'a lantern',
      lines: ['Customers come back, very happy!'],
      remarks: ['Your lantern is lovely at night.'],
    },
    magnifier: { name: 'a magnifying glass', lines: ['Where is each word? Have a look!'] },
    icebox: { name: 'an ice box', lines: ['Keep milk and fruit for tomorrow.', 'Better cold tea, more coins!'] },
    cellar: { name: 'a cellar', lines: ['Keep honey, sugar, ginger and coffee for tomorrow.', 'Not only three!'] },
    paint: {
      name: 'white and blue paint',
      lines: ['Make your shop white and blue.'],
      remarks: ['White and blue! Very nice.', 'Your shop looks wonderful!'],
    },
    catbed: {
      name: 'a bed for a cat',
      lines: ['Maybe a cat comes!'],
      remarks: ['Oh, a cat! Hello, cat!', 'What a nice cat!'],
    },
    picture: {
      name: 'a picture of a ship',
      lines: ['A big ship and the blue sea.'],
      remarks: ['What a big ship!', 'I know that ship!'],
    },
    bicycle: { name: 'a bicycle', lines: ['Fast to every house: more coins!'] },
  },

  lexicon: [
    // the shop's furniture
    { id: 'bench', text: 'bench', forms: ['benches'], gloss: '長いす・ベンチ', emoji: '🪑', pos: 'noun', cefr: 'A2', eiken: '準2', group: 'r_room' },
    { id: 'shelf', text: 'shelf', forms: ['shelves'], gloss: '棚', emoji: '🗄️', pos: 'noun', cefr: 'A2', eiken: '準2', group: 'r_room' },
    { id: 'cellar', text: 'cellar', forms: ['cellars'], gloss: '地下室・地下の貯蔵庫', emoji: '🕳️', pos: 'noun', cefr: 'B2', eiken: '2', group: 'r_room' },
    { id: 'box', text: 'box', forms: ['boxes'], gloss: '箱', emoji: '📦', pos: 'noun', cefr: 'A1', eiken: '5', group: 'r_room' },
    { id: 'bed', text: 'bed', forms: ['beds'], gloss: 'ベッド・寝床', emoji: '🛏️', pos: 'noun', cefr: 'A1', eiken: '5', group: 'r_room' },
    // tools and wheels
    { id: 'kettle', text: 'kettle', forms: ['kettles'], gloss: 'やかん', emoji: '🫖', pos: 'noun', cefr: 'B1', eiken: '準2', group: 'r_tools' },
    { id: 'scales', text: 'scales', gloss: 'はかり', emoji: '⚖️', pos: 'noun', cefr: 'B1', eiken: '2', group: 'r_tools' },
    { id: 'cart', text: 'cart', forms: ['carts'], gloss: '荷車・手押し車', emoji: '🛒', pos: 'noun', cefr: 'B1', eiken: '準2', group: 'r_tools' },
    { id: 'bicycle', text: 'bicycle', forms: ['bicycles'], gloss: '自転車', emoji: '🚲', pos: 'noun', cefr: 'A1', eiken: '5', group: 'r_tools' },
    { id: 'magnifying_glass', text: 'magnifying glass', gloss: '虫めがね', emoji: '🔍', pos: 'noun', cefr: 'B2', eiken: null, group: 'r_tools' },
    // how the shop looks
    { id: 'sign', text: 'sign', forms: ['signs'], gloss: '看板', emoji: '🪧', pos: 'noun', cefr: 'A2', eiken: '3', group: 'r_look' },
    { id: 'lantern', text: 'lantern', forms: ['lanterns'], gloss: 'ランタン・ちょうちん', emoji: '🏮', pos: 'noun', cefr: 'B2', eiken: '2', group: 'r_look' },
    { id: 'curtain', text: 'curtain', forms: ['curtains'], gloss: 'カーテン', emoji: '🪟', pos: 'noun', cefr: 'A2', eiken: '3', group: 'r_look' },
    { id: 'paint', text: 'paint', gloss: 'ペンキ・塗料', emoji: '🎨', pos: 'noun', cefr: 'A1', eiken: '4', group: 'r_look' },
    { id: 'picture', text: 'picture', forms: ['pictures'], gloss: '絵・写真', emoji: '🖼️', pos: 'noun', cefr: 'A1', eiken: '5', group: 'r_look' },
    // little things
    { id: 'plant', text: 'plant', forms: ['plants'], gloss: '植物・草木', emoji: '🪴', pos: 'noun', cefr: 'A1', eiken: '4', group: 'r_decor' },
    { id: 'wind_chime', text: 'wind chime', forms: ['wind chimes'], gloss: '風鈴', emoji: '🎐', pos: 'noun', cefr: 'B2', eiken: null, group: 'r_decor' },
    { id: 'ribbon', text: 'ribbon', forms: ['ribbons'], gloss: 'リボン・ひも', emoji: '🎀', pos: 'noun', cefr: 'B1', eiken: '準2', group: 'r_decor' },
    { id: 'cat', text: 'cat', forms: ['cats'], gloss: '猫', emoji: '🐈', pos: 'noun', cefr: 'A1', eiken: '5', group: 'r_decor' },
    // words of the catalogue
    { id: 'customer', text: 'customer', forms: ['customers'], gloss: 'お客さん・客', emoji: '🧑‍🤝‍🧑', pos: 'noun', cefr: 'A2', eiken: '3', group: 'r_words' },
    { id: 'keep', text: 'keep', forms: ['keeps', 'kept'], gloss: '取っておく・残しておく', emoji: '🫙', pos: 'verb', cefr: 'A1', eiken: '4', group: 'r_words' },
    { id: 'new', text: 'new', gloss: '新しい', emoji: '✨', pos: 'adj', cefr: 'A1', eiken: '5', group: 'r_words' },
    { id: 'fast', text: 'fast', gloss: '速い・速く', emoji: '💨', pos: 'adj', cefr: 'A1', eiken: '5', group: 'r_words' },
    { id: 'word', text: 'word', forms: ['words'], gloss: '単語・ことば', emoji: '🔤', pos: 'noun', cefr: 'A1', eiken: '5', group: 'r_small' },
    { id: 'look', text: 'look', forms: ['looks', 'looking'], gloss: 'ながめる・目を向ける（〜に見える）', emoji: '👀', pos: 'verb', cefr: 'A1', eiken: '5', group: 'r_small' },
    { id: 'sound', text: 'sound', forms: ['sounds'], gloss: '音', emoji: '🔔', pos: 'noun', cefr: 'A1', eiken: '4', group: 'r_small' },
  ],

  pages: [
    { id: 'r_room', labelJa: '店の家具' },
    { id: 'r_tools', labelJa: '道具と乗り物' },
    { id: 'r_look', labelJa: '店の見た目' },
    { id: 'r_decor', labelJa: '小さな飾り' },
    { id: 'r_words', labelJa: 'カタログの言葉' },
    { id: 'r_small', labelJa: '見る・聞く' },
  ],

  forms: {
    sleep: ['sleeping'],
  },
};
