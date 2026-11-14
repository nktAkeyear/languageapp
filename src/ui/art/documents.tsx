/**
 * The predecessor's documents and the regulars' keepsakes as drawn objects: envelopes, a torn
 * ship ticket, a postcard from the south, diary pages, a recipe card, the blue cup, the carved
 * ship — plus the wooden document box that keeps the papers on the counter.
 *
 * Objects use a 200×160 box (lying on the counter, base around y 150).
 */
import type { DocKind } from '../../story/types';

/** Which drawing a document gets (by id first, then by kind). */
export type DocLook = 'letter' | 'letter2' | 'final' | 'note' | 'ticket' | 'diary' | 'postcard' | 'recipe' | 'cup' | 'ship';

export function docLook(id: string, kind: DocKind): DocLook {
  if (id === 'd_cup') return 'cup';
  if (id === 'd_gift_joe') return 'ship';
  if (id === 'd_final') return 'final';
  if (id === 'd_letter2') return 'letter2';
  switch (kind) {
    case 'letter':
      return 'letter';
    case 'note':
      return 'note';
    case 'receipt':
      return 'ticket';
    case 'diary':
      return 'diary';
    case 'postcard':
      return 'postcard';
    case 'recipe':
      return 'recipe';
    case 'gift':
      return 'ship';
  }
}

/** Keepsakes are displayed on the window sill instead of going into the box. */
export const isKeepsake = (look: DocLook) => look === 'cup' || look === 'ship';

const shadow = (rx = 86) => <ellipse cx="100" cy="150" rx={rx} ry="8" fill="#1d0e05" opacity="0.32" />;

function Envelope({ seal, stamp, ribbon }: { seal: string; stamp?: 'ship' | 'none'; ribbon?: boolean }) {
  return (
    <g>
      {shadow()}
      <g transform="rotate(-6 100 90)">
        <rect x="22" y="36" width="156" height="104" rx="4" fill="#f3e6c8" stroke="#9a8460" strokeWidth="2" filter="url(#tx-paper)" />
        <path d="M22 40 L100 98 L178 40" fill="none" stroke="#b8a27a" strokeWidth="2" />
        <path d="M22 138 L80 92 M178 138 L120 92" stroke="#cdbb94" strokeWidth="1.5" />
        {/* handwriting on the front */}
        <path d="M44 116 q10 -6 20 0 t20 0 t18 -2 M44 126 q12 -4 24 0 t22 0" stroke="#3a4a6a" strokeWidth="2" fill="none" opacity="0.7" />
        {stamp === 'ship' ? (
          <g transform="translate(140 46)">
            <rect width="28" height="32" fill="#e8d2a0" stroke="#8a6a40" strokeDasharray="2 2" />
            <path d="M5 22 h18 l-3 5 h-12 Z" fill="#5a3a22" />
            <path d="M14 21 v-14 l7 12 Z" fill="#fff" stroke="#5a3a22" strokeWidth="0.8" />
            <path d="M3 28 q5 -2 11 0 t11 0" stroke="#3d6c9e" strokeWidth="1.5" fill="none" />
          </g>
        ) : null}
        {ribbon ? (
          <g>
            <path d="M22 86 H178" stroke="#3d6c9e" strokeWidth="7" />
            <path d="M100 86 l-14 -12 q-6 10 4 14 Z M100 86 l14 -12 q6 10 -4 14 Z" fill="#3d6c9e" stroke="#24466e" />
            <path d="M100 86 l-8 22 M100 86 l9 21" stroke="#3d6c9e" strokeWidth="4" />
            {/* pressed flower */}
            <g transform="translate(58 66) rotate(-20)">
              {[0, 72, 144, 216, 288].map((r) => (
                <ellipse key={r} cx="0" cy="-5" rx="4" ry="6" fill="#e6a3ad" opacity="0.9" transform={`rotate(${r})`} />
              ))}
              <circle r="2.5" fill="#d8a838" />
            </g>
          </g>
        ) : null}
        {/* wax seal */}
        <circle cx="100" cy="98" r="13" fill={seal} stroke="#00000044" strokeWidth="2" />
        <path d="M94 98 q6 -8 12 0 q-6 8 -12 0" stroke="#ffffff55" strokeWidth="1.5" fill="none" />
      </g>
    </g>
  );
}

function Ticket() {
  return (
    <g>
      {shadow(70)}
      <g transform="rotate(8 100 90)">
        <path
          d="M40 52 H160 V64 q-6 4 0 8 q-6 4 0 8 q-6 4 0 8 q-6 4 0 8 q-6 4 0 8 q-6 4 0 8 V128 H52 l-4 -6 l-5 5 l-3 -7 Z"
          fill="#e9d7a8"
          stroke="#8a6a40"
          strokeWidth="2"
          filter="url(#tx-paper)"
        />
        <path d="M128 54 V126" stroke="#8a6a40" strokeWidth="1.5" strokeDasharray="3 3" />
        <rect x="52" y="60" width="66" height="14" fill="#9b3f26" opacity="0.85" />
        {/* anchor */}
        <g transform="translate(144 92)" stroke="#5a3a22" strokeWidth="2.4" fill="none" strokeLinecap="round">
          <circle cy="-14" r="3" />
          <path d="M0 -11 V12 M-8 -4 H8 M-10 4 Q-8 14 0 12 Q8 14 10 4" />
        </g>
        <path d="M54 88 h56 M54 100 h40 M54 112 h48" stroke="#5a4a3a" strokeWidth="2" opacity="0.6" />
        {/* crease */}
        <path d="M86 52 L92 128" stroke="#fff" strokeWidth="1.2" opacity="0.5" />
      </g>
    </g>
  );
}

function Note() {
  return (
    <g>
      {shadow(64)}
      <g transform="rotate(-10 100 90)">
        <path d="M48 40 H156 L150 132 L120 128 L112 136 L96 128 L80 134 L62 128 L46 132 Z" fill="#f6ecd2" stroke="#9a8460" strokeWidth="1.5" filter="url(#tx-paper)" />
        {[56, 70, 84, 98, 112].map((y) => (
          <path key={y} d={`M54 ${y} H150`} stroke="#9ab8d0" strokeWidth="1" opacity="0.6" />
        ))}
        <path d="M60 60 q8 -6 16 0 t16 0 M60 76 q10 -5 20 0 t18 0 t14 -1 M60 92 q8 -4 16 0" stroke="#3a4a6a" strokeWidth="2.2" fill="none" />
        <path d="M118 100 l18 -12" stroke="#b8321f" strokeWidth="2.5" />
      </g>
    </g>
  );
}

function DiaryPage() {
  return (
    <g>
      {shadow(72)}
      <g transform="rotate(5 100 90)">
        <path d="M46 30 H158 V142 H46 l3 -8 l-4 -8 l4 -9 l-4 -8 l4 -8 l-4 -9 l4 -8 l-4 -8 l4 -9 l-4 -8 l4 -8 l-3 -9 Z" fill="#fbf3df" stroke="#9a8460" strokeWidth="1.5" filter="url(#tx-paper)" />
        <path d="M62 30 V142" stroke="#c8705a" strokeWidth="1.5" opacity="0.7" />
        {[46, 60, 74, 88, 102, 116, 130].map((y) => (
          <path key={y} d={`M50 ${y} H156`} stroke="#9ab8d0" strokeWidth="1" opacity="0.55" />
        ))}
        <path d="M70 42 q8 -4 16 0 M70 56 q10 -5 20 0 t20 0 t16 0 M70 70 q12 -4 24 0 t20 0 M70 84 q10 -5 20 0 t16 0 t20 0 M70 98 q8 -4 16 0 t14 0" stroke="#3a3a5a" strokeWidth="1.8" fill="none" />
        <path d="M128 30 v-12 l6 6 l6 -6 v12" fill="#7a2f1b" />
      </g>
    </g>
  );
}

function Postcard() {
  return (
    <g>
      {shadow(80)}
      <g transform="rotate(-5 100 90)">
        <rect x="26" y="38" width="148" height="100" rx="3" fill="#fbf6ea" stroke="#9a8460" strokeWidth="2" />
        <rect x="34" y="46" width="132" height="84" fill="#f6c27a" />
        <rect x="34" y="46" width="132" height="44" fill="#f8d79a" />
        <circle cx="128" cy="70" r="14" fill="#fff2c0" />
        <rect x="34" y="90" width="132" height="40" fill="#3f8fb0" />
        <path d="M34 98 q16 -4 33 0 t33 0 t33 0 t33 0" stroke="#fff" strokeWidth="1.5" opacity="0.6" fill="none" />
        {/* island and palm */}
        <path d="M58 92 Q74 80 96 92 Z" fill="#c9a86a" />
        <path d="M76 88 Q74 70 80 58" stroke="#6b4222" strokeWidth="3" fill="none" />
        <path d="M80 58 q-14 -2 -20 6 M80 58 q-6 -10 -16 -10 M80 58 q8 -10 18 -8 M80 58 q12 0 16 8" stroke="#3d6331" strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M140 96 l10 -2 l-2 6 Z" fill="#fff" />
      </g>
    </g>
  );
}

function RecipeCard() {
  return (
    <g>
      {shadow(78)}
      <g transform="rotate(3 100 90)">
        <rect x="30" y="40" width="140" height="96" rx="4" fill="#f4e8cc" stroke="#8a6a40" strokeWidth="2" filter="url(#tx-paper)" />
        <rect x="36" y="46" width="128" height="84" rx="2" fill="none" stroke="#b8452f" strokeWidth="1.2" opacity="0.6" />
        {/* tea stain */}
        <circle cx="140" cy="112" r="16" fill="none" stroke="#b07a3a" strokeWidth="3" opacity="0.35" />
        {/* pear doodle */}
        <g transform="translate(58 78)">
          <path d="M0 -14 Q-6 -6 -8 4 Q-10 18 0 18 Q10 18 8 4 Q6 -6 0 -14 Z" fill="#c8d66a" stroke="#6a7a2a" strokeWidth="1.5" />
          <path d="M0 -14 v-6 M0 -18 q6 -4 10 -2" stroke="#5a3a22" strokeWidth="1.5" fill="none" />
        </g>
        <path d="M80 62 h70 M80 76 h56 M80 90 h64 M50 108 h70" stroke="#4a3a2a" strokeWidth="2" opacity="0.55" />
      </g>
    </g>
  );
}

/** Ada's blue cup: indigo glaze, a small chip in the rim. */
export function BlueCupArt() {
  return (
    <g>
      {shadow(60)}
      <ellipse cx="100" cy="140" rx="56" ry="11" fill="url(#gl-cream)" stroke="#8a7350" strokeWidth="2" />
      <path d="M140 84 Q166 84 164 104 Q162 122 138 120" stroke="#2b3a63" strokeWidth="9" fill="none" />
      <path d="M56 70 Q56 134 100 136 Q144 134 144 70 Z" fill="url(#gl-indigo)" stroke="#1c2747" strokeWidth="2.5" />
      <ellipse cx="100" cy="70" rx="44" ry="10" fill="#c79a52" stroke="#1c2747" strokeWidth="2.5" />
      {/* chip */}
      <path d="M124 62 l6 2 l-3 6 Z" fill="#f2e6cc" stroke="#1c2747" strokeWidth="1" />
      <path d="M68 96 q32 14 64 0" stroke="#e6ecf6" strokeWidth="3" fill="none" opacity="0.8" />
      <path d="M78 112 q22 8 44 0" stroke="#e6ecf6" strokeWidth="2" fill="none" opacity="0.6" />
      <path d="M66 82 Q62 108 74 126" stroke="#fff" strokeWidth="5" opacity="0.22" fill="none" strokeLinecap="round" />
    </g>
  );
}

/** Joe's carved ship: a little wooden hull with a cloth sail. */
export function CarvedShipArt() {
  return (
    <g>
      {shadow(70)}
      <rect x="62" y="134" width="76" height="10" rx="3" fill="#6b4222" stroke="#3a1f0e" strokeWidth="1.5" />
      <path d="M86 134 v-6 M114 134 v-6" stroke="#3a1f0e" strokeWidth="4" />
      <path d="M36 98 L164 98 L148 128 L54 128 Z" fill="#a8703c" stroke="#4a2c12" strokeWidth="2.5" />
      <path d="M40 106 H160" stroke="#7a4a26" strokeWidth="2" />
      <path d="M48 116 H152" stroke="#c48a52" strokeWidth="1.5" opacity="0.7" />
      <line x1="100" y1="98" x2="100" y2="22" stroke="#4a2c12" strokeWidth="4" />
      <path d="M104 26 Q140 52 104 90 Z" fill="#f4ecd8" stroke="#8a7350" strokeWidth="2" />
      <path d="M96 34 Q70 58 96 88 Z" fill="#e9dcc0" stroke="#8a7350" strokeWidth="2" />
      <path d="M100 22 l16 6 l-16 6 Z" fill="#b8452f" />
      {[60, 80, 120, 140].map((x) => (
        <circle key={x} cx={x} cy="112" r="2.5" fill="#4a2c12" />
      ))}
    </g>
  );
}

/** A document lying on the counter (or in the box). */
export function DocObjectArt({ look }: { look: DocLook }) {
  let body;
  switch (look) {
    case 'letter':
      body = <Envelope seal="#9b2a1c" />;
      break;
    case 'letter2':
      body = <Envelope seal="#9b2a1c" stamp="ship" />;
      break;
    case 'final':
      body = <Envelope seal="#2b4a7a" stamp="ship" ribbon />;
      break;
    case 'note':
      body = <Note />;
      break;
    case 'ticket':
      body = <Ticket />;
      break;
    case 'diary':
      body = <DiaryPage />;
      break;
    case 'postcard':
      body = <Postcard />;
      break;
    case 'recipe':
      body = <RecipeCard />;
      break;
    case 'cup':
      body = <BlueCupArt />;
      break;
    case 'ship':
      body = <CarvedShipArt />;
      break;
  }
  return (
    <svg viewBox="0 0 200 160" className="doc-object-art" aria-hidden>
      {body}
    </svg>
  );
}

/** The wooden document box on the counter: lid ajar when something unread is inside. */
export function DocBoxArt({ count, unread, open }: { count: number; unread: boolean; open?: boolean }) {
  return (
    <svg viewBox="0 0 200 150" className="docbox-art" aria-hidden>
      <ellipse cx="100" cy="140" rx="92" ry="9" fill="#1d0e05" opacity="0.35" />
      {/* body */}
      <path d="M18 66 L182 66 L176 136 L24 136 Z" fill="#7a4a26" stroke="#3a1f0e" strokeWidth="2.5" filter="url(#tx-wood)" />
      <path d="M24 136 L176 136 L178 128 L22 128 Z" fill="#000" opacity="0.18" />
      <rect x="84" y="88" width="32" height="18" rx="3" fill="url(#g-brass)" stroke="#5a3c12" strokeWidth="1.5" />
      <circle cx="100" cy="97" r="3" fill="#3a2410" />
      {/* papers peeking out */}
      {count > 0 ? (
        <g>
          <path d="M36 66 L44 44 L120 40 L118 66 Z" fill="#f3e6c8" stroke="#9a8460" strokeWidth="1.5" />
          {count > 1 ? <path d="M90 66 L104 38 L166 46 L160 66 Z" fill="#fbf3df" stroke="#9a8460" strokeWidth="1.5" /> : null}
          {count > 2 ? <path d="M60 66 L70 50 L132 54 L128 66 Z" fill="#e9d7a8" stroke="#8a6a40" strokeWidth="1.5" /> : null}
        </g>
      ) : null}
      {/* lid: closed (flat on top) or ajar (tilted back) */}
      {open || unread ? (
        <g>
          <path d="M14 66 L186 66 L176 30 L26 30 Z" fill="#8e5a2e" stroke="#3a1f0e" strokeWidth="2.5" filter="url(#tx-wood)" />
          <path d="M40 38 H160" stroke="#c48a52" strokeWidth="2" opacity="0.6" />
        </g>
      ) : (
        <g>
          <path d="M12 52 L188 52 L184 70 L16 70 Z" fill="#8e5a2e" stroke="#3a1f0e" strokeWidth="2.5" filter="url(#tx-wood)" />
          <path d="M14 52 L186 52 L182 46 L18 46 Z" fill="#a8703c" stroke="#3a1f0e" strokeWidth="2" />
        </g>
      )}
      {/* paper label with the count */}
      <rect x="128" y="102" width="40" height="24" rx="2" fill="#f6ecd2" stroke="#8a7350" />
      <text x="148" y="120" textAnchor="middle" fontSize="16" fontWeight="700" fill="#5a3a12" style={{ fontFamily: 'var(--font-serif)' }}>
        {count}
      </text>
      {unread ? <circle cx="178" cy="40" r="8" fill="#c8402a" stroke="#fff4e0" strokeWidth="2" className="docbox-dot" /> : null}
    </svg>
  );
}
