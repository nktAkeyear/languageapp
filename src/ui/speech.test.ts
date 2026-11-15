import { afterEach, describe, expect, it, vi } from 'vitest';
import { pickVoice, voiceCandidates, type VoiceLike } from './speech';

const v = (name: string, lang: string, extra: Partial<VoiceLike> = {}): VoiceLike => ({ name, lang, voiceURI: `${name}-${lang}`, ...extra });

describe('voice choice (mocked voices)', () => {
  const voices = [
    v('Thomas', 'fr-FR'),
    v('Daniel', 'en-GB'),
    v('Bad News', 'en-US'),
    v('Karen', 'en-AU'),
    v('Samantha', 'en-US', { localService: true }),
    v('Sin-ji', 'zh-HK'),
    v('Mei-Jia', 'zh-TW'),
    v('Tingting', 'zh-CN'),
    v('Google 普通话', 'cmn_CN'),
  ];
  it('English: en-US first (no novelty voice), then en-GB, then other English; never another language', () => {
    expect(voiceCandidates(voices, 'en').map((x) => x.name)).toEqual(['Samantha', 'Bad News', 'Daniel', 'Karen']);
    expect(pickVoice(voices, 'en')!.name).toBe('Samantha');
    expect(pickVoice([v('Daniel', 'en-GB'), v('Karen', 'en_AU')], 'en')!.name).toBe('Daniel');
    expect(pickVoice([v('Thomas', 'fr-FR')], 'en')).toBeNull();
  });
  it('Chinese: Mandarin of the mainland first, then Taiwan; Cantonese never', () => {
    expect(voiceCandidates(voices, 'zh').map((x) => x.name)).toEqual(['Tingting', 'Google 普通话', 'Mei-Jia']);
    expect(pickVoice([v('Sin-ji', 'zh-HK'), v('Mei-Jia', 'zh-TW')], 'zh')!.name).toBe('Mei-Jia');
    expect(pickVoice([v('Sin-ji', 'zh-HK'), v('Aasing', 'yue-HK')], 'zh')).toBeNull();
  });
  it('the system default wins within a tag; the player’s choice wins when it is there and fits', () => {
    expect(pickVoice([v('A', 'en-US'), v('B', 'en-US', { default: true })], 'en')!.name).toBe('B');
    expect(pickVoice(voices, 'en', 'Daniel-en-GB')!.name).toBe('Daniel');
    // a choice that is gone, or of another language, is ignored
    expect(pickVoice(voices, 'en', 'Gone-en-US')!.name).toBe('Samantha');
    expect(pickVoice(voices, 'en', 'Tingting-zh-CN')!.name).toBe('Samantha');
  });
});

describe('voices that load asynchronously (voiceschanged)', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.resetModules();
    delete (globalThis as { window?: unknown }).window;
  });
  it('finds no voice before the list loads, the right one after voiceschanged, and speaks with it', async () => {
    vi.useFakeTimers();
    let list: VoiceLike[] = [];
    const handlers: (() => void)[] = [];
    const spoken: { text: string; voice: VoiceLike | null; lang: string }[] = [];
    (globalThis as { SpeechSynthesisUtterance?: unknown }).SpeechSynthesisUtterance = class {
      text: string;
      voice: VoiceLike | null = null;
      lang = '';
      rate = 1;
      constructor(t: string) {
        this.text = t;
      }
    };
    (globalThis as { window?: unknown }).window = {
      speechSynthesis: {
        getVoices: () => list,
        addEventListener: (_: string, f: () => void) => handlers.push(f),
        cancel: () => {},
        resume: () => {},
        speak: (u: { text: string; voice: VoiceLike | null; lang: string }) => spoken.push(u),
      },
    };
    const sp = await import('./speech');
    expect(sp.findVoice('en')).toBeNull();
    expect(sp.speak('Hello.', 'en')).toBe(false);
    list = [v('Daniel', 'en-GB'), v('Samantha', 'en-US')];
    handlers.forEach((f) => f());
    expect(sp.findVoice('en')!.name).toBe('Samantha');
    expect(sp.speak('Hello.', 'en')).toBe(true);
    expect(spoken[0].voice!.name).toBe('Samantha');
    sp.setPreferredVoices({ en: 'Daniel-en-GB' });
    expect(sp.findVoice('en')!.name).toBe('Daniel');
    sp.setPreferredVoices({});
    expect(sp.findVoice('zh')).toBeNull();
    // a specific voice for the settings' test button
    expect(sp.speak(sp.VOICE_SAMPLE.en, 'en', 1, 'Daniel-en-GB')).toBe(true);
    expect(spoken[1].voice!.name).toBe('Daniel');
  });
  it('without speechSynthesis nothing is spoken and nothing throws', async () => {
    (globalThis as { window?: unknown }).window = {};
    const sp = await import('./speech');
    expect(sp.speechSupported()).toBe(false);
    expect(sp.findVoice('en')).toBeNull();
    expect(sp.speak('Hello.', 'en')).toBe(false);
  });
});
