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
