// ── Dashboard analytics types ────────────────────────────────────────────────
//
// camelCase above the API boundary; api.ts normalizes the snake_case wire
// format. Nullable fields are nullable on purpose and must not be coerced to
// zero — see the note on each one.

/** One month of a time series. Series are zero-filled, so gaps never occur. */
export interface TrendPoint {
  period: string;
  value: number;
}

/** GET /api/v1/admin/analytics/summary/ */
export interface AnalyticsSummary {
  totalLearners: number;
  newRegistrationsThisMonth: number;
  newRegistrationsPreviousMonth: number;
  /** null in a platform's first month — there is no previous figure to compare. */
  newRegistrationsDeltaPct: number | null;
  totalCourses: number;
  runningCourses: number;
  activeEnrollments: number;
  activePrograms: number;
  generatedAt: string;
}

/** GET /api/v1/admin/analytics/trends/ */
export interface AnalyticsTrends {
  months: number;
  enrollments: TrendPoint[];
  /** null when the certificates table isn't reachable from the API host. */
  certificates: TrendPoint[] | null;
  registrations: TrendPoint[];
  legacyRegistrations: TrendPoint[];
  generatedAt: string;
}

/** Mutually exclusive course-run states. There is deliberately no Draft bucket. */
export interface CourseLifecycle {
  noDates: number;
  upcoming: number;
  running: number;
  ended: number;
}

/** Coverage and issuance, kept apart because certificates are optional per course. */
export interface CertificateSplit {
  totalCourses: number;
  coursesWithCertificate: number;
  coveragePct: number | null;
  /** null means certificates were unreadable, not that none were issued. */
  certificatesIssued: number | null;
  enrollmentsInCertificateCourses: number | null;
  issuancePct: number | null;
}

export interface ProgramFunnel {
  totalPrograms: number;
  activePrograms: number;
  enrollments: number;
  completions: number;
  completionPct: number | null;
  avgCoursesPerProgram: number | null;
}

export interface LegacyMigration {
  legacyAccounts: number;
  signedInAtLeastOnce: number;
  progressPct: number | null;
}

export interface EnrollmentMode {
  mode: string;
  count: number;
  sharePct: number | null;
}

export interface OrganizationRow {
  shortName: string;
  name: string;
  courses: number;
  enrollments: number;
  admins: number;
}

export interface TopCourse {
  courseId: string;
  displayName: string;
  enrollments: number;
}

export interface CatalogConcentration {
  totalEnrollments: number;
  topSharePct: number | null;
  courses: TopCourse[];
}

/** GET /api/v1/admin/analytics/breakdowns/ */
export interface AnalyticsBreakdowns {
  courseLifecycle: CourseLifecycle;
  certificates: CertificateSplit;
  programs: ProgramFunnel;
  legacyMigration: LegacyMigration;
  enrollmentModes: EnrollmentMode[];
  organizations: OrganizationRow[];
  catalogConcentration: CatalogConcentration;
  generatedAt: string;
}

/** Shared query params. Every endpoint accepts an optional org scope. */
export interface AnalyticsParams {
  org?: string;
  months?: number;
  /** When true the backend skips its cache and recomputes fresh data. */
  forceRefresh?: boolean;
}
