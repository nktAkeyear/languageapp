import type { IngredientDef } from '../../core/types';

const svg = (body: string) =>
  `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${body}</svg>`;

// Small hand-drawn style icons for things without a reliable emoji.
const GINGER = svg(
  `<path d="M10 30c-3-6 3-12 9-10 2-6 10-7 13-2 6-2 11 4 8 9 4 3 1 10-5 9-2 4-9 5-12 1-5 2-11-1-13-7z" fill="#d9a548" stroke="#8a5a1c" stroke-width="2"/><path d="M19 20c2 3 2 6 0 9M31 18c-1 3 0 6 3 8" stroke="#8a5a1c" stroke-width="1.6" fill="none" stroke-linecap="round"/>`,
);
const SUGAR = svg(
  `<g stroke="#8d8577" stroke-width="2" stroke-linejoin="round"><path d="M8 26l10-5 10 5-10 5z" fill="#fff"/><path d="M8 26v10l10 5V31z" fill="#eeeae2"/><path d="M28 26v10l-10 5V31z" fill="#ddd7cb"/><path d="M22 16l9-4 9 4-9 4z" fill="#fff"/><path d="M22 16v8l9 4v-8z" fill="#eeeae2"/><path d="M40 16v8l-9 4v-8z" fill="#ddd7cb"/></g>`,
);
const leaves = (fill: string, stroke: string) =>
  svg(
    `<ellipse cx="24" cy="40" rx="16" ry="4" fill="#c8b48a"/><g fill="${fill}" stroke="${stroke}" stroke-width="1.5"><path d="M12 36c0-8 6-12 12-12-1 7-6 12-12 12z"/><path d="M36 36c0-8-6-12-12-12 1 7 6 12 12 12z"/><path d="M24 33c-5-6-3-14 2-18 3 6 2 13-2 18z"/></g>`,
  );
const GREEN_TEA = leaves('#7fae4e', '#3f6b25');
const BLACK_TEA = leaves('#6b3d24', '#3a1f10');
const RED_DATES = svg(
  `<g stroke="#5e1212" stroke-width="1.6"><ellipse cx="17" cy="27" rx="9" ry="12" fill="#a8261f" transform="rotate(-20 17 27)"/><ellipse cx="31" cy="25" rx="9" ry="12" fill="#bf3a2b" transform="rotate(15 31 25)"/></g><path d="M14 20c2 4 2 9 0 13M30 17c2 5 2 11 0 16" stroke="#7a1712" stroke-width="1.2" fill="none"/>`,
);
const CINNAMON = svg(
  `<g stroke="#5a2e12" stroke-width="1.6"><rect x="6" y="14" width="34" height="8" rx="4" fill="#b0652b" transform="rotate(-12 23 18)"/><rect x="8" y="26" width="34" height="8" rx="4" fill="#9a5424" transform="rotate(8 25 30)"/></g>`,
);

export const INGREDIENTS: IngredientDef[] = [
  { id: 'lemon', icon: { emoji: '🍋' }, tags: ['sour'], maxCount: 5, qtyOrderable: true },
  { id: 'ginger', icon: { svg: GINGER }, tags: ['warming', 'spice'], maxCount: 5, qtyOrderable: true },
  { id: 'mint', icon: { emoji: '🌿' }, tags: ['cooling'], maxCount: 10, qtyOrderable: true },
  { id: 'honey', icon: { emoji: '🍯' }, tags: ['sweet'], maxCount: 5, qtyOrderable: true },
  { id: 'water', icon: { emoji: '💧' }, tags: [], maxCount: 3, qtyOrderable: true, neutral: true },
  { id: 'ice', icon: { emoji: '🧊' }, tags: ['cooling'], maxCount: 10, qtyOrderable: true, coldOnly: true },
  { id: 'sugar', icon: { svg: SUGAR }, tags: ['sweet'], maxCount: 5, qtyOrderable: true },
  { id: 'salt', icon: { emoji: '🧂' }, tags: ['salty'], maxCount: 3, qtyOrderable: false },
  { id: 'green_tea', icon: { svg: GREEN_TEA }, tags: ['tea', 'bitter'], maxCount: 3, qtyOrderable: true },
  { id: 'black_tea', icon: { svg: BLACK_TEA }, tags: ['tea', 'bitter'], maxCount: 3, qtyOrderable: true },
  { id: 'milk', icon: { emoji: '🥛' }, tags: ['dairy'], maxCount: 3, qtyOrderable: false },
  { id: 'red_dates', icon: { svg: RED_DATES }, tags: ['sweet', 'warming'], maxCount: 5, qtyOrderable: true },
  { id: 'chrysanthemum', icon: { emoji: '🌼' }, tags: ['floral', 'cooling'], maxCount: 5, qtyOrderable: true },
  { id: 'cinnamon', icon: { svg: CINNAMON }, tags: ['spice', 'warming'], maxCount: 3, qtyOrderable: true },
];
