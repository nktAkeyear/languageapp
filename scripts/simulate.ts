/*
 * Content-author helper: simulate a player for N days and print every segment of each day:
 * market (shopping note, vendor talk), shop orders + reactions, deliveries (slip + reaction).
 *   npm run simulate -- [en|zh] [days] [seed] [failEvery] [choice]
 * Story beats are printed as they fire (📖); `choice` = which option the player picks in story
 * choices (0 = the first, default; n picks option n mod count).
 * `buy` (6th argument) = the player orders from the renovation catalogue after the shop closes:
 * every affordable entry in catalogue order while keeping coins for the market (🛠 lines, and an
 * economy summary at the end). Without it nothing is bought.
 * The simulated player solves everything correctly, except every `failEvery`-th customer gets a
 * deliberately wrong cup, every `failEvery`-th market buys one unit too few, and every
 * `failEvery`-th delivery goes to the wrong house — so failure reactions and consequences show up.
 */
import { currentSegment, describeDay, endTownDay, nextSegment, serveInTown, startTownDay, stockOf } from '../src/activities/day';
import { solveDelivery } from '../src/activities/delivery/engine';
import { finishMarket, solveMarket } from '../src/activities/market/engine';
import { currentOrder, nextCustomer } from '../src/activities/shop/engine';
import { witnessBrew } from '../src/activities/shop/rules';
import { CONTENT, SHARED } from '../src/content';
import { buildGameData, ingredientsAtStage, plain } from '../src/core/gamedata';
import { makeRng } from '../src/core/rng';
import { newProgress } from '../src/core/save';
import type { Brew, IngredientId, Lang } from '../src/core/types';
import { storySync } from '../src/story/engine';
import { storyLog } from './storyLog';
import { arrivedToday, catalogue, renoOrder, renoShared } from '../src/renovation/engine';

const [langArg = 'en', daysArg = '10', seedArg = '1', failArg = '4', choiceArg = '0', buyArg = ''] = process.argv.slice(2);
const buy = buyArg === 'buy';
const bought: { day: number; id: string; price: number }[] = [];
let earned = 0;
const lang = (langArg === 'zh' ? 'zh' : 'en') as Lang;
const data = buildGameData(CONTENT[lang], SHARED);
const p = newProgress(lang);
const rng = makeRng(Number(seedArg));
const failEvery = Number(failArg);
let n = 0;
let markets = 0;
let deliveries = 0;
for (let d = 0; d < Number(daysArg); d++) {
  startTownDay(data, p, rng);
  console.log(
    `\n[${lang}] day ${p.day}  stage ${p.stage}  rep ${p.reputation}  coins ${p.town.money}  plan: ${describeDay(p)}  new words: ${p.today!.newWords.join(' ') || '-'}`,
  );
  for (const note of p.townDay!.notes) console.log(`  ※ ${note}`);
  for (const id of arrivedToday(p)) console.log(`  🛠 arrived: ${id}`);
  const moneyAtStart = p.town.money;
  storyLog(data, p, Number(choiceArg));
  for (;;) {
    const seg = currentSegment(p);
    if (seg === 'market') {
      const md = p.townDay!.market!;
      const short = failEvery > 0 && ++markets % failEvery === 0;
      console.log(`  🧺 market (level ${md.level}${md.features.length ? ': ' + md.features.join(',') : ''})  note: ${plain(md.title)} ${md.lines.map((l) => plain(l.text)).join(' ')} ${md.tips.map(plain).join(' ')}`);
      solveMarket(data, p, rng, { shortBy: short ? 1 : 0 });
      for (const s of md.stalls) if (s.soldOut.length) console.log(`     (sold out at ${s.id}: ${s.soldOut.join(',')})`);
      finishMarket(data, p);
      const st = p.townDay!.stock;
      console.log(`     bought: ${md.basket.map((b) => `${b.good}${b.variant ? '/' + b.variant : ''}×${b.units}=${b.paid}`).join(', ') || '-'}  stock: ${JSON.stringify(st)}${short ? '  (bought one unit short)' : ''}`);
    } else if (seg === 'shop') {
      while (p.today!.phase !== 'closed') {
        const o = currentOrder(p)!;
        const fail = failEvery > 0 && ++n % failEvery === 0;
        const shelf = new Set(ingredientsAtStage(data, p.stage).filter((i) => stockOf(p, i as IngredientId) !== 0));
        const brew: Brew = fail
          ? { counts: { salt: 1, mint: 4 }, temp: null, method: null }
          : (witnessBrew(o.rule, shelf, data.ing) ?? { counts: { water: 1 }, temp: null, method: null });
        const r = serveInTown(data, p, brew, rng)!;
        const flags = `${o.audioOnly ? '🔊' : '  '}${o.returning ? '↩' : ' '}`;
        console.log(`  ${flags} ${plain(o.text).padEnd(50)} -> ${r.evaluation.outcome.padEnd(7)} ${plain(r.reaction.text)}`);
        storyLog(data, p, Number(choiceArg));
        nextCustomer(data, p);
      }
      if (buy) {
        const keep = renoShared(data)?.keepForMarket ?? 0;
        for (const e of catalogue(data, p))
          if (e.status === 'available' && p.town.money - e.def.price >= keep && !renoOrder(data, p, e.def.id)) {
            bought.push({ day: p.day, id: e.def.id, price: e.def.price });
            console.log(`  🛠 ordered ${e.def.id} (${e.def.price})  coins left ${p.town.money}`);
          }
      }
    } else {
      const x = p.townDay!.delivery!;
      const wrong = failEvery > 0 && ++deliveries % failEvery === 0;
      solveDelivery(data, p, rng, wrong ? 'place' : 'none');
      const who = CONTENT[lang].town!.delivery.recipients.find((r) => r.id === x.slip.recipient)?.name;
      console.log(`  📦 delivery (level ${x.level}) to ${who}: ${x.slip.lines.map((l) => plain(l.text)).join(' ')}  [${x.slip.rule.place}${x.slip.home ? '' : ', nobody home'}]`);
      storySync(data, p);
      console.log(`     -> ${x.result!.outcome.padEnd(7)} ${plain(x.result!.reaction)}${wrong ? '  (went to the wrong house)' : ''}`);
      storyLog(data, p, Number(choiceArg));
    }
    if (!p.townDay || p.townDay.seg >= p.townDay.segments.length - 1) break;
    nextSegment(p);
  }
  earned += p.town.money - moneyAtStart + bought.filter((b) => b.day === p.day).reduce((a, b) => a + b.price, 0);
  endTownDay(p, data);
  storyLog(data, p, Number(choiceArg));
}
if (buy) {
  const all = renoShared(data)?.upgrades ?? [];
  const total = all.reduce((a, u) => a + u.price, 0);
  console.log(`\n🛠 economy: earned (net of market) ${earned} coins in ${daysArg} days; catalogue ${all.length} entries, ${total} coins`);
  console.log(`   bought ${bought.length}/${all.length} (${bought.reduce((a, b) => a + b.price, 0)} coins): ${bought.map((b) => `d${b.day} ${b.id}`).join(', ')}`);
  const missing = all.filter((u) => !bought.some((b) => b.id === u.id)).map((u) => u.id);
  if (missing.length) console.log(`   not bought: ${missing.join(', ')}`);
  console.log(`   purse at the end: ${p.town.money}, reputation ${p.reputation}, stage ${p.stage}`);
}
