/**
 * Picks one course or program of type Enrollment code with a single field: type to search, pick from the list.
 * The search matches the name and the id (course key or program key) on the server. Courses and programs are
 * listed in two groups. Only items of that type can have codes, so only they are offered.
 */
import { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useCourses } from '@src/modules/courses/data/hooks';
import { usePrograms } from '@src/modules/programs/data/hooks';
import type { ItemKind } from '../data/types';
import messages from '../messages';
import PickerField from './PickerField';
import type { PickerOption } from './PickerField';
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

const LIST_SIZE = 50;

const encode = (item: { kind: ItemKind | 'organization'; id: string }) => `${item.kind}:${item.id}`;

const ItemPicker = ({
  controlId, label, value, onChange, emptyLabel, error, help, disabled, compact = false, kinds = ['course', 'program'],
}: ItemPickerProps) => {
  const intl = useIntl();
  const [query, setQuery] = useState('');
  const term = useDebounced(query);

  const withCourses = kinds.includes('course');
  const withPrograms = kinds.includes('program');
  const courses = useCourses({
    courseType: 'enrollment_code', search: term || undefined, ordering: 'display_name', pageSize: LIST_SIZE,
  });
  const programs = usePrograms({
    pricing: 'enrollment_code', search: term || undefined, ordering: 'name', pageSize: LIST_SIZE,
  });

  const items: (PickedItem & { code: string; group: string })[] = [
    ...(withCourses ? courses.data?.results ?? [] : []).map((course) => ({
      kind: 'course' as const,
      id: course.courseId,
      name: course.displayName,
      code: course.courseId,
      group: intl.formatMessage(messages.itemGroupCourses),
    })),
    ...(withPrograms ? programs.data?.results ?? [] : []).map((program) => ({
      kind: 'program' as const,
      id: program.uuid,
      name: program.name,
      code: program.programKey ?? '',
      group: intl.formatMessage(messages.itemGroupPrograms),
    })),
  ];
  const options: PickerOption[] = items.map((item) => ({
    key: encode(item), name: item.name, code: item.code, group: item.group,
  }));
  const loadFailed = (withCourses && courses.isError) || (withPrograms && programs.isError);

  return (
    <PickerField
      controlId={controlId}
      label={label}
      compact={compact}
      selectedName={value?.name}
      selectedKey={value ? encode(value) : undefined}
      placeholder={emptyLabel ?? intl.formatMessage(messages.itemSearch)}
      options={options}
      onQueryChange={setQuery}
      onPick={(key) => {
        const chosen = items.find((item) => encode(item) === key);
        if (chosen) { onChange({ kind: chosen.kind, id: chosen.id, name: chosen.name }); }
      }}
      onClear={() => onChange(null)}
      noResultsText={intl.formatMessage(messages.itemNoResults)}
      clearText={intl.formatMessage(messages.itemClear)}
      error={error}
      help={help}
      loadFailedText={loadFailed ? intl.formatMessage(messages.itemLoadFailed) : undefined}
      disabled={disabled}
    />
  );
};

export default ItemPicker;
