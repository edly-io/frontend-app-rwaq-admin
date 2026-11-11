/**
 * Course stats api and hook: the URL carries the encoded course key, the response comes back camelCased,
 * and a collapsed strip makes no request.
 */
import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getCourseStats } from './api';
import { useCourseStats } from './hooks';

jest.mock('@edx/frontend-platform/auth', () => ({ getAuthenticatedHttpClient: jest.fn() }));
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(() => ({ STUDIO_BASE_URL: 'http://studio.local:8001' })),
}));

const mockGet = jest.fn();
const wire = {
  tiles: {
    active_learners: 3,
    enrolled: 4,
    unenrolled: 1,
    certificates: null,
    passed: 2,
    in_progress: 1,
    not_started: 1,
    modes: [{ mode: 'honor', count: 4 }],
  },
  funnel: {
    enrolled: 4, started: 3, passed: 2, certified: null,
  },
  series: { enrollments_by_month: [{ period: '2026-10', value: 4 }] },
  generated_at: '2026-11-11T00:00:00Z',
};

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

beforeEach(() => {
  jest.clearAllMocks();
  mockGet.mockResolvedValue({ data: wire });
  (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get: mockGet });
});

describe('getCourseStats', () => {
  it('asks for the encoded course key and camelCases the answer, keeping null as null', async () => {
    const stats = await getCourseStats('course-v1:Org+C1+2026');

    expect(mockGet).toHaveBeenCalledWith('http://studio.local:8001/api/v1/admin/courses/course-v1%3AOrg%2BC1%2B2026/stats/');
    expect(stats.tiles.activeLearners).toBe(3);
    expect(stats.tiles.certificates).toBeNull();
    expect(stats.series.enrollmentsByMonth).toEqual([{ period: '2026-10', value: 4 }]);
  });
});

describe('useCourseStats', () => {
  it('loads the stats', async () => {
    const { result } = renderHook(() => useCourseStats('course-v1:Org+C1+2026'), { wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.tiles.enrolled).toBe(4);
  });

  it('makes no request while disabled', () => {
    renderHook(() => useCourseStats('course-v1:Org+C1+2026', false), { wrapper });

    expect(mockGet).not.toHaveBeenCalled();
  });
});
