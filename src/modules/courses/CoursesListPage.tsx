/**
 * CoursesListPage — Course Management.
 *
 * Displays a paginated table of all platform courses. Search, filter, sort,
 * and page state live in the URL so views are linkable and survive refresh.
 * Clicking "View" navigates to CourseDetailPage — no drawer, no modal.
 */
import { useCallback, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Badge, Button } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import ErrorState from '@src/components/ErrorState';
import { getErrorStatus } from '@src/data/httpError';
import SearchFilterBar from '@src/components/SearchFilterBar';
import type { AppliedChip, SelectOption } from '@src/components/SearchFilterBar';
import ProfileAvatar from '@src/components/ProfileAvatar';
import { useCourses } from './data/hooks';
import type { CourseSummary, CourseOrdering } from './data/types';
import messages from './messages';

const PAGE_SIZE = 10;
const DEFAULT_ORDERING: CourseOrdering = '-start';

type MessageKey = keyof typeof messages;

const SORT_OPTIONS: { value: CourseOrdering; label: MessageKey }[] = [
  { value: '-start', label: 'sortStartDesc' },
  { value: 'start', label: 'sortStartAsc' },
  { value: '-end', label: 'sortEndDesc' },
  { value: 'end', label: 'sortEndAsc' },
  { value: 'display_name', label: 'sortNameAsc' },
  { value: '-display_name', label: 'sortNameDesc' },
  { value: 'org', label: 'sortOrgAsc' },
  { value: '-enrollment_count', label: 'sortEnrollmentsDesc' },
];

const CoursesListPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get('page') ?? 1);
  const search = searchParams.get('search') ?? '';
  const org = searchParams.get('org') ?? '';
  const hasExplicitOrdering = searchParams.get('ordering') !== null;
  const ordering = (searchParams.get('ordering') as CourseOrdering | null) ?? DEFAULT_ORDERING;

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
  } = useCourses({
    search: search || undefined,
    org: org || undefined,
    ordering,
    page,
    pageSize: PAGE_SIZE,
  });

  const statusCode = isError ? getErrorStatus(error) : undefined;

  const sortOptions: SelectOption[] = SORT_OPTIONS.map((opt) => ({
    value: opt.value,
    label: intl.formatMessage(messages[opt.label]),
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
    if (org) {
      chips.push({
        key: 'org',
        label: intl.formatMessage(messages.chipOrg, { org }),
        onRemove: () => updateParams({ org: '' }),
      });
    }
    if (hasExplicitOrdering) {
      chips.push({
        key: 'ordering',
        label: intl.formatMessage(messages.chipSort, {
          label: sortOptions.find((o) => o.value === ordering)?.label ?? ordering,
        }),
        onRemove: () => updateParams({ ordering: '' }),
      });
    }
    return chips;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, org, ordering, hasExplicitOrdering, intl, updateParams]);

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const formatDate = (iso: string | null) => (
    iso ? new Date(iso).toLocaleDateString() : intl.formatMessage(messages.noDate)
  );

  const formatEnrollments = (row: CourseSummary) => String(row.enrollmentCount);

  const formatPassing = (row: CourseSummary) => {
    if (row.passingCount === null) { return intl.formatMessage(messages.notAvailable); }
    return String(row.passingCount);
  };

  // ── Columns ───────────────────────────────────────────────────────────────────

  const columns: ColumnDef<CourseSummary>[] = [
    {
      label: intl.formatMessage(messages.colCourse),
      key: 'displayName',
      renderCell: (value, row) => (
        <div className="rwaq-user-cell">
          <ProfileAvatar
            src={row.courseImageUrl ? `${getConfig().LMS_BASE_URL}${row.courseImageUrl as string}` : null}
            name={value as string}
            size="sm"
          />
          <div className="min-width-0">
            <div className="rwaq-user-cell__name">{value as string}</div>
            <div className="rwaq-user-cell__meta">{row.courseId as string}</div>
          </div>
        </div>
      ),
    },
    {
      label: intl.formatMessage(messages.colOrg),
      key: 'org',
      renderCell: (value) => <span>{value as string}</span>,
    },
    {
      label: intl.formatMessage(messages.colCategory),
      key: 'categories',
      renderCell: (_value, row) => {
        const cats = row.categories as CourseSummary['categories'];
        if (!cats || cats.length === 0) {
          return <span className="text-muted">{intl.formatMessage(messages.noCategory)}</span>;
        }
        return (
          <div className="d-flex flex-wrap gap-1">
            {cats.map((cat) => (
              <Badge key={cat.slug} variant="light">{cat.name}</Badge>
            ))}
          </div>
        );
      },
    },
    {
      label: intl.formatMessage(messages.colStart),
      key: 'start',
      renderCell: (value) => formatDate(value as string | null),
    },
    {
      label: intl.formatMessage(messages.colEnd),
      key: 'end',
      renderCell: (value) => formatDate(value as string | null),
    },
    {
      label: intl.formatMessage(messages.colEnrollments),
      key: 'enrollmentCount',
      renderCell: (_value, row) => formatEnrollments(row as CourseSummary),
    },
    {
      label: intl.formatMessage(messages.colPassing),
      key: 'passingCount',
      renderCell: (_value, row) => formatPassing(row as CourseSummary),
    },
    {
      label: intl.formatMessage(messages.colActions),
      headerClassName: 'rwaq-th--actions',
      key: 'actions',
      renderCell: (_value, row) => (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => navigate(`/courses/${encodeURIComponent(row.courseId as string)}`)}
          aria-label={intl.formatMessage(messages.viewCourseAriaLabel, { courseName: row.displayName as string })}
        >
          {intl.formatMessage(messages.view)}
        </Button>
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
              id: 'ordering',
              label: intl.formatMessage(messages.sortLabel),
              value: ordering,
              options: sortOptions,
              onChange: (value) => updateParams({ ordering: value }),
            },
          ]}
          appliedChips={appliedChips}
          onClearAll={() => updateParams({ search: '', org: '', ordering: '' })}
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

export default CoursesListPage;
