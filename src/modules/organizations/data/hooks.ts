/**
 * Organizations TanStack Query hooks.
 * Components import from this file only — never from api.ts directly.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appId } from '@src/constants';
import type {
  OrgDetail, OrgListParams, OrgMember, OrgProfilePatch,
} from './types';
import {
  addOrgAdmin,
  getOrganization,
  getOrganizations,
  removeOrgAdmin,
  updateOrganization,
} from './api';

// ── Query key factory ─────────────────────────────────────────────────────────

const orgQueryKeys = {
  all: [appId, 'organizations'] as const,
  lists: () => [...orgQueryKeys.all, 'list'] as const,
  list: (params: OrgListParams) => [...orgQueryKeys.lists(), params] as const,
  details: () => [...orgQueryKeys.all, 'detail'] as const,
  detail: (shortName: string) => [...orgQueryKeys.details(), shortName] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

/** Paginated org list with search/ordering/page support. */
export const useOrganizations = (params: OrgListParams = {}) => useQuery({
  queryKey: orgQueryKeys.list(params),
  queryFn: () => getOrganizations(params),
});

/** Single org detail — profile + members. */
export const useOrganization = (shortName: string) => useQuery({
  queryKey: orgQueryKeys.detail(shortName),
  queryFn: () => getOrganization(shortName),
  enabled: !!shortName,
});

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * PATCH org profile — optimistic update with rollback on failure.
 * Usage: const mutation = useUpdateOrganization(shortName);
 *        mutation.mutate({ arabic_name: 'جامعة' });
 */
export const useUpdateOrganization = (shortName: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: OrgProfilePatch) => updateOrganization(shortName, patch),

    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: orgQueryKeys.detail(shortName) });
      const previous = queryClient.getQueryData<OrgDetail>(orgQueryKeys.detail(shortName));
      if (previous) {
        queryClient.setQueryData<OrgDetail>(orgQueryKeys.detail(shortName), {
          ...previous,
          ...patch,
        });
      }
      return { previous };
    },

    onError: (_err, _patch, context) => {
      if (context?.previous) {
        queryClient.setQueryData(orgQueryKeys.detail(shortName), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: orgQueryKeys.detail(shortName) });
    },
  });
};

/**
 * Add an org admin by email (POST).
 * Optimistic: inserts the member into the cached detail before the server responds.
 */
export const useAddOrgAdmin = (shortName: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => addOrgAdmin(shortName, email),

    onMutate: async (email) => {
      await queryClient.cancelQueries({ queryKey: orgQueryKeys.detail(shortName) });
      const previous = queryClient.getQueryData<OrgDetail>(orgQueryKeys.detail(shortName));
      if (previous) {
        const optimisticMember: OrgMember = {
          email,
          username: '',
          full_name: '',
          date_added: new Date().toISOString(),
          added_by: '',
          other_organizations: [],
        };
        queryClient.setQueryData<OrgDetail>(orgQueryKeys.detail(shortName), {
          ...previous,
          members: [...previous.members, optimisticMember],
          admin_count: previous.admin_count + 1,
        });
      }
      return { previous };
    },

    onError: (_err, _email, context) => {
      if (context?.previous) {
        queryClient.setQueryData(orgQueryKeys.detail(shortName), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: orgQueryKeys.detail(shortName) });
    },
  });
};

/**
 * Remove an org admin by email (DELETE).
 * Optimistic: removes the member from the cached detail immediately.
 */
export const useRemoveOrgAdmin = (shortName: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => removeOrgAdmin(shortName, email),

    onMutate: async (email) => {
      await queryClient.cancelQueries({ queryKey: orgQueryKeys.detail(shortName) });
      const previous = queryClient.getQueryData<OrgDetail>(orgQueryKeys.detail(shortName));
      if (previous) {
        queryClient.setQueryData<OrgDetail>(orgQueryKeys.detail(shortName), {
          ...previous,
          members: previous.members.filter((m) => m.email !== email),
          admin_count: Math.max(0, previous.admin_count - 1),
        });
      }
      return { previous };
    },

    onError: (_err, _email, context) => {
      if (context?.previous) {
        queryClient.setQueryData(orgQueryKeys.detail(shortName), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: orgQueryKeys.detail(shortName) });
    },
  });
};
