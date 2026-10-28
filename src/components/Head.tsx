import { useEffect } from 'react';
import { getConfig } from '@edx/frontend-platform';

/**
 * Applies the favicon from the runtime MFE config (FAVICON_URL). The static
 * link in public/index.html only gets the build-time value, which is empty in
 * the deployed build, so the tab fell back to the browser's default icon.
 */
const Head = () => {
  const faviconUrl = getConfig().FAVICON_URL;

  useEffect(() => {
    if (!faviconUrl) { return; }
    let link = document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'shortcut icon';
      link.type = 'image/x-icon';
      document.head.appendChild(link);
    }
    link.href = faviconUrl;
  }, [faviconUrl]);

  return null;
};

export default Head;
