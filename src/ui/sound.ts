/**
 * Synthesised sound effects (Web Audio API, no audio files, no network).
 *
 * - The AudioContext is created on the first user gesture (browsers block audio before that).
 * - Every call is wrapped so that a missing / broken Web Audio never throws into the UI.
 * - Master volume, mute and the optional ambient loop come from the persisted settings.
 */

export type Sfx =
  | 'bell' // door bell: a customer enters / leaves
  | 'pour' // water / milk poured, kettle
  | 'chop' // knife on the board
  | 'clink' // spoon / tongs on the cup
  | 'plop' // a piece dropped into the cup
  | 'simmer' // pot boiling
  | 'stir' // spoon stirring
  | 'tick' // hourglass turned
  | 'frost' // cup set into the cold basin
  | 'tipout' // cup emptied
  | 'pickup' // picking something up
  | 'page' // page turn
  | 'coin' // coins into the jar
  | 'stamp' // ink stamp
  | 'confirm' // a verification page is right
  | 'fail' // soft failure
  | 'happy' // customer delighted
  | 'serve' // cup set on the counter
  | 'glow' // notebook has something new
  | 'chapter' // a chapter title card: a deep harbour bell and a shimmer
  | 'write' // pen scratching in the ledger
  | 'lampout' // the lamp is blown out
  | 'dawn' // morning: birds outside
  | 'dusk' // evening falls: a low, warm chord
  | 'knock' // knuckles on a wooden door
  | 'steps' // footsteps on cobbles
  | 'paper' // a paper picked up / unfolded
  | 'drawer' // the document box opens / closes
  | 'whoosh'; // moving between places

interface AudioState {
  ctx: AudioContext | null;
  master: GainNode | null;
  volume: number;
  muted: boolean;
  ambient: boolean;
  ambientNodes: { stop(): void } | null;
  noise: AudioBuffer | null;
}

const st: AudioState = { ctx: null, master: null, volume: 0.7, muted: false, ambient: false, ambientNodes: null, noise: null };

function ctor(): typeof AudioContext | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as { AudioContext?: typeof AudioContext; webkitAudioContext?: typeof AudioContext };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

function ensureCtx(): AudioContext | null {
  if (st.ctx) return st.ctx;
  const C = ctor();
  if (!C) return null;
  try {
    const ctx = new C();
    const master = ctx.createGain();
    master.gain.value = st.muted ? 0 : st.volume;
    master.connect(ctx.destination);
    st.ctx = ctx;
    st.master = master;
    if (st.ambient) startAmbient();
    return ctx;
  } catch {
    return null;
  }
}

let armed = false;
/** Install one-time listeners that unlock audio on the first pointer / key gesture. */
export function armAudioOnGesture(): void {
  if (armed || typeof window === 'undefined') return;
  armed = true;
  const unlock = () => {
    try {
      const ctx = ensureCtx();
      if (ctx && ctx.state === 'suspended') void ctx.resume().catch(() => undefined);
    } catch {
      /* ignore */
    }
  };
  window.addEventListener('pointerdown', unlock, { capture: true, passive: true });
  window.addEventListener('keydown', unlock, { capture: true });
}

export function setAudioSettings(s: { volume: number; muted: boolean; ambient: boolean }): void {
  st.volume = Math.max(0, Math.min(1, s.volume));
  st.muted = s.muted;
  try {
    if (st.master && st.ctx) st.master.gain.setTargetAtTime(st.muted ? 0 : st.volume, st.ctx.currentTime, 0.03);
  } catch {
    /* ignore */
  }
  if (s.ambient !== st.ambient) {
    st.ambient = s.ambient;
    if (s.ambient) startAmbient();
    else stopAmbient();
  }
}

function noiseBuffer(ctx: AudioContext): AudioBuffer {
  if (st.noise) return st.noise;
  const len = ctx.sampleRate * 2;
  const b = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = b.getChannelData(0);
  let seed = 12345;
  for (let i = 0; i < len; i++) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    d[i] = (seed / 0x7fffffff) * 2 - 1;
  }
  st.noise = b;
  return b;
}

/** An enveloped oscillator. */
function tone(
  ctx: AudioContext,
  out: AudioNode,
  o: { f: number; f2?: number; type?: OscillatorType; t?: number; dur: number; gain: number; attack?: number },
) {
  const t0 = ctx.currentTime + (o.t ?? 0);
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.f, t0);
  if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t0 + o.dur);
  const a = o.attack ?? 0.005;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(o.gain, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
  osc.connect(g).connect(out);
  osc.start(t0);
  osc.stop(t0 + o.dur + 0.05);
}

/** Filtered noise burst. */
function hiss(
  ctx: AudioContext,
  out: AudioNode,
  o: { t?: number; dur: number; gain: number; type?: BiquadFilterType; f: number; f2?: number; q?: number; attack?: number },
) {
  const t0 = ctx.currentTime + (o.t ?? 0);
  const src = ctx.createBufferSource();
  src.buffer = noiseBuffer(ctx);
  src.loop = true;
  const flt = ctx.createBiquadFilter();
  flt.type = o.type ?? 'bandpass';
  flt.frequency.setValueAtTime(o.f, t0);
  if (o.f2) flt.frequency.exponentialRampToValueAtTime(o.f2, t0 + o.dur);
  flt.Q.value = o.q ?? 1;
  const g = ctx.createGain();
  const a = o.attack ?? 0.01;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(o.gain, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
  src.connect(flt).connect(g).connect(out);
  src.start(t0, Math.random() * 1.5);
  src.stop(t0 + o.dur + 0.05);
}

const RECIPES: Record<Sfx, (ctx: AudioContext, out: AudioNode) => void> = {
  bell: (c, o) => {
    // Small brass shop bell: inharmonic partials, two strikes.
    for (const t of [0, 0.16])
      for (const [f, g] of [
        [1568, 0.22],
        [2350, 0.1],
        [3920, 0.05],
      ] as const)
        tone(c, o, { f, t, dur: 1.1, gain: g * (t ? 0.7 : 1) });
  },
  pour: (c, o) => {
    hiss(c, o, { dur: 0.7, gain: 0.25, f: 900, f2: 1800, q: 2.5, attack: 0.06 });
    hiss(c, o, { dur: 0.6, gain: 0.08, type: 'highpass', f: 3000, attack: 0.05 });
  },
  chop: (c, o) => {
    for (const t of [0, 0.12]) {
      hiss(c, o, { t, dur: 0.07, gain: 0.35, f: 2400, q: 0.8, attack: 0.002 });
      tone(c, o, { t, f: 180, f2: 90, dur: 0.08, gain: 0.25, type: 'triangle', attack: 0.002 });
    }
  },
  clink: (c, o) => {
    tone(c, o, { f: 2600, dur: 0.35, gain: 0.12 });
    tone(c, o, { f: 4100, dur: 0.25, gain: 0.06 });
  },
  plop: (c, o) => {
    tone(c, o, { f: 320, f2: 900, dur: 0.12, gain: 0.25, attack: 0.003 });
    hiss(c, o, { t: 0.03, dur: 0.12, gain: 0.05, f: 1500, q: 3 });
  },
  simmer: (c, o) => {
    for (let i = 0; i < 9; i++) tone(c, o, { t: i * 0.07 + Math.random() * 0.04, f: 300 + Math.random() * 500, f2: 900, dur: 0.06, gain: 0.07 });
    hiss(c, o, { dur: 0.8, gain: 0.05, f: 600, q: 0.7 });
  },
  stir: (c, o) => {
    for (let i = 0; i < 3; i++) tone(c, o, { t: i * 0.18, f: 2900 + i * 120, dur: 0.15, gain: 0.06 });
    hiss(c, o, { dur: 0.6, gain: 0.05, f: 1200, q: 4 });
  },
  tick: (c, o) => {
    tone(c, o, { f: 1200, dur: 0.05, gain: 0.12, type: 'square' });
    hiss(c, o, { t: 0.05, dur: 0.6, gain: 0.04, type: 'highpass', f: 5000 });
  },
  frost: (c, o) => {
    hiss(c, o, { dur: 0.5, gain: 0.1, type: 'highpass', f: 6000, attack: 0.02 });
    tone(c, o, { f: 3500, dur: 0.3, gain: 0.04, t: 0.05 });
  },
  tipout: (c, o) => {
    hiss(c, o, { dur: 0.45, gain: 0.22, f: 1600, f2: 500, q: 2, attack: 0.03 });
  },
  pickup: (c, o) => {
    hiss(c, o, { dur: 0.08, gain: 0.1, f: 3000, q: 1 });
  },
  page: (c, o) => {
    hiss(c, o, { dur: 0.32, gain: 0.18, f: 2500, f2: 5500, q: 0.6, attack: 0.05 });
  },
  coin: (c, o) => {
    for (const t of [0, 0.08]) {
      tone(c, o, { t, f: 2093, dur: 0.25, gain: 0.12, type: 'triangle' });
      tone(c, o, { t, f: 3136, dur: 0.2, gain: 0.06 });
    }
  },
  stamp: (c, o) => {
    tone(c, o, { f: 120, f2: 60, dur: 0.15, gain: 0.45, type: 'triangle', attack: 0.002 });
    hiss(c, o, { dur: 0.06, gain: 0.2, f: 800, q: 0.7, attack: 0.002 });
  },
  confirm: (c, o) => {
    [523, 659, 784, 1047].forEach((f, i) => tone(c, o, { t: i * 0.09, f, dur: 0.9, gain: 0.12, type: 'triangle' }));
    tone(c, o, { t: 0.36, f: 2093, dur: 1.2, gain: 0.05 });
  },
  fail: (c, o) => {
    tone(c, o, { f: 330, f2: 220, dur: 0.45, gain: 0.12, type: 'triangle' });
    tone(c, o, { t: 0.12, f: 262, f2: 196, dur: 0.5, gain: 0.08, type: 'triangle' });
  },
  happy: (c, o) => {
    [659, 880, 1175].forEach((f, i) => tone(c, o, { t: i * 0.07, f, dur: 0.4, gain: 0.1, type: 'triangle' }));
  },
  serve: (c, o) => {
    tone(c, o, { f: 900, dur: 0.12, gain: 0.08, type: 'triangle' });
    hiss(c, o, { dur: 0.1, gain: 0.08, f: 1500, q: 1 });
  },
  glow: (c, o) => {
    [1319, 1760].forEach((f, i) => tone(c, o, { t: i * 0.12, f, dur: 0.7, gain: 0.05 }));
  },
  chapter: (c, o) => {
    for (const [f, g] of [
      [98, 0.3],
      [196, 0.14],
      [293, 0.08],
      [415, 0.05],
    ] as const)
      tone(c, o, { f, dur: 3.2, gain: g, type: 'sine', attack: 0.01 });
    [784, 988, 1175, 1568].forEach((f, i) => tone(c, o, { t: 0.5 + i * 0.16, f, dur: 1.6, gain: 0.035, type: 'triangle', attack: 0.04 }));
    hiss(c, o, { dur: 3, gain: 0.04, type: 'lowpass', f: 500, attack: 1 });
  },
  write: (c, o) => {
    for (let i = 0; i < 4; i++) hiss(c, o, { t: i * 0.07 + Math.random() * 0.03, dur: 0.06, gain: 0.08, f: 3500 + Math.random() * 1500, q: 3, attack: 0.005 });
  },
  lampout: (c, o) => {
    hiss(c, o, { dur: 0.5, gain: 0.16, f: 700, f2: 300, q: 0.8, attack: 0.04 });
    tone(c, o, { t: 0.1, f: 220, f2: 140, dur: 0.6, gain: 0.04, type: 'sine' });
  },
  dawn: (c, o) => {
    // Two small birds: quick rising chirps.
    for (const [t, f] of [
      [0, 3200],
      [0.12, 3600],
      [0.24, 3400],
      [0.7, 2800],
      [0.8, 3300],
    ] as const)
      tone(c, o, { t, f, f2: f * 1.25, dur: 0.08, gain: 0.04, type: 'sine', attack: 0.01 });
    [523, 659, 784].forEach((f, i) => tone(c, o, { t: i * 0.05, f, dur: 1.6, gain: 0.03, type: 'triangle', attack: 0.2 }));
  },
  dusk: (c, o) => {
    [220, 277, 330].forEach((f, i) => tone(c, o, { t: i * 0.08, f, dur: 1.8, gain: 0.05, type: 'triangle', attack: 0.3 }));
  },
  knock: (c, o) => {
    tone(c, o, { f: 140, f2: 90, dur: 0.09, gain: 0.5, type: 'triangle', attack: 0.002 });
    hiss(c, o, { dur: 0.05, gain: 0.25, f: 900, q: 1.2, attack: 0.002 });
  },
  steps: (c, o) => {
    for (let i = 0; i < 6; i++) {
      hiss(c, o, { t: i * 0.24, dur: 0.07, gain: 0.12, f: 500 + (i % 2) * 140, q: 1.5, attack: 0.004 });
      tone(c, o, { t: i * 0.24, f: 90, f2: 60, dur: 0.06, gain: 0.08, type: 'triangle', attack: 0.003 });
    }
  },
  paper: (c, o) => {
    hiss(c, o, { dur: 0.22, gain: 0.14, f: 4000, f2: 2200, q: 0.8, attack: 0.02 });
    hiss(c, o, { t: 0.12, dur: 0.16, gain: 0.08, f: 5200, q: 1, attack: 0.02 });
  },
  drawer: (c, o) => {
    hiss(c, o, { dur: 0.35, gain: 0.12, f: 260, f2: 420, q: 2, attack: 0.03 });
    tone(c, o, { t: 0.32, f: 160, f2: 100, dur: 0.1, gain: 0.25, type: 'triangle', attack: 0.003 });
  },
  whoosh: (c, o) => {
    hiss(c, o, { dur: 0.6, gain: 0.07, f: 400, f2: 1600, q: 0.7, attack: 0.25 });
  },
};

/** Play a sound effect. Silently does nothing when audio is unavailable, locked or muted. */
export function sfx(name: Sfx): void {
  if (st.muted || st.volume <= 0) return;
  try {
    const ctx = st.ctx;
    if (!ctx || !st.master || ctx.state !== 'running') return;
    RECIPES[name](ctx, st.master);
  } catch {
    /* never break the game for a sound */
  }
}

// ---------------------------------------------------------------------------------------------
// Ambient loop: very quiet harbour air (filtered noise swell) + an occasional far-off gull/creak.
// ---------------------------------------------------------------------------------------------

function startAmbient() {
  const ctx = st.ctx;
  if (!ctx || !st.master || st.ambientNodes) return;
  try {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx);
    src.loop = true;
    const lp = ctx.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 380;
    const g = ctx.createGain();
    g.gain.value = 0.035;
    // Slow swell, like waves.
    const lfo = ctx.createOscillator();
    const lfoGain = ctx.createGain();
    lfo.frequency.value = 0.09;
    lfoGain.gain.value = 0.02;
    lfo.connect(lfoGain).connect(g.gain);
    src.connect(lp).connect(g).connect(st.master);
    src.start();
    lfo.start();
    const timer = window.setInterval(() => {
      if (!st.ctx || st.muted || Math.random() < 0.6) return;
      try {
        // A distant gull: two falling whistles.
        const out = st.master!;
        tone(st.ctx, out, { f: 1900, f2: 1300, dur: 0.35, gain: 0.012, type: 'sine', attack: 0.05 });
        tone(st.ctx, out, { t: 0.4, f: 1800, f2: 1200, dur: 0.3, gain: 0.01, type: 'sine', attack: 0.05 });
      } catch {
        /* ignore */
      }
    }, 9000);
    st.ambientNodes = {
      stop() {
        window.clearInterval(timer);
        try {
          src.stop();
          lfo.stop();
          g.disconnect();
        } catch {
          /* ignore */
        }
      },
    };
  } catch {
    st.ambientNodes = null;
  }
}

function stopAmbient() {
  st.ambientNodes?.stop();
  st.ambientNodes = null;
}

/** For tests / debugging: is audio running? */
export function audioState(): string {
  return st.ctx?.state ?? 'none';
}
