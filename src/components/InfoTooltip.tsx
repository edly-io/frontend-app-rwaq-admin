/**
 * InfoTooltip — reveals an explanatory tooltip on hover.
 *
 * Two modes:
 *   Icon mode   (no children) — renders a small ⓘ button as the trigger.
 *                               Tooltip is position:absolute relative to wrapper.
 *   Title mode  (children)    — wraps children; hovering them shows the tooltip.
 *                               Tooltip is position:fixed anchored to the trigger's
 *                               bounding rect so it always appears below the title
 *                               text regardless of the container layout.
 */
import {
  useEffect, useId, useLayoutEffect, useRef, useState,
} from 'react';
import type { ReactNode } from 'react';

export interface InfoTooltipProps {
  text: string;
  disabled?: boolean;
  ariaLabel?: string;
  children?: ReactNode;
}

type Placement = 'center' | 'left' | 'right';
type Vis = 'hidden' | 'hover' | 'pinned';

const TOOLTIP_BG = '#1a2e43';
const TOOLTIP_W = 220;

const InfoTooltip = ({
  text, ariaLabel = 'More information', children, disabled = false,
}: InfoTooltipProps) => {
  if (disabled) { return <>{children}</>; }

  const [vis, setVis] = useState<Vis>('hidden');
  // Icon mode: flip placement to avoid viewport overflow
  const [placement, setPlacement] = useState<Placement>('center');
  // Title mode: fixed-position anchor computed at hover time
  const [fixedPos, setFixedPos] = useState<{ top: number; left: number; flip: boolean } | null>(null);

  const wrapRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const rawId = useId();
  const tooltipId = `info-tooltip-${rawId.replace(/:/g, '')}`;

  const isVisible = vis !== 'hidden';
  const isTitleMode = Boolean(children);

  useEffect(() => {
    if (!isVisible) { setPlacement('center'); }
  }, [isVisible]);

  // Icon mode only: flip after paint to prevent overflow.
  useLayoutEffect(() => {
    if (isTitleMode || !isVisible || !tooltipRef.current) { return; }
    const rect = tooltipRef.current.getBoundingClientRect();
    const vw = window.innerWidth;
    if (rect.right > vw - 8) { setPlacement('right'); }
    else if (rect.left < 8) { setPlacement('left'); }
  }, [isVisible, placement, isTitleMode]);

  // Close on outside click or Escape (WCAG 1.4.13).
  useEffect(() => {
    if (!isVisible) { return undefined; }
    const handleMouse = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setVis('hidden');
      }
    };
    const handleKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setVis('hidden'); } };
    document.addEventListener('mousedown', handleMouse);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleMouse);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isVisible]);

  // Title mode: compute fixed position from the trigger element's bounding rect.
  const computeFixed = () => {
    const el = triggerRef.current ?? wrapRef.current;
    if (!el) { return; }
    const rect = el.getBoundingClientRect();
    const flip = rect.left + TOOLTIP_W > window.innerWidth - 8;
    setFixedPos({
      top: rect.bottom + 6,
      left: flip ? rect.right - TOOLTIP_W : rect.left,
      flip,
    });
  };

  // Icon mode tooltip position (position:absolute, relative to wrapper).
  const iconTipPos: React.CSSProperties = placement === 'right'
    ? { right: 0, left: 'auto' }
    : placement === 'left'
      ? { left: 0, right: 'auto' }
      : { left: '50%', transform: 'translateX(-50%)', right: 'auto' };
  const iconArrowPos: React.CSSProperties = placement === 'right'
    ? { right: '10px', left: 'auto' }
    : placement === 'left'
      ? { left: '10px', right: 'auto' }
      : { left: '50%', transform: 'translateX(-50%)', right: 'auto' };

  const tooltipBody = (extraStyle: React.CSSProperties, arrowStyle: React.CSSProperties) => (
    <div
      ref={tooltipRef}
      id={tooltipId}
      role="tooltip"
      style={{
        background: TOOLTIP_BG,
        color: '#fff',
        borderRadius: '0.375rem',
        padding: '0.5rem 0.6875rem',
        fontSize: '0.75rem',
        lineHeight: 1.5,
        width: `${TOOLTIP_W}px`,
        boxShadow: '0 4px 16px rgba(0,0,0,0.22)',
        fontWeight: 400,
        textTransform: 'none',
        letterSpacing: 0,
        whiteSpace: 'normal',
        zIndex: 1060,
        ...extraStyle,
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
          ...arrowStyle,
        }}
      />
      {text}
    </div>
  );

  return (
    <span
      ref={wrapRef}
      style={{
        position: isTitleMode ? undefined : 'relative',
        display: isTitleMode ? 'inline-block' : 'inline-flex',
        alignItems: isTitleMode ? undefined : 'center',
        marginInlineStart: isTitleMode ? undefined : '0.25rem',
        verticalAlign: isTitleMode ? undefined : 'middle',
      }}
    >
      {children ? (
        <span
          ref={triggerRef}
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
          tabIndex={0}
          role="group"
          aria-describedby={isVisible ? tooltipId : undefined}
          onMouseEnter={() => { computeFixed(); setVis((v) => (v === 'hidden' ? 'hover' : v)); }}
          onMouseLeave={() => setVis((v) => (v === 'hover' ? 'hidden' : v))}
          onFocus={() => { computeFixed(); setVis((v) => (v === 'hidden' ? 'hover' : v)); }}
          onBlur={() => setVis((v) => (v === 'hover' ? 'hidden' : v))}
          onKeyDown={(e) => { if (e.key === 'Escape') { setVis('hidden'); } }}
          style={{ cursor: 'help', display: 'inline-block' }}
        >
          {children}
        </span>
      ) : (
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
      )}

      {/* Title mode: fixed position anchored to trigger's bounding rect */}
      {isTitleMode && isVisible && fixedPos && tooltipBody(
        { position: 'fixed', top: fixedPos.top, left: fixedPos.left },
        { left: fixedPos.flip ? 'auto' : '12px', right: fixedPos.flip ? '12px' : 'auto' },
      )}

      {/* Icon mode: absolute position relative to wrapper */}
      {!isTitleMode && isVisible && tooltipBody(
        { position: 'absolute', top: 'calc(100% + 0.375rem)', ...iconTipPos },
        iconArrowPos,
      )}
    </span>
  );
};

export default InfoTooltip;
