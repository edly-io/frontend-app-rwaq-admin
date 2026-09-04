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
  Alert, Button, Chip, Spinner,
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

  const { data: category, isLoading, isError } = useCategory(categoryId);
  const {
    data: courses,
    isLoading: isLoadingCourses,
    isError: isCoursesError,
  } = useCategoryCourses(categoryId);

  const unlinkMutation = useUnlinkCourse(categoryId);

  const handleUnlink = async (course: CategoryCourse) => {
    try {
      await unlinkMutation.mutateAsync(course.courseKey);
      showToast(intl.formatMessage(messages.toastUnlinked));
    } catch (err) {
      logError(err);
      showToast(intl.formatMessage(messages.toastUnlinkError));
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

  const courseRows = courses ?? [];

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
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => handleUnlink(row as unknown as CategoryCourse)}
          disabled={unlinkMutation.isPending}
        >
          {intl.formatMessage(messages.unlinkCourse)}
        </Button>
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
          <div className="min-width-0">
            <h1 className="rwaq-page-title mb-2">{category.name}</h1>
            {category.arabicName && (
              <div className="rwaq-bidi text-muted mb-2" dir="auto">{category.arabicName}</div>
            )}
            <Chip className={`rwaq-chip rwaq-chip--${category.isActive ? 'success' : 'light'}`}>
              {intl.formatMessage(category.isActive ? messages.statusActive : messages.statusInactive)}
            </Chip>
          </div>

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
              value: courseRows.length,
            },
          ]}
        />
      </div>

      {/* Linked courses card */}
      <div className="rwaq-card">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <h2 className="rwaq-section-title mb-0">
            {intl.formatMessage(messages.coursesTitle)}
          </h2>
          <Button variant="primary" size="sm" onClick={() => setIsLinking(true)}>
            {intl.formatMessage(messages.linkCourse)}
          </Button>
        </div>

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
          />
        )}
      </div>

      {/* Modals */}
      <CategoryFormModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        category={category}
      />

      <LinkCourseModal
        isOpen={isLinking}
        onClose={() => setIsLinking(false)}
        categoryId={categoryId}
        categoryName={category.name}
      />
    </div>
  );
};

export default CategoryDetailPage;
