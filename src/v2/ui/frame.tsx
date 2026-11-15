/**
 * The frame every workplace screen shares: the status strip (always the same place), the stage, the dock (one
 * notebook, stock chips with counts, one primary action), the notebook column / sheet and the order form.
 */
import { useState, type ReactNode } from 'react';
import { rankName, jobById } from '../../jobs/engine';
import { catalogFor, shelfItems } from '../logic/day';
import { PART_NAMES, type V2State } from '../logic/state';
import type { WorkplaceId } from '../logic/catalog';
import { available } from '../logic/stock';
import { ItemArt, CrateArt } from './art';
import { Coins, Icon, Words } from './bits';
import { Notebook } from './notebook';
import { OrderForm } from './order';
import { useGame, useS } from './store';

export const PLACE: Record<WorkplaceId | 'town' | 'market', { ja: string; short: string }> = {
  teahouse: { ja: '港町の茶房', short: '茶房' },
  clinic: { ja: '診療所の受付', short: '診療所' },
  town: { ja: '町', short: '町' },
  market: { ja: '市場', short: '市場' },
};

export function rankOf(s: V2State, wp: string): number {
  if (wp === 'teahouse') return Math.min(5, 1 + Math.floor(((s.p.stage ?? 1) - 1) / 6));
  return s.p.jobs?.jobs[wp]?.rank ?? 1;
}

function Pips({ n }: { n: number }) {
  return (
    <span className="pips" aria-label={`位 ${n}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <i key={i} className={i <= n ? 'on' : ''} />
      ))}
    </span>
  );
}

function Menu({ onClose }: { onClose: () => void }) {
  const { reset } = useGame();
  const [sure, setSure] = useState(false);
  return (
    <div className="menu-pop" role="dialog" aria-label="メニュー">
      <p className="menu-note">v2 試作版。旧版のセーブとは別に保存されます。</p>
      {!sure ? (
        <button className="btn-quiet" onClick={() => setSure(true)}>
          最初からやり直す
        </button>
      ) : (
        <div className="menu-sure">
          <span>本当に消しますか？</span>
          <button className="btn-quiet danger" onClick={() => { reset(); onClose(); }}>
            消して最初から
          </button>
          <button className="btn-quiet" onClick={() => setSure(false)}>
            やめる
          </button>
        </div>
      )}
      <button className="btn-quiet" onClick={onClose}>
        閉じる
      </button>
    </div>
  );
}

export function Strip() {
  const s = useS();
  const { data, layout } = useGame();
  const [menu, setMenu] = useState(false);
  const room = s.day.room;
  const wp = s.day.workplace;
  const where = room === 'town' ? PLACE.town : room === 'market' ? PLACE.market : PLACE[wp];
  const rank = rankOf(s, wp);
  const job = jobById(data, wp);
  return (
    <header className="strip">
      <div className="strip-place">
        <b>{layout === 'phone' ? where.short : where.ja}</b>
        {room !== 'town' && room !== 'market' ? (
          <span className="strip-rank" title={job ? `${job.nameJa} ${rankName(rank)}` : ''}>
            {layout === 'desk' ? <span className="rank-name">{rankName(rank)}</span> : null}
            <Pips n={rank} />
          </span>
        ) : null}
      </div>
      <div className="strip-day">
        <span className="day-n">{s.day.day}日目</span>
        <ol className="parts" aria-label="一日の流れ">
          {PART_NAMES.map((n, i) => (
            <li key={n} className={i === s.day.part ? 'now' : i < s.day.part ? 'past' : ''} aria-current={i === s.day.part ? 'step' : undefined}>
              {n}
            </li>
          ))}
        </ol>
      </div>
      <div className="strip-right">
        <Coins n={s.p.town.money} />
        <button className="icon-btn" aria-label="メニュー" onClick={() => setMenu((m) => !m)}>
          <Icon name="menu" />
        </button>
      </div>
      {menu ? <Menu onClose={() => setMenu(false)} /> : null}
    </header>
  );
}

/** +N badges for what arrived in the last few seconds. */
export function recentArrivals(s: V2State, now: number, wp: WorkplaceId, ms = 6000): Record<string, number> {
  const out: Record<string, number> = {};
  for (const a of s.arrived) if (a.workplace === wp && now - a.at < ms) for (const l of a.lines) out[l.id] = (out[l.id] ?? 0) + l.portions;
  return out;
}

/** Stock chips: every shelf item with what is free to use now; at 0 the chip is the way to order. */
export function StockChips() {
  const s = useS();
  const { data, openOrder, now, openWord } = useGame();
  const wp = s.day.workplace;
  const items = shelfItems(data, s);
  const reserved = wp === 'teahouse' ? s.brew.counts : {};
  const plus = recentArrivals(s, now, wp);
  return (
    <div className="chips" role="list" aria-label="在庫">
      {items.map((it) => {
        const n = available(s.stock[wp], reserved, it.id);
        const out = n <= 0;
        return (
          <button
            key={it.id}
            role="listitem"
            className={`chip ${out ? 'chip-out' : n <= 2 ? 'chip-low' : ''}`}
            onClick={() => openOrder(out ? { [it.id]: 1 } : {})}
            onContextMenu={(e) => {
              e.preventDefault();
              openWord(it.word);
            }}
            aria-label={`${data.lex.byId.get(it.word)?.text ?? it.id} ${n}${out ? '（なし：注文する）' : ''}`}
          >
            <span className="chip-art">
              <ItemArt id={it.id} empty={out} />
            </span>
            <span className="chip-n">{n}</span>
            {out ? <span className="chip-order">注文</span> : null}
            {plus[it.id] ? (
              <span className="plus" key={`${it.id}-${plus[it.id]}`}>
                +{plus[it.id]}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

/** Orders on their way, as receipts on the nail. */
export function Receipts({ compact = false }: { compact?: boolean }) {
  const s = useS();
  const { data, now } = useGame();
  const wp = s.day.workplace;
  const mine = s.pending.filter((d) => d.workplace === wp);
  if (!mine.length) return null;
  const cat = catalogFor(data, wp);
  return (
    <div className={`receipts ${compact ? 'receipts-compact' : ''}`}>
      {mine.map((d) => {
        const left = d.arrive.kind === 'soon' ? Math.max(0, Math.ceil((d.arrive.at - now) / 1000)) : null;
        const frac = d.arrive.kind === 'soon' ? Math.min(1, 1 - (d.arrive.at - now) / 8000) : 0;
        return (
          <div key={d.id} className="receipt" role="status">
            <div className="receipt-head">
              <Icon name="crate" size={18} />
              <span>{d.arrive.kind === 'soon' ? (left ? `配達中・あと${left}秒` : 'まもなく到着') : '明日の朝に届く'}</span>
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
    </div>
  );
}

/** A crate that has just been delivered (lands, shows what came, goes). */
export function CrateDrop({ persistentToday = false }: { persistentToday?: boolean }) {
  const s = useS();
  const { data, now } = useGame();
  const wp = s.day.workplace;
  const cat = catalogFor(data, wp);
  const list = s.arrived.filter((a) => a.workplace === wp && a.via === 'crate' && (persistentToday ? a.day === s.day.day : now - a.at < 6000 && a.part === s.day.part));
  if (!list.length) return null;
  const lines: Record<string, number> = {};
  for (const a of list) for (const l of a.lines) lines[l.id] = (lines[l.id] ?? 0) + l.portions;
  const key = list.map((a) => a.key).join('-');
  return (
    <div className="crate" key={key} role="status" aria-label="配達の箱が届いた">
      <CrateArt />
      <div className="crate-tag">
        <span className="crate-title">{persistentToday ? '届いた箱' : '届いた'}</span>
        {Object.entries(lines).map(([id, n]) => {
          const w = cat.find((c) => c.id === id)?.word ?? id;
          return (
            <span key={id} className="crate-line">
              <Words text={`{${data.lex.byId.get(w)?.text ?? w}|${w}}`} /> <b>+{n}</b>
            </span>
          );
        })}
      </div>
    </div>
  );
}

export interface Primary {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  hint?: string;
  id?: string;
}

export function Dock({ primary, middle, extra }: { primary: Primary | null; middle?: ReactNode; extra?: ReactNode }) {
  const { nb, setNb } = useGame();
  return (
    <footer className="dock">
      <button className={`dock-book ${nb.open ? 'on' : ''}`} onClick={() => setNb({ open: !nb.open })} aria-expanded={nb.open} aria-label="帳面">
        <Icon name="book" size={24} />
        <span>帳面</span>
      </button>
      <div className="dock-mid">{middle ?? <StockChips />}</div>
      {extra}
      {primary ? (
        <div className="dock-primary">
          {primary.hint ? <span className="dock-hint">{primary.hint}</span> : null}
          <button className="btn-primary" id={primary.id} onClick={primary.onClick} disabled={primary.disabled}>
            {primary.label}
          </button>
        </div>
      ) : null}
    </footer>
  );
}

/** Phone: the two rooms as a switch above the dock (裏 / 表). Desktop: a door at the stage edge. */
export function RoomSwitch() {
  const s = useS();
  const { act } = useGame();
  const room = s.day.room;
  const part = s.day.part;
  const frontOk = part !== 2;
  return (
    <div className="room-switch" role="tablist" aria-label="部屋">
      <button role="tab" aria-selected={room === 'back'} className={room === 'back' ? 'on' : ''} onClick={() => act((st) => void (st.day.room = 'back'))}>
        裏・作業場
      </button>
      <button role="tab" aria-selected={room === 'front'} className={room === 'front' ? 'on' : ''} disabled={!frontOk} onClick={() => act((st) => void (st.day.room = 'front'))}>
        {s.day.workplace === 'clinic' ? '表・受付' : '表・店'}
        {part === 0 ? '（準備中）' : part === 2 ? '（閉店）' : ''}
      </button>
    </div>
  );
}

export function Frame({ children, dock, roomClass }: { children: ReactNode; dock: ReactNode; roomClass?: string }) {
  const { layout, nb, order } = useGame();
  const s = useS();
  const inWork = s.day.room === 'back' || s.day.room === 'front';
  return (
    <div className={`app app-${layout} ${nb.open ? 'nb-open' : ''}`}>
      <Strip />
      <main className={`stage ${roomClass ?? ''}`}>{children}</main>
      {layout === 'phone' && inWork ? <RoomSwitch /> : null}
      {dock}
      {nb.open ? <Notebook /> : null}
      {order.open ? <OrderForm /> : null}
    </div>
  );
}
