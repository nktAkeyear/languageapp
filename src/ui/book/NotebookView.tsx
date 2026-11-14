/**
 * 手帳: the player's own notebook. Ribbons: 単語 (handwritten word list + a word's page with
 * memo, audio and the sentences seen), 検証 (verification pages), 現在地 (level guide).
 */
import { useEffect, useState } from 'react';
import { CEFR_MAPPING, levelReport, type LevelBar } from '../../core/levels';
import { CEFR_LEVELS } from '../../core/types';
import { pageReadiness, pageStatus, pageWords } from '../../core/verification';
import { SpeakButton, WordText } from '../components/WordText';
import { useGame } from '../useGame';
import { useMobile } from '../layout';
import { useUi } from '../uiState';
import { BookShell, type Ribbon } from './BookShell';
import { VerifyPage } from './VerifyPage';
import { RecordLeft, RecordRight } from '../difficulty/RecordPage';
import { SeededMark, TargetPanel, WordAssist } from '../difficulty/NotebookBits';
import { openLevelSettings } from '../difficulty/LevelSettings';

type Filter = 'all' | 'open' | 'ok' | 'memo';

export function NotebookView() {
  const ui = useUi();
  const g = useGame();
  const tab = ui.nbTab;
  const mobile = useMobile();
  const ribbons: Ribbon[] = [
    { id: 'words', label: '単語', on: tab === 'words', onClick: () => ui.setNbTab('words') },
    { id: 'verify', label: '検証', on: tab === 'verify', dot: ui.newPages.length > 0, onClick: () => ui.setNbTab('verify') },
    { id: 'level', label: '現在地', on: tab === 'level', onClick: () => ui.setNbTab('level') },
    { id: 'record', label: '記録', on: tab === 'record', onClick: () => ui.setNbTab('record') },
  ];
  if (!g.data || !g.progress) return null;
  let left;
  let right;
  let showRight = false;
  let onBack: (() => void) | undefined;
  let turnKey: string = tab;
  if (tab === 'words') {
    left = <WordList />;
    right = ui.word ? <WordPage id={ui.word} /> : <WordsIntro />;
    showRight = !!ui.word;
    onBack = () => ui.setWord(null);
    turnKey = `w:${ui.word ?? ''}`;
  } else if (tab === 'verify') {
    const page = g.data.content.verificationPages.find((p) => p.id === ui.verifyPage);
    left = <VerifyList />;
    right = page ? <VerifyPage page={page} /> : <VerifyIntro />;
    showRight = !!page;
    onBack = () => ui.setVerifyPage(null);
    turnKey = `v:${ui.verifyPage ?? ''}`;
  } else if (tab === 'record') {
    left = mobile ? (
      <>
        <RecordLeft onSettings={() => openLevelSettings()} />
        <RecordRight />
      </>
    ) : (
      <RecordLeft onSettings={() => openLevelSettings()} />
    );
    right = <RecordRight />;
    showRight = false;
  } else {
    left = mobile ? <LevelBoth /> : <LevelLeft />;
    right = <LevelRight />;
    showRight = false;
  }
  return (
    <BookShell
      kind="notebook"
      label="手帳"
      ribbons={ribbons}
      left={left}
      right={right}
      showRight={showRight}
      onBack={onBack}
      backLabel="‹ 一覧"
      turnKey={turnKey}
      onClose={() => ui.closeBook()}
    />
  );
}

// ------------------------------------------------------------------------------------- words

function WordList() {
  const { data, progress } = useGame();
  const ui = useUi();
  const [filter, setFilter] = useState<Filter>('all');
  const [q, setQ] = useState('');
  if (!data || !progress) return null;
  const zh = data.lang === 'zh';
  const entries = data.content.lexicon
    .filter((e) => progress.words[e.id])
    .map((e) => ({ e, st: progress.words[e.id] }))
    .filter(({ st }) => (filter === 'open' ? !st.confirmed : filter === 'ok' ? st.confirmed : filter === 'memo' ? !!st.memo : true))
    .filter(({ e, st }) => {
      if (!q) return true;
      const hay = [e.text, e.pinyin ?? '', st.memo, st.confirmed ? e.gloss : ''].join(' ').toLowerCase();
      return hay.includes(q.toLowerCase());
    })
    .sort((a, b) => b.st.firstDay - a.st.firstDay || b.st.seen - a.st.seen);
  const total = Object.keys(progress.words).length;
  const confirmed = Object.values(progress.words).filter((w) => w.confirmed).length;
  return (
    <div className="nb-words">
      <h2 className="page-heading">出会った言葉</h2>
      <div className="nb-tools">
        <input className="pencil-input" type="search" placeholder="さがす（文字・メモ）" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="index-tabs small-tabs" role="group" aria-label="表示">
          {(
            [
              ['all', 'すべて'],
              ['open', '未確定'],
              ['ok', '確定'],
              ['memo', 'メモ'],
            ] as [Filter, string][]
          ).map(([k, l]) => (
            <button key={k} type="button" className={`index-tab ${filter === k ? 'on' : ''}`} aria-pressed={filter === k} onClick={() => setFilter(k)}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="hand small muted">
        記録 {total} 語・確定 {confirmed} 語{filter !== 'all' || q ? `・表示 ${entries.length} 語` : ''}
      </div>
      <ul className="nb-list">
        {entries.map(({ e, st }) => (
          <li key={e.id} className={`nb-entry ${st.confirmed ? 'ok' : ''} ${ui.word === e.id ? 'on' : ''}`}>
            <button type="button" className="nb-word" onClick={() => ui.setWord(e.id)} lang={zh ? 'zh-CN' : 'en'}>
              <span className="nb-text">{e.text}</span>
              <SeededMark st={st} />
              {zh && e.pinyin ? <span className="nb-pinyin">{e.pinyin}</span> : null}
            </button>
            <span className="nb-meaning">
              {st.confirmed ? (
                <span className="nb-gloss">
                  <span className="mini-seal" aria-hidden>
                    確
                  </span>
                  {e.gloss}
                </span>
              ) : st.memo ? (
                <span className="nb-memo">{st.memo}</span>
              ) : (
                <span className="nb-tally" title={`出会った回数 ${st.seen}`}>
                  {st.seen ? tally(st.seen) : '棚で見た'}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {entries.length === 0 ? <p className="hand muted small">まだ何もありません。</p> : null}
    </div>
  );
}

/** Pencil tally marks (五 style groups) for how often a word was met. */
function tally(n: number): string {
  const m = Math.min(n, 15);
  const fives = Math.floor(m / 5);
  return '卌 '.repeat(fives) + '|'.repeat(m % 5) + (n > 15 ? '+' : '');
}

function WordsIntro() {
  return (
    <div className="nb-intro">
      <p className="hand">お客さんの言葉、レシピ帳の言葉。出会った言葉はここに書き留めてある。</p>
      <p className="hand muted">左の一覧から言葉を選ぶと、そのページが開く。推測をメモしておこう。</p>
      <p className="hand muted small">意味は「検証」のページで、組み合わせが全部合ったときにだけ確定する。</p>
    </div>
  );
}

function WordPage({ id }: { id: string }) {
  const { data, progress, setMemo } = useGame();
  const entry = data?.lex.byId.get(id);
  const st = progress?.words[id];
  const [memo, setLocal] = useState(st?.memo ?? '');
  useEffect(() => setLocal(st?.memo ?? ''), [id, st?.memo]);
  if (!data || !entry) return null;
  const zh = data.lang === 'zh';
  return (
    <div className="wp" data-testid="word-page">
      <div className="wp-head">
        <div className="wp-word" lang={zh ? 'zh-CN' : 'en'}>
          {entry.text}
          {zh && entry.pinyin ? <div className="wp-pinyin">{entry.pinyin}</div> : null}
        </div>
        <SpeakButton text={entry.text} label="" className="speak-round" />
      </div>
      <div className="wp-status">
        {st?.confirmed ? (
          <span className="wp-confirmed">
            <span className="seal seal-inline">確</span>
            {entry.emoji ? `${entry.emoji} ` : ''}
            {entry.gloss}
          </span>
        ) : (
          <span className="wp-unconfirmed">未確定</span>
        )}
        <span className="hand small muted">
          出会った {st?.seen ?? 0} 回・うまく使えた {st?.correct ?? 0} 回
        </span>
      </div>
      <WordAssist id={id} />
      <label className="wp-memo">
        <span className="hand small muted">自分のメモ（推測）</span>
        <textarea
          value={memo}
          rows={2}
          placeholder="たぶん「〜」という意味？"
          onChange={(e) => setLocal(e.target.value)}
          onBlur={() => memo !== (st?.memo ?? '') && setMemo(id, memo)}
        />
      </label>
      {memo !== (st?.memo ?? '') ? (
        <button type="button" className="btn btn-small" onClick={() => setMemo(id, memo)}>
          メモを保存
        </button>
      ) : null}
      {st?.contexts.length ? (
        <div className="wp-contexts">
          <div className="hand small muted">見かけた文</div>
          <ul>
            {st.contexts.map((c) => (
              <li key={c}>
                <WordText text={c} />
                <SpeakButton text={c} label="" className="speak-round speak-small" />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

// ------------------------------------------------------------------------------------- verification

function VerifyList() {
  const { data, progress } = useGame();
  const ui = useUi();
  // Looking at the list counts as noticing the new pages (the desk notebook stops glowing).
  const newKey = ui.newPages.join(',');
  useEffect(() => {
    if (ui.newPages.length) ui.acknowledgePages(ui.newPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newKey]);
  if (!data || !progress) return null;
  const visible = data.content.verificationPages.filter((p) => pageWords(data, p.id).some((w) => progress.words[w.id]));
  const rows = visible.map((p) => ({ p, status: pageStatus(data, progress, p), ready: pageReadiness(data, progress, p) }));
  const todo = rows
    .filter((r) => r.status !== 'solved')
    .sort((a, b) => Number(b.status === 'available') - Number(a.status === 'available') || b.ready - a.ready);
  const solved = rows.filter((r) => r.status === 'solved');
  const item = ({ p, status, ready }: (typeof rows)[number]) => (
    <li key={p.id}>
      <button
        type="button"
        className={`vl-item vl-${status} ${ui.verifyPage === p.id ? 'on' : ''}`}
        disabled={status === 'locked'}
        onClick={() => ui.setVerifyPage(p.id)}
        data-testid={`vpage-${p.id}`}
      >
        <span className="vl-label">{p.labelJa}</span>
        {status === 'solved' ? (
          <span className="mini-seal">確</span>
        ) : status === 'available' ? (
          <span className="vl-flag">検証できる</span>
        ) : (
          <span className="vl-ready" title={`準備中 ${Math.round(ready * 100)}%`}>
            <span style={{ width: `${Math.round(ready * 100)}%` }} />
          </span>
        )}
      </button>
    </li>
  );
  return (
    <div className="vl">
      <h2 className="page-heading">検証ページ</h2>
      <p className="hand small muted">関係のありそうな言葉のページ。ページの言葉それぞれに何度か出会うと開ける。</p>
      {todo.length ? <ul>{todo.map(item)}</ul> : null}
      {solved.length ? (
        <details className="vl-solved" open={todo.length === 0}>
          <summary className="hand">確定したページ（{solved.length}）</summary>
          <ul>{solved.map(item)}</ul>
        </details>
      ) : null}
      {visible.length === 0 ? <p className="hand muted small">まだ検証できるページはありません。</p> : null}
    </div>
  );
}

function VerifyIntro() {
  return (
    <div className="nb-intro">
      <p className="hand">意味のカードに、言葉の紙片を置いていく。</p>
      <p className="hand muted">ページの全部のカードが合っていたときだけ、ハンコが押されて意味が確定する。どれが違うかは教えてくれない。</p>
      <p className="hand muted small">確定した言葉は、どこで見ても触れれば意味が分かるようになる。</p>
    </div>
  );
}

// ------------------------------------------------------------------------------------- level

function Bar({ bar }: { bar: LevelBar }) {
  return (
    <div className="lbar">
      <span className="lbar-label">{bar.label}</span>
      <span className="lbar-track" role="progressbar" aria-valuenow={Math.round(bar.ratio * 100)} aria-valuemin={0} aria-valuemax={100}>
        <span className="lbar-fill" style={{ width: `${Math.max(bar.ratio * 100, bar.mastered ? 1.5 : 0)}%` }} />
      </span>
      <span className="lbar-num">
        {bar.mastered}/{bar.target}
      </span>
    </div>
  );
}

function LevelLeft() {
  const { data, progress } = useGame();
  if (!data || !progress) return null;
  const r = levelReport(data, progress);
  return (
    <div className="level">
      <h2 className="page-heading">現在地</h2>
      <div className="level-statement">
        <div className="hand small muted">いまの現在地（目安）</div>
        <div className="level-main">{r.statement}</div>
        <div className="hand small">{r.cefrStatement}</div>
      </div>
      <div className="hand small muted">
        身についた語 {r.masteredTotal}（確定済み＋何度か使えた語）／出会った語 {r.encounteredTotal}
      </div>
      <TargetPanel />
      <h4 className="hand">{data.lang === 'en' ? '英検' : 'HSK'} の語彙目安</h4>
      {r.examBars.map((b) => (
        <Bar key={b.key} bar={b} />
      ))}
    </div>
  );
}

function LevelRight() {
  const { data, progress } = useGame();
  if (!data || !progress) return null;
  const r = levelReport(data, progress);
  const lang = data.lang;
  return (
    <div className="level">
      <h4 className="hand">CEFR</h4>
      {r.cefrBars.map((b) => (
        <Bar key={b.key} bar={b} />
      ))}
      <table className="map-table">
        <tbody>
          {CEFR_LEVELS.map((c) => (
            <tr key={c}>
              <th>{c}</th>
              <td>{CEFR_MAPPING[c][lang]}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="hand small muted note">
        ※ これは「語彙・読む・聞く」についての大まかな目安です。話す・書く力は測っていません。
        目標語数は{lang === 'en' ? '英検の一般的な推定値' : 'HSK（旧）公式語彙表の累計語数'}を使った概算です。
      </p>
    </div>
  );
}

/** Phone: the level guide on one page. */
function LevelBoth() {
  return (
    <>
      <LevelLeft />
      <LevelRight />
    </>
  );
}
