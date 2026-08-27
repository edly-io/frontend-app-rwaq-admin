/**
 * API seam for the Admin Course Reports feature.
 *
 * This is the only file that calls getAuthenticatedHttpClient directly for
 * reports.  All components use reportsHooks.ts; none import from here directly.
 */
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getApiUrl } from '@src/data/utils';
import type {
  CourseReportType,
  GradingConfig,
  OrgEnrollmentSummary,
  ProgramCompletionReport,
  ReportDownloadRow,
  ReportTask,
  TriggerReportResponse,
} from './reportsTypes';

const getReportsBaseUrl = (courseId: string) => `${getApiUrl('/api/v1/admin/courses')}/${encodeURIComponent(courseId)}/reports`;
const getProgramsBaseUrl = () => getApiUrl('/api/v1/admin/programs');

// ── Trigger ───────────────────────────────────────────────────────────────────

export const triggerCourseReport = async (
  courseId: string,
  reportType: CourseReportType,
): Promise<TriggerReportResponse> => {
  const { data } = await getAuthenticatedHttpClient().post(
    `${getReportsBaseUrl(courseId)}/trigger/`,
    snakeCaseObject({ reportType }),
  );
  return camelCaseObject(data) as TriggerReportResponse;
};

// ── Per-type task list ────────────────────────────────────────────────────────

export const fetchCourseReportTasks = async (
  courseId: string,
  reportType: CourseReportType,
): Promise<ReportTask[]> => {
  const { data } = await getAuthenticatedHttpClient().get(
    `${getReportsBaseUrl(courseId)}/tasks/`,
    { params: { report_type: reportType } },
  );
  const parsed = camelCaseObject(data) as { results: ReportTask[] };
  return parsed.results;
};

// ── Unified downloads list (all types, polled) ────────────────────────────────

export const fetchCourseReportDownloads = async (
  courseId: string,
): Promise<ReportDownloadRow[]> => {
  const { data } = await getAuthenticatedHttpClient().get(
    `${getReportsBaseUrl(courseId)}/downloads/`,
  );
  const parsed = camelCaseObject(data) as { results: ReportDownloadRow[] };
  return parsed.results;
};

// ── Grading config ────────────────────────────────────────────────────────────

export const fetchGradingConfig = async (courseId: string): Promise<GradingConfig> => {
  const { data } = await getAuthenticatedHttpClient().get(
    `${getReportsBaseUrl(courseId)}/grading-config/`,
  );
  return camelCaseObject(data) as GradingConfig;
};

// ── Org enrollment summary ────────────────────────────────────────────────────

export const fetchOrgEnrollmentSummary = async (
  courseId: string,
  params: { org?: string; dateFrom?: string } = {},
): Promise<OrgEnrollmentSummary> => {
  const { data } = await getAuthenticatedHttpClient().get(
    `${getReportsBaseUrl(courseId)}/org-enrollment-summary/`,
    { params: snakeCaseObject(params) },
  );
  return camelCaseObject(data) as OrgEnrollmentSummary;
};

// ── Program completion ────────────────────────────────────────────────────────

export const fetchProgramCompletionReport = async (
  programUuid: string,
): Promise<ProgramCompletionReport> => {
  const { data } = await getAuthenticatedHttpClient().get(
    `${getProgramsBaseUrl()}/${programUuid}/reports/completion/`,
  );
  return camelCaseObject(data) as ProgramCompletionReport;
};
