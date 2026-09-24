/**
 * Pricing controls for one program, on the admin program detail page.
 *
 * Same rules as the Studio program page, enforced by the shared backend
 * validation: a paid program needs a price, and the discounted price cannot be
 * above it. Switching back to Free clears both prices.
 */
import React, { useEffect, useState } from 'react';
import { Alert, Button, Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { useUpdateProgram } from '../data/hooks';
import type { ProgramDetail, ProgramPricingCategory } from '../data/types';
import messages from '../messages';

interface ProgramPricingCardProps {
  program: ProgramDetail;
}

const ProgramPricingCard = ({ program }: ProgramPricingCardProps) => {
  const intl = useIntl();
  const { mutateAsync, isPending } = useUpdateProgram(program.uuid);

  const [category, setCategory] = useState<ProgramPricingCategory>('');
  const [price, setPrice] = useState('');
  const [discount, setDiscount] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setCategory(program.pricingCategory ?? '');
    setPrice(program.price ?? '');
    setDiscount(program.discount ?? '');
  }, [program.pricingCategory, program.price, program.discount]);

  const isPaid = category === 'is_paid';
  const currency = program.currency || 'SAR';

  const validate = (): string => {
    if (!isPaid) { return ''; }
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
      await mutateAsync({
        pricingCategory: category,
        price: isPaid ? price.trim() : null,
        discount: isPaid && discount.trim() !== '' ? discount.trim() : null,
      });
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
        <h2 className="rwaq-section-title mb-1">{intl.formatMessage(messages.pricingTitle)}</h2>
        <p className="text-muted small mb-0">{intl.formatMessage(messages.pricingDescription)}</p>
      </div>

      {error && <Alert variant="danger" className="mb-3">{error}</Alert>}
      {saved && !error && (
        <Alert variant="success" className="mb-3">{intl.formatMessage(messages.pricingSaved)}</Alert>
      )}

      <Form.Group>
        <Form.Label>{intl.formatMessage(messages.pricingCategoryLabel)}</Form.Label>
        <Form.Control
          as="select"
          value={category}
          disabled={isPending}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
            setCategory(e.target.value as ProgramPricingCategory);
            touched();
          }}
        >
          <option value="">{intl.formatMessage(messages.pricingFree)}</option>
          <option value="is_paid">{intl.formatMessage(messages.pricingPaid)}</option>
        </Form.Control>
      </Form.Group>

      {isPaid && (
        <>
          <Form.Group>
            <Form.Label>{intl.formatMessage(messages.pricingPriceLabel, { currency })}</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={price}
              disabled={isPending}
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
              disabled={isPending}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setDiscount(e.target.value); touched(); }}
            />
            <Form.Text muted>{intl.formatMessage(messages.pricingDiscountHint)}</Form.Text>
          </Form.Group>

          <p className="small text-muted">{intl.formatMessage(messages.pricingCoursesNote)}</p>
        </>
      )}

      <Button variant="primary" size="sm" onClick={handleSave} disabled={isPending}>
        {intl.formatMessage(isPending ? messages.pricingSaving : messages.pricingSave)}
      </Button>
    </div>
  );
};

export default ProgramPricingCard;
