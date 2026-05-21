'use client'

import { useTransition, useState } from 'react'
import { Check, X } from 'lucide-react'
import { approveMembre, rejectMembre } from './actions'

interface Props {
  membreId: number
  nom:      string
}

export function MembreActionButtons({ membreId, nom }: Props) {
  const [pending, startTransition] = useTransition()
  const [done, setDone]            = useState<'approved' | 'rejected' | null>(null)
  const [error, setError]          = useState<string | null>(null)

  function handleApprove() {
    setError(null)
    startTransition(async () => {
      const result = await approveMembre(membreId)
      if ('error' in result) setError(result.error)
      else setDone('approved')
    })
  }

  function handleReject() {
    if (!confirm(`Rejeter la demande de ${nom} ?`)) return
    setError(null)
    startTransition(async () => {
      const result = await rejectMembre(membreId)
      if ('error' in result) setError(result.error)
      else setDone('rejected')
    })
  }

  if (done === 'approved') {
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700"><Check size={12} /> Approuvé</span>
  }
  if (done === 'rejected') {
    return <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400"><X size={12} /> Rejeté</span>
  }

  return (
    <div className="flex items-center gap-2">
      {error && <span className="text-xs text-red-600">{error}</span>}
      <button
        onClick={handleApprove}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-md bg-black px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        <Check size={12} />
        Approuver
      </button>
      <button
        onClick={handleReject}
        disabled={pending}
        className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2.5 py-1.5 text-xs font-medium text-gray-600 hover:border-black hover:text-black transition-colors disabled:opacity-50"
      >
        <X size={12} />
        Rejeter
      </button>
    </div>
  )
}
