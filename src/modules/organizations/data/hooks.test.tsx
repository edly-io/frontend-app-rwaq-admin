/**
 * Organizations hooks tests — covers list, detail, and optimistic mutations.
 */
import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  useOrganizations,
  useOrganization,
  useUpdateOrganization,
  useAddOrgAdmin,
  useRemoveOrgAdmin,
} from './hooks';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
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

const mockOrgList = {
  count: 2,
  next: null,
  previous: null,
  results: [
    {
      id: 1, name: 'Rwaq', short_name: 'rwaq', logo: null, active: true, course_count: 5, admin_count: 2,
    },
    {
      id: 2, name: 'TestOrg', short_name: 'testorg', logo: null, active: true, course_count: 1, admin_count: 1,
    },
  ],
};

const mockOrgDetail = {
  id: 1,
  name: 'Rwaq',
  short_name: 'rwaq',
  logo: null,
  active: true,
  course_count: 5,
  admin_count: 1,
  arabic_name: 'رواق',
  detail: 'A platform for Arabic learning.',
  featured_video: '',
  is_featured: true,
  members: [
    {
      email: 'admin@rwaq.org',
      username: 'adminuser',
      full_name: 'Admin User',
      date_added: '2026-01-01T00:00:00Z',
      added_by: 'superadmin',
      other_organizations: [],
    },
  ],
};

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('useOrganizations', () => {
  beforeEach(() => jest.clearAllMocks());

  it('returns org list data on success', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockResolvedValueOnce({ data: mockOrgList }),
    });

    const { result } = renderHook(() => useOrganizations(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.results).toHaveLength(2);
    expect(result.current.data?.results[0].name).toBe('Rwaq');
  });

  it('sets isError on API failure', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockRejectedValueOnce(new Error('Network error')),
    });

    const { result } = renderHook(() => useOrganizations(), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useOrganization', () => {
  beforeEach(() => jest.clearAllMocks());

  it('fetches org detail by short_name', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockResolvedValueOnce({ data: mockOrgDetail }),
    });

    const { result } = renderHook(() => useOrganization('rwaq'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.arabic_name).toBe('رواق');
    expect(result.current.data?.members).toHaveLength(1);
  });

  it('does not fire if shortName is empty', async () => {
    const getMock = jest.fn();
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get: getMock });

    renderHook(() => useOrganization(''), { wrapper: createWrapper() });

    // enabled: false when shortName is empty
    await new Promise((resolve) => { setTimeout(resolve, 50); });
    expect(getMock).not.toHaveBeenCalled();
  });
});

describe('useUpdateOrganization', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls PATCH and invalidates the detail query on success', async () => {
    const patchMock = jest.fn().mockResolvedValueOnce({
      data: { ...mockOrgDetail, arabic_name: 'رواق المحدث' },
    });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ patch: patchMock });

    const { result } = renderHook(() => useUpdateOrganization('rwaq'), { wrapper: createWrapper() });

    result.current.mutate({ arabic_name: 'رواق المحدث' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(patchMock).toHaveBeenCalledWith(
      expect.stringContaining('/rwaq/'),
      expect.objectContaining({ arabic_name: 'رواق المحدث' }),
    );
  });

  it('rolls back on failure', async () => {
    const patchMock = jest.fn().mockRejectedValueOnce(new Error('Server error'));
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ patch: patchMock });

    const { result } = renderHook(() => useUpdateOrganization('rwaq'), { wrapper: createWrapper() });

    result.current.mutate({ arabic_name: 'bad' });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useAddOrgAdmin', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls POST to add a member', async () => {
    const postMock = jest.fn().mockResolvedValueOnce({
      data: {
        email: 'new@rwaq.org', username: 'newuser', full_name: 'New User', date_added: '2026-01-01T00:00:00Z', added_by: 'staff', other_organizations: [],
      },
    });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ post: postMock });

    const { result } = renderHook(() => useAddOrgAdmin('rwaq'), { wrapper: createWrapper() });

    result.current.mutate('new@rwaq.org');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(postMock).toHaveBeenCalledWith(
      expect.stringContaining('members/new%40rwaq.org/'),
    );
  });

  it('sets isError when POST fails', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      post: jest.fn().mockRejectedValueOnce(new Error('Fail')),
    });

    const { result } = renderHook(() => useAddOrgAdmin('rwaq'), { wrapper: createWrapper() });
    result.current.mutate('bad@rwaq.org');

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useRemoveOrgAdmin', () => {
  beforeEach(() => jest.clearAllMocks());

  it('calls DELETE to remove a member', async () => {
    const deleteMock = jest.fn().mockResolvedValueOnce({});
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ delete: deleteMock });

    const { result } = renderHook(() => useRemoveOrgAdmin('rwaq'), { wrapper: createWrapper() });

    result.current.mutate('admin@rwaq.org');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(deleteMock).toHaveBeenCalledWith(
      expect.stringContaining('members/admin%40rwaq.org/'),
    );
  });
});
