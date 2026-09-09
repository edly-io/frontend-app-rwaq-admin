/**
 * DateRangePicker — a single toggle button that opens a dropdown panel.
 *
 * The button label shows the active preset. The panel lists all presets;
 * selecting one closes the panel and fires onChange. Selecting "Custom"
 * keeps the panel open and reveals inline date inputs below the list.
 *
 * For custom dates, onChange is only fired once BOTH start and end are
 * filled — the filter doesn't activate on a half-complete range.
 * Pending values are kept in local state; the parent's applied values
 * (startDate/endDate props) only update when both inputs are complete.
 */
import {
  useEffect, useRef, useState, useCallback,
} from 'react';
import { useIntl } from '@edx/frontend-platform/i18n';
import { Button } from '@openedx/paragon';
import messages from '../messages';

// ── Date helpers ──────────────────────────────────────────────────────────────

const today = (): Date => new Date();

// Use local date components rather than toISOString(): toISOString() reprojects
// to UTC before slicing, so in UTC+3 at 01:30 local time the UTC date is still
// the previous day and the wrong date gets sent to the backend.
const isoDate = (d: Date): string =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const daysAgo = (n: number): string => {
  const d = today();
  d.setDate(d.getDate() - n);
  return isoDate(d);
};

const monthsAgo = (n: number): string => {
  const d = today();
  const originalDay = d.getDate();
  // Move to the 1st before subtracting months: setMonth on the 31st of a
  // month whose target is shorter overflows into the following month
  // (Mar 31 − 1 month = Mar 3 instead of Feb 28).
  d.setDate(1);
  d.setMonth(d.getMonth() - n);
  // Clamp to the last day of the target month.
  const maxDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(originalDay, maxDay));
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
  { key: 'last30', labelKey: 'presetLast30Days', getRange: () => [daysAgo(30), todayIso()] },
  { key: 'last3m', labelKey: 'presetLast3Months', getRange: () => [monthsAgo(3), todayIso()] },
  { key: 'last6m', labelKey: 'presetLast6Months', getRange: () => [monthsAgo(6), todayIso()] },
  { key: 'last12m', labelKey: 'presetLast12Months', getRange: () => [monthsAgo(12), todayIso()] },
  { key: 'ytd', labelKey: 'presetYearToDate', getRange: () => [yearStart(), todayIso()] },
  { key: 'alltime', labelKey: 'presetAllTime', getRange: () => [undefined, undefined] },
  { key: 'custom', labelKey: 'presetCustom', getRange: () => [undefined, undefined] },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

const deriveActivePreset = (
  startDate: string | undefined,
  endDate: string | undefined,
): string => {
  if (!startDate && !endDate) { return 'alltime'; }
  const named = PRESETS.filter((p) => p.key !== 'alltime' && p.key !== 'custom');
  for (const preset of named) {
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
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLDivElement>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);

  // Pending values for the custom date inputs — local only until both are filled.
  const [pendingStart, setPendingStart] = useState<string>(startDate ?? '');
  const [pendingEnd, setPendingEnd] = useState<string>(endDate ?? '');

  // Refs give the change handlers the latest sibling value without needing to
  // re-create both callbacks whenever one pending value changes (stale-closure
  // fix: if the user fills "From" then "To" quickly, the "To" handler could
  // read a stale pendingStart captured at creation time and silently skip onChange).
  const pendingStartRef = useRef(pendingStart);
  const pendingEndRef = useRef(pendingEnd);

  // Sync pending when the applied range changes externally (preset selected, reset).
  useEffect(() => {
    setPendingStart(startDate ?? '');
    setPendingEnd(endDate ?? '');
    pendingStartRef.current = startDate ?? '';
    pendingEndRef.current = endDate ?? '';
  }, [startDate, endDate]);

  const activePreset = deriveActivePreset(startDate, endDate);
  const isCustom = activePreset === 'custom' || customMode;

  // Format an ISO date string (YYYY-MM-DD) as a compact locale-aware label.
  const formatDateLabel = (iso: string): string => {
    const [year, month, day] = iso.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString(intl.locale, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Toggle button label: for a fully-applied custom range show the dates;
  // while the user is mid-entry (customMode but dates not yet applied) show "Custom".
  const activeLabel = (() => {
    if (isCustom) {
      if (startDate && endDate && activePreset === 'custom') {
        return `${formatDateLabel(startDate)} – ${formatDateLabel(endDate)}`;
      }
      return intl.formatMessage(messages.presetCustom);
    }
    const preset = PRESETS.find((p) => p.key === activePreset);
    return intl.formatMessage(messages[preset?.labelKey ?? 'presetAllTime']);
  })();

  // Close the panel on outside click or Escape key
  useEffect(() => {
    if (!isOpen) { return undefined; }
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
        toggleRef.current?.querySelector('button')?.focus();
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [isOpen]);

  const handlePresetClick = (preset: Preset) => {
    if (preset.key === 'custom') {
      setCustomMode(true);
      // Seed the inputs with whatever is currently applied so the user
      // sees a coherent starting point when editing a custom range.
      setPendingStart(startDate ?? '');
      setPendingEnd(endDate ?? '');
      return; // keep panel open so user can enter dates
    }
    setCustomMode(false);
    const [s, e] = preset.getRange();
    onChange(s, e);
    setIsOpen(false);
  };

  // Fire onChange only once BOTH start and end are filled.
  // Reads the sibling value from a ref rather than from the closure so that
  // typing both fields quickly cannot pick up a stale sibling and silently
  // skip onChange while both inputs appear filled.
  const handleStartChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    pendingStartRef.current = val;
    setPendingStart(val);
    if (val && pendingEndRef.current) {
      setCustomMode(false);
      setIsOpen(false);
      onChange(val, pendingEndRef.current);
    }
  }, [onChange]);

  const handleEndChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    pendingEndRef.current = val;
    setPendingEnd(val);
    if (pendingStartRef.current && val) {
      setCustomMode(false);
      setIsOpen(false);
      onChange(pendingStartRef.current, val);
    }
  }, [onChange]);

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Toggle button */}
      <div ref={toggleRef} style={{ display: 'inline-block' }}>
        <Button
          variant="outline-primary"
          size="sm"
          onClick={() => setIsOpen((o) => !o)}
          aria-expanded={isOpen}
          aria-haspopup="menu"
          style={{ whiteSpace: 'nowrap' }}
        >
          {activeLabel}
          <span aria-hidden="true" style={{ marginInlineStart: '0.375rem', opacity: 0.6 }}>▾</span>
        </Button>
      </div>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          role="menu"
          aria-label={intl.formatMessage(messages.dateRangePickerLabel)}
          style={{
            position: 'absolute',
            insetInlineEnd: 0,
            top: 'calc(100% + 0.375rem)',
            zIndex: 1050,
            background: 'var(--rwaq-card-bg, #fff)',
            border: '1px solid var(--rwaq-card-border, #e6e8ec)',
            borderRadius: '0.5rem',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.1)',
            padding: '0.375rem',
            minWidth: '14rem',
          }}
        >
          {PRESETS.map((preset) => {
            const isActive = preset.key === 'custom'
              ? isCustom
              : activePreset === preset.key && !customMode;
            return (
              <button
                key={preset.key}
                type="button"
                role="menuitem"
                aria-current={isActive ? 'true' : undefined}
                onClick={() => handlePresetClick(preset)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'start',
                  padding: '0.4375rem 0.75rem',
                  border: 'none',
                  background: isActive ? 'var(--pgn-color-primary-100, #dbeafe)' : 'transparent',
                  color: isActive ? 'var(--pgn-color-primary-700, #1d4ed8)' : 'var(--rwaq-text, inherit)',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontWeight: isActive ? 600 : 400,
                  fontSize: '0.875rem',
                  lineHeight: 1.4,
                  transition: 'background 120ms',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = 'var(--pgn-color-gray-100, #f3f4f6)'; }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }
                }}
              >
                {intl.formatMessage(messages[preset.labelKey])}
              </button>
            );
          })}

          {/* Custom date inputs — shown inside the panel when Custom is selected */}
          {isCustom && (
            <div
              style={{
                borderTop: '1px solid var(--rwaq-card-border, #e6e8ec)',
                marginTop: '0.25rem',
                paddingTop: '0.625rem',
                padding: '0.625rem 0.75rem 0.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
              }}
            >
              <div>
                <label
                  htmlFor="date-range-start"
                  style={{
                    display: 'block',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--rwaq-muted, #6B757F)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {intl.formatMessage(messages.dateRangeStart)}
                </label>
                <input
                  id="date-range-start"
                  type="date"
                  className="form-control form-control-sm"
                  value={pendingStart}
                  onChange={handleStartChange}
                  max={pendingEnd || undefined}
                />
              </div>
              <div>
                <label
                  htmlFor="date-range-end"
                  style={{
                    display: 'block',
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    color: 'var(--rwaq-muted, #6B757F)',
                    marginBottom: '0.25rem',
                  }}
                >
                  {intl.formatMessage(messages.dateRangeEnd)}
                </label>
                <input
                  id="date-range-end"
                  type="date"
                  className="form-control form-control-sm"
                  value={pendingEnd}
                  onChange={handleEndChange}
                  min={pendingStart || undefined}
                />
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;
