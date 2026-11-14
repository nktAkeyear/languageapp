import { useEffect, useState } from 'react';
import type { ActivityKind } from '../../core/townTypes';
import { ShopStatus } from '../components/Header';
import { Overlay } from '../components/Overlay';
import { SettingsPanel } from '../components/Settings';
import { DeliveryActions, Slip, TimePicker, TownMap } from '../components/town/Delivery';
import { MarketNote, Purse, Stalls, TownNotice } from '../components/town/Market';
import { MobileShop } from '../scene/MobileShop';
import { BenchProvider } from '../scene/workbench';
import { useGame } from '../useGame';
import { StoryLayer } from '../components/story/StoryLayer';
import { useUi } from '../uiState';

type MTab = 'note' | 'stalls' | 'slip' | 'map' | 'notebook' | 'recipe';
const TABS: Record<Exclude<ActivityKind, 'shop'>, { id: MTab; label: string; icon: string }[]> = {
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

function MarketTabs({ tab, setTab }: { tab: MTab; setTab: (t: MTab) => void }) {
  const md = useGame().townDay?.market;
  if (tab === 'stalls')
    return (
      <>
        <MarketNote compact />
        <Stalls withPurse />
      </>
    );
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
}

function DeliveryTabs({ tab, setTab }: { tab: MTab; setTab: (t: MTab) => void }) {
  const x = useGame().townDay?.delivery;
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
}

/** Market / delivery on a phone: one panel at a time with bottom tabs (the notebook opens as a book). */
function TownMobile({ seg, onSettings }: { seg: Exclude<ActivityKind, 'shop'>; onSettings: () => void }) {
  const g = useGame();
  const ui = useUi();
  const tabs = TABS[seg];
  const [tab, setTab] = useState<MTab>(tabs[0].id);
  useEffect(() => setTab(TABS[seg][0].id), [seg]);
  const phase = g.townDay?.delivery?.phase;
  useEffect(() => {
    if (seg === 'delivery' && phase && phase !== 'plan') setTab('slip');
  }, [seg, phase]);
  const cur = tabs.some((t) => t.id === tab && t.id !== 'notebook') ? tab : tabs[0].id;
  return (
    <div className="mob" data-segment={seg}>
      <header className="mob-header">
        <ShopStatus />
        <button type="button" className="btn btn-icon" onClick={onSettings} aria-label="設定" data-testid="settings">
          ⚙
        </button>
      </header>
      <main className="mob-main">{seg === 'market' ? <MarketTabs tab={cur} setTab={setTab} /> : <DeliveryTabs tab={cur} setTab={setTab} />}</main>
      <nav className="mob-tabs" role="tablist" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={cur === t.id}
            className={`mob-tab ${cur === t.id ? 'mob-tab-on' : ''}`}
            onClick={() => (t.id === 'notebook' ? ui.openNotebook() : setTab(t.id))}
            data-tab={t.id}
          >
            <span aria-hidden className="mob-tab-icon">
              {t.icon}
            </span>
            <span>{t.label}</span>
            {t.id === 'notebook' && ui.newPages.length ? <span className="badge">!</span> : null}
          </button>
        ))}
      </nav>
    </div>
  );
}

/** Phone layout: the shop is a tall drawn composition; market / delivery use tabs. */
export function MobileLayout() {
  const g = useGame();
  const [settings, setSettings] = useState(false);
  const seg = g.segment;
  return (
    <>
      {seg === 'shop' ? (
        <BenchProvider>
          <MobileShop onSettings={() => setSettings(true)} />
        </BenchProvider>
      ) : (
        <TownMobile seg={seg} onSettings={() => setSettings(true)} />
      )}
      {settings ? (
        <Overlay variant="sheet" onClose={() => setSettings(false)}>
          <SettingsPanel onClose={() => setSettings(false)} />
        </Overlay>
      ) : null}
      <StoryLayer variant="sheet" />
    </>
  );
}
