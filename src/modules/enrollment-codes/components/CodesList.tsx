/**
 * The list of enrollment codes, with its filters, create button and row actions.
 *
 * Used in the Codes tab of the Enrollment codes page. `item` fixes the list to one course, program or
 * organization (its organization codes), hides the scope filter and fixes the item in the create form.
 * `prefillItem` opens the create form once with that item fixed (the pricing cards' Add enrollment code
 * button links to the page with it), and `onPrefillHandled` then tells the page it was used.
 *
 * Row actions: view card, view usage (opens the usage panel, `onViewUsage`), view the learners in the Uses
 * tab, switch off or on, edit, and delete (only a code with no uses).
 */
import {
  Suspense, lazy, useEffect, useState,
} from 'react';
import { Link } from 'react-router-dom';
import {
  Badge, Button, Icon, IconButton,
} from '@openedx/paragon';
import {
  Add, ContentCopy, Delete, Edit, People, QrCode2, ToggleOff, ToggleOn, Visibility,
} from '@openedx/paragon/icons';
import { useIntl } from '@edx/frontend-platform/i18n';
import { logError } from '@edx/frontend-platform/logging';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import ErrorState from '@src/components/ErrorState';
import SearchFilterBar from '@src/components/SearchFilterBar';
import type { AppliedChip } from '@src/components/SearchFilterBar';
import { useToast } from '@src/components/ToastContext';
import { getErrorStatus } from '@src/data/httpError';
import {
  PAGE_SIZE, listScope, tablePagination, useListState,
} from '@src/modules/payments/components/shared';
import { useEnrollmentCodes, useUpdateEnrollmentCode } from '../data/hooks';
import type {
  CodeListParams, CodeScope, CodeStatus, EnrollmentCode, ItemKind,
} from '../data/types';
import messages from '../messages';
import { formatDate } from './codeDates';
import copyText from './copyCode';
import CreateCodeModal, { KindTag } from './CreateCodeModal';
import DeleteCodeModal from './DeleteCodeModal';
import EditCodeModal from './EditCodeModal';
import type { PickedItem } from './ItemPicker';

const ShareCardModal = lazy(() => import('./ShareCardModal'));

const STATUS_VARIANT: Record<CodeStatus, string> = {
  active: 'success',
  switched_off: 'secondary',
  expired: 'warning',
  used_up: 'info',
};

const STATUS_MESSAGE = {
  active: messages.statusActive,
  switched_off: messages.statusSwitchedOff,
  expired: messages.statusExpired,
  used_up: messages.statusUsedUp,
};

/** The existing detail page for a course or program. */
export const itemPath = (kind: ItemKind | 'organization', id: string) => {
  if (kind === 'organization') { return `/organizations/${encodeURIComponent(id)}`; }
  return kind === 'program' ? `/programs/${id}` : `/courses/${encodeURIComponent(id)}`;
};

interface CodesListProps {
  /** Fixes the list to one course, one program or one organization (its organization codes). */
  item?: PickedItem;
  /** Opens the Uses tab filtered to this code. */
  onViewUses: (code: EnrollmentCode) => void;
  /** Opens the usage panel of this code. Without it the row has no usage action. */
  onViewUsage?: (code: EnrollmentCode) => void;
  /** Opens the create form once, with this course or program fixed. */
  prefillItem?: PickedItem;
  onPrefillHandled?: () => void;
}

const CodesList = ({
  item, onViewUses, onViewUsage, prefillItem, onPrefillHandled,
}: CodesListProps) => {
  const intl = useIntl();
  const { showToast } = useToast();
  const updateMutation = useUpdateEnrollmentCode();
  const list = useListState('', { status: '', kind: '' }, listScope(item?.id));

  const [creating, setCreating] = useState(false);
  const [createFor, setCreateFor] = useState<PickedItem | undefined>(undefined);
  const [editing, setEditing] = useState<EnrollmentCode | null>(null);
  const [deleting, setDeleting] = useState<EnrollmentCode | null>(null);
  const [share, setShare] = useState<{ id: number; isNew: boolean } | null>(null);

  useEffect(() => {
    if (prefillItem) {
      setCreateFor(prefillItem);
      setCreating(true);
      onPrefillHandled?.();
    }
    // Once per prefill item: the handler only tells the page to forget it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefillItem]);

  let kindFilter: CodeScope | undefined;
  if (item?.kind === 'organization') {
    kindFilter = 'organization';
  } else if (!item) {
    kindFilter = (list.filters.kind || undefined) as CodeScope | undefined;
  }
  const listParams: CodeListParams = {
    status: (list.filters.status || undefined) as CodeStatus | undefined,
    kind: kindFilter,
    organization: item?.kind === 'organization' ? item.id : undefined,
    courseId: item?.kind === 'course' ? item.id : undefined,
    programUuid: item?.kind === 'program' ? item.id : undefined,
    search: list.search || undefined,
    page: list.page,
    pageSize: PAGE_SIZE,
  };
  const {
    data, isLoading, isPlaceholderData, isError, error, refetch,
  } = useEnrollmentCodes(listParams);

  const statusOptions = [
    { value: '', label: intl.formatMessage(messages.filterAll) },
    ...(['active', 'switched_off', 'expired', 'used_up'] as CodeStatus[]).map((value) => ({
      value, label: intl.formatMessage(STATUS_MESSAGE[value]),
    })),
  ];
  const kindOptions = [
    { value: '', label: intl.formatMessage(messages.filterAll) },
    { value: 'course', label: intl.formatMessage(messages.kindCourse) },
    { value: 'program', label: intl.formatMessage(messages.kindProgram) },
    { value: 'organization', label: intl.formatMessage(messages.kindOrganization) },
  ];
  const optionLabel = (options: { value: string; label: string }[], value: string) => (
    options.find((option) => option.value === value)?.label ?? value
  );

  const chips: AppliedChip[] = [];
  if (list.search) {
    chips.push({
      key: 'search',
      label: intl.formatMessage(messages.chipSearch, { term: list.search }),
      onRemove: () => list.setSearch(''),
    });
  }
  if (list.filters.status) {
    chips.push({
      key: 'status',
      label: intl.formatMessage(messages.chipStatus, { label: optionLabel(statusOptions, list.filters.status) }),
      onRemove: () => list.setFilter('status', ''),
    });
  }
  if (!item && list.filters.kind) {
    chips.push({
      key: 'kind',
      label: intl.formatMessage(messages.chipKind, { label: optionLabel(kindOptions, list.filters.kind) }),
      onRemove: () => list.setFilter('kind', ''),
    });
  }

  const handleCopy = async (code: string) => {
    const copied = await copyText(code);
    showToast(intl.formatMessage(copied ? messages.codeCopied : messages.codeCopyFailed));
  };

  const handleToggle = async (row: EnrollmentCode) => {
    if (updateMutation.isPending) { return; }
    try {
      await updateMutation.mutateAsync({ id: row.id, patch: { isActive: !row.isActive } });
      showToast(intl.formatMessage(row.isActive ? messages.switchedOffToast : messages.switchedOnToast, {
        code: row.code,
      }));
    } catch (err) {
      logError(err);
      showToast(intl.formatMessage(messages.switchFailed));
    }
  };

  const columns: ColumnDef<EnrollmentCode>[] = [
    {
      label: intl.formatMessage(messages.colCode),
      key: 'code',
      renderCell: (_value, row) => (
        <span className="d-inline-flex align-items-center">
          <strong className="rwaq-order-cell">{row.code}</strong>
          <IconButton
            src={ContentCopy}
            iconAs={Icon}
            alt={intl.formatMessage(messages.copyCode, { code: row.code })}
            size="inline"
            className="ml-1"
            onClick={() => handleCopy(row.code)}
          />
        </span>
      ),
    },
    ...(item ? [] : [{
      label: intl.formatMessage(messages.colItem),
      key: 'item',
      renderCell: (_value: unknown, row: EnrollmentCode) => (
        <div className="min-width-0">
          <div className="rwaq-user-cell__name" title={row.item.name}>
            <Link to={itemPath(row.item.kind, row.item.id)}>{row.item.name}</Link>
            <KindTag kind={row.item.kind} />
          </div>
          <div className="rwaq-user-cell__meta">
            {row.scope === 'organization' && row.coveredItemsCount !== undefined
              ? intl.formatMessage(messages.usageCovers, { count: row.coveredItemsCount })
              : row.item.organization}
          </div>
        </div>
      ),
    }]),
    {
      label: intl.formatMessage(messages.colCreatedBy),
      key: 'createdBy',
    },
    {
      label: intl.formatMessage(messages.colUsage),
      key: 'usesCount',
      renderCell: (_value, row) => (
        <>
          <div>{intl.formatMessage(messages.usageUsedOf, { count: row.usesCount, max: row.maxUses })}</div>
          {row.itemsJoinedCount > 0 && (
            <div className="rwaq-user-cell__meta">
              {intl.formatMessage(messages.usageJoined, { count: row.itemsJoinedCount })}
            </div>
          )}
        </>
      ),
    },
    {
      label: intl.formatMessage(messages.colExpires),
      key: 'expiresAt',
      renderCell: (value) => (value ? formatDate(value as string, intl.locale) : intl.formatMessage(messages.noExpiry)),
    },
    {
      label: intl.formatMessage(messages.colStatus),
      key: 'status',
      renderCell: (value) => (
        <Badge variant={STATUS_VARIANT[value as CodeStatus]}>
          {intl.formatMessage(STATUS_MESSAGE[value as CodeStatus])}
        </Badge>
      ),
    },
    {
      label: intl.formatMessage(messages.colActions),
      isLabelHidden: true,
      key: 'actions',
      id: 'actions',
      renderCell: (_value, row) => (
        <span className="d-inline-flex align-items-center text-nowrap">
          <IconButton
            src={QrCode2}
            iconAs={Icon}
            alt={intl.formatMessage(messages.actionViewCard)}
            onClick={() => setShare({ id: row.id, isNew: false })}
          />
          {onViewUsage && (
            <IconButton
              src={Visibility}
              iconAs={Icon}
              alt={intl.formatMessage(messages.actionViewUsage, { code: row.code })}
              onClick={() => onViewUsage(row)}
            />
          )}
          <IconButton
            src={People}
            iconAs={Icon}
            alt={intl.formatMessage(messages.actionViewUses)}
            onClick={() => onViewUses(row)}
          />
          <IconButton
            src={row.isActive ? ToggleOn : ToggleOff}
            iconAs={Icon}
            alt={intl.formatMessage(row.isActive ? messages.actionSwitchOff : messages.actionSwitchOn)}
            onClick={() => handleToggle(row)}
          />
          <IconButton
            src={Edit}
            iconAs={Icon}
            alt={intl.formatMessage(messages.actionEdit)}
            onClick={() => setEditing(row)}
          />
          {row.usesCount === 0 && (
            <IconButton
              src={Delete}
              iconAs={Icon}
              alt={intl.formatMessage(messages.actionDelete)}
              onClick={() => setDeleting(row)}
            />
          )}
        </span>
      ),
    },
  ];

  const filterGroups = [
    {
      id: 'status',
      label: intl.formatMessage(messages.filterStatus),
      value: list.filters.status,
      options: statusOptions,
      onChange: (value: string) => list.setFilter('status', value),
    },
    ...(item ? [] : [{
      id: 'kind',
      label: intl.formatMessage(messages.filterKind),
      value: list.filters.kind,
      options: kindOptions,
      onChange: (value: string) => list.setFilter('kind', value),
    }]),
  ];

  return (
    <>
      <SearchFilterBar
        searchTerm={list.search}
        onSearch={list.setSearch}
        searchPlaceholder={intl.formatMessage(messages.codesSearch)}
        filterGroups={filterGroups}
        appliedChips={chips}
        onClearAll={list.clearAll}
        actions={(
          <Button variant="primary" iconBefore={Add} onClick={() => { setCreateFor(undefined); setCreating(true); }}>
            {intl.formatMessage(messages.create)}
          </Button>
        )}
      />
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
          caption={intl.formatMessage(messages.tabCodes)}
          pagination={tablePagination(data, list.page, list.setPage)}
        />
      )}

      <CreateCodeModal
        isOpen={creating}
        onClose={() => setCreating(false)}
        fixedItem={item ?? createFor}
        onCreated={(created) => setShare({ id: created.id, isNew: true })}
      />
      <EditCodeModal code={editing} onClose={() => setEditing(null)} />
      <DeleteCodeModal code={deleting} onClose={() => setDeleting(null)} />
      {share && (
        <Suspense fallback={null}>
          <ShareCardModal codeId={share.id} isNew={share.isNew} onClose={() => setShare(null)} />
        </Suspense>
      )}
    </>
  );
};

export default CodesList;
