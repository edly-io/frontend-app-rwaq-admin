/**
 * Course type and price for one course, on the admin course detail page.
 *
 * This is the only place `pricingManagedByAdmin` can be set. When it is on,
 * Studio shows the course team the pricing fields read-only. The lock never
 * applies here: the admin can always change the type and price.
 *
 * The backend refuses a type change while the course is in a program, and for
 * a free course that learners already joined, and while an Enrollment code course has an active code or
 * enrolled learners. Those refusals come back as `{ detail, field? }` and are shown as they are (a refusal
 * with no field sits under the type choice).
 *
 * An Enrollment code course can be hidden from the public catalog. After saving that type on a course with no
 * code yet, a banner offers adding one (the Enrollment codes page, opened with this course filled in).
 */
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Alert, Button, Form, OverlayTrigger, Tooltip,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import { getDiscountPercent, getPriceWithVat } from '@src/data/discountPercent';
import { useItemCodeCount } from '@src/modules/enrollment-codes/data/hooks';
import enrollmentCodeMessages from '@src/modules/enrollment-codes/messages';
import { useCoursePricing, useUpdateCoursePricing } from '../data/hooks';
import type { CoursePricingCategory } from '../data/types';
import { courseRoleMessages as messages } from '../messages';

interface CoursePricingCardProps {
  courseId: string;
}

type PricingField = 'pricingCategory' | 'regularPrice' | 'salePrice';
type FieldErrors = Partial<Record<PricingField, string>>;

/** Backend `field` values, mapped to the form field they belong to. */
const BACKEND_FIELDS: Record<string, PricingField> = {
  pricing_category: 'pricingCategory',
  regular_price: 'regularPrice',
  sale_price: 'salePrice',
};

const CoursePricingCard = ({ courseId }: CoursePricingCardProps) => {
  const intl = useIntl();
  const { data: pricing, isLoading, isError } = useCoursePricing(courseId);
  const { mutateAsync: updatePricing, isPending } = useUpdateCoursePricing(courseId);

  // null means no type was chosen yet, so no radio is selected.
  const [category, setCategory] = useState<CoursePricingCategory | null>(null);
  const [regularPrice, setRegularPrice] = useState('');
  const [salePrice, setSalePrice] = useState('');
  const [managedByAdmin, setManagedByAdmin] = useState(false);
  const [hideFromCatalog, setHideFromCatalog] = useState(false);
  const navigate = useNavigate();
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [removedCategories, setRemovedCategories] = useState<string[]>([]);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [settingsError, setSettingsError] = useState(false);

  useEffect(() => {
    if (!pricing) { return; }
    setCategory(pricing.pricingCategory);
    setRegularPrice(pricing.regularPrice ?? '');
    setSalePrice(pricing.salePrice ?? '');
    setManagedByAdmin(pricing.pricingManagedByAdmin);
    setHideFromCatalog(pricing.hideFromCatalog ?? false);
  }, [pricing]);

  // Only a paid course is sold on its own, so only it carries a price.
  const showPriceFields = category === 'is_paid';
  // Live from the inputs, before saving.
  const discountPercent = getDiscountPercent(regularPrice, salePrice);
  const vatRate = pricing?.vatRate;
  const vatLabel = pricing?.vatLabel;
  const priceWithVat = getPriceWithVat(regularPrice, salePrice, vatRate);
  const currency = pricing?.currency ?? 'SAR';
  // The backend refuses a type change while the course is in a program.
  const inProgram = !!pricing?.partOfProgram;
  const isBusy = isLoading || isPending;
  // An Enrollment code course (stored, or just saved) with no code yet offers adding one.
  const isCodeType = category === 'is_enrollment_code';
  const isCodeCourse = pricing?.pricingCategory === 'is_enrollment_code' || (saved && isCodeType);
  const { data: codeCount } = useItemCodeCount({ courseId }, isCodeCourse);

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
    const regularPriceError = showPriceFields ? validateRegularPrice() : '';
    const salePriceError = showPriceFields ? validateSalePrice() : '';
    setFieldErrors({ regularPrice: regularPriceError || undefined, salePrice: salePriceError || undefined });
    if (regularPriceError || salePriceError) {
      setSaved(false);
      return;
    }
    setError('');
    setRemovedCategories([]);
    try {
      const result = await updatePricing({
        // A course with no type yet keeps none until the admin picks one.
        ...(category ? { pricingCategory: category } : {}),
        ...(showPriceFields ? {
          regularPrice: regularPrice.trim(),
          salePrice: salePrice.trim() === '' ? null : salePrice.trim(),
        } : {}),
      });
      setRemovedCategories(result?.removedCategories ?? []);
      setSaved(true);
    } catch (err) {
      logError(err);
      const response = (err as {
        response?: { status?: number; data?: { detail?: string; field?: string } };
      })?.response;
      const data = response?.data;
      const detail = data?.detail || intl.formatMessage(messages.pricingErrorSaveFailed);
      // A 409 with no field is a type-change refusal: it belongs under the type choice.
      let field: PricingField | undefined = data?.field ? BACKEND_FIELDS[data.field] : undefined;
      if (!data?.field && response?.status === 409) { field = 'pricingCategory'; }
      if (field) {
        setFieldError(field, detail);
      } else {
        setError(detail);
      }
      setSaved(false);
    }
  };

  const handleSaveManagement = async () => {
    setSettingsError(false);
    try {
      await updatePricing({
        pricingManagedByAdmin: managedByAdmin,
        ...(isCodeCourse ? { hideFromCatalog } : {}),
      });
      setSettingsSaved(true);
    } catch (err) {
      logError(err);
      setSettingsSaved(false);
      setSettingsError(true);
    }
  };

  /** Clear the saved/error banners whenever the admin edits a field. */
  const touched = (field?: PricingField) => {
    setSaved(false);
    setError('');
    if (field) { setFieldError(field, ''); }
  };

  const header = (
    <div className="mb-4">
      <h2 className="rwaq-section-title mb-1">
        {intl.formatMessage(messages.pricingSectionTitle)}
      </h2>
      <p className="text-muted small mb-0">
        {intl.formatMessage(messages.pricingSectionDescription)}
      </p>
    </div>
  );

  // Without the stored values a save would overwrite them, so show no form.
  if (isError && !pricing) {
    return (
      <div className="rwaq-card">
        {header}
        <Alert variant="danger">{intl.formatMessage(messages.pricingErrorLoadFailed)}</Alert>
      </div>
    );
  }

  return (
    <>
      <div className="rwaq-card">
        {header}

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
        {saved && !error && removedCategories.length > 0 && (
        <Alert variant="warning" className="mb-3">
          {intl.formatMessage(messages.pricingCategoriesRemoved, { categories: removedCategories.join(', ') })}
        </Alert>
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
            <Form.Radio
              value="is_part_of_subscription"
              disabled={isBusy || inProgram}
              description={intl.formatMessage(messages.pricingSubscriptionDescription)}
            >
              {intl.formatMessage(messages.pricingSubscription)}
            </Form.Radio>
            <div className="d-flex align-items-start justify-content-between w-100">
              <Form.Radio
                value="is_enrollment_code"
                disabled={isBusy || inProgram}
                description={intl.formatMessage(messages.pricingEnrollmentCodeDescription)}
              >
                {intl.formatMessage(messages.pricingEnrollmentCode)}
              </Form.Radio>
              {isCodeCourse && codeCount !== undefined && (
              <Button
                variant="outline-primary"
                size="sm"
                className="ml-3"
                onClick={(e: React.MouseEvent) => {
                  e.preventDefault();
                  e.stopPropagation();
                  navigate(codeCount === 0
                    ? `/enrollment-codes?create=1&scope=course&id=${encodeURIComponent(courseId)}`
                    : `/enrollment-codes?courseId=${encodeURIComponent(courseId)}`);
                }}
              >
                {intl.formatMessage(codeCount === 0
                  ? enrollmentCodeMessages.addCodeAction : enrollmentCodeMessages.viewCodesAction)}
              </Button>
              )}
            </div>
          </Form.RadioSet>
          {fieldErrors.pricingCategory && (
          <Form.Control.Feedback type="invalid">{fieldErrors.pricingCategory}</Form.Control.Feedback>
          )}
        </Form.Group>

        {showPriceFields && (
        <>
          <Form.Group isInvalid={!!fieldErrors.regularPrice} controlId="course-pricing-regular-price">
            <Form.Label>{intl.formatMessage(messages.pricingPriceLabel, { currency })}</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={regularPrice}
              disabled={isBusy}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => { setRegularPrice(e.target.value); touched('regularPrice'); }}
              onBlur={() => setFieldError('regularPrice', validateRegularPrice())}
            />
            {fieldErrors.regularPrice && (
              <Form.Control.Feedback type="invalid">{fieldErrors.regularPrice}</Form.Control.Feedback>
            )}
          </Form.Group>

          <Form.Group isInvalid={!!fieldErrors.salePrice} controlId="course-pricing-sale-price">
            <Form.Label>{intl.formatMessage(messages.pricingSalePriceLabel, { currency })}</Form.Label>
            <Form.Control
              type="number"
              min="0"
              step="0.01"
              value={salePrice}
              disabled={isBusy}
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
        </>
        )}

        <Button variant="primary" size="sm" onClick={handleSave} disabled={isBusy}>
          {intl.formatMessage(isPending ? messages.pricingSaving : messages.pricingSave)}
        </Button>
      </div>
      <div className="rwaq-card mt-3">
        <h2 className="rwaq-section-title mb-3">{intl.formatMessage(messages.settingsTitle)}</h2>
        <Form.Group controlId="pricing-managed-by-admin">
          <Form.Checkbox
            name="pricingManagedByAdmin"
            checked={managedByAdmin}
            disabled={isBusy}
            description={intl.formatMessage(messages.pricingManagedHint)}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setManagedByAdmin(e.target.checked);
              setSettingsSaved(false);
              setSettingsError(false);
            }}
          >
            {intl.formatMessage(messages.pricingManagedLabel)}
          </Form.Checkbox>
        </Form.Group>

        <OverlayTrigger
          placement="top"
          trigger={isCodeCourse ? [] : ['hover', 'focus']}
          overlay={(
            <Tooltip id="course-hide-from-catalog-tooltip">
              {intl.formatMessage(enrollmentCodeMessages.hideFromCatalogDisabled)}
            </Tooltip>
          )}
        >
          <div
            role="group"
            aria-label={intl.formatMessage(enrollmentCodeMessages.hideFromCatalog)}
            tabIndex={isCodeCourse ? undefined : 0}
          >
            <Form.Group controlId="course-hide-from-catalog">
              <Form.Checkbox
                name="hideFromCatalog"
                checked={hideFromCatalog}
                disabled={isBusy || !isCodeCourse}
                description={intl.formatMessage(enrollmentCodeMessages.hideFromCatalogHelp)}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setHideFromCatalog(e.target.checked);
                  setSettingsSaved(false);
                  setSettingsError(false);
                }}
              >
                {intl.formatMessage(enrollmentCodeMessages.hideFromCatalog)}
              </Form.Checkbox>
            </Form.Group>
          </div>
        </OverlayTrigger>

        {settingsError && <Alert variant="danger">{intl.formatMessage(messages.pricingErrorSaveFailed)}</Alert>}
        {settingsSaved && <Alert variant="success">{intl.formatMessage(messages.settingsSaved)}</Alert>}
        <Button variant="primary" size="sm" onClick={handleSaveManagement} disabled={isBusy}>
          {intl.formatMessage(isPending ? messages.pricingSaving : messages.settingsSave)}
        </Button>
      </div>
    </>
  );
};

export default CoursePricingCard;
