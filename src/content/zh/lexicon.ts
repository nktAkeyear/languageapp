import type { LexEntry } from '../../core/types';

/**
 * Mandarin (simplified) lexicon.
 * - pinyin: dictionary (citation) tones; tone sandhi (不要 → búyào, 一 → yí/yì) is not written.
 * - hsk: HSK 2.0 level where known; null = not in the HSK 1–6 list (or not verified).
 * - cefr: rough estimate derived from HSK level / frequency.
 */
export const LEXICON: LexEntry[] = [
  // g_shelf1
  { id: 'lemon', text: '柠檬', pinyin: 'níngméng', gloss: 'レモン', emoji: '🍋', pos: 'noun', cefr: 'B1', hsk: null, group: 'g_shelf1' },
  { id: 'ginger', text: '姜', pinyin: 'jiāng', gloss: '生姜（しょうが）', emoji: '🫚', pos: 'noun', cefr: 'B1', hsk: null, group: 'g_shelf1' },
  { id: 'mint', text: '薄荷', pinyin: 'bòhe', gloss: 'ミント（薄荷）', emoji: '🌿', pos: 'noun', cefr: 'B2', hsk: null, group: 'g_shelf1' },
  { id: 'honey', text: '蜂蜜', pinyin: 'fēngmì', gloss: 'はちみつ', emoji: '🍯', pos: 'noun', cefr: 'B1', hsk: null, group: 'g_shelf1' },

  // g_num1
  { id: 'one', text: '一', pinyin: 'yī', gloss: '1（ひとつ）', emoji: '1️⃣', pos: 'num', cefr: 'A1', hsk: 1, group: 'g_num1' },
  { id: 'two', text: '两', pinyin: 'liǎng', gloss: '2（ふたつ・数量を言うとき）', emoji: '2️⃣', pos: 'num', cefr: 'A1', hsk: 2, group: 'g_num1' },
  { id: 'three', text: '三', pinyin: 'sān', gloss: '3（みっつ）', emoji: '3️⃣', pos: 'num', cefr: 'A1', hsk: 1, group: 'g_num1' },

  // g_measure
  { id: 'pian', text: '片', pinyin: 'piàn', gloss: '〜枚・〜切れ（薄いものを数える）', emoji: '🔪', pos: 'measure', cefr: 'B2', hsk: 5, group: 'g_measure' },
  { id: 'shao', text: '勺', pinyin: 'sháo', gloss: '〜さじ（スプーン一杯）', emoji: '🥄', pos: 'measure', cefr: 'B1', hsk: null, group: 'g_measure' },
  { id: 'bei', text: '杯', pinyin: 'bēi', gloss: '〜杯（カップ）', emoji: '☕', pos: 'measure', cefr: 'A1', hsk: 1, group: 'g_measure' },
  { id: 'kuai', text: '块', pinyin: 'kuài', gloss: '〜個（かたまりを数える）', emoji: '🧱', pos: 'measure', cefr: 'A1', hsk: 1, group: 'g_measure' },

  // g_temp
  { id: 'hot', text: '热', pinyin: 'rè', gloss: '熱い', emoji: '🔥', pos: 'adj', cefr: 'A1', hsk: 1, group: 'g_temp' },
  { id: 'ice', text: '冰', pinyin: 'bīng', gloss: '氷・アイス（冷たい）', emoji: '🧊', pos: 'noun', cefr: 'A2', hsk: null, group: 'g_temp' },
  { id: 'water', text: '水', pinyin: 'shuǐ', gloss: '水', emoji: '💧', pos: 'noun', cefr: 'A1', hsk: 1, group: 'g_temp' },
  { id: 'de', text: '的', pinyin: 'de', gloss: '〜の・〜なもの', pos: 'particle', cefr: 'A1', hsk: 1, group: 'g_temp' },

  // g_func
  { id: 'and', text: '和', pinyin: 'hé', gloss: '〜と…', emoji: '➕', pos: 'conj', cefr: 'A1', hsk: 1, group: 'g_func' },
  { id: 'thanks', text: '谢谢', pinyin: 'xièxie', gloss: 'ありがとう', emoji: '😊', pos: 'verb', cefr: 'A1', hsk: 1, group: 'g_func' },
  { id: 'please', text: '请', pinyin: 'qǐng', gloss: 'どうぞ〜してください', emoji: '🙏', pos: 'verb', cefr: 'A1', hsk: 1, group: 'g_func' },
  { id: 'give', text: '给', pinyin: 'gěi', gloss: 'あげる・くれる', emoji: '🤲', pos: 'verb', cefr: 'A1', hsk: 2, group: 'g_func' },

  // g_neg
  { id: 'buyao', text: '不要', pinyin: 'bùyào', gloss: 'いらない', emoji: '🙅', pos: 'verb', cefr: 'A1', hsk: 2, group: 'g_neg' },
  { id: 'bu', text: '不', pinyin: 'bù', gloss: '〜ない（否定）', emoji: '✖️', pos: 'adv', cefr: 'A1', hsk: 1, group: 'g_neg' },
  { id: 'jia', text: '加', pinyin: 'jiā', gloss: '加える・入れる', emoji: '➕', pos: 'verb', cefr: 'A2', hsk: null, group: 'g_neg' },
  { id: 'meiyou', text: '没有', pinyin: 'méiyǒu', gloss: 'ない・入っていない', emoji: '🈳', pos: 'verb', cefr: 'A1', hsk: 1, group: 'g_neg' },

  // g_taste
  { id: 'sweet', text: '甜', pinyin: 'tián', gloss: '甘い', emoji: '🍬', pos: 'adj', cefr: 'A2', hsk: 3, group: 'g_taste' },
  { id: 'sour', text: '酸', pinyin: 'suān', gloss: 'すっぱい', emoji: '😖', pos: 'adj', cefr: 'B1', hsk: 4, group: 'g_taste' },
  { id: 'bitter', text: '苦', pinyin: 'kǔ', gloss: '苦い', emoji: '😣', pos: 'adj', cefr: 'B1', hsk: 4, group: 'g_taste' },
  { id: 'salty', text: '咸', pinyin: 'xián', gloss: 'しょっぱい', emoji: '🧂', pos: 'adj', cefr: 'B1', hsk: 4, group: 'g_taste' },

  // g_shelf2
  { id: 'sugar', text: '糖', pinyin: 'táng', gloss: '砂糖・あめ', emoji: '🍬', pos: 'noun', cefr: 'A2', hsk: 3, group: 'g_shelf2' },
  { id: 'salt', text: '盐', pinyin: 'yán', gloss: '塩', emoji: '🧂', pos: 'noun', cefr: 'B1', hsk: 4, group: 'g_shelf2' },
  { id: 'green_tea', text: '绿茶', pinyin: 'lǜchá', gloss: '緑茶', emoji: '🍵', pos: 'noun', cefr: 'A2', hsk: null, group: 'g_shelf2' },
  { id: 'black_tea', text: '红茶', pinyin: 'hóngchá', gloss: '紅茶', emoji: '🫖', pos: 'noun', cefr: 'A2', hsk: null, group: 'g_shelf2' },
  { id: 'milk', text: '牛奶', pinyin: 'niúnǎi', gloss: '牛乳', emoji: '🥛', pos: 'noun', cefr: 'A1', hsk: 2, group: 'g_shelf2' },

  // g_shelf3
  { id: 'red_date', text: '红枣', pinyin: 'hóngzǎo', gloss: 'ナツメ（紅棗）', emoji: '🔴', pos: 'noun', cefr: 'B2', hsk: null, group: 'g_shelf3' },
  { id: 'chrysanthemum', text: '菊花', pinyin: 'júhuā', gloss: '菊の花', emoji: '🌼', pos: 'noun', cefr: 'B2', hsk: null, group: 'g_shelf3' },
  { id: 'cinnamon', text: '肉桂', pinyin: 'ròuguì', gloss: 'シナモン（肉桂）', emoji: '🪵', pos: 'noun', cefr: 'C1', hsk: null, group: 'g_shelf3' },
  { id: 'gen', text: '根', pinyin: 'gēn', gloss: '〜本（細長いものを数える）', emoji: '🥢', pos: 'measure', cefr: 'B2', hsk: 5, group: 'g_shelf3' },
  { id: 'duo_flower', text: '朵', pinyin: 'duǒ', gloss: '〜輪（花を数える）', emoji: '🌸', pos: 'measure', cefr: 'B1', hsk: 4, group: 'g_shelf3' },

  // g_num2
  { id: 'four', text: '四', pinyin: 'sì', gloss: '4（よっつ）', emoji: '4️⃣', pos: 'num', cefr: 'A1', hsk: 1, group: 'g_num2' },
  { id: 'five', text: '五', pinyin: 'wǔ', gloss: '5（いつつ）', emoji: '5️⃣', pos: 'num', cefr: 'A1', hsk: 1, group: 'g_num2' },
  { id: 'ke', text: '颗', pinyin: 'kē', gloss: '〜粒（小さく丸いものを数える）', emoji: '🔘', pos: 'measure', cefr: 'B2', hsk: 5, group: 'g_num2' },
  { id: 'minute', text: '分钟', pinyin: 'fēnzhōng', gloss: '〜分間', emoji: '⏱️', pos: 'noun', cefr: 'A1', hsk: 1, group: 'g_num2' },

  // g_react1
  { id: 'good', text: '好', pinyin: 'hǎo', gloss: 'よい', emoji: '👍', pos: 'adj', cefr: 'A1', hsk: 1, group: 'g_react1' },
  { id: 'tasty', text: '好喝', pinyin: 'hǎohē', gloss: '（飲み物が）おいしい', emoji: '😋', pos: 'adj', cefr: 'A1', hsk: null, group: 'g_react1' },
  { id: 'right', text: '对', pinyin: 'duì', gloss: '正しい・そのとおり', emoji: '⭕', pos: 'adj', cefr: 'A1', hsk: 2, group: 'g_react1' },

  // g_amount
  { id: 'too', text: '太', pinyin: 'tài', gloss: '〜すぎる・とても', emoji: '⚠️', pos: 'adv', cefr: 'A1', hsk: 1, group: 'g_amount' },
  { id: 'much', text: '多', pinyin: 'duō', gloss: '多い', emoji: '📈', pos: 'adj', cefr: 'A1', hsk: 1, group: 'g_amount' },
  { id: 'little', text: '少', pinyin: 'shǎo', gloss: '少ない', emoji: '📉', pos: 'adj', cefr: 'A1', hsk: 1, group: 'g_amount' },
  { id: 'le', text: '了', pinyin: 'le', gloss: '（状態が変わった・完了した）', pos: 'particle', cefr: 'A1', hsk: 1, group: 'g_amount' },
  { id: 'enough', text: '够', pinyin: 'gòu', gloss: '足りる・十分だ', emoji: '👌', pos: 'adj', cefr: 'B1', hsk: 4, group: 'g_amount' },

  // g_grammar
  { id: 'this', text: '这', pinyin: 'zhè', gloss: 'これ・この', emoji: '👇', pos: 'pron', cefr: 'A1', hsk: 1, group: 'g_grammar' },
  { id: 'is', text: '是', pinyin: 'shì', gloss: '〜である', pos: 'verb', cefr: 'A1', hsk: 1, group: 'g_grammar' },
  { id: 'soup', text: '汤', pinyin: 'tāng', gloss: 'スープ（※お湯ではない）', emoji: '🍲', pos: 'noun', cefr: 'A2', hsk: 4, group: 'g_grammar' },
  { id: 'ma', text: '吗', pinyin: 'ma', gloss: '〜か？（はい・いいえの疑問）', emoji: '❓', pos: 'particle', cefr: 'A1', hsk: 1, group: 'g_grammar' },
  { id: 'ne', text: '呢', pinyin: 'ne', gloss: '〜は？（どこ？と尋ねる）', emoji: '🔎', pos: 'particle', cefr: 'A1', hsk: 1, group: 'g_grammar' },

  // g_people
  { id: 'i', text: '我', pinyin: 'wǒ', gloss: '私', emoji: '🙋', pos: 'pron', cefr: 'A1', hsk: 1, group: 'g_people' },
  { id: 'want', text: '要', pinyin: 'yào', gloss: 'ほしい・〜がいる', emoji: '🤲', pos: 'verb', cefr: 'A1', hsk: 2, group: 'g_people' },
  { id: 'have', text: '有', pinyin: 'yǒu', gloss: 'ある・持っている', pos: 'verb', cefr: 'A1', hsk: 1, group: 'g_people' },

  // g_drink
  { id: 'drink', text: '喝', pinyin: 'hē', gloss: '飲む', emoji: '🥤', pos: 'verb', cefr: 'A1', hsk: 1, group: 'g_drink' },
  { id: 'tea', text: '茶', pinyin: 'chá', gloss: 'お茶', emoji: '🍵', pos: 'noun', cefr: 'A1', hsk: 1, group: 'g_drink' },
  { id: 'milk_tea', text: '奶茶', pinyin: 'nǎichá', gloss: 'ミルクティー', emoji: '🧋', pos: 'noun', cefr: 'A2', hsk: null, group: 'g_drink' },

  // g_symptom
  { id: 'cold_illness', text: '感冒', pinyin: 'gǎnmào', gloss: 'かぜ（をひく）', emoji: '🤧', pos: 'noun', cefr: 'A2', hsk: 3, group: 'g_symptom' },
  { id: 'throat', text: '嗓子', pinyin: 'sǎngzi', gloss: 'のど', emoji: '🗣️', pos: 'noun', cefr: 'B2', hsk: 5, group: 'g_symptom' },
  { id: 'hurt', text: '疼', pinyin: 'téng', gloss: '痛い', emoji: '🤕', pos: 'adj', cefr: 'A2', hsk: 3, group: 'g_symptom' },
  { id: 'tired', text: '累', pinyin: 'lèi', gloss: '疲れた', emoji: '😩', pos: 'adj', cefr: 'A1', hsk: 2, group: 'g_symptom' },

  // g_sleep
  { id: 'cant_sleep', text: '睡不着', pinyin: 'shuìbuzháo', gloss: '眠れない', emoji: '😳', pos: 'verb', cefr: 'A2', hsk: null, group: 'g_sleep' },
  { id: 'night', text: '晚上', pinyin: 'wǎnshang', gloss: '夜', emoji: '🌙', pos: 'noun', cefr: 'A1', hsk: 2, group: 'g_sleep' },
  { id: 'dont', text: '别', pinyin: 'bié', gloss: '〜するな', emoji: '⛔', pos: 'adv', cefr: 'A1', hsk: 2, group: 'g_sleep' },
  { id: 'time', text: '时候', pinyin: 'shíhou', gloss: '〜のとき', emoji: '🕰️', pos: 'noun', cefr: 'A1', hsk: 1, group: 'g_sleep' },

  // g_react3
  { id: 'comfortable', text: '舒服', pinyin: 'shūfu', gloss: '心地よい・気分がいい', emoji: '😌', pos: 'adj', cefr: 'A2', hsk: 3, group: 'g_react3' },
  { id: 'again', text: '再', pinyin: 'zài', gloss: 'もう一度・それから', emoji: '🔁', pos: 'adv', cefr: 'A1', hsk: 2, group: 'g_react3' },
  { id: 'wrong', text: '错', pinyin: 'cuò', gloss: '間違っている', emoji: '❌', pos: 'adj', cefr: 'A1', hsk: 2, group: 'g_react3' },
  { id: 'wa', text: '哇', pinyin: 'wā', gloss: 'わあ（感嘆）', emoji: '😮', pos: 'interj', cefr: 'C1', hsk: 6, group: 'g_react3' },

  // g_method
  { id: 'boil', text: '煮', pinyin: 'zhǔ', gloss: '煮る', emoji: '🍲', pos: 'verb', cefr: 'B2', hsk: 5, group: 'g_method' },
  { id: 'steep', text: '泡', pinyin: 'pào', gloss: '（お湯に）浸す・（お茶を）淹れる', emoji: '⏳', pos: 'verb', cefr: 'B1', hsk: null, group: 'g_method' },
  { id: 'stir', text: '搅拌', pinyin: 'jiǎobàn', gloss: 'かき混ぜる', emoji: '🌀', pos: 'verb', cefr: 'C1', hsk: 6, group: 'g_method' },
  { id: 'first', text: '先', pinyin: 'xiān', gloss: 'まず・先に', emoji: '☝️', pos: 'adv', cefr: 'A2', hsk: 3, group: 'g_method' },

  // g_talk
  { id: 'say', text: '说', pinyin: 'shuō', gloss: '言う', emoji: '💬', pos: 'verb', cefr: 'A1', hsk: 1, group: 'g_talk' },
  { id: 'like', text: '喜欢', pinyin: 'xǐhuan', gloss: '好きだ', emoji: '❤️', pos: 'verb', cefr: 'A1', hsk: 1, group: 'g_talk' },
  { id: 'very', text: '很', pinyin: 'hěn', gloss: 'とても', emoji: '‼️', pos: 'adv', cefr: 'A1', hsk: 1, group: 'g_talk' },
];
