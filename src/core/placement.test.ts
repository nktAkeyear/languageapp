import { describe, expect, it } from 'vitest';
import { CONTENT, SHARED } from '../content';
import { evaluateBrew } from '../activities/shop/rules';
import { startOptions } from './difficulty';
import { buildGameData } from './gamedata';
import { ITEMS_PER_LEVEL, levelCandidates, placementItems, placementSuggestion } from './placement';
import { LANGS } from './types';

describe.each(LANGS)('placement check (%s)', (lang) => {
  const data = buildGameData(CONTENT[lang], SHARED);
  // The check uses the tea house's orders: it covers the offered levels that have such orders (the higher en grades
  // are carried by the jobs, so the check stops below them and says so).
  const levels = startOptions(data)
    .filter((o) => o.available && o.level > 0 && levelCandidates(data, o.level).length > 0)
    .map((o) => o.level);

  it('has orders of rising level, one right cup and two wrong ones each', () => {
    for (const seed of [1, 2, 3]) {
      const items = placementItems(data, seed);
      expect(items.length).toBe(levels.length * ITEMS_PER_LEVEL);
      expect(items.map((i) => i.level)).toEqual([...items.map((i) => i.level)].sort((a, b) => a - b));
      for (const it of items) {
        const o = CONTENT[lang].orders.find((x) => x.id === it.orderId)!;
        const rule = o.rule ?? data.recipes.get(o.recipe!)!.rule;
        expect(it.cups).toHaveLength(3);
        it.cups.forEach((c, i) => expect(evaluateBrew(rule, c, data.ing).outcome === 'perfect').toBe(i === it.answer));
      }
    }
  });

  it('suggests the highest level answered completely right, consecutively from the first', () => {
    const items = placementItems(data, 5);
    const right = items.map((i) => i.answer);
    expect(placementSuggestion(items, right).level).toBe(levels[levels.length - 1]);
    expect(placementSuggestion(items, items.map(() => null)).level).toBe(0);
    // first level right, second level one wrong → the first level
    const mixed = items.map((it, i) => (it.level === levels[1] && items.findIndex((x) => x.level === levels[1]) === i ? null : it.answer));
    expect(placementSuggestion(items, mixed).level).toBe(levels[0]);
    // a lucky top level after a failed first one does not count
    const lucky = items.map((it) => (it.level === levels[0] ? null : it.answer));
    expect(placementSuggestion(items, lucky).level).toBe(0);
  });
});
