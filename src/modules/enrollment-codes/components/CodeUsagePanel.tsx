/**
 * The usage of one code, on its page: how many learners used it of its limit, what it covers, how many
 * learners joined each item through it, and the learners themselves (the Uses tab narrowed to this code).
 *
 * "Used" counts learners, not enrollments: a learner who joined three items with an organization code
 * counts once (decision Q1).
 */
import { Link } from 'react-router-dom';
import { Alert, Button, Spinner } from '@openedx/paragon';
import { useIntl } from '@edx/frontend-platform/i18n';
import AdminDataTable from '@src/components/AdminDataTable';
import DetailGrid from '@src/components/DetailGrid';
import type { ColumnDef } from '@src/components/AdminDataTable';
import { useCodeItems } from '../data/hooks';
import type { CodeItemRow, EnrollmentCode } from '../data/types';
import messages from '../messages';
import { formatDate } from './codeDates';
import { itemPath } from './CodesList';
import { KindTag } from './CreateCodeModal';

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
    <div>
      {code && (
      <>
        <div className="rwaq-card mb-3" data-testid="code-usage-summary">
          <h2 className="rwaq-section-title mb-3">{intl.formatMessage(messages.usageTitle, { code: code.code })}</h2>
          <DetailGrid items={[
            {
              label: intl.formatMessage(messages.colUsage),
              value: intl.formatMessage(messages.usageUsedOf, { count: code.usesCount, max: code.maxUses }),
            },
            { label: intl.formatMessage(messages.usageRemainingLabel), value: remaining },
            {
              label: intl.formatMessage(messages.colExpires),
              value: code.expiresAt ? formatDate(code.expiresAt, intl.locale) : intl.formatMessage(messages.noExpiry),
            },
            { label: intl.formatMessage(messages.usageJoinedLabel), value: code.itemsJoinedCount },
            ...(code.scope === 'organization' && code.coveredItemsCount !== undefined
              ? [{
                label: intl.formatMessage(messages.colItem),
                value: intl.formatMessage(messages.usageCovers, { count: code.coveredItemsCount }),
              }] : []),
          ]}
          />
          <Button variant="outline-primary" size="sm" className="mt-3" onClick={onClose}>
            {intl.formatMessage(messages.viewLearnerActivity)}
          </Button>
        </div>
        <div className="rwaq-card">
          <h2 className="rwaq-section-title mb-3">{intl.formatMessage(messages.usageItemsTitle)}</h2>
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

        </div>
      </>
      )}
    </div>
  );
};

export default CodeUsagePanel;
