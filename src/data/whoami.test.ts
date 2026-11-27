import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getAdminCapabilities } from './whoami';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
}));

jest.mock('@edx/frontend-platform', () => {
  const actual = jest.requireActual('@edx/frontend-platform');
  return { ...actual, getConfig: jest.fn(() => ({ STUDIO_BASE_URL: 'http://studio.local:8001' })) };
});

const notFound = { response: { status: 404 } };

describe('getAdminCapabilities', () => {
  it('reads the answer from the server when the endpoint exists', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockResolvedValue({
        data: {
          username: 'root', is_superuser: true, is_global_staff: true, can_access_admin_panel: true,
        },
      }),
    });

    await expect(getAdminCapabilities()).resolves.toEqual({
      username: 'root', isSuperuser: true, isGlobalStaff: true, canAccessAdminPanel: true,
    });
  });

  it('reports a missing endpoint as an error, never as an access denial', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get: jest.fn().mockRejectedValue(notFound) });
    await expect(getAdminCapabilities()).rejects.toEqual(notFound);
  });

  it('rethrows anything other than a 404, so a real failure is not read as access', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockRejectedValue({ response: { status: 500 } }),
    });

    await expect(getAdminCapabilities()).rejects.toBeDefined();
  });
});
