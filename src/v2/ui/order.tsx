/**
 * The order form (注文書): a paper over the room (desktop) / a full-height sheet (phone). Opened only by the player,
 * from the pad by the till; it starts with nothing ticked. One row per shelf item:
 * drawing, English name, unit price, what is on the shelf now, a stepper, the line total; the delivery fee (tiered)
 * and the total at the foot; stamping it pays and sends the order. Ordering is never a walk to the market.
 */
import { useEffect, useRef, useState } from 'react';
import { catalogFor, orderDelivery, shelfItems } from '../logic/day';
import { FEE_TIERS, orderPrice } from '../logic/catalog';
import { quoteOrder } from '../logic/stock';
import { ItemArt } from './art';
import { Icon, Words } from './bits';
import { useGame, useS } from './store';

function unitName(one: string): string {
  return one.replace(/^one /, '');
}

export function OrderForm() {
  const s = useS();
  const { data, act, closeOrder, layout } = useGame();
  const wp = s.day.workplace;
  const items = shelfItems(data, s);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const first = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    first.current?.focus();
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && closeOrder();
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [closeOrder]);
  const q = quoteOrder(catalogFor(data, wp), Object.entries(qty).map(([id, units]) => ({ id, units })));
  const money = s.p.town.money;
  const evening = s.day.part === 2;
  const set = (id: string, d: number) => setQty((x) => ({ ...x, [id]: Math.max(0, Math.min(9, (x[id] ?? 0) + d)) }));
  const send = () => {
    const r = act((st, c) => orderDelivery(st, c, q.lines.map((l) => ({ id: l.id, units: l.units }))));
    if (r && 'reason' in r) setMsg(r.reason);
    else closeOrder();
  };
  return (
    <div className={`overlay overlay-${layout}`} role="dialog" aria-modal="true" aria-label="注文書" onClick={closeOrder}>
      <div className="order-paper" onClick={(e) => e.stopPropagation()}>
        <header className="order-head">
          <div>
            <h2 lang="en">
              <Words text="Order form" />
            </h2>
            <span className="ja-label">注文書・配達で届く（{evening ? '明日の朝' : '約8秒後'}）</span>
          </div>
          <button className="icon-btn" onClick={closeOrder} aria-label="閉じる" ref={first}>
            <Icon name="close" />
          </button>
        </header>
        <div className="order-cols ja-label" aria-hidden>
          <span>品</span>
          <span>1つの値段</span>
          <span>いま棚に</span>
          <span>数</span>
          <span>小計</span>
        </div>
        <ul className="order-rows">
          {items.map((it) => {
            const n = qty[it.id] ?? 0;
            const have = s.stock[wp][it.id] ?? 0;
            const name = unitName(it.unit.one);
            return (
              <li key={it.id} className={`order-row ${n ? 'on' : ''} ${have <= 0 ? 'none' : ''}`}>
                <span className="or-art">
                  <ItemArt id={it.id} empty={have <= 0} />
                </span>
                <span className="or-name">
                  <Words text={name} />
                  <span className="ja-label">{it.sizeJa}</span>
                </span>
                <span className="or-price">
                  <Icon name="coin" size={16} />
                  {orderPrice(it)}
                </span>
                <span className="or-have">
                  <b>{have}</b>
                  {n ? <span className="or-after">→ {have + n * it.per}</span> : null}
                </span>
                <span className="stepper">
                  <button onClick={() => set(it.id, -1)} disabled={!n} aria-label={`${name} を減らす`}>
                    <Icon name="minus" />
                  </button>
                  <output aria-live="polite">{n}</output>
                  <button onClick={() => set(it.id, +1)} aria-label={`${name} を増やす`}>
                    <Icon name="plus" />
                  </button>
                </span>
                <span className="or-total">{n ? n * orderPrice(it) : ''}</span>
              </li>
            );
          })}
        </ul>
        <footer className="order-foot">
          <div className="fee">
            <span>配送費</span>
            <b>{q.units ? q.fee : 0}</b>
            <span className="ja-label fee-tiers">
              {FEE_TIERS.map((t, i) => `${i === 0 ? 1 : FEE_TIERS[i - 1].upTo + 1}${t.upTo === Infinity ? '個〜' : `〜${t.upTo}個`} ${t.fee}枚`).join('／')}
            </span>
          </div>
          <div className="total">
            <span>合計</span>
            <b>{q.total}</b>
            <span className={`ja-label ${q.total > money ? 'short' : ''}`}>手持ち {money}</span>
          </div>
          {msg ? <p className="order-msg" role="alert">{msg}</p> : null}
          <button className="btn-primary stamp" onClick={send} disabled={!q.lines.length || q.total > money}>
            <Icon name="stamp" /> 注文する
          </button>
        </footer>
      </div>
    </div>
  );
}
