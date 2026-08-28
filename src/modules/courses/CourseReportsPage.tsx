/**
 * CourseReportsPage — reports hub for a single course.
 *
 *   1. Generate Reports — async trigger cards (11 report types)
 *   2. Reports Available for Download — unified polled table (10 s while in-progress)
 */
import React, { useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import {
  Alert, Badge, Button, Spinner,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
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
import { courseReportsMessages as messages } from './messages';

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
  downloads,
}: {
  def: ReportDef;
  courseId: string;
  downloads: ReportDownloadRow[] | undefined;
}) => {
  const intl = useIntl();
  const { mutate, isPending } = useTriggerCourseReport(courseId);
  const [trackedTaskId, setTrackedTaskId] = useState<string | null>(null);
  const [triggerError, setTriggerError] = useState<string | null>(null);

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

const DownloadsTable = ({
  rows,
  isLoading,
  isError,
}: {
  rows: ReportDownloadRow[] | undefined;
  isLoading: boolean;
  isError: boolean;
}) => {
  const intl = useIntl();
  const columns = useDownloadsColumns();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('dp') || '1', 10);
  const setPage = (p: number) => setSearchParams(
    (prev) => { const next = new URLSearchParams(prev); next.set('dp', String(p)); return next; },
    { replace: true },
  );

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
  const {
    data: downloads,
    isLoading: downloadsLoading,
    isError: downloadsError,
  } = useCourseReportDownloads(courseId, !!courseId);

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
          <ReportTriggerRow key={def.type} def={def} courseId={courseId} downloads={downloads} />
        ))}
      </div>

      {/* Reports Available for Download */}
      <div className="rwaq-card">
        <h2 className="rwaq-section-title mb-1">{intl.formatMessage(messages.downloadsSectionTitle)}</h2>
        <p className="text-muted small mb-3">
          {intl.formatMessage(messages.downloadsSectionBody)}
        </p>
        <DownloadsTable rows={downloads} isLoading={downloadsLoading} isError={downloadsError} />
      </div>
    </div>
  );
};

export default CourseReportsPage;
