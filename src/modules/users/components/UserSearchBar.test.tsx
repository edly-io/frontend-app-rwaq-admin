/**
 * Search bar: client-side validation mirrors the backend contract, so a
 * malformed term never costs a round trip.
 */
import { screen, fireEvent } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import UserSearchBar from './UserSearchBar';

const setup = (onSearch = jest.fn(), onClear = jest.fn()) => {
  renderWrapper(
    <UserSearchBar onSearch={onSearch} onClear={onClear} initialBy="email" initialTerm="" />,
  );
  return { onSearch, onClear };
};

describe('UserSearchBar', () => {
  it('rejects an email term with no @ and does not search', () => {
    const { onSearch } = setup();

    fireEvent.change(screen.getByLabelText('Search term'), { target: { value: 'nope' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByText(/valid email address/i)).toBeInTheDocument();
  });

  it('rejects a non-numeric user ID', () => {
    const { onSearch } = setup();

    fireEvent.change(screen.getByLabelText('Search by'), { target: { value: 'user_id' } });
    fireEvent.change(screen.getByLabelText('Search term'), { target: { value: 'abc' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSearch).not.toHaveBeenCalled();
    expect(screen.getByText(/must be a number/i)).toBeInTheDocument();
  });

  it('searches a valid email term', () => {
    const { onSearch } = setup();

    fireEvent.change(screen.getByLabelText('Search term'), { target: { value: ' a@x.com ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSearch).toHaveBeenCalledWith('email', 'a@x.com');
  });

  it('searches a job term without email validation', () => {
    const { onSearch } = setup();

    fireEvent.change(screen.getByLabelText('Search by'), { target: { value: 'job' } });
    fireEvent.change(screen.getByLabelText('Search term'), { target: { value: 'engineer' } });
    fireEvent.click(screen.getByRole('button', { name: 'Search' }));

    expect(onSearch).toHaveBeenCalledWith('job', 'engineer');
  });

  it('clears the term', () => {
    const { onClear } = setup();

    fireEvent.change(screen.getByLabelText('Search term'), { target: { value: 'a@x.com' } });
    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    expect(onClear).toHaveBeenCalled();
    expect(screen.getByLabelText('Search term')).toHaveValue('');
  });
});
