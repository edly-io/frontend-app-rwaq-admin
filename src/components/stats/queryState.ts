/**
 * Reads several stats queries as one state, so a strip can show one message instead of one per tile.
 */
import { getErrorStatus } from '@src/data/httpError';

interface QueryLike {
  isError: boolean;
  error: unknown;
  refetch: () => unknown;
}

export interface StripState {
  /** At least one query was refused with 403. */
  isForbidden: boolean;
  /** Every query failed, so there is nothing to show. */
  hasFailedAll: boolean;
  retry: () => void;
}

const summarizeQueries = (queries: QueryLike[]): StripState => ({
  isForbidden: queries.some((query) => query.isError && getErrorStatus(query.error) === 403),
  hasFailedAll: queries.length > 0 && queries.every((query) => query.isError),
  retry: () => queries.forEach((query) => query.refetch()),
});

export default summarizeQueries;
