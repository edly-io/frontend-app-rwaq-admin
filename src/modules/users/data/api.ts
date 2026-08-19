/**
 * Users API — the ONLY file that should change when the backend evolves.
 * All components call only the hooks in hooks.ts, never this file directly.
 *
 * Base URL: GET|POST /api/v1/admin/users/
 *           GET|PATCH /api/v1/admin/users/{id}/
 *
 * Authentication: Global Staff (IsGlobalStaff on every endpoint).
 * Client: getAuthenticatedHttpClient() injects JWT + CSRF automatically.
 */
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getApiUrl } from '@src/data/utils';
import type {
  UserCreatePayload,
  UserDetail,
  UserListParams,
  UserListResponse,
  UserPatchPayload,
} from './types';

const getUsersBaseUrl = () => getApiUrl('/api/v1/admin/users');

// ── List ───────────────────────────────────────────────────────────────────────

/** GET /api/v1/admin/users/?search_by=&search_term=&filter=&page=&page_size= */
export const getUsers = async (params: UserListParams = {}): Promise<UserListResponse> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getUsersBaseUrl()}/`, { params });
  return data as UserListResponse;
};

// ── Detail ─────────────────────────────────────────────────────────────────────

/** GET /api/v1/admin/users/{id}/ */
export const getUser = async (id: number): Promise<UserDetail> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getUsersBaseUrl()}/${id}/`);
  return data as UserDetail;
};

// ── Create ─────────────────────────────────────────────────────────────────────

/** POST /api/v1/admin/users/ — creates user + profile, returns 201 with created row. */
export const createUser = async (payload: UserCreatePayload): Promise<UserDetail> => {
  const { data } = await getAuthenticatedHttpClient().post(`${getUsersBaseUrl()}/`, payload);
  return data as UserDetail;
};

// ── Update ─────────────────────────────────────────────────────────────────────

/** PATCH /api/v1/admin/users/{id}/ — editable fields only; returns updated row. */
export const updateUser = async (id: number, patch: UserPatchPayload): Promise<UserDetail> => {
  const { data } = await getAuthenticatedHttpClient().patch(`${getUsersBaseUrl()}/${id}/`, patch);
  return data as UserDetail;
};
