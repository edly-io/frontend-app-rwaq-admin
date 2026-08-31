import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import DateRangePicker from './DateRangePicker';

describe('DateRangePicker', () => {
  const noop = () => {};

  it('renders all preset chips', () => {
    renderWrapper(
      <DateRangePicker startDate={undefined} endDate={undefined} onChange={noop} />,
    );
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    expect(screen.getByText('Last 3 months')).toBeInTheDocument();
    expect(screen.getByText('Last 6 months')).toBeInTheDocument();
    expect(screen.getByText('Last 12 months')).toBeInTheDocument();
    expect(screen.getByText('Year to date')).toBeInTheDocument();
    expect(screen.getByText('All time')).toBeInTheDocument();
    expect(screen.getByText('Custom')).toBeInTheDocument();
  });

  it('marks "All time" as active when no dates are set', () => {
    renderWrapper(
      <DateRangePicker startDate={undefined} endDate={undefined} onChange={noop} />,
    );
    const allTimeBtn = screen.getByText('All time').closest('button');
    expect(allTimeBtn).toHaveAttribute('aria-pressed', 'true');
  });

  it('calls onChange with undefined/undefined when "All time" is clicked', () => {
    const onChange = jest.fn();
    renderWrapper(
      <DateRangePicker startDate="2025-01-01" endDate="2025-12-31" onChange={onChange} />,
    );
    fireEvent.click(screen.getByText('All time'));
    expect(onChange).toHaveBeenCalledWith(undefined, undefined);
  });

  it('calls onChange with computed dates when a preset is clicked', () => {
    const onChange = jest.fn();
    renderWrapper(
      <DateRangePicker startDate={undefined} endDate={undefined} onChange={onChange} />,
    );
    fireEvent.click(screen.getByText('Last 30 days'));
    expect(onChange).toHaveBeenCalledTimes(1);
    const [start, end] = onChange.mock.calls[0];
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(new Date(end) >= new Date(start)).toBe(true);
  });

  it('does not render date inputs when a named preset is active', () => {
    renderWrapper(
      <DateRangePicker startDate={undefined} endDate={undefined} onChange={noop} />,
    );
    expect(screen.queryByLabelText('From')).not.toBeInTheDocument();
    expect(screen.queryByLabelText('To')).not.toBeInTheDocument();
  });

  it('shows date inputs when the active preset is custom', () => {
    // An arbitrary date pair that doesn't match any preset → custom
    renderWrapper(
      <DateRangePicker startDate="2024-03-15" endDate="2024-06-20" onChange={noop} />,
    );
    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
  });

  it('calls onChange when the start date input changes', () => {
    const onChange = jest.fn();
    renderWrapper(
      <DateRangePicker startDate="2024-03-15" endDate="2024-06-20" onChange={onChange} />,
    );
    const startInput = screen.getByLabelText('From');
    fireEvent.change(startInput, { target: { value: '2024-04-01' } });
    expect(onChange).toHaveBeenCalledWith('2024-04-01', '2024-06-20');
  });

  it('calls onChange when the end date input changes', () => {
    const onChange = jest.fn();
    renderWrapper(
      <DateRangePicker startDate="2024-03-15" endDate="2024-06-20" onChange={onChange} />,
    );
    const endInput = screen.getByLabelText('To');
    fireEvent.change(endInput, { target: { value: '2024-07-31' } });
    expect(onChange).toHaveBeenCalledWith('2024-03-15', '2024-07-31');
  });

  it('passes undefined for start when start input is cleared', () => {
    const onChange = jest.fn();
    renderWrapper(
      <DateRangePicker startDate="2024-03-15" endDate="2024-06-20" onChange={onChange} />,
    );
    const startInput = screen.getByLabelText('From');
    fireEvent.change(startInput, { target: { value: '' } });
    expect(onChange).toHaveBeenCalledWith(undefined, '2024-06-20');
  });

  it('clicking Custom chip shows date inputs without calling onChange', () => {
    const onChange = jest.fn();
    renderWrapper(
      <DateRangePicker startDate={undefined} endDate={undefined} onChange={onChange} />,
    );
    // Initially no inputs
    expect(screen.queryByLabelText('From')).not.toBeInTheDocument();
    // Click Custom
    fireEvent.click(screen.getByText('Custom'));
    // Inputs now visible; onChange not called
    expect(screen.getByLabelText('From')).toBeInTheDocument();
    expect(screen.getByLabelText('To')).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('marks the matching preset chip as active when dates match a preset', () => {
    // We cannot know the exact dates at test time (they are relative to "today"),
    // so we test the "All time" case which is deterministic.
    renderWrapper(
      <DateRangePicker startDate={undefined} endDate={undefined} onChange={noop} />,
    );
    const allTimeBtn = screen.getByText('All time').closest('button');
    // The active chip uses variant="primary"; unselected ones use "outline-primary".
    // Paragon renders variant as a class suffix on the btn element.
    expect(allTimeBtn?.className).toMatch(/btn-primary/);

    const last30Btn = screen.getByText('Last 30 days').closest('button');
    expect(last30Btn?.className).toMatch(/btn-outline-primary/);
  });
});
