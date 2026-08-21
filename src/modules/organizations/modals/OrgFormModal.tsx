/**
 * Create / edit organization modal.
 *
 * One component for both modes. Name and short name are creation-only: the
 * short name becomes the org prefix of every course key under this
 * organization, so changing it would orphan existing courses, and the backend
 * treats both as read-only on PATCH.
 */
import { useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert, Col, Form, Row,
} from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import FormModal from '@src/components/FormModal';
import { useToast } from '@src/components/ToastContext';
import { getErrorReason } from '@src/data/httpError';
import { useCreateOrganization, useUpdateOrganization } from '../data/hooks';
import type { OrgCreatePayload, OrgDetail, OrgProfilePatch } from '../data/types';
import messages from '../messages';

const SHORT_NAME_RE = /^[A-Za-z0-9_-]+$/;
const MAX_NAME = 255;
const MAX_DESCRIPTION = 2000;
const DETAIL_ROWS = 4;

interface FormValues {
  name: string;
  shortName: string;
  description: string;
  arabicName: string;
  detail: string;
  featuredVideo: string;
  isFeatured: boolean;
}

const emptyValues: FormValues = {
  name: '',
  shortName: '',
  description: '',
  arabicName: '',
  detail: '',
  featuredVideo: '',
  isFeatured: false,
};

const toFormValues = (organization: OrgDetail | null): FormValues => (organization
  ? {
    name: organization.name,
    shortName: organization.shortName,
    description: '',
    arabicName: organization.arabicName ?? '',
    detail: organization.detail ?? '',
    featuredVideo: organization.featuredVideo ?? '',
    isFeatured: organization.isFeatured ?? false,
  }
  : emptyValues);

interface OrgFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** null = create mode. */
  organization: OrgDetail | null;
}

const OrgFormModal = ({ isOpen, onClose, organization }: OrgFormModalProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const isEdit = organization !== null;
  // Guidance for filling the field in, so it appears on focus and leaves on
  // blur rather than standing permanently under the input.
  const [isShortNameFocused, setIsShortNameFocused] = useState(false);

  const createMutation = useCreateOrganization();
  const updateMutation = useUpdateOrganization(organization?.shortName ?? '');
  const mutation = isEdit ? updateMutation : createMutation;

  const validationSchema = Yup.object({
    name: Yup.string()
      .max(MAX_NAME, intl.formatMessage(messages.tooLong))
      .required(intl.formatMessage(messages.requiredField)),
    shortName: Yup.string()
      .matches(SHORT_NAME_RE, intl.formatMessage(messages.shortNameInvalid))
      .max(MAX_NAME, intl.formatMessage(messages.tooLong))
      .required(intl.formatMessage(messages.requiredField)),
    arabicName: Yup.string().max(MAX_NAME, intl.formatMessage(messages.tooLong)),
    description: Yup.string().max(MAX_DESCRIPTION, intl.formatMessage(messages.tooLong)),
  });

  const formik = useFormik<FormValues>({
    initialValues: toFormValues(organization),
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        if (isEdit) {
          const patch: OrgProfilePatch = {
            arabicName: values.arabicName,
            detail: values.detail,
            featuredVideo: values.featuredVideo,
            isFeatured: values.isFeatured,
          };
          await updateMutation.mutateAsync(patch);
          showToast(intl.formatMessage(messages.toastUpdated, { name: values.name }));
        } else {
          const payload: OrgCreatePayload = {
            name: values.name,
            shortName: values.shortName,
            description: values.description,
            arabicName: values.arabicName,
            detail: values.detail,
            featuredVideo: values.featuredVideo,
            isFeatured: values.isFeatured,
          };
          await createMutation.mutateAsync(payload);
          showToast(intl.formatMessage(messages.toastCreated, { name: values.name }));
        }
        onClose();
      } catch (error) {
        logError(error);
        // Left to the in-modal Alert below rather than a toast: the admin has
        // a form full of input in front of them and needs to correct it.
      }
    },
  });

  const fieldError = (field: keyof FormValues) => (
    formik.touched[field] && formik.errors[field] ? String(formik.errors[field]) : ''
  );

  return (
    <FormModal
      title={intl.formatMessage(isEdit ? messages.editTitle : messages.createTitle)}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={formik.handleSubmit}
      submitLabel={intl.formatMessage(isEdit ? messages.save : messages.create)}
      cancelLabel={intl.formatMessage(messages.cancel)}
      isSubmitting={mutation.isPending}
    >
      <section className="rwaq-form-section">
        <h3 className="rwaq-form-section__title">{intl.formatMessage(messages.sectionProfile)}</h3>

        <Row>
          <Col xs={12} md={6}>
            <Form.Group className="mb-4" isInvalid={!!fieldError('name')} controlId="org-form-name">
              <Form.Label>{intl.formatMessage(messages.fieldName)}</Form.Label>
              <Form.Control
                name="name"
                value={formik.values.name}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                disabled={isEdit}
              />
              {fieldError('name') && (
                <Form.Control.Feedback type="invalid">{fieldError('name')}</Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group className="mb-4" isInvalid={!!fieldError('shortName')} controlId="org-form-short-name">
              <Form.Label>{intl.formatMessage(messages.fieldShortName)}</Form.Label>
              <Form.Control
                name="shortName"
                value={formik.values.shortName}
                onChange={formik.handleChange}
                onFocus={() => setIsShortNameFocused(true)}
                onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                  setIsShortNameFocused(false);
                  formik.handleBlur(event);
                }}
                disabled={isEdit}
              />
              {!isEdit && isShortNameFocused && !fieldError('shortName') && (
                <Form.Text muted>{intl.formatMessage(messages.fieldShortNameHelp)}</Form.Text>
              )}
              {fieldError('shortName') && (
                <Form.Control.Feedback type="invalid">{fieldError('shortName')}</Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-4" isInvalid={!!fieldError('arabicName')} controlId="org-form-arabic-name">
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

        {!isEdit && (
          <Form.Group className="mb-0" isInvalid={!!fieldError('description')} controlId="org-form-description">
            <Form.Label>{intl.formatMessage(messages.fieldDescription)}</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="description"
              value={formik.values.description}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
          </Form.Group>
        )}
      </section>

      <section className="rwaq-form-section">
        <h3 className="rwaq-form-section__title">{intl.formatMessage(messages.sectionPublic)}</h3>

        {/* Plain textarea — no rich-text editor anywhere in this MFE. */}
        <Form.Group className="mb-4" controlId="org-form-detail">
          <Form.Label>{intl.formatMessage(messages.fieldDetail)}</Form.Label>
          <Form.Control
            as="textarea"
            rows={DETAIL_ROWS}
            name="detail"
            value={formik.values.detail}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Form.Group>

        <Form.Group className="mb-4" controlId="org-form-featured-video">
          <Form.Label>{intl.formatMessage(messages.fieldFeaturedVideo)}</Form.Label>
          <Form.Control
            name="featuredVideo"
            type="url"
            value={formik.values.featuredVideo}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
        </Form.Group>

        <Form.Group className="mb-0">
          <Form.Switch
            name="isFeatured"
            checked={formik.values.isFeatured}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => formik.setFieldValue('isFeatured', event.target.checked)}
          >
            {intl.formatMessage(messages.fieldIsFeatured)}
          </Form.Switch>
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

export default OrgFormModal;
