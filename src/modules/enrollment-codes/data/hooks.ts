/**
 * Enrollment codes hooks.
 * Components import from this file only, never from api.ts directly.
 */
import { useContext } from 'react';
import {
  keepPreviousData, useMutation, useQuery, useQueryClient,
} from '@tanstack/react-query';
import { appId } from '@src/constants';
import { ActiveTabContext } from '@src/modules/payments/data/activeTab';
import {
  createEnrollmentCode,
  deleteEnrollmentCode,
  getEnrollmentCodeCard,
  getEnrollmentCodes,
  getEnrollmentCodeUses,
  updateEnrollmentCode,
} from './api';
import type {
  CodeCreatePayload, CodeListParams, CodePatch, UseListParams,
} from './types';

export const enrollmentCodeQueryKeys = {
  all: [appId, 'enrollmentCodes'] as const,
  list: (params: CodeListParams) => [...enrollmentCodeQueryKeys.all, 'list', params] as const,
  activeCount: (item: { courseId?: string; programUuid?: string }) => (
    [...enrollmentCodeQueryKeys.all, 'activeCount', item] as const
  ),
  card: (id: number) => [...enrollmentCodeQueryKeys.all, 'card', id] as const,
  uses: (params: UseListParams) => [...enrollmentCodeQueryKeys.all, 'uses', params] as const,
};

/**
 * Keeps the previous page on screen while the next one loads, and only queries while the tab it sits in
 * is the one shown (a tab stays mounted once opened, see ActiveTabContext).
 */
export const useEnrollmentCodes = (params: CodeListParams) => useQuery({
  queryKey: enrollmentCodeQueryKeys.list(params),
  queryFn: () => getEnrollmentCodes(params),
  placeholderData: keepPreviousData,
  enabled: useContext(ActiveTabContext),
});

export const useEnrollmentCodeUses = (params: UseListParams) => useQuery({
  queryKey: enrollmentCodeQueryKeys.uses(params),
  queryFn: () => getEnrollmentCodeUses(params),
  placeholderData: keepPreviousData,
  enabled: useContext(ActiveTabContext),
});

/** The card's data. Not cached across opens, so a changed platform setting shows the next time. */
export const useEnrollmentCodeCard = (id: number | null) => useQuery({
  queryKey: enrollmentCodeQueryKeys.card(id ?? 0),
  queryFn: () => getEnrollmentCodeCard(id as number),
  enabled: id !== null,
  staleTime: 0,
});

/**
 * How many active codes one course or program has: the count of the list filtered by status active.
 * Used to warn before the item's type is switched away from Enrollment code.
 */
export const useActiveCodeCount = (
  item: { courseId?: string; programUuid?: string },
  enabled = true,
) => useQuery({
  queryKey: enrollmentCodeQueryKeys.activeCount(item),
  queryFn: () => getEnrollmentCodes({
    ...item, status: 'active', page: 1, pageSize: 1,
  }),
  select: (data) => data.pagination?.count ?? data.results.length,
  enabled,
  staleTime: 0,
});

/** Every change refreshes the lists, the uses and the active counts. */
const useInvalidateCodes = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: enrollmentCodeQueryKeys.all });
};

export const useCreateEnrollmentCode = () => {
  const invalidate = useInvalidateCodes();
  return useMutation({
    mutationFn: (payload: CodeCreatePayload) => createEnrollmentCode(payload),
    onSuccess: invalidate,
  });
};

export const useUpdateEnrollmentCode = () => {
  const invalidate = useInvalidateCodes();
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: CodePatch }) => updateEnrollmentCode(id, patch),
    onSuccess: invalidate,
  });
};

export const useDeleteEnrollmentCode = () => {
  const invalidate = useInvalidateCodes();
  return useMutation({
    mutationFn: (id: number) => deleteEnrollmentCode(id),
    onSuccess: invalidate,
  });
};
