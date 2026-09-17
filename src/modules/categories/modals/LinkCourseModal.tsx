/**
 * Modal to link a course to a category.
 *
 * Courses are chosen from a dropdown of the ones not already linked to this
 * category (CoursePicker), rather than typed in as a raw course key — an
 * admin browsing courses shouldn't need to already know the exact key, and a
 * picker rules out the "typo'd key the backend rejects" round trip entirely.
 */
import { useEffect, useState } from 'react';
import { Alert } from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import FormModal from '@src/components/FormModal';
import { useToast } from '@src/components/ToastContext';
import { getErrorReason } from '@src/data/httpError';
import CoursePicker from '../components/CoursePicker';
import { useLinkCourse } from '../data/hooks';
import type { CategoryCourse } from '../data/types';
import messages from '../messages';

interface LinkCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  categoryId: number;
  categoryName: string;
}

const LinkCourseModal = ({
  isOpen, onClose, onSuccess, categoryId, categoryName,
}: LinkCourseModalProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const linkMutation = useLinkCourse(categoryId);

  const [course, setCourse] = useState<CategoryCourse | null>(null);
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);

  // A reopened modal should be blank, not holding the last selection/attempt.
  useEffect(() => {
    if (isOpen) {
      setCourse(null);
      setHasTriedSubmit(false);
      linkMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    setCourse(null);
    setHasTriedSubmit(false);
    linkMutation.reset();
    onClose();
  };

  const courseError = hasTriedSubmit && !course
    ? intl.formatMessage(messages.linkCourseRequired)
    : undefined;

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    setHasTriedSubmit(true);
    if (!course) { return; }

    try {
      await linkMutation.mutateAsync(course.courseKey);
      showToast(intl.formatMessage(messages.toastLinked));
      setCourse(null);
      setHasTriedSubmit(false);
      onSuccess?.();
      onClose();
    } catch (error) {
      logError(error);
      // Error shown in the modal Alert below.
    }
  };

  return (
    <FormModal
      title={intl.formatMessage(messages.linkCourseTitle)}
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={handleSubmit}
      submitLabel={intl.formatMessage(messages.linkCourseSubmit)}
      cancelLabel={intl.formatMessage(messages.linkCourseCancel)}
      isSubmitting={linkMutation.isPending}
      size="md"
    >
      <p className="small text-muted mb-3">{categoryName}</p>

      <CoursePicker
        categoryId={categoryId}
        selected={course}
        onSelect={setCourse}
        error={courseError}
      />

      {linkMutation.isError && (
        <Alert variant="danger" className="mt-4 mb-0">
          {getErrorReason(linkMutation.error) ?? intl.formatMessage(messages.toastLinkError)}
        </Alert>
      )}
    </FormModal>
  );
};

export default LinkCourseModal;
