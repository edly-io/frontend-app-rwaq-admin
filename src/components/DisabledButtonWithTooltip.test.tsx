import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import DisabledButtonWithTooltip from './DisabledButtonWithTooltip';

describe('DisabledButtonWithTooltip', () => {
  it('shows a disabled button that explains itself on hover and ignores clicks', async () => {
    const onSubmit = jest.fn();
    renderWrapper(
      <form onSubmit={onSubmit}>
        <DisabledButtonWithTooltip id="why" tooltip="Learners join this course through their Rwaq subscription.">
          Enroll a User
        </DisabledButtonWithTooltip>
      </form>,
    );
    const button = screen.getByRole('button', { name: 'Enroll a User' });
    expect(button).toHaveAttribute('aria-disabled', 'true');
    fireEvent.click(button);
    expect(onSubmit).not.toHaveBeenCalled();
    fireEvent.mouseOver(button);
    await waitFor(() => expect(screen.getByRole('tooltip')).toHaveTextContent(
      'Learners join this course through their Rwaq subscription.',
    ));
  });
});
