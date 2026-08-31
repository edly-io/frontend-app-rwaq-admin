import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import StatTile from './StatTile';

describe('StatTile', () => {
  it('renders label and value', () => {
    renderWrapper(<StatTile label="Program completion" value="72%" />);
    expect(screen.getByText('Program completion')).toBeInTheDocument();
    expect(screen.getByText('72%')).toBeInTheDocument();
  });

  it('renders "Not available" when value is null', () => {
    renderWrapper(<StatTile label="Certificate coverage" value={null} />);
    expect(screen.getByText('Not available')).toBeInTheDocument();
  });

  it('renders hint when value is present', () => {
    renderWrapper(
      <StatTile label="Legacy migration" value="45%" hint="100 of 222 accounts signed in" />,
    );
    expect(screen.getByText('100 of 222 accounts signed in')).toBeInTheDocument();
  });

  it('renders unavailableHint instead of hint when value is null', () => {
    renderWrapper(
      <StatTile
        label="Issuance rate"
        value={null}
        hint="Normal hint"
        unavailableHint="Certificate data unreadable"
      />,
    );
    expect(screen.queryByText('Normal hint')).not.toBeInTheDocument();
    expect(screen.getByText('Certificate data unreadable')).toBeInTheDocument();
  });

  it('renders the badge text when badge prop is provided', () => {
    renderWrapper(
      <StatTile label="Program completion" value="72%" badge="All time" />,
    );
    expect(screen.getByText('All time')).toBeInTheDocument();
  });

  it('does not render a badge element when badge prop is absent', () => {
    renderWrapper(<StatTile label="Program completion" value="72%" />);
    // "All time" should not appear
    expect(screen.queryByText('All time')).not.toBeInTheDocument();
  });
});
