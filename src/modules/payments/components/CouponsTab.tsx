/**
 * By coupon — how often each code was used and what it gave away. With a
 * partner selected, a cart coupon counts only the part on that partner's items.
 */
import { Badge } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import ErrorState from '@src/components/ErrorState';
import SearchFilterBar from '@src/components/SearchFilterBar';
import type { AppliedChip } from '@src/components/SearchFilterBar';
import { getErrorStatus } from '@src/data/httpError';
import { usePaymentCoupons } from '../data/hooks';
import type { CouponRow, CouponScope } from '../data/types';
import messages from '../messages';
import {
  CsvButton, DateFilter, PAGE_SIZE, TabCard, TabHeading, MoneyCell, listScope, tablePagination, useDateRange,
  useListState, usePartnerFilter,
} from './shared';
import type { ListTabProps } from './shared';
import OrdersDetail from './OrdersDetail';

const DEFAULT_ORDERING = '-discount_given';

interface CouponsTabProps extends ListTabProps {
  /** Opens Payment history narrowed to the orders that used one code. */
  onViewOrders: (code: string) => void;
}

const CouponsTab = ({ org, onOrgChange, onViewOrders }: CouponsTabProps) => {
  const intl = useIntl();
  const dates = useDateRange();
  const params = { org: org || undefined, startDate: dates.startDate, endDate: dates.endDate };
  const list = useListState(DEFAULT_ORDERING, { scope: '' }, listScope(org, dates.startDate, dates.endDate));
  const partner = usePartnerFilter(params, onOrgChange);
  const listParams = {
    ...params,
    scope: (list.filters.scope || undefined) as CouponScope | undefined,
    search: list.search || undefined,
    ordering: list.ordering,
    page: list.page,
    pageSize: PAGE_SIZE,
  };
  const {
    data, isLoading, isPlaceholderData, isError, error, refetch,
  } = usePaymentCoupons(listParams);

  const scopeOptions = [
    { value: '', label: intl.formatMessage(messages.filterAll) },
    { value: 'product', label: intl.formatMessage(messages.scopeProduct) },
    { value: 'cart', label: intl.formatMessage(messages.scopeCart) },
  ];
  const sortOptions = [
    { value: '-discount_given', label: intl.formatMessage(messages.sortDiscountDesc) },
    { value: '-orders', label: intl.formatMessage(messages.sortOrdersDesc) },
    { value: 'code', label: intl.formatMessage(messages.sortNameAsc) },
  ];

  const scopeLabel = (scope: CouponRow['scope']) => {
    if (scope === 'product') { return intl.formatMessage(messages.scopeProduct); }
    if (scope === 'cart') { return intl.formatMessage(messages.scopeCart); }
    return intl.formatMessage(messages.scopeMixed);
  };
  const discountTypeLabel = (type: CouponRow['discountType']) => {
    if (type === 'amount') { return intl.formatMessage(messages.discountAmount); }
    if (type === 'percentage') { return intl.formatMessage(messages.discountPercentage); }
    return intl.formatMessage(messages.discountMixed);
  };

  const chips: AppliedChip[] = [];
  if (list.search) {
    chips.push({
      key: 'search',
      label: intl.formatMessage(messages.chipSearch, { term: list.search }),
      onRemove: () => list.setSearch(''),
    });
  }
  if (partner.chip) { chips.push(partner.chip); }
  if (list.filters.scope) {
    chips.push({
      key: 'scope',
      label: intl.formatMessage(messages.chipScope, { label: scopeLabel(list.filters.scope as CouponScope) }),
      onRemove: () => list.setFilter('scope', ''),
    });
  }
  if (!list.isDefaultOrdering) {
    chips.push({
      key: 'ordering',
      label: intl.formatMessage(messages.chipSort, {
        label: sortOptions.find((o) => o.value === list.ordering)?.label ?? list.ordering,
      }),
      onRemove: () => list.setOrdering(''),
    });
  }

  const columns: ColumnDef<CouponRow>[] = [
    {
      label: intl.formatMessage(messages.colCoupon),
      info: intl.formatMessage(messages.infoColCoupon),
      key: 'code',
      renderCell: (value) => <span className="rwaq-user-cell__name">{value as string}</span>,
    },
    {
      label: intl.formatMessage(messages.colScope),
      info: intl.formatMessage(messages.infoColScope),
      key: 'scope',
      renderCell: (value) => <Badge variant="light">{scopeLabel(value as CouponRow['scope'])}</Badge>,
    },
    {
      label: intl.formatMessage(messages.colDiscountType),
      info: intl.formatMessage(messages.infoColDiscountType),
      key: 'discountType',
      renderCell: (value) => discountTypeLabel(value as CouponRow['discountType']),
    },
    {
      label: intl.formatMessage(messages.colOrders),
      info: intl.formatMessage(messages.infoColCouponOrders),
      key: 'orders',
    },
    {
      label: intl.formatMessage(messages.colDiscountGiven),
      info: intl.formatMessage(messages.infoColDiscountGiven),
      key: 'discountGiven',
      renderCell: (value) => <MoneyCell value={value as string} strong />,
    },
  ];

  return (
    <TabCard>
      <TabHeading
        title={intl.formatMessage(messages.tabCoupons)}
        info={intl.formatMessage(messages.infoCouponsTab)}
        how={intl.formatMessage(messages.howCoupons)}
      />
      <SearchFilterBar
        searchTerm={list.search}
        onSearch={list.setSearch}
        searchPlaceholder={intl.formatMessage(messages.couponsSearch)}
        filterGroups={[
          partner.group,
          {
            id: 'scope',
            label: intl.formatMessage(messages.scopeLabel),
            value: list.filters.scope,
            options: scopeOptions,
            onChange: (value) => list.setFilter('scope', value),
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
        onClearAll={() => { list.clearAll(); onOrgChange(''); dates.setRange(); }}
        actions={(
          <>
            <DateFilter range={dates} />
            <CsvButton report="coupons" params={listParams} />
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
          caption={intl.formatMessage(messages.tabCoupons)}
          pagination={tablePagination(data, list.page, list.setPage)}
          renderRowSubComponent={(row) => (
            <OrdersDetail
              focus={{ kind: 'coupon', code: row.code }}
              params={params}
              onViewAll={() => onViewOrders(row.code)}
            />
          )}
        />
      )}
    </TabCard>
  );
};

export default CouponsTab;
