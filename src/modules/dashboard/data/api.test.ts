/**
 * Dashboard analytics API tests.
 *
 * Pins the seam between the React app and the wire format:
 *   - camelCase params (startDate, forceRefresh) are sent as snake_case on the wire
 *   - forceRefresh: true is sent as force_refresh: true in the request params
 *   - snake_case response fields are camelCased before returning
 */
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  getAnalyticsBreakdowns,
  getAnalyticsSummary,
  getAnalyticsTrends,
} from './api';

// ── Module mocks ──────────────────────────────────────────────────────────────

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => {
  const actual = jest.requireActual('@edx/frontend-platform');
  return {
    ...actual,
    getConfig: jest.fn(() => ({ STUDIO_BASE_URL: 'http://studio.local:8001' })),
  };
});

// ── Helpers ───────────────────────────────────────────────────────────────────

const mockGet = jest.fn();

beforeEach(() => {
  jest.clearAllMocks();
  (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get: mockGet });
});

// ── Fixtures ──────────────────────────────────────────────────────────────────

const snakeSummaryResponse = {
  total_learners: 1000,
  new_registrations_this_month: 50,
  new_registrations_previous_month: 40,
  new_registrations_delta_pct: 25.0,
  total_courses: 80,
  running_courses: 20,
  active_enrollments: 3000,
  active_programs: 5,
  generated_at: '2026-08-01T00:00:00Z',
  date_range_start: null,
  date_range_end: null,
};

const snakeTrendsResponse = {
  months: 12,
  enrollments: [{ period: '2026-01', value: 100 }],
  certificates: null,
  registrations: [],
  legacy_registrations: null,
  generated_at: '2026-08-01T00:00:00Z',
  date_range_start: null,
  date_range_end: null,
};

const snakeBreakdownsResponse = {
  course_lifecycle: { no_dates: 0, upcoming: 5, running: 20, ended: 55 },
  certificates: {
    total_courses: 80,
    courses_with_certificate: 50,
    coverage_pct: 62.5,
    certificates_issued: null,
    enrollments_in_certificate_courses: null,
    issuance_pct: null,
  },
  programs: {
    total_programs: 5,
    active_programs: 4,
    enrollments: 200,
    completions: 40,
    completion_pct: 20,
    avg_courses_per_program: 4,
  },
  legacy_migration: {
    legacy_accounts: 100,
    signed_in_at_least_once: 70,
    progress_pct: 70,
  },
  enrollment_modes: [{ mode: 'honor', count: 2800, share_pct: 93 }],
  organizations: [],
  catalog_concentration: { total_enrollments: 3000, top_share_pct: 40, courses: [] },
  enrollment_windows: { closed_but_running: 1, running_without_window: 0 },
  generated_at: '2026-08-01T00:00:00Z',
  date_range_start: null,
  date_range_end: null,
};

// ── getAnalyticsSummary ───────────────────────────────────────────────────────

describe('getAnalyticsSummary', () => {
  it('sends startDate as start_date on the wire', async () => {
    mockGet.mockResolvedValue({ data: snakeSummaryResponse });
    await getAnalyticsSummary({ startDate: '2026-01-01', endDate: '2026-06-30' });

    const [, config] = mockGet.mock.calls[0];
    expect(config.params).toHaveProperty('start_date', '2026-01-01');
    expect(config.params).toHaveProperty('end_date', '2026-06-30');
  });

  it('sends forceRefresh: true as force_refresh: true on the wire', async () => {
    mockGet.mockResolvedValue({ data: snakeSummaryResponse });
    await getAnalyticsSummary({ forceRefresh: true });

    const [, config] = mockGet.mock.calls[0];
    expect(config.params).toHaveProperty('force_refresh', true);
  });

  it('does not send force_refresh when forceRefresh is not provided', async () => {
    mockGet.mockResolvedValue({ data: snakeSummaryResponse });
    await getAnalyticsSummary({ startDate: '2026-01-01' });

    const [, config] = mockGet.mock.calls[0];
    expect(config.params).not.toHaveProperty('force_refresh');
  });

  it('returns camelCase keys from a snake_case response', async () => {
    mockGet.mockResolvedValue({ data: snakeSummaryResponse });
    const result = await getAnalyticsSummary();

    expect(result).toHaveProperty('totalLearners', 1000);
    expect(result).toHaveProperty('newRegistrationsThisMonth', 50);
    expect(result).toHaveProperty('runningCourses', 20);
    expect(result).toHaveProperty('generatedAt', '2026-08-01T00:00:00Z');
  });

  it('calls the correct endpoint URL', async () => {
    mockGet.mockResolvedValue({ data: snakeSummaryResponse });
    await getAnalyticsSummary();

    const [url] = mockGet.mock.calls[0];
    expect(url).toContain('/api/v1/admin/analytics/summary/');
  });
});

// ── getAnalyticsTrends ────────────────────────────────────────────────────────

describe('getAnalyticsTrends', () => {
  it('sends months param unchanged', async () => {
    mockGet.mockResolvedValue({ data: snakeTrendsResponse });
    await getAnalyticsTrends({ months: 6 });

    const [, config] = mockGet.mock.calls[0];
    expect(config.params).toHaveProperty('months', 6);
  });

  it('returns camelCase keys — legacyRegistrations from legacy_registrations', async () => {
    mockGet.mockResolvedValue({ data: { ...snakeTrendsResponse, legacy_registrations: [] } });
    const result = await getAnalyticsTrends();

    expect(result).toHaveProperty('legacyRegistrations');
  });

  it('sends forceRefresh as force_refresh on the wire', async () => {
    mockGet.mockResolvedValue({ data: snakeTrendsResponse });
    await getAnalyticsTrends({ forceRefresh: true });

    const [, config] = mockGet.mock.calls[0];
    expect(config.params).toHaveProperty('force_refresh', true);
  });

  it('calls the correct endpoint URL', async () => {
    mockGet.mockResolvedValue({ data: snakeTrendsResponse });
    await getAnalyticsTrends();

    const [url] = mockGet.mock.calls[0];
    expect(url).toContain('/api/v1/admin/analytics/trends/');
  });
});

// ── getAnalyticsBreakdowns ────────────────────────────────────────────────────

describe('getAnalyticsBreakdowns', () => {
  it('returns camelCase keys — courseLifecycle from course_lifecycle', async () => {
    mockGet.mockResolvedValue({ data: snakeBreakdownsResponse });
    const result = await getAnalyticsBreakdowns();

    expect(result).toHaveProperty('courseLifecycle');
    expect(result.courseLifecycle).toHaveProperty('running', 20);
  });

  it('returns camelCase enrollmentWindows fields', async () => {
    mockGet.mockResolvedValue({ data: snakeBreakdownsResponse });
    const result = await getAnalyticsBreakdowns();

    expect(result).toHaveProperty('enrollmentWindows');
    expect(result.enrollmentWindows).toHaveProperty('closedButRunning', 1);
    expect(result.enrollmentWindows).toHaveProperty('runningWithoutWindow', 0);
  });

  it('sends startDate and forceRefresh correctly on the wire', async () => {
    mockGet.mockResolvedValue({ data: snakeBreakdownsResponse });
    await getAnalyticsBreakdowns({ startDate: '2026-01-01', forceRefresh: true });

    const [, config] = mockGet.mock.calls[0];
    expect(config.params).toHaveProperty('start_date', '2026-01-01');
    expect(config.params).toHaveProperty('force_refresh', true);
  });

  it('calls the correct endpoint URL', async () => {
    mockGet.mockResolvedValue({ data: snakeBreakdownsResponse });
    await getAnalyticsBreakdowns();

    const [url] = mockGet.mock.calls[0];
    expect(url).toContain('/api/v1/admin/analytics/breakdowns/');
  });
});
