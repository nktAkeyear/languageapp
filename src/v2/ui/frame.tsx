/**
 * The frame every screen shares: the top edge (day, part of the day, coins, the one notebook button, the menu),
 * the stage, an optional dock (town / market only: going back), the notebook column / sheet and the order form.
 */
import { useState, type ReactNode } from 'react';
import { PART_NAMES, type V2State } from '../logic/state';
import type { WorkplaceId } from '../logic/catalog';
import { Coins, Icon } from './bits';
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

/** Top edge: the day, the part of the day, coins; the notebook; the menu. Nothing else. */
export function Strip() {
  const s = useS();
  const { layout, nb, setNb } = useGame();
  const [menu, setMenu] = useState(false);
  const room = s.day.room;
  const where = room === 'town' ? PLACE.town : room === 'market' ? PLACE.market : PLACE[s.day.workplace];
  return (
    <header className="strip">
      <div className="strip-day">
        <span className="day-n">{s.day.day}日目</span>
        <ol className="parts" aria-label="一日の流れ">
          {PART_NAMES.map((n, i) => (
            <li key={n} className={i === s.day.part ? 'now' : i < s.day.part ? 'past' : ''} aria-current={i === s.day.part ? 'step' : undefined}>
              {n}
            </li>
          ))}
        </ol>
        {layout === 'desk' ? <span className="strip-where">{where.ja}</span> : null}
      </div>
      <div className="strip-right">
        <Coins n={s.p.town.money} />
        <button className={`strip-book ${nb.open ? 'on' : ''}`} onClick={() => setNb({ open: !nb.open })} aria-expanded={nb.open} aria-label="帳面">
          <Icon name="book" size={20} />
          <span>帳面</span>
        </button>
        <button className="icon-btn" aria-label="メニュー" onClick={() => setMenu((m) => !m)}>
          <Icon name="menu" />
        </button>
      </div>
      {menu ? <Menu onClose={() => setMenu(false)} /> : null}
    </header>
  );
}

export interface Primary {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  id?: string;
}

/** Town and market only: what is going on there, and the way back to work. */
export function Dock({ primary, middle }: { primary: Primary | null; middle?: ReactNode }) {
  return (
    <footer className="dock">
      <div className="dock-mid">{middle}</div>
      {primary ? (
        <div className="dock-primary">
          <button className="btn-primary" id={primary.id} onClick={primary.onClick} disabled={primary.disabled}>
            {primary.label}
          </button>
        </div>
      ) : null}
    </footer>
  );
}

export function Frame({ children, dock, roomClass }: { children: ReactNode; dock?: ReactNode; roomClass?: string }) {
  const { layout, nb, order } = useGame();
  return (
    <div className={`app app-${layout} ${nb.open ? 'nb-open' : ''} ${dock ? 'has-dock' : ''}`}>
      <Strip />
      <main className={`stage ${roomClass ?? ''}`}>{children}</main>
      {dock}
      {nb.open ? <Notebook /> : null}
      {order.open ? <OrderForm /> : null}
    </div>
  );
}
