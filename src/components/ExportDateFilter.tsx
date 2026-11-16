import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  presets: { id: 'rwaq.admin.exports.dates.presets', defaultMessage: 'Date range (UTC)' },
  custom: { id: 'rwaq.admin.exports.dates.custom', defaultMessage: 'Custom dates' },
  all: { id: 'rwaq.admin.exports.dates.all', defaultMessage: 'All dates' },
  month: { id: 'rwaq.admin.exports.dates.month', defaultMessage: 'This month' },
  lastMonth: { id: 'rwaq.admin.exports.dates.lastMonth', defaultMessage: 'Last month' },
  year: { id: 'rwaq.admin.exports.dates.year', defaultMessage: 'This year' },
  joinedFrom: { id: 'rwaq.admin.exports.dates.joinedFrom', defaultMessage: 'Joined from (UTC)' },
  joinedTo: { id: 'rwaq.admin.exports.dates.joinedTo', defaultMessage: 'Joined to (UTC)' },
  createdFrom: { id: 'rwaq.admin.exports.dates.createdFrom', defaultMessage: 'Created from (UTC)' },
  createdTo: { id: 'rwaq.admin.exports.dates.createdTo', defaultMessage: 'Created to (UTC)' },
});

export const presetRange = (preset: string, now = new Date()): [string, string] => {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const iso = (date: Date) => date.toISOString().slice(0, 10);
  if (preset === 'month') { return [iso(new Date(Date.UTC(year, month, 1))), iso(now)]; }
  if (preset === 'lastMonth') {
    return [iso(new Date(Date.UTC(year, month - 1, 1))), iso(new Date(Date.UTC(year, month, 0)))];
  }
  if (preset === 'year') { return [`${year}-01-01`, iso(now)]; }
  return ['', ''];
};

interface Props {
  kind: 'joined' | 'created';
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}

const ExportDateFilter = ({ kind, from, to, onChange }: Props) => {
  const intl = useIntl();
  const fromLabel = intl.formatMessage(kind === 'joined' ? messages.joinedFrom : messages.createdFrom);
  const toLabel = intl.formatMessage(kind === 'joined' ? messages.joinedTo : messages.createdTo);
  const preset = ['month', 'lastMonth', 'year'].find(key => {
    const range = presetRange(key);
    return range[0] === from && range[1] === to;
  }) ?? (from || to ? 'custom' : 'all');
  return (
    <div className="d-flex flex-wrap align-items-end mb-3" style={{ gap: '0.75rem' }}>
      <label className="mb-0">
        {intl.formatMessage(messages.presets)}
        <select className="form-control" value={preset} onChange={event => onChange(...presetRange(event.target.value))}>
          <option value="all">{intl.formatMessage(messages.all)}</option>
          <option value="month">{intl.formatMessage(messages.month)}</option>
          <option value="lastMonth">{intl.formatMessage(messages.lastMonth)}</option>
          <option value="year">{intl.formatMessage(messages.year)}</option>
          <option value="custom" disabled>{intl.formatMessage(messages.custom)}</option>
        </select>
      </label>
      <label className="mb-0">
        {fromLabel}
        <input type="date" className="form-control" value={from} onChange={event => onChange(event.target.value, to)} />
      </label>
      <label className="mb-0">
        {toLabel}
        <input type="date" className="form-control" value={to} onChange={event => onChange(from, event.target.value)} />
      </label>
    </div>
  );
};

export default ExportDateFilter;
