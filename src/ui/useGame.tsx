import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { currentSegment, endTownDay, ensureTownDay, nextSegment, serveInTown, startTownDay, stockOf } from '../activities/day';
import * as delivery from '../activities/delivery/engine';
import * as market from '../activities/market/engine';
import { nextCustomer, viewPage, type ServeOutcome } from '../activities/shop/engine';
import { CONTENT, SHARED } from '../content';
import { buildGameData, type GameData } from '../core/gamedata';
import { makeRng } from '../core/rng';
import type { ServedResult } from '../core/save';
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
import type { AbsentAction, ActivityKind, PersonId, TownDayState } from '../core/townTypes';
import type { Brew, IngredientId, Lang, Method, Temp } from '../core/types';
import { submitVerification } from '../core/verification';
import { storySync } from '../story/engine';
import { applyBrewAction, emptyBrew, portionLimit, type BrewAction } from './brewing';

const dataCache = new Map<Lang, GameData>();
export function gameData(lang: Lang): GameData {
  let d = dataCache.get(lang);
  if (!d) {
    d = buildGameData(CONTENT[lang], SHARED);
    dataCache.set(lang, d);
  }
  return d;
}

const rng = () => makeRng(Math.floor(Math.random() * 2 ** 32));

/** What the shop saw today, kept (in memory only) for the night's ledger after the day is closed. */
export interface DaySnapshot {
  day: number;
  results: ServedResult[];
  stock: [IngredientId, number][];
  returning: number;
}

export interface GameApi {
  /** The day that was just closed (for the ledger's faces / stock lines); null after a reload. */
  lastDay: DaySnapshot | null;
  save: SaveFile;
  settings: Settings;
  lang: Lang | null;
  data: GameData | null;
  progress: LangProgress | null;
  brew: Brew;
  lastServe: ServeOutcome | null;
  selectedWord: string | null;
  /** Current activity segment of the day (market → shop → delivery). */
  segment: ActivityKind;
  townDay: TownDayState | null;
  chooseLanguage(lang: Lang): void;
  leaveToTitle(): void;
  addIngredient(ing: IngredientId, delta: number): void;
  /** One workbench gesture (add / take back / temperature / method / tip out), see brewing.ts. */
  applyBrew(a: BrewAction): void;
  /** Portion limit of an ingredient in one cup (maxCount, further limited by today's stock). */
  portionLimit(ing: IngredientId): number;
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
  /** Move on to the next segment of the day (after the current one is done). */
  nextSegment(): void;
  /** Generic progress mutation (used by the story layer's own components). */
  mutateProgress(fn: (p: LangProgress, d: GameData) => void): void;
  market: {
    openStall(id: string): void;
    leaveStall(): void;
    selectOffer(id: string): void;
    order(units: number): void;
    bargain(): void;
    pay(amount: number): void;
    cancel(): void;
    finish(): void;
  };
  delivery: {
    choosePlace(id: string): void;
    chooseHour(h: number): void;
    depart(): void;
    knock(n: number): void;
    handOver(to: { person?: PersonId; absent?: AbsentAction }): void;
  };
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
  ensureTownDay(gameData(lang), p, rng());
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
  const [lastDay, setLastDay] = useState<DaySnapshot | null>(null);
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
    const limit = (ing: IngredientId) =>
      portionLimit(SHARED.ingredients.find((i) => i.id === ing)?.maxCount ?? 5, progress ? stockOf(progress, ing) : undefined);
    return {
      lastDay,
      save,
      settings: save.settings,
      lang,
      data,
      progress,
      brew,
      lastServe,
      selectedWord,
      segment: progress ? currentSegment(progress) : 'shop',
      townDay: progress?.townDay ?? null,
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
      addIngredient: (ing, delta) => setBrew((b) => applyBrewAction(b, { kind: delta >= 0 ? 'add' : 'remove', ing, n: Math.abs(delta) }, limit)),
      applyBrew: (a) => setBrew((b) => applyBrewAction(b, a, limit)),
      portionLimit: limit,
      setTemp: (t) => setBrew((b) => ({ ...b, temp: t })),
      setMethod: (m) => setBrew((b) => ({ ...b, method: m })),
      clearBrew: () => setBrew(emptyBrew()),
      serveBrew: () => {
        const box: { out: ServeOutcome | null } = { out: null };
        withProgress((p, d) => {
          box.out = serveInTown(d, p, brew, rng());
        });
        setLastServe(box.out);
      },
      next: () => {
        withProgress((p, d) => nextCustomer(d, p));
        setBrew(emptyBrew());
        setLastServe(null);
      },
      closeDay: () => {
        if (progress?.today)
          setLastDay({
            day: progress.day,
            results: progress.today.results,
            stock: progress.townDay ? (Object.entries(progress.townDay.stock) as [IngredientId, number][]) : [],
            returning: progress.returns.length,
          });
        withProgress((p, d) => {
          endTownDay(p, d);
          if (!p.townDay) startTownDay(d, p, rng());
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
      nextSegment: () => {
        withProgress((p) => nextSegment(p));
        setBrew(emptyBrew());
        setLastServe(null);
      },
      mutateProgress: (fn) => withProgress(fn),
      market: {
        openStall: (id) => withProgress((p, d) => market.openStall(d, p, id, rng())),
        leaveStall: () => withProgress((p) => market.leaveStall(p)),
        selectOffer: (id) => withProgress((p, d) => market.selectOffer(d, p, id, rng())),
        order: (n) => withProgress((p, d) => void market.orderUnits(d, p, n, rng())),
        bargain: () => withProgress((p, d) => market.bargain(d, p, rng())),
        pay: (n) => withProgress((p, d) => void market.pay(d, p, n, rng())),
        cancel: () => withProgress((p) => market.cancelPurchase(p)),
        finish: () => withProgress((p, d) => market.finishMarket(d, p)),
      },
      delivery: {
        choosePlace: (id) => withProgress((p) => delivery.choosePlace(p, id)),
        chooseHour: (h) => withProgress((p) => delivery.chooseHour(p, h)),
        depart: () => withProgress((p) => void delivery.depart(p)),
        knock: (n) => withProgress((p) => delivery.knock(p, n)),
        handOver: (to) =>
          withProgress((p, d) => {
            delivery.handOver(d, p, to, rng());
            storySync(d, p); // a regular's delivery: their own reaction line and scene
          }),
      },
    };
  }, [save, lang, data, progress, brew, lastServe, selectedWord, lastDay, mutate]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
