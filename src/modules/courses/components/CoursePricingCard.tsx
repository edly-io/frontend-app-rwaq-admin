/**
 * Pricing controls for one course, on the admin course detail page.
 *
 * This is the only place `pricingManagedByAdmin` can be set. Studio's own
 * pricing section reads that flag and renders read-only when it is on, and the
 * Studio endpoint refuses writes regardless — so this card is where pricing
 * control actually lives, not just where it is displayed.
 */
import React, { useEffect, useState } from 'react';
import { Alert, Button, Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { useCoursePricing, useDeleteCoursePricing, useUpdateCoursePricing } from '../data/hooks';
import type { CoursePricingCategory } from '../data/types';
import { courseRoleMessages as messages } from '../messages';

interface CoursePricingCardProps {
  courseId: string;
}

/** 'free' is UI-only: the backend represents free as no pricing row. */
type UiCategory = 'free' | CoursePricingCategory;

const CoursePricingCard = ({ courseId }: CoursePricingCardProps) => {
  const intl = useIntl();
  const { data: pricing, isLoading } = useCoursePricing(courseId);
  const { mutateAsync: updatePricing, isPending: isUpdating } = useUpdateCoursePricing(courseId);
  const { mutateAsync: deletePricing, isPending: isDeleting } = useDeleteCoursePricing(courseId);
  const isPending = isUpdating || isDeleting;

  const [category, setCategory] = useState<UiCategory>('free');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [managedByAdmin, setManagedByAdmin] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!pricing) { return; }
    setCategory(pricing.pricingCategory ?? 'free');
    setPrice(pricing.price ?? '');
    setDiscount(pricing.discount ?? '');
    setManagedByAdmin(pricing.pricingManagedByAdmin);
  }, [pricing]);

  // Only a standalone paid course carries its own price: a free course has no
  // pricing row, and a course inside a paid program is sold via the program.
  const showPriceFields = category === 'is_paid';
  // No pricing row means no place to store the flag, so a free course cannot be locked.
  const isFree = category === 'free';
  const currency = pricing?.currency ?? 'SAR';
  // A course in a paid program is sold through the program, so its pricing is read-only here.
  const inPaidProgram = !!pricing?.partOfProgram;
  const isLocked = isLoading || isPending || inPaidProgram;

  const validate = (): string => {
    if (!showPriceFields) { return ''; }
    if (price.trim() === '') { return intl.formatMessage(messages.pricingErrorPriceRequired); }
    const p = Number(price);
    const d = discount.trim() === '' ? null : Number(discount);
    if (p < 0 || (d !== null && d < 0)) { return intl.formatMessage(messages.pricingErrorNegative); }
    if (d !== null && d > p) { return intl.formatMessage(messages.pricingErrorDiscountTooHigh); }
    return '';
  };

  const handleSave = async () => {
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      setSaved(false);
      return;
    }
    setError('');
    try {
      if (isFree) {
        // 'free' has no backend category: a free course is one with no row.
        await deletePricing();
      } else {
        await updatePricing({
          pricingCategory: category,
          price: showPriceFields ? price.trim() : null,
          discount: !showPriceFields || discount.trim() === '' ? null : discount.trim(),
          pricingManagedByAdmin: managedByAdmin,
        });
      }
      setSaved(true);
    } catch (err) {
      logError(err);
      setError(intl.formatMessage(messages.pricingErrorSaveFailed));
      setSaved(false);
    }
  };

  /** Clear the saved/error banners whenever the admin edits a field. */
  const touched = () => {
    setSaved(false);
    setError('');
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

      {inPaidProgram && (
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

      <Form.Group>
        <Form.Label>{intl.formatMessage(messages.pricingCategoryLabel)}</Form.Label>
        <Form.Control
          as="select"
          value={category}
          disabled={isLocked}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setCategory(e.target.value as UiCategory);
            touched();
          }}
        >
          <option value="free">{intl.formatMessage(messages.pricingFree)}</option>
          <option value="is_paid">{intl.formatMessage(messages.pricingPaid)}</option>
          <option value="is_within_program">{intl.formatMessage(messages.pricingWithinProgram)}</option>
        </Form.Control>
      </Form.Group>

      {category === 'is_within_program' && !inPaidProgram && (
        <p className="small text-muted">
          {intl.formatMessage(messages.pricingWithinProgramHint)}
        </p>
      )}

      {showPriceFields && (
        <>
          <Form.Group>
            <Form.Label>{intl.formatMessage(messages.pricingPriceLabel, { currency })}</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={price}
              disabled={isLocked}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setPrice(e.target.value); touched(); }}
            />
          </Form.Group>

          <Form.Group>
            <Form.Label>{intl.formatMessage(messages.pricingDiscountLabel, { currency })}</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={discount}
              disabled={isLocked}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDiscount(e.target.value); touched(); }}
            />
            <Form.Text muted>{intl.formatMessage(messages.pricingDiscountHint)}</Form.Text>
          </Form.Group>
        </>
      )}

      <Form.Group controlId="pricing-managed-by-admin">
        <Form.Checkbox
          name="pricingManagedByAdmin"
          checked={managedByAdmin && !isFree}
          disabled={isLocked || isFree}
          description={intl.formatMessage(isFree ? messages.pricingManagedFreeHint : messages.pricingManagedHint)}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setManagedByAdmin(e.target.checked); touched(); }}
        >
          {intl.formatMessage(messages.pricingManagedLabel)}
        </Form.Checkbox>
      </Form.Group>

      {!inPaidProgram && (
        <Button variant="primary" size="sm" onClick={handleSave} disabled={isLoading || isPending}>
          {intl.formatMessage(isPending ? messages.pricingSaving : messages.pricingSave)}
        </Button>
      )}
    </div>
  );
};

export default CoursePricingCard;
