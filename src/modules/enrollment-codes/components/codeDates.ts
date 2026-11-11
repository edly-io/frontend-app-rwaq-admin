/** The date part of a timestamp as a date input value ("2026-12-31"), in UTC like every date in this panel. */
export const toDateInput = (iso: string | null | undefined): string => (iso ? iso.slice(0, 10) : '');

/** A timestamp as a date for a table cell, in UTC. */
export const formatDate = (iso: string, locale?: string) => new Date(iso).toLocaleDateString(locale, {
  timeZone: 'UTC', calendar: 'gregory', numberingSystem: 'latn', dateStyle: 'medium',
});
