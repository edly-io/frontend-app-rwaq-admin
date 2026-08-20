/**
 * Read-only user detail.
 *
 * Facts are grouped and aligned in label/value columns (Identity, Profile,
 * Access, Activity) rather than run down the page as one long stack — a
 * reviewer is usually looking for one field, not reading the whole record.
 * Unlike the table, this shows every role and every status signal.
 */
import {
  ActionRow, Alert, Button, ModalDialog, Spinner, Tab, Tabs,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import DetailGrid from '@src/components/DetailGrid';
import ProfileAvatar from '@src/components/ProfileAvatar';
import RoleBadges from '../components/RoleBadges';
import StatusBadges from '../components/StatusBadges';
import UserEnrollmentsTab from '../components/UserEnrollmentsTab';
import { useUser } from '../data/hooks';
import type { UserDetail } from '../data/types';
import messages from '../messages';

const ALL_ROLES_VISIBLE = 99;

interface UserDetailModalProps {
  /** null closes the modal. */
  userId: number | null;
  onClose: () => void;
  onEdit: (userId: number) => void;
}

const UserDetailModal = ({ userId, onClose, onEdit }: UserDetailModalProps) => {
  const intl = useIntl();
  const { data: user, isLoading, isError } = useUser(userId ?? 0);
  const dash = intl.formatMessage(messages.detailNone);

  const renderProfile = (detail: UserDetail) => (
    <>
      {/* Identity header: who this is, at a glance. */}
      <div className="rwaq-detail-header">
        <ProfileAvatar src={detail.image} name={detail.name} size="lg" />
        <div className="min-width-0">
          <div className="rwaq-detail-header__name">{detail.name || detail.username}</div>
          <div className="rwaq-detail-header__email">{detail.email}</div>
          <div className="mt-2">
            <StatusBadges
              isActive={detail.isActive}
              isEmailConfirmed={detail.isEmailConfirmed}
              isLegacy={detail.isLegacy}
              showSecondary
            />
          </div>
        </div>
      </div>

      <DetailGrid
        className="rwaq-detail-block"
        title={intl.formatMessage(messages.sectionIdentity)}
        items={[
          { label: intl.formatMessage(messages.detailUsername), value: detail.username },
          { label: intl.formatMessage(messages.detailUserId), value: detail.id },
          { label: intl.formatMessage(messages.detailEmail), value: detail.email },
        ]}
      />

      <DetailGrid
        className="rwaq-detail-block"
        title={intl.formatMessage(messages.sectionProfileDetails)}
        items={[
          { label: intl.formatMessage(messages.detailJob), value: detail.job || dash },
          { label: intl.formatMessage(messages.detailCountry), value: detail.country || dash },
          {
            label: intl.formatMessage(messages.detailVisibility),
            value: intl.formatMessage(detail.profileVisibility === 'public'
              ? messages.visibilityPublic
              : messages.visibilityPrivate),
          },
          {
            label: intl.formatMessage(messages.detailBiography),
            value: detail.biography || dash,
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
            value: <RoleBadges badges={detail.roleBadges} maxVisible={ALL_ROLES_VISIBLE} id="detail-roles" />,
            isWide: true,
          },
          {
            label: intl.formatMessage(messages.detailOrgAdminOf),
            value: detail.roles.orgAdminOf.length > 0 ? detail.roles.orgAdminOf.join(', ') : dash,
          },
          {
            label: intl.formatMessage(messages.detailAuthMethods),
            value: detail.authenticationMethods.join(', '),
          },
        ]}
      />

      <DetailGrid
        className="rwaq-detail-block"
        title={intl.formatMessage(messages.sectionActivity)}
        items={[
          {
            label: intl.formatMessage(messages.detailCreated),
            value: new Date(detail.createdAt).toLocaleString(),
          },
          {
            label: intl.formatMessage(messages.detailLastLogin),
            value: detail.lastLogin
              ? new Date(detail.lastLogin).toLocaleString()
              : intl.formatMessage(messages.never),
          },
        ]}
      />
    </>
  );

  return (
    <ModalDialog
      title={intl.formatMessage(messages.detailTitle)}
      isOpen={userId !== null}
      onClose={onClose}
      size="lg"
      isFullscreenOnMobile
      hasCloseButton
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>{intl.formatMessage(messages.detailTitle)}</ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        {isLoading && (
          <div className="d-flex justify-content-center py-5">
            <Spinner animation="border" screenReaderText={intl.formatMessage(messages.detailTitle)} />
          </div>
        )}

        {isError && <Alert variant="danger">{intl.formatMessage(messages.errorTitle)}</Alert>}

        {user && (
          <Tabs defaultActiveKey="profile" id="user-detail-tabs">
            <Tab eventKey="profile" title={intl.formatMessage(messages.tabProfile)} className="pt-4">
              {renderProfile(user)}
            </Tab>
            <Tab eventKey="enrollments" title={intl.formatMessage(messages.tabEnrollments)} className="pt-4">
              <UserEnrollmentsTab userId={user.id} />
            </Tab>
          </Tabs>
        )}
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <ActionRow>
          <Button variant="tertiary" onClick={onClose}>{intl.formatMessage(messages.close)}</Button>
          {user && (
            <Button variant="primary" onClick={() => onEdit(user.id)}>
              {intl.formatMessage(messages.edit)}
            </Button>
          )}
        </ActionRow>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

export default UserDetailModal;
