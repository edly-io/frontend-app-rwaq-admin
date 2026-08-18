import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import ComingSoon from './ComingSoon';

describe('ComingSoon', () => {
  it('renders heading text', () => {
    renderWrapper(<ComingSoon />);
    expect(screen.getByRole('heading', { name: 'Coming Soon' })).toBeInTheDocument();
  });

  it('renders the body message', () => {
    renderWrapper(<ComingSoon />);
    expect(
      screen.getByText(/This section is under development/i),
    ).toBeInTheDocument();
  });
});
