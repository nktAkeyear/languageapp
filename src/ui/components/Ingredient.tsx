import type { IngredientId } from '../../core/types';
import { useGame } from '../useGame';

export function IngredientIcon({ id, size = 40 }: { id: IngredientId; size?: number }) {
  const { data } = useGame();
  const def = data?.ing.get(id);
  if (!def) return null;
  if ('emoji' in def.icon)
    return (
      <span className="ing-icon" style={{ fontSize: size * 0.8, width: size, height: size }} aria-hidden>
        {def.icon.emoji}
      </span>
    );
  return <span className="ing-icon" style={{ width: size, height: size }} aria-hidden dangerouslySetInnerHTML={{ __html: def.icon.svg }} />;
}
