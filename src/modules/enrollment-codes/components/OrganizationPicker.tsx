/**
 * Picks one organization, for an organization code. The options are the organizations the Organizations
 * page lists (useOrgFilterOptions), labelled with the Arabic name in an Arabic panel.
 */
import { Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { useOrgFilterOptions } from '@src/modules/organizations/data/hooks';
import messages from '../messages';

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
  const options = useOrgFilterOptions(value?.shortName ?? '');

  return (
    <Form.Group isInvalid={!!error} controlId={controlId}>
      <Form.Label>{intl.formatMessage(messages.organizationLabel)}</Form.Label>
      <Form.Control
        as="select"
        value={value?.shortName ?? ''}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
          const chosen = options.find((option) => option.value === event.target.value);
          onChange(chosen ? { shortName: chosen.value, name: chosen.label } : null);
        }}
      >
        <option value="">{intl.formatMessage(messages.organizationPlaceholder)}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </Form.Control>
      {error && <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>}
      {!error && help && <Form.Text muted>{help}</Form.Text>}
    </Form.Group>
  );
};

export default OrganizationPicker;
