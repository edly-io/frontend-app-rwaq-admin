/**
 * The name an admin sees for an enrollment mode.
 *
 * Modes are shown as their slugs, which read fine for honor, audit and
 * verified. no-id-professional, offered for paid courses, does not.
 */
import type { IntlShape } from '@edx/frontend-platform/i18n';
import messages from './messages';

const modeLabel = (intl: IntlShape, slug: string): string => (
  slug === 'no-id-professional' ? intl.formatMessage(messages.modeNoIdProfessional) : slug
);

export default modeLabel;
