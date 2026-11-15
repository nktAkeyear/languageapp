import { describe, expect, it } from 'vitest';
import { CONTENT, SHARED } from '../content';
import { buildGameData } from '../core/gamedata';
import { applyStartLevel, describeChange, START_TOEIC, startLevelForToeic, startOptions } from '../core/difficulty';
import { makeRng } from '../core/rng';
import { newProgress } from '../core/save';
import { endTownDay, startTownDay } from '../activities/day';
import { chooseJob, checkRankUp, goodCredit, jobById, jobDay, jobOffered, jobsOf, planShift, rankStatus, spineSeen } from './engine';
import { placedRankFor, previewPlacement } from './placement';

const data = buildGameData(CONTENT.en, SHARED);

describe('start levels (en): every 英検 grade, or a TOEIC band', () => {
  it('offers 英検5級 … 1級, each with a shop stage', () => {
    const opts = startOptions(data);
    expect(opts.filter((o) => o.level > 0 && o.available).map((o) => o.level)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    expect(START_TOEIC.map((t) => startLevelForToeic(t.band))).toEqual([3, 4, 5, 6, 6, 7]);
  });
});

describe('jobs placed by the start level', () => {
  it('each job starts at the highest rank whose material is at or below the start', () => {
    const post = jobById(data, 'post')!;
    const office = jobById(data, 'office')!;
    // post: 英検4 / 3 / 準2 / 2 / 準1; office: 英検3 / 準2 / 2 / 準1 / 1
    expect([1, 2, 3, 4, 5, 6, 7].map((l) => placedRankFor(post, l))).toEqual([0, 1, 2, 3, 4, 5, 5]);
    expect([1, 2, 3, 4, 5, 6, 7].map((l) => placedRankFor(office, l))).toEqual([0, 0, 1, 2, 3, 4, 5]);
    // by TOEIC band (office: 〜400 / 〜600 / 〜730 / 〜860 / 〜990)
    expect([400, 500, 600, 730, 860, 990].map((b) => placedRankFor(office, 0, b))).toEqual([1, 1, 2, 3, 4, 5]);
  });

  it('a 英検2級 start opens the board on day 1 with the jobs at their rank, and day 1 serves that rank’s material', () => {
    const p = newProgress('en');
    const sum = applyStartLevel(data, p, 5);
    expect(sum.boardOpened).toBe(true);
    expect(describeChange(data, sum).join('\n')).toMatch(/掲示板が最初の日から/);
    const rng = makeRng(3);
    startTownDay(data, p, rng);
    const d = jobDay(p)!;
    expect(d).toBeTruthy();
    expect(d.view).toBe('teahouse'); // the day starts at the workplace
    expect(d.notes.join('')).toMatch(/大潮/);
    for (const j of jobsOf(data).filter((x) => !x.legacy)) expect(jobOffered(p, j)).toBe(true);
    expect(p.jobs!.jobs.post.rank).toBe(4);
    expect(p.jobs!.jobs.office.rank).toBe(3);
    // the shift's authored tasks are the placed rank's own (nothing below it as new material)
    for (const id of ['post', 'kitchen', 'inn', 'office']) {
      const job = jobById(data, id)!;
      const shift = planShift(data, p, job, 0, makeRng(7));
      const authored = shift.tasks.filter((t) => t.source.type === 'authored').map((t) => job.content.en!.tasks.find((x) => x.id === t.source.id)!.rank);
      expect(authored.length).toBeGreaterThan(0);
      expect(Math.min(...authored)).toBe(p.jobs!.jobs[id].rank);
    }
    expect(chooseJob(data, p, 'office', rng)).toBeNull();
    endTownDay(p, data);
  });

  it('the ladder above a placement is as far as for a player who climbed there; ranks never go down', () => {
    const p = newProgress('en');
    applyStartLevel(data, p, 5);
    const inn = jobById(data, 'inn')!;
    const jp = p.jobs!.jobs.inn;
    expect(goodCredit(jp)).toBe(inn.ranks[3].need.good);
    expect(rankStatus(data, p, inn).good).toBe(inn.ranks[3].need.good);
    // the spine gate counts only the placed rank's own tasks
    expect(spineSeen(data, p, inn, 4).total).toBe(inn.content.en!.tasks.filter((t) => t.rank === 4).length);
    expect(checkRankUp(data, p, inn)).toBeNull();
    applyStartLevel(data, p, 2);
    expect(p.jobs!.jobs.inn.rank).toBe(4);
  });

  it('a high start skips the delivery slips of the levels below the one reached (like early orders)', () => {
    const p = newProgress('en');
    const sum = applyStartLevel(data, p, 6);
    const town = data.shared.town!;
    expect(sum.slipsSkipped).toBeGreaterThan(0);
    const reached = [...town.delivery.levels].filter((l) => p.town.deliveryRuns >= l.minRuns).pop()!.level;
    for (const sl of town.delivery.curriculum) if (sl.level < reached) expect(p.town.slips[sl.id]).toMatchObject({ perfect: true, seeded: true });
    expect(Object.values(p.town.slips).every((x) => x.attempts === 0)).toBe(true);
  });

  it('a 英検5級 start places no job (the board opens on day 4 as usual); a preview changes nothing', () => {
    const p = newProgress('en');
    const sum = applyStartLevel(data, p, 1);
    expect(sum.boardOpened).toBe(false);
    expect(p.jobs?.boardOpen).toBeUndefined();
    expect(previewPlacement(data, 6).map((x) => `${x.id}${x.rank}`)).toEqual(['teahouse4', 'post5', 'kitchen5', 'inn5', 'office4']);
  });

  it('a 英検3級 start offers the office at once, at its first rank (its material is 3級)', () => {
    const p = newProgress('en');
    applyStartLevel(data, p, 3);
    expect(p.jobs!.boardOpen).toBe(1);
    expect(p.jobs!.jobs.office).toMatchObject({ rank: 1, placed: { rank: 1, good: 0 } });
    expect(jobOffered(p, jobById(data, 'office')!)).toBe(true);
    expect(p.jobs!.jobs.post.rank).toBe(2);
  });

  it('a TOEIC start seeds the equivalent 英検 grade and places the jobs by their TOEIC bands', () => {
    const p = newProgress('en');
    applyStartLevel(data, p, 0, { toeic: 600 });
    expect(p.difficulty!.start).toBe(5);
    expect(p.difficulty!.startToeic).toBe(600);
    expect(p.jobs!.jobs.office.rank).toBe(2);
  });
});

describe('inflected words taught on their own are looked up by their headword (lemma)', () => {
  it('"names", "booked", "telling" … carry a lemma and match the list through it, keeping their ids', async () => {
    const { indexLists, vocabFor } = await import('../curriculum/lists');
    const { reconcileLexicon } = await import('../curriculum/curriculum');
    const lists = indexLists(
      [
        { word: 'name', pos: 'noun', eiken: '5', toeic: 400, cefr: 'A1', ja: '名前', domains: [], freq: 1 },
        { word: 'book', pos: 'noun', eiken: '5', toeic: 400, cefr: 'A1', ja: '本', domains: [], freq: 2 },
        { word: 'book', pos: 'verb', eiken: '3', toeic: 400, cefr: 'B1', ja: '予約する', domains: ['hotel'], freq: 2 },
        { word: 'tell', pos: 'verb', eiken: '5', toeic: 400, cefr: 'A1', ja: '話す', domains: [], freq: 3 },
      ] as never,
      [],
      [],
    );
    const byId = new Map(data.content.lexicon.map((e) => [e.id, e]));
    expect(byId.get('names')?.lemma).toBe('name');
    expect(byId.get('in_book_v')?.lemma).toBe('book');
    expect(byId.get('in_tell')?.lemma).toBe('tell');
    expect(vocabFor(lists, 'booked', 'verb', [], 'book')?.eiken).toBe('3');
    const rec = reconcileLexicon(['names', 'in_book_v', 'in_tell'].map((id) => byId.get(id)!), lists);
    expect(rec.missing).toEqual([]);
    expect(rec.lexicon.map((e) => e.id)).toEqual(['names', 'in_book_v', 'in_tell']);
  });
});

describe('the market never asks for more than the purse can pay', () => {
  it('a high start’s first note, and a nearly empty purse, stay within the money', async () => {
    const { startTownDay: start } = await import('../activities/day');
    const { goodDef } = await import('../activities/market/rules');
    const m = data.shared.town!.market;
    for (const lv of [2, 3, 4, 5, 6])
      for (let seed = 1; seed <= 12; seed++) {
        const p = newProgress('en');
        applyStartLevel(data, p, lv);
        if (seed % 3 === 0) p.town.money = 9;
        start(data, p, makeRng(seed));
        const md = p.townDay?.market;
        if (!md) continue;
        const dearest = (good: string, variant?: string) => Math.max(...md.stalls.flatMap((s) => s.offers.filter((o) => o.good === good && (o.variant === variant || (!variant && (o.variant === undefined || o.variant === goodDef(m, good as never)?.variants?.[0])))).map((o) => o.price)));
        const cost = md.lines.reduce((a, l) => a + l.units * dearest(l.good, l.variant), 0);
        expect(cost, `start ${lv} seed ${seed}`).toBeLessThanOrEqual(Math.max(p.town.money, dearest(md.lines[0].good, md.lines[0].variant)));
        expect(md.lines.length).toBeGreaterThan(0);
      }
  });
});
