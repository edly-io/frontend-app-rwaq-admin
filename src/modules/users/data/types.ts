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
  job: string;
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
}

/** One row of the course picker behind the enroll form. */
export interface EnrollableCourse {
  courseId: string;
  displayName: string;
  org: string;
  availableModes: string[];
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
export interface UserGrantPayload {
  isGlobalStaff?: boolean;
  isCourseCreator?: boolean;
  isSupportStaff?: boolean;
}

/** POST /api/v1/admin/users/ body */
export interface UserCreatePayload extends UserGrantPayload {
  email: string;
  name: string;
  profileVisibility?: ProfileVisibility;
  job?: string;
  country?: string;
  biography?: string;
  isActive?: boolean;
}

/** PATCH /api/v1/admin/users/{id}/ body */
export interface UserPatchPayload extends UserGrantPayload {
  name?: string;
  profileVisibility?: ProfileVisibility;
  job?: string;
  country?: string;
  biography?: string;
  isActive?: boolean;
}

/** Search-by values supported by the backend */
export type SearchBy = 'email' | 'name' | 'user_id' | 'job';

/** Single-select filter values supported by the backend */
export type UserFilter =
  | 'all'
  | 'global_staff'
  | 'course_creator'
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
