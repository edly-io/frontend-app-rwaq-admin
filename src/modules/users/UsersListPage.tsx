/**
 * UsersListPage — User Management page for the Rwaq Admin Panel.
 *
 * Search: search_by dropdown (Email/Name/User ID) + text input with
 *   client-side validation matching the backend contract:
 *     user_id  → digits only; reject non-numeric before API call.
 *     email    → must contain @.
 * Filter: dropdown (All / Instructor / Moderators / Students / Blocked /
 *   Confirmed / Unconfirmed / Private Profile / Public Profile / Facebook / Twitter).
 * All search/filter/page state is URL-driven (useSearchParams).
 *
 * Modals (Paragon ModalDialog):
 *   Add User  — POST /api/v1/admin/users/
 *   View User — GET /api/v1/admin/users/{id}/  (read-only)
 *   Edit User — PATCH /api/v1/admin/users/{id}/
 */
import { useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Button,
  Form,
  ModalDialog,
  Badge,
  Alert,
  Spinner,
} from '@openedx/paragon';
import { defineMessages, useIntl, FormattedMessage } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import ErrorState from '@src/components/ErrorState';
import type { ColumnDef } from '@src/components/AdminDataTable';
import type {
  UserCreatePayload,
  UserPatchPayload,
  UserRole,
  ProfileVisibility,
  SearchBy,
  UserFilter,
  UserSummary,
} from './data/types';
import {
  useUsers,
  useUser,
  useCreateUser,
  useUpdateUser,
} from './data/hooks';
import COUNTRIES from './data/countries';

// ── i18n messages ─────────────────────────────────────────────────────────────

const messages = defineMessages({
  title: {
    id: 'rwaq.admin.users.list.title',
    defaultMessage: 'User Management',
  },
  addUser: {
    id: 'rwaq.admin.users.list.addUser',
    defaultMessage: 'Add New User',
  },
  searchByLabel: {
    id: 'rwaq.admin.users.list.searchByLabel',
    defaultMessage: 'Search by',
  },
  searchTermLabel: {
    id: 'rwaq.admin.users.list.searchTermLabel',
    defaultMessage: 'Search',
  },
  searchTermPlaceholder: {
    id: 'rwaq.admin.users.list.searchTermPlaceholder',
    defaultMessage: 'Enter search term',
  },
  searchButton: {
    id: 'rwaq.admin.users.list.searchButton',
    defaultMessage: 'Search',
  },
  clearButton: {
    id: 'rwaq.admin.users.list.clearButton',
    defaultMessage: 'Clear',
  },
  filterLabel: {
    id: 'rwaq.admin.users.list.filterLabel',
    defaultMessage: 'Filter',
  },
  // Search-by options
  searchByEmail: {
    id: 'rwaq.admin.users.list.searchByEmail',
    defaultMessage: 'Email',
  },
  searchByName: {
    id: 'rwaq.admin.users.list.searchByName',
    defaultMessage: 'Name',
  },
  searchByUserId: {
    id: 'rwaq.admin.users.list.searchByUserId',
    defaultMessage: 'User ID',
  },
  // Filter options
  filterAll: {
    id: 'rwaq.admin.users.list.filterAll',
    defaultMessage: 'All',
  },
  filterInstructor: {
    id: 'rwaq.admin.users.list.filterInstructor',
    defaultMessage: 'Instructor',
  },
  filterModerators: {
    id: 'rwaq.admin.users.list.filterModerators',
    defaultMessage: 'Moderators',
  },
  filterStudents: {
    id: 'rwaq.admin.users.list.filterStudents',
    defaultMessage: 'Students',
  },
  filterBlocked: {
    id: 'rwaq.admin.users.list.filterBlocked',
    defaultMessage: 'Blocked',
  },
  filterConfirmed: {
    id: 'rwaq.admin.users.list.filterConfirmed',
    defaultMessage: 'Confirmed',
  },
  filterUnconfirmed: {
    id: 'rwaq.admin.users.list.filterUnconfirmed',
    defaultMessage: 'Unconfirmed',
  },
  filterPrivateProfile: {
    id: 'rwaq.admin.users.list.filterPrivateProfile',
    defaultMessage: 'Private Profile',
  },
  filterPublicProfile: {
    id: 'rwaq.admin.users.list.filterPublicProfile',
    defaultMessage: 'Public Profile',
  },
  filterFacebook: {
    id: 'rwaq.admin.users.list.filterFacebook',
    defaultMessage: 'Facebook',
  },
  filterTwitter: {
    id: 'rwaq.admin.users.list.filterTwitter',
    defaultMessage: 'Twitter',
  },
  // Column headers
  colUserId: {
    id: 'rwaq.admin.users.list.colUserId',
    defaultMessage: 'User ID',
  },
  colAvatar: {
    id: 'rwaq.admin.users.list.colAvatar',
    defaultMessage: 'Avatar',
  },
  colName: {
    id: 'rwaq.admin.users.list.colName',
    defaultMessage: 'Name',
  },
  colEmail: {
    id: 'rwaq.admin.users.list.colEmail',
    defaultMessage: 'Email',
  },
  colRole: {
    id: 'rwaq.admin.users.list.colRole',
    defaultMessage: 'Role',
  },
  colCreatedAt: {
    id: 'rwaq.admin.users.list.colCreatedAt',
    defaultMessage: 'Created At',
  },
  colAuthMethod: {
    id: 'rwaq.admin.users.list.colAuthMethod',
    defaultMessage: 'Authentication Method',
  },
  colActions: {
    id: 'rwaq.admin.users.list.colActions',
    defaultMessage: 'Actions',
  },
  actionView: {
    id: 'rwaq.admin.users.list.actionView',
    defaultMessage: 'View',
  },
  actionEdit: {
    id: 'rwaq.admin.users.list.actionEdit',
    defaultMessage: 'Edit',
  },
  // Error state
  errorTitle: {
    id: 'rwaq.admin.users.list.errorTitle',
    defaultMessage: 'Could not load users',
  },
  // Validation errors
  validationEmailInvalid: {
    id: 'rwaq.admin.users.validation.emailInvalid',
    defaultMessage: 'Please enter a valid email address (must contain @).',
  },
  validationUserIdInvalid: {
    id: 'rwaq.admin.users.validation.userIdInvalid',
    defaultMessage: 'User ID must contain digits only.',
  },
  // Add/Edit modal
  addModalTitle: {
    id: 'rwaq.admin.users.addModal.title',
    defaultMessage: 'Add New User',
  },
  editModalTitle: {
    id: 'rwaq.admin.users.editModal.title',
    defaultMessage: 'Editing User',
  },
  viewModalTitle: {
    id: 'rwaq.admin.users.viewModal.title',
    defaultMessage: 'User Details',
  },
  fieldEmail: {
    id: 'rwaq.admin.users.field.email',
    defaultMessage: 'Email',
  },
  fieldFullName: {
    id: 'rwaq.admin.users.field.fullName',
    defaultMessage: 'Full Name',
  },
  fieldRole: {
    id: 'rwaq.admin.users.field.role',
    defaultMessage: 'Role',
  },
  fieldVisibility: {
    id: 'rwaq.admin.users.field.visibility',
    defaultMessage: 'Profile Visibility',
  },
  fieldJob: {
    id: 'rwaq.admin.users.field.job',
    defaultMessage: 'Job',
  },
  fieldCountry: {
    id: 'rwaq.admin.users.field.country',
    defaultMessage: 'Country',
  },
  fieldBiography: {
    id: 'rwaq.admin.users.field.biography',
    defaultMessage: 'Biography',
  },
  fieldBlocked: {
    id: 'rwaq.admin.users.field.blocked',
    defaultMessage: 'Blocked',
  },
  roleInstructor: {
    id: 'rwaq.admin.users.role.instructor',
    defaultMessage: 'Instructor',
  },
  roleModerator: {
    id: 'rwaq.admin.users.role.moderator',
    defaultMessage: 'Moderator',
  },
  roleStudent: {
    id: 'rwaq.admin.users.role.student',
    defaultMessage: 'Student',
  },
  visibilityPrivate: {
    id: 'rwaq.admin.users.visibility.private',
    defaultMessage: 'Private',
  },
  visibilityPublic: {
    id: 'rwaq.admin.users.visibility.public',
    defaultMessage: 'Public',
  },
  cancelButton: {
    id: 'rwaq.admin.users.modal.cancel',
    defaultMessage: 'Cancel',
  },
  saveButton: {
    id: 'rwaq.admin.users.modal.save',
    defaultMessage: 'Save',
  },
  updateButton: {
    id: 'rwaq.admin.users.modal.update',
    defaultMessage: 'Update',
  },
  saveSuccess: {
    id: 'rwaq.admin.users.modal.saveSuccess',
    defaultMessage: 'User created successfully.',
  },
  updateSuccess: {
    id: 'rwaq.admin.users.modal.updateSuccess',
    defaultMessage: 'User updated successfully.',
  },
  saveError: {
    id: 'rwaq.admin.users.modal.saveError',
    defaultMessage: 'Failed to save user. Please try again.',
  },
  requiredField: {
    id: 'rwaq.admin.users.validation.required',
    defaultMessage: 'This field is required.',
  },
  // View detail labels
  viewUsername: {
    id: 'rwaq.admin.users.view.username',
    defaultMessage: 'Username',
  },
  viewLastLogin: {
    id: 'rwaq.admin.users.view.lastLogin',
    defaultMessage: 'Last Login',
  },
  viewIsActive: {
    id: 'rwaq.admin.users.view.isActive',
    defaultMessage: 'Active',
  },
  viewRoles: {
    id: 'rwaq.admin.users.view.roles',
    defaultMessage: 'Roles',
  },
  viewAuthMethods: {
    id: 'rwaq.admin.users.view.authMethods',
    defaultMessage: 'Authentication Methods',
  },
  viewConfirmed: {
    id: 'rwaq.admin.users.view.confirmed',
    defaultMessage: 'Confirmed',
  },
  viewProfilePublic: {
    id: 'rwaq.admin.users.view.profilePublic',
    defaultMessage: 'Profile Public',
  },
  closeButton: {
    id: 'rwaq.admin.users.modal.close',
    defaultMessage: 'Close',
  },
  none: {
    id: 'rwaq.admin.users.none',
    defaultMessage: 'None',
  },
  never: {
    id: 'rwaq.admin.users.never',
    defaultMessage: 'Never',
  },
  yes: {
    id: 'rwaq.admin.users.yes',
    defaultMessage: 'Yes',
  },
  no: {
    id: 'rwaq.admin.users.no',
    defaultMessage: 'No',
  },
});

// ── Validation helpers ────────────────────────────────────────────────────────

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DIGITS_RE = /^\d+$/;

const PAGE_SIZE = 20;

// ── Search/filter bar ─────────────────────────────────────────────────────────

interface SearchBarProps {
  onSearch: (by: SearchBy, term: string) => void;
  onClear: () => void;
  initialBy: SearchBy;
  initialTerm: string;
}

const UserSearchBar = ({
  onSearch, onClear, initialBy, initialTerm,
}: SearchBarProps) => {
  const intl = useIntl();
  const [searchBy, setSearchBy] = useState<SearchBy>(initialBy);
  const [searchTerm, setSearchTerm] = useState(initialTerm);
  const [validationError, setValidationError] = useState('');

  const validate = (by: SearchBy, term: string): string => {
    if (!term.trim()) { return ''; }
    if (by === 'user_id' && !DIGITS_RE.test(term.trim())) {
      return intl.formatMessage(messages.validationUserIdInvalid);
    }
    if (by === 'email' && !term.includes('@')) {
      return intl.formatMessage(messages.validationEmailInvalid);
    }
    return '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const err = validate(searchBy, searchTerm);
    if (err) {
      setValidationError(err);
      return;
    }
    setValidationError('');
    onSearch(searchBy, searchTerm.trim());
  };

  const handleClear = () => {
    setSearchTerm('');
    setValidationError('');
    onClear();
  };

  const handleByChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const next = e.target.value as SearchBy;
    setSearchBy(next);
    // Re-validate on search-by change if there is already a term
    if (searchTerm.trim()) {
      setValidationError(validate(next, searchTerm));
    }
  };

  return (
    <Form
      onSubmit={handleSubmit}
      className="d-flex align-items-end flex-wrap gap-2"
      noValidate
    >
      {/* search_by dropdown */}
      <Form.Group className="mb-0" controlId="user-search-by" style={{ minWidth: '130px' }}>
        <Form.Label className="sr-only">{intl.formatMessage(messages.searchByLabel)}</Form.Label>
        <Form.Control
          as="select"
          value={searchBy}
          onChange={handleByChange}
          aria-label={intl.formatMessage(messages.searchByLabel)}
        >
          <option value="email">{intl.formatMessage(messages.searchByEmail)}</option>
          <option value="name">{intl.formatMessage(messages.searchByName)}</option>
          <option value="user_id">{intl.formatMessage(messages.searchByUserId)}</option>
        </Form.Control>
      </Form.Group>

      {/* search term input */}
      <Form.Group className="mb-0 flex-grow-1" controlId="user-search-term">
        <Form.Label className="sr-only">{intl.formatMessage(messages.searchTermLabel)}</Form.Label>
        <Form.Control
          type="text"
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setSearchTerm(e.target.value);
            if (validationError) {
              setValidationError(validate(searchBy, e.target.value));
            }
          }}
          placeholder={intl.formatMessage(messages.searchTermPlaceholder)}
          isInvalid={!!validationError}
          aria-label={intl.formatMessage(messages.searchTermLabel)}
        />
        {validationError && (
          <Form.Control.Feedback type="invalid">{validationError}</Form.Control.Feedback>
        )}
      </Form.Group>

      <Button type="submit" variant="primary">
        {intl.formatMessage(messages.searchButton)}
      </Button>
      <Button type="button" variant="outline-secondary" onClick={handleClear}>
        {intl.formatMessage(messages.clearButton)}
      </Button>
    </Form>
  );
};

// ── Add User modal ────────────────────────────────────────────────────────────

interface AddUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
}

const EMPTY_CREATE: UserCreatePayload = {
  email: '',
  name: '',
  role: 'student',
  profile_visibility: 'private',
  job: '',
  country: '',
  biography: '',
  is_blocked: false,
};

const AddUserModal = ({ isOpen, onClose, onCreated }: AddUserModalProps) => {
  const intl = useIntl();
  const [values, setValues] = useState<UserCreatePayload>(EMPTY_CREATE);
  const [errors, setErrors] = useState<Partial<Record<keyof UserCreatePayload, string>>>({});
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const mutation = useCreateUser();

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!values.email.trim()) {
      next.email = intl.formatMessage(messages.requiredField);
    } else if (!EMAIL_RE.test(values.email.trim())) {
      next.email = intl.formatMessage(messages.validationEmailInvalid);
    }
    if (!values.name.trim()) {
      next.name = intl.formatMessage(messages.requiredField);
    }
    if (!values.role) {
      next.role = intl.formatMessage(messages.requiredField);
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    if (!validate()) { return; }

    mutation.mutate(values, {
      onSuccess: () => {
        setSuccessMsg(intl.formatMessage(messages.saveSuccess));
        setValues(EMPTY_CREATE);
        setTimeout(() => {
          setSuccessMsg('');
          onCreated();
          onClose();
        }, 1200);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        const detail = err?.response?.data?.detail
          ?? err?.response?.data?.email?.[0]
          ?? intl.formatMessage(messages.saveError);
        setApiError(detail);
      },
    });
  };

  const handleClose = () => {
    setValues(EMPTY_CREATE);
    setErrors({});
    setApiError('');
    setSuccessMsg('');
    onClose();
  };

  return (
    <ModalDialog
      title={intl.formatMessage(messages.addModalTitle)}
      isOpen={isOpen}
      onClose={handleClose}
      size="lg"
      hasCloseButton
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>{intl.formatMessage(messages.addModalTitle)}</ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        {successMsg && (
          <Alert variant="success" dismissible onClose={() => setSuccessMsg('')}>{successMsg}</Alert>
        )}
        {apiError && (
          <Alert variant="danger" dismissible onClose={() => setApiError('')}>{apiError}</Alert>
        )}

        <Form onSubmit={handleSubmit} noValidate>
          {/* Row 1: Username (Full Name) + Email */}
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="add-name">
                <Form.Label>
                  {intl.formatMessage(messages.fieldFullName)}
                  <span className="required" aria-hidden="true" style={{ color: '#d92d20', marginInlineStart: '2px' }}>*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  value={values.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValues({ ...values, name: e.target.value })}
                  isInvalid={!!errors.name}
                  aria-required="true"
                />
                {errors.name && (
                  <Form.Control.Feedback type="invalid">{errors.name}</Form.Control.Feedback>
                )}
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="add-email">
                <Form.Label>
                  {intl.formatMessage(messages.fieldEmail)}
                  <span aria-hidden="true" style={{ color: '#d92d20', marginInlineStart: '2px' }}>*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  value={values.email}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValues({ ...values, email: e.target.value })}
                  isInvalid={!!errors.email}
                  aria-required="true"
                />
                {errors.email && (
                  <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
                )}
              </Form.Group>
            </div>
          </div>

          {/* Role */}
          <Form.Group className="mb-3" controlId="add-role">
            <Form.Label>
              {intl.formatMessage(messages.fieldRole)}
              <span aria-hidden="true" style={{ color: '#d92d20', marginInlineStart: '2px' }}>*</span>
            </Form.Label>
            <Form.Control
              as="select"
              value={values.role}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => (
                setValues({ ...values, role: e.target.value as UserRole })
              )}
              isInvalid={!!errors.role}
              aria-required="true"
            >
              <option value="student">{intl.formatMessage(messages.roleStudent)}</option>
              <option value="instructor">{intl.formatMessage(messages.roleInstructor)}</option>
              <option value="moderator">{intl.formatMessage(messages.roleModerator)}</option>
            </Form.Control>
            {errors.role && (
              <Form.Control.Feedback type="invalid">{errors.role}</Form.Control.Feedback>
            )}
          </Form.Group>

          {/* Profile Visibility */}
          <Form.Group className="mb-3" controlId="add-visibility">
            <Form.Label>{intl.formatMessage(messages.fieldVisibility)}</Form.Label>
            <Form.Control
              as="select"
              value={values.profile_visibility ?? 'private'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => (
                setValues({ ...values, profile_visibility: e.target.value as ProfileVisibility })
              )}
            >
              <option value="private">{intl.formatMessage(messages.visibilityPrivate)}</option>
              <option value="public">{intl.formatMessage(messages.visibilityPublic)}</option>
            </Form.Control>
          </Form.Group>

          {/* Job + Country */}
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="add-job">
                <Form.Label>{intl.formatMessage(messages.fieldJob)}</Form.Label>
                <Form.Control
                  type="text"
                  value={values.job ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValues({ ...values, job: e.target.value })}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="add-country">
                <Form.Label>{intl.formatMessage(messages.fieldCountry)}</Form.Label>
                <Form.Control
                  as="select"
                  value={values.country ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => (
                    setValues({ ...values, country: e.target.value })
                  )}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>
          </div>

          {/* Biography */}
          <Form.Group className="mb-3" controlId="add-biography">
            <Form.Label>{intl.formatMessage(messages.fieldBiography)}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={values.biography ?? ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => (
                setValues({ ...values, biography: e.target.value })
              )}
            />
          </Form.Group>

          {/* Blocked */}
          <Form.Group className="mb-3" controlId="add-blocked">
            <Form.Checkbox
              id="add-blocked"
              checked={values.is_blocked ?? false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => (
                setValues({ ...values, is_blocked: e.target.checked })
              )}
            >
              {intl.formatMessage(messages.fieldBlocked)}
            </Form.Checkbox>
          </Form.Group>
        </Form>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button variant="tertiary" onClick={handleClose}>
          {intl.formatMessage(messages.cancelButton)}
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit as unknown as React.MouseEventHandler}
          disabled={mutation.isPending}
          style={{ background: '#d92d20', borderColor: '#d92d20' }}
        >
          {mutation.isPending ? (
            <Spinner animation="border" size="sm" role="status" className="me-2">
              <span className="sr-only">Saving…</span>
            </Spinner>
          ) : null}
          {intl.formatMessage(messages.saveButton)}
        </Button>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

// ── Shared detail row ─────────────────────────────────────────────────────────

/** Simple definition-list row used in the View modal */
const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <>
    <dt className="col-sm-4 text-muted" style={{ fontWeight: 600, fontSize: '0.875rem' }}>{label}</dt>
    <dd className="col-sm-8 mb-0" style={{ fontSize: '0.9375rem' }}>{value}</dd>
  </>
);

// ── View User modal ────────────────────────────────────────────────────────────

interface ViewUserModalProps {
  userId: number | null;
  onClose: () => void;
}

const ViewUserModal = ({ userId, onClose }: ViewUserModalProps) => {
  const intl = useIntl();
  const { data: user, isLoading, isError } = useUser(userId ?? 0);

  return (
    <ModalDialog
      title={intl.formatMessage(messages.viewModalTitle)}
      isOpen={userId !== null}
      onClose={onClose}
      size="lg"
      hasCloseButton
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>{intl.formatMessage(messages.viewModalTitle)}</ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        {isLoading && (
          <div className="d-flex justify-content-center py-4">
            <Spinner animation="border" variant="primary" role="status">
              <span className="sr-only">Loading…</span>
            </Spinner>
          </div>
        )}
        {isError && (
          <Alert variant="danger">
            <FormattedMessage
              id="rwaq.admin.users.view.loadError"
              defaultMessage="Could not load user details."
            />
          </Alert>
        )}
        {user && (
          <dl className="row mb-0" style={{ rowGap: '0.5rem' }}>
            <DetailRow label={intl.formatMessage(messages.viewUsername)} value={user.username} />
            <DetailRow label={intl.formatMessage(messages.fieldFullName)} value={user.name} />
            <DetailRow label={intl.formatMessage(messages.fieldEmail)} value={user.email} />
            <DetailRow label={intl.formatMessage(messages.fieldRole)} value={user.role} />
            <DetailRow
              label={intl.formatMessage(messages.viewRoles)}
              value={user.roles.length > 0 ? user.roles.join(', ') : intl.formatMessage(messages.none)}
            />
            <DetailRow
              label={intl.formatMessage(messages.viewAuthMethods)}
              value={user.authentication_methods.length > 0
                ? user.authentication_methods.join(', ')
                : intl.formatMessage(messages.none)}
            />
            <DetailRow label={intl.formatMessage(messages.fieldJob)} value={user.job || '—'} />
            <DetailRow label={intl.formatMessage(messages.fieldCountry)} value={user.country || '—'} />
            <DetailRow label={intl.formatMessage(messages.fieldBiography)} value={user.biography || '—'} />
            <DetailRow
              label={intl.formatMessage(messages.viewConfirmed)}
              value={user.is_confirmed ? intl.formatMessage(messages.yes) : intl.formatMessage(messages.no)}
            />
            <DetailRow
              label={intl.formatMessage(messages.viewProfilePublic)}
              value={user.is_profile_public ? intl.formatMessage(messages.yes) : intl.formatMessage(messages.no)}
            />
            <DetailRow
              label={intl.formatMessage(messages.viewIsActive)}
              value={user.is_active ? intl.formatMessage(messages.yes) : intl.formatMessage(messages.no)}
            />
            <DetailRow
              label={intl.formatMessage(messages.fieldBlocked)}
              value={user.is_blocked ? intl.formatMessage(messages.yes) : intl.formatMessage(messages.no)}
            />
            <DetailRow
              label={intl.formatMessage(messages.viewLastLogin)}
              value={user.last_login
                ? new Date(user.last_login).toLocaleString()
                : intl.formatMessage(messages.never)}
            />
            <DetailRow
              label={intl.formatMessage(messages.colCreatedAt)}
              value={new Date(user.created_at).toLocaleDateString()}
            />
          </dl>
        )}
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button variant="tertiary" onClick={onClose}>
          {intl.formatMessage(messages.closeButton)}
        </Button>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

// ── Edit User modal ────────────────────────────────────────────────────────────

interface EditUserModalProps {
  user: UserSummary | null;
  onClose: () => void;
  onUpdated: () => void;
}

const EditUserModal = ({ user, onClose, onUpdated }: EditUserModalProps) => {
  const intl = useIntl();

  const initialValues: UserPatchPayload = user ? {
    name: user.name,
    role: user.role,
    profile_visibility: user.is_profile_public ? 'public' : 'private',
    job: '',
    country: '',
    biography: '',
    is_blocked: user.is_blocked,
  } : {};

  const [values, setValues] = useState<UserPatchPayload>(initialValues);
  const [apiError, setApiError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const mutation = useUpdateUser(user?.id ?? 0);

  // Reset when user changes
  const handleClose = () => {
    setApiError('');
    setSuccessMsg('');
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    mutation.mutate(values, {
      onSuccess: () => {
        setSuccessMsg(intl.formatMessage(messages.updateSuccess));
        setTimeout(() => {
          setSuccessMsg('');
          onUpdated();
          onClose();
        }, 1200);
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        const detail = err?.response?.data?.detail ?? intl.formatMessage(messages.saveError);
        setApiError(detail);
      },
    });
  };

  if (!user) { return null; }

  return (
    <ModalDialog
      title={intl.formatMessage(messages.editModalTitle)}
      isOpen={user !== null}
      onClose={handleClose}
      size="lg"
      hasCloseButton
      isOverflowVisible={false}
    >
      <ModalDialog.Header>
        <ModalDialog.Title>
          {intl.formatMessage(messages.editModalTitle)}
          {' '}
          <span className="text-muted" style={{ fontSize: '0.9rem', fontWeight: 400 }}>
            #{user.id}
          </span>
        </ModalDialog.Title>
      </ModalDialog.Header>

      <ModalDialog.Body>
        {successMsg && (
          <Alert variant="success" dismissible onClose={() => setSuccessMsg('')}>{successMsg}</Alert>
        )}
        {apiError && (
          <Alert variant="danger" dismissible onClose={() => setApiError('')}>{apiError}</Alert>
        )}

        <Form onSubmit={handleSubmit} noValidate>
          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="edit-name">
                <Form.Label>{intl.formatMessage(messages.fieldFullName)}</Form.Label>
                <Form.Control
                  type="text"
                  value={values.name ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValues({ ...values, name: e.target.value })}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="edit-role">
                <Form.Label>{intl.formatMessage(messages.fieldRole)}</Form.Label>
                <Form.Control
                  as="select"
                  value={values.role ?? 'student'}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => (
                    setValues({ ...values, role: e.target.value as UserRole })
                  )}
                >
                  <option value="student">{intl.formatMessage(messages.roleStudent)}</option>
                  <option value="instructor">{intl.formatMessage(messages.roleInstructor)}</option>
                  <option value="moderator">{intl.formatMessage(messages.roleModerator)}</option>
                </Form.Control>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3" controlId="edit-visibility">
            <Form.Label>{intl.formatMessage(messages.fieldVisibility)}</Form.Label>
            <Form.Control
              as="select"
              value={values.profile_visibility ?? 'private'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) => (
                setValues({ ...values, profile_visibility: e.target.value as ProfileVisibility })
              )}
            >
              <option value="private">{intl.formatMessage(messages.visibilityPrivate)}</option>
              <option value="public">{intl.formatMessage(messages.visibilityPublic)}</option>
            </Form.Control>
          </Form.Group>

          <div className="row">
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="edit-job">
                <Form.Label>{intl.formatMessage(messages.fieldJob)}</Form.Label>
                <Form.Control
                  type="text"
                  value={values.job ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setValues({ ...values, job: e.target.value })}
                />
              </Form.Group>
            </div>
            <div className="col-md-6">
              <Form.Group className="mb-3" controlId="edit-country">
                <Form.Label>{intl.formatMessage(messages.fieldCountry)}</Form.Label>
                <Form.Control
                  as="select"
                  value={values.country ?? ''}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => (
                    setValues({ ...values, country: e.target.value })
                  )}
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.name}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            </div>
          </div>

          <Form.Group className="mb-3" controlId="edit-biography">
            <Form.Label>{intl.formatMessage(messages.fieldBiography)}</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={values.biography ?? ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => (
                setValues({ ...values, biography: e.target.value })
              )}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="edit-blocked">
            <Form.Checkbox
              id="edit-blocked"
              checked={values.is_blocked ?? false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => (
                setValues({ ...values, is_blocked: e.target.checked })
              )}
            >
              {intl.formatMessage(messages.fieldBlocked)}
            </Form.Checkbox>
          </Form.Group>
        </Form>
      </ModalDialog.Body>

      <ModalDialog.Footer>
        <Button variant="tertiary" onClick={handleClose}>
          {intl.formatMessage(messages.cancelButton)}
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit as unknown as React.MouseEventHandler}
          disabled={mutation.isPending}
          style={{ background: '#d92d20', borderColor: '#d92d20' }}
        >
          {mutation.isPending ? (
            <Spinner animation="border" size="sm" role="status" className="me-2">
              <span className="sr-only">Updating…</span>
            </Spinner>
          ) : null}
          {intl.formatMessage(messages.updateButton)}
        </Button>
      </ModalDialog.Footer>
    </ModalDialog>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────

type ModalState =
  | { kind: 'none' }
  | { kind: 'add' }
  | { kind: 'view'; userId: number }
  | { kind: 'edit'; user: UserSummary };

const UsersListPage = () => {
  const intl = useIntl();
  const [searchParams, setSearchParams] = useSearchParams();
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });

  // Read state from URL
  const page = Number(searchParams.get('page') ?? 1);
  const searchBy = (searchParams.get('search_by') as SearchBy | null) ?? 'email';
  const searchTerm = searchParams.get('search_term') ?? '';
  const filter = (searchParams.get('filter') as UserFilter | null) ?? 'all';

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        Object.entries(updates).forEach(([k, v]) => {
          if (v) { next.set(k, v); } else { next.delete(k); }
        });
        next.delete('page'); // reset to page 1 on filter/search change
        return next;
      }, { replace: true });
    },
    [setSearchParams],
  );

  const handleSearch = (by: SearchBy, term: string) => {
    updateParams({ search_by: by, search_term: term });
  };

  const handleClear = () => {
    updateParams({ search_by: '', search_term: '' });
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateParams({ filter: e.target.value === 'all' ? '' : e.target.value });
  };

  const handlePageChange = useCallback(
    (newPage: number) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        next.set('page', String(newPage));
        return next;
      }, { replace: true });
    },
    [setSearchParams],
  );

  const {
    data, isLoading, isError, error, refetch,
  } = useUsers({
    search_by: searchTerm ? searchBy : undefined,
    search_term: searchTerm || undefined,
    filter: filter !== 'all' ? filter : undefined,
    page,
    page_size: PAGE_SIZE,
  });

  const statusCode = isError && (error as { response?: { status: number } })?.response?.status;

  // ── Columns ────────────────────────────────────────────────────────────────

  const columns: ColumnDef[] = [
    {
      label: intl.formatMessage(messages.colUserId),
      key: 'id',
    },
    {
      label: intl.formatMessage(messages.colAvatar),
      key: 'image',
      renderCell: (value, row) => (
        <img
          src={(value as string | null) ?? `https://ui-avatars.com/api/?name=${encodeURIComponent(row.name as string)}&size=32&rounded=true&background=449cc2&color=fff`}
          alt={row.name as string}
          width={32}
          height={32}
          style={{ borderRadius: '50%', objectFit: 'cover' }}
        />
      ),
    },
    { label: intl.formatMessage(messages.colName), key: 'name' },
    { label: intl.formatMessage(messages.colEmail), key: 'email' },
    {
      label: intl.formatMessage(messages.colRole),
      key: 'role',
      renderCell: (value) => {
        const roleColors: Record<string, string> = {
          instructor: 'success',
          moderator: 'warning',
          student: 'light',
        };
        return (
          <Badge variant={roleColors[value as string] ?? 'light'}>
            {value as string}
          </Badge>
        );
      },
    },
    {
      label: intl.formatMessage(messages.colCreatedAt),
      key: 'created_at',
      renderCell: (value) => new Date(value as string).toLocaleDateString(),
    },
    { label: intl.formatMessage(messages.colAuthMethod), key: 'authentication_method' },
    {
      label: intl.formatMessage(messages.colActions),
      key: 'actions',
      renderCell: (_value, row) => (
        <div className="d-flex gap-1">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setModal({ kind: 'view', userId: row.id as number })}
            aria-label={`${intl.formatMessage(messages.actionView)} ${row.name as string}`}
          >
            {intl.formatMessage(messages.actionView)}
          </Button>
          <Button
            variant="outline-secondary"
            size="sm"
            onClick={() => setModal({ kind: 'edit', user: row as unknown as UserSummary })}
            aria-label={`${intl.formatMessage(messages.actionEdit)} ${row.name as string}`}
          >
            {intl.formatMessage(messages.actionEdit)}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="rwaq-page">
      {/* Page header */}
      <div className="rwaq-page-header">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          <h1 className="rwaq-page-title">{intl.formatMessage(messages.title)}</h1>
          <Button
            variant="primary"
            onClick={() => setModal({ kind: 'add' })}
            style={{ background: '#d92d20', borderColor: '#d92d20' }}
          >
            {intl.formatMessage(messages.addUser)}
          </Button>
        </div>
      </div>

      {/* Main card */}
      <div className="rwaq-card">
        {/* Search + filter row */}
        <div className="d-flex flex-wrap gap-3 align-items-start mb-4">
          <div className="flex-grow-1">
            <UserSearchBar
              onSearch={handleSearch}
              onClear={handleClear}
              initialBy={searchBy}
              initialTerm={searchTerm}
            />
          </div>

          {/* Filter dropdown */}
          <Form.Group className="mb-0" controlId="user-filter" style={{ minWidth: '180px' }}>
            <Form.Label className="sr-only">{intl.formatMessage(messages.filterLabel)}</Form.Label>
            <Form.Control
              as="select"
              value={filter}
              onChange={handleFilterChange}
              aria-label={intl.formatMessage(messages.filterLabel)}
            >
              <option value="all">{intl.formatMessage(messages.filterAll)}</option>
              <option value="instructor">{intl.formatMessage(messages.filterInstructor)}</option>
              <option value="moderators">{intl.formatMessage(messages.filterModerators)}</option>
              <option value="students">{intl.formatMessage(messages.filterStudents)}</option>
              <option value="blocked">{intl.formatMessage(messages.filterBlocked)}</option>
              <option value="confirmed">{intl.formatMessage(messages.filterConfirmed)}</option>
              <option value="unconfirmed">{intl.formatMessage(messages.filterUnconfirmed)}</option>
              <option value="private_profile">{intl.formatMessage(messages.filterPrivateProfile)}</option>
              <option value="public_profile">{intl.formatMessage(messages.filterPublicProfile)}</option>
              <option value="facebook">{intl.formatMessage(messages.filterFacebook)}</option>
              <option value="twitter">{intl.formatMessage(messages.filterTwitter)}</option>
            </Form.Control>
          </Form.Group>
        </div>

        {/* Table or error */}
        {isError ? (
          <ErrorState
            statusCode={statusCode || undefined}
            title={intl.formatMessage(messages.errorTitle)}
            onRetry={() => refetch()}
          />
        ) : (
          <AdminDataTable
            columns={columns}
            data={(data?.results ?? []) as unknown as Record<string, unknown>[]}
            isLoading={isLoading}
            caption={intl.formatMessage(messages.title)}
            pagination={data ? {
              currentPage: page,
              pageCount: data.pagination?.num_pages
                ?? Math.max(1, Math.ceil((data.pagination?.count ?? 0) / PAGE_SIZE)),
              itemCount: data.pagination?.count ?? data.results.length,
              onPageChange: handlePageChange,
            } : undefined}
          />
        )}
      </div>

      {/* Modals */}
      <AddUserModal
        isOpen={modal.kind === 'add'}
        onClose={() => setModal({ kind: 'none' })}
        onCreated={() => refetch()}
      />

      <ViewUserModal
        userId={modal.kind === 'view' ? modal.userId : null}
        onClose={() => setModal({ kind: 'none' })}
      />

      <EditUserModal
        user={modal.kind === 'edit' ? modal.user : null}
        onClose={() => setModal({ kind: 'none' })}
        onUpdated={() => refetch()}
      />
    </div>
  );
};

export default UsersListPage;
