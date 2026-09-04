/**
 * Modal to link a course to a category by entering its course key.
 *
 * The backend validates the course key and rejects unknown courses, so we
 * don't need a course picker here — a plain text field + the backend's own
 * error message is enough.
 */
import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Alert, Form } from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import FormModal from '@src/components/FormModal';
import { useToast } from '@src/components/ToastContext';
import { getErrorReason } from '@src/data/httpError';
import { useLinkCourse } from '../data/hooks';
import messages from '../messages';

interface LinkCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: number;
  categoryName: string;
}

const LinkCourseModal = ({
  isOpen, onClose, categoryId, categoryName,
}: LinkCourseModalProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const linkMutation = useLinkCourse(categoryId);

  const formik = useFormik({
    initialValues: { courseKey: '' },
    validationSchema: Yup.object({
      courseKey: Yup.string().required(intl.formatMessage(messages.linkCourseRequired)),
    }),
    onSubmit: async (values, helpers) => {
      try {
        await linkMutation.mutateAsync(values.courseKey.trim());
        showToast(intl.formatMessage(messages.toastLinked));
        helpers.resetForm();
        onClose();
      } catch (error) {
        logError(error);
        // Error shown in the modal Alert below.
      }
    },
  });

  // A reopened modal should be blank, not holding the last failed attempt.
  useEffect(() => {
    if (isOpen) {
      formik.resetForm();
      linkMutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    formik.resetForm();
    linkMutation.reset();
    onClose();
  };

  return (
    <FormModal
      title={intl.formatMessage(messages.linkCourseTitle)}
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={formik.handleSubmit}
      submitLabel={intl.formatMessage(messages.linkCourseSubmit)}
      cancelLabel={intl.formatMessage(messages.linkCourseCancel)}
      isSubmitting={linkMutation.isPending}
      size="md"
    >
      <p className="small text-muted mb-3">{categoryName}</p>

      <Form.Group
        className="mb-0"
        isInvalid={!!(formik.touched.courseKey && formik.errors.courseKey)}
        controlId="link-course-key"
      >
        <Form.Label>{intl.formatMessage(messages.fieldCourseKey)}</Form.Label>
        <Form.Control
          name="courseKey"
          placeholder="course-v1:Org+CourseName+Run"
          value={formik.values.courseKey}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
        />
        {!formik.errors.courseKey && (
          <Form.Text muted>{intl.formatMessage(messages.fieldCourseKeyHelp)}</Form.Text>
        )}
        {formik.touched.courseKey && formik.errors.courseKey && (
          <Form.Control.Feedback type="invalid">{formik.errors.courseKey}</Form.Control.Feedback>
        )}
      </Form.Group>

      {linkMutation.isError && (
        <Alert variant="danger" className="mt-4 mb-0">
          {getErrorReason(linkMutation.error) ?? intl.formatMessage(messages.toastLinkError)}
        </Alert>
      )}
    </FormModal>
  );
};

export default LinkCourseModal;
