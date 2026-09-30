/**
 * PaymentsPage — the superuser gate, the Overview tiles and trends, and the partner filter.
 *
 * The data hooks are mocked, as in the dashboard test, so this runs without a
 * QueryClient or network. MetricChart is stubbed for the same reason.
 */
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as whoami from '@src/data/whoami';
import * as hooks from './data/hooks';
import PaymentsPage from './PaymentsPage';

jest.mock('@src/data/whoami', () => ({ useAdminCapabilities: jest.fn() }));

jest.mock('./data/hooks', () => ({
  usePaymentsSummary: jest.fn(),
  usePaymentOrders: jest.fn(),
  usePaymentPartners: jest.fn(),
  usePaymentContent: jest.fn(),
  usePaymentLearners: jest.fn(),
  usePaymentCoupons: jest.fn(),
  useDownloadPaymentsCsv: jest.fn(),
}));

jest.mock('@src/components/charts/MetricChart', () => ({
  __esModule: true,
  default: ({ ariaLabel }: { ariaLabel: string }) => <div data-testid="metric-chart" aria-label={ariaLabel} />,
}));

const emptyPage = {
  pagination: {
    count: 0, numPages: 1, next: null, previous: null,
  },
  results: [],
};

const summary = {
  gross: '800.00',
  discounts: '100.00',
  netPaid: '700.00',
  partnerAmount: '349.00',
  rwaqAmount: '201.00',
  orders: 3,
  items: 4,
  granularity: 'month',
  series: [{
    period: '2026-09-01',
    orders: 2,
    gross: '700.00',
    discounts: '100.00',
    netPaid: '600.00',
    partnerAmount: '279.00',
    rwaqAmount: '171.00',
  }],
};

const partnersPage = {
  pagination: {
    count: 1, numPages: 1, next: null, previous: null,
  },
  results: [{
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
  }],
};

const setCapabilities = (isSuperuser: boolean, isLoading = false) => {
  (whoami.useAdminCapabilities as jest.Mock).mockReturnValue({ data: { isSuperuser }, isLoading });
};

beforeEach(() => {
  window.history.pushState({}, '', '/');
  setCapabilities(true);
  (hooks.usePaymentsSummary as jest.Mock).mockReturnValue({ data: summary, isLoading: false, isError: false });
  [hooks.usePaymentOrders, hooks.usePaymentContent, hooks.usePaymentLearners, hooks.usePaymentCoupons]
    .forEach((hook) => (hook as jest.Mock).mockReturnValue({ data: emptyPage, isLoading: false, isError: false }));
  (hooks.usePaymentPartners as jest.Mock).mockReturnValue({ data: partnersPage, isLoading: false, isError: false });
  (hooks.useDownloadPaymentsCsv as jest.Mock).mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
});

/** Tabs load their code and paint a spinner first, so wait for it to go before asserting. */
const tabReady = () => waitFor(() => expect(screen.queryByTestId('tab-loading')).not.toBeInTheDocument());
const renderPage = async () => { renderWrapper(<PaymentsPage />); await tabReady(); };
const openTab = async (name: string) => { fireEvent.click(screen.getByRole('tab', { name })); await tabReady(); };

describe('PaymentsPage', () => {
  it('refuses a non-superuser and fetches nothing', () => {
    setCapabilities(false);
    renderWrapper(<PaymentsPage />);

    expect(screen.getByText('Orders & Payments are visible to Rwaq superadmins only.')).toBeInTheDocument();
    expect(hooks.usePaymentsSummary).not.toHaveBeenCalled();
  });

  it('opens on the Overview with the tiles in order, amounts in SAR, and the unsplit money', async () => {
    await renderPage();

    const labels = ['Orders', 'Order value', 'Discounts', 'Amount collected', 'Payable to partners', 'Rwaq revenue']
      .map((label) => screen.getByText(label));
    labels.slice(1).forEach((label, index) => {
      // eslint-disable-next-line no-bitwise
      expect(labels[index].compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
    expect(screen.getByText('700.00')).toBeInTheDocument();
    expect(screen.getByText('349.00')).toBeInTheDocument();
    expect(screen.getByText('201.00')).toBeInTheDocument();
    expect(screen.queryByText(/not split/)).not.toBeInTheDocument();
    expect(screen.getAllByTestId('metric-chart')).toHaveLength(3);
  });

  it('says so when the totals cannot be loaded, instead of showing zero', async () => {
    (hooks.usePaymentsSummary as jest.Mock).mockReturnValue({ data: undefined, isLoading: false, isError: true });
    await renderPage();

    expect(screen.getByText('Could not load payments.')).toBeInTheDocument();
    expect(screen.getAllByText('The chart could not be loaded.')).toHaveLength(3);
    expect(screen.queryByText('0.00')).not.toBeInTheDocument();
  });

  it('asks for the series by week when Weekly is chosen, with Daily open for any range', async () => {
    await renderPage();

    expect(screen.getByRole('button', { name: 'Daily' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Weekly' }));

    expect(hooks.usePaymentsSummary).toHaveBeenLastCalledWith(expect.objectContaining({ granularity: 'week' }));
  });

  it('opens the Overview for a partner from By partner, and clears it when switching tabs', async () => {
    await renderPage();
    await openTab('By partner');
    fireEvent.click(screen.getByRole('button', { name: 'Open the overview for Org A' }));

    expect(screen.getByText('Payable to partner')).toBeInTheDocument();
    expect(hooks.usePaymentsSummary).toHaveBeenLastCalledWith(expect.objectContaining({ org: 'TPA' }));

    await openTab('Payment history');
    expect(hooks.usePaymentOrders).toHaveBeenLastCalledWith(expect.objectContaining({ org: undefined }));
  });

  it('shows a partner without a share as Not set with a payout of 0.00, all of it Rwaq revenue', async () => {
    (hooks.usePaymentPartners as jest.Mock).mockReturnValue({
      data: {
        ...partnersPage,
        results: [{
          ...partnersPage.results[0], share: null, partnerAmount: '0.00', rwaqAmount: '370.00',
        }],
      },
      isLoading: false,
      isError: false,
    });
    await renderPage();
    await openTab('By partner');

    expect(screen.getByText('Not set')).toBeInTheDocument();
    expect(screen.getByText('0.00')).toBeInTheDocument();
    // Collected and Rwaq revenue are both 370: nothing goes to the partner.
    expect(screen.getAllByText('370.00')).toHaveLength(2);
  });

  it('keeps a date range per tab: choosing one on Overview does not narrow the other tabs', async () => {
    await renderPage();
    fireEvent.click(screen.getByRole('button', { name: /All time/ }));
    fireEvent.click(screen.getByRole('menuitem', { name: 'Last 30 days' }));

    expect(hooks.usePaymentsSummary).toHaveBeenLastCalledWith(
      expect.objectContaining({ startDate: expect.any(String) }),
    );

    await openTab('Payment history');
    expect(hooks.usePaymentOrders).toHaveBeenLastCalledWith(expect.objectContaining({ startDate: undefined }));
  });

  it('shows a million or more in short form with the exact amount on hover', async () => {
    (hooks.usePaymentsSummary as jest.Mock).mockReturnValue({
      data: { ...summary, netPaid: '12345678.90' },
      isLoading: false,
      isError: false,
    });
    await renderPage();

    expect(screen.getByText('12.35M')).toBeInTheDocument();
    expect(screen.getByTitle('SAR 12,345,678.90')).toBeInTheDocument();
  });

  it('shows big amounts in tables in short form with the exact amount on hover', async () => {
    (hooks.usePaymentPartners as jest.Mock).mockReturnValue({
      data: {
        ...partnersPage,
        results: [{ ...partnersPage.results[0], netPaid: '45000000.00', gross: '99999.99' }],
      },
      isLoading: false,
      isError: false,
    });
    await renderPage();
    await openTab('By partner');

    expect(screen.getByText('45M')).toBeInTheDocument();
    expect(screen.getByLabelText('SAR 45,000,000.00')).toBeInTheDocument();
    // The currency is in the header, not repeated in every cell.
    expect(screen.getByText('Amount collected (SAR)')).toBeInTheDocument();
    expect(screen.queryByText(/^SAR /)).not.toBeInTheDocument();
    // Under 100,000 stays exact.
    expect(screen.getByText('99,999.99')).toBeInTheDocument();
  });

  const pageOf = (results: unknown[], count = results.length) => ({
    pagination: {
      count, numPages: 1, next: null, previous: null,
    },
    results,
  });

  // A cart of 100 for TPA's course and 50 for another partner's, paid 150 in all.
  const mixedOrder = {
    id: 7,
    wordpressOrderId: 'wp-7',
    source: 'wordpress',
    status: 'completed',
    orderDate: '2026-09-10T10:00:00Z',
    paidVia: 'moyasar',
    currency: 'SAR',
    userId: 5,
    username: 'buyer5',
    email: 'buyer5@example.com',
    orderBy: 'buyer5@example.com',
    actualPrice: '150.00',
    discountTotal: '0.00',
    pricePaid: '150.00',
    reason: '',
    coupons: [{
      code: 'SAVE10', scope: 'cart', discountType: 'amount', value: '10', courseId: null, programKey: null, discountAmount: '10.00',
    }],
    items: [
      {
        type: 'course',
        key: 'course-v1:TPA+C1+2026',
        programUuid: null,
        title: 'Course 1',
        org: 'TPA',
        actualPrice: '100.00',
        discountAmount: '0.00',
        pricePaid: '100.00',
        revokedAt: null,
        revokeReason: '',
      },
      {
        type: 'course',
        key: 'course-v1:TPB+C2+2026',
        programUuid: null,
        title: 'Course 2',
        org: 'TPB',
        actualPrice: '50.00',
        discountAmount: '0.00',
        pricePaid: '50.00',
        revokedAt: null,
        revokeReason: '',
      },
    ],
  };

  it('expands a partner into its orders, counting only that partner\'s items, and View all opens the history', async () => {
    (hooks.usePaymentOrders as jest.Mock).mockReturnValue({
      data: pageOf([mixedOrder], 12), isLoading: false, isError: false,
    });
    await renderPage();
    await openTab('By partner');
    fireEvent.click(screen.getAllByRole('button', { name: /expand/i })[0]);

    expect(hooks.usePaymentOrders).toHaveBeenCalledWith(expect.objectContaining({
      org: 'TPA', pageSize: 5, source: 'wordpress', status: 'completed',
    }));
    expect(hooks.usePaymentContent).not.toHaveBeenCalledWith(expect.objectContaining({ pageSize: 5 }));
    // Only the TPA course counts: 100, not the whole 150 cart.
    expect(screen.getAllByRole('cell', { name: '100.00' })).toHaveLength(1);
    expect(screen.queryAllByRole('cell', { name: '150.00' })).toHaveLength(0);
    expect(screen.getByText('Showing 1 of 12.')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'View all' }));
    await tabReady();
    expect(screen.getByRole('tab', { name: 'Payment history', selected: true })).toBeInTheDocument();
    expect(hooks.usePaymentOrders).toHaveBeenCalledWith(expect.objectContaining({ org: 'TPA', pageSize: 10 }));
  });

  it('expands a learner into their orders and View all filters the history to that buyer', async () => {
    (hooks.usePaymentLearners as jest.Mock).mockReturnValue({
      data: pageOf([{
        userId: 5,
        username: 'buyer5',
        email: 'buyer5@example.com',
        orders: 8,
        items: 9,
        gross: '150.00',
        discounts: '0.00',
        netPaid: '150.00',
        partnerAmount: '70.00',
        rwaqAmount: '80.00',
      }]),
      isLoading: false,
      isError: false,
    });
    (hooks.usePaymentOrders as jest.Mock).mockReturnValue({
      data: pageOf([mixedOrder], 8), isLoading: false, isError: false,
    });
    await renderPage();
    await openTab('By learner');
    fireEvent.click(screen.getAllByRole('button', { name: /expand/i })[0]);

    expect(hooks.usePaymentOrders).toHaveBeenCalledWith(expect.objectContaining({ user: 5, pageSize: 5 }));
    // The learner row's Order value and Amount collected, then the order's whole amount.
    expect(screen.getAllByText('150.00')).toHaveLength(3);

    fireEvent.click(screen.getByRole('button', { name: 'View all' }));
    await tabReady();
    expect(hooks.usePaymentOrders).toHaveBeenCalledWith(expect.objectContaining({ user: 5, pageSize: 10 }));
    expect(screen.getByText('Buyer: buyer5')).toBeInTheDocument();
  });

  it('expands a coupon into its orders with the discount it gave, and View all filters by the exact code', async () => {
    (hooks.usePaymentCoupons as jest.Mock).mockReturnValue({
      data: pageOf([{
        code: 'SAVE10', scope: 'cart', discountType: 'amount', orders: 6, discountGiven: '60.00',
      }]),
      isLoading: false,
      isError: false,
    });
    (hooks.usePaymentOrders as jest.Mock).mockReturnValue({
      data: pageOf([mixedOrder], 6), isLoading: false, isError: false,
    });
    await renderPage();
    await openTab('By coupon');
    fireEvent.click(screen.getAllByRole('button', { name: /expand/i })[0]);

    expect(hooks.usePaymentOrders).toHaveBeenCalledWith(expect.objectContaining({ couponCode: 'SAVE10', pageSize: 5 }));
    expect(screen.getByText('10.00')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'View all' }));
    await tabReady();
    expect(hooks.usePaymentOrders).toHaveBeenCalledWith(expect.objectContaining({ couponCode: 'SAVE10', pageSize: 10 }));
    expect(screen.getByText('Coupon code: SAVE10')).toBeInTheDocument();
  });

  it('explains how each list is worked out, with an example', async () => {
    await renderPage();
    await openTab('By partner');

    expect(screen.getByText(/Partner payout = amount collected x the partner's share %/)).toBeInTheDocument();
  });
});
