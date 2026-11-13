import { useEffect, useState } from 'react';
import { TitleScreen } from './components/TitleScreen';
import { ErrorBoundary } from './ErrorBoundary';
import { DesktopLayout } from './desktop/DesktopLayout';
import { MobileLayout } from './mobile/MobileLayout';
import { GameProvider, useGame } from './useGame';

const MOBILE_QUERY = '(max-width: 820px)';

function useIsNarrow(): boolean {
  const [narrow, setNarrow] = useState(() => typeof window !== 'undefined' && window.matchMedia(MOBILE_QUERY).matches);
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    const on = () => setNarrow(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return narrow;
}

function Shell() {
  const g = useGame();
  const narrow = useIsNarrow();
  const mobile = g.settings.layout === 'mobile' || (g.settings.layout === 'auto' && narrow);
  useEffect(() => {
    document.documentElement.dataset.layout = mobile ? 'mobile' : 'desktop';
  }, [mobile]);
  if (!g.lang || !g.progress) return <TitleScreen />;
  // Keyed by language so per-panel UI state (open page, tab) resets on switching.
  return mobile ? <MobileLayout key={g.lang} /> : <DesktopLayout key={g.lang} />;
}

export function App() {
  return (
    <ErrorBoundary>
      <GameProvider>
        <Shell />
      </GameProvider>
    </ErrorBoundary>
  );
}
