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
  /** Data accessor key. Must be unique across columns unless `id` is provided. */
  key: string;
  /** Explicit unique column id (defaults to `key`). Use for display/action columns
   *  that reuse a data key, to avoid react-table "Duplicate columns" errors. */
  id?: string;
  /** Custom cell renderer; receives the raw cell value and the full row object */
  renderCell?: (value: unknown, row: Record<string, unknown>) => ReactNode;
}

export interface ServerPaginationState {
  currentPage: number;
  pageCount: number;
  /** Total number of items across all pages (drives the "Showing X of Y" status). */
  itemCount?: number;
  /** Rows per page. Must match what the API actually returns, or the footer's
   *  "Showing X of Y" range and the page count disagree with the data. */
  pageSize?: number;
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

/** Fallback rows-per-page when the caller doesn't say. */
const DEFAULT_PAGE_SIZE = 20;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build the column spec format that Paragon DataTable expects */
const buildTableColumns = (cols: ColumnDef[]) => cols.map((col) => ({
  Header: col.label,
  accessor: col.key,
  id: col.id ?? col.key,
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
    <>
      {/* sr-only heading instead of a raw <caption> (which is invalid nested in
          DataTable's wrapper <div> and triggers a DOM-nesting warning). */}
      {caption && <div className="sr-only" role="heading" aria-level={2}>{caption}</div>}
      <DataTable
        columns={buildTableColumns(columns)}
        data={data}
        itemCount={pagination?.itemCount ?? data.length}
        pageCount={pagination?.pageCount}
        initialState={{
          pageSize: pagination?.pageSize ?? DEFAULT_PAGE_SIZE,
          pageIndex: pagination ? pagination.currentPage - 1 : 0,
        }}
        manualPagination={!!pagination}
        fetchData={pagination
          // DataTable owns the page controls but the data is server-side, so
          // its page changes have to be handed back to the caller's URL state.
          ? ({ pageIndex }: { pageIndex: number }) => {
            const nextPage = pageIndex + 1;
            if (nextPage !== pagination.currentPage) {
              pagination.onPageChange(nextPage);
            }
          }
          : undefined}
      >
        <DataTable.Table />
        {pagination && (
          <DataTable.TableFooter>
            <DataTable.RowStatus />
            <DataTable.TablePagination />
          </DataTable.TableFooter>
        )}
      </DataTable>
    </>
  );
};

export default AdminDataTable;
