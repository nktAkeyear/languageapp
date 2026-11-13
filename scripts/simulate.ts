/*
 * Content-author helper: simulate a player for N days and print every order and reaction.
 *   npm run simulate -- [en|zh] [days] [seed] [failEvery]
 * The simulated player brews a minimal correct answer, except every `failEvery`-th customer
 * (default 4) gets a deliberately wrong cup, so failure reactions and returning customers show up.
 */
import { currentOrder, endDay, nextCustomer, serve, startDay } from '../src/activities/shop/engine';
import { witnessBrew } from '../src/activities/shop/rules';
import { CONTENT, SHARED } from '../src/content';
import { buildGameData, ingredientsAtStage, plain } from '../src/core/gamedata';
import { makeRng } from '../src/core/rng';
import { newProgress } from '../src/core/save';
import type { Brew, Lang } from '../src/core/types';

const [langArg = 'en', daysArg = '10', seedArg = '1', failArg = '4'] = process.argv.slice(2);
const lang = (langArg === 'zh' ? 'zh' : 'en') as Lang;
const data = buildGameData(CONTENT[lang], SHARED);
const p = newProgress(lang);
const rng = makeRng(Number(seedArg));
const failEvery = Number(failArg);
let n = 0;
for (let d = 0; d < Number(daysArg); d++) {
  startDay(data, p, rng);
  console.log(`\n[${lang}] day ${p.day}  stage ${p.stage}  rep ${p.reputation}  new words: ${p.today!.newWords.join(' ') || '-'}`);
  while (p.today!.phase !== 'closed') {
    const o = currentOrder(p)!;
    const fail = failEvery > 0 && ++n % failEvery === 0;
    const brew: Brew = fail
      ? { counts: { salt: 1, mint: 4 }, temp: null, method: null }
      : witnessBrew(o.rule, new Set(ingredientsAtStage(data, p.stage)), data.ing)!;
    const r = serve(data, p, brew, rng)!;
    const flags = `${o.audioOnly ? '🔊' : '  '}${o.returning ? '↩' : ' '}`;
    console.log(`  ${flags} ${plain(o.text).padEnd(50)} -> ${r.evaluation.outcome.padEnd(7)} ${plain(r.reaction.text)}`);
    nextCustomer(data, p);
  }
  endDay(p);
}
