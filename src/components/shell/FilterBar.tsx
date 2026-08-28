/**
 * FilterBar — search + filter controls driven entirely by URL search params.
 * Admin views are shareable: any URL with ?search=... is a valid bookmark.
 */
import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SearchField, Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import { filterBarMessages as messages } from './messages';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SortOption {
  value: string;
  label: string;
}

export interface FilterBarProps {
  /** URL param name for the text search (defaults to "search") */
  searchParam?: string;
  /** URL param name for ordering (defaults to "ordering") */
  orderingParam?: string;
  /** Available sort options; omit to hide the sort dropdown */
  sortOptions?: SortOption[];
  /** Additional filter slot — e.g. a status <Select> */
  additionalFilters?: React.ReactNode;
  defaultSortOption?: SortOption;
}

// ── Main component ────────────────────────────────────────────────────────────

const FilterBar = ({
  searchParam = 'search',
  orderingParam = 'ordering',
  sortOptions,
  additionalFilters,
  defaultSortOption,
}: FilterBarProps) => {
  const intl = useIntl();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentSearch = searchParams.get(searchParam) ?? '';
  const currentOrdering = searchParams.get(orderingParam) ?? '';

  const updateParam = useCallback(
    (key: string, value: string) => {
      setSearchParams((prev) => {
        const next = new URLSearchParams(prev);
        if (value) {
          next.set(key, value);
        } else {
          next.delete(key);
        }
        // Reset to page 1 on filter change
        next.delete('page');
        return next;
      }, { replace: true });
    },
    [setSearchParams],
  );

  return (
    <div
      className="d-flex align-items-center flex-wrap gap-2"
      style={{ padding: '0.75rem 0', marginBottom: '1rem' }}
    >
      <SearchField
        onSubmit={(val) => updateParam(searchParam, val)}
        onClear={() => updateParam(searchParam, '')}
        value={currentSearch}
        placeholder={intl.formatMessage(messages.searchPlaceholder)}
        inputProps={{ 'aria-label': intl.formatMessage(messages.searchLabel) }}
      />

      {sortOptions && sortOptions.length > 0 && (
        <Form.Group className="mb-0 ml-2" controlId="filterbar-ordering">
          <Form.Label className="sr-only">
            {intl.formatMessage(messages.sortLabel)}
          </Form.Label>
          <Form.Control
            as="select"
            value={currentOrdering || defaultSortOption?.value || ''}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => updateParam(orderingParam, e.target.value)}
            aria-label={intl.formatMessage(messages.sortLabel)}
          >
            <option value="">{intl.formatMessage(messages.sortLabel)}</option>
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
      )}

      {additionalFilters}
    </div>
  );
};

export default FilterBar;
