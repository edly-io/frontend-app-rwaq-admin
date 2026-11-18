/**
 * StatsChartCard — the chart wrapper must be full width, and a scrolling chart must start at its left edge.
 */
import { renderWrapper } from '@src/setupTest';
import StatsChartCard from './StatsChartCard';

jest.mock('@src/components/charts/MetricChart', () => ({
  __esModule: true,
  default: ({ height }: { height: number }) => <div data-testid="metric-chart" data-height={height} />,
}));

const data = Array.from({ length: 10 }, (_, i) => ({ name: `Course ${i}`, value: i + 1 }));

describe('StatsChartCard', () => {
  it('gives the chart wrapper the full width so a responsive chart does not collapse', () => {
    const { getByTestId } = renderWrapper(
      <StatsChartCard title="Registrations" info="info" type="bar" data={data} series={['value']} />,
    );
    expect((getByTestId('metric-chart').parentElement as HTMLElement).style.width).toBe('100%');
  });

  it('centers the chart so a taller neighbour does not leave a gap under it', () => {
    const { getByTestId } = renderWrapper(
      <StatsChartCard title="Registrations" info="info" type="bar" data={data} series={['value']} />,
    );
    const row = (getByTestId('metric-chart').parentElement as HTMLElement).parentElement as HTMLElement;
    expect(row.style.marginTop).toBe('auto');
    expect(row.style.marginBottom).toBe('auto');
  });

  it('sizes a category chart from its longest label', () => {
    const short = [{ name: 'Free', value: 3 }, { name: 'Paid', value: 2 }];
    const long = [{ name: 'A very long course name indeed', value: 3 }, { name: 'Paid', value: 2 }];
    const height = (rows: typeof short) => {
      const { getByTestId, unmount } = renderWrapper(
        <StatsChartCard title="Top" info="info" type="bar" data={rows} series={['value']} categoryLabels />,
      );
      const value = Number(getByTestId('metric-chart').getAttribute('data-height'));
      unmount();
      return value;
    };
    expect(height(long)).toBeGreaterThan(height(short));
    expect(height(long)).toBeLessThanOrEqual(130 + 5 + 120);
  });

  it('start-aligns a scrolling category chart so the first bar is reachable', () => {
    const { getByTestId } = renderWrapper(
      <StatsChartCard title="Top" info="info" type="bar" data={data} series={['value']} categoryLabels />,
    );
    const wrapper = getByTestId('metric-chart').parentElement as HTMLElement;
    const row = wrapper.parentElement as HTMLElement;
    expect(row.style.justifyContent).toBe('flex-start');
    expect(row.style.overflowX).toBe('auto');
    // The Arabic build makes the wrapper RTL, which would start the row at its last bar.
    expect(row.style.direction).toBe('ltr');
    expect(wrapper.style.minWidth).toBe('900px');
  });
});
