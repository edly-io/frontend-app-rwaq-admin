/**
 * Course type and price for one course, on the admin course detail page.
 *
 * This is the only place `pricingManagedByAdmin` can be set. When it is on,
 * Studio shows the course team the pricing fields read-only. The lock never
 * applies here: the admin can always change the type and price.
 *
 * The backend refuses a type change while the course is in a program, and for
 * a free course that learners already joined. Those refusals come back as
 * `{ detail, field? }` and are shown as they are.
 */
import React, { useEffect, useState } from 'react';
import { Alert, Button, Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { useCoursePricing, useUpdateCoursePricing } from '../data/hooks';
import type { CoursePricingCategory } from '../data/types';
import { courseRoleMessages as messages } from '../messages';

interface CoursePricingCardProps {
  courseId: string;
}

type PricingField = 'pricingCategory' | 'price' | 'discount';
type FieldErrors = Partial<Record<PricingField, string>>;

/** Backend `field` values, mapped to the form field they belong to. */
const BACKEND_FIELDS: Record<string, PricingField> = {
  pricing_category: 'pricingCategory',
  price: 'price',
  discount: 'discount',
};

const CoursePricingCard = ({ courseId }: CoursePricingCardProps) => {
  const intl = useIntl();
  const { data: pricing, isLoading } = useCoursePricing(courseId);
  const { mutateAsync: updatePricing, isPending } = useUpdateCoursePricing(courseId);

  // null means no type was chosen yet, so no radio is selected.
  const [category, setCategory] = useState<CoursePricingCategory | null>(null);
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [managedByAdmin, setManagedByAdmin] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!pricing) { return; }
    setCategory(pricing.pricingCategory);
    setPrice(pricing.price ?? '');
    setDiscount(pricing.discount ?? '');
    setManagedByAdmin(pricing.pricingManagedByAdmin);
  }, [pricing]);

  // Only a paid course is sold on its own, so only it carries a price.
  const showPriceFields = category === 'is_paid';
  const currency = pricing?.currency ?? 'SAR';
  // The backend refuses a type change while the course is in a program.
  const inProgram = !!pricing?.partOfProgram;
  const isBusy = isLoading || isPending;

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
    const priceError = showPriceFields ? validatePrice() : '';
    const discountError = showPriceFields ? validateDiscount() : '';
    setFieldErrors({ price: priceError || undefined, discount: discountError || undefined });
    if (priceError || discountError) {
      setSaved(false);
      return;
    }
    setError('');
    try {
      await updatePricing({
        // A course with no type yet keeps none until the admin picks one.
        ...(category ? { pricingCategory: category } : {}),
        ...(showPriceFields ? {
          price: price.trim(),
          discount: discount.trim() === '' ? null : discount.trim(),
        } : {}),
        pricingManagedByAdmin: managedByAdmin,
      });
      setSaved(true);
    } catch (err) {
      logError(err);
      const data = (err as { response?: { data?: { detail?: string; field?: string } } })?.response?.data;
      const detail = data?.detail || intl.formatMessage(messages.pricingErrorSaveFailed);
      const field = data?.field ? BACKEND_FIELDS[data.field] : undefined;
      if (field) {
        setFieldError(field, detail);
      } else {
        setError(detail);
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
        <h2 className="rwaq-section-title mb-1">
          {intl.formatMessage(messages.pricingSectionTitle)}
        </h2>
        <p className="text-muted small mb-0">
          {intl.formatMessage(messages.pricingSectionDescription)}
        </p>
      </div>

      {inProgram && (
        <Alert variant="info" className="mb-3">
          {intl.formatMessage(messages.pricingPartOfProgramNotice, {
            program: pricing?.partOfProgramName ?? pricing?.partOfProgram,
          })}
        </Alert>
      )}
      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      {saved && !error && (
        <Alert variant="success" className="mb-3">{intl.formatMessage(messages.pricingSaved)}</Alert>
      )}

      <Form.Group isInvalid={!!fieldErrors.pricingCategory}>
        <Form.Label className="sr-only">{intl.formatMessage(messages.pricingSectionTitle)}</Form.Label>
        <Form.RadioSet
          name="pricingCategory"
          value={category ?? ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setCategory(e.target.value as CoursePricingCategory);
            touched('pricingCategory');
          }}
        >
          <Form.Radio
            value="is_free"
            disabled={isBusy || inProgram}
            description={intl.formatMessage(messages.pricingFreeDescription)}
          >
            {intl.formatMessage(messages.pricingFree)}
          </Form.Radio>
          <Form.Radio
            value="is_paid"
            disabled={isBusy || inProgram}
            description={intl.formatMessage(messages.pricingPaidDescription)}
          >
            {intl.formatMessage(messages.pricingPaid)}
          </Form.Radio>
          <Form.Radio
            value="is_program_only"
            disabled={isBusy || inProgram}
            description={intl.formatMessage(messages.pricingProgramOnlyDescription)}
          >
            {intl.formatMessage(messages.pricingProgramOnly)}
          </Form.Radio>
        </Form.RadioSet>
        {fieldErrors.pricingCategory && (
          <Form.Control.Feedback type="invalid">{fieldErrors.pricingCategory}</Form.Control.Feedback>
        )}
      </Form.Group>

      {showPriceFields && (
        <>
          <Form.Group isInvalid={!!fieldErrors.price} controlId="course-pricing-price">
            <Form.Label>{intl.formatMessage(messages.pricingPriceLabel, { currency })}</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={price}
              disabled={isBusy}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPrice(e.target.value); touched('price'); }}
              onBlur={() => setFieldError('price', validatePrice())}
            />
            {fieldErrors.price && (
              <Form.Control.Feedback type="invalid">{fieldErrors.price}</Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group isInvalid={!!fieldErrors.discount} controlId="course-pricing-discount">
            <Form.Label>{intl.formatMessage(messages.pricingDiscountLabel, { currency })}</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={discount}
              disabled={isBusy}
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
        </>
      )}

      <Form.Group controlId="pricing-managed-by-admin">
        <Form.Checkbox
          name="pricingManagedByAdmin"
          checked={managedByAdmin}
          disabled={isBusy}
          description={intl.formatMessage(messages.pricingManagedHint)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setManagedByAdmin(e.target.checked); touched(); }}
        >
          {intl.formatMessage(messages.pricingManagedLabel)}
        </Form.Checkbox>
      </Form.Group>

      <Button variant="primary" size="sm" onClick={handleSave} disabled={isBusy}>
        {intl.formatMessage(isPending ? messages.pricingSaving : messages.pricingSave)}
      </Button>
    </div>
  );
};

export default CoursePricingCard;
