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
import messages from './messages';

// ── Report definitions ────────────────────────────────────────────────────────

interface ReportDef {
  type: CourseReportType;
  labelMsgKey: keyof typeof messages;
  descMsgKey: keyof typeof messages;
}

const REPORT_DEFS: ReportDef[] = [
  { type: 'grade_csv', labelMsgKey: 'reportLabelGradeCsv', descMsgKey: 'reportDescGradeCsv' },
  { type: 'problem_grade', labelMsgKey: 'reportLabelProblemGrade', descMsgKey: 'reportDescProblemGrade' },
  { type: 'profile_info', labelMsgKey: 'reportLabelProfileInfo', descMsgKey: 'reportDescProfileInfo' },
  { type: 'may_enroll', labelMsgKey: 'reportLabelMayEnroll', descMsgKey: 'reportDescMayEnroll' },
  { type: 'inactive_learner', labelMsgKey: 'reportLabelInactiveLearner', descMsgKey: 'reportDescInactiveLearner' },
  { type: 'survey', labelMsgKey: 'reportLabelSurvey', descMsgKey: 'reportDescSurvey' },
  { type: 'proctored_exam', labelMsgKey: 'reportLabelProctoredExam', descMsgKey: 'reportDescProctoredExam' },
  { type: 'ora_data', labelMsgKey: 'reportLabelOraData', descMsgKey: 'reportDescOraData' },
  { type: 'ora_summary', labelMsgKey: 'reportLabelOraSummary', descMsgKey: 'reportDescOraSummary' },
  {
    type: 'ora_submission_archive',
    labelMsgKey: 'reportLabelOraSubmissionArchive',
    descMsgKey: 'reportDescOraSubmissionArchive',
  },
];

// ── State badge ───────────────────────────────────────────────────────────────

const STATE_VARIANT: Record<TaskState, string> = {
  QUEUING: 'primary',
  IN_PROGRESS: 'primary',
  SUCCESS: 'success',
  FAILURE: 'danger',
  REVOKED: 'secondary',
};

const StateBadge = ({ state }: { state: TaskState }) => {
  const { formatMessage } = useIntl();

  const STATE_LABEL: Record<TaskState, string> = {
    QUEUING: formatMessage(messages.reportsStateQueuing),
    IN_PROGRESS: formatMessage(messages.reportsStateInProgress),
    SUCCESS: formatMessage(messages.reportsStateSuccess),
    FAILURE: formatMessage(messages.reportsStateFailure),
    REVOKED: formatMessage(messages.reportsStateRevoked),
  };

  return (
    <Badge variant={STATE_VARIANT[state] || 'secondary'}>
      {STATE_LABEL[state] || state}
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
  const { formatMessage } = useIntl();
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
      onError: (err) => setTriggerError(
        (err as { message?: string })?.message || formatMessage(messages.reportsStatusFailed),
      ),
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
      ? formatMessage(messages.reportsStatusQueued)
      : formatMessage(messages.reportsStatusGenerating, { progress });
    statusText = <div className="text-muted small mt-1">{label}</div>;
  } else if (isFailed) {
    statusText = <div className="text-danger small mt-1">{formatMessage(messages.reportsStatusFailed)}</div>;
  }

  // Action widget (right column)
  let actionWidget: React.ReactNode;

  if (isPending || isWaitingForPoll || isRunning || (isSuccess && !trackedTask?.downloadUrl)) {
    // Spinner covers: mutation in flight, waiting for first poll, task running, URL not yet ready
    actionWidget = (
      <Spinner
        animation="border"
        size="sm"
        screenReaderText={formatMessage(messages.reportsGeneratingReport)}
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
          {formatMessage(messages.reportsButtonDownload)}
        </a>
        <button
          type="button"
          onClick={handleReset}
          className="btn btn-link p-0"
          style={{ fontSize: '0.7rem', color: 'var(--pgn-color-text-muted, #6c757d)', lineHeight: 1.4 }}
        >
          {formatMessage(messages.reportsButtonRegenerate)}
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
        {formatMessage(messages.reportsButtonRetry)}
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
        {formatMessage(messages.reportsButtonGenerate)}
      </Button>
    );
  }

  return (
    <div
      className="py-4 border-bottom d-flex align-items-center justify-content-between"
      style={{ gap: '2rem' }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="font-weight-semibold" style={{ fontSize: '0.9375rem' }}>
          {formatMessage(messages[def.labelMsgKey])}
        </div>
        <div className="text-muted small mt-1" style={{ lineHeight: '1.5' }}>
          {formatMessage(messages[def.descMsgKey])}
        </div>
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

const DownloadsTable = ({ courseId }: { courseId: string }) => {
  const { formatMessage } = useIntl();
  const { data: rows, isLoading, isError } = useCourseReportDownloads(courseId);
  const [page, setPage] = useState(1);

  const DOWNLOADS_COLUMNS: ColumnDef<ReportDownloadRow>[] = [
    {
      key: 'reportLabel',
      label: formatMessage(messages.reportsColType),
    },
    {
      key: 'state',
      label: formatMessage(messages.reportsColStatus),
      renderCell: (value) => <StateBadge state={value as TaskState} />,
    },
    {
      key: 'created',
      label: formatMessage(messages.reportsColGenerated),
      renderCell: (value) => (
        <span style={{ whiteSpace: 'nowrap' }}>
          {new Date(value as string).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'modified',
      label: formatMessage(messages.reportsColElapsed),
      id: 'elapsed',
      renderCell: (value, row) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {elapsedLabel(row.created, value as string | null, row.state)}
        </span>
      ),
    },
    {
      key: 'downloadUrl',
      label: formatMessage(messages.reportsColDownload),
      renderCell: (value) => (
        value ? (
          <a
            href={value as string}
            className="btn btn-sm btn-outline-primary d-inline-flex align-items-center"
            style={{ gap: '0.375rem', whiteSpace: 'nowrap' }}
          >
            <DownloadIcon />
            {formatMessage(messages.reportsButtonDownload)}
          </a>
        ) : (
          <span className="text-muted small">—</span>
        )
      ),
    },
  ];

  if (isError) {
    return <Alert variant="warning" className="mb-0">{formatMessage(messages.reportsDownloadsError)}</Alert>;
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
      columns={DOWNLOADS_COLUMNS}
      data={pageRows}
      isLoading={isLoading}
      caption={formatMessage(messages.reportsDownloadsCaption)}
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
  const { formatMessage } = useIntl();
  const { courseId = '' } = useParams<{ courseId: string }>();
  const { data: course, isLoading: courseLoading } = useCourse(courseId);

  if (courseLoading) {
    return (
      <div className="rwaq-page">
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" screenReaderText={formatMessage(messages.reportsLoadingCourse)} />
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
          <Link to="/courses">{formatMessage(messages.reportsBreadcrumbCourses)}</Link>
          {' / '}
          <Link to={courseHref}>{courseName}</Link>
          {' '}{formatMessage(messages.reportsBreadcrumbSuffix)}
        </div>
        <h1 className="rwaq-page-title mt-2">{formatMessage(messages.reportsPageTitle)}</h1>
      </div>

      {/* Generate Reports */}
      <div className="rwaq-card">
        <h2 className="rwaq-section-title mb-1">{formatMessage(messages.reportsGenerateTitle)}</h2>
        <p className="text-muted small mb-0">
          {formatMessage(messages.reportsGenerateDesc, {
            generate: <strong>{formatMessage(messages.reportsGenerateWord)}</strong>,
            available: <em>{formatMessage(messages.reportsAvailableWord)}</em>,
          })}
        </p>
        <hr className="mt-3 mb-0" />
        {REPORT_DEFS.map((def) => (
          <ReportTriggerRow key={def.type} def={def} courseId={courseId} />
        ))}
      </div>

      {/* Reports Available for Download */}
      <div className="rwaq-card">
        <h2 className="rwaq-section-title mb-1">{formatMessage(messages.reportsDownloadsTitle)}</h2>
        <p className="text-muted small mb-3">{formatMessage(messages.reportsDownloadsDesc)}</p>
        <DownloadsTable courseId={courseId} />
      </div>
    </div>
  );
};

export default CourseReportsPage;
