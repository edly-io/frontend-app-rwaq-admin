/**
 * The name to show for something that has an English and an Arabic name.
 *
 * In an Arabic panel the Arabic name wins when it is filled in. Otherwise, and always in
 * English, the English name is shown.
 */
export const localizedName = (
  locale: string,
  english: string | null | undefined,
  arabic: string | null | undefined,
): string => {
  const isArabic = locale.toLowerCase().startsWith('ar');
  return (isArabic && arabic ? arabic : english) || '';
};

export default localizedName;
