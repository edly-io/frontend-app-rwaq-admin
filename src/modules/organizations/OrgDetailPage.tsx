/**
 * OrgDetailPage — displays org profile + members.
 *
 * Profile edit: PATCH with client-side validation + optimistic update + rollback.
 * Members: add by email (POST) + remove (DELETE) with confirm + optimistic update.
 *
 * Backend note: the "cannot manage own membership" rule is enforced server-side;
 * the API returns 403 for that case which we surface as a user-friendly message.
 */
import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Button, Form, Card, Alert, Spinner, Badge,
} from '@openedx/paragon';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';
import ErrorState from '@src/components/ErrorState';
import LoadingPage from '@src/components/LoadingPage';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import type { OrgProfilePatch } from './data/types';
import {
  useOrganization, useUpdateOrganization, useAddOrgAdmin, useRemoveOrgAdmin,
} from './data/hooks';

const messages = defineMessages({
  backToOrgs: {
    id: 'rwaq.admin.orgs.detail.backToOrgs',
    defaultMessage: 'Organizations',
  },
  profileSection: {
    id: 'rwaq.admin.orgs.detail.profileSection',
    defaultMessage: 'Profile',
  },
  membersSection: {
    id: 'rwaq.admin.orgs.detail.membersSection',
    defaultMessage: 'Organization Admins',
  },
  arabicName: {
    id: 'rwaq.admin.orgs.detail.arabicName',
    defaultMessage: 'Arabic Name',
  },
  detail: {
    id: 'rwaq.admin.orgs.detail.detail',
    defaultMessage: 'About (Detail)',
  },
  featuredVideo: {
    id: 'rwaq.admin.orgs.detail.featuredVideo',
    defaultMessage: 'Featured Video URL',
  },
  isFeatured: {
    id: 'rwaq.admin.orgs.detail.isFeatured',
    defaultMessage: 'Featured on public catalog',
  },
  saveProfile: {
    id: 'rwaq.admin.orgs.detail.saveProfile',
    defaultMessage: 'Save changes',
  },
  profileSaveSuccess: {
    id: 'rwaq.admin.orgs.detail.profileSaveSuccess',
    defaultMessage: 'Profile updated successfully.',
  },
  profileSaveError: {
    id: 'rwaq.admin.orgs.detail.profileSaveError',
    defaultMessage: 'Failed to update profile. Please try again.',
  },
  addAdminLabel: {
    id: 'rwaq.admin.orgs.detail.addAdminLabel',
    defaultMessage: 'Add admin by email',
  },
  addAdminPlaceholder: {
    id: 'rwaq.admin.orgs.detail.addAdminPlaceholder',
    defaultMessage: 'Enter email address',
  },
  addAdminButton: {
    id: 'rwaq.admin.orgs.detail.addAdminButton',
    defaultMessage: 'Add',
  },
  removeAdmin: {
    id: 'rwaq.admin.orgs.detail.removeAdmin',
    defaultMessage: 'Remove',
  },
  confirmRemove: {
    id: 'rwaq.admin.orgs.detail.confirmRemove',
    defaultMessage: 'Remove {email} as admin?',
  },
  colEmail: {
    id: 'rwaq.admin.orgs.detail.colEmail',
    defaultMessage: 'Email',
  },
  colFullName: {
    id: 'rwaq.admin.orgs.detail.colFullName',
    defaultMessage: 'Full Name',
  },
  colDateAdded: {
    id: 'rwaq.admin.orgs.detail.colDateAdded',
    defaultMessage: 'Date Added',
  },
  colAddedBy: {
    id: 'rwaq.admin.orgs.detail.colAddedBy',
    defaultMessage: 'Added By',
  },
  colActions: {
    id: 'rwaq.admin.orgs.detail.colActions',
    defaultMessage: 'Actions',
  },
  errorLoading: {
    id: 'rwaq.admin.orgs.detail.errorLoading',
    defaultMessage: 'Could not load organization details',
  },
  invalidEmail: {
    id: 'rwaq.admin.orgs.detail.invalidEmail',
    defaultMessage: 'Please enter a valid email address.',
  },
  detailRequired: {
    id: 'rwaq.admin.orgs.detail.detailRequired',
    defaultMessage: 'About (Detail) is required.',
  },
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ── Profile form ──────────────────────────────────────────────────────────────

interface ProfileFormProps {
  shortName: string;
  initialValues: OrgProfilePatch & { arabic_name: string; detail: string };
}

const ProfileForm = ({ shortName, initialValues }: ProfileFormProps) => {
  const intl = useIntl();
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof OrgProfilePatch, string>>>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const mutation = useUpdateOrganization(shortName);

  const validate = (): boolean => {
    const next: typeof errors = {};
    if (!values.detail?.trim()) {
      next.detail = intl.formatMessage(messages.detailRequired);
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');
    if (!validate()) { return; }

    mutation.mutate(values, {
      onSuccess: () => setSuccessMsg(intl.formatMessage(messages.profileSaveSuccess)),
      onError: () => setErrorMsg(intl.formatMessage(messages.profileSaveError)),
    });
  };

  return (
    <Card className="mb-4">
      <Card.Header title={intl.formatMessage(messages.profileSection)} />
      <Card.Body>
        {successMsg && <Alert variant="success" dismissible onClose={() => setSuccessMsg('')}>{successMsg}</Alert>}
        {errorMsg && <Alert variant="danger" dismissible onClose={() => setErrorMsg('')}>{errorMsg}</Alert>}

        <Form onSubmit={handleSubmit} noValidate>
          <Form.Group className="mb-3" controlId="profile-arabic-name">
            <Form.Label>{intl.formatMessage(messages.arabicName)}</Form.Label>
            <Form.Control
              type="text"
              value={values.arabic_name ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => (
                setValues({ ...values, arabic_name: e.target.value })
              )}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="profile-detail">
            <Form.Label>{intl.formatMessage(messages.detail)} *</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={values.detail ?? ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => (
                setValues({ ...values, detail: e.target.value })
              )}
              isInvalid={!!errors.detail}
            />
            {errors.detail && (
              <Form.Control.Feedback type="invalid">{errors.detail}</Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group className="mb-3" controlId="profile-featured-video">
            <Form.Label>{intl.formatMessage(messages.featuredVideo)}</Form.Label>
            <Form.Control
              type="url"
              value={values.featured_video ?? ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => (
                setValues({ ...values, featured_video: e.target.value })
              )}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="profile-is-featured">
            <Form.Checkbox
              id="profile-is-featured"
              checked={values.is_featured ?? false}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => (
                setValues({ ...values, is_featured: e.target.checked })
              )}
            >
              {intl.formatMessage(messages.isFeatured)}
            </Form.Checkbox>
          </Form.Group>

          <Button
            type="submit"
            variant="primary"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <Spinner animation="border" size="sm" role="status" className="me-2">
                <span className="sr-only">Saving…</span>
              </Spinner>
            ) : null}
            {intl.formatMessage(messages.saveProfile)}
          </Button>
        </Form>
      </Card.Body>
    </Card>
  );
};

// ── Members panel ─────────────────────────────────────────────────────────────

interface MembersPanelProps {
  shortName: string;
  members: Array<{
    email: string;
    username: string;
    full_name: string;
    date_added: string;
    added_by: string;
    other_organizations: string[];
  }>;
}

const MembersPanel = ({ shortName, members }: MembersPanelProps) => {
  const intl = useIntl();
  const [addEmail, setAddEmail] = useState('');
  const [addError, setAddError] = useState('');
  const [addSuccess, setAddSuccess] = useState('');
  const [mutationError, setMutationError] = useState('');

  const addMutation = useAddOrgAdmin(shortName);
  const removeMutation = useRemoveOrgAdmin(shortName);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    setAddError('');
    setAddSuccess('');
    setMutationError('');

    if (!EMAIL_RE.test(addEmail)) {
      setAddError(intl.formatMessage(messages.invalidEmail));
      return;
    }

    addMutation.mutate(addEmail, {
      onSuccess: () => {
        setAddSuccess(`${addEmail} added as admin.`);
        setAddEmail('');
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      onError: (err: any) => {
        const detail = err?.response?.data?.detail ?? intl.formatMessage(messages.profileSaveError);
        setMutationError(detail);
      },
    });
  };

  const handleRemove = (email: string) => {
    // eslint-disable-next-line no-alert
    if (!window.confirm(intl.formatMessage(messages.confirmRemove, { email }))) { return; }
    setMutationError('');
    removeMutation.mutate(email, {
      onError: (err: any) => {
        const detail = err?.response?.data?.detail ?? intl.formatMessage(messages.profileSaveError);
        setMutationError(detail);
      },
    });
  };

  const columns: ColumnDef[] = [
    { label: intl.formatMessage(messages.colEmail), key: 'email' },
    { label: intl.formatMessage(messages.colFullName), key: 'full_name' },
    {
      label: intl.formatMessage(messages.colDateAdded),
      key: 'date_added',
      renderCell: (value) => new Date(value as string).toLocaleDateString(),
    },
    { label: intl.formatMessage(messages.colAddedBy), key: 'added_by' },
    {
      label: intl.formatMessage(messages.colActions),
      // Unique id: 'email' is already used by the email data column above.
      key: 'actions',
      renderCell: (_value, row) => (
        <Button
          variant="outline-danger"
          size="sm"
          onClick={() => handleRemove(row.email as string)}
          disabled={removeMutation.isPending}
        >
          {intl.formatMessage(messages.removeAdmin)}
        </Button>
      ),
    },
  ];

  return (
    <Card>
      <Card.Header title={intl.formatMessage(messages.membersSection)} />
      <Card.Body>
        {addSuccess && <Alert variant="success" dismissible onClose={() => setAddSuccess('')}>{addSuccess}</Alert>}
        {mutationError && <Alert variant="danger" dismissible onClose={() => setMutationError('')}>{mutationError}</Alert>}

        {/* Add admin form */}
        <Form onSubmit={handleAdd} className="mb-4 d-flex gap-2 align-items-end flex-wrap">
          <Form.Group controlId="add-admin-email" className="flex-grow-1 mb-0">
            <Form.Label>{intl.formatMessage(messages.addAdminLabel)}</Form.Label>
            <Form.Control
              type="email"
              value={addEmail}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setAddEmail(e.target.value);
                setAddError('');
              }}
              placeholder={intl.formatMessage(messages.addAdminPlaceholder)}
              isInvalid={!!addError}
            />
            {addError && (
              <Form.Control.Feedback type="invalid">{addError}</Form.Control.Feedback>
            )}
          </Form.Group>
          <Button type="submit" variant="primary" disabled={addMutation.isPending}>
            {addMutation.isPending ? (
              <Spinner animation="border" size="sm" role="status">
                <span className="sr-only">Adding…</span>
              </Spinner>
            ) : intl.formatMessage(messages.addAdminButton)}
          </Button>
        </Form>

        <AdminDataTable
          columns={columns}
          data={members as unknown as Record<string, unknown>[]}
          isLoading={false}
          caption={intl.formatMessage(messages.membersSection)}
        />
      </Card.Body>
    </Card>
  );
};

// ── Page ──────────────────────────────────────────────────────────────────────

const OrgDetailPage = () => {
  const intl = useIntl();
  const { shortName } = useParams<{ shortName: string }>();

  const {
    data: org, isLoading, isError, error, refetch,
  } = useOrganization(shortName ?? '');

  const statusCode = isError && (error as any)?.response?.status;

  if (isLoading) { return <LoadingPage />; }

  if (isError) {
    return (
      <ErrorState
        statusCode={statusCode}
        title={intl.formatMessage(messages.errorLoading)}
        onRetry={() => refetch()}
      />
    );
  }

  if (!org) { return null; }

  return (
    <div className="rwaq-page">
      <div className="rwaq-page-header">
        <div className="rwaq-page-header__breadcrumb">
          <Link to="/organizations">{intl.formatMessage(messages.backToOrgs)}</Link>
          {' / '}
          {org.name}
        </div>
        <h1 className="rwaq-page-title">{org.name}</h1>
        <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
          <Badge variant={org.active ? 'success' : 'secondary'}>
            {org.active ? 'Active' : 'Inactive'}
          </Badge>
          {org.is_featured && <Badge variant="info">Featured</Badge>}
          <span className="text-muted small">
            {org.course_count} courses · {org.admin_count} admins
          </span>
        </div>
      </div>

      <ProfileForm
        shortName={org.short_name}
        initialValues={{
          arabic_name: org.arabic_name,
          detail: org.detail,
          featured_video: org.featured_video,
          is_featured: org.is_featured,
        }}
      />

      <MembersPanel
        shortName={org.short_name}
        members={org.members}
      />
    </div>
  );
};

export default OrgDetailPage;
