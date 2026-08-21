/**
 * Enroll a learner in a course from the admin panel.
 *
 * Three fields, in the order the decision is actually made: which course, then
 * which mode (the options depend on the course, so it can't come first), then
 * why. The reason is last because it is the one field the admin has to compose
 * rather than choose.
 *
 * Nothing is submitted until all three are valid, so the API's own 400s stay
 * the backstop rather than the primary feedback path.
 */
import { useEffect, useState } from 'react';
import { Alert, Form } from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import FormModal from '@src/components/FormModal';
import { useToast } from '@src/components/ToastContext';
import { getErrorReason, getErrorStatus } from '@src/data/httpError';
import ReasonField, {
  ReasonValues, emptyReason, hasReason, resolveReason,
} from '../components/ReasonField';
import CoursePicker from '../components/CoursePicker';
import ConflictAlert from '../components/ConflictAlert';
import { useEnrollUser } from '../data/hooks';
import type { EnrollableCourse, UserEnrollment } from '../data/types';
import messages from '../messages';

interface EnrollModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number;
  userName: string;
  /** The rows already on screen, so the form knows what's a re-enrollment. */
  enrollments: UserEnrollment[];
}

const EnrollModal = ({
  isOpen, onClose, userId, userName, enrollments,
}: EnrollModalProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const mutation = useEnrollUser(userId);

  const [course, setCourse] = useState<EnrollableCourse | null>(null);
  const [mode, setMode] = useState('');
  const [reason, setReason] = useState<ReasonValues>(emptyReason);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const [isConflict, setIsConflict] = useState(false);

  // Reopening must not inherit the last attempt's course, mode or reason —
  // silently re-submitting a previous reason is how an audit trail starts
  // lying.
  useEffect(() => {
    if (isOpen) {
      setCourse(null);
      setMode('');
      setReason(emptyReason);
      setHasTriedSubmit(false);
      setIsConflict(false);
    }
  }, [isOpen]);

  // The mode list belongs to the course, so picking a course picks a default
  // mode too: with one option there is no choice to present, and with several
  // the first is the platform's own default ordering.
  useEffect(() => {
    setMode(course?.availableModes[0] ?? '');
  }, [course]);

  const activeCourseIds = enrollments.filter((e) => e.isActive).map((e) => e.courseId);
  const isReactivation = course !== null
    && enrollments.some((e) => e.courseId === course.courseId && !e.isActive);

  const courseError = hasTriedSubmit && course === null
    ? intl.formatMessage(messages.enrollCourseRequired)
    : undefined;
  const reasonError = hasTriedSubmit && !hasReason(reason)
    ? intl.formatMessage(messages.reasonRequired)
    : undefined;

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setHasTriedSubmit(true);
    if (!course || !mode || !hasReason(reason)) { return; }

    setIsConflict(false);
    try {
      await mutation.mutateAsync({
        courseId: course.courseId,
        mode,
        reason: resolveReason(reason),
      });
      // Deliberately not "enrolled and certified": the platform recomputes
      // grades and certificates on a queue, so claiming they are done here
      // would be a promise this code cannot keep.
      showToast(intl.formatMessage(messages.enrollSuccess, { course: course.displayName }));
      onClose();
    } catch (error) {
      // 409 means the enrollment moved under us — the fix is to look again,
      // not to retry the same write, so it gets its own message.
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
      title={intl.formatMessage(messages.enrollTitle, { name: userName })}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={intl.formatMessage(messages.enrollSubmit)}
      cancelLabel={intl.formatMessage(messages.cancel)}
      isSubmitting={mutation.isPending}
    >
      {/* Left open: reloading refreshes which courses count as already
          enrolled, which is all this form needs to be correct again. */}
      {isConflict && <ConflictAlert userId={userId} onReload={() => setIsConflict(false)} />}

      <CoursePicker
        selected={course}
        onSelect={setCourse}
        activeCourseIds={activeCourseIds}
        error={courseError}
      />

      {isReactivation && (
        <Alert variant="info">{intl.formatMessage(messages.enrollReactivates)}</Alert>
      )}

      {course && (
        <Form.Group>
          <Form.Label>{intl.formatMessage(messages.modeLabel)}</Form.Label>
          <Form.Control
            as="select"
            value={mode}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setMode(event.target.value)}
          >
            {course.availableModes.map((slug) => (
              <option key={slug} value={slug}>{slug}</option>
            ))}
          </Form.Control>
        </Form.Group>
      )}

      <ReasonField values={reason} onChange={setReason} error={reasonError} />
    </FormModal>
  );
};

export default EnrollModal;
