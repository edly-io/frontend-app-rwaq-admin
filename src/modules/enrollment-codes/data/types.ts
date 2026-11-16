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

/** What a code covers: one course, one program or every Enrollment code item of one organization. */
export type CodeScope = 'course' | 'program' | 'organization';

/** active, switched_off (an admin turned it off), expired (past its date) or used_up (every use taken). */
export type CodeStatus = 'active' | 'switched_off' | 'expired' | 'used_up';

/**
 * What a code is linked to. `id` is the course key, the program UUID or, for an organization code, the
 * organization short name.
 */
export interface CodeItem {
  kind: ItemKind | 'organization';
  id: string;
  name: string;
  organization: string;
}

/** One row of GET /api/v1/admin/enrollment-codes/ */
export interface EnrollmentCode {
  id: number;
  code: string;
  scope: CodeScope;
  item: CodeItem;
  maxUses: number;
  /** Learners who used the code. A learner counts once, however many items they joined with it. */
  usesCount: number;
  /** Courses and programs joined through the code (one per use row). */
  itemsJoinedCount: number;
  /** Organization codes only: how many Enrollment code courses and programs the code covers today. */
  coveredItemsCount?: number;
  expiresAt: string | null;
  isActive: boolean;
  status: CodeStatus;
  /** Username of the admin who created it. */
  createdBy: string;
  created: string;
}

export interface CodeListParams {
  status?: CodeStatus;
  kind?: CodeScope;
  /** Organization short name: only the organization codes of that organization. */
  organization?: string;
  courseId?: string;
  programUuid?: string;
  createdBy?: string;
  search?: string;
  page?: number;
  pageSize?: number;
}

/**
 * POST body. Without `code` the backend generates one. A date-only `expiresAt` ("2026-12-31") is accepted.
 * Exactly one of `courseId`, `programUuid` and `organization` (the short name) is sent.
 */
export interface CodeCreatePayload {
  code?: string;
  courseId?: string;
  programUuid?: string;
  organization?: string;
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
  /** True on the row where the learner typed the code. False for items joined later through it. */
  enteredCode: boolean;
  scope: CodeScope;
  /** The code's organization for an organization code, else the organization of the course or program. */
  organization: string;
}

/** One row of GET /api/v1/admin/enrollment-codes/{id}/items/ */
export interface CodeItemRow {
  kind: ItemKind;
  id: string;
  name: string;
  /** Learners who joined this item through the code. */
  learnersJoined: number;
}

export interface UseListParams {
  codeId?: number;
  code?: string;
  courseId?: string;
  programUuid?: string;
  organization?: string;
  scope?: CodeScope;
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
  itemKind: ItemKind | 'organization';
  organizationName: string;
  organizationArabicName: string;
  /** A data URL, or "" when there is no logo. */
  logo: string;
  /** The link the QR code opens, or "" when the public site address is not set. */
  qrUrl: string;
  /** True when no QR code can be made because the public site address is not set. */
  qrMissing: boolean;
  expiresAt: string | null;
  /** Platform settings. Each part is empty when the platform has not set it. */
  platform: {
    slogan: string;
    about: string;
    links: CardLink[];
  };
}
