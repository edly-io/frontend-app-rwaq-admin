/**
 * CourseDetailPage — course info + Student Management + Course Team.
 *
 * Same structure as UserDetailPage: breadcrumb, title, info card, then
 * operational cards. Three distinct sections:
 *   1. Course Info — read-only metadata
 *   2. Student Management — paginated enrollment table, CSV download, Enroll a User
 *   3. Course Team — staff table, Add Member, Remove per row
 */
import { useCallback, useState } from 'react';
import {
  Link, useNavigate, useParams, useSearchParams,
} from 'react-router-dom';
import {
  Alert, Badge, Button, Spinner,
} from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import { getConfig } from '@edx/frontend-platform';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import DetailGrid from '@src/components/DetailGrid';
import ProfileAvatar from '@src/components/ProfileAvatar';
import ErrorState from '@src/components/ErrorState';
import { useToast } from '@src/components/ToastContext';
import { getErrorStatus } from '@src/data/httpError';
import {
  useCourse,
  useCourseEnrollments,
  useCourseStaff,
  useDownloadCourseEnrollmentsCsv,
  useRemoveCourseStaff,
} from './data/hooks';
import type {
  CourseEnrollmentRow,
  CourseStaffMember,
} from './data/types';
import EnrollUserModal from './modals/EnrollUserModal';
import AddStaffModal from './modals/AddStaffModal';
import messages from './messages';

const ENROLLMENT_PAGE_SIZE = 10;
const STAFF_PAGE_SIZE = 10;

// ── Role label ────────────────────────────────────────────────────────────────

const ROLE_MESSAGE_KEYS: Record<string, keyof typeof messages> = {
  instructor: 'roleInstructor',
  staff: 'roleStaff',
  limited_staff: 'roleLimitedStaff',
  beta_testers: 'roleBeta',
  data_researcher: 'roleDataResearcher',
};

// ── Modal state ───────────────────────────────────────────────────────────────

type ModalState =
  | { kind: 'none' }
  | { kind: 'enroll' }
  | { kind: 'addStaff' };

// ── Page ──────────────────────────────────────────────────────────────────────

const CourseDetailPage = () => {
  const intl = useIntl();
  const navigate = useNavigate();
  const { courseId: rawCourseId = '' } = useParams();
  const courseId = decodeURIComponent(rawCourseId);
  const { showToast } = useToast();

  const [searchParams, setSearchParams] = useSearchParams();
  const enrollPage = Number(searchParams.get('ep') ?? 1);

  const setEnrollPage = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('ep', String(newPage));
        return next;
      }, { replace: true });
    },
    [setSearchParams],
  );

  const [modal, setModal] = useState<ModalState>({ kind: 'none' });
  const [staffPage, setStaffPage] = useState(1);

  // ── Data ───────────────────────────────────────────────────────────────────

  const { data: course, isLoading, isError } = useCourse(courseId);

  const {
    data: enrollmentData,
    isLoading: isLoadingEnrollments,
    isError: isEnrollmentsError,
    refetch: refetchEnrollments,
    error: enrollmentsError,
  } = useCourseEnrollments(courseId, { page: enrollPage, pageSize: ENROLLMENT_PAGE_SIZE });

  const {
    data: staff,
    isLoading: isLoadingStaff,
    isError: isStaffError,
  } = useCourseStaff(courseId);

  const csvMutation = useDownloadCourseEnrollmentsCsv(courseId);
  const removeStaffMutation = useRemoveCourseStaff(courseId);

  // ── CSV download ───────────────────────────────────────────────────────────

  const handleDownloadCsv = async () => {
    try {
      const blob = await csvMutation.mutateAsync();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `enrollments-${courseId}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      logError(err);
      showToast(intl.formatMessage(messages.toastCsvError));
    }
  };

  // ── Remove staff ───────────────────────────────────────────────────────────

  const handleRemoveStaff = async (member: CourseStaffMember) => {
    try {
      await removeStaffMutation.mutateAsync({ userId: member.userId, role: member.role });
      showToast(`${member.name || member.username} ${intl.formatMessage(messages.toastRemovedFromTeam)}`);
    } catch (err) {
      logError(err);
      showToast(intl.formatMessage(messages.toastRemoveTeamError));
    }
  };

  // ── Loading / error ────────────────────────────────────────────────────────

  const dash = intl.formatMessage(messages.noDate);

  if (isLoading) {
    return (
      <div className="rwaq-page">
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" screenReaderText={intl.formatMessage(messages.loadingCourse)} />
        </div>
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="rwaq-page">
        <Alert variant="danger">{intl.formatMessage(messages.courseErrorTitle)}</Alert>
      </div>
    );
  }

  // ── Columns: enrollments ───────────────────────────────────────────────────

  const enrollmentColumns: ColumnDef<CourseEnrollmentRow>[] = [
    {
      label: intl.formatMessage(messages.enrollmentColUser),
      key: 'name',
      renderCell: (value, row) => (
        <div className="rwaq-user-cell">
          <div className="min-width-0">
            <div className="rwaq-user-cell__name">{(value as string) || '—'}</div>
            <div className="rwaq-user-cell__meta">{row.email as string}</div>
          </div>
        </div>
      ),
    },
    {
      label: intl.formatMessage(messages.enrollmentColMode),
      key: 'mode',
      renderCell: (value) => <span>{value as string}</span>,
    },
    {
      label: intl.formatMessage(messages.enrollmentColStatus),
      key: 'isActive',
      renderCell: (value) => (
        <Badge variant={value ? 'success' : 'light'}>
          {value
            ? intl.formatMessage(messages.enrollmentActive)
            : intl.formatMessage(messages.enrollmentInactive)}
        </Badge>
      ),
    },
    {
      label: intl.formatMessage(messages.enrollmentColEnrolledAt),
      key: 'enrolledAt',
      renderCell: (value) => (value
        ? new Date(value as string).toLocaleDateString()
        : dash),
    },
  ];

  // ── Columns: staff ─────────────────────────────────────────────────────────

  const staffColumns: ColumnDef<CourseStaffMember>[] = [
    {
      label: intl.formatMessage(messages.staffColMember),
      key: 'name',
      renderCell: (value, row) => (
        <div className="rwaq-user-cell">
          <div className="min-width-0">
            <div className="rwaq-user-cell__name">{(value as string) || row.username as string}</div>
            <div className="rwaq-user-cell__meta">{row.email as string}</div>
          </div>
        </div>
      ),
    },
    {
      label: intl.formatMessage(messages.staffColRole),
      key: 'role',
      renderCell: (value) => {
        const key = ROLE_MESSAGE_KEYS[value as string];
        return <span>{key ? intl.formatMessage(messages[key]) : value as string}</span>;
      },
    },
    {
      label: intl.formatMessage(messages.staffColActions),
      headerClassName: 'rwaq-th--actions',
      key: 'actions',
      renderCell: (_value, row) => (
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => handleRemoveStaff(row as unknown as CourseStaffMember)}
          disabled={removeStaffMutation.isPending}
        >
          {intl.formatMessage(messages.removeStaff)}
        </Button>
      ),
    },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  const enrollmentRows = enrollmentData?.results ?? [];
  const allStaffRows = staff ?? [];
  const staffPageCount = Math.max(1, Math.ceil(allStaffRows.length / STAFF_PAGE_SIZE));
  // Clamp page in case a removal shrinks the total below the current page boundary.
  const safeStaffPage = Math.min(staffPage, staffPageCount);
  const staffRows = allStaffRows.slice((safeStaffPage - 1) * STAFF_PAGE_SIZE, safeStaffPage * STAFF_PAGE_SIZE);

  const formatDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString() : dash);

  return (
    <div className="rwaq-page">
      {/* Breadcrumb */}
      <div className="rwaq-page-header">
        <div className="rwaq-page-header__breadcrumb">
          <Link to="/courses">{intl.formatMessage(messages.backToCourses)}</Link>
          {` / ${course.displayName}`}
        </div>

        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mt-2">
          <div className="rwaq-detail-header min-width-0">
            <ProfileAvatar
              src={course.courseImageUrl ? `${getConfig().LMS_BASE_URL}${course.courseImageUrl}` : null}
              name={course.displayName}
              size="lg"
            />
            <div className="min-width-0">
              <h1 className="rwaq-page-title mb-1">{course.displayName}</h1>
              <div className="rwaq-detail-header__email">{course.courseId}</div>
              {course.categories.length > 0 && (
                <div className="d-flex flex-wrap gap-1 mt-2">
                  {course.categories.map((cat) => (
                    <Badge key={cat.slug} variant="light">{cat.name}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Reports shortcut — superuser-only; the page itself enforces auth */}
          <div className="flex-shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(`/courses/${encodeURIComponent(courseId)}/reports`)}
            >
              {intl.formatMessage(messages.viewReports)}
            </Button>
          </div>
        </div>
      </div>

      {/* ── Info card ─────────────────────────────────────────────────────── */}
      <div className="rwaq-card">
        <DetailGrid
          className="rwaq-detail-block"
          title={intl.formatMessage(messages.courseInfoTitle)}
          items={[
            { label: intl.formatMessage(messages.fieldCourseId), value: course.courseId },
            { label: intl.formatMessage(messages.fieldOrg), value: course.org },
            { label: intl.formatMessage(messages.fieldStart), value: formatDate(course.start) },
            { label: intl.formatMessage(messages.fieldEnd), value: formatDate(course.end) },
            {
              label: intl.formatMessage(messages.fieldPace),
              value: course.selfPaced
                ? intl.formatMessage(messages.selfPaced)
                : intl.formatMessage(messages.instructorPaced),
            },
          ]}
        />
      </div>

      {/* ── Student Management ─────────────────────────────────────────────── */}
      <div className="rwaq-card">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <h2 className="rwaq-section-title mb-0">
            {intl.formatMessage(messages.enrollmentsSectionTitle)}
          </h2>
          <div className="rwaq-header-actions">
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleDownloadCsv}
              disabled={csvMutation.isPending || !enrollmentData?.pagination?.count}
            >
              {csvMutation.isPending
                ? intl.formatMessage(messages.downloadingCsv)
                : intl.formatMessage(messages.downloadCsv)}
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setModal({ kind: 'enroll' })}
            >
              {intl.formatMessage(messages.enrollUser)}
            </Button>
          </div>
        </div>

        {isEnrollmentsError ? (
          <ErrorState
            statusCode={getErrorStatus(enrollmentsError) || undefined}
            title={intl.formatMessage(messages.enrollmentsErrorTitle)}
            onRetry={() => refetchEnrollments()}
          />
        ) : (
          <AdminDataTable
            columns={enrollmentColumns}
            data={enrollmentRows}
            isLoading={isLoadingEnrollments}
            caption={intl.formatMessage(messages.enrollmentsSectionTitle)}
            pagination={enrollmentData ? {
              currentPage: enrollPage,
              pageCount: enrollmentData.pagination?.numPages
                ?? Math.max(1, Math.ceil((enrollmentData.pagination?.count ?? 0) / ENROLLMENT_PAGE_SIZE)),
              itemCount: enrollmentData.pagination?.count ?? enrollmentRows.length,
              pageSize: ENROLLMENT_PAGE_SIZE,
              onPageChange: setEnrollPage,
            } : undefined}
          />
        )}
      </div>

      {/* ── Course Team ────────────────────────────────────────────────────── */}
      <div className="rwaq-card">
        <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
          <div>
            <h2 className="rwaq-section-title mb-1">
              {intl.formatMessage(messages.staffSectionTitle)}
            </h2>
            <p className="text-muted small mb-0">
              {intl.formatMessage(messages.staffSectionDescription)}
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setModal({ kind: 'addStaff' })}
          >
            {intl.formatMessage(messages.addStaff)}
          </Button>
        </div>

        {isStaffError && (
          <Alert variant="danger">{intl.formatMessage(messages.staffErrorTitle)}</Alert>
        )}

        {!isStaffError && !isLoadingStaff && allStaffRows.length === 0 && (
          <p className="text-muted text-center py-5 mb-0">
            {intl.formatMessage(messages.staffEmpty)}
          </p>
        )}

        {!isStaffError && (isLoadingStaff || allStaffRows.length > 0) && (
          <AdminDataTable
            columns={staffColumns}
            data={staffRows}
            isLoading={isLoadingStaff}
            caption={intl.formatMessage(messages.staffSectionTitle)}
            pagination={{
              currentPage: safeStaffPage,
              pageCount: staffPageCount,
              itemCount: allStaffRows.length,
              pageSize: STAFF_PAGE_SIZE,
              onPageChange: (page: number) => setStaffPage(page),
            }}
          />
        )}
      </div>

      {/* ── Modals ──────────────────────────────────────────────────────────── */}
      <EnrollUserModal
        isOpen={modal.kind === 'enroll'}
        onClose={() => setModal({ kind: 'none' })}
        courseId={courseId}
        courseName={course.displayName}
      />

      <AddStaffModal
        isOpen={modal.kind === 'addStaff'}
        onClose={() => setModal({ kind: 'none' })}
        courseId={courseId}
        courseName={course.displayName}
      />
    </div>
  );
};

export default CourseDetailPage;
