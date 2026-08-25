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
  ProgramSubPage,
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

/** GET /api/v1/admin/programs/{uuid}/courses/?page=<n> */
export const getProgramCourses = async (uuid: string, page = 1): Promise<ProgramSubPage<ProgramCourse>> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getProgramsBaseUrl()}/${uuid}/courses/`, {
    params: { page, page_size: 10 },
  });
  return camelCaseObject(data) as ProgramSubPage<ProgramCourse>;
};

// ── Learners ───────────────────────────────────────────────────────────────────

/** GET /api/v1/admin/programs/{uuid}/learners/?page=<n>&search=<term> */
export const getProgramLearners = async (uuid: string, page = 1, search = ''): Promise<ProgramSubPage<ProgramLearner>> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getProgramsBaseUrl()}/${uuid}/learners/`, {
    params: { page, page_size: 10, ...(search ? { search } : {}) },
  });
  return camelCaseObject(data) as ProgramSubPage<ProgramLearner>;
};
