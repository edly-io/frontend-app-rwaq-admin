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
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform';
import { useQuery } from '@tanstack/react-query';
import { appId } from '@src/constants';
import { getStudioApiUrl } from './utils';

export interface AdminCapabilities {
  username: string;
  isSuperuser: boolean;
  isGlobalStaff: boolean;
  /** The gate itself, named for its meaning so the UI never re-derives it. */
  canAccessAdminPanel: boolean;
}

export const getAdminCapabilities = async (): Promise<AdminCapabilities> => {
  const { data } = await getAuthenticatedHttpClient().get(getStudioApiUrl('/api/v1/admin/me/'));
  return camelCaseObject(data) as AdminCapabilities;
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
