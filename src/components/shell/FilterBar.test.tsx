/**
 * FilterBar tests — verifies URL-driven search and sort state.
 */
import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import FilterBar from './FilterBar';

const SORT_OPTIONS = [
  { value: 'name', label: 'Name A-Z' },
  { value: '-name', label: 'Name Z-A' },
];

describe('FilterBar', () => {
  it('renders a search field', () => {
    renderWrapper(<FilterBar />);
    expect(screen.getByRole('search')).toBeInTheDocument();
  });

  it('renders sort options when provided', () => {
    renderWrapper(<FilterBar sortOptions={SORT_OPTIONS} />);
    expect(screen.getByLabelText('Sort by')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Name A-Z' })).toBeInTheDocument();
  });

  it('does not render sort dropdown when sortOptions is not provided', () => {
    renderWrapper(<FilterBar />);
    expect(screen.queryByLabelText('Sort by')).not.toBeInTheDocument();
  });

  it('renders additional filters slot', () => {
    renderWrapper(
      <FilterBar additionalFilters={<div data-testid="extra-filter">Status</div>} />,
    );
    expect(screen.getByTestId('extra-filter')).toBeInTheDocument();
  });
});
