/**
 * useStatsRefresh — the refresh button of a stats strip.
 *
 * Fetches every query of the strip again with the cache bypass, then writes all the answers into the
 * query cache together, so the tiles and charts of the strip change at the same moment. The ref guard
 * stops a second click that arrives before the first re-render from sending the requests twice.
 */
import { useCallback, useRef, useState } from 'react';
import { QueryKey, useQueryClient } from '@tanstack/react-query';

export interface RefreshEntry {
  queryKey: QueryKey;
  /** Fetches the payload with the cache bypass (`force_refresh=1`). */
  fetch: () => Promise<unknown>;
}

const useStatsRefresh = () => {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasFailed, setHasFailed] = useState(false);
  const inFlight = useRef(false);

  const refresh = useCallback(async (entries: RefreshEntry[]) => {
    if (inFlight.current) { return; }
    inFlight.current = true;
    setIsRefreshing(true);
    setHasFailed(false);
    try {
      const fresh = await Promise.all(entries.map((entry) => entry.fetch()));
      entries.forEach((entry, index) => queryClient.setQueryData(entry.queryKey, fresh[index]));
    } catch {
      setHasFailed(true);
    } finally {
      inFlight.current = false;
      setIsRefreshing(false);
    }
  }, [queryClient]);

  return { isRefreshing, hasFailed, refresh };
};

export default useStatsRefresh;
