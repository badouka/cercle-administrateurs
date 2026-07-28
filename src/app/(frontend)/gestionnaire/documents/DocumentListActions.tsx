'use client'

import { useTransition, useState } from 'react'
import Link from 'next/link'
import { Pencil, Trash2 } from 'lucide-react'
import { deleteDocument } from '../actions'

interface Props {
  documentId: number
  titre:      string
  canDelete:  boolean
}

export function DocumentListActions({ documentId, titre, canDelete }: Props) {
  const [pending, startTransition] = useTransition()
  const [deleted, setDeleted]      = useState(false)
  const [error, setError]          = useState<string | null>(null)

  function handleDelete() {
    if (!confirm(`Supprimer le document « ${titre} » ? Cette action est irréversible.`)) return
    setError(null)
    startTransition(async () => {
      const result = await deleteDocument(documentId)
      if ('error' in result) setError(result.error)
      else setDeleted(true)
    })
  }

  if (deleted) return <span className="text-xs text-gray-400 italic">Supprimé</span>

  return (
    <div className="flex items-center gap-1.5 flex-wrap justify-end">
      {error && <span className="text-xs text-red-600 w-full text-right">{error}</span>}

      <Link
        href={`/gestionnaire/documents/${documentId}/modifier`}
        className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2.5 py-1.5 text-xs font-medium text-gray-700 hover:border-black hover:text-black transition-colors"
      >
        <Pencil size={12} /> Modifier
      </Link>

      {canDelete && (
        <button
          onClick={handleDelete}
          disabled={pending}
          title="Supprimer"
          className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-600 hover:border-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <Trash2 size={12} /> Supprimer
        </button>
      )}
    </div>
  )
}
