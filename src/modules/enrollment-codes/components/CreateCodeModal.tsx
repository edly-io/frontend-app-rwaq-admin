/**
 * Create an enrollment code, modeled on the legacy Create Coupon form.
 *
 * Code: typed (6 to 8 letters and numbers, uppercased as you type) or generated with the Generate button.
 * Left empty, the backend generates one. Course or program: one, of type Enrollment code. From a course or
 * program page the item is fixed and the picker is skipped. Usage: unchecked is a single use, checked asks
 * for a number. Expiry is optional. The backend's refusals show on the field they name.
 */
import { useEffect, useState } from 'react';
import { Badge, Button, Form } from '@openedx/paragon';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import FormModal from '@src/components/FormModal';
import { useCreateEnrollmentCode } from '../data/hooks';
import type { EnrollmentCode, ItemKind } from '../data/types';
import messages from '../messages';
import { readCodeError } from './codeErrors';
import ItemPicker from './ItemPicker';
import type { PickedItem } from './ItemPicker';

/** No 0, O, 1, I or L, which are mistaken for each other when a code is read out or copied by hand. */
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const GENERATED_LENGTH = 6;
const CODE_PATTERN = /^[A-Z0-9]{6,8}$/;

export const generateCode = (): string => {
  const values = new Uint32Array(GENERATED_LENGTH);
  if (window.crypto?.getRandomValues) {
    window.crypto.getRandomValues(values);
  } else {
    values.forEach((_, index) => { values[index] = Math.floor(Math.random() * 2 ** 32); });
  }
  return Array.from(values, (value) => CODE_ALPHABET[value % CODE_ALPHABET.length]).join('');
};

type FormField = 'code' | 'item' | 'maxUses' | 'expiresAt';
type FieldErrors = Partial<Record<FormField, string>>;

const BACKEND_FIELDS: Record<string, FormField> = {
  code: 'code',
  course_id: 'item',
  program_uuid: 'item',
  max_uses: 'maxUses',
  expires_at: 'expiresAt',
};

interface CreateCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Set from a course or program page: the code is for this item and the picker is skipped. */
  fixedItem?: PickedItem;
  onCreated: (code: EnrollmentCode) => void;
}

export const KindTag = ({ kind }: { kind: ItemKind }) => {
  const intl = useIntl();
  return (
    <Badge variant="light" className="ml-2">
      {intl.formatMessage(kind === 'course' ? messages.kindCourse : messages.kindProgram)}
    </Badge>
  );
};

const CreateCodeModal = ({
  isOpen, onClose, fixedItem, onCreated,
}: CreateCodeModalProps) => {
  const intl = useIntl();
  const mutation = useCreateEnrollmentCode();

  const [code, setCode] = useState('');
  const [picked, setPicked] = useState<PickedItem | null>(null);
  const [multiple, setMultiple] = useState(false);
  const [maxUses, setMaxUses] = useState('2');
  const [expiresAt, setExpiresAt] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCode('');
      setPicked(null);
      setMultiple(false);
      setMaxUses('2');
      setExpiresAt('');
      setFieldErrors({});
      setError('');
    }
  }, [isOpen]);

  const item = fixedItem ?? picked;
  const clear = (field: FormField) => setFieldErrors((prev) => ({ ...prev, [field]: undefined }));

  const validate = (): FieldErrors => {
    const errors: FieldErrors = {};
    if (code && !CODE_PATTERN.test(code)) { errors.code = intl.formatMessage(messages.codeInvalid); }
    if (!item) { errors.item = intl.formatMessage(messages.itemRequired); }
    if (multiple && !(Number.isInteger(Number(maxUses)) && Number(maxUses) >= 1)) {
      errors.maxUses = intl.formatMessage(messages.maxUsesInvalid);
    }
    return errors;
  };

  const handleSubmit = async (event?: React.FormEvent<HTMLFormElement>) => {
    event?.preventDefault();
    const errors = validate();
    setFieldErrors(errors);
    setError('');
    if (Object.keys(errors).length > 0 || !item) { return; }
    try {
      const created = await mutation.mutateAsync({
        code: code || undefined,
        ...(item.kind === 'course' ? { courseId: item.id } : { programUuid: item.id }),
        maxUses: multiple ? Number(maxUses) : 1,
        expiresAt: expiresAt || undefined,
      });
      onClose();
      onCreated(created);
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
      title={intl.formatMessage(messages.createTitle)}
      isOpen={isOpen}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={intl.formatMessage(messages.createSubmit)}
      cancelLabel={intl.formatMessage(messages.cancel)}
      isSubmitting={mutation.isPending}
    >
      {error && <p className="text-danger small">{error}</p>}

      <Form.Group isInvalid={!!fieldErrors.code} controlId="enrollment-code-code">
        <Form.Label>{intl.formatMessage(messages.codeLabel)}</Form.Label>
        <div className="d-flex align-items-start gap-2">
          <Form.Control
            value={code}
            maxLength={8}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            className="text-uppercase"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setCode(event.target.value.toUpperCase());
              clear('code');
            }}
          />
          <Button
            variant="outline-primary"
            type="button"
            className="flex-shrink-0 ml-2"
            onClick={() => { setCode(generateCode()); clear('code'); }}
          >
            {intl.formatMessage(messages.generate)}
          </Button>
        </div>
        {fieldErrors.code
          ? <Form.Control.Feedback type="invalid">{fieldErrors.code}</Form.Control.Feedback>
          : <Form.Text muted>{intl.formatMessage(messages.codeHelp)}</Form.Text>}
      </Form.Group>

      {fixedItem ? (
        <Form.Group>
          <Form.Label>{intl.formatMessage(messages.itemLabel)}</Form.Label>
          <div>
            {fixedItem.name}
            <KindTag kind={fixedItem.kind} />
          </div>
        </Form.Group>
      ) : (
        <ItemPicker
          controlId="enrollment-code-item"
          label={intl.formatMessage(messages.itemLabel)}
          value={picked}
          onChange={(next) => { setPicked(next); clear('item'); }}
          error={fieldErrors.item}
          help={intl.formatMessage(messages.itemHelp)}
        />
      )}

      <Form.Group controlId="enrollment-code-multiple">
        <Form.Checkbox
          checked={multiple}
          onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setMultiple(event.target.checked); clear('maxUses'); }}
          description={intl.formatMessage(messages.multiUsageHelp)}
        >
          {intl.formatMessage(messages.multiUsage)}
        </Form.Checkbox>
      </Form.Group>
      {multiple && (
        <Form.Group isInvalid={!!fieldErrors.maxUses} controlId="enrollment-code-max-uses">
          <Form.Label>{intl.formatMessage(messages.maxUsesLabel)}</Form.Label>
          <Form.Control
            type="number"
            min={1}
            step={1}
            value={maxUses}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => { setMaxUses(event.target.value); clear('maxUses'); }}
          />
          {fieldErrors.maxUses && <Form.Control.Feedback type="invalid">{fieldErrors.maxUses}</Form.Control.Feedback>}
        </Form.Group>
      )}

      <Form.Group isInvalid={!!fieldErrors.expiresAt} controlId="enrollment-code-expires">
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
    </FormModal>
  );
};

export default CreateCodeModal;
