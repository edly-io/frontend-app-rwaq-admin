/**
 * CategoryDetailPage — view a category's info and manage its linked courses.
 *
 * Two cards:
 *   1. Overview — name, arabic name, status.
 *   2. Linked courses — table of courses with Unlink per row, and a
 *      "Link course" button that opens LinkCourseModal.
 *
 * Editing the category's fields is done via CategoryFormModal (same pattern
 * as OrgDetailPage using OrgFormModal).
 */
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ActionRow, Alert, AlertModal, Button, Chip, Spinner,
} from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import DetailGrid from '@src/components/DetailGrid';
import { useToast } from '@src/components/ToastContext';
import { useCategory, useCategoryCourses, useUnlinkCourse } from './data/hooks';
import type { CategoryCourse } from './data/types';
import CategoryFormModal from './modals/CategoryFormModal';
import LinkCourseModal from './modals/LinkCourseModal';
import messages from './messages';

const CategoryDetailPage = () => {
  const intl = useIntl();
  const { id: rawId = '' } = useParams();
  const categoryId = parseInt(rawId, 10);
  const { showToast } = useToast();

  const [isEditing, setIsEditing] = useState(false);
  const [isLinking, setIsLinking] = useState(false);
  const [pendingUnlink, setPendingUnlink] = useState<CategoryCourse | null>(null);
  const [coursePage, setCoursePage] = useState(1);

  const COURSE_PAGE_SIZE = 10;

  const { data: category, isLoading, isError } = useCategory(categoryId);
  const {
    data: coursesData,
    isLoading: isLoadingCourses,
    isError: isCoursesError,
  } = useCategoryCourses(categoryId, { page: coursePage, pageSize: COURSE_PAGE_SIZE });

  const unlinkMutation = useUnlinkCourse(categoryId);

  const confirmUnlink = async () => {
    if (!pendingUnlink) { return; }
    try {
      await unlinkMutation.mutateAsync(pendingUnlink.courseKey);
      showToast(intl.formatMessage(messages.toastUnlinked));
      setPendingUnlink(null);
      setCoursePage(1);
    } catch (err) {
      logError(err);
      showToast(intl.formatMessage(messages.toastUnlinkError));
      setPendingUnlink(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rwaq-page">
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" screenReaderText={intl.formatMessage(messages.title)} />
        </div>
      </div>
    );
  }

  if (isError || !category) {
    return (
      <div className="rwaq-page">
        <Alert variant="danger">{intl.formatMessage(messages.notFound)}</Alert>
      </div>
    );
  }

  const courseRows = coursesData?.results ?? [];
  const coursePagination = coursesData?.pagination;

  const courseColumns: ColumnDef<CategoryCourse>[] = [
    {
      label: intl.formatMessage(messages.colCourse),
      key: 'displayName',
      renderCell: (value, row) => (
        <div className="min-width-0">
          <div className="rwaq-user-cell__name">{value as string}</div>
          <div className="rwaq-user-cell__meta">{row.courseKey as string}</div>
        </div>
      ),
    },
    {
      label: intl.formatMessage(messages.colOrg),
      key: 'org',
    },
    {
      label: intl.formatMessage(messages.colRun),
      key: 'run',
    },
    {
      label: intl.formatMessage(messages.colCourseActions),
      headerClassName: 'rwaq-th--actions',
      key: 'actions',
      renderCell: (_value, row) => (
        <div className="rwaq-row-actions">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setPendingUnlink(row as unknown as CategoryCourse)}
            aria-label={`${intl.formatMessage(messages.unlinkCourse)} ${row.displayName as string}`}
          >
            {intl.formatMessage(messages.unlinkCourse)}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="rwaq-page">
      {/* Breadcrumb + header */}
      <div className="rwaq-page-header">
        <div className="rwaq-page-header__breadcrumb">
          <Link to="/categories">{intl.formatMessage(messages.breadcrumb)}</Link>
          {` / ${category.name}`}
        </div>

        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mt-2">
          <h1 className="rwaq-page-title">{category.name}</h1>

          <div className="rwaq-header-actions">
            <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
              {intl.formatMessage(messages.editCategory)}
            </Button>
            <Button variant="primary" onClick={() => setIsLinking(true)}>
              {intl.formatMessage(messages.linkCourse)}
            </Button>
          </div>
        </div>
      </div>

      {/* Overview card */}
      <div className="rwaq-card">
        <DetailGrid
          title={intl.formatMessage(messages.detailOverview)}
          items={[
            { label: intl.formatMessage(messages.detailName), value: category.name },
            {
              label: intl.formatMessage(messages.detailArabicName),
              value: category.arabicName
                ? <span dir="auto">{category.arabicName}</span>
                : intl.formatMessage(messages.detailNone),
            },
            {
              label: intl.formatMessage(messages.detailStatus),
              value: (
                <Chip className={`rwaq-chip rwaq-chip--${category.isActive ? 'success' : 'light'}`}>
                  {intl.formatMessage(category.isActive ? messages.statusActive : messages.statusInactive)}
                </Chip>
              ),
            },
            {
              label: intl.formatMessage(messages.detailCourseCount),
              value: coursePagination?.count ?? courseRows.length,
            },
          ]}
        />
      </div>

      {/* Linked courses card */}
      <div className="rwaq-card">
        <h2 className="rwaq-section-title mb-4">
          {intl.formatMessage(messages.coursesTitle)}
        </h2>

        {isCoursesError && (
          <Alert variant="warning">{intl.formatMessage(messages.coursesError)}</Alert>
        )}

        {!isCoursesError && !isLoadingCourses && courseRows.length === 0 && (
          <p className="text-muted text-center py-5 mb-0">
            {intl.formatMessage(messages.coursesEmpty)}
          </p>
        )}

        {!isCoursesError && (isLoadingCourses || courseRows.length > 0) && (
          <AdminDataTable
            columns={courseColumns}
            data={courseRows}
            isLoading={isLoadingCourses}
            caption={intl.formatMessage(messages.coursesTitle)}
            pagination={coursePagination && coursePagination.count > COURSE_PAGE_SIZE ? {
              currentPage: coursePage,
              pageCount: coursePagination.numPages || 1,
              itemCount: coursePagination.count,
              pageSize: COURSE_PAGE_SIZE,
              onPageChange: setCoursePage,
            } : undefined}
          />
        )}
      </div>

      {/* Unlink confirmation */}
      <AlertModal
        title={intl.formatMessage(messages.unlinkConfirmTitle)}
        isOpen={pendingUnlink !== null}
        onClose={() => setPendingUnlink(null)}
        footerNode={(
          <ActionRow>
            <Button variant="tertiary" onClick={() => setPendingUnlink(null)}>
              {intl.formatMessage(messages.cancel)}
            </Button>
            <Button
              variant="danger"
              onClick={confirmUnlink}
              disabled={unlinkMutation.isPending}
            >
              {intl.formatMessage(messages.unlinkConfirm)}
            </Button>
          </ActionRow>
        )}
      >
        <p>
          {intl.formatMessage(messages.unlinkConfirmBody, { name: pendingUnlink?.displayName ?? '' })}
        </p>
      </AlertModal>

      {/* Modals */}
      <CategoryFormModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        category={category}
      />

      <LinkCourseModal
        isOpen={isLinking}
        onClose={() => setIsLinking(false)}
        onSuccess={() => setCoursePage(1)}
        categoryId={categoryId}
        categoryName={category.name}
      />
    </div>
  );
};

export default CategoryDetailPage;
