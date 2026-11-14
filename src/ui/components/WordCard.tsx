/**
 * 単語カード: one tap on any word (order, vendor, slip, story, document, job paper, notebook …)
 * opens this small card next to the word (desktop) or as a bottom sheet (phone). The player writes
 * their own guess (自分の推測) and a memo, stars the word for the 単語帳 (「気になる」), hears it, and
 * sees the sentences it was met in. Edits are saved on blur and when the card closes. The official
 * meaning appears only once the word is confirmed on its 検証ページ — then beside the player's guess.
 */
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { isStarred, noteOf, STATE_LABEL, wordStateKind } from '../../core/wordbook';
import { playSeen } from '../../core/srs';
import { jobsOf } from '../../jobs/engine';
import { wordJobs } from '../../jobs/vocab';
import { useMobile } from '../layout';
import { useUi } from '../uiState';
import { useGame } from '../useGame';
import { lastPointerType, SpeakButton, WordText } from './WordText';
import './wordbook.css';

export function WordCardHost() {
  const ui = useUi();
  if (!ui.card) return null;
  return <WordCard key={ui.card.id} id={ui.card.id} rect={ui.card.rect} />;
}

function WordCard({ id, rect }: { id: string; rect: { left: number; top: number; right: number; bottom: number } | null }) {
  const g = useGame();
  const ui = useUi();
  const mobile = useMobile();
  const { data, progress } = g;
  const note = noteOf(progress, id);
  const [guess, setGuess] = useState(note.guess);
  const [memo, setMemo] = useState(note.memo);
  const [saved, setSaved] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const guessRef = useRef<HTMLInputElement>(null);
  const [pos, setPos] = useState<{ left: number; top: number } | null>(null);
  const pending = useRef({ guess: note.guess, memo: note.memo });
  pending.current = { guess, memo };
  // What was last written to the save (a commit runs on blur, on close and when the card unmounts).
  const stored = useRef(note);

  const commit = () => {
    const p = pending.current;
    const s = stored.current;
    const patch: { guess?: string; memo?: string } = {};
    if (p.guess.trim() !== s.guess) patch.guess = p.guess;
    if (p.memo !== s.memo) patch.memo = p.memo;
    if (Object.keys(patch).length) {
      stored.current = { guess: p.guess.trim(), memo: p.memo };
      setNoteRef.current(id, patch);
      setSaved(true);
    }
  };
  const setNoteRef = useRef(g.setNote);
  setNoteRef.current = g.setNote;
  const commitRef = useRef(commit);
  commitRef.current = commit;
  useEffect(() => () => commitRef.current(), []);
  const close = () => {
    commit();
    ui.closeCard();
  };
  const closeRef = useRef(close);
  closeRef.current = close;

  // Keyboard focus in the guess field (mouse / keyboard users; on a phone the keyboard would cover
  // the card at every tap, so there the field is one more tap away).
  useEffect(() => {
    if (lastPointerType() === 'mouse' && !mobile) guessRef.current?.focus({ preventScroll: true });
  }, [mobile]);
  // Escape closes the card only (not the book under it); a tap outside closes it (saving first).
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      e.stopPropagation();
      e.preventDefault();
      closeRef.current();
    };
    const down = (e: PointerEvent) => {
      const t = e.target as Node | null;
      if (t && ref.current?.contains(t)) return;
      closeRef.current();
    };
    window.addEventListener('keydown', key, true);
    window.addEventListener('pointerdown', down, true);
    return () => {
      window.removeEventListener('keydown', key, true);
      window.removeEventListener('pointerdown', down, true);
    };
  }, []);
  // Desktop: next to the word, inside the window.
  useLayoutEffect(() => {
    if (mobile || !ref.current) return;
    const w = ref.current.offsetWidth;
    const h = ref.current.offsetHeight;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    if (!rect) {
      setPos({ left: Math.max(8, (vw - w) / 2), top: Math.max(8, (vh - h) / 2) });
      return;
    }
    let left = Math.min(Math.max(8, rect.left), vw - w - 8);
    let top = rect.bottom + 8;
    if (top + h > vh - 8) top = rect.top - h - 8;
    if (top < 8) {
      top = Math.max(8, Math.min(vh - h - 8, rect.top));
      left = rect.right + 8 + w < vw ? rect.right + 8 : Math.max(8, rect.left - w - 8);
    }
    setPos({ left, top });
  }, [mobile, rect]);

  if (!data || !progress) return null;
  const entry = data.lex.byId.get(id);
  if (!entry) return null;
  const st = progress.words[id];
  const zh = data.lang === 'zh';
  const kind = wordStateKind(progress, id);
  const starred = isStarred(progress, id);
  const jobs = jobsOf(data);
  const where = wordJobs(data, progress.jobs?.wordJobs, id)
    .map((j) => jobs.find((x) => x.id === j))
    .filter(Boolean);
  const style = mobile ? undefined : pos ? { left: pos.left, top: pos.top } : { left: -9999, top: 0 };
  return (
    <div
      ref={ref}
      className={`wcard ${mobile ? 'wcard-sheet' : 'wcard-pop'}`}
      style={style}
      role="dialog"
      aria-label={`単語カード ${entry.text}`}
      data-testid="word-card"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="wcard-head">
        <div className="wcard-word" lang={zh ? 'zh-CN' : 'en'}>
          {entry.text}
          {zh && entry.pinyin ? <span className="wcard-pinyin">{entry.pinyin}</span> : null}
        </div>
        <SpeakButton text={entry.text} label="" className="speak-round wcard-icon" />
        <button
          type="button"
          className={`wcard-star wcard-icon ${starred ? 'on' : ''}`}
          aria-pressed={starred}
          title={starred ? '単語帳から外す' : '気になる（単語帳に入れる）'}
          data-testid="star-word"
          onClick={() => g.wordbook.toggleStar(id)}
        >
          <span aria-hidden>{starred ? '★' : '☆'}</span>
          <span className="wcard-star-label">{starred ? '単語帳' : '気になる'}</span>
        </button>
        <button type="button" className="wcard-close wcard-icon" aria-label="閉じる" onClick={close} data-testid="close-word-card">
          ✕
        </button>
      </div>
      <div className={`wcard-state wcard-state-${kind}`} data-testid="word-card-state">
        {st?.confirmed ? (
          <>
            <span className="wcard-confirmed">
              <span className="mini-seal" aria-hidden>
                確
              </span>
              {entry.emoji ? `${entry.emoji} ` : ''}
              {entry.gloss}
            </span>
            <span className="wcard-compare">自分の推測：{note.guess ? `「${note.guess}」` : '（書いていなかった）'}</span>
          </>
        ) : (
          <span>
            {STATE_LABEL[kind === 'guess' ? (st?.seeded ? 'assumed' : 'open') : kind]}
            <span className="muted small">　意味は検証ページで確かめると分かる</span>
          </span>
        )}
      </div>
      <label className="wcard-field">
        <span className="hand small muted">自分の推測（意味）</span>
        <input
          ref={guessRef}
          className="pencil-input wcard-guess"
          type="text"
          value={guess}
          maxLength={200}
          placeholder="たぶん「〜」という意味？"
          enterKeyHint="done"
          data-testid="guess-input"
          onChange={(e) => {
            setGuess(e.target.value);
            setSaved(false);
          }}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              commit();
              (e.target as HTMLInputElement).blur();
            }
          }}
        />
      </label>
      <label className="wcard-field">
        <span className="hand small muted">メモ</span>
        <textarea
          className="wcard-memo"
          rows={2}
          value={memo}
          maxLength={1000}
          placeholder="どこで出てきた？何といっしょ？"
          data-testid="memo-input"
          onChange={(e) => {
            setMemo(e.target.value);
            setSaved(false);
          }}
          onBlur={commit}
        />
      </label>
      {saved ? <div className="wcard-saved hand small">書きとめた</div> : null}
      {st?.contexts.length ? (
        <div className="wcard-contexts">
          <div className="hand small muted">見かけた文（{st.contexts.length}）</div>
          <ul>
            {st.contexts.map((c) => (
              <li key={c}>
                <WordText text={c} highlight={id} />
                <SpeakButton text={c} label="" className="speak-round speak-small" />
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div className="hand small muted">まだ文の中で出会っていない言葉。</div>
      )}
      <div className="wcard-foot">
        <span className="hand small muted">
          出会った {playSeen(st)} 回
          {where.length ? `・${where.map((j) => `${j!.icon}${j!.nameJa}`).join(' ')}` : ''}
        </span>
        <button
          type="button"
          className="btn btn-small"
          data-testid="card-to-notebook"
          onClick={() => {
            commit();
            ui.closeCard();
            ui.openNotebook('words', { word: id });
          }}
        >
          手帳で開く
        </button>
      </div>
    </div>
  );
}
