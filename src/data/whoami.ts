/** Capabilities returned by the admin API. */
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
  isAdmin: boolean;
  isOrgAdmin: boolean;
  orgAdminOf: string[];
  role: 'superuser' | 'admin' | 'org_admin' | 'global_staff' | 'none';
  /** The gate itself, named for its meaning so the UI never re-derives it. */
  canAccessAdminPanel: boolean;
}

/** A staff claim cannot establish panel access, so a missing endpoint denies it. */
const capabilitiesFromJwtClaim = (): AdminCapabilities => {
  const user = getAuthenticatedUser() as
    { username?: string; administrator?: boolean } | null;
  const isStaff = user?.administrator === true;
  return {
    username: user?.username ?? '',
    // The claim cannot tell us this — frontend-platform never surfaces it.
    isSuperuser: false,
    isGlobalStaff: isStaff,
    isAdmin: false,
    isOrgAdmin: false,
    orgAdminOf: [],
    role: isStaff ? 'global_staff' : 'none',
    canAccessAdminPanel: false,
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
  staleTime: 30 * 60 * 1000, // 30 minutes — matches JWT refresh cycle
});
