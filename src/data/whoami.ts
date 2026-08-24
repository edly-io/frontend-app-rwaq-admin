/**
 * What the signed-in admin is allowed to do here.
 *
 * The panel is superuser-gated, and the MFE cannot determine that on its own:
 * Open edX's JWT does carry a `superuser` claim, but @edx/frontend-platform
 * maps only email, userId, username, roles, administrator and name onto its
 * authenticated-user object — and `administrator` is `is_staff`, not
 * `is_superuser`. Decoding the JWT cookie by hand would put the authorization
 * rule in a second place and let the two drift, so the server is asked instead.
 *
 * `/api/v1/admin/me/` is deliberately the one endpoint in this API that is not
 * superuser-only: a 403 cannot distinguish "you may not use this" from "the
 * server is broken", and the shell needs to tell those apart.
 */
import { getAuthenticatedHttpClient, getAuthenticatedUser } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform';
import { useQuery } from '@tanstack/react-query';
import { appId } from '@src/constants';
import { getErrorStatus } from './httpError';
import { getStudioApiUrl } from './utils';

export interface AdminCapabilities {
  username: string;
  isSuperuser: boolean;
  isGlobalStaff: boolean;
  /** The gate itself, named for its meaning so the UI never re-derives it. */
  canAccessAdminPanel: boolean;
}

/**
 * A 404 means the backend predates this endpoint, not that access is refused.
 *
 * The two deploy as separate artifacts, so an MFE can be live against a backend
 * without /me/. Treating that as a denial would lock every admin out of the
 * whole panel — superusers included — for the length of the deploy gap.
 *
 * So a missing endpoint falls back to the claim the older backend actually
 * gated on: `administrator`, which is is_staff. That is the correct answer for
 * that backend, and the server stays the enforcer regardless — every endpoint
 * checks permission itself, so a too-generous guess here shows the shell to
 * someone whose requests are still refused, rather than granting anything.
 */
const capabilitiesFromJwtClaim = (): AdminCapabilities => {
  const user = getAuthenticatedUser() as
    { username?: string; administrator?: boolean } | null;
  const isStaff = user?.administrator === true;
  return {
    username: user?.username ?? '',
    // The claim cannot tell us this — frontend-platform never surfaces it.
    isSuperuser: false,
    isGlobalStaff: isStaff,
    canAccessAdminPanel: isStaff,
  };
};

export const getAdminCapabilities = async (): Promise<AdminCapabilities> => {
  try {
    const { data } = await getAuthenticatedHttpClient().get(getStudioApiUrl('/api/v1/admin/me/'));
    return camelCaseObject(data) as AdminCapabilities;
  } catch (error) {
    if (getErrorStatus(error) === 404) {
      return capabilitiesFromJwtClaim();
    }
    throw error;
  }
};

/**
 * Read the caller's capabilities.
 *
 * No retry: this decides whether to render the app at all, so a failure should
 * surface immediately rather than leaving the admin on a spinner while three
 * attempts time out.
 */
export const useAdminCapabilities = () => useQuery({
  queryKey: [appId, 'whoami'],
  queryFn: getAdminCapabilities,
  retry: false,
  staleTime: Infinity,
});
