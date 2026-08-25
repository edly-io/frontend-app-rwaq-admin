/**
 * Courses TanStack Query hooks.
 * Components import from this file only — never from api.ts directly.
 */
import {
  keepPreviousData, useQuery, useMutation, useQueryClient,
} from '@tanstack/react-query';
import { appId } from '@src/constants';
import type {
  CourseEnrollmentParams,
  CourseEnrollPayload,
  CourseListParams,
  CourseStaffAddPayload,
  CourseStaffRemoveParams,
} from './types';
import {
  addCourseStaff,
  downloadCourseEnrollmentsCsv,
  enrollUserInCourse,
  getCourse,
  getCourseEnrollments,
  getCourses,
  getCourseStaff,
  removeCourseStaff,
} from './api';

// ── Query key factory ─────────────────────────────────────────────────────────

export const courseQueryKeys = {
  all: [appId, 'courses'] as const,
  lists: () => [...courseQueryKeys.all, 'list'] as const,
  list: (params: CourseListParams) => [...courseQueryKeys.lists(), params] as const,
  details: () => [...courseQueryKeys.all, 'detail'] as const,
  detail: (courseId: string) => [...courseQueryKeys.details(), courseId] as const,
  enrollments: (courseId: string, params: CourseEnrollmentParams) => (
    [...courseQueryKeys.detail(courseId), 'enrollments', params] as const
  ),
  staff: (courseId: string) => [...courseQueryKeys.detail(courseId), 'staff'] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

/** Paginated course list with search/filter/sort/page support. */
export const useCourses = (params: CourseListParams = {}) => useQuery({
  queryKey: courseQueryKeys.list(params),
  queryFn: () => getCourses(params),
  placeholderData: keepPreviousData,
});

/** Single course detail for the Course Detail page. */
export const useCourse = (courseId: string) => useQuery({
  queryKey: courseQueryKeys.detail(courseId),
  queryFn: () => getCourse(courseId),
  enabled: !!courseId,
});

/** Paginated enrollment list for a course. */
export const useCourseEnrollments = (
  courseId: string,
  params: CourseEnrollmentParams = {},
  enabled = true,
) => useQuery({
  queryKey: courseQueryKeys.enrollments(courseId, params),
  queryFn: () => getCourseEnrollments(courseId, params),
  enabled: enabled && !!courseId,
  placeholderData: keepPreviousData,
});

/** Staff list for a course. */
export const useCourseStaff = (courseId: string, enabled = true) => useQuery({
  queryKey: courseQueryKeys.staff(courseId),
  queryFn: () => getCourseStaff(courseId),
  enabled: enabled && !!courseId,
});

// ── Mutations ─────────────────────────────────────────────────────────────────

/**
 * POST to enroll a user in a course.
 *
 * No optimistic update: enrollment fires Celery signals whose effects (email,
 * grade reset) land asynchronously. Invalidate after success to show the real
 * state.
 */
export const useEnrollUserInCourse = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CourseEnrollPayload) => enrollUserInCourse(courseId, payload),
    onSuccess: () => {
      // Invalidate all enrollment query variations for this course
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.detail(courseId) });
      queryClient.invalidateQueries({
        queryKey: [...courseQueryKeys.detail(courseId), 'enrollments'],
        exact: false,
      });
    },
  });
};

/** POST to add a staff member. Invalidates the staff list. */
export const useAddCourseStaff = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CourseStaffAddPayload) => addCourseStaff(courseId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.staff(courseId) });
    },
  });
};

/** DELETE to remove a staff member. Invalidates the staff list. */
export const useRemoveCourseStaff = (courseId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (params: CourseStaffRemoveParams) => removeCourseStaff(courseId, params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: courseQueryKeys.staff(courseId) });
    },
  });
};

/**
 * Trigger the CSV download imperatively — no mutation state needed in the UI
 * beyond an in-progress spinner, so this helper is exposed directly.
 */
export const useDownloadCourseEnrollmentsCsv = (courseId: string) => useMutation({
  mutationFn: () => downloadCourseEnrollmentsCsv(courseId),
});
