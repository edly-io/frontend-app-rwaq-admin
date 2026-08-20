/**
 * Create / edit user modal.
 *
 * One component for both modes: the fields are identical apart from email,
 * which is only settable at creation (the username is derived from it).
 *
 * On edit only the changed fields are sent, so an untouched grant is never
 * re-asserted and the audit log stays honest about what an admin actually did.
 */
import { useContext } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  ActionRow, Alert, Button, Col, Form, ModalDialog, Row, StatefulButton,
} from '@openedx/paragon';
import { AppContext } from '@edx/frontend-platform/react';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useToast } from '@src/components/ToastContext';
import RoleGrantFields, { RoleGrantValues } from '../components/RoleGrantFields';
import COUNTRIES from '../data/countries';
import { useCreateUser, useUpdateUser } from '../data/hooks';
import type {
  ProfileVisibility, UserCreatePayload, UserDetail, UserPatchPayload,
} from '../data/types';
import messages from '../messages';

const MAX_NAME = 255;
const MAX_BIO = 3000;

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
  isActive: true,
  isGlobalStaff: false,
  isCourseCreator: false,
  isSupportStaff: false,
};

const toFormValues = (user: UserDetail | null): FormValues => (user
  ? {
    email: user.email,
    name: user.name ?? '',
    job: user.job ?? '',
    country: user.country ?? '',
    biography: user.biography ?? '',
    profileVisibility: user.profileVisibility ?? 'private',
    isActive: user.isActive,
    isGlobalStaff: user.roles.isGlobalStaff,
    isCourseCreator: user.roles.isCourseCreator,
    isSupportStaff: user.roles.isSupportStaff,
  }
  : emptyValues);

/** Only the fields that actually changed, so PATCH stays a real partial update. */
const changedFields = (values: FormValues, initial: FormValues): UserPatchPayload => {
  const patch: UserPatchPayload = {};
  (Object.keys(values) as (keyof FormValues)[]).forEach((key) => {
    if (key === 'email') { return; } // never editable
    if (values[key] !== initial[key]) {
      Object.assign(patch, { [key]: values[key] });
    }
  });
  return patch;
};

/** Pull a human-readable reason out of a DRF error response. */
const errorReason = (error: unknown): string | null => {
  const data = (error as { response?: { data?: Record<string, unknown> } })?.response?.data;
  if (!data) { return null; }
  const firstValue = Object.values(data)[0];
  if (Array.isArray(firstValue)) { return String(firstValue[0]); }
  if (typeof firstValue === 'string') { return firstValue; }
  return null;
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
        if (isEdit) {
          const patch = changedFields(values, initialValues);
          if (Object.keys(patch).length > 0) {
            await updateMutation.mutateAsync(patch);
          }
          showToast(intl.formatMessage(messages.toastUpdated, { name: values.name }));
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
            isCourseCreator: values.isCourseCreator,
            isSupportStaff: values.isSupportStaff,
          };
          await createMutation.mutateAsync(payload);
          showToast(intl.formatMessage(messages.toastCreated, { name: values.name }));
        }
        onClose();
      } catch (error) {
        logError(error);
        showToast(intl.formatMessage(messages.toastError, {
          reason: errorReason(error) ?? intl.formatMessage(messages.genericError),
        }));
      }
    },
  });

  const fieldError = (field: keyof FormValues) => (
    formik.touched[field] && formik.errors[field] ? String(formik.errors[field]) : ''
  );

  const submitState = () => {
    if (mutation.isPending) { return 'pending'; }
    return 'default';
  };

  return (
    <ModalDialog
      title={intl.formatMessage(isEdit ? messages.editTitle : messages.createTitle)}
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      isFullscreenOnMobile
      hasCloseButton
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {intl.formatMessage(isEdit ? messages.editTitle : messages.createTitle)}
        </ModalDialog.Title>
      </ModalDialog.Header>

      <Form onSubmit={formik.handleSubmit} noValidate>
        <ModalDialog.Body>
          <h3 className="h5 mb-3">{intl.formatMessage(messages.sectionProfile)}</h3>

          <Row>
            <Col xs={12} md={6}>
              <Form.Group className="mb-4" isInvalid={!!fieldError('email')} controlId="user-form-email">
                <Form.Label>{intl.formatMessage(messages.fieldEmail)}</Form.Label>
                <Form.Control
                  name="email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  disabled={isEdit}
                />
                {isEdit
                  ? null
                  : <Form.Text muted>{intl.formatMessage(messages.fieldEmailHelp)}</Form.Text>}
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

          <Form.Group className="mb-4" isInvalid={!!fieldError('biography')} controlId="user-form-biography">
            <Form.Label>{intl.formatMessage(messages.fieldBiography)}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="biography"
              value={formik.values.biography}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
            />
            {fieldError('biography') && (
              <Form.Control.Feedback type="invalid">{fieldError('biography')}</Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="mb-4" controlId="user-form-visibility">
            <Form.Label>{intl.formatMessage(messages.fieldVisibility)}</Form.Label>
            <Form.Control
              as="select"
              name="profileVisibility"
              value={formik.values.profileVisibility}
              onChange={formik.handleChange}
            >
              <option value="private">{intl.formatMessage(messages.visibilityPrivate)}</option>
              <option value="public">{intl.formatMessage(messages.visibilityPublic)}</option>
            </Form.Control>
          </Form.Group>

          <hr className="my-4" />
          <h3 className="h5 mb-3">{intl.formatMessage(messages.sectionStatus)}</h3>

          <Form.Group className="mb-4">
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

          <hr className="my-4" />
          <h3 className="h5 mb-3">{intl.formatMessage(messages.sectionRoles)}</h3>

          <RoleGrantFields
            values={{
              isGlobalStaff: formik.values.isGlobalStaff,
              isCourseCreator: formik.values.isCourseCreator,
              isSupportStaff: formik.values.isSupportStaff,
            }}
            onChange={(field, value) => formik.setFieldValue(field, value)}
            isSuperuser={user?.roles.isSuperuser}
            orgAdminOf={user?.roles.orgAdminOf}
            canRevokeGlobalStaff={!isSelf}
          />

          {mutation.isError && (
            <Alert variant="danger" className="mt-4 mb-0">
              {errorReason(mutation.error) ?? intl.formatMessage(messages.genericError)}
            </Alert>
          )}
        </ModalDialog.Body>

        <ModalDialog.Footer>
          <ActionRow>
            <Button variant="tertiary" type="button" onClick={onClose}>
              {intl.formatMessage(messages.cancel)}
            </Button>
            <StatefulButton
              type="submit"
              state={submitState()}
              labels={{
                default: intl.formatMessage(isEdit ? messages.save : messages.create),
                pending: intl.formatMessage(isEdit ? messages.save : messages.create),
              }}
              disabledStates={['pending']}
            />
          </ActionRow>
        </ModalDialog.Footer>
      </Form>
    </ModalDialog>
  );
};

export default UserFormModal;
