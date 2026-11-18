/**
 * OrgStatsStrip — tiles and charts of one organization, read from the Dashboard endpoints with `org`.
 */
import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as dashboardHooks from '@src/modules/dashboard/data/hooks';
import * as orgHooks from '../data/hooks';
import OrgStatsStrip from './OrgStatsStrip';

jest.mock('@src/modules/dashboard/data/hooks', () => ({
  useAnalyticsSummary: jest.fn(),
  useAnalyticsTrends: jest.fn(),
  useAnalyticsBreakdowns: jest.fn(),
}));
jest.mock('../data/hooks', () => ({ useOrgStats: jest.fn() }));
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

const orgStats = {
  tiles: {
    enrolled: 50,
    passed: 21,
    passRatePercent: 42,
    notStarted: 13,
    inProgress: 16,
    unenrolled: 7,
    honorEnrollments: 31,
    auditEnrollments: 19,
  },
};

const mockQueries = (s: unknown, t: unknown, b: unknown, o: unknown = ok(orgStats)) => {
  (orgHooks.useOrgStats as jest.Mock).mockReturnValue(o);
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

    expect(screen.getAllByText('Not available')).toHaveLength(1);
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
    expect(screen.getAllByText('Not available')).toHaveLength(1);
  });

  const tileText = (label: string) => (screen.getByText(label).closest('.rwaq-stat-tile') as HTMLElement);

  it('asks the organization stats endpoint for this organization while expanded', () => {
    mockQueries(ok(summary), ok(trends), ok(breakdowns));
    renderWrapper(<OrgStatsStrip org="QAOrg" adminCount={2} />);

    expect(orgHooks.useOrgStats).toHaveBeenCalledWith('QAOrg', true);
    fireEvent.click(screen.getByRole('button', { name: 'Hide statistics' }));
    expect(orgHooks.useOrgStats).toHaveBeenLastCalledWith('QAOrg', false);
  });

  it('shows the seven tiles of the organization endpoint with their numbers', () => {
    mockQueries(ok(summary), ok(trends), ok(breakdowns));
    renderWrapper(<OrgStatsStrip org="QAOrg" adminCount={2} />);

    expect(tileText('Passed learners')).toHaveTextContent('21');
    expect(tileText('Pass rate')).toHaveTextContent('42%');
    expect(tileText('Learners not started')).toHaveTextContent('13');
    expect(tileText('Learners in progress')).toHaveTextContent('16');
    expect(tileText('Unenrolled')).toHaveTextContent('7');
    expect(tileText('Honor enrollments')).toHaveTextContent('31');
    expect(tileText('Audit enrollments')).toHaveTextContent('19');
  });

  it('shows Not available for a figure the endpoint could not read, never zero', () => {
    mockQueries(ok(summary), ok(trends), ok(breakdowns), ok({
      tiles: { ...orgStats.tiles, passed: null, passRatePercent: null },
    }));
    renderWrapper(<OrgStatsStrip org="QAOrg" adminCount={2} />);

    expect(tileText('Passed learners')).toHaveTextContent('Not available');
    expect(tileText('Pass rate')).toHaveTextContent('Not available');
    expect(tileText('Unenrolled')).toHaveTextContent('7');
  });

  it('keeps the original tiles and charts when only the organization endpoint failed', () => {
    mockQueries(ok(summary), ok(trends), ok(breakdowns), failed(500));
    renderWrapper(<OrgStatsStrip org="QAOrg" adminCount={2} />);

    expect(screen.queryByText('Could not load the statistics.')).not.toBeInTheDocument();
    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(screen.getByText('77')).toBeInTheDocument();
    expect(screen.getAllByTestId('metric-chart')).toHaveLength(3);
    ['Passed learners', 'Pass rate', 'Learners not started', 'Learners in progress', 'Unenrolled',
      'Honor enrollments', 'Audit enrollments'].forEach((label) => {
      expect(tileText(label)).toHaveTextContent('Not available');
    });
  });

  it('shows skeletons in the new tiles while the organization endpoint loads', () => {
    mockQueries(ok(summary), ok(trends), ok(breakdowns), loading());
    renderWrapper(<OrgStatsStrip org="QAOrg" adminCount={2} />);

    expect(screen.getByText('1,200')).toBeInTheDocument();
    expect(tileText('Passed learners')).not.toHaveTextContent('Not available');
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
