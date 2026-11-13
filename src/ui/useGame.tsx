import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { endDay, nextCustomer, serve, startDay, viewPage, type ServeOutcome } from '../activities/shop/engine';
import { CONTENT, SHARED } from '../content';
import { buildGameData, type GameData } from '../core/gamedata';
import { makeRng } from '../core/rng';
import {
  exportSave,
  importSave,
  loadSave,
  newProgress,
  resetLanguage as resetLang,
  writeSave,
  type LangProgress,
  type SaveFile,
  type Settings,
} from '../core/save';
import { ensureWord } from '../core/srs';
import type { Brew, IngredientId, Lang, Method, Temp } from '../core/types';
import { submitVerification } from '../core/verification';

const dataCache = new Map<Lang, GameData>();
export function gameData(lang: Lang): GameData {
  let d = dataCache.get(lang);
  if (!d) {
    d = buildGameData(CONTENT[lang], SHARED);
    dataCache.set(lang, d);
  }
  return d;
}

const emptyBrew = (): Brew => ({ counts: {}, temp: null, method: null });
const rng = () => makeRng(Math.floor(Math.random() * 2 ** 32));

export interface GameApi {
  save: SaveFile;
  settings: Settings;
  lang: Lang | null;
  data: GameData | null;
  progress: LangProgress | null;
  brew: Brew;
  lastServe: ServeOutcome | null;
  selectedWord: string | null;
  chooseLanguage(lang: Lang): void;
  leaveToTitle(): void;
  addIngredient(ing: IngredientId, delta: number): void;
  setTemp(t: Temp | null): void;
  setMethod(m: Method | null): void;
  clearBrew(): void;
  serveBrew(): void;
  next(): void;
  closeDay(): void;
  openPage(pageId: string): void;
  setMemo(wordId: string, memo: string): void;
  verify(pageId: string, assignment: Record<string, string | undefined>): boolean;
  updateSettings(s: Partial<Settings>): void;
  exportFile(): void;
  importText(json: string): string | null;
  resetLanguage(lang: Lang): void;
  openWord(id: string | null): void;
}

const Ctx = createContext<GameApi | null>(null);

export function useGame(): GameApi {
  const g = useContext(Ctx);
  if (!g) throw new Error('GameProvider missing');
  return g;
}

/** Ensure the current language has a running day. Mutates the save in place. */
function ensureDay(s: SaveFile) {
  const lang = s.currentLang;
  if (!lang) return;
  const p = (s.progress[lang] ??= newProgress(lang));
  if (!p.today) startDay(gameData(lang), p, rng());
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [save, setSave] = useState<SaveFile>(() => {
    const s = loadSave();
    ensureDay(s);
    return s;
  });
  const [brew, setBrew] = useState<Brew>(emptyBrew);
  const [lastServe, setLastServe] = useState<ServeOutcome | null>(null);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const saveRef = useRef(save);
  saveRef.current = save;
  // Persist the day planned during initial load (initialisers must stay side-effect free).
  useEffect(() => writeSave(saveRef.current), []);

  /** Apply a mutation to a copy of the save, persist, and re-render. */
  const mutate = useCallback((fn: (s: SaveFile) => void) => {
    const s = structuredClone(saveRef.current);
    fn(s);
    saveRef.current = s;
    writeSave(s);
    setSave(s);
    return s;
  }, []);

  const lang = save.currentLang;
  const data = lang ? gameData(lang) : null;
  const progress = lang ? (save.progress[lang] ?? null) : null;

  const api = useMemo<GameApi>(() => {
    const withProgress = (fn: (p: LangProgress, d: GameData) => void) =>
      mutate((s) => {
        const l = s.currentLang;
        const p = l && s.progress[l];
        if (l && p) fn(p, gameData(l));
      });
    return {
      save,
      settings: save.settings,
      lang,
      data,
      progress,
      brew,
      lastServe,
      selectedWord,
      chooseLanguage: (l) => {
        mutate((s) => {
          s.currentLang = l;
          ensureDay(s);
        });
        setBrew(emptyBrew());
        setLastServe(null);
        setSelectedWord(null);
      },
      leaveToTitle: () => {
        mutate((s) => {
          s.currentLang = null;
        });
        setSelectedWord(null);
      },
      addIngredient: (ing, delta) =>
        setBrew((b) => {
          const max = SHARED.ingredients.find((i) => i.id === ing)?.maxCount ?? 5;
          const n = Math.max(0, Math.min(max, (b.counts[ing] ?? 0) + delta));
          const counts = { ...b.counts, [ing]: n };
          if (!n) delete counts[ing];
          return { ...b, counts };
        }),
      setTemp: (t) => setBrew((b) => ({ ...b, temp: t })),
      setMethod: (m) => setBrew((b) => ({ ...b, method: m })),
      clearBrew: () => setBrew(emptyBrew()),
      serveBrew: () => {
        const box: { out: ServeOutcome | null } = { out: null };
        withProgress((p, d) => {
          box.out = serve(d, p, brew, rng());
        });
        setLastServe(box.out);
      },
      next: () => {
        withProgress((p, d) => nextCustomer(d, p));
        setBrew(emptyBrew());
        setLastServe(null);
      },
      closeDay: () => {
        withProgress((p, d) => {
          endDay(p);
          startDay(d, p, rng());
        });
        setBrew(emptyBrew());
        setLastServe(null);
      },
      openPage: (pageId) => withProgress((p, d) => viewPage(d, p, pageId)),
      setMemo: (wordId, memo) =>
        withProgress((p) => {
          ensureWord(p.words, wordId, p.day).memo = memo;
        }),
      verify: (pageId, assignment) => {
        let ok = false;
        withProgress((p, d) => {
          ok = submitVerification(d, p, pageId, assignment);
        });
        return ok;
      },
      updateSettings: (st) =>
        mutate((s) => {
          s.settings = { ...s.settings, ...st };
        }),
      exportFile: () => {
        const blob = new Blob([exportSave(saveRef.current)], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `minato-chabou-save-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      },
      importText: (json) => {
        try {
          const s = importSave(json);
          ensureDay(s);
          saveRef.current = s;
          writeSave(s);
          setSave(s);
          setBrew(emptyBrew());
          setLastServe(null);
          return null;
        } catch (e) {
          return e instanceof Error ? e.message : String(e);
        }
      },
      resetLanguage: (l) => {
        const s = resetLang(saveRef.current, l);
        if (s.currentLang === l) {
          s.progress[l] = newProgress(l);
          ensureDay(s);
        }
        saveRef.current = s;
        writeSave(s);
        setSave(s);
        setBrew(emptyBrew());
        setLastServe(null);
      },
      openWord: (id) => setSelectedWord(id),
    };
  }, [save, lang, data, progress, brew, lastServe, selectedWord, mutate]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
