/**
 * A tab whose code fails to load (a dropped connection, or a deploy that
 * replaced the chunk) shows a reload prompt in place of the tab. The tab row
 * and the other tabs keep working.
 *
 * Its own file because the Payment history module is mocked to throw for the
 * whole file.
 */
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { logError } from '@edx/frontend-platform/logging';
import { renderWrapper } from '@src/setupTest';
import * as whoami from '@src/data/whoami';
import * as hooks from './data/hooks';
import PaymentsPage from './PaymentsPage';

jest.mock('@src/data/whoami', () => ({ useAdminCapabilities: jest.fn() }));

jest.mock('@edx/frontend-platform/logging', () => ({ logError: jest.fn() }));

jest.mock('./data/hooks', () => ({
  usePaymentsSummary: jest.fn(),
  usePaymentOrders: jest.fn(),
  usePaymentPartners: jest.fn(),
  usePaymentContent: jest.fn(),
  usePaymentLearners: jest.fn(),
  usePaymentCoupons: jest.fn(),
  useDownloadPaymentsCsv: jest.fn(),
}));

// What a failed dynamic import looks like to React.lazy: the import promise rejects.
jest.mock('./components/OrdersTab', () => {
  throw new Error('Loading chunk 42 failed.');
});

jest.mock('@src/components/charts/MetricChart', () => ({
  __esModule: true,
  default: () => <div data-testid="metric-chart" />,
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
  series: [],
};

const tabReady = () => waitFor(() => expect(screen.queryByTestId('tab-loading')).not.toBeInTheDocument());

beforeEach(() => {
  window.history.pushState({}, '', '/');
  (logError as jest.Mock).mockClear();
  (whoami.useAdminCapabilities as jest.Mock).mockReturnValue({ data: { isSuperuser: true }, isLoading: false });
  (hooks.usePaymentsSummary as jest.Mock).mockReturnValue({ data: summary, isLoading: false, isError: false });
  [hooks.usePaymentPartners, hooks.usePaymentContent, hooks.usePaymentLearners, hooks.usePaymentCoupons]
    .forEach((hook) => (hook as jest.Mock).mockReturnValue({ data: emptyPage, isLoading: false, isError: false }));
  (hooks.useDownloadPaymentsCsv as jest.Mock).mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
});

describe('a tab that fails to load', () => {
  it('shows the error with a Reload button in place of the tab, and logs it', async () => {
    // React reports a caught render error to the console as well.
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    renderWrapper(<PaymentsPage />);
    await tabReady();

    fireEvent.click(screen.getByRole('tab', { name: 'Payment history' }));

    expect(await screen.findByText('Could not load payments.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reload' })).toBeEnabled();
    expect(logError).toHaveBeenCalledWith(expect.objectContaining({ message: 'Loading chunk 42 failed.' }));
    errors.mockRestore();
  });

  it('keeps the tab row and the other tabs working', async () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    renderWrapper(<PaymentsPage />);
    await tabReady();
    fireEvent.click(screen.getByRole('tab', { name: 'Payment history' }));
    await screen.findByText('Could not load payments.');

    fireEvent.click(screen.getByRole('tab', { name: 'By partner' }));
    await tabReady();

    expect(screen.getByRole('tab', { name: 'By partner', selected: true })).toBeInTheDocument();
    expect(screen.getByText('Partner payout = amount collected x the partner\'s share %', { exact: false }))
      .toBeInTheDocument();
    fireEvent.click(screen.getByRole('tab', { name: 'Overview' }));
    expect(screen.getByText('700.00')).toBeInTheDocument();
    errors.mockRestore();
  });
});
