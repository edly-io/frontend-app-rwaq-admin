/**
 * Types for the Admin Course and Program Reports feature.
 */

export type CourseReportType =
  | 'grade_csv'
  | 'problem_grade'
  | 'profile_info'
  | 'may_enroll'
  | 'inactive_learner';

export type TaskState = 'QUEUING' | 'IN_PROGRESS' | 'SUCCESS' | 'FAILURE' | 'REVOKED';

export interface ReportTask {
  taskId: string;
  state: TaskState;
  created: string;
  modified: string | null;
  downloadUrl: string | null;
  succeeded: number | null;
  failed: number | null;
  total: number | null;
}

export interface ReportTasksResponse {
  results: ReportTask[];
}

export interface ReportDownloadRow {
  taskId: string;
  reportType: CourseReportType;
  reportLabel: string;
  state: TaskState;
  created: string;
  modified: string | null;
  downloadUrl: string | null;
  succeeded: number | null;
  total: number | null;
}

export interface ReportDownloadsResponse {
  results: ReportDownloadRow[];
}

export interface TriggerReportResponse {
  taskId: string;
  reportType: CourseReportType;
}

export interface GradingConfigEntry {
  type: string;
  minCount: number;
  dropCount: number;
  weight: number;
  shortLabel: string;
}

export interface GradingConfig {
  courseId: string;
  grader: GradingConfigEntry[];
  gradeCutoffs: Record<string, number>;
}

export interface OrgEnrollmentSummary {
  org: string;
  courseId: string;
  dateFrom: string | null;
  totalActiveEnrollments: number;
  byMode: Record<string, number>;
  totalCoursesInOrg: number;
}

export interface ProgramCompletionReport {
  programKey: string;
  programName: string;
  totalLearners: number;
  numCourses: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionRate: number;
  note?: string;
}
