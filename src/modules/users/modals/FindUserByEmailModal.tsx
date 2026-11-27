/**
 * Find an account by email and open it, so an admin can enroll a learner who is not in their
 * organization list yet. The lookup answers "not found" for an account the caller may not open.
 */
import { useState } from 'react';
import { Alert, Form } from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import FormModal from '@src/components/FormModal';
import { getErrorReason } from '@src/data/httpError';
import { lookupUserByEmail } from '../data/api';
import messages from '../messages';

interface FindUserByEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFound: (userId: number) => void;
}

const FindUserByEmailModal = ({ isOpen, onClose, onFound }: FindUserByEmailModalProps) => {
  const intl = useIntl();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const found = await lookupUserByEmail(email.trim());
      onFound(found.id);
    } catch (err) {
      logError(err);
      setError(getErrorReason(err) ?? intl.formatMessage(messages.findByEmailFailed));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      title={intl.formatMessage(messages.findByEmailTitle)}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={intl.formatMessage(messages.findByEmailSubmit)}
      cancelLabel={intl.formatMessage(messages.cancel)}
      isSubmitting={isSubmitting}
      isSubmitDisabled={!email.trim()}
    >
      {error && <Alert variant="danger">{error}</Alert>}
      <Form.Group controlId="find-user-email">
        <Form.Label>{intl.formatMessage(messages.findByEmailLabel)}</Form.Label>
        <Form.Control
          type="email"
          value={email}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setEmail(e.target.value);
            setError('');
          }}
        />
      </Form.Group>
    </FormModal>
  );
};

export default FindUserByEmailModal;
