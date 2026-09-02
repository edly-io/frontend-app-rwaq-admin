/**
 * Users API — the ONLY file that should change when the backend evolves.
 * All components call the hooks in hooks.ts, never this file directly.
 *
 *   GET|POST  /api/v1/admin/users/
 *   GET|PATCH /api/v1/admin/users/{id}/
 *   GET       /api/v1/admin/users/{id}/enrollments/
 *
 * Host: **Studio (CMS)**, not the LMS.  The Course Creator grant writes the
 * CourseCreator row that Studio's own course-creation gate reads, and
 * cms.djangoapps.course_creators is in CMS's INSTALLED_APPS only — from the
 * LMS the backend answers 503 for that grant.  One host for the whole module
 * keeps the seam simple; the one cost is that certificate_status in the
 * enrollments list is null there (the certificates app is LMS-only).
 *
 * Authentication: Global Staff (IsGlobalStaff on every endpoint).
 * Client: getAuthenticatedHttpClient() injects JWT + CSRF automatically.
 *
 * Case: the wire format is snake_case, the app is camelCase.  Every response
 * goes through camelCaseObject and every request body/param through
 * snakeCaseObject, so nothing above this file sees snake_case keys.
 */
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getStudioApiUrl } from '@src/data/utils';
import type {
  ChangeModePayload,
  EnrollableCourse,
  EnrollPayload,
  UnenrollPayload,
  UserCreatePayload,
  UserDetail,
  UserEnrollment,
  UserListParams,
  UserListResponse,
  UserPatchPayload,
} from './types';

const getUsersBaseUrl = () => getStudioApiUrl('/api/v1/admin/users');

// ── List ───────────────────────────────────────────────────────────────────────

/** GET /api/v1/admin/users/?search_by=&search_term=&filter=&ordering=&page=&page_size= */
export const getUsers = async (params: UserListParams = {}): Promise<UserListResponse> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getUsersBaseUrl()}/`, {
    params: snakeCaseObject(params),
  });
  return camelCaseObject(data) as UserListResponse;
};

// ── Detail ─────────────────────────────────────────────────────────────────────

/** GET /api/v1/admin/users/{id}/ */
export const getUser = async (id: number): Promise<UserDetail> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getUsersBaseUrl()}/${id}/`);
  return camelCaseObject(data) as UserDetail;
};

/** GET /api/v1/admin/users/{id}/enrollments/ — for the detail drawer's tab. */
export const getUserEnrollments = async (id: number): Promise<UserEnrollment[]> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getUsersBaseUrl()}/${id}/enrollments/`);
  return camelCaseObject(data) as UserEnrollment[];
};

/**
 * GET /api/v1/admin/courses/enrollable/?search= — the enroll form's picker.
 *
 * Not under /users/, since the course list isn't scoped to a learner; it just
 * happens to serve this form.
 */
export const getEnrollableCourses = async (search: string): Promise<EnrollableCourse[]> => {
  const { data } = await getAuthenticatedHttpClient().get(
    getStudioApiUrl('/api/v1/admin/courses/enrollable/'),
    { params: { search } },
  );
  return camelCaseObject(data) as EnrollableCourse[];
};

/** POST enrollments/ — enrolls, or reactivates an enrollment they had left. */
export const enrollUser = async (
  id: number,
  payload: EnrollPayload,
): Promise<UserEnrollment> => {
  const { data } = await getAuthenticatedHttpClient().post(
    `${getUsersBaseUrl()}/${id}/enrollments/`,
    snakeCaseObject(payload),
  );
  return camelCaseObject(data) as UserEnrollment;
};

/**
 * PATCH enrollments/{courseId}/ — changes the mode.
 *
 * The course key contains ':' and '+', so it is encoded rather than
 * interpolated raw.
 */
export const changeEnrollmentMode = async (
  id: number,
  courseId: string,
  payload: ChangeModePayload,
): Promise<UserEnrollment> => {
  const { data } = await getAuthenticatedHttpClient().patch(
    `${getUsersBaseUrl()}/${id}/enrollments/${encodeURIComponent(courseId)}/`,
    snakeCaseObject(payload),
  );
  return camelCaseObject(data) as UserEnrollment;
};

/**
 * DELETE enrollments/{courseId}/ — unenrolls, keeping the row.
 *
 * The reason travels in the body rather than the query string: a DELETE with a
 * body is unusual, but a reason in the URL would land in access logs next to
 * the learner's identity.
 */
export const unenrollUser = async (
  id: number,
  courseId: string,
  payload: UnenrollPayload,
): Promise<void> => {
  await getAuthenticatedHttpClient().delete(
    `${getUsersBaseUrl()}/${id}/enrollments/${encodeURIComponent(courseId)}/`,
    { data: snakeCaseObject(payload) },
  );
};

// ── Create ─────────────────────────────────────────────────────────────────────

/** POST /api/v1/admin/users/ — creates user + profile + grants, returns 201 with the detail. */
export const createUser = async (payload: UserCreatePayload): Promise<UserDetail> => {
  const { data } = await getAuthenticatedHttpClient().post(
    `${getUsersBaseUrl()}/`,
    snakeCaseObject(payload),
  );
  return camelCaseObject(data) as UserDetail;
};

// ── Update ─────────────────────────────────────────────────────────────────────

/** PATCH /api/v1/admin/users/{id}/ — editable fields and grants only. */
export const updateUser = async (id: number, patch: UserPatchPayload): Promise<UserDetail> => {
  const { data } = await getAuthenticatedHttpClient().patch(
    `${getUsersBaseUrl()}/${id}/`,
    snakeCaseObject(patch),
  );
  return camelCaseObject(data) as UserDetail;
};

/** POST /api/v1/admin/users/{id}/image/ — upload or replace the profile picture. */
export const uploadUserImage = async (id: number, file: File): Promise<void> => {
  const form = new FormData();
  form.append('image', file);
  await getAuthenticatedHttpClient().post(`${getUsersBaseUrl()}/${id}/image/`, form);
};
