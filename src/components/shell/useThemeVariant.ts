/**
 * Dark/light theme toggle — mirrors tutor-indigo's AddDarkTheme mechanism so the
 * Admin Panel switches themes the same way the other Rwaq MFEs (e.g. learner-dashboard)
 * do: persist the choice in localStorage under `selected-paragon-theme-variant` and
 * set `data-paragon-theme-variant` on <html>, which Paragon uses to swap the
 * light/dark theme CSS variants.
 */
import { useCallback, useEffect, useState } from 'react';

const THEME_KEY = 'selected-paragon-theme-variant';
const DARK = 'dark';
const LIGHT = 'light';

const applyVariant = (variant: string) => {
  document.documentElement.setAttribute('data-paragon-theme-variant', variant);
};

export const useThemeVariant = () => {
  const [variant, setVariant] = useState<string>(
    () => window.localStorage.getItem(THEME_KEY) || LIGHT,
  );

  // Apply on mount and whenever it changes.
  useEffect(() => {
    applyVariant(variant);
  }, [variant]);

  const toggle = useCallback(() => {
    setVariant((prev) => {
      const next = prev === DARK ? LIGHT : DARK;
      window.localStorage.setItem(THEME_KEY, next);
      return next;
    });
  }, []);

  return { isDark: variant === DARK, toggle };
};

export default useThemeVariant;
