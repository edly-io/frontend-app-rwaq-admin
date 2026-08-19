import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProvider, ErrorPage } from '@edx/frontend-platform/react';
import {
  APP_INIT_ERROR, APP_READY, subscribe, initialize,
} from '@edx/frontend-platform';

import messages from './i18n';
import LoadingPage from './components/LoadingPage';

import './index.scss';

// Lazy-load all modules to keep the initial bundle lean
const AdminShell = lazy(() => import('./components/shell/AdminShell'));
const DashboardPage = lazy(() => import('./modules/dashboard/DashboardPage'));
const OrgListPage = lazy(() => import('./modules/organizations/OrgListPage'));
const OrgDetailPage = lazy(() => import('./modules/organizations/OrgDetailPage'));
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
          <Suspense fallback={<LoadingPage />}>
            <Routes>
              <Route element={<AdminShell />}>
                {/* Live modules */}
                <Route index element={<DashboardPage />} />
                <Route path="organizations" element={<OrgListPage />} />
                <Route path="organizations/:shortName" element={<OrgDetailPage />} />

                {/* Coming soon */}
                <Route path="users" element={<ComingSoon />} />
                <Route path="enrollment" element={<ComingSoon />} />
                <Route path="analytics" element={<ComingSoon />} />

                {/* Catch-all */}
                <Route path="*" element={<ComingSoon />} />
              </Route>
            </Routes>
          </Suspense>
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
});
