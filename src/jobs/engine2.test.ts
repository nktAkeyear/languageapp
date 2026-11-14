import { describe, expect, it } from 'vitest';
import { CONTENT, SHARED } from '../content';
import { buildGameData } from '../core/gamedata';
import { makeRng } from '../core/rng';
import { evalExpr } from './expr';
import { evaluateMake, evaluateTrade, postage, solveTask } from './rules';
import { featuresAt, jobById, ruleCtx } from './engine';
import { qtyText, selfNamed, singularOf, templateInstance, thingAgreement, type GenCtx } from './templates';
import type { CheckTemplate, FormTemplate, RateTable, TaskTemplate } from './types';

const data = buildGameData(CONTENT.en, SHARED);
const ctxFor = (jobId: string, rank: number, seed: number): GenCtx => {
  const job = jobById(data, jobId)!;
  return { data, job, jc: job.content.en!, rank, feats: featuresAt(job, rank), rng: makeRng(seed), timedOn: false };
};

describe('quantities and agreement', () => {
  const kitchen = jobById(data, 'kitchen')!.content.en!;
  const bread = kitchen.things.find((t) => t.word === 'bread')!;
  const egg = kitchen.things.find((t) => t.word === 'egg')!;
  it('a unit noun is singular for one ("one piece of bread")', () => {
    expect(singularOf('pieces')).toBe('piece');
    expect(singularOf('glasses')).toBe('glass');
    expect(qtyText(data, bread, 1)).toMatch(/^one piece of bread$/);
    expect(qtyText(data, bread, 2)).toMatch(/^two pieces of bread$/);
    expect(qtyText(data, egg, 1)).toMatch(/one \{egg\|egg\}/);
  });
  it('reactions agree in number and count / mass', () => {
    const m = thingAgreement(data, bread, false);
    expect(m.thing).toMatch(/\{bread\|/);
    expect([m.is, m.much, m.it]).toEqual(['is', 'much', 'it']);
    const c = thingAgreement(data, egg, false);
    expect(c.thing).toMatch(/\{eggs\|egg\}/);
    expect([c.is, c.much, c.it]).toEqual(['are', 'many', 'them']);
    expect(thingAgreement(data, egg, true).is).toBe('is');
  });
});

describe('make: dislikes, recipe order, what the pantry is out of', () => {
  it('a dislike served is a plain mistake; an allergy is harmful', () => {
    const base = { arch: 'make' as const, counts: { a: 1, x: 1 }, vessel: null, method: null };
    expect(evaluateMake({ want: [{ thing: 'a', n: 1 }], dislike: ['x'] }, base).outcome).toBe('fail');
    expect(evaluateMake({ want: [{ thing: 'a', n: 1 }], dislike: ['x'] }, base).primary?.kind).toBe('disliked');
    expect(evaluateMake({ want: [{ thing: 'a', n: 1 }], forbid: ['x'] }, base).outcome).toBe('bad');
  });
  it('a recipe card’s order is judged', () => {
    const spec = { want: [{ thing: 'egg', n: 2 }, { thing: 'cheese', n: 1 }], order: ['egg', 'cheese'] };
    const a = { arch: 'make' as const, counts: { egg: 2, cheese: 1 }, vessel: null, method: null };
    expect(evaluateMake(spec, { ...a, seq: ['egg', 'cheese'] }).outcome).toBe('perfect');
    expect(evaluateMake(spec, { ...a, seq: ['cheese', 'egg'] }).primary?.kind).toBe('wrong_order');
  });
  it('"if there is no X, give Y": the pantry is sometimes out of X', () => {
    const t = jobById(data, 'kitchen')!.content.en!.templates.find((x) => x.id === 'kt_ifno')!;
    const outs = new Set<boolean>();
    for (let s = 1; s < 40; s++) {
      const inst = templateInstance(ctxFor('kitchen', 3, s), t)!;
      if (inst.spec.arch !== 'make') continue;
      outs.add(!!inst.spec.out?.length);
      for (const o of inst.spec.out ?? []) expect(inst.spec.want.some((w) => w.thing === o)).toBe(false);
    }
    expect(outs).toEqual(new Set([true, false]));
  });
});

describe('the post office scale and rate table', () => {
  const rates: RateTable = { title: 'x', dests: [{ id: 'town', label: 't' }, { id: 'island', label: 'i' }], bands: [{ upTo: 1, label: 'a' }, { upTo: 3, label: 'b' }], price: [[2, 3], [4, 6]] };
  it('postage by destination and weight band; change counts the postage', () => {
    expect(postage(rates, 'island', 2)).toBe(6);
    expect(postage(rates, 'island', 4)).toBeNull();
    const spec = { want: [{ thing: 'stamp', n: 1 }], pay: 10, post: { dest: 'island', kilos: 2 } };
    const price = () => 2;
    const rate = () => 6;
    expect(evaluateTrade(spec, { arch: 'trade', counts: { stamp: 1 }, change: 2, postage: 6 }, price, undefined, rate).outcome).toBe('perfect');
    expect(evaluateTrade(spec, { arch: 'trade', counts: { stamp: 1 }, change: 4, postage: 4 }, price, undefined, rate).primary?.kind).toBe('wrong_postage');
  });
  it('generated parcels are always solvable from the rate table', () => {
    const t = jobById(data, 'post')!.content.en!.templates.find((x) => x.id === 'pt_post3b')!;
    for (let s = 1; s < 20; s++) {
      const ctx = ctxFor('post', 3, s);
      const inst = templateInstance(ctx, t)!;
      const rc = ruleCtx(data, ctx.jc);
      const a = solveTask(inst.spec, rc);
      expect(a.arch === 'trade' && a.change >= 0).toBe(true);
    }
  });
});

describe('check templates compute their sums; one deliberate discrepancy', () => {
  it('expressions', () => {
    expect(evalExpr('qty * price', { qty: 3, price: 4 })).toBe(12);
    expect(evalExpr('(arrive - 1 + nights) % 7 + 1', { arrive: 6, nights: 3 })).toBe(2);
    expect(evalExpr('days > 7 ? price : days >= 3 ? price / 2 : 0', { days: 5, price: 80 })).toBe(40);
    expect(() => evalExpr('qty * nope', { qty: 1 })).toThrow();
  });
  it('an invoice adds up, and when it is wrong exactly one line disagrees', () => {
    const t = jobById(data, 'office')!.content.en!.templates.find((x) => x.id === 'ot_inv1') as TaskTemplate & CheckTemplate;
    let wrongs = 0;
    for (let s = 1; s < 60; s++) {
      const inst = templateInstance(ctxFor('office', 1, s), t)!;
      if (inst.spec.arch !== 'check') continue;
      const bill = inst.spec.docs[1].fields!;
      const v = (id: string) => Number(bill.find((f) => f.id === id)!.value.replace(/[^0-9]/g, ''));
      const order = inst.spec.docs[0].fields!;
      const diff = bill.filter((f) => order.some((o) => o.id === f.id && o.value !== f.value)).map((f) => f.id);
      if (!inst.spec.wrong) {
        expect(v('total')).toBe(v('qty') * v('price'));
        expect(diff).toEqual([]);
      } else {
        wrongs++;
        if (inst.spec.wrong === 'total') expect(v('total')).not.toBe(v('qty') * v('price'));
        else {
          expect(v('total')).toBe(v('qty') * v('price')); // the bill is consistent with itself
          expect(diff).toEqual([inst.spec.wrong]);
        }
      }
    }
    expect(wrongs).toBeGreaterThan(10);
  });
});

describe('templates: the message pad, speakers, open / close lines', () => {
  it('a form template writes the call and offers near misses', () => {
    const t = jobById(data, 'inn')!.content.en!.templates.find((x) => x.id === 'it_pad2') as TaskTemplate & FormTemplate;
    const inst = templateInstance(ctxFor('inn', 2, 3), t)!;
    expect(inst.spec.arch === 'respond' && inst.spec.mode).toBe('form');
    if (inst.spec.arch === 'respond') for (const f of inst.spec.fields!) expect(f.options).toContain(f.answer);
    expect(inst.say).not.toBe(''); // the boss hands over the call
    expect(inst.handover).toBe(true);
  });
  it('a speaker who names themselves is that person', () => {
    const inn = jobById(data, 'inn')!.content.en!;
    expect(selfNamed(data, inn, 'Hello. My name is {Mr. Lin|@}.')?.id).toBe('p_lin');
    const t = inn.templates.find((x) => x.id === 'it_check1')!;
    for (let s = 1; s < 15; s++) {
      const inst = templateInstance(ctxFor('inn', 1, s), t)!;
      const self = selfNamed(data, inn, inst.say);
      if (self?.id) expect(inst.person).toBe(self.id);
    }
  });
  it('slot templates use all their opening lines', () => {
    const office = jobById(data, 'office')!.content.en!;
    const t = office.templates.find((x) => x.arch === 'respond' && 'open' in x && (x.open?.length ?? 0) > 1);
    if (!t) return;
    const firsts = new Set<string>();
    for (let s = 1; s < 40; s++) {
      const inst = templateInstance(ctxFor('office', t.rank, s), t);
      if (inst && inst.spec.arch === 'respond') firsts.add(inst.spec.msg.lines[0]);
    }
    expect(firsts.size).toBeGreaterThan(1);
  });
});
