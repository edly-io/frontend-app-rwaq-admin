/**
 * UserListStatsStrip — global tiles and a compact registrations chart, Not available instead of zero.
 */
import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import UserListStatsStrip from './UserListStatsStrip';

jest.mock('../data/hooks', () => ({ useUserListStats: jest.fn() }));
jest.mock('@src/components/charts/MetricChart', () => ({
  __esModule: true,
  default: ({ ariaLabel }: { ariaLabel: string }) => <div data-testid="metric-chart" aria-label={ariaLabel} />,
}));

const stats = {
  tiles: {
    learners: 1200,
    newThisMonth: 40,
    newPreviousMonth: 32,
    newDeltaPct: 25,
    activeLast30Days: 800,
    legacy: { legacyAccounts: 500, signedInAtLeastOnce: 200, progressPct: 40 },
    subscribed: 77,
  },
  series: { registrationsByMonth: [{ period: '2026-09', value: 10 }, { period: '2026-10', value: 12 }] },
  signInMethods: { password: 900, google: 250, other: 50 },
};
const query = (overrides = {}) => ({
  data: stats, isLoading: false, isError: false, error: null, refetch: jest.fn(), ...overrides,
});
const mockQuery = (value: unknown) => (hooks.useUserListStats as jest.Mock).mockReturnValue(value);

describe('UserListStatsStrip', () => {
  it('shows the global tiles and registrations chart', () => {
    mockQuery(query());
    renderWrapper(<UserListStatsStrip />);

    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('800')).toBeInTheDocument();
    expect(screen.getByText('77')).toBeInTheDocument();
    expect(screen.getByText('300 of 500 still to sign in')).toBeInTheDocument();
    expect(screen.getByText('Totals for the whole platform, whatever the filters of the table.')).toBeInTheDocument();
    expect(screen.getAllByTestId('metric-chart')).toHaveLength(1);
  });

  it('asks only while expanded', () => {
    mockQuery(query());
    renderWrapper(<UserListStatsStrip />);

    expect(hooks.useUserListStats).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByRole('button', { name: 'Hide statistics' }));
    expect(hooks.useUserListStats).toHaveBeenLastCalledWith(false);
  });

  it('shows Not available for learners and activity when courseware cannot be read, never zero', () => {
    mockQuery(query({ data: { ...stats, tiles: { ...stats.tiles, learners: null, activeLast30Days: null } } }));
    renderWrapper(<UserListStatsStrip />);

    expect(screen.getAllByText('Not available')).toHaveLength(2);
  });

  it('shows skeletons while loading', () => {
    mockQuery(query({ data: undefined, isLoading: true }));
    renderWrapper(<UserListStatsStrip />);

    expect(screen.queryByText('1,200')).not.toBeInTheDocument();
    expect(screen.queryByTestId('metric-chart')).not.toBeInTheDocument();
  });

  it('shows an error with a retry', () => {
    const refetch = jest.fn();
    mockQuery(query({
      data: undefined, isError: true, error: { response: { status: 500 } }, refetch,
    }));
    renderWrapper(<UserListStatsStrip />);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows a separate message for a 403', () => {
    mockQuery(query({ data: undefined, isError: true, error: { response: { status: 403 } } }));
    renderWrapper(<UserListStatsStrip />);

    expect(screen.getByText('Only superusers can see these statistics.')).toBeInTheDocument();
  });

  it('shows an empty chart when every month is zero', () => {
    mockQuery(query({ data: { ...stats, series: { registrationsByMonth: [{ period: '2026-10', value: 0 }] } } }));
    renderWrapper(<UserListStatsStrip />);

    expect(screen.getByText('Nothing to show yet.')).toBeInTheDocument();
  });
});
