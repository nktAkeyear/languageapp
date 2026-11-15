/**
 * Desktop shop: one drawn scene (1600×1000 design units, scaled to fit the window). The
 * customer stands behind the counter in front of the door, the shelf is on the right wall,
 * the workbench (cup, tools, books, coin jar) is the counter top in the foreground.
 */
import { ShopPrep } from './PrepProps';
import { useLayoutEffect, useRef, useState } from 'react';
import { hashString } from '../../core/rng';
import { DecorArt, TeaSetArt } from '../art/props';
import { SHELF, STAGE_H, STAGE_W, ShopBackdrop, ShopLive, type DoorSign } from '../art/shop';
import { shopTime, skyAt } from '../art/sky';
import { useGame } from '../useGame';
import {
  Board,
  BookProps,
  Bubble,
  Calendar,
  CoinJar,
  ContentsSlip,
  ClosedPanel,
  CornerHooks,
  CustomerFigure,
  Juice,
  NameCard,
  NextSign,
  Plaque,
  QueueTickets,
  ServeButton,
  ShelfJar,
  ShopDayParts,
  SupplyButton,
  TipOut,
  ToolButton,
  VesselSpot,
} from './parts';
import { useBench } from './workbench';
import { DocBoxProp, Keepsakes } from '../story/Documents';
import { RenoRoom } from '../art/reno';
import { Raster } from '../art/Raster';
import { CatalogueButton } from '../reno/CatalogueProp';
import { useReno } from '../reno/useReno';
import { NoticePin } from '../components/DayChrome';

export function useStageScale(w: number, h: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [s, setS] = useState(0.8);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      setS(Math.min(r.width / w, r.height / h));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, [w, h]);
  return { ref, scale: s };
}

/** The door's card: 準備中 / 営業中 / 閉店 by the tea house's part of the day. */
export function useDoorSign(): DoorSign {
  const p = useGame().progress;
  if (!p?.today) return 'open';
  if (p.today.phase === 'closed') return 'closed';
  return (p.townDay?.part ?? 1) === 0 ? 'prep' : 'open';
}

export function useSky() {
  const t = useGame().progress?.today;
  return skyAt(t ? shopTime(t.index, t.queue.length, t.phase === 'closed') : 0);
}

export function ShopScene({ onSettings }: { onSettings: () => void }) {
  const b = useBench();
  const sky = useSky();
  const { ref, scale } = useStageScale(STAGE_W, STAGE_H);
  const slots = SHELF.rows * SHELF.cols;
  const shelf = b.shelf.slice(0, slots);
  const phase = useGame().progress?.today?.phase;
  const reno = useReno();
  const door = useDoorSign();
  return (
    <div className="scene-viewport" ref={ref} data-phase={phase} data-stage={b.stage}>
      <div className="stage" style={{ width: STAGE_W, height: STAGE_H, transform: `translate(-50%, -50%) scale(${scale})`, ['--stage-s' as string]: scale }}>
        <Raster label="shop">
          <ShopBackdrop sky={sky} paint={reno.has('paint')} sign={door} />
        </Raster>
        <ShopLive sky={sky} ringing={b.ringing} />
        <Raster label="reno">
          <RenoRoom owned={reno.owned} fresh={reno.fresh} layer="static" />
        </Raster>
        <RenoRoom owned={reno.owned} fresh={reno.fresh} catAwake={b.stage === 'react'} layer="live" />
        <div className="lamp-glow" style={{ opacity: sky.lamp }} aria-hidden />
        <div className="d-plaque">
          <Plaque />
        </div>
        <div className="d-calendar">
          <Calendar />
        </div>
        <div className="d-tickets">
          <QueueTickets />
        </div>
        <div className="d-customer">
          <CustomerFigure />
        </div>
        <div className="d-name">
          <NameCard />
        </div>
        <div className="d-bubble">
          <Bubble />
          <NextSign />
        </div>
        <div
          className="d-shelf"
          style={{ left: SHELF.x, top: SHELF.y, width: SHELF.w, height: SHELF.rows * SHELF.rowH, gridTemplateColumns: `repeat(${SHELF.cols}, 1fr)`, gridTemplateRows: `repeat(${SHELF.rows}, ${SHELF.rowH}px)` }}
          role="list"
          aria-label="棚"
        >
          {Array.from({ length: slots }, (_, i) =>
            shelf[i] ? (
              <div key={shelf[i]} className="slot" role="listitem">
                <ShelfJar ing={shelf[i]} />
              </div>
            ) : (
              <div key={`d${i}`} className="slot slot-decor" aria-hidden>
                {hashString(`slot${i}`) % 5 < 2 ? <DecorArt i={hashString(`decor${i}`)} /> : null}
              </div>
            ),
          )}
        </div>
        <div className="d-books">
          <BookProps />
        </div>
        <div className="d-docbox">
          <DocBoxProp />
        </div>
        <div className="d-keepsakes">
          <Keepsakes />
        </div>
        <CatalogueButton className="d-catalogue" />
        <div className="d-coinjar">
          <CoinJar />
        </div>
        <div className="d-tipout">
          <TipOut />
        </div>
        <div className="d-board">
          <Board />
        </div>
        <div className="d-vessel">
          <VesselSpot />
        </div>
        <div className="d-chit">
          <ContentsSlip />
        </div>
        <div className="d-serve">
          <ServeButton />
        </div>
        {b.feats.has('temperature') ? (
          <>
            <ToolButton tool={{ temp: 'hot' }} className="d-tool d-hot" />
            <ToolButton tool={{ temp: 'cold' }} className="d-tool d-cold" />
          </>
        ) : null}
        {!b.feats.has('temperature') ? (
          <div className="d-teaset">
            <TeaSetArt />
          </div>
        ) : null}
        {b.feats.has('method') ? (
          <>
            <ToolButton tool={{ method: 'steep' }} className="d-tool d-steep" />
            <ToolButton tool={{ method: 'boil' }} className="d-tool d-boil" />
            <ToolButton tool={{ method: 'stir' }} className="d-tool d-stir" />
          </>
        ) : null}
        <Juice />
        <div className="d-dayparts">
          <ShopDayParts />
        </div>
        <div className="d-notice">
          <NoticePin />
        </div>
        <div className="d-supply">
          <SupplyButton />
        </div>
        <ShopPrep />
        <div className="d-daypanel">
          <ClosedPanel />
        </div>
        <CornerHooks onSettings={onSettings} />
      </div>
    </div>
  );
}
