/**
 * AdminDataTable — thin wrapper over Paragon DataTable for server-side
 * pagination, sort, and filter. All consumers get the same consistent
 * loading/empty/error handling without repeating it.
 */
import { ReactNode } from 'react';
import { DataTable, Spinner } from '@openedx/paragon';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  loadingLabel: {
    id: 'rwaq.admin.dataTable.loading',
    defaultMessage: 'Loading data…',
  },
  noResults: {
    id: 'rwaq.admin.dataTable.noResults',
    defaultMessage: 'No results found.',
  },
});

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ColumnDef {
  label: string;
  key: string;
  /** Custom cell renderer; receives the raw cell value and the full row object */
  renderCell?: (value: unknown, row: Record<string, unknown>) => ReactNode;
}

export interface ServerPaginationState {
  currentPage: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}

export interface AdminDataTableProps {
  columns: ColumnDef[];
  data: Record<string, unknown>[];
  isLoading?: boolean;
  pagination?: ServerPaginationState;
  /** Optional caption for accessibility */
  caption?: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build the column spec format that Paragon DataTable expects */
const buildTableColumns = (cols: ColumnDef[]) => cols.map((col) => ({
  Header: col.label,
  accessor: col.key,
  ...(col.renderCell
    ? {
      // eslint-disable-next-line react/no-unstable-nested-components
      Cell: ({ value, row }: { value: unknown; row: { original: Record<string, unknown> } }) => (
        <>{col.renderCell!(value, row.original)}</>
      ),
    }
    : {}),
}));

// ── Main component ────────────────────────────────────────────────────────────

const AdminDataTable = ({
  columns,
  data,
  isLoading = false,
  pagination,
  caption,
}: AdminDataTableProps) => {
  const intl = useIntl();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center py-5" aria-label={intl.formatMessage(messages.loadingLabel)}>
        <Spinner animation="border" variant="primary" role="status">
          <span className="sr-only">{intl.formatMessage(messages.loadingLabel)}</span>
        </Spinner>
      </div>
    );
  }

  if (!isLoading && data.length === 0) {
    return (
      <p className="text-center py-4 text-muted">
        {intl.formatMessage(messages.noResults)}
      </p>
    );
  }

  return (
    <DataTable
      columns={buildTableColumns(columns)}
      data={data}
      itemCount={pagination ? pagination.pageCount * 10 : data.length}
      pageCount={pagination?.pageCount}
      initialState={{
        pageSize: 10,
        pageIndex: pagination ? pagination.currentPage - 1 : 0,
      }}
      manualPagination={!!pagination}
    >
      {caption && <caption className="sr-only">{caption}</caption>}
      <DataTable.Table />
      {pagination && (
        <DataTable.TableFooter>
          <DataTable.RowStatus />
          <DataTable.TablePagination />
        </DataTable.TableFooter>
      )}
    </DataTable>
  );
};

export default AdminDataTable;
