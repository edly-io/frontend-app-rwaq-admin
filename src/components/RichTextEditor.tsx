import React, { useEffect } from 'react';

import 'tinymce/tinymce';
import 'tinymce/themes/silver';
// @ts-ignore — no type declarations for css side-effect imports in tinymce v5
import 'tinymce/skins/ui/oxide/skin.css';
import 'tinymce/icons/default';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/autoresize';

import { Editor } from '@tinymce/tinymce-react';

// react-focus-on (used by Paragon ModalLayer) stamps data-focus-on-hidden on
// every element outside the modal and injects:
//   [data-focus-on-hidden] { pointer-events: none !important }
// via InteractivityDisabler. TinyMCE appends .tox-tinymce-aux to <body>
// (outside the modal), so colour pickers and format dropdowns become
// unclickable. Override that with a higher-specificity rule while this
// component is mounted.
const STYLE_ID = 'rwaq-tinymce-aux-fix';
const injectAuxPointerFix = () => {
  if (document.getElementById(STYLE_ID)) { return; }
  const style = document.createElement('style');
  style.id = STYLE_ID;
  // `.tox.tox-tinymce-aux` beats bare `[data-focus-on-hidden]` in specificity;
  // both need !important to beat InteractivityDisabler's own !important rule.
  // Target both the floating aux container (colour pickers, dropdowns) and the
  // main editor wrapper (toolbar). The modal portal can cause hideOthers() to
  // mark either with data-focus-on-hidden → pointer-events:none, disabling
  // all toolbar buttons including undo/redo.
  style.textContent = [
    '.tox-tinymce-aux[data-focus-on-hidden]',
    '.tox-tinymce[data-focus-on-hidden]',
  ].join(',') + ' { pointer-events: auto !important; }';
  document.head.appendChild(style);
};
const removeAuxPointerFix = () => {
  document.getElementById(STYLE_ID)?.remove();
};

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Pass a key that changes when you need to remount (e.g. when modal opens with new data). */
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
  useEffect(() => {
    injectAuxPointerFix();
    return removeAuxPointerFix;
  }, []);

  return (
    <Editor
    key={editorKey}
    initialValue={value}
    onEditorChange={onChange}
      init={{
        plugins: 'lists autoresize',
        toolbar: TOOLBAR,
        menubar: false,
        branding: false,
        statusbar: false,
        toolbar_mode: 'wrap' as const,
        toolbar_sticky: true,
        toolbar_sticky_offset: 0,
        autoresize_bottom_margin: 50,
        min_height: 250,
        relative_urls: true,
        convert_urls: false,
        init_instance_callback: (editor) => {
          // Mark the iframe so react-focus-lock doesn't re-trap focus away from it.
          if (editor.iframeElement) {
            editor.iframeElement.setAttribute('data-focus-lock-disabled', 'true');
          }
          // Stop mousedown from bubbling to document so react-focus-on's
          // onClickOutside handler doesn't fire when the user clicks inside
          // .tox-tinymce-aux (colour picker, format dropdown, etc.).
          // TinyMCE creates .tox-tinymce-aux during init, so it exists here.
          document.querySelector('.tox-tinymce-aux')
            ?.addEventListener('mousedown', (e) => e.stopPropagation());
        },
      }}
    />
  );
};

export default RichTextEditor;
