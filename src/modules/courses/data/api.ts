/**
 * Courses API — the ONLY file that should change when the backend evolves.
 * All components call the hooks in hooks.ts, never this file directly.
 *
 *   GET     /api/v1/admin/courses/
 *   GET     /api/v1/admin/courses/{courseId}/
 *   GET     /api/v1/admin/courses/{courseId}/enrollments/
 *   POST    /api/v1/admin/courses/{courseId}/enrollments/
 *   GET     /api/v1/admin/courses/{courseId}/enrollments/csv/
 *   GET     /api/v1/admin/courses/{courseId}/staff/
 *   POST    /api/v1/admin/courses/{courseId}/staff/
 *   DELETE  /api/v1/admin/courses/{courseId}/staff/{userId}/
 *   GET     /api/v1/admin/courses/{courseId}/pricing/
 *   PUT     /api/v1/admin/courses/{courseId}/pricing/
 *
 * Host: Studio (CMS). Grade/cert stats are null when served from CMS — the
 * backend sends explicit nulls; the frontend surfaces "—" in those cells.
 *
 * Authentication: Global Staff (IsGlobalStaff on every endpoint).
 *
 * Course keys contain ':' and '+' — always encodeURIComponent before placing
 * in a URL segment.
 *
 * Case: wire is snake_case, app is camelCase. camelCaseObject / snakeCaseObject
 * at the boundary; nothing above this file sees snake_case keys.
 */
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getStudioApiUrl } from '@src/data/utils';
import type {
  CourseDetail,
  CoursePricing,
  CoursePricingPatch,
  CourseEnrollmentParams,
  CourseEnrollmentResponse,
  CourseEnrollPayload,
  CourseListParams,
  CourseListResponse,
  CourseStaffAddPayload,
  CourseStaffMember,
  CourseStaffRemoveParams,
} from './types';

const getCoursesBaseUrl = () => getStudioApiUrl('/api/v1/admin/courses');

// ── List ──────────────────────────────────────────────────────────────────────

/** GET /api/v1/admin/courses/?search=&org=&category=&ordering=&page=&page_size= */
export const getCourses = async (params: CourseListParams = {}): Promise<CourseListResponse> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getCoursesBaseUrl()}/`, {
    params: snakeCaseObject(params),
  });
  return camelCaseObject(data) as CourseListResponse;
};

// ── Detail ────────────────────────────────────────────────────────────────────

/** GET /api/v1/admin/courses/{courseId}/ */
export const getCourse = async (courseId: string): Promise<CourseDetail> => {
  const { data } = await getAuthenticatedHttpClient().get(
    `${getCoursesBaseUrl()}/${encodeURIComponent(courseId)}/`,
  );
  return camelCaseObject(data) as CourseDetail;
};

// ── Enrollments ───────────────────────────────────────────────────────────────

/** GET /api/v1/admin/courses/{courseId}/enrollments/?search_by=&search_term=&page=&page_size= */
export const getCourseEnrollments = async (
  courseId: string,
  params: CourseEnrollmentParams = {},
): Promise<CourseEnrollmentResponse> => {
  const { data } = await getAuthenticatedHttpClient().get(
    `${getCoursesBaseUrl()}/${encodeURIComponent(courseId)}/enrollments/`,
    { params: snakeCaseObject(params) },
  );
  return camelCaseObject(data) as CourseEnrollmentResponse;
};

/**
 * GET /api/v1/admin/courses/{courseId}/enrollments/csv/
 *
 * A plain <a href> won't work — the JWT won't be sent. Instead use the
 * authenticated client with responseType: 'blob' and programmatically trigger
 * the download from the blob.
 */
export const downloadCourseEnrollmentsCsv = async (courseId: string): Promise<Blob> => {
  const { data } = await getAuthenticatedHttpClient().get(
    `${getCoursesBaseUrl()}/${encodeURIComponent(courseId)}/enrollments/csv/`,
    { responseType: 'blob' },
  );
  return data as Blob;
};

/** POST /api/v1/admin/courses/{courseId}/enrollments/ */
export const enrollUserInCourse = async (
  courseId: string,
  payload: CourseEnrollPayload,
): Promise<void> => {
  await getAuthenticatedHttpClient().post(
    `${getCoursesBaseUrl()}/${encodeURIComponent(courseId)}/enrollments/`,
    snakeCaseObject(payload),
  );
};

// ── Staff ─────────────────────────────────────────────────────────────────────

/** GET /api/v1/admin/courses/{courseId}/staff/ — returns paginated; we unwrap results here. */
export const getCourseStaff = async (courseId: string): Promise<CourseStaffMember[]> => {
  const { data } = await getAuthenticatedHttpClient().get(
    `${getCoursesBaseUrl()}/${encodeURIComponent(courseId)}/staff/`,
  );
  const parsed = camelCaseObject(data) as { results: CourseStaffMember[] } | CourseStaffMember[];
  return Array.isArray(parsed) ? parsed : parsed.results;
};

/** POST /api/v1/admin/courses/{courseId}/staff/ */
export const addCourseStaff = async (
  courseId: string,
  payload: CourseStaffAddPayload,
): Promise<CourseStaffMember> => {
  const { data } = await getAuthenticatedHttpClient().post(
    `${getCoursesBaseUrl()}/${encodeURIComponent(courseId)}/staff/`,
    snakeCaseObject(payload),
  );
  return camelCaseObject(data) as CourseStaffMember;
};

/** DELETE /api/v1/admin/courses/{courseId}/staff/{userId}/{role}/ */
export const removeCourseStaff = async (
  courseId: string,
  params: CourseStaffRemoveParams,
): Promise<void> => {
  await getAuthenticatedHttpClient().delete(
    `${getCoursesBaseUrl()}/${encodeURIComponent(courseId)}/staff/${params.userId}/${encodeURIComponent(params.role)}/`,
  );
};

// ── Pricing ──────────────────────────────────────────────────────────────────

/** GET /api/v1/admin/courses/{courseId}/pricing/ */
export const getCoursePricing = async (courseId: string): Promise<CoursePricing> => {
  const { data } = await getAuthenticatedHttpClient().get(
    `${getCoursesBaseUrl()}/${encodeURIComponent(courseId)}/pricing/`,
  );
  return camelCaseObject(data) as CoursePricing;
};

/**
 * PUT /api/v1/admin/courses/{courseId}/pricing/
 *
 * Accepts a partial body, so flipping pricingManagedByAdmin does not require
 * restating a price the admin is not changing.
 */
export const updateCoursePricing = async (
  courseId: string,
  patch: CoursePricingPatch,
): Promise<CoursePricing> => {
  const body: Record<string, unknown> = {};
  if (patch.pricingCategory !== undefined) { body.pricing_category = patch.pricingCategory; }
  if (patch.price !== undefined) { body.price = patch.price; }
  if (patch.discount !== undefined) { body.discount = patch.discount; }
  if (patch.pricingManagedByAdmin !== undefined) {
    body.pricing_managed_by_admin = patch.pricingManagedByAdmin;
  }
  const { data } = await getAuthenticatedHttpClient().put(
    `${getCoursesBaseUrl()}/${encodeURIComponent(courseId)}/pricing/`,
    body,
  );
  return camelCaseObject(data) as CoursePricing;
};
