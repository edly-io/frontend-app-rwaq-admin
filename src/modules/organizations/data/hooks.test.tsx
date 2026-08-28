/**
 * Organizations hooks tests — list, detail, create, update, and membership.
 *
 * These also pin the api.ts seam: params/bodies go out snake_cased, responses
 * come back camelCased, and the single-select UI filter is translated into the
 * backend's own ?active=/?has_admins= params.
 */
import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import {
  useAddOrgAdmin,
  useCreateOrganization,
  useOrganization,
  useOrganizations,
  useRemoveOrgAdmin,
  useUpdateOrganization,
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

const BASE = 'http://studio.local:8001/rwaq/api/organizations';

const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return wrapper;
};

const mockOrgList = {
  results: [
    {
      id: 1,
      name: 'Rwaq',
      short_name: 'Rwaq',
      arabic_name: 'رواق',
      active: true,
      course_count: 4,
      admin_count: 2,
    },
  ],
  pagination: {
    next: null, previous: null, count: 1, num_pages: 1,
  },
};

const mockOrgDetail = {
  ...mockOrgList.results[0],
  featured_video: '',
  logo: null,
  organization_logo: null,
  members: [
    {
      id: 7,
      username: 'admin1',
      name: 'Admin One',
      image: null,
      email: 'a@x.com',
      date_added: '2026-08-01T00:00:00Z',
      added_by: 'staff',
      other_organizations: ['OTHER'],
    },
  ],
};

describe('useOrganizations', () => {
  it('camelCases the response and targets Studio', async () => {
    const get = jest.fn().mockResolvedValue({ data: mockOrgList });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get });

    const { result } = renderHook(() => useOrganizations({ search: 'rw', pageSize: 10 }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(get).toHaveBeenCalledWith(`${BASE}/`, {
      params: { search: 'rw', page_size: 10 },
    });
    expect(result.current.data?.results[0].shortName).toBe('Rwaq');
    expect(result.current.data?.results[0].adminCount).toBe(2);
    expect(result.current.data?.pagination.numPages).toBe(1);
  });

  it('translates the single-select filter into the backend params', async () => {
    const get = jest.fn().mockResolvedValue({ data: mockOrgList });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get });

    const { result } = renderHook(() => useOrganizations({ filter: 'no_admins' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(get).toHaveBeenCalledWith(`${BASE}/`, { params: { has_admins: 'false' } });
  });

  it('maps the inactive filter to active=false', async () => {
    const get = jest.fn().mockResolvedValue({ data: mockOrgList });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get });

    const { result } = renderHook(() => useOrganizations({ filter: 'inactive' }), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(get).toHaveBeenCalledWith(`${BASE}/`, { params: { active: 'false' } });
  });
});

describe('useOrganization', () => {
  it('camelCases the detail, including the member roster', async () => {
    const get = jest.fn().mockResolvedValue({ data: mockOrgDetail });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get });

    const { result } = renderHook(() => useOrganization('Rwaq'), { wrapper: createWrapper() });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(get).toHaveBeenCalledWith(`${BASE}/Rwaq/`);
    expect(result.current.data?.featuredVideo).toBe('');
    expect(result.current.data?.members[0].otherOrganizations).toEqual(['OTHER']);
    expect(result.current.data?.members[0].name).toBe('Admin One');
  });

  it('does not fetch without a short name', () => {
    const get = jest.fn();
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get });

    renderHook(() => useOrganization(''), { wrapper: createWrapper() });

    expect(get).not.toHaveBeenCalled();
  });
});

describe('useCreateOrganization', () => {
  it('posts a snake_cased body', async () => {
    const post = jest.fn().mockResolvedValue({ data: mockOrgDetail });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ post });

    const { result } = renderHook(() => useCreateOrganization(), { wrapper: createWrapper() });

    result.current.mutate({ name: 'New Org', shortName: 'NEWORG' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(post).toHaveBeenCalledWith(`${BASE}/`, {
      name: 'New Org',
      short_name: 'NEWORG',
    });
  });

  it('surfaces a duplicate-short-name rejection', async () => {
    const post = jest.fn().mockRejectedValue({ response: { status: 400 } });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ post });

    const { result } = renderHook(() => useCreateOrganization(), { wrapper: createWrapper() });

    result.current.mutate({ name: 'Dup', shortName: 'DUP' });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});

describe('useUpdateOrganization', () => {
  it('sends snake_cased patch fields to Studio', async () => {
    const patch = jest.fn().mockResolvedValue({ data: mockOrgDetail });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ patch });

    const { result } = renderHook(() => useUpdateOrganization('Rwaq'), { wrapper: createWrapper() });

    result.current.mutate({ arabicName: 'رواق' });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(patch).toHaveBeenCalledWith(`${BASE}/Rwaq/`, {
      arabic_name: 'رواق',
    });
  });
});

describe('org admin membership', () => {
  it('adds an admin by url-encoded email', async () => {
    const post = jest.fn().mockResolvedValue({ data: {} });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ post });

    const { result } = renderHook(() => useAddOrgAdmin('Rwaq'), { wrapper: createWrapper() });

    result.current.mutate('a+b@x.com');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(post).toHaveBeenCalledWith(`${BASE}/Rwaq/members/a%2Bb%40x.com/`);
  });

  it('reports a 404 when the email has no account', async () => {
    const post = jest.fn().mockRejectedValue({ response: { status: 404 } });
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ post });

    const { result } = renderHook(() => useAddOrgAdmin('Rwaq'), { wrapper: createWrapper() });

    result.current.mutate('nobody@x.com');

    await waitFor(() => expect(result.current.isError).toBe(true));
  });

  it('removes an admin', async () => {
    const httpDelete = jest.fn().mockResolvedValue({});
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ delete: httpDelete });

    const { result } = renderHook(() => useRemoveOrgAdmin('Rwaq'), { wrapper: createWrapper() });

    result.current.mutate('a@x.com');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(httpDelete).toHaveBeenCalledWith(`${BASE}/Rwaq/members/a%40x.com/`);
  });
});
