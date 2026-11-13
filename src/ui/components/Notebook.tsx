import { useMemo, useState } from 'react';
import { CEFR_MAPPING, levelReport, type LevelBar } from '../../core/levels';
import { hashString, makeRng, shuffle } from '../../core/rng';
import { CEFR_LEVELS, type VerificationPage } from '../../core/types';
import { pageReadiness, pageStatus, pageWords } from '../../core/verification';
import { useGame } from '../useGame';
import { SpeakButton } from './WordText';

type Tab = 'words' | 'verify' | 'level';

/** 手帳: automatic word list, 検証ページ, 現在地. */
export function Notebook() {
  const [tab, setTab] = useState<Tab>('words');
  return (
    <div className="notebook">
      <div className="tabs" role="tablist">
        {(
          [
            ['words', '単語'],
            ['verify', '検証'],
            ['level', '現在地'],
          ] as [Tab, string][]
        ).map(([k, label]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} className={`tab ${tab === k ? 'tab-on' : ''}`} onClick={() => setTab(k)}>
            {label}
          </button>
        ))}
      </div>
      {tab === 'words' ? <WordList /> : tab === 'verify' ? <VerificationList /> : <LevelPanel />}
    </div>
  );
}

type Filter = 'all' | 'open' | 'ok' | 'memo';

function WordList() {
  const { data, progress, openWord } = useGame();
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
    <div className="wordlist">
      <div className="wl-tools">
        <input type="search" placeholder="さがす（文字・メモ）" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={filter} onChange={(e) => setFilter(e.target.value as Filter)} aria-label="表示">
          <option value="all">すべて</option>
          <option value="open">未確定</option>
          <option value="ok">確定済み</option>
          <option value="memo">メモあり</option>
        </select>
      </div>
      <div className="small muted">
        記録 {total} 語・確定 {confirmed} 語
      </div>
      <ul className="wl">
        {entries.map(({ e, st }) => (
          <li key={e.id} className="wl-row">
            <button type="button" className="wl-word" onClick={() => openWord(e.id)} lang={zh ? 'zh-CN' : 'en'}>
              <span className="wl-text">{e.text}</span>
              {zh && e.pinyin ? <span className="wl-pinyin">{e.pinyin}</span> : null}
            </button>
            <SpeakButton text={e.text} label="" />
            <span className="wl-meaning">
              {st.confirmed ? (
                <span className="chip chip-ok chip-small">{e.gloss}</span>
              ) : st.memo ? (
                <span className="wl-memo">{st.memo}</span>
              ) : (
                <span className="muted small">{st.seen ? `${st.seen} 回` : '棚で見た'}</span>
              )}
            </span>
          </li>
        ))}
      </ul>
      {entries.length === 0 ? <p className="muted small">まだ何もありません。</p> : null}
    </div>
  );
}

function VerificationList() {
  const { data, progress } = useGame();
  const [open, setOpen] = useState<string | null>(null);
  if (!data || !progress) return null;
  const page = data.content.verificationPages.find((p) => p.id === open);
  if (page) return <VerificationPageView page={page} onBack={() => setOpen(null)} />;
  const visible = data.content.verificationPages.filter((p) => pageWords(data, p.id).some((w) => progress.words[w.id]));
  return (
    <div className="verify-list">
      <p className="small muted">
        関係のありそうな言葉をまとめたページ。意味のカードに言葉を当てはめ、全部合っていれば意味が「確定」する。
        ページの言葉にそれぞれ何度か出会うと開ける。
      </p>
      <ul>
        {visible.map((p) => {
          const status = pageStatus(data, progress, p);
          const ready = pageReadiness(data, progress, p);
          return (
            <li key={p.id}>
              <button type="button" className={`verify-item verify-${status}`} disabled={status === 'locked'} onClick={() => setOpen(p.id)}>
                <span>{p.labelJa}</span>
                <span className="small">
                  {status === 'solved' ? '✅ 確定' : status === 'available' ? '📝 検証できる' : `🔒 準備中 ${Math.round(ready * 100)}%`}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
      {visible.length === 0 ? <p className="muted small">まだ検証できるページはありません。</p> : null}
    </div>
  );
}

function VerificationPageView({ page, onBack }: { page: VerificationPage; onBack: () => void }) {
  const { data, progress, verify, lang } = useGame();
  const words = useMemo(() => (data ? pageWords(data, page.id) : []), [data, page.id]);
  const cards = useMemo(() => shuffle(makeRng(hashString(page.id)), words), [words, page.id]);
  const order = useMemo(() => shuffle(makeRng(hashString(page.id + '#w')), words), [words, page.id]);
  const [assign, setAssign] = useState<Record<string, string | undefined>>({});
  const [msg, setMsg] = useState<'' | 'ok' | 'ng'>('');
  if (!data || !progress) return null;
  const solved = !!progress.verification[page.id]?.solved;
  const zh = lang === 'zh';
  const used = new Set(Object.values(assign));
  return (
    <div className="verify-page">
      <div className="book-nav">
        <button type="button" className="btn btn-small" onClick={onBack}>
          一覧へ
        </button>
        <strong>{page.labelJa}</strong>
        <span className="small muted">試した回数 {progress.verification[page.id]?.attempts ?? 0}</span>
      </div>
      <div className="verify-words">
        {order.map((w) => (
          <span key={w.id} className={`verify-word ${used.has(w.id) ? 'used' : ''}`} lang={zh ? 'zh-CN' : 'en'}>
            {w.text}
            {zh && w.pinyin ? <small>{w.pinyin}</small> : null}
            <SpeakButton text={w.text} label="" />
          </span>
        ))}
      </div>
      <div className="verify-cards">
        {cards.map((c) => (
          <label key={c.id} className="verify-card">
            <span className="vc-emoji" aria-hidden>
              {c.emoji ?? '・'}
            </span>
            <span className="vc-gloss">{c.gloss}</span>
            {solved ? (
              <span className="vc-answer" lang={zh ? 'zh-CN' : 'en'}>
                {c.text}
              </span>
            ) : (
              <select
                value={assign[c.id] ?? ''}
                onChange={(e) => {
                  setMsg('');
                  setAssign({ ...assign, [c.id]: e.target.value || undefined });
                }}
                lang={zh ? 'zh-CN' : 'en'}
                aria-label={`「${c.gloss}」に当てはまる言葉`}
              >
                <option value="">—</option>
                {order.map((w) => (
                  <option key={w.id} value={w.id}>
                    {w.text}
                    {zh && w.pinyin ? ` (${w.pinyin})` : ''}
                  </option>
                ))}
              </select>
            )}
          </label>
        ))}
      </div>
      {solved ? (
        msg === 'ok' ? null : <p className="ok-msg">このページの言葉はすべて確定している。</p>
      ) : (
        <>
          <button
            type="button"
            className="btn btn-primary"
            disabled={cards.some((c) => !assign[c.id])}
            onClick={() => setMsg(verify(page.id, assign) ? 'ok' : 'ng')}
          >
            この組み合わせで確かめる
          </button>
          {msg === 'ng' ? <p className="ng-msg">……どこかが違うようだ。（どれが違うかは分からない）</p> : null}
        </>
      )}
      {msg === 'ok' ? <p className="ok-msg">ぴったり合った！ これらの言葉の意味が確定した。</p> : null}
    </div>
  );
}

function Bar({ bar }: { bar: LevelBar }) {
  return (
    <div className="lbar">
      <span className="lbar-label">{bar.label}</span>
      <span className="lbar-track" role="progressbar" aria-valuenow={Math.round(bar.ratio * 100)} aria-valuemin={0} aria-valuemax={100}>
        <span className="lbar-fill" style={{ width: `${Math.max(bar.ratio * 100, bar.mastered ? 1.5 : 0)}%` }} />
      </span>
      <span className="lbar-num small">
        {bar.mastered}/{bar.target}
      </span>
    </div>
  );
}

function LevelPanel() {
  const { data, progress } = useGame();
  if (!data || !progress) return null;
  const r = levelReport(data, progress);
  const lang = data.lang;
  return (
    <div className="level">
      <div className="level-statement">
        <div className="small muted">いまの現在地（目安）</div>
        <div className="level-main">{r.statement}</div>
        <div className="small">{r.cefrStatement}</div>
      </div>
      <div className="small muted">
        身についた語 {r.masteredTotal}（確定済み＋何度か使えた語）／出会った語 {r.encounteredTotal}
      </div>
      <h4>{lang === 'en' ? '英検' : 'HSK'} の語彙目安</h4>
      {r.examBars.map((b) => (
        <Bar key={b.key} bar={b} />
      ))}
      <h4>CEFR</h4>
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
      <p className="small muted note">
        ※ これは「語彙・読む・聞く」についての大まかな目安です。話す・書く力は測っていません。
        目標語数は{lang === 'en' ? '英検の一般的な推定値' : 'HSK（旧）公式語彙表の累計語数'}を使った概算です。
      </p>
    </div>
  );
}
