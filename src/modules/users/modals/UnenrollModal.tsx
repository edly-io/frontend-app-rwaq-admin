/**
 * Confirm unenrolling a learner from one course.
 *
 * Built on FormModal rather than Paragon's AlertModal, because the reason is
 * mandatory and an AlertModal is a yes/no with no room for a required field —
 * asking for the reason in a second dialog after the confirmation would make
 * "cancel" ambiguous about what exactly was cancelled.
 *
 * The wording says explicitly that this is reversible and that grades survive,
 * since the platform's unenrollment is a soft delete and an admin who assumes
 * otherwise will avoid a safe action.
 */
import { useEffect, useState } from 'react';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import FormModal from '@src/components/FormModal';
import { useToast } from '@src/components/ToastContext';
import { getErrorReason, getErrorStatus } from '@src/data/httpError';
import ConflictAlert from '../components/ConflictAlert';
import ReasonField, {
  ReasonValues, emptyReason, hasReason, resolveReason,
} from '../components/ReasonField';
import { useUnenrollUser } from '../data/hooks';
import type { UserEnrollment } from '../data/types';
import messages from '../messages';

interface UnenrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
  enrollment: UserEnrollment | null;
}

const UnenrollModal = ({
  isOpen, onClose, userId, userName, enrollment,
}: UnenrollModalProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const mutation = useUnenrollUser(userId);

  const [reason, setReason] = useState<ReasonValues>(emptyReason);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [isConflict, setIsConflict] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason(emptyReason);
      setHasTriedSubmit(false);
      setIsConflict(false);
    }
  }, [isOpen]);

  if (!enrollment) { return null; }

  const reasonError = hasTriedSubmit && !hasReason(reason)
    ? intl.formatMessage(messages.reasonRequired)
    : undefined;

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setHasTriedSubmit(true);
    if (!hasReason(reason)) { return; }

    setIsConflict(false);
    try {
      await mutation.mutateAsync({
        courseId: enrollment.courseId,
        reason: resolveReason(reason),
      });
      showToast(intl.formatMessage(messages.unenrollSuccess, { course: enrollment.courseName }));
      onClose();
    } catch (error) {
      if (getErrorStatus(error) === 409) {
        setIsConflict(true);
        return;
      }
      logError(error);
      showToast(getErrorReason(error) ?? intl.formatMessage(messages.enrollmentWriteError));
    }
  };

  return (
    <FormModal
      title={intl.formatMessage(messages.unenrollTitle)}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={intl.formatMessage(messages.unenrollSubmit)}
      cancelLabel={intl.formatMessage(messages.cancel)}
      isSubmitting={mutation.isPending}
      size="md"
      // Removing something should not be the button styled as the encouraged
      // choice, even when it is reversible.
      submitVariant="danger"
    >
      {/* Closed on reload: this dialog is about one row, and that row's mode
          and active state are precisely what turned out to be stale. */}
      {isConflict && <ConflictAlert userId={userId} onReload={onClose} />}

      <p>
        {intl.formatMessage(messages.unenrollBody, {
          name: userName,
          course: enrollment.courseName,
        })}
      </p>

      <ReasonField values={reason} onChange={setReason} error={reasonError} />
    </FormModal>
  );
};

export default UnenrollModal;
