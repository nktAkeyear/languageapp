/**
 * The story, language-neutral: who the regulars are, when each beat happens, what it needs and
 * what it changes. Words live in src/content/{en,zh}/story.ts (same ids), so both languages
 * tell the same story beat for beat. See README.md "Story" and src/story/types.ts.
 *
 * Outline (the predecessor mystery): Ada (梅姨), who kept the shop for thirty years, left one
 * winter night on Nora's ship with a single ticket. A letter Grant had carried from the south
 * told her that her younger sister — not a word between them for twenty years, since a quarrel —
 * was ill. She went to look after her, and in the end she stays. The documents tell it at rising
 * difficulty: the day-1 letter can only be read around chapter 4.
 *
 * Regulars: Rose (Ada's oldest friend; hurt that Ada left without a goodbye), Joe (dockworker;
 * saw Ada leave; becomes a father, is hurt, cannot pay), Tom (a boy running errands for his sick
 * grandmother, Old Mrs. Hill), Nora (the ship's cook who took Ada south and carries the letters),
 * Grant (a pushy travelling merchant who carried the fateful letter and feels responsible),
 * Hale (the schoolteacher, quietly fond of Ada) — plus Anna, Tom's mother.
 */
import type { StoryShared } from '../../story/types';

const S = (n: number) => n;

export const STORY_SHARED: StoryShared = {
  chapters: [
    { id: 'ch1', stage: 1 },
    { id: 'ch2', stage: 5 },
    { id: 'ch3', stage: 10 },
    { id: 'ch4', stage: 15 },
    { id: 'ch5', stage: 20 },
  ],

  characters: [
    { id: 'ada', avatar: '🕯️' },
    { id: 'rose', customer: 'c_grandma' },
    { id: 'joe', customer: 'c_docker' },
    { id: 'tom', customer: 'c_boy' },
    { id: 'nora', customer: 'c_cook' },
    { id: 'grant', customer: 'c_merchant' },
    { id: 'hale', customer: 'c_scholar' },
    { id: 'anna', customer: 'c_mom' },
    { id: 'hill', avatar: '👵' },
  ],

  documents: [
    { id: 'd_letter', kind: 'letter', icon: '✉️', readable: S(19) },
    { id: 'd_margin', kind: 'note', icon: '📝', readable: S(4) },
    { id: 'd_receipt', kind: 'receipt', icon: '🎫', readable: S(12) },
    { id: 'd_diary1', kind: 'diary', icon: '📔', readable: S(17) },
    { id: 'd_postcard', kind: 'postcard', icon: '🏝️', readable: S(16) },
    { id: 'd_recipe_hill', kind: 'recipe', icon: '📜', readable: S(17) },
    { id: 'd_diary2', kind: 'diary', icon: '📔', readable: S(21) },
    { id: 'd_letter2', kind: 'letter', icon: '✉️', readable: S(21) },
    { id: 'd_cup', kind: 'gift', icon: '🍵', readable: S(21) },
    { id: 'd_gift_joe', kind: 'gift', icon: '⛵', readable: S(22) },
    { id: 'd_final', kind: 'letter', icon: '💌', readable: S(23) },
  ],

  beats: [
    // ── Chapter 1: the letter ────────────────────────────────────────────────
    { id: 'm_letter', character: 'ada', kind: 'moment', when: { stage: 1 }, effects: { seen: { docs: ['d_letter'] } } },
    { id: 'rose_1', character: 'rose', kind: 'visit', when: { stage: 2 }, rule: { require: [{ ing: 'lemon' }, { ing: 'honey' }] } },
    { id: 'm_margin', character: 'ada', kind: 'moment', when: { stage: 2, after: ['rose_1'] }, gap: 1, effects: { seen: { docs: ['d_margin'] } } },
    { id: 'grant_1', character: 'grant', kind: 'visit', when: { stage: 2 }, rule: { require: [{ ing: 'honey', min: 2, max: 2 }] } },
    { id: 'joe_1', character: 'joe', kind: 'visit', when: { stage: 3 }, rule: { require: [{ ing: 'ginger' }, { ing: 'honey' }], temp: 'hot' } },
    {
      id: 'rose_2', character: 'rose', kind: 'visit', when: { stage: 4, after: ['m_margin'] },
      rule: { require: [{ ing: 'lemon', min: 1, max: 2 }, { ing: 'honey', min: 1, max: 2 }], forbid: ['sugar'], temp: 'hot' },
      effects: { good: { rep: 1, flags: ['rose_ada_tea'] } },
    },
    { id: 'nora_1', character: 'nora', kind: 'visit', when: { stage: 4 }, rule: { require: [{ ing: 'mint' }, { ing: 'lemon' }, { ing: 'ice' }], temp: 'cold' } },

    // ── Chapter 2: the regulars ──────────────────────────────────────────────
    { id: 'tom_1', character: 'tom', kind: 'visit', when: { stage: 5 }, rule: { require: [{ ing: 'honey', min: 1, max: 2 }, { ing: 'lemon', min: 1, max: 2 }], temp: 'hot' } },
    { id: 'hale_1', character: 'hale', kind: 'visit', when: { stage: 6 }, rule: { require: [{ ing: 'green_tea' }], forbidTag: ['sweet'], temp: 'hot' } },
    { id: 'grant_2', character: 'grant', kind: 'visit', when: { stage: 6, after: ['grant_1'] }, rule: { require: [{ ing: 'green_tea' }, { ing: 'sugar', min: 1, max: 1 }], temp: 'hot' } },
    { id: 'joe_2', character: 'joe', kind: 'visit', when: { stage: 8, after: ['joe_1'] }, rule: { require: [{ ing: 'black_tea' }], temp: 'hot' } },
    { id: 'tom_2', character: 'tom', kind: 'visit', when: { stage: 8, after: ['tom_1'] }, recipe: 'ginger_honey' },
    { id: 'nora_2', character: 'nora', kind: 'visit', when: { stage: 8, after: ['nora_1'] }, recipe: 'mint_green' },
    {
      id: 'joe_3', character: 'joe', kind: 'visit', when: { stage: 9, after: ['joe_2'] },
      rule: { require: [{ ing: 'black_tea', min: 1, max: 1 }, { ing: 'milk', min: 1, max: 2 }], allowTag: ['sweet'], temp: 'hot' },
      effects: { good: { docs: ['d_receipt'] } },
    },
    {
      id: 'tom_3', character: 'tom', kind: 'delivery', when: { stage: 9, after: ['tom_2'] },
      slip: { dest: { rel: 'behind', landmark: 'hospital' }, time: { kind: 'period', period: 'afternoon' } },
      effects: { good: { rep: 1, flags: ['hill_met'] } },
    },

    // ── Chapter 3: word from the sea ─────────────────────────────────────────
    { id: 'hale_2', character: 'hale', kind: 'visit', when: { stage: 10, after: ['hale_1'] }, rule: { require: [{ ing: 'chrysanthemum' }], allow: ['honey'], temp: 'hot' } },
    {
      id: 'rose_3', character: 'rose', kind: 'visit', when: { stage: 10, after: ['rose_2'] },
      rule: { require: [{ ing: 'lemon', min: 1, max: 2 }, { ing: 'honey', min: 1, max: 2 }], forbid: ['sugar'], temp: 'hot' },
      choice: [{ id: 'sorry' }, { id: 'ship', effects: { flags: ['rose_ship'] } }, { id: 'home' }],
    },
    // The receipt, if Joe's cup was not right the first time: he brings it anyway.
    { id: 'joe_3b', character: 'joe', kind: 'moment', at: 'evening', when: { stage: 10, outcome: { joe_3: ['poor'] } }, effects: { seen: { docs: ['d_receipt'] } } },
    { id: 'joe_4', character: 'joe', kind: 'visit', when: { stage: 11, after: ['joe_3'] }, recipe: 'banana_milk' },
    { id: 'm_diary1', character: 'ada', kind: 'moment', when: { stage: 11, after: ['m_letter'] }, effects: { seen: { docs: ['d_diary1'] } } },
    { id: 'anna_1', character: 'anna', kind: 'visit', when: { stage: 11, after: ['tom_3'] }, recipe: 'banana_milk' },
    {
      id: 'grant_3', character: 'grant', kind: 'visit', when: { stage: 12, after: ['grant_2'] },
      rule: { require: [{ ing: 'black_tea', min: 1, max: 1 }, { ing: 'cinnamon', min: 1, max: 1 }], allow: ['honey', 'sugar'], temp: 'hot' },
      choice: [{ id: 'no', effects: { rep: 1 } }, { id: 'yes', effects: { flags: ['grant_yes'] } }, { id: 'ada', effects: { rep: 1, flags: ['grant_ada'] } }],
    },
    { id: 'joe_5', character: 'joe', kind: 'visit', when: { stage: 13, after: ['joe_4'] }, recipe: 'cinnamon_milk_tea', effects: { good: { rep: 1 } } },
    {
      id: 'nora_3', character: 'nora', kind: 'visit', when: { stage: 14, after: ['nora_2'] }, recipe: 'apple_tea',
      effects: { good: { docs: ['d_postcard'] }, poor: { docs: ['d_postcard'] } },
    },

    // ── Chapter 4: body and heart ────────────────────────────────────────────
    {
      id: 'tom_4', character: 'tom', kind: 'visit', when: { stage: 15, after: ['tom_3'] }, recipe: 'pear_honey',
      effects: { good: { rep: 1, flags: ['hill_better'] } },
    },
    {
      id: 'joe_6', character: 'joe', kind: 'delivery', when: { stage: 16, after: ['joe_5'] },
      slip: { dest: { rel: 'across', landmark: 'harbour' }, time: { kind: 'period', period: 'evening' } },
    },
    {
      id: 'hale_3', character: 'hale', kind: 'visit', when: { stage: 16, after: ['hale_2'], docs: ['d_postcard'] },
      rule: { require: [{ ing: 'green_tea', min: 1, max: 1 }], forbidTag: ['sweet'], temp: 'hot' },
      choice: [{ id: 'happy' }, { id: 'sister', effects: { flags: ['hale_knows'] } }, { id: 'sick', effects: { flags: ['hale_scared'] } }],
    },
    {
      id: 'rose_4', character: 'rose', kind: 'delivery', when: { stage: 16, after: ['rose_3'] },
      slip: { dest: { rel: 'next_to', landmark: 'inn' }, time: { kind: 'period', period: 'morning' } },
    },
    { id: 'grant_4', character: 'grant', kind: 'visit', when: { stage: 16, after: ['grant_3'] }, recipe: 'pear_honey' },
    {
      id: 'tom_5a', character: 'tom', kind: 'visit', group: 'tom_5', when: { stage: 17, outcome: { tom_4: ['good'] } },
      rule: { require: [{ ing: 'honey', min: 1, max: 2 }, { ing: 'lemon', min: 1, max: 2 }], temp: 'hot' },
      effects: { good: { docs: ['d_recipe_hill'] }, poor: { docs: ['d_recipe_hill'] } },
    },
    {
      id: 'tom_5b', character: 'tom', kind: 'visit', group: 'tom_5', when: { stage: 17, outcome: { tom_4: ['poor'] } }, recipe: 'pear_honey',
      effects: { good: { flags: ['hill_better'], docs: ['d_recipe_hill'] }, poor: { docs: ['d_recipe_hill'] } },
    },
    { id: 'm_diary2', character: 'ada', kind: 'moment', when: { stage: 18, after: ['m_diary1'] }, effects: { seen: { docs: ['d_diary2'] } } },
    { id: 'rose_5', character: 'rose', kind: 'visit', when: { stage: 18, after: ['rose_4'] }, recipe: 'rose_tea' },
    { id: 'nora_4', character: 'nora', kind: 'visit', when: { stage: 19, after: ['nora_3'] }, recipe: 'coffee_milk' },
    {
      id: 'joe_7', character: 'joe', kind: 'visit', when: { stage: 19, after: ['joe_6'] }, recipe: 'ginger_dates',
      choice: [
        { id: 'free', effects: { rep: 1, flags: ['joe_helped'] } },
        { id: 'pay', effects: { money: 5 } },
        { id: 'refuse', effects: { rep: -2, flags: ['joe_hurt'] } },
      ],
    },

    // ── Chapter 5: across the sea ────────────────────────────────────────────
    {
      id: 'hale_4', character: 'hale', kind: 'visit', when: { stage: 20, after: ['hale_3'] },
      rule: { require: [{ ing: 'black_tea', min: 1, max: 1 }], forbidTag: ['sweet'], temp: 'hot' },
      choice: [{ id: 'rose', effects: { flags: ['hale_roses'] } }, { id: 'coffee' }, { id: 'melon' }],
    },
    {
      id: 'tom_6', character: 'tom', kind: 'visit', when: { stage: 20, docs: ['d_recipe_hill'] },
      rule: { require: [{ ing: 'pear', min: 1, max: 1 }, { ing: 'ginger', min: 2, max: 2 }, { ing: 'honey', min: 1, max: 2 }], temp: 'hot', method: 'boil' },
      effects: { good: { rep: 2 } },
    },
    {
      id: 'nora_5', character: 'nora', kind: 'visit', when: { stage: 21, after: ['nora_4'] }, recipe: 'watermelon_mint',
      effects: { good: { docs: ['d_letter2'] }, poor: { docs: ['d_letter2'] } },
    },
    {
      id: 'nora_6', character: 'nora', kind: 'moment', at: 'evening', when: { stage: 21, after: ['nora_5'] }, gap: 0,
      choice: [{ id: 'pear', effects: { rep: 1, flags: ['sent_pear'] } }, { id: 'coffee' }, { id: 'mint' }],
    },
    {
      id: 'rose_6', character: 'rose', kind: 'visit', when: { stage: 21, after: ['rose_5'] },
      rule: { require: [{ ing: 'lemon', min: 1, max: 2 }, { ing: 'honey', min: 1, max: 2 }], forbid: ['sugar'], temp: 'hot' },
      effects: { good: { docs: ['d_cup'] }, poor: { docs: ['d_cup'] } },
    },
    {
      id: 'joe_8a', character: 'joe', kind: 'visit', group: 'joe_8', when: { stage: 22, choice: { joe_7: ['free', 'pay'] } }, recipe: 'coffee_milk',
      effects: { good: { docs: ['d_gift_joe'] }, poor: { docs: ['d_gift_joe'] } },
    },
    { id: 'joe_8b', character: 'joe', kind: 'visit', group: 'joe_8', when: { stage: 22, choice: { joe_7: ['refuse'] } }, recipe: 'coffee_milk' },
    {
      id: 'grant_5', character: 'grant', kind: 'visit', when: { stage: 22, after: ['grant_4'] },
      rule: { require: [{ ing: 'coffee', min: 1, max: 1 }], allow: ['milk', 'sugar'], temp: 'hot' },
      effects: { good: { money: 20 }, poor: { money: 20 } },
    },
    {
      id: 'hale_5', character: 'hale', kind: 'delivery', when: { stage: 22, after: ['hale_4'] },
      slip: { dest: { rel: 'at', landmark: 'harbour' }, time: { kind: 'period', period: 'morning' } },
      effects: { good: { flags: ['hale_letter'] } },
    },
    {
      id: 'nora_7', character: 'nora', kind: 'visit', when: { stage: 23, after: ['nora_6'] }, recipe: 'apple_tea',
      effects: { good: { docs: ['d_final'] }, poor: { docs: ['d_final'] } },
    },
    {
      id: 'rose_7', character: 'rose', kind: 'visit', when: { stage: 23, after: ['rose_6'], docs: ['d_final'] },
      rule: { require: [{ ing: 'honey' }], allow: 'any', temp: 'hot' },
      effects: { good: { rep: 2 } },
    },
    { id: 'm_end', character: 'ada', kind: 'moment', at: 'evening', when: { stage: 23, after: ['rose_7'] }, gap: 0 },
  ],

  talk: [
    { id: 't_rose_1', character: 'rose', when: { stage: 13, after: ['rose_2'] } },
    { id: 't_rose_2', character: 'rose', when: { stage: 18 } },
    { id: 't_joe_1', character: 'joe', when: { stage: 8 } },
    { id: 't_joe_2', character: 'joe', when: { stage: 13, after: ['joe_5'] } },
    { id: 't_joe_3', character: 'joe', when: { stage: 14 } },
    { id: 't_tom_1', character: 'tom', when: { stage: 9, outcome: { tom_3: ['good'] } } },
    { id: 't_tom_2', character: 'tom', when: { stage: 17, flags: ['hill_better'] } },
    { id: 't_nora_1', character: 'nora', when: { stage: 10 } },
    { id: 't_nora_2', character: 'nora', when: { stage: 14 } },
    { id: 't_grant_1', character: 'grant', when: { stage: 6 } },
    { id: 't_grant_2', character: 'grant', when: { stage: 12 } },
    { id: 't_hale_1', character: 'hale', when: { stage: 8 } },
    { id: 't_hale_2', character: 'hale', when: { stage: 16, after: ['hale_3'] } },
    { id: 't_anna_1', character: 'anna', when: { stage: 11, after: ['anna_1'] } },
    { id: 't_nora_3', character: 'nora', when: { stage: 12, docs: ['d_receipt'] } },
    { id: 't_rose_3', character: 'rose', when: { stage: 21, after: ['rose_6'] } },
  ],
};
