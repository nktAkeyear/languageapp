/**
 * Scene-side assists (レベル設定 → 手助け): mark what a failed cup was about, the retry slip,
 * and the slower-speech factor. Mounted with one-line hooks in scene/parts.tsx and App.tsx.
 */
import { useEffect, useMemo } from 'react';
import { implicatedWords } from '../../activities/shop/engine';
import { SLOW_SPEECH } from '../../core/difficulty';
import type { OrderInstance } from '../../core/types';
import { setSpeechRateFactor } from '../speech';
import { useGame } from '../useGame';
import './difficulty.css';

/**
 * Words of the order the last (failed) cup's mistake was about, when the assist is on. An empty cup
 * is about no word in particular: nothing is marked (EmptyCupNote says what happened instead).
 */
export function useMistakeMarks(order: OrderInstance | null | undefined): ReadonlySet<string> | undefined {
  const { data, progress, lastServe } = useGame();
  const on = !!progress?.difficulty?.assists.markMistake;
  return useMemo(() => {
    if (!on || !data || !order || !lastServe || lastServe.evaluation.outcome === 'perfect') return undefined;
    if (progress?.today?.phase !== 'reaction') return undefined;
    if (lastServe.evaluation.issues.some((i) => i.kind === 'empty')) return undefined;
    return new Set(implicatedWords(data, order, lastServe.evaluation.issues));
  }, [on, data, order, lastServe, progress?.today?.phase]);
}

/** With the mistake-mark assist: after an empty cup, say so (instead of marking every word). */
export function EmptyCupNote() {
  const { progress, lastServe } = useGame();
  if (!progress?.difficulty?.assists.markMistake || progress.today?.phase !== 'reaction') return null;
  if (!lastServe?.evaluation.issues.some((i) => i.kind === 'empty')) return null;
  return (
    <div className="mistake-empty small" data-testid="empty-cup-note">
      カップは空のまま出した（どの言葉のまちがいでもない）
    </div>
  );
}

/** 「もう一度つくる」: shown under the sign after a failed cup when the retry assist is on. */
export function RetrySign() {
  const g = useGame();
  if (!g.canRetry) return null;
  return (
    <button type="button" className="retry-sign" onClick={() => g.retryServe()} data-testid="retry" title="評判も言葉の記録も元に戻して、同じお客さんにもう一度">
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
