/**
 * Add an Organization Admin by email.
 *
 * The modal deliberately stays open for the whole request and reports failure
 * *inside itself*: the most common failure is "no account for that email",
 * which the admin fixes by correcting the field they are still looking at.
 * Closing first and toasting the error would throw away their input.
 */
import { useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Alert, Form } from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import FormModal from '@src/components/FormModal';
import { useToast } from '@src/components/ToastContext';
import { getErrorStatus } from '@src/data/httpError';
import { useAddOrgAdmin } from '../data/hooks';
import messages from '../messages';

interface AddOrgAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  shortName: string;
}

const AddOrgAdminModal = ({ isOpen, onClose, shortName }: AddOrgAdminModalProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const mutation = useAddOrgAdmin(shortName);

  const formik = useFormik({
    initialValues: { email: '' },
    validationSchema: Yup.object({
      email: Yup.string()
        .email(intl.formatMessage(messages.addAdminInvalidEmail))
        .required(intl.formatMessage(messages.requiredField)),
    }),
    onSubmit: async (values) => {
      try {
        await mutation.mutateAsync(values.email);
        // Only now is it safe to close: the roster has been invalidated and
        // will refetch with this person in it.
        showToast(intl.formatMessage(messages.toastAdminAdded, { email: values.email }));
        onClose();
      } catch (error) {
        logError(error);
        // Stay open — the Alert below shows why.
      }
    },
  });

  // A reopened modal should be blank, not holding the last failed attempt.
  useEffect(() => {
    if (isOpen) {
      formik.resetForm();
      mutation.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const emailError = formik.touched.email && formik.errors.email ? formik.errors.email : '';

  /** 404 means "no such account", which deserves a real explanation. */
  const failureMessage = (): string => {
    const status = getErrorStatus(mutation.error);
    if (status === 404) { return intl.formatMessage(messages.addAdminNotFound); }
    const data = (mutation.error as { response?: { data?: { detail?: string } } })?.response?.data;
    return data?.detail ?? intl.formatMessage(messages.genericError);
  };

  return (
    <FormModal
      title={intl.formatMessage(messages.addAdminTitle)}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={formik.handleSubmit}
      submitLabel={intl.formatMessage(messages.addAdminSubmit)}
      cancelLabel={intl.formatMessage(messages.cancel)}
      isSubmitting={mutation.isPending}
      size="md"
    >
      <Form.Group className="mb-0" isInvalid={!!emailError} controlId="add-org-admin-email">
        <Form.Label>{intl.formatMessage(messages.addAdminEmail)}</Form.Label>
        <Form.Control
          name="email"
          type="email"
          autoComplete="off"
          value={formik.values.email}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          disabled={mutation.isPending}
        />
        {emailError
          ? <Form.Control.Feedback type="invalid">{emailError}</Form.Control.Feedback>
          : <Form.Text muted>{intl.formatMessage(messages.addAdminHelp)}</Form.Text>}
      </Form.Group>

      {mutation.isError && (
        <Alert variant="danger" className="mt-4 mb-0">{failureMessage()}</Alert>
      )}
    </FormModal>
  );
};

export default AddOrgAdminModal;
