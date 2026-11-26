import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as whoami from '@src/data/whoami';
import SideNav from './SideNav';

jest.mock('@src/data/whoami', () => ({ useAdminCapabilities: jest.fn() }));

describe('SideNav', () => {
  it.each([
    ['superuser', true], ['admin', true], ['global_staff', false],
    ['org_admin of one org', true], ['org_admin of two orgs', true], ['learner', false],
  ])('gates navigation for %s', (_role, canAccessAdminPanel) => {
    (whoami.useAdminCapabilities as jest.Mock).mockReturnValue({ data: { canAccessAdminPanel } });
    renderWrapper(<SideNav />);
    expect(screen.queryByRole('link', { name: 'Orders & Payments' }) !== null).toBe(canAccessAdminPanel);
    expect(screen.queryByRole('link', { name: 'Enrollment codes' }) !== null).toBe(canAccessAdminPanel);
  });
});
