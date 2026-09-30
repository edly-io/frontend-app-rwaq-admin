/**
 * The expanded row of By partner, By content, By learner and By coupon: the
 * orders behind the row, five at a time, with "View all" opening Payment
 * history narrowed the same way. Amounts follow what the row itself counts,
 * so a partner's orders show only that partner's items.
 */
import { Link } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import { usePaymentOrders } from '../data/hooks';
import type { OrderItem, OrderRow, PaymentsParams } from '../data/types';
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
  | { kind: 'coupon'; code: string };

interface OrdersDetailProps {
  focus: OrdersFocus;
  params: PaymentsParams;
  onViewAll: () => void;
}

const sameOrg = (a: string, b: string) => a.toLowerCase() === b.toLowerCase();
const toAmount = (cents: number) => (Math.round(cents * 100) / 100).toFixed(2);
const sum = (items: OrderItem[]) => toAmount(items.reduce((total, item) => total + Number(item.pricePaid), 0));

/** The items of an order that count for this row: one partner's, or all of them. */
const itemsFor = (order: OrderRow, org?: string) => (
  org ? order.items.filter((item) => sameOrg(item.org, org)) : order.items
);

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
  const partnerOrg = focus.kind === 'partner' || focus.kind === 'learner' ? focus.org : undefined;
  const { data, isLoading } = usePaymentOrders({
    startDate: params.startDate,
    endDate: params.endDate,
    org: partnerOrg,
    content: focus.kind === 'content' ? focus.key : undefined,
    user: focus.kind === 'learner' ? focus.userId : undefined,
    couponCode: focus.kind === 'coupon' ? focus.code : undefined,
    source: 'wordpress',
    status: 'completed',
    ordering: '-order_date',
    page: 1,
    pageSize: SHOWN,
  });
  const orders = data?.results ?? [];

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
      learner: messages.colCollected,
      coupon: messages.colCouponDiscount,
    }[focus.kind]),
  ];

  const amount = (order: OrderRow) => {
    if (focus.kind === 'content') {
      return order.items.find((item) => item.key === focus.key)?.pricePaid;
    }
    if (focus.kind === 'coupon') {
      return toAmount(order.coupons
        .filter((coupon) => coupon.code === focus.code)
        .reduce((total, coupon) => total + Number(coupon.discountAmount), 0));
    }
    return partnerOrg ? sum(itemsFor(order, partnerOrg)) : order.pricePaid;
  };

  return (
    <DetailTable>
      <h4 className="rwaq-section-title">{title}</h4>
      {isLoading && <p className="text-muted mb-0">{intl.formatMessage(messages.loadingRows)}</p>}
      {!isLoading && orders.length === 0 && (
        <p className="text-muted mb-0">{intl.formatMessage(messages.nothingHere)}</p>
      )}
      {orders.length > 0 && (
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
                {(focus.kind === 'partner' || focus.kind === 'learner')
                  && <td>{itemsFor(order, partnerOrg).length}</td>}
                <MoneyTd value={amount(order)} />
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <ViewAllNote shown={orders.length} total={data?.pagination?.count ?? orders.length} onViewAll={onViewAll} />
    </DetailTable>
  );
};

export default OrdersDetail;
