/**
 * OrgListStatsStrip — global tiles and one compact chart of the top organizations.
 */
import { fireEvent, render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import OrgListStatsStrip from './OrgListStatsStrip';

jest.mock('../data/hooks', () => ({ useOrgListStats: jest.fn(), orgListStatsRefresh: jest.fn() }));

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
  series: { organizationsByMonth: [{ period: '2026-09', value: 2 }, { period: '2026-10', value: 5 }] },
};
const query = (overrides = {}) => ({
  data: stats, isLoading: false, isError: false, error: null, refetch: jest.fn(), ...overrides,
});
const mockQuery = (value: unknown) => (hooks.useOrgListStats as jest.Mock).mockReturnValue(value);

describe('OrgListStatsStrip', () => {
  beforeEach(() => chartProps.mockClear());

  it('passes the selected range to the query and refresh', () => {
    mockQuery(query());
    (hooks.orgListStatsRefresh as jest.Mock).mockReturnValue({ queryKey: ['org'], fetch: jest.fn() });
    renderWrapper(<OrgListStatsStrip />);
    fireEvent.click(screen.getByRole('button', { name: /All time/ }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Last 30 days' }));
    expect(hooks.useOrgListStats).toHaveBeenLastCalledWith(true, expect.any(String), expect.any(String));
    expect(screen.getByText('Showing data for the selected range. Current-state figures are unchanged.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Refresh statistics' }));
    expect(hooks.orgListStatsRefresh).toHaveBeenCalledWith(expect.any(String), expect.any(String));
  });

  it('shows the global tiles and two charts', () => {
    mockQuery(query());
    renderWrapper(<OrgListStatsStrip />);

    expect(screen.getByText('12')).toBeInTheDocument();
    expect(screen.getByText('Organizations with courses')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('140')).toBeInTheDocument();
    expect(screen.getByText('5,200')).toBeInTheDocument();
    expect(screen.getAllByTestId('metric-chart')).toHaveLength(2);
  });

  it('puts the course count in brackets next to each organization name', () => {
    mockQuery(query());
    renderWrapper(<OrgListStatsStrip />);

    const { data } = chartProps.mock.calls.find((call) => call[0].categoryLabels)[0];
    expect(data.map((point: { name: string }) => point.name)).toEqual(['Rwaq (40)', 'A very long organization name (7)']);
  });

  it('draws the organizations added per month as a second bar chart', () => {
    mockQuery(query());
    renderWrapper(<OrgListStatsStrip />);

    expect(screen.getByText('Organizations added per month')).toBeInTheDocument();
    const added = chartProps.mock.calls.map((call) => call[0]).find((props) => !props.categoryLabels);
    expect(added.type).toBe('bar');
    expect(added.series).toEqual(['Organizations']);
    expect(added.data.map((point: Record<string, unknown>) => point.Organizations)).toEqual([2, 5]);
  });

  it('shows an empty added chart when every month is zero, and keeps the top chart', () => {
    mockQuery(query({ data: { ...stats, series: { organizationsByMonth: [{ period: '2026-10', value: 0 }] } } }));
    renderWrapper(<OrgListStatsStrip />);

    expect(screen.getByText('Nothing to show yet.')).toBeInTheDocument();
    expect(screen.getAllByTestId('metric-chart')).toHaveLength(1);
  });

  it('uses Arabic organization names in Arabic and English when an Arabic name is missing', () => {
    mockQuery(query());
    render(
      <QueryClientProvider client={new QueryClient()}>
        <IntlProvider locale="ar"><OrgListStatsStrip /></IntlProvider>
      </QueryClientProvider>,
    );

    const { data } = chartProps.mock.calls.find((call) => call[0].categoryLabels)[0];
    expect(data.map((point: { name: string }) => point.name)).toEqual([
      'رواق (40)', 'A very long organization name (7)',
    ]);
  });

  it('asks only while expanded', () => {
    mockQuery(query());
    renderWrapper(<OrgListStatsStrip />);

    expect(hooks.useOrgListStats).toHaveBeenCalledWith(true, undefined, undefined);
    fireEvent.click(screen.getByRole('button', { name: 'Hide statistics' }));
    expect(hooks.useOrgListStats).toHaveBeenLastCalledWith(false, undefined, undefined);
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
