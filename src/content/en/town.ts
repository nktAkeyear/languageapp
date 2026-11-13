import type { TownContent } from '../../core/townTypes';
import { DELIVERY } from './delivery';
import { TOWN_LEXICON, TOWN_PAGES } from './lexicon.town';
import { MARKET, NUMBER_TEXT } from './market';

/** English town content (market + deliveries). Merged into the language content by src/content/index.ts. */
const town: TownContent = {
  lexicon: TOWN_LEXICON,
  verificationPages: TOWN_PAGES,
  numberText: NUMBER_TEXT,
  colourWords: { red: 'red', yellow: 'yellow', blue: 'blue', green: 'green' },
  market: MARKET,
  delivery: DELIVERY,
};

export default town;
