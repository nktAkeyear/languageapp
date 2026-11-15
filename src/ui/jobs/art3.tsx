/**
 * Art of the four upper-level workplaces (SVG, no files): the newspaper office (the Harbour Courier's newsroom),
 * the clinic's reception, the town hall's counter and the academy library — each interior drawn as its own room
 * (pre-rasterised once per shift by the scene, like the other interiors), and their fronts on the town map.
 *
 * The bench of a task stands in the middle of the stage, so what makes each room recognisable is drawn where the
 * bench leaves the room visible: behind the person (left), along the top, the right edge and the desk in front.
 * One accent hue family per room, warm-tinted neutrals, outlines of 2+ units.
 */
import { WindowSky } from './art2';

type Sky = { top: string; bottom: string };

const INK = '#2a2118';

/** A shelf of book spines between x0 and x1 at the baseline y (seeded so every room keeps its own books). */
function Spines({ x0, x1, y, h = 70, seed = 1, palette }: { x0: number; x1: number; y: number; h?: number; seed?: number; palette: string[] }) {
  const out: JSX.Element[] = [];
  let x = x0;
  let s = seed * 9301 + 49297;
  const r = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  let i = 0;
  while (x < x1 - 10) {
    const w = 12 + Math.floor(r() * 14);
    const hh = h * (0.72 + r() * 0.28);
    const lean = r() < 0.08 ? -6 : 0;
    out.push(
      <g key={i++} transform={`rotate(${lean} ${x} ${y})`}>
        <rect x={x} y={y - hh} width={w} height={hh} fill={palette[Math.floor(r() * palette.length)]} stroke={INK} strokeWidth="2" />
        <rect x={x + 2} y={y - hh + 8} width={w - 4} height="4" fill="#e8d49a" opacity="0.7" />
      </g>,
    );
    x += w + 1;
  }
  return <g>{out}</g>;
}

// ------------------------------------------------------------------------------------- the newsroom

/** The Harbour Courier: newsprint-cream walls over a green dado, the page plan on the board, the wire tray, a typewriter. */
export function NewsBackdrop({ sky }: { sky: Sky }) {
  return (
    <svg viewBox="0 0 1600 1000" className="job-backdrop" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="1600" height="1000" fill="#ece3cc" />
      {/* faint newsprint columns on the wall */}
      {Array.from({ length: 26 }, (_, i) => (
        <path key={i} d={`M${i * 64 + 20} 60 V540`} stroke="#ddd1b2" strokeWidth="2" />
      ))}
      <rect y="0" width="1600" height="44" fill="#2f4a3e" />
      <rect y="560" width="1600" height="190" fill="#3f6a58" />
      <rect y="552" width="1600" height="14" fill="#24382f" />
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={i * 100 + 14} y="586" width="72" height="140" rx="3" fill="none" stroke="#2c4a3e" strokeWidth="3" />
      ))}
      {/* tall window on the harbour, behind the person */}
      <WindowSky id="jb-n-sky" sky={sky} x={60} y={70} w={300} h={360} />
      <path d="M70 360 Q160 340 230 356 T350 352 V430 H70 Z" fill="#5f9ab8" />
      <path d="M150 352 l32 -64 l4 64 Z" fill="#f4ecd8" stroke="#8a7350" strokeWidth="2" />
      <path d="M134 354 h66 l-8 10 h-50 Z" fill="#4a3a2a" />
      {/* the masthead on the wall */}
      <g transform="translate(420 70)">
        <rect width="300" height="96" fill="#f6f0de" stroke={INK} strokeWidth="4" />
        <path d="M20 22 h260 M20 76 h260" stroke={INK} strokeWidth="3" />
        <path d="M40 46 h40 M90 46 h60 M160 46 h36 M206 46 h52 M60 60 h70 M140 60 h90" stroke={INK} strokeWidth="7" strokeLinecap="round" />
      </g>
      {/* the page plan: pages pinned on cork, columns ruled, stories pencilled in */}
      <g transform="translate(760 64)">
        <rect width="560" height="300" rx="6" fill="#c89a62" stroke="#5a3a1a" strokeWidth="5" />
        {[0, 1, 2, 3].map((p) => (
          <g key={p} transform={`translate(${24 + p * 134} 26) rotate(${[-1.5, 1, -0.5, 1.5][p]})`}>
            <rect width="112" height="150" fill="#fbf6e8" stroke="#6b5a40" strokeWidth="2" />
            <rect x="8" y="8" width="96" height="16" fill="#3a3028" opacity="0.85" />
            {[0, 1, 2].map((c) => (
              <path key={c} d={`M${12 + c * 32} 32 V140`} stroke="#c8b89a" strokeWidth="1.5" />
            ))}
            <rect x="10" y="34" width={p % 2 ? 60 : 92} height="40" fill="#e0d4b8" />
            <path d="M12 86 h40 M12 96 h34 M60 86 h40 M60 96 h30 M12 110 h88 M12 120 h70" stroke="#8a7a5e" strokeWidth="3" />
            <circle cx="56" cy="2" r="5" fill="#b8452f" stroke="#5a1a10" strokeWidth="1.5" />
          </g>
        ))}
        <rect x="24" y="196" width="512" height="80" fill="#f2e6c8" stroke="#6b5a40" strokeWidth="2" />
        <path d="M40 220 h200 M40 240 h160 M40 258 h220 M300 220 h200 M300 240 h120" stroke="#6b5a40" strokeWidth="3" />
      </g>
      {/* the door to the press room, with its round window */}
      <g transform="translate(1390 80)">
        <rect width="190" height="472" fill="#3f6a58" stroke="#1f3a2e" strokeWidth="6" />
        <circle cx="95" cy="120" r="46" fill="#3a3028" stroke="#1f3a2e" strokeWidth="8" />
        <circle cx="95" cy="120" r="34" fill="#f2b24a" opacity="0.45" />
        <rect x="28" y="230" width="134" height="210" rx="4" fill="none" stroke="#2c4a3e" strokeWidth="4" />
        <circle cx="160" cy="300" r="9" fill="#d9b54a" stroke="#6a4a12" strokeWidth="2" />
      </g>
      {/* green hanging lamps */}
      {[520, 1180].map((x) => (
        <g key={x}>
          <path d={`M${x} 44 V96`} stroke={INK} strokeWidth="3" />
          <path d={`M${x - 46} 136 Q${x} 86 ${x + 46} 136 Z`} fill="#2f6a4e" stroke="#163a2a" strokeWidth="3" />
          <ellipse cx={x} cy="138" rx="18" ry="6" fill="#ffe7a8" />
        </g>
      ))}
      {/* the desk */}
      <rect y="760" width="1600" height="240" fill="#6e4a2c" />
      <rect y="744" width="1600" height="28" fill="#8e6238" stroke="#3a220e" strokeWidth="3" />
      {/* the wire tray of incoming copy */}
      <g transform="translate(1180 660)">
        <path d="M0 40 L20 96 H220 L240 40 Z" fill="none" stroke="#4a4a52" strokeWidth="4" />
        {Array.from({ length: 11 }, (_, i) => (
          <path key={i} d={`M${10 + i * 22} 40 L${24 + i * 18} 96`} stroke="#5a5a62" strokeWidth="2" />
        ))}
        <path d="M8 62 H232 M14 80 H226" stroke="#5a5a62" strokeWidth="2" />
        {[0, 1, 2].map((k) => (
          <rect key={k} x={36 + k * 8} y={22 - k * 6} width="160" height="40" fill={['#fbf6e8', '#f2ead4', '#f6f0de'][k]} stroke="#8a7a5e" strokeWidth="2" transform={`rotate(${[-3, 2, -1][k]} 120 40)`} />
        ))}
      </g>
      {/* the typewriter */}
      <g transform="translate(1440 650)">
        <rect x="0" y="40" width="140" height="70" rx="10" fill="#2a2a30" stroke="#0e0e12" strokeWidth="3" />
        <rect x="10" y="0" width="120" height="48" fill="#fbf6e8" stroke="#8a7a5e" strokeWidth="2" />
        <path d="M22 14 h80 M22 26 h64" stroke="#5a5a62" strokeWidth="3" />
        <rect x="-10" y="36" width="160" height="12" rx="6" fill="#4a4a52" stroke="#0e0e12" strokeWidth="2" />
        {Array.from({ length: 10 }, (_, i) => (
          <circle key={i} cx={20 + i * 11} cy="80" r="4" fill="#d8d0c0" />
        ))}
        {Array.from({ length: 9 }, (_, i) => (
          <circle key={i} cx={25 + i * 11} cy="94" r="4" fill="#d8d0c0" />
        ))}
      </g>
      {/* the copy spike */}
      <g transform="translate(1110 700)">
        <ellipse cx="0" cy="56" rx="24" ry="8" fill="#3a3028" />
        <path d="M0 56 V-10" stroke="#5a5a62" strokeWidth="4" />
        {[0, 1, 2, 3].map((k) => (
          <rect key={k} x={-26} y={26 - k * 12} width="52" height="14" fill="#f2ead4" stroke="#8a7a5e" strokeWidth="1.5" transform={`rotate(${[8, -6, 4, -9][k]} 0 ${32 - k * 12})`} />
        ))}
      </g>
    </svg>
  );
}

// ------------------------------------------------------------------------------------- the clinic

/** Harbour Clinic's front desk: sage walls, the eye chart, the waiting bench, the appointment book and the bell. */
export function ClinicBackdrop({ sky }: { sky: Sky }) {
  return (
    <svg viewBox="0 0 1600 1000" className="job-backdrop" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <defs>
        <pattern id="jb-ctiles" width="48" height="48" patternUnits="userSpaceOnUse">
          <rect width="48" height="48" fill="#eef2ea" />
          <rect width="48" height="48" fill="none" stroke="#cfd8cc" strokeWidth="2" />
        </pattern>
      </defs>
      <rect width="1600" height="1000" fill="#dce8de" />
      <rect y="0" width="1600" height="40" fill="#3d6a5a" />
      <rect y="470" width="1600" height="280" fill="url(#jb-ctiles)" />
      <rect y="462" width="1600" height="12" fill="#8aa898" />
      {/* window with a potted plant, behind the person */}
      <WindowSky id="jb-c-sky" sky={sky} x={60} y={80} w={280} h={300} />
      <rect x="50" y="378" width="300" height="16" fill="#f4f1e8" stroke="#7a8a7e" strokeWidth="2" />
      <g transform="translate(290 378)">
        <path d="M-26 0 h52 l-6 -40 h-40 Z" transform="scale(1 -1)" fill="#b8643a" stroke="#5a2a14" strokeWidth="3" />
      </g>
      {/* the clinic's sign over the hatch */}
      <g transform="translate(470 66)">
        <rect width="360" height="70" rx="8" fill="#f6f3ea" stroke="#3d6a5a" strokeWidth="4" />
        <g transform="translate(46 35)">
          <circle r="24" fill="#3d8a6a" />
          <path d="M-5 -15 h10 v10 h10 v10 h-10 v10 h-10 v-10 h-10 v-10 h10 Z" fill="#f6f3ea" />
        </g>
        <path d="M90 28 h220 M90 46 h160" stroke="#3d6a5a" strokeWidth="7" strokeLinecap="round" />
      </g>
      {/* the eye chart */}
      <g transform="translate(900 70)">
        <rect width="170" height="250" fill="#fbfaf6" stroke="#5a6a62" strokeWidth="4" />
        {[
          [34, 1],
          [24, 2],
          [18, 3],
          [13, 4],
          [10, 5],
          [8, 6],
        ].map(([s, n], row) => (
          <g key={row} transform={`translate(${85 - (n * (s + 6)) / 2} ${22 + row * 36})`}>
            {Array.from({ length: n }, (_, i) => (
              <rect key={i} x={i * (s + 6)} y={0} width={s} height={s} fill="none" stroke={INK} strokeWidth={Math.max(2, s / 6)} strokeDasharray={`${s * 0.9} ${s * 0.25}`} />
            ))}
          </g>
        ))}
      </g>
      {/* the coat hooks and the waiting bench at the right */}
      <g transform="translate(1180 120)">
        <rect width="380" height="16" rx="4" fill="#8e6a48" stroke="#4a3420" strokeWidth="2" />
        {[40, 140, 240, 340].map((x) => (
          <path key={x} d={`M${x} 16 v18 q0 10 10 10`} stroke="#5a5a62" strokeWidth="5" fill="none" strokeLinecap="round" />
        ))}
        <path d="M120 40 q-30 40 -20 150 h70 q8 -110 -20 -150 Z" fill="#c8643a" stroke="#5a2a14" strokeWidth="3" />
        <path d="M330 40 q-24 30 -16 110 h50 q6 -80 -18 -110 Z" fill="#4a6a8a" stroke="#1f2f42" strokeWidth="3" />
      </g>
      <g transform="translate(1180 470)">
        <rect x="0" y="0" width="390" height="22" rx="6" fill="#a8764a" stroke="#4a2c14" strokeWidth="3" />
        <rect x="0" y="-80" width="390" height="18" rx="6" fill="#a8764a" stroke="#4a2c14" strokeWidth="3" />
        {[20, 360].map((x) => (
          <rect key={x} x={x} y="-80" width="14" height="190" fill="#7a4a24" stroke="#3a1f0e" strokeWidth="2" />
        ))}
      </g>
      {/* the white reception counter */}
      <rect y="760" width="1600" height="240" fill="#e8e6dc" />
      <rect y="744" width="1600" height="28" fill="#f6f3ea" stroke="#8a9a8e" strokeWidth="3" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M${i * 200 + 100} 780 V1000`} stroke="#d0cec4" strokeWidth="3" />
      ))}
      {/* the open appointment book with its ribbon */}
      <g transform="translate(1170 690)">
        <path d="M0 10 L150 0 L150 90 L0 100 Z" fill="#fbfaf2" stroke="#6b6a5a" strokeWidth="2.5" />
        <path d="M150 0 L300 10 L300 100 L150 90 Z" fill="#f6f3ea" stroke="#6b6a5a" strokeWidth="2.5" />
        {[0, 1, 2, 3, 4].map((k) => (
          <path key={k} d={`M16 ${26 + k * 14} L136 ${18 + k * 14} M164 ${18 + k * 14} L284 ${26 + k * 14}`} stroke="#a8b8ac" strokeWidth="2" />
        ))}
        <path d="M40 30 l40 -3 M180 34 l50 3" stroke="#2f4f8a" strokeWidth="3" />
        <path d="M150 90 v34 l-8 -8 l-8 8 v-30" fill="#b8452f" stroke="#5a1a10" strokeWidth="1.5" />
      </g>
      {/* the desk bell and the pen pot */}
      <g transform="translate(1520 720)">
        <ellipse cx="0" cy="34" rx="34" ry="8" fill="#4a4a52" />
        <path d="M-26 32 Q-26 0 0 0 Q26 0 26 32 Z" fill="#d9b54a" stroke="#6a4a12" strokeWidth="2.5" />
        <rect x="-3" y="-10" width="6" height="12" fill="#6a4a12" />
      </g>
      <g transform="translate(1100 700)">
        <rect x="-22" y="0" width="44" height="54" rx="4" fill="#3d6a5a" stroke="#1f3a2e" strokeWidth="2.5" />
        <path d="M-10 0 l-8 -36 M2 0 l4 -40 M12 0 l10 -30" stroke={INK} strokeWidth="4" strokeLinecap="round" />
      </g>
    </svg>
  );
}

// ------------------------------------------------------------------------------------- the town hall

/** The town hall's counter: stone pilasters, the town's crest, the notice board, the brass grille and the stamp rack. */
export function TownHallBackdrop({ sky }: { sky: Sky }) {
  return (
    <svg viewBox="0 0 1600 1000" className="job-backdrop" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="1600" height="1000" fill="#d9d4c6" />
      {/* ashlar courses */}
      {Array.from({ length: 12 }, (_, r) => (
        <g key={r}>
          <path d={`M0 ${60 + r * 42} H1600`} stroke="#c4bdab" strokeWidth="2" />
          {Array.from({ length: 14 }, (_, c) => (
            <path key={c} d={`M${(c * 120 + (r % 2) * 60) % 1680} ${60 + r * 42} v42`} stroke="#c4bdab" strokeWidth="2" />
          ))}
        </g>
      ))}
      <rect y="0" width="1600" height="56" fill="#2f4256" />
      <path d="M0 56 H1600" stroke="#c9a24a" strokeWidth="5" />
      {/* tall window with a flagpole outside, behind the person */}
      <WindowSky id="jb-t-sky" sky={sky} x={60} y={90} w={280} h={360} />
      <path d="M60 90 Q200 30 340 90" fill="#d9d4c6" stroke="#8a8270" strokeWidth="6" />
      <path d="M250 200 V440" stroke="#5a5a62" strokeWidth="5" />
      {/* pilasters */}
      {[400, 1180].map((x) => (
        <g key={x}>
          <rect x={x} y="56" width="54" height="500" fill="#e6e1d4" stroke="#8a8270" strokeWidth="3" />
          <rect x={x - 8} y="56" width="70" height="24" fill="#cfc8b6" stroke="#8a8270" strokeWidth="3" />
          <rect x={x - 8} y="530" width="70" height="26" fill="#cfc8b6" stroke="#8a8270" strokeWidth="3" />
          {[0, 1, 2].map((k) => (
            <path key={k} d={`M${x + 14 + k * 13} 92 V520`} stroke="#c4bdab" strokeWidth="3" />
          ))}
        </g>
      ))}
      {/* the town's crest: a shield with a ship */}
      <g transform="translate(720 70)">
        <path d="M0 0 H140 V90 Q140 150 70 176 Q0 150 0 90 Z" fill="#2f4a6a" stroke="#c9a24a" strokeWidth="6" />
        <path d="M30 104 h80 l-12 18 h-56 Z" fill="#e8d6a8" stroke="#1f2f42" strokeWidth="2" />
        <path d="M70 102 V40 L104 96 Z" fill="#f6ecd2" stroke="#1f2f42" strokeWidth="2" />
        <path d="M66 102 V52 L40 96 Z" fill="#e8dcc0" stroke="#1f2f42" strokeWidth="2" />
        <path d="M20 140 q25 -10 50 0 t50 0" stroke="#9ac0d4" strokeWidth="4" fill="none" />
      </g>
      {/* the notice board */}
      <g transform="translate(940 90)">
        <rect width="220" height="280" rx="4" fill="#b8865a" stroke="#4a2c14" strokeWidth="6" />
        {[
          [14, 14, 90, 110, '#fbf6e8', -2],
          [114, 20, 92, 70, '#f6e6b8', 3],
          [20, 140, 84, 120, '#eef2f6', 1],
          [112, 104, 96, 150, '#fbf6e8', -3],
        ].map(([x, y, w, h, c, r], i) => (
          <g key={i} transform={`rotate(${r} ${(x as number) + (w as number) / 2} ${y})`}>
            <rect x={x} y={y} width={w} height={h} fill={c as string} stroke="#8a7a5e" strokeWidth="2" />
            <path d={`M${(x as number) + 10} ${(y as number) + 18} h${(w as number) - 30} M${(x as number) + 10} ${(y as number) + 32} h${(w as number) - 20} M${(x as number) + 10} ${(y as number) + 46} h${(w as number) - 40}`} stroke="#6b5a40" strokeWidth="2.5" />
            <circle cx={(x as number) + (w as number) / 2} cy={(y as number) + 2} r="5" fill="#2f4a6a" />
          </g>
        ))}
      </g>
      {/* the counter's brass grille above the desk */}
      <g transform="translate(470 620)">
        <rect width="1130" height="12" fill="#c9a24a" stroke="#6a4a12" strokeWidth="2" />
        {Array.from({ length: 30 }, (_, i) => (
          <path key={i} d={`M${18 + i * 38} 12 V124`} stroke="#b8923a" strokeWidth="4" />
        ))}
      </g>
      {/* the bench seat for visitors on the right */}
      <rect x="1250" y="560" width="350" height="24" fill="#6b4a2a" />
      {/* the counter (dark wood) */}
      <rect y="760" width="1600" height="240" fill="#4a2e1a" />
      <rect y="744" width="1600" height="28" fill="#6b4428" stroke="#2a160a" strokeWidth="3" />
      {/* the stamp rack and the ink pad */}
      <g transform="translate(1180 670)">
        <rect x="0" y="40" width="200" height="22" rx="4" fill="#7a4a24" stroke="#3a1f0e" strokeWidth="2.5" />
        {[20, 60, 100, 140, 180].map((x, i) => (
          <g key={x}>
            <rect x={x - 8} y={4} width="16" height="36" rx="6" fill={['#7a2a1a', '#2f4a6a', '#3a5a32', '#7a2a1a', '#2f4a6a'][i]} stroke={INK} strokeWidth="2" />
            <rect x={x - 12} y={40} width="24" height="10" fill="#2a2118" />
          </g>
        ))}
        <rect x="230" y="40" width="90" height="26" rx="4" fill="#2f2a42" stroke={INK} strokeWidth="2.5" />
        <rect x="238" y="46" width="74" height="14" fill="#5a3a7a" />
      </g>
      {/* the ticket counter: "now serving" */}
      <g transform="translate(1440 70)">
        <rect width="140" height="90" rx="8" fill="#1f2a36" stroke="#c9a24a" strokeWidth="4" />
        <text x="70" y="66" textAnchor="middle" fontSize="48" fill="#f2c86a" style={{ fontFamily: 'var(--font-en)' }} fontWeight="700">
          27
        </text>
      </g>
    </svg>
  );
}

// ------------------------------------------------------------------------------------- the academy library

/** The academy library: oak shelves to the ceiling, an arched leaded window, green reading lamps, the card catalogue. */
export function AcademyBackdrop({ sky }: { sky: Sky }) {
  const books = ['#7a2f2a', '#2f4a3e', '#3a4a6a', '#8a6a2a', '#5a3a4a', '#6b5a3a', '#2f3a2e'];
  return (
    <svg viewBox="0 0 1600 1000" className="job-backdrop" preserveAspectRatio="xMidYMid slice" aria-hidden>
      <rect width="1600" height="1000" fill="#e4d6b8" />
      <rect y="0" width="1600" height="44" fill="#4a2c18" />
      {/* arched leaded window behind the person, light falling in */}
      <g>
        <clipPath id="jb-a-arch">
          <path d="M60 470 V180 Q200 40 340 180 V470 Z" />
        </clipPath>
        <path d="M60 470 V180 Q200 40 340 180 V470 Z" fill={sky.top} />
        <g clipPath="url(#jb-a-arch)">
          <rect x="60" y="300" width="280" height="170" fill={sky.bottom} opacity="0.6" />
          {Array.from({ length: 16 }, (_, i) => (
            <path key={i} d={`M${i * 40 - 120} 60 L${i * 40 + 80} 470 M${i * 40 + 80} 60 L${i * 40 - 120} 470`} stroke="#5a3418" strokeWidth="2.5" opacity="0.55" />
          ))}
        </g>
        <path d="M60 470 V180 Q200 40 340 180 V470 Z" fill="none" stroke="#5a3418" strokeWidth="12" />
        <path d="M40 470 h320" stroke="#5a3418" strokeWidth="16" />
      </g>
      {/* shelves from floor to ceiling on both sides of the room */}
      {[
        [380, 760],
        [1250, 1600],
      ].map(([x0, x1], k) => (
        <g key={k}>
          <rect x={x0} y="56" width={x1 - x0} height="690" fill="#5a3418" />
          {[150, 260, 370, 480, 590, 700].map((y, r) => (
            <g key={y}>
              <Spines x0={x0 + 14} x1={x1 - 14} y={y} h={92} seed={k * 10 + r + 1} palette={books} />
              <rect x={x0} y={y} width={x1 - x0} height="12" fill="#8e5a2e" stroke="#3a1f0e" strokeWidth="2" />
            </g>
          ))}
          <rect x={x0} y="56" width="14" height="690" fill="#7a4a24" stroke="#3a1f0e" strokeWidth="2" />
          <rect x={x1 - 14} y="56" width="14" height="690" fill="#7a4a24" stroke="#3a1f0e" strokeWidth="2" />
        </g>
      ))}
      {/* the rolling ladder on the right shelves */}
      <g transform="translate(1290 70) rotate(8)">
        <path d="M0 0 V680 M70 0 V680" stroke="#a8763e" strokeWidth="10" />
        {Array.from({ length: 12 }, (_, i) => (
          <path key={i} d={`M0 ${40 + i * 56} H70`} stroke="#a8763e" strokeWidth="8" />
        ))}
      </g>
      {/* the study-room chart, pinned between the shelves */}
      <g transform="translate(800 80)">
        <rect width="400" height="210" fill="#c89a62" stroke="#5a3a1a" strokeWidth="5" />
        <rect x="20" y="20" width="360" height="170" fill="#fbf6e8" stroke="#6b5a40" strokeWidth="2" />
        {[0, 1, 2, 3].map((r) => (
          <path key={r} d={`M20 ${54 + r * 34} H380`} stroke="#c8b89a" strokeWidth="2" />
        ))}
        {[0, 1, 2, 3, 4].map((c) => (
          <path key={c} d={`M${90 + c * 58} 20 V190`} stroke="#c8b89a" strokeWidth="2" />
        ))}
        {[
          [92, 56],
          [208, 90],
          [150, 124],
          [266, 56],
          [324, 158],
        ].map(([x, y], i) => (
          <rect key={i} x={x + 2} y={y + 2} width="52" height="28" fill={['#e8d49a', '#d8e4c8', '#e8c8b8'][i % 3]} />
        ))}
      </g>
      {/* green reading lamps */}
      {[880, 1120].map((x) => (
        <g key={x} transform={`translate(${x} 560)`}>
          <path d="M0 0 V-60" stroke="#8a6a2a" strokeWidth="5" />
          <path d="M-50 -60 Q0 -96 50 -60 Z" fill="#2f6a4e" stroke="#163a2a" strokeWidth="3" />
          <ellipse cy="-58" rx="40" ry="6" fill="#ffe7a8" />
          <ellipse cy="4" rx="34" ry="8" fill="#8a6a2a" />
        </g>
      ))}
      <rect x="760" y="566" width="490" height="24" fill="#6b4428" stroke="#2a160a" strokeWidth="2" />
      {/* the issue desk */}
      <rect y="760" width="1600" height="240" fill="#6b4428" />
      <rect y="744" width="1600" height="28" fill="#8e5a2e" stroke="#3a1f0e" strokeWidth="3" />
      {/* the card catalogue on the desk's right end */}
      <g transform="translate(1250 620)">
        <rect width="320" height="130" fill="#8e5a2e" stroke="#3a1f0e" strokeWidth="4" />
        {Array.from({ length: 12 }, (_, i) => (
          <g key={i} transform={`translate(${12 + (i % 6) * 51} ${12 + Math.floor(i / 6) * 58})`}>
            <rect width="44" height="48" rx="2" fill="#a8703c" stroke="#3a1f0e" strokeWidth="2" />
            <rect x="10" y="8" width="24" height="12" fill="#f6ecd2" stroke="#6a4a12" strokeWidth="1" />
            <circle cx="22" cy="34" r="4" fill="#d9b54a" stroke="#6a4a12" strokeWidth="1.5" />
          </g>
        ))}
      </g>
      {/* the date stamp */}
      <g transform="translate(1150 700)">
        <rect x="-20" y="30" width="40" height="18" fill="#2a2118" />
        <rect x="-12" y="-10" width="24" height="42" rx="8" fill="#7a2f2a" stroke={INK} strokeWidth="2" />
      </g>
    </svg>
  );
}

// ------------------------------------------------------------------------------------- fronts on the town map

/** The Harbour Courier: two storeys of grey stone, the masthead band, tall windows, the presses' chimney. */
export function NewsFrontArt({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="85" cy="176" rx="90" ry="8" fill="#000" opacity="0.15" />
      <rect x="128" y="0" width="18" height="34" fill="#6b6a64" stroke="#3a3a34" strokeWidth="2" />
      <rect x="14" y="30" width="142" height="146" fill="#d8d0c0" stroke="#4a463c" strokeWidth="3" />
      <rect x="8" y="22" width="154" height="14" fill="#8a8478" stroke="#4a463c" strokeWidth="2.5" />
      <rect x="22" y="44" width="126" height="26" fill="#2f4a3e" stroke="#163a2a" strokeWidth="2" />
      <text x="85" y="63" textAnchor="middle" fontSize="15" fontWeight="700" fill="#f6ecd2" style={{ fontFamily: 'var(--font-serif)' }}>
        COURIER
      </text>
      {[0, 1, 2].map((c) => (
        <rect key={c} x={26 + c * 42} y={80} width="28" height="36" rx="12" fill="#a8c0d0" stroke="#4a463c" strokeWidth="1.5" />
      ))}
      <rect x="64" y="128" width="42" height="48" fill="#2f4a3e" stroke="#163a2a" strokeWidth="2.5" />
      {/* papers bundled at the door */}
      <rect x="22" y="152" width="30" height="20" fill="#f2ead4" stroke="#6b5a40" strokeWidth="1.5" />
      <path d="M22 162 h30 M37 152 v20" stroke="#8a6a3a" strokeWidth="1.5" />
    </g>
  );
}

/** Harbour Clinic: white walls, a sage roof band, the green cross, a ramp to the door. */
export function ClinicFrontArt({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="85" cy="176" rx="90" ry="8" fill="#000" opacity="0.15" />
      <rect x="14" y="46" width="142" height="130" fill="#f4f1e8" stroke="#4a463c" strokeWidth="3" />
      <path d="M6 48 H164 L150 22 H20 Z" fill="#7aa88a" stroke="#34553f" strokeWidth="2.5" />
      <g transform="translate(85 74)">
        <circle r="20" fill="#fbf8f2" stroke="#34553f" strokeWidth="2.5" />
        <path d="M-4 -12 h8 v8 h8 v8 h-8 v8 h-8 v-8 h-8 v-8 h8 Z" fill="#3d8a5a" />
      </g>
      <rect x="26" y="102" width="34" height="34" fill="#a8c8dc" stroke="#4a463c" strokeWidth="2" />
      <rect x="110" y="102" width="34" height="34" fill="#a8c8dc" stroke="#4a463c" strokeWidth="2" />
      <rect x="66" y="120" width="38" height="56" fill="#5e7a6a" stroke="#2a3a22" strokeWidth="2.5" />
      <path d="M104 176 L150 162 H160 V176 Z" fill="#cfc8b6" stroke="#6b6a5a" strokeWidth="2" />
    </g>
  );
}

/** The town hall: a pediment on columns, steps, the clock and the flag. */
export function TownHallFrontArt({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="85" cy="178" rx="92" ry="8" fill="#000" opacity="0.15" />
      <path d="M128 0 V36" stroke="#4a4a52" strokeWidth="3" />
      <path d="M128 2 h26 l-6 8 l6 8 h-26 Z" fill="#2f4a6a" stroke="#1f2f42" strokeWidth="1.5" />
      <path d="M6 64 L85 24 L164 64 Z" fill="#e6e1d4" stroke="#5a5448" strokeWidth="3" />
      <circle cx="85" cy="50" r="11" fill="#fbf6ea" stroke="#5a5448" strokeWidth="2" />
      <path d="M85 50 v-7 M85 50 h5" stroke="#2a2a2a" strokeWidth="2" />
      <rect x="10" y="64" width="150" height="12" fill="#cfc8b6" stroke="#5a5448" strokeWidth="2" />
      <rect x="14" y="76" width="142" height="86" fill="#d9d4c6" stroke="#5a5448" strokeWidth="2.5" />
      {[24, 54, 104, 134].map((cx) => (
        <rect key={cx} x={cx} y="76" width="12" height="86" fill="#f0ebdf" stroke="#5a5448" strokeWidth="2" />
      ))}
      <rect x="66" y="104" width="38" height="58" rx="18" fill="#2f4a6a" stroke="#1f2f42" strokeWidth="2.5" />
      {[0, 1, 2].map((s) => (
        <rect key={s} x={4 + s * 6} y={162 + s * 5} width={162 - s * 12} height="6" fill="#cfc8b6" stroke="#5a5448" strokeWidth="1.5" />
      ))}
    </g>
  );
}

/** The academy library: red brick, an arched window with leading, a small bell tower, books in the window. */
export function AcademyFrontArt({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <ellipse cx="85" cy="176" rx="90" ry="8" fill="#000" opacity="0.15" />
      <rect x="66" y="0" width="38" height="40" fill="#a8573a" stroke="#4a1f12" strokeWidth="2.5" />
      <path d="M60 2 L85 -16 L110 2 Z" fill="#3d4a5a" stroke="#1f2630" strokeWidth="2" />
      <circle cx="85" cy="20" r="7" fill="#d9b54a" stroke="#6a4a12" strokeWidth="1.5" />
      <path d="M4 52 L85 30 L166 52 Z" fill="#3d4a5a" stroke="#1f2630" strokeWidth="3" />
      <rect x="12" y="52" width="146" height="124" fill="#b8573a" stroke="#4a1f12" strokeWidth="3" />
      {Array.from({ length: 8 }, (_, i) => (
        <path key={i} d={`M12 ${64 + i * 14} H158`} stroke="#8a3a24" strokeWidth="1" opacity="0.6" />
      ))}
      <path d="M58 140 V96 Q85 66 112 96 V140 Z" fill="#ffe1a0" stroke="#4a1f12" strokeWidth="2.5" />
      <path d="M85 74 V140 M58 112 H112" stroke="#4a1f12" strokeWidth="2" />
      {[64, 72, 80, 90, 98, 104].map((bx, i) => (
        <rect key={bx} x={bx} y={126 - (i % 3) * 3} width="6" height={14 + (i % 3) * 3} fill={['#7a2f2a', '#2f4a3e', '#3a4a6a'][i % 3]} />
      ))}
      <rect x="20" y="96" width="26" height="36" fill="#a8c8dc" stroke="#4a1f12" strokeWidth="2" />
      <rect x="124" y="96" width="26" height="36" fill="#a8c8dc" stroke="#4a1f12" strokeWidth="2" />
      <rect x="70" y="146" width="30" height="30" fill="#4a2c18" stroke="#2a1408" strokeWidth="2" />
    </g>
  );
}
