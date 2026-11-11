// ── User API types (v2) ──────────────────────────────────────────────────────
//
// camelCase throughout: api.ts normalizes the snake_case wire format at the
// boundary, so nothing above it ever sees snake_case *keys*.  Enum *values*
// (role badges, filters) stay exactly as the backend defines them.

/** Pagination envelope from the user list response */
export interface UserListPagination {
  next: string | null;
  previous: string | null;
  count: number;
  numPages: number;
}

/** Paginated list response from GET /api/v1/admin/users/ */
export interface UserListResponse {
  results: UserSummary[];
  pagination: UserListPagination;
}

/** The platform grants a user holds. isSuperuser and orgAdminOf are read-only. */
export interface UserRoleGrants {
  isGlobalStaff: boolean;
  isSuperuser: boolean;
  isCourseCreator: boolean;
  isSupportStaff: boolean;
  /** Short names of the organizations this user administers (granted on the Organizations screen). */
  orgAdminOf: string[];
}

/** Display badge slugs, most-privileged first. */
export type RoleBadge =
  | 'superuser'
  | 'global_staff'
  | 'course_creator'
  | 'support_staff'
  | 'org_admin'
  | 'learner';

/** User row from the list endpoint */
export interface UserSummary {
  id: number;
  image: string | null;
  name: string;
  email: string;
  roles: UserRoleGrants;
  roleBadges: RoleBadge[];
  createdAt: string;
  lastLogin: string | null;
  isActive: boolean;
  isEmailConfirmed: boolean;
  authenticationMethod: string;
  isProfilePublic: boolean;
}

/** Full user detail from GET /api/v1/admin/users/{id}/ */
export interface UserDetail extends UserSummary {
  username: string;
  country: string;
  biography: string;
  profileVisibility: ProfileVisibility;
  authenticationMethods: string[];
  isLegacy: boolean;
}

/** One row of GET /api/v1/admin/users/{id}/enrollments/ */
export interface UserEnrollment {
  courseId: string;
  courseName: string;
  enrolledAt: string | null;
  mode: string;
  isActive: boolean;
  /** null when the certificates app isn't available on the API host. */
  certificateStatus: string | null;
  /** Modes assignable for this course — the course's own, plus the platform
   *  default floor. Travels with the row so the change-mode form needs no
   *  extra request. */
  availableModes: string[];
  /** All null when no admin has ever changed this enrollment. A self-service
   *  enrollment has no audit row, which is different from an empty reason. */
  lastChangeReason: string | null;
  lastChangeBy: string | null;
  lastChangeAt: string | null;
  /** True for subscription content: admins cannot change the mode or unenroll the learner. */
  isPartOfSubscription?: boolean;
  /**
   * Progress columns (EDLYCSRWAQ-380). Each is null when its source cannot be read on the server or the
   * learner has none, and shows "Not available" or a dash, never zero. Optional so a row returned by an
   * older server still fits.
   */
  status?: EnrollmentProgressStatus | null;
  gradePercent?: number | null;
  lastActivityAt?: string | null;
  certificateIssuedAt?: string | null;
  courseStatus?: 'upcoming' | 'running' | 'ended' | null;
  courseEnd?: string | null;
}

export type EnrollmentProgressStatus = 'passed' | 'in_progress' | 'not_started';

/** One row of GET /api/v1/admin/users/{id}/enrollments/progress/, loaded after the table. */
export interface EnrollmentProgress {
  courseId: string;
  /** Whole percent, null when it could not be worked out for this course. */
  progressPercent: number | null;
}

export type SubscriptionState = 'none' | 'active' | 'cancelled' | 'expired' | 'revoked';

/** GET /api/v1/admin/users/{id}/stats/ — what the enrollments list does not carry. */
export interface UserStats {
  tiles: {
    certificatesEarned: number | null;
    programsEnrolled: number;
    programsCompleted: number;
    /** False when neither completions nor courseware activity can be read. */
    lastActivityAvailable: boolean;
    lastActivityAt: string | null;
    subscriptionStatus: SubscriptionState;
    subscriptionEndsAt: string | null;
  };
  generatedAt: string;
}

/** One row of the course picker behind the enroll form. */
export interface EnrollableCourse {
  courseId: string;
  displayName: string;
  org: string;
  availableModes: string[];
  /** True when the course is reached through the subscription. Admins cannot enroll anyone into it. */
  isPartOfSubscription?: boolean;
  /** True for a Program-only course. Admins cannot enroll anyone into it directly, only through its program. */
  isProgramOnly?: boolean;
  start: string | null;
  end: string | null;
}

/** POST /api/v1/admin/users/{id}/enrollments/ */
export interface EnrollPayload {
  courseId: string;
  mode: string;
  /** Required by the API. Without it the audit trail explains nothing. */
  reason: string;
}

/** PATCH /api/v1/admin/users/{id}/enrollments/{courseId}/ */
export interface ChangeModePayload {
  /** Sent so the server can reject a change made against stale state. */
  oldMode: string;
  newMode: string;
  reason: string;
}

/** DELETE /api/v1/admin/users/{id}/enrollments/{courseId}/ */
export interface UnenrollPayload {
  reason: string;
}

/** Profile visibility values */
export type ProfileVisibility = 'private' | 'public';

/** The assignable grants, as sent on create/patch. */
/**
 * The grants this panel assigns.
 *
 * Only these two. Course Creator and Support Staff are still *reported* by the
 * read types, but the API rejects them on write with a 400 — Course Creator in
 * particular follows from an Organization Admin grant, so a toggle here would
 * fight the Organizations screen over the same rows.
 */
export interface UserGrantPayload {
  isGlobalStaff?: boolean;
  isSuperuser?: boolean;
}

/** POST /api/v1/admin/users/ body */
export interface UserCreatePayload extends UserGrantPayload {
  email: string;
  name: string;
  profileVisibility?: ProfileVisibility;
  country?: string;
  biography?: string;
  isActive?: boolean;
}

/** PATCH /api/v1/admin/users/{id}/ body */
export interface UserPatchPayload extends UserGrantPayload {
  name?: string;
  profileVisibility?: ProfileVisibility;
  country?: string;
  biography?: string;
  isActive?: boolean;
}

/** Search-by values supported by the backend */
export type SearchBy = 'email' | 'name' | 'user_id';

/** Single-select filter values supported by the backend */
export type UserFilter =
  | 'all'
  | 'global_staff'
  | 'superuser'
  | 'course_creator'
  // Still accepted by the API — a bookmarked ?filter=support_staff keeps
  // working — but no longer offered in the dropdown.
  | 'support_staff'
  | 'org_admin'
  | 'learner'
  | 'active'
  | 'inactive'
  | 'confirmed'
  | 'unconfirmed'
  | 'public_profile'
  | 'private_profile'
  | 'password_only'
  | 'facebook'
  | 'google'
  | 'twitter'
  | 'legacy';

/** Sortable columns — real DB columns only; role/auth method are derived and not sortable. */
export type UserOrdering =
  | 'created' | '-created'
  | 'name' | '-name'
  | 'email' | '-email'
  | 'last_login' | '-last_login'
  | 'id' | '-id';

/** Query params for GET /api/v1/admin/users/ */
export interface UserListParams {
  searchBy?: SearchBy;
  searchTerm?: string;
  filter?: UserFilter;
  ordering?: UserOrdering;
  page?: number;
  pageSize?: number;
}

/** One month of a zero-filled series. */
export interface UserStatsSeriesPoint {
  period: string;
  value: number;
}

/**
 * GET /api/v1/admin/users/stats/ — global, the table's filters do not apply.
 *
 * A null figure could not be read on the server. It is shown as "Not available", never as zero.
 */
export interface UserListStats {
  tiles: {
    /** Learners by the Dashboard's rule: activity and an active enrollment. Staff and service accounts are left out. */
    learners: number | null;
    newThisMonth: number;
    newPreviousMonth: number;
    /** null when there is no previous month to compare. */
    newDeltaPct: number | null;
    activeLast30Days: number | null;
    legacy: { legacyAccounts: number; signedInAtLeastOnce: number; progressPct: number | null };
    subscribed: number;
  };
  series: { registrationsByMonth: UserStatsSeriesPoint[] };
  /** null when social-auth data cannot be read. */
  signInMethods: { password: number; google: number; other: number } | null;
  generatedAt: string;
}
