/**
 * The pieces every payments tab shares: list paging state, dates in UTC, and
 * the CSV button with the real hook and api behind it (only the http client
 * is mocked), so what goes over the wire is what the tab's filters say.
 */
import { ReactNode } from 'react';
import {
  act, fireEvent, render, renderHook, screen, waitFor,
} from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { logError } from '@edx/frontend-platform/logging';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { useToast } from '@src/components/ToastContext';
import {
  CsvButton, formatDateTime, listScope, useListState,
} from './shared';

jest.mock('@edx/frontend-platform/auth', () => ({ getAuthenticatedHttpClient: jest.fn() }));
jest.mock('@edx/frontend-platform/logging', () => ({ logError: jest.fn() }));
jest.mock('@edx/frontend-platform', () => {
  const actual = jest.requireActual('@edx/frontend-platform');
  return { ...actual, getConfig: jest.fn(() => ({ STUDIO_BASE_URL: 'http://studio.local:8001' })) };
});
jest.mock('@src/components/ToastContext', () => ({ useToast: jest.fn() }));

const BASE = 'http://studio.local:8001/api/v1/admin/payments';
const get = jest.fn();
const showToast = jest.fn();

describe('listScope', () => {
  it('tells apart values that would run together, and treats missing as empty', () => {
    expect(listScope('a|', 'b')).not.toBe(listScope('a', '|b'));
    expect(listScope('TPA', undefined)).toBe(listScope('TPA', ''));
    expect(listScope('TPA', '2026-09-01')).not.toBe(listScope('TPA', '2026-10-01'));
  });
});

describe('useListState', () => {
  const setup = (scope: string) => renderHook(
    ({ current }) => useListState('-net_paid', { type: '' }, current),
    { initialProps: { current: scope } },
  );

  it('keeps the page picked under the current scope', () => {
    const { result } = setup('A');

    act(() => result.current.setPage(3));

    expect(result.current.page).toBe(3);
  });

  it('is on page 1 in the very render where the scope changes, with no render on the old page', () => {
    const pages: number[] = [];
    const { result, rerender } = renderHook(
      ({ current }) => {
        const list = useListState('-net_paid', {}, current);
        pages.push(list.page);
        return list;
      },
      { initialProps: { current: 'A' } },
    );
    act(() => result.current.setPage(3));
    pages.length = 0;

    rerender({ current: 'B' });

    expect(pages.every((page) => page === 1)).toBe(true);
    expect(result.current.page).toBe(1);
  });

  it('does not bring the old page back when the scope changes back', () => {
    const { result, rerender } = setup('A');
    act(() => result.current.setPage(3));

    rerender({ current: 'B' });
    rerender({ current: 'A' });

    expect(result.current.page).toBe(1);
  });

  it('lets a page be picked under the new scope', () => {
    const { result, rerender } = setup('A');
    act(() => result.current.setPage(3));
    rerender({ current: 'B' });

    act(() => result.current.setPage(2));

    expect(result.current.page).toBe(2);
  });

  it('goes back to page 1 when the search, sort or a filter changes', () => {
    const { result } = setup('A');

    act(() => result.current.setPage(4));
    act(() => result.current.setSearch('abc'));
    expect(result.current.page).toBe(1);

    act(() => result.current.setPage(4));
    act(() => result.current.setOrdering('title'));
    expect(result.current.page).toBe(1);

    act(() => result.current.setPage(4));
    act(() => result.current.setFilter('type', 'course'));
    expect(result.current.page).toBe(1);
  });
});

describe('formatDateTime', () => {
  const zone = process.env.TZ;
  afterEach(() => {
    if (zone === undefined) { delete process.env.TZ; } else { process.env.TZ = zone; }
  });

  it('shows the UTC date and time of a timestamp even where the browser is already on the next day', () => {
    // Auckland is 12 to 13 hours ahead: 20:00 UTC on the 10th is the morning of the 11th there.
    process.env.TZ = 'Pacific/Auckland';

    expect(formatDateTime('2026-09-10T20:00:00Z', 'en-US')).toBe('Sep 10, 2026, 20:00');
    expect(formatDateTime('2026-09-10T23:59:59Z', 'en-US')).toBe('Sep 10, 2026, 23:59');
    expect(formatDateTime('2026-09-10T00:00:00Z', 'en-US')).toBe('Sep 10, 2026, 00:00');
  });
});

describe('CsvButton', () => {
  const createObjectURL = jest.fn(() => 'blob:csv-1');
  const revokeObjectURL = jest.fn();
  let clicked: { download: string; href: string }[];

  const renderButton = (params = {}, report: 'orders' | 'partners' = 'orders') => {
    const queryClient = new QueryClient({ defaultOptions: { mutations: { retry: false } } });
    const wrapper = ({ children }: { children: ReactNode }) => (
      <IntlProvider locale="en">
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </IntlProvider>
    );
    return render(<CsvButton report={report} params={params} />, { wrapper });
  };

  beforeEach(() => {
    jest.useFakeTimers({ advanceTimers: true });
    jest.clearAllMocks();
    get.mockReset();
    (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ get });
    (useToast as jest.Mock).mockReturnValue({ showToast });
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    clicked = [];
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function click(this: HTMLAnchorElement) {
      clicked.push({ download: this.download, href: this.href });
    });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('downloads the blob under the name the server gave, through an object URL', async () => {
    const blob = new Blob(['a,b']);
    get.mockResolvedValue({ data: blob, headers: { 'content-disposition': 'attachment; filename="orders_2026-09-30.csv"' } });
    renderButton();

    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));

    await waitFor(() => expect(clicked).toHaveLength(1));
    expect(createObjectURL).toHaveBeenCalledWith(blob);
    expect(clicked[0]).toEqual({ download: 'orders_2026-09-30.csv', href: 'blob:csv-1' });
  });

  it('frees the object URL a moment later, not before the download has started', async () => {
    get.mockResolvedValue({ data: new Blob(['a']), headers: {} });
    renderButton();

    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));
    await waitFor(() => expect(clicked).toHaveLength(1));

    expect(revokeObjectURL).not.toHaveBeenCalled();
    act(() => { jest.advanceTimersByTime(10_000); });
    expect(revokeObjectURL).toHaveBeenCalledTimes(1);
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:csv-1');
  });

  it('sends the tab\'s filters and not its page or page size', async () => {
    get.mockResolvedValue({ data: new Blob(['a']), headers: {} });
    renderButton({
      org: 'TPA',
      startDate: '2026-09-01',
      endDate: '2026-09-30',
      search: 'buyer',
      ordering: '-order_date',
      source: 'wordpress',
      couponCode: 'SAVE10',
      user: 5,
      page: 3,
      pageSize: 10,
    });

    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));

    await waitFor(() => expect(get).toHaveBeenCalledTimes(1));
    expect(get).toHaveBeenCalledWith(`${BASE}/orders/csv/`, {
      params: {
        org: 'TPA',
        start_date: '2026-09-01',
        end_date: '2026-09-30',
        search: 'buyer',
        ordering: '-order_date',
        source: 'wordpress',
        coupon_code: 'SAVE10',
        user: 5,
      },
      responseType: 'blob',
    });
  });

  it('is disabled while the download is in flight and enabled again after', async () => {
    let finish: (value: unknown) => void = () => {};
    get.mockReturnValue(new Promise((resolve) => { finish = resolve; }));
    renderButton({}, 'partners');

    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Download CSV' })).toBeDisabled());
    // A second click while it runs starts nothing.
    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));
    expect(get).toHaveBeenCalledTimes(1);

    await act(async () => { finish({ data: new Blob(['a']), headers: {} }); });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
  });

  it('says so in a toast, logs the error and downloads nothing when the request fails', async () => {
    const failure = Object.assign(new Error('Request failed'), { response: { status: 400, data: new Blob(['bad']) } });
    get.mockRejectedValue(failure);
    renderButton();

    fireEvent.click(screen.getByRole('button', { name: 'Download CSV' }));

    await waitFor(() => expect(showToast).toHaveBeenCalledWith('Could not download the CSV.'));
    expect(logError).toHaveBeenCalledWith(failure);
    expect(clicked).toHaveLength(0);
    expect(createObjectURL).not.toHaveBeenCalled();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Download CSV' })).toBeEnabled());
  });
});
