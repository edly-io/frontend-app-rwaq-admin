/**
 * KpiCard — a metric summary card with label, value, optional delta badge,
 * and an optional sparkline slot.
 *
 * Colors come exclusively from Paragon CSS custom properties; no hardcoded hex.
 */
import { ReactNode } from 'react';
import { Card } from '@openedx/paragon';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  deltaIncrease: {
    id: 'rwaq.admin.kpiCard.deltaIncrease',
    defaultMessage: 'Increased by {delta}%',
    description: 'Screen reader text for an upward delta on a KPI card',
  },
  deltaDecrease: {
    id: 'rwaq.admin.kpiCard.deltaDecrease',
    defaultMessage: 'Decreased by {delta}%',
    description: 'Screen reader text for a downward delta on a KPI card',
  },
  deltaNoChange: {
    id: 'rwaq.admin.kpiCard.deltaNoChange',
    defaultMessage: 'No change',
    description: 'Screen reader text when a KPI has not changed',
  },
});

// ── Types ─────────────────────────────────────────────────────────────────────

export interface KpiCardProps {
  label: string;
  value: string | number;
  /** Percent change (positive = up, negative = down, 0 = neutral). Omit to hide. */
  delta?: number;
  /** Optional Recharts sparkline or any React node rendered below the value. */
  sparkline?: ReactNode;
  isLoading?: boolean;
}

// ── Sub-components ────────────────────────────────────────────────────────────

interface DeltaBadgeProps {
  delta: number;
}

const DeltaBadge = ({ delta }: DeltaBadgeProps) => {
  const intl = useIntl();

  const isPositive = delta > 0;
  const isNegative = delta < 0;

  // Use Paragon success/danger tokens
  let colorStyle: React.CSSProperties;
  let arrow: string;
  let srText: string;

  const abs = Math.abs(delta).toFixed(1);

  if (isPositive) {
    colorStyle = { color: 'var(--pgn-color-success-500, #178253)' };
    arrow = '▲';
    srText = intl.formatMessage(messages.deltaIncrease, { delta: abs });
  } else if (isNegative) {
    colorStyle = { color: 'var(--pgn-color-danger-500, #C00000)' };
    arrow = '▼';
    srText = intl.formatMessage(messages.deltaDecrease, { delta: abs });
  } else {
    colorStyle = { color: 'var(--pgn-color-gray-500, #6B757F)' };
    arrow = '—';
    srText = intl.formatMessage(messages.deltaNoChange);
  }

  return (
    <span
      style={{
        ...colorStyle,
        fontSize: '0.875rem',
        fontWeight: 600,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        marginTop: '0.25rem',
      }}
      aria-label={srText}
    >
      <span aria-hidden="true">{arrow}</span>
      {!isPositive && !isNegative ? null : <span aria-hidden="true">{abs}%</span>}
    </span>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const KpiCard = ({
  label,
  value,
  delta,
  sparkline,
  isLoading = false,
}: KpiCardProps) => (
  <Card
    className="h-100"
    style={{ borderRadius: 'var(--pgn-size-border-radius-lg, 0.5rem)' }}
  >
    <Card.Body className="d-flex flex-column justify-content-between p-3">
      <div>
        <p
          className="small text-uppercase mb-1"
          style={{
            color: 'var(--pgn-color-gray-500, #6B757F)',
            letterSpacing: '0.04em',
            fontWeight: 600,
          }}
        >
          {label}
        </p>

        {isLoading ? (
          <div
            style={{
              width: '60%',
              height: '2rem',
              borderRadius: 4,
              background: 'var(--pgn-color-gray-100, #f0f0ef)',
              animation: 'pulse 1.5s infinite',
            }}
            aria-busy="true"
            aria-label="Loading"
          />
        ) : (
          <>
            <p
              className="mb-0"
              style={{
                fontSize: '2rem',
                fontWeight: 700,
                lineHeight: 1.1,
                color: 'var(--pgn-color-gray-700, #273F58)',
              }}
            >
              {value}
            </p>
            {delta !== undefined && <DeltaBadge delta={delta} />}
          </>
        )}
      </div>

      {sparkline && (
        <div className="mt-2" style={{ height: '48px' }}>
          {sparkline}
        </div>
      )}
    </Card.Body>
  </Card>
);

export default KpiCard;
