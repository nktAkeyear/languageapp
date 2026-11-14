import { useState } from 'react';
import { ShopStatus } from '../components/Header';
import { Overlay } from '../components/Overlay';
import { SettingsPanel } from '../components/Settings';
import { DeliveryActions, Slip, TimePicker, TownMap } from '../components/town/Delivery';
import { MarketNote, Purse, Stalls, TownNotice } from '../components/town/Market';
import { BookProps } from '../scene/parts';
import { ShopScene } from '../scene/ShopScene';
import { BenchProvider } from '../scene/workbench';
import { useGame } from '../useGame';
import { StoryLayer } from '../components/story/StoryLayer';

/** Market / delivery keep their panels for now; the books lie on a small desk on the side. */
function DeskPanel() {
  return (
    <section className="panel panel-desk" aria-label="机">
      <h2 className="panel-title">机</h2>
      <div className="side-desk">
        <BookProps />
      </div>
      <p className="hand small muted">言葉に触れると手帳が開く。</p>
    </section>
  );
}

/** Market morning: shopping note + purse | stalls | desk. */
function MarketGrid() {
  return (
    <main className="desk-grid desk-grid-town">
      <section className="panel panel-note" aria-label="買い物メモ">
        <h2 className="panel-title">買い物メモ</h2>
        <TownNotice />
        <MarketNote />
        <Purse />
      </section>
      <section className="panel panel-wide" aria-label="市場">
        <h2 className="panel-title">市場</h2>
        <Stalls />
      </section>
      <DeskPanel />
    </main>
  );
}

/** Delivery: slip + time + door | town map | desk. */
function DeliveryGrid() {
  return (
    <main className="desk-grid desk-grid-town">
      <section className="panel panel-note" aria-label="配達票">
        <h2 className="panel-title">配達</h2>
        <TownNotice />
        <Slip />
        <TimePicker />
        <DeliveryActions />
      </section>
      <section className="panel panel-wide" aria-label="町の地図">
        <h2 className="panel-title">町の地図</h2>
        <TownMap />
      </section>
      <DeskPanel />
    </main>
  );
}

/** PC layout: the shop is one drawn scene; market / delivery are panels on a wooden desk. */
export function DesktopLayout() {
  const g = useGame();
  const [settings, setSettings] = useState(false);
  return (
    <div className="desk" data-segment={g.segment}>
      {g.segment === 'shop' ? (
        <BenchProvider>
          <ShopScene onSettings={() => setSettings(true)} />
        </BenchProvider>
      ) : (
        <>
          <header className="desk-header">
            <h1 className="brand">港町の調香茶房</h1>
            <ShopStatus />
            <button type="button" className="btn" onClick={() => setSettings(true)} data-testid="settings">
              ⚙ 設定
            </button>
          </header>
          {g.segment === 'market' ? <MarketGrid /> : <DeliveryGrid />}
        </>
      )}
      {settings ? (
        <Overlay variant="modal" onClose={() => setSettings(false)}>
          <SettingsPanel onClose={() => setSettings(false)} />
        </Overlay>
      ) : null}
      <StoryLayer variant="modal" />
    </div>
  );
}
