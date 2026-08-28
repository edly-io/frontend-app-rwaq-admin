/**
 * Types for the Admin Course and Program Reports feature.
 */

export type CourseReportType =
  | 'grade_csv'
  | 'problem_grade'
  | 'profile_info'
  | 'may_enroll'
  | 'inactive_learner'
  | 'survey'
  | 'proctored_exam'
  | 'ora_data'
  | 'ora_summary'
  | 'ora_submission_archive'
  | 'anon_ids';

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

export interface CourseCertificate {
  username: string;
  name: string;
  email: string;
  mode: string;
  status: string;
  grade: string;
  createdDate: string | null;
  downloadUrl: string | null;
  verifyUuid: string | null;
}

export interface CourseCertificatesResponse {
  count: number;
  results: CourseCertificate[];
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
