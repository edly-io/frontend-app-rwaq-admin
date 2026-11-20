import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import { useBulkEnrollLearners } from '../data/hooks';
import BulkEnrollModal from './BulkEnrollModal';

jest.mock('../data/hooks', () => ({ useBulkEnrollLearners: jest.fn() }));
jest.mock('@src/components/ToastContext', () => ({ useToast: () => ({ showToast: jest.fn() }) }));

it('sends the selected auto-enroll option and displays invited people', async () => {
  const mutateAsync = jest.fn().mockResolvedValue({
    enrolled: [], alreadyEnrolled: [], failed: [], courseFailures: [], invited: [{ email: 'new@example.com' }],
  });
  (useBulkEnrollLearners as jest.Mock).mockReturnValue({ mutateAsync, isPending: false });
  renderWrapper(<BulkEnrollModal isOpen onClose={jest.fn()} uuid="program-id" />);
  fireEvent.change(screen.getByLabelText('Email addresses'), { target: { value: 'new@example.com' } });
  fireEvent.click(screen.getByRole('checkbox', { name: /auto enroll people/i }));
  fireEvent.click(screen.getByRole('button', { name: 'Enroll learners' }));
  await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({
    emails: 'new@example.com', reason: '', autoEnroll: true, notify: false,
  }));
  expect(await screen.findByText('1 person invited.')).toBeInTheDocument();
});

it('allows notifying without auto enrollment', async () => {
  const mutateAsync = jest.fn().mockResolvedValue({
    enrolled: [], alreadyEnrolled: [], failed: [], courseFailures: [], invited: [], notificationFailures: [],
  });
  (useBulkEnrollLearners as jest.Mock).mockReturnValue({ mutateAsync, isPending: false });
  renderWrapper(<BulkEnrollModal isOpen onClose={jest.fn()} uuid="program-id" />);
  fireEvent.change(screen.getByLabelText('Email addresses'), { target: { value: 'new@example.com' } });
  fireEvent.click(screen.getByRole('checkbox', { name: 'Notify by email' }));
  fireEvent.click(screen.getByRole('button', { name: 'Enroll learners' }));
  await waitFor(() => expect(mutateAsync).toHaveBeenCalledWith({
    emails: 'new@example.com', reason: '', autoEnroll: false, notify: true,
  }));
});
