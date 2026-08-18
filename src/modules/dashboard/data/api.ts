/**
 * Dashboard API — the ONLY file to change when the analytics backend is ready.
 *
 * ⚠ PLACEHOLDER DATA — Backend endpoints are NOT built yet.
 * These functions return clearly-marked mock data shaped like the real contract.
 * When the backend analytics spike (analytics-spike.md) lands, replace the
 * placeholder bodies with real getAuthenticatedHttpClient() calls.
 *
 * TODO(backend): Implement GET /rwaq/api/analytics/dashboard/kpis/
 *   Expected response: { total_learners, new_registrations_this_month,
 *     new_registrations_prev_month, total_courses, active_courses }
 *
 * TODO(backend): Implement GET /rwaq/api/analytics/dashboard/charts/
 *   Expected response: { enrollment_trend: TrendPoint[], completion_trend: TrendPoint[],
 *     course_status: CourseStatusPoint[] }
 *   (enrollment_trend and course_status from new rwaq-features MySQL aggregate;
 *    see docs/research/rwaq-admin-panel-analytics-spike.md)
 */
import type { DashboardCharts, DashboardKpis } from './types';

// ── Placeholder KPI data ───────────────────────────────────────────────────────

/**
 * TODO(backend): GET /rwaq/api/analytics/dashboard/kpis/
 * Replace with:
 *   const { data } = await getAuthenticatedHttpClient()
 *     .get(getApiUrl('/rwaq/api/analytics/dashboard/kpis/'));
 */
export const getDashboardKpis = async (): Promise<DashboardKpis> => ({
  total_learners: 0,
  new_registrations_this_month: 0,
  new_registrations_prev_month: 0,
  total_courses: 0,
  active_courses: 0,
});

// ── Placeholder chart data ────────────────────────────────────────────────────

const MONTH_LABELS = ['Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];

/**
 * TODO(backend): GET /rwaq/api/analytics/dashboard/charts/
 * Replace with:
 *   const { data } = await getAuthenticatedHttpClient()
 *     .get(getApiUrl('/rwaq/api/analytics/dashboard/charts/'));
 */
export const getDashboardCharts = async (): Promise<DashboardCharts> => ({
  enrollment_trend: MONTH_LABELS.map((name) => ({ name, value: 0 })),
  completion_trend: MONTH_LABELS.map((name) => ({ name, value: 0 })),
  course_status: [
    { name: 'Active', value: 0 },
    { name: 'Archived', value: 0 },
    { name: 'Draft', value: 0 },
  ],
});
