/**
 * Payment history — every order, one row each. A row opens to show its
 * courses and programs (linked to their detail pages) and its coupons.
 *
 * Defaults to WordPress purchases, the orders that are payments. The chip says
 * so, and removing it also shows admin grants (free enrollments).
 *
 * With a partner chosen, a row shows that partner's part of the order only:
 * its items, and the amounts the backend sums over them (partner* fields).
 */
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
import type { OrderListParams, OrderRow, OrderSource } from '../data/types';
import messages from '../messages';
import { contentPath } from './ContentTab';
import {
  CsvButton, DateFilter, DetailTable, PAGE_SIZE, TabCard, TabHeading, formatDateTime, MoneyCell, MoneyTd,
  formatMoney, listScope, tablePagination, useDateRange, useListState, usePartnerFilter,
} from './shared';
import type { ListTabProps, RangeHandoff } from './shared';

const DEFAULT_ORDERING = '-order_date';

interface OrdersTabProps extends ListTabProps {
  /** Set when arriving from a By content row: only orders that bought this course or program. */
  content?: string;
  contentTitle?: string;
  /** Set when arriving from By learner: only this buyer's orders. */
  user?: string;
  userTitle?: string;
  /** Set when arriving from By coupon: only orders that used exactly this code. */
  couponCode?: string;
  onFocusClear: () => void;
  /** Clears the partner and the focus in one URL update. Two updates in a row would undo each other. */
  onScopeClear: () => void;
  /** The range of the tab that opened this one with "View all". */
  range?: RangeHandoff;
}

const OrdersTab = ({
  org, onOrgChange, content, contentTitle, user, userTitle, couponCode, onFocusClear, onScopeClear, range,
}: OrdersTabProps) => {
  const intl = useIntl();
  const dates = useDateRange(range);
  const params = { org: org || undefined, startDate: dates.startDate, endDate: dates.endDate };
  const list = useListState(
    DEFAULT_ORDERING,
    { source: 'wordpress', coupon: '' },
    listScope(org, dates.startDate, dates.endDate, content, user, couponCode),
  );
  const partner = usePartnerFilter(params, onOrgChange);
  // Under a partner the backend narrows each order to that partner's items and totals them separately.
  const hasPartner = Boolean(params.org);
  const listParams: OrderListParams = {
    ...params,
    source: (list.filters.source || undefined) as OrderSource | undefined,
    coupon: (list.filters.coupon || undefined) as OrderListParams['coupon'],
    content: content || undefined,
    user: user ? Number(user) : undefined,
    couponCode: couponCode || undefined,
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
  if (content) {
    chips.push({
      key: 'content',
      label: intl.formatMessage(messages.chipContent, { title: contentTitle || content }),
      onRemove: onFocusClear,
    });
  }
  if (user) {
    chips.push({
      key: 'user',
      label: intl.formatMessage(messages.chipBuyer, { name: userTitle || user }),
      onRemove: onFocusClear,
    });
  }
  if (couponCode) {
    chips.push({
      key: 'couponCode',
      label: intl.formatMessage(messages.chipCouponCode, { code: couponCode }),
      onRemove: onFocusClear,
    });
  }
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
      label: intl.formatMessage(hasPartner ? messages.colOrderValuePartner : messages.colOrderValue),
      info: intl.formatMessage(hasPartner ? messages.infoColOrderPricePartner : messages.infoColOrderPrice),
      headerClassName: 'rwaq-th--wrap',
      key: hasPartner ? 'partnerActualPrice' : 'actualPrice',
      renderCell: (value) => <MoneyCell value={value as string} />,
    },
    {
      label: intl.formatMessage(hasPartner ? messages.colDiscountPartner : messages.colDiscount),
      info: intl.formatMessage(hasPartner ? messages.infoColOrderDiscountPartner : messages.infoColOrderDiscount),
      headerClassName: hasPartner ? 'rwaq-th--wrap' : undefined,
      key: hasPartner ? 'partnerDiscountAmount' : 'discountTotal',
      renderCell: (value) => <MoneyCell value={value as string} />,
    },
    {
      label: intl.formatMessage(hasPartner ? messages.colCollectedPartner : messages.colCollected),
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
    {
      label: intl.formatMessage(messages.colReason),
      info: intl.formatMessage(messages.infoColReason),
      key: 'reason',
      renderCell: (value) => <span className="rwaq-reason-cell">{value as string}</span>,
    },
    {
      label: intl.formatMessage(messages.colEnrolledBy),
      info: intl.formatMessage(messages.infoColEnrolledBy),
      key: 'enrolledBy',
      renderCell: (_value, row) => (row.enrolledBy ? (
        <div className="min-width-0">
          <div className="rwaq-user-cell__name" title={row.enrolledBy.username}>{row.enrolledBy.username}</div>
          <div className="rwaq-user-cell__meta" title={row.enrolledBy.email}>{row.enrolledBy.email}</div>
        </div>
      ) : null),
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
            const path = contentPath(item.type, item.key, item.programUuid);
            return (
              // The same course can appear twice in one order, so the key alone is not unique.
              // eslint-disable-next-line react/no-array-index-key
              <tr key={`${item.key}-${index}`}>
                <td>
                  <div className="rwaq-user-cell__name">
                    {path ? <Link to={path}>{item.title}</Link> : item.title}
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
                  <div className="rwaq-user-cell__meta">{item.key}</div>
                </td>
                <td>{intl.formatMessage(item.type === 'program' ? messages.typeProgram : messages.typeCourse)}</td>
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
          })}
        </p>
      )}
      {order.reason && (
        <p className={`text-muted mb-0 ${order.enrolledBy ? '' : 'mt-3'}`}>
          {intl.formatMessage(messages.adminReason, { reason: order.reason })}
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
        onClearAll={() => { list.clearAll(); onScopeClear(); dates.setRange(); }}
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
