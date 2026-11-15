/**
 * The tea house: ONE screen, the counter seen from behind it. The back wall has the door (with its sign), the town
 * map and the market basket, the window, and the shelf of jars — every jar with its count. The customer comes in
 * and stands at the counter with a big speech bubble. On the counter: the tools, the cup, the serve plate, the
 * order pad by the till. Before opening the day's note lies on the counter; after closing the day's card lies over
 * the room. Nothing in the room ever suggests ordering: an empty jar shows 0 and says 在庫 0 when tapped.
 */
import { useEffect, useState } from 'react';
import { currentOrder } from '../../activities/shop/engine';
import { featuresAtStage } from '../../core/gamedata';
import type { IngredientId, Method, Temp } from '../../core/types';
import { lookFor, CustomerArt, expressionFor } from '../../ui/art/customer';
import { VesselArt } from '../../ui/art/vessel';
import { KettleArt, ColdBasinArt, HourglassArt, PotArt, SpoonArt } from '../../ui/art/tools';
import { ContainerArt } from '../../ui/art/ingredients';
import { CoinJarArt, DecorArt, TeaSetArt } from '../../ui/art/props';
import { hashString } from '../../core/rng';
import { DoorBellGroup, DoorGroup, LampGroup, ShelfUnitGroup, WindowGroup } from '../../ui/art/shop';
import type { SkyColours } from '../../ui/art/sky';
import { addPortion, emptyCup, hasTap, morningNote, nextCustomer, removePortion, serveCup, setMethod, setTemp, shelfItems, teaAvailable } from '../logic/day';
import { TAP } from '../logic/catalog';
import { Icon, ListenButton, Words } from './bits';
import { Frame } from './frame';
import { At, Bubble, Count, Crate, DayNote, DoorSign, Light, MapFrame, MarketBasket, OrderPad, Receipts, SIZE, Stage, SummaryCard, recentArrivals, skyFor, useZeroTap, type Box } from './scene';
import { useGame, useS } from './store';

type Geo = {
  w: number;
  h: number;
  /** y of the counter's far edge */
  cy: number;
  door: Box;
  sign: Box;
  map: Box;
  basket: Box;
  window: Box;
  lamp: [number, number];
  customer: Box;
  bubble: Box;
  bubbleTail: 'left' | 'bottom';
  shelf: Box;
  tools: Box;
  cup: Box;
  chit: Box;
  primary: Box;
  pad: Box;
  receipts: Box;
  crate: Box;
  crateTag: Box;
  note: Box;
  summary: Box;
};

const DESK: Geo = {
  ...SIZE.desk,
  cy: 560,
  door: [50, 100, 170, 460],
  sign: [62, 140, 146, 120],
  map: [244, 112, 116, 118],
  basket: [240, 286, 124, 126],
  window: [400, 80, 300, 320],
  lamp: [1080, 40],
  customer: [410, 150, 280, 490],
  bubble: [700, 150, 400, 400],
  bubbleTail: 'left',
  shelf: [1130, 56, 440, 0],
  tools: [24, 586, 380, 340],
  cup: [470, 590, 210, 270],
  chit: [700, 640, 210, 150],
  primary: [960, 790, 270, 110],
  pad: [1262, 640, 170, 240],
  receipts: [1060, 596, 180, 180],
  crate: [40, 420, 190, 140],
  crateTag: [26, 286, 210, 130],
  note: [430, 590, 560, 320],
  summary: [380, 36, 720, 510],
};

const PHONE: Geo = {
  ...SIZE.phone,
  cy: 400,
  door: [8, 160, 96, 240],
  sign: [8, 176, 96, 92],
  map: [306, 200, 88, 84],
  basket: [304, 292, 92, 100],
  window: [124, 120, 170, 190],
  lamp: [300, 20],
  customer: [124, 196, 172, 300],
  bubble: [8, 6, 384, 200],
  bubbleTail: 'bottom',
  shelf: [4, 404, 392, 142],
  tools: [4, 552, 132, 264],
  cup: [140, 552, 138, 160],
  chit: [140, 714, 138, 104],
  primary: [282, 642, 114, 74],
  pad: [282, 552, 114, 86],
  receipts: [282, 722, 114, 96],
  crate: [6, 330, 100, 70],
  crateTag: [6, 230, 112, 98],
  note: [6, 552, 272, 264],
  summary: [6, 550, 272, 266],
};

/**
 * Phone with many goods (a high start): the jar shelf takes more height so every jar keeps a readable name and its
 * count; the counter below gives up the same height (tools, cup, chit, the pad column move down and shrink).
 */
function phoneGeo(n: number): Geo {
  const extra = n <= 6 ? 0 : n <= 14 ? 26 : 70;
  if (!extra) return PHONE;
  const down = (b: Box, grow = 1): Box => [b[0], b[1] + extra, b[2], b[3] - extra * grow];
  return {
    ...PHONE,
    shelf: [PHONE.shelf[0], PHONE.shelf[1], PHONE.shelf[2], PHONE.shelf[3] + extra],
    tools: down(PHONE.tools),
    cup: down(PHONE.cup, 0.6),
    chit: [PHONE.chit[0], PHONE.chit[1] + extra * 0.4, PHONE.chit[2], PHONE.chit[3] - extra * 0.4],
    pad: down(PHONE.pad, 0.5),
    primary: [PHONE.primary[0], PHONE.primary[1] + extra * 0.5, PHONE.primary[2], PHONE.primary[3]],
    receipts: [PHONE.receipts[0], PHONE.receipts[1] + extra * 0.5, PHONE.receipts[2], PHONE.receipts[3] - extra * 0.5],
    note: down(PHONE.note),
    summary: down(PHONE.summary),
  };
}

/** The back wall (static picture): plaster, wainscot, beams, the door, the window, the shelf boards, the lamp. */
function TeaWall({ g, sky, rows, rowH, phone }: { g: Geo; sky: SkyColours; rows: number; rowH: number; phone: boolean }) {
  const [dx, dy, dw, dh] = g.door;
  const [wx, wy, ww, wh] = g.window;
  return (
    <svg viewBox={`0 0 ${g.w} ${g.h}`} className="scene-svg" preserveAspectRatio="none" aria-hidden>
      <rect x="0" y="0" width={g.w} height={g.cy + 10} fill="url(#g-wall)" />
      <rect x="0" y={g.cy - (phone ? 70 : 120)} width={g.w} height={phone ? 70 : 120} fill="url(#g-wainscot)" />
      <rect x="0" y={g.cy - (phone ? 76 : 128)} width={g.w} height="10" fill="#8e5a2e" stroke="#4a2c12" />
      {!phone
        ? Array.from({ length: 16 }, (_, i) => <rect key={i} x={20 + i * 100} y={g.cy - 104} width="80" height="90" rx="3" fill="none" stroke="#3a1f0e" strokeWidth="2" opacity="0.45" />)
        : null}
      <rect x="0" y="0" width={g.w} height={phone ? 16 : 30} fill="url(#g-beam)" />
      {Array.from({ length: phone ? 3 : 9 }, (_, i) => (
        <rect key={i} x={i * (phone ? 170 : 190) - 10} y="0" width={phone ? 26 : 46} height={phone ? 24 : 44} fill="#2e180a" />
      ))}
      <path d={`M${wx + 20} ${wy + 20} L${wx + ww - 20} ${wy + 20} L${wx + ww + 200} ${g.cy} L${wx - 60} ${g.cy} Z`} fill={sky.light} opacity={sky.shaft * 0.2} />
      <WindowGroup sky={sky} x={wx} y={wy} w={ww} h={wh} />
      <DoorGroup sky={sky} x={dx} y={dy} w={dw} h={dh} sign="prep" />
      <DoorBellGroup x={dx + dw + 14} y={dy + 12} ringing={false} />
      {!phone ? <ShelfUnitGroup x={g.shelf[0]} y={g.shelf[1]} w={g.shelf[2]} rows={rows} rowH={rowH} /> : null}
      <LampGroup x={g.lamp[0]} y={g.lamp[1]} />
    </svg>
  );
}

/** The counter top (in front of the customer). */
function TeaCounter({ g, phone }: { g: Geo; phone: boolean }) {
  const top = g.cy;
  return (
    <svg viewBox={`0 0 ${g.w} ${g.h}`} className="scene-svg counter-svg" preserveAspectRatio="none" aria-hidden>
      <rect x="0" y={top} width={g.w} height={g.h - top} fill="url(#g-counter)" />
      {Array.from({ length: 5 }, (_, i) => {
        const y = top + 30 + i * i * (phone ? 16 : 20) + i * (phone ? 30 : 40);
        return <line key={i} x1="0" y1={y} x2={g.w} y2={y} stroke="#4a2a12" strokeWidth={1 + i * 0.5} opacity="0.3" />;
      })}
      <rect x="0" y={top - 8} width={g.w} height="16" fill="url(#g-counter-edge)" />
      <rect x="0" y={top + 8} width={g.w} height="14" fill="#000" opacity="0.16" />
      {phone ? (
        <>
          {/* the jar shelf along the back of the counter */}
          <rect x="0" y={g.shelf[1] - 2} width={g.w} height={g.shelf[3] + 6} fill="#5a3418" opacity="0.55" />
          <rect x="0" y={g.shelf[1] + g.shelf[3]} width={g.w} height="8" fill="url(#g-shelfboard)" stroke="#3a1f0e" strokeWidth="1.5" />
        </>
      ) : (
        <>
          {/* the till */}
          <g transform={`translate(${1440} ${590})`}>
            <path d="M8 150 L142 150 L132 60 L18 60 Z" fill="#8a5a2e" stroke="#2e2219" strokeWidth="3" />
            <rect x="26" y="18" width="98" height="46" rx="4" fill="#c99a3c" stroke="#2e2219" strokeWidth="3" />
            <rect x="38" y="28" width="74" height="22" rx="2" fill="#2a3a30" />
            {[0, 1, 2].map((r) =>
              [0, 1, 2, 3].map((c) => <circle key={`${r}${c}`} cx={38 + c * 24} cy={84 + r * 20} r="7" fill="#efe3c6" stroke="#2e2219" strokeWidth="2" />),
            )}
            <rect x="0" y="146" width="150" height="16" rx="3" fill="#6b4222" stroke="#2e2219" strokeWidth="2.5" />
          </g>
        </>
      )}
    </svg>
  );
}

const TEMP_TOOLS: Temp[] = ['hot', 'cold'];
const METHOD_TOOLS: Method[] = ['steep', 'boil', 'stir'];

export function TeaHouse() {
  const s = useS();
  const { data, act, layout, now, reduced } = useGame();
  const phone = layout === 'phone';
  const g = phone ? phoneGeo(shelfItems(data, s).length) : DESK;
  const p = s.p;
  const t = p.today;
  const part = s.day.part;
  const order = part === 1 ? currentOrder(p) : null;
  const [readText, setReadText] = useState(false);
  const [talk, setTalk] = useState(false);
  const [zero, sayZero] = useZeroTap();
  const key = t ? `${t.index}-${t.phase}-${part}` : 'none';
  useEffect(() => {
    setReadText(false);
    if (reduced) return;
    setTalk(true);
    const id = window.setTimeout(() => setTalk(false), 1400);
    return () => window.clearTimeout(id);
  }, [key, reduced]);

  const sky = skyFor(s);
  const items = shelfItems(data, s);
  const rows = phone ? 0 : items.length > 15 ? 4 : 3;
  const rowH = rows === 4 ? 120 : 160;
  const cols = items.length <= 12 ? 4 : 5;
  const phase = part === 1 ? t?.phase : null;
  const result = phase === 'reaction' && t ? t.results[t.results.length - 1] : null;
  const cust = order ? data.content.customers.find((c) => c.id === order.customer) : null;
  const look = order ? lookFor(order.customer, cust?.avatar ?? '🙂') : null;
  const ex = result ? expressionFor(result.face, null) : 'neutral';
  const feats = featuresAtStage(data, p.stage);
  const tap = hasTap(data, s);
  const cupEmpty = !Object.values(s.brew.counts).some((n) => (n ?? 0) > 0);
  const plus = recentArrivals(s, now, 'teahouse');
  const pieceOrder = Object.keys(s.brew.counts) as IngredientId[];
  const working = phase === 'order';
  const audioHidden = !!order?.audioOnly && !readText && phase === 'order';
  const wordOf = (ing: string) => data.lex.byId.get(data.ingText.get(ing as IngredientId)?.word ?? '')?.text ?? ing;

  // the shelf: desktop on the wall unit (rows of 5), phone along the back of the counter (rows that fit)
  const perRow = phone ? (items.length <= 6 ? Math.max(4, items.length) : items.length <= 14 ? Math.ceil(items.length / 2) : Math.ceil(items.length / 3)) : cols;
  const shelfRows = Math.max(1, Math.ceil(items.length / perRow));
  const cellW = (phone ? g.shelf[2] : g.shelf[2]) / perRow;
  const cellH = phone ? g.shelf[3] / shelfRows : rowH;
  const jarBox = (i: number): Box => {
    const r = Math.floor(i / perRow);
    const c = i % perRow;
    return [g.shelf[0] + c * cellW, g.shelf[1] + r * cellH, cellW, cellH];
  };

  // tools: what the stage has, each in its fixed place on the counter
  const toolList: { id: string; label: string; on: boolean; art: JSX.Element; act: () => void; aria: string }[] = [];
  if (feats.has('temperature'))
    for (const tt of TEMP_TOOLS)
      toolList.push({
        id: tt,
        label: tt,
        on: s.brew.temp === tt,
        art: tt === 'hot' ? <KettleArt active={s.brew.temp === 'hot'} /> : <ColdBasinArt active={s.brew.temp === 'cold'} />,
        act: () => act((st) => setTemp(st, tt)),
        aria: tt,
      });
  if (feats.has('method'))
    for (const m of METHOD_TOOLS)
      toolList.push({
        id: m,
        label: m,
        on: s.brew.method === m,
        art: m === 'steep' ? <HourglassArt active={s.brew.method === m} /> : m === 'boil' ? <PotArt active={s.brew.method === m} /> : <SpoonArt active={s.brew.method === m} />,
        act: () => act((st) => setMethod(st, m)),
        aria: m,
      });
  if (tap)
    toolList.push({
      id: 'water',
      label: data.lex.byId.get('water')?.text ?? 'water',
      on: false,
      art: <ContainerArt ing="water" />,
      act: () => act((st, c) => addPortion(c, st, TAP)),
      aria: 'water を一つ入れる',
    });
  const toolCols = phone ? 2 : 3;
  const toolRowsN = phone ? 3 : 2;
  const toolW = g.tools[2] / toolCols;
  const toolH = g.tools[3] / toolRowsN;

  const lines = part === 0 ? morningNote(data, s) : [];

  return (
    <Frame>
      <Stage w={g.w} h={g.h} className={`scene scene-${layout} tea part-${part}`}>
        <TeaWall g={g} sky={sky} rows={rows} rowH={rowH} phone={phone} />
        <DoorSign box={g.sign} />
        <MapFrame box={g.map} />
        <MarketBasket box={g.basket} />
        <Crate box={g.crate} tagBox={g.crateTag} />

        {order && look ? (
          <At box={g.customer} className={`person ${result ? `face-${result.face}` : ''}`}>
            <div className="person-in" key={order.key}>
              <CustomerArt look={look} ex={ex} pose={result ? (result.face === 'happy' || result.face === 'delighted' ? 'open' : 'chin') : 'rest'} talking={talk} />
            </div>
          </At>
        ) : null}

        <TeaCounter g={g} phone={phone} />
        <Light part={part} lamp={sky.lamp} lampAt={g.lamp} />

        {/* the jars, each with its count */}
        <div className="shelf-items" role="group" aria-label="棚の品（数は在庫）">
          {items.map((it, i) => {
            const n = teaAvailable(s, it.id);
            const out = n <= 0;
            const word = data.lex.byId.get(it.word)?.text ?? it.id;
            return (
              <At key={it.id} box={jarBox(i)} className="jar-at">
                <button
                  className={`jar ${out ? 'jar-0' : ''} ${working ? 'jar-live' : ''}`}
                  onClick={() => {
                    if (out) sayZero(it.id);
                    else if (working) act((st, c) => addPortion(c, st, it.id as IngredientId));
                  }}
                  aria-label={`${word} 在庫 ${n}`}
                  aria-disabled={!working && !out}
                >
                  <span className="jar-art">
                    <ContainerArt ing={it.id as IngredientId} empty={out} />
                  </span>
                  <span className={`jar-label ${word.length * (phone ? 8.5 : 10.5) + 26 > cellW ? "long" : ""}`} lang="en">
                    {word}
                  </span>
                  <Count n={n} />
                  {plus[it.id] ? <span className="plus" key={`${it.id}-${plus[it.id]}`}>+{plus[it.id]}</span> : null}
                  {zero === it.id ? <span className="zero-tag" role="status">在庫 0</span> : null}
                </button>
              </At>
            );
          })}
        </div>

        {/* the rest of the wall shelf: the house's own things */}
        {!phone
          ? Array.from({ length: rows * cols - items.length }, (_, k) => {
              const i = items.length + k;
              return hashString(`slot${i}`) % 3 < 2 ? (
                <At key={`d${i}`} box={jarBox(i)} className="decor-at">
                  <DecorArt i={hashString(`decor${i}`)} />
                </At>
              ) : null;
            })
          : null}
        {!toolList.length ? (
          <At box={phone ? [g.tools[0], g.tools[1] + 70, g.tools[2], 130] : [g.tools[0] + 40, g.tools[1] + 60, 300, 200]} className="decor-at teaset-at">
            <TeaSetArt />
          </At>
        ) : null}
        {!phone ? (
          <At box={[1446, 760, 100, 150]} className="decor-at">
            <CoinJarArt amount={s.p.town.money} />
          </At>
        ) : null}

        {/* tools in their places */}
        {toolList.map((tl, i) => (
          <At key={tl.id} box={[g.tools[0] + (i % toolCols) * toolW, g.tools[1] + Math.floor(i / toolCols) * toolH, toolW, toolH]} className="tool-at">
            <button className={`tool ${tl.on ? 'on' : ''}`} aria-pressed={tl.id === 'water' ? undefined : tl.on} disabled={!working} onClick={tl.act} aria-label={tl.aria}>
              <span className="tool-art">{tl.art}</span>
              <span className="tool-label" lang="en">
                {tl.label}
              </span>
            </button>
          </At>
        ))}

        {part === 1 ? (
          <>
            <At box={g.cup} className="cup-at">
              <div className="cup">
                <VesselArt brew={s.brew} order={pieceOrder} onPiece={working ? (ing) => act((st) => removePortion(st, ing)) : undefined} pieceLabel={(ing) => `${ing} を一つ戻す`} />
              </div>
            </At>
            <At box={g.chit} className="chit-at">
              <div className="chit">
                <span className="ja-label">カップの中</span>
                {cupEmpty ? <span className="ja-label chit-empty">（空）</span> : null}
                <ul aria-label="カップの中">
                  {pieceOrder
                    .filter((i) => (s.brew.counts[i] ?? 0) > 0)
                    .map((i) => (
                      <li key={i}>
                        <span lang="en">{wordOf(i)}</span> ×{s.brew.counts[i]}
                        <button className="mini" onClick={() => act((st) => removePortion(st, i))} disabled={!working} aria-label={`${i} を一つ戻す`}>
                          <Icon name="minus" size={16} />
                        </button>
                      </li>
                    ))}
                  {s.brew.temp ? <li lang="en">{s.brew.temp}</li> : null}
                  {s.brew.method ? <li lang="en">{s.brew.method}</li> : null}
                </ul>
                {!cupEmpty && working ? (
                  <button className="btn-quiet chit-clear" onClick={() => act((st) => emptyCup(st))}>
                    空ける
                  </button>
                ) : null}
              </div>
            </At>
            <At box={g.primary} className="primary-at">
              {phase === 'order' ? (
                <button className="plate" id="serve" onClick={() => act((st, c) => serveCup(st, c))} disabled={cupEmpty && !s.brew.temp}>
                  出す
                </button>
              ) : phase === 'reaction' && t ? (
                <button className="plate" id="next" onClick={() => act((st, c) => nextCustomer(st, c))}>
                  {t.index + 1 >= t.queue.length ? '見送る' : phone ? '次の人' : '次のお客さん'}
                </button>
              ) : null}
            </At>
          </>
        ) : null}

        <OrderPad box={g.pad} />
        <Receipts box={g.receipts} />

        {part === 0 ? <DayNote box={g.note} lines={lines} title={`${s.day.day}日目の張り紙`} /> : null}

        {part === 1 && t && order ? (
          <Bubble
            box={g.bubble}
            tail={g.bubbleTail}
            who={
              <>
                <span className="who-name" lang="en">
                  {cust?.name}
                </span>
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
          </Bubble>
        ) : null}
        {part === 2 ? <SummaryCard box={g.summary} /> : null}
      </Stage>
    </Frame>
  );
}
