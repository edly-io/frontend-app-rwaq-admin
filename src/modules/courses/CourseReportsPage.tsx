/**
 * CourseReportsPage — reports hub for a single course.
 *
 *   1. Generate Reports — async trigger cards (11 report types)
 *   2. Reports Available for Download — unified polled table (10 s while in-progress)
 */
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert, Badge, Button, Spinner,
} from '@openedx/paragon';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import { useCourse } from './data/hooks';
import type {
  CourseReportType, ReportDownloadRow, TaskState,
} from './data/reportsTypes';
import {
  useCourseReportDownloads,
  useTriggerCourseReport,
} from './data/reportsHooks';

// ── i18n messages ─────────────────────────────────────────────────────────────

const messages = defineMessages({
  // Page chrome
  breadcrumbCourses: { id: 'rwaq.admin.courseReports.breadcrumb.courses', defaultMessage: 'Courses' },
  pageTitle: { id: 'rwaq.admin.courseReports.pageTitle', defaultMessage: 'Reports' },
  generateSectionTitle: { id: 'rwaq.admin.courseReports.generateSection.title', defaultMessage: 'Generate Reports' },
  generateSectionBody: {
    id: 'rwaq.admin.courseReports.generateSection.body',
    defaultMessage: 'Click Generate next to a report type to queue an async task. Completed files appear in the Reports Available for Download section below.',
  },
  downloadsSectionTitle: { id: 'rwaq.admin.courseReports.downloadsSection.title', defaultMessage: 'Reports Available for Download' },
  downloadsSectionBody: {
    id: 'rwaq.admin.courseReports.downloadsSection.body',
    defaultMessage: 'Auto-refreshes every 10 s while a report is processing. Download links expire after 5 minutes — regenerate if a link stops working.',
  },
  // Buttons / actions
  btnGenerate: { id: 'rwaq.admin.courseReports.btn.generate', defaultMessage: 'Generate' },
  btnDownload: { id: 'rwaq.admin.courseReports.btn.download', defaultMessage: 'Download' },
  btnReGenerate: { id: 'rwaq.admin.courseReports.btn.reGenerate', defaultMessage: 'Re-generate' },
  btnRetry: { id: 'rwaq.admin.courseReports.btn.retry', defaultMessage: 'Retry' },
  // Status text
  statusQueued: { id: 'rwaq.admin.courseReports.status.queued', defaultMessage: 'Queued — waiting to start…' },
  statusGenerating: { id: 'rwaq.admin.courseReports.status.generating', defaultMessage: 'Generating…{progress}' },
  statusFailed: { id: 'rwaq.admin.courseReports.status.failed', defaultMessage: 'Report generation failed. Click Retry to try again.' },
  // Error messages
  errorLoadReports: { id: 'rwaq.admin.courseReports.error.loadReports', defaultMessage: 'Could not load available reports.' },
  errorTriggerFallback: { id: 'rwaq.admin.courseReports.error.triggerFallback', defaultMessage: 'Failed to trigger report.' },
  // Screen reader
  srGeneratingReport: { id: 'rwaq.admin.courseReports.sr.generatingReport', defaultMessage: 'Generating report' },
  srLoadingCourse: { id: 'rwaq.admin.courseReports.sr.loadingCourse', defaultMessage: 'Loading course' },
  // Table columns
  colReportType: { id: 'rwaq.admin.courseReports.col.reportType', defaultMessage: 'Report Type' },
  colStatus: { id: 'rwaq.admin.courseReports.col.status', defaultMessage: 'Status' },
  colGenerated: { id: 'rwaq.admin.courseReports.col.generated', defaultMessage: 'Generated' },
  colElapsed: { id: 'rwaq.admin.courseReports.col.elapsed', defaultMessage: 'Elapsed' },
  colProgress: { id: 'rwaq.admin.courseReports.col.progress', defaultMessage: 'Progress' },
  colDownload: { id: 'rwaq.admin.courseReports.col.download', defaultMessage: 'Download' },
  // State labels
  stateQueuing: { id: 'rwaq.admin.courseReports.state.queuing', defaultMessage: 'Queuing' },
  stateInProgress: { id: 'rwaq.admin.courseReports.state.inProgress', defaultMessage: 'In Progress' },
  stateComplete: { id: 'rwaq.admin.courseReports.state.complete', defaultMessage: 'Complete' },
  stateFailure: { id: 'rwaq.admin.courseReports.state.failure', defaultMessage: 'Failed' },
  stateRevoked: { id: 'rwaq.admin.courseReports.state.revoked', defaultMessage: 'Revoked' },
  // Report definitions
  reportGradeLabel: { id: 'rwaq.admin.courseReports.report.grade.label', defaultMessage: 'Grade Report' },
  reportGradeDesc: {
    id: 'rwaq.admin.courseReports.report.grade.desc',
    defaultMessage: 'Generates a CSV of current student grades. Each row contains student ID, email, username, cumulative grade, per-assignment scores, enrollment track, verification status, and certificate eligibility/delivery status.',
  },
  reportProblemGradeLabel: { id: 'rwaq.admin.courseReports.report.problemGrade.label', defaultMessage: 'Problem Grade Report' },
  reportProblemGradeDesc: {
    id: 'rwaq.admin.courseReports.report.problemGrade.desc',
    defaultMessage: 'Generates a CSV with per-problem scores for every student. Useful for identifying which specific problems have low scores or high failure rates.',
  },
  reportProfileInfoLabel: { id: 'rwaq.admin.courseReports.report.profileInfo.label', defaultMessage: 'Profile Information' },
  reportProfileInfoDesc: {
    id: 'rwaq.admin.courseReports.report.profileInfo.desc',
    defaultMessage: 'Generates a CSV of enrolled student profile data including username, name, email, language, location, year of birth, gender, education level, mailing address, goals, enrollment mode, account activation status, and enrollment date.',
  },
  reportMayEnrollLabel: { id: 'rwaq.admin.courseReports.report.mayEnroll.label', defaultMessage: 'Learners Who Can Enroll' },
  reportMayEnrollDesc: {
    id: 'rwaq.admin.courseReports.report.mayEnroll.desc',
    defaultMessage: "Generates a CSV of users who are in the course's invitation list but have not yet enrolled, useful for targeted outreach.",
  },
  reportInactiveLearnerLabel: { id: 'rwaq.admin.courseReports.report.inactiveLearner.label', defaultMessage: 'Learners, Account Not Activated' },
  reportInactiveLearnerDesc: {
    id: 'rwaq.admin.courseReports.report.inactiveLearner.desc',
    defaultMessage: 'Generates a CSV of enrolled learners whose accounts have never been activated (email not confirmed), so they cannot access course content.',
  },
  reportSurveyLabel: { id: 'rwaq.admin.courseReports.report.survey.label', defaultMessage: 'Survey Results' },
  reportSurveyDesc: {
    id: 'rwaq.admin.courseReports.report.survey.desc',
    defaultMessage: 'Generates a CSV of responses from the course survey module. Columns are User ID, User Name, Email, and one column per survey field answered.',
  },
  reportProctoredExamLabel: { id: 'rwaq.admin.courseReports.report.pf.label', defaultMessage: 'Proctored Exam Results' },
  reportProctoredExamDesc: {
    id: 'rwaq.admin.courseReports.report.pf.desc',
    defaultMessage: 'Generates a CSV of all proctored exam attempts, including exam name, provider, student info, attempt timing, attempt status, review status, and any reviewer comments (suspicious activity or rules violations).',
  },
  reportOraDataLabel: { id: 'rwaq.admin.courseReports.report.oraData.label', defaultMessage: 'ORA Data Report' },
  reportOraDataDesc: {
    id: 'rwaq.admin.courseReports.report.oraData.desc',
    defaultMessage: 'Generates a CSV of all Open Response Assessment submissions. Columns include Submission ID, block location, question prompt, username, submission text, submission date, and attempt number.',
  },
  reportOraSummaryLabel: { id: 'rwaq.admin.courseReports.report.oraSummary.label', defaultMessage: 'ORA Summary Report' },
  reportOraSummaryDesc: {
    id: 'rwaq.admin.courseReports.report.oraSummary.desc',
    defaultMessage: 'Generates a CSV summary of ORA grading outcomes per learner per problem. Includes final scores, grader counts, and overall pass/fail determination.',
  },
  reportOraArchiveLabel: { id: 'rwaq.admin.courseReports.report.oraArchive.label', defaultMessage: 'ORA Submission Files Archive' },
  reportOraArchiveDesc: {
    id: 'rwaq.admin.courseReports.report.oraArchive.desc',
    defaultMessage: 'Generates a ZIP archive containing all ORA submission text files and any uploaded file attachments submitted by learners for this course.',
  },
  reportAnonIdsLabel: { id: 'rwaq.admin.courseReports.report.anonIds.label', defaultMessage: 'Student Anonymized IDs' },
  reportAnonIdsDesc: {
    id: 'rwaq.admin.courseReports.report.anonIds.desc',
    defaultMessage: "Generates a CSV mapping each enrolled learner's real user ID to their anonymized user ID. Used for research and analytics that require de-identified data.",
  },
});

// ── Report definitions ────────────────────────────────────────────────────────

interface ReportDef {
  type: CourseReportType;
  label: string;
  description: string;
}

const useReportDefs = (): ReportDef[] => {
  const intl = useIntl();
  return [
    { type: 'grade_csv', label: intl.formatMessage(messages.reportGradeLabel), description: intl.formatMessage(messages.reportGradeDesc) },
    { type: 'problem_grade', label: intl.formatMessage(messages.reportProblemGradeLabel), description: intl.formatMessage(messages.reportProblemGradeDesc) },
    { type: 'profile_info', label: intl.formatMessage(messages.reportProfileInfoLabel), description: intl.formatMessage(messages.reportProfileInfoDesc) },
    { type: 'may_enroll', label: intl.formatMessage(messages.reportMayEnrollLabel), description: intl.formatMessage(messages.reportMayEnrollDesc) },
    { type: 'inactive_learner', label: intl.formatMessage(messages.reportInactiveLearnerLabel), description: intl.formatMessage(messages.reportInactiveLearnerDesc) },
    { type: 'survey', label: intl.formatMessage(messages.reportSurveyLabel), description: intl.formatMessage(messages.reportSurveyDesc) },
    { type: 'proctored_exam', label: intl.formatMessage(messages.reportProctoredExamLabel), description: intl.formatMessage(messages.reportProctoredExamDesc) },
    { type: 'ora_data', label: intl.formatMessage(messages.reportOraDataLabel), description: intl.formatMessage(messages.reportOraDataDesc) },
    { type: 'ora_summary', label: intl.formatMessage(messages.reportOraSummaryLabel), description: intl.formatMessage(messages.reportOraSummaryDesc) },
    { type: 'ora_submission_archive', label: intl.formatMessage(messages.reportOraArchiveLabel), description: intl.formatMessage(messages.reportOraArchiveDesc) },
    { type: 'anon_ids', label: intl.formatMessage(messages.reportAnonIdsLabel), description: intl.formatMessage(messages.reportAnonIdsDesc) },
  ];
};

// ── State badge ───────────────────────────────────────────────────────────────

const STATE_VARIANT: Record<TaskState, string> = {
  QUEUING: 'primary',
  IN_PROGRESS: 'primary',
  SUCCESS: 'success',
  FAILURE: 'danger',
  REVOKED: 'secondary',
};

const StateBadge = ({ state }: { state: TaskState }) => {
  const intl = useIntl();
  const stateLabels: Record<TaskState, string> = {
    QUEUING: intl.formatMessage(messages.stateQueuing),
    IN_PROGRESS: intl.formatMessage(messages.stateInProgress),
    SUCCESS: intl.formatMessage(messages.stateComplete),
    FAILURE: intl.formatMessage(messages.stateFailure),
    REVOKED: intl.formatMessage(messages.stateRevoked),
  };
  return (
    <Badge variant={STATE_VARIANT[state] || 'secondary'}>
      {stateLabels[state] || state}
    </Badge>
  );
};

// ── Elapsed time helper ───────────────────────────────────────────────────────

const elapsedLabel = (created: string, modified: string | null, state: TaskState): string => {
  const end = (state === 'SUCCESS' || state === 'FAILURE' || state === 'REVOKED') && modified
    ? new Date(modified).getTime()
    : Date.now();
  const secs = Math.max(0, Math.round((end - new Date(created).getTime()) / 1000));
  if (secs < 60) { return `${secs}s`; }
  const mins = Math.floor(secs / 60);
  const rem = secs % 60;
  if (mins < 60) { return rem > 0 ? `${mins}m ${rem}s` : `${mins}m`; }
  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  return remMins > 0 ? `${hrs}h ${remMins}m` : `${hrs}h`;
};

// ── Download icon (reused in trigger row and downloads table) ─────────────────

const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="13"
    height="13"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

// ── Single report trigger row ─────────────────────────────────────────────────

const ReportTriggerRow = ({
  def,
  courseId,
}: {
  def: ReportDef;
  courseId: string;
}) => {
  const intl = useIntl();
  const { mutate, isPending } = useTriggerCourseReport(courseId);
  const [trackedTaskId, setTrackedTaskId] = useState<string | null>(null);
  const [triggerError, setTriggerError] = useState<string | null>(null);

  // Shared with DownloadsTable — TanStack Query deduplicates the network call
  const { data: downloads } = useCourseReportDownloads(courseId, !!courseId);
  const trackedTask = trackedTaskId
    ? (downloads ?? []).find((r) => r.taskId === trackedTaskId) ?? null
    : null;

  // True while mutation has resolved but the downloads list hasn't caught up yet
  const isWaitingForPoll = !isPending && trackedTaskId !== null && trackedTask === null;
  const isRunning = trackedTask?.state === 'QUEUING' || trackedTask?.state === 'IN_PROGRESS';
  const isSuccess = trackedTask?.state === 'SUCCESS';
  const isFailed = trackedTask?.state === 'FAILURE' || trackedTask?.state === 'REVOKED';

  const handleGenerate = () => {
    setTrackedTaskId(null);
    setTriggerError(null);
    mutate(def.type, {
      onSuccess: (data) => setTrackedTaskId(data.taskId),
      onError: (err) => {
        const axiosDetail = (err as { response?: { data?: { detail?: string } } })
          ?.response?.data?.detail;
        setTriggerError(axiosDetail || (err as { message?: string })?.message || intl.formatMessage(messages.errorTriggerFallback));
      },
    });
  };

  const handleReset = () => {
    setTrackedTaskId(null);
    setTriggerError(null);
  };

  // Status text shown beneath the description
  let statusText: React.ReactNode = null;
  if (triggerError) {
    statusText = <div className="text-danger small mt-1">{triggerError}</div>;
  } else if (isRunning) {
    const progress = (trackedTask?.total != null && trackedTask?.succeeded != null)
      ? ` (${trackedTask.succeeded} / ${trackedTask.total})`
      : '';
    const label = trackedTask?.state === 'QUEUING'
      ? intl.formatMessage(messages.statusQueued)
      : intl.formatMessage(messages.statusGenerating, { progress });
    statusText = <div className="text-muted small mt-1">{label}</div>;
  } else if (isFailed) {
    statusText = <div className="text-danger small mt-1">{intl.formatMessage(messages.statusFailed)}</div>;
  }

  // Action widget (right column)
  let actionWidget: React.ReactNode;

  if (isPending || isWaitingForPoll || isRunning || (isSuccess && !trackedTask?.downloadUrl)) {
    // Spinner covers: mutation in flight, waiting for first poll, task running, URL not yet ready
    actionWidget = (
      <Spinner
        animation="border"
        size="sm"
        screenReaderText={intl.formatMessage(messages.srGeneratingReport)}
        style={{ color: 'var(--pgn-color-primary-500, #0a3055)' }}
      />
    );
  } else if (isSuccess && trackedTask?.downloadUrl) {
    actionWidget = (
      <div className="d-flex flex-column align-items-center" style={{ gap: '0.3rem' }}>
        <a
          href={trackedTask.downloadUrl}
          className="btn btn-sm btn-primary d-inline-flex align-items-center"
          style={{ gap: '0.3rem', whiteSpace: 'nowrap' }}
        >
          <DownloadIcon />
          {intl.formatMessage(messages.btnDownload)}
        </a>
        <button
          type="button"
          onClick={handleReset}
          className="btn btn-link p-0"
          style={{ fontSize: '0.7rem', color: 'var(--pgn-color-text-muted, #6c757d)', lineHeight: 1.4 }}
        >
          {intl.formatMessage(messages.btnReGenerate)}
        </button>
      </div>
    );
  } else if (isFailed) {
    actionWidget = (
      <Button
        variant="outline-danger"
        size="sm"
        onClick={handleGenerate}
        style={{ whiteSpace: 'nowrap', width: '100%' }}
      >
        {intl.formatMessage(messages.btnRetry)}
      </Button>
    );
  } else {
    actionWidget = (
      <Button
        variant="outline-primary"
        size="sm"
        onClick={handleGenerate}
        style={{ whiteSpace: 'nowrap', width: '100%' }}
      >
        {intl.formatMessage(messages.btnGenerate)}
      </Button>
    );
  }

  return (
    <div
      className="py-4 border-bottom d-flex align-items-center justify-content-between"
      style={{ gap: '2rem' }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-weight-semibold" style={{ fontSize: '0.9375rem' }}>{def.label}</div>
        <div className="text-muted small mt-1" style={{ lineHeight: '1.5' }}>{def.description}</div>
        {statusText}
      </div>
      <div style={{
        flexShrink: 0,
        width: '7rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
      >
        {actionWidget}
      </div>
    </div>
  );
};

// ── Downloads table ───────────────────────────────────────────────────────────

const DOWNLOADS_PAGE_SIZE = 10;

const useDownloadsColumns = (): ColumnDef<ReportDownloadRow>[] => {
  const intl = useIntl();
  return [
    { key: 'reportLabel', label: intl.formatMessage(messages.colReportType) },
    {
      key: 'state',
      label: intl.formatMessage(messages.colStatus),
      renderCell: (value) => <StateBadge state={value as TaskState} />,
    },
    {
      key: 'created',
      label: intl.formatMessage(messages.colGenerated),
      renderCell: (value) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          {new Date(value as string).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'modified',
      label: intl.formatMessage(messages.colElapsed),
      id: 'elapsed',
      renderCell: (value, row) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {elapsedLabel(row.created, value as string | null, row.state)}
        </span>
      ),
    },
    {
      key: 'succeeded',
      label: intl.formatMessage(messages.colProgress),
      renderCell: (_value, row) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {row.total != null ? `${row.succeeded ?? 0} / ${row.total}` : '—'}
        </span>
      ),
    },
    {
      key: 'downloadUrl',
      label: intl.formatMessage(messages.colDownload),
      renderCell: (value) => (
        value ? (
          <a
            href={value as string}
            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
            style={{ gap: '0.375rem', whiteSpace: 'nowrap' }}
          >
            <DownloadIcon />
            {intl.formatMessage(messages.btnDownload)}
          </a>
        ) : (
          <span className="text-muted small">—</span>
        )
      ),
    },
  ];
};

const DownloadsTable = ({ courseId }: { courseId: string }) => {
  const intl = useIntl();
  const columns = useDownloadsColumns();
  const { data: rows, isLoading, isError } = useCourseReportDownloads(courseId);
  const [page, setPage] = useState(1);

  if (isError) {
    return <Alert variant="warning" className="mb-0">{intl.formatMessage(messages.errorLoadReports)}</Alert>;
  }

  const totalRows = rows?.length ?? 0;
  const pageCount = Math.max(1, Math.ceil(totalRows / DOWNLOADS_PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const pageRows = (rows ?? []).slice(
    (currentPage - 1) * DOWNLOADS_PAGE_SIZE,
    currentPage * DOWNLOADS_PAGE_SIZE,
  );

  return (
    <AdminDataTable
      columns={columns}
      data={pageRows}
      isLoading={isLoading}
      caption="Reports Available for Download"
      pagination={{
        currentPage,
        pageCount,
        itemCount: totalRows,
        pageSize: DOWNLOADS_PAGE_SIZE,
        onPageChange: setPage,
      }}
    />
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const CourseReportsPage = () => {
  const intl = useIntl();
  const reportDefs = useReportDefs();
  const { courseId = '' } = useParams<{ courseId: string }>();
  const { data: course, isLoading: courseLoading } = useCourse(courseId);

  if (courseLoading) {
    return (
      <div className="rwaq-page">
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" screenReaderText={intl.formatMessage(messages.srLoadingCourse)} />
        </div>
      </div>
    );
  }

  const courseName = course?.displayName || courseId;
  const courseHref = `/courses/${encodeURIComponent(courseId)}`;

  return (
    <div className="rwaq-page">
      <div className="rwaq-page-header">
        <div className="rwaq-page-header__breadcrumb">
          <Link to="/courses">{intl.formatMessage(messages.breadcrumbCourses)}</Link>
          {' / '}
          <Link to={courseHref}>{courseName}</Link>
          {' / '}
          {intl.formatMessage(messages.pageTitle)}
        </div>
        <h1 className="rwaq-page-title mt-2">{intl.formatMessage(messages.pageTitle)}</h1>
      </div>

      {/* Generate Reports */}
      <div className="rwaq-card">
        <h2 className="rwaq-section-title mb-1">{intl.formatMessage(messages.generateSectionTitle)}</h2>
        <p className="text-muted small mb-0">
          {intl.formatMessage(messages.generateSectionBody)}
        </p>
        <hr className="mt-3 mb-0" />
        {reportDefs.map((def) => (
          <ReportTriggerRow key={def.type} def={def} courseId={courseId} />
        ))}
      </div>

      {/* Reports Available for Download */}
      <div className="rwaq-card">
        <h2 className="rwaq-section-title mb-1">{intl.formatMessage(messages.downloadsSectionTitle)}</h2>
        <p className="text-muted small mb-3">
          {intl.formatMessage(messages.downloadsSectionBody)}
        </p>
        <DownloadsTable courseId={courseId} />
      </div>
    </div>
  );
};

export default CourseReportsPage;
