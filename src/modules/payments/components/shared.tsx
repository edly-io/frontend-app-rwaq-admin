/**
 * Pieces the payments tabs share: money formatting, list state, the CSV
 * button, the tab heading and the partner filter.
 */
import { ReactNode, useState } from 'react';
import { Button } from '@openedx/paragon';
import { Download } from '@openedx/paragon/icons';
import { logError } from '@edx/frontend-platform/logging';
import { useIntl } from '@edx/frontend-platform/i18n';
import InfoTooltip from '@src/components/InfoTooltip';
import type { AppliedChip, FilterGroup } from '@src/components/SearchFilterBar';
import DateRangePicker from '@src/modules/dashboard/components/DateRangePicker';
import { useToast } from '@src/components/ToastContext';
import { useOrganizations } from '@src/modules/organizations/data/hooks';
import { useDownloadPaymentsCsv } from '../data/hooks';
import type {
  ListParams, Paginated, PaymentsParams, PaymentsReport,
} from '../data/types';
import messages from '../messages';

export const PAGE_SIZE = 10;
export const CURRENCY = 'SAR';
/** How long a download's blob URL stays valid, so the browser can start reading it before it is revoked. */
const REVOKE_URL_AFTER_MS = 10_000;

type Intl = ReturnType<typeof useIntl>;

/** "1234.5" → "1,234.50", without the currency (tiles show it as a small unit). */
export const formatAmount = (intl: Intl, value: string | null | undefined): string | null => {
  if (value === null || value === undefined) { return null; }
  return intl.formatNumber(Number(value), { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

/**
 * "1234.5" → "1,234.50" for a KPI tile. From a million up the tile could not
 * hold the digits, so it shows "12.35M" and the exact figure goes in the hover.
 */
export const formatTileAmount = (intl: Intl, value: string | null | undefined): string | null => {
  if (value === null || value === undefined) { return null; }
  if (Math.abs(Number(value)) < 1_000_000) { return formatAmount(intl, value); }
  return intl.formatNumber(Number(value), { notation: 'compact', maximumFractionDigits: 2 });
};

/** "1234.5" → "SAR 1,234.50". null stays null so the caller decides what "no value" says. */
export const formatMoney = (intl: Intl, value: string | null | undefined): string | null => {
  if (value === null || value === undefined) { return null; }
  return intl.formatNumber(Number(value), {
    style: 'currency', currency: CURRENCY, minimumFractionDigits: 2, maximumFractionDigits: 2,
  });
};

/** Table cells go compact from here: "125K", with the exact amount on hover. */
const CELL_COMPACT_FROM = 100_000;

/** "1234.5" → "1,234.50", or "1.25M" once it would crowd a cell. The currency is in the column header. */
export const formatCellAmount = (intl: Intl, value: string | null | undefined): string | null => {
  if (value === null || value === undefined) { return null; }
  if (Math.abs(Number(value)) < CELL_COMPACT_FROM) { return formatAmount(intl, value); }
  return intl.formatNumber(Number(value), { notation: 'compact', maximumFractionDigits: 2 });
};

/** An amount in a table cell. Compact figures show the exact amount on hover and to screen readers. */
export const MoneyCell = ({ value, strong = false }: { value: string | null | undefined; strong?: boolean }) => {
  const intl = useIntl();
  const short = formatCellAmount(intl, value);
  const exact = formatMoney(intl, value);
  if (short === null || exact === null) { return null; }
  const text = strong ? <strong>{short}</strong> : <span>{short}</span>;
  if (Math.abs(Number(value)) < CELL_COMPACT_FROM) { return text; }
  return (
    <InfoTooltip text={exact}>
      <span className="rwaq-money-compact" aria-label={exact}>{text}</span>
    </InfoTooltip>
  );
};

/** A table cell holding an amount. */
export const MoneyTd = ({ value }: { value: string | null | undefined }) => (
  // eslint-disable-next-line jsx-a11y/control-has-associated-label -- the cell's text is the label
  <td><MoneyCell value={value} /></td>
);

/** The date and time of a timestamp in UTC, the same days the backend's date filters and buckets use. */
export const formatDateTime = (iso: string, locale?: string) => new Date(iso).toLocaleString(locale, {
  timeZone: 'UTC',
  calendar: 'gregory',
  numberingSystem: 'latn',
  dateStyle: 'medium',
  timeStyle: 'short',
  hourCycle: 'h23',
});

export interface DateRange {
  startDate?: string;
  endDate?: string;
}

/** A tab's own date range. Each tab keeps its own, so one tab's setting never narrows another. */
export const useDateRange = () => {
  const [range, setState] = useState<DateRange>({});
  return {
    startDate: range.startDate,
    endDate: range.endDate,
    setRange: (startDate?: string, endDate?: string) => setState({ startDate, endDate }),
  };
};

/** The date picker of one tab, the same height as the search box and buttons beside it. */
export const DateFilter = ({ range }: { range: ReturnType<typeof useDateRange> }) => (
  <DateRangePicker
    startDate={range.startDate}
    endDate={range.endDate}
    size="md"
    minWidth="9.5rem"
    onChange={range.setRange}
  />
);

/** One string for what a list is narrowed by outside useListState (partner, dates, focus), for its `scope`. */
export const listScope = (...parts: (string | undefined)[]) => JSON.stringify(parts.map((part) => part ?? ''));

/**
 * Search, sort, extra filters and page for one tab. Tab-local rather than in
 * the URL: the URL carries what the whole page shares (partner, dates, tab).
 *
 * `scope` names that shared narrowing (see listScope). A page number only holds
 * under the scope it was picked in, so when the scope changes the page is 1 in
 * the same render. Resetting it afterwards in an effect would send one request
 * for the old page first, and DRF answers a page past the end with a 404.
 */
export const useListState = <Filters extends Record<string, string>>(
  defaultOrdering: string,
  defaultFilters: Filters,
  scope: string,
) => {
  const [search, setSearch] = useState('');
  const [ordering, setOrdering] = useState(defaultOrdering);
  const [filters, setFilters] = useState<Filters>(defaultFilters);
  const [pageState, setPageState] = useState({ scope, page: 1 });
  // Forget a page picked under another scope, so it cannot return if the scope does.
  if (pageState.scope !== scope) { setPageState({ scope, page: 1 }); }
  const page = pageState.scope === scope ? pageState.page : 1;
  const setPage = (next: number) => setPageState({ scope, page: next });

  return {
    search,
    ordering,
    filters,
    page,
    isDefaultOrdering: ordering === defaultOrdering,
    setPage,
    setSearch: (term: string) => { setSearch(term); setPage(1); },
    setOrdering: (value: string) => { setOrdering(value || defaultOrdering); setPage(1); },
    setFilter: (key: keyof Filters, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    },
    clearAll: () => {
      setSearch('');
      setOrdering(defaultOrdering);
      setFilters(Object.fromEntries(Object.keys(defaultFilters).map((key) => [key, ''])) as Filters);
      setPage(1);
    },
  };
};

/** AdminDataTable pagination from a paginated response. */
export const tablePagination = <Row extends object>(
  data: Paginated<Row> | undefined,
  page: number,
  onPageChange: (p: number) => void,
) => (
    data ? {
      currentPage: page,
      pageCount: data.pagination?.numPages ?? Math.max(1, Math.ceil((data.pagination?.count ?? 0) / PAGE_SIZE)),
      itemCount: data.pagination?.count ?? data.results.length,
      pageSize: PAGE_SIZE,
      onPageChange,
    } : undefined
  );

/**
 * The Partner dropdown and its chip for a list tab. The partner lives in the
 * page URL so it survives a reload, but each tab offers its own dropdown:
 * switching tabs clears it, so a list never narrows itself out of sight.
 * Options are the active organizations, whether or not they sold anything in the date range.
 */
export const usePartnerFilter = (
  params: PaymentsParams,
  onOrgChange: (org: string) => void,
): { group: FilterGroup; chip: AppliedChip | null } => {
  const intl = useIntl();
  const { data } = useOrganizations({ filter: 'active', ordering: 'name', pageSize: 100 });
  const partners = data?.results ?? [];
  const org = params.org ?? '';
  const options = [
    { value: '', label: intl.formatMessage(messages.allPartners) },
    ...partners.map((partner) => ({ value: partner.shortName, label: partner.name })),
  ];
  // A partner in the URL may be inactive or beyond the first 100 options.
  if (org && !options.some((option) => option.value === org)) {
    options.push({ value: org, label: org });
  }
  const label = options.find((option) => option.value === org)?.label ?? org;
  return {
    group: {
      id: 'partner',
      label: intl.formatMessage(messages.partnerLabel),
      value: org,
      options,
      onChange: onOrgChange,
    },
    chip: org ? {
      key: 'partner',
      label: intl.formatMessage(messages.chipPartner, { org: label }),
      onRemove: () => onOrgChange(''),
    } : null,
  };
};

interface CsvButtonProps {
  report: PaymentsReport;
  params: ListParams;
}

/** Downloads every row matching the tab's filters, not just the page on screen. */
export const CsvButton = ({ report, params }: CsvButtonProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const mutation = useDownloadPaymentsCsv();

  const handleClick = async () => {
    try {
      const { blob, filename } = await mutation.mutateAsync({ report, params, language: intl.locale });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      // Revoking at once can cancel the download in some browsers.
      setTimeout(() => URL.revokeObjectURL(url), REVOKE_URL_AFTER_MS);
    } catch (err) {
      logError(err);
      showToast(intl.formatMessage(messages.downloadCsvFailed));
    }
  };

  // Default size, like the Filters toggle beside it, so the two line up.
  return (
    <Button
      variant="outline-primary"
      onClick={handleClick}
      disabled={mutation.isPending}
      iconBefore={Download}
    >
      {intl.formatMessage(messages.downloadCsv)}
    </Button>
  );
};

interface TabHeadingProps {
  title: string;
  /** Hover text on the title: what the tab counts. */
  info: string;
  /** A visible line under the title: how the numbers are worked out, with an example. */
  how?: string;
}

/** The heading above each tab's table. */
export const TabHeading = ({ title, info, how }: TabHeadingProps) => (
  <div className="rwaq-tab-heading">
    <InfoTooltip text={info}>
      <h3 className="rwaq-section-title mb-0">{title}</h3>
    </InfoTooltip>
    {how && <p className="rwaq-tab-heading__how">{how}</p>}
  </div>
);

/** Children wrapped as the table card of a tab. */
export const TabCard = ({ children }: { children: ReactNode }) => (
  <div className="rwaq-card rwaq-card--fit">{children}</div>
);

/** A small table shown under an expanded row, full width. */
export const DetailTable = ({ children }: { children: ReactNode }) => (
  <div className="rwaq-row-detail">{children}</div>
);

/** What every tab gets from the page: the chosen partner and a way to change it. Dates are the tab's own. */
export interface ListTabProps {
  /** The partner in the URL, if one is chosen. */
  org?: string;
  onOrgChange: (org: string) => void;
}
