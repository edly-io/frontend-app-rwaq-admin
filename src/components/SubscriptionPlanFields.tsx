/**
 * SubscriptionPlanFields — the plan an admin picks when enrolling a learner into subscription content.
 *
 * Sent as subscription_plan. A learner with no live subscription must pick Monthly or Yearly, which
 * gives them an admin subscription counted from today. A learner who already has one is enrolled
 * without a plan: the field is disabled and the API refuses a plan for them.
 */
import { Form } from '@openedx/paragon';
import { defineMessages, useIntl } from '@edx/frontend-platform/i18n';

export type SubscriptionPlan = 'monthly' | 'yearly';

/** The picked plan, or an empty string while none is picked. */
export type SubscriptionPlanValue = SubscriptionPlan | '';

export const defaultSubscriptionPlan: SubscriptionPlanValue = '';

/**
 * The request field for a plan value. Nothing is sent when the content is not part of the
 * subscription or the learner already has a live subscription (liveUntil is set).
 */
export const subscriptionPlanPayload = (
  isSubscription: boolean | undefined,
  value: SubscriptionPlanValue,
  liveUntil?: string | null,
): { subscriptionPlan?: SubscriptionPlan } => (
  isSubscription && value && !liveUntil ? { subscriptionPlan: value } : {}
);

/** True when a plan must be picked: subscription content, and a learner without a live subscription. */
export const isPlanRequired = (
  isSubscription: boolean | undefined,
  value: SubscriptionPlanValue,
  liveUntil?: string | null,
): boolean => Boolean(isSubscription) && !liveUntil && !value;

const messages = defineMessages({
  label: { id: 'rwaq.admin.subscription-plan.label', defaultMessage: 'Subscription plan' },
  placeholder: { id: 'rwaq.admin.subscription-plan.placeholder', defaultMessage: 'Select a plan' },
  help: {
    id: 'rwaq.admin.subscription-plan.help',
    defaultMessage: 'The plan gives the learner access to all subscription content from today.',
  },
  helpLive: {
    id: 'rwaq.admin.subscription-plan.helpLive',
    defaultMessage: 'This learner already has a subscription (ends {date}). No plan is needed.',
  },
  helpBulk: {
    id: 'rwaq.admin.subscription-plan.helpBulk',
    defaultMessage: 'The plan gives each learner access to all subscription content from today. Learners who already have a live subscription keep theirs and the plan is not applied to them.',
  },
  required: { id: 'rwaq.admin.subscription-plan.required', defaultMessage: 'Please select a plan.' },
  monthly: { id: 'rwaq.admin.subscription-plan.monthly', defaultMessage: 'Monthly' },
  yearly: { id: 'rwaq.admin.subscription-plan.yearly', defaultMessage: 'Yearly' },
});

/** The required-field error text, for the modals to pass as `error`. */
export const subscriptionPlanRequiredMessage = messages.required;

interface Props {
  value: SubscriptionPlanValue;
  onChange: (value: SubscriptionPlanValue) => void;
  /** End date of the learner's live subscription. When set the field is disabled and no plan is sent. */
  liveUntil?: string | null;
  /** Required-field error shown under the field. */
  error?: string;
  /** Use the help text for many learners at once (bulk enroll). */
  isBulk?: boolean;
}

const SubscriptionPlanFields = ({
  value, onChange, liveUntil = null, error, isBulk = false,
}: Props) => {
  const intl = useIntl();
  let help = intl.formatMessage(isBulk ? messages.helpBulk : messages.help);
  if (liveUntil) {
    help = intl.formatMessage(messages.helpLive, { date: intl.formatDate(liveUntil, { dateStyle: 'medium' }) });
  }
  return (
    <Form.Group isInvalid={Boolean(error)}>
      <Form.Label>{intl.formatMessage(messages.label)}</Form.Label>
      <Form.Control
        as="select"
        value={liveUntil ? '' : value}
        disabled={Boolean(liveUntil)}
        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value as SubscriptionPlanValue)}
      >
        <option value="">{intl.formatMessage(messages.placeholder)}</option>
        <option value="monthly">{intl.formatMessage(messages.monthly)}</option>
        <option value="yearly">{intl.formatMessage(messages.yearly)}</option>
      </Form.Control>
      {error
        ? <Form.Control.Feedback type="invalid">{error}</Form.Control.Feedback>
        : <Form.Text>{help}</Form.Text>}
    </Form.Group>
  );
};

export default SubscriptionPlanFields;
