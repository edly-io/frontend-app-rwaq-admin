/**
 * Payment history: the amount columns and the expanded row, with and without a
 * partner chosen. Under a partner the backend narrows each order to that
 * partner's items and totals them in the partner* fields, and the table must
 * show those, not the whole order.
 *
 * The hooks are mocked, so each test hands over the orders the backend would
 * return.
 */
import { fireEvent, screen, within } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as orgHooks from '@src/modules/organizations/data/hooks';
import * as hooks from '../data/hooks';
import OrdersTab from './OrdersTab';

jest.mock('@src/modules/organizations/data/hooks', () => ({ useOrganizations: jest.fn() }));

jest.mock('../data/hooks', () => ({
  usePaymentOrders: jest.fn(),
  useDownloadPaymentsCsv: jest.fn(),
}));

const item = (key: string, pricePaid: string, extra = {}) => ({
  type: 'course',
  key,
  programUuid: null,
  title: `Title of ${key}`,
  org: 'TPA',
  actualPrice: pricePaid,
  discountAmount: '0.00',
  pricePaid,
  revokedAt: null,
  revokeReason: '',
  ...extra,
});

const cartCoupon = {
  code: 'SAVE10',
  scope: 'cart',
  discountType: 'amount',
  value: '10',
  courseId: null,
  programKey: null,
  discountAmount: '10.00',
  partnerDiscountAmount: null,
};

// A cart of 100 for TPA and 50 for TPB, a 10 cart coupon, 140 paid.
const wholeOrder = {
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
  discountTotal: '10.00',
  pricePaid: '140.00',
  partnerActualPrice: null,
  partnerDiscountAmount: null,
  partnerPricePaid: null,
  reason: '',
  enrolledBy: null,
  coupons: [cartCoupon],
  items: [
    item('course-v1:TPA+C1+2026', '93.33', { actualPrice: '100.00', discountAmount: '6.67' }),
    item('course-v1:TPB+C2+2026', '46.67', { org: 'TPB', actualPrice: '50.00', discountAmount: '3.33' }),
  ],
};

// The same order when the backend is asked for TPA: only its item, and its own totals.
const tpaOrder = {
  ...wholeOrder,
  partnerActualPrice: '100.00',
  partnerDiscountAmount: '6.67',
  partnerPricePaid: '93.33',
  coupons: [{ ...cartCoupon, partnerDiscountAmount: '6.67' }],
  items: [wholeOrder.items[0]],
};

const mockOrders = (orders: unknown[]) => (hooks.usePaymentOrders as jest.Mock).mockReturnValue({
  data: {
    pagination: {
      count: orders.length, numPages: 1, next: null, previous: null,
    },
    results: orders,
  },
  isLoading: false,
  isPlaceholderData: false,
  isError: false,
});

const renderTab = (org?: string, subscription?: number) => renderWrapper(
  <OrdersTab org={org} onOrgChange={jest.fn()} subscription={subscription} onSubscriptionChange={jest.fn()} />,
);

/** The text of each cell of the first body row, by the table's header text. */
const firstRow = () => {
  const headers = screen.getAllByRole('columnheader').map((header) => header.textContent);
  const cells = within(screen.getAllByRole('row')[1]).getAllByRole('cell').map((cell) => cell.textContent);
  return Object.fromEntries(headers.map((header, index) => [header, cells[index]]));
};

beforeEach(() => {
  jest.resetAllMocks();
  (orgHooks.useOrganizations as jest.Mock).mockReturnValue({ data: undefined });
  (hooks.useDownloadPaymentsCsv as jest.Mock).mockReturnValue({ mutateAsync: jest.fn(), isPending: false });
});

describe('Payment history amounts', () => {
  it('shows the whole order without a partner', () => {
    mockOrders([wholeOrder]);
    renderTab();

    const row = firstRow();
    expect(row.Items).toBe('2');
    expect(row['Order value (SAR)']).toBe('150.00');
    expect(row['Discount (SAR)']).toBe('10.00');
    expect(row['Revenue (SAR)']).toBe('140.00');
    expect(screen.queryByText(/this partner/)).not.toBeInTheDocument();
  });

  it('shows only the partner\'s part under a partner', () => {
    mockOrders([tpaOrder]);
    renderTab('TPA');

    const row = firstRow();
    expect(row.Items).toBe('1');
    expect(row['Order value (SAR)']).toBe('100.00');
    expect(row['Discount (SAR)']).toBe('6.67');
    expect(row['Revenue (SAR)']).toBe('93.33');
    // Nothing of the whole order is left in the row.
    expect(Object.values(row)).not.toContain('150.00');
    expect(Object.values(row)).not.toContain('140.00');
  });

  it('shows 0.00 when the partner\'s items were all free, not the whole-order amounts', () => {
    mockOrders([{
      ...tpaOrder,
      items: [item('course-v1:TPA+C1+2026', '0.00', { actualPrice: '100.00', discountAmount: '100.00' })],
      partnerActualPrice: '100.00',
      partnerDiscountAmount: '100.00',
      partnerPricePaid: '0.00',
    }]);
    renderTab('TPA');

    const row = firstRow();
    expect(row['Revenue (SAR)']).toBe('0.00');
    expect(row['Discount (SAR)']).toBe('100.00');
  });

  it('asks the backend for the partner', () => {
    mockOrders([tpaOrder]);
    renderTab('TPA');

    expect(hooks.usePaymentOrders).toHaveBeenCalledWith(expect.objectContaining({ org: 'TPA' }));
  });
});

describe('Payment history date', () => {
  const zone = process.env.TZ;
  afterEach(() => {
    if (zone === undefined) { delete process.env.TZ; } else { process.env.TZ = zone; }
  });

  it('shows the order\'s UTC date and time, the day the date filters count it in', () => {
    // Already the 11th in Auckland.
    process.env.TZ = 'Pacific/Auckland';
    mockOrders([{ ...wholeOrder, orderDate: '2026-09-10T20:00:00Z' }]);
    renderTab();

    expect(firstRow()['Date and time (UTC)']).toBe('Sep 10, 2026, 20:00');
  });

  it('says in the column\'s hover text that the date is in UTC', () => {
    mockOrders([wholeOrder]);
    renderTab();

    fireEvent.mouseOver(screen.getByText('Date and time (UTC)'));

    expect(screen.getByText(/When the order was paid, in UTC\./)).toBeInTheDocument();
  });
});

describe('Partner filter options', () => {
  it('asks for every active organization, not only the ones with sales in the date range', () => {
    mockOrders([wholeOrder]);
    renderTab();

    expect(orgHooks.useOrganizations).toHaveBeenCalledWith({ ordering: 'name', pageSize: 100 });
  });

  it('offers the organizations by name with their short name as the value', () => {
    (orgHooks.useOrganizations as jest.Mock).mockReturnValue({
      data: { results: [{ shortName: 'TPA', name: 'Org A' }] },
    });
    mockOrders([wholeOrder]);
    renderTab();

    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));

    expect(within(screen.getByLabelText('Partner')).getByRole('option', { name: 'Org A (TPA)' })).toHaveValue('TPA');
  });
});

describe('Payment history admin grants', () => {
  const grant = {
    ...wholeOrder,
    wordpressOrderId: null,
    source: 'admin' as const,
    reason: 'Sponsored cohort',
    enrolledBy: { id: 7, username: 'rwaq_admin', email: 'admin@rwaq.org' },
  };

  it('shows the reason and the admin who enrolled the learner in the expanded row', () => {
    mockOrders([grant]);
    renderTab();
    fireEvent.click(screen.getAllByRole('button', { name: /expand/i })[0]);

    expect(screen.getByText('Enrolled by:').tagName).toBe('STRONG');
    expect(screen.getByText('Enrolled by:').parentElement).toHaveTextContent('Enrolled by: rwaq_admin (admin@rwaq.org)');
    expect(screen.getByText('Reason:').tagName).toBe('STRONG');
    expect(screen.getByText('Reason:').parentElement).toHaveTextContent('Reason: Sponsored cohort');
    expect(screen.queryByRole('columnheader', { name: /^(Reason|Enrolled by)/ })).not.toBeInTheDocument();
  });
});

describe('Payment history expanded row', () => {
  const expand = () => fireEvent.click(screen.getAllByRole('button', { name: /expand/i })[0]);

  it('lists every item and the whole coupon without a partner', () => {
    mockOrders([wholeOrder]);
    renderTab();
    expand();

    expect(screen.getByText('Title of course-v1:TPA+C1+2026')).toBeInTheDocument();
    expect(screen.getByText('Title of course-v1:TPB+C2+2026')).toBeInTheDocument();
    expect(screen.getByText(/SAVE10: SAR 10.00 off the cart, SAR 10.00/)).toBeInTheDocument();
  });

  it('lists the partner\'s items and the coupon\'s part on them under a partner', () => {
    mockOrders([tpaOrder]);
    renderTab('TPA');
    expand();

    expect(screen.getByText('Title of course-v1:TPA+C1+2026')).toBeInTheDocument();
    expect(screen.queryByText('Title of course-v1:TPB+C2+2026')).not.toBeInTheDocument();
    expect(screen.getByText(/SAVE10: SAR 10.00 off the cart, SAR 6.67/)).toBeInTheDocument();
  });

  it('shows a free item as 0.00 in its row', () => {
    mockOrders([{ ...wholeOrder, items: [item('course-v1:TPA+C1+2026', '0.00')] }]);
    renderTab();
    expand();

    const itemRow = screen.getByText('Title of course-v1:TPA+C1+2026').closest('tr') as HTMLElement;
    expect(within(itemRow).getAllByRole('cell').map((cell) => cell.textContent).slice(-3)).toEqual(['0.00', '0.00', '0.00']);
  });

  it('shows the same course bought twice in one order as two rows, with no duplicate key warning', () => {
    const errors = jest.spyOn(console, 'error').mockImplementation(() => {});
    mockOrders([{
      ...wholeOrder,
      items: [item('course-v1:TPA+C1+2026', '40.00'), item('course-v1:TPA+C1+2026', '60.00')],
    }]);
    renderTab();
    expand();

    expect(screen.getAllByText('Title of course-v1:TPA+C1+2026')).toHaveLength(2);
    expect(errors.mock.calls.some(([message]) => String(message).includes('same key'))).toBe(false);
    errors.mockRestore();
  });
});

describe('Payment history subscription orders', () => {
  const subscriptionItem = {
    ...item('', '90.00'),
    type: 'subscription',
    key: null,
    title: 'monthly',
    org: '',
    subscriptionId: 4,
    plan: 'monthly',
    periodStartsAt: '2026-09-10T10:00:00Z',
    periodEndsAt: '2026-10-10T10:00:00Z',
  };
  const subscriptionOrder = {
    ...wholeOrder, id: 9, wordpressOrderId: 'wp-9', items: [subscriptionItem], coupons: [],
  };

  it('shows the plan and the period the payment bought in the expanded row', () => {
    mockOrders([subscriptionOrder]);
    renderTab();
    fireEvent.click(screen.getAllByRole('button', { name: /expand/i })[0]);

    const itemRow = screen.getByText('Subscription: Monthly').closest('tr') as HTMLElement;
    expect(within(itemRow).getByText('Period: Sep 10, 2026 to Oct 10, 2026')).toBeInTheDocument();
    expect(within(itemRow).getByText('Subscription')).toBeInTheDocument();
    expect(within(itemRow).queryByRole('link')).not.toBeInTheDocument();
  });

  it('asks for the chosen type', () => {
    mockOrders([subscriptionOrder]);
    renderTab();
    fireEvent.click(screen.getByRole('button', { name: 'Filters' }));
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'subscription' } });

    const { calls } = (hooks.usePaymentOrders as jest.Mock).mock;
    expect(calls[calls.length - 1][0]).toEqual(expect.objectContaining({ type: 'subscription' }));
  });

  it('asks for one subscription and shows a chip for it', () => {
    mockOrders([subscriptionOrder]);
    renderTab(undefined, 4);

    const { calls } = (hooks.usePaymentOrders as jest.Mock).mock;
    expect(calls[calls.length - 1][0]).toEqual(expect.objectContaining({ subscription: 4 }));
    expect(screen.getByText('Subscription: buyer5, Monthly')).toBeInTheDocument();
  });
});
