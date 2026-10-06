/**
 * EnrollUserModal: a Paid course offers only no-id-professional, preselected,
 * in a dropdown that stays visible with one option.
 */
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import EnrollUserModal from './EnrollUserModal';

const mockMutate = jest.fn();
jest.mock('../data/hooks', () => ({
  useEnrollUserInCourse: () => ({ mutateAsync: mockMutate, isPending: false }),
}));

jest.mock('../components/UserPicker', () => ({
  __esModule: true,
  default: ({ onSelect }: { onSelect: (user: unknown) => void }) => (
    <>
      <button
        type="button"
        onClick={() => onSelect({
          id: 1, name: 'Learner', email: 'l@rwaq.org', subscriptionEndsAt: null,
        })}
      >
        pick user
      </button>
      <button
        type="button"
        onClick={() => onSelect({
          id: 2, name: 'Subscriber', email: 's@rwaq.org', subscriptionEndsAt: '2026-12-31T00:00:00Z',
        })}
      >
        pick subscribed user
      </button>
    </>
  ),
}));

const renderModal = (props = {}) => renderWrapper(
  <EnrollUserModal isOpen onClose={jest.fn()} courseId="course-v1:A+B+C" courseName="Course" {...props} />,
);

describe('EnrollUserModal modes', () => {
  it('shows the professional mode alone, selected, for a paid course', async () => {
    renderModal({ availableModes: ['no-id-professional'] });
    await userEvent.click(screen.getByText('pick user'));
    const select = screen.getByLabelText('Mode') as HTMLSelectElement;
    expect(select.value).toBe('no-id-professional');
    expect(select.options).toHaveLength(1);
    expect(select.options[0].text).toBe('Professional, no ID verification');
  });

  it('offers honor and audit for a free course', async () => {
    renderModal();
    await userEvent.click(screen.getByText('pick user'));
    const select = screen.getByLabelText('Mode') as HTMLSelectElement;
    expect(Array.from(select.options).map((option) => option.value)).toEqual(['honor', 'audit']);
  });

  it('hides the modes while they load so honor never shows for a paid course', async () => {
    renderModal({ modesLoading: true });
    await userEvent.click(screen.getByText('pick user'));
    expect(screen.queryByLabelText('Mode')).toBeNull();
  });
});

describe('EnrollUserModal subscription plan', () => {
  beforeEach(() => {
    mockMutate.mockReset();
    mockMutate.mockResolvedValue({});
  });

  const submit = async () => {
    fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'Testing / QA' } });
    await userEvent.click(screen.getByRole('button', { name: 'Enroll' }));
  };

  it('requires Monthly or Yearly for a learner without a live subscription', async () => {
    renderModal({ isPartOfSubscription: true });
    await userEvent.click(screen.getByText('pick user'));
    expect(Array.from((screen.getByLabelText('Subscription plan') as HTMLSelectElement).options).map((o) => o.value))
      .toEqual(['', 'monthly', 'yearly']);

    await submit();

    expect(screen.getByText('Please select a plan.')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('sends the picked plan', async () => {
    renderModal({ isPartOfSubscription: true });
    await userEvent.click(screen.getByText('pick user'));
    fireEvent.change(screen.getByLabelText('Subscription plan'), { target: { value: 'yearly' } });

    await submit();

    await waitFor(() => expect(mockMutate).toHaveBeenCalledWith(expect.objectContaining({ subscriptionPlan: 'yearly' })));
  });

  it('disables the plan and sends none for a learner with a live subscription', async () => {
    renderModal({ isPartOfSubscription: true });
    await userEvent.click(screen.getByText('pick subscribed user'));

    expect(screen.getByLabelText('Subscription plan')).toBeDisabled();
    expect(screen.getByText(/already has a subscription \(ends/)).toBeInTheDocument();

    await submit();

    await waitFor(() => expect(mockMutate).toHaveBeenCalledTimes(1));
    expect(mockMutate.mock.calls[0][0]).not.toHaveProperty('subscriptionPlan');
  });
});
