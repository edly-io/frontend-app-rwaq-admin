/**
 * SideNav — the panel admits global staff, but Orders & Payments is superuser-only.
 */
import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as whoami from '@src/data/whoami';
import SideNav from './SideNav';

jest.mock('@src/data/whoami', () => ({ useAdminCapabilities: jest.fn() }));

const setCapabilities = (data: { isSuperuser: boolean } | undefined) => {
  (whoami.useAdminCapabilities as jest.Mock).mockReturnValue({ data });
};

describe('SideNav', () => {
  it('shows Orders & Payments to a superuser', () => {
    setCapabilities({ isSuperuser: true });
    renderWrapper(<SideNav />);

    expect(screen.getByRole('link', { name: 'Orders & Payments' })).toHaveAttribute('href', '/payments');
  });

  it('hides Orders & Payments from global staff who are not superusers', () => {
    setCapabilities({ isSuperuser: false });
    renderWrapper(<SideNav />);

    expect(screen.queryByRole('link', { name: 'Orders & Payments' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Courses' })).toBeInTheDocument();
  });

  it('hides Orders & Payments until the capabilities have loaded', () => {
    setCapabilities(undefined);
    renderWrapper(<SideNav />);

    expect(screen.queryByRole('link', { name: 'Orders & Payments' })).not.toBeInTheDocument();
  });
});
