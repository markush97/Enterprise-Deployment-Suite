import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import { Bold, Italic, Code, List, ListOrdered, Quote } from 'lucide-react';

const lowlight = createLowlight(common);

interface WikiEditorProps {
  initialContent?: string;
  onUpdate?: (content: string) => void;
}

export function WikiEditor({ initialContent = '', onUpdate }: WikiEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      CodeBlockLowlight.configure({
        lowlight,
      }),
    ],
    content: initialContent,
    onUpdate: ({ editor }) => {
      if (onUpdate) {
        onUpdate(editor.getHTML());
      }
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 p-2 flex gap-2">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('bold') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          type="button"
        >
          <Bold className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('italic') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          type="button"
        >
          <Italic className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('codeBlock') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          type="button"
        >
          <Code className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('bulletList') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          type="button"
        >
          <List className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('orderedList') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          type="button"
        >
          <ListOrdered className="w-5 h-5" />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 ${
            editor.isActive('blockquote') ? 'bg-gray-200 dark:bg-gray-700' : ''
          }`}
          type="button"
        >
          <Quote className="w-5 h-5" />
        </button>
      </div>
      <EditorContent 
        editor={editor} 
        className="prose dark:prose-invert max-w-none p-4 min-h-[300px] focus:outline-none"
      />
    </div>
  );
}