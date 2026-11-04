/**
 * The panel's language goes out with every API request, so the backend
 * answers its refusals in it. A call that picked its own language keeps it.
 */
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getLocale } from '@edx/frontend-platform/i18n';
import { sendLanguageWithRequests } from './language';

jest.mock('@edx/frontend-platform/auth', () => ({ getAuthenticatedHttpClient: jest.fn() }));
jest.mock('@edx/frontend-platform/i18n', () => ({ getLocale: jest.fn() }));

/** The few AxiosHeaders methods the interceptor uses. */
const makeHeaders = (initial: Record<string, string> = {}) => {
  const store = new Map(Object.entries(initial));
  return {
    has: (name: string) => store.has(name),
    set: (name: string, value: string) => { store.set(name, value); },
    get: (name: string) => store.get(name),
  };
};
type Headers = ReturnType<typeof makeHeaders>;

const registerInterceptor = () => {
  const use = jest.fn();
  (getAuthenticatedHttpClient as jest.Mock).mockReturnValue({ interceptors: { request: { use } } });
  sendLanguageWithRequests();
  return use.mock.calls[0][0] as (config: { headers: Headers }) => { headers: Headers };
};

describe('sendLanguageWithRequests', () => {
  it('adds the panel language to a request', () => {
    (getLocale as jest.Mock).mockReturnValue('ar');
    const intercept = registerInterceptor();

    const config = intercept({ headers: makeHeaders() });

    expect(config.headers.get('Accept-Language')).toBe('ar');
  });

  it('keeps the language a call already chose', () => {
    (getLocale as jest.Mock).mockReturnValue('ar');
    const intercept = registerInterceptor();

    const config = intercept({ headers: makeHeaders({ 'Accept-Language': 'en' }) });

    expect(config.headers.get('Accept-Language')).toBe('en');
  });
});
