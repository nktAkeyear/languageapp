/**
 * The market, in person (tea house, before opening / after closing only): cheaper than ordering and no fee, but it
 * is a real exchange in English — point at a good, say how many, hear the total (in words), pay with coins on the
 * tray, get change. What is bought goes straight onto the shelf (+N).
 */
import { useEffect, useState } from 'react';
import { capitalizeFirst } from '../../core/gamedata';
import { MARKET } from '../../content/en/market';
import { CustomerArt, lookFor, type Expression } from '../../ui/art/customer';
import { catalogFor, goRoom, hear, marketBuy, moneyWords, shelfItems, unitPhrase } from '../logic/day';
import type { CatalogItem } from '../logic/catalog';
import { ItemArt, StallArt } from './art';
import { Icon, ListenButton, ReadingCard, Words } from './bits';
import { Dock, Frame } from './frame';
import { useGame, useS } from './store';

const goodText = new Map(MARKET.goods.map((g) => [g.ingredient, g]));
const line = (kind: string) => MARKET.lines.find((l) => l.kind === kind && l.level === 1) ?? MARKET.lines.find((l) => l.kind === kind)!;

function nameOf(it: CatalogItem, wordText: string): string {
  return goodText.get(it.id as never)?.name ?? wordText;
}

function tagOf(it: CatalogItem): string {
  const per = goodText.get(it.id as never)?.per ?? '{price} a bag';
  const money = it.price === 1 ? MARKET.tagMoney.one!.replace('{d}', '1') : MARKET.tagMoney.other.replace('{d}', String(it.price));
  return per.replace('{price}', money);
}

type Step = { k: 'browse' } | { k: 'ask'; id: string; units: number } | { k: 'quote'; id: string; units: number; tray: number[] } | { k: 'done'; id: string; units: number };

const COINS = [1, 5, 10];

export function Market() {
  const s = useS();
  const { data, act, layout } = useGame();
  const items = shelfItems(data, s, 'teahouse');
  const [step, setStep] = useState<Step>({ k: 'browse' });
  const [said, setSaid] = useState<{ text: string; face: Expression }>({ text: line('greet').text, face: 'happy' });
  const [mine, setMine] = useState<string | null>(null);
  const [basket, setBasket] = useState<{ id: string; portions: number }[]>([]);
  const cat = catalogFor(data, 'teahouse');
  const word = (it: CatalogItem) => data.lex.byId.get(it.word)?.text ?? it.id;
  const item = step.k !== 'browse' ? cat.find((c) => c.id === step.id)! : null;

  const vendor = (text: string, face: Expression = 'happy') => {
    setSaid({ text, face });
    act((st, c) => hear(st, c, text));
  };
  useEffect(() => {
    act((st, c) => hear(st, c, said.text));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fill = (text: string, it: CatalogItem, units: number, extra: Record<string, string> = {}) => {
    const total = units * it.price;
    const map: Record<string, string> = { g: nameOf(it, word(it)), qty: unitPhrase(it, units), total: moneyWords(total), ...extra };
    return text.replace(/\{(\w+)\}/g, (_m, k: string) => {
      const v = map[k.toLowerCase()] ?? '';
      return k[0] === k[0].toUpperCase() ? capitalizeFirst(v) : v;
    });
  };

  const pickGood = (it: CatalogItem) => {
    setMine(null);
    setStep({ k: 'ask', id: it.id, units: 1 });
    vendor(fill(line('askQty').text, it, 1));
  };
  const sayQty = () => {
    if (step.k !== 'ask' || !item) return;
    const mineLine = `${capitalizeFirst(unitPhrase(item, step.units))}, please.`;
    setMine(mineLine);
    act((st, c) => hear(st, c, mineLine));
    setStep({ k: 'quote', id: step.id, units: step.units, tray: [] });
    vendor(fill(line('quote').text, item, step.units));
  };
  const tray = step.k === 'quote' ? step.tray.reduce((a, b) => a + b, 0) : 0;
  const pay = () => {
    if (step.k !== 'quote' || !item) return;
    const total = step.units * item.price;
    if (tray < total) {
      vendor(fill(line('notEnough').text, item, step.units), 'puzzled');
      return;
    }
    const r = act((st, c) => marketBuy(st, c, item.id, step.units, tray));
    if (!r || !r.ok) return;
    setBasket((b) => [...b, { id: item.id, portions: r.portions }]);
    if (r.change > 0) vendor(fill(line('change').text, item, step.units, { change: moneyWords(r.change) }), 'happy');
    else vendor(line('thanks').text, 'happy');
    setStep({ k: 'done', id: item.id, units: step.units });
  };
  const leave = () => act((st) => void goRoom(st, 'shop'));

  return (
    <Frame roomClass="room-market" dock={<Dock primary={{ label: '店に戻る', onClick: leave, id: 'leave-market' }} middle={<Basket items={basket} />} />}>
      <div className={`market market-${layout}`}>
        <div className="stall-top">
          <StallArt />
        </div>
        <section className="ask">
          <div className="person">
            <CustomerArt look={lookFor('v_yellow', '')} ex={said.face} pose={step.k === 'quote' ? 'open' : 'rest'} />
          </div>
          <ReadingCard who={<span className="ja-label">市場の店の人</span>} tools={<ListenButton text={said.text} />}>
            {mine ? (
              <p className="said-before mine">
                <span className="ja-label">自分：</span>
                <Words text={mine} />
              </p>
            ) : null}
            <p className="said" key={said.text}>
              <Words text={said.text} />
            </p>
          </ReadingCard>
        </section>
        <section className="surface market-surface">
          {step.k === 'browse' || step.k === 'done' ? (
            <div className="board" aria-label="値札">
              <p className="ja-label">品を選ぶ（自分で買えば配送費なし・少し安い）</p>
              <ul className="board-grid">
                {items.map((it) => (
                  <li key={it.id}>
                    <button className="good" onClick={() => pickGood(it)} disabled={s.p.town.money < it.price}>
                      <span className="good-art">
                        <ItemArt id={it.id} />
                      </span>
                      <span className="good-name" lang="en">
                        {capitalizeFirst(nameOf(it, word(it)))}
                      </span>
                      <span className="tag" lang="en">
                        {tagOf(it)}
                      </span>
                      <span className="ja-label">{it.sizeJa}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {step.k === 'ask' && item ? (
            <div className="haggle">
              <span className="good-art big">
                <ItemArt id={item.id} />
              </span>
              <div className="say-qty">
                <span className="ja-label">いくつ買う？（言うことば）</span>
                <div className="stepper big">
                  <button onClick={() => setStep({ ...step, units: Math.max(1, step.units - 1) })} aria-label="減らす">
                    <Icon name="minus" />
                  </button>
                  <output>{step.units}</output>
                  <button onClick={() => setStep({ ...step, units: Math.min(5, step.units + 1) })} aria-label="増やす">
                    <Icon name="plus" />
                  </button>
                </div>
                <p className="mine-line" lang="en">
                  <Words text={`${capitalizeFirst(unitPhrase(item, step.units))}, please.`} />
                </p>
                <div className="row">
                  <button className="btn-secondary" id="say-qty" onClick={sayQty}>
                    こう言う
                  </button>
                  <button className="btn-quiet" onClick={() => setStep({ k: 'browse' })}>
                    やめる
                  </button>
                </div>
              </div>
            </div>
          ) : null}
          {step.k === 'quote' && item ? (
            <div className="haggle">
              <div className="purse" aria-label="財布">
                <span className="ja-label">財布から硬貨を皿へ（手持ち {s.p.town.money - tray}）</span>
                <div className="row">
                  {COINS.map((c) => (
                    <button key={c} className="coin-btn" disabled={s.p.town.money - tray < c} onClick={() => setStep({ ...step, tray: [...step.tray, c] })} aria-label={`${c} 枚の硬貨を置く`}>
                      <span className="coin-face">{c}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="tray" aria-label="皿">
                <span className="ja-label">皿の上：{tray}</span>
                <div className="tray-coins">
                  {step.tray.map((c, i) => (
                    <button key={i} className="coin-btn small" onClick={() => setStep({ ...step, tray: step.tray.filter((_, j) => j !== i) })} aria-label={`${c} を戻す`}>
                      <span className="coin-face">{c}</span>
                    </button>
                  ))}
                </div>
                <div className="row">
                  <button className="btn-secondary" id="pay" onClick={pay} disabled={!step.tray.length}>
                    渡す
                  </button>
                  <button className="btn-quiet" onClick={() => setStep({ k: 'browse' })}>
                    やめる
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </Frame>
  );
}

function Basket({ items }: { items: { id: string; portions: number }[] }) {
  const { data } = useGame();
  const cat = catalogFor(data, 'teahouse');
  if (!items.length) return <span className="ja-label basket-empty">かご：まだ空。買った品はそのまま棚に入る。</span>;
  return (
    <ul className="basket" aria-label="かご">
      {items.map((b, i) => (
        <li key={i}>
          <span lang="en">{data.lex.byId.get(cat.find((c) => c.id === b.id)?.word ?? '')?.text}</span> <b>+{b.portions}</b>
        </li>
      ))}
    </ul>
  );
}
