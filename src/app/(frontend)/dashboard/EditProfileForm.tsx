'use client'

import { useState, useRef, type FormEvent } from 'react'
import { Pencil, X, Check } from 'lucide-react'
import type { Membre } from '@/payload-types'
import { updateProfile, type ProfileData } from './actions'
import { BiographyEditor, type BiographyEditorRef } from '@/components/editor/BiographyEditor'

interface Props {
  membre: Membre
}

const INPUT_CLS =
  'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:border-black focus:outline-none focus:ring-1 focus:ring-black'

const SELECT_CLS =
  'block w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-black bg-white focus:border-black focus:outline-none focus:ring-1 focus:ring-black'

const FONCTIONS = [
  'Président',
  'Secrétaire général',
  'Trésorier(e)',
  'Présidente Commission Actions Sociales',
  'Présidente Commission Communication',
  'Prés. Commission Stratégie et Politiques Publiques',
  'Président Commission Renforcement de Capacités',
  'Membre',
]

function InfoRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <dt className="text-xs text-gray-400">{label}</dt>
      <dd className="mt-0.5 text-sm text-gray-900">{value}</dd>
    </div>
  )
}

export function EditProfileForm({ membre }: Props) {
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [saved, setSaved]     = useState(false)
  const [fonction, setFonction] = useState(membre.poste?.titre ?? '')
  const bioEditorRef = useRef<BiographyEditorRef>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    setSaved(false)

    const fd = new FormData(e.currentTarget)
    const data: ProfileData = {
      prenom:                  fd.get('prenom')                 as string,
      nom:                     fd.get('nom')                    as string,
      biographie:              bioEditorRef.current?.getHTML()  ?? '',
      posteTitre:              fd.get('fonctionSelect')         as string,
      posteTitrePersonnalise:  fd.get('fonctionAutre')          as string,
      organisme:               fd.get('organisme')              as string,
      direction:               fd.get('direction')              as string,
      telephone:               fd.get('telephone')              as string,
      telephoneSecondaire:     fd.get('telephoneSecondaire')    as string,
      emailProfessionnel:      fd.get('emailProfessionnel')     as string,
      linkedin:                fd.get('linkedin')               as string,
    }

    const result = await updateProfile(membre.id, data)
    setLoading(false)

    if ('error' in result) {
      setError(result.error)
    } else {
      setSaved(true)
      setEditing(false)
    }
  }

  const p = membre.poste ?? {}
  const c = membre.coordonnees ?? {}

  // Show custom text when titre = 'autre', otherwise the predefined label
  const fonctionDisplay = p.titre === 'autre'
    ? (p.titrePersonnalise ?? '')
    : (p.titre ?? '')

  if (!editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            Profil
          </h2>
          <button
            onClick={() => { setEditing(true); setSaved(false) }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:border-black hover:text-black transition-colors"
          >
            <Pencil size={12} />
            Modifier
          </button>
        </div>

        {saved && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
            <Check size={14} />
            Profil mis à jour avec succès.
          </div>
        )}

        <dl className="space-y-3">
          {membre.biographie && (
            <div>
              <dt className="text-xs text-gray-400">Biographie</dt>
              <dd
                className="mt-0.5 text-sm text-gray-900 bio-prose"
                dangerouslySetInnerHTML={{ __html: membre.biographie }}
              />
            </div>
          )}
          <InfoRow label="Fonction"             value={fonctionDisplay} />
          <InfoRow label="Organisme"            value={p.organisme} />
          <InfoRow label="Direction"            value={p.direction} />
          <InfoRow label="Téléphone"            value={c.telephone} />
          <InfoRow label="Téléphone secondaire" value={c.telephoneSecondaire} />
          <InfoRow label="Email pro"            value={c.emailProfessionnel} />
          <InfoRow label="LinkedIn"             value={c.linkedin} />
        </dl>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
          Modifier le profil
        </h2>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 hover:border-gray-400 transition-colors"
        >
          <X size={12} />
          Annuler
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="prenom" className="block text-xs font-medium text-gray-600 mb-1">Prénom *</label>
          <input id="prenom" name="prenom" type="text" required
            defaultValue={membre.prenom} className={INPUT_CLS} />
        </div>
        <div>
          <label htmlFor="nom" className="block text-xs font-medium text-gray-600 mb-1">Nom *</label>
          <input id="nom" name="nom" type="text" required
            defaultValue={membre.nom} className={INPUT_CLS} />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-gray-600 mb-1">Biographie</label>
        <BiographyEditor
          ref={bioEditorRef}
          initialContent={membre.biographie ?? ''}
          placeholder="Parlez de vous…"
        />
      </div>

      <div className="pt-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Poste</p>
        <div className="space-y-3">
          <div>
            <label htmlFor="fonctionSelect" className="block text-xs font-medium text-gray-600 mb-1">
              Fonction / Titre
            </label>
            <select
              id="fonctionSelect"
              name="fonctionSelect"
              value={fonction}
              onChange={e => setFonction(e.target.value)}
              className={SELECT_CLS}
            >
              <option value="">— Sélectionnez une fonction —</option>
              {FONCTIONS.map(f => (
                <option key={f} value={f}>{f}</option>
              ))}
              <option value="autre">Autre…</option>
            </select>
          </div>

          {fonction === 'autre' && (
            <div>
              <label htmlFor="fonctionAutre" className="block text-xs font-medium text-gray-600 mb-1">
                Précisez votre fonction
              </label>
              <input
                id="fonctionAutre"
                name="fonctionAutre"
                type="text"
                defaultValue={p.titrePersonnalise ?? ''}
                placeholder="Votre titre ou fonction"
                className={INPUT_CLS}
              />
            </div>
          )}

          <div>
            <label htmlFor="organisme" className="block text-xs font-medium text-gray-600 mb-1">Organisme</label>
            <input id="organisme" name="organisme" type="text"
              defaultValue={p.organisme ?? ''} className={INPUT_CLS} />
          </div>
          <div>
            <label htmlFor="direction" className="block text-xs font-medium text-gray-600 mb-1">Direction / Département</label>
            <input id="direction" name="direction" type="text"
              defaultValue={p.direction ?? ''} className={INPUT_CLS} />
          </div>
        </div>
      </div>

      <div className="pt-1">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">Coordonnées</p>
        <div className="space-y-3">
          <div>
            <label htmlFor="telephone" className="block text-xs font-medium text-gray-600 mb-1">Téléphone principal</label>
            <input id="telephone" name="telephone" type="tel"
              placeholder="+221 77 000 00 00"
              defaultValue={c.telephone ?? ''} className={INPUT_CLS} />
          </div>
          <div>
            <label htmlFor="telephoneSecondaire" className="block text-xs font-medium text-gray-600 mb-1">Téléphone secondaire (optionnel)</label>
            <input id="telephoneSecondaire" name="telephoneSecondaire" type="tel"
              placeholder="+221 78 000 00 00"
              defaultValue={c.telephoneSecondaire ?? ''} className={INPUT_CLS} />
          </div>
          <div>
            <label htmlFor="emailProfessionnel" className="block text-xs font-medium text-gray-600 mb-1">Email professionnel</label>
            <input id="emailProfessionnel" name="emailProfessionnel" type="email"
              defaultValue={c.emailProfessionnel ?? ''} className={INPUT_CLS} />
          </div>
          <div>
            <label htmlFor="linkedin" className="block text-xs font-medium text-gray-600 mb-1">Profil LinkedIn</label>
            <input id="linkedin" name="linkedin" type="url"
              placeholder="https://linkedin.com/in/..."
              defaultValue={c.linkedin ?? ''} className={INPUT_CLS} />
          </div>
        </div>
      </div>

      <button
        type="submit" disabled={loading}
        className="flex items-center gap-2 rounded-lg bg-black px-4 py-2.5 text-sm font-semibold text-white hover:bg-gray-800 transition-colors disabled:opacity-50"
      >
        {loading
          ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          : <Check size={14} />
        }
        {loading ? 'Enregistrement…' : 'Enregistrer'}
      </button>
    </form>
  )
}
