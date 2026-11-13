/**
 * Enrollment codes API — the ONLY file that changes when the backend evolves.
 * Components call the hooks in hooks.ts, never this file directly.
 *
 *   GET    /api/v1/admin/enrollment-codes/
 *   POST   /api/v1/admin/enrollment-codes/
 *   PATCH  /api/v1/admin/enrollment-codes/{id}/
 *   DELETE /api/v1/admin/enrollment-codes/{id}/   only while the code has no uses
 *   GET    /api/v1/admin/enrollment-codes/{id}/card/
 *   GET    /api/v1/admin/enrollment-codes/{id}/items/   the items a code covers, learners joined per item
 *   GET    /api/v1/admin/enrollment-codes/uses/
 *   GET    /api/v1/admin/enrollment-codes/uses/csv/   same filters, every use, as a file
 *
 * Host: Studio (CMS). Authentication: superuser only.
 * Case: snake_case on the wire, camelCase in the app.
 */
import { camelCaseObject, snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getStudioApiUrl } from '@src/data/utils';
import type {
  CodeCard,
  CodeCreatePayload,
  CodeItemRow,
  CodeListParams,
  CodePatch,
  CodeUse,
  EnrollmentCode,
  Paginated,
  UseListParams,
} from './types';

const getBaseUrl = () => getStudioApiUrl('/api/v1/admin/enrollment-codes');

/** Drop empty values so the URL only carries filters that are actually set. */
const toQuery = (params: object) => snakeCaseObject(
  Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined && value !== '')),
);

export const getEnrollmentCodes = async (params: CodeListParams = {}): Promise<Paginated<EnrollmentCode>> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getBaseUrl()}/`, { params: toQuery(params) });
  return camelCaseObject(data) as Paginated<EnrollmentCode>;
};

export const getEnrollmentCode = async (id: number): Promise<EnrollmentCode> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getBaseUrl()}/${id}/`);
  return camelCaseObject(data) as EnrollmentCode;
};

export const createEnrollmentCode = async (payload: CodeCreatePayload): Promise<EnrollmentCode> => {
  const { data } = await getAuthenticatedHttpClient().post(`${getBaseUrl()}/`, toQuery(payload));
  return camelCaseObject(data) as EnrollmentCode;
};

/** `expiresAt: null` is sent as null, which clears the date. */
export const updateEnrollmentCode = async (id: number, patch: CodePatch): Promise<EnrollmentCode> => {
  const { data } = await getAuthenticatedHttpClient().patch(
    `${getBaseUrl()}/${id}/`,
    snakeCaseObject(Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined))),
  );
  return camelCaseObject(data) as EnrollmentCode;
};

export const deleteEnrollmentCode = async (id: number): Promise<void> => {
  await getAuthenticatedHttpClient().delete(`${getBaseUrl()}/${id}/`);
};

export const getEnrollmentCodeCard = async (id: number): Promise<CodeCard> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getBaseUrl()}/${id}/card/`);
  return camelCaseObject(data) as CodeCard;
};

export const getEnrollmentCodeItems = async (id: number): Promise<CodeItemRow[]> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getBaseUrl()}/${id}/items/`);
  return camelCaseObject(data) as CodeItemRow[];
};

export const getEnrollmentCodeUses = async (params: UseListParams = {}): Promise<Paginated<CodeUse>> => {
  const { data } = await getAuthenticatedHttpClient().get(`${getBaseUrl()}/uses/`, { params: toQuery(params) });
  return camelCaseObject(data) as Paginated<CodeUse>;
};

/** URL of the uses CSV, for the shared CSV download button. */
export const getEnrollmentCodeUsesCsvUrl = () => `${getBaseUrl()}/uses/csv/`;
