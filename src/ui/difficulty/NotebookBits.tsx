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

/**
 * A word the chosen start level assumes known (未確認・知っているはず): marked, never glossed — the
 * meaning appears only when the player confirms it on its 検証ページ.
 */
export function SeededMark({ st }: { st: WordState }) {
  if (!st.seeded || st.confirmed) return null;
  return (
    <span className="nb-assumed" title="未確認（知っているはず）：始めたレベルで知っているはずの言葉。意味はまだ確かめていない。" aria-label="未確認（知っているはず）">
      知っているはず
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
  if (st?.seeded && !st.confirmed)
    return (
      <div className="wa-box" data-testid="seeded-box">
        <span className="nb-assumed">知っているはず</span>
        <span className="hand small">
          始めたレベルで知っているはずの言葉です（出題の調整に使うだけで、意味は表示しません）。自分の推測を書いて、検証ページで確かめましょう。
        </span>
        <button
          type="button"
          className="btn btn-small"
          data-testid="revert-seeded"
          onClick={() => {
            if (confirm(`「${entry.text}」を「知っているはず」から外して、ゲームの中で新しく学び直しますか？`)) mutateProgress((p, d) => void revertSeededWord(d, p, id));
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
        身についた {t.mastered} 語{t.seeded ? `（うち始めたレベルで知っているはず ${t.seeded}）` : ''}／一覧 約{t.listSize} 語（{r(t.ratio)}）
      </div>
      <div className="hand small">
        ゲームの中で残り {t.remainingInGame} 語・ゲームにない語 約{t.notInGame} 語
      </div>
      {t.note ? <p className="hand small tp-note">{t.note}</p> : null}
    </div>
  );
}
