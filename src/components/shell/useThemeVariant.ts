/**
 * Dark/light theme toggle — delegates to @edx/frontend-platform's AppProvider theme
 * machinery via `AppContext.paragonTheme`, rather than hand-rolling the DOM attribute
 * and localStorage.
 *
 * AppProvider already: loads the Paragon theme CSS, gates render on `isThemeLoaded`
 * (no FOUC), detects OS `prefers-color-scheme`, persists the choice to
 * localStorage['selected-paragon-theme-variant'], and sets `data-paragon-theme-variant`
 * on <html> (the attribute all light/dark CSS keys off). We only read the current
 * variant and call `setThemeVariant`. Per IMPLEMENTATION_GUIDELINES.md §4.
 */
import { useCallback, useContext } from 'react';
import { AppContext } from '@edx/frontend-platform/react';

const DARK = 'dark';
const LIGHT = 'light';

export const useThemeVariant = () => {
  const { paragonTheme } = useContext(AppContext) as {
    paragonTheme?: {
      state?: { themeVariant?: string };
      setThemeVariant?: (variant: string) => void;
    };
  };

  const isDark = paragonTheme?.state?.themeVariant === DARK;

  const toggle = useCallback(() => {
    paragonTheme?.setThemeVariant?.(isDark ? LIGHT : DARK);
  }, [paragonTheme, isDark]);

  return { isDark, toggle };
};

export default useThemeVariant;
