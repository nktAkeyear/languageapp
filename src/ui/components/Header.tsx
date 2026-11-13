import { activityDef } from '../../activities';
import { useGame } from '../useGame';
import { LANG_JA } from './Settings';

export function ShopStatus() {
  const { progress, lang, segment } = useGame();
  if (!progress || !lang) return null;
  const t = progress.today;
  const marketOpen = progress.town.unlocked.market !== undefined;
  return (
    <div className="status">
      <span className="status-item">{LANG_JA[lang]}</span>
      <span className="status-item">{progress.day}日目</span>
      <span className="status-item" title="店の評判">
        評判 <strong>{progress.reputation}</strong>
      </span>
      {marketOpen ? (
        <span className="status-item" title="財布" data-testid="money">
          🪙 <strong>{progress.town.money}</strong>
        </span>
      ) : null}
      {segment === 'shop' && t && t.phase !== 'closed' ? (
        <span className="status-item">
          お客 {Math.min(t.index + 1, t.queue.length)}/{t.queue.length}
        </span>
      ) : null}
      <DayStrip />
    </div>
  );
}

/** Today's segments (朝 市場 → 昼 茶房 → 夕方 配達); hidden while the day is the shop only. */
export function DayStrip() {
  const { townDay } = useGame();
  if (!townDay || townDay.segments.length < 2) return null;
  return (
    <span className="daystrip" aria-label="今日の予定">
      {townDay.segments.map((s, i) => {
        const a = activityDef(s);
        const cls = i < townDay.seg ? 'ds-done' : i === townDay.seg ? 'ds-cur' : '';
        return (
          <span key={s} className={`ds ${cls}`}>
            {i > 0 ? <span className="ds-arrow">→</span> : null}
            <span aria-hidden>{a.icon}</span>
            <span className="ds-label">{a.nameJa}</span>
          </span>
        );
      })}
    </span>
  );
}
