/**
 * OrgListPage — Organizations, built on the same primitives as User Management
 * so the two admin surfaces read as one product: SearchFilterBar for the action
 * bar, AdminDataTable for the list, FormModal for create/edit.
 *
 * Editing moved off the detail page and into a row action here, matching the
 * user list: the detail page is for reading an org and managing its admins.
 */
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Chip } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import ProfileAvatar from '@src/components/ProfileAvatar';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import ErrorState from '@src/components/ErrorState';
import { getErrorStatus } from '@src/data/httpError';
import SearchFilterBar from '@src/components/SearchFilterBar';
import type { AppliedChip } from '@src/components/SearchFilterBar';
import OrgFormModal from './modals/OrgFormModal';
import { useOrganization, useOrganizations } from './data/hooks';
import type { OrgFilter, OrgOrdering, OrgSummary } from './data/types';
import messages from './messages';

const PAGE_SIZE = 10;
const DEFAULT_ORDERING: OrgOrdering = '-created';

type MessageKey = keyof typeof messages;

const FILTER_OPTIONS: { value: OrgFilter; label: MessageKey }[] = [
  { value: 'all', label: 'filterAll' },
  { value: 'active', label: 'filterActive' },
  { value: 'inactive', label: 'filterInactive' },
  { value: 'has_admins', label: 'filterHasAdmins' },
  { value: 'no_admins', label: 'filterNoAdmins' },
];

const SORT_OPTIONS: { value: OrgOrdering; label: MessageKey }[] = [
  { value: 'name', label: 'sortNameAsc' },
  { value: '-name', label: 'sortNameDesc' },
  { value: '-course_count', label: 'sortCoursesDesc' },
  { value: '-admin_count', label: 'sortAdminsDesc' },
  { value: '-created', label: 'sortNewest' },
];

const OrgListPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  // Create mode carries no org; edit mode needs the full detail, which the list
  // row doesn't include, so the short name is held and the detail fetched.
  const [isCreating, setIsCreating] = useState(false);
  const [editingShortName, setEditingShortName] = useState<string | null>(null);

  const page = Number(searchParams.get('page') ?? 1);
  const search = searchParams.get('search') ?? '';
  const filter = (searchParams.get('filter') as OrgFilter | null) ?? 'all';
  const hasExplicitOrdering = searchParams.get('ordering') !== null;
  const ordering = (searchParams.get('ordering') as OrgOrdering | null) ?? DEFAULT_ORDERING;

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
  } = useOrganizations({
    search: search || undefined,
    filter: filter !== 'all' ? filter : undefined,
    ordering,
    page,
    pageSize: PAGE_SIZE,
  });

  const { data: editingOrg } = useOrganization(editingShortName ?? '');

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

    // Chip whenever the sort was chosen explicitly — i.e. the URL param is
    // present. Comparing against the default instead meant picking the default
    // produced no chip, and always chipping meant "Clear all" could never
    // empty the list.
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

  const columns: ColumnDef<OrgSummary>[] = [
    {
      label: intl.formatMessage(messages.colName),
      key: 'name',
      renderCell: (value, row) => (
        <div className="rwaq-user-cell">
          <ProfileAvatar src={(row.image as string | null) ?? null} name={value as string} size="sm" />
          <div className="min-width-0">
            <div className="rwaq-user-cell__name">{value as string}</div>
            <div className="rwaq-user-cell__meta">{row.shortName as string}</div>
          </div>
        </div>
      ),
    },
    {
      // Its own column: stacked under the Latin name, a bidi string never
      // aligned cleanly with the line above it.
      label: intl.formatMessage(messages.colArabicName),
      key: 'arabicName',
      renderCell: (value) => (value
        ? <span className="rwaq-bidi" dir="auto">{value as string}</span>
        : <span className="text-muted">{intl.formatMessage(messages.detailNone)}</span>),
    },
    { label: intl.formatMessage(messages.colShortName), key: 'shortName' },
    {
      label: intl.formatMessage(messages.colStatus),
      key: 'active',
      renderCell: (value) => (
        <Chip className={`rwaq-chip rwaq-chip--${value ? 'success' : 'light'}`}>
          {intl.formatMessage(value ? messages.statusActive : messages.statusInactive)}
        </Chip>
      ),
    },
    { label: intl.formatMessage(messages.colCourses), key: 'courseCount' },
    { label: intl.formatMessage(messages.colPrograms), key: 'programCount' },
    { label: intl.formatMessage(messages.colAdmins), key: 'adminCount' },
    {
      label: intl.formatMessage(messages.colActions),
      headerClassName: 'rwaq-th--actions',
      key: 'actions',
      renderCell: (_value, row) => (
        <div className="rwaq-row-actions">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => navigate(`/organizations/${row.shortName as string}`)}
            aria-label={`${intl.formatMessage(messages.view)} ${row.name as string}`}
          >
            {intl.formatMessage(messages.view)}
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setEditingShortName(row.shortName as string)}
            aria-label={`${intl.formatMessage(messages.edit)} ${row.name as string}`}
          >
            {intl.formatMessage(messages.edit)}
          </Button>
        </div>
      ),
    },
  ];

  // rwaq-page--fit: the page fills the viewport and the table scrolls
  // inside itself, so the document never grows past the fold.
  return (
    <div className="rwaq-page rwaq-page--fit">
      <div className="rwaq-page-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h1 className="rwaq-page-title">{intl.formatMessage(messages.title)}</h1>
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            {intl.formatMessage(messages.addOrg)}
          </Button>
        </div>
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
              // Always write the param, even for the default value, so the choice
              // is visible as a chip and reversible via Clear all.
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

      <OrgFormModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        organization={null}
      />

      {/* Edit waits for the detail fetch, so the form never opens half-populated. */}
      <OrgFormModal
        isOpen={editingShortName !== null && !!editingOrg}
        onClose={() => setEditingShortName(null)}
        organization={editingOrg ?? null}
      />
    </div>
  );
};

export default OrgListPage;
