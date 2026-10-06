/**
 * BulkEnrollModal: a subscription program offers Monthly and Yearly only and requires one.
 */
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import BulkEnrollModal from './BulkEnrollModal';

const mockMutate = jest.fn();
jest.mock('../data/hooks', () => ({
  useBulkEnrollLearners: () => ({ mutateAsync: mockMutate, isPending: false }),
}));

const renderModal = (props = {}) => renderWrapper(
  <BulkEnrollModal isOpen onClose={jest.fn()} uuid="p-1" isSubscription {...props} />,
);

const fillEmails = () => userEvent.type(screen.getByRole('textbox', { name: /email/i }), 'a@rwaq.org');
const submit = () => userEvent.click(screen.getByRole('button', { name: 'Enroll learners' }));

describe('BulkEnrollModal subscription plan', () => {
  beforeEach(() => {
    mockMutate.mockReset();
    mockMutate.mockResolvedValue({
      enrolled: [], alreadyEnrolled: [], failed: [], courseFailures: [],
    });
  });

  it('offers only Monthly and Yearly and explains subscribed learners keep theirs', () => {
    renderModal();

    expect(Array.from((screen.getByLabelText('Subscription plan') as HTMLSelectElement).options).map((o) => o.value))
      .toEqual(['', 'monthly', 'yearly']);
    expect(screen.getByText(/keep theirs and the plan is not applied to them/)).toBeInTheDocument();
  });

  it('requires a plan before submitting', async () => {
    renderModal();
    await fillEmails();

    await submit();

    expect(screen.getByText('Please select a plan.')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('sends the picked plan', async () => {
    renderModal();
    await fillEmails();
    fireEvent.change(screen.getByLabelText('Subscription plan'), { target: { value: 'yearly' } });

    await submit();

    await waitFor(() => expect(mockMutate).toHaveBeenCalledWith(expect.objectContaining({ subscriptionPlan: 'yearly' })));
  });

  it('shows no plan field for a program outside the subscription', () => {
    renderModal({ isSubscription: false });

    expect(screen.queryByLabelText('Subscription plan')).toBeNull();
  });
});
