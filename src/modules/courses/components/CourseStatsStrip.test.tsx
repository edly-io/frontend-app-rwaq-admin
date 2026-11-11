/**
 * CourseStatsStrip — plain counts, a learner funnel, and Not available instead of zero.
 */
import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import CourseStatsStrip from './CourseStatsStrip';

jest.mock('../data/hooks', () => ({ useCourseStats: jest.fn() }));
jest.mock('@src/components/charts/MetricChart', () => ({
  __esModule: true,
  default: ({ ariaLabel }: { ariaLabel: string }) => <div data-testid="metric-chart" aria-label={ariaLabel} />,
}));

const stats = {
  tiles: {
    activeLearners: 30,
    enrolled: 40,
    unenrolled: 5,
    certificates: 7,
    passed: 10,
    inProgress: 20,
    notStarted: 10,
    modes: [{ mode: 'honor', count: 40 }],
  },
  funnel: {
    enrolled: 40, started: 30, passed: 10, certified: 7,
  },
  series: { enrollmentsByMonth: [{ period: '2026-09', value: 3 }, { period: '2026-10', value: 5 }] },
};
const query = (overrides = {}) => ({
  data: stats, isLoading: false, isError: false, error: null, refetch: jest.fn(), ...overrides,
});
const mockQuery = (value: unknown) => (hooks.useCourseStats as jest.Mock).mockReturnValue(value);

describe('CourseStatsStrip', () => {
  it('shows counts and three charts, and no pass rate', () => {
    mockQuery(query());
    renderWrapper(<CourseStatsStrip courseId="course-v1:Org+C1+2026" />);

    expect(hooks.useCourseStats).toHaveBeenCalledWith('course-v1:Org+C1+2026', true);
    expect(screen.getByText('Passed')).toBeInTheDocument();
    expect(screen.getByText('In progress')).toBeInTheDocument();
    expect(screen.getByText('Not started')).toBeInTheDocument();
    expect(screen.getAllByTestId('metric-chart')).toHaveLength(3);
    expect(screen.queryByText(/pass rate/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/%/)).not.toBeInTheDocument();
  });

  it('shows Not available for figures that could not be read, never zero', () => {
    mockQuery(query({
      data: {
        ...stats,
        tiles: {
          ...stats.tiles, passed: null, inProgress: null, notStarted: null, certificates: null,
        },
        funnel: {
          enrolled: 40, started: null, passed: null, certified: null,
        },
      },
    }));
    renderWrapper(<CourseStatsStrip courseId="c" />);

    expect(screen.getAllByText('Not available').length).toBeGreaterThanOrEqual(4);
  });

  it('shows skeletons while loading', () => {
    mockQuery(query({ data: undefined, isLoading: true }));
    renderWrapper(<CourseStatsStrip courseId="c" />);

    expect(screen.queryByText('40')).not.toBeInTheDocument();
    expect(screen.queryByTestId('metric-chart')).not.toBeInTheDocument();
  });

  it('shows an error with a retry', () => {
    const refetch = jest.fn();
    mockQuery(query({
      data: undefined, isError: true, error: { response: { status: 500 } }, refetch,
    }));
    renderWrapper(<CourseStatsStrip courseId="c" />);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows a separate message for a 403', () => {
    mockQuery(query({ data: undefined, isError: true, error: { response: { status: 403 } } }));
    renderWrapper(<CourseStatsStrip courseId="c" />);

    expect(screen.getByText('Only superusers can see these statistics.')).toBeInTheDocument();
  });

  it('stops asking while collapsed', () => {
    mockQuery(query());
    renderWrapper(<CourseStatsStrip courseId="c" />);

    fireEvent.click(screen.getByRole('button', { name: 'Hide statistics' }));
    expect(hooks.useCourseStats).toHaveBeenLastCalledWith('c', false);
  });

  it('shows an empty chart when every month is zero', () => {
    mockQuery(query({ data: { ...stats, series: { enrollmentsByMonth: [{ period: '2026-10', value: 0 }] } } }));
    renderWrapper(<CourseStatsStrip courseId="c" />);

    expect(screen.getByText('Nothing to show yet.')).toBeInTheDocument();
  });
});
