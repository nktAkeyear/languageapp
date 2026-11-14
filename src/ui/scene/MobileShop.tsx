/**
 * Phone shop: a tall composition. Top: the customer at the counter with the speech bubble;
 * middle: the counter top with the cup, the books and the tools; bottom: the shelf as a
 * pull-out drawer (a horizontally scrolling strip of containers). Books open full screen.
 */
import { useState } from 'react';
import { CounterSurface, MobileWall } from '../art/shop';
import {
  BookProps,
  Bubble,
  Calendar,
  CoinJar,
  ContentsSlip,
  CornerHooks,
  CustomerFigure,
  DayEnd,
  DayNotice,
  Juice,
  NameCard,
  NextSign,
  Plaque,
  QueueTickets,
  ServeButton,
  ShelfJar,
  TipOut,
  ToolButton,
  VesselSpot,
} from './parts';
import { useSky } from './ShopScene';
import { useBench } from './workbench';
import { useGame } from '../useGame';
import { DocBoxProp, Keepsakes } from '../story/Documents';
import { RenoMobileWall } from '../art/reno';
import { CatalogueButton } from '../reno/CatalogueProp';
import { useReno } from '../reno/useReno';

export function MobileShop({ onSettings }: { onSettings: () => void }) {
  const b = useBench();
  const sky = useSky();
  const phase = useGame().progress?.today?.phase;
  const [drawer, setDrawer] = useState(true);
  const reno = useReno();
  const half = Math.ceil(b.shelf.length / 2);
  const rows = b.shelf.length > 6 ? [b.shelf.slice(0, half), b.shelf.slice(half)] : [b.shelf];
  return (
    <div className="m-shop" data-phase={phase} data-stage={b.stage}>
      <section className="m-wall">
        <MobileWall sky={sky} ringing={b.ringing} paint={reno.has('paint')} />
        <RenoMobileWall owned={reno.owned} fresh={reno.fresh} catAwake={b.stage === 'react'} />
        <div className="lamp-glow m-lamp" style={{ opacity: sky.lamp }} aria-hidden />
        <div className="m-plaque">
          <Plaque />
        </div>
        <div className="m-calendar">
          <Calendar />
        </div>
        <div className="m-tickets">
          <QueueTickets />
        </div>
        <CornerHooks onSettings={onSettings} />
        <div className="m-customer">
          <CustomerFigure />
        </div>
        <div className="m-name">
          <NameCard />
        </div>
        <div className="m-bubble">
          <Bubble />
          <NextSign />
        </div>
        <Juice />
      </section>
      <section className="m-counter">
        <CounterSurface />
        <div className="m-books">
          <BookProps compact />
          <div className="m-docbox">
            <DocBoxProp />
          </div>
          <CatalogueButton className="m-catalogue" />
        </div>
        <div className="m-coinjar">
          <CoinJar />
        </div>
        <div className="m-vessel">
          <VesselSpot />
        </div>
        <div className="m-side">
          <ContentsSlip />
          <TipOut />
        </div>
        <div className="m-serve">
          <ServeButton />
        </div>
        {b.feats.has('temperature') || b.feats.has('method') ? (
          <div className="m-tools">
            {b.feats.has('temperature') ? (
              <>
                <ToolButton tool={{ temp: 'hot' }} />
                <ToolButton tool={{ temp: 'cold' }} />
              </>
            ) : null}
            {b.feats.has('method') ? (
              <>
                <ToolButton tool={{ method: 'steep' }} />
                <ToolButton tool={{ method: 'boil' }} />
                <ToolButton tool={{ method: 'stir' }} />
              </>
            ) : null}
          </div>
        ) : null}
        <div className="m-paper">
          <DayNotice />
          <DayEnd />
        </div>
      </section>
      <section className={`m-drawer ${drawer ? 'open' : 'shut'}`} aria-label="棚">
        <button type="button" className="m-drawer-handle" onClick={() => setDrawer(!drawer)} aria-expanded={drawer} aria-label={drawer ? '棚を閉じる' : '棚を開く'}>
          <span />
        </button>
        {drawer ? (
          <div className="m-drawer-scroll">
            {rows.map((r, i) => (
              <div key={i} className="m-drawer-row" role="list">
                {/* the blue cup and the carved ship stand first on the shelf, in view without scrolling */}
                {i === 0 ? (
                  <div className="m-keepsakes" role="listitem">
                    <Keepsakes />
                  </div>
                ) : null}
                {r.map((ing) => (
                  <div key={ing} className="m-slot" role="listitem">
                    <ShelfJar ing={ing} />
                  </div>
                ))}
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
