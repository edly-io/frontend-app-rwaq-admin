/**
 * ProgramPricingCard: blur validation, the lock help text and DRF field errors.
 */
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as codeHooks from '@src/modules/enrollment-codes/data/hooks';
import * as hooks from '../data/hooks';
import type { ProgramDetail } from '../data/types';
import ProgramPricingCard from './ProgramPricingCard';

jest.mock('../data/hooks');
jest.mock('@src/modules/enrollment-codes/data/hooks', () => ({ useItemCodeCount: jest.fn() }));
jest.mock('@edx/frontend-platform/logging', () => ({ logError: jest.fn() }));

const mockUpdate = jest.fn();

const makeProgram = (overrides: Partial<ProgramDetail> = {}) => ({
  uuid: 'b6f1c2d3-0000-4000-8000-000000000001',
  pricingCategory: 'is_free',
  regularPrice: null,
  salePrice: null,
  discountPercentage: null,
  currency: 'SAR',
  ...overrides,
} as ProgramDetail);

const renderCard = (overrides: Partial<ProgramDetail> = {}) => renderWrapper(
  <ProgramPricingCard program={makeProgram(overrides)} />,
);

const save = () => fireEvent.click(screen.getByRole('button', { name: 'Save pricing' }));

beforeEach(() => {
  jest.clearAllMocks();
  (codeHooks.useItemCodeCount as jest.Mock).mockReturnValue({ data: undefined });
  mockUpdate.mockResolvedValue(makeProgram());
  (hooks.useUpdateProgram as jest.Mock).mockReturnValue({ mutateAsync: mockUpdate, isPending: false });
});

describe('ProgramPricingCard', () => {
  it('shows the lock help text', () => {
    renderCard();
    expect(screen.getByText(
      'When enabled, the pricing fields are managed from the admin panel. Org admin can still change them.',
    )).toBeInTheDocument();
  });

  it('validates price and sale price on blur', () => {
    renderCard({ pricingCategory: 'is_paid', regularPrice: '500.00' });
    const price = screen.getByLabelText('Price before VAT (SAR)');
    fireEvent.change(price, { target: { value: '-5' } });
    fireEvent.blur(price);
    expect(screen.getByText('Price must be greater than 0.')).toBeInTheDocument();

    fireEvent.change(price, { target: { value: '500' } });
    fireEvent.blur(price);
    const salePrice = screen.getByLabelText('Discounted Price / Sale Price before VAT (SAR)');
    fireEvent.change(salePrice, { target: { value: '600' } });
    fireEvent.blur(salePrice);
    expect(screen.getByText('Sale price must be lower than the price.')).toBeInTheDocument();
  });

  it('does not save when a paid price is invalid', () => {
    renderCard({ pricingCategory: 'is_paid', regularPrice: '0' });
    save();
    expect(screen.getByText('Price must be greater than 0.')).toBeInTheDocument();
    expect(mockUpdate).not.toHaveBeenCalled();
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

  it('saves a paid program', async () => {
    renderCard();
    fireEvent.click(screen.getByRole('radio', { name: 'Paid' }));
    fireEvent.change(screen.getByLabelText('Price before VAT (SAR)'), { target: { value: '500' } });
    save();
    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({
      pricingCategory: 'is_paid',
      regularPrice: '500',
      salePrice: null,
    }));
    expect(await screen.findByText('Pricing saved.')).toBeInTheDocument();
  });

  it('shows DRF field errors on their fields', async () => {
    const message = "It's a free program. Learners have already enrolled into this program. "
      + 'Create a new program to make it paid.';
    mockUpdate.mockRejectedValue({ response: { status: 409, data: { pricing_category: [message] } } });
    renderCard();
    fireEvent.click(screen.getByRole('radio', { name: 'Paid' }));
    fireEvent.change(screen.getByLabelText('Price before VAT (SAR)'), { target: { value: '500' } });
    save();
    const error = await screen.findByText(message);
    expect(error.closest('.pgn__form-group')).toContainElement(screen.getByRole('radio', { name: 'Paid' }));
  });

  it('checks the radio of the stored type', () => {
    renderCard({ pricingCategory: 'is_part_of_subscription' });
    expect(screen.getByRole('radio', { name: 'Part of Subscription' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Free' })).not.toBeChecked();
    expect(screen.queryByLabelText('Price before VAT (SAR)')).not.toBeInTheDocument();
  });

  it('disables the radios while saving', () => {
    (hooks.useUpdateProgram as jest.Mock).mockReturnValue({ mutateAsync: mockUpdate, isPending: true });
    renderCard();
    ['Free', 'Paid', 'Part of Subscription', 'Enrollment code'].forEach((name) => {
      expect(screen.getByRole('radio', { name })).toBeDisabled();
    });
  });

  it('shows other backend errors as a banner', async () => {
    mockUpdate.mockRejectedValue({ response: { status: 400, data: { non_field_errors: ['Something is off.'] } } });
    renderCard();
    save();
    expect(await screen.findByText('Something is off.')).toBeInTheDocument();
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

    it('hides the price fields when selected and saves the type with no prices', async () => {
      renderCard({ pricingCategory: 'is_paid', regularPrice: '100.00' });
      expect(screen.getByLabelText('Price before VAT (SAR)')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('radio', { name: 'Enrollment code' }));
      expect(screen.queryByLabelText('Price before VAT (SAR)')).not.toBeInTheDocument();
      save();
      await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({
        pricingCategory: 'is_enrollment_code', regularPrice: null, salePrice: null, hideFromCatalog: false,
      }));
    });

    it('shows the hide from catalog checkbox only for the Enrollment code type and sends it', async () => {
      renderCard();
      expect(screen.queryByRole('checkbox', { name: /Hide from catalog/ })).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('radio', { name: 'Enrollment code' }));
      expect(screen.getByText('Learners can still open it by link, QR code and on the partner page.')).toBeInTheDocument();
      fireEvent.click(screen.getByRole('checkbox', { name: /Hide from catalog/ }));
      save();
      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
      expect(mockUpdate.mock.calls[0][0].hideFromCatalog).toBe(true);
    });

    it('starts the checkbox from the stored value and never sends the flag for another type', async () => {
      renderCard({ pricingCategory: 'is_enrollment_code', hideFromCatalog: true });
      expect(screen.getByRole('checkbox', { name: /Hide from catalog/ })).toBeChecked();
      fireEvent.click(screen.getByRole('radio', { name: 'Free' }));
      save();
      await waitFor(() => expect(mockUpdate).toHaveBeenCalledTimes(1));
      expect(mockUpdate.mock.calls[0][0]).not.toHaveProperty('hideFromCatalog');
    });

    it('offers Add enrollment code to a stored Enrollment code program with no code, linking to the codes page', () => {
      (codeHooks.useItemCodeCount as jest.Mock).mockReturnValue({ data: 0 });
      renderCard({ pricingCategory: 'is_enrollment_code' });
      expect(screen.getByTestId('add-code-banner')).toHaveTextContent('Add an enrollment code so learners can join.');
      expect(codeHooks.useItemCodeCount).toHaveBeenLastCalledWith({ programUuid: makeProgram().uuid }, true);
      fireEvent.click(screen.getByRole('button', { name: 'Add enrollment code' }));
      expect(window.location.pathname).toBe('/enrollment-codes');
      expect(window.location.search).toBe(`?create=1&scope=program&id=${makeProgram().uuid}`);
    });

    it('offers it right after saving the type too, and not for another type', async () => {
      (codeHooks.useItemCodeCount as jest.Mock).mockReturnValue({ data: 0 });
      renderCard();
      expect(screen.queryByTestId('add-code-banner')).not.toBeInTheDocument();
      expect(codeHooks.useItemCodeCount).toHaveBeenLastCalledWith({ programUuid: makeProgram().uuid }, false);
      fireEvent.click(screen.getByRole('radio', { name: 'Enrollment code' }));
      save();
      expect(await screen.findByTestId('add-code-banner')).toBeInTheDocument();
    });

    it('shows no banner when the program already has a code, and never a switch-off warning', async () => {
      (codeHooks.useItemCodeCount as jest.Mock).mockReturnValue({ data: 1 });
      renderCard({ pricingCategory: 'is_enrollment_code' });
      save();
      await waitFor(() => expect(mockUpdate).toHaveBeenCalled());
      expect(screen.queryByTestId('add-code-banner')).not.toBeInTheDocument();
      fireEvent.click(screen.getByRole('radio', { name: 'Free' }));
      expect(screen.queryByTestId('codes-switched-off-warning')).not.toBeInTheDocument();
    });

    it('shows the backend refusal to switch away on the type field', async () => {
      mockUpdate.mockRejectedValue({
        response: { status: 409, data: { pricing_category: ['Codes were used, so the type cannot change.'] } },
      });
      renderCard({ pricingCategory: 'is_enrollment_code' });
      fireEvent.click(screen.getByRole('radio', { name: 'Free' }));
      save();
      expect(await screen.findByText('Codes were used, so the type cannot change.')).toBeInTheDocument();
    });
  });
});
