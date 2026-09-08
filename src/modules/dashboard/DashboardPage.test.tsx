/**
 * DashboardPage — unit tests for loading, error, and data states.
 *
 * All three React Query hooks and the direct API calls are mocked so this test
 * runs without a real QueryClient or network. MetricChart is stubbed because
 * recharts relies on window.matchMedia and ResizeObserver behaviour that differs
 * from how jsdom behaves.
 */
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from './data/hooks';
import * as api from './data/api';
import DashboardPage from './DashboardPage';

// ── Module mocks ──────────────────────────────────────────────────────────────

jest.mock('./data/hooks', () => ({
  analyticsQueryKeys: {
    summary: (params: unknown) => ['summary', params],
    trends: (params: unknown) => ['trends', params],
    breakdowns: (params: unknown) => ['breakdowns', params],
  },
  useAnalyticsSummary: jest.fn(),
  useAnalyticsTrends: jest.fn(),
  useAnalyticsBreakdowns: jest.fn(),
}));

jest.mock('./data/api', () => ({
  getAnalyticsSummary: jest.fn(),
  getAnalyticsTrends: jest.fn(),
  getAnalyticsBreakdowns: jest.fn(),
}));

const mockSetQueryData = jest.fn();
jest.mock('@tanstack/react-query', () => ({
  ...jest.requireActual('@tanstack/react-query'),
  useQueryClient: () => ({ setQueryData: mockSetQueryData }),
}));

// Stub MetricChart — recharts needs matchMedia which jsdom does not provide
jest.mock('@src/components/charts/MetricChart', () => ({
  __esModule: true,
  default: ({ ariaLabel }: { ariaLabel: string }) => (
    <div data-testid="metric-chart" aria-label={ariaLabel} />
  ),
}));

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockSummary = {
  totalLearners: 1234,
  newRegistrationsThisMonth: 50,
  newRegistrationsPreviousMonth: 45,
  newRegistrationsDeltaPct: 11.1,
  totalCourses: 100,
  runningCourses: 30,
  activeEnrollments: 5678,
  activePrograms: 10,
  generatedAt: new Date().toISOString(),
  dateRangeStart: null,
  dateRangeEnd: null,
};

const mockTrends = {
  months: 12,
  enrollments: [],
  certificates: null,
  registrations: [],
  legacyRegistrations: null,
  generatedAt: new Date().toISOString(),
  dateRangeStart: null,
  dateRangeEnd: null,
};

const mockBreakdowns = {
  courseLifecycle: { noDates: 0, upcoming: 5, running: 30, ended: 65 },
  certificates: {
    totalCourses: 100,
    coursesWithCertificate: 60,
    coveragePct: 60,
    certificatesIssued: null,
    enrollmentsInCertificateCourses: null,
    issuancePct: null,
  },
  programs: {
    totalPrograms: 10,
    activePrograms: 8,
    enrollments: 500,
    completions: 100,
    completionPct: 20,
    avgCoursesPerProgram: 5,
  },
  legacyMigration: {
    legacyAccounts: 200,
    signedInAtLeastOnce: 150,
    progressPct: 75,
  },
  enrollmentModes: [{ mode: 'honor', count: 5000, sharePct: 88 }],
  organizations: [],
  catalogConcentration: { totalEnrollments: 5678, topSharePct: 30, courses: [] },
  generatedAt: new Date().toISOString(),
  dateRangeStart: null,
  dateRangeEnd: null,
};

const loadingQuery = { isLoading: true, isError: false, data: undefined, error: undefined, refetch: jest.fn() };
const errorQuery = { isLoading: false, isError: true, data: undefined, error: new Error('API error'), refetch: jest.fn() };

// ── Helpers ───────────────────────────────────────────────────────────────────

const setLoadingState = () => {
  (hooks.useAnalyticsSummary as jest.Mock).mockReturnValue(loadingQuery);
  (hooks.useAnalyticsTrends as jest.Mock).mockReturnValue(loadingQuery);
  (hooks.useAnalyticsBreakdowns as jest.Mock).mockReturnValue(loadingQuery);
};

const setErrorState = () => {
  (hooks.useAnalyticsSummary as jest.Mock).mockReturnValue(errorQuery);
  (hooks.useAnalyticsTrends as jest.Mock).mockReturnValue(errorQuery);
  (hooks.useAnalyticsBreakdowns as jest.Mock).mockReturnValue(errorQuery);
};

const setDataState = () => {
  (hooks.useAnalyticsSummary as jest.Mock).mockReturnValue({
    isLoading: false, isError: false, data: mockSummary, error: null, refetch: jest.fn(),
  });
  (hooks.useAnalyticsTrends as jest.Mock).mockReturnValue({
    isLoading: false, isError: false, data: mockTrends, error: null, refetch: jest.fn(),
  });
  (hooks.useAnalyticsBreakdowns as jest.Mock).mockReturnValue({
    isLoading: false, isError: false, data: mockBreakdowns, error: null, refetch: jest.fn(),
  });
};

beforeEach(() => {
  jest.clearAllMocks();
  mockSetQueryData.mockClear();
});

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('DashboardPage — loading state', () => {
  it('shows loading spinner for the breakdowns band', () => {
    setLoadingState();
    renderWrapper(<DashboardPage />);
    // KPI cards show a spinner when isLoading is true
    const spinners = screen.queryAllByRole('status');
    // At least one spinner visible during loading
    expect(spinners.length).toBeGreaterThan(0);
  });

  it('renders the page title regardless of loading state', () => {
    setLoadingState();
    renderWrapper(<DashboardPage />);
    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
  });
});

describe('DashboardPage — error state (all three queries failing)', () => {
  it('renders the error fallback component when all queries fail', () => {
    setErrorState();
    renderWrapper(<DashboardPage />);
    // ErrorState renders "Could not load analytics" heading
    expect(screen.getByText('Could not load analytics')).toBeInTheDocument();
  });

  it('does not render KPI values in the all-error state', () => {
    setErrorState();
    renderWrapper(<DashboardPage />);
    expect(screen.queryByText('1,234')).not.toBeInTheDocument();
  });
});

describe('DashboardPage — data state', () => {
  it('renders the totalLearners KPI value', () => {
    setDataState();
    renderWrapper(<DashboardPage />);
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders the runningCourses KPI value', () => {
    setDataState();
    renderWrapper(<DashboardPage />);
    expect(screen.getByText('30')).toBeInTheDocument();
  });

  it('renders the activeEnrollments KPI value', () => {
    setDataState();
    renderWrapper(<DashboardPage />);
    expect(screen.getByText('5,678')).toBeInTheDocument();
  });

  it('renders the activePrograms KPI value', () => {
    setDataState();
    renderWrapper(<DashboardPage />);
    expect(screen.getByText('10')).toBeInTheDocument();
  });
});

describe('DashboardPage — handleRefresh', () => {
  it('calls all three API functions with forceRefresh: true when Refresh is clicked', async () => {
    setDataState();
    const freshSummary = { ...mockSummary, totalLearners: 9999 };
    const freshTrends = { ...mockTrends };
    const freshBreakdowns = { ...mockBreakdowns };
    (api.getAnalyticsSummary as jest.Mock).mockResolvedValue(freshSummary);
    (api.getAnalyticsTrends as jest.Mock).mockResolvedValue(freshTrends);
    (api.getAnalyticsBreakdowns as jest.Mock).mockResolvedValue(freshBreakdowns);

    renderWrapper(<DashboardPage />);
    fireEvent.click(screen.getByRole('button', { name: /refresh dashboard/i }));

    await waitFor(() => {
      expect(api.getAnalyticsSummary).toHaveBeenCalledWith(
        expect.objectContaining({ forceRefresh: true }),
      );
      expect(api.getAnalyticsTrends).toHaveBeenCalledWith(
        expect.objectContaining({ forceRefresh: true }),
      );
      expect(api.getAnalyticsBreakdowns).toHaveBeenCalledWith(
        expect.objectContaining({ forceRefresh: true }),
      );
    });
  });

  it('calls queryClient.setQueryData three times after a successful refresh', async () => {
    setDataState();
    (api.getAnalyticsSummary as jest.Mock).mockResolvedValue(mockSummary);
    (api.getAnalyticsTrends as jest.Mock).mockResolvedValue(mockTrends);
    (api.getAnalyticsBreakdowns as jest.Mock).mockResolvedValue(mockBreakdowns);

    renderWrapper(<DashboardPage />);
    fireEvent.click(screen.getByRole('button', { name: /refresh dashboard/i }));

    await waitFor(() => {
      expect(mockSetQueryData).toHaveBeenCalledTimes(3);
    });
  });
});
