// ── Courses API types ─────────────────────────────────────────────────────────
//
// camelCase throughout: api.ts normalises the snake_case wire format at the
// boundary, so nothing above it ever sees snake_case *keys*.

// ── Shared ────────────────────────────────────────────────────────────────────

export interface PaginationMeta {
  next: string | null;
  previous: string | null;
  count: number;
  numPages: number;
}

// ── Course list / detail ──────────────────────────────────────────────────────

export interface CourseCategory {
  id: number;
  name: string;
  nameAr: string;
}

/** One row of GET /api/v1/admin/courses/ */
export interface CourseSummary {
  courseId: string;
  displayName: string;
  org: string;
  /** Relative URL — needs LMS_BASE_URL prefix to resolve. */
  courseImageUrl: string | null;
  start: string | null;
  end: string | null;
  categories: CourseCategory[];
  enrollmentCount: number;
  unenrollmentCount: number;
  /** Learners with any PersistentCourseGrade row. null when served from CMS. */
  gradedCount: number | null;
  /** Learners with a non-null passed_timestamp. null when served from CMS. */
  passingCount: number | null;
  /** passing_count / enrollment_count * 100. null when 0 enrollments or CMS. */
  passingPct: number | null;
}

/** GET /api/v1/admin/courses/ paginated response */
export interface CourseListResponse {
  results: CourseSummary[];
  pagination: PaginationMeta;
}

/** Full detail from GET /api/v1/admin/courses/{courseId}/ */
export interface CourseDetail extends CourseSummary {
  /** Chapter count from modulestore. null from LMS (modulestore is CMS-only). */
  sectionsCount: number | null;
  selfPaced: boolean;
  language: string | null;
  certificateEnabled: boolean;
  enrollmentStart: string | null;
  enrollmentEnd: string | null;
  invitationOnly: boolean;
}

// ── Course list params ────────────────────────────────────────────────────────

export type CourseOrdering =
  | 'display_name' | '-display_name'
  | 'start' | '-start'
  | 'end' | '-end'
  | 'org' | '-org'
  | 'enrollment_count' | '-enrollment_count';

export interface CourseListParams {
  search?: string;
  org?: string;
  category?: string;
  ordering?: CourseOrdering;
  page?: number;
  pageSize?: number;
}

// ── Course enrollments ────────────────────────────────────────────────────────

/** One row of GET /api/v1/admin/courses/{courseId}/enrollments/ */
export interface CourseEnrollmentRow {
  userId: number;
  username: string;
  name: string;
  email: string;
  mode: string;
  isActive: boolean;
  enrolledAt: string | null;
  /** null when certificates app isn't available on the API host. */
  certificateStatus: string | null;
}

export interface CourseEnrollmentResponse {
  results: CourseEnrollmentRow[];
  pagination: PaginationMeta;
}

export type CourseEnrollmentSearchBy = 'name' | 'email' | 'user_id';

export interface CourseEnrollmentParams {
  searchBy?: CourseEnrollmentSearchBy;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
}

/** POST /api/v1/admin/courses/{courseId}/enrollments/ */
export interface CourseEnrollPayload {
  userId: number;
  mode: string;
  reason: string;
}

// ── Course staff ──────────────────────────────────────────────────────────────

/** Available course-level roles, matching the backend's ROLES dict. */
export type CourseRole =
  | 'instructor'
  | 'staff'
  | 'limited_staff'
  | 'beta'
  | 'data_researcher';

/** One row of GET /api/v1/admin/courses/{courseId}/staff/ */
export interface CourseStaffMember {
  userId: number;
  username: string;
  name: string;
  email: string;
  role: CourseRole;
}

/** POST /api/v1/admin/courses/{courseId}/staff/ */
export interface CourseStaffAddPayload {
  userId: number;
  role: CourseRole;
}

/** DELETE /api/v1/admin/courses/{courseId}/staff/{userId}/?role= */
export interface CourseStaffRemoveParams {
  userId: number;
  role: CourseRole;
}
