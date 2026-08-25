// ── Programs API types ────────────────────────────────────────────────────────
//
// camelCase throughout: api.ts normalizes the snake_case wire format at the
// boundary. Enum *values* (status, filter slugs) stay as the backend defines.

export type ProgramStatus = 'draft' | 'active' | 'archived';

/** Pagination envelope from the program list response. */
export interface ProgramListPagination {
  next: string | null;
  previous: string | null;
  count: number;
  numPages: number;
}

/** Generic paginated response envelope for sub-resources (courses, learners).
 *  NamespacedPageNumberPagination nests metadata under a `pagination` key. */
export interface ProgramSubPage<T> {
  results: T[];
  pagination: {
    count: number;
    numPages: number;
    next: string | null;
    previous: string | null;
  };
}

/** Paginated list response from GET /api/v1/admin/programs/ */
export interface ProgramListResponse {
  results: ProgramSummary[];
  pagination: ProgramListPagination;
}

/** Program row from the admin list endpoint. */
export interface ProgramSummary {
  uuid: string;
  programKey: string;
  name: string;
  cardImage: string | null;
  organization: string;             // short_name
  organizationName: string | null;  // full English name
  organizationLogo: string | null;
  organizationArabicName: string | null;
  programType: string | null;       // program_type slug
  batch: string | null;
  status: ProgramStatus;
  isHide: boolean;
  isFeatured: boolean;
  certificateEnabled: boolean;
  totalCourses: number;
  totalEnrollments: number;
  startDate: string | null;
  endDate: string | null;
  created: string;
}

/** Full program detail from GET /api/v1/admin/programs/{uuid}/ */
export interface ProgramDetail extends ProgramSummary {
  programNumber: string | null;
  slug: string | null;
  description: string;
  longDescription: string;
  introVideoId: string | null;
  introVideoUrl: string | null;
  modified: string;
}

/** One row of GET /api/v1/admin/programs/{uuid}/courses/ */
export interface ProgramCourse {
  courseId: string;
  courseName: string | null;
  courseOrg: string | null;
  courseImage: string | null;
  created: string;
}

/** One row of GET /api/v1/admin/programs/{uuid}/learners/ */
export interface ProgramLearner {
  id: number;
  email: string;
  name: string;
  enrollmentDate: string | null;
  completionDate: string | null;
  isActive: boolean;
}

/** Sortable ordering values for the program list. */
export type ProgramOrdering =
  | 'name' | '-name'
  | 'created' | '-created'
  | '-total_enrollments'
  | '-total_courses'
  | 'start_date' | '-start_date'
  | 'organization' | '-organization'
  | 'status' | '-status';

/**
 * Query params for GET /api/v1/admin/programs/
 * Separate params so they can be combined (e.g. status=active + is_hide=true).
 * Per discovery plan §3.1 and §6.
 */
export interface ProgramListParams {
  search?: string;
  /** draft | active | archived */
  status?: ProgramStatus;
  /** Filter by organization short_name */
  org?: string;
  /** true = hidden only, false = visible only */
  isHide?: boolean;
  /** true = featured only */
  isFeatured?: boolean;
  ordering?: ProgramOrdering;
  page?: number;
  pageSize?: number;
}

/** Fields that can be patched on a program from the admin panel. */
export interface ProgramPatch {
  status?: ProgramStatus;
  isHide?: boolean;
  isFeatured?: boolean;
  certificateEnabled?: boolean;
  name?: string;
  description?: string;
  longDescription?: string;
}
