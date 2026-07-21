'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { Save, CheckCircle2, AlertCircle, ExternalLink } from 'lucide-react'
import { ArticleEditor, type ArticleEditorRef } from '@/components/editor/ArticleEditor'
import { tiptapToLexical } from '@/lib/tiptap-to-lexical'
import { updatePageAction } from '../../actions'

interface Props {
  slug:              string
  publicPath:        string
  initialTitre:      string
  initialDescription: string
  initialExtrait:    string
  initialCitation:   string
  initialContent:    string            // HTML
  initialStatut:     'brouillon' | 'publie'
}

const labelCls = 'block text-xs font-bold uppercase tracking-wider text-[#C8A24A] mb-1.5'
const inputCls =
  'border border-[#14110B]/20 rounded-lg px-4 py-3 w-full focus:border-[#C8A24A] focus:outline-none text-sm'

export function PageEditor({
  slug,
  publicPath,
  initialTitre,
  initialDescription,
  initialExtrait,
  initialCitation,
  initialContent,
  initialStatut,
}: Props) {
  const editorRef = useRef<ArticleEditorRef>(null)

  const [titre,       setTitre]       = useState(initialTitre)
  const [description, setDescription] = useState(initialDescription)
  const [extrait,     setExtrait]     = useState(initialExtrait)
  const [citation,    setCitation]    = useState(initialCitation)
  const [statut,      setStatut]      = useState<'brouillon' | 'publie'>(initialStatut)
  const [loading,     setLoading]     = useState(false)
  const [feedback,    setFeedback]    = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMsg,    setErrorMsg]    = useState<string | null>(null)

  const isMotPresident = slug === 'mot-du-president'

  async function handleSave() {
    if (!titre.trim()) {
      setFeedback('error')
      setErrorMsg('Le titre est requis.')
      return
    }

    setLoading(true)
    setFeedback('idle')
    setErrorMsg(null)

    try {
      const lexical = tiptapToLexical(editorRef.current!.getJSON())
      const fd      = new FormData()
      fd.append('titre',       titre.trim())
      fd.append('description', description)
      fd.append('extrait',     extrait)
      if (isMotPresident) fd.append('citation', citation)
      fd.append('contenuJson', JSON.stringify(lexical))
      fd.append('statut',      statut)

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
    <div>

      {feedback === 'success' && (
        <div className="mb-6 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle2 size={16} className="text-green-600 shrink-0" />
          <p className="text-sm text-green-700">Page enregistrée avec succès.</p>
        </div>
      )}

      {feedback === 'error' && errorMsg && (
        <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{errorMsg}</p>
        </div>
      )}

      {/* Informations générales */}
      <div className="space-y-5">
        <div>
          <label className={labelCls}>Titre</label>
          <input
            type="text"
            value={titre}
            onChange={e => setTitre(e.target.value)}
            placeholder="Titre de la page"
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>Description</label>
          <textarea
            rows={2}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Sous-titre ou résumé court"
            className={`${inputCls} resize-none`}
          />
        </div>

        <div>
          <label className={labelCls}>Extrait</label>
          <textarea
            rows={3}
            value={extrait}
            onChange={e => setExtrait(e.target.value)}
            placeholder="Texte d'introduction affiché en tête de page"
            className={`${inputCls} resize-none`}
          />
        </div>
      </div>

      {/* Citation — uniquement pour le Mot du Président */}
      {isMotPresident && (
        <div className="border-t border-[#14110B]/10 py-6">
          <label className={labelCls}>Citation</label>
          <textarea
            rows={3}
            value={citation}
            onChange={e => setCitation(e.target.value)}
            placeholder="Citation mise en avant du Président"
            className={`${inputCls} resize-none`}
          />
        </div>
      )}

      {/* Contenu principal */}
      <div className="border-t border-[#14110B]/10 py-6">
        <label className={labelCls}>Contenu</label>
        <ArticleEditor
          ref={editorRef}
          initialContent={initialContent}
          placeholder="Contenu de la page…"
        />
      </div>

      {/* Statut + actions */}
      <div className="border-t border-[#14110B]/10 py-6">
        <div className="mb-5">
          <label className={labelCls}>Statut</label>
          <select
            value={statut}
            onChange={e => setStatut(e.target.value as typeof statut)}
            className={inputCls}
          >
            <option value="brouillon">Brouillon</option>
            <option value="publie">Publié</option>
          </select>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-[#1a7a3a] px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#C8A24A] hover:text-[#14110B] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              : <Save size={15} />
            }
            Enregistrer les modifications
          </button>

          <Link
            href={publicPath}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#1a7a3a] hover:text-[#C8A24A] transition-colors"
          >
            <ExternalLink size={14} /> Voir la page →
          </Link>
        </div>
      </div>
    </div>
  )
}
