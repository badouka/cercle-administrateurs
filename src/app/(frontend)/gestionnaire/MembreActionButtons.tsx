'use client'

import { useTransition, useState } from 'react'
import { Check, X } from 'lucide-react'
import { approveMembre, rejectMembre } from './actions'

interface Props {
  membreId: number
  nom:      string
}

const SELECT_CLS =
  'block w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm text-black bg-white focus:border-black focus:outline-none focus:ring-1 focus:ring-black'

const POSTES_HOMME = [
  'Président',
  'Secrétaire général',
  'Trésorier',
  'Président Commission Actions Sociales',
  'Président Commission Communication',
  'Président Commission Stratégie et Politiques Publiques',
  'Président Commission Renforcement de Capacités',
  'Membre',
]

const POSTES_FEMME = [
  'Présidente',
  'Secrétaire générale',
  'Trésorière',
  'Présidente Commission Actions Sociales',
  'Présidente Commission Communication',
  'Présidente Commission Stratégie et Politiques Publiques',
  'Présidente Commission Renforcement de Capacités',
  'Membre',
]

export function MembreActionButtons({ membreId, nom }: Props) {
  const [pending, startTransition] = useTransition()
  const [done, setDone]            = useState<'approved' | 'rejected' | null>(null)
  const [error, setError]          = useState<string | null>(null)

  const [showModal, setShowModal] = useState(false)
  const [genre,     setGenre]     = useState<'homme' | 'femme' | null>(null)
  const [posteCap,  setPosteCap]  = useState('')

  const postes = genre === 'femme' ? POSTES_FEMME : POSTES_HOMME

  function openModal() {
    setError(null)
    setGenre(null)
    setPosteCap('')
    setShowModal(true)
  }

  function closeModal() {
    if (pending) return
    setShowModal(false)
  }

  function handleGenreChange(g: 'homme' | 'femme') {
    setGenre(g)
    setPosteCap('')
  }

  function handleConfirmApprove() {
    setError(null)
    startTransition(async () => {
      const result = await approveMembre(membreId, posteCap || undefined)
      if ('error' in result) setError(result.error)
      else {
        setDone('approved')
        setShowModal(false)
      }
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
    <>
      <div className="flex items-center gap-2">
        {error && !showModal && <span className="text-xs text-red-600">{error}</span>}
        <button
          onClick={openModal}
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

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-base font-bold text-black mb-1">Approuver {nom}</h3>
            <p className="text-xs text-gray-500 mb-4">
              Renseignez le genre et le poste au CAP attribués à ce membre.
            </p>

            <div className="space-y-4">
              <div>
                <span className="block text-sm font-medium text-gray-700 mb-1.5">Genre</span>
                <div className="flex items-center gap-5">
                  <label className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="genre"
                      value="homme"
                      checked={genre === 'homme'}
                      onChange={() => handleGenreChange('homme')}
                      className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                    />
                    Homme
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-sm text-gray-700">
                    <input
                      type="radio"
                      name="genre"
                      value="femme"
                      checked={genre === 'femme'}
                      onChange={() => handleGenreChange('femme')}
                      className="h-4 w-4 border-gray-300 text-black focus:ring-black"
                    />
                    Femme
                  </label>
                </div>
              </div>

              <div>
                <label htmlFor="posteCap" className="block text-sm font-medium text-gray-700 mb-1.5">
                  Poste au CAP
                </label>
                <select
                  id="posteCap"
                  value={posteCap}
                  onChange={(e) => setPosteCap(e.target.value)}
                  disabled={!genre}
                  className={SELECT_CLS + (!genre ? ' opacity-50 cursor-not-allowed' : '')}
                >
                  <option value="">— Sélectionnez un poste —</option>
                  {postes.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                {!genre && (
                  <p className="mt-1 text-xs text-gray-400">Sélectionnez d&apos;abord un genre.</p>
                )}
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={closeModal}
                disabled={pending}
                className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-600 hover:border-black hover:text-black transition-colors disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmApprove}
                disabled={pending || !genre || !posteCap}
                className="inline-flex items-center gap-1.5 rounded-md bg-black px-3 py-2 text-xs font-semibold text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {pending && (
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
                )}
                Confirmer l&apos;approbation
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
