/**
 * OrgDetailPage — read an organization and manage who administers it.
 *
 * Profile *editing* lives in the list page's row action now, so this page has
 * one job each for its two cards: state the org's facts, and run its admin
 * roster. That split is why the form that used to sit here is gone.
 */
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert, Button, Chip, Spinner,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import DetailGrid from '@src/components/DetailGrid';
import OrgAdminTable from './components/OrgAdminTable';
import AddOrgAdminModal from './modals/AddOrgAdminModal';
import OrgFormModal from './modals/OrgFormModal';
import { useOrganization } from './data/hooks';
import messages from './messages';

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

        <div className="d-flex justify-content-between align-items-start flex-wrap gap-3 mt-2">
          <div className="min-width-0">
            <h1 className="rwaq-page-title mb-2">{organization.name}</h1>
            <div className="d-flex align-items-center flex-wrap rwaq-chip-list">
              <Chip className={`rwaq-chip rwaq-chip--${organization.active ? 'success' : 'light'}`}>
                {intl.formatMessage(organization.active ? messages.statusActive : messages.statusInactive)}
              </Chip>
              {organization.isFeatured && (
                <Chip className="rwaq-chip rwaq-chip--info">
                  {intl.formatMessage(messages.detailFeatured)}
                </Chip>
              )}
            </div>
          </div>

          <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
            {intl.formatMessage(messages.editOrg)}
          </Button>
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
                ? <span dir="rtl">{organization.arabicName}</span>
                : dash,
            },
            { label: intl.formatMessage(messages.detailCourses), value: organization.courseCount },
            { label: intl.formatMessage(messages.detailAdmins), value: organization.adminCount },
            {
              label: intl.formatMessage(messages.detailFeatured),
              value: intl.formatMessage(organization.isFeatured ? messages.yes : messages.no),
            },
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
            {
              label: intl.formatMessage(messages.detailAbout),
              value: organization.detail || dash,
              isWide: true,
            },
          ]}
        />
      </div>

      <div className="rwaq-card mt-4">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
          <h2 className="rwaq-section-title mb-0">
            {intl.formatMessage(messages.detailAdmins)}
          </h2>
          <Button variant="primary" size="sm" onClick={() => setIsAddingAdmin(true)}>
            {intl.formatMessage(messages.addAdmin)}
          </Button>
        </div>

        <OrgAdminTable shortName={organization.shortName} members={organization.members ?? []} />
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
