/**
 * Enroll a user in a specific course from the Course Detail page.
 *
 * Fields: user (required), mode (required), reason (required).
 * The modal closes on success and shows a toast.
 */
import { useEffect, useState } from 'react';
import { Form } from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import FormModal from '@src/components/FormModal';
import { useToast } from '@src/components/ToastContext';
import { getErrorReason, getErrorStatus } from '@src/data/httpError';
import type { UserSummary } from '@src/modules/users/data/types';
import ReasonField, {
  ReasonValues, emptyReason, hasReason, resolveReason,
} from '@src/modules/users/components/ReasonField';
import UserPicker from '../components/UserPicker';
import { useEnrollUserInCourse } from '../data/hooks';
import messages from '../messages';

interface EnrollUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
  /** Modes available for this course. Falls back to the platform's common set. */
  availableModes?: string[];
}

const DEFAULT_MODES = ['honor', 'audit'];

const EnrollUserModal = ({
  isOpen, onClose, courseId, courseName, availableModes = DEFAULT_MODES,
}: EnrollUserModalProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const mutation = useEnrollUserInCourse(courseId);

  const [user, setUser] = useState<UserSummary | null>(null);
  const [mode, setMode] = useState(availableModes[0] ?? 'honor');
  const [reason, setReason] = useState<ReasonValues>(emptyReason);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [conflictMessage, setConflictMessage] = useState('');

  // Reset all fields every time the modal opens
  useEffect(() => {
    if (isOpen) {
      setUser(null);
      setMode(availableModes[0] ?? 'honor');
      setReason(emptyReason);
      setHasTriedSubmit(false);
      setConflictMessage('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // When mode options change (e.g. course loaded), reset to first
  useEffect(() => {
    setMode(availableModes[0] ?? 'honor');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [availableModes.join(',')]);

  const userError = hasTriedSubmit && !user
    ? intl.formatMessage(messages.enrollModalUserLabel) + ' is required'
    : undefined;
  const reasonError = hasTriedSubmit && !hasReason(reason)
    ? 'A reason is required'
    : undefined;

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setHasTriedSubmit(true);
    setConflictMessage('');
    if (!user || !mode || !hasReason(reason)) { return; }

    try {
      await mutation.mutateAsync({
        userId: user.id,
        mode,
        reason: resolveReason(reason),
      });
      showToast(intl.formatMessage(messages.enrollModalSuccess));
      onClose();
    } catch (error) {
      if (getErrorStatus(error) === 409) {
        setConflictMessage(intl.formatMessage(messages.enrollModalConflict));
        return;
      }
      logError(error);
      showToast(getErrorReason(error) ?? intl.formatMessage(messages.enrollModalError));
    }
  };

  return (
    <FormModal
      title={`${intl.formatMessage(messages.enrollModalTitle)} — ${courseName}`}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={intl.formatMessage(messages.enrollModalSubmit)}
      cancelLabel={intl.formatMessage(messages.enrollModalCancel)}
      isSubmitting={mutation.isPending}
    >
      {conflictMessage && (
        <p className="text-danger small">{conflictMessage}</p>
      )}

      <UserPicker selected={user} onSelect={setUser} error={userError} />

      {user && availableModes.length > 1 && (
        <Form.Group>
          <Form.Label>{intl.formatMessage(messages.enrollModalModeLabel)}</Form.Label>
          <Form.Control
            as="select"
            value={mode}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setMode(event.target.value)}
          >
            {availableModes.map((slug) => (
              <option key={slug} value={slug}>{slug}</option>
            ))}
          </Form.Control>
        </Form.Group>
      )}

      <ReasonField values={reason} onChange={setReason} error={reasonError} />
    </FormModal>
  );
};

export default EnrollUserModal;
