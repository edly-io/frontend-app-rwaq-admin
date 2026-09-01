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

const analyticsQueryKeys = {
  all: [appId, 'analytics'] as const,
  summary: (params: AnalyticsParams) => [...analyticsQueryKeys.all, 'summary', params] as const,
  trends: (params: AnalyticsParams) => [...analyticsQueryKeys.all, 'trends', params] as const,
  breakdowns: (params: AnalyticsParams) => [...analyticsQueryKeys.all, 'breakdowns', params] as const,
};

// Analytics data is already cached server-side for 60 s and stamped with
// generatedAt. Setting staleTime: 0 means React Query always refetches on
// window focus or component mount, so the UI picks up the latest backend
// snapshot without an extra layer of client-side staleness on top.
const ANALYTICS_QUERY_OPTIONS = { staleTime: 0 } as const;

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
