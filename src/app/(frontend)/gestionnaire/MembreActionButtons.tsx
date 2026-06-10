'use client'

import { useTransition, useState } from 'react'
import Image from 'next/image'
import { Check, X, Info, ExternalLink, Pencil } from 'lucide-react'
import { approveMembre, rejectMembre, updatePosteMembre, suspendMembre, reactivateMembre } from './actions'

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

// ── Modification du poste CAP ──────────────────────────────────────────────────

export const SELECT_CLS = 'block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black bg-white focus:border-black focus:outline-none focus:ring-1 focus:ring-black'

export const POSTES_CAP = [
  "Président d'honneur",
  "Présidente d'honneur",
  'Président',
  'Présidente',
  'Vice-Président',
  'Vice-Présidente',
  'Secrétaire général',
  'Secrétaire générale',
  'Secrétaire général adjoint',
  'Secrétaire générale adjointe',
  'Trésorier',
  'Trésorière',
  'Trésorier Adjoint',
  'Trésorière Adjointe',
  'Présidente Commission Actions Sociales',
  'Présidente Commission Communication',
  'Président Commission Stratégie et Vulgarisation des Politiques Publiques',
  'Président Commission Renforcement de Capacités',
  'Membre',
]

export function PosteEditButton({ membreId, nom, currentPoste }: { membreId: number; nom: string; currentPoste?: string | null }) {
  const [open, setOpen]            = useState(false)
  const [poste, setPoste]          = useState(currentPoste ?? '')
  const [pending, startTransition] = useTransition()
  const [error, setError]          = useState<string | null>(null)

  function handleSave() {
    setError(null)
    startTransition(async () => {
      const result = await updatePosteMembre(membreId, poste)
      if ('error' in result) setError(result.error)
      else setOpen(false)
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => { setPoste(currentPoste ?? ''); setError(null); setOpen(true) }}
        className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:border-black hover:text-black transition-colors"
      >
        <Pencil size={11} />
        Modifier
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-black mb-4">Poste de {nom}</h3>

            <label className="block text-xs font-medium text-gray-500 mb-1.5">Poste au CAP</label>
            <select value={poste} onChange={(e) => setPoste(e.target.value)} className={SELECT_CLS}>
              <option value="">— Aucun —</option>
              {POSTES_CAP.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                disabled={pending}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-black hover:text-black transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={pending}
                className="rounded-md bg-black px-3 py-1.5 text-xs font-semibold text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ── Statut de l'adhésion ────────────────────────────────────────────────────────

export const STATUT_CONFIG = {
  actif:    { label: 'Actif',      cls: 'bg-green-100 text-green-800' },
  inactif:  { label: 'En attente', cls: 'bg-yellow-100 text-yellow-800' },
  suspendu: { label: 'Suspendu',   cls: 'bg-red-100 text-red-700' },
} as const

export function StatutActions({ membreId, statut }: { membreId: number; statut: 'actif' | 'inactif' | 'suspendu' }) {
  const [current, setCurrent]      = useState(statut)
  const [pending, startTransition] = useTransition()
  const [error, setError]          = useState<string | null>(null)

  function handleSuspend() {
    if (!confirm('Désactiver ce membre ?')) return
    setError(null)
    startTransition(async () => {
      const result = await suspendMembre(membreId)
      if ('error' in result) setError(result.error)
      else setCurrent('suspendu')
    })
  }

  function handleReactivate() {
    if (!confirm('Réactiver ce membre ?')) return
    setError(null)
    startTransition(async () => {
      const result = await reactivateMembre(membreId)
      if ('error' in result) setError(result.error)
      else setCurrent('actif')
    })
  }

  const config = STATUT_CONFIG[current]

  return (
    <div className="flex items-center gap-2">
      <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${config.cls}`}>
        {config.label}
      </span>
      {error && <span className="text-xs text-red-600">{error}</span>}
      {current === 'actif' && (
        <button
          type="button"
          onClick={handleSuspend}
          disabled={pending}
          className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:border-black hover:text-black transition-colors disabled:opacity-50"
        >
          Désactiver
        </button>
      )}
      {current === 'suspendu' && (
        <button
          type="button"
          onClick={handleReactivate}
          disabled={pending}
          className="inline-flex items-center gap-1 rounded-md border border-gray-300 px-2 py-1 text-xs font-medium text-gray-600 hover:border-black hover:text-black transition-colors disabled:opacity-50"
        >
          Réactiver
        </button>
      )}
    </div>
  )
}
