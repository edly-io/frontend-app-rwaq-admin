/**
 * SubscriptionPlanFields — the plan an admin picks when enrolling a learner into subscription content.
 *
 * Sent as subscription_plan. A learner with no live subscription needs a plan, which gives them an
 * admin subscription counted from today. A learner who already has one is enrolled without a plan:
 * WooCommerce manages their subscription, and the API refuses a plan for them.
 */
import { Form } from '@openedx/paragon';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

export type SubscriptionPlan = 'monthly' | 'yearly';

/** The picked plan, or an empty string while none is picked. */
export type SubscriptionPlanValue = SubscriptionPlan | '';

export const defaultSubscriptionPlan: SubscriptionPlanValue = '';

/** The request field for a plan value, or nothing when the content is not part of the subscription. */
export const subscriptionPlanPayload = (
  isSubscription: boolean | undefined,
  value: SubscriptionPlanValue,
): { subscriptionPlan?: SubscriptionPlan } => (isSubscription && value ? { subscriptionPlan: value } : {});

const messages = defineMessages({
  label: { id: 'rwaq.admin.subscription-plan.label', defaultMessage: 'Subscription plan' },
  none: { id: 'rwaq.admin.subscription-plan.none', defaultMessage: 'No plan (the learner already has a subscription)' },
  help: {
    id: 'rwaq.admin.subscription-plan.help',
    defaultMessage: 'Pick a plan for a learner who has no live subscription. It gives them access to all subscription content from today.',
  },
  monthly: { id: 'rwaq.admin.subscription-plan.monthly', defaultMessage: 'Monthly' },
  yearly: { id: 'rwaq.admin.subscription-plan.yearly', defaultMessage: 'Yearly' },
});

interface Props {
  value: SubscriptionPlanValue;
  onChange: (value: SubscriptionPlanValue) => void;
}

const SubscriptionPlanFields = ({ value, onChange }: Props) => {
  const intl = useIntl();
  return (
    <Form.Group>
      <Form.Label>{intl.formatMessage(messages.label)}</Form.Label>
      <Form.Control
        as="select"
        value={value}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value as SubscriptionPlanValue)}
      >
        <option value="">{intl.formatMessage(messages.none)}</option>
        <option value="monthly">{intl.formatMessage(messages.monthly)}</option>
        <option value="yearly">{intl.formatMessage(messages.yearly)}</option>
      </Form.Control>
      <Form.Text>{intl.formatMessage(messages.help)}</Form.Text>
    </Form.Group>
  );
};

export default SubscriptionPlanFields;
