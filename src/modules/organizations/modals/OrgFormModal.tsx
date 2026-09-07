/**
 * Create / edit organization modal.
 *
 * One component for both modes. Name and short name are creation-only: the
 * short name becomes the org prefix of every course key under this
 * organization, so changing it would orphan existing courses, and the backend
 * treats both as read-only on PATCH.
 */
import { useRef, useState } from 'react';
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
import { updateOrganization } from '../data/api';
import type { OrgCreatePayload, OrgDetail, OrgProfilePatch } from '../data/types';
import messages from '../messages';

const SHORT_NAME_RE = /^[A-Za-z0-9_-]+$/;
const MAX_NAME = 255;

interface FormValues {
  name: string;
  shortName: string;
  arabicName: string;
  featuredVideo: string;
}

const emptyValues: FormValues = {
  name: '',
  shortName: '',
  arabicName: '',
  featuredVideo: '',
};

const toFormValues = (organization: OrgDetail | null): FormValues => (organization
  ? {
    name: organization.name,
    shortName: organization.shortName,
    arabicName: organization.arabicName ?? '',
    featuredVideo: organization.featuredVideo ?? '',
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
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoTypeError, setLogoTypeError] = useState<string | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

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
            featuredVideo: values.featuredVideo,
          };
          await updateMutation.mutateAsync({ patch, logoFile });
          showToast(intl.formatMessage(messages.toastUpdated, { name: values.name }));
        } else {
          const payload: OrgCreatePayload = {
            name: values.name,
            shortName: values.shortName,
            arabicName: values.arabicName,
            featuredVideo: values.featuredVideo,
          };
          const created = await createMutation.mutateAsync(payload);
          if (logoFile) {
            await updateOrganization(created.shortName, {}, logoFile);
          }
          showToast(intl.formatMessage(messages.toastCreated, { name: values.name }));
        }
        setLogoFile(null);
        setLogoTypeError(null);
        setLogoPreview(null);
        onClose();
      } catch (error) {
        logError(error);
        // Left to the in-modal Alert below rather than a toast: the admin has
        // a form full of input in front of them and needs to correct it.
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    createMutation.reset();
    updateMutation.reset();
    setLogoFile(null);
    setLogoTypeError(null);
    setLogoPreview((prev) => { if (prev) { URL.revokeObjectURL(prev); } return null; });
    onClose();
  };

  const ALLOWED_IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif'];

  const handleLogoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    // eslint-disable-next-line no-param-reassign
    event.target.value = '';
    if (!file) { return; }
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!ALLOWED_IMAGE_EXTS.includes(ext)) {
      setLogoTypeError(intl.formatMessage(messages.fieldLogoTypeError));
      return;
    }
    setLogoTypeError(null);
    setLogoFile(file);
    setLogoPreview((prev) => {
      if (prev) { URL.revokeObjectURL(prev); }
      return URL.createObjectURL(file);
    });
  };

  const currentLogoSrc = logoPreview ?? organization?.logo ?? null;

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
        {/* Logo upload — available in both create and edit mode. */}
        <div className="d-flex align-items-center mb-4" style={{ gap: '1.25rem' }}>
          <button
            type="button"
            className="rwaq-logo-upload-btn"
            aria-label={intl.formatMessage(messages.fieldLogo)}
            onClick={() => logoInputRef.current?.click()}
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              border: '2px dashed var(--pgn-color-border, #d2d2d2)',
              overflow: 'hidden',
              cursor: 'pointer',
              background: 'var(--rwaq-surface-sunken, #f5f5f5)',
              flexShrink: 0,
              padding: 0,
            }}
          >
            {currentLogoSrc ? (
              <img src={currentLogoSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span aria-hidden="true" style={{ fontSize: '1.75rem' }}>🏢</span>
            )}
          </button>
          <div>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => logoInputRef.current?.click()}
            >
              {intl.formatMessage(messages.fieldLogoChange)}
            </button>
            {logoFile && (
              <button
                type="button"
                className="btn btn-sm btn-link text-danger ml-2"
                onClick={() => {
                  setLogoFile(null);
                  setLogoTypeError(null);
                  setLogoPreview((prev) => { if (prev) { URL.revokeObjectURL(prev); } return null; });
                }}
              >
                {intl.formatMessage(messages.fieldLogoRemove)}
              </button>
            )}
            <div className="small text-muted mt-1">{intl.formatMessage(messages.fieldLogoHelp)}</div>
            {logoTypeError && (
              <div className="small text-danger mt-1">{logoTypeError}</div>
            )}
          </div>
          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleLogoChange}
          />
        </div>

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

      </section>

      <section className="rwaq-form-section">
        <h3 className="rwaq-form-section__title">{intl.formatMessage(messages.sectionPublic)}</h3>

        <Form.Group className="mb-0" controlId="org-form-featured-video">
          <Form.Label>{intl.formatMessage(messages.fieldFeaturedVideo)}</Form.Label>
          <Form.Control
            name="featuredVideo"
            type="url"
            value={formik.values.featuredVideo}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
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
