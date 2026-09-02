/**
 * Add a team member to the course staff.
 *
 * Fields: user (required), role (required).
 * Writes directly to CourseAccessRole — no email is sent (skips allow_access).
 */
import { useEffect, useState } from 'react';
import { Form } from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl, defineMessages } from '@edx/frontend-platform/i18n';
import FormModal from '@src/components/FormModal';
import { useToast } from '@src/components/ToastContext';
import { getErrorReason } from '@src/data/httpError';
import type { UserSummary } from '@src/modules/users/data/types';
import UserPicker from '../components/UserPicker';
import { useAddCourseStaff } from '../data/hooks';
import type { CourseRole } from '../data/types';
import messages from '../messages';

const roleMessages = defineMessages({
  instructor: {
    id: 'rwaq.admin.courses.role.instructor.desc',
    defaultMessage: 'Instructor, can edit the course and manage the team roster',
  },
  staff: {
    id: 'rwaq.admin.courses.role.staff.desc',
    defaultMessage: 'Staff, can edit the course',
  },
});

const ROLES: CourseRole[] = ['instructor', 'staff'];

interface AddStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseId: string;
  courseName: string;
}

const AddStaffModal = ({
  isOpen, onClose, courseId, courseName,
}: AddStaffModalProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const mutation = useAddCourseStaff(courseId);

  const [user, setUser] = useState<UserSummary | null>(null);
  const [role, setRole] = useState<CourseRole>('staff');
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setUser(null);
      setRole('staff');
      setHasTriedSubmit(false);
    }
  }, [isOpen]);

  const userError = hasTriedSubmit && !user
    ? `${intl.formatMessage(messages.addStaffModalUserLabel)} is required`
    : undefined;

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setHasTriedSubmit(true);
    if (!user) { return; }

    try {
      await mutation.mutateAsync({ userId: user.id, role });
      showToast(intl.formatMessage(messages.addStaffModalSuccess));
      onClose();
    } catch (error) {
      logError(error);
      showToast(getErrorReason(error) ?? intl.formatMessage(messages.addStaffModalError));
    }
  };

  return (
    <FormModal
      title={`${intl.formatMessage(messages.addStaffModalTitle)}, ${courseName}`}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={intl.formatMessage(messages.addStaffModalSubmit)}
      cancelLabel={intl.formatMessage(messages.addStaffModalCancel)}
      isSubmitting={mutation.isPending}
    >
      <UserPicker selected={user} onSelect={setUser} error={userError} />

      <Form.Group>
        <Form.Label>{intl.formatMessage(messages.addStaffModalRoleLabel)}</Form.Label>
        <Form.Control
          as="select"
          value={role}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setRole(event.target.value as CourseRole)}
        >
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {intl.formatMessage(roleMessages[r])}
            </option>
          ))}
        </Form.Control>
      </Form.Group>
    </FormModal>
  );
};

export default AddStaffModal;
