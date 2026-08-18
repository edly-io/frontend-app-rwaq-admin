import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import KpiCard from './KpiCard';

describe('KpiCard', () => {
  it('renders label and value', () => {
    renderWrapper(<KpiCard label="Total Learners" value="1,234" />);
    expect(screen.getByText('Total Learners')).toBeInTheDocument();
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders positive delta with up arrow', () => {
    renderWrapper(<KpiCard label="Registrations" value="50" delta={12.5} />);
    // aria-label carries the text
    const badge = screen.getByLabelText('Increased by 12.5%');
    expect(badge).toBeInTheDocument();
  });

  it('renders negative delta with down arrow', () => {
    renderWrapper(<KpiCard label="Completions" value="30" delta={-5} />);
    const badge = screen.getByLabelText('Decreased by 5.0%');
    expect(badge).toBeInTheDocument();
  });

  it('renders zero delta as neutral', () => {
    renderWrapper(<KpiCard label="Courses" value="10" delta={0} />);
    const badge = screen.getByLabelText('No change');
    expect(badge).toBeInTheDocument();
  });

  it('does not render delta when not provided', () => {
    renderWrapper(<KpiCard label="No Delta" value="5" />);
    expect(screen.queryByLabelText(/Increased|Decreased|No change/i)).not.toBeInTheDocument();
  });

  it('renders loading state with aria-busy', () => {
    renderWrapper(<KpiCard label="Loading KPI" value="—" isLoading />);
    expect(screen.getByLabelText('Loading')).toBeInTheDocument();
    expect(screen.getByLabelText('Loading')).toHaveAttribute('aria-busy', 'true');
  });

  it('renders sparkline slot when provided', () => {
    renderWrapper(
      <KpiCard
        label="Trend"
        value="100"
        sparkline={<div data-testid="sparkline">chart</div>}
      />,
    );
    expect(screen.getByTestId('sparkline')).toBeInTheDocument();
  });
});
