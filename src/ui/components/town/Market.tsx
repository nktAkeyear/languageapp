import { useEffect, useRef, useState } from 'react';
import { hasNextSegment } from '../../../activities/day';
import { canBargain, findOffer, goodName, maxUnits, priceTag, variantText } from '../../../activities/market/engine';
import { townOf } from '../../../activities/town/text';
import { plain } from '../../../core/gamedata';
import type { MarketDay, Offer, TalkLine } from '../../../core/townTypes';
import { speak, useSpeechAvailable } from '../../speech';
import { useGame } from '../../useGame';
import { FACE_EMOJI } from '../CustomerPanel';
import { IngredientIcon } from '../Ingredient';
import { SpeakButton, WordText } from '../WordText';

export const COLOUR_CSS: Record<string, string> = { red: '#b8452f', yellow: '#d9a520', blue: '#3d6c9e', green: '#4d7a3a' };

function useMarket(): MarketDay | null {
  const { townDay } = useGame();
  return townDay?.market ?? null;
}

/** Japanese notes for newly opened town activities / levels (first segment of the day). */
export function TownNotice() {
  const { townDay } = useGame();
  const [hidden, setHidden] = useState(false);
  if (!townDay || hidden || townDay.seg !== 0 || !townDay.notes.length || townDay.segments[0] === 'shop') return null;
  return (
    <div className="notice">
      <div className="notice-title">今日の知らせ</div>
      {townDay.notes.map((n) => (
        <p key={n}>{n}</p>
      ))}
      <button type="button" className="btn btn-small" onClick={() => setHidden(true)}>
        わかった
      </button>
    </div>
  );
}

/** The shopping note (target language only). */
export function MarketNote({ compact = false }: { compact?: boolean }) {
  const md = useMarket();
  if (!md) return null;
  if (compact)
    return (
      <div className="order-strip note-strip">
        <span aria-hidden>📝</span>
        {md.lines.map((l, i) => (
          <WordText key={i} text={l.text} />
        ))}
      </div>
    );
  return (
    <div className="shopping-note" data-testid="shopping-note">
      <div className="note-title">
        <WordText text={md.title} />
        <SpeakButton text={[md.title, ...md.lines.map((l) => l.text)].join(' ')} label="" />
      </div>
      <ul className="note-lines">
        {md.lines.map((l, i) => (
          <li key={i}>
            <WordText text={l.text} />
            <SpeakButton text={l.text} label="" />
          </li>
        ))}
      </ul>
      {md.tips.map((t, i) => (
        <p key={i} className="note-tip">
          <WordText text={t} />
        </p>
      ))}
    </div>
  );
}

/** Purse, basket and the way out of the market. */
export function Purse() {
  const g = useGame();
  const md = useMarket();
  const { progress, data } = g;
  if (!md || !progress || !data) return null;
  const town = townOf(data);
  return (
    <div className="purse">
      <div className="purse-row">
        <span className="purse-money" title="財布">
          👛 🪙 <strong>{progress.town.money}</strong>
        </span>
        <span className="small muted">今日使った額 🪙{md.spent}</span>
      </div>
      <div className="basket" aria-label="かご">
        <span className="small muted">かご：</span>
        {md.basket.length === 0 ? <span className="small muted">（まだ何も買っていない）</span> : null}
        {md.basket.map((b, i) => (
          <span key={i} className="basket-item">
            <IngredientIcon id={b.good} size={24} />
            {b.variant && town ? <WordText text={variantText(town, b.variant)} interactive={false} className="small" /> : null}
            <span>×{b.units}</span>
          </span>
        ))}
      </div>
      {md.done ? (
        <div className="market-done">
          <p className="small">市場での買い物を終えた。買った品は棚に並べた。</p>
          {hasNextSegment(progress) ? (
            <button type="button" className="btn btn-primary btn-big" data-testid="next-segment" onClick={() => g.nextSegment()}>
              🫖 茶房を開ける
            </button>
          ) : null}
        </div>
      ) : (
        <button type="button" className="btn btn-big" data-testid="finish-market" disabled={!!md.pending} onClick={() => g.market.finish()}>
          🏠 市場を出る（買い物を終える）
        </button>
      )}
    </div>
  );
}

/** The street of stalls, or the open stall. */
export function Stalls({ withPurse = false }: { withPurse?: boolean }) {
  const g = useGame();
  const md = useMarket();
  const { data } = g;
  if (!md || !data) return null;
  const town = townOf(data);
  if (!town) return null;
  if (md.done)
    return (
      <div className="market-closed">
        <p>市場をあとにした。</p>
        {withPurse ? <Purse /> : null}
      </div>
    );
  if (md.stall) return <StallView />;
  return (
    <div className="stalls">
      <p className="small muted">屋台を選んで近づこう。値札と店主の言葉だけが手がかり。</p>
      <div className="stall-grid">
        {md.stalls.map((s) => {
          const def = town.shared.market.stalls.find((x) => x.id === s.id)!;
          const goods = [...new Set([...s.offers.map((o) => o.good), ...s.soldOut])];
          return (
            <button key={s.id} type="button" className="stall-card" data-stall={s.id} onClick={() => g.market.openStall(s.id)}>
              <span className="awning" style={{ background: COLOUR_CSS[def.colour] }} aria-hidden />
              <span className="stall-vendor" aria-hidden>
                {def.vendor}
                {def.icon}
              </span>
              <span className="stall-goods">
                {goods.map((ing) => (
                  <IngredientIcon key={ing} id={ing} size={26} />
                ))}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Talk({ lines }: { lines: TalkLine[] }) {
  const { lang, settings } = useGame();
  const voice = useSpeechAvailable(lang ?? 'en');
  const spoken = useRef(0);
  const end = useRef<HTMLDivElement>(null);
  // Audio-only lines are read out when they appear.
  useEffect(() => {
    if (lines.length < spoken.current) spoken.current = 0;
    for (let i = spoken.current; i < lines.length; i++) if (lines[i].audioOnly && voice && lang) speak(plain(lines[i].text), lang, settings.speechRate);
    spoken.current = lines.length;
    end.current?.scrollIntoView?.({ block: 'nearest' });
  }, [lines, voice, lang, settings.speechRate]);
  return (
    <div className="talk">
      {lines.map((l, i) =>
        l.who === 'vendor' ? (
          <div key={i} className="bubble talk-vendor">
            {l.audioOnly && voice ? (
              <span className="audio-only small muted">
                （声だけ）
                <SpeakButton text={l.text} label="もう一度聞く" />
              </span>
            ) : (
              <span className="order-line">
                <WordText text={l.text} className="talk-text" />
                <SpeakButton text={l.text} label="" />
              </span>
            )}
          </div>
        ) : (
          <div key={i} className="talk-you">
            {l.text}
          </div>
        ),
      )}
      <div ref={end} />
    </div>
  );
}

function OfferCard({ o, selected, disabled, onPick }: { o: Offer; selected: boolean; disabled: boolean; onPick: () => void }) {
  const { data } = useGame();
  const town = data ? townOf(data) : null;
  if (!town) return null;
  return (
    <button type="button" className={`offer ${selected ? 'offer-on' : ''}`} disabled={disabled} onClick={onPick} data-offer={o.id}>
      <IngredientIcon id={o.good} size={40} />
      <span className="offer-name">
        <WordText text={goodName(town, o.good)} interactive={false} />
      </span>
      {o.variant ? (
        <span className="offer-variant">
          <WordText text={variantText(town, o.variant)} interactive={false} />
        </span>
      ) : null}
      <span className="price-tag">
        <WordText text={priceTag(town, o.good, o.price)} interactive={false} />
      </span>
    </button>
  );
}

function StallView() {
  const g = useGame();
  const md = useMarket()!;
  const { data, progress } = g;
  const [units, setUnits] = useState(1);
  const [tray, setTray] = useState<number[]>([]);
  const pendingKey = md.pending ? `${md.pending.offer}:${md.pending.total}` : '';
  useEffect(() => setTray([]), [pendingKey, md.talk.length]);
  useEffect(() => setUnits(1), [md.selected]);
  if (!data || !progress) return null;
  const town = townOf(data)!;
  const st = md.stalls.find((s) => s.id === md.stall)!;
  const def = town.shared.market.stalls.find((s) => s.id === st.id)!;
  const lastVendor = [...md.talk].reverse().find((t) => t.who === 'vendor');
  const sel = md.selected ? findOffer(md, md.selected) : undefined;
  const trayTotal = tray.reduce((a, b) => a + b, 0);
  return (
    <div className="stall-view" data-stall-open={st.id}>
      <div className="stall-head" style={{ borderTopColor: COLOUR_CSS[def.colour] }}>
        <button type="button" className="btn btn-small" onClick={() => g.market.leaveStall()} disabled={!!md.pending}>
          ← 通りへ戻る
        </button>
        <span className="stall-vendor-big" aria-hidden>
          {def.vendor}
          <span className="face">{FACE_EMOJI[lastVendor?.face ?? 'neutral']}</span>
        </span>
        <span className="awning-chip" style={{ background: COLOUR_CSS[def.colour] }} aria-hidden>
          {def.icon}
        </span>
      </div>
      <Talk lines={md.talk} />
      <div className="offers">
        {st.offers.map((o) => (
          <OfferCard key={o.id} o={o} selected={md.selected === o.id} disabled={!!md.pending} onPick={() => g.market.selectOffer(o.id)} />
        ))}
        {st.offers.length === 0 ? <p className="small muted">（並んでいる品がない）</p> : null}
      </div>
      {sel && !md.pending ? (
        <div className="buy-row">
          <span className="small muted">数</span>
          <div className="stepper">
            <button type="button" className="btn" onClick={() => setUnits(Math.max(1, units - 1))} aria-label="減らす">
              −
            </button>
            <span className="count" data-testid="units">
              {units}
            </span>
            <button type="button" className="btn" onClick={() => setUnits(Math.min(maxUnits(sel), units + 1))} aria-label="増やす">
              ＋
            </button>
          </div>
          <span className="buy-preview" aria-hidden>
            <IngredientIcon id={sel.good} size={22} />×{units}
          </span>
          <button type="button" className="btn btn-primary" data-testid="order" onClick={() => g.market.order(units)}>
            これをください
          </button>
        </div>
      ) : null}
      {md.pending ? (
        <div className="pay-box">
          <div className="small muted">硬貨を出して払う（店主の言った額を）</div>
          <div className="coins">
            {town.shared.market.coins.map((c) => (
              <button
                key={c}
                type="button"
                className={`coin coin-${c}`}
                data-coin={c}
                disabled={trayTotal + c > progress.town.money}
                onClick={() => setTray([...tray, c])}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="tray" aria-label="出す硬貨">
            {tray.length ? tray.map((c, i) => <span key={i} className={`coin coin-mini coin-${c}`}>{c}</span>) : <span className="small muted">（まだ出していない）</span>}
            <span className="tray-total">🪙{trayTotal}</span>
          </div>
          <div className="pay-actions">
            <button type="button" className="btn" onClick={() => setTray([])} disabled={!tray.length}>
              硬貨を戻す
            </button>
            <button type="button" className="btn" onClick={() => g.market.cancel()}>
              やめる
            </button>
            {canBargain(md) ? (
              <button type="button" className="btn" data-testid="bargain" onClick={() => g.market.bargain()}>
                値切ってみる
              </button>
            ) : null}
            <button type="button" className="btn btn-primary" data-testid="pay" disabled={!trayTotal} onClick={() => g.market.pay(trayTotal)}>
              払う
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
