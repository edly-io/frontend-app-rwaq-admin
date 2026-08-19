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
};

// ── Queries ───────────────────────────────────────────────────────────────────

/** Paginated user list with search/filter/page support. */
export const useUsers = (params: UserListParams = {}) => useQuery({
  queryKey: userQueryKeys.list(params),
  queryFn: () => getUsers(params),
});

/** Single user detail for the View/Edit modal. */
export const useUser = (id: number) => useQuery({
  queryKey: userQueryKeys.detail(id),
  queryFn: () => getUser(id),
  enabled: id > 0,
});

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * POST new user — invalidates the list so it refetches after creation.
 */
export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UserCreatePayload) => createUser(payload),

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
    },
  });
};

/**
 * PATCH user — optimistic update against the cached detail with rollback on failure.
 * Also invalidates the list so the table row updates after settling.
 */
export const useUpdateUser = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: UserPatchPayload) => updateUser(id, patch),

    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: userQueryKeys.detail(id) });
      const previous = queryClient.getQueryData<UserDetail>(userQueryKeys.detail(id));
      if (previous) {
        queryClient.setQueryData<UserDetail>(userQueryKeys.detail(id), {
          ...previous,
          ...patch,
        });
      }
      return { previous };
    },

    onError: (_err, _patch, context) => {
      if (context?.previous) {
        queryClient.setQueryData(userQueryKeys.detail(id), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userQueryKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: userQueryKeys.lists() });
    },
  });
};
