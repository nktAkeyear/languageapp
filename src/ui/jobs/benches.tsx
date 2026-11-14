/**
 * Benches of the sort and trade archetypes, drawn as the workplace's own furniture.
 * - Sort: the things to sort lie on the counter (letters as envelopes, crates with their labels, bags with luggage
 *   tags); the places are drawn on the wall (the post office's pigeon-hole cabinet with brass name plates, the
 *   kitchen's cold box / shelf / basket …, the inn's floors and rooms). Drag a piece onto its place, or tap it and
 *   tap the place; tap a placed piece to take it back. Hand in the whole lot to be checked.
 * - Trade (the post office counter): the price board and the postage rate card on the wall, the goods drawers,
 *   the letter scale with the customer's parcel, the customer's coins on the brass tray, the till. Put the goods
 *   on the mat, weigh the parcel and tap the postage on the rate card, count the change from the till.
 */
import { useState } from 'react';
import { wordMarkup } from '../../core/gamedata';
import { thingById } from '../../jobs/templates';
import type { SortSpec, TradeSpec } from '../../jobs/types';
import { WordText } from '../components/WordText';
import { sfx } from '../sound';
import { useGame } from '../useGame';
import { CoinDisc, coinsFor, ThingArt } from './art';
import { useDragDrop } from './drag';
import { BinArt, Envelope, ParcelArt, ScaleArt, TillArt } from './furniture';
import type { BenchProps } from './JobScene';

// ------------------------------------------------------------------------------------- sort

export function SortBench({ task, jc, result, onSubmit }: BenchProps) {
  const spec = task.spec as SortSpec & { arch: 'sort' };
  const [placed, setPlaced] = useState<Record<string, string>>({});
  const [held, setHeld] = useState<string | null>(null);
  const [landed, setLanded] = useState<string | null>(null);
  const bench = jc.sort!;
  const done = !!result;
  const wrong = new Set(result?.wrongItems ?? []);
  const loose = spec.items.filter((i) => !placed[i.id]);
  const put = (bin: string, item = held) => {
    if (!item || done) return;
    sfx('paper');
    setPlaced((p) => ({ ...p, [item]: bin }));
    setHeld(null);
    setLanded(bin);
    window.setTimeout(() => setLanded((b) => (b === bin ? null : b)), 450);
  };
  const { drag, zone, start } = useDragDrop<string>((item, z) => z.startsWith('bin:') && put(z.slice(4), item), !done);
  const kind = bench.item;
  const draggedItem = drag ? spec.items.find((i) => i.id === drag.item) : null;
  const cols = spec.bins.length <= 3 ? spec.bins.length : spec.bins.length === 4 ? 4 : 3;
  return (
    <div className={`sortb sortb-${kind}`} data-testid="sort-bench">
      <div className={`sortb-cabinet cab-${kind}`} style={{ ['--cols' as string]: cols }}>
        {spec.bins.map((b) => {
          const def = bench.bins.find((x) => x.id === b)!;
          const inside = spec.items.filter((i) => placed[i.id] === b);
          return (
            <div
              key={b}
              ref={zone(`bin:${b}`)}
              className={`sortb-bin ${held ? 'ready' : ''} ${drag?.over === `bin:${b}` ? 'over' : ''} ${landed === b ? 'landed' : ''}`}
              onClick={() => put(b)}
              role="button"
              tabIndex={done ? -1 : 0}
              onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && put(b)}
              data-bin={b}
              aria-label={def.label}
            >
              <span className="sortb-hole">
                <BinArt id={b} art={def.art} size={kind === 'letter' ? 44 : 58} />
                <span className="sortb-inside">
                  {inside.map((it) => (
                    <button
                      key={it.id}
                      type="button"
                      className={`sortb-placed ${done ? (wrong.has(it.id) ? 'bad' : 'good') : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (done) return;
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
              </span>
              <span className="sortb-plate">
                <WordText text={def.label} interactive={false} />
              </span>
            </div>
          );
        })}
      </div>
      <div className="sortb-tray" aria-label="仕分ける物">
        {loose.length === 0 && !done ? <span className="hand muted small sortb-empty">ぜんぶ入れた。</span> : null}
        {loose.map((it, k) => (
          <button
            key={it.id}
            type="button"
            className={`sortb-item ${held === it.id ? 'held' : ''} ${drag?.item === it.id ? 'dragging' : ''}`}
            style={{ ['--tilt' as string]: `${((k * 37) % 9) - 4}deg` }}
            onPointerDown={(e) => start(it.id, e)}
            onClick={() => {
              if (done) return;
              sfx('pickup');
              setHeld(held === it.id ? null : it.id);
            }}
            disabled={done}
            data-item={it.id}
            aria-pressed={held === it.id}
          >
            <SortPiece kind={kind} text={it.text} tone={k} />
          </button>
        ))}
      </div>
      {draggedItem && drag ? (
        <div className="drag-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden>
          <SortPiece kind={kind} text={draggedItem.text} tone={0} />
        </div>
      ) : null}
      {!done ? (
        <button type="button" className="cv-btn cv-next js-submit" disabled={loose.length > 0} onClick={() => onSubmit({ arch: 'sort', placed })} data-testid="submit">
          {loose.length ? `あと ${loose.length} つ` : '確かめてもらう'}
        </button>
      ) : null}
    </div>
  );
}

/** One piece to sort, drawn as what it is: a letter, a crate with its label, a bag with a luggage tag. */
function SortPiece({ kind, text, tone }: { kind: string; text: string; tone: number }) {
  if (kind === 'letter')
    return (
      <Envelope tone={tone}>
        <WordText text={text} interactive={false} />
      </Envelope>
    );
  if (kind === 'food')
    return (
      <span className="crate">
        <span className="crate-label">
          <WordText text={text} interactive={false} />
        </span>
      </span>
    );
  if (kind === 'parcel')
    return (
      <span className="suitcase" style={{ ['--case' as string]: ['#7a4a2e', '#3d5c7e', '#5a6a3a', '#8a3a2e'][tone % 4] }}>
        <span className="suitcase-tag">
          <WordText text={text} interactive={false} />
        </span>
      </span>
    );
  return (
    <span className="folder">
      <WordText text={text} interactive={false} />
    </span>
  );
}

// ------------------------------------------------------------------------------------- trade

export function TradeBench({ task, jc, result, onSubmit }: BenchProps) {
  const { data } = useGame();
  const spec = task.spec as TradeSpec & { arch: 'trade' };
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [change, setChange] = useState<number[]>([]);
  const [weighed, setWeighed] = useState(false);
  /** The rate-card cell tapped (destination:band) and its postage. */
  const [post, setPost] = useState<{ key: string; v: number } | null>(null);
  const goods = jc.things.filter((t) => t.tags?.includes('counter'));
  const coins = jc.trade?.coins ?? [1, 5, 10];
  const rates = jc.trade?.rates;
  const done = !!result;
  const add = (id: string, d: number) => {
    if (done) return;
    const t = thingById(jc, id);
    sfx(d > 0 ? 'drawer' : 'pickup');
    setCounts((c) => ({ ...c, [id]: Math.max(0, Math.min(t?.max ?? 9, (c[id] ?? 0) + d)) }));
  };
  const sum = change.reduce((a, b) => a + b, 0);
  const paid = coinsFor(spec.pay, [50, ...coins]);
  const anyGoods = Object.values(counts).some((n) => n > 0);
  const ready = (anyGoods || !!spec.post) && (!spec.post || (weighed && !!post));
  return (
    <div className={`tradeb ${spec.post ? 'with-post' : ''}`} data-testid="trade-bench">
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
      {rates && spec.post ? (
        <div className="ratecard" aria-label="料金表">
          <div className="ratecard-title">
            <WordText text={rates.title} interactive={false} />
          </div>
          <div className="ratecard-grid" style={{ gridTemplateColumns: `auto repeat(${rates.bands.length}, 1fr)` }}>
            <span />
            {rates.bands.map((b) => (
              <span key={b.upTo} className="ratecard-band">
                <WordText text={b.label} interactive={false} />
              </span>
            ))}
            {rates.dests.map((d, di) => (
              <div key={d.id} style={{ display: 'contents' }}>
                <span className="ratecard-dest">
                  <WordText text={d.label} interactive={false} />
                </span>
                {rates.bands.map((b, bi) => {
                  const v = rates.price[di][bi];
                  const key = `${d.id}:${b.upTo}`;
                  const on = post?.key === key;
                  const right = done && spec.post?.dest === d.id && b.upTo === rates.bands.find((x) => spec.post!.kilos <= x.upTo)?.upTo;
                  return (
                    <button
                      key={b.upTo}
                      type="button"
                      className={`ratecard-cell ${on ? 'on' : ''} ${right ? 'right' : ''}`}
                      disabled={done || !weighed}
                      onClick={() => {
                        sfx('stamp');
                        setPost(on ? null : { key, v });
                      }}
                      data-rate={`${d.id}:${b.upTo}`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      ) : null}
      <div className="tradeb-drawers" aria-label="品物の引き出し">
        {goods.map((t) => (
          <button key={t.id} type="button" className="tradeb-drawer" onClick={() => add(t.id, 1)} disabled={done} data-good={t.id} aria-label={`${data!.lex.byId.get(t.word)?.text} を出す`}>
            <span className="tradeb-drawer-face">
              <span className="tradeb-plate">
                <ThingArt art={t.art} size={34} />
                <WordText text={wordMarkup(data!, t.word)} interactive={false} />
              </span>
              <span className="tradeb-knob" aria-hidden />
            </span>
          </button>
        ))}
      </div>
      <div className="tradeb-mat" aria-label="カウンターの上">
        {goods.flatMap((t) =>
          Array.from({ length: counts[t.id] ?? 0 }, (_, i) => (
            <button key={`${t.id}${i}`} type="button" className="tradeb-onmat" onClick={() => add(t.id, -1)} disabled={done} title="ひとつ戻す" data-counter-good={t.id}>
              <ThingArt art={t.art} size={58} />
            </button>
          )),
        )}
        {!anyGoods ? <span className="hand muted small">引き出しから品物を出す</span> : null}
      </div>
      {spec.post ? (
        <div className="tradeb-scale">
          <button
            type="button"
            className={`tradeb-parcel ${weighed ? 'on-scale' : ''}`}
            onClick={() => {
              if (done) return;
              sfx(weighed ? 'pickup' : 'plop');
              setWeighed(!weighed);
              if (weighed) setPost(null);
            }}
            disabled={done}
            data-testid="scale"
            aria-label="小包をはかりにのせる"
          >
            <ParcelArt size={110} stamps={post ? Math.max(1, Math.ceil(post.v / 4)) : 0} />
          </button>
          <span className="tradeb-scale-art">
            <ScaleArt kilos={weighed ? spec.post.kilos : null} />
            <span className="tradeb-dial" data-testid="scale-reading">
              {weighed ? `${spec.post.kilos} kg` : ''}
            </span>
          </span>
          {post ? <span className="tradeb-postage">+ {post.v}</span> : null}
        </div>
      ) : null}
      <div className="tradeb-counter">
        <div className="tradeb-paid">
          <span className="hand small">お客さんが出したお金</span>
          <span className="tradeb-coins">
            {paid.map((v, i) => (
              <CoinDisc key={i} v={v} size={44} />
            ))}
          </span>
        </div>
        <div className="tradeb-till">
          <span className="tradeb-till-art">
            <TillArt />
          </span>
          <span className="tradeb-tillcoins">
            {coins.map((v) => (
              <button key={v} type="button" className="tradeb-coin" disabled={done} onClick={() => (sfx('coin'), setChange((c) => [...c, v]))} data-coin={v} aria-label={`${v} の硬貨をおつりに`}>
                <CoinDisc v={v} size={46} />
              </button>
            ))}
          </span>
          <span className="tradeb-change" data-testid="change">
            <span className="tradeb-dish" aria-hidden />
            {change.map((v, i) => (
              <button key={i} type="button" className="tradeb-coin small" disabled={done} onClick={() => setChange((c) => c.filter((_, k) => k !== i))} aria-label="戻す">
                <CoinDisc v={v} size={30} />
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
          disabled={!ready}
          onClick={() => onSubmit({ arch: 'trade', counts, change: sum, ...(spec.post ? { postage: post?.v ?? 0 } : {}) })}
          data-testid="submit"
        >
          {spec.post && !weighed ? '小包をはかりにのせる' : spec.post && !post ? '料金表で郵便料金を選ぶ' : '品物とおつりを渡す'}
        </button>
      ) : null}
    </div>
  );
}
