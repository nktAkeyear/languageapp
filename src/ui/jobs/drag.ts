/**
 * Drag & drop for the workplace benches (mouse, pen and touch alike): register drop zones by name, start a
 * drag from any piece with `start(item, event)`; while dragging, `drag` holds the pointer position (for the
 * ghost that follows the finger) and the zone under it; on release `onDrop(item, zone)` is called. A press
 * that does not move past the threshold stays a plain click (the tap-tap path of every bench).
 */
import { useRef, useState } from 'react';
import { sfx } from '../sound';

const THRESHOLD = 8;

export interface DragState<T> {
  item: T;
  x: number;
  y: number;
  over: string | null;
}

export function useDragDrop<T>(onDrop: (item: T, zone: string) => void, enabled = true) {
  const zones = useRef(new Map<string, HTMLElement>());
  const [drag, setDrag] = useState<DragState<T> | null>(null);
  const dropRef = useRef(onDrop);
  dropRef.current = onDrop;
  const hit = (x: number, y: number): string | null => {
    for (const [name, el] of zones.current) {
      const r = el.getBoundingClientRect();
      if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return name;
    }
    return null;
  };
  /** Ref callback registering an element as the drop zone `name`. */
  const zone = (name: string) => (el: HTMLElement | null) => {
    if (el) zones.current.set(name, el);
    else zones.current.delete(name);
  };
  const start = (item: T, e: React.PointerEvent) => {
    if (!enabled || e.button !== 0) return;
    const sx = e.clientX;
    const sy = e.clientY;
    const pid = e.pointerId;
    let started = false;
    let last: DragState<T> | null = null;
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== pid) return;
      if (!started) {
        if (Math.hypot(ev.clientX - sx, ev.clientY - sy) < THRESHOLD) return;
        started = true;
        sfx('pickup');
      }
      ev.preventDefault();
      last = { item, x: ev.clientX, y: ev.clientY, over: hit(ev.clientX, ev.clientY) };
      setDrag(last);
    };
    const finish = (ev: PointerEvent, drop: boolean) => {
      if (ev.pointerId !== pid) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', cancel);
      setDrag(null);
      if (!started) return;
      // The click that follows a drag must not also count as a tap.
      const stop = (ce: MouseEvent) => {
        ce.stopPropagation();
        ce.preventDefault();
      };
      window.addEventListener('click', stop, { capture: true, once: true });
      window.setTimeout(() => window.removeEventListener('click', stop, { capture: true }), 60);
      const target = drop ? hit(ev.clientX, ev.clientY) : null;
      if (target && last) dropRef.current(item, target);
    };
    const up = (ev: PointerEvent) => finish(ev, true);
    const cancel = (ev: PointerEvent) => finish(ev, false);
    window.addEventListener('pointermove', move, { passive: false });
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', cancel);
  };
  return { drag, zone, start };
}
