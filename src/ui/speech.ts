import { useEffect, useState } from 'react';
import type { Lang } from '../core/types';

/** Web Speech API wrapper. Degrades to "unavailable" when no voice for the language exists. */
const BCP47: Record<Lang, string> = { en: 'en-US', zh: 'zh-CN' };

function synth(): SpeechSynthesis | null {
  try {
    return typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
  } catch {
    return null;
  }
}

export function findVoice(lang: Lang): SpeechSynthesisVoice | null {
  const s = synth();
  if (!s) return null;
  const voices = s.getVoices();
  const want = BCP47[lang].toLowerCase();
  const prefix = want.split('-')[0];
  const norm = (v: SpeechSynthesisVoice) => v.lang.toLowerCase().replace('_', '-');
  return (
    voices.find((v) => norm(v) === want) ??
    // cmn-CN / zh-Hans-CN etc.
    voices.find((v) => norm(v).startsWith(prefix) || (lang === 'zh' && norm(v).startsWith('cmn'))) ??
    null
  );
}

export function speak(text: string, lang: Lang, rate = 0.9): boolean {
  const s = synth();
  const voice = findVoice(lang);
  if (!s || !voice) return false;
  try {
    s.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = BCP47[lang];
    try {
      u.voice = voice;
    } catch {
      /* some engines reject voices; the lang tag still selects one */
    }
    u.rate = rate;
    s.speak(u);
    return true;
  } catch (e) {
    console.warn('speech failed', e);
    return false;
  }
}

/** React hook: is a voice available for `lang`? Re-checks when the voice list loads. */
export function useSpeechAvailable(lang: Lang): boolean {
  const [ok, setOk] = useState(() => !!findVoice(lang));
  useEffect(() => {
    const s = synth();
    if (!s) return;
    const update = () => setOk(!!findVoice(lang));
    update();
    s.addEventListener?.('voiceschanged', update);
    const t = setTimeout(update, 800);
    return () => {
      s.removeEventListener?.('voiceschanged', update);
      clearTimeout(t);
    };
  }, [lang]);
  return ok;
}
