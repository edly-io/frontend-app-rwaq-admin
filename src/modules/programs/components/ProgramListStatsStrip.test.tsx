/**
 * ProgramListStatsStrip — global tiles and two compact charts, Not available instead of zero.
 */
import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import ProgramListStatsStrip from './ProgramListStatsStrip';

jest.mock('../data/hooks', () => ({ useProgramListStats: jest.fn() }));
jest.mock('@src/components/charts/MetricChart', () => ({
  __esModule: true,
  default: ({ ariaLabel }: { ariaLabel: string }) => <div data-testid="metric-chart" aria-label={ariaLabel} />,
}));

const stats = {
  tiles: {
    programs: { active: 6, draft: 3, archived: 2 },
    enrollments: 540,
    learners: 410,
    completionPct: 37.5,
    averageCoursesPassed: 2.3,
  },
  funnel: { enrolled: 540, started: 300, completed: 202 },
  series: { enrollmentsByMonth: [{ period: '2026-09', value: 30 }, { period: '2026-10', value: 41 }] },
};
const query = (overrides = {}) => ({
  data: stats, isLoading: false, isError: false, error: null, refetch: jest.fn(), ...overrides,
});
const mockQuery = (value: unknown) => (hooks.useProgramListStats as jest.Mock).mockReturnValue(value);

describe('ProgramListStatsStrip', () => {
  it('shows the global tiles and two charts', () => {
    mockQuery(query());
    renderWrapper(<ProgramListStatsStrip />);

    expect(screen.getByText('540')).toBeInTheDocument();
    expect(screen.getByText('410 learners')).toBeInTheDocument();
    expect(screen.getByText('37.5%')).toBeInTheDocument();
    expect(screen.getByText('2.3')).toBeInTheDocument();
    expect(screen.getAllByTestId('metric-chart')).toHaveLength(2);
  });

  it('asks only while expanded', () => {
    mockQuery(query());
    renderWrapper(<ProgramListStatsStrip />);

    expect(hooks.useProgramListStats).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByRole('button', { name: 'Hide statistics' }));
    expect(hooks.useProgramListStats).toHaveBeenLastCalledWith(false);
  });

  it('shows Not available for the rate and the average when they cannot be worked out, never zero', () => {
    mockQuery(query({
      data: {
        ...stats,
        tiles: { ...stats.tiles, completionPct: null, averageCoursesPassed: null },
        funnel: { enrolled: 540, started: null, completed: 202 },
      },
    }));
    renderWrapper(<ProgramListStatsStrip />);

    expect(screen.getAllByText('Not available')).toHaveLength(2);
  });

  it('shows skeletons while loading', () => {
    mockQuery(query({ data: undefined, isLoading: true }));
    renderWrapper(<ProgramListStatsStrip />);

    expect(screen.queryByText('540')).not.toBeInTheDocument();
    expect(screen.queryByTestId('metric-chart')).not.toBeInTheDocument();
  });

  it('shows an error with a retry', () => {
    const refetch = jest.fn();
    mockQuery(query({
      data: undefined, isError: true, error: { response: { status: 500 } }, refetch,
    }));
    renderWrapper(<ProgramListStatsStrip />);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows a separate message for a 403', () => {
    mockQuery(query({ data: undefined, isError: true, error: { response: { status: 403 } } }));
    renderWrapper(<ProgramListStatsStrip />);

    expect(screen.getByText('Only superusers can see these statistics.')).toBeInTheDocument();
  });

  it('shows an empty chart when every month is zero', () => {
    mockQuery(query({ data: { ...stats, series: { enrollmentsByMonth: [{ period: '2026-10', value: 0 }] } } }));
    renderWrapper(<ProgramListStatsStrip />);

    expect(screen.getByText('Nothing to show yet.')).toBeInTheDocument();
  });
});
