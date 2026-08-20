/**
 * Read-only user detail drawer: identity and profile, the grants the account
 * holds, and (second tab) what it is enrolled in.
 */
import {
  ActionRow, Alert, Button, ModalDialog, Spinner, Tab, Tabs,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import RoleBadges from '../components/RoleBadges';
import StatusBadges from '../components/StatusBadges';
import UserEnrollmentsTab from '../components/UserEnrollmentsTab';
import { useUser } from '../data/hooks';
import messages from '../messages';

interface DetailRowProps {
  label: string;
  children: React.ReactNode;
}

const DetailRow = ({ label, children }: DetailRowProps) => (
  <div className="mb-3">
    <div className="small text-muted">{label}</div>
    <div>{children}</div>
  </div>
);

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
        <ModalDialog.Title>{user?.name || intl.formatMessage(messages.detailTitle)}</ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        {isLoading && (
          <div className="d-flex justify-content-center py-4">
            <Spinner animation="border" screenReaderText={intl.formatMessage(messages.detailTitle)} />
          </div>
        )}

        {isError && <Alert variant="danger">{intl.formatMessage(messages.errorTitle)}</Alert>}

        {user && (
          <Tabs defaultActiveKey="profile" id="user-detail-tabs">
            <Tab eventKey="profile" title={intl.formatMessage(messages.tabProfile)} className="pt-3">
              <div className="mb-3">
                <StatusBadges
                  isActive={user.isActive}
                  isEmailConfirmed={user.isEmailConfirmed}
                  isLegacy={user.isLegacy}
                />
              </div>
              <DetailRow label={intl.formatMessage(messages.colRoles)}>
                <RoleBadges badges={user.roleBadges} />
              </DetailRow>
              <DetailRow label={intl.formatMessage(messages.detailEmail)}>{user.email}</DetailRow>
              <DetailRow label={intl.formatMessage(messages.detailUsername)}>{user.username}</DetailRow>
              <DetailRow label={intl.formatMessage(messages.detailUserId)}>{user.id}</DetailRow>
              <DetailRow label={intl.formatMessage(messages.detailJob)}>{user.job || dash}</DetailRow>
              <DetailRow label={intl.formatMessage(messages.detailCountry)}>{user.country || dash}</DetailRow>
              <DetailRow label={intl.formatMessage(messages.detailBiography)}>{user.biography || dash}</DetailRow>
              <DetailRow label={intl.formatMessage(messages.detailVisibility)}>
                {intl.formatMessage(user.profileVisibility === 'public'
                  ? messages.visibilityPublic
                  : messages.visibilityPrivate)}
              </DetailRow>
              <DetailRow label={intl.formatMessage(messages.detailAuthMethods)}>
                {user.authenticationMethods.join(', ')}
              </DetailRow>
              <DetailRow label={intl.formatMessage(messages.detailOrgAdminOf)}>
                {user.roles.orgAdminOf.length > 0 ? user.roles.orgAdminOf.join(', ') : dash}
              </DetailRow>
              <DetailRow label={intl.formatMessage(messages.detailCreated)}>
                {new Date(user.createdAt).toLocaleString()}
              </DetailRow>
              <DetailRow label={intl.formatMessage(messages.detailLastLogin)}>
                {user.lastLogin
                  ? new Date(user.lastLogin).toLocaleString()
                  : intl.formatMessage(messages.never)}
              </DetailRow>
            </Tab>

            <Tab eventKey="enrollments" title={intl.formatMessage(messages.tabEnrollments)} className="pt-3">
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
