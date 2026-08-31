/**
 * DateRangePicker — preset chips plus optional custom date inputs, all inline.
 *
 * Active preset is derived from URL dates via exact string match, so the URL
 * is the single source of truth. A local `customMode` flag bridges the gap
 * between clicking "Custom" (no URL change yet) and typing a date.
 *
 * RTL note: flex row with gap, no directional margins; <input type="date">
 * renders in the browser's locale automatically.
 */
import { useState } from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
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
 * Comparison is exact string equality. Named presets are recomputed on each
 * render relative to today(), so a session left open across midnight will
 * de-select the active chip until the user re-clicks it — acceptable UX.
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
    if (customMode) { setCustomMode(false); }
    onChange(e.target.value || undefined, endDate);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (customMode) { setCustomMode(false); }
    onChange(startDate, e.target.value || undefined);
  };

  return (
    <div className="d-flex flex-wrap align-items-center gap-2">
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
            style={{ whiteSpace: 'nowrap' }}
          >
            {intl.formatMessage(messages[preset.labelKey])}
          </Button>
        );
      })}

      {/* Custom date inputs — inline with the chips when "Custom" is active */}
      {isCustom && (
        <>
          <span className="text-muted small mx-1" aria-hidden="true">|</span>
          <input
            id="date-range-start"
            type="date"
            className="form-control form-control-sm"
            style={{ width: '8.5rem' }}
            value={startDate ?? ''}
            onChange={handleStartChange}
            max={endDate}
            aria-label={intl.formatMessage(messages.dateRangeStart)}
          />
          <span className="text-muted small" aria-hidden="true">→</span>
          <input
            id="date-range-end"
            type="date"
            className="form-control form-control-sm"
            style={{ width: '8.5rem' }}
            value={endDate ?? ''}
            onChange={handleEndChange}
            min={startDate}
            aria-label={intl.formatMessage(messages.dateRangeEnd)}
          />
        </>
      )}
    </div>
  );
};

export default DateRangePicker;
