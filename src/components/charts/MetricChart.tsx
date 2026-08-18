/**
 * MetricChart — the ONLY file that imports from 'recharts'.
 * All other components import this wrapper; never recharts directly.
 *
 * Colors are resolved from Paragon CSS custom properties at runtime so a brand
 * change re-themes charts without a rebuild.
 *
 * Respects prefers-reduced-motion: disables all Recharts animation when the
 * media query is active.
 */
import { useEffect, useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

// ── Paragon token resolver ────────────────────────────────────────────────────

/**
 * Reads a Paragon CSS custom property from the document root at runtime.
 * Returns a fallback if the property is not defined (e.g. in tests).
 */
export const resolveParagonToken = (token: string, fallback: string): string => {
  if (typeof window === 'undefined') {
    return fallback;
  }
  const value = getComputedStyle(document.documentElement).getPropertyValue(token).trim();
  return value || fallback;
};

/** Brand-aligned chart palette sourced from Paragon tokens. */
export const getChartColors = (): string[] => [
  resolveParagonToken('--pgn-color-primary-500', '#0D7D4D'),
  resolveParagonToken('--pgn-color-info-500', '#0070D2'),
  resolveParagonToken('--pgn-color-warning-500', '#FFB81C'),
  resolveParagonToken('--pgn-color-danger-500', '#C00000'),
  resolveParagonToken('--pgn-color-success-500', '#178253'),
];

// ── Types ─────────────────────────────────────────────────────────────────────

export type ChartType = 'line' | 'bar' | 'donut';

export interface ChartDataPoint {
  name: string;
  [key: string]: string | number;
}

export interface MetricChartProps {
  /** Chart variant */
  type: ChartType;
  /** Data array — each element is one X-axis point or pie slice */
  data: ChartDataPoint[];
  /** Names of the numeric series keys in each data object (bar/line only) */
  series?: string[];
  /** Accessible label for screen readers */
  ariaLabel: string;
  /** Optional chart height in px; defaults to 300 */
  height?: number;
  /** Hide axes/grid for sparkline usage */
  compact?: boolean;
  /** Hide legend */
  hideLegend?: boolean;
}

// ── Reduced-motion hook ───────────────────────────────────────────────────────

const usePrefersReducedMotion = (): boolean => {
  const [prefers, setPrefers] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefers(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefers(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefers;
};

// ── Accessible data table fallback ───────────────────────────────────────────

interface FallbackTableProps {
  data: ChartDataPoint[];
  series: string[];
}

const AccessibleFallbackTable = ({ data, series }: FallbackTableProps) => (
  <table className="sr-only">
    <caption>Chart data</caption>
    <thead>
      <tr>
        <th scope="col">Label</th>
        {series.map((s) => <th key={s} scope="col">{s}</th>)}
      </tr>
    </thead>
    <tbody>
      {data.map((row) => (
        <tr key={row.name}>
          <td>{row.name}</td>
          {series.map((s) => <td key={s}>{row[s]}</td>)}
        </tr>
      ))}
    </tbody>
  </table>
);

// ── Main component ────────────────────────────────────────────────────────────

const MetricChart = ({
  type,
  data,
  series = ['value'],
  ariaLabel,
  height = 300,
  compact = false,
  hideLegend = false,
}: MetricChartProps) => {
  const reducedMotion = usePrefersReducedMotion();
  const colors = getChartColors();

  const chartProps = {
    isAnimationActive: !reducedMotion,
  };

  const axisProps = compact
    ? {}
    : {
      xAxis: <XAxis dataKey="name" tick={{ fontSize: 12 }} />,
      yAxis: <YAxis tick={{ fontSize: 12 }} />,
      grid: <CartesianGrid strokeDasharray="3 3" stroke={resolveParagonToken('--pgn-color-gray-300', '#dee2e6')} />,
    };

  const renderContent = () => {
    if (type === 'line') {
      return (
        <LineChart data={data}>
          {!compact && axisProps.grid}
          {!compact && axisProps.xAxis}
          {!compact && axisProps.yAxis}
          <Tooltip />
          {!hideLegend && !compact && <Legend />}
          {series.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              dot={!compact}
              {...chartProps}
            />
          ))}
        </LineChart>
      );
    }

    if (type === 'bar') {
      return (
        <BarChart data={data}>
          {!compact && axisProps.grid}
          {!compact && axisProps.xAxis}
          {!compact && axisProps.yAxis}
          <Tooltip />
          {!hideLegend && !compact && <Legend />}
          {series.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[i % colors.length]}
              {...chartProps}
            />
          ))}
        </BarChart>
      );
    }

    if (type === 'donut') {
      return (
        <PieChart>
          <Pie
            data={data}
            dataKey={series[0] ?? 'value'}
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius="55%"
            outerRadius="80%"
            {...chartProps}
          >
            {data.map((_entry, index) => (
              // eslint-disable-next-line react/no-array-index-key
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
            ))}
          </Pie>
          <Tooltip />
          {!hideLegend && <Legend />}
        </PieChart>
      );
    }

    return null;
  };

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      style={{ width: '100%' }}
    >
      <ResponsiveContainer width="100%" height={height}>
        {/* @ts-ignore — ResponsiveContainer accepts a single child element */}
        {renderContent()}
      </ResponsiveContainer>
      <AccessibleFallbackTable data={data} series={series} />
    </div>
  );
};

export default MetricChart;
