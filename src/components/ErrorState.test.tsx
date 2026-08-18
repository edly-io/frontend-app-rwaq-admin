import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import ErrorState from './ErrorState';

describe('ErrorState', () => {
  it('renders default title and body', () => {
    renderWrapper(<ErrorState />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
    expect(screen.getByText('An error occurred while loading the data. Please try again.')).toBeInTheDocument();
  });

  it('renders 403 / no-access message', () => {
    renderWrapper(<ErrorState statusCode={403} />);
    expect(screen.getByText('You do not have permission to view this page.')).toBeInTheDocument();
  });

  it('renders 404 / not-found message', () => {
    renderWrapper(<ErrorState statusCode={404} />);
    expect(screen.getByText('The requested resource was not found.')).toBeInTheDocument();
  });

  it('renders 500 / server-error with default message', () => {
    renderWrapper(<ErrorState statusCode={500} />);
    // 500 falls into SERVER_ERROR, gets the default body
    expect(screen.getByText('An error occurred while loading the data. Please try again.')).toBeInTheDocument();
  });

  it('renders custom title and body overriding status-derived text', () => {
    renderWrapper(<ErrorState statusCode={404} title="Org not found" body="The org does not exist." />);
    expect(screen.getByText('Org not found')).toBeInTheDocument();
    expect(screen.getByText('The org does not exist.')).toBeInTheDocument();
  });

  it('calls onRetry when the retry button is clicked', async () => {
    const onRetry = jest.fn();
    renderWrapper(<ErrorState onRetry={onRetry} />);
    await userEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it('does not render retry button when onRetry is not provided', () => {
    renderWrapper(<ErrorState />);
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument();
  });
});
