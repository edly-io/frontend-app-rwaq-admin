/**
 * Dark/light theme toggle.
 *
 * Persistence, OS `prefers-color-scheme` detection and the no-FOUC gate all
 * stay with @edx/frontend-platform's `AppContext.paragonTheme` — we do not
 * hand-roll those, per IMPLEMENTATION_GUIDELINES.md §4.
 *
 * What we *do* own is the `data-paragon-theme-variant` attribute, and that is a
 * deliberate deviation with a concrete reason: **Paragon ships no dark theme.**
 * `@openedx/paragon/styles/css/themes/` contains `light` only. The Rwaq brand
 * package has a dark stylesheet, but it lives in a private repo whose raw URL
 * 404s in the browser, so it is not configured.
 *
 * With no dark variant registered, `setThemeVariant('dark')` stores the
 * preference and then *removes* the attribute instead of setting it — verified
 * in a browser: localStorage becomes "dark" while the attribute becomes null.
 * Every dark rule in shell.scss is keyed on that attribute, so the entire dark
 * theme silently fails to apply.
 *
 * This app's dark mode is its own `--rwaq-*` token overrides and needs no
 * Paragon dark CSS — only the attribute. So we let Paragon own the state and
 * mirror that state onto the attribute ourselves.
 */
import { useCallback, useContext, useEffect } from 'react';
import { AppContext } from '@edx/frontend-platform/react';

const DARK = 'dark';
const LIGHT = 'light';
const THEME_ATTRIBUTE = 'data-paragon-theme-variant';
const STORAGE_KEY = 'selected-paragon-theme-variant';

export const useThemeVariant = () => {
  const { paragonTheme } = useContext(AppContext) as {
    paragonTheme?: {
      state?: { themeVariant?: string };
      setThemeVariant?: (variant: string) => void;
    };
  };

  // Paragon's state is the source of truth; localStorage is the fallback for
  // the first render, before the provider has settled.
  const storedVariant = typeof window !== 'undefined'
    ? window.localStorage.getItem(STORAGE_KEY)
    : null;
  const variant = paragonTheme?.state?.themeVariant ?? storedVariant ?? LIGHT;
  const isDark = variant === DARK;

  // Mirror the resolved variant onto <html>. Paragon clears the attribute for
  // any variant it has no stylesheet for, which is every variant but light.
  useEffect(() => {
    document.documentElement.setAttribute(THEME_ATTRIBUTE, isDark ? DARK : LIGHT);
  }, [isDark]);

  const toggle = useCallback(() => {
    const next = isDark ? LIGHT : DARK;
    paragonTheme?.setThemeVariant?.(next);
    // Written directly as well, so the toggle works even when the provider
    // declines to record a variant it cannot style.
    window.localStorage.setItem(STORAGE_KEY, next);
    document.documentElement.setAttribute(THEME_ATTRIBUTE, next);
  }, [paragonTheme, isDark]);

  return { isDark, toggle };
};

export default useThemeVariant;
