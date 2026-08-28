/**
 * React Query hooks for the Admin Course Reports feature.
 * Components import from here only — never from reportsApi.ts directly.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appId } from '@src/constants';
import type { CourseReportType, ReportDownloadRow } from './reportsTypes';
import {
  fetchCourseCertificates,
  fetchCourseReportDownloads,
  fetchCourseReportTasks,
  fetchGradingConfig,
  fetchOrgEnrollmentSummary,
  triggerCourseReport,
} from './reportsApi';

// ── Query key factory ─────────────────────────────────────────────────────────

export const reportQueryKeys = {
  all: [appId, 'reports'] as const,
  courseDownloads: (courseId: string) => (
    [...reportQueryKeys.all, 'course-downloads', courseId] as const
  ),
  courseTasks: (courseId: string, reportType: CourseReportType) => (
    [...reportQueryKeys.all, 'course-tasks', courseId, reportType] as const
  ),
  courseGradingConfig: (courseId: string) => (
    [...reportQueryKeys.all, 'grading-config', courseId] as const
  ),
  courseOrgSummary: (courseId: string, org?: string, dateFrom?: string) => (
    [...reportQueryKeys.all, 'org-summary', courseId, org, dateFrom] as const
  ),
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const hasInProgressDownload = (rows: ReportDownloadRow[] | undefined): boolean => {
  if (!rows) { return false; }
  return rows.some((r) => r.state === 'QUEUING' || r.state === 'IN_PROGRESS');
};

// ── Unified downloads (polls at 10 s while any task is running) ───────────────

export const useCourseReportDownloads = (courseId: string, enabled = true) => useQuery({
  queryKey: reportQueryKeys.courseDownloads(courseId),
  queryFn: () => fetchCourseReportDownloads(courseId),
  enabled: enabled && !!courseId,
  refetchInterval: (query) => (hasInProgressDownload(query.state.data) ? 10_000 : false),
  staleTime: 0,
});

// ── Per-type task list ────────────────────────────────────────────────────────

export const useCourseReportTasks = (
  courseId: string,
  reportType: CourseReportType,
  enabled = true,
) => useQuery({
  queryKey: reportQueryKeys.courseTasks(courseId, reportType),
  queryFn: () => fetchCourseReportTasks(courseId, reportType),
  enabled: enabled && !!courseId,
  staleTime: 0,
});

// ── Grading config ────────────────────────────────────────────────────────────

export const useCourseGradingConfig = (courseId: string, enabled = true) => useQuery({
  queryKey: reportQueryKeys.courseGradingConfig(courseId),
  queryFn: () => fetchGradingConfig(courseId),
  enabled: enabled && !!courseId,
  staleTime: 5 * 60_000,
});

// ── Org enrollment summary ────────────────────────────────────────────────────

export const useCourseOrgEnrollmentSummary = (
  courseId: string,
  params: { org?: string; dateFrom?: string } = {},
  enabled = true,
) => useQuery({
  queryKey: reportQueryKeys.courseOrgSummary(courseId, params.org, params.dateFrom),
  queryFn: () => fetchOrgEnrollmentSummary(courseId, params),
  enabled: enabled && !!courseId,
  staleTime: 5 * 60_000,
});

// ── Certificates ──────────────────────────────────────────────────────────────

export const useCourseCertificates = (courseId: string, enabled = true) => useQuery({
  queryKey: [...reportQueryKeys.all, 'certificates', courseId] as const,
  queryFn: () => fetchCourseCertificates(courseId),
  enabled: enabled && !!courseId,
  staleTime: 5 * 60_000,
});

// ── Trigger mutation ──────────────────────────────────────────────────────────

export const useTriggerCourseReport = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportType: CourseReportType) => triggerCourseReport(courseId, reportType),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: reportQueryKeys.courseDownloads(courseId),
      });
    },
  });
};
