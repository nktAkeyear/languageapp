/**
 * Shared SVG definitions (textures, gradients, filters) rendered once at the app root and
 * referenced by id (`url(#wood-grain)`) from every art module. Keeping materials in one place
 * gives the drawn objects one consistent look: warm wood, aged plaster, paper, brass, glazed
 * ceramics, glass.
 *
 * Swapping to image assets later: an art module can render an <image href> instead of shapes;
 * nothing outside src/ui/art depends on how a piece is drawn.
 */
export function ArtDefs() {
  return (
    <svg className="art-defs" width="0" height="0" aria-hidden focusable="false" style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}>
      <defs>
        {/* ---------- textures (filters) ---------- */}
        <filter id="tx-wood" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox">
          <feTurbulence type="fractalNoise" baseFrequency="0.004 0.09" numOctaves="3" seed="7" result="n" />
          <feColorMatrix
            in="n"
            type="matrix"
            values="0 0 0 0 0.24  0 0 0 0 0.13  0 0 0 0 0.05  0 0 0 -2.2 1.35"
            result="grain"
          />
          <feComposite in="grain" in2="SourceGraphic" operator="in" result="g2" />
          <feBlend in="g2" in2="SourceGraphic" mode="multiply" />
        </filter>
        <filter id="tx-wood-v" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox">
          <feTurbulence type="fractalNoise" baseFrequency="0.09 0.005" numOctaves="3" seed="3" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.24  0 0 0 0 0.13  0 0 0 0 0.05  0 0 0 -2.2 1.35" result="grain" />
          <feComposite in="grain" in2="SourceGraphic" operator="in" result="g2" />
          <feBlend in="g2" in2="SourceGraphic" mode="multiply" />
        </filter>
        <filter id="tx-plaster" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox">
          <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed="11" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.45  0 0 0 0 0.32  0 0 0 0 0.18  0 0 0 -1.6 0.95" result="stain" />
          <feComposite in="stain" in2="SourceGraphic" operator="in" result="s2" />
          <feBlend in="s2" in2="SourceGraphic" mode="multiply" />
        </filter>
        <filter id="tx-paper" x="0" y="0" width="100%" height="100%" filterUnits="objectBoundingBox">
          <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="3" seed="5" result="n" />
          <feColorMatrix in="n" type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.42  0 0 0 0 0.25  0 0 0 -2.4 1.1" result="fib" />
          <feComposite in="fib" in2="SourceGraphic" operator="in" result="f2" />
          <feBlend in="f2" in2="SourceGraphic" mode="multiply" />
        </filter>
        <filter id="fx-shadow" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#2a160a" floodOpacity="0.35" />
        </filter>
        <filter id="fx-shadow-sm" x="-30%" y="-30%" width="160%" height="170%">
          <feDropShadow dx="0" dy="3" stdDeviation="2.5" floodColor="#2a160a" floodOpacity="0.35" />
        </filter>
        <filter id="fx-blur" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="8" />
        </filter>
        <filter id="fx-blur-sm" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="2" />
        </filter>

        {/* ---------- materials (gradients) ---------- */}
        <linearGradient id="g-wall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9b98a" />
          <stop offset="0.55" stopColor="#e6caa0" />
          <stop offset="1" stopColor="#c99f6c" />
        </linearGradient>
        <linearGradient id="g-wainscot" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a4a28" />
          <stop offset="1" stopColor="#5a3218" />
        </linearGradient>
        {/* the shop after the renovation's paint (white plaster, blue wainscot) */}
        <linearGradient id="g-wall-paint" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e4e2da" />
          <stop offset="0.55" stopColor="#f3f1ea" />
          <stop offset="1" stopColor="#dcd8cc" />
        </linearGradient>
        <linearGradient id="g-wainscot-paint" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3d6c9e" />
          <stop offset="1" stopColor="#2a4e78" />
        </linearGradient>
        <linearGradient id="g-beam" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a2a14" />
          <stop offset="1" stopColor="#3a1f0e" />
        </linearGradient>
        <linearGradient id="g-counter" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#a0683a" />
          <stop offset="0.08" stopColor="#b77d48" />
          <stop offset="1" stopColor="#8c5a30" />
        </linearGradient>
        <linearGradient id="g-counter-edge" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d49b62" />
          <stop offset="1" stopColor="#8a5428" />
        </linearGradient>
        <linearGradient id="g-shelfboard" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b47c48" />
          <stop offset="0.4" stopColor="#8e5a2e" />
          <stop offset="1" stopColor="#5e3618" />
        </linearGradient>
        <linearGradient id="g-shelfback" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#6d4122" />
          <stop offset="0.5" stopColor="#7d4d2a" />
          <stop offset="1" stopColor="#5c3519" />
        </linearGradient>
        <linearGradient id="g-door" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#5e7a6a" />
          <stop offset="1" stopColor="#4a6355" />
        </linearGradient>
        <linearGradient id="g-brass" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f6dc8a" />
          <stop offset="0.45" stopColor="#c99a3c" />
          <stop offset="1" stopColor="#7d5a1c" />
        </linearGradient>
        <linearGradient id="g-copper" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f1b07a" />
          <stop offset="0.5" stopColor="#b8642f" />
          <stop offset="1" stopColor="#6e3315" />
        </linearGradient>
        <linearGradient id="g-iron" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#6d6a66" />
          <stop offset="1" stopColor="#2f2b28" />
        </linearGradient>
        <linearGradient id="g-glass" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.55" />
          <stop offset="0.18" stopColor="#ffffff" stopOpacity="0.12" />
          <stop offset="0.7" stopColor="#ffffff" stopOpacity="0.04" />
          <stop offset="0.9" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>
        <linearGradient id="g-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbf3df" />
          <stop offset="1" stopColor="#efe0bf" />
        </linearGradient>
        <linearGradient id="g-leather-red" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#9b3a28" />
          <stop offset="1" stopColor="#5e1c12" />
        </linearGradient>
        <linearGradient id="g-leather-green" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4f6b45" />
          <stop offset="1" stopColor="#2a3d25" />
        </linearGradient>
        <radialGradient id="g-ember" cx="0.5" cy="0.6" r="0.6">
          <stop offset="0" stopColor="#ffe08a" />
          <stop offset="0.4" stopColor="#ff8a2a" />
          <stop offset="1" stopColor="#8a1d06" />
        </radialGradient>
        <radialGradient id="g-lampglow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#ffe3a0" stopOpacity="0.85" />
          <stop offset="0.35" stopColor="#ffc867" stopOpacity="0.35" />
          <stop offset="1" stopColor="#ffb347" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="g-vignette" cx="0.5" cy="0.45" r="0.75">
          <stop offset="0.55" stopColor="#000" stopOpacity="0" />
          <stop offset="1" stopColor="#1a0c04" stopOpacity="0.55" />
        </radialGradient>
        <linearGradient id="g-cold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#d9f1fb" />
          <stop offset="1" stopColor="#8fc3dc" />
        </linearGradient>
        {/* glazes for jars */}
        {GLAZES.map(([id, a, b]) => (
          <linearGradient key={id} id={id} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor={b} />
            <stop offset="0.3" stopColor={a} />
            <stop offset="0.55" stopColor={a} />
            <stop offset="1" stopColor={b} />
          </linearGradient>
        ))}
      </defs>
    </svg>
  );
}

/** Ceramic / material gradients by id: [id, light, dark]. */
export const GLAZES: [string, string, string][] = [
  ['gl-celadon', '#b9cfae', '#6f8c62'],
  ['gl-cream', '#f2e6cc', '#b9a27a'],
  ['gl-indigo', '#5c76a8', '#2b3a63'],
  ['gl-amber', '#e2a54a', '#93561b'],
  ['gl-terracotta', '#d58a5c', '#8e4526'],
  ['gl-ochre', '#e0bd62', '#9a7426'],
  ['gl-rust', '#b7553a', '#6b2414'],
  ['gl-tin', '#d7d3c8', '#7f7a70'],
  ['gl-green', '#7da86b', '#3d6331'],
  ['gl-rose', '#e6a3ad', '#a8566a'],
  ['gl-blackglaze', '#5a4b42', '#231a15'],
  ['gl-wicker', '#d6ad6a', '#8e6a32'],
  ['gl-glass', '#e9f3f2', '#a8c4c2'],
];
