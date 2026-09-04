/**
 * Categories API — the ONLY file that should change when the backend evolves.
 * All components call the hooks in hooks.ts, never this file directly.
 *
 *   GET|POST         /rwaq/api/categories/
 *   GET|PATCH        /rwaq/api/categories/<id>/
 *   GET|POST|DELETE  /rwaq/api/categories/<id>/courses/
 *
 * Host: **LMS**, matching where these endpoints are mounted in rwaq-features.
 *
 * Authentication:
 *   - List/create/retrieve/update: superuser only (IsSuperuserUser).
 *   - Category courses (link/unlink): global staff or any org admin
 *     (IsGlobalStaffOrAnyOrgAdmin).
 *
 * Case: snake_case on the wire, camelCase in the app — normalized here.
 */
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getApiUrl } from '@src/data/utils';
import type {
  CategoryCreatePayload,
  CategoryDetail,
  CategoryListParams,
  CategoryListResponse,
  CategoryPatch,
  CategorySummary,
  CategoryCourse,
} from './types';

const getCategoriesBaseUrl = () => getApiUrl('/rwaq/api/categories');

// ── List ─────────────────────────────────────────────────────────────────────

/** GET /rwaq/api/categories/?page=&page_size= */
export const getCategories = async (params: CategoryListParams = {}): Promise<CategoryListResponse> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getCategoriesBaseUrl()}/`, {
    params: snakeCaseObject(params),
  });
  return camelCaseObject(data) as CategoryListResponse;
};

// ── Create ────────────────────────────────────────────────────────────────────

/** POST /rwaq/api/categories/ */
export const createCategory = async (payload: CategoryCreatePayload): Promise<CategoryDetail> => {
  const { data } = await getAuthenticatedHttpClient().post(
    `${getCategoriesBaseUrl()}/`,
    snakeCaseObject(payload),
  );
  return camelCaseObject(data) as CategoryDetail;
};

// ── Detail ────────────────────────────────────────────────────────────────────

/** GET /rwaq/api/categories/<id>/ */
export const getCategory = async (id: number): Promise<CategoryDetail> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getCategoriesBaseUrl()}/${id}/`);
  return camelCaseObject(data) as CategoryDetail;
};

/** PATCH /rwaq/api/categories/<id>/ */
export const updateCategory = async (id: number, patch: CategoryPatch): Promise<CategoryDetail> => {
  const { data } = await getAuthenticatedHttpClient().patch(
    `${getCategoriesBaseUrl()}/${id}/`,
    snakeCaseObject(patch),
  );
  return camelCaseObject(data) as CategoryDetail;
};

// ── Category courses ──────────────────────────────────────────────────────────

/** GET /rwaq/api/categories/<id>/courses/ */
export const getCategoryCourses = async (categoryId: number): Promise<CategoryCourse[]> => {
  const { data } = await getAuthenticatedHttpClient().get(
    `${getCategoriesBaseUrl()}/${categoryId}/courses/`,
  );
  return camelCaseObject(data) as CategoryCourse[];
};

/** POST /rwaq/api/categories/<id>/courses/ — body: { course_id } */
export const linkCourseToCategory = async (
  categoryId: number,
  courseId: string,
): Promise<CategoryCourse> => {
  const { data } = await getAuthenticatedHttpClient().post(
    `${getCategoriesBaseUrl()}/${categoryId}/courses/`,
    { course_id: courseId },
  );
  return camelCaseObject(data) as CategoryCourse;
};

/**
 * DELETE /rwaq/api/categories/<id>/courses/?course_id=…
 *
 * Returns 204 No Content on success; throws on 404 (link doesn't exist).
 */
export const unlinkCourseFromCategory = async (
  categoryId: number,
  courseId: string,
): Promise<void> => {
  await getAuthenticatedHttpClient().delete(
    `${getCategoriesBaseUrl()}/${categoryId}/courses/`,
    { params: { course_id: courseId } },
  );
};

// ── Reverse lookup (course → categories) ─────────────────────────────────────

/** GET /rwaq/api/categories/by-course/<course_id>/ */
export const getCategoriesForCourse = async (courseId: string): Promise<CategorySummary[]> => {
  const { data } = await getAuthenticatedHttpClient().get(
    `${getCategoriesBaseUrl()}/by-course/${encodeURIComponent(courseId)}/`,
  );
  return camelCaseObject(data) as CategorySummary[];
};
