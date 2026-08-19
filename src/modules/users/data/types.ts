// ── User API types ──────────────────────────────────────────────────────────

/** Pagination envelope from the user list response */
export interface UserListPagination {
  next: string | null;
  previous: string | null;
  count: number;
  num_pages: number;
}

/** Paginated list response from GET /api/v1/admin/users/ */
export interface UserListResponse {
  results: UserSummary[];
  pagination: UserListPagination;
}

/** User row from the list endpoint */
export interface UserSummary {
  id: number;
  image: string | null;
  name: string;
  email: string;
  role: UserRole;
  created_at: string;
  authentication_method: string;
  is_blocked: boolean;
  is_confirmed: boolean;
  is_profile_public: boolean;
}

/** Full user detail from GET /api/v1/admin/users/{id}/ */
export interface UserDetail extends UserSummary {
  username: string;
  country: string;
  biography: string;
  job: string;
  authentication_methods: string[];
  roles: string[];
  is_active: boolean;
  last_login: string | null;
}

/** Role values accepted by create/patch */
export type UserRole = 'instructor' | 'moderator' | 'student';

/** Profile visibility values */
export type ProfileVisibility = 'private' | 'public';

/** POST /api/v1/admin/users/ body */
export interface UserCreatePayload {
  email: string;
  name: string;
  role: UserRole;
  profile_visibility?: ProfileVisibility;
  job?: string;
  country?: string;
  biography?: string;
  is_blocked?: boolean;
}

/** PATCH /api/v1/admin/users/{id}/ body */
export interface UserPatchPayload {
  name?: string;
  role?: UserRole;
  profile_visibility?: ProfileVisibility;
  job?: string;
  country?: string;
  biography?: string;
  is_blocked?: boolean;
}

/** Search-by values supported by the backend */
export type SearchBy = 'email' | 'name' | 'user_id';

/** Filter values supported by the backend */
export type UserFilter =
  | 'all'
  | 'instructor'
  | 'moderators'
  | 'students'
  | 'blocked'
  | 'confirmed'
  | 'unconfirmed'
  | 'private_profile'
  | 'public_profile'
  | 'facebook'
  | 'twitter';

/** Query params for GET /api/v1/admin/users/ */
export interface UserListParams {
  search_by?: SearchBy;
  search_term?: string;
  filter?: UserFilter;
  page?: number;
  page_size?: number;
}
