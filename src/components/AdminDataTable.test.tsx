/**
 * AdminDataTable: the expandable rows the payments tabs use, and the pieces
 * that must stay stable across re-renders (headers that share a label, cells
 * that keep state) or the table drops cells and remounts on every keystroke.
 */
import { useState } from 'react';
import { fireEvent, screen, within } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import AdminDataTable from './AdminDataTable';
import type { ColumnDef } from './AdminDataTable';

interface Row { name: string; amount: string; paid: string }

const rows: Row[] = [
  { name: 'Alpha', amount: '10.00', paid: '8.00' },
  { name: 'Beta', amount: '20.00', paid: '15.00' },
];

const columns: ColumnDef<Row>[] = [
  { label: 'Name', key: 'name' },
  { label: 'Amount', key: 'amount', renderCell: (value) => <strong>{value as string}</strong> },
];

const detail = (row: Row) => <div data-testid="detail">Detail of {row.name}</div>;

const expandButtons = () => screen.queryAllByRole('button', { name: 'Expand row' });

describe('AdminDataTable without expandable rows', () => {
  it('renders just the given columns, with no expander column or buttons', () => {
    renderWrapper(<AdminDataTable columns={columns} data={rows} />);

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(['Name', 'Amount']);
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByText('Alpha')).toBeInTheDocument();
    expect(screen.getByText('20.00').tagName).toBe('STRONG');
    expect(expandButtons()).toHaveLength(0);
    expect(screen.queryByRole('button', { name: 'Collapse row' })).not.toBeInTheDocument();
  });
});

describe('AdminDataTable with expandable rows', () => {
  it('adds an expander first, and a row opens and closes its detail', () => {
    renderWrapper(<AdminDataTable columns={columns} data={rows} renderRowSubComponent={detail} />);

    // The expander's heading is for screen readers only.
    expect(screen.getAllByRole('columnheader').map((header) => header.textContent))
      .toEqual(['Show details', 'Name', 'Amount']);
    expect(expandButtons()).toHaveLength(2);
    expect(screen.queryByTestId('detail')).not.toBeInTheDocument();

    fireEvent.click(expandButtons()[1]);
    expect(screen.getByTestId('detail')).toHaveTextContent('Detail of Beta');
    expect(screen.getByRole('button', { name: 'Collapse row' })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Collapse row' }));
    expect(screen.queryByTestId('detail')).not.toBeInTheDocument();
  });

  it('opens several rows at once', () => {
    renderWrapper(<AdminDataTable columns={columns} data={rows} renderRowSubComponent={detail} />);

    fireEvent.click(expandButtons()[0]);
    fireEvent.click(expandButtons()[0]);

    expect(screen.getAllByTestId('detail')).toHaveLength(2);
  });

  it('spans the detail across every column, the expander included', () => {
    renderWrapper(<AdminDataTable columns={columns} data={rows} renderRowSubComponent={detail} />);

    fireEvent.click(expandButtons()[0]);

    const cell = screen.getByTestId('detail').closest('td') as HTMLElement;
    expect(cell).toHaveAttribute('colspan', '3');
  });

  it('closes the open rows when the data changes, so a detail never sits under another row', () => {
    const { rerender } = renderWrapper(
      <AdminDataTable columns={columns} data={rows} renderRowSubComponent={detail} />,
    );
    fireEvent.click(expandButtons()[0]);
    expect(screen.getByTestId('detail')).toHaveTextContent('Detail of Alpha');

    rerender(
      <AdminDataTable
        columns={columns}
        data={[{ name: 'Gamma', amount: '5.00', paid: '5.00' }, ...rows]}
        renderRowSubComponent={detail}
      />,
    );

    expect(screen.queryByTestId('detail')).not.toBeInTheDocument();
    expect(screen.getByText('Gamma')).toBeInTheDocument();
  });

  it('keeps a row open across a re-render with the same data', () => {
    const { rerender } = renderWrapper(
      <AdminDataTable columns={columns} data={rows} renderRowSubComponent={detail} />,
    );
    fireEvent.click(expandButtons()[0]);

    rerender(<AdminDataTable columns={[...columns]} data={rows} renderRowSubComponent={(row) => detail(row)} />);

    expect(screen.getByTestId('detail')).toHaveTextContent('Detail of Alpha');
  });
});

describe('AdminDataTable columns', () => {
  it('shows two columns that share a label and a renderer, each with its own values and no key warning', () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    const same = (value: unknown) => <em>{value as string}</em>;
    const shared: ColumnDef<Row>[] = [
      { label: 'Amount', key: 'amount', renderCell: same },
      { label: 'Amount', key: 'paid', renderCell: same },
    ];
    renderWrapper(<AdminDataTable columns={shared} data={rows} />);

    expect(screen.getAllByRole('columnheader').map((header) => header.textContent)).toEqual(['Amount', 'Amount']);
    const first = within(screen.getAllByRole('row')[1]).getAllByRole('cell');
    expect(first.map((cell) => cell.textContent)).toEqual(['10.00', '8.00']);
    expect(errors.mock.calls.some(([message]) => String(message).includes('same key'))).toBe(false);
    errors.mockRestore();
  });

  it('lets two columns read the same data key when one gives an id', () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    const dup: ColumnDef<Row>[] = [
      { label: 'Amount', key: 'amount' },
      {
        label: 'Amount again', key: 'amount', id: 'amountAgain', renderCell: (value) => `=${value as string}`,
      },
    ];
    renderWrapper(<AdminDataTable columns={dup} data={rows} />);

    const first = within(screen.getAllByRole('row')[1]).getAllByRole('cell');
    expect(first.map((cell) => cell.textContent)).toEqual(['10.00', '=10.00']);
    expect(errors.mock.calls.some(([message]) => String(message).includes('Duplicate columns'))).toBe(false);
    errors.mockRestore();
  });

  it('keeps the state inside a cell when the table re-renders with new data and new column objects', () => {
    const Counter = () => {
      const [count, setCount] = useState(0);
      return <button type="button" onClick={() => setCount(count + 1)}>{`count ${count}`}</button>;
    };
    const build = (): ColumnDef<Row>[] => [
      { label: 'Name', key: 'name' },
      { label: 'Clicks', key: 'amount', renderCell: () => <Counter /> },
    ];
    const { rerender } = renderWrapper(<AdminDataTable columns={build()} data={rows} />);

    fireEvent.click(screen.getAllByRole('button', { name: 'count 0' })[0]);
    expect(screen.getByRole('button', { name: 'count 1' })).toBeInTheDocument();

    rerender(<AdminDataTable columns={build()} data={rows.map((row) => ({ ...row }))} />);

    expect(screen.getByRole('button', { name: 'count 1' })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: 'count 0' })).toHaveLength(1);
  });
});

describe('AdminDataTable states', () => {
  it('shows the loading state, not the rows, while loading', () => {
    renderWrapper(<AdminDataTable columns={columns} data={rows} isLoading />);

    expect(screen.getByLabelText('Loading data…')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('shows the empty state when there are no rows', () => {
    renderWrapper(<AdminDataTable columns={columns} data={[]} />);

    expect(screen.getByText('No results found.')).toBeInTheDocument();
  });
});
