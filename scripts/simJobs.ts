/*
 * Jobs simulation: `npm run simulate -- --jobs [--days=20] [--acc=0.85] [--seed=1] [--yard=eiken|toeic] [--log]
 *   [--start=N | --toeic=BAND] [--tasks]` (start: 英検 level index 1 = 5級 … 7 = 1級, or a TOEIC band; --tasks lists
 *   each task's source and the rank of its material)
 * A simulated English player works through the town: before the job board opens, tea house days;
 * afterwards the days alternate — a tea house day (the market before opening, the shop, the house delivery)
 * with a second shift after closing at a workplace open in the evening, and a day at a job (rotating through
 * the offered jobs, the recommended one first) with the tea house opened after closing (shop only, from the
 * back room). `--order` = the player never shops before opening and orders by delivery when the shelf runs
 * out (the delivery fee's cost). One line per day: what was done where,
 * ranks, coins, words met / confirmed, and progress on both yardsticks. `--log` also prints every
 * task's request and the reaction (for content review).
 */
import { CONTENT, SHARED } from '../src/content';
import { buildGameData } from '../src/core/gamedata';
import { makeRng } from '../src/core/rng';
import { newProgress } from '../src/core/save';
import { endTownDay, startTownDay } from '../src/activities/day';
import { buyFromCatalogue, playJobShift, playTeaHouse } from '../src/activities/simPlayer';
import { catalogue } from '../src/renovation/engine';
import { chooseJob, jobDay, jobHasDay, jobHasEvening, jobOffered, jobsCloseDay, jobsOf, rankName, rankStatus, recommendJobs, spineSeen, teaToTown, TEAHOUSE } from '../src/jobs/engine';
import { storyAutoPlay } from '../src/story/engine';
import { pageStatus, pageWords, submitVerification } from '../src/core/verification';
import { applyStartLevel, describeChange, setDifficultyOptions } from '../src/core/difficulty';
import { yardstickReport } from '../src/curriculum/curriculum';
import { withLists } from '../src/curriculum/apply';
import { loadEnglishListsFromDisk } from '../src/curriculum/node';
import { plain } from '../src/core/gamedata';

export function runJobs(args: string[]): void {
  const opt = (k: string, d: string) => args.find((a) => a.startsWith(`--${k}=`))?.split('=')[1] ?? d;
  const days = Number(opt('days', '20'));
  const acc = Number(opt('acc', '0.85'));
  const seed = Number(opt('seed', '1'));
  const yard = opt('yard', 'eiken') as 'eiken' | 'toeic';
  const log = args.includes('--log');
  const buy = args.includes('--buy');
  const quiet = args.includes('--quiet');
  let earnedJobs = 0;
  let earnedTea = 0;
  let spent = 0;
  let allOwnedDay: number | null = null;
  loadEnglishListsFromDisk();
  const data = buildGameData(withLists(CONTENT.en), SHARED);
  const p = newProgress('en');
  setDifficultyOptions(p, { yardstick: yard });
  const startLv = Number(opt('start', '0'));
  const startToeic = Number(opt('toeic', '0'));
  const showTasks = args.includes('--tasks');
  if (startLv || startToeic) {
    const sum = applyStartLevel(data, p, startLv, { toeic: startToeic || null });
    for (const l of describeChange(data, sum)) console.log(`  ⚙ ${l}`);
    console.log(`  ⚙ stage ${p.stage}, board open ${p.jobs?.boardOpen ?? '—'}, ranks ${Object.entries(p.jobs?.jobs ?? {}).map(([id, j]) => `${id}${j.rank}`).join(' ')}`);
  }
  const rng = makeRng(seed);
  const prng = makeRng(seed * 7919 + 1);
  let rot = 0;
  let rotEve = 0;
  let teaDay = 0;
  let orders = 0;
  let fees = 0;
  const orderInstead = args.includes('--order');
  for (let d = 0; d < days; d++) {
    startTownDay(data, p, rng);
    storyAutoPlay(data, p, (b) => b.choice?.[0]?.id ?? '');
    const parts: string[] = [];
    const jd = jobDay(p);
    if (!jd) {
      const before = p.town.money;
      const t = playTeaHouse(data, p, acc, rng, prng, { orderInstead });
      earnedTea += p.town.money - before;
      orders += t.orders;
      fees += t.fees;
      parts.push(`茶房 ${t.perfect}/${t.cups}${t.orders ? ` 配達${t.orders}` : ''}`);
    } else {
      const offered = jobsOf(data).filter((j) => !j.legacy && jobOffered(p, j)).map((j) => j.id);
      const rec = recommendJobs(data, p);
      const order = [...rec, ...offered.filter((x) => !rec.includes(x))];
      // The next job (rotating, each kind of shift in turn) with day shifts / with an evening shift.
      const pickJob = (evening: boolean) => {
        const cands = order.filter((id) => {
          const j = jobsOf(data).find((x) => x.id === id)!;
          return evening ? jobHasEvening(j) : jobHasDay(j);
        });
        if (!cands.length) return null;
        const k = evening ? rotEve++ : rot++;
        return [...cands].sort()[k % cands.length];
      };
      const shift = (id: string | null) => {
        if (!id) return;
        const before = p.town.money;
        const r = playJobShift(data, p, id, acc, rng, prng);
        earnedJobs += p.town.money - before;
        if (!r) return;
        const j = jobsOf(data).find((x) => x.id === id)!;
        parts.push(`${j.nameJa} ${r.outcomes.filter((o) => o === 'perfect').length}/${r.outcomes.length}${r.rankUp ? ` ★${rankName(r.rankUp)}` : ''}`);
        if (showTasks) console.log(`      ${j.icon} ${j.id} rank ${p.jobs?.jobs[id]?.rank ?? ''}: ${r.tasks.map((t, i) => `${t.source}(r${t.rank},${t.arch})=${r.outcomes[i]}`).join(' ')}`);
        if (log) for (const t of r.texts) console.log(`      ${j.icon} ${plain(t)}`);
      };
      const tea = (label: string) => {
        const before = p.town.money;
        const t = playTeaHouse(data, p, acc, rng, prng, { orderInstead });
        earnedTea += p.town.money - before;
        orders += t.orders;
        fees += t.fees;
        parts.push(`${label} ${t.perfect}/${t.cups}${t.orders ? ` 配達${t.orders}` : ''}`);
      };
      if (teaDay++ % 2 === 0) {
        // the tea house's day, then a second shift after closing
        tea('茶房');
        teaToTown(p);
        shift(pickJob(true));
      } else {
        // a day at a job, then the tea house opened after closing
        shift(pickJob(false));
        if (!chooseJob(data, p, TEAHOUSE, rng)) tea('茶房(夜)');
      }
      jobsCloseDay(data, p);
    }
    // 検証ページ: sealed with probability acc
    for (const pg of data.content.verificationPages)
      if (pageStatus(data, p, pg) === 'available' && prng() < acc) submitVerification(data, p, pg.id, Object.fromEntries(pageWords(data, pg.id).map((w) => [w.id, w.id])));
    if (buy) for (const b of buyFromCatalogue(data, p)) {
      spent += b.price;
      parts.push(`🛠${b.id}`);
    }
    const day = p.day;
    if (buy && allOwnedDay === null && catalogue(data, p).filter((e) => e.status === 'owned' || e.status === 'ordered').length === (data.shared.renovation?.upgrades.length ?? -1)) allOwnedDay = day;
    endTownDay(p, data);
    storyAutoPlay(data, p, (b) => b.choice?.[0]?.id ?? '');
    const met = Object.values(p.words).filter((w) => w.seen > 0).length;
    const conf = Object.values(p.words).filter((w) => w.confirmed).length;
    const ranks = Object.entries(p.jobs?.jobs ?? {}).map(([id, j]) => `${id}${j.rank}`).join(' ');
    const e = yardstickReport(data, p, 'eiken').rows;
    const t = yardstickReport(data, p, 'toeic').rows;
    const pc = (x: number) => `${Math.round(x * 1000) / 10}%`;
    if (!quiet) console.log(`day ${String(day).padStart(2)} ${parts.join(' | ').padEnd(56)} 🪙${String(p.town.money).padStart(4)} met ${met} conf ${conf} | ${ranks} | 英検5級 ${pc(e[0].ratio)} 4級 ${pc(e[1].ratio)} | TOEIC〜400 ${pc(t[0].ratio)} 〜600 ${pc(t[2].ratio)}`);
  }
  const total = catalogue(data, p).reduce((a, x) => a + x.def.price, 0);
  const owned = catalogue(data, p).filter((x) => x.status === 'owned' || x.status === 'ordered').length;
  for (const j of jobsOf(data)) {
    const rs = rankStatus(data, p, j);
    const jp = p.jobs?.jobs[j.id];
    console.log(`  ${j.id.padEnd(9)} rank ${rs.rank} good ${rs.good}${rs.next ? `/${rs.next.need.good}` : ''} words ${rs.words}${rs.next ? `/${rs.next.need.words}` : ''} of ${rs.vocab} shifts ${jp?.shifts ?? 0}${j.legacy ? '' : ` spine ${Math.round(spineSeen(data, p, j, rs.rank).share * 100)}%`}`);
  }
  console.log(`\neconomy: earned ${earnedJobs} from jobs (wages, bonuses, rank rewards) + ${earnedTea} at the tea house (net of the market) in ${days} days (delivery orders ${orders}, fees ${fees}); spent ${spent} on the catalogue (${owned}/${catalogue(data, p).length} entries, ${total} coins in all${allOwnedDay ? `, all owned on day ${allOwnedDay}` : ''}); purse ${p.town.money}; ranks ${Object.entries(p.jobs?.jobs ?? {}).map(([id, j]) => `${id}${j.rank}`).join(' ')}`);
  const e = yardstickReport(data, p, 'eiken');
  console.log(`\nceilings (what the content can teach of each list): ${e.rows.map((r) => `${r.label} ${Math.round(r.ceiling * 100)}%`).join(' ')}`);
}
