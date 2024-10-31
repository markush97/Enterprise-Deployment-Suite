import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import Link from '@tiptap/extension-link';
import { common, createLowlight } from 'lowlight';
import { Bold, Italic, Link as LinkIcon, Code, ListOrdered, List, Heading1, Heading2 } from 'lucide-react';

const lowlight = createLowlight(common);

interface WikiEditorProps {
  content: string;
  onChange: (content: string) => void;
  readOnly?: boolean;
}

export function WikiEditor({ content, onChange, readOnly = false }: WikiEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 hover:text-blue-600 underline',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return null;
  }

  const MenuBar = () => {
    if (readOnly) return null;

    return (
      <div className="border-b border-gray-200 dark:border-gray-700 p-2 flex flex-wrap gap-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
        >
          <Bold className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
        >
          <Italic className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('heading', { level: 1 }) ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
        >
          <Heading1 className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('heading', { level: 2 }) ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
        >
          <Heading2 className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
        >
          <List className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
        >
          <ListOrdered className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('codeBlock') ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
        >
          <Code className="w-5 h-5" />
        </button>
        <button
          onClick={() => {
            const url = window.prompt('Enter URL');
            if (url) {
              editor.chain().focus().setLink({ href: url }).run();
            }
          }}
          className={`p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
            editor.isActive('link') ? 'bg-gray-200 dark:bg-gray-600' : ''
          }`}
        >
          <LinkIcon className="w-5 h-5" />
        </button>
      </div>
    );
  };

  return (
    <div className="border rounded-lg dark:border-gray-700 bg-white dark:bg-gray-800">
      <MenuBar />
      <EditorContent 
        editor={editor} 
        className="prose dark:prose-invert max-w-none p-4 min-h-[200px] focus:outline-none"
      />
    </div>
  );
}