/**
 * The glass cup on the workbench. Shows the drink as it is being made: the liquid colour is
 * blended from the ingredients (brewing.ts), every portion of a floating ingredient is a piece
 * on the surface (click a piece to take it back), steam when hot, frost when cold, bubbles when
 * boiled, a swirl when stirred, an infuser when steeped.
 */
import { useId } from 'react';
import type { Brew, IngredientId } from '../../core/types';
import { ING_LOOK, cupPieces, liquidColour, liquidLevel, rgbCss, shade } from '../brewing';
import { PieceArt } from './ingredients';

const TOP = 46;
const BOTTOM = 206;
const RIM_RX = 74;
const BASE_RX = 54;

/** x half-width of the inside of the cup at height y. */
const halfAt = (y: number) => BASE_RX + (RIM_RX - BASE_RX) * ((BOTTOM - y) / (BOTTOM - TOP));

export function VesselArt({
  brew,
  order,
  onPiece,
  pieceLabel,
}: {
  brew: Brew;
  order: IngredientId[];
  onPiece?: (ing: IngredientId) => void;
  pieceLabel?: (ing: IngredientId) => string;
}) {
  const uid = useId().replace(/:/g, '');
  const clip = `cup-inside-${uid}`;
  const shadeId = `liquid-shade-${uid}`;
  const col = liquidColour(brew);
  const level = liquidLevel(brew);
  const surf = BOTTOM - (BOTTOM - TOP - 14) * level;
  const hw = halfAt(surf);
  const pieces = cupPieces(brew, order);
  const hot = brew.temp === 'hot';
  const cold = brew.temp === 'cold';
  // Dissolving ingredients: show a hint ring of colour (honey swirl, milk cloud) on the surface.
  const dissolved = order.filter((i) => (brew.counts[i] ?? 0) > 0 && ING_LOOK[i]?.show === 'dissolve');
  return (
    <svg viewBox="0 0 200 240" className={`vessel-art ${hot ? 'is-hot' : ''} ${cold ? 'is-cold' : ''}`} aria-hidden={!onPiece}>
      <defs>
        <clipPath id={clip}>
          <path d={`M${100 - RIM_RX} ${TOP} L${100 - BASE_RX} ${BOTTOM} Q100 ${BOTTOM + 14} ${100 + BASE_RX} ${BOTTOM} L${100 + RIM_RX} ${TOP} Z`} />
        </clipPath>
        <linearGradient id={shadeId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#000" stopOpacity="0.22" />
          <stop offset="0.35" stopColor="#000" stopOpacity="0" />
          <stop offset="0.8" stopColor="#fff" stopOpacity="0.08" />
          <stop offset="1" stopColor="#000" stopOpacity="0.2" />
        </linearGradient>
      </defs>
      {/* saucer */}
      <ellipse cx="100" cy="222" rx="96" ry="15" fill="#2a160a" opacity="0.3" />
      <ellipse cx="100" cy="216" rx="94" ry="16" fill="url(#gl-cream)" stroke="#8a7350" strokeWidth="2" />
      <ellipse cx="100" cy="213" rx="66" ry="9" fill="#efe4cc" stroke="#c8b48a" strokeWidth="1" />
      {/* handle */}
      <path d="M172 82 Q204 86 198 126 Q194 158 166 166" fill="none" stroke="#d6e6e6" strokeWidth="11" opacity="0.7" strokeLinecap="round" />
      <path d="M172 82 Q204 86 198 126 Q194 158 166 166" fill="none" stroke="#fff" strokeWidth="3" opacity="0.6" strokeLinecap="round" />
      {/* back of the glass */}
      <path d={`M${100 - RIM_RX} ${TOP} L${100 - BASE_RX} ${BOTTOM} Q100 ${BOTTOM + 14} ${100 + BASE_RX} ${BOTTOM} L${100 + RIM_RX} ${TOP} Z`} fill="#eef6f5" opacity={cold ? 0.55 : 0.28} />
      {/* liquid */}
      <g clipPath={`url(#${clip})`}>
        {col ? (
          <g className="liquid">
            <rect x="0" y={surf} width="200" height={BOTTOM - surf + 20} fill={rgbCss(col, 0.9)} />
            <rect x="0" y={surf} width="200" height={BOTTOM - surf + 20} fill={`url(#${shadeId})`} />
            <ellipse cx="100" cy={surf} rx={hw} ry={hw * 0.18} fill={rgbCss(shade(col, 0.18))} />
            <ellipse cx="100" cy={surf} rx={hw} ry={hw * 0.18} fill="none" stroke={rgbCss(shade(col, 0.45))} strokeWidth="2" opacity="0.7" />
            {dissolved.map((ing, i) => (
              <ellipse
                key={ing}
                className="swirl"
                cx={100 + ((i % 3) - 1) * 16}
                cy={surf + 1}
                rx={hw * (0.5 - i * 0.07)}
                ry={hw * 0.07}
                fill="none"
                stroke={rgbCss(shade(ING_LOOK[ing].tint, 0.1), 0.8)}
                strokeWidth="3"
                strokeDasharray="30 18"
              />
            ))}
            {brew.method === 'boil' &&
              [0, 1, 2, 3, 4].map((i) => <circle key={i} className="bubble-rise" cx={70 + i * 15} cy={BOTTOM - 10} r={3 + (i % 2) * 2} fill="#fff" opacity="0.55" style={{ animationDelay: `${i * 0.27}s` }} />)}
            {brew.method === 'stir' && (
              <g className="stir-swirl" style={{ transformOrigin: `100px ${surf}px` }}>
                <path d={`M${100 - hw * 0.7} ${surf} A${hw * 0.7} ${hw * 0.12} 0 1 1 ${100 + hw * 0.5} ${surf + 3}`} fill="none" stroke="#fff" strokeOpacity="0.55" strokeWidth="2.5" />
                <path d={`M${100 - hw * 0.35} ${surf} A${hw * 0.35} ${hw * 0.06} 0 1 0 ${100 + hw * 0.3} ${surf - 1}`} fill="none" stroke="#fff" strokeOpacity="0.45" strokeWidth="2" />
              </g>
            )}
          </g>
        ) : null}
      </g>
      {/* pieces on the surface (and a little below it) */}
      {col
        ? pieces.map((p) => {
            const x = 100 + (p.x - 0.5) * 2 * hw * 0.82;
            const y = surf + (p.y - 0.5) * hw * 0.32;
            return (
              <g
                key={`${p.ing}-${p.k}`}
                className={`piece ${onPiece ? 'piece-take' : ''}`}
                transform={`translate(${x} ${y}) rotate(${p.rot}) scale(0.82)`}
                onClick={onPiece ? (e) => (e.stopPropagation(), onPiece(p.ing)) : undefined}
                role={onPiece ? 'button' : undefined}
                aria-label={onPiece && pieceLabel ? pieceLabel(p.ing) : undefined}
              >
                <g className="piece-bob" style={{ animationDelay: `${(p.k * 0.37 + p.x) % 2}s` }}>
                  <PieceArt ing={p.ing} />
                </g>
              </g>
            );
          })
        : null}
      {/* infuser for steeping */}
      {brew.method === 'steep' && (
        <g>
          <path d={`M${100 + RIM_RX - 10} ${TOP - 4} Q120 ${TOP + 10} 112 ${Math.max(surf - 6, TOP + 20)}`} stroke="#6b5a45" strokeWidth="1.6" fill="none" />
          <circle cx="110" cy={Math.max(surf + 10, TOP + 34)} r="13" fill="url(#g-iron)" stroke="#2a2420" strokeWidth="1.5" />
          {[-6, 0, 6].map((d) => (
            <circle key={d} cx={110 + d} cy={Math.max(surf + 10, TOP + 34)} r="1.4" fill="#cfc6b4" />
          ))}
          <rect x={100 + RIM_RX - 14} y={TOP - 14} width="18" height="12" rx="2" fill="#efe2c4" stroke="#8a7350" />
        </g>
      )}
      {/* front of the glass + rim */}
      <path d={`M${100 - RIM_RX} ${TOP} L${100 - BASE_RX} ${BOTTOM} Q100 ${BOTTOM + 14} ${100 + BASE_RX} ${BOTTOM} L${100 + RIM_RX} ${TOP} Z`} fill="url(#g-glass)" stroke="#9fb8b6" strokeWidth="2.5" />
      <path d={`M${100 - BASE_RX} ${BOTTOM} Q100 ${BOTTOM + 14} ${100 + BASE_RX} ${BOTTOM}`} stroke="#c9dcdb" strokeWidth="6" fill="none" opacity="0.6" />
      <ellipse cx="100" cy={TOP} rx={RIM_RX} ry="12" fill="none" stroke="#c3d6d5" strokeWidth="4" />
      <ellipse cx="100" cy={TOP} rx={RIM_RX} ry="12" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.8" />
      <path d={`M${100 - RIM_RX + 12} ${TOP + 16} L${100 - BASE_RX + 10} ${BOTTOM - 12}`} stroke="#fff" strokeWidth="6" opacity="0.4" strokeLinecap="round" />
      {/* frost */}
      {cold && (
        <g className="frost" opacity="0.85">
          {[
            [48, 80],
            [60, 140],
            [140, 100],
            [150, 170],
            [84, 186],
            [124, 64],
          ].map(([x, y], i) => (
            <g key={i} stroke="#fff" strokeWidth="1.6" transform={`translate(${x} ${y}) scale(${0.7 + (i % 3) * 0.2})`}>
              <path d="M-6 0 h12 M0 -6 v12 M-4 -4 l8 8 M-4 4 l8 -8" />
            </g>
          ))}
          <path d={`M${100 - RIM_RX} ${TOP} L${100 - BASE_RX} ${BOTTOM} Q100 ${BOTTOM + 14} ${100 + BASE_RX} ${BOTTOM} L${100 + RIM_RX} ${TOP} Z`} fill="#dff3fb" opacity="0.18" />
        </g>
      )}
      {/* steam */}
      {hot && col && (
        <g className="steam" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round">
          {[70, 100, 130].map((x, i) => (
            <path key={x} className="steam-wisp" style={{ animationDelay: `${i * 0.6}s` }} d={`M${x} ${TOP - 6} q-10 -16 0 -32 q10 -16 0 -32`} />
          ))}
        </g>
      )}
    </svg>
  );
}
