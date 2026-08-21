/**
 * Dashboard analytics API — the ONLY file that changes when the backend evolves.
 * Components call the hooks in hooks.ts, never this file directly.
 *
 *   GET /api/v1/admin/analytics/summary/
 *   GET /api/v1/admin/analytics/trends/?months=12
 *   GET /api/v1/admin/analytics/breakdowns/
 *
 * Three calls rather than one, matching the backend's split by query cost: the
 * KPI row renders as soon as the cheap counts land instead of waiting on the
 * grouped aggregates.
 *
 * Host: Studio (CMS), matching the users and organizations modules.
 * Authentication: Global Staff (IsGlobalStaff on every endpoint).
 * Case: snake_case on the wire, camelCase in the app.
 */
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getStudioApiUrl } from '@src/data/utils';
import type {
  AnalyticsBreakdowns,
  AnalyticsParams,
  AnalyticsSummary,
  AnalyticsTrends,
} from './types';

const getAnalyticsBaseUrl = () => getStudioApiUrl('/api/v1/admin/analytics');

/** GET summary/ — headline counts. */
export const getAnalyticsSummary = async (
  params: AnalyticsParams = {},
): Promise<AnalyticsSummary> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getAnalyticsBaseUrl()}/summary/`, {
    params: snakeCaseObject(params),
  });
  return camelCaseObject(data) as AnalyticsSummary;
};

/** GET trends/ — bounded monthly series. */
export const getAnalyticsTrends = async (
  params: AnalyticsParams = {},
): Promise<AnalyticsTrends> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getAnalyticsBaseUrl()}/trends/`, {
    params: snakeCaseObject(params),
  });
  return camelCaseObject(data) as AnalyticsTrends;
};

/** GET breakdowns/ — grouped aggregates. */
export const getAnalyticsBreakdowns = async (
  params: AnalyticsParams = {},
): Promise<AnalyticsBreakdowns> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getAnalyticsBaseUrl()}/breakdowns/`, {
    params: snakeCaseObject(params),
  });
  return camelCaseObject(data) as AnalyticsBreakdowns;
};
