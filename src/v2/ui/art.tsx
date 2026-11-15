/**
 * v2 drawings. The tea-house containers and the people are the existing illustrations (src/ui/art: ContainerArt,
 * CustomerArt); the rest is drawn here in the same weight: desk supplies, the crate, the door sign, the town's
 * signboards, the market stall.
 */
import type { IngredientId } from '../../core/types';
import { ContainerArt } from '../../ui/art/ingredients';

const ST = { stroke: '#2e2219', strokeWidth: 2.5, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

export function SupplyArt({ id, empty = false }: { id: string; empty?: boolean }) {
  const o = empty ? 0.35 : 1;
  switch (id) {
    case 'folder':
      return (
        <svg viewBox="0 0 100 120" className="item-art" aria-hidden>
          <ellipse cx="50" cy="112" rx="38" ry="5" fill="#2a1a10" opacity="0.25" />
          {[0, 1, 2].map((i) => (
            <g key={i} opacity={empty && i < 2 ? 0 : o} transform={`translate(${i * 3} ${-i * 9})`}>
              <path d="M16 70 h26 l6 -7 h34 v40 h-66 z" fill={['#c99a4a', '#d8ad5c', '#e4bd6c'][i]} {...ST} />
              <path d="M16 78 h66" stroke="#8a6224" strokeWidth="2" />
            </g>
          ))}
        </svg>
      );
    case 'ink':
      return (
        <svg viewBox="0 0 100 120" className="item-art" aria-hidden>
          <ellipse cx="50" cy="112" rx="32" ry="5" fill="#2a1a10" opacity="0.25" />
          <rect x="36" y="30" width="28" height="14" rx="3" fill="#3a2a20" {...ST} />
          <path d="M28 46 h44 l4 8 v50 c0 4 -3 6 -6 6 h-40 c-3 0 -6 -2 -6 -6 v-50 z" fill="#cfe3ea" opacity="0.9" {...ST} />
          <path d={`M27 ${empty ? 100 : 66} h46 v38 c0 3 -2 5 -5 5 h-36 c-3 0 -5 -2 -5 -5 z`} fill="#1f3c6e" />
          <rect x="36" y="70" width="28" height="18" rx="2" fill="#f3ead6" stroke="#2e2219" strokeWidth="1.5" />
          <path d="M41 77 h18 M41 82 h12" stroke="#6a5a48" strokeWidth="1.5" />
        </svg>
      );
    case 'paper':
      return (
        <svg viewBox="0 0 100 120" className="item-art" aria-hidden>
          <ellipse cx="50" cy="112" rx="38" ry="5" fill="#2a1a10" opacity="0.25" />
          <path d="M14 70 h72 v36 h-72 z" fill="#8a6a44" {...ST} />
          {!empty &&
            [0, 1, 2, 3].map((i) => <path key={i} d={`M20 ${66 - i * 6} h62 v6 h-62 z`} fill={i % 2 ? '#f6f0e0' : '#efe6d0'} stroke="#7a6a52" strokeWidth="1.2" />)}
          <path d="M30 70 v-4 M70 70 v-4" stroke="#7a6a52" strokeWidth="1.5" />
        </svg>
      );
    case 'card':
      return (
        <svg viewBox="0 0 100 120" className="item-art" aria-hidden>
          <ellipse cx="50" cy="112" rx="38" ry="5" fill="#2a1a10" opacity="0.25" />
          <path d="M14 62 h72 v44 h-72 z" fill="#5f7f74" {...ST} />
          {!empty &&
            [0, 1, 2, 3, 4].map((i) => <rect key={i} x={20 + i * 2} y={40 + i * 4} width="56" height="30" rx="2" fill="#fbf6ea" stroke="#7a6a52" strokeWidth="1.2" />)}
          <path d="M14 62 h72" stroke="#2e2219" strokeWidth="2.5" />
          <rect x="38" y="78" width="24" height="10" rx="2" fill="#c9b37a" stroke="#2e2219" strokeWidth="1.5" />
        </svg>
      );
  }
  return null;
}

/** Any shelf item: a tea-house container or a desk supply. */
export function ItemArt({ id, empty = false }: { id: string; empty?: boolean }) {
  if (['folder', 'ink', 'paper', 'card'].includes(id)) return <SupplyArt id={id} empty={empty} />;
  return <ContainerArt ing={id as IngredientId} empty={empty} />;
}

/** The delivery crate (wooden, rope handles, the supplier's stencil). */
export function CrateArt() {
  return (
    <svg viewBox="0 0 160 120" className="crate-art" aria-hidden>
      <ellipse cx="80" cy="112" rx="70" ry="7" fill="#1d120a" opacity="0.3" />
      <path d="M14 34 h132 v72 h-132 z" fill="#b98a52" {...ST} />
      {[52, 70, 88].map((y) => (
        <path key={y} d={`M14 ${y} h132`} stroke="#8a5f30" strokeWidth="2" />
      ))}
      <path d="M14 34 l132 72 M146 34 l-132 72" stroke="#8a5f30" strokeWidth="2" opacity="0.5" />
      <path d="M10 28 h140 v10 h-140 z" fill="#a4733e" {...ST} />
      <path d="M52 62 h56 v18 h-56 z" fill="#ead3a4" stroke="#5a3a1c" strokeWidth="2" />
      <path d="M60 71 h40" stroke="#5a3a1c" strokeWidth="2" strokeDasharray="6 4" />
    </svg>
  );
}

/** The door of the Back room with its hanging sign (準備中 / 営業中 / 閉店). */
export function DoorArt({ sign, lit }: { sign: string; lit: boolean }) {
  return (
    <svg viewBox="0 0 160 240" className="door-art" aria-hidden>
      <path d="M14 236 V22 Q14 10 26 10 H134 Q146 10 146 22 V236" fill="#3f5d58" {...ST} />
      <path d="M28 236 V34 Q28 26 36 26 H124 Q132 26 132 34 V236" fill="#4d726b" stroke="#2e2219" strokeWidth="2" />
      <path d="M44 40 H116 V112 H44 Z" fill={lit ? '#f4dc9a' : '#2b3c49'} stroke="#2e2219" strokeWidth="2" />
      <path d="M80 40 V112 M44 76 H116" stroke="#2e2219" strokeWidth="2" />
      <rect x="44" y="130" width="72" height="80" rx="3" fill="none" stroke="#35514c" strokeWidth="2" />
      <circle cx="118" cy="160" r="5" fill="#d9a93c" stroke="#5a3c12" strokeWidth="1.5" />
      <path d="M62 112 L80 126 L98 112" fill="none" stroke="#6b5136" strokeWidth="1.5" />
      <rect x="42" y="124" width="76" height="38" rx="4" fill="#f3ead6" stroke="#2e2219" strokeWidth="2.5" />
      <text x="80" y="149" textAnchor="middle" fontSize="17" fontWeight="700" fill="#2b2620" fontFamily="'Hiragino Sans','Noto Sans JP','IPAGothic',sans-serif">
        {sign}
      </text>
    </svg>
  );
}

/** A stall awning and counter for the market. */
export function StallArt() {
  return (
    <svg viewBox="0 0 600 120" preserveAspectRatio="none" className="stall-art" aria-hidden>
      {Array.from({ length: 12 }, (_, i) => (
        <path key={i} d={`M${i * 50} 0 h50 v70 q-25 22 -50 0 z`} fill={i % 2 ? '#f1e6cf' : '#2f6f86'} stroke="#2e2219" strokeWidth="2" />
      ))}
    </svg>
  );
}

/** The town: a small drawn harbour behind the signboards (decorative). */
export function HarbourArt() {
  return (
    <svg viewBox="0 0 1200 520" preserveAspectRatio="xMidYMid slice" className="harbour-art" aria-hidden>
      <rect width="1200" height="520" fill="#dfe6d8" />
      <path d="M0 420 Q300 400 600 418 T1200 410 V520 H0 Z" fill="#7fa7b0" />
      <path d="M0 448 Q300 432 600 450 T1200 444" stroke="#a9c7cc" strokeWidth="3" fill="none" />
      <path d="M0 470 Q300 456 600 474 T1200 466" stroke="#a9c7cc" strokeWidth="3" fill="none" opacity="0.6" />
      <path d="M0 404 H1200" stroke="#9c8a6c" strokeWidth="14" />
      <path d="M0 150 H1200 M0 288 H1200" stroke="#cdbf9f" strokeWidth="28" />
      <path d="M380 0 V404 M820 0 V404" stroke="#cdbf9f" strokeWidth="24" />
      <g transform="translate(1040 400)">
        <path d="M-50 0 L50 0 L36 22 L-36 22 Z" fill="#6b4a32" stroke="#2e2219" strokeWidth="2" />
        <path d="M0 0 V-70" stroke="#2e2219" strokeWidth="3" />
        <path d="M2 -66 L40 -12 L2 -12 Z" fill="#f3ead6" stroke="#2e2219" strokeWidth="2" />
      </g>
    </svg>
  );
}

/** The town map in its frame on the wall: parchment, the harbour, the streets, the workplaces as small roofs. */
export function TownMapArt() {
  const roofs: [number, number, string][] = [
    [26, 30, '#b8452f'],
    [62, 24, '#3d6c9e'],
    [96, 34, '#d9a520'],
    [30, 66, '#4d7a3a'],
    [70, 62, '#b8452f'],
    [104, 70, '#3d6c9e'],
    [44, 98, '#d9a520'],
  ];
  return (
    <svg viewBox="0 0 140 130" className="townmap-art" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="140" height="130" fill="#efe2bf" />
      <path d="M0 118 Q40 108 70 116 T140 104 V130 H0 Z" fill="#7fa7b0" />
      <path d="M92 130 Q100 110 140 96 V130 Z" fill="#6c97a2" />
      <path d="M8 50 H132 M8 86 H120 M50 10 V112 M88 10 V104" stroke="#cdb48a" strokeWidth="6" strokeLinecap="round" />
      {roofs.map(([x, y, c], i) => (
        <g key={i} transform={`translate(${x} ${y})`}>
          <rect x="-9" y="0" width="18" height="12" fill="#f6ecd6" stroke="#5a4632" strokeWidth="1.5" />
          <path d="M-12 1 L0 -9 L12 1 Z" fill={c} stroke="#5a4632" strokeWidth="1.5" />
        </g>
      ))}
      <circle cx="26" cy="104" r="5" fill="#c8402a" stroke="#fff" strokeWidth="1.5" />
      <g transform="translate(120 22)" stroke="#5a4632" strokeWidth="1.5">
        <circle r="10" fill="#f6ecd6" />
        <path d="M0 -9 L3 0 L0 9 L-3 0 Z" fill="#5a4632" />
      </g>
    </svg>
  );
}
