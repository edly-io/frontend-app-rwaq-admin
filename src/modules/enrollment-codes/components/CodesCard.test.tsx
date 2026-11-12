/**
 * The Codes card on a course, program or organization page: the list fixed to that item, the Uses link of a row
 * opening the page's Uses tab narrowed to that code, and the usage panel of a code.
 */
import { fireEvent, screen } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as hooks from '../data/hooks';
import CodesCard from './CodesCard';

jest.mock('../data/hooks', () => ({
  useEnrollmentCodes: jest.fn(),
  useEnrollmentCodeUses: jest.fn(),
  useCodeItems: jest.fn(),
  useUpdateEnrollmentCode: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
  useCreateEnrollmentCode: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
  useDeleteEnrollmentCode: jest.fn(() => ({ mutateAsync: jest.fn(), isPending: false })),
}));
jest.mock('@src/modules/courses/data/hooks', () => ({ useCourses: jest.fn(() => ({ data: { results: [] } })) }));
jest.mock('@src/modules/programs/data/hooks', () => ({ usePrograms: jest.fn(() => ({ data: { results: [] } })) }));
jest.mock('@src/modules/organizations/data/hooks', () => ({ useOrgFilterOptions: jest.fn(() => []) }));

const withUsage = () => {
  (hooks.useCodeItems as jest.Mock).mockReturnValue({
    data: [
      {
        kind: 'course', id: 'course-v1:A+B+C', name: 'Safety', learnersJoined: 1,
      },
      {
        kind: 'program', id: 'uuid-9', name: 'Leadership', learnersJoined: 0,
      },
    ],
    isLoading: false,
    isError: false,
  });
  (hooks.useEnrollmentCodeUses as jest.Mock).mockReturnValue({
    data: { results: [], pagination: { count: 0, numPages: 1 } },
    isLoading: false,
    isPlaceholderData: false,
    isError: false,
    error: null,
    refetch: jest.fn(),
  });
};

beforeEach(() => {
  window.history.pushState({}, '', '/courses/x');
  withUsage();
  (hooks.useEnrollmentCodes as jest.Mock).mockReturnValue({
    data: {
      results: [{
        id: 4,
        code: 'ABC234',
        scope: 'course',
        itemsJoinedCount: 1,
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

  it('describes an organization card and lists its organization codes', () => {
    renderWrapper(<CodesCard item={{ kind: 'organization', id: 'Edrakk', name: 'Edrakk' }} />);
    expect(screen.getByText(
      'An organization code works for every Enrollment code course and program of this organization.',
    )).toBeInTheDocument();
    expect((hooks.useEnrollmentCodes as jest.Mock).mock.calls.at(-1)[0]).toMatchObject({
      kind: 'organization', organization: 'Edrakk',
    });
  });

  it('opens the usage panel with the numbers, the items and the learners of the code', () => {
    withUsage();
    renderWrapper(<CodesCard item={{ kind: 'course', id: 'course-v1:A+B+C', name: 'Safety' }} />);
    fireEvent.click(screen.getByRole('button', { name: 'View usage of ABC234' }));
    expect(screen.getByRole('heading', { name: 'Usage of ABC234' })).toBeInTheDocument();
    const summary = screen.getByTestId('code-usage-summary');
    expect(summary).toHaveTextContent('Used 1 of 1');
    expect(summary).toHaveTextContent('0 left');
    expect(summary).toHaveTextContent('1 item joined');
    expect(hooks.useCodeItems).toHaveBeenLastCalledWith(4);
    expect(screen.getByRole('link', { name: 'Leadership' })).toHaveAttribute('href', '/programs/uuid-9');
    expect(screen.getByRole('heading', { name: 'Learners' })).toBeInTheDocument();
    expect((hooks.useEnrollmentCodeUses as jest.Mock).mock.calls.at(-1)[0]).toMatchObject({ codeId: 4 });
  });
});
