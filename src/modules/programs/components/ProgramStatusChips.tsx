/**
 * Status chips for a program.
 *
 * Renders the publication status (draft/active/archived) as the primary chip,
 * followed by secondary flag chips for is_hide, is_featured, and
 * certificate_enabled when those flags are set.
 */
import { Chip } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import type { ProgramStatus } from '../data/types';
import messages from '../messages';

interface ProgramStatusChipsProps {
  status: ProgramStatus;
  isHide?: boolean;
  isFeatured?: boolean;
  certificateEnabled?: boolean;
  className?: string;
}

const STATUS_VARIANT: Record<ProgramStatus, string> = {
  active: 'success',
  draft: 'warning',
  archived: 'light',
};

const ProgramStatusChips = ({
  status,
  isHide = false,
  isFeatured = false,
  certificateEnabled = false,
  className,
}: ProgramStatusChipsProps) => {
  const intl = useIntl();

  const statusLabel = {
    active: intl.formatMessage(messages.statusActive),
    draft: intl.formatMessage(messages.statusDraft),
    archived: intl.formatMessage(messages.statusArchived),
  }[status];

  return (
    <div className={`d-flex align-items-center flex-wrap rwaq-chip-list${className ? ` ${className}` : ''}`}>
      <Chip className={`rwaq-chip rwaq-chip--${STATUS_VARIANT[status]}`}>
        {statusLabel}
      </Chip>
      {isHide && (
        <Chip className="rwaq-chip rwaq-chip--danger">
          {intl.formatMessage(messages.tagHidden)}
        </Chip>
      )}
      {isFeatured && (
        <Chip className="rwaq-chip rwaq-chip--info">
          {intl.formatMessage(messages.tagFeatured)}
        </Chip>
      )}
      {certificateEnabled && (
        <Chip className="rwaq-chip rwaq-chip--success-muted">
          {intl.formatMessage(messages.tagCertEnabled)}
        </Chip>
      )}
    </div>
  );
};

export default ProgramStatusChips;
