/**
 * EnrollUserModal: a Paid course offers only no-id-professional, preselected,
 * in a dropdown that stays visible with one option.
 */
import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWrapper } from '@src/setupTest';
import EnrollUserModal from './EnrollUserModal';

jest.mock('../data/hooks', () => ({
  useEnrollUserInCourse: () => ({ mutateAsync: jest.fn(), isPending: false }),
}));

jest.mock('../components/UserPicker', () => ({
  __esModule: true,
  default: ({ onSelect }: { onSelect: (user: unknown) => void }) => (
    <button type="button" onClick={() => onSelect({ id: 1, name: 'Learner', email: 'l@rwaq.org' })}>
      pick user
    </button>
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
