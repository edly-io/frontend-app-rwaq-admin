/**
 * An organization's Organization Admin roster.
 *
 * Built on AdminDataTable with the same column shape as the user list — avatar
 * first, then name over email — so the two tables in this app are recognisably
 * the same component rather than one styled table and one hand-rolled one.
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
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
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

  const columns: ColumnDef[] = [
    {
      label: intl.formatMessage(messages.adminColAvatar),
      // Heading is for screen readers only — an avatar needs no visible title.
      isLabelHidden: true,
      headerClassName: 'rwaq-th--avatar',
      key: 'image',
      renderCell: (value, row) => (
        <ProfileAvatar
          src={value as string | null}
          name={(row.name as string) || (row.username as string)}
          size="sm"
        />
      ),
    },
    {
      label: intl.formatMessage(messages.adminColName),
      key: 'name',
      renderCell: (value, row) => (
        <div className="min-width-0">
          <div className="rwaq-user-cell__name">
            {(value as string) || (row.username as string)}
          </div>
          <div className="rwaq-user-cell__meta">{row.email as string}</div>
        </div>
      ),
    },
    {
      label: intl.formatMessage(messages.adminColOtherOrgs),
      key: 'otherOrganizations',
      renderCell: (value, row) => (
        <ChipOverflowList
          id={`org-admin-${row.id}-orgs`}
          maxVisible={MAX_ORG_CHIPS}
          emptyLabel={intl.formatMessage(messages.detailNone)}
          items={(value as string[]).map((org) => ({ key: org, label: org, variant: 'info' }))}
        />
      ),
    },
    {
      label: intl.formatMessage(messages.adminColAdded),
      key: 'dateAdded',
      renderCell: (value) => (value
        ? new Date(value as string).toLocaleDateString()
        : intl.formatMessage(messages.detailNone)),
    },
    {
      label: intl.formatMessage(messages.adminColActions),
      headerClassName: 'rwaq-th--actions',
      key: 'actions',
      renderCell: (_value, row) => (
        <div className="rwaq-row-actions">
          <Button
            variant="outline-primary"
            size="sm"
            onClick={() => setPendingRemoval(row as unknown as OrgMember)}
            aria-label={`${intl.formatMessage(messages.remove)} ${row.email as string}`}
          >
            {intl.formatMessage(messages.remove)}
          </Button>
        </div>
      ),
    },
  ];

  if (members.length === 0) {
    return (
      <p className="text-muted text-center py-5 mb-0">
        {intl.formatMessage(messages.adminsEmpty)}
      </p>
    );
  }

  return (
    <>
      <AdminDataTable
        columns={columns}
        data={members as unknown as Record<string, unknown>[]}
        caption={intl.formatMessage(messages.detailAdmins)}
      />

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
