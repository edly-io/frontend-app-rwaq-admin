/**
 * Users hooks tests — list, detail, enrollments, create and update.
 *
 * The wire format is snake_case and the app is camelCase, so these also pin
 * the normalization in api.ts: params/bodies go out snake_cased, responses
 * come back camelCased.
 */
import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  useUsers,
  useUser,
  useUserEnrollments,
  useCreateUser,
  useUpdateUser,
} from './hooks';

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

// ── Fixtures (snake_case, exactly as the backend sends them) ──────────────────

const rolesPayload = {
  is_global_staff: false,
  is_superuser: false,
  is_course_creator: false,
  is_support_staff: false,
  org_admin_of: [],
};

const mockUserList = {
  results: [
    {
      id: 7,
      image: null,
      name: 'Awais Ansari',
      email: 'a@x.com',
      roles: { ...rolesPayload, is_global_staff: true },
      role_badges: ['global_staff'],
      created_at: '2026-01-02T00:00:00Z',
      last_login: null,
      is_active: true,
      is_email_confirmed: true,
      authentication_method: 'Password',
      is_profile_public: false,
    },
  ],
  pagination: {
    next: null, previous: null, count: 1, num_pages: 1,
  },
};

const mockUserDetail = {
  ...mockUserList.results[0],
  username: 'awais',
  country: 'SA',
  biography: 'Hello',
  job: 'Engineer',
  profile_visibility: 'private',
  authentication_methods: ['Password'],
  is_legacy: false,
};

const mockEnrollments = [
  {
    course_id: 'course-v1:RWAQ+CS1+2026',
    course_name: 'Intro',
    enrolled_at: '2026-03-01T00:00:00Z',
    mode: 'honor',
    is_active: true,
    certificate_status: null,
  },
];

describe('useUsers', () => {
  it('camelCases the response and snake_cases the params', async () => {
    const get = jest.fn().mockResolvedValue({ data: mockUserList });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get });

    const { result } = renderHook(
      () => useUsers({ searchBy: 'email', searchTerm: 'a@x.com', pageSize: 20 }),
      { wrapper: createWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(get).toHaveBeenCalledWith(
      'http://studio.local:8001/api/v1/admin/users/',
      { params: { search_by: 'email', search_term: 'a@x.com', page_size: 20 } },
    );
    expect(result.current.data?.results[0].roleBadges).toEqual(['global_staff']);
    expect(result.current.data?.results[0].roles.isGlobalStaff).toBe(true);
    expect(result.current.data?.results[0].isEmailConfirmed).toBe(true);
    expect(result.current.data?.pagination.numPages).toBe(1);
  });
});

describe('useUser', () => {
  it('fetches one user and camelCases the detail fields', async () => {
    const get = jest.fn().mockResolvedValue({ data: mockUserDetail });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get });

    const { result } = renderHook(() => useUser(7), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(get).toHaveBeenCalledWith('http://studio.local:8001/api/v1/admin/users/7/');
    expect(result.current.data?.profileVisibility).toBe('private');
    expect(result.current.data?.isLegacy).toBe(false);
  });

  it('does not fetch for a zero id', () => {
    const get = jest.fn();
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get });

    renderHook(() => useUser(0), { wrapper: createWrapper() });

    expect(get).not.toHaveBeenCalled();
  });
});

describe('useUserEnrollments', () => {
  it('fetches the read-only enrollment list', async () => {
    const get = jest.fn().mockResolvedValue({ data: mockEnrollments });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get });

    const { result } = renderHook(() => useUserEnrollments(7), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(get).toHaveBeenCalledWith('http://studio.local:8001/api/v1/admin/users/7/enrollments/');
    expect(result.current.data?.[0].courseId).toBe('course-v1:RWAQ+CS1+2026');
    expect(result.current.data?.[0].certificateStatus).toBeNull();
  });
});

describe('useCreateUser', () => {
  it('posts a snake_cased body including the grants', async () => {
    const post = jest.fn().mockResolvedValue({ data: mockUserDetail });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ post });

    const { result } = renderHook(() => useCreateUser(), { wrapper: createWrapper() });

    result.current.mutate({
      email: 'new@x.com',
      name: 'New',
      isGlobalStaff: true,
      isCourseCreator: false,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(post).toHaveBeenCalledWith(
      'http://studio.local:8001/api/v1/admin/users/',
      {
        email: 'new@x.com',
        name: 'New',
        is_global_staff: true,
        is_course_creator: false,
      },
    );
  });
});

describe('useUpdateUser', () => {
  it('patches only the fields it is given', async () => {
    const patch = jest.fn().mockResolvedValue({ data: mockUserDetail });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ patch });

    const { result } = renderHook(() => useUpdateUser(7), { wrapper: createWrapper() });

    result.current.mutate({ isActive: false });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(patch).toHaveBeenCalledWith(
      'http://studio.local:8001/api/v1/admin/users/7/',
      { is_active: false },
    );
  });

  it('surfaces a failed patch as an error', async () => {
    const patch = jest.fn().mockRejectedValue(new Error('boom'));
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ patch });

    const { result } = renderHook(() => useUpdateUser(7), { wrapper: createWrapper() });

    result.current.mutate({ name: 'X' });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
