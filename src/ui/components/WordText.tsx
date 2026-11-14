import { Fragment, useRef } from 'react';
import { plain } from '../../core/gamedata';
import { storyTokens, type StoryToken } from '../../story/text';
import { speak, useSpeechAvailable } from '../speech';
import { useGame } from '../useGame';
import { setWordAnchor } from '../uiState';
import { noteOf } from '../../core/wordbook';
import { pinyinShown } from '../difficulty/assists';

/** Long press (touch) on a word label inside an object opens its card; the object's own tap is then skipped. */
let lastPointer: string = 'mouse';
if (typeof window !== 'undefined') window.addEventListener('pointerdown', (e) => (lastPointer = e.pointerType), { capture: true, passive: true });
export function lastPointerType(): string {
  return lastPointer;
}
const LONG_PRESS_MS = 480;
let suppressClickUntil = 0;
if (typeof window !== 'undefined')
  window.addEventListener(
    'click',
    (e) => {
      if (Date.now() < suppressClickUntil) {
        suppressClickUntil = 0;
        e.stopPropagation();
        e.preventDefault();
      }
    },
    { capture: true },
  );


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
  const press = useRef<{ t: number; x: number; y: number } | null>(null);
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

  function open(id: string, el: Element | null) {
    setWordAnchor(el);
    openWord(id);
  }

  function renderWord(t: StoryToken, i: number) {
    if (!data || !t.id) return null;
    const id = t.id;
    const e = data.lex.byId.get(id);
    const st = progress?.words[id];
    const confirmed = !!st?.confirmed;
    // The player's own guess (自分の推測): small text under the word, or on hover (⚙ 設定).
    const guess = !confirmed ? noteOf(progress, id).guess : '';
    const mode = settings.guessDisplay ?? 'under';
    const title = confirmed ? undefined : guess && mode !== 'off' ? `自分の推測: ${guess}` : undefined;
    const pinyin = zh && pinyinShown(settings.showPinyin, progress, id) && e?.pinyin;
    const under = !!guess && mode === 'under' && !pinyin && !glossed;
    const surface = pinyin ? (
      <ruby>
        {t.text}
        <rt>{e!.pinyin}</rt>
      </ruby>
    ) : under ? (
      <ruby className="w-guess-ruby">
        {t.text}
        <rt className="w-guess">{shortGuess(guess)}</rt>
      </ruby>
    ) : (
      t.text
    );
    const isFresh = !!fresh?.has(id) && confirmed;
    const faint = glossed && !confirmed && (!st || st.seen < 3);
    const cls = `w ${confirmed ? 'w-ok' : ''} ${guess ? 'w-memo' : ''} ${isFresh ? 'w-fresh' : ''} ${faint ? 'w-faint' : ''} ${highlight === id ? 'w-hl' : ''} ${mark?.has(id) ? 'w-mark' : ''}`;
    // In glossed text the gloss is written under the word, so no hover tooltip.
    const gloss = confirmed && !glossed ? e?.gloss : undefined;
    const inner = glossed ? (
      <>
        <span className="w-surface">{surface}</span>
        {confirmed ? <span className="w-gloss">{shortGloss(e?.gloss)}</span> : guess && mode !== 'off' ? <span className="w-gloss w-gloss-own">{shortGuess(guess)}</span> : null}
      </>
    ) : (
      surface
    );
    if (!interactive)
      // A label on an object (a jar, an envelope, a crate …): the object's own tap stays; a long
      // press (touch) or a right click opens the word card.
      return (
        <span
          key={i}
          className={`${cls} w-label`}
          data-gloss={gloss}
          title={title}
          data-word={id}
          onContextMenu={(ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            open(id, ev.currentTarget);
          }}
          onPointerDown={(ev) => {
            if (ev.pointerType === 'mouse') return;
            const el = ev.currentTarget;
            const p0 = { t: Date.now(), x: ev.clientX, y: ev.clientY };
            press.current = p0;
            // Window listeners: a drag may capture the pointer on the object around the label.
            const cancel = () => {
              if (press.current === p0) press.current = null;
              done();
            };
            const move = (m: PointerEvent) => {
              if (Math.hypot(m.clientX - p0.x, m.clientY - p0.y) > 8) cancel();
            };
            const done = () => {
              window.removeEventListener('pointermove', move, true);
              window.removeEventListener('pointerup', cancel, true);
              window.removeEventListener('pointercancel', cancel, true);
            };
            window.addEventListener('pointermove', move, true);
            window.addEventListener('pointerup', cancel, true);
            window.addEventListener('pointercancel', cancel, true);
            window.setTimeout(() => {
              if (press.current !== p0) return;
              press.current = null;
              done();
              suppressClickUntil = Date.now() + 800;
              open(id, el);
            }, LONG_PRESS_MS);
          }}
        >
          {inner}
        </span>
      );
    return (
      <button
        key={i}
        type="button"
        className={cls}
        data-gloss={gloss}
        data-word={id}
        title={title}
        aria-haspopup="dialog"
        onClick={(ev) => {
          ev.stopPropagation();
          open(id, ev.currentTarget);
        }}
      >
        {inner}
      </button>
    );
  }
}

/** The player's guess, short enough to sit under a word. */
export function shortGuess(g: string): string {
  const s = g.trim();
  return [...s].length > 8 ? `${[...s].slice(0, 7).join('')}…` : s;
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
