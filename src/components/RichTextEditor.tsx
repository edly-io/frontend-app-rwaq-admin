import React from 'react';

import 'tinymce/tinymce';
import 'tinymce/themes/silver';
// @ts-ignore — no type declarations for css side-effect imports in tinymce v5
import 'tinymce/skins/ui/oxide/skin.css';
import 'tinymce/icons/default';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/code';
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
  'link unlink blockquote',
  'hr removeformat html-source',
].join(' | ');

// Inline mode renders the editor directly in the DOM (no iframe), which avoids
// Paragon's react-focus-on modal trap blocking keyboard input to the editor.
// fixed_toolbar_container pins the floating toolbar inside the wrapper div so
// it doesn't escape the modal and render behind the backdrop.
const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, editorKey }) => (
  <div className="rwaq-rich-text-editor">
    <div className="rwaq-rich-text-editor__toolbar" />
    <Editor
      key={editorKey}
      initialValue={value}
      inline
      onEditorChange={onChange}
      init={{
        plugins: 'lists link code hr',
        toolbar: TOOLBAR,
        menubar: false,
        branding: false,
        statusbar: false,
        toolbar_mode: 'wrap' as const,
        toolbar_sticky: false,
        fixed_toolbar_container: '.rwaq-rich-text-editor__toolbar',
        relative_urls: true,
        convert_urls: false,
        setup: (editor) => {
          editor.ui.registry.addButton('html-source', {
            text: 'HTML',
            tooltip: 'Source code',
            onAction: () => editor.execCommand('mceCodeEditor'),
          });
        },
      }}
    />
  </div>
);

export default RichTextEditor;
