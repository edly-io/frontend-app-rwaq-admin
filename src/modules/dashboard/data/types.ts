// ── Dashboard API types ────────────────────────────────────────────────────

/** KPI summary — returned by the planned analytics endpoint */
export interface DashboardKpis {
  total_learners: number;
  new_registrations_this_month: number;
  new_registrations_prev_month: number;
  total_courses: number;
  active_courses: number;
}

/** Single time-series data point (index signature required for ChartDataPoint compat) */
export interface TrendPoint {
  /** e.g. "Jan 2026", "2026-01", etc. */
  name: string;
  value: number;
  [key: string]: string | number;
}

/** Course status distribution (for donut/bar chart) */
export interface CourseStatusPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}

/** Dashboard chart data */
export interface DashboardCharts {
  enrollment_trend: TrendPoint[];
  completion_trend: TrendPoint[];
  course_status: CourseStatusPoint[];
}
