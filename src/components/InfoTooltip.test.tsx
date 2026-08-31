import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import InfoTooltip from './InfoTooltip';

describe('InfoTooltip', () => {
  it('renders the trigger button', () => {
    renderWrapper(<InfoTooltip text="Explanation text" />);
    expect(screen.getByRole('button', { name: 'More information' })).toBeInTheDocument();
  });

  it('tooltip is not visible initially', () => {
    renderWrapper(<InfoTooltip text="Explanation text" />);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on mouse enter', () => {
    renderWrapper(<InfoTooltip text="Explanation text" />);
    fireEvent.mouseEnter(screen.getByRole('button'));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    expect(screen.getByRole('tooltip')).toHaveTextContent('Explanation text');
  });

  it('hides tooltip on mouse leave', () => {
    renderWrapper(<InfoTooltip text="Explanation text" />);
    fireEvent.mouseEnter(screen.getByRole('button'));
    fireEvent.mouseLeave(screen.getByRole('button'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('toggles tooltip on click', () => {
    renderWrapper(<InfoTooltip text="Explanation text" />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows tooltip on focus', () => {
    renderWrapper(<InfoTooltip text="Explanation text" />);
    fireEvent.focus(screen.getByRole('button'));
    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('hides tooltip on blur', () => {
    renderWrapper(<InfoTooltip text="Explanation text" />);
    fireEvent.focus(screen.getByRole('button'));
    fireEvent.blur(screen.getByRole('button'));
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('uses a custom aria-label when provided', () => {
    renderWrapper(<InfoTooltip text="Some info" ariaLabel="Card details" />);
    expect(screen.getByRole('button', { name: 'Card details' })).toBeInTheDocument();
  });
});
