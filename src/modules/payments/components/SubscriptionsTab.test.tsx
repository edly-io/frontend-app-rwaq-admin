/**
 * Subscriptions tab: the KPI labels, and the payments listed under an opened row with a link to
 * the payment history filtered to that subscription.
 *
 * The hooks are mocked, so each test hands over what the backend would return.
 */
import { fireEvent, screen, within } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import SubscriptionsTab from './SubscriptionsTab';

jest.mock('../data/hooks', () => ({
  usePaymentSubscriptions: jest.fn(),
  useSubscriptionsSummary: jest.fn(),
  usePaymentOrders: jest.fn(),
  useDownloadPaymentsCsv: jest.fn(),
}));

const row = {
  id: 4,
  learner: 'buyer5',
  email: 'buyer5@example.com',
  plan: 'monthly',
  source: 'wordpress',
  status: 'active',
  startsAt: '2026-08-10T10:00:00Z',
  endsAt: '2026-10-10T10:00:00Z',
  payments: 2,
  netPaid: '190.00',
  discounts: '10.00',
};

const payment = (id: number, day: number) => ({
  id,
  wordpressOrderId: `wp-${id}`,
  orderDate: `2026-09-${String(day).padStart(2, '0')}T10:00:00Z`,
  pricePaid: '90.00',
  items: [{
    subscriptionId: 4,
    pricePaid: '90.00',
    periodStartsAt: `2026-09-${String(day).padStart(2, '0')}T10:00:00Z`,
    periodEndsAt: `2026-10-${String(day).padStart(2, '0')}T10:00:00Z`,
  }],
});

const page = (results: unknown[]) => ({
  data: { pagination: { count: results.length, numPages: 1 }, results },
  isLoading: false,
  isPlaceholderData: false,
  isError: false,
});

beforeEach(() => {
  jest.resetAllMocks();
  (hooks.usePaymentSubscriptions as jest.Mock).mockReturnValue(page([row]));
  (hooks.useSubscriptionsSummary as jest.Mock).mockReturnValue({
    data: {
      revenue: '1140.00', active: 5, expired: 2, cancelled: 1,
    },
    isLoading: false,
    isError: false,
  });
  (hooks.usePaymentOrders as jest.Mock).mockReturnValue({ data: undefined, isLoading: true, isError: false });
  (hooks.useDownloadPaymentsCsv as jest.Mock).mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
});

describe('Subscriptions KPI cards', () => {
  it('shows revenue and the active, expired and cancelled subscriptions with their counts', () => {
    renderWrapper(<SubscriptionsTab />);

    const card = (label: string) => (screen.getByText(label).closest('.rwaq-payment-kpi') as HTMLElement);
    expect(card('Subscription revenue')).toBeInTheDocument();
    expect(within(card('Active subscriptions')).getByText('5')).toBeInTheDocument();
    expect(within(card('Expired subscriptions')).getByText('2')).toBeInTheDocument();
    expect(within(card('Cancelled subscriptions')).getByText('1')).toBeInTheDocument();
    expect(screen.queryByText('Renewals')).not.toBeInTheDocument();
    expect(screen.queryByText('New subscriptions')).not.toBeInTheDocument();
    expect(document.querySelectorAll('.rwaq-payment-kpi')).toHaveLength(4);
  });

  it('has the date filter above the cards', () => {
    const { container } = renderWrapper(<SubscriptionsTab />);

    const toolbar = container.querySelector('.rwaq-overview__toolbar') as HTMLElement;
    const grid = container.querySelector('.rwaq-payment-grid') as HTMLElement;
    expect(grid.previousElementSibling).toBe(toolbar);
  });
});

describe('Subscriptions list', () => {
  it('asks for the latest start first', () => {
    renderWrapper(<SubscriptionsTab />);

    const { calls } = (hooks.usePaymentSubscriptions as jest.Mock).mock;
    expect(calls[calls.length - 1][0]).toEqual(expect.objectContaining({ ordering: '-starts_at' }));
  });

  it('shows the status and the source as chips, with the source column last', () => {
    renderWrapper(<SubscriptionsTab />);

    const cells = within(screen.getAllByRole('row')[1]).getAllByRole('cell');
    const status = within(cells[3]).getByText('Active');
    expect(status).toHaveClass('badge', 'badge-success');
    const source = within(cells[cells.length - 1]).getByText('WordPress');
    expect(source).toHaveClass('badge', 'badge-light');
    const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);
    expect(headers[headers.length - 1]).toMatch(/Source/);
  });
});

describe('Subscriptions expanded row', () => {
  const expand = () => fireEvent.click(screen.getAllByRole('button', { name: /expand/i })[0]);

  it('asks for the latest 5 payments of that subscription, newest first', () => {
    renderWrapper(<SubscriptionsTab />);
    expand();

    expect(hooks.usePaymentOrders).toHaveBeenCalledWith({
      subscription: 4, ordering: '-order_date', page: 1, pageSize: 5,
    });
  });

  it('lists the payments with their period and links to the filtered payment history', () => {
    (hooks.usePaymentOrders as jest.Mock).mockReturnValue(page([payment(12, 10), payment(11, 5)]));
    renderWrapper(<SubscriptionsTab />);
    expand();

    expect(screen.getByText('wp-12')).toBeInTheDocument();
    const paymentRow = screen.getByText('wp-11').closest('tr') as HTMLElement;
    expect(within(paymentRow).getByText('Sep 5, 2026 – Oct 5, 2026')).toBeInTheDocument();
    const link = screen.getByRole('link', { name: 'View all payments' });
    expect(link).toHaveAttribute('href', '/payments?tab=orders&subscription=4');
  });

  it('says so when there are no payments yet', () => {
    (hooks.usePaymentOrders as jest.Mock).mockReturnValue(page([]));
    renderWrapper(<SubscriptionsTab />);
    expand();

    expect(screen.getByText('No payments.')).toBeInTheDocument();
  });
});
