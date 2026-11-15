import { describe, expect, it } from 'vitest';
import { reactionFits } from './engine';
import type { TaskInstance } from './types';

const inst = (texts: string[]) => ({ texts }) as unknown as TaskInstance;

describe('reaction lines fit who the request was for', () => {
  it('no "I can\'t eat it" when someone else can\'t eat it; no "both of us" / "my son" from a lone customer', () => {
    const son = reactionFits(inst(["My son can't eat cheese. It makes him sick. Bread with a tomato, please. No cheese!"]));
    expect(son("Oh no! Cheese! I can't eat it.")).toBe(false);
    expect(son('Stop! No cheese for me, please!')).toBe(false);
    expect(son('Oh no! Cheese! I said no cheese in this one!')).toBe(true);
    expect(son('Many thanks! Both of us are happy.')).toBe(true);
    expect(son('My son will love this, too! Thank you.')).toBe(true);
    const me = reactionFits(inst(["I can't eat eggs. Grilled fish and potatoes, please."]));
    expect(me("Oh no! Eggs! I can't eat them.")).toBe(true);
    expect(me('Many thanks! Both of us are happy.')).toBe(false);
    expect(me('My daughter will love this. Thank you!')).toBe(false);
    const wren = reactionFits(inst(['{Mrs. Wren|@} can\'t eat fish. She wants chicken with rice, grilled, in a box. Thank you!']));
    expect(wren("Oh no! Fish! I can't eat it.")).toBe(false);
  });
});

describe('reaction lines keep to what the task is about (needs / not / voice)', () => {
  it('bags only for luggage, the register book only when there is one, a guest’s line only when the guest spoke', async () => {
    const { reactionSuits } = await import('./engine');
    const { CONTENT } = await import('../content');
    const inn = CONTENT.en.jobs!.find((j) => j.id === 'inn')!.content.en!;
    const kitchen = CONTENT.en.jobs!.find((j) => j.id === 'kitchen')!.content.en!;
    const r = (jc: typeof inn, id: string) => jc.reactions.find((x) => x.id === id)!;
    const mail = { texts: ['The morning post has arrived.', 'A letter of complaint about a bill'], handover: false };
    const bags = { texts: ['A big group arrives.', 'Bags for the guests of the group in room 26'], handover: false };
    expect(reactionSuits(r(inn, 'ir_ok3b'), mail)).toBe(false);
    expect(reactionSuits(r(inn, 'ir_ok3b'), bags)).toBe(true);
    expect(reactionSuits(r(inn, 'ir_missed2'), { texts: ['Here is the bill for our group.', 'Invoice', 'Total'] })).toBe(false);
    expect(reactionSuits(r(inn, 'ir_missed3'), { texts: ['Here is the bill for our group.', 'Invoice', 'Total'] })).toBe(true);
    expect(reactionSuits(r(inn, 'ir_reply3'), { texts: ['Dear Sir, …'], handover: true })).toBe(false);
    expect(reactionSuits(r(inn, 'ir_reply_b'), { texts: ['Dear Sir, …'], handover: true })).toBe(true);
    const tickets = { texts: ['Chef Basil has written the tickets in a hurry.', 'Whip the eggs, then fry them in butter.'] };
    expect(reactionSuits(r(kitchen, 'kr_bin'), tickets)).toBe(false);
    expect(reactionSuits(r(kitchen, 'kr_u1'), { texts: ['The mixed grill has chicken, tomatoes and mushrooms.'] })).toBe(false);
  });
});

describe('who speaks and how the request came (reactionFits with a speaker)', () => {
  const mk = (say: string, spec: Record<string, unknown>, extra: Record<string, unknown> = {}) => ({ texts: [say], say, spec, audioOnly: false, ...extra }) as unknown as TaskInstance;
  const customer = { boss: false, bossName: '{Chef Basil|@}', gender: 'f' as const };
  const chef = { boss: true, bossName: '{Chef Basil|@}', gender: 'm' as const };
  it('eater lines only from the one who eats: not from the boss, not over a recipe card or a dish for someone else', () => {
    const card = mk('Recipe card: Fry two eggs, and serve them on a plate.', { arch: 'make' });
    expect(reactionFits(card, chef)('Where is my food?')).toBe(false);
    expect(reactionFits(card, chef)('Delicious! Thank you.')).toBe(true);
    const forWren = mk('Cheese and a tomato for {Mrs. Wren|@}, please.', { arch: 'make' });
    expect(reactionFits(forWren, customer)('My stomach is happy.')).toBe(false);
    const own = mk('Two eggs and rice, please.', { arch: 'make' });
    expect(reactionFits(own, customer)('My stomach is happy.')).toBe(true);
    expect(reactionFits(own, chef)('Well done. {Chef Basil|@} will be very pleased.')).toBe(false);
    expect(reactionFits(own, customer)('That is not much rice! I am a hungry man!')).toBe(false);
  });
  it('"listen" only after a spoken request, "read the card" only when there is a card', () => {
    const card = mk('Recipe card: Fry two eggs.', { arch: 'make' });
    const spoken = mk('Two eggs, please.', { arch: 'make' });
    expect(reactionFits(card, chef)('You listened well. Thank you!')).toBe(false);
    expect(reactionFits(spoken, customer)('You listened well. Thank you!')).toBe(true);
    expect(reactionFits(spoken, customer)('Please check the card again.')).toBe(false);
    expect(reactionFits(card, chef)('Please check the card again.')).toBe(true);
    expect(reactionFits(mk('Look at the bags.', { arch: 'sort' }), chef)('Please read the note again.')).toBe(false);
  });
  it('the asker\'s own lines only face to face; "please send it" only for a written reply', () => {
    const email = mk('Please answer this email.', { arch: 'respond', msg: { kind: 'email', lines: [] } });
    const speech = mk('Is the desk open on Sunday?', { arch: 'respond', msg: { kind: 'speech', lines: [] } });
    expect(reactionFits(email, chef)('Sorry? That is not an answer to my question.')).toBe(false);
    expect(reactionFits(speech, customer)('Sorry? That is not an answer to my question.')).toBe(true);
    expect(reactionFits(speech, customer)('A clear and polite reply. Please send it.')).toBe(false);
    expect(reactionFits(email, chef)('A clear and polite reply. Please send it.')).toBe(true);
  });
});

describe('reaction pool', () => {
  it('late work gets a line about time, a small mistake never does; "the {field}" lines are filled', async () => {
    const { reactionPool } = await import('./engine');
    const { CONTENT, SHARED } = await import('../content');
    const { buildGameData } = await import('../core/gamedata');
    const { authoredInstance } = await import('./templates');
    const { featuresAt } = await import('./engine');
    const { makeRng } = await import('../core/rng');
    const data = buildGameData(CONTENT.en, SHARED);
    const job = data.content.jobs!.find((j) => j.id === 'post')!;
    const jc = job.content.en!;
    const t = jc.tasks.find((x) => x.id === 'p3_size')!;
    const inst = authoredInstance({ data, job, jc, rank: 3, feats: featuresAt(job, 3), rng: makeRng(1), timedOn: true }, t);
    const late = reactionPool(data, jc, inst, { outcome: 'minor', primary: null }, 3, true);
    expect(late.every((x) => x.r.late)).toBe(true);
    const fix = reactionPool(data, jc, inst, { outcome: 'minor', primary: { kind: 'wrong_fix', field: 'size', about: [] } }, 3);
    expect(fix.map((x) => x.r.id)).toContain('pr_minor_fix');
    expect(fix.some((x) => x.r.late)).toBe(false);
    expect(fix.find((x) => x.r.id === 'pr_minor_fix')!.text).toBe('Almost. But that is not the right size.');
  });
});

describe('a paper field label in running text', () => {
  it('reads as a noun after "the", keeps proper nouns, quotes labels that are not nouns', async () => {
    const { fieldInText } = await import('./engine');
    expect(fieldInText('Tracking number')).toBe('tracking number');
    expect(fieldInText('Monday')).toBe('Monday');
    expect(fieldInText('By')).toBe('“By” line');
    expect(fieldInText('Send by')).toBe('“Send by” line');
    expect(fieldInText('Room, a night')).toBe('“Room, a night” line');
  });
});
