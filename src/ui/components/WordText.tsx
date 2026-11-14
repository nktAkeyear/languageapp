import { Fragment, useEffect, useState } from 'react';
import { plain } from '../../core/gamedata';
import { speak, useSpeechAvailable } from '../speech';
import { useGame } from '../useGame';

/**
 * Peek state shared by all WordText instances: the confirmed word whose gloss is shown after a
 * tap (touch screens have no hover). A second tap on it opens the notebook.
 */
let peekKey: string | null = null;
const peekListeners = new Set<(k: string | null) => void>();
let peekTimer: number | undefined;
function setPeek(k: string | null) {
  peekKey = k;
  peekListeners.forEach((f) => f(k));
  window.clearTimeout(peekTimer);
  if (k) peekTimer = window.setTimeout(() => setPeek(null), 2600);
}
function usePeek(): string | null {
  const [k, setK] = useState(peekKey);
  useEffect(() => {
    peekListeners.add(setK);
    return () => void peekListeners.delete(setK);
  }, []);
  return k;
}
let lastPointer: string = 'mouse';
if (typeof window !== 'undefined') window.addEventListener('pointerdown', (e) => (lastPointer = e.pointerType), { capture: true, passive: true });

let seq = 0;

/**
 * Renders target-language text with every lexicon word clickable (and pinyin ruby for zh).
 * Confirmed words (検証ページで確定) are drawn in "inked" style and show their official gloss on
 * hover, or on a first tap on touch screens.
 */
export function WordText({ text, className, interactive = true }: { text: string; className?: string; interactive?: boolean }) {
  const { data, progress, settings, openWord } = useGame();
  const peek = usePeek();
  const [inst] = useState(() => `wt${++seq}`);
  if (!data) return null;
  const tokens = data.tokens(text);
  const zh = data.lang === 'zh';
  const glued = (i: number) => {
    const n = tokens[i + 1];
    return !!n && !n.id && /^[\p{P}]+$/u.test(n.text);
  };
  return (
    <span className={`tl ${className ?? ''}`} lang={zh ? 'zh-CN' : 'en'}>
      {tokens.map((t, i) => {
        if (!t.id) return i > 0 && tokens[i - 1].id && glued(i - 1) ? null : <Fragment key={i}>{t.text}</Fragment>;
        const word = renderWord(t, i);
        return glued(i) ? (
          <span key={i} className="nw">
            {word}
            {tokens[i + 1].text}
          </span>
        ) : (
          word
        );
      })}
    </span>
  );

  function renderWord(t: (typeof tokens)[number], i: number) {
    if (!data || !t.id) return null;
    const e = data.lex.byId.get(t.id);
    const st = progress?.words[t.id];
    const confirmed = !!st?.confirmed;
    const title = confirmed ? undefined : st?.memo ? `メモ: ${st.memo}` : undefined;
    const key = `${inst}:${i}`;
    const inner =
      zh && settings.showPinyin && e?.pinyin ? (
        <ruby>
          {t.text}
          <rt>{e.pinyin}</rt>
        </ruby>
      ) : (
        t.text
      );
    const cls = `w ${confirmed ? 'w-ok' : ''} ${st?.memo ? 'w-memo' : ''} ${peek === key ? 'w-peek' : ''}`;
    if (!interactive)
      return (
        <span key={i} className={cls} data-gloss={confirmed ? e?.gloss : undefined}>
          {inner}
        </span>
      );
    return (
      <button
        key={i}
        type="button"
        className={cls}
        data-gloss={confirmed ? e?.gloss : undefined}
        title={title}
        onClick={(ev) => {
          ev.stopPropagation();
          if (confirmed && lastPointer !== 'mouse' && peekKey !== key) {
            setPeek(key);
            return;
          }
          setPeek(null);
          openWord(t.id!);
        }}
      >
        {inner}
      </button>
    );
  }
}

export function SpeakButton({ text, label = '聞く', big = false, className = '' }: { text: string; label?: string; big?: boolean; className?: string }) {
  const { lang, settings } = useGame();
  const ok = useSpeechAvailable(lang ?? 'en');
  if (!lang) return null;
  return (
    <button
      type="button"
      className={`btn speak ${big ? 'btn-big' : ''} ${className}`}
      disabled={!ok}
      title={ok ? '読み上げる' : 'この環境では音声が使えません'}
      aria-label={label || '読み上げる'}
      onClick={(e) => {
        e.stopPropagation();
        speak(plain(text), lang, settings.speechRate);
      }}
    >
      🔊{label ? <span className="speak-label">{label}</span> : null}
    </button>
  );
}
