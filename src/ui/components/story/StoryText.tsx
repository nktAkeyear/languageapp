import { Fragment } from 'react';
import { plain } from '../../../core/gamedata';
import { storyTokens } from '../../../story/text';
import { speak, useSpeechAvailable } from '../../speech';
import { useGame } from '../../useGame';

/** Short form of an official gloss for under-the-word display ("ひとつの（…）" → "ひとつの"). */
export function shortGloss(g: string | undefined): string {
  return (g ?? '').split(/[（(・／]/)[0];
}

/**
 * Story text in the target language. Every lexicon word is clickable (word detail); names are
 * plain. With `glossed`, words whose meaning is 確定 show their gloss underneath, and words never
 * met before look faint — so re-reading an old document visibly reveals more.
 */
export function StoryText({ text, glossed = false, className }: { text: string; glossed?: boolean; className?: string }) {
  const { data, progress, settings, openWord } = useGame();
  if (!data) return null;
  const zh = data.lang === 'zh';
  return (
    <span className={`st-text ${glossed ? 'st-glossed' : ''} ${className ?? ''}`} lang={zh ? 'zh-CN' : 'en'}>
      {storyTokens(data, text).map((t, i) => {
        if (t.name) return <span key={i} className="st-name">{t.text}</span>;
        if (!t.id) return <Fragment key={i}>{t.text}</Fragment>;
        const e = data.lex.byId.get(t.id);
        const st = progress?.words[t.id];
        const ok = !!st?.confirmed;
        // Barely met (fewer than 3 encounters) words look faint in documents.
        const unseen = !st || st.seen < 3;
        const surface =
          zh && settings.showPinyin && e?.pinyin ? (
            <ruby>
              {t.text}
              <rt>{e.pinyin}</rt>
            </ruby>
          ) : (
            t.text
          );
        return (
          <button
            key={i}
            type="button"
            className={`st-w ${ok ? 'st-ok' : ''} ${unseen ? 'st-unseen' : ''}`}
            title={ok ? e?.gloss : undefined}
            onClick={(ev) => {
              ev.stopPropagation();
              openWord(t.id!);
            }}
          >
            <span className="st-surface">{surface}</span>
            {glossed && ok ? <span className="st-gloss">{shortGloss(e?.gloss)}</span> : null}
          </button>
        );
      })}
    </span>
  );
}

export function StorySpeak({ text }: { text: string }) {
  const { lang, settings, data } = useGame();
  const ok = useSpeechAvailable(lang ?? 'en');
  if (!lang || !data) return null;
  return (
    <button
      type="button"
      className="st-btn st-speak"
      disabled={!ok}
      title={ok ? '読み上げる' : 'この環境では音声が使えません'}
      onClick={(e) => {
        e.stopPropagation();
        speak(plain(text), lang, settings.speechRate);
      }}
    >
      🔊
    </button>
  );
}
