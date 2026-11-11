/**
 * Edit an enrollment code. The code text and the course or program are read-only. The limit cannot go below
 * the uses so far (checked here and by the backend). Expiry and on/off can change.
 * Only the fields that changed are sent.
 */
import { useEffect, useState } from 'react';
import { Form } from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import FormModal from '@src/components/FormModal';
import { useToast } from '@src/components/ToastContext';
import { useUpdateEnrollmentCode } from '../data/hooks';
import type { CodePatch, EnrollmentCode } from '../data/types';
import messages from '../messages';
import { readCodeError } from './codeErrors';
import { toDateInput } from './codeDates';
import { KindTag } from './CreateCodeModal';

type FormField = 'maxUses' | 'expiresAt';
type FieldErrors = Partial<Record<FormField, string>>;

const BACKEND_FIELDS: Record<string, FormField> = { max_uses: 'maxUses', expires_at: 'expiresAt' };

interface EditCodeModalProps {
  code: EnrollmentCode | null;
  onClose: () => void;
}

const EditCodeModal = ({ code, onClose }: EditCodeModalProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const mutation = useUpdateEnrollmentCode();

  const [maxUses, setMaxUses] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (code) {
      setMaxUses(String(code.maxUses));
      setExpiresAt(toDateInput(code.expiresAt));
      setIsActive(code.isActive);
      setFieldErrors({});
      setError('');
    }
  }, [code]);

  if (!code) { return null; }

  const clear = (field: FormField) => setFieldErrors((prev) => ({ ...prev, [field]: undefined }));

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const limit = Number(maxUses);
    const errors: FieldErrors = {};
    if (!Number.isInteger(limit) || limit < 1) {
      errors.maxUses = intl.formatMessage(messages.maxUsesInvalid);
    } else if (limit < code.usesCount) {
      errors.maxUses = intl.formatMessage(messages.maxUsesBelowUses, { used: code.usesCount });
    }
    setFieldErrors(errors);
    setError('');
    if (Object.keys(errors).length > 0) { return; }

    const patch: CodePatch = {};
    if (limit !== code.maxUses) { patch.maxUses = limit; }
    if (expiresAt !== toDateInput(code.expiresAt)) { patch.expiresAt = expiresAt || null; }
    if (isActive !== code.isActive) { patch.isActive = isActive; }
    if (Object.keys(patch).length === 0) { onClose(); return; }
    try {
      await mutation.mutateAsync({ id: code.id, patch });
      showToast(intl.formatMessage(messages.saved));
      onClose();
    } catch (err) {
      logError(err);
      const { detail, field } = readCodeError(err);
      const message = detail ?? intl.formatMessage(messages.saveFailed);
      const formField = field ? BACKEND_FIELDS[field] : undefined;
      if (formField) { setFieldErrors({ [formField]: message }); } else { setError(message); }
    }
  };

  return (
    <FormModal
      title={intl.formatMessage(messages.editTitle)}
      isOpen
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={intl.formatMessage(messages.editSubmit)}
      cancelLabel={intl.formatMessage(messages.cancel)}
      isSubmitting={mutation.isPending}
    >
      {error && <p className="text-danger small">{error}</p>}

      <Form.Group controlId="enrollment-code-edit-code">
        <Form.Label>{intl.formatMessage(messages.codeLabel)}</Form.Label>
        <Form.Control value={code.code} readOnly />
      </Form.Group>

      <Form.Group>
        <Form.Label>{intl.formatMessage(messages.itemLabel)}</Form.Label>
        <div>
          {code.item.name}
          <KindTag kind={code.item.kind} />
        </div>
        <Form.Text muted>{intl.formatMessage(messages.editReadOnlyNote)}</Form.Text>
      </Form.Group>

      <Form.Group isInvalid={!!fieldErrors.maxUses} controlId="enrollment-code-edit-max-uses">
        <Form.Label>{intl.formatMessage(messages.maxUsesLabel)}</Form.Label>
        <Form.Control
          type="number"
          min={Math.max(1, code.usesCount)}
          step={1}
          value={maxUses}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setMaxUses(event.target.value); clear('maxUses'); }}
        />
        {fieldErrors.maxUses
          ? <Form.Control.Feedback type="invalid">{fieldErrors.maxUses}</Form.Control.Feedback>
          : <Form.Text muted>{intl.formatMessage(messages.usedSoFar, { used: code.usesCount })}</Form.Text>}
      </Form.Group>

      <Form.Group isInvalid={!!fieldErrors.expiresAt} controlId="enrollment-code-edit-expires">
        <Form.Label>{intl.formatMessage(messages.expiresLabel)}</Form.Label>
        <Form.Control
          type="date"
          value={expiresAt}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setExpiresAt(event.target.value); clear('expiresAt'); }}
        />
        {fieldErrors.expiresAt
          ? <Form.Control.Feedback type="invalid">{fieldErrors.expiresAt}</Form.Control.Feedback>
          : <Form.Text muted>{intl.formatMessage(messages.expiresHelp)}</Form.Text>}
      </Form.Group>

      <Form.Group controlId="enrollment-code-edit-active">
        <Form.Switch
          checked={isActive}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => setIsActive(event.target.checked)}
          helperText={intl.formatMessage(messages.activeHelp)}
        >
          {intl.formatMessage(messages.activeLabel)}
        </Form.Switch>
      </Form.Group>
    </FormModal>
  );
};

export default EditCodeModal;
