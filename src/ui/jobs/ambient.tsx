/**
 * Ambient life of the workplaces, drawn over the (pre-rasterised) interior in the part of the room the bench
 * leaves free: gulls and waves in the post office window and its cat asleep in a parcel box, steam and a
 * swaying pan in the kitchen, the inn's pendulum clock and fern, the office's clouds and wall clock, the newsroom's
 * gulls and swaying lamp, the goldfish on the clinic's window sill, the town hall's flag outside the window, dust in
 * the library's light. Transform /
 * opacity animations only (no filters); still under prefers-reduced-motion.
 */
export function JobAmbient({ job }: { job: string }) {
  return (
    <svg viewBox="0 0 1600 1000" className={`job-ambient amb-${job}`} preserveAspectRatio="xMidYMid slice" aria-hidden>
      {job === 'post' ? (
        <PostLife />
      ) : job === 'kitchen' ? (
        <KitchenLife />
      ) : job === 'inn' ? (
        <InnLife />
      ) : job === 'news' ? (
        <NewsLife />
      ) : job === 'clinic' ? (
        <ClinicLife />
      ) : job === 'townhall' ? (
        <TownHallLife />
      ) : job === 'academy' ? (
        <AcademyLife />
      ) : (
        <OfficeLife />
      )}
    </svg>
  );
}

function Gull({ x, y, s = 1, cls }: { x: number; y: number; s?: number; cls: string }) {
  return (
    <g className={cls} transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M-14 0 q7 -8 14 0 q7 -8 14 0" fill="none" stroke="#3a3a42" strokeWidth="2.5" strokeLinecap="round" className="amb-wing" />
    </g>
  );
}

function PostLife() {
  return (
    <g>
      <clipPath id="amb-post-win">
        <rect x="85" y="75" width="370" height="290" />
      </clipPath>
      <g clipPath="url(#amb-post-win)">
        <Gull x={120} y={130} cls="amb-gull amb-gull1" />
        <Gull x={60} y={170} s={0.7} cls="amb-gull amb-gull2" />
        <path d="M60 318 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="#e8f2f6" strokeWidth="3" className="amb-wave" opacity="0.7" />
      </g>
      {/* the post office cat asleep in a parcel box on the counter */}
      <g transform="translate(380 690)">
        <path d="M0 40 L20 20 H130 L150 40 V70 H0 Z" fill="#c49a5e" stroke="#5a3418" strokeWidth="3" />
        <path d="M0 40 H150" stroke="#5a3418" strokeWidth="3" />
        <g className="amb-breathe">
          <ellipse cx="74" cy="30" rx="48" ry="20" fill="#e8a060" stroke="#3a2a1a" strokeWidth="3" />
          <path d="M34 20 l-6 -16 l14 8 M52 14 l4 -16 l8 14" fill="#e8a060" stroke="#3a2a1a" strokeWidth="3" strokeLinejoin="round" />
          <path d="M40 28 q6 4 12 0 M60 26 q4 3 8 0" stroke="#3a2a1a" strokeWidth="2.5" fill="none" />
          <path d="M80 18 q10 6 24 4 M86 28 q10 4 22 2" stroke="#b8642a" strokeWidth="3" fill="none" />
        </g>
        <path d="M120 36 q30 -6 26 -28" fill="none" stroke="#e8a060" strokeWidth="8" strokeLinecap="round" className="amb-tail" />
        <text x="96" y="0" fontSize="20" fill="#5a6a8a" className="amb-z" fontFamily="Georgia, serif">
          z
        </text>
      </g>
    </g>
  );
}

function KitchenLife() {
  return (
    <g>
      {[180, 260, 340].map((x, i) => (
        <path key={x} d={`M${x} 300 q-16 -30 0 -60 q16 -30 0 -60`} fill="none" stroke="#ffffff" strokeWidth="10" strokeLinecap="round" opacity="0.45" className={`amb-steam amb-steam${i}`} />
      ))}
      <g className="amb-sway" style={{ transformOrigin: '470px 80px' }}>
        <path d="M470 80 v40" stroke="#5a5a62" strokeWidth="4" />
        <ellipse cx="470" cy="160" rx="38" ry="38" fill="#3a3a42" stroke="#1a1a20" strokeWidth="4" />
        <rect x="464" y="118" width="12" height="10" fill="#6b4a2a" />
      </g>
    </g>
  );
}

function InnLife() {
  return (
    <g>
      <g transform="translate(470 330)">
        <rect x="-34" y="-110" width="68" height="230" rx="10" fill="#7a4a24" stroke="#3a2412" strokeWidth="4" />
        <circle cy="-62" r="28" fill="#fbf6ea" stroke="#b8892f" strokeWidth="4" />
        <path d="M0 -62 V-82 M0 -62 L12 -56" stroke="#2a1a10" strokeWidth="3" strokeLinecap="round" />
        <rect x="-22" y="-26" width="44" height="130" fill="#3a2412" />
        <g className="amb-pendulum" style={{ transformOrigin: '470px 306px' }}>
          <path d="M0 -24 V70" stroke="#b8892f" strokeWidth="3" />
          <circle cy="76" r="12" fill="#e8c860" stroke="#7a5a1a" strokeWidth="3" />
        </g>
      </g>
      <g className="amb-sway2" style={{ transformOrigin: '380px 760px' }}>
        <path d="M380 760 q-40 -60 -80 -70 M380 760 q-10 -80 -30 -110 M380 760 q20 -80 50 -100 M380 760 q50 -50 90 -50" stroke="#4d7a3a" strokeWidth="6" fill="none" strokeLinecap="round" />
      </g>
      <path d="M350 760 h60 l-8 50 h-44 Z" fill="#a8582e" stroke="#5a2a14" strokeWidth="3" />
    </g>
  );
}

function OfficeLife() {
  return (
    <g>
      <clipPath id="amb-office-win">
        <rect x="70" y="58" width="200" height="320" />
      </clipPath>
      <g clipPath="url(#amb-office-win)">
        <g className="amb-cloud">
          <ellipse cx="100" cy="120" rx="40" ry="14" fill="#fff" opacity="0.85" />
          <ellipse cx="124" cy="110" rx="26" ry="14" fill="#fff" opacity="0.85" />
        </g>
        <Gull x={150} y={200} s={0.6} cls="amb-gull amb-gull2" />
      </g>
      <g transform="translate(470 420)">
        <circle r="36" fill="#fbf6ea" stroke="#3a3a42" strokeWidth="6" />
        <path d="M0 0 V-22 M0 0 L16 8" stroke="#2a1a10" strokeWidth="4" strokeLinecap="round" />
        <path d="M0 0 V-30" stroke="#c8322a" strokeWidth="2" className="amb-second" />
        <circle r="3" fill="#2a1a10" />
      </g>
    </g>
  );
}

function NewsLife() {
  return (
    <g>
      <clipPath id="amb-news-win">
        <rect x="65" y="75" width="290" height="350" />
      </clipPath>
      <g clipPath="url(#amb-news-win)">
        <Gull x={110} y={150} cls="amb-gull amb-gull1" />
        <Gull x={60} y={200} s={0.7} cls="amb-gull amb-gull2" />
        <path d="M60 392 q20 -6 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0" fill="none" stroke="#e8f2f6" strokeWidth="3" className="amb-wave" opacity="0.7" />
      </g>
      {/* the hanging lamp over the person's desk sways a little in the draught from the press room */}
      <g className="amb-sway" style={{ transformOrigin: '520px 44px' }}>
        <path d="M520 44 V96" stroke="#2a2118" strokeWidth="3" />
        <path d="M474 136 Q520 86 566 136 Z" fill="#2f6a4e" stroke="#163a2a" strokeWidth="3" />
        <ellipse cx="520" cy="138" rx="18" ry="6" fill="#ffe7a8" />
      </g>
    </g>
  );
}

function ClinicLife() {
  return (
    <g>
      {/* a goldfish bowl on the window sill */}
      <g transform="translate(150 330)">
        <path d="M-44 0 Q-50 50 0 54 Q50 50 44 0 Z" fill="#cfe6ee" stroke="#6b8a9a" strokeWidth="3" opacity="0.9" />
        <ellipse cx="0" cy="2" rx="40" ry="6" fill="#e8f4f8" stroke="#6b8a9a" strokeWidth="2" />
        <g className="amb-fish">
          <path d="M-8 30 q10 -10 20 0 q-10 10 -20 0 Z M12 30 l8 -6 v12 Z" fill="#e8843a" stroke="#8a3a14" strokeWidth="1.5" />
        </g>
        <path d="M-20 50 q6 -14 0 -22 M20 50 q-4 -12 2 -20" stroke="#4d7a3a" strokeWidth="3" fill="none" className="amb-weed" />
      </g>
    </g>
  );
}

function TownHallLife() {
  return (
    <g>
      <clipPath id="amb-th-win">
        <rect x="65" y="40" width="270" height="405" />
      </clipPath>
      <g clipPath="url(#amb-th-win)">
        <g className="amb-cloud">
          <ellipse cx="120" cy="140" rx="40" ry="14" fill="#fff" opacity="0.85" />
          <ellipse cx="144" cy="130" rx="26" ry="14" fill="#fff" opacity="0.85" />
        </g>
        {/* the town's flag on its pole outside */}
        <g className="amb-flag" style={{ transformOrigin: '252px 204px' }}>
          <path d="M252 204 q30 -10 60 0 t60 0 v44 q-30 -10 -60 0 t-60 0 Z" fill="#2f4a6a" stroke="#1f2f42" strokeWidth="2" />
          <path d="M276 226 h40" stroke="#c9a24a" strokeWidth="4" />
        </g>
      </g>
    </g>
  );
}

function AcademyLife() {
  // dust motes drifting in the light from the arched window (opacity / translate only)
  const motes = [
    [140, 420, 0],
    [200, 380, -2],
    [260, 440, -4],
    [180, 300, -6],
    [300, 360, -1],
    [230, 250, -3],
  ];
  return (
    <g>
      <path d="M60 180 L340 180 L560 760 L200 760 Z" fill="#fff4cc" opacity="0.12" />
      {motes.map(([x, y, d], i) => (
        <circle key={i} cx={x} cy={y} r={i % 2 ? 2.5 : 3.5} fill="#fff8dc" className="amb-mote" style={{ animationDelay: `${d}s` }} />
      ))}
    </g>
  );
}
