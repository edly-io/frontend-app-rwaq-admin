/**
 * PaymentsPage — the superuser gate, the Overview tiles and trends, Payment history and the partner filter.
 *
 * The data hooks are mocked, as in the dashboard test, so this runs without a
 * QueryClient or network. MetricChart is stubbed for the same reason.
 */
import {
  act, fireEvent, screen, waitFor, within,
} from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as whoami from '@src/data/whoami';
import * as orgHooks from '@src/modules/organizations/data/hooks';
import * as hooks from './data/hooks';
import PaymentsPage from './PaymentsPage';

jest.mock('@src/data/whoami', () => ({ useAdminCapabilities: jest.fn() }));

jest.mock('@src/modules/organizations/data/hooks', () => ({ useOrganizations: jest.fn() }));

jest.mock('./data/hooks', () => ({
  usePaymentsSummary: jest.fn(),
  usePaymentOrders: jest.fn(),
  useDownloadPaymentsCsv: jest.fn(),
}));

// Stands in for the chart: its x labels, and what the money axis would show for 1234.5.
jest.mock('@src/components/charts/MetricChart', () => ({
  __esModule: true,
  default: ({
    ariaLabel, data, valueFormatter, yAxisWidth,
  }: {
    ariaLabel: string;
    data: { name: string }[];
    valueFormatter?: (value: number) => string;
    yAxisWidth?: number;
  }) => (
    <div
      data-testid="metric-chart"
      aria-label={ariaLabel}
      data-axis-width={yAxisWidth}
      data-axis-sample={valueFormatter ? valueFormatter(1234.5) : undefined}
    >
      {data.map((point) => <span key={point.name}>{point.name}</span>)}
    </div>
  ),
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
  orders: 3,
  items: 4,
  granularity: 'month',
  series: [{
    period: '2026-09-01',
    orders: 2,
    gross: '700.00',
    discounts: '100.00',
    netPaid: '600.00',
  }],
};

const orgsPage = {
  pagination: {
    count: 1, numPages: 1, next: null, previous: null,
  },
  results: [{ shortName: 'TPA', name: 'Org A' }],
};

const setCapabilities = (isSuperuser: boolean, isLoading = false) => {
  (whoami.useAdminCapabilities as jest.Mock).mockReturnValue({ data: { isSuperuser }, isLoading });
};

beforeEach(() => {
  window.history.pushState({}, '', '/');
  setCapabilities(true);
  (hooks.usePaymentsSummary as jest.Mock).mockReturnValue({ data: summary, isLoading: false, isError: false });
  (hooks.usePaymentOrders as jest.Mock).mockReturnValue({ data: emptyPage, isLoading: false, isError: false });
  (orgHooks.useOrganizations as jest.Mock).mockReturnValue({ data: orgsPage, isLoading: false, isError: false });
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

  it('has the Overview, Payment history and Subscriptions tabs', async () => {
    await renderPage();

    // Paragon adds a "More..." overflow tab when it cannot measure the row (jsdom).
    const names = screen.getAllByRole('tab').map((tab) => tab.textContent).filter((name) => name !== 'More...');
    expect(names).toEqual(['Overview', 'Payment history', 'Subscriptions']);
  });

  it('opens on the Overview with the tiles in order and amounts in SAR', async () => {
    await renderPage();

    const labels = ['Orders', 'Order value', 'Discounts', 'Revenue'].map((label) => screen.getByText(label));
    labels.slice(1).forEach((label, index) => {
      // eslint-disable-next-line no-bitwise
      expect(labels[index].compareDocumentPosition(label) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    });
    expect(screen.getByText('700.00')).toBeInTheDocument();
    expect(screen.queryByText('Payable to partners')).not.toBeInTheDocument();
    expect(screen.queryByText('Rwaq revenue')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('metric-chart')).toHaveLength(2);
  });

  it('says so when the totals cannot be loaded, instead of showing zero', async () => {
    (hooks.usePaymentsSummary as jest.Mock).mockReturnValue({ data: undefined, isLoading: false, isError: true });
    await renderPage();

    expect(screen.getByText('Could not load payments.')).toBeInTheDocument();
    expect(screen.getAllByText('The chart could not be loaded.')).toHaveLength(2);
    expect(screen.queryByText('0.00')).not.toBeInTheDocument();
  });

  it('asks for the series by week when Weekly is chosen, with Daily open for any range', async () => {
    await renderPage();

    expect(screen.getByRole('button', { name: 'Daily' })).toBeEnabled();
    fireEvent.click(screen.getByRole('button', { name: 'Weekly' }));

    expect(hooks.usePaymentsSummary).toHaveBeenLastCalledWith(expect.objectContaining({ granularity: 'week' }));
  });

  it('labels the kept data by its own granularity while a new one loads, with no duplicate keys', async () => {
    const day = (period: string) => ({ ...summary.series[0], period });
    // Weekly is chosen, but the previous (daily) series is still on screen.
    (hooks.usePaymentsSummary as jest.Mock).mockReturnValue({
      data: { ...summary, granularity: 'day', series: [day('2026-07-01'), day('2026-07-02')] },
      isLoading: false,
      isError: false,
    });
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    await renderPage();
    fireEvent.click(screen.getByRole('button', { name: 'Weekly' }));

    expect(screen.getAllByText('Jul 1, 2026').length).toBeGreaterThan(0);
    expect(errors.mock.calls.some(([message]) => String(message).includes('same key'))).toBe(false);
    errors.mockRestore();
  });

  it('asks the summary for the partner chosen on Overview, and clears it when switching tabs', async () => {
    await renderPage();
    fireEvent.change(screen.getByLabelText('Partner'), { target: { value: 'TPA' } });

    expect(hooks.usePaymentsSummary).toHaveBeenLastCalledWith(expect.objectContaining({ org: 'TPA' }));

    await openTab('Payment history');
    expect(new URLSearchParams(window.location.search).has('org')).toBe(false);
    expect(hooks.usePaymentOrders).toHaveBeenLastCalledWith(expect.objectContaining({ org: undefined }));
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
    (hooks.usePaymentOrders as jest.Mock).mockReturnValue({
      data: {
        ...emptyPage,
        pagination: { ...emptyPage.pagination, count: 1 },
        results: [{
          id: 7,
          wordpressOrderId: 'wp-7',
          source: 'wordpress',
          status: 'completed',
          orderDate: '2026-09-10T10:00:00Z',
          userId: 5,
          username: 'buyer5',
          email: 'buyer5@example.com',
          actualPrice: '99999.99',
          discountTotal: '0.00',
          pricePaid: '45000000.00',
          partnerActualPrice: null,
          partnerDiscountAmount: null,
          partnerPricePaid: null,
          reason: '',
          enrolledBy: null,
          coupons: [],
          items: [],
        }],
      },
      isLoading: false,
      isError: false,
    });
    await renderPage();
    await openTab('Payment history');

    expect(screen.getByText('45M')).toBeInTheDocument();
    expect(screen.getByLabelText('SAR 45,000,000.00')).toBeInTheDocument();
    // The currency is in the header, not repeated in every cell.
    expect(screen.getByText('Revenue (SAR)')).toBeInTheDocument();
    expect(screen.queryByText(/^SAR /)).not.toBeInTheDocument();
    // Under 100,000 stays exact.
    expect(screen.getByText('99,999.99')).toBeInTheDocument();
  });

  describe('charts', () => {
    const point = (period: string) => ({ ...summary.series[0], period });
    const withSeries = (granularity: string, periods: string[]) => (
      (hooks.usePaymentsSummary as jest.Mock).mockReturnValue({
        data: { ...summary, granularity, series: periods.map(point) }, isLoading: false, isError: false,
      })
    );

    it('labels days with the year, so a range over a year end never repeats a label', async () => {
      const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
      withSeries('day', ['2025-12-30', '2026-12-30']);
      await renderPage();
      fireEvent.click(screen.getByRole('button', { name: 'Daily' }));

      expect(screen.getAllByText('Dec 30, 2025').length).toBeGreaterThan(0);
      expect(screen.getAllByText('Dec 30, 2026').length).toBeGreaterThan(0);
      expect(errors.mock.calls.some(([message]) => String(message).includes('same key'))).toBe(false);
      errors.mockRestore();
    });

    it('labels weeks with the year and months as before', async () => {
      withSeries('week', ['2026-07-06']);
      await renderPage();
      expect(screen.getAllByText('Week of Jul 6, 2026').length).toBeGreaterThan(0);
    });

    it('labels months with the month and year', async () => {
      withSeries('month', ['2026-07-01']);
      await renderPage();
      expect(screen.getAllByText('Jul 2026').length).toBeGreaterThan(0);
    });

    it('formats the money chart\'s axis and tooltip as amounts on a wider axis, and leaves the orders chart plain', async () => {
      await renderPage();

      const charts = screen.getAllByTestId('metric-chart');
      const byTitle = (title: string) => charts.find((chart) => chart.getAttribute('aria-label')?.startsWith(title));
      const collected = byTitle('Revenue over time') as HTMLElement;
      const orders = byTitle('Orders over time') as HTMLElement;

      expect(collected).toHaveAttribute('data-axis-sample', '1,234.50');
      expect(collected).toHaveAttribute('data-axis-width', '72');
      expect(orders).not.toHaveAttribute('data-axis-sample');
      expect(orders).not.toHaveAttribute('data-axis-width');
    });
  });

  describe('loading tiles', () => {
    it('are status regions with a translated label, so screen readers announce them', async () => {
      (hooks.usePaymentsSummary as jest.Mock).mockReturnValue({ data: undefined, isLoading: true, isError: false });
      await renderPage();

      const loaders = screen.getAllByRole('status', { name: 'Loading' });
      expect(loaders).toHaveLength(4);
      loaders.forEach((loader) => expect(loader).toHaveAttribute('aria-busy', 'true'));
    });
  });

  describe('URL', () => {
    const lastOrdersParams = () => {
      const { calls } = (hooks.usePaymentOrders as jest.Mock).mock;
      return calls[calls.length - 1][0];
    };

    it('keeps a partner from the URL that is not among the options, named by its short name', async () => {
      window.history.pushState({}, '', '/?tab=orders&org=ZZZ');
      await renderPage();

      expect(lastOrdersParams().org).toBe('ZZZ');
      expect(screen.getByText('Partner: ZZZ')).toBeInTheDocument();
    });

    it('names a partner from the URL by its organization name', async () => {
      window.history.pushState({}, '', '/?tab=orders&org=TPA');
      await renderPage();

      expect(screen.getByText('Partner: Org A')).toBeInTheDocument();
    });

    it('falls back to Overview for a tab that no longer exists', async () => {
      window.history.pushState({}, '', '/?tab=partners');
      await renderPage();

      expect(screen.getByRole('tab', { name: 'Overview', selected: true })).toBeInTheDocument();
    });

    it('follows the browser Back and Forward buttons between tabs', async () => {
      window.history.pushState({}, '', '/?tab=orders');
      await renderPage();
      expect(screen.getByRole('tab', { name: 'Payment history', selected: true })).toBeInTheDocument();

      act(() => {
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
      });
      await tabReady();

      expect(screen.getByRole('tab', { name: 'Overview', selected: true })).toBeInTheDocument();
    });

    it('does nothing when the tab already open is clicked, so its partner stays', async () => {
      window.history.pushState({}, '', '/?tab=orders&org=TPA');
      await renderPage();

      fireEvent.click(screen.getByRole('tab', { name: 'Payment history' }));

      expect(new URLSearchParams(window.location.search).get('org')).toBe('TPA');
      expect(screen.getByText('Partner: Org A')).toBeInTheDocument();
    });

    it('still clears the partner when another tab is opened', async () => {
      window.history.pushState({}, '', '/?tab=orders&org=TPA');
      await renderPage();

      await openTab('Overview');

      const params = new URLSearchParams(window.location.search);
      expect(params.has('tab')).toBe(false);
      expect(params.has('org')).toBe(false);
    });
  });

  describe('Clear all on Payment history', () => {
    it('clears the partner', async () => {
      window.history.pushState({}, '', '/?tab=orders&org=TPA');
      await renderPage();

      fireEvent.click(within(screen.getByRole('tabpanel')).getByRole('button', { name: 'Clear all' }));

      const params = new URLSearchParams(window.location.search);
      expect(params.get('tab')).toBe('orders');
      expect(params.has('org')).toBe(false);
      const { calls } = (hooks.usePaymentOrders as jest.Mock).mock;
      expect(calls[calls.length - 1][0]).toEqual(expect.objectContaining({ org: undefined }));
    });
  });

  describe('while the next figures load', () => {
    it('shows the loading state on the tiles and charts instead of the previous range\'s figures', async () => {
      (hooks.usePaymentsSummary as jest.Mock).mockReturnValue({
        data: summary, isLoading: false, isPlaceholderData: true, isFetching: true, isError: false,
      });
      await renderPage();

      expect(screen.queryByText('700.00')).not.toBeInTheDocument();
      expect(screen.queryByTestId('metric-chart')).not.toBeInTheDocument();
    });

    it('shows Payment history as loading, not as the previous page', async () => {
      (hooks.usePaymentOrders as jest.Mock).mockReturnValue({
        data: emptyPage, isLoading: false, isPlaceholderData: true, isFetching: true, isError: false,
      });
      await renderPage();
      await openTab('Payment history');

      expect(screen.getByLabelText('Loading data…')).toBeInTheDocument();
      expect(screen.queryByRole('table')).not.toBeInTheDocument();
    });
  });
});
