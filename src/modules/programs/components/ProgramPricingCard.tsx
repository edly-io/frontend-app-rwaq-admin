/**
 * Pricing controls for one program, on the admin program detail page.
 *
 * Same rules as the Studio program page, enforced by the shared backend
 * validation: a paid program needs a price above 0, and the sale price must be
 * below it. Switching back to Free clears both prices. The backend reports
 * refusals as DRF field errors, shown on the field they name (an Enrollment code program with an active code
 * or enrolled learners cannot change type: the text sits under the type choice).
 *
 * An Enrollment code program can be hidden from the public catalog. After saving that type on a program with
 * no code yet, a banner offers adding one (the Enrollment codes page, opened with this program filled in).
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Button, Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { getDiscountPercent, getPriceWithVat } from '@src/data/discountPercent';
import { getErrorReason } from '@src/data/httpError';
import { useItemCodeCount } from '@src/modules/enrollment-codes/data/hooks';
import enrollmentCodeMessages from '@src/modules/enrollment-codes/messages';
import { useUpdateProgram } from '../data/hooks';
import type { ProgramDetail, ProgramPricingCategory } from '../data/types';
import messages from '../messages';

interface ProgramPricingCardProps {
  program: ProgramDetail;
}

type PricingField = 'pricingCategory' | 'regularPrice' | 'salePrice';
type FieldErrors = Partial<Record<PricingField, string>>;

/** DRF error keys, mapped to the form field they belong to. */
const BACKEND_FIELDS: Record<string, PricingField> = {
  pricing_category: 'pricingCategory',
  regular_price: 'regularPrice',
  sale_price: 'salePrice',
};

const ProgramPricingCard = ({ program }: ProgramPricingCardProps) => {
  const intl = useIntl();
  const { mutateAsync, isPending } = useUpdateProgram(program.uuid);

  const [category, setCategory] = useState<ProgramPricingCategory>('is_free');
  const [regularPrice, setRegularPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [hideFromCatalog, setHideFromCatalog] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setCategory(program.pricingCategory || 'is_free');
    setHideFromCatalog(program.hideFromCatalog ?? false);
    setRegularPrice(program.regularPrice ?? '');
    setSalePrice(program.salePrice ?? '');
  }, [program.pricingCategory, program.regularPrice, program.salePrice, program.hideFromCatalog]);

  const isPaid = category === 'is_paid';
  // An Enrollment code program (stored, or just saved) with no code yet offers adding one.
  const isCodeType = category === 'is_enrollment_code';
  const isCodeProgram = program.pricingCategory === 'is_enrollment_code' || (saved && isCodeType);
  const { data: codeCount } = useItemCodeCount({ programUuid: program.uuid }, isCodeProgram);
  // Live from the inputs, before saving.
  const discountPercent = getDiscountPercent(regularPrice, salePrice);
  const { vatRate, vatLabel } = program;
  const priceWithVat = getPriceWithVat(regularPrice, salePrice, vatRate);
  const currency = program.currency || 'SAR';

  const validateRegularPrice = (): string => {
    if (regularPrice.trim() === '') { return intl.formatMessage(messages.pricingErrorPriceRequired); }
    if (!(Number(regularPrice) > 0)) { return intl.formatMessage(messages.pricingErrorPriceNotPositive); }
    return '';
  };

  const validateSalePrice = (): string => {
    if (salePrice.trim() === '') { return ''; }
    const d = Number(salePrice);
    if (d < 0) { return intl.formatMessage(messages.pricingErrorNegative); }
    if (regularPrice.trim() !== '' && d >= Number(regularPrice)) {
      return intl.formatMessage(messages.pricingErrorSalePriceNotLower);
    }
    return '';
  };

  const setFieldError = (field: PricingField, message: string) => {
    setFieldErrors((prev) => ({ ...prev, [field]: message || undefined }));
  };

  const handleSave = async () => {
    const regularPriceError = isPaid ? validateRegularPrice() : '';
    const salePriceError = isPaid ? validateSalePrice() : '';
    setFieldErrors({ regularPrice: regularPriceError || undefined, salePrice: salePriceError || undefined });
    if (regularPriceError || salePriceError) {
      setSaved(false);
      return;
    }
    setError('');
    try {
      await mutateAsync({
        pricingCategory: category,
        regularPrice: isPaid ? regularPrice.trim() : null,
        salePrice: isPaid && salePrice.trim() !== '' ? salePrice.trim() : null,
        ...(isCodeType ? { hideFromCatalog } : {}),
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

      {isCodeProgram && codeCount === 0 && (
        <Alert variant="info" className="mb-3" data-testid="add-code-banner">
          {intl.formatMessage(enrollmentCodeMessages.addCodeBanner)}
          {' '}
          <Button
            variant="link"
            size="inline"
            onClick={() => navigate(`/enrollment-codes?create=1&scope=program&id=${encodeURIComponent(program.uuid)}`)}
          >
            {intl.formatMessage(enrollmentCodeMessages.addCodeAction)}
          </Button>
        </Alert>
      )}

      <Form.Group isInvalid={!!fieldErrors.pricingCategory}>
        <Form.Label className="sr-only">{intl.formatMessage(messages.pricingCategoryLabel)}</Form.Label>
        <Form.RadioSet
          name="pricingCategory"
          value={category}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setCategory(e.target.value as ProgramPricingCategory);
            touched('pricingCategory');
          }}
        >
          <Form.Radio
            value="is_free"
            disabled={isPending}
            description={intl.formatMessage(messages.pricingFreeDescription)}
          >
            {intl.formatMessage(messages.pricingFree)}
          </Form.Radio>
          <Form.Radio
            value="is_paid"
            disabled={isPending}
            description={intl.formatMessage(messages.pricingPaidDescription)}
          >
            {intl.formatMessage(messages.pricingPaid)}
          </Form.Radio>
          <Form.Radio
            value="is_part_of_subscription"
            disabled={isPending}
            description={intl.formatMessage(messages.pricingSubscriptionDescription)}
          >
            {intl.formatMessage(messages.pricingSubscription)}
          </Form.Radio>
          <Form.Radio
            value="is_enrollment_code"
            disabled={isPending}
            description={intl.formatMessage(messages.pricingEnrollmentCodeDescription)}
          >
            {intl.formatMessage(messages.pricingEnrollmentCode)}
          </Form.Radio>
        </Form.RadioSet>
        {fieldErrors.pricingCategory && (
          <Form.Control.Feedback type="invalid">{fieldErrors.pricingCategory}</Form.Control.Feedback>
        )}
      </Form.Group>

      {isCodeType && (
        <Form.Group controlId="program-hide-from-catalog">
          <Form.Checkbox
            name="hideFromCatalog"
            checked={hideFromCatalog}
            disabled={isPending}
            description={intl.formatMessage(enrollmentCodeMessages.hideFromCatalogHelp)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setHideFromCatalog(e.target.checked); touched(); }}
          >
            {intl.formatMessage(enrollmentCodeMessages.hideFromCatalog)}
          </Form.Checkbox>
        </Form.Group>
      )}

      {isPaid && (
        <>
          <Form.Group isInvalid={!!fieldErrors.regularPrice} controlId="program-pricing-regular-price">
            <Form.Label>{intl.formatMessage(messages.pricingPriceLabel, { currency })}</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={regularPrice}
              disabled={isPending}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setRegularPrice(e.target.value); touched('regularPrice'); }}
              onBlur={() => setFieldError('regularPrice', validateRegularPrice())}
            />
            {fieldErrors.regularPrice && (
              <Form.Control.Feedback type="invalid">{fieldErrors.regularPrice}</Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group isInvalid={!!fieldErrors.salePrice} controlId="program-pricing-sale-price">
            <Form.Label>{intl.formatMessage(messages.pricingSalePriceLabel, { currency })}</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={salePrice}
              disabled={isPending}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                setSalePrice(e.target.value);
                touched('salePrice');
              }}
              onBlur={() => setFieldError('salePrice', validateSalePrice())}
            />
            {fieldErrors.salePrice
              ? <Form.Control.Feedback type="invalid">{fieldErrors.salePrice}</Form.Control.Feedback>
              : <Form.Text muted>{intl.formatMessage(messages.pricingSalePriceHint)}</Form.Text>}
            {priceWithVat !== null && (
              <Form.Text className="font-weight-bold" data-testid="price-with-vat">
                {intl.formatMessage(messages.pricingPriceWithVat, {
                  amount: intl.formatNumber(priceWithVat, { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
                  currency,
                  rate: Number(vatRate),
                  label: vatLabel?.trim() || intl.formatMessage(messages.pricingVatFallbackLabel),
                })}
              </Form.Text>
            )}
            {discountPercent !== null && (
              <Form.Text data-testid="discount-percentage">
                {intl.formatMessage(messages.pricingDiscountPercentage, { percentage: discountPercent })}
              </Form.Text>
            )}
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
