/**
 * Pieces of the shop scene shared by the desktop and the phone composition. Each piece is an
 * interactive object (HTML wrapper for events + accessibility) around drawn art (src/ui/art).
 * Layout / position is up to the composition (ShopScene.tsx / MobileShop.tsx, via CSS).
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { DELIVERY_FEE, deliveryWaiting, marketAccess, marketDay, teaPart } from '../../activities/day';
import { canGoToTown, jobDay, TEAHOUSE } from '../../jobs/engine';
import { currentOrder } from '../../activities/shop/engine';
import { plain, wordMarkup } from '../../core/gamedata';
import type { IngredientId, Method, Temp } from '../../core/types';
import { ING_UNIT, UNIT_ACTION_JA, canAdd, reactionMotion, type Motion } from '../brewing';
import { CustomerArt, expressionFor, lookFor, type Expression } from '../art/customer';
import { DayParts } from '../components/DayChrome';
import { ContainerArt, PieceArt } from '../art/ingredients';
import { CalendarArt, CoinJarArt, NotebookProp, PlaqueArt, RecipeBookProp } from '../art/props';
import { BoardArt, ColdBasinArt, HandToolArt, HourglassArt, KettleArt, PotArt, SlopBowlArt, SpoonArt } from '../art/tools';
import { VesselArt } from '../art/vessel';
import { SpeakButton, WordText } from '../components/WordText';
import { sfx } from '../sound';
import { speak, useSpeaking, useSpeechAvailable } from '../speech';
import { lineMs, useTalkBurst } from '../useTalk';
import { useGame } from '../useGame';
import { useUi } from '../uiState';
import { useStoryHold } from '../story/StoryUi';
import { useMobile } from '../layout';
import { useBench, useBenchOptional } from './workbench';
import { owns } from '../../renovation/engine';
import { RetrySign } from '../difficulty/AssistUi';

// ------------------------------------------------------------------------------------- shelf

export function ShelfJar({ ing }: { ing: IngredientId }) {
  const b = useBench();
  const left = b.stock(ing);
  // While a served cup is with the customer, its portions are already taken off the stock.
  const n = b.stage === 'idle' ? (b.brew.counts[ing] ?? 0) : 0;
  const out = left === 0;
  const remaining = left === undefined ? undefined : Math.max(0, left - n);
  const full = !canAdd(b.brew, ing, b.limit(ing));
  const held = b.held === ing;
  const g = useGame();
  const word = g.data ? plain(b.label(ing)) : ing;
  return (
    <div className={`jar ${held ? 'jar-held' : ''} ${out ? 'jar-out' : ''} ${full && !out ? 'jar-full' : ''}`} data-ing={ing}>
      <button
        type="button"
        className="jar-btn"
        disabled={!b.canWork || out}
        aria-label={`${word}：${UNIT_ACTION_JA[ING_UNIT[ing]]}（クリックで手に取る）`}
        aria-pressed={held}
        onPointerDown={(e) => b.startDrag({ kind: 'ing', ing }, e)}
        onClick={() => b.hold(held ? null : ing)}
        onContextMenu={(e) => {
          e.preventDefault();
          b.add(ing);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            b.add(ing);
          }
        }}
      >
        <ContainerArt ing={ing} empty={out} />
      </button>
      <span className="jar-label">
        <WordText text={b.label(ing)} interactive={false} />
      </span>
      {remaining !== undefined ? (
        <span className={`jar-stock ${remaining <= 0 ? 'jar-stock-empty' : ''}`} title="今日の在庫">
          {out ? '品切れ' : `残り${remaining}`}
        </span>
      ) : null}
      {n > 0 ? <span className="jar-in" aria-hidden>{n}</span> : null}
    </div>
  );
}

// ------------------------------------------------------------------------------------- cup

export function VesselSpot() {
  const b = useBench();
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    b.registerDrop('cup', ref.current);
    return () => b.registerDrop('cup', null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const over = b.drag?.over === 'cup' && b.drag.carry.kind !== 'cup';
  const away = b.stage !== 'idle';
  const tipping = b.fx?.kind === 'tipout';
  return (
    <div
      ref={ref}
      className={`vessel-spot ${b.held ? 'vessel-target' : ''} ${over ? 'vessel-over' : ''}`}
      onClick={() => b.held && b.add(b.held)}
      data-testid="cup"
    >
      <div
        key={away ? 'away' : 'here'}
        className={`vessel-wrap ${away ? `vessel-${b.stage}` : 'vessel-fresh'} ${tipping ? `vessel-tip fx-${b.fx!.id % 2}` : ''}`}
        onPointerDown={(e) => b.brew && Object.keys(b.brew.counts).length && b.startDrag({ kind: 'cup' }, e)}
        title={b.held ? 'カップに入れる' : 'カップをカウンターへ運ぶと出せる'}
      >
        <VesselArt
          brew={away && b.servedBrew ? b.servedBrew : b.brew}
          order={b.shelf}
          onPiece={b.canWork && !b.held ? b.remove : undefined}
          pieceLabel={(ing) => `${plain(b.label(ing))} を一つ取り出す`}
        />
      </div>
      {b.held ? (
        <button
          type="button"
          className="vessel-drop-btn"
          onClick={(e) => {
            e.stopPropagation();
            b.add(b.held!);
          }}
        >
          ここに入れる
        </button>
      ) : null}
      <FxLayer />
    </div>
  );
}

/** Tool animation over the cup: knife, spoon, pour, tongs, fingers, kettle, basin … */
function FxLayer() {
  const b = useBench();
  const fx = b.fx;
  if (!fx) return null;
  let body: ReactNode = null;
  const piece = fx.ing ? (
    <svg viewBox="-20 -20 40 40" className="fx-piece">
      <PieceArt ing={fx.ing} />
    </svg>
  ) : null;
  switch (fx.kind) {
    case 'knife':
      body = (
        <>
          <span className="fx-tool fx-knife" aria-hidden>
            <HandToolArt tool="knife" />
          </span>
          {piece}
        </>
      );
      break;
    case 'spoon':
      body = (
        <>
          <span className="fx-tool fx-spoon" aria-hidden>
            <HandToolArt tool="spoon" />
          </span>
          <span className="fx-blob" style={{ background: fx.ing ? undefined : '#fff' }} />
        </>
      );
      break;
    case 'pour':
    case 'kettle':
      body = <span className={`fx-stream ${fx.kind === 'kettle' ? 'fx-stream-hot' : fx.ing === 'milk' ? 'fx-stream-milk' : ''}`} />;
      break;
    case 'tongs':
      body = (
        <>
          <span className="fx-tool fx-tongs" aria-hidden>
            <HandToolArt tool="tongs" />
          </span>
          {piece}
        </>
      );
      break;
    case 'fingers':
      body = piece ?? <span className="fx-blob" />;
      break;
    case 'basin':
      body = (
        <span className="fx-frost" aria-hidden>
          <Snowflake />
          <Snowflake />
          <Snowflake />
        </span>
      );
      break;
    case 'hourglass':
      body = (
        <span className="fx-tool fx-hourglass" aria-hidden>
          <HourglassArt active />
        </span>
      );
      break;
    case 'pot':
      body = <span className="fx-bubbles" aria-hidden>◦ ° ◦</span>;
      break;
    case 'stir':
      body = (
        <span className="fx-tool fx-stir" aria-hidden>
          <HandToolArt tool="stir" />
        </span>
      );
      break;
    case 'remove':
      body = piece ? <span className="fx-out">{piece}</span> : null;
      break;
    case 'tipout':
      body = <span className="fx-splash" />;
      break;
  }
  return (
    <div key={fx.id} className={`fx fx-k-${fx.kind}`} aria-hidden>
      {body}
    </div>
  );
}

function Snowflake() {
  return (
    <svg viewBox="-10 -10 20 20" className="snowflake">
      <path d="M0 -9 V9 M-7.8 -4.5 L7.8 4.5 M-7.8 4.5 L7.8 -4.5" stroke="#eaf6ff" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** What is in the cup, as a paper chit (the only way to read dissolved portions like honey). */
export function ContentsSlip() {
  const b = useBench();
  const g = useGame();
  const ings = b.shelf.filter((i) => (b.brew.counts[i] ?? 0) > 0);
  if (!g.data) return null;
  return (
    <div className="slip-chit" aria-label="カップの中身">
      {ings.length === 0 && !b.brew.temp && !b.brew.method ? <span className="chit-empty">（空）</span> : null}
      {ings.map((ing) => (
        <div key={ing} className="chit-row">
          <svg viewBox="-20 -20 40 40" className="chit-piece" aria-hidden>
            <PieceArt ing={ing} />
          </svg>
          <span className="chit-n">×{b.brew.counts[ing]}</span>
          <button type="button" className="chit-minus" disabled={!b.canWork} onClick={() => b.remove(ing)} aria-label={`${plain(b.label(ing))} を一つ取り出す`}>
            −
          </button>
        </div>
      ))}
      {b.brew.temp ? (
        <div className="chit-row chit-mark" title={b.brew.temp === 'hot' ? '熱い' : '冷たい'}>
          {b.brew.temp === 'hot' ? <KettleArt active={false} /> : <ColdBasinArt active={false} />}
        </div>
      ) : null}
      {b.brew.method ? (
        <div className="chit-row chit-mark">{b.brew.method === 'steep' ? <HourglassArt active={false} /> : b.brew.method === 'boil' ? <PotArt active={false} /> : <SpoonArt active={false} />}</div>
      ) : null}
    </div>
  );
}

// ------------------------------------------------------------------------------------- tools

type ToolKind = { temp: Temp } | { method: Method };

export function ToolButton({ tool, className = '' }: { tool: ToolKind; className?: string }) {
  const b = useBench();
  const { data, progress } = useGame();
  if (!data) return null;
  const isTemp = 'temp' in tool;
  const on = isTemp ? b.brew.temp === tool.temp : b.brew.method === tool.method;
  const wordId = isTemp ? data.content.temperatureWords[tool.temp] : data.content.methodWords[tool.method];
  const id = isTemp ? tool.temp : tool.method;
  const big = id === 'hot' && owns(progress, 'kettle'); // renovation: the big copper kettle
  const art =
    id === 'hot' ? (
      <KettleArt active={on} big={big} />
    ) : id === 'cold' ? (
      <ColdBasinArt active={on} />
    ) : id === 'steep' ? (
      <HourglassArt active={on} />
    ) : id === 'boil' ? (
      <PotArt active={on} />
    ) : (
      <SpoonArt active={on} />
    );
  return (
    <div className={`tool tool-${id} ${on ? 'tool-on' : ''} ${className}`}>
      <button
        type="button"
        className="tool-btn"
        aria-pressed={on}
        disabled={!b.canWork}
        data-temp={isTemp ? tool.temp : undefined}
        data-method={!isTemp ? tool.method : undefined}
        aria-label={`${plain(wordMarkup(data, wordId))}${on ? '（使用中・もう一度で戻す）' : ''}`}
        onPointerDown={(e) => b.startDrag(isTemp ? { kind: 'temp', temp: tool.temp } : { kind: 'method', method: tool.method }, e)}
        onClick={() => (isTemp ? b.setTemp(tool.temp) : b.setMethod(tool.method))}
      >
        {art}
      </button>
      <span className="tool-tag">
        <WordText text={wordMarkup(data, wordId)} interactive={false} />
      </span>
    </div>
  );
}

export function Board() {
  const b = useBench();
  return (
    <div className="board" aria-hidden>
      <BoardArt chopping={b.fx?.kind === 'knife'} />
    </div>
  );
}

export function TipOut() {
  const b = useBench();
  const has = Object.keys(b.brew.counts).length > 0 || b.brew.temp || b.brew.method;
  return (
    <button type="button" className="tipout" disabled={!b.canWork || !has} onClick={() => b.empty()} aria-label="カップを空ける（やり直す）" title="カップを空ける">
      <SlopBowlArt tipping={b.fx?.kind === 'tipout'} />
      <span className="tool-tag tool-tag-ja">捨てる</span>
    </button>
  );
}

export function ServeButton({ className = '' }: { className?: string }) {
  const b = useBench();
  return (
    <button type="button" className={`serve ${className}`} disabled={!b.canWork} onClick={() => b.serve()} data-testid="serve">
      <span className="serve-plate" aria-hidden />
      <span className="serve-label">出す</span>
    </button>
  );
}

// ------------------------------------------------------------------------------------- customer

export function useCustomer() {
  const g = useGame();
  const b = useBench();
  const { data, progress, lastServe } = g;
  const t = progress?.today;
  // Before opening nobody is at the counter yet.
  const order = progress && teaPart(progress) !== 0 ? currentOrder(progress) : null;
  const customer = order && data ? data.content.customers.find((c) => c.id === order.customer) : undefined;
  const result = t?.phase === 'reaction' ? t.results[t.results.length - 1] : null;
  const motion: Motion | null =
    b.stage === 'react' && result
      ? lastServe && lastServe.evaluation
        ? reactionMotion(lastServe.evaluation, (ing) => data?.ing.get(ing)?.tags ?? [])
        : result.outcome === 'perfect'
          ? 'delight'
          : 'sigh'
      : null;
  let ex: Expression = 'neutral';
  if (b.stage === 'sipping') ex = 'sip';
  else if (b.stage === 'react' && result) ex = expressionFor(result.face, motion);
  return { order, customer, result, motion, ex, t };
}

export function CustomerFigure() {
  const b = useBench();
  const mobile = useMobile();
  const { order, customer, motion, ex, t, result } = useCustomer();
  const ref = useRef<HTMLDivElement>(null);
  const zh = useGame().lang === 'zh';
  const speakingNow = useSpeaking();
  // The customer says the order when they arrive, and their reaction after tasting.
  const burstKey = !order || !t || t.phase === 'closed' ? null : b.stage === 'react' ? `r${t.day}:${t.index}` : b.stage === 'idle' && t.phase === 'order' && !order.audioOnly ? `o${t.day}:${t.index}` : null;
  const talkBurst = useTalkBurst(burstKey, lineMs(b.stage === 'react' ? (result?.reaction ?? '') : (order?.text ?? ''), zh));
  useEffect(() => {
    b.registerDrop('counter', ref.current);
    return () => b.registerDrop('counter', null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  if (!order || !t || t.phase === 'closed') return <div ref={ref} className="customer-fig customer-none" />;
  const look = lookFor(customer?.id ?? order.customer, customer?.avatar ?? '🧑');
  const said = b.stage === 'react' ? result?.reaction : b.stage === 'idle' && t.phase === 'order' ? order.text : null;
  const talking = talkBurst || (!!said && speakingNow === plain(said));
  const over = b.drag?.carry.kind === 'cup' && b.drag.over === 'counter';
  return (
    <div ref={ref} className={`customer-slot ${over ? 'counter-over' : ''}`}>
      <div key={`${t.day}:${t.index}`} className={`customer-fig ${b.leaving ? 'leaving' : 'entering'} ${motion ? `motion-${motion}` : ''} stage-${b.stage}`}>
        <div className="customer-body">
          <CustomerArt look={look} ex={ex} pose={b.stage === 'sipping' ? 'sip' : b.stage === 'react' ? (mobile ? 'chest' : 'hold') : 'rest'} talking={talking && b.stage !== 'sipping'} />
        </div>
        {b.stage === 'sipping' || b.stage === 'react' ? (
          <div className={`held-cup held-cup-${b.stage}`} aria-hidden>
            <VesselArt brew={b.servedBrew ?? b.brew} order={b.shelf} />
          </div>
        ) : null}
      </div>
    </div>
  );
}

export function NameCard() {
  const { order, customer, t } = useCustomer();
  const { lang } = useGame();
  if (!order || !t || t.phase === 'closed' || !customer) return null;
  return (
    <div className="name-card" lang={lang === 'zh' ? 'zh-CN' : 'en'}>
      {customer.name}
      {order.returning ? <span className="name-again">再来店</span> : null}
    </div>
  );
}

/** Speech bubble: the order (clickable words), the listen button, then the reaction. */
export function Bubble() {
  const g = useGame();
  const b = useBench();
  const { lang, settings } = g;
  const voice = useSpeechAvailable(lang ?? 'en');
  const { order, result, t, customer } = useCustomer();
  const mobile = useMobile();
  const spokenKey = useRef('');
  // Audio-only orders are read out when the customer arrives.
  useEffect(() => {
    if (!order || !lang || t?.phase !== 'order' || !order.audioOnly || !voice) return;
    const k = `${t.day}:${t.index}`;
    if (spokenKey.current === k) return;
    spokenKey.current = k;
    const timer = window.setTimeout(() => speak(plain(order.text), lang, settings.speechRate), 600);
    return () => clearTimeout(timer);
  }, [order, lang, t?.phase, t?.day, t?.index, voice, settings.speechRate]);
  if (!order || !t || t.phase === 'closed') return null;
  const reacting = b.stage === 'react' && result;
  const hideText = order.audioOnly && voice && !result;
  // Long lines get a smaller hand so the bubble stays inside the wall.
  const len = plain(reacting ? `${order.text} ${result!.reaction}` : order.text).length;
  const long = lang === 'zh' ? len > 24 : len > 60;
  const xlong = lang === 'zh' ? len > 38 : len > 100; // e.g. a reaction plus a regular's small talk or a remark
  return (
    <div
      key={`${t.day}:${t.index}`}
      className={`bubble-paper ${reacting ? 'bubble-react' : ''} ${b.leaving ? 'bubble-leave' : ''} ${long ? 'bubble-long' : ''} ${xlong ? 'bubble-xlong' : ''}`}
      data-testid="bubble"
    >
      {reacting ? (
        <>
          {/* phone: the name card steps aside for the cup in hand, so the bubble says who speaks */}
          {mobile && customer ? (
            <div className="bubble-who" lang={lang === 'zh' ? 'zh-CN' : 'en'}>
              {customer.name}
            </div>
          ) : null}
          <div className="bubble-prev">
            <WordText text={order.text} />
          </div>
          <div className="bubble-line bubble-reaction" key="r">
            <WordText text={result!.reaction} className="reaction-text" />
            <SpeakButton text={result!.reaction} label="" className="speak-round" />
          </div>
        </>
      ) : hideText ? (
        <div className="bubble-audio">
          <span className="sound-waves" aria-hidden>
            <i />
            <i />
            <i />
            <i />
            <i />
          </span>
          <SpeakButton text={order.text} label="もう一度聞く" />
          <span className="small muted">声だけの注文（出したあとで文字が見えます）</span>
        </div>
      ) : (
        <div className="bubble-line">
          <WordText text={order.text} className="order-text" />
          <SpeakButton text={order.text} label="" className="speak-round" />
        </div>
      )}
      {order.audioOnly && !voice && !result ? <div className="small muted">（この環境では音声が使えないため、文字で表示しています）</div> : null}
    </div>
  );
}

export function NextSign() {
  const g = useGame();
  const b = useBench();
  const hold = useStoryHold();
  const t = g.progress?.today;
  if (!t || t.phase !== 'reaction' || b.stage !== 'react') return null;
  if (hold.held)
    return (
      <button type="button" className="next-sign next-sign-story" onClick={hold.release} disabled={b.leaving} data-testid="story-more">
        話のつづきを聞く ›
      </button>
    );
  return (
    <>
      <button type="button" className="next-sign" onClick={() => b.next()} disabled={b.leaving} data-testid="next">
        {t.index + 1 < t.queue.length ? '次のお客さんへ ›' : '今日の店じまい ›'}
      </button>
      <RetrySign />
    </>
  );
}

/** Floating reputation / coin deltas after a reaction. */
export function Juice() {
  const g = useGame();
  const b = useBench();
  const t = g.progress?.today;
  const r = t?.phase === 'reaction' ? t.results[t.results.length - 1] : null;
  if (!r || b.stage !== 'react') return null;
  const k = `${t!.day}:${t!.index}`;
  return (
    <>
      {/* the ledger's facts, not a grade: the plaque's number moves, the coins drop into the jar */}
      {r.repDelta ? (
        <div key={`rep${k}`} className="juice juice-rep flat" aria-live="polite">
          評判 {r.repDelta > 0 ? `+${r.repDelta}` : r.repDelta}
        </div>
      ) : null}
      {b.coinDelta > 0 ? (
        <div key={`coin${k}`} className="juice juice-coin" aria-hidden>
          {Array.from({ length: Math.min(4, b.coinDelta) }, (_, i) => (
            <span key={i} className="coin-fly" style={{ animationDelay: `${i * 0.09}s` }} />
          ))}
          <span className="coin-num">+{b.coinDelta}</span>
        </div>
      ) : null}
    </>
  );
}

// ------------------------------------------------------------------------------------- wall & desk props

/**
 * While the cup is being handed over and sipped, the saved result already exists; the wall and
 * the jar keep showing the old numbers until the customer reacts.
 */
function usePending() {
  const g = useGame();
  const b = useBenchOptional();
  const t = g.progress?.today;
  const pending = !!b && (b.stage === 'handing' || b.stage === 'sipping') && t?.phase === 'reaction';
  const r = pending ? t!.results[t!.results.length - 1] : null;
  return { pending, rep: r?.repDelta ?? 0, coins: pending ? b!.coinDelta : 0 };
}

export function Plaque() {
  const { progress } = useGame();
  const pend = usePending();
  return (
    <div className="plaque" title="店の評判">
      <PlaqueArt rep={Math.max(0, (progress?.reputation ?? 0) - pend.rep)} />
    </div>
  );
}

export function Calendar() {
  const { progress } = useGame();
  if (!progress) return null;
  return (
    <div className="calendar" title={`${progress.day}日目`}>
      <CalendarArt day={progress.day} />
    </div>
  );
}

/** The day-part indicator in the shop (始業前 / 業務中 / 業務後). */
export function ShopDayParts({ compact = false }: { compact?: boolean }) {
  // phone: a narrow column under the wall calendar (the calendar shows the day)
  return <DayParts compact={compact} vertical={compact} className="shop-dayparts" />;
}

export function CoinJar() {
  const { progress } = useGame();
  const pend = usePending();
  return (
    <div className="coin-jar" title="売上（財布）" data-testid="money">
      <CoinJarArt amount={(progress?.town.money ?? 0) - pend.coins} />
    </div>
  );
}

/** Order tickets on a nail: one per customer today, torn off when served (no mark of how it went). */
export function QueueTickets() {
  const t = useGame().progress?.today;
  const pend = usePending();
  if (!t) return null;
  return (
    <div className="tickets" aria-label={`${Math.min(t.index + 1, t.queue.length)} 人目 / ${t.queue.length} 人`}>
      {t.queue.map((_q, i) => {
        const r = pend.pending && i === t.results.length - 1 ? undefined : t.results[i];
        return <span key={i} className={`ticket ${i === t.index && t.phase !== 'closed' ? 'ticket-cur' : ''} ${r ? 'ticket-served' : ''}`} />;
      })}
    </div>
  );
}

export function BookProps({ compact = false }: { compact?: boolean }) {
  const ui = useUi();
  const ribbon = owns(useGame().progress, 'ribbon'); // renovation: the review ribbon
  const glow = ui.newPages.length > 0;
  const prevGlow = useRef(glow);
  useEffect(() => {
    if (glow && !prevGlow.current) sfx('glow');
    prevGlow.current = glow;
  }, [glow]);
  return (
    <>
      <button
        type="button"
        className={`desk-book ${compact ? 'compact' : ''}`}
        onClick={() => {
          sfx('page');
          ui.openRecipe();
        }}
        aria-label="レシピ帳を開く"
        data-testid="open-recipe"
      >
        <RecipeBookProp />
        <span className="desk-tag">レシピ帳</span>
      </button>
      <button
        type="button"
        className={`desk-notebook ${glow ? 'glowing' : ''} ${compact ? 'compact' : ''}`}
        onClick={() => {
          sfx('page');
          ui.openNotebook(glow ? 'verify' : undefined, glow ? { verifyPage: ui.newPages[0] } : undefined);
        }}
        aria-label={glow ? '手帳を開く（新しく検証できるページがある）' : '手帳を開く'}
        data-testid="open-notebook"
      >
        <NotebookProp glow={glow} ribbon={ribbon} />
        <span className="desk-tag">手帳</span>
      </button>
    </>
  );
}

// ------------------------------------------------------------------------------------- the day's three parts at the counter

/** The shopping note as paper (target language): the market's note lines, kept or bought marked by the shelf. */
function ShoppingNote() {
  const { townDay } = useGame();
  const md = townDay?.market;
  if (!md || !md.lines.length) return null;
  return (
    <div className="shop-note" data-testid="shopping-note">
      <div className="shop-note-title">
        <WordText text={md.title} />
      </div>
      <ul>
        {md.lines.map((l) => (
          <li key={l.good + (l.variant ?? '')}>
            <WordText text={l.text} />
          </li>
        ))}
      </ul>
      {md.tips.map((t) => (
        <p key={t} className="shop-note-tip">
          <WordText text={t} />
        </p>
      ))}
    </div>
  );
}

/**
 * 始業前: the shop is being prepared. Where the customer will stand: the day's shopping note (on a market day), the
 * way to the market and back, out into the town (to work elsewhere today), and 「店を開ける」. Never covers the shelf,
 * the books or the cup.
 */
export function PrepPanel() {
  const g = useGame();
  const { progress } = g;
  const [why, setWhy] = useState<string | null>(null);
  if (!progress?.today || !progress.townDay || teaPart(progress) !== 0 || progress.today.phase === 'closed') return null;
  const acc = marketAccess(progress);
  const md = progress.townDay.market;
  const trips = md?.trips ?? 0;
  const town = !!jobDay(progress);
  return (
    <div className="day-panel prep-panel" data-testid="prep-panel" aria-label="始業前">
      <div className="dpn-head">
        <span className="dpn-title">始業前</span>
        <span className="dpn-sub hand">店はまだ準備中。{progress.today.queue.length}人のお客さんが来る予定。</span>
      </div>
      {marketDay(progress) ? <ShoppingNote /> : acc ? <p className="dpn-line hand small">今日は仕入れの日ではない。棚の品は足りている。</p> : null}
      {why ? <p className="dpn-why small">{why}</p> : null}
      <div className="dpn-actions">
        {acc && marketDay(progress) ? (
          <button
            type="button"
            className="cv-btn"
            data-testid="go-market"
            onClick={() => {
              sfx('steps');
              setWhy(g.day.goMarket());
            }}
          >
            {trips ? 'もう一度市場へ' : '市場へ買い出しに行く'}
          </button>
        ) : null}
        {town ? (
          <button
            type="button"
            className="cv-btn"
            data-testid="to-town"
            onClick={() => {
              sfx('steps');
              g.jobs.toTown();
            }}
          >
            町へ出る（ほかの仕事場へ）
          </button>
        ) : null}
        <button
          type="button"
          className="cv-btn cv-next"
          data-testid="open-shop"
          onClick={() => {
            sfx('bell');
            g.day.openShop();
          }}
        >
          店を開ける
        </button>
      </div>
    </div>
  );
}

/**
 * 業務中, on a market day: 「配達を頼む」 — send to the market for goods. The fee is said before anything is paid; the
 * goods come with the next customer.
 */
export function SupplyButton({ className = '' }: { className?: string }) {
  const g = useGame();
  const { progress } = g;
  const [ask, setAsk] = useState(false);
  const [why, setWhy] = useState<string | null>(null);
  if (!progress?.townDay || teaPart(progress) !== 1 || !marketDay(progress) || progress.today?.phase === 'closed') return null;
  const acc = marketAccess(progress);
  if (!acc) return null;
  const td = progress.townDay;
  const out = Object.values(td.stock).some((n) => n === 0);
  const coming = (td.incoming ?? []).length;
  return (
    <div className={`supply ${className}`}>
      <button
        type="button"
        className={`supply-btn ${out && !acc.why ? 'supply-want' : ''}`}
        data-testid="order-supplies"
        aria-expanded={ask}
        onClick={() => {
          sfx('paper');
          setWhy(null);
          setAsk(!ask);
        }}
      >
        配達を頼む
        <span className="supply-fee">配送費 {DELIVERY_FEE} 枚</span>
      </button>
      {coming ? <span className="supply-coming hand small">注文した品：次のお客さんのころに届く</span> : null}
      {ask ? (
        <div className="supply-ask" role="group" aria-label="配達の注文" data-testid="supply-ask">
          <p className="small">
            市場の店に使いを出して、品を届けてもらう。品の代金のほかに<b>配送費 {DELIVERY_FEE} 枚</b>がかかる（何も頼まなければ返ってくる）。届くのは次のお客さんが来るころ。
          </p>
          {acc.why || why ? <p className="dpn-why small">{acc.why ?? why}</p> : null}
          <div className="dpn-actions">
            <button type="button" className="cv-btn" onClick={() => setAsk(false)}>
              やめる
            </button>
            <button
              type="button"
              className="cv-btn cv-next"
              data-testid="supply-confirm"
              disabled={!!acc.why}
              onClick={() => {
                sfx('coin');
                const r = g.day.goMarket();
                if (r) setWhy(r);
                else setAsk(false);
              }}
            >
              配送費を払って注文する
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/**
 * 業務後: the shop is closed. The day's house delivery, the market (for tomorrow), the town (a second shift at a
 * workplace open in the evening), and home with the ledger. The catalogue and the books stay on the counter.
 */
export function ClosedPanel() {
  const g = useGame();
  const { progress } = g;
  const [why, setWhy] = useState<string | null>(null);
  if (!progress?.today || progress.today.phase !== 'closed' || !progress.townDay) return null;
  const td = progress.townDay;
  const acc = marketAccess(progress);
  const deliver = deliveryWaiting(progress) && !td.evening;
  const d = jobDay(progress);
  const pantry = Object.entries(progress.town.pantry ?? {}).filter(([, n]) => (n ?? 0) > 0).length;
  const served = progress.today.results.length;
  return (
    <div className="day-panel closed-panel" data-testid="closed-panel" aria-label="業務後">
      <div className="dpn-head">
        <span className="dpn-title">業務後</span>
        <span className="dpn-sub hand">
          店を閉めた。今日のお客さんは{served}人。
          {td.delivery?.phase === 'result' ? '配達も済んだ。' : ''}
        </span>
      </div>
      {deliver ? <p className="dpn-line hand small">配達の包みがひとつ待っている。</p> : null}
      {pantry ? <p className="dpn-line hand small">明日の分の品を、奥の部屋に置いてある。</p> : null}
      {why ? <p className="dpn-why small">{why}</p> : null}
      <div className="dpn-actions">
        {deliver ? (
          <button
            type="button"
            className="cv-btn"
            data-testid="go-delivery"
            onClick={() => {
              sfx('steps');
              g.day.goDelivery();
            }}
          >
            配達に出かける
          </button>
        ) : null}
        {acc ? (
          <button
            type="button"
            className="cv-btn"
            data-testid="go-market"
            disabled={!!acc.why}
            title={acc.why ?? undefined}
            onClick={() => {
              sfx('steps');
              setWhy(g.day.goMarket());
            }}
          >
            市場へ（明日の分の仕入れ）
          </button>
        ) : null}
        {d && canGoToTown(progress) ? (
          <button
            type="button"
            className="cv-btn"
            data-testid="to-town"
            onClick={() => {
              sfx('steps');
              g.jobs.toTown();
            }}
          >
            町へ出る{d.evening ? '' : d.work === TEAHOUSE ? '（業務後のひと仕事も）' : ''}
          </button>
        ) : null}
        <button
          type="button"
          className="cv-btn cv-next"
          data-testid="next-day"
          onClick={() => {
            sfx('bell');
            g.closeDay();
          }}
        >
          家に帰って帳簿をつける
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------------------------- chrome hooks

export function CornerHooks({ onSettings }: { onSettings: () => void }) {
  const g = useGame();
  const muted = g.settings.muted;
  return (
    <div className="corner-hooks">
      <button
        type="button"
        className="hook-btn"
        onClick={() => g.updateSettings({ muted: !muted })}
        aria-label={muted ? '音を出す' : '音を消す'}
        aria-pressed={muted}
        data-testid="mute"
        title={muted ? '音を出す' : '音を消す'}
      >
        <svg viewBox="0 0 24 24" className="hook-glyph" aria-hidden>
          <path d="M6 16 V11 a6 6 0 0 1 12 0 V16 l2 2 H4 Z" fill="currentColor" />
          <circle cx="12" cy="20" r="2" fill="currentColor" />
          {muted ? <path d="M3 3 L21 21" stroke="#7a1a10" strokeWidth="2.6" strokeLinecap="round" /> : null}
        </svg>
      </button>
      <button type="button" className="hook-btn" onClick={onSettings} aria-label="設定" data-testid="settings" title="設定・メニュー">
        <svg viewBox="0 0 24 24" className="hook-glyph" aria-hidden>
          <path
            d="M12 8.5 a3.5 3.5 0 1 0 0.01 0 Z M10.4 2 h3.2 l0.5 2.6 a7.6 7.6 0 0 1 2 1.1 l2.5 -0.9 1.6 2.8 -2 1.7 a7.6 7.6 0 0 1 0 2.4 l2 1.7 -1.6 2.8 -2.5 -0.9 a7.6 7.6 0 0 1 -2 1.1 L13.6 22 h-3.2 l-0.5 -2.6 a7.6 7.6 0 0 1 -2 -1.1 l-2.5 0.9 -1.6 -2.8 2 -1.7 a7.6 7.6 0 0 1 0 -2.4 l-2 -1.7 1.6 -2.8 2.5 0.9 a7.6 7.6 0 0 1 2 -1.1 Z"
            fill="currentColor"
            fillRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
