/**
 * Which lexicon words a player has (very probably) met by a given shop stage, from the non-story
 * content: authored orders, template wording, recipe-book pages, reactions, symptom sentences,
 * shelf labels and the town activities (market from its unlock day, delivery likewise; higher
 * activity levels a few days later). Used by the story validator to keep every beat within the
 * vocabulary of its stage (+ at most a couple of new, inferable words) and by the simulator.
 */
import { featuresAtStage, ingredientWordId, type GameData } from '../core/gamedata';
import { tokenIds } from '../core/tokenize';

const PH = /\{([A-Za-z][A-Za-z0-9_]*)\}/g;

/** Remove `{slot}` placeholders but keep `{surface|id}` markup. */
function stripPlaceholders(text: string): string {
  return text.replace(PH, ' ');
}

/** Shop stage reached on `day` by a player who is never held back. */
export function stageOnDay(data: GameData, day: number): number {
  let s = 1;
  for (const st of data.stages) if (st.minDay <= day) s = Math.max(s, st.stage);
  return s;
}

/** First day on which a stage can open. */
export function stageMinDay(data: GameData, stage: number): number {
  return data.stages.find((s) => s.stage === stage)?.minDay ?? 1;
}

/** Walk all strings of an object tree, carrying the nearest `level` field. */
function walkStrings(o: unknown, level: number, out: { text: string; level: number }[], skipKeys: Set<string>): void {
  if (typeof o === 'string') {
    out.push({ text: o, level });
    return;
  }
  if (!o || typeof o !== 'object') return;
  if (Array.isArray(o)) {
    for (const x of o) walkStrings(x, level, out, skipKeys);
    return;
  }
  const rec = o as Record<string, unknown>;
  const lv = typeof rec.level === 'number' ? rec.level : level;
  for (const [k, v] of Object.entries(rec)) {
    if (skipKeys.has(k)) continue;
    walkStrings(v, lv, out, skipKeys);
  }
}

/** lexicon id -> first stage at which the non-story content shows it. */
export function contentWordStages(data: GameData): Map<string, number> {
  const first = new Map<string, number>();
  const add = (text: string, stage: number) => {
    for (const id of tokenIds(data.tokens(stripPlaceholders(text)))) {
      const prev = first.get(id);
      if (prev === undefined || stage < prev) first.set(id, stage);
    }
  };
  const addId = (id: string | undefined, stage: number) => {
    if (!id) return;
    const prev = first.get(id);
    if (prev === undefined || stage < prev) first.set(id, stage);
  };
  const c = data.content;
  for (const o of c.orders) add(o.text, o.stage);
  for (const t of c.templates) add(t.text, t.stage);
  for (const pg of c.pages) for (const t of [pg.title, ...pg.lines.map((l) => l.text)]) add(t, pg.stage);
  for (const r of c.reactions) add(r.text, r.stage);
  for (const s of data.stages) for (const ing of s.ingredients) addId(ingredientWordId(data, ing), s.stage);
  for (const r of data.shared.recipes) {
    const name = c.recipeNames[r.id];
    if (name) add(name, r.stage);
    for (const sym of r.symptoms ?? []) for (const ph of c.symptoms.find((x) => x.symptom === sym)?.phrases ?? []) add(ph, r.stage);
  }
  const maxStage = data.stages[data.stages.length - 1]?.stage ?? 1;
  for (let s = 1; s <= maxStage; s++) {
    const f = featuresAtStage(data, s);
    if (f.has('temperature')) Object.values(c.temperatureWords).forEach((id) => addId(id, s));
    if (f.has('method')) Object.values(c.methodWords).forEach((id) => addId(id, s));
  }
  // Town: market / delivery text from the stage of their unlock day; level n about 2·minRuns days later.
  const town = c.town;
  const ts = data.shared.town;
  if (town && ts) {
    const skip = new Set(['recipients', 'id', 'kind', 'face', 'name', 'avatar', 'goods', 'placeWords', 'personWords', 'periodWords']);
    const marketStage = stageOnDay(data, ts.market.unlock.minDay);
    const deliveryStage = stageOnDay(data, ts.delivery.unlock.minDay);
    const shelfStage = new Map<string, number>();
    for (const s of data.stages) for (const ing of s.ingredients) shelfStage.set(ing, s.stage);
    // A good's name / quantity phrases are seen once it is on the shelf (the note asks only for those).
    for (const g of town.market.goods) {
      const strings: { text: string; level: number }[] = [];
      walkStrings(g, 1, strings, new Set(['ingredient']));
      for (const st of strings) add(st.text, Math.max(marketStage, shelfStage.get(g.ingredient) ?? marketStage));
    }
    for (const id of Object.values(town.colourWords)) addId(id, marketStage);
    for (const m of [town.delivery.placeWords, town.delivery.personWords, town.delivery.periodWords])
      for (const id of Object.values(m)) addId(id, deliveryStage);
    const acts: [unknown, { minDay: number }, { level: number; minRuns: number }[]][] = [
      [town.market, ts.market.unlock, ts.market.levels],
      [town.delivery, ts.delivery.unlock, ts.delivery.levels],
    ];
    for (const [text, unlock, levels] of acts) {
      const strings: { text: string; level: number }[] = [];
      walkStrings(text, 1, strings, skip);
      for (const st of strings) {
        const lv = levels.find((l) => l.level === st.level);
        const day = unlock.minDay + 2 * (lv?.minRuns ?? 0);
        add(st.text, stageOnDay(data, day));
      }
    }
    // Small numbers in prices are heard at the market from its first day.
    for (const [n, t] of Object.entries(town.numberText)) if (Number(n) <= 10) add(t, stageOnDay(data, ts.market.unlock.minDay));
  }
  return first;
}
