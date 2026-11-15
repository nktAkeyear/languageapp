/**
 * The workplace as ONE drawn place (tea house counter / clinic reception desk). Everything is laid out in fixed
 * design units on a stage that is scaled to fit the window — desktop 1600×940, phone 400×820; centred across, held at
 * the top, so height left over below reads as more counter / desk — so the room is a
 * picture and the things in it (jars with their counts, the order pad, the basket, the door sign, the papers) stay
 * in the same place all day. 始業前 / 業務中 / 業務後 are states of this one picture: the sign, the light, who stands
 * at the counter, the paper lying on it.
 *
 * This file has the stage, the light, and the objects both workplaces share: the door sign, the order pad with the
 * receipts on its spike, the crate that arrives, the town map on the wall, the market basket, the day's note, the
 * summary card, the speech bubble and the stock badge.
 */
import { useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { BasketArt } from '../../ui/art/town';
import { skyAt, type SkyColours } from '../../ui/art/sky';
import { catalogFor, endDay, goRoom, openWork, closeWork, workDone } from '../logic/day';
import type { V2State } from '../logic/state';
import type { WorkplaceId } from '../logic/catalog';
import { CrateArt, TownMapArt } from './art';
import { Icon, ListenButton, Words } from './bits';
import { useGame, useS } from './store';

export type Box = [x: number, y: number, w: number, h: number];

export const SIZE = { desk: { w: 1600, h: 940 }, phone: { w: 400, h: 820 } } as const;

/** Absolutely placed piece of the stage, in design units. */
export function At({ box, className, children, style, label }: { box: Box; className?: string; children?: ReactNode; style?: CSSProperties; label?: string }) {
  const [x, y, w, h] = box;
  return (
    <div className={`at ${className ?? ''}`} style={{ left: x, top: y, width: w, height: h, ...style }} aria-label={label}>
      {children}
    </div>
  );
}

/** The stage: fixed design size, scaled to fit its box, centred. */
export function Stage({ w, h, className, children }: { w: number; h: number; className?: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [k, setK] = useState(0.8);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) setK(Math.min(r.width / w, r.height / h));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h]);
  return (
    <div className={`stage-fit ${className ?? ''}`} ref={ref}>
      <div className="stage-box" style={{ width: w, height: h, transform: `translateX(-50%) scale(${k})`, ['--k' as string]: k }}>
        {children}
      </div>
    </div>
  );
}

/** The light of the moment: morning before opening, moving through the day while open, evening after closing. */
export function skyFor(s: V2State): SkyColours {
  if (s.day.part === 0) return skyAt(0.02);
  if (s.day.part === 2) return skyAt(1);
  if (s.day.workplace === 'teahouse') {
    const t = s.p.today;
    if (!t || t.phase === 'closed') return skyAt(0.92);
    return skyAt(0.08 + (0.8 * t.index) / Math.max(1, t.queue.length - 1));
  }
  const sh = s.p.jobs?.day?.shift;
  if (!sh) return skyAt(0.5);
  return skyAt(0.08 + (0.8 * sh.index) / Math.max(1, sh.tasks.length - 1));
}

/** Light over the whole picture: a cool morning, a warm working day, dusk with the lamp lit after closing. */
export function Light({ part, lamp, lampAt }: { part: number; lamp: number; lampAt: [number, number] }) {
  return (
    <>
      <div className={`light light-${part}`} aria-hidden />
      <div className="lamp-glow" style={{ left: lampAt[0], top: lampAt[1], opacity: part === 2 ? 1 : lamp * 0.6 }} aria-hidden />
    </>
  );
}

// ------------------------------------------------------------------------------------------------ the door sign

/**
 * The card on the door / hatch. 始業前: 準備中 — flipping it opens. 業務中: 営業中 — once the last person has gone,
 * flipping it closes. 業務後: 準備中 again.
 */
export function DoorSign({ box, open: openWord = '営業中' }: { box: Box; open?: string }) {
  const s = useS();
  const { act } = useGame();
  const part = s.day.part;
  const done = part === 1 && workDone(s);
  const live = part === 0 || done;
  const text = part === 1 ? openWord : '準備中';
  const help = part === 0 ? '札を返して開ける' : done ? '札を返して閉める' : null;
  return (
    <At box={box} className="door-sign-at">
      <button
        className={`door-sign ${part === 1 ? 'is-open' : 'is-closed'} ${live ? 'live' : ''}`}
        id={part === 0 ? 'open-shop' : done ? 'close-shop' : undefined}
        disabled={!live}
        onClick={() => act((st, c) => (st.day.part === 0 ? openWork(st, c) : closeWork(st)))}
        aria-label={help ?? `札：${text}`}
      >
        <span className="ds-string" aria-hidden />
        <span className="ds-card">{text}</span>
      </button>
      {help ? <span className="door-help">{help}</span> : null}
    </At>
  );
}

// ------------------------------------------------------------------------------------------------ stock badge

/** The number on a jar / supply: always there, "0" when there is none. */
export function Count({ n }: { n: number }) {
  return (
    <span className={`count ${n <= 0 ? 'count-0' : ''}`} aria-hidden>
      {n}
    </span>
  );
}

/** "在庫 0" said once, small, next to what was tapped. */
export function useZeroTap(): [string | null, (id: string) => void] {
  const [id, setId] = useState<string | null>(null);
  const t = useRef<number>();
  useEffect(() => () => window.clearTimeout(t.current), []);
  return [
    id,
    (x: string) => {
      setId(x);
      window.clearTimeout(t.current);
      t.current = window.setTimeout(() => setId(null), 1800);
    },
  ];
}

// ------------------------------------------------------------------------------------------------ order pad

/** The order pad lying by the till: always the same place; the player opens it when they choose to. */
export function OrderPad({ box, children }: { box: Box; children?: ReactNode }) {
  const { openOrder } = useGame();
  return (
    <At box={box} className="pad-at">
      {children}
      <button className="order-pad-obj" id="order-form" onClick={() => openOrder()} aria-label="注文書">
        <svg viewBox="0 0 150 190" className="pad-art" aria-hidden>
          <ellipse cx="78" cy="180" rx="66" ry="8" fill="#1d0e05" opacity="0.3" />
          <rect x="10" y="20" width="130" height="158" rx="6" fill="#6b4a2c" stroke="#2e2219" strokeWidth="3" />
          <rect x="18" y="30" width="114" height="140" rx="2" fill="#fbf6e8" stroke="#8a7350" strokeWidth="1.5" />
          <rect x="18" y="26" width="114" height="140" rx="2" fill="#fffaf0" stroke="#8a7350" strokeWidth="1.5" />
          {[62, 82, 102, 122, 142].map((y) => (
            <path key={y} d={`M28 ${y} H122`} stroke="#b9a882" strokeWidth="1.5" />
          ))}
          <text x="75" y="50" textAnchor="middle" fontSize="17" fontFamily="Georgia, serif" fontWeight="700" fill="#3a2a1a">
            Order
          </text>
          <rect x="52" y="8" width="46" height="24" rx="5" fill="url(#g-brass)" stroke="#5a3c12" strokeWidth="2" />
          <g transform="rotate(28 120 130)">
            <rect x="96" y="124" width="62" height="7" fill="#2f4f8a" stroke="#1a2a4a" strokeWidth="1" />
            <path d="M158 124 L168 127.5 L158 131 Z" fill="#e8d8b8" stroke="#1a2a4a" strokeWidth="1" />
          </g>
        </svg>
        <span className="obj-label">注文書</span>
      </button>
    </At>
  );
}

/** Orders on their way: receipts on the spike next to the pad. */
export function Receipts({ box }: { box: Box }) {
  const s = useS();
  const { data, now } = useGame();
  const wp = s.day.workplace;
  const mine = s.pending.filter((d) => d.workplace === wp);
  const cat = catalogFor(data, wp);
  return (
    <At box={box} className="receipts-at">
      {mine.map((d) => {
        const left = d.arrive.kind === 'soon' ? Math.max(0, Math.ceil((d.arrive.at - now) / 1000)) : null;
        const frac = d.arrive.kind === 'soon' ? Math.min(1, 1 - (d.arrive.at - now) / 8000) : 0;
        return (
          <div key={d.id} className="receipt" role="status">
            <div className="receipt-head">
              <Icon name="crate" size={18} />
              <span>{d.arrive.kind === 'soon' ? (left ? `配達中 あと${left}秒` : 'まもなく') : '明日の朝'}</span>
            </div>
            <ul>
              {d.lines.map((l) => (
                <li key={l.id}>
                  <span lang="en">{data.lex.byId.get(cat.find((c) => c.id === l.id)?.word ?? '')?.text ?? l.id}</span> <b>+{l.portions}</b>
                </li>
              ))}
            </ul>
            {d.arrive.kind === 'soon' ? (
              <div className="bar" aria-hidden>
                <i style={{ transform: `scaleX(${frac})` }} />
              </div>
            ) : null}
          </div>
        );
      })}
    </At>
  );
}

/** +N for what arrived in the last few seconds (shown on the jars themselves). */
export function recentArrivals(s: V2State, now: number, wp: WorkplaceId, ms = 6000): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of s.arrived) if (a.workplace === wp && now - a.at < ms) for (const l of a.lines) out[l.id] = (out[l.id] ?? 0) + l.portions;
  return out;
}

/** The crate that came: lands by the door, says what was in it, goes after a few seconds (in the morning it stays until opening). */
export function Crate({ box, tagBox }: { box: Box; tagBox: Box }) {
  const s = useS();
  const { data, now } = useGame();
  const wp = s.day.workplace;
  const cat = catalogFor(data, wp);
  const morning = s.day.part === 0;
  const list = s.arrived.filter((a) => a.workplace === wp && a.via === 'crate' && (morning ? a.day === s.day.day : now - a.at < 7000 && a.part === s.day.part));
  if (!list.length) return null;
  const lines: Record<string, number> = {};
  for (const a of list) for (const l of a.lines) lines[l.id] = (lines[l.id] ?? 0) + l.portions;
  const key = list.map((a) => a.key).join('-');
  return (
    <>
      <At box={box} className="crate-at">
        <div className="crate-drop" key={key}>
          <CrateArt />
        </div>
      </At>
      <At box={tagBox} className="crate-tag-at">
        <div className="crate-tag" role="status" aria-label="配達の箱が届いた" key={key}>
          <span className="crate-title">届いた箱</span>
          {Object.entries(lines).map(([id, n]) => {
            const w = cat.find((c) => c.id === id)?.word ?? id;
            return (
              <span key={id} className="crate-line">
                <Words text={`{${data.lex.byId.get(w)?.text ?? w}|${w}}`} /> <b>+{n}</b>
              </span>
            );
          })}
        </div>
      </At>
    </>
  );
}

// ------------------------------------------------------------------------------------------------ going out

/** The framed town map on the wall (before opening / after closing). */
export function MapFrame({ box }: { box: Box }) {
  const s = useS();
  const { act } = useGame();
  const can = s.day.part !== 1;
  return (
    <At box={box} className="wall-at">
      <button className="wall-thing map-frame" id="to-town" disabled={!can} onClick={() => act((st) => void goRoom(st, 'town'))} aria-label="町へ（地図）">
        <span className="frame-art" aria-hidden>
          <TownMapArt />
        </span>
        <span className="obj-label">町へ</span>
      </button>
    </At>
  );
}

/** The market basket on its hook by the door (tea house, before opening / after closing). */
export function MarketBasket({ box }: { box: Box }) {
  const s = useS();
  const { act } = useGame();
  const can = s.day.part !== 1;
  return (
    <At box={box} className="wall-at">
      <button className="wall-thing basket-hook" id="to-market" disabled={!can} onClick={() => act((st) => void goRoom(st, 'market'))} aria-label="市場へ（かご）">
        <span className="hook" aria-hidden />
        <span className="basket-art-wrap" aria-hidden>
          <BasketArt />
        </span>
        <span className="obj-label">市場へ</span>
      </button>
    </At>
  );
}

// ------------------------------------------------------------------------------------------------ papers

/** The day's note, a paper lying on the counter / desk before opening. */
export function DayNote({ box, lines, title, extra }: { box: Box; lines: string[]; title: string; extra?: ReactNode }) {
  return (
    <At box={box} className="note-at">
      <section className="note-paper" aria-label={title}>
        <header className="paper-head">
          <span className="ja-label">{title}</span>
          <ListenButton text={lines.join(' ')} />
        </header>
        {lines.map((l, i) => (
          <p key={i} className={i === 0 ? 'note-first' : 'note-line'}>
            <Words text={l} />
          </p>
        ))}
        {extra}
      </section>
    </At>
  );
}

/** After closing: one card over the same room — who came, the coins, what was used and what came in. */
export function SummaryCard({ box }: { box: Box }) {
  const s = useS();
  const { data, act } = useGame();
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
    <At box={box} className="summary-at">
      <section className="summary-card" aria-label="今日のしめくくり">
        <header className="summary-head">
          <span className="summary-day">{s.day.day}日目</span>
          <b>{wp === 'clinic' ? '受付終了' : '本日終了'}</b>
        </header>
        <dl className="sum-grid">
          <dt>{wp === 'clinic' ? '受け付けた件数' : 'お客さん'}</dt>
          <dd>{t.served}</dd>
          <dt>お金</dt>
          <dd>
            {t.moneyStart} → <b>{s.p.town.money}</b> <span className="sum-diff">（{diff >= 0 ? '+' : ''}{diff}）</span>
          </dd>
          {t.fees ? (
            <>
              <dt>配送費</dt>
              <dd>{t.fees}</dd>
            </>
          ) : null}
        </dl>
        <div className="sum-cols">
          {used.length ? (
            <div className="sum-list">
              <span className="ja-label">使った：</span>
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
              <span className="ja-label">入った：</span>
              <ul>
                {bought.map(([id, n]) => (
                  <li key={id}>
                    <span lang="en">{name(id)}</span> +{n}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
        {shift?.endLine && wp === 'clinic' ? (
          <p className="sum-line">
            <Words text={shift.endLine} />
          </p>
        ) : null}
        {rankUp ? <p className="sum-rank">位が上がった：新しい仕事が来るようになる。</p> : null}
        <button className="btn-primary sum-end" id="end-day" onClick={() => act((st, c) => endDay(st, c))}>
          一日を終える
        </button>
      </section>
    </At>
  );
}

/** The speech bubble next to the person's face. `tail` = where the tail points from (side of the bubble). */
export function Bubble({ box, tail, who, tools, children }: { box: Box; tail: 'left' | 'bottom'; who?: ReactNode; tools?: ReactNode; children: ReactNode }) {
  return (
    <At box={box} className="bubble-at">
      <section className={`bubble tail-${tail}`}>
        {who ? <div className="bubble-who">{who}</div> : null}
        <div className="bubble-body">{children}</div>
        {tools ? <div className="bubble-tools">{tools}</div> : null}
      </section>
    </At>
  );
}
