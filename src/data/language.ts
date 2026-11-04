import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';
import { getLocale } from '@edx/frontend-platform/i18n';

/**
 * Send the panel's language with every API request.
 *
 * The backend writes its refusals (a locked course type, a bad price) in the
 * request's language, so without this header they come back in English even
 * when the panel is in Arabic. A call that sets its own Accept-Language,
 * like the CSV downloads, keeps it.
 */
export const sendLanguageWithRequests = (): void => {
  getAuthenticatedHttpClient().interceptors.request.use((config) => {
    if (!config.headers.has('Accept-Language')) {
      config.headers.set('Accept-Language', getLocale());
    }
    return config;
  });
};
