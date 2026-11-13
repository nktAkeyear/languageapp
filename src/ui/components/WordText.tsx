import { Fragment } from 'react';
import { plain } from '../../core/gamedata';
import { speak, useSpeechAvailable } from '../speech';
import { useGame } from '../useGame';

/** Renders target-language text with every lexicon word clickable (and pinyin ruby for zh). */
export function WordText({ text, className, interactive = true }: { text: string; className?: string; interactive?: boolean }) {
  const { data, progress, settings, openWord } = useGame();
  if (!data) return null;
  const tokens = data.tokens(text);
  const zh = data.lang === 'zh';
  return (
    <span className={`tl ${className ?? ''}`} lang={zh ? 'zh-CN' : 'en'}>
      {tokens.map((t, i) => {
        if (!t.id) return <Fragment key={i}>{t.text}</Fragment>;
        const e = data.lex.byId.get(t.id);
        const st = progress?.words[t.id];
        const confirmed = !!st?.confirmed;
        const title = confirmed ? e?.gloss : st?.memo ? `メモ: ${st.memo}` : undefined;
        const inner =
          zh && settings.showPinyin && e?.pinyin ? (
            <ruby>
              {t.text}
              <rt>{e.pinyin}</rt>
            </ruby>
          ) : (
            t.text
          );
        if (!interactive) return <span key={i} className={`w ${confirmed ? 'w-ok' : ''}`}>{inner}</span>;
        return (
          <button
            key={i}
            type="button"
            className={`w ${confirmed ? 'w-ok' : ''} ${st?.memo ? 'w-memo' : ''}`}
            data-gloss={confirmed ? e?.gloss : undefined}
            title={title}
            onClick={(ev) => {
              ev.stopPropagation();
              openWord(t.id!);
            }}
          >
            {inner}
          </button>
        );
      })}
    </span>
  );
}

export function SpeakButton({ text, label = '聞く', big = false }: { text: string; label?: string; big?: boolean }) {
  const { lang, settings } = useGame();
  const ok = useSpeechAvailable(lang ?? 'en');
  if (!lang) return null;
  return (
    <button
      type="button"
      className={`btn speak ${big ? 'btn-big' : ''}`}
      disabled={!ok}
      title={ok ? '読み上げる' : 'この環境では音声が使えません'}
      onClick={(e) => {
        e.stopPropagation();
        speak(plain(text), lang, settings.speechRate);
      }}
    >
      🔊{label ? <span className="speak-label">{label}</span> : null}
    </button>
  );
}
