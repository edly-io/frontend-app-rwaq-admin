import React from 'react';

import 'tinymce/tinymce';
import 'tinymce/themes/silver';
// @ts-ignore — no type declarations for css side-effect imports in tinymce v5
import 'tinymce/skins/ui/oxide/skin.css';
import 'tinymce/icons/default';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/autoresize';

import { Editor } from '@tinymce/tinymce-react';

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

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, editorKey }) => (
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
      // Paragon modals use react-focus-on / react-focus-lock. Two elements
      // need data-focus-lock-disabled so they're not intercepted:
      // 1. The TinyMCE iframe — so keyboard input reaches the editor.
      // 2. The .tox-tinymce-aux div (appended to <body>) — TinyMCE renders
      //    toolbar dropdowns and dialogs there, outside the modal DOM, so
      //    react-focus-on closes them on click without this flag.
      init_instance_callback: (editor) => {
        if (editor.iframeElement) {
          editor.iframeElement.setAttribute('data-focus-lock-disabled', 'true');
        }
        const auxEl = document.querySelector('.tox-tinymce-aux');
        if (auxEl) {
          auxEl.setAttribute('data-focus-lock-disabled', 'true');
        }
      },
    }}
  />
);

export default RichTextEditor;
