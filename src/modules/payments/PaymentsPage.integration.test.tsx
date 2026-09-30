/**
 * PaymentsPage with the real hooks and a real QueryClient, and only the api
 * mocked: what actually goes over the wire as the user pages, narrows and
 * switches tabs. The other PaymentsPage tests mock the hooks, so they cannot
 * see a request that should not have been sent.
 */
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderWrapper } from '@src/setupTest';
import * as whoami from '@src/data/whoami';
import * as api from './data/api';
import PaymentsPage from './PaymentsPage';

jest.mock('@src/data/whoami', () => ({ useAdminCapabilities: jest.fn() }));

jest.mock('./data/api', () => ({
  getPaymentsSummary: jest.fn(),
  getPaymentOrders: jest.fn(),
  getPaymentPartners: jest.fn(),
  getPaymentContent: jest.fn(),
  getPaymentLearners: jest.fn(),
  getPaymentCoupons: jest.fn(),
  downloadPaymentsCsv: jest.fn(),
}));

jest.mock('@src/components/charts/MetricChart', () => ({
  __esModule: true,
  default: () => <div data-testid="metric-chart" />,
}));

const mockApi = api as jest.Mocked<typeof api>;

const pageOf = (results: unknown[], numPages = 1, count = results.length) => ({
  pagination: {
    count, numPages, next: null, previous: null,
  },
  results,
});

const summary = {
  gross: '800.00',
  discounts: '100.00',
  netPaid: '700.00',
  partnerAmount: '349.00',
  rwaqAmount: '201.00',
  orders: 3,
  items: 4,
  granularity: 'month',
  series: [],
};

const partner = {
  org: 'TPA',
  orgName: 'Org A',
  share: '70.00',
  orders: 2,
  items: 2,
  gross: '400.00',
  discounts: '30.00',
  netPaid: '370.00',
  partnerAmount: '259.00',
  rwaqAmount: '111.00',
};

const order = (id: number) => ({
  id,
  wordpressOrderId: `wp-${id}`,
  source: 'wordpress',
  status: 'completed',
  orderDate: '2026-09-10T10:00:00Z',
  paidVia: 'moyasar',
  currency: 'SAR',
  userId: 5,
  username: 'buyer5',
  email: 'buyer5@example.com',
  orderBy: 'buyer5@example.com',
  actualPrice: '100.00',
  discountTotal: '0.00',
  pricePaid: '100.00',
  partnerActualPrice: null,
  partnerDiscountAmount: null,
  partnerPricePaid: null,
  reason: '',
  coupons: [],
  items: [],
});

const renderPage = async () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, staleTime: 60_000 } } });
  renderWrapper(<QueryClientProvider client={queryClient}><PaymentsPage /></QueryClientProvider>);
  await waitFor(() => expect(screen.queryByTestId('tab-loading')).not.toBeInTheDocument());
};
const tabReady = () => waitFor(() => expect(screen.queryByTestId('tab-loading')).not.toBeInTheDocument());
const openTab = async (name: string) => { fireEvent.click(screen.getByRole('tab', { name })); await tabReady(); };

/** The params of every call so far to one of the api functions. */
const callsOf = (fn: jest.Mock) => fn.mock.calls.map(([params]) => params as Record<string, unknown>);

beforeEach(() => {
  window.history.pushState({}, '', '/');
  jest.resetAllMocks();
  (whoami.useAdminCapabilities as jest.Mock).mockReturnValue({ data: { isSuperuser: true }, isLoading: false });
  mockApi.getPaymentsSummary.mockResolvedValue(summary as never);
  mockApi.getPaymentPartners.mockResolvedValue(pageOf([partner]) as never);
  mockApi.getPaymentOrders.mockResolvedValue(pageOf([order(1)], 3, 25) as never);
  mockApi.getPaymentContent.mockResolvedValue(pageOf([]) as never);
  mockApi.getPaymentLearners.mockResolvedValue(pageOf([]) as never);
  mockApi.getPaymentCoupons.mockResolvedValue(pageOf([]) as never);
});

describe('PaymentsPage requests', () => {
  it('never asks for a page picked under other filters when the date range changes', async () => {
    window.history.pushState({}, '', '/?tab=orders');
    await renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Page 2' })).toBeInTheDocument());

    fireEvent.click(screen.getByRole('button', { name: 'Page 2' }));
    await waitFor(() => expect(callsOf(mockApi.getPaymentOrders as jest.Mock)).toContainEqual(
      expect.objectContaining({ page: 2, startDate: undefined }),
    ));

    fireEvent.click(screen.getByRole('button', { name: /All time/ }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Last 30 days' }));
    await waitFor(() => expect(callsOf(mockApi.getPaymentOrders as jest.Mock)).toContainEqual(
      expect.objectContaining({ page: 1, startDate: expect.any(String) }),
    ));

    // Page 2 of the old range would be a 404 in the new one.
    const narrowed = callsOf(mockApi.getPaymentOrders as jest.Mock).filter((params) => params.startDate);
    expect(narrowed.every((params) => params.page === 1)).toBe(true);
  });

  it('never asks for a page picked under other filters when the partner changes', async () => {
    window.history.pushState({}, '', '/?tab=orders');
    await renderPage();
    await waitFor(() => expect(screen.getByRole('button', { name: 'Page 3' })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: 'Page 3' }));
    await waitFor(() => expect(callsOf(mockApi.getPaymentOrders as jest.Mock)).toContainEqual(
      expect.objectContaining({ page: 3 }),
    ));

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    fireEvent.change(screen.getByLabelText('Partner'), { target: { value: 'TPA' } });
    await waitFor(() => expect(callsOf(mockApi.getPaymentOrders as jest.Mock)).toContainEqual(
      expect.objectContaining({ org: 'TPA', page: 1 }),
    ));

    const narrowed = callsOf(mockApi.getPaymentOrders as jest.Mock).filter((params) => params.org === 'TPA');
    expect(narrowed.every((params) => params.page === 1)).toBe(true);
  });

  it('does not query a tab that is open but hidden, and keeps what it had', async () => {
    await renderPage();
    await openTab('By partner');
    await openTab('Payment history');
    await waitFor(() => expect(mockApi.getPaymentOrders).toHaveBeenCalled());
    await openTab('By partner');
    const ordersBefore = mockApi.getPaymentOrders.mock.calls.length;
    const summaryBefore = mockApi.getPaymentsSummary.mock.calls.length;

    // Overview for a partner: Overview queries with the partner, the hidden history tab does not.
    fireEvent.click(screen.getByRole('button', { name: 'Open the overview for Org A' }));
    await waitFor(() => expect(callsOf(mockApi.getPaymentsSummary as jest.Mock)).toContainEqual(
      expect.objectContaining({ org: 'TPA' }),
    ));

    expect(mockApi.getPaymentsSummary.mock.calls.length).toBeGreaterThan(summaryBefore);
    expect(mockApi.getPaymentOrders.mock.calls.length).toBe(ordersBefore);
  });
});
