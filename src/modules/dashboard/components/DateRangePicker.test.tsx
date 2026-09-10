import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import DateRangePicker from './DateRangePicker';

describe('DateRangePicker', () => {
  const noop = () => {};

  const openDropdown = (labelText?: RegExp) => {
    // The toggle is the only button visible before the panel opens.
    const btn = labelText ? screen.getByRole('button', { name: labelText }) : screen.getByRole('button');
    fireEvent.click(btn);
  };

  it('toggle button shows "All time" when no dates are set', () => {
    renderWrapper(
      <DateRangePicker startDate={undefined} endDate={undefined} onChange={noop} />,
    );
    expect(screen.getByRole('button', { name: /all time/i })).toBeInTheDocument();
  });

  it('panel is closed initially', () => {
    renderWrapper(
      <DateRangePicker startDate={undefined} endDate={undefined} onChange={noop} />,
    );
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('clicking the toggle opens the panel with all preset options', () => {
    renderWrapper(
      <DateRangePicker startDate={undefined} endDate={undefined} onChange={noop} />,
    );
    openDropdown();
    const listbox = screen.getByRole('menu');
    expect(listbox).toBeInTheDocument();
    ['Last 30 days', 'Last 3 months', 'Last 6 months', 'Last 12 months',
      'Year to date', 'All time', 'Custom'].forEach((label) => {
      expect(screen.getByRole('menuitem', { name: label })).toBeInTheDocument();
    });
  });

  it('"All time" option is marked selected when no dates are set', () => {
    renderWrapper(
      <DateRangePicker startDate={undefined} endDate={undefined} onChange={noop} />,
    );
    openDropdown();
    expect(screen.getByRole('menuitem', { name: 'All time' })).toHaveAttribute('aria-current', 'true');
    expect(screen.getByRole('menuitem', { name: 'Last 30 days' })).not.toHaveAttribute('aria-current');
  });

  it('clicking a named preset calls onChange and closes the panel', () => {
    const onChange = jest.fn();
    renderWrapper(
      <DateRangePicker startDate={undefined} endDate={undefined} onChange={onChange} />,
    );
    openDropdown();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Last 30 days' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const [start, end] = onChange.mock.calls[0];
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // Panel closes after selection
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('clicking "All time" calls onChange with undefined/undefined and closes the panel', () => {
    const onChange = jest.fn();
    renderWrapper(
      <DateRangePicker startDate="2025-01-01" endDate="2025-12-31" onChange={onChange} />,
    );
    openDropdown();
    fireEvent.click(screen.getByRole('menuitem', { name: 'All time' }));
    expect(onChange).toHaveBeenCalledWith(undefined, undefined);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('clicking "Custom" keeps the panel open and shows date inputs without calling onChange', () => {
    const onChange = jest.fn();
    renderWrapper(
      <DateRangePicker startDate={undefined} endDate={undefined} onChange={onChange} />,
    );
    openDropdown();
    expect(screen.queryByLabelText('From')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Custom' }));
    // Panel still open
    expect(screen.getByRole('menu')).toBeInTheDocument();
    // Inputs now visible
    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('date inputs are shown without opening Custom when URL dates do not match a preset', () => {
    renderWrapper(
      <DateRangePicker startDate="2024-03-15" endDate="2024-06-20" onChange={noop} />,
    );
    openDropdown();
    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
  });

  it('does not call onChange when dates change — only Apply commits the range', () => {
    const onChange = jest.fn();
    renderWrapper(
      <DateRangePicker startDate="2024-03-15" endDate="2024-06-20" onChange={onChange} />,
    );
    openDropdown();
    // Changing either input alone must never fire onChange (month-navigation safety)
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2024-04-01' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2024-07-31' } });
    expect(onChange).not.toHaveBeenCalled();
    // Panel stays open
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('Apply button commits the range, closes the panel, and calls onChange', () => {
    const onChange = jest.fn();
    renderWrapper(
      <DateRangePicker startDate={undefined} endDate={undefined} onChange={onChange} />,
    );
    openDropdown();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Custom' }));
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2024-04-01' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2024-07-31' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenCalledWith('2024-04-01', '2024-07-31');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('Apply button is disabled until both dates are filled', () => {
    renderWrapper(
      <DateRangePicker startDate={undefined} endDate={undefined} onChange={noop} />,
    );
    openDropdown();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Custom' }));
    const applyBtn = screen.getByRole('button', { name: 'Apply' });
    expect(applyBtn).toBeDisabled();
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2024-04-01' } });
    expect(applyBtn).toBeDisabled();
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2024-07-31' } });
    expect(applyBtn).not.toBeDisabled();
  });

  it('does not call onChange when a date input is cleared', () => {
    const onChange = jest.fn();
    renderWrapper(
      <DateRangePicker startDate="2024-03-15" endDate="2024-06-20" onChange={onChange} />,
    );
    openDropdown();
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('toggle button label shows date range when a custom range is applied (not "Custom")', () => {
    // TL feedback: once both start and end dates are applied, the button must show
    // the dates in compact format ("Mar 15, 2024 – Jun 20, 2024"), not the static
    // "Custom" label.  The "Custom" label is only shown while the user is mid-entry.
    renderWrapper(
      <DateRangePicker startDate="2024-03-15" endDate="2024-06-20" onChange={noop} />,
    );
    // The button name is the formatted date range, not "Custom".
    const btn = screen.getByRole('button');
    // Must NOT show the word "Custom".
    expect(btn).not.toHaveAccessibleName(/custom/i);
    // Must show both date strings somewhere in the label.
    expect(btn.textContent).toMatch(/2024/);
  });

  // ── Outside-click and Escape key (AUDIT-014, AUDIT-019, AUDIT-020) ──────────

  it('clicking outside the panel closes it', () => {
    renderWrapper(<DateRangePicker startDate={undefined} endDate={undefined} onChange={noop} />);
    openDropdown();
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.mouseDown(document.body);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('pressing Escape closes the panel', () => {
    renderWrapper(<DateRangePicker startDate={undefined} endDate={undefined} onChange={noop} />);
    openDropdown();
    expect(screen.getByRole('menu')).toBeInTheDocument();
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('pressing Escape after filling custom dates does not call onChange', () => {
    const onChange = jest.fn();
    renderWrapper(<DateRangePicker startDate={undefined} endDate={undefined} onChange={onChange} />);
    openDropdown();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Custom' }));
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2024-04-01' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2024-07-31' } });
    fireEvent.keyDown(document, { key: 'Escape', code: 'Escape' });
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  // ── Untested presets (AUDIT-020) ─────────────────────────────────────────────

  it('clicking "Last 3 months" calls onChange with valid ISO dates and closes the panel', () => {
    const onChange = jest.fn();
    renderWrapper(<DateRangePicker startDate={undefined} endDate={undefined} onChange={onChange} />);
    openDropdown();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Last 3 months' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const [start, end] = onChange.mock.calls[0];
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('clicking "Last 6 months" calls onChange with valid ISO dates and closes the panel', () => {
    const onChange = jest.fn();
    renderWrapper(<DateRangePicker startDate={undefined} endDate={undefined} onChange={onChange} />);
    openDropdown();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Last 6 months' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const [start, end] = onChange.mock.calls[0];
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('clicking "Last 12 months" calls onChange with valid ISO dates and closes the panel', () => {
    const onChange = jest.fn();
    renderWrapper(<DateRangePicker startDate={undefined} endDate={undefined} onChange={onChange} />);
    openDropdown();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Last 12 months' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const [start, end] = onChange.mock.calls[0];
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('clicking "Year to date" calls onChange with valid ISO dates and closes the panel', () => {
    const onChange = jest.fn();
    renderWrapper(<DateRangePicker startDate={undefined} endDate={undefined} onChange={onChange} />);
    openDropdown();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Year to date' }));
    expect(onChange).toHaveBeenCalledTimes(1);
    const [start, end] = onChange.mock.calls[0];
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  // ── Inverted range validation ────────────────────────────────────────────────

  it('shows an error and does not call onChange when Apply is clicked with end before start', () => {
    const onChange = jest.fn();
    renderWrapper(
      <DateRangePicker startDate={undefined} endDate={undefined} onChange={onChange} />,
    );
    openDropdown();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Custom' }));
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2024-09-01' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2024-03-01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.getByRole('alert')).toHaveTextContent(/end date must be on or after start date/i);
    // Panel stays open so the user can correct the input
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('clears the error and applies the range when the user corrects the inverted end date', () => {
    const onChange = jest.fn();
    renderWrapper(
      <DateRangePicker startDate={undefined} endDate={undefined} onChange={onChange} />,
    );
    openDropdown();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Custom' }));
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2024-09-01' } });
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2024-03-01' } });
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    // Correct the end date and apply again
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2024-12-31' } });
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Apply' }));
    expect(onChange).toHaveBeenCalledWith('2024-09-01', '2024-12-31');
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  // ── Last 30 days — verify actual 30-day offset (AUDIT-014) ─────────────────

  it('Last 30 days start date is approximately 30 days ago', () => {
    const onChange = jest.fn();
    renderWrapper(<DateRangePicker startDate={undefined} endDate={undefined} onChange={onChange} />);
    openDropdown();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Last 30 days' }));
    const [start] = onChange.mock.calls[0];
    const diff = (Date.now() - new Date(start).getTime()) / (1000 * 60 * 60 * 24);
    expect(diff).toBeGreaterThanOrEqual(29);
    expect(diff).toBeLessThanOrEqual(31);
  });
});
