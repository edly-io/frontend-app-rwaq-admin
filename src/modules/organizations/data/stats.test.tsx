/**
 * Organization list stats api and hook: the URL (under /rwaq/api/), camelCased answer, no request while disabled.
 */
import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getOrgListStats } from './api';
import { useOrgListStats } from './hooks';

jest.mock('@edx/frontend-platform/auth', () => ({ getAuthenticatedHttpClient: jest.fn() }));
jest.mock('@edx/frontend-platform', () => ({
  ...jest.requireActual('@edx/frontend-platform'),
  getConfig: jest.fn(() => ({ STUDIO_BASE_URL: 'http://studio.local:8001' })),
}));

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

describe('getOrgListStats', () => {
  it('asks the organizations mount and camelCases the answer', async () => {
    mockGet.mockResolvedValue({
      data: {
        tiles: {
          active_organizations: 2, organizations_without_admins: 1, courses: 3, programs: 1, enrollments: 9,
        },
        top_organizations: [{
          short_name: 'RWAQ', name: 'Rwaq', arabic_name: 'رواق', courses: 3, enrollments: 9,
        }],
      },
    });

    const stats = await getOrgListStats();

    expect(mockGet).toHaveBeenCalledWith('http://studio.local:8001/rwaq/api/organizations/stats/');
    expect(stats.tiles.organizationsWithoutAdmins).toBe(1);
    expect(stats.topOrganizations[0].shortName).toBe('RWAQ');
    expect(stats.topOrganizations[0].arabicName).toBe('رواق');
  });
});

describe('useOrgListStats', () => {
  it('makes no request while disabled', () => {
    renderHook(() => useOrgListStats(false), { wrapper });

    expect(mockGet).not.toHaveBeenCalled();
  });
});
