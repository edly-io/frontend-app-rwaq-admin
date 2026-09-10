/**
 * A small read-only table for dashboard cards.
 *
 * Deliberately not AdminDataTable: that carries pagination, a scroll container
 * and a footer, none of which a ten-row leaderboard inside a card needs. It
 * borrows the same table styling so the two still look like one system.
 */
import { ReactNode } from 'react';
import { Skeleton } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../messages';

export interface MiniColumn<Row> {
  label: string;
  render: (row: Row) => ReactNode;
  /** Right-align and tabular-align the figures in this column. */
  isNumeric?: boolean;
}

export interface MiniTableProps<Row> {
  columns: MiniColumn<Row>[];
  rows: Row[];
  rowKey: (row: Row) => string;
  caption: string;
  /** When set, the scroll container is capped at this height so long lists
   *  do not blow out the card's layout. */
  maxHeight?: number | string;
  isLoading?: boolean;
}

// `<Row extends object>` rather than a bare `<Row>`: in a .tsx file a bare type
// parameter is ambiguous with a JSX tag, and the trailing-comma workaround
// (`<Row,>`) gets rewritten by the formatter into something that no longer
// parses. The constraint removes the ambiguity and stays an arrow component,
// which is the house rule.
const MiniTable = <Row extends object>({
  columns, rows, rowKey, caption, maxHeight, isLoading = false,
}: MiniTableProps<Row>) => {
  const intl = useIntl();

  if (isLoading) {
    return (
      <table className="table table-sm mb-0 rwaq-mini-table" aria-busy="true">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.label} scope="col" className={col.isNumeric ? 'rwaq-mini-table__num' : undefined}>
                <Skeleton height="0.875rem" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {[0, 1, 2, 3].map((i) => (
            <tr key={i}>
              {columns.map((col) => (
                <td key={col.label} className={col.isNumeric ? 'rwaq-mini-table__num' : undefined}>
                  <Skeleton height="0.875rem" />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  if (rows.length === 0) {
    return <p className="text-muted text-center py-4 mb-0">{intl.formatMessage(messages.emptyTable)}</p>;
  }

  return (
    // Not .rwaq-table-scroll: that forces a 60rem minimum width, which is
    // correct for the eight-column admin tables and clips a table sitting in a
    // dashboard card. This scrolls only when it genuinely needs to.
    <div className="rwaq-minitable-scroll" style={maxHeight !== undefined ? { maxHeight, overflowY: 'auto' } : undefined}>
      <table className="table table-sm mb-0 rwaq-mini-table">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th
                key={column.label}
                scope="col"
                className={column.isNumeric ? 'rwaq-mini-table__num' : undefined}
              >
                {column.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)}>
              {columns.map((column) => (
                <td
                  key={column.label}
                  className={column.isNumeric ? 'rwaq-mini-table__num' : undefined}
                >
                  {column.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MiniTable;
