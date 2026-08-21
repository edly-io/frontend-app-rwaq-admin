/**
 * Users TanStack Query hooks.
 * Components import from this file only — never from api.ts directly.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appId } from '@src/constants';
import type {
  UserCreatePayload,
  UserDetail,
  UserListParams,
  UserPatchPayload,
} from './types';
import {
  createUser,
  getUser,
  getUserEnrollments,
  getUsers,
  updateUser,
} from './api';

// ── Query key factory ─────────────────────────────────────────────────────────

const userQueryKeys = {
  all: [appId, 'users'] as const,
  lists: () => [...userQueryKeys.all, 'list'] as const,
  list: (params: UserListParams) => [...userQueryKeys.lists(), params] as const,
  details: () => [...userQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...userQueryKeys.details(), id] as const,
  enrollments: (id: number) => [...userQueryKeys.detail(id), 'enrollments'] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

/** Paginated user list with search/filter/sort/page support. */
export const useUsers = (params: UserListParams = {}) => useQuery({
  queryKey: userQueryKeys.list(params),
  queryFn: () => getUsers(params),
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

// ── Mutations ─────────────────────────────────────────────────────────────────

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
