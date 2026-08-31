/**
 * The reason for an enrollment change.
 *
 * The API requires a reason on every write, and it lands in the audit trail
 * other admins read later. A plain free-text box makes that trail unqueryable
 * ("fin aid", "financial aid", "FA" are three answers to one question); a
 * closed list makes it a lie whenever none of the options fit. So: presets,
 * plus an explicit escape hatch.
 *
 * The presets live here rather than in the API because they are user-facing
 * copy on an Arabic-first platform — this is the layer with a translation
 * pipeline, and adding one shouldn't need a backend deploy.
 */
import { Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages, { enrollmentPresetMessages as presetMessages } from '../messages';

/**
 * The presets, each a stable English value paired with a translated label.
 *
 * The value is what reaches the audit trail, and it is deliberately *not* the
 * translated label: an Arabic admin and an English admin picking the same
 * preset must write the same string, or the trail becomes unqueryable in
 * exactly the way presets exist to prevent.
 */
const PRESETS = [
  { value: 'Financial assistance', message: presetMessages.financialAssistance },
  { value: 'Learner support request', message: presetMessages.supportRequest },
  { value: 'Enrollment correction', message: presetMessages.correction },
  { value: 'Partner agreement', message: presetMessages.partnerAgreement },
  { value: 'Testing / QA', message: presetMessages.testing },
];

/** The sentinel that reveals the free-text box. Not a reason itself. */
export const REASON_OTHER = '__other__';

const MAX_REASON = 255;

export interface ReasonValues {
  reasonPreset: string;
  reasonCustom: string;
}

export const emptyReason: ReasonValues = { reasonPreset: '', reasonCustom: '' };

/**
 * The reason actually sent to the API.
 *
 * Trimmed, because a reason of spaces passes a naive required-check and then
 * reads as blank in the audit trail.
 */
export const resolveReason = (values: ReasonValues): string => (
  values.reasonPreset === REASON_OTHER
    ? values.reasonCustom.trim()
    : values.reasonPreset
);

/** Whether the form has a usable reason — the guard before submitting. */
export const hasReason = (values: ReasonValues): boolean => resolveReason(values).length > 0;

interface ReasonFieldProps {
  values: ReasonValues;
  onChange: (next: ReasonValues) => void;
  /** Shown under whichever control is at fault, once the admin has tried. */
  error?: string;
}

const ReasonField = ({ values, onChange, error }: ReasonFieldProps) => {
  const intl = useIntl();
  const isOther = values.reasonPreset === REASON_OTHER;
  // A preset is chosen or it isn't; the custom box only exists once "other" is.
  const presetError = error && !isOther ? error : undefined;
  const customError = error && isOther ? error : undefined;

  return (
    <>
      <Form.Group isInvalid={Boolean(presetError)}>
        <Form.Label>{intl.formatMessage(messages.reasonLabel)}</Form.Label>
        <Form.Control
          as="select"
          value={values.reasonPreset}
          onChange={(event: React.ChangeEvent<HTMLSelectElement>) => onChange({
            ...values,
            reasonPreset: event.target.value,
            // Clearing the custom text when leaving "other" keeps a stale
            // sentence from being resurrected by re-selecting it.
            reasonCustom: event.target.value === REASON_OTHER ? values.reasonCustom : '',
          })}
        >
          <option value="">{intl.formatMessage(messages.reasonSelect)}</option>
          {PRESETS.map((preset) => (
            <option key={preset.value} value={preset.value}>
              {intl.formatMessage(preset.message)}
            </option>
          ))}
          <option value={REASON_OTHER}>{intl.formatMessage(messages.reasonOther)}</option>
        </Form.Control>
        {presetError
          ? <Form.Control.Feedback type="invalid">{presetError}</Form.Control.Feedback>
          : <Form.Control.Feedback>{intl.formatMessage(messages.reasonHelp)}</Form.Control.Feedback>}
      </Form.Group>

      {isOther && (
        <Form.Group isInvalid={Boolean(customError)}>
          <Form.Label>{intl.formatMessage(messages.reasonOtherLabel)}</Form.Label>
          <Form.Control
            value={values.reasonCustom}
            maxLength={MAX_REASON}
            autoFocus
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => onChange({
              ...values,
              reasonCustom: event.target.value,
            })}
          />
          {customError && (
            <Form.Control.Feedback type="invalid">{customError}</Form.Control.Feedback>
          )}
        </Form.Group>
      )}
    </>
  );
};

export default ReasonField;
