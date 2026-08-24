/**
 * The capability check's deploy-gap behaviour.
 *
 * These two cases exist because the MFE and the backend ship as separate
 * artifacts, so an MFE can be live against a backend that predates
 * /api/v1/admin/me/. Treating that as a denial would lock every admin out of
 * the whole panel — superusers included — for the length of the gap.
 */
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

  it('falls back to the JWT claim on 404, so an older backend does not lock everyone out', async () => {
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({
      get: jest.fn().mockRejectedValue(notFound),
    });
    (getAuthenticatedUser as jest.Mock).mockReturnValue({ username: 'staffer', administrator: true });

    const capabilities = await getAdminCapabilities();
    // administrator is is_staff — the gate the older backend actually enforced.
    expect(capabilities.canAccessAdminPanel).toBe(true);
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
