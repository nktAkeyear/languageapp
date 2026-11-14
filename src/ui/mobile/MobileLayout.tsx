import { MobileShop } from '../scene/MobileShop';
import { BenchProvider } from '../scene/workbench';
import { DeliveryScene } from '../town/DeliveryScene';
import { MarketScene } from '../town/MarketScene';
import { useGame } from '../useGame';

/** Phone layout: tall compositions of the same scenes (shop, market street, delivery). */
export function MobileLayout({ onSettings }: { onSettings: () => void }) {
  const seg = useGame().segment;
  return seg === 'shop' ? (
    <BenchProvider>
      <MobileShop onSettings={onSettings} />
    </BenchProvider>
  ) : seg === 'market' ? (
    <MarketScene onSettings={onSettings} />
  ) : (
    <DeliveryScene onSettings={onSettings} />
  );
}
