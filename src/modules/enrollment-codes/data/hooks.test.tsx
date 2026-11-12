/**
 * Enrollment codes hooks with a real QueryClient and a mocked api: the item count behind the add-a-code banner,
 * the items of a code, changes that refresh the lists, and no querying while the tab the hook sits in is hidden.
 */
import { ReactNode } from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActiveTabContext } from '@src/modules/payments/data/activeTab';
import * as api from './api';
import {
  useCodeItems, useCreateEnrollmentCode, useEnrollmentCodes, useEnrollmentCodeUses, useItemCodeCount,
} from './hooks';

jest.mock('./api', () => ({
  getEnrollmentCodes: jest.fn(),
  getEnrollmentCodeUses: jest.fn(),
  getEnrollmentCodeCard: jest.fn(),
  getEnrollmentCodeItems: jest.fn(),
  createEnrollmentCode: jest.fn(),
  updateEnrollmentCode: jest.fn(),
  deleteEnrollmentCode: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;

const page = (count: number) => ({
  pagination: {
    count, numPages: 1, next: null, previous: null,
  },
  results: [],
});

let active = true;
const createWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 60_000 } } });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ActiveTabContext.Provider value={active}>{children}</ActiveTabContext.Provider>
    </QueryClientProvider>
  );
  return { wrapper, queryClient };
};

beforeEach(() => {
  active = true;
  jest.resetAllMocks();
});

describe('enrollment codes hooks', () => {
  it('counts the codes of one course, in any state, from the list filtered to the course', async () => {
    mockApi.getEnrollmentCodes.mockResolvedValue(page(3) as never);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useItemCodeCount({ courseId: 'course-v1:A+B+C' }), { wrapper });

    await waitFor(() => expect(result.current.data).toBe(3));
    expect(mockApi.getEnrollmentCodes).toHaveBeenCalledWith({
      courseId: 'course-v1:A+B+C', page: 1, pageSize: 1,
    });
  });

  it('loads the items of a code, and nothing without a code', async () => {
    mockApi.getEnrollmentCodeItems.mockResolvedValue([
      {
        kind: 'course', id: 'course-v1:A+B+C', name: 'A', learnersJoined: 2,
      },
    ] as never);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useCodeItems(7), { wrapper });
    await waitFor(() => expect(result.current.data).toHaveLength(1));
    expect(mockApi.getEnrollmentCodeItems).toHaveBeenCalledWith(7);

    mockApi.getEnrollmentCodeItems.mockClear();
    renderHook(() => useCodeItems(null), { wrapper });
    expect(mockApi.getEnrollmentCodeItems).not.toHaveBeenCalled();
  });

  it('does not count while it is not needed', () => {
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => useItemCodeCount({ programUuid: 'uuid-1' }, false), { wrapper });
    expect(result.current.data).toBeUndefined();
    expect(mockApi.getEnrollmentCodes).not.toHaveBeenCalled();
  });

  it('refreshes the lists after a code is created', async () => {
    mockApi.getEnrollmentCodes.mockResolvedValue(page(0) as never);
    mockApi.createEnrollmentCode.mockResolvedValue({ id: 1 } as never);
    const { wrapper } = createWrapper();
    const { result } = renderHook(() => ({
      list: useEnrollmentCodes({ page: 1 }),
      create: useCreateEnrollmentCode(),
    }), { wrapper });

    await waitFor(() => expect(result.current.list.isSuccess).toBe(true));
    expect(mockApi.getEnrollmentCodes).toHaveBeenCalledTimes(1);

    await act(async () => {
      await result.current.create.mutateAsync({ courseId: 'course-v1:A+B+C', maxUses: 1 });
    });
    await waitFor(() => expect(mockApi.getEnrollmentCodes).toHaveBeenCalledTimes(2));
  });

  it('does not query while its tab is hidden', () => {
    active = false;
    const { wrapper } = createWrapper();
    renderHook(() => ({ codes: useEnrollmentCodes({}), uses: useEnrollmentCodeUses({}) }), { wrapper });
    expect(mockApi.getEnrollmentCodes).not.toHaveBeenCalled();
    expect(mockApi.getEnrollmentCodeUses).not.toHaveBeenCalled();
  });
});
