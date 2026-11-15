/**
 * The v2 store: the whole game state lives in one mutable object (V2State), changed only through `act`, saved
 * after every action, re-rendered by a counter. Deliveries are checked on a timer.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react';
import { makeRng } from '../../core/rng';
import type { GameData } from '../../core/gamedata';
import { gameData } from '../data';
import { tick, type Ctx } from '../logic/day';
import { clearState, loadState, saveState, type V2State } from '../logic/state';
import { isDue } from '../logic/stock';

export type Layout = 'desk' | 'phone';

export interface NotebookUi {
  open: boolean;
  tab: 'words' | 'book' | 'verify' | 'record';
  word: string | null;
  page: string | null;
}

export interface Api {
  data: GameData;
  s: V2State | null;
  layout: Layout;
  /** Run an action on the state (mutates it), then save and re-render. */
  act<T>(fn: (s: V2State, ctx: Ctx) => T): T | undefined;
  start(s: V2State): void;
  reset(): void;
  ctx(): Ctx;
  nb: NotebookUi;
  setNb(patch: Partial<NotebookUi>): void;
  openWord(id: string): void;
  order: { open: boolean; preset: Record<string, number> };
  openOrder(preset?: Record<string, number>): void;
  closeOrder(): void;
  reduced: boolean;
  now: number;
}

const GameCtx = createContext<Api | null>(null);

export function useGame(): Api {
  const g = useContext(GameCtx);
  if (!g) throw new Error('no game');
  return g;
}

/** The state, when a game is running (screens below the start screen). */
export function useS(): V2State {
  const s = useGame().s;
  if (!s) throw new Error('no state');
  return s;
}

function useLayout(): Layout {
  const q = () => (typeof window !== 'undefined' && window.innerWidth <= 820 ? 'phone' : 'desk');
  const [l, setL] = useState<Layout>(q);
  useEffect(() => {
    const on = () => setL(q());
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  return l;
}

function useReduced(): boolean {
  const m = () => typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const [r, setR] = useState(m);
  useEffect(() => {
    const mq = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    if (!mq) return;
    const on = () => setR(mq.matches);
    mq.addEventListener?.('change', on);
    return () => mq.removeEventListener?.('change', on);
  }, []);
  return r;
}

export function GameProvider({ children }: { children: ReactNode }) {
  const data = useMemo(() => gameData(), []);
  const ref = useRef<V2State | null>(loadState());
  const [, bump] = useReducer((x: number) => x + 1, 0);
  const layout = useLayout();
  const reduced = useReduced();
  const [nb, setNbState] = useState<NotebookUi>({ open: false, tab: 'words', word: null, page: null });
  const [order, setOrder] = useState<{ open: boolean; preset: Record<string, number> }>({ open: false, preset: {} });
  const [now, setNow] = useState(() => Date.now());

  const ctx = useCallback((): Ctx => ({ data, rng: makeRng(Math.floor(Math.random() * 2 ** 32)), now: Date.now() }), [data]);

  const act = useCallback(
    <T,>(fn: (s: V2State, c: Ctx) => T): T | undefined => {
      const s = ref.current;
      if (!s) return undefined;
      const out = fn(s, ctx());
      saveState(s);
      bump();
      return out;
    },
    [ctx],
  );

  // Deliveries: a crate that is due arrives (also right after a reload).
  useEffect(() => {
    const id = window.setInterval(() => {
      const s = ref.current;
      const t = Date.now();
      setNow(t);
      if (s && s.pending.some((d) => isDue(d, t, s.p.day))) act((st, c) => tick(st, c));
    }, 400);
    return () => window.clearInterval(id);
  }, [act]);

  const api: Api = {
    data,
    s: ref.current,
    layout,
    act,
    ctx,
    start: (s) => {
      ref.current = s;
      saveState(s);
      bump();
    },
    reset: () => {
      clearState();
      ref.current = null;
      setNbState({ open: false, tab: 'words', word: null, page: null });
      bump();
    },
    nb,
    setNb: (patch) => setNbState((x) => ({ ...x, ...patch })),
    openWord: (id) => setNbState({ open: true, tab: 'words', word: id, page: null }),
    order,
    openOrder: (preset = {}) => setOrder({ open: true, preset }),
    closeOrder: () => setOrder({ open: false, preset: {} }),
    reduced,
    now,
  };
  return <GameCtx.Provider value={api}>{children}</GameCtx.Provider>;
}
