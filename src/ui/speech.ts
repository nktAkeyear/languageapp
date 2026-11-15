import { useEffect, useState } from 'react';
import type { Lang } from '../core/types';

/**
 * Web Speech API wrapper.
 *
 * - **Voice choice** (`voiceCandidates` / `pickVoice`, pure, unit-tested with mocked voices): the player's own
 *   choice (⚙ 設定, by voiceURI) when that voice is still there; otherwise English prefers en-US, then en-GB, then
 *   other English voices, and Chinese prefers zh-CN / cmn (Mandarin, mainland), then zh-TW; Cantonese (zh-HK, yue) is
 *   never used for Mandarin. Within a tag: the system's default voice first, then voices that are not novelty
 *   voices ("Bad News", "Bells" …), then local voices.
 * - **Voices load asynchronously** in most browsers (Chrome: `getVoices()` is empty until `voiceschanged`; Safari
 *   may never fire it): the list is kept in one store, refreshed on `voiceschanged` and by a short poll, and the
 *   hooks re-render when it changes.
 * - Without `speechSynthesis` or without a voice for the language everything degrades: `speak` returns false, the
 *   listen buttons are disabled, audio-only requests are shown as text, ⚙ 設定 says why.
 */
const BCP47: Record<Lang, string> = { en: 'en-US', zh: 'zh-CN' };

/** The parts of a SpeechSynthesisVoice the choice reads (a mock in tests). */
export interface VoiceLike {
  name: string;
  lang: string;
  voiceURI: string;
  default?: boolean;
  localService?: boolean;
}

const NOVELTY = /\b(albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|deranged|hysterical|pipe organ)\b/i;

const normTag = (tag: string) => tag.toLowerCase().replace(/_/g, '-');

/** Preference of a language tag for `lang` (lower is better), or null when the voice cannot speak it. */
function tagRank(lang: Lang, tag: string): number | null {
  const t = normTag(tag);
  if (lang === 'en') {
    if (t === 'en-us') return 0;
    if (t === 'en-gb') return 1;
    if (t === 'en' || t.startsWith('en-')) return 2;
    return null;
  }
  // Mandarin: mainland first, then Taiwan; never Cantonese.
  if (/^(zh-hk|zh-mo|yue)/.test(t) || t.includes('yue')) return null;
  if (t === 'zh-cn' || t === 'cmn-cn' || t === 'cmn-hans-cn' || t === 'zh-hans-cn' || t === 'zh-hans') return 0;
  if (t === 'cmn' || t.startsWith('cmn-')) return 1;
  if (t === 'zh' || t === 'zh-sg') return 2;
  if (t === 'zh-tw' || t.startsWith('zh-hant') || t.startsWith('zh-')) return 3;
  return null;
}

/** The voices that can read `lang`, best first. */
export function voiceCandidates<V extends VoiceLike>(voices: readonly V[], lang: Lang): V[] {
  const scored = voices
    .map((v, i) => ({ v, i, r: tagRank(lang, v.lang) }))
    .filter((x): x is { v: V; i: number; r: number } => x.r !== null);
  scored.sort((a, b) => a.r - b.r || Number(!!b.v.default) - Number(!!a.v.default) || Number(NOVELTY.test(a.v.name)) - Number(NOVELTY.test(b.v.name)) || Number(!!b.v.localService) - Number(!!a.v.localService) || a.i - b.i);
  return scored.map((x) => x.v);
}

/** The voice to use: the player's choice (by voiceURI) when it is there and fits the language, else the best one. */
export function pickVoice<V extends VoiceLike>(voices: readonly V[], lang: Lang, preferred?: string | null): V | null {
  const cands = voiceCandidates(voices, lang);
  if (preferred) {
    const own = cands.find((v) => v.voiceURI === preferred);
    if (own) return own;
  }
  return cands[0] ?? null;
}

function synth(): SpeechSynthesis | null {
  try {
    return typeof window !== 'undefined' && 'speechSynthesis' in window && window.speechSynthesis ? window.speechSynthesis : null;
  } catch {
    return null;
  }
}

/** Is the Web Speech API there at all (independent of voices)? */
export function speechSupported(): boolean {
  return !!synth();
}

// ---------------------------------------------------------------------------- the voice list (async)

let voiceList: SpeechSynthesisVoice[] = [];
let loaded = false;
let watching = false;
const voiceListeners = new Set<() => void>();

function refreshVoices(): void {
  const s = synth();
  if (!s) return;
  let v: SpeechSynthesisVoice[] = [];
  try {
    v = s.getVoices() ?? [];
  } catch {
    v = [];
  }
  const changed = v.length !== voiceList.length || v.some((x, i) => x.voiceURI !== voiceList[i]?.voiceURI);
  voiceList = v;
  if (v.length) loaded = true;
  if (changed) voiceListeners.forEach((f) => f());
}

/** Start watching the voice list (once): `voiceschanged`, plus a short poll for engines that never fire it. */
function watchVoices(): void {
  if (watching) return;
  const s = synth();
  if (!s) return;
  watching = true;
  refreshVoices();
  try {
    s.addEventListener?.('voiceschanged', refreshVoices);
  } catch {
    /* old engines: the poll below still finds the voices */
  }
  let n = 0;
  const poll = () => {
    refreshVoices();
    if (!loaded && ++n < 12) setTimeout(poll, 250);
    else if (!loaded) {
      loaded = true; // gave up waiting: "no voice" from now on (the event may still bring them)
      voiceListeners.forEach((f) => f());
    }
  };
  setTimeout(poll, 250);
}

/** The player's chosen voice per language (⚙ 設定), applied by the shell. */
const preferredVoice: Partial<Record<Lang, string>> = {};
export function setPreferredVoices(v: Partial<Record<Lang, string | undefined>> | undefined): void {
  for (const l of ['en', 'zh'] as Lang[]) {
    const uri = v?.[l];
    if (uri) preferredVoice[l] = uri;
    else delete preferredVoice[l];
  }
}

export function findVoice(lang: Lang): SpeechSynthesisVoice | null {
  if (!synth()) return null;
  watchVoices();
  if (!voiceList.length) refreshVoices();
  return pickVoice(voiceList, lang, preferredVoice[lang]);
}

// Who is speaking right now (so a drawn character can move its mouth while its line is read out).
let speakingText: string | null = null;
const speakingListeners = new Set<(t: string | null) => void>();
function setSpeaking(t: string | null) {
  speakingText = t;
  speakingListeners.forEach((f) => f(t));
}

/** React hook: the text being read out by speech synthesis now (null = silence). */
export function useSpeaking(): string | null {
  const [t, setT] = useState(speakingText);
  useEffect(() => {
    speakingListeners.add(setT);
    return () => void speakingListeners.delete(setT);
  }, []);
  return t;
}

/** Multiplier on every speech rate (assist 「ゆっくり話す」, set by src/ui/difficulty). */
let rateFactor = 1;
export function setSpeechRateFactor(f: number): void {
  rateFactor = f > 0 ? f : 1;
}

/** Read `text` aloud. `voiceURI`: a specific voice (the settings' test button); otherwise the chosen / best one. */
export function speak(text: string, lang: Lang, rate = 0.9, voiceURI?: string | null): boolean {
  const s = synth();
  if (!s) return false;
  watchVoices();
  const voice = voiceURI ? pickVoice(voiceList, lang, voiceURI) : findVoice(lang);
  if (!voice) return false;
  try {
    s.cancel();
    // Chrome pauses a long queue now and then; a resume after cancel keeps the engine awake.
    try {
      s.resume?.();
    } catch {
      /* not supported */
    }
    const u = new SpeechSynthesisUtterance(text);
    u.lang = voice.lang || BCP47[lang];
    try {
      u.voice = voice;
    } catch {
      /* some engines reject voices; the lang tag still selects one */
    }
    u.rate = Math.min(2, Math.max(0.3, rate * rateFactor));
    u.onstart = () => setSpeaking(text);
    u.onend = u.onerror = () => {
      if (speakingText === text) setSpeaking(null);
    };
    s.speak(u);
    return true;
  } catch (e) {
    console.warn('speech failed', e);
    return false;
  }
}

/** A short sample in the language for the settings' 「声を試す」 button. */
export const VOICE_SAMPLE: Record<Lang, string> = { en: 'Good morning! Welcome to the harbour town.', zh: '早上好！欢迎来到港口小镇。' };

export interface VoiceState {
  /** speechSynthesis exists in this browser. */
  supported: boolean;
  /** The voice list has been read (or waiting for it was given up). */
  loaded: boolean;
  /** The voices that can read the language, best first. */
  voices: SpeechSynthesisVoice[];
  /** The voice that will be used (the player's choice or the best one). */
  voice: SpeechSynthesisVoice | null;
}

function voiceState(lang: Lang): VoiceState {
  const supported = !!synth();
  return { supported, loaded: loaded || !supported, voices: voiceCandidates(voiceList, lang), voice: supported ? pickVoice(voiceList, lang, preferredVoice[lang]) : null };
}

/** React hook: the voices for `lang`, re-read when the list loads (voiceschanged) or the choice changes. */
export function useVoices(lang: Lang, preferred?: string | null): VoiceState {
  const [, bump] = useState(0);
  useEffect(() => {
    const f = () => bump((n) => n + 1);
    voiceListeners.add(f);
    watchVoices();
    refreshVoices();
    return () => void voiceListeners.delete(f);
  }, [lang]);
  void preferred;
  return voiceState(lang);
}

/** React hook: is a voice available for `lang`? Re-checks when the voice list loads. */
export function useSpeechAvailable(lang: Lang): boolean {
  return !!useVoices(lang).voice;
}
