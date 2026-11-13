/**
 * Picks one course or program of type Enrollment code. Courses and programs are listed in two groups,
 * with a search box that narrows both. Only items of that type can have codes, so only they are offered.
 */
import { useState } from 'react';
import { Form } from '@openedx/paragon';
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
  /** Text of the empty choice. */
  emptyLabel?: string;
  error?: string;
  help?: string;
  disabled?: boolean;
  /** Only the select, with no label or search box: for a filter bar. */
  compact?: boolean;
  /** Which kinds to offer. Both by default. */
  kinds?: ItemKind[];
}

const LIST_SIZE = 50;

const encode = (item: { kind: ItemKind | 'organization'; id: string }) => `${item.kind}:${item.id}`;

const ItemPicker = ({
  controlId, label, value, onChange, emptyLabel, error, help, disabled, compact = false, kinds = ['course', 'program'],
}: ItemPickerProps) => {
  const intl = useIntl();
  const [search, setSearch] = useState('');
  const term = useDebounced(search.trim());

  const withCourses = kinds.includes('course');
  const withPrograms = kinds.includes('program');
  const courses = useCourses({
    courseType: 'enrollment_code', search: term || undefined, ordering: 'display_name', pageSize: LIST_SIZE,
  });
  const programs = usePrograms({
    pricing: 'enrollment_code', search: term || undefined, ordering: 'name', pageSize: LIST_SIZE,
  });

  const courseOptions: PickedItem[] = (withCourses ? courses.data?.results ?? [] : []).map((course) => ({
    kind: 'course', id: course.courseId, name: course.displayName,
  }));
  const programOptions: PickedItem[] = (withPrograms ? programs.data?.results ?? [] : []).map((program) => ({
    kind: 'program', id: program.uuid, name: program.name,
  }));
  const all = [...courseOptions, ...programOptions];
  // A chosen item stays selectable even when the search no longer lists it.
  const extra = value && !all.some((item) => encode(item) === encode(value)) ? value : null;
  const loadFailed = (withCourses && courses.isError) || (withPrograms && programs.isError);

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const chosen = [...(extra ? [extra] : []), ...all].find((item) => encode(item) === event.target.value);
    onChange(chosen ?? null);
  };

  const renderOption = (item: PickedItem) => (
    <option key={encode(item)} value={encode(item)}>{item.name}</option>
  );

  return (
    <Form.Group isInvalid={!!error} controlId={controlId} className={compact ? 'mb-0' : undefined}>
      {compact
        ? <Form.Label className="sr-only">{label}</Form.Label>
        : <Form.Label>{label}</Form.Label>}
      {!compact && (
        // A plain input: a Form.Control here would take the group's id and steal the label from the select.
        <input
          type="search"
          className="form-control mb-2"
          value={search}
          placeholder={intl.formatMessage(messages.itemSearch)}
          aria-label={intl.formatMessage(messages.itemSearch)}
          disabled={disabled}
          onChange={(event) => setSearch(event.target.value)}
        />
      )}
      <Form.Control
        as="select"
        value={value ? encode(value) : ''}
        disabled={disabled}
        onChange={handleChange}
      >
        <option value="">{emptyLabel ?? intl.formatMessage(messages.itemPlaceholder)}</option>
        {extra && renderOption(extra)}
        {courseOptions.length > 0 && (
          <optgroup label={intl.formatMessage(messages.itemGroupCourses)}>
            {courseOptions.map(renderOption)}
          </optgroup>
        )}
        {programOptions.length > 0 && (
          <optgroup label={intl.formatMessage(messages.itemGroupPrograms)}>
            {programOptions.map(renderOption)}
          </optgroup>
        )}
      </Form.Control>
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
