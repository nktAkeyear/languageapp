/**
 * Benches of the sort and trade archetypes.
 * - Sort: a tray of letters / crates with their labels, and a cabinet of labelled cubbies. Pick a
 *   letter (tap or drag), put it in a cubby (tap or drop); tap a placed one to take it back.
 *   Hand the whole tray in to be checked; wrong ones are marked afterwards.
 * - Trade (the counter): a price board, the goods drawers, the customer's coins on the counter,
 *   the till: put the goods on the counter, count the change from the till, hand over.
 */
import { useState } from 'react';
import { wordMarkup } from '../../core/gamedata';
import { thingById } from '../../jobs/templates';
import type { SortSpec, TradeSpec } from '../../jobs/types';
import { WordText } from '../components/WordText';
import { sfx } from '../sound';
import { useGame } from '../useGame';
import { BinIcon, CoinDisc, coinsFor, ThingArt } from './art';

import type { BenchProps } from './JobScene';

// ------------------------------------------------------------------------------------- sort

export function SortBench({ task, jc, result, onSubmit }: BenchProps) {
  const spec = task.spec as SortSpec & { arch: 'sort' };
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [held, setHeld] = useState<string | null>(null);
  const bench = jc.sort!;
  const done = !!result;
  const wrong = new Set(result?.wrongItems ?? []);
  const loose = spec.items.filter((i) => !placed[i.id]);
  const put = (bin: string, item = held) => {
    if (!item || done) return;
    sfx('paper');
    setPlaced((p) => ({ ...p, [item]: bin }));
    setHeld(null);
  };
  const food = bench.item === 'food';
  return (
    <div className={`sortb sortb-${bench.item}`} data-testid="sort-bench">
      <div className="sortb-tray" aria-label="仕分ける物">
        {loose.length === 0 && !done ? <span className="hand muted small">ぜんぶ入れた。</span> : null}
        {loose.map((it) => {
          const th = it.thing ? thingById(jc, it.thing) : undefined;
          return (
            <button
              key={it.id}
              type="button"
              className={`sortb-item ${held === it.id ? 'held' : ''}`}
              draggable={!done}
              onDragStart={(e) => {
                e.dataTransfer.setData('text/plain', it.id);
                setHeld(it.id);
              }}
              onClick={() => {
                sfx('pickup');
                setHeld(held === it.id ? null : it.id);
              }}
              disabled={done}
              data-item={it.id}
              aria-pressed={held === it.id}
            >
              {food && th ? <CrateArt /> : <span className="sortb-stamp" aria-hidden />}
              <span className="sortb-label">
                <WordText text={it.text} interactive={false} />
              </span>
            </button>
          );
        })}
      </div>
      <div className="sortb-cabinet" style={{ gridTemplateColumns: `repeat(${spec.bins.length > 4 ? 3 : 2}, 1fr)` }}>
        {spec.bins.map((b) => {
          const def = bench.bins.find((x) => x.id === b)!;
          const inside = spec.items.filter((i) => placed[i.id] === b);
          return (
            <div
              key={b}
              className={`sortb-bin ${held ? 'ready' : ''}`}
              onClick={() => put(b)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                put(b, e.dataTransfer.getData('text/plain'));
              }}
              role="button"
              tabIndex={done ? -1 : 0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && put(b)}
              data-bin={b}
              aria-label={def.label}
            >
              <span className="sortb-plate">
                <BinIcon art={def.art} />
                <WordText text={def.label} interactive={false} />
              </span>
              <span className="sortb-inside">
                {inside.map((it) => (
                  <button
                    key={it.id}
                    type="button"
                    className={`sortb-placed ${done ? (wrong.has(it.id) ? 'bad' : 'good') : ''}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (done) return;
                      // Holding another letter: it goes into this cubby too.
                      if (held) {
                        put(b);
                        return;
                      }
                      sfx('pickup');
                      setPlaced((p) => {
                        const n = { ...p };
                        delete n[it.id];
                        return n;
                      });
                      setHeld(it.id);
                    }}
                    title="取り出す"
                    data-placed={it.id}
                  >
                    <WordText text={it.text} interactive={false} />
                    {done ? <span className="sortb-mark">{wrong.has(it.id) ? '✗' : '✓'}</span> : null}
                  </button>
                ))}
              </span>
            </div>
          );
        })}
      </div>
      {!done ? (
        <button type="button" className="cv-btn cv-next js-submit" disabled={loose.length > 0} onClick={() => onSubmit({ arch: 'sort', placed })} data-testid="submit">
          {loose.length ? `あと ${loose.length} つ` : '確かめてもらう'}
        </button>
      ) : null}
    </div>
  );
}

/** A closed wooden crate: what is inside is only written on its label (read it). */
function CrateArt() {
  return (
    <svg viewBox="0 0 48 40" width="44" height="36" className="crate-art" aria-hidden>
      <rect x="2" y="6" width="44" height="32" fill="#c49a5e" stroke="#5a3418" strokeWidth="2.5" />
      <path d="M2 16 H46 M2 28 H46 M14 6 V38 M34 6 V38" stroke="#8a5a2e" strokeWidth="2" />
      <rect x="10" y="14" width="28" height="12" fill="#fbf6ea" stroke="#5a3418" strokeWidth="1" />
    </svg>
  );
}

// ------------------------------------------------------------------------------------- trade

export function TradeBench({ task, jc, result, onSubmit }: BenchProps) {
  const { data } = useGame();
  const spec = task.spec as TradeSpec & { arch: 'trade' };
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [change, setChange] = useState<number[]>([]);
  const goods = jc.things.filter((t) => t.tags?.includes('counter'));
  const coins = jc.trade?.coins ?? [1, 5, 10];
  const done = !!result;
  const add = (id: string, d: number) => {
    if (done) return;
    const t = thingById(jc, id);
    sfx(d > 0 ? 'plop' : 'pickup');
    setCounts((c) => ({ ...c, [id]: Math.max(0, Math.min(t?.max ?? 9, (c[id] ?? 0) + d)) }));
  };
  const sum = change.reduce((a, b) => a + b, 0);
  const paid = coinsFor(spec.pay, [50, ...coins]);
  return (
    <div className="tradeb" data-testid="trade-bench">
      <div className="tradeb-board" aria-label="値段の黒板">
        <div className="tradeb-board-title">
          <WordText text={jc.trade?.board ?? ''} interactive={false} />
        </div>
        {goods.map((t) => (
          <div key={t.id} className="tradeb-price">
            <ThingArt art={t.art} size={30} />
            <WordText text={wordMarkup(data!, t.word)} interactive={false} />
            <span className="tradeb-dots" aria-hidden />
            <span className="tradeb-num">{t.price}</span>
          </div>
        ))}
      </div>
      <div className="tradeb-drawers" aria-label="品物">
        {goods.map((t) => (
          <div key={t.id} className="tradeb-drawer">
            <button type="button" className="tradeb-good" onClick={() => add(t.id, 1)} disabled={done} data-good={t.id} aria-label={`${data!.lex.byId.get(t.word)?.text} を出す`}>
              <ThingArt art={t.art} size={54} />
              <span className="tradeb-goodname">
                <WordText text={wordMarkup(data!, t.word)} interactive={false} />
              </span>
            </button>
            {(counts[t.id] ?? 0) > 0 ? (
              <span className="tradeb-count">
                <button type="button" className="chip-minus" onClick={() => add(t.id, -1)} disabled={done} aria-label="ひとつ戻す">
                  −
                </button>
                ×{counts[t.id]}
              </span>
            ) : null}
          </div>
        ))}
      </div>
      <div className="tradeb-counter">
        <div className="tradeb-paid">
          <span className="hand small">お客さんが出したお金</span>
          <span className="tradeb-coins">
            {paid.map((v, i) => (
              <CoinDisc key={i} v={v} size={44} />
            ))}
          </span>
        </div>
        <div className="tradeb-tray" aria-label="カウンターの上">
          {goods.flatMap((t) => Array.from({ length: counts[t.id] ?? 0 }, (_, i) => <ThingArt key={`${t.id}${i}`} art={t.art} size={54} />))}
          {!Object.values(counts).some((n) => n > 0) ? <span className="hand muted small">品物をここに出す</span> : null}
        </div>
        <div className="tradeb-till">
          <span className="hand small">レジ（おつり）</span>
          <span className="tradeb-tillcoins">
            {coins.map((v) => (
              <button key={v} type="button" className="tradeb-coin" disabled={done} onClick={() => (sfx('coin'), setChange((c) => [...c, v]))} data-coin={v}>
                <CoinDisc v={v} size={40} />
              </button>
            ))}
          </span>
          <span className="tradeb-change" data-testid="change">
            {change.map((v, i) => (
              <button key={i} type="button" className="tradeb-coin small" disabled={done} onClick={() => setChange((c) => c.filter((_, k) => k !== i))} aria-label="戻す">
                <CoinDisc v={v} size={28} />
              </button>
            ))}
            <span className="tradeb-sum">おつり {sum}</span>
          </span>
        </div>
      </div>
      {!done ? (
        <button
          type="button"
          className="cv-btn cv-next js-submit"
          disabled={!Object.values(counts).some((n) => n > 0)}
          onClick={() => onSubmit({ arch: 'trade', counts, change: sum })}
          data-testid="submit"
        >
          品物とおつりを渡す
        </button>
      ) : null}
    </div>
  );
}
