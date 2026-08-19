// ── Organization API types ─────────────────────────────────────────────────

/** Pagination envelope nested in the org list response */
export interface OrgListPagination {
  next: string | null;
  previous: string | null;
  count: number;
  num_pages: number;
}

/** Paginated list response from GET /rwaq/api/organizations/
 *  Shape: { results: [...], pagination: { count, num_pages, next, previous } } */
export interface OrgListResponse {
  results: OrgSummary[];
  pagination: OrgListPagination;
}

/** Org row returned by the list endpoint */
export interface OrgSummary {
  id: number;
  name: string;
  short_name: string;
  logo: string | null;
  active: boolean;
  course_count: number;
  admin_count: number;
}

/** Org admin member — from GET /rwaq/api/organizations/<short_name>/ members[] */
export interface OrgMember {
  email: string;
  username: string;
  full_name: string;
  date_added: string;
  added_by: string;
  other_organizations: string[];
}

/** Full org detail — from GET /rwaq/api/organizations/<short_name>/ */
export interface OrgDetail extends OrgSummary {
  arabic_name: string;
  detail: string;
  featured_video: string;
  is_featured: boolean;
  members: OrgMember[];
}

/** Fields the PATCH /rwaq/api/organizations/<short_name>/ accepts */
export interface OrgProfilePatch {
  arabic_name?: string;
  detail?: string;
  featured_video?: string;
  is_featured?: boolean;
  logo?: string;
}

/** Query params for the org list endpoint */
export interface OrgListParams {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
}
