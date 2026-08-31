/**
 * DateRangePicker — a single toggle button that opens a dropdown panel.
 *
 * The button label shows the active preset. The panel lists all presets;
 * selecting one closes the panel and fires onChange. Selecting "Custom"
 * keeps the panel open and reveals inline date inputs below the list.
 *
 * Active preset is derived from URL dates via exact string match, so the
 * URL is the single source of truth. A local `customMode` flag bridges the
 * gap between clicking "Custom" (no URL change yet) and typing a date.
 */
import { useEffect, useRef, useState } from 'react';
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

  const [isOpen, setIsOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);

  const activePreset = deriveActivePreset(startDate, endDate);
  const isCustom = activePreset === 'custom' || customMode;

  // Active label shown on the toggle button
  const activeLabelKey = isCustom
    ? 'presetCustom'
    : (PRESETS.find((p) => p.key === activePreset)?.labelKey ?? 'presetAllTime');

  // Close the panel on outside click
  useEffect(() => {
    if (!isOpen) { return undefined; }
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const handlePresetClick = (preset: Preset) => {
    if (preset.key === 'custom') {
      setCustomMode(true);
      return; // keep panel open so user can enter dates
    }
    setCustomMode(false);
    const [s, e] = preset.getRange();
    onChange(s, e);
    setIsOpen(false);
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
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {/* Toggle button */}
      <Button
        variant="outline-primary"
        size="sm"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        style={{ whiteSpace: 'nowrap' }}
      >
        {intl.formatMessage(messages[activeLabelKey])}
        <span aria-hidden="true" style={{ marginInlineStart: '0.375rem', opacity: 0.6 }}>▾</span>
      </Button>

      {/* Dropdown panel */}
      {isOpen && (
        <div
          role="listbox"
          aria-label={intl.formatMessage(messages.presetAllTime)}
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
                role="option"
                aria-selected={isActive}
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
                  value={startDate ?? ''}
                  onChange={handleStartChange}
                  max={endDate}
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
                  value={endDate ?? ''}
                  onChange={handleEndChange}
                  min={startDate}
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
