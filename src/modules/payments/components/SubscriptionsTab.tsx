/**
 * Subscriptions — one row per Rwaq subscription paid or granted in the date range, with KPI tiles.
 *
 * Subscription payments are not part of the other tabs: they are all Rwaq's, with no partner
 * share. An admin grant lists the subscription but never counts as revenue.
 */
import { Link } from 'react-router-dom';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import ErrorState from '@src/components/ErrorState';
import SearchFilterBar from '@src/components/SearchFilterBar';
import type { AppliedChip } from '@src/components/SearchFilterBar';
import { getErrorStatus } from '@src/data/httpError';
import { usePaymentOrders, usePaymentSubscriptions, useSubscriptionsSummary } from '../data/hooks';
import type { SubscriptionRow, SubscriptionStatus } from '../data/types';
import paymentMessages from '../messages';
import PaymentKpi from './PaymentKpi';
import {
  CsvButton, DateFilter, DetailTable, MoneyCell, MoneyTd, PAGE_SIZE, TabCard, TabHeading, formatDateTime, formatMoney,
  formatTileAmount, listScope, tablePagination, useDateRange, useListState,
} from './shared';

const DEFAULT_ORDERING = '-ends_at';
const CURRENCY = 'SAR';
const STATUSES: SubscriptionStatus[] = ['active', 'cancelled', 'expired', 'revoked'];
/** How many payments an expanded row lists before it links to the full history. */
const PAYMENTS_SHOWN = 5;

const messages = defineMessages({
  title: { id: 'rwaq.admin.payments.subscriptions.title', defaultMessage: 'Subscriptions' },
  info: {
    id: 'rwaq.admin.payments.subscriptions.info',
    defaultMessage: 'Rwaq subscriptions paid or granted in the date range. All subscription revenue is Rwaq\'s.',
  },
  how: {
    id: 'rwaq.admin.payments.subscriptions.how',
    defaultMessage: 'Amounts count WordPress payments in the range. Admin grants are listed but never count as revenue.',
  },
  search: { id: 'rwaq.admin.payments.subscriptions.search', defaultMessage: 'Search by username or email' },
  statusLabel: { id: 'rwaq.admin.payments.subscriptions.status', defaultMessage: 'Status' },
  statusAll: { id: 'rwaq.admin.payments.subscriptions.status-all', defaultMessage: 'All statuses' },
  active: { id: 'rwaq.admin.payments.subscriptions.status.active', defaultMessage: 'Active' },
  cancelled: { id: 'rwaq.admin.payments.subscriptions.status.cancelled', defaultMessage: 'Cancelled' },
  expired: { id: 'rwaq.admin.payments.subscriptions.status.expired', defaultMessage: 'Expired' },
  revoked: { id: 'rwaq.admin.payments.subscriptions.status.revoked', defaultMessage: 'Revoked' },
  colLearner: { id: 'rwaq.admin.payments.subscriptions.col.learner', defaultMessage: 'Learner' },
  colPlan: { id: 'rwaq.admin.payments.subscriptions.col.plan', defaultMessage: 'Plan' },
  colSource: { id: 'rwaq.admin.payments.subscriptions.col.source', defaultMessage: 'Source' },
  colStatus: { id: 'rwaq.admin.payments.subscriptions.col.status', defaultMessage: 'Status' },
  colStarts: { id: 'rwaq.admin.payments.subscriptions.col.starts', defaultMessage: 'Starts' },
  colEnds: { id: 'rwaq.admin.payments.subscriptions.col.ends', defaultMessage: 'Ends' },
  colPayments: { id: 'rwaq.admin.payments.subscriptions.col.payments', defaultMessage: 'Payments' },
  colCollected: { id: 'rwaq.admin.payments.subscriptions.col.collected', defaultMessage: 'Collected (SAR)' },
  colDiscounts: { id: 'rwaq.admin.payments.subscriptions.col.discounts', defaultMessage: 'Discounts (SAR)' },
  monthly: { id: 'rwaq.admin.payments.subscriptions.plan.monthly', defaultMessage: 'Monthly' },
  yearly: { id: 'rwaq.admin.payments.subscriptions.plan.yearly', defaultMessage: 'Yearly' },
  wordpress: { id: 'rwaq.admin.payments.subscriptions.source.wordpress', defaultMessage: 'WordPress' },
  admin: { id: 'rwaq.admin.payments.subscriptions.source.admin', defaultMessage: 'Admin' },
  kpiRevenue: { id: 'rwaq.admin.payments.subscriptions.kpi.revenue', defaultMessage: 'Subscription revenue' },
  kpiNew: { id: 'rwaq.admin.payments.subscriptions.kpi.new', defaultMessage: 'New subscriptions' },
  kpiRenewals: { id: 'rwaq.admin.payments.subscriptions.kpi.renewals', defaultMessage: 'Renewals' },
  kpiCancellations: { id: 'rwaq.admin.payments.subscriptions.kpi.cancellations', defaultMessage: 'Cancellations' },
  infoRevenue: {
    id: 'rwaq.admin.payments.subscriptions.kpi.revenue-info',
    defaultMessage: 'Amount collected from WordPress subscription payments in the period.',
  },
  infoNew: {
    id: 'rwaq.admin.payments.subscriptions.kpi.new-info',
    defaultMessage: 'Subscriptions whose first payment is in the range.',
  },
  infoRenewals: {
    id: 'rwaq.admin.payments.subscriptions.kpi.renewals-info',
    defaultMessage: 'Payments in the range after a subscription\'s first.',
  },
  infoCancellations: {
    id: 'rwaq.admin.payments.subscriptions.kpi.cancellations-info',
    defaultMessage: 'Subscriptions cancelled in the range, also those reactivated later. Access continues until their end date.',
  },
  sortEndsDesc: { id: 'rwaq.admin.payments.subscriptions.sort.ends-desc', defaultMessage: 'Ends, latest first' },
  sortEndsAsc: { id: 'rwaq.admin.payments.subscriptions.sort.ends-asc', defaultMessage: 'Ends, earliest first' },
  sortCollectedDesc: { id: 'rwaq.admin.payments.subscriptions.sort.collected', defaultMessage: 'Collected, highest first' },
  sortLearner: { id: 'rwaq.admin.payments.subscriptions.sort.learner', defaultMessage: 'Learner A to Z' },
  sortLabel: { id: 'rwaq.admin.payments.subscriptions.sort.label', defaultMessage: 'Sort by' },
  chipSearch: { id: 'rwaq.admin.payments.subscriptions.chip.search', defaultMessage: 'Search: {term}' },
  chipStatus: { id: 'rwaq.admin.payments.subscriptions.chip.status', defaultMessage: 'Status: {status}' },
  colPeriod: { id: 'rwaq.admin.payments.subscriptions.col.period', defaultMessage: 'Period' },
  paymentsTitle: { id: 'rwaq.admin.payments.subscriptions.payments-title', defaultMessage: 'Latest payments' },
  noPayments: { id: 'rwaq.admin.payments.subscriptions.no-payments', defaultMessage: 'No payments.' },
  viewAllPayments: { id: 'rwaq.admin.payments.subscriptions.view-all', defaultMessage: 'View all payments' },
  paymentsError: { id: 'rwaq.admin.payments.subscriptions.payments-error', defaultMessage: 'Could not load payments.' },
  errorTitle: { id: 'rwaq.admin.payments.subscriptions.error', defaultMessage: 'Could not load subscriptions' },
});

/** The latest payments of one subscription, loaded when its row is opened. */
const SubscriptionPayments = ({ subscription }: { subscription: SubscriptionRow }) => {
  const intl = useIntl();
  const { data, isLoading, isError } = usePaymentOrders({
    subscription: subscription.id, ordering: '-order_date', page: 1, pageSize: PAYMENTS_SHOWN,
  });
  const orders = data?.results ?? [];
  const formatPeriodDate = (value: string) => intl.formatDate(value, { dateStyle: 'medium', timeZone: 'UTC' });

  let body;
  if (isError) {
    body = <p className="text-muted mb-0">{intl.formatMessage(messages.paymentsError)}</p>;
  } else if (!isLoading && orders.length === 0) {
    body = <p className="text-muted mb-0">{intl.formatMessage(messages.noPayments)}</p>;
  } else {
    body = (
      <table className="table table-sm mb-2">
        <thead>
          <tr>
            <th>{intl.formatMessage(paymentMessages.colOrder)}</th>
            <th>{intl.formatMessage(paymentMessages.colDate)}</th>
            <th>{intl.formatMessage(paymentMessages.colPaid)}</th>
            <th>{intl.formatMessage(messages.colPeriod)}</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const item = order.items.find((candidate) => candidate.subscriptionId === subscription.id);
            return (
              <tr key={order.id}>
                <td>{order.wordpressOrderId ?? intl.formatMessage(paymentMessages.adminOrder, { id: order.id })}</td>
                <td>{formatDateTime(order.orderDate, intl.locale)}</td>
                <MoneyTd value={item?.pricePaid ?? order.pricePaid} />
                <td>
                  {item?.periodStartsAt && item.periodEndsAt
                    ? `${formatPeriodDate(item.periodStartsAt)} – ${formatPeriodDate(item.periodEndsAt)}`
                    : ''}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  return (
    <DetailTable>
      <h4 className="rwaq-section-title">{intl.formatMessage(messages.paymentsTitle)}</h4>
      {body}
      <Link to={`/payments?tab=orders&subscription=${subscription.id}`}>
        {intl.formatMessage(messages.viewAllPayments)}
      </Link>
    </DetailTable>
  );
};

const SubscriptionsTab = () => {
  const intl = useIntl();
  const dates = useDateRange();
  const params = { startDate: dates.startDate, endDate: dates.endDate };
  const list = useListState(DEFAULT_ORDERING, { status: '' }, listScope('', dates.startDate, dates.endDate));
  const status = list.filters.status as SubscriptionStatus | '';
  const listParams = {
    ...params, status, search: list.search || undefined, ordering: list.ordering, page: list.page, pageSize: PAGE_SIZE,
  };
  const {
    data, isLoading, isPlaceholderData, isError, error, refetch,
  } = usePaymentSubscriptions(listParams);
  const { data: summary, isLoading: summaryLoading, isError: summaryError } = useSubscriptionsSummary(params);

  // A plan, source or status this page has no text for shows as sent instead of throwing.
  const label = (key: string) => (key in messages
    ? intl.formatMessage(messages[key as keyof typeof messages])
    : key);
  const formatDate = (value: string) => intl.formatDate(value, { dateStyle: 'medium' });
  const count = (value: number | undefined) => (
    value !== undefined && !summaryError ? value.toLocaleString(intl.locale) : null
  );

  const sortOptions = [
    { value: '-ends_at', label: label('sortEndsDesc') },
    { value: 'ends_at', label: label('sortEndsAsc') },
    { value: '-net_paid', label: label('sortCollectedDesc') },
    { value: 'learner', label: label('sortLearner') },
  ];

  const chips: AppliedChip[] = [];
  if (list.search) {
    chips.push({
      key: 'search', label: intl.formatMessage(messages.chipSearch, { term: list.search }), onRemove: () => list.setSearch(''),
    });
  }
  if (status) {
    chips.push({
      key: 'status',
      label: intl.formatMessage(messages.chipStatus, { status: label(status) }),
      onRemove: () => list.setFilter('status', ''),
    });
  }

  const columns: ColumnDef<SubscriptionRow>[] = [
    {
      label: label('colLearner'),
      key: 'learner',
      renderCell: (_value, row) => (
        <div className="min-width-0">
          <div className="rwaq-user-cell__name" title={row.learner}>{row.learner}</div>
          <div className="rwaq-user-cell__meta" title={row.email}>{row.email}</div>
        </div>
      ),
    },
    { label: label('colPlan'), key: 'plan', renderCell: (_value, row) => label(row.plan) },
    { label: label('colSource'), key: 'source', renderCell: (_value, row) => label(row.source) },
    { label: label('colStatus'), key: 'status', renderCell: (_value, row) => label(row.status) },
    { label: label('colStarts'), key: 'startsAt', renderCell: (_value, row) => formatDate(row.startsAt) },
    { label: label('colEnds'), key: 'endsAt', renderCell: (_value, row) => formatDate(row.endsAt) },
    { label: label('colPayments'), key: 'payments' },
    { label: label('colCollected'), key: 'netPaid', renderCell: (value) => <MoneyCell value={value as string} strong /> },
    { label: label('colDiscounts'), key: 'discounts', renderCell: (value) => <MoneyCell value={value as string} /> },
  ];

  return (
    <TabCard>
      <TabHeading title={label('title')} info={label('info')} how={label('how')} />

      <div className="rwaq-overview__toolbar rwaq-overview__toolbar--end">
        <DateFilter range={dates} />
      </div>

      <div className="rwaq-payment-grid rwaq-payment-grid--fit mb-3">
        <PaymentKpi
          label={label('kpiRevenue')}
          unit={CURRENCY}
          value={summary && !summaryError ? formatTileAmount(intl, summary.revenue) : null}
          exact={summary && !summaryError ? formatMoney(intl, summary.revenue) ?? undefined : undefined}
          info={label('infoRevenue')}
          isLoading={summaryLoading}
        />
        <PaymentKpi label={label('kpiNew')} value={count(summary?.new)} info={label('infoNew')} isLoading={summaryLoading} />
        <PaymentKpi
          label={label('kpiRenewals')}
          value={count(summary?.renewals)}
          info={label('infoRenewals')}
          isLoading={summaryLoading}
        />
        <PaymentKpi
          label={label('kpiCancellations')}
          value={count(summary?.cancellations)}
          info={label('infoCancellations')}
          isLoading={summaryLoading}
        />
      </div>

      <SearchFilterBar
        searchTerm={list.search}
        onSearch={list.setSearch}
        searchPlaceholder={label('search')}
        filterGroups={[
          {
            id: 'status',
            label: label('statusLabel'),
            value: status,
            options: [
              { value: '', label: label('statusAll') },
              ...STATUSES.map((value) => ({ value, label: label(value) })),
            ],
            onChange: (value: string) => list.setFilter('status', value),
          },
          {
            id: 'ordering',
            label: label('sortLabel'),
            value: list.ordering,
            options: sortOptions,
            onChange: list.setOrdering,
          },
        ]}
        appliedChips={chips}
        onClearAll={() => { list.clearAll(); dates.setRange(); }}
        actions={<CsvButton report="subscriptions" params={listParams} />}
      />
      {isError ? (
        <ErrorState
          statusCode={getErrorStatus(error) || undefined}
          title={label('errorTitle')}
          onRetry={() => refetch()}
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={data?.results ?? []}
          isLoading={isLoading || isPlaceholderData}
          caption={label('title')}
          pagination={tablePagination(data, list.page, list.setPage)}
          renderRowSubComponent={(row) => <SubscriptionPayments subscription={row} />}
        />
      )}
    </TabCard>
  );
};

export default SubscriptionsTab;
