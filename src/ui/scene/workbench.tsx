/**
 * Workbench interaction state for the shop scene (both layouts):
 *
 * - the hand: pick an ingredient up (tap), then tap the cup to drop one portion — or drag a
 *   container / tool straight onto the cup. Every drag has a click / tap / keyboard alternative.
 * - tool effects (knife chop, spoon, pour, tongs …) played over the cup with matching sounds.
 * - the serve flow: hand the cup over → the customer sips → reaction; next customer leaves /
 *   enters through the door with the bell.
 *
 * All brew changes go through GameApi.applyBrew (pure brewing.ts → unchanged Brew model).
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { featuresAtStage, ingredientWordId, ingredientsAtStage, wordMarkup } from '../../core/gamedata';
import type { Brew, Feature, IngredientId, Method, Temp } from '../../core/types';
import { canAdd, toolFor, type Tool } from '../brewing';
import { ContainerArt } from '../art/ingredients';
import { sfx, type Sfx } from '../sound';
import { useGame } from '../useGame';
import { useUi } from '../uiState';

export type FxKind = Tool | 'kettle' | 'basin' | 'hourglass' | 'pot' | 'stir' | 'tipout' | 'remove';
export interface BenchFx {
  id: number;
  kind: FxKind;
  ing?: IngredientId;
}

export type ServeStage = 'idle' | 'handing' | 'sipping' | 'react';

/** Something the hand can carry onto the cup. */
export type Carry = { kind: 'ing'; ing: IngredientId } | { kind: 'temp'; temp: Temp } | { kind: 'method'; method: Method } | { kind: 'cup' };

interface DragState {
  carry: Carry;
  x: number;
  y: number;
  over: string | null;
}

export interface Bench {
  shelf: IngredientId[];
  feats: Set<Feature>;
  brew: Brew;
  /** Taking orders (not reacting / closed / mid-animation). */
  canWork: boolean;
  held: IngredientId | null;
  hold(ing: IngredientId | null): void;
  add(ing: IngredientId): void;
  remove(ing: IngredientId): void;
  setTemp(t: Temp): void;
  setMethod(m: Method): void;
  empty(): void;
  /** Use whatever is carried on the cup. */
  apply(c: Carry): void;
  fx: BenchFx | null;
  /** Markup (with lexicon id) of the ingredient's shelf label. */
  label(ing: IngredientId): string;
  stock(ing: IngredientId): number | undefined;
  limit(ing: IngredientId): number;
  // serve flow
  stage: ServeStage;
  servedBrew: Brew | null;
  serve(): void;
  leaving: boolean;
  next(): void;
  ringing: boolean;
  /** Coins earned by the last cup (for the coin animation). */
  coinDelta: number;
  // drag
  drag: DragState | null;
  startDrag(c: Carry, e: React.PointerEvent): void;
  registerDrop(name: string, el: HTMLElement | null): void;
}

const Ctx = createContext<Bench | null>(null);

/** The bench when inside the shop scene, otherwise null (props shared with other screens). */
export function useBenchOptional(): Bench | null {
  return useContext(Ctx);
}

export function useBench(): Bench {
  const b = useContext(Ctx);
  if (!b) throw new Error('BenchProvider missing');
  return b;
}

const TOOL_SFX: Record<Tool, Sfx> = { knife: 'chop', spoon: 'clink', pour: 'pour', tongs: 'clink', fingers: 'plop' };
const DRAG_THRESHOLD = 8;

export function BenchProvider({ children }: { children: ReactNode }) {
  const g = useGame();
  const ui = useUi();
  const { data, progress, brew } = g;
  const [held, setHeld] = useState<IngredientId | null>(null);
  const [fx, setFx] = useState<BenchFx | null>(null);
  const [stage, setStage] = useState<ServeStage>('idle');
  const [servedBrew, setServedBrew] = useState<Brew | null>(null);
  const [leaving, setLeaving] = useState(false);
  const [ringing, setRinging] = useState(false);
  const moneyBefore = useRef<number | null>(null);
  const [drag, setDrag] = useState<DragState | null>(null);
  const drops = useRef(new Map<string, HTMLElement>());
  const fxId = useRef(0);
  const timers = useRef<number[]>([]);
  const later = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ui.reducedMotion ? 0 : ms));
  };
  useEffect(() => () => timers.current.forEach((t) => clearTimeout(t)), []);

  const phase = progress?.today?.phase;
  const custKey = progress?.today ? `${progress.today.day}:${progress.today.index}` : '';
  // A fresh customer: reset the serve flow (also after reloading mid-day).
  useEffect(() => {
    setStage('idle');
    setServedBrew(null);
    setHeld(null);
  }, [custKey]);
  // Door bell when a customer comes in.
  const firstKey = useRef(custKey);
  useEffect(() => {
    if (!custKey || phase === 'closed') return;
    if (firstKey.current === custKey) return;
    firstKey.current = custKey;
    sfx('bell');
    setRinging(true);
    const t = window.setTimeout(() => setRinging(false), 1200);
    return () => clearTimeout(t);
  }, [custKey, phase]);

  const shelf = useMemo(() => (data && progress ? ingredientsAtStage(data, progress.stage) : []), [data, progress]);
  const feats = useMemo(() => (data && progress ? featuresAtStage(data, progress.stage) : new Set<Feature>()), [data, progress]);
  const canWork = phase === 'order' && stage === 'idle' && !leaving;

  const playFx = useCallback(
    (kind: FxKind, ing?: IngredientId, sound?: Sfx) => {
      fxId.current++;
      setFx({ id: fxId.current, kind, ing });
      if (sound) sfx(sound);
    },
    [setFx],
  );

  const add = (ing: IngredientId) => {
    if (!canWork) return;
    if (!canAdd(brew, ing, g.portionLimit(ing))) {
      sfx('fail');
      return;
    }
    g.applyBrew({ kind: 'add', ing });
    const tool = toolFor(ing);
    playFx(tool, ing, TOOL_SFX[tool]);
  };
  const remove = (ing: IngredientId) => {
    if (!canWork) return;
    g.applyBrew({ kind: 'remove', ing });
    playFx('remove', ing, 'plop');
  };
  const setTemp = (t: Temp) => {
    if (!canWork) return;
    g.applyBrew({ kind: 'temp', temp: t });
    if (brew.temp !== t) playFx(t === 'hot' ? 'kettle' : 'basin', undefined, t === 'hot' ? 'pour' : 'frost');
    else sfx('pickup');
  };
  const setMethod = (m: Method) => {
    if (!canWork) return;
    g.applyBrew({ kind: 'method', method: m });
    if (brew.method !== m) playFx(m === 'steep' ? 'hourglass' : m === 'boil' ? 'pot' : 'stir', undefined, m === 'steep' ? 'tick' : m === 'boil' ? 'simmer' : 'stir');
    else sfx('pickup');
  };
  const empty = () => {
    if (!canWork) return;
    g.applyBrew({ kind: 'empty' });
    playFx('tipout', undefined, 'tipout');
  };

  const serve = () => {
    if (!canWork || !progress) return;
    moneyBefore.current = progress.town.money;
    setServedBrew(brew);
    setHeld(null);
    sfx('serve');
    setStage('handing');
    // The serve itself happens at once (state is saved); the scene plays it out.
    g.serveBrew();
    later(520, () => setStage('sipping'));
    later(1300, () => setStage('react'));
  };

  // Reaction sounds once the customer has tasted.
  const result = progress?.today?.phase === 'reaction' ? progress.today.results[progress.today.results.length - 1] : null;
  const reacted = useRef('');
  useEffect(() => {
    if (stage !== 'react' || !result) return;
    const k = custKey;
    if (reacted.current === k) return;
    reacted.current = k;
    if (result.outcome === 'perfect') sfx('happy');
    else sfx('fail');
    later(350, () => sfx('coin'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, result, custKey]);

  const next = () => {
    if (phase !== 'reaction' || leaving) return;
    sfx('bell');
    setRinging(true);
    setLeaving(true);
    later(480, () => {
      g.next();
      setLeaving(false);
      moneyBefore.current = null;
    });
    later(1300, () => setRinging(false));
  };

  const apply = (c: Carry) => {
    if (c.kind === 'ing') add(c.ing);
    else if (c.kind === 'temp') setTemp(c.temp);
    else if (c.kind === 'method') setMethod(c.method);
  };

  // ---------------------------------------------------------------- drag & drop
  const dragRef = useRef<DragState | null>(null);
  const hitTest = (x: number, y: number): string | null => {
    for (const [name, el] of drops.current) {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return name;
    }
    return null;
  };
  const applyRef = useRef(apply);
  applyRef.current = apply;
  const serveRef = useRef(serve);
  serveRef.current = serve;

  const startDrag = (c: Carry, e: React.PointerEvent) => {
    if (!canWork) return;
    if (e.button !== 0) return;
    const sx = e.clientX;
    const sy = e.clientY;
    const el = e.currentTarget as HTMLElement;
    const pid = e.pointerId;
    let started = false;
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== pid) return;
      if (!started) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < DRAG_THRESHOLD) return;
        started = true;
        try {
          el.setPointerCapture(pid);
        } catch {
          /* ignore */
        }
        if (c.kind !== 'cup') sfx('pickup');
      }
      const d = { carry: c, x: ev.clientX, y: ev.clientY, over: hitTest(ev.clientX, ev.clientY) };
      dragRef.current = d;
      setDrag(d);
    };
    const end = (ev: PointerEvent) => {
      if (ev.pointerId !== pid) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', cancel);
      const d = dragRef.current;
      dragRef.current = null;
      setDrag(null);
      if (!started || !d) return;
      // Swallow the click that follows a drag.
      const stop = (ce: MouseEvent) => {
        ce.stopPropagation();
        ce.preventDefault();
      };
      window.addEventListener('click', stop, { capture: true, once: true });
      window.setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 50);
      const target = hitTest(ev.clientX, ev.clientY);
      if (c.kind === 'cup') {
        if (target === 'counter') serveRef.current();
      } else if (target === 'cup') applyRef.current(c);
    };
    const cancel = (ev: PointerEvent) => {
      if (ev.pointerId !== pid) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', cancel);
      dragRef.current = null;
      setDrag(null);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', cancel);
  };

  const registerDrop = useCallback((name: string, el: HTMLElement | null) => {
    if (el) drops.current.set(name, el);
    else drops.current.delete(name);
  }, []);

  // Esc / right-click puts the held ingredient back.
  useEffect(() => {
    if (!held) return;
    const k = (e: KeyboardEvent) => e.key === 'Escape' && setHeld(null);
    window.addEventListener('keydown', k);
    return () => window.removeEventListener('keydown', k);
  }, [held]);
  useEffect(() => {
    if (!canWork) setHeld(null);
  }, [canWork]);

  const label = (ing: IngredientId) => {
    if (!data) return ing;
    const id = ingredientWordId(data, ing);
    return id ? wordMarkup(data, id) : ing;
  };

  const api: Bench = {
    shelf,
    feats,
    brew,
    canWork,
    held,
    hold: (ing) => {
      if (ing && !canWork) return;
      if (ing) sfx('pickup');
      setHeld(ing);
    },
    add,
    remove,
    setTemp,
    setMethod,
    empty,
    apply,
    fx,
    label,
    stock: (ing) => progress?.townDay?.stock[ing],
    limit: g.portionLimit,
    stage: phase === 'reaction' && stage === 'idle' ? 'react' : stage,
    servedBrew,
    serve,
    leaving,
    next,
    ringing,
    coinDelta: moneyBefore.current !== null ? Math.max(0, (progress?.town.money ?? 0) - moneyBefore.current) : 0,
    drag,
    startDrag,
    registerDrop,
  };
  return (
    <Ctx.Provider value={api}>
      {children}
      <DragGhost />
    </Ctx.Provider>
  );
}

/** The thing in the hand, following the pointer while dragging, or the cursor while held. */
function DragGhost() {
  const b = useContext(Ctx)!;
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  // Follow the mouse while an ingredient is held (tap-to-pick on desktop).
  useEffect(() => {
    if (!b.held) {
      setPos(null);
      return;
    }
    const m = (e: PointerEvent) => e.pointerType === 'mouse' && setPos({ x: e.clientX, y: e.clientY });
    window.addEventListener('pointermove', m);
    return () => window.removeEventListener('pointermove', m);
  }, [b.held]);
  const d = b.drag;
  let what: IngredientId | null = null;
  let x = 0;
  let y = 0;
  let over = false;
  if (d && d.carry.kind === 'ing') {
    what = d.carry.ing;
    x = d.x;
    y = d.y;
    over = d.over === 'cup';
  } else if (!d && b.held && pos) {
    what = b.held;
    x = pos.x;
    y = pos.y;
  }
  if (d && d.carry.kind !== 'ing') {
    return createPortal(
      <div className={`drag-ghost drag-ghost-tool ${d.over ? 'over' : ''}`} style={{ left: d.x, top: d.y }} aria-hidden>
        {d.carry.kind === 'cup' ? '🍵' : d.carry.kind === 'temp' ? (d.carry.temp === 'hot' ? '♨' : '❄') : d.carry.method === 'steep' ? '⏳' : d.carry.method === 'boil' ? '🍲' : '🥄'}
      </div>,
      document.body,
    );
  }
  if (!what) return null;
  return createPortal(
    <div className={`drag-ghost ${over ? 'over' : ''} ${d ? 'dragging' : 'held'}`} style={{ left: x, top: y }} aria-hidden>
      <ContainerArt ing={what} />
    </div>,
    document.body,
  );
}
