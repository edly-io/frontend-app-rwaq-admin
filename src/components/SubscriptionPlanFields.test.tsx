/**
 * The plan picker: Monthly or Yearly only, a placeholder by default, disabled for a learner with a live subscription.
 */
import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import SubscriptionPlanFields, {
  defaultSubscriptionPlan, isPlanRequired, subscriptionPlanPayload,
} from './SubscriptionPlanFields';

describe('SubscriptionPlanFields', () => {
  it('starts with no plan and offers only Monthly and Yearly', () => {
    renderWrapper(<SubscriptionPlanFields value={defaultSubscriptionPlan} onChange={jest.fn()} />);

    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(screen.getAllByRole('option').map((option) => option.getAttribute('value'))).toEqual(['', 'monthly', 'yearly']);
    expect(screen.queryByText('End date')).not.toBeInTheDocument();
  });

  it('has no No plan option and shows the placeholder', () => {
    renderWrapper(<SubscriptionPlanFields value="" onChange={jest.fn()} />);

    expect(screen.getByRole('option', { name: 'Select a plan' })).toHaveValue('');
    expect(screen.queryByText(/No plan \(/)).not.toBeInTheDocument();
  });

  it('is disabled with the end date for a learner with a live subscription', () => {
    renderWrapper(<SubscriptionPlanFields value="monthly" onChange={jest.fn()} liveUntil="2026-12-31T00:00:00Z" />);

    expect(screen.getByRole('combobox')).toBeDisabled();
    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(screen.getByText(/already has a subscription \(ends .*2026.*\)\. No plan is needed\./)).toBeInTheDocument();
  });

  it('shows the error instead of the help text', () => {
    renderWrapper(<SubscriptionPlanFields value="" onChange={jest.fn()} error="Please select a plan." />);

    expect(screen.getByText('Please select a plan.')).toBeInTheDocument();
  });

  it('reports the picked plan', () => {
    const onChange = jest.fn();
    renderWrapper(<SubscriptionPlanFields value="" onChange={onChange} />);

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'yearly' } });

    expect(onChange).toHaveBeenCalledWith('yearly');
  });
});

describe('subscriptionPlanPayload', () => {
  it('sends the plan only for subscription content with a plan picked', () => {
    expect(subscriptionPlanPayload(true, 'monthly')).toEqual({ subscriptionPlan: 'monthly' });
    expect(subscriptionPlanPayload(true, '')).toEqual({});
    expect(subscriptionPlanPayload(false, 'yearly')).toEqual({});
    expect(subscriptionPlanPayload(undefined, 'yearly')).toEqual({});
  });

  it('sends no plan for a learner with a live subscription', () => {
    expect(subscriptionPlanPayload(true, 'monthly', '2026-12-31T00:00:00Z')).toEqual({});
  });
});

describe('isPlanRequired', () => {
  it('requires a plan only for subscription content, no live subscription and nothing picked', () => {
    expect(isPlanRequired(true, '', null)).toBe(true);
    expect(isPlanRequired(true, 'yearly', null)).toBe(false);
    expect(isPlanRequired(true, '', '2026-12-31T00:00:00Z')).toBe(false);
    expect(isPlanRequired(false, '', null)).toBe(false);
  });
});
