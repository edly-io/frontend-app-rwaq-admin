/**
 * TypeScript types for the Admin Program Reports feature.
 *
 * Wire format from the backend is snake_case; camelCaseObject() in api.ts
 * converts all fields before they reach these types.
 */

export type ProgramReportStatus = 'pending' | 'in_progress' | 'complete' | 'failed';
export type ProgramReportType = 'enrollment_progress' | 'completion_summary';

export interface ProgramReportTask {
  id: string;
  reportType: ProgramReportType;
  /** Human-readable display label e.g. "Enrollment & Progress" */
  reportTypeDisplay: string;
  status: ProgramReportStatus;
  /** ISO 8601 datetime string */
  created: string;
  /** ISO 8601 datetime string when the task completed (or null if not yet terminal) */
  completedAt: string | null;
  /** Whole seconds between created and completedAt; null when still pending/in_progress */
  elapsedSeconds: number | null;
  progressCurrent: number;
  /** 0 means indeterminate — the frontend renders '—' */
  progressTotal: number;
  /** Pre-signed S3 URL valid for 1 hour, re-generated on every task-list response.
   *  Null when status is not complete. */
  downloadUrl: string | null;
}

export interface ProgramReportTasksPage {
  results: ProgramReportTask[];
  pagination: {
    count: number;
    numPages: number;
    next: string | null;
    previous: string | null;
  };
}

export interface TriggerProgramReportResponse {
  id: string;
  reportType: ProgramReportType;
  /** Always 'pending' for a freshly created task */
  status: 'pending';
}
