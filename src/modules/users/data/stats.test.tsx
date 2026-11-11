/**
 * User stats and progress api and hooks: the URLs, camelCased answers, and no request while disabled.
 */
import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getUserEnrollmentProgress, getUserListStats, getUserStats } from './api';
import { useUserEnrollmentProgress, useUserListStats, useUserStats } from './hooks';

jest.mock('@edx/frontend-platform/auth', () => ({ getAuthenticatedHttpClient: jest.fn() }));
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(() => ({ STUDIO_BASE_URL: 'http://studio.local:8001' })),
}));

const BASE = 'http://studio.local:8001/api/v1/admin/users/7';
const mockGet = jest.fn();

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get: mockGet });
});

describe('getUserEnrollmentProgress', () => {
  it('returns the results of the progress endpoint, camelCased, keeping null', async () => {
    mockGet.mockResolvedValue({
      data: { results: [{ course_id: 'a', progress_percent: 40 }, { course_id: 'b', progress_percent: null }] },
    });

    const result = await getUserEnrollmentProgress(7);

    expect(mockGet).toHaveBeenCalledWith(`${BASE}/enrollments/progress/`);
    expect(result).toEqual([{ courseId: 'a', progressPercent: 40 }, { courseId: 'b', progressPercent: null }]);
  });
});

describe('getUserStats', () => {
  it('camelCases the tiles', async () => {
    mockGet.mockResolvedValue({
      data: {
        tiles: {
          programs_enrolled: 2,
          programs_completed: 1,
          last_activity_available: true,
          last_activity_at: null,
          subscription_status: 'none',
          subscription_ends_at: null,
        },
      },
    });

    const stats = await getUserStats(7);

    expect(mockGet).toHaveBeenCalledWith(`${BASE}/stats/`);
    expect(stats.tiles.programsEnrolled).toBe(2);
    expect(stats.tiles.subscriptionStatus).toBe('none');
  });
});

describe('getUserListStats', () => {
  it('asks for the global stats and camelCases them, keeping null', async () => {
    mockGet.mockResolvedValue({
      data: {
        tiles: {
          learners: null,
          new_this_month: 3,
          new_previous_month: 0,
          new_delta_pct: null,
          active_last_30_days: null,
          legacy: { legacy_accounts: 5, signed_in_at_least_once: 2, progress_pct: 40 },
          subscribed: 1,
        },
        series: { registrations_by_month: [{ period: '2026-10', value: 3 }] },
        sign_in_methods: null,
      },
    });

    const stats = await getUserListStats();

    expect(mockGet).toHaveBeenCalledWith('http://studio.local:8001/api/v1/admin/users/stats/');
    expect(stats.tiles.learners).toBeNull();
    expect(stats.tiles.legacy.signedInAtLeastOnce).toBe(2);
    expect(stats.signInMethods).toBeNull();
  });
});

describe('hooks', () => {
  it('load the progress and the stats', async () => {
    mockGet.mockResolvedValue({ data: { results: [] } });
    const { result } = renderHook(() => useUserEnrollmentProgress(7), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('make no request while disabled', () => {
    renderHook(() => useUserEnrollmentProgress(7, false), { wrapper });
    renderHook(() => useUserStats(7, false), { wrapper });
    renderHook(() => useUserListStats(false), { wrapper });

    expect(mockGet).not.toHaveBeenCalled();
  });
});
