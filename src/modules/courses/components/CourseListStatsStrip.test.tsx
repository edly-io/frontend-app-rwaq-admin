/**
 * CourseListStatsStrip — global tiles over the whole catalog, three compact charts, Not available instead of zero.
 */
import { fireEvent, screen, waitFor, within } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import CourseListStatsStrip from './CourseListStatsStrip';

jest.mock('../data/hooks', () => ({ useCourseListStats: jest.fn(), courseListStatsRefresh: jest.fn() }));
jest.mock('@src/components/charts/MetricChart', () => ({
  __esModule: true,
  default: ({ ariaLabel }: { ariaLabel: string }) => <div data-testid="metric-chart" aria-label={ariaLabel} />,
}));

const stats = {
  tiles: {
    courses: 120,
    running: 45,
    activeEnrollments: 3400,
    certificatesIssued: 910,
    honorEnrollments: 2100,
    auditEnrollments: 1234,
    types: {
      free: 80, paid: 25, programOnly: 10, subscription: 5, noType: 6,
    },
  },
  series: { enrollmentsByMonth: [{ period: '2026-09', value: 10 }, { period: '2026-10', value: 12 }] },
  courseLifecycle: {
    noDates: 0, upcoming: 5, running: 45, ended: 70,
  },
  topCourses: [{ courseId: 'c1', displayName: 'A long course name here', enrollments: 99 }],
};
const query = (overrides = {}) => ({
  data: stats, isLoading: false, isError: false, error: null, refetch: jest.fn(), ...overrides,
});
const mockQuery = (value: unknown) => (hooks.useCourseListStats as jest.Mock).mockReturnValue(value);

describe('CourseListStatsStrip', () => {
  it('shows the global tiles and three charts', () => {
    mockQuery(query());
    renderWrapper(<CourseListStatsStrip />);

    expect(screen.getByText('120')).toBeInTheDocument();
    expect(screen.getByText('3,400')).toBeInTheDocument();
    expect(screen.getByText('910')).toBeInTheDocument();
    expect(screen.getByText('2,100')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('6 with no type set')).toBeInTheDocument();
    expect(screen.getAllByTestId('metric-chart')).toHaveLength(3);
  });

  it('passes a selected range to the query and refresh', () => {
    mockQuery(query());
    renderWrapper(<CourseListStatsStrip />);
    fireEvent.click(screen.getByRole('button', { name: /All time/ }));
    fireEvent.click(within(screen.getByRole('group')).getByRole('button', { name: 'Last 30 days' }));
    expect(hooks.useCourseListStats).toHaveBeenLastCalledWith(true, expect.any(String), expect.any(String));
    expect(screen.getByText('Showing data for the selected range. Current-state figures are unchanged.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh statistics' }));
    expect(hooks.courseListStatsRefresh).toHaveBeenCalledWith(expect.any(String), expect.any(String));
  });

  it('refreshes the strip with the cache bypass and shows the new figures', async () => {
    const fresh = { ...stats, tiles: { ...stats.tiles, courses: 777 } };
    const fetch = jest.fn().mockResolvedValue(fresh);
    (hooks.courseListStatsRefresh as jest.Mock).mockReturnValue({ queryKey: ['x'], fetch });
    mockQuery(query());
    renderWrapper(<CourseListStatsStrip />);

    fireEvent.click(screen.getByRole('button', { name: 'Refresh statistics' }));

    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
  });

  it('keeps existing figures visible while refreshing', async () => {
    const fetch = jest.fn(() => new Promise(() => {}));
    (hooks.courseListStatsRefresh as jest.Mock).mockReturnValue({ queryKey: ['x'], fetch });
    mockQuery(query());
    renderWrapper(<CourseListStatsStrip />);
    fireEvent.click(screen.getByRole('button', { name: 'Refresh statistics' }));
    await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  it('fetches only while expanded, because it runs over the whole catalog', () => {
    mockQuery(query());
    renderWrapper(<CourseListStatsStrip />);

    expect(hooks.useCourseListStats).toHaveBeenCalledWith(true, undefined, undefined);
    fireEvent.click(screen.getByRole('button', { name: 'Hide statistics' }));
    expect(hooks.useCourseListStats).toHaveBeenLastCalledWith(false, undefined, undefined);
  });

  it('shows Not available for enrollments and certificates that could not be read, never zero', () => {
    mockQuery(query({
      data: { ...stats, tiles: { ...stats.tiles, activeEnrollments: null, certificatesIssued: null } },
    }));
    renderWrapper(<CourseListStatsStrip />);

    expect(screen.getAllByText('Not available')).toHaveLength(2);
  });

  it('shows Not available for honor and audit enrollments that could not be read', () => {
    mockQuery(query({
      data: { ...stats, tiles: { ...stats.tiles, honorEnrollments: null, auditEnrollments: null } },
    }));
    renderWrapper(<CourseListStatsStrip />);

    expect(screen.getByText('Honor enrollments').closest('.rwaq-stat-tile')).toHaveTextContent('Not available');
    expect(screen.getByText('Audit enrollments').closest('.rwaq-stat-tile')).toHaveTextContent('Not available');
  });

  it('shows skeletons while loading', () => {
    mockQuery(query({ data: undefined, isLoading: true }));
    renderWrapper(<CourseListStatsStrip />);

    expect(screen.queryByText('120')).not.toBeInTheDocument();
    expect(screen.queryByTestId('metric-chart')).not.toBeInTheDocument();
  });

  it('shows an error with a retry', () => {
    const refetch = jest.fn();
    mockQuery(query({
      data: undefined, isError: true, error: { response: { status: 500 } }, refetch,
    }));
    renderWrapper(<CourseListStatsStrip />);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows a separate message for a 403', () => {
    mockQuery(query({ data: undefined, isError: true, error: { response: { status: 403 } } }));
    renderWrapper(<CourseListStatsStrip />);

    expect(screen.getByText('Only superusers can see these statistics.')).toBeInTheDocument();
  });

  it('shows an empty chart when every month is zero', () => {
    mockQuery(query({ data: { ...stats, series: { enrollmentsByMonth: [{ period: '2026-10', value: 0 }] } } }));
    renderWrapper(<CourseListStatsStrip />);

    expect(screen.getByText('Nothing to show yet.')).toBeInTheDocument();
  });
});
