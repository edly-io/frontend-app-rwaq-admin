/**
 * React Query hooks for the Admin Program Reports feature.
 */
import { useQuery } from '@tanstack/react-query';
import { appId } from '@src/constants';
import { fetchProgramCompletionReport } from '../../courses/data/reportsApi';

export const programReportQueryKeys = {
  all: [appId, 'program-reports'] as const,
  completion: (uuid: string) => [...programReportQueryKeys.all, 'completion', uuid] as const,
};

export const useProgramCompletionReport = (uuid: string, enabled = true) => useQuery({
  queryKey: programReportQueryKeys.completion(uuid),
  queryFn: () => fetchProgramCompletionReport(uuid),
  enabled: enabled && !!uuid,
  staleTime: 2 * 60_000,
});
