import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import EmptyState from './EmptyState';

describe('EmptyState', () => {
  it('renders default title and body', () => {
    renderWrapper(<EmptyState />);
    expect(screen.getByText('No data')).toBeInTheDocument();
    expect(screen.getByText('There are no items to display.')).toBeInTheDocument();
  });

  it('renders custom title and body', () => {
    renderWrapper(<EmptyState title="No orgs found" body="Try a different search." />);
    expect(screen.getByText('No orgs found')).toBeInTheDocument();
    expect(screen.getByText('Try a different search.')).toBeInTheDocument();
  });

  it('renders the action slot', () => {
    renderWrapper(
      <EmptyState action={<button type="button">Create org</button>} />,
    );
    expect(screen.getByRole('button', { name: 'Create org' })).toBeInTheDocument();
  });
});
