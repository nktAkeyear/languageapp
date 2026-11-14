import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, emptySave, exportSave, importSave, loadSave, migrateSave, newProgress, resetLanguage, SAVE_VERSION, SaveError, STORAGE_KEY, writeSave } from './save';

describe('save', () => {
  it('round-trips through storage', () => {
    const mem = new Map<string, string>();
    const storage = { getItem: (k: string) => mem.get(k) ?? null, setItem: (k: string, v: string) => void mem.set(k, v) };
    const s = emptySave();
    s.currentLang = 'zh';
    s.progress.zh = newProgress('zh');
    s.progress.zh.day = 4;
    writeSave(s, storage);
    expect(mem.has(STORAGE_KEY)).toBe(true);
    const back = loadSave(storage);
    expect(back.progress.zh?.day).toBe(4);
    expect(back.currentLang).toBe('zh');
  });

  it('migrates the unversioned v0 format', () => {
    const v0 = { lang: 'zh', day: 3, rep: 7, pinyin: false, words: { lemon: { seen: 2 } } };
    const s = migrateSave(v0);
    expect(s.version).toBe(SAVE_VERSION);
    expect(s.currentLang).toBe('zh');
    expect(s.settings.showPinyin).toBe(false);
    expect(s.progress.zh).toMatchObject({ day: 3, reputation: 7, stage: 1 });
    expect(s.progress.zh?.words.lemon.seen).toBe(2);
    expect(s.progress.en).toBeUndefined();
  });

  it('fills missing fields with defaults (forward-compatible normalisation)', () => {
    const s = migrateSave({ version: SAVE_VERSION, currentLang: 'en', settings: {}, progress: { en: { day: 2 } } });
    expect(s.settings.layout).toBe('auto');
    expect(s.progress.en).toMatchObject({ day: 2, reputation: 0, returns: [], verification: {} });
  });

  it('rejects garbage and future versions', () => {
    expect(() => importSave('not json')).toThrow(SaveError);
    expect(() => migrateSave({ version: SAVE_VERSION + 1 })).toThrow(SaveError);
    expect(() => migrateSave(null)).toThrow(SaveError);
  });

  it('export/import and per-language reset', () => {
    const s = emptySave();
    s.progress.en = newProgress('en');
    s.progress.zh = newProgress('zh');
    const back = importSave(exportSave(s));
    expect(Object.keys(back.progress).sort()).toEqual(['en', 'zh']);
    const r = resetLanguage(back, 'en');
    expect(r.progress.en).toBeUndefined();
    expect(r.progress.zh).toBeDefined();
  });

  it('migrates v1 saves: town progress added, running day kept', () => {
    const v1 = { version: 1, currentLang: 'en', settings: { layout: 'mobile' }, progress: { en: { lang: 'en', day: 7, reputation: 30, stage: 6, today: { day: 7 } } } };
    const s = migrateSave(v1);
    expect(s.version).toBe(SAVE_VERSION);
    expect(s.settings.layout).toBe('mobile');
    expect(s.progress.en).toMatchObject({ day: 7, reputation: 30, stage: 6, townDay: null, today: { day: 7 } });
    expect(s.progress.en!.town).toMatchObject({ marketRuns: 0, deliveryRuns: 0, unlocked: {}, slips: {} });
    // v0 goes through both steps
    expect(migrateSave({ lang: 'zh', day: 2 }).progress.zh!.town.money).toBeGreaterThan(0);
  });
});


describe('sound settings', () => {
  it('older saves get the sound defaults without a migration', () => {
    const s = migrateSave({ version: 2, currentLang: null, settings: { showPinyin: false, layout: 'mobile', speechRate: 1 }, progress: {} });
    expect(s.settings.volume).toBe(DEFAULT_SETTINGS.volume);
    expect(s.settings.muted).toBe(false);
    expect(s.settings.ambient).toBe(false);
    expect(s.settings.layout).toBe('mobile');
  });
});
