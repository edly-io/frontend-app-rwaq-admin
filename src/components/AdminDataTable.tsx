/**
 * AdminDataTable — thin wrapper over Paragon DataTable for server-side
 * pagination, sort, and filter. All consumers get the same consistent
 * loading/empty/error handling without repeating it.
 */
import { ReactNode } from 'react';
import { DataTable, Pagination, Spinner } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { adminDataTableMessages as messages } from './messages';
import InfoTooltip from './InfoTooltip';

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
  /** Explains the column: hovering the heading shows this, as on the dashboard's tiles. */
  info?: string;
  /** Custom cell renderer; receives the raw cell value and the full row object */
  renderCell?: (value: unknown, row: Row) => ReactNode;
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

export interface AdminDataTableProps<Row extends object = Record<string, unknown>> {
  columns: ColumnDef<Row>[];
  data: Row[];
  isLoading?: boolean;
  pagination?: ServerPaginationState;
  /** Optional caption for accessibility */
  caption?: string;
  /** Makes rows expandable: an expander column is added first, and an expanded
   *  row renders this under itself. */
  renderRowSubComponent?: (row: Row) => ReactNode;
}

/** Fallback rows-per-page when the caller doesn't say. */
const DEFAULT_PAGE_SIZE = 10;

// ── Helpers ───────────────────────────────────────────────────────────────────

/** What a column definition carries into react-table, so headings and cells can be stable components. */
interface TableColumnMeta<Row extends object> {
  label: string;
  isLabelHidden?: boolean;
  info?: string;
  renderCell?: ColumnDef<Row>['renderCell'];
}

/**
 * Paragon keys every cell by `${column.Header}${row.id}`. A function Header
 * stringifies to its source, so headings that share one source collide and
 * React drops or duplicates cells. Each heading component therefore gets its
 * own string form (the column id), and is cached per id so it stays the same
 * component between renders instead of remounting every header each time.
 */
const headerCache: Map<string, () => ReactNode> = new Map();

const ColumnHeading = ({ meta }: { meta: TableColumnMeta<object> }) => {
  if (meta.isLabelHidden) { return <span className="sr-only">{meta.label}</span>; }
  if (meta.info) {
    return <InfoTooltip text={meta.info}><span className="rwaq-th-info">{meta.label}</span></InfoTooltip>;
  }
  return <span>{meta.label}</span>;
};

const headerFor = (id: string) => {
  let header = headerCache.get(id);
  if (!header) {
    const Header = ({ column }: { column?: { meta: TableColumnMeta<object> } }) => (
      column ? <ColumnHeading meta={column.meta} /> : null
    );
    Header.toString = () => `header:${id}`;
    header = Header as () => ReactNode;
    headerCache.set(id, header);
  }
  return header;
};

/** One cell component for every column: it reads the column's own renderer, so it never remounts. */
const RenderedCell = ({ value, row, column }: {
  value: unknown; row: { original: object }; column: { meta: TableColumnMeta<object> };
}) => {
  const { renderCell } = column.meta;
  const content = renderCell ? renderCell(value, row.original) : String(value ?? '');
  // A fragment is the only way to return arbitrary ReactNode content from a component.
  // eslint-disable-next-line react/jsx-no-useless-fragment
  return <>{content}</>;
};

const ExpanderHeading = () => {
  const intl = useIntl();
  return <span className="sr-only">{intl.formatMessage(messages.expandColumn)}</span>;
};
ExpanderHeading.toString = () => 'header:expander';

/** Build the column spec format that Paragon DataTable expects */
const buildTableColumns = <Row extends object>(cols: ColumnDef<Row>[]) => cols.map((col) => {
  const id = col.id ?? col.key;
  const meta: TableColumnMeta<Row> = {
    label: col.label, isLabelHidden: col.isLabelHidden, info: col.info, renderCell: col.renderCell,
  };
  return {
    Header: headerFor(id),
    accessor: col.key,
    id,
    headerClassName: col.headerClassName,
    meta,
    ...(col.renderCell ? { Cell: RenderedCell } : {}),
  };
});

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
  renderRowSubComponent,
}: AdminDataTableProps<Row>) => {
  const intl = useIntl();

  // An expandable table gets its expander first, so the toggle sits beside the row it opens.
  const tableColumns = renderRowSubComponent
    ? [
      {
        id: 'expander',
        Header: ExpanderHeading,
        Cell: DataTable.ExpandRow,
      },
      ...buildTableColumns(columns),
    ]
    : buildTableColumns(columns);

  // Range comes from the server-side page, not react-table, which only ever
  // holds the current page's rows.
  const pageSize = pagination?.pageSize ?? DEFAULT_PAGE_SIZE;
  const rangeStart = pagination ? (pagination.currentPage - 1) * pageSize + 1 : 1;
  const rangeEnd = pagination
    ? Math.min(rangeStart + data.length - 1, pagination.itemCount ?? data.length)
    : data.length;

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
      {/* Below ~1200px eight columns can't fit; letting the browser shrink them
          wraps every cell to one character per line. Scroll the table instead. */}
      <div className="rwaq-table-scroll">
        {/* No pagination wiring on DataTable itself. It was keeping its own
            pageIndex alongside our URL state, and its fetchData callback fired
            with that stale index — so pressing Previous re-wrote the page back
            and rendered the wrong rows. The data is already one server page,
            so DataTable just renders what it is given and our footer owns
            paging entirely. */}
        <DataTable
          columns={tableColumns}
          data={data}
          itemCount={data.length}
          initialState={{ pageSize: Math.max(data.length, 1) }}
          {...(renderRowSubComponent ? {
            isExpandable: true,
            renderRowSubComponent: ({ row }: { row: { original: Row } }) => renderRowSubComponent(row.original),
          } : {})}
        >
          <DataTable.Table />
        </DataTable>
      </div>

      {/* Our own footer rather than DataTable.TableFooter: its TablePagination
          hardcodes Paragon's `reduced` variant with `leftIcon: null,
          rightIcon: null`, so it has no previous/next controls at all.
          Paragon's Pagination in its default variant gives real arrows. */}
      {pagination && (
        <div className="rwaq-table-footer">
          <span className="rwaq-table-footer__status">
            {intl.formatMessage(messages.rowStatus, {
              first: rangeStart,
              last: rangeEnd,
              total: pagination.itemCount ?? data.length,
            })}
          </span>

          {pagination.pageCount > 1 && (
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
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDataTable;
