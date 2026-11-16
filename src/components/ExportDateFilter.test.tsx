import { fireEvent, render, screen } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import ExportDateFilter, { presetRange } from './ExportDateFilter';

describe('export date filters', () => {
  it('uses the UTC month and day even when the browser date is already next month', () => {
    const now = new Date('2026-12-01T01:30:00+03:00');
    expect(presetRange('month', now)).toEqual(['2026-11-01', '2026-11-30']);
    expect(presetRange('lastMonth', now)).toEqual(['2026-10-01', '2026-10-31']);
    expect(presetRange('year', now)).toEqual(['2026-01-01', '2026-11-30']);
  });

  it('handles a leap February and the January year boundary', () => {
    expect(presetRange('lastMonth', new Date('2024-03-15T12:00:00Z'))).toEqual(['2024-02-01', '2024-02-29']);
    expect(presetRange('lastMonth', new Date('2026-01-01T00:00:00Z'))).toEqual(['2025-12-01', '2025-12-31']);
    expect(presetRange('all')).toEqual(['', '']);
  });

  it('passes custom dates and clears both boundaries', () => {
    const onChange = jest.fn();
    render(
      <IntlProvider locale="en">
        <ExportDateFilter kind="joined" from="2026-11-01" to="2026-11-10" onChange={onChange} />
      </IntlProvider>,
    );
    fireEvent.change(screen.getByLabelText('Joined to (UTC)'), { target: { value: '2026-11-16' } });
    expect(onChange).toHaveBeenLastCalledWith('2026-11-01', '2026-11-16');
    fireEvent.change(screen.getByLabelText('Date range (UTC)'), { target: { value: 'all' } });
    expect(onChange).toHaveBeenLastCalledWith('', '');
  });

  it('labels the organization creation range separately', () => {
    render(
      <IntlProvider locale="en">
        <ExportDateFilter kind="created" from="" to="" onChange={jest.fn()} />
      </IntlProvider>,
    );
    expect(screen.getByLabelText('Created from (UTC)')).toBeInTheDocument();
    expect(screen.getByLabelText('Created to (UTC)')).toBeInTheDocument();
  });
});
