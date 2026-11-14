/**
 * The morning market as a scene: a street of stalls (awnings in each stall's colour, goods with
 * paper price tags, a drawn vendor per stall), the shopping note pinned in view, the basket and
 * the coin purse. At a stall the vendor talks in a speech bubble (clickable words, listen), the
 * player points at goods, says how many, and pays by dropping coins on the vendor's tray.
 *
 * Logic is the market engine's (src/activities/market/engine.ts) through GameApi.market.
 */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { hasNextSegment } from '../../activities/day';
import { canBargain, findOffer, goodName, maxUnits, priceTag, variantText } from '../../activities/market/engine';
import { townOf } from '../../activities/town/text';
import { plain } from '../../core/gamedata';
import type { MarketDay, Offer, StallDay, TalkLine } from '../../core/townTypes';
import { CustomerArt, lookFor, type Expression } from '../art/customer';
import { ContainerArt, PieceArt } from '../art/ingredients';
import { skyAt } from '../art/sky';
import { BasketArt, CoinArt, MarketBackdrop, PurseArt, SignpostArt, StallFrameArt } from '../art/town';
import { SpeakButton, WordText } from '../components/WordText';
import { useMobile } from '../layout';
import { Raster } from '../art/Raster';
import { lineMs, useTalkBurst } from '../useTalk';
import { BookProps, CornerHooks } from '../scene/parts';
import { useStageScale } from '../scene/ShopScene';
import { sfx } from '../sound';
import { speak, useSpeechAvailable } from '../speech';
import { useGame } from '../useGame';
import { TownNoticePaper } from './common';

const MORNING = skyAt(0.04);

function useMarket(): MarketDay | null {
  return useGame().townDay?.market ?? null;
}

// ------------------------------------------------------------------------------------- pieces

/** The shopping note, pinned (target language only). */
export function ShoppingNote({ compact = false }: { compact?: boolean }) {
  const md = useMarket();
  const [open, setOpen] = useState(!compact);
  if (!md) return null;
  return (
    <div className={`mk-note ${compact ? 'mk-note-compact' : ''} ${open ? 'open' : ''}`} data-testid="shopping-note">
      <span className="mk-pin" aria-hidden />
      <div className="mk-note-title">
        <WordText text={md.title} />
        <SpeakButton text={[md.title, ...md.lines.map((l) => l.text)].join(' ')} label="" className="speak-round" />
        {compact ? (
          <button type="button" className="mk-note-toggle" onClick={() => setOpen(!open)} aria-expanded={open}>
            {open ? '▴' : '▾'}
          </button>
        ) : null}
      </div>
      {open || !compact ? (
        <>
          <ul className="mk-note-lines">
            {md.lines.map((l, i) => (
              <li key={i}>
                <WordText text={l.text} />
              </li>
            ))}
          </ul>
          {md.tips.map((t, i) => (
            <p key={i} className="mk-note-tip">
              <WordText text={t} />
            </p>
          ))}
        </>
      ) : (
        <div className="mk-note-peek">
          {md.lines.map((l, i) => (
            <WordText key={i} text={l.text} />
          ))}
        </div>
      )}
    </div>
  );
}

/** The basket with what was bought (drawn pieces + counts). */
function Basket() {
  const md = useMarket();
  const { data } = useGame();
  const town = data ? townOf(data) : null;
  if (!md || !town) return null;
  return (
    <div className="mk-basket" aria-label="かご">
      <BasketArt />
      <div className="mk-basket-goods">
        {md.basket.map((b, i) => (
          <span key={i} className="mk-basket-item" title={plain(goodName(town, b.good))}>
            <svg viewBox="-20 -20 40 40" aria-hidden>
              <PieceArt ing={b.good} />
            </svg>
            <span>×{b.units}</span>
          </span>
        ))}
      </div>
      <span className="desk-tag">かご</span>
    </div>
  );
}

/** The coin purse: shows the money; opened while paying, its coins can be dropped on the tray. */
function Purse({ onCoin, paying, trayTotal }: { onCoin?: (c: number) => void; paying: boolean; trayTotal: number }) {
  const { progress, data } = useGame();
  const town = data ? townOf(data) : null;
  if (!progress || !town) return null;
  const left = progress.town.money - trayTotal;
  return (
    <div className={`mk-purse ${paying ? 'open' : ''}`} data-testid="money">
      <div className="mk-purse-bag">
        <PurseArt open={paying} />
        <span className="mk-purse-tag">{left}</span>
      </div>
      {paying ? (
        <div className="mk-coins" role="group" aria-label="財布の硬貨（トレーに置く）">
          {town.shared.market.coins.map((c) => (
            <button key={c} type="button" className="mk-coin" data-coin={c} disabled={c > left} onClick={() => onCoin?.(c)} aria-label={`${c}の硬貨を置く`}>
              <CoinArt value={c} />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** The vendor's tray on the counter with the coins put on it. */
function Tray({ coins, onTake }: { coins: number[]; onTake: () => void }) {
  return (
    <button type="button" className="mk-tray" onClick={onTake} disabled={!coins.length} aria-label="トレーの硬貨を財布に戻す" data-testid="tray">
      <svg viewBox="0 0 200 70" className="mk-tray-art" aria-hidden>
        <ellipse cx="100" cy="44" rx="94" ry="22" fill="url(#g-brass)" stroke="#5a3c12" strokeWidth="3" />
        <ellipse cx="100" cy="40" rx="78" ry="15" fill="#b8862a" opacity="0.6" />
      </svg>
      <span className="mk-tray-coins">
        {coins.map((c, i) => (
          <span key={i} className="mk-tray-coin" style={{ ['--i' as string]: i }}>
            <CoinArt value={c} />
          </span>
        ))}
      </span>
      {coins.length ? <span className="mk-tray-sum">{coins.reduce((a, b) => a + b, 0)}</span> : null}
    </button>
  );
}

function PriceTag({ town, o, interactive }: { town: NonNullable<ReturnType<typeof townOf>>; o: Offer; interactive: boolean }) {
  return (
    <span className="mk-tag">
      <WordText text={priceTag(town, o.good, o.price)} interactive={interactive} />
      {o.variant ? (
        <span className="mk-tag-variant">
          <WordText text={variantText(town, o.variant)} interactive={interactive} />
        </span>
      ) : null}
    </span>
  );
}

function vendorFace(md: MarketDay): Expression {
  const last = [...md.talk].reverse().find((t) => t.who === 'vendor');
  return (last?.face as Expression | undefined) ?? 'happy';
}

/** One stall seen from the street: awning, vendor, goods with tags (tap to walk up). */
function StallFront({ st, onOpen }: { st: StallDay; onOpen: () => void }) {
  const { data } = useGame();
  const town = data ? townOf(data) : null;
  if (!town) return null;
  const def = town.shared.market.stalls.find((x) => x.id === st.id)!;
  const shown = [...new Map(st.offers.map((o) => [o.good, o] as const)).keys()].map((g) => st.offers.find((o) => o.good === g)!);
  const n = shown.length + st.soldOut.length;
  const cols = n > 3 ? Math.ceil(n / 2) : Math.max(1, n);
  return (
    <button type="button" className={`mk-stall mk-stall-${def.colour}`} onClick={onOpen} data-stall={st.id} aria-label={`${def.colour} の屋台へ行く`}>
      <Raster className="stall-frame" label="stall">
        <StallFrameArt colour={def.colour} />
      </Raster>
      <span className="mk-stall-vendor" aria-hidden>
        <CustomerArt look={lookFor(`v_${st.id}`, def.vendor)} ex="happy" />
      </span>
      {/* From the street: one jar per good with the price of its usual kind (the other kinds are on
          the counter when you walk up). Up to three per row; a busy stall gets a second row. */}
      <span className={`mk-stall-goods ${shown.length + st.soldOut.length > 3 ? 'mk-two-rows' : ''}`} style={{ ['--cols' as string]: cols }}>
        {shown.map((o) => (
          <span key={o.id} className="mk-good">
            <ContainerArt ing={o.good} />
            <PriceTag town={town} o={o} interactive={false} />
          </span>
        ))}
        {st.soldOut.map((ing) => (
          <span key={ing} className="mk-good mk-soldout" aria-label="品切れ">
            <ContainerArt ing={ing} empty />
          </span>
        ))}
      </span>
    </button>
  );
}

/** The vendor's speech bubble: the latest line big, earlier lines small above. */
function VendorBubble({ lines }: { lines: TalkLine[] }) {
  const { lang, settings } = useGame();
  const voice = useSpeechAvailable(lang ?? 'en');
  const spoken = useRef(0);
  useEffect(() => {
    if (lines.length < spoken.current) spoken.current = 0;
    for (let i = spoken.current; i < lines.length; i++) if (lines[i].audioOnly && voice && lang) speak(plain(lines[i].text), lang, settings.speechRate);
    spoken.current = lines.length;
  }, [lines, voice, lang, settings.speechRate]);
  const vendorIdx = lines.map((l, i) => (l.who === 'vendor' ? i : -1)).filter((i) => i >= 0);
  const lastIdx = vendorIdx[vendorIdx.length - 1];
  const earlier = lines.slice(Math.max(0, lines.length - 5), lastIdx).filter((l) => l.who !== 'narration');
  const last = lastIdx !== undefined ? lines[lastIdx] : null;
  const after = lastIdx !== undefined ? lines.slice(lastIdx + 1) : [];
  return (
    <div className="bubble-paper mk-bubble" data-testid="vendor-bubble" key={lines.length}>
      {earlier.length ? (
        <div className="mk-earlier">
          {earlier.map((l, i) => (l.who === 'vendor' ? <WordText key={i} text={l.text} /> : <YouChip key={i} text={l.text} />))}
        </div>
      ) : null}
      {last ? (
        last.audioOnly && voice ? (
          <div className="bubble-audio">
            <span className="sound-waves" aria-hidden>
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
            <SpeakButton text={last.text} label="もう一度聞く" />
            <span className="small muted">声だけ（払ったあとで文字が見えます）</span>
          </div>
        ) : (
          <div className="bubble-line">
            <WordText text={last.text} className="order-text" />
            <SpeakButton text={last.text} label="" className="speak-round" />
          </div>
        )
      ) : null}
      {after.map((l, i) => (
        <YouChip key={`a${i}`} text={l.text} />
      ))}
    </div>
  );
}

/** What the player said / did (×3, coins, …?) as a small chip. */
function YouChip({ text }: { text: string }) {
  const coin = text.startsWith('🪙');
  return (
    <span className="mk-you">
      {coin ? (
        <>
          <span className="coin-glyph" aria-hidden /> {text.slice(2)}
        </>
      ) : (
        text
      )}
    </span>
  );
}

/** Quantity chooser: tally marks on a slate. */
function Quantity({ o, onOrder }: { o: Offer; onOrder: (n: number) => void }) {
  const [n, setN] = useState(1);
  useEffect(() => setN(1), [o.id]);
  const max = maxUnits(o);
  return (
    <div className="mk-qty" role="group" aria-label="数">
      <button type="button" className="mk-qty-btn" onClick={() => setN(Math.max(1, n - 1))} aria-label="減らす">
        −
      </button>
      <span className="mk-qty-slate" data-testid="units">
        <span className="mk-qty-piece" aria-hidden>
          {Array.from({ length: n }, (_, i) => (
            <span key={i} className="mk-qty-one">
              <ContainerArt ing={o.good} />
            </span>
          ))}
        </span>
        <span className="mk-qty-n">×{n}</span>
      </span>
      <button type="button" className="mk-qty-btn" onClick={() => setN(Math.min(max, n + 1))} aria-label="増やす">
        ＋
      </button>
      <button type="button" className="cv-btn cv-next mk-ask" data-testid="order" onClick={() => onOrder(n)}>
        これをください
      </button>
    </div>
  );
}

// ------------------------------------------------------------------------------------- the open stall

function StallOpen() {
  const g = useGame();
  const md = useMarket()!;
  const lastVendor = [...(md?.talk ?? [])].reverse().find((l) => l.who === 'vendor');
  const vendorTalk = useTalkBurst(md && lastVendor ? `${md.stall}:${md.talk.length}` : null, lineMs(lastVendor?.text ?? '', g.lang === 'zh'));
  const mobile = useMobile();
  const { data, progress } = g;
  const [tray, setTray] = useState<number[]>([]);
  const pendingKey = md.pending ? `${md.pending.offer}:${md.pending.total}` : '';
  useEffect(() => setTray([]), [pendingKey, md.talk.length]);
  const town = data ? townOf(data) : null;
  if (!town || !progress) return null;
  const st = md.stalls.find((s) => s.id === md.stall)!;
  const def = town.shared.market.stalls.find((s) => s.id === st.id)!;
  const sel = md.selected ? findOffer(md, md.selected) : undefined;
  const trayTotal = tray.reduce((a, b) => a + b, 0);
  const paying = !!md.pending;
  const offerEl = (o: (typeof st.offers)[0]) => (
    <div key={o.id} className={`mk-offer ${md.selected === o.id ? 'on' : ''}`}>
      <button type="button" className="mk-offer-btn" disabled={paying} onClick={() => g.market.selectOffer(o.id)} data-offer={o.id} aria-pressed={md.selected === o.id} aria-label={plain(goodName(town, o.good))}>
        <ContainerArt ing={o.good} />
      </button>
      <PriceTag town={town} o={o} interactive />
    </div>
  );
  const soldEls = st.soldOut.map((ing) => (
    <div key={ing} className="mk-offer mk-soldout" aria-label="品切れ">
      <ContainerArt ing={ing} empty />
    </div>
  ));
  // Desktop: a busy stall (more than six offers) lays its goods out on two tiers, the back one a
  // step higher, so every price tag stays readable.
  const tiers = !mobile && st.offers.length + st.soldOut.length > 6;
  const half = Math.ceil((st.offers.length + st.soldOut.length) / 2);
  const goods = tiers ? (
    <div className="mk-counter-goods mk-tiered">
      <div className="mk-tier mk-tier-back">{st.offers.slice(0, half).map(offerEl)}</div>
      <div className="mk-tier mk-tier-front">
        {st.offers.slice(half).map(offerEl)}
        {soldEls}
      </div>
    </div>
  ) : (
    <div className="mk-counter-goods">
      {st.offers.map(offerEl)}
      {soldEls}
      {st.offers.length === 0 && !st.soldOut.length ? <p className="cv-narr hand">（並んでいる品がない）</p> : null}
    </div>
  );
  const actions: ReactNode = paying ? (
    <div className="mk-pay-actions">
      <button type="button" className="cv-btn" onClick={() => g.market.cancel()}>
        やめる
      </button>
      {canBargain(md) ? (
        <button type="button" className="cv-btn" data-testid="bargain" onClick={() => g.market.bargain()}>
          値切ってみる
        </button>
      ) : null}
      <button
        type="button"
        className="cv-btn cv-next"
        data-testid="pay"
        disabled={!trayTotal}
        onClick={() => {
          sfx('coin');
          g.market.pay(trayTotal);
        }}
      >
        トレーを差し出す
      </button>
    </div>
  ) : sel ? (
    <Quantity o={sel} onOrder={(n) => g.market.order(n)} />
  ) : (
    <p className="mk-hint hand">品を指さすと、店主が数を聞いてくる。</p>
  );
  return (
    <div className={`mk-open mk-open-${def.colour} ${paying ? 'paying' : ''}`} data-stall-open={st.id}>
      <div className="mk-open-awning" aria-hidden>
        <Raster className="stall-frame" label="stall-open">
          <StallFrameArt colour={def.colour} w={mobile ? 390 : 1600} h={mobile ? 560 : 1000} />
        </Raster>
      </div>
      <div className="mk-open-vendor">
        <CustomerArt look={lookFor(`v_${st.id}`, def.vendor)} ex={vendorFace(md)} pose={paying ? 'hold' : vendorTalk ? 'explain' : 'rest'} talking={vendorTalk} />
      </div>
      <div className="mk-open-bubble">
        <VendorBubble lines={md.talk} />
      </div>
      {goods}
      {paying ? (
        <Tray
          coins={tray}
          onTake={() => {
            sfx('pickup');
            setTray([]);
          }}
        />
      ) : null}
      <div className="mk-open-actions">{actions}</div>
      <div className="mk-open-purse">
        <Purse
          paying={paying}
          trayTotal={trayTotal}
          onCoin={(c) => {
            sfx('clink');
            setTray([...tray, c]);
          }}
        />
      </div>
      <button type="button" className="mk-back" onClick={() => g.market.leaveStall()} disabled={paying}>
        <SignpostArt flip />
        <span>通りへ戻る</span>
      </button>
    </div>
  );
}

// ------------------------------------------------------------------------------------- the street

function Street() {
  const g = useGame();
  const md = useMarket();
  if (!md) return null;
  return (
    <div className="mk-street">
      {md.stalls.map((s) => (
        <StallFront
          key={s.id}
          st={s}
          onOpen={() => {
            sfx('steps');
            g.market.openStall(s.id);
          }}
        />
      ))}
    </div>
  );
}

/** Leave the market (or, done, go open the shop). */
function LeaveSign() {
  const g = useGame();
  const md = useMarket();
  if (!md || !g.progress) return null;
  if (md.done)
    return hasNextSegment(g.progress) ? (
      <button type="button" className="mk-leave mk-leave-go" data-testid="next-segment" onClick={() => g.nextSegment()}>
        <SignpostArt />
        <span>茶房を開けに戻る</span>
      </button>
    ) : null;
  return (
    <button type="button" className="mk-leave" data-testid="finish-market" disabled={!!md.pending} onClick={() => g.market.finish()}>
      <SignpostArt />
      <span>買い物を終える</span>
    </button>
  );
}

function DonePaper() {
  const md = useMarket();
  if (!md?.done) return null;
  return (
    <div className="letter mk-done">
      <div className="letter-title">買い物を終えた</div>
      <p>かごの品は、茶房の棚に並べよう。</p>
    </div>
  );
}

// ------------------------------------------------------------------------------------- compositions

export function MarketScene({ onSettings }: { onSettings: () => void }) {
  const mobile = useMobile();
  const md = useMarket();
  if (!md) return null;
  return mobile ? <MobileMarket onSettings={onSettings} /> : <DesktopMarket onSettings={onSettings} />;
}

function DesktopMarket({ onSettings }: { onSettings: () => void }) {
  const md = useMarket()!;
  const { ref, scale } = useStageScale(1600, 1000);
  return (
    <div className="scene-viewport town-viewport" ref={ref} data-segment="market">
      <div className="stage mk-stage" style={{ width: 1600, height: 1000, transform: `translate(-50%, -50%) scale(${scale})` }}>
        <MarketBackdrop sky={MORNING} />
        {md.stall && !md.done ? <StallOpen /> : <Street />}
        <div className="mk-d-note">
          <ShoppingNote />
        </div>
        {!md.stall || md.done ? (
          <>
            <div className="mk-d-basket">
              <Basket />
            </div>
            <div className="mk-d-purse">
              <Purse paying={false} trayTotal={0} />
            </div>
            <div className="mk-d-leave">
              <LeaveSign />
            </div>
          </>
        ) : (
          <div className="mk-d-basket mk-d-basket-small">
            <Basket />
          </div>
        )}
        <div className="mk-d-books">
          <BookProps compact />
        </div>
        <div className="d-paper">
          <TownNoticePaper />
          <DonePaper />
        </div>
        <CornerHooks onSettings={onSettings} />
      </div>
    </div>
  );
}

function MobileMarket({ onSettings }: { onSettings: () => void }) {
  const md = useMarket()!;
  return (
    <div className="m-town m-market" data-segment="market">
      <div className="m-town-bg">
        <MarketBackdrop sky={MORNING} W={400} H={860} ground={330} />
      </div>
      <div className="m-town-top">
        <ShoppingNote compact />
        <CornerHooks onSettings={onSettings} />
      </div>
      <div className="m-town-main">{md.stall && !md.done ? <StallOpen /> : <Street />}</div>
      {!md.stall || md.done ? (
        <div className="m-town-bottom">
          <Basket />
          <Purse paying={false} trayTotal={0} />
          <div className="m-town-books">
            <BookProps compact />
          </div>
          <LeaveSign />
        </div>
      ) : null}
      <div className="m-paper">
        <TownNoticePaper />
        <DonePaper />
      </div>
    </div>
  );
}
