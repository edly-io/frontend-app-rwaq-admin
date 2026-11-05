import { localizedName } from './localizedName';

describe('localizedName', () => {
  it('shows the Arabic name in an Arabic panel when it is filled in', () => {
    expect(localizedName('ar', 'Arbisoft Academy', 'أكاديمية أربيسوفت')).toBe('أكاديمية أربيسوفت');
    expect(localizedName('ar-SA', 'Arbisoft Academy', 'أكاديمية أربيسوفت')).toBe('أكاديمية أربيسوفت');
  });

  it('falls back to the English name when there is no Arabic name', () => {
    expect(localizedName('ar', 'Arbisoft Academy', '')).toBe('Arbisoft Academy');
    expect(localizedName('ar', 'Arbisoft Academy', null)).toBe('Arbisoft Academy');
  });

  it('always shows the English name in English', () => {
    expect(localizedName('en', 'Arbisoft Academy', 'أكاديمية أربيسوفت')).toBe('Arbisoft Academy');
  });

  it('returns an empty string when there is no name at all', () => {
    expect(localizedName('ar', null, undefined)).toBe('');
  });
});
