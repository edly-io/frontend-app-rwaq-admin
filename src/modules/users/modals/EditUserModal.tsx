/**
 * Edit wrapper: the list row is a summary, but the edit form needs the full
 * detail (profile fields, grants), so it is fetched before the form renders.
 */
import { Alert, ModalDialog, Spinner } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useUser } from '../data/hooks';
import messages from '../messages';
import UserFormModal from './UserFormModal';

interface EditUserModalProps {
  /** null closes the modal. */
  userId: number | null;
  onClose: () => void;
}

const EditUserModal = ({ userId, onClose }: EditUserModalProps) => {
  const intl = useIntl();
  const { data: user, isLoading, isError } = useUser(userId ?? 0);

  if (userId === null) { return null; }

  if (isLoading || isError || !user) {
    return (
      <ModalDialog
        title={intl.formatMessage(messages.editTitle)}
        isOpen
        onClose={onClose}
        size="lg"
        isFullscreenOnMobile
        hasCloseButton
        isOverflowVisible={false}
      >
        <ModalDialog.Header>
          <ModalDialog.Title>{intl.formatMessage(messages.editTitle)}</ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>
          {isError
            ? <Alert variant="danger">{intl.formatMessage(messages.errorTitle)}</Alert>
            : (
              <div className="d-flex justify-content-center py-4">
                <Spinner animation="border" screenReaderText={intl.formatMessage(messages.editTitle)} />
              </div>
            )}
        </ModalDialog.Body>
      </ModalDialog>
    );
  }

  return <UserFormModal isOpen onClose={onClose} user={user} />;
};

export default EditUserModal;
