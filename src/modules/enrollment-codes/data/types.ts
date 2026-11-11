// ── Enrollment codes API types ───────────────────────────────────────────────
//
// camelCase above the API boundary; api.ts normalizes the snake_case wire format.

import type { PaginationMeta } from '@src/modules/courses/data/types';

export type { PaginationMeta };

export interface Paginated<Row> {
  pagination: PaginationMeta;
  results: Row[];
}

export type ItemKind = 'course' | 'program';

/** active, switched_off (an admin turned it off), expired (past its date) or used_up (every use taken). */
export type CodeStatus = 'active' | 'switched_off' | 'expired' | 'used_up';

/** The one course or program a code is linked to. `id` is the course key or the program UUID. */
export interface CodeItem {
  kind: ItemKind;
  id: string;
  name: string;
  organization: string;
}

/** One row of GET /api/v1/admin/enrollment-codes/ */
export interface EnrollmentCode {
  id: number;
  code: string;
  item: CodeItem;
  maxUses: number;
  usesCount: number;
  expiresAt: string | null;
  isActive: boolean;
  status: CodeStatus;
  /** Username of the admin who created it. */
  createdBy: string;
  created: string;
}

export interface CodeListParams {
  status?: CodeStatus;
  kind?: ItemKind;
  courseId?: string;
  programUuid?: string;
  createdBy?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

/** POST body. Without `code` the backend generates one. A date-only `expiresAt` ("2026-12-31") is accepted. */
export interface CodeCreatePayload {
  code?: string;
  courseId?: string;
  programUuid?: string;
  maxUses: number;
  expiresAt?: string;
}

/** PATCH body. `expiresAt: null` clears the date. The code text and the item cannot change. */
export interface CodePatch {
  maxUses?: number;
  expiresAt?: string | null;
  isActive?: boolean;
}

export interface UseStudent {
  id: number;
  name: string;
  username: string;
  email: string;
}

/** One row of GET /api/v1/admin/enrollment-codes/uses/ */
export interface CodeUse {
  id: number;
  student: UseStudent;
  code: string;
  codeId: number;
  item: { kind: ItemKind; id: string; name: string };
  usedAt: string;
  /** False when the learner left the course or program afterwards. */
  stillEnrolled: boolean;
}

export interface UseListParams {
  codeId?: number;
  code?: string;
  courseId?: string;
  programUuid?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

export type CardLinkType = 'website' | 'email' | 'x' | 'linkedin' | 'facebook' | 'instagram' | 'youtube';

export interface CardLink {
  type: CardLinkType;
  url: string;
  /** What the card shows next to the icon, for example "@rwaq". */
  text: string;
}

/** GET /api/v1/admin/enrollment-codes/{id}/card/ */
export interface CodeCard {
  code: string;
  itemName: string;
  itemKind: ItemKind;
  organizationName: string;
  organizationArabicName: string;
  /** A data URL, or "" when there is no logo. */
  logo: string;
  /** The link the QR code opens. */
  qrUrl: string;
  expiresAt: string | null;
  /** Platform settings. Each part is empty when the platform has not set it. */
  platform: {
    slogan: string;
    about: string;
    links: CardLink[];
  };
}
