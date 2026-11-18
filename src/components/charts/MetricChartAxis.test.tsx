/**
 * MetricChart's axis props. Recharts draws nothing in jsdom, so it is replaced
 * here by stand-ins that record the props MetricChart hands them. The point:
 * without the optional valueFormatter and yAxisWidth, every existing chart
 * (the dashboard's) gets exactly the axis props it got before.
 */
import type { ReactElement } from 'react';
import { render } from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { renderWrapper } from '@src/setupTest';
import MetricChart, { CategoryTick, categoryLabel } from './MetricChart';
import { categoryLabelAreaHeight } from './categoryLabels';

const mockSeen: Record<string, Record<string, unknown>> = {};

/** The text the axis draws for one category, rendered through the tick element MetricChart hands the XAxis. */
const drawnLabel = (name: string, rtl: boolean): string | null | undefined => {
  const tick = mockSeen.XAxis.tick as ReactElement<{ rtl: boolean; truncate: boolean }>;
  expect(tick.type).toBe(CategoryTick);
  expect(tick.props.rtl).toBe(rtl);
  const { container } = render(<svg><CategoryTick {...tick.props} payload={{ value: name }} /></svg>);
  return container.querySelector('text')?.lastChild?.textContent;
};

jest.mock('recharts', () => {
  const passThrough = ({ children }: { children?: unknown }) => children ?? null;
  const recorder = (name: string) => (props: Record<string, unknown>) => {
    mockSeen[name] = props;
    return null;
  };
  return {
    ResponsiveContainer: passThrough,
    LineChart: passThrough,
    BarChart: (props: Record<string, unknown>) => { mockSeen.BarChart = props; return props.children ?? null; },
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

describe('named categories below vertical bars', () => {
  const categories = [
    { name: 'A very long organization name (7)', value: 3 },
    { name: 'Rwaq (40)', value: 9 },
  ];

  it('keeps full names in the tooltip and shortens only angled axis labels', () => {
    renderWrapper(<MetricChart type="bar" data={categories} ariaLabel="Organizations" categoryLabels />);

    expect(mockSeen.BarChart.layout).toBe('horizontal');
    expect(mockSeen.XAxis.dataKey).toBe('name');
    expect(mockSeen.XAxis.angle).toBe(-55);
    expect(mockSeen.XAxis.height).toBe(categoryLabelAreaHeight(categories.map((c) => c.name), false));
    expect(mockSeen.YAxis.allowDecimals).toBe(false);
    expect(drawnLabel(categories[0].name, false)).toBe('A very long organ… (7)');
    expect(drawnLabel(categories[1].name, false)).toBe('Rwaq (40)');
    expect(categories[0].name).toBe('A very long organization name (7)');
    expect(categoryLabel(categories[0].name, false)).toBe('A very long o… (7)');
  });

  it('shortens Arabic labels and leaves enough space below the axis', () => {
    render(<IntlProvider locale="ar"><MetricChart type="bar" data={categories} ariaLabel="Organizations" categoryLabels /></IntlProvider>);

    expect(mockSeen.XAxis.height).toBe(categoryLabelAreaHeight(categories.map((c) => c.name), true));
    expect(mockSeen.XAxis.interval).toBe(0);
    expect(drawnLabel('مؤسسة التعليم العالي (4)', true)).toBe('مؤسسة التعليم… (4)');
  });

  it('keeps every label on a top-ten vertical chart', () => {
    renderWrapper(<MetricChart type="bar" data={Array.from({ length: 10 }, (_, i) => ({ name: `Course ${i}`, value: i }))} ariaLabel="Courses" categoryLabels />);
    expect(mockSeen.XAxis.interval).toBe(0);
  });
});
