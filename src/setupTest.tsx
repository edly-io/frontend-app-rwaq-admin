/* eslint-disable import/no-extraneous-dependencies */
import '@testing-library/jest-dom';
import { ReactNode } from 'react';
import { render } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { AppContext } from '@edx/frontend-platform/react';
import { IntlProvider } from '@edx/frontend-platform/i18n';

const mockAppContext = {
  authenticatedUser: {
    username: 'testuser',
    email: 'testuser@example.com',
  },
  config: {
    ...process.env,
  },
};

interface WrapperProps {
  children: ReactNode;
}

export const renderWrapper = (ui, options = {}) => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const Wrapper = ({ children }: WrapperProps) => (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppContext.Provider value={mockAppContext}>
          <IntlProvider locale="en">{children}</IntlProvider>
        </AppContext.Provider>
      </BrowserRouter>
    </QueryClientProvider>
  );

  return render(ui, { wrapper: Wrapper, ...options });
};

class ResizeObserver {
  observe() { }

  unobserve() { }

  disconnect() { }
}

global.ResizeObserver = ResizeObserver;
