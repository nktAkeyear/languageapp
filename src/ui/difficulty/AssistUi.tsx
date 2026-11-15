/**
 * Scene-side assists (レベル設定 → 手助け): the retry slip and the slower-speech factor. Mounted with one-line
 * hooks in scene/parts.tsx and App.tsx. (There is no assist that marks what was wrong: the customer's reaction is
 * the only feedback.)
 */
import { useEffect } from 'react';
import { SLOW_SPEECH } from '../../core/difficulty';
import { setSpeechRateFactor } from '../speech';
import { useGame } from '../useGame';
import './difficulty.css';

/**
 * 「もう一度つくる」: with the retry assist, shown under the sign after every cup (it says nothing about how the cup
 * went — the customer's words do): back to before the cup, for the same customer.
 */
export function RetrySign() {
  const g = useGame();
  if (!g.canRetry) return null;
  return (
    <button type="button" className="retry-sign" onClick={() => g.retryServe()} data-testid="retry" title="出す前に戻って、同じお客さんにもう一度">
      ↺ もう一度つくる
    </button>
  );
}

/** Keeps global presentation effects of the assists in sync (speech rate). Renders nothing. */
export function DifficultyEffects() {
  const { progress } = useGame();
  const slow = !!progress?.difficulty?.assists.slowSpeech;
  useEffect(() => setSpeechRateFactor(slow ? SLOW_SPEECH : 1), [slow]);
  return null;
}
