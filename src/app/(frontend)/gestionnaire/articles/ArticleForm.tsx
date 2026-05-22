'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Upload, X, Save, Globe, AlertCircle } from 'lucide-react'
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
}

interface Props {
  postId?:        number
  initialValues?: Partial<ArticleFormInitial>
}

export function ArticleForm({ postId, initialValues }: Props) {
  const router     = useRouter()
  const editorRef  = useRef<ArticleEditorRef>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [titre,     setTitre]     = useState(initialValues?.titre     ?? '')
  const [categorie, setCategorie] = useState<'actualites' | 'ateliers_seminaires'>(
    initialValues?.categorie ?? 'actualites',
  )
  const [imageFile,       setImageFile]       = useState<File | null>(null)
  const [imagePreview,    setImagePreview]    = useState<string | null>(initialValues?.imageUrl ?? null)
  const [existingImageId, setExistingImageId] = useState<number | undefined>(initialValues?.imageId)
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

  async function handleSubmit(targetStatut: 'brouillon' | 'publie') {
    if (!titre.trim()) { setError('Le titre est requis.'); return }
    if (editorRef.current?.isEmpty()) { setError('Le contenu est requis.'); return }

    setError(null)
    setLoading(true)

    try {
      let imageId = existingImageId

      if (imageFile) {
        const fd = new FormData()
        fd.append('file', imageFile)
        fd.append('alt', titre.trim())
        const uploadResult = await uploadMedia(fd)
        if ('error' in uploadResult) {
          setError(uploadResult.error)
          setLoading(false)
          return
        }
        imageId = uploadResult.id
      }

      const lexical = tiptapToLexical(editorRef.current!.getJSON())

      const fd = new FormData()
      fd.append('titre',       titre.trim())
      fd.append('contenuJson', JSON.stringify(lexical))
      fd.append('categorie',   categorie)
      fd.append('statut',      targetStatut)
      if (imageId) fd.append('imageId', String(imageId))

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

      {/* Image */}
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
