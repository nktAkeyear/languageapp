import { describe, expect, it } from 'vitest';
import { CONTENT, SHARED } from '../content';
import { simulatePlayer } from '../activities/simPlayer';
import { endTownDay, startTownDay } from '../activities/day';
import {
  ADJ_MAX,
  ADJ_MIN,
  applyStartLevel,
  controllerStep,
  defaultDifficulty,
  describeDifficulty,
  difficultyState,
  HIGH,
  LOW,
  MIN_ORDERS,
  PACES,
  planKnobs,
  revertSeededWord,
  setDifficultyOptions,
  stageDay,
  startOptions,
  startStageFor,
  targetOptions,
  targetProgress,
  wordLevel,
  wordsUpTo,
} from './difficulty';
import { buildGameData, stageDef } from './gamedata';
import type { DayMetrics } from './metrics';
import { makeRng } from './rng';
import { isKnown } from './srs';
import { pageStatus, submitVerification } from './verification';
import { migrateSave, newProgress } from './save';
import { LANGS } from './types';

const DATA = { en: buildGameData(CONTENT.en, SHARED), zh: buildGameData(CONTENT.zh, SHARED) };

function hist(acc: number[], perDay = 8, from = 1, extra: Partial<DayMetrics> = {}): DayMetrics[] {
  return acc.map((a, i) => ({
    day: from + i,
    ft: perDay,
    ftOk: Math.round(a * perDay),
    newN: 0,
    newOk: 0,
    revN: perDay,
    revOk: Math.round(a * perDay),
    vA: 0,
    vS: 0,
    mN: 0,
    mOk: 0,
    dN: 0,
    dOk: 0,
    dueN: 0,
    lapsed: 0,
    conf: 0,
    sec: 0,
    retries: 0,
    peeks: 0,
    est: 0,
    stage: 1,
    adj: 0,
    budget: 6,
    review: 0,
    ...extra,
  }));
}

describe('pace presets and knobs', () => {
  const data = DATA.zh;
  it('without a difficulty state (older saves) the knobs are the stage values', () => {
    const p = newProgress('zh');
    p.stage = 9;
    const sd = stageDef(data, 9);
    expect(planKnobs(data, p)).toEqual({ customers: sd.customersPerDay, budget: sd.newWordsPerDay, reviewShare: 0, complexity: 1, audio: 1, clock: 1 });
  });

  it('defaults (ゼロから・ふつう・自動調整あり, adj 0) are exactly the stage values', () => {
    const p = newProgress('zh');
    for (const stage of [1, 5, 9, 15, 23]) {
      p.stage = stage;
      const legacy = planKnobs(data, { ...p, difficulty: undefined });
      difficultyState(p);
      expect(planKnobs(data, p)).toEqual(legacy);
    }
    expect(stageDay(p)).toBe(p.day);
  });

  it('presets order new words, customers, review share and clock', () => {
    const k = (pace: 'slow' | 'normal' | 'fast') => {
      const p = newProgress('en');
      p.stage = 10;
      setDifficultyOptions(p, { pace });
      return planKnobs(DATA.en, p);
    };
    const [s, n, f] = [k('slow'), k('normal'), k('fast')];
    expect(s.budget).toBeLessThan(n.budget);
    expect(f.budget).toBeGreaterThan(n.budget);
    expect(s.customers).toBe(n.customers - 1);
    expect(f.customers).toBe(n.customers + 1);
    expect(s.reviewShare).toBeGreaterThan(0);
    expect(n.reviewShare).toBe(0);
    expect(s.clock).toBeLessThan(1);
    expect(f.clock).toBeGreaterThan(1);
    expect(PACES.normal).toMatchObject({ newMult: 1, customers: 0, review: 0, clock: 1, audio: 1 });
  });

  it('the controller adjustment moves the knobs within bounds; off ignores it', () => {
    const p = newProgress('zh');
    p.stage = 12;
    const d = difficultyState(p);
    d.adj = ADJ_MIN;
    const low = planKnobs(data, p);
    d.adj = ADJ_MAX;
    const high = planKnobs(data, p);
    d.adj = -5; // out of range values are clamped
    expect(planKnobs(data, p)).toEqual(low);
    expect(low.budget).toBeLessThan(high.budget);
    expect(low.reviewShare).toBeGreaterThan(high.reviewShare);
    expect(low.complexity).toBeLessThan(1);
    expect(low.budget).toBeGreaterThanOrEqual(1);
    setDifficultyOptions(p, { adaptive: false });
    expect(d.adj).toBe(0);
    expect(planKnobs(data, p).budget).toBe(stageDef(data, 12).newWordsPerDay);
  });

  it('audio assist: off removes audio-only orders, many doubles their chance', () => {
    const p = newProgress('zh');
    p.stage = 8;
    setDifficultyOptions(p, { assists: { audio: 'off' } });
    expect(planKnobs(data, p).audio).toBe(0);
    setDifficultyOptions(p, { assists: { audio: 'many' } });
    expect(planKnobs(data, p).audio).toBe(2);
    // and the planner honours "off" for authored audio-only orders too
    setDifficultyOptions(p, { assists: { audio: 'off' } });
    const rng = makeRng(3);
    for (let i = 0; i < 6; i++) {
      startTownDay(data, p, rng);
      expect(p.today!.queue.some((q) => q.audioOnly)).toBe(false);
      p.today!.phase = 'closed';
      p.townDay!.seg = p.townDay!.segments.length - 1;
      if (p.townDay!.market) p.townDay!.market.done = true;
      if (p.townDay!.delivery) p.townDay!.delivery.phase = 'result';
      endTownDay(p, data);
    }
  });

  it('describes the state in plain Japanese', () => {
    const p = newProgress('zh');
    p.stage = 6;
    setDifficultyOptions(p, { pace: 'slow' });
    expect(describeDifficulty(data, p)).toMatch(/^いまは復習多め・新しい言葉は1日\d+語/);
  });
});

describe('adaptive controller', () => {
  const start = { adj: 0, lastStepDay: 0, lastDir: 0 as const };
  it('holds without enough data', () => {
    const r = controllerStep(start, hist([0.1], MIN_ORDERS - 1), 1);
    expect(r).toMatchObject({ adj: 0, dir: 0 });
    expect(r.reason).toMatch(/様子見/);
  });
  it('eases off when first-try accuracy is below LOW, speeds up above HIGH — after two days of the same verdict', () => {
    const first = controllerStep(start, hist([LOW - 0.15, LOW - 0.1, LOW - 0.1]), 3);
    expect(first).toMatchObject({ dir: 0, want: -1, adj: 0 });
    const down = controllerStep({ ...start, pending: first.want }, hist([LOW - 0.15, LOW - 0.1, LOW - 0.1]), 3);
    expect(down.dir).toBe(-1);
    expect(down.adj).toBeLessThan(0);
    expect(down.reason).toMatch(/ゆっくり/);
    const up = controllerStep({ ...start, pending: 1 }, hist([1, 1, 1]), 3);
    expect(up.dir).toBe(1);
    expect(up.adj).toBeGreaterThan(0);
  });
  it('holds in the dead bands (hysteresis) and relaxes back towards the preset when it is just right', () => {
    expect(controllerStep(start, hist([0.65, 0.65, 0.65]), 3).dir).toBe(0);
    expect(controllerStep(start, hist([0.875, 0.875, 0.875]), 3).adj).toBe(0);
    const relaxed = controllerStep({ adj: -0.5, lastStepDay: 1, lastDir: -1 }, hist([0.75, 0.75, 0.75], 8, 2), 4);
    expect(relaxed.adj).toBeCloseTo(-0.4);
  });
  it('is bounded and gradual', () => {
    type S = { adj: number; lastStepDay: number; lastDir: -1 | 0 | 1; pending: -1 | 0 | 1 };
    let s: S = { ...start, pending: 0 };
    let h: DayMetrics[] = [];
    for (let d = 1; d <= 40; d++) {
      h = [...h, ...hist([0.2], 8, d)];
      const r = controllerStep(s, h, d);
      expect(Math.abs(r.adj - s.adj)).toBeLessThanOrEqual(0.25 + 1e-9);
      if (r.dir) s = { adj: r.adj, lastStepDay: d, lastDir: r.dir, pending: 0 };
      else s = { ...s, adj: r.adj, pending: r.want };
      expect(s.adj).toBeGreaterThanOrEqual(ADJ_MIN);
    }
    expect(s.adj).toBe(ADJ_MIN);
    s = { ...start, pending: 0 };
    h = [];
    for (let d = 1; d <= 40; d++) {
      h = [...h, ...hist([1], 8, d)];
      const r = controllerStep(s, h, d);
      if (r.dir) s = { adj: r.adj, lastStepDay: d, lastDir: r.dir, pending: 0 };
      else s = { ...s, pending: r.want };
      expect(r.adj).toBeLessThanOrEqual(ADJ_MAX);
    }
    expect(s.adj).toBe(ADJ_MAX);
  });
  it('judges a step only on the days after it, and waits before reversing', () => {
    // A step yesterday: the bad days before it do not count again.
    const h = hist([0.2, 0.2, 0.2, 0.2], 8, 1);
    const r = controllerStep({ adj: -0.25, lastStepDay: 4, lastDir: -1 }, h, 5);
    expect(r.dir).toBe(0);
    expect(r.reason).toMatch(/様子を見/);
    // Reversal needs the cool-down even when the new days say "too easy".
    const r2 = controllerStep({ adj: -0.25, lastStepDay: 4, lastDir: -1, pending: 1 }, [...h, ...hist([1, 1], 8, 5)], 5);
    expect(r2.dir).toBe(0);
    const r3 = controllerStep({ adj: -0.25, lastStepDay: 4, lastDir: -1, pending: 1 }, [...h, ...hist([1, 1], 8, 5)], 6);
    expect(r3.dir).toBe(1);
  });
  it('eases the new-word budget when orders with new words keep failing', () => {
    const h = hist([0.75, 0.75, 0.75], 8, 1, { newN: 3, newOk: 0 });
    const r = controllerStep({ ...start, pending: -1 }, h, 3);
    expect(r.dir).toBe(-1);
    expect(r.reason).toMatch(/新しい言葉/);
  });
  it(`threshold constants match the request (~60% / ~90%)`, () => {
    expect(LOW).toBe(0.6);
    expect(HIGH).toBe(0.9);
  });
});

describe.each(LANGS)('starting level (%s)', (lang) => {
  const data = DATA[lang];
  const top = Math.max(...startOptions(data).filter((o) => o.available).map((o) => o.level));

  it('offers zero, the levels the content reaches, and marks the rest 未対応', () => {
    const opts = startOptions(data);
    expect(opts[0]).toMatchObject({ level: 0, available: true });
    expect(top).toBeGreaterThanOrEqual(2);
    expect(opts.filter((o) => !o.available).every((o) => o.note?.includes('未対応'))).toBe(true);
    const stages = opts.filter((o) => o.available).map((o) => o.stage!);
    expect([...stages].sort((a, b) => a - b)).toEqual(stages);
  });

  it('seeds words at or below the level as assumed known (never confirmed, no page sealed), skips known early orders, fast-forwards', () => {
    const p = newProgress(lang);
    const s = applyStartLevel(data, p, 2);
    const stage = startStageFor(data, 2);
    expect(p.stage).toBe(stage);
    expect(stageDay(p)).toBeGreaterThanOrEqual(stageDef(data, stage).minDay);
    expect(p.reputation).toBeGreaterThanOrEqual(stageDef(data, stage).minReputation);
    const lvl = wordsUpTo(data, 2);
    expect(s.seeded).toBe(lvl.length);
    // Assumed known, never confirmed: no meaning is handed out for a word the player did not verify.
    for (const e of lvl) expect(p.words[e.id]).toMatchObject({ confirmed: false, seeded: expect.anything() });
    for (const e of lvl) expect(isKnown(p.words[e.id])).toBe(true);
    // Seeded words come back for review now and then, not all at once.
    const dues = new Set(lvl.map((e) => p.words[e.id].due));
    expect(dues.size).toBeGreaterThan(3);
    expect(Math.min(...dues)).toBeGreaterThan(p.day);
    for (const e of data.content.lexicon) if (wordLevel(lang, e) === 0 || wordLevel(lang, e) > 2) expect(p.words[e.id]?.seeded).toBeUndefined();
    expect(s.pagesSealed).toBe(0);
    expect(Object.keys(p.verification)).toEqual([]);
    // A page of assumed words opens only once its words are met in play, and confirms them like any page.
    const page = data.content.verificationPages.find((pg) => { const ws = data.content.lexicon.filter((e) => e.group === pg.id); return ws.length > 0 && ws.every((e) => p.words[e.id]?.seeded); })!;
    expect(pageStatus(data, p, page)).toBe('locked');
    const ws = data.content.lexicon.filter((e) => e.group === page.id);
    for (const e of ws) p.words[e.id].seen += 3;
    expect(pageStatus(data, p, page)).toBe('available');
    expect(submitVerification(data, p, page.id, Object.fromEntries(ws.map((e) => [e.id, e.id])))).toBe(true);
    for (const e of ws) expect(p.words[e.id].confirmed).toBe(true);
    // Early orders with unknown words (shelf names, higher-level words) still have to be served.
    const early = data.content.orders.filter((o) => o.stage < stage);
    expect(early.some((o) => !p.orders[o.id]?.perfect)).toBe(true);
    // Town experience follows the fast-forward.
    if (stage >= 9) expect(p.town.marketRuns).toBeGreaterThan(0);
  });

  it('moving the level down takes back exactly what seeding added; up again re-seeds (except opted-out words)', () => {
    const p = newProgress(lang);
    applyStartLevel(data, p, 2);
    const stage = p.stage;
    const l2 = data.content.lexicon.filter((e) => wordLevel(lang, e) === 2);
    // the player meets one level-2 word in play after seeding
    const met = l2[0];
    p.words[met.id].seen += 3;
    const down = applyStartLevel(data, p, 1);
    expect(down.reopened).toBe(l2.length);
    expect(p.stage).toBe(stage); // the shop never goes back
    for (const e of l2) {
      if (e.id === met.id) expect(p.words[e.id]).toMatchObject({ seen: 3, confirmed: false });
      else expect(p.words[e.id]).toBeUndefined();
    }
    for (const e of wordsUpTo(data, 1)) expect(isKnown(p.words[e.id])).toBe(true);
    for (const e of wordsUpTo(data, 1)) expect(p.words[e.id]?.confirmed).toBe(false);
    for (const [id, log] of Object.entries(p.orders)) if (log.seeded) expect(CONTENT[lang].orders.find((o) => o.id === id)).toBeDefined();
    // Manual revert of one level-1 word, then up to 2 again.
    const one = wordsUpTo(data, 1)[3];
    expect(revertSeededWord(data, p, one.id)).toBe(true);
    expect(p.words[one.id]).toBeUndefined();
    const up = applyStartLevel(data, p, 2);
    expect(up.seeded).toBe(l2.length);
    expect(p.words[one.id]).toBeUndefined();
    expect(p.words[met.id]).toMatchObject({ confirmed: false, seen: 6 });
    expect(isKnown(p.words[met.id])).toBe(true);
    // Down to zero: no seeded word is left.
    applyStartLevel(data, p, 0);
    expect(Object.values(p.words).some((w) => w.seeded)).toBe(false);
    expect(Object.values(p.verification).some((v) => v.seeded)).toBe(false);
    expect(Object.values(p.orders).some((o) => o.seeded)).toBe(false);
  });

  it('a game started at level 2 plays on: new words, review, the story from its first chapter, in order', () => {
    const run = simulatePlayer({ lang, days: 30, start: 2, accuracy: 0.9, seed: 4 });
    const days = run.days;
    expect(days[0].stage).toBe(startStageFor(data, 2));
    expect(days.reduce((s, d) => s + d.newWords, 0)).toBeGreaterThan(10);
    expect(days.every((d) => d.customers > 0)).toBe(true);
    // Chapter cards come one at a time from the first, never more than one step a day.
    let prev = -1;
    for (const d of days) {
      expect(d.chapter - prev).toBeLessThanOrEqual(1);
      prev = d.chapter;
    }
    expect(days[0].chapter).toBe(0);
    expect(days[days.length - 1].chapter).toBeGreaterThanOrEqual(3);
    // The first letter and the first regulars still happen.
    const st = run.p.story;
    for (const b of ['m_letter', 'rose_1', 'grant_1', 'joe_1']) expect(st.beats[b]?.status).toBe('done');
    // catching up: more beats done than a zero-start player at the same day
    const zero = simulatePlayer({ lang, days: 30, accuracy: 0.9, seed: 4 });
    expect(days[29].beatsDone).toBeGreaterThan(zero.days[29].beatsDone);
  });
});

describe('default settings reproduce the original pacing', () => {
  it.each(LANGS)('%s: ふつう with the controller off plans exactly like a save without difficulty state', (lang) => {
    const a = simulatePlayer({ lang, days: 30, accuracy: 0.8, seed: 11, adaptive: false });
    const b = simulatePlayer({ lang, days: 30, accuracy: 0.8, seed: 11, legacy: true });
    expect(a.days.map((d) => [d.stage, d.customers, d.newWords, d.segments])).toEqual(b.days.map((d) => [d.stage, d.customers, d.newWords, d.segments]));
  });
  it.each(LANGS)('%s: with the controller on, identical until its first step', (lang) => {
    const a = simulatePlayer({ lang, days: 30, accuracy: 0.8, seed: 11 });
    const b = simulatePlayer({ lang, days: 30, accuracy: 0.8, seed: 11, legacy: true });
    const firstStep = a.days.findIndex((d) => d.adj !== 0);
    const n = firstStep < 0 ? 30 : firstStep + 1;
    expect(n).toBeGreaterThan(4);
    expect(a.days.slice(0, n).map((d) => [d.stage, d.newWords])).toEqual(b.days.slice(0, n).map((d) => [d.stage, d.newWords]));
  });
});

describe('targets', () => {
  it('coverage maths: list = in game + not in game; mastered within the game part', () => {
    for (const lang of LANGS) {
      const data = DATA[lang];
      const p = newProgress(lang);
      applyStartLevel(data, p, 1);
      for (let l = 1; l <= 3; l++) {
        const t = targetProgress(data, p, l);
        expect(t.inGame).toBe(wordsUpTo(data, l).length);
        expect(t.inGame + t.notInGame).toBe(Math.max(t.listSize, t.inGame));
        expect(t.mastered + t.remainingInGame).toBe(t.inGame);
        expect(t.ratio).toBeCloseTo(t.mastered / t.listSize);
        expect(t.ceiling).toBeCloseTo(Math.min(1, t.inGame / t.listSize));
      }
      expect(targetProgress(data, p, 1).mastered).toBe(wordsUpTo(data, 1).length);
      expect(targetProgress(data, p, 1).seeded).toBe(wordsUpTo(data, 1).length);
    }
  });
  it('levels beyond the content are not available, with an honest note', () => {
    const zh = targetOptions(DATA.zh, newProgress('zh'));
    expect(zh.filter((o) => o.available).map((o) => o.level)).toEqual([1, 2, 3]);
    expect(zh.find((o) => o.level === 4)!.note).toMatch(/未対応/);
    const en = targetOptions(DATA.en, newProgress('en'));
    // 英検3級 crosses the bar (≥ 30 own words, ≥ 15 % of its list) once the renovation catalogue's words are in
    expect(en.filter((o) => o.available).map((o) => o.level)).toEqual([1, 2, 3]);
    expect(en.find((o) => o.level === 4)!.note).toMatch(/未対応/);
    // available targets the game only partly covers say so
    expect(en[0].note).toMatch(/ゲームの外/);
  });
});

describe('saves', () => {
  it('older saves load without a difficulty state and get the defaults on first use', () => {
    const v1 = { version: 1, currentLang: 'zh', settings: {}, progress: { zh: { ...newProgress('zh'), day: 6, town: undefined, townDay: undefined, story: undefined } } };
    const s = migrateSave(v1);
    const p = s.progress.zh!;
    expect(p.difficulty).toBeUndefined();
    expect(stageDay(p)).toBe(6);
    expect(planKnobs(DATA.zh, p).budget).toBe(stageDef(DATA.zh, p.stage).newWordsPerDay);
    const d = difficultyState(p);
    expect(d).toEqual(defaultDifficulty());
    // a v3 save written with a partial difficulty state gets its missing fields
    const s3 = migrateSave({ version: 3, currentLang: 'en', settings: {}, progress: { en: { ...newProgress('en'), difficulty: { pace: 'slow' } } } });
    const d3 = difficultyState(s3.progress.en!);
    expect(d3.pace).toBe('slow');
    expect(d3.adaptive).toBe(true);
    expect(d3.assists.audio).toBe('normal');
  });
});
