/**
 * Organizations API — the ONLY file that should change when the backend evolves.
 * All components call only the hooks in hooks.ts, never this file directly.
 *
 * Base URL: GET|PATCH /rwaq/api/organizations/
 *           GET|POST|DELETE /rwaq/api/organizations/<short_name>/members/<email>/
 *
 * Authentication: Global Staff (IsGlobalStaff on every endpoint).
 * Client: getAuthenticatedHttpClient() injects JWT + CSRF automatically.
 */
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getApiUrl } from '@src/data/utils';
import type {
  OrgDetail,
  OrgListParams,
  OrgListResponse,
  OrgMember,
  OrgProfilePatch,
} from './types';

const getOrgsBaseUrl = () => getApiUrl('/rwaq/api/organizations');

// ── List ───────────────────────────────────────────────────────────────────────

/** GET /rwaq/api/organizations/?search=&ordering=&page=&page_size= */
export const getOrganizations = async (params: OrgListParams = {}): Promise<OrgListResponse> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getOrgsBaseUrl()}/`, { params });
  return data as OrgListResponse;
};

// ── Detail ─────────────────────────────────────────────────────────────────────

/** GET /rwaq/api/organizations/<short_name>/ */
export const getOrganization = async (shortName: string): Promise<OrgDetail> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getOrgsBaseUrl()}/${shortName}/`);
  return data as OrgDetail;
};

// ── Profile update ─────────────────────────────────────────────────────────────

/** PATCH /rwaq/api/organizations/<short_name>/ */
export const updateOrganization = async (
  shortName: string,
  patch: OrgProfilePatch,
): Promise<OrgDetail> => {
  const { data } = await getAuthenticatedHttpClient().patch(
    `${getOrgsBaseUrl()}/${shortName}/`,
    patch,
  );
  return data as OrgDetail;
};

// ── Members ────────────────────────────────────────────────────────────────────

/** GET /rwaq/api/organizations/<short_name>/members/<email>/ */
export const getOrgMember = async (shortName: string, email: string): Promise<OrgMember> => {
  const encodedEmail = encodeURIComponent(email);
  const { data } = await getAuthenticatedHttpClient().get(
    `${getOrgsBaseUrl()}/${shortName}/members/${encodedEmail}/`,
  );
  return data as OrgMember;
};

/** POST /rwaq/api/organizations/<short_name>/members/<email>/
 *  Grants OrgInstructorRole to the user identified by <email>. */
export const addOrgAdmin = async (shortName: string, email: string): Promise<OrgMember> => {
  const encodedEmail = encodeURIComponent(email);
  const { data } = await getAuthenticatedHttpClient().post(
    `${getOrgsBaseUrl()}/${shortName}/members/${encodedEmail}/`,
  );
  return data as OrgMember;
};

/** DELETE /rwaq/api/organizations/<short_name>/members/<email>/
 *  Revokes OrgInstructorRole from the user identified by <email>. */
export const removeOrgAdmin = async (shortName: string, email: string): Promise<void> => {
  const encodedEmail = encodeURIComponent(email);
  await getAuthenticatedHttpClient().delete(
    `${getOrgsBaseUrl()}/${shortName}/members/${encodedEmail}/`,
  );
};
