/**
 * The Codes card on a course or program detail page. Shown only when the item's type is Enrollment code.
 * It is the codes list filtered to this item, with a Create button that preselects the item.
 */
import { useNavigate } from 'react-router-dom';
import { useIntl } from '@edx/frontend-platform/i18n';
import messages from '../messages';
import CodesList from './CodesList';
import type { PickedItem } from './ItemPicker';

interface CodesCardProps {
  item: PickedItem;
}

const CodesCard = ({ item }: CodesCardProps) => {
  const intl = useIntl();
  const navigate = useNavigate();
  return (
    <div className="rwaq-card" data-testid="enrollment-codes-card">
      <div className="d-flex justify-content-between align-items-start flex-wrap mb-4">
        <div>
          <h2 className="rwaq-section-title mb-1">{intl.formatMessage(messages.cardSectionTitle)}</h2>
          <p className="text-muted small mb-0">
            {intl.formatMessage(item.kind === 'course' ? messages.cardSectionCourse : messages.cardSectionProgram)}
          </p>
        </div>
      </div>
      <CodesList
        item={item}
        onViewUses={(code) => navigate(
          `/enrollment-codes?tab=uses&codeId=${code.id}&code=${encodeURIComponent(code.code)}`,
        )}
      />
    </div>
  );
};

export default CodesCard;
