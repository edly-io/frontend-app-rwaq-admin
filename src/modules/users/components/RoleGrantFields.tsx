/**
 * The platform-role grant switches.
 *
 * Role is not a single field: each grant is independent and additive on top of
 * Learner, which every account has. Superuser and Organization Admin are shown
 * read-only — the first is reserved for devops, the second is granted on the
 * Organizations screen.
 *
 * Global Staff is confirm-gated (it is the highest routine privilege), and
 * cannot be switched off for the signed-in admin — the backend rejects that
 * too, but disabling it here explains why before the click.
 */
import { useState } from 'react';
import {
  ActionRow, AlertModal, Badge, Button, Form, Icon, OverlayTrigger, Tooltip,
} from '@openedx/paragon';
import { InfoOutline } from '@openedx/paragon/icons';
import { useIntl, MessageDescriptor } from '@edx/frontend-platform/i18n';
import type { UserGrantPayload } from '../data/types';
import messages from '../messages';

interface GrantInfoProps {
  tooltip: MessageDescriptor;
  id: string;
}

/** The little "what does this grant?" info icon. */
const GrantInfo = ({ tooltip, id }: GrantInfoProps) => {
  const intl = useIntl();

  return (
    <OverlayTrigger
      placement="top"
      overlay={<Tooltip id={id}>{intl.formatMessage(tooltip)}</Tooltip>}
    >
      <span className="d-inline-flex align-items-center ml-2" tabIndex={0} role="button" aria-label={intl.formatMessage(messages.moreInfo)}>
        <Icon src={InfoOutline} size="sm" className="text-muted" />
      </span>
    </OverlayTrigger>
  );
};

export interface RoleGrantValues extends Required<UserGrantPayload> {}

interface RoleGrantFieldsProps {
  values: RoleGrantValues;
  onChange: (field: keyof RoleGrantValues, value: boolean) => void;
  /** Read-only context from the server; absent when creating a user. */
  isSuperuser?: boolean;
  orgAdminOf?: string[];
  /** False when the admin is editing their own account. */
  canRevokeGlobalStaff?: boolean;
}

const RoleGrantFields = ({
  values,
  onChange,
  isSuperuser = false,
  orgAdminOf = [],
  canRevokeGlobalStaff = true,
}: RoleGrantFieldsProps) => {
  const intl = useIntl();
  const [isConfirmingGlobalStaff, setIsConfirmingGlobalStaff] = useState(false);

  const handleGlobalStaffChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setIsConfirmingGlobalStaff(true);
      return;
    }
    onChange('isGlobalStaff', false);
  };

  const confirmGlobalStaff = () => {
    onChange('isGlobalStaff', true);
    setIsConfirmingGlobalStaff(false);
  };

  const globalStaffLocked = values.isGlobalStaff && !canRevokeGlobalStaff;

  return (
    <>
      <p className="small text-muted mb-3">{intl.formatMessage(messages.rolesHelp)}</p>

      {/* Learner — the implicit baseline, shown so the model reads correctly. */}
      <div className="d-flex align-items-center mb-3">
        <Badge variant="light">{intl.formatMessage(messages.roleLearner)}</Badge>
        <GrantInfo id="grant-learner-tip" tooltip={messages.tooltipLearner} />
      </div>

      <Form.Group className="mb-4">
        <div className="d-flex align-items-center">
          <Form.Switch
            checked={values.isGlobalStaff}
            onChange={handleGlobalStaffChange}
            disabled={globalStaffLocked}
            name="isGlobalStaff"
          >
            {intl.formatMessage(messages.roleGlobalStaff)}
          </Form.Switch>
          <GrantInfo id="grant-global-staff-tip" tooltip={messages.tooltipGlobalStaff} />
        </div>
        {globalStaffLocked && (
          <Form.Text muted>{intl.formatMessage(messages.selfRevokeBlocked)}</Form.Text>
        )}
      </Form.Group>

      <Form.Group className="mb-4">
        <div className="d-flex align-items-center">
          <Form.Switch
            checked={values.isCourseCreator}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange('isCourseCreator', event.target.checked)}
            name="isCourseCreator"
          >
            {intl.formatMessage(messages.roleCourseCreator)}
          </Form.Switch>
          <GrantInfo id="grant-course-creator-tip" tooltip={messages.tooltipCourseCreator} />
        </div>
      </Form.Group>

      <Form.Group className="mb-4">
        <div className="d-flex align-items-center">
          <Form.Switch
            checked={values.isSupportStaff}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange('isSupportStaff', event.target.checked)}
            name="isSupportStaff"
          >
            {intl.formatMessage(messages.roleSupportStaff)}
          </Form.Switch>
          <GrantInfo id="grant-support-staff-tip" tooltip={messages.tooltipSupportStaff} />
        </div>
      </Form.Group>

      {/* Read-only grants. */}
      {isSuperuser && (
        <div className="d-flex align-items-center mb-3">
          <Badge variant="dark">{intl.formatMessage(messages.roleSuperuser)}</Badge>
          <GrantInfo id="grant-superuser-tip" tooltip={messages.tooltipSuperuser} />
        </div>
      )}

      {orgAdminOf.length > 0 && (
        <div className="d-flex align-items-center flex-wrap gap-1 mb-3">
          <Badge variant="warning">{intl.formatMessage(messages.roleOrgAdmin)}</Badge>
          <span className="small text-muted">{orgAdminOf.join(', ')}</span>
          <GrantInfo id="grant-org-admin-tip" tooltip={messages.tooltipOrgAdmin} />
        </div>
      )}

      {/* Where the roles this screen can't grant actually come from — stated as
          a labelled list rather than two loose sentences, so it reads as
          guidance instead of a disclaimer. */}
      <div className="rwaq-role-notes">
        <span className="rwaq-role-notes__title">{intl.formatMessage(messages.notesTitle)}</span>
        <ul className="rwaq-role-notes__list">
          <li>{intl.formatMessage(messages.orgAdminNote)}</li>
          <li>{intl.formatMessage(messages.courseRolesNote)}</li>
        </ul>
      </div>

      <AlertModal
        title={intl.formatMessage(messages.confirmGlobalStaffTitle)}
        isOpen={isConfirmingGlobalStaff}
        onClose={() => setIsConfirmingGlobalStaff(false)}
        footerNode={(
          <ActionRow>
            <Button variant="tertiary" onClick={() => setIsConfirmingGlobalStaff(false)}>
              {intl.formatMessage(messages.cancel)}
            </Button>
            <Button variant="danger" onClick={confirmGlobalStaff}>
              {intl.formatMessage(messages.confirmGlobalStaffAction)}
            </Button>
          </ActionRow>
        )}
      >
        <p>{intl.formatMessage(messages.confirmGlobalStaffBody)}</p>
      </AlertModal>
    </>
  );
};

export default RoleGrantFields;
