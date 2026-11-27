import { screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import { useAdminCapabilities } from '@src/data/whoami';
import CategoryListPage from './CategoryListPage';
import CategoryDetailPage from './CategoryDetailPage';

jest.mock('@src/data/whoami', () => ({ useAdminCapabilities: jest.fn() }));
jest.mock('./data/hooks', () => ({
  useCategories: () => ({ data: { results: [{ id: 1, name: 'Category', isActive: true }] } }),
  useCategory: () => ({ data: { id: 1, name: 'Category', isActive: true } }),
  useCategoryCourses: () => ({ data: { results: [] } }),
  useUnlinkCourse: () => ({}),
}));
jest.mock('@src/components/AdminDataTable', () => function MockTable({ columns, data }: any) {
  return <div>{data.map((row: any) => columns.map((column: any) => column.renderCell?.(row[column.key], row)))}</div>;
});
jest.mock('./modals/CategoryFormModal', () => () => null);
jest.mock('./modals/LinkCourseModal', () => () => null);
jest.mock('@src/components/ToastContext', () => ({ useToast: () => ({ showToast: jest.fn() }) }));

describe.each([['org_admin', false], ['admin', true], ['superuser', true]])('category permissions for %s', (role, allowed) => {
  beforeEach(() => { (useAdminCapabilities as jest.Mock).mockReturnValue({ data: { role } }); });
  it('controls add and list edit', () => {
    renderWrapper(<CategoryListPage />);
    expect(Boolean(screen.queryByRole('button', { name: 'Add category' }))).toBe(allowed);
    expect(Boolean(screen.queryByRole('button', { name: 'Edit Category' }))).toBe(allowed);
  });
  it('controls detail edit', () => {
    renderWrapper(<CategoryDetailPage />);
    expect(Boolean(screen.queryByRole('button', { name: 'Edit category' }))).toBe(allowed);
  });
});
