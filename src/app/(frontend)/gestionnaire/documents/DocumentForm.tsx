'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Save, AlertCircle, FileText } from 'lucide-react'
import { updateDocumentAction, uploadMedia } from '../actions'

export interface DocumentFormInitial {
  titre:        string
  categorie:    string
  acces:        'public' | 'membres'
  description?: string
  fichierId?:   number
  fichierName?: string
}

interface Props {
  documentId:     number
  initialValues?: Partial<DocumentFormInitial>
}

const CATEGORIES = [
  { value: 'textes_statutaires',        label: 'Textes statutaires' },
  { value: 'textes_reglementaires',     label: 'Textes réglementaires' },
  { value: 'pv_reunion',                label: 'PV de réunion' },
  { value: 'ressources',                label: 'Ressources' },
  { value: 'magazines',                 label: 'Magazines' },
  { value: 'docs_politique_economique', label: 'Docs politique économique' },
]

export function DocumentForm({ documentId, initialValues }: Props) {
  const router = useRouter()

  const [titre,       setTitre]       = useState(initialValues?.titre ?? '')
  const [categorie,   setCategorie]   = useState(initialValues?.categorie ?? 'ressources')
  const [acces,       setAcces]       = useState<'public' | 'membres'>(initialValues?.acces ?? 'public')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [file,        setFile]        = useState<File | null>(null)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  async function handleSubmit() {
    if (!titre.trim()) { setError('Le titre est requis.'); return }

    setError(null)
    setLoading(true)

    try {
      let fichierId = initialValues?.fichierId
      if (file) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('alt', titre.trim())
        const uploadResult = await uploadMedia(fd)
        if ('error' in uploadResult) { setError(uploadResult.error); setLoading(false); return }
        fichierId = uploadResult.id
      }

      const fd = new FormData()
      fd.append('titre',       titre.trim())
      fd.append('categorie',   categorie)
      fd.append('acces',       acces)
      fd.append('description', description)
      if (fichierId) fd.append('fichierId', String(fichierId))

      const result = await updateDocumentAction(documentId, fd)

      if ('error' in result) {
        setError(result.error)
      } else {
        router.push('/gestionnaire/documents')
        router.refresh()
      }
    } catch {
      setError('Une erreur inattendue est survenue.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      {error && (
        <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3">
          <AlertCircle size={16} className="mt-0.5 shrink-0 text-red-600" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* Titre */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          Titre <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={titre}
          onChange={e => setTitre(e.target.value)}
          placeholder="Titre du document"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      {/* Catégorie */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          Catégorie <span className="text-red-500">*</span>
        </label>
        <select
          value={categorie}
          onChange={e => setCategorie(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        >
          {CATEGORIES.map(c => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      {/* Accès */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          Accès <span className="text-red-500">*</span>
        </label>
        <select
          value={acces}
          onChange={e => setAcces(e.target.value as 'public' | 'membres')}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        >
          <option value="public">Public</option>
          <option value="membres">Membres</option>
        </select>
        <p className="mt-1 text-xs text-gray-400">Les documents « Membres » ne sont visibles que par les utilisateurs connectés.</p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          Description
        </label>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={4}
          placeholder="Description du document (optionnel)"
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
      </div>

      {/* Fichier */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          Fichier
        </label>
        <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-600 hover:border-black hover:text-black transition-colors">
          <FileText size={13} />
          <span className="max-w-[220px] truncate">
            {file?.name ?? initialValues?.fichierName ?? 'Choisir un fichier'}
          </span>
          <input
            type="file"
            onChange={e => setFile(e.target.files?.[0] ?? null)}
            className="hidden"
          />
        </label>
        <p className="mt-1 text-xs text-gray-400">Laissez vide pour conserver le fichier actuel.</p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            : <Save size={15} />
          }
          Enregistrer
        </button>

        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="sm:ml-auto inline-flex items-center justify-center rounded-lg px-4 py-2.5 text-sm text-gray-500 hover:text-black transition-colors"
        >
          Annuler
        </button>
      </div>
    </div>
  )
}
