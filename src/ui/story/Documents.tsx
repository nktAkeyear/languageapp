/**
 * Documents as physical things: a paper appears on the counter, is picked up and read (every
 * word clickable; confirmed words carry their meaning underneath; words confirmed since the
 * last reading glow), then goes into the wooden document box on the counter — keepsakes (the
 * blue cup, the carved ship) go on the window sill. The box opens to the papers inside.
 */
import { useEffect, useMemo, useState } from 'react';
import { docFreshWords, docLines, docReadability, storyDismiss, storyDocPutAway, storyReadDoc } from '../../story/engine';
import { storyOf } from '../../story/text';
import type { DocumentDef } from '../../story/types';
import { DocBoxArt, DocObjectArt, docLook, isKeepsake, type DocLook } from '../art/documents';
import { SpeakButton, WordText } from '../components/WordText';
import { sfx } from '../sound';
import { useGame } from '../useGame';
import { useUi } from '../uiState';
import { LedgerBook } from './NightLedger';
import type { Act } from './StoryStage';
import { useStoryUi } from './StoryUi';

const KIND_JA: Record<string, string> = { letter: '手紙', note: '走り書き', diary: '日記', postcard: '絵はがき', receipt: '紙切れ', recipe: 'レシピ', gift: '贈り物' };

const FOUND_JA: Record<DocLook, string> = {
  letter: 'カウンターの上に、封筒が一通。',
  letter2: '海の向こうから、封筒が一通。',
  final: 'リボンのかかった封筒が一通。',
  note: '小さな紙切れ。走り書きがある。',
  ticket: 'くしゃくしゃの紙切れ。何かの券らしい。',
  diary: '日記帳から外れたページが一枚。',
  postcard: '一枚の絵はがき。',
  recipe: '使いこまれたレシピのカード。',
  cup: 'カウンターに、青いカップが置かれた。',
  ship: 'カウンターに、木彫りの小さな船が置かれた。',
};

function useDocDef(docId: string): DocumentDef | undefined {
  const { data } = useGame();
  const story = data ? storyOf(data) : null;
  return story?.shared.documents.find((d) => d.id === docId);
}

/** A found document: it lies on the counter, the player picks it up, reads, puts it away. */
export function DocFound({ docId, act, night }: { docId: string; act: Act; night: boolean }) {
  const { data } = useGame();
  const ui = useUi();
  const def = useDocDef(docId);
  const [phase, setPhase] = useState<'lying' | 'reading' | 'away'>('lying');
  useEffect(() => sfx('paper'), []);
  const story = data ? storyOf(data) : null;
  if (!def || !story) return null;
  const look = docLook(def.id, def.kind);
  const keep = isKeepsake(look);
  const found = story.text.docs[docId]?.foundJa;
  const putAway = () => {
    sfx(keep ? 'clink' : 'drawer');
    setPhase('away');
    window.setTimeout(
      () =>
        act((p, d) => {
          storyDocPutAway(d, p, docId);
          storyDismiss(d, p);
        }),
      ui.reducedMotion ? 0 : 650,
    );
  };
  return (
    <div className={`cv df ${night ? 'cv-night' : ''}`} data-testid="story-found" data-doc={docId}>
      <div className="cv-dim" aria-hidden />
      <div className="cv-counter" aria-hidden />
      {phase === 'lying' ? (
        <div className="df-lying">
          <button
            type="button"
            className={`df-object df-${look}`}
            onClick={() => {
              sfx('paper');
              setPhase('reading');
            }}
            aria-label={`${story.text.docs[docId]?.titleJa ?? ''}を手に取る`}
            data-testid="doc-pick"
          >
            <DocObjectArt look={look} />
          </button>
          <p className="cv-narr hand df-narr">{found ?? FOUND_JA[look]}</p>
          <button
            type="button"
            className="cv-btn cv-next"
            onClick={() => {
              sfx('paper');
              setPhase('reading');
            }}
          >
            手に取る
          </button>
        </div>
      ) : (
        <div className={phase === 'away' ? `df-away ${keep ? 'df-away-sill' : 'df-away-box'}` : ''}>
          <DocReader docId={docId} onClose={putAway} closeLabel={keep ? '窓辺に飾る' : '書類箱にしまう'} />
        </div>
      )}
    </div>
  );
}

/** The paper in hand: clickable target-language text with glosses, newly readable words glowing. */
export function DocReader({ docId, onClose, closeLabel }: { docId: string; onClose: () => void; closeLabel: string }) {
  const g = useGame();
  const { data, progress: p } = g;
  const def = useDocDef(docId);
  // Words confirmed since the paper was last put away (fixed for this reading).
  const [fresh] = useState(() => (data && p ? new Set(docFreshWords(data, p, docId)) : new Set<string>()));
  const rec = p?.story.docs[docId];
  // Reading counts the words as encountered (once a day).
  useEffect(() => {
    if (rec && rec.lastRead !== p?.day) g.mutateProgress((pp, dd) => storyReadDoc(dd, pp, docId));
  }, [docId]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (fresh.size) window.setTimeout(() => sfx('glow'), 500);
  }, [fresh]);
  const story = data ? storyOf(data) : null;
  if (!data || !p || !def || !story) return null;
  const look = docLook(def.id, def.kind);
  const lines = docLines(data, p, docId);
  const now = Math.round(docReadability(data, p, docId) * 100);
  const first = Math.round((rec?.firstPct ?? 0) * 100);
  const t = story.text.docs[docId];
  const keep = isKeepsake(look);
  return (
    <div className="dr" role="dialog" aria-label={t?.titleJa} data-testid="story-doc" data-doc={docId}>
      {keep ? (
        <div className="dr-keepsake">
          <DocObjectArt look={look} />
        </div>
      ) : null}
      <div className={`dr-paper dr-${look}`}>
        <div className="dr-label">
          {t?.titleJa}
          <span className="dr-kind">{KIND_JA[def.kind]}</span>
        </div>
        {look === 'postcard' ? <div className="dr-stamp" aria-hidden /> : null}
        <div className="dr-lines">
          {lines.map((l, i) => (
            <p key={i} className="dr-line">
              <WordText text={l} story glossed fresh={fresh} />
            </p>
          ))}
        </div>
      </div>
      <div className="dr-foot">
        {fresh.size ? (
          <p className="dr-fresh hand" data-testid="doc-fresh">
            前に読んだときより、<strong>{fresh.size}</strong>語 読めるようになった。
          </p>
        ) : null}
        <div className="dr-meter" title="意味を確定した言葉の割合">
          <span className="dr-meter-bar">
            <span style={{ width: `${now}%` }} />
            {first < now ? <span className="dr-meter-first" style={{ width: `${first}%` }} /> : null}
          </span>
          <span className="dr-meter-txt" data-testid="story-readability">
            読める言葉 {now}%{rec && first !== now ? `（見つけたとき ${first}%）` : ''}
          </span>
          <SpeakButton text={lines.join(' ')} label="" className="speak-round" />
        </div>
        <button type="button" className="cv-btn cv-done" onClick={onClose} data-testid="doc-close">
          {closeLabel}
        </button>
      </div>
    </div>
  );
}

/** The document box on the shop counter. */
export function DocBoxProp() {
  const g = useGame();
  const { progress, data } = g;
  const su = useStoryUi();
  const story = data ? storyOf(data) : null;
  if (!progress?.story || !story) return null;
  const papers = story.shared.documents.filter((d) => progress.story.docs[d.id] && !isKeepsake(docLook(d.id, d.kind)));
  if (!papers.length && !progress.story.lastLedger) return null;
  const unread = papers.some((d) => progress.story.docs[d.id].reads === 0);
  return (
    <button
      type="button"
      className={`docbox ${unread ? 'docbox-unread' : ''}`}
      onClick={() => {
        sfx('drawer');
        // A paper that came today and has not been picked up yet: it is taken out first (then into the box).
        const waiting = progress.story.cards.findIndex((c) => c.deferred && c.kind === 'doc');
        if (waiting >= 0) g.openStoryCard(waiting);
        else su.openBox();
      }}
      aria-label={`書類箱を開く（${papers.length}）${unread ? '・まだ読んでいないものがある' : ''}`}
      data-testid="story-docs-button"
    >
      <DocBoxArt count={papers.length} unread={unread} />
      <span className="desk-tag">書類箱</span>
    </button>
  );
}

/** Keepsakes on the window sill (the blue cup, the carved ship). */
export function Keepsakes() {
  const { progress, data } = useGame();
  const su = useStoryUi();
  const story = data ? storyOf(data) : null;
  if (!progress?.story || !story) return null;
  const items = story.shared.documents.filter((d) => progress.story.docs[d.id] && isKeepsake(docLook(d.id, d.kind)));
  if (!items.length) return null;
  return (
    <div className="keepsakes">
      {items.map((d) => (
        <button key={d.id} type="button" className={`keepsake keepsake-${docLook(d.id, d.kind)}`} onClick={() => su.openDoc(d.id)} aria-label={story.text.docs[d.id]?.titleJa} data-doc={d.id}>
          <DocObjectArt look={docLook(d.id, d.kind) as DocLook} />
        </button>
      ))}
    </div>
  );
}

/** The open box: the papers inside (newest on top), last night's ledger, or one paper being read. */
export function DocBoxView() {
  const g = useGame();
  const su = useStoryUi();
  const { data, progress: p } = g;
  const [ledger, setLedger] = useState(false);
  const story = data ? storyOf(data) : null;
  const found = useMemo(
    () => (story && p ? story.shared.documents.filter((d) => p.story.docs[d.id]).sort((a, b) => p.story.docs[a.id].day - p.story.docs[b.id].day) : []),
    [story, p],
  );
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && su.closeBox();
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [su]);
  if (!data || !p || !story) return null;
  const close = () => {
    if (su.reading) {
      const id = su.reading;
      g.mutateProgress((pp, dd) => storyDocPutAway(dd, pp, id));
      sfx('paper');
      if (su.box) su.closeDoc();
      else su.closeBox();
    } else {
      sfx('drawer');
      su.closeBox();
    }
  };
  return (
    <div className="st-root" data-testid="story-collection">
      <div className="cv">
        <div className="cv-dim" aria-hidden onClick={close} />
        {su.reading ? (
          <DocReader key={su.reading} docId={su.reading} onClose={close} closeLabel={su.box ? '箱に戻す' : '元に戻す'} />
        ) : ledger && p.story.lastLedger ? (
          <LedgerBook ledger={p.story.lastLedger} onClose={() => setLedger(false)} />
        ) : (
          <div className="box-open" role="dialog" aria-label="書類箱">
            <div className="box-head">
              <span className="box-title">書類箱</span>
              <button type="button" className="cv-btn box-close" onClick={close} aria-label="閉じる">
                ふたを閉める
              </button>
            </div>
            <div className="box-inside">
              {found.map((d, i) => {
                const rec = p.story.docs[d.id];
                const pct = Math.round(docReadability(data, p, d.id) * 100);
                const fresh = docFreshWords(data, p, d.id).length;
                return (
                  <button
                    key={d.id}
                    type="button"
                    className="box-item"
                    style={{ ['--tilt' as string]: `${((i * 37) % 9) - 4}deg` }}
                    onClick={() => {
                      sfx('paper');
                      su.openDoc(d.id);
                    }}
                    data-doc={d.id}
                  >
                    <DocObjectArt look={docLook(d.id, d.kind)} />
                    <span className="box-item-title">{story.text.docs[d.id]?.titleJa}</span>
                    <span className="box-item-meta">
                      {rec.day}日目・読める {pct}%
                    </span>
                    {rec.reads === 0 ? <span className="box-new">未読</span> : fresh ? <span className="box-new box-more">+{fresh}語</span> : null}
                  </button>
                );
              })}
              {p.story.lastLedger ? (
                <button type="button" className="box-item box-ledger" onClick={() => setLedger(true)}>
                  <span className="mini-ledger" aria-hidden />
                  <span className="box-item-title">ゆうべの帳簿</span>
                  <span className="box-item-meta">{p.story.lastLedger.day}日目</span>
                </button>
              ) : null}
              {!found.length && !p.story.lastLedger ? <p className="cv-narr hand">まだ何もない。</p> : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
