/**
 * By partner — revenue per organization and what to transfer to it. A row
 * opens to show the courses and programs behind it, and "View overview" opens
 * the Overview narrowed to that partner (O1).
 */
import { Link } from 'react-router-dom';
import { Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import ErrorState from '@src/components/ErrorState';
import SearchFilterBar from '@src/components/SearchFilterBar';
import type { AppliedChip } from '@src/components/SearchFilterBar';
import { getErrorStatus } from '@src/data/httpError';
import { usePaymentPartners } from '../data/hooks';
import type { PartnerRow, PaymentsParams } from '../data/types';
import messages from '../messages';
import OrdersDetail from './OrdersDetail';
import {
  CsvButton, DateFilter, PAGE_SIZE, ShareCell, TabCard, TabHeading, listScope, revenueColumns, tablePagination,
  useDateRange, useListState,
} from './shared';
import type { DateRange } from './shared';

const DEFAULT_ORDERING = '-net_paid';

interface PartnersTabProps {
  /** This tab lists every partner, so it has a date range of its own but no partner filter. */
  onViewOverview: (org: string, range: DateRange) => void;
  /** Opens Payment history narrowed to one partner. */
  onViewOrders: (org: string, range: DateRange) => void;
}

const PartnersTab = ({ onViewOverview, onViewOrders }: PartnersTabProps) => {
  const intl = useIntl();
  const dates = useDateRange();
  const params: PaymentsParams = { startDate: dates.startDate, endDate: dates.endDate };
  const list = useListState(DEFAULT_ORDERING, {}, listScope(dates.startDate, dates.endDate));
  const listParams = {
    ...params, search: list.search || undefined, ordering: list.ordering, page: list.page, pageSize: PAGE_SIZE,
  };
  const {
    data, isLoading, isPlaceholderData, isError, error, refetch,
  } = usePaymentPartners(listParams);

  const sortOptions = [
    { value: '-net_paid', label: intl.formatMessage(messages.sortCollectedDesc) },
    { value: 'net_paid', label: intl.formatMessage(messages.sortCollectedAsc) },
    { value: '-partner_amount', label: intl.formatMessage(messages.sortPayoutDesc) },
    { value: 'org_name', label: intl.formatMessage(messages.sortNameAsc) },
  ];

  const chips: AppliedChip[] = [];
  if (list.search) {
    chips.push({
      key: 'search',
      label: intl.formatMessage(messages.chipSearch, { term: list.search }),
      onRemove: () => list.setSearch(''),
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

  const columns: ColumnDef<PartnerRow>[] = [
    {
      label: intl.formatMessage(messages.colPartnerOrg),
      info: intl.formatMessage(messages.infoColPartnerOrg),
      key: 'orgName',
      renderCell: (_value, row) => (
        <div className="min-width-0">
          <div className="rwaq-user-cell__name" title={row.orgName}>
            <Link to={`/organizations/${encodeURIComponent(row.org)}`}>{row.orgName}</Link>
          </div>
          <div className="rwaq-user-cell__meta">{row.org}</div>
        </div>
      ),
    },
    {
      label: intl.formatMessage(messages.colShare),
      info: intl.formatMessage(messages.infoColShare),
      key: 'share',
      renderCell: (value) => <ShareCell share={value as string | null} />,
    },
    {
      label: intl.formatMessage(messages.colOrders),
      info: intl.formatMessage(messages.infoPartnerOrders),
      key: 'orders',
    },
    ...revenueColumns<PartnerRow>(intl, {
      purchasesLabel: intl.formatMessage(messages.colSold),
      purchases: intl.formatMessage(messages.infoPartnerSold),
      orderValue: intl.formatMessage(messages.infoPartnerOrderValue),
      discounts: intl.formatMessage(messages.infoPartnerDiscounts),
      collected: intl.formatMessage(messages.infoPartnerCollected),
      payout: intl.formatMessage(messages.infoPartnerPayout),
      rwaq: intl.formatMessage(messages.infoPartnerRwaq),
    }),
    {
      label: intl.formatMessage(messages.colActions),
      headerClassName: 'rwaq-th--actions',
      key: 'actions',
      renderCell: (_value, row) => (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => onViewOverview(row.org, { startDate: dates.startDate, endDate: dates.endDate })}
          aria-label={intl.formatMessage(messages.viewOverviewAria, { org: row.orgName })}
        >
          {intl.formatMessage(messages.viewOverview)}
        </Button>
      ),
    },
  ];

  return (
    <TabCard>
      <TabHeading
        title={intl.formatMessage(messages.tabPartners)}
        info={intl.formatMessage(messages.infoPartnersTab)}
        how={intl.formatMessage(messages.howPartners)}
      />
      <SearchFilterBar
        searchTerm={list.search}
        onSearch={list.setSearch}
        searchPlaceholder={intl.formatMessage(messages.partnersSearch)}
        filterGroups={[{
          id: 'ordering',
          label: intl.formatMessage(messages.sortLabel),
          value: list.ordering,
          options: sortOptions,
          onChange: list.setOrdering,
        }]}
        appliedChips={chips}
        onClearAll={() => { list.clearAll(); dates.setRange(); }}
        actions={(
          <>
            <DateFilter range={dates} />
            <CsvButton report="partners" params={listParams} />
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
          caption={intl.formatMessage(messages.tabPartners)}
          pagination={tablePagination(data, list.page, list.setPage)}
          renderRowSubComponent={(row) => (
            <OrdersDetail
              focus={{ kind: 'partner', org: row.org, orgName: row.orgName }}
              params={params}
              onViewAll={() => onViewOrders(row.org, { startDate: dates.startDate, endDate: dates.endDate })}
            />
          )}
        />
      )}
    </TabCard>
  );
};

export default PartnersTab;
