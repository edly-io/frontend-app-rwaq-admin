/**
 * Confirm unenrolling a learner from a program, with a mandatory reason.
 *
 * Same shape as the course UnenrollModal: the reason lands in the audit trail
 * of every course the learner leaves, so it uses the same preset list. The
 * wording says who can come back on their own: anyone for a free program, only
 * a learner who bought it on the Rwaq website for a paid one.
 */
import { getSiteName } from '@src/data/siteName';
import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { Button, ModalDialog } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import FormModal from '@src/components/FormModal';
import { useToast } from '@src/components/ToastContext';
import { getErrorReason } from '@src/data/httpError';
import ReasonField, {
  ReasonValues, emptyReason, hasReason, resolveReason,
} from '@src/modules/users/components/ReasonField';
import usersMessages from '@src/modules/users/messages';
import { useUnenrollProgramLearner } from '../data/hooks';
import type { ProgramLearner } from '../data/types';
import messages from '../messages';

interface UnenrollLearnerModalProps {
  onClose: () => void;
  uuid: string;
  learner: ProgramLearner | null;
}

const UnenrollLearnerModal = ({ onClose, uuid, learner }: UnenrollLearnerModalProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const mutation = useUnenrollProgramLearner(uuid);
  const [reason, setReason] = useState<ReasonValues>(emptyReason);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [partialResult, setPartialResult] = useState<string | null>(null);

  useEffect(() => {
    if (learner) {
      setReason(emptyReason);
      setHasTriedSubmit(false);
      setPartialResult(null);
    }
  }, [learner]);

  if (!learner) { return null; }

  if (partialResult) {
    return (
      <ModalDialog
        title={intl.formatMessage(messages.unenrollLearnerTitle)}
        isOpen
        onClose={onClose}
        hasCloseButton
        isOverflowVisible={false}
      >
        <ModalDialog.Header>
          <ModalDialog.Title>{intl.formatMessage(messages.unenrollLearnerTitle)}</ModalDialog.Title>
        </ModalDialog.Header>
        <ModalDialog.Body>{partialResult}</ModalDialog.Body>
        <ModalDialog.Footer>
          <Button onClick={onClose}>{intl.formatMessage(messages.bulkEnrollClose)}</Button>
        </ModalDialog.Footer>
      </ModalDialog>
    );
  }

  const reasonError = hasTriedSubmit && !hasReason(reason)
    ? intl.formatMessage(usersMessages.reasonRequired)
    : undefined;

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setHasTriedSubmit(true);
    if (!hasReason(reason)) { return; }
    try {
      const failures = await mutation.mutateAsync({ userId: learner.id, reason: resolveReason(reason) });
      const skipped = Object.entries(failures ?? {}).map(([course, failure]) => `${course}: ${failure}`).join('; ');
      if (skipped) {
        setPartialResult(intl.formatMessage(messages.unenrollLearnerPartial, { name: learner.name, courses: skipped }));
      } else {
        showToast(intl.formatMessage(messages.unenrollLearnerSuccess, { name: learner.name, siteName: getSiteName() }));
        onClose();
      }
    } catch (error) {
      logError(error);
      showToast(getErrorReason(error) ?? intl.formatMessage(messages.unenrollLearnerError));
    }
  };

  return (
    <FormModal
      title={intl.formatMessage(messages.unenrollLearnerTitle)}
      isOpen
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={intl.formatMessage(messages.unenrollLearnerSubmit)}
      cancelLabel={intl.formatMessage(messages.bulkEnrollCancel)}
      isSubmitting={mutation.isPending}
      size="md"
      submitVariant="danger"
    >
      <p>{intl.formatMessage(messages.unenrollLearnerBody, { name: learner.name, siteName: getSiteName() })}</p>
      <ReasonField values={reason} onChange={setReason} error={reasonError} />
    </FormModal>
  );
};

export default UnenrollLearnerModal;
