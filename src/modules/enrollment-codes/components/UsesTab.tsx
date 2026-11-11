/**
 * Every use of an enrollment code: who joined with which code, and when. Filters: code, course or program,
 * date range and student. The same filters drive the CSV download. A code picked in the Codes tab arrives as
 * `codeId` (exact match, so a code that is part of a longer one is not mixed in).
 */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge, Form } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import CsvDownloadButton from '@src/components/CsvDownloadButton';
import ErrorState from '@src/components/ErrorState';
import SearchFilterBar from '@src/components/SearchFilterBar';
import type { AppliedChip } from '@src/components/SearchFilterBar';
import { getErrorStatus } from '@src/data/httpError';
import {
  DateFilter, PAGE_SIZE, formatDateTime, listScope, tablePagination, useDateRange, useListState,
} from '@src/modules/payments/components/shared';
import { getEnrollmentCodeUsesCsvUrl } from '../data/api';
import { useEnrollmentCodeUses } from '../data/hooks';
import type { CodeUse, ItemKind, UseListParams } from '../data/types';
import messages from '../messages';
import { KindTag } from './CreateCodeModal';
import ItemPicker from './ItemPicker';
import type { PickedItem } from './ItemPicker';
import useDebounced from './useDebounced';

const itemPath = (kind: ItemKind, id: string) => (
  kind === 'program' ? `/programs/${id}` : `/courses/${encodeURIComponent(id)}`
);

interface UsesTabProps {
  /** One code, from the Codes tab, and its text for the chip. */
  codeId?: number;
  codeLabel?: string;
  onClearCode: () => void;
}

const UsesTab = ({ codeId, codeLabel, onClearCode }: UsesTabProps) => {
  const intl = useIntl();
  const dates = useDateRange();
  const [codeInput, setCodeInput] = useState('');
  const codeText = useDebounced(codeInput.trim());
  const [item, setItem] = useState<PickedItem | null>(null);
  const itemKey = item ? `${item.kind}:${item.id}` : '';
  const scope = listScope(codeId ? String(codeId) : '', dates.startDate, dates.endDate, codeText, itemKey);
  const list = useListState('', {}, scope);

  const listParams: UseListParams = {
    codeId,
    code: codeText || undefined,
    courseId: item?.kind === 'course' ? item.id : undefined,
    programUuid: item?.kind === 'program' ? item.id : undefined,
    startDate: dates.startDate,
    endDate: dates.endDate,
    search: list.search || undefined,
    page: list.page,
    pageSize: PAGE_SIZE,
  };
  const {
    data, isLoading, isPlaceholderData, isError, error, refetch,
  } = useEnrollmentCodeUses(listParams);

  const chips: AppliedChip[] = [];
  if (list.search) {
    chips.push({
      key: 'search',
      label: intl.formatMessage(messages.chipSearch, { term: list.search }),
      onRemove: () => list.setSearch(''),
    });
  }
  if (codeId) {
    chips.push({
      key: 'codeId',
      label: intl.formatMessage(messages.chipCode, { code: codeLabel ?? `#${codeId}` }),
      onRemove: onClearCode,
    });
  }
  if (item) {
    chips.push({
      key: 'item',
      label: intl.formatMessage(messages.chipItem, { name: item.name }),
      onRemove: () => setItem(null),
    });
  }

  const columns: ColumnDef<CodeUse>[] = [
    {
      label: intl.formatMessage(messages.colStudent),
      key: 'student',
      renderCell: (_value, row) => (
        <div className="min-width-0">
          <div className="rwaq-user-cell__name" title={row.student.name}>
            <Link to={`/users/${row.student.id}`}>{row.student.name || row.student.username}</Link>
          </div>
          <div className="rwaq-user-cell__meta" title={row.student.email}>
            {row.student.username}
            {' · '}
            {row.student.email}
          </div>
        </div>
      ),
    },
    {
      label: intl.formatMessage(messages.colCode),
      key: 'code',
      renderCell: (value) => <strong className="rwaq-order-cell">{value as string}</strong>,
    },
    {
      label: intl.formatMessage(messages.colItem),
      key: 'item',
      renderCell: (_value, row) => (
        <div className="rwaq-user-cell__name" title={row.item.name}>
          <Link to={itemPath(row.item.kind, row.item.id)}>{row.item.name}</Link>
          <KindTag kind={row.item.kind} />
        </div>
      ),
    },
    {
      label: intl.formatMessage(messages.colUsedOn),
      key: 'usedAt',
      renderCell: (value) => formatDateTime(value as string, intl.locale),
    },
    {
      label: intl.formatMessage(messages.colEnrolled),
      key: 'stillEnrolled',
      renderCell: (value) => (
        <Badge variant={value ? 'success' : 'secondary'}>
          {intl.formatMessage(value ? messages.stillEnrolled : messages.left)}
        </Badge>
      ),
    },
  ];

  return (
    <>
      <SearchFilterBar
        searchTerm={list.search}
        onSearch={list.setSearch}
        searchPlaceholder={intl.formatMessage(messages.usesSearch)}
        appliedChips={chips}
        onClearAll={() => {
          list.clearAll();
          setCodeInput('');
          setItem(null);
          onClearCode();
          dates.setRange();
        }}
        actions={(
          <>
            <DateFilter range={dates} />
            <CsvDownloadButton
              url={getEnrollmentCodeUsesCsvUrl()}
              params={listParams as Record<string, unknown>}
              fallbackName="enrollment_code_uses"
            />
          </>
        )}
      />
      <div className="d-flex flex-wrap align-items-center mb-3">
        <Form.Group className="mb-0 mr-3" controlId="enrollment-code-uses-code">
          <Form.Label className="sr-only">{intl.formatMessage(messages.usesCodeFilter)}</Form.Label>
          <Form.Control
            value={codeInput}
            placeholder={intl.formatMessage(messages.usesCodePlaceholder)}
            autoComplete="off"
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => setCodeInput(event.target.value.toUpperCase())}
          />
        </Form.Group>
        <ItemPicker
          compact
          controlId="enrollment-code-uses-item"
          label={intl.formatMessage(messages.usesItemFilter)}
          emptyLabel={intl.formatMessage(messages.usesAllItems)}
          value={item}
          onChange={setItem}
        />
      </div>
      {isError ? (
        <ErrorState
          statusCode={getErrorStatus(error) || undefined}
          title={intl.formatMessage(messages.errorTitle)}
          onRetry={() => refetch()}
        />
      ) : (
        <AdminDataTable
          columns={columns}
          data={data?.results ?? []}
          isLoading={isLoading || isPlaceholderData}
          caption={intl.formatMessage(messages.tabUses)}
          pagination={tablePagination(data, list.page, list.setPage)}
        />
      )}
    </>
  );
};

export default UsesTab;
