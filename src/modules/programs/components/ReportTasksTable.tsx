/**
 * ReportTasksTable — paginated history table for ProgramReportTask rows.
 *
 * Displays: Report Type | Status | Generated | Elapsed | Progress | Download
 * Matches the course reports table styling exactly (same badge colours,
 * same download button, same AdminDataTable wrapper).
 */
import React from 'react';
import { Alert, Badge } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import type { ProgramReportStatus, ProgramReportTask } from '../data/reportsTypes';
import { programReportsMessages as messages } from '../messages';

// ── Status badge ───────────────────────────────────────────────────────────────

const STATUS_VARIANT: Record<ProgramReportStatus, string> = {
  pending: 'light',
  in_progress: 'warning',
  complete: 'success',
  failed: 'danger',
};

const StatusBadge = ({ status }: { status: ProgramReportStatus }) => {
  const intl = useIntl();
  const statusLabels: Record<ProgramReportStatus, string> = {
    pending: intl.formatMessage(messages.statusPending),
    in_progress: intl.formatMessage(messages.statusProcessing),
    complete: intl.formatMessage(messages.statusComplete),
    failed: intl.formatMessage(messages.statusFailed),
  };
  return (
    <Badge variant={STATUS_VARIANT[status] ?? 'secondary'}>
      {statusLabels[status] ?? status}
    </Badge>
  );
};

// ── Download icon (matches CourseReportsPage) ─────────────────────────────────

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

// ── Table ─────────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

interface ReportTasksTableProps {
  /** All tasks for the current server page — the server already limits to 10
   *  per page, so this list is already paginated at the API layer.
   *  Pass `undefined` while the initial load is in flight. */
  tasks: ProgramReportTask[] | undefined;
  totalCount: number;
  numPages: number;
  currentPage: number;
  isLoading: boolean;
  isError: boolean;
  onPageChange: (page: number) => void;
}

const ReportTasksTable = ({
  tasks,
  totalCount,
  numPages,
  currentPage,
  isLoading,
  isError,
  onPageChange,
}: ReportTasksTableProps) => {
  const intl = useIntl();

  const columns: ColumnDef<ProgramReportTask>[] = [
    {
      key: 'reportTypeDisplay',
      label: intl.formatMessage(messages.colReportType),
    },
    {
      key: 'status',
      label: intl.formatMessage(messages.colStatus),
      renderCell: (value) => <StatusBadge status={value as ProgramReportStatus} />,
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
      key: 'elapsedSeconds',
      label: intl.formatMessage(messages.colElapsed),
      renderCell: (value) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {value != null ? `${value as number}s` : '—'}
        </span>
      ),
    },
    {
      key: 'progressCurrent',
      id: 'progress',
      label: intl.formatMessage(messages.colProgress),
      renderCell: (_value, row) => (
        <span style={{ fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap' }}>
          {row.progressTotal > 0 ? `${row.progressCurrent} / ${row.progressTotal}` : '—'}
        </span>
      ),
    },
    {
      key: 'downloadUrl',
      label: intl.formatMessage(messages.colDownload),
      renderCell: (value, row) => (
        row.status === 'complete' && value ? (
          <a
            href={value as string}
            target="_blank"
            rel="noreferrer"
            aria-label={`${intl.formatMessage(messages.btnDownload)} — ${row.reportTypeDisplay}`}
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

  if (isError) {
    return (
      <Alert variant="warning" className="mb-0">
        {intl.formatMessage(messages.errorLoadReports)}
      </Alert>
    );
  }

  const safeNumPages = Math.max(1, numPages);
  const safePage = Math.min(currentPage, safeNumPages);

  return (
    <AdminDataTable
      columns={columns}
      data={tasks ?? []}
      isLoading={isLoading}
      caption={intl.formatMessage(messages.downloadsSectionTitle)}
      pagination={totalCount > 0 ? {
        currentPage: safePage,
        pageCount: safeNumPages,
        itemCount: totalCount,
        pageSize: PAGE_SIZE,
        onPageChange,
      } : undefined}
    />
  );
};

export default ReportTasksTable;
