/**
 * ProgramReportsPage — async report generation and history for a single program.
 *
 * Route: programs/:uuid/reports
 *
 * Layout mirrors CourseReportsPage exactly:
 *   1. "Generate Reports" card — one trigger row per report type (label +
 *      description on the left, Generate / Spinner / Download button on the right).
 *   2. "Reports Available for Download" card — paginated task-history table
 *      with 10 s auto-poll while any row is pending/in_progress (AC27).
 */
import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Button, Spinner,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useProgram } from '../data/hooks';
import {
  useProgramReportTasks,
  useTriggerProgramReport,
} from '../data/reportsHooks';
import type { ProgramReportType } from '../data/reportsTypes';
import ReportTasksTable from './ReportTasksTable';
import { programReportsMessages as messages } from '../messages';

// ── Report definitions ────────────────────────────────────────────────────────

interface ReportDef {
  type: ProgramReportType;
  label: string;
  description: string;
}

const useReportDefs = (): ReportDef[] => {
  const intl = useIntl();
  return [
    {
      type: 'enrollment_progress',
      label: intl.formatMessage(messages.reportEnrollmentLabel),
      description: intl.formatMessage(messages.reportEnrollmentDesc),
    },
    {
      type: 'completion_summary',
      label: intl.formatMessage(messages.reportCompletionLabel),
      description: intl.formatMessage(messages.reportCompletionDesc),
    },
    {
      type: 'learner_summary',
      label: intl.formatMessage(messages.reportLearnerSummaryLabel),
      description: intl.formatMessage(messages.reportLearnerSummaryDesc),
    },
    {
      type: 'course_statistics',
      label: intl.formatMessage(messages.reportCourseStatisticsLabel),
      description: intl.formatMessage(messages.reportCourseStatisticsDesc),
    },
  ];
};

// ── Download icon ─────────────────────────────────────────────────────────────

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

interface ReportTriggerRowProps {
  def: ReportDef;
  uuid: string;
  tasks: ReturnType<typeof useProgramReportTasks>['data'];
}

const ReportTriggerRow = ({ def, uuid, tasks }: ReportTriggerRowProps) => {
  const intl = useIntl();
  const { mutate, isPending: isMutating } = useTriggerProgramReport(uuid);
  const [trackedTaskId, setTrackedTaskId] = useState<string | null>(null);
  const [triggerError, setTriggerError] = useState<string | null>(null);

  const hasInFlight = (tasks?.results ?? []).some(
    (t) => t.reportType === def.type
      && (t.status === 'pending' || t.status === 'in_progress'),
  );

  const trackedTask = trackedTaskId
    ? (tasks?.results ?? []).find((t) => t.id === trackedTaskId) ?? null
    : null;

  const isWaitingForPoll = !isMutating && trackedTaskId !== null && trackedTask === null;
  const isRunning = hasInFlight || isWaitingForPoll
    || trackedTask?.status === 'pending' || trackedTask?.status === 'in_progress';
  const isSuccess = trackedTask?.status === 'complete';
  const isFailed = trackedTask?.status === 'failed';

  const handleGenerate = () => {
    if (hasInFlight || isMutating) { return; }
    setTrackedTaskId(null);
    setTriggerError(null);
    mutate(def.type, {
      onSuccess: (data) => setTrackedTaskId(data.id),
      onError: (err) => {
        const httpStatus = (err as { response?: { status?: number } })?.response?.status;
        if (httpStatus === 409) {
          setTriggerError(intl.formatMessage(messages.warningDuplicate));
        } else {
          const detail = (err as { response?: { data?: { detail?: string } } })
            ?.response?.data?.detail;
          setTriggerError(
            detail
            ?? (err as { message?: string })?.message
            ?? intl.formatMessage(messages.errorTriggerGeneric),
          );
        }
      },
    });
  };

  const handleReset = () => {
    setTrackedTaskId(null);
    setTriggerError(null);
  };

  let statusText: React.ReactNode = null;
  if (triggerError) {
    statusText = (
      <div className="text-danger small mt-1" role="alert">{triggerError}</div>
    );
  } else if (isRunning && !isMutating) {
    statusText = (
      <div className="text-muted small mt-1" role="status" aria-live="polite">
        {intl.formatMessage(messages.statusRunning)}
      </div>
    );
  }

  let actionWidget: React.ReactNode;

  if (isMutating || isWaitingForPoll || (isRunning && !isFailed)) {
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
          href={trackedTask.downloadUrl ?? undefined}
          className="btn btn-sm btn-primary d-inline-flex align-items-center"
          style={{ gap: '0.3rem', whiteSpace: 'nowrap' }}
          aria-label={`${intl.formatMessage(messages.btnDownload)} — ${def.label}`}
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
          {intl.formatMessage(messages.btnGenerate)}
        </button>
      </div>
    );
  } else {
    actionWidget = (
      <Button
        variant="outline-primary"
        size="sm"
        onClick={handleGenerate}
        disabled={hasInFlight || isMutating}
        aria-disabled={hasInFlight || isMutating}
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
        <div className="font-weight-semibold" style={{ fontSize: '0.9375rem' }}>
          {def.label}
        </div>
        <div className="text-muted small mt-1" style={{ lineHeight: '1.5' }}>
          {def.description}
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

// ── Main page ─────────────────────────────────────────────────────────────────

const ProgramReportsPage = () => {
  const intl = useIntl();
  const reportDefs = useReportDefs();
  const { uuid = '' } = useParams<{ uuid: string }>();
  const [page, setPage] = useState(1);

  const { data: program, isLoading: programLoading } = useProgram(uuid);
  const {
    data: tasksPage,
    isLoading: tasksLoading,
    isError: tasksError,
  } = useProgramReportTasks(uuid, page);

  if (programLoading) {
    return (
      <div className="rwaq-page">
        <div className="d-flex justify-content-center py-5">
          <Spinner
            animation="border"
            screenReaderText={intl.formatMessage(messages.srLoading)}
          />
        </div>
      </div>
    );
  }

  const programName = program?.name ?? uuid;
  const programHref = `/programs/${uuid}`;

  return (
    <div className="rwaq-page">
      {/* Header */}
      <div className="rwaq-page-header">
        <div className="rwaq-page-header__breadcrumb">
          <Link to="/programs">{intl.formatMessage(messages.breadcrumbPrograms)}</Link>
          {' / '}
          <Link to={programHref}>{programName}</Link>
          {' / '}
          {intl.formatMessage(messages.taskPageBreadcrumbReports)}
        </div>
        <h1 className="rwaq-page-title mt-2">
          {intl.formatMessage(messages.taskPageTitle)}
        </h1>
      </div>

      {/* Generate Reports */}
      <div className="rwaq-card">
        <h2 className="rwaq-section-title mb-1">
          {intl.formatMessage(messages.generateSectionTitle)}
        </h2>
        <p className="text-muted small mb-0">
          {intl.formatMessage(messages.generateSectionBody)}
        </p>
        <hr className="mt-3 mb-0" />
        {reportDefs.map((def) => (
          <ReportTriggerRow key={def.type} def={def} uuid={uuid} tasks={tasksPage} />
        ))}
      </div>

      {/* Reports Available for Download */}
      <div className="rwaq-card">
        <h2 className="rwaq-section-title mb-1">
          {intl.formatMessage(messages.downloadsSectionTitle)}
        </h2>
        <p className="text-muted small mb-3">
          {intl.formatMessage(messages.downloadsSectionBody)}
        </p>
        <ReportTasksTable
          tasks={tasksPage?.results}
          totalCount={tasksPage?.pagination?.count ?? 0}
          numPages={tasksPage?.pagination?.numPages ?? 1}
          currentPage={page}
          isLoading={tasksLoading}
          isError={tasksError}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
};

export default ProgramReportsPage;
