/**
 * The plan picker: Monthly or Yearly only, empty by default, sent only when picked.
 */
import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import SubscriptionPlanFields, { defaultSubscriptionPlan, subscriptionPlanPayload } from './SubscriptionPlanFields';

describe('SubscriptionPlanFields', () => {
  it('starts with no plan and offers only Monthly and Yearly', () => {
    renderWrapper(<SubscriptionPlanFields value={defaultSubscriptionPlan} onChange={jest.fn()} />);

    expect(screen.getByRole('combobox')).toHaveValue('');
    expect(screen.getAllByRole('option').map((option) => option.getAttribute('value'))).toEqual(['', 'monthly', 'yearly']);
    expect(screen.queryByText('End date')).not.toBeInTheDocument();
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
});
