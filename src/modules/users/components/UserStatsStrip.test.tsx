/**
 * UserStatsStrip — enrollment figures from the list, programs and subscription from the stats endpoint.
 */
import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import type { UserEnrollment } from '../data/types';
import UserStatsStrip from './UserStatsStrip';

jest.mock('../data/hooks', () => ({ useUserStats: jest.fn() }));
jest.mock('@src/components/charts/MetricChart', () => ({
  __esModule: true,
  default: ({ ariaLabel }: { ariaLabel: string }) => <div data-testid="metric-chart" aria-label={ariaLabel} />,
}));

const row = (overrides: Partial<UserEnrollment>): UserEnrollment => ({
  courseId: 'course-v1:Org+C1+2026',
  courseName: 'Course',
  enrolledAt: '2026-10-05T00:00:00Z',
  mode: 'honor',
  isActive: true,
  certificateStatus: 'downloadable',
  availableModes: ['honor'],
  lastChangeReason: null,
  lastChangeBy: null,
  lastChangeAt: null,
  status: 'passed',
  ...overrides,
});

const stats = {
  tiles: {
    certificatesEarned: 1,
    programsEnrolled: 2,
    programsCompleted: 1,
    lastActivityAvailable: true,
    lastActivityAt: '2026-11-01T10:00:00Z',
    subscriptionStatus: 'active',
    subscriptionEndsAt: '2027-01-01T00:00:00Z',
  },
};
const query = (overrides = {}) => ({
  data: stats, isLoading: false, isError: false, error: null, refetch: jest.fn(), ...overrides,
});
const mockStats = (value: unknown) => (hooks.useUserStats as jest.Mock).mockReturnValue(value);

const renderStrip = (props = {}) => renderWrapper(
  <UserStatsStrip
    userId={7}
    enrollments={[row({}), row({ courseId: 'b', status: 'in_progress', certificateStatus: 'notpassing' })]}
    isEnrollmentsLoading={false}
    progress={[{ courseId: 'course-v1:Org+C1+2026', progressPercent: 50 }, { courseId: 'b', progressPercent: 70 }]}
    isProgressLoading={false}
    {...props}
  />,
);

describe('UserStatsStrip', () => {
  it('shows the figures worked out from the enrollments list', () => {
    mockStats(query());
    renderStrip();

    expect(screen.getByText('of 2 in total')).toBeInTheDocument();
    expect(screen.getByText('60%')).toBeInTheDocument();
    expect(screen.getAllByTestId('metric-chart')).toHaveLength(2);
  });

  it('shows programs, last activity and subscription from the stats endpoint', () => {
    mockStats(query());
    renderStrip();

    expect(hooks.useUserStats).toHaveBeenCalledWith(7, true);
    expect(screen.getByText('1 completed')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText(/^Ends /)).toBeInTheDocument();
  });

  it('shows a spinner for overall completion until the progress has loaded', () => {
    mockStats(query());
    renderStrip({ progress: undefined, isProgressLoading: true });

    expect(screen.getByText('Loading progress')).toBeInTheDocument();
    expect(screen.queryByText('60%')).not.toBeInTheDocument();
  });

  it('shows Not available for overall completion when no progress could be read', () => {
    mockStats(query());
    renderStrip({ progress: undefined });

    expect(screen.getAllByText('Not available').length).toBeGreaterThan(0);
  });

  it('says No activity yet when the sources are readable and the user has none', () => {
    mockStats(query({ data: { tiles: { ...stats.tiles, lastActivityAt: null } } }));
    renderStrip();

    expect(screen.getByText('No activity yet')).toBeInTheDocument();
  });

  it('says Not available for last activity when no source can be read', () => {
    mockStats(query({ data: { tiles: { ...stats.tiles, lastActivityAvailable: false, lastActivityAt: null } } }));
    renderStrip();

    expect(screen.queryByText('No activity yet')).not.toBeInTheDocument();
    expect(screen.getAllByText('Not available').length).toBeGreaterThan(0);
  });

  it('keeps the enrollment figures when the stats endpoint failed', () => {
    mockStats(query({ data: undefined, isError: true, error: { response: { status: 500 } } }));
    renderStrip();

    expect(screen.getByText('of 2 in total')).toBeInTheDocument();
    expect(screen.getAllByText('Not available').length).toBeGreaterThan(0);
  });

  it('shows a separate message for a 403', () => {
    mockStats(query({ data: undefined, isError: true, error: { response: { status: 403 } } }));
    renderStrip();

    expect(screen.getByText('Only superusers can see these statistics.')).toBeInTheDocument();
  });

  it('shows skeletons while the enrollments load', () => {
    mockStats(query({ data: undefined, isLoading: true }));
    renderStrip({ enrollments: undefined, isEnrollmentsLoading: true });

    expect(screen.queryByTestId('metric-chart')).not.toBeInTheDocument();
  });

  it('stops asking for the stats while collapsed', () => {
    mockStats(query());
    renderStrip();

    fireEvent.click(screen.getByRole('button', { name: 'Hide statistics' }));
    expect(hooks.useUserStats).toHaveBeenLastCalledWith(7, false);
  });
});
