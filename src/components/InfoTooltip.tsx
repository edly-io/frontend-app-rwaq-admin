/**
 * InfoTooltip — a small ⓘ icon that reveals an explanatory tooltip on hover
 * and click. Hover is primary on desktop; click pins the tooltip open so it
 * survives mouse-leave (useful on touch and for keyboard users).
 *
 * Visibility states:
 *   'hidden'  — tooltip not shown
 *   'hover'   — shown while mouse is over / element has focus; hides on leave/blur
 *   'pinned'  — shown until a second click, outside click, or Escape
 *
 * The tooltip auto-flips (left / center / right) via useLayoutEffect so it
 * never overflows the viewport edge on either side.
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
type Vis = 'hidden' | 'hover' | 'pinned';

const TOOLTIP_BG = '#1a2e43';

const InfoTooltip = ({ text, ariaLabel = 'More information' }: InfoTooltipProps) => {
  const [vis, setVis] = useState<Vis>('hidden');
  const [placement, setPlacement] = useState<Placement>('center');
  const wrapRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const rawId = useId();
  const tooltipId = `info-tooltip-${rawId.replace(/:/g, '')}`;

  const isVisible = vis !== 'hidden';

  // Reset placement when tooltip closes so next open starts centered.
  useEffect(() => {
    if (!isVisible) { setPlacement('center'); }
  }, [isVisible]);

  // Flip the tooltip before the browser paints to prevent overflow.
  useLayoutEffect(() => {
    if (!isVisible || !tooltipRef.current) { return; }
    const rect = tooltipRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    if (rect.right > vw - 8) {
      setPlacement('right');
    } else if (rect.left < 8) {
      setPlacement('left');
    }
  }, [isVisible, placement]);

  // Close on outside click or Escape key (WCAG 1.4.13).
  useEffect(() => {
    if (!isVisible) { return undefined; }
    const handleMouse = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setVis('hidden');
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setVis('hidden'); }
    };
    document.addEventListener('mousedown', handleMouse);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleMouse);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isVisible]);

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
        aria-describedby={isVisible ? tooltipId : undefined}
        onMouseEnter={(e) => {
          setVis((v) => (v === 'hidden' ? 'hover' : v));
          (e.currentTarget as HTMLButtonElement).style.opacity = '1';
        }}
        onMouseLeave={(e) => {
          setVis((v) => (v === 'hover' ? 'hidden' : v));
          (e.currentTarget as HTMLButtonElement).style.opacity = '0.7';
        }}
        onFocus={() => setVis((v) => (v === 'hidden' ? 'hover' : v))}
        onBlur={() => setVis((v) => (v === 'hover' ? 'hidden' : v))}
        onClick={() => setVis((v) => (v === 'pinned' ? 'hidden' : 'pinned'))}
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
      >
        ⓘ
      </button>

      {isVisible && (
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
