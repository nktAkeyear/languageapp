import { Fragment, useEffect, useState } from 'react';
import { plain } from '../../core/gamedata';
import { storyTokens, type StoryToken } from '../../story/text';
import { speak, useSpeechAvailable } from '../speech';
import { useGame } from '../useGame';
import { pinyinShown } from '../difficulty/assists';

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

/** Short form of an official gloss for under-the-word display ("ひとつの（…）" → "ひとつの"). */
export function shortGloss(g: string | undefined): string {
  return (g ?? '').split(/[（(・／]/)[0];
}

export interface WordTextProps {
  text: string;
  className?: string;
  /** false = words are not buttons (labels on objects); confirmed words still show their gloss. */
  interactive?: boolean;
  /** Story text: proper names (Ada, 梅姨 …) are shown as names, never as words. */
  story?: boolean;
  /** Documents: confirmed words show their gloss underneath; barely met words look faint. */
  glossed?: boolean;
  /** Words to mark as newly readable (confirmed since the paper was last read). */
  fresh?: ReadonlySet<string>;
  /** A word to mark wherever it occurs (the notebook's magnifying glass). */
  highlight?: string;
  /** Reveal the text word by word over this many milliseconds (a line being said). */
  reveal?: number;
  /** Words to mark as what a mistake was about (assist, src/ui/difficulty). */
  mark?: ReadonlySet<string>;
}

/**
 * Renders target-language text with every lexicon word clickable (and pinyin ruby for zh).
 * A tap opens the notebook at the word. Confirmed words (検証ページで確定) are drawn in "inked"
 * style and show their official gloss on hover, or on a first tap on touch screens.
 */
export function WordText({ text, className, interactive = true, story = false, glossed = false, fresh, highlight, reveal, mark }: WordTextProps) {
  const { data, progress, settings, openWord } = useGame();
  const peek = usePeek();
  const [inst] = useState(() => `wt${++seq}`);
  if (!data) return null;
  const tokens: StoryToken[] = story ? storyTokens(data, text) : data.tokens(text);
  const zh = data.lang === 'zh';
  const glued = (i: number) => {
    const n = tokens[i + 1];
    return !!n && !n.id && !n.name && /^[\p{P}]+$/u.test(n.text);
  };
  const step = reveal ? reveal / Math.max(1, tokens.length) : 0;
  const rv = (node: React.ReactNode, i: number) =>
    reveal && node !== null ? (
      <span key={`rv${i}`} className="w-rv" style={{ animationDelay: `${Math.round(i * step)}ms` }}>
        {node}
      </span>
    ) : (
      node
    );
  return (
    <span className={`tl ${glossed ? 'tl-glossed' : ''} ${reveal ? 'tl-reveal' : ''} ${className ?? ''}`} lang={zh ? 'zh-CN' : 'en'}>
      {tokens.map((t, i) => rv(token(t, i), i))}
    </span>
  );

  function token(t: StoryToken, i: number) {
    if (t.name)
      return (
        <span key={i} className="w-name">
          {t.text}
        </span>
      );
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
  }

  function renderWord(t: StoryToken, i: number) {
    if (!data || !t.id) return null;
    const e = data.lex.byId.get(t.id);
    const st = progress?.words[t.id];
    const confirmed = !!st?.confirmed;
    const title = confirmed ? undefined : st?.memo ? `メモ: ${st.memo}` : undefined;
    const key = `${inst}:${i}`;
    const surface =
      zh && pinyinShown(settings.showPinyin, progress, t.id) && e?.pinyin ? (
        <ruby>
          {t.text}
          <rt>{e.pinyin}</rt>
        </ruby>
      ) : (
        t.text
      );
    const isFresh = !!fresh?.has(t.id) && confirmed;
    const faint = glossed && !confirmed && (!st || st.seen < 3);
    const cls = `w ${confirmed ? 'w-ok' : ''} ${st?.memo ? 'w-memo' : ''} ${peek === key ? 'w-peek' : ''} ${isFresh ? 'w-fresh' : ''} ${faint ? 'w-faint' : ''} ${highlight === t.id ? 'w-hl' : ''} ${mark?.has(t.id) ? 'w-mark' : ''}`;
    // In glossed text the gloss is written under the word, so no hover tooltip.
    const gloss = confirmed && !glossed ? e?.gloss : undefined;
    const inner = glossed ? (
      <>
        <span className="w-surface">{surface}</span>
        {confirmed ? <span className="w-gloss">{shortGloss(e?.gloss)}</span> : null}
      </>
    ) : (
      surface
    );
    if (!interactive)
      return (
        <span key={i} className={cls} data-gloss={gloss}>
          {inner}
        </span>
      );
    return (
      <button
        key={i}
        type="button"
        className={cls}
        data-gloss={gloss}
        title={title}
        onClick={(ev) => {
          ev.stopPropagation();
          if (gloss && lastPointer !== 'mouse' && peekKey !== key) {
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
      <SpeakerGlyph />
      {label ? <span className="speak-label">{label}</span> : null}
    </button>
  );
}

/** A small drawn speaker (instead of the 🔊 emoji). */
export function SpeakerGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="speaker-glyph" aria-hidden>
      <path d="M4 9 h4 l5 -4 v14 l-5 -4 h-4 Z" fill="currentColor" />
      <path d="M16 8.5 q2.5 3.5 0 7 M18.5 6 q4.5 6 0 12" stroke="currentColor" strokeWidth="1.8" fill="none" strokeLinecap="round" />
    </svg>
  );
}
