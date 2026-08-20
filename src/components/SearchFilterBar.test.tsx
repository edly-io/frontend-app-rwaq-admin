/**
 * Action bar: search submission, validation, the Filters toggle, and chips.
 */
import { screen, fireEvent } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import SearchFilterBar from './SearchFilterBar';

const scopes = [
  { value: 'email', label: 'Email' },
  { value: 'user_id', label: 'User ID' },
];

const filterGroups = (onChange = jest.fn()) => [
  {
    id: 'filter',
    label: 'Filter by',
    value: 'all',
    options: [{ value: 'all', label: 'All users' }, { value: 'active', label: 'Active' }],
    onChange,
  },
];

describe('SearchFilterBar', () => {
  it('submits the trimmed term when the search icon is clicked', () => {
    const onSearch = jest.fn();
    renderWrapper(<SearchFilterBar searchTerm="" onSearch={onSearch} scopes={scopes} scope="email" />);

    fireEvent.change(screen.getByLabelText('Search term'), { target: { value: '  a@x.com  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSearch).toHaveBeenCalledWith('a@x.com');
  });

  it('submits on Enter', () => {
    const onSearch = jest.fn();
    const { container } = renderWrapper(
      <SearchFilterBar searchTerm="" onSearch={onSearch} scopes={scopes} scope="email" />,
    );

    fireEvent.change(screen.getByLabelText('Search term'), { target: { value: 'b@x.com' } });
    fireEvent.submit(container.querySelector('form') as HTMLFormElement);

    expect(onSearch).toHaveBeenCalledWith('b@x.com');
  });

  it('blocks submission when validation fails and shows the reason', () => {
    const onSearch = jest.fn();
    renderWrapper(
      <SearchFilterBar
        searchTerm=""
        onSearch={onSearch}
        scopes={scopes}
        scope="user_id"
        validateSearch={(_scope, term) => (/^\d+$/.test(term) ? '' : 'Numbers only')}
      />,
    );

    fireEvent.change(screen.getByLabelText('Search term'), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByText('Numbers only')).toBeInTheDocument();
  });

  it('has no standalone Search or Clear buttons in the bar', () => {
    renderWrapper(<SearchFilterBar searchTerm="" onSearch={jest.fn()} />);

    // The only "Search" control is the icon button inside the input group.
    expect(screen.queryByRole('button', { name: /^clear$/i })).not.toBeInTheDocument();
  });

  it('keeps the filter panel collapsed until Filters is pressed', () => {
    renderWrapper(
      <SearchFilterBar searchTerm="" onSearch={jest.fn()} filterGroups={filterGroups()} />,
    );

    const toggle = screen.getByRole('button', { name: 'Filters' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByLabelText('Filter by')).toBeEnabled();
  });

  it('starts expanded when filters are already applied', () => {
    renderWrapper(
      <SearchFilterBar
        searchTerm=""
        onSearch={jest.fn()}
        filterGroups={filterGroups()}
        appliedChips={[{ key: 'f', label: 'Filter: Active', onRemove: jest.fn() }]}
      />,
    );

    expect(screen.getByRole('button', { name: 'Filters' })).toHaveAttribute('aria-expanded', 'true');
  });

  it('renders applied chips with a clear-all action', () => {
    const onRemove = jest.fn();
    const onClearAll = jest.fn();
    renderWrapper(
      <SearchFilterBar
        searchTerm=""
        onSearch={jest.fn()}
        filterGroups={filterGroups()}
        appliedChips={[{ key: 'f', label: 'Filter: Active', onRemove }]}
        onClearAll={onClearAll}
      />,
    );

    expect(screen.getByText('Applied filters')).toBeInTheDocument();
    expect(screen.getByText('Filter: Active')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Remove Filter: Active' }));
    expect(onRemove).toHaveBeenCalled();

    fireEvent.click(screen.getByRole('button', { name: 'Clear all' }));
    expect(onClearAll).toHaveBeenCalled();
  });
});
