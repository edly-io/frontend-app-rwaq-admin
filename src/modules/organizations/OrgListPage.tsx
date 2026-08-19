import { useSearchParams, useNavigate } from 'react-router-dom';
import { Button } from '@openedx/paragon';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import PageHeader from '@src/components/shell/PageHeader';
import FilterBar from '@src/components/shell/FilterBar';
import AdminDataTable from '@src/components/AdminDataTable';
import ErrorState from '@src/components/ErrorState';
import type { ColumnDef } from '@src/components/AdminDataTable';
import { useOrganizations } from './data/hooks';

const messages = defineMessages({
  title: {
    id: 'rwaq.admin.orgs.list.title',
    defaultMessage: 'Organizations',
  },
  colName: {
    id: 'rwaq.admin.orgs.list.col.name',
    defaultMessage: 'Name',
  },
  colShortName: {
    id: 'rwaq.admin.orgs.list.col.shortName',
    defaultMessage: 'Short Name',
  },
  colCourses: {
    id: 'rwaq.admin.orgs.list.col.courses',
    defaultMessage: 'Courses',
  },
  colAdmins: {
    id: 'rwaq.admin.orgs.list.col.admins',
    defaultMessage: 'Admins',
  },
  viewDetails: {
    id: 'rwaq.admin.orgs.list.viewDetails',
    defaultMessage: 'View',
  },
  errorTitle: {
    id: 'rwaq.admin.orgs.list.errorTitle',
    defaultMessage: 'Could not load organizations',
  },
});

const SORT_OPTIONS = [
  { value: 'name', label: 'Name (A–Z)' },
  { value: '-name', label: 'Name (Z–A)' },
  { value: '-course_count', label: 'Most courses' },
  { value: '-admin_count', label: 'Most admins' },
];

const PAGE_SIZE = 20;

const OrgListPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const page = Number(searchParams.get('page') ?? 1);
  const search = searchParams.get('search') ?? undefined;
  const ordering = searchParams.get('ordering') ?? undefined;

  const {
    data, isLoading, isError, error, refetch,
  } = useOrganizations({
    search,
    ordering,
    page,
    page_size: PAGE_SIZE,
  });

  const columns: ColumnDef[] = [
    { label: intl.formatMessage(messages.colName), key: 'name' },
    { label: intl.formatMessage(messages.colShortName), key: 'short_name' },
    { label: intl.formatMessage(messages.colCourses), key: 'course_count' },
    { label: intl.formatMessage(messages.colAdmins), key: 'admin_count' },
    {
      label: '',
      // Must be unique: Paragon/react-table derives the column id from the key,
      // and 'short_name' is already used by the data column above.
      key: 'actions',
      renderCell: (_value, row) => (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => navigate(`/organizations/${row.short_name as string}`)}
        >
          {intl.formatMessage(messages.viewDetails)}
        </Button>
      ),
    },
  ];

  const statusCode = isError && error instanceof Error && 'response' in (error as any)
    ? (error as any).response?.status
    : undefined;

  return (
    <div>
      <PageHeader title={intl.formatMessage(messages.title)} />

      <div className="mt-3">
        <FilterBar
          searchParam="search"
          orderingParam="ordering"
          sortOptions={SORT_OPTIONS}
        />

        {isError ? (
          <ErrorState
            statusCode={statusCode}
            title={intl.formatMessage(messages.errorTitle)}
            onRetry={() => refetch()}
          />
        ) : (
          <AdminDataTable
            columns={columns}
            data={(data?.results ?? []) as unknown as Record<string, unknown>[]}
            isLoading={isLoading}
            caption={intl.formatMessage(messages.title)}
            pagination={
              data
                ? {
                  currentPage: page,
                  pageCount: Math.ceil(data.count / PAGE_SIZE),
                  onPageChange: () => {},
                }
                : undefined
            }
          />
        )}
      </div>
    </div>
  );
};

export default OrgListPage;
