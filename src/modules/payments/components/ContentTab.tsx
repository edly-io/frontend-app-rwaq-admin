/**
 * By content — revenue per course and per program, each split by its
 * partner's share. Titles link to the course or program detail page. A row
 * opens to show the orders that bought it.
 */
import { Link } from 'react-router-dom';
import { Badge } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import ErrorState from '@src/components/ErrorState';
import SearchFilterBar from '@src/components/SearchFilterBar';
import type { AppliedChip } from '@src/components/SearchFilterBar';
import { getErrorStatus } from '@src/data/httpError';
import { usePaymentContent } from '../data/hooks';
import type {
  ContentListParams, ContentRow, ContentType,
} from '../data/types';
import messages from '../messages';
import {
  CsvButton, DateFilter, PAGE_SIZE, ShareCell, TabCard, TabHeading, listScope, revenueColumns, tablePagination,
  useDateRange, useListState, usePartnerFilter,
} from './shared';
import type { DateRange, ListTabProps } from './shared';
import OrdersDetail from './OrdersDetail';

const DEFAULT_ORDERING = '-net_paid';

/** The existing detail page for a course or program. */
export const contentPath = (type: ContentType, key: string, programUuid: string | null): string | null => {
  if (type === 'program') { return programUuid ? `/programs/${programUuid}` : null; }
  return `/courses/${encodeURIComponent(key)}`;
};

interface ContentTabProps extends ListTabProps {
  /** Opens Payment history narrowed to the orders that bought one course or program. */
  onViewOrders: (key: string, title: string, range: DateRange) => void;
}

const ContentTab = ({ org, onOrgChange, onViewOrders }: ContentTabProps) => {
  const intl = useIntl();
  const dates = useDateRange();
  const params = { org: org || undefined, startDate: dates.startDate, endDate: dates.endDate };
  const list = useListState(DEFAULT_ORDERING, { type: '' }, listScope(org, dates.startDate, dates.endDate));
  const partner = usePartnerFilter(params, onOrgChange);
  const listParams: ContentListParams = {
    ...params,
    type: (list.filters.type || undefined) as ContentType | undefined,
    search: list.search || undefined,
    ordering: list.ordering,
    page: list.page,
    pageSize: PAGE_SIZE,
  };
  const {
    data, isLoading, isPlaceholderData, isError, error, refetch,
  } = usePaymentContent(listParams);

  const typeOptions = [
    { value: '', label: intl.formatMessage(messages.filterAll) },
    { value: 'course', label: intl.formatMessage(messages.typeCourse) },
    { value: 'program', label: intl.formatMessage(messages.typeProgram) },
  ];
  const sortOptions = [
    { value: '-net_paid', label: intl.formatMessage(messages.sortCollectedDesc) },
    { value: 'net_paid', label: intl.formatMessage(messages.sortCollectedAsc) },
    { value: '-items', label: intl.formatMessage(messages.sortPurchasesDesc) },
    { value: 'title', label: intl.formatMessage(messages.sortNameAsc) },
  ];

  const chips: AppliedChip[] = [];
  if (list.search) {
    chips.push({
      key: 'search',
      label: intl.formatMessage(messages.chipSearch, { term: list.search }),
      onRemove: () => list.setSearch(''),
    });
  }
  if (partner.chip) { chips.push(partner.chip); }
  if (list.filters.type) {
    chips.push({
      key: 'type',
      label: intl.formatMessage(messages.chipType, {
        label: typeOptions.find((o) => o.value === list.filters.type)?.label,
      }),
      onRemove: () => list.setFilter('type', ''),
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

  const columns: ColumnDef<ContentRow>[] = [
    {
      label: intl.formatMessage(messages.colContent),
      info: intl.formatMessage(messages.infoColContent),
      key: 'title',
      renderCell: (_value, row) => {
        const path = contentPath(row.type, row.key, row.programUuid);
        return (
          <div className="min-width-0">
            <div className="rwaq-user-cell__name" title={row.title}>
              {path ? <Link to={path}>{row.title}</Link> : row.title}
            </div>
            <div className="rwaq-user-cell__meta" title={row.key}>{row.key}</div>
          </div>
        );
      },
    },
    {
      label: intl.formatMessage(messages.colType),
      info: intl.formatMessage(messages.infoColType),
      key: 'type',
      renderCell: (value) => (
        <Badge variant="light">
          {intl.formatMessage(value === 'program' ? messages.typeProgram : messages.typeCourse)}
        </Badge>
      ),
    },
    { label: intl.formatMessage(messages.colOrg), info: intl.formatMessage(messages.infoColOrg), key: 'org' },
    {
      label: intl.formatMessage(messages.colShare),
      info: intl.formatMessage(messages.infoColShare),
      key: 'share',
      renderCell: (value) => <ShareCell share={value as string | null} />,
    },
    ...revenueColumns<ContentRow>(intl, {
      purchasesLabel: intl.formatMessage(messages.colPurchases),
      purchases: intl.formatMessage(messages.infoContentPurchases),
      orderValue: intl.formatMessage(messages.infoContentOrderValue),
      discounts: intl.formatMessage(messages.infoContentDiscounts),
      collected: intl.formatMessage(messages.infoContentCollected),
      payout: intl.formatMessage(messages.infoContentPayout),
      rwaq: intl.formatMessage(messages.infoContentRwaq),
    }),
  ];

  return (
    <TabCard>
      <TabHeading
        title={intl.formatMessage(messages.tabContent)}
        info={intl.formatMessage(messages.infoContentTab)}
        how={intl.formatMessage(messages.howContent)}
      />
      <SearchFilterBar
        searchTerm={list.search}
        onSearch={list.setSearch}
        searchPlaceholder={intl.formatMessage(messages.contentSearch)}
        filterGroups={[
          partner.group,
          {
            id: 'type',
            label: intl.formatMessage(messages.typeLabel),
            value: list.filters.type,
            options: typeOptions,
            onChange: (value) => list.setFilter('type', value),
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
            <CsvButton report="content" params={listParams} />
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
          caption={intl.formatMessage(messages.tabContent)}
          pagination={tablePagination(data, list.page, list.setPage)}
          renderRowSubComponent={(row) => (
            <OrdersDetail
              focus={{ kind: 'content', key: row.key }}
              params={params}
              onViewAll={() => onViewOrders(row.key, row.title, { startDate: dates.startDate, endDate: dates.endDate })}
            />
          )}
        />
      )}
    </TabCard>
  );
};

export default ContentTab;
