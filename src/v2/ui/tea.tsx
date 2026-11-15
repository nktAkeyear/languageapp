/**
 * The tea house: the Back room (作業場: shelves with counts, the day's note, the order form on the desk, the door
 * with its sign, the market and the town) and the Front (the customer and the big reading card, the counter with
 * only what the order needs, the dock).
 */
import { useEffect, useState } from 'react';
import { currentOrder } from '../../activities/shop/engine';
import { featuresAtStage } from '../../core/gamedata';
import type { IngredientId, Method, Temp } from '../../core/types';
import { lookFor, CustomerArt, expressionFor } from '../../ui/art/customer';
import { VesselArt } from '../../ui/art/vessel';
import { KettleArt, ColdBasinArt, HourglassArt, PotArt, SpoonArt } from '../../ui/art/tools';
import { ContainerArt } from '../../ui/art/ingredients';
import { addPortion, closeWork, emptyCup, endDay, goRoom, hasTap, morningNote, nextCustomer, openWork, removePortion, serveCup, setMethod, setTemp, shelfItems, teaAvailable } from '../logic/day';
import { TAP } from '../logic/catalog';
import { DoorArt } from './art';
import { Icon, ListenButton, ReadingCard, Words } from './bits';
import { CrateDrop, Dock, Frame, Receipts, recentArrivals, type Primary } from './frame';
import { Shelf, Summary, DeskObjects, WallObjects } from './back';
import { useGame, useS } from './store';

// ------------------------------------------------------------------------------------------------ Back room

export function TeaBack() {
  const s = useS();
  const { data, act, layout } = useGame();
  const part = s.day.part;
  const evening = part === 2;
  const primary: Primary =
    part === 0
      ? { label: '開店する', onClick: () => act((st, c) => openWork(st, c)), id: 'open-shop' }
      : part === 2
        ? { label: '一日を終える', onClick: () => act((st, c) => endDay(st, c)), id: 'end-day' }
        : { label: '店に出る', onClick: () => act((st) => void goRoom(st, 'front')), id: 'to-front' };
  const lines = morningNote(data, s);
  return (
    <Frame roomClass={`room-back ${evening ? 'evening' : ''}`} dock={<Dock primary={primary} />}>
      <div className={`back back-${layout}`}>
        <div className="wall-note">
          {part === 2 ? (
            <Summary />
          ) : (
            <ReadingCard kind="note" who={<span className="ja-label">今日の張り紙</span>} tools={<ListenButton text={lines.join(' ')} />}>
              {lines.map((l, i) => (
                <p key={i} className={i === 0 ? 'note-first' : l.endsWith(':') ? 'note-head' : 'note-line'}>
                  <Words text={l} />
                </p>
              ))}
            </ReadingCard>
          )}
            {layout === 'desk' ? <WallObjects market /> : null}
        </div>
        <div className="wall-right">
          <Shelf />
          {layout === 'desk' ? (
            <button
              className={`door ${part === 0 ? 'door-live' : ''}`}
              disabled={part !== 0}
              onClick={() => act((st, c) => openWork(st, c))}
              aria-label={part === 0 ? '札を返して開店する' : part === 2 ? '閉店' : '営業中'}
            >
              <DoorArt sign={part === 0 ? '準備中' : part === 1 ? '営業中' : '閉店'} lit={part === 1} />
              {part === 0 ? <span className="door-label">札を返して開店</span> : null}
            </button>
          ) : null}
        </div>
        <div className="workbench">
          <DeskObjects market wall={layout === 'desk'} />
          <CrateDrop persistentToday={part === 0} />
        </div>
      </div>
    </Frame>
  );
}

// ------------------------------------------------------------------------------------------------ Front

const TEMP_TOOLS: { t: Temp; label: string }[] = [
  { t: 'hot', label: 'hot' },
  { t: 'cold', label: 'cold' },
];
const METHOD_TOOLS: { m: Method; label: string }[] = [
  { m: 'steep', label: 'steep' },
  { m: 'boil', label: 'boil' },
  { m: 'stir', label: 'stir' },
];

export function TeaFront() {
  const s = useS();
  const { data, act, layout, openOrder, now, reduced } = useGame();
  const p = s.p;
  const t = p.today;
  const order = currentOrder(p);
  const part = s.day.part;
  const [readText, setReadText] = useState(false);
  const [talk, setTalk] = useState(false);
  const key = t ? `${t.index}-${t.phase}` : 'none';
  useEffect(() => {
    setReadText(false);
    if (reduced) return;
    setTalk(true);
    const id = window.setTimeout(() => setTalk(false), 1400);
    return () => window.clearTimeout(id);
  }, [key, reduced]);

  if (part !== 1 || !t) return <FrontClosed />;

  const phase = t.phase;
  const result = phase === 'reaction' ? t.results[t.results.length - 1] : null;
  const cust = order ? data.content.customers.find((c) => c.id === order.customer) : null;
  const look = order ? lookFor(order.customer, cust?.avatar ?? '🙂') : null;
  const ex = result ? expressionFor(result.face, null) : 'neutral';
  const feats = featuresAtStage(data, p.stage);
  const items = shelfItems(data, s);
  const tap = hasTap(data, s);
  const cupEmpty = !Object.values(s.brew.counts).some((n) => (n ?? 0) > 0);
  const plus = recentArrivals(s, now, 'teahouse');
  const pieceOrder = Object.keys(s.brew.counts) as IngredientId[];

  let primary: Primary;
  if (phase === 'order') primary = { label: '出す', onClick: () => act((st, c) => serveCup(st, c)), disabled: cupEmpty && !s.brew.temp, hint: cupEmpty ? 'カップは空' : undefined, id: 'serve' };
  else if (phase === 'reaction') primary = { label: t.index + 1 >= t.queue.length ? '見送る' : '次のお客さん', onClick: () => act((st, c) => nextCustomer(st, c)), id: 'next' };
  else primary = { label: '閉店（作業場へ）', onClick: () => act((st) => closeWork(st)), id: 'close-shop' };

  const audioHidden = order?.audioOnly && !readText && phase === 'order';
  return (
    <Frame roomClass="room-front" dock={<Dock primary={primary} />}>
      <div className={`front front-${layout}`}>
        <section className="ask">
          {order && look && phase !== 'closed' ? (
            <div className={`person ${result ? `face-${result.face}` : ''}`} key={order.key}>
              <CustomerArt look={look} ex={ex} pose={result ? (result.face === 'happy' || result.face === 'delighted' ? 'open' : 'chin') : 'rest'} talking={talk} />
            </div>
          ) : (
            <div className="person person-empty" />
          )}
          {phase === 'closed' ? (
            <ReadingCard kind="note" who={<span className="ja-label">今日のお客さんは、これで全員</span>}>
              <p className="ja-body">店を閉めて、作業場で今日をしめくくる。</p>
            </ReadingCard>
          ) : order ? (
            <ReadingCard
              who={
                <>
                  <span className="who-name" lang="en">{cust?.name}</span>
                  <span className="ja-label">
                    {t.index + 1}人目／{t.queue.length}人
                  </span>
                </>
              }
              tools={
                <>
                  <ListenButton text={result ? result.reaction : order.text} />
                  {order.audioOnly && phase === 'order' ? (
                    <button className="btn-quiet" onClick={() => setReadText((x) => !x)}>
                      {readText ? '文字を隠す' : '文字で読む'}
                    </button>
                  ) : null}
                </>
              }
            >
              {result ? (
                <>
                  <p className="said-before">
                    <Words text={order.text} />
                  </p>
                  <p className="said" key={`r${t.index}`}>
                    <Words text={result.reaction} />
                  </p>
                </>
              ) : audioHidden ? (
                <p className="said said-audio">
                  <span className="ja-body">声だけの注文。「聞く」で聞く（音声が使えないときは「文字で読む」）。</span>
                </p>
              ) : (
                <p className="said" key={`o${t.index}`}>
                  <Words text={order.text} />
                </p>
              )}
            </ReadingCard>
          ) : null}
        </section>

        <section className={`surface counter ${items.length > 10 ? 'counter-many' : ''}`} aria-label="作業台">
          <div className={`rack ${items.length > 10 ? 'rack-many' : ''}`} role="group" aria-label="棚の品">
            {items.map((it) => {
              const n = teaAvailable(s, it.id);
              const out = n <= 0;
              const word = data.lex.byId.get(it.word)?.text ?? it.id;
              return (
                <button
                  key={it.id}
                  className={`jar ${out ? 'jar-out' : ''}`}
                  disabled={phase !== 'order'}
                  onClick={() => (out ? openOrder({ [it.id]: 1 }) : act((st, c) => addPortion(c, st, it.id as IngredientId)))}
                  aria-label={out ? `${word}（なし・注文する）` : `${word} を一つ入れる`}
                >
                  <span className="jar-art">
                    <ContainerArt ing={it.id as IngredientId} empty={out} />
                  </span>
                  <span className={`jar-label ${word.length > 10 ? 'long' : ''}`} lang="en">
                    {word}
                  </span>
                  {out ? <span className="jar-out-tag">注文</span> : null}
                  {plus[it.id] ? <span className="plus">+{plus[it.id]}</span> : null}
                </button>
              );
            })}
            {tap ? (
              <button className="jar" disabled={phase !== 'order'} onClick={() => act((st, c) => addPortion(c, st, TAP))} aria-label="water を一つ入れる">
                <span className="jar-art">
                  <ContainerArt ing="water" />
                </span>
                <span className="jar-label" lang="en">
                  {data.lex.byId.get('water')?.text ?? 'water'}
                </span>
              </button>
            ) : null}
          </div>

          <div className="bench">
            <div className="bench-tools">
            {feats.has('temperature') ? (
              <div className="tools" role="group" aria-label="温度">
                {TEMP_TOOLS.map(({ t: tt, label }) => (
                  <button key={tt} className={`tool ${s.brew.temp === tt ? 'on' : ''}`} aria-pressed={s.brew.temp === tt} disabled={phase !== 'order'} onClick={() => act((st) => setTemp(st, tt))}>
                    <span className="tool-art">{tt === 'hot' ? <KettleArt active={s.brew.temp === 'hot'} /> : <ColdBasinArt active={s.brew.temp === 'cold'} />}</span>
                    <span className="tool-label" lang="en">{label}</span>
                  </button>
                ))}
              </div>
            ) : null}
            {feats.has('method') ? (
              <div className="tools" role="group" aria-label="淹れ方">
                {METHOD_TOOLS.map(({ m, label }) => (
                  <button key={m} className={`tool ${s.brew.method === m ? 'on' : ''}`} aria-pressed={s.brew.method === m} disabled={phase !== 'order'} onClick={() => act((st) => setMethod(st, m))}>
                    <span className="tool-art">{m === 'steep' ? <HourglassArt active={s.brew.method === m} /> : m === 'boil' ? <PotArt active={s.brew.method === m} /> : <SpoonArt active={s.brew.method === m} />}</span>
                    <span className="tool-label" lang="en">{label}</span>
                  </button>
                ))}
              </div>
            ) : null}
            </div>
            <div className="cup-wrap">
              <div className="cup">
                <VesselArt brew={s.brew} order={pieceOrder} onPiece={phase === 'order' ? (ing) => act((st) => removePortion(st, ing)) : undefined} pieceLabel={(ing) => `${ing} を一つ戻す`} />
              </div>
              <ul className="cup-list" aria-label="カップの中">
                {pieceOrder
                  .filter((i) => (s.brew.counts[i] ?? 0) > 0)
                  .map((i) => (
                    <li key={i}>
                      <span lang="en">{data.lex.byId.get(data.ingText.get(i)?.word ?? '')?.text ?? i}</span> ×{s.brew.counts[i]}
                      <button className="mini" onClick={() => act((st) => removePortion(st, i))} disabled={phase !== 'order'} aria-label={`${i} を一つ戻す`}>
                        <Icon name="minus" size={16} />
                      </button>
                    </li>
                  ))}
              </ul>
              {!cupEmpty && phase === 'order' ? (
                <button className="btn-quiet tip" onClick={() => act((st) => emptyCup(st))}>
                  カップを空ける
                </button>
              ) : null}
            </div>
          </div>
          <div className="front-side">
            <Receipts compact />
            <CrateDrop />
          </div>
        </section>
      </div>
    </Frame>
  );
}

/** The Front before opening (準備中) or after closing (dark). */
function FrontClosed() {
  const s = useS();
  const { act } = useGame();
  const part = s.day.part;
  const primary: Primary =
    part === 0 ? { label: '開店する', onClick: () => act((st, c) => openWork(st, c)), id: 'open-shop' } : { label: '作業場へ', onClick: () => act((st) => void goRoom(st, 'back')) };
  return (
    <Frame roomClass={`room-front closed ${part === 2 ? 'evening' : ''}`} dock={<Dock primary={primary} />}>
      <div className="front-closed">
        <DoorArt sign={part === 0 ? '準備中' : '閉店'} lit={false} />
        <p className="ja-body">{part === 0 ? 'まだ開けていない。準備ができたら札を返す。' : '今日は閉めた。'}</p>
      </div>
    </Frame>
  );
}
