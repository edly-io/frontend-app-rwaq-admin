/**
 * OrgDetailPage — read an organization and manage who administers it.
 *
 * Profile *editing* lives in the list page's row action now, so this page has
 * one job each for its two cards: state the org's facts, and run its admin
 * roster. That split is why the form that used to sit here is gone.
 */
import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import {
  Alert, Button, Chip, Spinner,
} from '@openedx/paragon';
import { getConfig } from '@edx/frontend-platform';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import DetailGrid from '@src/components/DetailGrid';
import ProfileAvatar from '@src/components/ProfileAvatar';
import { useCourses } from '@src/data/hooks';
import type { CourseSummary } from '@src/data/hooks';
import OrgAdminTable from './components/OrgAdminTable';
import AddOrgAdminModal from './modals/AddOrgAdminModal';
import OrgFormModal from './modals/OrgFormModal';
import { useOrganization } from './data/hooks';
import messages from './messages';

// ── Org courses table ─────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

const OrgCoursesTable = ({ org }: { org: string }) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = parseInt(searchParams.get('cp') || '1', 10);
  const setPage = (p: number) => setSearchParams(
    (prev) => { const next = new URLSearchParams(prev); next.set('cp', String(p)); return next; },
    { replace: true },
  );
  const { data, isLoading, isError } = useCourses({ org, page, pageSize: PAGE_SIZE });

  const formatDate = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString() : intl.formatMessage(messages.detailNone));

  const columns: ColumnDef<CourseSummary>[] = [
    {
      label: intl.formatMessage(messages.orgCoursesColCourse),
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
      label: intl.formatMessage(messages.orgCoursesColStart),
      key: 'start',
      renderCell: (value) => formatDate(value as string | null),
    },
    {
      label: intl.formatMessage(messages.orgCoursesColEnd),
      key: 'end',
      renderCell: (value) => formatDate(value as string | null),
    },
    {
      label: intl.formatMessage(messages.orgCoursesColEnrollments),
      key: 'enrollmentCount',
      renderCell: (value) => String(value as number),
    },
    {
      label: '',
      headerClassName: 'rwaq-th--actions',
      key: 'actions',
      renderCell: (_value, row) => (
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => navigate(`/courses/${encodeURIComponent(row.courseId as string)}`)}
          aria-label={intl.formatMessage(messages.orgCoursesViewAriaLabel, { name: row.displayName as string })}
        >
          {intl.formatMessage(messages.orgCoursesView)}
        </Button>
      ),
    },
  ];

  if (isError) {
    return <Alert variant="warning">{intl.formatMessage(messages.orgCoursesError)}</Alert>;
  }

  const count = data?.pagination?.count ?? 0;
  const numPages = data?.pagination?.numPages ?? Math.ceil(count / PAGE_SIZE);

  return (
    <AdminDataTable
      columns={columns}
      data={data?.results ?? []}
      isLoading={isLoading}
      caption={intl.formatMessage(messages.detailCourses)}
      pagination={count > PAGE_SIZE ? {
        currentPage: page,
        pageCount: numPages || 1,
        itemCount: count,
        pageSize: PAGE_SIZE,
        onPageChange: setPage,
      } : undefined}
    />
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

const OrgDetailPage = () => {
  const intl = useIntl();
  const { shortName = '' } = useParams();
  const { data: organization, isLoading, isError } = useOrganization(shortName);
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const dash = intl.formatMessage(messages.detailNone);

  if (isLoading) {
    return (
      <div className="rwaq-page">
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" screenReaderText={intl.formatMessage(messages.title)} />
        </div>
      </div>
    );
  }

  if (isError || !organization) {
    return (
      <div className="rwaq-page">
        <Alert variant="danger">{intl.formatMessage(messages.notFound)}</Alert>
      </div>
    );
  }

  return (
    <div className="rwaq-page">
      <div className="rwaq-page-header">
        <div className="rwaq-page-header__breadcrumb">
          <Link to="/organizations">{intl.formatMessage(messages.breadcrumb)}</Link>
          {` / ${organization.name}`}
        </div>

        <div className="d-flex justify-content-between align-items-start flex-wrap rwaq-gap-md mt-2">
          <div className="min-width-0">
            <h1 className="rwaq-page-title mb-2">{organization.name}</h1>
            <div className="d-flex align-items-center flex-wrap rwaq-chip-list">
              <Chip className={`rwaq-chip rwaq-chip--${organization.active ? 'success' : 'light'}`}>
                {intl.formatMessage(organization.active ? messages.statusActive : messages.statusInactive)}
              </Chip>
            </div>
          </div>

          <div className="rwaq-header-actions">
            <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
              {intl.formatMessage(messages.editOrg)}
            </Button>
            <Button variant="primary" onClick={() => setIsAddingAdmin(true)}>
              {intl.formatMessage(messages.addAdmin)}
            </Button>
          </div>
        </div>
      </div>

      <div className="rwaq-card">
        <DetailGrid
          title={intl.formatMessage(messages.detailOverview)}
          items={[
            { label: intl.formatMessage(messages.detailShortName), value: organization.shortName },
            {
              label: intl.formatMessage(messages.detailArabicName),
              value: organization.arabicName
                ? <span dir="auto">{organization.arabicName}</span>
                : dash,
            },
            { label: intl.formatMessage(messages.detailCourses), value: organization.courseCount },
            { label: intl.formatMessage(messages.detailAdmins), value: organization.adminCount },
            {
              label: intl.formatMessage(messages.detailFeaturedVideo),
              value: organization.featuredVideo
                ? (
                  <a href={organization.featuredVideo} target="_blank" rel="noreferrer">
                    {organization.featuredVideo}
                  </a>
                )
                : dash,
            },
          ]}
        />
      </div>

      <div className="rwaq-card">
        <h2 className="rwaq-section-title mb-4">
          {intl.formatMessage(messages.detailAdmins)}
        </h2>

        <OrgAdminTable shortName={organization.shortName} members={organization.members ?? []} />
      </div>

      <div className="rwaq-card">
        <h2 className="rwaq-section-title mb-4">{intl.formatMessage(messages.detailCourses)}</h2>
        <OrgCoursesTable org={organization.shortName} />
      </div>

      <AddOrgAdminModal
        isOpen={isAddingAdmin}
        onClose={() => setIsAddingAdmin(false)}
        shortName={organization.shortName}
      />

      <OrgFormModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        organization={organization}
      />
    </div>
  );
};

export default OrgDetailPage;
