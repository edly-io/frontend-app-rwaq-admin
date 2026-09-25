/**
 * CoursePricingCard: course type radios, Paid-only price fields, blur
 * validation, the in-program note and backend error placement.
 */
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import type { CoursePricing } from '../data/types';
import CoursePricingCard from './CoursePricingCard';

jest.mock('../data/hooks');
jest.mock('@edx/frontend-platform/logging', () => ({ logError: jest.fn() }));

const courseId = 'course-v1:ArbOrg+PRC01+2026';
const mockUpdate = jest.fn();

const basePricing: CoursePricing = {
  pricingCategory: 'is_free',
  price: null,
  discount: null,
  currency: 'SAR',
  pricingManagedByAdmin: false,
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
  mockUpdate.mockResolvedValue(basePricing);
  (hooks.useUpdateCoursePricing as jest.Mock).mockReturnValue({ mutateAsync: mockUpdate, isPending: false });
});

describe('CoursePricingCard', () => {
  it('shows the title, three types with descriptions and the lock help text', () => {
    renderCard();
    expect(screen.getByRole('heading', { name: 'Type of course' })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: 'Free' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Paid' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Program-only course' })).not.toBeChecked();
    expect(screen.getByText('Learners enroll at no cost.')).toBeInTheDocument();
    expect(screen.getByText('Sold on its own at the price set below.')).toBeInTheDocument();
    expect(screen.getByText('Offered only through the one program it is added to.')).toBeInTheDocument();
    expect(screen.getByText(
      'When enabled, course authors see the pricing fields in Studio but cannot change them. '
      + 'Org admin can still change them.',
    )).toBeInTheDocument();
    expect(screen.queryByLabelText('Price (SAR)')).not.toBeInTheDocument();
  });

  it('selects no type for a legacy course with no type', () => {
    renderCard({ pricingCategory: null });
    screen.getAllByRole('radio').forEach((radio) => expect(radio).not.toBeChecked());
  });

  it('shows price fields only for Paid', () => {
    renderCard();
    fireEvent.click(screen.getByRole('radio', { name: 'Paid' }));
    expect(screen.getByLabelText('Price (SAR)')).toBeInTheDocument();
    expect(screen.getByLabelText('Sale price (SAR)')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('radio', { name: 'Program-only course' }));
    expect(screen.queryByLabelText('Price (SAR)')).not.toBeInTheDocument();
  });

  it('validates price and sale price on blur', () => {
    renderCard({ pricingCategory: 'is_paid', price: '100.00' });
    const price = screen.getByLabelText('Price (SAR)');
    fireEvent.change(price, { target: { value: '0' } });
    fireEvent.blur(price);
    expect(screen.getByText('Price must be greater than 0.')).toBeInTheDocument();

    fireEvent.change(price, { target: { value: '100' } });
    fireEvent.blur(price);
    expect(screen.queryByText('Price must be greater than 0.')).not.toBeInTheDocument();

    const discount = screen.getByLabelText('Sale price (SAR)');
    fireEvent.change(discount, { target: { value: '100' } });
    fireEvent.blur(discount);
    expect(screen.getByText('Sale price must be lower than the price.')).toBeInTheDocument();
  });

  it('does not save when a paid price is invalid', () => {
    renderCard({ pricingCategory: 'is_paid', price: '0' });
    save();
    expect(screen.getByText('Price must be greater than 0.')).toBeInTheDocument();
    expect(mockUpdate).not.toHaveBeenCalled();
  });

  it('saves Free with PUT, not DELETE', async () => {
    renderCard({ pricingCategory: 'is_paid', price: '100.00' });
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
    fireEvent.change(screen.getByLabelText('Price (SAR)'), { target: { value: '200' } });
    fireEvent.change(screen.getByLabelText('Sale price (SAR)'), { target: { value: '150' } });
    fireEvent.click(screen.getByRole('checkbox', { name: /Manage pricing from the admin panel/ }));
    save();
    await waitFor(() => expect(mockUpdate).toHaveBeenCalledWith({
      pricingCategory: 'is_paid',
      price: '200',
      discount: '150',
      pricingManagedByAdmin: true,
    }));
  });

  it('keeps the card editable when the lock is on', () => {
    renderCard({ pricingCategory: 'is_paid', price: '100.00', pricingManagedByAdmin: true });
    expect(screen.getByRole('radio', { name: 'Free' })).toBeEnabled();
    expect(screen.getByLabelText('Price (SAR)')).toBeEnabled();
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
      response: { status: 400, data: { detail: 'Sale price must be lower than the price.', field: 'discount' } },
    });
    renderCard({ pricingCategory: 'is_paid', price: '100.00' });
    save();
    const message = await screen.findByText('Sale price must be lower than the price.');
    expect(message.closest('.pgn__form-group')).toContainElement(screen.getByLabelText('Sale price (SAR)'));
  });
});
