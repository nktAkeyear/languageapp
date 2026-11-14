import { describe, expect, it } from 'vitest';
import { currentSegment, endTownDay, hasNextSegment, nextSegment, serveInTown, startTownDay, stockOf } from '../activities/day';
import { solveDelivery } from '../activities/delivery/engine';
import { finishMarket, solveMarket } from '../activities/market/engine';
import { currentOrder, nextCustomer } from '../activities/shop/engine';
import { witnessBrew } from '../activities/shop/rules';
import { CONTENT, SHARED } from '../content';
import { buildGameData, ingredientsAtStage, type GameData } from '../core/gamedata';
import { makeRng } from '../core/rng';
import { migrateSave, newProgress, SAVE_VERSION } from '../core/save';
import { LANGS, type Brew, type IngredientId, type SharedContent, type LanguageContent } from '../core/types';
import { validateLanguage, validateShared } from '../core/validate';
import {
  applyEffect,
  beatEligible,
  cardNeedsChoice,
  condHolds,
  docLines,
  docFreshWords,
  docReadability,
  storyAutoPlay,
  storyDocPutAway,
  storyChoose,
  storyDismiss,
  storyPlanShop,
  storyReadDoc,
  storyState,
  storySync,
  STORY_KEY_PREFIX,
} from './engine';
import { storyOf, storyWordIds } from './text';
import { unreachableBeats } from './validate';
import { contentWordStages } from './vocab';
import type { BeatDef } from './types';

const DATA: Record<string, GameData> = {};
const data = (lang: 'en' | 'zh') => (DATA[lang] ??= buildGameData(CONTENT[lang], SHARED));

/** Play days with the solvers; every `failEvery`-th cup is wrong; choices pick option `choice`. */
function play(lang: 'en' | 'zh', days: number, opts: { seed?: number; failEvery?: number; choice?: number; failStory?: boolean } = {}) {
  const d = data(lang);
  const p = newProgress(lang);
  const rng = makeRng(opts.seed ?? 1);
  let n = 0;
  const pickChoice = (b: BeatDef) => b.choice![(opts.choice ?? 0) % b.choice!.length].id;
  for (let day = 0; day < days; day++) {
    startTownDay(d, p, rng);
    storyAutoPlay(d, p, pickChoice);
    for (;;) {
      const seg = currentSegment(p);
      if (seg === 'market') {
        solveMarket(d, p, rng);
        finishMarket(d, p);
      } else if (seg === 'shop') {
        while (p.today!.phase !== 'closed') {
          const o = currentOrder(p)!;
          const fail = (!!opts.failEvery && ++n % opts.failEvery === 0) || (!!opts.failStory && o.key.startsWith(STORY_KEY_PREFIX));
          const shelf = new Set(ingredientsAtStage(d, p.stage).filter((i) => stockOf(p, i as IngredientId) !== 0));
          const brew: Brew = fail ? { counts: { salt: 1, mint: 4 }, temp: null, method: null } : (witnessBrew(o.rule, shelf, d.ing) ?? { counts: { water: 1 }, temp: null, method: null });
          serveInTown(d, p, brew, rng);
          storyAutoPlay(d, p, pickChoice);
          nextCustomer(d, p);
        }
      } else {
        solveDelivery(d, p, rng);
        storySync(d, p);
        storyAutoPlay(d, p, pickChoice);
      }
      if (!hasNextSegment(p)) break;
      nextSegment(p);
    }
    endTownDay(p, d);
    storyAutoPlay(d, p, pickChoice);
  }
  return p;
}

describe('story conditions and effects', () => {
  it('evaluates stage, day, after, outcome, choice, flags and documents', () => {
    const p = newProgress('en');
    const st = storyState(p);
    p.stage = 5;
    p.day = 6;
    expect(condHolds({ stage: 5, day: 6 }, p)).toBe(true);
    expect(condHolds({ stage: 6 }, p)).toBe(false);
    expect(condHolds({ after: ['rose_1'] }, p)).toBe(false);
    st.beats.rose_1 = { day: 2, status: 'planned' };
    expect(condHolds({ after: ['rose_1'] }, p)).toBe(false);
    st.beats.rose_1 = { day: 2, status: 'done', outcome: 'poor' };
    expect(condHolds({ after: ['rose_1'] }, p)).toBe(true);
    expect(condHolds({ outcome: { rose_1: ['good'] } }, p)).toBe(false);
    expect(condHolds({ outcome: { rose_1: ['poor'] } }, p)).toBe(true);
    st.beats.grant_3 = { day: 3, status: 'done', outcome: 'good', choice: 'ada' };
    expect(condHolds({ choice: { grant_3: ['no', 'ada'] } }, p)).toBe(true);
    expect(condHolds({ choice: { grant_3: ['yes'] } }, p)).toBe(false);
    expect(condHolds({ flags: ['x'] }, p)).toBe(false);
    applyEffect(data('en'), p, { flags: ['x'], rep: 3, money: -5, docs: ['d_margin'] });
    expect(condHolds({ flags: ['x'], docs: ['d_margin'] }, p)).toBe(true);
    expect(condHolds({ notFlags: ['x'] }, p)).toBe(false);
    expect(p.reputation).toBe(3);
    expect(p.town.money).toBe(15);
    expect(st.cards.at(-1)).toEqual({ kind: 'doc', doc: 'd_margin' });
  });

  it('respects groups and the per-character gap', () => {
    const d = data('en');
    const story = storyOf(d)!;
    const p = newProgress('en');
    p.stage = 17;
    p.day = 30;
    const st = storyState(p);
    const a = story.shared.beats.find((b) => b.id === 'tom_5a')!;
    const b = story.shared.beats.find((x) => x.id === 'tom_5b')!;
    st.beats.tom_4 = { day: 20, status: 'done', outcome: 'good' };
    expect(beatEligible(story, p, a)).toBe(true);
    expect(beatEligible(story, p, b)).toBe(false);
    st.beats.tom_4.day = 29; // Tom was here yesterday: the default gap is 2 days
    expect(beatEligible(story, p, a)).toBe(false);
    st.beats.tom_4.day = 20;
    st.groups.push('tom_5');
    expect(beatEligible(story, p, a)).toBe(false);
  });
});

describe('story day hooks', () => {
  it('day 1: chapter card, the letter scene and the letter document', () => {
    const d = data('en');
    const p = newProgress('en');
    startTownDay(d, p, makeRng(1));
    const kinds = storyState(p).cards.map((c) => c.kind);
    expect(kinds).toEqual(['chapter', 'scene', 'doc']);
    expect(storyState(p).docs.d_letter).toBeDefined();
    expect(storyState(p).docs.d_letter.firstPct).toBe(0);
  });

  it('injects a visit, resolves it with its own reaction, effects and no anonymous return', () => {
    const d = data('en');
    const p = newProgress('en');
    const rng = makeRng(2);
    p.day = 2;
    p.reputation = 5;
    startTownDay(d, p, rng);
    const q = p.today!.queue;
    const idx = q.findIndex((o) => o.key === STORY_KEY_PREFIX + 'rose_1');
    expect(idx).toBeGreaterThan(-1);
    expect(q[idx].customer).toBe('c_grandma');
    expect(storyState(p).beats.rose_1.status).toBe('planned');
    // Serve everyone up to Rose, then give Rose a wrong cup.
    while (p.today!.index < idx) {
      serveInTown(d, p, witnessBrew(currentOrder(p)!.rule, new Set(ingredientsAtStage(d, p.stage)), d.ing)!, rng);
      nextCustomer(d, p);
    }
    const out = serveInTown(d, p, { counts: { salt: 1 }, temp: null, method: null }, rng)!;
    expect(out.reaction.text).toBe(storyOf(d)!.text.beats.rose_1.poor);
    expect(storyState(p).beats.rose_1).toMatchObject({ status: 'done', outcome: 'poor' });
    expect(p.returns.some((r) => r.instance.key.startsWith(STORY_KEY_PREFIX))).toBe(false);
    expect(p.words.no?.seen).toBeGreaterThan(0);
  });

  it('a delivery beat replaces the slip and resolves through storySync', () => {
    const d = data('en');
    const p = newProgress('en');
    p.day = 14;
    p.stage = 10;
    p.reputation = 60;
    p.town.unlocked = { market: 5, delivery: 9 };
    p.town.deliveryRuns = 3;
    const st = storyState(p);
    for (const id of ['tom_1', 'tom_2']) st.beats[id] = { day: 10, status: 'done', outcome: 'good' };
    startTownDay(d, p, makeRng(3));
    expect(p.townDay!.segments).toContain('delivery');
    expect(p.townDay!.delivery!.slip.key).toBe(STORY_KEY_PREFIX + 'tom_3');
    expect(p.townDay!.delivery!.slip.recipient).toBe('r_hill');
    while (currentSegment(p) !== 'delivery') {
      if (currentSegment(p) === 'market') {
        solveMarket(d, p, makeRng(4));
        finishMarket(d, p);
      } else
        while (p.today!.phase !== 'closed') {
          serveInTown(d, p, witnessBrew(currentOrder(p)!.rule, new Set(ingredientsAtStage(d, p.stage)), d.ing) ?? { counts: { water: 1 }, temp: null, method: null }, makeRng(5));
          nextCustomer(d, p);
        }
      nextSegment(p);
    }
    solveDelivery(d, p, makeRng(6));
    expect(storySync(d, p)).toBe(true);
    expect(st.beats.tom_3).toMatchObject({ status: 'done', outcome: 'good' });
    expect(p.townDay!.delivery!.result!.reaction).toBe(storyOf(d)!.text.beats.tom_3.good);
    expect(storySync(d, p)).toBe(false);
  });

  it('end of day: the ledger card; unresolved beats wait for another day', () => {
    const d = data('en');
    const p = newProgress('en');
    startTownDay(d, p, makeRng(1));
    storyState(p).cards = [];
    storyState(p).beats.joe_1 = { day: 1, status: 'planned' };
    while (p.today!.phase !== 'closed') {
      serveInTown(d, p, witnessBrew(currentOrder(p)!.rule, new Set(ingredientsAtStage(d, p.stage)), d.ing)!, makeRng(1));
      nextCustomer(d, p);
    }
    endTownDay(p, d);
    const st = storyState(p);
    expect(st.beats.joe_1).toBeUndefined();
    const ledger = st.cards.find((c) => c.kind === 'ledger');
    expect(ledger && ledger.kind === 'ledger' && ledger.ledger.served).toBeGreaterThan(0);
    expect(st.lastLedger?.day).toBe(1);
    expect(p.day).toBe(2);
  });

  it('choices: the card waits for an answer, records it and shows the reply', () => {
    const d = data('zh');
    const p = newProgress('zh');
    const st = storyState(p);
    st.beats.grant_3 = { day: 1, status: 'done', outcome: 'good' };
    st.cards = [{ kind: 'scene', beat: 'grant_3', outcome: 'good' }];
    expect(cardNeedsChoice(d, p)).toBe(true);
    storyDismiss(d, p);
    expect(st.cards).toHaveLength(1);
    storyChoose(d, p, 'ada');
    expect(st.beats.grant_3.choice).toBe('ada');
    expect(st.flags).toContain('grant_ada');
    expect(st.cards[0]).toEqual({ kind: 'reply', beat: 'grant_3', option: 'ada' });
    expect(p.reputation).toBe(1);
  });

  it('a document reads better once its words are confirmed; reading counts encounters once a day', () => {
    const d = data('en');
    const p = newProgress('en');
    applyEffect(d, p, { docs: ['d_margin'] });
    expect(docReadability(d, p, 'd_margin')).toBe(0);
    storyReadDoc(d, p, 'd_margin');
    expect(p.words.lemon).toBeUndefined(); // stage 1 < readable 4: unknown words stay a blur
    p.stage = 4;
    p.day = 2;
    storyReadDoc(d, p, 'd_margin');
    storyReadDoc(d, p, 'd_margin');
    expect(p.words.lemon.seen).toBe(1); // read twice today, counted once
    p.words.lemon.confirmed = true;
    p.words.honey.confirmed = true;
    expect(docReadability(d, p, 'd_margin')).toBeGreaterThan(0.2);
  });

  it('re-reading highlights the words confirmed since the paper was last put away', () => {
    const d = data('en');
    const p = newProgress('en');
    applyEffect(d, p, { docs: ['d_margin'] });
    expect(docFreshWords(d, p, 'd_margin')).toEqual([]);
    p.stage = 4;
    storyReadDoc(d, p, 'd_margin');
    p.words.lemon.confirmed = true;
    expect(docFreshWords(d, p, 'd_margin')).toEqual(['lemon']);
    storyDocPutAway(d, p, 'd_margin');
    expect(docFreshWords(d, p, 'd_margin')).toEqual([]);
    p.words.honey.confirmed = true;
    expect(docFreshWords(d, p, 'd_margin')).toEqual(['honey']);
    // A save from before `known`: found with nothing readable → everything confirmed since is new.
    delete storyState(p).docs.d_margin.known;
    expect(docFreshWords(d, p, 'd_margin').sort()).toEqual(['honey', 'lemon']);
  });

  it('conditional document lines follow earlier choices', () => {
    const d = data('en');
    const p = newProgress('en');
    const st = storyState(p);
    st.beats.nora_6 = { day: 1, status: 'done', outcome: 'seen', choice: 'coffee' };
    applyEffect(d, p, { docs: ['d_final'] });
    const lines = docLines(d, p, 'd_final');
    expect(lines.some((l) => l.startsWith('Coffee?'))).toBe(true);
    expect(lines.some((l) => l.startsWith('Thank you for the tea'))).toBe(false);
  });
});

describe('story save migration', () => {
  it('v2 saves get a fresh story; the story joins the running day on load', () => {
    const v2 = {
      version: 2,
      currentLang: 'en',
      settings: {},
      progress: { en: { lang: 'en', day: 20, stage: 13, reputation: 100, words: {}, town: { money: 50, unlocked: { market: 5, delivery: 9 } } } },
    };
    const s = migrateSave(v2);
    expect(s.version).toBe(SAVE_VERSION);
    const p = s.progress.en!;
    expect(p.story).toMatchObject({ beats: {}, docs: {}, chapter: -1, cards: [] });
    startTownDay(data('en'), p, makeRng(9));
    const st = storyState(p);
    // Catches up on one chapter card (the current one) and the day-1 letter.
    expect(st.cards.filter((c) => c.kind === 'chapter')).toHaveLength(1);
    expect(st.docs.d_letter).toBeDefined();
    // Idempotent per day.
    const n = p.today!.queue.length;
    storyPlanShop(data('en'), p, makeRng(9));
    expect(p.today!.queue.length).toBe(n);
  });

  it('v0 saves migrate all the way', () => {
    expect(migrateSave({ lang: 'zh', day: 2 }).progress.zh!.story.cards).toEqual([]);
  });
});

describe('story content', () => {
  it('validates (both languages) and every beat is reachable', () => {
    expect(validateShared(SHARED).errors).toEqual([]);
    for (const l of LANGS) expect(validateLanguage(CONTENT[l], SHARED).errors).toEqual([]);
    expect(unreachableBeats(SHARED.story!, 23)).toEqual([]);
  });

  it('the validator catches broken story references, unknown words and an over-budget beat', () => {
    const shared: SharedContent = structuredClone(SHARED);
    shared.story!.beats.push({ id: 'bx', character: 'nobody', kind: 'visit', when: { stage: 2, after: ['nope'], flags: ['never'] }, rule: { require: [{ ing: 'coffee' }] } });
    const sh = validateShared(shared).errors.join('\n');
    expect(sh).toMatch(/beat bx: unknown character nobody/);
    expect(sh).toMatch(/beat bx: after unknown beat nope/);
    expect(sh).toMatch(/flag "never" is never set/);
    expect(sh).toMatch(/beat bx can never happen/);

    const en: LanguageContent = structuredClone(CONTENT.en);
    en.story!.beats.rose_1.good = 'Splendid, magnificent!';
    en.story!.beats.joe_1.order = 'Hello, friend. Your shop is very good. Hot ginger and honey, please.';
    const errs = validateLanguage(en, SHARED).errors.join('\n');
    expect(errs).toMatch(/story beat rose_1 .*words not in lexicon: Splendid, magnificent/);
    expect(errs).toMatch(/story beat joe_1: \d words new at stage 3/);
  });

  it('story texts count as encounters and names are not words', () => {
    const d = data('zh');
    expect(storyWordIds(d, '小明的奶奶很喜欢你的茶。')).not.toContain('small');
    expect(storyWordIds(d, '小明的奶奶很喜欢你的茶。')).toContain('grandmother');
    const e = data('en');
    expect(storyWordIds(e, "Ada's tea. Rose likes rose tea.")).toEqual(['tea', 'like', 'rose']);
    expect(contentWordStages(e).get('hello')).toBe(10);
  });

  for (const lang of LANGS)
    it(`[${lang}] over 45 days every beat fires on some path (good / clumsy player, each choice)`, () => {
      const fired = new Set<string>();
      for (const [failEvery, choice, failStory] of [[0, 0, false], [3, 1, false], [4, 2, true]] as const) {
        const p = play(lang, 45, { seed: 7 + choice, failEvery, choice, failStory });
        for (const [id, r] of Object.entries(storyState(p).beats)) if (r.status === 'done') fired.add(id);
        // The good player reaches the end of the story within 45 days.
        if (failEvery === 0) expect(storyState(p).beats.m_end?.status).toBe('done');
      }
      const missing = SHARED.story!.beats.map((b) => b.id).filter((id) => !fired.has(id));
      expect(missing).toEqual([]);
    }, 60_000);
});
