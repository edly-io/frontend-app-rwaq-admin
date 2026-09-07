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

  it('calls onChange when the start date changes and end is already filled', () => {
    const onChange = jest.fn();
    renderWrapper(
      <DateRangePicker startDate="2024-03-15" endDate="2024-06-20" onChange={onChange} />,
    );
    openDropdown();
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2024-04-01' } });
    expect(onChange).toHaveBeenCalledWith('2024-04-01', '2024-06-20');
  });

  it('calls onChange when the end date changes and start is already filled', () => {
    const onChange = jest.fn();
    renderWrapper(
      <DateRangePicker startDate="2024-03-15" endDate="2024-06-20" onChange={onChange} />,
    );
    openDropdown();
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2024-07-31' } });
    expect(onChange).toHaveBeenCalledWith('2024-03-15', '2024-07-31');
  });

  it('does not call onChange when only start is filled and end is empty', () => {
    const onChange = jest.fn();
    renderWrapper(
      <DateRangePicker startDate={undefined} endDate={undefined} onChange={onChange} />,
    );
    openDropdown();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Custom' }));
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2024-04-01' } });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('calls onChange when end is filled after start, completing the range', () => {
    const onChange = jest.fn();
    renderWrapper(
      <DateRangePicker startDate={undefined} endDate={undefined} onChange={onChange} />,
    );
    openDropdown();
    fireEvent.click(screen.getByRole('menuitem', { name: 'Custom' }));
    fireEvent.change(screen.getByLabelText('From'), { target: { value: '2024-04-01' } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.change(screen.getByLabelText('To'), { target: { value: '2024-07-31' } });
    expect(onChange).toHaveBeenCalledWith('2024-04-01', '2024-07-31');
    // Dropdown closes after both dates are set
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
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

  it('toggle button label reflects the active preset', () => {
    renderWrapper(
      <DateRangePicker startDate="2024-03-15" endDate="2024-06-20" onChange={noop} />,
    );
    // Arbitrary date pair → Custom
    expect(screen.getByRole('button', { name: /custom/i })).toBeInTheDocument();
  });
});
