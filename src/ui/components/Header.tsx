import { useGame } from '../useGame';
import { LANG_JA } from './Settings';

export function ShopStatus() {
  const { progress, lang } = useGame();
  if (!progress || !lang) return null;
  const t = progress.today;
  return (
    <div className="status">
      <span className="status-item">{LANG_JA[lang]}</span>
      <span className="status-item">{progress.day}日目</span>
      <span className="status-item" title="店の評判">
        評判 <strong>{progress.reputation}</strong>
      </span>
      {t && t.phase !== 'closed' ? (
        <span className="status-item">
          お客 {Math.min(t.index + 1, t.queue.length)}/{t.queue.length}
        </span>
      ) : null}
    </div>
  );
}
