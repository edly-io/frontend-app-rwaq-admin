/**
 * The usage of one code, in a modal: how many learners used it of its limit, what it covers, how many
 * learners joined each item through it, and the learners themselves (the Uses tab narrowed to this code).
 *
 * "Used" counts learners, not enrollments: a learner who joined three items with an organization code
 * counts once (decision Q1).
 */
import { Link } from 'react-router-dom';
import { Alert, ModalDialog, Spinner } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import type { ColumnDef } from '@src/components/AdminDataTable';
import { useCodeItems } from '../data/hooks';
import type { CodeItemRow, EnrollmentCode } from '../data/types';
import messages from '../messages';
import { formatDate } from './codeDates';
import { itemPath } from './CodesList';
import { KindTag } from './CreateCodeModal';
import UsesTab from './UsesTab';

interface CodeUsagePanelProps {
  /** The code shown. null keeps the panel closed. */
  code: EnrollmentCode | null;
  onClose: () => void;
}

const CodeUsagePanel = ({ code, onClose }: CodeUsagePanelProps) => {
  const intl = useIntl();
  const { data: items, isLoading, isError } = useCodeItems(code?.id ?? null);

  const columns: ColumnDef<CodeItemRow>[] = [
    {
      label: intl.formatMessage(messages.usageColItem),
      key: 'name',
      renderCell: (_value, row) => <Link to={itemPath(row.kind, row.id)}>{row.name}</Link>,
    },
    {
      label: intl.formatMessage(messages.usageColType),
      key: 'kind',
      renderCell: (_value, row) => <KindTag kind={row.kind} />,
    },
    {
      label: intl.formatMessage(messages.usageColLearners),
      key: 'learnersJoined',
    },
  ];

  const remaining = code ? Math.max(0, code.maxUses - code.usesCount) : 0;

  return (
    <ModalDialog
      title={intl.formatMessage(messages.usageTitle, { code: code?.code ?? '' })}
      isOpen={code !== null}
      onClose={onClose}
      size="xl"
      isFullscreenOnMobile
      hasCloseButton
      isOverflowVisible={false}
      className="rwaq-form-modal"
    >
      <ModalDialog.Header className="rwaq-form-modal__header">
        <ModalDialog.Title>{intl.formatMessage(messages.usageTitle, { code: code?.code ?? '' })}</ModalDialog.Title>
      </ModalDialog.Header>
      <ModalDialog.Body className="rwaq-form-modal__body">
        {code && (
          <>
            <div className="mb-4" data-testid="code-usage-summary">
              <h3 className="h2 mb-1">
                {intl.formatMessage(messages.usageUsedOf, { count: code.usesCount, max: code.maxUses })}
              </h3>
              <p className="text-muted mb-0">
                {[
                  intl.formatMessage(messages.usageRemaining, { count: remaining }),
                  intl.formatMessage(messages.usageJoined, { count: code.itemsJoinedCount }),
                  code.expiresAt
                    ? intl.formatMessage(messages.usageExpires, { date: formatDate(code.expiresAt, intl.locale) })
                    : intl.formatMessage(messages.noExpiry),
                  ...(code.scope === 'organization' && code.coveredItemsCount !== undefined
                    ? [intl.formatMessage(messages.usageCovers, { count: code.coveredItemsCount })]
                    : []),
                ].join(' · ')}
              </p>
            </div>

            <h4 className="mb-2">{intl.formatMessage(messages.usageItemsTitle)}</h4>
            {isLoading && (
              <div className="text-center py-3">
                <Spinner animation="border" variant="primary" size="sm" role="status">
                  <span className="sr-only">{intl.formatMessage(messages.cardLoading)}</span>
                </Spinner>
              </div>
            )}
            {isError && <Alert variant="danger">{intl.formatMessage(messages.usageItemsLoadFailed)}</Alert>}
            {items && items.length === 0 && (
              <p className="text-muted">{intl.formatMessage(messages.usageNoItems)}</p>
            )}
            {items && items.length > 0 && (
              <AdminDataTable
                columns={columns}
                data={items}
                isLoading={false}
                caption={intl.formatMessage(messages.usageItemsTitle)}
              />
            )}

            <h4 className="mt-4 mb-2">{intl.formatMessage(messages.usageLearnersTitle)}</h4>
            <UsesTab codeId={code.id} codeLabel={code.code} onClearCode={onClose} />
          </>
        )}
      </ModalDialog.Body>
    </ModalDialog>
  );
};

export default CodeUsagePanel;
