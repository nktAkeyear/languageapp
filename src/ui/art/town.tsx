/**
 * The town outside the shop, drawn in SVG: the market street (sky, roofs, cobbles, stalls with
 * striped awnings), coins, purse and basket; the illustrated town map (sea and harbour with
 * ships, the river and its bridge, landmark buildings, houses with coloured doors); the house
 * fronts at the door; the sun dial used to choose a delivery time.
 */
import type { LandmarkId } from '../../core/townTypes';
import type { SkyColours } from './sky';

export const STALL_COLOURS: Record<string, { main: string; dark: string; light: string }> = {
  red: { main: '#b8452f', dark: '#7a2a1a', light: '#e88a6a' },
  yellow: { main: '#d9a520', dark: '#8a6410', light: '#f4d36a' },
  blue: { main: '#3d6c9e', dark: '#24466e', light: '#86aed6' },
  green: { main: '#4d7a3a', dark: '#2f4f22', light: '#94bc78' },
};
export const DOOR_COLOURS: Record<string, string> = { red: '#b8452f', yellow: '#d9a520', blue: '#3d6c9e', green: '#4d7a3a' };

// ------------------------------------------------------------------------------------- market street

/** Sky, far roofs and the cobbled street (W × H design units). */
export function MarketBackdrop({ sky, W = 1600, H = 1000, ground = 600 }: { sky: SkyColours; W?: number; H?: number; ground?: number }) {
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="backdrop" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <linearGradient id="mk-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={sky.top} />
          <stop offset="1" stopColor={sky.bottom} />
        </linearGradient>
        <linearGradient id="mk-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9a283" />
          <stop offset="1" stopColor="#8c7458" />
        </linearGradient>
        <pattern id="mk-cobble" width="64" height="34" patternUnits="userSpaceOnUse">
          <rect width="64" height="34" fill="#b9a283" />
          <path d="M3 3 q13 -3 26 0 q2 6 0 12 q-13 3 -26 0 q-2 -6 0 -12 Z M35 3 q13 -3 26 0 q2 6 0 12 q-13 3 -26 0 q-2 -6 0 -12 Z M-13 20 q13 -3 26 0 q2 6 0 11 q-13 3 -26 0 q-2 -6 0 -11 Z M19 20 q13 -3 26 0 q2 6 0 11 q-13 3 -26 0 q-2 -6 0 -11 Z M51 20 q13 -3 26 0 q2 6 0 11 q-13 3 -26 0 q-2 -6 0 -11 Z" fill="#cdb898" stroke="#7a6248" strokeWidth="1.2" opacity="0.8" />
        </pattern>
        <pattern id="mk-cobble-far" width="40" height="18" patternUnits="userSpaceOnUse">
          <rect width="40" height="18" fill="#c2ad8e" />
          <path d="M2 2 q8 -2 16 0 q1 3 0 6 q-8 2 -16 0 q-1 -3 0 -6 Z M22 2 q8 -2 16 0 q1 3 0 6 q-8 2 -16 0 q-1 -3 0 -6 Z M-8 11 q8 -2 16 0 q1 3 0 5 q-8 2 -16 0 Z M12 11 q8 -2 16 0 q1 3 0 5 q-8 2 -16 0 Z M32 11 q8 -2 16 0 q1 3 0 5 q-8 2 -16 0 Z" fill="#d2bfa2" stroke="#8a7458" strokeWidth="0.8" opacity="0.75" />
        </pattern>
        <linearGradient id="mk-near" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff" stopOpacity="0.12" />
          <stop offset="1" stopColor="#2a1a0a" stopOpacity="0.35" />
        </linearGradient>
      </defs>
      <rect width={W} height={ground} fill="url(#mk-sky)" />
      <circle cx={W * 0.8} cy={60 + (1 - sky.sun) * 200} r="44" fill="#fff6d8" opacity="0.9" />
      <g fill="#fff" opacity="0.55">
        <ellipse cx={W * 0.2} cy="90" rx="90" ry="16" />
        <ellipse cx={W * 0.26} cy="80" rx="50" ry="16" />
        <ellipse cx={W * 0.6} cy="130" rx="70" ry="12" />
      </g>
      {/* far roofs along the street */}
      {Array.from({ length: 9 }, (_, i) => {
        const x = i * (W / 8) - 40;
        const h = 150 + ((i * 53) % 90);
        const roof = ['#a8573a', '#8a5a3a', '#6b4a3a', '#b8452f', '#5c4a62'][i % 5];
        return (
          <g key={i}>
            <rect x={x} y={ground - h} width={W / 8 + 6} height={h} fill="#e3d0ad" stroke="#6b5440" strokeWidth="2" />
            <path d={`M${x - 10} ${ground - h} L${x + W / 16} ${ground - h - 60} L${x + W / 8 + 16} ${ground - h} Z`} fill={roof} stroke="#3a2a1a" strokeWidth="2" />
            <rect x={x + 30} y={ground - h + 40} width="34" height="40" fill="#7a9ab0" stroke="#6b5440" strokeWidth="2" />
            <rect x={x + W / 8 - 70} y={ground - h + 40} width="34" height="40" fill="#7a9ab0" stroke="#6b5440" strokeWidth="2" />
          </g>
        );
      })}
      {/* bunting across the street */}
      <path d={`M0 70 Q${W / 2} 150 ${W} 70`} stroke="#5a4a3a" strokeWidth="2" fill="none" />
      {Array.from({ length: 16 }, (_, i) => {
        const x = 40 + i * (W / 16);
        const t = x / W;
        const y = 70 + 4 * 80 * t * (1 - t) + 2;
        const c = ['#b8452f', '#d9a520', '#3d6c9e', '#4d7a3a'][i % 4];
        return <path key={i} d={`M${x - 14} ${y} L${x + 14} ${y} L${x} ${y + 26} Z`} fill={c} opacity="0.9" />;
      })}
      <rect x="0" y={ground} width={W} height={(H - ground) * 0.3} fill="url(#mk-cobble-far)" />
      <rect x="0" y={ground + (H - ground) * 0.3} width={W} height={(H - ground) * 0.7} fill="url(#mk-cobble)" />
      <rect x="0" y={ground} width={W} height={H - ground} fill="url(#mk-near)" />
      <rect x="0" y={ground} width={W} height="14" fill="#6b5440" opacity="0.5" />
      <rect x="0" y="0" width={W} height={H} fill={sky.light} opacity="0.06" />
    </svg>
  );
}

/** A market stall: posts, a striped awning in the stall's colour, a counter with a cloth. */
export function StallFrameArt({ colour, w = 340, h = 420 }: { colour: string; w?: number; h?: number }) {
  const c = STALL_COLOURS[colour] ?? STALL_COLOURS.red;
  const awnH = h * 0.24;
  const counterY = h * 0.66;
  const stripes = 7;
  const sw = w / stripes;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="stall-frame" preserveAspectRatio="none" aria-hidden>
      {/* back cloth */}
      <rect x="12" y={awnH} width={w - 24} height={counterY - awnH} fill={c.dark} opacity="0.35" />
      {/* posts */}
      <rect x="8" y={awnH - 10} width="14" height={h - awnH} fill="#7a4a26" stroke="#3a1f0e" strokeWidth="2" />
      <rect x={w - 22} y={awnH - 10} width="14" height={h - awnH} fill="#7a4a26" stroke="#3a1f0e" strokeWidth="2" />
      {/* awning */}
      {Array.from({ length: stripes }, (_, i) => (
        <rect key={i} x={i * sw} y="0" width={sw} height={awnH} fill={i % 2 ? '#f6ecd8' : c.main} />
      ))}
      <path d={`M0 ${awnH} ${Array.from({ length: stripes }, (_, i) => `Q${i * sw + sw / 2} ${awnH + 22} ${(i + 1) * sw} ${awnH}`).join(' ')} Z`} fill={c.main} stroke={c.dark} strokeWidth="2" />
      {Array.from({ length: stripes }, (_, i) =>
        i % 2 ? <path key={i} d={`M${i * sw} ${awnH} Q${i * sw + sw / 2} ${awnH + 22} ${(i + 1) * sw} ${awnH} Z`} fill="#f6ecd8" /> : null,
      )}
      <rect x="0" y="0" width={w} height="10" fill={c.dark} />
      <rect x="0" y="0" width={w} height={awnH} fill="url(#g-vignette)" opacity="0.25" />
      {/* counter */}
      <rect x="4" y={counterY} width={w - 8} height="16" rx="3" fill="#a8703c" stroke="#3a1f0e" strokeWidth="2" />
      <rect x="10" y={counterY + 16} width={w - 20} height={h - counterY - 16} fill="#7a4a26" stroke="#3a1f0e" strokeWidth="2" filter="url(#tx-wood-v)" />
      <path d={`M10 ${counterY + 16} H${w - 10} V${counterY + 50} ${Array.from({ length: 8 }, (_, i) => `Q${w - 10 - (i + 0.5) * ((w - 20) / 8)} ${counterY + 64} ${w - 10 - (i + 1) * ((w - 20) / 8)} ${counterY + 50}`).join(' ')} Z`} fill={c.main} opacity="0.92" />
      <path d={`M10 ${counterY + 22} H${w - 10}`} stroke={c.light} strokeWidth="3" strokeDasharray="10 8" />
      {/* crates under the counter */}
      <rect x="30" y={h - 60} width="80" height="56" fill="#c49a5e" stroke="#6b4a22" strokeWidth="2" />
      <path d={`M30 ${h - 40} h80 M30 ${h - 22} h80`} stroke="#6b4a22" strokeWidth="2" />
    </svg>
  );
}

/** A coin by value: copper 1, brass 5, silver 10, gold 50 (with the number stamped in). */
export function CoinArt({ value }: { value: number }) {
  const look: Record<number, [string, string, string]> = {
    1: ['#d58a5c', '#8e4526', '#f1b07a'],
    5: ['#c99a3c', '#7d5a1c', '#f6dc8a'],
    10: ['#c8ccd0', '#6d737a', '#f4f6f8'],
    50: ['#e8c040', '#8a6410', '#fff2a8'],
  };
  const [m, d, l] = look[value] ?? look[1];
  const r = value >= 50 ? 30 : value >= 10 ? 27 : value >= 5 ? 25 : 22;
  return (
    <svg viewBox="-32 -32 64 64" className="coin-art" aria-hidden>
      <circle r={r} fill={m} stroke={d} strokeWidth="2.5" />
      <circle r={r - 6} fill="none" stroke={d} strokeWidth="1.2" opacity="0.6" />
      <path d={`M${-r * 0.6} ${-r * 0.5} A${r} ${r} 0 0 1 ${r * 0.5} ${-r * 0.65}`} stroke={l} strokeWidth="3" fill="none" opacity="0.7" />
      {value === 10 ? <circle r="5" fill="#00000030" /> : null}
      <text y={value === 10 ? 17 : 7} textAnchor="middle" fontSize={value === 10 ? 12 : 20} fontWeight="700" fill={d} style={{ fontFamily: 'var(--font-serif)' }}>
        {value}
      </text>
    </svg>
  );
}

export function PurseArt({ open }: { open: boolean }) {
  return (
    <svg viewBox="0 0 160 130" className="purse-art" aria-hidden>
      <ellipse cx="80" cy="122" rx="66" ry="7" fill="#1d0e05" opacity="0.3" />
      <path d="M22 54 Q14 118 80 120 Q146 118 138 54 Z" fill="#8a4a2a" stroke="#4a2410" strokeWidth="3" />
      <path d="M30 70 Q80 88 130 70" stroke="#5a2e16" strokeWidth="2" fill="none" strokeDasharray="5 4" />
      {open ? (
        <g>
          <ellipse cx="80" cy="54" rx="58" ry="14" fill="#3a1a0a" stroke="#4a2410" strokeWidth="3" />
          <circle cx="62" cy="52" r="9" fill="#e8c040" stroke="#8a6410" />
          <circle cx="86" cy="50" r="9" fill="#c8ccd0" stroke="#6d737a" />
          <circle cx="102" cy="55" r="8" fill="#d58a5c" stroke="#8e4526" />
        </g>
      ) : (
        <g>
          <path d="M22 54 Q80 30 138 54 Q80 64 22 54 Z" fill="#a85a32" stroke="#4a2410" strokeWidth="3" />
          <path d="M60 46 Q80 18 100 46" stroke="#4a2410" strokeWidth="4" fill="none" />
        </g>
      )}
      <circle cx="80" cy="96" r="8" fill="url(#g-brass)" stroke="#5a3c12" />
    </svg>
  );
}

export function BasketArt() {
  return (
    <svg viewBox="0 0 260 150" className="basket-art" aria-hidden>
      <ellipse cx="130" cy="142" rx="118" ry="8" fill="#1d0e05" opacity="0.3" />
      <path d="M40 60 Q130 -30 220 60" stroke="#8e6a32" strokeWidth="10" fill="none" />
      <path d="M40 60 Q130 -30 220 60" stroke="#d6ad6a" strokeWidth="5" fill="none" />
      <path d="M14 60 L246 60 L222 138 L38 138 Z" fill="url(#gl-wicker)" stroke="#6b4a22" strokeWidth="3" />
      {[0, 1, 2, 3].map((r) => (
        <path key={r} d={`M${18 + r * 6} ${76 + r * 16} H${242 - r * 6}`} stroke="#8e6a32" strokeWidth="3" opacity="0.7" />
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <path key={i} d={`M${30 + i * 20} 62 L${44 + i * 17} 136`} stroke="#8e6a32" strokeWidth="2" opacity="0.5" />
      ))}
      <rect x="10" y="54" width="240" height="12" rx="6" fill="#b88a4a" stroke="#6b4a22" strokeWidth="2" />
    </svg>
  );
}

/** A wooden signpost arrow (pointing right unless flipped). */
export function SignpostArt({ flip = false }: { flip?: boolean }) {
  return (
    <svg viewBox="0 0 220 150" className="signpost-art" aria-hidden>
      <rect x="100" y="40" width="16" height="110" fill="#6b4222" stroke="#3a1f0e" strokeWidth="2" />
      <g transform={flip ? 'translate(220 0) scale(-1 1)' : undefined}>
        <path d="M14 18 H178 L208 50 L178 82 H14 Z" fill="#a8703c" stroke="#3a1f0e" strokeWidth="3" filter="url(#tx-wood)" />
        <path d="M24 30 H172" stroke="#c48a52" strokeWidth="2" opacity="0.7" />
      </g>
    </svg>
  );
}

// ------------------------------------------------------------------------------------- town map

export const MAP_W = 1200;
export const MAP_H = 900;
export const MAP_X0 = 150;
export const CELL_W = 150;
/** Top y and height of each row (rows 0–1 north of the main street, 2–3 south). */
export const ROW_Y = [40, 236, 486, 682];
export const ROW_H = 168;
export const STREET_Y = [404, 486];
/** Where our shop is: the west end of the main street, by the water. */
export const SHOP_POINT = { x: 96, y: 445 };

export const cellBox = (col: number, row: number) => ({ x: MAP_X0 + col * CELL_W, y: ROW_Y[row], w: CELL_W, h: ROW_H });

/** The map ground: sea with ships on the west and south, streets, the river on the east. */
export function MapGroundArt({ tint }: { tint: string }) {
  const W = MAP_W;
  const H = MAP_H;
  return (
    <g>
      <defs>
        <pattern id="map-sea" width="80" height="30" patternUnits="userSpaceOnUse">
          <rect width="80" height="30" fill="#5f9ab8" />
          <path d="M4 14 q10 -6 20 0 t20 0" stroke="#d8eef6" strokeWidth="2" fill="none" opacity="0.6" />
        </pattern>
      </defs>
      <rect width={W} height={H} fill="#e6d6b0" />
      {/* sea: west and south */}
      <path d={`M0 0 H120 Q140 200 112 420 Q96 520 132 640 Q150 780 ${W - 140} 868 Q${W - 60} 880 ${W} 872 V${H} H0 Z`} fill="url(#map-sea)" />
      <path d={`M120 0 Q140 200 112 420 Q96 520 132 640 Q150 780 ${W - 140} 868 Q${W - 60} 880 ${W} 872`} stroke="#c9b48a" strokeWidth="10" fill="none" />
      {/* the river on the east, under the bridge, into the sea */}
      <path d={`M${W - 92} 0 C${W - 70} 200 ${W - 100} 360 ${W - 82} 520 S${W - 60} 760 ${W - 76} 880`} stroke="#5f9ab8" strokeWidth="64" fill="none" />
      <path d={`M${W - 92} 0 C${W - 70} 200 ${W - 100} 360 ${W - 82} 520 S${W - 60} 760 ${W - 76} 880`} stroke="#d8eef6" strokeWidth="2" strokeDasharray="14 22" fill="none" opacity="0.7" />
      {/* main street and back lanes */}
      <rect x={MAP_X0 - 70} y={STREET_Y[0]} width={W - MAP_X0 - 40} height={STREET_Y[1] - STREET_Y[0]} fill="#cdb48a" stroke="#9a8460" strokeWidth="2" />
      <path d={`M${MAP_X0 - 70} ${(STREET_Y[0] + STREET_Y[1]) / 2} H${W - 110}`} stroke="#f6ecd2" strokeWidth="3" strokeDasharray="18 16" opacity="0.7" />
      <rect x={MAP_X0} y={ROW_Y[0] + ROW_H} width={CELL_W * 6} height={ROW_Y[1] - ROW_Y[0] - ROW_H} fill="#d6c29a" />
      <rect x={MAP_X0} y={ROW_Y[2] + ROW_H} width={CELL_W * 6} height={ROW_Y[3] - ROW_Y[2] - ROW_H} fill="#d6c29a" />
      {/* ships in the sea */}
      <MapShip x={52} y={170} s={1.1} />
      <MapShip x={60} y={720} s={0.9} />
      <MapShip x={520} y={872} s={0.8} />
      <MapShip x={820} y={884} s={0.7} />
      {/* compass rose */}
      <g transform={`translate(${W - 40} 52)`} opacity="0.75">
        <circle r="26" fill="#f6ecd2" stroke="#8a7350" strokeWidth="2" />
        <path d="M0 -24 L6 0 L0 24 L-6 0 Z" fill="#7a2f1b" />
        <path d="M-24 0 L0 6 L24 0 L0 -6 Z" fill="#3a2e22" opacity="0.6" />
        <text y="-30" textAnchor="middle" fontSize="14" fill="#7a2f1b" fontWeight="700" style={{ fontFamily: 'var(--font-serif)' }}>
          北
        </text>
      </g>
      <rect width={W} height={H} fill={tint} opacity="0.1" />
    </g>
  );
}

function MapShip({ x, y, s }: { x: number; y: number; s: number }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className="map-ship">
      <path d="M-34 0 L34 0 L24 14 L-24 14 Z" fill="#5a3a22" stroke="#2a1a10" strokeWidth="2" />
      <line x1="0" y1="0" x2="0" y2="-48" stroke="#2a1a10" strokeWidth="3" />
      <path d="M3 -46 L28 -6 L3 -6 Z" fill="#f4ecd8" stroke="#8a7350" />
      <path d="M-3 -40 L-22 -8 L-3 -8 Z" fill="#e9dcc0" stroke="#8a7350" />
      <path d="M0 -48 l12 4 l-12 4 Z" fill="#b8452f" />
    </g>
  );
}

/** A house on the map (front elevation): roof, wall, a window and the coloured door. */
export function MapHouseArt({ x, y, door, seed, facing }: { x: number; y: number; door: string; seed: number; facing: 'down' | 'up' }) {
  const roof = ['#a8573a', '#8a5a3a', '#6b4a3a', '#b8452f', '#5c4a62', '#7a6a3a'][seed % 6];
  const wall = ['#efe2c4', '#e8d6b0', '#f2e8d4', '#e4d2b4'][seed % 4];
  const bx = x + 26;
  const bw = CELL_W - 52;
  const top = y + 56;
  const bot = y + ROW_H - 18;
  return (
    <g>
      <ellipse cx={x + CELL_W / 2} cy={bot + 6} rx={bw / 2 + 10} ry="8" fill="#000" opacity="0.15" />
      <rect x={bx} y={top} width={bw} height={bot - top} fill={wall} stroke="#5a4430" strokeWidth="2.5" />
      <path d={`M${bx - 12} ${top + 2} L${x + CELL_W / 2} ${y + 14} L${bx + bw + 12} ${top + 2} Z`} fill={roof} stroke="#3a2a1a" strokeWidth="2.5" />
      <rect x={bx + bw - 30} y={y + 24} width="12" height="26" fill="#6b4a3a" stroke="#3a2a1a" strokeWidth="1.5" />
      <rect x={bx + 10} y={top + 14} width="26" height="24" fill="#8ab0c8" stroke="#5a4430" strokeWidth="2" />
      <path d={`M${bx + 23} ${top + 14} v24 M${bx + 10} ${top + 26} h26`} stroke="#5a4430" strokeWidth="1.5" />
      {/* the door, facing the street */}
      <rect x={bx + bw - 44} y={facing === 'down' ? bot - 50 : top + 4} width="30" height={facing === 'down' ? 50 : 46} rx="3" fill={door} stroke="#2a1a10" strokeWidth="2.5" />
      <circle cx={bx + bw - 20} cy={facing === 'down' ? bot - 24 : top + 28} r="2.5" fill="#f6dc8a" />
    </g>
  );
}

/** A landmark building on the map, each drawn distinctly. */
export function MapLandmarkArt({ lm, x, y, temple }: { lm: LandmarkId; x: number; y: number; temple: 'church' | 'pagoda' }) {
  const cx = x + CELL_W / 2;
  const bot = y + ROW_H - 18;
  switch (lm) {
    case 'harbour':
      return (
        <g>
          {/* pier into the sea */}
          <rect x={x - 70} y={bot - 34} width={CELL_W + 40} height="20" fill="#8e5a2e" stroke="#3a1f0e" strokeWidth="2" />
          {Array.from({ length: 8 }, (_, i) => (
            <rect key={i} x={x - 64 + i * 22} y={bot - 14} width="6" height="22" fill="#5a3418" />
          ))}
          <rect x={x + 30} y={y + 58} width="70" height={bot - y - 92} fill="#c8a878" stroke="#5a4430" strokeWidth="2" />
          <path d={`M${x + 22} ${y + 60} L${x + 65} ${y + 30} L${x + 108} ${y + 60} Z`} fill="#3d6c9e" stroke="#24466e" strokeWidth="2" />
          {/* crane */}
          <path d={`M${x + 118} ${bot - 34} V${y + 26} L${x + 60} ${y + 40}`} stroke="#5a3418" strokeWidth="6" fill="none" />
          <path d={`M${x + 60} ${y + 40} v28`} stroke="#3a2a1a" strokeWidth="2" />
          <rect x={x + 52} y={y + 68} width="16" height="12" fill="#a8703c" />
          <g transform={`translate(${x + 65} ${y + 92})`} stroke="#24466e" strokeWidth="3" fill="none" strokeLinecap="round">
            <circle cy="-12" r="3.5" />
            <path d="M0 -8 V12 M-8 -2 H8 M-11 4 Q-9 14 0 12 Q9 14 11 4" />
          </g>
          <MapShip x={x - 40} y={bot - 40} s={0.85} />
        </g>
      );
    case 'inn':
      return (
        <g>
          <rect x={x + 18} y={y + 40} width={CELL_W - 36} height={bot - y - 40} fill="#d9b98a" stroke="#5a4430" strokeWidth="2.5" />
          <path d={`M${x + 8} ${y + 42} L${cx} ${y + 10} L${x + CELL_W - 8} ${y + 42} Z`} fill="#7a3e32" stroke="#3a1f0e" strokeWidth="2.5" />
          {[0, 1, 2].map((i) => (
            <rect key={i} x={x + 30 + i * 32} y={y + 54} width="22" height="22" fill="#ffd98a" stroke="#5a4430" strokeWidth="2" />
          ))}
          <rect x={cx - 16} y={bot - 44} width="32" height="44" rx="12" fill="#6b4222" stroke="#2a1a10" strokeWidth="2" />
          {/* hanging sign: a bed */}
          <path d={`M${x + CELL_W - 22} ${y + 84} h22`} stroke="#3a2a1a" strokeWidth="3" />
          <rect x={x + CELL_W - 8} y={y + 88} width="30" height="22" fill="#f6ecd2" stroke="#5a4430" strokeWidth="1.5" />
          <path d={`M${x + CELL_W - 4} ${y + 104} h22 M${x + CELL_W - 4} ${y + 104} v-8 h8 v4 h14`} stroke="#3a2a1a" strokeWidth="2" fill="none" />
        </g>
      );
    case 'school':
      return (
        <g>
          <rect x={x + 14} y={y + 60} width={CELL_W - 28} height={bot - y - 60} fill="#e8c8a0" stroke="#5a4430" strokeWidth="2.5" />
          <rect x={cx - 20} y={y + 22} width="40" height="44" fill="#e8c8a0" stroke="#5a4430" strokeWidth="2.5" />
          <path d={`M${cx - 28} ${y + 24} L${cx} ${y + 2} L${cx + 28} ${y + 24} Z`} fill="#4d7a3a" stroke="#2f4f22" strokeWidth="2" />
          <circle cx={cx} cy={y + 42} r="12" fill="#fbf6ea" stroke="#3a2a1a" strokeWidth="2" />
          <path d={`M${cx} ${y + 42} v-8 M${cx} ${y + 42} h6`} stroke="#3a2a1a" strokeWidth="2" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={x + 24 + i * 28} y={y + 76} width="18" height="20" fill="#8ab0c8" stroke="#5a4430" strokeWidth="1.5" />
          ))}
          <rect x={cx - 14} y={bot - 38} width="28" height="38" fill="#4d7a3a" stroke="#2a1a10" strokeWidth="2" />
          <path d={`M${x + 4} ${bot} h${CELL_W - 8}`} stroke="#8a7350" strokeWidth="3" />
        </g>
      );
    case 'bank':
      return (
        <g>
          <rect x={x + 16} y={y + 52} width={CELL_W - 32} height={bot - y - 52} fill="#ece6da" stroke="#5a5448" strokeWidth="2.5" />
          <path d={`M${x + 8} ${y + 54} L${cx} ${y + 18} L${x + CELL_W - 8} ${y + 54} Z`} fill="#d8d0c0" stroke="#5a5448" strokeWidth="2.5" />
          <circle cx={cx} cy={y + 40} r="8" fill="url(#g-brass)" />
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={x + 26 + i * 28} y={y + 60} width="12" height={bot - y - 72} fill="#fbf8f2" stroke="#8a8478" strokeWidth="1.5" />
          ))}
          <rect x={x + 12} y={bot - 10} width={CELL_W - 24} height="10" fill="#c8c0b0" stroke="#5a5448" strokeWidth="1.5" />
        </g>
      );
    case 'hospital':
      return (
        <g>
          <rect x={x + 12} y={y + 34} width={CELL_W - 24} height={bot - y - 34} fill="#f8f6f0" stroke="#5a5a62" strokeWidth="2.5" />
          <rect x={x + 8} y={y + 26} width={CELL_W - 16} height="12" fill="#6a8ab0" stroke="#3a4a62" strokeWidth="2" />
          <g transform={`translate(${cx} ${y + 62})`}>
            <circle r="17" fill="#fff" stroke="#3d7a5a" strokeWidth="2.5" />
            <path d="M-4 -11 h8 v7 h7 v8 h-7 v7 h-8 v-7 h-7 v-8 h7 Z" fill="#3d8a5a" />
          </g>
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x={x + 22 + i * 28} y={y + 92} width="16" height="18" fill="#a8c8dc" stroke="#5a5a62" strokeWidth="1.5" />
          ))}
          <rect x={cx - 18} y={bot - 34} width="36" height="34" fill="#a8c8dc" stroke="#3a4a62" strokeWidth="2" />
          <path d={`M${cx} ${bot - 34} v34`} stroke="#3a4a62" strokeWidth="2" />
        </g>
      );
    case 'market':
      return (
        <g>
          {(['red', 'yellow', 'blue', 'green'] as const).map((c, i) => {
            const sx = x + 8 + (i % 2) * 70;
            const sy = y + 20 + Math.floor(i / 2) * 72;
            const col = STALL_COLOURS[c];
            return (
              <g key={c}>
                <rect x={sx + 6} y={sy + 26} width="52" height="36" fill="#a8703c" stroke="#3a1f0e" strokeWidth="1.5" />
                <circle cx={sx + 20} cy={sy + 32} r="6" fill={['#e0533a', '#f2c040', '#7aa63a', '#e88a2a'][i]} />
                <circle cx={sx + 36} cy={sy + 33} r="6" fill={['#7aa63a', '#e0533a', '#f2c040', '#c8402a'][i]} />
                {Array.from({ length: 4 }, (_, k) => (
                  <path key={k} d={`M${sx + k * 16} ${sy} h16 l0 18 q-8 8 -16 0 Z`} fill={k % 2 ? '#f6ecd8' : col.main} stroke={col.dark} strokeWidth="1" />
                ))}
              </g>
            );
          })}
        </g>
      );
    case 'bridge':
      return (
        <g>
          {/* stone arch bridge over the river (east of the cell) */}
          <path d={`M${x + 20} ${y + 70} H${x + CELL_W + 150} V${y + 100} H${x + 20} Z`} fill="#b8b0a0" stroke="#5a5448" strokeWidth="2.5" />
          <path d={`M${x + CELL_W + 4} ${y + 100} Q${x + CELL_W + 66} ${y + 40} ${x + CELL_W + 128} ${y + 100} Z`} fill="#5f9ab8" stroke="#5a5448" strokeWidth="2.5" />
          <path d={`M${x + 20} ${y + 62} H${x + CELL_W + 150}`} stroke="#8a8478" strokeWidth="5" strokeDasharray="10 6" />
          {Array.from({ length: 9 }, (_, i) => (
            <path key={i} d={`M${x + 30 + i * 30} ${y + 72} v26`} stroke="#8a8478" strokeWidth="1.5" />
          ))}
          <rect x={x + 22} y={y + 100} width="26" height={bot - y - 100} fill="#a8a090" stroke="#5a5448" strokeWidth="2" />
        </g>
      );
    case 'temple':
      return temple === 'church' ? (
        <g>
          <rect x={x + 32} y={y + 66} width={CELL_W - 64} height={bot - y - 66} fill="#ece2cc" stroke="#5a4430" strokeWidth="2.5" />
          <path d={`M${x + 24} ${y + 68} L${cx} ${y + 40} L${x + CELL_W - 24} ${y + 68} Z`} fill="#6b4a5a" stroke="#3a2a32" strokeWidth="2" />
          <rect x={cx - 12} y={y + 18} width="24" height="30" fill="#ece2cc" stroke="#5a4430" strokeWidth="2" />
          <path d={`M${cx - 16} ${y + 20} L${cx} ${y - 8} L${cx + 16} ${y + 20} Z`} fill="#6b4a5a" stroke="#3a2a32" strokeWidth="2" />
          <circle cx={cx} cy={y + 86} r="12" fill="#c8a0d8" stroke="#5a4430" strokeWidth="2" />
          <path d={`M${cx - 14} ${bot} v-28 q14 -18 28 0 v28 Z`} fill="#6b4222" stroke="#2a1a10" strokeWidth="2" />
        </g>
      ) : (
        <g>
          <rect x={x + 34} y={y + 86} width={CELL_W - 68} height={bot - y - 86} fill="#b8452f" stroke="#5a1a10" strokeWidth="2.5" />
          {[0, 1, 2].map((i) => (
            <path key={i} d={`M${x + 14 + i * 12} ${y + 90 - i * 30} Q${cx} ${y + 70 - i * 30} ${x + CELL_W - 14 - i * 12} ${y + 90 - i * 30} L${x + CELL_W - 30 - i * 12} ${y + 78 - i * 30} H${x + 30 + i * 12} Z`} fill="#3a4a3a" stroke="#1a2a1a" strokeWidth="2" />
          ))}
          <path d={`M${cx} ${y + 6} v18`} stroke="#c99a3c" strokeWidth="4" />
          <rect x={cx - 14} y={bot - 36} width="28" height="36" fill="#3a1a10" stroke="#1a0a04" strokeWidth="2" />
        </g>
      );
    default:
      return <rect x={x + 20} y={y + 30} width={CELL_W - 40} height={ROW_H - 50} fill="#d8c8a8" stroke="#5a4430" />;
  }
}

// ------------------------------------------------------------------------------------- the door

/** A house front (or a landmark's entrance) in close-up: wall, window, the door (open or shut). */
export function DoorFrontArt({ door, open, wall = '#efe2c4', roof = '#a8573a', sky }: { door: string; open: boolean; wall?: string; roof?: string; sky: SkyColours }) {
  const dusk = sky.lamp > 0.6;
  return (
    <svg viewBox="0 0 800 700" className="doorfront-art" preserveAspectRatio="xMidYMax slice" aria-hidden>
 <rect x="40" y="90" width="720" height="560" fill={wall} stroke="#5a4430" strokeWidth="4" filter="url(#tx-plaster)" />
      <path d="M10 104 L400 6 L790 104 Z" fill={roof} stroke="#3a2a1a" strokeWidth="4" />
      <rect x="600" y="20" width="56" height="70" fill="#7a5a4a" stroke="#3a2a1a" strokeWidth="3" />
      {/* window with a flower box */}
      <rect x="100" y="200" width="150" height="150" fill={dusk ? '#ffd27a' : '#7a9ab0'} stroke="#5a4430" strokeWidth="6" />
      <path d="M175 200 v150 M100 275 h150" stroke="#5a4430" strokeWidth="5" />
      <rect x="90" y="350" width="170" height="30" fill="#8e5a2e" stroke="#3a1f0e" strokeWidth="2" />
      {[110, 140, 170, 200, 230].map((x, i) => (
        <circle key={x} cx={x} cy="342" r="11" fill={['#e0533a', '#f2c040', '#e6a3ad', '#e0533a', '#f2c040'][i]} />
      ))}
      <rect x="560" y="200" width="130" height="150" fill={dusk ? '#ffd27a' : '#7a9ab0'} stroke="#5a4430" strokeWidth="6" />
      <path d="M625 200 v150" stroke="#5a4430" strokeWidth="5" />
      {/* door frame */}
      <rect x="320" y="250" width="200" height="400" fill="#2a1a10" />
      {open ? (
        <g>
          <rect x="330" y="260" width="180" height="390" fill="#3a2414" />
          <rect x="330" y="260" width="180" height="390" fill="#ffd27a" opacity="0.25" />
          <path d="M330 260 L276 236 L276 676 L330 650 Z" fill={door} stroke="#1a0e06" strokeWidth="4" />
        </g>
      ) : (
        <g>
          <rect x="330" y="260" width="180" height="390" fill={door} stroke="#1a0e06" strokeWidth="4" />
          <rect x="352" y="286" width="136" height="140" rx="6" fill="none" stroke="#00000044" strokeWidth="5" />
          <rect x="352" y="452" width="136" height="170" rx="6" fill="none" stroke="#00000044" strokeWidth="5" />
          <circle cx="488" cy="460" r="9" fill="url(#g-brass)" stroke="#5a3c12" strokeWidth="2" />
          <rect x="398" y="300" width="44" height="14" rx="3" fill="url(#g-brass)" stroke="#5a3c12" />
        </g>
      )}
      {/* step and doormat */}
      <rect x="290" y="650" width="260" height="30" fill="#b8b0a0" stroke="#5a5448" strokeWidth="3" />
      <rect x="340" y="640" width="160" height="16" rx="3" fill="#a8573a" stroke="#5a2a1a" strokeWidth="2" />
      <rect x="20" y="676" width="760" height="18" rx="4" fill="#000" opacity="0.18" />
    </svg>
  );
}

// ------------------------------------------------------------------------------------- sun dial

export function SunDialArt({ sky }: { sky: SkyColours }) {
  return (
    <svg viewBox="0 0 400 230" className="dial-art" aria-hidden>
      <defs>
        <linearGradient id="dial-sky" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#f6c27a" />
          <stop offset="0.45" stopColor="#bfe0f4" />
          <stop offset="0.8" stopColor="#f2a070" />
          <stop offset="1" stopColor="#5a5a8a" />
        </linearGradient>
      </defs>
      <path d="M20 210 A180 180 0 0 1 380 210 Z" fill="url(#dial-sky)" stroke="#5a4430" strokeWidth="4" />
      <path d="M60 210 A140 140 0 0 1 340 210" fill="none" stroke="#ffffff" strokeWidth="2" strokeDasharray="4 8" opacity="0.7" />
      <path d="M0 210 H400 V230 H0 Z" fill="#8e5a2e" stroke="#3a1f0e" strokeWidth="3" />
      {/* hills on the horizon */}
      <path d="M20 210 Q80 186 140 206 Q200 190 260 204 Q320 184 380 210 Z" fill="#6c8a6a" opacity="0.7" />
      <rect width="400" height="230" fill={sky.light} opacity="0.08" />
    </svg>
  );
}
