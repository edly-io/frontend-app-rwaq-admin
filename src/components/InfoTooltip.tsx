/**
 * InfoTooltip — a small ⓘ icon that reveals an explanatory tooltip on hover
 * and click. Hover is primary on desktop; click/tap works on touch devices.
 *
 * The tooltip appears below the icon and is absolutely positioned relative to
 * the icon's wrapper span. Card containers do not have overflow:hidden, so the
 * panel can bleed outside the card without being clipped.
 */
import { useEffect, useRef, useState } from 'react';

export interface InfoTooltipProps {
  /** Explanation text shown in the tooltip. Keep to 1–2 short sentences. */
  text: string;
  /** Accessible label for the trigger button (defaults to "More information"). */
  ariaLabel?: string;
}

const InfoTooltip = ({ text, ariaLabel = 'More information' }: InfoTooltipProps) => {
  const [visible, setVisible] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);

  // Close on outside click (touch-friendly dismiss).
  useEffect(() => {
    if (!visible) { return undefined; }
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [visible]);

  return (
    <span
      ref={wrapRef}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        marginInlineStart: '0.25rem',
        verticalAlign: 'middle',
      }}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-expanded={visible}
        aria-haspopup="true"
        onMouseEnter={() => setVisible(true)}
        onMouseLeave={() => setVisible(false)}
        onFocus={() => setVisible(true)}
        onBlur={() => setVisible(false)}
        onClick={() => setVisible((v) => !v)}
        style={{
          border: 'none',
          background: 'transparent',
          padding: '0 0.1rem',
          cursor: 'help',
          color: 'var(--rwaq-muted, #6B757F)',
          lineHeight: 1,
          fontSize: '0.8rem',
          display: 'inline-flex',
          alignItems: 'center',
          opacity: 0.7,
          transition: 'opacity 120ms',
        }}
        onMouseEnterCapture={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '1'; }}
        onMouseLeaveCapture={(e) => { (e.currentTarget as HTMLButtonElement).style.opacity = '0.7'; }}
      >
        ⓘ
      </button>

      {visible && (
        <div
          role="tooltip"
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.375rem)',
            right: 0,
            left: 'auto',
            zIndex: 1060,
            background: '#1a2e43',
            color: '#fff',
            borderRadius: '0.375rem',
            padding: '0.5rem 0.6875rem',
            fontSize: '0.75rem',
            lineHeight: 1.5,
            width: '220px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
            fontWeight: 400,
            textTransform: 'none',
            letterSpacing: 0,
            whiteSpace: 'normal',
          }}
        >
          {/* Arrow pointing upward toward the icon — anchored right */}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-4px',
              right: '10px',
              left: 'auto',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: '5px solid #1a2e43',
            }}
          />
          {text}
        </div>
      )}
    </span>
  );
};

export default InfoTooltip;
