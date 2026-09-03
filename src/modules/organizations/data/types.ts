// ── Organization API types ───────────────────────────────────────────────────
//
// camelCase above the API boundary; api.ts normalizes the snake_case wire
// format both ways.

/** Pagination envelope nested in the org list response */
export interface OrgListPagination {
  next: string | null;
  previous: string | null;
  count: number;
  numPages: number;
}

/** Paginated list response from GET /rwaq/api/organizations/ */
export interface OrgListResponse {
  results: OrgSummary[];
  pagination: OrgListPagination;
}

/** Org row returned by the list endpoint */
export interface OrgSummary {
  id: number;
  name: string;
  shortName: string;
  arabicName: string;
  logo: string | null;
  active: boolean;
  courseCount: number;
  adminCount: number;
  programCount: number;
}

/** One Organization Admin in an org's roster */
export interface OrgMember {
  id: number;
  email: string;
  username: string;
  /** Display name from UserProfile; may be blank, so fall back to username. */
  name: string;
  image: string | null;
  dateAdded: string | null;
  addedBy: string | null;
  /** Short names of the *other* orgs this person also administers. */
  otherOrganizations: string[];
}

/** Full org detail — from GET /rwaq/api/organizations/<short_name>/ */
export interface OrgDetail extends OrgSummary {
  featuredVideo: string;
  logo: string | null;
  organizationLogo: string | null;
  members: OrgMember[];
}

/** POST /rwaq/api/organizations/ body */
export interface OrgCreatePayload {
  name: string;
  /** Becomes the org prefix of every course key here; immutable afterwards. */
  shortName: string;
  arabicName?: string;
  featuredVideo?: string;
}

/** Fields PATCH /rwaq/api/organizations/<short_name>/ accepts */
export interface OrgProfilePatch {
  arabicName?: string;
  featuredVideo?: string;
}

/** Sortable columns supported by the backend's OrderingFilter. */
export type OrgOrdering =
  | 'name' | '-name'
  | 'course_count' | '-course_count'
  | 'admin_count' | '-admin_count'
  | 'program_count' | '-program_count'
  | 'created' | '-created';

/** Single-select filter values, mapped to backend query params in api.ts. */
export type OrgFilter = 'all' | 'active' | 'inactive' | 'has_admins' | 'no_admins';

/** Query params for the org list endpoint */
export interface OrgListParams {
  search?: string;
  filter?: OrgFilter;
  ordering?: OrgOrdering;
  page?: number;
  pageSize?: number;
}
