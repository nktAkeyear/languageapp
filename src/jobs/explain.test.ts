import { describe, expect, it } from 'vitest';
import { CONTENT, SHARED } from '../content';
import { buildGameData } from '../core/gamedata';
import { makeRng } from '../core/rng';
import { factDiff } from './explain';
import { featuresAt, reactionPool, ruleCtx, wrongAnswers } from './engine';
import { evaluateTask, solveTask } from './rules';
import { authoredInstance, templateInstance, visitorPeople } from './templates';
import type { JobContent, TaskInstance, TaskSpec } from './types';
import { GENERIC } from './validate';

const data = buildGameData(CONTENT.en, SHARED);
const job = (id: string) => data.content.jobs!.find((j) => j.id === id)!;
const jc = (id: string) => job(id).content.en as JobContent;

function inst(jobId: string, spec: TaskSpec, extra: Partial<TaskInstance> = {}): TaskInstance {
  return { key: 'k', job: jobId, source: { kind: 'template', id: 't' }, spec, person: jc(jobId).people.find((p) => !p.staff && p.id !== jc(jobId).boss)!.id, say: '', texts: [], focus: [], ...extra } as unknown as TaskInstance;
}

function told(jobId: string, i: TaskInstance, answer: Parameters<typeof evaluateTask>[1]): string {
  const rc = ruleCtx(data, jc(jobId));
  const ev = evaluateTask(i.spec, answer, rc);
  const pool = reactionPool(data, jc(jobId), i, ev, 1);
  expect(pool[0]?.told).toBe(true);
  return pool[0].text;
}

describe('reactions say what was off (no verdicts)', () => {
  it('factDiff finds the one changed fact, and only a fact', () => {
    expect(factDiff('Yes. I will move your appointment to Thursday.', 'Yes. I will move your appointment to Wednesday.')).toEqual({ right: 'Thursday', wrong: 'Wednesday' });
    expect(factDiff('We will call you back on 4 5 8 2.', 'We will call you back on 4 5 2 8.')).toEqual({ right: '8 2', wrong: '2 8' });
    expect(factDiff('You are welcome.', 'Two envelopes, please.')).toBeNull();
    expect(factDiff('Yes, of course.', 'No, sorry.')).toBeNull();
  });

  it('a reply: the changed fact, the line of the message, or the question asked', () => {
    const spec: TaskSpec = { arch: 'respond', mode: 'choose', msg: { kind: 'phone', lines: ['Hello, this is {Mr. Grant|@}.', 'I cannot come on Tuesday.', 'Can I come on Thursday instead?'] }, options: ['Yes. I will move your appointment to Thursday.', 'Yes. I will move your appointment to Wednesday.', 'The fee is twenty dollars.'], answer: 0 };
    const i = inst('townhall', spec, { handover: true, say: 'A call. Please listen.' });
    expect(told('townhall', i, { arch: 'respond', choice: 1 })).toBe('The caller said Thursday, not Wednesday.');
    expect(told('townhall', i, { arch: 'respond', choice: 2 })).toBe('The caller asked: “Can I come on Thursday instead?”');
  });

  it('a paper: what this line says here and on the other paper', () => {
    const spec: TaskSpec = {
      arch: 'check',
      docs: [
        { kind: 'card', title: 'Form', fields: [{ id: 'name', label: 'Name', value: '{Mr. Grant|@}' }, { id: 'addr', label: 'Address', value: '12 Bridge Street' }] },
        { kind: 'card', title: 'Passport', fields: [{ id: 'name', label: 'Name', value: '{Mr. Grant|@}' }, { id: 'addr', label: 'Address', value: '21 Bridge Street' }] },
      ],
      target: 0,
      wrong: 'addr',
    };
    const i = inst('townhall', spec);
    expect(told('townhall', i, { arch: 'check', verdict: 'ok' })).toBe('The address is 12 Bridge Street here, but 21 Bridge Street on the passport.');
    expect(told('townhall', i, { arch: 'check', verdict: 'fix', field: 'name' })).toBe('The name is {Mr. Grant|@}, the same as on the passport. Look at the address.');
  });

  it('a slot: the line of the message that rules the chosen cell out', () => {
    const spec: TaskSpec = {
      arch: 'respond',
      mode: 'slot',
      msg: { kind: 'speech', lines: ['I need to see someone about the rent.', 'I can come on Wednesday or Thursday, but not in the morning.'] },
      slot: {
        layout: 'calendar',
        rows: [{ id: 'tue', label: 'Tuesday' }, { id: 'wed', label: 'Wednesday' }],
        cols: [{ id: 't9', label: '9:00' }, { id: 't2', label: '2:00' }],
        cells: [
          { id: 'tue-t9', row: 'tue', col: 't9', tags: ['tue', 'morning'] },
          { id: 'tue-t2', row: 'tue', col: 't2', tags: ['tue', 'afternoon'] },
          { id: 'wed-t9', row: 'wed', col: 't9', tags: ['wed', 'morning'] },
          { id: 'wed-t2', row: 'wed', col: 't2', tags: ['wed', 'afternoon'] },
        ],
        answer: 'wed-t2',
      },
    };
    const i = inst('townhall', spec);
    expect(told('townhall', i, { arch: 'respond', slot: 'wed-t9' })).toBe('Wednesday, 9:00? But I said: “I can come on Wednesday or Thursday, but not in the morning.”');
  });

  it('every wrong answer to every authored task of every job gets a line built from the task, never a bare verdict', () => {
    for (const j of data.content.jobs!) {
      const c = j.content.en;
      if (!c) continue;
      const rc = ruleCtx(data, c);
      let all = 0;
      let built = 0;
      for (const t of c.tasks) {
        const i = authoredInstance({ data, job: j, jc: c, rank: t.rank, feats: featuresAt(j, t.rank), rng: makeRng(1), timedOn: false }, t);
        for (const a of wrongAnswers(i.spec, solveTask(i.spec, rc))) {
          const ev = evaluateTask(i.spec, a, rc);
          if (ev.outcome === 'perfect') continue;
          const pool = reactionPool(data, c, i, ev, t.rank);
          all++;
          if (pool[0]?.told) built++;
          else expect(pool.every((x) => GENERIC.test(x.r.text))).toBe(false);
        }
      }
      if (all) expect(built / all).toBeGreaterThan(0.97);
    }
  });
});

describe('staff never come to the counter as clients', () => {
  it('the town hall’s desks, the clinic’s doctors and the newsroom are colleagues', () => {
    for (const id of ['townhall', 'clinic', 'news', 'academy']) {
      const staff = jc(id).people.filter((p) => p.staff).map((p) => p.id);
      expect(staff.length).toBeGreaterThan(0);
      expect(visitorPeople(jc(id)).some((p) => staff.includes(p))).toBe(false);
    }
    // a spoken request of a template is said by a visitor, never by Ms. Okafor or Ms. Aldridge
    const j = job('townhall');
    const speechT = jc('townhall').templates.filter((t) => t.arch === 'respond' && (t as { kind?: string }).kind === 'speech');
    for (const t of speechT)
      for (let seed = 1; seed <= 8; seed++) {
        const i = templateInstance({ data, job: j, jc: jc('townhall'), rank: 5, feats: featuresAt(j, 5), rng: makeRng(seed), timedOn: false }, t);
        if (i) expect(jc('townhall').people.find((p) => p.id === i.person)?.staff ?? false).toBe(false);
      }
  });
});
