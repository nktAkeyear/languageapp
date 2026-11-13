import { stockOf } from '../../activities/day';
import { featuresAtStage, ingredientWordId, ingredientsAtStage, wordMarkup } from '../../core/gamedata';
import type { IngredientId, Method, Temp } from '../../core/types';
import { useGame } from '../useGame';
import { IngredientIcon } from './Ingredient';
import { WordText } from './WordText';

const TEMP_ICON: Record<Temp, string> = { hot: '🔥', cold: '🧊' };
const METHOD_ICON: Record<Method, string> = { steep: '⏳', boil: '🍲', stir: '🌀' };

/** Shelf + cup + temperature/method + serve. */
export function Workbench({ onServed }: { onServed?: () => void }) {
  const g = useGame();
  const { data, progress, brew } = g;
  if (!data || !progress) return null;
  const shelf = ingredientsAtStage(data, progress.stage);
  const feats = featuresAtStage(data, progress.stage);
  const canServe = progress.today?.phase === 'order';
  const inCup = (Object.keys(brew.counts) as IngredientId[]).filter((k) => (brew.counts[k] ?? 0) > 0);
  const label = (ing: IngredientId) => {
    const id = ingredientWordId(data, ing);
    return id ? wordMarkup(data, id) : ing;
  };

  return (
    <div className="workbench">
      <div className="shelf" role="list">
        {shelf.map((ing) => {
          const n = brew.counts[ing] ?? 0;
          // Today's stock from the market (undefined = plenty).
          const left = stockOf(progress, ing);
          const max = Math.min(data.ing.get(ing)?.maxCount ?? 5, left ?? Infinity);
          return (
            <div key={ing} className={`shelf-item ${n ? 'shelf-item-on' : ''} ${left === 0 ? 'shelf-item-out' : ''}`} role="listitem" data-ing={ing}>
              {left !== undefined ? (
                <span className={`stock-chip ${left - n <= 0 ? 'stock-empty' : ''}`} title="今日の在庫">
                  {left === 0 ? '品切れ' : `残り${left - n}`}
                </span>
              ) : null}
              <button
                type="button"
                className="shelf-add"
                disabled={!canServe || n >= max}
                onClick={() => g.addIngredient(ing, 1)}
                aria-label="一つ入れる"
              >
                <IngredientIcon id={ing} size={44} />
                <span className="shelf-label">
                  <WordText text={label(ing)} interactive={false} />
                </span>
              </button>
              {n > 0 ? (
                <div className="shelf-count">
                  <button type="button" className="btn btn-small" onClick={() => g.addIngredient(ing, -1)} aria-label="一つ減らす">
                    −
                  </button>
                  <span className="count">{n}</span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="bench-row">
        <div className="cup" aria-label="カップの中身">
          <div className="cup-title small muted">カップ</div>
          <div className={`cup-body ${brew.temp ? `cup-${brew.temp}` : ''}`}>
            {inCup.length === 0 ? <span className="muted small">（空）</span> : null}
            {inCup.map((ing) => (
              <span key={ing} className="cup-item">
                <IngredientIcon id={ing} size={28} />
                <span className="cup-n">×{brew.counts[ing]}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="bench-controls">
          {feats.has('temperature') ? (
            <div className="seg" role="group" aria-label="温度">
              {(['hot', 'cold'] as Temp[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`seg-btn ${brew.temp === t ? 'seg-on' : ''}`}
                  aria-pressed={brew.temp === t}
                  data-temp={t}
                  onClick={() => g.setTemp(brew.temp === t ? null : t)}
                  disabled={!canServe}
                >
                  <span aria-hidden>{TEMP_ICON[t]}</span>
                  <WordText text={wordMarkup(data, data.content.temperatureWords[t])} interactive={false} />
                </button>
              ))}
            </div>
          ) : null}
          {feats.has('method') ? (
            <div className="seg" role="group" aria-label="作り方">
              {(['steep', 'boil', 'stir'] as Method[]).map((m) => (
                <button
                  key={m}
                  type="button"
                  className={`seg-btn ${brew.method === m ? 'seg-on' : ''}`}
                  aria-pressed={brew.method === m}
                  data-method={m}
                  onClick={() => g.setMethod(brew.method === m ? null : m)}
                  disabled={!canServe}
                >
                  <span aria-hidden>{METHOD_ICON[m]}</span>
                  <WordText text={wordMarkup(data, data.content.methodWords[m])} interactive={false} />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="bench-actions">
        <button type="button" className="btn" onClick={() => g.clearBrew()} disabled={!canServe}>
          やり直す
        </button>
        <button
          type="button"
          className="btn btn-primary btn-big serve-btn"
          disabled={!canServe}
          onClick={() => {
            g.serveBrew();
            onServed?.();
          }}
        >
          出す
        </button>
      </div>
    </div>
  );
}
