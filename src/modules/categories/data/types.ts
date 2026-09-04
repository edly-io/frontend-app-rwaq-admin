// ── Categories API types ──────────────────────────────────────────────────────
//
// camelCase throughout: api.ts normalises the snake_case wire format at the
// boundary, so nothing above it ever sees snake_case keys.

/** Lightweight category row — returned by the list endpoint and the reverse lookup. */
export interface CategorySummary {
  id: number;
  name: string;
  arabicName: string;
  isActive: boolean;
}

/** A course linked to a category — hydrated with CourseOverview data by the backend. */
export interface CategoryCourse {
  courseKey: string;
  displayName: string;
  org: string;
  run: string;
  courseImageUrl: string | null;
}

/** Full category detail — from GET /rwaq/api/categories/<id>/ */
export interface CategoryDetail extends CategorySummary {
  courses: CategoryCourse[];
}

/** Pagination envelope from GET /rwaq/api/categories/ */
export interface CategoryPagination {
  next: string | null;
  previous: string | null;
  count: number;
  numPages: number;
}

/** Paginated list response from GET /rwaq/api/categories/ */
export interface CategoryListResponse {
  results: CategorySummary[];
  pagination: CategoryPagination;
}

/** POST /rwaq/api/categories/ body */
export interface CategoryCreatePayload {
  name: string;
  arabicName?: string;
  isActive?: boolean;
}

/** PATCH /rwaq/api/categories/<id>/ body */
export interface CategoryPatch {
  name?: string;
  arabicName?: string;
  isActive?: boolean;
}

/** Query params for the category list endpoint */
export interface CategoryListParams {
  search?: string;
  page?: number;
  pageSize?: number;
}
