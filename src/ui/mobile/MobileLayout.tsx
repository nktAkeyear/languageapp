import { useEffect, useState } from 'react';
import { currentOrder } from '../../activities/shop/engine';
import type { ActivityKind } from '../../core/townTypes';
import { CustomerPanel } from '../components/CustomerPanel';
import { ShopStatus } from '../components/Header';
import { Notebook } from '../components/Notebook';
import { Overlay } from '../components/Overlay';
import { RecipeBook } from '../components/RecipeBook';
import { SettingsPanel } from '../components/Settings';
import { DeliveryActions, Slip, TimePicker, TownMap } from '../components/town/Delivery';
import { MarketNote, Purse, Stalls, TownNotice } from '../components/town/Market';
import { WordDetail } from '../components/WordDetail';
import { SpeakButton, WordText } from '../components/WordText';
import { Workbench } from '../components/Workbench';
import { useSpeechAvailable } from '../speech';
import { useGame } from '../useGame';

type MTab = 'customer' | 'bench' | 'book' | 'notebook' | 'note' | 'stalls' | 'slip' | 'map';
const TABS: Record<ActivityKind, { id: MTab; label: string; icon: string }[]> = {
  shop: [
    { id: 'customer', label: 'お客', icon: '🧑' },
    { id: 'bench', label: '調合', icon: '🫖' },
    { id: 'book', label: 'レシピ帳', icon: '📖' },
    { id: 'notebook', label: '手帳', icon: '📓' },
  ],
  market: [
    { id: 'note', label: 'メモ・財布', icon: '📝' },
    { id: 'stalls', label: '市場', icon: '🧺' },
    { id: 'notebook', label: '手帳', icon: '📓' },
  ],
  delivery: [
    { id: 'slip', label: '配達票', icon: '📦' },
    { id: 'map', label: '地図', icon: '🗺️' },
    { id: 'notebook', label: '手帳', icon: '📓' },
  ],
};

/** Compact reminder of the current order, shown above the other panels. */
function OrderStrip() {
  const { progress, lang } = useGame();
  const voice = useSpeechAvailable(lang ?? 'en');
  const o = progress ? currentOrder(progress) : null;
  if (!o || progress?.today?.phase !== 'order') return null;
  return (
    <div className="order-strip">
      {o.audioOnly && voice ? <span className="small muted">声だけの注文</span> : <WordText text={o.text} />}
      <SpeakButton text={o.text} label="" />
    </div>
  );
}

function ShopTabs({ tab, setTab }: { tab: MTab; setTab: (t: MTab) => void }) {
  const phase = useGame().progress?.today?.phase;
  return (
    <>
      {tab !== 'customer' ? <OrderStrip /> : null}
      {tab === 'customer' ? (
        <>
          <CustomerPanel onNext={() => setTab('customer')} />
          {phase === 'order' ? (
            <button type="button" className="btn btn-primary btn-big mob-go" onClick={() => setTab('bench')}>
              調合台へ 🫖
            </button>
          ) : null}
        </>
      ) : tab === 'bench' ? (
        <Workbench onServed={() => setTab('customer')} />
      ) : tab === 'book' ? (
        <RecipeBook />
      ) : (
        <Notebook />
      )}
    </>
  );
}

function MarketTabs({ tab, setTab }: { tab: MTab; setTab: (t: MTab) => void }) {
  const md = useGame().townDay?.market;
  if (tab === 'note')
    return (
      <>
        <TownNotice />
        <MarketNote />
        <Purse />
        {!md?.done ? (
          <button type="button" className="btn btn-primary btn-big mob-go" onClick={() => setTab('stalls')}>
            市場の通りへ 🧺
          </button>
        ) : null}
      </>
    );
  if (tab === 'stalls')
    return (
      <>
        <MarketNote compact />
        <Stalls withPurse />
      </>
    );
  return <Notebook />;
}

function DeliveryTabs({ tab, setTab }: { tab: MTab; setTab: (t: MTab) => void }) {
  const x = useGame().townDay?.delivery;
  if (tab === 'slip')
    return (
      <>
        <TownNotice />
        <Slip />
        <TimePicker />
        {x?.phase === 'plan' && !x.choice.place ? (
          <button type="button" className="btn btn-big mob-go" onClick={() => setTab('map')}>
            🗺️ 地図で届け先を選ぶ
          </button>
        ) : null}
        <DeliveryActions />
      </>
    );
  if (tab === 'map')
    return (
      <>
        <Slip compact />
        <TownMap />
        {x?.phase === 'plan' && x.choice.place ? (
          <button type="button" className="btn btn-primary btn-big mob-go" onClick={() => setTab('slip')}>
            配達票へ戻る（時間を選んで出発）
          </button>
        ) : null}
      </>
    );
  return <Notebook />;
}

/** Phone layout: one panel at a time, bottom tab navigation, touch-sized controls. */
export function MobileLayout() {
  const g = useGame();
  const seg = g.segment;
  const tabs = TABS[seg];
  const [tab, setTab] = useState<MTab>(tabs[0].id);
  const [settings, setSettings] = useState(false);
  // A new segment of the day starts on its first tab.
  useEffect(() => setTab(TABS[seg][0].id), [seg]);
  // After setting off on a delivery, the door scene is on the slip tab.
  const phase = g.townDay?.delivery?.phase;
  useEffect(() => {
    if (seg === 'delivery' && phase && phase !== 'plan') setTab('slip');
  }, [seg, phase]);
  const cur = tabs.some((t) => t.id === tab) ? tab : tabs[0].id;
  const shopPhase = g.progress?.today?.phase;
  return (
    <div className="mob" data-segment={seg}>
      <header className="mob-header">
        <ShopStatus />
        <button type="button" className="btn btn-icon" onClick={() => setSettings(true)} aria-label="設定">
          ⚙
        </button>
      </header>
      <main className="mob-main">
        {seg === 'market' ? (
          <MarketTabs tab={cur} setTab={setTab} />
        ) : seg === 'delivery' ? (
          <DeliveryTabs tab={cur} setTab={setTab} />
        ) : (
          <ShopTabs tab={cur} setTab={setTab} />
        )}
      </main>
      <nav className="mob-tabs" role="tablist" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={cur === t.id}
            className={`mob-tab ${cur === t.id ? 'mob-tab-on' : ''}`}
            onClick={() => setTab(t.id)}
            data-tab={t.id}
          >
            <span aria-hidden className="mob-tab-icon">
              {t.icon}
            </span>
            <span>{t.label}</span>
            {t.id === 'customer' && shopPhase === 'reaction' && cur !== 'customer' ? <span className="badge">!</span> : null}
          </button>
        ))}
      </nav>
      {settings ? (
        <Overlay variant="sheet" onClose={() => setSettings(false)}>
          <SettingsPanel onClose={() => setSettings(false)} />
        </Overlay>
      ) : null}
      {g.selectedWord ? (
        <Overlay variant="sheet" onClose={() => g.openWord(null)}>
          <WordDetail id={g.selectedWord} onClose={() => g.openWord(null)} />
        </Overlay>
      ) : null}
    </div>
  );
}
