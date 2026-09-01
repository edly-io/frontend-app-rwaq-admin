/**
 * Dashboard analytics hooks.
 * Components import from this file only — never from api.ts directly.
 *
 * Three independent queries rather than one combined fetch, so a slow
 * aggregate cannot hold up the KPI row. The backend caches for a few minutes
 * and stamps every payload with generatedAt, so a longer staleTime here would
 * only add a second layer of staleness on top of one we already surface.
 */
import { useQuery } from '@tanstack/react-query';
import { appId } from '@src/constants';
import {
  getAnalyticsBreakdowns,
  getAnalyticsSummary,
  getAnalyticsTrends,
} from './api';
import type { AnalyticsParams } from './types';

export const analyticsQueryKeys = {
  all: [appId, 'analytics'] as const,
  summary: (params: AnalyticsParams) => [...analyticsQueryKeys.all, 'summary', params] as const,
  trends: (params: AnalyticsParams) => [...analyticsQueryKeys.all, 'trends', params] as const,
  breakdowns: (params: AnalyticsParams) => [...analyticsQueryKeys.all, 'breakdowns', params] as const,
};

// Analytics data is cached server-side for 5 min and stamped with generatedAt.
// Match the client staleTime to the backend TTL so React Query never fires an
// extra refetch that the backend will serve from cache anyway. The Refresh
// button bypasses both layers via ?force_refresh=true.
const ANALYTICS_QUERY_OPTIONS = { staleTime: 5 * 60 * 1000 } as const;

/** Headline counts for the KPI row. */
export const useAnalyticsSummary = (params: AnalyticsParams = {}) => useQuery({
  queryKey: analyticsQueryKeys.summary(params),
  queryFn: () => getAnalyticsSummary(params),
  ...ANALYTICS_QUERY_OPTIONS,
});

/** Bounded monthly series for the trend charts. */
export const useAnalyticsTrends = (params: AnalyticsParams = {}) => useQuery({
  queryKey: analyticsQueryKeys.trends(params),
  queryFn: () => getAnalyticsTrends(params),
  ...ANALYTICS_QUERY_OPTIONS,
});

/** Grouped aggregates for the breakdown cards and tables. */
export const useAnalyticsBreakdowns = (params: AnalyticsParams = {}) => useQuery({
  queryKey: analyticsQueryKeys.breakdowns(params),
  queryFn: () => getAnalyticsBreakdowns(params),
  ...ANALYTICS_QUERY_OPTIONS,
});
