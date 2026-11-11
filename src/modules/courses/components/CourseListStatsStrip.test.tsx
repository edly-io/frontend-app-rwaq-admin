/**
 * CourseListStatsStrip — global tiles over the whole catalog, three compact charts, Not available instead of zero.
 */
import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import CourseListStatsStrip from './CourseListStatsStrip';

jest.mock('../data/hooks', () => ({ useCourseListStats: jest.fn() }));
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
    expect(screen.getByText('80')).toBeInTheDocument();
    expect(screen.getByText('6 with no type set')).toBeInTheDocument();
    expect(screen.getAllByTestId('metric-chart')).toHaveLength(3);
  });

  it('fetches only while expanded, because it runs over the whole catalog', () => {
    mockQuery(query());
    renderWrapper(<CourseListStatsStrip />);

    expect(hooks.useCourseListStats).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByRole('button', { name: 'Hide statistics' }));
    expect(hooks.useCourseListStats).toHaveBeenLastCalledWith(false);
  });

  it('shows Not available for enrollments and certificates that could not be read, never zero', () => {
    mockQuery(query({
      data: { ...stats, tiles: { ...stats.tiles, activeEnrollments: null, certificatesIssued: null } },
    }));
    renderWrapper(<CourseListStatsStrip />);

    expect(screen.getAllByText('Not available')).toHaveLength(2);
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
