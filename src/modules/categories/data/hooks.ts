/**
 * Categories TanStack Query hooks.
 * Components import from this file only — never from api.ts directly.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appId } from '@src/constants';
import {
  createCategory,
  getCategories,
  getCategory,
  getCategoryCourses,
  linkCourseToCategory,
  unlinkCourseFromCategory,
  updateCategory,
} from './api';
import type {
  CategoryCreatePayload,
  CategoryListParams,
  CategoryPatch,
} from './types';

// ── Query key factory ─────────────────────────────────────────────────────────

const categoryQueryKeys = {
  all: [appId, 'categories'] as const,
  lists: () => [...categoryQueryKeys.all, 'list'] as const,
  list: (params: CategoryListParams) => [...categoryQueryKeys.lists(), params] as const,
  details: () => [...categoryQueryKeys.all, 'detail'] as const,
  detail: (id: number) => [...categoryQueryKeys.details(), id] as const,
  courses: (id: number) => [...categoryQueryKeys.detail(id), 'courses'] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

/** Paginated category list. */
export const useCategories = (params: CategoryListParams = {}) => useQuery({
  queryKey: categoryQueryKeys.list(params),
  queryFn: () => getCategories(params),
});

/** Single category with its linked courses. */
export const useCategory = (id: number) => useQuery({
  queryKey: categoryQueryKeys.detail(id),
  queryFn: () => getCategory(id),
  enabled: id > 0,
});

/** Courses linked to a category — fetched separately so the detail and the
 *  courses list can be invalidated independently. */
export const useCategoryCourses = (categoryId: number) => useQuery({
  queryKey: categoryQueryKeys.courses(categoryId),
  queryFn: () => getCategoryCourses(categoryId),
  enabled: categoryId > 0,
});

// ── Mutations ─────────────────────────────────────────────────────────────────

/** POST a new category, then refresh the list. */
export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CategoryCreatePayload) => createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.lists() });
    },
  });
};

/** PATCH a category's fields. */
export const useUpdateCategory = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (patch: CategoryPatch) => updateCategory(id, patch),
    onSuccess: (updated) => {
      queryClient.setQueryData(categoryQueryKeys.detail(id), updated);
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.lists() });
    },
  });
};

/** POST — link a course to this category. */
export const useLinkCourse = (categoryId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => linkCourseToCategory(categoryId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.courses(categoryId) });
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.detail(categoryId) });
    },
  });
};

/** DELETE — unlink a course from this category. */
export const useUnlinkCourse = (categoryId: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (courseId: string) => unlinkCourseFromCategory(categoryId, courseId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.courses(categoryId) });
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.detail(categoryId) });
    },
  });
};
