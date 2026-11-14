import type { GameData } from '../../core/gamedata';
import type { Story } from '../../story/text';
import { lookFor, type Look } from '../art/customer';

export interface Person {
  name: string;
  /** Drawn look; null for someone who never appears (the predecessor). */
  look: Look | null;
}

/** A story character as drawn and named in the scene (regulars are customers with fixed looks). */
export function personOf(data: GameData, story: Story, id: string): Person {
  const ch = story.shared.characters.find((c) => c.id === id);
  const cust = ch?.customer ? data.content.customers.find((c) => c.id === ch.customer) : undefined;
  if (cust) return { name: cust.name, look: lookFor(cust.id, cust.avatar) };
  const t = story.text.characters[id];
  const name = t?.name ?? id;
  if (id === 'ada') return { name, look: null };
  return { name, look: lookFor(id, t?.avatar ?? ch?.avatar ?? '🙂') };
}
