/**
 * Role badges for the list column and the detail drawer.
 *
 * Badge slugs come from the backend already ordered most-privileged first,
 * so this component only maps them to a label and a variant.
 */
import { Badge } from '@openedx/paragon';
import { useIntl, MessageDescriptor } from '@edx/frontend-platform/i18n';
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
}

const RoleBadges = ({ badges }: RoleBadgesProps) => {
  const intl = useIntl();

  return (
    <span className="d-inline-flex flex-wrap gap-1">
      {badges.map((badge) => (
        <Badge key={badge} variant={BADGE_VARIANTS[badge] ?? 'light'}>
          {BADGE_LABELS[badge] ? intl.formatMessage(BADGE_LABELS[badge]) : badge}
        </Badge>
      ))}
    </span>
  );
};

export default RoleBadges;
