/**
 * The 409 state, shared by all three enrollment dialogs.
 *
 * A conflict means the row the admin is looking at no longer matches the
 * server, so the only useful next step is to look again. Telling them to
 * "reload" without giving them a way to do it would leave closing and
 * reopening the dialog as the actual instruction — so the alert carries the
 * action.
 *
 * Reloading refetches the enrollments and closes any dialog scoped to a single
 * row: that dialog's subject (its mode, its active state) is exactly what just
 * turned out to be stale, so keeping it open would invite a second write
 * against the same wrong data.
 */
import { Alert, Button } from '@openedx/paragon';
import { useQueryClient } from '@tanstack/react-query';
import { useIntl } from '@edx/frontend-platform/i18n';
import { userQueryKeys } from '../data/hooks';
import messages from '../messages';

interface ConflictAlertProps {
  userId: number;
  /** Called after the refetch is queued; omit to leave the dialog open. */
  onReload?: () => void;
}

const ConflictAlert = ({ userId, onReload }: ConflictAlertProps) => {
  const intl = useIntl();
  const queryClient = useQueryClient();

  const reload = () => {
    queryClient.invalidateQueries({ queryKey: userQueryKeys.enrollments(userId) });
    onReload?.();
  };

  return (
    <Alert
      variant="warning"
      actions={[
        <Button key="reload" onClick={reload}>
          {intl.formatMessage(messages.enrollmentReload)}
        </Button>,
      ]}
    >
      {intl.formatMessage(messages.enrollmentConflict)}
    </Alert>
  );
};

export default ConflictAlert;
