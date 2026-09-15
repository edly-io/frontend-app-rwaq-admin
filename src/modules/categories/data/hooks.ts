/**
 * Categories TanStack Query hooks.
 * Components import from this file only — never from api.ts directly.
 */
import {
  useInfiniteQuery, useMutation, useQuery, useQueryClient,
} from '@tanstack/react-query';
import { appId } from '@src/constants';
import {
  createCategory,
  getAvailableCoursesForCategory,
  getCategories,
  getCategory,
  getCategoryCourses,
  linkCourseToCategory,
  unlinkCourseFromCategory,
  updateCategory,
} from './api';
import type {
  CategoryAvailableCourseParams,
  CategoryCourseListParams,
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
  // coursesAll is the prefix used for invalidation — invalidates every page at once.
  coursesAll: (id: number) => [...categoryQueryKeys.detail(id), 'courses'] as const,
  courses: (id: number, params: CategoryCourseListParams) => [...categoryQueryKeys.coursesAll(id), params] as const,
  availableCourses: (id: number, params: CategoryAvailableCourseParams) => (
    [...categoryQueryKeys.detail(id), 'available-courses', params] as const
  ),
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

/** Courses linked to a category — paginated, fetched separately so the detail
 *  and the courses list can be invalidated independently. */
export const useCategoryCourses = (categoryId: number, params: CategoryCourseListParams = {}) => useQuery({
  queryKey: categoryQueryKeys.courses(categoryId, params),
  queryFn: () => getCategoryCourses(categoryId, params),
  enabled: categoryId > 0,
});

/**
 * Courses not yet linked to this category — the Link Course modal's picker.
 * `enabled` lets the modal skip fetching once a course has been chosen.
 *
 * Infinite, not a single page: the catalog easily exceeds one page (20
 * courses) per org, so the picker loads more as the admin scrolls rather
 * than silently capping the list at whatever page 1 happens to contain.
 */
export const useAvailableCoursesForCategory = (
  categoryId: number,
  params: Omit<CategoryAvailableCourseParams, 'page'> = {},
  enabled = true,
) => useInfiniteQuery({
  queryKey: categoryQueryKeys.availableCourses(categoryId, params),
  queryFn: ({ pageParam }) => getAvailableCoursesForCategory(categoryId, { ...params, page: pageParam }),
  initialPageParam: 1,
  // DRF's pagination.next is non-null iff another page exists — pages are
  // fetched strictly in order here, so "how many pages so far" is the next
  // page number.
  getNextPageParam: (lastPage, allPages) => (lastPage.pagination?.next ? allPages.length + 1 : undefined),
  enabled: enabled && categoryId > 0,
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
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.coursesAll(categoryId) });
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
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.coursesAll(categoryId) });
      queryClient.invalidateQueries({ queryKey: categoryQueryKeys.detail(categoryId) });
    },
  });
};
