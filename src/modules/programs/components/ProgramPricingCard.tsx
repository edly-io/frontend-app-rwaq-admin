/**
 * Pricing controls for one program, on the admin program detail page.
 *
 * Same rules as the Studio program page, enforced by the shared backend
 * validation: a paid program needs a price above 0, and the sale price must be
 * below it. Switching back to Free clears both prices. The backend reports
 * refusals as DRF field errors, shown on the field they name.
 *
 * This is the only place pricingManagedByAdmin can be set. Org admins can still
 * change pricing while it is on.
 */
import React, { useEffect, useState } from 'react';
import { Alert, Button, Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { getErrorReason } from '@src/data/httpError';
import { useUpdateProgram } from '../data/hooks';
import type { ProgramDetail, ProgramPricingCategory } from '../data/types';
import messages from '../messages';

interface ProgramPricingCardProps {
  program: ProgramDetail;
}

type PricingField = 'pricingCategory' | 'price' | 'discount';
type FieldErrors = Partial<Record<PricingField, string>>;

/** DRF error keys, mapped to the form field they belong to. */
const BACKEND_FIELDS: Record<string, PricingField> = {
  pricing_category: 'pricingCategory',
  price: 'price',
  discount: 'discount',
};

const ProgramPricingCard = ({ program }: ProgramPricingCardProps) => {
  const intl = useIntl();
  const { mutateAsync, isPending } = useUpdateProgram(program.uuid);

  const [category, setCategory] = useState<ProgramPricingCategory>('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [managedByAdmin, setManagedByAdmin] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCategory(program.pricingCategory ?? '');
    setPrice(program.price ?? '');
    setDiscount(program.discount ?? '');
    setManagedByAdmin(program.pricingManagedByAdmin ?? false);
  }, [program.pricingCategory, program.price, program.discount, program.pricingManagedByAdmin]);

  const isPaid = category === 'is_paid';
  const currency = program.currency || 'SAR';

  const validatePrice = (): string => {
    if (price.trim() === '') { return intl.formatMessage(messages.pricingErrorPriceRequired); }
    if (!(Number(price) > 0)) { return intl.formatMessage(messages.pricingErrorPriceNotPositive); }
    return '';
  };

  const validateDiscount = (): string => {
    if (discount.trim() === '') { return ''; }
    const d = Number(discount);
    if (d < 0) { return intl.formatMessage(messages.pricingErrorNegative); }
    if (price.trim() !== '' && d >= Number(price)) {
      return intl.formatMessage(messages.pricingErrorDiscountNotLower);
    }
    return '';
  };

  const setFieldError = (field: PricingField, message: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: message || undefined }));
  };

  const handleSave = async () => {
    const priceError = isPaid ? validatePrice() : '';
    const discountError = isPaid ? validateDiscount() : '';
    setFieldErrors({ price: priceError || undefined, discount: discountError || undefined });
    if (priceError || discountError) {
      setSaved(false);
      return;
    }
    setError('');
    try {
      await mutateAsync({
        pricingCategory: category,
        price: isPaid ? price.trim() : null,
        discount: isPaid && discount.trim() !== '' ? discount.trim() : null,
        pricingManagedByAdmin: managedByAdmin,
      });
      setSaved(true);
    } catch (err) {
      logError(err);
      const data = (err as { response?: { data?: Record<string, unknown> } })?.response?.data ?? {};
      const errors: FieldErrors = {};
      Object.entries(data).forEach(([key, value]) => {
        const field = BACKEND_FIELDS[key];
        if (field) { errors[field] = Array.isArray(value) ? String(value[0]) : String(value); }
      });
      if (Object.keys(errors).length) {
        setFieldErrors(errors);
      } else {
        setError(getErrorReason(err) ?? intl.formatMessage(messages.pricingErrorSaveFailed));
      }
      setSaved(false);
    }
  };

  /** Clear the saved/error banners whenever the admin edits a field. */
  const touched = (field?: PricingField) => {
    setSaved(false);
    setError('');
    if (field) { setFieldError(field, ''); }
  };

  return (
    <div className="rwaq-card">
      <div className="mb-4">
        <h2 className="rwaq-section-title mb-1">{intl.formatMessage(messages.pricingTitle)}</h2>
        <p className="text-muted small mb-0">{intl.formatMessage(messages.pricingDescription)}</p>
      </div>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      {saved && !error && (
        <Alert variant="success" className="mb-3">{intl.formatMessage(messages.pricingSaved)}</Alert>
      )}

      <Form.Group isInvalid={!!fieldErrors.pricingCategory} controlId="program-pricing-category">
        <Form.Label>{intl.formatMessage(messages.pricingCategoryLabel)}</Form.Label>
        <Form.Control
          as="select"
          value={category}
          disabled={isPending}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setCategory(e.target.value as ProgramPricingCategory);
            touched('pricingCategory');
          }}
        >
          <option value="">{intl.formatMessage(messages.pricingFree)}</option>
          <option value="is_paid">{intl.formatMessage(messages.pricingPaid)}</option>
        </Form.Control>
        {fieldErrors.pricingCategory && (
          <Form.Control.Feedback type="invalid">{fieldErrors.pricingCategory}</Form.Control.Feedback>
        )}
      </Form.Group>

      {isPaid && (
        <>
          <Form.Group isInvalid={!!fieldErrors.price} controlId="program-pricing-price">
            <Form.Label>{intl.formatMessage(messages.pricingPriceLabel, { currency })}</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={price}
              disabled={isPending}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPrice(e.target.value); touched('price'); }}
              onBlur={() => setFieldError('price', validatePrice())}
            />
            {fieldErrors.price && (
              <Form.Control.Feedback type="invalid">{fieldErrors.price}</Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group isInvalid={!!fieldErrors.discount} controlId="program-pricing-discount">
            <Form.Label>{intl.formatMessage(messages.pricingDiscountLabel, { currency })}</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={discount}
              disabled={isPending}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setDiscount(e.target.value);
                touched('discount');
              }}
              onBlur={() => setFieldError('discount', validateDiscount())}
            />
            {fieldErrors.discount
              ? <Form.Control.Feedback type="invalid">{fieldErrors.discount}</Form.Control.Feedback>
              : <Form.Text muted>{intl.formatMessage(messages.pricingDiscountHint)}</Form.Text>}
          </Form.Group>

          <p className="small text-muted">{intl.formatMessage(messages.pricingCoursesNote)}</p>
        </>
      )}

      <Form.Group controlId="program-pricing-managed-by-admin">
        <Form.Checkbox
          name="pricingManagedByAdmin"
          checked={managedByAdmin}
          disabled={isPending}
          description={intl.formatMessage(messages.pricingManagedHint)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setManagedByAdmin(e.target.checked); touched(); }}
        >
          {intl.formatMessage(messages.pricingManagedLabel)}
        </Form.Checkbox>
      </Form.Group>

      <Button variant="primary" size="sm" onClick={handleSave} disabled={isPending}>
        {intl.formatMessage(isPending ? messages.pricingSaving : messages.pricingSave)}
      </Button>
    </div>
  );
};

export default ProgramPricingCard;
