/**
 * CategoryListPage — list all categories, create new ones.
 *
 * Superuser-only: the backend enforces this; the frontend just surfaces
 * whatever the API returns (or an error state if the user lacks permission).
 */
import { useCallback, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Chip } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import ErrorState from '@src/components/ErrorState';
import { getErrorStatus } from '@src/data/httpError';
import { useCategory, useCategories } from './data/hooks';
import type { CategorySummary, CategoryDetail } from './data/types';
import CategoryFormModal from './modals/CategoryFormModal';
import messages from './messages';

const PAGE_SIZE = 15;

const CategoryListPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const page = Number(searchParams.get('page') ?? 1);

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
  } = useCategories({ page, pageSize: PAGE_SIZE });

  // Fetch the full detail only when editing a row — the list row doesn't carry
  // enough info to pre-populate the form reliably (same pattern as OrgListPage).
  const { data: editingCategory } = useCategory(editingId ?? 0);

  const statusCode = isError ? getErrorStatus(error) : undefined;

  const columns: ColumnDef<CategorySummary>[] = [
    {
      label: intl.formatMessage(messages.colName),
      key: 'name',
    },
    {
      label: intl.formatMessage(messages.colArabicName),
      key: 'arabicName',
      renderCell: (value) => (value
        ? <span className="rwaq-bidi" dir="auto">{value as string}</span>
        : <span className="text-muted">{intl.formatMessage(messages.detailNone)}</span>),
    },
    {
      label: intl.formatMessage(messages.colStatus),
      key: 'isActive',
      renderCell: (value) => (
        <Chip className={`rwaq-chip rwaq-chip--${value ? 'success' : 'light'}`}>
          {intl.formatMessage(value ? messages.statusActive : messages.statusInactive)}
        </Chip>
      ),
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
            onClick={() => navigate(`/categories/${row.id as number}`)}
            aria-label={`${intl.formatMessage(messages.view)} ${row.name as string}`}
          >
            {intl.formatMessage(messages.view)}
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setEditingId(row.id as number)}
            aria-label={`${intl.formatMessage(messages.edit)} ${row.name as string}`}
          >
            {intl.formatMessage(messages.edit)}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="rwaq-page rwaq-page--fit">
      <div className="rwaq-page-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h1 className="rwaq-page-title">{intl.formatMessage(messages.title)}</h1>
          <Button variant="primary" onClick={() => setIsCreating(true)}>
            {intl.formatMessage(messages.addCategory)}
          </Button>
        </div>
      </div>

      <div className="rwaq-card rwaq-card--fit">
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

      <CategoryFormModal
        isOpen={isCreating}
        onClose={() => setIsCreating(false)}
        category={null}
      />

      {/* Edit: wait for the full detail before opening so the form isn't half-populated. */}
      <CategoryFormModal
        isOpen={editingId !== null && !!editingCategory}
        onClose={() => setEditingId(null)}
        category={(editingCategory as CategoryDetail) ?? null}
      />
    </div>
  );
};

export default CategoryListPage;
