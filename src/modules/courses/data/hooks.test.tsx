/**
 * Course hooks tests: an enrollment write refreshes the Courses list, whose
 * Enrollments column would otherwise stay stale for the one-minute staleTime.
 */
import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useEnrollUser } from '@src/modules/users/data/hooks';
import { courseQueryKeys, useEnrollUserInCourse } from './hooks';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => {
  const actual = jest.requireActual('@edx/frontend-platform');
  return {
    ...actual,
    getConfig: jest.fn(() => ({ STUDIO_BASE_URL: 'http://studio.local:8001', LMS_BASE_URL: 'http://lms.local:8000' })),
  };
});

const COURSE_ID = 'course-v1:ArbOrg+SUBT1+2026';

const setup = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const invalidate = jest.spyOn(queryClient, 'invalidateQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
    post: jest.fn().mockResolvedValue({ data: { id: 1 } }),
  });
  return { wrapper, invalidate };
};

describe('enrollment writes refresh the Courses list', () => {
  afterEach(() => jest.clearAllMocks());

  it('enrolling from the course page invalidates the course list queries', async () => {
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useEnrollUserInCourse(COURSE_ID), { wrapper });
    result.current.mutate({ userId: 5, mode: 'honor', reason: 'test' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: courseQueryKeys.lists() });
  });

  it('enrolling from the user page invalidates the course list queries', async () => {
    const { wrapper, invalidate } = setup();
    const { result } = renderHook(() => useEnrollUser(5), { wrapper });
    result.current.mutate({ courseId: COURSE_ID, mode: 'honor', reason: 'test' });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(invalidate).toHaveBeenCalledWith({ queryKey: courseQueryKeys.lists() });
  });
});
