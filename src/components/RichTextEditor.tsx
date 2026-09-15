import React, { useEffect, useMemo } from 'react';

import 'tinymce/tinymce';
import 'tinymce/themes/silver';
// Light skin — always bundled as the base layer.
// @ts-ignore — no TS declarations for CSS side-effect imports in tinymce v5
import 'tinymce/skins/ui/oxide/skin.css';
import 'tinymce/icons/default';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/autoresize';

// Dark skin — imported via style-loader's lazy-style mechanism so it can be
// injected/removed at runtime.  The '!!' prefix bypasses all configured loaders
// so webpack uses only the explicitly named ones; style-loader's lazyStyleTag
// mode exposes .use() / .unuse() for on-demand injection.
// @ts-ignore — no TS declarations for inline webpack loader imports
import oxideDarkSkin from '!!style-loader?{"injectType":"lazyStyleTag"}!css-loader!tinymce/skins/ui/oxide-dark/skin.css';

import { Editor } from '@tinymce/tinymce-react';

// ── Focus-lock fix ─────────────────────────────────────────────────────────────
// react-focus-on (Paragon ModalLayer) stamps data-focus-on-hidden on every
// element outside the modal and injects [data-focus-on-hidden]{pointer-events:none}
// globally via InteractivityDisabler.  TinyMCE's .tox-tinymce-aux is appended
// to <body> (outside the modal), so colour pickers and format dropdowns become
// unclickable.  We override that with a more-specific rule while mounted.
const STYLE_ID = 'rwaq-tinymce-aux-fix';

const injectAuxPointerFix = () => {
  if (document.getElementById(STYLE_ID)) { return; }
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = [
    '.tox-tinymce-aux[data-focus-on-hidden]',
    '.tox-tinymce[data-focus-on-hidden]',
  ].join(',') + ' { pointer-events: auto !important; }';
  document.head.appendChild(style);
};

const removeAuxPointerFix = () => { document.getElementById(STYLE_ID)?.remove(); };

// ── Theme helpers ──────────────────────────────────────────────────────────────

const isDarkTheme = () => (
  document.documentElement.getAttribute('data-paragon-theme-variant') === 'dark'
);

/** Apply or remove the oxide-dark skin based on the current Paragon theme. */
const syncEditorSkin = () => {
  if (isDarkTheme()) {
    try { (oxideDarkSkin as { use: () => void }).use(); } catch { /* already used */ }
  } else {
    try { (oxideDarkSkin as { unuse: () => void }).unuse(); } catch { /* already unused */ }
  }
};

/** Set iframe body colours to match the active theme. */
const syncIframeBody = (body: HTMLElement) => {
  if (isDarkTheme()) {
    body.style.backgroundColor = '#1e2126';
    body.style.color = '#dee1e6';
  } else {
    body.style.backgroundColor = '';
    body.style.color = '';
  }
};

// ── Component ──────────────────────────────────────────────────────────────────

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Change this key to remount the editor (e.g. when the modal opens with new data). */
  editorKey?: string | number;
}

const TOOLBAR = [
  'undo redo',
  'formatselect',
  'bold italic underline forecolor backcolor',
  'alignleft aligncenter alignright alignjustify',
  'bullist numlist outdent indent',
].join(' | ');

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, editorKey }) => {
  // ── Skin: inject oxide-dark when dark mode is active, remove otherwise ──────
  useEffect(() => {
    syncEditorSkin();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((m) => {
        if (m.attributeName === 'data-paragon-theme-variant') {
          syncEditorSkin();
        }
      });
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-paragon-theme-variant'] });

    return () => {
      observer.disconnect();
      // Unload the dark skin when the editor unmounts so it doesn't bleed into
      // other parts of the page.
      try { (oxideDarkSkin as { unuse: () => void }).unuse(); } catch { /* noop */ }
    };
  }, []);

  // ── Focus-lock: restore pointer-events on the aux container ─────────────────
  useEffect(() => {
    injectAuxPointerFix();
    return removeAuxPointerFix;
  }, []);

  // Freeze the initial value at mount / key change.  @tinymce/tinymce-react v6
  // calls editor.undoManager.clear() whenever initialValue changes — passing
  // the live Formik value wipes the undo stack on every keystroke.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stableInitialValue = useMemo(() => value, [editorKey]);

  return (
    <Editor
      key={editorKey}
      initialValue={stableInitialValue}
      onEditorChange={onChange}
      init={{
        plugins: 'lists autoresize',
        toolbar: TOOLBAR,
        menubar: false,
        branding: false,
        statusbar: false,
        toolbar_mode: 'wrap' as const,
        autoresize_bottom_margin: 50,
        min_height: 250,
        relative_urls: true,
        convert_urls: false,
        init_instance_callback: (editor) => {
          // ── Focus lock: tell react-focus-lock to ignore TinyMCE's iframe ───
          if (editor.iframeElement) {
            editor.iframeElement.setAttribute('data-focus-lock-disabled', 'true');
          }

          // ── Iframe content: direction + initial theme ────────────────────
          const body = editor.getBody();
          body.setAttribute('dir', 'auto');
          syncIframeBody(body);

          // ── Iframe content: keep theme in sync with live Paragon changes ──
          const bodyObserver = new MutationObserver((mutations) => {
            mutations.forEach((m) => {
              if (m.attributeName === 'data-paragon-theme-variant') {
                syncIframeBody(body);
              }
            });
          });
          bodyObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-paragon-theme-variant'] });
          editor.on('remove', () => bodyObserver.disconnect());

          // ── Click-outside: stop .tox-tinymce-aux mouse events bubbling ───
          // Without this, clicking a colour swatch reaches document mousedown
          // which triggers react-focus-on's onClickOutside → closes the modal.
          document.querySelector('.tox-tinymce-aux')
            ?.addEventListener('mousedown', (e) => e.stopPropagation());
        },
      }}
    />
  );
};

export default RichTextEditor;
