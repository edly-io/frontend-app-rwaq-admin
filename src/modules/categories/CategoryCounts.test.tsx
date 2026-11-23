import {
  fireEvent, render, screen, within,
} from '@testing-library/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import CategoryListPage from './CategoryListPage';
import CategoryDetailPage from './CategoryDetailPage';
import { useCategories, useCategory, useCategoryCourses } from './data/hooks';

jest.mock('./data/hooks', () => ({
  useCategories: jest.fn(),
  useCategory: jest.fn(),
  useCategoryCourses: jest.fn(),
  useUnlinkCourse: () => ({}),
}));
jest.mock('./modals/CategoryFormModal', () => ({ __esModule: true, default: () => null }));
jest.mock('./modals/LinkCourseModal', () => ({ __esModule: true, default: () => null }));
jest.mock('@src/components/CsvDownloadButton', () => ({ __esModule: true, default: () => null }));
jest.mock('@src/components/ToastContext', () => ({ useToast: () => ({ showToast: jest.fn() }) }));
jest.mock('@src/data/utils', () => ({ getApiUrl: (path: string) => path }));

const CATEGORY = {
  id: 1, name: 'Technology', arabicName: '', isActive: true, coursesCount: 2, enrollmentsCount: 12,
};

const renderPage = (path: string) => render(
  <IntlProvider locale="en">
    <MemoryRouter initialEntries={[path]} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        <Route path="/categories" element={<CategoryListPage />} />
        <Route path="/categories/:id" element={<CategoryDetailPage />} />
      </Routes>
    </MemoryRouter>
  </IntlProvider>,
);

it('shows both list counts and requests each ordering from the first page', () => {
  (useCategories as jest.Mock).mockReturnValue({
    data: {
      results: [CATEGORY],
      pagination: { count: 16, numPages: 2 },
    },
  });
  (useCategory as jest.Mock).mockReturnValue({});
  renderPage('/categories?page=2');

  const row = screen.getByRole('row', { name: /Technology/ });
  expect(within(row).getByRole('cell', { name: '2' })).toBeInTheDocument();
  expect(within(row).getByRole('cell', { name: '12' })).toBeInTheDocument();

  for (const [label, field] of [['Courses', 'courses_count'], ['Enrollments', 'enrollments_count']]) {
    fireEvent.click(screen.getByRole('button', { name: label }));
    expect(useCategories).toHaveBeenLastCalledWith(expect.objectContaining({ ordering: field, page: 1 }));
    fireEvent.click(screen.getByRole('button', { name: label }));
    expect(useCategories).toHaveBeenLastCalledWith(expect.objectContaining({ ordering: `-${field}`, page: 1 }));
  }
});

it('shows total enrollments in Overview and each course count in Linked courses', () => {
  (useCategory as jest.Mock).mockReturnValue({ data: { ...CATEGORY, courses: [] } });
  (useCategoryCourses as jest.Mock).mockReturnValue({
    data: {
      results: [
        {
          courseKey: 'course-v1:Org+Course+Run',
          displayName: 'First course',
          org: 'Org',
          run: 'Run',
          enrollmentsCount: 5,
        },
      ],
      pagination: { count: 2 },
    },
  });
  renderPage('/categories/1');

  expect(screen.getByText('12')).toBeInTheDocument();
  expect(screen.getByRole('columnheader', { name: 'Enrollments' })).toBeInTheDocument();
  const row = screen.getByRole('row', { name: /First course/ });
  expect(within(row).getByRole('cell', { name: '5' })).toBeInTheDocument();
});
