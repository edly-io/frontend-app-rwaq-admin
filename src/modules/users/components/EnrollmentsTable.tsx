/**
 * A learner's enrollments, on AdminDataTable.
 *
 * Replaces a hand-rolled <table> that lived inside a modal. Now that this sits
 * on a page it uses the same table component as the user list and the org
 * admin roster, so the three read as one product rather than two styled tables
 * and one bespoke one.
 *
 * Paginated client-side. The API returns every enrollment in one response, and
 * adding a paginated endpoint would buy nothing at realistic sizes while
 * costing a request per page — so the page slice happens here, over data that
 * is already in hand.
 */
import { useEffect, useMemo, useState } from 'react';
import { Button, Chip } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import type { UserEnrollment } from '../data/types';
import messages from '../messages';

/** Matches the user list's page size, so the two tables page identically. */
const PAGE_SIZE = 10;

interface EnrollmentsTableProps {
  enrollments: UserEnrollment[];
  isLoading?: boolean;
  onChangeMode: (enrollment: UserEnrollment) => void;
  onUnenroll: (enrollment: UserEnrollment) => void;
}

const EnrollmentsTable = ({
  enrollments, isLoading, onChangeMode, onUnenroll,
}: EnrollmentsTableProps) => {
  const intl = useIntl();
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(enrollments.length / PAGE_SIZE));

  // Unenrolling the last row of the last page would otherwise leave the table
  // on a page that no longer exists, showing nothing.
  useEffect(() => {
    setPage((current) => Math.min(current, pageCount));
  }, [pageCount]);

  const rows = useMemo(
    () => enrollments.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [enrollments, page],
  );

  const dash = intl.formatMessage(messages.detailNone);

  const columns: ColumnDef<UserEnrollment>[] = [
    {
      label: intl.formatMessage(messages.enrollmentCourse),
      key: 'courseName',
      renderCell: (value, row) => (
        <div className="min-width-0">
          <div className="rwaq-user-cell__name">{value as string}</div>
          <div className="rwaq-user-cell__meta">{row.courseId}</div>
          {/* The last admin change, on the row it belongs to. An enrollment
              that looks wrong is usually only explicable by who changed it and
              why; a row with no line here was never touched by an admin. */}
          {row.lastChangeReason && (
            <div className="rwaq-enrollments__audit">
              {intl.formatMessage(messages.enrollmentLastChangeBy, {
                reason: row.lastChangeReason,
                actor: row.lastChangeBy ?? '-',
                date: row.lastChangeAt
                  ? new Date(row.lastChangeAt).toLocaleDateString()
                  : '-',
              })}
            </div>
          )}
        </div>
      ),
    },
    {
      label: intl.formatMessage(messages.enrollmentMode),
      key: 'mode',
      renderCell: (value) => <span className="rwaq-enrollments__mode">{value as string}</span>,
    },
    {
      label: intl.formatMessage(messages.enrollmentDate),
      key: 'enrolledAt',
      renderCell: (value) => (value ? new Date(value as string).toLocaleDateString() : dash),
    },
    {
      label: intl.formatMessage(messages.enrollmentStatus),
      key: 'isActive',
      renderCell: (value) => (
        <Chip className={`rwaq-chip rwaq-chip--${value ? 'success' : 'light'}`}>
          {intl.formatMessage(value ? messages.enrollmentActive : messages.enrollmentInactive)}
        </Chip>
      ),
    },
    {
      label: intl.formatMessage(messages.enrollmentCertificate),
      key: 'certificateStatus',
      renderCell: (value) => (value
        ? <span className="rwaq-enrollments__cert">{value as string}</span>
        : (
          <span className="rwaq-enrollments__cert--none">
            {intl.formatMessage(messages.enrollmentNoCertificate)}
          </span>
        )),
    },
    {
      label: intl.formatMessage(messages.enrollmentActions),
      headerClassName: 'rwaq-th--actions',
      key: 'actions',
      // `actions` is not a field on the row, so it needs an explicit id or
      // react-table treats the duplicate accessor as a duplicate column.
      id: 'actions',
      renderCell: (_value, row) => (
        <div className="rwaq-row-actions">
          <Button
            variant="outline-primary"
            size="sm"
            disabled={!row.isActive}
            onClick={() => onChangeMode(row)}
            aria-label={`${intl.formatMessage(messages.modeChangeAction)}, ${row.courseName}`}
          >
            {intl.formatMessage(messages.modeChangeAction)}
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            disabled={!row.isActive}
            onClick={() => onUnenroll(row)}
            aria-label={`${intl.formatMessage(messages.unenrollAction)}, ${row.courseName}`}
          >
            {intl.formatMessage(messages.unenrollAction)}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <AdminDataTable
      columns={columns}
      data={rows}
      isLoading={isLoading}
      caption={intl.formatMessage(messages.tabEnrollments)}
      pagination={{
        currentPage: page,
        pageCount,
        itemCount: enrollments.length,
        pageSize: PAGE_SIZE,
        onPageChange: setPage,
      }}
    />
  );
};

export default EnrollmentsTable;
