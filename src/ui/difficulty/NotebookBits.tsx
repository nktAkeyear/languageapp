/**
 * Notebook additions for レベル設定: the 既習扱い mark on the word list, the word page's
 * 既習扱い / peek box, and the 目標 panel on the 現在地 page. Mounted with one-line hooks in
 * src/ui/book/NotebookView.tsx.
 */
import { isPeeked, levelName, peekWord, PEEK_COST, revertSeededWord, targetProgress } from '../../core/difficulty';
import type { WordState } from '../../core/srs';
import { useGame } from '../useGame';
import { openLevelSettings } from './LevelSettings';
import './difficulty.css';

/** Small 「既」 stamp next to a word that is known by the chosen level, not by play. */
export function SeededMark({ st }: { st: WordState }) {
  if (!st.seeded) return null;
  return (
    <span className="seed-mark" title="既習扱い（レベル設定で知っている扱いにした言葉）" aria-label="既習扱い">
      既
    </span>
  );
}

/** Word page: 既習扱い note + revert, or (assist) a paid peek at the meaning of an unconfirmed word. */
export function WordAssist({ id }: { id: string }) {
  const { data, progress, mutateProgress } = useGame();
  if (!data || !progress) return null;
  const st = progress.words[id];
  const entry = data.lex.byId.get(id);
  if (!entry) return null;
  if (st?.seeded)
    return (
      <div className="wa-box" data-testid="seeded-box">
        <span className="seed-mark">既</span>
        <span className="hand small">既習扱い：レベル設定で「知っている」ことにした言葉です。ときどき復習に出てきます。</span>
        <button
          type="button"
          className="btn btn-small"
          data-testid="revert-seeded"
          onClick={() => {
            if (confirm(`「${entry.text}」を既習扱いから外して、ゲームの中で学び直しますか？`)) mutateProgress((p, d) => void revertSeededWord(d, p, id));
          }}
        >
          学び直す
        </button>
      </div>
    );
  const d = progress.difficulty;
  if (!d?.assists.peek || st?.confirmed) return null;
  const peeked = isPeeked(progress, id);
  return (
    <div className="wa-box" data-testid="peek-box">
      {peeked ? (
        <span className="wa-peek hand" data-testid="peek-gloss">
          （のぞき見）{entry.emoji ? `${entry.emoji} ` : ''}
          {entry.gloss}
        </span>
      ) : (
        <>
          <span className="hand small muted">意味がどうしても分からないときは…</span>
          <button type="button" className="btn btn-small" data-testid="peek" onClick={() => mutateProgress((p) => void peekWord(p, id))}>
            意味をのぞく（評判 −{PEEK_COST}）
          </button>
        </>
      )}
    </div>
  );
}

/** 現在地: progress toward the chosen target qualification, with an honest note about the content. */
export function TargetPanel() {
  const { data, progress } = useGame();
  if (!data || !progress) return null;
  const target = progress.difficulty?.target ?? null;
  if (!target)
    return (
      <div className="tp-box">
        <span className="hand small muted">目標の資格を決めると、ここにその資格までの進み具合が出ます。</span>
        <button type="button" className="btn btn-small" onClick={() => openLevelSettings()} data-testid="set-target">
          目標を決める
        </button>
      </div>
    );
  const t = targetProgress(data, progress, target);
  const r = (x: number) => `${Math.round(x * 100)}%`;
  return (
    <div className="tp-box" data-testid="target-panel">
      <div className="hand small muted">目標：{levelName(data.lang, target)}</div>
      <div className="tp-bar" role="progressbar" aria-valuenow={Math.round(t.ratio * 100)} aria-valuemin={0} aria-valuemax={100}>
        <span className="tp-fill" style={{ width: r(t.ratio) }} />
        <span className="tp-ceiling" style={{ left: r(t.ceiling) }} title="このゲームの今の内容で届く上限" />
      </div>
      <div className="hand small">
        身についた {t.mastered} 語{t.seeded ? `（うち既習扱い ${t.seeded}）` : ''}／一覧 約{t.listSize} 語（{r(t.ratio)}）
      </div>
      <div className="hand small">
        ゲームの中で残り {t.remainingInGame} 語・ゲームにない語 約{t.notInGame} 語
      </div>
      {t.note ? <p className="hand small tp-note">{t.note}</p> : null}
    </div>
  );
}
