/**
 * KpiCard — a metric summary card with label, value, optional delta badge,
 * and an optional sparkline slot.
 *
 * Colors come exclusively from Paragon CSS custom properties; no hardcoded hex.
 */
import { ReactNode } from 'react';
import { Card } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { kpiMessages as messages } from './messages';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface KpiCardProps {
  label: string;
  value: string | number;
  /** Percent change (positive = up, negative = down, 0 = neutral). Omit to hide. */
  delta?: number;
  /** Optional Recharts sparkline or any React node rendered below the value. */
  sparkline?: ReactNode;
  isLoading?: boolean;
  /** Small muted label shown in the top-right corner of the card (e.g. "All time"). */
  badge?: string;
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
  badge,
}: KpiCardProps) => (
  <Card
    className="h-100"
    style={{ borderRadius: 'var(--pgn-size-border-radius-lg, 0.5rem)', position: 'relative' }}
  >
    {badge && (
      <span
        style={{
          position: 'absolute',
          top: '0.5rem',
          right: '0.625rem',
          padding: '0.1rem 0.375rem',
          fontSize: '0.55rem',
          fontWeight: 600,
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          color: 'var(--rwaq-muted, #6B757F)',
          background: 'var(--pgn-color-gray-100, #f0f0ef)',
          border: '1px solid var(--pgn-color-gray-300, #c8c9c0)',
          borderRadius: '999px',
          lineHeight: 1.4,
        }}
      >
        {badge}
      </span>
    )}
    <Card.Body className="d-flex flex-column justify-content-between p-3">
      <div>
        <p
          className="small text-uppercase mb-1"
          style={{
            color: 'var(--rwaq-muted, #6B757F)',
            letterSpacing: '0.04em',
            fontWeight: 600,
            paddingRight: badge ? '3.5rem' : undefined,
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
                fontSize: '1.625rem',
                fontWeight: 700,
                lineHeight: 1.1,
                color: 'var(--rwaq-heading, #273F58)',
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
