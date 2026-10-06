/**
 * Payments hooks with a real QueryClient and a mocked api: one query per
 * filter set, the previous page kept as placeholder data while the next one
 * loads, and no querying while the tab the hook sits in is hidden.
 */
import { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ActiveTabContext } from './activeTab';
import * as api from './api';
import {
  usePaymentContent,
  usePaymentCoupons,
  usePaymentLearners,
  usePaymentOrders,
  usePaymentPartners,
  usePaymentsSummary,
} from './hooks';

jest.mock('./api', () => ({
  getPaymentsSummary: jest.fn(),
  getPaymentOrders: jest.fn(),
  getPaymentPartners: jest.fn(),
  getPaymentContent: jest.fn(),
  getPaymentLearners: jest.fn(),
  getPaymentCoupons: jest.fn(),
  downloadPaymentsCsv: jest.fn(),
}));

const mockApi = api as jest.Mocked<typeof api>;

const page = (label: string) => ({
  pagination: {
    count: 1, numPages: 1, next: null, previous: null,
  },
  results: [{ label }],
});

let active = true;
const createWrapper = () => {
  // The app's staleTime, so a key fetched a moment ago is reused instead of refetched.
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 60_000 } } });
  // The wrapper reads `active` on every render, so rerender() flips the tab.
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <ActiveTabContext.Provider value={active}>{children}</ActiveTabContext.Provider>
    </QueryClientProvider>
  );
  return wrapper;
};

beforeEach(() => {
  active = true;
  jest.resetAllMocks();
});

describe('payments hooks', () => {
  it('runs one query per filter set and reuses the cached one when the filters come back', async () => {
    mockApi.getPaymentOrders.mockImplementation(async (params) => page(`page ${params.page}`) as never);
    const { result, rerender } = renderHook(
      ({ pageNumber }) => usePaymentOrders({ org: 'TPA', page: pageNumber }),
      { wrapper: createWrapper(), initialProps: { pageNumber: 1 } },
    );
    await waitFor(() => expect(result.current.data).toEqual(page('page 1')));

    rerender({ pageNumber: 2 });
    await waitFor(() => expect(result.current.data).toEqual(page('page 2')));
    rerender({ pageNumber: 1 });
    await waitFor(() => expect(result.current.data).toEqual(page('page 1')));

    expect(mockApi.getPaymentOrders).toHaveBeenCalledTimes(2);
    expect(mockApi.getPaymentOrders).toHaveBeenCalledWith({ org: 'TPA', page: 1 });
    expect(mockApi.getPaymentOrders).toHaveBeenCalledWith({ org: 'TPA', page: 2 });
  });

  it('keeps the previous page as placeholder data until the next one arrives', async () => {
    let finishSecond: (value: unknown) => void = () => {};
    mockApi.getPaymentOrders
      .mockResolvedValueOnce(page('first') as never)
      .mockReturnValueOnce(new Promise((resolve) => { finishSecond = resolve; }) as never);
    const { result, rerender } = renderHook(
      ({ pageNumber }) => usePaymentOrders({ page: pageNumber }),
      { wrapper: createWrapper(), initialProps: { pageNumber: 1 } },
    );
    await waitFor(() => expect(result.current.data).toEqual(page('first')));
    expect(result.current.isPlaceholderData).toBe(false);

    rerender({ pageNumber: 2 });

    expect(result.current.data).toEqual(page('first'));
    expect(result.current.isPlaceholderData).toBe(true);
    expect(result.current.isLoading).toBe(false);

    finishSecond(page('second'));
    await waitFor(() => expect(result.current.data).toEqual(page('second')));
    expect(result.current.isPlaceholderData).toBe(false);
  });

  it('keys the summary by granularity', async () => {
    mockApi.getPaymentsSummary.mockResolvedValue({ orders: 1 } as never);
    const { result, rerender } = renderHook(
      ({ granularity }) => usePaymentsSummary({ granularity }),
      { wrapper: createWrapper(), initialProps: { granularity: 'month' as const } },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    rerender({ granularity: 'week' as never });
    await waitFor(() => expect(mockApi.getPaymentsSummary).toHaveBeenCalledTimes(2));

    expect(mockApi.getPaymentsSummary).toHaveBeenLastCalledWith({ granularity: 'week' });
  });

  type QueryState = { fetchStatus: string; isSuccess: boolean };
  const hooks: [string, () => QueryState, () => jest.Mock][] = [
    ['summary', () => usePaymentsSummary({}), () => mockApi.getPaymentsSummary as jest.Mock],
    ['orders', () => usePaymentOrders({}), () => mockApi.getPaymentOrders as jest.Mock],
    ['partners', () => usePaymentPartners({}), () => mockApi.getPaymentPartners as jest.Mock],
    ['content', () => usePaymentContent({}), () => mockApi.getPaymentContent as jest.Mock],
    ['learners', () => usePaymentLearners({}), () => mockApi.getPaymentLearners as jest.Mock],
    ['coupons', () => usePaymentCoupons({}), () => mockApi.getPaymentCoupons as jest.Mock],
  ];

  it.each(hooks)('does not query %s in a hidden tab, and queries once the tab is shown', async (_name, useHook, fn) => {
    fn().mockResolvedValue(page('rows'));
    active = false;
    const { result, rerender } = renderHook(useHook, { wrapper: createWrapper() });

    await new Promise((resolve) => { setTimeout(resolve, 20); });
    expect(fn()).not.toHaveBeenCalled();
    expect(result.current.fetchStatus).toBe('idle');

    active = true;
    rerender();
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(fn()).toHaveBeenCalledTimes(1);
  });

  it('keeps its data while hidden and does not refetch when shown again with the same filters', async () => {
    mockApi.getPaymentPartners.mockResolvedValue(page('rows') as never);
    const { result, rerender } = renderHook(() => usePaymentPartners({ search: 'a' }), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    active = false;
    rerender();
    expect(result.current.data).toEqual(page('rows'));
    active = true;
    rerender();

    expect(mockApi.getPaymentPartners).toHaveBeenCalledTimes(1);
  });
});
