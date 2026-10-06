/**
 * EnrollModal (user page): the plan follows the page's learner and the picked course.
 */
import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import EnrollModal from './EnrollModal';

const mockMutate = jest.fn();
jest.mock('../data/hooks', () => ({
  useEnrollUser: () => ({ mutateAsync: mockMutate, isPending: false }),
}));

jest.mock('../components/CoursePicker', () => ({
  __esModule: true,
  default: ({ onSelect }: { onSelect: (course: unknown) => void }) => (
    <>
      <button
        type="button"
        onClick={() => onSelect({
          courseId: 'course-v1:A+B+C', displayName: 'Sub course', availableModes: ['honor'], isPartOfSubscription: true,
        })}
      >
        pick subscription course
      </button>
      <button
        type="button"
        onClick={() => onSelect({
          courseId: 'course-v1:A+B+D', displayName: 'Plain course', availableModes: ['honor'], isPartOfSubscription: false,
        })}
      >
        pick plain course
      </button>
    </>
  ),
}));

const renderModal = (props = {}) => renderWrapper(
  <EnrollModal isOpen onClose={jest.fn()} userId={7} userName="Learner" enrollments={[]} {...props} />,
);

const submit = async () => {
  fireEvent.change(screen.getByLabelText('Reason'), { target: { value: 'Testing / QA' } });
  await userEvent.click(screen.getByRole('button', { name: 'Enroll' }));
};

describe('EnrollModal subscription plan', () => {
  beforeEach(() => {
    mockMutate.mockReset();
    mockMutate.mockResolvedValue({});
  });

  it('requires a plan for subscription content when the learner has no live subscription', async () => {
    renderModal();
    await userEvent.click(screen.getByText('pick subscription course'));
    expect(Array.from((screen.getByLabelText('Subscription plan') as HTMLSelectElement).options).map((o) => o.value))
      .toEqual(['', 'monthly', 'yearly']);

    await submit();

    expect(screen.getByText('Please select a plan.')).toBeInTheDocument();
    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('sends the picked plan', async () => {
    renderModal();
    await userEvent.click(screen.getByText('pick subscription course'));
    fireEvent.change(screen.getByLabelText('Subscription plan'), { target: { value: 'monthly' } });

    await submit();

    await waitFor(() => expect(mockMutate).toHaveBeenCalledWith(expect.objectContaining({ subscriptionPlan: 'monthly' })));
  });

  it('disables the plan and sends none for a learner with a live subscription', async () => {
    renderModal({ subscriptionEndsAt: '2026-12-31T00:00:00Z' });
    await userEvent.click(screen.getByText('pick subscription course'));

    expect(screen.getByLabelText('Subscription plan')).toBeDisabled();
    expect(screen.getByText(/already has a subscription \(ends/)).toBeInTheDocument();

    await submit();

    await waitFor(() => expect(mockMutate).toHaveBeenCalledTimes(1));
    expect(mockMutate.mock.calls[0][0]).not.toHaveProperty('subscriptionPlan');
  });

  it('asks for no plan on a course outside the subscription', async () => {
    renderModal();
    await userEvent.click(screen.getByText('pick plain course'));

    expect(screen.queryByLabelText('Subscription plan')).toBeNull();

    await submit();

    await waitFor(() => expect(mockMutate).toHaveBeenCalledTimes(1));
    expect(mockMutate.mock.calls[0][0]).not.toHaveProperty('subscriptionPlan');
  });
});
