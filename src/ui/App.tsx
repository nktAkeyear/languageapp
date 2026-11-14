import { useEffect, useState } from 'react';
import { ArtDefs } from './art/defs';
import { BookLayer } from './book/BookLayer';
import { TitleScreen } from './components/TitleScreen';
import { ErrorBoundary } from './ErrorBoundary';
import { DesktopLayout } from './desktop/DesktopLayout';
import { MobileCtx } from './layout';
import { MobileLayout } from './mobile/MobileLayout';
import { armAudioOnGesture, setAudioSettings } from './sound';
import { UiProvider } from './uiState';
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
  const { volume, muted, ambient } = g.settings;
  useEffect(() => {
    document.documentElement.dataset.layout = mobile ? 'mobile' : 'desktop';
  }, [mobile]);
  useEffect(() => armAudioOnGesture(), []);
  useEffect(() => setAudioSettings({ volume, muted, ambient }), [volume, muted, ambient]);
  return (
    <MobileCtx.Provider value={mobile}>
      <UiProvider>
        <ArtDefs />
        {!g.lang || !g.progress ? (
          <TitleScreen />
        ) : (
          <>
            {/* Keyed by language so per-scene UI state resets on switching. */}
            {mobile ? <MobileLayout key={g.lang} /> : <DesktopLayout key={g.lang} />}
            <BookLayer />
          </>
        )}
      </UiProvider>
    </MobileCtx.Provider>
  );
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
