/**
 * Organizations API — the ONLY file that should change when the backend evolves.
 * All components call the hooks in hooks.ts, never this file directly.
 *
 *   GET|POST         /rwaq/api/organizations/
 *   GET|PATCH        /rwaq/api/organizations/<short_name>/
 *   GET|POST|DELETE  /rwaq/api/organizations/<short_name>/members/<email>/
 *
 * Host: **Studio (CMS)**, matching the users module. Not cosmetic — granting
 * Organization Admin provisions course creation through
 * `cms.djangoapps.course_creators`, which is in CMS's INSTALLED_APPS only, so
 * the same call served from the LMS cannot complete.
 *
 * Authentication: Global Staff (IsGlobalStaff on every endpoint).
 * Case: snake_case on the wire, camelCase in the app — normalized here.
 */
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getStudioApiUrl } from '@src/data/utils';
import type {
  OrgCreatePayload,
  OrgDetail,
  OrgFilter,
  OrgListParams,
  OrgListResponse,
  OrgProfilePatch,
} from './types';

const getOrgsBaseUrl = () => getStudioApiUrl('/rwaq/api/organizations');

/**
 * Translate the single-select UI filter into the backend's own query params.
 *
 * The org list exposes two independent booleans (?active=, ?has_admins=)
 * rather than one ?filter=, so the mapping lives here instead of leaking the
 * backend's parameter shape into the page.
 */
const filterParams = (filter?: OrgFilter): Record<string, string> => {
  switch (filter) {
    case 'active': return { active: 'true' };
    case 'inactive': return { active: 'false' };
    case 'has_admins': return { has_admins: 'true' };
    case 'no_admins': return { has_admins: 'false' };
    default: return {};
  }
};

// ── List ─────────────────────────────────────────────────────────────────────

/** GET /rwaq/api/organizations/?search=&ordering=&page=&page_size= */
export const getOrganizations = async (params: OrgListParams = {}): Promise<OrgListResponse> => {
  const { filter, ...rest } = params;
  const { data } = await getAuthenticatedHttpClient().get(`${getOrgsBaseUrl()}/`, {
    params: { ...snakeCaseObject(rest), ...filterParams(filter) },
  });
  return camelCaseObject(data) as OrgListResponse;
};

// ── Create ───────────────────────────────────────────────────────────────────

/** POST /rwaq/api/organizations/ — the new org is immediately course-creatable. */
export const createOrganization = async (payload: OrgCreatePayload) => {
  const { data } = await getAuthenticatedHttpClient().post(
    `${getOrgsBaseUrl()}/`,
    snakeCaseObject(payload),
  );
  return camelCaseObject(data) as OrgDetail;
};

// ── Detail ───────────────────────────────────────────────────────────────────

/** GET /rwaq/api/organizations/<short_name>/ */
export const getOrganization = async (shortName: string): Promise<OrgDetail> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getOrgsBaseUrl()}/${shortName}/`);
  return camelCaseObject(data) as OrgDetail;
};

/**
 * PATCH /rwaq/api/organizations/<short_name>/
 *
 * When logoFile is supplied the request is sent as multipart/form-data so
 * the binary is included in the same round-trip as the profile fields.
 * Without a logo the body stays application/json.
 */
export const updateOrganization = async (
  shortName: string,
  patch: OrgProfilePatch,
  logoFile?: File | null,
): Promise<OrgDetail> => {
  let body: FormData | Record<string, unknown>;
  if (logoFile) {
    const form = new FormData();
    Object.entries(snakeCaseObject(patch) as Record<string, unknown>).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        form.append(key, String(value));
      }
    });
    form.append('logo', logoFile);
    body = form;
  } else {
    body = snakeCaseObject(patch);
  }
  const { data } = await getAuthenticatedHttpClient().patch(
    `${getOrgsBaseUrl()}/${shortName}/`,
    body,
  );
  return camelCaseObject(data) as OrgDetail;
};

// ── Members ──────────────────────────────────────────────────────────────────

/** POST members/<email>/ — grants Organization Admin. 404 if no such user. */
export const addOrgAdmin = async (shortName: string, email: string): Promise<void> => {
  await getAuthenticatedHttpClient().post(
    `${getOrgsBaseUrl()}/${shortName}/members/${encodeURIComponent(email)}/`,
  );
};

/** DELETE members/<email>/ — revokes Organization Admin for this org only. */
export const removeOrgAdmin = async (shortName: string, email: string): Promise<void> => {
  await getAuthenticatedHttpClient().delete(
    `${getOrgsBaseUrl()}/${shortName}/members/${encodeURIComponent(email)}/`,
  );
};
