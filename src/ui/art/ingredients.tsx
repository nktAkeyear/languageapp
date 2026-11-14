/**
 * Ingredient art: the shelf container each ingredient lives in, and the small piece drawn
 * floating in the cup. Containers use a 100×120 box (base at y≈114); pieces are centred on
 * (0,0) in a ~36px box so they can be placed anywhere inside another SVG.
 */
import type { ReactNode } from 'react';
import type { IngredientId } from '../../core/types';

type Kind = 'basket' | 'jar' | 'crock' | 'tin' | 'bottle' | 'pitcher' | 'bucket' | 'vase' | 'sprig' | 'sticks' | 'plate' | 'bowl' | 'cellar';

interface ContainerSpec {
  kind: Kind;
  glaze: string;
  /** Emoji shown as the contents (peeking out / behind glass). */
  emoji: string;
  /** Number of emoji in the visible heap. */
  heap?: number;
}

export const ING_CONTAINER: Record<IngredientId, ContainerSpec> = {
  lemon: { kind: 'basket', glaze: 'gl-wicker', emoji: '🍋', heap: 3 },
  apple: { kind: 'basket', glaze: 'gl-wicker', emoji: '🍎', heap: 3 },
  pear: { kind: 'basket', glaze: 'gl-wicker', emoji: '🍐', heap: 3 },
  banana: { kind: 'basket', glaze: 'gl-wicker', emoji: '🍌', heap: 2 },
  ginger: { kind: 'jar', glaze: 'gl-glass', emoji: '🫚', heap: 2 },
  red_dates: { kind: 'jar', glaze: 'gl-glass', emoji: '', heap: 0 },
  mint: { kind: 'sprig', glaze: 'gl-celadon', emoji: '🌿' },
  honey: { kind: 'crock', glaze: 'gl-amber', emoji: '🍯' },
  sugar: { kind: 'crock', glaze: 'gl-cream', emoji: '' },
  salt: { kind: 'cellar', glaze: 'gl-tin', emoji: '' },
  water: { kind: 'pitcher', glaze: 'gl-indigo', emoji: '' },
  milk: { kind: 'bottle', glaze: 'gl-glass', emoji: '' },
  ice: { kind: 'bucket', glaze: 'gl-tin', emoji: '🧊' },
  green_tea: { kind: 'tin', glaze: 'gl-green', emoji: '' },
  black_tea: { kind: 'tin', glaze: 'gl-rust', emoji: '' },
  coffee: { kind: 'tin', glaze: 'gl-blackglaze', emoji: '' },
  chrysanthemum: { kind: 'vase', glaze: 'gl-glass', emoji: '🌼' },
  rose: { kind: 'vase', glaze: 'gl-glass', emoji: '🌹' },
  cinnamon: { kind: 'sticks', glaze: 'gl-terracotta', emoji: '' },
  watermelon: { kind: 'plate', glaze: 'gl-cream', emoji: '🍉' },
  yogurt: { kind: 'bowl', glaze: 'gl-celadon', emoji: '' },
};

const shadow = <ellipse cx="50" cy="114" rx="40" ry="5" fill="#1d0e05" opacity="0.35" />;

function Emoji({ x, y, size, children, rot = 0 }: { x: number; y: number; size: number; children: string; rot?: number }) {
  return (
    <text x={x} y={y} fontSize={size} textAnchor="middle" dominantBaseline="central" transform={rot ? `rotate(${rot} ${x} ${y})` : undefined} style={{ fontFamily: 'Noto Color Emoji, Apple Color Emoji, Segoe UI Emoji, sans-serif' }}>
      {children}
    </text>
  );
}

function Basket({ s, empty }: { s: ContainerSpec; empty: boolean }) {
  const n = s.heap ?? 3;
  return (
    <g>
      {shadow}
      {!empty && (
        <g>
          {n >= 3 && <Emoji x={30} y={58} size={30} rot={-12}>{s.emoji}</Emoji>}
          {n >= 2 && <Emoji x={68} y={58} size={30} rot={14}>{s.emoji}</Emoji>}
          <Emoji x={49} y={50} size={34}>{s.emoji}</Emoji>
        </g>
      )}
      <path d="M10 66 L90 66 L80 110 Q50 116 20 110 Z" fill="url(#gl-wicker)" stroke="#6b4a1c" strokeWidth="2" />
      {[74, 83, 92, 101].map((y) => (
        <path key={y} d={`M${12 + (y - 66) * 0.2} ${y} Q50 ${y + 4} ${88 - (y - 66) * 0.2} ${y}`} fill="none" stroke="#8a6228" strokeWidth="1.6" opacity="0.8" />
      ))}
      {[22, 34, 46, 58, 70, 80].map((x) => (
        <path key={x} d={`M${x} 67 L${x + (50 - x) * 0.12} 110`} stroke="#a77d3a" strokeWidth="1.2" opacity="0.6" />
      ))}
      <ellipse cx="50" cy="66" rx="41" ry="6" fill="none" stroke="#7c5520" strokeWidth="4" />
      <ellipse cx="50" cy="66" rx="41" ry="6" fill="none" stroke="#d9b06a" strokeWidth="1.2" opacity="0.8" />
    </g>
  );
}

function Jar({ s, empty, ing }: { s: ContainerSpec; empty: boolean; ing: IngredientId }) {
  return (
    <g>
      {shadow}
      <path d="M22 34 Q20 30 26 28 L74 28 Q80 30 78 34 L80 104 Q80 113 70 113 L30 113 Q20 113 20 104 Z" fill="#e8f2ef" opacity="0.35" stroke="#7f9b98" strokeWidth="2" />
      {!empty &&
        (ing === 'red_dates' ? (
          <g>
            {[
              [36, 100],
              [54, 102],
              [68, 96],
              [44, 86],
              [62, 82],
              [34, 74],
              [52, 70],
            ].map(([x, y], i) => (
              <ellipse key={i} cx={x} cy={y} rx="9" ry="7" fill={i % 2 ? '#a8261f' : '#c03a2b'} stroke="#5e1212" strokeWidth="1.2" transform={`rotate(${(i * 37) % 60 - 30} ${x} ${y})`} />
            ))}
          </g>
        ) : (
          <g>
            <Emoji x={38} y={96} size={26} rot={-20}>{s.emoji}</Emoji>
            <Emoji x={62} y={92} size={26} rot={25}>{s.emoji}</Emoji>
            <Emoji x={50} y={72} size={26} rot={5}>{s.emoji}</Emoji>
          </g>
        ))}
      <path d="M22 34 Q20 30 26 28 L74 28 Q80 30 78 34 L80 104 Q80 113 70 113 L30 113 Q20 113 20 104 Z" fill="url(#g-glass)" />
      <rect x="22" y="16" width="56" height="14" rx="4" fill="#a87a45" stroke="#5e3c18" strokeWidth="2" />
      <rect x="22" y="16" width="56" height="5" rx="3" fill="#d4a56a" opacity="0.7" />
    </g>
  );
}

function Crock({ s, empty, ing }: { s: ContainerSpec; empty: boolean; ing: IngredientId }) {
  return (
    <g>
      {shadow}
      <path d="M18 50 Q14 64 16 84 Q20 112 50 113 Q80 112 84 84 Q86 64 82 50 Z" fill={`url(#${s.glaze})`} stroke="#4a2c12" strokeWidth="2" />
      <path d="M26 58 Q24 76 30 96" stroke="#fff" strokeWidth="5" opacity="0.25" fill="none" strokeLinecap="round" />
      <ellipse cx="50" cy="50" rx="33" ry="7" fill={`url(#${s.glaze})`} stroke="#4a2c12" strokeWidth="2" />
      {ing === 'honey' ? (
        <g>
          {/* cloth cover tied with string + dipper */}
          <path d="M14 50 Q50 30 86 50 Q80 58 74 56 Q50 62 26 56 Q20 58 14 50 Z" fill="#efe2c4" stroke="#8a7350" strokeWidth="1.5" />
          <path d="M20 55 Q50 63 80 55" stroke="#7a4a1c" strokeWidth="2.5" fill="none" />
          <line x1="62" y1="48" x2="78" y2="12" stroke="#7a4a1c" strokeWidth="4" strokeLinecap="round" />
          <ellipse cx="79" cy="10" rx="6" ry="4" fill="#9a6428" />
          {!empty && <path d="M52 66 Q54 76 52 84" stroke="#e8a531" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.9" />}
        </g>
      ) : (
        <g>
          {!empty && (
            <g>
              <rect x="38" y="38" width="10" height="9" fill="#fff" stroke="#b9ae9a" strokeWidth="1" transform="rotate(-10 43 42)" />
              <rect x="50" y="36" width="10" height="9" fill="#fbf8f0" stroke="#b9ae9a" strokeWidth="1" transform="rotate(12 55 40)" />
            </g>
          )}
          <path d="M28 46 Q50 34 72 46" fill="none" stroke="#8a7350" strokeWidth="0" />
          <rect x="44" y="64" width="22" height="18" rx="2" fill="#fbf3df" stroke="#a0896a" strokeWidth="1" transform="rotate(-4 55 73)" />
        </g>
      )}
    </g>
  );
}

function Tin({ s, empty }: { s: ContainerSpec; empty: boolean }) {
  return (
    <g opacity={empty ? 0.7 : 1}>
      {shadow}
      <rect x="22" y="30" width="56" height="83" rx="6" fill={`url(#${s.glaze})`} stroke="#2c1a0d" strokeWidth="2" />
      <rect x="22" y="56" width="56" height="30" fill="#f2e3c0" opacity="0.92" />
      <path d="M22 56 h56 M22 86 h56" stroke="#b08a3a" strokeWidth="2" />
      <circle cx="50" cy="71" r="10" fill="none" stroke={s.glaze === 'gl-green' ? '#3d6331' : s.glaze === 'gl-rust' ? '#6b2414' : '#3a2a20'} strokeWidth="2" />
      <path d="M44 71 q6 -8 12 0 q-6 8 -12 0" fill={s.glaze === 'gl-green' ? '#7da86b' : s.glaze === 'gl-rust' ? '#b7553a' : '#6a4a32'} />
      <rect x="20" y="20" width="60" height="14" rx="5" fill="url(#g-brass)" stroke="#5a3c12" strokeWidth="2" />
      <rect x="28" y="38" width="6" height="68" rx="3" fill="#fff" opacity="0.18" />
    </g>
  );
}

function Bottle({ empty }: { empty: boolean }) {
  return (
    <g>
      {shadow}
      <path d="M38 14 h24 v14 Q78 40 78 58 L78 104 Q78 113 68 113 L32 113 Q22 113 22 104 L22 58 Q22 40 38 28 Z" fill={empty ? '#e9f3f2' : '#fbf8ef'} opacity={empty ? 0.4 : 1} stroke="#8aa2a0" strokeWidth="2" />
      {!empty && <path d="M24 60 L76 60 L76 104 Q76 111 68 111 L32 111 Q24 111 24 104 Z" fill="#fffdf7" />}
      <path d="M38 14 h24 v14 Q78 40 78 58 L78 104 Q78 113 68 113 L32 113 Q22 113 22 104 L22 58 Q22 40 38 28 Z" fill="url(#g-glass)" />
      <rect x="36" y="8" width="28" height="10" rx="3" fill="#3f6c9a" stroke="#22405e" strokeWidth="1.5" />
      <rect x="30" y="70" width="40" height="22" rx="3" fill="#cfe0ef" stroke="#6b8bb0" strokeWidth="1" />
      <path d="M38 81 q12 -9 24 0" stroke="#3f6c9a" strokeWidth="2" fill="none" />
    </g>
  );
}

function Pitcher({ empty }: { empty: boolean }) {
  return (
    <g>
      {shadow}
      <path d="M74 50 Q96 52 92 72 Q88 88 72 92" fill="none" stroke="#2b3a63" strokeWidth="7" strokeLinecap="round" />
      <path d="M24 30 L70 30 Q78 34 76 44 Q74 64 78 84 Q80 112 50 113 Q20 112 22 84 Q26 64 24 44 Q20 36 14 30 Z" fill="url(#gl-indigo)" stroke="#1c2747" strokeWidth="2" />
      <path d="M30 46 Q50 52 70 46" stroke="#e6ecf6" strokeWidth="2.5" fill="none" opacity="0.7" />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={36 + i * 14} cy={74} r="4" fill="#e6ecf6" opacity="0.65" />
      ))}
      <path d="M30 40 Q28 70 34 96" stroke="#fff" strokeWidth="5" opacity="0.22" fill="none" strokeLinecap="round" />
      {!empty && <ellipse cx="44" cy="31" rx="26" ry="4" fill="#9ccbe0" />}
    </g>
  );
}

function Bucket({ empty }: { empty: boolean }) {
  return (
    <g>
      {shadow}
      {!empty &&
        [
          [34, 52],
          [52, 48],
          [68, 54],
          [44, 42],
          [60, 40],
        ].map(([x, y], i) => (
          <g key={i} transform={`rotate(${(i * 23) % 40 - 20} ${x} ${y})`}>
            <rect x={x - 9} y={y - 9} width="18" height="18" rx="3" fill="#e7f6fd" stroke="#8fc3dc" strokeWidth="1.5" />
            <rect x={x - 6} y={y - 6} width="6" height="6" rx="1" fill="#fff" opacity="0.9" />
          </g>
        ))}
      <path d="M14 56 L86 56 L78 112 L22 112 Z" fill="#9a6a3a" stroke="#4a2c12" strokeWidth="2" filter="url(#tx-wood-v)" />
      {[26, 38, 50, 62, 74].map((x) => (
        <line key={x} x1={x} y1="57" x2={x + (50 - x) * 0.14} y2="111" stroke="#5a3a1a" strokeWidth="1.2" opacity="0.6" />
      ))}
      <path d="M15 66 L85 66 M19 98 L81 98" stroke="url(#g-iron)" strokeWidth="5" />
      <ellipse cx="50" cy="56" rx="36" ry="5" fill="none" stroke="#4a2c12" strokeWidth="3" />
    </g>
  );
}

function Vase({ s, empty }: { s: ContainerSpec; empty: boolean }) {
  return (
    <g>
      {shadow}
      {!empty && (
        <g>
          <path d="M40 70 Q36 40 30 26 M50 70 L50 18 M60 70 Q64 44 72 30" stroke="#4d6a38" strokeWidth="3" fill="none" />
          <Emoji x={30} y={26} size={24} rot={-15}>{s.emoji}</Emoji>
          <Emoji x={50} y={16} size={26}>{s.emoji}</Emoji>
          <Emoji x={72} y={28} size={24} rot={15}>{s.emoji}</Emoji>
        </g>
      )}
      <path d="M30 64 Q22 76 24 92 Q28 113 50 113 Q72 113 76 92 Q78 76 70 64 Z" fill="#cfe6e4" opacity="0.5" stroke="#7f9b98" strokeWidth="2" />
      <path d="M26 86 Q50 92 74 86 L74 92 Q72 112 50 112 Q28 112 26 92 Z" fill="#a8d2df" opacity="0.6" />
      <path d="M30 64 Q22 76 24 92 Q28 113 50 113 Q72 113 76 92 Q78 76 70 64 Z" fill="url(#g-glass)" />
      <ellipse cx="50" cy="64" rx="20" ry="4" fill="none" stroke="#7f9b98" strokeWidth="2" />
    </g>
  );
}

function Sprig({ empty }: { empty: boolean }) {
  return (
    <g>
      {shadow}
      {!empty && (
        <g>
          {[
            [-24, 30],
            [-8, 22],
            [10, 20],
            [26, 28],
          ].map(([dx, top], i) => (
            <g key={i}>
              <path d={`M50 76 Q${50 + dx * 0.6} ${top + 30} ${50 + dx} ${top}`} stroke="#3f6b25" strokeWidth="2.5" fill="none" />
              {[0, 1, 2].map((j) => {
                const t = 0.35 + j * 0.25;
                const x = 50 + dx * t;
                const y = 76 - (76 - top) * t;
                return (
                  <g key={j}>
                    <ellipse cx={x - 7} cy={y} rx="8" ry="4.5" fill="#6fa64a" stroke="#3f6b25" strokeWidth="1" transform={`rotate(-30 ${x - 7} ${y})`} />
                    <ellipse cx={x + 7} cy={y - 2} rx="8" ry="4.5" fill="#86b95c" stroke="#3f6b25" strokeWidth="1" transform={`rotate(30 ${x + 7} ${y - 2})`} />
                  </g>
                );
              })}
            </g>
          ))}
        </g>
      )}
      <path d="M26 72 L74 72 L68 110 Q50 115 32 110 Z" fill="url(#gl-celadon)" stroke="#3d5a33" strokeWidth="2" />
      <ellipse cx="50" cy="72" rx="24" ry="5" fill="#9ec3cf" stroke="#3d5a33" strokeWidth="2" />
      <path d="M32 80 Q34 94 38 106" stroke="#fff" strokeWidth="4" opacity="0.3" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Sticks({ empty }: { empty: boolean }) {
  return (
    <g>
      {shadow}
      {!empty &&
        [-14, -5, 4, 13].map((dx, i) => (
          <g key={i} transform={`rotate(${dx * 0.8} ${50 + dx} 70)`}>
            <rect x={44 + dx} y={22 + (i % 2) * 6} width="11" height="56" rx="5" fill={i % 2 ? '#9a5424' : '#b0652b'} stroke="#5a2e12" strokeWidth="1.4" />
            <path d={`M${47 + dx} ${28 + (i % 2) * 6} v44`} stroke="#d58a4a" strokeWidth="1.5" opacity="0.7" />
          </g>
        ))}
      <path d="M24 64 L76 64 L72 108 Q50 116 28 108 Z" fill="url(#gl-terracotta)" stroke="#5a2a12" strokeWidth="2" />
      <ellipse cx="50" cy="64" rx="26" ry="5" fill="#7a3a1a" stroke="#5a2a12" strokeWidth="2" />
      <path d="M26 80 h48" stroke="#f2d4b0" strokeWidth="2" opacity="0.6" />
    </g>
  );
}

function Plate({ s, empty }: { s: ContainerSpec; empty: boolean }) {
  return (
    <g>
      {shadow}
      <ellipse cx="50" cy="100" rx="44" ry="12" fill="url(#gl-cream)" stroke="#8a7350" strokeWidth="2" />
      <ellipse cx="50" cy="98" rx="32" ry="7" fill="#f6efe0" stroke="#c8b48a" strokeWidth="1" />
      {!empty && (
        <g>
          <Emoji x={34} y={80} size={30} rot={-20}>{s.emoji}</Emoji>
          <Emoji x={64} y={78} size={30} rot={18}>{s.emoji}</Emoji>
          <Emoji x={50} y={66} size={32}>{s.emoji}</Emoji>
        </g>
      )}
    </g>
  );
}

function Bowl({ empty }: { empty: boolean }) {
  return (
    <g>
      {shadow}
      <path d="M12 70 Q16 112 50 112 Q84 112 88 70 Z" fill="url(#gl-celadon)" stroke="#3d5a33" strokeWidth="2" />
      <ellipse cx="50" cy="70" rx="38" ry="8" fill={empty ? '#c9d8c0' : '#fbfaf3'} stroke="#3d5a33" strokeWidth="2" />
      {!empty && <path d="M36 68 q8 -6 16 0 q8 6 14 -1" stroke="#e4e0d2" strokeWidth="2" fill="none" />}
      <line x1="64" y1="66" x2="84" y2="40" stroke="#c9a46a" strokeWidth="4" strokeLinecap="round" />
      <path d="M22 80 Q28 100 40 106" stroke="#fff" strokeWidth="4" opacity="0.3" fill="none" strokeLinecap="round" />
    </g>
  );
}

function Cellar({ empty }: { empty: boolean }) {
  return (
    <g>
      {shadow}
      <rect x="26" y="52" width="48" height="60" rx="6" fill="#8e5a2e" stroke="#4a2c12" strokeWidth="2" filter="url(#tx-wood)" />
      <path d="M22 54 L78 54 L72 36 L28 36 Z" fill="#a8703c" stroke="#4a2c12" strokeWidth="2" />
      {!empty && <path d="M32 54 Q50 44 68 54" fill="#f7f5ef" stroke="#cfcac0" strokeWidth="1" />}
      <circle cx="50" cy="82" r="10" fill="none" stroke="#e8d4b0" strokeWidth="2" />
      <text x="50" y="86" textAnchor="middle" fontSize="12" fill="#f1e2c4" fontWeight="700">◇</text>
    </g>
  );
}

/** One shelf container (100×120 viewBox). */
export function ContainerArt({ ing, empty = false }: { ing: IngredientId; empty?: boolean }) {
  const s = ING_CONTAINER[ing] ?? { kind: 'jar', glaze: 'gl-glass', emoji: '❔' };
  let body: ReactNode;
  switch (s.kind) {
    case 'basket':
      body = <Basket s={s} empty={empty} />;
      break;
    case 'jar':
      body = <Jar s={s} empty={empty} ing={ing} />;
      break;
    case 'crock':
      body = <Crock s={s} empty={empty} ing={ing} />;
      break;
    case 'tin':
      body = <Tin s={s} empty={empty} />;
      break;
    case 'bottle':
      body = <Bottle empty={empty} />;
      break;
    case 'pitcher':
      body = <Pitcher empty={empty} />;
      break;
    case 'bucket':
      body = <Bucket empty={empty} />;
      break;
    case 'vase':
      body = <Vase s={s} empty={empty} />;
      break;
    case 'sprig':
      body = <Sprig empty={empty} />;
      break;
    case 'sticks':
      body = <Sticks empty={empty} />;
      break;
    case 'plate':
      body = <Plate s={s} empty={empty} />;
      break;
    case 'bowl':
      body = <Bowl empty={empty} />;
      break;
    case 'cellar':
      body = <Cellar empty={empty} />;
      break;
  }
  return (
    <svg viewBox="0 0 100 120" className="container-art" aria-hidden>
      {body}
    </svg>
  );
}

/** A small drawn piece of an ingredient (centred on 0,0, about 36 units across). */
export function PieceArt({ ing }: { ing: IngredientId }) {
  switch (ing) {
    case 'lemon':
      return (
        <g>
          <circle r="14" fill="#f4d23c" stroke="#c49a12" strokeWidth="2" />
          <circle r="10.5" fill="#fbeb93" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <line key={i} x1="0" y1="0" x2={Math.cos((i * Math.PI) / 4) * 10} y2={Math.sin((i * Math.PI) / 4) * 10} stroke="#f2d659" strokeWidth="1.4" />
          ))}
          <circle r="2" fill="#fff6c8" />
        </g>
      );
    case 'ginger':
      return (
        <g>
          <ellipse rx="14" ry="11" fill="#e9c98a" stroke="#a87a32" strokeWidth="2" />
          <ellipse rx="9" ry="7" fill="#f3dcaa" />
          <path d="M-6 -2 q6 4 12 0" stroke="#c9a060" strokeWidth="1" fill="none" />
        </g>
      );
    case 'mint':
      return (
        <g>
          <path d="M-14 4 Q-4 -14 14 -4 Q4 12 -14 4 Z" fill="#6fa64a" stroke="#3f6b25" strokeWidth="1.6" />
          <path d="M-12 3 Q0 -2 12 -4" stroke="#3f6b25" strokeWidth="1.2" fill="none" />
        </g>
      );
    case 'ice':
      return (
        <g>
          <rect x="-11" y="-11" width="22" height="22" rx="4" fill="#eaf7fd" fillOpacity="0.85" stroke="#8fc3dc" strokeWidth="1.6" />
          <rect x="-7" y="-7" width="7" height="7" rx="1.5" fill="#fff" />
        </g>
      );
    case 'red_dates':
      return <ellipse rx="10" ry="7" fill="#b02c22" stroke="#5e1212" strokeWidth="1.6" />;
    case 'chrysanthemum':
      return (
        <g>
          {Array.from({ length: 12 }, (_, i) => (
            <ellipse key={i} cx="0" cy="-8" rx="3" ry="7" fill="#f6d34a" stroke="#c49a12" strokeWidth="0.8" transform={`rotate(${i * 30})`} />
          ))}
          <circle r="4" fill="#d79a1c" />
        </g>
      );
    case 'cinnamon':
      return (
        <g transform="rotate(-20)">
          <rect x="-16" y="-4" width="32" height="8" rx="4" fill="#a85e28" stroke="#5a2e12" strokeWidth="1.4" />
          <path d="M-12 -1 h24" stroke="#d58a4a" strokeWidth="1.2" />
        </g>
      );
    case 'apple':
      return (
        <g>
          <path d="M-14 4 A14 14 0 0 1 14 4 Z" fill="#f4e7c2" stroke="#b9322a" strokeWidth="3" />
          <circle cx="-4" cy="0" r="1.5" fill="#5a3010" />
          <circle cx="4" cy="0" r="1.5" fill="#5a3010" />
        </g>
      );
    case 'banana':
      return (
        <g>
          <circle r="11" fill="#fbf0c0" stroke="#e5c450" strokeWidth="2.5" />
          <circle r="3" fill="#e8d78e" />
        </g>
      );
    case 'watermelon':
      return (
        <g>
          <path d="M-15 -4 L15 -4 L0 14 Z" fill="#ef5b6a" stroke="#3e8a3a" strokeWidth="2.5" strokeLinejoin="round" />
          {[-6, 0, 6].map((x) => (
            <ellipse key={x} cx={x} cy="1" rx="1.2" ry="2" fill="#2a1a12" />
          ))}
        </g>
      );
    case 'pear':
      return (
        <g>
          <path d="M0 -14 Q8 -6 7 2 Q12 14 0 14 Q-12 14 -7 2 Q-8 -6 0 -14 Z" fill="#f1efc0" stroke="#a6b04a" strokeWidth="2" />
          <ellipse cx="0" cy="5" rx="2" ry="3" fill="#7a5a2a" />
        </g>
      );
    case 'rose':
      return (
        <g>
          {[0, 72, 144, 216, 288].map((a) => (
            <ellipse key={a} cx="0" cy="-6" rx="6" ry="8" fill="#d8546e" stroke="#922e44" strokeWidth="1" transform={`rotate(${a})`} />
          ))}
          <circle r="4" fill="#b8344e" />
        </g>
      );
    default:
      return <circle r="8" fill="#ddd" />;
  }
}
