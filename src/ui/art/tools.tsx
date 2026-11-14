/**
 * Workbench tools: kettle on a brazier (hot), cold-water basin (cold), hourglass (steep),
 * pot on a flame (boil), spoon in a holder (stir), knife + board, slop bowl, tongs.
 * Each is a standalone SVG; `active` shows the tool in use (steam, flame, sand running…).
 */

/** `big`: the big copper kettle from the renovation catalogue (larger, with a brass band). */
export function KettleArt({ active, big = false }: { active: boolean; big?: boolean }) {
  return (
    <svg viewBox="0 0 160 200" className="tool-art" aria-hidden>
      <ellipse cx="80" cy="192" rx="62" ry="7" fill="#1d0e05" opacity="0.35" />
      {/* brazier */}
      <path d="M30 132 L130 132 L120 186 L40 186 Z" fill="url(#g-iron)" stroke="#1a1612" strokeWidth="2" />
      <ellipse cx="80" cy="132" rx="52" ry="9" fill="#2a2420" stroke="#1a1612" strokeWidth="2" />
      <ellipse cx="80" cy="132" rx="42" ry="6" fill="url(#g-ember)" className={active ? 'ember on' : 'ember'} />
      {[52, 70, 90, 108].map((x) => (
        <rect key={x} x={x} y="150" width="8" height="20" rx="3" fill="#1a1612" />
      ))}
      {/* kettle */}
      <g transform={big ? 'translate(76 130) scale(1.12) translate(-80 -128)' : undefined}>
      <path d="M118 70 Q150 60 152 40" stroke="url(#g-copper)" strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M40 128 Q32 92 48 74 Q80 56 112 74 Q128 92 120 128 Z" fill="url(#g-copper)" stroke="#5a2a10" strokeWidth="2" />
      <path d="M50 84 Q46 104 52 122" stroke="#ffd7a8" strokeWidth="6" opacity="0.4" fill="none" strokeLinecap="round" />
      <ellipse cx="80" cy="72" rx="26" ry="6" fill="#8e4520" stroke="#5a2a10" strokeWidth="2" />
      <circle cx="80" cy="64" r="6" fill="#3a2010" />
      <path d="M52 76 Q80 20 108 76" stroke="#3a2010" strokeWidth="6" fill="none" strokeLinecap="round" />
      {big ? (
        <g>
          <path d="M41 108 Q80 118 119 108" stroke="url(#g-brass)" strokeWidth="5" fill="none" />
          <path d="M52 76 Q80 20 108 76" stroke="#e8c46a" strokeWidth="2" fill="none" opacity="0.7" />
          <circle cx="80" cy="64" r="4" fill="url(#g-brass)" />
        </g>
      ) : null}
      </g>
      {active && (
        <g className="steam" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.8">
          <path className="steam-wisp" d="M152 36 q-8 -12 0 -24 q8 -12 0 -24" />
          <path className="steam-wisp" style={{ animationDelay: '0.8s' }} d="M146 40 q-8 -12 0 -24 q8 -12 0 -24" />
        </g>
      )}
    </svg>
  );
}

export function ColdBasinArt({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 160 140" className="tool-art" aria-hidden>
      <ellipse cx="80" cy="132" rx="66" ry="7" fill="#1d0e05" opacity="0.35" />
      <path d="M14 52 L146 52 L134 128 L26 128 Z" fill="#9a6a3a" stroke="#4a2c12" strokeWidth="2" filter="url(#tx-wood-v)" />
      {[34, 54, 74, 94, 114].map((x) => (
        <line key={x} x1={x} y1="53" x2={x + (80 - x) * 0.1} y2="127" stroke="#5a3a1a" strokeWidth="1.2" opacity="0.6" />
      ))}
      <path d="M16 64 L144 64 M22 110 L138 110" stroke="url(#g-iron)" strokeWidth="6" />
      <ellipse cx="80" cy="52" rx="66" ry="10" fill="url(#g-cold)" stroke="#4a2c12" strokeWidth="3" />
      {[
        [50, 50],
        [96, 48],
        [118, 54],
      ].map(([x, y], i) => (
        <g key={i} transform={`rotate(${i * 20 - 15} ${x} ${y})`}>
          <rect x={x - 8} y={y - 6} width="16" height="12" rx="2" fill="#f2fbff" stroke="#8fc3dc" strokeWidth="1.2" />
        </g>
      ))}
      {active && (
        <g className="frost-sparkle" stroke="#fff" strokeWidth="2">
          <path d="M30 30 h10 M35 25 v10 M120 20 h10 M125 15 v10 M74 14 h8 M78 10 v8" />
        </g>
      )}
    </svg>
  );
}

export function HourglassArt({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 90 170" className="tool-art" aria-hidden>
      <ellipse cx="45" cy="164" rx="36" ry="5" fill="#1d0e05" opacity="0.35" />
      <rect x="10" y="10" width="70" height="12" rx="4" fill="#8e5a2e" stroke="#4a2c12" strokeWidth="2" />
      <rect x="10" y="148" width="70" height="12" rx="4" fill="#8e5a2e" stroke="#4a2c12" strokeWidth="2" />
      <rect x="14" y="22" width="6" height="126" fill="#6b4222" />
      <rect x="70" y="22" width="6" height="126" fill="#6b4222" />
      <path d="M24 24 Q24 70 43 84 Q24 98 24 146 L66 146 Q66 98 47 84 Q66 70 66 24 Z" fill="#eef6f5" opacity="0.4" stroke="#9fb8b6" strokeWidth="2" />
      <path className={active ? 'sand-top run' : 'sand-top'} d="M30 40 Q32 66 45 80 Q58 66 60 40 Z" fill="#e3c27a" />
      <path className={active ? 'sand-bottom run' : 'sand-bottom'} d="M28 146 Q34 124 45 120 Q56 124 62 146 Z" fill="#e3c27a" />
      {active && <line x1="45" y1="82" x2="45" y2="130" stroke="#e3c27a" strokeWidth="2" className="sand-stream" />}
      <path d="M28 30 Q28 66 40 78" stroke="#fff" strokeWidth="3" opacity="0.5" fill="none" />
    </svg>
  );
}

export function PotArt({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 160 170" className="tool-art" aria-hidden>
      <ellipse cx="80" cy="162" rx="56" ry="6" fill="#1d0e05" opacity="0.35" />
      {/* little stove */}
      <rect x="34" y="118" width="92" height="42" rx="6" fill="url(#g-iron)" stroke="#1a1612" strokeWidth="2" />
      <rect x="64" y="132" width="32" height="16" rx="4" fill="#1a1612" />
      {active ? (
        <g className="flame">
          <path d="M70 120 Q66 104 76 92 Q74 106 82 110 Q84 98 90 92 Q96 106 90 120 Z" fill="#ff9a2a" />
          <path d="M76 120 Q74 110 80 102 Q82 112 86 120 Z" fill="#ffe08a" />
        </g>
      ) : (
        <ellipse cx="80" cy="122" rx="14" ry="3" fill="#3a2a20" />
      )}
      {/* pot */}
      <path d="M22 62 L138 62 L132 112 Q80 126 28 112 Z" fill="url(#g-iron)" stroke="#121010" strokeWidth="2" />
      <path d="M10 66 h14 M136 66 h14" stroke="#121010" strokeWidth="8" strokeLinecap="round" />
      <ellipse cx="80" cy="62" rx="58" ry="10" fill="#3a3430" stroke="#121010" strokeWidth="2" />
      <ellipse cx="80" cy="63" rx="50" ry="7" fill={active ? '#c8a874' : '#4a4038'} />
      {active &&
        [56, 76, 96, 110].map((x, i) => <circle key={x} className="bubble-pop" cx={x} cy={62} r={3 + (i % 2) * 2} fill="#f1dcae" style={{ animationDelay: `${i * 0.2}s` }} />)}
      <path d="M32 74 Q34 94 40 106" stroke="#fff" strokeWidth="4" opacity="0.18" fill="none" strokeLinecap="round" />
      {active && (
        <g className="steam" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" opacity="0.7">
          <path className="steam-wisp" d="M64 50 q-8 -12 0 -24 q8 -12 0 -24" />
          <path className="steam-wisp" style={{ animationDelay: '0.7s' }} d="M98 50 q-8 -12 0 -24 q8 -12 0 -24" />
        </g>
      )}
    </svg>
  );
}

export function SpoonArt({ active }: { active: boolean }) {
  return (
    <svg viewBox="0 0 90 170" className="tool-art" aria-hidden>
      <ellipse cx="45" cy="164" rx="34" ry="5" fill="#1d0e05" opacity="0.35" />
      <g className={active ? 'spoon-stir on' : 'spoon-stir'} style={{ transformOrigin: '45px 110px' }}>
        <path d="M40 106 L36 20" stroke="url(#g-brass)" strokeWidth="7" strokeLinecap="round" />
        <ellipse cx="35" cy="16" rx="11" ry="15" fill="url(#g-brass)" stroke="#7d5a1c" strokeWidth="1.5" />
        <path d="M54 106 L60 30" stroke="#a87a45" strokeWidth="6" strokeLinecap="round" />
      </g>
      <path d="M18 100 L72 100 L66 160 L24 160 Z" fill="url(#gl-indigo)" stroke="#1c2747" strokeWidth="2" />
      <ellipse cx="45" cy="100" rx="27" ry="6" fill="#2b3a63" stroke="#1c2747" strokeWidth="2" />
      <path d="M24 122 h42" stroke="#e6ecf6" strokeWidth="2" opacity="0.6" />
    </svg>
  );
}

export function BoardArt({ chopping }: { chopping: boolean }) {
  return (
    <svg viewBox="0 0 200 110" className="tool-art" aria-hidden>
      <ellipse cx="100" cy="100" rx="94" ry="8" fill="#1d0e05" opacity="0.3" />
      <rect x="8" y="34" width="184" height="60" rx="14" fill="#c99560" stroke="#6b4222" strokeWidth="2" filter="url(#tx-wood)" />
      <rect x="8" y="80" width="184" height="14" rx="7" fill="#8e5a2e" />
      <circle cx="176" cy="56" r="6" fill="#6b4222" />
      <g className={chopping ? 'knife chop' : 'knife'} style={{ transformOrigin: '150px 60px' }}>
        <path d="M40 58 L136 46 L140 58 L44 66 Z" fill="#dcdcd6" stroke="#6d6a66" strokeWidth="1.5" />
        <path d="M40 58 L136 46" stroke="#fff" strokeWidth="2" opacity="0.8" />
        <rect x="136" y="44" width="50" height="14" rx="5" fill="#3a2010" transform="rotate(-6 136 44)" />
      </g>
    </svg>
  );
}

export function SlopBowlArt({ tipping }: { tipping: boolean }) {
  return (
    <svg viewBox="0 0 120 70" className="tool-art" aria-hidden>
      <ellipse cx="60" cy="64" rx="52" ry="5" fill="#1d0e05" opacity="0.3" />
      <path d="M8 24 Q12 64 60 64 Q108 64 112 24 Z" fill="url(#gl-blackglaze)" stroke="#120c08" strokeWidth="2" />
      <ellipse cx="60" cy="24" rx="52" ry="9" fill="#3a2a20" stroke="#120c08" strokeWidth="2" />
      <ellipse cx="60" cy="25" rx="42" ry="6" fill={tipping ? '#b98a50' : '#6a5440'} />
    </svg>
  );
}

/** Small hand tools used in the effects over the cup (drawn, so they match the scene). */
export function HandToolArt({ tool }: { tool: 'knife' | 'spoon' | 'tongs' | 'stir' }) {
  if (tool === 'knife')
    return (
      <svg viewBox="0 0 120 40" className="tool-art" aria-hidden>
        <path d="M4 22 L76 10 L80 22 L8 28 Z" fill="#e2e2dc" stroke="#6d6a66" strokeWidth="1.5" />
        <path d="M4 22 L76 10" stroke="#fff" strokeWidth="2" opacity="0.9" />
        <rect x="76" y="10" width="40" height="13" rx="5" fill="#3a2010" transform="rotate(-4 76 10)" />
        <circle cx="88" cy="16" r="1.6" fill="#c99a3c" />
        <circle cx="104" cy="15" r="1.6" fill="#c99a3c" />
      </svg>
    );
  if (tool === 'tongs')
    return (
      <svg viewBox="0 0 60 120" className="tool-art" aria-hidden>
        <path d="M24 4 L14 112 M36 4 L46 112" stroke="url(#g-iron)" strokeWidth="6" strokeLinecap="round" />
        <path d="M24 4 Q30 -2 36 4" stroke="#2f2b28" strokeWidth="6" fill="none" />
        <path d="M10 108 h10 M40 108 h10" stroke="#2f2b28" strokeWidth="5" strokeLinecap="round" />
      </svg>
    );
  // spoon (also used for stirring)
  return (
    <svg viewBox="0 0 40 130" className="tool-art" aria-hidden>
      <path d="M20 40 L22 126" stroke="url(#g-brass)" strokeWidth="6" strokeLinecap="round" />
      <ellipse cx="19" cy="22" rx="13" ry="19" fill="url(#g-brass)" stroke="#7d5a1c" strokeWidth="1.5" />
      <ellipse cx="16" cy="18" rx="5" ry="9" fill="#fff4cc" opacity="0.6" />
    </svg>
  );
}
