'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Save, AlertCircle, FileText, Upload, X } from 'lucide-react'
import { createDocumentAction, updateDocumentAction, uploadMedia } from '../actions'

export interface DocumentFormInitial {
  titre:          string
  categorie:      string
  acces:          'public' | 'membres'
  description?:   string
  fichierId?:     number
  fichierName?:   string
  couvertureId?:  number
  couvertureUrl?: string
}

interface Props {
  documentId?:    number
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
  const router            = useRouter()
  const couvertureInputRef = useRef<HTMLInputElement>(null)

  const [titre,       setTitre]       = useState(initialValues?.titre ?? '')
  const [categorie,   setCategorie]   = useState(initialValues?.categorie ?? 'ressources')
  const [acces,       setAcces]       = useState<'public' | 'membres'>(initialValues?.acces ?? 'public')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [file,        setFile]        = useState<File | null>(null)

  const [couvertureFile,       setCouvertureFile]       = useState<File | null>(null)
  const [couverturePreview,    setCouverturePreview]    = useState<string | null>(initialValues?.couvertureUrl ?? null)
  const [existingCouvertureId, setExistingCouvertureId] = useState<number | undefined>(initialValues?.couvertureId)

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function handleCouvertureChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null
    setCouvertureFile(f)
    if (f) {
      setCouverturePreview(URL.createObjectURL(f))
      setExistingCouvertureId(undefined)
    }
  }

  function removeCouverture() {
    setCouvertureFile(null)
    setCouverturePreview(null)
    setExistingCouvertureId(undefined)
    if (couvertureInputRef.current) couvertureInputRef.current.value = ''
  }

  async function handleSubmit() {
    if (!titre.trim()) { setError('Le titre est requis.'); return }
    if (!documentId && !file) { setError('Le fichier est requis.'); return }

    setError(null)
    setLoading(true)

    try {
      // ── Fichier principal ──
      let fichierId = initialValues?.fichierId
      if (file) {
        const fd = new FormData()
        fd.append('file', file)
        fd.append('alt', titre.trim())
        const uploadResult = await uploadMedia(fd)
        if ('error' in uploadResult) { setError(uploadResult.error); setLoading(false); return }
        fichierId = uploadResult.id
      }

      // ── Image de couverture ──
      let couvertureId = existingCouvertureId
      if (couvertureFile) {
        const fd = new FormData()
        fd.append('file', couvertureFile)
        fd.append('alt', titre.trim())
        const uploadResult = await uploadMedia(fd)
        if ('error' in uploadResult) { setError(uploadResult.error); setLoading(false); return }
        couvertureId = uploadResult.id
      }

      const fd = new FormData()
      fd.append('titre',       titre.trim())
      fd.append('categorie',   categorie)
      fd.append('acces',       acces)
      fd.append('description', description)
      if (fichierId)    fd.append('fichierId',    String(fichierId))
      if (couvertureId) fd.append('couvertureId', String(couvertureId))
      // Couverture retirée par l'utilisateur : on la vide côté serveur
      if (!couvertureId && initialValues?.couvertureId) fd.append('removeCouverture', '1')

      const result = documentId
        ? await updateDocumentAction(documentId, fd)
        : await createDocumentAction(fd)

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

      {/* Image de couverture */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          Image de couverture
        </label>
        {couverturePreview ? (
          <div className="relative w-full max-w-[220px]">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={couverturePreview} alt="Aperçu de la couverture" className="h-full w-full object-cover" />
            </div>
            <button
              type="button"
              onClick={removeCouverture}
              className="absolute -top-2 -right-2 rounded-full bg-black p-1 text-white hover:bg-gray-700 transition-colors"
              title="Supprimer la couverture"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => couvertureInputRef.current?.click()}
            className="flex w-full max-w-[220px] items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 text-sm text-gray-500 hover:border-black hover:text-black transition-colors"
          >
            <Upload size={18} />
            Uploader une image
          </button>
        )}
        <input
          ref={couvertureInputRef}
          type="file"
          accept="image/*"
          onChange={handleCouvertureChange}
          className="hidden"
        />
        <p className="mt-1 text-xs text-gray-400">Couverture affichée sur la page Magazines et l&apos;accueil.</p>
      </div>

      {/* Fichier */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          Fichier {!documentId && <span className="text-red-500">*</span>}
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
        <p className="mt-1 text-xs text-gray-400">
          {documentId ? 'Laissez vide pour conserver le fichier actuel.' : 'PDF ou tout autre document téléchargeable.'}
        </p>
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
          {documentId ? 'Enregistrer' : 'Créer le document'}
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
