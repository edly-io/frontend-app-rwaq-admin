/**
 * Create / edit category modal.
 *
 * One component for both modes. Both fields (name, arabicName) are editable
 * in both modes; the active toggle is always editable too.
 */
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Alert, Form } from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import FormModal from '@src/components/FormModal';
import { useToast } from '@src/components/ToastContext';
import { getErrorReason } from '@src/data/httpError';
import { useCreateCategory, useUpdateCategory } from '../data/hooks';
import type { CategoryCreatePayload, CategoryDetail, CategoryPatch } from '../data/types';
import messages from '../messages';

const MAX_NAME = 100;

interface FormValues {
  name: string;
  arabicName: string;
  isActive: boolean;
}

const emptyValues: FormValues = { name: '', arabicName: '', isActive: true };

const toFormValues = (category: CategoryDetail | null): FormValues => (category
  ? {
    name: category.name,
    arabicName: category.arabicName ?? '',
    isActive: category.isActive,
  }
  : emptyValues);

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** null = create mode. */
  category: CategoryDetail | null;
}

const CategoryFormModal = ({ isOpen, onClose, category }: CategoryFormModalProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const isEdit = category !== null;

  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory(category?.id ?? 0);
  const mutation = isEdit ? updateMutation : createMutation;

  const validationSchema = Yup.object({
    name: Yup.string()
      .max(MAX_NAME, intl.formatMessage(messages.tooLong))
      .required(intl.formatMessage(messages.requiredField)),
    arabicName: Yup.string().max(MAX_NAME, intl.formatMessage(messages.tooLong)),
  });

  const formik = useFormik<FormValues>({
    initialValues: toFormValues(category),
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEdit) {
          const patch: CategoryPatch = {
            name: values.name,
            arabicName: values.arabicName,
            isActive: values.isActive,
          };
          await updateMutation.mutateAsync(patch);
          showToast(intl.formatMessage(messages.toastUpdated, { name: values.name }));
        } else {
          const payload: CategoryCreatePayload = {
            name: values.name,
            arabicName: values.arabicName,
            isActive: values.isActive,
          };
          await createMutation.mutateAsync(payload);
          showToast(intl.formatMessage(messages.toastCreated, { name: values.name }));
        }
        onClose();
      } catch (error) {
        logError(error);
        // Error shown in the modal Alert below.
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    createMutation.reset();
    updateMutation.reset();
    onClose();
  };

  const fieldError = (field: keyof FormValues) => (
    formik.touched[field] && formik.errors[field] ? String(formik.errors[field]) : ''
  );

  return (
    <FormModal
      title={intl.formatMessage(isEdit ? messages.editTitle : messages.createTitle)}
      isOpen={isOpen}
      onClose={handleClose}
      onSubmit={formik.handleSubmit}
      submitLabel={intl.formatMessage(isEdit ? messages.save : messages.create)}
      cancelLabel={intl.formatMessage(messages.cancel)}
      isSubmitting={mutation.isPending}
    >
      <section className="rwaq-form-section">
        <Form.Group className="mb-4" isInvalid={!!fieldError('name')} controlId="category-form-name">
          <Form.Label>{intl.formatMessage(messages.fieldName)}</Form.Label>
          <Form.Control
            name="name"
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {fieldError('name') && (
            <Form.Control.Feedback type="invalid">{fieldError('name')}</Form.Control.Feedback>
          )}
        </Form.Group>

        <Form.Group className="mb-4" isInvalid={!!fieldError('arabicName')} controlId="category-form-arabic-name">
          <Form.Label>{intl.formatMessage(messages.fieldArabicName)}</Form.Label>
          <Form.Control
            name="arabicName"
            dir="rtl"
            value={formik.values.arabicName}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {fieldError('arabicName') && (
            <Form.Control.Feedback type="invalid">{fieldError('arabicName')}</Form.Control.Feedback>
          )}
        </Form.Group>

        <Form.Group className="mb-0" controlId="category-form-is-active">
          <Form.Checkbox
            name="isActive"
            label={intl.formatMessage(messages.fieldIsActive)}
            checked={formik.values.isActive}
            onChange={formik.handleChange}
          />
          <Form.Text muted>{intl.formatMessage(messages.fieldIsActiveHelp)}</Form.Text>
        </Form.Group>
      </section>

      {mutation.isError && (
        <Alert variant="danger" className="mt-4 mb-0">
          {getErrorReason(mutation.error) ?? intl.formatMessage(messages.genericError)}
        </Alert>
      )}
    </FormModal>
  );
};

export default CategoryFormModal;
