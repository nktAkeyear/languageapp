/**
 * Drawn furniture and tools of the workplaces (SVG, no files). Static, filter-free shapes so they can sit
 * under animated pieces cheaply. Icons are 64×64 viewBoxes; furniture pieces take their size from CSS.
 */
import type { ReactNode } from 'react';

const S = '#3a2a1a';

// ------------------------------------------------------------------------------------- bin / place icons

const BINS: Record<string, ReactNode> = {
  fridge: (
    <g>
      <rect x="14" y="6" width="36" height="52" rx="4" fill="#e8f0f4" stroke={S} strokeWidth="2.5" />
      <path d="M14 26 H50" stroke={S} strokeWidth="2" />
      <rect x="42" y="12" width="3" height="10" fill="#8a8a92" />
      <rect x="42" y="32" width="3" height="14" fill="#8a8a92" />
      <path d="M24 16 l4 -4 l4 4 M28 12 v10" stroke="#5f9ab8" strokeWidth="2" fill="none" />
    </g>
  ),
  freezer: (
    <g>
      <rect x="8" y="18" width="48" height="40" rx="4" fill="#dfeef6" stroke={S} strokeWidth="2.5" />
      <rect x="8" y="12" width="48" height="10" rx="3" fill="#c8dde8" stroke={S} strokeWidth="2.5" />
      <path d="M32 26 v24 M22 32 l20 12 M42 32 l-20 12" stroke="#5f9ab8" strokeWidth="2.5" />
    </g>
  ),
  shelf: (
    <g>
      <rect x="8" y="8" width="48" height="48" fill="#c49a5e" stroke={S} strokeWidth="2.5" />
      <path d="M8 24 H56 M8 40 H56" stroke={S} strokeWidth="2.5" />
      <rect x="14" y="12" width="8" height="12" fill="#e8d0a8" />
      <rect x="26" y="14" width="10" height="10" fill="#f2e2c0" />
      <rect x="30" y="28" width="12" height="12" fill="#e8d0a8" />
      <rect x="14" y="44" width="16" height="12" fill="#d9b880" />
    </g>
  ),
  basket: (
    <g>
      <path d="M8 28 h48 l-6 26 h-36 Z" fill="#c8964a" stroke={S} strokeWidth="2.5" />
      <path d="M14 28 q18 -26 36 0" stroke={S} strokeWidth="3" fill="none" />
      <path d="M12 38 h40 M14 46 h36" stroke="#8a5a20" strokeWidth="2" />
    </g>
  ),
  bin: (
    <g>
      <path d="M16 18 h32 l-4 38 h-24 Z" fill="#8a9298" stroke={S} strokeWidth="2.5" />
      <rect x="12" y="12" width="40" height="7" rx="2" fill="#a8b0b6" stroke={S} strokeWidth="2.5" />
      <path d="M26 8 h12 v4" stroke={S} strokeWidth="2.5" fill="none" />
      <path d="M26 26 v24 M32 26 v24 M38 26 v24" stroke="#5a6268" strokeWidth="2" />
    </g>
  ),
  sink: (
    <g>
      <path d="M6 30 h52 l-6 18 h-40 Z" fill="#c8ccd0" stroke={S} strokeWidth="2.5" />
      <path d="M30 30 v-16 q0 -6 8 -6 h6 v6" stroke={S} strokeWidth="3" fill="none" />
      <path d="M44 16 v4" stroke="#5f9ab8" strokeWidth="2.5" />
      <ellipse cx="32" cy="38" rx="16" ry="4" fill="#a8b8c4" />
    </g>
  ),
  stove: (
    <g>
      <rect x="8" y="26" width="48" height="30" rx="3" fill="#3a3a42" stroke={S} strokeWidth="2.5" />
      <rect x="8" y="20" width="48" height="8" fill="#5a5a62" stroke={S} strokeWidth="2" />
      <circle cx="22" cy="24" r="5" fill="#e8742a" />
      <circle cx="42" cy="24" r="5" fill="#e8742a" />
      <rect x="16" y="36" width="32" height="14" rx="2" fill="#2a2a30" />
      <circle cx="18" cy="31" r="2" fill="#ddd" />
      <circle cx="46" cy="31" r="2" fill="#ddd" />
    </g>
  ),
  oven: (
    <g>
      <rect x="8" y="10" width="48" height="46" rx="3" fill="#d8d0c0" stroke={S} strokeWidth="2.5" />
      <rect x="14" y="22" width="36" height="26" rx="2" fill="#3a2a1a" />
      <rect x="18" y="26" width="28" height="18" rx="2" fill="#e8742a" opacity="0.8" />
      <circle cx="18" cy="16" r="2.5" fill={S} />
      <circle cx="28" cy="16" r="2.5" fill={S} />
      <rect x="20" y="18" width="24" height="3" fill="#8a8478" />
    </g>
  ),
  drawer: (
    <g>
      <rect x="6" y="14" width="52" height="38" fill="#c49a5e" stroke={S} strokeWidth="2.5" />
      <rect x="10" y="20" width="44" height="26" fill="#b8894a" stroke={S} strokeWidth="2" />
      <rect x="26" y="30" width="12" height="5" rx="2" fill="#e8d4a0" stroke={S} strokeWidth="1.5" />
      <path d="M14 8 l6 6 M22 6 l2 8" stroke="#8a8a92" strokeWidth="2.5" />
    </g>
  ),
  door: (
    <g>
      <rect x="16" y="6" width="32" height="52" fill="#8a5a2e" stroke={S} strokeWidth="2.5" />
      <rect x="20" y="10" width="24" height="18" fill="#7a4a24" />
      <rect x="20" y="32" width="24" height="22" fill="#7a4a24" />
      <circle cx="42" cy="32" r="2.5" fill="#e8c860" />
    </g>
  ),
  floor: (
    <g>
      <path d="M4 36 L32 26 L60 36 L32 50 Z" fill="#c8a878" stroke={S} strokeWidth="2.5" />
      <path d="M18 31 L46 45 M32 26 L32 50 M46 31 L18 45" stroke="#a8885a" strokeWidth="1.5" />
      <path d="M40 14 l6 10 h-12 Z" fill="#f2c840" stroke={S} strokeWidth="2" />
      <path d="M40 17 v4" stroke={S} strokeWidth="2" />
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
      <path d="M24 16 q8 -8 16 0" stroke="#b8c4cc" strokeWidth="2.5" fill="none" />
    </g>
  ),
  grill: (
    <g>
      <rect x="8" y="30" width="48" height="18" fill="#1a1a20" stroke={S} strokeWidth="2" />
      {[14, 24, 34, 44].map((x) => (
        <path key={x} d={`M${x} 30 v18`} stroke="#8a8a92" strokeWidth="2" />
      ))}
      <path d="M14 30 q4 -10 8 0 q4 -12 8 0 q4 -10 8 0 q4 -12 8 0" fill="#f2a040" opacity="0.85" />
    </g>
  ),
  board: (
    <g>
      <rect x="8" y="8" width="48" height="40" rx="2" fill="#c8945a" stroke={S} strokeWidth="2.5" />
      <rect x="14" y="14" width="16" height="12" fill="#fbf6ea" />
      <rect x="34" y="16" width="16" height="12" fill="#fff3c8" />
      <rect x="20" y="30" width="18" height="12" fill="#fbf6ea" />
      <path d="M30 48 v10 M24 58 h12" stroke={S} strokeWidth="2.5" />
    </g>
  ),
  praise: (
    <g>
      <rect x="8" y="10" width="48" height="40" rx="3" fill="#fbe6ea" stroke={S} strokeWidth="2.5" />
      <path d="M32 44 C 14 32, 18 18, 28 20 C 31 21, 32 24, 32 26 C 32 24, 33 21, 36 20 C 46 18, 50 32, 32 44 Z" fill="#d8504a" stroke={S} strokeWidth="2" />
    </g>
  ),
  idea: (
    <g>
      <rect x="8" y="14" width="48" height="40" rx="3" fill="#c49a5e" stroke={S} strokeWidth="2.5" />
      <rect x="22" y="14" width="20" height="5" fill={S} />
      <circle cx="32" cy="32" r="9" fill="#fff3a8" stroke={S} strokeWidth="2" />
      <rect x="28" y="40" width="8" height="5" fill="#8a8a92" />
      <path d="M32 8 v4 M22 10 l2 3 M42 10 l-2 3" stroke="#d9a520" strokeWidth="2.5" />
    </g>
  ),
  complaint: (
    <g>
      <rect x="8" y="14" width="48" height="40" rx="3" fill="#c8c0b8" stroke={S} strokeWidth="2.5" />
      <rect x="22" y="14" width="20" height="5" fill={S} />
      <circle cx="32" cy="34" r="11" fill="#f2d070" stroke={S} strokeWidth="2" />
      <path d="M27 31 h1 M36 31 h1" stroke={S} strokeWidth="3" strokeLinecap="round" />
      <path d="M26 41 q6 -5 12 0" stroke={S} strokeWidth="2.5" fill="none" />
    </g>
  ),
  // the inn
  floor1: <FloorIcon n={1} />,
  floor2: <FloorIcon n={2} />,
  floor3: <FloorIcon n={3} />,
  kitchen: (
    <g>
      <path d="M14 30 h36 v24 h-36 Z" fill="#fbfaf4" stroke={S} strokeWidth="2.5" />
      <path d="M18 30 q-8 -14 6 -16 q4 -10 14 -4 q10 -6 14 4 q12 4 2 16" fill="#fbfaf4" stroke={S} strokeWidth="2.5" />
    </g>
  ),
  desk: (
    <g>
      <rect x="6" y="28" width="52" height="8" fill="#a8763e" stroke={S} strokeWidth="2.5" />
      <rect x="10" y="36" width="8" height="20" fill="#8a5a2e" stroke={S} strokeWidth="2" />
      <rect x="46" y="36" width="8" height="20" fill="#8a5a2e" stroke={S} strokeWidth="2" />
      <path d="M34 26 a6 6 0 0 1 12 0 Z" fill="#e8c860" stroke={S} strokeWidth="2" />
      <rect x="14" y="18" width="14" height="10" fill="#fbf6ea" stroke={S} strokeWidth="1.5" />
    </g>
  ),
  wash: (
    <g>
      <path d="M10 22 h44 l-5 34 h-34 Z" fill="#e8dcc0" stroke={S} strokeWidth="2.5" />
      <path d="M12 30 h40 M14 40 h36 M16 50 h32" stroke="#b8a88a" strokeWidth="2" />
      <path d="M18 22 q4 -12 14 -8 q10 -6 14 8" fill="#cfe3f0" stroke={S} strokeWidth="2" />
    </g>
  ),
  lost: (
    <g>
      <rect x="8" y="22" width="48" height="34" fill="#c49a5e" stroke={S} strokeWidth="2.5" />
      <path d="M8 22 l8 -10 h32 l8 10" fill="#d9b070" stroke={S} strokeWidth="2.5" />
      <text x="32" y="48" textAnchor="middle" fontSize="22" fontWeight="700" fill={S}>
        ?
      </text>
    </g>
  ),
  store: (
    <g>
      <rect x="14" y="20" width="36" height="34" rx="4" fill="#7a4a2e" stroke={S} strokeWidth="2.5" />
      <path d="M26 20 v-8 h12 v8" stroke={S} strokeWidth="3" fill="none" />
      <path d="M14 34 h36" stroke="#5a3418" strokeWidth="2" />
      <rect x="28" y="30" width="8" height="8" fill="#e8c860" stroke={S} strokeWidth="1.5" />
    </g>
  ),
  laundry: (
    <g>
      <path d="M10 22 h44 l-5 34 h-34 Z" fill="#e8dcc0" stroke={S} strokeWidth="2.5" />
      <path d="M12 30 h40 M14 40 h36 M16 50 h32" stroke="#b8a88a" strokeWidth="2" />
      <path d="M18 22 q4 -12 14 -8 q10 -6 14 8" fill="#f6f0f4" stroke={S} strokeWidth="2" />
    </g>
  ),
  post: (
    <g>
      <rect x="18" y="16" width="28" height="40" rx="12" fill="#c8322a" stroke={S} strokeWidth="2.5" />
      <rect x="24" y="26" width="16" height="4" fill="#3a1a14" />
      <rect x="22" y="56" width="20" height="4" fill="#5a2a1a" />
    </g>
  ),
  ferry: (
    <g>
      <path d="M6 40 h52 l-8 12 h-36 Z" fill="#3d6c9e" stroke={S} strokeWidth="2.5" />
      <rect x="18" y="28" width="26" height="12" fill="#fbf6ea" stroke={S} strokeWidth="2" />
      <rect x="26" y="18" width="6" height="10" fill="#c8322a" stroke={S} strokeWidth="2" />
      <path d="M4 58 q6 -4 12 0 q6 4 12 0 q6 -4 12 0 q6 4 12 0 q6 -4 8 0" stroke="#5f9ab8" strokeWidth="2.5" fill="none" />
    </g>
  ),
  // the post office
  island: (
    <g>
      <ellipse cx="32" cy="46" rx="26" ry="8" fill="#5f9ab8" />
      <path d="M14 44 q18 -16 36 0 Z" fill="#e8d0a0" stroke={S} strokeWidth="2" />
      <path d="M32 40 v-20 M32 22 q-10 -4 -14 4 M32 22 q10 -6 14 2 M32 22 q-2 -10 6 -12" stroke="#4d7a3a" strokeWidth="3" fill="none" />
    </g>
  ),
  abroad: (
    <g>
      <circle cx="32" cy="32" r="22" fill="#9ccbe0" stroke={S} strokeWidth="2.5" />
      <path d="M18 22 q8 -2 10 6 q-4 6 2 10 q-6 6 -10 2 Z M36 16 q10 2 14 12 q-6 2 -8 8 q-6 -4 -6 -10 Z M38 42 q6 0 8 6 q-6 6 -10 2 Z" fill="#7aa63a" />
      <path d="M10 32 h44 M32 10 q-12 22 0 44 M32 10 q12 22 0 44" stroke="#5f8aa0" strokeWidth="1.2" fill="none" />
    </g>
  ),
  back: (
    <g>
      <rect x="8" y="18" width="44" height="30" fill="#fbf6ea" stroke={S} strokeWidth="2.5" />
      <path d="M8 18 l22 16 l22 -16" stroke={S} strokeWidth="2" fill="none" />
      <path d="M58 30 q0 -14 -14 -14 h-4 M44 10 l-6 6 l6 6" stroke="#c8322a" strokeWidth="3.5" fill="none" />
    </g>
  ),
  boat: (
    <g>
      <path d="M6 40 h52 l-10 12 h-32 Z" fill="#8a5a2e" stroke={S} strokeWidth="2.5" />
      <path d="M32 40 v-30 M32 12 l16 24 h-16" fill="#fbf6ea" stroke={S} strokeWidth="2.5" />
    </g>
  ),
  plane: (
    <g>
      <path d="M8 34 l48 -14 l-8 8 l-30 8 l-6 10 h-4 l2 -10 Z" fill="#e8f0f4" stroke={S} strokeWidth="2.5" />
      <path d="M30 30 l-6 -12 h6 l10 10" fill="#c8322a" stroke={S} strokeWidth="2" />
    </g>
  ),
  train: (
    <g>
      <rect x="12" y="12" width="40" height="34" rx="6" fill="#3d6c9e" stroke={S} strokeWidth="2.5" />
      <rect x="18" y="18" width="12" height="10" fill="#e8f0f4" />
      <rect x="34" y="18" width="12" height="10" fill="#e8f0f4" />
      <circle cx="20" cy="50" r="5" fill={S} />
      <circle cx="44" cy="50" r="5" fill={S} />
      <path d="M6 58 h52" stroke={S} strokeWidth="2.5" />
    </g>
  ),
  light: (
    <g>
      <rect x="18" y="30" width="28" height="22" fill="#d9b880" stroke={S} strokeWidth="2.5" />
      <path d="M32 30 v22 M18 40 h28" stroke="#8a5a20" strokeWidth="2" />
      <path d="M26 14 q6 -8 12 0" stroke="#5f9ab8" strokeWidth="2.5" fill="none" />
      <path d="M22 22 q10 -4 20 0" stroke="#5f9ab8" strokeWidth="2" fill="none" />
    </g>
  ),
  heavy: (
    <g>
      <rect x="10" y="24" width="44" height="32" fill="#a8763e" stroke={S} strokeWidth="2.5" />
      <path d="M32 24 v32 M10 40 h44" stroke="#5a3418" strokeWidth="2.5" />
      <path d="M22 14 h20 l4 8 h-28 Z" fill="#5a5a62" stroke={S} strokeWidth="2" />
    </g>
  ),
  express: (
    <g>
      <rect x="10" y="18" width="44" height="30" fill="#fbf6ea" stroke={S} strokeWidth="2.5" />
      <path d="M34 12 l-10 22 h10 l-6 22 l18 -28 h-10 l6 -16 Z" fill="#f2c840" stroke={S} strokeWidth="2" />
    </g>
  ),
  registered: (
    <g>
      <rect x="10" y="18" width="44" height="30" fill="#fbf6ea" stroke={S} strokeWidth="2.5" />
      <path d="M10 18 l22 16 l22 -16" stroke={S} strokeWidth="2" fill="none" />
      <path d="M38 44 q6 -10 10 -2 q4 6 10 -4" stroke="#3d6c9e" strokeWidth="3" fill="none" />
    </g>
  ),
  ordinary: (
    <g>
      <rect x="10" y="18" width="44" height="30" fill="#fbf6ea" stroke={S} strokeWidth="2.5" />
      <path d="M10 18 l22 16 l22 -16" stroke={S} strokeWidth="2" fill="none" />
      <rect x="42" y="22" width="8" height="10" fill="#c8322a" />
    </g>
  ),
  hold: (
    <g>
      <rect x="10" y="22" width="44" height="30" fill="#c49a5e" stroke={S} strokeWidth="2.5" />
      <circle cx="44" cy="18" r="12" fill="#fbf6ea" stroke={S} strokeWidth="2.5" />
      <path d="M44 10 v8 l5 4" stroke={S} strokeWidth="2.5" fill="none" />
    </g>
  ),
  redirect: (
    <g>
      <path d="M8 34 l14 -14 l14 14 v20 h-28 Z" fill="#e8c8a0" stroke={S} strokeWidth="2.5" />
      <path d="M36 30 h14 M44 24 l8 6 l-8 6" stroke="#3d6c9e" strokeWidth="3.5" fill="none" />
      <path d="M44 40 l6 -10 l6 10 v14 h-12 Z" fill="#cfe3f0" stroke={S} strokeWidth="2" />
    </g>
  ),
  claims: (
    <g>
      <rect x="10" y="10" width="40" height="46" fill="#fbf6ea" stroke={S} strokeWidth="2.5" />
      <path d="M16 20 h28 M16 28 h22 M16 36 h28" stroke="#8a8478" strokeWidth="2" />
      <circle cx="46" cy="46" r="10" fill="#c8322a" stroke={S} strokeWidth="2" />
      <path d="M46 40 v7 M46 51 v1" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </g>
  ),
  day: (
    <g>
      <rect x="10" y="12" width="44" height="42" rx="3" fill="#fbf6ea" stroke={S} strokeWidth="2.5" />
      <rect x="10" y="12" width="44" height="12" fill="#c8322a" stroke={S} strokeWidth="2.5" />
      <path d="M20 8 v8 M44 8 v8" stroke={S} strokeWidth="3" />
      <path d="M18 32 h6 M30 32 h6 M42 32 h6 M18 42 h6 M30 42 h6" stroke="#8a8478" strokeWidth="3" />
    </g>
  ),
  street: (
    <g>
      <rect x="6" y="20" width="52" height="22" rx="3" fill="#3d6c9e" stroke={S} strokeWidth="2.5" />
      <rect x="10" y="24" width="44" height="14" rx="2" fill="none" stroke="#fbf6ea" strokeWidth="1.5" />
      <path d="M30 42 v16" stroke={S} strokeWidth="3" />
    </g>
  ),
};

function FloorIcon({ n }: { n: number }) {
  return (
    <g>
      <path d="M8 22 L32 8 L56 22 V58 H8 Z" fill="#e8d8b8" stroke={S} strokeWidth="2.5" />
      {[1, 2, 3].map((f) => (
        <rect key={f} x="14" y={52 - f * 11} width="36" height="9" fill={f === n ? '#f2c840' : '#fbf6ea'} stroke={S} strokeWidth="1.5" />
      ))}
    </g>
  );
}

/** Which drawing a bin gets (its art, else its id; place bins of the post office use the town icons). */
export function binArtKey(id: string, art?: string): string {
  if (art && BINS[art]) return art;
  if (BINS[id]) return id;
  if (/^f[1-3]$/.test(id)) return `floor${id[1]}`;
  if (['north', 'south', 'east', 'west'].includes(id)) return 'street';
  if (['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].includes(id)) return 'day';
  if (id === 'cold') return 'fridge';
  return 'board';
}

export function hasBinArt(key: string): boolean {
  return !!BINS[key];
}

export function BinArt({ id, art, size = 56 }: { id: string; art?: string; size?: number }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="bin-art" aria-hidden>
      {BINS[binArtKey(id, art)]}
    </svg>
  );
}

// ------------------------------------------------------------------------------------- the post office

/** A letter: an envelope with a stamp; its address is written on it (children). */
export function Envelope({ children, tone = 0 }: { children?: ReactNode; tone?: number }) {
  const fills = ['#fbf6ea', '#f6ecd2', '#eef2f6', '#fbefe6'];
  return (
    <span className="envelope" style={{ ['--env' as string]: fills[tone % fills.length] }}>
      <svg viewBox="0 0 160 96" preserveAspectRatio="none" aria-hidden className="envelope-art">
        <rect x="2" y="2" width="156" height="92" rx="4" fill="var(--env)" stroke={S} strokeWidth="2.5" />
        <path d="M2 4 L80 52 L158 4" stroke="#c8b89a" strokeWidth="2" fill="none" />
        <rect x="128" y="10" width="22" height="26" fill="#c8322a" stroke="#7a1a10" strokeWidth="1.5" strokeDasharray="2 2" />
        <circle cx="122" cy="26" r="11" fill="none" stroke="#5a5a62" strokeWidth="1.5" opacity="0.7" />
      </svg>
      <span className="envelope-text">{children}</span>
    </span>
  );
}

/** A parcel wrapped in brown paper with string; `kilos` is not shown (the scale shows it). */
export function ParcelArt({ size = 120, stamps = 0 }: { size?: number; stamps?: number }) {
  return (
    <svg viewBox="0 0 120 100" width={size} height={(size * 100) / 120} className="parcel-art" aria-hidden>
      <path d="M10 34 L60 14 L110 34 L110 84 L60 98 L10 84 Z" fill="#c49a5e" stroke={S} strokeWidth="2.5" />
      <path d="M10 34 L60 52 L110 34 M60 52 V98" stroke="#8a6436" strokeWidth="2" fill="none" />
      <path d="M35 24 L85 44 M35 44 V92 M85 44 V92" stroke="#f2e8d0" strokeWidth="3" fill="none" />
      {Array.from({ length: Math.min(stamps, 4) }, (_, i) => (
        <rect key={i} x={66 + i * 9} y={60 + (i % 2) * 4} width="8" height="10" fill="#c8322a" stroke="#7a1a10" strokeWidth="1" transform={`rotate(-12 ${70 + i * 9} 65)`} />
      ))}
    </svg>
  );
}

/** The brass letter scale; the dial shows `kilos` (or nothing when the scale is empty). */
export function ScaleArt({ kilos }: { kilos: number | null }) {
  const a = kilos === null ? -60 : -60 + Math.min(10, kilos) * 12;
  return (
    <svg viewBox="0 0 160 150" className="scale-art" aria-hidden>
      <rect x="30" y="122" width="100" height="18" rx="4" fill="#b8892f" stroke={S} strokeWidth="2.5" />
      <rect x="72" y="70" width="16" height="54" fill="#c8a040" stroke={S} strokeWidth="2.5" />
      <circle cx="80" cy="78" r="34" fill="#fbf6ea" stroke="#b8892f" strokeWidth="6" />
      {Array.from({ length: 11 }, (_, i) => {
        const r = ((-60 + i * 12 - 90) * Math.PI) / 180;
        return <path key={i} d={`M${80 + 26 * Math.cos(r)} ${78 + 26 * Math.sin(r)} L${80 + 31 * Math.cos(r)} ${78 + 31 * Math.sin(r)}`} stroke={S} strokeWidth={i % 5 === 0 ? 2.5 : 1.2} />;
      })}
      <path d="M80 78 L80 52" stroke="#c8322a" strokeWidth="3" strokeLinecap="round" style={{ transform: `rotate(${a}deg)`, transformOrigin: '80px 78px', transition: 'transform 0.6s cubic-bezier(.3,1.6,.5,1)' }} />
      <circle cx="80" cy="78" r="4" fill={S} />
      <rect x="20" y="30" width="120" height="10" rx="3" fill="#c8a040" stroke={S} strokeWidth="2.5" />
      <rect x="76" y="38" width="8" height="10" fill="#b8892f" />
    </svg>
  );
}

/** The till's drawer with coin compartments (coins are buttons laid over it). */
export function TillArt() {
  return (
    <svg viewBox="0 0 300 120" preserveAspectRatio="none" className="till-art" aria-hidden>
      <rect x="4" y="10" width="292" height="104" rx="6" fill="#5a3a22" stroke={S} strokeWidth="3" />
      <rect x="14" y="22" width="272" height="80" rx="4" fill="#3a2414" />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={20 + i * 90} y="28" width="80" height="68" rx="6" fill="#2a1a0e" stroke="#6b4a2a" strokeWidth="2" />
      ))}
      <rect x="120" y="2" width="60" height="10" rx="3" fill="#b8892f" />
    </svg>
  );
}

// ------------------------------------------------------------------------------------- the kitchen

/** A cooking station (the stove with its pan / pot / steamer, the grill, the oven), lit when chosen. */
export function StationArt({ kind, on }: { kind: string; on: boolean }) {
  const flame = on ? <path d="M18 54 q4 -10 8 0 q4 -12 8 0 q4 -10 8 0 q4 -12 8 0" fill="#f2a040" opacity="0.95" className="flame" /> : null;
  const art: Record<string, ReactNode> = {
    fry: (
      <g>
        <rect x="8" y="50" width="56" height="10" fill="#3a3a42" />
        {flame}
        <ellipse cx="34" cy="42" rx="22" ry="8" fill="#2a2a30" stroke="#111" strokeWidth="2.5" />
        <rect x="54" y="38" width="16" height="5" rx="2" fill="#6b4a2a" />
        {on ? <path d="M24 34 q2 -6 0 -10 M34 32 q2 -6 0 -10 M44 34 q2 -6 0 -10" stroke="#e8e0d0" strokeWidth="2" fill="none" className="steam" /> : null}
      </g>
    ),
    boil: (
      <g>
        <rect x="8" y="54" width="56" height="8" fill="#3a3a42" />
        {flame}
        <rect x="16" y="28" width="40" height="26" rx="4" fill="#c0c4c8" stroke="#5a5a62" strokeWidth="2.5" />
        <rect x="12" y="24" width="48" height="6" rx="3" fill="#a0a4a8" stroke="#5a5a62" strokeWidth="2" />
        {on ? <path d="M26 20 q3 -6 0 -12 M36 18 q3 -6 0 -12 M46 20 q3 -6 0 -12" stroke="#cfe3f0" strokeWidth="2.5" fill="none" className="steam" /> : null}
      </g>
    ),
    steam: (
      <g>
        <rect x="8" y="54" width="56" height="8" fill="#3a3a42" />
        {flame}
        <rect x="16" y="38" width="40" height="16" rx="3" fill="#c0c4c8" stroke="#5a5a62" strokeWidth="2.5" />
        <rect x="14" y="26" width="44" height="14" rx="3" fill="#d9b880" stroke={S} strokeWidth="2" />
        <path d="M14 33 h44" stroke="#a8885a" strokeWidth="1.5" />
        <path d="M18 22 q14 -10 36 0" fill="#e8d4a0" stroke={S} strokeWidth="2" />
        {on ? <path d="M24 16 q3 -6 0 -10 M36 14 q3 -6 0 -10 M48 16 q3 -6 0 -10" stroke="#e8f0f4" strokeWidth="2.5" fill="none" className="steam" /> : null}
      </g>
    ),
    grill: (
      <g>
        <rect x="6" y="40" width="60" height="22" fill="#1a1a20" stroke={S} strokeWidth="2" />
        {[14, 24, 34, 44, 54].map((x) => (
          <path key={x} d={`M${x} 40 v22`} stroke="#8a8a92" strokeWidth="2" />
        ))}
        <path d="M10 40 q4 -10 8 0 q4 -12 8 0 q4 -10 8 0 q4 -12 8 0 q4 -10 8 0 q4 -12 8 0" fill={on ? '#f2a040' : '#7a4a2a'} opacity={on ? 0.95 : 0.6} className={on ? 'flame' : ''} />
      </g>
    ),
    bake: (
      <g>
        <rect x="8" y="12" width="56" height="50" rx="3" fill="#d8d0c0" stroke={S} strokeWidth="2.5" />
        <rect x="14" y="24" width="44" height="30" rx="2" fill="#3a2a1a" />
        <rect x="18" y="28" width="36" height="22" rx="2" fill={on ? '#f2a040' : '#5a3a22'} opacity={on ? 0.9 : 1} className={on ? 'glowbox' : ''} />
        <circle cx="20" cy="18" r="2.5" fill={S} />
        <circle cx="30" cy="18" r="2.5" fill={S} />
        <rect x="24" y="44" width="24" height="4" fill="#8a8478" />
      </g>
    ),
    roast: (
      <g>
        <rect x="8" y="12" width="56" height="50" rx="3" fill="#c8c0b0" stroke={S} strokeWidth="2.5" />
        <rect x="14" y="24" width="44" height="30" rx="2" fill="#3a2a1a" />
        <rect x="18" y="28" width="36" height="22" rx="2" fill={on ? '#e8742a' : '#5a3a22'} className={on ? 'glowbox' : ''} />
        <ellipse cx="36" cy="44" rx="14" ry="5" fill="#8a5a2e" />
        <circle cx="20" cy="18" r="2.5" fill={S} />
        <circle cx="30" cy="18" r="2.5" fill={S} />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 72 66" className={`station-art ${on ? 'on' : ''}`} aria-hidden>
      {art[kind] ?? art.fry}
    </svg>
  );
}

// ------------------------------------------------------------------------------------- telephone / pad / calendar / stamp / pen

export function PhoneArt({ ringing }: { ringing: boolean }) {
  return (
    <svg viewBox="0 0 120 90" className={`phone-art ${ringing ? 'ringing' : ''}`} aria-hidden>
      <path d="M14 70 q-4 -36 46 -40 q50 4 46 40 Z" fill="#2a2a30" stroke="#111" strokeWidth="2.5" />
      <circle cx="60" cy="56" r="14" fill="#e8e0d0" stroke="#111" strokeWidth="2" />
      {Array.from({ length: 8 }, (_, i) => {
        const r = (i / 8) * Math.PI * 2;
        return <circle key={i} cx={60 + 9 * Math.cos(r)} cy={56 + 9 * Math.sin(r)} r="2" fill="#2a2a30" />;
      })}
      <g className="handset">
        <path d="M10 26 q0 -14 14 -14 h72 q14 0 14 14 v4 h-18 v-6 h-64 v6 h-18 Z" fill="#2a2a30" stroke="#111" strokeWidth="2.5" />
      </g>
      <rect x="10" y="70" width="100" height="10" rx="3" fill="#3a3a42" />
    </svg>
  );
}

export function StampToolArt({ ok }: { ok: boolean }) {
  return (
    <svg viewBox="0 0 70 90" className="stamp-tool" aria-hidden>
      <ellipse cx="35" cy="16" rx="16" ry="12" fill={ok ? '#7a4a2a' : '#4a2a1a'} stroke={S} strokeWidth="2.5" />
      <rect x="29" y="24" width="12" height="30" fill={ok ? '#8a5a2e' : '#5a3418'} stroke={S} strokeWidth="2" />
      <rect x="10" y="52" width="50" height="18" rx="3" fill="#5a5a62" stroke={S} strokeWidth="2.5" />
      <rect x="12" y="70" width="46" height="8" rx="2" fill={ok ? '#2f6a3a' : '#a8322a'} />
      <path d={ok ? 'M26 63 l6 4 l12 -9' : 'M27 58 l16 10 M43 58 l-16 10'} stroke="#fbf6ea" strokeWidth="2.5" fill="none" />
    </svg>
  );
}

export function PenArt() {
  return (
    <svg viewBox="0 0 120 24" className="pen-art" aria-hidden>
      <path d="M6 12 L20 6 H104 q8 0 8 6 q0 6 -8 6 H20 Z" fill="#a8322a" stroke={S} strokeWidth="2" />
      <path d="M6 12 L20 6 V18 Z" fill="#e8d4a0" stroke={S} strokeWidth="1.5" />
      <path d="M2 12 L8 11 L8 13 Z" fill={S} />
      <rect x="84" y="4" width="4" height="12" fill="#b8892f" />
    </svg>
  );
}

/** A bell on the front desk. */
export function DeskBellArt() {
  return (
    <svg viewBox="0 0 80 60" className="deskbell-art" aria-hidden>
      <ellipse cx="40" cy="52" rx="34" ry="6" fill="#5a3a22" />
      <path d="M12 48 q0 -32 28 -32 q28 0 28 32 Z" fill="#e8c860" stroke={S} strokeWidth="2.5" />
      <rect x="36" y="8" width="8" height="8" rx="2" fill="#b8892f" stroke={S} strokeWidth="2" />
      <path d="M22 34 q6 -10 14 -12" stroke="#fff6c8" strokeWidth="3" fill="none" opacity="0.8" />
    </svg>
  );
}

/** A room key on its wooden tag. */
export function KeyArt() {
  return (
    <svg viewBox="0 0 30 60" className="key-art" aria-hidden>
      <circle cx="15" cy="8" r="5" fill="none" stroke="#b8892f" strokeWidth="3" />
      <path d="M15 13 v18 M15 24 h6 M15 29 h5" stroke="#b8892f" strokeWidth="3" />
      <path d="M6 32 h18 l-2 24 h-14 Z" fill="#8a5a2e" stroke={S} strokeWidth="2" />
    </svg>
  );
}
