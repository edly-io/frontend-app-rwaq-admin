/**
 * OrgListStatsStrip — global tiles and one compact chart of the top organizations.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import OrgListStatsStrip from './OrgListStatsStrip';

jest.mock('../data/hooks', () => ({ useOrgListStats: jest.fn() }));

const chartProps = jest.fn();
jest.mock('@src/components/charts/MetricChart', () => ({
  __esModule: true,
  default: (props: { ariaLabel: string }) => {
    chartProps(props);
    return <div data-testid="metric-chart" aria-label={props.ariaLabel} />;
  },
}));

const stats = {
  tiles: {
    activeOrganizations: 12,
    organizationsWithCourses: 3,
    courses: 140,
    programs: 18,
    enrollments: 5200,
  },
  topOrganizations: [
    {
      shortName: 'RWAQ', name: 'Rwaq', arabicName: 'رواق', courses: 40, enrollments: 2000,
    },
    {
      shortName: 'ARB', name: 'A very long organization name', arabicName: '', courses: 7, enrollments: 900,
    },
  ],
};
const query = (overrides = {}) => ({
  data: stats, isLoading: false, isError: false, error: null, refetch: jest.fn(), ...overrides,
});
const mockQuery = (value: unknown) => (hooks.useOrgListStats as jest.Mock).mockReturnValue(value);

describe('OrgListStatsStrip', () => {
  beforeEach(() => chartProps.mockClear());

  it('shows the global tiles and exactly one chart', () => {
    mockQuery(query());
    renderWrapper(<OrgListStatsStrip />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Organizations with courses')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('140')).toBeInTheDocument();
    expect(screen.getByText('5,200')).toBeInTheDocument();
    expect(screen.getAllByTestId('metric-chart')).toHaveLength(1);
  });

  it('puts the course count in brackets next to each organization name', () => {
    mockQuery(query());
    renderWrapper(<OrgListStatsStrip />);

    const { data } = chartProps.mock.calls.at(-1)[0];
    expect(data.map((point: { name: string }) => point.name)).toEqual(['Rwaq (40)', 'A very long organization name (7)']);
    expect(chartProps.mock.calls.at(-1)[0].horizontalBars).toBe(true);
  });

  it('uses Arabic organization names in Arabic and English when an Arabic name is missing', () => {
    mockQuery(query());
    render(<IntlProvider locale="ar"><OrgListStatsStrip /></IntlProvider>);

    const { data } = chartProps.mock.calls.at(-1)[0];
    expect(data.map((point: { name: string }) => point.name)).toEqual([
      'رواق (40)', 'A very long organization name (7)',
    ]);
  });

  it('asks only while expanded', () => {
    mockQuery(query());
    renderWrapper(<OrgListStatsStrip />);

    expect(hooks.useOrgListStats).toHaveBeenCalledWith(true);
    fireEvent.click(screen.getByRole('button', { name: 'Hide statistics' }));
    expect(hooks.useOrgListStats).toHaveBeenLastCalledWith(false);
  });

  it('shows skeletons while loading', () => {
    mockQuery(query({ data: undefined, isLoading: true }));
    renderWrapper(<OrgListStatsStrip />);

    expect(screen.queryByText('12')).not.toBeInTheDocument();
    expect(screen.queryByTestId('metric-chart')).not.toBeInTheDocument();
  });

  it('shows an error with a retry', () => {
    const refetch = jest.fn();
    mockQuery(query({
      data: undefined, isError: true, error: { response: { status: 500 } }, refetch,
    }));
    renderWrapper(<OrgListStatsStrip />);

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows a separate message for a 403', () => {
    mockQuery(query({ data: undefined, isError: true, error: { response: { status: 403 } } }));
    renderWrapper(<OrgListStatsStrip />);

    expect(screen.getByText('Only superusers can see these statistics.')).toBeInTheDocument();
  });

  it('shows an empty chart when no organization has an enrollment', () => {
    mockQuery(query({
      data: { ...stats, topOrganizations: [{ ...stats.topOrganizations[0], enrollments: 0 }] },
    }));
    renderWrapper(<OrgListStatsStrip />);

    expect(screen.getByText('Nothing to show yet.')).toBeInTheDocument();
  });
});
