import { describe, expect, it } from 'vitest';
import { CONTENT, SHARED } from '../content';
import type { LanguageContent, SharedContent } from './types';
import { validateLanguage, validateShared } from './validate';

describe('content validator', () => {
  it('seed content has no errors', () => {
    expect(validateShared(SHARED).errors).toEqual([]);
    expect(validateLanguage(CONTENT.en, SHARED).errors).toEqual([]);
    expect(validateLanguage(CONTENT.zh, SHARED).errors).toEqual([]);
  });

  it('catches broken references and unsatisfiable orders', () => {
    const bad: LanguageContent = structuredClone(CONTENT.en);
    bad.orders.push({ id: 'x1', stage: 1, text: 'Banana.', rule: { require: [{ ing: 'lemon' }] } });
    bad.orders.push({ id: 'x2', stage: 1, text: 'Lemon.', rule: { require: [{ ing: 'black_tea' }] } });
    bad.orders.push({ id: 'x3', stage: 1, text: 'Lemon.', rule: { require: [{ ing: 'lemon' }], temp: 'hot' } });
    bad.orders.push({ id: 'x4', stage: 1, text: 'Lemon.', recipe: 'nope' });
    bad.lexicon.push({ id: 'orphan', text: 'orphan', gloss: 'x', pos: 'noun', cefr: 'A1', eiken: '5', group: 'g_missing' });
    bad.templates.push({ id: 'tx', stage: 1, text: '{a}.', slots: { a: { kind: 'temp' } } });
    const errs = validateLanguage(bad, SHARED).errors.join('\n');
    expect(errs).toMatch(/order x1: words not in lexicon: Banana/);
    expect(errs).toMatch(/order x2: not satisfiable at stage 1: requires black_tea/);
    expect(errs).toMatch(/order x3: .*temperature/);
    expect(errs).toMatch(/order x4: unknown recipe nope/);
    expect(errs).toMatch(/lexicon orphan: group "g_missing"/);
    expect(errs).toMatch(/lexicon orphan .* never appears/);
    expect(errs).toMatch(/template tx: cannot be instantiated at stage 1/);
  });

  it('town: catches broken map references, unwritable slips, missing vendor lines and unknown words', () => {
    const shared: SharedContent = structuredClone(SHARED);
    shared.town!.delivery.curriculum.push({ id: 'dx', level: 1, seq: 9, dest: { rel: 'next_to', landmark: 'bank' } });
    shared.town!.delivery.curriculum.push({ id: 'dy', level: 1, seq: 10, dest: { rel: 'behind', landmark: 'bank' } });
    shared.town!.market.goods.push({ ingredient: 'lemon', portionsPerUnit: 1, price: 1, stalls: ['purple'] });
    const sh = validateShared(shared).errors.join('\n');
    expect(sh).toMatch(/curriculum dx: "next_to bank" does not point at exactly one place/);
    expect(sh).toMatch(/curriculum dy: uses "relations" before delivery level 2/);
    expect(sh).toMatch(/unknown stall purple/);

    const bad: LanguageContent = structuredClone(CONTENT.en);
    bad.town!.market.lines = bad.town!.market.lines.filter((l) => l.kind !== 'quote');
    bad.town!.market.lines.push({ id: 'mx', kind: 'thanks', level: 1, text: 'Thanks, {g}! Bananas!', face: 'happy' });
    bad.town!.delivery.dest.behind = ['The house behind the {p}, mate.'];
    bad.town!.market.goods = bad.town!.market.goods.filter((g) => g.ingredient !== 'honey');
    const errs = validateLanguage(bad, SHARED).errors.join('\n');
    expect(errs).toMatch(/need a "quote" vendor line/);
    expect(errs).toMatch(/market line mx: placeholder \{g\} not available for "thanks"/);
    expect(errs).toMatch(/words not in lexicon: mate/);
    expect(errs).toMatch(/market: no text for good honey/);
  });
});

