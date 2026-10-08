/**
 * Payment history — every order, one row each. A row opens to show its
 * courses and programs (linked to their detail pages) and its coupons.
 *
 * Shows every order, purchases and admin grants (free enrollments). The Source
 * filter narrows it to one of them.
 *
 * With a partner chosen, a row shows that partner's part of the order only:
 * its items, and the amounts the backend sums over them (partner* fields).
 */
import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import ErrorState from '@src/components/ErrorState';
import InfoTooltip from '@src/components/InfoTooltip';
import SearchFilterBar from '@src/components/SearchFilterBar';
import type { AppliedChip } from '@src/components/SearchFilterBar';
import { getErrorStatus } from '@src/data/httpError';
import { usePaymentOrders } from '../data/hooks';
import type {
  OrderItem, OrderListParams, OrderRow, OrderSource,
} from '../data/types';
import messages from '../messages';
import {
  CsvButton, DateFilter, DetailTable, PAGE_SIZE, TabCard, TabHeading, formatDateTime, MoneyCell, MoneyTd,
  formatMoney, listScope, tablePagination, useDateRange, useListState, usePartnerFilter,
} from './shared';
import type { ListTabProps } from './shared';

const boldText = (chunks: ReactNode[]) => <strong>{chunks}</strong>;

const DEFAULT_ORDERING = '-order_date';

/** The existing detail page for a course or program. A subscription has none. */
const contentPath = (item: OrderItem): string | null => {
  if (item.type === 'subscription' || !item.key) { return null; }
  if (item.type === 'program') { return item.programUuid ? `/programs/${item.programUuid}` : null; }
  return `/courses/${encodeURIComponent(item.key)}`;
};

interface OrdersTabProps extends ListTabProps {
  /** Only the payments and grants of this subscription (from the URL). */
  subscription?: number;
  onSubscriptionChange?: (id?: number) => void;
  /** Clears the partner and the subscription in the URL in one update (two separate ones overwrite each other). */
  onClearUrlFilters?: () => void;
}

const OrdersTab = ({
  org, onOrgChange, subscription, onSubscriptionChange, onClearUrlFilters,
}: OrdersTabProps) => {
  const intl = useIntl();
  const dates = useDateRange();
  const params = { org: org || undefined, startDate: dates.startDate, endDate: dates.endDate };
  const list = useListState(
    DEFAULT_ORDERING,
    { source: '', coupon: '', type: '' },
    listScope(org, dates.startDate, dates.endDate, subscription ? String(subscription) : ''),
  );
  const partner = usePartnerFilter(params, onOrgChange);
  // Under a partner the backend narrows each order to that partner's items and totals them separately.
  const hasPartner = Boolean(params.org);
  const listParams: OrderListParams = {
    ...params,
    source: (list.filters.source || undefined) as OrderSource | undefined,
    coupon: (list.filters.coupon || undefined) as OrderListParams['coupon'],
    type: (list.filters.type || undefined) as OrderListParams['type'],
    subscription,
    search: list.search || undefined,
    ordering: list.ordering,
    page: list.page,
    pageSize: PAGE_SIZE,
  };
  const {
    data, isLoading, isPlaceholderData, isError, error, refetch,
  } = usePaymentOrders(listParams);

  const sourceOptions = [
    { value: '', label: intl.formatMessage(messages.filterAll) },
    { value: 'wordpress', label: intl.formatMessage(messages.sourceWordpress) },
    { value: 'admin', label: intl.formatMessage(messages.sourceAdmin) },
  ];
  const typeOptions = [
    { value: '', label: intl.formatMessage(messages.filterAll) },
    { value: 'content', label: intl.formatMessage(messages.typeFilterContent) },
    { value: 'subscription', label: intl.formatMessage(messages.typeFilterSubscription) },
  ];
  const planLabel = (plan: string | null) => {
    if (plan === 'monthly') { return intl.formatMessage(messages.planMonthly); }
    if (plan === 'yearly') { return intl.formatMessage(messages.planYearly); }
    return plan ?? '';
  };
  const itemTitle = (item: OrderItem) => (
    item.type === 'subscription'
      ? intl.formatMessage(messages.itemSubscription, { plan: planLabel(item.plan) })
      : item.title
  );
  const itemTypeLabel = (item: OrderItem) => intl.formatMessage({
    program: messages.typeProgram, subscription: messages.typeSubscription, course: messages.typeCourse,
  }[item.type]);
  const formatDate = (value: string) => intl.formatDate(value, { dateStyle: 'medium', timeZone: 'UTC' });
  const couponOptions = [
    { value: '', label: intl.formatMessage(messages.couponAny) },
    { value: 'with', label: intl.formatMessage(messages.couponWith) },
    { value: 'without', label: intl.formatMessage(messages.couponWithout) },
  ];
  const sortOptions = [
    { value: '-order_date', label: intl.formatMessage(messages.sortDateDesc) },
    { value: 'order_date', label: intl.formatMessage(messages.sortDateAsc) },
    { value: '-price_paid', label: intl.formatMessage(messages.sortPaidDesc) },
  ];
  const optionLabel = (options: { value: string; label: string }[], value: string) => (
    options.find((o) => o.value === value)?.label ?? value
  );

  const chips: AppliedChip[] = [];
  if (list.search) {
    chips.push({
      key: 'search',
      label: intl.formatMessage(messages.chipSearch, { term: list.search }),
      onRemove: () => list.setSearch(''),
    });
  }
  if (partner.chip) { chips.push(partner.chip); }
  if (list.filters.source) {
    chips.push({
      key: 'source',
      label: intl.formatMessage(messages.chipSource, { label: optionLabel(sourceOptions, list.filters.source) }),
      onRemove: () => list.setFilter('source', ''),
    });
  }
  if (list.filters.coupon) {
    chips.push({
      key: 'coupon',
      label: intl.formatMessage(messages.chipCoupon, { label: optionLabel(couponOptions, list.filters.coupon) }),
      onRemove: () => list.setFilter('coupon', ''),
    });
  }
  if (list.filters.type) {
    chips.push({
      key: 'type',
      label: intl.formatMessage(messages.chipType, { label: optionLabel(typeOptions, list.filters.type) }),
      onRemove: () => list.setFilter('type', ''),
    });
  }
  if (subscription) {
    // The first row names the learner and plan. Until it loads the chip shows the id.
    const first = data?.results[0];
    const firstItem = first?.items.find((item) => item.subscriptionId === subscription);
    chips.push({
      key: 'subscription',
      label: intl.formatMessage(messages.chipSubscription, {
        label: first && firstItem ? `${first.username}, ${planLabel(firstItem.plan)}` : `#${subscription}`,
      }),
      onRemove: () => onSubscriptionChange?.(undefined),
    });
  }
  if (!list.isDefaultOrdering) {
    chips.push({
      key: 'ordering',
      label: intl.formatMessage(messages.chipSort, { label: optionLabel(sortOptions, list.ordering) }),
      onRemove: () => list.setOrdering(''),
    });
  }

  const columns: ColumnDef<OrderRow>[] = [
    {
      label: intl.formatMessage(messages.colOrder),
      info: intl.formatMessage(messages.infoColOrder),
      key: 'wordpressOrderId',
      renderCell: (_value, row) => (
        <span className="rwaq-user-cell__name">
          {row.wordpressOrderId ?? intl.formatMessage(messages.adminOrder, { id: row.id })}
        </span>
      ),
    },
    {
      label: intl.formatMessage(messages.colDate),
      info: intl.formatMessage(messages.infoColDate),
      key: 'orderDate',
      renderCell: (value) => formatDateTime(value as string, intl.locale),
    },
    {
      label: intl.formatMessage(messages.colBuyer),
      info: intl.formatMessage(messages.infoColBuyer),
      key: 'username',
      renderCell: (_value, row) => (
        <div className="min-width-0">
          <div className="rwaq-user-cell__name" title={row.username}>
            <Link to={`/users/${row.userId}`}>{row.username}</Link>
          </div>
          <div className="rwaq-user-cell__meta" title={row.email}>{row.email}</div>
        </div>
      ),
    },
    {
      label: intl.formatMessage(messages.colCourses),
      info: intl.formatMessage(messages.infoColCourses),
      headerClassName: 'rwaq-th--wrap',
      key: 'items',
      id: 'itemCount',
      renderCell: (_value, row) => row.items.length,
    },
    {
      label: intl.formatMessage(messages.colOrderValue),
      info: intl.formatMessage(hasPartner ? messages.infoColOrderPricePartner : messages.infoColOrderPrice),
      headerClassName: 'rwaq-th--wrap',
      key: hasPartner ? 'partnerActualPrice' : 'actualPrice',
      renderCell: (value) => <MoneyCell value={value as string} />,
    },
    {
      label: intl.formatMessage(messages.colDiscount),
      info: intl.formatMessage(hasPartner ? messages.infoColOrderDiscountPartner : messages.infoColOrderDiscount),
      headerClassName: hasPartner ? 'rwaq-th--wrap' : undefined,
      key: hasPartner ? 'partnerDiscountAmount' : 'discountTotal',
      renderCell: (value) => <MoneyCell value={value as string} />,
    },
    {
      label: intl.formatMessage(messages.colCollected),
      info: intl.formatMessage(hasPartner ? messages.infoColOrderPaidPartner : messages.infoColOrderPaid),
      headerClassName: 'rwaq-th--wrap',
      key: hasPartner ? 'partnerPricePaid' : 'pricePaid',
      renderCell: (value) => <MoneyCell value={value as string} strong />,
    },
    {
      label: intl.formatMessage(messages.colSource),
      info: intl.formatMessage(messages.infoColSource),
      key: 'source',
      renderCell: (value) => <Badge variant="light">{optionLabel(sourceOptions, value as string)}</Badge>,
    },
  ];

  const renderDetails = (order: OrderRow) => (
    <DetailTable>
      <h4 className="rwaq-section-title">{intl.formatMessage(messages.itemsTitle)}</h4>
      <table className="table table-sm mb-3">
        <thead>
          <tr>
            <th>{intl.formatMessage(messages.colContent)}</th>
            <th>{intl.formatMessage(messages.colType)}</th>
            <th>{intl.formatMessage(messages.colOrg)}</th>
            <th>{intl.formatMessage(messages.colPrice)}</th>
            <th>{intl.formatMessage(messages.colDiscount)}</th>
            <th>{intl.formatMessage(messages.colPaid)}</th>
          </tr>
        </thead>
        <tbody>
          {order.items.map((item, index) => {
            const path = contentPath(item);
            return (
              // The same course can appear twice in one order, so the key alone is not unique.
              // eslint-disable-next-line react/no-array-index-key
              <tr key={`${item.key ?? item.subscriptionId}-${index}`}>
                <td>
                  <div className="rwaq-user-cell__name">
                    {path ? <Link to={path}>{itemTitle(item)}</Link> : itemTitle(item)}
                    {item.revokedAt && (
                      <InfoTooltip
                        text={intl.formatMessage(messages.infoRevoked, {
                          date: formatDateTime(item.revokedAt, intl.locale),
                          reason: item.revokeReason || '—',
                        })}
                      >
                        <Badge variant="warning" className="ml-2">{intl.formatMessage(messages.revoked)}</Badge>
                      </InfoTooltip>
                    )}
                  </div>
                  <div className="rwaq-user-cell__meta">
                    {item.type === 'subscription' && item.periodStartsAt && item.periodEndsAt
                      ? intl.formatMessage(messages.itemPeriod, {
                        start: formatDate(item.periodStartsAt), end: formatDate(item.periodEndsAt),
                      })
                      : item.key}
                  </div>
                </td>
                <td>{itemTypeLabel(item)}</td>
                <td>{item.org}</td>
                <MoneyTd value={item.actualPrice} />
                <MoneyTd value={item.discountAmount} />
                <MoneyTd value={item.pricePaid} />
              </tr>
            );
          })}
        </tbody>
      </table>
      <h4 className="rwaq-section-title">{intl.formatMessage(messages.couponsTitle)}</h4>
      {order.coupons.length === 0 ? (
        <p className="text-muted mb-0">{intl.formatMessage(messages.noCoupons)}</p>
      ) : (
        <ul className="mb-0">
          {order.coupons.map((coupon) => (
            <li key={`${coupon.code}-${coupon.courseId ?? coupon.programKey ?? 'cart'}`}>
              {intl.formatMessage(messages.couponLine, {
                code: coupon.code,
                value: coupon.discountType === 'percentage'
                  ? `${Number(coupon.value)}%`
                  : formatMoney(intl, coupon.value),
                target: coupon.courseId ?? coupon.programKey ?? intl.formatMessage(messages.couponCart),
                // Under a partner, the part of the coupon that fell on that partner's items.
                amount: formatMoney(intl, hasPartner ? coupon.partnerDiscountAmount : coupon.discountAmount),
              })}
            </li>
          ))}
        </ul>
      )}
      {order.enrolledBy && (
        <p className="text-muted mt-3 mb-0">
          {intl.formatMessage(messages.adminEnrolledBy, {
            admin: `${order.enrolledBy.username} (${order.enrolledBy.email})`,
            b: boldText,
          })}
        </p>
      )}
      {order.reason && (
        <p className={`text-muted mb-0 ${order.enrolledBy ? '' : 'mt-3'}`}>
          {intl.formatMessage(messages.adminReason, { reason: order.reason, b: boldText })}
        </p>
      )}
    </DetailTable>
  );

  return (
    <TabCard>
      <TabHeading
        title={intl.formatMessage(messages.tabOrders)}
        info={intl.formatMessage(messages.infoOrdersTab)}
        how={intl.formatMessage(messages.howOrders)}
      />
      <SearchFilterBar
        searchTerm={list.search}
        onSearch={list.setSearch}
        searchPlaceholder={intl.formatMessage(messages.ordersSearch)}
        filterGroups={[
          partner.group,
          {
            id: 'source',
            label: intl.formatMessage(messages.sourceLabel),
            value: list.filters.source,
            options: sourceOptions,
            onChange: (value) => list.setFilter('source', value),
          },
          {
            id: 'type',
            label: intl.formatMessage(messages.typeFilterLabel),
            value: list.filters.type,
            options: typeOptions,
            onChange: (value) => list.setFilter('type', value),
          },
          {
            id: 'coupon',
            label: intl.formatMessage(messages.couponFilterLabel),
            value: list.filters.coupon,
            options: couponOptions,
            onChange: (value) => list.setFilter('coupon', value),
          },
          {
            id: 'ordering',
            label: intl.formatMessage(messages.sortLabel),
            value: list.ordering,
            options: sortOptions,
            onChange: list.setOrdering,
          },
        ]}
        appliedChips={chips}
        onClearAll={() => {
          list.clearAll();
          if (onClearUrlFilters) { onClearUrlFilters(); } else { onOrgChange(''); }
          dates.setRange();
        }}
        actions={(
          <>
            <DateFilter range={dates} />
            <CsvButton report="orders" params={listParams} />
          </>
        )}
      />
      {isError ? (
        <ErrorState
          statusCode={getErrorStatus(error) || undefined}
          title={intl.formatMessage(messages.errorTitle)}
          onRetry={() => refetch()}
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={data?.results ?? []}
          isLoading={isLoading || isPlaceholderData}
          caption={intl.formatMessage(messages.tabOrders)}
          pagination={tablePagination(data, list.page, list.setPage)}
          renderRowSubComponent={renderDetails}
        />
      )}
    </TabCard>
  );
};

export default OrdersTab;
