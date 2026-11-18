/**
 * Picks one organization, for an organization code, with a single field: type to search, pick from the list.
 * The options are the organizations the Organizations page lists (useOrgFilterOptions), labelled with the Arabic
 * name in an Arabic panel. The search matches that name and the short name, in the browser.
 */
import { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useOrgFilterOptions } from '@src/modules/organizations/data/hooks';
import messages from '../messages';
import PickerField from './PickerField';
import type { PickerOption } from './PickerField';

export interface PickedOrganization {
  /** The organization short name, which the API takes. */
  shortName: string;
  name: string;
}

interface OrganizationPickerProps {
  controlId: string;
  value: PickedOrganization | null;
  onChange: (organization: PickedOrganization | null) => void;
  error?: string;
  help?: string;
}

const OrganizationPicker = ({
  controlId, value, onChange, error, help,
}: OrganizationPickerProps) => {
  const intl = useIntl();
  const [query, setQuery] = useState('');
  const all = useOrgFilterOptions(value?.shortName ?? '');
  const needle = query.toLowerCase();
  const matching = needle
    ? all.filter((option) => option.label.toLowerCase().includes(needle) || option.value.toLowerCase().includes(needle))
    : all;
  const options: PickerOption[] = matching.map((option) => ({
    key: option.value,
    name: option.label,
    code: option.value !== option.label ? option.value : undefined,
  }));

  return (
    <PickerField
      controlId={controlId}
      label={intl.formatMessage(messages.organizationLabel)}
      selectedName={value?.name}
      selectedKey={value?.shortName}
      placeholder={intl.formatMessage(messages.organizationSearch)}
      options={options}
      onQueryChange={setQuery}
      onPick={(key) => {
        const chosen = all.find((option) => option.value === key);
        if (chosen) { onChange({ shortName: chosen.value, name: chosen.label }); }
      }}
      onClear={() => onChange(null)}
      noResultsText={intl.formatMessage(messages.organizationNoResults)}
      clearText={intl.formatMessage(messages.itemClear)}
      error={error}
      help={help}
    />
  );
};

export default OrganizationPicker;
