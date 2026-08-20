/**
 * UsersListPage — User Management (v2).
 *
 * Roles are platform grants, not one field, so the table shows badges rather
 * than a role column, and Status splits into Active/Inactive plus a separate
 * email-confirmation signal.
 *
 * Search (email/name/user ID/job), the single-select filter, sort and page are
 * all URL-driven, so any view is linkable and survives a refresh.
 *
 * Modals: Add (create) · View (read-only detail + enrollments) · Edit.
 */
import { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import ErrorState from '@src/components/ErrorState';
import RoleBadges from './components/RoleBadges';
import StatusBadges from './components/StatusBadges';
import UserSearchBar from './components/UserSearchBar';
import EditUserModal from './modals/EditUserModal';
import UserDetailModal from './modals/UserDetailModal';
import UserFormModal from './modals/UserFormModal';
import { useUsers } from './data/hooks';
import type {
  RoleBadge, SearchBy, UserFilter, UserOrdering,
} from './data/types';
import messages from './messages';

const PAGE_SIZE = 20;
const DEFAULT_ORDERING: UserOrdering = '-created';

/** Filter dropdown options, in the order the spec lists them. */
const FILTER_OPTIONS: { value: UserFilter; label: keyof typeof messages }[] = [
  { value: 'all', label: 'filterAll' },
  { value: 'global_staff', label: 'filterGlobalStaff' },
  { value: 'course_creator', label: 'filterCourseCreator' },
  { value: 'support_staff', label: 'filterSupportStaff' },
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

/** Sort options — real columns only; derived values (role, auth method) can't be sorted server-side. */
const SORT_OPTIONS: { value: UserOrdering; label: keyof typeof messages }[] = [
  { value: '-created', label: 'sortCreatedDesc' },
  { value: 'created', label: 'sortCreatedAsc' },
  { value: 'name', label: 'sortNameAsc' },
  { value: 'email', label: 'sortEmailAsc' },
  { value: '-last_login', label: 'sortLastLoginDesc' },
  { value: 'id', label: 'sortIdAsc' },
];

type ModalState =
  | { kind: 'none' }
  | { kind: 'add' }
  | { kind: 'view'; userId: number }
  | { kind: 'edit'; userId: number };

const avatarFallback = (name: string) => (
  `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&size=32&rounded=true&background=449cc2&color=fff`
);

const UsersListPage = () => {
  const intl = useIntl();
  const [searchParams, setSearchParams] = useSearchParams();
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });

  const page = Number(searchParams.get('page') ?? 1);
  const searchBy = (searchParams.get('search_by') as SearchBy | null) ?? 'email';
  const searchTerm = searchParams.get('search_term') ?? '';
  const filter = (searchParams.get('filter') as UserFilter | null) ?? 'all';
  const ordering = (searchParams.get('ordering') as UserOrdering | null) ?? DEFAULT_ORDERING;

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([key, value]) => {
          if (value) { next.set(key, value); } else { next.delete(key); }
        });
        next.delete('page'); // any filter/search/sort change resets to page 1
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

  const statusCode = isError && (error as { response?: { status: number } })?.response?.status;

  const columns: ColumnDef[] = [
    {
      label: intl.formatMessage(messages.colName),
      key: 'name',
      renderCell: (value, row) => (
        <div className="d-flex align-items-center gap-2">
          <img
            src={(row.image as string | null) ?? avatarFallback(value as string)}
            alt=""
            width={32}
            height={32}
            className="rounded-circle"
            style={{ objectFit: 'cover' }}
          />
          <span>{value as string}</span>
        </div>
      ),
    },
    { label: intl.formatMessage(messages.colEmail), key: 'email' },
    {
      label: intl.formatMessage(messages.colStatus),
      key: 'isActive',
      renderCell: (value, row) => (
        <StatusBadges
          isActive={value as boolean}
          isEmailConfirmed={row.isEmailConfirmed as boolean}
        />
      ),
    },
    {
      label: intl.formatMessage(messages.colRoles),
      key: 'roleBadges',
      renderCell: (value) => <RoleBadges badges={value as RoleBadge[]} />,
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
      key: 'actions',
      renderCell: (_value, row) => (
        <div className="d-flex gap-1">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setModal({ kind: 'view', userId: row.id as number })}
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

  return (
    <div className="rwaq-page">
      <div className="rwaq-page-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h1 className="rwaq-page-title">{intl.formatMessage(messages.title)}</h1>
          <Button variant="primary" onClick={() => setModal({ kind: 'add' })}>
            {intl.formatMessage(messages.addUser)}
          </Button>
        </div>
      </div>

      <div className="rwaq-card">
        <div className="d-flex flex-wrap gap-3 align-items-start mb-4">
          <div className="flex-grow-1">
            <UserSearchBar
              onSearch={(by, term) => updateParams({ search_by: by, search_term: term })}
              onClear={() => updateParams({ search_by: '', search_term: '' })}
              initialBy={searchBy}
              initialTerm={searchTerm}
            />
          </div>

          <Form.Group className="mb-0" controlId="user-filter">
            <Form.Label className="sr-only">{intl.formatMessage(messages.filterLabel)}</Form.Label>
            <Form.Control
              as="select"
              value={filter}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => updateParams({
                filter: event.target.value === 'all' ? '' : event.target.value,
              })}
              aria-label={intl.formatMessage(messages.filterLabel)}
            >
              {FILTER_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {intl.formatMessage(messages[option.label])}
                </option>
              ))}
            </Form.Control>
          </Form.Group>

          <Form.Group className="mb-0" controlId="user-sort">
            <Form.Label className="sr-only">{intl.formatMessage(messages.sortLabel)}</Form.Label>
            <Form.Control
              as="select"
              value={ordering}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => updateParams({
                ordering: event.target.value === DEFAULT_ORDERING ? '' : event.target.value,
              })}
              aria-label={intl.formatMessage(messages.sortLabel)}
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {intl.formatMessage(messages[option.label])}
                </option>
              ))}
            </Form.Control>
          </Form.Group>
        </div>

        {isError ? (
          <ErrorState
            statusCode={statusCode || undefined}
            title={intl.formatMessage(messages.errorTitle)}
            onRetry={() => refetch()}
          />
        ) : (
          <AdminDataTable
            columns={columns}
            data={(data?.results ?? []) as unknown as Record<string, unknown>[]}
            isLoading={isLoading}
            caption={intl.formatMessage(messages.title)}
            pagination={data ? {
              currentPage: page,
              pageCount: data.pagination?.numPages
                ?? Math.max(1, Math.ceil((data.pagination?.count ?? 0) / PAGE_SIZE)),
              itemCount: data.pagination?.count ?? data.results.length,
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

      <UserDetailModal
        userId={modal.kind === 'view' ? modal.userId : null}
        onClose={() => setModal({ kind: 'none' })}
        onEdit={(userId) => setModal({ kind: 'edit', userId })}
      />

      <EditUserModal
        userId={modal.kind === 'edit' ? modal.userId : null}
        onClose={() => setModal({ kind: 'none' })}
      />
    </div>
  );
};

export default UsersListPage;
