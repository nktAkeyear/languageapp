import { TownHub } from '../jobs/TownHub';
import { JobScene } from '../jobs/JobScene';
import { ShopScene } from '../scene/ShopScene';
import { BenchProvider } from '../scene/workbench';
import { DeliveryScene } from '../town/DeliveryScene';
import { MarketScene } from '../town/MarketScene';
import { useGame } from '../useGame';

/**
 * PC layout: every place is a drawn scene on a stage scaled to the window — the town (hub) and the
 * workplaces of the jobs, and the tea house's own day (market → shop → delivery).
 */
export function DesktopLayout({ onSettings }: { onSettings: () => void }) {
  const g = useGame();
  const view = g.jobs.view;
  return (
    <div className="desk" data-segment={view === 'teahouse' ? g.segment : view}>
      {view === 'hub' ? (
        <TownHub onSettings={onSettings} />
      ) : view === 'job' ? (
        <JobScene onSettings={onSettings} />
      ) : g.segment === 'shop' ? (
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
