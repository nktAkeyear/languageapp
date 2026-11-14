import { TownHub } from '../jobs/TownHub';
import { JobScene } from '../jobs/JobScene';
import { MobileShop } from '../scene/MobileShop';
import { BenchProvider } from '../scene/workbench';
import { DeliveryScene } from '../town/DeliveryScene';
import { MarketScene } from '../town/MarketScene';
import { useGame } from '../useGame';

/** Phone layout: tall compositions of the same scenes (town, workplaces, shop, market street, delivery). */
export function MobileLayout({ onSettings }: { onSettings: () => void }) {
  const g = useGame();
  const view = g.jobs.view;
  const seg = g.segment;
  if (view === 'hub') return <TownHub onSettings={onSettings} />;
  if (view === 'job') return <JobScene onSettings={onSettings} />;
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
