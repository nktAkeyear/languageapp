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
