import React, { useEffect, useMemo } from 'react';

import 'tinymce/tinymce';
import 'tinymce/themes/silver';
// Light skin — always bundled as the base layer.
// @ts-ignore — no TS declarations for CSS side-effect imports in tinymce v5
import 'tinymce/skins/ui/oxide/skin.css';
import 'tinymce/icons/default';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/autoresize';

import { Editor } from '@tinymce/tinymce-react';

// ── Focus-lock fix ─────────────────────────────────────────────────────────────
// react-focus-on (Paragon ModalLayer) stamps data-focus-on-hidden on every
// element outside the modal and injects [data-focus-on-hidden]{pointer-events:none}
// globally via InteractivityDisabler.  TinyMCE's .tox-tinymce-aux is appended
// to <body> (outside the modal), so colour pickers and format dropdowns become
// unclickable.  We override that with a more-specific rule while mounted.
const STYLE_ID = 'rwaq-tinymce-aux-fix';
let auxFixRefCount = 0;

const injectAuxPointerFix = () => {
  auxFixRefCount += 1;
  if (auxFixRefCount > 1) { return; }
  const style = document.createElement('style');
  style.id = STYLE_ID;
  style.textContent = [
    '.tox-tinymce-aux[data-focus-on-hidden]',
    '.tox-tinymce[data-focus-on-hidden]',
  ].join(',') + ' { pointer-events: auto !important; }';
  document.head.appendChild(style);
};

const removeAuxPointerFix = () => {
  auxFixRefCount -= 1;
  if (auxFixRefCount > 0) { return; }
  document.getElementById(STYLE_ID)?.remove();
};

// ── Theme helpers ──────────────────────────────────────────────────────────────

const isDarkTheme = () => (
  document.documentElement.getAttribute('data-paragon-theme-variant') === 'dark'
);


/**
 * Find the nearest scrollable ancestor of an element.
 * TinyMCE sums scrollTop of every ancestor when positioning popups — this
 * finds the container whose scrollTop we need to counteract.
 */
const getScrollParent = (el: HTMLElement): HTMLElement | null => {
  let current = el.parentElement;
  while (current && current !== document.body) {
    const { overflow, overflowY } = getComputedStyle(current);
    if (/auto|scroll/.test(overflow) || /auto|scroll/.test(overflowY)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
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
  /** Applied as aria-label on the iframe so screen readers announce the field name. */
  ariaLabel?: string;
}

const TOOLBAR = [
  'undo redo',
  'formatselect',
  'bold italic underline forecolor backcolor',
  'alignleft aligncenter alignright alignjustify',
  'bullist numlist outdent indent',
].join(' | ');

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value, onChange, editorKey, ariaLabel,
}) => {
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
        // Disable TinyMCE's runtime skin/content-css URL loading: the skin CSS is
        // already bundled via the webpack import at the top of this file, and dark
        // overrides live in shell.scss under html[data-paragon-theme-variant='dark'].
        // Without skin:false TinyMCE appends a <link> to the bundled skin URL which
        // lands after our shell.scss rules and re-applies the light theme on top.
        skin: false,
        content_css: false,
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
            if (ariaLabel) {
              editor.iframeElement.setAttribute('aria-label', ariaLabel);
            }
          }

          // ── Iframe content: direction + initial theme ────────────────────
          const body = editor.getBody();
          body.setAttribute('dir', 'auto');
          syncIframeBody(body);

          // ── Iframe content: keep theme in sync with live Paragon changes ──
          // attributeFilter already limits delivery to data-paragon-theme-variant only.
          const bodyObserver = new MutationObserver(() => syncIframeBody(body));
          bodyObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['data-paragon-theme-variant'] });
          editor.on('remove', () => bodyObserver.disconnect());

          // ── Click-outside: stop .tox-tinymce-aux mouse events bubbling ───
          // Without this, clicking a colour swatch reaches document mousedown
          // which triggers react-focus-on's onClickOutside → closes the modal.
          const auxEl = document.querySelector('.tox-tinymce-aux') as HTMLElement | null;
          auxEl?.addEventListener('mousedown', (e) => e.stopPropagation());

          // ── Popup position: cancel the modal-body scrollTop that TinyMCE adds ──
          // TinyMCE computes popup top = viewportY + sum(ancestor.scrollTop).
          // .tox-tinymce-aux is position:fixed so viewportY is correct, but
          // TinyMCE still adds the modal body's scrollTop, pushing popups down.
          // Applying translateY(-scrollTop) on the aux container cancels it.
          const scrollParent = getScrollParent(editor.getContainer() as HTMLElement);
          if (scrollParent && auxEl) {
            const syncAuxTransform = () => {
              auxEl.style.transform = `translateY(-${scrollParent.scrollTop}px)`;
            };
            scrollParent.addEventListener('scroll', syncAuxTransform, { passive: true });
            editor.on('remove', () => {
              scrollParent.removeEventListener('scroll', syncAuxTransform);
              auxEl.style.transform = '';
            });
          }
        },
      }}
    />
  );
};

export default RichTextEditor;
