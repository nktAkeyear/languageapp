/**
 * The shop interior, drawn in SVG. Desktop composes `ShopBackdrop` (1600×1000 design units);
 * the phone layout composes the same window / door / wall pieces into its own taller strips.
 *
 * Everything is static except what the `sky` (time of day) changes, so the browser can keep the
 * big textured layers cached while small animated layers (steam, lamp glow, customer) move.
 */
import type { SkyColours } from './sky';

export const STAGE_W = 1600;
export const STAGE_H = 1000;
/** Far edge of the counter (where the customer stands behind). */
export const COUNTER_Y = 560;
/** Shelf unit geometry (desktop). */
export const SHELF = { x: 1030, y: 46, w: 552, rows: 4, cols: 6, rowH: 120 } as const;

/** Window with the harbour outside. Local box 0..260 × 0..310. */
export function WindowGroup({ sky, x, y, w = 260, h = 310 }: { sky: SkyColours; x: number; y: number; w?: number; h?: number }) {
  const sunY = 20 + (1 - sky.sun) * (h * 0.62);
  const horizon = h * 0.66;
  return (
    <g transform={`translate(${x} ${y})`}>
      <defs>
        <linearGradient id={`sky-${x}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky.top} />
          <stop offset="1" stopColor={sky.bottom} />
        </linearGradient>
        <clipPath id={`win-${x}`}>
          <rect x="14" y="14" width={w - 28} height={h - 28} rx="4" />
        </clipPath>
      </defs>
      <g clipPath={`url(#win-${x})`}>
        <rect x="0" y="0" width={w} height={h} fill={`url(#sky-${x})`} />
        <circle cx={w * 0.7} cy={sunY} r="22" fill="#fff6d8" opacity="0.9" />
        <circle cx={w * 0.7} cy={sunY} r="40" fill="#fff2c0" opacity="0.25" />
        {/* clouds */}
        <g fill="#fff" opacity="0.55">
          <ellipse cx={w * 0.25} cy={h * 0.2} rx="34" ry="9" />
          <ellipse cx={w * 0.33} cy={h * 0.18} rx="20" ry="9" />
          <ellipse cx={w * 0.8} cy={h * 0.32} rx="26" ry="6" />
        </g>
        {/* far hills and the lighthouse */}
        <path d={`M0 ${horizon - 12} Q${w * 0.2} ${horizon - 40} ${w * 0.42} ${horizon - 16} Q${w * 0.6} ${horizon - 6} ${w} ${horizon - 22} L${w} ${horizon} L0 ${horizon} Z`} fill="#6c8a8a" opacity="0.6" />
        <g transform={`translate(${w * 0.16} ${horizon - 70})`}>
          <path d="M6 0 h10 l4 56 h-18 Z" fill="#f2ebe0" stroke="#5a4a3a" strokeWidth="1" />
          <path d="M5 18 h12 M4 34 h14" stroke="#b8442e" strokeWidth="5" />
          <rect x="4" y="-8" width="14" height="9" fill="#3a3430" />
          <circle cx="11" cy="-4" r="3" fill="#ffe08a" className="lighthouse" />
        </g>
        {/* sea */}
        <rect x="0" y={horizon} width={w} height={h - horizon} fill={sky.sea} />
        {[0, 1, 2, 3].map((i) => (
          <path key={i} className="wave" d={`M${-20 + i * 9} ${horizon + 12 + i * 16} q15 -5 30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0 t30 0`} stroke="#fff" strokeOpacity="0.35" strokeWidth="2" fill="none" />
        ))}
        {/* boat */}
        <g className="boat" transform={`translate(${w * 0.55} ${horizon - 4})`}>
          <path d="M-26 0 L26 0 L18 10 L-18 10 Z" fill="#5a3a22" />
          <line x1="0" y1="0" x2="0" y2="-46" stroke="#3a2a1a" strokeWidth="2" />
          <path d="M2 -44 L24 -6 L2 -6 Z" fill="#f4ecd8" />
          <path d="M-2 -40 L-20 -8 L-2 -8 Z" fill="#e9dcc0" />
        </g>
        {/* gulls */}
        <path d={`M${w * 0.38} ${h * 0.3} q6 -6 12 0 q6 -6 12 0 M${w * 0.5} ${h * 0.24} q4 -4 8 0 q4 -4 8 0`} stroke="#3a3a3a" strokeWidth="1.6" fill="none" className="gulls" />
      </g>
      {/* glass sheen */}
      <path d={`M24 ${h - 30} L${w * 0.45} 24 L${w * 0.55} 24 L44 ${h - 30} Z`} fill="#fff" opacity="0.08" />
      {/* frame + mullions */}
      <rect x="0" y="0" width={w} height={h} rx="6" fill="none" stroke="#6b4222" strokeWidth="18" />
      <rect x="0" y="0" width={w} height={h} rx="6" fill="none" stroke="#8e5a2e" strokeWidth="10" />
      <path d={`M${w / 2} 10 V${h - 10} M10 ${h * 0.36} H${w - 10} M10 ${h * 0.68} H${w - 10}`} stroke="#7a4a26" strokeWidth="9" />
      <path d={`M${w / 2 - 3} 10 V${h - 10}`} stroke="#a8703c" strokeWidth="2" />
      {/* sill with a small plant */}
      <rect x="-22" y={h - 4} width={w + 44} height="22" rx="4" fill="#9a6232" stroke="#5a3418" strokeWidth="2" />
      <rect x="-22" y={h - 4} width={w + 44} height="6" rx="3" fill="#c48a52" />
      <g transform={`translate(${w - 50} ${h - 4})`}>
        <path d="M-14 -26 h28 l-3 26 h-22 Z" fill="url(#gl-terracotta)" stroke="#6b2414" strokeWidth="1.5" />
        <path d="M0 -26 Q-14 -50 -22 -54 M0 -26 Q4 -56 14 -62 M0 -26 Q16 -40 26 -42" stroke="#4d6a38" strokeWidth="3" fill="none" />
        <ellipse cx="-22" cy="-54" rx="9" ry="5" fill="#6fa64a" transform="rotate(-30 -22 -54)" />
        <ellipse cx="14" cy="-62" rx="9" ry="5" fill="#7fb35a" transform="rotate(-60 14 -62)" />
        <ellipse cx="26" cy="-42" rx="9" ry="5" fill="#6fa64a" transform="rotate(10 26 -42)" />
      </g>
    </g>
  );
}

/** Shop door with a glass pane and the brass bell on a bracket. Local box 0..160 × 0..450. */
export function DoorGroup({ sky, x, y, w = 160, h = 450 }: { sky: SkyColours; x: number; y: number; w?: number; h?: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-14" y="-14" width={w + 28} height={h + 14} fill="#5a3418" />
      <rect x="-10" y="-10" width={w + 20} height={h + 10} fill="#7a4a26" filter="url(#tx-wood-v)" />
      <rect x="0" y="0" width={w} height={h} fill="url(#g-door)" stroke="#2f4036" strokeWidth="3" />
      <rect x="18" y="18" width={w - 36} height={h * 0.36} rx="4" fill={sky.bottom} stroke="#2f4036" strokeWidth="5" />
      <rect x="18" y="18" width={w - 36} height={h * 0.36} rx="4" fill="#fff" opacity="0.15" />
      <path d={`M${w / 2} 18 V${18 + h * 0.36} M18 ${18 + h * 0.18} H${w - 18}`} stroke="#2f4036" strokeWidth="5" />
      <rect x="22" y={h * 0.46} width={w - 44} height={h * 0.2} rx="3" fill="none" stroke="#3a5044" strokeWidth="3" />
      <rect x="22" y={h * 0.7} width={w - 44} height={h * 0.24} rx="3" fill="none" stroke="#3a5044" strokeWidth="3" />
      <circle cx={w - 24} cy={h * 0.56} r="7" fill="url(#g-brass)" stroke="#5a3c12" />
      {/* "open" card hanging in the pane */}
      <g transform={`translate(${w / 2} ${18 + h * 0.27})`}>
        <path d="M-22 -18 L0 -30 L22 -18" stroke="#3a2a1a" strokeWidth="1.2" fill="none" />
        <rect x="-26" y="-18" width="52" height="22" rx="3" fill="#f4ead2" stroke="#8a7350" />
        <text x="0" y="-3" textAnchor="middle" fontSize="13" fill="#7a2f1b" style={{ fontFamily: 'var(--font-serif)' }} fontWeight="700">
          営業中
        </text>
      </g>
    </g>
  );
}

/** The brass bell on its bracket at the door's top-right corner (animated layer). */
export function DoorBellGroup({ x, y, ringing }: { x: number; y: number; ringing: boolean }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d="M-6 -12 Q14 -14 18 4" stroke="#3a2a1a" strokeWidth="3" fill="none" />
      <g className={ringing ? 'doorbell ring' : 'doorbell'} style={{ transformOrigin: `${x + 18}px ${y + 4}px` }}>
        <line x1="18" y1="4" x2="18" y2="12" stroke="#3a2a1a" strokeWidth="2" />
        <path d="M8 30 Q8 12 18 12 Q28 12 28 30 Z" fill="url(#g-brass)" stroke="#5a3c12" strokeWidth="1.5" />
        <circle cx="18" cy="32" r="3" fill="#7d5a1c" />
      </g>
    </g>
  );
}

/** Wall shelf frame (boards + back). Jars are HTML on top so they can be dragged. */
export function ShelfUnitGroup({ x, y, w, rows, rowH }: { x: number; y: number; w: number; rows: number; rowH: number }) {
  const h = rows * rowH + 18;
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect x="-6" y="-6" width={w + 12} height={h + 12} fill="#2a160a" opacity="0.4" filter="url(#fx-blur)" />
      <rect x="0" y="0" width={w} height={h} fill="url(#g-shelfback)" filter="url(#tx-wood-v)" />
      {/* vertical planks on the back */}
      {Array.from({ length: 7 }, (_, i) => (
        <line key={i} x1={(w / 7) * (i + 1)} y1="0" x2={(w / 7) * (i + 1)} y2={h} stroke="#3a1f0e" strokeWidth="2" opacity="0.45" />
      ))}
      <rect x="0" y="0" width={w} height={h} fill="url(#g-vignette)" opacity="0.6" />
      {/* side posts */}
      <rect x="-16" y="-20" width="18" height={h + 30} fill="#7a4a26" stroke="#3a1f0e" strokeWidth="2" filter="url(#tx-wood-v)" />
      <rect x={w - 2} y="-20" width="18" height={h + 30} fill="#6b4222" stroke="#3a1f0e" strokeWidth="2" filter="url(#tx-wood-v)" />
      {/* crown */}
      <rect x="-26" y="-30" width={w + 52} height="18" rx="3" fill="#8e5a2e" stroke="#3a1f0e" strokeWidth="2" />
      <rect x="-26" y="-30" width={w + 52} height="5" rx="2" fill="#c48a52" />
      {/* boards */}
      {Array.from({ length: rows }, (_, r) => {
        const by = (r + 1) * rowH;
        return (
          <g key={r}>
            <rect x="-4" y={by - 2} width={w + 8} height="14" fill="url(#g-shelfboard)" stroke="#3a1f0e" strokeWidth="1.5" />
            <rect x="-4" y={by + 12} width={w + 8} height="10" fill="#000" opacity="0.18" filter="url(#fx-blur-sm)" />
            <path d={`M10 ${by + 12} l10 18 M${w - 10} ${by + 12} l-10 18`} stroke="#3a2a1a" strokeWidth="3" />
          </g>
        );
      })}
    </g>
  );
}

/** Hanging oil lamp (glow is a separate animated layer). */
export function LampGroup({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <line x1="0" y1="-60" x2="0" y2="0" stroke="#2a1a10" strokeWidth="3" />
      <path d="M-18 0 L18 0 L12 10 L-12 10 Z" fill="url(#g-brass)" stroke="#5a3c12" />
      <path d="M-14 10 Q-20 36 -10 52 L10 52 Q20 36 14 10 Z" fill="#ffe7b0" opacity="0.92" stroke="#c99a3c" strokeWidth="2" />
      <path d="M-4 30 Q0 18 4 30 Q2 38 0 40 Q-2 38 -4 30 Z" fill="#ff9a2a" className="lamp-flame" />
      <path d="M-16 52 L16 52 L10 62 L-10 62 Z" fill="url(#g-brass)" stroke="#5a3c12" />
    </g>
  );
}

/**
 * The desktop backdrop in two layers: `ShopBackdrop` is static and carries the texture filters
 * (plaster, wood grain); `ShopLive` has no filters and holds everything that moves (sea, boat,
 * bell, lamp flame) and what changes with the time of day, so animation frames never re-run
 * the expensive texture filters.
 */
export function ShopBackdrop({ sky }: { sky: SkyColours }) {
  const W = STAGE_W;
  const H = STAGE_H;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="backdrop" preserveAspectRatio="xMidYMid slice" aria-hidden>
      {/* wall */}
      <rect x="0" y="0" width={W} height={COUNTER_Y + 10} fill="url(#g-wall)" filter="url(#tx-plaster)" />
      {/* wainscot */}
      <rect x="0" y="440" width={W} height={COUNTER_Y - 430} fill="url(#g-wainscot)" filter="url(#tx-wood-v)" />
      <rect x="0" y="432" width={W} height="12" fill="#8e5a2e" stroke="#4a2c12" />
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={20 + i * 100} y="458" width="80" height="90" rx="3" fill="none" stroke="#3a1f0e" strokeWidth="2" opacity="0.5" />
      ))}
      {/* ceiling beam band */}
      <rect x="0" y="0" width={W} height="36" fill="url(#g-beam)" />
      {Array.from({ length: 9 }, (_, i) => (
        <rect key={i} x={i * 190 - 10} y="0" width="46" height="48" fill="#2e180a" />
      ))}
      <rect x="0" y="34" width={W} height="10" fill="#000" opacity="0.2" filter="url(#fx-blur-sm)" />
      {/* reveal of the window opening */}
      <rect x="30" y="80" width="280" height="336" rx="8" fill="#3a2010" opacity="0.35" filter="url(#fx-blur-sm)" />
      <DoorGroup sky={sky} x={410} y={118} h={COUNTER_Y - 118} />
      <ShelfUnitGroup x={SHELF.x} y={SHELF.y} w={SHELF.w} rows={SHELF.rows} rowH={SHELF.rowH} />
      {/* counter top (near surface) */}
      <rect x="0" y={COUNTER_Y} width={W} height={H - COUNTER_Y} fill="url(#g-counter)" filter="url(#tx-wood)" />
      {Array.from({ length: 5 }, (_, i) => {
        const y = COUNTER_Y + 34 + i * i * 22 + i * 40;
        return <line key={i} x1="0" y1={y} x2={W} y2={y} stroke="#4a2a12" strokeWidth={1 + i * 0.5} opacity="0.35" />;
      })}
      <rect x="0" y={COUNTER_Y - 8} width={W} height="16" fill="url(#g-counter-edge)" />
      <rect x="0" y={COUNTER_Y + 8} width={W} height="16" fill="#000" opacity="0.18" filter="url(#fx-blur-sm)" />
    </svg>
  );
}

export function ShopLive({ sky, ringing }: { sky: SkyColours; ringing: boolean }) {
  const W = STAGE_W;
  const H = STAGE_H;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="backdrop" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <path d={`M40 ${90} L300 ${90} L560 ${COUNTER_Y} L80 ${COUNTER_Y} Z`} fill={sky.light} opacity={sky.shaft * 0.18} />
      <WindowGroup sky={sky} x={40} y={90} />
      <DoorBellGroup x={576} y={128} ringing={ringing} />
      <LampGroup x={620} y={60} />
      <path d={`M80 ${COUNTER_Y} L560 ${COUNTER_Y} L900 ${H} L120 ${H} Z`} fill={sky.light} opacity={sky.shaft * 0.08} />
      <rect x="0" y="0" width={W} height={H} fill="url(#g-vignette)" />
    </svg>
  );
}

/** Phone: the wall strip behind the customer (static textured layer + a small live layer). */
export function MobileWall({ sky, ringing }: { sky: SkyColours; ringing: boolean }) {
  const W = 400;
  const H = 320;
  return (
    <>
      <svg viewBox={`0 0 ${W} ${H}`} className="backdrop" preserveAspectRatio="xMidYMax slice" aria-hidden>
        <rect x="0" y="0" width={W} height={H} fill="url(#g-wall)" filter="url(#tx-plaster)" />
        <rect x="0" y={H - 70} width={W} height="70" fill="url(#g-wainscot)" filter="url(#tx-wood-v)" />
        <rect x="0" y={H - 76} width={W} height="8" fill="#8e5a2e" />
        <rect x="0" y="0" width={W} height="18" fill="url(#g-beam)" />
        <DoorGroup sky={sky} x={34} y={84} w={124} h={H - 84} />
      </svg>
      <svg viewBox={`0 0 ${W} ${H}`} className="backdrop" preserveAspectRatio="xMidYMax slice" aria-hidden>
        <path d={`M${W} 40 L${W - 120} 40 L${W - 260} ${H} L${W} ${H} Z`} fill={sky.light} opacity={sky.shaft * 0.2} />
        <DoorBellGroup x={164} y={94} ringing={ringing} />
        <rect x="0" y="0" width={W} height={H} fill="url(#g-vignette)" opacity="0.7" />
      </svg>
    </>
  );
}
/** Phone: counter top texture. */
export function CounterSurface() {
  return (
    <svg viewBox="0 0 400 400" className="backdrop" preserveAspectRatio="none" aria-hidden>
      <rect x="0" y="0" width="400" height="400" fill="url(#g-counter)" filter="url(#tx-wood)" />
      {[60, 150, 270].map((y, i) => (
        <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#4a2a12" strokeWidth={1 + i * 0.5} opacity="0.3" />
      ))}
      <rect x="0" y="0" width="400" height="10" fill="url(#g-counter-edge)" />
    </svg>
  );
}
