/**
 * OrgStatsStrip — tiles and charts of one organization, read from the Dashboard endpoints with `org`.
 */
import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as dashboardHooks from '@src/modules/dashboard/data/hooks';
import OrgStatsStrip from './OrgStatsStrip';

jest.mock('@src/modules/dashboard/data/hooks', () => ({
  useAnalyticsSummary: jest.fn(),
  useAnalyticsTrends: jest.fn(),
  useAnalyticsBreakdowns: jest.fn(),
}));
jest.mock('@src/components/charts/MetricChart', () => ({
  __esModule: true,
  default: ({ ariaLabel }: { ariaLabel: string }) => <div data-testid="metric-chart" aria-label={ariaLabel} />,
}));

const ok = (data: unknown) => ({
  data, isLoading: false, isError: false, error: null, refetch: jest.fn(),
});
const failed = (status: number) => ({
  data: undefined, isLoading: false, isError: true, error: { response: { status } }, refetch: jest.fn(),
});
const loading = () => ({
  data: undefined, isLoading: true, isError: false, error: null, refetch: jest.fn(),
});

const summary = {
  totalLearners: 1200, activeEnrollments: 3400, totalCourses: 8, activePrograms: 1,
};
const trends = {
  enrollments: [{ period: '2026-09', value: 4 }, { period: '2026-10', value: 6 }],
  certificates: null,
  registrations: [],
};
const breakdowns = {
  courseLifecycle: {
    noDates: 0, upcoming: 1, running: 5, ended: 2,
  },
  certificates: { certificatesIssued: 77 },
  programs: { totalPrograms: 3 },
  catalogConcentration: { courses: [{ courseId: 'c1', displayName: 'Course one', enrollments: 9 }] },
};

const mockQueries = (s: unknown, t: unknown, b: unknown) => {
  (dashboardHooks.useAnalyticsSummary as jest.Mock).mockReturnValue(s);
  (dashboardHooks.useAnalyticsTrends as jest.Mock).mockReturnValue(t);
  (dashboardHooks.useAnalyticsBreakdowns as jest.Mock).mockReturnValue(b);
};

describe('OrgStatsStrip', () => {
  it('asks the dashboard endpoints for this organization and shows the figures', () => {
    mockQueries(ok(summary), ok(trends), ok(breakdowns));
    renderWrapper(<OrgStatsStrip org="QAOrg" adminCount={2} />);

    expect(dashboardHooks.useAnalyticsSummary).toHaveBeenCalledWith({ org: 'QAOrg' });
    expect(dashboardHooks.useAnalyticsTrends).toHaveBeenCalledWith({ org: 'QAOrg', months: 12 });
    expect(dashboardHooks.useAnalyticsBreakdowns).toHaveBeenCalledWith({ org: 'QAOrg' });
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('3,400')).toBeInTheDocument();
    expect(screen.getByText('77')).toBeInTheDocument();
    expect(screen.getAllByTestId('metric-chart')).toHaveLength(3);
  });

  it('shows Not available for unreadable certificates, never zero', () => {
    mockQueries(ok(summary), ok(trends), ok({ ...breakdowns, certificates: { certificatesIssued: null } }));
    renderWrapper(<OrgStatsStrip org="QAOrg" adminCount={2} />);

    expect(screen.getByText('Not available')).toBeInTheDocument();
  });

  it('shows skeletons while loading', () => {
    mockQueries(loading(), loading(), loading());
    renderWrapper(<OrgStatsStrip org="QAOrg" adminCount={2} />);

    expect(screen.queryByText('1,200')).not.toBeInTheDocument();
    expect(screen.queryByTestId('metric-chart')).not.toBeInTheDocument();
  });

  it('shows an error with a retry when every request failed', () => {
    const queries = [failed(500), failed(500), failed(500)];
    mockQueries(queries[0], queries[1], queries[2]);
    renderWrapper(<OrgStatsStrip org="QAOrg" adminCount={2} />);

    expect(screen.getByText('Could not load the statistics.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    queries.forEach((query) => expect(query.refetch).toHaveBeenCalled());
  });

  it('shows a separate message for a 403', () => {
    mockQueries(failed(403), failed(403), failed(403));
    renderWrapper(<OrgStatsStrip org="QAOrg" adminCount={2} />);

    expect(screen.getByText('Only superusers can see these statistics.')).toBeInTheDocument();
    expect(screen.queryByText('Could not load the statistics.')).not.toBeInTheDocument();
  });

  it('keeps the other figures when only the charts failed', () => {
    mockQueries(ok(summary), failed(500), ok(breakdowns));
    renderWrapper(<OrgStatsStrip org="QAOrg" adminCount={2} />);

    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('Not available')).toBeInTheDocument();
  });

  it('collapses and expands', () => {
    mockQueries(ok(summary), ok(trends), ok(breakdowns));
    renderWrapper(<OrgStatsStrip org="QAOrg" adminCount={2} />);

    fireEvent.click(screen.getByRole('button', { name: 'Hide statistics' }));
    expect(screen.queryByText('1,200')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Show statistics' }));
    expect(screen.getByText('1,200')).toBeInTheDocument();
  });
});
