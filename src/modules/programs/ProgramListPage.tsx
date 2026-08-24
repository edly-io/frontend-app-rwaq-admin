/**
 * ProgramListPage — Programs, following the same primitives as Organizations
 * and Users so the three admin surfaces read as one product.
 */
import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Chip } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import ErrorState from '@src/components/ErrorState';
import { getErrorStatus } from '@src/data/httpError';
import SearchFilterBar from '@src/components/SearchFilterBar';
import type { AppliedChip } from '@src/components/SearchFilterBar';
import ProgramImage from './components/ProgramImage';
import { usePrograms } from './data/hooks';
import type { ProgramFilter, ProgramOrdering, ProgramSummary } from './data/types';
import messages from './messages';

const PAGE_SIZE = 10;
const DEFAULT_ORDERING: ProgramOrdering = '-created';

type MessageKey = keyof typeof messages;

const FILTER_OPTIONS: { value: ProgramFilter; label: MessageKey }[] = [
  { value: 'all', label: 'filterAll' },
  { value: 'active', label: 'filterActive' },
  { value: 'draft', label: 'filterDraft' },
  { value: 'archived', label: 'filterArchived' },
  { value: 'hidden', label: 'filterHidden' },
  { value: 'visible', label: 'filterVisible' },
  { value: 'featured', label: 'filterFeatured' },
  { value: 'certificate_enabled', label: 'filterCertEnabled' },
];

const SORT_OPTIONS: { value: ProgramOrdering; label: MessageKey }[] = [
  { value: '-created', label: 'sortNewest' },
  { value: 'created', label: 'sortOldest' },
  { value: 'name', label: 'sortNameAsc' },
  { value: '-name', label: 'sortNameDesc' },
  { value: '-total_enrollments', label: 'sortMostEnrollments' },
  { value: '-total_courses', label: 'sortMostCourses' },
  { value: '-start_date', label: 'sortStartDate' },
];

const STATUS_VARIANT: Record<string, string> = {
  active: 'success',
  draft: 'warning',
  archived: 'light',
};

const ProgramListPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') ?? 1);
  const search = searchParams.get('search') ?? '';
  const filter = (searchParams.get('filter') as ProgramFilter | null) ?? 'all';
  const hasExplicitOrdering = searchParams.get('ordering') !== null;
  const ordering = (searchParams.get('ordering') as ProgramOrdering | null) ?? DEFAULT_ORDERING;

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, value]) => {
          if (value) { next.set(key, value); } else { next.delete(key); }
        });
        next.delete('page');
        return next;
      }, { replace: true });
    },
    [setSearchParams],
  );

  const handlePageChange = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(newPage));
        return next;
      }, { replace: true });
    },
    [setSearchParams],
  );

  const {
    data, isLoading, isError, error, refetch,
  } = usePrograms({
    search: search || undefined,
    filter: filter !== 'all' ? filter : undefined,
    ordering,
    page,
    pageSize: PAGE_SIZE,
  });

  const statusCode = isError ? getErrorStatus(error) : undefined;

  const filterOptions = FILTER_OPTIONS.map((option) => ({
    value: option.value,
    label: intl.formatMessage(messages[option.label]),
  }));

  const sortOptions = SORT_OPTIONS.map((option) => ({
    value: option.value,
    label: intl.formatMessage(messages[option.label]),
  }));

  const appliedChips = useMemo(() => {
    const chips: AppliedChip[] = [];

    if (search) {
      chips.push({
        key: 'search',
        label: intl.formatMessage(messages.chipSearch, { term: search }),
        onRemove: () => updateParams({ search: '' }),
      });
    }

    if (filter !== 'all') {
      chips.push({
        key: 'filter',
        label: intl.formatMessage(messages.chipFilter, {
          label: filterOptions.find((option) => option.value === filter)?.label ?? filter,
        }),
        onRemove: () => updateParams({ filter: '' }),
      });
    }

    if (hasExplicitOrdering) {
      chips.push({
        key: 'ordering',
        label: intl.formatMessage(messages.chipSort, {
          label: sortOptions.find((option) => option.value === ordering)?.label ?? ordering,
        }),
        onRemove: () => updateParams({ ordering: '' }),
      });
    }

    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, filter, ordering, hasExplicitOrdering, intl, updateParams]);

  const columns: ColumnDef<ProgramSummary>[] = [
    {
      label: intl.formatMessage(messages.colProgram),
      key: 'name',
      renderCell: (_value, row) => (
        <div className="d-flex align-items-center gap-3">
          <ProgramImage
            cardImage={row.cardImage as string | null}
            organizationLogo={row.organizationLogo as string | null}
            programName={row.name as string}
          />
          <div>
            <span className="rwaq-user-cell__name d-block">{row.name as string}</span>
            <span className="text-muted small">{row.programKey as string}</span>
          </div>
        </div>
      ),
    },
    {
      label: intl.formatMessage(messages.colOrganization),
      key: 'organization',
      renderCell: (value) => (
        <span>{value as string}</span>
      ),
    },
    {
      label: intl.formatMessage(messages.colStatus),
      key: 'status',
      renderCell: (_value, row) => (
        <div className="d-flex flex-column gap-1">
          <Chip className={`rwaq-chip rwaq-chip--${STATUS_VARIANT[row.status as string] ?? 'light'}`}>
            {intl.formatMessage(messages[`status${(row.status as string).charAt(0).toUpperCase() + (row.status as string).slice(1)}` as MessageKey])}
          </Chip>
          {row.isHide && (
            <Chip className="rwaq-chip rwaq-chip--danger">
              {intl.formatMessage(messages.tagHidden)}
            </Chip>
          )}
        </div>
      ),
    },
    {
      label: intl.formatMessage(messages.colCourses),
      key: 'totalCourses',
    },
    {
      label: intl.formatMessage(messages.colActions),
      headerClassName: 'rwaq-th--actions',
      key: 'actions',
      renderCell: (_value, row) => (
        <div className="rwaq-row-actions">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => navigate(`/programs/${row.uuid as string}`)}
            aria-label={`${intl.formatMessage(messages.view)} ${row.name as string}`}
          >
            {intl.formatMessage(messages.view)}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="rwaq-page rwaq-page--fit">
      <div className="rwaq-page-header">
        <h1 className="rwaq-page-title">{intl.formatMessage(messages.title)}</h1>
      </div>

      <div className="rwaq-card rwaq-card--fit">
        <SearchFilterBar
          searchTerm={search}
          onSearch={(term) => updateParams({ search: term })}
          searchPlaceholder={intl.formatMessage(messages.searchPlaceholder)}
          filterGroups={[
            {
              id: 'filter',
              label: intl.formatMessage(messages.filterGroupLabel),
              value: filter,
              options: filterOptions,
              onChange: (value) => updateParams({ filter: value === 'all' ? '' : value }),
            },
            {
              id: 'ordering',
              label: intl.formatMessage(messages.sortLabel),
              value: ordering,
              options: sortOptions,
              onChange: (value) => updateParams({ ordering: value }),
            },
          ]}
          appliedChips={appliedChips}
          onClearAll={() => updateParams({ search: '', filter: '', ordering: '' })}
        />

        {isError ? (
          <ErrorState
            statusCode={statusCode || undefined}
            title={intl.formatMessage(messages.errorTitle)}
            onRetry={() => refetch()}
          />
        ) : (
          <AdminDataTable
            columns={columns}
            data={data?.results ?? []}
            isLoading={isLoading}
            caption={intl.formatMessage(messages.title)}
            pagination={data ? {
              currentPage: page,
              pageCount: data.pagination?.numPages
                ?? Math.max(1, Math.ceil((data.pagination?.count ?? 0) / PAGE_SIZE)),
              itemCount: data.pagination?.count ?? data.results.length,
              pageSize: PAGE_SIZE,
              onPageChange: handlePageChange,
            } : undefined}
          />
        )}
      </div>
    </div>
  );
};

export default ProgramListPage;
