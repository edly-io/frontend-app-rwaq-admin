/**
 * Search + filter/sort action bar.
 *
 * Layout follows the platform's Asset Management screen so admin surfaces feel
 * like one product:
 *   - the scope select and the text input are one bordered unit, with the
 *     search icon *inside* it as the submit control (Enter works too), so
 *     there is no free-floating Search/Clear pair;
 *   - filters and sorting stay collapsed behind a Filters toggle, since most
 *     visits are a plain search and the extra selects are noise until wanted;
 *   - whatever is active shows as removable chips under "Applied filters", so
 *     a narrowed list can never look like the whole list.
 *
 * Generic on purpose — it knows about scopes, groups and chips, not about
 * users — so other admin screens can adopt it as-is.
 */
import { ReactNode, useEffect, useState } from 'react';
import {
  Button, Chip, Form, Icon, IconButton,
} from '@openedx/paragon';
import { Close, FilterList, Search } from '@openedx/paragon/icons';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

const messages = defineMessages({
  // The input and the submit button must not share an accessible name, or a
  // screen reader announces two different controls identically.
  searchInputLabel: { id: 'rwaq.admin.searchFilter.searchInputLabel', defaultMessage: 'Search term' },
  searchSubmitLabel: { id: 'rwaq.admin.searchFilter.searchSubmitLabel', defaultMessage: 'Search' },
  searchClearLabel: { id: 'rwaq.admin.searchFilter.searchClearLabel', defaultMessage: 'Clear search term' },
  scopeLabel: { id: 'rwaq.admin.searchFilter.scopeLabel', defaultMessage: 'Search by' },
  filtersButton: { id: 'rwaq.admin.searchFilter.filters', defaultMessage: 'Filters' },
  appliedTitle: { id: 'rwaq.admin.searchFilter.appliedTitle', defaultMessage: 'Applied filters' },
  clearAll: { id: 'rwaq.admin.searchFilter.clearAll', defaultMessage: 'Clear all' },
  removeChip: { id: 'rwaq.admin.searchFilter.removeChip', defaultMessage: 'Remove {label}' },
});

export interface SelectOption {
  value: string;
  label: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  value: string;
  options: SelectOption[];
  onChange: (value: string) => void;
}

export interface AppliedChip {
  key: string;
  label: string;
  onRemove: () => void;
}

export interface SearchFilterBarProps {
  /** Scope select shown inside the search unit; omit for a plain search box. */
  scopes?: SelectOption[];
  scope?: string;
  onScopeChange?: (scope: string) => void;
  searchTerm: string;
  onSearch: (term: string) => void;
  /** Placeholder for the current scope — pass a per-scope string so the field
   *  says what it actually accepts. */
  searchPlaceholder?: string;
  /** Client-side validation message for the search term. */
  searchError?: string;
  /** Re-validate as the term or scope changes; return '' when valid. */
  validateSearch?: (scope: string, term: string) => string;
  filterGroups?: FilterGroup[];
  appliedChips?: AppliedChip[];
  onClearAll?: () => void;
  /** Extra buttons rendered to the right of the Filters toggle. */
  actions?: ReactNode;
}

const SearchFilterBar = ({
  scopes,
  scope = '',
  onScopeChange,
  searchTerm,
  onSearch,
  searchPlaceholder,
  searchError,
  validateSearch,
  filterGroups = [],
  appliedChips = [],
  onClearAll,
  actions,
}: SearchFilterBarProps) => {
  const intl = useIntl();
  const [term, setTerm] = useState(searchTerm);
  const [localError, setLocalError] = useState('');
  // Open the panel when arriving on a URL that already has filters applied —
  // otherwise the controls that produced the chips are hidden.
  const [isPanelOpen, setIsPanelOpen] = useState(appliedChips.length > 0);

  useEffect(() => setTerm(searchTerm), [searchTerm]);

  const error = searchError || localError;

  const submit = () => {
    const validationError = validateSearch ? validateSearch(scope, term) : '';
    setLocalError(validationError);
    if (!validationError) {
      onSearch(term.trim());
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    submit();
  };

  const handleScopeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const next = event.target.value;
    onScopeChange?.(next);
    // Re-validate against the new scope: a term that was invalid as an email
    // ("bob") is perfectly valid as a name, and vice versa.
    setLocalError(term.trim() && validateSearch ? validateSearch(next, term) : '');
  };

  return (
    <div className="rwaq-actionbar">
      <div className="rwaq-actionbar__row">
        <Form onSubmit={handleSubmit} className="rwaq-actionbar__form" noValidate>
          <div className={`rwaq-searchgroup${error ? ' rwaq-searchgroup--invalid' : ''}`}>
            {scopes && scopes.length > 0 && (
              <>
                <label className="sr-only" htmlFor="rwaq-search-scope">
                  {intl.formatMessage(messages.scopeLabel)}
                </label>
                <select
                  id="rwaq-search-scope"
                  className="rwaq-searchgroup__scope"
                  value={scope}
                  onChange={handleScopeChange}
                  aria-label={intl.formatMessage(messages.scopeLabel)}
                >
                  {scopes.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <span className="rwaq-searchgroup__divider" aria-hidden="true" />
              </>
            )}

            <label className="sr-only" htmlFor="rwaq-search-term">
              {intl.formatMessage(messages.searchInputLabel)}
            </label>
            <input
              id="rwaq-search-term"
              type="text"
              className="rwaq-searchgroup__input"
              value={term}
              placeholder={searchPlaceholder}
              onChange={(event) => {
                setTerm(event.target.value);
                if (localError && validateSearch) {
                  setLocalError(validateSearch(scope, event.target.value));
                }
              }}
              aria-label={intl.formatMessage(messages.searchInputLabel)}
              aria-invalid={!!error}
            />

            {term && (
              <IconButton
                src={Close}
                iconAs={Icon}
                size="sm"
                variant="secondary"
                className="rwaq-searchgroup__clear"
                alt={intl.formatMessage(messages.searchClearLabel)}
                onClick={() => {
                  setTerm('');
                  setLocalError('');
                  onSearch('');
                }}
              />
            )}

            <IconButton
              src={Search}
              iconAs={Icon}
              size="sm"
              variant="primary"
              className="rwaq-searchgroup__submit"
              alt={intl.formatMessage(messages.searchSubmitLabel)}
              onClick={submit}
            />
          </div>
          {error && <div className="rwaq-actionbar__error">{error}</div>}
        </Form>

        <div className="rwaq-actionbar__actions">
          {actions}
          {filterGroups.length > 0 && (
            <Button
              variant={isPanelOpen ? 'dark' : 'outline-primary'}
              iconBefore={FilterList}
              onClick={() => setIsPanelOpen((open) => !open)}
              aria-expanded={isPanelOpen}
              aria-controls="rwaq-filter-panel"
            >
              {intl.formatMessage(messages.filtersButton)}
            </Button>
          )}
        </div>
      </div>

      {filterGroups.length > 0 && (
        <div
          id="rwaq-filter-panel"
          className={`rwaq-filterpanel${isPanelOpen ? ' rwaq-filterpanel--open' : ''}`}
          // Keeps the panel out of the tab order and off screen readers while
          // collapsed, without unmounting it (which would kill the transition).
          aria-hidden={!isPanelOpen}
        >
          <div className="rwaq-filterpanel__inner">
            {filterGroups.map((group) => (
              <Form.Group key={group.id} className="mb-0" controlId={`rwaq-filter-${group.id}`}>
                <Form.Label className="rwaq-filterpanel__label">{group.label}</Form.Label>
                <Form.Control
                  as="select"
                  value={group.value}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) => group.onChange(event.target.value)}
                  disabled={!isPanelOpen}
                >
                  {group.options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </Form.Control>
              </Form.Group>
            ))}
          </div>
        </div>
      )}

      {appliedChips.length > 0 && (
        <div className="rwaq-applied">
          <span className="rwaq-applied__title">{intl.formatMessage(messages.appliedTitle)}</span>
          <div className="rwaq-applied__chips">
            {appliedChips.map((chip) => (
              <Chip
                key={chip.key}
                className="rwaq-chip rwaq-chip--applied"
                iconAfter={Close}
                iconAfterAlt={intl.formatMessage(messages.removeChip, { label: chip.label })}
                onIconAfterClick={chip.onRemove}
              >
                {chip.label}
              </Chip>
            ))}
            {onClearAll && (
              <Button variant="link" size="sm" className="rwaq-applied__clear" onClick={onClearAll}>
                {intl.formatMessage(messages.clearAll)}
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchFilterBar;
