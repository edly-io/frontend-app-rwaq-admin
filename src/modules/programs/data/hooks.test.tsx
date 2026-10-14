/**
 * Program hooks tests — the wire contract of the program unenroll.
 */
import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { useUnenrollProgramLearner } from './hooks';

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

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return wrapper;
};

describe('useUnenrollProgramLearner', () => {
  it('sends the reason in the DELETE body, not the query string', async () => {
    const httpDelete = jest.fn().mockResolvedValue({ data: undefined });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ delete: httpDelete });

    const { result } = renderHook(() => useUnenrollProgramLearner('abc-123'), { wrapper: createWrapper() });

    result.current.mutate({ userId: 7, reason: 'Enrollment correction' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(httpDelete).toHaveBeenCalledWith(
      'http://studio.local:8001/api/v1/admin/programs/abc-123/learners/7/',
      { data: { reason: 'Enrollment correction' } },
    );
  });
});
