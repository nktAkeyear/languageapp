/**
 * The notebook (帳面): ONE book. Its tabs: 言葉 (every word met, with the player's own meaning; a word's page),
 * 単語帳 (starred and hand-written words), 検証 (the verification pages: the only way to confirm a meaning) and
 * 記録 (progress). Desktop: a side panel (the request stays visible beside it). Phone: a bottom sheet that leaves
 * the request card visible above it.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { hashString } from '../../core/rng';
import { playSeen } from '../../core/srs';
import { pageReadiness, pageStatus, pageWords, submitVerification } from '../../core/verification';
import { addHandEntry, isStarred, noteOf, removeEntry, setWordNote, STATE_LABEL, toggleStar, wordStateKind } from '../../core/wordbook';
import { levelReport } from '../../core/levels';
import { jobsOf, rankName } from '../../jobs/engine';
import { Icon, ListenButton, Words } from './bits';
import { rankOf } from './frame';
import { useGame, useS } from './store';

const TABS = [
  ['words', '言葉'],
  ['book', '単語帳'],
  ['verify', '検証'],
  ['record', '記録'],
] as const;

export function Notebook() {
  const { nb, setNb, layout } = useGame();
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    const esc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) setNb({ open: false });
    };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [setNb]);
  return (
    <aside className={`notebook notebook-${layout}`} ref={panel} aria-label="帳面">
      <header className="nb-head">
        <nav className="nb-tabs" role="tablist">
          {TABS.map(([id, label]) => (
            <button key={id} role="tab" aria-selected={nb.tab === id} className={nb.tab === id ? 'on' : ''} onClick={() => setNb({ tab: id, word: null, page: null })}>
              {label}
            </button>
          ))}
        </nav>
        <button className="icon-btn" aria-label="帳面を閉じる" onClick={() => setNb({ open: false })}>
          <Icon name="close" />
        </button>
      </header>
      <div className="nb-body">
        {nb.tab === 'words' && nb.word ? <WordPage id={nb.word} /> : null}
        {nb.tab === 'words' && !nb.word ? <WordList /> : null}
        {nb.tab === 'book' ? <WordBook /> : null}
        {nb.tab === 'verify' && nb.page ? <VerifyPage id={nb.page} /> : null}
        {nb.tab === 'verify' && !nb.page ? <VerifyList /> : null}
        {nb.tab === 'record' ? <Record /> : null}
      </div>
    </aside>
  );
}

function WordPage({ id }: { id: string }) {
  const s = useS();
  const { data, act, setNb, layout } = useGame();
  const e = data.lex.byId.get(id);
  const w = s.p.words[id];
  const note = noteOf(s.p, id);
  const [guess, setGuess] = useState(note.guess);
  const [memo, setMemo] = useState(note.memo);
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setGuess(noteOf(s.p, id).guess);
    setMemo(noteOf(s.p, id).memo);
    if (layout === 'desk') input.current?.focus();
  }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const save = () => {
    const cur = noteOf(s.p, id);
    if (cur.guess === guess.trim() && cur.memo === memo) return;
    act((st) => setWordNote(st.p, id, { guess, memo }));
  };
  // Save when the page is left (another word opened, the book closed).
  const latest = useRef({ guess, memo });
  latest.current = { guess, memo };
  useEffect(
    () => () => {
      const cur = noteOf(s.p, id);
      if (cur.guess !== latest.current.guess.trim() || cur.memo !== latest.current.memo) act((st) => setWordNote(st.p, id, latest.current));
    },
    [id], // eslint-disable-line react-hooks/exhaustive-deps
  );
  if (!e) return null;
  const kind = wordStateKind(s.p, id);
  const starred = isStarred(s.p, id);
  const jobs = s.p.jobs?.wordJobs[id] ?? [];
  return (
    <div className="word-page">
      <button className="btn-quiet nb-back" onClick={() => { save(); setNb({ word: null }); }}>
        <Icon name="back" size={18} /> 言葉の一覧
      </button>
      <div className="wp-head">
        <h3 lang="en">{e.text}</h3>
        <ListenButton text={e.text} />
        <button className={`btn-quiet star ${starred ? 'on' : ''}`} aria-pressed={starred} onClick={() => act((st) => toggleStar(st.p, id))}>
          <Icon name={starred ? 'starOn' : 'star'} /> {starred ? '単語帳にある' : '単語帳に入れる'}
        </button>
      </div>
      <p className="wp-state ja-label">{STATE_LABEL[kind]}</p>
      <label className="field">
        <span className="ja-label">自分の意味（推測）</span>
        <input
          ref={input}
          value={guess}
          maxLength={60}
          placeholder="この言葉の意味を自分で書く"
          onChange={(ev) => setGuess(ev.target.value)}
          onBlur={save}
          onKeyDown={(ev) => ev.key === 'Enter' && (save(), (ev.target as HTMLInputElement).blur())}
        />
      </label>
      {w?.confirmed ? (
        <p className="wp-gloss">
          <span className="ja-label">確かめた意味</span> <b>{e.gloss}</b>
        </p>
      ) : null}
      <label className="field">
        <span className="ja-label">メモ</span>
        <textarea value={memo} rows={2} onChange={(ev) => setMemo(ev.target.value)} onBlur={save} />
      </label>
      {w?.contexts.length ? (
        <div className="wp-ctx">
          <span className="ja-label">出会った文</span>
          <ul>
            {w.contexts.map((c) => (
              <li key={c}>
                <Words text={c} />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="ja-label wp-meta">
        出会った回数 {playSeen(w)}
        {jobs.length ? `・${jobs.map((j) => (j === 'clinic' ? '診療所' : j === 'teahouse' ? '茶房' : j)).join('、')}` : ''}
      </p>
    </div>
  );
}

function WordList() {
  const s = useS();
  const { data, setNb } = useGame();
  const [q, setQ] = useState('');
  const rows = useMemo(() => {
    const out: { id: string; text: string; guess: string; kind: string; last: number }[] = [];
    for (const [id, w] of Object.entries(s.p.words)) {
      const e = data.lex.byId.get(id);
      if (!e) continue;
      const g = noteOf(s.p, id).guess;
      if (playSeen(w) <= 0 && !g) continue;
      out.push({ id, text: e.text, guess: g, kind: STATE_LABEL[wordStateKind(s.p, id)], last: w.lastDay });
    }
    out.sort((a, b) => b.last - a.last || a.text.localeCompare(b.text));
    return out;
  }, [s.p, s.p.words, data]); // eslint-disable-line react-hooks/exhaustive-deps
  const k = q.trim().toLowerCase();
  const shown = k ? rows.filter((r) => r.text.toLowerCase().includes(k) || r.guess.includes(q.trim())) : rows;
  return (
    <div className="word-list">
      <label className="field search">
        <span className="ja-label">さがす（言葉・自分の意味）</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="例: mint / 薄荷" />
      </label>
      <p className="ja-label">出会った言葉 {rows.length}・自分の意味あり {rows.filter((r) => r.guess).length}</p>
      <ul className="wl">
        {shown.slice(0, 300).map((r) => (
          <li key={r.id}>
            <button onClick={() => setNb({ word: r.id })}>
              <span className="wl-t" lang="en">{r.text}</span>
              <span className={`wl-g ${r.guess ? '' : 'none'}`}>{r.guess || r.kind}</span>
            </button>
          </li>
        ))}
      </ul>
      {!rows.length ? <p className="empty">まだ言葉に出会っていません。お客さんの言葉や張り紙の言葉をタップすると、ここに自分の意味を書けます。</p> : null}
    </div>
  );
}

function WordBook() {
  const s = useS();
  const { data, act, setNb } = useGame();
  const [text, setText] = useState('');
  const [guess, setGuess] = useState('');
  const entries = s.p.wordbook?.entries ?? [];
  const add = () => {
    if (!text.trim()) return;
    act((st, c) => addHandEntry(c.data, st.p, { text, guess }));
    setText('');
    setGuess('');
  };
  return (
    <div className="wordbook">
      <form className="wb-add" onSubmit={(e) => { e.preventDefault(); add(); }}>
        <span className="ja-label">自分で書き入れる</span>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="言葉 (英語)" lang="en" aria-label="言葉" />
        <input value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="自分の意味" aria-label="自分の意味" />
        <button className="btn-secondary" disabled={!text.trim()}>
          <Icon name="pen" size={18} /> 書き入れる
        </button>
      </form>
      <ul className="wl">
        {entries.map((e) => {
          const t = e.id ? data.lex.byId.get(e.id)?.text ?? e.text : e.text;
          const g = e.id ? noteOf(s.p, e.id).guess : e.guess;
          return (
            <li key={e.key} className="wb-row">
              <button disabled={!e.id || !s.p.words[e.id]} onClick={() => e.id && setNb({ tab: 'words', word: e.id })}>
                <span className="wl-t" lang="en">{t}</span>
                <span className={`wl-g ${g ? '' : 'none'}`}>{g || (e.hand ? '自分で追加' : STATE_LABEL[wordStateKind(s.p, e.id)])}</span>
              </button>
              <button className="icon-btn" aria-label={`${t} を単語帳から外す`} onClick={() => act((st) => removeEntry(st.p, e.key))}>
                <Icon name="close" size={18} />
              </button>
            </li>
          );
        })}
      </ul>
      {!entries.length ? <p className="empty">言葉のページの「単語帳に入れる」か、上の欄で、気になる言葉を集められます。</p> : null}
    </div>
  );
}

function VerifyList() {
  const s = useS();
  const { data, setNb } = useGame();
  const pages = data.content.verificationPages
    .map((pg) => ({ pg, st: pageStatus(data, s.p, pg), ready: pageReadiness(data, s.p, pg) }))
    .filter((x) => x.st !== 'locked' || x.ready > 0);
  const order = { available: 0, locked: 1, solved: 2 } as const;
  pages.sort((a, b) => order[a.st] - order[b.st] || b.ready - a.ready);
  return (
    <div className="verify-list">
      <p className="ja-label">言葉の意味を確かめるページ。どのページも、そこに並ぶ言葉に何度か出会うと開く。</p>
      <ul className="vl">
        {pages.slice(0, 120).map(({ pg, st, ready }) => (
          <li key={pg.id}>
            <button disabled={st !== 'available'} onClick={() => setNb({ page: pg.id })} className={`vl-${st}`}>
              <span>{pg.labelJa}</span>
              <span className="vl-st">{st === 'available' ? '確かめられる' : st === 'solved' ? '確定' : `出会い ${Math.round(ready * 100)}%`}</span>
            </button>
          </li>
        ))}
      </ul>
      {!pages.length ? <p className="empty">まだ開いたページはありません。</p> : null}
    </div>
  );
}

function VerifyPage({ id }: { id: string }) {
  const s = useS();
  const { data, act, setNb } = useGame();
  const page = data.content.verificationPages.find((p) => p.id === id)!;
  const words = pageWords(data, id);
  const cards = useMemo(() => [...words].sort((a, b) => hashString(a.id + id) - hashString(b.id + id)), [id]); // eslint-disable-line react-hooks/exhaustive-deps
  const [pick, setPick] = useState<string | null>(null);
  const [assign, setAssign] = useState<Record<string, string>>({}); // card id → word id
  const [said, setSaid] = useState<string | null>(null);
  const solved = !!s.p.verification[id]?.solved;
  const wordOnCard = (cardId: string) => assign[cardId];
  const cardOfWord = (wordId: string) => Object.keys(assign).find((c) => assign[c] === wordId);
  const place = (cardId: string) => {
    if (!pick) {
      if (assign[cardId]) {
        const next = { ...assign };
        delete next[cardId];
        setAssign(next);
      }
      return;
    }
    const next = { ...assign };
    for (const c of Object.keys(next)) if (next[c] === pick) delete next[c];
    next[cardId] = pick;
    setAssign(next);
    setPick(null);
    setSaid(null);
  };
  const full = words.every((w) => cardOfWord(w.id));
  const test = () => {
    const ok = act((st, c) => submitVerification(c.data, st.p, id, assign));
    setSaid(ok ? '確定した。この言葉たちの意味は、これで確か。' : 'この組み合わせでは、まだ確かめられない。');
  };
  return (
    <div className="verify-page">
      <button className="btn-quiet nb-back" onClick={() => setNb({ page: null })}>
        <Icon name="back" size={18} /> ページの一覧
      </button>
      <h3>{page.labelJa}</h3>
      <p className="ja-label">言葉を選んでから、合うと思う意味のカードを選ぶ。全部置いたら、はんこで確かめる。</p>
      <div className="vp-words">
        {words.map((w) => {
          const placed = !!cardOfWord(w.id);
          return (
            <button key={w.id} lang="en" className={`slip ${pick === w.id ? 'picked' : ''} ${placed ? 'placed' : ''}`} onClick={() => setPick(pick === w.id ? null : w.id)} disabled={solved}>
              {w.text}
              {noteOf(s.p, w.id).guess ? <span className="slip-g">{noteOf(s.p, w.id).guess}</span> : null}
            </button>
          );
        })}
      </div>
      <div className="vp-cards">
        {cards.map((c) => {
          const on = wordOnCard(c.id);
          return (
            <button key={c.id} className={`mcard ${on ? 'has' : ''} ${solved ? 'sealed' : ''}`} onClick={() => place(c.id)} disabled={solved}>
              <span className="mc-pic" aria-hidden>{c.emoji ?? ''}</span>
              <span className="mc-gloss">{c.gloss}</span>
              <span className="mc-word" lang="en">{solved ? c.text : on ? data.lex.byId.get(on)?.text : '　'}</span>
            </button>
          );
        })}
      </div>
      {!solved ? (
        <button className="btn-primary stamp" disabled={!full} onClick={test}>
          <Icon name="stamp" /> 推測を確かめる
        </button>
      ) : null}
      {said ? <p className="vp-said" role="status">{said}</p> : solved ? <p className="vp-said">確定したページ。</p> : null}
    </div>
  );
}

function Record() {
  const s = useS();
  const { data } = useGame();
  const met = Object.values(s.p.words).filter((w) => playSeen(w) > 0).length;
  const guesses = Object.values(s.p.words).filter((w) => w.guess).length;
  const conf = Object.values(s.p.words).filter((w) => w.confirmed).length;
  const solved = Object.values(s.p.verification).filter((v) => v.solved).length;
  const rep = levelReport(data, s.p);
  const jobs = jobsOf(data);
  return (
    <div className="record">
      <dl className="rec-grid">
        <dt>始めたレベル</dt>
        <dd>{s.startLabel}</dd>
        <dt>出会った言葉</dt>
        <dd>{met}</dd>
        <dt>自分の意味を書いた</dt>
        <dd>{guesses}</dd>
        <dt>確かめた言葉</dt>
        <dd>{conf}</dd>
        <dt>確定したページ</dt>
        <dd>{solved}</dd>
      </dl>
      <h4>仕事の位</h4>
      <ul className="rec-jobs">
        {jobs
          .filter((j) => j.id === 'teahouse' || j.id === 'clinic')
          .map((j) => (
            <li key={j.id}>
              {j.nameJa}：{rankName(rankOf(s, j.id))}
            </li>
          ))}
      </ul>
      <h4>英検の目安（確かめて使えている言葉）</h4>
      <p className="ja-label">{rep.statement}</p>
      <ul className="bars">
        {rep.examBars.map((b) => (
          <li key={b.key}>
            <span>{b.label}</span>
            <span className="bar" aria-hidden>
              <i style={{ transform: `scaleX(${Math.min(1, b.ratio)})` }} />
            </span>
            <span className="ja-label">
              {b.mastered}/{b.target}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
