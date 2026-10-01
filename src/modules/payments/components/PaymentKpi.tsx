/**
 * One KPI tile of the Overview: a muted label with its info tooltip, the number
 * large with the currency as a small unit, and an optional footnote.
 *
 * Local to payments rather than the shared KpiCard: money here is long
 * ("8,378.10"), and that card's number wraps when six tiles share a row.
 */
import { Skeleton } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import InfoTooltip from '@src/components/InfoTooltip';
import messages from '../messages';

interface PaymentKpiProps {
  label: string;
  /** The formatted number, or null to show a dash. */
  value: string | null;
  /** Small unit before the number, e.g. "SAR". */
  unit?: string;
  info: string;
  footnote?: string;
  /** The exact figure, shown on hover when the tile shows it in short form ("12.35M"). */
  exact?: string;
  isLoading?: boolean;
}

/** aria-label is only read on an element with a role, so the loader is a status region. */
const KpiLoader = () => {
  const intl = useIntl();
  return (
    <div role="status" aria-busy="true" aria-label={intl.formatMessage(messages.loadingTab)}>
      <Skeleton height="1.75rem" width="70%" />
    </div>
  );
};

const PaymentKpi = ({
  label, value, unit, info, footnote, exact, isLoading = false,
}: PaymentKpiProps) => (
  <div className="rwaq-card rwaq-payment-kpi">
    <InfoTooltip text={info}>
      <span className="rwaq-payment-kpi__label">{label}</span>
    </InfoTooltip>
    {isLoading ? (
      <KpiLoader />
    ) : (
      <div className="rwaq-payment-kpi__value" title={exact} aria-label={exact}>
        {unit && value !== null && <span className="rwaq-payment-kpi__unit">{unit}</span>}
        <span
          className={`rwaq-payment-kpi__number${(value?.length ?? 0) > 8 ? ' rwaq-payment-kpi__number--long' : ''}`}
        >
          {value ?? '—'}
        </span>
      </div>
    )}
    {footnote && !isLoading && <span className="rwaq-payment-kpi__note">{footnote}</span>}
  </div>
);

export default PaymentKpi;
