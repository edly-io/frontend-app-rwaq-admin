/**
 * Status badges: Active/Inactive, plus email confirmation as a separate signal.
 *
 * These are two independent facts — deactivating a confirmed account does not
 * un-confirm its email — so they never collapse into one "status" value.
 */
import { Badge } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../messages';

interface StatusBadgesProps {
  isActive: boolean;
  isEmailConfirmed: boolean;
  /** Detail drawer shows the legacy-account flag too; the list column doesn't. */
  isLegacy?: boolean;
}

const StatusBadges = ({ isActive, isEmailConfirmed, isLegacy = false }: StatusBadgesProps) => {
  const intl = useIntl();

  return (
    <span className="d-inline-flex flex-wrap gap-1">
      <Badge variant={isActive ? 'success' : 'light'}>
        {intl.formatMessage(isActive ? messages.statusActive : messages.statusInactive)}
      </Badge>
      <Badge variant={isEmailConfirmed ? 'light' : 'warning'}>
        {intl.formatMessage(isEmailConfirmed ? messages.emailConfirmed : messages.emailUnconfirmed)}
      </Badge>
      {isLegacy && <Badge variant="info">{intl.formatMessage(messages.legacyBadge)}</Badge>}
    </span>
  );
};

export default StatusBadges;
