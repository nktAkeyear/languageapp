/**
 * Art of the kitchen, the office and the inn: interiors, food, documents (SVG, no files).
 */
import type { ReactNode } from 'react';

type Sky = { top: string; bottom: string };

function WindowSky({ id, sky, x, y, w, h }: { id: string; sky: Sky; x: number; y: number; w: number; h: number }) {
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky.top} />
          <stop offset="1" stopColor={sky.bottom} />
        </linearGradient>
      </defs>
      <rect x={x} y={y} width={w} height={h} fill={`url(#${id})`} stroke="#5a3a22" strokeWidth="10" />
      <path d={`M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}`} stroke="#5a3a22" strokeWidth="7" />
    </g>
  );
}

/** The harbour kitchen: white tiles, a range with pots, hanging pans, a hatch to the dining room. */
export function KitchenBackdrop({ sky }: { sky: Sky }) {
  return (
    <svg viewBox="0 0 1600 1000" className="job-backdrop" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <pattern id="jb-ktiles" width="36" height="36" patternUnits="userSpaceOnUse">
          <rect width="36" height="36" fill="#f4f1ea" />
          <rect width="36" height="36" fill="none" stroke="#d8d2c4" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="1600" height="1000" fill="url(#jb-ktiles)" />
      <WindowSky id="jb-k-sky" sky={sky} x={90} y={80} w={300} h={240} />
      {/* hanging rail with pans */}
      <path d="M520 120 H1080" stroke="#5a5a62" strokeWidth="8" />
      {[580, 700, 820, 960].map((x, i) => (
        <g key={x} transform={`translate(${x} 124)`}>
          <path d="M0 0 v24" stroke="#3a3a42" strokeWidth="3" />
          {i % 2 ? (
            <g>
              <circle cy="64" r="38" fill="#3a3a42" stroke="#1a1a20" strokeWidth="4" />
              <rect x="-4" y="22" width="8" height="10" fill="#6b4a2a" />
            </g>
          ) : (
            <g>
              <rect x="-6" y="20" width="12" height="40" rx="4" fill="#8a5a2e" />
              <ellipse cy="92" rx="30" ry="32" fill="#b87a4a" stroke="#5a3a1a" strokeWidth="4" />
            </g>
          )}
        </g>
      ))}
      {/* range */}
      <rect x="1150" y="300" width="380" height="420" fill="#3a3a42" stroke="#1a1a20" strokeWidth="5" />
      <rect x="1170" y="320" width="340" height="40" fill="#5a5a62" />
      {[1230, 1400].map((x) => (
        <g key={x}>
          <rect x={x - 60} y="220" width="120" height="90" rx="8" fill="#c0c4c8" stroke="#5a5a62" strokeWidth="4" />
          <g className="hub-smoke" opacity="0.5">
            <circle cx={x - 10} cy="196" r="14" fill="#fff" />
            <circle cx={x + 14} cy="170" r="18" fill="#fff" />
          </g>
        </g>
      ))}
      <rect x="1200" y="430" width="280" height="200" rx="8" fill="#1a1a20" stroke="#5a5a62" strokeWidth="4" />
      <path d="M1230 560 q20 -40 40 0 q20 -50 40 0 q20 -40 40 0 q20 -50 40 0 q20 -40 40 0" fill="#f2a040" opacity="0.8" />
      {/* the hatch to the dining room */}
      <rect x="470" y="330" width="560" height="200" fill="#e6d2b0" stroke="#6b4a2a" strokeWidth="8" />
      <rect x="490" y="350" width="520" height="160" fill="#c8a878" />
      {[560, 700, 840, 960].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="470" rx="40" ry="14" fill="#8a5a2e" />
          <rect x={x - 4} y="470" width="8" height="40" fill="#6b4222" />
        </g>
      ))}
      <rect y="760" width="1600" height="240" fill="#b8b0a0" />
      <rect y="744" width="1600" height="30" fill="#d8d0c0" stroke="#7a7468" strokeWidth="3" />
    </svg>
  );
}

/** The trading company's office: a tall window, filing cabinets, a wall calendar and a map. */
export function OfficeBackdrop({ sky }: { sky: Sky }) {
  return (
    <svg viewBox="0 0 1600 1000" className="job-backdrop" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="1600" height="1000" fill="#e9e4d8" />
      <rect y="560" width="1600" height="200" fill="#c8b89a" />
      <rect y="552" width="1600" height="12" fill="#7a6a4a" />
      <WindowSky id="jb-o-sky" sky={sky} x={80} y={60} w={260} h={420} />
      {/* ships through the window */}
      <path d="M90 400 H330 V474 H90 Z" fill="#5f9ab8" opacity="0.8" />
      <path d="M150 400 l20 -40 l4 40 Z" fill="#f4ecd8" />
      {/* map of the coast */}
      <g transform="translate(470 90)">
        <rect width="360" height="240" fill="#f2e6c8" stroke="#6b4a2a" strokeWidth="8" />
        <path d="M20 180 q60 -80 140 -40 q80 40 180 -60 V220 H20 Z" fill="#9ac0d4" />
        <path d="M60 120 l40 20 l60 -30 l80 40" stroke="#b8452f" strokeWidth="3" strokeDasharray="8 6" fill="none" />
        {[60, 160, 240].map((x, i) => (
          <circle key={x} cx={x} cy={[120, 110, 150][i]} r="6" fill="#b8452f" />
        ))}
      </g>
      {/* filing cabinets */}
      {[1180, 1330].map((x) => (
        <g key={x}>
          <rect x={x} y="250" width="130" height="310" fill="#7a8a7a" stroke="#3a4a3a" strokeWidth="4" />
          {[0, 1, 2, 3].map((r) => (
            <g key={r}>
              <rect x={x + 10} y={262 + r * 74} width="110" height="62" fill="#8a9a8a" stroke="#3a4a3a" strokeWidth="2" />
              <rect x={x + 50} y={286 + r * 74} width="30" height="8" rx="3" fill="#c8c0b0" />
            </g>
          ))}
        </g>
      ))}
      {/* wall calendar */}
      <g transform="translate(900 110)">
        <rect width="200" height="220" fill="#fbf8f2" stroke="#5a5448" strokeWidth="4" />
        <rect width="200" height="40" fill="#b8452f" />
        {Array.from({ length: 20 }, (_, i) => (
          <rect key={i} x={14 + (i % 5) * 36} y={56 + Math.floor(i / 5) * 38} width="28" height="28" fill="none" stroke="#c8c0b0" strokeWidth="2" />
        ))}
      </g>
      {/* desk */}
      <rect y="760" width="1600" height="240" fill="#6b4222" />
      <rect y="744" width="1600" height="26" fill="#8e5a2e" stroke="#3a1f0e" strokeWidth="3" />
    </svg>
  );
}

/** The inn's lobby: the key board, stairs, a fern, the desk. */
export function InnBackdrop({ sky }: { sky: Sky }) {
  return (
    <svg viewBox="0 0 1600 1000" className="job-backdrop" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="1600" height="1000" fill="#e8d6b4" />
      <rect y="0" width="1600" height="40" fill="#7a3e32" />
      {Array.from({ length: 20 }, (_, i) => (
        <path key={i} d={`M${i * 80} 40 V560`} stroke="#d8c49e" strokeWidth="3" />
      ))}
      <WindowSky id="jb-i-sky" sky={sky} x={70} y={90} w={260} h={300} />
      {/* key board */}
      <g transform="translate(480 100)">
        <rect width="380" height="250" fill="#8e5a2e" stroke="#3a1f0e" strokeWidth="6" />
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i} transform={`translate(${30 + (i % 6) * 56} ${40 + Math.floor(i / 6) * 100})`}>
            <circle r="6" fill="#d9b54a" />
            <path d="M0 6 v34 M0 30 h8 M0 38 h6" stroke="#d9b54a" strokeWidth="4" />
            <rect x="-14" y="44" width="28" height="18" rx="3" fill="#f6ecd2" />
          </g>
        ))}
      </g>
      {/* stairs */}
      <g transform="translate(1100 140)">
        {Array.from({ length: 8 }, (_, i) => (
          <rect key={i} x={i * 50} y={400 - i * 50} width={400 - i * 50} height="50" fill="#a8703c" stroke="#5a3418" strokeWidth="3" />
        ))}
        <path d="M0 420 L400 20" stroke="#5a3418" strokeWidth="8" />
      </g>
      {/* fern */}
      <g transform="translate(980 560)">
        <path d="M-30 0 h60 l-8 50 h-44 Z" fill="#b8573a" stroke="#4a1f12" strokeWidth="3" />
        {[-60, -30, 0, 30, 60].map((a) => (
          <path key={a} d="M0 0 q0 -80 -10 -130" stroke="#4d7a3a" strokeWidth="8" fill="none" transform={`rotate(${a})`} />
        ))}
      </g>
      <rect y="560" width="1600" height="200" fill="#9a6a4a" />
      {/* desk */}
      <rect y="760" width="1600" height="240" fill="#5a3418" />
      <rect y="744" width="1600" height="26" fill="#7a4a24" stroke="#2a1408" strokeWidth="3" />
    </svg>
  );
}

// ------------------------------------------------------------------------------------- food

export const KITCHEN_FOODS = new Set(['egg', 'bread', 'rice', 'fish', 'chicken', 'potato', 'carrot', 'onion', 'tomato', 'cheese', 'sausage', 'noodles', 'soup', 'milk', 'butter', 'salad', 'plate', 'bowl', 'lunchbox', 'pan', 'pot', 'grill', 'fridge', 'shelf', 'basket', 'apple', 'juice', 'salt', 'sugar', 'honey', 'mushroom', 'cabbage', 'cup', 'glass', 'tray', 'bag', 'steamer', 'oven', 'roast']);

export function FoodArt({ art, size = 64 }: { art: string; size?: number }) {
  const s = '#3a2a1a';
  const f: Record<string, ReactNode> = {
    egg: (
      <g>
        <ellipse cx="32" cy="34" rx="16" ry="20" fill="#fbf6ea" stroke={s} strokeWidth="2.5" />
        <ellipse cx="27" cy="26" rx="4" ry="6" fill="#fff" opacity="0.8" />
      </g>
    ),
    bread: (
      <g>
        <path d="M8 40 q0 -22 24 -22 q24 0 24 22 v8 H8 Z" fill="#d9a050" stroke={s} strokeWidth="2.5" />
        <path d="M20 26 l4 8 M30 22 l3 9 M40 25 l2 8" stroke="#8a5a20" strokeWidth="2" />
      </g>
    ),
    rice: (
      <g>
        <path d="M10 34 h44 q-4 20 -22 20 q-18 0 -22 -20 Z" fill="#e8e0d0" stroke={s} strokeWidth="2.5" />
        <path d="M12 34 q20 -18 40 0" fill="#fbfaf4" stroke={s} strokeWidth="2" />
        {[20, 28, 36, 44, 24, 32, 40].map((x, i) => (
          <ellipse key={i} cx={x} cy={i < 4 ? 30 : 26} rx="2.5" ry="1.4" fill="#d8d0c0" />
        ))}
      </g>
    ),
    fish: (
      <g>
        <path d="M8 32 q20 -18 40 0 q-20 18 -40 0 Z" fill="#8ab0c8" stroke={s} strokeWidth="2.5" />
        <path d="M48 32 l10 -10 v20 Z" fill="#8ab0c8" stroke={s} strokeWidth="2.5" />
        <circle cx="18" cy="30" r="2.5" fill={s} />
      </g>
    ),
    chicken: (
      <g>
        <path d="M14 40 q-6 -18 14 -22 q20 -2 22 14 q2 16 -18 16 q-14 0 -18 -8 Z" fill="#d98a4a" stroke={s} strokeWidth="2.5" />
        <path d="M44 22 l8 -8 M48 26 l9 -6" stroke="#f6ecd2" strokeWidth="5" strokeLinecap="round" />
      </g>
    ),
    potato: (
      <g>
        <ellipse cx="32" cy="34" rx="20" ry="14" fill="#c8a06a" stroke={s} strokeWidth="2.5" />
        {[[24, 30], [36, 36], [40, 28]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.6" fill="#7a5a2a" />
        ))}
      </g>
    ),
    carrot: (
      <g>
        <path d="M20 22 L46 52 Q34 38 24 20 Z" fill="#e8742a" stroke={s} strokeWidth="2.5" />
        <path d="M22 20 q-6 -10 -12 -8 M24 18 q0 -10 4 -12 M22 20 q-10 0 -12 4" stroke="#4d7a3a" strokeWidth="3" fill="none" />
      </g>
    ),
    onion: (
      <g>
        <path d="M32 14 q22 18 14 34 q-6 8 -14 8 q-8 0 -14 -8 q-8 -16 14 -34 Z" fill="#e8c8a8" stroke={s} strokeWidth="2.5" />
        <path d="M32 18 v36 M24 26 q-4 14 4 26 M40 26 q4 14 -4 26" stroke="#b8946a" strokeWidth="1.5" fill="none" />
      </g>
    ),
    tomato: (
      <g>
        <circle cx="32" cy="36" r="18" fill="#d8402a" stroke={s} strokeWidth="2.5" />
        <path d="M24 20 l8 4 l8 -4 l-4 6 h-8 Z" fill="#4d7a3a" />
      </g>
    ),
    cheese: (
      <g>
        <path d="M8 44 L32 18 L56 34 V48 H8 Z" fill="#f2c840" stroke={s} strokeWidth="2.5" />
        <circle cx="24" cy="40" r="3" fill="#d9a520" />
        <circle cx="40" cy="38" r="4" fill="#d9a520" />
      </g>
    ),
    sausage: (
      <g>
        <path d="M10 38 q2 -14 22 -14 q20 0 22 14 q-2 6 -8 2 q-6 -6 -14 -6 q-8 0 -14 6 q-6 4 -8 -2 Z" fill="#a84a2a" stroke={s} strokeWidth="2.5" />
      </g>
    ),
    noodles: (
      <g>
        <path d="M10 34 h44 q-4 20 -22 20 q-18 0 -22 -20 Z" fill="#c8402a" stroke={s} strokeWidth="2.5" />
        {[16, 22, 28, 34, 40, 46].map((x) => (
          <path key={x} d={`M${x} 34 q3 -10 0 -18`} stroke="#f2d080" strokeWidth="2.5" fill="none" />
        ))}
      </g>
    ),
    soup: (
      <g>
        <path d="M10 30 h44 q-4 22 -22 22 q-18 0 -22 -22 Z" fill="#fbf6ea" stroke={s} strokeWidth="2.5" />
        <ellipse cx="32" cy="30" rx="22" ry="5" fill="#e8a040" />
      </g>
    ),
    milk: (
      <g>
        <path d="M22 14 h20 v8 l6 8 v26 h-32 v-26 l6 -8 Z" fill="#fbfaf4" stroke={s} strokeWidth="2.5" />
        <rect x="16" y="36" width="32" height="10" fill="#5f9ab8" />
      </g>
    ),
    butter: (
      <g>
        <path d="M10 40 L22 28 H54 L42 40 Z" fill="#f6e08a" stroke={s} strokeWidth="2.5" />
        <path d="M10 40 V48 H42 V40 M42 48 L54 36 V28" fill="#f2d070" stroke={s} strokeWidth="2.5" />
      </g>
    ),
    salad: (
      <g>
        <path d="M10 34 h44 q-4 20 -22 20 q-18 0 -22 -20 Z" fill="#e8e0d0" stroke={s} strokeWidth="2.5" />
        <path d="M14 34 q4 -16 12 -8 q4 -12 12 -2 q8 -10 12 10 Z" fill="#7aa63a" stroke="#4d7a3a" strokeWidth="2" />
      </g>
    ),
    apple: (
      <g>
        <path d="M32 22 q-16 -8 -20 8 q-4 18 12 24 q4 2 8 0 q4 2 8 0 q16 -6 12 -24 q-4 -16 -20 -8 Z" fill="#c8322a" stroke={s} strokeWidth="2.5" />
        <path d="M32 22 q0 -8 4 -12" stroke="#6b4a2a" strokeWidth="2.5" fill="none" />
        <path d="M36 14 q8 -4 12 2 q-8 4 -12 -2 Z" fill="#4d7a3a" />
        <ellipse cx="22" cy="32" rx="3" ry="6" fill="#fff" opacity="0.35" />
      </g>
    ),
    juice: (
      <g>
        <path d="M18 14 h28 l-4 42 h-20 Z" fill="#fbfaf4" stroke={s} strokeWidth="2.5" opacity="0.9" />
        <path d="M20 26 h24 l-3 28 h-18 Z" fill="#f2a040" />
        <path d="M36 14 l8 -8" stroke="#c8322a" strokeWidth="3" />
      </g>
    ),
    salt: (
      <g>
        <path d="M20 22 h24 v32 q0 4 -4 4 h-16 q-4 0 -4 -4 Z" fill="#fbfaf4" stroke={s} strokeWidth="2.5" />
        <path d="M20 22 q0 -12 12 -12 q12 0 12 12 Z" fill="#c0c4c8" stroke={s} strokeWidth="2.5" />
        {[[28, 16], [32, 13], [36, 16]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.5" fill={s} />
        ))}
        <rect x="22" y="34" width="20" height="10" fill="#5f9ab8" />
      </g>
    ),
    sugar: (
      <g>
        <path d="M14 20 h36 l-4 36 h-28 Z" fill="#f2e8d0" stroke={s} strokeWidth="2.5" />
        <path d="M14 20 q18 -10 36 0" stroke={s} strokeWidth="2" fill="#e8dcc0" />
        <rect x="22" y="30" width="8" height="8" fill="#fff" stroke={s} strokeWidth="1.5" />
        <rect x="32" y="36" width="8" height="8" fill="#fff" stroke={s} strokeWidth="1.5" />
      </g>
    ),
    honey: (
      <g>
        <path d="M16 24 q0 -4 4 -4 h24 q4 0 4 4 v28 q0 6 -6 6 h-20 q-6 0 -6 -6 Z" fill="#e8a020" stroke={s} strokeWidth="2.5" opacity="0.95" />
        <rect x="18" y="12" width="28" height="9" rx="2" fill="#8a5a2e" stroke={s} strokeWidth="2" />
        <path d="M22 36 h20 l-4 8 h-12 Z" fill="#fbf6ea" opacity="0.8" />
      </g>
    ),
    mushroom: (
      <g>
        <path d="M10 32 q2 -20 22 -20 q20 0 22 20 Z" fill="#a8764a" stroke={s} strokeWidth="2.5" />
        <path d="M24 32 h16 l-2 20 q-6 4 -12 0 Z" fill="#f2e8d0" stroke={s} strokeWidth="2.5" />
        <circle cx="24" cy="22" r="3" fill="#e8d0b0" />
        <circle cx="38" cy="20" r="2.5" fill="#e8d0b0" />
      </g>
    ),
    cabbage: (
      <g>
        <circle cx="32" cy="36" r="20" fill="#9cc860" stroke={s} strokeWidth="2.5" />
        <path d="M32 18 q-10 10 -4 30 M32 18 q12 10 6 30 M16 30 q10 2 16 16 M48 30 q-10 2 -16 16" stroke="#5f8a3a" strokeWidth="2" fill="none" />
      </g>
    ),
    cup: (
      <g>
        <path d="M14 22 h32 v18 q0 14 -16 14 q-16 0 -16 -14 Z" fill="#fbfaf4" stroke={s} strokeWidth="2.5" />
        <path d="M46 26 q12 0 10 10 q-2 8 -10 6" stroke={s} strokeWidth="2.5" fill="none" />
        <ellipse cx="32" cy="58" rx="22" ry="3" fill="#e8dcc8" stroke={s} strokeWidth="1.5" />
      </g>
    ),
    glass: <path d="M18 10 h28 l-4 46 h-20 Z" fill="#e8f2f6" stroke={s} strokeWidth="2.5" opacity="0.9" />,
    tray: (
      <g>
        <path d="M4 34 h56 l-6 14 h-44 Z" fill="#a8763e" stroke={s} strokeWidth="2.5" />
        <rect x="2" y="30" width="60" height="6" rx="3" fill="#c49a5e" stroke={s} strokeWidth="2" />
      </g>
    ),
    bag: (
      <g>
        <path d="M14 22 h36 l4 34 h-44 Z" fill="#d9b880" stroke={s} strokeWidth="2.5" />
        <path d="M22 22 q0 -12 10 -12 q10 0 10 12" stroke={s} strokeWidth="2.5" fill="none" />
        <path d="M14 30 h36" stroke="#a8885a" strokeWidth="2" />
      </g>
    ),
    steamer: (
      <g>
        <rect x="12" y="34" width="40" height="18" rx="3" fill="#c0c4c8" stroke="#5a5a62" strokeWidth="2.5" />
        <rect x="10" y="20" width="44" height="16" rx="3" fill="#d9b880" stroke={s} strokeWidth="2" />
        <path d="M14 18 q18 -10 36 0" fill="#e8d4a0" stroke={s} strokeWidth="2" />
        <path d="M24 12 q3 -5 0 -9 M34 10 q3 -5 0 -9" stroke="#b8c4cc" strokeWidth="2" fill="none" />
      </g>
    ),
    oven: (
      <g>
        <rect x="8" y="10" width="48" height="46" rx="3" fill="#d8d0c0" stroke={s} strokeWidth="2.5" />
        <rect x="14" y="22" width="36" height="26" rx="2" fill="#3a2a1a" />
        <rect x="18" y="26" width="28" height="18" rx="2" fill="#e8742a" opacity="0.85" />
        <circle cx="18" cy="16" r="2.5" fill={s} />
        <circle cx="28" cy="16" r="2.5" fill={s} />
      </g>
    ),
    roast: (
      <g>
        <ellipse cx="32" cy="44" rx="26" ry="10" fill="#5a5a62" stroke={s} strokeWidth="2.5" />
        <path d="M14 40 q2 -16 18 -16 q16 0 18 16 Z" fill="#b8642a" stroke={s} strokeWidth="2.5" />
        <path d="M24 30 q4 -2 8 0 M34 28 q4 -2 8 2" stroke="#e8a060" strokeWidth="2" fill="none" />
      </g>
    ),
    plate: <ellipse cx="32" cy="36" rx="26" ry="12" fill="#fbfaf4" stroke={s} strokeWidth="2.5" />,
    bowl: <path d="M8 26 h48 q-4 26 -24 26 q-20 0 -24 -26 Z" fill="#e8dcc8" stroke={s} strokeWidth="2.5" />,
    lunchbox: (
      <g>
        <rect x="10" y="22" width="44" height="28" rx="4" fill="#3d6c9e" stroke={s} strokeWidth="2.5" />
        <rect x="10" y="22" width="44" height="8" fill="#2a4e74" />
        <path d="M24 22 q8 -10 16 0" stroke={s} strokeWidth="2.5" fill="none" />
      </g>
    ),
    pan: (
      <g>
        <ellipse cx="26" cy="36" rx="20" ry="12" fill="#3a3a42" stroke="#1a1a20" strokeWidth="2.5" />
        <rect x="44" y="32" width="18" height="6" rx="3" fill="#6b4a2a" />
      </g>
    ),
    pot: (
      <g>
        <rect x="12" y="24" width="40" height="28" rx="4" fill="#c0c4c8" stroke="#5a5a62" strokeWidth="2.5" />
        <rect x="8" y="20" width="48" height="6" rx="3" fill="#a0a4a8" stroke="#5a5a62" strokeWidth="2" />
        <path d="M24 16 q8 -8 16 0" stroke="#fff" strokeWidth="2.5" fill="none" opacity="0.7" />
      </g>
    ),
    grill: (
      <g>
        <rect x="8" y="30" width="48" height="18" fill="#1a1a20" stroke={s} strokeWidth="2" />
        {[14, 24, 34, 44].map((x) => (
          <path key={x} d={`M${x} 30 v18`} stroke="#8a8a92" strokeWidth="2" />
        ))}
        <path d="M14 30 q4 -10 8 0 q4 -12 8 0 q4 -10 8 0 q4 -12 8 0" fill="#f2a040" opacity="0.8" />
      </g>
    ),
    fridge: (
      <g>
        <rect x="14" y="6" width="36" height="52" rx="4" fill="#e8f0f4" stroke={s} strokeWidth="2.5" />
        <path d="M14 26 H50" stroke={s} strokeWidth="2" />
        <rect x="42" y="12" width="3" height="10" fill="#8a8a92" />
        <rect x="42" y="32" width="3" height="14" fill="#8a8a92" />
        <path d="M24 16 l4 -4 l4 4 M28 12 v10" stroke="#5f9ab8" strokeWidth="2" fill="none" />
      </g>
    ),
    shelf: (
      <g>
        <rect x="8" y="8" width="48" height="48" fill="#c49a5e" stroke={s} strokeWidth="2.5" />
        <path d="M8 24 H56 M8 40 H56" stroke={s} strokeWidth="2.5" />
        <rect x="14" y="12" width="8" height="12" fill="#e8d0a8" />
        <rect x="30" y="28" width="12" height="12" fill="#e8d0a8" />
      </g>
    ),
    basket: (
      <g>
        <path d="M8 28 h48 l-6 26 h-36 Z" fill="#c8964a" stroke={s} strokeWidth="2.5" />
        <path d="M14 28 q18 -26 36 0" stroke={s} strokeWidth="3" fill="none" />
        <path d="M12 38 h40 M14 46 h36" stroke="#8a5a20" strokeWidth="2" />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="thing-art" aria-hidden>
      {f[art] ?? <circle cx="32" cy="32" r="18" fill="#d8c8a8" stroke={s} strokeWidth="2" />}
    </svg>
  );
}

// ------------------------------------------------------------------------------------- documents

export function DocArt({ art, size = 64 }: { art: string; size?: number }) {
  const s = '#3a2a1a';
  const d: Record<string, ReactNode> = {
    doc_invoice: (
      <g>
        <rect x="14" y="6" width="36" height="52" fill="#fbf8f2" stroke={s} strokeWidth="2.5" />
        <path d="M20 16 h24 M20 24 h20 M20 32 h24 M20 40 h16" stroke="#8a8478" strokeWidth="2" />
        <rect x="32" y="46" width="14" height="6" fill="#b8452f" />
      </g>
    ),
    doc_email: (
      <g>
        <rect x="6" y="10" width="52" height="40" rx="4" fill="#3a3a42" stroke={s} strokeWidth="2.5" />
        <rect x="10" y="14" width="44" height="30" fill="#e8f0f4" />
        <path d="M14 20 l18 12 l18 -12" stroke="#5f9ab8" strokeWidth="2" fill="none" />
        <rect x="22" y="50" width="20" height="6" fill="#5a5a62" />
      </g>
    ),
    doc_phone: (
      <g>
        <path d="M14 40 q-6 -24 18 -26 q24 2 18 26 Z" fill="#2a2a2a" stroke={s} strokeWidth="2" />
        <rect x="10" y="40" width="44" height="14" rx="3" fill="#3a3a42" />
        <circle cx="32" cy="30" r="7" fill="#e8e0d0" />
      </g>
    ),
    doc_card: (
      <g>
        <rect x="6" y="16" width="52" height="34" rx="3" fill="#f6ecd2" stroke={s} strokeWidth="2.5" />
        <circle cx="20" cy="30" r="7" fill="#c8a07a" />
        <path d="M32 26 h20 M32 34 h16" stroke="#8a7350" strokeWidth="2" />
      </g>
    ),
    doc_book: (
      <g>
        <rect x="8" y="12" width="48" height="40" fill="#7a3e32" stroke={s} strokeWidth="2.5" />
        <rect x="12" y="16" width="40" height="32" fill="#fbf6ea" />
        <path d="M32 16 V48" stroke="#c8b89a" strokeWidth="2" />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="thing-art" aria-hidden>
      {d[art] ?? <rect x="14" y="8" width="36" height="48" fill="#fbf8f2" stroke={s} strokeWidth="2" />}
    </svg>
  );
}
