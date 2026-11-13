import { useState } from 'react';
import { pagesAtStage } from '../../activities/shop/engine';
import type { BookPage } from '../../core/types';
import { useGame } from '../useGame';
import { SpeakButton, WordText } from './WordText';

const KIND_JA: Record<BookPage['kind'], string> = { ingredient: '材料', recipe: '調合', note: '覚え書き' };

/** The predecessor's recipe book, written only in the target language. */
export function RecipeBook() {
  const g = useGame();
  const { data, progress } = g;
  const [sel, setSel] = useState<string | null>(null);
  if (!data || !progress) return null;
  const pages = pagesAtStage(data, progress.stage);
  const cur = pages.find((p) => p.id === sel) ?? null;
  const idx = cur ? pages.indexOf(cur) : -1;
  const open = (id: string) => {
    setSel(id);
    g.openPage(id);
  };

  if (!cur) {
    return (
      <div className="book">
        <p className="small muted">先代が残したレシピ帳。ページを開いて読んでみよう。</p>
        <ul className="book-index">
          {pages.map((p) => (
            <li key={p.id}>
              <button type="button" className="book-index-item" onClick={() => open(p.id)}>
                <span className="book-ill" aria-hidden>
                  {p.illustration}
                </span>
                <span className="book-index-title">
                  <WordText text={p.title} interactive={false} />
                </span>
                <span className="chip chip-small">{KIND_JA[p.kind]}</span>
                {progress.pageViews[p.id] === undefined ? <span className="chip chip-new chip-small">新</span> : null}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="book">
      <div className="book-nav">
        <button type="button" className="btn btn-small" onClick={() => setSel(null)}>
          目次
        </button>
        <span className="small muted">
          {idx + 1} / {pages.length}
        </span>
        <span>
          <button type="button" className="btn btn-small" disabled={idx <= 0} onClick={() => open(pages[idx - 1].id)} aria-label="前のページ">
            ◀
          </button>
          <button
            type="button"
            className="btn btn-small"
            disabled={idx >= pages.length - 1}
            onClick={() => open(pages[idx + 1].id)}
            aria-label="次のページ"
          >
            ▶
          </button>
        </span>
      </div>
      <article className={`page page-${cur.kind}`}>
        <div className="page-ill" aria-hidden>
          {cur.illustration}
        </div>
        <h3 className="page-title">
          <WordText text={cur.title} />
          <SpeakButton text={cur.title} label="" />
        </h3>
        <ul className="page-lines">
          {cur.lines.map((l, i) => (
            <li key={i} className={`line line-${l.style ?? 'plain'}`}>
              {l.icon ? (
                <span className="line-icon" aria-hidden>
                  {l.icon}
                </span>
              ) : null}
              <WordText text={l.text} />
              <SpeakButton text={l.text} label="" />
            </li>
          ))}
        </ul>
      </article>
    </div>
  );
}
