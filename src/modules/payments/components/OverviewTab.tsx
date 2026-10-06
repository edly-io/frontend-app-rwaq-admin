/**
 * Overview — the KPI tiles and the trends for one date range and, optionally,
 * one partner. Nothing on this tab is a list: the orders are on Payment history.
 *
 * The date range is this tab's own, like every tab's.
 */
import { useState } from 'react';
import {
  Alert, Button, ButtonGroup, Form,
} from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import InfoTooltip from '@src/components/InfoTooltip';
import MetricChart from '@src/components/charts/MetricChart';
import { usePaymentsSummary } from '../data/hooks';
import type { Granularity, PaymentsSummary, SeriesPoint } from '../data/types';
import messages from '../messages';
import PaymentKpi from './PaymentKpi';
import {
  CURRENCY, DateFilter, formatAmount, formatMoney, formatTileAmount, useDateRange, usePartnerFilter,
} from './shared';
import type { ListTabProps } from './shared';

const CHART_HEIGHT = 240;
const LABEL_ANGLE = 60;
// How many x-axis labels fit at 60 degrees: a full-width chart holds more than a half-width one.
const FULL_WIDTH_LABELS = 45;
const HALF_WIDTH_LABELS = 28;
// Room for y-axis labels of money: "1,250,000.00" at the axis' 11px font.
const MONEY_AXIS_WIDTH = 72;

/** "2026-09-10" → a label for the x axis that suits the granularity. */
const periodLabel = (
  period: string,
  granularity: Granularity,
  locale: string,
  weekOf: (date: string) => string,
) => {
  const [year, month, day] = period.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  if (granularity === 'month') { return date.toLocaleDateString(locale, { month: 'short', year: 'numeric' }); }
  // With the year, a range over a year end never repeats a label ("Dec 30" in two years).
  const short = date.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
  return granularity === 'week' ? weekOf(short) : short;
};

interface TrendChartProps {
  title: string;
  info: string;
  subtitle: string;
  summary: PaymentsSummary | undefined;
  isLoading: boolean;
  isError: boolean;
  series: { key: string; value: (point: SeriesPoint) => number }[];
  hideLegend?: boolean;
  granularity: Granularity;
  maxLabels: number;
  /** For money series: formats the y-axis ticks and the tooltip, and widens the axis to fit. */
  formatValue?: (value: number) => string;
}

const TrendChart = ({
  title, info, subtitle, summary, isLoading, isError, series, hideLegend, granularity, maxLabels, formatValue,
}: TrendChartProps) => {
  const intl = useIntl();
  const data = (summary?.series ?? []).map((point) => ({
    name: periodLabel(
      point.period,
      // The kept previous data was fetched at its own granularity until the new one arrives.
      summary?.granularity ?? granularity,
      intl.locale,
      (date) => intl.formatMessage(messages.weekOf, { date }),
    ),
    ...Object.fromEntries(series.map(({ key, value }) => [key, value(point)])),
  }));

  const renderBody = () => {
    if (isLoading) { return <div style={{ height: CHART_HEIGHT }} />; }
    if (isError) {
      return (
        <div className="rwaq-dash-card__empty" style={{ height: CHART_HEIGHT }}>
          {intl.formatMessage(messages.chartUnavailable)}
        </div>
      );
    }
    if (!summary || summary.orders === 0) {
      return (
        <div className="rwaq-dash-card__empty" style={{ height: CHART_HEIGHT }}>
          {intl.formatMessage(messages.chartEmpty)}
        </div>
      );
    }
    return (
      <div className="rwaq-chart">
        <MetricChart
          type="bar"
          data={data}
          series={series.map(({ key }) => key)}
          ariaLabel={`${title}. ${series.map(({ key }) => key).join(', ')}.`}
          height={CHART_HEIGHT}
          hideLegend={hideLegend}
          xLabelAngle={LABEL_ANGLE}
          maxXLabels={maxLabels}
          {...(formatValue ? { valueFormatter: formatValue, yAxisWidth: MONEY_AXIS_WIDTH } : {})}
        />
      </div>
    );
  };

  return (
    <div className="rwaq-card rwaq-dash-card">
      <div className="rwaq-dash-card__head">
        <InfoTooltip text={info}>
          <h3 className="rwaq-section-title mb-0">{title}</h3>
        </InfoTooltip>
        <span className="rwaq-dash-card__sub">{subtitle}</span>
      </div>
      {renderBody()}
    </div>
  );
};

const OverviewTab = ({ org, onOrgChange }: ListTabProps) => {
  const intl = useIntl();
  const dates = useDateRange();
  const params = { org: org || undefined, startDate: dates.startDate, endDate: dates.endDate };
  const partner = usePartnerFilter(params, onOrgChange);
  const [granularity, setGranularity] = useState<Granularity>('month');

  const summaryQuery = usePaymentsSummary({ ...params, granularity });
  const summary = summaryQuery.data;
  // A range or partner change keeps the old figures as placeholder data until the new ones arrive.
  // They must not pass for the new figures, so they show the loading state, as on the dashboard.
  const isLoading = summaryQuery.isLoading || summaryQuery.isPlaceholderData;
  const { isError } = summaryQuery;

  const tile = (value: string | undefined) => (isError || !summary ? null : formatTileAmount(intl, value));
  const exact = (value: string | undefined) => (
    isError || !summary ? undefined : formatMoney(intl, value) ?? undefined
  );
  const subtitle = intl.formatMessage(dates.startDate ? messages.chartRange : messages.chartAllTime);

  const granularityOptions: { value: Granularity; label: string }[] = [
    { value: 'day', label: intl.formatMessage(messages.granDay) },
    { value: 'week', label: intl.formatMessage(messages.granWeek) },
    { value: 'month', label: intl.formatMessage(messages.granMonth) },
  ];

  const chartProps = {
    summary, isLoading, isError, granularity, subtitle,
  };
  const formatMoneyValue = (value: number) => formatAmount(intl, String(value)) ?? '';
  const money = (label: string, value: string | undefined, info: string) => (
    <PaymentKpi
      label={label}
      unit={CURRENCY}
      value={tile(value)}
      exact={exact(value)}
      isLoading={isLoading}
      info={info}
    />
  );

  return (
    <div className="rwaq-overview">
      <div className="rwaq-overview__toolbar">
        <Form.Group className="mb-0" controlId="rwaq-overview-partner">
          <Form.Label className="rwaq-filterpanel__label">{intl.formatMessage(messages.partnerLabel)}</Form.Label>
          <Form.Control
            as="select"
            value={params.org ?? ''}
            onChange={(event: React.ChangeEvent<HTMLSelectElement>) => onOrgChange(event.target.value)}
          >
            {partner.group.options.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </Form.Control>
        </Form.Group>
        <DateFilter range={dates} />
      </div>

      {isError && <Alert variant="danger">{intl.formatMessage(messages.errorTitle)}</Alert>}

      <div className="rwaq-payment-grid">
        <PaymentKpi
          label={intl.formatMessage(messages.kpiOrders)}
          value={summary && !isError ? summary.orders.toLocaleString(intl.locale) : null}
          isLoading={isLoading}
          info={intl.formatMessage(messages.infoOrders)}
        />
        {money(intl.formatMessage(messages.kpiOrderValue), summary?.gross, intl.formatMessage(messages.infoOrderValue))}
        {money(
          intl.formatMessage(messages.kpiDiscounts),
          summary?.discounts,
          intl.formatMessage(messages.infoDiscounts),
        )}
        {money(intl.formatMessage(messages.kpiCollected), summary?.netPaid, intl.formatMessage(messages.infoCollected))}
      </div>

      <div className="rwaq-overview__trends-head">
        <h2 className="rwaq-section-title mb-0">{intl.formatMessage(messages.trendsTitle)}</h2>
        <div className="rwaq-overview__granularity">
          <span className="rwaq-filterpanel__label mb-0">{intl.formatMessage(messages.viewBy)}</span>
          <ButtonGroup size="sm" aria-label={intl.formatMessage(messages.viewBy)}>
            {granularityOptions.map((option) => (
              <Button
                key={option.value}
                variant={granularity === option.value ? 'primary' : 'outline-primary'}
                aria-pressed={granularity === option.value}
                onClick={() => setGranularity(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </ButtonGroup>
        </div>
      </div>

      <div className="rwaq-payment-charts">
        <TrendChart
          {...chartProps}
          maxLabels={FULL_WIDTH_LABELS}
          title={intl.formatMessage(messages.chartCollectedTitle)}
          info={intl.formatMessage(messages.infoChartCollected)}
          series={[{ key: intl.formatMessage(messages.seriesCollected), value: (point) => Number(point.netPaid) }]}
          formatValue={formatMoneyValue}
          hideLegend
        />
        <TrendChart
          {...chartProps}
          maxLabels={HALF_WIDTH_LABELS}
          title={intl.formatMessage(messages.chartOrdersTitle)}
          info={intl.formatMessage(messages.infoChartOrders)}
          series={[{ key: intl.formatMessage(messages.seriesOrders), value: (point) => point.orders }]}
          hideLegend
        />
      </div>
    </div>
  );
};

export default OverviewTab;
