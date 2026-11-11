/**
 * The Codes card on a course or program page: the list fixed to that item, and the Uses link of a row
 * opening the page's Uses tab narrowed to that code.
 */
import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import CodesCard from './CodesCard';

jest.mock('../data/hooks', () => ({
  useEnrollmentCodes: jest.fn(),
  useUpdateEnrollmentCode: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
  useCreateEnrollmentCode: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
  useDeleteEnrollmentCode: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
}));
jest.mock('@src/modules/courses/data/hooks', () => ({ useCourses: jest.fn(() => ({ data: { results: [] } })) }));
jest.mock('@src/modules/programs/data/hooks', () => ({ usePrograms: jest.fn(() => ({ data: { results: [] } })) }));

beforeEach(() => {
  window.history.pushState({}, '', '/courses/x');
  (hooks.useEnrollmentCodes as jest.Mock).mockReturnValue({
    data: {
      results: [{
        id: 4,
        code: 'ABC234',
        item: {
          kind: 'course', id: 'course-v1:A+B+C', name: 'Safety', organization: 'ARB',
        },
        maxUses: 1,
        usesCount: 1,
        expiresAt: null,
        isActive: true,
        status: 'used_up',
        createdBy: 'admin',
        created: '2026-11-01T10:00:00Z',
      }],
      pagination: { count: 1, numPages: 1 },
    },
    isLoading: false,
    isPlaceholderData: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  });
});

describe('CodesCard', () => {
  it('lists the codes of the item, with the title and a Create button', () => {
    renderWrapper(<CodesCard item={{ kind: 'course', id: 'course-v1:A+B+C', name: 'Safety' }} />);
    expect(screen.getByRole('heading', { name: 'Enrollment codes' })).toBeInTheDocument();
    expect(screen.getByText('Learners join this course with one of these codes.')).toBeInTheDocument();
    expect((hooks.useEnrollmentCodes as jest.Mock).mock.calls.at(-1)[0]).toMatchObject({ courseId: 'course-v1:A+B+C' });
    expect(screen.getByRole('button', { name: 'Create code' })).toBeInTheDocument();
  });

  it('says program on a program page', () => {
    renderWrapper(<CodesCard item={{ kind: 'program', id: 'uuid-1', name: 'Leadership' }} />);
    expect(screen.getByText('Learners join this program with one of these codes.')).toBeInTheDocument();
    expect((hooks.useEnrollmentCodes as jest.Mock).mock.calls.at(-1)[0]).toMatchObject({ programUuid: 'uuid-1' });
  });

  it('opens the Uses tab of the Enrollment codes page for a code', () => {
    renderWrapper(<CodesCard item={{ kind: 'course', id: 'course-v1:A+B+C', name: 'Safety' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'View uses' }));
    expect(window.location.pathname + window.location.search).toBe('/enrollment-codes?tab=uses&codeId=4&code=ABC234');
  });
});
