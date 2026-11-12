/**
 * CoursePricingCard: course type radios, Paid-only price fields, blur
 * validation, the in-program note and backend error placement.
 */
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as codeHooks from '@src/modules/enrollment-codes/data/hooks';
import * as hooks from '../data/hooks';
import type { CoursePricing } from '../data/types';
import CoursePricingCard from './CoursePricingCard';

jest.mock('../data/hooks');
jest.mock('@src/modules/enrollment-codes/data/hooks', () => ({ useItemCodeCount: jest.fn() }));
jest.mock('@edx/frontend-platform/logging', () => ({ logError: jest.fn() }));

const courseId = 'course-v1:ArbOrg+PRC01+2026';
const mockUpdate = jest.fn();

const basePricing: CoursePricing = {
  pricingCategory: 'is_free',
  regularPrice: null,
  salePrice: null,
  discountPercentage: null,
  currency: 'SAR',
  pricingManagedByAdmin: false,
  hideFromCatalog: false,
  partOfProgram: null,
  partOfProgramName: null,
};

const renderCard = (pricing: Partial<CoursePricing> = {}) => {
  (hooks.useCoursePricing as jest.Mock).mockReturnValue({
    data: { ...basePricing, ...pricing },
    isLoading: false,
  });
  return renderWrapper(<CoursePricingCard courseId={courseId} />);
};

const save = () => fireEvent.click(screen.getByRole('button', { name: 'Save pricing' }));

beforeEach(() => {
  jest.clearAllMocks();
  (codeHooks.useItemCodeCount as jest.Mock).mockReturnValue({ data: undefined });
  mockUpdate.mockResolvedValue(basePricing);
  (hooks.useUpdateCoursePricing as jest.Mock).mockReturnValue({ mutateAsync: mockUpdate, isPending: false });
});

describe('CoursePricingCard', () => {
  it('shows the title, four types with descriptions and the lock help text', () => {
    renderCard();
    expect(screen.getByRole('heading', { name: 'Type of course' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Free' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Paid' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Program-only course' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Part of Subscription' })).not.toBeChecked();
    expect(screen.getByText('Learners enroll at no cost.')).toBeInTheDocument();
    expect(screen.getByText('Sold on its own at the price set below.')).toBeInTheDocument();
    expect(screen.getByText('Offered only through the one program it is added to.')).toBeInTheDocument();
    expect(screen.getByText(
      'When enabled, course authors see the pricing fields in Studio but cannot change them. '
      + 'Org admin can still change them.',
    )).toBeInTheDocument();
    expect(screen.queryByLabelText('Price before VAT (SAR)')).not.toBeInTheDocument();
  });

  it('shows an error and no form when pricing fails to load', () => {
    (hooks.useCoursePricing as jest.Mock).mockReturnValue({ data: undefined, isLoading: false, isError: true });
    renderWrapper(<CoursePricingCard courseId={courseId} />);
    expect(screen.getByText('Could not load pricing. Please refresh the page.')).toBeInTheDocument();
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Save pricing' })).not.toBeInTheDocument();
  });

  it('selects no type for a legacy course with no type', () => {
    renderCard({ pricingCategory: null });
    screen.getAllByRole('radio').forEach((radio) => expect(radio).not.toBeChecked());
  });

  it('shows price fields only for Paid', () => {
    renderCard();
    fireEvent.click(screen.getByRole('radio', { name: 'Paid' }));
    expect(screen.getByLabelText('Price before VAT (SAR)')).toBeInTheDocument();
    expect(screen.getByLabelText('Discounted Price / Sale Price before VAT (SAR)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Program-only course' }));
    expect(screen.queryByLabelText('Price before VAT (SAR)')).not.toBeInTheDocument();
  });

  it('computes the discount percentage live from the inputs', () => {
    renderCard({ pricingCategory: 'is_paid', regularPrice: '100.00' });
    const price = screen.getByLabelText('Price before VAT (SAR)');
    const sale = screen.getByLabelText('Discounted Price / Sale Price before VAT (SAR)');
    expect(screen.queryByTestId('discount-percentage')).not.toBeInTheDocument();
    fireEvent.change(price, { target: { value: '200' } });
    fireEvent.change(sale, { target: { value: '150' } });
    expect(screen.getByText('25% off')).toBeInTheDocument();
    expect(mockUpdate).not.toHaveBeenCalled();
    fireEvent.change(price, { target: { value: '300' } });
    expect(screen.getByText('50% off')).toBeInTheDocument();
    fireEvent.change(sale, { target: { value: '300' } });
    expect(screen.queryByTestId('discount-percentage')).not.toBeInTheDocument();
    fireEvent.change(sale, { target: { value: '350' } });
    expect(screen.queryByTestId('discount-percentage')).not.toBeInTheDocument();
    fireEvent.change(sale, { target: { value: '150' } });
    expect(screen.getByText('50% off')).toBeInTheDocument();
    fireEvent.change(sale, { target: { value: '' } });
    expect(screen.queryByTestId('discount-percentage')).not.toBeInTheDocument();
  });

  describe('price with VAT line', () => {
    const line = () => screen.queryByTestId('price-with-vat');
    const priceInput = () => screen.getByLabelText('Price before VAT (SAR)');
    const saleInput = () => screen.getByLabelText('Discounted Price / Sale Price before VAT (SAR)');

    it('shows the regular price with VAT', () => {
      renderCard({ pricingCategory: 'is_paid', regularPrice: '30.00', vatRate: '15.00' });
      expect(line()).toHaveTextContent('Learner pays 34.50 SAR including 15% VAT');
      expect(line()).toHaveClass('font-weight-bold');
    });

    it('uses the sale price when it is set and valid', () => {
      renderCard({
        pricingCategory: 'is_paid', regularPrice: '100.00', salePrice: '30.00', vatRate: '15.00',
      });
      expect(line()).toHaveTextContent('Learner pays 34.50 SAR including 15% VAT');
    });

    it('falls back to the regular price when the sale price is not lower', () => {
      renderCard({
        pricingCategory: 'is_paid', regularPrice: '100.00', salePrice: '100.00', vatRate: '15.00',
      });
      expect(line()).toHaveTextContent('Learner pays 115.00 SAR including 15% VAT');
    });

    it('updates live while typing and hides when the price is emptied or invalid', () => {
      renderCard({ pricingCategory: 'is_paid', regularPrice: '100.00', vatRate: '15.00' });
      fireEvent.change(saleInput(), { target: { value: '30' } });
      expect(line()).toHaveTextContent('Learner pays 34.50 SAR including 15% VAT');
      fireEvent.change(saleInput(), { target: { value: '' } });
      expect(line()).toHaveTextContent('Learner pays 115.00 SAR including 15% VAT');
      fireEvent.change(priceInput(), { target: { value: 'abc' } });
      expect(line()).not.toBeInTheDocument();
      fireEvent.change(priceInput(), { target: { value: '' } });
      expect(line()).not.toBeInTheDocument();
    });

    it('ends with the label from the API', () => {
      renderCard({
        pricingCategory: 'is_paid', regularPrice: '30.00', vatRate: '15.00', vatLabel: 'Tax',
      });
      expect(line()).toHaveTextContent('Learner pays 34.50 SAR including 15% Tax');
    });

    it.each(['', '  '])('falls back to VAT when the label is %j', (vatLabel) => {
      renderCard({
        pricingCategory: 'is_paid', regularPrice: '30.00', vatRate: '15.00', vatLabel,
      });
      expect(line()).toHaveTextContent('Learner pays 34.50 SAR including 15% VAT');
    });

    it('stays hidden with a label but rate 0', () => {
      renderCard({
        pricingCategory: 'is_paid', regularPrice: '100.00', vatRate: '0.00', vatLabel: 'Tax',
      });
      expect(line()).not.toBeInTheDocument();
    });

    it('is hidden when the VAT rate is 0', () => {
      renderCard({ pricingCategory: 'is_paid', regularPrice: '100.00', vatRate: '0.00' });
      expect(line()).not.toBeInTheDocument();
    });

    it('is hidden when the VAT rate is missing', () => {
      renderCard({ pricingCategory: 'is_paid', regularPrice: '100.00' });
      expect(line()).not.toBeInTheDocument();
    });
  });

  it('validates price and sale price on blur', () => {
    renderCard({ pricingCategory: 'is_paid', regularPrice: '100.00' });
    const price = screen.getByLabelText('Price before VAT (SAR)');
    fireEvent.change(price, { target: { value: '0' } });
    fireEvent.blur(price);
    expect(screen.getByText('Price must be greater than 0.')).toBeInTheDocument();

    fireEvent.change(price, { target: { value: '100' } });
    fireEvent.blur(price);
    expect(screen.queryByText('Price must be greater than 0.')).not.toBeInTheDocument();

    const salePrice = screen.getByLabelText('Discounted Price / Sale Price before VAT (SAR)');
    fireEvent.change(salePrice, { target: { value: '100' } });
    fireEvent.blur(salePrice);
    expect(screen.getByText('Sale price must be lower than the price.')).toBeInTheDocument();
  });

  it('does not save when a paid price is invalid', () => {
    renderCard({ pricingCategory: 'is_paid', regularPrice: '0' });
    save();
    expect(screen.getByText('Price must be greater than 0.')).toBeInTheDocument();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('saves Free with PUT, not DELETE', async () => {
    renderCard({ pricingCategory: 'is_paid', regularPrice: '100.00' });
    fireEvent.click(screen.getByRole('radio', { name: 'Free' }));
    save();
    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({
      pricingCategory: 'is_free',
      pricingManagedByAdmin: false,
    }));
    expect(await screen.findByText('Pricing saved.')).toBeInTheDocument();
  });

  it('saves a paid course with its prices and the lock', async () => {
    renderCard();
    fireEvent.click(screen.getByRole('radio', { name: 'Paid' }));
    fireEvent.change(screen.getByLabelText('Price before VAT (SAR)'), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText('Discounted Price / Sale Price before VAT (SAR)'), { target: { value: '150' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /Manage pricing from the admin panel/ }));
    save();
    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({
      pricingCategory: 'is_paid',
      regularPrice: '200',
      salePrice: '150',
      pricingManagedByAdmin: true,
    }));
  });

  it('keeps the card editable when the lock is on', () => {
    renderCard({ pricingCategory: 'is_paid', regularPrice: '100.00', pricingManagedByAdmin: true });
    expect(screen.getByRole('radio', { name: 'Free' })).toBeEnabled();
    expect(screen.getByLabelText('Price before VAT (SAR)')).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Save pricing' })).toBeEnabled();
  });

  it('names the program and locks the type while the course is in one', () => {
    renderCard({
      pricingCategory: 'is_program_only',
      partOfProgram: 'program-v1:ArbOrg+MASTERS+PAID1',
      partOfProgramName: 'Paid Masters',
    });
    expect(screen.getByText(
      'This course is in the program Paid Masters. Its type cannot change while it is in the program.',
    )).toBeInTheDocument();
    screen.getAllByRole('radio').forEach((radio) => expect(radio).toBeDisabled());
    expect(screen.getByRole('button', { name: 'Save pricing' })).toBeEnabled();
  });

  it('shows a backend error without a field as a banner', async () => {
    const detail = 'Learners have already enrolled in this free course, so its type cannot change. '
      + 'Create a rerun of the course to offer it with another type.';
    mockUpdate.mockRejectedValue({ response: { status: 409, data: { detail } } });
    renderCard();
    fireEvent.click(screen.getByRole('radio', { name: 'Program-only course' }));
    save();
    expect(await screen.findByText(detail)).toBeInTheDocument();
  });

  it('attaches a backend error to the field it names', async () => {
    mockUpdate.mockRejectedValue({
      response: { status: 400, data: { detail: 'Sale price must be lower than the price.', field: 'sale_price' } },
    });
    renderCard({ pricingCategory: 'is_paid', regularPrice: '100.00' });
    save();
    const message = await screen.findByText('Sale price must be lower than the price.');
    expect(message.closest('.pgn__form-group')).toContainElement(screen.getByLabelText('Discounted Price / Sale Price before VAT (SAR)'));
  });
  describe('Enrollment code type', () => {
    it('offers the type after Part of Subscription, with its description', () => {
      renderCard();
      const values = screen.getAllByRole('radio').map((radio) => radio.getAttribute('value'));
      expect(values[values.length - 1]).toBe('is_enrollment_code');
      expect(values[values.length - 2]).toBe('is_part_of_subscription');
      expect(screen.getByRole('radio', { name: 'Enrollment code' })).not.toBeChecked();
      expect(screen.getByText(
        'Learners enroll at no cost, but only with an enrollment code. It has no price of its own.',
      )).toBeInTheDocument();
    });

    it('is disabled for a course in a program, like the other types', () => {
      renderCard({ partOfProgram: 'program-1', partOfProgramName: 'Leadership' });
      expect(screen.getByRole('radio', { name: 'Enrollment code' })).toBeDisabled();
    });

    it('hides the price fields when selected', () => {
      renderCard({ pricingCategory: 'is_paid', regularPrice: '100.00' });
      expect(screen.getByLabelText('Price before VAT (SAR)')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('radio', { name: 'Enrollment code' }));
      expect(screen.queryByLabelText('Price before VAT (SAR)')).not.toBeInTheDocument();
    });

    it('saves the type with no prices and with hideFromCatalog off', async () => {
      renderCard();
      fireEvent.click(screen.getByRole('radio', { name: 'Enrollment code' }));
      save();
      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
      const body = mockUpdate.mock.calls[0][0];
      expect(body.pricingCategory).toBe('is_enrollment_code');
      expect(body.hideFromCatalog).toBe(false);
      expect(body).not.toHaveProperty('regularPrice');
      expect(body).not.toHaveProperty('salePrice');
    });

    it('shows the hide from catalog checkbox only for the Enrollment code type and sends it', async () => {
      renderCard();
      expect(screen.queryByRole('checkbox', { name: 'Hide from catalog' })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('radio', { name: 'Enrollment code' }));
      expect(screen.getByText('Learners can still open it by link, QR code and on the partner page.')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('checkbox', { name: /Hide from catalog/ }));
      save();
      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
      expect(mockUpdate.mock.calls[0][0].hideFromCatalog).toBe(true);
      fireEvent.click(screen.getByRole('radio', { name: 'Free' }));
      expect(screen.queryByRole('checkbox', { name: /Hide from catalog/ })).not.toBeInTheDocument();
    });

    it('starts the checkbox from the stored value and never sends the flag for another type', async () => {
      renderCard({ pricingCategory: 'is_enrollment_code', hideFromCatalog: true });
      expect(screen.getByRole('checkbox', { name: /Hide from catalog/ })).toBeChecked();
      fireEvent.click(screen.getByRole('radio', { name: 'Free' }));
      save();
      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
      expect(mockUpdate.mock.calls[0][0]).not.toHaveProperty('hideFromCatalog');
    });

    it('offers adding a code after saving the type when the course has none, with a link to the tab', async () => {
      (codeHooks.useItemCodeCount as jest.Mock).mockReturnValue({ data: 0 });
      renderCard({ pricingCategory: 'is_enrollment_code' });
      expect(screen.queryByTestId('add-code-banner')).not.toBeInTheDocument();
      save();
      expect(await screen.findByTestId('add-code-banner')).toHaveTextContent('Add an enrollment code so learners can join.');
      expect(codeHooks.useItemCodeCount).toHaveBeenLastCalledWith({ courseId }, true);
      fireEvent.click(screen.getByRole('button', { name: 'Add a code' }));
      expect(window.location.search).toContain('tab=enrollment-code');
    });

    it('shows no banner when the course already has a code, and never a switch-off warning', async () => {
      (codeHooks.useItemCodeCount as jest.Mock).mockReturnValue({ data: 2 });
      renderCard({ pricingCategory: 'is_enrollment_code' });
      save();
      await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
      expect(screen.queryByTestId('add-code-banner')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('radio', { name: 'Free' }));
      expect(screen.queryByTestId('codes-switched-off-warning')).not.toBeInTheDocument();
    });

    it('shows a 409 with no field under the type choice', async () => {
      mockUpdate.mockRejectedValue({
        response: {
          status: 409,
          data: { detail: 'This course has an enrollment code. Delete or switch off its code in the Enrollment code tab first.' },
        },
      });
      renderCard({ pricingCategory: 'is_enrollment_code' });
      fireEvent.click(screen.getByRole('radio', { name: 'Free' }));
      save();
      expect(await screen.findByText(/This course has an enrollment code/)).toBeInTheDocument();
    });

    it('shows the backend refusal to switch away on the type, as the other locks do', async () => {
      mockUpdate.mockRejectedValue({
        response: { status: 409, data: { detail: 'Codes were used, so the type cannot change.', field: 'pricing_category' } },
      });
      renderCard({ pricingCategory: 'is_enrollment_code' });
      fireEvent.click(screen.getByRole('radio', { name: 'Free' }));
      save();
      expect(await screen.findByText('Codes were used, so the type cannot change.')).toBeInTheDocument();
    });
  });
});
