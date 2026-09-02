/**
 * Create / edit user modal.
 *
 * One component for both modes: the fields are identical apart from email,
 * which is settable only at creation because the username is derived from it
 * and renaming a username breaks course and forum references.
 *
 * On edit only changed fields are sent, so an untouched grant is never
 * re-asserted and the backend's audit log stays honest about what an admin
 * actually did.
 */
import { useContext, useRef, useState } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Alert, Col, Form, Row,
} from '@openedx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import FormModal from '@src/components/FormModal';
import { useToast } from '@src/components/ToastContext';
import { getErrorReason } from '@src/data/httpError';
import RoleGrantFields, { RoleGrantValues } from '../components/RoleGrantFields';
import COUNTRIES from '../data/countries';
import { useCreateUser, useUpdateUser } from '../data/hooks';
import { uploadUserImage } from '../data/api';
import type {
  ProfileVisibility, UserCreatePayload, UserDetail, UserPatchPayload,
} from '../data/types';
import messages from '../messages';

const MAX_NAME = 255;
const MAX_BIO = 3000;
const BIO_ROWS = 4;

interface FormValues extends RoleGrantValues {
  email: string;
  name: string;
  job: string;
  country: string;
  biography: string;
  profileVisibility: ProfileVisibility;
  isActive: boolean;
}

const emptyValues: FormValues = {
  email: '',
  name: '',
  job: '',
  country: '',
  biography: '',
  profileVisibility: 'private',
  isActive: false,
  isGlobalStaff: false,
  isSuperuser: false,
};

const toFormValues = (user: UserDetail | null): FormValues => (user
  ? {
    email: user.email ?? '',
    name: user.name ?? '',
    job: user.job ?? '',
    country: user.country ?? '',
    biography: user.biography ?? '',
    profileVisibility: user.profileVisibility ?? 'private',
    isActive: user.isActive,
    isGlobalStaff: user.roles.isGlobalStaff,
    isSuperuser: user.roles.isSuperuser,
  }
  : emptyValues);

/** Only the fields that actually changed, so PATCH stays a real partial update. */
const changedFields = (values: FormValues, initial: FormValues): UserPatchPayload => {
  const patch: UserPatchPayload = {};
  (Object.keys(values) as (keyof FormValues)[]).forEach((key) => {
    if (key === 'email') { return; } // creation-only
    if (values[key] !== initial[key]) {
      Object.assign(patch, { [key]: values[key] });
    }
  });
  return patch;
};

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** null = create mode. */
  user: UserDetail | null;
}

const UserFormModal = ({ isOpen, onClose, user }: UserFormModalProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const { authenticatedUser } = useContext(AppContext) as {
    authenticatedUser?: { userId?: number };
  };
  // The email hint is guidance for filling the field in, not a standing
  // statement about the form — so it appears on focus and leaves on blur.
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const isEdit = user !== null;
  const isSelf = isEdit && authenticatedUser?.userId === user.id;

  const createMutation = useCreateUser();
  const updateMutation = useUpdateUser(user?.id ?? 0);
  const mutation = isEdit ? updateMutation : createMutation;

  const validationSchema = Yup.object({
    email: Yup.string()
      .email(intl.formatMessage(messages.invalidEmail))
      .required(intl.formatMessage(messages.requiredField)),
    name: Yup.string()
      .max(MAX_NAME, intl.formatMessage(messages.tooLong))
      .required(intl.formatMessage(messages.requiredField)),
    job: Yup.string().max(MAX_NAME, intl.formatMessage(messages.tooLong)),
    biography: Yup.string().max(MAX_BIO, intl.formatMessage(messages.tooLong)),
  });

  const initialValues = toFormValues(user);

  const formik = useFormik<FormValues>({
    initialValues,
    enableReinitialize: true,
    validationSchema,
    onSubmit: async (values) => {
      try {
        let savedUserId = user?.id ?? 0;
        if (isEdit) {
          const patch = changedFields(values, initialValues);
          if (Object.keys(patch).length > 0) {
            await updateMutation.mutateAsync(patch);
          }
        } else {
          const payload: UserCreatePayload = {
            email: values.email,
            name: values.name,
            job: values.job,
            country: values.country,
            biography: values.biography,
            profileVisibility: values.profileVisibility,
            isActive: values.isActive,
            isGlobalStaff: values.isGlobalStaff,
            isSuperuser: values.isSuperuser,
          };
          const created = await createMutation.mutateAsync(payload);
          savedUserId = created.id;
        }
        if (avatarFile && savedUserId > 0) {
          await uploadUserImage(savedUserId, avatarFile);
        }
        showToast(intl.formatMessage(
          isEdit ? messages.toastUpdated : messages.toastCreated,
          { name: values.name },
        ));
        setAvatarFile(null);
        setAvatarPreview(null);
        onClose();
      } catch (error) {
        logError(error);
        showToast(intl.formatMessage(messages.toastError, {
          reason: getErrorReason(error) ?? intl.formatMessage(messages.genericError),
        }));
      }
    },
  });

  const fieldError = (field: keyof FormValues) => (
    formik.touched[field] && formik.errors[field] ? String(formik.errors[field]) : ''
  );

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) { return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    // eslint-disable-next-line no-param-reassign
    event.target.value = '';
  };

  const currentAvatarSrc = avatarPreview ?? user?.image ?? null;

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

        {/* Avatar upload — hidden file input triggered by the avatar circle. */}
        <div className="d-flex align-items-center mb-4 gap-3">
          <button
            type="button"
            className="rwaq-avatar-upload-btn"
            aria-label={intl.formatMessage(messages.fieldAvatar)}
            onClick={() => avatarInputRef.current?.click()}
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
            {currentAvatarSrc ? (
              <img src={currentAvatarSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span aria-hidden="true" style={{ fontSize: '1.75rem' }}>👤</span>
            )}
          </button>
          <div>
            <button
              type="button"
              className="btn btn-sm btn-outline-primary"
              onClick={() => avatarInputRef.current?.click()}
            >
              {intl.formatMessage(messages.fieldAvatarChange)}
            </button>
            {avatarFile && (
              <button
                type="button"
                className="btn btn-sm btn-link text-danger ml-2"
                onClick={() => { setAvatarFile(null); setAvatarPreview(null); }}
              >
                {intl.formatMessage(messages.fieldAvatarRemove)}
              </button>
            )}
            <div className="small text-muted mt-1">{intl.formatMessage(messages.fieldAvatarHelp)}</div>
          </div>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleAvatarChange}
          />
        </div>

        <Row>
          <Col xs={12} md={6}>
            <Form.Group className="mb-4" isInvalid={!!fieldError('email')} controlId="user-form-email">
              <Form.Label>{intl.formatMessage(messages.fieldEmail)}</Form.Label>
              <Form.Control
                name="email"
                type="email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onFocus={() => setIsEmailFocused(true)}
                onBlur={(event: React.FocusEvent<HTMLInputElement>) => {
                  setIsEmailFocused(false);
                  formik.handleBlur(event);
                }}
                disabled={isEdit}
              />
              {!isEdit && isEmailFocused && !fieldError('email') && (
                <Form.Text muted>{intl.formatMessage(messages.fieldEmailHelp)}</Form.Text>
              )}
              {fieldError('email') && (
                <Form.Control.Feedback type="invalid">{fieldError('email')}</Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group className="mb-4" isInvalid={!!fieldError('name')} controlId="user-form-name">
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
          </Col>

          <Col xs={12} md={6}>
            <Form.Group className="mb-4" isInvalid={!!fieldError('job')} controlId="user-form-job">
              <Form.Label>{intl.formatMessage(messages.fieldJob)}</Form.Label>
              <Form.Control
                name="job"
                value={formik.values.job}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
              />
              {fieldError('job') && (
                <Form.Control.Feedback type="invalid">{fieldError('job')}</Form.Control.Feedback>
              )}
            </Form.Group>
          </Col>

          <Col xs={12} md={6}>
            <Form.Group className="mb-4" controlId="user-form-country">
              <Form.Label>{intl.formatMessage(messages.fieldCountry)}</Form.Label>
              <Form.Control
                as="select"
                name="country"
                value={formik.values.country}
                onChange={formik.handleChange}
              >
                <option value="">{intl.formatMessage(messages.fieldCountryNone)}</option>
                {COUNTRIES.filter((country) => country.code).map((country) => (
                  <option key={country.code} value={country.code}>{country.name}</option>
                ))}
              </Form.Control>
            </Form.Group>
          </Col>
        </Row>

        {/* Plain textarea, deliberately: a biography is short prose, and a rich
            text editor here would let markup into a field the learner-facing
            profile renders as text. */}
        <Form.Group className="mb-4" isInvalid={!!fieldError('biography')} controlId="user-form-biography">
          <Form.Label>{intl.formatMessage(messages.fieldBiography)}</Form.Label>
          <Form.Control
            as="textarea"
            rows={BIO_ROWS}
            name="biography"
            value={formik.values.biography}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          {fieldError('biography') && (
            <Form.Control.Feedback type="invalid">{fieldError('biography')}</Form.Control.Feedback>
          )}
        </Form.Group>

        <Form.Group className="mb-0" controlId="user-form-visibility">
          <Form.Label>{intl.formatMessage(messages.fieldVisibility)}</Form.Label>
          <Form.Control
            as="select"
            name="profileVisibility"
            className="rwaq-select--compact"
            value={formik.values.profileVisibility}
            onChange={formik.handleChange}
          >
            <option value="private">{intl.formatMessage(messages.visibilityPrivate)}</option>
            <option value="public">{intl.formatMessage(messages.visibilityPublic)}</option>
          </Form.Control>
        </Form.Group>
      </section>

      <section className="rwaq-form-section">
        <h3 className="rwaq-form-section__title">{intl.formatMessage(messages.sectionStatus)}</h3>
        <Form.Group className="mb-0">
          <Form.Switch
            name="isActive"
            checked={formik.values.isActive}
            disabled={isSelf}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => formik.setFieldValue('isActive', event.target.checked)}
          >
            {intl.formatMessage(messages.fieldActive)}
          </Form.Switch>
          <Form.Text muted>
            {intl.formatMessage(isSelf ? messages.selfDeactivateBlocked : messages.fieldActiveHelp)}
          </Form.Text>
        </Form.Group>
      </section>

      <section className="rwaq-form-section">
        <h3 className="rwaq-form-section__title">{intl.formatMessage(messages.sectionRoles)}</h3>
        <RoleGrantFields
          values={{
            isGlobalStaff: formik.values.isGlobalStaff,
            isSuperuser: formik.values.isSuperuser,
          }}
          onChange={(field, value) => formik.setFieldValue(field, value)}
          isCourseCreator={user?.roles.isCourseCreator}
          isSupportStaff={user?.roles.isSupportStaff}
          orgAdminOf={user?.roles.orgAdminOf}
          canRevokeGlobalStaff={!isSelf}
          canRevokeSuperuser={!isSelf}
          hideSuperuser
        />
      </section>

      {mutation.isError && (
        <Alert variant="danger" className="mt-4 mb-0">
          {getErrorReason(mutation.error) ?? intl.formatMessage(messages.genericError)}
        </Alert>
      )}
    </FormModal>
  );
};

export default UserFormModal;
