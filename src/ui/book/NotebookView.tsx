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
import { owns } from '../../renovation/engine';
import { isDue, isWeak, playSeen, reviewWeight } from '../../core/srs';
import { isStarred, noteOf } from '../../core/wordbook';
import { WordbookList, WordbookRight } from './Wordbook';
import { tokenIds } from '../../core/tokenize';
import { VerifyPage } from './VerifyPage';
import { RecordLeft, RecordRight } from '../difficulty/RecordPage';
import { SeededMark, TargetPanel, WordAssist } from '../difficulty/NotebookBits';
import { openLevelSettings } from '../difficulty/LevelSettings';
import { JobRecordTable, YardstickPanel } from '../jobs/Yardsticks';
import { jobsOf } from '../../jobs/engine';
import { wordJobs } from '../../jobs/vocab';
import { EIKEN_GRADES } from '../../core/types';
import { TOEIC_BANDS, toeicBand } from '../../curriculum/yardsticks';

type Filter = 'all' | 'open' | 'ok' | 'memo' | 'due';

export function NotebookView() {
  const ui = useUi();
  const g = useGame();
  const tab = ui.nbTab;
  const mobile = useMobile();
  const ribbons: Ribbon[] = [
    { id: 'words', label: '単語', on: tab === 'words', onClick: () => ui.setNbTab('words') },
    { id: 'book', label: '単語帳', on: tab === 'book', onClick: () => ui.setNbTab('book') },
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
  } else if (tab === 'book') {
    left = <WordbookList />;
    right = <WordbookRight />;
    showRight = !!ui.wb.mode;
    onBack = () => ui.setWb({ mode: null });
    turnKey = `b:${ui.wb.mode ?? ''}:${ui.wb.key ?? ''}`;
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
        <JobRecordTable />
      </>
    ) : (
      <RecordLeft onSettings={() => openLevelSettings()} />
    );
    right = (
      <>
        <RecordRight />
        <JobRecordTable />
      </>
    );
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
  // Renovation: the red ribbon marks the words due for review today (hidden SRS made visible).
  const ribbon = owns(progress, 'ribbon');
  const [filter, setFilter] = useState<Filter>(ribbon ? 'due' : 'all');
  const [q, setQ] = useState('');
  const [jobF, setJobF] = useState('');
  const [eikF, setEikF] = useState('');
  const [toeF, setToeF] = useState('');
  if (!data || !progress) return null;
  const zh = data.lang === 'zh';
  const jobs = jobsOf(data);
  const due = (id: string) => {
    const w = progress.words[id];
    // 既習扱い words not met in play since the start level was set are not "to look at again" (else a
    // HSK / 英検 start would fill the ribbon with a few hundred words a fortnight later).
    if (w.seeded && w.seen <= w.seeded.seen) return false;
    return isDue(w, progress.day) || isWeak(w);
  };
  const dueCount = ribbon ? Object.keys(progress.words).filter(due).length : 0;
  const entries = data.content.lexicon
    .filter((e) => progress.words[e.id])
    .map((e) => ({ e, st: progress.words[e.id] }))
    .filter(({ e, st }) =>
      filter === 'open' ? !st.confirmed : filter === 'ok' ? st.confirmed : filter === 'memo' ? !!(st.guess || st.memo) : filter === 'due' ? due(e.id) : true,
    )
    .filter(({ e }) => (!jobF || wordJobs(data, progress.jobs?.wordJobs, e.id).includes(jobF)) && (!eikF || e.eiken === eikF) && (!toeF || String(toeicBand(e.toeic) ?? '') === toeF))
    .filter(({ e, st }) => {
      if (!q) return true;
      const hay = [e.text, e.pinyin ?? '', st.memo, st.guess ?? '', st.confirmed ? e.gloss : ''].join(' ').toLowerCase();
      return hay.includes(q.toLowerCase());
    })
    .sort((a, b) =>
      filter === 'due'
        ? reviewWeight(b.st, progress.day) - reviewWeight(a.st, progress.day) || a.st.lastDay - b.st.lastDay
        : b.st.firstDay - a.st.firstDay || b.st.seen - a.st.seen,
    );
  const total = Object.keys(progress.words).length;
  const confirmed = Object.values(progress.words).filter((w) => w.confirmed).length;
  return (
    <div className="nb-words">
      <h2 className="page-heading">出会った言葉</h2>
      <div className="nb-tools">
        <input className="pencil-input" type="search" placeholder="さがす（文字・推測・メモ）" value={q} onChange={(e) => setQ(e.target.value)} />
        <div className="index-tabs small-tabs" role="group" aria-label="表示">
          {(
            [
              ...(ribbon ? ([['due', `復習 ${dueCount}`]] as [Filter, string][]) : []),
              ['all', 'すべて'],
              ['open', '未確認'],
              ['ok', '確'],
              ['memo', '推測・メモ'],
            ] as [Filter, string][]
          ).map(([k, l]) => (
            <button
              key={k}
              type="button"
              className={`index-tab ${filter === k ? 'on' : ''} ${k === 'due' ? 'index-tab-ribbon' : ''}`}
              aria-pressed={filter === k}
              onClick={() => setFilter(k)}
              data-filter={k}
            >
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="nb-filters" data-testid="nb-filters">
        {jobs.length > 1 ? (
          <select value={jobF} onChange={(e) => setJobF(e.target.value)} aria-label="仕事で絞る" data-testid="filter-job">
            <option value="">仕事：すべて</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nameJa}
              </option>
            ))}
          </select>
        ) : null}
        {!zh ? (
          <>
            <select value={eikF} onChange={(e) => setEikF(e.target.value)} aria-label="英検の級で絞る" data-testid="filter-eiken">
              <option value="">英検：すべて</option>
              {EIKEN_GRADES.map((g) => (
                <option key={g} value={g}>
                  英検{g}級
                </option>
              ))}
            </select>
            <select value={toeF} onChange={(e) => setToeF(e.target.value)} aria-label="TOEIC のスコア帯で絞る" data-testid="filter-toeic">
              <option value="">TOEIC：すべて</option>
              {TOEIC_BANDS.map((b) => (
                <option key={b} value={String(b)}>
                  TOEIC〜{b}
                </option>
              ))}
            </select>
          </>
        ) : null}
      </div>
      <div className="hand small muted">
        記録 {total} 語・確かめた {confirmed} 語{filter !== 'all' || q || jobF || eikF || toeF ? `・表示 ${entries.length} 語` : ''}
      </div>
      <ul className="nb-list">
        {entries.map(({ e, st }) => (
          <li key={e.id} className={`nb-entry ${st.confirmed ? 'ok' : ''} ${ui.word === e.id ? 'on' : ''}`}>
            <button type="button" className="nb-word" onClick={() => ui.setWord(e.id)} lang={zh ? 'zh-CN' : 'en'}>
              <span className="nb-text">{e.text}</span>
              {!st.confirmed ? <SeededMark st={st} /> : null}
              {isStarred(progress, e.id) ? <span className="nb-star" title="単語帳に入っている" aria-label="単語帳">★</span> : null}
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
              ) : st.guess ? (
                <span className="nb-own">{st.guess}</span>
              ) : st.memo ? (
                <span className="nb-memo">{st.memo}</span>
              ) : (
                <span className="nb-tally" title={`出会った回数 ${playSeen(st)}`}>
                  {playSeen(st) ? tally(playSeen(st)) : st.seeded ? '' : '棚で見た'}
                </span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {filter === 'due' ? <p className="hand muted small">赤いしおりの言葉：今日もう一度出会いたい言葉（しばらく見ていない・まちがえた）。</p> : null}
      {entries.length === 0 ? <p className="hand muted small">{filter === 'due' ? '今日、見直す言葉はない。' : 'まだ何もありません。'}</p> : null}
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
      <p className="hand muted">左の一覧から言葉を選ぶと、そのページが開く。自分の推測（意味）とメモを書いておこう。場面のどの言葉も、触れると単語カードが開いて、その場で書ける。</p>
      <p className="hand muted small">意味は「検証」のページで、組み合わせが全部合ったときにだけ確定する。</p>
    </div>
  );
}

function WordPage({ id }: { id: string }) {
  const { data, progress, setNote, wordbook } = useGame();
  const ui = useUi();
  const entry = data?.lex.byId.get(id);
  const st = progress?.words[id];
  // Renovation: the magnifying glass — the word marked in its sentences, and the words that keep
  // appearing with it (a closer look for guessing its meaning).
  const closer = owns(progress, 'magnifier');
  const neighbours: [string, number][] = [];
  if (closer && data && st) {
    const count = new Map<string, number>();
    for (const c of st.contexts) for (const w of new Set(tokenIds(data.tokens(c)))) if (w !== id) count.set(w, (count.get(w) ?? 0) + 1);
    neighbours.push(...[...count].filter(([, n]) => n >= 2 || st.contexts.length <= 2).sort((a, b) => b[1] - a[1]).slice(0, 6));
  }
  const note = noteOf(progress, id);
  const [guess, setGuessLocal] = useState(note.guess);
  const [memo, setLocal] = useState(note.memo);
  useEffect(() => {
    setGuessLocal(note.guess);
    setLocal(note.memo);
  }, [id, note.guess, note.memo]);
  if (!data || !entry) return null;
  const zh = data.lang === 'zh';
  const starred = isStarred(progress, id);
  const dirty = guess.trim() !== note.guess || memo !== note.memo;
  const save = () => {
    if (!dirty) return;
    setNote(id, { guess, memo });
  };
  return (
    <div className="wp" data-testid="word-page">
      <div className="wp-head">
        <div className="wp-word" lang={zh ? 'zh-CN' : 'en'}>
          {entry.text}
          {zh && entry.pinyin ? <div className="wp-pinyin">{entry.pinyin}</div> : null}
        </div>
        <SpeakButton text={entry.text} label="" className="speak-round" />
        <button
          type="button"
          className={`wcard-star wcard-icon ${starred ? 'on' : ''}`}
          aria-pressed={starred}
          title={starred ? '単語帳から外す' : '気になる（単語帳に入れる）'}
          data-testid="wp-star"
          onClick={() => wordbook.toggleStar(id)}
        >
          <span aria-hidden>{starred ? '★' : '☆'}</span>
          <span className="wcard-star-label">{starred ? '単語帳' : '気になる'}</span>
        </button>
      </div>
      <div className="wp-status">
        {st?.confirmed ? (
          <span className="wp-confirmed">
            <span className="seal seal-inline">確</span>
            {entry.emoji ? `${entry.emoji} ` : ''}
            {entry.gloss}
            <span className="wp-compare hand small">自分の推測：{note.guess ? `「${note.guess}」` : '（書いていなかった）'}</span>
          </span>
        ) : (
          <span className="wp-unconfirmed">{st?.seeded ? '未確認（知っているはず）' : '未確認'}</span>
        )}
        <span className="hand small muted">
          出会った {playSeen(st)} 回・うまく使えた {Math.max(0, (st?.correct ?? 0) - (st?.seeded?.correct ?? 0))} 回
        </span>
      </div>
      <WordTags id={id} />
      <WordAssist id={id} />
      <label className="wp-memo">
        <span className="hand small muted">自分の推測（意味）</span>
        <input
          className="pencil-input wcard-guess"
          type="text"
          value={guess}
          maxLength={200}
          placeholder="たぶん「〜」という意味？"
          data-testid="wp-guess"
          onChange={(e) => setGuessLocal(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        />
      </label>
      <label className="wp-memo">
        <span className="hand small muted">メモ</span>
        <textarea value={memo} rows={2} placeholder="どこで出てきた？何といっしょ？" onChange={(e) => setLocal(e.target.value)} onBlur={save} data-testid="wp-memo" />
      </label>
      {dirty ? (
        <button type="button" className="btn btn-small" onClick={save}>
          書きとめる
        </button>
      ) : null}
      {st?.contexts.length ? (
        <div className={`wp-contexts ${closer ? 'wp-closer' : ''}`}>
          <div className="hand small muted">{closer ? '見かけた文（虫めがねで）' : '見かけた文'}</div>
          <ul>
            {st.contexts.map((c) => (
              <li key={c}>
                <WordText text={c} highlight={closer ? id : undefined} />
                <SpeakButton text={c} label="" className="speak-round speak-small" />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {closer && neighbours.length ? (
        <div className="wp-neighbours" data-testid="word-neighbours">
          <div className="hand small muted">いっしょに出てくる言葉</div>
          <div className="wp-nb-list">
            {neighbours.map(([nid, n]) => {
              const ne = data.lex.byId.get(nid);
              const ns = progress?.words[nid];
              return (
                <button key={nid} type="button" className={`wp-nb ${ns?.confirmed ? 'ok' : ''}`} onClick={() => ui.setWord(nid)} lang={zh ? 'zh-CN' : 'en'}>
                  <span className="wp-nb-text">{ne?.text}</span>
                  <span className="wp-nb-meta">{ns?.confirmed ? ne?.gloss : ns?.guess ? `推測：${ns.guess}` : ns?.memo ? `メモ：${ns.memo}` : `×${n}`}</span>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

/** Where the word belongs: its levels on both yardsticks and the jobs where it was met. */
function WordTags({ id }: { id: string }) {
  const { data, progress } = useGame();
  const e = data?.lex.byId.get(id);
  if (!data || !progress || !e) return null;
  const jobs = jobsOf(data);
  const where = wordJobs(data, progress.jobs?.wordJobs, id)
    .map((j) => jobs.find((x) => x.id === j))
    .filter(Boolean);
  const band = toeicBand(e.toeic);
  return (
    <div className="wp-tags hand small" data-testid="word-tags">
      {data.lang === 'en' ? <span className="lvl-tag">{e.eiken ? `英検${e.eiken}級` : '英検 —'}</span> : null}
      {data.lang === 'en' ? <span className="lvl-tag">{band ? `TOEIC〜${band}` : 'TOEIC —'}</span> : null}
      {where.map((j) => (
        <span key={j!.id} className="wp-job">
          {j!.icon} {j!.nameJa}
        </span>
      ))}
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
      <p className="hand muted small">確かめた言葉は、どこで見ても触れれば意味が分かるようになる（自分の推測と並べて見られる）。</p>
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
      {data.lang === 'en' ? (
        <YardstickPanel />
      ) : (
        <>
          <h4 className="hand">HSK の語彙目安</h4>
          {r.examBars.map((b) => (
            <Bar key={b.key} bar={b} />
          ))}
        </>
      )}
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
