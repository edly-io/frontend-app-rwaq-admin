import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import { useUnenrollProgramLearner } from '../data/hooks';
import UnenrollLearnerModal from './UnenrollLearnerModal';

jest.mock('../data/hooks', () => ({ useUnenrollProgramLearner: jest.fn() }));
jest.mock('@src/components/ToastContext', () => ({ useToast: () => ({ showToast: jest.fn() }) }));
jest.mock('@src/modules/users/components/ReasonField', () => ({
  __esModule: true,
  default: () => null,
  emptyReason: {},
  hasReason: () => true,
  resolveReason: () => 'test',
}));

it('keeps the partial result visible until the user closes it', async () => {
  const close = jest.fn();
  (useUnenrollProgramLearner as jest.Mock).mockReturnValue({
    mutateAsync: jest.fn().mockResolvedValue({ 'course-v1:A+B+C': 'Could not remove learner' }),
    isPending: false,
  });
  renderWrapper(<UnenrollLearnerModal onClose={close} uuid="program" learner={{ id: 1, name: 'Learner' } as never} />);
  fireEvent.click(screen.getByRole('button', { name: /unenroll/i }));
  await waitFor(() => expect(screen.getByText(/course-v1:A\+B\+C/)).toBeInTheDocument());
  expect(close).not.toHaveBeenCalled();
  fireEvent.click(screen.getAllByRole('button', { name: 'Close' })[1]);
  expect(close).toHaveBeenCalled();
});
