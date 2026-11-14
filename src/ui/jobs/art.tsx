/**
 * Drawn art of the jobs (SVG, no image files): the town hub (the delivery map extended by the east
 * quarter across the bridge, where the new workplaces stand), building fronts for the phone's
 * list, each workplace's interior backdrop, the things handled at work and small icons for the
 * sorting cabinet. Kitchen / office / inn pieces live in art2.tsx.
 */
import type { ReactNode } from 'react';
import { CELL_W, DOOR_COLOURS, MAP_H, MAP_W, MapGroundArt, MapHouseArt, MapLandmarkArt, SHOP_POINT, cellBox } from '../art/town';
import type { MapCell } from '../../core/townTypes';
import { KitchenBackdrop, OfficeBackdrop, InnBackdrop, FoodArt, DocArt, KITCHEN_FOODS } from './art2';

export const HUB_W = 1600;
export const HUB_H = 900;

/** Where each workplace stands on the hub map (door point, for the hotspot and the walk). */
export const BUILDINGS: Record<string, { x: number; y: number; w: number; h: number }> = {
  teahouse: { x: 40, y: 360, w: 116, h: 110 },
  inn: { ...cellBox(1, 1), w: CELL_W, h: 168 },
  post: { x: 1236, y: 300, w: 170, h: 190 },
  office: { x: 1420, y: 210, w: 170, h: 280 },
  kitchen: { x: 1230, y: 610, w: 180, h: 170 },
  board: { x: 600, y: 396, w: 110, h: 100 },
  lot: { x: 1430, y: 620, w: 160, h: 160 },
};

/** The hub: the town map plus the east quarter across the river, with the new workplaces. */
export function HubMapArt({ cells, temple, tint }: { cells: MapCell[]; temple: 'church' | 'pagoda'; tint: string }) {
  return (
    <g>
      <g>
        <MapGroundArt tint={tint} />
      </g>
      {/* east quarter: ground, the road from the bridge, a quay */}
      <rect x={MAP_W} y="0" width={HUB_W - MAP_W} height={MAP_H} fill="#e2d2aa" />
      <path d={`M${MAP_W - 30} 0 C${MAP_W - 8} 200 ${MAP_W - 38} 360 ${MAP_W - 20} 520 S${MAP_W + 2} 760 ${MAP_W - 14} 900`} stroke="#5f9ab8" strokeWidth="40" fill="none" />
      <rect x={MAP_W - 4} y="552" width={HUB_W - MAP_W + 4} height="40" fill="#cdb48a" stroke="#9a8460" strokeWidth="2" />
      <path d={`M${MAP_W} 572 H${HUB_W}`} stroke="#f6ecd2" strokeWidth="3" strokeDasharray="18 16" opacity="0.7" />
      <rect x={MAP_W + 108} y="200" width="36" height="352" fill="#d6c29a" />
      <path d={`M${MAP_W} ${MAP_H - 30} H${HUB_W}`} stroke="url(#map-sea)" strokeWidth="60" />
      {/* trees */}
      {[
        [1218, 140],
        [1560, 120],
        [1212, 820],
        [1340, 520],
      ].map(([x, y], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect x="-4" y="0" width="8" height="18" fill="#6b4a2a" />
          <circle cy="-6" r="20" fill="#5e8a46" stroke="#3a5a2a" strokeWidth="2" />
        </g>
      ))}
      {/* the original map */}
      {cells.map((c) => {
        const b = cellBox(c.col, c.row);
        return c.landmark ? (
          <MapLandmarkArt key={c.id} lm={c.landmark} x={b.x} y={b.y} temple={temple} />
        ) : (
          <MapHouseArt key={c.id} x={b.x} y={b.y} door={DOOR_COLOURS[c.door ?? 'red']} seed={c.col * 7 + c.row * 3} facing={c.row <= 1 ? 'down' : 'up'} />
        );
      })}
      {/* our tea house at the west end of the main street */}
      <g transform={`translate(${SHOP_POINT.x} ${SHOP_POINT.y})`}>
        <rect x="-44" y="-58" width="88" height="58" fill="#e8d0a8" stroke="#3a2a1a" strokeWidth="2.5" />
        <path d="M-56 -56 L0 -94 L56 -56 Z" fill="#4d6a45" stroke="#2a3a22" strokeWidth="2.5" />
        <rect x="-12" y="-38" width="24" height="38" fill="#5e7a6a" stroke="#2a3a22" strokeWidth="2" />
        <rect x="-36" y="-44" width="18" height="16" fill="#ffe1a0" stroke="#5a4430" strokeWidth="1.5" />
        <g transform="translate(32 -70)">
          <circle r="13" fill="#f6ecd2" stroke="#7a2f1b" strokeWidth="2" />
          <path d="M-6 -1 q6 9 12 0 Z M6 -2 q5 0 4 4" fill="#7a2f1b" stroke="#7a2f1b" strokeWidth="1" />
        </g>
      </g>
      {/* the job board on the main street */}
      <JobBoardArt x={BUILDINGS.board.x + 55} y={BUILDINGS.board.y + 92} />
      <PostOfficeArt x={BUILDINGS.post.x} y={BUILDINGS.post.y} />
      <OfficeArt x={BUILDINGS.office.x} y={BUILDINGS.office.y} />
      <CanteenArt x={BUILDINGS.kitchen.x} y={BUILDINGS.kitchen.y} />
      <BuildingLotArt x={BUILDINGS.lot.x} y={BUILDINGS.lot.y} />
    </g>
  );
}

export function JobBoardArt({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="0" cy="2" rx="52" ry="7" fill="#000" opacity="0.15" />
      <rect x="-44" y="-84" width="8" height="84" fill="#6b4a2a" stroke="#3a2a1a" strokeWidth="1.5" />
      <rect x="36" y="-84" width="8" height="84" fill="#6b4a2a" stroke="#3a2a1a" strokeWidth="1.5" />
      <rect x="-50" y="-92" width="100" height="58" rx="3" fill="#a8703c" stroke="#3a2a1a" strokeWidth="2.5" />
      <path d="M-56 -92 L0 -112 L56 -92 Z" fill="#7a3e32" stroke="#3a1f0e" strokeWidth="2" />
      {[
        [-38, -84, '#fbf6ea', -4],
        [-6, -86, '#f6e6b8', 3],
        [20, -82, '#e8f0f6', -2],
        [-26, -62, '#f6dcd2', 2],
        [6, -60, '#fbf6ea', -3],
      ].map(([px, py, c, r], i) => (
        <g key={i} transform={`translate(${px} ${py}) rotate(${r})`}>
          <rect width="22" height="20" fill={c as string} stroke="#8a7350" strokeWidth="1" />
          <path d="M3 6 h14 M3 11 h12 M3 15 h9" stroke="#8a7350" strokeWidth="1.2" />
          <circle cx="11" cy="1" r="2" fill="#b8452f" />
        </g>
      ))}
    </g>
  );
}

function PostOfficeArt({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="85" cy="192" rx="92" ry="9" fill="#000" opacity="0.15" />
      <rect x="10" y="50" width="150" height="140" fill="#b8573a" stroke="#4a1f12" strokeWidth="3" />
      {Array.from({ length: 9 }, (_, i) => (
        <path key={i} d={`M10 ${62 + i * 14} H160`} stroke="#8a3a24" strokeWidth="1" opacity="0.6" />
      ))}
      <path d="M0 52 L85 10 L170 52 Z" fill="#3d4a5a" stroke="#1f2630" strokeWidth="3" />
      <rect x="40" y="56" width="90" height="22" fill="#f6ecd2" stroke="#4a1f12" strokeWidth="2" />
      <text x="85" y="72" textAnchor="middle" fontSize="15" fontWeight="700" fill="#7a1a10" style={{ fontFamily: 'var(--font-serif)' }}>
        POST
      </text>
      <rect x="22" y="96" width="34" height="40" fill="#a8c8dc" stroke="#4a1f12" strokeWidth="2" />
      <rect x="114" y="96" width="34" height="40" fill="#a8c8dc" stroke="#4a1f12" strokeWidth="2" />
      <rect x="66" y="120" width="38" height="70" rx="4" fill="#2f4f6f" stroke="#1a2a3a" strokeWidth="2.5" />
      {/* the red postbox */}
      <g transform="translate(160 150)">
        <rect x="0" y="0" width="22" height="40" rx="10" fill="#c23a2a" stroke="#5a1a10" strokeWidth="2" />
        <rect x="4" y="12" width="14" height="3" fill="#2a1a10" />
      </g>
    </g>
  );
}

function OfficeArt({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="85" cy="282" rx="90" ry="9" fill="#000" opacity="0.15" />
      <rect x="14" y="40" width="142" height="240" fill="#e4dccb" stroke="#4a463c" strokeWidth="3" />
      <path d="M6 42 H164 L150 20 H20 Z" fill="#8a8478" stroke="#4a463c" strokeWidth="2.5" />
      <circle cx="85" cy="58" r="13" fill="#fbf6ea" stroke="#4a463c" strokeWidth="2" />
      <path d="M85 58 v-8 M85 58 h6" stroke="#2a2a2a" strokeWidth="2" />
      {[0, 1, 2, 3].map((r) =>
        [0, 1, 2].map((c) => <rect key={`${r}${c}`} x={30 + c * 42} y={84 + r * 42} width="26" height="28" fill="#a8c0d0" stroke="#4a463c" strokeWidth="1.5" />),
      )}
      <rect x="62" y="236" width="46" height="44" fill="#3a3a42" stroke="#1a1a20" strokeWidth="2.5" />
      <rect x="20" y="226" width="130" height="8" fill="#c8c0b0" />
      <rect x="44" y="0" width="82" height="20" fill="#2f3a52" stroke="#1a2030" strokeWidth="2" />
    </g>
  );
}

function CanteenArt({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="90" cy="172" rx="96" ry="9" fill="#000" opacity="0.15" />
      <rect x="12" y="50" width="160" height="120" fill="#d9b98a" stroke="#4a3420" strokeWidth="3" />
      <path d="M0 52 L92 8 L184 52 Z" fill="#8a4a2a" stroke="#3a1f0e" strokeWidth="3" />
      <rect x="128" y="14" width="18" height="30" fill="#6b4a3a" stroke="#3a2a1a" strokeWidth="2" />
      <g className="hub-smoke" opacity="0.6">
        <circle cx="137" cy="4" r="8" fill="#e8e4dc" />
        <circle cx="146" cy="-12" r="10" fill="#e8e4dc" />
        <circle cx="140" cy="-30" r="12" fill="#e8e4dc" />
      </g>
      {/* striped awning */}
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M${16 + i * 19} 70 h19 v18 q-9 8 -19 0 Z`} fill={i % 2 ? '#f6ecd8' : '#4d7a3a'} stroke="#2f4f22" strokeWidth="1" />
      ))}
      <rect x="24" y="100" width="44" height="40" fill="#ffd98a" stroke="#4a3420" strokeWidth="2" />
      <rect x="116" y="100" width="44" height="40" fill="#ffd98a" stroke="#4a3420" strokeWidth="2" />
      <rect x="74" y="110" width="36" height="60" rx="3" fill="#6b4222" stroke="#2a1a10" strokeWidth="2.5" />
      {/* a pot on the sign */}
      <g transform="translate(92 92)">
        <ellipse rx="12" ry="4" fill="#3a3a42" />
        <path d="M-12 0 v8 q12 8 24 0 v-8" fill="#4a4a52" stroke="#1a1a20" strokeWidth="1.5" />
      </g>
    </g>
  );
}

function BuildingLotArt({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} opacity="0.9">
      <rect x="10" y="60" width="130" height="100" fill="none" stroke="#8a6a3a" strokeWidth="4" strokeDasharray="10 6" />
      {[20, 70, 120].map((px) => (
        <rect key={px} x={px} y="40" width="8" height="120" fill="#a8703c" stroke="#5a3a1a" strokeWidth="1.5" />
      ))}
      <path d="M14 70 L136 150 M14 150 L136 70" stroke="#a8703c" strokeWidth="5" />
      <rect x="30" y="108" width="90" height="26" fill="#f6ecd2" stroke="#5a4430" strokeWidth="1.5" transform="rotate(-4 75 120)" />
      <path d="M40 116 h70 M40 124 h52" stroke="#8a7350" strokeWidth="2" transform="rotate(-4 75 120)" />
    </g>
  );
}

/** Small front of a workplace (phone list, board cards). */
export function BuildingFront({ id }: { id: string }) {
  const views: Record<string, [string, ReactNode]> = {
    teahouse: [
      '0 0 120 112',
      <g key="t">
        <rect x="14" y="40" width="92" height="66" fill="#e8d0a8" stroke="#3a2a1a" strokeWidth="3" />
        <path d="M4 42 L60 8 L116 42 Z" fill="#4d6a45" stroke="#2a3a22" strokeWidth="3" />
        <rect x="48" y="62" width="24" height="44" fill="#5e7a6a" stroke="#2a3a22" strokeWidth="2" />
        <rect x="22" y="56" width="20" height="18" fill="#ffe1a0" stroke="#5a4430" strokeWidth="1.5" />
        <g transform="translate(92 60)">
          <circle r="11" fill="#f6ecd2" stroke="#7a2f1b" strokeWidth="2" />
          <path d="M-5 -1 q5 8 10 0 Z" fill="#7a2f1b" />
        </g>
      </g>,
    ],
    post: ['-6 0 200 204', <PostOfficeArt key="p" x={0} y={0} />],
    office: ['-60 -6 290 296', <OfficeArt key="o" x={0} y={0} />],
    kitchen: ['-6 -46 200 230', <CanteenArt key="k" x={0} y={0} />],
    inn: ['-6 -4 190 178', <MapLandmarkArt key="i" lm="inn" x={0} y={0} temple="church" />],
  };
  const [vb, art] = views[id] ?? ['0 0 120 112', <rect key="x" x="20" y="30" width="80" height="74" fill="#d8c8a8" stroke="#5a4430" strokeWidth="2" />];
  return (
    <svg viewBox={vb} className="bfront" aria-hidden>
      {art}
    </svg>
  );
}

// ------------------------------------------------------------------------------------- interiors

export function JobBackdrop({ job, sky }: { job: string; sky: { top: string; bottom: string } }) {
  if (job === 'kitchen') return <KitchenBackdrop sky={sky} />;
  if (job === 'office') return <OfficeBackdrop sky={sky} />;
  if (job === 'inn') return <InnBackdrop sky={sky} />;
  return <PostBackdrop sky={sky} />;
}

/** Post office interior: green-tiled wall, a window on the harbour, a clock, the counter. */
function PostBackdrop({ sky }: { sky: { top: string; bottom: string } }) {
  return (
    <svg viewBox="0 0 1600 1000" className="job-backdrop" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="jb-post-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky.top} />
          <stop offset="1" stopColor={sky.bottom} />
        </linearGradient>
        <pattern id="jb-tiles" width="40" height="40" patternUnits="userSpaceOnUse">
          <rect width="40" height="40" fill="#cfe0d2" />
          <rect width="40" height="40" fill="none" stroke="#a8c2b0" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="1600" height="1000" fill="#e9dfc8" />
      <rect y="420" width="1600" height="340" fill="url(#jb-tiles)" />
      <rect y="410" width="1600" height="14" fill="#7a5a3a" />
      {/* window on the harbour */}
      <rect x="80" y="70" width="380" height="300" fill="url(#jb-post-sky)" stroke="#5a3a22" strokeWidth="10" />
      <path d="M80 300 Q200 280 300 300 T460 296 V370 H80 Z" fill="#5f9ab8" />
      <path d="M200 290 l40 -60 l4 60 Z" fill="#f4ecd8" stroke="#8a7350" strokeWidth="2" />
      <path d="M180 292 h80 l-10 12 h-62 Z" fill="#5a3a22" />
      <path d="M270 70 V370 M80 220 H460" stroke="#5a3a22" strokeWidth="8" />
      {/* clock */}
      <g transform="translate(800 150)">
        <circle r="60" fill="#fbf6ea" stroke="#5a3a22" strokeWidth="8" />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d="M0 -50 v10" stroke="#3a2a1a" strokeWidth="3" transform={`rotate(${i * 30})`} />
        ))}
        <path d="M0 0 V-38 M0 0 L26 12" stroke="#2a1a10" strokeWidth="5" strokeLinecap="round" />
      </g>
      {/* flag of the post: a horn */}
      <g transform="translate(1120 90)">
        <rect width="200" height="110" rx="6" fill="#c23a2a" stroke="#5a1a10" strokeWidth="4" />
        <path d="M50 60 q50 -40 100 0 q-50 30 -100 0 Z" fill="#f2c040" stroke="#7a5a10" strokeWidth="3" />
        <circle cx="150" cy="60" r="12" fill="#f2c040" stroke="#7a5a10" strokeWidth="3" />
      </g>
      {/* counter (foreground) */}
      <rect y="760" width="1600" height="240" fill="#8e5a2e" />
      <rect y="748" width="1600" height="24" fill="#a8703c" stroke="#5a3418" strokeWidth="3" />
      {Array.from({ length: 16 }, (_, i) => (
        <path key={i} d={`M${i * 100 + 50} 780 V1000`} stroke="#6e4422" strokeWidth="3" />
      ))}
    </svg>
  );
}

// ------------------------------------------------------------------------------------- things

/** A thing's drawing by art key (post goods here, food / documents in art2). */
export function ThingArt({ art, size = 64 }: { art: string; size?: number }) {
  if (KITCHEN_FOODS.has(art)) return <FoodArt art={art} size={size} />;
  if (art.startsWith('doc_')) return <DocArt art={art} size={size} />;
  const inner: Record<string, ReactNode> = {
    stamp: (
      <g>
        <rect x="14" y="10" width="36" height="44" fill="#fbf6ea" stroke="#b8452f" strokeWidth="3" strokeDasharray="3 3" />
        <rect x="20" y="16" width="24" height="26" fill="#5f9ab8" />
        <path d="M22 38 l8 -12 l6 8 l4 -4 l4 8 Z" fill="#4d7a3a" />
        <text x="32" y="51" textAnchor="middle" fontSize="8" fill="#b8452f" fontWeight="700">
          2
        </text>
      </g>
    ),
    envelope: (
      <g>
        <rect x="6" y="16" width="52" height="34" fill="#fbf6ea" stroke="#8a7350" strokeWidth="2.5" />
        <path d="M6 16 L32 36 L58 16" fill="none" stroke="#8a7350" strokeWidth="2.5" />
      </g>
    ),
    postcard: (
      <g>
        <rect x="6" y="14" width="52" height="36" fill="#f6e6b8" stroke="#8a7350" strokeWidth="2.5" />
        <rect x="10" y="18" width="26" height="28" fill="#5f9ab8" />
        <circle cx="18" cy="26" r="4" fill="#f2c040" />
        <path d="M10 40 q8 -8 14 -2 q6 6 12 -2 V46 H10 Z" fill="#4d7a3a" />
        <path d="M40 24 h14 M40 30 h14 M40 36 h10" stroke="#8a7350" strokeWidth="1.5" />
      </g>
    ),
    box: (
      <g>
        <path d="M10 24 L32 14 L54 24 L54 48 L32 58 L10 48 Z" fill="#c49a5e" stroke="#6b4a22" strokeWidth="2.5" />
        <path d="M10 24 L32 34 L54 24 M32 34 V58" fill="none" stroke="#6b4a22" strokeWidth="2.5" />
        <path d="M21 19 L43 29" stroke="#e8d0a8" strokeWidth="4" />
      </g>
    ),
    letter: (
      <g>
        <rect x="6" y="16" width="52" height="34" fill="#fbf6ea" stroke="#8a7350" strokeWidth="2.5" />
        <rect x="44" y="20" width="10" height="12" fill="#b8452f" />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 64 64" width={size} height={size} className="thing-art" aria-hidden>
      {inner[art] ?? <circle cx="32" cy="32" r="20" fill="#d8c8a8" stroke="#5a4430" strokeWidth="2" />}
    </svg>
  );
}

/** Icons on the sorting cabinet's cubbies. */
export function BinIcon({ art }: { art?: string }) {
  const s = '#3a2a1a';
  const g: Record<string, ReactNode> = {
    school: (
      <g>
        <rect x="8" y="22" width="32" height="20" fill="#e8c8a0" stroke={s} strokeWidth="2" />
        <path d="M18 22 V12 h12 v10" fill="#e8c8a0" stroke={s} strokeWidth="2" />
        <circle cx="24" cy="17" r="3" fill="#fbf6ea" stroke={s} />
      </g>
    ),
    hospital: (
      <g>
        <rect x="8" y="14" width="32" height="28" fill="#fbf8f2" stroke={s} strokeWidth="2" />
        <path d="M21 20 h6 v5 h5 v6 h-5 v5 h-6 v-5 h-5 v-6 h5 Z" fill="#3d8a5a" />
      </g>
    ),
    bank: (
      <g>
        <path d="M6 18 L24 8 L42 18 Z" fill="#d8d0c0" stroke={s} strokeWidth="2" />
        {[10, 18, 26, 34].map((x) => (
          <rect key={x} x={x} y="20" width="4" height="18" fill="#fbf8f2" stroke={s} />
        ))}
        <rect x="6" y="38" width="36" height="4" fill="#c8c0b0" stroke={s} />
      </g>
    ),
    inn: (
      <g>
        <rect x="8" y="20" width="32" height="22" fill="#d9b98a" stroke={s} strokeWidth="2" />
        <path d="M4 22 L24 8 L44 22 Z" fill="#7a3e32" stroke={s} strokeWidth="2" />
        <path d="M14 36 h20 M14 36 v-6 h6 v3 h14 v3" stroke={s} strokeWidth="2" fill="none" />
      </g>
    ),
    station: (
      <g>
        <rect x="6" y="18" width="36" height="16" rx="4" fill="#3d6c9e" stroke={s} strokeWidth="2" />
        <rect x="10" y="21" width="8" height="6" fill="#ffe1a0" />
        <rect x="22" y="21" width="8" height="6" fill="#ffe1a0" />
        <circle cx="14" cy="37" r="3" fill={s} />
        <circle cx="34" cy="37" r="3" fill={s} />
        <path d="M2 42 H46" stroke={s} strokeWidth="2" />
      </g>
    ),
    library: (
      <g>
        {[8, 15, 22, 29, 36].map((x, i) => (
          <rect key={x} x={x} y={14 + (i % 2) * 3} width="6" height={26 - (i % 2) * 3} fill={['#b8452f', '#3d6c9e', '#4d7a3a', '#c99a3c', '#5c4a72'][i]} stroke={s} />
        ))}
        <path d="M6 41 H44" stroke={s} strokeWidth="2" />
      </g>
    ),
    park: (
      <g>
        <rect x="22" y="28" width="4" height="12" fill="#6b4a2a" />
        <circle cx="24" cy="22" r="12" fill="#5e8a46" stroke="#3a5a2a" strokeWidth="2" />
        <path d="M6 40 H42" stroke="#4d7a3a" strokeWidth="3" />
      </g>
    ),
    church: (
      <g>
        <rect x="14" y="20" width="20" height="22" fill="#ece2cc" stroke={s} strokeWidth="2" />
        <path d="M12 21 L24 6 L36 21 Z" fill="#6b4a5a" stroke={s} strokeWidth="2" />
        <circle cx="24" cy="28" r="4" fill="#c8a0d8" stroke={s} />
      </g>
    ),
    north: <Arrow rot={0} letter="N" />,
    south: <Arrow rot={180} letter="S" />,
    east: <Arrow rot={90} letter="E" />,
    west: <Arrow rot={270} letter="W" />,
    island: (
      <g>
        <path d="M2 36 q22 -8 44 0 V44 H2 Z" fill="#5f9ab8" />
        <ellipse cx="24" cy="34" rx="14" ry="5" fill="#e8d0a0" />
        <path d="M24 32 V16 M24 16 q-10 -2 -14 4 M24 16 q10 -2 14 4 M24 16 q-4 -8 -10 -8 M24 16 q4 -8 10 -8" stroke="#4d7a3a" strokeWidth="2.5" fill="none" />
      </g>
    ),
    abroad: (
      <g>
        <circle cx="24" cy="26" r="16" fill="#5f9ab8" stroke={s} strokeWidth="2" />
        <path d="M14 18 q6 -2 8 4 q-2 6 4 8 M28 14 q6 4 8 12" stroke="#4d7a3a" strokeWidth="4" fill="none" />
        <path d="M6 10 l10 4 l8 -4 l2 2 l-6 6 l2 8 l-2 1 l-4 -6 l-6 3 Z" fill="#fbf6ea" stroke={s} strokeWidth="1" />
      </g>
    ),
    back: (
      <g>
        <rect x="10" y="16" width="30" height="20" fill="#fbf6ea" stroke={s} strokeWidth="2" />
        <path d="M36 42 H14 l6 -5 M14 42 l6 5" stroke="#b8452f" strokeWidth="3" fill="none" strokeLinecap="round" />
      </g>
    ),
  };
  return (
    <svg viewBox="0 0 48 48" className="bin-icon" aria-hidden>
      {art && g[art] ? g[art] : <rect x="10" y="10" width="28" height="28" fill="#e8d0a8" stroke={s} strokeWidth="2" />}
    </svg>
  );
}

function Arrow({ rot, letter }: { rot: number; letter: string }) {
  return (
    <g>
      <circle cx="24" cy="24" r="17" fill="#f6ecd2" stroke="#8a7350" strokeWidth="2" />
      <path d="M24 8 L30 26 L24 22 L18 26 Z" fill="#7a2f1b" transform={`rotate(${rot} 24 24)`} />
      <text x="24" y="43" textAnchor="middle" fontSize="7" fill="#3a2a1a" opacity="0">
        {letter}
      </text>
    </g>
  );
}

/** A coin (value written on it) for the counter / till. */
export function CoinDisc({ v, size = 40 }: { v: number; size?: number }) {
  const fill = v >= 10 ? '#d9b54a' : v >= 5 ? '#c8c8c0' : '#b87a4a';
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className="coin-disc" aria-hidden>
      <circle cx="20" cy="20" r="17" fill={fill} stroke="#5a4430" strokeWidth="2.5" />
      <circle cx="20" cy="20" r="12" fill="none" stroke="#5a4430" strokeWidth="1" opacity="0.5" />
      <text x="20" y="25" textAnchor="middle" fontSize="13" fontWeight="700" fill="#3a2a1a">
        {v}
      </text>
    </svg>
  );
}

/** Coins for an amount (greedy, big first). */
export function coinsFor(amount: number, coins: number[]): number[] {
  const out: number[] = [];
  let left = amount;
  for (const c of [...coins].sort((a, b) => b - a))
    while (left >= c) {
      out.push(c);
      left -= c;
    }
  return out;
}
