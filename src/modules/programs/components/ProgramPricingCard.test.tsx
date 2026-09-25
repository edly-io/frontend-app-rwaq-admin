/**
 * ProgramPricingCard: blur validation, the lock help text and DRF field errors.
 */
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import type { ProgramDetail } from '../data/types';
import ProgramPricingCard from './ProgramPricingCard';

jest.mock('../data/hooks');
jest.mock('@edx/frontend-platform/logging', () => ({ logError: jest.fn() }));

const mockUpdate = jest.fn();

const makeProgram = (overrides: Partial<ProgramDetail> = {}) => ({
  uuid: 'b6f1c2d3-0000-4000-8000-000000000001',
  pricingCategory: '',
  price: null,
  discount: null,
  currency: 'SAR',
  pricingManagedByAdmin: false,
  ...overrides,
} as ProgramDetail);

const renderCard = (overrides: Partial<ProgramDetail> = {}) => renderWrapper(
  <ProgramPricingCard program={makeProgram(overrides)} />,
);

const save = () => fireEvent.click(screen.getByRole('button', { name: 'Save pricing' }));

beforeEach(() => {
  jest.clearAllMocks();
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
    renderCard({ pricingCategory: 'is_paid', price: '500.00' });
    const price = screen.getByLabelText('Price (SAR)');
    fireEvent.change(price, { target: { value: '-5' } });
    fireEvent.blur(price);
    expect(screen.getByText('Price must be greater than 0.')).toBeInTheDocument();

    fireEvent.change(price, { target: { value: '500' } });
    fireEvent.blur(price);
    const discount = screen.getByLabelText('Sale price (SAR)');
    fireEvent.change(discount, { target: { value: '600' } });
    fireEvent.blur(discount);
    expect(screen.getByText('Sale price must be lower than the price.')).toBeInTheDocument();
  });

  it('does not save when a paid price is invalid', () => {
    renderCard({ pricingCategory: 'is_paid', price: '0' });
    save();
    expect(screen.getByText('Price must be greater than 0.')).toBeInTheDocument();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('saves a paid program', async () => {
    renderCard();
    fireEvent.change(screen.getByLabelText('Pricing type'), { target: { value: 'is_paid' } });
    fireEvent.change(screen.getByLabelText('Price (SAR)'), { target: { value: '500' } });
    save();
    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({
      pricingCategory: 'is_paid',
      price: '500',
      discount: null,
      pricingManagedByAdmin: false,
    }));
    expect(await screen.findByText('Pricing saved.')).toBeInTheDocument();
  });

  it('shows DRF field errors on their fields', async () => {
    const message = "It's a free program. Learners have already enrolled into this program. "
      + 'Create a new program to make it paid.';
    mockUpdate.mockRejectedValue({ response: { status: 409, data: { pricing_category: [message] } } });
    renderCard();
    fireEvent.change(screen.getByLabelText('Pricing type'), { target: { value: 'is_paid' } });
    fireEvent.change(screen.getByLabelText('Price (SAR)'), { target: { value: '500' } });
    save();
    const error = await screen.findByText(message);
    expect(error.closest('.pgn__form-group')).toContainElement(screen.getByLabelText('Pricing type'));
  });

  it('shows other backend errors as a banner', async () => {
    mockUpdate.mockRejectedValue({ response: { status: 400, data: { non_field_errors: ['Something is off.'] } } });
    renderCard();
    save();
    expect(await screen.findByText('Something is off.')).toBeInTheDocument();
  });
});
