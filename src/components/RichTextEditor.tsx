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

import { Editor } from '@tinymce/tinymce-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  /** Pass a key that changes when you need to remount (e.g. when modal opens with new data). */
  editorKey?: string | number;
}

const INIT_CONFIG = {
  plugins: 'lists link code autoresize hr',
  toolbar:
    'undo redo | formatselect | bold italic underline | '
    + 'alignleft aligncenter alignright | bullist numlist | '
    + 'link | hr | removeformat | code',
  menubar: false,
  branding: false,
  statusbar: false,
  toolbar_mode: 'wrap' as const,
  toolbar_sticky: true,
  min_height: 250,
  autoresize_bottom_margin: 50,
  relative_urls: true,
  convert_urls: false,
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, editorKey }) => (
  <Editor
    key={editorKey}
    initialValue={value}
    init={INIT_CONFIG}
    onEditorChange={onChange}
  />
);

export default RichTextEditor;
