/**
 * The figures of the user strip that come from the enrollments list.
 */
import type { UserEnrollment } from './data/types';
import {
  enrollmentsByMonth, enrollmentTiles, modeCounts, overallCompletion,
} from './enrollmentStats';

const row = (overrides: Partial<UserEnrollment>): UserEnrollment => ({
  courseId: 'course-v1:Org+C1+2026',
  courseName: 'Course',
  enrolledAt: '2026-10-05T00:00:00Z',
  mode: 'honor',
  isActive: true,
  certificateStatus: 'notpassing',
  availableModes: ['honor'],
  lastChangeReason: null,
  lastChangeBy: null,
  lastChangeAt: null,
  status: 'in_progress',
  ...overrides,
});

describe('enrollmentTiles', () => {
  it('counts active and total, certificates, passed and in progress', () => {
    const tiles = enrollmentTiles([
      row({ status: 'passed', certificateStatus: 'downloadable' }),
      row({ courseId: 'b', status: 'in_progress' }),
      row({ courseId: 'c', isActive: false, status: 'passed' }),
    ]);

    expect(tiles).toEqual({
      active: 2, total: 3, certificates: 1, passed: 1, inProgress: 1,
    });
  });

  it('gives null, never 0, when the certificates app cannot be read', () => {
    expect(enrollmentTiles([row({ certificateStatus: null })]).certificates).toBeNull();
  });

  it('gives null when the status of an active course could not be read', () => {
    const tiles = enrollmentTiles([row({ status: null }), row({ courseId: 'b', status: 'passed' })]);

    expect(tiles.passed).toBeNull();
    expect(tiles.inProgress).toBeNull();
  });

  it('counts zero for a user with no enrollments', () => {
    expect(enrollmentTiles([])).toEqual({
      active: 0, total: 0, certificates: 0, passed: 0, inProgress: 0,
    });
  });
});

describe('overallCompletion', () => {
  it('averages the progress of the active courses and skips the ones without a figure', () => {
    const rows = [row({}), row({ courseId: 'b' }), row({ courseId: 'c' }), row({ courseId: 'd', isActive: false })];
    const progress = [
      { courseId: 'course-v1:Org+C1+2026', progressPercent: 40 },
      { courseId: 'b', progressPercent: 61 },
      { courseId: 'c', progressPercent: null },
      { courseId: 'd', progressPercent: 100 },
    ];

    expect(overallCompletion(rows, progress)).toBe(51);
  });

  it('is null before the progress arrives or when no course has a figure', () => {
    expect(overallCompletion([row({})], undefined)).toBeNull();
    expect(overallCompletion([row({})], [{ courseId: 'course-v1:Org+C1+2026', progressPercent: null }])).toBeNull();
  });
});

describe('modeCounts', () => {
  it('counts the active enrollments per mode, biggest first', () => {
    const counts = modeCounts([
      row({ mode: 'verified' }), row({ courseId: 'b' }), row({ courseId: 'c' }), row({ courseId: 'd', isActive: false }),
    ]);

    expect(counts).toEqual([{ mode: 'honor', count: 2 }, { mode: 'verified', count: 1 }]);
  });
});

describe('enrollmentsByMonth', () => {
  it('fills the last months with zero and counts by month of enrollment', () => {
    const series = enrollmentsByMonth(
      [row({ enrolledAt: '2026-10-05T00:00:00Z' }), row({ enrolledAt: '2026-10-20T00:00:00Z' })],
      new Date('2026-11-11T00:00:00Z'),
      3,
    );

    expect(series).toEqual([
      { period: '2026-09', value: 0 },
      { period: '2026-10', value: 2 },
      { period: '2026-11', value: 0 },
    ]);
  });
});
