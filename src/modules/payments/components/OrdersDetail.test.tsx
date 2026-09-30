/**
 * The expanded row under By partner, By content, By learner and By coupon:
 * what it asks for, and which amount it shows for each kind of row.
 *
 * The hooks are mocked, so each test hands over the orders the backend would
 * return: whole-order figures, plus partner* figures when it was asked for a
 * partner.
 */
import { fireEvent, screen, within } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import OrdersDetail from './OrdersDetail';
import type { OrdersFocus } from './OrdersDetail';

jest.mock('../data/hooks', () => ({ usePaymentOrders: jest.fn() }));

const item = (key: string, pricePaid: string, org = 'TPA') => ({
  type: 'course',
  key,
  programUuid: null,
  title: key,
  org,
  actualPrice: pricePaid,
  discountAmount: '0.00',
  pricePaid,
  revokedAt: null,
  revokeReason: '',
});

const coupon = (amount: string, partnerAmount: string | null, extra = {}) => ({
  code: 'SAVE10',
  scope: 'cart',
  discountType: 'amount',
  value: '10',
  courseId: null,
  programKey: null,
  discountAmount: amount,
  partnerDiscountAmount: partnerAmount,
  ...extra,
});

const order = (overrides = {}) => ({
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
  coupons: [],
  items: [],
  ...overrides,
});

const pageOf = (orders: unknown[], count = orders.length) => ({
  pagination: {
    count, numPages: 1, next: null, previous: null,
  },
  results: orders,
});

const mockOrders = (orders: unknown[], extra = {}, count = orders.length) => (
  (hooks.usePaymentOrders as jest.Mock).mockReturnValue({
    data: pageOf(orders, count), isLoading: false, isPlaceholderData: false, ...extra,
  })
);

const renderDetail = (focus: OrdersFocus, onViewAll = jest.fn()) => {
  renderWrapper(<OrdersDetail focus={focus} params={{ startDate: '2026-09-01' }} onViewAll={onViewAll} />);
  return onViewAll;
};

const lastQuery = () => {
  const { calls } = (hooks.usePaymentOrders as jest.Mock).mock;
  return calls[calls.length - 1][0];
};

/** The text of the cells in the first body row. */
const firstRowCells = () => within(screen.getAllByRole('row')[1]).getAllByRole('cell').map((cell) => cell.textContent);

beforeEach(() => jest.resetAllMocks());

describe('OrdersDetail request', () => {
  it.each([
    ['partner', { kind: 'partner', org: 'TPA', orgName: 'Org A' }, { org: 'TPA' }],
    ['content', { kind: 'content', key: 'course-v1:TPA+C1+2026' }, { content: 'course-v1:TPA+C1+2026' }],
    ['learner', { kind: 'learner', userId: 5 }, { user: 5 }],
    ['learner under a partner', { kind: 'learner', userId: 5, org: 'TPA' }, { user: 5, org: 'TPA' }],
    ['coupon', { kind: 'coupon', code: 'SAVE10' }, { couponCode: 'SAVE10' }],
    ['coupon under a partner', { kind: 'coupon', code: 'SAVE10', org: 'TPA' }, { couponCode: 'SAVE10', org: 'TPA' }],
  ] as [string, OrdersFocus, Record<string, unknown>][])(
    'asks for paid completed purchases, narrowed the way the %s row is',
    (_name, focus, expected) => {
      mockOrders([]);
      renderDetail(focus);

      expect(lastQuery()).toEqual(expect.objectContaining({
        ...expected, paid: true, source: 'wordpress', status: 'completed', startDate: '2026-09-01', pageSize: 5, page: 1,
      }));
    },
  );

  it('asks for no partner from a content or a whole-learner row', () => {
    mockOrders([]);
    renderDetail({ kind: 'content', key: 'k' });
    expect(lastQuery().org).toBeUndefined();

    renderDetail({ kind: 'learner', userId: 5 });
    expect(lastQuery().org).toBeUndefined();
  });
});

describe('OrdersDetail amounts', () => {
  it('shows the partner\'s part of the order for a partner row, and counts only its items', () => {
    mockOrders([order({
      items: [item('c1', '100.00')], partnerActualPrice: '100.00', partnerDiscountAmount: '6.67', partnerPricePaid: '93.33',
    })]);
    renderDetail({ kind: 'partner', org: 'TPA', orgName: 'Org A' });

    // Order, date, buyer, items, amount for this partner. The whole-order 140.00 is not shown.
    expect(firstRowCells()).toEqual(['wp-7', expect.any(String), 'buyer5buyer5@example.com', '1', '93.33']);
    expect(screen.getByText('Amount for this partner (SAR)')).toBeInTheDocument();
  });

  it('shows a partner amount of 0.00 as 0.00, not the whole-order amount', () => {
    mockOrders([order({
      items: [item('c1', '0.00')], partnerActualPrice: '50.00', partnerDiscountAmount: '50.00', partnerPricePaid: '0.00',
    })]);
    renderDetail({ kind: 'partner', org: 'TPA', orgName: 'Org A' });

    expect(firstRowCells().pop()).toBe('0.00');
  });

  it('shows the learner\'s whole order without a partner and the partner part with one', () => {
    mockOrders([order({ items: [item('c1', '100.00'), item('c2', '40.00', 'TPB')] })]);
    renderDetail({ kind: 'learner', userId: 5 });

    expect(firstRowCells()).toEqual(['wp-7', expect.any(String), '2', '140.00']);
    expect(screen.getByText('Amount collected (SAR)')).toBeInTheDocument();
  });

  it('shows the learner\'s amount for one partner, with that partner\'s items counted, under a partner', () => {
    mockOrders([order({
      items: [item('c1', '100.00')], partnerActualPrice: '100.00', partnerDiscountAmount: '0.00', partnerPricePaid: '100.00',
    })]);
    renderDetail({ kind: 'learner', userId: 5, org: 'TPA' });

    expect(firstRowCells()).toEqual(['wp-7', expect.any(String), '1', '100.00']);
    expect(screen.getByText('Amount collected (SAR, this partner)')).toBeInTheDocument();
  });

  it('adds up every item of the row\'s course in an order, including a free one', () => {
    mockOrders([order({
      items: [item('c1', '40.10'), item('c2', '99.00'), item('c1', '0.20'), item('c1', '0.00')],
    })]);
    renderDetail({ kind: 'content', key: 'c1' });

    // 40.10 + 0.20 + 0.00 in cents, not 40.300000000000004, and not just the first match.
    expect(firstRowCells().pop()).toBe('40.30');
  });

  it('shows 0.00 for a content row whose only item was free', () => {
    mockOrders([order({ items: [item('c1', '0.00')] })]);
    renderDetail({ kind: 'content', key: 'c1' });

    expect(firstRowCells().pop()).toBe('0.00');
  });

  it('shows the whole discount of a coupon without a partner, adding its lines', () => {
    mockOrders([order({
      coupons: [
        coupon('0.10', null),
        coupon('0.20', null, { scope: 'product', courseId: 'c1' }),
        coupon('5.00', null, { code: 'OTHER' }),
      ],
    })]);
    renderDetail({ kind: 'coupon', code: 'SAVE10' });

    // 0.1 + 0.2 is 0.30000000000000004 in floats.
    expect(firstRowCells().pop()).toBe('0.30');
  });

  it('shows the coupon\'s part on the partner\'s items under a partner, not the whole discount', () => {
    mockOrders([order({
      coupons: [coupon('10.00', '4.00'), coupon('5.00', '5.00', { scope: 'product', courseId: 'c1' })],
    })]);
    renderDetail({ kind: 'coupon', code: 'SAVE10', org: 'TPA' });

    expect(firstRowCells().pop()).toBe('9.00');
  });
});

describe('OrdersDetail loading', () => {
  it('shows the loading text instead of the previous request\'s rows while the next one loads', () => {
    mockOrders([order({ items: [item('c1', '100.00')] })], { isPlaceholderData: true });
    renderDetail({ kind: 'content', key: 'c1' });

    expect(screen.getByText('Loading…')).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'View all' })).not.toBeInTheDocument();
  });

  it('says so when there is nothing for the period', () => {
    mockOrders([]);
    renderDetail({ kind: 'content', key: 'c1' });

    expect(screen.getByText('Nothing to show for this period.')).toBeInTheDocument();
  });

  it('offers View all when there are more orders than shown', () => {
    mockOrders([order({ items: [item('c1', '100.00')] })], {}, 12);
    const onViewAll = renderDetail({ kind: 'content', key: 'c1' });

    expect(screen.getByText('Showing 1 of 12.')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'View all' }));
    expect(onViewAll).toHaveBeenCalledTimes(1);
  });
});
