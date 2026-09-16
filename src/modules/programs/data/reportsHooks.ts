/**
 * React Query hooks for the Admin Program Reports feature.
 *
 * `useProgramCompletionReport` — kept unchanged (P1 concern, used by existing UI).
 * `useProgramReportTasks`     — new: paginated task list with 10s auto-poll.
 * `useTriggerProgramReport`   — new: POST trigger mutation.
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { appId } from '@src/constants';
import { fetchProgramCompletionReport } from '../../courses/data/reportsApi';
import { fetchProgramReportTasks, triggerProgramReport } from './api';
import type { ProgramReportTask, ProgramReportType } from './reportsTypes';

// ── Query key factories ────────────────────────────────────────────────────────

export const programReportQueryKeys = {
  all: [appId, 'program-reports'] as const,
  completion: (uuid: string) => [...programReportQueryKeys.all, 'completion', uuid] as const,
};

export const programReportTaskQueryKeys = {
  all: [appId, 'program-report-tasks'] as const,
  list: (uuid: string, page: number) => (
    [...programReportTaskQueryKeys.all, uuid, page] as const
  ),
};

// ── Helpers ────────────────────────────────────────────────────────────────────

const hasInFlightTask = (tasks: ProgramReportTask[] | undefined): boolean => (
  (tasks ?? []).some((t) => t.status === 'pending' || t.status === 'in_progress')
);

// ── Existing hook — do not remove ─────────────────────────────────────────────

export const useProgramCompletionReport = (uuid: string, enabled = true) => useQuery({
  queryKey: programReportQueryKeys.completion(uuid),
  queryFn: () => fetchProgramCompletionReport(uuid),
  enabled: enabled && !!uuid,
  staleTime: 2 * 60_000,
});

// ── Task list with auto-poll ───────────────────────────────────────────────────

/**
 * Fetches the paginated ProgramReportTask list for a program.
 * Polls every 10 seconds while any task on the current page is pending or
 * in_progress. Polling stops automatically when all rows reach a terminal
 * state, or when the query enters an error state.
 */
export const useProgramReportTasks = (uuid: string, page = 1) => useQuery({
  queryKey: programReportTaskQueryKeys.list(uuid, page),
  queryFn: () => fetchProgramReportTasks(uuid, page),
  enabled: !!uuid,
  staleTime: 0,
  refetchInterval: (query) => (
    hasInFlightTask(query.state.data?.results) ? 10_000 : false
  ),
});

// ── Trigger mutation ───────────────────────────────────────────────────────────

/**
 * Mutation that POSTs to the report-tasks endpoint.
 * On success, invalidates page 1 of the task list so the new row appears.
 *
 * The caller is responsible for the duplicate-in-flight guard: check whether
 * the task list already contains a pending/in_progress task of the same
 * reportType before calling mutate(), to avoid the round-trip to the server.
 * The server also returns HTTP 409 if a duplicate is attempted.
 */
export const useTriggerProgramReport = (uuid: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (reportType: ProgramReportType) => triggerProgramReport(uuid, reportType),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [appId, 'program-report-tasks', uuid],
      });
    },
  });
};
