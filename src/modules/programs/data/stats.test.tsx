/**
 * Program stats api and hooks: the URLs, camelCased answers, null kept as null, no request while disabled.
 */
import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getProgramListStats, getProgramStats } from './api';
import { useProgramListStats, useProgramStats } from './hooks';

jest.mock('@edx/frontend-platform/auth', () => ({ getAuthenticatedHttpClient: jest.fn() }));
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(() => ({ STUDIO_BASE_URL: 'http://studio.local:8001' })),
}));

const BASE = 'http://studio.local:8001/api/v1/admin/programs';
const UUID = '11111111-2222-3333-4444-555555555555';
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

describe('getProgramListStats', () => {
  it('asks for the global stats and camelCases them, keeping null', async () => {
    mockGet.mockResolvedValue({
      data: {
        tiles: {
          programs: { active: 1, draft: 0, archived: 0 },
          enrollments: 4,
          learners: 3,
          completion_pct: null,
          average_courses_passed: null,
        },
        funnel: { enrolled: 4, started: null, completed: 1 },
        series: { enrollments_by_month: [] },
      },
    });

    const stats = await getProgramListStats();

    expect(mockGet).toHaveBeenCalledWith(`${BASE}/stats/`);
    expect(stats.tiles.completionPct).toBeNull();
    expect(stats.funnel.started).toBeNull();
  });
});

describe('getProgramStats', () => {
  it('asks for one program by uuid and camelCases the answer', async () => {
    mockGet.mockResolvedValue({
      data: {
        tiles: {
          enrolled: 2,
          completed: 1,
          in_progress: null,
          not_started: null,
          completion_pct: 50,
          average_courses_passed: null,
          average_days_to_complete: 10,
        },
        series: { enrollments_by_month: [], completions_by_month: [] },
        courses: null,
      },
    });

    const stats = await getProgramStats(UUID);

    expect(mockGet).toHaveBeenCalledWith(`${BASE}/${UUID}/stats/`);
    expect(stats.tiles.inProgress).toBeNull();
    expect(stats.tiles.averageDaysToComplete).toBe(10);
    expect(stats.courses).toBeNull();
  });
});

describe('hooks', () => {
  it('load the program stats', async () => {
    mockGet.mockResolvedValue({ data: { tiles: { enrolled: 2 } } });
    const { result } = renderHook(() => useProgramStats(UUID), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('make no request while disabled', () => {
    renderHook(() => useProgramStats(UUID, false), { wrapper });
    renderHook(() => useProgramListStats(false), { wrapper });

    expect(mockGet).not.toHaveBeenCalled();
  });
});
