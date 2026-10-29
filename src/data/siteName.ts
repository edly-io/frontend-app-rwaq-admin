import { getConfig } from '@edx/frontend-platform';

/**
 * Platform name for visible text, read from the MFE config (`SITE_NAME`) so the same
 * build says "Rwaq" on Rwaq and the deployment's own name elsewhere. The fallback keeps
 * a sentence readable ("the platform subscription") when the config has no name.
 */
export const getSiteName = (): string => (getConfig().SITE_NAME as string) || 'platform';
