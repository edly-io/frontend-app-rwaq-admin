/**
 * ProgramStatsStrip — plain counts, per-course bars, Not available instead of zero.
 */
import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import ProgramStatsStrip from './ProgramStatsStrip';

jest.mock('../data/hooks', () => ({ useProgramStats: jest.fn() }));
jest.mock('@src/components/charts/MetricChart', () => ({
  __esModule: true,
  default: ({ ariaLabel }: { ariaLabel: string }) => <div data-testid="metric-chart" aria-label={ariaLabel} />,
}));

const UUID = '11111111-2222-3333-4444-555555555555';
const stats = {
  tiles: {
    enrolled: 50,
    completed: 20,
    inProgress: 18,
    notStarted: 12,
    completionPct: 40,
    averageCoursesPassed: 1.6,
    averageDaysToComplete: 33.5,
  },
  series: {
    enrollmentsByMonth: [{ period: '2026-09', value: 5 }, { period: '2026-10', value: 8 }],
    completionsByMonth: [{ period: '2026-10', value: 3 }],
  },
  courses: [{ courseId: 'c1', courseName: 'Course one', passed: 9 }],
};
const query = (overrides = {}) => ({
  data: stats, isLoading: false, isError: false, error: null, refetch: jest.fn(), ...overrides,
});
const mockQuery = (value: unknown) => (hooks.useProgramStats as jest.Mock).mockReturnValue(value);

describe('ProgramStatsStrip', () => {
  it('shows the counts and two charts', () => {
    mockQuery(query());
    renderWrapper(<ProgramStatsStrip uuid={UUID} />);

    expect(hooks.useProgramStats).toHaveBeenCalledWith(UUID, true);
    expect(screen.getByText('50')).toBeInTheDocument();
    expect(screen.getByText('18')).toBeInTheDocument();
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('33.5 days')).toBeInTheDocument();
    expect(screen.getAllByTestId('metric-chart')).toHaveLength(2);
  });

  it('shows Not available when grades or certificates cannot be read, never zero', () => {
    mockQuery(query({
      data: {
        ...stats,
        tiles: {
          ...stats.tiles, inProgress: null, notStarted: null, averageCoursesPassed: null,
        },
        courses: null,
      },
    }));
    renderWrapper(<ProgramStatsStrip uuid={UUID} />);

    expect(screen.getAllByText('Not available').length).toBeGreaterThanOrEqual(3);
    expect(screen.getAllByTestId('metric-chart')).toHaveLength(1);
  });

  it('shows Not available for the days when nobody completed', () => {
    mockQuery(query({ data: { ...stats, tiles: { ...stats.tiles, averageDaysToComplete: null } } }));
    renderWrapper(<ProgramStatsStrip uuid={UUID} />);

    expect(screen.getByText('Not available')).toBeInTheDocument();
  });

  it('shows skeletons while loading', () => {
    mockQuery(query({ data: undefined, isLoading: true }));
    renderWrapper(<ProgramStatsStrip uuid={UUID} />);

    expect(screen.queryByText('50')).not.toBeInTheDocument();
    expect(screen.queryByTestId('metric-chart')).not.toBeInTheDocument();
  });

  it('shows an error with a retry', () => {
    const refetch = jest.fn();
    mockQuery(query({
      data: undefined, isError: true, error: { response: { status: 500 } }, refetch,
    }));
    renderWrapper(<ProgramStatsStrip uuid={UUID} />);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows a separate message for a 403', () => {
    mockQuery(query({ data: undefined, isError: true, error: { response: { status: 403 } } }));
    renderWrapper(<ProgramStatsStrip uuid={UUID} />);

    expect(screen.getByText('Only superusers can see these statistics.')).toBeInTheDocument();
  });

  it('shows an empty chart when no month has an enrollment or a completion', () => {
    mockQuery(query({
      data: {
        ...stats,
        series: {
          enrollmentsByMonth: [{ period: '2026-10', value: 0 }],
          completionsByMonth: [{ period: '2026-10', value: 0 }],
        },
      },
    }));
    renderWrapper(<ProgramStatsStrip uuid={UUID} />);

    expect(screen.getByText('Nothing to show yet.')).toBeInTheDocument();
  });

  it('stops asking while collapsed', () => {
    mockQuery(query());
    renderWrapper(<ProgramStatsStrip uuid={UUID} />);

    fireEvent.click(screen.getByRole('button', { name: 'Hide statistics' }));
    expect(hooks.useProgramStats).toHaveBeenLastCalledWith(UUID, false);
  });
});
