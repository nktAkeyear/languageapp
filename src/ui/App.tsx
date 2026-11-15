import { useEffect, useState } from 'react';
import { ArtDefs } from './art/defs';
import { BookLayer } from './book/BookLayer';
import { Overlay } from './components/Overlay';
import { SettingsPanel } from './components/Settings';
import { TitleScreen } from './components/TitleScreen';
import { ErrorBoundary } from './ErrorBoundary';
import { DesktopLayout } from './desktop/DesktopLayout';
import { MobileCtx } from './layout';
import { MobileLayout } from './mobile/MobileLayout';
import { armAudioOnGesture, setAudioSettings } from './sound';
import { setPreferredVoices } from './speech';
import { DayTransition } from './scene/Transition';
import { StoryStage } from './story/StoryStage';
import { StoryUiProvider } from './story/StoryUi';
import { UiProvider } from './uiState';
import { GameProvider, useGame } from './useGame';
import { LevelSettingsHost } from './difficulty/LevelSettings';
import { DifficultyEffects } from './difficulty/AssistUi';
import { WordCardHost } from './components/WordCard';
import { DayBanner } from './components/DayChrome';

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
  // Settings live above the layouts: importing a save (or switching language) remounts the
  // layout, and the sheet must stay open to show the result.
  const [settings, setSettings] = useState(false);
  const mobile = g.settings.layout === 'mobile' || (g.settings.layout === 'auto' && narrow);
  const { volume, muted, ambient } = g.settings;
  useEffect(() => {
    document.documentElement.dataset.layout = mobile ? 'mobile' : 'desktop';
  }, [mobile]);
  useEffect(() => armAudioOnGesture(), []);
  useEffect(() => setAudioSettings({ volume, muted, ambient }), [volume, muted, ambient]);
  const voicePrefs = g.settings.voices;
  useEffect(() => setPreferredVoices(voicePrefs), [voicePrefs]);
  return (
    <MobileCtx.Provider value={mobile}>
      <UiProvider>
        <StoryUiProvider>
          <ArtDefs />
          {!g.lang || !g.progress ? (
            <TitleScreen />
          ) : (
            <>
              {/* Keyed by language so per-scene UI state resets on switching. */}
              {mobile ? <MobileLayout key={g.lang} onSettings={() => setSettings(true)} /> : <DesktopLayout key={g.lang} onSettings={() => setSettings(true)} />}
              <StoryStage key={`story-${g.lang}`} onSettings={() => setSettings(true)} />
              <BookLayer />
              <DayTransition />
              <DayBanner />
            </>
          )}
          <LevelSettingsHost />
          <DifficultyEffects />
          <WordCardHost />
          {settings ? (
            <Overlay variant={mobile ? 'sheet' : 'modal'} onClose={() => setSettings(false)}>
              <SettingsPanel onClose={() => setSettings(false)} />
            </Overlay>
          ) : null}
        </StoryUiProvider>
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
