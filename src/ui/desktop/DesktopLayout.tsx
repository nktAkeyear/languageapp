import { useState } from 'react';
import { CustomerPanel } from '../components/CustomerPanel';
import { ShopStatus } from '../components/Header';
import { Notebook } from '../components/Notebook';
import { Overlay } from '../components/Overlay';
import { RecipeBook } from '../components/RecipeBook';
import { SettingsPanel } from '../components/Settings';
import { WordDetail } from '../components/WordDetail';
import { Workbench } from '../components/Workbench';
import { useGame } from '../useGame';

/** PC layout: customer + workbench, recipe book and notebook side by side. */
export function DesktopLayout() {
  const g = useGame();
  const [settings, setSettings] = useState(false);
  return (
    <div className="desk">
      <header className="desk-header">
        <h1 className="brand">港町の調香茶房</h1>
        <ShopStatus />
        <button type="button" className="btn" onClick={() => setSettings(true)}>
          ⚙ 設定
        </button>
      </header>
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
        <section className="panel panel-notebook" aria-label="手帳">
          <h2 className="panel-title">手帳</h2>
          <Notebook />
        </section>
      </main>
      {settings ? (
        <Overlay variant="modal" onClose={() => setSettings(false)}>
          <SettingsPanel onClose={() => setSettings(false)} />
        </Overlay>
      ) : null}
      {g.selectedWord ? (
        <Overlay variant="modal" onClose={() => g.openWord(null)}>
          <WordDetail id={g.selectedWord} onClose={() => g.openWord(null)} />
        </Overlay>
      ) : null}
    </div>
  );
}
