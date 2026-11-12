/**
 * The Codes card in the Enrollment code tab of a course, program or organization detail page. The course and
 * program tabs show only when the item's type is Enrollment code. It is the codes list filtered to this item
 * (for an organization: its organization codes), with a Create button that fixes the item, and the usage
 * panel of a code.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import type { EnrollmentCode } from '../data/types';
import messages from '../messages';
import CodeUsagePanel from './CodeUsagePanel';
import CodesList from './CodesList';
import type { PickedItem } from './ItemPicker';

interface CodesCardProps {
  item: PickedItem;
}

const CodesCard = ({ item }: CodesCardProps) => {
  const intl = useIntl();
  const navigate = useNavigate();
  const [usage, setUsage] = useState<EnrollmentCode | null>(null);
  const description = {
    course: messages.cardSectionCourse,
    program: messages.cardSectionProgram,
    organization: messages.orgCodesDescription,
  }[item.kind];
  return (
    <div className="rwaq-card" data-testid="enrollment-codes-card">
      <div className="d-flex justify-content-between align-items-start flex-wrap mb-4">
        <div>
          <h2 className="rwaq-section-title mb-1">{intl.formatMessage(messages.cardSectionTitle)}</h2>
          <p className="text-muted small mb-0">{intl.formatMessage(description)}</p>
        </div>
      </div>
      <CodesList
        item={item}
        onViewUsage={setUsage}
        onViewUses={(code) => navigate(
          `/enrollment-codes?tab=uses&codeId=${code.id}&code=${encodeURIComponent(code.code)}`,
        )}
      />
      <CodeUsagePanel code={usage} onClose={() => setUsage(null)} />
    </div>
  );
};

export default CodesCard;
