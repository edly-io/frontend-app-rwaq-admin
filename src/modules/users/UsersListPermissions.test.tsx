import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import { useAdminCapabilities } from '@src/data/whoami';
import UsersListPage from './UsersListPage';

jest.mock('@src/data/whoami', () => ({ useAdminCapabilities: jest.fn() }));
jest.mock('./data/hooks', () => ({
  useUsers: () => ({
    data: {
      results: [{
        id: 1, name: 'User', roleBadges: [], orgAdminOf: [],
      }],
    },
  }),
}));
jest.mock('@src/components/AdminDataTable', () => function MockTable({ columns, data }: any) {
  return <div>{data.map((row: any) => columns.map((column: any) => column.renderCell?.(row[column.key], row)))}</div>;
});
jest.mock('./components/UserListStatsStrip', () => () => null);
jest.mock('./modals/UserFormModal', () => () => null);
jest.mock('./modals/EditUserModal', () => () => null);

describe.each([['org_admin', false], ['admin', true], ['superuser', true]])('user list permissions for %s', (role, allowed) => {
  it('controls add and edit', () => {
    (useAdminCapabilities as jest.Mock).mockReturnValue({ data: { role } });
    renderWrapper(<UsersListPage />);
    expect(Boolean(screen.queryByRole('button', { name: 'Add user' }))).toBe(allowed);
    expect(Boolean(screen.queryByRole('button', { name: 'Edit User' }))).toBe(allowed);
  });
});
