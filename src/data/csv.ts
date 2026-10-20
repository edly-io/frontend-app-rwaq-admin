import { snakeCaseObject } from '@edx/frontend-platform';
import { getAuthenticatedHttpClient } from '@edx/frontend-platform/auth';

/** The filename the backend sent, or null when the header isn't readable (CORS). */
const filenameFrom = (disposition: string | undefined): string | null => {
  const match = disposition?.match(/filename="?([^";]+)"?/);
  return match ? match[1] : null;
};

/** "2026-10-12_10-15-30" in UTC, the same stamp the backend puts in the file name. */
const fileStamp = () => new Date()
  .toISOString()
  .slice(0, 19)
  .replace('T', '_')
  .replace(/:/g, '-');

/**
 * GET a list's csv/ endpoint with the list's filters, minus paging.
 *
 * A plain <a href> won't work — the JWT won't be sent. The authenticated
 * client fetches a blob, and the caller triggers the download from it.
 * With a *language* the file's titles and headers come in it, not in the browser's language.
 */
export const downloadCsv = async (
  url: string,
  params: Record<string, unknown>,
  fallbackName: string,
  language?: string,
): Promise<{ blob: Blob; filename: string }> => {
  const { page, pageSize, ...filters } = params;
  const response = await getAuthenticatedHttpClient().get(url, {
    params: snakeCaseObject(
      Object.fromEntries(Object.entries(filters).filter(([, value]) => value !== undefined && value !== '')),
    ),
    responseType: 'blob',
    ...(language ? { headers: { 'Accept-Language': language } } : {}),
  });
  return {
    blob: response.data as Blob,
    // The browser may not be allowed to read the header (CORS), so the name is also built here.
    filename: filenameFrom(response.headers?.['content-disposition']) ?? `${fallbackName}_${fileStamp()}.csv`,
  };
};
