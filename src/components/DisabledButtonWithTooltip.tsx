/**
 * A disabled button that says why on hover and focus.
 *
 * A disabled <button> fires no mouse events and takes no focus, so the button
 * is only marked disabled (aria-disabled and the disabled style) and ignores
 * clicks. That keeps the tooltip on hover and on keyboard focus.
 */
import type { ReactNode } from 'react';
import { Button, OverlayTrigger, Tooltip } from '@openedx/paragon';

interface DisabledButtonWithTooltipProps {
  id: string;
  tooltip: string;
  children: ReactNode;
  variant?: string;
  size?: 'sm' | 'lg' | 'inline';
  ariaLabel?: string;
}

const DisabledButtonWithTooltip = ({
  id, tooltip, children, variant = 'primary', size, ariaLabel,
}: DisabledButtonWithTooltipProps) => (
  <OverlayTrigger placement="top" overlay={<Tooltip id={id}>{tooltip}</Tooltip>}>
    <Button
      variant={variant}
      size={size}
      className="disabled"
      aria-disabled="true"
      aria-label={ariaLabel}
      onClick={(event: React.MouseEvent) => event.preventDefault()}
    >
      {children}
    </Button>
  </OverlayTrigger>
);

export default DisabledButtonWithTooltip;
