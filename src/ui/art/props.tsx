/**
 * Desk and wall props: the recipe book and the notebook lying on the counter, the coin jar,
 * the reputation plaque, the wall calendar, the queue of order tickets, shelf decorations.
 * Numbers are drawn into the objects (diegetic chrome).
 */

export function RecipeBookProp() {
  return (
    <svg viewBox="0 0 200 240" className="prop-art" aria-hidden>
      <ellipse cx="104" cy="226" rx="90" ry="10" fill="#1d0e05" opacity="0.35" />
      {/* page block */}
      <path d="M22 24 L180 18 L186 210 L28 218 Z" fill="#efe0bf" />
      {Array.from({ length: 6 }, (_, i) => (
        <path key={i} d={`M${182 + i * 0.4} ${24 + i * 2} L${187 + i * 0.3} ${206 - i}`} stroke="#c8b28a" strokeWidth="1" />
      ))}
      {/* cover */}
      <path d="M14 14 L174 8 L180 204 L20 212 Z" fill="url(#g-leather-red)" stroke="#3a0e08" strokeWidth="2" />
      <path d="M14 14 L36 13 L42 211 L20 212 Z" fill="#000" opacity="0.18" />
      <path d="M50 34 L160 30 L164 186 L54 190 Z" fill="none" stroke="#e0b860" strokeWidth="2" opacity="0.8" />
      <path d="M58 42 L152 38 L156 178 L62 182 Z" fill="none" stroke="#e0b860" strokeWidth="1" opacity="0.6" />
      {/* embossed leaf + cup */}
      <g transform="translate(106 104)" stroke="#e8c46a" strokeWidth="2.5" fill="none" opacity="0.9">
        <path d="M-26 6 Q-24 30 0 32 Q24 30 26 6 Z" />
        <path d="M26 12 Q40 12 38 22 Q36 30 24 28" />
        <path d="M-8 -6 Q-18 -26 0 -40 Q12 -24 -8 -6 Z" />
        <path d="M6 -2 Q16 -20 32 -18 Q26 -2 6 -2 Z" />
      </g>
      {/* corner brass */}
      <path d="M160 9 L174 8 L175 24 Z M164 204 L180 204 L179 188 Z" fill="url(#g-brass)" />
      {/* ribbon */}
      <path d="M128 212 L132 236 L138 228 L144 234 L140 210" fill="#2c4a6a" />
    </svg>
  );
}

export function NotebookProp({ glow, ribbon = false }: { glow: boolean; ribbon?: boolean }) {
  return (
    <svg viewBox="0 0 180 230" className="prop-art" aria-hidden>
      <ellipse cx="92" cy="218" rx="80" ry="9" fill="#1d0e05" opacity="0.35" />
      <rect x="22" y="14" width="140" height="196" rx="6" fill="#f3e6c6" />
      <rect x="16" y="10" width="140" height="196" rx="8" fill="url(#g-leather-green)" stroke="#16220f" strokeWidth="2" />
      {/* elastic band */}
      <rect x="128" y="10" width="8" height="196" fill="#1b1b1b" opacity="0.75" />
      {/* label */}
      <rect x="40" y="50" width="76" height="40" rx="3" fill="#f6ecd2" stroke="#8a7350" />
      <path d="M48 64 h58 M48 76 h40" stroke="#6b5a45" strokeWidth="2" opacity="0.6" />
      {/* pencil */}
      <g transform="rotate(-62 120 190)">
        <rect x="70" y="184" width="100" height="10" fill="#e3b23c" stroke="#7a5a1c" />
        <path d="M170 184 L184 189 L170 194 Z" fill="#f2d9b0" stroke="#7a5a1c" />
        <path d="M180 187.5 L184 189 L180 190.5 Z" fill="#2a1a10" />
        <rect x="64" y="184" width="8" height="10" fill="#c46a5a" />
      </g>
      {/* the review ribbon (renovation) hangs out at the bottom */}
      {ribbon ? <path d="M58 200 L58 228 L64 222 L70 230 L70 200 Z" fill="#c8402a" stroke="#6b1a10" strokeWidth="1.5" /> : null}
      {/* bookmark sticking out when something new is ready */}
      {glow && <path className="nb-bookmark" d="M96 10 L96 -24 L106 -16 L116 -24 L116 10 Z" fill="#c8402a" stroke="#6b1a10" strokeWidth="1.5" />}
    </svg>
  );
}

export function CoinJarArt({ amount }: { amount: number }) {
  const fill = Math.max(0.08, Math.min(0.85, amount / 120));
  const top = 150 - 100 * fill;
  return (
    <svg viewBox="0 0 120 170" className="prop-art" aria-hidden>
      <ellipse cx="60" cy="162" rx="46" ry="6" fill="#1d0e05" opacity="0.35" />
      <defs>
        <clipPath id="coinjar-clip">
          <path d="M22 40 Q14 52 14 80 L14 140 Q14 156 30 156 L90 156 Q106 156 106 140 L106 80 Q106 52 98 40 Z" />
        </clipPath>
      </defs>
      <g clipPath="url(#coinjar-clip)">
        <rect x="0" y={top} width="120" height="160" fill="#c99a3c" />
        {Array.from({ length: 18 }, (_, i) => (
          <ellipse key={i} cx={20 + ((i * 37) % 84)} cy={top + 6 + ((i * 23) % 60)} rx="10" ry="4" fill={i % 3 ? '#e8c46a' : '#b8862a'} stroke="#7d5a1c" strokeWidth="1" />
        ))}
      </g>
      <path d="M22 40 Q14 52 14 80 L14 140 Q14 156 30 156 L90 156 Q106 156 106 140 L106 80 Q106 52 98 40 Z" fill="url(#g-glass)" stroke="#8aa2a0" strokeWidth="2.5" />
      <rect x="26" y="22" width="68" height="20" rx="4" fill="#8e5a2e" stroke="#4a2c12" strokeWidth="2" />
      <rect x="44" y="28" width="32" height="5" rx="2" fill="#2a160a" />
      {/* paper label with the amount */}
      <rect x="30" y="92" width="60" height="34" rx="3" fill="#f6ecd2" stroke="#8a7350" />
      <text x="60" y="117" textAnchor="middle" fontSize="20" fontWeight="700" fill="#5a3a12" style={{ fontFamily: 'var(--font-serif)' }}>
        {amount}
      </text>
    </svg>
  );
}

/** Wooden plaque above the door: the shop's reputation (stars fill up as it grows). */
export function PlaqueArt({ rep }: { rep: number }) {
  const stars = Math.min(5, Math.floor(rep / 25) + (rep > 0 ? 1 : 0));
  return (
    <svg viewBox="0 0 200 100" className="prop-art" aria-hidden>
      <path d="M40 0 L60 16 M160 0 L140 16" stroke="#3a2a1a" strokeWidth="2.5" />
      <rect x="6" y="14" width="188" height="82" rx="10" fill="#8e5a2e" stroke="#3a1f0e" strokeWidth="3" filter="url(#tx-wood)" />
      <rect x="14" y="21" width="172" height="68" rx="6" fill="none" stroke="#e0b860" strokeWidth="1.5" opacity="0.7" />
      <text x="58" y="56" textAnchor="middle" fontSize="20" fill="#f6e2b0" style={{ fontFamily: 'var(--font-serif)' }} fontWeight="700">
        評判
      </text>
      <text x="134" y="60" textAnchor="middle" fontSize="32" fill="#fff2cc" style={{ fontFamily: 'var(--font-serif)' }} fontWeight="700" className="plaque-num">
        {rep}
      </text>
      {Array.from({ length: 5 }, (_, i) => (
        <path
          key={i}
          transform={`translate(${44 + i * 28} 78) scale(0.55)`}
          d="M0 -14 L4 -4 L14 -4 L6 2 L9 12 L0 6 L-9 12 L-6 2 L-14 -4 L-4 -4 Z"
          fill={i < stars ? '#f2c94c' : '#5a3a1a'}
          stroke="#3a1f0e"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

/** Tea set still life for the empty end of the counter (before the tools arrive). */
export function TeaSetArt() {
  return (
    <svg viewBox="0 0 300 170" className="prop-art" aria-hidden>
      <ellipse cx="150" cy="158" rx="140" ry="10" fill="#1d0e05" opacity="0.3" />
      <rect x="10" y="132" width="280" height="22" rx="6" fill="#6b4222" stroke="#3a1f0e" strokeWidth="2" filter="url(#tx-wood)" />
      <g transform="translate(70 40)">
        <path d="M80 50 Q110 40 118 18" stroke="#2b3a63" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M-20 60 Q-36 64 -34 80 Q-32 92 -16 90" stroke="#2b3a63" strokeWidth="7" fill="none" />
        <path d="M-14 40 Q-24 92 30 94 Q84 92 74 40 Z" fill="url(#gl-indigo)" stroke="#1c2747" strokeWidth="2" />
        <ellipse cx="30" cy="40" rx="44" ry="9" fill="#2b3a63" stroke="#1c2747" strokeWidth="2" />
        <ellipse cx="30" cy="30" rx="12" ry="6" fill="url(#gl-indigo)" />
        <path d="M0 60 q30 14 60 0" stroke="#e6ecf6" strokeWidth="2.5" fill="none" opacity="0.7" />
        <circle cx="16" cy="74" r="4" fill="#e6ecf6" opacity="0.6" />
        <circle cx="44" cy="74" r="4" fill="#e6ecf6" opacity="0.6" />
        <path d="M-2 50 Q-6 70 2 84" stroke="#fff" strokeWidth="4" opacity="0.25" fill="none" strokeLinecap="round" />
      </g>
      {[210, 256].map((x) => (
        <g key={x} transform={`translate(${x} 104)`}>
          <ellipse cx="0" cy="28" rx="24" ry="5" fill="url(#gl-cream)" stroke="#8a7350" />
          <path d="M-16 4 Q-14 28 0 28 Q14 28 16 4 Z" fill="url(#gl-celadon)" stroke="#3d5a33" strokeWidth="1.5" />
          <ellipse cx="0" cy="4" rx="16" ry="4" fill="#c79a52" stroke="#3d5a33" strokeWidth="1.5" />
        </g>
      ))}
      <g className="steam" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" opacity="0.6">
        <path className="steam-wisp" d="M188 50 q-6 -10 0 -20 q6 -10 0 -20" />
        <path className="steam-wisp" style={{ animationDelay: '1.1s' }} d="M196 54 q-6 -10 0 -20 q6 -10 0 -20" />
      </g>
    </svg>
  );
}

/** Tear-off wall calendar: the day number, plus today's plan (朝 市場 → 昼 茶房 → 夕方 配達). */
export function CalendarArt({ day }: { day: number }) {
  return (
    <svg viewBox="0 0 90 110" className="prop-art" aria-hidden>
      <circle cx="45" cy="6" r="4" fill="#3a2a1a" />
      <path d="M45 6 L20 20 M45 6 L70 20" stroke="#3a2a1a" strokeWidth="1.5" />
      <rect x="6" y="18" width="78" height="88" rx="4" fill="#f6ecd2" stroke="#8a7350" strokeWidth="2" filter="url(#tx-paper)" />
      <rect x="6" y="18" width="78" height="22" rx="4" fill="#9b3f26" />
      <circle cx="26" cy="29" r="3" fill="#5a1a10" />
      <circle cx="64" cy="29" r="3" fill="#5a1a10" />
      <text x="45" y="84" textAnchor="middle" fontWeight="700" fill="#3a2e22" style={{ fontFamily: 'var(--font-serif)' }}>
        <tspan fontSize={day >= 100 ? 26 : 36}>{day}</tspan>
        <tspan fontSize="15" dx="1">
          日目
        </tspan>
      </text>
      <path d="M10 104 h70" stroke="#c8b28a" strokeWidth="2" strokeDasharray="3 3" />
    </svg>
  );
}

/** Small decorative things that fill empty shelf slots early in the game. */
export function DecorArt({ i }: { i: number }) {
  const k = i % 6;
  return (
    <svg viewBox="0 0 100 120" className="container-art decor" aria-hidden>
      <ellipse cx="50" cy="114" rx="38" ry="5" fill="#1d0e05" opacity="0.3" />
      {k === 0 && (
        <g>
          {[0, 1, 2].map((j) => (
            <path key={j} d={`M${18 + j * 2} ${110 - j * 14} Q50 ${118 - j * 14} ${82 - j * 2} ${110 - j * 14} L${78 - j * 2} ${98 - j * 14} L${22 + j * 2} ${98 - j * 14} Z`} fill="url(#gl-cream)" stroke="#8a7350" strokeWidth="1.5" />
          ))}
        </g>
      )}
      {k === 1 && (
        <g>
          <path d="M20 70 Q16 112 50 112 Q84 112 80 70 Z" fill="url(#gl-indigo)" stroke="#1c2747" strokeWidth="2" />
          <path d="M80 78 Q96 80 92 92 Q88 100 78 98" stroke="#2b3a63" strokeWidth="5" fill="none" />
          <path d="M20 74 Q14 66 6 66" stroke="#2b3a63" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="50" cy="68" rx="30" ry="6" fill="#2b3a63" />
          <circle cx="50" cy="60" r="6" fill="url(#gl-indigo)" />
          <path d="M34 88 q16 -8 32 0" stroke="#e6ecf6" strokeWidth="2" fill="none" />
        </g>
      )}
      {k === 2 && (
        <g>
          <path d="M30 80 L70 80 L66 112 L34 112 Z" fill="url(#gl-terracotta)" stroke="#6b2414" strokeWidth="1.5" />
          {[-30, -10, 10, 30].map((a, j) => (
            <ellipse key={j} cx={50 + a * 0.6} cy={60 - Math.abs(a) * 0.2} rx="8" ry="20" fill={j % 2 ? '#6fa64a' : '#5a8f3a'} transform={`rotate(${a} 50 80)`} />
          ))}
        </g>
      )}
      {k === 3 && (
        <g>
          <rect x="22" y="40" width="56" height="72" rx="6" fill="url(#gl-tin)" stroke="#5a564e" strokeWidth="2" opacity="0.85" />
          <rect x="20" y="32" width="60" height="12" rx="4" fill="#8a857a" />
          <path d="M28 60 h44" stroke="#fff" strokeWidth="1" opacity="0.4" />
          <path d="M30 80 q20 -10 40 0" stroke="#4a463e" strokeWidth="1.5" fill="none" opacity="0.4" />
        </g>
      )}
      {k === 4 && (
        <g>
          {[0, 1, 2, 3].map((j) => (
            <rect key={j} x={16 + j * 18} y={50 + (j % 2) * 6} width="16" height={62 - (j % 2) * 6} rx="2" fill={['#7a3e32', '#3e5a7a', '#4d6a45', '#8a6a3a'][j]} stroke="#2a160a" strokeWidth="1" transform={j === 3 ? 'rotate(12 80 112)' : undefined} />
          ))}
        </g>
      )}
      {k === 5 && (
        <g>
          <path d="M26 112 Q20 70 40 56 L60 56 Q80 70 74 112 Z" fill="url(#gl-celadon)" stroke="#3d5a33" strokeWidth="2" />
          <rect x="38" y="44" width="24" height="14" rx="3" fill="#6f8c62" stroke="#3d5a33" strokeWidth="1.5" />
          <path d="M32 80 q18 10 36 0" stroke="#e8f0e0" strokeWidth="2" fill="none" />
        </g>
      )}
    </svg>
  );
}

/** The shop's emblem: a teapot with a sprig over an anchor (title screen, recipe book cover). */
export function TeapotEmblem() {
  return (
    <svg viewBox="0 0 160 120" className="emblem-art" aria-hidden>
      <g stroke="#7a2f1b" strokeWidth="5" fill="none" strokeLinecap="round" strokeLinejoin="round">
        {/* anchor behind */}
        <path d="M80 18 V108 M58 30 H102 M40 80 Q46 108 80 108 Q114 108 120 80" opacity="0.35" />
        <circle cx="80" cy="12" r="6" opacity="0.35" />
      </g>
      <path d="M40 58 Q36 100 80 102 Q124 100 120 58 Z" fill="url(#gl-indigo)" stroke="#1c2747" strokeWidth="3" />
      <ellipse cx="80" cy="58" rx="40" ry="9" fill="#2b3a63" stroke="#1c2747" strokeWidth="3" />
      <ellipse cx="80" cy="48" rx="12" ry="6" fill="url(#gl-indigo)" stroke="#1c2747" strokeWidth="2" />
      <path d="M120 66 Q146 60 150 40" stroke="#2b3a63" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M40 66 Q20 66 22 82 Q24 94 40 92" stroke="#2b3a63" strokeWidth="6" fill="none" />
      <path d="M54 78 q26 12 52 0" stroke="#e6ecf6" strokeWidth="3" fill="none" opacity="0.8" />
      <path d="M86 42 Q96 22 116 24 Q108 42 86 42 Z" fill="#6fa64a" stroke="#3d6331" strokeWidth="2" />
      <path d="M84 40 Q74 24 58 26 Q66 40 84 40 Z" fill="#7fb35a" stroke="#3d6331" strokeWidth="2" />
    </svg>
  );
}
