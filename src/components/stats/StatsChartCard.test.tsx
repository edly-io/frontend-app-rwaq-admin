/**
 * StatsChartCard — the chart wrapper must be full width, and a scrolling chart must start at its left edge.
 */
import { renderWrapper } from '@src/setupTest';
import StatsChartCard from './StatsChartCard';

jest.mock('@src/components/charts/MetricChart', () => ({
  __esModule: true,
  default: () => <div data-testid="metric-chart" />,
}));

const data = Array.from({ length: 10 }, (_, i) => ({ name: `Course ${i}`, value: i + 1 }));

describe('StatsChartCard', () => {
  it('gives the chart wrapper the full width so a responsive chart does not collapse', () => {
    const { getByTestId } = renderWrapper(
      <StatsChartCard title="Registrations" info="info" type="bar" data={data} series={['value']} />,
    );
    expect((getByTestId('metric-chart').parentElement as HTMLElement).style.width).toBe('100%');
  });

  it('start-aligns a scrolling category chart so the first bar is reachable', () => {
    const { getByTestId } = renderWrapper(
      <StatsChartCard title="Top" info="info" type="bar" data={data} series={['value']} categoryLabels />,
    );
    const wrapper = getByTestId('metric-chart').parentElement as HTMLElement;
    const row = wrapper.parentElement as HTMLElement;
    expect(row.style.justifyContent).toBe('flex-start');
    expect(row.style.overflowX).toBe('auto');
    expect(wrapper.style.minWidth).toBe('900px');
  });
});
