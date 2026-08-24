/**
 * Programs TanStack Query hooks.
 * Components import from this file only — never from api.ts directly.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appId } from '@src/constants';
import {
  getProgram,
  getProgramCourses,
  getProgramLearners,
  getPrograms,
  updateProgram,
} from './api';
import type { ProgramDetail, ProgramListParams, ProgramPatch } from './types';

// ── Query key factory ────────────────────────────────────────────────────────

const programQueryKeys = {
  all: [appId, 'programs'] as const,
  lists: () => [...programQueryKeys.all, 'list'] as const,
  list: (params: ProgramListParams) => [...programQueryKeys.lists(), params] as const,
  details: () => [...programQueryKeys.all, 'detail'] as const,
  detail: (uuid: string) => [...programQueryKeys.details(), uuid] as const,
  courses: (uuid: string) => [...programQueryKeys.detail(uuid), 'courses'] as const,
  learners: (uuid: string) => [...programQueryKeys.detail(uuid), 'learners'] as const,
};

// ── Queries ──────────────────────────────────────────────────────────────────

/** Paginated program list with search/filter/sort support. */
export const usePrograms = (params: ProgramListParams = {}) => useQuery({
  queryKey: programQueryKeys.list(params),
  queryFn: () => getPrograms(params),
});

/** One program's full detail. */
export const useProgram = (uuid: string) => useQuery({
  queryKey: programQueryKeys.detail(uuid),
  queryFn: () => getProgram(uuid),
  enabled: !!uuid,
});

/** Courses linked to a program — lazy, only enabled when uuid is present. */
export const useProgramCourses = (uuid: string) => useQuery({
  queryKey: programQueryKeys.courses(uuid),
  queryFn: () => getProgramCourses(uuid),
  enabled: !!uuid,
});

/** Learners enrolled in a program — lazy, only enabled when uuid is present. */
export const useProgramLearners = (uuid: string) => useQuery({
  queryKey: programQueryKeys.learners(uuid),
  queryFn: () => getProgramLearners(uuid),
  enabled: !!uuid,
});

// ── Mutations ────────────────────────────────────────────────────────────────

/** PATCH program settings. Response is the full detail, so cache it directly. */
export const useUpdateProgram = (uuid: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: ProgramPatch) => updateProgram(uuid, patch),
    onSuccess: (updated: ProgramDetail) => {
      queryClient.setQueryData(programQueryKeys.detail(uuid), updated);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: programQueryKeys.detail(uuid) });
      queryClient.invalidateQueries({ queryKey: programQueryKeys.lists() });
    },
  });
};
