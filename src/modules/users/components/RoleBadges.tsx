/**
 * Role chips for a user.
 *
 * The backend returns badges already ordered most-privileged first, so the
 * table can show the highest one and collapse the rest into a "+N" chip
 * without re-deriving any ranking here. `maxVisible={0}`-style expansion is
 * expressed by passing a large maxVisible — the detail view shows them all.
 */
import { useIntl, MessageDescriptor } from '@edx/frontend-platform/i18n';
import ChipOverflowList from '@src/components/ChipOverflowList';
import type { RoleBadge } from '../data/types';
import messages from '../messages';

const BADGE_LABELS: Record<RoleBadge, MessageDescriptor> = {
  superuser: messages.roleSuperuser,
  global_staff: messages.roleGlobalStaff,
  course_creator: messages.roleCourseCreator,
  support_staff: messages.roleSupportStaff,
  org_admin: messages.roleOrgAdmin,
  learner: messages.roleLearner,
};

const BADGE_VARIANTS: Record<RoleBadge, string> = {
  superuser: 'dark',
  global_staff: 'danger',
  course_creator: 'success',
  support_staff: 'info',
  org_admin: 'warning',
  learner: 'light',
};

interface RoleBadgesProps {
  badges: RoleBadge[];
  /** How many chips before collapsing; the detail view passes them all. */
  maxVisible?: number;
  id: string;
}

const RoleBadges = ({ badges, maxVisible = 1, id }: RoleBadgesProps) => {
  const intl = useIntl();

  return (
    <ChipOverflowList
      id={id}
      maxVisible={maxVisible}
      items={badges.map((badge) => ({
        key: badge,
        label: BADGE_LABELS[badge] ? intl.formatMessage(BADGE_LABELS[badge]) : badge,
        variant: BADGE_VARIANTS[badge] ?? 'light',
      }))}
    />
  );
};

export default RoleBadges;
