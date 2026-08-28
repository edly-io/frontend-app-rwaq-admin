/**
 * UsersListPage — User Management (v2).
 *
 * Table shape: the avatar gets its own narrow column so the name column can
 * hold a real name; Status shows only Active/Inactive (email confirmation is a
 * separate fact, shown in the detail view); Roles shows the highest grant plus
 * a "+N" chip so a multi-role user doesn't inflate its row.
 *
 * Search, filter, sort and page all live in the URL, so any view is linkable
 * and survives a refresh. Filter and sort sit behind the Filters toggle in
 * SearchFilterBar and echo back as removable chips.
 */
import { useCallback, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import ErrorState from '@src/components/ErrorState';
import { getErrorStatus } from '@src/data/httpError';
import ProfileAvatar from '@src/components/ProfileAvatar';
import SearchFilterBar from '@src/components/SearchFilterBar';
import type { AppliedChip, SelectOption } from '@src/components/SearchFilterBar';
import RoleBadges from './components/RoleBadges';
import StatusBadges from './components/StatusBadges';
import EditUserModal from './modals/EditUserModal';
import UserFormModal from './modals/UserFormModal';
import { useUsers } from './data/hooks';
import type {
  RoleBadge, SearchBy, UserFilter, UserOrdering, UserSummary,
} from './data/types';
import messages from './messages';

const PAGE_SIZE = 10;
const DEFAULT_ORDERING: UserOrdering = '-created';
const DEFAULT_SEARCH_BY: SearchBy = 'email';
const DIGITS_RE = /^\d+$/;

type MessageKey = keyof typeof messages;

/** Search scopes, matching the backend's search_by values. */
const SEARCH_SCOPES: { value: SearchBy; label: MessageKey }[] = [
  { value: 'email', label: 'searchByEmail' },
  { value: 'name', label: 'searchByName' },
  { value: 'user_id', label: 'searchByUserId' },
  { value: 'job', label: 'searchByJob' },
];

/** What each scope actually accepts, so the field stops asking for an email
 *  when the admin has chosen to search by name. */
const SEARCH_PLACEHOLDERS: Record<SearchBy, typeof messages[MessageKey]> = {
  email: messages.searchPlaceholderEmail,
  name: messages.searchPlaceholderName,
  user_id: messages.searchPlaceholderUserId,
  job: messages.searchPlaceholderJob,
};

/** Every ?filter= value the backend accepts, in the order the spec lists them. */
const FILTER_OPTIONS: { value: UserFilter; label: MessageKey }[] = [
  { value: 'all', label: 'filterAll' },
  { value: 'global_staff', label: 'filterGlobalStaff' },
  { value: 'superuser', label: 'filterSuperuser' },
  // Course Creator stays: it is still shown as a badge and still arrives
  // automatically with an Organization Admin grant, so users really hold it and
  // need to be findable. Support Staff is no longer surfaced by this screen.
  { value: 'course_creator', label: 'filterCourseCreator' },
  { value: 'org_admin', label: 'filterOrgAdmin' },
  { value: 'learner', label: 'filterLearner' },
  { value: 'active', label: 'filterActive' },
  { value: 'inactive', label: 'filterInactive' },
  { value: 'confirmed', label: 'filterConfirmed' },
  { value: 'unconfirmed', label: 'filterUnconfirmed' },
  { value: 'public_profile', label: 'filterPublicProfile' },
  { value: 'private_profile', label: 'filterPrivateProfile' },
  { value: 'password_only', label: 'filterPasswordOnly' },
  { value: 'facebook', label: 'filterFacebook' },
  { value: 'google', label: 'filterGoogle' },
  { value: 'twitter', label: 'filterTwitter' },
  { value: 'legacy', label: 'filterLegacy' },
];

/** Sort options — real DB columns only; role and auth method are derived. */
const SORT_OPTIONS: { value: UserOrdering; label: MessageKey }[] = [
  { value: '-created', label: 'sortCreatedDesc' },
  { value: 'created', label: 'sortCreatedAsc' },
  { value: 'name', label: 'sortNameAsc' },
  { value: 'email', label: 'sortEmailAsc' },
  { value: '-last_login', label: 'sortLastLoginDesc' },
  { value: 'id', label: 'sortIdAsc' },
];

// No 'view' any more: viewing a user is a route, not a dialog.
type ModalState =
  | { kind: 'none' }
  | { kind: 'add' }
  | { kind: 'edit'; userId: number };

const UsersListPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });

  const page = Number(searchParams.get('page') ?? 1);
  const searchBy = (searchParams.get('search_by') as SearchBy | null) ?? DEFAULT_SEARCH_BY;
  const searchTerm = searchParams.get('search_term') ?? '';
  const filter = (searchParams.get('filter') as UserFilter | null) ?? 'all';
  const hasExplicitOrdering = searchParams.get('ordering') !== null;
  const ordering = (searchParams.get('ordering') as UserOrdering | null) ?? DEFAULT_ORDERING;

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, value]) => {
          if (value) { next.set(key, value); } else { next.delete(key); }
        });
        next.delete('page'); // any search/filter/sort change resets to page 1
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
  } = useUsers({
    searchBy: searchTerm ? searchBy : undefined,
    searchTerm: searchTerm || undefined,
    filter: filter !== 'all' ? filter : undefined,
    ordering,
    page,
    pageSize: PAGE_SIZE,
  });

  const statusCode = isError ? getErrorStatus(error) : undefined;

  // ── Action bar wiring ──────────────────────────────────────────────────────

  const scopeOptions: SelectOption[] = SEARCH_SCOPES.map((scope) => ({
    value: scope.value,
    label: intl.formatMessage(messages[scope.label]),
  }));

  const scopeLabel = (value: string) => scopeOptions.find((option) => option.value === value)?.label ?? value;

  /** Mirrors the backend's own validation, so a bad term never costs a request. */
  const validateSearch = (scope: string, term: string): string => {
    if (!term.trim()) { return ''; }
    if (scope === 'user_id' && !DIGITS_RE.test(term.trim())) {
      return intl.formatMessage(messages.validationUserIdInvalid);
    }
    if (scope === 'email' && !term.includes('@')) {
      return intl.formatMessage(messages.validationEmailInvalid);
    }
    return '';
  };

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

    if (searchTerm) {
      chips.push({
        key: 'search',
        label: intl.formatMessage(messages.chipSearch, {
          scope: scopeLabel(searchBy),
          term: searchTerm,
        }),
        onRemove: () => updateParams({ search_term: '', search_by: '' }),
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
  }, [searchTerm, searchBy, filter, ordering, hasExplicitOrdering, intl, updateParams]);

  // ── Columns ───────────────────────────────────────────────────────────────

  const columns: ColumnDef<UserSummary>[] = [
    {
      label: intl.formatMessage(messages.colAvatar),
      // Heading is for screen readers only — an avatar needs no visible title.
      isLabelHidden: true,
      headerClassName: 'rwaq-th--avatar',
      key: 'image',
      renderCell: (value, row) => (
        <ProfileAvatar src={value as string | null} name={row.name as string} size="sm" />
      ),
    },
    {
      label: intl.formatMessage(messages.colName),
      key: 'name',
      renderCell: (value, row) => (
        <div className="rwaq-user-cell">
          <div className="min-width-0">
            <div className="rwaq-user-cell__name">{(value as string) || intl.formatMessage(messages.detailNone)}</div>
            <div className="rwaq-user-cell__meta">{row.email as string}</div>
          </div>
        </div>
      ),
    },
    {
      label: intl.formatMessage(messages.colStatus),
      key: 'isActive',
      renderCell: (value) => <StatusBadges isActive={value as boolean} />,
    },
    {
      label: intl.formatMessage(messages.colRoles),
      key: 'roleBadges',
      renderCell: (value, row) => (
        <RoleBadges badges={value as RoleBadge[]} id={`user-${row.id}-roles`} />
      ),
    },
    {
      label: intl.formatMessage(messages.colCreated),
      key: 'createdAt',
      renderCell: (value) => new Date(value as string).toLocaleDateString(),
    },
    {
      label: intl.formatMessage(messages.colLastLogin),
      key: 'lastLogin',
      renderCell: (value) => (value
        ? new Date(value as string).toLocaleDateString()
        : intl.formatMessage(messages.never)),
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
            onClick={() => navigate(`/users/${row.id as number}`)}
            aria-label={`${intl.formatMessage(messages.view)} ${row.name as string}`}
          >
            {intl.formatMessage(messages.view)}
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setModal({ kind: 'edit', userId: row.id as number })}
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
        <div className="d-flex justify-content-between align-items-center flex-wrap rwaq-gap-sm">
          <h1 className="rwaq-page-title">{intl.formatMessage(messages.title)}</h1>
          <Button variant="primary" onClick={() => setModal({ kind: 'add' })}>
            {intl.formatMessage(messages.addUser)}
          </Button>
        </div>
      </div>

      <div className="rwaq-card rwaq-card--fit">
        <SearchFilterBar
          scopes={scopeOptions}
          scope={searchBy}
          // Always persist the scope, even with no term yet: the select is
          // driven by this URL param, so not writing it made the choice snap
          // straight back to Email.
          onScopeChange={(next) => updateParams({ search_by: next })}
          searchTerm={searchTerm}
          onSearch={(term) => updateParams({ search_by: term ? searchBy : '', search_term: term })}
          searchPlaceholder={intl.formatMessage(SEARCH_PLACEHOLDERS[searchBy] ?? messages.searchTermPlaceholder)}
          validateSearch={validateSearch}
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
          onClearAll={() => updateParams({
            search_by: '', search_term: '', filter: '', ordering: '',
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

      <UserFormModal
        isOpen={modal.kind === 'add'}
        onClose={() => setModal({ kind: 'none' })}
        user={null}
      />

      <EditUserModal
        userId={modal.kind === 'edit' ? modal.userId : null}
        onClose={() => setModal({ kind: 'none' })}
      />
    </div>
  );
};

export default UsersListPage;
