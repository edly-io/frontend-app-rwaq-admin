/**
 * ProgramListPage — Programs, following the same primitives as Organizations
 * and Users so the three admin surfaces read as one product.
 *
 * Filter params follow the discovery plan §3.1 + §6:
 *   ?status=active|draft|archived  (backend param: status)
 *   ?is_hide=true                  (backend param: is_hide)
 *   ?is_featured=true              (backend param: is_featured)
 * Each maps to a separate URL search param so they can be combined.
 * A single-select UI dropdown maps each option to the correct param set.
 */
import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Chip } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import ChipOverflowList from '@src/components/ChipOverflowList';
import type { ChipItem } from '@src/components/ChipOverflowList';
import ErrorState from '@src/components/ErrorState';
import { getErrorStatus } from '@src/data/httpError';
import SearchFilterBar from '@src/components/SearchFilterBar';
import type { AppliedChip } from '@src/components/SearchFilterBar';
import ProgramImage from './components/ProgramImage';
import { usePrograms } from './data/hooks';
import type { ProgramOrdering, ProgramStatus, ProgramSummary } from './data/types';
import messages from './messages';

const PAGE_SIZE = 10;
const DEFAULT_ORDERING: ProgramOrdering = '-created';

type MessageKey = keyof typeof messages;

// ── Filter ────────────────────────────────────────────────────────────────────

/**
 * Each UI filter option maps to backend param key/value pairs.
 * Multiple keys let us set or clear the right param on selection.
 */
type FilterOption = {
  id: string;
  label: MessageKey;
  params: Record<string, string>;
};

const FILTER_OPTIONS: FilterOption[] = [
  { id: 'all', label: 'filterAll', params: { status: '', is_hide: '', is_featured: '' } },
  { id: 'active', label: 'filterActive', params: { status: 'active', is_hide: '', is_featured: '' } },
  { id: 'draft', label: 'filterDraft', params: { status: 'draft', is_hide: '', is_featured: '' } },
  { id: 'archived', label: 'filterArchived', params: { status: 'archived', is_hide: '', is_featured: '' } },
  { id: 'hidden', label: 'filterHidden', params: { status: '', is_hide: 'true', is_featured: '' } },
  { id: 'visible', label: 'filterVisible', params: { status: '', is_hide: 'false', is_featured: '' } },
  { id: 'featured', label: 'filterFeatured', params: { status: '', is_hide: '', is_featured: 'true' } },
];

const SORT_OPTIONS: { value: ProgramOrdering; label: MessageKey }[] = [
  { value: '-created', label: 'sortNewest' },
  { value: 'created', label: 'sortOldest' },
  { value: 'name', label: 'sortNameAsc' },
  { value: '-name', label: 'sortNameDesc' },
  { value: '-total_enrollments', label: 'sortMostEnrollments' },
  { value: '-total_courses', label: 'sortMostCourses' },
  { value: 'start_date', label: 'sortStartDateAsc' },
  { value: '-start_date', label: 'sortStartDateDesc' },
];

const STATUS_VARIANT: Record<ProgramStatus, string> = {
  active: 'success',
  draft: 'warning',
  archived: 'light',
};

const STATUS_MESSAGE: Record<ProgramStatus, MessageKey> = {
  active: 'statusActive',
  draft: 'statusDraft',
  archived: 'statusArchived',
};

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Derive the active filter option id from the current URL search params. */
function activeFilterId(searchParams: URLSearchParams): string {
  const status = searchParams.get('status');
  const isHide = searchParams.get('is_hide');
  const isFeatured = searchParams.get('is_featured');
  if (status === 'active') { return 'active'; }
  if (status === 'draft') { return 'draft'; }
  if (status === 'archived') { return 'archived'; }
  if (isHide === 'true') { return 'hidden'; }
  if (isHide === 'false') { return 'visible'; }
  if (isFeatured === 'true') { return 'featured'; }
  return 'all';
}

// ── Component ─────────────────────────────────────────────────────────────────

const ProgramListPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const search = searchParams.get('search') ?? '';
  const hasExplicitOrdering = searchParams.get('ordering') !== null;
  const ordering = (searchParams.get('ordering') as ProgramOrdering | null) ?? DEFAULT_ORDERING;
  const currentFilterId = activeFilterId(searchParams);
  const hasActiveFilter = currentFilterId !== 'all';

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
    status: (searchParams.get('status') as ProgramStatus | null) || undefined,
    isHide: searchParams.get('is_hide') === 'true' ? true : searchParams.get('is_hide') === 'false' ? false : undefined,
    isFeatured: searchParams.get('is_featured') === 'true' ? true : undefined,
    ordering,
    page,
    pageSize: PAGE_SIZE,
  });

  const statusCode = isError ? getErrorStatus(error) : undefined;

  const filterOptions = useMemo(
    () => FILTER_OPTIONS.map((option) => ({
      value: option.id,
      label: intl.formatMessage(messages[option.label]),
    })),
    [intl],
  );

  const sortOptions = useMemo(
    () => SORT_OPTIONS.map((option) => ({
      value: option.value,
      label: intl.formatMessage(messages[option.label]),
    })),
    [intl],
  );

  const appliedChips = useMemo(() => {
    const chips: AppliedChip[] = [];

    if (search) {
      chips.push({
        key: 'search',
        label: intl.formatMessage(messages.chipSearch, { term: search }),
        onRemove: () => updateParams({ search: '' }),
      });
    }

    if (hasActiveFilter) {
      const activeOption = FILTER_OPTIONS.find((o) => o.id === currentFilterId);
      chips.push({
        key: 'filter',
        label: intl.formatMessage(messages.chipFilter, {
          label: intl.formatMessage(messages[activeOption?.label ?? 'filterAll']),
        }),
        onRemove: () => updateParams({ status: '', is_hide: '', is_featured: '' }),
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
  }, [search, currentFilterId, hasActiveFilter, ordering, hasExplicitOrdering, intl, updateParams, sortOptions]);

  const columns = useMemo<ColumnDef<ProgramSummary>[]>(() => [
    {
      label: '',
      key: 'cardImage',
      renderCell: (_value, row) => (
        <ProgramImage
          cardImage={row.cardImage}
          organizationLogo={row.organizationLogo}
          programName={row.name}
        />
      ),
    },
    {
      label: intl.formatMessage(messages.colProgram),
      key: 'name',
      renderCell: (_value, row) => (
        <div style={{ minWidth: 0 }}>
          <span
            className="rwaq-user-cell__name d-block"
            style={{ maxWidth: '18rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
            title={row.name}
          >
            {row.name}
          </span>
          <span className="text-muted small">{row.programKey}</span>
        </div>
      ),
    },
    {
      label: intl.formatMessage(messages.colOrganization),
      key: 'organization',
      renderCell: (_value, row) => (
        <div>
          <span className="d-block">{row.organization}</span>
          {row.organizationName && (
            <span className="text-muted small">{row.organizationName}</span>
          )}
        </div>
      ),
    },
    {
      label: intl.formatMessage(messages.colTypeBatch),
      key: 'programType',
      renderCell: (_value, row) => (
        <div className="d-flex flex-column gap-1">
          {row.programType && (
            <Chip className="rwaq-chip rwaq-chip--light">{row.programType}</Chip>
          )}
          {row.batch != null && (
            <span className="text-muted small">{intl.formatMessage(messages.batchLabel, { batch: row.batch })}</span>
          )}
        </div>
      ),
    },
    {
      label: intl.formatMessage(messages.colStatus),
      key: 'status',
      renderCell: (_value, row) => {
        const statusItems: ChipItem[] = [
          {
            key: 'status',
            label: intl.formatMessage(messages[STATUS_MESSAGE[row.status] ?? 'statusDraft']),
            variant: STATUS_VARIANT[row.status] ?? 'light',
          },
          ...(row.isHide ? [{ key: 'hidden', label: intl.formatMessage(messages.tagHidden), variant: 'danger' } as ChipItem] : []),
          ...(row.isFeatured ? [{ key: 'featured', label: intl.formatMessage(messages.tagFeatured), variant: 'info' } as ChipItem] : []),
          ...(row.certificateEnabled ? [{ key: 'cert', label: intl.formatMessage(messages.tagCertEnabled), variant: 'success-muted' } as ChipItem] : []),
        ];
        return (
          <ChipOverflowList
            items={statusItems}
            maxVisible={1}
            id={`program-status-${row.uuid}`}
          />
        );
      },
    },
    {
      label: intl.formatMessage(messages.colEnrollments),
      key: 'totalEnrollments',
      renderCell: (value) => (
        <span style={{ fontVariantNumeric: 'tabular-nums' }}>{value as number}</span>
      ),
    },
    {
      label: intl.formatMessage(messages.colStartDate),
      key: 'startDate',
      renderCell: (value) => {
        if (!value) { return <span className="text-muted">—</span>; }
        const d = new Date(value as string);
        const isPast = d < new Date();
        return (
          <span className={isPast ? 'text-muted' : undefined}>
            {d.toLocaleDateString()}
          </span>
        );
      },
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
            onClick={() => navigate(`/programs/${row.uuid}`)}
            aria-label={`${intl.formatMessage(messages.view)} ${row.name}`}
          >
            {intl.formatMessage(messages.view)}
          </Button>
        </div>
      ),
    },
  ], [intl, navigate]);

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
              value: currentFilterId,
              options: filterOptions,
              onChange: (id) => {
                const opt = FILTER_OPTIONS.find((o) => o.id === id);
                if (opt) { updateParams(opt.params); }
              },
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
          onClearAll={() => updateParams({
            search: '', status: '', is_hide: '', is_featured: '', ordering: '',
          })}
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
