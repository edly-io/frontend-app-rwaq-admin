/**
 * The platform-role grant switches.
 *
 * Role is not a single field: each grant is independent and additive on top of
 * Learner, which every account has.
 *
 * Two are assignable — Global Staff and Superuser. Both are confirm-gated, and
 * neither can be switched off for the signed-in admin: the backend rejects
 * that, but disabling it here explains why before the click. Superuser matters
 * doubly, because it is what grants access to this panel at all, so revoking
 * your own would close the door behind you.
 *
 * Course Creator, Support Staff and Organization Admin are read-only. They are
 * shown rather than hidden because they represent real access an admin needs to
 * see — Course Creator in particular follows automatically from an Organization
 * Admin grant, so omitting it would misreport what a user can do.
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
  isCourseCreator?: boolean;
  isSupportStaff?: boolean;
  orgAdminOf?: string[];
  /** False when the admin is editing their own account. */
  canRevokeGlobalStaff?: boolean;
  canRevokeSuperuser?: boolean;
}

const RoleGrantFields = ({
  values,
  onChange,
  isCourseCreator = false,
  isSupportStaff = false,
  orgAdminOf = [],
  canRevokeGlobalStaff = true,
  canRevokeSuperuser = true,
}: RoleGrantFieldsProps) => {
  const intl = useIntl();
  const [isConfirmingGlobalStaff, setIsConfirmingGlobalStaff] = useState(false);
  const [isConfirmingSuperuser, setIsConfirmingSuperuser] = useState(false);

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

  const handleSuperuserChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setIsConfirmingSuperuser(true);
      return;
    }
    onChange('isSuperuser', false);
  };

  const confirmSuperuser = () => {
    onChange('isSuperuser', true);
    setIsConfirmingSuperuser(false);
  };

  const globalStaffLocked = values.isGlobalStaff && !canRevokeGlobalStaff;
  const superuserLocked = values.isSuperuser && !canRevokeSuperuser;

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
            checked={values.isSuperuser}
            onChange={handleSuperuserChange}
            disabled={superuserLocked}
            name="isSuperuser"
          >
            {intl.formatMessage(messages.roleSuperuser)}
          </Form.Switch>
          <GrantInfo id="grant-superuser-tip" tooltip={messages.tooltipSuperuser} />
        </div>
        {superuserLocked && (
          <Form.Text muted>{intl.formatMessage(messages.selfRevokeSuperuserBlocked)}</Form.Text>
        )}
      </Form.Group>

      {/* Read-only grants — real access this screen cannot assign. */}
      {isCourseCreator && (
        <div className="d-flex align-items-center mb-3">
          <Badge variant="light">{intl.formatMessage(messages.roleCourseCreator)}</Badge>
          <GrantInfo id="grant-course-creator-tip" tooltip={messages.tooltipCourseCreator} />
        </div>
      )}

      {isSupportStaff && (
        <div className="d-flex align-items-center mb-3">
          <Badge variant="light">{intl.formatMessage(messages.roleSupportStaff)}</Badge>
          <GrantInfo id="grant-support-staff-tip" tooltip={messages.tooltipSupportStaff} />
        </div>
      )}

      {orgAdminOf.length > 0 && (
        <div className="d-flex align-items-center flex-wrap rwaq-gap-xs mb-3">
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
          <li>{intl.formatMessage(messages.courseCreatorNote)}</li>
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

      <AlertModal
        title={intl.formatMessage(messages.confirmSuperuserTitle)}
        isOpen={isConfirmingSuperuser}
        onClose={() => setIsConfirmingSuperuser(false)}
        footerNode={(
          <ActionRow>
            <Button variant="tertiary" onClick={() => setIsConfirmingSuperuser(false)}>
              {intl.formatMessage(messages.cancel)}
            </Button>
            <Button variant="danger" onClick={confirmSuperuser}>
              {intl.formatMessage(messages.confirmSuperuserAction)}
            </Button>
          </ActionRow>
        )}
      >
        <p>{intl.formatMessage(messages.confirmSuperuserBody)}</p>
      </AlertModal>
    </>
  );
};

export default RoleGrantFields;
