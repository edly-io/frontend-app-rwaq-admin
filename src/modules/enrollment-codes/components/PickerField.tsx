/**
 * One field to search and pick from a list: type to narrow, choose an option, clear with the x.
 * The list can be grouped. The caller owns the options: it narrows them from `onQueryChange`, which gets the
 * text the admin typed (empty when not typing), either by filtering a list it has or by asking the server.
 * Keyboard: arrows move, Enter picks, Escape closes.
 */
import { useRef, useState } from 'react';
import { Form, Icon, IconButton } from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';

export interface PickerOption {
  key: string;
  name: string;
  /** Shown under the name, for example an id. */
  code?: string;
  /** A heading shown above the first option of each group. */
  group?: string;
}

interface PickerFieldProps {
  controlId: string;
  label: string;
  /** No visible label: for a filter bar. */
  compact?: boolean;
  /** The name of the chosen item, shown while not typing. */
  selectedName?: string;
  selectedKey?: string;
  placeholder: string;
  options: PickerOption[];
  onQueryChange?: (query: string) => void;
  onPick: (key: string) => void;
  onClear: () => void;
  noResultsText: string;
  clearText: string;
  error?: string;
  help?: string;
  /** Shown instead of the help when the options could not be loaded. */
  loadFailedText?: string;
  disabled?: boolean;
}

const PickerField = ({
  controlId, label, compact = false, selectedName, selectedKey, placeholder, options, onQueryChange, onPick, onClear,
  noResultsText, clearText, error, help, loadFailedText, disabled,
}: PickerFieldProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const stopTyping = () => {
    setEditing(false);
    setText('');
    onQueryChange?.('');
  };

  const pick = (option: PickerOption) => {
    onPick(option.key);
    stopTyping();
    setOpen(false);
    setActiveIndex(-1);
  };

  const clear = () => {
    onClear();
    stopTyping();
    setOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex((index) => Math.min(index + 1, options.length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === 'Enter' && open && activeIndex >= 0 && options[activeIndex]) {
      event.preventDefault();
      pick(options[activeIndex]);
    } else if (event.key === 'Escape') {
      setOpen(false);
      stopTyping();
    }
  };

  // Focus leaving the whole field (not moving to the clear button or the list) ends the typing.
  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (containerRef.current?.contains(event.relatedTarget as Node | null)) { return; }
    setOpen(false);
    stopTyping();
  };

  const listId = `${controlId}-list`;
  const showList = open && !disabled;
  const rows: React.ReactNode[] = [];
  options.forEach((option, index) => {
    if (option.group && option.group !== options[index - 1]?.group) {
      rows.push(
        <li key={`group-${option.group}`} role="presentation" className="px-3 pt-2 small font-weight-bold text-muted">
          {option.group}
        </li>,
      );
    }
    rows.push(
      // Keyboard use goes through the field (arrows and Enter), so the options need no key handler of their own.
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <li
        key={option.key}
        id={`${controlId}-option-${index}`}
        role="option"
        aria-selected={selectedKey === option.key}
        className={`px-3 py-2${index === activeIndex ? ' bg-light' : ''}`}
        style={{ cursor: 'pointer' }}
        // Keeps the focus in the field, so choosing does not trigger the blur first.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => pick(option)}
      >
        <div>{option.name}</div>
        {option.code && <div className="small text-muted">{option.code}</div>}
      </li>,
    );
  });

  return (
    <Form.Group isInvalid={!!error} controlId={controlId} className={compact ? 'mb-0' : undefined}>
      {compact
        ? <Form.Label className="sr-only">{label}</Form.Label>
        : <Form.Label>{label}</Form.Label>}
      {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
      <div ref={containerRef} className="position-relative" onBlur={handleBlur}>
        <Form.Control
          role="combobox"
          aria-expanded={showList}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showList && activeIndex >= 0 ? `${controlId}-option-${activeIndex}` : undefined}
          autoComplete="off"
          value={editing ? text : selectedName ?? ''}
          placeholder={placeholder}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setText(event.target.value);
            setEditing(true);
            setOpen(true);
            setActiveIndex(0);
            onQueryChange?.(event.target.value.trim());
          }}
          onKeyDown={handleKeyDown}
          trailingElement={selectedName && !disabled ? (
            <IconButton src={Close} iconAs={Icon} alt={clearText} size="sm" onClick={clear} />
          ) : undefined}
        />
        {showList && (
          <ul
            id={listId}
            role="listbox"
            aria-label={label}
            className="list-unstyled bg-white border rounded shadow-sm position-absolute w-100 mb-0 mt-1 overflow-auto"
            style={{ maxHeight: '16rem', zIndex: 1050 }}
          >
            {rows}
            {options.length === 0 && (
              <li role="presentation" className="px-3 py-2 text-muted">{noResultsText}</li>
            )}
          </ul>
        )}
      </div>
      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
      {!error && loadFailedText && (
        <Form.Control.Feedback type="invalid" className="d-block">{loadFailedText}</Form.Control.Feedback>
      )}
      {!error && !loadFailedText && help && <Form.Text muted>{help}</Form.Text>}
    </Form.Group>
  );
};

export default PickerField;
