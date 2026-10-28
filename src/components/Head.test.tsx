import { render } from '@testing-library/react';
import { getConfig, mergeConfig } from '@edx/frontend-platform';
import Head from './Head';

const icons = () => document.head.querySelectorAll('link[rel~="icon"]');

describe('Head', () => {
  const original = getConfig().FAVICON_URL;

  afterEach(() => {
    mergeConfig({ FAVICON_URL: original });
    document.head.querySelectorAll('link').forEach((el) => el.remove());
  });

  it('adds a favicon link from the runtime config', () => {
    mergeConfig({ FAVICON_URL: 'https://example.com/favicon.png' });
    render(<Head />);
    expect(icons()).toHaveLength(1);
    expect((icons()[0] as HTMLLinkElement).href).toBe('https://example.com/favicon.png');
  });

  it('updates the existing link instead of adding a second one', () => {
    const existing = document.createElement('link');
    existing.rel = 'shortcut icon';
    existing.href = 'https://example.com/old.ico';
    document.head.appendChild(existing);
    mergeConfig({ FAVICON_URL: 'https://example.com/favicon.png' });
    render(<Head />);
    expect(icons()).toHaveLength(1);
    expect(existing.href).toBe('https://example.com/favicon.png');
  });

  it('leaves the head alone when FAVICON_URL is not set', () => {
    mergeConfig({ FAVICON_URL: '' });
    render(<Head />);
    expect(icons()).toHaveLength(0);
  });
});
