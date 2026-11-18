/**
 * Small formatting helpers shared by the stats strips.
 */
import type { ChartDataPoint } from '@src/components/charts/MetricChart';

/** One month of a zero-filled series, as the stats endpoints send it. */
export interface SeriesPoint {
  period: string;
  value: number;
}

/** A count with thousands separators. null stays null so the tile can say "Not available". */
export const formatCount = (value: number | null | undefined): string | null => (
  value === null || value === undefined ? null : value.toLocaleString()
);

/** A percentage with one decimal as sent by the backend. null stays null. */
export const formatPercent = (value: number | null | undefined): string | null => (
  value === null || value === undefined ? null : `${value}%`
);

/** "2026-08" to the short month name of the locale. */
export const formatMonth = (period: string, locale: string): string => {
  const [year, month] = period.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString(locale, { month: 'short' });
};

/** Reshape a monthly series for MetricChart, which keys on `name` plus a series key. */
export const monthlyChartData = (
  points: SeriesPoint[] | null | undefined,
  seriesKey: string,
  locale: string,
): ChartDataPoint[] => (points ?? []).map((point) => ({
  name: formatMonth(point.period, locale),
  [seriesKey]: point.value,
}));

/** True when there is nothing to draw: no points, or every point of the series is zero. */
export const isEmptySeries = (data: ChartDataPoint[], seriesKey: string): boolean => (
  data.length === 0 || data.every((point) => point[seriesKey] === 0)
);
