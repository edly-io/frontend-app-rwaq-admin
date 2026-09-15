import React from 'react';

import 'tinymce/tinymce';
import 'tinymce/themes/silver';
// @ts-ignore — no type declarations for css side-effect imports in tinymce v5
import 'tinymce/skins/ui/oxide/skin.css';
import 'tinymce/icons/default';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/hr';

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
  'hr removeformat',
].join(' | ');

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, editorKey }) => (
  <Editor
    key={editorKey}
    initialValue={value}
    onEditorChange={onChange}
    init={{
      plugins: 'lists autoresize hr',
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
      // Paragon modals use react-focus-on / react-focus-lock, which re-traps
      // focus whenever it leaves the host document — including into TinyMCE's
      // iframe. Setting data-focus-lock-disabled on the iframe tells
      // react-focus-lock to leave it alone, so typing inside the editor works.
      init_instance_callback: (editor) => {
        if (editor.iframeElement) {
          editor.iframeElement.setAttribute('data-focus-lock-disabled', 'true');
        }
      },
    }}
  />
);

export default RichTextEditor;
