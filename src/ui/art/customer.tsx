/**
 * Customer characters, drawn in SVG and parametrised (hair, hat, clothes, colours, age, build).
 * The look is derived from the content's avatar emoji (its role hint: sailor, cook, grandma…)
 * plus a hash of the customer id, so every customer keeps the same face across days.
 *
 * Expressions are composed from eyes / brows / mouth parts so the face can react to the drink
 * (grimace for bitter, shiver for a cold drink when they wanted it hot …).
 */
import { hashString } from '../../core/rng';
import type { Face } from '../../core/types';
import type { Motion } from '../brewing';

export type Expression = Face | 'sip' | 'grimace' | 'pucker' | 'shiver' | 'hot' | 'cough' | 'listen';

type HairStyle = 'short' | 'bun' | 'long' | 'pigtails' | 'bald' | 'curly' | 'side';
type Hat = 'none' | 'captain' | 'chef' | 'cap' | 'bowler' | 'grad' | 'scarf' | 'helmet' | 'beanie' | 'bandana' | 'straw';
type Collar = 'coat' | 'apron' | 'shawl' | 'labcoat' | 'suit' | 'tee' | 'vest';
type Extra = 'brooch' | 'kerchief' | 'freckles' | 'chain' | 'pencil' | 'earrings' | 'flower';

/**
 * Arm pose: hands resting on the counter, holding a cup at the chest, raising it to sip, waving;
 * and the conversation gestures: explaining (one hand up, palm open), open hands (a shrug /
 * "you see?"), a hand at the chin (thinking, listening), hands on the heart.
 */
export type Pose = 'rest' | 'hold' | 'chest' | 'sip' | 'wave' | 'explain' | 'open' | 'chin' | 'heart';

export interface Look {
  skin: string;
  hair: string;
  hairStyle: HairStyle;
  hat: Hat;
  beard: boolean;
  moustache: boolean;
  glasses: boolean;
  coat: string;
  coat2: string;
  collar: Collar;
  age: 'child' | 'adult' | 'old';
  broad: boolean;
  hatColour?: string;
  /** Small distinguishing things (a rose brooch, a neck kerchief, freckles …). */
  extras?: Extra[];
  /** Colour of the kerchief / brooch / flower. */
  accent?: string;
}

const SKINS = ['#f3d2b3', '#e8b98f', '#d79f74', '#b97d55', '#8d5a3a', '#f6dcc4'];
const HAIRS = ['#2a1a12', '#4a2c18', '#6b4223', '#8a5a2e', '#1c1c22', '#a8642c'];
const COATS: [string, string][] = [
  ['#3e5a7a', '#2a3e57'],
  ['#7a3e32', '#55281f'],
  ['#4d6a45', '#33492d'],
  ['#8a6a3a', '#5e4624'],
  ['#5c4a72', '#3d3050'],
  ['#2f4f4f', '#1f3636'],
  ['#9a5a2a', '#6a3a18'],
];

/** Role presets keyed by avatar emoji (without skin tone / gender modifiers). */
const ROLE: Record<string, Partial<Look>> = {
  '🧔': { hat: 'captain', beard: true, collar: 'coat', coat: '#2c3e5c', coat2: '#1d2a40', broad: true },
  '👵': { age: 'old', hairStyle: 'bun', hair: '#d8d4cc', collar: 'shawl', coat: '#8a4a5a', coat2: '#5e2f3c', glasses: true },
  '👴': { age: 'old', hairStyle: 'bald', hair: '#d8d4cc', moustache: true, collar: 'vest', coat: '#6b5a3a', coat2: '#4a3d26' },
  '👦': { age: 'child', hairStyle: 'short', collar: 'tee', hat: 'cap' },
  '👧': { age: 'child', hairStyle: 'pigtails', collar: 'tee' },
  '👩‍🍳': { hat: 'chef', hairStyle: 'long', collar: 'apron', coat: '#f1ece2', coat2: '#cfc6b4' },
  '🧑‍💼': { hat: 'bowler', hairStyle: 'short', collar: 'suit', coat: '#3a3a42', coat2: '#24242a', moustache: true },
  '👷': { hat: 'helmet', hairStyle: 'short', collar: 'vest', coat: '#b8682a', coat2: '#7c4318', broad: true, beard: true },
  '🧑‍🏫': { hairStyle: 'side', glasses: true, collar: 'suit', coat: '#6b5a42', coat2: '#4a3d2c' },
  '👩‍🍼': { hairStyle: 'long', collar: 'shawl', coat: '#c28a6a', coat2: '#8e5c42' },
  '🧑‍⚕️': { hairStyle: 'short', collar: 'labcoat', coat: '#f4f2ec', coat2: '#cfcbc0', glasses: true },
  '🧑‍🎓': { hat: 'grad', hairStyle: 'short', collar: 'suit', coat: '#2f3a52', coat2: '#1e2638' },
  '👩‍🦳': { age: 'old', hairStyle: 'curly', hair: '#e8e4dc', collar: 'apron', coat: '#d9c7a8', coat2: '#a8946e' },
  '👩': { hairStyle: 'long', collar: 'shawl' },
  '👨': { hairStyle: 'short', collar: 'coat', moustache: true },
  '👨‍🦳': { age: 'old', hairStyle: 'short', hair: '#e2ded6', collar: 'suit' },
};

function stripModifiers(e: string): string {
  // Remove skin tone modifiers and gender signs so '👩🏽‍🍳' finds '👩‍🍳'.
  return e.replace(/[\u{1F3FB}-\u{1F3FF}]/gu, '').replace(/‍[♀♂]️?/g, '');
}

/**
 * Fixed looks of the regulars (the story's characters) and of recurring town people, so they are
 * recognisable every time — in the shop, in conversations, at a door, in the ledger. Keyed by
 * customer id; story-only delivery recipients and the zh / en ids of the same person map onto
 * one look through LOOK_ALIAS.
 */
const FIXED: Record<string, Look> = {
  // Rose (李奶奶): Ada's oldest friend. White bun, round glasses, a rose shawl with a rose brooch.
  c_grandma: { skin: '#f3d2b3', hair: '#ece8e0', hairStyle: 'bun', hat: 'none', beard: false, moustache: false, glasses: true, coat: '#b0485e', coat2: '#7a2c40', collar: 'shawl', age: 'old', broad: false, extras: ['brooch'], accent: '#e0475e' },
  // Joe (大刘): big dockworker. Knit cap, dark beard, orange work vest, red neck kerchief.
  c_docker: { skin: '#8d5a3a', hair: '#24160e', hairStyle: 'short', hat: 'beanie', hatColour: '#2f5a7a', beard: true, moustache: true, glasses: false, coat: '#b8682a', coat2: '#7c4318', collar: 'vest', age: 'adult', broad: true, extras: ['kerchief'], accent: '#c8402a' },
  // Tom (小明): the boy running errands. Red cap, ginger hair, freckles, green tee.
  c_boy: { skin: '#f6dcc4', hair: '#b0642a', hairStyle: 'short', hat: 'cap', hatColour: '#c23a2a', beard: false, moustache: false, glasses: false, coat: '#3e7a5a', coat2: '#285440', collar: 'tee', age: 'child', broad: false, extras: ['freckles'] },
  // Nora (陈阿姨): the ship's cook. Blue headscarf, long black hair, apron, gold earrings.
  c_cook: { skin: '#d79f74', hair: '#1c1c22', hairStyle: 'long', hat: 'bandana', hatColour: '#2c6a8a', beard: false, moustache: false, glasses: false, coat: '#f1ece2', coat2: '#cfc6b4', collar: 'apron', age: 'adult', broad: false, extras: ['earrings'] },
  // Grant (周老板): the pushy merchant. Bowler, moustache, wine-red suit, gold watch chain.
  c_merchant: { skin: '#e8b98f', hair: '#4a2c18', hairStyle: 'short', hat: 'bowler', beard: false, moustache: true, glasses: false, coat: '#5a2e2a', coat2: '#3a1c1a', collar: 'suit', age: 'adult', broad: true, extras: ['chain'] },
  // Hale (林老师): the schoolteacher. Greying side parting, glasses, tweed suit, pencil behind the ear.
  c_scholar: { skin: '#f3d2b3', hair: '#7a7068', hairStyle: 'side', hat: 'none', beard: false, moustache: false, glasses: true, coat: '#6b5a42', coat2: '#4a3d2c', collar: 'suit', age: 'adult', broad: false, extras: ['pencil'] },
  // Anna (孙太太): Tom's mother. Tom's ginger hair, freckles, a warm shawl.
  c_mom: { skin: '#f6dcc4', hair: '#b0642a', hairStyle: 'long', hat: 'none', beard: false, moustache: false, glasses: false, coat: '#c28a6a', coat2: '#8e5c42', collar: 'shawl', age: 'adult', broad: false, extras: ['freckles', 'flower'], accent: '#f2d04a' },
  // Old Mrs. Hill (孙奶奶): Tom's grandmother. White curls, lavender shawl, a woollen kerchief.
  hill: { skin: '#f6dcc4', hair: '#e6e2da', hairStyle: 'curly', hat: 'none', beard: false, moustache: false, glasses: false, coat: '#6a5a8a', coat2: '#463a60', collar: 'shawl', age: 'old', broad: false, extras: ['kerchief'], accent: '#d9c7a8' },
  // Market vendors, one per stall (keyed by stall id).
  v_red: { skin: '#d79f74', hair: '#3a2416', hairStyle: 'short', hat: 'straw', beard: true, moustache: true, glasses: false, coat: '#7a3e32', coat2: '#55281f', collar: 'apron', age: 'adult', broad: true, extras: [] },
  v_green: { skin: '#e8b98f', hair: '#e2ded6', hairStyle: 'bald', hat: 'none', beard: false, moustache: true, glasses: true, coat: '#4d6a45', coat2: '#33492d', collar: 'vest', age: 'old', broad: false, extras: [] },
  v_yellow: { skin: '#f3d2b3', hair: '#6b4223', hairStyle: 'bun', hat: 'none', beard: false, moustache: false, glasses: false, coat: '#c99a3c', coat2: '#8a6420', collar: 'apron', age: 'adult', broad: false, extras: ['kerchief'], accent: '#b8452f' },
  v_blue: { skin: '#b97d55', hair: '#1c1c22', hairStyle: 'curly', hat: 'cap', hatColour: '#3d6c9e', beard: false, moustache: false, glasses: false, coat: '#3e5a7a', coat2: '#2a3e57', collar: 'coat', age: 'adult', broad: false, extras: [] },
};
const LOOK_ALIAS: Record<string, string> = { s_rose: 'c_grandma', s_joe: 'c_docker', s_nora: 'c_cook', r_hill: 'hill', r_sun: 'hill' };

/** Is this one of the fixed, recognisable people? */
export function hasFixedLook(id: string): boolean {
  return !!FIXED[LOOK_ALIAS[id] ?? id];
}

export function lookFor(id: string, avatar: string): Look {
  const fixed = FIXED[LOOK_ALIAS[id] ?? id];
  if (fixed) return fixed;
  const h = hashString(id);
  const pick = <T,>(arr: T[], salt: number) => arr[(h >>> salt) % arr.length];
  const [coat, coat2] = pick(COATS, 3);
  const base: Look = {
    skin: pick(SKINS, 5),
    hair: pick(HAIRS, 9),
    hairStyle: pick<HairStyle>(['short', 'long', 'curly', 'side', 'bun'], 13),
    hat: 'none',
    beard: false,
    moustache: false,
    glasses: false,
    coat,
    coat2,
    collar: pick<Collar>(['coat', 'shawl', 'vest', 'suit'], 17),
    age: 'adult',
    broad: false,
  };
  return { ...base, ...(ROLE[stripModifiers(avatar)] ?? {}) };
}

/** Face shown for a reaction motion (overrides the content face where the body says more). */
export function expressionFor(face: Face, motion: Motion | null): Expression {
  switch (motion) {
    case 'grimace':
      return 'grimace';
    case 'pucker':
      return 'pucker';
    case 'shiver':
      return 'shiver';
    case 'fan':
      return 'hot';
    case 'cough':
      return 'cough';
    default:
      return face;
  }
}

function Eyes({ ex, old }: { ex: Expression; old: boolean }) {
  const y = 112;
  const L = 98;
  const R = 142;
  switch (ex) {
    case 'delighted':
    case 'happy':
      return (
        <g stroke="#2a1a12" strokeWidth="3.5" fill="none" strokeLinecap="round">
          <path d={`M${L - 8} ${y + 2} Q${L} ${y - 8} ${L + 8} ${y + 2}`} />
          <path d={`M${R - 8} ${y + 2} Q${R} ${y - 8} ${R + 8} ${y + 2}`} />
        </g>
      );
    case 'sip':
    case 'grimace':
    case 'cough':
      return (
        <g stroke="#2a1a12" strokeWidth="3.5" fill="none" strokeLinecap="round">
          <path d={`M${L - 8} ${y - 3} L${L + 6} ${y + 1} L${L - 8} ${y + 5}`} opacity={ex === 'sip' ? 0 : 1} />
          <path d={`M${R + 8} ${y - 3} L${R - 6} ${y + 1} L${R + 8} ${y + 5}`} opacity={ex === 'sip' ? 0 : 1} />
          {ex === 'sip' && (
            <>
              <path d={`M${L - 8} ${y} Q${L} ${y + 6} ${L + 8} ${y}`} />
              <path d={`M${R - 8} ${y} Q${R} ${y + 6} ${R + 8} ${y}`} />
            </>
          )}
        </g>
      );
    case 'pucker':
      return (
        <g stroke="#2a1a12" strokeWidth="3.5" fill="none" strokeLinecap="round">
          <path d={`M${L - 8} ${y} h16`} />
          <path d={`M${R - 8} ${y} h16`} />
        </g>
      );
    case 'puzzled':
    case 'shiver':
    case 'hot':
    case 'neutral':
    case 'sad':
    case 'angry':
    case 'listen':
    default: {
      const big = ex === 'puzzled' || ex === 'shiver';
      const r = big ? 6 : 5;
      return (
        <g>
          <ellipse cx={L} cy={y} rx={r} ry={r + 1.5} fill="#2a1a12" />
          <ellipse cx={R} cy={y} rx={ex === 'puzzled' ? r - 2 : r} ry={(ex === 'puzzled' ? r - 2 : r) + 1.5} fill="#2a1a12" />
          <circle cx={L + 2} cy={y - 2} r="1.8" fill="#fff" />
          <circle cx={R + 2} cy={y - 2} r="1.8" fill="#fff" />
          {old && <path d={`M${L - 10} ${y + 10} q4 3 8 0 M${R + 2} ${y + 10} q4 3 8 0`} stroke="#8a5a3a" strokeWidth="1.4" fill="none" opacity="0.6" />}
        </g>
      );
    }
  }
}

function Brows({ ex, color }: { ex: Expression; color: string }) {
  const y = 96;
  const p = (l: string, r: string) => (
    <g stroke={color} strokeWidth="4.5" strokeLinecap="round" fill="none">
      <path d={l} />
      <path d={r} />
    </g>
  );
  switch (ex) {
    case 'angry':
    case 'grimace':
    case 'cough':
      return p(`M88 ${y - 4} L108 ${y + 4}`, `M152 ${y - 4} L132 ${y + 4}`);
    case 'sad':
    case 'shiver':
    case 'hot':
      return p(`M88 ${y + 3} L108 ${y - 4}`, `M152 ${y + 3} L132 ${y - 4}`);
    case 'puzzled':
      return p(`M88 ${y - 6} Q98 ${y - 12} 108 ${y - 6}`, `M132 ${y + 2} L152 ${y}`);
    case 'delighted':
      return p(`M88 ${y - 6} Q98 ${y - 12} 108 ${y - 6}`, `M132 ${y - 6} Q142 ${y - 12} 152 ${y - 6}`);
    default:
      return p(`M88 ${y - 2} Q98 ${y - 6} 108 ${y - 2}`, `M132 ${y - 2} Q142 ${y - 6} 152 ${y - 2}`);
  }
}

function Mouth({ ex }: { ex: Expression }) {
  const y = 140;
  switch (ex) {
    case 'delighted':
      return (
        <g>
          <path d={`M104 ${y - 4} Q120 ${y + 20} 136 ${y - 4} Z`} fill="#7a2418" stroke="#4a140c" strokeWidth="2" strokeLinejoin="round" />
          <path d={`M110 ${y + 6} Q120 ${y + 12} 130 ${y + 6}`} fill="#e86a5a" />
        </g>
      );
    case 'happy':
      return <path d={`M106 ${y - 2} Q120 ${y + 12} 134 ${y - 2}`} stroke="#4a140c" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
    case 'sad':
      return <path d={`M108 ${y + 6} Q120 ${y - 4} 132 ${y + 6}`} stroke="#4a140c" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
    case 'angry':
      return <path d={`M106 ${y + 4} Q120 ${y - 2} 134 ${y + 4} L134 ${y + 8} Q120 ${y + 2} 106 ${y + 8} Z`} fill="#4a140c" />;
    case 'puzzled':
      return <path d={`M108 ${y + 2} q6 -5 12 0 q6 5 12 -1`} stroke="#4a140c" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
    case 'sip':
    case 'pucker':
      return <ellipse cx="120" cy={y + 1} rx="5" ry="6" fill="#7a2418" stroke="#4a140c" strokeWidth="2" />;
    case 'grimace':
      return (
        <g>
          <rect x="104" y={y - 5} width="32" height="12" rx="4" fill="#fff" stroke="#4a140c" strokeWidth="2.5" />
          <path d={`M112 ${y - 5} v12 M120 ${y - 5} v12 M128 ${y - 5} v12`} stroke="#4a140c" strokeWidth="1.5" />
        </g>
      );
    case 'shiver':
      return <path d={`M104 ${y + 2} l5 -4 l5 4 l5 -4 l5 4 l5 -4 l5 4`} stroke="#4a140c" strokeWidth="3" fill="none" strokeLinejoin="round" />;
    case 'hot':
      return (
        <g>
          <ellipse cx="120" cy={y + 2} rx="10" ry="8" fill="#7a2418" stroke="#4a140c" strokeWidth="2" />
          <path d={`M114 ${y + 4} q6 8 12 0`} fill="#e86a5a" />
        </g>
      );
    case 'cough':
      return <ellipse cx="120" cy={y + 2} rx="9" ry="7" fill="#4a140c" />;
    case 'listen':
    case 'neutral':
    default:
      return <path d={`M110 ${y + 1} Q120 ${y + 4} 130 ${y + 1}`} stroke="#4a140c" strokeWidth="3.5" fill="none" strokeLinecap="round" />;
  }
}

/** The open mouth while talking (alternates with the expression's own mouth). */
function TalkMouth({ ex }: { ex: Expression }) {
  const y = 140;
  const glad = ex === 'happy' || ex === 'delighted' || ex === 'listen';
  const sad = ex === 'sad' || ex === 'shiver';
  return glad ? (
    <path d={`M107 ${y - 2} Q120 ${y + 18} 133 ${y - 2} Z`} fill="#7a2418" stroke="#4a140c" strokeWidth="2.5" strokeLinejoin="round" />
  ) : sad ? (
    <ellipse cx="120" cy={y + 3} rx="7" ry="5" fill="#7a2418" stroke="#4a140c" strokeWidth="2.5" />
  ) : (
    <ellipse cx="120" cy={y + 2} rx="9" ry="7" fill="#7a2418" stroke="#4a140c" strokeWidth="2.5" />
  );
}

/** Eyelids (skin) that close over open eyes for a blink. */
function Lids({ skin }: { skin: string }) {
  const y = 112;
  return (
    <g className="cust-lids" aria-hidden>
      <ellipse cx="98" cy={y} rx="9" ry="9" fill={skin} />
      <ellipse cx="142" cy={y} rx="9" ry="9" fill={skin} />
      <path d={`M89 ${y + 1} q9 4 18 0 M133 ${y + 1} q9 4 18 0`} stroke="#2a1a12" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    </g>
  );
}

const OPEN_EYES: Expression[] = ['neutral', 'puzzled', 'shiver', 'hot', 'sad', 'angry', 'listen'];

function HairBack({ look }: { look: Look }) {
  const c = look.hair;
  switch (look.hairStyle) {
    case 'long':
      return <path d="M64 100 Q60 40 120 38 Q180 40 176 100 L182 200 Q150 214 120 210 Q90 214 58 200 Z" fill={c} />;
    case 'pigtails':
      return (
        <g fill={c}>
          <ellipse cx="58" cy="140" rx="16" ry="30" />
          <ellipse cx="182" cy="140" rx="16" ry="30" />
          <circle cx="66" cy="112" r="7" fill="#d8546e" />
          <circle cx="174" cy="112" r="7" fill="#d8546e" />
        </g>
      );
    case 'bun':
      return <circle cx="120" cy="44" r="24" fill={c} />;
    case 'curly':
      return (
        <g fill={c}>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => {
            const a = Math.PI * (0.95 + (i / 8) * 1.1);
            return <circle key={i} cx={120 + Math.cos(a) * 62} cy={104 + Math.sin(a) * 62} r="20" />;
          })}
        </g>
      );
    default:
      return null;
  }
}

function HairFront({ look }: { look: Look }) {
  const c = look.hair;
  switch (look.hairStyle) {
    case 'bald':
      return <path d="M66 112 Q64 90 74 84 M174 112 Q176 90 166 84" stroke={c} strokeWidth="10" strokeLinecap="round" fill="none" />;
    case 'side':
      return <path d="M66 104 Q62 52 120 50 Q178 52 174 100 Q160 74 132 70 Q104 74 82 66 Q72 84 66 104 Z" fill={c} />;
    case 'curly':
      return <path d="M68 96 Q70 56 120 54 Q170 56 172 96 Q150 78 120 80 Q90 78 68 96 Z" fill={c} />;
    case 'long':
    case 'bun':
    case 'pigtails':
      return <path d="M66 100 Q62 52 120 50 Q178 52 174 100 Q152 70 120 74 Q102 62 92 78 Q80 84 66 100 Z" fill={c} />;
    case 'short':
    default:
      return <path d="M66 100 Q62 50 120 48 Q178 50 174 100 Q160 74 136 72 Q112 66 96 76 Q80 80 66 100 Z" fill={c} />;
  }
}

function HatArt({ look }: { look: Look }) {
  switch (look.hat) {
    case 'captain':
      return (
        <g>
          <path d="M62 78 Q66 40 120 38 Q174 40 178 78 Z" fill="#1d2a40" stroke="#0e1522" strokeWidth="2" />
          <rect x="58" y="74" width="124" height="14" rx="6" fill="#141d2e" />
          <path d="M70 88 Q120 104 170 88 L168 92 Q120 110 72 92 Z" fill="#0e1522" />
          <circle cx="120" cy="64" r="8" fill="url(#g-brass)" />
          <path d="M66 82 h108" stroke="#c99a3c" strokeWidth="2" />
        </g>
      );
    case 'chef':
      return (
        <g>
          <rect x="74" y="56" width="92" height="30" fill="#fbfaf6" stroke="#cfc6b4" strokeWidth="2" />
          {[90, 120, 150].map((x) => (
            <circle key={x} cx={x} cy={40} r="24" fill="#fbfaf6" stroke="#cfc6b4" strokeWidth="2" />
          ))}
          <rect x="76" y="44" width="88" height="24" fill="#fbfaf6" />
        </g>
      );
    case 'cap':
      return (
        <g>
          <path d="M66 84 Q66 44 120 44 Q172 44 174 84 Z" fill={look.hatColour ?? '#b8382a'} />
          <path d="M120 84 Q170 78 196 90 Q170 96 120 92 Z" fill="#00000055" />
          <path d="M120 84 Q170 78 196 90 Q170 96 120 92 Z" fill={look.hatColour ?? '#b8382a'} opacity="0.75" />
          <circle cx="120" cy="46" r="4" fill="#00000055" />
        </g>
      );
    case 'bowler':
      return (
        <g>
          <ellipse cx="120" cy="80" rx="72" ry="10" fill="#1a1a1e" />
          <path d="M78 80 Q78 34 120 34 Q162 34 162 80 Z" fill="#26262c" />
          <path d="M80 70 h80" stroke="#6b2a2a" strokeWidth="6" />
        </g>
      );
    case 'grad':
      return (
        <g>
          <path d="M72 84 Q72 60 120 58 Q168 60 168 84 Z" fill="#1a1e2a" />
          <path d="M60 52 L120 34 L180 52 L120 70 Z" fill="#23283a" stroke="#0e1018" strokeWidth="2" />
          <path d="M120 52 L170 60 L172 90" stroke="#d8a838" strokeWidth="3" fill="none" />
          <circle cx="172" cy="92" r="4" fill="#d8a838" />
        </g>
      );
    case 'beanie':
      return (
        <g>
          <path d="M64 92 Q60 34 120 32 Q180 34 176 92 Z" fill={look.hatColour ?? '#2f5a7a'} stroke="#00000033" strokeWidth="2" />
          <rect x="60" y="80" width="120" height="18" rx="7" fill={look.hatColour ?? '#2f5a7a'} stroke="#00000044" strokeWidth="2" />
          {[76, 92, 108, 124, 140, 156].map((x) => (
            <path key={x} d={`M${x} 82 v14`} stroke="#00000030" strokeWidth="3" />
          ))}
          <path d="M84 56 Q120 44 156 56" stroke="#ffffff30" strokeWidth="3" fill="none" />
        </g>
      );
    case 'bandana':
      return (
        <g>
          <path d="M62 96 Q58 40 120 38 Q182 40 178 96 Q150 72 120 74 Q90 72 62 96 Z" fill={look.hatColour ?? '#2c6a8a'} stroke="#00000040" strokeWidth="2" />
          <path d="M172 82 Q192 92 196 110 Q184 104 176 100 Q186 116 182 126 Q172 110 168 94 Z" fill={look.hatColour ?? '#2c6a8a'} stroke="#00000040" strokeWidth="1.5" />
          {[[92, 56], [120, 50], [148, 56], [104, 72], [136, 70]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="3.2" fill="#f4ecd8" opacity="0.85" />
          ))}
        </g>
      );
    case 'straw':
      return (
        <g>
          <ellipse cx="120" cy="80" rx="86" ry="14" fill="#e3c27a" stroke="#9a7a3a" strokeWidth="2" />
          <path d="M78 80 Q78 38 120 36 Q162 38 162 80 Z" fill="#ecd08c" stroke="#9a7a3a" strokeWidth="2" />
          <path d="M79 70 h82" stroke="#7a3e32" strokeWidth="7" />
          <path d="M84 52 Q120 44 156 52" stroke="#c8a458" strokeWidth="2" fill="none" />
        </g>
      );
    case 'helmet':
      return (
        <g>
          <path d="M64 86 Q64 36 120 36 Q176 36 176 86 Z" fill="#e3b23c" stroke="#9a7420" strokeWidth="2" />
          <rect x="56" y="80" width="128" height="10" rx="5" fill="#d0a030" />
          <path d="M120 38 v44" stroke="#c99828" strokeWidth="6" />
        </g>
      );
    default:
      return null;
  }
}

function Body({ look }: { look: Look }) {
  const w = look.broad ? 1.12 : look.age === 'child' ? 0.82 : 1;
  const sx = (x: number) => 120 + (x - 120) * w;
  const top = 196;
  const shoulders = `M${sx(36)} 420 L${sx(40)} ${top + 50} Q${sx(44)} ${top + 6} ${sx(92)} ${top} L${sx(148)} ${top} Q${sx(196)} ${top + 6} ${sx(200)} ${top + 50} L${sx(204)} 420 Z`;
  return (
    <g>
      <path d={shoulders} fill={look.coat} stroke={look.coat2} strokeWidth="3" />
      {/* shading on the coat */}
      <path d={`M${sx(150)} ${top + 4} Q${sx(196)} ${top + 10} ${sx(200)} ${top + 50} L${sx(204)} 420 L${sx(170)} 420 Z`} fill={look.coat2} opacity="0.45" />
      {look.collar === 'coat' && (
        <g>
          <path d={`M${sx(96)} ${top} L120 ${top + 60} L${sx(144)} ${top} Z`} fill="#efe6d4" />
          <path d={`M${sx(92)} ${top} L112 ${top + 70} L${sx(72)} ${top + 30} Z M${sx(148)} ${top} L128 ${top + 70} L${sx(168)} ${top + 30} Z`} fill={look.coat2} />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx="120" cy={top + 90 + i * 34} r="5" fill="url(#g-brass)" />
          ))}
        </g>
      )}
      {look.collar === 'suit' && (
        <g>
          <path d={`M${sx(98)} ${top} L120 ${top + 80} L${sx(142)} ${top} Z`} fill="#f4efe4" />
          <path d={`M114 ${top + 6} L126 ${top + 6} L122 ${top + 70} L120 ${top + 78} L118 ${top + 70} Z`} fill="#8a2a2a" />
          <path d={`M${sx(94)} ${top} L114 ${top + 96} L${sx(70)} ${top + 26} Z M${sx(146)} ${top} L126 ${top + 96} L${sx(170)} ${top + 26} Z`} fill={look.coat2} />
        </g>
      )}
      {look.collar === 'tee' && <path d={`M${sx(100)} ${top} Q120 ${top + 20} ${sx(140)} ${top}`} fill="none" stroke={look.coat2} strokeWidth="5" />}
      {look.collar === 'vest' && (
        <g>
          <path d={`M${sx(96)} ${top} L120 ${top + 40} L${sx(144)} ${top} Z`} fill="#efe6d4" />
          <path d={`M${sx(84)} ${top + 10} L120 ${top + 120} L${sx(156)} ${top + 10} L${sx(160)} 420 L${sx(80)} 420 Z`} fill={look.coat2} opacity="0.9" />
          {[0, 1, 2].map((i) => (
            <circle key={i} cx="120" cy={top + 140 + i * 30} r="4" fill="#e6d2a6" />
          ))}
        </g>
      )}
      {look.collar === 'apron' && (
        <g>
          <path d={`M${sx(96)} ${top} L120 ${top + 30} L${sx(144)} ${top} Z`} fill="#e9dfcc" />
          <path d={`M${sx(84)} ${top + 70} L${sx(156)} ${top + 70} L${sx(164)} 420 L${sx(76)} 420 Z`} fill="#f8f4ea" stroke="#cfc6b4" strokeWidth="2" />
          <path d={`M${sx(86)} ${top + 70} L${sx(96)} ${top + 4} M${sx(154)} ${top + 70} L${sx(144)} ${top + 4}`} stroke="#cfc6b4" strokeWidth="4" />
        </g>
      )}
      {look.collar === 'shawl' && (
        <path d={`M${sx(50)} ${top + 40} Q120 ${top - 10} ${sx(190)} ${top + 40} Q${sx(170)} ${top + 110} 120 ${top + 120} Q${sx(70)} ${top + 110} ${sx(50)} ${top + 40} Z`} fill={look.coat2} opacity="0.95" />
      )}
      {look.collar === 'labcoat' && (
        <g>
          <path d={`M${sx(98)} ${top} L120 ${top + 60} L${sx(142)} ${top} Z`} fill="#7aa6c8" />
          <path d={`M${sx(94)} ${top} L114 ${top + 120} L${sx(64)} ${top + 30} Z M${sx(146)} ${top} L126 ${top + 120} L${sx(176)} ${top + 30} Z`} fill="#e8e5dc" />
          <path d={`M${sx(150)} ${top + 120} h22 v18 h-22 Z`} fill="none" stroke="#bdb8aa" strokeWidth="2" />
        </g>
      )}
    </g>
  );
}

/** Things worn at the neck / chest (drawn over the body, under the arms). */
function NeckExtras({ look }: { look: Look }) {
  const ex = look.extras ?? [];
  const a = look.accent ?? '#c8402a';
  return (
    <g>
      {ex.includes('kerchief') ? (
        <g>
          <path d="M92 196 Q120 222 148 196 L144 212 Q120 236 96 212 Z" fill={a} stroke="#00000040" strokeWidth="2" />
          <path d="M112 220 L104 252 L120 236 L136 252 L128 220 Z" fill={a} stroke="#00000040" strokeWidth="2" />
        </g>
      ) : null}
      {ex.includes('brooch') ? (
        <g transform="translate(146 238)">
          {[0, 72, 144, 216, 288].map((r) => (
            <ellipse key={r} cx="0" cy="-6" rx="6" ry="8" fill={a} stroke="#7a1a2a" strokeWidth="1" transform={`rotate(${r})`} />
          ))}
          <circle r="4" fill="#9a1c34" />
          <path d="M-4 8 q-8 8 -14 6 M4 8 q8 8 14 6" stroke="#4d7a3a" strokeWidth="3" fill="none" />
        </g>
      ) : null}
      {ex.includes('chain') ? (
        <g>
          <path d="M100 300 Q116 318 136 304" stroke="url(#g-brass)" strokeWidth="3" fill="none" strokeDasharray="4 2" />
          <circle cx="138" cy="304" r="6" fill="url(#g-brass)" stroke="#5a3c12" />
        </g>
      ) : null}
    </g>
  );
}

const ARM_POSES: Record<Pose, { l: [number, number][]; r: [number, number][] }> = {
  // shoulder, elbow, hand (adult proportions; scaled horizontally by build)
  rest: { l: [[56, 236], [44, 300], [84, 352]], r: [[184, 236], [196, 300], [156, 352]] },
  hold: { l: [[56, 236], [44, 330], [80, 296]], r: [[184, 236], [196, 330], [160, 296]] },
  chest: { l: [[56, 236], [38, 290], [80, 206]], r: [[184, 236], [202, 290], [160, 206]] },
  sip: { l: [[56, 236], [46, 330], [86, 226]], r: [[184, 236], [196, 318], [156, 200]] },
  wave: { l: [[56, 236], [44, 300], [84, 352]], r: [[184, 236], [214, 200], [206, 132]] },
  explain: { l: [[56, 236], [44, 300], [84, 352]], r: [[184, 236], [218, 300], [184, 246]] },
  open: { l: [[56, 236], [22, 296], [24, 250]], r: [[184, 236], [218, 296], [216, 250]] },
  chin: { l: [[56, 236], [44, 300], [96, 318]], r: [[184, 236], [196, 296], [146, 178]] },
  heart: { l: [[56, 236], [46, 300], [104, 262]], r: [[184, 236], [194, 300], [134, 252]] },
};

/** Two arms in the coat's colour with hands (in front of the body, behind the held cup). */
function Arms({ look, pose }: { look: Look; pose: Pose }) {
  const w = look.broad ? 1.12 : look.age === 'child' ? 0.82 : 1;
  const sx = (x: number) => 120 + (x - 120) * w;
  const P = ARM_POSES[pose];
  const path = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${sx(x)} ${y}`).join(' ');
  const thick = look.broad ? 36 : look.age === 'child' ? 26 : 30;
  const hand = (pts: [number, number][], key: string) => {
    const [x, y] = pts[2];
    return (
      <g key={key} transform={`translate(${sx(x)} ${y})`}>
        <ellipse rx={thick * 0.42} ry={thick * 0.38} fill={look.skin} stroke="#00000038" strokeWidth="2" />
        <path d={`M${-thick * 0.2} ${-thick * 0.2} q${thick * 0.12} ${-thick * 0.2} ${thick * 0.3} ${-thick * 0.08}`} stroke="#00000030" strokeWidth="2" fill="none" />
      </g>
    );
  };
  const arm = (pts: [number, number][], key: string) => (
    <g key={key}>
      <path d={path(pts)} stroke={look.coat2} strokeWidth={thick + 5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d={path(pts)} stroke={look.coat} strokeWidth={thick} fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* cuff */}
      <circle cx={sx(pts[2][0]) + (pts[1][0] - pts[2][0]) * 0.18 * w} cy={pts[2][1] + (pts[1][1] - pts[2][1]) * 0.18} r={thick * 0.5} fill={look.coat2} />
    </g>
  );
  return (
    <g className={`cust-arms pose-${pose}`}>
      {arm(P.l, 'la')}
      {arm(P.r, 'ra')}
      {hand(P.l, 'lh')}
      {hand(P.r, 'rh')}
    </g>
  );
}

/**
 * The character, 240×420 viewBox. Head top ~y 30, shoulders ~y 200.
 * `talking`: the mouth moves (alternating with the expression's mouth) and the head nods a little.
 * `alive`: blinks and breathes (CSS, off with prefers-reduced-motion); small portraits pass false.
 */
export function CustomerArt({ look, ex, pose = 'rest', talking = false, alive = true }: { look: Look; ex: Expression; pose?: Pose; talking?: boolean; alive?: boolean }) {
  const old = look.age === 'old';
  const extras = look.extras ?? [];
  const headScale = look.age === 'child' ? 1.06 : 1;
  const blush = ex === 'delighted' || ex === 'happy' || ex === 'hot';
  // Each person blinks on their own rhythm.
  const seed = hashString(`${look.skin}${look.hair}${look.coat}${look.hairStyle}`);
  const style = alive ? ({ ['--blink-delay' as string]: `${-(seed % 4000) / 1000}s`, ['--blink-dur' as string]: `${3.6 + (seed % 5) * 0.45}s` } as React.CSSProperties) : undefined;
  return (
    <svg viewBox="0 0 240 420" className={`customer-art ${alive ? 'cust-alive' : ''} ${talking ? 'cust-talking' : ''} ex-${ex}`} style={style} aria-hidden>
      <g className="cust-body">
        <Body look={look} />
        <NeckExtras look={look} />
        <g key={pose} className="cust-pose">
          <Arms look={look} pose={pose} />
        </g>
      </g>
      <g className="cust-head" transform={headScale !== 1 ? `translate(120 120) scale(${headScale}) translate(-120 -120)` : undefined}>
        <g className="cust-headmove">
        <HairBack look={look} />
        {/* neck */}
        <path d="M104 160 L104 200 Q120 210 136 200 L136 160 Z" fill={look.skin} />
        <path d="M104 182 Q120 196 136 182 L136 200 Q120 210 104 200 Z" fill="#000" opacity="0.12" />
        {/* ears */}
        <ellipse cx="64" cy="118" rx="10" ry="14" fill={look.skin} stroke="#00000022" strokeWidth="2" />
        <ellipse cx="176" cy="118" rx="10" ry="14" fill={look.skin} stroke="#00000022" strokeWidth="2" />
        {/* face */}
        <path d="M66 108 Q64 54 120 52 Q176 54 174 108 Q174 168 120 176 Q66 168 66 108 Z" fill={look.skin} />
        <path d="M150 64 Q176 80 172 120 Q168 160 128 174 Q160 150 160 110 Q160 80 150 64 Z" fill="#000" opacity="0.07" />
        {ex === 'shiver' ? <path d="M66 108 Q64 54 120 52 Q176 54 174 108 Q174 168 120 176 Q66 168 66 108 Z" fill="#7ab0e0" opacity="0.28" /> : null}
        {ex === 'hot' || ex === 'angry' ? <path d="M66 108 Q64 54 120 52 Q176 54 174 108 Q174 168 120 176 Q66 168 66 108 Z" fill="#e0503a" opacity="0.18" /> : null}
        {blush ? (
          <g fill="#e8786a" opacity="0.45">
            <ellipse cx="88" cy="134" rx="11" ry="6" />
            <ellipse cx="152" cy="134" rx="11" ry="6" />
          </g>
        ) : null}
        {extras.includes('freckles') ? (
          <g fill="#b8743a" opacity="0.55">
            {[[84, 128], [92, 132], [88, 138], [148, 128], [156, 132], [152, 138]].map(([x, y]) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="1.8" />
            ))}
          </g>
        ) : null}
        {extras.includes('earrings') ? (
          <g fill="url(#g-brass)" stroke="#5a3c12" strokeWidth="1">
            <circle cx="64" cy="136" r="5" />
            <circle cx="176" cy="136" r="5" />
          </g>
        ) : null}
        {/* nose */}
        <path d="M120 116 Q114 130 122 132" stroke="#00000044" strokeWidth="3" fill="none" strokeLinecap="round" />
        <Eyes ex={ex} old={old} />
        {alive && OPEN_EYES.includes(ex) ? <Lids skin={look.skin} /> : null}
        <Brows ex={ex} color={old ? '#bdb8ae' : look.hair} />
        {look.beard ? <path d="M70 120 Q72 176 120 184 Q168 176 170 120 Q164 150 140 156 Q120 146 100 156 Q76 150 70 120 Z" fill={look.hair} /> : null}
        {look.moustache || look.beard ? <path d="M100 134 Q120 124 140 134 Q130 140 120 136 Q110 140 100 134 Z" fill={old ? '#cfcac0' : look.hair} /> : null}
        <g className="mouth-rest">
          <Mouth ex={ex} />
        </g>
        {talking ? (
          <g className="mouth-talk">
            <TalkMouth ex={ex} />
          </g>
        ) : null}
        {look.glasses ? (
          <g stroke="#3a2a1a" strokeWidth="2.5" fill="#ffffff22">
            <circle cx="98" cy="112" r="14" />
            <circle cx="142" cy="112" r="14" />
            <path d="M112 112 h16" />
          </g>
        ) : null}
        <HairFront look={look} />
        <HatArt look={look} />
        {extras.includes('pencil') ? (
          <g transform="rotate(-58 176 92)">
            <rect x="150" y="88" width="52" height="7" fill="#e3b23c" stroke="#7a5a1c" strokeWidth="1" />
            <path d="M202 88 L210 91.5 L202 95 Z" fill="#f2d9b0" stroke="#7a5a1c" strokeWidth="1" />
          </g>
        ) : null}
        {extras.includes('flower') ? (
          <g transform="translate(160 66)">
            {[0, 72, 144, 216, 288].map((r) => (
              <ellipse key={r} cx="0" cy="-6" rx="5" ry="7" fill={look.accent ?? '#f2d04a'} stroke="#00000030" transform={`rotate(${r})`} />
            ))}
            <circle r="3.5" fill="#c8742a" />
          </g>
        ) : null}
        {/* reaction marks */}
        {ex === 'grimace' || ex === 'cough' ? <path d="M182 70 l10 -10 m-4 14 l14 -4 m-14 12 l12 6" stroke="#6b3a8a" strokeWidth="3" strokeLinecap="round" /> : null}
        {ex === 'hot' ? <path d="M182 84 q6 10 0 16 q-6 -6 0 -16" fill="#7ac0f0" /> : null}
        {ex === 'shiver' ? <path d="M40 90 l-8 6 l8 6 l-8 6 M200 90 l8 6 l-8 6 l8 6" stroke="#5a8ac0" strokeWidth="3" fill="none" /> : null}
        {ex === 'puzzled' ? (
          <text x="186" y="70" fontSize="40" fontWeight="700" fill="#5a3a1a" fontFamily="Georgia, serif">
            ?
          </text>
        ) : null}
        </g>
      </g>
    </svg>
  );
}
