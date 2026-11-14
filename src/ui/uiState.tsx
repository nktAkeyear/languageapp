/**
 * Presentation state shared across the scene: which book is open (recipe book / notebook) and
 * where, which verification pages the player has already noticed (so the notebook on the desk
 * can glow when a new one opens), and the user's reduced-motion preference.
 *
 * Nothing here is part of the save: "noticed pages" is a per-browser convenience in its own
 * localStorage key and is safe to lose.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { pageStatus } from '../core/verification';
import { useGame } from './useGame';

export type BookKind = 'recipe' | 'notebook';
export type NbTab = 'words' | 'verify' | 'level';

export interface UiApi {
  book: BookKind | null;
  nbTab: NbTab;
  /** Word open on the notebook's right-hand page. */
  word: string | null;
  verifyPage: string | null;
  recipePage: string | null;
  openRecipe(pageId?: string | null): void;
  openNotebook(tab?: NbTab, opts?: { word?: string | null; verifyPage?: string | null }): void;
  closeBook(): void;
  setNbTab(t: NbTab): void;
  setWord(id: string | null): void;
  setVerifyPage(id: string | null): void;
  setRecipePage(id: string | null): void;
  /** Verification pages that are open (available, unsolved) and not yet noticed by the player. */
  newPages: string[];
  acknowledgePages(ids: string[]): void;
  reducedMotion: boolean;
}

const Ctx = createContext<UiApi | null>(null);

export function useUi(): UiApi {
  const u = useContext(Ctx);
  if (!u) throw new Error('UiProvider missing');
  return u;
}

const SEEN_KEY = 'minato-chabou-ui-seen-pages';

function loadSeen(): Record<string, string[]> {
  try {
    const t = localStorage.getItem(SEEN_KEY);
    return t ? (JSON.parse(t) as Record<string, string[]>) : {};
  } catch {
    return {};
  }
}

export function useReducedMotion(): boolean {
  const q = '(prefers-reduced-motion: reduce)';
  const [r, setR] = useState(() => typeof window !== 'undefined' && !!window.matchMedia?.(q).matches);
  useEffect(() => {
    const mq = window.matchMedia?.(q);
    if (!mq) return;
    const on = () => setR(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return r;
}

export function UiProvider({ children }: { children: ReactNode }) {
  const g = useGame();
  const [book, setBook] = useState<BookKind | null>(null);
  const [nbTab, setNbTab] = useState<NbTab>('words');
  const [word, setWord] = useState<string | null>(null);
  const [verifyPage, setVerifyPage] = useState<string | null>(null);
  const [recipePage, setRecipePage] = useState<string | null>(null);
  const [seen, setSeen] = useState<Record<string, string[]>>(loadSeen);
  const reducedMotion = useReducedMotion();

  // A word tapped anywhere (order bubble, recipe page, market…) opens the notebook at that word.
  useEffect(() => {
    if (!g.selectedWord) return;
    setBook('notebook');
    setNbTab('words');
    setWord(g.selectedWord);
    g.openWord(null);
  }, [g.selectedWord, g]);

  // Close books when the language changes.
  useEffect(() => {
    setBook(null);
    setWord(null);
    setVerifyPage(null);
    setRecipePage(null);
  }, [g.lang]);

  const lang = g.lang;
  const available = useMemo(() => {
    if (!g.data || !g.progress) return [] as string[];
    return g.data.content.verificationPages.filter((p) => pageStatus(g.data!, g.progress!, p) === 'available').map((p) => p.id);
  }, [g.data, g.progress]);
  const seenSet = useMemo(() => new Set(lang ? (seen[lang] ?? []) : []), [seen, lang]);
  const newPages = useMemo(() => available.filter((id) => !seenSet.has(id)), [available, seenSet]);

  const acknowledgePages = useCallback(
    (ids: string[]) => {
      if (!lang || !ids.length) return;
      setSeen((s) => {
        const cur = new Set(s[lang] ?? []);
        let changed = false;
        for (const id of ids)
          if (!cur.has(id)) {
            cur.add(id);
            changed = true;
          }
        if (!changed) return s;
        const next = { ...s, [lang]: [...cur] };
        try {
          localStorage.setItem(SEEN_KEY, JSON.stringify(next));
        } catch {
          /* per-browser convenience only */
        }
        return next;
      });
    },
    [lang],
  );

  const api = useMemo<UiApi>(
    () => ({
      book,
      nbTab,
      word,
      verifyPage,
      recipePage,
      openRecipe: (id) => {
        setBook('recipe');
        if (id !== undefined) setRecipePage(id);
      },
      openNotebook: (tab, opts) => {
        setBook('notebook');
        if (tab) setNbTab(tab);
        if (opts?.word !== undefined) setWord(opts.word);
        if (opts?.verifyPage !== undefined) setVerifyPage(opts.verifyPage);
      },
      closeBook: () => setBook(null),
      setNbTab,
      setWord,
      setVerifyPage,
      setRecipePage,
      newPages,
      acknowledgePages,
      reducedMotion,
    }),
    [book, nbTab, word, verifyPage, recipePage, newPages, acknowledgePages, reducedMotion],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}
