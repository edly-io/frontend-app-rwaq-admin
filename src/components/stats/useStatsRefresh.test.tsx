/**
 * useStatsRefresh — every query of a strip is fetched again with the cache bypass, the answers are written into
 * the cache together, a failure leaves the old figures alone, and a second click while busy sends nothing.
 */
import { ReactNode } from 'react';
import { act, renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useStatsRefresh from './useStatsRefresh';

const makeWrapper = (client: QueryClient) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return Wrapper;
};

describe('useStatsRefresh', () => {
  it('writes the fresh answer of every entry into the cache together', async () => {
    const client = new QueryClient();
    client.setQueryData(['a'], 'old a');
    client.setQueryData(['b'], 'old b');
    const { result } = renderHook(() => useStatsRefresh(), { wrapper: makeWrapper(client) });

    await act(async () => {
      await result.current.refresh([
        { queryKey: ['a'], fetch: () => Promise.resolve('new a') },
        { queryKey: ['b'], fetch: () => Promise.resolve('new b') },
      ]);
    });

    expect(client.getQueryData(['a'])).toBe('new a');
    expect(client.getQueryData(['b'])).toBe('new b');
    expect(result.current.isRefreshing).toBe(false);
    expect(result.current.hasFailed).toBe(false);
  });

  it('keeps the old figures and reports the failure when one request fails', async () => {
    const client = new QueryClient();
    client.setQueryData(['a'], 'old a');
    client.setQueryData(['b'], 'old b');
    const { result } = renderHook(() => useStatsRefresh(), { wrapper: makeWrapper(client) });

    await act(async () => {
      await result.current.refresh([
        { queryKey: ['a'], fetch: () => Promise.resolve('new a') },
        { queryKey: ['b'], fetch: () => Promise.reject(new Error('429')) },
      ]);
    });

    expect(client.getQueryData(['a'])).toBe('old a');
    expect(client.getQueryData(['b'])).toBe('old b');
    expect(result.current.hasFailed).toBe(true);
    expect(result.current.isRefreshing).toBe(false);
  });

  it('ignores a second refresh while the first is still running', async () => {
    const client = new QueryClient();
    const { result } = renderHook(() => useStatsRefresh(), { wrapper: makeWrapper(client) });
    let release: (value: string) => void = () => {};
    const slow = jest.fn(() => new Promise<string>((resolve) => { release = resolve; }));

    let first: Promise<void> = Promise.resolve();
    await act(async () => {
      first = result.current.refresh([{ queryKey: ['a'], fetch: slow }]);
      await result.current.refresh([{ queryKey: ['a'], fetch: slow }]);
    });
    expect(slow).toHaveBeenCalledTimes(1);

    await act(async () => {
      release('done');
      await first;
    });
    expect(client.getQueryData(['a'])).toBe('done');
  });

  it('clears an earlier failure when the next refresh starts', async () => {
    const client = new QueryClient();
    const { result } = renderHook(() => useStatsRefresh(), { wrapper: makeWrapper(client) });

    await act(async () => {
      await result.current.refresh([{ queryKey: ['a'], fetch: () => Promise.reject(new Error('x')) }]);
    });
    expect(result.current.hasFailed).toBe(true);

    await act(async () => {
      await result.current.refresh([{ queryKey: ['a'], fetch: () => Promise.resolve('ok') }]);
    });
    expect(result.current.hasFailed).toBe(false);
  });
});
