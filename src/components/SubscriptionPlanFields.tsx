/**
 * SubscriptionPlanFields — the plan an admin picks when enrolling a learner into subscription content.
 *
 * Sent as subscription_plan and subscription_ends_at. The backend uses them only when the learner
 * has no live subscription, and creates an admin subscription from them.
 */
import { Form } from '@openedx/paragon';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

export type SubscriptionPlan = 'monthly' | 'yearly' | 'custom';

export interface SubscriptionPlanValue {
  plan: SubscriptionPlan;
  endsAt: string;
}

export const defaultSubscriptionPlan: SubscriptionPlanValue = { plan: 'monthly', endsAt: '' };

/** The request fields for a plan value, or none when the content is not part of the subscription. */
export const subscriptionPlanPayload = (
  isSubscription: boolean | undefined,
  value: SubscriptionPlanValue,
): { subscriptionPlan?: SubscriptionPlan; subscriptionEndsAt?: string } => {
  if (!isSubscription) { return {}; }
  return value.plan === 'custom'
    ? { subscriptionPlan: 'custom', subscriptionEndsAt: value.endsAt }
    : { subscriptionPlan: value.plan };
};

const messages = defineMessages({
  label: { id: 'rwaq.admin.subscription-plan.label', defaultMessage: 'Subscription plan' },
  help: {
    id: 'rwaq.admin.subscription-plan.help',
    defaultMessage: 'Used only if the learner has no live subscription. It gives them access to all subscription content.',
  },
  monthly: { id: 'rwaq.admin.subscription-plan.monthly', defaultMessage: 'Monthly' },
  yearly: { id: 'rwaq.admin.subscription-plan.yearly', defaultMessage: 'Yearly' },
  custom: { id: 'rwaq.admin.subscription-plan.custom', defaultMessage: 'End date' },
  endsAt: { id: 'rwaq.admin.subscription-plan.ends-at', defaultMessage: 'Access ends on' },
});

interface Props {
  value: SubscriptionPlanValue;
  onChange: (value: SubscriptionPlanValue) => void;
}

const SubscriptionPlanFields = ({ value, onChange }: Props) => {
  const intl = useIntl();
  return (
    <>
      <Form.Group>
        <Form.Label>{intl.formatMessage(messages.label)}</Form.Label>
        <Form.Control
          as="select"
          value={value.plan}
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...value, plan: e.target.value as SubscriptionPlan })}
        >
          <option value="monthly">{intl.formatMessage(messages.monthly)}</option>
          <option value="yearly">{intl.formatMessage(messages.yearly)}</option>
          <option value="custom">{intl.formatMessage(messages.custom)}</option>
        </Form.Control>
        <Form.Text>{intl.formatMessage(messages.help)}</Form.Text>
      </Form.Group>
      {value.plan === 'custom' && (
        <Form.Group>
          <Form.Label>{intl.formatMessage(messages.endsAt)}</Form.Label>
          <Form.Control
            type="date"
            value={value.endsAt}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...value, endsAt: e.target.value })}
          />
        </Form.Group>
      )}
    </>
  );
};

export default SubscriptionPlanFields;
