/**
 * The predecessor's recipe book (target language only). Left page: table of contents with
 * index tabs (kind / unread); right page: the open page. Arrows in the page corners turn pages.
 */
import { useEffect, useState } from 'react';
import { pagesAtStage } from '../../activities/shop/engine';
import type { BookPage } from '../../core/types';
import { SpeakButton, WordText } from '../components/WordText';
import { useGame } from '../useGame';
import { useUi } from '../uiState';
import { BookShell } from './BookShell';

const KIND_JA: Record<BookPage['kind'], string> = { ingredient: '材料', recipe: '調合', note: '覚え書き' };
type Filter = 'all' | BookPage['kind'] | 'unread';
const FILTERS: [Filter, string][] = [
  ['all', 'すべて'],
  ['recipe', '調合'],
  ['ingredient', '材料'],
  ['note', '覚え書き'],
  ['unread', '未読'],
];

export function RecipeBookView() {
  const g = useGame();
  const ui = useUi();
  const { data, progress } = g;
  const [filter, setFilter] = useState<Filter>('all');
  const sel = ui.recipePage;
  // Opening a page counts its words as encountered (once a day).
  useEffect(() => {
    if (sel) g.openPage(sel);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sel]);
  if (!data || !progress) return null;
  const all = pagesAtStage(data, progress.stage);
  const unread = all.filter((p) => progress.pageViews[p.id] === undefined).length;
  const pages =
    filter === 'all' ? all : all.filter((p) => (filter === 'unread' ? progress.pageViews[p.id] === undefined || p.id === sel : p.kind === filter));
  const cur = all.find((p) => p.id === sel) ?? null;
  const idx = cur ? pages.indexOf(cur) : -1;
  const open = (id: string) => ui.setRecipePage(id);

  const left = (
    <div className="rb-index">
      <h2 className="page-heading">目次</h2>
      {all.length > 8 ? (
        <div className="index-tabs" role="group" aria-label="ページの種類">
          {FILTERS.map(([k, label]) => (
            <button key={k} type="button" className={`index-tab ${filter === k ? 'on' : ''}`} aria-pressed={filter === k} onClick={() => setFilter(k)}>
              {label}
              {k === 'unread' && unread ? <span className="index-count">{unread}</span> : null}
            </button>
          ))}
        </div>
      ) : null}
      {pages.length === 0 ? <p className="hand muted">該当するページはない。</p> : null}
      <ol className="toc">
        {pages.map((p) => (
          <li key={p.id}>
            <button type="button" className={`toc-item ${p.id === sel ? 'on' : ''}`} onClick={() => open(p.id)}>
              <span className="toc-ill" aria-hidden>
                {p.illustration}
              </span>
              <span className="toc-title">
                <WordText text={p.title} interactive={false} />
              </span>
              <span className="toc-dots" aria-hidden />
              <span className="toc-kind">{KIND_JA[p.kind]}</span>
              {progress.pageViews[p.id] === undefined ? <span className="toc-new">新</span> : null}
            </button>
          </li>
        ))}
      </ol>
    </div>
  );

  const right = cur ? (
    <article className={`rb-page rb-${cur.kind}`}>
      <div className="rb-ill" aria-hidden>
        {cur.illustration}
      </div>
      <h3 className="rb-title">
        <WordText text={cur.title} />
        <SpeakButton text={cur.title} label="" className="speak-round" />
      </h3>
      <ul className="rb-lines">
        {cur.lines.map((l, i) => (
          <li key={i} className={`rb-line rb-line-${l.style ?? 'plain'}`}>
            {l.icon ? (
              <span className="rb-icon" aria-hidden>
                {l.icon}
              </span>
            ) : null}
            <WordText text={l.text} />
            <SpeakButton text={l.text} label="" className="speak-round speak-small" />
          </li>
        ))}
      </ul>
      <div className="corner-nav">
        <button type="button" className="corner corner-prev" disabled={idx <= 0} onClick={() => open(pages[idx - 1].id)} aria-label="前のページ">
          ◀
        </button>
        <span className="folio">{idx >= 0 ? `${idx + 1} / ${pages.length}` : ''}</span>
        <button type="button" className="corner corner-next" disabled={idx < 0 || idx >= pages.length - 1} onClick={() => open(pages[idx + 1].id)} aria-label="次のページ">
          ▶
        </button>
      </div>
    </article>
  ) : (
    <div className="rb-cover-page">
      <div className="rb-emblem" aria-hidden>
        🫖
      </div>
      <p className="hand">先代が残したレシピ帳。</p>
      <p className="hand muted">目次からページを開いて読んでみよう。言葉に触れると手帳に記録できる。</p>
      {pages[0] ? (
        <button type="button" className="btn" onClick={() => open(pages[0].id)}>
          最初のページを開く
        </button>
      ) : null}
    </div>
  );

  return (
    <BookShell
      kind="recipe"
      label="レシピ帳"
      left={left}
      right={right}
      showRight={!!cur}
      onBack={() => ui.setRecipePage(null)}
      backLabel="‹ 目次"
      turnKey={cur ? String(all.indexOf(cur)).padStart(4, '0') : '----'}
      onClose={() => ui.closeBook()}
    />
  );
}
