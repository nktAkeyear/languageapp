import { useState } from 'react';
import { currentOrder } from '../../activities/shop/engine';
import { CustomerPanel } from '../components/CustomerPanel';
import { ShopStatus } from '../components/Header';
import { Notebook } from '../components/Notebook';
import { Overlay } from '../components/Overlay';
import { RecipeBook } from '../components/RecipeBook';
import { SettingsPanel } from '../components/Settings';
import { WordDetail } from '../components/WordDetail';
import { SpeakButton, WordText } from '../components/WordText';
import { Workbench } from '../components/Workbench';
import { useSpeechAvailable } from '../speech';
import { useGame } from '../useGame';

type MTab = 'customer' | 'bench' | 'book' | 'notebook';
const TABS: { id: MTab; label: string; icon: string }[] = [
  { id: 'customer', label: 'お客', icon: '🧑' },
  { id: 'bench', label: '調合', icon: '🫖' },
  { id: 'book', label: 'レシピ帳', icon: '📖' },
  { id: 'notebook', label: '手帳', icon: '📓' },
];

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

/** Phone layout: one panel at a time, bottom tab navigation, touch-sized controls. */
export function MobileLayout() {
  const g = useGame();
  const [tab, setTab] = useState<MTab>('customer');
  const [settings, setSettings] = useState(false);
  const phase = g.progress?.today?.phase;
  return (
    <div className="mob">
      <header className="mob-header">
        <ShopStatus />
        <button type="button" className="btn btn-icon" onClick={() => setSettings(true)} aria-label="設定">
          ⚙
        </button>
      </header>
      <main className="mob-main">
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
      </main>
      <nav className="mob-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            className={`mob-tab ${tab === t.id ? 'mob-tab-on' : ''}`}
            onClick={() => setTab(t.id)}
            data-tab={t.id}
          >
            <span aria-hidden className="mob-tab-icon">
              {t.icon}
            </span>
            <span>{t.label}</span>
            {t.id === 'customer' && phase === 'reaction' && tab !== 'customer' ? <span className="badge">!</span> : null}
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
