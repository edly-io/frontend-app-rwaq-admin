/**
 * Users TanStack Query hooks.
 * Components import from this file only — never from api.ts directly.
 */
import {
  keepPreviousData, useQuery, useMutation, useQueryClient,
} from '@tanstack/react-query';
import { appId } from '@src/constants';
import type {
  ChangeModePayload,
  EnrollPayload,
  UnenrollPayload,
  UserCreatePayload,
  UserDetail,
  UserListParams,
  UserPatchPayload,
} from './types';
import {
  changeEnrollmentMode,
  createUser,
  enrollUser,
  getEnrollableCourses,
  getUser,
  getUserEnrollments,
  getUsers,
  unenrollUser,
  updateUser,
} from './api';

// ── Query key factory ─────────────────────────────────────────────────────────

export const userQueryKeys = {
  all: [appId, 'users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (params: UserListParams) => [...userQueryKeys.lists(), params] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...userQueryKeys.details(), id] as const,
  enrollments: (id: number) => [...userQueryKeys.detail(id), 'enrollments'] as const,
};

/**
 * Courses are keyed outside `userQueryKeys` on purpose: the list is the same
 * whichever learner the form is open for, so two admins enrolling two users
 * share one cache entry instead of fetching the same page twice.
 */
const courseQueryKeys = {
  all: [appId, 'courses'] as const,
  enrollable: (search: string) => [...courseQueryKeys.all, 'enrollable', search] as const,
};

/** How long a course-picker result stays fresh. */
const COURSE_SEARCH_STALE_MS = 60_000;

// ── Queries ───────────────────────────────────────────────────────────────────

/** Paginated user list with search/filter/sort/page support.
 *  Pass enabled=false to skip the fetch (e.g. before a search term is entered).
 */
export const useUsers = (params: UserListParams = {}, enabled = true) => useQuery({
  queryKey: userQueryKeys.list(params),
  queryFn: () => getUsers(params),
  enabled,
});

/** Single user detail for the View/Edit modals. */
export const useUser = (id: number) => useQuery({
  queryKey: userQueryKeys.detail(id),
  queryFn: () => getUser(id),
  enabled: id > 0,
});

/** Read-only enrollments for the detail drawer's Enrollments tab. */
export const useUserEnrollments = (id: number, enabled = true) => useQuery({
  queryKey: userQueryKeys.enrollments(id),
  queryFn: () => getUserEnrollments(id),
  enabled: enabled && id > 0,
});

/**
 * The enroll form's course picker.
 *
 * Keeping the previous page matters more here than in the other lists: without
 * it the dropdown empties on every keystroke, so the options flicker away
 * underneath a cursor that is still moving. Showing the previous matches while
 * the next ones load keeps the list steady. (In react-query v5 this is
 * `placeholderData: keepPreviousData` — the old boolean option was removed and
 * now silently does nothing.)
 */
export const useEnrollableCourses = (search: string, enabled = true) => useQuery({
  queryKey: courseQueryKeys.enrollable(search),
  queryFn: () => getEnrollableCourses(search),
  enabled,
  staleTime: COURSE_SEARCH_STALE_MS,
  placeholderData: keepPreviousData,
});

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * Invalidate everything an enrollment change can move.
 *
 * The enrollment list obviously, but the user's detail too: it carries the
 * enrollment count. Shared by all three enrollment mutations so none of them
 * can be the one that forgets.
 */
const invalidateAfterEnrollmentChange = (
  queryClient: ReturnType<typeof useQueryClient>,
  id: number,
) => {
  queryClient.invalidateQueries({ queryKey: userQueryKeys.enrollments(id) });
  queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(id) });
};

/** POST new user — invalidates the list so it refetches after creation. */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserCreatePayload) => createUser(payload),

    onSuccess: (created: UserDetail) => {
      queryClient.setQueryData(userQueryKeys.detail(created.id), created);
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
    },
  });
};

/**
 * PATCH user.
 *
 * No optimistic update: a patch can carry role grants whose *effects* (badges,
 * derived org scope) only the server can compute, so guessing the resulting row
 * would show a state that never existed.  The response is the full detail, so
 * it is written straight into the cache instead.
 */
export const useUpdateUser = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: UserPatchPayload) => updateUser(id, patch),

    onSuccess: (updated: UserDetail) => {
      queryClient.setQueryData(userQueryKeys.detail(id), updated);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
    },
  });
};

// ── Enrollment mutations ──────────────────────────────────────────────────────

/*
 * None of the three updates the cache optimistically. Each of these writes
 * fires platform signals whose visible results — a certificate row, a
 * recalculated grade, a reset schedule — are computed asynchronously by
 * Celery. An optimistic row would have to guess at those, and guess wrong
 * whenever the task is still queued. Refetching shows what is actually true.
 */

/** Enroll the user, or reactivate an enrollment they previously left. */
export const useEnrollUser = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: EnrollPayload) => enrollUser(id, payload),
    onSuccess: () => invalidateAfterEnrollmentChange(queryClient, id),
  });
};

/**
 * Change an enrollment's mode.
 *
 * `oldMode` comes from the row the admin is looking at, so the server can
 * reject the write if someone else changed the mode in the meantime. Errors
 * are deliberately not swallowed here — that 409 is the whole point, and the
 * caller needs it to tell the admin to reload.
 */
export const useChangeEnrollmentMode = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      { courseId, ...payload }: ChangeModePayload & { courseId: string },
    ) => changeEnrollmentMode(id, courseId, payload),
    onSuccess: () => invalidateAfterEnrollmentChange(queryClient, id),
  });
};

/** Unenroll — soft, so the row stays visible as inactive. */
export const useUnenrollUser = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      { courseId, ...payload }: UnenrollPayload & { courseId: string },
    ) => unenrollUser(id, courseId, payload),
    onSuccess: () => invalidateAfterEnrollmentChange(queryClient, id),
  });
};
