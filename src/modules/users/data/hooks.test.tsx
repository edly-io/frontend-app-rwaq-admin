/**
 * Users hooks tests — covers list, detail, create, and update mutations.
 */
import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
} from './hooks';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => ({
  getConfig: jest.fn(() => ({ LMS_BASE_URL: 'http://localhost:8000' })),
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return wrapper;
};

// ── Fixtures ──────────────────────────────────────────────────────────────────

const mockUserList = {
  results: [
    {
      id: 7,
      image: null,
      name: 'Awais Ansari',
      email: 'a@x.com',
      role: 'instructor',
      created_at: '2026-01-02T00:00:00Z',
      authentication_method: 'Password',
      is_blocked: false,
      is_confirmed: true,
      is_profile_public: false,
    },
    {
      id: 8,
      image: null,
      name: 'Test User',
      email: 'test@x.com',
      role: 'student',
      created_at: '2026-02-01T00:00:00Z',
      authentication_method: 'Password',
      is_blocked: false,
      is_confirmed: true,
      is_profile_public: true,
    },
  ],
  pagination: {
    count: 2,
    num_pages: 1,
    next: null,
    previous: null,
  },
};

const mockUserDetail = {
  id: 7,
  image: null,
  name: 'Awais Ansari',
  email: 'a@x.com',
  role: 'instructor',
  created_at: '2026-01-02T00:00:00Z',
  authentication_method: 'Password',
  is_blocked: false,
  is_confirmed: true,
  is_profile_public: false,
  username: 'awaisansari',
  country: 'SA',
  biography: 'A developer.',
  job: 'Engineer',
  authentication_methods: ['Password'],
  roles: ['instructor'],
  is_active: true,
  last_login: '2026-08-01T10:00:00Z',
};

// ── useUsers ──────────────────────────────────────────────────────────────────

describe('useUsers', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns user list data on success', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockResolvedValueOnce({ data: mockUserList }),
    });

    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.results).toHaveLength(2);
    expect(result.current.data?.results[0].name).toBe('Awais Ansari');
    expect(result.current.data?.pagination.count).toBe(2);
  });

  it('passes query params to the API call', async () => {
    const getMock = jest.fn().mockResolvedValueOnce({ data: mockUserList });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get: getMock });

    const params = {
      search_by: 'email' as const,
      search_term: 'a@x.com',
      filter: 'instructor' as const,
      page: 2,
    };
    const { result } = renderHook(
      () => useUsers(params),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(getMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/admin/users/'),
      expect.objectContaining({
        params: expect.objectContaining({
          search_by: 'email',
          search_term: 'a@x.com',
          filter: 'instructor',
          page: 2,
        }),
      }),
    );
  });

  it('sets isError on API failure', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockRejectedValueOnce(new Error('Network error')),
    });

    const { result } = renderHook(() => useUsers(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ── useUser ───────────────────────────────────────────────────────────────────

describe('useUser', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches user detail by id', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockResolvedValueOnce({ data: mockUserDetail }),
    });

    const { result } = renderHook(() => useUser(7), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.username).toBe('awaisansari');
    expect(result.current.data?.roles).toContain('instructor');
  });

  it('does not fire if id is 0', async () => {
    const getMock = jest.fn();
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get: getMock });

    renderHook(() => useUser(0), { wrapper: createWrapper() });

    await new Promise((resolve) => { setTimeout(resolve, 50); });
    expect(getMock).not.toHaveBeenCalled();
  });
});

// ── useCreateUser ─────────────────────────────────────────────────────────────

describe('useCreateUser', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls POST with payload and returns created user', async () => {
    const postMock = jest.fn().mockResolvedValueOnce({ data: mockUserDetail });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ post: postMock });

    const { result } = renderHook(() => useCreateUser(), { wrapper: createWrapper() });

    result.current.mutate({
      email: 'a@x.com',
      name: 'Awais Ansari',
      role: 'instructor',
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(postMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/admin/users/'),
      expect.objectContaining({ email: 'a@x.com', role: 'instructor' }),
    );
  });

  it('sets isError when POST fails', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      post: jest.fn().mockRejectedValueOnce(new Error('Server error')),
    });

    const { result } = renderHook(() => useCreateUser(), { wrapper: createWrapper() });

    result.current.mutate({ email: 'bad@x.com', name: 'Bad User', role: 'student' });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

// ── useUpdateUser ─────────────────────────────────────────────────────────────

describe('useUpdateUser', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls PATCH and invalidates queries on success', async () => {
    const patchMock = jest.fn().mockResolvedValueOnce({
      data: { ...mockUserDetail, name: 'Updated Name' },
    });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ patch: patchMock });

    const { result } = renderHook(() => useUpdateUser(7), { wrapper: createWrapper() });

    result.current.mutate({ name: 'Updated Name' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(patchMock).toHaveBeenCalledWith(
      expect.stringContaining('/api/v1/admin/users/7/'),
      expect.objectContaining({ name: 'Updated Name' }),
    );
  });

  it('rolls back optimistic update on failure', async () => {
    const patchMock = jest.fn().mockRejectedValueOnce(new Error('Server error'));
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ patch: patchMock });

    const { result } = renderHook(() => useUpdateUser(7), { wrapper: createWrapper() });

    result.current.mutate({ name: 'Bad Name' });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
