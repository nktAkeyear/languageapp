/**
 * Time-of-day light for the shop window: t = 0 (opening, morning) … 1 (closing, evening).
 * Pure (tested): interpolates sky / sea / light colours between keyframes.
 */
export interface SkyColours {
  top: string;
  bottom: string;
  sea: string;
  /** Colour of the light falling in through the window. */
  light: string;
  /** Sun height 0 (horizon) .. 1 (high). */
  sun: number;
  /** Strength of the window light shaft 0..1. */
  shaft: number;
  /** Lamp glow strength 0..1 (the lamp matters more in the evening). */
  lamp: number;
}

type Key = { t: number; top: number[]; bottom: number[]; sea: number[]; light: number[]; sun: number; shaft: number; lamp: number };

const KEYS: Key[] = [
  { t: 0, top: [150, 196, 226], bottom: [250, 226, 180], sea: [92, 150, 176], light: [255, 236, 190], sun: 0.35, shaft: 0.55, lamp: 0.35 },
  { t: 0.45, top: [104, 168, 222], bottom: [214, 234, 244], sea: [64, 132, 168], light: [255, 248, 226], sun: 0.95, shaft: 0.45, lamp: 0.25 },
  { t: 0.75, top: [128, 150, 200], bottom: [250, 200, 140], sea: [80, 112, 150], light: [255, 210, 150], sun: 0.45, shaft: 0.6, lamp: 0.55 },
  { t: 1, top: [64, 62, 120], bottom: [240, 140, 100], sea: [52, 64, 104], light: [255, 170, 120], sun: 0.05, shaft: 0.35, lamp: 0.95 },
];

const mix = (a: number[], b: number[], k: number) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
const css = (c: number[]) => `rgb(${c[0]},${c[1]},${c[2]})`;

export function skyAt(t: number): SkyColours {
  const x = Math.max(0, Math.min(1, Number.isFinite(t) ? t : 0));
  let i = 0;
  while (i < KEYS.length - 2 && x > KEYS[i + 1].t) i++;
  const a = KEYS[i];
  const b = KEYS[i + 1];
  const k = (x - a.t) / (b.t - a.t);
  return {
    top: css(mix(a.top, b.top, k)),
    bottom: css(mix(a.bottom, b.bottom, k)),
    sea: css(mix(a.sea, b.sea, k)),
    light: css(mix(a.light, b.light, k)),
    sun: a.sun + (b.sun - a.sun) * k,
    shaft: a.shaft + (b.shaft - a.shaft) * k,
    lamp: a.lamp + (b.lamp - a.lamp) * k,
  };
}

/** Time of day in the shop from the customer index (0 … n-1, closed = 1). */
export function shopTime(index: number, count: number, closed: boolean): number {
  if (closed) return 1;
  if (count <= 1) return 0.2;
  return 0.08 + (0.84 * index) / (count - 1);
}
