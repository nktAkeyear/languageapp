/**
 * Pieces of every Back room: the shelf (every item, a large count, a bar that is empty at 0, +N for what came in
 * today), the day's summary paper after closing, and the desk (order form, receipts on the nail, the market door,
 * the framed town map).
 */
import { catalogFor, goRoom, shelfItems } from '../logic/day';
import { HarbourArt, ItemArt } from './art';
import { Icon, Words } from './bits';
import { Receipts } from './frame';
import { useGame, useS } from './store';

export function Shelf() {
  const s = useS();
  const { data, openOrder, openWord } = useGame();
  const wp = s.day.workplace;
  const items = shelfItems(data, s);
  const today: Record<string, number> = {};
  for (const a of s.arrived) if (a.workplace === wp && a.day === s.day.day) for (const l of a.lines) today[l.id] = (today[l.id] ?? 0) + l.portions;
  const max = Math.max(8, ...items.map((it) => s.stock[wp][it.id] ?? 0));
  return (
    <section className={`shelf shelf-${wp} ${items.length > 10 ? 'shelf-many' : ''}`} aria-label="棚">
      <h2 className="ja-label shelf-title">棚（数は残りの回数）</h2>
      <ul className="shelf-grid">
        {items.map((it) => {
          const n = s.stock[wp][it.id] ?? 0;
          const word = data.lex.byId.get(it.word)?.text ?? it.id;
          return (
            <li key={it.id} className={`shelf-item ${n <= 0 ? 'out' : n <= 2 ? 'low' : ''}`}>
              <button
                onClick={() => openOrder(n <= 0 ? { [it.id]: 1 } : {})}
                onContextMenu={(e) => {
                  e.preventDefault();
                  openWord(it.word);
                }}
                aria-label={`${word} 残り${n}${n <= 0 ? '・注文する' : ''}`}
              >
                <span className="si-art">
                  <ItemArt id={it.id} empty={n <= 0} />
                </span>
                <span className={`si-word ${word.length > 10 ? 'long' : ''}`} lang="en">
                  {word}
                </span>
                <span className="si-count">{n}</span>
                <span className="si-bar" aria-hidden>
                  <i style={{ transform: `scaleX(${Math.min(1, n / max)})` }} />
                </span>
                {today[it.id] ? <span className="plus plus-static">+{today[it.id]}</span> : null}
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** After closing: one paper with the day (no per-answer marks: who came, what it earned, what was used). */
export function Summary() {
  const s = useS();
  const { data } = useGame();
  const t = s.tally;
  const wp = s.day.workplace;
  const cat = catalogFor(data, wp);
  const name = (id: string) => data.lex.byId.get(cat.find((c) => c.id === id)?.word ?? '')?.text ?? id;
  const diff = s.p.town.money - t.moneyStart;
  const used = Object.entries(t.used).filter(([, n]) => n > 0);
  const bought = Object.entries(t.bought).filter(([, n]) => n > 0);
  const shift = s.p.jobs?.day?.shift;
  const rankUp = wp === 'clinic' ? shift?.rankUp : null;
  return (
    <section className="reading reading-paper summary" aria-label="今日の帳面">
      <div className="reading-who">
        <span className="ja-label">{s.day.day}日目の帳面</span>
      </div>
      <dl className="sum-grid">
        <dt>{wp === 'clinic' ? '受け付けた仕事' : 'お客さん'}</dt>
        <dd>{t.served}</dd>
        <dt>お金</dt>
        <dd>
          {t.moneyStart} → <b>{s.p.town.money}</b> <span className="ja-label">（{diff >= 0 ? '+' : ''}{diff}）</span>
        </dd>
        {t.fees ? (
          <>
            <dt>配送費</dt>
            <dd>{t.fees}</dd>
          </>
        ) : null}
      </dl>
      {used.length ? (
        <div className="sum-list">
          <span className="ja-label">使った</span>
          <ul>
            {used.map(([id, n]) => (
              <li key={id}>
                <span lang="en">{name(id)}</span> −{n}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {bought.length ? (
        <div className="sum-list">
          <span className="ja-label">入った</span>
          <ul>
            {bought.map(([id, n]) => (
              <li key={id}>
                <span lang="en">{name(id)}</span> +{n}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {shift?.endLine && wp === 'clinic' ? (
        <p className="sum-line">
          <Words text={shift.endLine} />
        </p>
      ) : null}
      {rankUp ? <p className="sum-rank">位が上がった：新しい仕事が来るようになる。</p> : null}
      <p className="ja-label sum-next">棚の品は明日もそのまま。足りない品は、注文書（明日の朝に届く）か市場で。</p>
    </section>
  );
}

/** On the wall: the framed town map and (tea house) the market basket on its hook. */
export function WallObjects({ market = false }: { market?: boolean }) {
  const s = useS();
  const { act } = useGame();
  const part = s.day.part;
  const canLeave = part !== 1;
  return (
    <div className="wall-objs">
      <button className="wall-obj map-frame" disabled={!canLeave} onClick={() => act((st) => void goRoom(st, 'town'))} id="to-town">
        <span className="frame-art" aria-hidden>
          <HarbourArt />
        </span>
        <span className="wall-cap">
          <b>町へ</b>
          <span className="ja-label">{part === 0 ? '今日ほかで働く' : part === 2 ? '明日の職場を選ぶ' : '業務中は出られない'}</span>
        </span>
      </button>
      {market ? (
        <button className="wall-obj basket-hook" disabled={!canLeave} onClick={() => act((st) => void goRoom(st, 'market'))} id="to-market">
          <span className="hook-art" aria-hidden>
            <Icon name="basket" size={56} />
          </span>
          <span className="wall-cap">
            <b>市場へ</b>
            <span className="ja-label">{canLeave ? '自分で買えば安い' : '業務中は行けない'}</span>
          </span>
        </button>
      ) : null}
    </div>
  );
}

/** On the desk: the order form (paper) and the receipts of what is on its way. */
export function DeskObjects({ market = false, wall = true }: { market?: boolean; wall?: boolean }) {
  const s = useS();
  const { openOrder, layout } = useGame();
  const part = s.day.part;
  return (
    <div className={`desk desk-${layout}`}>
      <button className="desk-obj order-pad" onClick={() => openOrder()} id="order-form">
        <Icon name="form" size={30} />
        <span>
          <b lang="en">Order form</b>
          <b className="ja-sub">注文書</b>
          <span className="ja-label">{part === 2 ? '明日の朝に届く' : '配達・すぐ届く・配送費あり'}</span>
        </span>
      </button>
      {!wall ? <WallObjects market={market} /> : null}
      <Receipts />
    </div>
  );
}
