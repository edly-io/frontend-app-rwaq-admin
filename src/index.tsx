import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  mergeConfig,
  APP_INIT_ERROR, APP_READY, subscribe, initialize,
} from '@edx/frontend-platform';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import { ToastProvider } from './components/ToastContext';

import messages from './i18n';
import LoadingPage from './components/LoadingPage';

import './index.scss';

// Lazy-load all modules to keep the initial bundle lean
const AdminShell = lazy(() => import('./components/shell/AdminShell'));
const DashboardPage = lazy(() => import('./modules/dashboard/DashboardPage'));
const OrgListPage = lazy(() => import('./modules/organizations/OrgListPage'));
const OrgDetailPage = lazy(() => import('./modules/organizations/OrgDetailPage'));
const UsersListPage = lazy(() => import('./modules/users/UsersListPage'));
const UserDetailPage = lazy(() => import('./modules/users/UserDetailPage'));
const ProgramListPage = lazy(() => import('./modules/programs/ProgramListPage'));
const ProgramDetailPage = lazy(() => import('./modules/programs/ProgramDetailPage'));
const CoursesListPage = lazy(() => import('./modules/courses/CoursesListPage'));
const CourseDetailPage = lazy(() => import('./modules/courses/CourseDetailPage'));
const CourseReportsPage = lazy(() => import('./modules/courses/CourseReportsPage'));
const ComingSoon = lazy(() => import('./components/ComingSoon'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 60_000, // 1 minute default
    },
  },
});

subscribe(APP_READY, () => {
  const root = createRoot(document.getElementById('root') as HTMLElement);

  root.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        {/* AppProvider already supplies a BrowserRouter (basename from PUBLIC_PATH);
            do NOT add another Router here or React Router throws "Router inside Router". */}
        <AppProvider>
          <ToastProvider>
            <Suspense fallback={<LoadingPage />}>
              <Routes>
                <Route element={<AdminShell />}>
                  {/* Live modules */}
                  <Route index element={<DashboardPage />} />
                  <Route path="organizations" element={<OrgListPage />} />
                  <Route path="organizations/:shortName" element={<OrgDetailPage />} />

                  {/* Users */}
                  <Route path="users" element={<UsersListPage />} />
                  <Route path="users/:id" element={<UserDetailPage />} />

                  {/* Programs */}
                  <Route path="programs" element={<ProgramListPage />} />
                  <Route path="programs/:uuid" element={<ProgramDetailPage />} />

                  {/* Courses */}
                  <Route path="courses" element={<CoursesListPage />} />
                  <Route path="courses/:courseId" element={<CourseDetailPage />} />
                  <Route path="courses/:courseId/reports" element={<CourseReportsPage />} />

                  {/* Placeholders — the nav marks these "Soon". Enrollment is
                      absent by design: it is managed per learner on the user
                      detail page, so a standalone screen would be a second
                      place to look for one feature. */}
                  <Route path="reports" element={<ComingSoon />} />

                  {/* Catch-all */}
                  <Route path="*" element={<ComingSoon />} />
                </Route>
              </Routes>
            </Suspense>
          </ToastProvider>
        </AppProvider>
      </QueryClientProvider>
    </StrictMode>,
  );
});

subscribe(APP_INIT_ERROR, (error) => {
  const root = createRoot(document.getElementById('root') as HTMLElement);

  root.render(
    <StrictMode>
      <ErrorPage message={error.message} />
    </StrictMode>,
  );
});

initialize({
  messages,
  requireAuthenticatedUser: true,
  handlers: {
    config: () => {
      // Declared here so every consumer reads them through getConfig() and a
      // missing value is an explicit null rather than undefined. The runtime
      // MFE_CONFIG supplies these when the corresponding MFE is deployed;
      // ACCOUNT_PROFILE_URL in particular is absent in deployments that don't
      // run the profile MFE, which is why the Profile link pointed nowhere.
      mergeConfig({
        ACCOUNT_PROFILE_URL: process.env.ACCOUNT_PROFILE_URL || null,
        ACCOUNT_SETTINGS_URL: process.env.ACCOUNT_SETTINGS_URL || null,
        LEARNER_DASHBOARD_URL: process.env.LEARNER_DASHBOARD_URL || null,
      }, 'RwaqAdminAppConfig');
    },
  },
});
