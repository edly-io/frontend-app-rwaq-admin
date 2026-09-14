import React from 'react';

import 'tinymce/tinymce';
import 'tinymce/themes/silver';
// @ts-ignore — no type declarations for css side-effect imports in tinymce v5
import 'tinymce/skins/ui/oxide/skin.css';
import 'tinymce/icons/default';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/link';
import 'tinymce/plugins/code';
import 'tinymce/plugins/autoresize';
import 'tinymce/plugins/hr';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/table';

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
  'table charmap hr',
  'removeformat html-source',
].join(' | ');

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, editorKey }) => (
  <Editor
    key={editorKey}
    initialValue={value}
    onEditorChange={onChange}
    init={{
      plugins: 'lists link code autoresize hr charmap table',
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
      block_formats: 'Header 2=h2;Header 3=h3;Paragraph=p;Preformatted=pre',
      setup: (editor) => {
        editor.ui.registry.addButton('html-source', {
          text: 'HTML',
          tooltip: 'Source code',
          onAction: () => editor.execCommand('mceCodeEditor'),
        });
      },
    }}
  />
);

export default RichTextEditor;
