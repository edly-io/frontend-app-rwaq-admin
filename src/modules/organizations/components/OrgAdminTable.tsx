/**
 * An organization's Organization Admin roster.
 *
 * "Other organizations" is the column that matters operationally: revoking
 * someone here only affects this org, and seeing that they also administer
 * three others is what tells an admin whether that's the whole story.
 */
import { useState } from 'react';
import {
  ActionRow, AlertModal, Button,
} from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import ChipOverflowList from '@src/components/ChipOverflowList';
import ProfileAvatar from '@src/components/ProfileAvatar';
import { useToast } from '@src/components/ToastContext';
import { useRemoveOrgAdmin } from '../data/hooks';
import type { OrgMember } from '../data/types';
import messages from '../messages';

const MAX_ORG_CHIPS = 2;

interface OrgAdminTableProps {
  shortName: string;
  members: OrgMember[];
}

const OrgAdminTable = ({ shortName, members }: OrgAdminTableProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const removeMutation = useRemoveOrgAdmin(shortName);
  const [pendingRemoval, setPendingRemoval] = useState<OrgMember | null>(null);

  const confirmRemoval = async () => {
    if (!pendingRemoval) { return; }
    const { email } = pendingRemoval;
    try {
      await removeMutation.mutateAsync(email);
      showToast(intl.formatMessage(messages.toastAdminRemoved, { email }));
      setPendingRemoval(null);
    } catch (error) {
      logError(error);
      showToast(intl.formatMessage(messages.genericError));
      setPendingRemoval(null);
    }
  };

  if (members.length === 0) {
    return (
      <p className="text-muted text-center py-5 mb-0">
        {intl.formatMessage(messages.adminsEmpty)}
      </p>
    );
  }

  return (
    <>
      <div className="rwaq-table-scroll">
        <table className="table table-sm mb-0 rwaq-enrollments__table">
          <thead>
            <tr>
              <th scope="col">{intl.formatMessage(messages.adminColName)}</th>
              <th scope="col">{intl.formatMessage(messages.adminColOtherOrgs)}</th>
              <th scope="col">{intl.formatMessage(messages.adminColAdded)}</th>
              <th scope="col" className="text-right">{intl.formatMessage(messages.adminColActions)}</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.email}>
                <td>
                  <div className="rwaq-user-cell">
                    <ProfileAvatar src={member.image} name={member.name || member.username} size="sm" />
                    <div className="min-width-0">
                      <div className="rwaq-user-cell__name">{member.name || member.username}</div>
                      <div className="rwaq-user-cell__meta">{member.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <ChipOverflowList
                    id={`org-admin-${member.id}-orgs`}
                    maxVisible={MAX_ORG_CHIPS}
                    emptyLabel={intl.formatMessage(messages.detailNone)}
                    items={member.otherOrganizations.map((org) => ({
                      key: org,
                      label: org,
                      variant: 'info',
                    }))}
                  />
                </td>
                <td className="text-nowrap">
                  {member.dateAdded
                    ? new Date(member.dateAdded).toLocaleDateString()
                    : intl.formatMessage(messages.detailNone)}
                </td>
                <td className="text-right">
                  <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={() => setPendingRemoval(member)}
                    aria-label={`${intl.formatMessage(messages.remove)} ${member.email}`}
                  >
                    {intl.formatMessage(messages.remove)}
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <AlertModal
        title={intl.formatMessage(messages.removeTitle)}
        isOpen={pendingRemoval !== null}
        onClose={() => setPendingRemoval(null)}
        footerNode={(
          <ActionRow>
            <Button variant="tertiary" onClick={() => setPendingRemoval(null)}>
              {intl.formatMessage(messages.cancel)}
            </Button>
            <Button
              variant="danger"
              onClick={confirmRemoval}
              disabled={removeMutation.isPending}
            >
              {intl.formatMessage(messages.removeConfirm)}
            </Button>
          </ActionRow>
        )}
      >
        <p className="mb-0">
          {intl.formatMessage(messages.removeBody, {
            email: pendingRemoval?.email ?? '',
            org: shortName,
          })}
        </p>
      </AlertModal>
    </>
  );
};

export default OrgAdminTable;
