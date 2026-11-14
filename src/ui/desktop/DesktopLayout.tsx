import { ShopScene } from '../scene/ShopScene';
import { BenchProvider } from '../scene/workbench';
import { DeliveryScene } from '../town/DeliveryScene';
import { MarketScene } from '../town/MarketScene';
import { useGame } from '../useGame';

/** PC layout: every segment of the day is a drawn scene on a 1600×1000 stage scaled to the window. */
export function DesktopLayout({ onSettings }: { onSettings: () => void }) {
  const g = useGame();
  return (
    <div className="desk" data-segment={g.segment}>
      {g.segment === 'shop' ? (
        <BenchProvider>
          <ShopScene onSettings={onSettings} />
        </BenchProvider>
      ) : g.segment === 'market' ? (
        <MarketScene onSettings={onSettings} />
      ) : (
        <DeliveryScene onSettings={onSettings} />
      )}
    </div>
  );
}
