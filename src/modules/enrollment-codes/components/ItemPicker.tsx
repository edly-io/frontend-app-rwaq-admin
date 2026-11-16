/**
 * Picks one course or program of type Enrollment code with a single field: type to search, pick from the list.
 * The search matches the name and the id (course key or program key). Courses and programs are listed in two
 * groups. Only items of that type can have codes, so only they are offered.
 */
import { useRef, useState } from 'react';
import { Form, Icon, IconButton } from '@openedx/paragon';
import { Close } from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useCourses } from '@src/modules/courses/data/hooks';
import { usePrograms } from '@src/modules/programs/data/hooks';
import type { ItemKind } from '../data/types';
import messages from '../messages';
import useDebounced from './useDebounced';

export interface PickedItem {
  kind: ItemKind | 'organization';
  /** The course key, the program UUID or, for an organization, its short name. */
  id: string;
  name: string;
}

interface ItemPickerProps {
  controlId: string;
  label: string;
  value: PickedItem | null;
  onChange: (item: PickedItem | null) => void;
  /** Placeholder while nothing is chosen. */
  emptyLabel?: string;
  error?: string;
  help?: string;
  disabled?: boolean;
  /** No visible label: for a filter bar. */
  compact?: boolean;
  /** Which kinds to offer. Both by default. */
  kinds?: ItemKind[];
}

interface Option extends PickedItem {
  /** What the list shows under the name: the course key or the program key. */
  code: string;
}

const LIST_SIZE = 50;

const encode = (item: { kind: ItemKind | 'organization'; id: string }) => `${item.kind}:${item.id}`;

const ItemPicker = ({
  controlId, label, value, onChange, emptyLabel, error, help, disabled, compact = false, kinds = ['course', 'program'],
}: ItemPickerProps) => {
  const intl = useIntl();
  const containerRef = useRef<HTMLDivElement>(null);
  // `text` is only what the admin typed. While not typing, the field shows the chosen item.
  const [text, setText] = useState('');
  const [editing, setEditing] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const term = useDebounced(editing ? text.trim() : '');

  const withCourses = kinds.includes('course');
  const withPrograms = kinds.includes('program');
  const courses = useCourses({
    courseType: 'enrollment_code', search: term || undefined, ordering: 'display_name', pageSize: LIST_SIZE,
  });
  const programs = usePrograms({
    pricing: 'enrollment_code', search: term || undefined, ordering: 'name', pageSize: LIST_SIZE,
  });

  const courseOptions: Option[] = (withCourses ? courses.data?.results ?? [] : []).map((course) => ({
    kind: 'course', id: course.courseId, name: course.displayName, code: course.courseId,
  }));
  const programOptions: Option[] = (withPrograms ? programs.data?.results ?? [] : []).map((program) => ({
    kind: 'program', id: program.uuid, name: program.name, code: program.programKey ?? '',
  }));
  const options = [...courseOptions, ...programOptions];
  const loadFailed = (withCourses && courses.isError) || (withPrograms && programs.isError);

  const select = (option: Option) => {
    onChange({ kind: option.kind, id: option.id, name: option.name });
    setEditing(false);
    setText('');
    setOpen(false);
    setActiveIndex(-1);
  };

  const clear = () => {
    onChange(null);
    setEditing(false);
    setText('');
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
      select(options[activeIndex]);
    } else if (event.key === 'Escape') {
      setOpen(false);
      setEditing(false);
      setText('');
    }
  };

  // Focus leaving the whole field (not moving to the clear button or the list) ends the typing.
  const handleBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    if (containerRef.current?.contains(event.relatedTarget as Node | null)) { return; }
    setOpen(false);
    setEditing(false);
    setText('');
  };

  const listId = `${controlId}-list`;
  const renderOption = (option: Option) => {
    const index = options.indexOf(option);
    return (
      // Keyboard use goes through the field (arrows and Enter), so the options need no key handler of their own.
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events
      <li
        key={encode(option)}
        id={`${controlId}-option-${index}`}
        role="option"
        aria-selected={value ? encode(value) === encode(option) : false}
        className={`px-3 py-2${index === activeIndex ? ' bg-light' : ''}`}
        style={{ cursor: 'pointer' }}
        // Keeps the focus in the field, so choosing does not trigger the blur first.
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => select(option)}
      >
        <div>{option.name}</div>
        {option.code && <div className="small text-muted">{option.code}</div>}
      </li>
    );
  };

  const showList = open && !disabled;

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
          value={editing ? text : value?.name ?? ''}
          placeholder={emptyLabel ?? intl.formatMessage(messages.itemSearch)}
          disabled={disabled}
          onFocus={() => setOpen(true)}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
            setText(event.target.value);
            setEditing(true);
            setOpen(true);
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          trailingElement={value && !disabled ? (
            <IconButton
              src={Close}
              iconAs={Icon}
              alt={intl.formatMessage(messages.itemClear)}
              size="sm"
              onClick={clear}
            />
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
            {courseOptions.length > 0 && (
              <>
                <li role="presentation" className="px-3 pt-2 small font-weight-bold text-muted">
                  {intl.formatMessage(messages.itemGroupCourses)}
                </li>
                {courseOptions.map(renderOption)}
              </>
            )}
            {programOptions.length > 0 && (
              <>
                <li role="presentation" className="px-3 pt-2 small font-weight-bold text-muted">
                  {intl.formatMessage(messages.itemGroupPrograms)}
                </li>
                {programOptions.map(renderOption)}
              </>
            )}
            {options.length === 0 && (
              <li role="presentation" className="px-3 py-2 text-muted">
                {intl.formatMessage(messages.itemNoResults)}
              </li>
            )}
          </ul>
        )}
      </div>
      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
      {!error && loadFailed && (
        <Form.Control.Feedback type="invalid" className="d-block">
          {intl.formatMessage(messages.itemLoadFailed)}
        </Form.Control.Feedback>
      )}
      {!error && !loadFailed && help && <Form.Text muted>{help}</Form.Text>}
    </Form.Group>
  );
};

export default ItemPicker;
