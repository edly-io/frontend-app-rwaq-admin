import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { getAdminCapabilities } from './whoami';

jest.mock('@edx/frontend-platform/auth', () => ({
  getAuthenticatedHttpClient: jest.fn(),
  getAuthenticatedUser: jest.fn(),
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

  it('denies a staff claim when the endpoint is missing', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockRejectedValue(notFound),
    });
    (getAuthenticatedUser as jest.Mock).mockReturnValue({ username: 'staffer', administrator: true });

    const capabilities = await getAdminCapabilities();
    // A staff claim alone cannot establish panel access.
    expect(capabilities.canAccessAdminPanel).toBe(false);
    expect(capabilities.isGlobalStaff).toBe(true);
    // The claim cannot report this, so it must not be invented.
    expect(capabilities.isSuperuser).toBe(false);
  });

  it('still denies on 404 when the claim shows no staff access', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockRejectedValue(notFound),
    });
    (getAuthenticatedUser as jest.Mock).mockReturnValue({ username: 'learner', administrator: false });

    await expect(getAdminCapabilities()).resolves.toMatchObject({ canAccessAdminPanel: false });
  });

  it('rethrows anything other than a 404, so a real failure is not read as access', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockRejectedValue({ response: { status: 500 } }),
    });

    await expect(getAdminCapabilities()).rejects.toBeDefined();
  });
});
