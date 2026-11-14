/**
 * Renovation art: every catalogue item drawn in SVG (no filters, so the layers stay cheap).
 *
 * `UpgradeArt` draws an item in its own local box (see BOX) — used as the catalogue drawing and,
 * placed with a transform, in the shop. `RenoRoom` places the installed items in the desktop shop
 * (1600×1000 design units, the same viewBox as ShopBackdrop, so it also dresses the night shop);
 * `RenoMobileWall` places them on the phone's wall strip (400×320, like MobileWall).
 */
import type { ReactNode } from 'react';
import type { UpgradeId } from '../../renovation/types';

/** Local drawing box of each item (x, y, w, h). */
export const BOX: Record<UpgradeId, [number, number, number, number]> = {
  signboard: [0, 0, 120, 90],
  plant: [0, 0, 100, 150],
  ribbon: [0, 0, 100, 100],
  kettle: [0, 0, 120, 100],
  curtains: [0, 0, 120, 120],
  bench: [0, 0, 220, 90],
  shelf: [0, 0, 170, 70],
  scales: [0, 0, 120, 100],
  chime: [0, 0, 40, 110],
  cart: [0, 0, 150, 100],
  lantern: [0, 0, 60, 110],
  magnifier: [0, 0, 110, 80],
  icebox: [0, 0, 130, 100],
  cellar: [0, 0, 120, 200],
  paint: [0, 0, 100, 100],
  catbed: [0, 0, 120, 70],
  picture: [0, 0, 140, 100],
  bicycle: [0, 0, 160, 100],
};

const WOOD = '#8e5a2e';
const WOOD_D = '#5a3418';
const INK = '#3a2414';

function Signboard() {
  return (
    <g>
      {/* iron bracket */}
      <path d="M4 6 H110 M10 6 Q30 26 52 6" stroke="#2a2a2e" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M30 6 v12 M90 6 v12" stroke="#2a2a2e" strokeWidth="2" />
      <rect x="14" y="18" width="92" height="64" rx="6" fill="#7a4a26" stroke={WOOD_D} strokeWidth="3" />
      <rect x="20" y="24" width="80" height="52" rx="4" fill="#a8703c" />
      {/* teapot emblem */}
      <g transform="translate(60 52)" fill="#f2d48a" stroke="#5a3418" strokeWidth="1.5">
        <path d="M-16 -2 Q-16 16 0 16 Q16 16 16 -2 Z" />
        <path d="M16 2 Q26 0 24 -8" fill="none" strokeWidth="3" />
        <path d="M-16 2 Q-26 4 -24 12" fill="none" strokeWidth="3" />
        <path d="M-10 -2 Q0 -12 10 -2 Z" />
        <circle cx="0" cy="-10" r="2.5" />
      </g>
      <path d="M22 26 h76" stroke="#f6dfa8" strokeWidth="1.5" opacity="0.5" />
    </g>
  );
}

function Plant() {
  return (
    <g>
      <g stroke="#3f6b25" strokeWidth="3" fill="none" strokeLinecap="round">
        <path d="M50 100 Q44 60 22 34" />
        <path d="M50 100 Q52 50 50 14" />
        <path d="M50 100 Q60 64 82 40" />
        <path d="M50 100 Q34 80 12 74" />
        <path d="M50 100 Q68 84 90 80" />
      </g>
      <g fill="#6fa64a" stroke="#3f6b25" strokeWidth="1.5">
        <ellipse cx="22" cy="34" rx="12" ry="6" transform="rotate(-40 22 34)" />
        <ellipse cx="34" cy="56" rx="11" ry="5" transform="rotate(-30 34 56)" />
        <ellipse cx="50" cy="14" rx="7" ry="13" />
        <ellipse cx="50" cy="44" rx="6" ry="11" fill="#7fb35a" />
        <ellipse cx="82" cy="40" rx="12" ry="6" transform="rotate(35 82 40)" />
        <ellipse cx="68" cy="62" rx="11" ry="5" transform="rotate(25 68 62)" fill="#7fb35a" />
        <ellipse cx="12" cy="74" rx="11" ry="5" transform="rotate(10 12 74)" />
        <ellipse cx="90" cy="80" rx="11" ry="5" transform="rotate(-10 90 80)" fill="#7fb35a" />
      </g>
      <path d="M26 98 h48 l-6 48 h-36 Z" fill="url(#gl-terracotta)" stroke="#6b2414" strokeWidth="2" />
      <rect x="22" y="94" width="56" height="10" rx="3" fill="#c0603c" stroke="#6b2414" strokeWidth="2" />
    </g>
  );
}

function Ribbon() {
  return (
    <g>
      <rect x="18" y="10" width="64" height="84" rx="5" fill="#2f5a3a" stroke="#16220f" strokeWidth="2" />
      <rect x="24" y="14" width="56" height="78" rx="3" fill="#f3e6c6" opacity="0.25" />
      <path d="M58 6 V70 L66 62 L74 72 V6 Z" fill="#c8402a" stroke="#6b1a10" strokeWidth="1.5" />
      <path d="M62 6 V66" stroke="#e8786a" strokeWidth="1.5" opacity="0.7" />
    </g>
  );
}

/** Big copper kettle (also used as the hot tool once bought). */
export function BigKettle({ steam = false }: { steam?: boolean }) {
  return (
    <g>
      <ellipse cx="60" cy="94" rx="46" ry="5" fill="#1d0e05" opacity="0.3" />
      <path d="M22 88 Q14 44 60 38 Q106 44 98 88 Z" fill="#c4692e" stroke="#6b2a10" strokeWidth="3" />
      <path d="M30 80 Q26 52 50 46" stroke="#f2b07a" strokeWidth="6" fill="none" opacity="0.65" strokeLinecap="round" />
      <path d="M96 62 Q116 52 118 30 L110 30 Q106 48 94 54" fill="#b85a24" stroke="#6b2a10" strokeWidth="2.5" />
      <path d="M36 40 Q60 2 84 40" stroke="#3a2414" strokeWidth="5" fill="none" />
      <ellipse cx="60" cy="38" rx="16" ry="5" fill="#a8521f" stroke="#6b2a10" strokeWidth="2" />
      <circle cx="60" cy="32" r="4" fill="#e8c46a" stroke="#6b2a10" />
      <rect x="20" y="84" width="80" height="6" rx="3" fill="#6b2a10" />
      {steam ? <path d="M116 22 q-6 -8 0 -14 q6 -6 0 -12" stroke="#fff" strokeWidth="3" fill="none" opacity="0.6" className="reno-steam" /> : null}
    </g>
  );
}

function Curtains() {
  return (
    <g>
      <rect x="20" y="16" width="80" height="96" fill="#bfd8e6" stroke={WOOD_D} strokeWidth="5" />
      <path d="M60 16 V112 M20 64 H100" stroke={WOOD_D} strokeWidth="4" />
      <CurtainPanels x={14} y={8} w={92} h={108} />
    </g>
  );
}

/** Two gathered curtain panels and a valance over a window opening (x, y, w, h). */
export function CurtainPanels({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  const pw = w * 0.3;
  const col = '#d9a24a';
  const dk = '#a8702a';
  const panel = (left: boolean) => {
    const x0 = left ? x : x + w - pw;
    const tie = y + h * 0.55;
    const inner = left ? x0 + pw : x0;
    const outer = left ? x0 : x0 + pw;
    return (
      <g>
        <path
          d={`M${outer} ${y} L${inner} ${y} Q${inner + (left ? -pw * 0.5 : pw * 0.5)} ${tie} ${left ? x0 + pw * 0.45 : x0 + pw * 0.55} ${tie} Q${inner} ${y + h * 0.8} ${inner + (left ? pw * 0.1 : -pw * 0.1)} ${y + h} L${outer} ${y + h} Z`}
          fill={col}
          stroke={dk}
          strokeWidth="2"
        />
        {[0.25, 0.5, 0.75].map((f) => (
          <path key={f} d={`M${outer + (inner - outer) * f} ${y + 4} Q${outer + (inner - outer) * f * 0.7} ${tie} ${outer + (inner - outer) * f} ${y + h - 4}`} stroke={dk} strokeWidth="1.5" fill="none" opacity="0.55" />
        ))}
        <rect x={(left ? x0 + pw * 0.45 : x0 + pw * 0.55) - 8} y={tie - 4} width="16" height="8" rx="3" fill="#7a2f1b" />
      </g>
    );
  };
  return (
    <g>
      {panel(true)}
      {panel(false)}
      <path d={`M${x - 6} ${y - 4} H${x + w + 6} V${y + 16} ${Array.from({ length: 8 }, (_, i) => `Q${x + w + 6 - (w + 12) * ((i + 0.5) / 8)} ${y + 28} ${x + w + 6 - (w + 12) * ((i + 1) / 8)} ${y + 16}`).join(' ')} Z`} fill="#c98a3a" stroke={dk} strokeWidth="2" />
      <rect x={x - 10} y={y - 8} width={w + 20} height="6" rx="3" fill={WOOD_D} />
    </g>
  );
}

function Bench() {
  return (
    <g>
      <rect x="10" y="4" width="200" height="34" rx="5" fill={WOOD} stroke={WOOD_D} strokeWidth="3" />
      <path d="M14 16 H206 M14 28 H206" stroke={WOOD_D} strokeWidth="1.5" opacity="0.5" />
      <rect x="4" y="46" width="212" height="16" rx="4" fill="#a8703c" stroke={WOOD_D} strokeWidth="3" />
      <rect x="22" y="38" width="10" height="10" fill={WOOD_D} />
      <rect x="188" y="38" width="10" height="10" fill={WOOD_D} />
      <rect x="16" y="60" width="12" height="28" fill={WOOD_D} />
      <rect x="192" y="60" width="12" height="28" fill={WOOD_D} />
      {/* cushion */}
      <rect x="40" y="36" width="80" height="14" rx="7" fill="#b8452f" stroke="#6b1a10" strokeWidth="2" />
      <path d="M50 43 h60" stroke="#e8a090" strokeWidth="1.5" strokeDasharray="4 4" />
    </g>
  );
}

const JAR_COLS = ['#d9a520', '#7fae4e', '#a8261f', '#f1ece2', '#6b3d24'];

function Shelf() {
  return (
    <g>
      {[14, 46, 78, 110, 140].map((x, i) => (
        <g key={x} transform={`translate(${x} 18)`}>
          <rect x="0" y="6" width="22" height="34" rx="4" fill="#dfeceb" stroke="#8aa2a0" strokeWidth="1.5" opacity="0.9" />
          <rect x="2" y="18" width="18" height="20" rx="3" fill={JAR_COLS[i]} />
          <rect x="-1" y="0" width="24" height="8" rx="2" fill="#7a4a26" stroke={WOOD_D} />
        </g>
      ))}
      <rect x="0" y="56" width="170" height="10" rx="2" fill="#a8703c" stroke={WOOD_D} strokeWidth="2" />
      <path d="M14 66 l8 4 h8 M156 66 l-8 4 h-8" stroke="#2a2a2e" strokeWidth="3" fill="none" />
    </g>
  );
}

function Scales() {
  return (
    <g>
      <ellipse cx="60" cy="94" rx="44" ry="5" fill="#1d0e05" opacity="0.3" />
      <rect x="30" y="80" width="60" height="12" rx="3" fill={WOOD} stroke={WOOD_D} strokeWidth="2" />
      <rect x="56" y="22" width="8" height="60" fill="url(#g-brass)" stroke="#5a3c12" strokeWidth="1.5" />
      <path d="M14 26 H106" stroke="url(#g-brass)" strokeWidth="5" strokeLinecap="round" />
      <circle cx="60" cy="24" r="6" fill="url(#g-brass)" stroke="#5a3c12" />
      <path d="M60 14 L56 6 H64 Z" fill="url(#g-brass)" stroke="#5a3c12" />
      {[18, 102].map((x) => (
        <g key={x}>
          <path d={`M${x} 26 L${x - 12} 54 M${x} 26 L${x + 12} 54`} stroke="#5a3c12" strokeWidth="1.5" />
          <path d={`M${x - 16} 54 Q${x} 66 ${x + 16} 54 Z`} fill="url(#g-brass)" stroke="#5a3c12" strokeWidth="1.5" />
        </g>
      ))}
      <rect x="92" y="44" width="10" height="8" fill="#7a5a2a" stroke="#3a2414" />
    </g>
  );
}

function Chime() {
  return (
    <g>
      <path d="M20 0 V14" stroke="#3a2414" strokeWidth="1.5" />
      <path d="M6 34 Q6 12 20 12 Q34 12 34 34 Z" fill="#cfe7f2" stroke="#5a8aa8" strokeWidth="2" opacity="0.95" />
      <path d="M10 28 q4 -6 8 0 q4 -6 8 0" stroke="#3d6c9e" strokeWidth="1.5" fill="none" />
      <circle cx="26" cy="20" r="2" fill="#c8402a" />
      <g className="reno-chime-strip">
        <path d="M20 34 V48" stroke="#3a2414" strokeWidth="1" />
        <rect x="13" y="48" width="14" height="56" rx="2" fill="#f6ecd2" stroke="#b8a070" strokeWidth="1" />
        <path d="M16 58 h8 M16 66 h8 M16 74 h6" stroke="#3d6c9e" strokeWidth="1.2" />
      </g>
    </g>
  );
}

function Cart() {
  return (
    <g>
      <path d="M10 30 H112 L104 66 H18 Z" fill={WOOD} stroke={WOOD_D} strokeWidth="3" />
      <path d="M16 42 H108 M18 54 H106" stroke={WOOD_D} strokeWidth="1.5" opacity="0.5" />
      <path d="M112 34 L146 20" stroke={WOOD_D} strokeWidth="6" strokeLinecap="round" />
      <rect x="34" y="14" width="30" height="18" fill="#c49a5e" stroke="#6b4a22" strokeWidth="2" />
      <path d="M49 14 v18 M34 23 h30" stroke="#7a2f1b" strokeWidth="2" />
      <rect x="66" y="20" width="22" height="12" fill="#e2c48a" stroke="#6b4a22" strokeWidth="2" />
      {[34, 92].map((x) => (
        <g key={x}>
          <circle cx={x} cy="76" r="18" fill="none" stroke="#3a2414" strokeWidth="5" />
          <path d={`M${x - 16} 76 H${x + 16} M${x} 60 V92 M${x - 11} 65 L${x + 11} 87 M${x + 11} 65 L${x - 11} 87`} stroke="#3a2414" strokeWidth="2" />
          <circle cx={x} cy="76" r="4" fill="#3a2414" />
        </g>
      ))}
    </g>
  );
}

function Lantern() {
  return (
    <g>
      <path d="M30 0 V12" stroke="#2a1a10" strokeWidth="2" />
      <rect x="18" y="10" width="24" height="8" rx="2" fill="#2a1a10" />
      <ellipse cx="30" cy="54" rx="26" ry="36" fill="#d8402a" stroke="#7a1a10" strokeWidth="2" />
      <ellipse cx="30" cy="54" rx="16" ry="30" fill="#f4a03a" opacity="0.45" className="reno-lantern-glow" />
      {[30, 42, 54, 66, 78].map((y) => (
        <path key={y} d={`M${30 - Math.sqrt(Math.max(0, 1 - ((y - 54) / 36) ** 2)) * 26} ${y} H${30 + Math.sqrt(Math.max(0, 1 - ((y - 54) / 36) ** 2)) * 26}`} stroke="#7a1a10" strokeWidth="1.2" opacity="0.6" />
      ))}
      <rect x="18" y="88" width="24" height="8" rx="2" fill="#2a1a10" />
      <path d="M30 96 V108 M26 108 h8" stroke="#e3b23c" strokeWidth="2" />
    </g>
  );
}

function Magnifier() {
  return (
    <g>
      <path d="M58 46 L100 70" stroke={WOOD_D} strokeWidth="11" strokeLinecap="round" />
      <path d="M58 46 L100 70" stroke="#8e5a2e" strokeWidth="7" strokeLinecap="round" />
      <circle cx="36" cy="34" r="28" fill="#dff0f6" stroke="url(#g-brass)" strokeWidth="6" opacity="0.95" />
      <circle cx="36" cy="34" r="28" fill="none" stroke="#5a3c12" strokeWidth="1.2" />
      <path d="M20 22 Q28 12 40 12" stroke="#fff" strokeWidth="4" fill="none" opacity="0.8" strokeLinecap="round" />
      <text x="36" y="44" textAnchor="middle" fontSize="20" fontFamily="Georgia, serif" fill="#3a2414" opacity="0.75">
        Aa
      </text>
    </g>
  );
}

function IceBox() {
  return (
    <g>
      <ellipse cx="65" cy="96" rx="58" ry="5" fill="#1d0e05" opacity="0.3" />
      <rect x="8" y="30" width="114" height="64" rx="4" fill="#9a6232" stroke={WOOD_D} strokeWidth="3" />
      <rect x="4" y="18" width="122" height="16" rx="4" fill="#b07a46" stroke={WOOD_D} strokeWidth="3" />
      <path d="M8 52 H122 M8 72 H122" stroke={WOOD_D} strokeWidth="1.5" opacity="0.5" />
      {[20, 110].map((x) => (
        <rect key={x} x={x - 6} y="30" width="12" height="64" fill="#6b6e72" opacity="0.85" />
      ))}
      <rect x="54" y="42" width="22" height="12" rx="3" fill="url(#g-brass)" stroke="#5a3c12" />
      <g fill="#e6f4fb" stroke="#9cc4d8" strokeWidth="1.2">
        <rect x="30" y="8" width="16" height="12" rx="2" transform="rotate(-10 38 14)" />
        <rect x="80" y="6" width="16" height="13" rx="2" transform="rotate(12 88 12)" />
      </g>
    </g>
  );
}

function CellarDoor() {
  return (
    <g>
      <path d="M8 200 V40 Q8 6 60 6 Q112 6 112 40 V200 Z" fill="#5a3418" />
      <path d="M16 200 V44 Q16 14 60 14 Q104 14 104 44 V200 Z" fill="#7a4a26" stroke="#3a1f0e" strokeWidth="3" />
      {[36, 60, 84].map((x) => (
        <path key={x} d={`M${x} 16 V200`} stroke="#3a1f0e" strokeWidth="2" opacity="0.55" />
      ))}
      {[60, 150].map((y) => (
        <g key={y}>
          <rect x="16" y={y} width="88" height="9" fill="#2e2e32" />
          {[24, 52, 80, 96].map((x) => (
            <circle key={x} cx={x} cy={y + 4.5} r="2" fill="#8a8a90" />
          ))}
        </g>
      ))}
      <circle cx="90" cy="112" r="7" fill="none" stroke="#2e2e32" strokeWidth="3" />
      <rect x="44" y="84" width="32" height="18" rx="2" fill="#f4ead2" stroke="#8a7350" />
      <path d="M50 93 h20" stroke="#3a2414" strokeWidth="2" />
      <path d="M60 89 l-4 4 4 4 4 -4 z" fill="#3a2414" />
    </g>
  );
}

function Barrel() {
  return (
    <g>
      <path d="M8 4 Q0 30 8 56 H52 Q60 30 52 4 Z" fill="#9a6232" stroke={WOOD_D} strokeWidth="2.5" />
      <path d="M4 16 H56 M4 44 H56" stroke="#3a3a3e" strokeWidth="4" />
      <ellipse cx="30" cy="4" rx="22" ry="4" fill="#b07a46" stroke={WOOD_D} strokeWidth="2" />
    </g>
  );
}

function Cellar() {
  return (
    <g>
      <g transform="scale(0.85) translate(0 34)">
        <CellarDoor />
      </g>
      <g transform="translate(70 138) scale(0.85)">
        <Barrel />
      </g>
    </g>
  );
}

function Paint() {
  return (
    <g>
      <path d="M18 40 H74 L70 94 H22 Z" fill="#e8e4dc" stroke="#6b6e72" strokeWidth="2.5" />
      <ellipse cx="46" cy="40" rx="28" ry="7" fill="#3d6c9e" stroke="#6b6e72" strokeWidth="2.5" />
      <path d="M22 50 Q30 62 26 74" stroke="#3d6c9e" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d="M20 40 Q46 10 72 40" stroke="#6b6e72" strokeWidth="2" fill="none" />
      <g transform="rotate(30 80 30)">
        <rect x="74" y="0" width="10" height="40" rx="3" fill="#a8703c" stroke={WOOD_D} strokeWidth="1.5" />
        <rect x="72" y="38" width="14" height="10" fill="#9a9aa0" />
        <path d="M72 48 h14 l-2 14 h-10 Z" fill="#f6f3ec" stroke="#6b6e72" strokeWidth="1.5" />
      </g>
    </g>
  );
}

/** The cat: asleep (curled up) or awake (sitting up, blinking). */
export function Cat({ awake = false }: { awake?: boolean }) {
  const fur = '#d98a3a';
  const dk = '#8a4a1a';
  if (!awake)
    return (
      <g className="reno-cat reno-cat-asleep">
        <ellipse cx="60" cy="40" rx="40" ry="20" fill={fur} stroke={dk} strokeWidth="2" />
        <path d="M24 44 Q18 58 40 58 Q70 60 92 50" stroke={fur} strokeWidth="10" fill="none" strokeLinecap="round" className="reno-cat-tail" />
        <path d="M30 32 q10 -6 20 0 M58 26 q10 -6 20 0" stroke={dk} strokeWidth="2" fill="none" opacity="0.6" />
        <g transform="translate(90 34)">
          <circle r="15" fill={fur} stroke={dk} strokeWidth="2" />
          <path d="M-12 -8 L-10 -22 L-2 -13 Z M12 -8 L10 -22 L2 -13 Z" fill={fur} stroke={dk} strokeWidth="2" strokeLinejoin="round" />
          <path d="M-8 0 q3 3 6 0 M2 0 q3 3 6 0" stroke="#3a2414" strokeWidth="1.8" fill="none" strokeLinecap="round" />
          <path d="M-2 6 l2 2 2 -2" stroke="#3a2414" strokeWidth="1.4" fill="none" />
        </g>
        <text x="104" y="12" fontSize="12" fill="#5a3418" opacity="0.7" fontFamily="Georgia, serif" className="reno-cat-z">
          z
        </text>
      </g>
    );
  return (
    <g className="reno-cat reno-cat-awake">
      <path d="M40 60 Q36 30 60 26 Q84 30 80 60 Z" fill={fur} stroke={dk} strokeWidth="2" />
      <path d="M78 56 Q100 54 98 30" stroke={fur} strokeWidth="8" fill="none" strokeLinecap="round" className="reno-cat-tail" />
      <g transform="translate(60 20)">
        <circle r="16" fill={fur} stroke={dk} strokeWidth="2" />
        <path d="M-13 -8 L-11 -24 L-2 -14 Z M13 -8 L11 -24 L2 -14 Z" fill={fur} stroke={dk} strokeWidth="2" strokeLinejoin="round" />
        <g className="reno-cat-eyes">
          <ellipse cx="-6" cy="-1" rx="2.6" ry="3.6" fill="#3a2414" />
          <ellipse cx="6" cy="-1" rx="2.6" ry="3.6" fill="#3a2414" />
        </g>
        <path d="M-2 5 l2 2 2 -2 M0 7 v2" stroke="#3a2414" strokeWidth="1.4" fill="none" />
      </g>
    </g>
  );
}

function CatBed({ cat = false }: { cat?: boolean }) {
  return (
    <g>
      <ellipse cx="60" cy="64" rx="56" ry="6" fill="#1d0e05" opacity="0.25" />
      <path d="M6 36 Q8 66 60 66 Q112 66 114 36 Z" fill="#c8a058" stroke="#7a5a2a" strokeWidth="2.5" />
      {[16, 28, 40, 52].map((y) => (
        <path key={y} d={`M${8 + (y - 16) * 0.2} ${y + 12} Q60 ${y + 30} ${112 - (y - 16) * 0.2} ${y + 12}`} stroke="#7a5a2a" strokeWidth="1.2" fill="none" opacity="0.55" />
      ))}
      <ellipse cx="60" cy="36" rx="54" ry="10" fill="#b8452f" stroke="#6b1a10" strokeWidth="2" />
      {cat ? (
        <g transform="translate(0 -14)">
          <Cat />
        </g>
      ) : null}
    </g>
  );
}

function Picture() {
  return (
    <g>
      <path d="M70 0 L40 14 M70 0 L100 14" stroke="#3a2414" strokeWidth="1.5" />
      <rect x="4" y="12" width="132" height="86" rx="3" fill="url(#g-brass)" stroke="#5a3c12" strokeWidth="2" />
      <rect x="12" y="20" width="116" height="70" fill="#9cc4e0" />
      <rect x="12" y="62" width="116" height="28" fill="#3d6c9e" />
      <path d="M12 62 Q40 56 70 62 T128 60" stroke="#fff" strokeOpacity="0.5" strokeWidth="2" fill="none" />
      <g transform="translate(70 64)">
        <path d="M-34 0 H34 L26 12 H-26 Z" fill="#4a2c18" />
        <path d="M-8 0 V-40 M10 0 V-34" stroke="#2a1a10" strokeWidth="2" />
        <path d="M-6 -38 L-6 -6 L18 -6 Z" fill="#f4ecd8" />
        <path d="M12 -32 L12 -6 L30 -6 Z" fill="#e9dcc0" />
        <path d="M-10 -40 h-10 l5 3 z" fill="#c8402a" />
      </g>
      <circle cx="104" cy="32" r="7" fill="#fff4d0" />
    </g>
  );
}

function Bicycle() {
  return (
    <g>
      {[34, 124].map((x) => (
        <g key={x}>
          <circle cx={x} cy="70" r="26" fill="none" stroke="#2a2a2e" strokeWidth="5" />
          <circle cx={x} cy="70" r="3" fill="#2a2a2e" />
          {[0, 30, 60, 90, 120, 150].map((a) => (
            <path key={a} d={`M${x + Math.cos((a * Math.PI) / 180) * 24} ${70 + Math.sin((a * Math.PI) / 180) * 24} L${x - Math.cos((a * Math.PI) / 180) * 24} ${70 - Math.sin((a * Math.PI) / 180) * 24}`} stroke="#6b6e72" strokeWidth="1" />
          ))}
        </g>
      ))}
      <path d="M34 70 L66 70 L104 36 L56 36 Z M66 70 L52 26 M104 36 L124 70 M104 36 L100 18" stroke="#2f5a7a" strokeWidth="5" fill="none" strokeLinejoin="round" />
      <path d="M44 26 H62" stroke="#3a2414" strokeWidth="6" strokeLinecap="round" />
      <path d="M92 18 H110" stroke="#2a2a2e" strokeWidth="4" strokeLinecap="round" />
      {/* front basket with a parcel */}
      <path d="M108 20 H140 L136 40 H112 Z" fill="#c8a058" stroke="#7a5a2a" strokeWidth="2" />
      <rect x="114" y="8" width="20" height="14" fill="#c49a5e" stroke="#6b4a22" strokeWidth="1.5" />
      <path d="M124 8 v14" stroke="#7a2f1b" strokeWidth="1.5" />
    </g>
  );
}

const ART: Record<UpgradeId, () => ReactNode> = {
  signboard: Signboard,
  plant: Plant,
  ribbon: Ribbon,
  kettle: () => <BigKettle />,
  curtains: Curtains,
  bench: Bench,
  shelf: Shelf,
  scales: Scales,
  chime: Chime,
  cart: Cart,
  lantern: Lantern,
  magnifier: Magnifier,
  icebox: IceBox,
  cellar: Cellar,
  paint: Paint,
  catbed: () => <CatBed cat />,
  picture: Picture,
  bicycle: Bicycle,
};

/** An item drawn in its local box (BOX[id]). */
export function UpgradeArt({ id }: { id: UpgradeId }) {
  const A = ART[id];
  return <A />;
}

/** An item as a standalone picture (catalogue drawings). */
export function UpgradeIcon({ id, className }: { id: UpgradeId; className?: string }) {
  const [x, y, w, h] = BOX[id];
  const pad = 6;
  return (
    <svg viewBox={`${x - pad} ${y - pad} ${w + pad * 2} ${h + pad * 2}`} className={className ?? 'reno-icon'} aria-hidden>
      <UpgradeArt id={id} />
    </svg>
  );
}

/** Place an item in a scene: translate to (x, y), scaled to width w. */
function Put({ id, x, y, w, fresh, children }: { id: UpgradeId; x: number; y: number; w: number; fresh?: boolean; children?: ReactNode }) {
  const [, , bw] = BOX[id];
  const s = w / bw;
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`} className={`reno-item reno-${id} ${fresh ? 'reno-fresh' : ''}`}>
      {children ?? <UpgradeArt id={id} />}
    </g>
  );
}

export interface RoomProps {
  owned: ReadonlySet<UpgradeId>;
  /** Arrived this morning (a soft glow on the first day). */
  fresh: ReadonlySet<UpgradeId>;
  /** The cat is awake (e.g. while a customer is reacting). */
  catAwake?: boolean;
}

/**
 * Desktop: the installed items in the shop (viewBox 1600×1000, same as ShopBackdrop). The window
 * shows the outside things (signboard, lantern, wind chime); the wall between the door and the
 * shelf holds the picture, the small shelf and the cellar door; the bench and the cat under the
 * window; the ice box and the scales on the counter's back edge.
 */
export function RenoRoom({ owned, fresh, catAwake, align = 'xMidYMid' }: RoomProps & { align?: string }) {
  const has = (id: UpgradeId) => owned.has(id);
  const f = (id: UpgradeId) => fresh.has(id);
  return (
    <svg viewBox="0 0 1600 1000" className="backdrop reno-room" preserveAspectRatio={`${align} slice`} aria-hidden>
      <defs>
        <clipPath id="reno-wall-clip">
          <rect x="0" y="0" width="1600" height="560" />
        </clipPath>
      </defs>
      {/* on the wall / behind the counter (cut at the counter's edge) */}
      <g clipPath="url(#reno-wall-clip)">
        {has('curtains') ? (
          <g className={`reno-item reno-curtains ${f('curtains') ? 'reno-fresh' : ''}`}>
            <CurtainPanels x={44} y={94} w={252} h={302} />
          </g>
        ) : null}
        {has('signboard') ? <Put id="signboard" x={64} y={112} w={84} fresh={f('signboard')} /> : null}
        {has('chime') ? <Put id="chime" x={160} y={102} w={22} fresh={f('chime')} /> : null}
        {has('lantern') ? <Put id="lantern" x={226} y={104} w={40} fresh={f('lantern')} /> : null}
        {has('plant') ? <Put id="plant" x={318} y={404} w={74} fresh={f('plant')} /> : null}
        {has('bench') ? <Put id="bench" x={46} y={474} w={250} fresh={f('bench')} /> : null}
        {has('catbed') ? (
          <Put id="catbed" x={has('bench') ? 168 : 170} y={has('bench') ? 452 : 500} w={110} fresh={f('catbed')}>
            <CatBed />
            <g transform="translate(0 -14)">
              <Cat awake={catAwake} />
            </g>
          </Put>
        ) : null}
        {has('picture') ? <Put id="picture" x={692} y={262} w={150} fresh={f('picture')} /> : null}
        {has('shelf') ? <Put id="shelf" x={690} y={372} w={170} fresh={f('shelf')} /> : null}
        {has('cellar') ? (
          <Put id="cellar" x={872} y={296} w={128} fresh={f('cellar')}>
            <CellarDoor />
          </Put>
        ) : null}
      </g>
      {/* on the counter */}
      {has('scales') ? <Put id="scales" x={1176} y={572} w={104} fresh={f('scales')} /> : null}
      {has('icebox') ? <Put id="icebox" x={1420} y={560} w={150} fresh={f('icebox')} /> : null}
      {has('magnifier') ? <Put id="magnifier" x={196} y={926} w={84} fresh={f('magnifier')} /> : null}
    </svg>
  );
}

/**
 * Phone: the installed items on the wall strip beside the customer (viewBox 400×320, bottom-aligned
 * like MobileWall). Curtains hang in the door's glass; the rest sits on the free wall to the right.
 */
export function RenoMobileWall({ owned, fresh, catAwake }: RoomProps) {
  const has = (id: UpgradeId) => owned.has(id);
  const f = (id: UpgradeId) => fresh.has(id);
  return (
    <svg viewBox="0 0 400 320" className="backdrop reno-room" preserveAspectRatio="xMidYMax slice" aria-hidden>
      {has('curtains') ? (
        <g className={`reno-item reno-curtains ${f('curtains') ? 'reno-fresh' : ''}`}>
          <CurtainPanels x={52} y={102} w={88} h={58} />
        </g>
      ) : null}
      {has('signboard') ? <Put id="signboard" x={182} y={196} w={58} fresh={f('signboard')} /> : null}
      {has('lantern') ? <Put id="lantern" x={246} y={190} w={18} fresh={f('lantern')} /> : null}
      {has('picture') ? <Put id="picture" x={316} y={192} w={74} fresh={f('picture')} /> : null}
      {has('chime') ? <Put id="chime" x={274} y={190} w={12} fresh={f('chime')} /> : null}
      {has('shelf') ? <Put id="shelf" x={254} y={228} w={60} fresh={f('shelf')} /> : null}
      {has('plant') ? <Put id="plant" x={196} y={236} w={34} fresh={f('plant')} /> : null}
      {has('bench') ? <Put id="bench" x={232} y={268} w={120} fresh={f('bench')} /> : null}
      {has('cellar') ? (
        <Put id="cellar" x={362} y={248} w={34} fresh={f('cellar')}>
          <CellarDoor />
        </Put>
      ) : null}
      {has('catbed') ? (
        <Put id="catbed" x={has('bench') ? 274 : 270} y={has('bench') ? 252 : 284} w={56} fresh={f('catbed')}>
          <CatBed />
          <g transform="translate(0 -14)">
            <Cat awake={catAwake} />
          </g>
        </Put>
      ) : null}
    </svg>
  );
}

/** The catalogue as a prop on the counter: a carpenter's order booklet with a pencil. */
export function CatalogueProp({ glow }: { glow: boolean }) {
  return (
    <svg viewBox="0 0 150 120" className="prop-art" aria-hidden>
      <ellipse cx="76" cy="110" rx="66" ry="7" fill="#1d0e05" opacity="0.35" />
      <path d="M14 18 L132 10 L138 100 L18 106 Z" fill="#e8d6ae" stroke="#7a5a2a" strokeWidth="2" />
      <path d="M14 18 L132 10 L134 30 L15 38 Z" fill="#7a4a26" stroke="#3a1f0e" strokeWidth="2" />
      {/* hammer and saw */}
      <g transform="translate(40 66) rotate(-8)" stroke={INK} strokeWidth="2.5" fill="none" strokeLinecap="round">
        <path d="M-14 16 L8 -6" />
        <path d="M2 -14 L16 0 L10 4 L-2 -8 Z" fill="#6b6e72" />
      </g>
      <g transform="translate(90 64) rotate(-12)">
        <path d="M-20 -8 H18 L22 6 H-20 Z" fill="#c9ccd0" stroke={INK} strokeWidth="1.5" />
        <path d="M-20 6 l3 4 3 -4 3 4 3 -4 3 4 3 -4 3 4 3 -4 3 4 3 -4 3 4 3 -4 3 4" stroke={INK} strokeWidth="1" fill="none" />
        <rect x="18" y="-12" width="14" height="22" rx="4" fill="#a8703c" stroke={INK} strokeWidth="1.5" />
      </g>
      <path d="M30 92 h40 M30 98 h56" stroke="#8a7350" strokeWidth="2" opacity="0.6" />
      {/* pencil */}
      <g transform="rotate(-20 110 96)">
        <rect x="80" y="92" width="52" height="7" fill="#e3b23c" stroke="#7a5a1c" />
        <path d="M132 92 L141 95.5 L132 99 Z" fill="#f2d9b0" stroke="#7a5a1c" />
      </g>
      {glow ? <path className="nb-bookmark" d="M112 12 L112 -18 L120 -11 L128 -18 L128 11 Z" fill="#c8402a" stroke="#6b1a10" strokeWidth="1.5" /> : null}
    </svg>
  );
}
