/**
 * Presentation state of the story layer (not saved): the document box (open / which paper is
 * being read) and the "hold" that keeps a regular's scene back until the player has read the
 * reaction in the shop (or at the door) and asks to hear more.
 */
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import type { LangProgress } from '../../core/save';
import { currentSegment } from '../../activities/day';
import { useGame } from '../useGame';

export interface StoryUiApi {
  box: boolean;
  /** Document being read from the box / the window sill. */
  reading: string | null;
  openBox(): void;
  openDoc(id: string): void;
  closeDoc(): void;
  closeBox(): void;
  released: string | null;
  release(key: string): void;
}

const Ctx = createContext<StoryUiApi | null>(null);

export function useStoryUi(): StoryUiApi {
  const s = useContext(Ctx);
  if (!s) throw new Error('StoryUiProvider missing');
  return s;
}

export function StoryUiProvider({ children }: { children: ReactNode }) {
  const [box, setBox] = useState(false);
  const [reading, setReading] = useState<string | null>(null);
  const [released, setReleased] = useState<string | null>(null);
  const api = useMemo<StoryUiApi>(
    () => ({
      box,
      reading,
      openBox: () => setBox(true),
      openDoc: (id) => setReading(id),
      closeDoc: () => setReading(null),
      closeBox: () => {
        setBox(false);
        setReading(null);
      },
      released,
      release: setReleased,
    }),
    [box, reading, released],
  );
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

/** While the customer / recipient is reacting, story cards wait for the player (key of that moment). */
export function holdKeyOf(p: LangProgress | null): string | null {
  if (!p) return null;
  const seg = currentSegment(p);
  if (seg === 'shop' && p.today?.phase === 'reaction') return `shop:${p.day}:${p.today.index}`;
  if (seg === 'delivery' && p.townDay?.delivery?.phase === 'result') return `delivery:${p.day}`;
  return null;
}

/** Is a regular's scene waiting behind the current reaction? */
export function useStoryHold(): { held: boolean; release(): void } {
  const g = useGame();
  const su = useStoryUi();
  const p = g.progress;
  const key = holdKeyOf(p);
  const cards = p?.story?.cards ?? [];
  const held = !!key && cards.some((c) => !c.deferred) && !cards.some((c) => c.kind === 'ledger') && su.released !== key;
  return { held, release: () => key && su.release(key) };
}
