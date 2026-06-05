'use client'

import { useState, useRef } from 'react'
import { Save, Globe, CheckCircle2, AlertCircle } from 'lucide-react'
import { ArticleEditor, type ArticleEditorRef } from '@/components/editor/ArticleEditor'
import { tiptapToLexical } from '@/lib/tiptap-to-lexical'
import { updatePageAction } from '../../actions'

interface Props {
  slug:           string
  initialContent: string            // HTML
  initialStatut:  'brouillon' | 'publie'
}

export function PageEditor({ slug, initialContent, initialStatut }: Props) {
  const editorRef                       = useRef<ArticleEditorRef>(null)
  const [statut,   setStatut]           = useState<'brouillon' | 'publie'>(initialStatut)
  const [loading,  setLoading]          = useState(false)
  const [feedback, setFeedback]         = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg]         = useState<string | null>(null)

  async function handleSave() {
    setLoading(true)
    setFeedback('idle')
    setErrorMsg(null)

    try {
      const lexical = tiptapToLexical(editorRef.current!.getJSON())
      const fd      = new FormData()
      fd.append('contenuJson', JSON.stringify(lexical))
      fd.append('statut', statut)

      const result = await updatePageAction(slug, fd)

      if ('error' in result) {
        setFeedback('error')
        setErrorMsg(result.error)
      } else {
        setFeedback('success')
        setTimeout(() => setFeedback('idle'), 4000)
      }
    } catch {
      setFeedback('error')
      setErrorMsg('Une erreur inattendue est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {feedback === 'success' && (
        <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle2 size={16} className="text-green-600 shrink-0" />
          <p className="text-sm text-green-700">Page enregistrée avec succès.</p>
        </div>
      )}

      {feedback === 'error' && errorMsg && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      {/* Contenu */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">Contenu</label>
        <ArticleEditor
          ref={editorRef}
          initialContent={initialContent}
          placeholder="Contenu de la page…"
        />
      </div>

      {/* Footer : statut + save */}
      <div className="flex flex-wrap items-end gap-4 pt-4 border-t border-gray-100">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Statut</label>
          <select
            value={statut}
            onChange={e => setStatut(e.target.value as typeof statut)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          >
            <option value="brouillon">Brouillon</option>
            <option value="publie">Publié</option>
          </select>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={loading}
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            : statut === 'publie' ? <Globe size={15} /> : <Save size={15} />
          }
          {statut === 'publie' ? 'Enregistrer et publier' : 'Enregistrer comme brouillon'}
        </button>
      </div>
    </div>
  )
}
