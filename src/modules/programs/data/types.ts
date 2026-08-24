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
  organization: string;
  organizationLogo: string | null;
  organizationArabicName: string | null;
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
  programNumber: number | null;
  batch: number | null;
  slug: string | null;
  description: string;
  longDescription: string;
  introVideoId: string | null;
  introVideoUrl: string | null;
  programType: string | null;
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

/** Single-select filter values supported by the admin programs endpoint. */
export type ProgramFilter =
  | 'all'
  | 'draft'
  | 'active'
  | 'archived'
  | 'hidden'
  | 'visible'
  | 'featured'
  | 'certificate_enabled';

/** Query params for GET /api/v1/admin/programs/ */
export interface ProgramListParams {
  search?: string;
  filter?: ProgramFilter;
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
