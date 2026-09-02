/**
 * Organizations TanStack Query hooks.
 * Components import from this file only — never from api.ts directly.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appId } from '@src/constants';
import {
  addOrgAdmin,
  createOrganization,
  getOrganization,
  getOrganizations,
  removeOrgAdmin,
  updateOrganization,
} from './api';
import type {
  OrgCreatePayload, OrgDetail, OrgListParams, OrgProfilePatch,
} from './types';

// ── Query key factory ────────────────────────────────────────────────────────

const orgQueryKeys = {
  all: [appId, 'organizations'] as const,
  lists: () => [...orgQueryKeys.all, 'list'] as const,
  list: (params: OrgListParams) => [...orgQueryKeys.lists(), params] as const,
  details: () => [...orgQueryKeys.all, 'detail'] as const,
  detail: (shortName: string) => [...orgQueryKeys.details(), shortName] as const,
};

// ── Queries ──────────────────────────────────────────────────────────────────

/** Paginated org list with search/filter/sort support. */
export const useOrganizations = (params: OrgListParams = {}) => useQuery({
  queryKey: orgQueryKeys.list(params),
  queryFn: () => getOrganizations(params),
});

/** One org's profile plus its Organization Admin roster. */
export const useOrganization = (shortName: string) => useQuery({
  queryKey: orgQueryKeys.detail(shortName),
  queryFn: () => getOrganization(shortName),
  enabled: !!shortName,
});

// ── Mutations ────────────────────────────────────────────────────────────────

/** POST a new org, then refresh the list. */
export const useCreateOrganization = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: OrgCreatePayload) => createOrganization(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgQueryKeys.lists() });
    },
  });
};

/** PATCH an org's profile. Response is the full detail, so cache it directly. */
export const useUpdateOrganization = (shortName: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ patch, logoFile }: { patch: OrgProfilePatch; logoFile?: File | null }) => updateOrganization(shortName, patch, logoFile),
    onSuccess: (updated: OrgDetail) => {
      queryClient.setQueryData(orgQueryKeys.detail(shortName), updated);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: orgQueryKeys.detail(shortName) });
      queryClient.invalidateQueries({ queryKey: orgQueryKeys.lists() });
    },
  });
};

/**
 * Grant Organization Admin by email.
 *
 * Invalidates the list too: adminCount is a column there, so leaving it stale
 * would show a roster and a count that disagree.
 */
export const useAddOrgAdmin = (shortName: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => addOrgAdmin(shortName, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgQueryKeys.detail(shortName) });
      queryClient.invalidateQueries({ queryKey: orgQueryKeys.lists() });
    },
  });
};

/** Revoke Organization Admin for this org only. */
export const useRemoveOrgAdmin = (shortName: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (email: string) => removeOrgAdmin(shortName, email),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orgQueryKeys.detail(shortName) });
      queryClient.invalidateQueries({ queryKey: orgQueryKeys.lists() });
    },
  });
};
