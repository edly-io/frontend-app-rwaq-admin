/**
 * AdminDataTable — thin wrapper over Paragon DataTable for server-side
 * pagination, sort, and filter. All consumers get the same consistent
 * loading/empty/error handling without repeating it.
 *
 * Pagination strategy:
 *
 * DataTable is given `manualPagination` so it never slices the `data` array
 * itself — every page is a fresh server response.  `fetchData` fires only
 * when the internal page index actually changes (guarded by a currentPage
 * comparison), so the initial mount never triggers a redundant request.
 *
 * Footer pagination control:
 *  - countCapped=false → Paragon `Pagination` (numbered, variant="secondary",
 *    real arrows) — DataTable.TablePagination is not used because its reduced
 *    variant hardcodes leftIcon/rightIcon: null, leaving it arrow-free.
 *  - countCapped=true  → DataTable.TablePaginationMinimal (prev/next only,
 *    no page number picker) — reads canNextPage / canPreviousPage from
 *    DataTableContext, which we wire correctly via `pageCount`:
 *      hasNext=true  → pageCount = currentPage + 1  (next is enabled)
 *      hasNext=false → pageCount = currentPage      (next is disabled)
 */
import { useCallback } from 'react';
import { DataTable, Pagination, Spinner } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import type { ReactNode } from 'react';
import { adminDataTableMessages as messages } from './messages';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface ColumnDef<Row extends object = Record<string, unknown>> {
  label: string;
  /** Render the heading for screen readers only — for columns whose content
   *  speaks for itself, like an avatar. Keeps the column accessible without a
   *  redundant visible title. */
  isLabelHidden?: boolean;
  /** Extra class on the <th>, e.g. for alignment or width. */
  headerClassName?: string;
  /** Data accessor key. Must be unique across columns unless `id` is provided. */
  key: string;
  /** Explicit unique column id (defaults to `key`). Use for display/action columns
   *  that reuse a data key, to avoid react-table "Duplicate columns" errors. */
  id?: string;
  /** Custom cell renderer; receives the raw cell value and the full row object */
  renderCell?: (value: unknown, row: Row) => ReactNode;
}

export interface ServerPaginationState {
  currentPage: number;
  pageCount: number;
  /** Total number of items across all pages (drives the "Showing X of Y" status). */
  itemCount?: number;
  /** When true, the real total exceeds the backend cap; display as "1,000+" instead
   *  and use DataTable.TablePaginationMinimal (prev/next only) instead of the
   *  numbered Pagination component. */
  countCapped?: boolean;
  /** Whether a next page exists — required when countCapped=true to set
   *  DataTable's internal pageCount correctly so TablePaginationMinimal's
   *  Next button knows when to disable itself. */
  hasNext?: boolean;
  /** Rows per page. Must match what the API actually returns, or the footer's
   *  "Showing X of Y" range and the page count disagree with the data. */
  pageSize?: number;
  onPageChange: (page: number) => void;
}

export interface AdminDataTableProps<Row extends object = Record<string, unknown>> {
  columns: ColumnDef<Row>[];
  data: Row[];
  isLoading?: boolean;
  pagination?: ServerPaginationState;
  /** Optional caption for accessibility */
  caption?: string;
}

/** Fallback rows-per-page when the caller doesn't say. */
const DEFAULT_PAGE_SIZE = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Build the column spec format that Paragon DataTable expects */
const buildTableColumns = <Row extends object>(cols: ColumnDef<Row>[]) => cols.map((col) => ({
  Header: col.isLabelHidden
    // eslint-disable-next-line react/no-unstable-nested-components
    ? () => <span className="sr-only">{col.label}</span>
    : col.label,
  accessor: col.key,
  id: col.id ?? col.key,
  headerClassName: col.headerClassName,
  ...(col.renderCell
    ? {
      // eslint-disable-next-line react/no-unstable-nested-components
      Cell: ({ value, row }: { value: unknown; row: { original: Row } }) => (
        <>{col.renderCell!(value, row.original)}</>
      ),
    }
    : {}),
}));

// ── Main component ────────────────────────────────────────────────────────────

// Generic over the row type so callers keep their real types instead of
// casting through Record<string, unknown>. `Row extends object` rather than a
// bare `<Row>`: in a .tsx file a bare type parameter is ambiguous with a JSX
// tag. Defaulted, so existing untyped call sites still compile.
const AdminDataTable = <Row extends object>({
  columns,
  data,
  isLoading = false,
  pagination,
  caption,
}: AdminDataTableProps<Row>) => {
  const intl = useIntl();

  // Range comes from the server-side page, not react-table, which only ever
  // holds the current page's rows.
  const pageSize = pagination?.pageSize ?? DEFAULT_PAGE_SIZE;
  const rangeStart = pagination ? (pagination.currentPage - 1) * pageSize + 1 : 1;
  const rangeEnd = pagination
    ? Math.min(rangeStart + data.length - 1, pagination.itemCount ?? data.length)
    : data.length;

  // DataTable's internal pageCount drives canNextPage / canPreviousPage in
  // DataTableContext, which TablePaginationMinimal reads.
  // - Capped: real total unknown; encode only whether a next page exists.
  // - Non-capped: use the accurate server-supplied page count.
  const dataTablePageCount = pagination
    ? (pagination.countCapped
      ? (pagination.hasNext ? pagination.currentPage + 1 : pagination.currentPage)
      : pagination.pageCount)
    : 1;

  // fetchData fires when DataTable's internal pageIndex changes.  Guard against
  // the initial mount call (pageIndex === currentPage - 1 on first render) to
  // avoid a redundant setSearchParams → React Router navigation cycle.
  const handleFetchData = useCallback(
    ({ pageIndex }: { pageIndex: number }) => {
      const newPage = pageIndex + 1;
      if (pagination && newPage !== pagination.currentPage) {
        pagination.onPageChange(newPage);
      }
    },
    [pagination],
  );

  if (isLoading) {
    return (
      // rwaq-table-shell is a flex *column*, which flips what
      // justify-content-center does — so centring is handled by a dedicated
      // class rather than utilities that assume a row.
      <div className="rwaq-table-shell rwaq-table-state" aria-label={intl.formatMessage(messages.loadingLabel)}>
        <Spinner animation="border" variant="primary" role="status">
          <span className="sr-only">{intl.formatMessage(messages.loadingLabel)}</span>
        </Spinner>
      </div>
    );
  }

  if (!isLoading && data.length === 0) {
    return (
      <div className="rwaq-table-shell rwaq-table-state">
        <p className="text-muted mb-0">{intl.formatMessage(messages.noResults)}</p>
      </div>
    );
  }

  return (
    <div className="rwaq-table-shell">
      {/* sr-only heading instead of a raw <caption> (which is invalid nested in
          DataTable's wrapper <div> and triggers a DOM-nesting warning). */}
      {caption && <div className="sr-only" role="heading" aria-level={2}>{caption}</div>}

      {/* DataTable wraps both the scroll area and the footer so compound
          subcomponents (DataTable.Table, DataTable.TablePaginationMinimal)
          can read from DataTableContext regardless of where they sit in the
          tree.  manualPagination tells react-table not to slice the data
          array — the server already did that. */}
      <DataTable
        columns={buildTableColumns(columns)}
        data={data}
        itemCount={pagination?.itemCount ?? data.length}
        pageCount={dataTablePageCount}
        initialState={{
          pageIndex: pagination ? pagination.currentPage - 1 : 0,
          pageSize,
        }}
        fetchData={pagination ? handleFetchData : undefined}
        manualPagination={!!pagination}
      >
        {/* Below ~1200px eight columns can't fit; letting the browser shrink
            them wraps every cell to one character per line. Scroll the table
            inside its own container so the footer stays pinned below. */}
        <div className="rwaq-table-scroll">
          <DataTable.Table />
        </div>

        {/* Custom footer layout: our own status text on the left, Paragon
            pagination control on the right.
            - countCapped=true  → DataTable.TablePaginationMinimal (reads
              canNextPage / canPreviousPage from context, no page numbers)
            - countCapped=false → standalone Pagination (variant="secondary",
              real arrows; DataTable.TablePagination is not used because its
              reduced variant hardcodes leftIcon/rightIcon: null) */}
        {pagination && (
          <div className="rwaq-table-footer">
            <span className="rwaq-table-footer__status">
              {intl.formatMessage(messages.rowStatus, {
                first: rangeStart,
                last: rangeEnd,
                total: pagination.countCapped
                  ? '1,000+'
                  : (pagination.itemCount ?? data.length),
              })}
            </span>

            {pagination.countCapped ? (
              <DataTable.TablePaginationMinimal />
            ) : (
              pagination.pageCount > 1 && (
                <Pagination
                  variant="secondary"
                  currentPage={pagination.currentPage}
                  pageCount={pagination.pageCount}
                  onPageSelect={(page: number) => pagination.onPageChange(page)}
                  paginationLabel={intl.formatMessage(messages.paginationLabel)}
                  buttonLabels={{
                    previous: intl.formatMessage(messages.previousPage),
                    next: intl.formatMessage(messages.nextPage),
                    page: intl.formatMessage(messages.page),
                    currentPage: intl.formatMessage(messages.currentPage),
                    pageOfCount: intl.formatMessage(messages.pageOfCount),
                  }}
                />
              )
            )}
          </div>
        )}
      </DataTable>
    </div>
  );
};

export default AdminDataTable;
