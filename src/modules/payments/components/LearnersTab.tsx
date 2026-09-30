/**
 * By learner — what each buyer paid, split item by item by each item's own
 * organization share. Usernames link to the user detail page.
 */
import { Link } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import ErrorState from '@src/components/ErrorState';
import SearchFilterBar from '@src/components/SearchFilterBar';
import type { AppliedChip } from '@src/components/SearchFilterBar';
import { getErrorStatus } from '@src/data/httpError';
import { usePaymentLearners } from '../data/hooks';
import type { LearnerRow } from '../data/types';
import messages from '../messages';
import {
  CsvButton, DateFilter, PAGE_SIZE, TabCard, TabHeading, listScope, revenueColumns, tablePagination,
  useDateRange, useListState, usePartnerFilter,
} from './shared';
import type { ListTabProps } from './shared';
import OrdersDetail from './OrdersDetail';

const DEFAULT_ORDERING = '-net_paid';

interface LearnersTabProps extends ListTabProps {
  /** Opens Payment history narrowed to one buyer. */
  onViewOrders: (userId: number, username: string) => void;
}

const LearnersTab = ({ org, onOrgChange, onViewOrders }: LearnersTabProps) => {
  const intl = useIntl();
  const dates = useDateRange();
  const params = { org: org || undefined, startDate: dates.startDate, endDate: dates.endDate };
  const list = useListState(DEFAULT_ORDERING, {}, listScope(org, dates.startDate, dates.endDate));
  const partner = usePartnerFilter(params, onOrgChange);
  const listParams = {
    ...params, search: list.search || undefined, ordering: list.ordering, page: list.page, pageSize: PAGE_SIZE,
  };
  const {
    data, isLoading, isPlaceholderData, isError, error, refetch,
  } = usePaymentLearners(listParams);

  const sortOptions = [
    { value: '-net_paid', label: intl.formatMessage(messages.sortCollectedDesc) },
    { value: 'net_paid', label: intl.formatMessage(messages.sortCollectedAsc) },
    { value: '-items', label: intl.formatMessage(messages.sortPurchasesDesc) },
    { value: 'username', label: intl.formatMessage(messages.sortNameAsc) },
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
  if (!list.isDefaultOrdering) {
    chips.push({
      key: 'ordering',
      label: intl.formatMessage(messages.chipSort, {
        label: sortOptions.find((o) => o.value === list.ordering)?.label ?? list.ordering,
      }),
      onRemove: () => list.setOrdering(''),
    });
  }

  const columns: ColumnDef<LearnerRow>[] = [
    {
      label: intl.formatMessage(messages.colLearner),
      info: intl.formatMessage(messages.infoColLearner),
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
      label: intl.formatMessage(messages.colOrdersPlaced),
      info: intl.formatMessage(messages.infoLearnerOrders),
      headerClassName: 'rwaq-th--wrap',
      key: 'orders',
    },
    ...revenueColumns<LearnerRow>(intl, {
      purchasesLabel: intl.formatMessage(messages.colBought),
      purchases: intl.formatMessage(messages.infoLearnerBought),
      orderValue: intl.formatMessage(messages.infoLearnerOrderValue),
      discounts: intl.formatMessage(messages.infoLearnerDiscounts),
      collected: intl.formatMessage(messages.infoLearnerCollected),
      payout: intl.formatMessage(messages.infoLearnerPayout),
      rwaq: intl.formatMessage(messages.infoLearnerRwaq),
    }),
  ];

  return (
    <TabCard>
      <TabHeading
        title={intl.formatMessage(messages.tabLearners)}
        info={intl.formatMessage(messages.infoLearnersTab)}
        how={intl.formatMessage(messages.howLearners)}
      />
      <SearchFilterBar
        searchTerm={list.search}
        onSearch={list.setSearch}
        searchPlaceholder={intl.formatMessage(messages.learnersSearch)}
        filterGroups={[
          partner.group,
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
            <CsvButton report="learners" params={listParams} />
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
          caption={intl.formatMessage(messages.tabLearners)}
          pagination={tablePagination(data, list.page, list.setPage)}
          renderRowSubComponent={(row) => (
            <OrdersDetail
              focus={{ kind: 'learner', userId: row.userId, org: org || undefined }}
              params={params}
              onViewAll={() => onViewOrders(row.userId, row.username)}
            />
          )}
        />
      )}
    </TabCard>
  );
};

export default LearnersTab;
