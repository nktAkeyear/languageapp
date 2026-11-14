import type { StoryText } from '../../story/types';

/**
 * English story text (structure: src/content/shared/story.ts). In-world lines use only words the
 * player has met by the beat's stage plus at most two new ones (checked by the validator).
 * Japanese (`ja`, `*Ja`) is chrome: the player-character's brief observations and thoughts.
 */
export const STORY_EN: StoryText = {
  names: ['Ada', 'Rose', 'Joe', 'Tom', 'Nora', 'Hale', 'Mr. Hale', 'Grandma Hill'],

  characters: {
    ada: { name: 'Ada', avatar: '🕯️' },
    hill: { name: 'Old Mrs. Hill', avatar: '👵' },
  },

  recipients: [
    { id: 's_rose', name: 'Grandma Rose', avatar: '👵' },
    { id: 's_joe', name: 'Big Joe', avatar: '👷' },
    { id: 's_nora', name: 'Nora', avatar: '👩‍🍳' },
  ],

  chapters: {
    ch1: { titleJa: '一通の手紙', introJa: '港町の小さな茶房。前の店主は、鍵と手紙を残していなくなった。棚には四つの品。とにかく、店を開けよう。' },
    ch2: { titleJa: '港の常連たち', introJa: '顔なじみが少しずつ増えてきた。誰もが一度は、店の奥の空いた椅子に目をやる。' },
    ch3: { titleJa: '海からの便り', introJa: '挨拶を交わせるようになった。港には、遠くから船が着く。' },
    ch4: { titleJa: 'からだと、こころ', introJa: '具合の悪さや胸の内を話してくれる人が増えた。言葉の向こうに、事情が見えはじめる。' },
    ch5: { titleJa: '海の向こうへ', introJa: '問いかけられることが増えた。そろそろ、答えを出すときかもしれない。' },
  },

  beats: {
    // ── Chapter 1
    m_letter: {
      lines: [{ ja: 'カウンターの上に、封筒が一通。前の店主の字だ。……ほとんど読めない。' }],
      hookJa: '前の店主は、なぜ店を手放したのだろう。',
    },
    rose_1: {
      order: 'Lemon with honey, please.',
      good: 'Oh… good. Thank you.',
      poor: 'Oh… no.',
      linesGood: [{ ja: 'おばあさんはカップを両手で包んで、店の奥の空いた椅子をじっと見ていた。' }],
      linesPoor: [{ ja: 'おばあさんは小さくため息をついて、店の奥の空いた椅子を見ていた。' }],
      hookJa: 'あのおばあさんは、誰を探していたのだろう。',
    },
    m_margin: {
      lines: [{ ja: 'レシピ帳の余白に、走り書きを見つけた。前の店主の字だ。' }],
    },
    grant_1: {
      order: 'Two spoons of honey. Two! Please.',
      good: 'Yes. Good.',
      poor: 'No, no! Two spoons!',
      lines: [{ ja: 'せっかちな商人だ。店の中をじろじろ見回して、出ていった。' }],
    },
    joe_1: {
      order: 'Ginger and honey, please. Hot! Very hot!',
      good: 'Oh, good! Thank you!',
      poor: 'Oh… no, no.',
      lines: [{ ja: '大きな手の男。袖から潮の匂いがした。港で働いているらしい。' }],
      hookJa: '港で働く大男。また来てくれそうだ。',
    },
    rose_2: {
      order: "Ada's tea, please.",
      good: "Oh… Ada's tea. Thank you. Thank you.",
      poor: "No… not Ada's tea.",
      linesGood: [{ ja: '一口飲んで、おばあさんは目を閉じた。しばらく、何も言わなかった。' }],
      linesPoor: [{ ja: 'おばあさんは寂しそうに笑って、代金を置いていった。' }],
      hookGoodJa: '“Ada”——それが前の店主の名前らしい。あの走り書きは、このおばあさんのためのものだった。',
      hookPoorJa: 'おばあさんの言う“Ada”は、前の店主のことだろうか。',
    },
    nora_1: {
      order: 'Mint and lemon with ice, please. Cold!',
      good: 'Delicious! Thank you!',
      poor: 'Oh. No…',
      lines: [{ ja: '帰りぎわ、その人は店の奥をのぞきこんだ。' }, { say: 'Ada? … Oh.' }],
      hookJa: '前の店主を探す人が、また一人。',
    },

    // ── Chapter 2
    tom_1: {
      order: 'Hot honey and lemon, please. For a sore throat.',
      good: 'Thank you! Very good!',
      poor: 'Oh… no.',
      lines: [{ ja: '少年はカップを大事そうに抱えて、走って出ていった。自分で飲むのではないらしい。' }],
      hookJa: 'あの子は、誰のためにお茶を？',
    },
    hale_1: {
      order: 'Green tea, please. Hot. Not sweet.',
      good: 'Perfect.',
      poor: 'No. Not perfect.',
      lines: [{ ja: '眼鏡の奥で、店の奥の空いた椅子をちらりと見た。学校の先生らしい。' }],
      hookJa: 'あの先生も、前の店主を知っているのだろうか。',
    },
    grant_2: {
      order: 'Green tea. Hot. One spoon of sugar.',
      good: 'Good. … Where is Ada?',
      poor: "No. Ada's tea is good. This… no.",
      hookJa: 'あの商人も“Ada”の名を口にした。',
    },
    joe_2: {
      order: "I'm tired. Black tea, please. Very hot.",
      good: 'Thank you. … Ada? At night, at the harbour.',
      poor: "Oh… no. I'm tired.",
      lines: [{ ja: '男は窓の向こうの港を見て、首をふった。' }],
      hookJa: '前の店主は、夜の港にいた？',
    },
    tom_2: {
      order: 'Ginger and honey for my grandmother, please. Hot. She has a {cold|cold_illness}.',
      good: 'Thank you! Very good!',
      poor: 'Oh… is this for a {cold|cold_illness}?',
      lines: [{ ja: 'お使いだったのか。おばあさんが風邪をひいているらしい。' }],
      hookJa: 'あの子のおばあさん、具合はどうだろう。',
    },
    nora_2: {
      order: 'Green tea with mint and ice, please.',
      good: 'Delicious! … My ship goes tomorrow.',
      poor: 'Oh… no.',
      lines: [{ ja: '窓の向こう、港に大きな船が見える。' }],
      hookJa: 'あの人は、船で働いているらしい。',
    },
    joe_3: {
      order: 'Black tea with milk, please. Hot.',
      good: "Thank you. … This is for you. Ada's ticket. At the harbour, at night.",
      poor: 'Oh… no. Not today.',
      linesGood: [{ ja: '男は、くしゃくしゃの紙切れをカウンターに置いた。' }],
      hookGoodJa: '破れた紙切れ。前の店主のもの？',
      hookPoorJa: '男は何か言いかけて、やめた。',
    },
    tom_3: {
      request: 'For my grandmother. Thank you! — Tom',
      recipient: 'r_hill',
      good: 'Oh! From Tom? Thank you! Tom is a good child.',
      linesGood: [{ ja: '戸口に出てきたのは、小さなおばあさんだった。咳をしながら笑っていた。' }],
      hookGoodJa: '少年のおばあさんに会えた。',
    },

    // ── Chapter 3
    hale_2: {
      order: 'Hello. Chrysanthemum tea, please. Hot.',
      good: 'Thank you. … Ada is my friend. Twenty years.',
      poor: 'No… not this.',
      lines: [{ ja: '先生は空いた椅子に、しばらく目をやっていた。' }],
      hookJa: '先生は、前の店主の友人だった。',
    },
    rose_3: {
      order: "Hello, friend. Ada's tea, please.",
      good: 'Thank you. … Ada. Where is Ada?',
      poor: "Oh… Ada's tea is lemon and honey. Hot. No sugar.",
      prompt: 'Where is Ada? Where?',
      options: {
        sorry: { text: 'Sorry…', reply: 'Oh… no, no. Thank you.', ja: 'おばあさんは、それ以上たずねなかった。' },
        ship: { text: 'A ship. At night.', reply: 'A ship? … Ada… a ship?', ja: 'おばあさんの手が、少し震えていた。' },
        home: { text: 'At home.', reply: 'No. Not at home.', ja: 'おばあさんは首をふった。家にはいない、と知っているのだ。' },
      },
    },
    joe_3b: {
      lines: [{ ja: '店じまいの直前、港の大男が戻ってきた。' }, { say: "Sorry. This is for you. Ada's ticket. At the harbour, at night." }],
      hookJa: '破れた紙切れ。前の店主のもの？',
    },
    joe_4: {
      order: 'Banana milk for my wife, please. Cold.',
      good: 'Thank you! My wife… a baby! Today? Tomorrow?!',
      poor: 'Oh… no. For my wife!',
      lines: [{ ja: '大男は落ち着きなく、何度も港のほうを振り返った。' }],
      hookJa: 'もうすぐ父親になるらしい。',
    },
    m_diary1: {
      lines: [{ ja: '棚の奥から、日記帳のページが一枚落ちてきた。' }],
      hookJa: '前の店主の日記。いつか読めるようになるだろうか。',
    },
    anna_1: {
      order: 'Banana milk for my child, please. Cold.',
      good: "Thank you! … Tom's grandmother likes your tea.",
      poor: 'Oh… no.',
      lines: [{ ja: 'あの少年の母親だった。疲れた顔で、それでも笑っていた。' }],
      hookJa: '少年の家族のことが、少しわかってきた。',
    },
    grant_3: {
      order: 'Black tea with cinnamon. Hot.',
      good: 'Good.',
      poor: 'No. Cinnamon! Black tea!',
      prompt: 'I like this shop. I want it! A hundred coins!',
      options: {
        no: { text: 'No, thank you.', reply: 'Good! Ada said no. You say no. Good!' },
        yes: { text: 'Yes!', reply: "Yes? … No, no. This is Ada's shop. Not my shop.", ja: '商人は、なぜか少しほっとした顔をした。' },
        ada: { text: "Sorry. This is Ada's shop.", reply: "Ada's shop… yes. You are a good friend." },
      },
    },
    joe_5: {
      order: 'Hello, friend! Black tea with milk and cinnamon, please. Hot. Stir it!',
      good: "Thank you! I'm a father now! A father!",
      poor: "Oh… no. … I'm a father now!",
      lines: [{ ja: '大男は小さな靴下を見せてくれた。顔じゅうで笑っていた。' }],
      hookJa: '港の大男が父親になった。',
    },
    nora_3: {
      order: "Hello! Hot apple tea, please. It's cold today.",
      good: 'Thank you! … This is for you. From the sea. From Ada.',
      poor: 'Oh… no. … This is for you. From Ada.',
      lines: [{ ja: '一枚の絵はがき。南の海の絵だった。' }],
      hookJa: '前の店主から、絵はがきが届いた。海の向こうにいるらしい。',
    },

    // ── Chapter 4
    tom_4: {
      order: 'My grandmother has a cough. Please!',
      good: 'Thank you! Thank you!',
      poor: 'Oh… is this for a cough?',
      lines: [{ ja: '少年の目が赤い。走ってきたのか、泣いていたのか。' }],
      hookGoodJa: 'おばあさんの咳、よくなるといいけれど。',
      hookPoorJa: '咳に効くお茶……レシピ帳をもっとよく見ておけばよかった。',
    },
    joe_6: {
      request: "For Joe. He is sick. His head hurts. — Joe's wife",
      recipient: 's_joe',
      good: "Thank you, friend. I'm sick… and I'm worried.",
      linesGood: [{ ja: '大男はベッドの上から、弱々しく手を振った。奥で赤ん坊が泣いている。' }],
      hookJa: '働けないと、あの家族はどうなるのだろう。',
    },
    hale_3: {
      order: 'Green tea. Hot. Not sweet.',
      good: 'Thank you.',
      poor: 'No.',
      prompt: 'A letter from Ada? … Is she happy?',
      options: {
        happy: { text: 'Yes. She is happy.', reply: 'Good… good. Thank you.', ja: '先生はほっとした顔で帰っていった。……あれでよかったのだろうか。' },
        sister: { text: 'Her sister is sick. She is worried.', reply: 'Her sister… oh. Thank you. Thank you.', ja: '先生は静かにうなずいた。' },
        sick: { text: 'She is sick.', reply: 'Ada is sick?! Oh, no…', ja: '先生の顔が真っ青になった。……あの絵はがき、本当にそう書いてあった？' },
      },
    },
    rose_4: {
      request: "Ada's tea, please. Snow… I can't come. — Rose",
      recipient: 's_rose',
      good: "Thank you. … Ada went. No goodbye. I'm sad, and angry.",
      linesGood: [{ ja: 'おばあさんは窓の外の雪を見ていた。' }],
      hookJa: '“さよならも言わずに”——おばあさんは、それが一番つらいのだ。',
    },
    grant_4: {
      order: 'Pear and honey. Boil it. I have a cough.',
      good: 'Thank you.',
      poor: 'No… pear, honey. Boil it.',
      lines: [{ say: "A letter from Ada's sister. I gave it to Ada. In winter. Then Ada went." }, { ja: 'いつも偉そうな商人が、うつむいていた。' }],
      hookJa: '妹からの手紙を運んだのは、あの商人だった。',
    },
    tom_5a: {
      order: 'Hello! Honey and lemon, please. Hot.',
      good: 'My grandmother is better! This is for you. From her.',
      poor: 'Oh… no. … This is for you. From my grandmother.',
      lines: [{ ja: '少年が差し出したのは、几帳面な字のレシピカードだった。' }],
      hookJa: 'おばあさんの秘伝のレシピをもらった。',
    },
    tom_5b: {
      order: 'My grandmother still has a cough. Please!',
      good: 'Thank you! … This is for you. From my grandmother.',
      poor: 'Oh… This is for you. From my grandmother.',
      lines: [{ ja: '少年が差し出したのは、几帳面な字のレシピカードだった。' }],
      hookJa: 'おばあさんの秘伝のレシピをもらった。',
    },
    m_diary2: {
      lines: [{ ja: '古いレシピ帳の表紙の裏に、日記のページがはさまっていた。' }],
    },
    rose_5: {
      order: 'A cup of rose tea, please.',
      good: 'Ada likes rose tea. Very much. … I remember.',
      poor: 'Oh… no. Roses and black tea.',
      lines: [{ ja: 'おばあさんは、カップの中の花びらをじっと見つめていた。' }],
      hookJa: '前の店主は、バラのお茶が好きだった。',
    },
    nora_4: {
      order: 'Coffee with milk, please. Hot. Stir it.',
      good: 'Thank you. … Ada? I know. My ship took Ada to her sister.',
      poor: 'Oh… no. … Ada? My ship took Ada to her sister.',
      lines: [{ ja: 'それ以上は言わなかった。前の店主に口止めされていたのかもしれない。' }],
      hookJa: '前の店主は、あの人の船で、妹のところへ行った。',
    },
    joe_7: {
      order: 'Ginger and red dates, please. Boil it.',
      good: 'Thank you…',
      poor: 'Oh… no.',
      prompt: 'Sorry… no work, no money. No money today.',
      options: {
        free: { text: 'Please take it. For your family.', reply: 'Thank you… thank you, friend.', ja: 'お代はもらわなかった。' },
        pay: { text: 'Five coins, please.', reply: 'Oh… yes. Five coins. Here.', ja: '五枚の硬貨が、ずいぶん重く感じた。' },
        refuse: { text: 'No money, no tea.', reply: 'Oh… sorry. Goodbye.', ja: '男は黙って出ていった。……あれでよかったのだろうか。' },
      },
    },

    // ── Chapter 5
    hale_4: {
      order: 'Black tea, please. Hot. Not sweet.',
      good: 'Thank you.',
      poor: 'No.',
      prompt: "Nora's ship… I'm going to see Ada! What does Ada like?",
      options: {
        rose: { text: 'Rose tea.', reply: 'Rose tea! Yes… thank you!' },
        coffee: { text: 'Coffee.', reply: 'Coffee? … Thank you.' },
        melon: { text: 'A watermelon.', reply: 'A big watermelon? … Thank you.' },
      },
    },
    tom_6: {
      order: "Mr. Hale has a {cold|cold_illness}. He needs Grandma Hill's tea.",
      good: 'Thank you! Yes, this is it!',
      poor: "Oh… is this Grandma Hill's tea?",
      lines: [{ ja: '少年の先生——あの眼鏡の先生のことだ。' }],
    },
    nora_5: {
      order: "Watermelon and mint with ice, please. It's hot today.",
      good: 'Thank you! … A letter. From Ada. For you.',
      poor: 'Oh… no. … A letter. From Ada. For you.',
      hookJa: '前の店主から、二通目の手紙。',
    },
    nora_6: {
      lines: [{ ja: '閉店後、船の料理番が戻ってきた。' }],
      prompt: "My ship goes tomorrow. Tea for Ada's sister? Which tea?",
      options: {
        pear: { text: 'Pear and honey tea.', reply: 'Pear and honey. For a cough. Good!' },
        coffee: { text: 'Coffee with milk.', reply: 'Coffee? At night? … Yes, yes.' },
        mint: { text: 'Watermelon and mint.', reply: 'A watermelon? … Yes, yes.' },
      },
      hookJa: '海の向こうへ、お茶を託した。',
    },
    rose_6: {
      order: "Hello, friend. Ada's tea, please.",
      good: "Thank you. … This is Ada's cup. Now it's your cup.",
      poor: "Ada's tea is lemon and honey… but thank you. This is Ada's cup. Now it's your cup.",
      lines: [{ say: 'Ada and I were friends for fifty years. I remember.' }, { say: "I'm not angry now. I miss her." }, { ja: '差し出されたのは、縁の少し欠けた青いカップだった。' }],
      hookJa: '前の店主の青いカップ。',
    },
    joe_8a: {
      order: "Hello, friend! I'm working again! Coffee with milk, please. Hot. Stir it!",
      good: 'Thank you! This is for you. From my family.',
      poor: 'Oh, no… but thank you. This is for you. From my family.',
      lines: [{ ja: '男が置いていったのは、木を削って作った小さな船だった。' }],
      hookJa: '港の大男が、また働き始めた。',
    },
    joe_8b: {
      order: 'Coffee with milk, please. Hot. Stir it.',
      good: "Thank you. I'm working again now. … Goodbye.",
      poor: '… Goodbye.',
      lines: [{ ja: '男は、前のようには笑わなかった。' }],
      hookJa: 'あの日、断らなければよかった。',
    },
    grant_5: {
      order: 'Coffee, please. Hot. How much?',
      good: 'Good coffee. … This is for the shop. For Ada.',
      poor: 'Hot? Yes. Good? No. … This is for the shop. For Ada.',
      lines: [{ say: "Ada's sister is better now. Ada is happy." }, { ja: '商人は硬貨の袋をカウンターに置いて、さっさと出ていった。' }],
      hookJa: 'あの商人なりの、けじめだったのかもしれない。',
    },
    hale_5: {
      request: "A letter for Ada. Please take it to Nora's ship. — Hale",
      recipient: 's_nora',
      good: 'A letter for Ada? From Hale? Oh! Yes, yes!',
      hookGoodJa: '先生の手紙は、船に乗った。',
    },
    nora_7: {
      order: 'Hello, friend! Hot apple tea, please.',
      good: 'Thank you! … From Ada. For you.',
      poor: 'Oh… no. … From Ada. For you.',
      hookJa: '前の店主から、最後の手紙が届いた。',
    },
    rose_7: {
      order: "Ada's tea? No. Your tea, please. Hot, with honey.",
      good: 'Delicious. … Ada is happy. I am happy. And you are my friend now.',
      poor: 'Oh… but thank you. You are my friend now.',
      lines: [{ ja: 'おばあさんが、初めて声をあげて笑った。' }],
      hookJa: '“あなたのお茶を”——そう言われた。',
    },
    m_end: {
      lines: [{ ja: '店じまいのあと、青いカップでお茶を一杯いれた。' }, { ja: '前の店主は、もう戻らない。でも、この店はもう、ひとりじゃない。' }],
      hookJa: '明日も、この港町で店を開けよう。',
    },
  },

  docs: {
    d_letter: {
      titleJa: '前の店主の手紙',
      lines: [
        'Hello, friend.',
        'This is your shop now.',
        'I have to go. My sister needs me.',
        'Please give my friends tea.',
        'Rose likes lemon and honey. Hot, no sugar.',
        'Thank you. — Ada',
      ],
    },
    d_margin: { titleJa: 'レシピ帳の走り書き', lines: ['Rose: lemon and honey.', 'Hot water.', 'No sugar!'] },
    d_receipt: { titleJa: '破れた紙切れ', lines: ['Ship ticket', 'One. Night.', 'Fifty coins.', 'To: ……'] },
    d_diary1: {
      titleJa: '日記のページ（一）',
      lines: ['Winter.', 'A letter from my sister.', 'Twenty years, no letters. Now this.', 'She is sick. She needs me.', "I can't sleep."],
    },
    d_postcard: {
      titleJa: '南の海の絵はがき',
      lines: ['Hello, friend!', "It's sunny and warm.", 'My sister is sick. I am worried.', 'I love the sea.', 'Is Rose happy?', '— Ada'],
    },
    d_recipe_hill: {
      titleJa: 'ヒルおばあさんのレシピ',
      lines: ["Grandma Hill's tea", 'One pear.', 'Two slices of ginger.', 'Honey.', 'Boil it.', 'For a {cold|cold_illness}.'],
    },
    d_diary2: {
      titleJa: '日記のページ（二）',
      lines: [
        'My sister and I were very angry.',
        'She took a ship. Twenty years, no letters.',
        'We loved rose tea. I remember.',
        'Now I am not angry. I am only sad.',
        'I miss her.',
      ],
    },
    d_letter2: {
      titleJa: '二通目の手紙',
      lines: [
        'Hello, friend.',
        "My sister coughs at night. She can't sleep.",
        'I am tired. But I am happy here.',
        'Please give Nora some tea for my sister.',
        'Thank you. — Ada',
      ],
    },
    d_cup: { titleJa: '青いカップ', lines: ["For you. This is Ada's cup.", 'Now it is your cup.', '— Rose'] },
    d_gift_joe: { titleJa: '木彫りの小さな船', lines: ['For the tea friend.', 'Thank you. You helped my family.', '— Joe'] },
    d_final: {
      titleJa: '最後の手紙',
      lines: [
        'Hello, friend.',
        { text: 'Thank you for the tea. My sister can sleep now.', when: { choice: { nora_6: ['pear'] } } },
        { text: "Coffee? At night? My sister can't sleep! But thank you.", when: { choice: { nora_6: ['coffee'] } } },
        { text: 'Watermelon and mint? Not for a cough! But thank you.', when: { choice: { nora_6: ['mint'] } } },
        { text: 'Hale came with roses. Rose tea every morning!', when: { choice: { hale_4: ['rose'] } } },
        { text: "Hale came with coffee! I don't drink coffee… but I was happy.", when: { choice: { hale_4: ['coffee'] } } },
        { text: 'Hale came with a big watermelon!', when: { choice: { hale_4: ['melon'] } } },
        'I am not coming back. My home is here now, with my sister.',
        'The shop is your home now.',
        'Please give Rose her tea. Every day.',
        'Thank you, friend. — Ada',
      ],
    },
  },

  talk: {
    t_rose_1: "Hello, friend. Ada's shop… your shop now.",
    t_rose_2: 'Ada likes rose tea. Very much.',
    t_joe_1: 'The harbour is very cold at night.',
    t_joe_2: "My baby can't sleep. I can't sleep!",
    t_joe_3: 'Snow! The harbour is very cold today.',
    t_tom_1: 'My grandmother says thank you!',
    t_tom_2: 'My grandmother is better now!',
    t_nora_1: 'Hello, friend! My ship is at the harbour today.',
    t_nora_2: 'The sea is cold in winter.',
    t_grant_1: "Good tea. Not Ada's tea. Good tea.",
    t_grant_2: 'Cheap tea? No. Good tea.',
    t_hale_1: 'Tom is a good child. His grandmother has a {cold|cold_illness}.',
    t_hale_2: "Ada's letter… thank you.",
    t_anna_1: 'Tom is a good child. He likes your shop!',
    t_nora_3: 'A ship ticket is fifty coins.',
    t_rose_3: "That is Ada's cup. Now it's your cup.",
  },

  lexicon: [
    { id: 'shop', text: 'shop', forms: ['shops'], gloss: '店', emoji: '🏪', pos: 'noun', cefr: 'A1', eiken: '5', group: 'gs_port' },
    { id: 'ship', text: 'ship', forms: ['ships'], gloss: '船', emoji: '🚢', pos: 'noun', cefr: 'A1', eiken: '4', group: 'gs_port' },
    { id: 'sea', text: 'sea', gloss: '海', emoji: '🌊', pos: 'noun', cefr: 'A1', eiken: '5', group: 'gs_port' },
    { id: 'letter', text: 'letter', forms: ['letters'], gloss: '手紙', emoji: '✉️', pos: 'noun', cefr: 'A1', eiken: '5', group: 'gs_port' },
    { id: 'ticket', text: 'ticket', forms: ['tickets'], gloss: '切符・券', emoji: '🎫', pos: 'noun', cefr: 'A1', eiken: '4', group: 'gs_port' },
    { id: 'she', text: 'she', gloss: '彼女は（その女の人は）', emoji: '👩', pos: 'pron', cefr: 'A1', eiken: '5', group: 'gs_they' },
    { id: 'he', text: 'he', gloss: '彼は（その男の人は）', emoji: '👨', pos: 'pron', cefr: 'A1', eiken: '5', group: 'gs_they' },
    { id: 'her', text: 'her', gloss: '彼女の・彼女を', emoji: '👩‍🦰', pos: 'pron', cefr: 'A1', eiken: '5', group: 'gs_they' },
    { id: 'his', text: 'his', gloss: '彼の', emoji: '🧔', pos: 'det', cefr: 'A1', eiken: '5', group: 'gs_they' },
    { id: 'miss', text: 'miss', forms: ['misses', 'missed'], gloss: '（いなくて）さびしく思う', emoji: '🥺', pos: 'verb', cefr: 'A2', eiken: '3', group: 'gs_heart' },
    { id: 'remember', text: 'remember', gloss: '覚えている・思い出す', emoji: '💭', pos: 'verb', cefr: 'A1', eiken: '4', group: 'gs_heart' },
    { id: 'year', text: 'year', forms: ['years'], gloss: '年（一年）', emoji: '📅', pos: 'noun', cefr: 'A1', eiken: '5', group: 'gs_heart' },
    { id: 'from', text: 'from', gloss: '〜から', emoji: '📤', pos: 'prep', cefr: 'A1', eiken: '5', group: 'gs_heart' },
  ],

  pages: [
    { id: 'gs_port', labelJa: '港と手紙' },
    { id: 'gs_they', labelJa: 'あの人のこと' },
    { id: 'gs_heart', labelJa: '思い出の言葉' },
  ],

  forms: {
    is: ['was', 'were'],
    go: ['went'],
    come: ['came'],
    take: ['took'],
    give: ['gave'],
    help: ['helped'],
    love: ['loved'],
  },
};
