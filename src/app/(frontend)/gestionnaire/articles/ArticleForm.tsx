'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Upload, X, Save, Globe, AlertCircle, Plus, Trash2, FileText } from 'lucide-react'
import { createPostAction, updatePostAction, uploadMedia } from '../actions'
import { ArticleEditor, type ArticleEditorRef } from '@/components/editor/ArticleEditor'
import { tiptapToLexical } from '@/lib/tiptap-to-lexical'

export interface ArticleFormInitial {
  titre:      string
  contenu:    string   // HTML (from lexicalToHtml on the edit page)
  categorie:  'actualites' | 'ateliers_seminaires'
  statut:     'brouillon' | 'publie'
  imageId?:   number
  imageUrl?:  string
  imageAlt?:  string
  publie_le?: string   // 'YYYY-MM-DD'
  galerie?:   { id: number; url: string }[]
  documents?: { titre: string; fichierId: number; fichierName?: string }[]
}

interface Props {
  postId?:        number
  initialValues?: Partial<ArticleFormInitial>
}

interface GalerieItem { key: string; existingId?: number; file?: File; preview: string }
interface DocItem     { key: string; titre: string; existingId?: number; existingName?: string; file?: File }

export function ArticleForm({ postId, initialValues }: Props) {
  const router     = useRouter()
  const editorRef  = useRef<ArticleEditorRef>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const galerieInputRef = useRef<HTMLInputElement>(null)
  const keyCounter = useRef(0)
  const newKey = () => `item-${keyCounter.current++}`

  const [titre,     setTitre]     = useState(initialValues?.titre     ?? '')
  const [categorie, setCategorie] = useState<'actualites' | 'ateliers_seminaires'>(
    initialValues?.categorie ?? 'actualites',
  )
  const [publieLe, setPublieLe] = useState(initialValues?.publie_le ?? '')
  const [imageFile,       setImageFile]       = useState<File | null>(null)
  const [imagePreview,    setImagePreview]    = useState<string | null>(initialValues?.imageUrl ?? null)
  const [existingImageId, setExistingImageId] = useState<number | undefined>(initialValues?.imageId)
  const [galerie, setGalerie] = useState<GalerieItem[]>(() =>
    (initialValues?.galerie ?? []).map((g, i) => ({ key: `g-init-${i}`, existingId: g.id, preview: g.url })),
  )
  const [documents, setDocuments] = useState<DocItem[]>(() =>
    (initialValues?.documents ?? []).map((d, i) => ({
      key: `d-init-${i}`, titre: d.titre, existingId: d.fichierId, existingName: d.fichierName,
    })),
  )
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState<string | null>(null)

  function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null
    setImageFile(file)
    if (file) {
      setImagePreview(URL.createObjectURL(file))
      setExistingImageId(undefined)
    }
  }

  function removeImage() {
    setImageFile(null)
    setImagePreview(null)
    setExistingImageId(undefined)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleGalerieChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (files.length) {
      setGalerie(prev => [
        ...prev,
        ...files.map(f => ({ key: newKey(), file: f, preview: URL.createObjectURL(f) })),
      ])
    }
    if (galerieInputRef.current) galerieInputRef.current.value = ''
  }

  function removeGalerie(key: string) {
    setGalerie(prev => prev.filter(g => g.key !== key))
  }

  function addDocument() {
    setDocuments(prev => [...prev, { key: newKey(), titre: '' }])
  }

  function removeDocument(key: string) {
    setDocuments(prev => prev.filter(d => d.key !== key))
  }

  function setDocumentTitre(key: string, titre: string) {
    setDocuments(prev => prev.map(d => (d.key === key ? { ...d, titre } : d)))
  }

  function setDocumentFile(key: string, file: File | null) {
    setDocuments(prev => prev.map(d => (d.key === key ? { ...d, file: file ?? undefined } : d)))
  }

  async function handleSubmit(targetStatut: 'brouillon' | 'publie') {
    if (!titre.trim()) { setError('Le titre est requis.'); return }
    if (editorRef.current?.isEmpty()) { setError('Le contenu est requis.'); return }

    setError(null)
    setLoading(true)

    try {
      // ── Image de couverture ──
      let imageId = existingImageId
      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        fd.append('alt', titre.trim())
        const uploadResult = await uploadMedia(fd)
        if ('error' in uploadResult) { setError(uploadResult.error); setLoading(false); return }
        imageId = uploadResult.id
      }

      // ── Galerie d'images ──
      const imageIds: number[] = []
      for (const g of galerie) {
        if (g.file) {
          const fd = new FormData()
          fd.append('file', g.file)
          fd.append('alt', titre.trim())
          const r = await uploadMedia(fd)
          if ('error' in r) { setError(r.error); setLoading(false); return }
          imageIds.push(r.id)
        } else if (g.existingId) {
          imageIds.push(g.existingId)
        }
      }

      // ── Documents associés ──
      const docs: { titre: string; fichierId: number }[] = []
      for (const d of documents) {
        const t = d.titre.trim()
        if (!t) { setError('Chaque document associé doit avoir un titre.'); setLoading(false); return }
        let fichierId = d.existingId
        if (d.file) {
          const fd = new FormData()
          fd.append('file', d.file)
          fd.append('alt', t)
          const r = await uploadMedia(fd)
          if ('error' in r) { setError(r.error); setLoading(false); return }
          fichierId = r.id
        }
        if (!fichierId) { setError(`Le document « ${t} » doit avoir un fichier.`); setLoading(false); return }
        docs.push({ titre: t, fichierId })
      }

      const lexical = tiptapToLexical(editorRef.current!.getJSON())

      const fd = new FormData()
      fd.append('titre',         titre.trim())
      fd.append('contenuJson',   JSON.stringify(lexical))
      fd.append('categorie',     categorie)
      fd.append('statut',        targetStatut)
      fd.append('imagesJson',    JSON.stringify(imageIds))
      fd.append('documentsJson', JSON.stringify(docs))
      if (imageId)  fd.append('imageId',   String(imageId))
      if (publieLe) fd.append('publie_le', publieLe)

      const result = postId
        ? await updatePostAction(postId, fd)
        : await createPostAction(fd)

      if ('error' in result) {
        setError(result.error)
      } else {
        router.push('/gestionnaire/articles')
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
          placeholder="Titre de l'article"
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
          onChange={e => setCategorie(e.target.value as typeof categorie)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        >
          <option value="actualites">Actualités</option>
          <option value="ateliers_seminaires">Ateliers &amp; Séminaires</option>
        </select>
      </div>

      {/* Date de publication */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          Date de publication
        </label>
        <input
          type="date"
          value={publieLe}
          onChange={e => setPublieLe(e.target.value)}
          className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
        />
        <p className="mt-1 text-xs text-gray-400">Laissez vide pour utiliser la date de première publication automatique.</p>
      </div>

      {/* Image de couverture */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          Image de couverture
        </label>
        {imagePreview ? (
          <div className="relative w-full max-w-md">
            <div className="relative aspect-video rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
              <Image src={imagePreview} alt="Aperçu" fill className="object-cover" />
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="absolute -top-2 -right-2 rounded-full bg-black p-1 text-white hover:bg-gray-700 transition-colors"
              title="Supprimer l'image"
            >
              <X size={14} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full max-w-md items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-6 py-8 text-sm text-gray-500 hover:border-black hover:text-black transition-colors"
          >
            <Upload size={18} />
            Cliquer pour uploader une image
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
        <p className="mt-1 text-xs text-gray-400">JPG, PNG, WebP — recommandé 1200×630 px</p>
      </div>

      {/* Galerie d'images */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          Galerie d&apos;images
        </label>
        {galerie.length > 0 && (
          <div className="mb-3 grid grid-cols-3 sm:grid-cols-4 gap-3">
            {galerie.map(g => (
              <div key={g.key} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.preview} alt="" className="h-full w-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeGalerie(g.key)}
                  className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white hover:bg-black transition-colors"
                  title="Retirer"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={() => galerieInputRef.current?.click()}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-black hover:text-black transition-colors"
        >
          <Plus size={15} />
          Ajouter des images
        </button>
        <input
          ref={galerieInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalerieChange}
          className="hidden"
        />
        <p className="mt-1 text-xs text-gray-400">Images supplémentaires qui défilent dans l&apos;article.</p>
      </div>

      {/* Documents associés */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          Documents associés
        </label>
        {documents.length > 0 && (
          <div className="mb-3 space-y-3">
            {documents.map(d => (
              <div key={d.key} className="flex flex-col sm:flex-row sm:items-center gap-2 rounded-lg border border-gray-200 p-3">
                <input
                  type="text"
                  value={d.titre}
                  onChange={e => setDocumentTitre(d.key, e.target.value)}
                  placeholder="Titre du document"
                  className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
                />
                <label className="inline-flex items-center gap-1.5 cursor-pointer rounded-lg border border-gray-300 px-3 py-2 text-xs text-gray-600 hover:border-black hover:text-black transition-colors">
                  <FileText size={13} />
                  <span className="max-w-[140px] truncate">
                    {d.file?.name ?? d.existingName ?? 'Choisir un PDF'}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,application/pdf"
                    onChange={e => setDocumentFile(d.key, e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeDocument(d.key)}
                  className="inline-flex items-center justify-center rounded-lg p-2 text-gray-400 hover:text-red-600 transition-colors"
                  title="Retirer ce document"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
        <button
          type="button"
          onClick={addDocument}
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-600 hover:border-black hover:text-black transition-colors"
        >
          <Plus size={15} />
          Ajouter un document
        </button>
        <p className="mt-1 text-xs text-gray-400">Fichiers PDF téléchargeables depuis l&apos;article.</p>
      </div>

      {/* Contenu */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-1.5">
          Contenu <span className="text-red-500">*</span>
        </label>
        <ArticleEditor
          ref={editorRef}
          initialContent={initialValues?.contenu}
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-gray-100">
        <button
          type="button"
          onClick={() => handleSubmit('brouillon')}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-semibold text-gray-700 hover:border-black hover:text-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-t-transparent" />
            : <Save size={15} />
          }
          Enregistrer comme brouillon
        </button>

        <button
          type="button"
          onClick={() => handleSubmit('publie')}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading
            ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
            : <Globe size={15} />
          }
          Publier
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
