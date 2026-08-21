/**
 * Change one enrollment's mode.
 *
 * The current mode is shown as read-only text rather than a pre-selected
 * option, so "what it is" and "what I'm changing it to" can't be confused for
 * each other mid-form.
 *
 * The row's mode is sent back as `oldMode`. If someone else changed it while
 * this was open the API rejects the write with a 409 rather than overwriting
 * their change — this form's job is then to say so, not to retry.
 */
import { useEffect, useState } from 'react';
import { Alert, Form } from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import FormModal from '@src/components/FormModal';
import { useToast } from '@src/components/ToastContext';
import { getErrorReason, getErrorStatus } from '@src/data/httpError';
import ConflictAlert from '../components/ConflictAlert';
import ReasonField, {
  ReasonValues, emptyReason, hasReason, resolveReason,
} from '../components/ReasonField';
import { useChangeEnrollmentMode } from '../data/hooks';
import type { UserEnrollment } from '../data/types';
import messages from '../messages';

interface ChangeModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  enrollment: UserEnrollment | null;
}

const ChangeModeModal = ({
  isOpen, onClose, userId, enrollment,
}: ChangeModeModalProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const mutation = useChangeEnrollmentMode(userId);

  const [newMode, setNewMode] = useState('');
  const [reason, setReason] = useState<ReasonValues>(emptyReason);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [isConflict, setIsConflict] = useState(false);

  // Offering the current mode as a target would let the admin fill in a reason,
  // submit, and get a 409 for a change that was never a change. It is removed
  // from the options instead.
  const targetModes = (enrollment?.availableModes ?? [])
    .filter((slug) => slug !== enrollment?.mode);

  useEffect(() => {
    if (isOpen) {
      setNewMode(targetModes[0] ?? '');
      setReason(emptyReason);
      setHasTriedSubmit(false);
      setIsConflict(false);
    }
    // targetModes is derived from `enrollment`, which is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, enrollment]);

  if (!enrollment) { return null; }

  const reasonError = hasTriedSubmit && !hasReason(reason)
    ? intl.formatMessage(messages.reasonRequired)
    : undefined;
  const hasNoTarget = targetModes.length === 0;

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setHasTriedSubmit(true);
    if (hasNoTarget || !newMode || !hasReason(reason)) { return; }

    setIsConflict(false);
    try {
      await mutation.mutateAsync({
        courseId: enrollment.courseId,
        oldMode: enrollment.mode,
        newMode,
        reason: resolveReason(reason),
      });
      showToast(intl.formatMessage(messages.modeChangeSuccess, { mode: newMode }));
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
      title={intl.formatMessage(messages.modeChangeTitle)}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={intl.formatMessage(messages.modeChangeSubmit)}
      cancelLabel={intl.formatMessage(messages.cancel)}
      isSubmitting={mutation.isPending}
      size="md"
    >
      {/* Closed on reload: this dialog is about one row, and that row's mode
          and active state are precisely what turned out to be stale. */}
      {isConflict && <ConflictAlert userId={userId} onReload={onClose} />}

      <div className="rwaq-enrollments__subject">
        <div className="rwaq-user-cell__name">{enrollment.courseName}</div>
        <div className="rwaq-user-cell__meta">{enrollment.courseId}</div>
      </div>

      <Form.Group>
        <Form.Label>{intl.formatMessage(messages.modeCurrent)}</Form.Label>
        <p className="rwaq-enrollments__mode mb-0">{enrollment.mode}</p>
      </Form.Group>

      {hasNoTarget
        ? <Alert variant="info">{intl.formatMessage(messages.modeOnlyOne)}</Alert>
        : (
          <Form.Group>
            <Form.Label>{intl.formatMessage(messages.modeNew)}</Form.Label>
            <Form.Control
              as="select"
              value={newMode}
              onChange={
                (event: React.ChangeEvent<HTMLSelectElement>) => setNewMode(event.target.value)
              }
            >
              {targetModes.map((slug) => (
                <option key={slug} value={slug}>{slug}</option>
              ))}
            </Form.Control>
          </Form.Group>
        )}

      {!hasNoTarget && (
        <ReasonField values={reason} onChange={setReason} error={reasonError} />
      )}
    </FormModal>
  );
};

export default ChangeModeModal;
