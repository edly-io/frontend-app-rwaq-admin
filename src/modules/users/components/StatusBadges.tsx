/**
 * Account status chips.
 *
 * Active/Inactive is the account's state; email confirmation and the legacy
 * flag are separate facts about it. The table column shows only the state —
 * mixing three signals into one column is what made it unreadable — and the
 * detail view opts into the rest.
 */
import { Chip } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../messages';

interface StatusBadgesProps {
  isActive: boolean;
  /** Off by default: only the detail view shows the secondary signals. */
  isEmailConfirmed?: boolean;
  isLegacy?: boolean;
  showSecondary?: boolean;
}

const StatusBadges = ({
  isActive,
  isEmailConfirmed = false,
  isLegacy = false,
  showSecondary = false,
}: StatusBadgesProps) => {
  const intl = useIntl();

  return (
    <span className="d-inline-flex flex-wrap rwaq-chip-list">
      <Chip className={`rwaq-chip rwaq-chip--${isActive ? 'success' : 'light'}`}>
        {intl.formatMessage(isActive ? messages.statusActive : messages.statusInactive)}
      </Chip>

      {showSecondary && (
        <Chip className={`rwaq-chip rwaq-chip--${isEmailConfirmed ? 'light' : 'warning'}`}>
          {intl.formatMessage(isEmailConfirmed ? messages.emailConfirmed : messages.emailUnconfirmed)}
        </Chip>
      )}

      {showSecondary && isLegacy && (
        <Chip className="rwaq-chip rwaq-chip--info">{intl.formatMessage(messages.legacyBadge)}</Chip>
      )}
    </span>
  );
};

export default StatusBadges;
