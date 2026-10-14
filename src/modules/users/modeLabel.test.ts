import type { IntlShape } from '@edx/frontend-platform/i18n';
import modeLabel from './modeLabel';

const intl = {
  formatMessage: ({ defaultMessage }: { defaultMessage: string }) => defaultMessage,
} as unknown as IntlShape;

describe('modeLabel', () => {
  it('names no-id-professional', () => {
    expect(modeLabel(intl, 'no-id-professional')).toBe('Professional, no ID verification');
  });

  it('shows every other mode as its slug', () => {
    expect(modeLabel(intl, 'honor')).toBe('honor');
    expect(modeLabel(intl, 'audit')).toBe('audit');
  });
});
