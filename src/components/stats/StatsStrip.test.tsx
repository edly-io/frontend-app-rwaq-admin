/**
 * StatsStrip — the refresh button shows only when the page gives it a handler, says when the figures were
 * computed, is marked busy while refreshing, and shows a message when the refresh failed.
 */
import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import StatsStrip from './StatsStrip';

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

const strip = (props = {}) => renderWrapper(
  <StatsStrip isOpen onToggle={jest.fn()} {...props}>
    <div>tiles</div>
  </StatsStrip>,
);

describe('StatsStrip refresh', () => {
  it('shows no refresh button when the page gives no handler', () => {
    strip();
    expect(screen.queryByRole('button', { name: 'Refresh statistics' })).not.toBeInTheDocument();
  });

  it('calls the handler when the button is clicked', () => {
    const onRefresh = jest.fn();
    strip({ onRefresh });
    fireEvent.click(screen.getByRole('button', { name: 'Refresh statistics' }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });

  it('marks the button busy while refreshing', () => {
    strip({ onRefresh: jest.fn(), isRefreshing: true });
    expect(screen.getByRole('button', { name: 'Refresh statistics' })).toHaveAttribute('aria-busy', 'true');
  });

  it('says how long ago the figures were computed', () => {
    strip({ onRefresh: jest.fn(), generatedAt: minutesAgo(3) });
    expect(screen.getByText('updated 3 min ago')).toBeInTheDocument();
  });

  it('shows a message when the refresh failed and keeps the tiles', () => {
    strip({ onRefresh: jest.fn(), hasRefreshFailed: true });
    expect(screen.getByText('Could not refresh the statistics. Try again in a moment.')).toBeInTheDocument();
    expect(screen.getByText('tiles')).toBeInTheDocument();
  });
});
