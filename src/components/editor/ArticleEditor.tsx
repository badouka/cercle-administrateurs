'use client'

import { forwardRef, useImperativeHandle, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import UnderlineExt from '@tiptap/extension-underline'
import LinkExt from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import {
  Bold, Italic, Underline, Heading2, Heading3,
  List, ListOrdered, Quote, Link, Link2Off,
} from 'lucide-react'

export interface ArticleEditorRef {
  getJSON: () => unknown
  isEmpty: () => boolean
}

interface Props {
  initialContent?: string
  placeholder?:    string
}

function Divider() {
  return <span className="w-px h-4 bg-gray-300 mx-0.5" aria-hidden />
}

function ToolBtn({
  onClick, active = false, title, children,
}: {
  onClick: () => void
  active?: boolean
  title:   string
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

export const ArticleEditor = forwardRef<ArticleEditorRef, Props>(
  function ArticleEditor({ initialContent, placeholder = 'Rédigez votre article ici…' }, ref) {
    const [showLinkInput, setShowLinkInput] = useState(false)
    const [linkUrl,       setLinkUrl]       = useState('')

    const editor = useEditor({
      extensions: [
        StarterKit.configure({ code: false, codeBlock: false }),
        UnderlineExt,
        LinkExt.configure({ openOnClick: false, HTMLAttributes: { class: 'underline text-gray-700' } }),
        Placeholder.configure({ placeholder }),
      ],
      content:        initialContent,
      editorProps: {
        attributes: { class: 'tiptap-article focus:outline-none' },
      },
    })

    useImperativeHandle(ref, () => ({
      getJSON: () => editor?.getJSON() ?? null,
      isEmpty: () => editor?.isEmpty ?? true,
    }), [editor])

    if (!editor) return null

    function applyLink() {
      const href = linkUrl.trim()
      if (href) editor!.chain().focus().extendMarkRange('link').setLink({ href }).run()
      setShowLinkInput(false)
      setLinkUrl('')
    }

    return (
      <div className="rounded-lg border border-gray-300 focus-within:border-black focus-within:ring-1 focus-within:ring-black transition-colors">

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 bg-gray-50 rounded-t-lg">
          <ToolBtn onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')} title="Gras (Ctrl+B)">
            <Bold size={14} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')} title="Italique (Ctrl+I)">
            <Italic size={14} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleUnderline().run()}
            active={editor.isActive('underline')} title="Souligné (Ctrl+U)">
            <Underline size={14} />
          </ToolBtn>

          <Divider />

          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })} title="Titre H2">
            <Heading2 size={14} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })} title="Titre H3">
            <Heading3 size={14} />
          </ToolBtn>

          <Divider />

          <ToolBtn onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')} title="Liste à puces">
            <List size={14} />
          </ToolBtn>
          <ToolBtn onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')} title="Liste numérotée">
            <ListOrdered size={14} />
          </ToolBtn>

          <Divider />

          <ToolBtn onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')} title="Citation">
            <Quote size={14} />
          </ToolBtn>

          <Divider />

          {editor.isActive('link') ? (
            <ToolBtn onClick={() => editor.chain().focus().unsetLink().run()} title="Supprimer le lien">
              <Link2Off size={14} />
            </ToolBtn>
          ) : (
            <ToolBtn onClick={() => { setShowLinkInput(s => !s); setLinkUrl('') }} title="Insérer un lien">
              <Link size={14} />
            </ToolBtn>
          )}
        </div>

        {/* ── Link input ── */}
        {showLinkInput && (
          <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-200 bg-gray-50">
            <input
              type="url"
              value={linkUrl}
              onChange={e => setLinkUrl(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); applyLink() } if (e.key === 'Escape') setShowLinkInput(false) }}
              placeholder="https://…"
              autoFocus
              className="flex-1 text-sm border border-gray-300 rounded px-2 py-1 focus:border-black focus:outline-none"
            />
            <button type="button" onClick={applyLink}
              className="text-xs font-semibold px-2.5 py-1 rounded bg-black text-white hover:bg-gray-800">
              OK
            </button>
            <button type="button" onClick={() => setShowLinkInput(false)}
              className="text-xs text-gray-500 hover:text-black px-1">
              Annuler
            </button>
          </div>
        )}

        {/* ── Editor area ── */}
        <EditorContent editor={editor} className="px-4 py-3 min-h-[280px] text-sm" />
      </div>
    )
  },
)
