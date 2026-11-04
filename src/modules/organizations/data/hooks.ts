/**
 * Organizations TanStack Query hooks.
 * Components import from this file only — never from api.ts directly.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useIntl } from '@edx/frontend-platform/i18n';
import { localizedName } from '@src/data/localizedName';
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

/**
 * The organizations as `{ value: short_name, label: name }` options, for an organization filter.
 *
 * One request for the first 100 organizations (the list endpoint's page limit), sorted by name. The label is
 * the Arabic name in an Arabic panel when there is one, else the English name. An
 * organization named in the URL that is not among them is still offered, so the select always shows
 * what the list is filtered by.
 */
export const useOrgFilterOptions = (current = '') => {
  const { locale } = useIntl();
  const { data } = useOrganizations({ ordering: 'name', pageSize: 100 });
  const options = (data?.results ?? []).map((org) => ({
    value: org.shortName,
    label: localizedName(locale, org.name, org.arabicName),
  }));
  if (current && !options.some((option) => option.value === current)) {
    options.push({ value: current, label: current });
  }
  return options;
};

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
    onSuccess: (created: OrgDetail) => {
      // Cache the created org's detail so the edit modal can read it immediately
      queryClient.setQueryData(orgQueryKeys.detail(created.shortName), created);
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
