import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import SideNav from './SideNav';

it('shows the navigation when rendered by the authorized shell', () => {
  renderWrapper(<SideNav />);
  expect(screen.getByRole('link', { name: 'Orders & Payments' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Enrollment codes' })).toBeInTheDocument();
});
