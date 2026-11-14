/**
 * 単語帳 (notebook ribbon): the words the player starred (「気になる」) and words they wrote in by hand,
 * each with the player's own meaning, memo, state (未確認 / 推測あり / 確 / 知っているはず / 自分で追加)
 * and where it was met; search, filters, sorting; a hand-add form; a self-review round (word → own
 * meaning → 覚えた / まだ) that never shows a game-provided answer for an unconfirmed word.
 * Logic: src/core/wordbook.ts.
 */
import { useEffect, useMemo, useState } from 'react';
import type { GameData } from '../../core/gamedata';
import type { LangProgress } from '../../core/save';
import { playSeen } from '../../core/srs';
import { noteOf, reviewOrder, STATE_LABEL, wordStateKind, type WordbookEntry, type WordStateKind } from '../../core/wordbook';
import { jobsOf } from '../../jobs/engine';
import { wordJobs } from '../../jobs/vocab';
import { SpeakButton, WordText } from '../components/WordText';
import { useUi } from '../uiState';
import { useGame } from '../useGame';

type StateF = '' | WordStateKind;
type Sort = 'new' | 'old' | 'abc' | 'review';

interface Row {
  e: WordbookEntry;
  text: string;
  kind: WordStateKind;
  guess: string;
  memo: string;
  gloss: string;
  jobs: string[];
  seen: number;
}

function rowOf(data: GameData, p: LangProgress, e: WordbookEntry): Row {
  const lex = e.id ? data.lex.byId.get(e.id) : undefined;
  const note = e.id ? noteOf(p, e.id) : { guess: e.guess ?? '', memo: e.memo ?? '' };
  const kind = wordStateKind(p, e.id);
  const st = e.id ? p.words[e.id] : undefined;
  return {
    e,
    text: lex?.text ?? e.text ?? '',
    kind,
    guess: note.guess,
    memo: note.memo,
    // The official meaning only once the player has confirmed it on its 検証ページ.
    gloss: st?.confirmed && lex ? lex.gloss : '',
    jobs: e.id ? wordJobs(data, p.jobs?.wordJobs, e.id) : [],
    seen: playSeen(st),
  };
}

export function WordbookList() {
  const { data, progress, wordbook } = useGame();
  const ui = useUi();
  const [q, setQ] = useState('');
  const [stateF, setStateF] = useState<StateF>('');
  const [jobF, setJobF] = useState('');
  const [sort, setSort] = useState<Sort>('new');
  if (!data || !progress) return null;
  const zh = data.lang === 'zh';
  const jobs = jobsOf(data);
  const all = (progress.wordbook?.entries ?? []).map((e) => rowOf(data, progress, e));
  const rows = all
    .filter((r) => !stateF || r.kind === stateF || (stateF === 'open' && r.kind === 'assumed'))
    .filter((r) => !jobF || r.jobs.includes(jobF))
    .filter((r) => {
      if (!q) return true;
      return [r.text, r.guess, r.memo, r.gloss].join(' ').toLowerCase().includes(q.toLowerCase());
    })
    .sort((a, b) =>
      sort === 'old'
        ? a.e.at - b.e.at
        : sort === 'abc'
          ? a.text.localeCompare(b.text, zh ? 'zh' : 'en')
          : sort === 'review'
            ? Number(!!a.e.rev?.known) - Number(!!b.e.rev?.known) || (a.e.rev?.last ?? -1) - (b.e.rev?.last ?? -1)
            : b.e.at - a.e.at,
    );
  const toReview = all.filter((r) => !r.e.rev?.known).length;
  return (
    <div className="wb nb-words" data-testid="wordbook">
      <h2 className="page-heading">単語帳</h2>
      <p className="hand small muted">気になった言葉（単語カードの ☆）と、自分で書き入れた言葉。</p>
      <div className="wp-actions">
        <button type="button" className="btn btn-small" data-testid="wb-add" onClick={() => ui.setWb({ mode: 'add' })}>
          ＋ 自分で書き入れる
        </button>
        <button type="button" className="btn btn-small" data-testid="wb-review" disabled={!all.length} onClick={() => ui.setWb({ mode: 'review' })}>
          ふりかえる{all.length ? `（まだ ${toReview}）` : ''}
        </button>
      </div>
      <div className="wb-tools">
        <input className="pencil-input" type="search" placeholder="さがす（言葉・自分の意味・メモ）" value={q} onChange={(e) => setQ(e.target.value)} aria-label="単語帳をさがす" data-testid="wb-search" />
        <select value={stateF} onChange={(e) => setStateF(e.target.value as StateF)} aria-label="状態で絞る" data-testid="wb-state">
          <option value="">状態：すべて</option>
          <option value="open">未確認</option>
          <option value="assumed">知っているはず</option>
          <option value="guess">推測あり</option>
          <option value="confirmed">確</option>
          <option value="own">自分で追加</option>
        </select>
        {jobs.length > 1 ? (
          <select value={jobF} onChange={(e) => setJobF(e.target.value)} aria-label="仕事で絞る" data-testid="wb-job">
            <option value="">仕事：すべて</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.nameJa}
              </option>
            ))}
          </select>
        ) : null}
        <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="並べ方" data-testid="wb-sort">
          <option value="new">新しく入れた順</option>
          <option value="old">古い順</option>
          <option value="abc">ABC 順</option>
          <option value="review">ふりかえりが必要な順</option>
        </select>
      </div>
      <div className="hand small muted">
        {all.length} 語{rows.length !== all.length ? `・表示 ${rows.length} 語` : ''}
      </div>
      <ul className="wb-list">
        {rows.map((r) => (
          <li key={r.e.key} className={`wb-item ${ui.wb.key === r.e.key ? 'on' : ''}`} data-testid="wb-item">
            <button type="button" className="wb-open" onClick={() => ui.setWb({ mode: 'entry', key: r.e.key })}>
              <span className="wb-word" lang={zh ? 'zh-CN' : 'en'}>
                {r.text}
                <StateTag kind={r.kind} />
              </span>
              <span className="wb-meta">
                {r.jobs
                  .map((j) => jobs.find((x) => x.id === j)?.icon)
                  .filter(Boolean)
                  .join('')}
                {r.seen ? ` ×${r.seen}` : ''}
                {r.e.rev ? (r.e.rev.known ? ' ✓' : ' …') : ''}
              </span>
              <span className={`wb-meaning ${r.guess || r.gloss ? '' : 'empty'}`}>
                {r.gloss ? `確：${r.gloss}　` : ''}
                {r.guess ? `推：${r.guess}` : r.gloss ? '' : '（自分の意味はまだ）'}
                {r.memo ? `　メモ：${r.memo.length > 30 ? `${r.memo.slice(0, 30)}…` : r.memo}` : ''}
              </span>
            </button>
            <button
              type="button"
              className="wb-remove"
              aria-label={`${r.text} を単語帳から外す`}
              data-testid="wb-remove"
              onClick={() => {
                if (confirm(`「${r.text}」を単語帳から外しますか？${r.e.id ? '（自分の推測とメモは手帳の言葉に残ります）' : ''}`)) {
                  wordbook.remove(r.e.key);
                  if (ui.wb.key === r.e.key) ui.setWb({ mode: null });
                }
              }}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>
      {all.length === 0 ? <p className="hand muted small">まだ空っぽ。場面の言葉に触れて、単語カードの「☆ 気になる」を押すとここに入る。</p> : rows.length === 0 ? <p className="hand muted small">当てはまる言葉はない。</p> : null}
    </div>
  );
}

export function StateTag({ kind }: { kind: WordStateKind }) {
  return <span className={`st-tag st-${kind}`}>{STATE_LABEL[kind]}</span>;
}

export function WordbookRight() {
  const ui = useUi();
  if (ui.wb.mode === 'add') return <HandAdd />;
  if (ui.wb.mode === 'review') return <Review />;
  if (ui.wb.mode === 'entry' && ui.wb.key) return <EntryPage key={ui.wb.key} entryKey={ui.wb.key} />;
  return (
    <div className="nb-intro">
      <p className="hand">気になる言葉を集めておく、自分だけの単語帳。</p>
      <p className="hand muted">場面のどの言葉も、触れると単語カードが開く。「☆ 気になる」でここに入る。自分の推測（意味）とメモはカードでも、ここでも書ける。</p>
      <p className="hand muted small">ゲームにない言葉も「＋ 自分で書き入れる」で入れられる。ゲームの言葉と同じなら、その言葉につながる。</p>
      <p className="hand muted small">「ふりかえる」は自分の意味を思い出す練習。答え合わせは自分でする（ゲームの意味は、検証ページで確かめた言葉にだけ出る）。</p>
    </div>
  );
}

function EntryPage({ entryKey }: { entryKey: string }) {
  const g = useGame();
  const ui = useUi();
  const { data, progress } = g;
  const e = progress?.wordbook?.entries.find((x) => x.key === entryKey);
  const row = data && progress && e ? rowOf(data, progress, e) : null;
  const [text, setText] = useState(row?.text ?? '');
  const [guess, setGuess] = useState(row?.guess ?? '');
  const [memo, setMemo] = useState(row?.memo ?? '');
  useEffect(() => {
    setGuess(row?.guess ?? '');
    setMemo(row?.memo ?? '');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row?.guess, row?.memo]);
  if (!data || !progress || !e || !row) return <p className="hand muted">（この言葉は単語帳にありません）</p>;
  const zh = data.lang === 'zh';
  const st = e.id ? progress.words[e.id] : undefined;
  const dirty = guess.trim() !== row.guess || memo !== row.memo || (!e.id && text.trim() !== row.text);
  const save = () => {
    if (!dirty) return;
    if (e.id) g.setNote(e.id, { guess, memo });
    else g.wordbook.edit(e.key, { text, guess, memo });
  };
  return (
    <div className="wp wb" data-testid="wb-entry">
      <div className="wp-head">
        <div className="wp-word" lang={zh ? 'zh-CN' : 'en'}>
          {row.text}
        </div>
        <SpeakButton text={row.text} label="" className="speak-round" />
      </div>
      <div className="wp-status">
        <StateTag kind={row.kind} />
        {row.gloss ? (
          <span className="wp-confirmed">
            <span className="seal seal-inline">確</span>
            {row.gloss}
            <span className="wp-compare hand small">自分の推測：{row.guess ? `「${row.guess}」` : '（書いていなかった）'}</span>
          </span>
        ) : null}
        <span className="hand small muted">
          {e.id ? (row.seen ? `出会った ${row.seen} 回` : 'まだ場面で出会っていない') : 'ゲームにない言葉（自分で追加）'}・{e.hand ? '自分で書き入れた' : '気になる'}（{e.day}日目）
        </span>
      </div>
      {!e.id ? (
        <label className="wp-memo">
          <span className="hand small muted">言葉</span>
          <input className="pencil-input wcard-guess" type="text" value={text} lang={zh ? 'zh-CN' : 'en'} onChange={(x) => setText(x.target.value)} onBlur={save} />
        </label>
      ) : null}
      <label className="wp-memo">
        <span className="hand small muted">自分の推測（意味）</span>
        <input
          className="pencil-input wcard-guess"
          type="text"
          value={guess}
          maxLength={200}
          placeholder="たぶん「〜」という意味？"
          data-testid="wb-entry-guess"
          onChange={(x) => setGuess(x.target.value)}
          onBlur={save}
          onKeyDown={(x) => x.key === 'Enter' && (x.target as HTMLInputElement).blur()}
        />
      </label>
      <label className="wp-memo">
        <span className="hand small muted">メモ</span>
        <textarea value={memo} rows={3} onChange={(x) => setMemo(x.target.value)} onBlur={save} data-testid="wb-entry-memo" />
      </label>
      {dirty ? (
        <button type="button" className="btn btn-small" onClick={save}>
          書きとめる
        </button>
      ) : null}
      {st?.contexts.length ? (
        <div className="wp-contexts">
          <div className="hand small muted">見かけた文</div>
          <ul>
            {st.contexts.map((c) => (
              <li key={c}>
                <WordText text={c} highlight={e.id} />
                <SpeakButton text={c} label="" className="speak-round speak-small" />
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      {e.id && st ? (
        <div className="wp-actions">
          <button
            type="button"
            className="btn btn-small"
            onClick={() => {
              save();
              ui.setNbTab('words');
              ui.setWord(e.id!);
            }}
          >
            手帳の単語ページで開く
          </button>
        </div>
      ) : null}
    </div>
  );
}

function HandAdd() {
  const g = useGame();
  const ui = useUi();
  const zh = g.data?.lang === 'zh';
  const [text, setText] = useState('');
  const [guess, setGuess] = useState('');
  const [memo, setMemo] = useState('');
  const [msg, setMsg] = useState('');
  return (
    <form
      className="wb wb-form"
      data-testid="wb-add-form"
      onSubmit={(ev) => {
        ev.preventDefault();
        const r = g.wordbook.addHand({ text, guess, memo });
        if (!r) {
          setMsg('言葉を書いてください。');
          return;
        }
        setMsg(
          r.linked
            ? r.existed
              ? `「${text.trim()}」はもう単語帳にあります（自分の意味とメモを書き足しました）。`
              : `「${text.trim()}」はゲームに出てくる言葉なので、その言葉につなげて入れました。`
            : r.existed
              ? `「${text.trim()}」はもう単語帳にあります（書き足しました）。`
              : `「${text.trim()}」を単語帳に入れました。`,
        );
        setText('');
        setGuess('');
        setMemo('');
      }}
    >
      <h3 className="page-heading">自分で書き入れる</h3>
      <label>
        <span className="hand small muted">言葉（{zh ? '中国語' : '英語'}。ゲームにない言葉でもよい）</span>
        <input className="pencil-input" type="text" value={text} onChange={(e) => setText(e.target.value)} lang={zh ? 'zh-CN' : 'en'} autoFocus autoCapitalize="off" autoCorrect="off" spellCheck={false} data-testid="wb-add-text" />
      </label>
      <label>
        <span className="hand small muted">自分の意味</span>
        <input className="pencil-input" type="text" value={guess} maxLength={200} onChange={(e) => setGuess(e.target.value)} data-testid="wb-add-guess" />
      </label>
      <label>
        <span className="hand small muted">メモ</span>
        <textarea rows={2} value={memo} onChange={(e) => setMemo(e.target.value)} data-testid="wb-add-memo" />
      </label>
      <div className="wp-actions">
        <button type="submit" className="btn btn-primary" disabled={!text.trim()} data-testid="wb-add-submit">
          単語帳に入れる
        </button>
        <button type="button" className="btn btn-small" onClick={() => ui.setWb({ mode: null })}>
          閉じる
        </button>
      </div>
      {msg ? (
        <p className="hand small wb-msg" role="status" data-testid="wb-add-msg">
          {msg}
        </p>
      ) : null}
    </form>
  );
}

function Review() {
  const g = useGame();
  const ui = useUi();
  const { data, progress } = g;
  // The round is fixed when it starts (marking a word does not reshuffle the queue).
  const [queue] = useState<string[]>(() => reviewOrder(progress?.wordbook?.entries ?? []).map((e) => e.key));
  const [i, setI] = useState(0);
  const [shown, setShown] = useState(false);
  const [tally, setTally] = useState({ ok: 0, again: 0 });
  const entries = useMemo(() => new Map((progress?.wordbook?.entries ?? []).map((e) => [e.key, e])), [progress?.wordbook]);
  if (!data || !progress) return null;
  const zh = data.lang === 'zh';
  const keys = queue.filter((k) => entries.has(k));
  if (!keys.length) return <p className="hand muted">単語帳に言葉がありません。</p>;
  if (i >= keys.length)
    return (
      <div className="wb wb-review" data-testid="wb-review-done">
        <h3 className="page-heading">ふりかえり おしまい</h3>
        <p className="hand">
          覚えた {tally.ok}・まだ {tally.again}
        </p>
        <div className="wb-review-btns">
          <button type="button" className="btn" onClick={() => ui.setWb({ mode: null })}>
            単語帳へ
          </button>
        </div>
      </div>
    );
  const e = entries.get(keys[i])!;
  const r = rowOf(data, progress, e);
  const mark = (ok: boolean) => {
    g.wordbook.review(e.key, ok);
    setTally((t) => ({ ok: t.ok + (ok ? 1 : 0), again: t.again + (ok ? 0 : 1) }));
    setShown(false);
    setI(i + 1);
  };
  return (
    <div className="wb wb-review" data-testid="wb-review-mode">
      <h3 className="page-heading">ふりかえる</h3>
      <p className="hand small muted">
        {i + 1} / {keys.length}　意味を思い浮かべてから、めくる。
      </p>
      <div className="wb-review-card">
        <div className="wb-review-word" lang={zh ? 'zh-CN' : 'en'} data-testid="wb-review-word">
          {r.text}
        </div>
        <SpeakButton text={r.text} label="" className="speak-round" />
        <div className="wb-review-answer" data-testid="wb-review-answer">
          {shown ? (
            <>
              {r.guess ? <div className="hand">自分の意味：「{r.guess}」</div> : <div className="hand muted">（自分の意味はまだ書いていない）</div>}
              {r.memo ? <div className="hand small muted">メモ：{r.memo}</div> : null}
              {r.gloss ? (
                <div className="hand small">
                  <span className="mini-seal">確</span> {r.gloss}
                </div>
              ) : e.id ? (
                <div className="hand small muted">（まだ確かめていない言葉：検証ページで確かめよう）</div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>
      <div className="wb-review-btns">
        {!shown ? (
          <button type="button" className="btn btn-primary" onClick={() => setShown(true)} data-testid="wb-reveal">
            自分の意味を見る
          </button>
        ) : (
          <>
            <button type="button" className="btn btn-primary" onClick={() => mark(true)} data-testid="wb-known">
              覚えた
            </button>
            <button type="button" className="btn" onClick={() => mark(false)} data-testid="wb-again">
              まだ
            </button>
          </>
        )}
      </div>
    </div>
  );
}
