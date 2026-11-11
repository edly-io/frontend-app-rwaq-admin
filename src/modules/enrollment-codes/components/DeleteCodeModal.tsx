/**
 * Confirm deleting an enrollment code. Offered only for a code with no uses, and the backend refuses
 * otherwise (409), which is shown in the dialog.
 */
import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import FormModal from '@src/components/FormModal';
import { useToast } from '@src/components/ToastContext';
import { useDeleteEnrollmentCode } from '../data/hooks';
import type { EnrollmentCode } from '../data/types';
import messages from '../messages';
import { readCodeError } from './codeErrors';

interface DeleteCodeModalProps {
  code: EnrollmentCode | null;
  onClose: () => void;
}

const DeleteCodeModal = ({ code, onClose }: DeleteCodeModalProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const mutation = useDeleteEnrollmentCode();
  const [error, setError] = useState('');

  useEffect(() => { setError(''); }, [code]);

  if (!code) { return null; }

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    try {
      await mutation.mutateAsync(code.id);
      showToast(intl.formatMessage(messages.deleted, { code: code.code }));
      onClose();
    } catch (err) {
      logError(err);
      setError(readCodeError(err).detail ?? intl.formatMessage(messages.deleteFailed));
    }
  };

  return (
    <FormModal
      title={intl.formatMessage(messages.deleteTitle)}
      isOpen
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={intl.formatMessage(messages.deleteSubmit)}
      cancelLabel={intl.formatMessage(messages.cancel)}
      isSubmitting={mutation.isPending}
      submitVariant="danger"
      size="md"
    >
      {error && <p className="text-danger small">{error}</p>}
      <p className="mb-0">{intl.formatMessage(messages.deleteBody, { code: code.code })}</p>
    </FormModal>
  );
};

export default DeleteCodeModal;
