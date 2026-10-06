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
import * as orgHooks from '@src/modules/organizations/data/hooks';
import * as api from './data/api';
import PaymentsPage from './PaymentsPage';

jest.mock('@src/data/whoami', () => ({ useAdminCapabilities: jest.fn() }));

jest.mock('@src/modules/organizations/data/hooks', () => ({ useOrganizations: jest.fn() }));

jest.mock('./data/api', () => ({
  getPaymentsSummary: jest.fn(),
  getPaymentOrders: jest.fn(),
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
  orders: 3,
  items: 4,
  granularity: 'month',
  series: [],
};

const partner = { shortName: 'TPA', name: 'Org A' };

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
  enrolledBy: null,
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
  (orgHooks.useOrganizations as jest.Mock).mockReturnValue({ data: pageOf([partner]), isLoading: false });
  mockApi.getPaymentOrders.mockResolvedValue(pageOf([order(1)], 3, 25) as never);
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
    await openTab('Payment history');
    await waitFor(() => expect(mockApi.getPaymentOrders).toHaveBeenCalled());
    await openTab('Overview');
    const ordersBefore = mockApi.getPaymentOrders.mock.calls.length;
    const summaryBefore = mockApi.getPaymentsSummary.mock.calls.length;

    // A partner chosen on Overview: Overview queries with it, the hidden history tab does not.
    // Both tabs are mounted and each has a Partner select, so pick Overview's.
    fireEvent.change(document.getElementById('rwaq-overview-partner') as HTMLElement, { target: { value: 'TPA' } });
    await waitFor(() => expect(callsOf(mockApi.getPaymentsSummary as jest.Mock)).toContainEqual(
      expect.objectContaining({ org: 'TPA' }),
    ));

    expect(mockApi.getPaymentsSummary.mock.calls.length).toBeGreaterThan(summaryBefore);
    expect(mockApi.getPaymentOrders.mock.calls.length).toBe(ordersBefore);
  });
});
