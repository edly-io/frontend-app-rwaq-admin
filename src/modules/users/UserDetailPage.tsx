/**
 * UserDetailPage — read a user and manage their enrollments.
 *
 * This replaced a modal, and the enrollment dialogs it opens replaced modals
 * opened *on top of* that modal. Stacked dialogs put two close buttons and two
 * footers on screen at once, and dimmed the very table the admin was acting
 * on — so the record moved onto a page and the dialogs became single-level.
 *
 * Deliberately the same shape as OrgDetailPage: breadcrumb, title with status
 * chips, two header actions, then one card stating the record's facts and one
 * running the thing attached to it. Both pages are "here is an entity, here is
 * its roster", so they should not look like two different designs.
 */
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Alert, Button, Spinner,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import DetailGrid from '@src/components/DetailGrid';
import ProfileAvatar from '@src/components/ProfileAvatar';
import { countryName } from './data/countries';
import EnrollmentsTable from './components/EnrollmentsTable';
import RoleBadges from './components/RoleBadges';
import StatusBadges from './components/StatusBadges';
import EditUserModal from './modals/EditUserModal';
import EnrollModal from './modals/EnrollModal';
import ChangeModeModal from './modals/ChangeModeModal';
import UnenrollModal from './modals/UnenrollModal';
import { useUser, useUserEnrollments } from './data/hooks';
import type { UserEnrollment } from './data/types';
import messages from './messages';

const ALL_ROLES_VISIBLE = 99;

const UserDetailPage = () => {
  const intl = useIntl();
  const { id = '' } = useParams();
  const userId = Number(id);

  const { data: user, isLoading, isError } = useUser(userId);
  const {
    data: enrollments, isLoading: isLoadingEnrollments, isError: isEnrollmentsError,
  } = useUserEnrollments(userId);

  const [isEditing, setIsEditing] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  // One row at a time: which row a dialog is about has to be unambiguous, and
  // a boolean plus a separate id can disagree.
  const [modeTarget, setModeTarget] = useState<UserEnrollment | null>(null);
  const [unenrollTarget, setUnenrollTarget] = useState<UserEnrollment | null>(null);

  const dash = intl.formatMessage(messages.detailNone);

  if (isLoading) {
    return (
      <div className="rwaq-page">
        <div className="d-flex justify-content-center py-5">
          <Spinner animation="border" screenReaderText={intl.formatMessage(messages.detailTitle)} />
        </div>
      </div>
    );
  }

  // Covers a bad id in the URL as well as a failed request — this page is
  // reachable by typing a URL, not only by clicking a row.
  if (isError || !user) {
    return (
      <div className="rwaq-page">
        <Alert variant="danger">{intl.formatMessage(messages.errorTitle)}</Alert>
      </div>
    );
  }

  const rows = enrollments ?? [];
  const displayName = user.name || user.username;

  return (
    <div className="rwaq-page">
      <div className="rwaq-page-header">
        <div className="rwaq-page-header__breadcrumb">
          <Link to="/users">{intl.formatMessage(messages.title)}</Link>
          {` / ${displayName}`}
        </div>

        <div className="d-flex justify-content-between align-items-start flex-wrap rwaq-gap-md mt-2">
          <div className="rwaq-detail-header min-width-0">
            <ProfileAvatar src={user.image} name={displayName} size="lg" />
            <div className="min-width-0">
              <h1 className="rwaq-page-title mb-1">{displayName}</h1>
              <div className="rwaq-detail-header__email">{user.email}</div>
              <div className="mt-2 d-flex align-items-center flex-wrap rwaq-chip-list">
                <StatusBadges
                  isActive={user.isActive}
                  isEmailConfirmed={user.isEmailConfirmed}
                  isLegacy={user.isLegacy}
                  showSecondary
                />
              </div>
            </div>
          </div>

          <div className="rwaq-header-actions">
            <Button variant="outline-primary" onClick={() => setIsEditing(true)}>
              {intl.formatMessage(messages.editUser)}
            </Button>
            <Button variant="primary" onClick={() => setIsEnrolling(true)}>
              {intl.formatMessage(messages.enrollAction)}
            </Button>
          </div>
        </div>
      </div>

      <div className="rwaq-card">
        <DetailGrid
          className="rwaq-detail-block"
          title={intl.formatMessage(messages.sectionIdentity)}
          items={[
            { label: intl.formatMessage(messages.detailUsername), value: user.username },
            { label: intl.formatMessage(messages.detailUserId), value: user.id },
            { label: intl.formatMessage(messages.detailEmail), value: user.email },
          ]}
        />

        <DetailGrid
          className="rwaq-detail-block"
          title={intl.formatMessage(messages.sectionProfileDetails)}
          items={[
            { label: intl.formatMessage(messages.detailJob), value: user.job || dash },
            {
              label: intl.formatMessage(messages.detailCountry),
              // The API stores the ISO code; a reader wants the country.
              value: countryName(user.country) || dash,
            },
            {
              label: intl.formatMessage(messages.detailVisibility),
              value: intl.formatMessage(user.profileVisibility === 'public'
                ? messages.visibilityPublic
                : messages.visibilityPrivate),
            },
            {
              label: intl.formatMessage(messages.detailBiography),
              value: user.biography || dash,
              isWide: true,
            },
          ]}
        />

        <DetailGrid
          className="rwaq-detail-block"
          title={intl.formatMessage(messages.sectionAccess)}
          items={[
            {
              label: intl.formatMessage(messages.detailRoles),
              value: (
                <RoleBadges
                  badges={user.roleBadges}
                  maxVisible={ALL_ROLES_VISIBLE}
                  id="detail-roles"
                />
              ),
              isWide: true,
            },
            {
              label: intl.formatMessage(messages.detailOrgAdminOf),
              value: user.roles.orgAdminOf.length > 0 ? user.roles.orgAdminOf.join(', ') : dash,
            },
            {
              label: intl.formatMessage(messages.detailAuthMethods),
              value: user.authenticationMethods.join(', '),
            },
          ]}
        />

        <DetailGrid
          className="rwaq-detail-block"
          title={intl.formatMessage(messages.sectionActivity)}
          items={[
            {
              label: intl.formatMessage(messages.detailCreated),
              value: new Date(user.createdAt).toLocaleString(),
            },
            {
              label: intl.formatMessage(messages.detailLastLogin),
              value: user.lastLogin
                ? new Date(user.lastLogin).toLocaleString()
                : intl.formatMessage(messages.never),
            },
          ]}
        />
      </div>

      <div className="rwaq-card">
        <h2 className="rwaq-section-title mb-4">
          {intl.formatMessage(messages.enrollmentCount, { count: rows.length })}
        </h2>

        {isEnrollmentsError && (
          <Alert variant="danger">{intl.formatMessage(messages.enrollmentsError)}</Alert>
        )}

        {!isEnrollmentsError && !isLoadingEnrollments && rows.length === 0 && (
          <p className="text-muted text-center py-5 mb-0">
            {intl.formatMessage(messages.enrollmentsEmpty)}
          </p>
        )}

        {!isEnrollmentsError && (isLoadingEnrollments || rows.length > 0) && (
          <EnrollmentsTable
            enrollments={rows}
            isLoading={isLoadingEnrollments}
            onChangeMode={setModeTarget}
            onUnenroll={setUnenrollTarget}
          />
        )}
      </div>

      <EditUserModal
        userId={isEditing ? user.id : null}
        onClose={() => setIsEditing(false)}
      />

      <EnrollModal
        isOpen={isEnrolling}
        onClose={() => setIsEnrolling(false)}
        userId={user.id}
        userName={displayName}
        enrollments={rows}
      />

      <ChangeModeModal
        isOpen={modeTarget !== null}
        onClose={() => setModeTarget(null)}
        userId={user.id}
        enrollment={modeTarget}
      />

      <UnenrollModal
        isOpen={unenrollTarget !== null}
        onClose={() => setUnenrollTarget(null)}
        userId={user.id}
        userName={displayName}
        enrollment={unenrollTarget}
      />
    </div>
  );
};

export default UserDetailPage;
