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
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  fallbackTableCaption: {
    id: 'rwaq.admin.metricChart.fallbackTable.caption',
    defaultMessage: 'Chart data',
    description: 'Caption for the screen-reader-only data table that mirrors a chart',
  },
  fallbackTableLabelColumn: {
    id: 'rwaq.admin.metricChart.fallbackTable.labelColumn',
    defaultMessage: 'Label',
    description: 'Header for the row-label column in the screen-reader-only chart data table',
  },
});

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

/**
 * A tonal ramp of the brand accent, for slices of one whole.
 *
 * The categorical palette below jumps teal → blue → yellow → red, which on a
 * course-lifecycle donut implies the states are unrelated and that one of them
 * is an error. They are four parts of the same total, so they read better as
 * one hue stepping down in weight.
 */
export const getSequentialChartColors = (): string[] => [
  resolveParagonToken('--rwaq-accent', '#449cc2'),
  'rgba(68, 156, 194, 0.72)',
  'rgba(68, 156, 194, 0.48)',
  'rgba(68, 156, 194, 0.26)',
];

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

const AccessibleFallbackTable = ({ data, series }: FallbackTableProps) => {
  const intl = useIntl();
  return (
    <table className="sr-only">
      <caption>{intl.formatMessage(messages.fallbackTableCaption)}</caption>
      <thead>
        <tr>
          <th scope="col">{intl.formatMessage(messages.fallbackTableLabelColumn)}</th>
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
};

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
  // Slices of one total read as one hue; independent series need distinct ones.
  const sliceColors = getSequentialChartColors();

  const chartProps = {
    isAnimationActive: !reducedMotion,
  };

  // Chart chrome is deliberately quiet: the data is the subject, and a dashed
  // grid plus boxed axes competes with it. Horizontal rules only, no axis
  // lines, no tick marks, muted labels — the reading aids stay, the scaffolding
  // goes.
  const mutedTick = {
    fontSize: 11,
    fill: resolveParagonToken('--rwaq-muted', '#6b7280'),
  };
  const ruleColor = resolveParagonToken('--rwaq-border', '#e6e8ec');

  const axisProps = compact
    ? {}
    : {
      xAxis: (
        <XAxis
          dataKey="name"
          tick={mutedTick}
          axisLine={false}
          tickLine={false}
          dy={6}
        />
      ),
      yAxis: (
        <YAxis
          tick={mutedTick}
          axisLine={false}
          tickLine={false}
          // These series are counts. Without this Recharts invents fractional
          // ticks (0, 0.75, 1.5…) for small integer data, which reads as a
          // measurement error rather than a tally.
          allowDecimals={false}
          width={36}
        />
      ),
      grid: (
        <CartesianGrid
          horizontal
          vertical={false}
          stroke={ruleColor}
        />
      ),
    };

  /** Tooltip styled from the design tokens rather than Recharts' defaults. */
  const tooltipStyle = {
    contentStyle: {
      background: resolveParagonToken('--rwaq-card-bg', '#ffffff'),
      border: `1px solid ${ruleColor}`,
      borderRadius: '0.5rem',
      boxShadow: '0 4px 12px rgba(16, 24, 40, 0.1)',
      fontSize: '0.8125rem',
    },
    labelStyle: {
      color: resolveParagonToken('--rwaq-muted', '#6b7280'),
      marginBottom: '0.25rem',
    },
    cursor: { fill: resolveParagonToken('--rwaq-row-hover', 'rgba(0,0,0,0.04)') },
  };

  const renderContent = () => {
    if (type === 'line') {
      return (
        <LineChart data={data}>
          {!compact && axisProps.grid}
          {!compact && axisProps.xAxis}
          {!compact && axisProps.yAxis}
          <Tooltip {...tooltipStyle} />
          {!hideLegend && !compact && <Legend />}
          {series.map((key, i) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={colors[i % colors.length]}
              strokeWidth={2}
              // A dot per month clutters a 12-point series; the endpoint is
              // the one that carries meaning.
              dot={false}
              activeDot={{ r: 4 }}
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
          <Tooltip {...tooltipStyle} />
          {!hideLegend && !compact && <Legend />}
          {series.map((key, i) => (
            <Bar
              key={key}
              dataKey={key}
              fill={colors[i % colors.length]}
              radius={[3, 3, 0, 0]}
              maxBarSize={44}
              {...chartProps}
            >
              {/* The latest period is what a reader looks for first, so it
                  carries full weight and the history sits back. */}
              {data.map((entry, index) => (
                <Cell
                  key={`${key}-${entry.name}`}
                  fill={colors[i % colors.length]}
                  fillOpacity={index === data.length - 1 ? 1 : 0.55}
                />
              ))}
            </Bar>
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
            innerRadius="58%"
            outerRadius="82%"
            paddingAngle={2}
            stroke="none"
            {...chartProps}
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={sliceColors[index % sliceColors.length]} />
            ))}
          </Pie>
          <Tooltip {...tooltipStyle} />
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
      // rwaq-chart centres the plot and its legend: Recharts lays the SVG out
      // from its own margins, so in a wide card it sat left of centre with the
      // legend anchored to the plot rather than the card.
      className="rwaq-chart"
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
