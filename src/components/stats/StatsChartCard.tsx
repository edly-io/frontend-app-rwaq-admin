/**
 * StatsChartCard — a card with a title, an info tooltip and one compact chart.
 *
 * The chart keeps a short fixed height so the table below stays the main thing on the page.
 * Loading, empty and "not available" are three different states and never look like a flat zero line.
 */
import { Skeleton } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import InfoTooltip from '@src/components/InfoTooltip';
import MetricChart from '@src/components/charts/MetricChart';
import type { ChartDataPoint, ChartType } from '@src/components/charts/MetricChart';
import messages from './messages';

export const COMPACT_CHART_HEIGHT = 150;

export interface StatsChartCardProps {
  title: string;
  info: string;
  subtitle?: string;
  type: ChartType;
  data: ChartDataPoint[];
  /** Series keys of bar and line charts. */
  series?: string[];
  isLoading?: boolean;
  /** The source could not be read: say so instead of drawing zeros. */
  isUnavailable?: boolean;
  /** Nothing to draw, for example every month is zero. */
  isEmpty?: boolean;
  xLabelAngle?: number;
  categoryLabels?: boolean;
  maxXLabels?: number;
  unavailableLabels?: string[];
  /** Show the legend of a bar or line chart. Needed with more than one series. */
  showLegend?: boolean;
}

const StatsChartCard = ({
  title, info, subtitle, type, data, series, isLoading = false, isUnavailable = false, isEmpty = false,
  xLabelAngle, categoryLabels = false, maxXLabels, unavailableLabels = [], showLegend = false,
}: StatsChartCardProps) => {
  const intl = useIntl();

  const renderBody = () => {
    if (isLoading) {
      return <Skeleton height={COMPACT_CHART_HEIGHT} style={{ display: 'block' }} />;
    }
    if (isUnavailable) {
      return (
        <div className="rwaq-dash-card__empty">{intl.formatMessage(messages.chartUnavailable)}</div>
      );
    }
    if (isEmpty || data.length === 0) {
      return <div className="rwaq-dash-card__empty">{intl.formatMessage(messages.chartEmpty)}</div>;
    }
    return (
      // Start-aligned: a centered flex row that overflows loses its left half to unreachable scroll.
      <div className="rwaq-chart" style={categoryLabels ? { overflowX: 'auto', justifyContent: 'flex-start' } : undefined}>
        {/* Full width: a content-sized wrapper gives the responsive chart 0px. */}
        <div style={{ width: '100%', ...(categoryLabels ? { minWidth: data.length * 90 } : {}) }}>
          <MetricChart
            type={type}
            data={data}
            series={series}
            ariaLabel={title}
            height={categoryLabels ? 240 : COMPACT_CHART_HEIGHT}
            hideLegend={type !== 'donut' && !showLegend}
            xLabelAngle={xLabelAngle}
            categoryLabels={categoryLabels}
            maxXLabels={maxXLabels}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="rwaq-card rwaq-dash-card">
      <div className="rwaq-dash-card__head">
        <InfoTooltip text={info}>
          <h3 className="rwaq-section-title mb-0">{title}</h3>
        </InfoTooltip>
        {subtitle && <span className="rwaq-dash-card__sub">{subtitle}</span>}
      </div>
      {renderBody()}
      {!isLoading && unavailableLabels.map((label) => (
        <div key={label} className="text-muted small">{label}: {intl.formatMessage(messages.chartUnavailable)}</div>
      ))}
    </div>
  );
};

export default StatsChartCard;
