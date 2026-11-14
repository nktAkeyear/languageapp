import { describe, expect, it } from 'vitest';
import { CONTENT, SHARED } from '../content';
import { buildGameData } from '../core/gamedata';
import { makeRng } from '../core/rng';
import { migrateSave, newProgress, SAVE_VERSION } from '../core/save';
import { endTownDay, startTownDay } from '../activities/day';
import { playJobShift, simulatePlayer } from '../activities/simPlayer';
import { validateLanguage } from '../core/validate';
import { indexLists, type VocabItem } from '../curriculum/lists';
import { setEnglishLists, emptyLists } from '../curriculum/lists';
import { reconcileLexicon, selectNext, yardstickReport } from '../curriculum/curriculum';
import { evaluateCheck, evaluateMake, evaluateRespond, evaluateSort, evaluateTrade, solveTask, slotFits } from './rules';
import {
  BOARD_DAY,
  checkRankUp,
  chooseJob,
  jobById,
  jobDay,
  jobProgress,
  jobsCloseDay,
  jobView,
  planShift,
  teaToTown,
  canGoToTown,
  featuresAt,
  SPINE_SEEN,
  spineSeen,
} from './engine';
import { templateInstance } from './templates';
import { jobVocab, wordJobs } from './vocab';
import type { RespondSpec } from './types';

const en = () => buildGameData(CONTENT.en, SHARED);

describe('archetype rules', () => {
  it('make: missing / extra / quantities / method / vessel / forbidden', () => {
    const spec = { want: [{ thing: 'egg', n: 2 }, { thing: 'bread', min: 1, max: 3 }], forbid: ['onion'], method: 'fry', vessel: 'plate' };
    const ok = { arch: 'make' as const, counts: { egg: 2, bread: 1 }, vessel: 'plate', method: 'fry' };
    expect(evaluateMake(spec, ok).outcome).toBe('perfect');
    expect(evaluateMake(spec, { ...ok, counts: { egg: 3, bread: 1 } }).outcome).toBe('minor');
    expect(evaluateMake(spec, { ...ok, counts: { egg: 2 } }).primary?.kind).toBe('missing');
    expect(evaluateMake(spec, { ...ok, counts: { egg: 2, bread: 1, fish: 1 } }).primary?.kind).toBe('extra');
    expect(evaluateMake(spec, { ...ok, counts: { egg: 2, bread: 1, onion: 1 } }).outcome).toBe('bad');
    expect(evaluateMake(spec, { ...ok, method: 'boil' }).primary?.kind).toBe('wrong_method');
    expect(evaluateMake(spec, { ...ok, vessel: 'bowl' }).outcome).toBe('minor');
    expect(evaluateMake(spec, { ...ok, counts: {} }).primary?.kind).toBe('empty');
  });
  it('sort: one wrong of four is minor, more is a fail', () => {
    const spec = { bins: ['a', 'b'], items: ['1', '2', '3', '4'].map((id, i) => ({ id, text: id, bin: i % 2 ? 'a' : 'b' })) };
    const right = Object.fromEntries(spec.items.map((i) => [i.id, i.bin]));
    expect(evaluateSort(spec, { arch: 'sort', placed: right }).outcome).toBe('perfect');
    expect(evaluateSort(spec, { arch: 'sort', placed: { ...right, 1: 'a' } }).outcome).toBe('minor');
    expect(evaluateSort(spec, { arch: 'sort', placed: { ...right, 1: 'a', 2: 'b' } }).outcome).toBe('fail');
  });
  it('trade: goods, then the change', () => {
    const price = (t: string) => ({ stamp: 2, box: 5 })[t] ?? 0;
    const spec = { want: [{ thing: 'stamp', n: 3 }, { thing: 'box', n: 1 }], pay: 20 };
    expect(evaluateTrade(spec, solveTask({ arch: 'trade', ...spec }, { price, words: () => [] }) as never, price).outcome).toBe('perfect');
    expect(evaluateTrade(spec, { arch: 'trade', counts: { stamp: 3, box: 1 }, change: 10 }, price).primary?.kind).toBe('change_over');
    expect(evaluateTrade(spec, { arch: 'trade', counts: { stamp: 3, box: 1 }, change: 8 }, price).primary?.kind).toBe('change_short');
    expect(evaluateTrade(spec, { arch: 'trade', counts: { stamp: 2, box: 1 }, change: 9 }, price).primary?.kind).toBe('wrong_goods');
  });
  it('check: approve, missed (bad), false alarm, wrong line, wrong fix', () => {
    const docs = [{ kind: 'order' as const, fields: [{ id: 'q', label: 'Quantity', value: '20' }] }, { kind: 'invoice' as const, fields: [{ id: 'q', label: 'Quantity', value: '30' }, { id: 'p', label: 'Price', value: '$4' }] }];
    const bad = { docs, target: 1, wrong: 'q' };
    expect(evaluateCheck(bad, { arch: 'check', verdict: 'fix', field: 'q' }).outcome).toBe('perfect');
    expect(evaluateCheck(bad, { arch: 'check', verdict: 'ok' }).outcome).toBe('bad');
    expect(evaluateCheck(bad, { arch: 'check', verdict: 'fix', field: 'p' }).primary?.kind).toBe('wrong_field');
    expect(evaluateCheck({ ...bad, wrong: null }, { arch: 'check', verdict: 'fix', field: 'q' }).primary?.kind).toBe('false_alarm');
    expect(evaluateCheck({ ...bad, fixOptions: ['20', '30'], fix: '20' }, { arch: 'check', verdict: 'fix', field: 'q', fix: '30' }).outcome).toBe('minor');
  });
  it('respond: choose, form, slot (exactly one free cell fits)', () => {
    const choose: RespondSpec = { mode: 'choose', msg: { kind: 'speech', lines: ['?'] }, options: ['a', 'b'], answer: 1 };
    expect(evaluateRespond(choose, { arch: 'respond', choice: 1 }).outcome).toBe('perfect');
    expect(evaluateRespond(choose, { arch: 'respond', choice: 0 }).primary?.kind).toBe('wrong_reply');
    const form: RespondSpec = { mode: 'form', msg: { kind: 'phone', lines: [] }, fields: ['a', 'b', 'c'].map((id) => ({ id, label: id, options: ['x', 'y'], answer: 'x' })) };
    expect(evaluateRespond(form, { arch: 'respond', fields: { a: 'x', b: 'x', c: 'y' } }).outcome).toBe('minor');
    const slot: RespondSpec = {
      mode: 'slot',
      msg: { kind: 'email', lines: [] },
      slot: { layout: 'calendar', rows: [], cols: [], cells: [{ id: '1', row: 'mon', col: 'am', tags: ['mon', 'am'], busy: 'x' }, { id: '2', row: 'mon', col: 'pm', tags: ['mon', 'pm'] }], answer: '2' },
    };
    expect(slotFits(slot, ['mon'], [])).toEqual(['2']);
    expect(evaluateRespond(slot, { arch: 'respond', slot: '2' }).outcome).toBe('perfect');
  });
});

describe('job content', () => {
  it('validates (en and zh) and every new job has tasks for ranks 1–3', () => {
    expect(validateLanguage(CONTENT.en, SHARED).errors).toEqual([]);
    expect(validateLanguage(CONTENT.zh, SHARED).errors).toEqual([]);
    const jobs = CONTENT.en.jobs!.filter((j) => !j.legacy);
    expect(jobs.length).toBeGreaterThanOrEqual(4);
    expect(new Set(jobs.map((j) => [...j.archetypes].sort().join('+'))).size).toBe(jobs.length); // a different mix each
    for (const j of jobs) for (const r of [1, 2, 3]) expect(j.content.en!.templates.some((t) => t.rank <= r) || j.content.en!.tasks.some((t) => t.rank === r)).toBe(true);
    // zh keeps the tea house only
    expect(CONTENT.zh.jobs!.map((j) => j.id)).toEqual(['teahouse']);
  });
  it('higher ranks unlock harder variants (longer sorts, multi-step checks)', () => {
    const data = en();
    const post = jobById(data, 'post')!;
    const t = post.content.en!.templates.find((x) => x.id === 'pt_streets')!;
    const len = (rank: number) => templateInstance({ data, job: post, jc: post.content.en!, rank, feats: featuresAt(post, rank), rng: makeRng(3), timedOn: false }, t)!.spec;
    expect((len(2) as { items: unknown[] }).items.length).toBe(5); // 4 + long
    const office = jobById(data, 'office')!;
    const inv = office.content.en!.templates.find((x) => x.id === 'ot_inv1')!;
    let multi = false;
    for (let s = 1; s < 20 && !multi; s++) {
      const sp = templateInstance({ data, job: office, jc: office.content.en!, rank: 3, feats: featuresAt(office, 3), rng: makeRng(s), timedOn: false }, inv)!.spec;
      if (sp.arch === 'check' && sp.wrong && sp.fixOptions?.length === 3) multi = true;
    }
    expect(multi).toBe(true);
  });
});

describe('job day', () => {
  it('the board opens on day 4; before it a day is the original tea house day', () => {
    const data = en();
    const { p } = simulatePlayer({ lang: 'en', days: BOARD_DAY - 2, accuracy: 1, seed: 2 });
    startTownDay(data, p, makeRng(1));
    expect(p.day).toBe(BOARD_DAY - 1);
    expect(jobView(p)).toBe('teahouse');
    expect(p.jobs?.day ?? null).toBeNull();
    const { p: p2 } = simulatePlayer({ lang: 'en', days: BOARD_DAY - 1, accuracy: 1, seed: 2 });
    startTownDay(data, p2, makeRng(1));
    expect(p2.jobs?.boardOpen).toBe(BOARD_DAY);
    expect(jobView(p2)).toBe('hub');
  });
  it('a shift at the post office in the morning, the tea house at noon (no market), then home', () => {
    const data = en();
    const { p } = simulatePlayer({ lang: 'en', days: 5, accuracy: 1, seed: 4 });
    startTownDay(data, p, makeRng(5));
    const money = p.town.money;
    const r = playJobShift(data, p, 'post', 1, makeRng(2), makeRng(3))!;
    expect(r.outcomes.every((o) => o === 'perfect')).toBe(true);
    expect(p.town.money).toBeGreaterThan(money);
    expect(jobDay(p)!.part).toBe(1);
    expect(chooseJob(data, p, 'post', makeRng(1))).not.toBeNull(); // not twice a day
    expect(chooseJob(data, p, 'teahouse', makeRng(1))).toBeNull();
    expect(p.townDay!.segments[0]).toBe('shop');
    expect(p.townDay!.market).toBeUndefined();
    expect(jobView(p)).toBe('teahouse');
    // words met at the post office are tagged with the job
    const met = Object.keys(p.jobs!.wordJobs).filter((id) => p.jobs!.wordJobs[id].includes('post'));
    expect(met.length).toBeGreaterThan(5);
    expect(wordJobs(data, p.jobs!.wordJobs, met[0])).toContain('post');
  });
  it('a day without the tea house keeps its stage clock still and its customers for another day', () => {
    const data = en();
    const { p } = simulatePlayer({ lang: 'en', days: 6, accuracy: 1, seed: 7 });
    startTownDay(data, p, makeRng(5));
    const clock = p.difficulty?.clockOffset ?? 0;
    playJobShift(data, p, 'post', 1, makeRng(2), makeRng(3));
    playJobShift(data, p, 'kitchen', 1, makeRng(2), makeRng(3));
    jobsCloseDay(data, p);
    const day = p.day;
    endTownDay(p, data);
    expect(p.day).toBe(day + 1);
    expect(p.difficulty!.clockOffset).toBeLessThan(clock - 0.5);
    expect(p.story.lastLedger?.work?.map((w) => w.job)).toEqual(['post', 'kitchen']);
  });
  it('the tea house can hand the evening to another job when no delivery is planned', () => {
    const data = en();
    const { p } = simulatePlayer({ lang: 'en', days: 4, accuracy: 1, seed: 9 });
    startTownDay(data, p, makeRng(5));
    chooseJob(data, p, 'teahouse', makeRng(1));
    p.townDay!.segments = ['shop'];
    p.today!.phase = 'closed';
    expect(canGoToTown(p)).toBe(true);
    teaToTown(p);
    expect(jobDay(p)!.part).toBe(2);
    expect(jobView(p)).toBe('hub');
  });
  it('ranks: good tasks + confirmed words + most of the rank’s authored spine met; rewards paid once', () => {
    const data = en();
    const p = newProgress('en');
    const post = jobById(data, 'post')!;
    const next = post.ranks[1];
    const jp = jobProgress(p, 'post');
    jp.good = next.need.good;
    expect(checkRankUp(data, p, post)).toBeNull(); // words missing
    let n = 0;
    for (const id of jobVocab(data, post)) {
      if (n++ >= next.need.words) break;
      p.words[id] = { seen: 3, correct: 1, wrong: 0, firstDay: 1, lastDay: 1, interval: 1, ease: 2.3, due: 2, contexts: [], memo: '', confirmed: true };
    }
    // thresholds met, but the rank-1 spine has not been met yet: no rank-up while its own material is unseen
    expect(checkRankUp(data, p, post)).toBeNull();
    const spine = post.content.en!.tasks.filter((t) => t.rank === 1);
    expect(spine.length).toBeGreaterThan(10);
    for (const t of spine.slice(0, Math.ceil(spine.length * SPINE_SEEN) - 1)) jp.authored[t.id] = { attempts: 1, perfect: false };
    expect(spineSeen(data, p, post, 1).share).toBeLessThan(SPINE_SEEN);
    expect(checkRankUp(data, p, post)).toBeNull();
    jp.authored[spine[spine.length - 1].id] = { attempts: 1, perfect: true };
    const money = p.town.money;
    expect(checkRankUp(data, p, post)).toBe(2);
    expect(p.town.money).toBe(money + (next.reward?.coins ?? 0));
    expect(checkRankUp(data, p, post)).toBeNull();
  });
  it('every job has the same ladder; ranks without new material say so', () => {
    const jobs = CONTENT.en.jobs!.filter((j) => !j.legacy);
    expect(new Set(jobs.map((j) => j.ranks.length))).toEqual(new Set([5]));
    for (const j of jobs)
      for (const r of j.ranks) {
        const own = j.content.en!.tasks.some((t) => t.rank === r.rank) || j.content.en!.templates.some((t) => t.rank === r.rank);
        if (!own) expect(r.noteJa).toMatch(/準備中/);
      }
  });
  it('links: the kitchen bakes bread the inn uses', () => {
    const data = en();
    const { p } = simulatePlayer({ lang: 'en', days: 7, accuracy: 1, seed: 11 });
    startTownDay(data, p, makeRng(5));
    playJobShift(data, p, 'kitchen', 1, makeRng(2), makeRng(3));
    const bread = p.jobs!.goods.bread ?? 0;
    expect(bread).toBeGreaterThan(0);
    // the inn's desk is open in the morning and the evening, not at noon
    expect(chooseJob(data, p, 'inn', makeRng(1))).toMatch(/閉まって/);
    playJobShift(data, p, 'post', 1, makeRng(6), makeRng(7));
    const r = playJobShift(data, p, 'inn', 1, makeRng(4), makeRng(5))!;
    expect(p.jobs!.goods.bread ?? 0).toBeLessThan(bread);
    expect(r.texts.some((t) => t.includes('bread for breakfast'))).toBe(true);
  });
  it('a shift plans the rank’s tasks and mixes the job’s archetypes', () => {
    const data = en();
    const { p } = simulatePlayer({ lang: 'en', days: 8, accuracy: 1, seed: 12 });
    startTownDay(data, p, makeRng(5));
    for (const id of ['post', 'kitchen', 'inn', 'office']) {
      const job = jobById(data, id)!;
      const s = planShift(data, p, job, 0, makeRng(8));
      expect(s.tasks.length).toBe(job.ranks[0].tasks);
      expect(new Set(s.tasks.map((t) => t.spec.arch)).size).toBeGreaterThan(1);
    }
  });
});

describe('save migration v3 → v4', () => {
  it('keeps everything and makes the tea house the first job', () => {
    const { p } = simulatePlayer({ lang: 'en', days: 10, accuracy: 0.9, seed: 3 });
    const old = structuredClone(p) as unknown as Record<string, unknown>;
    delete old.jobs;
    const s = migrateSave({ version: 3, currentLang: 'en', settings: {}, progress: { en: old } });
    expect(s.version).toBe(SAVE_VERSION);
    const q = s.progress.en!;
    expect(q.words).toEqual(p.words);
    expect(q.stats).toEqual(p.stats);
    expect(q.story).toEqual(p.story);
    expect(q.jobs!.jobs.teahouse.tasks).toBe(p.stats.served);
    expect(q.jobs!.migrated).toBe(true);
    // v1 still loads all the way up
    const v1 = migrateSave({ version: 1, currentLang: 'zh', settings: {}, progress: { zh: { ...newProgress('zh'), town: undefined, story: undefined, jobs: undefined } } });
    expect(v1.version).toBe(SAVE_VERSION);
    expect(v1.progress.zh!.jobs!.jobs.teahouse.rank).toBe(1);
  });
});

describe('curriculum over the compiled lists', () => {
  const v = (word: string, eiken: string, toeic: number | null, domains: string[], freq: number): VocabItem => ({ word, pos: 'noun', eiken: eiken as never, toeic: toeic as never, cefr: 'A1', ja: word, domains, freq });
  it('reconciles levels from the list, keeps hand-written glosses, and orders by the yardstick', () => {
    const lists = indexLists(
      [v('stamp', '3', 600, ['post'], 50), v('station', '5', 400, ['transport'], 90), v('invoice', '2', 500, ['office', 'finance'], 10), v('meeting', '4', 500, ['meetings'], 80), v('zebra', '5', null, ['nature'], 5)],
      [],
      [],
    );
    setEnglishLists(lists);
    try {
      const rec = reconcileLexicon(CONTENT.en.lexicon, lists);
      const stamp = rec.lexicon.find((e) => e.id === 'stamp')!;
      expect(stamp.eiken).toBe('3');
      expect(stamp.toeic).toBe(600);
      expect(stamp.gloss).toBe('切手');
      const data = buildGameData({ ...CONTENT.en, lexicon: rec.lexicon }, SHARED);
      const p = newProgress('en');
      const e = selectNext(data, p, { yardstick: 'eiken', n: 10 });
      expect(e.teachable.map((t) => t.id).slice(0, 2)).toEqual(['station', 'meeting']);
      expect(e.uncovered.map((x) => x.word)).toContain('zebra');
      const t = selectNext(data, p, { yardstick: 'toeic', n: 10 });
      expect(t.teachable[0].id).toBe('station'); // band 400 first
      expect(t.teachable.findIndex((x) => x.id === 'invoice')).toBeLessThan(t.teachable.findIndex((x) => x.id === 'stamp')); // 500 before 600
      const office = selectNext(data, p, { yardstick: 'toeic', domains: ['office', 'meetings'], n: 10 });
      expect(office.teachable.map((x) => x.id).sort()).toEqual(['invoice', 'meeting']);
      const rep = yardstickReport(data, p, 'eiken');
      expect(rep.fromLists).toBe(true);
      expect(rep.rows[0].list).toBe(2); // station, zebra
      expect(rep.rows[0].inGame).toBe(1);
      expect(rep.rows[6].list).toBe(5);
      expect(yardstickReport(data, p, 'toeic').rows[5].list).toBe(4); // zebra has no TOEIC band
    } finally {
      setEnglishLists(emptyLists());
    }
  });
});
