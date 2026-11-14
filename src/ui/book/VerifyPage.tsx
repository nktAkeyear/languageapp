/**
 * 検証ページ: meaning cards (sketch + official gloss) are laid on the page; the player puts the
 * word slips onto them (drag, or tap a slip then tap a card). When every card has a slip the
 * stamp checks the whole page at once. Right → every card gets a seal and flips to show its
 * word + meaning; wrong → the page only says something is off.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { hashString, makeRng, shuffle } from '../../core/rng';
import type { LexEntry, VerificationPage } from '../../core/types';
import { pageWords } from '../../core/verification';
import { SpeakButton } from '../components/WordText';
import { sfx } from '../sound';
import { useGame } from '../useGame';
import { useUi } from '../uiState';

type Result = '' | 'ok' | 'ng';

export function VerifyPage({ page }: { page: VerificationPage }) {
  const { data, progress, verify, settings } = useGame();
  const ui = useUi();
  const words = useMemo(() => (data ? pageWords(data, page.id) : []), [data, page.id]);
  const cards = useMemo(() => shuffle(makeRng(hashString(page.id)), words), [words, page.id]);
  const slips = useMemo(() => shuffle(makeRng(hashString(page.id + '#w')), words), [words, page.id]);
  const [assign, setAssign] = useState<Record<string, string | undefined>>({});
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<Result>('');
  const [stamping, setStamping] = useState(false);
  const [sealed, setSealed] = useState(0);
  const [drag, setDrag] = useState<{ id: string; x: number; y: number; over: string | null } | null>(null);
  const timers = useRef<number[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  useEffect(() => {
    setAssign({});
    setPicked(null);
    setResult('');
    setSealed(0);
  }, [page.id]);
  if (!data || !progress) return null;
  const solved = !!progress.verification[page.id]?.solved;
  const zh = data.lang === 'zh';
  const placedOn = (wordId: string) => Object.keys(assign).find((c) => assign[c] === wordId);
  const trayWords = slips.filter((w) => !placedOn(w.id));
  const full = cards.every((c) => assign[c.id]);
  const showSolved = solved && (result === 'ok' ? sealed >= cards.length : true);

  const place = (cardId: string, wordId: string) => {
    setResult('');
    setAssign((a) => {
      const next = { ...a };
      for (const k of Object.keys(next)) if (next[k] === wordId) delete next[k];
      next[cardId] = wordId;
      return next;
    });
    setPicked(null);
    sfx('pickup');
  };
  const unplace = (cardId: string) => {
    setResult('');
    setAssign((a) => {
      const next = { ...a };
      delete next[cardId];
      return next;
    });
    sfx('pickup');
  };

  const check = () => {
    if (!full || stamping) return;
    setStamping(true);
    sfx('stamp');
    const delay = ui.reducedMotion ? 0 : 420;
    timers.current.push(
      window.setTimeout(() => {
        const ok = verify(page.id, assign);
        setStamping(false);
        setResult(ok ? 'ok' : 'ng');
        if (ok) {
          setSealed(0);
          cards.forEach((_c, i) =>
            timers.current.push(
              window.setTimeout(() => {
                setSealed(i + 1);
                sfx('stamp');
                if (i === cards.length - 1) timers.current.push(window.setTimeout(() => sfx('confirm'), 200));
              }, ui.reducedMotion ? 0 : 260 * (i + 1)),
            ),
          );
        } else sfx('fail');
      }, delay),
    );
  };

  // ---- drag a slip onto a card
  const startDrag = (w: LexEntry, e: React.PointerEvent) => {
    if (solved || e.button !== 0) return;
    const sx = e.clientX;
    const sy = e.clientY;
    const pid = e.pointerId;
    let started = false;
    const hit = (x: number, y: number) => {
      const el = document.elementFromPoint(x, y)?.closest('[data-card]') as HTMLElement | null;
      return el?.dataset.card ?? null;
    };
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== pid) return;
      if (!started && Math.hypot(ev.clientX - sx, ev.clientY - sy) < 8) return;
      started = true;
      setDrag({ id: w.id, x: ev.clientX, y: ev.clientY, over: hit(ev.clientX, ev.clientY) });
    };
    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== pid) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      setDrag(null);
      if (!started) return;
      const stop = (ce: MouseEvent) => {
        ce.stopPropagation();
        ce.preventDefault();
      };
      window.addEventListener('click', stop, { capture: true, once: true });
      window.setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 50);
      const c = ev.type === 'pointerup' ? hit(ev.clientX, ev.clientY) : null;
      if (c) place(c, w.id);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  const slip = (w: LexEntry, onCard?: string) => (
    <span key={w.id} className={`slip ${picked === w.id ? 'slip-picked' : ''} ${drag?.id === w.id ? 'slip-dragging' : ''}`} lang={zh ? 'zh-CN' : 'en'}>
      <button
        type="button"
        className="slip-btn"
        data-testid={`slip-${w.id}`}
        onPointerDown={(e) => startDrag(w, e)}
        onClick={(e) => {
          e.stopPropagation();
          if (onCard) unplace(onCard);
          else setPicked(picked === w.id ? null : w.id);
        }}
        aria-label={onCard ? `${w.text}（カードから外す）` : `${w.text}（手に取る）`}
        aria-pressed={picked === w.id}
      >
        <span className="slip-text">{w.text}</span>
        {zh && settings.showPinyin && w.pinyin ? <small className="slip-pinyin">{w.pinyin}</small> : null}
      </button>
      <SpeakButton text={w.text} label="" className="speak-round speak-small" />
    </span>
  );

  return (
    <div className={`verify ${result === 'ng' ? 'verify-ng' : ''} ${stamping ? 'verify-stamping' : ''}`} data-testid="verify-page">
      <div className="verify-head">
        <h3 className="page-heading">{page.labelJa}</h3>
        <span className="hand small muted">試した回数 {progress.verification[page.id]?.attempts ?? 0}</span>
      </div>
      <div className="vcards">
        {cards.map((c, i) => {
          const w = assign[c.id] ? words.find((x) => x.id === assign[c.id]) : undefined;
          const flipped = showSolved || (result === 'ok' && sealed > i);
          const over = drag?.over === c.id;
          return (
            <div
              key={c.id}
              data-card={c.id}
              className={`vcard ${flipped ? 'flipped' : ''} ${over ? 'over' : ''} ${picked && !flipped ? 'target' : ''}`}
              onClick={() => picked && !solved && place(c.id, picked)}
              role={picked && !solved ? 'button' : undefined}
              aria-label={picked && !solved ? `「${c.gloss}」のカードに置く` : undefined}
              data-testid={`card-${c.id}`}
            >
              <div className="vcard-inner">
                <div className="vcard-face vcard-front">
                  <div className="vcard-sketch" aria-hidden>
                    {c.emoji ?? '・'}
                  </div>
                  <div className="vcard-gloss">{c.gloss}</div>
                  <div className={`vcard-slot ${w ? 'filled' : ''}`}>{w ? slip(w, c.id) : <span className="slot-hint">ここに言葉</span>}</div>
                </div>
                <div className="vcard-face vcard-back">
                  <div className="vcard-sketch small" aria-hidden>
                    {c.emoji ?? '・'}
                  </div>
                  <div className="vcard-word" lang={zh ? 'zh-CN' : 'en'}>
                    {c.text}
                    {zh && c.pinyin ? <small>{c.pinyin}</small> : null}
                  </div>
                  <div className="vcard-gloss confirmed">{c.gloss}</div>
                  <span className="seal" aria-label="確定">
                    確
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {!solved ? (
        <>
          <div className="slip-tray" aria-label="言葉の紙片">
            {trayWords.map((w) => (
              slip(w)
            ))}
            {trayWords.length === 0 ? <span className="hand small muted">すべてのカードに言葉を置いた。</span> : null}
          </div>
          <div className="verify-actions">
            <button type="button" className={`stamp-btn ${full ? 'ready' : ''}`} disabled={!full || stamping} onClick={check} data-testid="verify-check">
              <span className="stamp-handle" aria-hidden />
              <span className="stamp-face">検</span>
              <span className="stamp-label">このページを確かめる</span>
            </button>
            {result === 'ng' ? (
              <p className="ng-note hand" role="status">
                ……どこかが違うようだ。（どれが違うかは分からない）
                <span className="ng-smudge" aria-hidden>
                  ？
                </span>
              </p>
            ) : null}
          </div>
        </>
      ) : result === 'ok' ? (
        <p className="ok-note hand" role="status">
          ぴったり合った！ これらの言葉の意味が確定した。
        </p>
      ) : (
        <p className="ok-note hand">このページの言葉はすべて確定している。</p>
      )}
      {drag
        ? createPortal(
            <div className="slip-ghost" style={{ left: drag.x, top: drag.y }} aria-hidden lang={zh ? 'zh-CN' : 'en'}>
              {words.find((w) => w.id === drag.id)?.text}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
