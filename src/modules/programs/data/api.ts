/**
 * Programs API — the ONLY file that should change when the backend evolves.
 * All components call the hooks in hooks.ts, never this file directly.
 *
 *   GET      /api/v1/admin/programs/
 *   GET|PATCH /api/v1/admin/programs/{uuid}/
 *   GET      /api/v1/admin/programs/{uuid}/courses/
 *   GET      /api/v1/admin/programs/{uuid}/learners/
 *
 * Host: Studio (CMS), not LMS — same host rule as every other admin module.
 * Authentication: Global Staff (IsGlobalStaff on every endpoint).
 *
 * Case: wire format is snake_case, the app is camelCase. Every response goes
 * through camelCaseObject; every request body/param through snakeCaseObject.
 */
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getStudioApiUrl } from '@src/data/utils';
import type {
  ProgramCourse,
  ProgramDetail,
  ProgramLearner,
  ProgramListParams,
  ProgramListResponse,
  ProgramPatch,
} from './types';

const getProgramsBaseUrl = () => getStudioApiUrl('/api/v1/admin/programs');

// ── List ───────────────────────────────────────────────────────────────────────

/** GET /api/v1/admin/programs/?search=&status=&org=&is_hide=&is_featured=&ordering=&page=&page_size= */
export const getPrograms = async (params: ProgramListParams = {}): Promise<ProgramListResponse> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getProgramsBaseUrl()}/`, {
    params: snakeCaseObject(params),
  });
  return camelCaseObject(data) as ProgramListResponse;
};

// ── Detail ─────────────────────────────────────────────────────────────────────

/** GET /api/v1/admin/programs/{uuid}/ */
export const getProgram = async (uuid: string): Promise<ProgramDetail> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getProgramsBaseUrl()}/${uuid}/`);
  return camelCaseObject(data) as ProgramDetail;
};

/** PATCH /api/v1/admin/programs/{uuid}/ — settings toggles and status only. */
export const updateProgram = async (uuid: string, patch: ProgramPatch): Promise<ProgramDetail> => {
  const { data } = await getAuthenticatedHttpClient().patch(
    `${getProgramsBaseUrl()}/${uuid}/`,
    snakeCaseObject(patch),
  );
  return camelCaseObject(data) as ProgramDetail;
};

// ── Courses ────────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/programs/{uuid}/courses/
 * Assumes the backend returns a flat array (no NamespacedPageNumberPagination wrapper).
 * If the endpoint is later paginated, change the return type to a response envelope
 * and update useProgramCourses accordingly.
 */
export const getProgramCourses = async (uuid: string): Promise<ProgramCourse[]> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getProgramsBaseUrl()}/${uuid}/courses/`);
  return camelCaseObject(data) as ProgramCourse[];
};

// ── Learners ───────────────────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/programs/{uuid}/learners/
 * Assumes a flat array response — same caveat as getProgramCourses above.
 */
export const getProgramLearners = async (uuid: string): Promise<ProgramLearner[]> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getProgramsBaseUrl()}/${uuid}/learners/`);
  return camelCaseObject(data) as ProgramLearner[];
};
