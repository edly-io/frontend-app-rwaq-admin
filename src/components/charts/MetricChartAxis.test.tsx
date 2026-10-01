/**
 * MetricChart's axis props. Recharts draws nothing in jsdom, so it is replaced
 * here by stand-ins that record the props MetricChart hands them. The point:
 * without the optional valueFormatter and yAxisWidth, every existing chart
 * (the dashboard's) gets exactly the axis props it got before.
 */
import { renderWrapper } from '@src/setupTest';
import MetricChart from './MetricChart';

const mockSeen: Record<string, Record<string, unknown>> = {};

jest.mock('recharts', () => {
  const passThrough = ({ children }: { children?: unknown }) => children ?? null;
  const recorder = (name: string) => (props: Record<string, unknown>) => {
    mockSeen[name] = props;
    return null;
  };
  return {
    ResponsiveContainer: passThrough,
    LineChart: passThrough,
    BarChart: passThrough,
    PieChart: passThrough,
    Line: recorder('Line'),
    Bar: passThrough,
    Pie: passThrough,
    Cell: recorder('Cell'),
    CartesianGrid: recorder('CartesianGrid'),
    Legend: recorder('Legend'),
    XAxis: recorder('XAxis'),
    YAxis: recorder('YAxis'),
    Tooltip: recorder('Tooltip'),
  };
});

beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    })),
  });
});

const data = [
  { name: 'Jan', value: 100 },
  { name: 'Feb', value: 250 },
];

beforeEach(() => {
  Object.keys(mockSeen).forEach((key) => delete mockSeen[key]);
});

describe('MetricChart without the new props', () => {
  it.each(['bar', 'line'] as const)('leaves the %s chart\'s axes and tooltip as they were', (type) => {
    renderWrapper(<MetricChart type={type} data={data} ariaLabel="Chart" />);

    const y = mockSeen.YAxis;
    expect(y.width).toBe(36);
    expect(y.allowDecimals).toBe(false);
    // Five whole-number ticks up to the largest value, rounded up by the step: ceil(250 / 4) = 63.
    expect(y.ticks).toEqual([0, 63, 126, 189, 252]);
    expect(y.domain).toEqual([0, 252]);
    expect('tickFormatter' in y).toBe(false);

    const x = mockSeen.XAxis;
    expect(x.interval).toBe(0);
    expect(x.dy).toBe(6);
    expect('angle' in x).toBe(false);
    expect('height' in x).toBe(false);

    expect('formatter' in mockSeen.Tooltip).toBe(false);
  });

  it('keeps the tilted x labels as they were', () => {
    renderWrapper(<MetricChart type="bar" data={data} ariaLabel="Chart" xLabelAngle={60} maxXLabels={1} />);

    expect(mockSeen.XAxis).toEqual(expect.objectContaining({
      dy: 4, angle: -60, textAnchor: 'end', height: 64, interval: 1,
    }));
    expect(mockSeen.YAxis.width).toBe(36);
  });
});

describe('MetricChart with valueFormatter and yAxisWidth', () => {
  const format = (value: number) => `SAR ${value.toFixed(2)}`;

  it('formats the ticks and the tooltip value, and widens the axis', () => {
    renderWrapper(
      <MetricChart type="bar" data={data} ariaLabel="Chart" valueFormatter={format} yAxisWidth={72} />,
    );

    expect(mockSeen.YAxis.width).toBe(72);
    expect((mockSeen.YAxis.tickFormatter as (value: number) => string)(63)).toBe('SAR 63.00');
    const tooltip = mockSeen.Tooltip.formatter as (value: number | string | (number | string)[]) => unknown;
    expect(tooltip(1234.5)).toBe('SAR 1234.50');
  });

  it('passes a value that is not a number through untouched', () => {
    renderWrapper(<MetricChart type="line" data={data} ariaLabel="Chart" valueFormatter={format} />);

    const tooltip = mockSeen.Tooltip.formatter as (value: number | string | (number | string)[]) => unknown;
    expect(tooltip('n/a')).toBe('n/a');
    expect(mockSeen.YAxis.width).toBe(36);
  });

  it('does not change the ticks the axis computes', () => {
    renderWrapper(<MetricChart type="bar" data={data} ariaLabel="Chart" valueFormatter={format} />);

    expect(mockSeen.YAxis.ticks).toEqual([0, 63, 126, 189, 252]);
  });
});
