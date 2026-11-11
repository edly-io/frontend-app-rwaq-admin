/**
 * StatsStrip — the collapsible block of tiles and compact charts above a list or detail page.
 *
 * It owns the header, the show/hide button and the failure messages. The page's own strip
 * decides what goes inside. Collapsing keeps nothing in storage, and a collapsed strip lets
 * the page skip its requests (the page's strip passes `isOpen` to its hooks as `enabled`).
 */
import { ReactNode, useId } from 'react';
import { Alert, Button, Icon } from '@openedx/paragon';
import { ExpandLess, ExpandMore } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import InfoTooltip from '@src/components/InfoTooltip';
import messages from './messages';

const ExpandLessIcon = () => <Icon src={ExpandLess} />;
const ExpandMoreIcon = () => <Icon src={ExpandMore} />;

export interface StatsStripProps {
  isOpen: boolean;
  onToggle: () => void;
  /** Short note under the title, for example that totals ignore the table filters. */
  note?: string;
  /** Tooltip of the title. */
  info?: string;
  isForbidden?: boolean;
  hasFailedAll?: boolean;
  onRetry?: () => void;
  children: ReactNode;
}

const StatsStrip = ({
  isOpen, onToggle, note, info, isForbidden = false, hasFailedAll = false, onRetry, children,
}: StatsStripProps) => {
  const intl = useIntl();
  const bodyId = useId();

  const renderBody = () => {
    if (isForbidden) {
      return <Alert variant="info">{intl.formatMessage(messages.forbidden)}</Alert>;
    }
    if (hasFailedAll) {
      return (
        <Alert
          variant="warning"
          actions={onRetry ? [
            <Button key="retry" size="sm" variant="outline-primary" onClick={onRetry}>
              {intl.formatMessage(messages.retry)}
            </Button>,
          ] : undefined}
        >
          {intl.formatMessage(messages.failed)}
        </Alert>
      );
    }
    return children;
  };

  return (
    <section className="rwaq-stats-strip mb-3" aria-label={intl.formatMessage(messages.stripTitle)}>
      <div className="d-flex justify-content-between align-items-center mb-2" style={{ gap: '0.75rem' }}>
        <div className="rwaq-dash-card__head">
          {info ? (
            <InfoTooltip text={info}>
              <h2 className="rwaq-section-title mb-0">{intl.formatMessage(messages.stripTitle)}</h2>
            </InfoTooltip>
          ) : (
            <h2 className="rwaq-section-title mb-0">{intl.formatMessage(messages.stripTitle)}</h2>
          )}
          {note && <span className="rwaq-dash-card__sub">{note}</span>}
        </div>
        <Button
          variant="tertiary"
          size="sm"
          aria-expanded={isOpen}
          aria-controls={bodyId}
          onClick={onToggle}
          iconAfter={isOpen ? ExpandLessIcon : ExpandMoreIcon}
        >
          {intl.formatMessage(isOpen ? messages.hide : messages.show)}
        </Button>
      </div>
      <div id={bodyId} hidden={!isOpen}>
        {isOpen && renderBody()}
      </div>
    </section>
  );
};

export default StatsStrip;
