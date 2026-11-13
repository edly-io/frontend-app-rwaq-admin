/**
 * The create form: code field with Generate and 6 to 8 letter-and-number validation, a scope (course, program or
 * organization) with one required item (only Enrollment code items listed), single or multiple usage, optional
 * expiry, and the backend's refusals on the field they name.
 */
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { renderWrapper } from '@src/setupTest';
import * as courseHooks from '@src/modules/courses/data/hooks';
import * as programHooks from '@src/modules/programs/data/hooks';
import * as orgHooks from '@src/modules/organizations/data/hooks';
import * as hooks from '../data/hooks';
import CreateCodeModal, { generateCode } from './CreateCodeModal';

jest.mock('../data/hooks', () => ({ useCreateEnrollmentCode: jest.fn() }));
jest.mock('@src/modules/courses/data/hooks', () => ({ useCourses: jest.fn() }));
jest.mock('@src/modules/programs/data/hooks', () => ({ usePrograms: jest.fn() }));
jest.mock('@src/modules/organizations/data/hooks', () => ({ useOrgFilterOptions: jest.fn() }));
jest.mock('@edx/frontend-platform/logging', () => ({ logError: jest.fn() }));

const mockCreate = jest.fn();
const onCreated = jest.fn();
const onClose = jest.fn();

const COURSE_KEY = 'course-v1:ARB+SAFE+2026';
const PROGRAM_UUID = 'b6f1c2d3-0000-4000-8000-000000000001';

const renderModal = (props: Partial<React.ComponentProps<typeof CreateCodeModal>> = {}) => renderWrapper(
  <CreateCodeModal isOpen onClose={onClose} onCreated={onCreated} {...props} />,
);

const choose = (value: string) => fireEvent.change(
  screen.getByLabelText(value.startsWith('program:') ? 'Program' : 'Course', { selector: 'select' }),
  { target: { value } },
);
const pickScope = (name: string) => fireEvent.click(screen.getByRole('radio', { name }));
const submit = () => fireEvent.click(screen.getByRole('button', { name: 'Create' }));

beforeEach(() => {
  jest.clearAllMocks();
  mockCreate.mockResolvedValue({ id: 11, code: 'ABC234' });
  (hooks.useCreateEnrollmentCode as jest.Mock).mockReturnValue({ mutateAsync: mockCreate, isPending: false });
  (orgHooks.useOrgFilterOptions as jest.Mock).mockReturnValue([{ value: 'Edrakk', label: 'Edrakk' }, { value: 'ARB', label: 'Arbisoft' }]);
  (courseHooks.useCourses as jest.Mock).mockReturnValue({
    data: { results: [{ courseId: COURSE_KEY, displayName: 'Safety basics' }] },
  });
  (programHooks.usePrograms as jest.Mock).mockReturnValue({
    data: { results: [{ uuid: PROGRAM_UUID, name: 'Leadership program' }] },
  });
});

describe('CreateCodeModal', () => {
  it('offers course, program and organization, and lists only Enrollment code items of the chosen scope', () => {
    renderModal();
    expect((courseHooks.useCourses as jest.Mock).mock.calls.at(-1)[0]).toMatchObject({ courseType: 'enrollment_code' });
    expect((programHooks.usePrograms as jest.Mock).mock.calls.at(-1)[0]).toMatchObject({ pricing: 'enrollment_code' });
    expect(screen.getByRole('radio', { name: 'Course' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Program' })).not.toBeChecked();
    expect(screen.getByRole('radio', { name: 'Organization' })).not.toBeChecked();
    const courses = screen.getByLabelText('Course', { selector: 'select' }) as HTMLSelectElement;
    expect(Array.from(courses.options).map((o) => o.textContent)).toEqual(['Choose…', 'Safety basics']);
    pickScope('Program');
    const programs = screen.getByLabelText('Program', { selector: 'select' }) as HTMLSelectElement;
    expect(Array.from(programs.options).map((o) => o.textContent)).toEqual(['Choose…', 'Leadership program']);
  });

  it('creates an organization code with the organization short name', async () => {
    renderModal();
    pickScope('Organization');
    expect(screen.getByText(
      'The code works for every Enrollment code course and program of this organization, now and later.',
    )).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Organization', { selector: 'select' }), { target: { value: 'Edrakk' } });
    fireEvent.click(screen.getByLabelText(/Multiple Usage/));
    fireEvent.change(screen.getByLabelText('Number of uses'), { target: { value: '100' } });
    submit();
    await waitFor(() => expect(mockCreate).toHaveBeenCalledWith({
      code: undefined, organization: 'Edrakk', maxUses: 100, expiresAt: undefined,
    }));
    expect(mockCreate.mock.calls[0][0]).not.toHaveProperty('courseId');
  });

  it('asks for an organization when none is chosen', async () => {
    renderModal();
    pickScope('Organization');
    submit();
    expect(await screen.findByText('Choose an organization.')).toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('shows an unknown organization on the organization field', async () => {
    mockCreate.mockRejectedValue({
      response: { status: 404, data: { detail: 'This organization was not found.', field: 'organization' } },
    });
    renderModal();
    pickScope('Organization');
    fireEvent.change(screen.getByLabelText('Organization', { selector: 'select' }), { target: { value: 'Edrakk' } });
    submit();
    expect(await screen.findByText('This organization was not found.')).toBeInTheDocument();
  });

  it('creates a single-use code for a course with the code left for the backend to generate', async () => {
    renderModal();
    choose(`course:${COURSE_KEY}`);
    submit();
    await waitFor(() => expect(mockCreate).toHaveBeenCalledWith({
      code: undefined, courseId: COURSE_KEY, maxUses: 1, expiresAt: undefined,
    }));
    expect(onCreated).toHaveBeenCalledWith({ id: 11, code: 'ABC234' });
    expect(onClose).toHaveBeenCalled();
  });

  it('creates a multi-use code for a program with a typed code, uppercased, and an expiry', async () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Code'), { target: { value: 'riyadh26' } });
    expect(screen.getByLabelText('Code')).toHaveValue('RIYADH26');
    pickScope('Program');
    choose(`program:${PROGRAM_UUID}`);
    fireEvent.click(screen.getByLabelText(/Multiple Usage/));
    fireEvent.change(screen.getByLabelText('Number of uses'), { target: { value: '50' } });
    fireEvent.change(screen.getByLabelText('Expires on (optional)'), { target: { value: '2026-12-31' } });
    submit();
    await waitFor(() => expect(mockCreate).toHaveBeenCalledWith({
      code: 'RIYADH26', programUuid: PROGRAM_UUID, maxUses: 50, expiresAt: '2026-12-31',
    }));
  });

  it('sends one use when Multiple Usage is unchecked, even after a number was typed', async () => {
    renderModal();
    fireEvent.click(screen.getByLabelText(/Multiple Usage/));
    fireEvent.change(screen.getByLabelText('Number of uses'), { target: { value: '9' } });
    fireEvent.click(screen.getByLabelText(/Multiple Usage/));
    expect(screen.queryByLabelText('Number of uses')).not.toBeInTheDocument();
    choose(`course:${COURSE_KEY}`);
    submit();
    await waitFor(() => expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ maxUses: 1 })));
  });

  it('fills the field with a 6 character code from the unambiguous alphabet on Generate', () => {
    renderModal();
    fireEvent.click(screen.getByRole('button', { name: 'Generate' }));
    expect((screen.getByLabelText('Code') as HTMLInputElement).value).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{6}$/);
    for (let i = 0; i < 50; i += 1) { expect(generateCode()).not.toMatch(/[01OI]/); }
  });

  it('requires an item and refuses a code that is not 6 to 8 letters and numbers', async () => {
    renderModal();
    fireEvent.change(screen.getByLabelText('Code'), { target: { value: 'AB1' } });
    submit();
    expect(await screen.findByText('Use 6 to 8 letters and numbers, nothing else.')).toBeInTheDocument();
    expect(screen.getByText('Choose a course or a program.')).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Code'), { target: { value: 'AB-123' } });
    submit();
    expect(await screen.findByText('Use 6 to 8 letters and numbers, nothing else.')).toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('refuses a number of uses that is not a whole number of 1 or more', async () => {
    renderModal();
    choose(`course:${COURSE_KEY}`);
    fireEvent.click(screen.getByLabelText(/Multiple Usage/));
    fireEvent.change(screen.getByLabelText('Number of uses'), { target: { value: '0' } });
    submit();
    expect(await screen.findByText('Enter a whole number, 1 or more.')).toBeInTheDocument();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('shows a duplicate code on the Code field', async () => {
    mockCreate.mockRejectedValue({ response: { status: 409, data: { detail: 'This code already exists.', field: 'code' } } });
    renderModal();
    fireEvent.change(screen.getByLabelText('Code'), { target: { value: 'ABC234' } });
    choose(`course:${COURSE_KEY}`);
    submit();
    const message = await screen.findByText('This code already exists.');
    expect(message.closest('.pgn__form-group')).toContainElement(screen.getByLabelText('Code'));
    expect(onCreated).not.toHaveBeenCalled();
  });

  it('shows a backend error with no field above the form', async () => {
    mockCreate.mockRejectedValue({ response: { status: 400, data: { detail: 'This course is not an Enrollment code course.' } } });
    renderModal();
    choose(`course:${COURSE_KEY}`);
    submit();
    expect(await screen.findByText('This course is not an Enrollment code course.')).toBeInTheDocument();
  });

  it('skips the picker when the item is fixed and sends it', async () => {
    renderModal({ fixedItem: { kind: 'program', id: PROGRAM_UUID, name: 'Leadership program' } });
    expect(screen.queryByLabelText('Course', { selector: 'select' })).not.toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: 'Course' })).not.toBeInTheDocument();
    expect(screen.getByText('Leadership program')).toBeInTheDocument();
    expect(screen.getByText('Program')).toBeInTheDocument();
    submit();
    await waitFor(() => expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      programUuid: PROGRAM_UUID, maxUses: 1,
    })));
  });

  it('skips the scope choice when an organization is fixed and sends it', async () => {
    renderModal({ fixedItem: { kind: 'organization', id: 'Edrakk', name: 'Edrakk' } });
    expect(screen.queryByRole('radio', { name: 'Organization' })).not.toBeInTheDocument();
    expect(screen.getByText('Edrakk')).toBeInTheDocument();
    submit();
    await waitFor(() => expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({
      organization: 'Edrakk', maxUses: 1,
    })));
  });

  it('leaves out Type, Quiz, School, Assign to User and Admin only results', () => {
    renderModal();
    ['Type', 'Quiz', 'School', 'Assign to User', 'Admin only results'].forEach((label) => {
      expect(screen.queryByText(label)).not.toBeInTheDocument();
    });
  });
});
