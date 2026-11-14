/*
 * Difficulty-settings simulator (part of `npm run simulate`).
 *
 *   npm run simulate -- zh 45 --start=2 --pace=slow --acc=0.7 [--adaptive=0] [--seed=3] [--legacy]
 *     One run with a simulated player of the given accuracy; one line per day.
 *   npm run simulate -- --table [--days=45] [--seeds=3]
 *     Compares settings (averaged over seeds) for both languages: stage reached on days 15/30/45,
 *     words confirmed / mastered, measured first-try accuracy, new words a day, the controller's
 *     final adjustment, story beats done and the 現在地 statement.
 *
 * The simulated player (src/activities/simPlayer.ts) serves a cup right with probability `acc`
 * (−0.15 on orders with a word new today, +0.05 on review), seals open 検証ページ with that
 * probability, buys / delivers right with that probability. "legacy" = no difficulty state at
 * all (exactly how the game planned before the settings existed).
 */
import { simulatePlayer, type SimDay, type SimOptions } from '../src/activities/simPlayer';
import type { Pace } from '../src/core/difficulty';
import type { Lang } from '../src/core/types';

function opt(args: string[], name: string): string | undefined {
  const a = args.find((x) => x.startsWith(`--${name}=`) || x === `--${name}`);
  if (!a) return undefined;
  return a.includes('=') ? a.slice(a.indexOf('=') + 1) : '1';
}

export function runDifficulty(args: string[]): void {
  if (opt(args, 'table')) return table(Number(opt(args, 'days') ?? 45), Number(opt(args, 'seeds') ?? 3));
  const pos = args.filter((a) => !a.startsWith('--'));
  const lang = (pos[0] === 'zh' ? 'zh' : 'en') as Lang;
  const days = Number(pos[1] ?? 45);
  const o: SimOptions = {
    lang,
    days,
    seed: Number(opt(args, 'seed') ?? 1),
    start: Number(opt(args, 'start') ?? 0),
    pace: (opt(args, 'pace') ?? 'normal') as Pace,
    accuracy: Number(opt(args, 'acc') ?? 0.75),
    adaptive: opt(args, 'adaptive') !== '0',
    legacy: !!opt(args, 'legacy'),
  };
  console.log(`[${lang}] start ${o.start} pace ${o.pace} acc ${o.accuracy} adaptive ${o.adaptive ? 'on' : 'off'}${o.legacy ? ' (legacy: no difficulty state)' : ''}`);
  console.log('day stage rep  cust new budget review  first-try   adj   conf mast  beats ch  plan / 現在地');
  simulatePlayer({
    ...o,
    onDay: (p, d) => {
      const reason = p.difficulty?.lastReason ? `  [${p.difficulty.lastReason}]` : '';
      console.log(
        `${String(d.day).padStart(3)} ${String(d.stage).padStart(5)} ${String(d.reputation).padStart(4)} ${String(d.customers).padStart(5)} ${String(d.newWords).padStart(3)} ${String(d.budget).padStart(6)} ${d.reviewShare.toFixed(2).padStart(6)}  ${`${d.firstTryOk}/${d.firstTry}`.padStart(9)} ${d.adj.toFixed(2).padStart(6)} ${String(d.confirmed).padStart(6)} ${String(d.mastered).padStart(4)} ${String(d.beatsDone).padStart(6)} ${String(d.chapter + 1).padStart(2)}  ${d.segments} / ${d.statement}${reason}`,
      );
    },
  });
}

interface Row {
  label: string;
  opts: Omit<SimOptions, 'lang' | 'days' | 'seed'>;
}

const ROWS: Row[] = [
  { label: 'legacy (no settings) acc .75', opts: { legacy: true, accuracy: 0.75 } },
  { label: 'ゼロ・ふつう・自動 acc .75', opts: { accuracy: 0.75 } },
  { label: 'ゼロ・ふつう・自動OFF acc .75', opts: { accuracy: 0.75, adaptive: false } },
  { label: 'legacy acc .95', opts: { legacy: true, accuracy: 0.95 } },
  { label: 'ゼロ・ふつう・自動 acc .95', opts: { accuracy: 0.95 } },
  { label: 'legacy acc .50', opts: { legacy: true, accuracy: 0.5 } },
  { label: 'ゼロ・ふつう・自動 acc .50', opts: { accuracy: 0.5 } },
  { label: 'ゼロ・ゆっくり・自動 acc .50', opts: { accuracy: 0.5, pace: 'slow' } },
  { label: 'ゼロ・速い・自動 acc .90', opts: { accuracy: 0.9, pace: 'fast' } },
  { label: 'start L1・ふつう acc .85', opts: { accuracy: 0.85, start: 1 } },
  { label: 'start L2・ふつう acc .85', opts: { accuracy: 0.85, start: 2 } },
  { label: 'start L3・ふつう acc .85', opts: { accuracy: 0.85, start: 3 } },
];

function avg(xs: number[]): number {
  return xs.reduce((s, x) => s + x, 0) / Math.max(1, xs.length);
}

function table(days: number, seeds: number): void {
  for (const lang of ['zh', 'en'] as Lang[]) {
    console.log(`\n### ${lang === 'zh' ? '中国語' : '英語'} (${days} days, mean of ${seeds} seeds)\n`);
    console.log('| setting | stage d15 / d30 / d45 | first-try acc | new words/day | confirmed d45 | mastered d45 | final adj | story beats d45 | 現在地 d45 (seed 1) |');
    console.log('|---|---|---|---|---|---|---|---|---|');
    for (const r of ROWS) {
      if (r.opts.start === 3 && lang === 'en') continue; // 英検3級 start is not offered (content ≈ 4級)
      const runs: SimDay[][] = [];
      for (let s = 1; s <= seeds; s++) runs.push(simulatePlayer({ lang, days, seed: s, ...r.opts }).days);
      const at = (d: number, f: (x: SimDay) => number) => avg(runs.map((rs) => f(rs[Math.min(rs.length, d) - 1])));
      const acc = avg(runs.map((rs) => rs.reduce((s, d) => s + d.firstTryOk, 0) / Math.max(1, rs.reduce((s, d) => s + d.firstTry, 0))));
      const nw = avg(runs.map((rs) => avg(rs.map((d) => d.newWords))));
      const st = [15, 30, days].map((d) => at(d, (x) => x.stage).toFixed(1)).join(' / ');
      console.log(
        `| ${r.label} | ${st} | ${(acc * 100).toFixed(0)}% | ${nw.toFixed(1)} | ${at(days, (x) => x.confirmed).toFixed(0)} | ${at(days, (x) => x.mastered).toFixed(0)} | ${at(days, (x) => x.adj).toFixed(2)} | ${at(days, (x) => x.beatsDone).toFixed(0)} | ${runs[0][runs[0].length - 1].statement} |`,
      );
    }
  }
}
