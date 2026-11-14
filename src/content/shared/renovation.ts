import type { RenoShared } from '../../renovation/types';

/**
 * The carpenter's catalogue (language-neutral). Entries appear as the shop grows (day, stage,
 * reputation, open activities, earlier purchases). Prices are calibrated with
 * `npm run simulate -- <lang> 45 1 0 0 buy`: a player who serves well can buy about one thing
 * every two or three days and finishes the catalogue near the end of the 40-day arc; a clumsy
 * player gets roughly two thirds of it.
 */
export const RENO_SHARED: RenoShared = {
  upgrades: [
    // --- the first days: something cheap to save for
    { id: 'signboard', category: 'outside', price: 25, when: { day: 4 }, effects: { repDay: 1, remarks: true } },
    { id: 'plant', category: 'decor', price: 15, when: { day: 4 }, effects: { remarks: true } },
    { id: 'ribbon', category: 'notebook', price: 12, when: { day: 5 }, effects: { notebook: 'review' } },
    { id: 'kettle', category: 'tools', price: 35, when: { day: 5, feature: 'temperature' }, effects: { coinHot: 1 } },
    { id: 'curtains', category: 'decor', price: 30, when: { day: 7 }, effects: { remarks: true } },
    { id: 'bench', category: 'room', price: 60, when: { day: 8, rep: 15 }, effects: { customers: 1, remarks: true } },
    // --- the market has opened: keep what is left over
    { id: 'shelf', category: 'room', price: 30, when: { day: 9, activity: 'market' }, effects: { carry: { goods: 'all', cap: 3 } } },
    { id: 'scales', category: 'tools', price: 45, when: { day: 10 }, effects: { coinExact: 1 } },
    // --- deliveries have opened
    { id: 'chime', category: 'decor', price: 25, when: { day: 11 }, effects: { remarks: true } },
    { id: 'cart', category: 'outside', price: 60, when: { day: 11, activity: 'delivery' }, effects: { deliveryDaily: true } },
    { id: 'lantern', category: 'outside', price: 50, when: { day: 13, rep: 30 }, effects: { repReturning: 1, remarks: true } },
    { id: 'magnifier', category: 'notebook', price: 40, when: { day: 14 }, effects: { notebook: 'closer' } },
    { id: 'icebox', category: 'room', price: 75, when: { day: 16, stage: 9, activity: 'market' }, effects: { carry: { goods: 'fresh', cap: 12 }, coinCold: 1 } },
    { id: 'cellar', category: 'room', price: 85, when: { day: 18, requires: ['shelf'] }, effects: { carry: { goods: 'dry', cap: 12 } } },
    // --- later: the big ones
    { id: 'paint', category: 'decor', price: 70, when: { day: 21 }, effects: { remarks: true } },
    { id: 'catbed', category: 'decor', price: 35, when: { day: 24 }, effects: { remarks: true } },
    { id: 'picture', category: 'decor', price: 50, when: { day: 27 }, effects: { remarks: true } },
    { id: 'bicycle', category: 'outside', price: 100, when: { day: 30, requires: ['cart'] }, effects: { tip: 4 } },
  ],
  dryGoods: ['ginger', 'honey', 'sugar', 'red_dates', 'chrysanthemum', 'rose', 'coffee'],
  remarkChance: { fresh: 0.7, usual: 0.2 },
  keepForMarket: 20,
};
