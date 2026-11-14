import { useMemo } from 'react';
import { arrivedToday, catalogueNews, renoView } from '../../renovation/engine';
import type { UpgradeId } from '../../renovation/types';
import { useGame } from '../useGame';

/** The renovation as the scene needs it: what is installed, what arrived today, catalogue news. */
export function useReno() {
  const { data, progress } = useGame();
  return useMemo(() => {
    const r = renoView(progress);
    const owned = new Set(Object.keys(r.owned) as UpgradeId[]);
    const fresh = new Set(progress ? arrivedToday(progress) : []);
    const news = data && progress ? catalogueNews(data, progress) : 0;
    const open = !!data?.content.renovation && !!data.shared.renovation && !!progress && (news > 0 || r.seen.length > 0 || owned.size > 0 || r.orders.length > 0);
    return { owned, fresh, news, orders: r.orders, open, has: (id: UpgradeId) => owned.has(id) };
  }, [data, progress]);
}
