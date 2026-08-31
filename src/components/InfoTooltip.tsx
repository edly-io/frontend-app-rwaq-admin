/**
 * InfoTooltip — a small ⓘ icon that reveals an explanatory tooltip on hover
 * and click. Hover is primary on desktop; click/tap works on touch devices.
 *
 * The tooltip appears below the icon and is absolutely positioned relative to
 * the icon's wrapper span. Card containers do not have overflow:hidden, so the
 * panel can bleed outside the card without being clipped.
 */
import {
  useEffect, useId, useLayoutEffect, useRef, useState,
} from 'react';

export interface InfoTooltipProps {
  /** Explanation text shown in the tooltip. Keep to 1–2 short sentences. */
  text: string;
  /** Accessible label for the trigger button (defaults to "More information"). */
  ariaLabel?: string;
}

type Placement = 'center' | 'left' | 'right';

const TOOLTIP_BG = '#1a2e43';

const InfoTooltip = ({ text, ariaLabel = 'More information' }: InfoTooltipProps) => {
  const [visible, setVisible] = useState(false);
  const [placement, setPlacement] = useState<Placement>('center');
  const wrapRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const rawId = useId();
  const tooltipId = `info-tooltip-${rawId.replace(/:/g, '')}`;

  // Reset placement when tooltip closes so next open starts centered.
  useEffect(() => {
    if (!visible) { setPlacement('center'); }
  }, [visible]);

  // Flip the tooltip before the browser paints to prevent overflow.
  useLayoutEffect(() => {
    if (!visible || !tooltipRef.current) { return; }
    const rect = tooltipRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    if (rect.right > vw - 8) {
      setPlacement('right');
    } else if (rect.left < 8) {
      setPlacement('left');
    }
  }, [visible, placement]);

  // Close on outside click or Escape key (WCAG 1.4.13).
  useEffect(() => {
    if (!visible) { return undefined; }
    const handleMouse = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setVisible(false); }
    };
    document.addEventListener('mousedown', handleMouse);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleMouse);
      document.removeEventListener('keydown', handleKey);
    };
  }, [visible]);

  const tooltipPos: React.CSSProperties = placement === 'right'
    ? { right: 0, left: 'auto' }
    : placement === 'left'
      ? { left: 0, right: 'auto' }
      : { left: '50%', transform: 'translateX(-50%)', right: 'auto' };

  const arrowPos: React.CSSProperties = placement === 'right'
    ? { right: '10px', left: 'auto' }
    : placement === 'left'
      ? { left: '10px', right: 'auto' }
      : { left: '50%', transform: 'translateX(-50%)', right: 'auto' };

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
        aria-describedby={visible ? tooltipId : undefined}
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
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.375rem)',
            zIndex: 1060,
            background: TOOLTIP_BG,
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
            ...tooltipPos,
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: '-4px',
              width: 0,
              height: 0,
              borderLeft: '5px solid transparent',
              borderRight: '5px solid transparent',
              borderBottom: `5px solid ${TOOLTIP_BG}`,
              ...arrowPos,
            }}
          />
          {text}
        </div>
      )}
    </span>
  );
};

export default InfoTooltip;
