/**
 * Dashboard TanStack Query hooks.
 * Components import from this file only — never from api.ts directly.
 */
import { useQuery } from '@tanstack/react-query';
import { appId } from '@src/constants';
import { getDashboardCharts, getDashboardKpis } from './api';

// ── Query key factory ─────────────────────────────────────────────────────────

const dashboardQueryKeys = {
  all: [appId, 'dashboard'] as const,
  kpis: () => [...dashboardQueryKeys.all, 'kpis'] as const,
  charts: () => [...dashboardQueryKeys.all, 'charts'] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

/** KPI summary cards (placeholder until backend lands). */
export const useDashboardKpis = () => useQuery({
  queryKey: dashboardQueryKeys.kpis(),
  queryFn: getDashboardKpis,
  staleTime: 5 * 60 * 1000, // 5 minutes
});

/** Chart datasets (placeholder until backend lands). */
export const useDashboardCharts = () => useQuery({
  queryKey: dashboardQueryKeys.charts(),
  queryFn: getDashboardCharts,
  staleTime: 5 * 60 * 1000,
});
