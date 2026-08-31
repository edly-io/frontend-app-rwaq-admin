/**
 * A single figure with a caption, for breakdowns that are one number plus
 * context rather than a KPI with a period-on-period delta.
 *
 * The null case is the point of this component: a metric we cannot read must
 * say so, not render "0". Passing `value={null}` produces an explicit
 * "Not available" with the reason underneath.
 */
import { ReactNode } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../messages';

export interface StatTileProps {
  label: string;
  /** null renders as "Not available" — never as zero. */
  value: string | number | null;
  hint?: ReactNode;
  /** Shown instead of the hint when value is null. */
  unavailableHint?: ReactNode;
  /** Optional muted chip rendered below the value — use for "All time" on snapshot metrics. */
  badge?: string;
}

const StatTile = ({
  label, value, hint, unavailableHint, badge,
}: StatTileProps) => {
  const intl = useIntl();
  const isUnavailable = value === null || value === undefined;

  return (
    <div className="rwaq-stat-tile">
      <span className="rwaq-stat-tile__label">{label}</span>
      <span className={`rwaq-stat-tile__value${isUnavailable ? ' rwaq-stat-tile__value--muted' : ''}`}>
        {isUnavailable ? intl.formatMessage(messages.unavailable) : value}
      </span>
      {badge && (
        <span className="x-small text-muted d-block text-center mt-1">{badge}</span>
      )}
      {(isUnavailable ? unavailableHint : hint) && (
        <span className="rwaq-stat-tile__hint">
          {isUnavailable ? unavailableHint : hint}
        </span>
      )}
    </div>
  );
};

export default StatTile;
