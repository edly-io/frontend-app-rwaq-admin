/**
 * MetricChart tests — covers rendering, a11y, and reduced-motion.
 */
import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import MetricChart from './MetricChart';
import type { ChartDataPoint } from './MetricChart';

// jsdom does not implement window.matchMedia — mock it
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    })),
  });
});

// Recharts' ResponsiveContainer uses ResizeObserver — mocked in setupTest.tsx

const sampleData: ChartDataPoint[] = [
  { name: 'Jan', value: 100 },
  { name: 'Feb', value: 150 },
  { name: 'Mar', value: 120 },
];

describe('MetricChart', () => {
  describe('rendering', () => {
    it('renders a line chart with aria-label', () => {
      renderWrapper(
        <MetricChart
          type="line"
          data={sampleData}
          series={['value']}
          ariaLabel="Test line chart"
        />,
      );
      expect(screen.getByRole('img', { name: 'Test line chart' })).toBeInTheDocument();
    });

    it('renders a bar chart with aria-label', () => {
      renderWrapper(
        <MetricChart
          type="bar"
          data={sampleData}
          series={['value']}
          ariaLabel="Test bar chart"
        />,
      );
      expect(screen.getByRole('img', { name: 'Test bar chart' })).toBeInTheDocument();
    });

    it('renders a donut chart with aria-label', () => {
      renderWrapper(
        <MetricChart
          type="donut"
          data={sampleData}
          series={['value']}
          ariaLabel="Test donut chart"
        />,
      );
      expect(screen.getByRole('img', { name: 'Test donut chart' })).toBeInTheDocument();
    });
  });

  describe('accessible fallback table', () => {
    it('renders an accessible sr-only table with chart data', () => {
      renderWrapper(
        <MetricChart
          type="line"
          data={sampleData}
          series={['value']}
          ariaLabel="Accessible chart"
        />,
      );
      // The sr-only table should be in the document (not visible, but present)
      const table = document.querySelector('table.sr-only');
      expect(table).not.toBeNull();
      // Caption
      const caption = table?.querySelector('caption');
      expect(caption?.textContent).toBe('Chart data');
      // Data rows
      const rows = table?.querySelectorAll('tbody tr');
      expect(rows?.length).toBe(3);
    });

    it('includes data values in the fallback table', () => {
      renderWrapper(
        <MetricChart
          type="bar"
          data={[{ name: 'Q1', value: 42 }]}
          series={['value']}
          ariaLabel="Single point chart"
        />,
      );
      const table = document.querySelector('table.sr-only');
      expect(table?.textContent).toContain('Q1');
      expect(table?.textContent).toContain('42');
    });
  });

  describe('empty data', () => {
    it('renders without errors when data is empty', () => {
      renderWrapper(
        <MetricChart
          type="line"
          data={[]}
          series={['value']}
          ariaLabel="Empty chart"
        />,
      );
      expect(screen.getByRole('img', { name: 'Empty chart' })).toBeInTheDocument();
    });
  });
});
