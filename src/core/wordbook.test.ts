import { describe, expect, it } from 'vitest';
import { CONTENT, SHARED } from '../content';
import { buildGameData } from './gamedata';
import { exportSave, importSave, migrateSave, newProgress, SAVE_VERSION, emptySave } from './save';
import { recordEncounter } from './srs';
import { applyStartLevel, repairAssumed, wordsUpTo } from './difficulty';
import { ensureTownDay } from '../activities/day';
import { makeRng } from './rng';
import { addHandEntry, editEntry, isStarred, markReview, matchLexicon, noteOf, removeEntry, reviewOrder, setWordNote, toggleStar, wordStateKind } from './wordbook';

const en = buildGameData(CONTENT.en, SHARED);

describe('word notes and the 単語帳', () => {
  it('guess and memo live on the word; the state follows confirmation / guess / start level', () => {
    const p = newProgress('en');
    recordEncounter(p.words, ['lemon'], 1, 'A lemon tea, please.');
    expect(wordStateKind(p, 'lemon')).toBe('open');
    setWordNote(p, 'lemon', { guess: '  レモン？ ', memo: '黄色い' });
    expect(noteOf(p, 'lemon')).toEqual({ guess: 'レモン？', memo: '黄色い' });
    expect(wordStateKind(p, 'lemon')).toBe('guess');
    p.words.lemon.confirmed = true;
    expect(wordStateKind(p, 'lemon')).toBe('confirmed');
    expect(wordStateKind(p, undefined)).toBe('own');
  });

  it('stars a word and takes it out again; notes kept on an entry move onto the word', () => {
    const p = newProgress('en');
    recordEncounter(p.words, ['honey'], 1, 'Honey, please.');
    expect(toggleStar(p, 'honey', 10)).toBe(true);
    expect(isStarred(p, 'honey')).toBe(true);
    expect(toggleStar(p, 'honey', 11)).toBe(false);
    expect(isStarred(p, 'honey')).toBe(false);
    expect(p.wordbook?.entries).toEqual([]);
  });

  it('hand-added words: linked to a lexicon word when it matches (no duplicate), else kept as written', () => {
    const p = newProgress('en');
    expect(matchLexicon(en, ' Lemon ')).toBe('lemon');
    const a = addHandEntry(en, p, { text: 'Lemon', guess: 'レモン' }, 1)!;
    expect(a).toMatchObject({ linked: true, existed: false });
    expect(a.entry.id).toBe('lemon');
    // Not met yet: the note stays on the entry, the notebook's word list is not touched.
    expect(p.words.lemon).toBeUndefined();
    expect(noteOf(p, 'lemon').guess).toBe('レモン');
    const again = addHandEntry(en, p, { text: 'lemon', memo: 'すっぱい' }, 2)!;
    expect(again).toMatchObject({ linked: true, existed: true });
    expect(p.wordbook!.entries.filter((e) => e.id === 'lemon')).toHaveLength(1);
    expect(noteOf(p, 'lemon')).toEqual({ guess: 'レモン', memo: 'すっぱい' });
    // Once met, an edit moves the notes onto the word.
    recordEncounter(p.words, ['lemon'], 3, 'Lemon tea.');
    setWordNote(p, 'lemon', { guess: 'レモン！' });
    expect(p.words.lemon).toMatchObject({ guess: 'レモン！', memo: 'すっぱい' });
    expect(p.wordbook!.entries[0].guess).toBeUndefined();
    // A word the game does not have.
    const own = addHandEntry(en, p, { text: 'serendipity', guess: '偶然の幸運' }, 4)!;
    expect(own).toMatchObject({ linked: false, existed: false });
    expect(own.entry.id).toBeUndefined();
    expect(addHandEntry(en, p, { text: 'Serendipity', memo: 'いい言葉' }, 5)).toMatchObject({ existed: true });
    editEntry(p, own.entry.key, { guess: 'うれしい偶然' });
    expect(p.wordbook!.entries.find((e) => e.key === own.entry.key)).toMatchObject({ text: 'serendipity', guess: 'うれしい偶然', memo: 'いい言葉' });
    expect(addHandEntry(en, p, { text: '   ' })).toBeNull();
    removeEntry(p, own.entry.key);
    expect(p.wordbook!.entries.map((e) => e.id ?? e.text)).toEqual(['lemon']);
  });

  it('self-review keeps its own verdicts (never the SRS) and orders the not-yet-known first', () => {
    const p = newProgress('en');
    addHandEntry(en, p, { text: 'aaa' }, 1);
    addHandEntry(en, p, { text: 'bbb' }, 2);
    const [b, a] = p.wordbook!.entries;
    markReview(p, a.key, true);
    expect(reviewOrder(p.wordbook!.entries)[0].key).toBe(b.key);
    markReview(p, b.key, false);
    expect(b.rev).toMatchObject({ ok: 0, again: 1, known: false });
    expect(Object.keys(p.words)).toEqual([]);
  });
});

describe('save v5: assumed words, own meanings, the 単語帳', () => {
  it('migrates a v4 save: start-level words become assumed (not confirmed), pages sealed by the level reopen, verified ones stay', () => {
    const lvl = wordsUpTo(en, 1);
    const sealedByLevel = lvl[0];
    // A page the player solved in play, with an assumed word on it.
    const playedPage = en.content.verificationPages.find((pg) => en.content.lexicon.some((e) => e.group === pg.id && lvl.includes(e)) && pg.id !== sealedByLevel.group)!;
    const played = en.content.lexicon.find((e) => e.group === playedPage.id && lvl.includes(e))!;
    const w = (extra: object) => ({ seen: 6, correct: 2, wrong: 0, firstDay: 1, lastDay: 1, interval: 5, ease: 2.3, due: 6, contexts: [], memo: '', confirmed: true, ...extra });
    const v4 = {
      version: 4,
      currentLang: 'en',
      settings: {},
      progress: {
        en: {
          lang: 'en',
          day: 3,
          words: {
            [sealedByLevel.id]: w({ seeded: { day: 1, seen: 6, correct: 2, fresh: true } }),
            [played.id]: w({ seeded: { day: 1, seen: 6, correct: 2, fresh: true } }),
            lemon: w({ confirmed: false, memo: 'すっぱい飲み物？' }),
          },
          verification: { [sealedByLevel.group]: { attempts: 0, solved: true, seeded: true }, [playedPage.id]: { attempts: 1, solved: true } },
        },
      },
    };
    const s = migrateSave(v4);
    expect(s.version).toBe(SAVE_VERSION);
    const p = s.progress.en!;
    expect(p.words[sealedByLevel.id].confirmed).toBe(false);
    expect(p.words[sealedByLevel.id].seeded).toBeTruthy();
    expect(p.verification[sealedByLevel.group]).toBeUndefined();
    expect(p.words.lemon).toMatchObject({ guess: 'すっぱい飲み物？', memo: '' });
    expect(p.wordbook).toEqual({ entries: [], seq: 0 });
    expect(s.settings.guessDisplay).toBe('under');
    // With the game data (at load): the word the player verified in play is confirmed again.
    repairAssumed(en, p);
    expect(p.words[played.id].confirmed).toBe(true);
    expect(p.words[sealedByLevel.id].confirmed).toBe(false);
  });

  it('a v1 save whose running day lacks its queue gets a fresh day instead of crashing', () => {
    const s = migrateSave({ version: 1, currentLang: 'en', settings: {}, progress: { en: { lang: 'en', day: 7, reputation: 30, stage: 6, today: { day: 7 } } } });
    const p = s.progress.en!;
    expect(() => ensureTownDay(en, p, makeRng(1))).not.toThrow();
    expect(Array.isArray(p.today?.queue)).toBe(true);
    expect(p.today!.queue.length).toBeGreaterThan(0);
    expect(p.today!.day).toBe(7);
  });

  it('the 単語帳 and own meanings survive export → import', () => {
    const s = emptySave();
    const p = (s.progress.en = newProgress('en'));
    applyStartLevel(en, p, 1);
    recordEncounter(p.words, ['lemon'], 1, 'Lemon, please.');
    setWordNote(p, 'lemon', { guess: 'レモン', memo: 'm' });
    toggleStar(p, 'lemon', 5);
    addHandEntry(en, p, { text: 'kettle-ish', guess: 'やかん?' }, 6);
    const back = importSave(exportSave(s));
    expect(back.progress.en!.wordbook).toEqual(p.wordbook);
    expect(back.progress.en!.words.lemon).toMatchObject({ guess: 'レモン', memo: 'm' });
    // Assumed words stay assumed through a round trip.
    const one = wordsUpTo(en, 1)[0];
    expect(back.progress.en!.words[one.id]).toMatchObject({ confirmed: false, seeded: expect.anything() });
  });

  it('a half-written imported 単語帳 is repaired', () => {
    const s = migrateSave({ version: SAVE_VERSION, currentLang: 'en', settings: {}, progress: { en: { day: 2, wordbook: { entries: [null, { key: 'wb1', text: 'x', at: 1, day: 1 }] } } } });
    expect(s.progress.en!.wordbook).toEqual({ seq: 2, entries: [{ key: 'wb1', text: 'x', at: 1, day: 1 }] });
  });
});
