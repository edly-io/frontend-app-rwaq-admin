/**
 * The expanded row of By partner, By content, By learner and By coupon: the
 * orders behind the row, five at a time, with "View all" opening Payment
 * history narrowed the same way. Amounts follow what the row itself counts.
 * With a partner chosen the backend narrows each order to that partner's items
 * and totals them (partner* fields), so a partner's orders show only its part.
 */
import { Link } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { usePaymentOrders } from '../data/hooks';
import type { OrderRow, PaymentsParams } from '../data/types';
import messages from '../messages';
import {
  DetailTable, MoneyTd, ViewAllNote, formatDate,
} from './shared';

const SHOWN = 5;

/** What the expanded row is about. */
export type OrdersFocus =
  | { kind: 'partner'; org: string; orgName: string }
  | { kind: 'content'; key: string }
  | { kind: 'learner'; userId: number; org?: string }
  | { kind: 'coupon'; code: string; org?: string };

interface OrdersDetailProps {
  focus: OrdersFocus;
  params: PaymentsParams;
  onViewAll: () => void;
}

/** Adds decimal strings in whole cents, so a few items never add up to 99.99000000000001. */
const addAmounts = (amounts: string[]) => (
  amounts.reduce((total, amount) => total + Math.round(Number(amount) * 100), 0) / 100
).toFixed(2);

const BuyerCell = ({ order }: { order: OrderRow }) => (
  <td>
    <div className="rwaq-user-cell__name" title={order.username}>
      <Link to={`/users/${order.userId}`}>{order.username}</Link>
    </div>
    <div className="rwaq-user-cell__meta" title={order.email}>{order.email}</div>
  </td>
);

const OrdersDetail = ({ focus, params, onViewAll }: OrdersDetailProps) => {
  const intl = useIntl();
  const partnerOrg = focus.kind === 'content' ? undefined : focus.org;
  const { data, isLoading, isPlaceholderData } = usePaymentOrders({
    startDate: params.startDate,
    endDate: params.endDate,
    org: partnerOrg,
    content: focus.kind === 'content' ? focus.key : undefined,
    user: focus.kind === 'learner' ? focus.userId : undefined,
    couponCode: focus.kind === 'coupon' ? focus.code : undefined,
    source: 'wordpress',
    status: 'completed',
    // Count only orders the row counted: the row sums paid items, so a free order is not one of them.
    paid: true,
    ordering: '-order_date',
    page: 1,
    pageSize: SHOWN,
  });
  const orders = data?.results ?? [];
  // Kept rows from the previous request must not pass for this one's.
  const isPending = isLoading || isPlaceholderData;

  const titles = {
    partner: messages.partnerOrdersTitle,
    content: messages.contentOrdersTitle,
    learner: messages.learnerOrdersTitle,
    coupon: messages.couponOrdersTitle,
  };
  const title = intl.formatMessage(
    titles[focus.kind],
    focus.kind === 'partner' ? { org: focus.orgName } : {},
  );

  const headings = [
    intl.formatMessage(messages.colOrder),
    intl.formatMessage(messages.colDate),
    ...(focus.kind === 'learner' ? [] : [intl.formatMessage(messages.colBuyer)]),
    ...(focus.kind === 'partner' || focus.kind === 'learner' ? [intl.formatMessage(messages.colCourses)] : []),
    intl.formatMessage({
      partner: messages.colPaidForPartner,
      content: messages.colPaidForItem,
      learner: partnerOrg ? messages.colCollectedPartner : messages.colCollected,
      coupon: messages.colCouponDiscount,
    }[focus.kind]),
  ];

  const amount = (order: OrderRow) => {
    if (focus.kind === 'content') {
      // The same course can be in an order more than once.
      return addAmounts(order.items.filter((item) => item.key === focus.key).map((item) => item.pricePaid));
    }
    if (focus.kind === 'coupon') {
      // A code can have several lines in one order: a cart line and product lines.
      return addAmounts(order.coupons
        .filter((coupon) => coupon.code === focus.code)
        .map((coupon) => (partnerOrg ? coupon.partnerDiscountAmount : coupon.discountAmount) ?? '0'));
    }
    return partnerOrg ? order.partnerPricePaid : order.pricePaid;
  };

  return (
    <DetailTable>
      <h4 className="rwaq-section-title">{title}</h4>
      {isPending && <p className="text-muted mb-0">{intl.formatMessage(messages.loadingRows)}</p>}
      {!isPending && orders.length === 0 && (
        <p className="text-muted mb-0">{intl.formatMessage(messages.nothingHere)}</p>
      )}
      {!isPending && orders.length > 0 && (
        <table className="table table-sm mb-0">
          <thead>
            <tr>{headings.map((heading) => <th key={heading}>{heading}</th>)}</tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.wordpressOrderId}</td>
                <td>{formatDate(order.orderDate)}</td>
                {focus.kind !== 'learner' && <BuyerCell order={order} />}
                {(focus.kind === 'partner' || focus.kind === 'learner') && <td>{order.items.length}</td>}
                <MoneyTd value={amount(order)} />
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {!isPending && (
        <ViewAllNote shown={orders.length} total={data?.pagination?.count ?? orders.length} onViewAll={onViewAll} />
      )}
    </DetailTable>
  );
};

export default OrdersDetail;
