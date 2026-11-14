import { describe, expect, it } from 'vitest';
import { CONTENT, SHARED } from '../content';
import { nearUnmatched } from '../content/jobs';
import { buildGameData } from '../core/gamedata';
import { makeRng } from '../core/rng';
import { featuresAt, jobById, jobsOf } from './engine';
import { deriveNear, nearMisses, qaDistractors } from './nearmiss';
import { templateInstance } from './templates';
import type { QaItem } from './types';

const data = buildGameData(CONTENT.en, SHARED);

describe('near misses for reply choices', () => {
  it('derives a wrong reply by changing a fact the answer echoes from the message', () => {
    const d = deriveNear({ q: 'Dear Sir, we would like a room on Friday. Is that possible?', a: 'Yes, we have a room on Friday.' });
    expect(d).toContain('Yes, we have a room on Saturday.');
    expect(d).toContain('Yes, we have a room on Thursday.');
    expect(deriveNear({ q: 'Please take 20 coins off our bill.', a: 'We have taken 20 coins off your bill.' })).toContain('We have taken 30 coins off your bill.');
  });

  it('never changes a fact after a range word the message does not share ("before Friday" also fits Thursday)', () => {
    expect(deriveNear({ q: 'The deadline for the budget is Friday.', a: 'I will finish it before Friday.' })).toEqual([]);
    expect(deriveNear({ q: 'Please call me back after three.', a: 'I will call you at three.' })).toEqual([]);
    // a count is not a point fact: three free rooms still answer "do you have two?"
    expect(deriveNear({ q: 'Do you have two rooms for tonight?', a: 'Yes, we have two rooms.' })).toEqual([]);
  });

  it('authored near misses come first; other topics only make up the number', () => {
    const bank: QaItem[] = [
      { q: 'How much is a stamp?', a: 'It is two coins.', fn: 'price', rank: 1, near: ['It is three coins.'] },
      { q: 'Where is the bank?', a: 'It is next to the school.', fn: 'place', rank: 1 },
      { q: 'Thank you!', a: 'You are welcome.', fn: 'thanks', rank: 1 },
    ];
    const d = qaDistractors(bank[0], bank, 2, makeRng(1));
    expect(d[0]).toBe('It is three coins.');
    expect(d).toHaveLength(2);
    expect(d).not.toContain('It is two coins.');
  });

  it('every near-miss key in the content matches an item, and every QA item has at least two near misses', () => {
    expect(nearUnmatched).toEqual([]);
    for (const j of jobsOf(data)) for (const [, items] of Object.entries(j.content.en?.qa ?? {})) for (const q of items) expect(nearMisses(q, items).length, `${j.id} ${q.fn}`).toBeGreaterThanOrEqual(2);
  });

  it('reply-choice template instances offer the answer with wrong replies on its own topic', () => {
    for (const id of ['post', 'inn', 'office']) {
      const job = jobById(data, id)!;
      const jc = job.content.en!;
      for (const t of jc.templates.filter((x) => x.arch === 'respond' && 'bank' in x))
        for (let s = 0; s < 6; s++) {
          const rank = Math.max(t.rank, 5);
          const inst = templateInstance({ data, job, jc, rank, feats: featuresAt(job, rank), rng: makeRng(s * 31 + 7), timedOn: false }, t);
          const spec = inst?.spec;
          if (!spec || spec.arch !== 'respond' || spec.mode !== 'choose') continue;
          const bank = jc.qa![(t as { bank: string }).bank];
          const item = bank.find((q) => q.q === spec.msg!.lines[0])!;
          const wrong = spec.options!.filter((_, i) => i !== spec.answer);
          const near = nearMisses(item, bank);
          // every wrong reply is a near miss of this very item (on its topic), and there are at least two
          expect(wrong.length, `${id} ${t.id} ${item.fn}`).toBeGreaterThanOrEqual(2);
          expect(wrong.every((w) => near.includes(w)), `${id} ${t.id} ${item.fn}`).toBe(true);
          expect(spec.options![spec.answer!]).toBe(item.a);
        }
    }
  });
});

describe('authored reply choices', () => {
  it('no authored reply choice offers only stock lines about something else (the wrong options are near misses)', async () => {
    const { POST_JOB } = await import('../content/jobs/post.en');
    const { INN_JOB } = await import('../content/jobs/inn.en');
    const { OFFICE_JOB } = await import('../content/jobs/office.en');
    for (const orig of [POST_JOB, INN_JOB, OFFICE_JOB]) {
      const stock = new Map<string, number>();
      for (const t of orig.content.en!.tasks) if (t.arch === 'respond' && t.mode === 'choose') t.options!.forEach((o, i) => i !== t.answer && stock.set(o, (stock.get(o) ?? 0) + 1));
      const merged = jobById(data, orig.id)!.content.en!.tasks;
      for (const t of merged) {
        if (t.arch !== 'respond' || t.mode !== 'choose') continue;
        const wrong = t.options!.filter((_, i) => i !== t.answer);
        const stale = wrong.filter((o) => (stock.get(o) ?? 0) >= 3);
        expect(stale.length, `${orig.id} ${t.id}: ${stale.join(' / ')}`).toBeLessThan(wrong.length);
        expect(wrong.length).toBeGreaterThanOrEqual(2);
      }
    }
  });
});
