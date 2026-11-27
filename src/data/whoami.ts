/** Capabilities returned by the admin API. */
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { camelCaseObject } from '@edx/frontend-platform';
import { useQuery } from '@tanstack/react-query';
import { appId } from '@src/constants';
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

/* A missing capabilities endpoint is an error, never an authorization decision. */
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
  staleTime: 30 * 60 * 1000, // 30 minutes — matches JWT refresh cycle
});
