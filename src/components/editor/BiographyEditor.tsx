'use client'

import { forwardRef, useImperativeHandle } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List } from 'lucide-react'
import type { Membre } from '@/payload-types'

export interface BiographyEditorRef {
  getHTML:  () => string
  isEmpty:  () => boolean
}

interface Props {
  // Accepte une chaîne HTML (legacy) ou l'objet Lexical du champ biographie.
  initialContent?: string | Membre['biographie']
  placeholder?:    string
}

function ToolBtn({
  onClick, active = false, title, children,
}: {
  onClick:  () => void
  active?:  boolean
  title:    string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-1.5 rounded transition-colors ${
        active
          ? 'bg-black text-white'
          : 'text-gray-500 hover:bg-gray-100 hover:text-black'
      }`}
    >
      {children}
    </button>
  )
}

export const BiographyEditor = forwardRef<BiographyEditorRef, Props>(
  function BiographyEditor({ initialContent, placeholder = 'Parlez de vous…' }, ref) {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          heading:   false,
          blockquote: false,
          code:      false,
          codeBlock: false,
          horizontalRule: false,
        }),
        Placeholder.configure({ placeholder }),
      ],
      content: initialContent,
      editorProps: {
        attributes: { class: 'tiptap-bio focus:outline-none' },
      },
    })

    useImperativeHandle(ref, () => ({
      getHTML:  () => editor?.getHTML() ?? '',
      isEmpty:  () => editor?.isEmpty ?? true,
    }), [editor])

    if (!editor) return null

    return (
      <div className="rounded-lg border border-gray-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-colors">
        <div className="flex items-center gap-0.5 px-2 py-1 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')} title="Gras">
            <Bold size={13} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')} title="Italique">
            <Italic size={13} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')} title="Liste">
            <List size={13} />
          </ToolBtn>
        </div>
        <EditorContent editor={editor} className="px-3 py-2.5 min-h-[80px] text-sm" />
      </div>
    )
  },
)
