/**
 * StatsStrip — the collapsible block of tiles and compact charts above a list or detail page.
 *
 * It owns the header, the show/hide button and the failure messages. The page's own strip
 * decides what goes inside. Collapsing keeps nothing in storage, and a collapsed strip lets
 * the page skip its requests (the page's strip passes `isOpen` to its hooks as `enabled`).
 */
import {
  ReactNode, useEffect, useId, useState,
} from 'react';
import {
  Alert, Button, Icon,
} from '@openedx/paragon';
import { ExpandLess, ExpandMore, Refresh } from '@openedx/paragon/icons';
import { IntlShape, useIntl } from '@edx/frontend-platform/i18n';
import InfoTooltip from '@src/components/InfoTooltip';
import dashboardMessages from '@src/modules/dashboard/messages';
import messages from './messages';

const ExpandLessIcon = () => <Icon src={ExpandLess} />;
const ExpandMoreIcon = () => <Icon src={ExpandMore} />;

/** "2026-08-28T09:14:00Z" to "Just now", "3 min ago" or "1 hr ago", with the dashboard's wording. */
const formatRelativeTime = (isoString: string, intl: IntlShape): string => {
  const diffMin = Math.floor((Date.now() - new Date(isoString).getTime()) / 60_000);
  if (diffMin < 1) { return intl.formatMessage(dashboardMessages.relativeJustNow); }
  if (diffMin < 60) { return intl.formatMessage(dashboardMessages.relativeMinutes, { count: diffMin }); }
  return intl.formatMessage(dashboardMessages.relativeHours, { count: Math.floor(diffMin / 60) });
};

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
  /** When the figures were computed, as the backend stamps it. Shown next to the refresh button. */
  generatedAt?: string;
  /** Recompute the strip's figures. Without it the strip shows no refresh button. */
  onRefresh?: () => void;
  isRefreshing?: boolean;
  /** The last refresh failed. The tiles keep the figures they had. */
  hasRefreshFailed?: boolean;
  datePicker?: ReactNode;
  children: ReactNode;
}

const StatsStrip = ({
  isOpen, onToggle, note, info, isForbidden = false, hasFailedAll = false, onRetry,
  generatedAt, onRefresh, isRefreshing = false, hasRefreshFailed = false, datePicker, children,
}: StatsStripProps) => {
  const intl = useIntl();
  const bodyId = useId();

  // Tick every minute so "3 min ago" stays accurate.
  const [, setTick] = useState(0);
  useEffect(() => {
    if (!generatedAt) { return undefined; }
    const id = setInterval(() => setTick((tick) => tick + 1), 60_000);
    return () => clearInterval(id);
  }, [generatedAt]);

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
    return (
      <>
        {hasRefreshFailed && <Alert variant="danger">{intl.formatMessage(messages.refreshFailed)}</Alert>}
        {children}
      </>
    );
  };

  return (
    <section className="rwaq-stats-strip mb-3" aria-label={intl.formatMessage(messages.stripTitle)}>
      <div className="d-flex justify-content-between align-items-start mb-2" style={{ gap: '0.75rem' }}>
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
      <div className="d-flex align-items-center justify-content-end flex-wrap mb-3" style={{ gap: '0.75rem' }}>
        {datePicker}
        {generatedAt && (
          <span style={{ fontSize: '0.8125rem', color: 'var(--rwaq-muted, #6B757F)' }}>
            {intl.formatMessage(dashboardMessages.lastUpdated, { time: formatRelativeTime(generatedAt, intl) })}
          </span>
        )}
        {onRefresh && (
          <button
            type="button"
            aria-label={intl.formatMessage(messages.refresh)}
            onClick={onRefresh}
            aria-busy={isRefreshing}
            disabled={isRefreshing}
            style={{
              border: 'none', background: 'transparent', padding: '0.25rem',
              cursor: isRefreshing ? 'not-allowed' : 'pointer', opacity: isRefreshing ? 0.5 : 1,
              color: 'var(--rwaq-muted, #6B757F)', display: 'inline-flex', alignItems: 'center',
            }}
          >
            <Icon src={Refresh} style={{
              width: '1.125rem', height: '1.125rem',
              animation: isRefreshing ? 'rwaq-spin 0.8s linear infinite' : 'none',
            }} />
          </button>
        )}
      </div>
      <div id={bodyId} hidden={!isOpen}>
        {isOpen && renderBody()}
      </div>
    </section>
  );
};

export default StatsStrip;
