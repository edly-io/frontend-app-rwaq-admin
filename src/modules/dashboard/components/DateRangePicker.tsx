/**
 * DateRangePicker — preset chips plus optional custom date inputs.
 *
 * The active preset is derived from the current startDate/endDate values by
 * comparing against computed preset ranges, so the component is stateless with
 * respect to which chip is highlighted and re-derives on every render. This
 * keeps the URL as the single source of truth.
 *
 * RTL note: no hardcoded LTR assumptions — flex row with gap, no left/right
 * margin, and <Form.Control type="date"> renders in the browser's locale.
 */
import { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button, Form } from '@openedx/paragon';
import messages from '../messages';

// ── Date helpers ──────────────────────────────────────────────────────────────

const today = (): Date => new Date();
const isoDate = (d: Date): string => d.toISOString().slice(0, 10);

const daysAgo = (n: number): string => {
  const d = today();
  d.setDate(d.getDate() - n);
  return isoDate(d);
};

const monthsAgo = (n: number): string => {
  const d = today();
  d.setMonth(d.getMonth() - n);
  return isoDate(d);
};

const yearStart = (): string => `${today().getFullYear()}-01-01`;
const todayIso = (): string => isoDate(today());

// ── Preset definitions ────────────────────────────────────────────────────────

type Preset = {
  key: string;
  labelKey: keyof typeof messages;
  getRange: () => [string | undefined, string | undefined];
};

const PRESETS: Preset[] = [
  {
    key: 'last30',
    labelKey: 'presetLast30Days',
    getRange: () => [daysAgo(30), todayIso()],
  },
  {
    key: 'last3m',
    labelKey: 'presetLast3Months',
    getRange: () => [monthsAgo(3), todayIso()],
  },
  {
    key: 'last6m',
    labelKey: 'presetLast6Months',
    getRange: () => [monthsAgo(6), todayIso()],
  },
  {
    key: 'last12m',
    labelKey: 'presetLast12Months',
    getRange: () => [monthsAgo(12), todayIso()],
  },
  {
    key: 'ytd',
    labelKey: 'presetYearToDate',
    getRange: () => [yearStart(), todayIso()],
  },
  {
    key: 'alltime',
    labelKey: 'presetAllTime',
    getRange: () => [undefined, undefined],
  },
  {
    key: 'custom',
    labelKey: 'presetCustom',
    getRange: () => [undefined, undefined],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Derive which preset key is active given a startDate/endDate pair.
 * Comparison is within a 1-day window to absorb rendering timing skew
 * (the preset is computed once at click time; by next render "today" may
 * have ticked over by milliseconds).
 */
const deriveActivePreset = (
  startDate: string | undefined,
  endDate: string | undefined,
): string => {
  if (!startDate && !endDate) { return 'alltime'; }

  const namedPresets = PRESETS.filter(
    (preset) => preset.key !== 'alltime' && preset.key !== 'custom',
  );
  for (const preset of namedPresets) {
    const [ps, pe] = preset.getRange();
    if (ps === startDate && pe === endDate) { return preset.key; }
  }

  return 'custom';
};

// ── Props ─────────────────────────────────────────────────────────────────────

export interface DateRangePickerProps {
  startDate: string | undefined;
  endDate: string | undefined;
  onChange: (startDate: string | undefined, endDate: string | undefined) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

const DateRangePicker = ({ startDate, endDate, onChange }: DateRangePickerProps) => {
  const intl = useIntl();

  // Local flag so clicking "Custom" immediately shows the inputs without
  // requiring the user to first change a date. Cleared whenever a named preset
  // or "All time" is picked.
  const [customMode, setCustomMode] = useState(false);

  const activePreset = deriveActivePreset(startDate, endDate);
  const isCustom = activePreset === 'custom' || customMode;

  const handlePresetClick = (preset: Preset) => {
    if (preset.key === 'custom') {
      setCustomMode(true);
      return;
    }
    setCustomMode(false);
    const [s, e] = preset.getRange();
    onChange(s, e);
  };

  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomMode(false);  // URL will now carry non-preset dates; state not needed
    onChange(e.target.value || undefined, endDate);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomMode(false);
    onChange(startDate, e.target.value || undefined);
  };

  return (
    <div className="d-flex flex-column gap-2">
      {/* Preset chips */}
      <div className="d-flex flex-wrap gap-2">
        {PRESETS.map((preset) => {
          const isActive = preset.key === 'custom'
            ? isCustom
            : activePreset === preset.key && !customMode;
          return (
            <Button
              key={preset.key}
              size="sm"
              variant={isActive ? 'primary' : 'outline-primary'}
              onClick={() => handlePresetClick(preset)}
              aria-pressed={isActive}
            >
              {intl.formatMessage(messages[preset.labelKey])}
            </Button>
          );
        })}
      </div>

      {/* Custom date inputs — only shown when "Custom" is active */}
      {isCustom && (
        <div className="d-flex flex-wrap gap-3 align-items-center">
          <Form.Group controlId="date-range-start" className="mb-0">
            <Form.Label className="small mb-1">
              {intl.formatMessage(messages.dateRangeStart)}
            </Form.Label>
            <Form.Control
              type="date"
              size="sm"
              value={startDate ?? ''}
              onChange={handleStartChange}
              max={endDate}
            />
          </Form.Group>

          <Form.Group controlId="date-range-end" className="mb-0">
            <Form.Label className="small mb-1">
              {intl.formatMessage(messages.dateRangeEnd)}
            </Form.Label>
            <Form.Control
              type="date"
              size="sm"
              value={endDate ?? ''}
              onChange={handleEndChange}
              min={startDate}
            />
          </Form.Group>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
