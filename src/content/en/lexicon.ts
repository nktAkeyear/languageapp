import type { LexEntry } from '../../core/types';

/**
 * English lexicon. `eiken` grades are approximate (英検 has no official word list);
 * CEFR follows common A1–C1 word-list placement (best effort).
 */
export const LEXICON: LexEntry[] = [
  // g_shelf1 — first shelf
  { id: 'lemon', text: 'lemon', forms: ['lemons'], gloss: 'レモン', emoji: '🍋', pos: 'noun', cefr: 'A1', eiken: '4', group: 'g_shelf1' },
  { id: 'ginger', text: 'ginger', gloss: '生姜（しょうが）', emoji: '🫚', pos: 'noun', cefr: 'B1', eiken: '2', group: 'g_shelf1' },
  { id: 'mint', text: 'mint', gloss: 'ミント', emoji: '🌿', pos: 'noun', cefr: 'B1', eiken: '準2', group: 'g_shelf1' },
  { id: 'honey', text: 'honey', gloss: 'はちみつ', emoji: '🍯', pos: 'noun', cefr: 'A2', eiken: '3', group: 'g_shelf1' },

  // g_num1
  { id: 'one', text: 'one', gloss: '1（ひとつ）', emoji: '1️⃣', pos: 'num', cefr: 'A1', eiken: '5', group: 'g_num1' },
  { id: 'two', text: 'two', gloss: '2（ふたつ）', emoji: '2️⃣', pos: 'num', cefr: 'A1', eiken: '5', group: 'g_num1' },
  { id: 'three', text: 'three', gloss: '3（みっつ）', emoji: '3️⃣', pos: 'num', cefr: 'A1', eiken: '5', group: 'g_num1' },

  // g_unit
  { id: 'slice', text: 'slice', forms: ['slices'], gloss: '薄切り（ひと切れ）', emoji: '🔪', pos: 'noun', cefr: 'A2', eiken: '準2', group: 'g_unit' },
  { id: 'leaf', text: 'leaf', forms: ['leaves'], gloss: '葉（一枚）', emoji: '🍃', pos: 'noun', cefr: 'A2', eiken: '4', group: 'g_unit' },
  { id: 'spoon', text: 'spoon', forms: ['spoons'], gloss: 'スプーン（一杯）', emoji: '🥄', pos: 'noun', cefr: 'A1', eiken: '4', group: 'g_unit' },
  { id: 'cup', text: 'cup', forms: ['cups'], gloss: 'カップ（一杯）', emoji: '☕', pos: 'noun', cefr: 'A1', eiken: '5', group: 'g_unit' },

  // g_temp
  { id: 'hot', text: 'hot', gloss: '熱い', emoji: '🔥', pos: 'adj', cefr: 'A1', eiken: '5', group: 'g_temp' },
  { id: 'cold', text: 'cold', gloss: '冷たい', emoji: '❄️', pos: 'adj', cefr: 'A1', eiken: '5', group: 'g_temp' },
  { id: 'water', text: 'water', gloss: '水', emoji: '💧', pos: 'noun', cefr: 'A1', eiken: '5', group: 'g_temp' },
  { id: 'ice', text: 'ice', gloss: '氷', emoji: '🧊', pos: 'noun', cefr: 'A1', eiken: '4', group: 'g_temp' },

  // g_func
  { id: 'and', text: 'and', gloss: '〜と…（そして）', emoji: '➕', pos: 'conj', cefr: 'A1', eiken: '5', group: 'g_func' },
  { id: 'please', text: 'please', gloss: 'お願いします', emoji: '🙏', pos: 'adv', cefr: 'A1', eiken: '5', group: 'g_func' },
  { id: 'of', text: 'of', gloss: '〜の（中身・量を表す）', pos: 'prep', cefr: 'A1', eiken: '5', group: 'g_func' },
  { id: 'a', text: 'a', forms: ['an'], gloss: 'ひとつの（名詞の前に置く小さな語）', pos: 'det', cefr: 'A1', eiken: '5', group: 'g_func' },

  // g_neg
  { id: 'no', text: 'no', gloss: 'いいえ／〜はなし', emoji: '🚫', pos: 'det', cefr: 'A1', eiken: '5', group: 'g_neg' },
  { id: 'not', text: 'not', gloss: '〜ではない', emoji: '✖️', pos: 'adv', cefr: 'A1', eiken: '5', group: 'g_neg' },
  { id: 'with', text: 'with', gloss: '〜入りの・〜と一緒に', emoji: '🤝', pos: 'prep', cefr: 'A1', eiken: '5', group: 'g_neg' },
  { id: 'without', text: 'without', gloss: '〜なしで', emoji: '🙅', pos: 'prep', cefr: 'A2', eiken: '3', group: 'g_neg' },

  // g_taste
  { id: 'sweet', text: 'sweet', gloss: '甘い', emoji: '🍬', pos: 'adj', cefr: 'A1', eiken: '4', group: 'g_taste' },
  { id: 'sour', text: 'sour', gloss: 'すっぱい', emoji: '😖', pos: 'adj', cefr: 'A2', eiken: '準2', group: 'g_taste' },
  { id: 'bitter', text: 'bitter', gloss: '苦い', emoji: '😣', pos: 'adj', cefr: 'B1', eiken: '準2', group: 'g_taste' },
  { id: 'salty', text: 'salty', gloss: 'しょっぱい', emoji: '🧂', pos: 'adj', cefr: 'A2', eiken: '準2', group: 'g_taste' },

  // g_shelf2
  { id: 'sugar', text: 'sugar', gloss: '砂糖', emoji: '🍬', pos: 'noun', cefr: 'A1', eiken: '4', group: 'g_shelf2' },
  { id: 'salt', text: 'salt', gloss: '塩', emoji: '🧂', pos: 'noun', cefr: 'A1', eiken: '4', group: 'g_shelf2' },
  { id: 'green_tea', text: 'green tea', gloss: '緑茶', emoji: '🍵', pos: 'noun', cefr: 'A1', eiken: '4', group: 'g_shelf2' },
  { id: 'black_tea', text: 'black tea', gloss: '紅茶', emoji: '🫖', pos: 'noun', cefr: 'A2', eiken: '3', group: 'g_shelf2' },
  { id: 'milk', text: 'milk', gloss: '牛乳', emoji: '🥛', pos: 'noun', cefr: 'A1', eiken: '5', group: 'g_shelf2' },

  // g_shelf3
  { id: 'red_date', text: 'red date', forms: ['red dates'], gloss: 'ナツメ（紅棗）', emoji: '🔴', pos: 'noun', cefr: 'B2', eiken: '準1', group: 'g_shelf3' },
  { id: 'chrysanthemum', text: 'chrysanthemum', forms: ['chrysanthemums'], gloss: '菊の花', emoji: '🌼', pos: 'noun', cefr: 'C1', eiken: '1', group: 'g_shelf3' },
  { id: 'cinnamon', text: 'cinnamon', gloss: 'シナモン', emoji: '🪵', pos: 'noun', cefr: 'B1', eiken: '準2', group: 'g_shelf3' },
  { id: 'stick', text: 'stick', forms: ['sticks'], gloss: '棒（一本）', emoji: '🥢', pos: 'noun', cefr: 'A2', eiken: '3', group: 'g_shelf3' },
  { id: 'cube', text: 'cube', forms: ['cubes'], gloss: '角（立方体のかたまり）', emoji: '🎲', pos: 'noun', cefr: 'B1', eiken: '2', group: 'g_shelf3' },

  // g_react1
  { id: 'thank_you', text: 'thank you', gloss: 'ありがとう', emoji: '😊', pos: 'phrase', cefr: 'A1', eiken: '5', group: 'g_react1' },
  { id: 'good', text: 'good', gloss: 'よい', emoji: '👍', pos: 'adj', cefr: 'A1', eiken: '5', group: 'g_react1' },
  { id: 'yes', text: 'yes', gloss: 'はい', emoji: '⭕', pos: 'interj', cefr: 'A1', eiken: '5', group: 'g_react1' },
  { id: 'delicious', text: 'delicious', gloss: 'おいしい', emoji: '😋', pos: 'adj', cefr: 'A1', eiken: '4', group: 'g_react1' },

  // g_amount
  { id: 'too', text: 'too', gloss: '〜すぎる', emoji: '⚠️', pos: 'adv', cefr: 'A1', eiken: '4', group: 'g_amount' },
  { id: 'much', text: 'much', gloss: 'たくさん（の量）', emoji: '📈', pos: 'det', cefr: 'A1', eiken: '5', group: 'g_amount' },
  { id: 'enough', text: 'enough', gloss: '十分な', emoji: '👌', pos: 'det', cefr: 'A2', eiken: '3', group: 'g_amount' },
  { id: 'more', text: 'more', gloss: 'もっと', emoji: '➕', pos: 'det', cefr: 'A1', eiken: '4', group: 'g_amount' },

  // g_grammar
  { id: 'is', text: 'is', forms: ['are', 'am'], gloss: '〜である', pos: 'verb', cefr: 'A1', eiken: '5', group: 'g_grammar' },
  { id: 'this', text: 'this', gloss: 'これ・この', emoji: '👇', pos: 'det', cefr: 'A1', eiken: '5', group: 'g_grammar' },
  { id: 'the', text: 'the', gloss: 'その（話に出ている特定のもの）', pos: 'det', cefr: 'A1', eiken: '5', group: 'g_grammar' },
  { id: 'it', text: 'it', gloss: 'それ', emoji: '👉', pos: 'pron', cefr: 'A1', eiken: '5', group: 'g_grammar' },
  { id: 'where', text: 'where', gloss: 'どこ', emoji: '❓', pos: 'adv', cefr: 'A1', eiken: '5', group: 'g_grammar' },

  // g_people
  { id: 'i', text: 'I', gloss: '私', emoji: '🙋', pos: 'pron', cefr: 'A1', eiken: '5', group: 'g_people' },
  { id: 'im', text: "I'm", gloss: '私は〜だ（I am）', pos: 'phrase', cefr: 'A1', eiken: '5', group: 'g_people' },
  { id: 'my', text: 'my', gloss: '私の', pos: 'det', cefr: 'A1', eiken: '5', group: 'g_people' },
  { id: 'have', text: 'have', forms: ['has'], gloss: '持っている・（病気に）かかっている', pos: 'verb', cefr: 'A1', eiken: '5', group: 'g_people' },
  { id: 'want', text: 'want', gloss: 'ほしい', emoji: '🤲', pos: 'verb', cefr: 'A1', eiken: '5', group: 'g_people' },

  // g_symptom
  { id: 'cold_illness', text: 'cold', gloss: 'かぜ（風邪）', emoji: '🤧', pos: 'noun', cefr: 'A1', eiken: '4', group: 'g_symptom' },
  { id: 'sore', text: 'sore', gloss: 'ひりひり痛む', emoji: '😖', pos: 'adj', cefr: 'B1', eiken: '2', group: 'g_symptom' },
  { id: 'throat', text: 'throat', gloss: 'のど', emoji: '🗣️', pos: 'noun', cefr: 'A2', eiken: '準2', group: 'g_symptom' },
  { id: 'tired', text: 'tired', gloss: '疲れた', emoji: '😩', pos: 'adj', cefr: 'A1', eiken: '4', group: 'g_symptom' },

  // g_sleep
  { id: 'cant', text: "can't", gloss: '〜できない', emoji: '🚫', pos: 'verb', cefr: 'A1', eiken: '5', group: 'g_sleep' },
  { id: 'sleep', text: 'sleep', gloss: '眠る', emoji: '😴', pos: 'verb', cefr: 'A1', eiken: '5', group: 'g_sleep' },
  { id: 'night', text: 'night', gloss: '夜', emoji: '🌙', pos: 'noun', cefr: 'A1', eiken: '5', group: 'g_sleep' },
  { id: 'at', text: 'at', gloss: '〜に（時刻・場所）', pos: 'prep', cefr: 'A1', eiken: '5', group: 'g_sleep' },

  // g_react3
  { id: 'oh', text: 'oh', gloss: 'あっ・おお（驚き）', emoji: '😮', pos: 'interj', cefr: 'A1', eiken: '5', group: 'g_react3' },
  { id: 'perfect', text: 'perfect', gloss: '完璧な', emoji: '💯', pos: 'adj', cefr: 'A2', eiken: '3', group: 'g_react3' },
  { id: 'again', text: 'again', gloss: 'もう一度・また', emoji: '🔁', pos: 'adv', cefr: 'A1', eiken: '4', group: 'g_react3' },
  { id: 'feel', text: 'feel', gloss: '（気分を）感じる', emoji: '💭', pos: 'verb', cefr: 'A1', eiken: '4', group: 'g_react3' },
  { id: 'better', text: 'better', gloss: 'より良い（よくなった）', emoji: '📈', pos: 'adj', cefr: 'A1', eiken: '4', group: 'g_react3' },

  // g_method
  { id: 'boil', text: 'boil', gloss: '煮る・煮立てる', emoji: '🍲', pos: 'verb', cefr: 'A2', eiken: '準2', group: 'g_method' },
  { id: 'steep', text: 'steep', gloss: '（お湯に）浸して出す', emoji: '⏳', pos: 'verb', cefr: 'B2', eiken: '準1', group: 'g_method' },
  { id: 'stir', text: 'stir', gloss: 'かき混ぜる', emoji: '🌀', pos: 'verb', cefr: 'B1', eiken: '2', group: 'g_method' },
  { id: 'add', text: 'add', gloss: '加える', emoji: '➕', pos: 'verb', cefr: 'A1', eiken: '3', group: 'g_method' },

  // g_drink
  { id: 'tea', text: 'tea', gloss: 'お茶（飲み物）', emoji: '🍵', pos: 'noun', cefr: 'A1', eiken: '5', group: 'g_drink' },
  { id: 'drink', text: 'drink', forms: ['drinks'], gloss: '飲む・飲み物', emoji: '🥤', pos: 'verb', cefr: 'A1', eiken: '5', group: 'g_drink' },
  { id: 'for', text: 'for', gloss: '〜のための・〜向けの', emoji: '🎯', pos: 'prep', cefr: 'A1', eiken: '5', group: 'g_drink' },

  // g_num2
  { id: 'four', text: 'four', gloss: '4（よっつ）', emoji: '4️⃣', pos: 'num', cefr: 'A1', eiken: '5', group: 'g_num2' },
  { id: 'five', text: 'five', gloss: '5（いつつ）', emoji: '5️⃣', pos: 'num', cefr: 'A1', eiken: '5', group: 'g_num2' },
  { id: 'minute', text: 'minute', forms: ['minutes'], gloss: '分（時間）', emoji: '⏱️', pos: 'noun', cefr: 'A1', eiken: '5', group: 'g_num2' },

  // g_talk
  { id: 'say', text: 'say', forms: ['said', 'says'], gloss: '言う', emoji: '💬', pos: 'verb', cefr: 'A1', eiken: '5', group: 'g_talk' },
  { id: 'like', text: 'like', gloss: '好きだ', emoji: '❤️', pos: 'verb', cefr: 'A1', eiken: '5', group: 'g_talk' },
  { id: 'very', text: 'very', gloss: 'とても', emoji: '‼️', pos: 'adv', cefr: 'A1', eiken: '5', group: 'g_talk' },
];
