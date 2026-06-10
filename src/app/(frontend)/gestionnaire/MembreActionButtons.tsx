'use client'

import { useTransition, useState } from 'react'
import Image from 'next/image'
import { Check, X, Info, ExternalLink } from 'lucide-react'
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
    if (!confirm(`Approuver ${nom} comme Membre ?`)) return
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

// ── Détails d'un membre (modal "Voir les informations") ───────────────────────

export interface MembreInfo {
  prenom:                   string
  nom:                      string
  genre?:                   string | null
  email?:                   string | null
  fonctionProfessionnelle?: string | null
  organisme?:               string | null
  siteOrganisme?:           string | null
  telephone?:               string | null
  telephoneSecondaire?:     string | null
  photoUrl?:                string | null
}

const GENRE_LABELS: Record<string, string> = { homme: 'Homme', femme: 'Femme' }

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-black">{value}</dd>
    </div>
  )
}

export function MembreInfoLink({ nom, info }: { nom: string; info: MembreInfo }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 text-xs font-medium text-black underline underline-offset-2 hover:text-gray-600 transition-colors"
      >
        <Info size={11} />
        Voir les informations
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md max-h-[85vh] overflow-y-auto rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-black">{nom}</h3>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-gray-400 hover:text-black transition-colors"
                aria-label="Fermer"
              >
                <X size={16} />
              </button>
            </div>

            {info.photoUrl && (
              <Image
                src={info.photoUrl}
                alt={nom}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover border border-gray-100 mb-4"
              />
            )}

            <dl className="space-y-3">
              <InfoRow label="Prénom" value={info.prenom} />
              <InfoRow label="Nom"    value={info.nom} />
              <InfoRow label="Genre"  value={info.genre ? (GENRE_LABELS[info.genre] ?? info.genre) : null} />
              <InfoRow label="Email"  value={info.email} />
              <InfoRow label="Fonction"     value={info.fonctionProfessionnelle} />
              <InfoRow label="Organisation" value={info.organisme} />
              {info.siteOrganisme && (
                <div>
                  <dt className="text-xs text-gray-400">Site web</dt>
                  <dd className="mt-0.5">
                    <a
                      href={info.siteOrganisme}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-sm text-black underline underline-offset-2 hover:text-gray-600"
                    >
                      {info.siteOrganisme}
                      <ExternalLink size={11} />
                    </a>
                  </dd>
                </div>
              )}
              <InfoRow label="Téléphone principal"  value={info.telephone} />
              <InfoRow label="Téléphone secondaire" value={info.telephoneSecondaire} />
            </dl>
          </div>
        </div>
      )}
    </>
  )
}
