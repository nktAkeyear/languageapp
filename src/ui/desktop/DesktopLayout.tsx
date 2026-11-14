import { useState } from 'react';
import { CustomerPanel } from '../components/CustomerPanel';
import { ShopStatus } from '../components/Header';
import { Notebook } from '../components/Notebook';
import { Overlay } from '../components/Overlay';
import { RecipeBook } from '../components/RecipeBook';
import { SettingsPanel } from '../components/Settings';
import { DeliveryActions, Slip, TimePicker, TownMap } from '../components/town/Delivery';
import { MarketNote, Purse, Stalls, TownNotice } from '../components/town/Market';
import { WordDetail } from '../components/WordDetail';
import { Workbench } from '../components/Workbench';
import { useGame } from '../useGame';
import { StoryLayer } from '../components/story/StoryLayer';

function NotebookPanel() {
  return (
    <section className="panel panel-notebook" aria-label="手帳">
      <h2 className="panel-title">手帳</h2>
      <Notebook />
    </section>
  );
}

/** Market morning: shopping note + purse | stalls | notebook. */
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
      <NotebookPanel />
    </main>
  );
}

/** Delivery: slip + time + door | town map | notebook. */
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
      <NotebookPanel />
    </main>
  );
}

function ShopGrid() {
  return (
    <main className="desk-grid">
      <section className="panel panel-customer" aria-label="お客さん">
        <h2 className="panel-title">お客さん</h2>
        <CustomerPanel />
      </section>
      <section className="panel panel-bench" aria-label="調合台">
        <h2 className="panel-title">調合台</h2>
        <Workbench />
      </section>
      <section className="panel panel-book" aria-label="レシピ帳">
        <h2 className="panel-title">レシピ帳</h2>
        <RecipeBook />
      </section>
      <NotebookPanel />
    </main>
  );
}

/** PC layout: panels side by side; the panels follow the day's current activity. */
export function DesktopLayout() {
  const g = useGame();
  const [settings, setSettings] = useState(false);
  return (
    <div className="desk" data-segment={g.segment}>
      <header className="desk-header">
        <h1 className="brand">港町の調香茶房</h1>
        <ShopStatus />
        <button type="button" className="btn" onClick={() => setSettings(true)}>
          ⚙ 設定
        </button>
      </header>
      {g.segment === 'market' ? <MarketGrid /> : g.segment === 'delivery' ? <DeliveryGrid /> : <ShopGrid />}
      {settings ? (
        <Overlay variant="modal" onClose={() => setSettings(false)}>
          <SettingsPanel onClose={() => setSettings(false)} />
        </Overlay>
      ) : null}
      <StoryLayer variant="modal" />
      {g.selectedWord ? (
        <Overlay variant="modal" onClose={() => g.openWord(null)}>
          <WordDetail id={g.selectedWord} onClose={() => g.openWord(null)} />
        </Overlay>
      ) : null}
    </div>
  );
}
