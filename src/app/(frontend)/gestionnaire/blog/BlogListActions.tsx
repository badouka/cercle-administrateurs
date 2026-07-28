'use client'

import { useTransition, useState } from 'react'
import Link from 'next/link'
import { Globe, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { toggleBlogStatut, deleteBlogPost } from '../actions'

interface Props {
  postId:  number
  titre:   string
  statut:  string
  canDelete: boolean
}

export function BlogListActions({ postId, titre, statut, canDelete }: Props) {
  const [pending, startTransition] = useTransition()
  const [deleted, setDeleted]      = useState(false)
  const [error, setError]          = useState<string | null>(null)

  function handleToggle() {
    setError(null)
    const next = statut === 'published' ? 'draft' : 'published'
    startTransition(async () => {
      const result = await toggleBlogStatut(postId, next)
      if (result && 'error' in result) setError(result.error)
    })
  }

  function handleDelete() {
    if (!confirm(`Supprimer « ${titre} » ?`)) return
    setError(null)
    startTransition(async () => {
      const result = await deleteBlogPost(postId)
      if (result && 'error' in result) setError(result.error)
      else setDeleted(true)
    })
  }

  if (deleted) return <span className="text-xs text-gray-400 italic">Supprimé</span>

  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-end">
      {error && <span className="text-xs text-red-600 w-full text-right">{error}</span>}
      <button onClick={handleToggle} disabled={pending}
        className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:border-black hover:text-black transition-colors disabled:opacity-50">
        {statut === 'published' ? <><EyeOff size={12}/> Dépublier</> : <><Globe size={12}/> Publier</>}
      </button>
      <Link href={`/gestionnaire/blog/${postId}/modifier`}
        className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:border-black hover:text-black transition-colors">
        <Pencil size={12}/> Modifier
      </Link>
      {canDelete && (
        <button onClick={handleDelete} disabled={pending}
          className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:border-red-500 hover:bg-red-50 transition-colors disabled:opacity-50">
          <Trash2 size={12}/> Supprimer
        </button>
      )}
    </div>
  )
}