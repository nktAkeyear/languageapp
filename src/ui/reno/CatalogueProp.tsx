import { CatalogueProp } from '../art/reno';
import { sfx } from '../sound';
import { useUi } from '../uiState';
import { useReno } from './useReno';

/** The catalogue lying on the counter (shown once its first entries have appeared). */
export function CatalogueButton({ className = '' }: { className?: string }) {
  const ui = useUi();
  const r = useReno();
  if (!r.open) return null;
  const glow = r.news > 0;
  return (
    <button
      type="button"
      className={`catalogue-prop ${glow ? 'glowing' : ''} ${className}`}
      onClick={() => {
        sfx('paper');
        ui.openCatalogue();
      }}
      aria-label={glow ? '改装のカタログを開く（新しい品がある）' : '改装のカタログを開く'}
      data-testid="open-catalogue"
    >
      <CatalogueProp glow={glow} />
      <span className="desk-tag">カタログ</span>
    </button>
  );
}
