/**
 * Figures of the user page strip that are worked out from the enrollments list itself, so they follow an
 * enroll, a mode change or an unenroll at once.
 */
import type { SeriesPoint } from '@src/components/stats/format';
import type { EnrollmentProgress, UserEnrollment } from './data/types';

export interface EnrollmentTiles {
  active: number;
  total: number;
  /** null when a status of an active course could not be read. */
  passed: number | null;
  inProgress: number | null;
  notStarted: number | null;
}

const countStatus = (active: UserEnrollment[], status: string): number | null => (
  active.some((row) => !row.status) ? null : active.filter((row) => row.status === status).length
);

/** Tiles of the enrollments list. Unreadable sources give null, never 0. */
export const enrollmentTiles = (rows: UserEnrollment[]): EnrollmentTiles => {
  const active = rows.filter((row) => row.isActive);
  return {
    active: active.length,
    total: rows.length,
    passed: countStatus(active, 'passed'),
    inProgress: countStatus(active, 'in_progress'),
    notStarted: countStatus(active, 'not_started'),
  };
};

/**
 * The mean progress over all active courses, rounded to a whole percent.
 * null when a course is unavailable or there are no active courses.
 */
export const overallCompletion = (
  rows: UserEnrollment[],
  progress: EnrollmentProgress[] | undefined,
): number | null => {
  const byCourse = new Map((progress ?? []).map((item) => [item.courseId, item.progressPercent]));
  const values = rows
    .filter((row) => row.isActive)
    .map((row) => byCourse.get(row.courseId));
  if (values.length === 0 || values.some((value) => typeof value !== 'number')) { return null; }
  const available = values as number[];
  return Math.round(available.reduce((sum, value) => sum + value, 0) / available.length);
};

/** Active enrollments per mode, biggest first. */
export const modeCounts = (rows: UserEnrollment[]): { mode: string; count: number }[] => {
  const counts = new Map<string, number>();
  rows.filter((row) => row.isActive).forEach((row) => counts.set(row.mode, (counts.get(row.mode) ?? 0) + 1));
  return [...counts.entries()].map(([mode, count]) => ({ mode, count })).sort((a, b) => b.count - a.count);
};

/** Enrollments per month of `enrolledAt`, zero-filled over the last `months` months ending at `now`. */
export const enrollmentsByMonth = (
  rows: UserEnrollment[], now: Date, months = 12, startDate?: string, endDate?: string,
): SeriesPoint[] => {
  const key = (year: number, month: number) => `${year}-${String(month + 1).padStart(2, '0')}`;
  const counts = new Map<string, number>();
  rows.forEach((row) => {
    if (!row.enrolledAt) { return; }
    const day = row.enrolledAt.slice(0, 10);
    if ((startDate && day < startDate) || (endDate && day > endDate)) { return; }
    const date = new Date(row.enrolledAt);
    const period = key(date.getUTCFullYear(), date.getUTCMonth());
    counts.set(period, (counts.get(period) ?? 0) + 1);
  });
  const end = endDate ? new Date(`${endDate}T00:00:00Z`) : now;
  const start = startDate ? new Date(`${startDate}T00:00:00Z`) : new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth() - months + 1, 1));
  const length = Math.max(0, (end.getUTCFullYear() - start.getUTCFullYear()) * 12 + end.getUTCMonth() - start.getUTCMonth() + 1);
  return Array.from({ length }, (_unused, index) => {
    const date = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth() + index, 1));
    const period = key(date.getUTCFullYear(), date.getUTCMonth());
    return { period, value: counts.get(period) ?? 0 };
  });
};
