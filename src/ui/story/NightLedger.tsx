/**
 * Night in the shop: the window is dark, the lamp is lit, the ledger book lies open on the
 * counter and the day's entries are written in one by one. Blowing out the lamp ends the day.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { storyDismiss } from '../../story/engine';
import { storyOf } from '../../story/text';
import type { Ledger } from '../../story/types';
import type { IngredientId } from '../../core/types';
import { CustomerArt, lookFor } from '../art/customer';
import { DocObjectArt, docLook } from '../art/documents';
import { ContainerArt, PieceArt } from '../art/ingredients';
import { RenoRoom } from '../art/reno';
import { Raster } from '../art/Raster';
import { ingredientsAtStage } from '../../core/gamedata';
import { useReno } from '../reno/useReno';
import { renoView } from '../../renovation/engine';
import { SHELF, STAGE_H, STAGE_W, ShopBackdrop, ShopLive } from '../art/shop';
import { NIGHT_SKY } from '../art/sky';
import { shortGloss } from '../components/WordText';
import { useMobile } from '../layout';
import { sfx } from '../sound';
import { useGame } from '../useGame';
import { useUi } from '../uiState';
import { personOf } from './people';
import type { Act } from './StoryStage';

/**
 * The night shop behind the ledger: the same drawn shop as by day (1600×1000 design units), scaled
 * to cover the screen — dark window, lamp lit, the shelf stocked (jars drawn, not interactive) and
 * everything the renovation added. On a phone the left part (window, door, lamp light) shows.
 */
const NONE: ReadonlySet<never> = new Set();

export function NightBackdrop() {
  const mobile = useMobile();
  const g = useGame();
  const reno = useReno();
  const ref = useRef<HTMLDivElement>(null);
  const [box, setBox] = useState({ w: 1280, h: 800 });
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => setBox({ w: el.clientWidth || 1280, h: el.clientHeight || 800 });
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const scale = Math.max(box.w / STAGE_W, box.h / STAGE_H);
  const left = mobile ? 0 : (box.w - STAGE_W * scale) / 2;
  const top = (box.h - STAGE_H * scale) / 2;
  const shelf = g.data && g.progress ? ingredientsAtStage(g.data, g.progress.stage).slice(0, SHELF.rows * SHELF.cols) : [];
  return (
    <div className="night-bg" ref={ref} aria-hidden>
      <div className="night-stage" style={{ width: STAGE_W, height: STAGE_H, transform: `translate(${left}px, ${top}px) scale(${scale})` }}>
        <Raster label="night">
          <ShopBackdrop sky={NIGHT_SKY} closed paint={reno.has('paint')} />
        </Raster>
        <ShopLive sky={NIGHT_SKY} ringing={false} />
        <Raster label="reno-night">
          <RenoRoom owned={reno.owned} fresh={NONE} layer="static" />
        </Raster>
        <RenoRoom owned={reno.owned} fresh={NONE} layer="live" />
        <div className="night-shelf" style={{ left: SHELF.x, top: SHELF.y, width: SHELF.w, height: SHELF.rows * SHELF.rowH, gridTemplateColumns: `repeat(${SHELF.cols}, 1fr)`, gridTemplateRows: `repeat(${SHELF.rows}, ${SHELF.rowH}px)` }}>
          {shelf.map((ing) => (
            <div key={ing} className="night-jar">
              <ContainerArt ing={ing} />
            </div>
          ))}
        </div>
      </div>
      <div className="night-wash" />
      <div className="night-lamp" />
    </div>
  );
}

const sign = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : '±0');

/**
 * The ledger book. With `act` it is tonight's ledger (entries are written in, the lamp button
 * ends the day); with `onClose` it is last night's, opened from the document box.
 */
export function LedgerBook({ ledger, act, onClose }: { ledger: Ledger; act?: Act; onClose?: () => void }) {
  const g = useGame();
  const ui = useUi();
  const mobile = useMobile();
  const { data } = g;
  const story = data ? storyOf(data) : null;
  const live = !!act;
  const snap = g.lastDay?.day === ledger.day ? g.lastDay : null;
  const [closing, setClosing] = useState(false);
  // Entries are written in one after another (pen sound per line).
  const rows = 5 + (snap?.results.length ? 1 : 0);
  const [written, setWritten] = useState(live && !ui.reducedMotion ? 0 : 99);
  useEffect(() => {
    if (written >= rows + 4) return;
    const t = window.setTimeout(() => {
      sfx(written === 0 ? 'coin' : 'write');
      setWritten((w) => w + 1);
    }, written === 0 ? 1300 : 380);
    return () => clearTimeout(t);
  }, [written, rows]);
  if (!data || !story) return null;
  const lang = data.lang === 'zh' ? 'zh-CN' : 'en';
  // Market goods kept overnight on the new shelf / in the cellar / in the ice box (renovation).
  const kept = Object.entries(renoView(g.progress).carry).filter(([, n]) => (n ?? 0) > 0) as [IngredientId, number][];
  const w = (i: number) => (i < written ? 'lg-in' : 'lg-wait');
  const blowOut = () => {
    if (!act || closing) return;
    setClosing(true);
    sfx('lampout');
    window.setTimeout(() => act((p, d) => storyDismiss(d, p)), ui.reducedMotion ? 0 : 1100);
  };
  const left = (
    <div className="lg-page lg-left">
      <h2 className="lg-day hand">{ledger.day}日目</h2>
      <table className="lg-table">
        <tbody>
          <tr className={w(0)}>
            <th>売り上げ</th>
            <td>
              <span className="coin-glyph" aria-hidden /> +{ledger.takings}
            </td>
          </tr>
          <tr className={w(1)}>
            <th>仕入れ</th>
            <td>
              <span className="coin-glyph" aria-hidden /> −{ledger.expenses}
            </td>
          </tr>
          {ledger.purchases ? (
            <tr className={w(1)} data-testid="ledger-purchases">
              <th>注文</th>
              <td>
                <span className="coin-glyph" aria-hidden /> −{ledger.purchases}
              </td>
            </tr>
          ) : null}
          <tr className={`${w(2)} lg-sum`}>
            <th>財布</th>
            <td>
              <span className="coin-glyph" aria-hidden /> {ledger.money}
            </td>
          </tr>
          <tr className={w(3)}>
            <th>評判</th>
            <td className={ledger.repDelta > 0 ? 'up' : ledger.repDelta < 0 ? 'down' : ''}>{sign(ledger.repDelta)}</td>
          </tr>
          <tr className={w(4)}>
            <th>お客</th>
            <td>
              {ledger.served}人（ぴったり {ledger.perfect}）
            </td>
          </tr>
        </tbody>
      </table>
      {snap?.results.length ? (
        <div className={`lg-faces ${w(5)}`}>
          {snap.results.map((r, i) => {
            const c = data.content.customers.find((x) => x.id === r.customer);
            return (
              <span key={i} className={`lg-face out-${r.outcome}`} title={c?.name}>
                <CustomerArt look={lookFor(c?.id ?? r.customer, c?.avatar ?? '🧑')} ex={r.face} />
              </span>
            );
          })}
        </div>
      ) : null}
      {snap && snap.stock.length ? (
        <p className={`lg-note ${w(5)}`}>
          在庫の残り
          {snap.stock.map(([ing, n]) => (
            <span key={ing} className="lg-stock">
              <svg viewBox="-20 -20 40 40" aria-hidden>
                <PieceArt ing={ing} />
              </svg>
              {n}
            </span>
          ))}
        </p>
      ) : null}
      {live && kept.length ? (
        <p className={`lg-note ${w(5)}`} data-testid="ledger-kept">
          明日に取っておく
          {kept.map(([ing, n]) => (
            <span key={ing} className="lg-stock">
              <svg viewBox="-20 -20 40 40" aria-hidden>
                <PieceArt ing={ing} />
              </svg>
              {n}
            </span>
          ))}
        </p>
      ) : null}
      {snap?.returning ? <p className={`lg-note ${w(5)}`}>満足しなかったお客さんが {snap.returning} 人。また来るかもしれない。</p> : null}
    </div>
  );
  const right = (
    <div className="lg-page lg-right">
      {ledger.met.length ? (
        <div className={`lg-block ${w(rows)}`}>
          <div className="lg-label">今日の顔ぶれ</div>
          <div className="lg-people">
            {ledger.met.map((id) => {
              const who = personOf(data, story, id);
              return (
                <span key={id} className="lg-person">
                  {who.look ? (
                    <span className="lg-portrait">
                      <CustomerArt look={who.look} ex="happy" />
                    </span>
                  ) : null}
                  <span lang={lang}>{who.name}</span>
                </span>
              );
            })}
          </div>
        </div>
      ) : null}
      {ledger.confirmed.length ? (
        <div className={`lg-block ${w(rows + 1)}`}>
          <div className="lg-label">意味がわかった言葉</div>
          <div className="lg-words">
            {ledger.confirmed.map((id) => {
              const e = data.lex.byId.get(id);
              return (
                <span key={id} className="lg-word">
                  <span lang={lang}>{e?.text}</span>
                  <span className="lg-gloss">{shortGloss(e?.gloss)}</span>
                </span>
              );
            })}
          </div>
        </div>
      ) : null}
      {ledger.docs.length ? (
        <div className={`lg-block ${w(rows + 2)}`}>
          <div className="lg-label">見つけたもの</div>
          <div className="lg-docs">
            {ledger.docs.map((id) => {
              const def = story.shared.documents.find((d) => d.id === id);
              return (
                <span key={id} className="lg-doc">
                  {def ? <DocObjectArt look={docLook(def.id, def.kind)} /> : null}
                  <span>{story.text.docs[id]?.titleJa}</span>
                </span>
              );
            })}
          </div>
        </div>
      ) : null}
      {ledger.hooks.length ? (
        <div className={`lg-hooks hand ${w(rows + 3)}`}>
          {ledger.hooks.map((h, i) => (
            <p key={i}>{h}</p>
          ))}
        </div>
      ) : !ledger.met.length && !ledger.confirmed.length && !ledger.docs.length ? (
        <div className={`lg-hooks hand ${w(rows)}`}>
          <p>静かな一日だった。</p>
        </div>
      ) : null}
    </div>
  );
  return (
    <div className={`lg-stage ${closing ? 'lg-closing' : ''} ${live ? '' : 'lg-past'}`} data-testid="story-ledger">
      <div className={`lg-book ${mobile ? 'lg-book-single' : ''}`} role="dialog" aria-label={`${ledger.day}日目の帳簿`}>
        {left}
        {!mobile ? <div className="lg-gutter" aria-hidden /> : null}
        {right}
        <span className="lg-pen" aria-hidden />
      </div>
      {live ? (
        <button type="button" className="lg-lamp-btn" onClick={blowOut} data-testid="story-ledger-close" disabled={closing}>
          <span className="lg-lamp-icon" aria-hidden />
          灯りを消す
        </button>
      ) : (
        <button type="button" className="cv-btn cv-done lg-back" onClick={onClose}>
          箱に戻す
        </button>
      )}
      {live ? <div className="lg-dark" aria-hidden /> : null}
    </div>
  );
}
