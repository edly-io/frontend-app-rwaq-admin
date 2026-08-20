/**
 * A chip list that collapses past a limit: the most important entries stay
 * visible and the rest become a single "+N" chip.
 *
 * Table cells need a predictable height, so a user with five roles must not
 * make its row three times as tall as its neighbours. The full list is always
 * reachable — the overflow chip carries it as a tooltip, and the detail view
 * shows every entry unabridged.
 */
import { Chip, OverlayTrigger, Tooltip } from '@openedx/paragon';

export interface ChipItem {
  key: string;
  label: string;
  /** Paragon Chip variant (`light`, `dark`, `success`, …). */
  variant?: string;
}

export interface ChipOverflowListProps {
  items: ChipItem[];
  /** How many chips to show before collapsing the remainder. */
  maxVisible?: number;
  /** Rendered when there is nothing to show. */
  emptyLabel?: string;
  id: string;
}

const ChipOverflowList = ({
  items, maxVisible = 1, emptyLabel = '—', id,
}: ChipOverflowListProps) => {
  if (items.length === 0) {
    return <span className="text-muted">{emptyLabel}</span>;
  }

  const visible = items.slice(0, maxVisible);
  const hidden = items.slice(maxVisible);

  return (
    <div className="d-inline-flex align-items-center flex-wrap rwaq-chip-list">
      {visible.map((item) => (
        <Chip key={item.key} className={`rwaq-chip rwaq-chip--${item.variant ?? 'light'}`}>
          {item.label}
        </Chip>
      ))}

      {hidden.length > 0 && (
        <OverlayTrigger
          placement="top"
          overlay={(
            <Tooltip id={`${id}-overflow`}>
              {hidden.map((item) => item.label).join(', ')}
            </Tooltip>
          )}
        >
          {/* Chip forwards no tabIndex, so the focusable trigger is the wrapper —
              otherwise the hidden entries are keyboard-unreachable. */}
          <span tabIndex={0} role="button" aria-label={hidden.map((item) => item.label).join(', ')}>
            <Chip className="rwaq-chip rwaq-chip--overflow">
              {`+${hidden.length}`}
            </Chip>
          </span>
        </OverlayTrigger>
      )}
    </div>
  );
};

export default ChipOverflowList;
